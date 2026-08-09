<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Streaming | https://docs.langchain.com/oss/python/langchain/streaming -->

# 流媒体

从代理运行流式传输实时更新

<Tip>
  对于新应用，我们推荐[event streaming](/oss/python/langchain/event-streaming)——LangChain v1.3中引入的类型化投影API。事件流为每个投影（消息、值、工具调用、子图）提供单独的迭代器，因此您可以独立使用它们，而不是在 `stream_mode` 块上分支。
</Tip>

LangChain实现了一个流系统来显示实时更新。

流媒体对于增强基于 LLM 构建的应用程序的响应能力至关重要。通过逐步显示输出，甚至在完整响应准备好之前，流式传输显着改善了用户体验 (UX)，特别是在处理 LLM 的延迟时。

## 概述

LangChain 的流媒体系统可让您将代理运行的实时反馈显示到您的应用程序。

LangChain 流媒体可以实现什么：* <Icon icon="brain" /> [**Stream agent progress**](#agent-progress)—在每个代理步骤之后获取状态更新。
* <Icon icon="binary" /> [**Stream LLM tokens**](#llm-tokens)—生成时流式传输语言模型标记。
* <Icon icon="bulb" /> [**Stream thinking / reasoning tokens**](#streaming-thinking-/-reasoning-tokens)—生成的表面模型推理。
* <Icon icon="table" /> [**Stream custom updates**](#custom-updates)—发出用户定义的信号（例如，`"Fetched 10/100 records"`）。
* <Icon icon="stack-push" /> [**Stream multiple modes**](#stream-multiple-modes) — 从 `updates`（代理进度）、`messages`（LLM 代币 + 元数据）或 `custom`（任意用户数据）中进行选择。

有关其他端到端示例，请参阅下面的[common patterns](#common-patterns)部分。

## 支持的流模式

将以下一种或多种流模式作为列表传递给 [⟦T40⟧](https://reference.langchain.com/python/langgraph/graphs/#langgraph.graph.state.CompiledStateGraph.stream) 或 [⟦T41⟧](https://reference.langchain.com/python/langgraph/graphs/#langgraph.graph.state.CompiledStateGraph.astream) 方法：|模式|描述 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `updates` |每个代理步骤后流状态更新。如果在同一步骤中进行多个更新（例如，运行多个节点），则这些更新将单独流式传输。 |
| `messages` |从调用 LLM 的任何图形节点流式传输 `(token, metadata)` 的元组。                                                                               |
| `custom` |使用流编写器从图形节点内部流式传输自定义数据。                                                                                         |

## 代理进度

要流式传输代理进度，请使用 [⟦T46⟧](https://reference.langchain.com/python/langgraph/graphs/#langgraph.graph.state.CompiledStateGraph.stream) 或 [⟦T47⟧](https://reference.langchain.com/python/langgraph/graphs/#langgraph.graph.state.CompiledStateGraph.astream) 方法与 `stream_mode="updates"`。这会在每个代理步骤之后发出一个事件。

例如，如果您有一个代理调用一次工具，您应该会看到以下更新：* **LLM 节点**：[⟦T49⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage) 带有工具调用请求
* **工具节点**：[⟦T50⟧](https://reference.langchain.com/python/langchain-core/messages/tool/ToolMessage)及执行结果
* **LLM节点**：最终AI响应

通过 `config` 传递 `thread_id`，以便对话被检查点并且后续回合可以恢复相同的历史记录。 `thread_id` 独立于`stream_mode`；您还可以将 `context` 与它一起传递，以获取工具从 `runtime.context` 读取的每次运行数据。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver

  def get_weather(city: str) -> str:
      """Get weather for a given city."""
      return f"It's always sunny in {city}!"

  agent = create_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[get_weather],
      checkpointer=InMemorySaver()
  )
  config = {"configurable": {"thread_id": str(uuid7())}}
  stream = agent.stream_events(  # [!code highlight]
      {"messages": [{"role": "user", "content": "What is the weather in SF?"}]},
      config=config,
      version="v3",  # [!code highlight]
  )
  for kind, item in stream.interleave("messages", "tool_calls"):  # [!code highlight]
      if kind == "messages":
          for token in item.text:
              print(token, end="", flush=True)
      elif kind == "tool_calls":
          print(f"\nTool call: {item.tool_name}({item.input})")
          for delta in item.output_deltas:
              print(delta, end="", flush=True)
          print(f"\nTool result: {item.output}")

  final_state = stream.output  # [!code highlight]
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver

  def get_weather(city: str) -> str:
      """Get weather for a given city."""
      return f"It's always sunny in {city}!"

  agent = create_agent(
      model="openai:gpt-5.5",
      tools=[get_weather],
      checkpointer=InMemorySaver()
  )
  config = {"configurable": {"thread_id": str(uuid7())}}
  stream = agent.stream_events(  # [!code highlight]
      {"messages": [{"role": "user", "content": "What is the weather in SF?"}]},
      config=config,
      version="v3",  # [!code highlight]
  )
  for kind, item in stream.interleave("messages", "tool_calls"):  # [!code highlight]
      if kind == "messages":
          for token in item.text:
              print(token, end="", flush=True)
      elif kind == "tool_calls":
          print(f"\nTool call: {item.tool_name}({item.input})")
          for delta in item.output_deltas:
              print(delta, end="", flush=True)
          print(f"\nTool result: {item.output}")

  final_state = stream.output  # [!code highlight]
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver

  def get_weather(city: str) -> str:
      """Get weather for a given city."""
      return f"It's always sunny in {city}!"

  agent = create_agent(
      model="anthropic:claude-sonnet-4-6",
      tools=[get_weather],
      checkpointer=InMemorySaver()
  )
  config = {"configurable": {"thread_id": str(uuid7())}}
  stream = agent.stream_events(  # [!code highlight]
      {"messages": [{"role": "user", "content": "What is the weather in SF?"}]},
      config=config,
      version="v3",  # [!code highlight]
  )
  for kind, item in stream.interleave("messages", "tool_calls"):  # [!code highlight]
      if kind == "messages":
          for token in item.text:
              print(token, end="", flush=True)
      elif kind == "tool_calls":
          print(f"\nTool call: {item.tool_name}({item.input})")
          for delta in item.output_deltas:
              print(delta, end="", flush=True)
          print(f"\nTool result: {item.output}")

  final_state = stream.output  # [!code highlight]
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver

  def get_weather(city: str) -> str:
      """Get weather for a given city."""
      return f"It's always sunny in {city}!"

  agent = create_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=[get_weather],
      checkpointer=InMemorySaver()
  )
  config = {"configurable": {"thread_id": str(uuid7())}}
  stream = agent.stream_events(  # [!code highlight]
      {"messages": [{"role": "user", "content": "What is the weather in SF?"}]},
      config=config,
      version="v3",  # [!code highlight]
  )
  for kind, item in stream.interleave("messages", "tool_calls"):  # [!code highlight]
      if kind == "messages":
          for token in item.text:
              print(token, end="", flush=True)
      elif kind == "tool_calls":
          print(f"\nTool call: {item.tool_name}({item.input})")
          for delta in item.output_deltas:
              print(delta, end="", flush=True)
          print(f"\nTool result: {item.output}")

  final_state = stream.output  # [!code highlight]
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver

  def get_weather(city: str) -> str:
      """Get weather for a given city."""
      return f"It's always sunny in {city}!"

  agent = create_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=[get_weather],
      checkpointer=InMemorySaver()
  )
  config = {"configurable": {"thread_id": str(uuid7())}}
  stream = agent.stream_events(  # [!code highlight]
      {"messages": [{"role": "user", "content": "What is the weather in SF?"}]},
      config=config,
      version="v3",  # [!code highlight]
  )
  for kind, item in stream.interleave("messages", "tool_calls"):  # [!code highlight]
      if kind == "messages":
          for token in item.text:
              print(token, end="", flush=True)
      elif kind == "tool_calls":
          print(f"\nTool call: {item.tool_name}({item.input})")
          for delta in item.output_deltas:
              print(delta, end="", flush=True)
          print(f"\nTool result: {item.output}")

  final_state = stream.output  # [!code highlight]
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver

  def get_weather(city: str) -> str:
      """Get weather for a given city."""
      return f"It's always sunny in {city}!"

  agent = create_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=[get_weather],
      checkpointer=InMemorySaver()
  )
  config = {"configurable": {"thread_id": str(uuid7())}}
  stream = agent.stream_events(  # [!code highlight]
      {"messages": [{"role": "user", "content": "What is the weather in SF?"}]},
      config=config,
      version="v3",  # [!code highlight]
  )
  for kind, item in stream.interleave("messages", "tool_calls"):  # [!code highlight]
      if kind == "messages":
          for token in item.text:
              print(token, end="", flush=True)
      elif kind == "tool_calls":
          print(f"\nTool call: {item.tool_name}({item.input})")
          for delta in item.output_deltas:
              print(delta, end="", flush=True)
          print(f"\nTool result: {item.output}")

  final_state = stream.output  # [!code highlight]
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver

  def get_weather(city: str) -> str:
      """Get weather for a given city."""
      return f"It's always sunny in {city}!"

  agent = create_agent(
      model="ollama:north-mini-code-1.0",
      tools=[get_weather],
      checkpointer=InMemorySaver()
  )
  config = {"configurable": {"thread_id": str(uuid7())}}
  stream = agent.stream_events(  # [!code highlight]
      {"messages": [{"role": "user", "content": "What is the weather in SF?"}]},
      config=config,
      version="v3",  # [!code highlight]
  )
  for kind, item in stream.interleave("messages", "tool_calls"):  # [!code highlight]
      if kind == "messages":
          for token in item.text:
              print(token, end="", flush=True)
      elif kind == "tool_calls":
          print(f"\nTool call: {item.tool_name}({item.input})")
          for delta in item.output_deltas:
              print(delta, end="", flush=True)
          print(f"\nTool result: {item.output}")

  final_state = stream.output  # [!code highlight]
  ```
</CodeGroup>

```shell title="Output" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
step: model
content: [{'type': 'tool_call', 'name': 'get_weather', 'args': {'city': 'San Francisco'}, 'id': 'call_9lBtsDbmmobzyA8xc4I4Ctne'}]
step: tools
content: [{'type': 'text', 'text': "It's always sunny in San Francisco!"}]
step: model
content: [{'type': 'text', 'text': "San Francisco weather: It's always sunny in San Francisco!\n\nIf you’d like the exact current conditions (temperature, humidity, wind) and a short forecast, I can fetch that next. Would you like me to pull live details for San Francisco?"}]
```

<Note>
  保留与 `thread_id` 的对话历史记录需要使用 [checkpointer](/oss/python/langchain/long-term-memory) 配置代理。在 [LangSmith deployments](/langsmith/deployment) 上会自动配置检查点。在本地，显式传递一个，例如 `create_agent(..., checkpointer=InMemorySaver())`。为了简洁起见，此页面上的其余片段省略了 `thread_id`，但您应该在生产中传递它。
</Note>

## LLM 代币

要流式传输 LLM 生成的令牌，请使用 `stream_mode="messages"`。您可以在下面看到代理流工具调用的输出和最终响应。

```python title="Streaming LLM tokens" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent


def get_weather(city: str) -> str:
    """Get weather for a given city."""

    return f"It's always sunny in {city}!"

agent = create_agent(
    model="gpt-5-nano",
    tools=[get_weather],
)
for chunk in agent.stream(  # [!code highlight]
    {"messages": [{"role": "user", "content": "What is the weather in SF?"}]},
    stream_mode="messages",
    version="v2",  # [!code highlight]
):
    if chunk["type"] == "messages":  # [!code highlight]
        token, metadata = chunk["data"]  # [!code highlight]
        print(f"node: {metadata['langgraph_node']}")
        print(f"content: {token.content_blocks}")
        print("\n")
```

```shell title="Output" expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
node: model
content: [{'type': 'tool_call_chunk', 'id': 'call_vbCyBcP8VuneUzyYlSBZZsVa', 'name': 'get_weather', 'args': '', 'index': 0}]


node: model
content: [{'type': 'tool_call_chunk', 'id': None, 'name': None, 'args': '{"', 'index': 0}]


node: model
content: [{'type': 'tool_call_chunk', 'id': None, 'name': None, 'args': 'city', 'index': 0}]


node: model
content: [{'type': 'tool_call_chunk', 'id': None, 'name': None, 'args': '":"', 'index': 0}]


node: model
content: [{'type': 'tool_call_chunk', 'id': None, 'name': None, 'args': 'San', 'index': 0}]


node: model
content: [{'type': 'tool_call_chunk', 'id': None, 'name': None, 'args': ' Francisco', 'index': 0}]


node: model
content: [{'type': 'tool_call_chunk', 'id': None, 'name': None, 'args': '"}', 'index': 0}]


node: model
content: []


node: tools
content: [{'type': 'text', 'text': "It's always sunny in San Francisco!"}]


node: model
content: []


node: model
content: [{'type': 'text', 'text': 'Here'}]


node: model
content: [{'type': 'text', 'text': ''s'}]


node: model
content: [{'type': 'text', 'text': ' what'}]


node: model
content: [{'type': 'text', 'text': ' I'}]


node: model
content: [{'type': 'text', 'text': ' got'}]


node: model
content: [{'type': 'text', 'text': ':'}]


node: model
content: [{'type': 'text', 'text': ' "'}]


node: model
content: [{'type': 'text', 'text': "It's"}]


node: model
content: [{'type': 'text', 'text': ' always'}]


node: model
content: [{'type': 'text', 'text': ' sunny'}]


node: model
content: [{'type': 'text', 'text': ' in'}]


node: model
content: [{'type': 'text', 'text': ' San'}]


node: model
content: [{'type': 'text', 'text': ' Francisco'}]


node: model
content: [{'type': 'text', 'text': '!"\n\n'}]
```

<Note>
  **将代理包装为父级`StateGraph`中的节点？** [⟦T62⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)返回编译后的图，因此将其用作节点使其成为子图。父图上的 `stream_mode="messages"` 不会从内部代理的 LLM 调用中发出令牌块，除非您传递 `subgraphs=True`。参见[Subgraph outputs](/oss/python/langgraph/streaming#subgraph-outputs)。
</Note>

## 自定义更新要在工具执行时流式传输更新，您可以使用 [⟦T65⟧](https://reference.langchain.com/python/langgraph/config/get_stream_writer)。

```python title="Streaming custom updates" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langgraph.config import get_stream_writer  # [!code highlight]


def get_weather(city: str) -> str:
    """Get weather for a given city."""
    writer = get_stream_writer()  # [!code highlight]
    # stream any arbitrary data
    writer(f"Looking up data for city: {city}")
    writer(f"Acquired data for city: {city}")
    return f"It's always sunny in {city}!"

agent = create_agent(
    model="claude-sonnet-4-6",
    tools=[get_weather],
)

for chunk in agent.stream(
    {"messages": [{"role": "user", "content": "What is the weather in SF?"}]},
    stream_mode="custom",  # [!code highlight]
    version="v2",  # [!code highlight]
):
    if chunk["type"] == "custom":  # [!code highlight]
        print(chunk["data"])  # [!code highlight]
```

```shell title="Output" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Looking up data for city: San Francisco
Acquired data for city: San Francisco
```

<Note>
  如果您在工具中添加 [⟦T66⟧](https://reference.langchain.com/python/langgraph/config/get_stream_writer)，您将无法在 LangGraph 执行上下文之外调用该工具。
</Note>

## 多种流模式

您可以通过将流模式作为列表传递来指定多种流模式：`stream_mode=["updates", "custom"]`。

每个流式块都是一个带有 `type`、`ns` 和 `data` 键的 `StreamPart` 字典。使用 `chunk["type"]` 确定流模式，并使用 `chunk["data"]` 访问负载。

```python title="Streaming multiple modes" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langgraph.config import get_stream_writer


def get_weather(city: str) -> str:
    """Get weather for a given city."""
    writer = get_stream_writer()
    writer(f"Looking up data for city: {city}")
    writer(f"Acquired data for city: {city}")
    return f"It's always sunny in {city}!"

agent = create_agent(
    model="gpt-5-nano",
    tools=[get_weather],
)

for chunk in agent.stream(  # [!code highlight]
    {"messages": [{"role": "user", "content": "What is the weather in SF?"}]},
    stream_mode=["updates", "custom"],
    version="v2",  # [!code highlight]
):
    print(f"stream_mode: {chunk['type']}")  # [!code highlight]
    print(f"content: {chunk['data']}")  # [!code highlight]
    print("\n")
```

```shell title="Output" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream_mode: updates
content: {'model': {'messages': [AIMessage(content='', response_metadata={'token_usage': {'completion_tokens': 280, 'prompt_tokens': 132, 'total_tokens': 412, 'completion_tokens_details': {'accepted_prediction_tokens': 0, 'audio_tokens': 0, 'reasoning_tokens': 256, 'rejected_prediction_tokens': 0}, 'prompt_tokens_details': {'audio_tokens': 0, 'cached_tokens': 0}}, 'model_provider': 'openai', 'model_name': 'gpt-5-nano-2025-08-07', 'system_fingerprint': None, 'id': 'chatcmpl-C9tlgBzGEbedGYxZ0rTCz5F7OXpL7', 'service_tier': 'default', 'finish_reason': 'tool_calls', 'logprobs': None}, id='lc_run--480c07cb-e405-4411-aa7f-0520fddeed66-0', tool_calls=[{'name': 'get_weather', 'args': {'city': 'San Francisco'}, 'id': 'call_KTNQIftMrl9vgNwEfAJMVu7r', 'type': 'tool_call'}], usage_metadata={'input_tokens': 132, 'output_tokens': 280, 'total_tokens': 412, 'input_token_details': {'audio': 0, 'cache_read': 0}, 'output_token_details': {'audio': 0, 'reasoning': 256}})]}}


stream_mode: custom
content: Looking up data for city: San Francisco


stream_mode: custom
content: Acquired data for city: San Francisco


stream_mode: updates
content: {'tools': {'messages': [ToolMessage(content="It's always sunny in San Francisco!", name='get_weather', tool_call_id='call_KTNQIftMrl9vgNwEfAJMVu7r')]}}


stream_mode: updates
content: {'model': {'messages': [AIMessage(content='San Francisco weather: It's always sunny in San Francisco!\n\n', response_metadata={'token_usage': {'completion_tokens': 764, 'prompt_tokens': 168, 'total_tokens': 932, 'completion_tokens_details': {'accepted_prediction_tokens': 0, 'audio_tokens': 0, 'reasoning_tokens': 704, 'rejected_prediction_tokens': 0}, 'prompt_tokens_details': {'audio_tokens': 0, 'cached_tokens': 0}}, 'model_provider': 'openai', 'model_name': 'gpt-5-nano-2025-08-07', 'system_fingerprint': None, 'id': 'chatcmpl-C9tljDFVki1e1haCyikBptAuXuHYG', 'service_tier': 'default', 'finish_reason': 'stop', 'logprobs': None}, id='lc_run--acbc740a-18fe-4a14-8619-da92a0d0ee90-0', usage_metadata={'input_tokens': 168, 'output_tokens': 764, 'total_tokens': 932, 'input_token_details': {'audio': 0, 'cache_read': 0}, 'output_token_details': {'audio': 0, 'reasoning': 704}})]}}
```

## 常见模式

以下示例显示了流式传输的常见用例。

### 流式思维/推理代币

一些模型在产生最终答案之前执行内部推理。您可以流式传输这些通过过滤 [standard content blocks](/oss/python/langchain/messages#standard-content-blocks) 以获得 `type` `"reasoning"` 生成的思考/推理标记。

<Note>
  必须在模型上启用推理输出。

  请参阅 [reasoning section](/oss/python/langchain/models#reasoning) 和您的 [provider's integration page](/oss/python/integrations/providers/overview) 了解配置详细信息。

  要快速检查模型的推理支持，请参阅[models.dev](https://models.dev)。
</Note>

要从代理流式传输思考令牌，请使用 `stream_mode="messages"` 并过滤推理内容块：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain_anthropic import ChatAnthropic
from langchain_core.runnables import Runnable


def get_weather(city: str) -> str:
    """Get weather for a given city."""
    return f"It's always sunny in {city}!"


model = ChatAnthropic(
    model_name="claude-sonnet-4-6",
    timeout=None,
    stop=None,
    thinking={"type": "enabled", "budget_tokens": 5000},
)
agent: Runnable = create_agent(
    model=model,
    tools=[get_weather],
)

stream = agent.stream_events(  # [!code highlight]
    {"messages": [{"role": "user", "content": "What is the weather in SF?"}]},
    version="v3",
)
for message in stream.messages:
    for token in message.reasoning:
        print(f"[thinking] {token}", end="")
    for token in message.text:
        print(token, end="", flush=True)
```

```shell title="Output" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[thinking] The user is asking about the weather in San Francisco. I have a tool
[thinking]  available to get this information. Let me call the get_weather tool
[thinking]  with "San Francisco" as the city parameter.
The weather in San Francisco is: It's always sunny in San Francisco!
```无论模型提供者如何，它的工作方式都是相同的 - LangChain 通过 [⟦T80⟧](/oss/python/langchain/messages#standard-content-blocks) 属性将特定于提供者的格式（Anthropic `thinking` 块、OpenAI `reasoning` 摘要等）标准化为标准 `"reasoning"` 内容块类型。

要直接从聊天模型流式传输推理令牌（无需代理），请参阅[streaming with chat models](/oss/python/langchain/models#reasoning)。

### 流工具调用

您可能想要同时传输：

1. 生成部分JSON为[tool calls](/oss/python/langchain/models#tool-calling)
2. 执行的已完成、已解析的工具调用

指定 [⟦T81⟧](#llm-tokens) 将流式传输代理中所有 LLM 调用生成的增量 [message chunks](/oss/python/langchain/messages#streaming-and-chunks)。要使用已解析的工具调用访问已完成的消息：

1. 如果这些消息在 [state](/oss/python/langchain/short-term-memory) 中跟踪（如在 [⟦T82⟧](/oss/python/langchain/agents) 的模型节点中），则使用 `stream_mode=["messages", "updates"]` 通过 [state updates](#agent-progress) 访问已完成的消息（如下所示）。
2. 如果状态中未跟踪这些消息，请使用 [custom updates](#custom-updates) 或在流循环期间聚合块 ([next section](#accessing-completed-messages))。

<Note>
  如果您的代理人拥有多个法学硕士，请参阅下面有关 [streaming from sub-agents](#streaming-from-sub-agents) 的部分。
</Note>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import Any

from langchain.agents import create_agent
from langchain.messages import AIMessage, AIMessageChunk, AnyMessage, ToolMessage


def get_weather(city: str) -> str:
    """Get weather for a given city."""

    return f"It's always sunny in {city}!"


agent = create_agent("openai:gpt-5.5", tools=[get_weather])


def _render_message_chunk(token: AIMessageChunk) -> None:
    if token.text:
        print(token.text, end="|")
    if token.tool_call_chunks:
        print(token.tool_call_chunks)
    # N.B. all content is available through token.content_blocks


def _render_completed_message(message: AnyMessage) -> None:
    if isinstance(message, AIMessage) and message.tool_calls:
        print(f"Tool calls: {message.tool_calls}")
    if isinstance(message, ToolMessage):
        print(f"Tool response: {message.content_blocks}")


input_message = {"role": "user", "content": "What is the weather in Boston?"}
for chunk in agent.stream(
    {"messages": [input_message]},
    stream_mode=["messages", "updates"],  # [!code highlight]
    version="v2",  # [!code highlight]
):
    if chunk["type"] == "messages":  # [!code highlight]
        token, metadata = chunk["data"]  # [!code highlight]
        if isinstance(token, AIMessageChunk):
            _render_message_chunk(token)  # [!code highlight]
    elif chunk["type"] == "updates":  # [!code highlight]
        for source, update in chunk["data"].items():  # [!code highlight]
            if source in ("model", "tools"):  # `source` captures node name
                _render_completed_message(update["messages"][-1])  # [!code highlight]
```

```shell title="Output" expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[{'name': 'get_weather', 'args': '', 'id': 'call_D3Orjr89KgsLTZ9hTzYv7Hpf', 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '{"', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': 'city', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '":"', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': 'Boston', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '"}', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
Tool calls: [{'name': 'get_weather', 'args': {'city': 'Boston'}, 'id': 'call_D3Orjr89KgsLTZ9hTzYv7Hpf', 'type': 'tool_call'}]
Tool response: [{'type': 'text', 'text': "It's always sunny in Boston!"}]
The| weather| in| Boston| is| **|sun|ny|**|.|
```

#### 访问已完成的消息<Note>
  如果在代理的 [state](/oss/python/langchain/short-term-memory) 中跟踪已完成的消息，您可以使用 [Streaming tool calls](#streaming-tool-calls) 部分中演示的 `stream_mode=["messages", "updates"]` 在流式传输期间访问已完成的消息。
</Note>

在某些情况下，已完成的消息不会反映在 [state updates](#agent-progress) 中。如果您有权访问代理内部，则可以使用 [custom updates](#custom-updates) 在流式传输期间访问这些消息。否则，您可以在流循环中聚合消息块（见下文）。

考虑下面的例子，我们将 [stream writer](#custom-updates) 合并到简化的 [guardrail middleware](/oss/python/langchain/guardrails#after-agent-guardrails) 中。该中间件演示了工具调用以生成结构化的“安全/不安全”评估（也可以使用[structured outputs](/oss/python/langchain/models#structured-output)来实现）：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import Any, Literal

from langchain.agents.middleware import after_agent, AgentState
from langgraph.runtime import Runtime
from langchain.messages import AIMessage
from langchain.chat_models import init_chat_model
from langgraph.config import get_stream_writer  # [!code highlight]
from pydantic import BaseModel


class ResponseSafety(BaseModel):
    """Evaluate a response as safe or unsafe."""
    evaluation: Literal["safe", "unsafe"]


safety_model = init_chat_model("openai:gpt-5.5")

@after_agent(can_jump_to=["end"])
def safety_guardrail(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
    """Model-based guardrail: Use an LLM to evaluate response safety."""
    stream_writer = get_stream_writer()  # [!code highlight]
    # Get the model response
    if not state["messages"]:
        return None

    last_message = state["messages"][-1]
    if not isinstance(last_message, AIMessage):
        return None

    # Use another model to evaluate safety
    model_with_tools = safety_model.bind_tools([ResponseSafety], tool_choice="any")
    result = model_with_tools.invoke(
        [
            {
                "role": "system",
                "content": "Evaluate this AI response as generally safe or unsafe."
            },
            {
                "role": "user",
                "content": f"AI response: {last_message.text}"
            }
        ]
    )
    stream_writer(result)  # [!code highlight]

    tool_call = result.tool_calls[0]
    if tool_call["args"]["evaluation"] == "unsafe":
        last_message.content = "I cannot provide that response. Please rephrase your request."

    return None
```

然后，我们可以将此中间件合并到我们的代理中，并包含其自定义流事件：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import Any

from langchain.agents import create_agent
from langchain.messages import AIMessageChunk, AIMessage, AnyMessage


def get_weather(city: str) -> str:
    """Get weather for a given city."""

    return f"It's always sunny in {city}!"


agent = create_agent(
    model="openai:gpt-5.5",
    tools=[get_weather],
    middleware=[safety_guardrail],  # [!code highlight]
)

def _render_message_chunk(token: AIMessageChunk) -> None:
    if token.text:
        print(token.text, end="|")
    if token.tool_call_chunks:
        print(token.tool_call_chunks)


def _render_completed_message(message: AnyMessage) -> None:
    if isinstance(message, AIMessage) and message.tool_calls:
        print(f"Tool calls: {message.tool_calls}")
    if isinstance(message, ToolMessage):
        print(f"Tool response: {message.content_blocks}")


input_message = {"role": "user", "content": "What is the weather in Boston?"}
for chunk in agent.stream(
    {"messages": [input_message]},
    stream_mode=["messages", "updates", "custom"],  # [!code highlight]
    version="v2",  # [!code highlight]
):
    if chunk["type"] == "messages":  # [!code highlight]
        token, metadata = chunk["data"]  # [!code highlight]
        if isinstance(token, AIMessageChunk):
            _render_message_chunk(token)
    elif chunk["type"] == "updates":  # [!code highlight]
        for source, update in chunk["data"].items():  # [!code highlight]
            if source in ("model", "tools"):
                _render_completed_message(update["messages"][-1])
    elif chunk["type"] == "custom":  # [!code highlight]
        # access completed message in stream
        print(f"Tool calls: {chunk['data'].tool_calls}")  # [!code highlight]
```

```shell title="Output" expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[{'name': 'get_weather', 'args': '', 'id': 'call_je6LWgxYzuZ84mmoDalTYMJC', 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '{"', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': 'city', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '":"', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': 'Boston', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '"}', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
Tool calls: [{'name': 'get_weather', 'args': {'city': 'Boston'}, 'id': 'call_je6LWgxYzuZ84mmoDalTYMJC', 'type': 'tool_call'}]
Tool response: [{'type': 'text', 'text': "It's always sunny in Boston!"}]
The| weather| in| **|Boston|**| is| **|sun|ny|**|.|[{'name': 'ResponseSafety', 'args': '', 'id': 'call_O8VJIbOG4Q9nQF0T8ltVi58O', 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '{"', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': 'evaluation', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '":"', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': 'safe', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '"}', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
Tool calls: [{'name': 'ResponseSafety', 'args': {'evaluation': 'safe'}, 'id': 'call_O8VJIbOG4Q9nQF0T8ltVi58O', 'type': 'tool_call'}]
```

或者，如果您无法将自定义事件添加到流中，则可以在流循环中聚合消息块：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
input_message = {"role": "user", "content": "What is the weather in Boston?"}
full_message = None  # [!code highlight]
for chunk in agent.stream(
    {"messages": [input_message]},
    stream_mode=["messages", "updates"],
    version="v2",  # [!code highlight]
):
    if chunk["type"] == "messages":  # [!code highlight]
        token, metadata = chunk["data"]  # [!code highlight]
        if isinstance(token, AIMessageChunk):
            _render_message_chunk(token)
            full_message = token if full_message is None else full_message + token  # [!code highlight]
            if token.chunk_position == "last":  # [!code highlight]
                if full_message.tool_calls:  # [!code highlight]
                    print(f"Tool calls: {full_message.tool_calls}")  # [!code highlight]
                full_message = None  # [!code highlight]
    elif chunk["type"] == "updates":  # [!code highlight]
        for source, update in chunk["data"].items():  # [!code highlight]
            if source == "tools":
                _render_completed_message(update["messages"][-1])
```

### 通过人机交互进行流式传输

为了处理人机交互 [interrupts](/oss/python/langchain/human-in-the-loop)，我们在 [above example](#streaming-tool-calls) 的基础上构建：

1.我们用[human-in-the-loop middleware and a checkpointer](/oss/python/langchain/human-in-the-loop#configuring-interrupts)配置代理
2. 我们收集`"updates"`流模式下产生的中断
3. 我们用[command](/oss/python/langchain/human-in-the-loop#responding-to-interrupts)响应这些中断

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import Any

from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware
from langchain.messages import AIMessage, AIMessageChunk, AnyMessage, ToolMessage
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command, Interrupt


def get_weather(city: str) -> str:
    """Get weather for a given city."""

    return f"It's always sunny in {city}!"


checkpointer = InMemorySaver()

agent = create_agent(
    "openai:gpt-5.5",
    tools=[get_weather],
    middleware=[  # [!code highlight]
        HumanInTheLoopMiddleware(interrupt_on={"get_weather": True}),  # [!code highlight]
    ],  # [!code highlight]
    checkpointer=checkpointer,  # [!code highlight]
)


def _render_message_chunk(token: AIMessageChunk) -> None:
    if token.text:
        print(token.text, end="|")
    if token.tool_call_chunks:
        print(token.tool_call_chunks)


def _render_completed_message(message: AnyMessage) -> None:
    if isinstance(message, AIMessage) and message.tool_calls:
        print(f"Tool calls: {message.tool_calls}")
    if isinstance(message, ToolMessage):
        print(f"Tool response: {message.content_blocks}")


def _render_interrupt(interrupt: Interrupt) -> None:  # [!code highlight]
    interrupts = interrupt.value  # [!code highlight]
    for request in interrupts["action_requests"]:  # [!code highlight]
        print(request["description"])  # [!code highlight]


input_message = {
    "role": "user",
    "content": (
        "Can you look up the weather in Boston and San Francisco?"
    ),
}
config = {"configurable": {"thread_id": "some_id"}}  # [!code highlight]
interrupts = []  # [!code highlight]
for chunk in agent.stream(
    {"messages": [input_message]},
    config=config,  # [!code highlight]
    stream_mode=["messages", "updates"],
    version="v2",  # [!code highlight]
):
    if chunk["type"] == "messages":  # [!code highlight]
        token, metadata = chunk["data"]  # [!code highlight]
        if isinstance(token, AIMessageChunk):
            _render_message_chunk(token)
    elif chunk["type"] == "updates":  # [!code highlight]
        for source, update in chunk["data"].items():  # [!code highlight]
            if source in ("model", "tools"):
                _render_completed_message(update["messages"][-1])
            if source == "__interrupt__":  # [!code highlight]
                interrupts.extend(update)  # [!code highlight]
                _render_interrupt(update[0])  # [!code highlight]
```

```shell title="Output" expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[{'name': 'get_weather', 'args': '', 'id': 'call_GOwNaQHeqMixay2qy80padfE', 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '{"ci', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': 'ty": ', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '"Bosto', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': 'n"}', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': 'get_weather', 'args': '', 'id': 'call_Ndb4jvWm2uMA0JDQXu37wDH6', 'index': 1, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '{"ci', 'id': None, 'index': 1, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': 'ty": ', 'id': None, 'index': 1, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '"San F', 'id': None, 'index': 1, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': 'ranc', 'id': None, 'index': 1, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': 'isco"', 'id': None, 'index': 1, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '}', 'id': None, 'index': 1, 'type': 'tool_call_chunk'}]
Tool calls: [{'name': 'get_weather', 'args': {'city': 'Boston'}, 'id': 'call_GOwNaQHeqMixay2qy80padfE', 'type': 'tool_call'}, {'name': 'get_weather', 'args': {'city': 'San Francisco'}, 'id': 'call_Ndb4jvWm2uMA0JDQXu37wDH6', 'type': 'tool_call'}]
Tool execution requires approval

Tool: get_weather
Args: {'city': 'Boston'}
Tool execution requires approval

Tool: get_weather
Args: {'city': 'San Francisco'}
```接下来我们为每个中断收集一个[decision](/oss/python/langchain/human-in-the-loop#interrupt-decision-types)。重要的是，决策的顺序必须与我们收集的操作的顺序相匹配。

为了说明这一点，我们将编辑一个工具调用并接受另一个：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def _get_interrupt_decisions(interrupt: Interrupt) -> list[dict]:
    return [
        {
            "type": "edit",
            "edited_action": {
                "name": "get_weather",
                "args": {"city": "Boston, U.K."},
            },
        }
        if "boston" in request["description"].lower()
        else {"type": "approve"}
        for request in interrupt.value["action_requests"]
    ]

decisions = {}
for interrupt in interrupts:
    decisions[interrupt.id] = {
        "decisions": _get_interrupt_decisions(interrupt)
    }

decisions
```

```shell title="Output" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
    'a96c40474e429d661b5b32a8d86f0f3e': {
        'decisions': [
            {
                'type': 'edit',
                 'edited_action': {
                     'name': 'get_weather',
                     'args': {'city': 'Boston, U.K.'}
                 }
            },
            {'type': 'approve'},
        ]
    }
}
```

然后我们可以通过将 [command](/oss/python/langchain/human-in-the-loop#responding-to-interrupts) 传递到同一个流循环中来恢复：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
interrupts = []
for chunk in agent.stream(
    Command(resume=decisions),  # [!code highlight]
    config=config,
    stream_mode=["messages", "updates"],
    version="v2",  # [!code highlight]
):
    # Streaming loop is unchanged
    if chunk["type"] == "messages":  # [!code highlight]
        token, metadata = chunk["data"]  # [!code highlight]
        if isinstance(token, AIMessageChunk):
            _render_message_chunk(token)
    elif chunk["type"] == "updates":  # [!code highlight]
        for source, update in chunk["data"].items():  # [!code highlight]
            if source in ("model", "tools"):
                _render_completed_message(update["messages"][-1])
            if source == "__interrupt__":
                interrupts.extend(update)
                _render_interrupt(update[0])
```

```shell title="Output" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Tool response: [{'type': 'text', 'text': "It's always sunny in Boston, U.K.!"}]
Tool response: [{'type': 'text', 'text': "It's always sunny in San Francisco!"}]
-| **|Boston|**|:| It|'s| always| sunny| in| Boston|,| U|.K|.|
|-| **|San| Francisco|**|:| It|'s| always| sunny| in| San| Francisco|!|
```

### 来自子代理的流式传输

当代理中的任何点存在多个 LLM 时，通常需要在生成消息时消除消息来源的歧义。

为此，请在创建代理时将 [⟦T86⟧](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent\(name\)) 传递给每个代理。当在 `"messages"` 模式下进行流式传输时，可以通过 `lc_agent_name` 键在元数据中使用该名称。

下面，我们更新[streaming tool calls](#streaming-tool-calls)示例：

1. 我们用内部调用代理的`call_weather_agent`工具替换我们的工具
2. 我们为每个代理添加一个`name`
3.我们在创建流时指定[⟦T91⟧](/oss/python/langgraph/use-subgraphs#stream-subgraph-outputs)
4. 我们的流处理与之前相同，但我们添加了逻辑来使用 `create_agent` 的 `name` 参数来跟踪哪个代理处于活动状态

<Tip>
  当您在代理上设置`name`时，该名称也会附加到该代理生成的任何`AIMessage`。
</Tip>

首先我们构建代理：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import Any

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain.messages import AIMessage, AnyMessage


def get_weather(city: str) -> str:
    """Get weather for a given city."""

    return f"It's always sunny in {city}!"


weather_model = init_chat_model("openai:gpt-5.5")
weather_agent = create_agent(
    model=weather_model,
    tools=[get_weather],
    name="weather_agent",  # [!code highlight]
)


def call_weather_agent(query: str) -> str:
    """Query the weather agent."""
    result = weather_agent.invoke({
        "messages": [{"role": "user", "content": query}]
    })
    return result["messages"][-1].text


supervisor_model = init_chat_model("openai:gpt-5.5")
agent = create_agent(
    model=supervisor_model,
    tools=[call_weather_agent],
    name="supervisor",  # [!code highlight]
)
```

接下来，我们向流循环添加逻辑以报告哪个代理正在发出令牌：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def _render_message_chunk(token: AIMessageChunk) -> None:
    if token.text:
        print(token.text, end="|")
    if token.tool_call_chunks:
        print(token.tool_call_chunks)


def _render_completed_message(message: AnyMessage) -> None:
    if isinstance(message, AIMessage) and message.tool_calls:
        print(f"Tool calls: {message.tool_calls}")
    if isinstance(message, ToolMessage):
        print(f"Tool response: {message.content_blocks}")


input_message = {"role": "user", "content": "What is the weather in Boston?"}
current_agent = None  # [!code highlight]
for chunk in agent.stream(
    {"messages": [input_message]},
    stream_mode=["messages", "updates"],
    subgraphs=True,  # [!code highlight]
    version="v2",  # [!code highlight]
):
    if chunk["type"] == "messages":  # [!code highlight]
        token, metadata = chunk["data"]  # [!code highlight]
        if agent_name := metadata.get("lc_agent_name"):  # [!code highlight]
            if agent_name != current_agent:  # [!code highlight]
                print(f"🤖 {agent_name}: ")  # [!code highlight]
                current_agent = agent_name  # [!code highlight]
        if isinstance(token, AIMessageChunk):
            _render_message_chunk(token)
    elif chunk["type"] == "updates":  # [!code highlight]
        for source, update in chunk["data"].items():  # [!code highlight]
            if source in ("model", "tools"):
                _render_completed_message(update["messages"][-1])
```

```shell title="Output" expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
🤖 supervisor:
[{'name': 'call_weather_agent', 'args': '', 'id': 'call_asorzUf0mB6sb7MiKfgojp7I', 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '{"', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': 'query', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '":"', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': 'Boston', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': ' weather', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': ' right', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': ' now', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': ' and', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': " today's", 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': ' forecast', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '"}', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
Tool calls: [{'name': 'call_weather_agent', 'args': {'query': "Boston weather right now and today's forecast"}, 'id': 'call_asorzUf0mB6sb7MiKfgojp7I', 'type': 'tool_call'}]
🤖 weather_agent:
[{'name': 'get_weather', 'args': '', 'id': 'call_LZ89lT8fW6w8vqck5pZeaDIx', 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '{"', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': 'city', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '":"', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': 'Boston', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
[{'name': None, 'args': '"}', 'id': None, 'index': 0, 'type': 'tool_call_chunk'}]
Tool calls: [{'name': 'get_weather', 'args': {'city': 'Boston'}, 'id': 'call_LZ89lT8fW6w8vqck5pZeaDIx', 'type': 'tool_call'}]
Tool response: [{'type': 'text', 'text': "It's always sunny in Boston!"}]
Boston| weather| right| now|:| **|Sunny|**|.

|Today|'s| forecast| for| Boston|:| **|Sunny| all| day|**|.|Tool response: [{'type': 'text', 'text': 'Boston weather right now: **Sunny**.\n\nToday's forecast for Boston: **Sunny all day**.'}]
🤖 supervisor:
Boston| weather| right| now|:| **|Sunny|**|.

|Today|'s| forecast| for| Boston|:| **|Sunny| all| day|**|.|
```## 禁用流媒体

在某些应用程序中，您可能需要禁用给定模型的单个令牌的流式传输。这在以下情况下很有用：

* 使用[multi-agent](/oss/python/langchain/multi-agent)系统来控制哪些代理流式传输其输出
* 混合支持流媒体和不支持流媒体的模型
* 部署到[LangSmith](/langsmith/observability)并希望阻止某些模型输出流式传输到客户端

初始化模型时设置`streaming=False`。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model="gpt-5.5",
    streaming=False  # [!code highlight]
)
```

<Tip>
  部署到 LangSmith 时，在您不希望将其输出流式传输到客户端的任何模型上设置 `streaming=False`。这是在部署之前在图形代码中配置的。
</Tip>

<Note>
  并非所有聊天模型集成都支持 `streaming` 参数。如果您的型号不支持，请改用`disable_streaming=True`。此参数可通过基类在所有聊天模型上使用。
</Note>

更多详情请参阅[LangGraph streaming guide](/oss/python/langgraph/streaming#disable-streaming-for-specific-chat-models)。

## v2 流媒体格式

<Note>
  需要 LangGraph >= 1.1。
</Note>

将`version="v2"`传递给`stream()`或`astream()`以获得统一的输出格式。每个块都是一个带有 `type`、`ns` 和 `data` 键的 `StreamPart` 字典 — 无论流模式或模式数量如何，形状都相同：

<CodeGroup>
  ```python v2 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Unified format — no more tuple unpacking
  for chunk in agent.stream(
      {"messages": [{"role": "user", "content": "What is the weather in SF?"}]},
      stream_mode=["updates", "custom"],
      version="v2",
  ):
      print(chunk["type"])  # "updates" or "custom"
      print(chunk["data"])  # payload
  ```

  ```python v1 (current default) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Must unpack (mode, data) tuples
  for mode, chunk in agent.stream(
      {"messages": [{"role": "user", "content": "What is the weather in SF?"}]},
      stream_mode=["updates", "custom"],
  ):
      print(mode)   # "updates" or "custom"
      print(chunk)  # payload
  ```
</CodeGroup>v2 格式还改进了 `invoke()` — 它返回具有 `.value` 和 `.interrupts` 属性的 `GraphOutput` 对象，将状态与中断元数据完全分离：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
result = agent.invoke(
    {"messages": [{"role": "user", "content": "Hello"}]},
    version="v2",
)
print(result.value)       # state (dict, Pydantic model, or dataclass)
print(result.interrupts)  # tuple of Interrupt objects (empty if none)
```

有关 v2 格式的更多详细信息，请参阅 [LangGraph streaming docs](/oss/python/langgraph/streaming#stream-output-format-v2)，包括类型缩小、Pydantic/数据类强制和子图流。

## 相关

* [Frontend streaming](/oss/python/langchain/frontend/overview)—使用 [⟦T111⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 构建 React UI 以实现实时代理交互
* [Streaming with chat models](/oss/python/langchain/models#stream)—直接从聊天模型流式传输令牌，无需使用代理或图
* [Reasoning with chat models](/oss/python/langchain/models#reasoning)—配置和访问聊天模型的推理输出
* [Standard content blocks](/oss/python/langchain/messages#standard-content-blocks)—了解用于推理、文本和其他内容类型的标准化内容块格式
* [Streaming with human-in-the-loop](/oss/python/langchain/human-in-the-loop#streaming-with-human-in-the-loop)—在处理中断以供人工审核时流式传输代理进度
* [LangGraph streaming](/oss/python/langgraph/streaming)—高级流选项，包括 `values`、`debug` 模式和子图流

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/streaming.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>