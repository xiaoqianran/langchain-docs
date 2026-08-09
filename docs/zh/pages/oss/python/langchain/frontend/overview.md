<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Overview | https://docs.langchain.com/oss/python/langchain/frontend/overview -->

# 概述

利用 LangChain 代理的实时流构建生成式 UI

为使用 `createAgent` 创建的代理构建丰富的交互式前端。这些
模式涵盖从基本消息渲染到高级工作流程的所有内容
例如人机交互批准、排队提交、持久流重新加入以及
时间旅行调试。

LangChain前端SDK是为**代理应用程序**而构建的，不仅是
令牌流聊天机器人。呈现消息的同一个钩子也暴露了
代理的持久线程状态、工具调用生命周期、中断、检查点
历史记录和自定义状态值，因此您的 UI 可以成为控制平面
长期运行代理工作。

<Note>
  这些模式使用 v1 前端 SDK 包。如果您使用的是早期版本，请参阅 [React](https://github.com/langchain-ai/langgraphjs/blob/main/libs/sdk-react/docs/v1-migration.md)、[Vue](https://github.com/langchain-ai/langgraphjs/blob/main/libs/sdk-vue/docs/v1-migration.md)、[Svelte](https://github.com/langchain-ai/langgraphjs/blob/main/libs/sdk-svelte/docs/v1-migration.md) 和 [Angular](https://github.com/langchain-ai/langgraphjs/blob/main/libs/sdk-angular/docs/v1-migration.md) 的迁移指南。
</Note>

## 架构

每个模式都遵循相同的架构：`createAgent`后端通过 SDK 流 API 将状态流传输到前端。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{
  init: {
    "fontFamily": "monospace",
    "flowchart": {
      "curve": "curve"
    }
  }
}%%
graph LR
  FRONTEND["useStream()"]
  BACKEND["createAgent()"]

  BACKEND --"stream"--> FRONTEND
  FRONTEND --"submit"--> BACKEND

  classDef blueHighlight fill:#E5F4FF,stroke:#006DDD,color:#030710;
  classDef greenHighlight fill:#F6FFDB,stroke:#6E8900,color:#2E3900;
  class FRONTEND blueHighlight;
  class BACKEND greenHighlight;
```在后端，`createAgent` 生成一个已编译的 LangGraph 图，该图公开了流 API。在前端，流句柄连接到该 API 并提供反应状态（消息、工具调用、中断、值和线程元数据），您可以使用任何框架呈现这些状态。

## 为什么要使用LangChain前端SDK？

大多数 AI UI 库可帮助您将流式文本附加到聊天记录中。
LangChain 的 SDK 公开了比生产代理更丰富的运行时语义
需要：

|能力|它在您的 UI 中启用什么 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **耐用的螺纹** |重新加载页面、切换设备或重新加入跑步，而不会丢失对话状态。                                            |
| **键入代理状态** |渲染任何状态键，而不仅仅是消息：待办事项、管道输出、引文、沙箱文件、指标或自定义业务对象。 || **工具调用生命周期** |将待处理、已完成和失败的工具调用显示为专用 UI​​ 卡而不是原始 JSON。                                    |
| **中断** |由于人工批准、编辑或丢失信息而暂停执行，然后从代理停止的确切位置恢复。     |
| **检查点** |从持久状态快照构建编辑、重试、分支、审核和时间旅行流程。                                          |
| **嵌套执行** |可视化深层代理、子代理和图形节点，而无需将所有内容扁平化为一个不可读的流。                      |
| **框架原生反应性** |使用 React、Vue、Svelte 或 Angular 中的相同协议，同时保留惯用的钩子、可组合项、存储或信号。        |

这些原语可让您设计用户可以在其中检查、驾驶、暂停、
恢复和分叉代理在其发生时工作。

<CodeGroup>
  ```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain import create_agent
  from langgraph.checkpoint.memory import MemorySaver

  agent = create_agent(
      model="openai:gpt-5.5",
      tools=[get_weather, search_web],
      checkpointer=MemorySaver(),
  )
  ```

  ```ts types.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  export interface GraphState {
    messages: BaseMessage[];
  }
  ```

  ```tsx Chat.tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { useStream } from "@langchain/react";
  import type { GraphState } from "./types";

  function Chat() {
    const stream = useStream<GraphState>({
      apiUrl: "http://localhost:2024",
      assistantId: "agent",
    });

    return (
      <div>
        {stream.messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
      </div>
    );
  }
  ```
</CodeGroup>

React、Vue 和 Svelte 使用 `useStream`。 Angular 使用 `injectStream`：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { useStream } from "@langchain/react";      // React
import { useStream } from "@langchain/vue";        // Vue
import { useStream } from "@langchain/svelte";     // Svelte
import { injectStream } from "@langchain/angular"; // Angular
```

## 类型推断将类型参数传递给 [⟦T12⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream)（或 Angular 中的 [⟦T13⟧](https://reference.langchain.com/javascript/langchain-angular/injectStream)），以便对 `stream.messages`、`stream.toolCalls`、`stream.interrupt`、`stream.values` 和其他反应状态进行类型安全访问。

定义一个与代理的状态模式匹配的 TypeScript 接口并将其作为类型参数传递：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import type { BaseMessage } from "langchain";

interface AgentState {
  messages: BaseMessage[];
}

const stream = useStream<AgentState>({
  apiUrl: "http://localhost:2024",
  assistantId: "agent",
});
```

使用`langgraph.json`中的图形名称作为`assistantId`。在本指南的模式示例中，将 `typeof myAgent` 替换为您的接口名称（例如，`AgentState`）。

如果您的代理公开自定义状态键，请扩展接口：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import type { BaseMessage, Todo } from "langchain";

interface AgentState {
  messages: BaseMessage[];
  todos: Todo[];
}
```

## 模式

### 渲染消息和输出

<CardGroup>
  <Card title="Markdown messages" icon="markdown" href="/oss/python/langchain/frontend/markdown-messages">
    使用正确的格式和代码突出显示来解析和渲染流式 Markdown。
  </Card>

  <Card title="Structured output" icon="layout-grid" href="/oss/python/langchain/frontend/structured-output">
    将键入的代理响应呈现为自定义 UI 组件而不是纯文本。
  </Card>

  <Card title="Reasoning tokens" icon="brain" href="/oss/python/langchain/frontend/reasoning-tokens">
    在可折叠块中显示模型思维过程。
  </Card>

  <Card title="Generative UI" icon="wand" href="/oss/python/langchain/frontend/generative-ui-overview">
    呈现代理生成的界面，范围涵盖从受控到声明到开放式。
  </Card>
</CardGroup>

### 显示代理操作

<CardGroup>
  <Card title="Tool calling" icon="tool" href="/oss/python/langchain/frontend/tool-calling">
    将工具调用显示为包含加载和错误状态的丰富、类型安全的 UI 卡。
  </Card>

  <Card title="Headless tools" icon="device-desktop" href="/oss/python/langchain/frontend/headless-tools">
    在客户端上运行浏览器和设备 API，同时在代理上保留类型化工具架构。
  </Card><Card title="Human-in-the-loop" icon="user-check" href="/oss/python/langchain/frontend/human-in-the-loop">
    暂停代理以通过批准、拒绝和编辑工作流程进行人工审核。
  </Card>
</CardGroup>

### 管理对话

<CardGroup>
  <Card title="Branching chat" icon="git-branch" href="/oss/python/langchain/frontend/branching-chat">
    编辑消息、重新生成响应以及导航对话分支。
  </Card>

  <Card title="Message queues" icon="list-check" href="/oss/python/langchain/frontend/message-queues">
    将多个消息排队，同时代理按顺序处理它们。
  </Card>
</CardGroup>

### 高级流媒体

<CardGroup>
  <Card title="Join & rejoin streams" icon="plug-connected" href="/oss/python/langchain/frontend/join-rejoin">
    断开并重新连接正在运行的代理流，而不会丢失进度。
  </Card>

  <Card title="Time travel" icon="clock" href="/oss/python/langchain/frontend/time-travel">
    从对话历史记录中的任何检查点检查、导航和恢复。
  </Card>
</CardGroup>

## 选择前端模式

从您的应用程序需要回答的用户体验问题开始：|如果用户需要... |以 | 开头
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|了解代理在做什么 | [Tool calling](/oss/python/langchain/frontend/tool-calling) 和 [reasoning tokens](/oss/python/langchain/frontend/reasoning-tokens) |
|安全批准敏感操作 | [Human-in-the-loop](/oss/python/langchain/frontend/human-in-the-loop) |
|在运行期间发送作业 | [Message queues](/oss/python/langchain/frontend/message-queues) ||离开并返回长时间运行的工作 | [Join & rejoin streams](/oss/python/langchain/frontend/join-rejoin) |
|编辑或从较早的回合重试 | [Branching chat](/oss/python/langchain/frontend/branching-chat) 和 [time travel](/oss/python/langchain/frontend/time-travel) |
|将状态呈现为应用程序，而不是聊天 | [Structured output](/oss/python/langchain/frontend/structured-output)、[generative UI](/oss/python/langchain/frontend/generative-ui-overview) 和 [Deep Agents frontend patterns](/oss/python/deepagents/frontend/overview) |

## 集成

流 API 与 UI 无关。将其与任何组件库或生成式 UI 一起使用
框架。组件库可以拥有表现层，而LangChain的
SDK 拥有代理运行时状态、可恢复性、中断和检查点
下面的语义。

<CardGroup>
  <Card title="AI Elements" icon="package" href="/oss/python/langchain/frontend/integrations/ai-elements">
    用于 AI 聊天的可组合 shadcn/ui 组件：`Conversation`、`Message`、`Tool`、`Reasoning`。
  </Card>

  <Card title="assistant-ui" icon="package" href="/oss/python/langchain/frontend/integrations/assistant-ui">
    Headless React 框架，具有内置线程管理、分支和附件支持。
  </Card>

  <Card title="OpenUI" icon="package" href="/oss/python/langchain/frontend/integrations/openui">
    使用 openui-lang 组件 DSL 生成数据丰富的报告和仪表板的 UI 库。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>