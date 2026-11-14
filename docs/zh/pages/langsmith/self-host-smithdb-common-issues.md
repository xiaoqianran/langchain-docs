<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Common SmithDB issues to monitor | https://docs.langchain.com/langsmith/self-host-smithdb-common-issues -->

# 要监控的常见 SmithDB 问题

检查自托管 LangSmith 的第一个指标，以及如何检测和修复生产中最常发生的 SmithDB 问题。

使用这些信号来判断 SmithDB 的摄取、查询和压缩是否正常，以及首先调查哪个区域。对于下面的每个常见问题，该页面列出了要监控的信号、如何查找原因以及要更改的内容。有关每个指标衡量的内容以及如何使用它，请参阅[Essential SmithDB metrics](/langsmith/self-host-smithdb-metrics)。

## 检查 SmithDB 健康状况

下面的每个症状都列出了显示它的指标。要查找原因，请阅读 [Essential SmithDB metrics](/langsmith/self-host-smithdb-metrics) 中该指标的部分。

* **跟踪在 SDK 发送后才出现**：[⟦T0⟧](/langsmith/self-host-smithdb-metrics#langsmith_ingestion_e2e_latency_seconds)。参见[LangSmith ingestion falls behind](#langsmith-ingestion-falls-behind)。
* **写入失败并继续重试**：[⟦T1⟧](/langsmith/self-host-smithdb-metrics#langsmith_asynq_ingestion_queue_retry)。参见[LangSmith ingestion falls behind](#langsmith-ingestion-falls-behind)。
* **新运行需要很长时间才能在 SmithDB 中持久化**：[⟦T2⟧](/langsmith/self-host-smithdb-metrics#ingest_batch_latency)。继续[SmithDB ingestion metrics](/langsmith/self-host-smithdb-metrics#smithdb-ingestion)。
* **摄取积压增加且不会耗尽**：[⟦T3⟧](/langsmith/self-host-smithdb-metrics#ingest_pending_segment_entry_count)。继续[SmithDB ingestion metrics](/langsmith/self-host-smithdb-metrics#smithdb-ingestion)。
* **UI 或 API 读取跟踪很慢**：[⟦T4⟧ on query pods](/langsmith/self-host-smithdb-metrics#server_requests_duration-on-query-pods)。参见[Compaction falls behind and queries get slow](#compaction-falls-behind-and-queries-get-slow)和[One kind of query load slows down other queries](#one-kind-of-query-load-slows-down-other-queries)。
* **压实工人完成的工作少于调度程序计划**：[⟦T5⟧, ⟦T6⟧](/langsmith/self-host-smithdb-metrics#compaction_jobs_scheduled-compaction_jobs_executed)。参见[Compaction falls behind and queries get slow](#compaction-falls-behind-and-queries-get-slow)。
* **一种压缩作业类型一次又一次失败**：[⟦T7⟧](/langsmith/self-host-smithdb-metrics#compaction_job_completion)。
* **压实持续数小时**：[⟦T8⟧](/langsmith/self-host-smithdb-metrics#compaction_queue_job_count)。参见[Compaction falls behind and queries get slow](#compaction-falls-behind-and-queries-get-slow)。## LangSmith 摄取落后

LangSmith 将每个新运行保留在 Redis 中，直到摄取队列工作程序将其写入 SmithDB。如果摄取无法跟上，Redis 中的队列就会增加，并且用户会看到其运行较晚。如果队列太旧，或者 Redis 已满，LangSmith 会丢失运行。

### 监控摄取积压

* **失分**：[⟦T9⟧](/langsmith/self-host-smithdb-metrics#langsmith_asynq_ingestion_queue_archived)。每次增加都意味着跑动次数的减少。每次增加时发出警报。
* **积压**：[⟦T10⟧](/langsmith/self-host-smithdb-metrics#langsmith_asynq_ingestion_queue_pending)。与您的正常流量进行比较。在流量稳定的情况下队列增加是一个问题。
* **写入失败**：[⟦T11⟧](/langsmith/self-host-smithdb-metrics#langsmith_asynq_ingestion_queue_retry)。值保持高值意味着写入 SmithDB 失败。
* **积压的年龄**：[⟦T12⟧](/langsmith/self-host-smithdb-metrics#langsmith_asynq_queue_latency_seconds)。 LangSmith在`config.settings.redisRunsExpirySeconds`设置的时间后删除Redis中的运行数据，默认6小时。重试不会延长此时间。早在年龄临近之前就发出警报。
* **Redis**：内存使用量及其限制、逐出的键以及每个分片的 CPU。任何驱逐都意味着 Redis 删除了 LangSmith 仍然需要的数据。

###查找积压的原因|你所看到的|原因 |
| - | - |
|待处理队列和[⟦T14⟧](/langsmith/self-host-smithdb-metrics#langsmith_ingestion_api_to_worker_latency_seconds)增加。重试和 [⟦T15⟧](/langsmith/self-host-smithdb-metrics#langsmith_ingestion_worker_to_store_latency_seconds) 保持稳定。 |没有足够的摄取队列工作人员。 |
|重试或 `langsmith_ingestion_worker_to_store_latency_seconds` 增加。 |写入缓慢或失败。继续[SmithDB ingestion metrics](/langsmith/self-host-smithdb-metrics#smithdb-ingestion)。 |
| Redis 内存已接近其极限，或者 Redis 逐出键。 | Redis 对于积压来说太小了。 |
|一个 Redis 分片比其他分片使用更多的 CPU。 |队列负载位于一个分片上。更多的工作人员会为该分片添加更多的连接。 |

### 减少积压* **根据队列长度缩放摄取队列工作人员。**工作人员主要等待网络，因此当队列增加时，它们的 CPU 保持较低水平。使用 CPU 的自动缩放器不会添加工作线程。启用[KEDA for the ingest queue](/langsmith/self-host-scale#keda-autoscaling-for-langsmith-queues)，它可以缩放队列长度。如果 NetworkPolicy 限制命名空间中的流量，请确保 KEDA 仍然可以读取队列长度。如果不能，KEDA 不会扩展工作线程，也不会显示错误。
* **根据峰值负载设置最大副本计数。** 图表的默认最大值是一个起点，而不是负载的值。每个工作进程都会打开与 Redis 的连接，因此请小步增加最大值并监视最繁忙的 Redis 分片的 CPU。
* **确定 Redis 的积压大小。** Redis 必须保留所有挂起的运行，直到工作线程写入它们，包括写入速度较慢时。如果其内存接近限制，或者驱逐键，请使用更大的 Redis 实例。
* **如果写入缓慢或失败，则扩展 SmithDB 摄取**。参见[Configure SmithDB for scale](/langsmith/self-host-smithdb-scale)。

## 压缩落后并且查询变慢SmithDB 摄取会写入许多小段。压缩将它们合并成更少、更大的段。如果压缩落后，每个查询必须打开更多段。然后查询会变慢、超时或 SmithDB 拒绝查询。

### 监控压缩和查询

对于压实：

* **待处理的作业**：[⟦T17⟧](/langsmith/self-host-smithdb-metrics#compaction_queue_job_count) 与 `status="pending"`。值在数小时内保持较高水平意味着压缩已晚。
* **最早的待处理作业**：[⟦T19⟧](/langsmith/self-host-smithdb-metrics#compaction_queue_oldest_pending_created_at_seconds)。年龄不断增加意味着压实跟不上。
* **工人容量**：[⟦T20⟧ and ⟦T21⟧](/langsmith/self-host-smithdb-metrics#compaction_worker_capacity_used-compaction_worker_capacity_limit)。如果大多数工人都处于接近极限的状态，那么工作就会等待。
* **工作程序重新启动**：OOM 杀死了压缩工作程序 Pod。重新启动的工作线程会丢失其正在运行的作业，并且压缩不会取得进展。

对于查询：

* **扫描分区**：[⟦T22⟧](/langsmith/self-host-smithdb-metrics#query_fanout_partitions)。如果 p99 在流量稳定时增加，则压缩通常会延迟。
* **拒绝查询**：[⟦T23⟧](/langsmith/self-host-smithdb-metrics#query_fanout_limit_exceeded_total)。连续的速率意味着用户查询失败。
* **缓慢且失败的请求**：[⟦T24⟧ on query pods](/langsmith/self-host-smithdb-metrics#server_requests_duration-on-query-pods)。按`status`拆分：`4`是超时的请求，`1`是被取消的请求。

### 查找查询慢的原因

由于其他原因，查询也会变慢。在缩放压缩之前，请比较这些信号：|你所看到的|原因 |
| - | - |
|扫描分区和待处理的压缩作业增加。 |压实已晚。 |
| [admission queue](/langsmith/self-host-smithdb-metrics#query_admission_queue_length) 不为空，它拒绝请求，或者查询 Pod 被 OOM 杀死。 |查询 Pod 没有足够的内存。参见[One kind of query load slows down other queries](#one-kind-of-query-load-slows-down-other-queries)。 |
| [⟦T28⟧](/langsmith/self-host-smithdb-metrics#object_store_op_duration) 所有组件同时增加。 |对象存储或其网络速度很慢。 |
|只是有些请求比较慢，而且覆盖的时间范围比较广。 |查询读取了太多数据。 |

### 帮助压实跟上* **添加压缩工作线程。** 默认情况下，自动缩放器在 CPU 上缩放压缩工作线程，而不是在挂起的作业上。要扩展待处理的作业，请参阅[Scale with KEDA instead](/langsmith/self-host-smithdb-scale#scale-with-keda-instead)。如果工作线程达到最大副本数，请增加最大值。
* **如果压缩工作人员被 OOM 杀死，或者如果他们中的大多数人保持在其容量限制附近，则为他们提供更多内存**。 Worker 容量是 Pod 内存限制的 80%，因此更多内存可以运行更大的作业。选择更大的[tier](/langsmith/self-host-smithdb-scale#baseline-tiers)或设置compactionworker的资源。
* **限制查询的时间范围。** 无开始时间查询的脚本和API客户端使得SmithDB读取全天的数据。
* **使用基于时间的跟踪 ID。** 如果您的应用程序设置自己的运行或跟踪 ID，请使用 UUIDv7 值。 SmithDB 使用 ID 中的时间来查找跟踪的数据。随机 ID（例如 UUIDv4）使查询和删除读取更多数据。

## 一种查询负载会减慢其他查询的速度

在集群模式下，查询服务为所有 SmithDB 读取提供服务。一种重负载（例如在大型项目上运行统计信息）可能会减慢所有其他查询的速度。 [Dedicated query services](/langsmith/self-host-smithdb-scale#dedicated-query-services) 将一种负载移动到其自己的 Pod 中，以便您可以单独调整其大小和缩放。对于大型部署，例如大型[tier](/langsmith/self-host-smithdb-scale#baseline-tiers)，启用专用查询服务。每个服务都需要自己的副本以及查询层的资源。

对于较小的部署，当您看到下表中的信号时启用服务。要查找使用查询 Pod 的请求类型，请将 [⟦T29⟧ on query pods](/langsmith/self-host-smithdb-metrics#server_requests_duration-on-query-pods) 除以 `path`。

|服务 |启用它时 |
| - | - |
|统计查询 |项目页面和仪表板加载缓慢，其他查询同时变慢。当用户打开运行多次或时间范围较长的项目时，查询 Pod 会耗尽内存，或者 SmithDB 会拒绝带有 [⟦T31⟧](/langsmith/self-host-smithdb-metrics#query_fanout_limit_exceeded_total) 的查询。 |
|突变|当查询 Pod 处于负载状态时，反馈和运行删除失败或延迟。摄取队列日志显示代码为 `Unavailable` 的 `IngestFeedback` 错误。如果没有此服务，反馈写入和删除将在查询 Pod 上运行。当这些 Pod 重新启动时，反馈写入也会失败。 |
|运行规则|您有许多自动化规则或在线评估器，并且规则运行时查询延迟会增加。再次尝试超时的规则查询，这会增加 SmithDB 和 LangSmith PostgreSQL 数据库的负载。 |查询 Pod 通常会使用所有内存，而 CPU 却保持较低水平。在这种情况下，使用 CPU 的自动缩放器不会添加副本。设置可容纳正常负载的最小副本数，或为 Pod 提供更多内存。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-smithdb-common-issues.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。