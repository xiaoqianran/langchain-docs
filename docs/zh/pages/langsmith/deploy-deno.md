<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy with Deno Deploy | https://docs.langchain.com/langsmith/deploy-deno -->

# 使用 Deno Deploy 进行部署

在 Deno Deploy 上部署 LangChain 深度代理，并使用 Hono 路由处理程序和从一个入口点提供服务的 Vite React SPA。

下页详细介绍了一个在[Deno Deploy](https://deno.com/deploy)上部署 LangChain **深度代理**的示例应用程序：流式聊天 UI、子代理和线程历史记录，所有这些都由在 Hono 服务器上实现为 HTTP + SSE 路由处理程序的[Agent Streaming Protocol](https://github.com/langchain-ai/agent-protocol/tree/main/streaming) 支持。 React 前端是一个 Vite SPA（从 Next.js 示例移植）； Deno 从单个 `main.ts` 入口点提供构建的静态资产和 API。

它是 Next.js 示例到 Deno + Hono 的移植，展示了如何在 Deno Deploy 而不是 Vercel 上运行相同的代理堆栈。

来源：部署手册中的[⟦T5⟧](https://github.com/langchain-ai/deployment-cookbook/tree/main/js-deno)。

## 部署到 Deno 部署

<Steps>
  <Step title="Create a Deno Deploy project">
    分叉或克隆[⟦T6⟧](https://github.com/langchain-ai/deployment-cookbook)。在[Deno Deploy dashboard](https://dash.deno.com/)中，创建一个链接到此存储库的新项目。
  </Step>

  <Step title="Configure build settings">
    * 将 **根目录** 设置为 `js-deno`。
    * 将**构建命令**设置为`deno task build:client`（将Vite SPA构建为`dist/`）。
    * 将**入口点**设置为`main.ts`。
    * 在项目环境变量中添加`OPENAI_API_KEY`。
  </Step><Step title="Deploy">
    从仪表板部署。 Deno 的构建环境运行构建命令，因此 `dist/` 是在云端生成的，永远不需要提交。
  </Step>
</Steps>

或者，使用内置的 `deno deploy` CLI (Deno 2.x)。 [⟦T15⟧](https://github.com/langchain-ai/deployment-cookbook/blob/main/js-deno/deno.json)中的`deploy`块设置`org`/`app`。将它们更改为您自己的（或传递 `--org`/`--app` 标志，这会覆盖它们）。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd js-deno

# First time only: create the app
deno deploy create --org <your-org> --app <your-app> --source local --region us --entrypoint main.ts

# Set your OpenAI key
deno deploy env add OPENAI_API_KEY <your-key> --org <your-org> --app <your-app>

# Build the client, deploy to production, and clean up dist/
deno task deploy
```

`deno task deploy` 运行 `deno task build:client && deno deploy --prod`，然后运行 `rm -rf dist`。需要本地构建，因为`deno deploy --source local`上传您的工作树（减去`.gitignore`）并且**不**运行构建命令。这些仅针对 GitHub 连接的应用程序运行。

<Warning>
  CLI `--source local` 流程特有的两个陷阱：

  * **`dist/` 不得被 gitignored。** 上传者尊重 `.gitignore`，因此新构建的 `dist/` 必须在上传窗口期间可见，否则每个非 `/api` 路由都会返回 **404**。存储库根`.gitignore`忽略所有`dist`，因此`js-deno/.gitignore`将其重新包含在`!dist/`和`!dist/**`中。 `deno task deploy`流程在上传后删除`dist/`，因此尽管没有被忽略，但它不会停留在`git status`中。
  * **不要使用 `deploy.include` 列表。** 有一个 Deno Deploy 错误，其中添加 `include` 会使构建将入口点解析为 `src/main.ts` 并失败。改为依赖默认的基于 `.gitignore` 的上传。
</Warning>（可选）通过添加 [⟦T42⟧](https://github.com/langchain-ai/deployment-cookbook/blob/main/js-deno/.env.example) 中的变量来启用 LangSmith 跟踪。

## 所需的 API 端点

该应用程序在`/api/threads/...`下公开代理流协议。路由处理程序位于 `server/routes.ts` 中，并镜像 `js-next/app/api/threads/` 中的 Next.js 处理程序。

### 最低（流媒体聊天）

|方法|路径|目的|
| -------------- | --------------------------------- | -------------------------------------------------------------------------- |
| `POST` | `/api/threads/:threadId/commands` |接受协议命令（`run.start`，...）并启动代理运行 |
| `POST` | `/api/threads/:threadId/stream` |运行的 SSE 协议事件流 |
| `GET` / `POST` | `/api/threads/:threadId/state` |读取并引导检查点线程状态 |

### 可选（侧边栏）|方法|路径|目的|
| -------- | -------------------------------- | -------------------------------------------------------- |
| `GET` | `/api/threads` |列出检查点已知的线程 |
| `DELETE` | `/api/threads/:threadId` |删除线程的会话和检查点 |
| `POST` | `/api/threads/:threadId/history` |分页检查点历史记录（代理协议）|

### 请求流程

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {"themeVariables": {"lineColor": "#40668D", "primaryColor": "#E5F4FF", "primaryTextColor": "#030710", "primaryBorderColor": "#006DDD"}}}%%
flowchart TB
  subgraph browser["Browser (Vite React SPA)"]
    SP["StreamProvider"]
    Adapter["HttpAgentServerAdapter"]
    SP --- Adapter
  end

  subgraph deno["Deno.serve + Hono"]
    CMD["POST /api/threads/:id/commands"]
    STR["POST /api/threads/:id/stream (SSE)"]
    STA["GET|POST /api/threads/:id/state"]
  end

  subgraph server["server/"]
    SRV["registry · session · threads"]
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
  class browser,deno process
  class server trigger
  class agent output
```

## Deno 后端如何工作

此示例作为**单个 Deno 进程**运行：

* **`main.ts`**：`Deno.serve` + Hono 应用程序。挂载`/api`路线并从`dist/`为Vite建造的SPA提供服务。
* **`server/routes.ts`**：代理流协议的 Hono 路由定义。
* **`server/session.ts`**：`LocalThreadSession`：在 LangGraph `StreamChannel` 中缓冲协议事件，使用 `matchesSubscription` 进行过滤，并通过 SSE `ReadableStream` 扇出匹配帧。
* **`server/threads.ts`**：LangGraph SDK 有线格式中检查指针支持的 `getState` / `updateState` / `getHistory` 帮助程序。
* **`server/registry.ts`**：进程本地单例拥有代理和每个线程 ID 一个会话。
* **`server/agent/`**：与 Next.js 示例相同的 `createDeepAgent` 编排器（研究员 + math-whiz 子代理、模拟工具）。Deno Deploy 使用自己的内存中 `MemorySaver` 检查指针运行每个隔离。为了跨隔离区实现生产持久性，请交换 [durable checkpointer](/oss/python/langgraph/checkpointers#checkpointer-libraries)（Postgres、Redis，...）。路由处理程序和 `server/threads.ts` 帮助程序保持不变。

## 生产坚持

该代理开箱即用，使用内存中 `MemorySaver` 检查指针 (`server/agent/index.ts`) 和进程本地会话映射 (`server/registry.ts`)。这适用于本地开发和单隔离部署，但在 Deno Deploy（多个隔离、冷启动）上，跨实例的对话状态**不持久**。

将`server/agent/index.ts`中的`MemorySaver`替换为持久检查指针，例如`@langchain/langgraph-checkpoint-postgres`或`@langchain/langgraph-checkpoint-redis`。您还需要一个共享会话/重播存储，以便 SSE 重新连接可以跨隔离运行。

## 本地开发

您需要为客户端提供 [Deno](https://deno.com/) 2.x 和 [pnpm](https://pnpm.io/)。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cp .env.example .env   # set OPENAI_API_KEY
export $(grep -v '^#' .env | xargs)   # load env for Deno

# Terminal 1 — API + static (after first client build)
deno task build:client   # first time only
deno task dev

# Terminal 2 — Vite dev server with HMR (proxies /api to :8000)
cd client && pnpm install && pnpm dev
```

打开 [http://localhost:5173](http://localhost:5173) 进行热重载开发。 Vite 开发服务器在端口 8000 上代理 `/api` 到 Deno 服务器。

对于类似生产的本地运行（单服务器，无 HMR）：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
deno task build:client
deno task start
```

打开[http://localhost:8000](http://localhost:8000)。

## 项目布局* `main.ts`：Deno Deploy 入口点（`Deno.serve` + Hono）。
* `server/agent/`：带有子代理和模拟工具的深度代理（`createDeepAgent`）。
* `server/`：协议服务器逻辑：`session.ts`、`threads.ts`、`serialize.ts`、`registry.ts`、`routes.ts`。
* `client/`：Vite + React SPA（与 Next.js 示例相同的 UI）。
* `dist/`：由 Deno 提供的 Vite 构建输出（由 `deno task build:client` 生成）。

## 另请参阅

* [Frameworks and platforms overview](/langsmith/deploy-frameworks-and-platforms)
* [Deploy with Next.js](/langsmith/deploy-nextjs)
* [Agent Streaming Protocol](https://github.com/langchain-ai/agent-protocol/tree/main/streaming)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-deno.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>