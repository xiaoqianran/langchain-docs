<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Quickstart | https://docs.langchain.com/oss/javascript/deepagents/quickstart -->

# 快速入门

在几分钟内构建您的第一个深度代理

本指南将引导您使用文件系统工具和子代理功能创建第一个深度代理。您将建立一个可以进行研究和撰写报告的研究代理。

<Prompt description="Build the Deep Agents research quickstart" icon="sparkles">
  按照 Deep Agents 快速入门，在此工作目录中构建Deep Agents 研究代理。

  ## 第 1 步：阅读指南

  检测该项目是否使用Python或TypeScript/JavaScript。获取并关注匹配的页面；将其视为包名称、模型字符串、搜索工具设置和代码的真实来源：

  * Python：[https://docs.langchain.com/oss/python/deepagents/quickstart.md](https://docs.langchain.com/oss/python/deepagents/quickstart.md)
  * 打字稿：[https://docs.langchain.com/oss/javascript/deepagents/quickstart.md](https://docs.langchain.com/oss/javascript/deepagents/quickstart.md)

  ## 第二步：安装依赖项

  使用本项目中已使用的包管理器安装 `deepagents`（以及 TypeScript 上的 `langchain` / `@langchain/core`）。仅当用户未使用 Google、OpenAI 或 Anthropic 内置提供商搜索工具时才添加 Tavily。

  ## 步骤 3：配置模型凭据检查支持的提供商 API 密钥（例如 `GOOGLE_API_KEY`、`OPENAI_API_KEY` 或 `ANTHROPIC_API_KEY`）。如果未设置，请询问用户要使用哪个提供程序，然后停止并等待他们创建密钥并将其设置在 shell 或 `.env` 文件中。请勿发明、硬编码或提交 API 密钥。如果他们需要 Tavilly，请让他们以同样的方式设置 `TAVILY_API_KEY`。

  ## 步骤 4：实施研究代理

  按顺序执行快速入门步骤：

  1. 创建互联网搜索工具（当所选型号支持时，最好使用提供商内置的搜索工具；否则使用Tavily）。
  2. 使用搜索工具调用`create_deep_agent`，指南中的`provider:model`字符串（或初始化模型），以及页面上显示的研究系统提示。
  3. （可选）通过要求用户自行设置 `LANGSMITH_TRACING=true` 和 `LANGSMITH_API_KEY` 来启用 LangSmith 跟踪。
  4. 根据指南中的示例研究查询运行代理并打印最终响应。

  ## 规则

  * 请关注本快速入门。请勿添加托管 Deep Agents 部署、评估或不相关的框架。
  * 首选提供商内置网络搜索（如果可用）；仅在需要时使用 Tavilly。
  * 当秘密、提供商选择或项目约定不清楚时，询问而不是猜测。
</Prompt><Tip>
  **使用人工智能编码助手？**

  * 安装 [LangChain Docs MCP servers](/use-these-docs) 以使您的代理能够访问最新的 LangChain 文档和示例。

    <Prompt description="Connect LangChain docs MCP servers" icon="plug">
      将两个 LangChain 文档 MCP 服务器连接到我的编码代理，以便它可以查找当前的 LangChain、LangGraph 和 LangSmith 文档和 API 参考。

      要添加的服务器：

      * `docs-langchain`: [https://docs.langchain.com/mcp](https://docs.langchain.com/mcp)
      * `reference-langchain`: [https://reference.langchain.com/mcp](https://reference.langchain.com/mcp)

      检测我正在使用的代理或编辑器（Claude Code、Cursor、Codex CLI、Claude Desktop、Deep Agents Code、VS Code、Antigravity 或其他 MCP 兼容客户端）。使用 [https://docs.langchain.com/use-these-docs.md](https://docs.langchain.com/use-these-docs.md) 中的匹配设置：

      * Claude 代码：`claude mcp add --transport http` 适用于每个服务器（默认情况下为项目范围；仅当我要求全局访问时才使用`--scope user`）。
      * Codex CLI：`codex mcp add` 以及每个服务器 URL。
      * 光标、Deep Agents 代码、VS 代码或反重力：使用我的客户页面上显示的字段名称将两个条目合并到 MCP 设置 JSON 中。
      * Claude Desktop：在“设置”>“连接器”下添加两个 URL。

      不要发明备用 MCP URL。配置后，确认两台服务器均已列出并且可访问。
    </Prompt>
  * 安装[LangChain Skills](https://github.com/langchain-ai/langchain-skills)以提高代理在LangChain生态系统任务上的性能。<Prompt description="Install LangChain Skills" icon="puzzle">
      为我的编码代理安装 LangChain 技能，以便它可以更好地执行 LangChain、LangGraph 和 Deep Agents 任务。

      使用 [https://github.com/langchain-ai/langchain-skills](https://github.com/langchain-ai/langchain-skills) 中的代理技能安装程序：

      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npx skills add langchain-ai/langchain-skills --skill '*' --yes
      ```

      如果我要求全局安装，请使用：

      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npx skills add langchain-ai/langchain-skills --skill '*' --yes --global
      ```

      检测我正在使用哪个代理或编辑器。如果我使用 Claude Code 并且更喜欢插件路径，请按照该存储库自述文件中的市场安装（`/plugin marketplace add` 然后`/plugin install`）。不要发明备用技能包名称或安装 URL。安装后，确认代理可以使用该技能。
    </Prompt>
</Tip>

## 先决条件

在开始之前，请确保您拥有模型提供商（例如 Gemini、Anthropic、OpenAI）提供的 API 密钥。

<Note>
  Deep Agents 需要支持[tool calling](/oss/javascript/langchain/models#tool-calling) 的型号。请参阅[customization](/oss/javascript/deepagents/customization#model)了解如何配置您的模型。
</Note>

## 第 1 步：安装依赖项

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
  Google、OpenAI和Anthropic都提供内置网络搜索工具：无需额外的软件包或 API 密钥。如果您使用不同的提供商或更喜欢使用 [Tavily](https://tavily.com/) 进行搜索，请同时安装 Tavily 软件包：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/tavily
  ```
</Note>

## 第 2 步：设置您的 API 密钥

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
  </Tab><Tab title="Anthropic">
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

    Deep Agents 可与任何 [LangChain chat model](/oss/javascript/deepagents/models#supported-models) 配合使用。为您的提供商设置 API 密钥。
  </Tab>
</Tabs>

<Tip>
  **使用LangSmith网关**

  [LangSmith Gateway](/langsmith/llm-gateway) 通过 LangSmith 路由大多数主要提供商。您可以使用 [bring your own provider keys](/langsmith/llm-gateway-quickstart#send-a-request) 或使用 [Gateway Credits](/langsmith/llm-gateway-credits) 在没有提供程序密钥的情况下访问模型。
</Tip>

## 第三步：创建搜索工具

Google、OpenAI 和 Anthropic 提供在服务器端运行的内置网络搜索工具：无需额外的软件包或 API 密钥。将提供者工具字典直接传递给`create_deep_agent`。

<Tabs>
  <Tab title="Provider search (recommended)">
    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent } from "deepagents";

      // Google's built-in search — no extra install or API key needed
      const internetSearch = { googleSearch: {} };
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

## 步骤 4：创建深度代理

将您的搜索工具和型号传递给`create_deep_agent`。传递 `provider:model` 格式的 `model` 字符串，或 [initialized model instance](/oss/javascript/deepagents/models#configure-model-parameters)。有关所有提供商，请参阅 [supported models](/oss/javascript/deepagents/models#supported-models)；有关经过测试的建议，请参阅 [suggested models](/oss/javascript/deepagents/models#suggested-models)。

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
    model: "google:gemini-3.6-flash",
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
    model: "anthropic:claude-sonnet-5",
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
    model: "openrouter:z-ai/glm-5.2",
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

## 步骤 5：设置 LangSmith 跟踪

[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-quickstart) 为您提供代理执行的可见性，允许您查看工具调用、子代理委托和 LLM 响应。在 [smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-quickstart) 注册，创建 API 密钥，并设置以下环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY="your-langsmith-api-key"
```

## 第 6 步：运行代理

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const result = await agent.invoke({
  messages: [{ role: "user", content: "What is langgraph?" }],
});

// Print the agent's response
console.log(result.messages[result.messages.length - 1].content);
```

## 它是如何工作的？

您的深度代理会自动：

1. **通过调用`internet_search`工具收集信息进行研究**。
2. **通过使用文件系统工具（[⟦T51⟧](/oss/javascript/deepagents/overview#virtual-filesystem-access)、[⟦T52⟧](/oss/javascript/deepagents/overview#virtual-filesystem-access)）管理上下文**以卸载大型搜索结果。
3. **根据需要生成子代理**，将复杂的子任务委托给专门的子代理。
4. **综合报告**，将调查结果汇编成连贯的回应。

要使用 `write_todos` 添加结构化任务计划，请选择使用 [⟦T54⟧](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware)。参见[Task planning](/oss/javascript/deepagents/overview#task-planning)。

## 示例

对于可以使用 Deep Agents 构建的代理、模式和应用程序，请参阅 [Examples](https://github.com/langchain-ai/deepagents/tree/main/examples)。

## 流媒体

Deep Agents 内置 [streaming](/oss/javascript/langchain/event-streaming)，用于使用 LangGraph 进行代理执行的实时更新。
这使您可以逐步观察输出并检查和调试代理和子代理的工作，例如工具调用、工具结果和 LLM 响应。

## 后续步骤

现在您已经构建了第一个深度代理：* **自定义您的代理**：了解[customization options](/oss/javascript/deepagents/customization)，包括自定义系统提示、工具和子代理。
* **添加长期记忆**：跨对话启用[persistent memory](/oss/javascript/deepagents/memory)。
* **部署到生产**：使用[Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview)在LangSmith中创建、运行和操作深度代理。
* **测试和评估**：使用 [LangSmith evaluation](/langsmith/evaluation-quickstart) 运行自动化测试并根据数据集衡量代理的性能。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>