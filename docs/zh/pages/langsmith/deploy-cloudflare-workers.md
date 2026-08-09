<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy with Cloudflare Workers | https://docs.langchain.com/langsmith/deploy-cloudflare-workers -->

# 使用 Cloudflare Workers 进行部署

使用 Vite、React、Hono 和 Durable 对象在 Cloudflare Workers 上部署 LangChain 深度代理以进行 SSE 重放。

下页详细介绍了一个在 [Cloudflare Workers](https://developers.cloudflare.com/workers/) 上部署 LangChain **深度代理** 的示例应用程序：流式聊天 UI、子代理和线程历史记录，所有这些都由作为 Worker 路由（HTTP + SSE）实现的 [Agent Streaming Protocol](https://github.com/langchain-ai/agent-protocol/tree/main/streaming) 支持。 React SPA 由同一个 Worker 通过 [Workers Assets](https://developers.cloudflare.com/workers/static-assets/) 提供。没有单独的后端进程：一个 Worker 为 SPA 和协议 API 提供服务。

来源：部署手册中的[⟦T6⟧](https://github.com/langchain-ai/deployment-cookbook/tree/main/js-cloudflare)。

## 部署到 Cloudflare

<Steps>
  <Step title="Install and build">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    cd js-cloudflare
    cp .env.example .dev.vars   # set OPENAI_API_KEY for local dev
    pnpm install
    pnpm build
    ```
  </Step>

  <Step title="Configure secrets">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    npx wrangler login
    npx wrangler secret put OPENAI_API_KEY
    ```
  </Step>

  <Step title="Deploy">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pnpm run deploy
    ```
  </Step>
</Steps>

Wrangler 在一次部署中上传 Vite 构建 (SPA) 和 Worker 脚本。 `nodejs_compat`和`nodejs_compat_populate_process_env`已启用，因此LangChain可以从环境中读取`OPENAI_API_KEY`。

`wrangler.jsonc` 将 `ThreadSession` [Durable Object](https://developers.cloudflare.com/durable-objects/) 注册到 `new_sqlite_classes`，这是工人 **免费** 计划所必需的。

## 所需的 API 端点

该应用程序在 `/api/threads/...` 下公开代理流协议。路由在`worker/index.ts`和[Hono](https://hono.dev)中实现。

### 最低（流媒体聊天）|方法|路径|目的|
| -------------- | --------------------------------- | -------------------------------------------------------------------------- |
| `POST` | `/api/threads/:threadId/commands` |接受协议命令（`run.start`，...）并启动代理运行 |
| `POST` | `/api/threads/:threadId/stream` |运行的 SSE 协议事件流 |
| `GET` / `POST` | `/api/threads/:threadId/state` |读取并引导检查点线程状态 |

### 可选（侧边栏）

|方法|路径|目的|
| -------- | -------------------------------- | ---------------------------------------------------- |
| `GET` | `/api/threads` |列出检查点已知的线程 |
| `DELETE` | `/api/threads/:threadId` |删除线程的会话和检查点 |
| `POST` | `/api/threads/:threadId/history` |分页检查点历史记录 |

### 请求流程

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {"themeVariables": {"lineColor": "#40668D", "primaryColor": "#E5F4FF", "primaryTextColor": "#030710", "primaryBorderColor": "#006DDD"}}}%%
flowchart TB
  subgraph browser["Browser (Vite + React)"]
    SP["StreamProvider"]
    Adapter["HttpAgentServerAdapter"]
    SP --- Adapter
  end

  subgraph worker["Cloudflare Worker (Hono)"]
    CMD["POST /api/threads/:id/commands"]
    STR["POST /api/threads/:id/stream"]
    STA["GET|POST /api/threads/:id/state"]
    RUN["startAgentRun"]
  end

  subgraph do["Durable Object (per thread)"]
    LOG["StreamChannel event log"]
    SSE["SSE subscriptions"]
  end

  subgraph agent["worker/agent"]
    AGT["createDeepAgent + MemorySaver"]
  end

  Adapter -->|POST| CMD
  Adapter -->|POST| STR
  Adapter -->|GET / POST| STA
  CMD --> RUN
  RUN --> AGT
  RUN -->|publish events| LOG
  STR --> SSE
  LOG --> SSE
  STA --> AGT

  classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
  classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
  classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33
  class browser,worker process
  class do trigger
  class agent output
```1.引导线程状态（`GET`/`POST /state`）。
2. 提交时，SDK 发送`run.start` 到`/commands` 并接收`run_id`。
3. Worker 启动图形运行并将每个协议事件扇入线程的**持久对象**。
4. SDK订阅`/stream`（上交所）。 DO 重播缓冲的事件并保持实时帧的连接，即使在工作隔离重新启动时也是如此。
5. 子代理 (`task`) 运行，发出命名空间事件，表现为 `stream.subagents`。

## Cloudflare 后端设计

|关注|实施 |
| ------------- | ------------------------------------------------------- |
|前端 | Vite + React SPA (`src/`) |
| API层| `worker/index.ts` | 霍诺 (Hono) 路线
|运行时|工人V8 + `nodejs_compat` |
|上交所回放 |每线程 **持久对象** (`ThreadSession`) |
|代理运行|工人隔离；协议事件发布到 DO |
|静态资产 |工人资产 (`wrangler.jsonc` → `assets`) |
|秘密 | `wrangler secret` / `.dev.vars` |
|本地开发 | `vite`（Cloudflare Vite 插件运行 Worker 运行时）|**Worker**（代理 + 检查点）和 **Durable Object**（SSE 事件日志）之间的划分是 Cloudflare 上的主要设计选择。工作隔离是短暂的，因此重播缓冲区位于持久对象中而不是进程内存中。

## 生产坚持

该代理开箱即用，使用内存中的 `MemorySaver` 检查指针 (`worker/agent/index.ts`)。这适用于本地开发和演示，但在 Cloudflare（多个隔离、冷启动）上，跨部署或隔离的对话状态**不持久**。

用于生产：

1. 交换[durable checkpointer](/oss/python/langgraph/checkpointers#checkpointer-libraries)（例如通过 Hyperdrive 的 Postgres，或自定义 DO 支持的存储）。
2. 保留每个线程的持久对象以进行 SSE 重播（或将事件日志持久保存到 DO 存储/KV 以实现长期重新连接）。

有关更多信息，请参阅 [checkpointer libraries](/oss/python/langgraph/checkpointers#checkpointer-libraries) 和 [add memory / persistence](/oss/python/langgraph/add-memory)。

## 本地开发

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cp .env.example .dev.vars   # set OPENAI_API_KEY
pnpm install
pnpm dev
```

打开[http://localhost:5173](http://localhost:5173)。 Cloudflare Vite 插件在开发期间在 Workers 运行时中运行您的 Worker，因此 `/api/*` 路由的行为类似于生产。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pnpm build    # production build (client + worker)
pnpm preview  # preview the production build locally
pnpm typecheck
```

## 项目布局* `src/components/` — 聊天界面（`ChatApp`、`Chat`、`MessageThread`、`Subagents`、`ThreadHistory`、...）。
* `src/lib/chat/threads-client.ts` — 浏览器线程引导程序和侧边栏帮助程序。
* `worker/agent/` — 深度代理 (`createDeepAgent`)，带有 `researcher` 和 `math-whiz` 子代理和模拟工具。
* `worker/server/` — 协议助手：`runs.ts`（在 Worker 上启动运行）、`threads.ts`（检查指针支持的状态）、`serialize.ts`、`registry.ts`。
* `worker/durable-objects/thread-session.ts` — 每线程 SSE 事件日志 (`StreamChannel` + `matchesSubscription`)。
* `worker/index.ts` — Hono 应用程序：协议路由 + Worker 导出。
* `wrangler.jsonc` — Worker 配置：`nodejs_compat`、持久对象绑定、SPA 资产路由 (`run_worker_first: ["/api/*"]`)。

## 另请参阅

* [Frameworks and platforms overview](/langsmith/deploy-frameworks-and-platforms)
* [Agent Streaming Protocol](https://github.com/langchain-ai/agent-protocol/tree/main/streaming)
* [Cloudflare Workers](https://developers.cloudflare.com/workers/)
* [Durable Objects](https://developers.cloudflare.com/durable-objects/)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-cloudflare-workers.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>