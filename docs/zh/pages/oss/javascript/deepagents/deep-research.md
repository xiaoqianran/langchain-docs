<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a deep research agent | https://docs.langchain.com/oss/javascript/deepagents/deep-research -->

# 构建深度研究代理

使用子代理委托构建多步骤网络研究代理

## 概述

本指南演示了如何使用 [Deep Agents](/oss/javascript/deepagents) 从头开始构建多步骤网络研究代理。该代理将研究问题分解为重点任务，将其委托给专门的子代理，并将研究结果综合成一份综合报告。

您构建的代理将：

1. 使用选择加入待办事项列表中间件来计划研究
2. 将重点研究任务委托给具有孤立上下文的子代理
3. 收集信息时评估搜索结果并计划后续步骤
4. 将研究结果与适当的引用综合成最终报告

生成的子代理将使用 Tavily 进行网络搜索，获取完整的网页内容进行分析。

### 关键概念

本教程涵盖：

* [Subagents](/oss/javascript/deepagents/subagents) 用于并行、上下文隔离的研究
* 自定义[tools](/oss/javascript/langchain/tools)用于网络搜索
* 可选择加入的多步骤规划[planning tool](/oss/javascript/deepagents/overview#task-planning)

## 先决条件

API 密钥用于：

* 人类（克劳德）或谷歌（双子座）
* [Tavily](https://www.tavily.com/) 用于网络搜索（可选 - 免费套餐足够）
* [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-deep-research) 用于追踪（可选）

## 设置

<Steps>
  <Step title="Create project directory">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    mkdir deep-research-agent
    cd deep-research-agent
    ```
  </Step>

  <Step title="Install dependencies">
    <Tabs>
      <Tab title="Claude">
        ```bash npm wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        npm install deepagents @langchain/anthropic @langchain/core
        ```
      </Tab><Tab title="Gemini">
        ```bash npm wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        npm install deepagents @langchain/google-genai @langchain/core
        ```
      </Tab>
    </Tabs>
  </Step>

  <Step title="Set API keys">
    <Tabs>
      <Tab title="Claude">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        export ANTHROPIC_API_KEY="your_anthropic_api_key"
        export TAVILY_API_KEY="your_tavily_api_key"
        export LANGSMITH_API_KEY="your_langsmith_api_key"   # Optional
        ```
      </Tab>

      <Tab title="Gemini">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        export GOOGLE_API_KEY="your_google_api_key"
        export TAVILY_API_KEY="your_tavily_api_key"
        export LANGSMITH_API_KEY="your_langsmith_api_key"   # Optional
        ```
      </Tab>
    </Tabs>
  </Step>
</Steps>

## 构建代理

在项目目录中创建`agent.ts`：

<Steps>
  <Step title="Add tools">
    添加自定义搜索工具。 `tavily_search` 工具使用 Tavily 进行 URL 发现，然后获取完整的网页内容，以便代理可以分析完整的源而不是摘要。

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
  </Step>

  <Step title="Add prompts">
    将orchestrator工作流程和子代理提示模板添加到`agent.ts`：

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
  </Step>

  <Step title="Enable task planning">
    [Task planning](/oss/javascript/deepagents/overview#task-planning) 是选择加入。研究工作流程使用 `write_todos` 将问题分解为重点任务，因此在创建代理时传递 [⟦T18⟧](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware)。

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { todoListMiddleware } from "langchain";
    ```

    创建代理时，您可以在下一步中包含此中间件。
  </Step>

  <Step title="Create the agent">
    将模型初始化和代理创建添加到`agent.ts`。包括 `todoListMiddleware`，以便规划工具可用：

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

    const agent = await createDeepAgent({
      model,
      tools: [tavilySearch],
      systemPrompt: INSTRUCTIONS,
      subagents: [researchSubAgent],
      middleware: [todoListMiddleware()],
    });
    ```
  </Step>
</Steps>

## 运行代理

您可以同步运行代理，这意味着它将等待完整结果然后打印它，或者您可以在更新到来时流式传输它们。

从 `agent.ts` 底部的相应选项卡添加代码：<Tabs>
  <Tab title="Run synchronously">
    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
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
    }
    ```
  </Tab>

  <Tab title="Stream updates">
    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
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
          for await (const token of message.text) {
            process.stdout.write(token);
          }
        }
      }

      main().catch((err) => {
        console.error(err);
        process.exitCode = 1;
      });
    }
    ```
  </Tab>
</Tabs>

从项目根目录运行代理：

```sh theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx tsx agent.ts
```

如果您在运行前设置了 `LANGSMITH_API_KEY` 环境变量，则可以在 [LangSmith](/langsmith/observability) 中查看代理的跟踪来调试和监控多步行为。

## 完整代码

在 GitHub 上查看完整的 [Deep Research example](https://github.com/langchain-ai/deepagents/tree/main/examples/deep_research)。

## 后续步骤

现在您已经构建了代理，可以通过更改代理文件中的提示常量来自定义它，以调整工作流程、委派策略或研究人员行为。
您还可以调整委派限制以允许更多并行子代理或委派轮次。

有关本教程中的概念的更多信息，请查看以下资源：

* [Subagents](/oss/javascript/deepagents/subagents)：了解如何使用不同的工具和提示配置子代理
* [Customization](/oss/javascript/deepagents/customization)：自定义模型、工具、系统提示，可选[task planning](/oss/javascript/deepagents/overview#task-planning)
* [LangSmith](/langsmith/observability)：跟踪研究运行并调试多步骤行为
* [Deep Research Course](https://academy.langchain.com/courses/deep-research-with-langgraph)：LangGraph深度研究完整课程

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/deep-research.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>