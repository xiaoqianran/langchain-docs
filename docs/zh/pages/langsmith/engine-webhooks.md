<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Engine webhook events | https://docs.langchain.com/langsmith/engine-webhooks -->

# LangSmith 引擎 webhook 事件

LangSmith 引擎在创建问题或将新跟踪链接到现有问题时发送的 webhook 事件的参考。

将 LangSmith 检测到的代理问题转发到您的事件管理、寻呼或聊天工具中。当[LangSmith Engine](/langsmith/engine)打开新问题或将新跟踪链接到已打开的问题时，它会向您的端点发送 webhook 事件。

要配置 Webhook 订阅，请打开跟踪项目的 **Engine** 选项卡上的 **Engine Settings** 面板。参见[Configure Engine](/langsmith/engine#configure-engine)。

<Note>
  目标传送到 Webhook URL 或 **Slack 通道**。两者都使用本页所述的相同 [event types](#event-types) 和 [minimum-priority filtering](#severity-filtering)。 Slack 目的地通过 LangSmith 的托管 Slack 应用程序发布，而不是发送下面的 [JSON payload](#event-envelope)，因此 [signing secret](#signing-secret) 和 [custom headers](#custom-headers) 不适用。

  要设置 Slack 交付，请参阅 [Notify a Slack channel](/langsmith/engine#notify-a-slack-channel)。本页的其余部分记录了 **webhook URL** 目的地。
</Note>

## 送货

LangSmith 将带有 JSON 正文的 `POST` 请求发送到您的 Webhook URL。该请求使用 `Content-Type: application/json` 并包含您附加到订阅的任何自定义标头。|物业 |价值|
| ---------| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|方法| `POST` |
|身体| JSON，下面[common envelope](#event-envelope) |
|方案|接受`http://`和`https://`。 `https://`强烈推荐||签名| `X-LangSmith-Signature` 标头，使用订阅的签名密钥进行签名 |
|超时|每次尝试 20 秒 |
|尝试|针对传输错误、HTTP `408`、`425`、`429` 和任何 HTTP `5xx`，最多进行 4 次尝试（1 次初始加 3 次指数退避重试）。其他 `4xx` 响应被视为永久响应，不会重试 |
|回应 |成功仅根据状态代码确定。响应主体被忽略。                                                                                                                             |

<Note>
  重试会传递字节相同的有效负载，包括相同的`id`。在 `id` 上进行重复数据删除，因此重试传送不会产生重复的下游影响。
</Note>

### 自定义标头您可以将任意标头附加到每个订阅（例如，`Authorization: Bearer …`）以对端点上的调用者进行身份验证。 `Content-Type` 始终由 LangSmith 设置且不能被覆盖。

### 签名秘密

每个订阅都有一个签名秘密。 LangSmith 使用此密钥对原始 Webhook 请求正文进行签名，并在 `X-LangSmith-Signature` 标头中发送结果。

标头值的格式如下：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sha256=<hex-encoded HMAC-SHA256 digest>
```

在解析或作用于有效负载之前验证签名。 HMAC 输入是确切的原始请求正文字节，HMAC 密钥是订阅的签名秘密。在验证之前不要解析和重新序列化 JSON 主体。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import hashlib
  import hmac
  from typing import Optional


  def verify_langsmith_signature(
      *,
      body: bytes,
      signing_secret: str,
      signature_header: Optional[str],
  ) -> bool:
      if not signature_header or not signature_header.startswith("sha256="):
          return False

      expected = "sha256=" + hmac.new(
          signing_secret.encode("utf-8"),
          body,
          hashlib.sha256,
      ).hexdigest()

      return hmac.compare_digest(expected, signature_header)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createHmac, timingSafeEqual } from "node:crypto";

  export function verifyLangSmithSignature({
    body,
    signingSecret,
    signatureHeader,
  }: {
    body: Buffer;
    signingSecret: string;
    signatureHeader: string | undefined;
  }) {
    if (!signatureHeader?.startsWith("sha256=")) {
      return false;
    }

    const expected = `sha256=${createHmac("sha256", signingSecret)
      .update(body)
      .digest("hex")}`;

    const expectedBytes = Buffer.from(expected);
    const actualBytes = Buffer.from(signatureHeader);

    return (
      expectedBytes.length === actualBytes.length &&
      timingSafeEqual(expectedBytes, actualBytes)
    );
  }
  ```
</CodeGroup>

### 滚动签名秘密

当签名密钥可能已暴露时，或者当您的组织的凭据轮换策略需要新密钥时，滚动签名密钥。

要滚动密钥，请在 **引擎设置** 中打开订阅行，单击 **滚动签名密钥**，然后确认。 LangSmith 生成一个新的签名密钥，并立即将其用于未来的 Webhook 交付。一旦滚动完成，先前的秘密就会停止签署交付。

滚动秘密后，用新值更新每个验证 `X-LangSmith-Signature` 的消费者。### 严重性过滤

每个订阅都有一个从 `0` 到 `3` 的 `severity_threshold`。对于问题事件，只有当问题的`severity`小于或等于阈值时才会下发事件。数字越低，情况越紧急。

|严重程度 |意义|
| -------- | -------- |
| `0` |紧急|
| `1` |高|
| `2` |中等|
| `3` |低|

例如，具有 `severity_threshold: 1` 的订阅仅接收 `URGENT` (0) 和 `HIGH` (1) 问题的事件。

严重性阈值不适用于[⟦T36⟧](#issue-agent_run-failed)，因为运行失败事件的范围仅限于引擎会话而不是特定问题。

### 事件类型过滤

每个订阅都指定它想要接收的[event types](#event-types)。没有显式列表创建的订阅默认为 `["issue.created"]`。

## 活动信封

传递到端点的每个事件都使用相同的外部 JSON 形状。|领域 |类型 |描述 |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id` | UUID |本次交付的唯一标识符。重试后保持稳定。用它来删除重复数据。                                                                            |
| `type` |字符串|事件类型。 [⟦T40⟧](#issue-created)、[⟦T41⟧](#issue-trace-added) 或 [⟦T42⟧](#issue-agent_run-failed) 之一。 |
| `created` |整数 |事件排队时的 Unix 秒 (UTC)。                                                                                                          |
| `request_id` | UUID |由同一上游操作触发的每个事件共享。参见[Batch coalescing](#batch-coalescing)。                                                    |
| `data` |对象|事件有效负载。始终包含`data.object`。仅在 [⟦T48⟧](#issue-trace-added) 事件中包含 [⟦T47⟧](#data-trace)。             |

### 问题`data.object`对于 [⟦T50⟧](#issue-created) 和 [⟦T51⟧](#issue-trace-added)，`data.object` 是问题的快照。将其视为事件生成时问题的权威状态。

|领域 |类型 |描述 |
| -------------- | -------- | ------------------------------------------------------------------------------------------ |
| `id` | UUID |问题 ID。                                                                      |
| `name` |字符串|问题的简短标题。                                                      |
| `description` |字符串|人类可读的描述。                                                    |
| `severity` |整数 | `0`（紧急）至 `3`（低）。参见[Severity filtering](#severity-filtering)。 |
| `tenant_id` | UUID |问题所属的工作区。                                                |
| `tenant_name` |字符串|工作区显示名称。                                                        |
| `session_id` | UUID |跟踪问题所属的项目。                                          |
| `session_name` |字符串|跟踪项目名称。                                                          || `url` |字符串| LangSmith UI 中问题的深层链接。                                    |

### 运行失败`data.object`

对于 [⟦T65⟧](#issue-agent_run-failed)，`data.object` 描述失败的引擎运行。

|领域|类型 |描述 |
| ---------------- | ------ | -------------------------------------------------------------------- |
| `tenant_id` | UUID |运行所属的工作空间。                             |
| `tenant_name` |字符串 |工作区显示名称。                                   |
| `session_id` | UUID |跟踪运行所属的项目。                       |
| `session_name` |字符串 |跟踪项目名称。                                     |
| `url` |字符串 | UI 中 LangSmith 项目的深层链接。             |
| `thread_id` |字符串 |引擎线程ID。                                         |
| `run_id` |字符串 |发动机运行 ID。不可用时省略。                  |
| `status` |字符串 |最终运行状态。                                         |
| `error_message` |字符串 |运行失败的错误文本。不可用时省略。 |
| `occurred_at` |字符串 |发生故障时的 RFC 3339 时间戳。          |### `data.trace`

`data.trace` 仅包含在 [⟦T79⟧](#issue-trace-added) 活动中。

|领域 |类型 |描述 |
| ------------ | -------------- | ---------------------------------------------------------------------------------- |
| `run_id` | UUID |与问题关联的运行的 ID。                           |
| `trace_id` | UUID |包含运行的跟踪的 ID。                                |
| `start_time` |字符串|运行开始时的 RFC 3339 时间戳。                           |
| `comment` |字符串\|空 |链接跟踪时记录的可选注释。空时省略。 |

### 批量合并

单个上游操作可以生成多个 Webhook 事件。当引擎打开一个新问题并向其附加五个跟踪时，您会收到一个 [⟦T84⟧](#issue-created) 事件和五个 [⟦T85⟧](#issue-trace-added) 事件，所有事件共享相同的 `request_id`。使用 `request_id` 将它们分组为单个下游通知。

## 事件类型

下面的事件类型是 LangSmith 引擎今天发送的完整事件类型。将来可能会添加新类型，因此处理程序应该忽略未知的 `type` 值而不是失败。

### `issue.created`当 LangSmith Engine 创建新问题时发送。 `data.trace` 被省略。

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "id": "b91c1f0e-7c4a-4f53-9d3e-9f1c8e7a2b10",
  "type": "issue.created",
  "created": 1747238400,
  "request_id": "0d2f4f6a-2a3a-4b6e-9b87-5d5b6e8c9a01",
  "data": {
    "object": {
      "id": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "name": "Tool selection inconsistency",
      "description": "Agent repeatedly calls the search tool with identical arguments before terminating.",
      "severity": 1,
      "tenant_id": "11111111-2222-3333-4444-555555555555",
      "tenant_name": "Acme Workspace",
      "session_id": "66666666-7777-8888-9999-aaaaaaaaaaaa",
      "session_name": "prod-api",
      "url": "https://smith.langchain.com/o/11111111-2222-3333-4444-555555555555/projects/p/66666666-7777-8888-9999-aaaaaaaaaaaa?tab=5&issue=9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d"
    }
  }
}
```

### `issue.trace.added`

当新跟踪链接到现有问题时发送。 `data.trace` 描述链接的跟踪。

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "id": "c02e3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b",
  "type": "issue.trace.added",
  "created": 1747238410,
  "request_id": "0d2f4f6a-2a3a-4b6e-9b87-5d5b6e8c9a01",
  "data": {
    "object": {
      "id": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "name": "Tool selection inconsistency",
      "description": "Agent repeatedly calls the search tool with identical arguments before terminating.",
      "severity": 1,
      "tenant_id": "11111111-2222-3333-4444-555555555555",
      "tenant_name": "Acme Workspace",
      "session_id": "66666666-7777-8888-9999-aaaaaaaaaaaa",
      "session_name": "prod-api",
      "url": "https://smith.langchain.com/o/11111111-2222-3333-4444-555555555555/projects/p/66666666-7777-8888-9999-aaaaaaaaaaaa?tab=5&issue=9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d"
    },
    "trace": {
      "run_id": "f1e2d3c4-b5a6-9788-6655-44332211ffee",
      "trace_id": "abcdefab-1234-5678-9abc-def012345678",
      "start_time": "2026-05-14T12:30:00Z",
      "comment": "Reproduces the same tool-loop pattern."
    }
  }
}
```

### `issue.agent_run.failed`

当 LangSmith 引擎无法完成运行时发送。此事件是会话范围的，因此它不包括 `data.trace` 并且不使用严重性过滤。

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "id": "4d0e8db2-81e6-4491-b8e5-b13a8f5afc0d",
  "type": "issue.agent_run.failed",
  "created": 1747238500,
  "request_id": "f6bbd48a-0386-403d-9344-31051264b45f",
  "data": {
    "object": {
      "tenant_id": "11111111-2222-3333-4444-555555555555",
      "tenant_name": "Acme Workspace",
      "session_id": "66666666-7777-8888-9999-aaaaaaaaaaaa",
      "session_name": "prod-api",
      "url": "https://smith.langchain.com/o/11111111-2222-3333-4444-555555555555/projects/p/66666666-7777-8888-9999-aaaaaaaaaaaa",
      "thread_id": "thread-123",
      "run_id": "run-456",
      "status": "error",
      "error_message": "RuntimeError: missing API key",
      "occurred_at": "2026-05-14T12:45:00Z"
    }
  }
}
```

## 测试你的端点

在将真实订阅指向端点之前，请发送示例有效负载以验证其在 20 秒超时内接受并确认：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -X POST https://your-endpoint.example.com/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $WEBHOOK_SECRET" \
  -d @sample-issue-created.json
```

使用 [⟦T95⟧](#issue-created) 中的示例正文作为 `sample-issue-created.json`。验证：

* 自定义 `Authorization` 标头到达并与您在订阅上配置的机密相匹配。
* 处理程序保留由其 `id` 键入的事件，以便重试被删除。
* 处理程序在开始缓慢的下游工作之前返回`2xx`。

＃＃ 安全* Webhook URL 在创建订阅时进行验证，并在交付时再次进行验证。私有和元数据 IP 范围在 SaaS 中被阻止。 `http://`和`https://`均可接受；使用`https://`，因此有效负载和任何自定义标头不会以明文形式发送。
* LangSmith 使用订阅的签名密钥对 Webhook 主体进行签名。在处理有效负载之前验证`X-LangSmith-Signature`。
* 您还可以在订阅上设置自定义标头，例如`Authorization: Bearer …`，以便在端点进行路由或附加身份验证。
* 对事件 `id` 进行重复数据删除，以便重试传送不会导致重复通知。

## 最佳实践

* **快速确认。** 一旦您坚持该事件，请立即使用 `2xx` 进行响应。将缓慢的工作（扇出、分页、下游 API 调用）移至队列中，以便您的处理程序保持在 20 秒超时范围内。
* **容忍未知事件类型。** 忽略处理程序无法识别的 `type` 值。可能会添加新的事件类型，恕不另行通知。
* **容忍新字段。** 使用宽松的模式解析有效负载。新字段可能会添加到现有事件类型中，恕不另行通知。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-webhooks.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>