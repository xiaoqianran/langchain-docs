<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tool integrations | https://docs.langchain.com/langsmith/fleet/tools -->

# 工具集成

您可以访问LangSmith舰队中的各种工具。使用工具集成和 [MCP servers](/langsmith/fleet/remote-mcp-servers) 让您的代理能够访问电子邮件、日历、聊天、项目管理、代码托管、电子表格/BI、搜索、社交和一般 Web 实用程序。

## 添加工具

您可以从 [Fleet > Integrations tab](https://smith.langchain.com/agents/tools) 添加工具，使其可供工作区中的所有代理使用，或者从代理侧边栏添加工具以将其添加到特定代理。

<Tabs>
  <Tab title="From Fleet > 集成">
  要将工具添加到工作区中的所有代理：

    1. 在[Fleet > Integrations tab](https://smith.langchain.com/agents/tools)上找到您要添加的工具。
    1. 单击**连接**。
    1. 按照提示将工具连接到您的代理。

  </Tab>
  <Tab title="From the agent sidebar">
    要将工具添加到特定代理：

    1. 在[Fleet](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-tools)中，选择要添加工具的代理。
    1. 在边栏中，展开 **连接** 抽屉并单击 **添加连接**。
    1. 选择您要添加的工具。

  </Tab>
</Tabs>

## 断开工具连接

要从代理中删除工具：<Steps>
  <Step title="Select the agent">
    在 [Fleet](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-tools) 中，选择要从中删除工具的代理。
  </Step>
  <Step title="Remove the tool">
    1. 在边栏中，展开 **连接** 抽屉并找到要删除的工具。
    1. 单击该工具的 <Icon icon="trash"/> **删除** 图标。
  </Step>
</Steps>

## 内置工具

以下工具是LangSmith Fleet 中可用工具的子集。如需完整的最新列表，请访问 [Fleet > Integrations tab](https://smith.langchain.com/agents/tools)。

<CardGroup cols={3}>
  <Card title="Gmail" icon="brand-google">
    在 Gmail 收件箱中阅读、撰写和整理电子邮件。
  </Card>
  <Card title="Google BigQuery" icon="brand-google">
    运行查询并分析存储在 Google BigQuery 中的大型数据集。
  </Card>
  <Card title="Google Calendar" icon="brand-google">
    查看、创建和管理日历事件和会议安排。
  </Card>
  <Card title="Google Docs" icon="brand-google">
    在 Google 文档中创建、阅读和编辑文档。
  </Card>
  <Card title="Google Sheets" icon="brand-google">
    读取、更新和分析 Google Sheets 电子表格中的数据。
  </Card>
</CardGroup><CardGroup cols={3}>
  <Card title="Excel" icon="brand-windows">
    读取、写入和分析 Microsoft Excel 工作簿中的数据。
  </Card>
  <Card title="Outlook" icon="brand-windows">
    阅读、起草和组织 Outlook 电子邮件、会议和日历活动。
  </Card>
  <Card title="PowerPoint" icon="brand-windows">
    搜索、阅读和创建 Microsoft PowerPoint 演示文稿。
  </Card>
  <Card title="SharePoint" icon="brand-windows">
    浏览、阅读和管理 Microsoft SharePoint 中的文档和网站。
  </Card>
  <Card title="Teams" icon="brand-windows">
    在 Microsoft Teams 中发送和阅读消息、频道和协作更新。
  </Card>
  <Card title="Word" icon="brand-windows">
    搜索、阅读和管理 Microsoft Word 文档。
  </Card>
</CardGroup><CardGroup cols={3}>
  <Card title="Exa" icon="search">
    使用人工智能驱动的语义搜索在网络上搜索高度相关的结果。
  </Card>
  <Card title="GitHub" icon="brand-github">
    浏览存储库、管理问题和拉取请求，以及在 GitHub 上查看代码。
  </Card>
  <Card title="Linear" icon="list-check">
    在 Linear 中跟踪问题、计划冲刺并协调团队项目。
  </Card>
  <Card title="LinkedIn" icon="brand-linkedin">
    创建帖子、管理您的公司页面并与您的专业网络互动。
  </Card>
  <Card title="Pylon" icon="messages">
    查看并响应跨渠道的客户支持对话。
  </Card>
  <Card title="Slack" icon="brand-slack">
    在 Slack 中发送消息、管理渠道和自动发送通知。
  </Card>
  <Card title="Tavily" icon="world-search">
    搜索网络并从网页中提取结构化内容。
  </Card>
  <Card title="X" icon="brand-x">
    在 X 上发布帖子、监控提及情况并与受众互动。
  </Card>
</CardGroup>

<Tip>
您还可以连接到远程 MCP 服务器，以便您的代理能够访问其他工具。请参阅[Remote MCP servers](/langsmith/fleet/remote-mcp-servers)了解更多信息。
</Tip>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/tools.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>