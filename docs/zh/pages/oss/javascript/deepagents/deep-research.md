<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a deep research agent | https://docs.langchain.com/oss/javascript/deepagents/deep-research -->

# 构建深度研究代理

使用托管 Deep Agents 或 Deep Agents SDK 构建具有子代理委托的多步骤网络研究代理

## 概述

本指南展示了如何使用 [Deep Agents](/oss/javascript/deepagents) 构建多步骤网络研究代理。该代理将研究问题分解为重点任务，将其委托给专门的子代理，并将研究结果综合成一份综合报告。

您构建的代理将：

1. 使用选择加入待办事项列表中间件来计划研究
2. 将重点研究任务委托给具有孤立上下文的子代理
3. 收集信息时评估搜索结果并计划后续步骤
4. 将研究结果与适当的引用综合成最终报告

生成的子代理使用 Tavily 进行网络搜索，获取完整的网页内容进行分析。

### 关键概念

本教程涵盖：

* [Subagents](/oss/javascript/deepagents/subagents) 用于并行、上下文隔离的研究
* 自定义[tools](/oss/javascript/langchain/tools)用于网络搜索
* 可选择加入[planning tool](/oss/javascript/deepagents/overview#task-planning)进行多步骤规划

## 先决条件

API 密钥用于：

* Anthropic (克劳德) 或谷歌 (双子座)
* [Tavily](https://www.tavily.com/) 用于网络搜索（可选；免费套餐就足够了）
* [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-deep-research) 用于跟踪（如果您使用 SDK，则可选；对于托管 Deep Agents 是必需的）

## 选择你的路径本指南展示了如何使用 [Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview) 和 Deep Agnets SDK 构建此agenet。托管Deep Agents让您无需管理基础设施即可部署代理。 Deep Agents SDK 可让您在使用相同的 Deep Agents 工具时获得最大的灵活性，并且您可以自己托管代理，或运行自定义 [Agent Server](/langsmith/deployment)。

> [选项卡] 托管 Deep Agents
>
>> [!注意]
>>
>> 托管 Deep Agents 在 [LangSmith Cloud](/langsmith/cloud) 和 [Bring Your Own Cloud (BYOC)](/langsmith/byoc) **公开 [beta](/langsmith/release-stages)**。使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。
>
> ### 设置
>
> 要继续操作，您需要：
>
> * Node.js 和 npm。
>
> * 您选择的模型提供商的 API 密钥。
>
> **1。创建项目**
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npx managed-deepagents init deep-research
> cd deep-research
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm dlx managed-deepagents init deep-research
> cd deep-research
> ```
>
> ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> bunx managed-deepagents init deep-research
> cd deep-research
> ```
>
> **2。添加 API 密钥**
>
> 将您的模型提供商密钥、Tavily 密钥和 LangSmith API 密钥添加到 `.env`：
>
>> [标签] 克劳德
>>
>> ```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > ANTHROPIC_API_KEY=<ANTHROPIC_API_KEY>
> > TAVILY_API_KEY=<TAVILY_API_KEY>
> > LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
> > ```
>
>> [选项卡] 双子座
>>
>> ```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > GOOGLE_API_KEY=<GOOGLE_API_KEY>
> > TAVILY_API_KEY=<TAVILY_API_KEY>
> > LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
> > ```
>
>> [!警告]
>>
>> 不要将 `.env` 文件提交到版本控制中。它包含秘密。
>
> **3。安装搜索依赖项**
>
> 本教程中的搜索工具不需要额外的软件包。它使用内置的 `fetch` API 和 Tavily HTTP 端点。
>
> ### 构建代理
>
> **1。添加工具**
>> 创建自定义搜索工具。 `tavily_search` 工具使用 Tavily 进行 URL 发现，然后获取完整的网页内容，以便代理可以分析完整的源而不是摘要。
>
> 创建`tools/search.ts`：
>
> ```ts tools/search.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { tool } from "langchain";
> import { z } from "zod";
>
> async function fetchWebpageContent(
>   url: string,
>   timeout = 10_000,
> ): Promise<string> {
>   try {
>     const controller = new AbortController();
>     const id = setTimeout(() => controller.abort(), timeout);
>     const response = await fetch(url, {
>       headers: {
>         "User-Agent":
>           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
>       },
>       signal: controller.signal,
>     });
>     clearTimeout(id);
>     if (!response.ok) {
>       return `Error fetching ${url}: HTTP ${response.status}`;
>     }
>     return await response.text();
>   } catch (e) {
>     return `Error fetching ${url}: ${e}`;
>   }
> }
>
> export const tavilySearch = tool(
>   async ({
>     query,
>     maxResults = 1,
>     topic = "general",
>   }: {
>     query: string;
>     maxResults?: number;
>     topic?: "general" | "news" | "finance";
>   }) => {
>     const response = await fetch("https://api.tavily.com/search", {
>       method: "POST",
>       headers: {
>         "Content-Type": "application/json",
>         Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
>       },
>       body: JSON.stringify({ query, max_results: maxResults, topic }),
>     });
>     const data = (await response.json()) as {
>       results: Array<{ url: string; title: string }>;
>     };
>     const results = data.results ?? [];
>     const resultTexts: string[] = [];
>     for (const result of results) {
>       const content = await fetchWebpageContent(result.url);
>       resultTexts.push(
>         `## ${result.title}\n**URL:** ${result.url}\n\n${content}\n---`,
>       );
>     }
>     return (
>       `Found ${resultTexts.length} result(s) for '${query}':\n\n` +
>       resultTexts.join("\n")
>     );
>   },
>   {
>     name: "tavily_search",
>     description:
>       "Search the web for information on a given query. Uses Tavily to discover relevant URLs, then fetches and returns full webpage content.",
>     schema: z.object({
>       query: z.string().describe("Search query to execute"),
>       maxResults: z
>         .number()
>         .optional()
>         .default(1)
>         .describe("Maximum number of results to return (default: 1)"),
>       topic: z
>         .enum(["general", "news", "finance"])
>         .optional()
>         .default("general")
>         .describe(
>           "Topic filter - 'general', 'news', or 'finance' (default: 'general')",
>         ),
>     }),
>   },
> );
> ```
>
> **2。添加协调器指令**
>
> 将研究工作流程和子代理协调指导放入`instructions.md`。 Managed Deep Agents 加载此文件作为 Orchestrator 系统提示：
>
> ```markdown instructions.md expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> # Research Workflow
>
> Follow this workflow for all research requests:
>
> 1. **Plan**: Create a todo list with write_todos to break down the research into focused tasks
> 2. **Save the request**: Use write_file() to save the user's research question to `/research_request.md`
> 3. **Research**: Delegate research tasks to sub-agents using the task() tool - ALWAYS use sub-agents for research, never conduct research yourself
> 4. **Synthesize**: Review all sub-agent findings and consolidate citations (each unique URL gets one number across all findings)
> 5. **Write Report**: Write a comprehensive final report to `/final_report.md` (see Report Writing Guidelines below)
> 6. **Verify**: Read `/research_request.md` and confirm you've addressed all aspects with proper citations and structure
>
> ## Research Planning Guidelines
> - Batch similar research tasks into a single TODO to minimize overhead
> - For simple fact-finding questions, use 1 sub-agent
> - For comparisons or multi-faceted topics, delegate to multiple parallel sub-agents
> - Each sub-agent should research one specific aspect and return findings
>
> ## Report Writing Guidelines
>
> When writing the final report to `/final_report.md`, follow these structure patterns:
>
> **For comparisons:**
> 1. Introduction
> 2. Overview of topic A
> 3. Overview of topic B
> 4. Detailed comparison
> 5. Conclusion
>
> **For lists/rankings:**
> Simply list items with details - no introduction needed:
> 1. Item 1 with explanation
> 2. Item 2 with explanation
> 3. Item 3 with explanation
>
> **For summaries/overviews:**
> 1. Overview of topic
> 2. Key concept 1
> 3. Key concept 2
> 4. Key concept 3
> 5. Conclusion
>
> **General guidelines:**
> - Use clear section headings (## for sections, ### for subsections)
> - Write in paragraph form by default - be text-heavy, not just bullet points
> - Do NOT use self-referential language ("I found...", "I researched...")
> - Write as a professional report without meta-commentary
> - Each section should be comprehensive and detailed
> - Use bullet points only when listing is more appropriate than prose
>
> **Citation format:**
> - Cite sources inline using [1], [2], [3] format
> - Assign each unique URL a single citation number across ALL sub-agent findings
> - End report with ### Sources section listing each numbered source
> - Number sources sequentially without gaps (1,2,3,4...)
> - Format: [1] Source Title: URL (each on separate line for proper list rendering)
> - Example:
>
>  Some important finding [1]. Another key insight [2].
>
>  ### Sources
>  [1] AI Research Paper: https://example.com/paper
>  [2] Industry Analysis: https://example.com/analysis
>
> # Sub-Agent Research Coordination
>
> Your role is to coordinate research by delegating tasks from your TODO list to specialized research sub-agents.
>
> ## Delegation Strategy
>
> **DEFAULT: Start with 1 sub-agent** for most queries:
> - "What is quantum computing?" -> 1 sub-agent (general overview)
> - "List the top 10 coffee shops in San Francisco" -> 1 sub-agent
> - "Summarize the history of the internet" -> 1 sub-agent
> - "Research context engineering for AI agents" -> 1 sub-agent (covers all aspects)
>
> **ONLY parallelize when the query EXPLICITLY requires comparison or has clearly independent aspects:**
>
> **Explicit comparisons** -> 1 sub-agent per element:
> - "Compare OpenAI vs Anthropic vs DeepMind AI safety approaches" -> 3 parallel sub-agents
> - "Compare Python vs JavaScript for web development" -> 2 parallel sub-agents
>
> **Clearly separated aspects** -> 1 sub-agent per aspect (use sparingly):
> - "Research renewable energy adoption in Europe, Asia, and North America" -> 3 parallel sub-agents (geographic separation)
> - Only use this pattern when aspects cannot be covered efficiently by a single comprehensive search
>
> ## Key Principles
> - **Bias towards single sub-agent**: One comprehensive research task is more token-efficient than multiple narrow ones
> - **Avoid premature decomposition**: Don't break "research X" into "research X overview", "research X techniques", "research X applications" - just use 1 sub-agent for all of X
> - **Parallelize only for clear comparisons**: Use multiple sub-agents when comparing distinct entities or geographically separated data
>
> ## Parallel Execution Limits
> - Use at most 3 parallel sub-agents per iteration
> - Make multiple task() calls in a single response to enable parallel execution
> - Each sub-agent returns findings independently
>
> ## Research Limits
> - Stop after 3 delegation rounds if you haven't found adequate sources
> - Stop when you have sufficient information to answer comprehensively
> - Bias towards focused research over exhaustive exploration
> ```
>
> 部署时，托管 Deep Agents 会将这些指令同步到 [Context Hub](/langsmith/javascript/managed-deep-agents-context-hub)。
>
> **3。创建代理**
>
> 你只需将主要特工的指令放入`instructions.md`即可。将脚手架代理条目替换为下面的完整文件。它设置模型、工具、研究子代理（包括子代理自己的提示）和[⟦T37⟧](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware)，以便代理可以为[task planning](/oss/javascript/deepagents/overview#task-planning)调用`write_todos`。 `name` 是必需的：MDA 将其用作 LangGraph 助手 ID 和默认部署名称。
>
> 更换`agent.ts`。选择您的提供商：
>
>> [标签] 克劳德
>>
>> ```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > import { defineDeepAgent } from "managed-deepagents";
> > import { todoListMiddleware } from "langchain";
> >
> > import { tavilySearch } from "./tools/search";
> >
> > const currentDate = new Date().toISOString().split("T")[0];
> >
> > const RESEARCHER_INSTRUCTIONS = `You are a research assistant conducting research on the user's input topic. For context, today's date is {date}.
> >
> > Your job is to use tools to gather information about the user's input topic.
> > You can use the tavily_search tool to find resources that can help answer the research question.
> > You can call it in series or in parallel, your research is conducted in a tool-calling loop.
> >
> > You have access to the tavily_search tool for conducting web searches.
> >
> > Think like a human researcher with limited time. Follow these steps:
> >
> > 1. **Read the question carefully** - What specific information does the user need?
> > 2. **Start with broader searches** - Use broad, comprehensive queries first
> > 3. **After each search, pause and assess** - Do I have enough to answer? What's still missing?
> > 4. **Execute narrower searches as you gather information** - Fill in the gaps
> > 5. **Stop when you can answer confidently** - Don't keep searching for perfection
> >
> > **Tool Call Budgets** (Prevent excessive searching):
> > - **Simple queries**: Use 2-3 search tool calls maximum
> > - **Complex queries**: Use up to 5 search tool calls maximum
> > - **Always stop**: After 5 search tool calls if you cannot find the right sources
> >
> > **Stop Immediately When**:
> > - You can answer the user's question comprehensively
> > - You have 3+ relevant examples/sources for the question
> > - Your last 2 searches returned similar information
> >
> > After each search, assess results before continuing: What key information did I find? What's missing? Do I have enough to answer? Should I search more or provide my answer?
> >
> > When providing your findings back to the orchestrator:
> >
> > 1. **Structure your response**: Organize findings with clear headings and detailed explanations
> > 2. **Cite sources inline**: Use [1], [2], [3] format when referencing information from your searches
> > 3. **Include Sources section**: End with ### Sources listing each numbered source with title and URL
> >
> > The orchestrator will consolidate citations from all sub-agents into the final report.
> > `;
> >
> > const researchSubAgent = {
> >   name: "research-agent",
> >   description: "Delegate research to the sub-agent. Give one topic at a time.",
> >   systemPrompt: RESEARCHER_INSTRUCTIONS.replace("{date}", currentDate),
> >   tools: [tavilySearch],
> > };
> >
> > export const agent = defineDeepAgent({
> >   name: "deep-research",
> >   model: "anthropic:claude-sonnet-4-5-20250929",
> >   tools: [tavilySearch],
> >   subagents: [researchSubAgent],
> >   middleware: [todoListMiddleware()],
> > });
> > ```
>
>> [选项卡] 双子座
>>
>> ```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > import { defineDeepAgent } from "managed-deepagents";
> > import { todoListMiddleware } from "langchain";
> >
> > import { tavilySearch } from "./tools/search";
> >
> > const currentDate = new Date().toISOString().split("T")[0];
> >
> > const RESEARCHER_INSTRUCTIONS = `You are a research assistant conducting research on the user's input topic. For context, today's date is {date}.
> >
> > Your job is to use tools to gather information about the user's input topic.
> > You can use the tavily_search tool to find resources that can help answer the research question.
> > You can call it in series or in parallel, your research is conducted in a tool-calling loop.
> >
> > You have access to the tavily_search tool for conducting web searches.
> >
> > Think like a human researcher with limited time. Follow these steps:
> >
> > 1. **Read the question carefully** - What specific information does the user need?
> > 2. **Start with broader searches** - Use broad, comprehensive queries first
> > 3. **After each search, pause and assess** - Do I have enough to answer? What's still missing?
> > 4. **Execute narrower searches as you gather information** - Fill in the gaps
> > 5. **Stop when you can answer confidently** - Don't keep searching for perfection
> >
> > **Tool Call Budgets** (Prevent excessive searching):
> > - **Simple queries**: Use 2-3 search tool calls maximum
> > - **Complex queries**: Use up to 5 search tool calls maximum
> > - **Always stop**: After 5 search tool calls if you cannot find the right sources
> >
> > **Stop Immediately When**:
> > - You can answer the user's question comprehensively
> > - You have 3+ relevant examples/sources for the question
> > - Your last 2 searches returned similar information
> >
> > After each search, assess results before continuing: What key information did I find? What's missing? Do I have enough to answer? Should I search more or provide my answer?
> >
> > When providing your findings back to the orchestrator:
> >
> > 1. **Structure your response**: Organize findings with clear headings and detailed explanations
> > 2. **Cite sources inline**: Use [1], [2], [3] format when referencing information from your searches
> > 3. **Include Sources section**: End with ### Sources listing each numbered source with title and URL
> >
> > The orchestrator will consolidate citations from all sub-agents into the final report.
> > `;
> >
> > const researchSubAgent = {
> >   name: "research-agent",
> >   description: "Delegate research to the sub-agent. Give one topic at a time.",
> >   systemPrompt: RESEARCHER_INSTRUCTIONS.replace("{date}", currentDate),
> >   tools: [tavilySearch],
> > };
> >
> > export const agent = defineDeepAgent({
> >   name: "deep-research",
> >   model: "google:gemini-3-pro-preview",
> >   tools: [tavilySearch],
> >   subagents: [researchSubAgent],
> >   middleware: [todoListMiddleware()],
> > });
> > ```
>
> ### 运行代理
>
> **1。本地运行**
>
> 安装依赖项并启动代理：
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install
> npx mda dev
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm install
> pnpm exec mda dev
> ```
>
> ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> bun install
> bunx mda dev
> ```
>
> `mda dev` 从 `.env` 加载 API 密钥，启动本地代理服务器，并在 LangSmith Studio 中打开代理。
>> 在 Studio 中，发送一个研究问题，例如：
>
> ```txt wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> Compare the main approaches to context engineering for AI agents in 2025.
> ```
>
> 您应该通过`write_todos`查看协调器计划，委托给研究子代理，并撰写报告。欲了解更多信息，请参阅[Develop locally with LangSmith Studio](/langsmith/javascript/managed-deep-agents-local-development)。
>
> **2。部署（可选）**
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npx mda deploy
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm exec mda deploy
> ```
>
> ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> bunx mda deploy
> ```
>
> 成功后，CLI 将打印部署仪表板 URL。参见[Deploy](/langsmith/javascript/managed-deep-agents-deploy)。

> [标签] Deep Agents SDK
>
> ### 设置
>
> **1。创建项目目录**
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> mkdir deep-research-agent
> cd deep-research-agent
> ```
>
> **2。安装依赖项**
>
>> [标签] 克劳德
>>
>> ```bash npm wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > npm install deepagents langchain @langchain/anthropic @langchain/core zod tsx
> > ```
>
>> [选项卡] 双子座
>>
>> ```bash npm wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > npm install deepagents langchain @langchain/google @langchain/core zod tsx
> > ```
>
> **3。设置 API 密钥**
>
>> [标签] 克劳德
>>
>> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > export ANTHROPIC_API_KEY="your_anthropic_api_key"
> > export TAVILY_API_KEY="your_tavily_api_key"
> > export LANGSMITH_API_KEY="your_langsmith_api_key"   # Optional
> > ```
>
>> [选项卡] 双子座
>>
>> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > export GOOGLE_API_KEY="your_google_api_key"
> > export TAVILY_API_KEY="your_tavily_api_key"
> > export LANGSMITH_API_KEY="your_langsmith_api_key"   # Optional
> > ```
>
> ### 构建代理
>
> 在项目目录中创建`agent.ts`：
>
> **1。添加工具**
>
> 添加自定义搜索工具。 `tavily_search` 工具使用 Tavily 进行 URL 发现，然后获取完整的网页内容，以便代理可以分析完整的源而不是摘要。
>
> ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { tool } from "langchain";
> import { z } from "zod";
>
> async function fetchWebpageContent(
>   url: string,
>   timeout = 10_000,
> ): Promise<string> {
>   try {
>     const controller = new AbortController();
>     const id = setTimeout(() => controller.abort(), timeout);
>     const response = await fetch(url, {
>       headers: {
>         "User-Agent":
>           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
>       },
>       signal: controller.signal,
>     });
>     clearTimeout(id);
>     if (!response.ok) {
>       return `Error fetching ${url}: HTTP ${response.status}`;
>     }
>     return await response.text();
>   } catch (e) {
>     return `Error fetching ${url}: ${e}`;
>   }
> }
>
> const tavilySearch = tool(
>   async ({
>     query,
>     maxResults = 1,
>     topic = "general",
>   }: {
>     query: string;
>     maxResults?: number;
>     topic?: "general" | "news" | "finance";
>   }) => {
>     const response = await fetch("https://api.tavily.com/search", {
>       method: "POST",
>       headers: {
>         "Content-Type": "application/json",
>         Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
>       },
>       body: JSON.stringify({ query, max_results: maxResults, topic }),
>     });
>     const data = (await response.json()) as {
>       results: Array<{ url: string; title: string }>;
>     };
>     const results = data.results ?? [];
>     const resultTexts: string[] = [];
>     for (const result of results) {
>       const content = await fetchWebpageContent(result.url);
>       resultTexts.push(
>         `## ${result.title}\n**URL:** ${result.url}\n\n${content}\n---`,
>       );
>     }
>     return (
>       `Found ${resultTexts.length} result(s) for '${query}':\n\n` +
>       resultTexts.join("\n")
>     );
>   },
>   {
>     name: "tavily_search",
>     description:
>       "Search the web for information on a given query. Uses Tavily to discover relevant URLs, then fetches and returns full webpage content.",
>     schema: z.object({
>       query: z.string().describe("Search query to execute"),
>       maxResults: z
>         .number()
>         .optional()
>         .default(1)
>         .describe("Maximum number of results to return (default: 1)"),
>       topic: z
>         .enum(["general", "news", "finance"])
>         .optional()
>         .default("general")
>         .describe(
>           "Topic filter - 'general', 'news', or 'finance' (default: 'general')",
>         ),
>     }),
>   },
> );
> ```
>
> **2。创建代理**
>
> 在工具下方，添加提示常量，然后创建代理。三个常量（`RESEARCH_WORKFLOW_INSTRUCTIONS`、`RESEARCHER_INSTRUCTIONS` 和 `SUBAGENT_DELEGATION_INSTRUCTIONS`）必须与 `create_deep_agent` / `createDeepAgent` 调用位于同一文件中。 [⟦T51⟧](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware) 选择加入 [task planning](/oss/javascript/deepagents/overview#task-planning)，因此客服人员可以呼叫 `write_todos`。
>
> 在`agent.ts`添加提示：
>
> ```ts expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> const RESEARCH_WORKFLOW_INSTRUCTIONS = `# Research Workflow
>
> Follow this workflow for all research requests:
>
> 1. **Plan**: Create a todo list with write_todos to break down the research into focused tasks
> 2. **Save the request**: Use write_file() to save the user's research question to \`/research_request.md\`
> 3. **Research**: Delegate research tasks to sub-agents using the task() tool - ALWAYS use sub-agents for research, never conduct research yourself
> 4. **Synthesize**: Review all sub-agent findings and consolidate citations (each unique URL gets one number across all findings)
> 5. **Write Report**: Write a comprehensive final report to \`/final_report.md\` (see Report Writing Guidelines below)
> 6. **Verify**: Read \`/research_request.md\` and confirm you've addressed all aspects with proper citations and structure
>
> ## Research Planning Guidelines
> - Batch similar research tasks into a single TODO to minimize overhead
> - For simple fact-finding questions, use 1 sub-agent
> - For comparisons or multi-faceted topics, delegate to multiple parallel sub-agents
> - Each sub-agent should research one specific aspect and return findings
>
> ## Report Writing Guidelines
>
> When writing the final report to \`/final_report.md\`, follow these structure patterns:
>
> **For comparisons:**
> 1. Introduction
> 2. Overview of topic A
> 3. Overview of topic B
> 4. Detailed comparison
> 5. Conclusion
>
> **For lists/rankings:**
> Simply list items with details - no introduction needed:
> 1. Item 1 with explanation
> 2. Item 2 with explanation
> 3. Item 3 with explanation
>
> **For summaries/overviews:**
> 1. Overview of topic
> 2. Key concept 1
> 3. Key concept 2
> 4. Key concept 3
> 5. Conclusion
>
> **General guidelines:**
> - Use clear section headings (## for sections, ### for subsections)
> - Write in paragraph form by default - be text-heavy, not just bullet points
> - Do NOT use self-referential language ("I found...", "I researched...")
> - Write as a professional report without meta-commentary
> - Each section should be comprehensive and detailed
> - Use bullet points only when listing is more appropriate than prose
>
> **Citation format:**
> - Cite sources inline using [1], [2], [3] format
> - Assign each unique URL a single citation number across ALL sub-agent findings
> - End report with ### Sources section listing each numbered source
> - Number sources sequentially without gaps (1,2,3,4...)
> - Format: [1] Source Title: URL (each on separate line for proper list rendering)
> - Example:
>
>  Some important finding [1]. Another key insight [2].
>
>  ### Sources
>  [1] AI Research Paper: https://example.com/paper
>  [2] Industry Analysis: https://example.com/analysis
> `;
> ```
>
> ```ts expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> const RESEARCHER_INSTRUCTIONS = `You are a research assistant conducting research on the user's input topic. For context, today's date is {date}.
>
> Your job is to use tools to gather information about the user's input topic.
> You can use the tavily_search tool to find resources that can help answer the research question.
> You can call it in series or in parallel, your research is conducted in a tool-calling loop.
>
> You have access to the tavily_search tool for conducting web searches.
>
> Think like a human researcher with limited time. Follow these steps:
>
> 1. **Read the question carefully** - What specific information does the user need?
> 2. **Start with broader searches** - Use broad, comprehensive queries first
> 3. **After each search, pause and assess** - Do I have enough to answer? What's still missing?
> 4. **Execute narrower searches as you gather information** - Fill in the gaps
> 5. **Stop when you can answer confidently** - Don't keep searching for perfection
>
> **Tool Call Budgets** (Prevent excessive searching):
> - **Simple queries**: Use 2-3 search tool calls maximum
> - **Complex queries**: Use up to 5 search tool calls maximum
> - **Always stop**: After 5 search tool calls if you cannot find the right sources
>
> **Stop Immediately When**:
> - You can answer the user's question comprehensively
> - You have 3+ relevant examples/sources for the question
> - Your last 2 searches returned similar information
>
> After each search, assess results before continuing: What key information did I find? What's missing? Do I have enough to answer? Should I search more or provide my answer?
>
> When providing your findings back to the orchestrator:
>
> 1. **Structure your response**: Organize findings with clear headings and detailed explanations
> 2. **Cite sources inline**: Use [1], [2], [3] format when referencing information from your searches
> 3. **Include Sources section**: End with ### Sources listing each numbered source with title and URL
>
> Example:
> ## Key Findings
> Context engineering is a critical technique for AI agents [1]. Studies show that proper context management can improve performance by 40% [2].
>
> ### Sources
> [1] Context Engineering Guide: https://example.com/context-guide
> [2] AI Performance Study: https://example.com/study
>
> The orchestrator will consolidate citations from all sub-agents into the final report.
> `;
> ```
>
> ```ts expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> const SUBAGENT_DELEGATION_INSTRUCTIONS = `# Sub-Agent Research Coordination
>
> Your role is to coordinate research by delegating tasks from your TODO list to specialized research sub-agents.
>
> ## Delegation Strategy
>
> **DEFAULT: Start with 1 sub-agent** for most queries:
> - "What is quantum computing?" -> 1 sub-agent (general overview)
> - "List the top 10 coffee shops in San Francisco" -> 1 sub-agent
> - "Summarize the history of the internet" -> 1 sub-agent
> - "Research context engineering for AI agents" -> 1 sub-agent (covers all aspects)
>
> **ONLY parallelize when the query EXPLICITLY requires comparison or has clearly independent aspects:**
>
> **Explicit comparisons** -> 1 sub-agent per element:
> - "Compare OpenAI vs Anthropic vs DeepMind AI safety approaches" -> 3 parallel sub-agents
> - "Compare Python vs JavaScript for web development" -> 2 parallel sub-agents
>
> **Clearly separated aspects** -> 1 sub-agent per aspect (use sparingly):
> - "Research renewable energy adoption in Europe, Asia, and North America" -> 3 parallel sub-agents (geographic separation)
> - Only use this pattern when aspects cannot be covered efficiently by a single comprehensive search
>
> ## Key Principles
> - **Bias towards single sub-agent**: One comprehensive research task is more token-efficient than multiple narrow ones
> - **Avoid premature decomposition**: Don't break "research X" into "research X overview", "research X techniques", "research X applications" - just use 1 sub-agent for all of X
> - **Parallelize only for clear comparisons**: Use multiple sub-agents when comparing distinct entities or geographically separated data
>
> ## Parallel Execution Limits
> - Use at most {maxConcurrentResearchUnits} parallel sub-agents per iteration
> - Make multiple task() calls in a single response to enable parallel execution
> - Each sub-agent returns findings independently
>
> ## Research Limits
> - Stop after {maxResearcherIterations} delegation rounds if you haven't found adequate sources
> - Stop when you have sufficient information to answer comprehensively
> - Bias towards focused research over exhaustive exploration`;
> ```
>> 然后添加模型和代理。选择您的提供商：
>
>> [标签] 克劳德
>>
>> ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > import { createDeepAgent } from "deepagents";
> > import { ChatAnthropic } from "@langchain/anthropic";
> > import { todoListMiddleware } from "langchain";
> >
> > const maxConcurrentResearchUnits = 3;
> > const maxResearcherIterations = 3;
> >
> > const currentDate = new Date().toISOString().split("T")[0];
> >
> > const INSTRUCTIONS =
> >   RESEARCH_WORKFLOW_INSTRUCTIONS +
> >   "\n\n" +
> >   "=".repeat(80) +
> >   "\n\n" +
> >   SUBAGENT_DELEGATION_INSTRUCTIONS.replace(
> >     "{maxConcurrentResearchUnits}",
> >     String(maxConcurrentResearchUnits),
> >   ).replace("{maxResearcherIterations}", String(maxResearcherIterations));
> >
> > const researchSubAgent = {
> >   name: "research-agent",
> >   description: "Delegate research to the sub-agent. Give one topic at a time.",
> >   systemPrompt: RESEARCHER_INSTRUCTIONS.replace("{date}", currentDate),
> >   tools: [tavilySearch],
> > };
> >
> > const model = new ChatAnthropic({
> >   model: "claude-sonnet-4-5-20250929",
> >   temperature: 0,
> > });
> >
> > const agent = await createDeepAgent({
> >   model,
> >   tools: [tavilySearch],
> >   systemPrompt: INSTRUCTIONS,
> >   subagents: [researchSubAgent],
> >   middleware: [todoListMiddleware()],
> > });
> > ```
>
>> [选项卡] 双子座
>>
>> ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > import { createDeepAgent } from "deepagents";
> > import { ChatGoogle } from "@langchain/google/node";
> > import { todoListMiddleware } from "langchain";
> >
> > const maxConcurrentResearchUnits = 3;
> > const maxResearcherIterations = 3;
> >
> > const currentDate = new Date().toISOString().split("T")[0];
> >
> > const INSTRUCTIONS =
> >   RESEARCH_WORKFLOW_INSTRUCTIONS +
> >   "\n\n" +
> >   "=".repeat(80) +
> >   "\n\n" +
> >   SUBAGENT_DELEGATION_INSTRUCTIONS.replace(
> >     "{maxConcurrentResearchUnits}",
> >     String(maxConcurrentResearchUnits),
> >   ).replace("{maxResearcherIterations}", String(maxResearcherIterations));
> >
> > const researchSubAgent = {
> >   name: "research-agent",
> >   description: "Delegate research to the sub-agent. Give one topic at a time.",
> >   systemPrompt: RESEARCHER_INSTRUCTIONS.replace("{date}", currentDate),
> >   tools: [tavilySearch],
> > };
> >
> > const model = new ChatGoogle({
> >   model: "gemini-3-pro-preview",
> >   temperature: 0,
> > });
> >
> > const agent = createDeepAgent({
> >   model,
> >   tools: [tavilySearch],
> >   systemPrompt: INSTRUCTIONS,
> >   subagents: [researchSubAgent],
> >   middleware: [todoListMiddleware()],
> > });
> > ```
>
> ### 运行代理
>
> 您可以同步运行代理，这意味着它将等待完整结果然后打印它，或者您可以在更新到来时流式传输它们。
>
> 从`agent.ts`底部的相应选项卡添加代码：
>
>> [tab] 同步运行
>>
>> ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > {
> >   async function main() {
> >     const result = await agent.invoke({
> >       messages: [
> >         {
> >           role: "user",
> >           content:
> >             "What are the main differences between RAG and fine-tuning for LLM applications?",
> >         },
> >       ],
> >     });
> >
> >     for (const msg of result.messages ?? []) {
> >       if (msg.content) {
> >         console.log(msg.content);
> >       }
> >     }
> >   }
> >
> >   main().catch((err) => {
> >     console.error(err);
> >     process.exitCode = 1;
> >   });
> > }
> > ```
>
>> [选项卡] 流更新
>>
>> ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > {
> >   async function main() {
> >     const stream = await agent.streamEvents(
> >       {
> >         messages: [
> >           {
> >             role: "user",
> >             content: "Compare Python vs JavaScript for web development",
> >           },
> >         ],
> >       },
> >       { version: "v3" },
> >     );
> >     for await (const message of stream.messages) {
> >       for await (const token of message.text) {
> >         process.stdout.write(token);
> >       }
> >     }
> >   }
> >
> >   main().catch((err) => {
> >     console.error(err);
> >     process.exitCode = 1;
> >   });
> > }
> > ```
>
> 从项目根运行代理：
>
> ```sh theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npx tsx agent.ts
> ```
>
> 如果您在运行前设置了`LANGSMITH_API_KEY`环境变量，则可以在[LangSmith](/langsmith/observability)中查看代理的踪迹以调试和监控多步行为。
>
> ### 完整代码
>
> 在 GitHub 上查看完整的 [Deep Research example](https://github.com/langchain-ai/deepagents/tree/main/examples/deep_research)。

## 后续步骤

现在您已经构建了代理，通过编辑协调器指令来自定义工作流程（托管Deep Agents：`instructions.md`；SDK：代理文件中的提示常量）。您还可以调整委派限制以允许更多并行子代理或委派轮次。

有关本教程中的概念的更多信息，请参阅：* [Subagents](/oss/javascript/deepagents/subagents)：使用不同的工具和提示配置子代理
* [Customization](/oss/javascript/deepagents/customization)：自定义模型、工具、系统提示，可选[task planning](/oss/javascript/deepagents/overview#task-planning)
* [Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview)：使用托管部署基础架构构建深度代理
* [LangSmith](/langsmith/observability)：跟踪研究运行并调试多步骤行为
* [Deep Research Course](https://academy.langchain.com/courses/deep-research-with-langgraph)：LangGraph深度研究完整课程

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/deep-research.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。