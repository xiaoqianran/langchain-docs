<!-- langchain-docs: Build a deep research agent | https://docs.langchain.com/oss/javascript/deepagents/deep-research -->

# Build a deep research agent

Build a multi-step web research agent with subagent delegation using Managed Deep Agents or the Deep Agents SDK

## Overview

This guide shows how to build a multi-step web research agent with [Deep Agents](/oss/javascript/deepagents). The agent decomposes research questions into focused tasks, delegates them to specialized sub-agents, and synthesizes findings into a comprehensive report.

The agent you build will:

1. Plan research using the opt-in todo list middleware
2. Delegate focused research tasks to sub-agents with isolated context
3. Assess search results and plan next steps as you gather information
4. Synthesize findings with proper citations into a final report

The spawned sub-agents conduct web searches with Tavily, fetching full webpage content for analysis.

### Key concepts

This tutorial covers:

* [Subagents](/oss/javascript/deepagents/subagents) for parallel, context-isolated research
* Custom [tools](/oss/javascript/langchain/tools) for web search
* Multi-step planning with the opt-in [planning tool](/oss/javascript/deepagents/overview#task-planning)

## Prerequisites

API keys for:

* Anthropic (Claude) or Google (Gemini)
* [Tavily](https://www.tavily.com/) for web search (optional; free tier is sufficient)
* [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-deep-research) for tracing (optional if you are using the SDK; required for Managed Deep Agents)

## Choose your path

This guide shows how to build this agenet with [Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview) and the Deep Agnets SDK. Managed Deep Agents laets you deploy agents without having to manage infrastructure. The Deep Agents SDK, lets you have maximum flexibility while using the same Deep Agents harness and you can host agents yourself, or run a custom [LangSmith Deployment](/langsmith/deployment).

**Managed Deep Agents**

> [!NOTE]
>
> Managed Deep Agents is in **public [beta](/langsmith/release-stages)** on [LangSmith Cloud](/langsmith/cloud).

### Setup

To follow along, you need:

* Node.js and npm.

* An API key for your model provider of choice.

**1. Create the project**

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx managed-deepagents init deep-research
cd deep-research
```

```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pnpm dlx managed-deepagents init deep-research
cd deep-research
```

```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bunx managed-deepagents init deep-research
cd deep-research
```

**2. Add API keys**

Add your model provider key, Tavily key, and LangSmith API key to `.env`:

**Claude**

```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ANTHROPIC_API_KEY=<ANTHROPIC_API_KEY>
TAVILY_API_KEY=<TAVILY_API_KEY>
LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
```

**Gemini**

```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
GOOGLE_API_KEY=<GOOGLE_API_KEY>
TAVILY_API_KEY=<TAVILY_API_KEY>
LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
```

> [!WARNING]
>
> Do not commit the `.env` file into version control. It contains secrets.

**3. Install search dependencies**

No extra packages are required for the search tool in this tutorial. It uses the built-in `fetch` API and the Tavily HTTP endpoint.

### Build the agent

**1. Add tools**

Create a custom search tool. The `tavily_search` tool uses Tavily for URL discovery, then fetches full webpage content so the agent can analyze complete sources instead of summaries.

Create `tools/search.ts`:

```ts tools/search.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import { z } from "zod";

async function fetchWebpageContent(
  url: string,
  timeout = 10_000,
): Promise<string> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!response.ok) {
      return `Error fetching ${url}: HTTP ${response.status}`;
    }
    return await response.text();
  } catch (e) {
    return `Error fetching ${url}: ${e}`;
  }
}

export const tavilySearch = tool(
  async ({
    query,
    maxResults = 1,
    topic = "general",
  }: {
    query: string;
    maxResults?: number;
    topic?: "general" | "news" | "finance";
  }) => {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({ query, max_results: maxResults, topic }),
    });
    const data = (await response.json()) as {
      results: Array<{ url: string; title: string }>;
    };
    const results = data.results ?? [];
    const resultTexts: string[] = [];
    for (const result of results) {
      const content = await fetchWebpageContent(result.url);
      resultTexts.push(
        `## ${result.title}\n**URL:** ${result.url}\n\n${content}\n---`,
      );
    }
    return (
      `Found ${resultTexts.length} result(s) for '${query}':\n\n` +
      resultTexts.join("\n")
    );
  },
  {
    name: "tavily_search",
    description:
      "Search the web for information on a given query. Uses Tavily to discover relevant URLs, then fetches and returns full webpage content.",
    schema: z.object({
      query: z.string().describe("Search query to execute"),
      maxResults: z
        .number()
        .optional()
        .default(1)
        .describe("Maximum number of results to return (default: 1)"),
      topic: z
        .enum(["general", "news", "finance"])
        .optional()
        .default("general")
        .describe(
          "Topic filter - 'general', 'news', or 'finance' (default: 'general')",
        ),
    }),
  },
);
```

**2. Add orchestrator instructions**

Put the research workflow and sub-agent coordination guidance in `instructions.md`. Managed Deep Agents loads this file as the orchestrator system prompt:

```markdown instructions.md expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Research Workflow

Follow this workflow for all research requests:

1. **Plan**: Create a todo list with write_todos to break down the research into focused tasks
2. **Save the request**: Use write_file() to save the user's research question to `/research_request.md`
3. **Research**: Delegate research tasks to sub-agents using the task() tool - ALWAYS use sub-agents for research, never conduct research yourself
4. **Synthesize**: Review all sub-agent findings and consolidate citations (each unique URL gets one number across all findings)
5. **Write Report**: Write a comprehensive final report to `/final_report.md` (see Report Writing Guidelines below)
6. **Verify**: Read `/research_request.md` and confirm you've addressed all aspects with proper citations and structure

## Research Planning Guidelines
- Batch similar research tasks into a single TODO to minimize overhead
- For simple fact-finding questions, use 1 sub-agent
- For comparisons or multi-faceted topics, delegate to multiple parallel sub-agents
- Each sub-agent should research one specific aspect and return findings

## Report Writing Guidelines

When writing the final report to `/final_report.md`, follow these structure patterns:

**For comparisons:**
1. Introduction
2. Overview of topic A
3. Overview of topic B
4. Detailed comparison
5. Conclusion

**For lists/rankings:**
Simply list items with details - no introduction needed:
1. Item 1 with explanation
2. Item 2 with explanation
3. Item 3 with explanation

**For summaries/overviews:**
1. Overview of topic
2. Key concept 1
3. Key concept 2
4. Key concept 3
5. Conclusion

**General guidelines:**
- Use clear section headings (## for sections, ### for subsections)
- Write in paragraph form by default - be text-heavy, not just bullet points
- Do NOT use self-referential language ("I found...", "I researched...")
- Write as a professional report without meta-commentary
- Each section should be comprehensive and detailed
- Use bullet points only when listing is more appropriate than prose

**Citation format:**
- Cite sources inline using [1], [2], [3] format
- Assign each unique URL a single citation number across ALL sub-agent findings
- End report with ### Sources section listing each numbered source
- Number sources sequentially without gaps (1,2,3,4...)
- Format: [1] Source Title: URL (each on separate line for proper list rendering)
- Example:

 Some important finding [1]. Another key insight [2].

 ### Sources
 [1] AI Research Paper: https://example.com/paper
 [2] Industry Analysis: https://example.com/analysis

# Sub-Agent Research Coordination

Your role is to coordinate research by delegating tasks from your TODO list to specialized research sub-agents.

## Delegation Strategy

**DEFAULT: Start with 1 sub-agent** for most queries:
- "What is quantum computing?" -> 1 sub-agent (general overview)
- "List the top 10 coffee shops in San Francisco" -> 1 sub-agent
- "Summarize the history of the internet" -> 1 sub-agent
- "Research context engineering for AI agents" -> 1 sub-agent (covers all aspects)

**ONLY parallelize when the query EXPLICITLY requires comparison or has clearly independent aspects:**

**Explicit comparisons** -> 1 sub-agent per element:
- "Compare OpenAI vs Anthropic vs DeepMind AI safety approaches" -> 3 parallel sub-agents
- "Compare Python vs JavaScript for web development" -> 2 parallel sub-agents

**Clearly separated aspects** -> 1 sub-agent per aspect (use sparingly):
- "Research renewable energy adoption in Europe, Asia, and North America" -> 3 parallel sub-agents (geographic separation)
- Only use this pattern when aspects cannot be covered efficiently by a single comprehensive search

## Key Principles
- **Bias towards single sub-agent**: One comprehensive research task is more token-efficient than multiple narrow ones
- **Avoid premature decomposition**: Don't break "research X" into "research X overview", "research X techniques", "research X applications" - just use 1 sub-agent for all of X
- **Parallelize only for clear comparisons**: Use multiple sub-agents when comparing distinct entities or geographically separated data

## Parallel Execution Limits
- Use at most 3 parallel sub-agents per iteration
- Make multiple task() calls in a single response to enable parallel execution
- Each sub-agent returns findings independently

## Research Limits
- Stop after 3 delegation rounds if you haven't found adequate sources
- Stop when you have sufficient information to answer comprehensively
- Bias towards focused research over exhaustive exploration
```

When you deploy, Managed Deep Agents syncs these instructions to [Context Hub](/langsmith/javascript/managed-deep-agents-context-hub).

**3. Create the agent**

You just put the main agent's instructions in `instructions.md`. Replace the scaffolded agent entry with the full file below. It sets the model, tools, the research sub-agent (including that sub-agent's own prompt), and [`TodoListMiddleware`](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware) so the agent can call `write_todos` for [task planning](/oss/javascript/deepagents/overview#task-planning). `name` is required: MDA uses it as the LangGraph assistant ID and the default deployment name.

Replace `agent.ts`. Choose your provider:

**Claude**

```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineDeepAgent } from "managed-deepagents";
import { todoListMiddleware } from "langchain";

import { tavilySearch } from "./tools/search";

const currentDate = new Date().toISOString().split("T")[0];

const RESEARCHER_INSTRUCTIONS = `You are a research assistant conducting research on the user's input topic. For context, today's date is {date}.

Your job is to use tools to gather information about the user's input topic.
You can use the tavily_search tool to find resources that can help answer the research question.
You can call it in series or in parallel, your research is conducted in a tool-calling loop.

You have access to the tavily_search tool for conducting web searches.

Think like a human researcher with limited time. Follow these steps:

1. **Read the question carefully** - What specific information does the user need?
2. **Start with broader searches** - Use broad, comprehensive queries first
3. **After each search, pause and assess** - Do I have enough to answer? What's still missing?
4. **Execute narrower searches as you gather information** - Fill in the gaps
5. **Stop when you can answer confidently** - Don't keep searching for perfection

**Tool Call Budgets** (Prevent excessive searching):
- **Simple queries**: Use 2-3 search tool calls maximum
- **Complex queries**: Use up to 5 search tool calls maximum
- **Always stop**: After 5 search tool calls if you cannot find the right sources

**Stop Immediately When**:
- You can answer the user's question comprehensively
- You have 3+ relevant examples/sources for the question
- Your last 2 searches returned similar information

After each search, assess results before continuing: What key information did I find? What's missing? Do I have enough to answer? Should I search more or provide my answer?

When providing your findings back to the orchestrator:

1. **Structure your response**: Organize findings with clear headings and detailed explanations
2. **Cite sources inline**: Use [1], [2], [3] format when referencing information from your searches
3. **Include Sources section**: End with ### Sources listing each numbered source with title and URL

The orchestrator will consolidate citations from all sub-agents into the final report.
`;

const researchSubAgent = {
  name: "research-agent",
  description: "Delegate research to the sub-agent. Give one topic at a time.",
  systemPrompt: RESEARCHER_INSTRUCTIONS.replace("{date}", currentDate),
  tools: [tavilySearch],
};

export const agent = defineDeepAgent({
  name: "deep-research",
  model: "anthropic:claude-sonnet-4-5-20250929",
  tools: [tavilySearch],
  subagents: [researchSubAgent],
  middleware: [todoListMiddleware()],
});
```

**Gemini**

```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineDeepAgent } from "managed-deepagents";
import { todoListMiddleware } from "langchain";

import { tavilySearch } from "./tools/search";

const currentDate = new Date().toISOString().split("T")[0];

const RESEARCHER_INSTRUCTIONS = `You are a research assistant conducting research on the user's input topic. For context, today's date is {date}.

Your job is to use tools to gather information about the user's input topic.
You can use the tavily_search tool to find resources that can help answer the research question.
You can call it in series or in parallel, your research is conducted in a tool-calling loop.

You have access to the tavily_search tool for conducting web searches.

Think like a human researcher with limited time. Follow these steps:

1. **Read the question carefully** - What specific information does the user need?
2. **Start with broader searches** - Use broad, comprehensive queries first
3. **After each search, pause and assess** - Do I have enough to answer? What's still missing?
4. **Execute narrower searches as you gather information** - Fill in the gaps
5. **Stop when you can answer confidently** - Don't keep searching for perfection

**Tool Call Budgets** (Prevent excessive searching):
- **Simple queries**: Use 2-3 search tool calls maximum
- **Complex queries**: Use up to 5 search tool calls maximum
- **Always stop**: After 5 search tool calls if you cannot find the right sources

**Stop Immediately When**:
- You can answer the user's question comprehensively
- You have 3+ relevant examples/sources for the question
- Your last 2 searches returned similar information

After each search, assess results before continuing: What key information did I find? What's missing? Do I have enough to answer? Should I search more or provide my answer?

When providing your findings back to the orchestrator:

1. **Structure your response**: Organize findings with clear headings and detailed explanations
2. **Cite sources inline**: Use [1], [2], [3] format when referencing information from your searches
3. **Include Sources section**: End with ### Sources listing each numbered source with title and URL

The orchestrator will consolidate citations from all sub-agents into the final report.
`;

const researchSubAgent = {
  name: "research-agent",
  description: "Delegate research to the sub-agent. Give one topic at a time.",
  systemPrompt: RESEARCHER_INSTRUCTIONS.replace("{date}", currentDate),
  tools: [tavilySearch],
};

export const agent = defineDeepAgent({
  name: "deep-research",
  model: "google:gemini-3-pro-preview",
  tools: [tavilySearch],
  subagents: [researchSubAgent],
  middleware: [todoListMiddleware()],
});
```

### Run the agent

**1. Run locally**

Install dependencies and start the agent:

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

`mda dev` loads API keys from `.env`, starts a local Agent Server, and opens the agent in LangSmith Studio.

In Studio, send a research question such as:

```txt wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Compare the main approaches to context engineering for AI agents in 2025.
```

You should see the orchestrator plan with `write_todos`, delegate to the research sub-agent, and write a report. For more information, see [Develop locally with LangSmith Studio](/langsmith/javascript/managed-deep-agents-local-development).

**2. Deploy (optional)**

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx mda deploy
```

```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pnpm exec mda deploy
```

```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bunx mda deploy
```

On success, the CLI prints the deployment dashboard URL. See [Deploy](/langsmith/javascript/managed-deep-agents-deploy).

**Deep Agents SDK**

### Setup

**1. Create project directory**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
mkdir deep-research-agent
cd deep-research-agent
```

**2. Install dependencies**

**Claude**

```bash npm wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install deepagents langchain @langchain/anthropic @langchain/core zod tsx
```

**Gemini**

```bash npm wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install deepagents langchain @langchain/google @langchain/core zod tsx
```

**3. Set API keys**

**Claude**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export ANTHROPIC_API_KEY="your_anthropic_api_key"
export TAVILY_API_KEY="your_tavily_api_key"
export LANGSMITH_API_KEY="your_langsmith_api_key"   # Optional
```

**Gemini**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export GOOGLE_API_KEY="your_google_api_key"
export TAVILY_API_KEY="your_tavily_api_key"
export LANGSMITH_API_KEY="your_langsmith_api_key"   # Optional
```

### Build the agent

Create `agent.ts` in your project directory:

**1. Add tools**

Add the custom search tool. The `tavily_search` tool uses Tavily for URL discovery, then fetches full webpage content so the agent can analyze complete sources instead of summaries.

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import { z } from "zod";

async function fetchWebpageContent(
  url: string,
  timeout = 10_000,
): Promise<string> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!response.ok) {
      return `Error fetching ${url}: HTTP ${response.status}`;
    }
    return await response.text();
  } catch (e) {
    return `Error fetching ${url}: ${e}`;
  }
}

const tavilySearch = tool(
  async ({
    query,
    maxResults = 1,
    topic = "general",
  }: {
    query: string;
    maxResults?: number;
    topic?: "general" | "news" | "finance";
  }) => {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({ query, max_results: maxResults, topic }),
    });
    const data = (await response.json()) as {
      results: Array<{ url: string; title: string }>;
    };
    const results = data.results ?? [];
    const resultTexts: string[] = [];
    for (const result of results) {
      const content = await fetchWebpageContent(result.url);
      resultTexts.push(
        `## ${result.title}\n**URL:** ${result.url}\n\n${content}\n---`,
      );
    }
    return (
      `Found ${resultTexts.length} result(s) for '${query}':\n\n` +
      resultTexts.join("\n")
    );
  },
  {
    name: "tavily_search",
    description:
      "Search the web for information on a given query. Uses Tavily to discover relevant URLs, then fetches and returns full webpage content.",
    schema: z.object({
      query: z.string().describe("Search query to execute"),
      maxResults: z
        .number()
        .optional()
        .default(1)
        .describe("Maximum number of results to return (default: 1)"),
      topic: z
        .enum(["general", "news", "finance"])
        .optional()
        .default("general")
        .describe(
          "Topic filter - 'general', 'news', or 'finance' (default: 'general')",
        ),
    }),
  },
);
```

**2. Create the agent**

Below the tools, add the prompt constants and then create the agent. The three constants (`RESEARCH_WORKFLOW_INSTRUCTIONS`, `RESEARCHER_INSTRUCTIONS`, and `SUBAGENT_DELEGATION_INSTRUCTIONS`) must live in the same file as the `create_deep_agent` / `createDeepAgent` call. [`TodoListMiddleware`](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware) is opt-in [task planning](/oss/javascript/deepagents/overview#task-planning) so the agent can call `write_todos`.

Add the prompts to `agent.ts`:

```ts expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const RESEARCH_WORKFLOW_INSTRUCTIONS = `# Research Workflow

Follow this workflow for all research requests:

1. **Plan**: Create a todo list with write_todos to break down the research into focused tasks
2. **Save the request**: Use write_file() to save the user's research question to \`/research_request.md\`
3. **Research**: Delegate research tasks to sub-agents using the task() tool - ALWAYS use sub-agents for research, never conduct research yourself
4. **Synthesize**: Review all sub-agent findings and consolidate citations (each unique URL gets one number across all findings)
5. **Write Report**: Write a comprehensive final report to \`/final_report.md\` (see Report Writing Guidelines below)
6. **Verify**: Read \`/research_request.md\` and confirm you've addressed all aspects with proper citations and structure

## Research Planning Guidelines
- Batch similar research tasks into a single TODO to minimize overhead
- For simple fact-finding questions, use 1 sub-agent
- For comparisons or multi-faceted topics, delegate to multiple parallel sub-agents
- Each sub-agent should research one specific aspect and return findings

## Report Writing Guidelines

When writing the final report to \`/final_report.md\`, follow these structure patterns:

**For comparisons:**
1. Introduction
2. Overview of topic A
3. Overview of topic B
4. Detailed comparison
5. Conclusion

**For lists/rankings:**
Simply list items with details - no introduction needed:
1. Item 1 with explanation
2. Item 2 with explanation
3. Item 3 with explanation

**For summaries/overviews:**
1. Overview of topic
2. Key concept 1
3. Key concept 2
4. Key concept 3
5. Conclusion

**General guidelines:**
- Use clear section headings (## for sections, ### for subsections)
- Write in paragraph form by default - be text-heavy, not just bullet points
- Do NOT use self-referential language ("I found...", "I researched...")
- Write as a professional report without meta-commentary
- Each section should be comprehensive and detailed
- Use bullet points only when listing is more appropriate than prose

**Citation format:**
- Cite sources inline using [1], [2], [3] format
- Assign each unique URL a single citation number across ALL sub-agent findings
- End report with ### Sources section listing each numbered source
- Number sources sequentially without gaps (1,2,3,4...)
- Format: [1] Source Title: URL (each on separate line for proper list rendering)
- Example:

 Some important finding [1]. Another key insight [2].

 ### Sources
 [1] AI Research Paper: https://example.com/paper
 [2] Industry Analysis: https://example.com/analysis
`;
```

```ts expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const RESEARCHER_INSTRUCTIONS = `You are a research assistant conducting research on the user's input topic. For context, today's date is {date}.

Your job is to use tools to gather information about the user's input topic.
You can use the tavily_search tool to find resources that can help answer the research question.
You can call it in series or in parallel, your research is conducted in a tool-calling loop.

You have access to the tavily_search tool for conducting web searches.

Think like a human researcher with limited time. Follow these steps:

1. **Read the question carefully** - What specific information does the user need?
2. **Start with broader searches** - Use broad, comprehensive queries first
3. **After each search, pause and assess** - Do I have enough to answer? What's still missing?
4. **Execute narrower searches as you gather information** - Fill in the gaps
5. **Stop when you can answer confidently** - Don't keep searching for perfection

**Tool Call Budgets** (Prevent excessive searching):
- **Simple queries**: Use 2-3 search tool calls maximum
- **Complex queries**: Use up to 5 search tool calls maximum
- **Always stop**: After 5 search tool calls if you cannot find the right sources

**Stop Immediately When**:
- You can answer the user's question comprehensively
- You have 3+ relevant examples/sources for the question
- Your last 2 searches returned similar information

After each search, assess results before continuing: What key information did I find? What's missing? Do I have enough to answer? Should I search more or provide my answer?

When providing your findings back to the orchestrator:

1. **Structure your response**: Organize findings with clear headings and detailed explanations
2. **Cite sources inline**: Use [1], [2], [3] format when referencing information from your searches
3. **Include Sources section**: End with ### Sources listing each numbered source with title and URL

Example:
## Key Findings
Context engineering is a critical technique for AI agents [1]. Studies show that proper context management can improve performance by 40% [2].

### Sources
[1] Context Engineering Guide: https://example.com/context-guide
[2] AI Performance Study: https://example.com/study

The orchestrator will consolidate citations from all sub-agents into the final report.
`;
```

```ts expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const SUBAGENT_DELEGATION_INSTRUCTIONS = `# Sub-Agent Research Coordination

Your role is to coordinate research by delegating tasks from your TODO list to specialized research sub-agents.

## Delegation Strategy

**DEFAULT: Start with 1 sub-agent** for most queries:
- "What is quantum computing?" -> 1 sub-agent (general overview)
- "List the top 10 coffee shops in San Francisco" -> 1 sub-agent
- "Summarize the history of the internet" -> 1 sub-agent
- "Research context engineering for AI agents" -> 1 sub-agent (covers all aspects)

**ONLY parallelize when the query EXPLICITLY requires comparison or has clearly independent aspects:**

**Explicit comparisons** -> 1 sub-agent per element:
- "Compare OpenAI vs Anthropic vs DeepMind AI safety approaches" -> 3 parallel sub-agents
- "Compare Python vs JavaScript for web development" -> 2 parallel sub-agents

**Clearly separated aspects** -> 1 sub-agent per aspect (use sparingly):
- "Research renewable energy adoption in Europe, Asia, and North America" -> 3 parallel sub-agents (geographic separation)
- Only use this pattern when aspects cannot be covered efficiently by a single comprehensive search

## Key Principles
- **Bias towards single sub-agent**: One comprehensive research task is more token-efficient than multiple narrow ones
- **Avoid premature decomposition**: Don't break "research X" into "research X overview", "research X techniques", "research X applications" - just use 1 sub-agent for all of X
- **Parallelize only for clear comparisons**: Use multiple sub-agents when comparing distinct entities or geographically separated data

## Parallel Execution Limits
- Use at most {maxConcurrentResearchUnits} parallel sub-agents per iteration
- Make multiple task() calls in a single response to enable parallel execution
- Each sub-agent returns findings independently

## Research Limits
- Stop after {maxResearcherIterations} delegation rounds if you haven't found adequate sources
- Stop when you have sufficient information to answer comprehensively
- Bias towards focused research over exhaustive exploration`;
```

Then add the model and agent. Choose your provider:

**Claude**

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent } from "deepagents";
import { ChatAnthropic } from "@langchain/anthropic";
import { todoListMiddleware } from "langchain";

const maxConcurrentResearchUnits = 3;
const maxResearcherIterations = 3;

const currentDate = new Date().toISOString().split("T")[0];

const INSTRUCTIONS =
  RESEARCH_WORKFLOW_INSTRUCTIONS +
  "\n\n" +
  "=".repeat(80) +
  "\n\n" +
  SUBAGENT_DELEGATION_INSTRUCTIONS.replace(
    "{maxConcurrentResearchUnits}",
    String(maxConcurrentResearchUnits),
  ).replace("{maxResearcherIterations}", String(maxResearcherIterations));

const researchSubAgent = {
  name: "research-agent",
  description: "Delegate research to the sub-agent. Give one topic at a time.",
  systemPrompt: RESEARCHER_INSTRUCTIONS.replace("{date}", currentDate),
  tools: [tavilySearch],
};

const model = new ChatAnthropic({
  model: "claude-sonnet-4-5-20250929",
  temperature: 0,
});

const agent = createDeepAgent({
  model,
  tools: [tavilySearch],
  systemPrompt: INSTRUCTIONS,
  subagents: [researchSubAgent],
  middleware: [todoListMiddleware()],
});
```

**Gemini**

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent } from "deepagents";
import { ChatGoogle } from "@langchain/google/node";
import { todoListMiddleware } from "langchain";

const maxConcurrentResearchUnits = 3;
const maxResearcherIterations = 3;

const currentDate = new Date().toISOString().split("T")[0];

const INSTRUCTIONS =
  RESEARCH_WORKFLOW_INSTRUCTIONS +
  "\n\n" +
  "=".repeat(80) +
  "\n\n" +
  SUBAGENT_DELEGATION_INSTRUCTIONS.replace(
    "{maxConcurrentResearchUnits}",
    String(maxConcurrentResearchUnits),
  ).replace("{maxResearcherIterations}", String(maxResearcherIterations));

const researchSubAgent = {
  name: "research-agent",
  description: "Delegate research to the sub-agent. Give one topic at a time.",
  systemPrompt: RESEARCHER_INSTRUCTIONS.replace("{date}", currentDate),
  tools: [tavilySearch],
};

const model = new ChatGoogle({
  model: "gemini-3-pro-preview",
  temperature: 0,
});

const agent = createDeepAgent({
  model,
  tools: [tavilySearch],
  systemPrompt: INSTRUCTIONS,
  subagents: [researchSubAgent],
  middleware: [todoListMiddleware()],
});
```

### Run the agent

You can run the agent synchronously, meaning it will wait for the full result and then print it, or you can stream updates as they come in.

Add the code from the respective tab at the bottom of `agent.ts`:

**Run synchronously**

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
async function main() {
  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content:
          "What are the main differences between RAG and fine-tuning for LLM applications?",
      },
    ],
  });

  for (const msg of result.messages ?? []) {
    if (msg.content) {
      console.log(msg.content);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
```

**Stream updates**

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
async function main() {
  const stream = await agent.streamEvents(
    {
      messages: [
        {
          role: "user",
          content: "Compare Python vs JavaScript for web development",
        },
      ],
    },
    { version: "v3" },
  );

  for await (const message of stream.messages) {
    process.stdout.write(await message.text);
  }

  await stream.output;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
```

Run the agent from the project root:

```sh theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx tsx agent.ts
```

If you set the `LANGSMITH_API_KEY` environment variable before running, you can view the agent's traces in [LangSmith](/langsmith/observability) to debug and monitor multi-step behavior.

### Full code

View the complete [Deep Research example](https://github.com/langchain-ai/deepagents/tree/main/examples/deep_research) on GitHub.

## Next steps

Now that you've built the agent, customize the workflow by editing the orchestrator instructions (Managed Deep Agents: `instructions.md`; SDK: prompt constants in your agent file). You can also tune the delegation limits to allow more parallel sub-agents or delegation rounds.

For more information on the concepts in this tutorial, see:

* [Subagents](/oss/javascript/deepagents/subagents): Configure subagents with different tools and prompts
* [Customization](/oss/javascript/deepagents/customization): Customize models, tools, system prompts, and optional [task planning](/oss/javascript/deepagents/overview#task-planning)
* [Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview): Build deep agents with managed deployment infrastructure
* [LangSmith](/langsmith/observability): Trace research runs and debug multi-step behavior
* [Deep Research Course](https://academy.langchain.com/courses/deep-research-with-langgraph): Full course on deep research with LangGraph

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/deep-research.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).