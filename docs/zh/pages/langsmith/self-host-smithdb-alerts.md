<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Recommended SmithDB alerts | https://docs.langchain.com/langsmith/self-host-smithdb-alerts -->

# 推荐的 SmithDB 警报

使用 SmithDB 检测运行丢失、写入失败、查询失败或缓慢以及自托管 LangSmith 上的后期压缩的警报。

此页面列出了要在自托管 SmithDB 的监控平台中创建的警报。 LangSmith 不会为您创建它们。他们检测对生产影响最大的问题：运行丢失、写入失败、查询失败或缓慢，以及落后的压缩。

使用[dashboards](/langsmith/self-host-observability-dashboards)检查系统。使用这些警报来了解何时进行检查。每个警报都会提供要在监控平台中设置的指标和条件。有关每个指标衡量的内容，请参阅[Essential SmithDB metrics](/langsmith/self-host-smithdb-metrics)。

每个警报都有一个严重性：

* **紧急**：运行丢失，或者用户现在遇到问题。随时回复。
* **非紧急**：性能下降。一个工作日内回复。

大多数警报都有警告和严重阈值。严重性适用于临界阈值。警告阈值为同一问题提供了早期信号。

## 警报摘要|警报 |严重性 |何时触发 |
| - | - | - |
| [1. Runs are lost](#1-runs-are-lost) |紧急|运行任务最后一次尝试失败，或者 Redis 逐出密钥。 |
| [2. Feedback is lost](#2-feedback-is-lost) |紧急|反馈任务最后一次尝试失败。 |
| [3. The ingestion backlog gets old](#3-the-ingestion-backlog-gets-old) |紧急|最旧的待处理任务超过 30 分钟，或者有超过 1,000 个任务等待重试。 |
| [4. Redis is almost full](#4-redis-is-almost-full) |紧急| Redis 内存超过其限制的 90%。 |
| [5. Writes fail](#5-writes-fail) |紧急|超过 5% 的写入在 15 分钟内失败。 |
| [6. Queries fail](#6-queries-fail) |紧急|超过 10% 的池查询会在 15 分钟内失败。 |
| [7. The metastore is saturated](#7-the-metastore-is-saturated) |紧急|连接超过 90%，CPU 超过 80%，或存储几乎已满。 |
| [8. Writes are slow](#8-writes-are-slow) |非紧急|写入时间超过 2 秒（中位数），持续 15 分钟。 |
| [9. Queries are slow](#9-queries-are-slow) |非紧急|池的 p95 延迟超过 20 秒，持续 15 分钟。 |
| [10. Compaction falls behind](#10-compaction-falls-behind) |非紧急| 1000多个岗位等待2小时。 |
| [11. Compaction stops or fails](#11-compaction-stops-or-fails) |非紧急|作业等待但没有运行 30 分钟，或者大多数作业都会失败。 |
| [12. A component has no pods](#12-a-component-has-no-pods) |紧急| SmithDB 组件在 10 分钟内没有可用的 Pod。 |
| [13. Pods restart often](#13-pods-restart-often) |非紧急| SmithDB 或摄取队列 Pod 在 30 分钟内重新启动 3 次或更多次。 || [14. SmithDB panics](#14-smithdb-panics) |非紧急| 15 分钟内某个组件发生超过 3 次恐慌。 |

## 创建警报之前

收集 SmithDB、LangSmith 摄取和基础设施指标以及 SmithDB 日志。参见[Configure SmithDB observability](/langsmith/self-host-smithdb-observability)。

此页面使用 SmithDB 和 LangSmith 公开的指标和标签名称。您的监控平台可以更改它们：

* **前缀**：您的集合配置可以向 SmithDB 指标添加前缀，例如 `smithdb.`。只有 SmithDB 指标才会有此前缀。以 `langsmith_` 开头的指标保留其名称。
* **后缀**：直方图的请求计数可以以`_count`或`.count`结尾。以 `_total` 结尾的计数器可以改为以 `.count` 结尾，例如 `langsmith_ingest_task_failures.count`。
* **标签值**：您的平台可以将标签值更改为小写，例如 `/query.QueryService/` 到 `/query.queryservice/`。使用您的平台显示的值。

在每种情况下，仅选择安装的 Pod，例如按 Kubernetes 命名空间。如果多个集群中存在相同的命名空间名称，也请选择该集群。某些条件适用于每个 SmithDB 部署或 Pod。要选择它们，请匹配包含 `smithdb` 的名称，而不是以其开头的名称。 Helm 图表在 `smithdb` 之前添加版本名称，例如 `langsmith-smithdb-query`。

每个条件都有一个窗口。对于计数或根据计数计算出的百分比，请使用窗口中的总计。对于其他值，条件会告诉您要使用窗口中的哪个值，例如最大值或平均值。对于窗口中的每个值，某些条件都必须成立。

此页面上的阈值是起始值。大多数安装的百分比（警报 5、6 和 11）相似。计数（例如警报 10）取决于您的音量。

## 摄入警报

LangSmith 平台后端将每个新运行放入 Redis 中。然后摄取队列工作人员将运行写入 SmithDB。 LangSmith 默认6小时后删除Redis中的运行数据。这次设置 Helm 值 `config.settings.redisRunsExpirySeconds`。本节中的警报确保运行在此时到达 SmithDB。

### 1. 跑分丢失

紧急

**检测**：LangSmith 接受但不存储的运行。警报 1 和 2 是数据丢失后触发的唯一警报。所有其他警报都会在他们之前触发。原因有两个：* 运行任务的最后一次尝试失败。它的运行失败了。
* Redis 内存不足并逐出密钥。这是一种可能的损失，因为 Redis 还保存着未运行的键。驱逐是对失败的最近警告。

**条件**：此警报有两个条件。为每个创建一个警报。失败计数仅在第一次失败后才存在，因此在指标丢失时不要发出警报。

* 最后尝试失败：当运行任务的 [⟦T13⟧](/langsmith/self-host-smithdb-metrics#langsmith_ingest_task_failures_total) 与 `attempt="12"` 在 15 分钟内增加时，非常严重。运行任务具有 `task` 标签 `persist_run_or_parent`、`persist_batched_runs`、`upgrade_batched_runs` 或 `otel_rootless_topology`。 LangSmith 再次尝试这些任务 12 次。第一次尝试有`attempt="0"`，所以`attempt="12"`是最后一次尝试。
* 逐出：当 Redis 逐出键（`evicted_keys` 中的`INFO stats`）在 5 分钟内增加时至关重要。

如果 Redis 逐出键，请增加其内存。如果运行任务最后一次尝试失败，则写入 SmithDB 会失败大约 2.5 小时。要查找原因，请参阅[Writes to SmithDB fail or are slow](/langsmith/self-host-smithdb-common-issues#writes-to-smithdb-fail-or-are-slow)。

### 2. 反馈丢失

紧急

**检测**：LangSmith接受了但不存储的反馈。反馈任务上次尝试失败，其反馈将丢失。尝试次数取决于反馈任务的类型。**条件**：对于以下任务之一，当 [⟦T24⟧](/langsmith/self-host-smithdb-metrics#langsmith_ingest_task_failures_total) 在 15 分钟内增加时，至关重要：

* `task="persist_batched_feedbacks"` 与 `attempt="12"`。
* `task="smithdb_feedback_mutation"` 或 `task="coalesced_smithdb_feedbacks"` 与 `attempt="25"`。

当反馈运行尚未被摄取时，`persist_batched_feedbacks`不计为失败。如果其最后一次尝试因此失败，则反馈将丢失，但失败计数不会增加。因此，还要为 `task="persist_batched_feedbacks"` 和 `attempt="11"` 创建警告。此尝试的失败通常是此任务失去反馈之前的最后信号。

失败计数仅在第一次失败后才存在，因此当指标丢失时不要发出警报。

反馈写入在查询 Pod 上运行，或者在突变服务上运行（如果启用）。要查找原因，请参阅[One kind of query load slows down other queries](/langsmith/self-host-smithdb-common-issues#one-kind-of-query-load-slows-down-other-queries)。

### 3. 摄取积压变得过时

紧急

**检测**：运行在到达 SmithDB 之前在 Redis 中等待太长时间。新的跟踪在 UI 中出现较晚，并且运行越来越接近 LangSmith 删除它们的时间。最旧的待处理任务的年龄是摄取无法跟上的第一个迹象。但每次重试后，年龄都会重新开始，因此当写入失败并且运行接近删除时间时，年龄可以保持较低水平。重试计数检测这种情况，包括未到达 SmithDB 的故障，例如阻止连接的代理。年龄并不显示 LangSmith 删除运行之前还剩多少时间。不要等到接近 6 小时。

**条件**：此警报有两个条件。为每一项创建一个警报：

* 待定年龄：[⟦T33⟧](/langsmith/self-host-smithdb-metrics#langsmith_asynq_queue_latency_seconds) 对于带有以 `ingestion` 开头的 `queue` 标签的队列。使用这些队列中的最大值。警告：超过 600 秒（10 分钟）。严重：超过 1,800 秒（30 分钟）。窗口期：10分钟。使用窗口中的最大值。
* 重试：[⟦T36⟧](/langsmith/self-host-smithdb-metrics#langsmith_asynq_ingestion_queue_retry)。每个 Pod 报告相同的值，因此请使用 Pod 之间的最大值。警告：超过 100 个。严重：超过 1,000 个。窗口期：30分钟。窗口中的每个值都必须高于阈值。

要查找原因，请参阅[LangSmith ingestion falls behind](/langsmith/self-host-smithdb-common-issues#find-the-cause-of-the-backlog)。

### 4. Redis 快满了

紧急**检测**：Redis内存接近`maxmemory`。 Redis 保存着摄取队列和 6 小时的运行数据，因此积压的数据填满了它。极限时会发生什么取决于`maxmemory-policy`。使用`volatile-lru`，Redis 会逐出具有过期时间的键，例如运行数据，并且运行可能会丢失（警报[1](#1-runs-are-lost)）。使用 `noeviction`，Redis 会拒绝新的写入，并且在不增加 `evicted_keys` 的情况下摄取会失败。当仍有时间添加内存时会触发此警报。

**条件**：每个节点使用的 Redis 内存占`maxmemory`的百分比。托管 Redis 服务通常直接报告此百分比。警告：超过80%。严重：超过90%。窗口期：10分钟。使用窗口中的最大值。

要查找原因，请参阅[LangSmith ingestion falls behind](/langsmith/self-host-smithdb-common-issues#find-the-cause-of-the-backlog)。如果没有积压，则增加Redis的内存。

## 写入和查询警报

SmithDB 摄取将运行作为段写入对象存储。它在 Metastore（一个 PostgreSQL 数据库）中记录每个段的元数据。查询池读取 UI、API 和自动化的段。查询池是查询服务或[dedicated query service](/langsmith/self-host-smithdb-scale#dedicated-query-services)，例如统计查询。每个池都是一个单独的部署并独立扩展。欲了解更多信息，请参阅[How SmithDB handles data](/langsmith/self-host-smithdb-data-paths)。

### 5. 写入失败

紧急**检测**：从摄取队列工作线程写入 SmithDB 失败。 LangSmith 再次尝试从 Redis 进行失败的写入，因此它们首先会导致重试，然后会导致运行丢失。通常，不到 0.1% 的写入失败。错误率持续存在意味着 SmithDB 无法使数据持久化。

**条件**：使用名称包含 `smithdb-ingestion` 的 Deployment 的请求计数 [⟦T43⟧ on ingestion pods](/langsmith/self-host-smithdb-metrics#server_requests_duration-on-ingestion-pods)。仅计算带有 `type="grpc"` 和以 `/ingestion.IngestionService/` 开头的 `path` 的请求。 `status`标签是gRPC代码，其中`0`是成功。使用另一个`status`计算请求占所有请求的百分比。窗口期：15分钟。

* 警告：超过 1%。
* 严重：超过 5%，并且至少有 50 个失败请求。最小计数可防止流量很少时发出警报。

要查找原因，请参阅[Writes to SmithDB fail or are slow](/langsmith/self-host-smithdb-common-issues#writes-to-smithdb-fail-or-are-slow)。

### 6.查询失败

紧急

**检测**：对 SmithDB 查询池的请求失败、超时或 SmithDB 拒绝它们。用户会看到跟踪、运行和项目统计信息的错误或空白页面，并且自动化失败。该条件适用于每个池，以显示哪种类型的负载失败。**条件**：使用[⟦T51⟧ on query pods](/langsmith/self-host-smithdb-metrics#server_requests_duration-on-query-pods)的请求计数，以及以`/query.QueryService/`开头的`path`。计算每个部署的失败请求占所有请求的百分比。警告：超过 5%。严重：超过10%。窗口期：15分钟。

这些 `status` 值是失败：`4`（超时）、`8`（拒绝）、`2`、`13` 和 `error`（内部错误）、`14`（不可用）、`15`（数据）丢失）和`timeout`（服务器超时）。不要计算`1`和`cancelled`，这通常意味着用户关闭了页面。也不计算客户端错误，例如 `3`（无效参数）。

在流量较小的安装中，少量故障可能占很大比例。如果警报状态更改过于频繁，请添加最小计数，如警报 [5](#5-writes-fail) 中。

要查找原因，请参阅[Slow or failed queries](/langsmith/self-host-smithdb-common-issues#find-the-cause-of-slow-or-failed-queries)。

### 7. 元存储已饱和

紧急

**检测**：SmithDB 元存储 (PostgreSQL) 没有足够的连接、CPU 或存储。缓慢的元存储会使摄取、查询和压缩同时变慢。当没有更多连接或没有更多存储时，写入会失败。**条件**：此警报具有三个条件。从您的数据库监控或云提供商为每个警报创建一个警报：

* 正在使用的连接数，以 `max_connections` 的百分比表示。警告：超过80%。严重：超过90%。窗口期：5分钟。使用窗口中的最大值。
* CPU 使用。警告：超过 60%。严重：超过80%。窗口期：15分钟。使用窗口中的平均值。
* 使用的存储空间。严重：超过85%。窗口期：30分钟。使用窗口中的最大值。如果您的提供商仅报告可用存储空间，请使用窗口中的最小值，并根据卷大小设置阈值，例如小于 10 GiB 的可用存储空间。如果 Aurora 和 AlloyDB 的存储自动增加，请勿对它们使用此条件。

要查找原因，请参阅[The metastore runs out of capacity](/langsmith/self-host-smithdb-common-issues#the-metastore-runs-out-of-capacity)。

### 8.写入速度慢

非紧急**检测**：SmithDB 摄取需要比平常更多的时间来存储新运行。批处理延迟是指从运行到达 SmithDB 摄取到 SmithDB 将它们写入对象存储并将段元数据记录在元存储中的时间。它包括一个短暂的等待，因为 SmithDB 在写入之前收集运行。大约 0.5 到 0.7 秒的中位数是健康的。

此警报是警报 [3](#3-the-ingestion-backlog-gets-old) 和 [5](#5-writes-fail) 的早期警告。当写入缓慢时，摄取队列工作人员会等待，Redis 积压会增加，然后写入会失败。

**条件**：[⟦T67⟧](/langsmith/self-host-smithdb-metrics#ingest_batch_latency)的中位数（p50）。警告：超过 1.6 秒。严重：超过2秒。窗口期：15分钟。使用窗口中的平均值。

要查找原因，请参阅[Writes to SmithDB fail or are slow](/langsmith/self-host-smithdb-common-issues#writes-to-smithdb-fail-or-are-slow)。

### 9. 查询速度慢

非紧急

**检测**：对查询池的请求速度缓慢。 UI 中的页面加载缓慢，并且更多请求超时。通常，查询在失败之前会很慢（警报[6](#6-queries-fail)）。原因通常是后期后台工作，通常是压缩，这更容易及早纠正。**条件**：对于每个部署，[⟦T68⟧ on query pods](/langsmith/self-host-smithdb-metrics#server_requests_duration-on-query-pods) 的 p95。使用以 `/query.QueryService/` 开头的 `path` 的请求，反馈写入和删除除外（`/query.QueryService/IngestFeedback` 和 `/query.QueryService/DeleteRuns`）。警告：超过 10 秒。严重：超过20秒。窗口期：15分钟。使用窗口中的平均值。

要查找原因，请参阅[Slow or failed queries](/langsmith/self-host-smithdb-common-issues#find-the-cause-of-slow-or-failed-queries)。

## 压缩警报

压缩将摄取过程中的许多小片段合并为更少、更大的片段。它还应用删除和保留。当压缩落后时，每个查询必须读取更多段。

### 10. 压缩落后

非紧急

**检测**：许多压缩作业等待很长时间。工作人员完成的工作量少于压缩调度程序计划的工作量。短峰值很常见，例如在大量删除之后。持续数小时的积压会使查询每天变慢，然后导致失败。它还增加了存储空间。

**条件**：[⟦T73⟧](/langsmith/self-host-smithdb-metrics#compaction_queue_job_count) 与 `status="pending"`，所有工作类型的总和。关键：1000多个就业岗位。以此值开始。然后将其设置为平时每日峰值的 3 至 5 倍。窗口期：2小时。窗口中的每个值都必须高于阈值。如果压缩工作线程达到最大副本数，请增加最大值。要查找原因，请参阅[Late compaction](/langsmith/self-host-smithdb-common-issues#find-the-cause-of-late-compaction)。

### 11. 压缩停止或失败

非紧急

**检测**：对于一种作业或所有作业，压缩没有任何进展。警报 [10](#10-compaction-falls-behind) 仅在大量积压后触发。此警报提前检测到句号。当一种工作类型一次又一次失败时，它的工作对于工人的记忆来说往往太大了。

**条件**：此警报有两个条件。为每一项创建一个警报：

* 停止：当 [⟦T75⟧](/langsmith/self-host-smithdb-metrics#compaction_queue_job_count) 和 `status="pending"` 大于 0，且所有 Worker 的 [⟦T77⟧](/langsmith/self-host-smithdb-metrics#compaction_worker_running_tasks) 之和为 0 时，非常重要。如果没有 Worker 报告正在运行的任务，则使用 0。 窗口：30 分钟。对于窗口中的每个值，两者都必须为真。
* 失败：对于每个以 `_compaction` 结尾的 `job_kind`，[⟦T78⟧](/langsmith/self-host-smithdb-metrics#compaction_job_completion) 和 `status="failure"` 的计数占所有作业计数的百分比。警告：超过 20%。严重：超过50%。窗口期：1小时。单一故障是常见的。在健康的安装中，每种类型的作业失败率均低于 2%。

要查找原因，请参阅[Late compaction](/langsmith/self-host-smithdb-common-issues#find-the-cause-of-late-compaction)。

## SmithDB Pod 警报每个 SmithDB 组件（例如摄取或查询）都作为其自己的部署运行。这些警报检测没有可用 Pod 的组件、重新启动的 Pod 以及 SmithDB 中的内部错误。警报 13 还涵盖了摄取队列 Pod，因为它们将所有运行写入 SmithDB。

### 12. 组件没有 pod

紧急

**检测**：SmithDB 部署没有可用的 Pod。可能的原因：Pod 崩溃、Kubernetes 无法调度它们、它们未通过就绪性检查或 Deployment 有 0 个副本。没有 Pod 的组件不会发送指标，因此使用其指标的警报不会触发。例如，如果没有查询 Pod，警报 6 和 9 将不会获取任何数据。如果没有压缩调度程序，警报 10 和 11 不会获取任何数据。

**条件**：来自 Kubernetes 的每个 SmithDB 部署的可用副本。严重：少于 1。窗口：10 分钟。窗口中的每个值都必须低于阈值。当指标缺失时也会发出警报。排除您故意扩展到 0 个副本的每个部署。例如，如果您将 SmithDB 迁移作为部署而不是作业运行，请排除名称包含 `smithdb-migration` 的部署。

要查找原因，请参阅[SmithDB pods are not healthy](/langsmith/self-host-smithdb-common-issues#smithdb-pods-are-not-healthy)。### 13.Pod 经常重启

非紧急

**检测**：SmithDB Pod 或摄取队列 Pod 重新启动多次。通常，Pod 使用的内存超过其限制（OOM 终止）。重新启动会停止正在进行的工作：写入、查询和压缩作业。重新启动通常是组件太小的第一个迹象。

**条件**：来自 Kubernetes 的每个 SmithDB pod 和每个摄取队列 pod 的容器重启计数增加。按包含 `ingest-queue` 的部署名称选择摄取队列 Pod。计数只会增加，因此 Kubernetes 替换的 Pod 不会隐藏新的重启。排除与警报[12](#12-a-component-has-no-pods)中相同的部署。警告：1.重新启动。严重：重新启动 3 次或以上。窗口期：30分钟。

要查找原因，请参阅[SmithDB pods are not healthy](/langsmith/self-host-smithdb-common-issues#smithdb-pods-are-not-healthy)。

### 14.SmithDB 恐慌

非紧急

**检测**：SmithDB 组件出现意外内部错误（恐慌）。恐慌始终是一种缺陷。根据发生的位置，请求失败、后台任务停止或 Pod 重新启动。如果 Pod 没有重新启动，指标不会显示恐慌。因此，此警报使用 SmithDB 日志而不是指标，并且仅在这些日志到达时才起作用。**条件**：对于每个 SmithDB 部署，SmithDB 日志行具有 `backtrace` 字段或包含 `thread panicked`。 JSON 日志具有 `backtrace` 字段。纯文本日志包含文本。不要计算包含消息 `Runtime dropped task without completing it` 的行数。此消息是在同一 Pod 中发生不同故障后出现的，因此警报会将故障计数两次。警告：1恐慌。严重：超过 3 个恐慌。窗口期：15分钟。

要查找同一组件中对用户的影响，请检查警报 [5](#5-writes-fail)、[6](#6-queries-fail) 和 [13](#13-pods-restart-often)。

## 另请参阅

* [Diagnose common SmithDB issues](/langsmith/self-host-smithdb-common-issues)：如何查找警报或报告问题的原因以及要更改的内容。
* [Essential SmithDB metrics](/langsmith/self-host-smithdb-metrics)：每个指标衡量什么以及如何查询。
* [Monitor self-hosted LangSmith with Datadog or Grafana](/langsmith/self-host-observability-dashboards)：仪表板以及如何收集数据。
* [Configure SmithDB observability](/langsmith/self-host-smithdb-observability)：指标、日志和跟踪。
* [How SmithDB handles data](/langsmith/self-host-smithdb-data-paths)：写入、读取、删除和压缩路径。
* [Configure SmithDB for scale](/langsmith/self-host-smithdb-scale)：层、自动缩放、专用查询服务和元存储容量。
* [Troubleshoot SmithDB](/langsmith/self-host-smithdb-troubleshooting)：基础设施问题以及联系支持人员之前需要收集的信息。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-smithdb-alerts.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。