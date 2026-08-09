<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Overview | https://docs.langchain.com/oss/javascript/deepagents/frontend/overview -->

# 概述

构建显示实时子代理流、任务进度和Deep Agents沙箱的 UI

构建实时可视化深层代理工作流程的前端。这些图案
展示如何呈现子代理进度、任务规划、流内容以及
使用 `createDeepAgent` 创建的代理提供类似 IDE 的沙箱体验。

当 UI 使委托可见时，深度代理最为有用。而不是
显示单个不透明的助手气泡，LangChain SDK 公开了
协调器、子代理发现、自定义状态和沙箱支持的工件，以便
用户可以检查长时间运行的任务是如何分解和完成的。

<Note>
  这些模式使用 v1 前端 SDK 包。如果您使用的是早期版本，请参阅 [React](https://github.com/langchain-ai/langgraphjs/blob/main/libs/sdk-react/docs/v1-migration.md)、[Vue](https://github.com/langchain-ai/langgraphjs/blob/main/libs/sdk-vue/docs/v1-migration.md)、[Svelte](https://github.com/langchain-ai/langgraphjs/blob/main/libs/sdk-svelte/docs/v1-migration.md) 和 [Angular](https://github.com/langchain-ai/langgraphjs/blob/main/libs/sdk-angular/docs/v1-migration.md) 的迁移指南。
</Note>

## 架构

Deep Agents 使用协调者-工作者架构。主代理计划任务并将其委托给专门的子代理，每个子代理独立运行。在前端，v1 流句柄在根流上显示协调器消息，并公开作用域子代理视图的子代理发现快照。

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
  SELECTORS["selector helpers"]
  BACKEND["createDeepAgent()"]
  SUB1["Subagent A"]
  SUB2["Subagent B"]

  BACKEND --"stream"--> FRONTEND
  FRONTEND --"scope by subagent"--> SELECTORS
  SELECTORS --> SUB1
  SELECTORS --> SUB2
  FRONTEND --"submit"--> BACKEND
  BACKEND --"delegate"--> SUB1
  BACKEND --"delegate"--> SUB2
  SUB1 --"result"--> BACKEND
  SUB2 --"result"--> BACKEND

  classDef blueHighlight fill:#E5F4FF,stroke:#006DDD,color:#030710;
  classDef greenHighlight fill:#F6FFDB,stroke:#6E8900,color:#2E3900;
  classDef purpleHighlight fill:#EBD0F0,stroke:#885270,color:#441E33;
  class FRONTEND,SELECTORS blueHighlight;
  class BACKEND greenHighlight;
  class SUB1,SUB2 purpleHighlight;
```

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent } from "deepagents";

const agent = createDeepAgent({
  tools: [getWeather],
  systemPrompt: "You are a helpful assistant",
  subagents: [
    {
      name: "researcher",
      description: "Research assistant",
      systemPrompt: "You are a research assistant.",
    },
  ],
});
```在前端，以与`createAgent`相同的方式连接[⟦T4⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream)。传递 [type parameter](/oss/javascript/langchain/frontend/overview) 以获得类型安全的流状态。深度代理模式使用 `stream.subagents`、选择器帮助器（例如 `useMessages(stream, subagent)`）以及自定义状态值（例如 `stream.values.todos`）来呈现特定于子代理的 UI。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { useStream } from "@langchain/react";

function App() {
  const stream = useStream<typeof agent>({
    apiUrl: "http://localhost:2024",
    assistantId: "agent",
  });

  // Deep agent state beyond messages
  const todos = stream.values?.todos;
  const subagents = [...stream.subagents.values()];
}
```

## SDK 公开了什么

深度代理 UI 通常需要的不仅仅是最终答案。前端SDK给出
您对跑步用户关心的部分进行了结构化预测：

|投影|用它来 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `stream.messages` |协调员对话和最终综合。                                                          |
| `stream.subagents` |实时发现专业工作人员，包括状态和任务元数据。                                  |
| `stream.values` |共享状态，例如待办事项、计划、报告部分、沙箱元数据或代理编写的任何自定义密钥。 |
|工具调用状态 |将文件系统、搜索、浏览器或域工具呈现为带有进度和结果的卡片。                 ||中断 |暂停委派的工作以供用户批准或丢失输入，而不会丢失运行状态。                    |

这使您可以构建感觉更接近 IDE、任务板或
工作流程监视器而不是简单的聊天记录。

## 模式

<CardGroup>
  <Card title="Subagent streaming" icon="arrows-split" href="/oss/javascript/deepagents/frontend/subagent-streaming">
    显示带有流媒体内容、进度跟踪和可折叠卡片的专业子代理。
  </Card>

  <Card title="Todo list" icon="list-check" href="/oss/javascript/deepagents/frontend/todo-list">
    当客服人员选择任务计划时，通过实时待办事项列表跟踪进度。
  </Card>

  <Card title="Sandbox" icon="code" href="/oss/javascript/deepagents/frontend/sandbox">
    使用文件浏览器、代码查看器和沙箱支持的差异面板构建类似 IDE 的 UI。
  </Card>
</CardGroup>

## 相关模式

[LangChain frontend patterns](/oss/javascript/langchain/frontend/overview)，包括
markdown 消息、工具调用和人机交互，都与深度协同工作
代理也。 Deep Agents 构建在相同的 LangGraph 运行时上，因此
`useStream`提供相同的核心API。

对于较低级别的图形可视化，请参阅
[LangGraph frontend patterns](/oss/javascript/langgraph/frontend/overview)。他们展示了如何
将图形节点和状态键直接映射到 UI 组件。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/frontend/overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>