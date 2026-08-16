<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to cancel a run | https://docs.langchain.com/langsmith/cancel-run -->

# 如何取消运行

本指南介绍了如何通过 [LangSmith Deployment API](/langsmith/server-api-ref) 取消代理的运行。您可以按 ID 取消单次运行，也可以按线程或状态取消多次运行。取消对于停止长时间运行或卡住的运行，或者当用户放弃请求时非常有用。

## 设置

创建客户端和线程：

<Tabs>
    <Tab title="Python">
    ```python
    from langgraph_sdk import get_client

    client = get_client(url=<DEPLOYMENT_URL>)
    assistant_id = "agent"
    thread = await client.threads.create()
    ```
    </Tab>
    <Tab title="Javascript">
    ```js
    import { Client } from "@langchain/langgraph-sdk";

    const client = new Client({ apiUrl: <DEPLOYMENT_URL> });
    const assistantID = "agent";
    const thread = await client.threads.create();
    ```
    </Tab>
    <Tab title="cURL">
    ```bash
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads \
      --header 'Content-Type: application/json' \
      --data '{}'
    ```
    </Tab>
</Tabs>

## 取消单次运行

以下示例创建一个运行，使用不同的选项取消它，然后打印该运行以显示在每种情况下获得的结果。您可以在`pending`或`running`状态下取消运行。尝试取消不处于 `pending` 或 `running` 状态的运行将导致错误。

### 通过中断取消（默认）

**中断** 停止工作线程执行运行并将运行标记为`interrupted`。没有删除任何内容：

- 运行记录保留（状态为`interrupted`）。您可以获取它，检查输入/输出，并查看执行历史记录。
- 该运行的所有检查点均保持存储。保留最后完成步骤的线程状态。
- 您稍后可以从检查点恢复（例如，使用 [time travel](/langsmith/human-in-the-loop-time-travel)）或检查部分状态。当您想要停止运行但保留它以进行调试、审核或从检查点恢复时，请使用 **中断**。

<Tabs>
    <Tab title="Python">
    ```python
    run = await client.runs.create(
        thread["thread_id"],
        assistant_id,
        input={"messages": [{"role": "user", "content": "Long task"}]},
    )
    await client.runs.cancel(thread["thread_id"], run["run_id"])

    run_after = await client.runs.get(thread["thread_id"], run["run_id"], wait=True)
    print(run_after["status"])   # "interrupted"
    ```
    </Tab>
    <Tab title="Javascript">
    ```js
    const run = await client.runs.create(
        thread["thread_id"],
        assistantID,
        { input: { messages: [{ role: "user", content: "Long task" }] } }
    );
    await client.runs.cancel(thread["thread_id"], run["run_id"], wait=true);

    const runAfter = await client.runs.get(thread["thread_id"], run["run_id"]);
    console.log(runAfter["status"]);   // "interrupted"
    ```
    </Tab>
    <Tab title="cURL">
    ```bash
    # Create a run (use the run_id and thread_id from the response)
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs \
      --header 'Content-Type: application/json' \
      --data '{"assistant_id": "agent", "input": {"messages": [{"role": "user", "content": "Summarize the docs"}]}}'

    # Cancel with default action (interrupt)
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/<RUN_ID>/cancel?wait=true

    # Get the run to see status "interrupted" and that the run still exists
    curl --request GET \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/<RUN_ID>
    ```
    </Tab>
</Tabs>

### 取消并回滚

**回滚** 停止运行，然后从存储中删除它及其检查点：

- 运行记录被删除。该运行不再出现在该线程的运行列表或历史记录中。
- 该运行创建的所有检查点都将被删除。线程的状态将恢复到运行开始之前的状态（就好像运行从未执行过一样）。
- 回滚后您无法恢复或检查运行。

当您想要完全放弃运行及其影响时（例如，在用户放弃请求之后并且您不需要保留部分工作），请使用 **回滚**。

<Tabs>
    <Tab title="Python">
    ```python
    run = await client.runs.create(
        thread["thread_id"],
        assistant_id,
        input={"messages": [{"role": "user", "content": "Long task"}]},
    )
    await client.runs.cancel(thread["thread_id"], run["run_id"], action="rollback", wait=True)

    # Throws an error because the run is deleted
    try:
        await client.runs.get(thread["thread_id"], run["run_id"])
    except Exception:
        print("Run was correctly deleted")
    ```
    </Tab>
    <Tab title="Javascript">
    ```js
    const run = await client.runs.create(
        thread["thread_id"],
        assistantID,
        { input: { messages: [{ role: "user", content: "Long task" }] } }
    );
    await client.runs.cancel(thread["thread_id"], run["run_id"], wait=true, action="rollback");

    // Throws an error because the run is deleted
    try {
        await client.runs.get(thread["thread_id"], run["run_id"]);
    } catch (e) {
        console.log("Run was correctly deleted");
    }
    ```
    </Tab>
    <Tab title="cURL">
    ```bash
    # Create a run, then cancel with rollback
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs \
      --header 'Content-Type: application/json' \
      --data '{"assistant_id": "agent", "input": {"messages": [{"role": "user", "content": "Summarize the docs"}]}}'

    curl --request POST \
      --url "<DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/<RUN_ID>/cancel?action=rollback"

    # Throws an error because the run is deleted
    curl --request GET \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/<RUN_ID>
    ```
    </Tab>
</Tabs>

### 等待取消默认情况下，取消请求会在请求取消后返回，并异步取消运行。 `wait=True` 使取消请求阻塞，直到运行完全取消。当您想知道取消运行后的最终状态（例如，创建了哪些检查点、最终输出是什么）时，这非常有用。

<Tabs>
    <Tab title="Python">
    ```python
    run = await client.runs.create(
        thread["thread_id"],
        assistant_id,
        input={"messages": [{"role": "user", "content": "Long task"}]},
    )
    # Cancel the run asynchronously
    await client.runs.cancel(thread["thread_id"], run["run_id"])
    # Get the status of the run
    run_after = await client.runs.get(thread["thread_id"], run["run_id"])
    print(run_after["status"])  # "pending" or "running"

    # Wait for the run to be properly cancelled
    await client.runs.join(thread["thread_id"], run["run_id"])
    run_after = await client.runs.get(thread["thread_id"], run["run_id"])
    print(run_after["status"])  # "interrupted"
    ```
    </Tab>
    <Tab title="Javascript">
    ```js
    const run = await client.runs.create(
        thread["thread_id"],
        assistantID,
        { input: { messages: [{ role: "user", content: "Long task" }] } }
    );
    // Cancel the run asynchronously
    await client.runs.cancel(thread["thread_id"], run["run_id"]);
    // Get the status of the run
    const runRunning = await client.runs.get(thread["thread_id"], run["run_id"])
    console.log(runRunning["status"])  // "pending" or "running"

    // Wait for the run to be properly cancelled
    await client.runs.join(thread["thread_id"], run["run_id"])
    const runInterrupted = await client.runs.get(thread["thread_id"], run["run_id"])
    console.log(runInterrupted["status"])  // "interrupted"
    ```
    </Tab>
    <Tab title="cURL">
    ```bash
    # Create a run
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs \
      --header 'Content-Type: application/json' \
      --data '{"assistant_id": "agent", "input": {"messages": [{"role": "user", "content": "Summarize the docs"}]}}'

    # Cancel the run asynchronously
    curl --request POST \
      --url "<DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/<RUN_ID>/cancel"

    # Get the status of the run, should be "pending" or "running" until cancellation completes, then "interrupted"
    curl --request GET \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/<RUN_ID>
    ```
    </Tab>
</Tabs>

## 取消多次运行

使用批量取消端点可以取消一个请求中的多次运行。支持中断和回滚操作。

### 通过线程 ID 和运行 ID 取消

通过传递 ID 取消特定运行。

<Tabs>
    <Tab title="Python">
    ```python
    run1 = await client.runs.create(
        thread["thread_id"],
        assistant_id,
        input={"messages": [{"role": "user", "content": "First request"}]},
    )
    run2 = await client.runs.create(
        thread["thread_id"],
        assistant_id,
        input={"messages": [{"role": "user", "content": "Second request"}]},
        multitask_strategy="enqueue",
    )

    await client.runs.cancel_many(
        thread_id=thread["thread_id"],
        run_ids=[run1["run_id"], run2["run_id"]]
    )

    # Wait for the runs to be cancelled
    await client.runs.join(thread["thread_id"], run2["run_id"])
    runs_after = await client.runs.list(thread["thread_id"])
    for run in runs_after:
        if run["run_id"] in (run1["run_id"], run2["run_id"]):
            print(run["run_id"], run["status"])  # "interrupted"
    ```
    </Tab>
    <Tab title="Javascript">
    ```js
    // Bulk delete by run IDs is not supported in the Javascript SDK
    ```
    </Tab>
    <Tab title="cURL">
    ```bash
    # Create two runs (capture run_id from each response)
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs \
      --header 'Content-Type: application/json' \
      --data '{"assistant_id": "agent", "input": {"messages": [{"role": "user", "content": "First request"}]}}'

    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs \
      --header 'Content-Type: application/json' \
      --data '{"assistant_id": "agent", "input": {"messages": [{"role": "user", "content": "Second request"}]}}'

    # Cancel both by run IDs
    curl --request POST \
      --url "<DEPLOYMENT_URL>/runs/cancel?action=interrupt" \
      --header 'Content-Type: application/json' \
      --data '{"thread_id": "<THREAD_ID>", "run_ids": ["<RUN_ID_1>", "<RUN_ID_2>"]}'

    # List runs to confirm
    curl --request GET \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs
    ```
    </Tab>
</Tabs>

### 按状态取消

取消与部署中所有线程的状态匹配的所有运行。有效状态选项为 `pending`、`running` 或 `all`。

<Tabs>
    <Tab title="Python">
    ```python
    run1 = await client.runs.create(
        thread["thread_id"],
        assistant_id,
        input={"messages": [{"role": "user", "content": "First request"}]},
    )
    thread2 = await client.threads.create()
    run2 = await client.runs.create(
        thread2["thread_id"],
        assistant_id,
        input={"messages": [{"role": "user", "content": "Second request"}]},
    )

    await client.runs.cancel_many(
        status="running",
    )

    # Wait for the runs to be cancelled
    await client.runs.join(thread2["thread_id"], run2["run_id"])
    run_after = await client.runs.get(thread["thread_id"], run1["run_id"])
    print(run_after["status"])  # running run is now "interrupted"
    run_after2 = await client.runs.get(thread2["thread_id"], run2["run_id"])
    print(run_after2["status"])  # runs are cancelled across all threads
    ```
    </Tab>
    <Tab title="Javascript">
    ```js
    // Bulk delete by status is not supported in the Javascript SDK
    ```
    </Tab>
    <Tab title="cURL">
    ```bash
    # Create a run
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs \
      --header 'Content-Type: application/json' \
      --data '{"assistant_id": "agent", "input": {"messages": [{"role": "user", "content": "First request"}]}}'

    # Create a second thread
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads \
      --header 'Content-Type: application/json' \
      --data '{}'

    # Create a run in the second thread
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID_2>/runs \
      --header 'Content-Type: application/json' \
      --data '{"assistant_id": "agent", "input": {"messages": [{"role": "user", "content": "Second request"}]}}'

    # Cancel all running runs
    curl --request POST \
      --url "<DEPLOYMENT_URL>/runs/cancel?action=interrupt" \
      --header 'Content-Type: application/json' \
      --data '{"status": "running"}'

    # Get the status of the runs to confirm
    curl --request GET \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/<RUN_ID_1>
    curl --request GET \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID_2>/runs/<RUN_ID_2>
    ```
    </Tab>
</Tabs>

## 断开连接时取消当开始流式运行或等待运行时，您可以设置`on_disconnect="cancel"`，以便在客户端断开连接时取消运行。这可以避免当用户关闭应用程序或失去连接时使运行继续进行。

<Tabs>
    <Tab title="Python">
    ```python
    # With runs.wait: run is cancelled if the client disconnects
    result = await client.runs.wait(
        thread["thread_id"],
        assistant_id,
        input={"messages": [{"role": "user", "content": "Long task"}]},
        on_disconnect="cancel",
    )

    # With runs.stream: run is cancelled if the client disconnects
    async for chunk in client.runs.stream(
        thread["thread_id"],
        assistant_id,
        input={"messages": [{"role": "user", "content": "Long task"}]},
        on_disconnect="cancel",
    ):
        print(chunk)

    # With runs.join: wait for an existing run; cancel if client disconnects
    run = await client.runs.create(
        thread["thread_id"],
        assistant_id,
        input={"messages": [{"role": "user", "content": "Long task"}]},
    )
    await client.runs.join(
        thread["thread_id"],
        run["run_id"],
        on_disconnect="cancel",
    )

    # With runs.join_stream: join an existing run and stream; cancel if client disconnects
    async for chunk in client.runs.join_stream(
        thread["thread_id"],
        run["run_id"],
        on_disconnect="cancel",
    ):
        print(chunk)
    ```
    </Tab>
    <Tab title="Javascript">
    ```js
    // With runs.wait: run is cancelled if the client disconnects
    const result = await client.runs.wait(
        thread["thread_id"],
        assistantID,
        { input: { messages: [{ role: "user", content: "Long task" }] }, onDisconnect: "cancel" }
    );

    // With runs.stream: run is cancelled if the client disconnects
    const streamResponse = client.runs.stream(
        thread["thread_id"],
        assistantID,
        { input: { messages: [{ role: "user", content: "Long task" }] }, onDisconnect: "cancel" }
    );
    for await (const chunk of streamResponse) {
        console.log(chunk);
    }

    // With runs.join does not support cancel on disconnect in the Javascript SDK

    // With runs.joinStream: join an existing run and stream; cancel if client disconnects
    const joinStreamResponse = client.runs.joinStream(
        thread["thread_id"],
        run["run_id"],
        { cancelOnDisconnect: true }
    );
    for await (const chunk of joinStreamResponse) {
        console.log(chunk);
    }
    ```
    </Tab>
    <Tab title="cURL">
    ```bash
    # runs.wait: create run and wait for output; cancel if client disconnects
    curl --request POST \
      --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/wait \
      --header 'Content-Type: application/json' \
      --data '{"assistant_id": "agent", "input": {"messages": [{"role": "user", "content": "Long task"}]}, "on_disconnect": "cancel"}'

    # Create and stream a run; cancel if client disconnects
    curl --request POST \
      --url "<DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/stream?on_disconnect=cancel" \
      --header 'Content-Type: application/json' \
      --data '{"assistant_id": "agent", "input": {"messages": [{"role": "user", "content": "Long task"}]}}'

    # runs.join: wait on an existing run; cancel if client disconnects
    curl --request GET \
      --url "<DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/<RUN_ID>/join?cancel_on_disconnect=cancel"

    # runs.join_stream: join an existing run and stream; cancel if client disconnects
    curl --request GET \
      --url "<DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/<RUN_ID>/stream?cancel_on_disconnect=cancel"
    ```
    </Tab>
</Tabs>

## 常见场景

- **人机循环和中断**：代理可以在 [interrupts](/langsmith/add-human-in-the-loop) 暂停以进行人工输入。取消运行会停止执行；它与中断不同，中断中运行被暂停并且可以通过新输入恢复。
- **时间旅行**：通过操作`interrupt`取消后，跑步和检查点仍然可用。您可以通过[resume from a checkpoint](/langsmith/human-in-the-loop-time-travel)（时间旅行）来重放或分支执行。
- **双短信**：当用户在运行正在进行时发送新输入时，[multitask strategy](/langsmith/double-texting)（入队、拒绝、中断、回滚）确定是否中断或回滚现有运行以及如何处理新运行。要从您的应用程序显式取消运行，请使用本页所述的取消 API。
- **Studio**：在[Studio](/langsmith/use-studio)中，使用运行UI中的**取消**按钮取消当前运行。

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/cancel-run.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>