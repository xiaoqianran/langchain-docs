<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tools | https://docs.langchain.com/oss/python/langchain/mcp/tools -->

# 工具

将MCP工具加载到LangChain代理中，控制其执行，并处理服务器结果和请求。

<Note>
  `langchain.mcp` 命名空间需要 `langchain[mcp]>=1.4.0` 并且处于测试阶段。 API 可能会更改。
</Note>

[⟦T11⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter)桥接MCP服务器和LangChain代理：它发现服务器通告的工具并将其改编为标准LangChain工具。将工具从 `list_tools()` 传递到 [⟦T13⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)，就像传递任何其他 LangChain 工具一样。

本页介绍了该桥的具体内容：识别 MCP 工具、控制其执行、处理其输出以及在调用期间服务器需要输入时进行响应。有关可运行的发现和代理示例，请参阅[MCP quickstart](/oss/python/langchain/mcp)。

## 在代理中使用 MCP 工具

使用[⟦T14⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter/list_tools)发现服务器的目录，然后将返回的工具交给[⟦T15⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)。从代理的角度来看，它们的行为类似于 LangChain 工具：模型选择一个工具，LangChain 调用它，并将生成的 [⟦T16⟧](https://reference.langchain.com/python/langchain-core/messages/tool/ToolMessage) 返回给模型。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.mcp import MCPAdapter


async def run_agent(server) -> dict:
    # Discover the server's tools, then hand them to the agent like any other
    # LangChain tools. The tools hold the client, so the agent stays usable
    # for the life of the adapter context.
    async with MCPAdapter(server) as adapter:
        tools = await adapter.list_tools()
        agent = create_agent("claude-sonnet-5", tools)
        return await agent.ainvoke(
            {
                "messages": [
                    {"role": "user", "content": "What is the forecast for Oslo?"}
                ]
            }
        )
```

<Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/025418ad-e7bc-43a3-b700-d1a78b3a4856/r">
  为此示例打开公共 LangSmith 运行。
</Card>

有关定义、绑定和使用 LangChain 工具的一般指南，请参阅 [Tools](/oss/python/langchain/tools)。有关多个 MCP 服务器及其命名空间工具目录，请参阅[Connections](/oss/python/langchain/mcp/connections#multiple-servers)。

## 处理工具输出MCP 工具结果成为[⟦T17⟧](https://reference.langchain.com/python/langchain-core/messages/tool/ToolMessage) 对象，其中包含模型可以读取的内容、应用程序数据的工件以及指示成功或失败的状态。

### 多模式内容

该适配器将模型可见的 MCP 内容转换为 LangChain [content blocks](/oss/python/langchain/messages#standard-content-blocks)。例如，返回带有屏幕截图的 MCP 图像块的工具以 `image` 块的形式到达模型。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.mcp import MCPAdapter
from langchain.messages import ToolMessage


async def access_multimodal_tool_content(server) -> dict:
    async with MCPAdapter(server) as adapter:
        tools = await adapter.list_tools()
        agent = create_agent("claude-sonnet-5", tools)
        result = await agent.ainvoke(
            {"messages": [{"role": "user", "content": "Take a screenshot."}]}
        )

    # An MCP result arrives as LangChain content blocks. Image and file content
    # convert into standardized `image`/`file` blocks alongside `text`.
    for message in result["messages"]:
        if not isinstance(message, ToolMessage):
            continue
        for block in message.content_blocks:  # [!code highlight]
            if block["type"] == "text":  # [!code highlight]
                print(f"Text: {block['text']}")  # [!code highlight]
            elif block["type"] == "image":  # [!code highlight]
                preview = block.get("base64", "")[:20]  # [!code highlight]
                print(f"Image mime type: {block.get('mime_type')}")  # [!code highlight]
                print(f"Image base64: {preview}...")  # [!code highlight]

    return result
```

### 结构化内容

当工具返回结构化内容时，适配器将其作为工件附加到 [⟦T19⟧](https://reference.langchain.com/python/langchain-core/messages/tool/ToolMessage)，而不是将其折叠到模型可见文本中。运行代理，然后从结果中的 [⟦T21⟧](https://reference.langchain.com/python/langchain-core/messages/tool/ToolMessage) 实例中读取 `artifact`：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.mcp import MCPAdapter
from langchain.messages import ToolMessage


async def run_agent_structured(server) -> dict:
    async with MCPAdapter(server) as adapter:
        tools = await adapter.list_tools()
        agent = create_agent("claude-sonnet-5", tools)
        result = await agent.ainvoke(
            {"messages": [{"role": "user", "content": "Look up user 42."}]}
        )

    # The adapter sets `artifact` only when the tool returned structured
    # content, so a non-None artifact always carries `structured_content`.
    for message in result["messages"]:
        if isinstance(message, ToolMessage) and message.artifact is not None:
            structured = message.artifact["structured_content"]  # [!code highlight]
            print(f"Structured content: {structured}")  # [!code highlight]

    return result
```

该工件是一个 `MCPToolArtifact`，其 `structured_content` 字段保存工具结果的 `structuredContent`。不返回结构化内容的工具会将 `artifact` 保留为 `None`。

### 错误

MCP 工具结果带有 `isError` 标志。当服务器报告`isError=True`时，适配器将其转换为[⟦T29⟧](https://reference.langchain.com/python/langchain-core/messages/tool/ToolMessage)，其中`status="error"`携带服务器自己的消息，因此代理可以读取它并自行更正：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.mcp import MCPAdapter
from langchain.messages import ToolMessage


async def divide_by_zero(server) -> dict:
    async with MCPAdapter(server) as adapter:
        tools = await adapter.list_tools()
        agent = create_agent("claude-sonnet-5", tools)
        result = await agent.ainvoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": "Use the divide tool to calculate 10 divided by 0.",
                    }
                ]
            }
        )

    # A server error (isError=True) reaches the model as a failed ToolMessage,
    # so the agent can read the server's own message and recover. Transport
    # failures still raise, because a model cannot act on those.
    for message in result["messages"]:
        if isinstance(message, ToolMessage) and message.status == "error":
            print(f"Tool reported: {message.text}")  # [!code highlight]

    return result
```

服务器报告的错误作为失败的工具消息到达模型，但会引发传输或会话失败。

## 工具元数据每个改编工具都可以在 LangChain 工具元数据上的 `mcp` 命名空间下携带其 MCP 出处：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
tool.metadata
# {
#     "mcp": {
#         "tool": {
#             "annotations": {
#                 "destructive_hint": True,
#                 "read_only_hint": False,
#             },
#             "_meta": {"origin": "crm"},
#         },
#         "server": {
#             "name": "crm",
#             "version": "2.1.0",
#         },
#     },
# }
```

每个嵌套字段都是可选的：服务器可以提供工具注释、`_meta`、服务器身份、这些的任意组合，或者不提供。 `annotations`包含`read_only_hint`、`destructive_hint`等MCP提示； `_meta`是服务器提供的不透明元数据； `server` 标识宣传该工具的 MCP 实现。

防御性地读取可选元数据，因此缺失的字段会返回默认值而不是失败：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import BaseTool


def is_destructive(tool: BaseTool) -> bool:
    """Read the MCP destructive hint off the adapter's tool metadata."""
    # Chain `.get` with defaults so a tool missing any nested field returns
    # False rather than raising.
    annotations = (
        (tool.metadata or {}).get("mcp", {}).get("tool", {}).get("annotations", {})
    )
    return annotations.get("destructive_hint", False)
```

## 人机交互

阅读注释可以让您根据服务器声明的内容来控制工具，而不是硬编码工具名称。 MCP 注释对工具进行分类，LangChain 的人机交互中间件强制执行审批策略。

在工具发现期间从元数据中读取一次破坏性提示。然后为人机交互配置提供一个 `when` 谓词，用于接收每个待处理的工具调用并返回该调用是否需要批准：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents.middleware import HumanInTheLoopMiddleware
from langchain.agents.middleware.human_in_the_loop import InterruptOnConfig
from langchain.tools import BaseTool
from langchain.tools.tool_node import ToolCallRequest


def is_destructive(tool: BaseTool) -> bool:
    """Read the MCP destructive hint off the adapter's tool metadata."""
    annotations = (
        (tool.metadata or {}).get("mcp", {}).get("tool", {}).get("annotations", {})
    )
    return annotations.get("destructive_hint", False)


async def gate_destructive_tools(server):
    async with MCPAdapter(server) as adapter:
        tools = await adapter.list_tools()

        # Read the destructive hint from metadata once, then let a callable
        # decide per call. One config covers whatever destructive tools a
        # server exposes, without hardcoding tool names.
        destructive = {tool.name for tool in tools if is_destructive(tool)}

        def needs_approval(request: ToolCallRequest) -> bool:
            return request.tool_call["name"] in destructive

        gate = InterruptOnConfig(
            allowed_decisions=["approve", "reject"], when=needs_approval
        )
        interrupt_on: dict[str, bool | InterruptOnConfig] = {
            tool.name: gate for tool in tools
        }
        return create_agent(
            "claude-sonnet-5",
            tools,
            middleware=[HumanInTheLoopMiddleware(interrupt_on=interrupt_on)],
            checkpointer=InMemorySaver(),
        )
```

当代理调用谓词门控的工具时，运行会暂停。批准调用以运行它，或拒绝它以跳过该工具并告诉模型：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph.types import Command

# Approve the pending destructive call and resume.
resumed = await agent.ainvoke(
    Command(resume={"decisions": [{"type": "approve"}]}), config
)
```谓词还可以检查调用的参数。这使得工具可以自由运行以实现安全输入，并仅在有风险的情况下暂停，例如针对受保护路径的 `delete_file` 调用。

通过`request.tool_call["args"]`访问参数。

仅当工具的类型和输入值得批准时，才将元数据分类和参数检查相结合来控制工具。有关完整的审批工作流程，请参阅[Human-in-the-loop](/oss/python/langchain/human-in-the-loop)。

## 工具执行期间的服务器请求

大多数工具在通话过程中无需向客户询问任何信息即可完成。当服务器需要输入时，[⟦T41⟧](https://reference.langchain.com/python/langchain/mcp/adapter/MCPAdapter)将[elicitation](https://modelcontextprotocol.io/specification/draft/client/elicitation)表面为LangGraph[⟦T42⟧](https://reference.langchain.com/python/langgraph/types/interrupt)。

### 引出

[Elicitation](https://modelcontextprotocol.io/specification/draft/client/elicitation) 让 MCP 服务器在工具调用期间请求输入。适配器通过 LangGraph 中断暂停运行。您的应用程序向用户提出请求，并根据用户的回答继续运行。

将 [checkpointer](/oss/python/langchain/short-term-memory) 附加到代理，并在调用和恢复它时使用相同的 `thread_id`。

此示例假设预订工具询问一个日期并暂停一次。将示例日期替换为用户的答案。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import Any

from langchain.agents import create_agent
from langchain.mcp import MCPAdapter
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command


async def book_with_elicitation(server) -> dict:
    # Elicitation is handled automatically: when a server needs input mid-call,
    # the adapter surfaces the question as a LangGraph `interrupt()`, so the
    # person already reviewing the agent's work answers it and the run resumes.
    async with MCPAdapter(server) as adapter:
        tools = await adapter.list_tools()

        # Resuming a paused run needs persistence, so the interrupted run has
        # somewhere to wait.
        agent = create_agent("claude-sonnet-5", tools, checkpointer=InMemorySaver())
        config: Any = {"configurable": {"thread_id": "booking-1"}}

        paused = await agent.ainvoke(
            {"messages": [{"role": "user", "content": "Book a table for 4."}]}, config
        )
        [interrupt] = paused["__interrupt__"]
        [question] = interrupt.value["requests"]

        # Answers are keyed by the server's own request key, so nothing has to
        # be tracked across the pause. `decline` or `cancel` would refuse.
        answer = {"action": "accept", "content": {"date": "2026-09-14"}}
        return await agent.ainvoke(
            Command(resume={"responses": {question["key"]: answer}}), config
        )
```

默认情况下，诱导处于启用状态。适配器通告该功能并驱动中断循环。已经带有自己的启发处理程序的预构建客户端将受到尊重，而不是被覆盖。使用 `Command(resume={"responses": {key: answer}})` 继续。中断负载和应答类型位于`langchain.mcp.elicitation`。

<Note>
  恢复将从头开始重新运行该工具。在服务器请求输入之前执行的任何工作都可以重复。确保该工作可以安全地重复，而不会产生重复的副作用。
</Note>

每个答案都使用以下操作之一：

* **`accept`**：提供与请求架构匹配的表单`content`，或在没有`content`的情况下确认 URL 交互的完成。
* **`decline`**：拒绝提供所要求的信息。
* **`cancel`**：表示用户取消了交互。

适配器将答案转发给服务器，服务器决定工具调用如何完成。

只有启发式才是这样回答的。相反，请求 [sampling](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling) 或 [roots](https://modelcontextprotocol.io/specification/2025-06-18/client/roots) 的服务器会引发错误，因为现代的无会话协议没有用于这些请求的实时反向通道。参见[Sampling and roots](/oss/python/migrate/langchain-mcp-adapters#sampling-and-roots)。

<Note>
  中断驱动的诱导应答服务器，以 `InputRequiredResult` 的形式返回其请求。仅通过传统握手会话推送启发的服务器无法以这种方式应答。
</Note>

## 另请参阅

* [Content blocks](/oss/python/langchain/messages#standard-content-blocks)

* [Tools](/oss/python/langchain/tools)

* [Human-in-the-loop](/oss/python/langchain/human-in-the-loop)

* [FastMCP calling tools](https://gofastmcp.com/clients/tools)

* [FastMCP client elicitation](https://gofastmcp.com/clients/elicitation)

* [FastMCP server elicitation](https://gofastmcp.com/servers/elicitation)

* [MCP elicitation specification](https://modelcontextprotocol.io/specification/draft/client/elicitation)

* [MCP tool annotations](https://modelcontextprotocol.io/specification/draft/server/tools)

***<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/mcp/tools.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>