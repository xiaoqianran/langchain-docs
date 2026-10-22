<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tool integrations | https://docs.langchain.com/langsmith/fleet/tools -->

# 工具集成

让您的代理能够访问广泛的工具和服务。

您可以访问LangSmith舰队中的各种工具。使用工具集成和 [MCP servers](/langsmith/fleet/remote-mcp-servers) 让您的代理能够访问电子邮件、日历、聊天、项目管理、代码托管、电子表格/BI、搜索、社交和一般 Web 实用程序。

## 添加工具

您可以从 [Fleet > Integrations tab](https://smith.langchain.com/agents/tools) 添加工具，使其可供工作区中的所有代理使用，或者从代理侧边栏添加工具以将其添加到特定代理。

**来自舰队 > 集成**

要将工具添加到工作区中的所有代理：

1. 在[Fleet > Integrations tab](https://smith.langchain.com/agents/tools)上找到您要添加的工具。
2. 单击**连接**。
3. 按照提示将工具连接到您的代理。

**来自代理侧边栏**

要将工具添加到特定代理：

1. 在[Fleet](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-fleet-tools)中，选择要添加工具的代理。
2. 在侧栏中，展开 **连接** 抽屉并单击 **添加连接**。
3. 选择您要添加的工具。

## 断开工具连接

要从代理中删除工具：

**1.选择代理**

在 [Fleet](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-fleet-tools) 中，选择要从中删除工具的代理。

**2.移除工具**1. 在边栏中，展开 **连接** 抽屉并找到要删除的工具。
2. 单击该工具的 **删除** 图标。

## 内置工具

以下工具是 LangSmith Fleet 中可用工具的子集。如需完整的最新列表，请访问 [Fleet > Integrations tab](https://smith.langchain.com/agents/tools)。

> **Gmail**
>
> 在 Gmail 收件箱中阅读、撰写和整理电子邮件。

> **谷歌 BigQuery**
>
> 运行查询并分析存储在 Google BigQuery 中的大型数据集。

> **谷歌日历**
>
> 查看、创建和管理日历事件和会议安排。

> **谷歌文档**
>
> 在 Google 文档中创建、阅读和编辑文档。

> **谷歌表格**
>
> 读取、更新和分析 Google Sheets 电子表格中的数据。

> **Excel**
>
> 读取、写入和分析 Microsoft Excel 工作簿中的数据。

> **展望**
>
> 阅读、起草和组织 Outlook 电子邮件、会议和日历活动。

> **幻灯片**
>
> 搜索、阅读和创建 Microsoft PowerPoint 演示文稿。

> **SharePoint**
>
> 浏览、阅读和管理 Microsoft SharePoint 中的文档和网站。

> **团队**
>
> 在 Microsoft Teams 中发送和阅读消息、频道和协作更新。

> **字**
>
> 搜索、阅读和管理 Microsoft Word 文档。> **Ex**
>
> 使用人工智能驱动的语义搜索在网络上搜索高度相关的结果。

> **GitHub**
>
> 在 GitHub 上浏览存储库、管理问题和拉取请求以及审查代码。

> **线性**
>
> 在 Linear 中跟踪问题、计划冲刺并协调团队项目。

> **领英**
>
> 创建帖子、管理您的公司页面并与您的专业网络互动。

> **塔架**
>
> 跨渠道查看并回复客户支持对话。

> **松弛**
>
> 在 Slack 中发送消息、管理频道并自动发送通知。

> **塔维利**
>
> 搜索网络并从网页中提取结构化内容。

> **X**
>
> 在 X 上发布帖子、监控提及情况并与受众互动。

> [!提示]
>
> 您还可以连接到远程 MCP 服务器，以便您的代理能够访问其他工具。请参阅[Remote MCP servers](/langsmith/fleet/remote-mcp-servers)了解更多信息。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/tools.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。