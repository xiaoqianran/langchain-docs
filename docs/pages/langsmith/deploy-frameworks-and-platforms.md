<!-- langchain-docs: Deploy full-stack web apps | https://docs.langchain.com/langsmith/deploy-frameworks-and-platforms -->

# Deploy full-stack web apps

Deploy LangChain agents as full-stack web apps on Next.js, SvelteKit, Nuxt, Cloudflare Workers, Deno Deploy, and Vite with streaming UI and thread history.

The following pages provide reference implementations for running LangChain agents in production on JavaScript frameworks and hosting platforms. Each example in the [deployment cookbook repository](https://github.com/langchain-ai/deployment-cookbook) is a full-stack chat app with streaming UI, subagents, and thread history, deployed on a different platform using the same [Agent Streaming Protocol](https://github.com/langchain-ai/agent-protocol/tree/main/streaming).

Use these guides when you need to ship an agent-backed product: copy the stack that matches your hosting environment, swap in your own tools and models, and upgrade persistence when you move beyond a single instance.

## Examples

### Pair with LangSmith Deployment

The agent runs as a LangSmith Deployment, and a separate web app streams from the Agent Server API.

<CardGroup>
  <Card title="LangSmith + Vite" icon="https://mintcdn.com/langchain-5e9cc07a/ZPKed1feKJ8F6LVo/images/providers/light/langchain.svg?fit=max&auto=format&n=ZPKed1feKJ8F6LVo&q=85&s=b910ed9cd0b6b8adb4b6da400882e92c" href="/langsmith/deploy-vite-langsmith">
    Agent graph on LangSmith Deployment; Vite + React UI streams from the Agent Server API.
  </Card>
</CardGroup>

### Embed in your web framework

The agent runs inside the framework's route handlers and ships as one deployable app to the host platform.

<CardGroup>
  <Card title="Next.js" icon="https://mintcdn.com/langchain-5e9cc07a/h9vvRKKSgCSjvd_Y/images/providers/light/nextjs.svg?fit=max&auto=format&n=h9vvRKKSgCSjvd_Y&q=85&s=4f3336e9534db50f25f87173a41322d5" href="/langsmith/deploy-nextjs">
    App Router route handlers implement the protocol under `/api/threads/...`. Deploy to Vercel with one click.
  </Card>

  <Card title="SvelteKit" icon="https://mintcdn.com/langchain-5e9cc07a/h9vvRKKSgCSjvd_Y/images/providers/light/svelte.svg?fit=max&auto=format&n=h9vvRKKSgCSjvd_Y&q=85&s=07e7e35c40e4522f739feea9ef3e33b7" href="/langsmith/deploy-sveltekit">
    SvelteKit server routes on Cloudflare Workers with `@langchain/svelte` and per-thread Durable Objects for SSE replay.
  </Card>

  <Card title="Nuxt" icon="https://mintcdn.com/langchain-5e9cc07a/h9vvRKKSgCSjvd_Y/images/providers/light/nuxt.svg?fit=max&auto=format&n=h9vvRKKSgCSjvd_Y&q=85&s=5d965ed1f93f51ac604e66b935a65368" href="/langsmith/deploy-nuxt">
    Nitro route handlers and `@langchain/vue` composables in a single deployable Nuxt 4 app.
  </Card>

  <Card title="Cloudflare Workers" icon="https://mintcdn.com/langchain-5e9cc07a/h9vvRKKSgCSjvd_Y/images/providers/light/cloudflare.svg?fit=max&auto=format&n=h9vvRKKSgCSjvd_Y&q=85&s=ae129fcbfc78ccaece42b1c4d3699311" href="/langsmith/deploy-cloudflare-workers">
    Vite + React SPA and Hono API on one Worker with Workers Assets and Durable Objects.
  </Card>

  <Card title="Deno Deploy" icon="https://mintcdn.com/langchain-5e9cc07a/Tz8fh3A43FeUPf69/images/providers/light/deno.svg?fit=max&auto=format&n=Tz8fh3A43FeUPf69&q=85&s=8d213b0000104542fcaa7ab160595224" href="/langsmith/deploy-deno">
    Deno.serve + Hono serves the protocol API and a Vite-built React SPA from one entrypoint.
  </Card>
</CardGroup>

<Tip>
  Each cookbook example shares the same demo agent: a coordinator that delegates to `researcher` and `math-whiz` subagents with mock tools, so you can compare hosting choices without changing application behavior.
</Tip>

## What goes into an agent deployment

Every example follows the same shape. The framework and hosting change; the responsibilities do not.

### Agent runtime

The agent itself, typically a LangGraph graph or [`deepagents`](https://www.npmjs.com/package/deepagents) coordinator, with tools, optional subagents, and middleware. It is compiled with a **checkpointer** so conversation state survives across turns. Examples start with an in-memory `MemorySaver` for simplicity; production deployments swap in Redis ([`@langchain/langgraph-checkpoint-redis`](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-redis)), Postgres ([`@langchain/langgraph-checkpoint-postgres`](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-postgres)), SQLite ([`@langchain/langgraph-checkpoint-sqlite`](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-sqlite)), or platform-specific storage.

### Protocol server

HTTP route handlers implement the [Agent Streaming Protocol](https://github.com/langchain-ai/agent-protocol/tree/main/streaming) under `/api/threads/...`.

#### Minimum (streaming chat)

These three endpoints are enough to run a single-threaded streaming chat with `HttpAgentServerAdapter`:

| Method         | Path                              | Purpose                                         |
| -------------- | --------------------------------- | ----------------------------------------------- |
| `POST`         | `/api/threads/:threadId/commands` | Accept commands (`run.start`, …) and start runs |
| `POST`         | `/api/threads/:threadId/stream`   | SSE stream of protocol events for a run         |
| `GET` / `POST` | `/api/threads/:threadId/state`    | Read and bootstrap checkpointed thread state    |

#### Thread sidebar (all examples)

Every example also implements endpoints for the thread-history sidebar:

| Method   | Path                             | Purpose                                   |
| -------- | -------------------------------- | ----------------------------------------- |
| `GET`    | `/api/threads`                   | List threads known to the checkpointer    |
| `DELETE` | `/api/threads/:threadId`         | Delete a thread's session and checkpoints |
| `POST`   | `/api/threads/:threadId/history` | Paginated checkpoint history              |

### Session and run management

Server-side logic tracks active runs, bridges commands to the agent, and fans out live events over SSE. A registry or session store lets clients reconnect to in-flight streams. On serverless or multi-instance hosts, this layer must be shared or colocated with the checkpointer.

### Chat frontend

A browser UI wired to the protocol through `HttpAgentServerAdapter`, from [`@langchain/react`](https://www.npmjs.com/package/@langchain/react), [`@langchain/vue`](https://www.npmjs.com/package/@langchain/vue), [`@langchain/svelte`](https://www.npmjs.com/package/@langchain/svelte), or [`@langchain/angular`](https://www.npmjs.com/package/@langchain/angular). The client bootstraps thread state, submits messages, consumes the SSE stream, and renders tokens, tool calls, reasoning, and subagent activity.

These bindings ship no components of their own. Hooks like `useStream` return plain reactive state (messages, tool calls, loading flags, thread metadata) that you wire to whatever visual layer you prefer. For adapter patterns and trade-offs, see the [frontend integrations overview](/oss/python/langchain/frontend/integrations/overview).

## See also

* [LangSmith Deployment overview](/langsmith/deployment)
* [Agent Server](/langsmith/agent-server)
* [Configure checkpointer](/langsmith/configure-checkpointer)
* [Frontend overview](/oss/python/langchain/frontend/overview)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-frameworks-and-platforms.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>