<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use webhooks | https://docs.langchain.com/langsmith/use-webhooks -->

# 使用网络钩子

Webhook 支持从 LangSmith 应用程序到外部服务的事件驱动通信。例如，您可能希望在对 LangSmith 的 API 调用完成运行后发布对单独服务的更新。

许多 LangSmith 端点接受 `webhook` 参数。如果此参数由可以接受 POST 请求的端点指定，LangSmith 将在运行完成时发送请求。

使用 LangSmith 时，您可能希望使用 Webhooks 在 API 调用完成后接收更新。 Webhooks 对于在运行完成处理后触发服务中的操作非常有用。为了实现这一点，您需要公开一个可以接受 `POST` 请求的端点，并将该端点作为 API 请求中的 `webhook` 参数传递。

目前，SDK 不提供对定义 Webhook 端点的内置支持，但您可以使用 API 请求手动指定它们。

## 支持的端点

以下 API 端点接受 `webhook` 参数：|运营| HTTP 方法 |端点 |
|----------------------|-------------------------|------------------------------------|
|创建运行 | `POST` | `/thread/{thread_id}/runs` |
|创建线程 Cron | `POST` | `/thread/{thread_id}/runs/crons` |
|流运行 | `POST` | `/thread/{thread_id}/runs/stream` |
|等待运行| `POST` | `/thread/{thread_id}/runs/wait` |
|创建 Cron | `POST` | `/runs/crons` |
|无状态流运行 | `POST` | `/runs/stream` |
|等待运行无状态| `POST` | `/runs/wait` |

在本指南中，我们将展示如何在流式传输运行后触发 Webhook。

## 设置你的助手和线程

在进行 API 调用之前，请设置您的助手和线程。

<Tabs>
    <Tab title="Python">
    ```python
    from langgraph_sdk import get_client

    client = get_client(url=<DEPLOYMENT_URL>)
    assistant_id = "agent"
    thread = await client.threads.create()
    print(thread)
    ```
    </Tab>
    <Tab title="JavaScript">
    ```js
    import { Client } from "@langchain/langgraph-sdk";

    const client = new Client({ apiUrl: <DEPLOYMENT_URL> });
    const assistantID = "agent";
    const thread = await client.threads.create();
    console.log(thread);
    ```
    </Tab>
    <Tab title="cURL">
    ```bash
    curl --request POST \
        --url <DEPLOYMENT_URL>/assistants/search \
        --header 'Content-Type: application/json' \
        --data '{ "limit": 10, "offset": 0 }' | jq -c 'map(select(.config == null or .config == {})) | .[0]' && \
    curl --request POST \
        --url <DEPLOYMENT_URL>/threads \
        --header 'Content-Type: application/json' \
        --data '{}'
    ```
    </Tab>
</Tabs>

响应示例：

```json
{
    "thread_id": "9dde5490-2b67-47c8-aa14-4bfec88af217",
    "created_at": "2024-08-30T23:07:38.242730+00:00",
    "updated_at": "2024-08-30T23:07:38.242730+00:00",
    "metadata": {},
    "status": "idle",
    "config": {},
    "values": null
}
```

## 使用 webhook 进行图形运行

要使用 Webhook，请在 API 请求中指定 `webhook` 参数。运行完成后，LangSmith 向指定的 Webhook URL 发送 `POST` 请求。

例如，如果您的服务器在 `https://my-server.app/my-webhook-endpoint` 侦听 Webhook 事件，请在您的请求中包含以下内容：<Tabs>
    <Tab title="Python">
    ```python
    input = { "messages": [{ "role": "user", "content": "Hello!" }] }

    async for chunk in client.runs.stream(
        thread_id=thread["thread_id"],
        assistant_id=assistant_id,
        input=input,
        stream_mode="events",
        webhook="https://my-server.app/my-webhook-endpoint"
    ):
        pass
    ```
    </Tab>
    <Tab title="JavaScript">
    ```js
    const input = { messages: [{ role: "human", content: "Hello!" }] };

    const streamResponse = client.runs.stream(
      thread["thread_id"],
      assistantID,
      {
        input: input,
        webhook: "https://my-server.app/my-webhook-endpoint"
      }
    );

    for await (const chunk of streamResponse) {
      // Handle stream output
    }
    ```
    </Tab>
    <Tab title="cURL">
    ```bash
    curl --request POST \
        --url <DEPLOYMENT_URL>/threads/<THREAD_ID>/runs/stream \
        --header 'Content-Type: application/json' \
        --data '{
            "assistant_id": <ASSISTANT_ID>,
            "input": {"messages": [{"role": "user", "content": "Hello!"}]},
            "webhook": "https://my-server.app/my-webhook-endpoint"
        }'
    ```
    </Tab>
</Tabs>

## Webhook 负载

LangSmith 以[Run](/langsmith/runs) 的格式发送 webhook 通知。请求负载包括运行输入、配置和`kwargs`字段中的其他元数据。除了标准运行字段之外，Webhook 负载还包括 `values`、`webhook_sent_at` 和 `error` 字段。

完整的 Webhook 负载包含以下字段：

|领域|类型 |描述 |
|--------|------|-------------|
| `run_id` | `string`（UUID）|运行的唯一标识符。 |
| `thread_id` | `string`（UUID）|运行所属线程的标识符。 |
| `assistant_id` | `string` |执行运行的助手的标识符。 |
| `status` | `string` |运行的最终状态（例如，`"success"`、`"error"`）。 |
| `created_at` | `string`（日期时间）|创建运行时的时间戳。 |
| `updated_at` | `string`（日期时间）|上次更新运行的时间戳。 |
| `run_started_at` | `string`（日期时间）|运行开始执行时的时间戳。 |
| `run_ended_at` | `string`（日期时间）|运行完成时的时间戳。如果运行尚未结束则省略。 |
| `webhook_sent_at` | `string`（日期时间）|发送 Webhook 请求时的时间戳。 || `metadata` | `JSON object` |与运行关联的自定义元数据。 |
| `kwargs` | `JSON object` |运行输入、配置和其他调用参数。 |
| `values` | `JSON object` |线程最新检查点的状态值。仅适用于有状态运行。 |
| `multitask_strategy` | `string` |用于运行的多任务策略。 |
| `error` | `JSON object \| null` |仅当运行失败时才出现。包含`error`（错误类型）和`message`（详细信息）字段。 |

有效负载示例：

```json
{
  "run_id": "1ef6a5b8-4457-6db0-8b15-cffd3797fa04",
  "thread_id": "9dde5490-2b67-47c8-aa14-4bfec88af217",
  "assistant_id": "agent",
  "status": "success",
  "created_at": "2024-08-30T23:07:38.242730+00:00",
  "updated_at": "2024-08-30T23:07:40.120000+00:00",
  "run_started_at": "2024-08-30T23:07:38.300000+00:00",
  "run_ended_at": "2024-08-30T23:07:40.100000+00:00",
  "webhook_sent_at": "2024-08-30T23:07:40.150000+00:00",
  "metadata": {},
  "kwargs": {
    "input": {
      "messages": [{"role": "user", "content": "Hello!"}]
    }
  },
  "values": {
    "messages": [
      {"role": "user", "content": "Hello!"},
      {"role": "assistant", "content": "Hi there! How can I help you today?"}
    ]
  },
  "multitask_strategy": "reject",
  "error": null
}
```

当运行失败时，`error`字段包含有关失败的详细信息：

```json
{
  "error": {
    "error": "TimeoutError",
    "message": "Run exceeded maximum execution time"
  }
}
```

## 安全网络钩子

为了确保只有授权请求才会到达您的 webhook 端点，请考虑添加安全令牌作为查询参数：

```
https://my-server.app/my-webhook-endpoint?token=YOUR_SECRET_TOKEN
```

您的服务器应在处理请求之前提取并验证此令牌。

## 将标头添加到 webhook 请求

<Note>
有`langgraph-api>=0.5.36`可供选择。
</Note>

您可以配置静态标头以包含在所有出站 Webhook 请求中。这对于身份验证、路由或将元数据传递到 Webhook 端点非常有用。

将 `webhooks.headers` 配置添加到您的 `langgraph.json` 文件中：

```json
{
  "webhooks": {
    "headers": {
      "X-Custom-Header": "my-value",
      "X-Environment": "production"
    }
  }
}
```

### 在标头中使用环境变量要包含机密或特定于环境的值而不将其签入配置文件，请使用 `${{ env.VAR }}` 模板语法：

```json
{
  "webhooks": {
    "headers": {
      "Authorization": "Bearer ${{ env.LG_WEBHOOK_TOKEN }}"
    }
  }
}
```

为了安全起见，默认只能引用以`LG_WEBHOOK_`开头的环境变量。这可以防止意外泄漏不相关的环境变量。您可以使用 `env_prefix` 自定义此前缀：

```json
{
  "webhooks": {
    "env_prefix": "MY_APP_",
    "headers": {
      "Authorization": "Bearer ${{ env.MY_APP_SECRET }}"
    }
  }
}
```

<Note>
缺少必需的环境变量将阻止服务器启动，确保您不会在配置不完整的情况下进行部署。
</Note>

## 限制 webhook 目标

<Note>
`langgraph-api>=0.5.36` 有售。
</Note>

出于安全或合规性目的，您可以使用 `webhooks.url` 配置限制哪些 URL 是有效的 Webhook 目标：

```json
{
  "webhooks": {
    "url": {
      "allowed_domains": ["*.mycompany.com", "api.trusted-service.com"],
      "require_https": true
    }
  }
}
```

可用选项：

|选项 |描述 |
|--------|-------------|
| `allowed_domains` |主机名白名单。支持子域的通配符（例如`*.mycompany.com`）。 |
| `require_https` |当 `true` 时拒绝 `http://` URL。 |
| `allowed_ports` |显式端口白名单。默认为 443 (https) 和 80 (http)。 |
| `disable_loopback` |当 `true` 时，禁止相对 URL（内部环回调用）。 |
| `max_url_length` |允许的最大 URL 长度（以字符为单位）。 |

## 禁用网络钩子

从 `langgraph-api>=0.2.78` 开始，开发者可以在 `langgraph.json` 文件中禁用 Webhook：

```json
{
  "http": {
    "disable_webhooks": true
  }
}
```此功能主要适用于自托管部署，其中平台管理员或开发人员可能更愿意禁用 Webhooks 以简化其安全状况，尤其是在他们不配置防火墙规则或其他网络控制的情况下。禁用 Webhook 有助于防止不受信任的负载发送到内部端点。

完整配置详情请参阅[configuration file reference](/langsmith/cli?h=disable_webhooks#configuration-file)。

## 测试网络钩子

您可以使用以下在线服务测试您的 webhook：

* **[Beeceptor](https://beeceptor.com/)** – 快速创建测试端点并检查传入的 Webhook 负载。
* **[Webhook.site](https://webhook.site/)** – 实时查看、调试和记录传入的 Webhook 请求。

这些工具可帮助您验证 LangSmith 是否正确触发 Webhook 并将其发送到您的服务。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/use-webhooks.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>