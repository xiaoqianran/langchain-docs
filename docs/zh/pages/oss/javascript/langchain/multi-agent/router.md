<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Router | https://docs.langchain.com/oss/javascript/langchain/multi-agent/router -->

# 路由器

在**路由器**架构中，路由步骤对输入进行分类并将其定向到专门的[agents](/oss/javascript/langchain/agents)。当您有不同的**垂直领域**（每个需要自己的代理的独立知识领域）时，这非常有用。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    A([Query]) --> B[Router]
    B --> C[Agent A]
    B --> D[Agent B]
    B --> E[Agent C]
    C --> F[Synthesize]
    D --> F
    E --> F
    F --> G([Combined answer])

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710

    class A,G trigger
    class B,C,D,E,F process
```

## 主要特征

* 路由器分解查询
* 并行调用零个或多个专门代理
* 结果被综合成一致的响应

## 何时使用

当您有不同的垂直领域（每个需要自己的代理的独立知识领域）、需要并行查询多个源并且希望将结果合成为组合响应时，请使用路由器模式。

## 基本实现

路由器对查询进行分类并将其定向到适当的代理。使用 [⟦T4⟧](/oss/javascript/langgraph/graph-api#command) 进行单代理路由，或使用 [⟦T5⟧](/oss/javascript/langgraph/graph-api#send) 并行扇出到多个代理。

<Tabs>
  <Tab title="Single agent">
    使用 `Command` 路由到单个专门代理：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { z } from "zod";
    import { Command } from "@langchain/langgraph";

    const ClassificationResult = z.object({
      query: z.string(),
      agent: z.string(),
    });

    function classifyQuery(query: string): z.infer<typeof ClassificationResult> {
      // Use LLM to classify query and determine the appropriate agent
      // Classification logic here
      ...
    }

    function routeQuery(state: z.infer<typeof ClassificationResult>) {
      const classification = classifyQuery(state.query);

      // Route to the selected agent
      return new Command({ goto: classification.agent });
    }
    ```
  </Tab>

  <Tab title="Multiple agents (parallel)">
    使用 `Send` 并行扇出到多个专门代理：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { z } from "zod";
    import { Command } from "@langchain/langgraph";

    const ClassificationResult = z.object({
      query: z.string(),
      agent: z.string(),
    });

    function classifyQuery(query: string): z.infer<typeof ClassificationResult>[] {
      // Use LLM to classify query and determine the appropriate agent
      // Classification logic here
      ...
    }

    function routeQuery(state: typeof State.State) {
      const classifications = classifyQuery(state.query);

      // Fan out to selected agents in parallel
      return classifications.map(
        (c) => new Send(c.agent, { query: c.query })
      );
    }
    ```
  </Tab>
</Tabs>

有关完整的实现，请参阅下面的教程。<Card title="Tutorial: Build a multi-source knowledge base with routing" icon="book" href="/oss/javascript/langchain/multi-agent/router-knowledge-base">
  构建一个并行查询 GitHub、Notion 和 Slack 的路由器，然后将结果合成为连贯的答案。涵盖状态定义、专用代理、`Send` 并行执行以及结果合成。
</Card>

## 无状态与有状态

两种方法：

* [**Stateless routers**](#stateless) 独立处理每个请求
* [**Stateful routers**](#stateful) 维护跨请求的对话历史记录

## 无状态

每个请求都是独立路由的——调用之间没有内存。对于多轮对话，请参阅[Stateful routers](#stateful)。

<Tip>
  **路由器与子代理**：两种模式都可以将工作分派给多个代理，但它们在路由决策的制定方式上有所不同：

  * **路由器**：专用的路由步骤（通常是单个 LLM 调用或基于规则的逻辑），用于对输入进行分类并分派给代理。路由器本身通常不维护对话历史记录或执行多轮编排 - 这是一个预处理步骤。
  * **子代理**：主主管代理动态决定在正在进行的对话中呼叫哪个[subagents](/oss/javascript/langchain/multi-agent/subagents)。主代理维护上下文，可以轮流调用多个子代理，并编排复杂的多步骤工作流程。当您有明确的输入类别并想要确定性或轻量级分类时，请使用**路由器**。当您需要灵活的、对话感知的编排时，请使用**主管**，其中法学硕士根据不断变化的上下文决定下一步该做什么。
</Tip>

## 有状态

对于多轮对话，您需要维护跨调用的上下文。

### 工具包装器

最简单的方法：将无状态路由器包装为会话代理可以调用的工具。对话代理处理记忆和上下文；路由器保持无状态。这避免了管理多个并行代理之间的对话历史记录的复杂性。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const searchDocs = tool(
  async ({ query }) => {
    const result = await workflow.invoke({ query }); // [!code highlight]
    return result.finalAnswer;
  },
  {
    name: "search_docs",
    description: "Search across multiple documentation sources",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);

// Conversational agent uses the router as a tool
const conversationalAgent = createAgent({
  model,
  tools: [searchDocs],
  systemPrompt: "You are a helpful assistant. Use search_docs to answer questions.",
});
```

### 全力坚持

如果需要路由器本身维护状态，请使用[persistence](/oss/javascript/langchain/short-term-memory)来存储消息历史记录。当路由到代理时，从状态中获取以前的消息并有选择地将它们包含在代理的上下文中 - 这是 [context engineering](/oss/javascript/langchain/context-engineering) 的杠杆。<Warning>
  **有状态路由器需要自定义历史记录管理。** 如果路由器在代理之间轮流切换，当代理具有不同的音调或提示时，最终用户可能会感觉对话不流畅。通过并行调用，您需要维护路由器级别的历史记录（输入和合成输出）并在路由逻辑中利用此历史记录。请考虑使用 [handoffs pattern](/oss/javascript/langchain/multi-agent/handoffs) 或 [subagents pattern](/oss/javascript/langchain/multi-agent/subagents)，两者都为多轮对话提供更清晰的语义。
</Warning>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/multi-agent/router.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>