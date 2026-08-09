<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure your collector for LangSmith telemetry | https://docs.langchain.com/langsmith/langsmith-collector -->

# 配置您的收集器以进行 LangSmith 遥测

LangSmith 部署中的各种服务以日志、指标和跟踪的形式发出遥测数据。您可能已经在 Kubernetes 集群中设置了遥测收集器，或者想要部署一个来监控您的应用程序。

本页介绍如何配置 [OTel Collector](https://opentelemetry.io/docs/collector/configuration/) 以从 LangSmith 收集遥测数据。请注意，下面讨论的所有概念都可以转换为其他收集器，例如[Fluentd](https://www.fluentd.org/)或[FluentBit](https://fluentbit.io/)。

<Warning>
  **本节仅适用于 Kubernetes 部署。**
</Warning>

# 接收器

## 日志

这是 ***Sidecar*** 收集器从其自己的 Pod 读取日志的示例，不包括来自非特定域容器的日志。 Sidecar 配置在这里很有用，因为我们需要访问每个容器的文件系统。也可以使用 DaemonSet。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
filelog:
  exclude:
    - "**/otc-container/*.log"
  include:
    - /var/log/pods/${POD_NAMESPACE}_${POD_NAME}_${POD_UID}/*/*.log
  include_file_name: false
  include_file_path: true
  operators:
    - id: container-parser
      type: container
  retry_on_failure:
    enabled: true
  start_at: end
env:
  - name: POD_NAME
    valueFrom:
      fieldRef:
        fieldPath: metadata.name
  - name: POD_NAMESPACE
    valueFrom:
      fieldRef:
        fieldPath: metadata.namespace
  - name: POD_UID
    valueFrom:
      fieldRef:
        fieldPath: metadata.uid
volumes:
  - name: varlogpods
    hostPath:
      path: /var/log/pods
volumeMounts:
  - name: varlogpods
    mountPath: /var/log/pods
    readOnly: true
```

<Info>
  **此配置需要对给定命名空间中的 pod 具有“get”、“list”和“watch”权限。**
</Info>

## 指标可以使用 Prometheus 端点来抓取指标。单实例***Gateway***收集器可用于避免在获取指标时重复查询。以下配置会抓取所有默认命名的 LangSmith 服务：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
prometheus:
  config:
    scrape_configs:
      - job_name: langsmith-services
        metrics_path: /metrics
        scrape_interval: 15s
        # Only scrape endpoints in the LangSmith namespace
        kubernetes_sd_configs:
          - role: endpoints
            namespaces:
              names: [<langsmith-namespace>]
        relabel_configs:
          # Only scrape services with the name langsmith-.*
          - source_labels: [__meta_kubernetes_service_name]
            regex: "langsmith-.*"
            action: keep
          # Only scrape ports with the following names
          - source_labels: [__meta_kubernetes_endpoint_port_name]
            regex: "(backend|platform|playground|redis-metrics|postgres-metrics|metrics)"
            action: keep
          # Promote useful metadata into regular labels
          - source_labels: [__meta_kubernetes_service_name]
            target_label: k8s_service
          - source_labels: [__meta_kubernetes_pod_name]
            target_label: k8s_pod
          # Replace the default "host:port" as Prom's instance label
          - source_labels: [__address__]
            target_label: instance
```

<Info>
  **此配置需要对给定命名空间中的 pod、服务和端点具有“get”、“list”和“watch”权限。**
</Info>

### 痕迹

对于跟踪，您需要启用 OTLP 接收器。以下配置可用于侦听端口 4318 上的 HTTP 跟踪和端口 4317 上的 GRPC：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
otlp:
  protocols:
    grpc:
      endpoint: 0.0.0.0:4317
    http:
      endpoint: 0.0.0.0:4318
```

## 处理器

### 推荐的 OTEL 处理器

使用 OTel 收集器时建议使用以下处理器：

* [Batch Processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)：在发送给出口商之前将数据分组。
* [Memory Limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)：防止收集器使用过多内存而崩溃。当超过软限制时，收集器将停止接受新数据。
* [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)：将 pod 名称等 Kubernetes 元数据添加到遥测数据中。

## 出口商

导出器只需指向您喜欢的外部端点。以下配置允许您为日志、指标和跟踪配置单独的端点：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
otlphttp/logs:
  endpoint: <your_logs_endpoint>
otlphttp/metrics:
  endpoint: <your_metrics_endpoint>
otlphttp/traces:
  endpoint: <your_traces_endpoint>
```<Note>
  **OTel Collector 还支持直接导出到 [Datadog](https://docs.datadoghq.com/opentelemetry/setup/collector_exporter) 端点。**
</Note>

# 收集器配置示例：日志 sidecar

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
mode: sidecar
image: otel/opentelemetry-collector-contrib
config:
  receivers:
    filelog:
      exclude:
        - "**/otc-container/*.log"
      include:
        - /var/log/pods/${POD_NAMESPACE}_${POD_NAME}_${POD_UID}/*/*.log
      include_file_name: false
      include_file_path: true
      operators:
        - id: container-parser
          type: container
      retry_on_failure:
        enabled: true
      start_at: end
  processors:
    batch:
      send_batch_size: 8192
      timeout: 10s
    memory_limiter:
      check_interval: 1m
      limit_percentage: 90
      spike_limit_percentage: 80
  exporters:
    otlphttp/logs:
      endpoint: <your-endpoint>
  service:
    pipelines:
      logs/langsmith:
        receivers: [filelog]
        processors: [batch, memory_limiter]
        exporters: [otlphttp/logs]
env:
  - name: POD_NAME
    valueFrom:
      fieldRef:
        fieldPath: metadata.name
  - name: POD_NAMESPACE
    valueFrom:
      fieldRef:
        fieldPath: metadata.namespace
  - name: POD_UID
    valueFrom:
      fieldRef:
        fieldPath: metadata.uid
volumes:
  - name: varlogpods
    hostPath:
      path: /var/log/pods
volumeMounts:
  - name: varlogpods
    mountPath: /var/log/pods
    readOnly: true
```

# 收集器配置示例：指标和跟踪网关

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
mode: deployment
image: otel/opentelemetry-collector-contrib
config:
  receivers:
    prometheus:
      config:
        scrape_configs:
          - job_name: langsmith-services
            metrics_path: /metrics
            scrape_interval: 15s
            # Only scrape endpoints in the LangSmith namespace
            kubernetes_sd_configs:
              - role: endpoints
                namespaces:
                  names: [<langsmith-namespace>]
            relabel_configs:
              # Only scrape services with the name langsmith-.*
              - source_labels: [__meta_kubernetes_service_name]
                regex: "langsmith-.*"
                action: keep
              # Only scrape ports with the following names
              - source_labels: [__meta_kubernetes_endpoint_port_name]
                regex: "(backend|platform|playground|redis-metrics|postgres-metrics|metrics)"
                action: keep
              # Promote useful metadata into regular labels
              - source_labels: [__meta_kubernetes_service_name]
                target_label: k8s_service
              - source_labels: [__meta_kubernetes_pod_name]
                target_label: k8s_pod
              # Replace the default "host:port" as Prom's instance label
              - source_labels: [__address__]
                target_label: instance
    otlp:
      protocols:
        grpc:
          endpoint: 0.0.0.0:4317
        http:
          endpoint: 0.0.0.0:4318
  processors:
    batch:
      send_batch_size: 8192
      timeout: 10s
    memory_limiter:
      check_interval: 1m
      limit_percentage: 90
      spike_limit_percentage: 80
  exporters:
    otlphttp/metrics:
      endpoint: <metrics_endpoint>
    otlphttp/traces:
      endpoint: <traces_endpoint>
  service:
    pipelines:
      metrics/langsmith:
        receivers: [prometheus]
        processors: [batch, memory_limiter]
        exporters: [otlphttp/metrics]
      traces/langsmith:
        receivers: [otlp]
        processors: [batch, memory_limiter]
        exporters: [otlphttp/traces]
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/langsmith-collector.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>