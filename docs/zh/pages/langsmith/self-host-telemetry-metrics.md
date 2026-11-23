<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Operational telemetry metrics reference | https://docs.langchain.com/langsmith/self-host-telemetry-metrics -->

# 操作遥测指标参考

自托管 LangSmith 发送到 LangChain 的每个操作指标、每个指标保留的属性以及如何关闭指标。

> [!注意]
>
> 此页面适用于未在离线（气隙）模式下运行且已打开操作遥测指标的自托管 LangSmith 实例。

将 `config.telemetry.metrics` 设置为 `true`（默认值）时，您的 LangSmith 实例将通过 OpenTelemetry (OTLP) 将操作指标导出到 `https://beacon.langchain.com`，每分钟一次。有关什么是操作遥测以及它与计费和使用遥测有何不同，请参阅[Egress for billing and operational telemetry](/langsmith/self-host-egress)。

LangChain 的遥测收集器仅保留此页面上列出的指标。它会删除收到的任何其他指标，因此不会存储不在此页面上的指标。指标包含计数、大小、持续时间和状态值。它们不包含跟踪内容、数据库记录或有关您的用户的信息。

## 如何收集指标|来源 |收藏者 |何时发送 |
| - | - | - |
| LangSmith服务 |每个 LangSmith 服务，因为它处理请求和作业 |始终，当指标开启时 |
| PostgreSQL | `queue` 部署，每分钟 |始终，当指标开启时 |
| Redis | `queue` 部署，每分钟 |始终，当指标开启时 |
|点击屋| `queue` 部署，每分钟 |当 `clickhouse.enabled` 为 `true` |
|史密斯数据库 | `queue` 部署，每分钟 | LangSmith v0.18 或更高版本，当 `smithdb.enabled` 为 `true` |
| SmithDB 迁移 | `queue` 部署，每分钟 | LangSmith v0.18 或更高版本，当 `smithdb.langsmith.migration.enabled` 为 `true` |

要关闭所有指标，请将 `config.telemetry.metrics` 设置为 `false`。要停止发送单个数据存储（例如 SmithDB）的指标，请参阅[Disable metrics for one datastore](/langsmith/self-host-egress#disable-metrics-for-one-datastore)。

## 属性

每个指标都带有用于标识发送该指标的实例的属性：`env`，以及来自您的许可证的`customer.id` 和 `customer.name`。收集器删除所有其他资源属性。

在各个数据点上，收集器仅保留以下属性并删除其余属性，包括请求路径：`app_name`、`cmd`、`collector`、`component`、`dbname`、`error_type`、`fault`、`file_type`、`job_kind`、`kind`、 `level`、`maxmemory_policy`、`method`、`mode`、`name`、`op`、`outcome`、`pointer_type`、`quantile`、`queue_name`、 `reason`、`redis_mode`、`redis_version`、`replica`、`resource_name`、`resource_type`、`result`、`role`、`rule_owner`、`source`、 `state`、`status`、`status_code`、`store_type`、`unit_kind`、`value`、`version` 和 `workload_kind`。

## 指标

### LangSmith服务

HTTP 流量、连接池以及来自 LangSmith API 和摄取服务的摄取计数。

|公制|描述 |
| - | - |
| `self_hosted_langsmith_app_info` |服务信息，每个LangSmith服务一系列。 |
| `self_hosted_langsmith_http_exceptions_total` |处理请求时引发的异常总数。 |
| `self_hosted_langsmith_http_requests_latency_seconds` |请求处理时间（以秒为单位）的直方图。 |
| `self_hosted_langsmith_http_requests_size_bytes` |请求大小摘要（以字节为单位）。 |
| `self_hosted_langsmith_http_requests_total` | HTTP 请求总数。 |
| `self_hosted_langsmith_http_responses_total` |按状态代码列出的 HTTP 响应总数。 |
| `self_hosted_langsmith_http_requests_in_progress` |当前正在处理请求。 |
| `self_hosted_langsmith_pg_pool_idle` |服务的 PostgreSQL 连接池中的空闲连接。 |
| `self_hosted_langsmith_pg_pool_used` |服务的 PostgreSQL 连接池中已使用的连接。 |
| `self_hosted_langsmith_runs_batch_count` |每个摄取批次处理的运行。 |
| `self_hosted_langsmith_upserted_feedbacks` |更新插入的反馈总数。 |
| `self_hosted_langsmith_upserted_runs` |更新插入的运行总数。 |

### 队列

LangSmith 工作线程消耗的 Redis 支持的队列的深度。|公制|描述 |
| - | - |
| `self_hosted_langsmith_asynq_ingestion_queue_pending` |运行摄取队列中处于挂起状态的任务。 |
| `self_hosted_langsmith_asynq_ingestion_queue_active` |运行摄取队列中处于活动状态的任务。 |
| `self_hosted_langsmith_asynq_ingestion_queue_scheduled` |运行摄取队列中处于计划状态的任务。 |
| `self_hosted_langsmith_asynq_ingestion_queue_retry` |运行摄取队列处于重试状态的任务。 |
| `self_hosted_langsmith_asynq_ingestion_queue_archived` |运行摄取队列处于存档状态的任务。 |
| `self_hosted_langsmith_asynq_adhoc_queue_pending` |后台作业队列中处于挂起状态的任务。 |
| `self_hosted_langsmith_asynq_adhoc_queue_active` |后台作业队列中处于活动状态的任务。 |
| `self_hosted_langsmith_asynq_adhoc_queue_scheduled` |后台作业队列中处于预定状态的任务。 |
| `self_hosted_langsmith_asynq_adhoc_queue_retry` |后台作业队列中处于重试状态的任务。 |
| `self_hosted_langsmith_asynq_github_outcomes_queue_pending` | GitHub 结果队列中处于待处理状态的任务。 |
| `self_hosted_langsmith_asynq_github_outcomes_queue_active` | GitHub 结果队列中处于活动状态的任务。 |
| `self_hosted_langsmith_asynq_github_outcomes_queue_scheduled` | GitHub 结果队列中处于计划状态的任务。 |
| `self_hosted_langsmith_asynq_github_outcomes_queue_retry` | GitHub 结果队列中处于重试状态的任务。 |
| `self_hosted_langsmith_asynq_taskset_queue_pending` |任务集队列中处于挂起状态的任务。 |
| `self_hosted_langsmith_asynq_taskset_queue_active` |任务集队列中处于活动状态的任务。 |
| `self_hosted_langsmith_asynq_taskset_queue_scheduled` |任务集队列中处于预定状态的任务。 |
| `self_hosted_langsmith_asynq_taskset_queue_retry` |任务集队列中处于重试状态的任务。 || `self_hosted_langsmith_saq_queue_active` |每个 Python 工作队列中的活动作业。 |
| `self_hosted_langsmith_saq_queue_scheduled` |每个 Python 工作队列中的预定作业。 |
| `self_hosted_langsmith_saq_queue_queued` |每个 Python 工作队列中的排队作业。 |

### 自动化规则

[automation rules](/langsmith/rules)和在线评估人员的健康状况。

|公制|描述 |
| - | - |
| `self_hosted_langsmith_run_rules_apply_run_rule_results_total` |自动化规则尝试按结果、错误类型和故障进行。 |
| `self_hosted_langsmith_run_rules_apply_run_rule_duration_seconds` |一次自动化规则尝试的时间，从作业开始到其结果。 |
| `self_hosted_langsmith_run_rules_window_lag_seconds` |规则评估窗口结束与实时尝试开始之间的延迟。 |
| `self_hosted_langsmith_run_rules_run_pickup_latency_seconds` |从运行、线程或轨迹符合条件到规则选取它的时间。对于线程和轨迹，项目的空闲窗口被排除。 |
| `self_hosted_langsmith_run_rules_bookmark_write_failures_total` | Redis 写入跳过的规则书签失败。 |
| `self_hosted_langsmith_run_rules_applier_runs_processed_total` |传递给规则应用程序的运行、线程或轨迹。 |
| `self_hosted_langsmith_run_rules_applier_results_total` |规则应用程序按批次结果运行。 |
| `self_hosted_langsmith_run_rules_applier_duration_seconds` |一个规则应用程序运行的时间（按批次结果）。 |
| `self_hosted_langsmith_run_rules_applier_run_outcomes_total` |每次运行、线程或轨迹的规则应用程序运行的结果。 |
| `self_hosted_langsmith_run_rules_code_evaluator_feedback_truncated_total` |代码评估器规则其反馈获取达到行限制的应用程序。 |
| `self_hosted_langsmith_run_rules_code_evaluator_result_failures_total` |按结果状态显示未成功的代码评估器结果。 || `self_hosted_langsmith_run_rules_code_evaluator_missing_at_dispatch_total` |代码评估器规则在没有代码的情况下到达调度。 |

### 史密斯数据库

> [!注意]
>
> SmithDB 和 SmithDB 迁移指标需要 LangSmith v0.18（Helm 图表版本 0.18.0）或更高版本。早期版本不发送它们。

启用 SmithDB 时发送。从每个 SmithDB 组件的指标端点读取。

|公制|描述 |
| - | - |
| `self_hosted_smithdb_up` | SmithDB 服务指标抓取可用性状态。 |
| `self_hosted_smithdb_last_scrape_duration_seconds` |最后一次 SmithDB 服务抓取的持续时间。 |
| `self_hosted_smithdb_last_scrape_error` |最后一次 SmithDB 服务抓取的错误状态。 |
| `self_hosted_smithdb_instance_up` | SmithDB 组件可用性状态。 |
| `self_hosted_smithdb_sys_jemalloc_resident_bytes` |物理驻留 jemalloc 页面中的字节。 |
| `self_hosted_smithdb_semaphore_permits_in_use` | SmithDB 信号量允许当前使用。 |
| `self_hosted_smithdb_semaphore_max_permits` | SmithDB 信号量配置了最大许可。 |
| `self_hosted_smithdb_ingest_flush_count` |按级别和状态摄取刷新计数。 |
| `self_hosted_smithdb_ingest_flush_reason` |按级别摄取刷新原因计数。 |
| `self_hosted_smithdb_ingest_pending_segment_entry_count` |待处理的摄取段条目尚未刷新。 |
| `self_hosted_smithdb_metrics_ingest_pending_bytes` |等待准入、缓冲或刷新的解码度量字节。 |
| `self_hosted_smithdb_query_admission_queue_length` |等待入场查询。 |
| `self_hosted_smithdb_query_admission_queue_rejections` |查询被准入队列拒绝。 |
| `self_hosted_smithdb_compaction_queue_job_count` |按类型和状态划分的压缩队列作业计数。 || `self_hosted_smithdb_compaction_queue_oldest_pending_created_at_seconds` | Unix 时间最旧的待处理压缩作业已排队；当没有待处理时为零。 |
| `self_hosted_smithdb_compaction_queue_jobs_skipped_capacity` |由于容量原因跳过了压缩作业。 |
| `self_hosted_smithdb_compaction_jobs_scheduled` |按种类安排压实作业。 |
| `self_hosted_smithdb_compaction_jobs_executed` |按种类和状态执行的压缩作业。 |
| `self_hosted_smithdb_compaction_job_completion` |按类型和状态完成的压实作业。 |
| `self_hosted_smithdb_compaction_worker_capacity_used` |按工作类型压实工人的飞行能力。 |
| `self_hosted_smithdb_compaction_worker_capacity_limit` |压缩工作人员配置的容量限制（以字节为单位）。 |
| `self_hosted_smithdb_compaction_worker_running_tasks` |按作业类型压缩运行任务的工作人员。 |
| `self_hosted_smithdb_object_store_ops` |按存储类型、操作和结果划分的对象存储操作。 |
| `self_hosted_smithdb_object_store_op_duration_seconds` |按存储类型、操作和结果划分的总对象存储操作时间。 |
| `self_hosted_smithdb_ingest_batches` |摄取已处理的批次。 |
| `self_hosted_smithdb_ingest_batch_latency_seconds` |从接收到摄取批次到刷新完成的总时间。 |
| `self_hosted_smithdb_ingest_flush_tasks` |按级别定时摄取刷新任务。 |
| `self_hosted_smithdb_ingest_flush_duration_seconds` |按级别划分的总摄取刷新时间。 |
| `self_hosted_smithdb_ingest_rows_flushed` |摄取按级别和状态刷新的行。 |
| `self_hosted_smithdb_metrics_ingest_requests` |按状态度量摄取请求。 |
| `self_hosted_smithdb_metrics_ingest_request_duration_seconds` |按状态从排队到刷新完成的总指标摄取请求时间。 |
| `self_hosted_smithdb_metrics_ingest_flushes` |指标摄取按状态刷新。 |
| `self_hosted_smithdb_metrics_ingest_flush_duration_seconds` |按状态划分的总指标摄取刷新时间。 || `self_hosted_smithdb_metrics_ingest_rows_flushed` |指标摄取行按状态刷新。 |
| `self_hosted_smithdb_query_admission_waits` |等待入场的查询。 |
| `self_hosted_smithdb_query_admission_queue_duration_seconds` |查询等待入场的总时间。 |
| `self_hosted_smithdb_compaction_job_latency_seconds` |按类型和状态划分的从创建到完成的压实作业总时间。 |
| `self_hosted_smithdb_server_requests` | SmithDB 服务器按状态请求。 |
| `self_hosted_smithdb_server_request_duration_seconds` |按状态划分的 SmithDB 服务器请求总时间。 |

### SmithDB 迁移

当 `smithdb.langsmith.migration.enabled` 为 `true` 时每分钟发送一次，这也需要 `smithdb.enabled`，除非您迁移到 BYOC 数据平面。当没有迁移 Pod 运行时，仅发送 `self_hosted_smithdb_migration_pod_up`（如 `0`）、`self_hosted_smithdb_migration_last_scrape_duration_seconds` 和 `self_hosted_smithdb_migration_last_scrape_error`。其他迁移指标仅在迁移 Pod 启动时发送。|公制|描述 |
| - | - |
| `self_hosted_smithdb_migration_last_scrape_duration_seconds` |最后一次 SmithDB 迁移抓取的持续时间。 |
| `self_hosted_smithdb_migration_last_scrape_error` |最后一次 SmithDB 迁移抓取的错误状态。 |
| `self_hosted_smithdb_migration_pod_up` | SmithDB 迁移 Pod 可用性状态。 |
| `self_hosted_smithdb_migration_jobs` | SmithDB 迁移作业（按种类和状态）。 |
| `self_hosted_smithdb_migration_tasks` | SmithDB 迁移任务（按类型和状态）。 |
| `self_hosted_smithdb_migration_run_tasks_completed` | SmithDB运行迁移任务完成。 |
| `self_hosted_smithdb_migration_run_task_planned_rows_migrated` |已完成的 SmithDB 运行迁移任务的计划行。 |
| `self_hosted_smithdb_migration_sys_jemalloc_resident_bytes` |迁移 pod 的物理驻留 jemalloc 页面中的字节。 |
| `self_hosted_smithdb_migration_sys_jemalloc_allocated_bytes` |迁移 pod 中 jemalloc 分配的字节数。 |
| `self_hosted_smithdb_migration_sys_jemalloc_active_bytes` |迁移 pod 的活动 jemalloc 页面中的字节。 |
| `self_hosted_smithdb_migration_object_store_ops` |按存储类型、操作和结果划分的迁移对象存储操作。 |
| `self_hosted_smithdb_migration_object_store_transfer_bytes` |迁移对象存储按存储类型、操作和结果传输的字节。 |
| `self_hosted_smithdb_migration_vortex_files_written` |按文件类型迁移写入的 Vortex 文件。 |
| `self_hosted_smithdb_migration_vortex_file_bytes_written` |按文件类型迁移写入的 Vortex 文件字节。 |

### PostgreSQL

从 PostgreSQL 数据库读取。|公制|描述 |
| - | - |
| `self_hosted_pg_up` | PostgreSQL 实例可用性状态。 |
| `self_hosted_pg_last_scrape_duration_seconds` |上次抓取操作的持续时间。 |
| `self_hosted_pg_last_scrape_error` |上次抓取的错误状态。 |
| `self_hosted_pg_scrape_collector_success` |收藏家刮刮是否成功。 |
| `self_hosted_pg_scrape_collector_duration_seconds` |收集器抓取的持续时间（以秒为单位）。 |
| `self_hosted_pg_static` | postgres 报告的版本字符串。 |
| `self_hosted_pg_settings_max_connections` |配置的最大连接数。 |
| `self_hosted_pg_settings_max_wal_size_bytes` |触发检查点的最大 WAL 大小。 |
| `self_hosted_pg_stat_database_tup_inserted` |插入数据库的元组数量。 |
| `self_hosted_pg_stat_database_tup_updated` |数据库中更新的元组数量。 |
| `self_hosted_pg_stat_database_tup_deleted` |从数据库中删除的元组数。 |
| `self_hosted_pg_stat_activity_count` |该状态下的连接数。 |
| `self_hosted_pg_stat_database_tup_fetched` |从数据库获取的元组数量。 |
| `self_hosted_pg_stat_database_tup_returned` |查询返回的元组数。 |
| `self_hosted_pg_stat_database_blks_hit` |缓冲区高速缓存命中数。 |
| `self_hosted_pg_stat_database_blks_read` |读取的磁盘块数。 |
| `self_hosted_pg_wal_size_bytes` | WAL 段的大小。 |
| `self_hosted_pg_database_connection_limit` |为数据库设置的连接限制。 |
| `self_hosted_pg_database_size_bytes` |数据库使用的磁盘空间。 |
| `self_hosted_pg_stat_database_deadlocks` |检测到的死锁数量。 |
| `self_hosted_pg_locks_count` |锁的数量。 |
| `self_hosted_pg_stat_database_xact_commit` |已提交的交易数量。 |
| `self_hosted_pg_stat_database_xact_rollback` |回滚事务的数量。 || `self_hosted_pg_stat_database_conflicts` |数据库冲突的数量。 |
| `self_hosted_pg_stat_bgwriter_buffers_alloc_total` |分配的缓冲区总数。 |
| `self_hosted_pg_stat_bgwriter_checkpoints_req_total` |请求的检查点总数。 |

### Redis

从您的 Redis 实例中读取。

|公制|描述 |
| - | - |
| `self_hosted_redis_up` | Redis 实例可用性状态。 |
| `self_hosted_redis_last_scrape_duration_seconds` |上次抓取操作的持续时间。 |
| `self_hosted_redis_last_ping_duration_seconds` |最后 ping Redis 的持续时间。 |
| `self_hosted_redis_last_scrape_error` |上次抓取的错误状态。 |
| `self_hosted_redis_keyspace_hits_total` |键空间命中总数。 |
| `self_hosted_redis_keyspace_misses_total` |键空间未命中总数。 |
| `self_hosted_redis_evicted_keys_total` |被逐出的键总数。 |
| `self_hosted_redis_evicted_clients_total` |被驱逐客户的总数。 |
| `self_hosted_redis_commands_total` |执行的命令总数。 |
| `self_hosted_redis_errors_total` |遇到的错误总数。 |
| `self_hosted_redis_latency_percentiles_usec` |命令延迟百分位（以微秒为单位）。 |
| `self_hosted_redis_commands_failed_calls_total` |失败的命令调用总数。 |
| `self_hosted_redis_commands_rejected_calls_total` |被拒绝的命令调用总数。 |
| `self_hosted_redis_uptime_in_seconds` | Redis 服务器正常运行时间（以秒为单位）。 |
| `self_hosted_redis_commands_processed_total` |处理的命令总数。 |
| `self_hosted_redis_instance_info` | Redis 实例信息。 |
| `self_hosted_redis_blocked_clients` |操作被阻止的客户端数量。 |
| `self_hosted_redis_connected_clients` |当前连接的客户端数量。 |
| `self_hosted_redis_max_clients` |允许的最大客户端数量。 |
| `self_hosted_redis_net_input_bytes_total` |通过网络接收的总字节数。 || `self_hosted_redis_net_output_bytes_total` |通过网络发送的总字节数。 |
| `self_hosted_redis_db_keys` |数据库中的键数。 |
| `self_hosted_redis_memory_used_bytes` |当前内存使用情况（以字节为单位）。 |
| `self_hosted_redis_memory_used_rss_bytes` | RSS 内存使用量（以字节为单位）。 |
| `self_hosted_redis_memory_max_bytes` |最大内存使用量（以字节为单位）。 |
| `self_hosted_redis_cpu_sys_seconds_total` | Redis 消耗的总系统 CPU 时间。 |
| `self_hosted_redis_cpu_user_seconds_total` | Redis 消耗的总用户 CPU 时间。 |
| `self_hosted_redis_cpu_sys_children_seconds_total` |子进程消耗的总系统 CPU 时间。 |
| `self_hosted_redis_cpu_user_children_seconds_total` |子进程消耗的总用户 CPU 时间。 |
| `self_hosted_redis_cpu_sys_main_thread_seconds_total` |主线程消耗的系统CPU时间。 |
| `self_hosted_redis_cpu_user_main_thread_seconds_total` |主线程消耗的用户CPU时间。 |
| `self_hosted_redis_db_avg_ttl_seconds` |过期密钥的平均 TTL。 |
| `self_hosted_redis_total_writes_processed` |已处理的写入操作总数。 |
| `self_hosted_redis_total_reads_processed` |处理的读取操作总数。 |
| `self_hosted_redis_commands_duration_seconds_total` |所有命令的总持续时间（以秒为单位）。 |
| `self_hosted_redis_connections_received_total` |收到的连接总数。 |

### ClickHouse

当 ClickHouse 启用时发送。从您的 ClickHouse 实例中读取。|公制|描述 |
| - | - |
| `self_hosted_clickhouse_up` | ClickHouse 实例可用性状态。 |
| `self_hosted_clickhouse_last_scrape_duration_seconds` |上次抓取操作的持续时间。 |
| `self_hosted_clickhouse_last_scrape_error` |上次抓取的错误状态。 |
| `self_hosted_clickhouseasyncmetrics_uptime` | ClickHouse 服务器正常运行时间。 |
| `self_hosted_clickhousemetrics_versioninteger` | ClickHouse 版本为整数。 |
| `self_hosted_clickhousemetrics_revision` | ClickHouse 修订号。 |
| `self_hosted_clickhouseprofileevents_slowread` |慢速读取操作的数量。 |
| `self_hosted_clickhouseprofileevents_readbackoff` |读取退避事件的数量。 |
| `self_hosted_clickhouseasyncmetrics_numberofdatabases` |数据库总数。 |
| `self_hosted_clickhouseasyncmetrics_numberoftables` |表总数。 |
| `self_hosted_clickhouseprofileevents_query` |执行的查询总数。 |
| `self_hosted_clickhouseprofileevents_selectquery` | SELECT 查询的数量。 |
| `self_hosted_clickhouseprofileevents_insertquery` | INSERT 查询的数量。 |
| `self_hosted_clickhouseprofileevents_failedselectquery` |失败的 SELECT 查询数。 |
| `self_hosted_clickhouseprofileevents_failedinsertquery` |失败的 INSERT 查询数。 |
| `self_hosted_clickhouseprofileevents_failedquery` |失败查询总数。 |
| `self_hosted_clickhousemetrics_tcpconnection` |活动 TCP 连接数。 |
| `self_hosted_clickhousemetrics_httpconnection` |活动 HTTP 连接数。 |
| `self_hosted_clickhouseprofileevents_insertedrows` |插入的总行数。 |
| `self_hosted_clickhouseprofileevents_insertedbytes` |插入的总字节数。 |
| `self_hosted_clickhouseprofileevents_rejectedinserts` |被拒绝的插入操作的数量。 |
| `self_hosted_clickhouseprofileevents_delayedinserts` |延迟插入操作的数量。 |
| `self_hosted_clickhouseprofileevents_readbufferfromfiledescriptorread` |文件描述符读取操作。 |
| `self_hosted_clickhouseprofileevents_writebufferfromfiledescriptorwrite` |文件描述符写操作。 |
| `self_hosted_clickhouseprofileevents_readbufferfromfiledescriptorreadfailed` |文件描述符读取失败。 |
| `self_hosted_clickhouseprofileevents_readbufferfromfiledescriptorreadbytes` |从文件描述符读取的字节。 || `self_hosted_clickhouseprofileevents_writebufferfromfiledescriptorwritebytes` |写入文件描述符的字节。 |
| `self_hosted_clickhousemetrics_diskspacereservedformerge` |为合并操作保留的磁盘空间。 |
| `self_hosted_clickhouseprofileevents_merge` |合并操作的数量。 |
| `self_hosted_clickhouseprofileevents_mergedrows` |合并的行数。 |
| `self_hosted_clickhouseprofileevents_mergeduncompressedbytes` |合并未压缩的字节。 |
| `self_hosted_clickhouseprofileevents_mergeexecutemilliseconds` |执行合并所花费的时间。 |
| `self_hosted_clickhouseprofileevents_querymemorylimitexceeded` |超出内存限制的查询。 |
| `self_hosted_clickhouseprofileevents_querytimemicroseconds` |总查询执行时间（以微秒为单位）。 |
| `self_hosted_clickhouseprofileevents_insertquerytimemicroseconds` | INSERT 查询执行时间（以微秒为单位）。 |
| `self_hosted_clickhouseprofileevents_selectquerytimemicroseconds` | SELECT 查询执行时间（以微秒为单位）。 |
| `self_hosted_clickhouseprofileevents_selectedparts` |所选数据部分的数量。 |
| `self_hosted_clickhouseprofileevents_selectedbytes` |选择的字节数。 |
| `self_hosted_clickhousemetrics_partstemporary` |临时数据部分的数量。 |
| `self_hosted_clickhousemetrics_partsoutdated` |过时数据部分的数量。 |

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-telemetry-metrics.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。