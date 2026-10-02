<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure SmithDB observability | https://docs.langchain.com/langsmith/self-host-smithdb-observability -->

# 配置SmithDB可观察性

抓取 SmithDB 应用程序指标并将日志和跟踪导出到现有的可观察性堆栈。

SmithDB 组件公开应用程序指标，并可以将日志和跟踪导出到现有的可观察性堆栈。在部署 SmithDB 服务之后、调整容量或迁移历史数据之前进行设置。它提供信号来验证这些更改并调查故障。

## 指标

每个 SmithDB 组件都在其 HTTP 端口上的固定 `/metrics` 路径上公开应用程序指标。配置监控堆栈以通过向每个组件添加抓取注释来发现 Pod：

<Accordion title="Sample Prometheus configuration">
  ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  smithdb:
    query:
      deployment:
        annotations:
          prometheus.io/scrape: "true"
          prometheus.io/path: "/metrics"
          prometheus.io/port: "8060"
    ingestion:
      deployment:
        annotations:
          prometheus.io/scrape: "true"
          prometheus.io/path: "/metrics"
          prometheus.io/port: "8050"
    compaction:
      deployment:
        annotations:
          prometheus.io/scrape: "true"
          prometheus.io/path: "/metrics"
          prometheus.io/port: "8070"
    compactionWorker:
      deployment:
        annotations:
          prometheus.io/scrape: "true"
          prometheus.io/path: "/metrics"
          prometheus.io/port: "9000"
    clusterManager:
      deployment:
        annotations:
          prometheus.io/scrape: "true"
          prometheus.io/path: "/metrics"
          prometheus.io/port: "8090"
    migration:
      job:
        annotations:
          prometheus.io/scrape: "true"
          prometheus.io/path: "/metrics"
          prometheus.io/port: "9040"
  ```

  在LangSmith 0.16 上，在`smithdb.migration.deployment.annotations`下设置迁移注释。
</Accordion>

这些是普罗米修斯风格的注释。拥有自己的发现格式的提供商（例如 Datadog）需要将该格式应用于相同的端口和路径。使用现有基础设施监控来监控 PostgreSQL 元存储、Kubernetes 节点和云服务。

要了解哪些指标以及如何读取它们，请参阅[SmithDB metrics reference](/langsmith/self-host-smithdb-metrics)。

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

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-smithdb-observability.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>