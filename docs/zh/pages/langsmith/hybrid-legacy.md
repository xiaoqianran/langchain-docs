<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Setup guide (legacy) | https://docs.langchain.com/langsmith/hybrid-legacy -->

# 设置指南（旧版）

<Warning>
本页介绍传统混合部署模型，该模型使用LangChain管理的控制平面来编排云中的代理服务器。对于当前的混合动力型号，请参阅[Hybrid](/langsmith/hybrid)。
</Warning>

<Info>
混合选项需要[Enterprise](https://langchain.com/pricing)计划。 [Get a demo](https://www.langchain.com/contact-sales) 了解更多。
</Info>

**混合**模型在 LangChain 的云和您的云之间拆分 LangSmith 基础设施：

- **控制平面**（LangSmith UI、API 和编排）在 LangChain 的云中运行，由 LangChain 管理。
- **数据平面**（您的<Tooltip tip="The server that runs your applications.">代理服务器</Tooltip>和代理工作负载）在您的云中运行，由您管理。

这将托管界面的便利性与在您自己的环境中运行工作负载的灵活性结合在一起。

<Note>
了解有关 [control plane](/langsmith/control-plane)、[data plane](/langsmith/data-plane) 和 [Agent Server](/langsmith/agent-server) 架构概念的更多信息。
</Note>|组件|职责|它在哪里运行 |谁来管理|
|----------------|--------------------|----------------------------|----------------|
| <Tooltip tip="The LangSmith UI and APIs for managing deployments.">控制平面</Tooltip> | <ul><li>用于创建部署和修订的UI</li><li>用于管理部署的API</li><li>可观测性数据存储</li></ul> | LangChain的云 | LangChain |
| <Tooltip tip="The runtime environment where your Agent Servers and agents execute.">数据平面</Tooltip> | <ul><li>用于协调部署的操作员/侦听器</li><li>代理服务器（代理/图表）</li><li>支持服务（Postgres、Redis 等）</li></ul> |你的云 |你|

在混合模型中运行 LangSmith 时，您可以使用 [LangSmith API key](/langsmith/create-account-api-key) 进行身份验证。

### 工作流程

1. 使用`langgraph-cli`或[Studio](/langsmith/studio)在本地测试您的图表。
1. 使用 `langgraph build` 命令构建 Docker 镜像。
1. 从 [control plane UI](/langsmith/control-plane#control-plane-ui) 部署代理服务器。

<Note>
支持的计算平台：[Kubernetes](https://kubernetes.io/)。请参阅下面的[Kubernetes setup](#kubernetes-setup)。
</Note>

### 架构

<img
    className="block dark:hidden"
    src="/langsmith/images/hybrid-with-deployment-light.png"
    alt="Hybrid deployment: LangChain-hosted control plane (LangSmith UI/APIs) manages deployments. Your cloud runs a listener, Agent Server instances, and backing stores (Postgres/Redis) on Kubernetes."
/>

<img
    className="hidden dark:block"
    src="/langsmith/images/hybrid-with-deployment-dark.png"
    alt="Hybrid deployment: LangChain-hosted control plane (LangSmith UI/APIs) manages deployments. Your cloud runs a listener, Agent Server instances, and backing stores (Postgres/Redis) on Kubernetes."
/>

### 计算平台

- **Kubernetes**：混合支持在任何 Kubernetes 集群上运行数据平面。

<Tip>
有关 Kubernetes 中的设置，请参阅下面的[Kubernetes setup](#kubernetes-setup)。
</Tip>

### 到 LangSmith 和控制平面的出口在混合部署模型中，自托管数据平面将向控制平面发送网络请求，以轮询需要在数据平面中实施的更改。数据平面部署的跟踪也会发送到与控制平面集成的LangSmith实例。到控制平面的流量是通过 HTTPS 加密的。数据平面使用 LangSmith API 密钥向控制平面进行身份验证。

为了启用此出口，您可能需要将内部防火墙规则或云资源（例如安全组）更新为[allow certain IP addresses](/langsmith/cloud#ingress-into-langchain-saas)。

<Warning>
目前不支持 AWS/Azure PrivateLink 或 GCP Private Service Connect。该流量将通过互联网传输。
</Warning>

## Kubernetes 设置

以下步骤描述了如何将自托管数据平面连接到托管 LangSmith 控制平面。

### 先决条件

1. `KEDA` 安装在您的集群上。
    ```bash
      helm repo add kedacore https://kedacore.github.io/charts
      helm install keda kedacore/keda --namespace keda --create-namespace
    ```

    <Info>
    `KEDA`用于根据队列大小自动扩展部署系统。
    </Info>2. 您的集群上安装了有效的 `Ingress` 控制器。有关为部署配置入口的更多信息，请参阅[Create an ingress for installations](/langsmith/self-host-ingress)。我们强烈建议在生产设置中使用现代的[Gateway API](/langsmith/self-host-ingress#option-2%3A-gateway-api)。
3. 如果您计划让侦听器监视多个命名空间，则**必须**使用 [Gateway API](/langsmith/self-host-ingress#option-2%3A-gateway-api) 或 [Istio Gateway](/langsmith/self-host-ingress#option-3%3A-istio-gateway) 而不是 [standard ingress](/langsmith/self-host-ingress#option-1%3A-standard-ingress) 资源。标准入口资源只能将流量路由到同一命名空间中的服务，而网关或 Istio 网关可以将流量路由到跨多个命名空间的服务。
4. 您的集群中有足够的闲置空间用于多个部署。建议使用`Cluster-Autoscaler`自动配置新节点。
5. 您需要启用两个控制平面 URL 的出口。侦听器轮询这些端点以进行部署。使用与您的 LangSmith 区域匹配的对。

LangSmith 部署控制平面：

{/* 通过 `prefix` 更改“.langchain.com”之前的主机名（默认：“api.smith”）。
    传递 `suffix` 将路径（例如“/mcp”）附加到每个 URL。
    传递 `protocol={false}` 来渲染不带“https://”的主机名。 */}<table>
  <thead>
    <tr>
      <th>地区</th>
      <th>{协议===假？ “主机”：“URL”}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GCP 美国</td>
      <td><code>{`${protocol === false ? "" : "https://"}${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>GCP 欧盟</td>
      <td><code>{`${protocol === false ? "" : "https://"}eu.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>GCP 亚太地区</td>
      <td><code>{`${protocol === false ? "" : "https://"}apac.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>AWS 美国</td>
      <td><code>{`${protocol === false ? "" : "https://"}aws.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
  </tbody>
</table>

LangSmith API：

{/* 通过 `prefix` 更改“.langchain.com”之前的主机名（默认：“api.smith”）。
    传递 `suffix` 将路径（例如“/mcp”）附加到每个 URL。
    传递 `protocol={false}` 来渲染不带“https://”的主机名。 */}<table>
  <thead>
    <tr>
      <th>地区</th>
      <th>{协议===假？ “主机”：“URL”}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GCP 美国</td>
      <td><code>{`${protocol === false ? "" : "https://"}${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>GCP 欧盟</td>
      <td><code>{`${protocol === false ? "" : "https://"}eu.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>GCP 亚太地区</td>
      <td><code>{`${protocol === false ? "" : "https://"}apac.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>AWS 美国</td>
      <td><code>{`${protocol === false ? "" : "https://"}aws.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
  </tbody>
</table>

### 设置1. 向我们提供您的LangSmith组织ID。您的 LangSmith 组织将配置为在云中部署数据平面。
2. 从 LangSmith UI 创建监听器。 `Listener` 数据模型是针对实际的["listener" application](/langsmith/data-plane#listener-application) 配置的。
    1. 在左侧导航栏中，选择`Deployments` > `Listeners`。
    2. 在页面右上角，选择`+ Create Listener`。
    3. 为监听器输入唯一的`Compute ID`。 `Compute ID` 是用户定义的标识符，在当前 LangSmith 工作区中的所有侦听器中应该是唯一的。当最终用户创建新部署时，会向他们显示 `Compute ID`。确保`Compute ID`向最终用户提供有关其代理服务器部署将部署到的位置的上下文。例如，`Compute ID`可以设置为`k8s-cluster-name-dev-01`。在本例中，Kubernetes集群的名称是`k8s-cluster-name`，`dev`表示该集群是为“开发”工作负载保留的，`01`是一个数字后缀，以减少命名冲突。
    4. 输入一个或多个 Kubernetes 命名空间。稍后，“侦听器”应用程序将配置为部署到每个命名空间。
    5. 在页面右上角，选择`Submit`。6. 创建监听后，复制监听ID。稍后在 Kubernetes 集群中安装实际的“侦听器”应用程序时您将使用它（步骤 5）。
    <Info>
    **重要**
    从 LangSmith UI 创建侦听器不会在 Kubernetes 集群中安装“侦听器”应用程序。
    </Info>
3. 提供[Helm chart](https://github.com/langchain-ai/helm/tree/main/charts/langgraph-dataplane)用于在 Kubernetes 集群中安装必要的组件。
    - `langgraph-dataplane-listener`：这是一项监听 LangChain 的 [control plane](/langsmith/control-plane) 以了解部署更改并创建/更新下游 CRD 的服务。这是["listener" application](/langsmith/data-plane#listener-application)。
    - `LangGraphPlatform CRD`：LangSmith 部署的 CRD。这包含管理 LangSmith 部署实例的规范。
    - `langgraph-dataplane-operator`：此操作员处理对您的LangSmith CRD 的更改。
    - `langgraph-dataplane-redis`：`langgraph-dataplane-listener`使用Redis实例来管理各种任务（主要是创建和删除部署）。
4. 配置您的 `langgraph-dataplane-values.yaml` 文件。
    ```bash
      config:
        langsmithApiKey: "" # API Key of your Workspace
        langsmithWorkspaceId: "" # Workspace ID
        hostBackendUrl: "https://api.host.langchain.com" # Use the matching regional LangSmith Deployment control plane URL from the table above
        smithBackendUrl: "https://api.smith.langchain.com" # Use the matching regional LangSmith API URL from the table above
        langgraphListenerId: "" # Listener ID from Step 2f
        watchNamespaces: "" # comma-separated list of Kubernetes namespaces that the listener and operator will deploy to
        enableLGPDeploymentHealthCheck: true # enable/disable health check step for deployments

      ingress:
        hostname: "" # specify a hostname that will be configured for all deployments

      operator:
        enabled: true
        createCRDs: true # set this to `false` if the CRD has been previously installed in the current Kubernetes cluster
    ```
    - `config.langsmithApiKey`：`langgraph-listener` 部署通过LangChain 的 LangGraph 控制平面 API 和 `langsmithApiKey` 进行身份验证。- `config.langsmithWorkspaceId`：`langgraph-listener` 部署与LangSmith 工作区中的代理服务器部署耦合。换句话说，`langgraph-listener` 部署只能管理指定LangSmith 工作区 ID 中的 Agent Server 部署。
    - `config.langgraphListenerId`：除了与LangSmith工作区耦合之外，`langgraph-listener`部署还与侦听器耦合。创建新的代理服务器部署时，它会自动耦合到`langgraphListenerId`。指定 `langgraphListenerId` 可确保 `langgraph-listener` 部署只能管理与 `langgraphListenerId` 耦合的代理服务器部署。
    - `config.watchNamespaces`：`langgraph-listener` 部署将部署到的 Kubernetes 命名空间的逗号分隔列表。此列表应与步骤 2d 中指定的命名空间列表匹配。
    - `config.enableLGPDeploymentHealthCheck`：要禁用代理服务器运行状况检查，请将其设置为`false`。
    - `ingress.hostname`：作为部署工作流程的一部分，`langgraph-listener` 部署尝试调用代理服务器运行状况检查端点 (`GET /ok`) 以验证应用程序是否已正确启动。典型设置涉及为代理服务器部署创建共享 DNS 记录或域。这不是由 LangSmith 管理的。创建完成后，将`ingress.hostname`设置为域，它将用于完成健康检查。- `operator.createCRDs`：如果 Kubernetes 集群已安装 `LangGraphPlatform CRD`，请将此值设置为 `false`。安装过程中，如果已经安装了CRD，则会出现错误。如果同一个 Kubernetes 集群上部署了多个监听器，则可能会出现这种情况。
5. 部署 `langgraph-dataplane` Helm 图表。
    ```bash
      helm repo add langchain https://langchain-ai.github.io/helm/
      helm repo update
      helm upgrade -i langgraph-dataplane langchain/langgraph-dataplane --values langgraph-dataplane-values.yaml --wait --debug
    ```
6. 如果成功，您将看到命名空间中启动了三个服务。
    ```bash
      NAME                                            READY   STATUS              RESTARTS   AGE
      langgraph-dataplane-listener-6dd4749445-zjmr4   0/1     ContainerCreating   0          26s
      langgraph-dataplane-operator-6b88879f9b-t76gk   1/1     Running             0          26s
      langgraph-dataplane-redis-0                     1/1     Running             0          25s
    ```

    您的混合基础架构现在已准备好创建部署。

### 在同一集群中配置其他数据平面

要在同一集群中的不同命名空间中创建数据平面，请重复上述步骤并将 `-n` 选项传递给 `helm upgrade` 以指定不同的命名空间。**在同一集群中安装多个数据平面时，遵循以下规则非常重要：**
1. `config.watchNamespaces` 列表不应与其他安装`config.watchNamespaces` 相交。例如，如果安装 A 正在监视命名空间 `foo,bar`，则安装 B 无法监视 `foo` 或 `bar`。多个操作员或侦听器监视同一命名空间将导致意外行为。这意味着多个 LangSmith 工作区无法部署到同一个命名空间！请查看[cluster organization](#kubernetes-cluster-organization)部分以更好地理解这一点。
2. 需使用[Gateway API](/langsmith/self-host-ingress#option-2%3A-gateway-api)或[Istio Gateway](/langsmith/self-host-ingress#option-3%3A-istio-gateway)。依赖[standard ingress](/langsmith/self-host-ingress#option-1%3A-standard-ingress)资源可能会导致与同一集群中其他数据平面创建的Ingress对象发生冲突。由于这些情况下的行为取决于特定的入口控制器，因此这可能会导致不可预测或不期望的结果。

## 听众

在混合选项中，一个或多个 ["listener" applications](/langsmith/data-plane#listener-application) 可以运行，具体取决于 LangSmith 工作区和 Kubernetes 集群的组织方式。### Kubernetes集群组织
- 一个或多个监听器可以在 Kubernetes 集群中运行。
- 侦听器可以部署到该集群中的一个或多个命名空间中。
- 多个侦听器无法部署到同一命名空间。
- 集群所有者负责规划侦听器布局和代理服务器部署。

### LangSmith 工作区组织
- 工作区可以与一个或多个侦听器关联。
- 一个监听器只能与一个工作区关联。 LangSmith 工作空间到监听器是一对多的关系。
- 工作区只能部署到部署了其所有侦听器的 Kubernetes 集群。

## 用例

下面是一些常见的监听器配置（不严格要求）：

### 每个LangSmith工作区→单独的Kubernetes集群
- 集群`alpha`运行工作空间`A`
- 集群`beta`运行工作空间`B`

### 一个集群，每个工作区一个命名空间
- 集群`alpha`，命名空间`1`运行工作空间`A`
- 集群`alpha`，命名空间`2`运行工作空间`B`### 独立的集群，具有共享的“dev”集群
- 集群`alpha`运行工作空间`A`
- 集群`beta`运行工作空间`B`
- 集群`dev`运行工作空间`A`和`B`
- 两个工作区都有两个监听器；集群`dev`有两个监听器部署

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/hybrid-legacy.mdx) 或[file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>