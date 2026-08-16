<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Core capabilities overview | https://docs.langchain.com/langsmith/core-capabilities -->

# 核心能力概述

这些功能构建在 [Agent Server](/langsmith/agent-server) 运行时之上，涵盖了运行流、暂停、公开端点以及对事件做出反应的方式：

<CardGroup cols={2}>

<Card title="Streaming API" icon="player-play" href="/langsmith/streaming">
  使用 LangGraph SDK 实时传输已部署代理的输出。
</Card>

<Card title="Human-in-the-loop" icon="user-check" href="/langsmith/add-human-in-the-loop">
  暂停代理执行以在继续之前查看、编辑或批准工具调用。
</Card>

<Card title="Time travel" icon="clock" href="/langsmith/human-in-the-loop-time-travel">
  重播代理从任何先前状态运行以调试或探索替代路径。
</Card>

<Card title="MCP endpoint" icon="plug" href="/langsmith/server-mcp">
  将您的代理公开为 MCP 工具，可供任何符合 MCP 的客户端访问。
</Card>

<Card title="A2A endpoint" icon="arrows-exchange" href="/langsmith/server-a2a">
  使用 A2A 协议启用代理间通信。
</Card>

<Card title="Distributed tracing" icon="git-merge" href="/langsmith/agent-server-distributed-tracing">
  从外部应用程序调用代理服务器时统一跨服务的跟踪。
</Card>

<Card title="Webhooks" icon="webhook" href="/langsmith/use-webhooks">
  触发外部系统以响应来自已部署代理的运行事件。
</Card>

<Card title="Double-texting" icon="messages" href="/langsmith/double-texting">
  控制代理服务器在运行正在进行时如何处理新消息。
</Card>

</CardGroup>



## 持久执行

从本质上讲，LangSmith部署是一个持久的执行引擎。您的代理在具有自动检查点的托管任务队列上运行，因此任何运行都可以重试、重播或从确切的中断点恢复，而不是从头开始。因为执行是持久的，所以代理可以做在无状态运行时中脆弱或不可能的事情：

- **等待外部输入。** 代理调用 [⟦T0⟧](/langsmith/add-human-in-the-loop)，运行时检查其状态，释放资源，并等待人员批准交易、审阅者编辑草稿或其他系统返回结果。当 [⟦T1⟧](/langsmith/add-human-in-the-loop) 数小时或数天后到达时，执行会准确地从停止处开始执行。这是[human-in-the-loop](/langsmith/add-human-in-the-loop)工作流程和[time-travel debugging](/langsmith/human-in-the-loop-time-travel)下的原语。
- **在后台运行。** [Background runs](/langsmith/background-run) 执行时不会阻塞调用者。当客户端继续运行时，运行时管理整个生命周期（排队、执行、检查点、完成）。
- **按计划运行。** [Cron jobs](/langsmith/cron-jobs) 按循环节奏触发代理执行。每日摘要代理、每周报告、定期数据同步。运行时按计划启动新的执行，并具有相同的持久性保证。
- **处理并发输入。** 当用户在代理处于运行中 ([double-texting](/langsmith/double-texting)) 时发送新输入时，运行时可以对其进行排队、取消正在进行的运行，或者并行处理这两个输入，而不会出现数据争用或损坏状态。- **失败时重试。** 可配置的 [retry policies](/oss/python/langgraph/use-graph-api#add-retry-policies) 控制退避、最大尝试以及哪些异常会在每个节点上触发重试。在进程重新启动、基础设施故障和执行过程中进行代码修订后，运行仍可正常运行。

有关容器、进程和任务队列如何协同工作的详细信息，请参阅[Agent Server: Runtime architecture](/langsmith/agent-server#runtime-architecture)。有关扩展和吞吐量调整，请参阅[Configure Agent Server for scale](/langsmith/agent-server-scale)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/core-capabilities.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>