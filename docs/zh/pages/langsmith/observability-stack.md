<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy an observability stack for your LangSmith deployment | https://docs.langchain.com/langsmith/observability-stack -->

# 为您的 LangSmith 部署部署可观察性堆栈

<Danger>
  **已弃用**：LangSmith Observability Helm 图表已弃用。我们不再维护或提供支持。以下文档仅供参考。
</Danger>

<Warning>
  **本节仅适用于 Kubernetes 部署。**
</Warning>

LangSmith 应用程序公开可以发送到您选择的后端的遥测数据。如果您还没有可观测性堆栈，或者更喜欢将 LangSmith 遥测与主应用程序分开，则可以使用 LangSmith Observability Helm 图表来部署基本的可观测性堆栈。

# 第 1 部分：Prometheus 导出器

如果您只想为自托管部署中的组件部署指标导出器，然后可以使用遥测数据进行抓取，请使用此部分。如果您想为您部署完整的可观察性堆栈，请转到[End-to-End Deployment Section](/langsmith/observability-stack#prerequisites)。

Helm Chart 提供了一组 Prometheus 导出器来公开来自 [Redis](https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-redis-exporter)、[Postgres](https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-postgres-exporter)、[Nginx](https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-nginx-exporter) 和 [Kube state metrics](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-state-metrics) 的指标。1.创建一个名为`langsmith_obs_config.yaml`的本地文件
2. 将此 [file](https://github.com/langchain-ai/helm/blob/main/charts/langsmith-observability/examples/metric-exporters-only.yaml) 中的值复制到 `langsmith_obs_config.yaml` 中，确保修改这些值以匹配您的 LangSmith 部署。
3. 通过运行`helm search repo langchain/langsmith-observability --versions`查找最新版本的图表。
4.获取最新版本号，然后运行`helm install langsmith-observability langchain/langsmith-observability --values langsmith_obs_config.yaml --version <version> -n <namespace> --wait --debug`

这将允许您在以下服务端点上抓取指标：

* Postgres：`langsmith-observability-postgres-exporter:9187/metrics`
* Redis：`langsmith-observability-redis-exporter:9121/metrics`
* Nginx：`langsmith-observability-nginx-exporter:9113/metrics`
* KubeStateMetrics：`langsmith-observability-kube-state-metrics:8080/metrics`

如果安装成功，您应该看到以下内容：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Release "langsmith-observability" has been installed. Happy Helming!NAME: langsmith-observabilityLAST DEPLOYED: Wed Jun 25 11:17:34 2025NAMESPACE: langsmith-observabilitySTATUS: deployedREVISION: 1
```

如果你运行 `kubectl get pods -n langsmith-observability`，你应该看到：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith-observability-kube-state-metrics-b58bb8db4-bm4g5        1/1     Running   0          2m22slangsmith-observability-nginx-exporter-6d686d9d4b-5qw9v           1/1     Running   0          2m22slangsmith-observability-postgres-exporter-67d5db5684-tffbm        1/1     Running   0          2m22slangsmith-observability-redis-exporter-846c4d65cb-vbtwd           1/1     Running   0          2m22s
```

# 第 2 部分：完整的可观察性堆栈

<Warning>
  **这不是生产可观察性堆栈。使用它可以快速了解部署的日志、指标和跟踪。这仅用于每天处理几十 GB 的数据。**
</Warning>

本节将向您展示如何使用 [Helm Chart](https://github.com/langchain-ai/helm/tree/main/charts/langsmith-observability) 为 LangSmith 部署端到端可观测性堆栈。

该图表是围绕 Grafana 的开源 LGTM Stack 构建的。它包括：

* [Loki](https://grafana.com/docs/loki/latest/) 用于原木。
* [Mimir](https://grafana.com/docs/mimir/latest/) 用于指标+警报。
* [Tempo](https://grafana.com/docs/tempo/latest/) 用于痕迹。
* [Grafana](https://grafana.com/docs/grafana/latest/) 用于监控UI。

以及用于收集遥测数据的[OpenTelemetry Collectors](https://opentelemetry.io/docs/collector/)。

## 先决条件

### 1. 计算资源堆栈每个部分的资源请求和限制可以在 helm 图表中修改。以下是当前的分配（请求/限制）：

*洛基：`2vCPU/3vCPU + 2Gi/4Gi`
*密米尔：`1vCPU/2vCPU + 2Gi/4Gi`
* 节奏：`1vCPU/2vCPU + 4Gi/6Gi`

确保在启动 helm 图表之前已分配这些资源，或者修改 helm 配置文件中的资源值。

### 2. 证书管理器

Helm Chart 使用 OpenTelemetry Operator 来配置收集器。操作员要求您在 Kubernetes 集群中安装[cert-manager](https://cert-manager.io/docs/installation/)。

如果您没有安装，可以运行以下命令：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm repo add jetstack https://charts.jetstack.iohelm repo updatehelm install cert-manager jetstack/cert-manager -n cert-manager --create-namespace
```

### 3. OpenTelemetry 运算符

使用以下命令安装 OpenTelemetry Operator：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-chartshelm repo updatehelm install opentelemetry-operator open-telemetry/opentelemetry-operator -n <namespace>
```

## 安装

以下说明将显示 OTel 收集器、LGTM 堆栈、Grafana 和 Prometheus 导出器。

1.创建一个名为`langsmith_obs_config.yaml`的本地文件
2. 将此 [file](https://github.com/langchain-ai/helm/blob/main/charts/langsmith-observability/examples/e2e-stack.yaml) 中的值复制到 `langsmith_obs_config.yaml` 中，确保修改这些值以匹配您的 LangSmith 部署。
3. 通过运行`helm search repo langchain/langsmith-observability --versions`查找最新版本的图表。
4.获取最新版本号，然后运行`helm install langsmith-observability langchain/langsmith-observability --values langsmith_obs_config.yaml --version <version> -n <namespace> --wait --debug`<Note>
  **您可以通过修改配置文件中`otelCollector`下的布尔值来选择性地收集日志、指标或跟踪。您还可以有选择地调出后端的各个部分（Loki、Mimir、Tempo）。**
</Note>

如果安装成功，您应该看到以下内容：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Release "langsmith-observability" has been installed. Happy Helming!NAME: langsmith-observabilityLAST DEPLOYED: Wed Jun 25 11:17:34 2025NAMESPACE: langsmith-observabilitySTATUS: deployedREVISION: 1
```

如果你运行 `kubectl get pods -n langsmith-observability`，你应该看到：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith-observability-collector-gateway-collector-7746fb8pzbg   1/1     Running   0          5m26slangsmith-observability-grafana-7c6fc976f9-cdbvr                  1/1     Running   0          2m49slangsmith-observability-kube-state-metrics-b58bb8db4-bm4g5        1/1     Running   0          5m27slangsmith-observability-loki-0                                    2/2     Running   0          5m27slangsmith-observability-loki-chunks-cache-0                       2/2     Running   0          5m27slangsmith-observability-loki-gateway-769fb6fff8-zjsn5             1/1     Running   0          5m27slangsmith-observability-loki-results-cache-0                      2/2     Running   0          5m27slangsmith-observability-mimir-0                                   1/1     Running   0          5m26slangsmith-observability-nginx-exporter-6d686d9d4b-5qw9v           1/1     Running   0          5m27slangsmith-observability-postgres-exporter-67d5db5684-tffbm        1/1     Running   0          5m27slangsmith-observability-redis-exporter-846c4d65cb-vbtwd           1/1     Running   0          5m27slangsmith-observability-tempo-0                                   1/1     Running   0          5m27sopentelemetry-operator-756dff697-vblbn                            2/2     Running   0          12m
```

## 安装后

### 在 LangSmith 中启用日志和跟踪

安装可观测性 helm 图表后，您需要在 *LangSmith* helm 配置文件中设置以下值，以启用日志和跟踪的收集。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
commonPodAnnotations:
  # E.g.: "langsmith-observability/langsmith-observability-collector-sidecar"
  sidecar.opentelemetry.io/inject: "${LANGSMITH_OBS_NAMESPACE}/${LANGSMITH_OTEL_CRD_NAME}"
observability:
  tracing:
    enabled: true
    # Replace this with the endpoint of your trace collector.
    # E.g.: "http://langsmith-observability-collector-gateway-collector.langsmith-observability.svc.cluster.local:4318/v1/traces"
    endpoint: "http://${GATEWAY_COLLECTOR_SERVICE_NAME}.${LANGSMITH_OBS_NAMESPACE}.svc.cluster.local:4318/v1/traces"
```

<Info>
  1. 要获取`${LANGSMITH_OTEL_CRD_NAME}`，您可以运行`kubectl get opentelemetrycollectors -n ${LANGSMITH_OBS_NAMESPACE}`并选择MODE = `sidecar`的名称
  2. 要获取 `${GATEWAY_COLLECTOR_SERVICE_NAME}` 名称，请运行 `kubectl get services -n ${LANGSMITH_OBS_NAMESPACE}` 并选择具有端口 4317/4318 和 ClusterIP 集的名称。应该是类似`langsmith-observability-collector-gateway-collector`的东西
</Info>

现在运行`helm upgrade langsmith langchain/langsmith --values langsmith_config.yaml -n <langsmith-namespace> --wait --debug`

升级后，如果运行`kubectl get pods -n <langsmith-namespace>`，您应该会看到以下内容（注意边车收集器的 2/2）：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith-ace-backend-7dc85f7dff-xjbkj         2/2     Running     0               7m53slangsmith-backend-566b66979c-rgcfh             2/2     Running     1               7m53slangsmith-clickhouse-0                         2/2     Running     0               7m49slangsmith-frontend-7cf8549885-vpkns            2/2     Running     0               7m53slangsmith-platform-backend-5d46db7d9d-f6gh7    2/2     Running     0               7m52slangsmith-platform-backend-5d46db7d9d-lrr4d    2/2     Running     1               7m41slangsmith-platform-backend-5d46db7d9d-pcp27    2/2     Running     0               7m28slangsmith-playground-65d4c9699c-h656r          2/2     Running     0               7m52slangsmith-postgres-0                           2/2     Running     0               7m51slangsmith-queue-bdcd45bd6-htssd                2/2     Running     0               7m52slangsmith-queue-bdcd45bd6-pwdx4                2/2     Running     0               6m31slangsmith-queue-bdcd45bd6-xqrb8                2/2     Running     0               5m11slangsmith-redis-0                              2/2     Running     0               7m51s
```

## Grafana 的使用

安装完所有内容后，请执行以下操作：获取 Grafana 密码：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get secret langsmith-observability-grafana -n <langsmith_observability_namespace> -o jsonpath="{.data.admin-password}" | base64 --decode
```然后端口转发到端口 3000 处的 `langsmith-observability-grafana` 容器，并以 `localhost:3000` 打开浏览器。使用用户名 `admin` 和上面密钥中的密码登录 Grafana。

进入 Grafana 后，您可以使用 UI 来监控日志、指标和跟踪。 Grafana 还预先打包了一组仪表板，用于监控部署的主要组件。

<img alt="LangSmith Grafana Dashboards" />

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/observability-stack.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>