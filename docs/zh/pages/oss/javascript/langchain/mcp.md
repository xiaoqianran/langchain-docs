<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Model Context Protocol (MCP) | https://docs.langchain.com/oss/javascript/langchain/mcp -->

# 模型上下文协议 (MCP)

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) 是一个开放协议，它标准化了应用程序如何向法学硕士提供工具和上下文。 LangChain代理可以使用MCP服务器上通过[⟦T21⟧](https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain-mcp-adapters)库定义的工具。

## 快速入门

安装`@langchain/mcp-adapters`库：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/mcp-adapters
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add @langchain/mcp-adapters
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @langchain/mcp-adapters
  ```

  ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  bun add @langchain/mcp-adapters
  ```
</CodeGroup>

`@langchain/mcp-adapters` 使代理能够使用跨一台或多台 MCP 服务器定义的工具。

<Note>
  `MultiServerMCPClient` **默认情况下是无状态的**。每次工具调用都会创建一个新的 MCP `ClientSession`，执行该工具，然后进行清理。
</Note>

```ts Accessing multiple MCP servers icon="server" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MultiServerMCPClient } from "@langchain/mcp-adapters";  // [!code highlight]
import { ChatAnthropic } from "@langchain/anthropic";
import { createAgent } from "langchain";

const client = new MultiServerMCPClient({  // [!code highlight]
    math: {
        transport: "stdio",  // Local subprocess communication
        command: "node",
        // Replace with absolute path to your math_server.js file
        args: ["/path/to/math_server.js"],
    },
    weather: {
        transport: "http",  // HTTP-based remote server
        // Ensure you start your weather server on port 8000
        url: "http://localhost:8000/mcp",
    },
});

const tools = await client.getTools();  // [!code highlight]
const agent = createAgent({
    model: "claude-sonnet-4-6",
    tools,  // [!code highlight]
});

const mathResponse = await agent.invoke({
    messages: [{ role: "user", content: "what's (3 + 5) x 12?" }],
});

const weatherResponse = await agent.invoke({
    messages: [{ role: "user", content: "what is the weather in nyc?" }],
});
```

<Tip>
  使用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-mcp) 跟踪 MCP 工具调用以及代理的推理步骤。按照[tracing quickstart](/langsmith/trace-with-langchain)进行设置。
</Tip>

## 自定义服务器

要创建您自己的 MCP 服务器，您可以使用 `@modelcontextprotocol/sdk` 库。该库提供了一种简单的方法来定义 [tools](https://modelcontextprotocol.io/docs/learn/server-concepts#tools-ai-actions) 并将其作为服务器运行。

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @modelcontextprotocol/sdk
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add @modelcontextprotocol/sdk
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @modelcontextprotocol/sdk
  ```

  ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  bun add @modelcontextprotocol/sdk
  ```
</CodeGroup>

要使用 MCP 工具服务器测试您的代理，请使用以下示例：

```typescript title="Math server (stdio transport)" icon="device-floppy" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
    {
        name: "math-server",
        version: "0.1.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
        {
            name: "add",
            description: "Add two numbers",
            inputSchema: {
                type: "object",
                properties: {
                    a: {
                        type: "number",
                        description: "First number",
                    },
                    b: {
                        type: "number",
                        description: "Second number",
                    },
                },
                required: ["a", "b"],
            },
        },
        {
            name: "multiply",
            description: "Multiply two numbers",
            inputSchema: {
                type: "object",
                properties: {
                    a: {
                        type: "number",
                        description: "First number",
                    },
                    b: {
                        type: "number",
                        description: "Second number",
                    },
                },
                required: ["a", "b"],
            },
        },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
        case "add": {
            const { a, b } = request.params.arguments as { a: number; b: number };
            return {
                content: [
                {
                    type: "text",
                    text: String(a + b),
                },
                ],
            };
        }
        case "multiply": {
            const { a, b } = request.params.arguments as { a: number; b: number };
            return {
                content: [
                {
                    type: "text",
                    text: String(a * b),
                },
                ],
            };
        }
        default:
            throw new Error(`Unknown tool: ${request.params.name}`);
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Math MCP server running on stdio");
}

main();
```

```typescript title="Weather server (SSE transport)" icon="wifi" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";

const app = express();
app.use(express.json());

const server = new Server(
    {
        name: "weather-server",
        version: "0.1.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
        {
            name: "get_weather",
            description: "Get weather for location",
            inputSchema: {
            type: "object",
            properties: {
                location: {
                type: "string",
                description: "Location to get weather for",
                },
            },
            required: ["location"],
            },
        },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
        case "get_weather": {
            const { location } = request.params.arguments as { location: string };
            return {
                content: [
                    {
                        type: "text",
                        text: `It's always sunny in ${location}`,
                    },
                ],
            };
        }
        default:
            throw new Error(`Unknown tool: ${request.params.name}`);
    }
});

app.post("/mcp", async (req, res) => {
    const transport = new SSEServerTransport("/mcp", res);
    await server.connect(transport);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Weather MCP server running on port ${PORT}`);
});
```

## 交通

MCP 支持客户端-服务器通信的不同传输机制。

### HTTP

`http` 传输（也称为 `streamable-http`）使用 HTTP 请求进行客户端-服务器通信。更多详情请参阅[MCP HTTP transport specification](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http)。使用您自己运行的服务器的本地 URL，或托管 URL，例如 [LangChain docs MCP server](/use-these-docs) (`https://docs.langchain.com/mcp`)，它是公共的，不需要 API 密钥。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createAgent } from "langchain";

const client = new MultiServerMCPClient({
    mcp: {
        transport: "http",
        // url: "http://localhost:8000/mcp", // Local server
        url: "https://docs.langchain.com/mcp", // Hosted server
    },
});

const tools = await client.getTools();
const agent = createAgent({ model: "openai:gpt-5.4", tools });
const response = await agent.invoke({
    messages: [
        {
            role: "user",
            content: "How do I connect LangChain to an MCP server over HTTP?",
        },
    ],
});
```

#### 传递标头

#### 身份验证

### 标准输入输出

客户端将服务器作为子进程启动，并通过标准输入/输出进行通信。最适合本地工具和简单的设置。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const client = new MultiServerMCPClient({
    math: {
        transport: "stdio",
        command: "node",
        args: ["/path/to/math_server.js"],
    },
});
```

## 核心功能

### 工具

[Tools](https://modelcontextprotocol.io/docs/concepts/tools) 允许 MCP 服务器公开 LLM 可以调用的可执行函数来执行操作，例如查询数据库、调用 API 或与外部系统交互。 LangChain将MCP工具转换为LangChain[tools](/oss/javascript/langchain/tools)，使其可以直接在任何LangChain代理或工作流程中使用。

#### 加载工具

使用 `client.getTools()` 从 MCP 服务器检索工具并将其传递给您的代理：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createAgent } from "langchain";

const client = new MultiServerMCPClient({...});
const tools = await client.getTools();  // [!code highlight]
const agent = createAgent({ model: "claude-sonnet-4-6", tools });
```

当 MCP 工具执行失败时（`CallToolResult` 和 `isError: true`），`@langchain/mcp-adapters` 会引发 `ToolException`。将工具调用包装在 try/catch 中以处理这些错误。与 Python 适配器不同，TypeScript 适配器不会将错误作为失败的工具消息返回到模型。

#### 多模式工具内容MCP 工具可以在响应中返回[multimodal content](https://modelcontextprotocol.io/specification/2025-03-26/server/tools#tool-result)（图像、文本等）。当MCP服务器返回包含多个部分的内容（例如文本和图像）时，适配器将它们转换为LangChain的[standard content blocks](/oss/javascript/langchain/messages#standard-content-blocks)。您可以通过 `ToolMessage` 上的 `contentBlocks` 属性访问标准化表示：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  async function accessMultimodalToolContent(): Promise<void> {
    const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");
    const client = new MultiServerMCPClient({});
    const tools = await client.getTools();
    const agent = createAgent({ model: "google-genai:gemini-3.6-flash", tools });

    const result = await agent.invoke({
      messages: [
        { role: "user", content: "Take a screenshot of the current page" },
      ],
    });

    // Access multimodal content from tool messages
    for (const message of result.messages) {
      if (message.type === "tool") {
        // Raw content in provider-native format
        console.log(`Raw content: ${message.content}`);

        // Standardized content blocks  // [!code highlight]
        for (const block of message.contentBlocks) {
          // [!code highlight]
          if (block.type === "text") {
            // [!code highlight]
            console.log(`Text: ${block.text}`); // [!code highlight]
          } else if (block.type === "image") {
            // [!code highlight]
            console.log(`Image URL: ${block.url}`); // [!code highlight]
            console.log(`Image base64: ${block.base64?.slice(0, 50)}...`); // [!code highlight]
          }
        }
      }
    }
  }
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  async function accessMultimodalToolContent(): Promise<void> {
    const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");
    const client = new MultiServerMCPClient({});
    const tools = await client.getTools();
    const agent = createAgent({ model: "openai:gpt-5.5", tools });

    const result = await agent.invoke({
      messages: [
        { role: "user", content: "Take a screenshot of the current page" },
      ],
    });

    // Access multimodal content from tool messages
    for (const message of result.messages) {
      if (message.type === "tool") {
        // Raw content in provider-native format
        console.log(`Raw content: ${message.content}`);

        // Standardized content blocks  // [!code highlight]
        for (const block of message.contentBlocks) {
          // [!code highlight]
          if (block.type === "text") {
            // [!code highlight]
            console.log(`Text: ${block.text}`); // [!code highlight]
          } else if (block.type === "image") {
            // [!code highlight]
            console.log(`Image URL: ${block.url}`); // [!code highlight]
            console.log(`Image base64: ${block.base64?.slice(0, 50)}...`); // [!code highlight]
          }
        }
      }
    }
  }
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  async function accessMultimodalToolContent(): Promise<void> {
    const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");
    const client = new MultiServerMCPClient({});
    const tools = await client.getTools();
    const agent = createAgent({ model: "anthropic:claude-sonnet-4-6", tools });

    const result = await agent.invoke({
      messages: [
        { role: "user", content: "Take a screenshot of the current page" },
      ],
    });

    // Access multimodal content from tool messages
    for (const message of result.messages) {
      if (message.type === "tool") {
        // Raw content in provider-native format
        console.log(`Raw content: ${message.content}`);

        // Standardized content blocks  // [!code highlight]
        for (const block of message.contentBlocks) {
          // [!code highlight]
          if (block.type === "text") {
            // [!code highlight]
            console.log(`Text: ${block.text}`); // [!code highlight]
          } else if (block.type === "image") {
            // [!code highlight]
            console.log(`Image URL: ${block.url}`); // [!code highlight]
            console.log(`Image base64: ${block.base64?.slice(0, 50)}...`); // [!code highlight]
          }
        }
      }
    }
  }
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  async function accessMultimodalToolContent(): Promise<void> {
    const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");
    const client = new MultiServerMCPClient({});
    const tools = await client.getTools();
    const agent = createAgent({ model: "openrouter:openrouter:z-ai/glm-5.2", tools });

    const result = await agent.invoke({
      messages: [
        { role: "user", content: "Take a screenshot of the current page" },
      ],
    });

    // Access multimodal content from tool messages
    for (const message of result.messages) {
      if (message.type === "tool") {
        // Raw content in provider-native format
        console.log(`Raw content: ${message.content}`);

        // Standardized content blocks  // [!code highlight]
        for (const block of message.contentBlocks) {
          // [!code highlight]
          if (block.type === "text") {
            // [!code highlight]
            console.log(`Text: ${block.text}`); // [!code highlight]
          } else if (block.type === "image") {
            // [!code highlight]
            console.log(`Image URL: ${block.url}`); // [!code highlight]
            console.log(`Image base64: ${block.base64?.slice(0, 50)}...`); // [!code highlight]
          }
        }
      }
    }
  }
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  async function accessMultimodalToolContent(): Promise<void> {
    const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");
    const client = new MultiServerMCPClient({});
    const tools = await client.getTools();
    const agent = createAgent({ model: "fireworks:accounts/fireworks/models/glm-5p2", tools });

    const result = await agent.invoke({
      messages: [
        { role: "user", content: "Take a screenshot of the current page" },
      ],
    });

    // Access multimodal content from tool messages
    for (const message of result.messages) {
      if (message.type === "tool") {
        // Raw content in provider-native format
        console.log(`Raw content: ${message.content}`);

        // Standardized content blocks  // [!code highlight]
        for (const block of message.contentBlocks) {
          // [!code highlight]
          if (block.type === "text") {
            // [!code highlight]
            console.log(`Text: ${block.text}`); // [!code highlight]
          } else if (block.type === "image") {
            // [!code highlight]
            console.log(`Image URL: ${block.url}`); // [!code highlight]
            console.log(`Image base64: ${block.base64?.slice(0, 50)}...`); // [!code highlight]
          }
        }
      }
    }
  }
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  async function accessMultimodalToolContent(): Promise<void> {
    const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");
    const client = new MultiServerMCPClient({});
    const tools = await client.getTools();
    const agent = createAgent({ model: "baseten:zai-org/GLM-5.2", tools });

    const result = await agent.invoke({
      messages: [
        { role: "user", content: "Take a screenshot of the current page" },
      ],
    });

    // Access multimodal content from tool messages
    for (const message of result.messages) {
      if (message.type === "tool") {
        // Raw content in provider-native format
        console.log(`Raw content: ${message.content}`);

        // Standardized content blocks  // [!code highlight]
        for (const block of message.contentBlocks) {
          // [!code highlight]
          if (block.type === "text") {
            // [!code highlight]
            console.log(`Text: ${block.text}`); // [!code highlight]
          } else if (block.type === "image") {
            // [!code highlight]
            console.log(`Image URL: ${block.url}`); // [!code highlight]
            console.log(`Image base64: ${block.base64?.slice(0, 50)}...`); // [!code highlight]
          }
        }
      }
    }
  }
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  async function accessMultimodalToolContent(): Promise<void> {
    const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");
    const client = new MultiServerMCPClient({});
    const tools = await client.getTools();
    const agent = createAgent({ model: "ollama:north-mini-code-1.0", tools });

    const result = await agent.invoke({
      messages: [
        { role: "user", content: "Take a screenshot of the current page" },
      ],
    });

    // Access multimodal content from tool messages
    for (const message of result.messages) {
      if (message.type === "tool") {
        // Raw content in provider-native format
        console.log(`Raw content: ${message.content}`);

        // Standardized content blocks  // [!code highlight]
        for (const block of message.contentBlocks) {
          // [!code highlight]
          if (block.type === "text") {
            // [!code highlight]
            console.log(`Text: ${block.text}`); // [!code highlight]
          } else if (block.type === "image") {
            // [!code highlight]
            console.log(`Image URL: ${block.url}`); // [!code highlight]
            console.log(`Image base64: ${block.base64?.slice(0, 50)}...`); // [!code highlight]
          }
        }
      }
    }
  }
  ```
</CodeGroup>

这允许您以与提供商无关的方式处理多模式工具响应，无论底层 MCP 服务器如何格式化其内容。

## 其他资源

* [MCP documentation](https://modelcontextprotocol.io/introduction)

* [MCP Transport documentation](https://modelcontextprotocol.io/docs/concepts/transports)

* [⟦T37⟧](https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain-mcp-adapters/)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/mcp.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>