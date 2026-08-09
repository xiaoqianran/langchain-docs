<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Collect feedback with presigned URLs | https://docs.langchain.com/langsmith/presigned-feedback-tokens -->

# 使用预先签名的 URL 收集反馈

使用预签名的反馈令牌从客户端应用程序收集用户反馈，而无需暴露您的 LangSmith API 密钥。

预签名的反馈令牌可让您从客户端应用程序（浏览器、移动应用程序等）收集[feedback](/langsmith/observability-concepts#feedback)，而无需暴露您的[LangSmith API key](/langsmith/create-account-api-key)。每个令牌都会生成一个范围为特定 [run](/langsmith/observability-concepts#runs) 的 URL 和反馈密钥。客户端通过直接调用该 URL 来提交反馈，无需身份验证。

这在以下情况下很有用：

* 您的前端收集最终用户的赞成/反对或星级评级。
* 您想要在电子邮件、Slack 消息或其他外部渠道中嵌入反馈链接。
* 您需要将反馈收集与后端分离。

<Note>
  如果您使用 [Agent Server](/langsmith/agent-server)，则当您在运行请求中包含 `feedback_keys` 时，会自动生成预签名反馈 URL。对于该工作流程，请参阅[Collect user feedback for Agent Server runs](/langsmith/agent-server-feedback)。
</Note>

## 创建一个预签名的反馈令牌

使用 [⟦T14⟧](https://reference.langchain.com/python/langsmith/client/Client/create_presigned_feedback_token) / [⟦T15⟧](https://reference.langchain.com/javascript/classes/langsmith.client.Client.html#createpresignedfeedbacktoken) 为特定运行和反馈密钥生成令牌。返回的对象包含一个`url`，客户端可以调用它来提交反馈：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client

  client = Client()

  run_id = "<run_id>"

  token = client.create_presigned_feedback_token(
      run_id,
      feedback_key="user_score",
  )

  print(token.url)
  # https://api.smith.langchain.com/api/v1/feedback/tokens/<token_id>
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";

  const client = new Client();

  const runId = "<run_id>";

  const token = await client.createPresignedFeedbackToken(runId, "user_score");

  console.log(token.url);
  // https://api.smith.langchain.com/api/v1/feedback/tokens/<token_id>
  ```
</CodeGroup>

### 设置令牌过期时间默认情况下，令牌会在 3 小时后过期。传递 `expiration` 以使用 `timedelta`（相对）或 `datetime`（绝对）进行自定义：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import datetime
  from langsmith import Client

  client = Client()

  run_id = "<run_id>"

  token = client.create_presigned_feedback_token(
      run_id,
      feedback_key="user_score",
      expiration=datetime.timedelta(hours=24),
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";

  const client = new Client();

  const runId = "<run_id>";

  const token = await client.createPresignedFeedbackToken(runId, "user_score", {
    expiration: { hours: 24 },
  });
  ```
</CodeGroup>

### 约束反馈值

通过 `feedback_config` 来限制客户端可以提交的值。这对于执行特定的反馈模式非常有用（例如，赞成/反对、1-5 颗星或分类标签）：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client

  client = Client()

  run_id = "<run_id>"

  token = client.create_presigned_feedback_token(
      run_id,
      feedback_key="user_score",
      feedback_config={
          "type": "continuous",
          "min": 0,
          "max": 1,
      },
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";

  const client = new Client();

  const runId = "<run_id>";

  const token = await client.createPresignedFeedbackToken(runId, "user_score", {
    feedbackConfig: {
      type: "continuous",
      min: 0,
      max: 1,
    },
  });
  ```
</CodeGroup>

### 批量创建令牌（仅限Python）

使用 `create_presigned_feedback_tokens`（复数）在一次调用中为多个反馈键生成令牌：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client

client = Client()

run_id = "<run_id>"

tokens = client.create_presigned_feedback_tokens(
    run_id,
    feedback_keys=["thumbs_up", "thumbs_down"],
)

for token in tokens:
    print(f"{token.id}: {token.url}")
```

## 使用预先签名的 URL 提交反馈

一旦您拥有预签名的 URL，您的前端代码或电子邮件客户端就会通过向其发送 `POST` 或 `GET` 请求来提交反馈。 URL 不需要 API 密钥或身份验证，因为令牌提供授权。

默认情况下，预签名 URL 反馈将基本保留跟踪扩展到扩展保留。预签名 URL 没有选择退出参数。对于完全保留模型，请参阅[data retention auto-upgrades](/langsmith/usage-and-billing#data-retention-auto-upgrades)。

### POST 请求

当用户与反馈控件交互时（例如，单击竖起大拇指按钮），请在前端使用`POST`。 `POST`支持`score`、`value`、`comment`、`correction`和`metadata`字段。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl --request POST \
  --url "https://api.smith.langchain.com/api/v1/feedback/tokens/<token_id>" \
  --header "Content-Type: application/json" \
  --data '{
    "score": 1,
    "comment": "This response was helpful!"
  }'
```

### 获取请求在电子邮件或 Slack 消息中嵌入反馈链接时使用 `GET`。用户的点击触发请求。 `GET` 支持`score`、`value`、`comment`、`correction` 作为查询参数。 `GET` 不支持`metadata`。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl --request GET \
  --url "https://api.smith.langchain.com/api/v1/feedback/tokens/<token_id>?score=1&comment=This%20response%20was%20helpful!"
```

### 使用 SDK 提交反馈

您还可以使用 SDK 提交来自预签名令牌的反馈，这对于您从其他服务接收令牌 URL 的服务器端工作流程非常有用。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client

  client = Client()

  client.create_feedback_from_token(
      "<token_or_url>",
      score=1,
      comment="This response was helpful!",
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // Use a direct HTTP request to the presigned URL
  await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      score: 1,
      comment: "This response was helpful!",
    }),
  });
  ```
</CodeGroup>

## 列出现有代币

使用 `list_presigned_feedback_tokens` / `listPresignedFeedbackTokens` 检索运行的所有预签名反馈令牌。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client

  client = Client()

  run_id = "<run_id>"

  for token in client.list_presigned_feedback_tokens(run_id):
      print(f"ID: {token.id}, URL: {token.url}, Expires: {token.expires_at}")
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";

  const client = new Client();

  const runId = "<run_id>";

  for await (const token of client.listPresignedFeedbackTokens(runId)) {
    console.log(`URL: ${token.url}, Expires: ${token.expires_at}`);
  }
  ```
</CodeGroup>

## 相关

* [Reference guide on feedback data format](/langsmith/feedback-data-format)
* [Log feedback using the SDK](/langsmith/attach-user-feedback)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/presigned-feedback-tokens.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>