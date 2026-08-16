<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Quickstart | https://docs.langchain.com/langsmith/fleet/quickstart -->

# 快速入门

在本快速入门结束时，您将拥有一个执行助理，它可以标记需要您注意的 Gmail 邮件，并在采取行动之前暂停等待批准，所有设置都无需代码或模型 API 密钥，并通过聊天进行控制。

<Callout icon="message" color="#8B5CF6" iconType="regular">
您可以通过聊天与代理互动，就像给乐于助人的助理发短信一样。
</Callout>

您将从预构建的 **行政助理** [template](/langsmith/fleet/templates) 开始，它管理您的收件箱、日历和每日简报。

## 开始之前

您需要：
- 一个LangSmith帐户（[sign up here](https://smith.langchain.com/agents?skipOnboarding=true&utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-quickstart)）。
- Gmail 帐户。
- 谷歌日历。

Fleet 为您管理 AI 模型，因此您不需要自己的模型提供商 API 密钥。有关更多信息，请参阅[Models](/langsmith/fleet/essentials#models)。

## 1. 创建您的代理

<Steps>
  <Step title="Navigate to Fleet">
    1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-quickstart)中，点击左侧导航顶部的<Icon icon="pointer"/>**切换到车队**。
  </Step>

  <Step title="Choose a template">
    1. 在左侧导航栏中选择“**模板**”，或单击“**我的代理**”中的“**+**”，然后选择“**来自模板**”。
    1. 选择 **Executive Assistant** 模板来创建您的代理。
    1. 单击右上角的**创建代理**。<Tip>
    如果您不想从模板开始，请在创建代理并描述所需的代理时选择 **使用 AI 构建** 或 **新代理**。代理会自行配置并在关键点暂停以等待您的输入。
    </Tip>
  </Step>

  <Step title="Skip channel setup for now">
    当代理提示您连接通道时，单击“**立即跳过**”。您可以连接 [later step](#3-configure-your-agent) 中的通道。
  </Step>

  <Step title="Answer onboarding questions">
    提供信息，以便您的代理知道如何按照您喜欢的方式工作。
  </Step>

</Steps>

## 2. 连接工具

您的代理要求您连接到您的 Gmail 和 Google 日历帐户。

连接为您的代理提供了使用服务的 [tools](/langsmith/fleet/tools)。 [channel](/langsmith/fleet/channels) 让服务触发代理。您可以在此处连接 Gmail 和 Google 日历，然后将 Gmail 添加为 [Configure your agent](#3-configure-your-agent) 中的频道。

<Steps>
  <Step title="Connect Gmail">
    1. 在**Gmail**行中，单击右侧的**连接**。
    2. 在对话框中，单击 **+ 连接新帐户**。
    3. 选择您的帐户并单击**继续**。
    4. 检查权限并单击“**允许**”。
    5. LangSmith 将您重定向回舰队。选择 **Gmail** 以展开该行。
    6. 单击 **选择帐户** 并选择您在步骤 3 中选择的帐户。
  </Step><Step title="Connect Google Calendar">
    1. 连接 Gmail 仅授权您的 Google 帐户使用 Gmail，而不授权使用 Google 日历。要授予日历访问权限，请点击 **Google 日历** 行右侧的 **更新权限**。
    2. 在对话框中，单击“**重新授权**”。
    3. 选择您的帐户并单击**继续**。
    4. 检查权限并单击“**允许**”。
    5. LangSmith 将您重定向回舰队。关闭对话框。
    6. 单击“**保存并继续**”。
  </Step>

</Steps>

<Info>
您的代理仅在执行您指定的任务时才会访问您的帐户。您可以随时在 [agent sidebar](/langsmith/fleet/essentials#agent-sidebar) 或 Google 帐户设置中撤销访问权限。
</Info>

## 3. 配置您的代理

有两种方法可以配置代理：

- 直接与您的经纪人聊天
- 修改[agent sidebar](/langsmith/fleet/essentials#agent-sidebar)中的设置

本节介绍如何使用代理侧边栏配置代理。

<Steps>

  <Step title="Open the agent sidebar">
    点击右上角**<Icon icon="settings"/>配置**，打开代理侧边栏。
  </Step>

  <Step title="View connections">
    展开**连接**抽屉。 **Gmail** 和 **Google 日历** 显示为 **已连接**。如果其中任何一个显示为未连接，请先完成[2. Connect tools](#2-connect-tools)，然后再继续。
  </Step><Step title="Configure a tool to ask for approval">
    在 **连接** 抽屉中，单击 **Gmail** 以查看可用的工具。默认情况下，这些工具处于启用状态并设置为 **自动**，因此它们无需您的批准即可运行。

    对于 **应用标签**，请单击 **询问**，以便您的代理暂停并等待您的批准，然后再继续。您可以接受建议的操作，也可以拒绝它并告诉客服人员要更改哪些内容。有关更多信息，请参阅[Human-in-the-loop](/langsmith/fleet/essentials#human-in-the-loop)。
  </Step>

  <Step title="Connect channels">
    展开**通道**抽屉。点击 **Gmail**。选择您为 **连接** 设置的帐户。点击**确认**。
  </Step>

  <Step title="Save your changes">
    单击侧边栏顶部的 **保存** 以保存更改，然后单击 **X** 关闭面板。
  </Step>

</Steps>

## 4. 测试你的代理

<Steps>

  <Step title="Send your agent a task">
    在代理聊天中，尝试执行助理，例如：

    > _对我收到的需要我进行某种审核的电子邮件应用“审核”标签。_
  </Step>

  <Step title="Accept or reject the agent's action">
    单击“**接受**”以批准代理建议的操作，或告诉代理其做错了什么，然后单击“**拒绝**”。
  </Step>

  <Step title="Check your inbox in Gmail">
    如果您单击“**接受**”，则需要审阅的电子邮件现在会在收件箱中显示“**审阅**”标签。
  </Step>

</Steps>

## 编辑你的代理您可能需要更新代理的说明或包含更多工具。您可以直接与您的代理聊天以请求更新，或从[agent sidebar](/langsmith/fleet/essentials#agent-sidebar)进行配置：

- 在**知识**抽屉中编辑代理的说明（其`AGENTS.md`）。参见[Instructions](/langsmith/fleet/essentials#instructions)。
- 在**连接**抽屉中添加集成和工具，并将每个工具设置为自动运行或[ask for approval](/langsmith/fleet/essentials#human-in-the-loop)。参见[Tools](/langsmith/fleet/tools)。
- 连接**通道**抽屉中的[Slack](/langsmith/fleet/slack-app)、[Gmail](/langsmith/fleet/channels#add-a-gmail-channel)或[Microsoft Teams](/langsmith/fleet/teams-app)。
- 在 **Schedules** 抽屉中的 [schedule](/langsmith/fleet/schedules) 上运行您的代理。
- 更改**高级设置**抽屉中的[model](/langsmith/fleet/manage-agent-settings#change-the-model)。

## 后续步骤

现在您已经创建了第一个代理，下面是要探索的内容：

<CardGroup cols={2}>
  <Card title="Try more templates" icon="layout-grid" href="/langsmith/fleet/templates">
    探索用于常见任务的预构建代理
  </Card>

  <Card title="Add automation" icon="bolt" href="/langsmith/fleet/essentials#channels">
    通过渠道（Slack、电子邮件、时间表）自动运行您的代理
  </Card>

  <Card title="Connect more tools" icon="puzzle" href="/langsmith/fleet/tools">
    添加 Slack、GitHub、Linear 等
  </Card>

  <Card title="Build complex agents" icon="sitemap" href="/langsmith/fleet/essentials#sub-agents">
    使用子代理来分解大任务
  </Card>
</CardGroup>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>