<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Migrate ClickHouse history to SmithDB | https://docs.langchain.com/langsmith/self-host-smithdb-migrate -->

# 将 ClickHouse 历史记录迁移到 SmithDB

为自托管 LangSmith 安装运行历史 ClickHouse 到 SmithDB 迁移。

当必须可通过 SmithDB 查询 ClickHouse 历史记录时运行此迁移。如果不需要，请跳过此页面并继续查询切换。

> [!注意]
>
> 在开始本指南之前，完成 [Install LangSmith with SmithDB](/langsmith/self-host-smithdb-install) 的第 1 至 4 阶段。返回那里**迁移清理后将查询切换到 SmithDB**。

## 迁移如何进行

迁移作业从 ClickHouse 读取运行，将它们写入 SmithDB 对象存储，验证结果，并将每个批次提升到 SmithDB 元存储。 TaskDB 是一个仅在迁移期间使用的独立 PostgreSQL 数据库，它允许迁移 Pod 共享工作、从中断中恢复以及无需重新开始即可恢复。它不同于 LangSmith PostgreSQL 和 SmithDB 元存储。

## 范围和先决条件

开始之前：

* 保持现有ClickHouse配置启用且不变。
* 确认 SmithDB 服务和双摄取运行正常，并且新写入继续到达 ClickHouse。

## 规划迁移容量

### 大小迁移工人

使用这些 Helm 控件扩展迁移：* **`smithdb.migration.job.parallelism`**：可以同时运行的迁移Job Pod的数量。
* **`smithdb.migration.job.resources`**：分配给每个迁移 Pod 的 CPU、内存和临时存储。在 LangSmith 0.16 上，该密钥是 `smithdb.migration.deployment.resources`。

使用此公式作为经验法则：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
estimated allocated vCPUs = historical run count / 5,000,000 / target duration in days
```

从图表默认的每个迁移 Pod 8 个 vCPU 和 32 GiB 开始，并将 32 GiB 视为实际最小值，而不是 CPU 的函数。因此，一天内迁移 1 亿次运行建议在作业 Pod 之间分配大约 20 个 vCPU，例如默认大小的 3 个 Pod。这会估计总 CPU，而不是 Pod 计数或每个 Pod 资源。实际要求因数据和环境而异。

您可以运行单个工作线程，TaskDB 会保留其进度，但这样的大量历史记录可能会花费不切实际的时间。根据估计的 vCPU 和可用容量一起选择并行度和每个 Pod 资源，并在 [Enable migration](#enable-migration) 下的值块中设置两者。

### 扩展TaskDB

随着并行度的增加，监视 TaskDB CPU、内存和活动连接，并根据需要提高 `smithdb.migration.taskdb.postgres.statefulSet.resources`。不要使用主 LangSmith PostgreSQL 数据库或 SmithDB 元存储作为 TaskDB。

## 启用迁移对于图表管理的 TaskDB，请在 LangSmith 命名空间中创建一个 Secret，并在 `postgres_password` 下生成强密码。切勿将其存储在 Helm 值或源代码管理中。参见[Use an existing secret for your installation](/langsmith/self-host-using-an-existing-secret)。对于外部 PostgreSQL，请改用图表的外部 TaskDB 设置。

引用 TaskDB Secret 并启用迁移。下面的块将每个迁移设置收集在一个位置：`langsmith`标志和TaskDB Secret是必需的，其余的是图表默认值，仅在扩展时更改。

> **迁移 Helm 值示例**
>
> ```yaml LangSmith 0.17 theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> smithdb:
>   enabled: true
>   langsmith:
>     ingestion:
>       enabled: true    # required: keep dual ingestion on
>     migration:
>       enabled: true    # required: runs the migration Job and TaskDB
>     query:
>       enabled: false   # required: keep queries on ClickHouse until migration completes
>   migration:
>     job:
>       parallelism: 1   # default: raise to run more migration pods
>       resources:       # default per pod: 32Gi is a practical minimum
>         requests:
>           cpu: "8"
>           memory: "32Gi"
>           ephemeral-storage: "100Gi"
>         limits:
>           cpu: "8"
>           memory: "32Gi"
>           ephemeral-storage: "100Gi"
>     taskdb:
>       postgres:
>         auth:
>           existingSecretName: "smithdb-migration-taskdb"   # required for chart-managed TaskDB
>           passwordSecretKey: "postgres_password"
>         maxConnectionsPerMigrationPod: 10   # default: server limit is (parallelism + 1) × this
>         statefulSet:
>           resources:   # default: raise for high parallelism
>             requests:
>               cpu: "2"
>               memory: "4Gi"
>             limits:
>               cpu: "4"
>               memory: "8Gi"
> ```
>
> ```yaml LangSmith 0.16 theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> smithdb:
>   enabled: true
>   langsmith:
>     ingestion:
>       enabled: true    # required: keep dual ingestion on
>     migration:
>       enabled: true    # required: runs the migration Job and TaskDB
>     query:
>       enabled: false   # required: keep queries on ClickHouse until migration completes
>   migration:
>     job:
>       parallelism: 1   # default: raise to run more migration pods
>     deployment:
>       resources:       # default per pod: 32Gi is a practical minimum
>         requests:
>           cpu: "8"
>           memory: "32Gi"
>           ephemeral-storage: "100Gi"
>         limits:
>           cpu: "8"
>           memory: "32Gi"
>           ephemeral-storage: "100Gi"
>     taskdb:
>       postgres:
>         auth:
>           existingSecretName: "smithdb-migration-taskdb"   # required for chart-managed TaskDB
>           passwordSecretKey: "postgres_password"
>         maxConnectionsPerMigrationPod: 10   # default: server limit is (parallelism + 1) × this
>         statefulSet:
>           resources:   # default: raise for high parallelism
>             requests:
>               cpu: "2"
>               memory: "4Gi"
>             limits:
>               cpu: "4"
>               memory: "8Gi"
> ```

通过正常工作流程应用图表。它创建 TaskDB 和一个运行完成并退出的一次性迁移作业。

## 等待完成

保持 SmithDB 支持的查询处于禁用状态，直到历史迁移作业报告 Kubernetes 状况`Complete`。

完成的迁移作业默认保留 7 天，以便您可以检查其日志。日志仅用于诊断； `Complete`条件是迁移完成的信号。仅在诊断需要时才保留 TaskDB。如果Job失败，保留它和TaskDB，然后参见[Migration Job failures](/langsmith/self-host-smithdb-troubleshooting#migration-job-failures)。

返回 [Install LangSmith with SmithDB](/langsmith/self-host-smithdb-install#step-6-switch-queries-to-smithdb) 并完成 **将查询切换到 SmithDB** 步骤。

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-smithdb-migrate.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。