<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create an Ingress for installations (Kubernetes) | https://docs.langchain.com/langsmith/self-host-ingress -->

# 创建用于安装的 Ingress (Kubernetes)

默认情况下，LangSmith 将为 `langsmith-frontend` 提供 LoadBalancer 服务。根据您的云提供商的不同，这可能会导致将公共 IP 地址分配给该服务。如果您想使用自定义域或对 LangSmith 安装的流量路由有更多控制，您可以配置 Ingress、网关 API 或 Istio 网关。

## 要求

* 现有的 Kubernetes 集群
* 您的 Kubernetes 集群中安装了以下其中一项：
  * Ingress 控制器（用于标准 Ingress）
  * 网关 API CRD 和网关资源（用于网关 API）
  * Istio（用于 Istio 网关）

## 参数

您可能需要向 LangSmith 安装提供某些参数来配置 Ingress。此外，我们希望将 `langsmith-frontend` 服务转换为 ClusterIP 服务。

* *主机名（可选）*：您希望用于 LangSmith 安装的主机名。例如`"langsmith.example.com"`。如果将其留空，入口将为 LangSmith 安装提供所有流量。* *BasePath（可选）*：如果您想在 URL basePath 下为 LangSmith 提供服务，您可以在此处指定。例如，添加 `"langsmith"` 将为应用程序提供 `"example.hostname.com/langsmith"` 服务。这将适用于 UI 路径以及 API 端点。

* *IngressClassName（可选）*：您要使用的 Ingress 类的名称。如果未设置，将使用默认的 Ingress 类。

* *注释（可选）*：添加到 Ingress 的附加注释。 AWS 等某些提供商可能会使用注释来控制 TLS 终止等操作。

  例如，您可以使用 AWS ALB Ingress Controller 添加以下注释，以将 ACM 证书附加到 Ingress：

  ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  annotations:
    alb.ingress.kubernetes.io/certificate-arn: "<your-certificate-arn>"
  ```

* *标签（可选）*：添加到 Ingress 的附加标签。

* *TLS（可选）*：如果您想通过 HTTPS 为 LangSmith 提供服务，您可以在此处添加 TLS 配置（许多 Ingress 控制器可能有其他控制 TLS 的方法，因此通常不需要）。这应该是 TLS 配置的数组。每个 TLS 配置应具有以下字段：

  * 主机：证书应有效的主机数组。例如 \["langsmith.example.com"]* SecretName：包含证书和私钥的 Kubernetes Secret 的名称。这个秘密应该有以下键：

    * tls.crt：证书
    * tls.key: 私钥

  * 欲了解更多信息，请参阅[creating a TLS secret](https://kubernetes.io/do/langsmith/observability-concepts/services-networking/ingress/#tls)。

## 配置

您可以将 LangSmith 实例配置为使用三个路由选项之一：标准 Ingress、网关 API 或 Istio 网关。选择最适合您的基础设施的选项。

### 选项 1：标准入口

有了这些参数，您就可以将 LangSmith 实例配置为使用 Ingress。您可以通过修改 LangSmith Helm Chart 安装的 `config.yaml` 文件来完成此操作。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config:
  hostname: "" # Main domain for LangSmith
  basePath: "" # If you want to serve langsmith under a URL base path (e.g., /langsmith)
ingress:
  enabled: true
  hostname: "" # Deprecated: Use config.hostname instead after v0.12.0
  subdomain: "" # Deprecated: Use config.hostname instead after v0.12.0
  ingressClassName: "" # If not set, the default ingress class will be used
  annotations: {} # Add annotations here if needed
  labels: {} # Add labels here if needed
  tls: [] # Add TLS configuration here if needed
frontend:
  service:
    type: ClusterIP
```

配置完成后，您将需要更新 LangSmith 安装。如果一切配置正确，您的 LangSmith 实例现在应该可以通过 Ingress 访问。您可以运行以下命令来检查 Ingress 的状态：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get ingress
```

您应该在输出中看到类似这样的内容：

```
NAME                         CLASS   HOSTS    ADDRESS          PORTS     AGE
langsmith-ingress            nginx   <host>   35.227.243.203   80, 443   95d
```

<Warning>
  如果您没有自动 DNS 设置，则需要手动将 IP 地址添加到 DNS 提供商。
</Warning>

### 选项 2：网关 API

<Note>
  自 LangSmith v0.12.0 起提供网关 API 支持
</Note>如果您的集群使用[Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/)，您可以配置 LangSmith 来配置 HTTPRoute 资源。这将为 LangSmith 创建一个 HTTPRoute，并为每个 [agent deployment](/langsmith/deployment) 创建一个 HTTPRoute。

#### 参数

* *名称（必需）*：要引用的网关资源的名称
* *namespace（必填）*：网关资源所在的命名空间
* *主机名（可选）*：您希望用于 LangSmith 安装的主机名。例如`"langsmith.example.com"`
* *basePath（可选）*：如果您想在基本路径下为 LangSmith 提供服务，您可以在此处指定。例如“example.com/langsmith”
* *sectionName（可选）*：要使用的网关中特定侦听器部分的名称
* *注释（可选）*：添加到 HTTPRoute 资源的附加注释
* *标签（可选）*：添加到 HTTPRoute 资源的其他标签

#### 配置

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config:
  hostname: "" # Main domain for LangSmith
  basePath: "" # If you want to serve langsmith under a base path. E.g "example.com/langsmith"
gateway:
  enabled: true
  name: "my-gateway" # Name of your Gateway resource
  namespace: "gateway-system" # Namespace of your Gateway resource
  sectionName: "" # Optional: specific listener section name
  annotations: {} # Add annotations here if needed
  labels: {} # Add labels here if needed
frontend:
  service:
    type: ClusterIP
```

配置完成后，您可以检查 HTTPRoutes 的状态：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get httproute
```

### 选项 3：Istio 网关

<Note>
  自 LangSmith v0.12.0 起提供 Istio 网关支持
</Note>如果您的集群使用[Istio](https://istio.io/)，您可以配置 LangSmith 来配置 VirtualService 资源。这将为 LangSmith 创建一个 VirtualService，并为每个 [agent deployment](/langsmith/deployment) 创建一个 VirtualService。

#### 参数

* *名称（可选）*：要引用的 Istio 网关资源的名称。默认为 `"istio-gateway"`
* *命名空间（可选）*：Istio 网关资源所在的命名空间。默认为 `"istio-system"`
* *主机名（可选）*：您希望用于 LangSmith 安装的主机名。例如`"langsmith.example.com"`
* *basePath（可选）*：如果您想在基本路径下为 LangSmith 提供服务，您可以在此处指定。例如“example.com/langsmith”
* *注释（可选）*：添加到 VirtualService 资源的附加注释
* *标签（可选）*：添加到 VirtualService 资源的其他标签

#### 配置

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config:
  hostname: "" # Main domain for LangSmith
  basePath: "" # If you want to serve langsmith on a separate basePath. E.g "example.com/langsmith"
istioGateway:
  enabled: true
  name: "istio-gateway" # Name of your Istio Gateway resource
  namespace: "istio-system" # Namespace of your Istio Gateway resource
  annotations: {} # Add annotations here if needed
  labels: {} # Add labels here if needed
frontend:
  service:
    type: ClusterIP
```

配置完成后，您可以检查 VirtualServices 的状态：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get virtualservice
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-ingress.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>