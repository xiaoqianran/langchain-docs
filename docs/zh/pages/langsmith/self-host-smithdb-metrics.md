<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: SmithDB metrics reference | https://docs.langchain.com/langsmith/self-host-smithdb-metrics -->

# SmithDB 指标参考

每个 SmithDB 组件需要关注的指标、它们测量的内容以及如何读取它们。

SmithDB 组件在每个 pod 的 HTTP 端口上的 `/metrics` 处公开 Prometheus 指标。本页列出了每个组件值得关注的指标以及如何阅读它们。有关抓取和导出配置，请参阅[Configure SmithDB observability](/langsmith/self-host-smithdb-observability)。

名称与`/metrics` 上显示的名称相同。如果您的收集器添加了命名空间或前缀，请进行相应调整。

有关选项卡式 Datadog 和 Grafana 仪表板及其收集要求，请参阅 [Monitor self-hosted LangSmith with Datadog or Grafana](/langsmith/self-host-observability-dashboards)。对于没有本机选项卡的 Grafana 安装，[standalone SmithDB dashboard](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/examples/langsmith-observability/components/smithdb/grafana.json) 使用经典格式。

<Note>
  本页涵盖 SmithDB 发出的指标。 OOM 终止、容器重新启动、CPU 和内存超出限制以及缓存磁盘使用等 Kubernetes 信号值得警惕，但来自您的基础设施监控，而不是来自 SmithDB。
</Note>

## 基线指标

如果完整参考超出您的需要，以下指标可以回答 SmithDB 是否健康。所有其他指标都提供了额外的详细信息。|问题 |公制|组件|
| - | - | - |
|查询是否成功且快速？ | `server_requests_duration` |查询 |
|写入是否落地且速度快？ | `ingest_batch_latency` |食入|
|摄入量是否跟得上到达量？ | `ingest_pending_segment_entry_count` |食入|
|压实跟得上吗？ | `compaction_queue_job_count` |压实|
|压缩成功了吗？ | `compaction_job_completion` |压实|

压缩有两个条目，因为失败模式是独立的：作业可能会重复失败，而队列长度保持不变，而队列可能会增长，而每个运行的作业都会成功。

## 摄入|公制|类型 |描述 |
| - | - | - |
| `ingest_batch_latency` |直方图|从批量接收到刷新完成的端到端延迟。 |
| `ingest_flush_count` |专柜|刷新到对象存储。流量到达时的固定费率意味着写入不会落地。 |
| `ingest_flush_rows` |直方图|每次冲洗的行数，按级别。以稳定的冲洗速率下降的行表明过早冲洗。 |
| `ingest_flush_duration` |直方图|冲水需要多长时间。持续时间增加表明对象存储延迟或摄取量过小。 |
| `ingest_flush_reason` |专柜|是什么触发了每次刷新，标记为`reason`（`size`、`time`或`shutdown`）和`level`（`L0`或`L1`）。 L1 在累积运行计数或超时时刷新。 |
| `ingest_pending_segment_entry_count` |仪表|条目尚未刷新。持续增长意味着冲洗工作积压。 |
| `semaphore_permits_in_use` |仪表|针对 `semaphore_max_permits` 持有并发许可。持续饱和意味着写入正在排队。 |
| `server_requests_duration` |直方图|摄取请求延迟。按 `status` 分割以获得成功和失败计数。 |

＃＃ 询问|公制|类型 |描述 |
| - | - | - |
| `server_requests_duration` |直方图|查询延迟。按 `status` 拆分以获得成功和失败计数，其中 `status` 是 gRPC 代码（`0` 是成功）或 HTTP 代码，并按 `path` 查找慢速端点。 |
| `query_fanout_partitions` |直方图|每个查询的活动扫描分区。扇出的增加会增加延迟和内存。 |
| `query_fanout_limit_exceeded_total` |专柜|查询因扇出过多而被拒绝。任何持续的速率都意味着查询彻底失败。 |
| `query_execution_max_mem_used_bytes` |直方图|查询计划中最大运算符的峰值内存。在终止之前接近配置的限制。 |

## 压实|公制|类型 |描述 |
| - | - | - |
| `compaction_queue_job_count` |仪表|在压缩队列中等待的作业。持续增长意味着压实落后。 |
| `compaction_jobs_scheduled` |专柜|由管道创建的工作。与执行的作业进行比较。 |
| `compaction_jobs_executed` |专柜|工作消耗了。持续低于计划意味着工人供应不足。 |
| `compaction_job_completion` |专柜|工作成果，标记为`status`（`success`或`failure`）和`job_kind`。 `job_kind` 降至零意味着作业类型已停止运行。 |
| `compaction_queue_jobs_skipped_capacity` |专柜|因超出工人的剩余能力而跳过工作。持续的增长率意味着工人的能力对于正在创造的就业机会来说太小了。 |
| `compaction_queue_oldest_pending_created_at_seconds` |仪表|最旧的挂起作业入队时的 Unix 时间戳，或者当队列为空时为零。将年龄计算为`time() - metric`，并排除零情况。 |
| `compaction_job_latency_seconds` |直方图|创造就业机会直至完成。包括队列等待，因此当工作人员饱和以及作业缓慢时，等待时间就会增加。 |
| `compaction_worker_capacity_used` |仪表|飞行中运力成本为 `job_kind`，而`compaction_worker_capacity_limit`。持续接近极限的使用解释了跳过的作业和不断增长的队列。 |
| `compaction_worker_running_tasks` |仪表|由`job_kind`运行的任务。当队列非空时为零意味着工作人员处于停滞状态，而不是忙碌。 |## 迁移

迁移作业 Pod 在 [historical migration](/langsmith/self-host-smithdb-migrate) 期间发出指标。如何跨 Pod 聚合指标取决于其类型：

* **仪表**：报告整个迁移的总计。这些值来自 TaskDB，每两分钟刷新一次。每个 Pod 报告相同的值，因此使用 `max` 聚合，而不是 `sum`。
* **计数器**：跟踪每个 Pod 所做的工作。将各个 Pod 的费率相加。

迁移作业 Pod 发出以下指标：

|公制|类型 |描述 |
| - | - | - |
| `migration_tasks` |仪表|迁移任务，标记为 `kind`（`run` 或 `feedback`）和 `status`（`pending`、`running`、`completed` 或 `failed`）。进度是 `completed` 相对于状态总数的计数。 |
| `migration_jobs` |仪表|迁移作业，标记为 `kind` 和 `status`。运行作业完成为`promoted`，反馈作业完成为`validated`。 `failed` 和 `validation_failed` 表示失败，其他所有状态都表示作业仍在进行中。 |
| `migration_run_tasks_completed_total` |专柜|运行 pod 完成的任务。该速率是任务中的迁移吞吐量。 |
| `migration_run_task_planned_rows_migrated_total` |专柜| Pod 完成的运行任务中的行数，如计划任务时在 ClickHouse 中计数的那样。该速率是以行为单位的迁移吞吐量。 |迁移不会自行重试失败的任务或作业。任何 `failed` 任务或 `failed` 或 `validation_failed` 作业计数都会阻止迁移作业达到 `Complete`。作业将继续运行，直到您解决故障为止。参见[Migration Job failures](/langsmith/self-host-smithdb-troubleshooting#migration-job-failures)。

## 所有组件

|公制|类型 |描述 |
| - | - | - |
| `object_store_op_duration` |直方图|对象存储操作延迟。 |
| `sys_jemalloc_resident_bytes` |仪表|常驻进程内存。跟踪 pod 内存限制。 |

## LangSmith 摄取路径

由LangSmith而不是SmithDB发出，并标记为`store="clickhouse|smithdb"`，因此可以在[dual ingestion](/langsmith/self-host-smithdb-install#step-4-enable-dual-ingestion)期间直接比较两个存储。

|公制|类型 |描述 |
| - | - | - |
| `langsmith_ingestion_e2e_latency_seconds` |直方图|每次运行时用于存储写入确认的 API 收据。面向用户的号码；将 `store="smithdb"` 与 `store="clickhouse"` 进行比较。 |
| `langsmith_ingestion_api_to_worker_latency_seconds` |直方图|工作线程启动前的队列等待。这里出现的是队列问题，而不是SmithDB问题。 |
| `langsmith_ingestion_worker_to_store_latency_seconds` |直方图|单独存储写入时间。将 SmithDB 与队列延迟隔离。 |
| `langsmith_asynq_ingestion_queue_pending` |仪表|任务在 LangSmith 摄取队列中等待，然后工作人员将其拾取。持续增长意味着队列无法跟上 SmithDB 上游的到达速度。 |

***<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-smithdb-metrics.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>