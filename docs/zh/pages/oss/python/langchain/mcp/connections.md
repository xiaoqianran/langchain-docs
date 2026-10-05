<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connections | https://docs.langchain.com/oss/python/langchain/mcp/connections -->

# 连接数

LangChain 中的连接生命周期、多服务器、部署扩展、协议时代和 MCP 缓存。

<Note>
  `langchain.mcp` 命名空间需要 `langchain[mcp]>=1.4.0` 并且处于测试阶段。 API 可能会更改。
</Note>

[⟦T9⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter) 打开 MCP 连接，发现工具，并返回代理可以调用的 LangChain 工具。如何传递服务器以及使适配器保持打开状态的时间取决于应用程序的形状。连接本身是 FastMCP 的；此页面涵盖了 LangChain 模式并链接到 FastMCP 以获取传输和客户端详细信息。

首选[default lifecycle](#connection-lifecycle)，除非您要连接到多个服务器或部署许多并发运行。有关单个目标的含义（URL、脚本路径、进程内服务器），请参阅[Transports](/oss/python/langchain/mcp#transports)。

## 选择一种模式

从每个表中选择一行。服务器形态和连接寿命是独立的；任何形状适用于任何寿命。

**服务器形状**

|如果您需要... |使用 |前往 |
| - | - | - |
|一台服务器 | URL、`Path` 或进程内目标 | [Transports](/oss/python/langchain/mcp#transports) |
|一个连接背后有多个服务器 | `MCPConfig` 字典 | [MCPConfig](#one-aggregate-connection-with-mcpconfig) |
|具有独立身份验证、协议时代或池的多个服务器 | [⟦T12⟧](https://gofastmcp.com/clients/client-groups) | [ClientGroup](#independent-connections-with-clientgroup) |

**连接寿命**|情况|图案|前往 |
| - | - | - |
|脚本、笔记本或大多数代理|探索`async with`内部，然后退出 | [Connection lifecycle](#connection-lifecycle) |
|在一次运行中跨多个工具调用保持一个会话 |在座席呼叫期间保持适配器打开 | [One session per invocation](#one-session-per-invocation) |
|部署中的许多并发运行 |每次运行发现；重复使用 [shared pool](#shared-connection-pool) 和 [cache](#caching) | [Scale a deployment](#scale-a-deployment) |

## 连接生命周期

[⟦T14⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter) 是一个异步上下文管理器。输入它连接底层客户端；退出它会释放连接。发现发生在上下文内部，但它返回的工具保留客户端，因此它们在上下文退出后仍然可调用。

发现工具并构建代理（默认模式）：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.mcp import MCPAdapter


async def build_agent(target):
    # Discover and build the agent inside the adapter's context. The tools hold
    # the client, so the agent stays usable after the context exits.
    async with MCPAdapter(target) as adapter:
        tools = await adapter.list_tools()
        return create_agent("claude-sonnet-5", tools)
```

您无需在代理的生命周期内保持适配器处于打开状态。更喜欢这种模式，除非您是 [holding a session open](#one-session-per-invocation) 或 [scaling a deployment](#scale-a-deployment)。

### 每次调用一个会话[⟦T15⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter) 返回的工具是可重入的：每次调用工具时，它都会打开客户端，运行 MCP 调用，然后释放它，无论连接是否已在其他地方保持。因此，单个代理运行会为每个工具调用打开一个会话，并在调用返回时关闭它，而不是在整个运行过程中保持会话打开。这可以防止长时间运行的代理在工具调用之间固定空闲连接，这也是工具在发现上下文退出后保持可调用状态的原因。

如果您希望会话在多个调用中保持打开状态，请在调用代理时保持适配器的上下文打开。可重入客户端重用现有连接，而不是打开第二个连接。

## 多个服务器

要为多台服务器提供一个代理工具，当单个聚合连接足够时选择`MCPConfig`，或者当每台服务器需要自己的连接时选择`ClientGroup`（每个客户端配置不同的[protocol eras](#protocol-eras)、[per-server authentication](/oss/python/langchain/mcp/auth#per-server-authentication)或[shared pool](#shared-connection-pool)）。

### 与 `MCPConfig` 的一个聚合连接为适配器提供一个 `MCPConfig` 字典，以连接到一个聚合端点后面的多个服务器。 FastMCP 为每个工具添加其配置密钥前缀，因此公开相同工具名称的两个服务器在传递给模型的列表中保持可区分：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.mcp import MCPAdapter

CONFIG = {
    "mcpServers": {
        "weather": {"command": "python", "args": ["/path/to/weather_server.py"]},
        "calc": {"command": "python", "args": ["/path/to/calc_server.py"]},
    }
}


async def fleet_agent(config):
    async with MCPAdapter(config) as adapter:
        # Every tool is prefixed with its config key (`weather_...`, `calc_...`),
        # so two servers exposing the same tool name stay distinguishable.
        tools = await adapter.list_tools()
        return create_agent("claude-sonnet-5", tools)
```

每个后端都是独立寻址的，因此队列可以混合传输：一台服务器通过 stdio，另一台服务器通过 HTTP。不过，`MCPConfig` 队列在每个后端共享单个协商的 [protocol era](#protocol-eras)：添加仅旧版服务器，整个队列就会下降到旧版时代。

### 与`ClientGroup`的独立连接

要使每个服务器保持自己的连接，请传递 [⟦T22⟧](https://gofastmcp.com/clients/client-groups)。每个成员都保留自己协商的协议版本、身份验证和处理程序，并且该组将每个呼叫路由回通告该工具的客户端。这就是让传统服务器和现代服务器并行运行的原因，并且它以相同的方式命名工具，因此服务器之间相同的工具名称永远不会冲突：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from fastmcp.client import Client
from fastmcp.client.group import ClientGroup
from langchain.agents import create_agent
from langchain.mcp import MCPAdapter


async def agent_from_group(legacy_url: str, modern_url: str):
    # One connection per server: a `ClientGroup` keeps each server on its own
    # negotiated protocol era, so a legacy and a modern server run side by side.
    # It also namespaces every tool as `{server}_{tool}`, so two servers exposing
    # the same tool name stay distinct.
    group = ClientGroup(
        {
            "weather": Client(legacy_url, mode="legacy"),
            "calc": Client(modern_url, mode="auto"),
        }
    )
    async with MCPAdapter(group) as adapter:
        tools = await adapter.list_tools()
        return create_agent("claude-sonnet-5", tools)
```

## 扩展部署为多次运行提供服务的部署应该发现每次运行，但在下面重用其连接，而不是在每次请求时重新连接。在 [⟦T23⟧](/oss/python/langgraph/local-server) 图工厂内构建代理，以便每次运行都会获取当前的工具目录，并让 [shared connection pool](#shared-connection-pool) 和 [response cache](#caching) 吸收成本：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
SERVERS = {
    "weather": "http://localhost:8001/mcp",
    "calc": "http://localhost:8002/mcp",
}


async def make_graph():
    """Build an agent over an MCP fleet. Called once per run by `langgraph dev`."""
    config = {"mcpServers": {name: {"url": url} for name, url in SERVERS.items()}}
    # A long-lived deployment discovers per run, but reuses one HTTP connection
    # pool underneath. `cache_mode="use"` serves a cached tool list within the
    # server's TTL instead of re-listing on every run.
    async with MCPAdapter(config) as adapter:
        tools = await adapter.list_tools(cache_mode="use")
        return create_agent("claude-sonnet-5", tools)
```

<Note>
  在`langgraph dev`图工厂中，带注释的参数类型和返回类型必须在运行时可导入，而不仅仅是在`TYPE_CHECKING`下。 `langgraph-api`将工厂分类为`typing.get_type_hints()`；如果注释无法解析，它会注入配置字典而不是运行时。
</Note>

有关完整工作的部署示例，包括为每个调用者创建令牌的每用户身份验证，请参阅[Authentication](/oss/python/langchain/mcp/auth#per-user-authentication)。

### 共享连接池

默认情况下，每个 FastMCP 客户端管理自己的 HTTP 连接。在一组服务器或许多并发运行中，这意味着许多独立的池。要共享一个池，请传递一个从单一传输中提取的`httpx_client_factory`，并将其借出而不让任何一个客户端关闭它：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import httpx2
from fastmcp.client import Client
from fastmcp.client.group import ClientGroup
from fastmcp.client.transports import StreamableHttpTransport
from langchain.mcp import MCPAdapter

# One connection pool, shared by every server the deployment talks to.
_POOL = httpx2.AsyncHTTPTransport()


class _SharedPool(httpx2.AsyncBaseTransport):
    """Lend `_POOL` to each client without letting any client close it."""

    handle_async_request = _POOL.handle_async_request

    async def aclose(self) -> None: ...


def _client_factory(**kwargs: object) -> httpx2.AsyncClient:
    return httpx2.AsyncClient(transport=_SharedPool(), **kwargs)


async def load_over_shared_pool(servers: dict[str, str]) -> list:
    # Every client draws HTTP connections from the same pool, so a fleet of
    # servers does not each open its own.
    group = ClientGroup(
        {
            name: Client(
                StreamableHttpTransport(url, httpx_client_factory=_client_factory)
            )
            for name, url in servers.items()
        }
    )
    async with MCPAdapter(group) as adapter:
        return await adapter.list_tools()
```

由于每个客户端都借用 `_POOL`，因此部署会为整个队列打开一组 HTTP 连接，而不是为每个服务器打开一组 HTTP 连接。

## 缓存FastMCP 可以缓存`list_tools` 的结果，因此重复发现可以避免网络往返。缓存是可选的，并遵循服务器自己的缓存提示，因此它仅对宣传它们的现代服务器有效。

`list_tools()` 接受 `cache_mode` 选择发现如何读取配置的缓存：

* **`use`**（默认）：当存在且仍在服务器的 TTL 提示内时提供缓存的工具列表，否则获取并存储。
* **`refresh`**：从服务器获取新列表并重新填充缓存。
* **`bypass`**：完全跳过缓存。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
tools = await adapter.list_tools(cache_mode="refresh")
```

缓存及其每主体隔离是在客户端本身配置的，使用`Client(cache=...)`。对于跨副本队列的共享存储，或对每个用户的缓存响应进行分区，请参阅 FastMCP 文档中的[Response caching](https://gofastmcp.com/clients/client#response-caching)。

## 协议时代

MCP 改变了客户端和服务器就各自支持的内容达成一致的方式。 **传统**时代的每一次连接都以`initialize`握手开始； **现代**时代（协议版本`2026-07-28`及更高版本）通过探测服务器的`server/discover`端点来发现支持。 FastMCP 会协商每个连接的纪元，因此LangChain 端无需知道给定服务器正在讲话。要将来自不同时代服务器的工具保存在一个代理中，请为每个代理提供自己的连接，以便它通过[⟦T40⟧](#independent-connections-with-clientgroup)或每台服务器一个适配器保持其服务器支持的最佳时代。预构建的 `fastmcp.Client` 使用其 `mode` 参数选择时代：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from fastmcp.client import Client


async def agent_across_eras(legacy_target, modern_target):
    # MCP has two protocol eras. FastMCP negotiates per connection, so a
    # separate adapter per server lets each keep the best era its own server
    # supports. `mode="legacy"` pins the handshake era; `mode="auto"` (the
    # default) negotiates the newest the server understands.
    legacy = Client(legacy_target, mode="legacy")
    modern = Client(modern_target, mode="auto")
    async with (
        MCPAdapter(legacy) as legacy_adapter,
        MCPAdapter(modern) as modern_adapter,
    ):
        tools = await legacy_adapter.list_tools() + await modern_adapter.list_tools()
        return create_agent("claude-sonnet-5", tools)
```

相反，将两台服务器作为单个`MCPConfig`舰队传递将为舰队所拥有的一切协商一个时代，从而将每台服务器降至任何成员所需的最旧时代。

有关完整的协商规则，请参阅 FastMCP 文档中的[Protocol negotiation](https://gofastmcp.com/clients/client#protocol-negotiation)。

## 另请参阅

* [Authentication](/oss/python/langchain/mcp/auth)：承载、OAuth 和每用户凭据。

* [Deploy a LangGraph server](/oss/python/langgraph/local-server)：用于长期部署的图工厂。

* [FastMCP connection lifecycle](https://gofastmcp.com/clients/client#connection-lifecycle)

* [MCP configuration format](https://gofastmcp.com/integrations/mcp-json-configuration)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/mcp/connections.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>