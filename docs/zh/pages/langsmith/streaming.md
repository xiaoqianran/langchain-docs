<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Streaming API | https://docs.langchain.com/langsmith/streaming -->

# 流媒体 API

[LangGraph SDK](/langsmith/langgraph-python-sdk) 允许您以多种模式流式传输 [LangSmith Deployment API](/langsmith/server-api-ref) 的输出，从每个步骤后的完整状态快照到逐个令牌的 LLM 输出。线程流还支持可恢复性：如果连接断开，则使用最后一个事件 ID 重新连接以从中断的位置继续。

<Note>
  LangGraph SDK 和 Agent Server 是[LangSmith](/langsmith/observability)的一部分。
</Note>

## 基本用法

基本使用示例：

<Tabs>
  <Tab title="Python">
    ```python {highlight={12}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langgraph_sdk import get_client
    client = get_client(url=<DEPLOYMENT_URL>, api_key=<API_KEY>)

    # Using the graph deployed with the name "agent"
    assistant_id = "agent"

    # create a thread
    thread = await client.threads.create()
    thread_id = thread["thread_id"]

    # create a streaming run
    async for chunk in client.runs.stream(
        thread_id,
        assistant_id,
        input=inputs,
        stream_mode="updates"
    ):
        print(chunk.data)
    ```
  </Tab>

  <Tab title="JavaScript">
    ```javascript {highlight={12}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { Client } from "@langchain/langgraph-sdk";
    const client = new Client({ apiUrl: <DEPLOYMENT_URL>, apiKey: <API_KEY> });

    // Using the graph deployed with the name "agent"
    const assistantID = "agent";

    // create a thread
    const thread = await client.threads.create();
    const threadID = thread["thread_id"];

    // create a streaming run
    const streamResponse = client.runs.stream(
      threadID,
      assistantID,
      {
        input,
        streamMode: "updates"
      }
    );
    for await (const chunk of streamResponse) {
      console.log(chunk.data);
    }
    ```
  </Tab>

  <Tab title="cURL">
    创建一个线程：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads \
    --header 'Content-Type: application/json' \
    --data '{}'
    ```

    创建流式运行：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/stream \
    --header 'Content-Type: application/json' \
    --header 'x-api-key: <API_KEY>'
    --data "{
      \"assistant_id\": \"agent\",
      \"input\": <inputs>,
      \"stream_mode\": \"updates\"
    }"
    ```
  </Tab>
</Tabs>

<Accordion title="Extended example: streaming updates">
  这是您可以在代理服务器中运行的示例图。
  更多详情请参见[LangSmith quickstart](/langsmith/deployment-quickstart)。

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # graph.py
  from typing import TypedDict
  from langgraph.graph import StateGraph, START, END

  class State(TypedDict):
      topic: str
      joke: str

  def refine_topic(state: State):
      return {"topic": state["topic"] + " and cats"}

  def generate_joke(state: State):
      return {"joke": f"This is a joke about {state['topic']}"}

  graph = (
      StateGraph(State)
      .add_node(refine_topic)
      .add_node(generate_joke)
      .add_edge(START, "refine_topic")
      .add_edge("refine_topic", "generate_joke")
      .add_edge("generate_joke", END)
      .compile()
  )
  ```

  一旦您拥有正在运行的代理服务器，您就可以使用以下命令与其进行交互
  [LangGraph SDK](/langsmith/langgraph-python-sdk)

  <Tabs>
    <Tab title="Python">
      ```python {highlight={12,16}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from langgraph_sdk import get_client
      client = get_client(url=<DEPLOYMENT_URL>)

      # Using the graph deployed with the name "agent"
      assistant_id = "agent"

      # create a thread
      thread = await client.threads.create()
      thread_id = thread["thread_id"]

      # create a streaming run
      async for chunk in client.runs.stream(  # (1)!
          thread_id,
          assistant_id,
          input={"topic": "ice cream"},
          stream_mode="updates"  # (2)!
      ):
          print(chunk.data)
      ```

      1. `client.runs.stream()` 方法返回一个产生流式输出的迭代器。
         2\.设置 `stream_mode="updates"` 仅将更新传输到每个节点之后的图状态。还可以使用其他流模式。详情请参阅[supported stream modes](#supported-stream-modes)。
    </Tab>

    <Tab title="JavaScript">
      ```javascript {highlight={12,17}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { Client } from "@langchain/langgraph-sdk";
      const client = new Client({ apiUrl: <DEPLOYMENT_URL> });

      // Using the graph deployed with the name "agent"
      const assistantID = "agent";

      // create a thread
      const thread = await client.threads.create();
      const threadID = thread["thread_id"];

      // create a streaming run
      const streamResponse = client.runs.stream(  // (1)!
        threadID,
        assistantID,
        {
          input: { topic: "ice cream" },
          streamMode: "updates"  // (2)!
        }
      );
      for await (const chunk of streamResponse) {
        console.log(chunk.data);
      }
      ```1. `client.runs.stream()` 方法返回一个产生流式输出的迭代器。
      2. 设置 `streamMode: "updates"` 仅将更新传输到每个节点之后的图状态。还可以使用其他流模式。详情请参阅[supported stream modes](#supported-stream-modes)。
    </Tab>

    <Tab title="cURL">
      创建一个线程：

      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl --request POST \
      --url <DEPLOYMENT_URL>/threads \
      --header 'Content-Type: application/json' \
      --data '{}'
      ```

      创建流式运行：

      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/stream \
      --header 'Content-Type: application/json' \
      --data "{
        \"assistant_id\": \"agent\",
        \"input\": {\"topic\": \"ice cream\"},
        \"stream_mode\": \"updates\"
      }"
      ```
    </Tab>
  </Tabs>

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  {'run_id': '1f02c2b3-3cef-68de-b720-eec2a4a8e920', 'attempt': 1}
  {'refine_topic': {'topic': 'ice cream and cats'}}
  {'generate_joke': {'joke': 'This is a joke about ice cream and cats'}}
  ```
</Accordion>

### 支持的流模式

|模式|描述 | LangGraph 库方法 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- || [⟦T61⟧](#stream-graph-state) |在每个[super-step](/langsmith/graph-rebuild#define-graphs)之后流式传输完整的图状态。                                                                                        | `.stream()` / `.astream()` 与 [⟦T64⟧](/oss/python/langgraph/streaming#graph-state) |
| [⟦T65⟧](#stream-graph-state) |在图表的每个步骤之后将更新流式传输到状态。如果在同一步骤中进行多个更新（例如，运行多个节点），则这些更新将单独流式传输。 | `.stream()` / `.astream()` 与 [⟦T68⟧](/oss/python/langgraph/streaming#graph-state) |
| [⟦T69⟧](#messages) |流式传输调用 LLM 的图形节点的 LLM 令牌和元数据（对于聊天应用程序有用）。                                                                                 | `.stream()` / `.astream()` 与 [⟦T72⟧](/oss/python/langgraph/streaming#messages) |
| [⟦T73⟧](#debug) |在整个图表的执行过程中流式传输尽可能多的信息。                                                                                                      | `.stream()` / `.astream()` 与 [⟦T76⟧](/oss/python/langgraph/streaming#graph-state) |
| [⟦T77⟧](#stream-custom-data) |从图表内部传输自定义数据 | `.stream()` / `.astream()` 与 [⟦T80⟧](/oss/python/langgraph/streaming#custom-data) || [⟦T81⟧](#stream-events) |流式传输所有事件（包括图的状态）；在迁移大型 LCEL 应用程序时主要有用。                                                                                 | `.astream_events()` |

### 流式传输多种模式

您可以将列表作为 `stream_mode` 参数传递，以同时传输多种模式。

流式输出将是 `(mode, chunk)` 的元组，其中 `mode` 是流模式的名称，`chunk` 是该模式流式传输的数据。

<Tabs>
  <Tab title="Python">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    async for chunk in client.runs.stream(
        thread_id,
        assistant_id,
        input=inputs,
        stream_mode=["updates", "custom"]
    ):
        print(chunk)
    ```
  </Tab>

  <Tab title="JavaScript">
    ```js theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const streamResponse = client.runs.stream(
      threadID,
      assistantID,
      {
        input,
        streamMode: ["updates", "custom"]
      }
    );
    for await (const chunk of streamResponse) {
      console.log(chunk);
    }
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
     --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/stream \
     --header 'Content-Type: application/json' \
     --data "{
       \"assistant_id\": \"agent\",
       \"input\": <inputs>,
       \"stream_mode\": [
         \"updates\"
         \"custom\"
       ]
     }"
    ```
  </Tab>
</Tabs>

## 流图状态

使用流模式 `updates` 和 `values` 在图执行时流式传输图的状态。

* `updates` 将**更新**流式传输到图的每个步骤之后的状态。
* `values` 在图表的每个步骤之后流式传输状态的**完整值**。

<Accordion title="Example graph">
  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from typing import TypedDict
  from langgraph.graph import StateGraph, START, END

  class State(TypedDict):
    topic: str
    joke: str

  def refine_topic(state: State):
      return {"topic": state["topic"] + " and cats"}

  def generate_joke(state: State):
      return {"joke": f"This is a joke about {state['topic']}"}

  graph = (
    StateGraph(State)
    .add_node(refine_topic)
    .add_node(generate_joke)
    .add_edge(START, "refine_topic")
    .add_edge("refine_topic", "generate_joke")
    .add_edge("generate_joke", END)
    .compile()
  )
  ```
</Accordion>

<Note>
  **有状态运行**
  下面的示例假设您希望在 [checkpointer](/oss/python/langgraph/persistence) DB 中**保留流运行的输出**并创建了一个线程。创建线程：

  <Tabs>
    <Tab title="Python">
      ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from langgraph_sdk import get_client
      client = get_client(url=<DEPLOYMENT_URL>)

      # Using the graph deployed with the name "agent"
      assistant_id = "agent"
      # create a thread
      thread = await client.threads.create()
      thread_id = thread["thread_id"]
      ```
    </Tab>

    <Tab title="JavaScript">
      ```js theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { Client } from "@langchain/langgraph-sdk";
      const client = new Client({ apiUrl: <DEPLOYMENT_URL> });

      // Using the graph deployed with the name "agent"
      const assistantID = "agent";
      // create a thread
      const thread = await client.threads.create();
      const threadID = thread["thread_id"]
      ```
    </Tab><Tab title="cURL">
      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl --request POST \
      --url <DEPLOYMENT_URL>/threads \
      --header 'Content-Type: application/json' \
      --data '{}'
      ```
    </Tab>
  </Tabs>

  如果您不需要保留运行的输出，则可以在流式传输时传递 `None` 而不是 `thread_id`。
</Note>

### 直播模式：`updates`

使用它仅流式传输每个步骤后节点返回的**状态更新**。流式输出包括节点的名称以及更新。

<Tabs>
  <Tab title="Python">
    ```python {highlight={5}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    async for chunk in client.runs.stream(
        thread_id,
        assistant_id,
        input={"topic": "ice cream"},
        stream_mode="updates"
    ):
        print(chunk.data)
    ```
  </Tab>

  <Tab title="JavaScript">
    ```javascript {highlight={6}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const streamResponse = client.runs.stream(
      threadID,
      assistantID,
      {
        input: { topic: "ice cream" },
        streamMode: "updates"
      }
    );
    for await (const chunk of streamResponse) {
      console.log(chunk.data);
    }
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/stream \
    --header 'Content-Type: application/json' \
    --data "{
      \"assistant_id\": \"agent\",
      \"input\": {\"topic\": \"ice cream\"},
      \"stream_mode\": \"updates\"
    }"
    ```
  </Tab>
</Tabs>

### 流模式：`values`

使用它可以在每个步骤之后流式传输图表的**完整状态**。

<Tabs>
  <Tab title="Python">
    ```python {highlight={5}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    async for chunk in client.runs.stream(
        thread_id,
        assistant_id,
        input={"topic": "ice cream"},
        stream_mode="values"
    ):
        print(chunk.data)
    ```
  </Tab>

  <Tab title="JavaScript">
    ```javascript {highlight={6}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const streamResponse = client.runs.stream(
      threadID,
      assistantID,
      {
        input: { topic: "ice cream" },
        streamMode: "values"
      }
    );
    for await (const chunk of streamResponse) {
      console.log(chunk.data);
    }
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/stream \
    --header 'Content-Type: application/json' \
    --data "{
      \"assistant_id\": \"agent\",
      \"input\": {\"topic\": \"ice cream\"},
      \"stream_mode\": \"values\"
    }"
    ```
  </Tab>
</Tabs>

## 子图

要将 [subgraphs](/oss/python/langgraph/use-subgraphs) 的输出包含在流式输出中，您可以在父图的 `.stream()` 方法中设置 `subgraphs=True`。这将从父图和任何子图流输出。

```python {highlight={5}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
async for chunk in client.runs.stream(
    thread_id,
    assistant_id,
    input={"foo": "foo"},
    stream_subgraphs=True, # (1)!
    stream_mode="updates",
):
    print(chunk)
```

1. 设置 `stream_subgraphs=True` 以流式传输子图的输出。

<Accordion title="Extended example: streaming from subgraphs">
  这是您可以在代理服务器中运行的示例图。
  更多详情请参阅[LangSmith quickstart](/langsmith/deployment-quickstart)。

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # graph.py
  from langgraph.graph import START, StateGraph
  from typing import TypedDict

  # Define subgraph
  class SubgraphState(TypedDict):
      foo: str  # note that this key is shared with the parent graph state
      bar: str

  def subgraph_node_1(state: SubgraphState):
      return {"bar": "bar"}

  def subgraph_node_2(state: SubgraphState):
      return {"foo": state["foo"] + state["bar"]}

  subgraph_builder = StateGraph(SubgraphState)
  subgraph_builder.add_node(subgraph_node_1)
  subgraph_builder.add_node(subgraph_node_2)
  subgraph_builder.add_edge(START, "subgraph_node_1")
  subgraph_builder.add_edge("subgraph_node_1", "subgraph_node_2")
  subgraph = subgraph_builder.compile()

  # Define parent graph
  class ParentState(TypedDict):
      foo: str

  def node_1(state: ParentState):
      return {"foo": "hi! " + state["foo"]}

  builder = StateGraph(ParentState)
  builder.add_node("node_1", node_1)
  builder.add_node("node_2", subgraph)
  builder.add_edge(START, "node_1")
  builder.add_edge("node_1", "node_2")
  graph = builder.compile()
  ```

  一旦您拥有正在运行的代理服务器，您就可以使用以下命令与其进行交互
  [LangGraph SDK](/langsmith/langgraph-python-sdk)

  <Tabs>
    <Tab title="Python">
      ```python {highlight={15}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from langgraph_sdk import get_client
      client = get_client(url=<DEPLOYMENT_URL>)

      # Using the graph deployed with the name "agent"
      assistant_id = "agent"

      # create a thread
      thread = await client.threads.create()
      thread_id = thread["thread_id"]

      async for chunk in client.runs.stream(
          thread_id,
          assistant_id,
          input={"foo": "foo"},
          stream_subgraphs=True, # (1)!
          stream_mode="updates",
      ):
          print(chunk)
      ```

      1. 设置 `stream_subgraphs=True` 以流式传输子图的输出。
    </Tab><Tab title="JavaScript">
      ```javascript {highlight={17}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { Client } from "@langchain/langgraph-sdk";
      const client = new Client({ apiUrl: <DEPLOYMENT_URL> });

      // Using the graph deployed with the name "agent"
      const assistantID = "agent";

      // create a thread
      const thread = await client.threads.create();
      const threadID = thread["thread_id"];

      // create a streaming run
      const streamResponse = client.runs.stream(
        threadID,
        assistantID,
        {
          input: { foo: "foo" },
          streamSubgraphs: true,  // (1)!
          streamMode: "updates"
        }
      );
      for await (const chunk of streamResponse) {
        console.log(chunk);
      }
      ```

      1. 设置 `streamSubgraphs: true` 以流式传输子图的输出。
    </Tab>

    <Tab title="cURL">
      创建一个线程：

      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl --request POST \
      --url <DEPLOYMENT_URL>/threads \
      --header 'Content-Type: application/json' \
      --data '{}'
      ```

      创建流式运行：

      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/stream \
      --header 'Content-Type: application/json' \
      --data "{
        \"assistant_id\": \"agent\",
        \"input\": {\"foo\": \"foo\"},
        \"stream_subgraphs\": true,
        \"stream_mode\": [
          \"updates\"
        ]
      }"
      ```
    </Tab>
  </Tabs>

  **注意**，我们不仅接收节点更新，还接收命名空间，它告诉我们从哪个图（或子图）进行流式传输。
</Accordion>

<a />

## 调试

使用 `debug` 流模式在整个图表执行过程中流式传输尽可能多的信息。流式输出包括节点的名称以及完整状态。

<Tabs>
  <Tab title="Python">
    ```python {highlight={5}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    async for chunk in client.runs.stream(
        thread_id,
        assistant_id,
        input={"topic": "ice cream"},
        stream_mode="debug"
    ):
        print(chunk.data)
    ```
  </Tab>

  <Tab title="JavaScript">
    ```javascript {highlight={6}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const streamResponse = client.runs.stream(
      threadID,
      assistantID,
      {
        input: { topic: "ice cream" },
        streamMode: "debug"
      }
    );
    for await (const chunk of streamResponse) {
      console.log(chunk.data);
    }
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/stream \
    --header 'Content-Type: application/json' \
    --data "{
      \"assistant_id\": \"agent\",
      \"input\": {\"topic\": \"ice cream\"},
      \"stream_mode\": \"debug\"
    }"
    ```
  </Tab>
</Tabs>

<a />

## LLM 代币

使用 `messages-tuple` 流模式从图形的任何部分（包括节点、工具、子图或任务）**逐个令牌**流式传输大型语言模型 (LLM) 输出。

[⟦T102⟧ mode](#supported-stream-modes) 的流式输出是一个元组 `(message_chunk, metadata)`，其中：

* `message_chunk`：LLM 的令牌或消息段。
* `metadata`：包含有关图节点和LLM调用详细信息的字典。

<Accordion title="Example graph">
  ```python {highlight={15}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.chat_models import init_chat_model
  from langgraph.graph import StateGraph, START

  @dataclass
  class MyState:
      topic: str
      joke: str = ""

  model = init_chat_model(model="gpt-5.4-mini")

  def call_model(state: MyState):
      """Call the LLM to generate a joke about a topic"""
      model_response = model.invoke( # (1)!
          [
              {"role": "user", "content": f"Generate a joke about {state.topic}"}
          ]
      )
      return {"joke": model_response.content}

  graph = (
      StateGraph(MyState)
      .add_node(call_model)
      .add_edge(START, "call_model")
      .compile()
  )
  ```

  1. 请注意，即使使用 `invoke` 而不是 `stream` 运行 LLM，也会发出消息事件。
</Accordion><Tabs>
  <Tab title="Python">
    ```python {highlight={5}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    async for chunk in client.runs.stream(
        thread_id,
        assistant_id,
        input={"topic": "ice cream"},
        stream_mode="messages-tuple",
    ):
        if chunk.event != "messages":
            continue

        message_chunk, metadata = chunk.data  # (1)!
        if message_chunk["content"]:
            print(message_chunk["content"], end="|", flush=True)
    ```

    1.“messages-tuple”流模式返回元组`(message_chunk, metadata)`的迭代器，其中`message_chunk`是LLM流式传输的令牌，`metadata`是一个字典，其中包含有关调用LLM的图形节点的信息和其他信息。
  </Tab>

  <Tab title="JavaScript">
    ```javascript {highlight={6}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const streamResponse = client.runs.stream(
      threadID,
      assistantID,
      {
        input: { topic: "ice cream" },
        streamMode: "messages-tuple"
      }
    );
    for await (const chunk of streamResponse) {
      if (chunk.event !== "messages") {
        continue;
      }
      console.log(chunk.data[0]["content"]);  // (1)!
    }
    ```

    1.“messages-tuple”流模式返回元组`(message_chunk, metadata)`的迭代器，其中`message_chunk`是LLM流式传输的令牌，`metadata`是一个字典，其中包含有关调用LLM的图节点的信息和其他信息。
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/stream \
    --header 'Content-Type: application/json' \
    --data "{
      \"assistant_id\": \"agent\",
      \"input\": {\"topic\": \"ice cream\"},
      \"stream_mode\": \"messages-tuple\"
    }"
    ```
  </Tab>
</Tabs>

### 过滤 LLM 令牌

* 要通过LLM调用过滤流式令牌，您可以[associate ⟦T114⟧ with LLM invocations](/oss/python/langgraph/streaming#filter-by-llm-invocation)。
* 要仅从特定节点流式传输令牌，请在流式元数据中使用 `stream_mode="messages"` 和 [filter the outputs by the ⟦T116⟧ field](/oss/python/langgraph/streaming#filter-by-node)。

## 流式传输自定义数据

要发送**自定义用户定义的数据**：

<Tabs>
  <Tab title="Python">
    ```python {highlight={5}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    async for chunk in client.runs.stream(
        thread_id,
        assistant_id,
        input={"query": "example"},
        stream_mode="custom"
    ):
        print(chunk.data)
    ```
  </Tab>

  <Tab title="JavaScript">
    ```javascript {highlight={6}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const streamResponse = client.runs.stream(
      threadID,
      assistantID,
      {
        input: { query: "example" },
        streamMode: "custom"
      }
    );
    for await (const chunk of streamResponse) {
      console.log(chunk.data);
    }
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/stream \
    --header 'Content-Type: application/json' \
    --data "{
      \"assistant_id\": \"agent\",
      \"input\": {\"query\": \"example\"},
      \"stream_mode\": \"custom\"
    }"
    ```
  </Tab>
</Tabs>

## 流媒体事件

要流式传输所有事件，包括图表的状态：

<Tabs>
  <Tab title="Python">
    ```python {highlight={5}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    async for chunk in client.runs.stream(
        thread_id,
        assistant_id,
        input={"topic": "ice cream"},
        stream_mode="events"
    ):
        print(chunk.data)
    ```
  </Tab>

  <Tab title="JavaScript">
    ```javascript {highlight={6}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const streamResponse = client.runs.stream(
      threadID,
      assistantID,
      {
        input: { topic: "ice cream" },
        streamMode: "events"
      }
    );
    for await (const chunk of streamResponse) {
      console.log(chunk.data);
    }
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/stream \
    --header 'Content-Type: application/json' \
    --data "{
      \"assistant_id\": \"agent\",
      \"input\": {\"topic\": \"ice cream\"},
      \"stream_mode\": \"events\"
    }"
    ```
  </Tab>
</Tabs>

## 无状态运行如果您不想在[checkpointer](/oss/python/langgraph/persistence)数据库中**保留流运行的输出**，您可以创建无状态运行而不创建线程：

<Tabs>
  <Tab title="Python">
    ```python {highlight={5}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langgraph_sdk import get_client
    client = get_client(url=<DEPLOYMENT_URL>, api_key=<API_KEY>)

    async for chunk in client.runs.stream(
        None,  # (1)!
        assistant_id,
        input=inputs,
        stream_mode="updates"
    ):
        print(chunk.data)
    ```

    1. 我们传递的是 `None` 而不是 `thread_id` UUID。
  </Tab>

  <Tab title="JavaScript">
    ```javascript {highlight={5,6}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { Client } from "@langchain/langgraph-sdk";
    const client = new Client({ apiUrl: <DEPLOYMENT_URL>, apiKey: <API_KEY> });

    // create a streaming run
    const streamResponse = client.runs.stream(
      null,  // (1)!
      assistantID,
      {
        input,
        streamMode: "updates"
      }
    );
    for await (const chunk of streamResponse) {
      console.log(chunk.data);
    }
    ```

    1. 我们传递的是 `None` 而不是 `thread_id` UUID。
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
    --url <DEPLOYMENT_URL>/runs/stream \
    --header 'Content-Type: application/json' \
    --header 'x-api-key: <API_KEY>'
    --data "{
      \"assistant_id\": \"agent\",
      \"input\": <inputs>,
      \"stream_mode\": \"updates\"
    }"
    ```
  </Tab>
</Tabs>

## 加入并直播

LangSmith 允许您加入活动的 [background run](/langsmith/background-run) 并从中传输输出。为此，您可以使用 [LangGraph SDK's](/langsmith/langgraph-python-sdk) `client.runs.join_stream` 方法：

<Tabs>
  <Tab title="Python">
    ```python {highlight={4,6}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langgraph_sdk import get_client
    client = get_client(url=<DEPLOYMENT_URL>, api_key=<API_KEY>)

    async for chunk in client.runs.join_stream(
        thread_id,
        run_id,  # (1)!
    ):
        print(chunk)
    ```

    1. 这是您要加入的现有跑步的 `run_id`。
  </Tab>

  <Tab title="JavaScript">
    ```javascript {highlight={4,6}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { Client } from "@langchain/langgraph-sdk";
    const client = new Client({ apiUrl: <DEPLOYMENT_URL>, apiKey: <API_KEY> });

    const streamResponse = client.runs.joinStream(
      threadID,
      runId  // (1)!
    );
    for await (const chunk of streamResponse) {
      console.log(chunk);
    }
    ```

    1. 这是您要加入的现有跑步的 `run_id`。
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request GET \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/<RUN_ID>/stream \
    --header 'Content-Type: application/json' \
    --header 'x-api-key: <API_KEY>'
    ```
  </Tab>
</Tabs>

<Warning>
  **输出未缓冲**
  当您使用`.join_stream`时，输出不会被缓冲，因此在加入之前产生的任何输出都不会被接收。
</Warning>

## 流式传输线程线程流为线程打开一个长期连接，并流式传输该线程上执行的**每次运行**的输出。这使您可以从单个连接监控线程上的所有活动，例如，在聊天 UI 中，随着时间的推移，可能会通过后续消息、[human-in-the-loop](/langsmith/add-human-in-the-loop) 恢复或[background runs](/langsmith/background-run) 触发多个运行。要按 ID 加入特定的现有运行，请参阅[Join and stream](#join-and-stream)。

### 比较线程并运行流式传输

|                         |线程流 |运行流媒体 |
| ----------------------- | --------------------------------- | --------------------------------------- |
| **SDK方法** | `client.threads.join_stream()` | `client.runs.stream()` |
| **休息端点** | `GET /threads/{thread_id}/stream` | `POST /threads/{thread_id}/runs/stream` |
| **范围** |全部在一个线程上运行 |单次运行 |
| **连接寿命** |无限期开放 |运行完成后关闭 |
| **创建运行** |没有 |是的 |
| **用例** |监视正在进行的线程活动 |执行并流式传输单个交互 |

### 基本用法<Tabs>
  <Tab title="Python">
    ```python {highlight={7}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langgraph_sdk import get_client
    client = get_client(url=<DEPLOYMENT_URL>, api_key=<API_KEY>)

    thread = await client.threads.create()
    thread_id = thread["thread_id"]

    async for chunk in client.threads.join_stream(thread_id):
        print(chunk)
    ```
  </Tab>

  <Tab title="JavaScript">
    ```javascript {highlight={7}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { Client } from "@langchain/langgraph-sdk";
    const client = new Client({ apiUrl: <DEPLOYMENT_URL>, apiKey: <API_KEY> });

    const thread = await client.threads.create();
    const threadID = thread["thread_id"];

    for await (const chunk of client.threads.joinStream(threadID)) {
      console.log(chunk);
    }
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request GET \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/stream \
    --header 'x-api-key: <API_KEY>'
    ```
  </Tab>
</Tabs>

### 线程流模式

线程流支持三种流模式来控制返回哪些事件。通过 `stream_mode` 参数传递一种或多种模式。

|模式|描述 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `run_modes`（默认）|流式传输所有运行事件，相当于 `client.runs.stream()` 输出。                                              |
| `lifecycle` |流仅运行开始和结束事件。使用它可以对运行状态进行轻量级监控，而无需完整输出。 |
| `state_update` |仅流式传输状态更新事件，在每次运行完成后提供线程状态。                            |

<Tabs>
  <Tab title="Python">
    ```python {highlight={3}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    async for chunk in client.threads.join_stream(
        thread_id,
        stream_mode=["lifecycle", "state_update"],
    ):
        print(chunk.event, chunk.data)
    ```
  </Tab>

  <Tab title="JavaScript">
    ```javascript {highlight={2}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    for await (const chunk of client.threads.joinStream(threadID, {
      streamMode: ["lifecycle", "state_update"],
    })) {
      console.log(chunk.event, chunk.data);
    }
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request GET \
    --url '<DEPLOYMENT_URL>/threads/<THREAD_ID>/stream?stream_modes=lifecycle&stream_modes=state_update' \
    --header 'x-api-key: <API_KEY>'
    ```
  </Tab>
</Tabs>

### 从上次活动继续线程流通过 `Last-Event-ID` 标头支持可恢复性。如果连接断开，请传递您收到的最后一个事件的 ID 以恢复，而不会丢失事件。通过`"-"`从头开始重播。

<Tabs>
  <Tab title="Python">
    ```python {highlight={3}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    async for chunk in client.threads.join_stream(
        thread_id,
        last_event_id="<LAST_EVENT_ID>",
    ):
        print(chunk)
    ```
  </Tab>

  <Tab title="JavaScript">
    ```javascript {highlight={2}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    for await (const chunk of client.threads.joinStream(threadID, {
      lastEventId: "<LAST_EVENT_ID>",
    })) {
      console.log(chunk);
    }
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request GET \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/stream \
    --header 'x-api-key: <API_KEY>' \
    --header 'Last-Event-ID: <LAST_EVENT_ID>'
    ```
  </Tab>
</Tabs>

## API 参考

API的使用和实现请参考[API reference](/langsmith/server-api-ref)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/streaming.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>