<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Enable LangSmith Deployment | https://docs.langchain.com/langsmith/deploy-self-hosted-full-platform -->

# 启用LangSmith部署

添加控制平面和数据平面以在自托管LangSmith上部署和管理代理。

[LangSmith Deployment](/langsmith/deployment) 在您的安装中添加了 [control plane](/langsmith/control-plane) 和 [data plane](/langsmith/data-plane)。它允许您通过LangSmith UI 部署和管理代理。

对于可观察性和评估来说，部署是可选的。首先完成[Kubernetes installation](/langsmith/kubernetes)。其他可选功能请参见[Configure additional features](/langsmith/self-host-additional-features)。对于没有控制平面的代理服务器，请参阅[Standalone servers](/langsmith/deploy-standalone-server)。

<Info>
  LangSmith 部署需要[Enterprise](https://langchain.com/pricing) 计划。
</Info>

## 先决条件

<Steps>
  <Step title="Install the base LangSmith platform">
    在继续之前，请按照[Kubernetes installation guide](/langsmith/kubernetes) 安装基础LangSmith 平台。
  </Step>

  <Step title="Install KEDA">
    运行以下命令在集群上安装`KEDA`：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    helm repo add kedacore https://kedacore.github.io/charts
    helm upgrade --install keda kedacore/keda --namespace keda --create-namespace
    ```

    <Info>
      KEDA 根据队列大小自动扩展部署系统。
    </Info>
  </Step>

  <Step title="Configure an ingress">
    为您的 LangSmith 实例配置入口、网关或 Istio。所有代理都将部署为该入口后面的 Kubernetes 服务。参见[Set up an ingress](/langsmith/self-host-ingress)。您必须在 [⟦T16⟧](/langsmith/kubernetes#configure-your-helm-charts) 中提供 `hostname`。
  </Step>

  <Step title="Verify cluster capacity">
    确保您的集群具有可用于多个部署的可用容量。建议使用集群自动缩放程序。
  </Step><Step title="Verify storage">
    确保集群上有有效的动态 PV 配置程序或 PV。

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    kubectl get storageclass
    ```

    至少一个 StorageClass 应具有 `PROVISIONER` 值（不是 `kubernetes.io/no-provisioner`）并标记为 `(default)`，否则您必须在继续之前配置一个。
  </Step>

  <Step title="Verify egress">
    确保通往 `https://beacon.langchain.com` 的出口可用。请参阅[egress documentation](/langsmith/self-host-egress)。
  </Step>
</Steps>

## 启用LangSmith部署

### 组件

启用 LangSmith 部署会在集群中配置以下资源：

* `listener`：监听 [control plane](/langsmith/control-plane) 对部署的更改并创建或更新下游 CRD。
* `LangGraphPlatform CRD`：管理LangSmith部署的实例。
* `operator`：处理对 LangSmith CRD 的更改。
* `host-backend`：[control plane](/langsmith/control-plane)。

### 启用该功能

要启用 LangSmith 部署，请更新您的 [⟦T25⟧](/langsmith/kubernetes#configure-your-helm-charts)：

<Steps>
  <Step title="Enable deployment in your config">
    在您的`langsmith_config.yaml`中，启用`deployment`选项。您还必须配置有效的入口。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    config:
      deployment:
        enabled: true
    ```

    <Note>
      从 v0.12.0 开始，`langgraphPlatform` 选项已弃用。 v0.12.0 之后的任何版本都使用 `config.deployment`。
    </Note>
  </Step>

  <Step title="(Optional) Configure image mirroring">
    如果您需要将映像镜像到私有注册表，请在 [⟦T32⟧](/langsmith/kubernetes#configure-your-helm-charts) 中配置 `hostBackendImage` 和 `operatorImage` 选项。使用[latest LangSmith Helm chart release](https://github.com/langchain-ai/helm/releases)中指定的图像标签。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    hostBackendImage:
      repository: "docker.io/langchain/hosted-langserve-backend"
      pullPolicy: IfNotPresent
    operatorImage:
      repository: "docker.io/langchain/langgraph-operator"
      pullPolicy: IfNotPresent
    ```
  </Step><Step title="(Optional) Configure base agent templates">
    如果您需要自定义 Operator 创建代理 Kubernetes 资源的方式，请覆盖 [base agent templates in ⟦T33⟧](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/values.yaml#L1428)。最常见的用例是添加 `imagePullSecrets` 以使用私有容器注册表进行身份验证。详情请参阅[Configure authentication for private registries](#configure-authentication-for-private-registries)。
  </Step>

  <Step title="Apply the changes">
    运行以下命令以应用更改。每当您被要求应用更改时，本指南中都会使用此命令。将 `<version>` 和 `<namespace>` 替换为您的值：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
    ```

    在继续之前验证新的 Pod 是否正在运行：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    kubectl get pods -n <namespace>
    ```

    您的实例现在已准备好创建部署。
  </Step>
</Steps>

## 可选配置

### 配置额外的数据平面

<Warning>
  **不推荐；已计划弃用。** 不推荐通过控制平面配置其他数据平面，并且将在未来版本中弃用。相反，部署 [standalone Agent Servers](/langsmith/deploy-standalone-server) 并将其配置为跟踪您的自托管 LangSmith 实例。
</Warning>

除了上面创建的数据平面之外，您还可以在不同的 Kubernetes 集群或不同命名空间下的同一集群中创建更多数据平面。有多种方法可以实现此目的，因此请实施最适合您的用例的解决方案。#### 先决条件

<Steps>
  <Step title="Review cluster organization">
    通读 [hybrid (legacy) documentation](/langsmith/hybrid-legacy#listeners) 中的集群组织指南，了解如何针对您的用例进行组织。
  </Step>

  <Step title="Verify hybrid prerequisites">
    验证新集群的 [hybrid section](/langsmith/hybrid-legacy#prerequisites) 中的先决条件。在[prerequisites](/langsmith/hybrid-legacy#prerequisites)的步骤5中，配置到[self-hosted LangSmith instance](/langsmith/self-host-usage#configuring-the-application-you-want-to-use-with-langsmith)的出口，而不是`https://api.host.langchain.com`和`https://api.smith.langchain.com`。
  </Step>

  <Step title="Enable the feature in Postgres">
    针对您的 LangSmith Postgres 实例运行以下命令以启用此功能。记下工作区 ID 以供后续步骤使用。

    ```sql theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    update organizations set config = config || '{"enable_lgp_listeners_page": true}' where id = '<org id here>';
    update tenants set config = config || '{"langgraph_remote_reconciler_enabled": true}' where id = '<workspace id here>';
    ```
  </Step>
</Steps>

#### 部署到不同的集群

<Steps>
  <Step title="Follow the hybrid setup guide">
    按照 [hybrid setup guide](/langsmith/hybrid-legacy#setup) 中的步骤 2 至 6 进行操作。将 `config.langsmithWorkspaceId` 设置为上一步中的工作区 ID。
  </Step>

  <Step title="(Optional) Add more data planes to the same cluster">
    要将多个数据平面添加到同一集群，请按照[configuring additional data planes in the same cluster](/langsmith/hybrid-legacy#configuring-additional-data-planes-in-the-same-cluster)的说明进行操作。
  </Step>
</Steps>

#### 部署到同一集群中的不同命名空间

<Steps>
  <Step title="Update your config">
    在您的[⟦T40⟧](/langsmith/kubernetes#configure-your-helm-charts)中，进行以下修改：

    * 将 `operator.watchNamespaces` 设置为您的自托管 LangSmith 实例正在运行的当前命名空间。这可以防止与新数据平面添加的运算符发生冲突。
    * 使用 [Gateway API](/langsmith/self-host-ingress#option-2%3A-gateway-api) 或 [Istio Gateway](/langsmith/self-host-ingress#option-3%3A-istio-gateway)。相应地调整您的`langsmith_config.yaml`。
  </Step>

  <Step title="Apply the changes">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
    ```
  </Step><Step title="Follow the hybrid setup guide">
    按照 [hybrid setup guide](/langsmith/hybrid-legacy#setup) 中的步骤 2 至 6 进行操作。将 `config.langsmithWorkspaceId` 设置为上一步中的工作区 ID。将 `config.watchNamespaces` 设置为与现有数据平面使用的名称空间不同的名称空间。
  </Step>

  <Step title="(Optional) Configure log access">
    配置控制平面的访问权限以从新命名空间读取代理服务器部署日志。参见[Read Agent Server logs from other namespaces](#read-agent-server-logs-from-other-namespaces)。
  </Step>
</Steps>

### 配置私有注册表的身份验证

如果您的 [Agent Server deployments](/langsmith/agent-server) 将使用私有容器注册表（例如，AWS ECR、Azure ACR 或 GCP Artifact Registry）中的映像，请配置映像拉取密钥。此配置自动应用于所有部署，允许它们通过您的私有注册表进行身份验证。

<Steps>
  <Step title="Create a Kubernetes image pull secret">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    kubectl create secret docker-registry langsmith-registry-secret \
        --docker-server=myregistry.com \
        --docker-username=your-username \
        --docker-password=your-password \
        --docker-email=your-email@example.com \
        -n langsmith
    ```

    将这些值替换为您的注册表凭据：

    * `myregistry.com`：您的注册表 URL
    * `your-username`：您的注册表用户名
    * `your-password`：您的注册表密码或访问令牌
    * `langsmith`：安装LangSmith的 Kubernetes 命名空间
  </Step>

  <Step title="Configure the deployment template in your langsmith_config.yaml">
    要使代理服务器部署能够使用私有注册表密钥，请将 `imagePullSecrets` 添加到操作员的部署模板中：

    ```yaml {21-22} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    operator:
      templates:
        deployment: |
          apiVersion: apps/v1
          kind: Deployment
          metadata:
            name: ${name}
            namespace: ${namespace}
          spec:
            replicas: ${replicas}
            revisionHistoryLimit: 10
            selector:
              matchLabels:
                app: ${name}
            template:
              metadata:
                labels:
                  app: ${name}
              spec:
                enableServiceLinks: false
                imagePullSecrets:
                - name: langsmith-registry-secret
                containers:
                - name: api-server
                  image: ${image}
                  ports:
                  - name: api-server
                    containerPort: 8000
                    protocol: TCP
                  livenessProbe:
                    httpGet:
                      path: /ok
                      port: 8000
                    periodSeconds: 15
                    timeoutSeconds: 5
                    failureThreshold: 6
                  readinessProbe:
                    httpGet:
                      path: /ok
                      port: 8000
                    periodSeconds: 15
                    timeoutSeconds: 5
                    failureThreshold: 6
    ```
  </Step>

  <Step title="Apply the changes">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
    ```通过LangSmith UI 创建的所有用户部署都将继承这些注册表凭据。
  </Step>
</Steps>

有关注册表特定的身份验证方法，请参阅[Kubernetes documentation on pulling images from private registries](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/)。

### 从其他命名空间读取代理服务器日志

<Warning>
  对于控制平面 (`host-backend`) 和数据平面 (`listener`) 部署在不同 Kubernetes 集群中的自托管部署，不支持检索服务器日志。
</Warning>

对于控制平面和数据平面位于同一集群中的部署，请确保控制平面 Kubernetes 部署 (`host-backend`) 具有 `get`、`list` 和 `watch` Kubernetes `deployments`、`pods`、`replicasets` 和 `logs` 的权限代理服务器部署所在的命名空间。有不同的方法可以实现这一目标。以下示例使用 Kubernetes RBAC，但请使用最适合您的用例的方法：

<Steps>
  <Step title="Create a Role with the required permissions">
    在代理服务器命名空间中创建一个`Role`。替换`<data_plane_namespace>`：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    kubectl apply -n <data_plane_namespace> -f - <<EOF
    apiVersion: rbac.authorization.k8s.io/v1
    kind: Role
    metadata:
      name: read-agent-server-logs-role
    rules:
    - apiGroups: [""]
      resources: ["pods"]
      verbs: ["get","list","watch"]
    - apiGroups: [""]
      resources: ["pods/log"]
      verbs: ["get","watch"]
    - apiGroups: ["apps"]
      resources: ["deployments"]
      verbs: ["get","list","watch"]
    - apiGroups: ["apps"]
      resources: ["replicasets"]
      verbs: ["get","list","watch"]
    EOF
    ```
  </Step>

  <Step title="Get the control plane ServiceAccount">
    替换`<control_plane_namespace>`：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    kubectl get serviceaccounts -n <control_plane_namespace> | grep host-backend
    ```
  </Step>

  <Step title="Bind the Role to the control plane ServiceAccount">
    替换 `<data_plane_namespace>`、`<control_plane_namespace>` 和 `<control_plane_service_account>`：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    kubectl apply -n <data_plane_namespace> -f - <<EOF
    apiVersion: rbac.authorization.k8s.io/v1
    kind: RoleBinding
    metadata:
      name: read-agent-server-logs-role-binding
    subjects:
    - kind: ServiceAccount
      name: <control_plane_service_account>
      namespace: <control_plane_namespace>
    roleRef:
      apiGroup: rbac.authorization.k8s.io
      kind: Role
      name: read-agent-server-logs-role
    EOF
    ```
  </Step>
</Steps><Note>
  在此示例中，Role 和 RoleBinding 在与代理服务器部署相同的 Kubernetes 命名空间中定义。您可以为 Role 和 RoleBinding 分配任何名称，并根据需要自定义它们。
</Note>

## 后续步骤

启用 LangSmith 部署后，请参阅 [Deploy with control plane](/langsmith/deploy-with-control-plane) 通过 LangSmith UI 构建和部署应用程序。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-self-hosted-full-platform.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>