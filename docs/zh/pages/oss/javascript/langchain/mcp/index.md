<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Model Context Protocol (MCP) | https://docs.langchain.com/oss/javascript/langchain/mcp/index -->

# 模型上下文协议 (MCP)

使用 MCPAdapter 将 LangChain 代理连接到 MCP 服务器。

[Model Context Protocol (MCP)](https://modelcontextprotocol.io) 是一种开放协议，它标准化了应用程序如何为语言模型提供工具和上下文。 LangChain代理通过[⟦T7⟧](https://reference.langchain.com/javascript/langchain-mcp-adapters/MCPAdapter)调用MCP服务器上定义的工具，它会发现服务器的工具并将其改编为LangChain工具，您可以直接传递给[⟦T8⟧](https://reference.langchain.com/javascript/langchain/index/createAgent)。

<Note>
  本指南需要 `@langchain/mcp-adapters` 2.0 或更高版本。如果您使用 1.x，请参阅 [1.x docs](/oss/javascript/langchain/mcp-v1) 或 [migration guide](/oss/javascript/migrate/langchain-mcp-adapters)。
</Note>

## 安装

安装 `@langchain/mcp-adapters` 包及其对等依赖项：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/mcp-adapters@^2.0.0 @langchain/core @langchain/langgraph
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add @langchain/mcp-adapters@^2.0.0 @langchain/core @langchain/langgraph
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @langchain/mcp-adapters@^2.0.0 @langchain/core @langchain/langgraph
  ```

  ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  bun add @langchain/mcp-adapters@^2.0.0 @langchain/core @langchain/langgraph
  ```
</CodeGroup>

如果导入 SDK 类型或传输，也请添加 `@modelcontextprotocol/client`。

## 快速入门

将代理连接到[LangChain docs MCP server](/use-these-docs)以搜索文档。此示例需要 `langchain`、`@langchain/anthropic` 和 Anthropic API 密钥。请参阅[LangChain quickstart](/oss/javascript/langchain/quickstart)进行设置。

在代理运行时保持适配器打开，然后在 `finally` 中将其关闭：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MCPAdapter } from "@langchain/mcp-adapters";
import { createAgent } from "langchain";

async function main() {
  const adapter = new MCPAdapter({
    servers: { docs: { url: "https://docs.langchain.com/mcp" } },
  });

  try {
    const tools = await adapter.listTools();
    const agent = createAgent({ model: "claude-sonnet-5", tools });
    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: "How do I add short-term memory to a LangChain agent?",
        },
      ],
    });
    console.log(result.messages.at(-1)?.text);
  } finally {
    await adapter.close();
  }
}

await main();
```

<Accordion title="LangChain docs MCP server">
  [LangChain docs MCP server](/use-these-docs) 是位于 `https://docs.langchain.com/mcp` 的公共 HTTP 端点。

  将代理连接到它以搜索和阅读文档，而无需编写自定义工具：

  ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { MCPAdapter } from "@langchain/mcp-adapters";
  import { createAgent } from "langchain";

  async function main() {
    const adapter = new MCPAdapter({
      servers: { docs: { url: "https://docs.langchain.com/mcp" } }, // [!code highlight]
    });

    try {
      const tools = await adapter.listTools();
      const agent = createAgent({ model: "claude-sonnet-5", tools });
      return await agent.invoke({
        messages: [
          {
            role: "user",
            content: "How do I add short-term memory to a LangChain agent?",
          },
        ],
      });
    } finally {
      await adapter.close();
    }
  }
  ```

  <Note>
    文档 MCP 服务器是公共的，不需要 API 密钥。有关 IDE 和编码代理设置（Claude Code、Cursor 等），请参阅 [Use docs programmatically](/use-these-docs)。
  </Note>服务器公开这些工具：

  |工具|描述 |
  | - | - |
  | `search_docs_by_lang_chain` |搜索文档以获取相关指南、操作方法和示例。 |
  | `query_docs_filesystem_docs_by_lang_chain` |通过虚拟文件系统（`rg`、`head`、`cat`以及相关命令）读取或搜索文档。 |
  | `submit_feedback` |报告文档页面的问题。 |

  `MCPAdapter` 使用服务器名称前缀公开这些工具，例如 `docs__search_docs_by_lang_chain`。
</Accordion>

## 交通

[⟦T24⟧](https://reference.langchain.com/javascript/langchain-mcp-adapters/MCPAdapter) 接受命名服务器定义的映射。它从每个定义中选择传输，因此一个适配器可以同时连接到本地 stdio 服务器和远程 HTTP 服务器：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MCPAdapter } from "@langchain/mcp-adapters";

const adapter = new MCPAdapter({
  servers: {
    // A local server launched as a subprocess over stdio.
    local: {
      command: "node",
      args: ["./weather-server.js"],
    },

    // A remote server reached over Streamable HTTP.
    remote: {
      url: "https://example.com/mcp",
    },

    // A legacy server with an explicit SSE endpoint.
    legacy: {
      url: "https://legacy.example.com/sse",
      transport: "sse",
      mode: "legacy",
    },
  },
});

try {
  const tools = await adapter.listTools();
  // Pass tools to createAgent({ tools, ... }).
} finally {
  await adapter.close();
}
```

每个服务器定义都可以使用以下传输之一：

* **stdio**：提供`command`和`args`。适配器作为子进程启动命令并通过标准输入和输出进行通信。
* **流式 HTTP**：提供 `url`。这是基于 URL 的服务器的默认传输，因此 `transport: "http"` 是可选的。
* **SSE**：提供`url`并设置`transport: "sse"`。仅将此传输用于公开 SSE 端点的旧服务器。

传输选择和协议协商是分开的。可选的`mode`设置控制客户端接受哪个MCP协议时代。参见[Protocol eras](/oss/javascript/langchain/mcp/connections#protocol-eras)。<Note>
  对于新的远程服务器，请省略 `transport` 和 `mode`。该适配器使用可自动协议协商的 Streamable HTTP。仅当连接到具有已知旧要求的服务器时才指定这些设置。
</Note>

## 后续步骤

<CardGroup>
  <Card title="Tools" icon="tool" href="/oss/javascript/langchain/mcp/tools">
    将 MCP 工具加载到代理中，控制其执行并处理其输出。
  </Card>

  <Card title="Connections" icon="plug" href="/oss/javascript/langchain/mcp/connections">
    连接生命周期、多个服务器、协议时代和缓存。
  </Card>

  <Card title="Authentication" icon="lock" href="/oss/javascript/langchain/mcp/auth">
    不记名令牌、OAuth 2.1 和每用户服务器身份验证。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/mcp/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>