<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Enable the Tool Gateway | https://docs.langchain.com/langsmith/tool-gateway-self-hosted -->

# 启用工具网关

使用 Helm 图表在自托管 LangSmith 安装上启用工具网关，连接 MCP 服务器，并可选择启用内置工具。

工具网关允许代理通过LangSmith调用MCP工具。 LangSmith 存储每个用户使用这些工具的凭据，并在每次呼叫时应用您的代理策略。

本指南使用 Helm 图表在自托管 Kubernetes 安装上启用它。对于 SaaS 等效项，请参阅[Tool Gateway](/langsmith/tool-gateway)。

> [!注意]
>
> 启用工具网关需要 Helm 图表版本 0.18.0-rc.87 或更高版本。

## 启用网关

**1.设置您的主机名**

工具网关在`platform-backend`服务内部运行。该图表为安装中的每个组织打开它。 UI 中没有单独的启用步骤。

将 `config.hostname` 设置为安装的 HTTPS 主机名。该图表根据它构建 OAuth 回调 URL。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config:
  hostname: "langsmith.example.com"
```

该图表通过现有前端将 `/api/v1/agent-auth/`、`/api/v1/managed-tools/` 和 `/api/v1/agent-policies` 路由到 `platform-backend`。不需要单独的 Ingress。

**2. （可选）允许网络上的 MCP 服务器**

默认情况下，`platform-backend` 阻止解析为私有 IP 地址的 MCP 服务器 URL。要连接在网络内运行的 MCP 服务器，请将其添加到您的 Helm 值中：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
platformBackend:
  deployment:
    extraEnv:
      - name: SSRF_ALLOW_PRIVATE_IPS_MCP_SERVERS
        value: "true"
```LangSmith 仍然需要 HTTPS URL，并且仍然阻止云元数据端点、本地主机和 `*.svc.cluster.local` 主机名。

**3.申请并验证**

应用图表版本 0.18.0-rc.87 或更高版本的图表。请参阅 [Upgrade an installation](/langsmith/self-host-upgrades) 了解更多说明。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm upgrade --install langsmith langchain/langsmith \
  --version <chart-version> \
  -f values.yaml --timeout=20m
```

在 LangSmith UI 中，转到 **工具**，添加 MCP 服务器并连接到它。

## 找到你的回调 URL

当用户将帐户连接到使用 OAuth 的 MCP 服务器时，提供商会将浏览器返回到此 URL。将其作为重定向 URL 添加到您为工具网关注册的每个 OAuth 应用程序。

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
https://<your-hostname>/api/v1/agent-auth/oauth/callback
```

如果设置`config.basePath`，则 URL 变为`https://<your-hostname>/<basePath>/api/v1/agent-auth/oauth/callback`。

## 启用内置工具（可选）

Gmail、Outlook、Slack 等内置工具运行在内置工具服务器上。图表默认部署它，因此您不需要启用 Fleet。您启用的每个提供商都需要一个 OAuth 应用程序。

### 开始之前

* **启用工具服务器**：保留`fleetToolServer.enabled: true`，这是默认值。如果设置为`false`，**工具**页面不会列出任何内置工具。
* **提供商访问**：与每个提供商一起创建 OAuth 应用程序的权限，以及提供商需要时的管理员批准。您可以为每个应用程序安装一次进行配置。所有组织和工作区都使用相同的提供商应用程序。每个用户的连接和令牌都保留在自己的工作区中。

使用 API 密钥的内置工具（例如 Tavily 和 Exa）不需要部署配置。每个工作区都会在 **设置** > **工作区机密** 下添加其密钥。

> [!警告]
>
> 如果您还运行 Fleet，则工具网关回调 URL 与 Fleet OAuth 回调 `/host-oauth-callback/<provider-id>` 不同。如果您已配置队列 OAuth 提供商，请将 [Tool Gateway callback URL](#find-your-callback-url) 添加到每个应用程序作为附加重定向 URL。

### 创建 OAuth 应用程序

仅为您启用的提供商创建应用程序。每个应用程序必须允许工具网关请求的范围。如果应用程序不允许所请求的范围，则提供商会拒绝同意请求。> [标签] 谷歌
>
> 涵盖 Gmail、日历、云端硬盘、文档、表格、幻灯片、Meet 和 BigQuery。
>
> 1. 在 Google Cloud 控制台中，打开 **API 和服务** > **凭据** 并创建 **Web 应用程序** 类型的 **OAuth 客户端 ID**。
>
> 2. 在 **授权重定向 URI** 下，添加您的 [callback URL](#find-your-callback-url)。
>
> 3. 在**启用的 API 和服务**下，为您使用的工具启用 API。
>
> 4. 在 OAuth 同意屏幕上，添加以下范围：
>
> `openid`、`.../auth/userinfo.email`、`.../auth/userinfo.profile`、`.../auth/gmail.modify`、`.../auth/calendar.events`、`.../auth/calendar.freebusy`、`.../auth/calendar.calendarlist.readonly`、`.../auth/drive`、`.../auth/drive.file`、`.../auth/documents`、 `.../auth/spreadsheets`、`.../auth/presentations`、`.../auth/meetings.space.created`、`.../auth/meetings.space.readonly`、`.../auth/bigquery`
>
> 5. 将某个 Google Workspace 组织的同意屏幕设置为**内部**，或将其发布。在**测试**模式下，只有列出的测试用户可以连接，并且他们的访问会在 7 天后停止。
>
> 6. 复制 **客户端 ID** 和 **客户端密钥**。
>
> 如果访问在 7 天后停止，则同意屏幕处于 **测试** 模式。将其设置为**内部**或发布它，然后再次连接。> [标签] 微软
>
> 涵盖 Outlook、Team、SharePoint、OneDrive、Word、Excel 和 PowerPoint。
>
> 1. 在 Microsoft Entra 管理中心中，打开 **应用程序注册** 并选择 **新注册**。
> 2. 在**支持的帐户类型**下，选择多租户选项。工具网关通过 `common` 端点让用户登录，单租户应用程序会拒绝该端点。
> 3. 在 **重定向 URI** 下，选择 **Web** 并输入您的 [callback URL](#find-your-callback-url)。
> 4. 打开 **API 权限** 并添加以下 Microsoft Graph **委派** 权限：
>
> `User.Read`、`Mail.ReadWrite`、`Mail.Send`、`Mail.ReadWrite.Shared`、`Mail.Send.Shared`、`Calendars.ReadBasic`、`Calendars.ReadWrite`、`Calendars.ReadWrite.Shared`、`Files.ReadWrite`、`Files.ReadWrite.All`、 `Sites.ReadWrite.All`、`Team.ReadBasic.All`、`Channel.Create`、`Channel.ReadBasic.All`、`ChannelMessage.Read.All`、`ChannelMessage.Send`、`Chat.Create`、`Chat.ReadWrite`
>
> 工具网关还请求 `openid`、`profile`、`email` 和 `offline_access`。
> 5. 如果您的租户需要，请选择 **授予管理员同意**。
> 6. 打开 **证书和机密** 并创建客户端机密。复制秘密**值**，而不是**秘密 ID** 和 **应用程序（客户端）ID**。
>
> 如果登录失败并显示 `AADSTS50194`，则该应用程序是单租户的。将 **支持的帐户类型** 更改为多租户选项。> [选项卡] 松弛
>
> 1. 打开 [Your Apps](https://api.slack.com/apps) 并选择 **创建新应用** > **从头开始**。
>
> 2. 打开 **OAuth 和权限** 并在 **重定向 URL** 下添加您的 [callback URL](#find-your-callback-url)。
>
> 3. 在 **Bot 令牌范围** 下，添加：
>
> `channels:history`、`channels:read`、`chat:write`、`files:write`、`groups:history`、`groups:read`、`im:history`、`im:read`、`im:write`、`mpim:history`、 `mpim:read`、`users:read`、`users:read.email`
>
> 4. 保持令牌轮换禁用。
>
> 5. 打开**基本信息** > **应用凭证**，复制**客户端ID**和**客户端密钥**。使用客户端 ID，而不是应用程序 ID。

> [选项卡] 线性
>
> 1. 在 Linear 中，打开 **设置** > **API** > **应用程序** 并创建 OAuth 应用程序。
> 2. 添加您的 [callback URL](#find-your-callback-url) 作为回调 URL。
> 3. 复制 **客户端 ID** 和 **客户端密钥**。工具网关请求 `read` 和 `write` 范围。

> [标签] 领英
>
> 1. 在[LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)中创建一个应用程序。
> 2. 在**身份验证**选项卡上，在**授权的重定向 URL** 下添加您的 [callback URL](#find-your-callback-url)。
> 3. 在 **产品** 选项卡上，添加授予 `openid`、`profile`、`email` 和 `w_member_social` 的产品。
> 4. 复制 **客户端 ID** 和 **客户端密钥**。> [选项卡] Salesforce
>
> 1. 在 Salesforce 设置中，创建启用 OAuth 的 **外部客户端应用程序**。
> 2. 添加您的 [callback URL](#find-your-callback-url) 作为回调 URL。
> 3. 添加 OAuth 范围 **通过 API (api)** 管理用户数据和 **随时执行请求（refresh_token、offline_access）**。
> 4. 保持 **Web 服务器流需要机密** 启用。
> 5. 复制**消费者密钥**和**消费者秘密**。新应用程序最多可能需要 30 分钟才能可用。
>
> 工具网关通过`login.salesforce.com`登录用户。不支持需要 `test.salesforce.com` 的沙盒组织。

> [选项卡] GitHub
>
> GitHub 使用 GitHub 应用程序，而不是 OAuth 应用程序。
>
> 1. 在您组织的**开发者设置**中创建 GitHub 应用程序。
> 2. 在 **Callback URL** 下添加您的 [callback URL](#find-your-callback-url)。
> 3. 在**存储库权限**下，授予**内容**、**问题**、**拉取请求** 读取和写入以及**元数据** 读取。在**帐户权限**下，授予**电子邮件地址**读取权限。
> 4. 复制 **客户端 ID** 并生成 **客户端密钥**。
> 5. 生成随机状态签名秘密，例如使用`openssl rand -hex 32`。

### 将凭证添加到您的 Helm 值中`platform-backend` 从这些环境变量中读取每个应用程序的凭据。为您启用的每个提供程序设置这两个变量。如果任一值为空，则提供程序将保持不可用状态，并且 **Connect** 显示它尚未配置。

|供应商|客户端 ID 变量 |客户端秘密变量 |
| - | - | - |
|谷歌 | `GOOGLE_OAUTH_CLIENT_ID` | `GOOGLE_OAUTH_CLIENT_SECRET` |
|微软 | `MICROSOFT_OAUTH_CLIENT_ID` | `MICROSOFT_OAUTH_CLIENT_SECRET` |
|松弛| `SLACK_OAUTH_CLIENT_ID` | `SLACK_OAUTH_CLIENT_SECRET` |
|线性| `LINEAR_OAUTH_CLIENT_ID` | `LINEAR_OAUTH_CLIENT_SECRET` |
|领英 | `LINKEDIN_OAUTH_CLIENT_ID` | `LINKEDIN_OAUTH_CLIENT_SECRET` |
|销售人员 | `SALESFORCE_OAUTH_CLIENT_ID` | `SALESFORCE_OAUTH_CLIENT_SECRET` |
| GitHub | `FLEET_GITHUB_APP_CLIENT_ID` | `FLEET_GITHUB_APP_CLIENT_SECRET` |

GitHub 还需要 `FLEET_GITHUB_APP_STATE_JWT_SECRET`。如果没有它，`platform-backend` 会记录错误并且不会注册 GitHub 应用程序回调和 Webhook 路由。

1. 在 LangSmith 命名空间中创建 Kubernetes Secret。仅包含您启用的提供程序，并使文件不受版本控制。

   ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   apiVersion: v1
   kind: Secret
   metadata:
     name: tool-gateway-oauth-apps
     namespace: "<your-langsmith-namespace>"
   type: Opaque
   stringData:
     google-client-id: "<your-google-client-id>"
     google-client-secret: "<your-google-client-secret>"
     slack-client-id: "<your-slack-client-id>"
     slack-client-secret: "<your-slack-client-secret>"
   ```

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   kubectl apply -f tool-gateway-oauth-apps.yaml
   ```

2. 将每个提供商的一对条目添加到`platformBackend.deployment.extraEnv`。保留您现有的条目。

   ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   platformBackend:
     deployment:
       extraEnv:
         - name: GOOGLE_OAUTH_CLIENT_ID
           valueFrom:
             secretKeyRef:
               name: tool-gateway-oauth-apps
               key: google-client-id
         - name: GOOGLE_OAUTH_CLIENT_SECRET
           valueFrom:
             secretKeyRef:
               name: tool-gateway-oauth-apps
               key: google-client-secret
         # Repeat for each provider that you enable.
   ```

   请勿添加 `MANAGED_TOOLS_EMBEDDED`、`LANGSMITH_SIGNING_JWKS`、`API_KEY_SALT` 或 `AGENT_BUILDER_ENCRYPTION_KEY` 至 `extraEnv`。图表已经设置了它们，并且重复的名称会导致 Helm 渲染失败。

3. 应用图表。如果稍后仅更改 Secret，请重新启动 `platform-backend`。如果不同，请将 `langsmith` 替换为您的 Helm 版本名称：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   kubectl rollout restart deploy/langsmith-platform-backend
   ```4. 在LangSmith UI 中，转到**工具**，选择内置工具，单击**连接**，然后完成同意屏幕。

### 允许网络访问

* **`platform-backend`**：到每个提供商的令牌端点的出站 HTTPS，例如 `oauth2.googleapis.com`、`login.microsoftonline.com`、`slack.com`、`api.linear.app`、`www.linkedin.com`、`login.salesforce.com` 和 `github.com`。
* **内置工具服务器**：出站 HTTPS 到工具调用的提供商 API，例如`gmail.googleapis.com`、`graph.microsoft.com` 和 `slack.com`。
* **浏览器**：访问每个提供商的登录页面和您的回调 URL。

如果您的集群通过代理路由出口，请为内置工具服务器设置`fleet.egressProxy.url`。对于 `platform-backend`，将 `HTTPS_PROXY` 和 `NO_PROXY` 添加到 `platformBackend.deployment.extraEnv`，并在 `NO_PROXY` 中包含集群的内部域以及 Postgres、Redis 和 ClickHouse 主机。参见[Configure egress](/langsmith/self-host-egress)。

## 故障排除* **“工具”页面未列出任何内置工具**：检查 `fleetToolServer.enabled` 是否为 `true`，`langsmith-fleet-tool-server` pod 是否为 `Running`，以及您的图表版本是否为 0.18.0-rc.87 或更高版本。
* **对于内部 URL 添加 MCP 服务器失败**：使用不是 `*.svc.cluster.local` 主机名的 HTTPS URL，并在 `platform-backend` 上设置 `SSRF_ALLOW_PRIVATE_IPS_MCP_SERVERS`。参见[Enable the gateway](#enable-the-gateway)。
* **连接显示未配置提供程序**：为该提供程序设置两个变量。检查密钥和命名空间，然后重新启动`platform-backend`。
* **提供商报告重定向不匹配**：应用程序中的重定向 URL 必须与您的 [callback URL](#find-your-callback-url) 完全匹配，包括方案、主机、基本路径和路径。
* **`platform-backend` 升级后不启动**：检查 Secret 是否存在并包含 `extraEnv` 引用的每个密钥。

## 安全说明

* LangSmith 使用`API_KEY_SALT` 加密存储的用户令牌。用户关联账户后保持不变。参见[Use an existing secret](/langsmith/self-host-using-an-existing-secret)。
* 将 OAuth 应用程序机密存储在 Kubernetes Secret 中，并使用 `secretKeyRef` 引用它们。不要将秘密值直接放入 Helm 值文件中。
* `SSRF_ALLOW_PRIVATE_IPS_MCP_SERVERS` 允许工作区管理员在私有 IP 地址上添加 MCP 服务器。仅当您的用户需要内部 MCP 服务器时才将其打开。

## 后续步骤* [Tool Gateway](/langsmith/tool-gateway)：了解代理如何通过网关调用工具。
* [Enable Fleet](/langsmith/enable-self-hosted-fleet)：构建并运行使用工具网关的代理。
* [Configure environment variables](/langsmith/self-host-environment-variables)：查看图表设置的每个变量。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tool-gateway-self-hosted.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。