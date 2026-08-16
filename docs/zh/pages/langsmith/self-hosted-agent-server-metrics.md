<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Agent Server metrics | https://docs.langchain.com/langsmith/self-hosted-agent-server-metrics -->

# 代理服务器指标

[Agent Server](/langsmith/agent-server) 通过 OpenTelemetry (OTel) 客户端发出指标。默认情况下，指标使用 `lg_api_` 名称前缀（使用 `METRIC_PREFIX` 覆盖）。

在自托管部署中，使用此页面选择抓取或推送后端，启用所需的指标集，并在构建仪表板或警报时查找 Prometheus 名称。

## 度量后端

代理服务器将指标分为两组：

- **部署 UI 指标**：默认情况下，出现在 LangSmith 部署 UI 中，并在代理服务器 Prometheus 抓取端点（`GET /metrics`、`format=prometheus`）上公开。
- **内部指标**：LangChain操作员使用的操作和调试指标。配置后发送至 Datadog。在 Prometheus 上，内部指标仅在您选择加入时才会显示。

|后端|公制集 |启用|
|--------|------------|--------|
| **普罗米修斯**（刮`GET /metrics`）|默认情况下的部署 UI 指标。设置 `EXPOSE_INTERNAL_METRICS_PROMETHEUS=true` 也可以在同一端点上公开内部指标。 |安装 OTel Prometheus 导出器后可用 |
| **Datadog**（OTLP 推送）|仅内部指标 |设置`LSD_DD_API_KEY`（或`CUSTOM_LSD_DD_API_KEY`）。指标推送到`https://{LSD_DD_ENDPOINT}/v1/metrics`（默认端点：`otlp.us5.datadoghq.com`）。 |Prometheus 和 Datadog 可以同时运行。 Datadog 接收内部补充，因此 UI 指标不会在两个后端中重复。


## 指标等级

每个指标都分配有一个层，用于控制是否记录内部指标：

|等级 |价值|目的|
|------|--------|---------|
| **关键** | `1` |核心健康和故障信号。启用内部指标时始终记录，包括在 `dev` / `dev_free` 部署上。 |
| **信息** | `2` |生产监控的操作细节。生产中的默认上限 (`METRIC_MAX_EMITTING_TIER=2`)。 |
| **调试** | `3` |更深入的诊断以排除故障。除非您加注`METRIC_MAX_EMITTING_TIER`，否则请忽略。 |
| **深度调试** | `4` |详细的诊断。除非您加注`METRIC_MAX_EMITTING_TIER`，否则请忽略。 |

将 `METRIC_MAX_EMITTING_TIER` 设置为您想要记录内部指标的最高层。部署 UI 指标会忽略此设置并始终发出。

## 配置导出

### 普罗米修斯

要抓取部署 UI 指标：

1. 将 Prometheus 收集器指向代理服务器 `/metrics` 端点（例如 `https://<agent-server-host>/metrics`）。
2. 使用默认的`format=prometheus`查询参数（或省略）。

要同时公开同一端点上的内部指标，请设置：

```bash
EXPOSE_INTERNAL_METRICS_PROMETHEUS=true
```

### 数据狗要将内部指标推送到 Datadog 而不是（或与 Prometheus 一起）：

1. 将 `LSD_DD_API_KEY` 设置为您的 Datadog API 密钥。 `DATADOG_METRICS_ENABLED` 当钥匙存在时自动打开。
2. （可选）设置 `LSD_DD_ENDPOINT`（默认：`otlp.us5.datadoghq.com`）或旧别名 `CUSTOM_LSD_DD_API_KEY` / `CUSTOM_LSD_DD_ENDPOINT`。

Datadog 仅接收内部指标。继续在 Prometheus 或 Grafana 中抓取 `/metrics` 的部署 UI 指标。

## 部署 UI 指标

这些指标有`lsd_web_metric=true`。它们默认出现在 Prometheus `/metrics` scrape 上，并为 LangSmith 部署 UI 提供支持。列出等级值以供参考；无论`METRIC_MAX_EMITTING_TIER`如何，这些指标始终会发出。|名称 |类型 |等级 |描述 |
|------|------|------|-------------|
| `lg_api_http_requests_total` |专柜|信息|对代理服务器的 HTTP 请求总数。 |
| `lg_api_http_requests_latency` |直方图（毫秒）|信息| HTTP 请求延迟。 |
| `lg_api_run_queue_wait_time_1st_attempt` |直方图（毫秒）|信息|作业在首次处理之前在队列中等待的时间。 |
| `lg_api_num_pending_runs` |仪表|信息|目前正在等待运行。在 Postgres 后端，Go 核心是源；在内存后端，Python 收集器会发出此仪表。 |
| `lg_api_num_running_runs` |仪表|信息|当前正在运行。与 `lg_api_num_pending_runs` 相同的运行时分割。 |
| `lg_api_workers_max` |仪表|关键 |最大工人容量。由内存运行时的 Python 收集器发出； Go 核心在 Postgres 上发出这个。 |
| `lg_api_workers_active` |仪表|关键 |当前正在执行运行的工作人员。 |
| `lg_api_workers_available` |仪表|关键 |工人可以接受新的运行。 |
| `lg_api_pg_pool_max` |仪表|关键 | Postgres 最大连接池大小。 |
| `lg_api_pg_pool_size` |仪表|关键 |当前由 Postgres 池管理的连接（空闲、正在使用或正在准备）。 |
| `lg_api_pg_pool_available` |仪表|信息| Postgres 池中的空闲连接。 || `lg_api_pg_pool_requests_queued_total` |专柜|关键 |由于连接无法立即可用，Postgres 连接请求排队。 OTel Prometheus 导出程序将 `_total` 附加到计数器名称。 |
| `lg_api_pg_pool_requests_errors_total` |专柜|关键 | Postgres 连接请求错误（超时、队列已满和类似故障）。 |
| `lg_api_redis_pool_max` |仪表|信息|最大 Redis 连接池大小。 |
| `lg_api_redis_pool_size` |仪表|信息|当前正在使用的 Redis 连接。 |
| `lg_api_redis_pool_available` |仪表|信息| Redis 池中的空闲连接。 |

## 内部指标

这些指标有`lsd_web_metric=false`。默认情况下，当设置 `LSD_DD_API_KEY` 时，它们会导出到 Datadog。设置 `EXPOSE_INTERNAL_METRICS_PROMETHEUS=true` 将它们包含在 Prometheus `/metrics` 抓取中。记录等于或低于`METRIC_MAX_EMITTING_TIER`的内部指标；更高层的指标被省略。

### 运行生命周期|名称 |类型 |等级 |描述 |
|------|------|------|-------------|
| `lg_api_run_attempt_started_counter` |专柜|关键 |运行执行尝试已开始。 |
| `lg_api_run_success_counter` |专柜|关键 |运行成功完成。 |
| `lg_api_run_canceled_by_request_counter` |专柜|关键 |通过显式取消请求取消运行。 |
| `lg_api_run_failed_retriable_counter` |专柜|关键 |运行失败并出现可重试错误。 |
| `lg_api_run_failed_after_retry_counter` |专柜|关键 |在用尽重试后失败的运行。 |
| `lg_api_run_exceed_max_attempts_at_start_counter` |专柜|关键 |由于已超过最大尝试次数，因此在开始时拒绝运行。 |
| `lg_api_run_abandoned_by_shutdown_counter` |专柜|关键 |服务器关闭期间放弃运行。 |
| `lg_api_run_set_status_error_counter` |专柜|关键 |更新运行状态时出错。 |
| `lg_api_failed_to_fetch_runs_counter` |专柜|关键 |从队列中获取运行失败。 |
| `lg_api_run_execution_latency` |直方图（毫秒）|信息|端到端运行执行延迟。 |
| `lg_api_run_queue_wait_time_retry_attempt` |直方图（毫秒）|信息|重试尝试的队列等待时间（第一次之后）。 |

### 流媒体和协议 v2|名称 |类型 |等级 |描述 |
|------|------|------|-------------|
| `lg_api_streaming_data_loss_counter` |专柜|关键 |流数据丢失事件。 |
| `lg_api_stream_publish_latency` |直方图（毫秒）|信息|延迟发布流块。 |
| `lg_api_stream_data_size_bytes` |直方图|调试|已发布流有效负载的大小（以字节为单位）。 |
| `lg_api_protocol_v2_buffer_evicted_counter` |专柜|信息|事件流 v2 重播缓冲区驱逐。 |
| `lg_api_protocol_v2_event_emitted_counter` |专柜|调试|发出事件流 v2 事件。 |
| `lg_api_protocol_v2_resume_gap_counter` |专柜|信息| Event Streaming v2 恢复重播期间检测到的间隙。 |
| `lg_api_protocol_v2_transport_send_failure_counter` |专柜|信息|事件流 v2 传输发送失败。 |
| `lg_api_protocol_v2_buffer_size` |仪表|调试|每次运行的当前事件流 v2 重播缓冲区占用率。当接近极限时调整`LSD_PROTOCOL_V2_BUFFER_SIZE`。 |
| `lg_api_protocol_v2_replayed_events` |直方图|调试| Event Streaming v2 重新连接时重播的事件数。 |

### 服务器和基础设施|名称 |类型 |等级 |描述 |
|------|------|------|-------------|
| `lg_api_server_started_counter` |专柜|信息|服务器启动事件。 |
| `lg_api_server_requested_to_stop_counter` |专柜|信息|收到正常关闭请求。 |
| `lg_api_server_stopped_counter` |专柜|信息|服务器停止事件。 |
| `lg_api_graph_recursion_limit_error_counter` |专柜|信息|图递归限制错误。 |
| `lg_api_publish_queue_availability` |仪表|关键 | Redis 发布队列可用性信号。 |

## 另请参阅

- [Self-hosted overview](/langsmith/deploy-to-self-hosted-overview)
- [Configure Agent Server for scale](/langsmith/agent-server-scale)
- [Troubleshooting for self-hosted deployments](/langsmith/diagnostics-self-hosted)
- [Agent Server changelog](/langsmith/agent-server-changelog)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-hosted-agent-server-metrics.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>