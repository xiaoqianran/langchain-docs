<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Agent User Interaction Protocol (AG-UI) | https://docs.langchain.com/oss/python/deepagents/ag-ui -->

# 代理用户交互协议 (AG-UI)

通过代理用户交互协议 (AG-UI) 公开深度代理，以将事件流式传输到任何 AG-UI 客户端或前端。

[Agent User Interaction Protocol (AG-UI)](https://docs.ag-ui.com) 是一种开放、轻量级、基于事件的协议，它标准化了 AI 代理连接到面向用户的应用程序的方式。
通过 AG-UI 公开深度代理会将其运行转换为任何 AG-UI 客户端都可以使用的类型化事件流（消息、工具调用、推理、状态和生命周期），因此您可以驱动前端，而无需将其耦合到 LangGraph 内部。

<Note>
  AG-UI 专为代理与用户交互而设计：代理后端和面向用户的前端之间的连接。它与其他Deep Agents协议不同：

  * **AG-UI** 将深度代理连接到前端应用程序（本页）。
  * [Agent Client Protocol (ACP)](/oss/python/deepagents/acp) 将深度代理连接到代码编辑器和 IDE。
  * [Model Context Protocol (MCP)](/oss/python/langchain/mcp) 让深度代理调用由外部服务器托管的工具。
  * [Agent2Agent (A2A)](/oss/python/deepagents/a2a) 将深度代理连接到其他代理。
</Note>

## 快速入门

将深度代理作为 LangGraph 图提供服务，然后连接 TypeScript `@ag-ui/langgraph` 适配器，以便 AG-UI 客户端可以驱动它。

### 安装依赖项安装 Deep Agents 和 LangGraph CLI 来提供图形服务。后续步骤中使用的 AG-UI 适配器是 TypeScript (`@ag-ui/langgraph`)。有关 Python CopilotKit 或 AG-UI FastAPI 桥接器，请参阅 [CopilotKit](/oss/python/langchain/frontend/integrations/copilotkit)。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install deepagents "langgraph-cli[inmem]"
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add deepagents "langgraph-cli[inmem]"
  ```
</CodeGroup>

使用`createDeepAgent`（Python 中的`create_deep_agent`）创建的深度代理是一个LangGraph 图。通过将其作为 LangGraph 服务器将其公开给 AG-UI 客户端，然后将 AG-UI 适配器指向该服务器。

### 创建深度代理

定义代理并导出图表，以便 LangGraph 服务器可以加载它。

```python icon="robot" title="agent.py" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import create_deep_agent

agent = create_deep_agent(
    model="anthropic:claude-sonnet-4-6",
    system_prompt="You are an expert researcher.",
)
```

### 为代理服务

将图形注册到项目根目录下的 `langgraph.json` 文件中。

```json icon="file-code" title="langgraph.json" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "dependencies": ["."],
  "graphs": {
    "deep_agent": "./agent.py:agent"
  },
  "env": ".env"
}
```

启动LangGraph开发服务器。它通过 HTTP 在 `http://localhost:2024` 公开该图。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langgraph dev
```

### 连接 AG-UI 适配器

TypeScript `@ag-ui/langgraph` 适配器将运行图包装为任何客户端都可以驱动的 AG-UI 代理。将其指向 LangGraph 服务器并命名要加载的图表。无论图表是用 Python 还是 TypeScript 编写的，这都有效。

```ts icon="plug" title="ag-ui agent" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { LangGraphAgent } from "@ag-ui/langgraph";

const agent = new LangGraphAgent({
  graphId: "deep_agent",
  deploymentUrl: "http://localhost:2024",
});
```

<Card title="AG-UI LangGraph adapter on npm" icon="brand-npm" href="https://www.npmjs.com/package/@ag-ui/langgraph">
  `@ag-ui/langgraph`包实现了LangGraph图的AG-UI协议，包括深度代理。
</Card>

## 流媒体事件AG-UI 是一个事件流。当深度代理运行时，适配器将其 LangGraph 执行转换为类型化的 AG-UI 事件。客户端订阅这些事件并在事件到达时进行更新，而不是等待最终答案。

深度代理运行映射到许多 AG-UI 事件类型。主要包括：

|深度代理活动| AG-UI 活动 |
| - | - |
|运行生命周期 | `RUN_STARTED`、`RUN_FINISHED`、`RUN_ERROR` |
|图节点进度 | `STEP_STARTED`、`STEP_FINISHED` |
|助理文字 | `TEXT_MESSAGE_START`、`TEXT_MESSAGE_CONTENT`、`TEXT_MESSAGE_END` |
|工具调用| `TOOL_CALL_START`、`TOOL_CALL_ARGS`、`TOOL_CALL_END`、`TOOL_CALL_RESULT` |
|推理| `REASONING_START`、`REASONING_MESSAGE_CONTENT`、`REASONING_END` |
|共享状态（todos、子代理、自定义键）| `STATE_SNAPSHOT`、`STATE_DELTA` |
|对话历史 | `MESSAGES_SNAPSHOT` |

状态更新使用 `STATE_SNAPSHOT` 进行完整基线，使用 `STATE_DELTA`（JSON 补丁，RFC 6902）进行增量更改，因此客户端可以保持待办事项、计划和子代理状态同步，而无需在每个步骤中重新发送整个状态。

要直接观看流，请使用订阅者运行代理。每个事件都有一个匹配的 `on…Event` 回调：

```ts icon="activity" title="observe.ts" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { LangGraphAgent } from "@ag-ui/langgraph";

const agent = new LangGraphAgent({
  graphId: "deep_agent",
  deploymentUrl: "http://localhost:2024",
  initialMessages: [
    { id: "1", role: "user", content: "Research the AG-UI protocol." },
  ],
});

await agent.runAgent(
  {},
  {
    onTextMessageContentEvent({ event }) {
      process.stdout.write(event.delta);
    },
    onToolCallStartEvent({ event }) {
      console.log(`\n[tool] ${event.toolCallName}`);
    },
    onStateSnapshotEvent({ event }) {
      console.log("\n[state]", event.snapshot);
    },
    onRunFinishedEvent() {
      console.log("\n[done]");
    },
  },
);
```当深度代理暂停以等待人工输入时，运行会以中断结束。默认情况下，`@ag-ui/langgraph` 会与 `RUN_FINISHED` 一起发出旧版 `on_interrupt` 自定义事件。要在 `RUN_FINISHED` (`outcome.type === "interrupt"`) 上接收结构化 AG-UI 中断结果，请在构造代理时设置 `emitInterruptOutcome: true`：

```ts icon="hand-stop" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const agent = new LangGraphAgent({
  graphId: "deep_agent",
  deploymentUrl: "http://localhost:2024",
  emitInterruptOutcome: true,
});
```

通过在下一个输入上发送标准 AG-UI `resume` 字段来恢复运行：

```ts icon="hand-stop" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const input = {
  threadId: "t1",
  runId: "r2",
  messages: [],
  resume: [
    { interruptId: "int-abc", status: "resolved", payload: { approved: true } },
  ],
};
```

对于中断模型本身，请参见[Human-in-the-loop](/oss/python/deepagents/human-in-the-loop)。

<Info>
  有关完整的事件架构，请参阅[AG-UI events reference](https://docs.ag-ui.com/concepts/events)。
</Info>

## 连接前端

任何 AG-UI 客户端都可以驱动通过协议公开的深度代理，因此您不必自己构建消息渲染、流式传输或状态同步。将客户端指向适配器（或包装它的运行时）并通过其 `graphId` 选择代理。

<CardGroup>
  <Card title="CopilotKit" icon="brand-react" href="/oss/python/langchain/frontend/integrations/copilotkit">
    React 聊天运行时具有对 LangGraph 和 Deep Agents 的 AG-UI 支持，包括 Python FastAPI 桥。
  </Card>

  <Card title="AG-UI clients" icon="apps" href="https://docs.ag-ui.com/integrations">
    AG-UI 客户端和 SDK 的完整列表，包括终端和移动客户端。
  </Card>

  <Card title="Build a custom client" icon="code" href="https://docs.ag-ui.com/quickstart/clients">
    直接使用 AG-UI SDK 使用事件流来构建您自己的界面。
  </Card>
</CardGroup>

## 编程 API`LangGraphAgent` 连接到 LangGraph 服务器上的深度代理并将其公开为 AG-UI 代理。使用要加载的图形构建它，然后使用几种方法驱动它。

```ts icon="plug" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { LangGraphAgent } from "@ag-ui/langgraph";

const agent = new LangGraphAgent({
  graphId: "deep_agent",              // matches a key in langgraph.json
  deploymentUrl: "http://localhost:2024",
});
```

* **`runAgent(parameters?, subscriber?)`**：运行代理并将 AG-UI 事件流式传输到订阅者的 `on…Event` 回调（请参阅 [Stream events](#stream-events)）。运行完成时解决。
* **`subscribe(subscriber)`**：附加一个持久订阅者，该订阅者在每次运行中接收事件，而不是单次调用。
* **`abortRun()`**：取消正在进行的运行。

要为输入提供种子，请将 `initialMessages` 传递给构造函数，或者在运行之前调用 `addMessage` 或 `setMessages`。

## 另请参阅

* [CopilotKit](/oss/python/langchain/frontend/integrations/copilotkit)：通过 AG-UI 实现 Deep Agents 的 Python 和 TypeScript CopilotKit 运行时模式
* [Frontend overview](/oss/python/deepagents/frontend/overview)：使用 LangChain 前端 SDK 构建可传输深度代理进度的 UI
* [Human-in-the-loop](/oss/python/deepagents/human-in-the-loop)：深度代理的中断和恢复模型
* [Agent Client Protocol (ACP)](/oss/python/deepagents/acp)：将深度代理连接到代码编辑器和 IDE
* [AG-UI documentation](https://docs.ag-ui.com)：协议概念、事件和客户端 SDK

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/ag-ui.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>