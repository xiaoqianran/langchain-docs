<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy with SvelteKit | https://docs.langchain.com/langsmith/deploy-sveltekit -->

# 使用 SvelteKit 进行部署

以下页面详细介绍了一个示例应用程序，该应用程序在 [SvelteKit](https://svelte.dev/docs/kit/introduction) 项目内部署 LangChain **深度代理**，该项目为 [Cloudflare Workers](https://svelte.dev/docs/kit/adapter-cloudflare) 和 [⟦T6⟧](https://www.npmjs.com/package/@sveltejs/adapter-cloudflare) 构建：流聊天 UI、子代理详细信息视图、线程历史记录以及在 `/api/threads/...` 下公开的 [Agent Streaming Protocol](https://github.com/langchain-ai/agent-protocol/tree/main/streaming)。不需要单独的后端进程。

来源：部署手册中的[⟦T8⟧](https://github.com/langchain-ai/deployment-cookbook/tree/main/js-sveltekit)。

## 部署到 Cloudflare

<Steps>

<Step title="Install and build">

```bash
cd js-sveltekit
cp .env.example .env   # set OPENAI_API_KEY for local dev
pnpm install
pnpm build
```

</Step>

<Step title="Configure secrets">

```bash
npx wrangler login
npx wrangler secret put OPENAI_API_KEY
```

</Step>

<Step title="Deploy">

```bash
pnpm run deploy
```

</Step>

</Steps>

`svelte.config.js` 使用`adapter-cloudflare()`。 `wrangler.jsonc` 将 Wrangler 指向 `.svelte-kit/cloudflare/_worker.js` 并提供来自 `.svelte-kit/cloudflare` 的资产，与 SvelteKit Cloudflare 适配器文档相匹配。构建脚本将 `ThreadSession` 持久对象导出附加到生成的 Worker 条目，因为持久对象类必须由 Worker 模块导出。

`nodejs_compat` 和 `nodejs_compat_populate_process_env` 已启用，因为 LangChain 运行时和跟踪集成需要与 Node 兼容的 API 和环境访问。

（可选）通过添加 [⟦T17⟧](https://github.com/langchain-ai/deployment-cookbook/blob/main/js-sveltekit/.env.example) 中的变量作为 Worker 机密或变量来启用 LangSmith 跟踪。

## 所需的 API 端点

该应用程序在`/api/threads/...`下公开代理流协议。 SvelteKit 路由处理程序位于 `src/routes/api/threads/`。

### 最低（流媒体聊天）|方法|路径|目的|
| ---| ---| ---|
| `POST` | `/api/threads/:threadId/commands` |接受协议命令（`run.start`，...）并启动代理运行 |
| `POST` | `/api/threads/:threadId/stream` |运行的 SSE 协议事件流 |
| `GET` / `POST` | `/api/threads/:threadId/state` |读取并引导检查点线程状态 |

### 可选（侧边栏）

|方法|路径|目的|
| ---| ---| ---|
| `GET` | `/api/threads` |列出检查点已知的线程 |
| `DELETE` | `/api/threads/:threadId` |删除线程的会话和检查点 |
| `POST` | `/api/threads/:threadId/history` |分页检查点历史记录 |

## Cloudflare 后端设计

|关注|实施 |
| ---| ---|
|前端 | SvelteKit 客户端路由和组件 |
| API层| `src/routes/api/threads/` 中的 SvelteKit 服务器端点 |
|运行时 |工人V8 + `nodejs_compat` |
|上交所回放 |每线程持久对象 (`ThreadSession`) |
|代理运行 |工人隔离；协议事件发布到 DO |
|静态资产| Workers 静态资产来自 `adapter-cloudflare` |
|秘密 | `wrangler secret` / 本地 `.env` |

## 生产坚持

该代理开箱即用，使用内存中的 `MemorySaver` 检查指针 (`src/lib/server/agent/index.ts`)。每线程 SSE 重播/会话日志位于 [Durable Object](https://developers.cloudflare.com/durable-objects/) 中，因此流客户端重新连接到一个协调点而不是进程本地映射。检查指针仍然处于隔离本地演示状态。 Cloudflare 隔离是短暂的，并且可以水平扩展，因此检查点对话状态在部署、冷启动或隔离中**不持久**。

用于生产：

1. 交换持久检查指针（例如 [Postgres via Hyperdrive](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/) 或 [custom Durable Object-backed store](https://developers.cloudflare.com/agents/model-context-protocol/apis/client-api/#custom-storage-backend)）。
2. 如果在持久对象从内存中被逐出后客户端需要重新连接，则保留长期重播/历史记录。

## 本地开发

```bash
cp .env.example .env   # set OPENAI_API_KEY
pnpm install
pnpm dev
```

打开[http://localhost:5173](http://localhost:5173)。

```bash
pnpm build      # production build for Cloudflare
pnpm preview    # preview the production build locally
pnpm typecheck  # svelte-check over the project
```

对于构建后的 Cloudflare 式本地测试，请运行：

```bash
npx wrangler dev .svelte-kit/cloudflare/_worker.js
```

## 项目布局

<AccordionGroup>

<Accordion title="Project structure">

- `src/lib/server/agent/` — 深度代理 (`createDeepAgent`)，带有 `researcher` 和 `math-whiz` 子代理和模拟工具。
- `src/lib/server/durable-objects/thread-session.ts` — 用于 SSE 重放的每线程持久对象事件日志。
- `src/lib/server/protocol/` — 代理流协议助手：检查点支持的状态/历史、运行发布、序列化和注册表。
- `src/routes/api/threads/` — 协议端点的 SvelteKit 路由处理程序。
- `src/lib/chat/threads-client.ts` — 浏览器线程引导和侧边栏帮助程序。
- `src/lib/components/` — 使用 `@langchain/svelte` 的简洁聊天 UI。
- `svelte.config.js` — SvelteKit 配置有 `@sveltejs/adapter-cloudflare`。
- `scripts/export-durable-objects.mjs` — 构建后补丁，从生成的 Worker 条目中重新导出 Durable Object 类。
- `wrangler.jsonc` — Cloudflare Workers 静态资产和持久对象配置。

</Accordion></AccordionGroup>

## 另请参阅

- [Frameworks and platforms overview](/langsmith/deploy-frameworks-and-platforms)
- [SvelteKit Cloudflare adapter](https://svelte.dev/docs/kit/adapter-cloudflare)
- [Agent Streaming Protocol](https://github.com/langchain-ai/agent-protocol/tree/main/streaming)
- [⟦T56⟧](https://reference.langchain.com/javascript/langchain-svelte/getting-started)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-sveltekit.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>