<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy with Nuxt | https://docs.langchain.com/langsmith/deploy-nuxt -->

# 使用 Nuxt 进行部署

在具有 Nitro 服务器路由、Vue 可组合项和子代理感知聊天 UI 的 Nuxt 4 应用程序中部署 LangChain 深度代理。

以下页面详细介绍了一个在 [Nuxt 4](https://nuxt.com) 项目内部署 LangChain **深度代理** 的示例应用程序：流式聊天 UI、子代理详细信息视图、线程历史记录和推理令牌流，所有这些都由实现为 Nitro 路由处理程序（HTTP + SSE）的 [Agent Streaming Protocol](https://github.com/langchain-ai/agent-protocol/tree/main/streaming) 支持。没有单独的后端进程。

来源：部署说明书中的[⟦T5⟧](https://github.com/langchain-ai/deployment-cookbook/tree/main/js-nuxt)。

## 部署

<Tabs>
  <Tab title="Vercel">
    <Steps>
      <Step title="Import the repository">
        单击下面的 **使用 Vercel 部署**，或手动导入 [⟦T6⟧](https://github.com/langchain-ai/deployment-cookbook)。

        <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flangchain-ai%2Fdeployment-cookbook&root-directory=js-nuxt&env=OPENAI_API_KEY&envDescription=OpenAI%20API%20key%20for%20the%20agent%20and%20its%20subagents">
          <img alt="Deploy with Vercel" />
        </a>
      </Step>

      <Step title="Configure the project">
        将**根目录**设置为`js-nuxt`，并在项目设置中添加`OPENAI_API_KEY`。
      </Step>

      <Step title="Deploy">
        部署项目。 Nuxt 自动检测 Vercel 并为代理流协议 API 构建 Nitro 服务器路由。
      </Step>
    </Steps>
  </Tab>

  <Tab title="Netlify">
    <Steps>
      <Step title="Import the repository">
        单击下面的 **部署到 Netlify**，或手动导入 [⟦T9⟧](https://github.com/langchain-ai/deployment-cookbook)。

        <a href="https://app.netlify.com/start/deploy?repository=https://github.com/langchain-ai/deployment-cookbook&base=js-nuxt">
          <img alt="Deploy to Netlify" />
        </a>
      </Step><Step title="Configure the project">
        将**基目录**设置为`js-nuxt`。 Netlify 从该子目录运行 Nuxt 构建。
      </Step>

      <Step title="Set environment variables">
        在第一次构建完成之前，在 Netlify 部署设置中添加 `OPENAI_API_KEY`。
      </Step>
    </Steps>
  </Tab>

  <Tab title="Node">
    <Steps>
      <Step title="Build for production">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        cd js-nuxt
        cp .env.example .env   # set OPENAI_API_KEY for local dev
        pnpm install
        pnpm build
        ```
      </Step>

      <Step title="Set environment variables">
        在主机上导出`OPENAI_API_KEY`。 Nitro 在运行时从环境中读取它。

        （可选）通过添加 [⟦T13⟧](https://github.com/langchain-ai/deployment-cookbook/blob/main/js-nuxt/.env.example) 中的变量来启用 LangSmith 跟踪。
      </Step>

      <Step title="Start the Nitro server">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        node .output/server/index.mjs
        ```

        在任何流程管理器或容器编排器后面运行，以保持 Node.js 流程处于活动状态。
      </Step>
    </Steps>
  </Tab>
</Tabs>

<Tip>
  `@langchain/vue` 从流中发现子代理并为每个子代理呈现一个可点击的芯片。选择一个会打开一个范围聊天视图，该视图通过 `useMessages` 绑定到该子代理的命名空间 `messages` 和 `tools` 通道。推理摘要流入可折叠的“思考”块，该块在流式传输时自动展开。
</Tip>

## 所需的 API 端点

该应用程序在`/api/threads/...`下公开代理流协议。 Nitro 路线处理程序住在`server/api/threads/`。

### 最低（流媒体聊天）这三个端点足以与 `@langchain/vue` 的 `HttpAgentServerAdapter` 运行单线程流式聊天：

|方法|路径|目的|
| -------------- | --------------------------------- | -------------------------------------------------------------------------- |
| `POST` | `/api/threads/:threadId/commands` |接受协议命令（`run.start`，...）并启动代理运行 |
| `POST` | `/api/threads/:threadId/stream` |运行的 SSE 协议事件流 |
| `GET` / `POST` | `/api/threads/:threadId/state` |读取并引导检查点线程状态 |

客户端使用 `GET /state`（以及 404 上的 `POST /state`）引导线程，因此在发送第一条消息之前不会发生 404 水合。

### 可选（线程侧边栏）

此示例还实现了线程历史记录侧边栏的端点。如果您的 UI 不需要多线程管理，请忽略它们：|方法|路径|目的|
| -------- | -------------------------------- | -------------------------------------------------------- |
| `GET` | `/api/threads` |列出检查点已知的线程 |
| `DELETE` | `/api/threads/:threadId` |删除线程的会话和检查点 |
| `POST` | `/api/threads/:threadId/history` |分页检查点历史记录（代理协议）|

### 请求流程

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {"themeVariables": {"lineColor": "#40668D", "primaryColor": "#E5F4FF", "primaryTextColor": "#030710", "primaryBorderColor": "#006DDD"}}}%%
flowchart TB
  subgraph browser["Browser (Vue)"]
    SP["StreamProvider"]
    Adapter["HttpAgentServerAdapter"]
    SP --- Adapter
  end

  subgraph nitro["Nitro route handlers"]
    CMD["POST /api/threads/:id/commands"]
    STR["POST /api/threads/:id/stream (SSE)"]
    STA["GET|POST /api/threads/:id/state"]
  end

  subgraph server["server/utils"]
    SRV["session · threads · runtime"]
  end

  subgraph agent["server/agent"]
    AGT["createDeepAgent + checkpointer"]
  end

  Adapter -->|POST| CMD
  Adapter -->|POST| STR
  Adapter -->|GET / POST| STA
  CMD --> SRV
  STR --> SRV
  STA --> SRV
  SRV --> AGT

  classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
  classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
  classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33
  class browser,nitro process
  class server trigger
  class agent output
```

1.引导线程状态（`GET`/`POST /state`）。
2. 提交时，SDK 发送`run.start` 到`/commands` 并接收`run_id`。
3. SDK订阅`/stream`（SSE）进行回放+直播协议事件。
4. 子代理 (`task`) 运行时发出命名空间事件，表现为 `stream.subagents`。

## Nitro 后端设计|关注|实施 |
| -------------- | ------------------------------------------------------------------ |
|前端 | `app/` 中的 Vue 组件（针对 SSE 封装在 `<ClientOnly>` 中）|
| API层| `server/api/threads/` 中的 Nitro 路线处理程序 |
|运行时 | Node.js（Nitro 预设取决于部署目标）|
|上交所回放 |进程本地 `LocalThreadSession` (`server/utils/session.ts`) |
|代理运行|相同的硝基工艺； LangGraph `StreamChannel` | 中缓冲的事件
|线程存储|内存中 `MemorySaver` 检查指针 (`server/agent/index.ts`) |
|秘密 | `.env`本地；生产中的主机环境变量|

代理的检查指针是线程的唯一事实来源。没有客户端缓存：侧边栏始终从服务器获取，重新启动服务器会清除每个线程。

## 生产坚持

该代理开箱即用，使用内存中 `MemorySaver` 检查指针 (`server/agent/index.ts`) 和进程本地会话映射 (`server/utils/runtime.ts`)。这适用于本地开发和单实例服务器，但在无服务器或多实例主机上，对话状态在冷启动或副本中**不持久**。对于生产，换入[durable checkpointer](/oss/python/langgraph/checkpointers#checkpointer-libraries)：

|套餐 |后端 |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| [⟦T58⟧](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-redis) | Redis (`RedisSaver`) |
| [⟦T60⟧](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-postgres) | Postgres (`PostgresSaver`) |
| [⟦T62⟧](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-sqlite) | SQLite (`SqliteSaver`) |

替换`server/agent/index.ts`中的`MemorySaver`，并将新的检查指针传递给`createDeepAgent`。 Nitro 路线处理程序和 `server/utils/threads.ts` 助手保持不变。

您还需要在 `server/utils/runtime.ts` 中有一个共享会话/重播存储，以便 SSE 重新连接可以跨无服务器调用工作。

有关更多信息，请参阅 [checkpointer libraries](/oss/python/langgraph/checkpointers#checkpointer-libraries) 和 [add memory / persistence](/oss/python/langgraph/add-memory)。

## 本地开发

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cp .env.example .env   # set OPENAI_API_KEY
pnpm install
pnpm dev
```

打开[http://localhost:3000](http://localhost:3000)。发送委托给子代理的提示，并在专用卡中观察他们的工作流。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pnpm build      # production build
pnpm preview    # preview the production build
pnpm typecheck  # vue-tsc over the project
```

## 项目布局<AccordionGroup>
  <Accordion title="Project structure">
    * `server/agent/` — 深度代理 (`createDeepAgent`)，带有 `researcher` 和 `math-whiz` 子代理、模拟工具和 `stripReasoningReplay` 中间件。
    * `server/utils/` — 协议服务器逻辑：`session.ts`（SSE 运行）、`threads.ts`（检查指针支持的状态）、`serialize.ts`、`runtime.ts`。
    * `server/api/threads/` — 上述协议端点的 Nitro 路由处理程序。
    * `app/components/` — 使用 `@langchain/vue` 的 Vue 聊天 UI（`ChatApp`、`Chat`、`ThreadHistory`、`SubagentList`、`MessageReasoning`、...）。
    * `app/utils/threads.ts` — 服务器驱动的线程助手和 LangGraph SDK 引导程序。
  </Accordion>

  <Accordion title="Backend details">
    * `server/agent/index.ts` — 协调器通过 Responses API 使用推理模型；使用工具的子代理使用聊天完成（以避免通过检查点重放推理项）。
    * `server/agent/middleware.ts` — 重建来自 `content` + `tool_calls` 的先前辅助消息，因此过时的推理 ID 永远不会重播到响应 API。
    * `server/utils/session.ts` — `LocalThreadSession` 缓冲协议事件并通过 `matchesSubscription` 通过 SSE 匹配帧。
    * `server/api/threads/index.get.ts` — `GET /api/threads`，检查指针支持的线程列表。
    * `server/api/threads/[threadId]/…` — `commands`、`stream`、`state` (GET/POST)、`history` 和 `DELETE` 的处理程序。
  </Accordion><Accordion title="Frontend details">
    * `app/components/ChatThread.vue` — 构建 `HttpAgentServerAdapter` 并调用 `provideStream({ transport, threadId })`。
    * `app/components/Chat.vue` — 带有作曲家和每个子代理详细信息视图（带有面包屑）的消息视图。
    * `app/components/SubagentList.vue` / `SubagentDetail.vue` — 内联子代理卡和作用域子代理聊天（`useMessages` 绑定到命名空间）。
    * `app/components/MessageReasoning.vue` — 用于推理总结的可折叠“思考”块。
  </Accordion>
</AccordionGroup>

## 另请参阅

* [Frameworks and platforms overview](/langsmith/deploy-frameworks-and-platforms)
* [Agent Streaming Protocol](https://github.com/langchain-ai/agent-protocol/tree/main/streaming)
* [⟦T111⟧](https://github.com/langchain-ai/streaming-cookbook) — 自定义协议服务器的原始 Vite + Hono 参考
* [⟦T112⟧](https://www.npmjs.com/package/@langchain/vue) — `useStream`、`provideStream` 和选择器可组合项
* [Frontend overview](/oss/python/langchain/frontend/overview)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-nuxt.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>