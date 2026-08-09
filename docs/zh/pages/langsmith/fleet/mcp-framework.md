<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Tool Server | https://docs.langchain.com/langsmith/fleet/mcp-framework -->

# LangSmith 工具服务器

LangSmith 工具服务器是一个独立的 MCP 框架，用于构建和部署具有内置身份验证和授权的工具。当您想要执行以下操作时，请使用工具服务器：

* [Create custom tools](#create-a-custom-toolkit) 与 LangSmith 的 [Agent Auth](/langsmith/agent-auth) 集成以进行 OAuth 身份验证
* [Build an MCP gateway](#use-as-an-mcp-gateway) 适用于您自己构建的代理（在舰队之外）

<Note>
  如果您使用[Fleet](/langsmith/fleet/index)，则无需直接与工具服务器交互。 Fleet 提供[built-in tools](/langsmith/fleet/tools) 并支持[remote MCP servers](/langsmith/fleet/remote-mcp-servers)，无需安装工具服务器。

  但是，您可以将关联的工具服务器实例配置为 MCP 服务器，这将允许您在代理中使用自定义 MCP 服务器。
</Note>

下载 [PyPI package](https://pypi.org/project/langsmith-tool-server/) 开始使用。

## 创建自定义工具包

安装LangSmith工具服务器和LangChain CLI：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install langsmith-tool-server
pip install langchain-cli-v2
```

创建一个新的工具包：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langchain tools new my-toolkit
cd my-toolkit
```

这将创建一个具有以下结构的工具包：

```
my-toolkit/
├── pyproject.toml
├── toolkit.toml
└── my_toolkit/
    ├── __init__.py
    ├── auth.py
    └── tools/
        ├── __init__.py
        └── ...
```

使用 `@tool` 装饰器定义您的工具。有关工具架构、返回值、错误处理和`ToolRuntime`的更多信息，请参阅[Tools guide](/oss/python/langchain/tools)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith_tool_server import tool

@tool
def hello(name: str) -> str:
    """Greet someone by name."""
    return f"Hello, {name}!"

@tool
def add(x: int, y: int) -> int:
    """Add two numbers."""
    return x + y

TOOLS = [hello, add]
```

运行服务器：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langchain tools serve
```

您的工具服务器将在`http://localhost:8000`启动。

## 通过MCP协议调用工具

以下是列出可用工具并调用 `add` 工具的示例：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio
import aiohttp

async def mcp_request(url: str, method: str, params: dict = None):
    async with aiohttp.ClientSession() as session:
        payload = {"jsonrpc": "2.0", "method": method, "params": params or {}, "id": 1}
        async with session.post(f"{url}/mcp", json=payload) as response:
            return await response.json()

async def main():
    url = "http://localhost:8000"

    tools = await mcp_request(url, "tools/list")
    print(f"Tools: {tools}")

    result = await mcp_request(url, "tools/call", {"name": "add", "arguments": {"a": 5, "b": 3}})
    print(f"Result: {result}")

asyncio.run(main())
```## 用作 MCP 网关

LangSmith 工具服务器可以充当 MCP 网关，将来自多个 MCP 服务器的工具聚合到单个端点。在 `toolkit.toml` 中配置 MCP 服务器：

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[toolkit]
name = "my-toolkit"
tools = "./my_toolkit/__init__.py:TOOLS"

[[mcp_servers]]
name = "weather"
transport = "streamable_http"
url = "http://localhost:8001/mcp/"

[[mcp_servers]]
name = "math"
transport = "stdio"
command = "python"
args = ["-m", "mcp_server_math"]
```

连接的 MCP 服务器中的所有工具都通过服务器的 `/mcp` 端点公开。 MCP 工具以其服务器名称为前缀以避免冲突（例如，`weather_get_forecast`、`math_add`）。

## 验证

### 第三方 API 的 OAuth

对于需要访问第三方 API 的工具（如 Google、GitHub、Slack 等），可以使用 [Agent Auth](/langsmith/agent-auth) 进行 OAuth 身份验证。

在工具中使用 OAuth 之前，您需要在 LangSmith 工作区设置中配置 OAuth 提供程序。请参阅 [Agent Auth documentation](/langsmith/agent-auth) 了解设置说明。

配置完成后，在工具装饰器中指定 `auth_provider`：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith_tool_server import tool, Context
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

@tool(
    auth_provider="google",
    scopes=["https://www.googleapis.com/auth/gmail.readonly"],
    integration="gmail"
)
async def read_emails(context: Context, max_results: int = 10) -> str:
    """Read recent emails from Gmail."""
    credentials = Credentials(token=context.token)
    service = build('gmail', 'v1', credentials=credentials)
    # ... Gmail API calls
    return f"Retrieved {max_results} emails"
```

具有 `auth_provider` 的工具必须：

* 将`context: Context`作为第一个参数
* 至少指定一个范围
* 使用`context.token`进行经过身份验证的API调用

### 自定义请求认证

自定义身份验证允许您验证请求并与您的身份提供商集成。在您的 `auth.py` 文件中定义身份验证处理程序：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith_tool_server import Auth

auth = Auth()

@auth.authenticate
async def authenticate(authorization: str = None) -> dict:
    """Validate requests and return user identity."""
    if not authorization or not authorization.startswith("Bearer "):
        raise auth.exceptions.HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    token = authorization.replace("Bearer ", "")
    # Validate token with your identity provider
    user = await verify_token_with_idp(token)

    return {"identity": user.id}
```

该处理程序针对每个请求运行，并且必须返回带有 `identity`（以及可选的 `permissions`）的字典。

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/mcp-framework.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>