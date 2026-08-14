<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Claude Managed Agents | https://docs.langchain.com/langsmith/trace-with-claude-managed-agents -->

# 跟踪克劳德管理的代理

使用 LangSmith 自动跟踪 Claude Managed Agent 会话和事件。

[Claude Managed Agents](https://docs.anthropic.com/en/docs/claude-code/managed-agents) 是Anthropic 的托管、基于云的代理，在托管环境中运行。 LangSmith 支持通过 `wrapAnthropic` 包装器跟踪 Claude Managed Agent 会话，使您可以了解代理创建、会话事件和消息流。

<Note>
  目前，**仅 TypeScript** 支持 Claude Managed Agents 跟踪。
</Note>

## 安装

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install langsmith @anthropic-ai/sdk
```

```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
yarn add langsmith @anthropic-ai/sdk
```

## 环境设置

```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=<your-langsmith-api-key>
export ANTHROPIC_API_KEY=<your-anthropic-api-key>
```

## 追踪克劳德管理的代理

用 `wrapAnthropic` 包装 Anthropic 客户端。包装器将自动跟踪代理创建、会话创建以及流经会话的所有事件。

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import Anthropic from "@anthropic-ai/sdk";
import { wrapAnthropic } from "langsmith/wrappers/anthropic";

const anthropic = wrapAnthropic(new Anthropic());

// Create a managed agent
const agent = await anthropic.beta.agents.create({
  name: "my-agent",
  model: "claude-opus-4-8",
  system: "You are a helpful assistant.",
  tools: [
    // ... your tools here
  ],
});

// Create a cloud environment for the agent to run in
const environment = await anthropic.beta.environments.create({
  name: "my-environment",
  config: {
    type: "cloud",
    networking: { type: "unrestricted" },
  },
});

// Create a session connecting the agent and environment
const session = await anthropic.beta.sessions.create({
  agent: agent.id,
  environment_id: environment.id,
  title: "My session",
});

// Stream session events
const stream = await anthropic.beta.sessions.events.stream(session.id);

// Send a message to the agent
await anthropic.beta.sessions.events.send(session.id, {
  events: [
    {
      type: "user.message",
      content: [
        {
          type: "text",
          text: "Hello! Can you help me with something?",
        },
      ],
    },
  ],
});

// Consume the event stream until the session is idle
for await (const event of stream) {
  if (event.type === "session.status_idle") {
    break;
  }
}
```

<Note>
  Anthropic 多智能体架构中子智能体的完整追踪需要
  接入单独的事件流，尚不支持。仅限顶级
  跟踪会话事件。
</Note>

## 后续步骤

* [Trace Anthropic models](/langsmith/trace-anthropic) — 跟踪标准Anthropic API 调用和工具使用
* [Trace Claude Agent SDK applications](/langsmith/trace-claude-agent-sdk) — 跟踪本地代理应用程序的 Claude Agent SDK
* [Monitor your agent](/langsmith/dashboards) — 为生产代理设置仪表板和警报

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-claude-managed-agents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>