<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Engine notifications | https://docs.langchain.com/langsmith/engine-notifications -->

# LangSmith 引擎通知

[LangSmith Engine](/langsmith/engine) 可以在打开新问题、将新跟踪链接到现有问题或无法完成运行时通知您。将这些通知传送到 **Slack 通道**、**HTTP Webhook 端点**，或两者。每个目标都有自己的事件类型和最低优先级，因此您可以将紧急问题路由到寻呼 Webhook，同时将每个问题发送到 Slack 通道。

## 添加目的地

通知目标是根据跟踪项目配置的。在 **引擎** 页面上，单击 **配置引擎**，然后在 **通知** 下单击 **+ 添加目标**。对于每个目的地，选择：

- **交付至**：**Slack** 或 **Webhook**。参见[Notify a Slack channel](#notify-a-slack-channel)和[Send to a webhook](#send-to-a-webhook)。
- **通知时间**：触发通知的[event types](#event-types)。
- **最低优先级**：触发通知的最低问题[severity](#severity-filtering)。

要在 [watched issue](/langsmith/engine#watch-an-issue) 再次出现时收到警报，请单击该问题上的 **通过 Slack 提醒我**，这会打开相同的 **通知** 部分。

## 事件类型

|活动 |发送时间 |
| ---| ---|
| [⟦T7⟧](#issue-created) |引擎打开了一个新问题。 |
| [⟦T8⟧](#issue-trace-added) |引擎将新跟踪链接到现有问题。 |
| [⟦T9⟧](#issue-agent_run-failed) |引擎运行无法完成。 |这是引擎今天发送的完整事件类型集。将来可能会添加新类型。在没有显式事件类型列表的情况下创建的目的地仅接收`issue.created`。

## 严重性过滤

**最低优先级**设置存储为从 `0` 到 `3` 的 `severity_threshold`。对于问题事件，仅当问题的`severity`小于或等于阈值时才会发送通知。数字越低，情况越紧急。

|严重性 |意义|
| ---| ---|
| `0` |紧急|
| `1` |高|
| `2` |中等|
| `3` |低|

例如，具有 `severity_threshold: 1` 的目的地仅接收 `URGENT` (0) 和 `HIGH` (1) 问题的事件。

严重性阈值不适用于[⟦T22⟧](#issue-agent_run-failed)，因为运行失败事件的范围仅限于引擎会话而不是特定问题。

## 通知 Slack 通道<Steps>
  <Step title="Connect a Slack workspace">
    连接 Slack 工作区是您执行一次的组织级操作，而不是针对每个项目执行一次。连接或断开工作区需要 `organization:manage` 权限。在 [LangSmith console](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-engine-notifications) 中，打开 **设置**，转到组织的 **常规** 设置，然后在 **Slack** 下单击 **连接 Slack**。在 Slack 中授权 LangSmith 应用程序。您可以将多个 Slack 工作区连接到一个组织。
  </Step>
  <Step title="Add a Slack destination">
    在 **引擎** 页面上，单击 **配置引擎**，然后单击 **添加目标**。将 **Deliver to** 字段设置为 **Slack**，然后在 **Channel** 下选择工作区和通道。
  </Step>
  <Step title="Choose events and priority">
    在**通知时间**下，选择哪个 [event types](#event-types) 将消息发布到频道。在 **最低优先级**下，选择触发通知的最低优先级 [severity](#severity-filtering)。单击“**添加目的地**”进行保存。
  </Step>
</Steps>

LangSmith 自动加入您选择的公共频道。要发布到私人频道，请先在 Slack 中邀请 LangSmith 应用程序到该频道。每条 Slack 消息都包含问题标题、描述和严重性、返回到 LangSmith 的 **查看问题** 链接，以及（对于问题事件）问题随时间重复发生的图表。如果工作区的连接变得无效（例如，应用程序从 Slack 中删除），其目标将停止传送，直到您从组织的 **常规** 设置重新连接它。

Slack 目标通过 LangSmith 的托管 Slack 应用程序发布，而不是发送 [webhook payload](#webhook-payload-reference)，因此签名机密和自定义标头不适用。

## 发送到网络钩子

将引擎事件转发到您自己的事件管理、寻呼或聊天工具。添加目标并将 **传递到** 字段设置为 **Webhook**。输入 URL 和（可选）[custom headers](#custom-headers)。每份交货都是[signed](#signing-secret)，因此您可以验证其真实性。

### 送货

LangSmith 将带有 JSON 正文的 `POST` 请求发送到您的 Webhook URL。该请求使用 `Content-Type: application/json` 并包含您附加到目标的任何自定义标头。|物业 |价值|
| ---| ---|
|方法| `POST` |
|身体| JSON，下面[common envelope](#event-envelope) |
|方案|接受`http://`和`https://`。 `https://`强烈推荐|
|签名| `X-LangSmith-Signature` 标头，使用目的地的签名密钥进行签名 |
|超时|每次尝试 20 秒 |
|尝试|对于传输错误、HTTP `408`、`425`、`429` 和任何 HTTP `5xx`，最多进行 4 次尝试（1 次初始加 3 次指数退避重试）。其他 `4xx` 响应被视为永久响应，不会重试 |
|回应 |成功仅根据状态代码确定。响应主体被忽略。 |

<Note>
重试会传递字节相同的有效负载，包括相同的`id`。在 `id` 上进行重复数据删除，因此重试传送不会产生重复的下游影响。
</Note>

### 自定义标头

您可以将任意标头附加到每个目标（例如，`Authorization: Bearer …`）以对端点上的调用者进行身份验证。 `Content-Type` 始终由 LangSmith 设置并且不能被覆盖。

### 签名秘密

每个目的地都有一个签名秘密。 LangSmith 使用此密钥对原始 Webhook 请求正文进行签名，并将结果发送到 `X-LangSmith-Signature` 标头中。

标头值的格式如下：

```text
sha256=<hex-encoded HMAC-SHA256 digest>
```在解析或作用于有效负载之前验证签名。 HMAC 输入是确切的原始请求正文字节，HMAC 密钥是目标的签名秘密。在验证之前不要解析和重新序列化 JSON 主体。

<CodeGroup>

```python Python
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

```typescript TypeScript
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

要滚动密钥，请在 **引擎设置** 中打开目标行，单击 **滚动签名密钥**，然后确认。 LangSmith 生成新的签名密钥并立即将其用于未来的 Webhook 交付。一旦滚动完成，先前的秘密就会停止签署交付。

滚动秘密后，用新值更新每个验证 `X-LangSmith-Signature` 的消费者。

### 测试你的端点

在将真实目的地指向端点之前，请发送示例有效负载以验证其在 20 秒超时内接受并确认：

```bash
curl -X POST https://your-endpoint.example.com/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $WEBHOOK_SECRET" \
  -d @sample-issue-created.json
```

使用 [⟦T42⟧](#issue-created) 中的示例正文作为 `sample-issue-created.json`。验证：- 自定义 `Authorization` 标头到达并与您在目标上配置的机密相匹配。
- 处理程序保留由其 `id` 键入的事件，以便重试被重复数据删除。
- 处理程序在开始缓慢的下游工作之前返回`2xx`。

### 安全

- Webhook URL 在创建目标时进行验证，并在交付时再次进行验证。私有和元数据 IP 范围在 SaaS 中被阻止。 `http://`和`https://`均可接受；使用`https://`，因此有效负载和任何自定义标头不会以明文形式发送。
- LangSmith 使用目的地的签名密钥对 Webhook 主体进行签名。在处理有效负载之前验证`X-LangSmith-Signature`。
- 您还可以在目标上设置自定义标头，例如`Authorization: Bearer …`，以便在端点进行路由或附加身份验证。
- 对事件 `id` 进行重复数据删除，以便重试传送不会导致重复通知。

### 最佳实践- **快速确认。** 一旦您坚持了该事件，请立即使用 `2xx` 进行响应。将缓慢的工作（扇出、分页、下游 API 调用）移至队列中，以便您的处理程序保持在 20 秒超时范围内。
- **容忍未知事件类型。** 忽略处理程序无法识别的 `type` 值。可能会添加新的事件类型，恕不另行通知。
- **容忍新字段。** 使用宽松的模式解析有效负载。新字段可能会添加到现有事件类型中，恕不另行通知。

## Webhook 负载参考

Webhook 目标接收下面的 JSON 有效负载。 Slack 目的地则不然。

### 活动信封

传递到端点的每个事件都使用相同的外部 JSON 形状。

|领域|类型 |描述 |
| ---| ---| ---|
| `id` | UUID |本次交付的唯一标识符。重试后保持稳定。用它来删除重复数据。 |
| `type` |字符串 |事件类型。 [⟦T57⟧](#issue-created)、[⟦T58⟧](#issue-trace-added) 或 [⟦T59⟧](#issue-agent_run-failed) 之一。 |
| `created` |整数 |事件排队时的 Unix 秒 (UTC)。 |
| `request_id` | UUID |由同一上游操作触发的每个事件共享。参见[Batch coalescing](#batch-coalescing)。 |
| `data` |对象|事件有效负载。始终包含 `data.object`。仅在 [⟦T65⟧](#issue-trace-added) 事件中包含 [⟦T64⟧](#data-trace)。 |

### 问题`data.object`对于 [⟦T67⟧](#issue-created) 和 [⟦T68⟧](#issue-trace-added)，`data.object` 是问题的快照。将其视为事件生成时问题的权威状态。

|领域|类型 |描述 |
| ---| ---| ---|
| `id` | UUID |问题 ID。 |
| `name` |字符串 |问题的简短标题。 |
| `description` |字符串 |人类可读的描述。 |
| `severity` |整数 | `0`（紧急）至 `3`（低）。参见[Severity filtering](#severity-filtering)。 |
| `tenant_id` | UUID |问题所属的工作区。 |
| `tenant_name` |字符串 |工作区显示名称。 |
| `session_id` | UUID |跟踪问题所属的项目。 |
| `session_name` |字符串 |跟踪项目名称。 |
| `url` |字符串 | LangSmith UI 中问题的深层链接。 |

### 运行失败`data.object`

对于 [⟦T82⟧](#issue-agent_run-failed)，`data.object` 描述失败的引擎运行。|领域|类型 |描述 |
| ---| ---| ---|
| `tenant_id` | UUID |运行所属的工作空间。 |
| `tenant_name` |字符串 |工作区显示名称。 |
| `session_id` | UUID |跟踪运行所属的项目。 |
| `session_name` |字符串 |跟踪项目名称。 |
| `url` |字符串 | UI 中LangSmith 项目的深层链接。 |
| `thread_id` |字符串 |引擎线程ID。 |
| `run_id` |字符串 |发动机运行 ID。不可用时省略。 |
| `status` |字符串 |最终运行状态。 |
| `error_message` |字符串 |运行失败的错误文本。不可用时省略。 |
| `occurred_at` |字符串 |发生故障时的 RFC 3339 时间戳。 |

### `data.trace`

`data.trace` 仅包含在 [⟦T96⟧](#issue-trace-added) 活动中。

|领域|类型 |描述 |
| ---| ---| ---|
| `run_id` | UUID |与问题关联的运行的 ID。 |
| `trace_id` | UUID |包含运行的跟踪的 ID。 |
| `start_time` |字符串 |运行开始时的 RFC 3339 时间戳。 |
| `comment` |字符串\|空 |链接跟踪时记录的可选注释。空时省略。 |

### 批量合并单个上游操作可以生成多个 Webhook 事件。当引擎打开一个新问题并向其附加五个跟踪时，您会收到一个 [⟦T101⟧](#issue-created) 事件和五个 [⟦T102⟧](#issue-trace-added) 事件，所有事件共享相同的 `request_id`。使用 `request_id` 将它们分组为单个下游通知。


### `issue.created`

当LangSmith引擎创建新问题时发送。 `data.trace` 被省略。

```json
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

```json
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

当LangSmith引擎无法完成运行时发送。此事件是会话范围的，因此它不包括 `data.trace` 并且不使用严重性过滤。

```json
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

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-notifications.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>