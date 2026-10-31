<!-- langchain-docs: LangSmith Observability | https://docs.langchain.com/oss/javascript/langchain/observability -->

# LangSmith Observability

As you build and run agents with LangChain, you need visibility into how they behave: which [tools](/oss/javascript/langchain/tools) they call, what prompts they generate, and how they make decisions. LangChain agents built with [`createAgent`](https://reference.langchain.com/javascript/langchain/index/createAgent) automatically support tracing through [LangSmith](/langsmith/observability), a platform for capturing, debugging, evaluating, and monitoring agent behavior.

[*Traces*](/langsmith/observability-concepts#traces) record every step of your agent's execution, from the initial user input to the final response, including all tool calls, model interactions, and decision points. This execution data helps you debug issues, evaluate performance across different inputs, and monitor usage patterns in production.

This guide shows you how to enable tracing for your LangChain agents and use LangSmith to analyze their execution.

## Prerequisites

Before you begin, ensure you have the following:

* **A LangSmith account**: Sign up (for free) or log in at [smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-observability).
* **A LangSmith API key**: Follow the [Create an API key](/langsmith/create-account-api-key) guide.

## Enable tracing

> [!NOTE]
>
> In an [agent-based workspace](/langsmith/agent-registry), [create an agent](/langsmith/create-an-agent) once before sending traces. Use [agent addressing](/langsmith/log-traces-to-agent) to select its identifier and environment. If an integration requires `project_name`, use the selected environment's [`tracer_session_name`](/langsmith/create-an-agent#use-an-environment-project) as a compatibility value.

All LangChain agents automatically support LangSmith tracing. To enable it, set the following environment variables:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_AGENT_ID="<your-agent-id>"
export LANGSMITH_AGENT_ENVIRONMENT="production"
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=<your-api-key>
```

## Quickstart

No extra code is needed to log a trace to LangSmith. Just run your agent code as you normally would:

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "@langchain/agents";

function sendEmail(to: string, subject: string, body: string): string {
    // ... email sending logic
    return `Email sent to ${to}`;
}

function searchWeb(query: string): string {
    // ... web search logic
    return `Search results for: ${query}`;
}

const agent = createAgent({
    model: "gpt-5.5",
    tools: [sendEmail, searchWeb],
    systemPrompt: "You are a helpful assistant that can send emails and search the web."
});

// Run the agent - all steps will be traced automatically
const response = await agent.invoke({
    messages: [{ role: "user", content: "Search for the latest AI news and email a summary to john@example.com" }]
});
```

Traces appear in the destination configured during setup.

## Trace selectively

You may opt to trace specific invocations or parts of your agent using LangSmith's `tracing_context` context manager:

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";

// This WILL be traced
const tracer = new LangChainTracer();
await agent.invoke(
  {
    messages: [{role: "user", content: "Send a test email to alice@example.com"}]
  },
  { callbacks: [tracer] }
);

// This will NOT be traced (if LANGSMITH_TRACING is not set)
await agent.invoke(
  {
    messages: [{role: "user", content: "Send another email"}]
  }
);
```

## Select an agent and environment

Use `LANGSMITH_AGENT_ID` and `LANGSMITH_AGENT_ENVIRONMENT` to select the registered agent and environment. For per-request routing, pass an agent address in code. See [Log traces to an agent](/langsmith/log-traces-to-agent).

> [accordion] Project-based workspaces and self-hosted LangSmith
>
> Set `LANGSMITH_PROJECT` to the tracing project name instead of setting the agent variables. For integrations that require `project_name` in an agent-based workspace, use the environment's [`tracer_session_name`](/langsmith/create-an-agent#use-an-environment-project) as a compatibility value.

## Add metadata to traces

You can annotate your traces with custom metadata and tags:

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";

const tracer = new LangChainTracer();
await agent.invoke(
  {
    messages: [{role: "user", content: "Send a test email to alice@example.com"}]
  },
  {
    tags: ["production", "email-assistant", "v1.0"],
    metadata: {
      userId: "user123",
      sessionId: "session456",
      environment: "production"
    }
  },
);

```

This custom metadata and tags will be attached to the trace in LangSmith.

> [!TIP]
>
> To learn more about how to use traces to debug, evaluate, and monitor your agents, see the [LangSmith documentation](/langsmith/observability).

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/observability.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).