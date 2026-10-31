<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Agent Registry | https://docs.langchain.com/langsmith/agent-registry -->

# 代理注册

LangSmith 代理注册表是什么，代理是什么，环境如何划分代理的痕迹，以及标识符与显示名称有何不同。

随着组织构建更多代理，了解哪些代理存在以及它们在哪里运行就变得越来越困难。 LangSmith 代理注册表提供了一个用于注册代理的集中位置，提供了一个地方来管理您的组织运行的每个代理，无论其托管在何处。代理注册可在 [LangSmith Cloud](/langsmith/cloud) 上找到。创建代理会注册它，您可以通过四种方式创建代理：

* [Build it in the UI](/langsmith/build-an-agent)。
* [Create it](/langsmith/create-an-agent#name-an-agent-traced-from-outside-langsmith) 来自 **创建新代理** 对话框，适用于在 LangSmith 外部运行的代理。
* [Create it with an SDK call or API request](/langsmith/create-an-agent#create-an-agent-programmatically)。
* [Deploy it](/langsmith/deploy-to-agent-environment) 至 LangSmith。

一旦代理存在，您就可以从它运行的任何地方、从任何可以将跟踪发送到 LangSmith 的框架来[send traces](/langsmith/log-traces-to-agent)。

每个代理都会收到一个唯一的 [identifier](#identifiers-and-display-names)，LangSmith 使用它来处理其踪迹。

LangSmith 的其余部分依附于这些代理。数据集、评估器、部署、跟踪和警报均附加到代理注册表中的代理：

LangSmith

> [卡][Build](/build-overview)

> [卡][Test](/langsmith/evaluation)

> [卡][Deploy](/langsmith/deployment)

> [卡片] [Monitor](/langsmith/observability)

> [卡][Agent Registry](#agent)> [!注意]
>
> [LangSmith Cloud](/langsmith/cloud) 上提供基于代理的工作区。它们在 [self-hosted](/langsmith/self-hosted) LangSmith 上不可用。要检查您的工作区是否基于代理，请查看左上角的控件。在基于代理的工作区中，它是一个为您的工作区命名的工作区切换器。在[project-based](/langsmith/observability-concepts#tracing-projects)工作区中，它显示LangSmith徽标。

## 代理

*代理*是一种人工智能系统，它使用工具、技能和子代理来端到端地完成任务。在LangSmith中，代理也是工作空间组织的单位。命名一次，LangSmith 会记录该代理在该名称下执行的操作，分为四个[environments](/langsmith/agent-environments)：生产、暂存、开发和本地。跟踪、警报、评估器和预构建的仪表板均属于一个代理的一个环境。 [dataset](/langsmith/evaluation-concepts#datasets) 和自定义仪表板是例外。数据集附加到一个或多个代理，但不附加到任何环境，而自定义仪表板附加到代理而不是环境。每个跟踪都携带其代理和该代理的环境之一，因此生成跟踪的内容及其运行位置会在到达时记录下来。然后，LangSmith 可以根据该上下文采取行动：警报监视生产并保持本地运行的安静状态，每个环境都有自己的预构建仪表板，[Insights](/langsmith/insights) 报告涵盖您运行它的环境的流量。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Inter, system-ui, sans-serif","lineColor":"#40668D","primaryColor":"#E5F4FF","primaryTextColor":"#030710","primaryBorderColor":"#006DDD","clusterBkg":"transparent"}}}%%
flowchart LR
    WS("<div style='padding:2px 6px'><b>Workspace</b><br/>Holds every agent</div>")
    AG("<div style='padding:2px 6px'><b>Agent</b><br/>What you name</div>")
    EN("<div style='text-align:left;padding:2px 6px'><b>Environment</b><br/>&nbsp;•&nbsp; Production<br/>&nbsp;•&nbsp; Staging<br/>&nbsp;•&nbsp; Development<br/>&nbsp;•&nbsp; Local</div>")
    TR("<div style='padding:2px 6px'><b>Trace</b><br/>Belongs to one<br/>environment</div>")

    WS ==> AG ==> EN ==> TR

    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68,rx:10,ry:10
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710,rx:10,ry:10
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33,rx:10,ry:10

    class WS,EN neutral
    class AG process
    class TR output
```

### 环境

*环境*记录代理在生成跟踪时运行的位置。名称是固定的：Production、Staging、Development 和 Local。

欲了解更多信息，请参阅[Agent environments](/langsmith/agent-environments)。

### 标识符和显示名称

每个代理都有两个名字，他们做不同的工作：

* **标识符**：创建代理时设置，创建后不可编辑。无论您提供它还是LangSmith生成它取决于[how the agent was created](/langsmith/create-an-agent)。 LangSmith 使用它来寻址跟踪，因此即使显示名称发生变化，它也能保持稳定。
* **显示名称**：在代理出现在 UI 中的任何位置显示。对于代理 [built in the UI](/langsmith/build-an-agent)，从其构建配置中的 **名称** 字段重命名它。重命名不会移动现有痕迹或更改新痕迹的放置位置。该标识符也是浏览器地址栏所携带的，因此您可以从那里读取它或从代理概述上的 **ID** 字段复制它。

## 寻找并管理代理

代理注册后，可以从以下页面找到他们并跟踪他们的更改：

* **查找座席**：座席切换器在座席列表（**所有座席**）和单个座席之间移动。参见[Navigate agents](/langsmith/navigate-agents)。
* **审核更改**：[Audit logs](/langsmith/audit-logs) 记录代理何时创建、更新或删除，以及何时添加环境。

## 后续步骤

> [卡][Environments](/langsmith/agent-environments)
>
> 代理的轨迹分为四种环境，以及如何在它们之间切换。

> [卡][Navigate agents](/langsmith/navigate-agents)
>
> 座席切换器、座席列表和座席概览。

> [卡][Log traces to an agent](/langsmith/log-traces-to-agent)
>
> 代理寻址如何将跟踪发送到代理和环境，以及如何删除冲突的目标设置。

> [卡][Create an agent](/langsmith/create-an-agent)
>
> 在跟踪之前注册代理、选择标识符并配置其环境。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/agent-registry.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。