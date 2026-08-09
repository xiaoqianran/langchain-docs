<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Studio | https://docs.langchain.com/langsmith/studio -->

# 朗史密斯工作室

<Info>
  **先决条件**

  * [LangSmith](/langsmith/observability)
  * [Agent Server](/langsmith/agent-server)
  * [LangGraph CLI](/langsmith/cli)
</Info>

Studio 是一款专用代理 IDE，可实现实现代理服务器 API 协议的代理系统的可视化、交互和调试。 Studio 还与 [tracing](/langsmith/observability-concepts)、[evaluation](/langsmith/evaluation) 和 [prompt engineering](/langsmith/prompt-context-hub#prompts) 集成。

## 特点

工作室的主要特点：

* 可视化您的图形架构
* [Run and interact with your agent](/langsmith/use-studio#run-application)
* [Manage assistants](/langsmith/use-studio#manage-assistants)
* [Manage threads](/langsmith/use-studio#manage-threads)
* [Iterate on prompts](/langsmith/observability-studio)
* [Run experiments over a dataset](/langsmith/observability-studio#run-experiments-over-a-dataset)
* 管理[long term memory](/oss/python/concepts/memory)
* 通过[time travel](/oss/python/langgraph/use-time-travel)调试代理状态
* 1 单击部署到 LangSmith Cloud。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
flowchart
    subgraph LangSmith Deployment
        A[LangGraph CLI] -->|creates| B(Agent Server deployment)
        B <--> D[Studio]
        B <--> E[SDKs]
        B <--> F[RemoteGraph]
    end

    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710

    class A,B,D,E,F process
```

Studio 适用于部署在 [LangSmith](/langsmith/deployment-quickstart) 上的图表或通过 [Agent Server](/langsmith/local-dev-testing) 在本地运行的图表。

Studio 支持两种模式：

### 图表模式

图形模式公开了完整的功能集，并且当您需要有关代理执行的尽可能多的详细信息时非常有用，包括遍历的节点、中间状态和 LangSmith 集成（例如添加到数据集和游乐场）。

### 聊天模式

聊天模式是一个更简单的 UI，用于迭代和测试特定于聊天的代理。它对于业务用户和想要测试整体代理行为的用户非常有用。仅状态包含或扩展[⟦T1⟧](/oss/python/langgraph/use-graph-api#messagesstate)的图支持聊天模式。

## 从 Studio 部署从 Studio 中的 [testing graphs locally](/langsmith/local-dev-testing) 直接从 Studio 中一键将它们部署到 Langsmith Cloud 上。您可以使用它来创建全新的部署以进行快速原型设计或重新部署现有部署。

## 了解更多

* 请参阅本指南，了解如何使用 Studio [get started](/langsmith/quick-start-studio)。

## 视频指南

<iframe title="YouTube video player" />

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/studio.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>