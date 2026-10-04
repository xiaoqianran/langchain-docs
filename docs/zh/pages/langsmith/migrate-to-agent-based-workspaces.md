<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How agent-based workspaces differ | https://docs.langchain.com/langsmith/migrate-to-agent-based-workspaces -->

# 基于代理的工作区有何不同

当工作区从通过跟踪项目组织跟踪转变为通过代理和环境组织跟踪时，会发生什么变化。

LangSmith 以两种方式之一组织工作空间。 *基于项目的工作区*按 [tracing project](/langsmith/observability-concepts#tracing-projects) 对跟踪进行分组。 “基于代理的工作空间”按 [agent](/langsmith/agents) 对它们进行分组，并将每个代理的轨迹划分为从固定的四个集合中绘制的 [environments](/langsmith/agent-environments)。

基于代理的组织位于[beta](/langsmith/release-stages)。本页介绍了基于代理的工作区的不同之处，以及如果您的工作区成为基于代理的工作区，将会发生什么变化。

## 检查你有哪一个

左上角的控件告诉你。在基于代理的工作区中，它会命名您的工作区并打开组织中的工作区列表。在基于项目的工作区中，它显示 LangSmith 徽标，侧边栏有一个带有应用程序选择器的 **Application** 部分。

## 有什么变化

组织容器发生变化，其范围内的所有内容如下：* **跟踪** 组在代理及其环境之一下，而不是在您命名的跟踪项目下。没有任何东西被重新摄入或移动。当现有工作区转换时，每个跟踪项目都会成为具有生产环境的代理，并且该环境会保留项目的 ID 和名称。新环境的跟踪项目将代理标识符、连字符和环境作为其名称：标识符为 `checkout` 的代理在 `checkout-staging` 中具有其暂存跟踪。
* **预构建仪表板** 覆盖环境而不是命名项目。参见[Monitor projects with dashboards](/langsmith/dashboards)。
* **警报** 的范围仅限于代理的环境。参见[Alerts](/langsmith/alerts)。
* **评估者** 附加到环境。参见[Manage evaluators](/langsmith/evaluators)。
* **数据集** 附加到一个或多个代理而不是一个项目，并且不附加到任何环境，因此一个数据集可以为多个代理提供服务。参见[Create and manage datasets in the UI](/langsmith/manage-datasets-in-application)。
* **导航** 在顶部栏中获得一个代理选择器，该选择器可以在代理列表和单个代理的概述之间移动。参见[Navigate agents](/langsmith/navigate-agents)。* **左上角的控件**成为工作区切换器。在基于项目的工作区中，它显示 LangSmith 徽标。在启用 Fleet 的情况下，徽标会打开一个菜单，用于在 LangSmith 和 Fleet 之间移动。否则，它会链接到 LangSmith 主页。在基于代理的工作区中，控件会命名您的工作区并列出组织中的其他工作区。如果启用了 Fleet，菜单末尾会显示 Fleet 链接。

不变的是：您的跟踪、数据集、提示和实验是相同的记录，并且现有的跟踪配置继续有效。参见[Log traces to a specific project](/langsmith/log-traces-to-project)。

## 改变的价值

代理和环境记录跟踪项目无法记录的内容：哪个应用程序生成了跟踪，以及它的哪个部署。然后，LangSmith 可以根据该上下文采取行动，而不是要求您对其进行过滤，因此警报可以监视生产并对本地运行保持安静，并且预构建的仪表板涵盖每个环境，而无需您为其命名项目。

## 工作空间如何移动

在测试期间，LangChain 为组织启用基于代理的组织，并且更改适用于此后在该组织中创建的工作区。您无需采取任何行动。现有的基于项目的工作区不会自动转换。 LangChain 可以对其进行转换，并且转换后将保留您现有的跟踪项目，如[What changes](#what-changes) 中所述。

工作区转换后，工作区管理员可以在新体验和基于项目的经典体验之间切换。转至 **设置** > **工作空间** > **配置** > **工作空间**。该开关适用于工作区中的每个人，并且仅出现在LangChain已转换的工作区中。

<Note>
  此页面描述了更改，而不是其时间表。时间未公布。
</Note>

## 另请参阅

* [Agents](/langsmith/agents)
* [Agent environments](/langsmith/agent-environments)
* [Workload isolation](/langsmith/workload-isolation)
* [Administration overview](/langsmith/administration-overview#agents-and-applications)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/migrate-to-agent-based-workspaces.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>