<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Event streaming | https://docs.langchain.com/oss/python/langchain/event-streaming -->

# 事件流

从 LangChain 代理运行中获取实时更新

LangChain 代理基于 LangGraph 构建，因此它们支持相同的流堆栈以及以代理为中心的消息、工具调用、状态和自定义更新的投影。

对于大多数应用程序和前端用例，通过 `stream_events(..., version="v3")` 使用**事件流**。事件流返回带有类型化投影的运行对象，因此每个投影都可以独立使用，而不是解析流模式元组。

```py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent


def get_weather(city: str) -> str:
    """Get weather for a city."""
    return f"It's always sunny in {city}!"


agent = create_agent(
    model="gpt-5-nano",
    tools=[get_weather],
)

stream = agent.stream_events({
    "messages": [{"role": "user", "content": "What is the weather in SF?"}],
}, version="v3")

for message in stream.messages:
    for delta in message.text:
        print(delta, end="", flush=True)

final_state = stream.output
```

## 您可以流式传输的内容|投影|使用 |
| -------------------- | -------------------------------------------------------------------------------------- |
| `for event in stream` |原始协议事件具有完整的信封并可访问每个通道。        |
| `stream.messages` |模型消息流，每个 LLM 调用一个。                                   |
| `message.text` |消息的文本增量和最终文本。                                  |
| `message.reasoning` |公开推理内容的模型的推理增量。                 |
| `message.tool_calls` |工具调用参数块和最终的工具调用。                        |
| `message.output` |模型调用完成后的最终消息对象。                       |
| `stream.values` |代理状态快照。                                                     |
| `stream.output` |最终代理状态。                                                         |
| `stream.subgraphs` |嵌套图运行（子代理和普通子图）。                        |
| `stream.extensions` |定制变压器投影。                                            || `stream.tool_calls` |工具执行生命周期、输入、输出增量、最终输出和错误。 |

`stream.messages` 产生 `ChatModelStream` 对象。每个消息流都公开 `.text`、`.reasoning`、`.tool_calls` 和 `.output`。同步投影对于实时增量是可迭代的，对于最终值是可排出的：使用`str(message.text)`作为最终文本，使用`message.tool_calls.get()`作为最终的工具调用。

## 代理消息

当您想要每个 LLM 调用的模型输出时，请使用 `stream.messages`。

```py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream = agent.stream_events(input, version="v3")

for message in stream.messages:
    print(f"[{message.node}] ", end="")
    for delta in message.text:
        print(delta, end="", flush=True)

    full_message = message.output
    usage = full_message.usage_metadata
    if usage:
        print(usage)
```

`message.output` 为您提供最终确定的 AI 消息，包括特定于提供商的内容块。在 TypeScript 中，当您只需要令牌计数或其他使用元数据时，请使用`message.usage`；在 Python 中，请从 `message.output.usage_metadata` 读取用法。

## 推理内容

推理内容使用与文本内容相同的形状，但仅当所选模型发出推理块时才可用。

```py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream = agent.stream_events(input, version="v3")

for message in stream.messages:
    for delta in message.reasoning:
        print(f"[thinking] {delta}", end="", flush=True)

    for delta in message.text:
        print(delta, end="", flush=True)
```

有关模型配置详细信息，请参阅 [reasoning guide](/oss/python/langchain/models#reasoning) 和提供商的集成页面。

## 工具调用

有两个有用的工具调用投影：

* `message.tool_calls` 在模型生成工具调用时流式传输工具调用参数块。
* `stream.tool_calls` 在工具调用开始后流式传输工具执行的生命周期。

```py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream = agent.stream_events(input, version="v3")

for message in stream.messages:
    for chunk in message.tool_calls:
        print(f"tool call chunk: {chunk}")

    finalized = message.tool_calls.get()
    if finalized:
        print(f"finalized tool calls: {finalized}")

for call in stream.tool_calls:
    print(f"{call.tool_name}({call.input})")
    for delta in call.output_deltas:
        print(delta, end="", flush=True)
    print(call.output, call.error)
```

## 流式子代理当 `create_agent` 调用调用另一个名为 `create_agent`（通常通过包装工具）时，内部代理的事件在嵌套命名空间中流动。您传递给 `create_agent` 的 `name=` 标识流中的内部代理，因此您可以对每个代理进行过滤和标记。

指定的子代理表面位于专用的 `stream.subagents` 投影上。每个句柄都会公开内部代理自己的 `.messages`、`.values`、`.tool_calls` 和 `.output`，以及 `.name`（您传递的 `name=`）和 `.cause`（调度子代理的工具调用）。因为这里只出现命名的 `create_agent` 运行，所以您不需要过滤掉普通子图。

```py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model


def get_weather(city: str) -> str:
    """Get weather for a given city."""
    return f"It's always sunny in {city}!"


weather_agent = create_agent(
    model=init_chat_model("openai:gpt-5.5"),
    tools=[get_weather],
    name="weather_agent",
)


def call_weather(query: str) -> str:
    """Query the weather agent."""
    result = weather_agent.invoke({"messages": [{"role": "user", "content": query}]})
    return result["messages"][-1].text


supervisor = create_agent(
    model=init_chat_model("openai:gpt-5.5"),
    tools=[call_weather],
    name="supervisor",
)

stream = supervisor.stream_events(
    {"messages": [{"role": "user", "content": "What's the weather in Boston?"}]},
    version="v3",
)

for subagent in stream.subagents:
    print(f"{subagent.name}: ", end="")
    for message in subagent.messages:
        for token in message.text:
            print(token, end="", flush=True)
    print()
```

从工具调用的普通 `StateGraph` 子图也出现在 `stream.subgraphs` 上 — 在 `.compile(name=...)` 上设置 `name=` 以获取 `subagent.graph_name` 中的标签。

`stream.subagents`是命名的`create_agent`子代理的聚焦视图，而`stream.subgraphs`涵盖了每个嵌套图。使用与您的 UI 匹配的任何一个。

## 状态和最终输出

使用 `stream.values` 表示状态快照，使用 `stream.output` 表示最终代理状态。

```py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream = agent.stream_events(input, version="v3")

for snapshot in stream.values:
    print(snapshot)

final_state = stream.output
```

## 多重投影

对于异步代码中的并发消耗，请使用 `astream_events` 和 `asyncio.gather`：

```py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

stream = await agent.astream_events(input, version="v3")

async def consume_messages():
    async for message in stream.messages:
        print(await message.text)

async def consume_tool_calls():
    async for call in stream.tool_calls:
        print(call.tool_name, call.input)

await asyncio.gather(consume_messages(), consume_tool_calls())
```

对于同步代码，请使用 `stream.interleave(...)` 代替：

```py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream = agent.stream_events(input, version="v3")

for name, item in stream.interleave("messages", "tool_calls", "values"):
    if name == "messages":
        print(item.text)
    elif name == "tool_calls":
        print(item.tool_name, item.input)
    elif name == "values":
        print(item)
```

要访问未公开为类型化投影的通道，或检查完整的事件信封，请迭代原始协议事件：

```py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
for event in stream:
    print(event["method"], event["params"]["namespace"], event["params"]["data"])
```

## 自定义更新当您的应用程序需要非内置的投影（例如检索进度、工件或特定于域的事件）时，请使用自定义流转换器。

```py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream = agent.stream_events(
    input,
    version="v3",
    transformers=[ToolActivityTransformer],
)

for activity in stream.extensions["tool_activity"]:
    print(activity)
```

### 在中间件上注册变压器

<Note>中间件注册变压器需要`langchain>=1.3.2`。</Note>

中间件可以声明流转换器工厂及其挂钩和工具。工厂形状因语言而异：

将 `AgentMiddleware` 子类的 `transformers` 属性设置为工厂序列。每个工厂的形状为`Callable[[tuple[str, ...]], StreamTransformer]`，并作为`factory(scope)`调用，其中`scope`是迷你复用器范围元组（`()`用于根复用器，对于子图非空）。每次调用返回一个新的变压器可以使每个子图保持隔离。

```py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import AgentMiddleware


class ToolActivityMiddleware(AgentMiddleware):
    transformers = (ToolActivityTransformer,)


agent = create_agent(
    model="gpt-5-nano",
    tools=[get_weather],
    middleware=[ToolActivityMiddleware()],
)
```

在编译时，`create_agent`将中间件注册的工厂与传递给其自己的`transformers=`参数的任何内容合并。编译图上的最终顺序是：

1. 内置`ToolCallTransformer`。
2. 中间件注册工厂，按中间件顺序。
3. 调用者从 `create_agent` 提供 `transformers=`。

这使内置工具调用投影保持在消费者变压器面前，并为调用者提供的条目提供最终决定权。内置 `PIIMiddleware` 使用此钩子从流式传输输出中编辑 PII。使用 `apply_to_output=True`，其注册的转换器会在离开运行之前从文本增量、工具调用参数、工具输出和状态快照中清除检测到的 PII，从而关闭`after_model` 状态级编辑的窗口，否则会让原始 PII 传递给 `stream_events(version="v3")` 的实时读者。

```py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import PIIMiddleware

agent = create_agent(
    model="gpt-5-nano",
    tools=[],
    middleware=[
        PIIMiddleware("email", strategy="redact", apply_to_output=True),
    ],
)
```

完整配置表面请参见[PII detection](/oss/python/langchain/middleware/built-in#pii-detection)。

变压器合同见[Build your own projection](/oss/python/langgraph/event-streaming#build-your-own-projection)。

## 相关

* [Streaming](/oss/python/langchain/streaming) 涵盖低级 Pregel 流模式。
* [Build your own projection](/oss/python/langgraph/event-streaming#build-your-own-projection) 涵盖编写特定于应用程序的投影。
* [Frontend streaming patterns](/oss/python/langchain/frontend/overview) 显示基于流状态构建的 UI 用例。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/event-streaming.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>