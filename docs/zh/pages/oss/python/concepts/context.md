<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Context overview | https://docs.langchain.com/oss/python/concepts/context -->

# 上下文概述

**上下文工程**是构建动态系统的实践，以正确的格式提供正确的信息和工具，以便人工智能应用程序能够完成任务。上下文可以通过两个关键维度来表征：

1. 通过**可变性**：
   * **静态上下文**：在执行期间不会更改的不可变数据（例如，用户元数据、数据库连接、工具）
   * **动态上下文**：随着应用程序运行而演变的可变数据（例如，对话历史记录、中间结果、工具调用观察）
2. 按**生命周期**：
   * **运行时上下文**：数据范围仅限于单次运行或调用
   * **跨对话上下文**：在多个对话或会话中持续存在的数据

<Tip>
  运行时上下文是指本地上下文：代码运行所需的数据和依赖项。它**不**指的是：

  * LLM 上下文，即传递到 LLM 提示符中的数据。
  * “上下文窗口”，即可以传递给LLM的最大令牌数。运行时上下文是依赖注入的一种形式，可用于优化 LLM 上下文。它允许您在运行时向工具和节点提供依赖项（例如数据库连接、用户 ID 或 API 客户端），而不是对它们进行硬编码。例如，您可以在运行时上下文中使用用户元数据来获取用户首选项并将其输入到上下文窗口中。
</Tip>

LangGraph提供了三种管理上下文的方法，结合了可变性和生命周期维度：|上下文类型 |描述 |可变性 |终身|访问方式|
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------- | ------------------ | --------------------------------------- |
| [**Static runtime context**](#static-runtime-context) |启动时传递的用户元数据、工具、数据库连接 |静态|单跑 | `context` `invoke`/`stream` 的参数 |
| [**Dynamic runtime context (state)**](#dynamic-runtime-context) |在单次运行期间演变的可变数据 |动态 |单跑 | LangGraph 状态对象 |
| [**Dynamic cross-conversation context (store)**](#dynamic-cross-conversation-context) |跨对话共享持久数据|动态 |交叉对话 | LangGraph 商店 |

## 静态运行时上下文

**静态运行时上下文**表示不可变的数据，例如用户元数据、工具和数据库连接，这些数据在运行开始时通过 `invoke`/`stream` 的 `context` 参数传递给应用程序。该数据在执行期间不会改变。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
@dataclass
class ContextSchema:
    user_name: str

graph.invoke(
    {"messages": [{"role": "user", "content": "hi!"}]},
    context={"user_name": "John Smith"}  # [!code highlight]
)
```<Tabs>
  <Tab title="Agent prompt">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass
    from langchain.agents import create_agent
    from langchain.agents.middleware import dynamic_prompt, ModelRequest


    @dataclass
    class ContextSchema:
        user_name: str

    @dynamic_prompt  # [!code highlight]
    def personalized_prompt(request: ModelRequest) -> str:  # [!code highlight]
        user_name = request.runtime.context.user_name
        return f"You are a helpful assistant. Address the user as {user_name}."

    agent = create_agent(
        model="claude-sonnet-4-6",
        tools=[get_weather],
        middleware=[personalized_prompt],
        context_schema=ContextSchema
    )

    agent.invoke(
        {"messages": [{"role": "user", "content": "what is the weather in sf"}]},
        context=ContextSchema(user_name="John Smith")  # [!code highlight]
    )
    ```

    详情请参阅[Agents](/oss/python/langchain/agents)。
  </Tab>

  <Tab title="Workflow node">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langgraph.runtime import Runtime

    def node(state: State, runtime: Runtime[ContextSchema]):  # [!code highlight]
        user_name = runtime.context.user_name
        ...
    ```

    * 详情请参阅[the Graph API](/oss/python/langgraph/use-graph-api#add-runtime-configuration)。
  </Tab>

  <Tab title="In a tool">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.tools import tool, ToolRuntime

    @tool
    def get_user_email(runtime: ToolRuntime[ContextSchema]) -> str:
        """Retrieve user information based on user ID."""
        # simulate fetching user info from a database
        email = get_user_email_from_db(runtime.context.user_name)  # [!code highlight]
        return email
    ```

    详情请参阅[tool calling guide](/oss/python/langchain/tools#context)。
  </Tab>
</Tabs>

<Tip>
  `Runtime` 对象可用于访问静态上下文和其他实用程序，例如活动存储和流编写器。
  有关详细信息，请参阅[⟦T13⟧](https://reference.langchain.com/python/langgraph/runtime/Runtime)文档。
</Tip>

## 动态运行时上下文

**动态运行时上下文**表示可以在单次运行期间演变的可变数据，并通过 LangGraph 状态对象进行管理。这包括对话历史记录、中间结果以及从工具或 LLM 输出得出的值。在 LangGraph 中，状态对象在运行期间充当[short-term memory](/oss/python/concepts/memory)。

<Tabs>
  <Tab title="In an agent">
    示例展示了如何将状态合并到代理**提示**中。

    状态也可以通过代理的**工具**访问，它可以根据需要读取或更新状态。详情请参阅[tool calling guide](/oss/python/langchain/tools#short-term-memory-state)。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents import create_agent
    from langchain.agents.middleware import dynamic_prompt, ModelRequest
    from langchain.agents import AgentState


    class CustomState(AgentState):  # [!code highlight]
        user_name: str

    @dynamic_prompt  # [!code highlight]
    def personalized_prompt(request: ModelRequest) -> str:  # [!code highlight]
        user_name = request.state.get("user_name", "User")
        return f"You are a helpful assistant. User's name is {user_name}"

    agent = create_agent(
        model="claude-sonnet-4-6",
        tools=[...],
        state_schema=CustomState,  # [!code highlight]
        middleware=[personalized_prompt],  # [!code highlight]
    )

    agent.invoke({
        "messages": "hi!",
        "user_name": "John Smith"
    })
    ```
  </Tab>

  <Tab title="In a workflow">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from typing_extensions import TypedDict
    from langchain.messages import AnyMessage
    from langgraph.graph import StateGraph

    class CustomState(TypedDict):  # [!code highlight]
        messages: list[AnyMessage]
        extra_field: int

    def node(state: CustomState):  # [!code highlight]
        messages = state["messages"]
        ...
        return {  # [!code highlight]
            "extra_field": state["extra_field"] + 1  # [!code highlight]
        }

    builder = StateGraph(State)
    builder.add_node(node)
    builder.set_entry_point("node")
    graph = builder.compile()
    ```
  </Tab>
</Tabs><Tip>
  **打开内存**
  有关如何启用内存的更多详细信息，请参阅[memory guide](/oss/python/langgraph/add-memory)。这是一个强大的功能，允许您在多次调用中保留代理的状态。否则，状态的范围仅限于单次运行。
</Tip>

## 动态交叉对话上下文

**动态交叉对话上下文**表示跨越多个对话或会话的持久、可变数据，并通过 LangGraph 存储进行管理。这包括用户个人资料、偏好和历史交互。 LangGraph 存储在多次运行中充当[long-term memory](/oss/python/concepts/memory#long-term-memory)。这可用于读取或更新持久事实（例如，用户配置文件、偏好、先前的交互）。

## 了解更多

* [Memory conceptual overview](/oss/python/concepts/memory)
* [Short-term memory in LangChain](/oss/python/langchain/short-term-memory)
* [Memory in LangGraph](/oss/python/langgraph/add-memory)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/concepts/context.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>