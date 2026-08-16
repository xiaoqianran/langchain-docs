<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy full-stack web apps | https://docs.langchain.com/langsmith/deploy-frameworks-and-platforms -->

# 部署全栈 Web 应用程序

以下页面提供了在 JavaScript 框架和托管平台上运行 LangChain 代理的参考实现。 [deployment cookbook repository](https://github.com/langchain-ai/deployment-cookbook) 中的每个示例都是一个全栈聊天应用程序，具有流式 UI、子代理和线程历史记录，使用相同的 [Agent Streaming Protocol](https://github.com/langchain-ai/agent-protocol/tree/main/streaming) 部署在不同的平台上。

当您需要交付代理支持的产品时，请使用这些指南：复制与您的托管环境相匹配的堆栈、交换您自己的工具和模型，以及在超越单个实例时升级持久性。

## 示例

### 与 LangSmith 部署配对

该代理作为 LangSmith 部署运行，并且是来自代理服务器 API 的单独 Web 应用程序流。

<CardGroup cols={3}>

<Card title="LangSmith + Vite" icon="/images/providers/light/langchain.svg" href="/langsmith/deploy-vite-langsmith">
LangSmith部署的代理图；来自 Agent Server API 的 Vite + React UI 流。
</Card>

</CardGroup>

### 嵌入您的网络框架

该代理在框架的路由处理程序内运行，并作为一个可部署应用程序发送到主机平台。

<CardGroup cols={3}>

<Card title="Next.js" icon="/images/providers/light/nextjs.svg" href="/langsmith/deploy-nextjs">
App Router 路由处理程序实现 `/api/threads/...` 下的协议。一键部署到 Vercel。
</Card>

<Card title="SvelteKit" icon="/images/providers/light/svelte.svg" href="/langsmith/deploy-sveltekit">
SvelteKit 服务器在 Cloudflare Workers 上路由，具有 `@langchain/svelte` 和用于 SSE 重放的每线程持久对象。
</Card><Card title="Nuxt" icon="/images/providers/light/nuxt.svg" href="/langsmith/deploy-nuxt">
Nitro 路由处理程序和 `@langchain/vue` 可组合项位于单个可部署的 Nuxt 4 应用程序中。
</Card>

<Card title="Cloudflare Workers" icon="/images/providers/light/cloudflare.svg" href="/langsmith/deploy-cloudflare-workers">
一名 Worker 上的 Vite + React SPA 和 Hono API，具有 Workers 资产和持久对象。
</Card>

<Card title="Deno Deploy" icon="/images/providers/light/deno.svg" href="/langsmith/deploy-deno">
Deno.serve + Hono 从一个入口点提供协议 API 和 Vite 构建的 React SPA。
</Card>

</CardGroup>

<Tip>
每个说明书示例共享相同的演示代理：一个协调器，使用模拟工具委托给 `researcher` 和 `math-whiz` 子代理，因此您可以在不更改应用程序行为的情况下比较托管选择。
</Tip>

## 代理部署的内容

每个示例都遵循相同的形状。框架和托管发生变化；责任则不然。

### 代理运行时

代理本身，通常是LangGraph图或[⟦T5⟧](https://www.npmjs.com/package/deepagents)协调器，带有工具、可选的子代理和中间件。它是用 **检查指针** 编译的，因此对话状态可以跨轮保存。为了简单起见，示例从内存中的`MemorySaver`开始；生产部署交换 Redis ([⟦T7⟧](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-redis))、Postgres ([⟦T8⟧](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-postgres))、SQLite ([⟦T9⟧](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-sqlite)) 或特定于平台的存储。

### 协议服务器

HTTP 路由处理程序在 `/api/threads/...` 下实现 [Agent Streaming Protocol](https://github.com/langchain-ai/agent-protocol/tree/main/streaming)。

#### 最低（流媒体聊天）这三个端点足以使用 `HttpAgentServerAdapter` 运行单线程流式聊天：

|方法|路径|目的|
| ---| ---| ---|
| `POST` | `/api/threads/:threadId/commands` |接受命令（`run.start`，...）并开始运行 |
| `POST` | `/api/threads/:threadId/stream` |运行的 SSE 协议事件流 |
| `GET` / `POST` | `/api/threads/:threadId/state` |读取并引导检查点线程状态 |

#### 线程侧边栏（所有示例）

每个示例还实现了线程历史记录侧边栏的端点：

|方法|路径|目的|
| ---| ---| ---|
| `GET` | `/api/threads` |列出检查点已知的线程 |
| `DELETE` | `/api/threads/:threadId` |删除线程的会话和检查点 |
| `POST` | `/api/threads/:threadId/history` |分页检查点历史记录 |

### 会话和运行管理

服务器端逻辑跟踪活动运行、将命令桥接到代理并通过 SSE 扇出实时事件。注册表或会话存储允许客户端重新连接到正在进行的流。在无服务器或多实例主机上，该层必须与检查点共享或位于同一位置。

### 聊天前端浏览器 UI 通过 `HttpAgentServerAdapter`、[⟦T27⟧](https://www.npmjs.com/package/@langchain/react)、[⟦T28⟧](https://www.npmjs.com/package/@langchain/vue)、[⟦T29⟧](https://www.npmjs.com/package/@langchain/svelte) 或 [⟦T30⟧](https://www.npmjs.com/package/@langchain/angular) 连接到协议。客户端引导线程状态、提交消息、使用 SSE 流并呈现令牌、工具调用、推理和子代理活动。

这些绑定不提供自己的组件。像 `useStream` 这样的钩子返回简单的反应状态（消息、工具调用、加载标志、线程元数据），您可以将其连接到您喜欢的任何可视层。有关适配器模式和权衡，请参阅 [frontend integrations overview](/oss/python/langchain/frontend/integrations/overview)。

## 另请参阅

- [LangSmith Deployment overview](/langsmith/deployment)
- [Agent Server](/langsmith/agent-server)
- [Configure checkpointer](/langsmith/configure-checkpointer)
- [Frontend overview](/oss/python/langchain/frontend/overview)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-frameworks-and-platforms.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>