<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Agents | https://docs.langchain.com/langsmith/agents -->

# 代理

LangSmith 中的代理是什么，工作区如何组织其代理，环境如何划分代理的踪迹，以及标识符与显示名称有何不同。

*代理*是一种人工智能系统，它使用工具、技能和子代理来端到端地完成任务。在LangSmith中，代理也是工作空间组织的单位。命名一次，LangSmith 会记录该代理在该名称下执行的操作，分为四个[environments](/langsmith/agent-environments)：生产、暂存、开发和本地。跟踪、警报、评估器和预构建的仪表板均属于一个代理的一个环境。 [dataset](/langsmith/evaluation-concepts#datasets) 和自定义仪表板是例外。数据集附加到一个或多个代理，但不附加到任何环境，而自定义仪表板附加到代理而不是环境。

每个跟踪都携带其代理和该代理的环境之一，因此生成跟踪的内容及其运行位置会在到达时记录下来。然后，LangSmith 可以根据该上下文采取行动：警报监视生产并保持本地运行的安静状态，每个环境都有自己的预构建仪表板，[Insights](/langsmith/insights) 报告涵盖您运行它的环境的流量。<Note>
  **测试版。** 基于代理的工作区位于 [beta](/langsmith/release-stages) 中。 LangChain 为组织启用基于代理的工作区，并且更改适用于之后创建的工作区。现有的 [project-based](/langsmith/observability-concepts#tracing-projects) 工作区不会自动转换，但 LangChain 可以对其进行转换。要询问访问权限，[contact our sales team](https://www.langchain.com/contact-sales)。
</Note>

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

每个跟踪都映射到生成它的代理及其运行的环境。

## 环境

*环境*记录代理在生成跟踪时运行的位置。名称是固定的：Production、Staging、Development 和 Local。

有关更多信息，请参阅[Agent environments](/langsmith/agent-environments)。

## 标识符和显示名称

每个代理都有两个名字，他们做不同的工作：

* **标识符**：创建代理时设置，创建后不可编辑。是你提供它还是LangSmith生成它取决于[how the agent was created](/langsmith/create-an-agent)。 LangSmith 使用它来寻址跟踪，因此即使显示名称发生变化，它也能保持稳定。
* **显示名称**：在代理出现在 UI 中的任何位置显示。对于代理 [built in the UI](/langsmith/build-an-agent)，从其构建配置中的 **Name** 字段重命名它。重命名不会移动现有痕迹或更改新痕迹的放置位置。该标识符也是浏览器地址栏所携带的，因此您可以从那里读取它或从代理概述上的 **ID** 字段复制它。

## 后续步骤

<CardGroup>
  <Card title="Environments" href="/langsmith/agent-environments" icon="stack">
    代理的轨迹分为四种环境，以及如何在它们之间切换。
  </Card>

  <Card title="Navigate agents" href="/langsmith/navigate-agents" icon="compass">
    座席切换器、座席列表和座席概述。
  </Card>

  <Card title="Log traces to an agent" href="/langsmith/log-traces-to-agent" icon="target">
    代理寻址如何将跟踪发送到代理和环境，以及为什么它不能与项目寻址相结合。
  </Card>

  <Card title="Create an agent" href="/langsmith/create-an-agent" icon="plus">
    创建代理的四种方法、每个路由的决定以及标识符必须遵循的规则。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/agents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>