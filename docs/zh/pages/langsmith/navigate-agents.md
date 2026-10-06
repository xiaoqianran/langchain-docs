<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Navigate agents | https://docs.langchain.com/langsmith/navigate-agents -->

# 导航代理

座席切换器如何在座席列表和单个座席之间移动、哪些部分需要座席以及座席概览显示的内容。

要在工作区中的 [agents](/langsmith/agents) 之间移动，请使用顶部栏中的代理切换器。选择一个代理以仅查看该代理的计数、图表和跟踪列表。

<Note>
  **测试版。** 基于代理的工作区位于 [beta](/langsmith/release-stages) 中。 LangChain 为组织启用基于代理的工作区，并且更改适用于之后创建的工作区。现有的 [project-based](/langsmith/observability-concepts#tracing-projects) 工作区不会自动转换，但 LangChain 可以对其进行转换。要询问访问权限，[contact our sales team](https://www.langchain.com/contact-sales)。
</Note>

<img alt="An agent's Overview, with the agent switcher in the top bar naming the agent, the ID field below it, and the metrics row for the last 7 days across all environments." />

<img alt="An agent's Overview, with the agent switcher in the top bar naming the agent, the ID field below it, and the metrics row for the last 7 days across all environments." />

## 在代理之间切换

代理切换器位于顶部栏的左侧，位于工作区切换器和面板折叠切换器之后。它显示**所有代理**或您所在代理的名称。在概述以外的部分中，面包屑会跟随在其后面并命名该部分。

<img alt="The agent switcher open, with a search box above a list of agents and a check mark beside the selected one." />

<img alt="The agent switcher open, with a search box above a list of agents and a check mark beside the selected one." />其背后的地址是`/o/<workspaceId>/a/<agentIdentifier>/...`。工作区槽采用 UUID，代理槽采用代理的 [identifier](/langsmith/agents#identifiers-and-display-names)。代理槽中的连字符表示所有代理，因此 `/a/-` 是 **所有代理** 视图，`/a/<agentIdentifier>` 是单个代理。可以从地址栏设置任一状态，这就是如何直接链接到两个视图之一。

## 所有代理和单代理视图

切换器在两个视图之间移动：

* **所有座席**：座席列表，工作区中每个座席都有一张卡片。在空的工作区中，它显示一个入门屏幕，其中描述了 [**New Agent** panel](/langsmith/create-an-agent#start-from-the-new-agent-panel) 中的选项，并通过单个 **开始** 按钮打开该面板。
* **单个代理**：该代理的概述。

左侧导航在两个视图中列出了相同的项目，但其第一行显示为代理列表上的“所有代理”和代理内的“概述”。有两点不同：

* **徽章计数**：隐藏在代理列表中，部署除外。当您选择一个代理时，将显示计数并且仅涵盖该代理。
* **部分可用性**：某些部分要求您首先选择代理。参见[Sections that require an agent](#sections-that-require-an-agent)。

## 需要代理的部分大多数部分都适用于所选的**所有代理**，包括代理列表（列出工作区中的每个代理）和部署（列出工作区中的每个部署）。 Engine、Studio、Build、Tracing 和 Monitoring 需要您选择代理。如果您在选择 **所有代理** 的情况下打开这些部分，您所看到的内容取决于您的工作区是否还有任何代理。

如果您的工作区有代理，该部分会显示可供选择的可搜索代理列表，标题为**选择要查看的代理**。在构建中，该列表位于“配置现有代理或构建新代理”下方。反而。顶部栏保持在原位，因此您也可以从切换器中进行选择。在列表下方，Studio 显示**连接代理服务器**，构建显示**+ 新代理**。跟踪还向可以创建项目的用户显示 **+ 新代理**。构建仅列出代理[built in the UI](/langsmith/build-an-agent)。其他部分列出了工作区中的每个代理。由于工作区中没有代理，引擎、Studio、跟踪和监控显示列表为空，显示**没有可用的代理**。只要工作区在 UI 中没有内置代理，即使它有其他代理，构建也会显示相同的空列表，并且其 **+ 新代理** 按钮仍会启动新代理。部署显示其自己的页面，该页面提供了在工作区没有部署时创建第一个部署的方法。

选择代理后，当您在这些部分之间移动时，LangSmith 会使其保持选中状态。要查看 **所有代理** 的代理列表，请将鼠标悬停在切换器中所选代理的名称上，然后选择其旁边显示的 **X**。

## 打开设置

设置以自己的布局打开：代理切换器消失了，导航分为组织和工作区部分，**返回LangSmith**链接返回到代理视图。

## 阅读代理概述

当您选择代理时，LangSmith 打开其概述。

切换器显示客服人员的显示名称。标有 **ID** 的字段（旁边有一个复制按钮）保存标识符，这也是地址栏携带的值。 **ID**字段缩短了中间的一个长标识符。当您需要该值进行跟踪时，请使用 **ID** 旁边的复制按钮。 [Agent addressing](/langsmith/log-traces-to-agent) 采用标识符，而不是显示名称。对于哪个值是哪个，请参阅[Identifiers and display names](/langsmith/agents#identifiers-and-display-names)。

在 **ID** 字段下方，概述按顺序显示以下内容：

* **指标**：跟踪计数、错误率、令牌计数和总成本，每个指标涵盖所有环境中过去 7 天的固定时间段。随着时间的推移，轨迹线的迷你图引领了这一行。
* **跟踪**：代理拥有的每个环境一行，包括没有跟踪的环境，以及最近的运行、跟踪计数、错误率、P50 延迟、P99 延迟和描述。
* **引擎**：[Engine](/langsmith/engine-overview) 在此代理环境中发现的活动问题数量，以及 **转到引擎** 链接。
* **评估您的代理**：描述对数据集和实时生产跟踪的评估，并带有指向[evaluators](/langsmith/evaluators)的**转到评估器**链接。
* **监控您的代理**：描述如何使用仪表板、警报和反馈来监控代理，从单个跟踪到生产范围的指标，并使用指向 [dashboards](/langsmith/dashboards) 的 **转到仪表板** 链接。* **部署**：通过 [Deploy to an agent environment](/langsmith/deploy-to-agent-environment) 中的步骤将 [deployments](/langsmith/deployment) 绑定到此代理。每行都链接到该部署。如果没有，该部分描述什么是部署并且不显示任何行。对于哪些代理显示此部分，请参阅[Compare the four routes](/langsmith/create-an-agent#compare-the-four-routes)。

## 另请参阅

* [Agents](/langsmith/agents)
* [Create an agent](/langsmith/create-an-agent)
* [Agent environments](/langsmith/agent-environments)
* [Deploy to an agent environment](/langsmith/deploy-to-agent-environment)
* [Tracing quickstart](/langsmith/observability-quickstart)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/navigate-agents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>