<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Essential SmithDB metrics | https://docs.langchain.com/langsmith/self-host-smithdb-metrics -->

# SmithDB 基本指标

用于监控自托管 LangSmith 的 SmithDB 和 LangSmith 指标、它们测量的内容以及如何使用它们。

SmithDB 组件在每个 Pod 的 HTTP 端口上的 `/metrics` 处公开 Prometheus 指标。本页列出了每个组件值得关注的指标以及如何阅读它们。每个表在一行中描述了一个组件的指标。表下每个指标的部分告诉您如何使用它。有关抓取和导出配置，请参阅[Configure SmithDB observability](/langsmith/self-host-smithdb-observability)。要首先检查 SmithDB 是否健康，请参阅[Common SmithDB issues to monitor](/langsmith/self-host-smithdb-common-issues)。

名称与`/metrics` 上显示的名称相同。如果您的收集器添加了命名空间或前缀，请进行相应调整。

有关选项卡式 Datadog 和 Grafana 仪表板及其收集要求，请参阅 [Monitor self-hosted LangSmith with Datadog or Grafana](/langsmith/self-host-observability-dashboards)。对于没有本机选项卡的 Grafana 安装，[standalone SmithDB dashboard](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/examples/langsmith-observability/components/smithdb/grafana.json) 使用经典格式。> [!注意]
>
> 本页涵盖 SmithDB 和 LangSmith 发出的指标。还可以从基础设施监控中监控这些信号：
>
> * Kubernetes：OOM 终止、容器重新启动、CPU 和内存超出限制以及缓存磁盘使用情况。
> * Redis：内存使用超出其限制，并逐出键。如果 Redis 已满，LangSmith 无法对新的运行进行排队。任何驱逐都意味着 Redis 删除了 LangSmith 仍然需要的数据，并且运行可能会丢失。
> * Metastore：PostgreSQL 数据库的 CPU、连接和存储。缓慢的元存储会导致摄取、查询和压缩变慢。

## LangSmith 摄取管道

LangSmith 摄取管道不是 SmithDB 的一部分，但它将所有运行发送到 SmithDB，并且 SmithDB 问题通常首先在此处可见。与 SmithDB 一起监控它。要收集这些指标，请参阅[Export LangSmith telemetry](/langsmith/export-backend)。|公制|描述 |
| - | - |
| [⟦T2⟧](#langsmith_ingestion_e2e_latency_seconds) |从 API 收到运行到 SmithDB 存储它的时间。 |
| [⟦T3⟧](#langsmith_ingestion_api_to_worker_latency_seconds) |在工作线程启动之前，运行在 Redis 中等待的时间。 |
| [⟦T4⟧](#langsmith_ingestion_worker_to_store_latency_seconds) |从摄取队列工作线程向 SmithDB 写入一次的时间。 |
| [⟦T5⟧](#langsmith_asynq_ingestion_queue_pending) |在 Redis 中等待摄取队列工作线程的任务。 |
| [⟦T6⟧](#langsmith_asynq_ingestion_queue_retry) |写入失败并等待另一次尝试的任务。 |
| [⟦T7⟧](#langsmith_asynq_queue_latency_seconds) |每个 Redis 队列中最旧的待处理任务的年龄。 |
| [⟦T8⟧](#langsmith_asynq_ingestion_queue_archived) |所有尝试均失败的任务。他们的跑动失败了。 |

### `langsmith_ingestion_e2e_latency_seconds`

*直方图*

从 API 收到运行到 SmithDB 存储它的时间。这是用户看到的延迟，包括 Redis 中的等待和所有重试。在[dual ingestion](/langsmith/self-host-smithdb-install#step-4-enable-dual-ingestion)期间，将SmithDB与ClickHouse进行比较，看看SmithDB是否跟上。短尖峰是正常的。

查询：使用p95。最高的桶是60s，所以p99经常停留在60s，没有表现出变化。过滤`store="smithdb"`。为了与 ClickHouse 进行比较，请按 `store`（`smithdb` 或 `clickhouse`）分割。

### `langsmith_ingestion_api_to_worker_latency_seconds`

*直方图*

在工作线程启动之前，运行在 Redis 中等待的时间。如果在 `langsmith_ingestion_worker_to_store_latency_seconds` 稳定时增加，则说明没有足够的摄取队列工作线程，并且问题不在 SmithDB 中。查询：按 `store="smithdb"` 筛选。为了与 ClickHouse 进行比较，请按 `store`（`smithdb` 或 `clickhouse`）分割。

### `langsmith_ingestion_worker_to_store_latency_seconds`

*直方图*

从摄取队列工作线程向 SmithDB 写入一次的时间。如果它增加，则问题出在 SmithDB 或其依赖项中。缓慢的写入使工作人员忙碌，因此运行也会在 Redis 中等待更长的时间。继续使用 SmithDB 摄取指标。

查询：按 `store="smithdb"` 筛选。为了与 ClickHouse 进行比较，请按 `store`（`smithdb` 或 `clickhouse`）分割。该值是整个批次的时间，为批次中的每次运行记录一次。

### `langsmith_asynq_ingestion_queue_pending`

*仪表*

在 Redis 中等待摄取队列工作线程的任务。等待重试的任务不包括在内。监控相对于流量的趋势，而不是数量。在流量稳定的情况下队列增加是一个问题。如果重试保持稳定，突然减少是健康的。

查询：每个平台后端 Pod 报告整个队列的相同值。在 pod 之间使用 max，而不是 sum。

### `langsmith_asynq_ingestion_queue_retry`

*仪表*写入失败并等待另一次尝试的任务。这些任务不在待处理队列中。短暂的增加是正常的。如果该值保持较高水平，则从摄取队列工作线程向 SmithDB 摄取的写入会失败。尝试 12 次失败后（大约 2.5 小时），任务将进入存档，并且其运行将丢失。如果 `config.settings.redisRunsExpirySeconds` 小于此值，则运行数据首先在 Redis 中过期，并且在任务到达存档之前运行会丢失。

查询：每个平台后端 Pod 报告整个队列的相同值。在 pod 之间使用 max，而不是 sum。

### `langsmith_asynq_queue_latency_seconds`

*仪表*

每个 Redis 队列中最旧的待处理任务的年龄。 LangSmith 在固定时间后删除 Redis 中的运行数据，该时间由 Helm 图表中的`config.settings.redisRunsExpirySeconds` 设置（默认为 6 小时）。早在该值达到该时间之前就采取行动。该值仅涵盖待处理的任务，并且每次重试后都会重新开始计时。要查找一次又一次失败的任务，请监控`langsmith_asynq_ingestion_queue_retry`。

查询：每个平台后端 Pod 为每个队列报告相同的值。跨 pod 和跨摄取队列使用 max，而不是 sum。

### `langsmith_asynq_ingestion_queue_archived`

*仪表*所有尝试均失败的任务。他们的跑动失败了。增加意味着数据丢失。存档的任务会保留 90 天，因此监控会增加，而不是值。每个队列最多保留 10,000 个归档任务。当存档已满时，该值停止增加。然后使用摄取队列日志来查找新的故障。

查询：每个平台后端 Pod 报告整个队列的相同值。在 pod 之间使用 max，而不是 sum。

## SmithDB 摄取

|公制|描述 |
| - | - |
| [⟦T32⟧](#ingest_batch_latency) |新数据在 SmithDB 中持久存在的时间。 |
| [⟦T33⟧](#ingest_flush_count) |已完成和失败的对象存储刷新。 |
| [⟦T34⟧](#ingest_flush_rows) |每次冲水时都会运行。 |
| [⟦T35⟧](#ingest_flush_duration) |每次冲洗的时间。 |
| [⟦T36⟧](#ingest_flush_reason) |为什么每次冲洗都会开始。 |
| [⟦T37⟧](#ingest_pending_segment_entry_count) |尚未刷新或合并的摄取 Pod 上的数据。 |
| [⟦T38⟧](#semaphore_permits_in_use-semaphore_max_permits) [⟦T39⟧](#semaphore_permits_in_use-semaphore_max_permits) |与限制相比，在摄取盒上同时运行的冲洗。 |
| [⟦T40⟧](#server_requests_duration-on-ingestion-pods) |对摄取 Pod 发出每个请求的时间。 |

### `ingest_batch_latency`

*直方图*新数据在 SmithDB 中持久存在的时间。摄取从所有请求中收集同一分区（租户、项目和日期）的运行，并将它们作为一个段刷新在一起。 SmithDB 为请求中的每个分区记录一个值，从运行到达时到刷新完成。该值包括等待刷新的时间，因此 p50 高于 0.5 秒是正常的。如果 p99 保持在高水平，则冲洗速度会很慢。检查 `ingest_flush_duration` 和刷新信号量。

### `ingest_flush_count`

*柜台*

已完成和失败的对象存储刷新。如果在运行到达时成功刷新率 (`status="success"`) 降至 0，则写入不会到达对象存储。连续刷新失败率 (`status="failure"`) 意味着对象存储或元存储有错误。

查询：使用跨 Pod 求和的速率。按 `status`（`success` 或 `failure`）分割。要分开 L0 和 L1 冲水，也按 `level` 分开。

### `ingest_flush_rows`

*直方图*

每次冲水时都会运行。小的 L0 刷新是正常的，因为大多数租户和项目在 500 毫秒内发送很少的运行。如果行数减少而刷新率保持不变，则刷新发生得太早。

查询：按`level`（`L0`或`L1`）拆分。

### `ingest_flush_duration`

*直方图*每次刷新的时间，包括刷新开始之前的时间以及刷新失败的时间。如果它与[⟦T55⟧](#object_store_op_duration)一起增加，则原因是对象存储。如果它单独增加，则同时运行太多刷新（请参阅[semaphores](#semaphore_permits_in_use-semaphore_max_permits)），或者元存储很慢。

### `ingest_flush_reason`

*柜台*

为什么每次冲洗都会开始。 `time` 表示刷新计时器已触发，`size` 表示数据达到其行限制，`shutdown` 表示 Pod 已停止。更多 `size` 刷新意味着每个租户和项目有更多数据。在推出之外的许多 `shutdown` 刷新意味着 pod 会重新启动。

查询：使用跨 Pod 求和的速率。按 `reason` 和 `level`（`L0` 或 `L1`）拆分。

### `ingest_pending_segment_entry_count`

*仪表*

尚未刷新或合并的摄取 Pod 上的数据。 L0 统计内存中尚未刷新的数据。 L1 计算磁盘缓存上尚未合并的段。 L1 值较大是正常的，因为 SmithDB 仅在 10 分钟或 25,000 行后才合并数据。值持续增加意味着刷新延迟。 SmithDB 仅在某些事件时更新该值，因此它可能会保持旧状态一段时间。查询：按`level`（`L0`或`L1`）拆分。使用 max across ingestion pod 来查找具有最多待处理数据的 pod。

### `semaphore_permits_in_use`，`semaphore_max_permits`

*仪表*

与限制相比，在摄取盒上同时运行的冲洗。 `name` 标签标识信号量：`flush_l0` 限制将新数据从内存刷新到较小的 L0 段（默认 200），`flush_l1` 限制将 L0 段合并到较大的 L1 段（默认 10）。最大值处的短峰是正常的。如果 `semaphore_permits_in_use` 停留在 `semaphore_max_permits`，则工作在 Pod 中等待。您将其视为延迟，而不是错误。

查询：根据`name`标签进行过滤，例如`name="flush_l0"`。

### `server_requests_duration` 在摄取荚上

*直方图*

对摄取 Pod 发出每个请求的时间。 `path` 标签显示请求类型。最常见的类型以 `IngestRunsStream` 结尾，即来自摄取队列工作线程的运行写入，以及 `ExecuteQueryStream`，即查询 pod 对最新段的读取。对于写入，`status` 不为 0 是写入失败，摄取队列工作线程会再次尝试。查询：所有 SmithDB pod 都会报告此指标。选择带有收集器添加的 Pod 或部署标签的摄取 Pod，例如 `langsmith-smithdb-ingestion`。在 `type="grpc"` 上进行过滤，因为这些 Pod 上的 HTTP 请求是运行状况检查和指标抓取。对于流，该值涵盖整个流。

## SmithDB 查询

|公制|描述 |
| - | - |
| [⟦T86⟧](#server_requests_duration-on-query-pods) |每个查询 pod 请求的时间。 |
| [⟦T87⟧](#query_fanout_partitions) |扫描查询必须打开的分区。扫描分区越多，查询速度就越慢。 |
| [⟦T88⟧](#query_fanout_limit_exceeded_total) |查询被拒绝，因为它们必须打开太多扫描分区。 |
| [⟦T89⟧](#query_execution_max_mem_used_bytes) |查询中最大运算符的峰值内存。 |
| [⟦T90⟧](#query_admission_queue_length) |由于查询 Pod 达到内存限制而等待的请求。 |
| [⟦T91⟧](#query_admission_queue_duration_seconds) |请求在准入队列中等待的时间。 |
| [⟦T92⟧](#query_admission_queue_rejections_total) |由于准入队列已满，请求被拒绝。 |

### `server_requests_duration` 在查询 Pod 上

*直方图*

每个查询 pod 请求的时间。 `path` 标签显示请求类型。最常见的类型以 `QueryRuns`（列出运行）、`QueryTraces`（列出跟踪）和 `QueryRun`（读取一次运行）结尾。如果许多请求类型都很慢，请检查`query_fanout_partitions`（压缩延迟）和准入队列（Pod 内存不足）。查询：选择具有收集器添加的 Pod 或部署标签的查询 Pod。每个查询池都有自己的部署。按 `path` 拆分以查找慢速请求类型，并按 `status` 拆分以计数失败。 `status`标签是gRPC代码，其中0表示成功。

### `query_fanout_partitions`

*直方图*

扫描查询必须打开的分区。扫描分区大约是一个段或一组段。查询打开的扫描分区越多，速度就越慢并且需要的内存也就越多。压缩合并小段，因此查询打开更少的扫描分区。如果 p99 在流量稳定时增加，则压缩通常会延迟。

### `query_fanout_limit_exceeded_total`

*柜台*

查询被拒绝，因为它们必须打开太多扫描分区。 SmithDB 查询拒绝必须打开超过 10,000 个扫描分区的查询。连续的速率意味着用户查询失败。首先检查压实情况。宽的时间范围也会导致这种情况。

查询：使用跨 Pod 求和的速率。

### `query_execution_max_mem_used_bytes`

*直方图*

查询中最大运算符的峰值内存，而不是完整查询的峰值内存。使用它来查找需要大量内存的请求类型。使用 Pod 内存来查看 Pod 是否接近其极限。

### `query_admission_queue_length`

*仪表*由于查询 Pod 达到内存限制而等待的请求。新请求在 Pod 的准入队列中等待，该队列有 100 个位置。如果 Pod 没有内存限制，则该值始终保持为 0。

查询：使用 max across 查询 pod 来查找队列最长的 pod。

### `query_admission_queue_duration_seconds`

*直方图*

请求开始之前在准入队列中等待的时间。长时间的等待会使查询变慢，但它们不会失败。

### `query_admission_queue_rejections_total`

*柜台*

由于准入队列已满，请求被拒绝。每次拒绝都是一个失败的查询，并且意味着查询 Pod 内存不足。添加副本或内存。

查询：使用跨 Pod 求和的速率。

## SmithDB 压缩

压缩调度程序将其作业队列保留在内存中。队列指标来自调度程序 Pod。工作节点指标来自每个工作节点。|公制|描述 |
| - | - |
| [⟦T108⟧](#compaction_jobs_scheduled-compaction_jobs_executed) [⟦T109⟧](#compaction_jobs_scheduled-compaction_jobs_executed) |压缩调度程序计划且工作人员完成的作业。 |
| [⟦T110⟧](#compaction_job_completion) |压实作业的结果，成功或失败。 |
| [⟦T111⟧](#compaction_queue_job_count) |压缩现在等待或运行的作业。 |
| [⟦T112⟧](#compaction_queue_job_size) |现在等待或运行的所有压缩作业的估计内存。 |
| [⟦T113⟧](#compaction_queue_oldest_pending_created_at_seconds) |等待的最早的压缩作业的创建时间。 |
| [⟦T114⟧](#compaction_job_latency_seconds) |从工作创造到完成的时间，包括等待。 |
| [⟦T115⟧](#compaction_queue_jobs_skipped_capacity) |工作被跳过，因为它们不适合工人。 |
| [⟦T116⟧](#compaction_worker_capacity_used-compaction_worker_capacity_limit) [⟦T117⟧](#compaction_worker_capacity_used-compaction_worker_capacity_limit) |正在运行的作业的内存与工作线程容量相比。 |
| [⟦T118⟧](#compaction_worker_running_tasks) |工人现在运行的压缩作业。 |

### `compaction_jobs_scheduled`，`compaction_jobs_executed`

*柜台*

压缩调度程序计划且工作人员完成的作业。差距再次缩小是正常的。如果执行进度低于计划，则说明没有足够的压实工人。检查工作线程容量和待处理队列。

查询：使用跨 Pod 求和的速率。

### `compaction_job_completion`

*柜台*压实作业的结果，成功或失败。单一故障是正常的，例如当两个作业更改同一段时。对于每个工人来说太大的工作，或者没有及时完成的​​工作，也算作失败。如果一个`job_kind`一次又一次失败，或者没有成功，那么这种工作就不起作用。

查询：使用跨 Pod 求和的速率。按 `status`（`success` 或 `failure`）和 `job_kind` 拆分。

### `compaction_queue_job_count`

*仪表*

等待 (`pending`) 或立即运行 (`inflight`) 的压缩作业。短峰值是正常的，例如在多次删除之后。待处理计数在数小时内保持较高水平意味着压缩已晚。检查自动缩放器是否添加了压实工作人员。默认情况下，它根据 CPU 进行扩展，而不是根据待处理的作业进行扩展。要扩展待处理的作业，请参阅[Scale with KEDA instead](/langsmith/self-host-smithdb-scale#scale-with-keda-instead)。如果工作线程达到最大副本数，请提高最大值。

查询：按`status`（`pending`或`inflight`）和`job_kind`拆分。

### `compaction_queue_job_size`

*仪表*

现在等待或运行的所有压缩作业的估计内存。它使用与工人容量相同的单位。如果一个`job_kind`的待处理大小大于每个worker的可用容量，那么这些作业会等待，直到一个worker几乎空闲。添加压实工作者，或给他们更多的内存。查询：按`status`（`pending`或`inflight`）和`job_kind`拆分。

### `compaction_queue_oldest_pending_created_at_seconds`

*仪表*

等待的最早的压缩作业的创建时间。有些作业会等待几个小时，因为压实工作人员会先处理适合其空闲容量的第一个工作，而大型工作会等到工作人员几乎闲置时才进行。监测趋势，而不是固定年龄。年龄不断增加意味着压实跟不上。要找到等待的工作类型，请通过 `job_kind` 比较 [⟦T141⟧](#compaction_queue_job_count) 和 [⟦T142⟧](#compaction_queue_job_size)。

查询：用`time() - value`计算年龄，不包含0。

### `compaction_job_latency_seconds`

*直方图*

从工作创造到完成的时间，包括等待。当压实工人满员且工作进展缓慢时，该压力会增加。将其与工人能力进行比较，找出哪一个。

查询：最高的桶是900秒，所以百分位数不显示更长的时间。要查找等待时间较长的作业，请使用[⟦T146⟧](#compaction_queue_oldest_pending_created_at_seconds)。

### `compaction_queue_jobs_skipped_capacity`

*柜台*

工作被跳过，因为它们不适合工人。每当一个worker请求工作并且该作业不适合时，压缩调度程序就会对一个作业进行计数，因此一个作业可以被计数多次。利率高是正常的。监控趋势以及最大的待定年龄。

查询：使用跨 Pod 求和的速率。### `compaction_worker_capacity_used`，`compaction_worker_capacity_limit`

*仪表*

正在运行的作业的内存与工作线程容量相比。容量是作业内存的估计值，默认为 Pod 内存限制的 80%。如果大多数压实工作人员接近其极限，作业就会等待并且待处理队列会增加。添加压实工作人员，或为更大的工作提供更多内存。

查询：将`compaction_worker_capacity_used`除以`job_kind`以查看哪些作业类型使用了容量。

### `compaction_worker_running_tasks`

*仪表*

工人现在运行的压缩作业。如果作业待处理时总和为 0，则压实工作器已停止。确保它们可以连接到压缩调度程序。

查询：使用压实工作人员的总和。按 `job_kind` 拆分以查看运行哪些作业类型。

## 共享 SmithDB 指标

多个 SmithDB 组件会报告这些指标。

|公制|描述 |
| - | - |
| [⟦T154⟧](#object_store_op_duration) |对象存储上每个操作的时间。 |
| [⟦T155⟧](#sys_jemalloc_resident_bytes) | SmithDB 进程使用的内存。 |

### `object_store_op_duration`

*直方图*对象存储上每个操作的时间。查询、摄取和压缩 Pod 报告此指标。他们在对象存储中读取和写入数据，因此缓慢的对象存储会导致摄取、查询和压缩变慢。如果所有组件上的值同时增加，则原因是对象存储或其网络。

查询：按`op`拆分查找慢操作类型，按`result`（`success`、`error`或`canceled`）拆分查找故障。选择一个具有收集器添加的 Pod 或部署标签的组件。

### `sys_jemalloc_resident_bytes`

*仪表*

SmithDB 进程使用的内存。将其与 pod 内存限制进行比较。如果该值接近限制，Kubernetes 会因为内存不足而停止 pod（OOM 终止）。

查询：在组件的 pod 中使用 max。

## SmithDB 迁移

迁移作业 Pod 在 [historical migration](/langsmith/self-host-smithdb-migrate) 期间报告这些指标。迁移不会再次尝试失败的任务或作业。故障会在迁移作业到达 `Complete` 之前停止，并且作业将继续运行，直到您解决故障为止。参见[Migration Job failures](/langsmith/self-host-smithdb-troubleshooting#migration-job-failures)。|公制|描述 |
| - | - |
| [⟦T164⟧](#migration_tasks) |按种类和状态划分的迁移任务。 |
| [⟦T165⟧](#migration_jobs) |按种类和状态划分的移民工作。 |
| [⟦T166⟧](#migration_run_tasks_completed_total) |运行 Pod 完成的任务。 |
| [⟦T167⟧](#migration_run_task_planned_rows_migrated_total) | Pod 完成的运行任务中的行。 |

### `migration_tasks`

*仪表*

按种类和状态划分的迁移任务。 `kind` 标签为`run` 或`feedback`。 `status` 标签为 `pending`、`running`、`completed` 或 `failed`。进度是`completed`计数，与所有状态的总和进行比较。任何 `failed` 任务都会停止迁移。

查询：每个 Pod 报告整个迁移过程中的相同值。该值来自迁移任务数据库（TaskDB），每两分钟更改一次。在 pod 之间使用 max，而不是 sum。

### `migration_jobs`

*仪表*

按种类和状态划分的移民工作。运行作业以`promoted`结束，反馈作业以`validated`结束。 `failed` 和 `validation_failed` 失败并停止迁移。所有其他状态均表示作业仍在进行中。

查询：每个 Pod 报告整个迁移过程中的相同值。该值来自TaskDB，每两分钟更改一次。在 pod 之间使用 max，而不是 sum。

### `migration_run_tasks_completed_total`

*柜台*

运行 Pod 完成的任务。速率是任务中的迁移吞吐量。查询：使用跨 Pod 求和的速率。

### `migration_run_task_planned_rows_migrated_total`

*柜台*

Pod 完成的运行任务中的行。 ClickHouse 在迁移规划任务时对行进行计数。该速率是以行为单位的迁移吞吐量。

查询：使用跨 Pod 求和的速率。

## 条款

对于架构的术语，例如任务和段，请参见[SmithDB architecture](/langsmith/self-host-smithdb-architecture#terms)。

|术语 |意义|
| - | - |
|分区|一个租户、一个项目、一天的运行。 SmithDB 摄取将每个分区写入其自己的段。 |
|扫描分区 |查询读取的一个工作单元，大约是一个段或一组段。它与分区不同。 |
|冲洗 | SmithDB 摄取将数据作为段写入对象存储。 L0 刷新从内存写入新数据。 L1 刷新将 L0 段合并为一个更大的段。 |
| L0、L1 段 | SmithDB 摄取每 500 毫秒或 5,000 行刷新每个分区的一个小 L0 段。随后，它将分区的 L0 段合并为一个更大的 L1 段。 |
|入场排队|当查询 Pod 的内存达到极限时，新查询将等待。 ||压实作业|压缩工作的一个单元：它合并段、将反馈写入文件或删除过期和已删除的数据。调度程序计划作业。工人经营它们。 |

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-smithdb-metrics.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。