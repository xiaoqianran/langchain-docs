<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Deployment components | https://docs.langchain.com/langsmith/components -->

# LangSmith 部署组件

Agent Server、LangGraph CLI、Studio、SDK、RemoteGraph、控制平面和数据平面组件概述。

[LangSmith Deployment](/langsmith/deployment) 安装包括几个关键组件。这些工具和服务共同提供了用于构建、部署和管理图形（包括代理应用程序）的完整解决方案，无论是在 [Cloud](/langsmith/cloud) 上还是在您自己的 [self-hosted](/langsmith/self-hosted) 基础设施中：

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

* [Agent Server](/langsmith/agent-server)：定义用于部署图和代理的固定 API 和运行时。处理执行、状态管理和持久性，以便您可以专注于构建逻辑而不是服务器基础设施。
* [LangGraph CLI](/langsmith/cli)：用于在本地构建、打包图形并与图形交互并准备部署的命令行界面。
* [Studio](/langsmith/studio)：专门用于可视化、交互和调试的IDE。连接到本地代理服务器以开发和测试您的图形。
* [Python/JS SDK](/langsmith/reference)：Python/JS SDK 提供了一种编程方式来与应用程序中部署的图形和代理进行交互。
* [RemoteGraph](/langsmith/use-remote-graph)：允许您与已部署的图进行交互，就像它在本地运行一样。
* [Control Plane](/langsmith/control-plane)：用于创建、更新和管理代理服务器部署的 UI 和 API。* [Data plane](/langsmith/data-plane)：执行图形的运行时层，包括代理服务器、其支持服务（PostgreSQL、Redis 等）以及协调控制平面状态的侦听器。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/components.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>