<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Authentication | https://docs.langchain.com/oss/python/langchain/mcp/auth -->

# 认证

使用不记名令牌、OAuth 2.1 或 LangChain 中的每用户凭据对 MCP 连接进行身份验证。

大多数远程 MCP 服务器需要身份验证。 [⟦T5⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter) 将身份验证委托给 FastMCP，因此 `fastmcp.Client` 接受的任何凭证都有效：静态 [bearer token](#bearer-token)、完整的 [OAuth 2.1](#oauth-authentication) 流或任何 [⟦T7⟧](https://www.python-httpx.org/advanced/authentication/)。将凭据传递到预构建的客户端上，并将该客户端交给适配器。当一个代理与多个服务器对话时，使用[per-server authentication](#per-server-authentication)；在部署中，使用[per-user authentication](#per-user-authentication)，以便每次运行都作为调用者到达服务器。

> [!注意]
>
> `langchain.mcp` 命名空间需要 `langchain[mcp]>=1.4.0` 并且处于测试阶段。 API 可能会更改。

## 不记名令牌

最简单的情况：服务器验证您配置的令牌并将其添加到 `Authorization: Bearer <token>` 标头中。没有发现、浏览器或刷新。将令牌作为客户端的`auth`传递：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from fastmcp.client import Client
from langchain.mcp import MCPAdapter


async def load_tools_with_bearer(url: str, token: str) -> list:
    # `auth` accepts a bearer-token string, the literal "oauth" (full OAuth 2.1
    # with dynamic client registration), or any `httpx.Auth`.
    async with MCPAdapter(Client(url, auth=token)) as adapter:
        return await adapter.list_tools()
```

`auth` 参数接受不记名令牌字符串、文字 `"oauth"` 或任何 `httpx.Auth`。在 `MCPConfig` 队列中，每个服务器都使用相同的密钥。

## OAuth 认证对于颁发自己的凭据的服务器，请传递文字字符串 `"oauth"`。 FastMCP 运行完整的 OAuth 2.1 流程：发现、[dynamic client registration](https://modelcontextprotocol.io/specification/draft/basic/authorization)、浏览器重定向和令牌交换。动态客户端注册意味着客户端在运行时自行注册，而不是您预先配置客户端 ID：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
async def load_tools_with_oauth(url: str) -> list:
    # "oauth" runs discovery, dynamic client registration, the browser redirect,
    # and the token exchange. Pass `OAuth(..., token_storage=...)` to persist
    # tokens across runs instead of repeating the browser step each time.
    async with MCPAdapter(Client(url, auth="oauth")) as adapter:
        return await adapter.list_tools()
```

默认情况下，令牌保存在内存中，因此每次运行都会重复浏览器步骤。传递带有令牌存储的预构建的 `OAuth` 提供程序，以在运行期间保留它们：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from fastmcp.client import Client
from fastmcp.client.auth import OAuth

oauth = OAuth(mcp_url="https://example.com/mcp", token_storage=...)
client = Client("https://example.com/mcp", auth=oauth)
```

FastMCP 为常见身份提供商提供了提供商（Auth0、WorkOS、Okta 等）；客户端运行的流程在它们之间是相同的。请参阅 FastMCP 文档中的[OAuth authentication](https://gofastmcp.com/clients/auth/oauth)。

## 每服务器身份验证

当一个代理与多台服务器通信时，每台服务器可能需要自己的凭据。为每个客户端提供自己的连接[⟦T18⟧](/oss/python/langchain/mcp/connections#independent-connections-with-clientgroup)，并为每个客户端设置`auth`，以便每个服务器独立进行身份验证：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from fastmcp.client.group import ClientGroup


async def load_with_per_server_auth(
    billing_url: str, docs_token: str, docs_url: str
) -> list:
    # Each server carries its own credential. A `ClientGroup` keeps one
    # connection per server, so each authenticates independently.
    group = ClientGroup(
        {
            "billing": Client(billing_url, auth="oauth"),
            "docs": Client(docs_url, auth=docs_token),
        }
    )
    async with MCPAdapter(group) as adapter:
        return await adapter.list_tools()
```

## 每用户身份验证

在部署中，每次运行都应以启动它的用户身份到达 MCP 服务器，而不是使用一个共享凭据。该模式有两半：1. **在 LangGraph 服务器上对调用者进行身份验证。** [custom auth handler](/langsmith/auth) 将传入请求解析为用户身份，每次运行都会读取其运行时。
2. **为该用户创建或交换凭证。** 在 [graph factory](/oss/python/langchain/mcp/connections#scale-a-deployment) 内，读取用户的身份并使用每用户令牌构建 MCP 客户端，以便连接携带该用户的授权。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from fastmcp.client import Client
from fastmcp.client.auth import BearerAuth

CONFIG = {
    "mcpServers": {
        "docs": { "url": "https://example.com/mcp" }
    }
}

async def make_graph(runtime):
    user = runtime.user.identity if runtime.user is not None else "anonymous"
    auth = BearerAuth(token_for(user))  # exchange for a per-user token
    async with MCPAdapter(Client(CONFIG, auth=auth)) as adapter:
        tools = await adapter.list_tools()
        return create_agent("claude-sonnet-5", tools)
```

在生产中，`token_for` 代表部署中已有的任何内容：用于交换每个用户令牌的会话的 OAuth 网关，或用于每个身份运行授权代码流的 `fastmcp.client.auth` 提供程序。隔离每个用户的任何[cached responses](/oss/python/langchain/mcp/connections#caching)，关闭经过验证的身份，因此一个用户永远不会看到另一个用户的缓存工具列表。

## 另请参阅

* [FastMCP OAuth authentication](https://gofastmcp.com/clients/auth/oauth)
* [FastMCP bearer token authentication](https://gofastmcp.com/clients/auth/bearer)
* [FastMCP machine-to-machine authentication](https://gofastmcp.com/clients/auth/client-credentials)
* [FastMCP client groups](https://gofastmcp.com/clients/client-groups) — 每个服务器身份验证的独立连接
* [FastMCP server authentication providers](https://gofastmcp.com/servers/auth/authentication)
* [MCP authorization specification](https://modelcontextprotocol.io/specification/draft/basic/authorization)
* [Custom authentication for a LangGraph server](/langsmith/auth)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/mcp/auth.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。