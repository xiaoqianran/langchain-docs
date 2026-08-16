<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Event streaming API | https://docs.langchain.com/langsmith/event-streaming -->

# 事件流 API

事件流是用于 LangSmith 部署的类型化投影流模型。 LangGraph SDK（[Python](/langsmith/langgraph-python-sdk)、[JavaScript](/langsmith/langgraph-js-ts-sdk)）针对 [LangSmith Deployment API](/langsmith/server-api-ref) 打开单个订阅，并公开类型化投影（消息、状态、工具调用、子图、输出和自定义转换器扩展），这些投影可以在一次运行中同时使用。

事件流位于[streaming API](/langsmith/streaming)之上一级，它公开了原始流模式。

<Note>
事件流需要 [LangGraph Agent Server](/langsmith/agent-server) 上的 `langgraph-api>=0.10.0`。托管LangSmith部署会自动更新；自托管服务器必须采用兼容版本。客户端 SDK 必须是 `langgraph-sdk>=0.4.0` 和 `langchain-core>=1.4.0` (Python) 或 `@langchain/langgraph-sdk>=1.9.15` (JavaScript)。早期版本的服务器继续为[streaming API](/langsmith/streaming)提供服务。
</Note>

## 快速入门

<Tabs>
    <Tab title="Python">
    ```python
    from langgraph_sdk import get_client

    client = get_client(url=DEPLOYMENT_URL, api_key=API_KEY)

    async with client.threads.stream(assistant_id="agent") as thread:
        await thread.run.start(
            input={"messages": [{"role": "user", "content": "What is 42 * 17?"}]},
        )

        async for message in thread.messages:
            async for token in message.text:
                print(token, end="", flush=True)

        final_state = await thread.output
    ```
    </Tab>
    <Tab title="JavaScript">
    ```javascript
    import { Client } from "@langchain/langgraph-sdk";

    const client = new Client({
      apiUrl: process.env.DEPLOYMENT_URL,
      apiKey: process.env.LANGSMITH_API_KEY,
    });

    const thread = client.threads.stream({ assistantId: "agent" });

    await thread.run.start({
      input: { messages: [{ role: "user", content: "What is 42 * 17?" }] },
    });

    for await (const message of thread.messages) {
      for await (const token of message.text) {
        process.stdout.write(token);
      }
    }

    const finalState = await thread.output;
    await thread.close();
    ```

    JavaScript 流没有 `async with` 等效项，因此在完成后调用 `await thread.close()` 来释放底层订阅。
    </Tab>
    <Tab title="cURL">
    事件流使用两个端点。首先打开 SSE 订阅，然后在同一线程上发送 `run.start` 命令 — SDK 会为您执行这两项操作，但在线路级别它们是单独的请求。

    创建一个线程：

    ```bash
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads \
      --header 'Content-Type: application/json' \
      --header 'x-api-key: <API_KEY>' \
      --data '{}'
    ```打开事件订阅。主体是 `EventStreamRequest`：要订阅的频道，加上可选的 `namespaces`、`depth` 和 `since` seq 游标：

    ```bash
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/stream/events \
      --header 'Content-Type: application/json' \
      --header 'x-api-key: <API_KEY>' \
      --data '{"channels": ["values", "updates", "messages", "tools", "lifecycle", "input", "checkpoints", "tasks", "custom"]}'
    ```

    在第二个请求上发送 `run.start` 命令以开始运行。命令正文是一个 JSON-RPC 风格的信封，带有 `id`、`method` 和 `params`：

    ```bash
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/commands \
      --header 'Content-Type: application/json' \
      --header 'x-api-key: <API_KEY>' \
      --data '{
        "id": 1,
        "method": "run.start",
        "params": {
          "assistant_id": "agent",
          "input": {"messages": [{"role": "user", "content": "What is 42 * 17?"}]}
        }
      }'
    ```

    SSE响应的每一行都是一个`ProtocolEvent`信封；解析事件并由 `method` 调度以重建 SDK 公开的类型化投影。
    </Tab>
</Tabs>

有关LangGraph应用程序代码中的进程内等效项，请参阅[LangGraph event streaming](/oss/python/langgraph/event-streaming)。

默认情况下，SDK 通过服务器发送的事件进行流式传输。要改用全双工 WebSocket 连接，请将 `transport="websocket"` 传递给 `client.threads.stream(...)`。

## 事件流提供什么

`client.threads.stream(...)` 返回的流公开了一个底层事件流上的类型化投影：|投影|使用|
| ---------- | ---|
| `thread.events` |迭代每个原始协议事件 (Python)。在 JavaScript 中，打开 `thread.subscribe(...)`。 |
| `thread.messages` |流式传输聊天模型消息、令牌增量、推理和工具调用参数块。 |
| `thread.values` |迭代状态快照并等待最终值。 |
| `thread.output` |等待最终输出。 |
| `thread.tool_calls`（JavaScript 中的`thread.toolCalls`）|使用组装的输入、流式输出和结果观察工具调用。 |
| `thread.subgraphs` |发现并观察嵌套图执行。 |
| `thread.subagents` | `thread.subgraphs` 面向子代理的视图。使用 Deep Agents 子代理调用时使用此名称。 |
| `thread.interrupts` |检查人机交互中断负载。 |
| `thread.interrupted` |检查运行是否因人工输入而暂停。 |
| `thread.extensions` |使用在 `custom:<name>` 频道上发布的自定义流转换器投影。 |

多个消费者可以同时读取这些预测。读取`thread.messages`不会消耗`thread.values`、`thread.toolCalls`、`thread.subgraphs`或`thread.output`所需的事件。

## 流消息

使用`thread.messages`进行聊天模型输出：

<Tabs>
    <Tab title="Python">
    ```python
    async with client.threads.stream(assistant_id="agent") as thread:
        await thread.run.start(input=input)

        async for message in thread.messages:
            text = await message.text
            usage = (await message.output).usage_metadata

            print(text)
            print(usage)
    ```
    </Tab>
    <Tab title="JavaScript">
    ```javascript
    const thread = client.threads.stream({ assistantId: "agent" });

    await thread.run.start({ input });

    for await (const message of thread.messages) {
      const text = await message.text;
      const usage = (await message.output).usage_metadata;

      console.log(text);
      console.log(usage);
    }
    ```
    </Tab>
    <Tab title="cURL">
    打开`messages`频道的订阅：

    ```bash
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/stream/events \
      --header 'Content-Type: application/json' \
      --header 'x-api-key: <API_KEY>' \
      --data '{"channels": ["messages"]}'
    ```在`/commands`上发送`run.start`，如[Quickstart](#quickstart)所示。在 `params.data.event`（`message-start`、`content-block-start`、`content-block-delta`、`content-block-finish`、`message-finish`）上调度每个事件，以重新组装每条消息及其内容块。
    </Tab>
</Tabs>

`message.text` 既是一个异步可迭代对象，又是一个可等待对象。迭代它以获得逐个标记的输出，或等待它以获得完整的文本。 `message.reasoning` 公开推理增量，`message.tool_calls`（JavaScript 中的`message.toolCalls`）公开工具调用参数块。等待`message.output`最终确定的消息，包括它的`usage_metadata`。要按精确的到达顺序使用文本、推理和工具调用块，请迭代原始事件流而不是单独的每个投影。

## 流状态

在每个步骤之后使用 `thread.values` 流式传输完整状态快照：

<Tabs>
    <Tab title="Python">
    ```python
    async with client.threads.stream(assistant_id="agent") as thread:
        await thread.run.start(input=input)

        async for snapshot in thread.values:
            print(snapshot)

        final_state = await thread.output
    ```
    </Tab>
    <Tab title="JavaScript">
    ```javascript
    const thread = client.threads.stream({ assistantId: "agent" });

    await thread.run.start({ input });

    for await (const snapshot of thread.values) {
      console.log(snapshot);
    }

    const finalState = await thread.output;
    ```
    </Tab>
    <Tab title="cURL">
    打开`values`频道的订阅：

    ```bash
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/stream/events \
      --header 'Content-Type: application/json' \
      --header 'x-api-key: <API_KEY>' \
      --data '{"channels": ["values"]}'
    ```

    在`/commands`上发送`run.start`，如[Quickstart](#quickstart)所示。每个事件的`params.data`都是完整的状态快照。
    </Tab>
</Tabs>

`thread.values`也值得期待。等待`thread.values`解析为最终状态，相当于`await thread.output`。

## 流工具调用`thread.tool_calls`（JavaScript 中的`thread.toolCalls`）公开组装的工具调用。每个句柄都带有工具名称 (`call.name`) 和组装的输入（`call.input`，一个普通值 - 不等待）。调用完成后，等待 `call.output` 获取工具结果：

<Tabs>
    <Tab title="Python">
    ```python
    async for call in thread.tool_calls:
        print(call.name, call.input)
        print(await call.output)

        if call.error is not None:
            print(call.error)
    ```
    </Tab>
    <Tab title="JavaScript">
    ```javascript
    for await (const call of thread.toolCalls) {
      console.log(call.name, call.input);
      console.log(await call.output);
    }
    ```
    </Tab>
    <Tab title="cURL">
    打开`tools`频道的订阅：

    ```bash
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/stream/events \
      --header 'Content-Type: application/json' \
      --header 'x-api-key: <API_KEY>' \
      --data '{"channels": ["tools"]}'
    ```

    在`/commands`上发送`run.start`，如[Quickstart](#quickstart)所示。 `params.data.event`（`tool-started`、`tool-output-delta`、`tool-finished`、`tool-error`）发货；通过工具调用 ID 将工具调用 ID 与`messages` 通道上相应的工具调用内容块关联起来。
    </Tab>
</Tabs>

在 Python 中，`call.deltas` 是对工具输出流式传输的异步迭代器，而 `call.error` 在工具引发时保留异常。工具事件通过工具调用 ID 与`thread.messages` 上相应的工具调用内容块相关联。

## 流子图

使用 `thread.subgraphs` 观察嵌套图工作而不解析名称空间字符串：

<Tabs>
    <Tab title="Python">
    ```python
    async for subgraph in thread.subgraphs:
        print(subgraph.graph_name, subgraph.path)

        async for message in subgraph.messages:
            print(await message.text)
    ```
    </Tab>
    <Tab title="JavaScript">
    ```javascript
    for await (const subgraph of thread.subgraphs) {
      console.log(subgraph.name, subgraph.namespace);

      for await (const message of subgraph.messages) {
        console.log(await message.text);
      }
    }
    ```
    </Tab>
    <Tab title="cURL">
    子图活动由每个事件的 `params.namespace` 路径传达。打开范围为 `lifecycle` 通道的订阅（以及您想要在子图中观察的任何通道）：

    ```bash
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/stream/events \
      --header 'Content-Type: application/json' \
      --header 'x-api-key: <API_KEY>' \
      --data '{"channels": ["lifecycle", "messages", "tools"]}'
    ```在`/commands`上发送`run.start`，如[Quickstart](#quickstart)所示。使用 `graph_name` 观察 `lifecycle` 通道中的 `started` 事件以发现新的子图，然后将后续事件过滤到该名称空间前缀以观察每个子图的工作。
    </Tab>
</Tabs>

每个子图句柄都会公开图名称（Python 中的`subgraph.graph_name`，JavaScript 中的`subgraph.name`）及其命名空间路径（Python 中的`subgraph.path`，JavaScript 中的`subgraph.namespace`），以及每个子图的`messages`、`tool_calls` 和嵌套的`subgraphs` 投影。

对于 [Deep Agents](/oss/python/deepagents/event-streaming) 部署，更喜欢使用 `thread.subagents` 进行子代理调用 - 它公开子代理名称以及每个子代理消息和工具调用投影。

## 流输出

运行完成后，等待 `thread.output` 查看最终状态：

<Tabs>
    <Tab title="Python">
    ```python
    await thread.run.start(input=input)

    final_state = await thread.output
    ```
    </Tab>
    <Tab title="JavaScript">
    ```javascript
    await thread.run.start({ input });

    const finalState = await thread.output;
    ```
    </Tab>
    <Tab title="cURL">
    打开`values`和`lifecycle`的订阅：

    ```bash
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/stream/events \
      --header 'Content-Type: application/json' \
      --header 'x-api-key: <API_KEY>' \
      --data '{"channels": ["values", "lifecycle"]}'
    ```

    在`/commands`上发送`run.start`，如[Quickstart](#quickstart)所示。阅读直到观察到带有 `params.data.event == "completed"` 的根命名空间 `lifecycle` 事件；最后一个前面的`values`事件携带最终状态。
    </Tab>
</Tabs>

`thread.output` 与 `thread.values` 共享其订阅，因此当另一个也在读取时，等待一个不需要额外的往返。

## 流式传输多个投影当应用程序代码一次需要多个投影时，运行并发使用者：

<Tabs>
    <Tab title="Python">
    ```python
    import asyncio


    async def consume_messages():
        async for message in thread.messages:
            print(await message.text)


    async def consume_tool_calls():
        async for call in thread.tool_calls:
            print(call.name, await call.output)


    async def consume_subgraphs():
        async for subgraph in thread.subgraphs:
            print(subgraph.graph_name, subgraph.path)


    await asyncio.gather(consume_messages(), consume_tool_calls(), consume_subgraphs())
    ```
    </Tab>
    <Tab title="JavaScript">
    ```javascript
    await Promise.all([
      (async () => {
        for await (const message of thread.messages) {
          console.log(await message.text);
        }
      })(),
      (async () => {
        for await (const call of thread.toolCalls) {
          console.log(call.name, await call.output);
        }
      })(),
      (async () => {
        for await (const subgraph of thread.subgraphs) {
          console.log(subgraph.name, subgraph.namespace);
        }
      })(),
    ]);
    ```
    </Tab>
    <Tab title="cURL">
    打开一个涵盖您想要使用的每个频道的订阅：

    ```bash
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/stream/events \
      --header 'Content-Type: application/json' \
      --header 'x-api-key: <API_KEY>' \
      --data '{"channels": ["messages", "tools", "lifecycle"]}'
    ```

    在`/commands`上发送`run.start`，如[Quickstart](#quickstart)所示。单个 SSE 订阅可提供正文中列出的每个频道。在`method`上派送，以满足独立消费者的需求； SDK 的并发投影在客户端执行相同的多路分解。
    </Tab>
</Tabs>

每个投影都会针对同一线程打开一个过滤订阅，因此并发读取不会增加服务器负载超出实际消耗的通道。

## 中断后恢复

当图表因人工输入而暂停时，检查 `thread.interrupted` 和 `thread.interrupts`，然后通过响应中断来恢复：

<Tabs>
    <Tab title="Python">
    ```python
    async with client.threads.stream(assistant_id="agent") as thread:
        await thread.run.start(input=input)

        async for message in thread.messages:
            print(await message.text)

        if thread.interrupted:
            for interrupt in thread.interrupts:
                await thread.run.respond(
                    {"decisions": [{"type": "approve"}]},
                    interrupt_id=interrupt["interrupt_id"],
                )

        final_state = await thread.output
    ```
    </Tab>
    <Tab title="JavaScript">
    ```javascript
    const thread = client.threads.stream({ assistantId: "agent" });

    await thread.run.start({ input });

    for await (const message of thread.messages) {
      console.log(await message.text);
    }

    if (thread.interrupted) {
      for (const interrupt of thread.interrupts) {
        await thread.input.respond({
          namespace: interrupt.namespace,
          interrupt_id: interrupt.interruptId,
          response: { decisions: [{ type: "approve" }] },
        });
      }
    }

    const finalState = await thread.output;
    ```
    </Tab>
    <Tab title="cURL">
    将中断响应作为 `input.respond` 命令发送：

    ```bash
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/commands \
      --header 'Content-Type: application/json' \
      --header 'x-api-key: <API_KEY>' \
      --data '{
        "id": 2,
        "method": "input.respond",
        "params": {
          "namespace": <INTERRUPT_NAMESPACE>,
          "interrupt_id": "<INTERRUPT_ID>",
          "response": {"decisions": [{"type": "approve"}]}
        }
      }'
    ````namespace` 是中断的命名空间数组（`[]` 表示根图）；省略它默认为根。保持原始 SSE 连接打开 - 命令到达后，部署继续在同一线程上发出事件。
    </Tab>
</Tabs>

## 加入主动跑步

要附加到线程上已在运行的运行（在页面重新加载后、在单独的工作线程中或从另一个客户端中），请使用现有的 `thread_id` 打开线程流并跳过 `thread.run.start()`。连接打开时，部署会重播缓冲的事件，因此使用者从头开始重建运行状态，而不会丢失任何输出。

<Tabs>
    <Tab title="Python">
    ```python
    from langgraph_sdk import get_client

    client = get_client(url=DEPLOYMENT_URL, api_key=API_KEY)

    async with client.threads.stream(
        thread_id=thread_id,
        assistant_id="agent",
    ) as thread:
        async for message in thread.messages:
            print(await message.text)

        final_state = await thread.output
    ```
    </Tab>
    <Tab title="JavaScript">
    ```javascript
    import { Client } from "@langchain/langgraph-sdk";

    const client = new Client({ apiUrl: DEPLOYMENT_URL, apiKey: API_KEY });

    const thread = client.threads.stream(threadId, { assistantId: "agent" });

    for await (const message of thread.messages) {
      console.log(await message.text);
    }

    const finalState = await thread.output;
    ```
    </Tab>
    <Tab title="cURL">
    打开事件流而不发送 `run.start` 命令来附加为被动观察者：

    ```bash
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/stream/events \
      --header 'Content-Type: application/json' \
      --header 'x-api-key: <API_KEY>' \
      --data '{"channels": ["values", "updates", "messages", "tools", "lifecycle", "input", "checkpoints", "tasks", "custom"]}'
    ```

    当订阅打开时，服务器会从运行开始时重播缓冲的事件。
    </Tab>
</Tabs>

## 流式传输所有协议事件

当应用程序代码需要每个事件时，请阅读原始协议事件流。在Python中，迭代`thread.events`；在 JavaScript 中，打开一个 `subscribe` （JavaScript 流对象本身不可迭代）：

<Tabs>
    <Tab title="Python">
    ```python
    async with client.threads.stream(assistant_id="agent") as thread:
        await thread.run.start(input=input)

        async for event in thread.events:
            print(event["method"], event["params"]["namespace"], event["params"]["data"])
    ```要缩小到特定频道，请在线程上打开 `subscribe`：

    ```python
    async for event in thread.subscribe(["messages", "tools"]):
        ...
    ```
    </Tab>
    <Tab title="JavaScript">
    ```javascript
    const thread = client.threads.stream({ assistantId: "agent" });

    const events = await thread.subscribe({
      channels: ["messages", "tools", "values", "lifecycle"],
    });

    await thread.run.start({ input });

    for await (const event of events) {
      console.log(event.method, event.params.namespace, event.params.data);
    }
    ```

    `thread.subscribe(...)` 返回一个 `Promise`，因此在迭代之前先返回 `await`。传递通道名称数组来缩小订阅范围：

    ```javascript
    const sub = await thread.subscribe(["messages", "tools"]);
    for await (const event of sub) {
      // ...
    }
    ```
    </Tab>
    <Tab title="cURL">
    打开覆盖每个频道的订阅，然后在`/commands`上发送`run.start`，如[Quickstart](#quickstart)所示：

    ```bash
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/stream/events \
      --header 'Content-Type: application/json' \
      --header 'x-api-key: <API_KEY>' \
      --data '{"channels": ["values", "updates", "messages", "tools", "lifecycle", "input", "checkpoints", "tasks", "custom"]}'
    ```

    响应是 SSE 帧流。每个帧都有一个 `event:` 行（通道、镜像 `method`）、一个 `id:` 行（每个会话 `seq`）和一个 `data:` 行（JSON `ProtocolEvent`）。持久的 `event_id` 位于 JSON 主体内部，而不是在 `id:` 行上。

    ```text
    event: lifecycle
    id: 1
    data: {"type":"event","seq":1,"method":"lifecycle","params":{"namespace":[],"timestamp":1736...,"data":{"event":"started"}},"event_id":"01HZ..."}

    event: messages
    id: 2
    data: {"type":"event","seq":2,"method":"messages","params":{"namespace":[],"timestamp":1736...,"data":{"event":"message-start","message":{...}}},"event_id":"01HZ..."}
    ```
    </Tab>
</Tabs>

每个事件都是一个 `ProtocolEvent` 信封，包装特定于通道的有效负载：

<Tabs>
    <Tab title="Python">
    ```python
    from typing import Any, NotRequired, TypedDict


    class ProtocolEventParams(TypedDict):
        namespace: list[str]   # path of "<name>:<runtime_id>" segments; [] is the root
        timestamp: int         # wall-clock milliseconds; can drift, do not rely on for ordering
        data: Any              # channel-specific payload


    class ProtocolEvent(TypedDict):
        type: str              # always "event"
        seq: int               # increasing within a session; carried on the SSE `id:` line; use for ordering
        method: str            # channel name: "messages", "values", "tools", "lifecycle", "custom", ...
        params: ProtocolEventParams
        event_id: NotRequired[str]   # durable cross-session dedup ID, carried in the JSON body
    ```
    </Tab>
    <Tab title="JavaScript">
    ```typescript
    interface ProtocolEvent {
      readonly type: "event";
      readonly seq: number;          // increasing within a session; carried on the SSE `id:` line; use for ordering
      readonly method: string;       // channel name: "messages", "values", "tools", "lifecycle", "custom", ...
      readonly params: {
        readonly namespace: string[];   // path of "<name>:<runtime_id>" segments; [] is the root
        readonly timestamp: number;     // wall-clock milliseconds; can drift, do not rely on for ordering
        readonly data: unknown;         // channel-specific payload
      };
      readonly event_id?: string;    // durable cross-session dedup ID, carried in the JSON body
    }
    ```
    </Tab>
    <Tab title="cURL">
    原始SSE框架：

    ```text
    event: messages
    id: 42
    data: {"type":"event","seq":42,"method":"messages","params":{"namespace":["researcher:6f4d"],"timestamp":1736283600123,"data":{"event":"content-block-delta","index":0,"delta":{"type":"text","text":"Hello"}}},"event_id":"01HZQ8XK5N6F9M2A3B4C5D6E7F"}
    ````id:`线路承载每个会话`seq`；持久的`event_id`存在于JSON主体中，是客户端用于重复数据删除的关键。有线协议不使用 `Last-Event-ID` 标头进行恢复 — 相反，客户端在请求正文中传递 `since` seq 游标。代理服务器将每次运行的事件缓冲在有界缓冲区中，并在新的订阅上重播它们，并且 SDK 通过 `event_id` 客户端进行重复数据删除。
    </Tab>
</Tabs>

`namespace` 是从根图到发出事件的作用域的路径。根是空数组。每个子执行都会添加一个 `"name:runtime_id"` 段，因此子图中的嵌套工具调用看起来像 `["researcher:6f4d", "tools:91ac"]`。当只有特定子树重要时，直接按命名空间过滤原始事件； `thread.subgraphs` 已经对嵌套图执行执行了此操作。

## 通道和事件生命周期

原始事件在通道上流动。频道名称显示为事件的`method`；每个通道都会发出特定的事件形状。|频道|目的|
| -------- | -------- |
| `values` |完整的图状态快照。 |
| `updates` |每个节点的状态增量。 |
| `messages` |以内容块为中心的聊天模型输出。 |
| `tools` |工具调用开始、流式输出、完成和错误事件。 |
| `lifecycle` |运行、子图和子代理状态更改。 |
| `checkpoints` |用于分支和时间旅行的轻量级检查点信封。 |
| `input` |人机交互输入请求和响应。 |
| `tasks` | Pregel 任务创建和结果事件。 |
| `custom` |来自图形代码的用户定义的有效负载。 |
| `custom:<name>` |应用程序定义的流转换器输出。 |

类型化投影（`thread.messages`、`thread.values`、`thread.toolCalls` 等）是根据这些通道构建的。直接迭代流对象时，通道名称显示为原始事件上的 `method` 字段。

### 消息

`messages` 通道模型输出为内容块。 `data.event`字段是`message-start`、`content-block-start`、`content-block-delta`、`content-block-finish`、`message-finish`或`error`之一。内容块具有明确的边界：一个块开始，发出零个或多个增量，并在同一消息中的下一个块开始之前完成。 `message-finish` 可能包括代币使用；不可恢复的模型调用失败作为消息错误事件到达。

＃＃＃ 工具`tools` 通道公开工具执行。 `data.event`字段是`tool-started`、`tool-output-delta`、`tool-finished`、`tool-error`之一。工具事件通过工具调用 ID 关联，因此工具执行可以连接回到 `messages` 通道上的原始工具调用内容块。

### 生命周期

`lifecycle` 通道跟踪根运行、子图和子代理状态。 `data.event`字段是`started`、`running`、`completed`、`failed`、`interrupted`之一。根运行解析为终端 `completed`、`failed` 或 `interrupted`；子范围也可能报告`running`。生命周期数据可能包括可选的`graph_name`、`error`和`cause`，描述子作用域启动的原因（父工具调用、扇出发送、边缘转换）。

## 从上次活动继续

事件流是可恢复的。代理服务器在有界缓冲区中缓冲每次运行的事件，为每个事件分配一个`seq`（每个会话排序）和一个持久的`event_id`（在重播和副本中稳定），并在重新连接时从游标重播。 SDK 自动处理瞬时丢弃：每个打开的订阅都会跟踪其观察到的最高值 `seq`，重新连接时，SDK 会从该游标重播并按 `event_id` 删除重复事件。要跨进程边界恢复（页面重新加载、工作人员切换或单独的客户端），请使用相同的 `thread_id` 重新打开线程。当新的订阅打开时，服务器会重播缓冲的事件，并且 SDK 将它们解复用为相同类型的投影。由于每次运行的缓冲区是有限的，因此很长的运行中最早的事件可能已被逐出。

<Tabs>
    <Tab title="Python">
    ```python
    async with client.threads.stream(
        thread_id=thread_id,
        assistant_id="agent",
    ) as thread:
        async for event in thread.events:
            print(event["method"], event.get("event_id"))
    ```
    </Tab>
    <Tab title="JavaScript">
    ```javascript
    const thread = client.threads.stream(threadId, { assistantId: "agent" });

    const events = await thread.subscribe({
      channels: ["values", "updates", "messages", "tools", "lifecycle", "input", "checkpoints", "tasks", "custom"],
    });

    for await (const event of events) {
      console.log(event.method, event.event_id);
    }
    ```
    </Tab>
    <Tab title="cURL">
    重新打开订阅以接收重播事件：

    ```bash
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/stream/events \
      --header 'Content-Type: application/json' \
      --header 'x-api-key: <API_KEY>' \
      --data '{"channels": ["values", "updates", "messages", "tools", "lifecycle", "input", "checkpoints", "tasks", "custom"]}'
    ```

    在线路级别，请求正文中的 `since` seq 游标仅返回该点之后的事件。 SDK 在重新连接时自动管理此游标，因此 `client.threads.stream(...)` 不会将 `since` 公开为参数。
    </Tab>
</Tabs>

## 相关

- [Streaming API](/langsmith/streaming) — 基于 `stream_mode` 的流 API。也得到`langgraph-api>=0.10.0`的支持。
- [LangGraph event streaming](/oss/python/langgraph/event-streaming) — 相同的概念适用于进程内 LangGraph 应用程序。
- [LangChain agent event streaming](/oss/python/langchain/event-streaming) — 以代理为中心的消息、工具调用和中间件更新的投影。
- [Deep Agents event streaming](/oss/python/deepagents/event-streaming) — 子代理流、嵌套消息和子代理工具调用。
- [LangSmith Deployment API](/langsmith/server-api-ref) — `POST /threads/{thread_id}/stream/events` 和相关端点的线路级参考。线路级事件和命令格式在 [Agent Protocol](https://github.com/langchain-ai/agent-protocol) 存储库中定义。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/event-streaming.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>