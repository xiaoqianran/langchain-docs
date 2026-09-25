<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect a Managed Deep Agent over HTTP | https://docs.langchain.com/langsmith/python/managed-deep-agents-channels-http -->

# 通过 HTTP 连接托管深度代理

HTTP 通道将托管深度代理转变为任何外部服务都可以调用的 HTTP 端点。将其用于托管Deep Agents不直接支持的提供商，例如订单系统、支持工具或您自己的应用程序。

您提供两个回调：一个对请求进行身份验证，另一个将其转换为消息，命名调用者及其所属的对话。托管Deep Agents 拥有可信切换、代理运行和回复。对于提供商管理的替代方案，请参阅[Slack](/langsmith/python/managed-deep-agents-channels-slack)。

<Note>
托管 Deep Agents 在 **公共 [beta](/langsmith/release-stages)** 中可用，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

<Note>
HTTP 通道需要 `managed-deepagents>=0.8.0`。
</Note>

## 项目结构

HTTP 通道声明位于 `channels/` 下，与任何其他通道一样：

```text
my-agent/
  agent.py
  channels/
    orders.py
```




文件名成为通道名称和端点路径。一个项目可以声明多个HTTP通道，并且名称必须是唯一的。完整的项目布局请参见[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

## 添加 HTTP 通道

<Steps>
  <Step title="Declare the channel" id="declare-the-channel">

```python channels/orders.py
from managed_deepagents import channels

from lib.orders import parse, verify

channel = channels.http(
    provider="orders",
    verify=verify,
    parse=parse,
)
````provider` 为外部服务命名，它与通道名称分开。托管 Deep Agents 将其与调用者 ID 一起发送到代理身份验证，解析运行可能使用其凭据的 [principal](/langsmith/python/managed-deep-agents-identity)。因此，提供者对呼叫者 ID 进行命名空间。

跨提供相同服务的渠道共享一个提供商。两个 Shopify 渠道（`channels/orders` 和 `channels/refunds`）均声明 `provider: "shopify"`，将同一 Shopify 用户解析为一个委托人。即使呼叫者 ID 相同，声明 `provider: "slack"` 的通道也会解析为不同的主体。

声明通道会注册提供者，因此任何非空名称都有效。

  </Step>
  <Step title="Verify the request" id="verify-the-request">

托管Deep Agents 首先调用`verify`。返回`True`继续`parse`，或`False`以`401`拒绝请求。 `verify`可能是`async def`。




`verify` 接收带有 Starlette `request` 和原始 `raw_body` 字节的 `HttpChannelRequest`。根据字节检查签名，而不是根据重新序列化的主体检查签名：




```python lib/orders.py
import hashlib
import hmac
import os

from managed_deepagents import HttpChannelRequest


def verify(context: HttpChannelRequest) -> bool:
    secret = os.environ["ORDERS_WEBHOOK_SECRET"]
    digest = hmac.new(secret.encode(), context.raw_body, hashlib.sha256).hexdigest()
    received = context.request.headers.get("x-orders-signature", "")
    return hmac.compare_digest(f"sha256={digest}", received)
```<Warning>
终端没有平台认证。通道事件路由在适配器内部进行身份验证，而不是通过托管 Deep Agents 入口进行身份验证。这使得`verify`成为公共互联网和代理运行之间的唯一障碍。始终检查签名或共享秘密，切勿无条件接受请求。
</Warning>

使用 [deployment secret](/langsmith/python/managed-deep-agents-deploy) 作为签名密钥。引发的 `verify` 回调会拒绝带有 `500` 的请求。

从环境中解析通道凭据，而不是使用 `connections.get`，这需要运行。有关代理工具在运行期间使用的凭据，请参阅[Manage connections](/langsmith/python/managed-deep-agents-connections)。

  </Step>
  <Step title="Parse the request into a message" id="parse-the-request">

`parse` 将已验证的请求转换为启动运行的消息，或忽略该事件。它接收与 `verify` 相同的 `HttpChannelRequest`，因此请求标头在这里也可用，并且它可能是异步的。返回两个形状之一：

- `{"type": "message", "message": {...}}`开始跑步。
- `{"type": "ignore"}` 跳过该事件。

两者都接受可选的 `response`，Starlette `Response`。




该消息携带四个必填字段：- **`user_id`**：外部服务中调用者的 ID，作为字符串，从已验证的事件解析。代理身份验证将其映射到运行可能使用其凭据的主体，因此它是从经过验证的数据而不是从未经身份验证的字段派生的。使用 `str()` 转换数字提供商 ID。
- **`thread_id`**：要运行的对话，作为 UUID。 Managed Deep Agents 将其小写并将其映射到持久代理线程，因此相同的值会继续相同的对话。
- **`target`**：一个 JSON 值，用于标识提供程序中的回复目标。这与代理线程 UUID 是分开的。即使通道仅开始运行，也应包含它。
- **`content`**：消息文本，或LangChain内容块列表。




<Warning>
`thread_id` 必须是 UUID。托管 Deep Agents 拒绝使用 `400` 的任何其他值，因此在返回之前将外部会话 ID 映射到 UUID，例如使用 `uuid.uuid5`。


</Warning>

将 `parse` 添加到包含 `verify` 的 `lib/orders` 文件中。将两个示例的导入合并到文件顶部，仅保留 `HttpChannelRequest` 的一个导入：

```python lib/orders.py
import json
import uuid

from managed_deepagents import HttpChannelParseResult, HttpChannelRequest

ORDERS_NAMESPACE = uuid.UUID("6f0c9a3e-8f1a-4f5e-9c2b-7d4e1a2b3c4d")


def parse(context: HttpChannelRequest) -> HttpChannelParseResult:
    event = json.loads(context.raw_body)
    if event.get("type") != "order.comment":
        return {"type": "ignore"}
    return {
        "type": "message",
        "message": {
            "user_id": str(event["actor"]["id"]),
            "thread_id": str(uuid.uuid5(ORDERS_NAMESPACE, str(event["order"]["id"]))),
            "content": event["comment"]["body"],
            "target": str(event["order"]["id"]),
        },
        "raw_event": event,
    }
```返回一个`response`来控制提供者接收的内容。托管 Deep Agents 在接受运行后发送消息，并立即发送忽略事件。使用它来回答提供商的验证挑战而无需开始运行：

此示例使用 Starlette 的 `JSONResponse`。在使用 Starlette 之前将其添加到您的项目依赖项中：

```bash
uv add "starlette>=1.6.0"
```

```python
from starlette.responses import JSONResponse

return {
    "type": "ignore",
    "response": JSONResponse({"challenge": event["challenge"]}),
}
```




  </Step>
  <Step title="Send replies with post" id="send-replies">

添加异步 `post` 回调以将代理的最终响应传递给外部服务。对于仅开始运行的通道，请忽略它。

`post` 接收一个带有已验证的 `target` 的输入和一条消息。自动回复使用 `type: "content"` 和 `content` 字段。显式本机消息使用 `type: "native"` 和 `native` 字段。返回发布的消息`id`和可选的`url`。

这些示例支持内容消息并拒绝本机消息。 `target`是`parse`返回的订单ID。

```python channels/orders.py
import os

import httpx
from managed_deepagents import HttpChannelPostInput, HttpPostedMessage, channels

from lib.orders import parse, verify


async def post(input: HttpChannelPostInput) -> HttpPostedMessage:
    if input["type"] != "content":
        raise ValueError("This adapter supports content messages only")
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://orders.example.com/api/comments",
            headers={"authorization": f"Bearer {os.environ['ORDERS_API_TOKEN']}"},
            json={"order_id": input["target"], "body": input["content"]},
        )
        response.raise_for_status()
    return {"id": str(response.json()["id"])}


channel = channels.http(
    provider="orders",
    verify=verify,
    parse=parse,
    post=post,
)
```




托管 Deep Agents 在运行完成后发布回复，与提供商已收到的响应分开。有两种情况不会产生回复：在 [interrupt](/langsmith/python/managed-deep-agents-tools#respond-to-an-interrupt) 上暂停的运行，以及代理本身已传递最终消息的运行。失败的 `post` 会被记录为传送失败。添加可选的异步 `on_error(error, target)` 回调来处理运行或交付失败。它取代了默认的错误回复。它接收经过验证的回复目标。




  </Step>
</Steps>

## 调用端点

部署的 HTTP 通道接受通道名称的请求，而不是提供者名称：

```text
POST https://<deployment-url>/channels/<name>/events
```

`channels/orders.py` 中的声明可在 `/channels/orders/events` 处获得。




您的 `parse` 回调对请求正文进行解码。它可以读取 JSON、表单数据、文本或字节。上面的示例需要 JSON。

托管 Deep Agents 使用其中之一进行回答，除非 `parse` 返回其自己的 `response`：

|状态 |身体|原因 |
| ---| ---| ---|
| `202` | `{"status": "accepted", "deliveryId": "..."}` |跑步开始了。 |
| `202` | `{"status": "ignored"}` | `parse` 返回忽略结果。 |
| `400` | `{"error": "invalid channel payload"}` | `parse` 引发，例如因为它的解码器拒绝了正文。 |
| `400` | `{"error": "invalid channel parse result"}` | `parse` 返回了无法识别的形状。 |
| `400` | `{"error": "invalid channel message"}` |该消息具有无效的调用者、线程 UUID、内容或 JSON `target`。 |
| `401` | `{"error": "invalid channel signature"}` | `verify` 拒绝了请求。 |
| `500` | `{"error": "channel verification failed"}` | `verify` 提高。 |
| `500` | `{"error": "channel runtime is not configured"}` |托管运行时缺少所需的配置。 |
| `500` | `{"error": "channel run could not be started"}` |代理运行无法启动。 |`202` 表示运行已被接受，而不是已完成。如果已配置，代理的答复稍后会通过 `post` 到达。

## 读取代理中的事件

每次运行都携带[run context](/langsmith/python/managed-deep-agents-middleware#use-runtime-context)中的通道数据。解析器示例明确包含提供者事件。这些字段出现在通道上下文中：

```json
{
  "channel": {
    "provider": "orders",
    "target": "A-1024",
    "raw_event": { "type": "order.comment", "order": { "id": "A-1024" } }
  }
}
```

从 `parse` 返回 `raw_event` 以在 `runtime.channel.raw_event` 和 `runtime.context.channel["raw_event"]` 公开 JSON 提供程序数据。如果省略，则上下文没有 `raw_event` 键，并且 `runtime.channel.raw_event` 是 `None`。




托管 Deep Agents 根据解析的消息构建 `runtime.channel.event`。它不会再次解码主体或自动保留提供者事件。

## 部署代理

HTTP 通道不需要提供商授权，因此部署是标准命令。 Managed Deep Agents 从声明中挂载端点。

```bash
uv run mda deploy
```




将签名密钥和任何回复凭据放入项目 `.env` 中，以便 `mda deploy` 将它们作为部署机密转发。然后向外部服务注册 `https://<deployment-url>/channels/<name>/events` 作为其 webhook 目标。

## 另请参阅- [Channels overview](/langsmith/python/managed-deep-agents-channels)：了解通道如何将消息服务连接到代理。
- [Slack](/langsmith/python/managed-deep-agents-channels-slack)：改用提供商管理的 Slack 通道。
- [Identity](/langsmith/python/managed-deep-agents-identity)：对调用者进行身份验证，范围通道运行到已解析的用户。
- [Deploy an agent](/langsmith/python/managed-deep-agents-deploy)：配置和部署托管深度代理。

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-channels-http.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>