<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Model Context Protocol (MCP) | https://docs.langchain.com/oss/python/langchain/mcp -->

# 模型上下文协议 (MCP)

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) 是一个开放协议，它标准化了应用程序如何向法学硕士提供工具和上下文。 LangChain代理可以使用MCP服务器上通过[⟦T37⟧](https://github.com/langchain-ai/langchain-mcp-adapters)库定义的工具。

## 快速入门

安装`langchain-mcp-adapters`库：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain-mcp-adapters
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-mcp-adapters
  ```
</CodeGroup>

`langchain-mcp-adapters` 使代理能够使用跨一台或多台 MCP 服务器定义的工具。

<Note>
  `MultiServerMCPClient` **默认情况下是无状态的**。每次工具调用都会创建一个新的 MCP `ClientSession`，执行该工具，然后进行清理。有关更多详细信息，请参阅[stateful sessions](#stateful-sessions)部分。
</Note>

```python Accessing multiple MCP servers icon="server" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio
from langchain_mcp_adapters.client import MultiServerMCPClient  # [!code highlight]
from langchain.agents import create_agent

async def main():
    client = MultiServerMCPClient(  # [!code highlight]
        {
            "math": {
                "transport": "stdio",  # Local subprocess communication
                "command": "python",
                # Absolute path to your math_server.py file
                "args": ["/path/to/math_server.py"],
            },
            "weather": {
                "transport": "http",  # HTTP-based remote server
                # Ensure you start your weather server on port 8000
                "url": "http://localhost:8000/mcp",
            }
        }
    )

    tools = await client.get_tools()  # [!code highlight]
    agent = create_agent(
        "claude-sonnet-4-6",
        tools  # [!code highlight]
    )
    math_response = await agent.ainvoke(
        {"messages": [{"role": "user", "content": "what's (3 + 5) x 12?"}]}
    )
    weather_response = await agent.ainvoke(
        {"messages": [{"role": "user", "content": "what is the weather in nyc?"}]}
    )
    print(math_response)
    print(weather_response)

if __name__ == "__main__":
    asyncio.run(main())
```

<Tip>
  使用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-mcp) 跟踪 MCP 工具调用以及代理的推理步骤。按照[tracing quickstart](/langsmith/trace-with-langchain)进行设置。
</Tip>

## 自定义服务器

要创建自定义 MCP 服务器，请使用 [FastMCP](https://gofastmcp.com/getting-started/welcome) 库：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install fastmcp
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add fastmcp
  ```
</CodeGroup>

要使用 MCP 工具服务器测试您的代理，请使用以下示例：

<CodeGroup>
  ```python title="Math server (stdio transport)" icon="device-floppy" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from fastmcp import FastMCP

  mcp = FastMCP("Math")

  @mcp.tool()
  def add(a: int, b: int) -> int:
      """Add two numbers"""
      return a + b

  @mcp.tool()
  def multiply(a: int, b: int) -> int:
      """Multiply two numbers"""
      return a * b

  if __name__ == "__main__":
      mcp.run(transport="stdio")
  ```

  ```python title="Weather server (streamable HTTP transport)" icon="wifi" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from fastmcp import FastMCP

  mcp = FastMCP("Weather")

  @mcp.tool()
  async def get_weather(location: str) -> str:
      """Get weather for location."""
      return "It's always sunny in New York"

  if __name__ == "__main__":
      mcp.run(transport="streamable-http")
  ```
</CodeGroup>

## 交通

MCP 支持客户端-服务器通信的不同传输机制。

### HTTP

`http` 传输（也称为 `streamable-http`）使用 HTTP 请求进行客户端-服务器通信。更多详情请参阅[MCP HTTP transport specification](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http)。使用您自己运行的服务器的本地 URL，或托管 URL，例如 [LangChain docs MCP server](/use-these-docs) (`https://docs.langchain.com/mcp`)，它是公共的，不需要 API 密钥。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient(
    {
        "mcp": {
            "transport": "http",
            # "url": "http://localhost:8000/mcp",  # Local server
            "url": "https://docs.langchain.com/mcp",  # Hosted server
        }
    }
)
tools = await client.get_tools()
agent = create_agent("openai:gpt-5.4", tools)
response = await agent.ainvoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "How do I connect LangChain to an MCP server over HTTP?",
            }
        ]
    }
)
```

#### 传递标头

通过 HTTP 连接到 MCP 服务器时，您可以使用连接配置中的 `headers` 字段包含自定义标头（例如，用于身份验证或跟踪）。 `sse`（MCP 规范已弃用）和 `streamable_http` 传输支持此功能。

```python Passing headers with MultiServerMCPClient theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent

client = MultiServerMCPClient(
    {
        "weather": {
            "transport": "http",
            "url": "http://localhost:8000/mcp",
            "headers": {  # [!code highlight]
                "Authorization": "Bearer YOUR_TOKEN",  # [!code highlight]
                "X-Custom-Header": "custom-value"  # [!code highlight]
            },  # [!code highlight]
        }
    }
)
tools = await client.get_tools()
agent = create_agent("openai:gpt-5.5", tools)
response = await agent.ainvoke({"messages": "what is the weather in nyc?"})
```

#### 身份验证

`langchain-mcp-adapters` 库在底层使用官方的 [MCP SDK](https://github.com/modelcontextprotocol/python-sdk)，它允许您通过实现 `httpx.Auth` 接口来提供自定义身份验证机制。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient(
    {
        "weather": {
            "transport": "http",
            "url": "http://localhost:8000/mcp",
            "auth": auth, # [!code highlight]
        }
    }
)
```

* [Example custom auth implementation](https://github.com/modelcontextprotocol/python-sdk/blob/main/examples/clients/simple-auth-client/mcp_simple_auth_client/main.py)
* [Built-in OAuth flow](https://github.com/modelcontextprotocol/python-sdk/blob/main/src/mcp/client/auth/oauth2.py#L216)

### 标准输入输出

客户端将服务器作为子进程启动，并通过标准输入/输出进行通信。最适合本地工具和简单的设置。

<Note>
  与 HTTP 传输不同，`stdio` 连接本质上是**有状态**：子进程在客户端连接的生命周期内持续存在。但是，当在没有显式会话管理的情况下使用`MultiServerMCPClient`时，每个工具调用仍然会创建一个新会话。有关管理持久连接，请参阅[stateful sessions](#stateful-sessions)。
</Note>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client = MultiServerMCPClient(
    {
        "math": {
            "transport": "stdio",
            "command": "python",
            "args": ["/path/to/math_server.py"],
        }
    }
)
```

## 有状态会话默认情况下，`MultiServerMCPClient` 是**无状态**：每个工具调用都会创建一个新的 MCP 会话，执行该工具，然后进行清理。

如果您需要控制 MCP 会话的 [lifecycle](https://modelcontextprotocol.io/specification/2025-03-26/basic/lifecycle)（例如，当使用跨工具调用维护上下文的有状态服务器时），您可以使用 `client.session()` 创建持久性 `ClientSession`。

```python Using MCP ClientSession for stateful tool usage theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.tools import load_mcp_tools
from langchain.agents import create_agent

client = MultiServerMCPClient({...})

# Create a session explicitly
async with client.session("server_name") as session:  # [!code highlight]
    # Pass the session to load tools, resources, or prompts
    tools = await load_mcp_tools(session)  # [!code highlight]
    agent = create_agent(
        "google_genai:gemini-3.6-flash",
        tools
    )
```

## 核心功能

### 工具

[Tools](https://modelcontextprotocol.io/docs/concepts/tools) 允许 MCP 服务器公开 LLM 可以调用的可执行函数来执行操作，例如查询数据库、调用 API 或与外部系统交互。 LangChain将MCP工具转换为LangChain[tools](/oss/python/langchain/tools)，使其可以直接在任何LangChain代理或工作流程中使用。

#### 加载工具

使用 `client.get_tools()` 从 MCP 服务器检索工具并将其传递给您的代理：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent

client = MultiServerMCPClient({...})
tools = await client.get_tools()  # [!code highlight]
agent = create_agent("claude-sonnet-4-6", tools)
```

默认情况下，当 MCP 工具失败时，错误会作为带有 `status="error"` 的工具消息传递回模型，而不是引发异常。这让代理可以读取错误并重试。要引发异常，请在 `MultiServerMCPClient` 或 `load_mcp_tools` 上设置 `handle_tool_errors=False`。

这仅适用于工具执行错误 (`CallToolResult(isError=True)`)。传输、会话和内容转换失败总是会出现。<Note>
  将 MCP 工具错误作为失败的工具消息返回需要 `langchain-mcp-adapters>=0.3.0`。早期版本提高了`ToolException`。
</Note>

#### 结构化内容

MCP 工具可以返回 [structured content](https://modelcontextprotocol.io/specification/2025-03-26/server/tools#structured-content) 以及人类可读的文本响应。当工具除了显示给模型的文本之外还需要返回机器可解析的数据（例如 JSON）时，这非常有用。

当 MCP 工具返回 `structuredContent` 时，适配器将其包装在 [⟦T64⟧](https://reference.langchain.com/python/langchain_mcp_adapters/#langchain_mcp_adapters.tools.MCPToolArtifact) 中并将其作为工具的工件返回。您可以使用 `ToolMessage` 上的 `artifact` 字段访问此信息。您还可以使用[interceptors](#tool-interceptors)自动处理或转换结构化内容。

**从工件中提取结构化内容**

调用代理后，您可以从响应中的工具消息访问结构化内容：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent
from langchain.messages import ToolMessage

client = MultiServerMCPClient({...})
tools = await client.get_tools()
agent = create_agent("claude-sonnet-4-6", tools)

result = await agent.ainvoke(
    {"messages": [{"role": "user", "content": "Get data from the server"}]}
)

# Extract structured content from tool messages
for message in result["messages"]:
    if isinstance(message, ToolMessage) and message.artifact:
        structured_content = message.artifact["structured_content"]
```

**通过拦截器附加结构化内容**

如果您希望结构化内容在对话历史记录中可见（对模型可见），您可以使用 [interceptor](#tool-interceptors) 自动将结构化内容附加到工具结果中：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import json

from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.interceptors import MCPToolCallRequest
from mcp.types import TextContent

async def append_structured_content(request: MCPToolCallRequest, handler):
    """Append structured content from artifact to tool message."""
    result = await handler(request)
    if result.structuredContent:
        result.content += [
            TextContent(type="text", text=json.dumps(result.structuredContent)),
        ]
    return result

client = MultiServerMCPClient({...}, tool_interceptors=[append_structured_content])
```

#### 多模式工具内容MCP 工具可以在响应中返回[multimodal content](https://modelcontextprotocol.io/specification/2025-03-26/server/tools#tool-result)（图像、文本等）。当MCP服务器返回包含多个部分（例如文本和图像）的内容时，适配器将它们转换为LangChain的[standard content blocks](/oss/python/langchain/messages#standard-content-blocks)。您可以通过 `ToolMessage` 上的 `content_blocks` 属性访问标准化表示：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain_mcp_adapters.client import MultiServerMCPClient

async def access_multimodal_tool_content():
    client = MultiServerMCPClient({})
    tools = await client.get_tools()
    agent = create_agent("claude-sonnet-4-6", tools)

    result = await agent.ainvoke(
        {"messages": [{"role": "user", "content": "Take a screenshot of the current page"}]}
    )

    # Access multimodal content from tool messages
    for message in result["messages"]:
        if message.type == "tool":
            # Raw content in provider-native format
            print(f"Raw content: {message.content}")

            # Standardized content blocks  # [!code highlight]
            for block in message.content_blocks:  # [!code highlight]
                if block["type"] == "text":  # [!code highlight]
                    print(f"Text: {block['text']}")  # [!code highlight]
                elif block["type"] == "image":  # [!code highlight]
                    print(f"Image URL: {block.get('url')}")  # [!code highlight]
                    print(f"Image base64: {block.get('base64', '')[:50]}...")  # [!code highlight]
```

这允许您以与提供商无关的方式处理多模式工具响应，无论底层 MCP 服务器如何格式化其内容。

### 资源

[Resources](https://modelcontextprotocol.io/docs/concepts/resources) 允许 MCP 服务器公开可由客户端读取的数据，例如文件、数据库记录或 API 响应。 LangChain将MCP资源转换为[Blob](https://reference.langchain.com/python/langchain_core/documents/#langchain_core.documents.base.Blob)对象，为处理文本和二进制内容提供统一的接口。

#### 加载资源

使用 `client.get_resources()` 从 MCP 服务器加载资源：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient({...})

# Load all resources from a server
blobs = await client.get_resources("server_name")  # [!code highlight]

# Or load specific resources by URI
blobs = await client.get_resources("server_name", uris=["file:///path/to/file.txt"])  # [!code highlight]

for blob in blobs:
    print(f"URI: {blob.metadata['uri']}, MIME type: {blob.mimetype}")
    print(blob.as_string())  # For text content
```

您还可以直接在会话中使用 [⟦T70⟧](https://reference.langchain.com/python/langchain_mcp_adapters/#langchain_mcp_adapters.resources.load_mcp_resources) 以获得更多控制：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.resources import load_mcp_resources

client = MultiServerMCPClient({...})

async with client.session("server_name") as session:
    # Load all resources
    blobs = await load_mcp_resources(session)

    # Or load specific resources by URI
    blobs = await load_mcp_resources(session, uris=["file:///path/to/file.txt"])
```

### 提示

[Prompts](https://modelcontextprotocol.io/docs/concepts/prompts) 允许 MCP 服务器公开可供客户端检索和使用的可重用提示模板。 LangChain 将 MCP 提示转换为[messages](/oss/python/langchain/messages)，使其易于集成到基于聊天的工作流程中。

#### 加载提示

使用 `client.get_prompt()` 从 MCP 服务器加载提示：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient({...})

# Load a prompt by name
messages = await client.get_prompt("server_name", "summarize")  # [!code highlight]

# Load a prompt with arguments
messages = await client.get_prompt(  # [!code highlight]
    "server_name",  # [!code highlight]
    "code_review",  # [!code highlight]
    arguments={"language": "python", "focus": "security"}  # [!code highlight]
)  # [!code highlight]

# Use the messages in your workflow
for message in messages:
    print(f"{message.type}: {message.content}")
```您还可以直接在会话中使用 [⟦T72⟧](https://reference.langchain.com/python/langchain_mcp_adapters/#langchain_mcp_adapters.prompts.load_mcp_prompt) 以获得更多控制：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.prompts import load_mcp_prompt

client = MultiServerMCPClient({...})

async with client.session("server_name") as session:
    # Load a prompt by name
    messages = await load_mcp_prompt(session, "summarize")

    # Load a prompt with arguments
    messages = await load_mcp_prompt(
        session,
        "code_review",
        arguments={"language": "python", "focus": "security"}
    )
```

## 高级功能

### 工具拦截器

MCP 服务器作为单独的进程运行 - 它们无法访问 LangGraph 运行时信息，例如 [store](/oss/python/langgraph/stores)、[context](/oss/python/langchain/context-engineering) 或代理状态。 **拦截器通过让您在 MCP 工具执行期间访问此运行时上下文来弥补这一差距**。

拦截器还提供对工具调用的类似中间件的控制：您可以修改请求、实现重试、动态添加标头或完全短路执行。

|部分|描述 |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [Accessing runtime context](#accessing-runtime-context) |读取用户 ID、API 密钥、存储数据和代理状态 |
| [State updates and commands](#state-updates-and-commands) |使用 `Command` 更新代理状态或控制图流程 |
| [Writing interceptors](#custom-interceptors) |修改请求、编写拦截器和错误处理的模式 |

#### 访问运行时上下文当 MCP 工具在 LangChain 代理中使用时（通过`create_agent`），拦截器可以访问`ToolRuntime`上下文。这提供了对工具调用 ID、状态、配置和存储的访问，从而实现了用于访问用户数据、持久信息和控制代理行为的强大模式。

<Tabs>
  <Tab title="Runtime context">
    访问特定于用户的配置，例如用户 ID、API 密钥或在调用时传递的权限：

    ```python Inject user context into MCP tool calls theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass
    from langchain_mcp_adapters.client import MultiServerMCPClient
    from langchain_mcp_adapters.interceptors import MCPToolCallRequest
    from langchain.agents import create_agent

    @dataclass
    class Context:
        user_id: str
        api_key: str

    async def inject_user_context(
        request: MCPToolCallRequest,
        handler,
    ):
        """Inject user credentials into MCP tool calls."""
        runtime = request.runtime
        user_id = runtime.context.user_id  # [!code highlight]
        api_key = runtime.context.api_key  # [!code highlight]

        # Add user context to tool arguments
        modified_request = request.override(
            args={**request.args, "user_id": user_id}
        )
        return await handler(modified_request)

    client = MultiServerMCPClient(
        {...},
        tool_interceptors=[inject_user_context],
    )
    tools = await client.get_tools()
    agent = create_agent("gpt-5.5", tools, context_schema=Context)

    # Invoke with user context
    result = await agent.ainvoke(
        {"messages": [{"role": "user", "content": "Search my orders"}]},
        context={"user_id": "user_123", "api_key": "sk-..."}
    )
    ```
  </Tab>

  <Tab title="Store">
    访问长期记忆以检索用户首选项或在对话中保留数据：

    ```python Access user preferences from store theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass
    from langchain_mcp_adapters.client import MultiServerMCPClient
    from langchain_mcp_adapters.interceptors import MCPToolCallRequest
    from langchain.agents import create_agent
    from langgraph.store.memory import InMemoryStore

    @dataclass
    class Context:
        user_id: str

    async def personalize_search(
        request: MCPToolCallRequest,
        handler,
    ):
        """Personalize MCP tool calls using stored preferences."""
        runtime = request.runtime
        user_id = runtime.context.user_id
        store = runtime.store  # [!code highlight]

        # Read user preferences from store
        prefs = store.get(("preferences",), user_id)  # [!code highlight]

        if prefs and request.name == "search":
            # Apply user's preferred language and result limit
            modified_args = {
                **request.args,
                "language": prefs.value.get("language", "en"),
                "limit": prefs.value.get("result_limit", 10),
            }
            request = request.override(args=modified_args)

        return await handler(request)

    client = MultiServerMCPClient(
        {...},
        tool_interceptors=[personalize_search],
    )
    tools = await client.get_tools()
    agent = create_agent(
        "gpt-5.5",
        tools,
        context_schema=Context,
        store=InMemoryStore()
    )
    ```
  </Tab>

  <Tab title="State">
    访问对话状态以根据当前会话做出决策：

    ```python Filter tools based on authentication state theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_mcp_adapters.client import MultiServerMCPClient
    from langchain_mcp_adapters.interceptors import MCPToolCallRequest
    from langchain.messages import ToolMessage

    async def require_authentication(
        request: MCPToolCallRequest,
        handler,
    ):
        """Block sensitive MCP tools if user is not authenticated."""
        runtime = request.runtime
        state = runtime.state  # [!code highlight]
        is_authenticated = state.get("authenticated", False)  # [!code highlight]

        sensitive_tools = ["delete_file", "update_settings", "export_data"]

        if request.name in sensitive_tools and not is_authenticated:
            # Return error instead of calling tool
            return ToolMessage(
                content="Authentication required. Please log in first.",
                tool_call_id=runtime.tool_call_id,
            )

        return await handler(request)

    client = MultiServerMCPClient(
        {...},
        tool_interceptors=[require_authentication],
    )
    ```
  </Tab>

  <Tab title="Tool call ID">
    访问工具调用 ID 以返回格式正确的响应或跟踪工具执行情况：

    ```python Return custom responses with tool call ID theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_mcp_adapters.client import MultiServerMCPClient
    from langchain_mcp_adapters.interceptors import MCPToolCallRequest
    from langchain.messages import ToolMessage

    async def rate_limit_interceptor(
        request: MCPToolCallRequest,
        handler,
    ):
        """Rate limit expensive MCP tool calls."""
        runtime = request.runtime
        tool_call_id = runtime.tool_call_id  # [!code highlight]

        # Check rate limit (simplified example)
        if is_rate_limited(request.name):
            return ToolMessage(
                content="Rate limit exceeded. Please try again later.",
                tool_call_id=tool_call_id,  # [!code highlight]
            )

        result = await handler(request)

        # Log successful tool call
        log_tool_execution(tool_call_id, request.name, success=True)

        return result

    client = MultiServerMCPClient(
        {...},
        tool_interceptors=[rate_limit_interceptor],
    )
    ```
  </Tab>
</Tabs>

有关更多上下文工程模式，请参阅[Context engineering](/oss/python/langchain/context-engineering)和[Tools](/oss/python/langchain/tools)。

#### 状态更新和命令

拦截器可以返回`Command`对象来更新代理状态或控制图执行流程。这对于跟踪任务进度、在代理之间切换或提前结束执行非常有用。

```python Mark task complete and switch agents theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import AgentState, create_agent
from langchain_mcp_adapters.interceptors import MCPToolCallRequest
from langchain.messages import ToolMessage
from langgraph.types import Command

async def handle_task_completion(
    request: MCPToolCallRequest,
    handler,
):
    """Mark task complete and hand off to summary agent."""
    result = await handler(request)

    if request.name == "submit_order":
        return Command(
            update={
                "messages": [result] if isinstance(result, ToolMessage) else [],
                "task_status": "completed",  # [!code highlight]
            },
            goto="summary_agent",  # [!code highlight]
        )

    return result
```

使用 `Command` 和 `goto="__end__"` 提前结束执行：

```python End agent run on completion theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
async def end_on_success(
    request: MCPToolCallRequest,
    handler,
):
    """End agent run when task is marked complete."""
    result = await handler(request)

    if request.name == "mark_complete":
        return Command(
            update={"messages": [result], "status": "done"},
            goto="__end__",  # [!code highlight]
        )

    return result
```

#### 自定义拦截器拦截器是包装工具执行的异步函数，支持请求/响应修改、重试逻辑和其他横切关注点。它们遵循“洋葱”模式，其中列表中的第一个拦截器是最外层。

**基本模式**

拦截器是一个接收请求和处理程序的异步函数。您可以在调用处理程序之前修改请求，之后修改响应，或者完全跳过处理程序。

```python Basic interceptor pattern theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.interceptors import MCPToolCallRequest

async def logging_interceptor(
    request: MCPToolCallRequest,
    handler,
):
    """Log tool calls before and after execution."""
    print(f"Calling tool: {request.name} with args: {request.args}")
    result = await handler(request)
    print(f"Tool {request.name} returned: {result}")
    return result

client = MultiServerMCPClient(
    {"math": {"transport": "stdio", "command": "python", "args": ["/path/to/server.py"]}},
    tool_interceptors=[logging_interceptor],  # [!code highlight]
)
```

**修改请求**

使用 `request.override()` 创建修改后的请求。这遵循不可变的模式，使原始请求保持不变。

```python Modifying tool arguments theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
async def double_args_interceptor(
    request: MCPToolCallRequest,
    handler,
):
    """Double all numeric arguments before execution."""
    modified_args = {k: v * 2 for k, v in request.args.items()}
    modified_request = request.override(args=modified_args)  # [!code highlight]
    return await handler(modified_request)

# Original call: add(a=2, b=3) becomes add(a=4, b=6)
```

**在运行时修改标头**

拦截器可以根据请求上下文动态修改HTTP标头：

```python Dynamic header modification theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
async def auth_header_interceptor(
    request: MCPToolCallRequest,
    handler,
):
    """Add authentication headers based on the tool being called."""
    token = get_token_for_tool(request.name)
    modified_request = request.override(
        headers={"Authorization": f"Bearer {token}"}  # [!code highlight]
    )
    return await handler(modified_request)
```

**编写拦截器**

多个拦截器按“洋葱”顺序组成——列表中的第一个拦截器是最外层：

```python Composing multiple interceptors theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
async def outer_interceptor(request, handler):
    print("outer: before")
    result = await handler(request)
    print("outer: after")
    return result

async def inner_interceptor(request, handler):
    print("inner: before")
    result = await handler(request)
    print("inner: after")
    return result

client = MultiServerMCPClient(
    {...},
    tool_interceptors=[outer_interceptor, inner_interceptor],  # [!code highlight]
)

# Execution order:
# outer: before -> inner: before -> tool execution -> inner: after -> outer: after
```

**错误处理**

使用拦截器捕获工具执行中的异常，例如传输或运行时故障，并添加重试逻辑。默认情况下不会引发工具执行错误 (`CallToolResult(isError=True)`)，因此异常捕获拦截器永远不会触发它们。要在此处捕获这些异常，请设置 `handle_tool_errors=False`。

```python Retry on error theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

async def retry_interceptor(
    request: MCPToolCallRequest,
    handler,
    max_retries: int = 3,
    delay: float = 1.0,
):
    """Retry failed tool calls with exponential backoff."""
    last_error = None
    for attempt in range(max_retries):
        try:
            return await handler(request)
        except Exception as e:
            last_error = e
            if attempt < max_retries - 1:
                wait_time = delay * (2 ** attempt)  # Exponential backoff
                print(f"Tool {request.name} failed (attempt {attempt + 1}), retrying in {wait_time}s...")
                await asyncio.sleep(wait_time)
    raise last_error

client = MultiServerMCPClient(
    {...},
    tool_interceptors=[retry_interceptor],  # [!code highlight]
)
```您还可以捕获特定的错误类型并返回后备值：

```python Error handling with fallback theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
async def fallback_interceptor(
    request: MCPToolCallRequest,
    handler,
):
    """Return a fallback value if tool execution fails."""
    try:
        return await handler(request)
    except TimeoutError:
        return f"Tool {request.name} timed out. Please try again later."
    except ConnectionError:
        return f"Could not connect to {request.name} service. Using cached data."
```

### 进度通知

订阅长时间运行的工具执行的进度更新：

```python Progress callback theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.callbacks import Callbacks, CallbackContext

async def on_progress(
    progress: float,
    total: float | None,
    message: str | None,
    context: CallbackContext,
):
    """Handle progress updates from MCP servers."""
    percent = (progress / total * 100) if total else progress
    tool_info = f" ({context.tool_name})" if context.tool_name else ""
    print(f"[{context.server_name}{tool_info}] Progress: {percent:.1f}% - {message}")

client = MultiServerMCPClient(
    {...},
    callbacks=Callbacks(on_progress=on_progress),  # [!code highlight]
)
```

`CallbackContext` 提供：

* `server_name`：MCP服务器名称
* `tool_name`：正在执行的工具名称（在工具调用期间可用）

### 日志记录

MCP 协议支持来自服务器的[logging](https://modelcontextprotocol.io/specification/2025-03-26/server/utilities/logging#log-levels) 通知。使用 `Callbacks` 类来订阅这些事件。

```python Logging callback theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.callbacks import Callbacks, CallbackContext
from mcp.types import LoggingMessageNotificationParams

async def on_logging_message(
    params: LoggingMessageNotificationParams,
    context: CallbackContext,
):
    """Handle log messages from MCP servers."""
    print(f"[{context.server_name}] {params.level}: {params.data}")

client = MultiServerMCPClient(
    {...},
    callbacks=Callbacks(on_logging_message=on_logging_message),  # [!code highlight]
)
```

### 引出

[Elicitation](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#elicitation) 允许 MCP 服务器在工具执行期间请求用户的额外输入。服务器无需预先要求所有输入，而是可以根据需要交互式地请求信息。

#### 服务器设置

定义一个使用 `ctx.elicit()` 请求用户输入模式的工具：

```python MCP server with elicitation theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from pydantic import BaseModel
from mcp.server.fastmcp import Context, FastMCP

server = FastMCP("Profile")

class UserDetails(BaseModel):
    email: str
    age: int

@server.tool()
async def create_profile(name: str, ctx: Context) -> str:
    """Create a user profile, requesting details via elicitation."""
    result = await ctx.elicit(  # [!code highlight]
        message=f"Please provide details for {name}'s profile:",  # [!code highlight]
        schema=UserDetails,  # [!code highlight]
    )  # [!code highlight]
    if result.action == "accept" and result.data:
        return f"Created profile for {name}: email={result.data.email}, age={result.data.age}"
    if result.action == "decline":
        return f"User declined. Created minimal profile for {name}."
    return "Profile creation cancelled."

if __name__ == "__main__":
    server.run(transport="http")
```

#### 客户端设置

通过提供对 `MultiServerMCPClient` 的回调来处理诱导请求：

```python Handling elicitation requests theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.callbacks import Callbacks, CallbackContext
from mcp.shared.context import RequestContext
from mcp.types import ElicitRequestParams, ElicitResult

async def on_elicitation(
    mcp_context: RequestContext,
    params: ElicitRequestParams,
    context: CallbackContext,
) -> ElicitResult:
    """Handle elicitation requests from MCP servers."""
    # In a real application, you would prompt the user for input
    # based on params.message and params.requestedSchema
    return ElicitResult(  # [!code highlight]
        action="accept",  # [!code highlight]
        content={"email": "user@example.com", "age": 25},  # [!code highlight]
    )  # [!code highlight]

client = MultiServerMCPClient(
    {
        "profile": {
            "url": "http://localhost:8000/mcp",
            "transport": "http",
        }
    },
    callbacks=Callbacks(on_elicitation=on_elicitation),  # [!code highlight]
)
```

#### 响应动作

引发回调可以返回以下三个操作之一：|行动|描述 |
| ---------| ---------------------------------------------------------------------------------- |
| `accept` |用户提供了有效的输入。将数据包含在 `content` 字段中。 |
| `decline` |用户选择不提供所请求的信息。                |
| `cancel` |用户完全取消了操作。                              |

```python Response action examples theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Accept with data
ElicitResult(action="accept", content={"email": "user@example.com", "age": 25})

# Decline (user doesn't want to provide info)
ElicitResult(action="decline")

# Cancel (abort the operation)
ElicitResult(action="cancel")
```

## 其他资源

* [MCP documentation](https://modelcontextprotocol.io/introduction)
* [MCP Transport documentation](https://modelcontextprotocol.io/docs/concepts/transports)
* [⟦T92⟧](https://github.com/langchain-ai/langchain-mcp-adapters)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/mcp.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>