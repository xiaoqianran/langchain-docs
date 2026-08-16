<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Integrate Teams with an agent | https://docs.langchain.com/langsmith/fleet/teams-app -->

# 将 Teams 与代理集成

借助 LangSmith Fleet，您可以通过注册自定义 Azure 机器人将代理连接到 Microsoft Teams。连接后，您的代理可以：

- 接收来自 Teams 用户的消息，使用消息内容开始新的运行。
- 使用 Bot 框架在 Teams 对话中直接回复。
- 通过 Microsoft Graph API 工具访问 Teams 频道和消息。

<Note>
在频道对话中，机器人仅在明确提及时才会做出响应。在私聊和群聊中，机器人会回复所有消息。
</Note>

## 先决条件

- 舰队中现有的代理（请参阅[Quickstart](/langsmith/fleet/quickstart)创建一个）
- 具有创建资源权限的[Azure account](https://portal.azure.com)
- Microsoft Teams 工作区的管理员访问权限或安装应用程序的权限

## 创建一个 Azure 机器人

在注册 Fleet 之前，您需要创建 Azure Bot 资源并获取其凭据。<Steps>
  <Step title="Create an Azure Bot resource">
    1. 前往[Azure Portal](https://portal.azure.com)。
    1. 搜索 **Azure Bot** 并单击 **创建**。
    1. 填写必填字段：
       - **机器人句柄**：您的机器人的唯一标识符。
       - **订阅**：选择您的 Azure 订阅。
       - **资源组**：创建新资源组或选择现有资源组。
       - **应用程序类型**：选择**多租户**。
       - **创建类型**：选择**创建新的 Microsoft App ID**。
    1. 单击“**查看 + 创建**”，然后单击“**创建**”。
  </Step>

  <Step title="Get your app credentials">
    资源创建后：

    1. 导航到您的机器人资源，然后单击左侧边栏中的 **配置**。
    1. 复制 **Microsoft 应用程序 ID**。稍后您将需要这个。
    1. 单击应用程序 ID 旁边的**管理密码**。
    1. 单击“**新客户端密钥**”，添加描述，然后单击“**添加**”。
    1. 立即复制新密钥的**值** — 它仅显示一次。

    <Warning>
    创建后立即复制客户端密钥值。您稍后无法检索它。如果您丢失了它，则必须创建一个新的。
    </Warning>
  </Step><Step title="Configure the messaging endpoint">
    在 Fleet 中注册机器人后，您将设置消息传递端点。暂时跳过此字段 - 稍后您将返回到此步骤。
  </Step>
</Steps>

## 在 Fleet 中注册机器人

<Steps>
  <Step title="Open the integrations page">
    1. 导航至[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-teams-app)中的**舰队**。
    1. 转到**集成**页面。
    1. 单击“**添加 Teams 应用程序**”。
  </Step>

  <Step title="Enter your credentials">
    填写以下字段：

    - **应用程序名称**：机器人在 Fleet 中的显示名称。
    - **Azure 应用程序 ID**：Azure Bot 资源中的 Microsoft 应用程序 ID。
    - **Azure 应用程序密码**：您之前复制的客户端密钥值。
    - **Azure 租户 ID**（可选）：您的 Azure AD 租户 ID。保留多租户机器人的默认值。

    单击 **创建** 以注册机器人。
  </Step>

  <Step title="Copy the webhook URL">
    注册后，Fleet 会显示 **webhook URL**。复制此 URL — 您需要它来完成 Azure Bot 配置。
  </Step>

  <Step title="Set the messaging endpoint in Azure">
    1. 返回 [Azure Portal](https://portal.azure.com) 中的 Azure Bot 资源。
    1. 转到**配置**。
    1. 将 Fleet 中的 Webhook URL 粘贴到 **消息传送端点** 字段。
    1. 单击“**应用**”。
  </Step>
</Steps>

## 将机器人添加到 Teams<Steps>
  <Step title="Open the Teams channel">
    1. 在 Azure 门户中，转到您的机器人资源。
    1. 单击左侧边栏中的**频道**。
    1. 选择 **Microsoft Teams** 并单击 **应用**。
    1. 同意服务条款。
  </Step>

  <Step title="Install the bot in Teams">
    1. 在 Teams 中，单击左侧边栏中的“**应用程序**”。
    1. 单击“**管理您的应用程序**”，然后单击“**上传应用程序**”。
    1. 上传引用您的 Azure 应用 ID 的 [Teams app manifest](https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema)，或使用 Azure 机器人通道页面中的 **在 Teams 中打开** 链接。
    1. 将机器人添加到所需的团队或聊天中。
  </Step>
</Steps>

## 将机器人链接到代理

您可以从集成页面或代理侧边栏将 Teams 机器人链接到代理。

### 来自集成页面的链接

1. 导航到舰队中 **集成** 页面上的 **Teams 应用程序** 部分。
1. 选择您要链接的机器人。
1. 从下拉菜单中，选择您要链接到的代理。

### 来自代理侧边栏的链接

1. 从左侧导航栏中的**我的代理**中选择您的代理。
1. 在侧边栏中，展开 **Channels** 抽屉。
1. 选择**团队**。
1. 从下拉菜单中，选择要链接的 Teams 应用程序。

## 添加团队工具工具可让您的代理在 Teams 中采取操作。要响应消息并与 Teams 交互，请添加相关工具。

<Tip>
您还可以要求您的代理自行添加这些工具。在代理聊天中，尝试：“添加 Teams 工具，以便可以回复消息。”
</Tip>

1. 在边栏中，展开 **连接** 抽屉并单击 **添加连接**。
1. 搜索“Teams”并添加您需要的工具：
   - **teams_bot_send_proactive_message** — 将消息发送回 Teams 对话
   - **microsoft_teams_list_my_teams** — 列出经过身份验证的用户所属的团队
   - **microsoft_teams_list_channels** — 列出团队中的频道
   - **microsoft_teams_post_channel_message** — 将消息发布到频道
   - **microsoft_teams_read_channel_messages** — 从频道读取最近的消息
1. 如果出现提示，请单击 **连接** 以授权 Microsoft Graph 工具。

<Note>
`teams_bot_send_proactive_message` 工具使用 Bot Framework 凭据，不需要单独的 OAuth 授权。其他 Teams 工具使用 Microsoft Graph API，可能需要 OAuth 同意。
</Note>

## 配置代理行为（可选）您的代理需要知道如何处理传入的 Teams 消息。通过直接在代理聊天中提示来更新其说明：

```
Update your instructions to handle the Teams Trigger and Teams Tools
for bidirectional communication
```

根据您的用例调整说明 - 例如，您可能希望代理仅响应某些类型的问题，或者在回复之前从特定来源提取信息。

## 故障排除

### 代理没有回应

- 检查 Fleet 中的线程是否有任何需要人工输入的批准。
- 在频道对话中，确保您 **@提及** 机器人。没有提及的频道消息将被忽略。
- 检查 **Feed** 选项卡是否有错误。
- 验证 Azure Bot 资源中的消息传递终结点与队列中的 Webhook URL 匹配。
- 确保舰队中的机器人注册未暂停。

### 注册期间凭据无效错误

- 验证 **Azure 应用程序 ID** 和 **应用程序密码**（客户端密钥）是否正确。
- 确保客户端密钥尚未过期。如果需要，在 Azure 中创建新密钥。
- 检查 Azure 中的机器人类型是否设置为 **多租户**。

### 机器人可以在直接消息中工作，但不能在渠道中工作- 机器人必须在频道对话中明确**@提及**。
- 确保机器人已添加到团队中，并且有权限读取频道中的消息。

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
</CardGroup>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/teams-app.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>