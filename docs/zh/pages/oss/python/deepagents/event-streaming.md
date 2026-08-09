<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Event streaming | https://docs.langchain.com/oss/python/deepagents/event-streaming -->

# 事件流

流式传输子代理、消息、工具调用和深度代理的最终输出。

本页涵盖了特定于深度代理的流式传输问题——最重要的是，通过`stream.subagents`从委托子代理进行流式传输。对于一般代理流（`stream.messages`、`stream.values`、工具调用、自定义更新），请参阅[LangChain Event Streaming](/oss/python/langchain/event-streaming)。

## 流子代理

深度代理在 LangGraph 流之上添加了子代理投影。当您希望每个委托的 `task` 调用有一个流句柄时，请使用 `stream.subagents`。投影是轻量级的：它首先发现子代理任务，并且仅当您在子代理句柄上访问消息、工具调用和价值流时才会打开它们。

每个句柄的`name`是子代理的配置名称：协调器在调用`task`工具时传递的`subagent_type`。 Deep Agents 将该名称绑定到委托运行，因此您在子代理规范中定义的相同标签就是您在流中过滤和路由的标签。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream = agent.stream_events(
    {
        "messages": [{"role": "user", "content": "Write me a haiku about the sea"}],
    },
    version="v3",
)

subagent_names: list[str] = []
for subagent in stream.subagents:
    print(subagent.name, subagent.path, subagent.status)

    for message in subagent.messages:
        print(message.text)

    subagent_names.append(subagent.name)
```

## 子代理流字段

每个子代理流都公开与父运行相同类型的投影，例如消息、工具调用、嵌套子代理和最终输出。对于一般的父运行流模型，请参见[LangChain Event Streaming](/oss/python/langchain/event-streaming)。Python 使用 Snake\_case 投影名称，例如 `tool_calls`。每个子代理流可以公开 `.messages`、`.tool_calls`、`.values`、`.subagents` 和 `.output`。

|领域 |描述 |
| ------------ | ------------------------------------------------------------------------------------------ |
| `name` |子代理名称，取自协调器在其 `task` 调用中选择的 `subagent_type`。 |
| `messages` |子代理发出的消息。                                                          |
| `subagents` |嵌套子代理调用。                                                               |
| `output` |最终子代理状态，或委派任务的完成信号。                         |
| `path` |子代理流的命名空间路径。                                                    |
| `status` |生命周期状态，例如 `started`、`completed`、`failed` 或 `interrupted`。               |
| `tool_calls` |工具调用范围为子代理。                                                         |

## 跟踪子代理生命周期当您只需要显示哪些子代理启动和完成时，请使用`stream.subagents`。您不需要订阅消息或价值流，除非您访问单个子代理上的这些预测。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream = agent.stream_events(input, version="v3")

running = 0
completed = 0
failed = 0

for subagent in stream.subagents:
    running += 1
    print(f"{subagent.name}: started")

    try:
        _ = subagent.output
        running -= 1
        completed += 1
        print(f"{subagent.name}: completed")
    except Exception:
        running -= 1
        failed += 1
        print(f"{subagent.name}: failed")
```

## 流消息

深度代理可以从协调器代理和委派的子代理发出消息。对顶级消息使用 `stream.messages`，对每个委派的子代理使用 `subagent.messages`。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream = agent.stream_events(input, version="v3")

coordinator_messages: list[str] = []
for message in stream.messages:
    print("[coordinator]", message.text)
    coordinator_messages.append(message.text)

for subagent in stream.subagents:
    for message in subagent.messages:
        print(f"[{subagent.name}]", message.text)
```

## 流工具调用

深层代理在代理树的每个级别公开工具调用。将顶级 `stream.tool_calls` 用于协调器工具，将每个 `subagent.tool_calls` 用于委派工作。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream = agent.stream_events(input, version="v3")

coordinator_tool_names: list[str] = []
for call in stream.tool_calls:
    print("[coordinator tool]", call.tool_name, call.input)
    print(call.completed, call.error)
    coordinator_tool_names.append(call.tool_name)

for subagent in stream.subagents:
    for call in subagent.tool_calls:
        print(f"[{subagent.name} tool]", call.tool_name, call.input)
        for delta in call.output_deltas:
            print(delta, end="", flush=True)

        if call.completed and call.error is None:
            print(call.output)
        elif call.error is not None:
            print(call.error)
```

## 流式嵌套工作

您可以递归到子代理流以观察嵌套的子代理、消息和工具调用。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream = agent.stream_events(input, version="v3")

subagent_names: list[str] = []
for subagent in stream.subagents:
    print(f"subagent {subagent.name}: {subagent.status}")

    for tool_call in subagent.tool_calls:
        print(f"{tool_call.tool_name}({tool_call.input})")
        for delta in tool_call.output_deltas:
            print(delta, end="", flush=True)

    for nested in subagent.subagents:
        print(f"nested subagent {nested.name}: {nested.status}")

    subagent_names.append(subagent.name)
```

## 并发消费

协调器和子代理的输出经常交错。当您需要实时 UI 更新时，同时使用投影。

对于异步代码中的并发消耗，请使用 `astream_events` 和 `asyncio.gather`：

```py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

stream = await agent.astream_events(input, version="v3")

async def consume_coordinator():
    async for message in stream.messages:
        print("[coordinator]", await message.text)

async def consume_subagents():
    async for subagent in stream.subagents:
        async for message in subagent.messages:
            print(f"[{subagent.name}]", await message.text)

await asyncio.gather(consume_coordinator(), consume_subagents())
```

对于同步代码，请使用 `stream.interleave(...)` 代替：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream = agent.stream_events(input, version="v3")

for name, item in stream.interleave("messages", "subagents"):
    if name == "messages":
        print("[coordinator]", item.text)
    else:
        for message in item.messages:
            print(f"[{item.name}]", message.text)
```

当您需要协调器和所有子代理之间的准确到达顺序时，请迭代原始协议事件并使用 `namespace` 来识别源：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream = agent.stream_events(input, version="v3")

text_deltas: list[str] = []
for event in stream:
    if event.get("method") != "messages":
        continue

    payload = event["params"]["data"][0]
    if not isinstance(payload, dict):
        continue
    if payload.get("event") != "content-block-delta":
        continue

    block = payload.get("delta") or {}
    if block.get("type") == "text-delta":
        source = "subagent" if event["params"]["namespace"] else "coordinator"
        print(f"[{source}] {block['text']}")
        text_deltas.append(block["text"])
```

## 子代理与子图`stream.subgraphs`展示了图的执行结构。 `stream.subagents` 显示产品级深度代理任务委派。将 `stream.subagents` 用于面向用户的 UI，因为它隐藏内部图节点并直接公开子代理概念。

## 相关

* [LangChain Event Streaming](/oss/python/langchain/event-streaming) 涵盖一般代理消息和工具调用流概念。
* [Subagent frontend streaming](/oss/python/deepagents/frontend/subagent-streaming) 显示将协调器消息与子代理卡分开的 UI 模式。
* [LangGraph Event Streaming](/oss/python/langgraph/event-streaming)涵盖了底层的图流模型。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/event-streaming.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>