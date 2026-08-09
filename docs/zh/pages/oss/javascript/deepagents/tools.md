<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tools | https://docs.langchain.com/oss/javascript/deepagents/tools -->

# 工具

将 Deep Agent 连接到自定义函数、API、数据库和任何 MCP 服务器

深度代理可以调用您定义的任何工具、任何[LangChain tool](https://python.langchain.com/docs/concepts/tools/)以及任何[MCP server](#mcp-tools)中的工具。
通过 `tools=` 参数将它们与 [built-in harness tools](/oss/javascript/deepagents/overview#execution-environment) 一起传递给 `create_deep_agent` 以进行文件管理和子代理生成。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";


  const agent = await createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [search, fetchUrl, runQuery],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";


  const agent = await createDeepAgent({
    model: "openai:gpt-5.5",
    tools: [search, fetchUrl, runQuery],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";


  const agent = await createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [search, fetchUrl, runQuery],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";


  const agent = await createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [search, fetchUrl, runQuery],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";


  const agent = await createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [search, fetchUrl, runQuery],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";


  const agent = await createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [search, fetchUrl, runQuery],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";


  const agent = await createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [search, fetchUrl, runQuery],
  });
  ```
</CodeGroup>

## 自定义工具

将任何可调用的函数，例如普通函数、LangChain `@tool` 修饰的函数或工具字典直接传递给 `tools=`。
Deep Agents 从函数签名和文档字符串推断工具架构，因此在大多数情况下您不需要定义单独的架构。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent } from "deepagents";
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
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [internetSearch],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent } from "deepagents";
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
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "openai:gpt-5.5",
    tools: [internetSearch],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent } from "deepagents";
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
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [internetSearch],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent } from "deepagents";
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
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [internetSearch],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent } from "deepagents";
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
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [internetSearch],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent } from "deepagents";
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
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [internetSearch],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent } from "deepagents";
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
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [internetSearch],
  });
  ```
</CodeGroup>

有关定义和使用 LangChain 工具（工具字典、`StructuredTool`、返回类型、错误处理等）的完整详细信息，请参阅[Tools](/oss/javascript/langchain/tools)。

## MCP 工具

<Note>
  Deep Agents 完全支持[Model Context Protocol (MCP)](/oss/javascript/langchain/mcp)，这是用于将代理连接到外部服务的开放标准。从任何 MCP 服务器加载工具并将其直接传递到`create_deep_agent`。
</Note>MCP 是一种开放协议，允许代理通过标准接口连接到不断增长的服务器生态系统（数据库、API、文件系统、浏览器等）。您无需为每个服务编写自定义集成代码，而是将深度代理指向 MCP 服务器，它会获取服务器公开的所有工具。

安装 `@langchain/mcp-adapters` 连接 MCP 服务器：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/mcp-adapters
```

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");

  const client = new MultiServerMCPClient({
    my_server: {
      transport: "http",
      url: "http://localhost:8000/mcp",
    },
  });

  const tools = await client.getTools();

  const agent = await createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    tools,
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: "Use the MCP server to help me." }],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");

  const client = new MultiServerMCPClient({
    my_server: {
      transport: "http",
      url: "http://localhost:8000/mcp",
    },
  });

  const tools = await client.getTools();

  const agent = await createDeepAgent({
    model: "openai:gpt-5.5",
    tools,
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: "Use the MCP server to help me." }],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");

  const client = new MultiServerMCPClient({
    my_server: {
      transport: "http",
      url: "http://localhost:8000/mcp",
    },
  });

  const tools = await client.getTools();

  const agent = await createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools,
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: "Use the MCP server to help me." }],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");

  const client = new MultiServerMCPClient({
    my_server: {
      transport: "http",
      url: "http://localhost:8000/mcp",
    },
  });

  const tools = await client.getTools();

  const agent = await createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools,
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: "Use the MCP server to help me." }],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");

  const client = new MultiServerMCPClient({
    my_server: {
      transport: "http",
      url: "http://localhost:8000/mcp",
    },
  });

  const tools = await client.getTools();

  const agent = await createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools,
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: "Use the MCP server to help me." }],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");

  const client = new MultiServerMCPClient({
    my_server: {
      transport: "http",
      url: "http://localhost:8000/mcp",
    },
  });

  const tools = await client.getTools();

  const agent = await createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools,
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: "Use the MCP server to help me." }],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");

  const client = new MultiServerMCPClient({
    my_server: {
      transport: "http",
      url: "http://localhost:8000/mcp",
    },
  });

  const tools = await client.getTools();

  const agent = await createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    tools,
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: "Use the MCP server to help me." }],
  });
  ```
</CodeGroup>

有关详细的配置选项（包括 stdio 服务器、OAuth 身份验证、工具过滤和有状态会话），请参阅完整的 [MCP guide](/oss/javascript/langchain/mcp)。

## 内置线束工具

除了您提供的工具之外，每个 Deep Agent 还附带来自线束的一组内置工具：|工具|描述 |
| ------------ | ------------------------------------------------------------------------ |
| `ls` |列出目录中的文件。                                   |
| `read_file` |读取文件内容（具有分页和多模式支持）。 |
| `write_file` |创建新文件。                                            |
| `edit_file` |在文件中执行精确的字符串替换。                  |
| `glob` |查找与 glob 模式匹配的文件。                          |
| `grep` |搜索文件内容。                                        |
| `execute` |运行 shell 命令（仅限沙箱后端）。                  |
| `task` |生成一个子代理来处理委托的任务。                 |

要使用 `write_todos` 添加结构化任务计划，请选择使用 [⟦T38⟧](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware)。参见[Task planning](/oss/javascript/deepagents/overview#task-planning)。

有关每个内置工具功能的完整详细信息，请参阅[Harness overview](/oss/javascript/deepagents/overview#execution-environment)。

## 多模式工具输出

当所选模型支持多模式工具结果时，自定义工具可以返回纯文本或[standard content blocks](/oss/javascript/langchain/messages#standard-content-blocks)（文本、图像、音频、视频和文件）。内置 `read_file` 工具还返回支持的非文本文件类型的多模式块。返回纯文本结果的字符串，或文本加媒体或交错多模式输出的内容块的有序列表。有关示例和上下文压缩注意事项，请参阅 [Multimodal](/oss/javascript/deepagents/multimodal) 和 [Tool return values](/oss/javascript/langchain/tools#return-multimodal-content)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/tools.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>