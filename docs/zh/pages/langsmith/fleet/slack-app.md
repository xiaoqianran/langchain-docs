<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Integrate Slack with an agent | https://docs.langchain.com/langsmith/fleet/slack-app -->

# 将 Slack 与代理集成

Fleet 将任何客服人员变成您的团队可以直接在频道或消息中标记的 Slack 队友。机器人是代理，而不是它前面的中继：它使用代理自己的指令、工具和权限运行。每个客服人员都可以拥有自己的 Slack 应用程序，因此一个 Slack 工作区可以运行与客服人员数量一样多的 Slack 机器人：一个进行分类支持，一个监视待命轮换，一个进行研究挖掘。

## 选择安装路径

<CardGroup cols={2}>
  <Card title="LangSmith Cloud" icon="cloud" href="#set-up-slack-on-langsmith-cloud">
    连接 Slack 一次，然后一键将 Slack 应用程序添加到任何代理。
  </Card>
  <Card title="Self-hosted" icon="server" href="#set-up-slack-on-self-hosted">
    配置 Slack OAuth 提供程序，然后为每个代理创建一个自定义 Slack 应用程序。
  </Card>
</CardGroup>

设置完成后，查看：

- [Use your agent in Slack](#use-your-agent-in-slack)：邀请机器人加入频道、为其添加标签并响应批准。
- [Add Slack tools](#add-slack-tools)：让代理发布到 Slack，无论它是如何触发的。
- [Troubleshooting](#troubleshooting)：修复不响应或拒绝提及的机器人。

## 代理在 Slack 中可以做什么

连接后，代理可以：- 从频道、私信或群组私信中的提及开始运行。
- 在提到的线程中回复。
- 阅读线程和频道历史记录以了解上下文。
- 阅读收到的消息中的文件附件。
- 暂停使用敏感工具并在 Slack 中征求您的批准。

每个代理都映射到一个 Slack 应用程序。

<Warning>
**人工智能生成的内容**：Slack 中代理的所有响应均由人工智能生成，可能包含错误或不准确之处。始终验证重要信息。
</Warning>

<Info>
Slack 与 Fleet 的集成没有任何直接定价。但是，代理运行和跟踪将根据您组织的计划通过 [LangSmith platform](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-slack-app) 计费。

有关当前定价信息，请参阅[LangSmith pricing page](https://www.langchain.com/pricing)。
</Info>

## 在 LangSmith 云上设置 Slack

在 LangSmith Cloud 上，Fleet 为您创建并安装每个代理的 Slack 应用程序。连接 Slack 一次，然后一键将 Slack 应用程序添加到任何代理。

### 先决条件

- 舰队中现有的特工。请参阅 [Quickstart](/langsmith/fleet/quickstart) 创建一个。
- 您可以在其中安装应用程序的 Slack 工作区。

### 步骤 1. 连接 Fleet Slack 管理器

Fleet Slack 应用程序充当您的工作空间的管理器。单个连接可以实现两件事：- **Slack 工具访问**：机器人确定代理需要发布消息、读取频道和线程历史记录以及发送直接消息的范围。
- **应用程序管理**：允许 Fleet 为代理创建专用 Slack 应用程序并代表您将其安装在您的工作区中的范围，这使得一键部署成为可能。

要连接，请打开[Fleet](https://smith.langchain.com/agents?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-slack-app)中的**集成**页面，搜索**Slack**，然后单击Slack卡上的**连接**。当您第一次将 Slack 应用程序添加到代理时，Fleet 也会内联运行此连接，因此您可以跳至 [Step 2](#step-2-add-a-slack-app-to-an-agent) 并在出现提示时进行授权。

<Note>
当您的工作区中的某人第一次连接时，Slack 可能会将请求路由到 Slack 工作区管理员。当管理员审核它时，他们可以：

- **允许 Fleet 安装应用程序**：工作区中的任何人都可以从 Fleet 创建 Slack 代理，无需其他批准。
- **每个应用程序都需要批准**：Fleet 创建的每个 Slack 代理在安装之前都需要单独的管理员批准。

如果您的工作区需要每个应用程序的批准，请遵循 [Add an app that needs admin approval](#add-an-app-that-needs-admin-approval)。
</Note>

### 步骤 2. 将 Slack 应用程序添加到代理<Steps>
  <Step title="Add Slack to the agent">
    在 [Fleet](https://smith.langchain.com/agents?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-slack-app) 中，选择您的代理并打开其配置侧边栏。展开 **Channels** 抽屉并选择 **Slack**。单击“**添加到 Slack**”。如果您尚未连接 Slack，Fleet 首先运行 [manager authorization](#step-1-connect-the-fleet-slack-manager)。

    （可选）展开**高级**并启用**允许机器人触发器**以让来自其他 Slack 机器人的消息开始运行。
  </Step>
  <Step title="Confirm the install">
    Fleet 使用其描述和图标创建一个以您的代理命名的 Slack 应用程序，并将其安装在您的工作区中。然后，机器人会向您发送一条直接消息，其中包含邀请其加入频道并提及它的提示。

    要确认应用程序已连接，请展开代理配置侧栏中的 **Channels** 抽屉。实时 Slack 频道显示 **活动** 状态。
  </Step>
</Steps>

### 添加需要管理员批准的应用程序

如果您的 Slack 工作区需要管理员批准每个应用程序，Fleet 会将新应用程序保存为草稿，而不是安装它。完成设置需要两轮：1. 单击待处理 Slack 行上的 **完成设置**。 Slack 会打开一个窗口，您可以在其中单击“**请求**”将应用程序发送给您的工作区管理员。
1. 管理员批准后，返回舰队并再次单击“**完成设置**”。 Fleet 安装应用程序并激活频道。

## 在自托管上设置 Slack

自托管部署不使用 Fleet Slack 管理器。相反，为实例配置一次 Slack OAuth 提供程序，然后根据 Fleet 生成的清单为每个代理创建自定义 Slack 应用程序。

### 步骤 1. 设置 Slack OAuth 提供商

每个自托管实例都需要进行此一次性设置，然后代理才能使用 Slack。它为您的代理启用 [Slack tools](#add-slack-tools) 并打开 Slack 通道，这使您可以在步骤 2 中添加自定义应用程序。

<Steps>
  <Step title="Configure Helm">
    选择提供商 ID，例如 `slack-oauth-provider`。将其与拥有 OAuth 提供商的组织一起添加到您的 [⟦T4⟧](/langsmith/kubernetes#configure-your-helm-charts) 中，并部署：

    ```yaml
    fleet:
      oauth:
        # Organization ID where OAuth providers are configured
        providerOrgId: "<your-org-id>"
        slackOAuthProvider: "<provider-id>"
    ```

    ```bash
    helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
    ```

    确认舰队 Pod 重新启动。此时提供者 ID 只是一个名称。其余步骤创建它所引用的提供者。
  </Step>

  <Step title="Create a Slack app for the provider">
    转到[api.slack.com/apps](https://api.slack.com/apps)并单击**创建新应用程序**。
  </Step><Step title="Add bot scopes">
    在 **OAuth 和权限**中，添加以下机器人令牌范围：

    - `channels:history`
    - `channels:read`
    - `chat:write`
    - `files:write`
    - `groups:history`
    - `groups:read`
    - `im:history`
    - `im:read`
    - `im:write`
    - `mpim:history`
    - `mpim:read`
    - `team:read`
    - `users:read`
    - `users:read.email`
  </Step>

  <Step title="Register the provider in LangSmith">
    从 Slack 应用程序的“基本信息”中复制“客户端 ID”和“客户端密钥”。在 LangSmith 中，转到 **设置 > OAuth 提供商** 并添加提供商：

    - **提供商 ID**：您设置为 `slackOAuthProvider` 的 ID。
    - **客户端 ID**：来自 Slack 应用程序。
    - **客户端秘密**：来自 Slack 应用程序。
    - **授权网址**：`https://slack.com/oauth/v2/authorize`
    - **令牌 URL**：`https://slack.com/api/oauth.v2.access`

    在您设置的组织中注册为`providerOrgId`。舰队从该组织解析提供程序，因此在其他地方注册的提供程序失败并出现未知提供程序错误。
  </Step>

  <Step title="Add the redirect URI to Slack">
    在 Slack 应用程序中，转到 **OAuth 和权限 > 重定向 URL** 并添加以下内容，将 `<hostname>` 替换为您的 LangSmith 主机名，将 `<provider-id>` 替换为您的提供商 ID：

    ```
    https://<hostname>/host-oauth-callback/<provider-id>
    ```
  </Step>
</Steps>

在设置 `slackOAuthProvider` 之前，Fleet 不会注册 Slack 触发器，**添加 Slack 应用程序**保持禁用状态，并且 Slack 通道不会出现在代理上。<Note>
[Step 2](#step-2-create-a-custom-slack-app) 中的每个自定义 Slack 应用程序都有自己的 OAuth 提供程序，向导会根据您粘贴的凭据进行注册。这就是为什么步骤 2 要求提供单独的客户端 ID、客户端密钥和签名密钥。
</Note>

### 步骤 2. 创建自定义 Slack 应用程序

从您希望机器人运行的代理启动此流程，以便 Fleet 在您完成后为您链接该应用程序。

<Steps>
  <Step title="Open the Slack setup dialog">
    选择您的代理并打开其配置侧边栏。展开 **Channels** 抽屉并选择 **Slack**。

    您还可以从 **集成** 页面开始：在左侧导航中选择 **Slack 和 Teams**，然后在 **Slack 应用程序** 部分中单击 **添加 Slack 应用程序**。
  </Step>

  <Step title="Create the app in Slack">
    1. 输入机器人的名称。
    1. 单击“**创建 Slack 应用程序**”。 Fleet 打开带有预填充应用程序清单的 Slack API 站点。
    1. 选择要安装机器人的工作区。

    <Warning>
    不要在此流程之外创建 Slack 应用程序。生成的清单设置事件订阅 URL、交互 URL、OAuth 重定向 URL 以及队列所需的范围。手动创建的应用程序不会接收事件。
    </Warning>
  </Step><Step title="Enter your app credentials">
    返回 Fleet，单击 **Continue To Credentials** 并从新的 Slack 应用程序复制以下值：

    - **应用程序ID**：来自**基本信息**。
    - **客户端ID**：来自**基本信息>应用程序凭据**。
    - **客户端秘密**：来自**基本信息>应用程序凭据**。单击 Slack 中的 **显示** 并复制整个值。
    - **签名秘密**：来自**基本信息>应用程序凭证**。单击 Slack 中的 **显示** 并复制整个值。

    （可选）启用**允许机器人触发器**，让来自其他 Slack 机器人的消息开始运行。

    单击**保存凭据**。
  </Step>

  <Step title="Connect OAuth">
    1. 单击**连接 OAuth**。 Slack 打开一个授权窗口。
    1. 单击“**允许**”在您的工作区中安装该应用程序。

    **需要管理员批准的 Slack 应用程序**：如果 Slack 显示 **请求** 而不是 **允许**，则您的工作区需要管理员批准：

    1. 在 Slack 窗口中，单击 **请求** 将安装请求发送给您的管理员。这实际上是通知管理员的。
    1. 返回舰队，单击“**保存并请求批准**”。尽管其名称如此，此按钮仅将应用程序保存为草稿，以便您可以在管理员批准后恢复。参见[Finish a draft Slack app](#finish-a-draft-slack-app)。
  </Step>

  <Step title="Finish setup">
    单击**完成**。如果您从代理开始，Fleet 会将应用程序链接到该代理。如果您从 **集成** 页面开始，请从下拉列表中选择一个代理，或单击 **不使用代理完成** 以稍后链接一个代理。
  </Step>
</Steps>

### 完成 Slack 应用草稿

单击 **保存并请求批准** 会将应用程序保存为草稿，以便您在 Slack 管理员审核安装请求时保留进度。该草稿显示在 **Slack Apps** 部分的 **待 Slack 管理员批准**下。

在您的管理员批准该应用程序后：

1. 在 **集成** 页面上，选择左侧导航中的 **Slack 和 Teams** 以打开 **Slack 应用程序** 部分。
1. 单击草稿上的“**恢复设置**”。
1. 重新输入 **客户端密钥** 和 **签名密钥**。 Fleet 不会将机密存储在草稿中，因此请再次从 Slack 复制它们。
1. 单击“**保存凭据**”，然后单击“**连接 OAuth**”，然后单击“Slack 中的**允许**”。
1. 选择要将应用程序链接到的代理，然后单击 **完成**。

<Note>
每个客服人员只能拥有一个 Slack 应用程序，并且每个 Slack 应用程序只能链接到一个客服人员。
</Note>

## 在 Slack 中使用您的代理安装应用程序后，邀请代理加入频道，对其进行标记以开始运行，并在不离开 Slack 的情况下响应批准请求。

### 邀请代理加入频道

1. 在 Slack 中，转到您要使用代理的频道。
1. 输入`/invite @YourAgentName`进行邀请。
1. 使用`@YourAgentName`提及代理以开始运行。代理在线程中回复。

您还可以向机器人发送直接消息或将其添加到群组直接消息中。

### 批准或拒绝 Slack 中的操作

当代理暂停使用需要批准的工具时，它会直接在 Slack 中提出请求。该消息命名了工具和操作，并带有 **批准** 和 **拒绝** 按钮，因此您可以在不离开 Slack 的情况下做出响应。

有关更多信息，请参阅[Human-in-the-loop](/langsmith/fleet/essentials#human-in-the-loop)。

### Slack 中的错误消息

如果代理在运行期间遇到错误，它会在 Slack 线程中进行回复，而不是保持沉默。对于某些错误类型（例如身份验证错误），回复会包含更多详细信息，以便您可以解决问题。

## 添加 Slack 工具Slack 工具可让您的代理发送消息、在线程中回复、读取历史记录以及发送直接消息。无论代理是如何触发的，无论是通过 Slack、Fleet UI、计划还是 Webhook，它们都会工作。

例如，您可以在队列聊天 UI 中启动一项长时间运行的研究任务，并指示代理在完成后向您发送一条 Slack 消息。

添加 Slack 工具：

1. 打开代理，然后在侧栏中展开 **连接** 抽屉。
1. 单击 **添加连接** 并添加 Slack（如果尚未连接）。
1.添加您需要的Slack工具：
   - **发送频道消息**：将消息发布到频道。
   - **回复消息**：在线程中回复。
   - **写私人消息**：发送直接消息。
   - **读取频道历史记录**：读取最近的频道消息。
   - **阅读主题消息**：阅读主题中的回复。
1. 如果出现提示，请授权 Slack 连接。

<Tip>
您还可以要求您的代理自行添加这些工具。在代理聊天中，尝试：“添加 Slack 工具，以便您可以回复消息。”
</Tip>

<Note>
将每个工具设置为“自动”以在未经批准的情况下运行它，或“询问”以在运行前需要批准。欲了解更多信息，请参阅[Human-in-the-loop](/langsmith/fleet/essentials#human-in-the-loop)。
</Note>## 故障排除

### 代理没有回应

如果您的代理没有响应，请尝试以下操作：

- 检查舰队 UI 中的线程是否有错误。
- 验证代理已被邀请加入频道。
- 确认 **Channels** 抽屉中的 Slack 通道未暂停。
- 删除 **Channels** 抽屉中的 Slack 应用程序，然后重新设置。

### 不允许标记机器人

如果您收到一条私人消息，提示您不允许标记机器人，则表明您的 Slack ID 未获得该代理的授权。代理的所有者需要与您一起[share the agent](/langsmith/fleet/manage-agent-settings#change-access-to-the-agent)，可以通过与整个LangSmith工作区共享运行访问权限，也可以与您单独共享。

### Slack 应用程序仍等待批准

处于挂起状态的 Slack 行正在等待 Slack 管理员。请求管理员在 Slack 中批准该应用程序，然后再次单击“**完成设置**”。参见[Add an app that needs admin approval](#add-an-app-that-needs-admin-approval)。

### 添加 Slack 应用程序已禁用

在自托管上，**Slack Apps** 部分中的 **添加 Slack App** 按钮将被禁用，直到设置 `fleet.oauth.slackOAuthProvider`。参见[Set up the Slack OAuth provider](#step-1-set-up-the-slack-oauth-provider)。

## 后续步骤

<CardGroup cols={3}>

  <Card title="Add more tools" icon="puzzle" href="/langsmith/fleet/tools">
    将附加服务连接到您的代理
  </Card>

  <Card title="Add more channels" icon="bolt" href="/langsmith/fleet/channels">
    设置电子邮件、时间表或 Webhook 渠道
  </Card>

  <Card title="Use templates" icon="layout-grid" href="/langsmith/fleet/templates">
    从预构建的代理模板开始
  </Card>
</CardGroup>---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/slack-app.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>