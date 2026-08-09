<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Time travel using the server API | https://docs.langchain.com/langsmith/human-in-the-loop-time-travel -->

# 使用服务器 API 进行时间旅行

LangGraph 提供了 [**time travel**](/oss/python/langgraph/use-time-travel) 功能，可以从先前的检查点恢复执行，重播相同的状态或修改它以探索替代方案。在所有情况下，恢复过去的执行都会在历史中产生一个新的分叉。

使用 LangSmith Deployment API（通过 LangGraph SDK）进行时间旅行：

1. **使用 [LangGraph SDK](/langsmith/langgraph-python-sdk) 的 [client.runs.wait](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.RunsClient.wait) 或 [client.runs.stream](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.RunsClient.stream) API 使用初始输入运行图表**。
2. **识别现有线程中的检查点**：使用[client.threads.get\_history](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.get_history)方法检索特定`thread_id`的执行历史记录并找到所需的`checkpoint_id`。
   或者，在要暂停执行的节点之前设置 [breakpoint](/oss/python/langgraph/interrupts)。然后，您可以找到截至该断点记录的最新检查点。
3. **（可选）修改图状态**：使用[client.threads.update\_state](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.update_state)方法修改图在检查点的状态并从替代状态恢复执行。
4. **从检查点恢复执行**：使用 [client.runs.wait](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.RunsClient.wait) 或 [client.runs.stream](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.RunsClient.stream) API 并输入 `None` 以及相应的 `thread_id` 和 `checkpoint_id`。

## 在工作流程中使用时间旅行

<Accordion title="Example graph">
  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from typing_extensions import TypedDict, NotRequired
  from langgraph.graph import StateGraph, START, END
  from langchain.chat_models import init_chat_model
  from langgraph.checkpoint.memory import InMemorySaver

  class State(TypedDict):
      topic: NotRequired[str]
      joke: NotRequired[str]

  model = init_chat_model(
      "claude-sonnet-4-6",
      temperature=0,
  )

  def generate_topic(state: State):
      """LLM call to generate a topic for the joke"""
      msg = model.invoke("Give me a funny topic for a joke")
      return {"topic": msg.content}

  def write_joke(state: State):
      """LLM call to write a joke based on the topic"""
      msg = model.invoke(f"Write a short joke about {state['topic']}")
      return {"joke": msg.content}

  # Build workflow
  builder = StateGraph(State)

  # Add nodes
  builder.add_node("generate_topic", generate_topic)
  builder.add_node("write_joke", write_joke)

  # Add edges to connect nodes
  builder.add_edge(START, "generate_topic")
  builder.add_edge("generate_topic", "write_joke")

  # Compile
  graph = builder.compile()
  ```
</Accordion>

### 1. 运行图表

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

    # Run the graph
    result = await client.runs.wait(
        thread_id,
        assistant_id,
        input={}
    )
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
    const threadID = thread["thread_id"];

    // Run the graph
    const result = await client.runs.wait(
      threadID,
      assistantID,
      { input: {}}
    );
    ```
  </Tab>

  <Tab title="cURL">
    创建一个线程：```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads \
    --header 'Content-Type: application/json' \
    --data '{}'
    ```

    运行图表：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/wait \
    --header 'Content-Type: application/json' \
    --data "{
      \"assistant_id\": \"agent\",
      \"input\": {}
    }"
    ```
  </Tab>
</Tabs>

### 2. 确定检查点

<Tabs>
  <Tab title="Python">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # The states are returned in reverse chronological order.
    states = await client.threads.get_history(thread_id)
    selected_state = states[1]
    print(selected_state)
    ```
  </Tab>

  <Tab title="JavaScript">
    ```js theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    // The states are returned in reverse chronological order.
    const states = await client.threads.getHistory(threadID);
    const selectedState = states[1];
    console.log(selectedState);
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request GET \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/history \
    --header 'Content-Type: application/json'
    ```
  </Tab>
</Tabs>

<a />

### 3.更新状态

[⟦T19⟧](https://reference.langchain.com/python/langgraph/graphs/#langgraph.graph.state.CompiledStateGraph.update_state) 将创建一个新的检查点。新的检查点将与同一个线程关联，但有一个新的检查点 ID。

<Tabs>
  <Tab title="Python">
    ```python {highlight={4}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    new_config = await client.threads.update_state(
        thread_id,
        {"topic": "chickens"},
        checkpoint_id=selected_state["checkpoint_id"]
    )
    print(new_config)
    ```
  </Tab>

  <Tab title="JavaScript">
    ```js theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const newConfig = await client.threads.updateState(
      threadID,
      {
        values: { "topic": "chickens" },
        checkpointId: selectedState["checkpoint_id"]
      }
    );
    console.log(newConfig);
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/state \
    --header 'Content-Type: application/json' \
    --data "{
      \"assistant_id\": \"agent\",
      \"checkpoint_id\": <CHECKPOINT_ID>,
      \"values\": {\"topic\": \"chickens\"}
    }"
    ```
  </Tab>
</Tabs>

### 4.从检查点恢复执行

<Tabs>
  <Tab title="Python">
    ```python {highlight={4,5}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    await client.runs.wait(
        thread_id,
        assistant_id,
        input=None,
        checkpoint_id=new_config["checkpoint_id"]
    )
    ```
  </Tab>

  <Tab title="JavaScript">
    ```javascript {highlight={5,6}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    await client.runs.wait(
      threadID,
      assistantID,
      {
        input: null,
        checkpointId: newConfig["checkpoint_id"]
      }
    );
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/wait \
    --header 'Content-Type: application/json' \
    --data "{
      \"assistant_id\": \"agent\",
      \"checkpoint_id\": <CHECKPOINT_ID>
    }"
    ```
  </Tab>
</Tabs>

## 了解更多

* [**LangGraph time travel guide**](/oss/python/langgraph/use-time-travel)：了解有关在 LangGraph 中使用时间旅行的更多信息。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/human-in-the-loop-time-travel.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>