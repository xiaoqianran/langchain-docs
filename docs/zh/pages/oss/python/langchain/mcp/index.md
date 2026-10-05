<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Model Context Protocol (MCP) | https://docs.langchain.com/oss/python/langchain/mcp/index -->

# 模型上下文协议 (MCP)

使用 MCPAdapter 将 LangChain 代理连接到 MCP 服务器。

[Model Context Protocol (MCP)](https://modelcontextprotocol.io) 是一个开放协议，它标准化了应用程序如何为语言模型提供工具和上下文。 LangChain代理通过[⟦T5⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter)调用MCP服务器上定义的工具，它会发现服务器的工具并将其改编为LangChain工具，您可以直接传递给[⟦T6⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)。

[⟦T7⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter) 构建于 [FastMCP](https://gofastmcp.com) 之上，处理传输推断、协议协商、连接管理和身份验证。本节介绍 LangChain 特定层，并链接到 FastMCP 客户端文档以了解下面的连接详细信息。

<Note>
  `langchain.mcp` 命名空间需要 `langchain[mcp]>=1.4.0` 并且处于测试阶段。从它导入每个进程都会产生一次`LangChainBetaWarning`。 API 可能会更改。

  如果您在 v1.4.0 之前使用过 MCP，请参阅[Migrate from ⟦T11⟧](/oss/python/migrate/langchain-mcp-adapters)。
</Note>

## 安装

安装 LangChain 和 `mcp` extra，这会引入 FastMCP：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install "langchain[mcp]"
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add "langchain[mcp]"
  ```
</CodeGroup>

## 快速入门

打开[⟦T13⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter)，使用`list_tools()`发现服务器的工具，并在上下文中构建代理。这些工具保留客户端，因此代理在上下文退出后仍然可用：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.mcp import MCPAdapter


async def main():
    async with MCPAdapter("https://example.com/mcp") as adapter:
        tools = await adapter.list_tools()
        agent = create_agent("claude-sonnet-5", tools)
        return await agent.ainvoke({"messages": [{"role": "user", "content": "..."}]})
```

<Accordion title="LangChain docs MCP server">
  [LangChain docs MCP server](/use-these-docs) 是位于 `https://docs.langchain.com/mcp` 的公共 HTTP 端点。将代理连接到它以搜索和阅读文档，而无需编写自定义工具：

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.mcp import MCPAdapter


  async def main():
      async with MCPAdapter("https://docs.langchain.com/mcp") as adapter:  # [!code highlight]
          tools = await adapter.list_tools()
          agent = create_agent("claude-sonnet-5", tools)
          return await agent.ainvoke(
              {
                  "messages": [
                      {
                          "role": "user",
                          "content": "How do I add short-term memory to a LangChain agent?",
                      }
                  ]
              }
          )
  ```

  <Note>
    文档 MCP 服务器是公共的，不需要 API 密钥。有关 IDE 和编码代理设置（Claude Code、Cursor 等），请参阅 [Use docs programmatically](/use-these-docs)。
  </Note>

  服务器公开这些工具：

  |工具|描述 |
  | - | - |
  | `search_docs_by_lang_chain` |搜索文档以获取相关指南、操作方法和示例。 |
  | `query_docs_filesystem_docs_by_lang_chain` |通过虚拟文件系统（`rg`、`head`、`cat`以及相关命令）读取或搜索文档。 |
  | `submit_feedback` |报告文档页面的问题。 |
</Accordion>

## 交通

[⟦T22⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter) 推断来自您提供的目标的传输。目标是进程内服务器、stdio 上的本地脚本和远程 URL 之间的唯一区别：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from pathlib import Path

from langchain.mcp import MCPAdapter

# An in-process FastMCP server: no subprocess, no socket. Ideal for tests.
in_memory = MCPAdapter(server)  # a FastMCP instance

# A script path is launched over stdio, one subprocess per adapter.
stdio = MCPAdapter(Path("weather_server.py"))

# A string must be an http(s) URL, reached over streamable HTTP.
http = MCPAdapter("https://example.com/mcp")
```

目标可以是以下任意一个：* **`http`/`https` URL** (`str`)：通过 Streamable HTTP 到达。
* **脚本路径** (`Path`)：通过 stdio 作为子进程启动。
* **传输对象** (`StreamableTransport`)：预配置的传输对象。参见[Client Transports](https://gofastmcp.com/clients/transports)。
* **进程内 `FastMCP` 服务器**：在内存中连接，没有子进程或套接字。
* **一个`MCPConfig` dict** (`{"mcpServers": {...}}`)：一个适配器后面有多个服务器。参见[Connections](/oss/python/langchain/mcp/connections#multiple-servers)。
* **预建的`fastmcp.Client`**：用于完全控制传输、[caching](https://gofastmcp.com/clients/client#response-caching)和[protocol negotiation](https://gofastmcp.com/clients/client#protocol-negotiation)。

<Warning>
  `str` 目标必须是 `http` 或 `https` URL。 FastMCP 通过在将字符串测试为 URL 之前将其测试为文件系统路径来解析字符串，因此命名现有 `.py` 或 `.js` 文件的字符串会将该文件作为子进程启动。由于字符串是目标最常从配置或模型到达的形式，因此 [⟦T37⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter) 会拒绝与 URL 形状不匹配的字符串。
</Warning>

## 后续步骤

<CardGroup>
  <Card title="Tools" icon="tool" href="/oss/python/langchain/mcp/tools">
    将 MCP 工具加载到代理中，控制其执行并处理其输出。
  </Card>

  <Card title="Connections" icon="plug" href="/oss/python/langchain/mcp/connections">
    连接生命周期、多个服务器、协议时代和缓存。
  </Card>

  <Card title="Authentication" icon="lock" href="/oss/python/langchain/mcp/auth">
    不记名令牌、OAuth 2.1 和每用户服务器身份验证。
  </Card>
</CardGroup>

***<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/mcp/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>