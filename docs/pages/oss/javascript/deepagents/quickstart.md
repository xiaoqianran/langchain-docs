<!-- langchain-docs: Quickstart | https://docs.langchain.com/oss/javascript/deepagents/quickstart -->

# Quickstart

Build your first deep agent in minutes

This guide walks you through creating your first deep agent with file system tools and subagent capabilities. You will build a research agent that can conduct research and write reports.

<Tip>
  **Using an AI coding assistant?**

  * Install the [LangChain Docs MCP server](/use-these-docs) to give your agent access to up-to-date LangChain documentation and examples.
  * Install [LangChain Skills](https://github.com/langchain-ai/langchain-skills) to improve your agent's performance on LangChain ecosystem tasks.
</Tip>

## Prerequisites

Before you begin, make sure you have an API key from a model provider (e.g., Gemini, Anthropic, OpenAI).

<Note>
  Deep Agents require a model that supports [tool calling](/oss/javascript/langchain/models#tool-calling). See [customization](/oss/javascript/deepagents/customization#model) for how to configure your model.
</Note>

## Step 1: Install dependencies

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install deepagents langchain @langchain/core
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add deepagents langchain @langchain/core
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add deepagents langchain @langchain/core
  ```
</CodeGroup>

<Note>
  Google, OpenAI, and Anthropic all provide built-in web search tools: no extra package or API key required. If you use a different provider or prefer [Tavily](https://tavily.com/) for search, install the Tavily package as well:

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/tavily
  ```
</Note>

## Step 2: Set up your API keys

<Tabs>
  <Tab title="Google">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export GOOGLE_API_KEY="your-api-key"
    ```
  </Tab>

  <Tab title="OpenAI">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export OPENAI_API_KEY="your-api-key"
    ```
  </Tab>

  <Tab title="Anthropic">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export ANTHROPIC_API_KEY="your-api-key"
    ```
  </Tab>

  <Tab title="OpenRouter">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export OPENROUTER_API_KEY="your-api-key"
    export TAVILY_API_KEY="your-tavily-api-key"
    ```
  </Tab>

  <Tab title="Fireworks">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export FIREWORKS_API_KEY="your-api-key"
    export TAVILY_API_KEY="your-tavily-api-key"
    ```
  </Tab>

  <Tab title="Baseten">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export BASETEN_API_KEY="your-api-key"
    export TAVILY_API_KEY="your-tavily-api-key"
    ```
  </Tab>

  <Tab title="Ollama">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Local: Ollama must be running on your machine
    # Cloud: Set your Ollama API key for hosted inference
    export OLLAMA_API_KEY="your-api-key"
    export TAVILY_API_KEY="your-tavily-api-key"
    ```
  </Tab>

  <Tab title="Other">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Set the API key for your provider
    export <PROVIDER>_API_KEY="your-api-key"
    export TAVILY_API_KEY="your-tavily-api-key"
    ```

    Deep Agents work with any [LangChain chat model](/oss/javascript/deepagents/models#supported-models). Set the API key for your provider.
  </Tab>
</Tabs>

<Tip>
  **Using LangSmith Gateway**

  The [LangSmith Gateway](/langsmith/llm-gateway) routes most major providers through LangSmith. You can [bring your own provider keys](/langsmith/llm-gateway-quickstart#2-make-a-call), or use [Gateway Credits](/langsmith/llm-gateway-credits) to access models without a provider key.
</Tip>

## Step 3: Create a search tool

Google, OpenAI, and Anthropic offer built-in web search tools that run server-side: no extra package or API key needed. Pass a provider tool dict directly to `create_deep_agent`.

<Tabs>
  <Tab title="Provider search (recommended)">
    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent } from "deepagents";

      // Google's built-in search — no extra install or API key needed
      const internetSearch = { google_search: {} };
      ```

      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent } from "deepagents";

      // OpenAI's built-in web search — no extra install or API key needed
      const internetSearch = { type: "web_search_preview" };
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent } from "deepagents";

      // Anthropic's built-in web search — no extra install or API key needed
      const internetSearch = { type: "web_search_20250305", name: "web_search" };
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Tavily (any provider)">
    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { tool } from "langchain";
    import { TavilySearch } from "@langchain/tavily";
    import { z } from "zod";

    const internetSearch = tool(
      async ({
        query,
        maxResults = 5,
        topic = "general",
        includeRawContent = false,
      }: {
        query: string;
        maxResults?: number;
        topic?: "general" | "news" | "finance";
        includeRawContent?: boolean;
      }) => {
        const tavilySearch = new TavilySearch({
          maxResults,
          tavilyApiKey: process.env.TAVILY_API_KEY,
          includeRawContent,
          topic,
        });
        return await tavilySearch._call({ query });
      },
      {
        name: "internet_search",
        description: "Run a web search",
        schema: z.object({
          query: z.string().describe("The search query"),
          maxResults: z
            .number()
            .optional()
            .default(5)
            .describe("Maximum number of results to return"),
          topic: z
            .enum(["general", "news", "finance"])
            .optional()
            .default("general")
            .describe("Search topic category"),
          includeRawContent: z
            .boolean()
            .optional()
            .default(false)
            .describe("Whether to include raw content"),
        }),
      },
    );
    ```
  </Tab>
</Tabs>

## Step 4: Create a deep agent

Pass your search tool and model to `create_deep_agent`. Pass a `model` string in `provider:model` format, or an [initialized model instance](/oss/javascript/deepagents/models#configure-model-parameters). See [supported models](/oss/javascript/deepagents/models#supported-models) for all providers and [suggested models](/oss/javascript/deepagents/models#suggested-models) for tested recommendations.

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  // System prompt to steer the agent to be an expert researcher
  const researchInstructions = `You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

  You have access to an internet search tool as your primary means of gathering information.

  ## \`internet_search\`

  Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
  `;

  const agent = createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [internetSearch],
    systemPrompt: researchInstructions,
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  // System prompt to steer the agent to be an expert researcher
  const researchInstructions = `You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

  You have access to an internet search tool as your primary means of gathering information.

  ## \`internet_search\`

  Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
  `;

  const agent = createDeepAgent({
    model: "openai:gpt-5.5",
    tools: [internetSearch],
    systemPrompt: researchInstructions,
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  // System prompt to steer the agent to be an expert researcher
  const researchInstructions = `You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

  You have access to an internet search tool as your primary means of gathering information.

  ## \`internet_search\`

  Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
  `;

  const agent = createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [internetSearch],
    systemPrompt: researchInstructions,
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  // System prompt to steer the agent to be an expert researcher
  const researchInstructions = `You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

  You have access to an internet search tool as your primary means of gathering information.

  ## \`internet_search\`

  Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
  `;

  const agent = createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [internetSearch],
    systemPrompt: researchInstructions,
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  // System prompt to steer the agent to be an expert researcher
  const researchInstructions = `You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

  You have access to an internet search tool as your primary means of gathering information.

  ## \`internet_search\`

  Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
  `;

  const agent = createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [internetSearch],
    systemPrompt: researchInstructions,
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  // System prompt to steer the agent to be an expert researcher
  const researchInstructions = `You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

  You have access to an internet search tool as your primary means of gathering information.

  ## \`internet_search\`

  Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
  `;

  const agent = createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [internetSearch],
    systemPrompt: researchInstructions,
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  // System prompt to steer the agent to be an expert researcher
  const researchInstructions = `You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

  You have access to an internet search tool as your primary means of gathering information.

  ## \`internet_search\`

  Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
  `;

  const agent = createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [internetSearch],
    systemPrompt: researchInstructions,
  });
  ```
</CodeGroup>

## Step 5: Set up LangSmith tracing

[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-quickstart) provides you with visibility into your agent's execution, allowing you to view tool calls, subagent delegation, and LLM responses.

Sign up at [smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-quickstart), create an API key, and set these environment variables:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY="your-langsmith-api-key"
```

## Step 6: Run the agent

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const result = await agent.invoke({
  messages: [{ role: "user", content: "What is langgraph?" }],
});

// Print the agent's response
console.log(result.messages[result.messages.length - 1].content);
```

## How does it work?

Your deep agent automatically:

1. **Conducts research** by calling the `internet_search` tool to gather information.
2. **Manages context** by using file system tools ([`write_file`](/oss/javascript/deepagents/overview#virtual-filesystem-access), [`read_file`](/oss/javascript/deepagents/overview#virtual-filesystem-access)) to offload large search results.
3. **Spawns subagents** as needed to delegate complex subtasks to specialized subagents.
4. **Synthesizes a report** to compile findings into a coherent response.

To add structured task planning with `write_todos`, opt in with [`TodoListMiddleware`](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware). See [Task planning](/oss/javascript/deepagents/overview#task-planning).

## Examples

For agents, patterns, and applications you can build with Deep Agents, see [Examples](https://github.com/langchain-ai/deepagents/tree/main/examples).

## Streaming

Deep Agents have built-in [streaming](/oss/javascript/langchain/event-streaming) for real-time updates from agent execution using LangGraph.
This allows you to observe output progressively and review and debug agent and subagent work, such as tool calls, tool results, and LLM responses.

## Next steps

Now that you've built your first deep agent:

* **Customize your agent**: Learn about [customization options](/oss/javascript/deepagents/customization), including custom system prompts, tools, and subagents.
* **Add long-term memory**: Enable [persistent memory](/oss/javascript/deepagents/memory) across conversations.
* **Deploy to production**: Use [Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview) to create, run, and operate deep agents in LangSmith.
* **Test and evaluate**: Use [LangSmith evaluation](/langsmith/evaluation-quickstart) to run automated tests and measure your agent's performance against a dataset.

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/quickstart.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>