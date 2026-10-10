<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Enable Fleet on self-hosted LangSmith | https://docs.langchain.com/langsmith/enable-self-hosted-fleet -->

# 在自托管 LangSmith 上启用队列

在自托管 LangSmith 上安装 Fleet 并可选择配置工具和触发器。

[Fleet](/langsmith/fleet/index) 让您无需编写代码即可创建和管理代理。当您的安装需要无代码代理时启用它。

## 先决条件

舰队需要 [Enterprise](https://langchain.com/pricing) 计划和 [LangSmith Self-Hosted v0.13](https://changelog.langchain.com/announcements/langsmith-self-hosted-v0-13) 或更高版本。此独立部署配置需要 v0.15 或更高版本。首先安装[base LangSmith platform](/langsmith/kubernetes)。

Fleet 提供 API 服务器、任务队列、PostgreSQL、Redis、工具服务器和触发器服务器。它不需要LangSmith部署。

## 启用舰队

为 Fleet 生成 Fernet 加密密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

将其作为 `agent_builder_encryption_key` 存储在您的 [existing LangSmith app Secret](/langsmith/self-host-using-an-existing-secret#parameters) 中。将以下内容添加到您的[⟦T29⟧](/langsmith/kubernetes#configure-your-helm-charts)：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config:
  existingSecretName: "<your-secret-name>"

fleet:
  enabled: true

fleetToolServer:
  enabled: true

fleetTriggerServer:
  enabled: true
```

或者，内联设置 `fleet.encryptionKey`。不要将加密密钥提交给版本控制。 `fleetToolServer` 和 `fleetTriggerServer` 都是必需的。

<Warning>
  如果您要从旧版`agentBootstrap`部署模型迁移，请在升级之前通过[Support Portal](https://support.langchain.com)联系技术支持。当前图表拒绝`backend.agentBootstrap`、`config.insights`和`config.polly`；删除这些旧设置而不是将它们设置为 `false`。禁用旧的 `config.agentBuilder.enabled` 标志。在删除旧部署之前保留现有队列数据。
</Warning>默认情况下，Fleet 使用专用的 PostgreSQL 和 Redis 实例。要使用外部数据库，请配置`fleet.postgres.external`和`fleet.redis.external`：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
fleet:
  enabled: true
  postgres:
    external:
      enabled: true
      connectionUrl: "<fleet-postgres-connection-url>"
  redis:
    external:
      enabled: true
      connectionUrl: "<fleet-redis-connection-url>"
```

应用更改并验证 Pod：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
kubectl get pods -n <namespace>
```

### （可选）为队列启用 OAuth 工具和触发器

要在 Fleet 中启用基于 OAuth 的工具（例如 Gmail、Slack 或 Linear），请配置 `providerOrgId` 并为您要使用的每个集成添加提供商 ID。您可以启用提供商的任意组合。

#### 可用的提供商

|供应商|启用工具 |触发器已启用 |
| - | - | - |
| `googleOAuthProvider`<br />[setup guide](#google-oauth-provider) | Gmail、Google 日历、<br />Google 表格、BigQuery |邮箱 |
| `linearOAuthProvider`<br />[setup guide](#linear-oauth-provider) |线性| - |
| `linkedinOAuthProvider`<br />[setup guide](#linkedin-oauth-provider) |领英 | - |
| `microsoftOAuthProvider`<br />[setup guide](#microsoft-oauth-provider) | Outlook、日历、团队、SharePoint、<br />Word、Excel、PowerPoint |展望 |
| `salesforceOAuthProvider`<br />[setup guide](#salesforce-oauth-provider) |销售人员 | - |
| `slackOAuthProvider`<br />[setup guide](#slack-oauth-provider) |松弛|松弛|

#### 通用配置

将以下内容添加到您的[⟦T48⟧](/langsmith/kubernetes#configure-your-helm-charts)。仅包含您需要的提供商。

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
  提供商 ID 必须唯一，且不能以 `-agent-builder` 或 `-oauth-provider` 结尾。
</Warning>

#### 提供商设置指南<AccordionGroup>
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
      </Step>

      <Step title="Configure OAuth provider in LangSmith">
        在 LangSmith 中，转到 **设置 > OAuth 提供商** 并添加新的提供商：

        * **客户端 ID**：来自 GCP
        * **客户端秘密**：来自 GCP
        * **授权网址**：`https://accounts.google.com/o/oauth2/auth`
        * **令牌 URL**：`https://oauth2.googleapis.com/token`
        * **提供商 ID**：唯一字符串，例如：`google`
      </Step>

      <Step title="Apply the changes">
        将 LangSmith OAuth 提供商 ID 添加到您的 [⟦T60⟧](/langsmith/kubernetes#configure-your-helm-charts) 并部署：

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
  </Accordion><Accordion title="Microsoft OAuth provider">
    要为队列启用 Microsoft OAuth，请创建 Azure 应用程序注册，添加所需的 Microsoft Graph 委派权限，并在 LangSmith 中配置 Microsoft OAuth 提供程序。

    <Steps>
      <Step title="Create an Azure app registration">
        在 [Microsoft Entra admin center](https://entra.microsoft.com/) 中，转到 **应用程序 > 应用程序注册** 并创建一个新的注册。
      </Step>

      <Step title="Choose supported account types">
        选择与您的部署匹配的帐户类型。如果需要来自多个 Microsoft Entra 租户的用户进行身份验证，请选择多租户选项。如果您的部署仅限于一个租户，您可以使用单租户应用程序注册。
      </Step>

      <Step title="Add the redirect URI">
        添加以下 Web 重定向 URI，将 `<hostname>` 替换为您的 LangSmith 主机名，将 `<provider-id>` 替换为您的提供商 ID：

        ```
        https://<hostname>/host-oauth-callback/<provider-id>
        ```
      </Step>

      <Step title="Create a client secret">
        在**证书和机密**中，创建一个新的客户端机密。复制 **应用程序（客户端）ID** 和生成的客户端密钥值。
      </Step>

      <Step title="Add Microsoft Graph delegated permissions">
        在 **API 权限**中，添加以下 Microsoft Graph 委派权限：* `Mail.ReadWrite`
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
        在 LangSmith 中，转到 **设置 > OAuth 提供商** 并添加新的提供商：

        * **名称**：例如，`Microsoft`
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
      </Step><Step title="Apply the changes">
        将以下内容添加到您的 [⟦T84⟧](/langsmith/kubernetes#configure-your-helm-charts) 并部署：

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
      </Step>

      <Step title="Configure OAuth provider in LangSmith">
        在 LangSmith 中，转到 **设置 > OAuth 提供商** 并添加新的提供商：

        * **客户端 ID**：来自 Linear 应用程序
        * **客户端秘密**：来自 Linear 应用程序
        * **授权网址**：`https://linear.app/oauth/authorize`
        * **令牌 URL**：`https://api.linear.app/oauth/token`
        * **提供商 ID**：唯一字符串，例如：`linear`
      </Step>

      <Step title="Apply the changes">
        将以下内容添加到您的 [⟦T90⟧](/langsmith/kubernetes#configure-your-helm-charts) 并部署：

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
    要为 Fleet 启用 LinkedIn OAuth，请创建 LinkedIn OAuth 应用程序并使用所需的凭据对其进行配置。<Steps>
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
        在 LangSmith 中，转到 **设置 > OAuth 提供商** 并添加新的提供商：

        * **客户 ID**：来自 LinkedIn 应用程序
        * **客户秘密**：来自 LinkedIn 应用程序
        * **授权网址**：`https://www.linkedin.com/oauth/v2/authorization`
        * **令牌 URL**：`https://www.linkedin.com/oauth/v2/accessToken`
        * **提供商 ID**：唯一字符串，例如：`linkedin`
      </Step>

      <Step title="Apply the changes">
        将以下内容添加到您的 [⟦T96⟧](/langsmith/kubernetes#configure-your-helm-charts) 并部署：

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
    要为 Fleet 启用 Salesforce OAuth，请创建 Salesforce 外部客户端应用程序，配置其 OAuth 设置和策略，检索其凭据，然后在 LangSmith 中配置 Salesforce OAuth 提供程序。<Steps>
      <Step title="Create an External Client App">
        在 Salesforce **设置**中，使用 **快速查找** 打开 **外部客户端应用程序管理器**，然后单击 **新建外部客户端应用程序**。

        在**基本信息**下，设置：

        * **外部客户端应用程序名称**：例如，`LangSmith Fleet`
        * **联系电子邮件**：管理员电子邮件地址
        * **分布状态**：**本地**

        <Note>
          外部客户端应用程序是 Salesforce 当前用于 OAuth 集成的框架。如果**新外部客户端应用程序**不可用，请确认在**设置 > 外部客户端应用程序设置**下为您的组织启用了应用程序创建。
        </Note>
      </Step>

      <Step title="Enable OAuth and configure the OAuth settings">
        展开 **API（启用 OAuth 设置）** 并选择 **启用 OAuth**。然后配置：

        * **回调 URL**，将 `<hostname>` 替换为您的 LangSmith 主机名，将 `<provider-id>` 替换为您的提供商 ID：

        ```
        https://<hostname>/host-oauth-callback/<provider-id>
        ```* **选定的 OAuth 范围**：添加 **通过 API (api) 管理用户数据** 和 **随时执行请求（刷新\_token、离线\_access）**。
        * 保持选中**需要 Web 服务器流的秘密**。
        * 保留 **启用授权代码和凭据流** 和 **启用客户端凭据流** 未选中。 Fleet 使用标准 Web 服务器（授权代码）流程。

        单击**创建**。
      </Step>

      <Step title="Set the OAuth policies">
        打开应用程序，选择“**策略**”选项卡，然后单击“**编辑**”：

        * **刷新令牌策略**：选择**刷新令牌在撤销前有效**。
        * **允许的用户**：离开**所有用户可以自行授权**。如果您选择 **管理员批准的用户已预先授权**，则必须首先将应用程序分配给权限集或配置文件，否则授权会失败。

        单击**保存**。

        <Note>
          外部客户端应用程序在两个位置进行配置：**设置**（上一步中的 OAuth 定义）和 **策略**（此步骤）。两者都必须得救。
        </Note>
      </Step><Step title="Copy the credentials">
        在“**设置**”选项卡上的“**OAuth 设置**”下，选择“**消费者密钥和秘密**”。 **消费者密钥**是您的客户端 ID，**消费者秘密**是您的客户端秘密。

        <Note>
          创建应用程序后，在首次连接尝试之前最多允许 30 分钟的时间进行传播。
        </Note>
      </Step>

      <Step title="Configure OAuth provider in LangSmith">
        在LangSmith中，进入**设置 > OAuth 提供商**，点击**OAuth 提供商**，然后填写：

        * **提供商 ID**：唯一字符串，例如：`salesforce-oauth-provider`。在下一步中对 `salesforceOAuthProvider` 使用相同的值。
        * **显示名称**：例如，`Salesforce`
        * **客户端 ID**：来自 Salesforce 的消费者密钥
        * **客户秘密**：来自 Salesforce 的消费者秘密
        * **授权网址**：`https://<MyDomain>.my.salesforce.com/services/oauth2/authorize`
        * **令牌 URL**：`https://<MyDomain>.my.salesforce.com/services/oauth2/token`

        LangSmith 自动从令牌 URL 识别 Salesforce，因此无需设置提供程序类型或令牌验证方法字段。关闭 **启用 PKCE** 以匹配上面配置的 Web 服务器流。<Note>
          将 `<MyDomain>` 替换为您组织的 My Domain（位于 **设置 > My Domain** 下）。对于沙箱，请使用 `https://<MyDomain>--<SandboxName>.sandbox.my.salesforce.com/services/oauth2/authorize` 和匹配的令牌 URL。
        </Note>
      </Step>

      <Step title="Apply the changes">
        将以下内容添加到您的 [⟦T107⟧](/langsmith/kubernetes#configure-your-helm-charts) 并部署：

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
    </Steps>

    <Warning>
      如果登录失败：确认 Salesforce 中的 **回调 URL** 与 `https://<hostname>/host-oauth-callback/<provider-id>` 完全匹配（HTTPS，无尾部斜杠）；如果您选择**管理员批准的用户已预先授权**，请通过权限集分配应用程序；如果您的组织强制执行登录 IP 范围，请在用户的个人资料中将您的队列服务器的出口 IP 列入白名单，或在应用程序的策略中将 **IP 放宽** 设置为 **放宽 IP 限制**。
    </Warning>
  </Accordion>

  <Accordion title="Slack OAuth provider">
    一个 Slack OAuth 提供商为您添加到各个代理的 Slack 工具和 Slack 应用程序提供支持，因此 Slack 设置可以与 Slack 集成的其余部分一起使用。

    有关完整演练，请参阅[Set up Slack on Self-hosted](/langsmith/fleet/slack-app#set-up-slack-on-self-hosted)。它涵盖了创建 Slack 应用程序、添加机器人范围、注册提供程序、设置重定向 URI 以及配置 Helm 值。
  </Accordion>
</AccordionGroup>

### （可选）为队列启用 GitHub 应用程序Fleet 通过专用的 **GitHub 应用程序**（不是 OAuth 应用程序）与 GitHub 集成。 GitHub 应用程序为 Fleet 的 GitHub 工具提供存储库访问，并支持私有存储库访问所需的用户授权流程。

设置过程包括创建 GitHub 应用程序、收集其凭据、将其存储为 Kubernetes 机密，以及从您的 [⟦T109⟧](/langsmith/kubernetes#configure-your-helm-charts) 引用它们。

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
    https://<hostname>/api/v1/platform/fleet/providers/github-app/auth/callback
    ```选择**更新时重定向**。

    在**安装后**下，添加以下**安装 URL**：

    ```
    https://<hostname>/api/v1/platform/fleet/providers/github-app/callback
    ```

    选择**更新时重定向**。
  </Step>

  <Step title="Set webhook URL and generate a webhook secret">
    生成随机 Webhook 秘密：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    python3 -c "import secrets; print(secrets.token_urlsafe(48))"
    ```

    在 **Webhook** 下：

    * 选择**活动**。

    * 将 **Webhook URL** 设置为：

      ```
      https://<hostname>/api/v1/platform/fleet/providers/github-app/webhooks
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
  </Step><Step title="Choose install visibility">
    在**此 GitHub 应用程序可以安装在哪里？**下，选择符合您的分发需求的选项。对于大多数自托管部署，**仅在此帐户**是正确的。
  </Step>

  <Step title="Create the app">
    单击“**创建 GitHub 应用程序**”。在应用程序设置页面上，记下以下值：

    |价值|在哪里可以找到它 |环境变量|
    | - | - | - |
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
    LangSmith 使用 HMAC 密钥签署短暂的 OAuth 状态令牌。生成一个：

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
      必须在工具服务器上设置`FLEET_GITHUB_APP_ENABLED`，以便注册 GitHub 工具。其余的 `FLEET_GITHUB_APP_*` 变量由平台后端使用并位于 `commonEnv` 下。
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

## 禁用舰队

要禁用 Fleet，请设置这些值并应用 Helm 升级：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
fleet:
  enabled: false
fleetToolServer:
  enabled: false
fleetTriggerServer:
  enabled: false
```

***<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/enable-self-hosted-fleet.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>