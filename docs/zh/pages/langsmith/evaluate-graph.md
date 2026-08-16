<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to evaluate a graph | https://docs.langchain.com/langsmith/evaluate-graph -->

# 如何评估图

<Info>
[langgraph](https://langchain-ai.github.io/langgraph/)
</Info>

`langgraph` 是一个用于使用 LLM 构建有状态、多参与者应用程序的库，用于创建代理和多代理工作流程。评估 `langgraph` 图可能具有挑战性，因为单个调用可能涉及许多 LLM 调用，并且进行哪些 LLM 调用可能取决于先前调用的输出。在本指南中，我们将重点关注如何将图和图节点传递给`evaluate()`/`aevaluate()`的机制。如需了解构建代理时的评估技术和最佳实践，请前往[langgraph docs](https://langchain-ai.github.io/langgraph/tutorials/#evaluation)。

## 端到端评估

最常见的评估类型是端到端评估，我们希望评估每个示例输入的最终图形输出。

### 定义一个图

让我们构建一个简单的 ReACT 代理来开始：

```python
from typing import Annotated, Literal, TypedDict
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.prebuilt import ToolNode
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages

class State(TypedDict):
    # Messages have the type "list". The 'add_messages' function
    # in the annotation defines how this state key should be updated
    # (in this case, it appends messages to the list, rather than overwriting them)
    messages: Annotated[list, add_messages]

# Define the tools for the agent to use
@tool
def search(query: str) -> str:
    """Call to surf the web."""
    # This is a placeholder, but don't tell the LLM that...
    if "sf" in query.lower() or "san francisco" in query.lower():
        return "It's 60 degrees and foggy."
    return "It's 90 degrees and sunny."

tools = [search]
tool_node = ToolNode(tools)
model = init_chat_model("claude-sonnet-4-6").bind_tools(tools)

# Define the function that determines whether to continue or not
def should_continue(state: State) -> Literal["tools", END]:
    messages = state['messages']
    last_message = messages[-1]

    # If the LLM makes a tool call, then we route to the "tools" node
    if last_message.tool_calls:
        return "tools"

    # Otherwise, we stop (reply to the user)
    return END

# Define the function that calls the model
def call_model(state: State):
    messages = state['messages']
    response = model.invoke(messages)

    # We return a list, because this will get added to the existing list
    return {"messages": [response]}

# Define a new graph
workflow = StateGraph(State)

# Define the two nodes we will cycle between
workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)

# Set the entrypoint as 'agent'
# This means that this node is the first one called
workflow.add_edge(START, "agent")

# We now add a conditional edge
workflow.add_conditional_edges(
    # First, we define the start node. We use 'agent'.
    # This means these are the edges taken after the 'agent' node is called.
    "agent",
    # Next, we pass in the function that will determine which node is called next.
    should_continue,
)

# We now add a normal edge from 'tools' to 'agent'.
# This means that after 'tools' is called, 'agent' node is called next.
workflow.add_edge("tools", 'agent')

# Finally, we compile it!
# This compiles it into a LangChain Runnable,
# meaning you can use it as you would any other runnable.
# Note that we're (optionally) passing the memory when compiling the graph
app = workflow.compile()
```

### 创建数据集

让我们创建一个简单的问题和预期响应数据集：

```python
from langsmith import Client

questions = [
    "what's the weather in sf",
    "what's the weather in san fran",
    "what's the weather in tangier"
]

answers = [
    "It's 60 degrees and foggy.",
    "It's 60 degrees and foggy.",
    "It's 90 degrees and sunny.",
]

ls_client = Client()
dataset = ls_client.create_dataset("weather agent")
ls_client.create_examples(
    inputs=[{"question": q} for q in questions],
    outputs=[{"answer": a} for a in answers],
    dataset_id=dataset.id,
)
```

### 创建一个评估器

和一个简单的评估器：

需要`langsmith>=0.2.0`

```python
judge_llm = init_chat_model("gpt-5.5")

async def correct(outputs: dict, reference_outputs: dict) -> bool:
    instructions = (
        "Given an actual answer and an expected answer, determine whether"
        " the actual answer contains all of the information in the"
        " expected answer. Respond with 'CORRECT' if the actual answer"
        " does contain all of the expected information and 'INCORRECT'"
        " otherwise. Do not include anything else in your response."
    )
    # Our graph outputs a State dictionary, which in this case means
    # we'll have a 'messages' key and the final message should
    # be our actual answer.
    actual_answer = outputs["messages"][-1].content
    expected_answer = reference_outputs["answer"]
    user_msg = (
        f"ACTUAL ANSWER: {actual_answer}"
        f"\n\nEXPECTED ANSWER: {expected_answer}"
    )
    response = await judge_llm.ainvoke(
        [
            {"role": "system", "content": instructions},
            {"role": "user", "content": user_msg}
        ]
    )
    return response.content.upper() == "CORRECT"
```

### 运行评估

现在我们可以进行评估并探索结果。我们只需要包装我们的图形函数，以便它可以按照存储在我们的示例中的格式接受输入：<Note>
如果所有图形节点都定义为同步函数，那么您可以使用 `evaluate` 或 `aevaluate`。如果任何节点被定义为异步，则需要使用 `aevaluate`
</Note>

需要`langsmith>=0.2.0`

```python
import asyncio
from langsmith import aevaluate

def example_to_state(inputs: dict) -> dict:
  return {"messages": [{"role": "user", "content": inputs['question']}]}

# We use LCEL declarative syntax here.
# Remember that langgraph graphs are also langchain runnables.
target = example_to_state | app

async def main():
    experiment_results = await aevaluate(
        target,
        data="weather agent",
        evaluators=[correct],
        max_concurrency=4,  # optional
        experiment_prefix="claude-sonnet-4-6-baseline",  # optional
        metadata={  # optional, used to populate model/prompt/tool columns in UI
            "models": "google_genai:gemini-3.6-flash",
            "tools": [{"name": "search", "description": "Call to surf the web."}],
        },
    )
    print(experiment_results)

asyncio.run(main())
```

## 评估中间步骤

通常，不仅评估代理的最终输出，而且评估其所采取的中间步骤也很有价值。 `langgraph` 的优点在于，图的输出是一个状态对象，通常已经携带了有关所采取的中间步骤的信息。通常，我们只需查看状态中的消息即可评估我们感兴趣的任何内容。例如，我们可以查看消息来断言模型第一步调用了“搜索”工具。

需要`langsmith>=0.2.0`

```python
def right_tool(outputs: dict) -> bool:
    tool_calls = outputs["messages"][1].tool_calls
    return bool(tool_calls and tool_calls[0]["name"] == "search")

async def main():
    experiment_results = await aevaluate(
        target,
        data="weather agent",
        evaluators=[correct, right_tool],
        max_concurrency=4,  # optional
        experiment_prefix="claude-sonnet-4-6-baseline",  # optional
        metadata={  # optional, used to populate model/prompt/tool columns in UI
            "models": "google_genai:gemini-3.6-flash",
            "tools": [{"name": "search", "description": "Call to surf the web."}],
        },
    )
    print(experiment_results)
```

如果我们需要访问有关未处于状态的中间步骤的信息，我们可以查看 Run 对象。这包含所有节点输入和输出的完整跟踪：

<Check>
在此 [how-to guide](/langsmith/code-evaluator-ui) 中详细了解可以传递给自定义求值器的参数。
</Check>

```python
from langsmith.schemas import Run, Example

def right_tool_from_run(run: Run, example: Example) -> dict:
    # Get documents and answer
    first_model_run = next(run for run in root_run.child_runs if run.name == "agent")
    tool_calls = first_model_run.outputs["messages"][-1].tool_calls
    right_tool = bool(tool_calls and tool_calls[0]["name"] == "search")
    return {"key": "right_tool", "value": right_tool}

async def main():
    experiment_results = await aevaluate(
        target,
        data="weather agent",
        evaluators=[correct, right_tool_from_run],
        max_concurrency=4,  # optional
        experiment_prefix="claude-sonnet-4-6-baseline",  # optional
        metadata={  # optional, used to populate model/prompt/tool columns in UI
            "models": "google_genai:gemini-3.6-flash",
            "tools": [{"name": "search", "description": "Call to surf the web."}],
        },
    )
    print(experiment_results)
```

## 运行并评估各个节点有时您想直接评估单个节点以节省时间和成本。 `langgraph` 可以轻松做到这一点。在这种情况下，我们甚至可以继续使用我们一直在使用的评估器。

```python
node_target = example_to_state | app.nodes["agent"]

async def main():
    node_experiment_results = await aevaluate(
        node_target,
        data="weather agent",
        evaluators=[right_tool_from_run],
        max_concurrency=4,  # optional
        experiment_prefix="claude-sonnet-4-6-model-node",  # optional
        metadata={  # optional, used to populate model/prompt/tool columns in UI
            "models": "google_genai:gemini-3.6-flash",
            "tools": [{"name": "search", "description": "Call to surf the web."}],
        },
    )
    print(node_experiment_results)
```

## 相关

* [⟦T20⟧ evaluation docs](https://langchain-ai.github.io/langgraph/tutorials/#evaluation)

## 参考代码

<Accordion title="Click to see a consolidated code snippet">

```python
import asyncio
from typing import Annotated, Literal, TypedDict
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.prebuilt import ToolNode
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langsmith import Client, aevaluate

# Define a graph
class State(TypedDict):
    # Messages have the type "list". The 'add_messages' function
    # in the annotation defines how this state key should be updated
    # (in this case, it appends messages to the list, rather than overwriting them)
    messages: Annotated[list, add_messages]

# Define the tools for the agent to use
@tool
def search(query: str) -> str:
    """Call to surf the web."""
    # This is a placeholder, but don't tell the LLM that...
    if "sf" in query.lower() or "san francisco" in query.lower():
        return "It's 60 degrees and foggy."
    return "It's 90 degrees and sunny."

tools = [search]
tool_node = ToolNode(tools)
model = init_chat_model("claude-sonnet-4-6").bind_tools(tools)

# Define the function that determines whether to continue or not
def should_continue(state: State) -> Literal["tools", END]:
    messages = state['messages']
    last_message = messages[-1]

    # If the LLM makes a tool call, then we route to the "tools" node
    if last_message.tool_calls:
        return "tools"

    # Otherwise, we stop (reply to the user)
    return END

# Define the function that calls the model
def call_model(state: State):
    messages = state['messages']
    response = model.invoke(messages)
    # We return a list, because this will get added to the existing list
    return {"messages": [response]}

# Define a new graph
workflow = StateGraph(State)

# Define the two nodes we will cycle between
workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)

# Set the entrypoint as 'agent'
# This means that this node is the first one called
workflow.add_edge(START, "agent")

# We now add a conditional edge
workflow.add_conditional_edges(
    # First, we define the start node. We use 'agent'.
    # This means these are the edges taken after the 'agent' node is called.
    "agent",
    # Next, we pass in the function that will determine which node is called next.
    should_continue,
)

# We now add a normal edge from 'tools' to 'agent'.
# This means that after 'tools' is called, 'agent' node is called next.
workflow.add_edge("tools", 'agent')

# Finally, we compile it!
# This compiles it into a LangChain Runnable,
# meaning you can use it as you would any other runnable.
# Note that we're (optionally) passing the memory when compiling the graph
app = workflow.compile()

questions = [
    "what's the weather in sf",
    "what's the weather in san fran",
    "what's the weather in tangier"
]

answers = [
    "It's 60 degrees and foggy.",
    "It's 60 degrees and foggy.",
    "It's 90 degrees and sunny.",
]

# Create a dataset
ls_client = Client()
dataset = ls_client.create_dataset("weather agent")
ls_client.create_examples(
    inputs=[{"question": q} for q in questions],
    outputs=[{"answer": a} for a in answers],
    dataset_id=dataset.id,
)

# Define evaluators

judge_llm = init_chat_model("gpt-5.5")

async def correct(outputs: dict, reference_outputs: dict) -> bool:
    instructions = (
        "Given an actual answer and an expected answer, determine whether"
        " the actual answer contains all of the information in the"
        " expected answer. Respond with 'CORRECT' if the actual answer"
        " does contain all of the expected information and 'INCORRECT'"
        " otherwise. Do not include anything else in your response."
    )
    # Our graph outputs a State dictionary, which in this case means
    # we'll have a 'messages' key and the final message should
    # be our actual answer.
    actual_answer = outputs["messages"][-1].content
    expected_answer = reference_outputs["answer"]
    user_msg = (
        f"ACTUAL ANSWER: {actual_answer}"
        f"\n\nEXPECTED ANSWER: {expected_answer}"
    )
    response = await judge_llm.ainvoke(
        [
            {"role": "system", "content": instructions},
            {"role": "user", "content": user_msg}
        ]
    )
    return response.content.upper() == "CORRECT"

def right_tool(outputs: dict) -> bool:
    tool_calls = outputs["messages"][1].tool_calls
    return bool(tool_calls and tool_calls[0]["name"] == "search")

def example_to_state(inputs: dict) -> dict:
  return {"messages": [{"role": "user", "content": inputs['question']}]}

# We use LCEL declarative syntax here.
# Remember that langgraph graphs are also langchain runnables.
target = example_to_state | app

# Run evaluation
async def main():
    experiment_results = await aevaluate(
        target,
        data="weather agent",
        evaluators=[correct, right_tool],
        max_concurrency=4,  # optional
        experiment_prefix="claude-sonnet-4-6-baseline",  # optional
        metadata={  # optional, used to populate model/prompt/tool columns in UI
            "models": "google_genai:gemini-3.6-flash",
            "tools": [{"name": "search", "description": "Call to surf the web."}],
        },
    )
    print(experiment_results)

asyncio.run(main())
```

</Accordion>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluate-graph.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>