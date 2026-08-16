<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Channels | https://docs.langchain.com/langsmith/fleet/channels -->

# 频道

通道定义代理开始运行的时间。将您的代理连接到外部事件，以便它自动响应消息、电子邮件或其他事件。

<Tip>
要定期触发代理，请使用[schedules](/langsmith/fleet/schedules)。
</Tip>

## 添加频道

添加频道：

<Steps>
  <Step title="Open your agent">
    在 [Fleet](https://smith.langchain.com/agents?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-channels) 收件箱中打开您的代理。
  </Step>
  <Step title="Add the channel">
    1. 在侧边栏中，展开 **Channels** 抽屉，然后单击 **Connect your first channel**。
    1. 选择您要添加的频道，然后按照提示进行身份验证。
  </Step>
</Steps>

### 添加 Gmail 频道

当新电子邮件到达您的收件箱时，Gmail 渠道会激活您的代理。要让您的客服人员阅读和回复电子邮件，请在 **工具** 部分中添加 Gmail 工具。可用的 Gmail 工具包括阅读电子邮件、发送回复、创建草稿、管理标签以及将邮件标记为已读。请参阅[Tool integrations](/langsmith/fleet/tools)了解更多信息。

<Warning>
Gmail 渠道仅监控您的主收件箱。以下电子邮件不会激活通道：- **别名电子邮件**：消息发送到电子邮件别名而不是您的主要地址。
- **邮件列表电子邮件**：通过邮件列表或组收到的消息。
- **收件箱外的电子邮件**：由于过滤器而跳过收件箱的邮件，或者进入垃圾邮件、垃圾箱或其他文件夹的邮件。
</Warning>

### 添加 Slack 频道

Slack 频道可让您的团队直接在 Slack 中与代理聊天。使用 Slack 进行一次身份验证后，Fleet 一键将代理添加到 Slack，并使用代理的名称、描述和图标配置 Slack 应用程序。在频道中提及代理或向其发送直接消息以开始运行。

有关设置说明，请参阅[Integrate Slack with an agent](/langsmith/fleet/slack-app)。

### 添加 Microsoft Teams 频道

当在 Microsoft Teams 对话中发送消息时，Teams 通道会激活您的代理。

有关完整的设置说明，包括 Azure Bot 创建、凭据注册和工具配置，请参阅 [Integrate Teams with an agent](/langsmith/fleet/teams-app)。

## 暂停和恢复频道

您可以暂停和恢复频道，而无需删除它们。暂停所有频道：

1. 在[Fleet](https://smith.langchain.com/agents?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-channels)收件箱中，打开您的代理。
1. 在侧边栏中，展开 **Channels** 抽屉。
1. 点击<Icon icon="player-pause"/> **暂停频道**按钮暂停所有频道。要恢复所有频道，请单击<Icon icon="player-play"/> **恢复频道**按钮。

## 线程行为

线程的标记方式取决于代理是否使用通道：

- **聊天代理（无通道）**：响应将线程标记为**未读**。查看该线程会将其标记为已读。
- **基于通道的代理**：默认情况下，响应将线程保持为**已读**。

您可以随时手动将任何线程标记为已读或未读。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/channels.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>