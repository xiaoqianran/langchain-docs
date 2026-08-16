<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure Context Hub commit webhooks | https://docs.langchain.com/langsmith/context-hub-webhooks -->

# 配置 Context Hub 提交 webhook

每当在 [workspace](/langsmith/administration-overview#workspaces) 中创建代理或技能提交时，[Context Hub](/langsmith/context-hub) 提交 Webhook 都会通知外部服务。使用它们触发 Context Hub 更改的自动化，包括通过 [LangSmith Fleet](/langsmith/fleet) 创建的提交。

管理 Context Hub Webhooks 需要 [⟦T5⟧](/langsmith/organization-workspace-operations) 权限，[Workspace Admins](/langsmith/rbac#workspace-admin) 和 [Workspace Editors](/langsmith/rbac#workspace-editor) 默认情况下具有该权限。

## 添加网络钩子

每个 Webhook 都适用于整个工作区。每个配置的端点都会接收每个代理和技能提交，包括由 Fleet 创建的提交。 `context_hub.commit.created.v1` 事件不支持按存储库或事件类型进行过滤。

添加网络钩子：

1. 在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-context-hub-webhooks) 中，转到 **设置** → **集成** → **Context Hub webhooks**。
1. 单击“**添加 Webhook**”。
1. 输入可公开访问的 HTTPS URL。
1. （可选）添加自定义请求标头，例如 `Authorization` 标头。
1. 单击“**添加 Webhook**”。
1. 复制生成的签名密钥并安全存储。

您可以添加的订阅数量取决于您的工作区配置。

## 管理网络钩子Webhook 列表显示端点 URL 和自定义标头名称。标头值和签名机密将保持隐藏状态，直到您单击 **显示机密**。如果您仍然有权管理 Context Hub Webhook，则可以稍后显示它们。

使用 webhook 上的控件来管理它：

- **编辑 webhook**：更改 HTTPS URL 或替换其自定义标头。编辑不会更改签名秘密。
- **滚动签名秘密**：生成并揭示新的签名秘密。 LangSmith 立即使用新的密钥进行将来的交付，并且之前的密钥不再起作用。更新每个验证 webhook 的消费者。
- **删除 Webhook**：阻止端点从工作区接收未来的 Context Hub 提交事件。

## 送货

LangSmith 为每个事件发送 JSON `POST` 请求。自定义标头无法覆盖 `Content-Type` 或 `X-LangSmith-Signature`，LangSmith 在应用自定义标头后设置。|物业 |价值|
| ---| ---|
|方法| `POST` |
|网址 |可公开访问的 HTTPS 端点 |
|内容类型 | `application/json` |
|签名| `X-LangSmith-Signature` 标头，使用 webhook 的签名密钥进行签名 |
|超时 |每次尝试 20 秒 |
|尝试|最多 4 次尝试：1 次初始尝试，最多 3 次重试 |
|重试条件 |传输失败、HTTP `408`、`425`、`429` 和 `5xx` 响应 |
|永久回复 |其他 `4xx` 响应不会重试 |
|响应处理 |低于`400`的状态成功。响应机构不影响成功。 |

重试包含字节相同的请求主体并保留事件`id`。在产生下游影响之前，通过`id`删除重复事件。

## 验证签名

每个请求都包含一个 `X-LangSmith-Signature` 标头，格式如下：

```text
sha256=<lowercase hex HMAC-SHA256 digest>
```

使用 Webhook 的签名密钥在精确的原始请求正文字节上计算 HMAC-SHA256 摘要。在解析JSON之前验证签名，并在恒定时间内比较完整的标头值。在验证之前解析和重新序列化主体可能会更改其字节并使签名无效。

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

## 活动信封外部 `id`、`type`、`created` 和 `data` 信封被冻结。事件类型上的 `.v1` 后缀版本为 `data.commit` 架构。

```json
{
  "id": "0198...",
  "type": "context_hub.commit.created.v1",
  "created": 1720000000,
  "data": {
    "commit": {
      "repo_id": "...",
      "repo_handle": "my-agent",
      "repo_type": "agent",
      "commit_hash": "newcommithash0002",
      "parent_commit_hash": "parentcommithash0001",
      "created_at": "2023-11-14T22:13:20Z",
      "created_by": "user@example.com",
      "url": "https://smith.example.com/context/my-agent/newcommithash0002",
      "files_changed": [
        { "path": "skills/kept", "action": "modified" },
        { "path": "skills/added", "action": "added" },
        { "path": "skills/gone", "action": "removed" }
      ]
    }
  }
}
```

|领域|类型 |描述 |
| ---| ---| ---|
| `id` | UUID |唯一的事件标识符在重试后保持稳定。用它来删除重复事件。 |
| `type` |字符串|确切的事件类型。目前`context_hub.commit.created.v1`。 |
| `created` |整数 |事件排队时的 UTC Unix 秒数。 |
| `data` |对象|版本化事件数据。包含`data.commit`。 |

### `data.commit`

`data.commit` 对象描述触发事件的 Context Hub 提交。|领域|类型 |描述 |
| ---| ---| ---|
| `repo_id` | UUID | Context Hub 存储库 ID。 |
| `repo_handle` |字符串|存储库句柄。 |
| `repo_type` |字符串|存储库类型：`agent` 或 `skill`。 |
| `commit_hash` |字符串|新提交的哈希值。 |
| `parent_commit_hash` |字符串|父提交的哈希值。首次提交或不可用时省略。 |
| `created_at` |字符串|创建提交时的 RFC 3339 时间戳。 |
| `created_by` |字符串| LangSmith 创建提交的用户 ID。不可用时省略。 |
| `url` |字符串| LangSmith UI 中提交的深层链接。 |
| `files_changed` |数组|提交中包含文件更改。每个条目包含`path`和`action`。 |

### `data.commit.files_changed`

每个条目都总结了一条更改的路径。它不包含文件内容。

|领域|类型 |描述 |
| ---| ---| ---|
| `path` |字符串|路径被提交更改。 |
| `action` |字符串|更改类型：`added`、`modified` 或 `removed`。 |

## 处理事件版本

在解析 `data.commit` 之前对完整事件类型进行分支：

```typescript
if (event.type === "context_hub.commit.created.v1") {
  await handleCommitCreatedV1(event.data.commit);
} else {
  // Ignore unknown event types and versions safely.
}
```

对 `data.commit` 的重大更改使用了新的事件类型后缀，例如 `.v2`。忽略未知类型而不是尝试将它们解析为 v1，并允许未知字段，以便兼容的添加不会破坏您的处理程序。## 下一步

- [Use the Context Hub](/langsmith/use-the-context-hub)：创建、检查和提升代理和技能提交。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/context-hub-webhooks.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>