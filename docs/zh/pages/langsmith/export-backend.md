<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Export LangSmith telemetry to your observability backend | https://docs.langchain.com/langsmith/export-backend -->

# 将 LangSmith 遥测数据导出到您的可观测性后端

<Warning>
  **本节仅适用于 Kubernetes 部署。**
</Warning>

自托管 LangSmith 实例以日志、指标和跟踪的形式生成遥测数据。本节将向您展示如何访问该数据并将其导出到可观察性收集器或后端。

本节假设您已经设置了监控基础设施，或者您将设置此基础设施并想了解如何配置 LangSmith 以从中收集数据。

基础设施是指：

* 收藏家，例如[OpenTelemetry](https://opentelemetry.io/docs/collector/)、[FluentBit](https://docs.fluentbit.io/manual) 或[Prometheus](https://prometheus.io/)。
* 可观察性后端，例如[Datadog](https://www.datadoghq.com/)或[Grafana](https://grafana.com/)生态系统。

## 日志

有关参考设置，请参阅[OTel collector example](/langsmith/langsmith-collector#logs)。

LangSmith 自托管部署中的所有服务都将日志写入其节点的文件系统和标准输出。为了访问这些日志，您需要将收集器设置为从文件系统或标准输出读取。大多数流行的收集器都支持从文件系统读取日志。

* **开放遥测**：[File Log Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver)
* **FluentBit**：[Tail Input](https://docs.fluentbit.io/manual/pipeline/inputs/tail)
* **数据狗**：[Kubernetes Log Collection](https://docs.datadoghq.com/containers/kubernetes/log/?tab=datadogoperator)

## 指标

有关参考设置，请参阅[OTel collector example](/langsmith/langsmith-collector#metrics)。

### 朗史密斯服务以下 LangSmith 服务以 Prometheus 指标格式在端点公开指标。前端当前不公开指标。

* **后端**：`http://<langsmith_release_name>-backend.<namespace>.svc.cluster.local:1984/metrics`
* **平台后端**：`http://<langsmith_release_name>-platform-backend.<namespace>.svc.cluster.local:1986/metrics`
* **游乐场**：`http://<langsmith_release_name>-playground.<namespace>.svc.cluster.local:1988/metrics`
* **（仅限 LangSmith 控制平面）主机后端**：`http://<langsmith_release_name>-host-backend.<namespace>.svc.cluster.local:1985/metrics`

您可以使用 [Prometheus](https://prometheus.io/docs/prometheus/latest/getting_started/#configure-prometheus-to-monitor-the-sample-targets) 或 [OpenTelemetry](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver) 收集器来抓取端点，并将指标导出到您选择的后端。

### 前端 Nginx

前端服务在以下端点公开其 Nginx 指标：`langsmith-frontend.langsmith.svc.cluster.local:80/nginx_status`。你可以自己刮，或者拿出一个[Prometheus Nginx exporter](https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-nginx-exporter)。

<Warning>
  **以下部分仅适用于集群内数据库。如果您使用外部数据库，则需要配置公开和获取指标。**
</Warning>

### Postgres + Redis

如果您使用集群内 Postgres/Redis 实例，则可以使用 Prometheus 导出器公开实例中的指标。您可以部署 [Postgres exporter](https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-postgres-exporter) 和/或 [Redis exporter](https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-redis-exporter)。

### 点击屋

集群内的 Clickhouse 配置为无需导出器即可公开指标。您可以使用收集器来抓取`http://<langsmith_release_name>-clickhouse.<namespace>.svc.cluster.local:9363/metrics`的指标

## 痕迹

有关参考设置，请参阅[OTel collector example](/langsmith/langsmith-collector#traces)。LangSmith 后端、平台后端、Playground 和 LangSmith 队列部署已被检测为发出 [Otel](https://opentelemetry.io/docs/concepts/signals/traces/) 跟踪。默认情况下，跟踪处于关闭状态，并且可以通过 `langsmith_config.yaml` （或等效）文件中的以下内容为所有 LangSmith 服务启用：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config:
  tracing:
    enabled: true
    endpoint: "<your_collector_endpoint>"
    useTls: true # / false
    env: "ls_self_hosted" # This value will be set as an "env" attribute in your spans
    exporter: "http" # must be either http or grpc
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/export-backend.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>