<!-- langchain-docs: Trace Mastra agents | https://docs.langchain.com/langsmith/trace-with-mastra -->

# Trace Mastra agents

[Mastra](https://mastra.ai/docs) is a TypeScript framework for building AI agents. Using Mastra’s [LangSmith exporter](https://mastra.ai/reference/observability/tracing/exporters/langsmith), you can send traces from your Mastra agents and workflows to LangSmith for debugging, evaluation, and observability.

This guide shows you how to integrate Mastra with LangSmith using Mastra’s AI tracing system.

> [!NOTE]
>
> This integration uses a legacy destination setting such as `project_name` or `LANGSMITH_PROJECT`. [Create an agent](/langsmith/create-an-agent), choose its environment, and [retrieve that environment's `tracer_session_name`](/langsmith/create-an-agent#use-an-environment-project). Use that returned value in the destination setting and any overrides. For integrations that support agent addressing, use the [agent identifier and environment](/langsmith/log-traces-to-agent) directly.

## Installation

Install Mastra and the LangSmith exporter:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @mastra/core @mastra/langsmith @mastra/observability @mastra/libsql
```

## Setup

1. Set your LangSmith API key and the selected environment's `tracer_session_name`:

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export LANGSMITH_API_KEY=<your_langsmith_api_key>
   export LANGCHAIN_PROJECT=<your_project_name> # optional
   ```

   > [!TIP]
   >
   > Set [`LANGCHAIN_PROJECT`](/langsmith/create-an-agent#use-an-environment-project) explicitly to the selected environment's `tracer_session_name`.

2. If you plan to use OpenAI models, also ensure you have an OpenAI API key available at runtime:

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export OPENAI_API_KEY=<your_openai_api_key>
   ```

3. In your project directory, create the following project structure and files:

   ```
   src/
       mastra.ts
       agent.ts
       index.ts
   ```

## Configure Mastra with the LangSmith exporter

Mastra tracing is configured directly on the `Mastra` constructor. Add the following to a `mastra.ts` file:

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { LangSmithExporter } from "@mastra/langsmith";

import { echoAgent } from "./agent";

export const mastra = new Mastra({
  agents: { echoAgent },

  storage: new LibSQLStore({
    url: "file:./mastra.db",
  }),

  observability: {
    configs: {
      langsmith: {
        serviceName: "mastra-langsmith-demo",
        exporters: [
          new LangSmithExporter({
            apiKey: process.env.LANGSMITH_API_KEY,
          }),
        ],
      },
    },
  },

  // Disable deprecated telemetry system
  telemetry: {
    enabled: false,
  },
});
```

* [Storage is required for tracing](https://mastra.ai/docs/observability/integrations/exporters/mastra-storage) (even when exporting traces externally).
* The LangSmith exporter reads credentials from environment variables.
* The [deprecated telemetry system](https://mastra.ai/docs/observability/overview#otel-tracing-deprecated) is disabled to avoid warnings.
* No separate instrumentation file is required when running Mastra outside of the Mastra server.
  For more details, refer to the [Mastra docs](https://mastra.ai/docs/observability/overview).

### Define an agent

For compatibility, use [string-based model identifiers](https://mastra.ai/models#basic-usage). Add the following code to an `agent.ts` file:

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Agent } from "@mastra/core/agent";

export const echoAgent = new Agent({
  name: "echoAgent",
  instructions: "You are a helpful assistant.",
  model: "openai/gpt-6-luna",
});
```

Mastra will automatically route the model call using your configured API keys and capture traces for each invocation.

### Run the agent

1. Add the following to an `index.ts` file:

   ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   import { mastra } from "./mastra";

   async function main() {
   const agent = mastra.getAgent("echoAgent");
   const result = await agent.generate("Say hello and explain what Mastra is.");
   console.log(result.text);
   }

   main();
   ```

2. Run your agent:

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   npx ts-node src/index.ts
   ```

## View traces in LangSmith

After running the agent:

1. Open the [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-with-mastra).
2. Select the agent and environment configured through `LANGCHAIN_PROJECT`.
3. Locate the trace corresponding to `echoAgent.generate`.

You’ll be able to inspect:

* Model inputs and outputs
* Agent execution steps
* Timing and error information

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-mastra.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).