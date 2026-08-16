<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to collect user feedback for Agent Server runs | https://docs.langchain.com/langsmith/agent-server-feedback -->

# 如何收集代理服务器运行的用户反馈

本教程向您展示如何收集 [Agent Server](/langsmith/agent-server) 运行的用户反馈，并自动将其链接到 LangSmith 中的 [traces](/langsmith/observability-concepts#traces)。创建运行时，请将键包含在请求正文的 `feedback_keys` 字段中。响应将返回每个密钥的预签名 URL，您的客户端可以使用该 URL 来收集代理服务器运行的用户反馈。

LangSmith 使用反馈来不断改进代理的实施。要了解有关LangSmith中反馈如何工作的更多信息，请参阅[LangSmith feedback](/langsmith/observability-concepts#feedback)。

## 它是如何工作的

1. 创建一个运行并在请求正文中包含 `feedback_keys`。例如，调用`POST /threads/{thread_id}/runs/stream`时，将请求体中的`feedback_keys`设置为：
    ```
    ["user_liked", "user_disliked"]
    ```
2. 响应中的 `feedback` 对象包含每个密钥的预签名 URL。例如，`feedback`对象是：
    ```
    {
        "user_liked": "https://api.smith.langchain.com/api/v1/feedback/tokens/ef19fedf-dcac-4cbb-a59c-00661efd6425",
        "user_disliked": "https://api.smith.langchain.com/api/v1/feedback/tokens/e952734e-c0a0-417b-a04d-fc2209691ed5"
    }
    ```
3. 请求返回的 URL（例如 `POST /api/v1/feedback/tokens/{token_id}`）将反馈密钥与代理服务器运行生成的跟踪关联起来。欲了解更多详情，请参阅[LangSmith API reference](/langsmith/smith-api-ref)。
4. LangSmith 使用所选反馈键（例如 `user_liked` 或 `user_disliked`）将提交的反馈与运行关联起来。

## 使用 `feedback_keys` 调用流式运行 API

创建一个运行并从响应中解析 `feedback` 对象。

<Tabs>
<Tab title="Python SDK">

```python
from langgraph_sdk import get_client

client = get_client(url="<DEPLOYMENT_URL>", api_key="<API_KEY>")

thread = await client.threads.create()
thread_id = thread["thread_id"]

feedback_urls = {}

async for event in client.runs.stream(
    thread_id,
    "agent",
    input={
        "messages": [
            {"role": "user", "content": "Tell me a joke about databases."}
        ]
    },
    stream_mode="updates",
    feedback_keys=["user_liked", "user_disliked"],
):
    if event.event == "feedback":
        # Example: {"user_liked": ".../feedback/tokens/<id>", "user_disliked": "..."}
        feedback_urls = event.data
        print("Feedback URLs:", feedback_urls)
    elif event.event == "updates":
        print(event.data)
```</Tab>
<Tab title="JavaScript SDK">

```javascript
import { Client } from "@langchain/langgraph-sdk";

const client = new Client({ apiUrl: "<DEPLOYMENT_URL>", apiKey: "<API_KEY>" });

const thread = await client.threads.create();
const threadId = thread.thread_id;

let feedbackUrls = {};

const streamResponse = client.runs.stream(threadId, "agent", {
  input: {
    messages: [{ role: "user", content: "Tell me a joke about databases." }],
  },
  streamMode: "updates",
  feedbackKeys: ["user_liked", "user_disliked"],
});

for await (const event of streamResponse) {
  if (event.event === "feedback") {
    // Example: { user_liked: ".../feedback/tokens/<id>", user_disliked: "..." }
    feedbackUrls = event.data;
    console.log("Feedback URLs:", feedbackUrls);
  } else if (event.event === "updates") {
    console.log(event.data);
  }
}
```

</Tab>
<Tab title="cURL">

```bash
curl --request POST \
  --url "<DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/stream" \
  --header "Content-Type: application/json" \
  --header "x-api-key: <API_KEY>" \
  --data '{
    "assistant_id": "agent",
    "input": {
      "messages": [
        {
          "role": "user",
          "content": "Tell me a joke about databases."
        }
      ]
    },
    "stream_mode": "updates",
    "feedback_keys": ["user_liked", "user_disliked"]
  }'
```

</Tab>
</Tabs>

## 处理流式传输的 `feedback` 事件

该流发出一个 `feedback` 事件，如下所示：

```text
event: feedback
data: {"user_liked":"https://api.smith.langchain.com/api/v1/feedback/tokens/ef19fedf-dcac-4cbb-a59c-00661efd6425", "user_disliked": "https://api.smith.langchain.com/api/v1/feedback/tokens/e952734e-c0a0-417b-a04d-fc2209691ed5"}
```

`data` 中的每个键都与您在 `feedback_keys` 中传递的值之一匹配。每个值都是生成的 URL，您的客户端可以调用该 URL 来提交该运行的反馈。

## 使用生成的 URL 提交反馈

当用户选择反馈选项时，`POST`到相应的URL。还支持`GET`。更多详情请参阅[LangSmith API reference](/langsmith/smith-api-ref)。

例如，如果用户单击“拇指朝下”按钮，则调用 `user_disliked` URL：

<Tabs>
<Tab title="POST">
```bash
curl --request POST \
  --url "https://api.smith.langchain.com/api/v1/feedback/tokens/e952734e-c0a0-417b-a04d-fc2209691ed5" \
  --header "Content-Type: application/json" \
  --data '{
    "score": 1,
    "value": 0,
    "comment": "I didn't like this joke because it didn't make me laugh.",
    "correction": {},
    "metadata": {}
  }'
```
</Tab>
<Tab title="GET">
`GET` 不支持`metadata`。
```bash
curl --request GET \
  --url "https://api.smith.langchain.com/api/v1/feedback/tokens/e952734e-c0a0-417b-a04d-fc2209691ed5?score=1&value=0&comment=I%20didn%27t%20like%20this%20joke%20because%20it%20didn%27t%20make%20me%20laugh.&correction=%7B%7D"
```
</Tab>
</Tabs>

该请求成功后，LangSmith使用密钥`user_disliked`记录跟踪反馈。

## 优化反馈数据模型

`user_liked` 和 `user_disliked` 键也可以在单个键（例如 `user_score`）下建模。

例如：

- 将 `key="user_score"` 与 `score=1` 结合使用来获得 `user_liked`
- 将 `key="user_score"` 与 `score=-1` 一起用于 `user_disliked`

这可以简化分析，因为所有用户偏好信号都被分组在一个反馈键下。反馈数据模型很灵活，应该根据您的用例进行设计。例如，某些应用程序可能更喜欢单独的布尔样式键（`user_liked`、`user_disliked`），而其他应用程序可能更喜欢单个数字分数（`user_score`）或具有多个反馈键的更丰富的标题。

## 在客户端 UI 中进行生产

生产化解决方案将通过前端公开生成的反馈 URL，而不是手动调用它们。

高级实现示例：

1. 从后端或前端创建运行。
2. 捕获`feedback`对象并存储返回的URL。
3. 渲染反馈控件，例如“向上/向下”按钮和反馈表单。
4. 反馈提交时，`POST`或`GET`基于用户反馈意图的反馈URL。
5. 可以选择在提交后禁用反馈控件并向用户显示确认。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/agent-server-feedback.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>