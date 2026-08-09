<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Rebuild graph at runtime | https://docs.langchain.com/langsmith/graph-rebuild -->

# 在运行时重建图

使用 ServerRuntime 为每次运行使用不同的配置重建图形。

您可能需要使用不同的配置重建图表以进行新的运行。例如，您可能希望根据用户的凭据加载不同的工具。本指南展示了如何使用 `ServerRuntime` 执行此操作。

<Note>
  在大多数情况下，最好通过调节各个节点内的配置来处理自定义，而不是动态更改整个图形结构。这使得测试和管理变得更加容易。
</Note>

## 先决条件

* 请务必先查看[this how-to guide](/langsmith/setup-app-requirements-txt)，了解如何设置应用程序进行部署。
* `ServerRuntime` 需要 `langgraph-api >= 0.7.31` 和 `langgraph-sdk >= 0.3.5`。在此之前，图工厂仅接受单个 `config: RunnableConfig` 参数。

## 定义图

假设您有一个带有简单图表的应用程序，该应用程序调用 LLM 并将响应返回给用户。应用程序文件目录如下所示：

```
my-app/
|-- langgraph.json
|-- my_project/
|   |-- __init__.py
|   |-- agents.py     # code for your graph
|-- pyproject.toml
```

其中该图在 `agents.py` 中定义。

### 不重建

部署代理服务器的最常见方法是引用在文件顶层定义的已编译图形实例。示例如下：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# my_project/agents.py
from langgraph.graph import StateGraph, MessagesState, START

async def model(state: MessagesState):
    return {"messages": [{"role": "assistant", "content": "Hi, there!"}]}

graph_workflow = StateGraph(MessagesState)
graph_workflow.add_node("model", model)
graph_workflow.add_edge(START, "model")
agent = graph_workflow.compile()
```为了让服务器知道您的图表，您需要在 LangGraph API 配置 (`langgraph.json`) 中指定包含 [⟦T12⟧](https://reference.langchain.com/python/langgraph/graph/state/CompiledStateGraph) 实例的变量的路径，例如：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
    "$schema": "https://langgra.ph/schema.json",
    "dependencies": ["."],
    "graphs": {
        "chat_agent": "my_project.agents:agent",
    }
}
```

### 重建

要在每次新运行时重建图形，请提供一个返回（或生成）图形的**工厂函数**。工厂可以选择接受`ServerRuntime`参数或`RunnableConfig`。服务器检查函数的类型注释以确定要注入的参数，因此请确保包含正确的类型提示。服务器的队列工作人员将在需要处理运行时随时调用您的工厂函数。某些其他端点也会调用该函数来更新状态、读取状态或获取辅助模式。 `ServerRuntime` 告诉您哪个上下文触发了调用。

<Note>
  `ServerRuntime` 位于 [beta](/langsmith/release-stages) 中，并且可能在未来版本中发生变化。
</Note>

#### 简单工厂

最简单的形式是一个简单的 `async def`，它返回一个编译图：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_openai import ChatOpenAI
from langgraph.graph import START, StateGraph
from langchain_core.runnables import RunnableConfig
from langgraph_sdk.runtime import ServerRuntime

from my_agent.utils.state import AgentState

model = ChatOpenAI(model="gpt-5.5")


def make_graph_for_user(user_id: str):
    """Build a graph customized per user."""
    graph_workflow = StateGraph(AgentState)

    async def call_model(state):
        return {"messages": [await model.ainvoke(state["messages"])]}

    graph_workflow.add_node("agent", call_model)
    graph_workflow.add_edge(START, "agent")
    return graph_workflow.compile()


async def make_graph(config: RunnableConfig, runtime: ServerRuntime):
    user = runtime.ensure_user()
    return make_graph_for_user(user.identity)
```

#### 上下文管理器工厂如果您需要设置和拆除资源（数据库连接、加载 MCP 工具等），请使用异步上下文管理器。使用 `runtime.execution_runtime` 检查图表是否被调用用于实际执行或仅用于内省（模式、可视化）：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import contextlib

from langchain_openai import ChatOpenAI
from langgraph.graph import START, StateGraph
from langchain_core.runnables import RunnableConfig
from langgraph_sdk.runtime import ServerRuntime

from my_agent.utils.state import AgentState

model = ChatOpenAI(model="gpt-5.5")


def make_agent_graph(tools: list):
    """Make a simple LLM agent."""
    graph_workflow = StateGraph(AgentState)
    bound = model.bind_tools(tools)

    async def call_model(state):
        return {"messages": [await bound.ainvoke(state["messages"])]}

    graph_workflow.add_node("agent", call_model)
    graph_workflow.add_edge(START, "agent")
    return graph_workflow.compile()


@contextlib.asynccontextmanager
async def make_graph(runtime: ServerRuntime):
    if ert := runtime.execution_runtime:
        # Only set up expensive resources during actual execution.
        # Introspection calls (get_schema, get_graph, ...) skip this.
        mcp_tools = await connect_mcp(ert.ensure_user())  # your setup logic
        yield make_agent_graph(tools=mcp_tools)
        await disconnect_mcp()  # your teardown logic
    else:
        # For schema/state reads, return a graph with the same
        # topology but no expensive resource setup.
        yield make_agent_graph(tools=[])
```

最后，在`langgraph.json`中指定你的工厂路径：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
    "$schema": "https://langgra.ph/schema.json",
    "dependencies": ["."],
    "graphs": {
        "chat_agent": "my_project.agents:make_graph",
    }
}
```

## 服务器运行时参考

您的工厂函数接收一个具有以下属性的 `ServerRuntime` 实例：

|属性 |类型 |描述 |
| ---------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `access_context` | `str` |为什么工厂被称为：`"threads.create_run"`、`"threads.update"`、`"threads.read"`或`"assistants.read"`。 |
| `user` | `BaseUser \| None` |经过身份验证的用户，如果未配置 [custom auth](/langsmith/custom-auth)，则为 `None`。                      |
| `store` | `BaseStore` |用于持久性和内存的存储实例。                                                                    |

**方法：**|方法|描述 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ensure_user()` |返回经过身份验证的用户。如果没有提供用户，则引发`PermissionError`。                                                                                                |
| `execution_runtime` |当`access_context`为`"threads.create_run"`时返回执行运行时间，否则返回`None`。使用它仅在执行期间有条件地设置昂贵的资源。 |

### 访问上下文服务器在多种上下文中调用您的工厂，而不仅仅是执行运行。在所有上下文中，返回的图应该具有**相同的拓扑**（节点、边、状态模式）。写入上下文中不匹配的拓扑（`threads.create_run`、`threads.update`）可能会导致不正确的状态更新。在读取上下文（`threads.read`、`assistants.read`）中，不匹配会影响报告的挂起任务、架构和可视化，但不会损坏数据。使用`execution_runtime`有条件地设置昂贵的资源而不改变图结构。

|背景 |描述 |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `threads.create_run` |完整的图形执行。 `execution_runtime` 可用。                                                 |
| `threads.update` |通过`aupdate_state`进行状态更新。不执行节点功能，但可以更改待处理的任务。 |
| `threads.read` |状态通过 `aget_state` / `aget_state_history` 读取。                                                    |
| `assistants.read` |用于可视化、MCP、A2A 等的模式和图形内省## 自定义每个图的跟踪

您可以使用工厂函数自定义或禁用特定图形的跟踪。示例请参见[Conditional tracing: Customize tracing in deployed agents](/langsmith/conditional-tracing#customize-tracing-in-deployed-agents)。

查看有关 [LangGraph API configuration file](/langsmith/cli#configuration-file) 的更多信息。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/graph-rebuild.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>