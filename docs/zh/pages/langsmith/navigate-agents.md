<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Navigate agents | https://docs.langchain.com/langsmith/navigate-agents -->

# 导航代理

座席切换器如何在座席列表和单个座席之间移动、哪些部分需要座席以及座席概览显示的内容。

要在工作区中的 [agents](/langsmith/agent-registry#agent) 之间移动，请使用顶部栏中的代理切换器。选择一个代理以仅查看该代理的计数、图表和跟踪列表。

> [!注意]
>
> [LangSmith Cloud](/langsmith/cloud) 上提供基于代理的工作区。它们在 [self-hosted](/langsmith/self-hosted) LangSmith 上不可用。要检查您的工作区是否基于代理，请查看左上角的控件。在基于代理的工作区中，它是一个为您的工作区命名的工作区切换器。在[project-based](/langsmith/observability-concepts#tracing-projects)工作区中，它显示LangSmith徽标。

![An agent's Overview, with the agent switcher in the top bar naming the agent, the ID field below it, and the metrics row for the last 7 days across all environments.](https://mintcdn.com/langchain-5e9cc07a/J7ZKUnuaUY3KEDGH/langsmith/images/agent-switcher-closed-light.png?fit=max\&auto=format\&n=J7ZKUnuaUY3KEDGH\&q=85\&s=d706de1809cf475248ca264d2f68d943)

## 在代理之间切换

代理切换器位于顶部栏的左侧，位于工作区切换器和面板折叠切换器之后。它显示**所有代理**或您所在代理的名称。在概述以外的部分中，面包屑会跟随在其后面并命名该部分。

![The agent switcher open, with a search box above a list of agents and a check mark beside the selected one.](https://mintcdn.com/langchain-5e9cc07a/0GS5eCN4HA5fQwNT/langsmith/images/agent-switcher-open-light.png?fit=max\&auto=format\&n=0GS5eCN4HA5fQwNT\&q=85\&s=0b42353f60159bf455491f6d0a85845c)其背后的地址是`/o/<workspaceId>/a/<agentIdentifier>/...`。工作区槽采用 UUID，代理槽采用代理的 [identifier](/langsmith/agent-registry#identifiers-and-display-names)。代理槽中的连字符表示所有代理，因此 `/a/-` 是 **所有代理** 视图，`/a/<agentIdentifier>` 是单个代理。可以从地址栏设置任一状态，这就是如何直接链接到两个视图之一。

## 所有代理和单代理视图

切换器在两个视图之间移动：

* **所有座席**：座席列表，工作区中每个座席都有一张卡片。在空的工作区中，它显示一个入门屏幕，其中提供了构建或连接第一个代理的方法。有关选项，请参阅[new agent menu](/langsmith/create-an-agent#start-from-the-new-agent-menu)。
* **单个代理**：该代理的概述。

左侧导航在两个视图中列出了相同的项目，但其第一行显示为代理列表上的“所有代理”和代理内的“概述”。有两点不同：

* **徽章计数**：隐藏在代理列表中，代理服务器上除外。当您选择一个代理时，将显示计数并且仅涵盖该代理。
* **部分可用性**：某些部分要求您首先选择代理。参见[Sections that require an agent](#sections-that-require-an-agent)。

## 需要代理的部分大多数部分都适用于选定的**所有代理**，包括代理列表（列出工作区中的每个代理）和代理服务器（列出工作区中的每个代理服务器）。 Engine、Studio、Tracing 和Monitoring 需要您选择代理。如果您在选择 **所有代理** 的情况下打开这些部分，您所看到的内容取决于您的工作区是否还有任何代理。

如果您的工作区有代理，该部分会显示可供选择的可搜索代理列表，标题为**选择要查看的代理**。顶部栏保持在原位，因此您也可以从切换器中进行选择。跟踪显示**将列表下方的代理**连接到具有`projects:create`权限的用户。该列表包括工作区中的每个代理。

Studio 在其自己的页面上打开，标题为 **Agent Studio**，有三个选择：

* **构建新代理**：开始[building an agent in Studio](/langsmith/build-an-agent)。
* **连接本地服务器**：从您的计算机运行和调试代理。
* **选择现有代理**：显示代理列表，其下方有**连接代理服务器**。由于工作区中没有代理，引擎、Studio、跟踪和监控中的代理列表为空，显示**没有可用的代理**。代理服务器显示其自己的页面，该页面提供了在工作区没有代理服务器时创建第一个代理服务器的方法。

选择代理后，当您在这些部分之间移动时，LangSmith 会使其保持选中状态。要查看 **所有代理** 的代理列表，请将鼠标悬停在切换器中所选代理的名称上，然后选择其旁边显示的 **X**。

## 打开设置

设置以自己的布局打开：代理切换器消失了，导航分为组织和工作区部分，**返回LangSmith**链接返回到代理视图。

## 阅读代理概述

当您选择代理时，LangSmith 打开其概览。

对于编码代理以外的代理，标题显示代理的名称和资源导航。对于已部署的代理，选择 **代理服务器** 以检查其代理服务器和环境。当活动修订版可用时，标题会按环境显示修订版信息。对于在 Studio 中构建的代理，此链接被禁用，这些代理使用 Studio 运行时。参见[Compare the four routes](/langsmith/create-an-agent#compare-the-four-routes)。对于 [agent addressing](/langsmith/log-traces-to-agent)，请使用代理的标识符，而不是其显示名称或 **ID** 徽章复制的 UUID。如果标题显示 **Identifier**，请打开它以复制目标环境的标识符。参见[Identifiers and display names](/langsmith/agent-registry#identifiers-and-display-names)。

概述配置文件包括[Engine](/langsmith/engine)、代理活动、**模型**、**工具**、反馈活动和引擎问题。编码代理使用单独的使用情况和拉取请求结果视图。当标题中缺少资源链接时，请使用左侧导航。

## 另请参阅

* [Agent Registry](/langsmith/agent-registry)
* [Create an agent](/langsmith/create-an-agent)
* [Agent environments](/langsmith/agent-environments)
* [Deploy to an agent environment](/langsmith/deploy-to-agent-environment)
* [Tracing quickstart](/langsmith/observability-quickstart)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/navigate-agents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。