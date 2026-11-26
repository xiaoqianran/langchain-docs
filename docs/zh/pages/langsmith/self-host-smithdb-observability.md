<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure SmithDB observability | https://docs.langchain.com/langsmith/self-host-smithdb-observability -->

# 配置SmithDB可观测性

抓取 SmithDB 应用程序指标并将日志和跟踪导出到现有的可观察性堆栈。

SmithDB 组件公开应用程序指标，并可以将日志和跟踪导出到现有的可观察性堆栈。在部署 SmithDB 服务之后、调整容量或迁移历史数据之前进行设置。它提供信号来验证这些更改并调查故障。

## 指标

每个 SmithDB 组件都在其 HTTP 端口上的固定 `/metrics` 路径上公开应用程序指标。配置监控堆栈以通过向每个组件添加抓取注释来发现 Pod：

> [手风琴] Prometheus 配置示例
>
> ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> smithdb:
>   query:
>     deployment:
>       annotations:
>         prometheus.io/scrape: "true"
>         prometheus.io/path: "/metrics"
>         prometheus.io/port: "8060"
>   ingestion:
>     deployment:
>       annotations:
>         prometheus.io/scrape: "true"
>         prometheus.io/path: "/metrics"
>         prometheus.io/port: "8050"
>   compaction:
>     deployment:
>       annotations:
>         prometheus.io/scrape: "true"
>         prometheus.io/path: "/metrics"
>         prometheus.io/port: "8070"
>   compactionWorker:
>     deployment:
>       annotations:
>         prometheus.io/scrape: "true"
>         prometheus.io/path: "/metrics"
>         prometheus.io/port: "9000"
>   clusterManager:
>     deployment:
>       annotations:
>         prometheus.io/scrape: "true"
>         prometheus.io/path: "/metrics"
>         prometheus.io/port: "8090"
>   migration:
>     job:
>       annotations:
>         prometheus.io/scrape: "true"
>         prometheus.io/path: "/metrics"
>         prometheus.io/port: "9040"
> ```
>
> 在LangSmith 0.16 上，在`smithdb.migration.deployment.annotations`下设置迁移注释。
>
> 使用`smithdb.topology: unified`，仅注释统一的 pod 和抓取端口`8060`：
>
> ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> smithdb:
>   unified:
>     deployment:
>       annotations:
>         prometheus.io/scrape: "true"
>         prometheus.io/path: "/metrics"
>         prometheus.io/port: "8060"
> ```

这些是普罗米修斯风格的注释。拥有自己的发现格式的提供商（例如 Datadog）需要将该格式应用于相同的端口和路径。

有关要观察哪些指标以及如何读取它们，请参阅[Essential SmithDB metrics](/langsmith/self-host-smithdb-metrics)。

### 直方图和导出集用他们的桶收集直方图。如果没有存储桶，您将无法计算百分位数，例如 p95 查询延迟。

Helm 图表将每个 SmithDB 组件设置为导出 `critical` 指标集。该集包括 [recommended alerts](/langsmith/self-host-smithdb-alerts) 使用的所有 SmithDB 指标。要导出所有指标，请在一个组件的`smithdb.commonEnv`或`extraEnv`中设置`SMITHDB_<COMPONENT>__METRICS__MODE=all`。不要在两个地方设置相同的变量，因为这样图表将无法呈现。

### LangSmith 摄取指标

LangSmith 摄取管道将所有运行发送到 SmithDB，SmithDB 问题通常首先显示在那里。将这些指标与 SmithDB 指标一起收集：

|服务 |港口|指标|
| - | - | - |
|平台后台| `1986` | `langsmith_asynq_ingestion_queue_pending`、`langsmith_asynq_ingestion_queue_retry`、`langsmith_asynq_ingestion_queue_archived`、`langsmith_asynq_queue_latency_seconds` |
|摄取队列 | `1989` | `langsmith_ingestion_e2e_latency_seconds`、`langsmith_ingestion_api_to_worker_latency_seconds`、`langsmith_ingestion_worker_to_store_latency_seconds`、`langsmith_ingest_task_failures_total` |

这两个服务都在 `/metrics` 公开这些指标。其他LangSmith服务，请参阅[Export LangSmith telemetry](/langsmith/export-backend)。

[dashboard collection examples](/langsmith/self-host-observability-dashboards#smithdb) 不会收集所有这些指标。将缺少的指标添加到您的集合配置中。

### 基础设施指标

使用现有基础设施监控来监控 PostgreSQL 元存储、Redis、Kubernetes 和云服务。对于托管 Redis 和 PostgreSQL，请使用云提供商的指标。

## 日志和痕迹SmithDB 使用[Export LangSmith telemetry to your observability backend](/langsmith/export-backend) 中描述的图表级 OpenTelemetry 跟踪配置，但有一个区别：SmithDB 仅通过 OTLP gRPC 导出。将 `config.observability.tracing.exporter` 设置为 `grpc`。使用 `http`，SmithDB 导出保持禁用状态，SmithDB 日志保持仅限控制台。该图表自动将 SmithDB pod 和容器名称添加为 OpenTelemetry 资源属性。

要自定义 SmithDB 日志过滤，请通过 `smithdb.commonEnv` 为所有 SmithDB 工作负载设置 `RUST_LOG`：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
smithdb:
  commonEnv:
    - name: RUST_LOG
      value: "warn,smithdb_query=debug,vortex=warn"
```

确认可以从 LangSmith 命名空间访问收集器，应用图表，然后确认遥测数据到达。要设置或调整收集器，请参阅[Configure your collector for LangSmith telemetry](/langsmith/langsmith-collector)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-smithdb-observability.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。