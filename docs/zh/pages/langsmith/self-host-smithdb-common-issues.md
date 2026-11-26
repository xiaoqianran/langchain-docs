<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Diagnose common SmithDB issues | https://docs.langchain.com/langsmith/self-host-smithdb-common-issues -->

# 诊断常见的 SmithDB 问题

如何查找自托管 LangSmith 生产中最常出现的 SmithDB 问题的原因，以及需要更改的内容。

当警报触发或用户报告问题时使用此页面。每个问题都列出了如何查找原因以及要更改的内容。有关何时发出警报的信息，请参阅[Recommended SmithDB alerts](/langsmith/self-host-smithdb-alerts)。有关每个指标衡量的内容，请参阅[Essential SmithDB metrics](/langsmith/self-host-smithdb-metrics)。

## 从症状开始

如果用户报告问题，请查找以下症状。然后转到它链接到的问题。

* **跟踪在 SDK 发送之后才出现**：[⟦T0⟧](/langsmith/self-host-smithdb-metrics#langsmith_ingestion_e2e_latency_seconds)。参见[LangSmith ingestion falls behind](#langsmith-ingestion-falls-behind)。
* **写入失败并继续重试**：[⟦T1⟧](/langsmith/self-host-smithdb-metrics#langsmith_asynq_ingestion_queue_retry)。参见[Writes to SmithDB fail or are slow](#writes-to-smithdb-fail-or-are-slow)。
* **新运行需要很长时间才能在 SmithDB 中持久化**：[⟦T2⟧](/langsmith/self-host-smithdb-metrics#ingest_batch_latency)。参见[Writes to SmithDB fail or are slow](#writes-to-smithdb-fail-or-are-slow)。
* **SmithDB 摄取积压不断增长且不会耗尽**：[⟦T3⟧](/langsmith/self-host-smithdb-metrics#ingest_pending_segment_entry_count)。参见[Writes to SmithDB fail or are slow](#writes-to-smithdb-fail-or-are-slow)。
* **UI 或 API 读取跟踪缓慢或失败**：[⟦T4⟧ on query pods](/langsmith/self-host-smithdb-metrics#server_requests_duration-on-query-pods)。参见[Compaction falls behind and queries get slow](#compaction-falls-behind-and-queries-get-slow)和[One kind of query load slows down other queries](#one-kind-of-query-load-slows-down-other-queries)。
* **压实会持续数小时，或者一种作业类型一次又一次失败**：[⟦T5⟧](/langsmith/self-host-smithdb-metrics#compaction_queue_job_count) 和 [⟦T6⟧](/langsmith/self-host-smithdb-metrics#compaction_job_completion)。参见[Compaction falls behind and queries get slow](#compaction-falls-behind-and-queries-get-slow)。
* **摄取、查询和压缩同时很慢**：PostgreSQL CPU、连接和存储。参见[The metastore runs out of capacity](#the-metastore-runs-out-of-capacity)。
* **SmithDB Pod 重新启动、崩溃或不启动**：请参阅 [SmithDB pods are not healthy](#smithdb-pods-are-not-healthy)。

## LangSmith 摄取落后LangSmith 将每个新运行保留在 Redis 中，直到摄取队列工作程序将其写入 SmithDB。如果摄取无法跟上，Redis 中的队列就会增加，并且用户会看到其运行较晚。 LangSmith在`config.settings.redisRunsExpirySeconds`设置的时间后删除Redis中的运行数据，默认6小时。重试不会延长此时间。如果队列太旧，或者 Redis 已满，LangSmith 会丢失运行。

**警报**：[1. Runs are lost](/langsmith/self-host-smithdb-alerts#1-runs-are-lost)、[3. The ingestion backlog gets old](/langsmith/self-host-smithdb-alerts#3-the-ingestion-backlog-gets-old)、[4. Redis is almost full](/langsmith/self-host-smithdb-alerts#4-redis-is-almost-full)。

###查找积压的原因

|你所看到的|原因 |
| - | - |
|待处理队列和[⟦T8⟧](/langsmith/self-host-smithdb-metrics#langsmith_ingestion_api_to_worker_latency_seconds)增加。重试和 [⟦T9⟧](/langsmith/self-host-smithdb-metrics#langsmith_ingestion_worker_to_store_latency_seconds) 保持稳定。 |没有足够的摄取队列工作人员。 |
|重试或增加`langsmith_ingestion_worker_to_store_latency_seconds`。 |写入缓慢或失败。参见[Writes to SmithDB fail or are slow](#writes-to-smithdb-fail-or-are-slow)。 |
| Redis 内存已接近其极限，或者 Redis 逐出键。 | Redis 对于积压来说太小了。 |
|一个 Redis 分片比其他分片使用更多的 CPU。 |队列负载位于一个分片上。更多的工作人员会为该分片添加更多的连接。 |

### 减少积压* **根据队列长度缩放摄取队列工作人员。**工作人员主要等待网络，因此当队列增加时，它们的 CPU 保持较低水平。使用 CPU 的自动缩放器不会添加工作线程。启用[KEDA for the ingest queue](/langsmith/self-host-scale#keda-autoscaling-for-langsmith-queues)，它可以扩展队列长度。如果 NetworkPolicy 限制命名空间中的流量，请确保 KEDA 仍然可以读取队列长度。如果不能，KEDA 不会扩展工作线程，也不会显示错误。
* **根据峰值负载设置最大副本计数。** 图表的默认最大值是一个起点，而不是负载的值。每个工作进程都会打开与 Redis 的连接，因此请小步增加最大值并监视最繁忙的 Redis 分片的 CPU。
* **确定 Redis 的积压大小。** Redis 必须保留所有挂起的运行，直到工作线程写入它们，包括写入速度较慢时。如果其内存接近限制，或者它逐出密钥，请增加其内存。

## 写入 SmithDB 失败或缓慢

SmithDB 摄取将运行作为段写入对象存储，并在元存储中记录每个段的元数据。仅当两个步骤都成功时，写入才是持久的。如果写入失败，LangSmith会从 Redis 再次尝试写入，并且摄取积压会增加。**警报**：[5. Writes fail](/langsmith/self-host-smithdb-alerts#5-writes-fail)、[8. Writes are slow](/langsmith/self-host-smithdb-alerts#8-writes-are-slow)。

|你所看到的|原因 |
| - | - |
| [⟦T11⟧](/langsmith/self-host-smithdb-metrics#ingest_flush_count) 显示失败，[⟦T12⟧](/langsmith/self-host-smithdb-metrics#object_store_op_duration) 显示`put` 错误。 |对象存储拒绝写入。检查存储桶、其访问权限及其网络。 |
| `object_store_op_duration`的`put`延迟时间与[⟦T16⟧](/langsmith/self-host-smithdb-metrics#ingest_batch_latency)一起增加。 |对象存储或其网络速度很慢。 |
| [⟦T17⟧](/langsmith/self-host-smithdb-metrics#ingest_flush_duration) 增加，但对象存储保持快速。 |元存储很慢。参见[The metastore runs out of capacity](#the-metastore-runs-out-of-capacity)。 |
| [flush semaphores](/langsmith/self-host-smithdb-metrics#semaphore_permits_in_use-semaphore_max_permits) 已满，或者摄取盒 CPU 受到限制。 |摄取荚对于负载而言太小。添加副本，或选择更大的[tier](/langsmith/self-host-smithdb-scale#baseline-tiers)。 |
|摄取 Pod 重新启动。 | Pod 重新启动时保留的请求会失败。参见[SmithDB pods are not healthy](#smithdb-pods-are-not-healthy)。 |
| LangSmith 重试次数增加，但摄取 Pod 报告没有失败的请求。 |摄取队列无法连接到 SmithDB。在摄取队列日志中搜索`Unavailable`错误，并检查它们之间的所有代理和服务网格。 |

## 元存储容量不足元存储是 SmithDB 的 PostgreSQL 数据库。 SmithDB 记录它在元存储中写入的每个段的元数据。元存储还保存新的反馈，直到压缩移动它。缓慢的元存储会使摄取、查询和压缩同时变慢。当没有更多连接或没有更多存储时，写入会失败。

**警报**：[7. The metastore is saturated](/langsmith/self-host-smithdb-alerts#7-the-metastore-is-saturated)。

|你所看到的|原因 |
| - | - |
|接驳地点靠近`max_connections`。 |每个 SmithDB Pod 都有自己的连接池，因此更多副本使用更多连接。增加`max_connections`，或者添加连接池。 |
| CPU 保持高电平。 |在数据库监控中查找慢速查询。然后缩放实例。 |
|存储空间几乎已满。 |增加存储，除非 Aurora 或 AlloyDB 上的存储自动增加。 |

要调整元存储的大小，请参阅 [Metastore capacity](/langsmith/self-host-smithdb-scale#metastore-capacity)。

## 压缩落后并且查询变慢

SmithDB 摄取会写入许多小段。压缩将它们合并成更少、更大的段。如果压缩落后，每个查询必须打开更多段。然后查询会变慢、超时或 SmithDB 拒绝查询。

**警报**：[6. Queries fail](/langsmith/self-host-smithdb-alerts#6-queries-fail)、[9. Queries are slow](/langsmith/self-host-smithdb-alerts#9-queries-are-slow)、[10. Compaction falls behind](/langsmith/self-host-smithdb-alerts#10-compaction-falls-behind)、[11. Compaction stops or fails](/langsmith/self-host-smithdb-alerts#11-compaction-stops-or-fails)。

### 查找延迟压缩的原因|你所看到的|原因 |
| - | - |
|待处理的作业增加，压缩工作线程达到最大副本数。 |压实工人不够。 |
|大多数工人都呆在 [capacity limit](/langsmith/self-host-smithdb-metrics#compaction_worker_capacity_used-compaction_worker_capacity_limit) 附近，[oldest pending job](/langsmith/self-host-smithdb-metrics#compaction_queue_oldest_pending_created_at_seconds) 会变老。 |大量的工作等待着有足够空闲能力的工人。工人需要更多的内存。 |
|在[⟦T21⟧](/langsmith/self-host-smithdb-metrics#compaction_job_completion)中，一种作业类型一次又一次失败，并且压实工人被 OOM 杀死。 |这类工作对于工人的记忆来说太大了。在压缩工作日志中搜索 `Job failed` 和 `job_kind`。 |
|作业等待，但 [⟦T24⟧](/langsmith/self-host-smithdb-metrics#compaction_worker_running_tasks) 保持 0。 |工作人员不运行，或者无法连接到压缩调度程序。检查工作 Pod 和调度程序 Pod 是否重新启动。 |

### 查找查询缓慢或失败的原因

查询也可能因其他原因而变慢或失败。在缩放压缩之前，请比较这些信号：|你所看到的|原因 |
| - | - |
| [Scan partitions](/langsmith/self-host-smithdb-metrics#query_fanout_partitions) 和待处理的压实作业增加。 |压实已晚。 |
| [⟦T25⟧](/langsmith/self-host-smithdb-metrics#query_fanout_limit_exceeded_total) 增加。 |查询必须打开超过 10,000 个扫描分区。压缩较晚，或者客户端查询的时间范围非常宽。 |
| [admission queue](/langsmith/self-host-smithdb-metrics#query_admission_queue_length) 不为空，它是 [rejects requests](/langsmith/self-host-smithdb-metrics#query_admission_queue_rejections_total)，或者查询 Pod 被 OOM 杀死。 |查询 Pod 没有足够的内存。参见[One kind of query load slows down other queries](#one-kind-of-query-load-slows-down-other-queries)。 |
| SmithDB 拒绝查询 (`status` `8`)，但上面的拒绝计数器都没有增加。 |一项查询需要的内存多于一项操作可以使用的内存。在增加限制之前，按 `path` 拆分失败以查找请求类型。 |
| [⟦T29⟧](/langsmith/self-host-smithdb-metrics#object_store_op_duration) 所有组件同时增加。 |对象存储或其网络速度很慢。 |
|查询 Pod 重新启动。 | Pod 重新启动时保留的请求会失败。参见[SmithDB pods are not healthy](#smithdb-pods-are-not-healthy)。 |
|只是有些请求比较慢，而且覆盖的时间范围比较广。 |查询读取了太多数据。 |

### 帮助压实跟上* **添加压缩工作线程。** 默认情况下，自动缩放器在 CPU 上缩放压缩工作线程，而不是在挂起的作业上。要扩展待处理的作业，请参阅[Scale with KEDA instead](/langsmith/self-host-smithdb-scale#scale-with-keda-instead)。如果工作线程达到最大副本数，请增加最大值。
* **如果压缩工作人员被 OOM 杀死，或者如果他们中的大多数人保持在其容量限制附近，则为他们提供更多内存**。 Worker 容量是 pod 内存限制的 80%，因此更多内存可以运行更大的作业。选择更大的[tier](/langsmith/self-host-smithdb-scale#baseline-tiers)或设置compactionworker的资源。
* **限制查询的时间范围。** 无开始时间查询的脚本和API客户端使得SmithDB读取全天的数据。
* **使用基于时间的跟踪 ID。** 如果您的应用程序设置自己的运行或跟踪 ID，请使用 UUIDv7 值。 SmithDB 使用 ID 中的时间来查找跟踪的数据。随机 ID（例如 UUIDv4）使查询和删除读取更多数据。

## 一种查询负载会减慢其他查询的速度

在集群模式下，查询服务为所有 SmithDB 读取提供服务。一种重负载（例如在大型项目上运行统计信息）可能会减慢所有其他查询的速度。 [Dedicated query services](/langsmith/self-host-smithdb-scale#dedicated-query-services) 将一种负载移动到其自己的 Pod 中，以便您可以单独调整其大小和缩放。

**警报**：[2. Feedback is lost](/langsmith/self-host-smithdb-alerts#2-feedback-is-lost)。对于大型部署，例如大型[tier](/langsmith/self-host-smithdb-scale#baseline-tiers)，启用专用查询服务。每个服务都需要自己的副本以及查询层的资源。

对于较小的部署，当您看到下表中的信号时启用服务。要查找使用查询 Pod 的请求类型，请将 [⟦T30⟧ on query pods](/langsmith/self-host-smithdb-metrics#server_requests_duration-on-query-pods) 除以 `path`。

|服务 |启用它时 |
| - | - |
|统计查询 |项目页面和仪表板加载缓慢，其他查询同时变慢。当用户打开运行多次或时间范围较长的项目时，查询 Pod 会耗尽内存，或者 SmithDB 会拒绝带有 [⟦T32⟧](/langsmith/self-host-smithdb-metrics#query_fanout_limit_exceeded_total) 的查询。 |
|突变|当查询 Pod 处于负载状态时，反馈和运行删除失败或延迟。摄取队列日志显示 `IngestFeedback` 错误，代码为 `Unavailable`。如果没有此服务，反馈写入和删除将在查询 Pod 上运行。当这些 Pod 重新启动时，反馈写入也会失败。 |
|运行规则|您有许多自动化规则或在线评估器，并且规则运行时查询延迟会增加。再次尝试超时的规则查询，这会增加 SmithDB 和 LangSmith PostgreSQL 数据库的负载。 |查询 Pod 通常会使用所有内存，而 CPU 却保持较低水平。在这种情况下，使用 CPU 的自动缩放器不会添加副本。设置可容纳正常负载的最小副本数量，或为 Pod 提供更多内存。

## SmithDB pod 不健康

重新启动的 SmithDB Pod 会停止其正在进行的工作：写入、查询和压缩作业。没有可用 Pod 的组件不会发送指标，因此使用其指标的警报不会触发。

**警报**：[12. A component has no pods](/langsmith/self-host-smithdb-alerts#12-a-component-has-no-pods)、[13. Pods restart often](/langsmith/self-host-smithdb-alerts#13-pods-restart-often)、[14. SmithDB panics](/langsmith/self-host-smithdb-alerts#14-smithdb-panics)。

运行`kubectl describe pod <pod>`，使用`kubectl logs -p <pod>`读取上一个容器的日志。然后与这个表进行比较：|你所看到的|原因 |
| - | - |
| `Last State` 是`OOMKilled`。 |内存限制对于负载而言太低。增加该组件的内存，或选择更大的[tier](/langsmith/self-host-smithdb-scale#baseline-tiers)。将 [⟦T39⟧](/langsmith/self-host-smithdb-metrics#sys_jemalloc_resident_bytes) 与极限进行比较。 |
|吊舱保持`Pending`。 | Kubernetes 无法调度它。 CPU、内存或存储请求不适合节点。 |
| Pod 运行，但其就绪探测失败。 | SmithDB 进程未及时回复其运行状况检查。运行状况检查仅测试进程的响应。读取 Pod 的日志，检查其 CPU 和内存使用情况。 |
| Pod 无法提取其镜像。 |集群无法访问映像注册表，或者无法访问它。 |
| Pod 在启动时崩溃，其日志显示拒绝元存储连接或拒绝对象存储访问。 |与支持基础设施的连接失败。参见[Supporting infrastructure](/langsmith/self-host-smithdb-troubleshooting#supporting-infrastructure)。 |
| SmithDB 记录带有 `backtrace` 字段的行，或包含 `thread panicked` 的行。 |恐慌：SmithDB 内部缺陷。 |

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-smithdb-common-issues.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。