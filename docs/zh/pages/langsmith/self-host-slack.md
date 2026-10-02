<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect self-hosted LangSmith to Slack | https://docs.langchain.com/langsmith/self-host-slack -->

# 将自托管 LangSmith 连接到 Slack

在自托管 LangSmith 上为引擎和警报通知配置您自己的 Slack 应用程序。

自托管 LangSmith 使用您的操作员创建和配置的 Slack 应用程序。操作员是管理您的 LangSmith 部署的人。部署交换 OAuth 代码并将 [Engine notifications](/langsmith/engine-notifications) 和 [alert notifications](/langsmith/alerts) 直接发送到 Slack。 LangSmith 在您的部署中存储应用程序凭据和加密的工作区机器人令牌。

如果您的实例上未配置 Slack，请联系您的运营商。此通知显示在组织设置中以及每个引擎项目的 **通知** 设置下的 **Slack** 选项卡中。操作员遵循以下设置说明。设置后，用户通过 Slack 授权连接工作区，而无需自行提供应用程序凭据。

<Note>
  此连接需要 LangSmith 自托管 v0.17 或更高版本。
</Note>

开始之前，请确保您拥有：* **部署访问权限：** 配置和重新启动 LangSmith 平台后端的权限。对于 Kubernetes，访问 LangSmith 运行的命名空间。
* **Slack 访问权限：** 在 Slack 工作区中创建和安装接收通知的应用程序的权限。如果您的工作区限制应用程序安装，请获得管理员批准。
* **LangSmith 访问权限：** 连接或断开 Slack 工作区的 `organization:manage` 权限。组织管理员可以在操作员配置部署后完成此步骤。
* **网络访问：** 对 Slack 的后端 HTTPS 访问以及对部署的 HTTPS 回调的浏览器访问。参见[Allow network access](#allow-network-access)。

## 创建您的 Slack 应用程序

您的操作员为部署创建一个 Slack 应用程序。 [app manifest](https://docs.slack.dev/reference/app-manifest/) 是一个 JSON 配置，用于创建机器人并设置其权限。用户在连接工作区时重复使用此应用程序；他们不会为每个用户或项目创建应用程序。

创建应用程序：1.复制下面的JSON并替换`oauth_config.redirect_urls`中的URL。对于标准入口，将 `/api/v1/platform/slack/callback` 附加到用于打开 LangSmith 的 URL。例如，`https://langsmith.example.com` 变为`https://langsmith.example.com/api/v1/platform/slack/callback`。如果 LangSmith 在 `https://langsmith.example.com/langsmith` 运行，则使用 `https://langsmith.example.com/langsmith/api/v1/platform/slack/callback`。对于自定义入口或单独的 API 主机，请使用到达部署的 Slack 回调的 HTTPS URL。
2. 打开[Your Apps](https://api.slack.com/apps)并选择**创建新应用程序**。选择 **从清单**，然后单击 **继续**。
3. 选择 **JSON** 选项卡，粘贴您编辑的清单，然后选择您的 Slack 工作区。单击**下一步**。
4. 检查五个权限，然后单击“**创建并安装**”。完成任何 Slack 授权或管理员批准提示。
5. 打开新应用的**基本信息** > **应用凭证**。复制 **客户端 ID** 和 **客户端密钥**，使用 **显示** 来揭示密钥。将它们存储在部署的秘密管理器中。使用客户端 ID，而不是应用程序 ID 或签名密钥。您不会将这些凭证发送至LangChain。

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "display_information": {
    "name": "LangSmith Notifications",
    "description": "Engine and alert notifications from your LangSmith deployment"
  },
  "features": {
    "bot_user": {
      "display_name": "LangSmith Notifications",
      "always_online": false
    }
  },
  "oauth_config": {
    "redirect_urls": [
      "https://langsmith.example.com/api/v1/platform/slack/callback"
    ],
    "scopes": {
      "bot": [
        "chat:write",
        "channels:read",
        "channels:join",
        "groups:read",
        "reactions:write"
      ]
    }
  },
  "settings": {
    "org_deploy_enabled": false,
    "socket_mode_enabled": false,
    "token_rotation_enabled": false
  }
}
```

清单包含配置，而不是凭据。 Slack 在创建后生成应用程序凭据。它配置自托管LangSmith请求的五个机器人范围：* **`chat:write`**：发送通知消息。
* **`channels:read`**：在频道选择器中列出公共频道。
* **`channels:join`**：如果需要，在发送通知时加入选定的公共频道。
* **`groups:read`**：列出机器人已被邀请的私人频道。
* **`reactions:write`**：添加和删除表情符号反应。通知传送当前不使用此权限。

保持令牌轮换禁用。该集成存储机器人令牌并且不刷新轮换令牌。禁用套接字模式；通知传送不需要事件订阅和应用程序级令牌。

在 Slack 中创建或安装应用程序不会将其连接到 LangSmith。配置部署后完成[Connect a Slack workspace](#connect-a-slack-workspace)。 LangSmith 通过该授权流程获取并存储工作区机器人令牌；您不会将机器人令牌复制到部署中。

## 配置您的部署

使用部署的 [environment variable configuration](/langsmith/self-host-environment-variables) 在 LangSmith 平台后端配置这些变量：|变量|价值|
| - | - |
| `LANGSMITH_SLACK_CLIENT_ID` |您的 Slack 应用程序的客户端 ID。 |
| `LANGSMITH_SLACK_CLIENT_SECRET` |您的 Slack 应用程序的客户端密钥，由密钥提供。 |
| `LANGSMITH_SLACK_REDIRECT_URI` | Slack 中保存的确切 HTTPS 回调 URL。 |
| `LANGSMITH_URL` |您的部署面向浏览器的 URL。通知链接和授权后的返回均使用此URL。 |

对于 Helm 部署（包括 EKS 上的部署），通过 `platformBackend.deployment.extraEnv` 配置应用程序凭据。

首先，在LangSmith运行的命名空间中创建一个Kubernetes Secret。如果您使用秘密运算符，请通过该运算符为 `slack-app-credentials` 提供密钥 `client-id` 和 `client-secret`。要手动创建它，请将以下内容另存为 `slack-app-secret.yaml`，替换所有三个占位符。使包含凭据的文件不受版本控制。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
apiVersion: v1
kind: Secret
metadata:
  name: slack-app-credentials
  namespace: "<your-langsmith-namespace>"
type: Opaque
stringData:
  client-id: "<your-slack-client-id>"
  client-secret: "<your-slack-client-secret>"
```

应用秘密：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl apply -f slack-app-secret.yaml
```

接下来，将这些条目合并到现有的 Helm 值文件中。保留任何现有的 `platformBackend.deployment.extraEnv` 条目。将回调 URL 替换为清单中使用的相同 URL：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
platformBackend:
  deployment:
    extraEnv:
      - name: LANGSMITH_SLACK_CLIENT_ID
        valueFrom:
          secretKeyRef:
            name: slack-app-credentials
            key: client-id
      - name: LANGSMITH_SLACK_CLIENT_SECRET
        valueFrom:
          secretKeyRef:
            name: slack-app-credentials
            key: client-secret
      - name: LANGSMITH_SLACK_REDIRECT_URI
        value: "https://langsmith.example.com/api/v1/platform/slack/callback"
```

该图表从其主机名配置中设置 `LANGSMITH_URL`。如果 UI 使用单独的主机，请配置 `config.hostname`、`config.frontendHostname`，并根据需要配置 `config.basePath`。避免通过 `extraEnv` 或 `commonEnv` 添加重复的 `LANGSMITH_URL`。通过部署过程应用更新的值。如果您直接管理 Helm，请使用现有的版本名称、命名空间、图表版本和完整值文件：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm upgrade <release-name> langchain/langsmith \
  --namespace <your-langsmith-namespace> \
  --version <your-chart-version> \
  --values <path-to-your-existing-values-file> \
  --wait
```

使用包含受支持的 LangSmith 版本的图表版本。有关升级先决条件，请参阅[Upgrade a self-hosted deployment](/langsmith/self-host-upgrades)。

保持 API 和通知工作人员之间现有的 `API_KEY_SALT` 加密密钥一致。他们用它来加密和解密存储的机器人令牌。参见[Use an existing secret](/langsmith/self-host-using-an-existing-secret)。

等待平台后端上线完成，然后重新加载LangSmith。如果您在未更改 Helm 值的情况下更改了 Secret，请重新启动平台后端，以便它加载新凭据。在您组织的**常规**设置下，配置完成后，**Slack** 部分会显示**连接 Slack**。

后端检查应用程序凭据是否存在以及回调 URL 是否有效。 Slack 在授权期间验证凭据。不正确的凭据仍可能显示 **Connect Slack**，然后在您尝试连接时失败。更改或删除应用程序凭据不会删除存储的工作区连接或通知目标。之前存储的机器人令牌可以继续发送通知。要停止传送，请断开工作区的连接或删除其通知目标。

## 允许网络访问

对于此集成，允许以下连接：

* **后端：** 出站 HTTPS 到位于 `slack.com` 的 Slack Web API，用于 OAuth 交换、通道查找和通知。
* **浏览器：** 访问 Slack 以及您的部署的回调 URL 和 UI。

Slack 将浏览器重定向到您的回调。 Slack 不需要对您的部署进​​行入站网络访问来传递通知。

## 连接 Slack 工作区

Slack 工作区连接属于您的 LangSmith 组织，因此您可以跨项目重复使用它：1. 打开您的 LangSmith 实例并转到 **设置** > 您组织的 **常规** 设置。
2. 在 **Slack** 下，单击 **连接 Slack**。配置引擎或警报通知时，您还可以从通道选择器进行连接。
3. 选择 Slack 工作区，检查应用程序请求的权限，然后单击 **允许**。如果需要，请完成管理员批准。
4. 确认浏览器返回到您的 LangSmith 实例，并且工作区显示为 **已连接**。在通知设置中选择该工作区和频道。对于私人频道，请先邀请您配置的 Slack 应用程序加入频道，然后刷新选择器。如果需要，LangSmith 在首次传递消息时加入选定的公共频道。
5. 使用您需要的事件类型和最低问题严重性保存目标。请参阅[Configure Engine notifications](/langsmith/engine-notifications#notify-a-slack-channel)或[Configure alert notifications](/langsmith/alerts#step-4-configure-notification-channel)。

## 验证交付

保存目的地不会发送测试消息。引擎目标发送与其事件类型和最低问题严重性相匹配的新事件的通知。当您保存目的地时，现有问题不会发出新通知。

要验证引擎目的地：1. 在测试项目上保存 `issue.created` 的 Slack 目标。在**通知时间**下，选择**创建问题**。在测试期间将**最低问题严重性**设置为**所有严重性**。
2. 启用[Engine for the test project](/langsmith/engine#turn-on-engine-for-a-tracing-project)并让它分析新的痕迹。等待引擎创建新问题。如果引擎没有发现新问题，则不会发送`issue.created`通知。
3. 检查消息是否到达所选通道以及**查看问题**是否打开您的自托管实例。

要验证 Slack 交付而不等待新的 Engine 问题，请在测试项目的警报设置中配置 Slack 目标。单击“**发送测试通知**”并检查所选通道。参见[Test the alert integration](/langsmith/alerts#2-test-the-integration)。这会检查 Slack 连接，而不是引擎的事件生成。

Slack 通知将部署外部的内容发送到选定的工作区。引擎消息可以包括问题标题、描述、严重性、项目信息、链接和重复图表。警报消息包括警报和工作区名称、指标值、阈值和链接。选择具有适合该内容的访问权限的渠道。参见[Engine notification format](/langsmith/engine-notifications#notify-a-slack-channel)和[Alert notification format](/langsmith/alerts#notification-format)。

## 解决连接问题* **未配置 Slack：** 请联系您的运营商。确认您的版本支持该连接并且所有三个 Slack 环境变量均已设置。重启后端后重新加载UI。
* **Slack 配置不可用：** UI 无法加载后端的配置。重新加载页面并让您的操作员检查后端；此消息并不意味着应用程序凭据不存在。
* **后端 Pod 无法启动：** 检查 `slack-app-credentials` 是否与 LangSmith 存在于同一命名空间中，并且同时包含 `client-id` 和 `client-secret`。
* **Slack 拒绝应用程序凭据：** 从同一 Slack 应用程序复制客户端 ID 和客户端密钥。更新部署 Secret，重新启动平台后端，然后再次启动 **Connect Slack**。
* **授权无法启动：** 确认应用程序具有机器人用户、所有列出的范围以及在选定工作区中安装的权限。
* **Slack 报告重定向不匹配：** 确保 `LANGSMITH_SLACK_REDIRECT_URI` 与保存的 Slack 重定向 URL 匹配，包括方案、主机、端口和路径。* **返回后授权失败：**再次启动**连接Slack**。授权状态将在 10 分钟后过期。检查浏览器对回调的访问、后端对 Slack 的访问以及配置的应用程序凭据。保持令牌轮换禁用。
* **私人频道不存在：** 将您配置的 Slack 应用程序邀请到该频道，然后刷新选择器。
* **消息未到达：** 确认 Slack Web API 访问、匹配 API 和工作人员上的加密密钥以及目标的事件和严重性过滤器。如果有人从 Slack 中删除了该应用程序，请重新连接工作区。
* **链接打开错误的主机：** 更正部署的面向浏览器的 URL 配置。

## 另请参阅

* [Engine on self-hosted LangSmith](/langsmith/engine-self-hosted)
* [Engine notifications](/langsmith/engine-notifications)
* [Alerts](/langsmith/alerts)
* [Configure egress](/langsmith/self-host-egress)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-slack.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>