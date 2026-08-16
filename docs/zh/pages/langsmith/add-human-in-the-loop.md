<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Human-in-the-loop using server API | https://docs.langchain.com/langsmith/add-human-in-the-loop -->

# 使用服务器 API 进行人机交互

要审查、编辑和批准代理或工作流程中的工具调用，请使用 LangGraph 的 [human-in-the-loop](/oss/python/langgraph/interrupts) 功能。

## 动态中断

<Tabs>
    <Tab title="Python">
    ```python {highlight={2,34}}
    from langgraph_sdk import get_client
    from langgraph_sdk.schema import Command
    client = get_client(url=<DEPLOYMENT_URL>)

    # Using the graph deployed with the name "agent"
    assistant_id = "agent"

    # create a thread
    thread = await client.threads.create()
    thread_id = thread["thread_id"]

    # Run the graph until the interrupt is hit.
    result = await client.runs.wait(
        thread_id,
        assistant_id,
        input={"some_text": "original text"}   # (1)!
    )

    print(result['__interrupt__']) # (2)!
    # > [
    # >     {
    # >         'value': {'text_to_revise': 'original text'},
    # >         'resumable': True,
    # >         'ns': ['human_node:fc722478-2f21-0578-c572-d9fc4dd07c3b'],
    # >         'when': 'during'
    # >     }
    # > ]


    # Resume the graph
    print(await client.runs.wait(
        thread_id,
        assistant_id,
        command=Command(resume="Edited text")   # (3)!
    ))
    # > {'some_text': 'Edited text'}
```

    1. 该图以某种初始状态被调用。
    2. 当图表命中中断时，它会返回一个带有有效负载和元数据的中断对象。
        3. 该图以`Command(resume=...)`恢复，注入人类输入并继续执行。
    </Tab>
    <Tab title="JavaScript">
    ```javascript {highlight={32}}
    import { Client } from "@langchain/langgraph-sdk";
    const client = new Client({ apiUrl: <DEPLOYMENT_URL> });

    // Using the graph deployed with the name "agent"
    const assistantID = "agent";

    // create a thread
    const thread = await client.threads.create();
    const threadID = thread["thread_id"];

    // Run the graph until the interrupt is hit.
    const result = await client.runs.wait(
      threadID,
      assistantID,
      { input: { "some_text": "original text" } }   # (1)!
    );

    console.log(result['__interrupt__']); # (2)!
    // > [
    # >     {
    # >         'value': {'text_to_revise': 'original text'},
    # >         'resumable': True,
    # >         'ns': ['human_node:fc722478-2f21-0578-c572-d9fc4dd07c3b'],
    # >         'when': 'during'
    # >     }
    # > ]

    // Resume the graph
    console.log(await client.runs.wait(
        threadID,
        assistantID,
        { command: { resume: "Edited text" }}   # (3)!
    ));
    # > {'some_text': 'Edited text'}
```

    1. 该图以某种初始状态被调用。
    2. 当图表命中中断时，它会返回一个带有有效负载和元数据的中断对象。
    3. 该图通过`{ resume: ... }`命令对象恢复，注入人类输入并继续执行。
    </Tab>
    <Tab title="cURL">
    创建一个线程：

    ```bash
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads \
    --header 'Content-Type: application/json' \
    --data '{}'
    ```

    运行图表直到中断发生：

    ```bash
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/wait \
    --header 'Content-Type: application/json' \
    --data "{
      \"assistant_id\": \"agent\",
      \"input\": {\"some_text\": \"original text\"}
    }"
    ```

    恢复图表：

    ```bash
    curl --request POST \
     --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/wait \
     --header 'Content-Type: application/json' \
     --data "{
       \"assistant_id\": \"agent\",
       \"command\": {
         \"resume\": \"Edited text\"
       }
     }"
    ```
    </Tab>
</Tabs>

<Accordion title="Extended example: using ⟦T22⟧">
  这是您可以在代理服务器中运行的示例图。
  更多详情请参见[LangSmith quickstart](/langsmith/deployment-quickstart)。

  ```python {highlight={7,13}}
  from typing import TypedDict
  import uuid

  from langgraph.checkpoint.memory import InMemorySaver
  from langgraph.constants import START
  from langgraph.graph import StateGraph
  from langgraph.types import interrupt, Command

  class State(TypedDict):
      some_text: str

  def human_node(state: State):
      value = interrupt( # (1)!
          {
              "text_to_revise": state["some_text"] # (2)!
          }
      )
      return {
          "some_text": value # (3)!
      }


  # Build the graph
  graph_builder = StateGraph(State)
  graph_builder.add_node("human_node", human_node)
  graph_builder.add_edge(START, "human_node")

  graph = graph_builder.compile()
```1. `interrupt(...)` 在 `human_node` 暂停执行，向人类展示给定的有效负载。
  2. 任何 JSON 可序列化值都可以传递给 [⟦T25⟧](https://reference.langchain.com/python/langgraph/types/interrupt) 函数。这里是一个包含要修改的文本的字典。
  3. 一旦恢复，`interrupt(...)`的返回值就是人类提供的输入，用于更新状态。

  一旦您拥有正在运行的代理服务器，您就可以使用以下命令与其进行交互
  [LangGraph SDK](/langsmith/langgraph-python-sdk)

    <Tabs>
        <Tab title="Python">
      ```python {highlight={2,34}}
      from langgraph_sdk import get_client
      from langgraph_sdk.schema import Command
      client = get_client(url=<DEPLOYMENT_URL>)

      # Using the graph deployed with the name "agent"
      assistant_id = "agent"

      # create a thread
      thread = await client.threads.create()
      thread_id = thread["thread_id"]

      # Run the graph until the interrupt is hit.
      result = await client.runs.wait(
          thread_id,
          assistant_id,
          input={"some_text": "original text"}   # (1)!
      )

      print(result['__interrupt__']) # (2)!
      # > [
      # >     {
      # >         'value': {'text_to_revise': 'original text'},
      # >         'resumable': True,
      # >         'ns': ['human_node:fc722478-2f21-0578-c572-d9fc4dd07c3b'],
      # >         'when': 'during'
      # >     }
      # > ]


      # Resume the graph
      print(await client.runs.wait(
          thread_id,
          assistant_id,
          command=Command(resume="Edited text")   # (3)!
      ))
      # > {'some_text': 'Edited text'}
```

      1. 该图以某种初始状态被调用。
      2. 当图表命中中断时，它会返回一个带有有效负载和元数据的中断对象。
            3. 该图以`Command(resume=...)`恢复，注入人类输入并继续执行。
        </Tab>
        <Tab title="JavaScript">
      ```javascript {highlight={32}}
      import { Client } from "@langchain/langgraph-sdk";
      const client = new Client({ apiUrl: <DEPLOYMENT_URL> });

      // Using the graph deployed with the name "agent"
      const assistantID = "agent";

      // create a thread
      const thread = await client.threads.create();
      const threadID = thread["thread_id"];

      // Run the graph until the interrupt is hit.
      const result = await client.runs.wait(
        threadID,
        assistantID,
        { input: { "some_text": "original text" } }   # (1)!
      );

      console.log(result['__interrupt__']); # (2)!
      # > [
      # >     {
      # >         'value': {'text_to_revise': 'original text'},
      # >         'resumable': True,
      # >         'ns': ['human_node:fc722478-2f21-0578-c572-d9fc4dd07c3b'],
      # >         'when': 'during'
      # >     }
      # > ]

      // Resume the graph
      console.log(await client.runs.wait(
          threadID,
          assistantID,
          { command: { resume: "Edited text" }}   # (3)!
      ));
      # > {'some_text': 'Edited text'}
```

      1. 该图以某种初始状态被调用。
      2. 当图表命中中断时，它会返回一个带有有效负载和元数据的中断对象。
      3. 该图通过`{ resume: ... }`命令对象恢复，注入人类输入并继续执行。
        </Tab>
        <Tab title="cURL">
      创建一个线程：

      ```bash
      curl --request POST \
      --url <DEPLOYMENT_URL>/threads \
      --header 'Content-Type: application/json' \
      --data '{}'
      ```

      运行图表直到中断发生：

      ```bash
      curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/wait \
      --header 'Content-Type: application/json' \
      --data "{
        \"assistant_id\": \"agent\",
        \"input\": {\"some_text\": \"original text\"}
      }"
      ```

      恢复图表：

      ```bash
      curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/wait \
      --header 'Content-Type: application/json' \
      --data "{
        \"assistant_id\": \"agent\",
        \"command\": {
          \"resume\": \"Edited text\"
        }
      }"
      ```
        </Tab>
    </Tabs>
</Accordion>## 静态中断

静态中断（也称为静态断点）在节点执行之前或之后触发。

<Warning>
**不**建议将静态中断用于人机交互工作流程。它们最适合用于调试和测试。
</Warning>

您可以通过在编译时指定`interrupt_before`和`interrupt_after`来设置静态中断：

```python {highlight={1,2,3}}
graph = graph_builder.compile( # (1)!
    interrupt_before=["node_a"], # (2)!
    interrupt_after=["node_b", "node_c"], # (3)!
)
```

1. 断点在`compile`时间内设置。
2. `interrupt_before` 指定执行该节点之前应暂停执行的节点。
3. `interrupt_after` 指定该节点执行完毕后应暂停执行的节点。

或者，您可以在运行时设置静态中断：

<Tabs>
    <Tab title="Python">
    ```python {highlight={1,5,6}}
    await client.runs.wait( # (1)!
        thread_id,
        assistant_id,
        inputs=inputs,
        interrupt_before=["node_a"], # (2)!
        interrupt_after=["node_b", "node_c"] # (3)!
    )
```

    1. 使用`interrupt_before`和`interrupt_after`参数调用`client.runs.wait`。这是一个运行时配置，可以在每次调用时更改。
    2. `interrupt_before` 指定执行该节点之前应暂停执行的节点。
    3. `interrupt_after` 指定该节点执行完毕后应暂停执行的节点。
    </Tab>
    <Tab title="JavaScript">
    ```javascript {highlight={1,6,7}}
    await client.runs.wait( // (1)!
        threadID,
        assistantID,
        {
        input: input,
        interruptBefore: ["node_a"], // (2)!
        interruptAfter: ["node_b", "node_c"] // (3)!
        }
    )
```1. 使用`interruptBefore`和`interruptAfter`参数调用`client.runs.wait`。这是一个运行时配置，可以在每次调用时更改。
    2. `interruptBefore` 指定执行该节点之前应暂停执行的节点。
    3. `interruptAfter` 指定该节点执行完毕后应暂停执行的节点。
    </Tab>
    <Tab title="cURL">
    ```bash
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/wait \
    --header 'Content-Type: application/json' \
    --data "{
        \"assistant_id\": \"agent\",
        \"interrupt_before\": [\"node_a\"],
        \"interrupt_after\": [\"node_b\", \"node_c\"],
        \"input\": <INPUT>
    }"
    ```
    </Tab>
</Tabs>

以下示例显示如何添加静态中断：

<Tabs>
    <Tab title="Python">
    ```python
    from langgraph_sdk import get_client
    client = get_client(url=<DEPLOYMENT_URL>)

    # Using the graph deployed with the name "agent"
    assistant_id = "agent"

    # create a thread
    thread = await client.threads.create()
    thread_id = thread["thread_id"]

    # Run the graph until the breakpoint
    result = await client.runs.wait(
        thread_id,
        assistant_id,
        input=inputs   # (1)!
    )

    # Resume the graph
    await client.runs.wait(
        thread_id,
        assistant_id,
        input=None   # (2)!
    )
    ```

    1. 运行图表直到遇到第一个断点。
    2. 通过传入 `None` 作为输入来恢复图表。这将运行图表直到遇到下一个断点。
    </Tab>
    <Tab title="JavaScript">
    ```js
    import { Client } from "@langchain/langgraph-sdk";
    const client = new Client({ apiUrl: <DEPLOYMENT_URL> });

    // Using the graph deployed with the name "agent"
    const assistantID = "agent";

    // create a thread
    const thread = await client.threads.create();
    const threadID = thread["thread_id"];

    // Run the graph until the breakpoint
    const result = await client.runs.wait(
      threadID,
      assistantID,
      { input: input }   # (1)!
    );

    // Resume the graph
    await client.runs.wait(
      threadID,
      assistantID,
      { input: null }   # (2)!
    );
    ```

    1. 运行图表直到遇到第一个断点。
    2. 通过传入 `null` 作为输入来恢复图表。这将运行图表直到遇到下一个断点。
    </Tab>
    <Tab title="cURL">
    创建一个线程：

    ```bash
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads \
    --header 'Content-Type: application/json' \
    --data '{}'
    ```

    运行图表直到断点：

    ```bash
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/wait \
    --header 'Content-Type: application/json' \
    --data "{
      \"assistant_id\": \"agent\",
      \"input\": <INPUT>
    }"
    ```

    恢复图表：

    ```bash
    curl --request POST \
    --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/wait \
    --header 'Content-Type: application/json' \
    --data "{
      \"assistant_id\": \"agent\"
    }"
    ```
    </Tab>
</Tabs>

## 了解更多* [Human-in-the-loop conceptual guide](/oss/python/langgraph/interrupts)：了解有关 LangGraph 人机交互功能的更多信息。
* [Common patterns](/oss/python/langgraph/interrupts#common-patterns)：学习如何实现批准/拒绝操作、请求用户输入、工具调用审查和验证人工输入等模式。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/add-human-in-the-loop.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>