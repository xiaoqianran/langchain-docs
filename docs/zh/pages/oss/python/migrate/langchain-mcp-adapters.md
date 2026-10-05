<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Migrate from langchain-mcp-adapters | https://docs.langchain.com/oss/python/migrate/langchain-mcp-adapters -->

# 从 langchain-mcp-adapters 迁移

从独立的 langchain-mcp-adapters 包迁移到内置的 langchain.mcp 命名空间。

MCP 支持现在在 `langchain.mcp` 命名空间中的 LangChain 内提供，构建于 [FastMCP](https://gofastmcp.com) 之上。它取代了独立的 [⟦T7⟧](https://github.com/langchain-ai/langchain-mcp-adapters) 包，其 `MultiServerMCPClient` 被折叠为单个 [⟦T9⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter) 类。

有关完整功能文档，请参阅[Model Context Protocol (MCP)](/oss/python/langchain/mcp)。

<Prompt description="Migrate from langchain-mcp-adapters to langchain.mcp" icon="arrow-right">
  将此代码库从独立的 `langchain-mcp-adapters` 包迁移到内置的 `langchain.mcp` 命名空间。

  ## 第 1 步：阅读指南

  获取并遵循 [https://docs.langchain.com/oss/python/migrate/langchain-mcp-adapters.md](https://docs.langchain.com/oss/python/migrate/langchain-mcp-adapters.md) 作为包更改、导入路径、客户端 API、连接配置、回调、拦截器、身份验证和尚未包装的功能的真实来源。对于迁移后的当前功能文档，还可以在需要时获取 [https://docs.langchain.com/oss/python/langchain/mcp.md](https://docs.langchain.com/oss/python/langchain/mcp.md) 及其链接页面。

  ## 第二步：升级包

  使用本项目中已使用的包管理器（`uv`或`pip`）卸载`langchain-mcp-adapters`并在`>=1.4.0`安装`langchain[mcp]`。当项目已经固定版本时，最好固定当前的稳定版本。

  ## 步骤 3：应用迁移

  识别从 `langchain_mcp_adapters` 导入或使用 `MultiServerMCPClient` 的每个调用站点，然后应用指南中的之前/之后的更改，包括：* 将 `MultiServerMCPClient` 替换为 `MCPAdapter`（异步上下文管理器；使用 `list_tools()`）。
  * 将服务器配置移至标准 `MCPConfig` 形状 (`mcpServers`)，并在指南说推断传输时删除每个条目 `transport` 键。
  * 更新导入路径、重命名帮助程序（例如 `convert_mcp_tool_to_langchain_tool` 到 `as_langchain_tool`）、构造函数参数、回调、工具拦截器以及页面映射的身份验证。
  * 保留指南标记为保留的行为（例如 `MCPToolArtifact` 和多模式内容）。

  ## 步骤 4：明确处理差距

  如果代码库使用提示、资源、采样、根、SSE/WebSocket 传输、`to_fastmcp` 或指南标记为不支持或协议已弃用的任何 API，请停止并询问用户如何继续。不要发明替代品。

  ## 规则

  * 关注此迁移。不要重写不相关的代理代码。
  * 优先使用指南中的 `langchain.mcp` API，而不是保留 `langchain-mcp-adapters`。
  * 当指南未涵盖调用站点或参数时，询问而不是猜测。
</Prompt>

<Note>
  `langchain.mcp`命名空间需要`langchain[mcp]>=1.4.0`并且处于测试阶段。从它导入会产生 `LangChainBetaWarning`。 API 可能会更改。
</Note>

## 安装

将独立包替换为额外的 `mcp`，它引入了 FastMCP：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip uninstall langchain-mcp-adapters
  pip install "langchain[mcp]"
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv remove langchain-mcp-adapters
  uv add "langchain[mcp]"
  ```
</CodeGroup>## 导入路径

| `langchain-mcp-adapters` | `langchain.mcp` |
| - | - |
| `from langchain_mcp_adapters.client import MultiServerMCPClient` | `from langchain.mcp import MCPAdapter` |
| `from langchain_mcp_adapters.tools import load_mcp_tools` | `from langchain.mcp import MCPAdapter`（使用`MCPAdapter(...).list_tools()`）|
| `from langchain_mcp_adapters.tools import convert_mcp_tool_to_langchain_tool` | `from langchain.mcp import as_langchain_tool`（已更名）|
| `from langchain_mcp_adapters.tools import MCPToolArtifact` | `from langchain.mcp import MCPToolArtifact` |

## 客户端

`MultiServerMCPClient` 采用服务器配置字典并公开了几种方法。 [⟦T47⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter) 是一个异步上下文管理器，它从其目标推断传输并公开 `list_tools()`。

之前：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient(
    {
        "math": {"transport": "stdio", "command": "python", "args": ["/path/to/math_server.py"]},
        "weather": {"transport": "http", "url": "http://localhost:8000/mcp"},
    }
)
tools = await client.get_tools()
```

之后：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.mcp import MCPAdapter

config = {
    "mcpServers": {
        "math": {"command": "python", "args": ["/path/to/math_server.py"]},
        "weather": {"url": "http://localhost:8000/mcp"},
    }
}
async with MCPAdapter(config) as adapter:
    tools = await adapter.list_tools()
```

该配置使用标准 [⟦T49⟧](https://gofastmcp.com/integrations/mcp-json-configuration) 形状 (`mcpServers`)，并且传输是从每个条目推断出来的，而不是使用 `transport` 键命名。对于单个服务器，直接传递其 URL、脚本路径或进程内服务器。参见[Connections](/oss/python/langchain/mcp/connections#multiple-servers)。

### 客户端方法

| `MultiServerMCPClient`方法| `langchain.mcp` |
| - | - |
| `get_tools(server_name=...)` | `MCPAdapter(...).list_tools()`。通过将适配器指向该服务器来将范围限制到一台服务器。 |
| `get_prompt(server_name, prompt_name, arguments=...)` | **不支持。** 请参阅[Prompts and resources](#prompts-and-resources)。 |
| `get_resources(server_name, uris=...)` | **不支持。** 请参阅[Prompts and resources](#prompts-and-resources)。 |
| `session(server_name, auto_initialize=...)` |没有暴露。 `list_tools()` 管理会话；每个返回的工具每次调用都会打开自己的会话。参见[connection lifecycle](/oss/python/langchain/mcp/connections#connection-lifecycle)。 |

### 构造函数参数| `MultiServerMCPClient(...)` 论证 | `langchain.mcp` |
| - | - |
| `connections`（连接配置字典）|适配器的 `target`：URL、`Path`、进程内服务器、`MCPConfig` 字典、预构建的 `fastmcp.Client` 或 `ClientGroup`。 |
| `tool_name_prefix` |对于多服务器 `MCPConfig` 或 `ClientGroup` (`{server}_{tool}`)，前缀是自动的。参见[multiple servers](/oss/python/langchain/mcp/connections#multiple-servers)。 |
| `handle_tool_errors` | **作为标志删除。** 行为现已修复：`isError=True` 变为 `ToolMessage(status="error")`；运输故障增加。参见[Tools](/oss/python/langchain/mcp/tools#errors)。 |
| `callbacks` (`Callbacks`) |在`fastmcp.Client`上设置相应的处理程序。参见[Callbacks](#callbacks)。 |
| `tool_interceptors` (`ToolCallInterceptor`) |使用LangChain[⟦T80⟧](#tool-interceptors)中间件。 |

## 连接配置

`langchain-mcp-adapters` 使用类型化连接类。 [⟦T82⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter) 推断传输，或者您通过 `fastmcp` 传输进行完全控制。

| `langchain-mcp-adapters` | `langchain.mcp` |
| - | - |
| `StdioConnection` | `Path` 目标，或带有 `command`/`args` 的 `MCPConfig` 条目。 |
| `StreamableHttpConnection` | `http`/`https` URL 目标，或带有 `url` 的 `MCPConfig` 条目。 |
| `SSEConnection` | `Client(SSETransport(url))`，传递至[⟦T98⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter)。支持，但传输已弃用。参见[Deprecated transports](#deprecated-transports)。 |
| `WebsocketConnection` |无 FastMCP 传输。将服务器迁移到 Streamable HTTP。参见[Deprecated transports](#deprecated-transports)。 |
| `httpx_client_factory` |设置在`fastmcp`交通工具上。参见[shared connection pool](/oss/python/langchain/mcp/connections#shared-connection-pool)。 |
| `auth`（每个连接）|将 `auth` 设置在 `fastmcp.Client` 上。参见[Authentication](/oss/python/langchain/mcp/auth)。 |
| `headers`（每个连接）|设置在 `fastmcp` 交通工具 (`StreamableHttpTransport(url, headers=...)`) 上。 |### 已弃用的传输

MCP 规范[deprecated the HTTP+SSE transport](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#backwards-compatibility)（协议版本 2024-11-05）支持 Streamable HTTP。 FastMCP 仍然提供 `SSETransport` 以实现向后兼容性，因此 SSE 服务器可以通过 `MCPAdapter(Client(SSETransport(url)))` 继续工作，但更愿意将服务器迁移到 Streamable HTTP。 WebSocket 没有 FastMCP 传输。

## 启发

诱导从客户端上注册的回调移至 LangGraph [⟦T110⟧](https://reference.langchain.com/python/langgraph/types/interrupt)，并且现在默认处于启用状态。 [⟦T111⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter) 武装它构建的每个客户端来宣传该功能并驱动中断循环；当运行暂停时回答服务器的请求，并使用 `Command(resume={"responses": {key: answer}})` 恢复。

| `langchain-mcp-adapters` | `langchain.mcp` |
| - | - |
| `Callbacks(on_elicitation=...)` |自动的。 `MCPAdapter(target)` 武器诱导，无需选择加入。相反，预构建的客户自己的启发处理程序会受到尊重。 |

参见[Elicitation](/oss/python/langchain/mcp/tools#elicitation)。

## 采样和求根

`langchain.mcp` 通过中断回答 **启发** 请求，但不回答 [sampling](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling)（服务器要求客户端运行 LLM 完成）或 [roots](https://modelcontextprotocol.io/specification/2025-06-18/client/roots)（服务器询问客户端可以到达哪些本地路径）。返回任一引发 `NotImplementedError` 的工具调用。这遵循协议。现代 MCP 时代是无会话的，并且没有供服务器调用中间请求的实时反向通道，因此采样和根的推送形式仅存在于传统握手时代。因此，FastMCP 4 从每个时代中删除了 `ctx.sample()` 和 `ctx.list_roots()`。如果您需要通过LangChain、[open an issue](https://github.com/langchain-ai/langchain/issues)答复服务器的采样或根请求。

## 回调

`langchain-mcp-adapters` `Callbacks` 对象消失了，但底层处理程序却没有：FastMCP 直接在其 `Client` 上获取它们。使用您需要的处理程序构建一个`fastmcp.Client`并将其传递给[⟦T125⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter)。

| `Callbacks`领域| `langchain.mcp` |
| - | - |
| `on_elicitation` |作为中断自动处理；无需处理程序。相反，预建客户自己的 `elicitation_handler` 会受到尊重。参见[Elicitation](/oss/python/langchain/mcp/tools#elicitation)。 |
| `on_progress` | `Client(transport, progress_handler=...)`。 |
| `on_logging_message` | `Client(transport, log_handler=...)`。 |

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from fastmcp.client import Client

from langchain.mcp import MCPAdapter

client = Client("https://example.com/mcp", progress_handler=on_progress, log_handler=on_log)
async with MCPAdapter(client) as adapter:
    tools = await adapter.list_tools()
```

请参阅 FastMCP 文档中的[Callback handlers](https://gofastmcp.com/clients/client#callback-handlers)。

## 工具拦截器

`langchain-mcp-adapters`拦截器类型（`tool_interceptors`、`ToolCallInterceptor`、`MCPToolCallRequest`、`MCPToolCallResult`）消失了。拦截工具使用 LangChain [⟦T139⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/wrap_tool_call) 中间件调用代理端，该中间件包装了 `create_agent` 运行的每个工具，而不仅仅是 MCP 工具。 MCP 出处可在`metadata["mcp"]`下的工具元数据中找到，因此拦截器仍然可以在其上分支：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from collections.abc import Callable

from langchain.agents import create_agent
from langchain.agents.middleware import wrap_tool_call
from langchain.mcp import MCPAdapter
from langchain.messages import ToolMessage
from langchain.tools.tool_node import ToolCallRequest


@wrap_tool_call
def log_mcp_calls(
    request: ToolCallRequest,
    handler: Callable[[ToolCallRequest], ToolMessage],
) -> ToolMessage:
    """Intercept every tool call, MCP or otherwise, before and after it runs."""
    # Inspect or rewrite the request here; MCP provenance is on the tool's
    # metadata under `request.tool.metadata["mcp"]`.
    print(f"calling {request.tool_call['name']}")
    result = handler(request)
    print(f"-> {request.tool_call['name']} done")
    return result


async def agent_with_interception(target):
    async with MCPAdapter(target) as adapter:
        tools = await adapter.list_tools()
        return create_agent("claude-sonnet-5", tools, middleware=[log_mcp_calls])
```

## 错误处理`handle_tool_errors` 标志消失了。行为现已修复：报告 `isError=True` 作为 [⟦T144⟧](https://reference.langchain.com/python/langchain-core/messages/tool/ToolMessage) 到达模型，其中 `status="error"` 携带服务器消息，同时会引发传输故障。参见[Tools](/oss/python/langchain/mcp/tools#errors)。

## 身份验证

Auth 转移到了`fastmcp.Client`。构建一个客户端，将 `auth` 设置为不记名令牌、文字 `"oauth"` 或任何 `httpx.Auth`，而不是连接配置上的 `auth` 和 `headers`，并将该客户端传递给 [⟦T152⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter)。支持每服务器和每用户身份验证。参见[Authentication](/oss/python/langchain/mcp/auth)。

## 工具结果

工具结果处理被保留并扩展。

| `langchain-mcp-adapters` | `langchain.mcp` |
| - | - |
| `MCPToolArtifact`（结构化内容）| **保留。** 从`langchain.mcp` 导出。参见[structured content](/oss/python/langchain/mcp/tools#structured-content)。 |
|多模式内容块 | **保留。** 请参阅[multimodal content](/oss/python/langchain/mcp/tools#multimodal-content)。 |
|工具元数据 | **扩展。** 分组在工具元数据的 `mcp` 命名空间下，带有注释和服务器标识。参见[tool metadata](/oss/python/langchain/mcp/tools#tool-metadata)。 |
| `convert_mcp_tool_to_langchain_tool` |重命名为[⟦T159⟧](https://reference.langchain.com/python/langchain/mcp/tools/as_langchain_tool)，现在是一个协程：`await as_langchain_tool(tool, client)`。 |
| `to_fastmcp`（LangChain工具→FastMCP工具）|尚无 `langchain.mcp` 等效项。如果您将 LangChain 工具转换为 MCP 工具，[open an issue](https://github.com/langchain-ai/langchain/issues) — 我们希望了解使用案例。 |

## 提示和资源`langchain.mcp` 专注于工具，尚未包装 MCP [prompts](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts) 或 [resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)。这些 `langchain-mcp-adapters` 助手目前没有 `langchain.mcp` 等效项：

| `langchain-mcp-adapters` | `langchain.mcp` |
| - | - |
| `load_mcp_prompt`、`get_prompt`、`convert_mcp_prompt_message_to_langchain_message` |还没有包装 |
| `load_mcp_resources`、`get_resources`、`get_mcp_resource`、`convert_mcp_resource_to_langchain_blob` |还没有包装 |

我们还没有看到足够的需求来优先考虑一流的包装机。如果您有一个用例，[open an issue](https://github.com/langchain-ai/langchain/issues)——我们真的很想听听它，它可以帮助我们确定优先顺序。同时，您可以直接通过FastMCP客户端阅读提示和资源：`client.get_prompt(...)`和`client.read_resource(...)`。请参阅 FastMCP 文档中的 [Reading resources](https://gofastmcp.com/clients/resources) 和 [Getting prompts](https://gofastmcp.com/clients/prompts)。

## MCP 协议中已弃用

一些`langchain-mcp-adapters`功能没有替代品，因为MCP协议本身弃用或删除了它们所依赖的机制，而不是因为`langchain.mcp`选择放弃它们。 `langchain.mcp` 通过 FastMCP 4 瞄准现代无会话协议时代。|机制|协议状态 |对移民的影响|
| - | - | - |
| HTTP+SSE 传输 | [Deprecated](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#backwards-compatibility)（协议 2024-11-05）支持 Streamable HTTP | SSE 仍然通过 FastMCP 的 `SSETransport` 工作，但更喜欢将服务器迁移到 Streamable HTTP。 WebSocket 没有 FastMCP 传输。 |
|服务器推送采样和根 |脱离现代；无会话协议没有实时反向通道。 FastMCP 4 从每个时代删除了 `ctx.sample()` 和 `ctx.list_roots()` | `langchain.mcp` 没有回答。参见[Sampling and roots](#sampling-and-roots)。 |
|服务器推送的启发 |现代时代用需要输入的轮次取代了推送的请求 |通过中断而不是回调来应答。参见[Elicitation](#elicitation)。 |
| JSON-RPC 批处理 | [Removed](https://modelcontextprotocol.io/specification/2025-06-18/changelog)（协议2025-06-18）|不适用；请求是单独发送的。 |

## 另请参阅

* [Model Context Protocol (MCP)](/oss/python/langchain/mcp)
* [FastMCP client documentation](https://gofastmcp.com/clients/client)
* [MCP specification](https://modelcontextprotocol.io)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/migrate/langchain-mcp-adapters.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>