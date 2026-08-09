<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Enable TTL and data retention | https://docs.langchain.com/langsmith/self-host-ttl -->

# 启用 TTL 和数据保留

LangSmith 自托管允许启用跟踪的自动 TTL 和数据保留。如果您遵守数据隐私法规，或者希望更有效地利用空间并自动清理痕迹，这会很有用。跟踪的数据保留期还将根据某些操作或运行规则应用程序自动延长。

<Note>
  **自托管 [Enterprise](/langsmith/pricing-plans) 客户：** 您现在可以通过 UI 在工作区级别配置扩展数据保留，这提供了更精细的控制，无需更改环境变量。欲了解更多信息，请参阅[Customize extended retention policy](/langsmith/data-purging-compliance#customize-extended-retention-policy)。本页记录的系统范围 TTL 配置仍然受支持。
</Note>

## 要求

您可以通过 helm 或环境变量设置来配置保留。有一些可配置的选项：* *启用：* 是否启用或禁用数据保留。如果启用，您可以通过 UI 将默认组织和项目 TTL 层应用于跟踪（有关详细信息，请参阅[data retention guide](/langsmith/usage-and-billing#data-retention)）。
* *保留期：* 您可以为短期和长期跟踪配置系统范围的保留期。配置完成后，您可以管理每个项目的保留级别，并为新项目设置组织范围内的默认值。

```yaml Helm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config:
  ttl:
    enabled: true
    ttl_period_seconds:
      # -- 400 day longlived and 14 day shortlived
      longlived: "34560000"
      shortlived: "1209600"
```

## ClickHouse TTL 清理作业

从 **0.11** 版本开始，cron 作业在周末运行，以帮助删除 ClickHouse 内置 TTL 机制可能尚未清理的过期数据。

<Warning>
  此作业可能使用长时间运行的**突变** (`ALTER TABLE DELETE`)，这是昂贵的操作，可能会影响 ClickHouse 的性能。我们建议仅在非高峰时段（夜间和周末）运行这些操作。在使用 **1 个并发活动** 突变（默认）进行测试期间，我们没有观察到 CPU、内存或延迟显着增加。
</Warning>

### 默认时间表

默认情况下，清理作业运行：

* **周六**：晚上 8 点和晚上 10 点（世界标准时间）
* **周日**：凌晨 12 点、凌晨 2 点和凌晨 4 点（世界标准时间）

### 禁用作业

要完全禁用清理作业：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
queue:
  deployment:
    extraEnv:
      - name: "ENABLE_CLICKHOUSE_TTL_CLEANUP_CRON"
        value: "false"
```### 配置时间表

您可以通过修改 cron 表达式来自定义清理作业的运行时间：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
queue:
  deployment:
    extraEnv:
      # UTC: Sunday 12am/2am/4am
      - name: "CLICKHOUSE_TTL_CLEANUP_CRON_WEEKEND_MORNING"
        value: "0 0,2,4 * * 0"
      # UTC: Saturday 8pm/10pm
      - name: "CLICKHOUSE_TTL_CLEANUP_CRON_WEEKEND_EVENING"
        value: "0 20,22 * * 6"
```

<Tip>
  要按单个 cron 计划运行作业，请将 `CLICKHOUSE_TTL_CLEANUP_CRON_WEEKEND_EVENING` 和 `CLICKHOUSE_TTL_CLEANUP_CRON_WEEKEND_MORNING` 设置为相同的值。作业锁定可防止重叠执行。
</Tip>

### 配置每个部分的最小过期行数

该作业逐表进行，扫描各个部分并从包含最少数量的过期行的部分中删除数据。该阈值平衡了效率和彻底性：

* **太低**：作业扫描整个零件以清除最少的数据（效率低下）
* **太高**：作业错过了具有重要过期数据的部分

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
queue:
  deployment:
    extraEnv:
      - name: "CLICKHOUSE_TTL_CRON_MIN_EXPIRED_ROWS_PER_PART"
        value: "100000" # 100k expired rows
```

#### 检查过期行

使用此查询来分析表中过期的行，并相应地调整最小值：

```sql theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

删除操作可能非常耗时（100GB 的部分大约需要 50 分钟）。您可以增加并发突变来加速该过程：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
queue:
  deployment:
    extraEnv:
      - name: "CLICKHOUSE_TTL_CRON_MAX_ACTIVE_MUTATIONS"
        value: "1"
```

<Warning>
  增加并发 DELETE 操作会严重影响系统性能。仔细监视您的系统，只有在您可以容忍可能较慢的插入和读取延迟的情况下才增加此值。
</Warning>### 紧急情况：停止运行突变

如果您遇到延迟峰值并需要终止正在运行的突变：

1. **查找活跃突变**：

   ```sql theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   SELECT * FROM system.mutations WHERE is_done = 0;
   ```

   查找 `mutation_id`，其中 `command` 列包含 `DELETE` 语句。

2. **杀死突变**：
   ```sql theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   KILL MUTATION WHERE mutation_id = '<mutation_id>';
   ```

### 备份和数据保留

如果运行此作业后磁盘空间没有减少，或者继续增加，则备份可能通过创建文件系统硬链接而导致问题。这些链接会阻止 ClickHouse 清理数据。

要进行验证，请检查 ClickHouse pod 内的以下目录：

* `/var/lib/clickhouse/backup`
* `/var/lib/clickhouse/shadow`

如果存在备份，请将其复制到外部文件系统或 blob 存储（例如 S3），然后清除目录。几分钟之内，您将注意到磁盘空间释放。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-ttl.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>