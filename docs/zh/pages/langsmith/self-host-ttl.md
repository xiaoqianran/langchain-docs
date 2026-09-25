<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Enable TTL and data retention | https://docs.langchain.com/langsmith/self-host-ttl -->

# 启用 TTL 和数据保留

LangSmith 自托管支持自动 TTL 和跟踪数据保留。使用它来遵守数据隐私法规或通过自动清理旧痕迹来减少存储。运行规则和其他限定操作也可以自动延长跟踪的保留期。

<Note>
**自托管 [Enterprise](/langsmith/pricing-plans) 客户：** 您可以通过 UI 在工作区级别配置扩展数据保留。不需要更改环境变量。参见[Customize extended retention policy](/langsmith/data-purging-compliance#customize-extended-retention-policy)。仍然支持此页面上的系统范围 TTL 配置。
</Note>

## TTL配置优先级

LangSmith 通过两个步骤确定保留跟踪的时间：跟踪属于哪个保留层，以及该层适用的时间段。

LangSmith 按以下顺序分配层，优先级最高的优先：1. **跟踪升级**：运行规则或其他限定操作将单个跟踪提升到`longlived`，覆盖否则适用的任何层。
2. **项目层**：为跟踪项目配置的层。
3. **工作区默认**：新项目继承此层。更改它只会影响新项目，除非将其应用到所有现有项目。
4. **组织默认值**：适用于没有自己默认值的工作区。
5. **`shortlived`**：未设置默认值时的回退。

LangSmith 然后解析指定层的保留期：

- **`longlived`**：工作区延长保留期限（如果通过UI设置），否则`longlived`值来自[Helm configuration](#requirements)。
- **`shortlived`**：来自 [Helm configuration](#requirements) 的 `shortlived` 值。

Helm 图表默认 `shortlived` 为 14 天，`longlived` 为 400 天。

## 要求

通过 Helm 或环境变量设置配置保留：- **启用**：启用或禁用自动数据保留。启用后，通过 UI 设置默认组织和项目 TTL 层（请参阅[data retention guide](/langsmith/usage-and-billing#data-retention)）。
- **保留期限**：为 `shortlived` 和 `longlived` 跟踪设置系统范围的保留期限。设置后，在项目级别管理保留或为新项目设置组织范围内的默认值。

```yaml Helm
config:
  ttl:
    enabled: true
    ttl_period_seconds:
      # -- 400 day longlived and 14 day shortlived
      longlived: "34560000"
      shortlived: "1209600"
```

## ClickHouse TTL 清理作业

从版本 0.11 开始，cron 作业在周末运行，以删除 ClickHouse 内置 TTL 机制可能尚未清理的过期数据。

<Warning>
此作业使用**突变** (`ALTER TABLE DELETE`)，这是昂贵的操作，可能会影响 ClickHouse 性能。仅在非高峰时段（夜间和周末）运行它们。使用 **1 个并发活动** 突变（默认）进行测试不会导致 CPU、内存或延迟显着增加。
</Warning>

### 默认时间表

默认情况下，清理作业运行：

- **周六**：晚上 8 点和晚上 10 点（世界标准时间）。
- **周日**：凌晨 12 点、凌晨 2 点和凌晨 4 点（世界标准时间）。

### 禁用作业

要完全禁用清理作业：

```yaml
queue:
  deployment:
    extraEnv:
      - name: "ENABLE_CLICKHOUSE_TTL_CLEANUP_CRON"
        value: "false"
```

### 配置时间表

通过修改 cron 表达式来自定义清理作业运行的时间：

```yaml
queue:
  deployment:
    extraEnv:
      # UTC: Sunday 12am/2am/4am
      - name: "CLICKHOUSE_TTL_CLEANUP_CRON_WEEKEND_MORNING"
        value: "0 0,2,4 * * 0"
      # UTC: Saturday 8pm/10pm
      - name: "CLICKHOUSE_TTL_CLEANUP_CRON_WEEKEND_EVENING"
        value: "0 20,22 * * 6"
```<Tip>
要使用单个 cron 计划，请将 `CLICKHOUSE_TTL_CLEANUP_CRON_WEEKEND_EVENING` 和 `CLICKHOUSE_TTL_CLEANUP_CRON_WEEKEND_MORNING` 设置为相同的值。作业锁定可防止重叠执行。
</Tip>

### 配置每个部分的最小过期行数

这项工作一次只处理一张桌子。在每个表中，它扫描各个部分，并从至少包含最小数量的过期行的任何部分中删除数据。该阈值平衡了效率和彻底性：

- **太低**：作业扫描整个零件以清除最少的数据（效率低下）。
- **太高**：作业会跳过具有重要过期数据的部分。

```yaml
queue:
  deployment:
    extraEnv:
      - name: "CLICKHOUSE_TTL_CRON_MIN_EXPIRED_ROWS_PER_PART"
        value: "100000" # 100k expired rows
```

#### 检查过期行

运行此查询以查看每个表部分的过期行，然后调整最小值：

```sql
-- Query for Runs table. For other tables, replace 'ttl_seconds' with 'trace_ttl_seconds'
SELECT
    _part,
    count() AS expired_rows
FROM runs
WHERE trace_first_received_at IS NOT NULL
AND ttl_seconds IS NOT NULL
AND toDateTime(assumeNotNull(trace_first_received_at) + toIntervalSecond(assumeNotNull(ttl_seconds))) < now()
GROUP BY _part
ORDER BY expired_rows DESC
```

### 配置最大活跃突变

对于 100 GB 的部分，删除操作可能需要大约 50 分钟。增加并发突变以加快清理速度：

```yaml
queue:
  deployment:
    extraEnv:
      - name: "CLICKHOUSE_TTL_CRON_MAX_ACTIVE_MUTATIONS"
        value: "1"
```

<Warning>
更多并发 `DELETE` 操作会显着减慢插入和读取速度。仅当您可以容忍较慢的插入和读取延迟时才增加此值，并在执行后监视系统。
</Warning>

### 紧急情况：停止运行突变

如果您看到延迟峰值并需要停止正在运行的突变：

1. **查找活跃突变**：

   ```sql
   SELECT * FROM system.mutations WHERE is_done = 0;
   ```查找 `mutation_id`，其中 `command` 列包含 `DELETE` 语句。

2. **杀死突变**：

   ```sql
   KILL MUTATION WHERE mutation_id = '<mutation_id>';
   ```

### 备份和数据保留

如果作业运行后磁盘空间没有减少或持续增长，则原因可能是备份。备份过程会创建文件系统硬链接，阻止 ClickHouse 释放数据。

检查 ClickHouse pod 中的这些目录：

- `/var/lib/clickhouse/backup`
- `/var/lib/clickhouse/shadow`

如果存在备份，请将其复制到外部存储（例如 S3），然后清除目录。磁盘空间应在几分钟内开始释放。

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-ttl.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>