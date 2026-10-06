<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build an agent in the UI | https://docs.langchain.com/langsmith/build-an-agent -->

# 在UI中构建一个代理

“构建”选项卡如何从表单配置代理、该表单的每个部分设置的内容以及新代理的跟踪记录的位置。

**构建**选项卡在LangSmith而不是代码中创建代理。您填写配置表单，提交时LangSmith会从中创建一个[no-code agent](/langsmith/fleet)。在您创建之前，什么都不会被创建。

当您需要一个没有本地项目或部署的工作代理时，请使用它。它生成的所有内容都是 [agent](/langsmith/agents) ，就像其他任何东西一样，因此它的跟踪、仪表板和评估器的行为与您自己检测的行为相同。

<Note>
  **测试版。** 基于代理的工作区位于 [beta](/langsmith/release-stages) 中。 LangChain 为组织启用基于代理的工作区，并且更改适用于之后创建的工作区。现有的 [project-based](/langsmith/observability-concepts#tracing-projects) 工作区不会自动转换，但 LangChain 可以对其进行转换。要询问访问权限，[contact our sales team](https://www.langchain.com/contact-sales)。
</Note>

<Note>
  在这里创建代理需要 [computer use](/langsmith/fleet/computer-use)，它包含在 Plus 和 Enterprise 计划中。如果没有它，表单仍然会打开，并且会出现一个横幅，显示代理创建不可用。
</Note>

**构建**选项卡仅出现在基于代理的工作区中。要从您自己的计算机上的文件构建代理，请参阅[Managed Deep Agents](/langsmith/python/managed-deep-agents-overview)。

## 创建代理创建代理：

1. 在左侧导航栏中，单击“**构建**”。如果未选择代理，Build 会要求您选择一个代理，并在列表下方提供 **+ 新代理**。该列表仅包含此处构建的代理，因此您从代码跟踪的代理不会出现在其中。
2. 填写[configuration sections](#configure-the-agent)。表单标题下有一行内容：**在单击“创建代理”之前不会创建任何内容。**
3. 单击**创建代理**。

LangSmith 创建代理，然后完成其余设置，例如连接帐户和注册时间表。一个对话框报告登陆的内容并提供**转到 Studio** 来测试代理。

**取消** 离开而不创建任何内容并返回到代理列表。

如果部分设置未完成，表单会报告哪一部分并提供**重试未完成的更改**，因此第二次尝试不会创建第二个代理。

代理列表上方的***代理**也达到这种形式。它打开 **New Agent** 面板，其 **Builder** 选项“在 LangSmith 内构建和配置”，在空白表单上打开此选项卡。面板的其他三个选项请参见[Create an agent](/langsmith/create-an-agent)。

## 配置代理该表格是一页可折叠部分。每个部分都开始打开，浏览器会记住您折叠的部分。

* **基础知识**：代理的**名称**、代理功能的**描述**以及支持其响应的**模型**。该名称是必需的，它是您在代理切换器中看到的标签。创建代理时需要该模型。
* **说明**：**代理说明**，涵盖代理的角色、职责以及应如何工作。 LangSmith 完全按照输入保存。
* **工具和帐户**：代理用于其工具的连接，通过 **添加连接** 添加。在新代理上，创建帐户时会授予帐户，并且添加工作区连接会立即启动其授权流程。有关代理使用的凭据，请参阅[Agent identity](/langsmith/fleet/agent-identity)。
* **技能和内存**：代理为特定任务拉入的[skills](/langsmith/fleet/skills)，以及它在运行之间保留的内存文件。 **更新内存和指令**允许代理修改自己的配置，自动应用或保留以供您批准。* **渠道**：代理是否在 Slack 中工作。在新代理上，您可以在创建代理后授权 Slack。在现有代理上，连接或删除 Slack 会立即生效。如果 Slack 设置在工作区中不可用，则该部分如此说明。
* **时间表**：代理自行制定的[scheduled runs](/langsmith/fleet/schedules)。

代理存在后，标题下的状态行将显示 **未保存的更改** 或 **所有更改已保存**。

## 稍后更改配置

在“构建”中选择代理以重新打开其配置，现在标题为“**代理配置**”。编辑任意部分并单击**保存更改**。

如果没有代理的编辑权限，表单将打开**仅查看**。重命名需要更新代理跟踪项目的权限，当您缺少该权限时，**名称** 字段会说明这一点。

## 寻找痕迹

此处构建的代理是通过 **Production** [environment](/langsmith/agent-environments) 单独创建的，并且其运行在那里。只有当有东西向其他环境报告时，它才会获得其他环境。

要查看其环境，请选择代理并打开 **Tracing**，或阅读 [agent Overview](/langsmith/navigate-agents#read-the-agent-overview) 上的摘要。UI 中构建的代理无需部署，因为它在 Studio 运行时而不是您部署的运行时运行。它的概述中没有 **部署** 部分，并且无法为其创建部署，因此 [agent environment deploy flags](/langsmith/deploy-to-agent-environment) 不适用于它。选择该代理后，工作区的其他部署将被隐藏。

## 另请参阅

* [Agents](/langsmith/agents)
* [Navigate agents](/langsmith/navigate-agents)
* [No-code agents](/langsmith/fleet)
* [Agent environments](/langsmith/agent-environments)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/build-an-agent.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>