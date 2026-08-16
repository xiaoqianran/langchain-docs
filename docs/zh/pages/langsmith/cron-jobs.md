<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use cron jobs | https://docs.langchain.com/langsmith/cron-jobs -->

# 使用 cron 作业

在许多情况下，按计划运行助手很有用。

例如，假设您正在构建一个每天运行并发送电子邮件摘要的助手
当天的新闻。您可以使用 cron 作业每天晚上 8:00 运行助手。

LangSmith 部署支持 cron 作业，它按照用户定义的计划运行。用户指定时间表、助手和一些输入。之后，按照指定的时间表，服务器将：

* 创建一个新线程，指定助手
* 将指定的输入发送到该线程

请注意，这每次都会向线程发送相同的输入。

LangSmith 部署 API 提供了多个用于创建和管理 cron 作业的端点。更多详情请参阅[API reference](https://langchain-ai.github.io/langgraph/cloud/reference/api/api_ref/)。有时您不想根据用户交互来运行图表，而是希望安排图表按计划运行 - 例如，如果您希望图表为您的团队撰写并发送每周的待办事项电子邮件。 LangSmith 部署允许您执行此操作，而无需使用 `Crons` 客户端编写自己的脚本。要调度图形作业，您需要传递[cron expression](https://crontab.cronhub.io/)来通知客户端何时要运行图形。 `Cron` 作业在后台运行，不会干扰图的正常调用。

<Note>
所有 cron 计划均以 **UTC** 解释。确保在指定计划时将所需的执行时间转换为 UTC。
</Note>

## 设置

首先，我们来设置 SDK 客户端、助手和线程：

<Tabs>
    <Tab title="Python">
    ```python
    from langgraph_sdk import get_client

    client = get_client(url=<DEPLOYMENT_URL>)
    # Using the graph deployed with the name "agent"
    assistant_id = "agent"
    # create thread
    thread = await client.threads.create()
    print(thread)
    ```
    </Tab>
    <Tab title="Javascript">
    ```js
    import { Client } from "@langchain/langgraph-sdk";

    const client = new Client({ apiUrl: <DEPLOYMENT_URL> });
    // Using the graph deployed with the name "agent"
    const assistantId = "agent";
    // create thread
    const thread = await client.threads.create();
    console.log(thread);
    ```
    </Tab>
    <Tab title="cURL">
    ```bash
    curl --request POST \
        --url <DEPLOYMENT_URL>/assistants/search \
        --header 'Content-Type: application/json' \
        --data '{
            "limit": 10,
            "offset": 0
        }' | jq -c 'map(select(.config == null or .config == {})) | .[0].graph_id' && \
    curl --request POST \
        --url <DEPLOYMENT_URL>/threads \
        --header 'Content-Type: application/json' \
        --data '{}'
    ```
    </Tab>
</Tabs>

输出：

```
{
'thread_id': '9dde5490-2b67-47c8-aa14-4bfec88af217',
'created_at': '2024-08-30T23:07:38.242730+00:00',
'updated_at': '2024-08-30T23:07:38.242730+00:00',
'metadata': {},
'status': 'idle',
'config': {},
'values': None
}
```

## 线程上的 Cron 作业

要创建与特定线程关联的 cron 作业，您可以编写：

<Tabs>
    <Tab title="Python">
    ```python
    # This schedules a job to run at 15:27 (3:27PM) UTC every day
    cron_job = await client.crons.create_for_thread(
        thread["thread_id"],
        assistant_id,
        schedule="27 15 * * *",
        input={"messages": [{"role": "user", "content": "What time is it?"}]},
    )
    ```
    </Tab>
    <Tab title="Javascript">
    ```js
    // This schedules a job to run at 15:27 (3:27PM) UTC every day
    const cronJob = await client.crons.create_for_thread(
      thread["thread_id"],
      assistantId,
      {
        schedule: "27 15 * * *",
        input: { messages: [{ role: "user", content: "What time is it?" }] }
      }
    );
    ```
    </Tab>
    <Tab title="cURL">
    ```bash
    curl --request POST \
        --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/crons \
        --header 'Content-Type: application/json' \
        --data '{
            "assistant_id": <ASSISTANT_ID>,
        }'
    ```
    </Tab>
</Tabs>请注意，删除不再有用的`Cron`作业**非常**重要。否则，您可能会向 LLM 收取不必要的 API 费用！您可以使用以下代码删除`Cron`作业：

<Tabs>
    <Tab title="Python">
    ```python
    await client.crons.delete(cron_job["cron_id"])
    ```
    </Tab>
    <Tab title="Javascript">
    ```js
    await client.crons.delete(cronJob["cron_id"]);
    ```
    </Tab>
    <Tab title="cURL">
    ```bash
    curl --request DELETE \
        --url <DEPLOYMENT_URL>/runs/crons/<CRON_ID>
    ```
    </Tab>
</Tabs>

## Cron 作业无状态

您还可以使用以下代码创建无状态 cron 作业。无状态 cron 作业为每次执行创建一个新线程：

<Tabs>
    <Tab title="Python">
    ```python
    # This schedules a job to run at 15:27 (3:27PM) UTC every day
    cron_job_stateless = await client.crons.create(
        assistant_id,
        schedule="27 15 * * *",
        input={"messages": [{"role": "user", "content": "What time is it?"}]},
    )
    ```
    </Tab>
    <Tab title="Javascript">
    ```js
    // This schedules a job to run at 15:27 (3:27PM) UTC every day
    const cronJobStateless = await client.crons.create(
      assistantId,
      {
        schedule: "27 15 * * *",
        input: { messages: [{ role: "user", content: "What time is it?" }] }
      }
    );
    ```
    </Tab>
    <Tab title="cURL">
    ```bash
    curl --request POST \
        --url <DEPLOYMENT_URL>/runs/crons \
        --header 'Content-Type: application/json' \
        --data '{
            "assistant_id": <ASSISTANT_ID>,
        }'
    ```
    </Tab>
</Tabs>

再次强调，完成工作后请记得将其删除！

<Tabs>
    <Tab title="Python">
    ```python
    await client.crons.delete(cron_job_stateless["cron_id"])
    ```
    </Tab>
    <Tab title="Javascript">
    ```js
    await client.crons.delete(cronJobStateless["cron_id"]);
    ```
    </Tab>
    <Tab title="cURL">
    ```bash
    curl --request DELETE \
        --url <DEPLOYMENT_URL>/runs/crons/<CRON_ID>
    ```
    </Tab>
</Tabs>

## 无状态 cron 的线程清理

<Note>
此功能需要 LangGraph API 版本 **0.5.18** 或更高版本以及 Python SDK **0.3.2** 或更高版本，或者 JavaScript SDK **1.4.0** 或更高版本。
</Note>

每次触发无状态 cron 时，都会创建一个新线程。使用 `on_run_completed` 参数控制运行完成后该线程发生的情况：- **`"delete"`**（默认）：运行完成后自动删除线程。
- **`"keep"`**：保留线程以供以后检索。您负责清理这些线程。推荐方法请参见[how to add TTLs to your application](/langsmith/configure-ttl)。

### 示例：保留线程以供以后检索

<Tabs>
    <Tab title="Python">
    ```python
    # Create a stateless cron that keeps threads after execution.
    # Configure checkpointer.ttl in langgraph.json to auto-delete old threads.
    # See: https://docs.langchain.com/langsmith/configure-ttl
    cron_job = await client.crons.create(
        assistant_id,
        schedule="27 15 * * *",
        input={"messages": [{"role": "user", "content": "Daily report"}]},
        on_run_completed="keep"
    )

    # You can later retrieve the runs and their results
    runs = await client.runs.search(
        metadata={"cron_id": cron_job["cron_id"]}
    )
    ```
    </Tab>
    <Tab title="Javascript">
    ```js
    // Create a stateless cron that keeps threads after execution.
    // Configure checkpointer.ttl in langgraph.json to auto-delete old threads.
    // See: https://docs.langchain.com/langsmith/configure-ttl
    const cronJob = await client.crons.create(
      assistantId,
      {
        schedule: "27 15 * * *",
        input: { messages: [{ role: "user", content: "Daily report" }] },
        onRunCompleted: "keep"
      }
    );

    // You can later retrieve the runs and their results
    const runs = await client.runs.search({
      metadata: { cron_id: cronJob["cron_id"] }
    });
    ```
    </Tab>
    <Tab title="cURL">
    ```bash
    # Create a stateless cron that keeps threads after execution.
    # Configure checkpointer.ttl in langgraph.json to auto-delete old threads.
    # See: https://docs.langchain.com/langsmith/configure-ttl
    curl --request POST \
        --url <DEPLOYMENT_URL>/runs/crons \
        --header 'Content-Type: application/json' \
        --data '{
            "assistant_id": "<ASSISTANT_ID>",
            "schedule": "27 15 * * *",
            "input": {"messages": [{"role": "user", "content": "Daily report"}]},
            "on_run_completed": "keep"
        }'
    ```
    </Tab>
</Tabs>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/cron-jobs.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>