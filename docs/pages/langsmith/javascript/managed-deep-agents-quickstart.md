<!-- langchain-docs: Managed Deep Agents quickstart | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-quickstart -->

# Managed Deep Agents quickstart

Create and deploy your first Managed Deep Agent with the mda CLI.

Create and deploy your first Managed Deep Agent: scaffold a project, configure the model and instructions, add search, test in [LangSmith Studio](/langsmith/studio), and deploy with the [`mda` CLI](/langsmith/javascript/managed-deep-agents-cli). Managed Deep Agents supplies the [Deep Agents harness](/oss/javascript/deepagents/overview) and hosted runtime.

After this quickstart, the [tutorial](/langsmith/javascript/managed-deep-agents-tutorial) adds durable memory and a daily schedule on the same project.

> [!NOTE]
>
> Managed Deep Agents is in **public [beta](/langsmith/release-stages)** on [LangSmith Cloud](/langsmith/cloud).

## Prerequisites

To follow along, you need:

* Node.js and npm.

* An API key for your model provider of choice.

## Add the `managed-deep-agents` skill

The [`managed-deep-agents` skill](https://github.com/langchain-ai/langchain-skills/blob/main/config/skills/managed-deep-agents/SKILL.md) walks a coding agent through building, testing, and deploying a Managed Deep Agent with the `mda` CLI. To add it to the current project, run:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx skills add langchain-ai/langchain-skills --skill managed-deep-agents --yes
```

Or paste this prompt into your coding agent:

Build a Managed Deep Agent with the quickstart

Create and deploy a Managed Deep Agent in this working directory by following the Managed Deep Agents quickstart.

## Step 1: Read the guide

Fetch and follow [https://docs.langchain.com/langsmith/managed-deep-agents-quickstart.md](https://docs.langchain.com/langsmith/managed-deep-agents-quickstart.md) as the source of truth for CLI commands, project layout, and deployment steps. Prefer the Python or TypeScript path that matches this project.

## Step 2: Install the skill

If the `managed-deep-agents` skill is not already available, install it:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx skills add langchain-ai/langchain-skills --skill managed-deep-agents --yes
```

Use that skill for the rest of the workflow when it is available.

## Step 3: Prerequisites and secrets

Confirm the user has LangSmith access and any required model or search credentials. If a required API key is missing, ask them to set it in the shell or a `.env` file, then wait. Do not invent, hardcode, or commit secrets.

## Step 4: Scaffold, configure, test, and deploy

Follow the quickstart steps in order: initialize the project with `mda`, configure the model and instructions, add search as shown on the page, test in LangSmith Studio, and deploy with the `mda` CLI. Stop and ask when a dashboard action or credential can only be completed by the user in the LangSmith UI.

## Rules

* Stay scoped to the quickstart. Do not add unrelated products or rewrite the generated project layout unless the guide requires it.
* Prefer the `mda` CLI and the `managed-deep-agents` skill over inventing a custom deployment path.
* Ask rather than guess when a secret, plan-tier limit, or UI-only step is unclear.

## Create and deploy an agent

**1. Set up the project**

Create a project and open its directory:

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx managed-deepagents init research-assistant
cd research-assistant
```

```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pnpm dlx managed-deepagents init research-assistant
cd research-assistant
```

```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bunx managed-deepagents init research-assistant
cd research-assistant
```

You now have all the scaffolding for your agent.

**2. Add your keys**

Add your model provider API key to `.env`:

```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENAI_API_KEY=<OPENAI_API_KEY>
# ANTHROPIC_API_KEY=<ANTHROPIC_API_KEY>
# GOOGLE_API_KEY=<GOOGLE_API_KEY>
# AZURE_AI_OPENAI_ENDPOINT=https://<resource>.services.ai.azure.com/openai/v1
# AZURE_OPENAI_API_KEY=<AZURE_OPENAI_API_KEY>
# AZURE_OPENAI_DEPLOYMENT_NAME=<AZURE_OPENAI_DEPLOYMENT_NAME>
```

This quickstart uses OpenAI by default. For Google, Anthropic, or Microsoft Foundry, set the matching values instead. `mda deploy` adds the provider key to the deployment. You can also use any [other chat provider](/oss/javascript/integrations/chat/).

> [!WARNING]
>
> Do not commit the `.env` file into version control. It contains secrets.

**3. Set up LangSmith**

Managed Deep Agents runs on LangSmith. Your LangSmith API key authenticates local development with `mda dev`, deploys the agent with `mda deploy`, and opens the agent in [LangSmith Studio](/langsmith/studio) so you can chat with it and inspect traces.

[Sign up for LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-managed-deep-agents-quickstart) if you do not already have an account.

To create a LangSmith API key, open [Settings](https://smith.langchain.com/settings), go to **API Keys**, and click **Create API Key**. For more details, see [Create an account and API key](/langsmith/create-account-api-key).

Add your LangSmith API key to `.env`:

```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
```

**4. Edit the instructions**

Open `instructions.md` and describe how the agent should behave:

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Research assistant

You are a careful research assistant. Use internet search to find sources,
keep notes, and return concise answers with citations.
```

When you deploy, Managed Deep Agents syncs these instructions to [LangSmith Context Hub](/langsmith/javascript/managed-deep-agents-context-hub), where you can update them without redeploying the agent.

**5. Configure your model and search**

Now set the model and a built-in web search tool. Google, OpenAI, Anthropic, and Microsoft Foundry offer server-side search without a separate search package or search API key. Pass the provider tool dict that matches your model:

Open `agent.ts`:

```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineDeepAgent } from "managed-deepagents";

// OpenAI's built-in web search — no extra install or API key needed
export const agent = defineDeepAgent({
  name: "research-assistant",
  model: "openai:gpt-5.5",
  tools: [{ type: "web_search_preview" }],
});
```

```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineDeepAgent } from "managed-deepagents";

// Google's built-in search — no extra install or API key needed
export const agent = defineDeepAgent({
  name: "research-assistant",
  model: "google:gemini-3.6-flash",
  tools: [{ googleSearch: {} }],
});
```

```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineDeepAgent } from "managed-deepagents";

// Anthropic's built-in web search — no extra install or API key needed
export const agent = defineDeepAgent({
  name: "research-assistant",
  model: "anthropic:claude-sonnet-4-6",
  tools: [{ type: "web_search_20250305", name: "web_search" }],
});
```

```ts Microsoft Foundry theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// To use ChatOpenAI, run: npm install @langchain/openai
import { defineDeepAgent } from "managed-deepagents";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.AZURE_AI_OPENAI_ENDPOINT,
  },
});

export const agent = defineDeepAgent({
  name: "research-assistant",
  model,
  tools: [{ type: "web_search" }],
});
```

The agent name is also the default deployment name. For model concepts and provider options, see [Models](/oss/javascript/langchain/models).

> [accordion] Using another provider?
>
> You can use a Tavily search tool instead.
> Add a [Tavily API key](https://app.tavily.com) to `.env`:
>
> ```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> TAVILY_API_KEY=<TAVILY_API_KEY>
> ```
>
> Install the Tavily client:
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install @langchain/tavily
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm add @langchain/tavily
> ```
>
> ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> bun add @langchain/tavily
> ```
>
> Create a custom `internet_search` tool:
>
> ```ts tools/search.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { TavilySearch } from "@langchain/tavily";
> import { tool } from "langchain";
> import { z } from "zod";
>
> export const internetSearch = tool(
>   async ({ query, maxResults = 5, topic = "general" }) => {
>     const tavilySearch = new TavilySearch({
>       maxResults,
>       tavilyApiKey: process.env.TAVILY_API_KEY,
>       topic,
>     });
>     return tavilySearch._call({ query });
>   },
>   {
>     name: "internet_search",
>     description: "Search the internet for relevant sources.",
>     schema: z.object({
>       query: z.string().describe("The search query."),
>       maxResults: z.number().optional().default(5),
>       topic: z.enum(["general", "news", "finance"]).optional().default("general"),
>     }),
>   },
> );
> ```
>
> Import the tool and add it to the agent:
>
> ```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { defineDeepAgent } from "managed-deepagents";
>
> import { internetSearch } from "./tools/search";
>
> export const agent = defineDeepAgent({
>   name: "research-assistant",
>   model: "openai:gpt-5.5",
>   tools: [internetSearch],
> });
> ```
>
> For more authored tools, see [Custom tools](/langsmith/javascript/managed-deep-agents-tools).

**6. Run locally**

Install the project dependencies and start the agent:

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install
npx mda dev
```

```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pnpm install
pnpm exec mda dev
```

```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bun install
bunx mda dev
```

`mda dev` loads the API keys from `.env`, starts a local Agent Server, and opens the agent in LangSmith Studio.

In Studio, send:

```txt wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
What were the main announcements from the latest LangChain release?
```

You should see the agent call the web search tool, then return a concise answer that cites sources. If search never appears in the trace, confirm the provider tool dict matches the model you set in `agent.py` or `agent.ts`.

In an [agent-based workspace](/langsmith/agent-registry), tracing will result in errors until you register the agent. For details, see [Trace local runs](/langsmith/javascript/managed-deep-agents-local-development#trace-local-runs).

**7. Deploy the agent**

Deploy the project by running:

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx mda deploy
```

```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pnpm exec mda deploy
```

```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bunx mda deploy
```

Managed Deep Agents packages the project and runs it as a hosted deployment on [LangSmith Agent Server](/langsmith/agent-server). When deployment finishes, the CLI prints the deployment dashboard URL.

Open that URL. You should see the deployment in a ready state. Send the same research question from the previous step and confirm the hosted agent returns an answer with a search tool call. For deployment options and secrets handling, see [Deploy a Managed Deep Agent](/langsmith/javascript/managed-deep-agents-deploy). To inspect the agent's execution after it runs, use [LangSmith observability](/langsmith/observability-quickstart).

## Next steps

> [card] [Tutorial](/langsmith/javascript/managed-deep-agents-tutorial)
>
> Add a custom Tavily search tool, durable memory, and a daily schedule.

> [card] [Custom tools](/langsmith/javascript/managed-deep-agents-tools)
>
> Add authored LangChain tools from your project.

> [card] [Connections](/langsmith/javascript/managed-deep-agents-connections)
>
> Authenticate with external services, as the agent or as the caller.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-quickstart.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).