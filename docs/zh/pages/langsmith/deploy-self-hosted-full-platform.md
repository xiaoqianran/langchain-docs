<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Enable additional LangSmith features | https://docs.langchain.com/langsmith/deploy-self-hosted-full-platform -->

# 启用额外的LangSmith功能

在自托管 LangSmith 实例上启用 LangSmith 部署、队列、见解、聊天、沙盒和引擎。

除了基础 [LangSmith](/langsmith/self-hosted) 平台之外，您还可以在 LangSmith 自托管上启用以下功能：

* **[LangSmith Deployment](/langsmith/deployment)** 添加了 [control plane](/langsmith/control-plane) 和 [data plane](/langsmith/data-plane)，让您可以直接通过 LangSmith UI 部署、扩展和管理代理和应用程序。如果您不需要完整的基于 UI 的设置，请参阅 [standalone servers](/langsmith/deploy-standalone-server) 以获得轻量级替代方案。
* **[Fleet](/langsmith/fleet/index)** 允许您直接在 LangSmith 中创建、部署和管理 AI 代理，无需任何代码。
* **[Insights](/langsmith/insights)** 在 LangSmith 中提供人工智能驱动的跟踪和应用程序数据分析。
* **[Chat](/langsmith/chat)** 提供工作区中的聊天体验，帮助您分析跟踪、线程、提示和实验结果。
* **[Sandboxes](/langsmith/sandboxes)** 让用户运行代码、公开临时服务并从 LangSmith 创建内存快照。
* **[Engine](/langsmith/engine-overview)** 查找跟踪项目中重复出现的问题，根据源代码对其进行诊断，并提出修复建议。引擎需要沙箱。

<Info>
  这些功能需要[Enterprise](https://langchain.com/pricing)计划。 [Get a demo](https://www.langchain.com/contact-sales) 了解更多。
</Info>

## 先决条件<Steps>
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
    为您的 LangSmith 实例配置入口、网关或 Istio。所有代理都将部署为该入口后面的 Kubernetes 服务。参见[Set up an ingress](/langsmith/self-host-ingress)。您必须在 [⟦T69⟧](/langsmith/kubernetes#configure-your-helm-charts) 中提供 `hostname`。
  </Step>

  <Step title="Verify cluster capacity">
    确保您的集群具有可用于多个部署的可用容量。建议使用集群自动缩放程序。
  </Step>

  <Step title="Verify storage">
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

启用 LangSmith 部署会在集群中配置以下资源：* `listener`：监听 [control plane](/langsmith/control-plane) 对部署的更改并创建或更新下游 CRD。
* `LangGraphPlatform CRD`：管理LangSmith部署的实例。
* `operator`：处理对 LangSmith CRD 的更改。
* `host-backend`：[control plane](/langsmith/control-plane)。

### 启用该功能

要启用 LangSmith 部署，请更新您的 [⟦T78⟧](/langsmith/kubernetes#configure-your-helm-charts)：

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
    如果您需要将映像镜像到私有注册表，请在 [⟦T85⟧](/langsmith/kubernetes#configure-your-helm-charts) 中配置 `hostBackendImage` 和 `operatorImage` 选项。使用[latest LangSmith Helm chart release](https://github.com/langchain-ai/helm/releases)中指定的图像标签。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    hostBackendImage:
      repository: "docker.io/langchain/hosted-langserve-backend"
      pullPolicy: IfNotPresent
    operatorImage:
      repository: "docker.io/langchain/langgraph-operator"
      pullPolicy: IfNotPresent
    ```
  </Step>

  <Step title="(Optional) Configure base agent templates">
    如果您需要自定义 Operator 创建代理 Kubernetes 资源的方式，请覆盖 [base agent templates in ⟦T86⟧](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/values.yaml#L1428)。最常见的用例是添加 `imagePullSecrets` 以使用私有容器注册表进行身份验证。详情请参阅[Configure authentication for private registries](#configure-authentication-for-private-registries)。
  </Step>

  <Step title="Apply the changes">
    运行以下命令以应用更改。每当您被要求应用更改时，本指南中都会使用此命令。将 `<version>` 和 `<namespace>` 替换为您的值：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
    ```在继续之前验证新的 Pod 是否正在运行：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    kubectl get pods -n <namespace>
    ```

    您的实例现在已准备好创建部署。
  </Step>
</Steps>

## 启用队列、见解和聊天

<Info>
  舰队需要[LangSmith Self-Hosted v0.13](https://changelog.langchain.com/announcements/langsmith-self-hosted-v0-13)或更高版本。下面描述的独立部署模型需要 v0.15 或更高版本。
</Info>

每个功能都需要 Fernet 加密密钥。您可以在单个 Helm 配置中启用所有三个功能。

### 组件

启用这些功能会在集群中为每个功能（队列、见解、聊天）配置以下组件：

* `api-server`：处理功能请求的主要 API 服务器。
* `queue`：后台任务处理队列。
* `postgres`：用于功能数据的专用 PostgreSQL 实例。可以替换为外部 PostgreSQL 实例。
* `redis`：用于功能缓存和发布/订阅的专用 Redis 实例。可以替换为外部 Redis 实例。

舰队另外规定：

* `toolServer`：为代理提供MCP工具执行。
* `triggerServer`：处理 webhook 和计划触发器。<Warning>
  从图表 `0.16.0` 开始，Insights 在 `langsmith-insights-engine` 上运行，这是一个同时服务于 `insights` 和 `engine` 图表的组合图像，图表默认使用它。之前的仅 Insights 图像 `langsmith-clio` 已停用。

  如果您的值引脚 `images.engineInsightsAgentImage.repository` 至 `langsmith-clio`，请在升级之前删除或更新该引脚。图表拒绝了它。如果您将映像镜像到私有注册表，请镜像 `langsmith-insights-engine` 并将存储库指向您的副本。参见[Mirroring images](/langsmith/self-host-mirroring-images#additional-images-for-engine)。
</Warning>

### 生成加密密钥

每个功能都使用自己的 Fernet 加密密钥来加密特定于功能的秘密，例如凭证和令牌。单独的密钥允许独立轮换，并在密钥被泄露时限制暴露。使用 Python 为每个功能生成一个密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

我们建议将每个密钥存储在预定义的 Kubernetes 密钥中，而不是直接在配置文件中设置它们。相关参数见[Use an existing secret](/langsmith/self-host-using-an-existing-secret#parameters)：`agent_builder_encryption_key`、`insights_encryption_key`、`polly_encryption_key`。

### 启用功能

<Steps>
  <Step title="Add the configuration to your langsmith_config.yaml">
    <Tabs>
      <Tab title="Using Kubernetes secrets (recommended)">
        按名称引用您现有的机密。图表会自动从中读取 `agent_builder_encryption_key`、`insights_encryption_key` 和 `polly_encryption_key`。

        ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        config:
          existingSecretName: "<your-secret-name>"

        fleet:
          enabled: true

        insights:
          enabled: true

        # Chat (formerly Polly)
        polly:
          enabled: true

        fleetToolServer:
          enabled: true

        fleetTriggerServer:
          enabled: true
        ```
      </Tab><Tab title="Using inline values">
        直接在配置文件中设置加密密钥。避免将此文件提交给版本控制。

        ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        fleet:
          enabled: true
          encryptionKey: "<fleet-encryption-key>"

        insights:
          enabled: true
          encryptionKey: "<insights-encryption-key>"

        polly:
          enabled: true
          encryptionKey: "<chat-encryption-key>"

        fleetToolServer:
          enabled: true

        fleetTriggerServer:
          enabled: true
        ```
      </Tab>
    </Tabs>

    <Warning>
      如果您要从旧版 `agentBootstrap` 部署模型迁移，请禁用 `backend.agentBootstrap` 以及旧的 `config.agentBuilder`、`config.insights` 和 `config.polly` 标志。这些是 `config` 部分下的标志，而不是上面显示的顶级 `fleet`、`insights` 和 `polly` 标志。

      您还必须通过 LangSmith 部署 UI 手动删除现有的队列、Insights 和 Chat 部署。如果您未将外部 PostgreSQL 数据库用于具有旧版 `agentBootstrap` 模型的 Fleet，并且想要保留现有的 Fleet 代理，请在应用此配置之前通过 [Support Portal](https://support.langchain.com) 联系技术支持。
    </Warning>

    <Note>
      舰队需要`fleetToolServer` 和`fleetTriggerServer`。从 Helm Chart v15 开始，它们取代了已弃用的 `agentBuilderToolServer` 和 `agentBuilderTriggerServer` 键。
    </Note>

    默认情况下，每个功能都会部署自己专用的 PostgreSQL 和 Redis 实例。要改用外部数据库，请在每个功能下配置 `postgres.external` 和 `redis.external` 部分。例如：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    fleet:
      enabled: true
      encryptionKey: "<fleet-encryption-key>"
      postgres:
        external:
          enabled: true
          connectionUrl: "<fleet-postgres-connection-url>"
      redis:
        external:
          enabled: true
          connectionUrl: "<fleet-redis-connection-url>"
    ```
  </Step>

  <Step title="Apply the changes">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
    ```验证 Fleet、Insights 和 Chat pod 是否正在运行：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    kubectl get pods -n <namespace>
    ```
  </Step>
</Steps>

### （可选）为队列启用 OAuth 工具和触发器

要在 Fleet 中启用基于 OAuth 的工具（例如 Gmail、Slack 或 Linear），请配置 `providerOrgId` 并为要使用的每个集成添加提供商 ID。您可以启用提供商的任意组合。

#### 可用的提供商

|供应商|启用工具 |触发器已启用 |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ---------------- |
| `googleOAuthProvider`<br />[setup guide](#google-oauth-provider) | Gmail、Google 日历、<br />Google 表格、BigQuery |邮箱 |
| `linearOAuthProvider`<br />[setup guide](#linear-oauth-provider) |线性| - |
| `linkedinOAuthProvider`<br />[setup guide](#linkedin-oauth-provider) |领英 | - |
| `microsoftOAuthProvider`<br />[setup guide](#microsoft-oauth-provider) | Outlook、日历、团队、SharePoint、<br />Word、Excel、PowerPoint |展望 || `salesforceOAuthProvider`<br />[setup guide](#salesforce-oauth-provider) |销售人员 | - |
| `slackOAuthProvider`<br />[setup guide](#slack-oauth-provider) |松弛|松弛|

#### 通用配置

将以下内容添加到您的[⟦T133⟧](/langsmith/kubernetes#configure-your-helm-charts)。仅包含您需要的提供商。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
fleet:
  oauth:
    # Organization ID where OAuth providers are configured
    providerOrgId: "<your-org-id>"
    # Add provider IDs for integrations you want to enable.
    slackOAuthProvider: "<provider-id>"
    googleOAuthProvider: "<provider-id>"
    linkedinOAuthProvider: "<provider-id>"
    linearOAuthProvider: "<provider-id>"
    microsoftOAuthProvider: "<provider-id>"
    salesforceOAuthProvider: "<provider-id>"
```

<Warning>
  提供商 ID 必须是唯一的，并且不能以 `-agent-builder` 或 `-oauth-provider` 结尾。
</Warning>

#### 提供商设置指南

<AccordionGroup>
  <Accordion title="Google OAuth provider">
    要为 Fleet 启用 Google OAuth，请在 GCP 中创建 OAuth 客户端，并使用所需的 URL 和凭据对其进行配置。

    <Steps>
      <Step title="Create OAuth client in GCP">
        在 [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 中创建一个新的 OAuth 客户端应用程序（Web 应用程序）。
      </Step>

      <Step title="Add URLs to GCP">
        将以下 URL 添加到您的 OAuth 客户端，将 `<hostname>` 替换为您的 LangSmith 主机名，将 `<provider-id>` 替换为您将使用的提供商 ID（例如，`google`）：

        **授权的 JavaScript 来源：**

        * `https://<hostname>`

        **授权重定向 URI：**

        * `https://<hostname>/api-host/v2/auth/callback/<provider-id>`
        * `https://<hostname>/host-oauth-callback/<provider-id>`
      </Step>

      <Step title="Copy credentials">
        从 GCP OAuth 应用复制 **客户端 ID** 和 **客户端密钥**。
      </Step><Step title="Configure OAuth provider in LangSmith">
        在 LangSmith 中，转到 **设置 > OAuth 提供商** 并添加新的提供商：

        * **客户端 ID**：来自 GCP
        * **客户端秘密**：来自 GCP
        * **授权网址**：`https://accounts.google.com/o/oauth2/auth`
        * **令牌 URL**：`https://oauth2.googleapis.com/token`
        * **提供商 ID**：唯一字符串，例如：`google`
      </Step>

      <Step title="Apply the changes">
        将 LangSmith OAuth 提供商 ID 添加到您的 [⟦T145⟧](/langsmith/kubernetes#configure-your-helm-charts) 并部署：

        ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        fleet:
          oauth:
            providerOrgId: "<your-org-id>"
            googleOAuthProvider: "<provider-id>"
        ```

        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
        ```
      </Step>
    </Steps>
  </Accordion>

  <Accordion title="Microsoft OAuth provider">
    要为 Fleet 启用 Microsoft OAuth，请创建 Azure 应用程序注册，添加所需的 Microsoft Graph 委派权限，并在 LangSmith 中配置 Microsoft OAuth 提供程序。

    <Steps>
      <Step title="Create an Azure app registration">
        在 [Microsoft Entra admin center](https://entra.microsoft.com/) 中，转到 **应用程序 > 应用程序注册** 并创建一个新的注册。
      </Step>

      <Step title="Choose supported account types">
        选择与您的部署匹配的帐户类型。如果需要来自多个 Microsoft Entra 租户的用户进行身份验证，请选择多租户选项。如果您的部署仅限于一个租户，您可以使用单租户应用程序注册。
      </Step><Step title="Add the redirect URI">
        添加以下 Web 重定向 URI，将 `<hostname>` 替换为您的 LangSmith 主机名，将 `<provider-id>` 替换为您的提供商 ID：

        ```
        https://<hostname>/host-oauth-callback/<provider-id>
        ```
      </Step>

      <Step title="Create a client secret">
        在**证书和机密**中，创建一个新的客户端机密。复制 **应用程序（客户端）ID** 和生成的客户端密钥值。
      </Step>

      <Step title="Add Microsoft Graph delegated permissions">
        在 **API 权限** 中，添加以下 Microsoft Graph 委派权限：

        * `Mail.ReadWrite`
        * `Mail.Send`
        * `Calendars.ReadWrite`
        * `Team.ReadBasic.All`
        * `Channel.ReadBasic.All`
        * `Channel.Create`
        * `ChannelMessage.Send`
        * `ChannelMessage.Read.All`
        * `Chat.Create`
        * `Chat.ReadWrite`
        * `User.ReadBasic.All`
        * `Files.ReadWrite.All`
        * `Sites.ReadWrite.All`

        <Note>
          LangSmith 自动向 Microsoft 提供商请求 `offline_access`，以便用户可以接收刷新令牌。
        </Note>
      </Step>

      <Step title="Grant tenant consent">
        如果您的 Microsoft 365 策略需要这些委派权限，请向租户授予管理员同意。
      </Step>

      <Step title="Configure OAuth provider in LangSmith">
        在 LangSmith 中，转到 **设置 > OAuth 提供商** 并添加新的提供商：* **名称**：例如，`Microsoft`
        * **提供商 ID**：唯一字符串，例如：`microsoft-oauth-provider`
        * **客户端 ID**：来自 Azure 的应用程序（客户端）ID
        * **客户端密钥**：来自 Azure 的客户端密钥值
        * **授权网址**：`https://login.microsoftonline.com/common/oauth2/v2.0/authorize`
        * **令牌 URL**：`https://login.microsoftonline.com/common/oauth2/v2.0/token`
        * **提供商类型**：`microsoft`
        * **令牌端点身份验证方法**：`client_secret_post`

        <Note>
          如果您创建了单租户应用程序注册，请将授权和令牌 URL 中的 `common` 替换为您的租户 ID。
        </Note>
      </Step>

      <Step title="Apply the changes">
        将以下内容添加到您的 [⟦T169⟧](/langsmith/kubernetes#configure-your-helm-charts) 并部署：

        ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        fleet:
          oauth:
            providerOrgId: "<your-org-id>"
            microsoftOAuthProvider: "<provider-id>"
        ```

        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
        ```
      </Step>
    </Steps>
  </Accordion>

  <Accordion title="Linear OAuth provider">
    要为 Fleet 启用 Linear OAuth，请创建 Linear OAuth 应用程序并使用所需的凭据对其进行配置。

    <Steps>
      <Step title="Create a Linear OAuth app">
        转到 [Linear Settings > API > Applications](https://linear.app/settings/api/applications/new) 并创建一个新的 OAuth 应用程序。
      </Step>

      <Step title="Add callback URL">
        设置回调 URL，将 `<hostname>` 替换为您的 LangSmith 主机名，将 `<provider-id>` 替换为您的提供商 ID：

        ```
        https://<hostname>/host-oauth-callback/<provider-id>
        ```
      </Step>

      <Step title="Copy credentials">
        创建应用程序后，复制 **客户端 ID** 和 **客户端密钥**。
      </Step><Step title="Configure OAuth provider in LangSmith">
        在 LangSmith 中，转到 **设置 > OAuth 提供商** 并添加新的提供商：

        * **客户端 ID**：来自 Linear 应用程序
        * **客户端秘密**：来自 Linear 应用程序
        * **授权网址**：`https://linear.app/oauth/authorize`
        * **令牌 URL**：`https://api.linear.app/oauth/token`
        * **提供商 ID**：唯一字符串，例如：`linear`
      </Step>

      <Step title="Apply the changes">
        将以下内容添加到您的 [⟦T175⟧](/langsmith/kubernetes#configure-your-helm-charts) 并部署：

        ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        fleet:
          oauth:
            providerOrgId: "<your-org-id>"
            linearOAuthProvider: "<provider-id>"
        ```

        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
        ```
      </Step>
    </Steps>
  </Accordion>

  <Accordion title="LinkedIn OAuth provider">
    要为 Fleet 启用 LinkedIn OAuth，请创建 LinkedIn OAuth 应用程序并使用所需的凭据对其进行配置。

    <Steps>
      <Step title="Create a LinkedIn OAuth app">
        转到 [linkedin.com/developers/apps](https://www.linkedin.com/developers/apps/) 并创建一个新应用程序。
      </Step>

      <Step title="Add redirect URI">
        在您的应用程序设置中，转到 **Auth** 选项卡。添加以下重定向 URI，将 `<hostname>` 替换为您的 LangSmith 主机名，将 `<provider-id>` 替换为您的提供商 ID：

        ```
        https://<hostname>/host-oauth-callback/<provider-id>
        ```
      </Step>

      <Step title="Copy credentials">
        从“身份验证”选项卡复制 **客户端 ID** 和 **客户端密钥**。
      </Step>

      <Step title="Configure OAuth provider in LangSmith">
        在 LangSmith 中，转到 **设置 > OAuth 提供商** 并添加新的提供商：* **客户 ID**：来自 LinkedIn 应用程序
        * **客户秘密**：来自 LinkedIn 应用程序
        * **授权网址**：`https://www.linkedin.com/oauth/v2/authorization`
        * **令牌 URL**：`https://www.linkedin.com/oauth/v2/accessToken`
        * **提供商 ID**：唯一字符串，例如：`linkedin`
      </Step>

      <Step title="Apply the changes">
        将以下内容添加到您的 [⟦T181⟧](/langsmith/kubernetes#configure-your-helm-charts) 并部署：

        ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        fleet:
          oauth:
            providerOrgId: "<your-org-id>"
            linkedinOAuthProvider: "<provider-id>"
        ```

        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
        ```
      </Step>
    </Steps>
  </Accordion>

  <Accordion title="Salesforce OAuth provider">
    要为 Fleet 启用 Salesforce OAuth，请创建 Salesforce 外部客户端应用程序，配置其 OAuth 设置和策略，检索其凭据，然后在 LangSmith 中配置 Salesforce OAuth 提供程序。

    <Steps>
      <Step title="Create an External Client App">
        在 Salesforce **设置**中，使用 **快速查找** 打开 **外部客户端应用程序管理器**，然后单击 **新建外部客户端应用程序**。

        在**基本信息**下，设置：

        * **外部客户端应用程序名称**：例如，`LangSmith Fleet`
        * **联系电子邮件**：管理员电子邮件地址
        * **分布状态**：**本地**<Note>
          外部客户端应用程序是 Salesforce 当前用于 OAuth 集成的框架。如果**新外部客户端应用程序**不可用，请确认在**设置 > 外部客户端应用程序设置**下为您的组织启用了应用程序创建。
        </Note>
      </Step>

      <Step title="Enable OAuth and configure the OAuth settings">
        展开 **API（启用 OAuth 设置）** 并选择 **启用 OAuth**。然后配置：

        * **回调 URL**，将 `<hostname>` 替换为您的 LangSmith 主机名，将 `<provider-id>` 替换为您的提供商 ID：

        ```
        https://<hostname>/host-oauth-callback/<provider-id>
        ```

        * **选定的 OAuth 范围**：添加 **通过 API (api) 管理用户数据** 和 **随时执行请求（刷新\_token、离线\_access）**。
        * 保持选中**需要 Web 服务器流的秘密**。
        * 保留 **启用授权代码和凭据流** 和 **启用客户端凭据流** 未选中。 Fleet 使用标准 Web 服务器（授权代码）流程。

        单击**创建**。
      </Step>

      <Step title="Set the OAuth policies">
        打开应用程序，选择“**策略**”选项卡，然后单击“**编辑**”：* **刷新令牌策略**：选择**刷新令牌在撤销前有效**。
        * **允许的用户**：离开**所有用户可以自行授权**。如果您选择 **管理员批准的用户已预先授权**，则必须首先将应用程序分配给权限集或配置文件，否则授权会失败。

        单击**保存**。

        <Note>
          外部客户端应用程序在两个位置进行配置：**设置**（上一步中的 OAuth 定义）和 **策略**（此步骤）。两者都必须得救。
        </Note>
      </Step>

      <Step title="Copy the credentials">
        在“**设置**”选项卡上的“**OAuth 设置**”下，选择“**消费者密钥和秘密**”。 **消费者密钥**是您的客户端 ID，**消费者秘密**是您的客户端秘密。

        <Note>
          创建应用程序后，在首次连接尝试之前最多允许 30 分钟的时间进行传播。
        </Note>
      </Step>

      <Step title="Configure OAuth provider in LangSmith">
        在LangSmith中，进入**设置 > OAuth 提供商**，点击**OAuth 提供商**，然后填写：* **提供商 ID**：唯一字符串，例如：`salesforce-oauth-provider`。在下一步中对 `salesforceOAuthProvider` 使用相同的值。
        * **显示名称**：例如，`Salesforce`
        * **客户端 ID**：来自 Salesforce 的消费者密钥
        * **客户秘密**：来自 Salesforce 的消费者秘密
        * **授权网址**：`https://<MyDomain>.my.salesforce.com/services/oauth2/authorize`
        * **令牌 URL**：`https://<MyDomain>.my.salesforce.com/services/oauth2/token`

        LangSmith 自动从令牌 URL 识别 Salesforce，因此无需设置提供程序类型或令牌验证方法字段。关闭 **启用 PKCE** 以匹配上面配置的 Web 服务器流。

        <Note>
          将 `<MyDomain>` 替换为您组织的 My Domain（位于 **设置 > My Domain** 下）。对于沙箱，请使用 `https://<MyDomain>--<SandboxName>.sandbox.my.salesforce.com/services/oauth2/authorize` 和匹配的令牌 URL。
        </Note>
      </Step>

      <Step title="Apply the changes">
        将以下内容添加到您的 [⟦T192⟧](/langsmith/kubernetes#configure-your-helm-charts) 并部署：

        ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        fleet:
          oauth:
            providerOrgId: "<your-langsmith-org-id>"
            salesforceOAuthProvider: "<provider-id>"
        ```

        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
        ```
      </Step>
    </Steps><Warning>
      如果登录失败：确认 Salesforce 中的 **回调 URL** 与 `https://<hostname>/host-oauth-callback/<provider-id>` 完全匹配（HTTPS，无尾部斜杠）；如果您选择**管理员批准的用户已预先授权**，请通过权限集分配应用程序；如果您的组织强制执行登录 IP 范围，请在用户的个人资料中将您的队列服务器的出口 IP 列入白名单，或在应用程序的策略中将 **IP 放宽** 设置为 **放宽 IP 限制**。
    </Warning>
  </Accordion>

  <Accordion title="Slack OAuth provider">
    一个 Slack OAuth 提供商为您添加到各个代理的 Slack 工具和 Slack 应用程序提供支持，因此 Slack 设置可以与 Slack 集成的其余部分一起使用。

    有关完整演练，请参阅 [Set up Slack on Self-hosted](/langsmith/fleet/slack-app#set-up-slack-on-self-hosted)。它涵盖了创建 Slack 应用程序、添加机器人范围、注册提供程序、设置重定向 URI 以及配置 Helm 值。
  </Accordion>
</AccordionGroup>

### （可选）为队列启用 GitHub 应用程序

Fleet 通过专用的 **GitHub 应用程序**（不是 OAuth 应用程序）与 GitHub 集成。 GitHub 应用程序为 Fleet 的 GitHub 工具提供存储库访问，并支持私有存储库访问所需的用户授权流程。设置涉及创建 GitHub 应用程序、收集其凭据、将其存储为 Kubernetes 机密，以及从您的 [⟦T194⟧](/langsmith/kubernetes#configure-your-helm-charts) 引用它们。

<Steps>
  <Step title="Create a GitHub App">
    转到 [GitHub Settings > Developer settings > GitHub Apps](https://github.com/settings/apps) 并单击 **新建 GitHub 应用程序**。

    <Note>
      您可以在个人帐户或组织下创建应用程序。如果多人管理集成，建议使用组织拥有的应用程序。
    </Note>
  </Step>

  <Step title="Fill in basic details">
    * **GitHub 应用程序名称**：任何唯一的名称，例如 `acme-langsmith-fleet`。记下 GitHub 生成的 slug（名称的小写连字符形式），因为这是您将用于 `FLEET_GITHUB_APP_SLUG` 的值。
    * **主页 URL**：您的 LangSmith 主机名，例如 `https://langsmith.acme.com`。
    * 暂时取消选择 **Webhook** 下的 **Active**。您将在生成 Webhook 密钥后的后续步骤中启用它。
  </Step>

  <Step title="Set callback URLs">
    在 **识别和授权用户** 下，添加以下 **回调 URL**，将 `<hostname>` 替换为您的 LangSmith 主机名：

    ```
    https://<hostname>/v1/platform/fleet/providers/github-app/auth/callback
    ```

    选择**更新时重定向**。

    在**安装后**下，添加以下**安装 URL**：

    ```
    https://<hostname>/v1/platform/fleet/providers/github-app/callback
    ```

    选择**更新时重定向**。
  </Step>

  <Step title="Set webhook URL and generate a webhook secret">
    生成随机 Webhook 秘密：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    python3 -c "import secrets; print(secrets.token_urlsafe(48))"
    ```

    在 **Webhook** 下：* 选择**活动**。

    * 将 **Webhook URL** 设置为：

      ```
      https://<hostname>/v1/platform/fleet/providers/github-app/webhooks
      ```

    * 将生成的值粘贴到 **Webhook Secret**。保存它，因为在后续步骤中创建 Kubernetes 密钥时您将需要相同的值。
  </Step>

  <Step title="Set repository permissions">
    在 **权限 > 存储库权限**下，授予以下权限：

    * **内容**：阅读和写作
    * **问题**：读和写
    * **拉取请求**：读取和写入
    * **元数据**：只读（自动选择）

    在 **权限 > 帐户权限**下，授予 **电子邮件地址：只读**。

    <Note>
      这些是 Fleet 内置 GitHub 工具（问题管理、拉取请求创建、存储库内容访问）所需的最低权限。如果您需要额外的工具功能，请进行调整。
    </Note>
  </Step>

  <Step title="Choose install visibility">
    在**此 GitHub 应用程序可以安装在哪里？**下，选择符合您的分发需求的选项。对于大多数自托管部署，**仅在此帐户**是正确的。
  </Step>

  <Step title="Create the app">
    单击“**创建 GitHub 应用程序**”。在应用程序设置页面上，记下以下值：|价值|在哪里可以找到它 |环境变量 |
    | ---------------- | ----------------------------------------------------------- | ------------------------------------------ |
    | **应用程序ID** |数字，位于页面顶部 | `FLEET_GITHUB_APP_ID` |
    | **公共链接** |例如，`https://github.com/apps/acme-langsmith-fleet` | `FLEET_GITHUB_APP_PUBLIC_LINK` |
    |应用程序块 |公共链接的最后一个路径段 | `FLEET_GITHUB_APP_SLUG` |
    | **客户端ID** |在 **关于** |下`FLEET_GITHUB_APP_CLIENT_ID` |
  </Step>

  <Step title="Generate a client secret">
    在“**客户端密钥**”下，单击“**生成新的客户端密钥**”并复制该值。这是`FLEET_GITHUB_APP_CLIENT_SECRET`。 GitHub 只显示一次。
  </Step>

  <Step title="Generate a private key">
    滚动到 **私钥** 并单击 **生成私钥**。 GitHub 下载一个 `.pem` 文件。确保此文件的安全，因为它授予对 GitHub 应用程序的完全访问权限。 PEM内容为`FLEET_GITHUB_APP_PRIVATE_KEY`。
  </Step>

  <Step title="Generate a state JWT secret">
    LangSmith 使用 HMAC 密钥签署短期 OAuth 状态令牌。生成一个：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    python3 -c "import secrets; print(secrets.token_urlsafe(48))"
    ```

    这是`FLEET_GITHUB_APP_STATE_JWT_SECRET`。
  </Step>

  <Step title="Create a Kubernetes secret">
    将敏感值存储在 Kubernetes 密钥中：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    kubectl create secret generic fleet-github-app \
      --namespace <your-langsmith-namespace> \
      --from-literal=client_secret="<client-secret>" \
      --from-literal=webhook_secret="<webhook-secret>" \
      --from-literal=state_jwt_secret="<state-jwt-secret>" \
      --from-file=private_key=/path/to/fleet-app.private-key.pem
    ```对于生产部署，通过现有密钥工作流程管理此密钥（例如，[Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) 或 [External Secrets Operator](https://external-secrets.io/)）。更多信息请参见[Use an existing secret](/langsmith/self-host-using-an-existing-secret)。
  </Step>

  <Step title="Add the configuration to your langsmith_config.yaml">
    添加以下内容，将占位符值替换为上面收集的非敏感值：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    commonEnv:
      - name: FLEET_GITHUB_APP_ID
        value: "<app-id>"
      - name: FLEET_GITHUB_APP_SLUG
        value: "<app-slug>"
      - name: FLEET_GITHUB_APP_PUBLIC_LINK
        value: "https://github.com/apps/<app-slug>"
      - name: FLEET_GITHUB_APP_CLIENT_ID
        value: "<client-id>"
      - name: FLEET_GITHUB_APP_CLIENT_SECRET
        valueFrom:
          secretKeyRef:
            name: fleet-github-app
            key: client_secret
      - name: FLEET_GITHUB_APP_PRIVATE_KEY
        valueFrom:
          secretKeyRef:
            name: fleet-github-app
            key: private_key
      - name: FLEET_GITHUB_APP_WEBHOOK_SECRET
        valueFrom:
          secretKeyRef:
            name: fleet-github-app
            key: webhook_secret
      - name: FLEET_GITHUB_APP_STATE_JWT_SECRET
        valueFrom:
          secretKeyRef:
            name: fleet-github-app
            key: state_jwt_secret

    fleetToolServer:
      deployment:
        extraEnv:
          - name: FLEET_GITHUB_APP_ENABLED
            value: "true"
    ```

    <Note>
      必须在工具服务器上设置`FLEET_GITHUB_APP_ENABLED`，以便注册 GitHub 工具。剩余的 `FLEET_GITHUB_APP_*` 变量由平台后端使用并位于 `commonEnv` 下。
    </Note>
  </Step>

  <Step title="Deploy and install the app on repositories">
    运行以下命令以应用更改：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
    ```

    一旦 pod 健康：

    1. 在LangSmith中，打开 Fleet 代理并转到代理编辑器中的 GitHub 集成。
    2. 单击 **连接 GitHub** 将应用程序安装到 Fleet 应访问的存储库上。
    3. 对于私有存储库，您必须在安装过程中明确选择每个存储库。

    <Note>
      每个用户还必须使用 LangSmith 中的重新授权流程针对自己的 GitHub 帐户授权 GitHub 应用程序。这允许 Fleet 解析代表用户操作的工具的每用户令牌。
    </Note>
  </Step>
</Steps>

### 禁用功能要禁用舰队、见解和聊天的任意组合，请在 [⟦T212⟧](/langsmith/kubernetes#configure-your-helm-charts) 中将相应的标志设置为 `false`：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
fleet:
  enabled: false

insights:
  enabled: false

polly:
  enabled: false
```

## 启用沙箱

<Info>
  自托管沙盒需要 LangSmith Helm 图表 `0.16.0` 或更高版本。
</Info>

默认情况下，沙箱处于禁用状态。安装后，请参阅 [LangSmith Sandboxes](/langsmith/sandboxes) 了解 LangSmith UI 和 API 中的用户工作流程。

### 支持的平台

自托管沙箱受以下支持：

* 亚马逊弹性 Kubernetes 服务 (EKS)
* 谷歌 Kubernetes 引擎 (GKE)

基本 LangSmith 图表支持 Azure Kubernetes 服务 (AKS)，但 AKS 不支持自托管沙箱。

### 组件

启用沙箱可提供以下资源：

* 沙箱运行时 Pod，在支持 KVM 的节点上运行沙箱工作负载。
* JuiceFS CSI 驱动程序和 JuiceFS 支持的沙箱文件和快照卷。
* 由 Redis 支持的 JuiceFS 元数据存储以及由 S3 或 GCS 支持的对象存储。
* 可选通配符入口用于从沙箱内部公开的服务。

### 先决条件

<Steps>
  <Step title="Install the base LangSmith platform">
    在启用沙箱之前，在 Kubernetes 上安装LangSmith。参见[Self-host LangSmith on Kubernetes](/langsmith/kubernetes)。

    沙箱在与 LangSmith 版本相同的 Kubernetes 集群和命名空间中运行。
  </Step><Step title="Add KVM-capable nodes">
    您的集群必须包含专用节点，这些节点可以使用 `/dev/kvm` 上提供的 Linux KVM 运行嵌套工作负载。

    这些可以是裸机机器或启用了嵌套虚拟化的受支持的云实例。在 AWS 和 GCP 上，使用将 `/dev/kvm` 暴露给沙箱运行时的 x86\_64 Linux 实例。

    <Warning>
      在 EKS 上，VPC CNI 插件必须是 **v1.21 或更高版本**。 `v1.20.0` 第 8 代崩溃
      Intel实例（例如`m8i`）：`aws-node`进入`CrashLoopBackOff`，节点报告
      `cni plugin not initialized`，受管节点组最终失败并显示
      `NodeCreationFailure: Unhealthy nodes in the kubernetes cluster`。
    </Warning>

    默认的 Helm 调度值期望这些节点具有以下标签和污点：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    label:
      sandbox.langsmith.com/host: "true"
    taint:
      key: sandbox.langsmith.com/host
      value: "true"
      effect: NoSchedule
    ```

    如果您的节点使用不同的标签或污点，请覆盖`sandboxes.sandboxHost.deployment.nodeSelector`和`sandboxes.sandboxHost.deployment.tolerations`。
  </Step>

  <Step title="Configure JuiceFS storage">
    沙盒需要 JuiceFS 支持的共享存储。您必须提供：

    * 与 Redis 兼容的元数据存储。
    * 对象存储桶或桶根。
    * JuiceFS CSI 配置 Secret，或足够的 Helm 值供图表创建。<Warning>
      启用沙箱会安装 JuiceFS CSI 驱动程序。 CSI 驱动程序包含集群范围的 Kubernetes 资源。除非您已验证资源所有权，否则只有一个启用沙箱的 LangSmith 版本应管理集群中的 JuiceFS CSI 驱动程序。
    </Warning>

    支持的对象存储后端：

    |平台| `sandboxes.juicefs.storage` | `sandboxes.juicefs.bucket` 格式 |
    | -------- | ------------------------ | | ---------------------------------------------------------------------------------------------------------- |
    |亚马逊AWS | `s3` |区域显式 HTTPS S3 端点，例如 `https://bucket-name.s3.us-west-2.amazonaws.com` |
    | GCP | `gs` | GCS URL，例如`gs://bucket-name` |

    不要在 `sandboxes.juicefs.name` 中使用对象存储子路径。使用简单的名称，例如 `sandbox-juicefs`。 JuiceFS 在配置的存储桶中以该名称存储对象。

    <Tip>
      对于 Redis 元数据存储，我们建议将 `maxmemory-policy` 设置为 `noeviction`。这可以避免在内存压力下驱逐 JuiceFS 元数据。监控 Redis 容量并在达到内存限制之前对其进行扩展。使用`noeviction`，当实例达到最大内存时，Redis 写入可能会失败，因此请为沙箱元数据增长保留足够的内存空间。
    </Tip>
  </Step>

  <Step title="Configure sandbox secrets">
    沙箱需要额外的秘密材料来进行服务间身份验证和回调签名。

    <Tabs>
      <Tab title="Using Kubernetes secrets (recommended)">
        如果您使用 `config.existingSecretName`，请将沙箱密钥添加到相同的 LangSmith 应用程序 Secret。不要直接在 Helm 中设置秘密值。

        ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        stringData:
          sandbox_callback_signing_jwk: '<ed25519-private-jwk>'
          # Optional, only during service-auth secret rotation:
        ```
      </Tab>

      <Tab title="Using inline values">
        如果 Helm 图表管理您的 LangSmith 应用程序密钥，请直接在配置文件中设置沙箱密钥值。避免将此文件提交给版本控制。

        ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        config:
          sandboxes:
            callbackSigningJwk: '<ed25519-private-jwk>'
        ```
      </Tab>
    </Tabs>

    回调签名值必须是 Ed25519 私有 JWK。在升级过程中保持稳定。
  </Step>

  <Step title="Choose a proxy CA mode">
    该图表支持两种代理 CA 模式：|模式|使用时 |
    | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
    | `generatedSecret` |您希望 Helm 创建一个自签名的 CA Secret。这是默认设置。                                                                      |
    | `existingSecret` |您可以在 LangSmith 图表之外管理 CA 秘密。秘密可以由证书管理器或其他外部进程手动创建。 |

    在无需实时集群访问即可渲染清单的 GitOps 工作流程中，首选 `existingSecret`。 `generatedSecret` 模式使用 Helm 的实时 `lookup` 行为在升级时重用生成的 Secret；纯渲染工作流程无法读取实时 Secret，并且可能会在每次渲染上生成新的证书材料。
  </Step>
</Steps>

### 使用 Helm 启用

将以下值以及 [Prerequisites](#prerequisites-2) 中描述的沙箱秘密值添加到您的 `langsmith_config.yaml` 中。将占位符替换为特定于部署的值。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
images:
  sandboxHostImage:
    tag: "<same-release-tag-as-your-langsmith-images>"

sandboxes:
  enabled: true
  juicefs:
    name: "sandbox-juicefs"
    storage: "s3"
    bucket: "https://bucket-name.s3.us-west-2.amazonaws.com"
    redis:
      metaURL: "redis://redis-host:6379/1"
  proxyCa:
    mode: "generatedSecret"
```如果您自己创建 JuiceFS CSI 配置 Secret，请设置 `sandboxes.juicefs.csi.existingSecretName` 并从 Helm 值中省略 `sandboxes.juicefs.name`、`storage`、`bucket` 和 `redis.metaURL`：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sandboxes:
  enabled: true
  juicefs:
    csi:
      existingSecretName: "juicefs-csi-config"
```

现有的 Secret 必须位于 LangSmith 发布命名空间中并包含以下密钥：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stringData:
  name: "sandbox-juicefs"
  metaurl: "redis://redis-host:6379/1"
  storage: "s3"
  bucket: "https://bucket-name.s3.us-west-2.amazonaws.com"
```

应用更新后的图表：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm upgrade -i langsmith langchain/langsmith \
  --values langsmith_config.yaml \
  --version <version> \
  --namespace <namespace> \
  --wait
```

### 使用 Terraform 启用

LangSmith Terraform 模块可以配置所需的 AWS 和 GCP 基础设施并生成相应的 Helm 值。

#### AWS

在`modules/aws/infra/terraform.tfvars`中，启用沙箱并配置沙箱节点容量：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
enable_sandboxes = true
redis_source     = "external"

sandbox_juicefs_redis_instance_type             = "cache.m6g.large"
sandbox_juicefs_redis_snapshot_retention_limit  = 7

sandbox_host_node_count               = 1
sandbox_host_instance_types           = ["m5d.metal"]
sandbox_host_configure_instance_store = true

sandbox_host_image_tag = "<same-release-tag-as-your-langsmith-images>"
```

AWS 沙盒需要 `redis_source = "external"`。 Terraform 模块：

* 为 JuiceFS 沙箱元数据创建专用的 ElastiCache Redis 实例。
* 使用推荐的 `noeviction` 策略配置该专用实例。
* 重用LangSmith S3 存储桶进行沙箱对象存储。
* 创建 JuiceFS CSI 配置密钥。
* 添加预期的节点标签和污点。

AWS 设置脚本通过正常的 SSM 支持的设置流程生成沙箱服务身份验证密钥、回调签名 JWK 和专用 JuiceFS Redis 身份验证令牌。如果这些值尚不存在，请在应用 Terraform 之前运行基础设置脚本。如果您使用 Terraform 应用程序模块部署 Helm 版本，还要在 `modules/aws/app/terraform.tfvars` 中设置沙箱应用程序值：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
enable_sandboxes      = true
chart_version          = "~0.16.0"
sandbox_host_image_tag = "<same-release-tag-as-your-langsmith-images>"
```

当`enable_sandboxes = true`时，Terraform应用程序模块需要显式的LangSmithHelm图表版本`0.16.0`或更高版本以及沙箱运行时图像标签。

运行正常的 AWS 流程：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make apply
make init-values
CHART_VERSION="~0.16.0" make deploy
```

#### GCP

在 `modules/gcp/infra/terraform.tfvars` 中，启用沙盒并配置标准 GKE 节点池：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
enable_sandboxes = true
redis_source     = "external"

gke_use_autopilot     = false
enable_gcp_iam_module = true

sandbox_juicefs_redis_memory_size       = 5
sandbox_juicefs_redis_high_availability = true

sandbox_host_node_count     = 1
sandbox_host_min_node_count = 1
sandbox_host_max_node_count = 5
sandbox_host_machine_type   = "n2-standard-8"

sandbox_host_image_tag = "<same-release-tag-as-your-langsmith-images>"
```

GCP 沙盒需要 `redis_source = "external"`。 Terraform 模块：

* 为 JuiceFS 沙箱元数据创建专用的 Memorystore Redis 实例。
* 使用推荐的 `noeviction` 策略配置该专用实例。
* 重用LangSmith GCS 存储桶进行沙箱对象存储。
* 创建 JuiceFS CSI 配置密钥。
* 添加预期的节点标签和污点。

GCP 设置脚本通过正常的 Secret Manager 设置流程生成沙箱服务身份验证密钥和回调签名 JWK。如果这些值尚不存在，请在应用 Terraform 之前运行基础设置脚本。

如果您使用 Terraform 应用程序模块部署 Helm 版本，还要在 `modules/gcp/app/terraform.tfvars` 中设置沙箱应用程序值：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
enable_sandboxes      = true
chart_version          = "~0.16.0"
sandbox_host_image_tag = "<same-release-tag-as-your-langsmith-images>"
```

当`enable_sandboxes = true`时，Terraform应用程序模块需要显式的LangSmithHelm图表版本`0.16.0`或更高版本以及沙箱运行时图像标签。运行正常的 GCP 流程：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
make apply
make init-values
CHART_VERSION="~0.16.0" make deploy
```

### 可选：启用服务 URL

当用户需要浏览器或编程访问沙箱内运行的 HTTP 服务时，请设置`sandboxes.serviceUrlBaseUrl`。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sandboxes:
  serviceUrlBaseUrl: "https://sandbox-services.example.com"
```

这需要 `*.sandbox-services.example.com` 的通配符 DNS 和 TLS。当 `ingress.enabled` 为 `true` 时，图表还添加通配符入口规则，将这些服务 URL 路由到 LangSmith 平台后端。

### 验证安装

升级完成后，验证沙箱运行时 Pod 和 JuiceFS 卷是否已准备就绪：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl rollout status deployment/sandbox-host -n <namespace>
kubectl get pods,pvc -n <namespace>
```

然后运行沙箱冒烟测试：

1. 从公共镜像（例如 Python 镜像）创建沙箱。
2. 在沙箱内启动Python HTTP 服务器。
3. 在启用内存的情况下对沙箱进行快照。
4. 从快照创建一个新的沙箱。
5. 验证 HTTP 服务器是否仍在恢复的沙箱中运行。

### 升级注意事项

沙盒运行时映像更改通过 `sandbox-host` Kubernetes 部署推出。该图表默认使用无浪涌滚动更新策略，因此一次更换一台主机。在正常的 Helm 升级期间，终止主机停止接受新的 Sandbox，尝试将每个正在运行的 Sandbox 的 VM 内存保存到 JuiceFS，然后在 pod 退出之前停止这些 VM。此关闭受 `sandbox-host` Pod 终止宽限期限制，默认为 300 秒。这不是实时迁移：该主机上的沙箱在重新启动期间会中断。

沙箱不会主动重新启动。当用户或 API 操作启动沙箱或请求路径唤醒沙箱时，它们会再次启动。然后，LangSmith 将沙箱放置在可用主机上，并在关闭捕获完成时从保存的内存映像中恢复。如果内存映像不存在或不完整，沙盒将从保存的根文件系统启动。

## 启用引擎

<Info>
  自承载引擎需要 LangSmith Helm 图表 `0.16.0` 或更高版本以及包含引擎权利的许可证。 [Contact your account team](https://www.langchain.com/contact-sales) 将其添加到您的订单中。
</Info>

[Engine](/langsmith/engine-overview) 监视跟踪项目，将重复出现的故障聚类为问题，诊断每个问题，并提出修复建议。默认情况下禁用引擎。

引擎需要沙箱并与 Insights 共享运行时：* **[Sandboxes](#enable-sandboxes):** 每个引擎运行都在一个中执行。首先启用沙箱。如果没有设置 `engine.enabled`，图表将拒绝渲染。
* **[Insights](#enable-fleet-insights-and-chat):** Engine 和 Insights 由同一映像提供服务并共享一个部署。洞察力不是引擎的先决条件。在已运行 Insights 的安装中，启用 Engine 会添加配置而不是添加新 Pod。

与本页上的其他功能不同，引擎无法完全在集群内运行。它依赖于 LangSmith Intelligence（一种 LangChain 托管的零数据保留服务），并使用在 LangSmith 许可证验证期间获得的短期许可证 JWT 进行身份验证。数据流向和保留的计费元数据请参见[Engine on self-hosted](/langsmith/engine-self-hosted)。

### 组件

启用引擎配置或重用：

* `standalone-insights-api-server`：同时服务于`engine`和`insights`图表。
* `standalone-insights-queue`：Engine 和 Insights 的后台运行处理。
* 用于共享部署的专用 PostgreSQL 和 Redis 实例，每个实例都可以替换为外部实例。
* [Enable Sandboxes](#enable-sandboxes) 下描述的沙箱组件。

引擎还向`platform-backend`和`ingest-queue`添加了配置，用于调度和安排其运行。

### 先决条件<Steps>
  <Step title="Enable Sandboxes">
    首先完成[Enable Sandboxes](#enable-sandboxes)，包括支持KVM的节点池和JuiceFS存储。

    引擎的沙箱由单个工作区拥有。默认情况下，LangSmith解析安装自己的工作空间，当只有一个非个人组织时，该工作空间有效；如果超过一个，它会拒绝而不是猜测，并且您必须设置`engine.sandboxTenantId`。

    <Warning>
      首选为引擎保留的工作空间。 Engine 的沙箱不在 Sandboxes 产品中计费，因为 Engine 会计量自己在 LCU 中的使用情况。它们确实计入该工作区的并发沙箱、CPU 和内存配额。已经接近上限的工作空间可能会使引擎运行陷入配额错误，而引擎自己的沙箱可能会排挤交互式沙箱。

      这些沙箱也列在该工作区中，任何有权访问它的人都可以停止。每个都运行代理生成的代码。存储库凭据由沙箱身份验证代理保存，并且在沙箱内不可读。
    </Warning>
  </Step><Step title="Confirm the license entitlement">
    引擎是单独许可的，与沙盒相同。您的许可证必须包含引擎权利。 LangSmith 在启动时根据 `https://beacon.langchain.com` 验证您的许可证密钥，并在此后定期验证，因此一旦将其添加到您的订单中，您无需更改任何配置即可生效。
  </Step>

  <Step title="Allow egress to LangSmith Intelligence">
    允许从集群到云的LangSmith智能网关的出站 HTTPS。这是`engine.intelligenceBaseUrl`的主持人。

    |云|网关主机|
    | -----| -------------------------- |
    |亚马逊AWS | `beacon.aws.langchain.com` |
    | GCP | `beacon.langchain.com` |

    在 GCP 上，它与已用于许可证验证和计费遥测的主机LangSmith相同，因此引擎添加了一条路径而不是新的出口目的地。

    <Note>
      引擎可用于 **AWS US** 和 **GCP US** 中的自托管部署。 AWS EU 和 Azure 已规划。在计划推出之前，请检查 [Availability by cloud and region](/langsmith/engine-self-hosted#availability-by-cloud-and-region) 并与您的客户团队确认覆盖范围。
    </Note>将网关添加为特定白名单条目，而不是打开常规出口。为了将 AWS 流量保持在专用网络上，[connect to LangSmith Intelligence with AWS PrivateLink](/langsmith/engine-self-hosted#connect-with-aws-privatelink)。请求使用在 LangSmith 许可证验证期间获得的短期许可证 JWT。引擎的流量与[Configure egress](/langsmith/self-host-egress)中描述的计费和操作遥测是分开的，即使它共享主机。

    <Note>
      离线（气隙）安装无法运行引擎。没有可以依赖的集群内模型。
    </Note>
  </Step>

  <Step title="Verify your hostname is externally reachable">
    引擎的沙箱使用 `langsmith` CLI 调用您的 LangSmith 安装，因此 `config.hostname` 必须可从沙箱网络访问。该图表拒绝 `localhost` 和集群内 `*.svc` 地址。

    使用 TLS 通过您的入口提供该主机名，如 [Set up an ingress](/langsmith/self-host-ingress) 中所述。引擎不要求您公开超出您自己的用户已经到达的地址的任何内容。沙盒出口已列入您的 LangSmith 主机名、`github.com`、`api.github.com` 和 Python 包注册表的允许名单。每次运行的凭据由沙箱外部的代理注入，而不是在沙箱内部可读。
  </Step><Step title="Generate the Engine encryption key">
    引擎使用自己的 Fernet 密钥来加密传递给它的运行有效负载LangSmith，这些负载携带短期凭证。生成一个：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    ```

    将其存储在预定义的 Kubernetes Secret 中，名称为 `engine_encryption_key`，而不是存储在配置文件中。参见[Use an existing secret](/langsmith/self-host-using-an-existing-secret#parameters)。

    要稍后轮换密钥，请将当前值复制到 `engine_encryption_key_previous` 并将新密钥设置为 `engine_encryption_key`。之前的密钥仅用于解密，因此在交换完成之前以加密方式运行。
  </Step>
</Steps>

### 使用 Helm 启用

将以下内容添加到您的 [⟦T287⟧](/langsmith/kubernetes#configure-your-helm-charts) 以及 [Enable Sandboxes](#enable-sandboxes) 中的沙盒值：

<Tabs>
  <Tab title="Using Kubernetes secrets (recommended)">
    按名称引用您现有的 Secret。图表自动从中读取`engine_encryption_key`。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    config:
      existingSecretName: "<your-secret-name>"
      # Must be reachable from the sandbox network.
      hostname: "https://langsmith.example.com"

    engine:
      enabled: true
      # AWS; on GCP use https://beacon.langchain.com/intelligence
      intelligenceBaseUrl: "https://beacon.aws.langchain.com/intelligence"

    sandboxes:
      enabled: true
    ```
  </Tab>

  <Tab title="Using inline values">
    直接在配置文件中设置加密密钥。

    <Warning>
      这会将实时凭证放入您的配置文件中。不要将其提交给版本控制；更喜欢 Kubernetes Secret。
    </Warning>

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    config:
      hostname: "https://langsmith.example.com"

    engine:
      enabled: true
      # AWS; on GCP use https://beacon.langchain.com/intelligence
      intelligenceBaseUrl: "https://beacon.aws.langchain.com/intelligence"
      encryptionKey: "<engine-encryption-key>"

    sandboxes:
      enabled: true
    ```
  </Tab>
</Tabs><Warning>
  引擎在`langsmith-insights-engine`上运行，组合图像同时服务于`engine`和`insights`图。该图表默认使用它，因此新安装不需要图像配置。如果您要将其值 pin `images.engineInsightsAgentImage.repository` 的安装升级到已停用的 `langsmith-clio` 映像，请删除或更新该 pin。 `langsmith-clio` 仅提供见解，图表拒绝它。
</Warning>

如果您的安装有多个非个人组织，还需设置拥有 Engine 沙箱的工作区：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
engine:
  sandboxTenantId: "<workspace-id>"
```

应用更新后的图表：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm upgrade -i langsmith langchain/langsmith \
  --values langsmith_config.yaml \
  --version <version> \
  --namespace <namespace> \
  --wait
```

<Tip>
  该图表在渲染时验证引擎配置，并失败并显示一条消息，指出缺少的值，因此 `helm template` 在错误配置到达集群之前捕获它。
</Tip>

### 验证安装

确认共享 Engine 和 Insights 部署正在运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n <namespace> | grep standalone-insights
```

API 服务器和队列 Pod 都应该是`Running`。然后，确认`platform-backend`是健康的，因为它调度引擎运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl rollout status deployment/langsmith-platform-backend -n <namespace>
```

如果在此之后引擎未出现在 LangSmith UI 中，最常见的原因是许可证没有引擎权利以及[Turn on Engine in LangSmith](#turn-on-engine-in-langsmith) 中所述的组织级别切换。完成产品内设置后，启动引擎分析并确认显示跟踪项目的结果。这将验证通过引擎、沙箱和LangSmith智能的完整路径。单独运行 pod 不会验证该路径。

### 在LangSmith中打开引擎

在 Helm 中启用 Engine 即可使用该功能；它不会启动任何扫描。还剩下两个产品内步骤，都包含在 [Find and fix issues](/langsmith/engine) 中：

1. [Organization Admin](/langsmith/rbac#organization-admin) 在 **设置 > 引擎启用**下为组织打开引擎。
2. 任何用户都可以从项目的 **Engine** 选项卡为跟踪项目设置 Engine。

连接 GitHub 存储库是可选的，它可以改进引擎的诊断和修复。如果没有，引擎仍然可以检测和诊断问题并提出及时修复建议，但它无法读取您的源代码或打开拉取请求。要创建 GitHub 应用程序并配置`host-backend`，请参阅[Connect Engine to GitHub](/langsmith/engine-github#self-hosted)。

### 禁用引擎

将 `engine.enabled` 设置为 `false` 并重新应用：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
engine:
  enabled: false
```

引擎停止调度运行。现有问题保留在数据库中，如果重新启用它，则会重新出现。 Insights 共享相同的部署，因此当 `insights.enabled` 为 `true` 时，`standalone-insights` Pod 会继续运行。

## 可选配置### 配置额外的数据平面

<Warning>
  **不推荐；已计划弃用。** 不推荐通过控制平面配置其他数据平面，并且将在未来版本中弃用。相反，部署 [standalone Agent Servers](/langsmith/deploy-standalone-server) 并将其配置为跟踪您的自托管 LangSmith 实例。
</Warning>

除了上面创建的数据平面之外，您还可以在不同的 Kubernetes 集群或不同命名空间下的同一集群中创建更多数据平面。有多种方法可以实现此目的，因此请实施最适合您的用例的解决方案。

#### 先决条件

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

#### 部署到不同的集群<Steps>
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
    在您的[⟦T307⟧](/langsmith/kubernetes#configure-your-helm-charts)中，进行以下修改：

    * 将 `operator.watchNamespaces` 设置为您的自托管 LangSmith 实例正在运行的当前命名空间。这可以防止与新数据平面添加的运算符发生冲突。
    * 使用 [Gateway API](/langsmith/self-host-ingress#option-2%3A-gateway-api) 或 [Istio Gateway](/langsmith/self-host-ingress#option-3%3A-istio-gateway)。相应地调整您的`langsmith_config.yaml`。
  </Step>

  <Step title="Apply the changes">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
    ```
  </Step>

  <Step title="Follow the hybrid setup guide">
    按照 [hybrid setup guide](/langsmith/hybrid-legacy#setup) 中的步骤 2 至 6 进行操作。将 `config.langsmithWorkspaceId` 设置为上一步中的工作区 ID。将 `config.watchNamespaces` 设置为与现有数据平面使用的名称空间不同的名称空间。
  </Step>

  <Step title="(Optional) Configure log access">
    配置控制平面的访问权限以从新命名空间读取代理服务器部署日志。参见[Read Agent Server logs from other namespaces](#read-agent-server-logs-from-other-namespaces)。
  </Step>
</Steps>

### 配置私有注册表的身份验证如果您的 [Agent Server deployments](/langsmith/agent-server) 将使用私有容器注册表（例如 AWS ECR、Azure ACR 或 GCP Artifact Registry）中的映像，请配置映像拉取密钥。此配置自动应用于所有部署，允许它们通过您的私有注册表进行身份验证。

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
    ```

    通过LangSmith UI 创建的所有用户部署都将继承这些注册表凭据。
  </Step>
</Steps>

有关注册表特定的身份验证方法，请参阅[Kubernetes documentation on pulling images from private registries](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/)。

### 从其他命名空间读取代理服务器日志

<Warning>
  对于控制平面 (`host-backend`) 和数据平面 (`listener`) 部署在不同 Kubernetes 集群中的自托管部署，不支持检索服务器日志。
</Warning>对于控制平面和数据平面位于同一集群的部署，请确保控制平面 Kubernetes 部署（`host-backend`）具有 `get`、`list`、`watch` Kubernetes `deployments`、`pods`、`replicasets`、`replicasets` 的权限`logs` 来自代理服务器部署所在的命名空间。有不同的方法可以实现这一目标。以下示例使用 Kubernetes RBAC，但请使用最适合您的用例的方法：

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
</Steps>

<Note>
  在此示例中，Role 和 RoleBinding 在与代理服务器部署相同的 Kubernetes 命名空间中定义。您可以为 Role 和 RoleBinding 分配任何名称，并根据需要自定义它们。
</Note>

## 后续步骤

启用 LangSmith 部署后，请参阅 [Deploy with control plane](/langsmith/deploy-with-control-plane) 通过 LangSmith UI 构建和部署应用程序。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-self-hosted-full-platform.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>