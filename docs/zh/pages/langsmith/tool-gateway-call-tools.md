<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Call tools through Tool Gateway | https://docs.langchain.com/langsmith/tool-gateway-call-tools -->

# 通过工具网关调用工具

通过 HTTP 将 MCP 请求发送到工具网关工具包和服务器，处理连接和批准提示，并修复常见错误。

> [!注意]
>
> 工具网关位于[beta](/langsmith/release-stages)。

每个 [Tool Gateway](/langsmith/tool-gateway) 端点都是基于 Streamable HTTP 的标准 MCP 服务器。因此，您可以使用纯 HTTP 请求列出并调用其工具。使用此页面构建您自己的 MCP 客户端或调试代理发出的呼叫。它还涵盖要求呼叫者连接帐户或批准呼叫的响应。要使用现有客户端，例如 Claude Code 或 Cursor，请参阅 [Connect an MCP client](/langsmith/tool-gateway-clients)。客户端为您发送这些请求。

本页上的示例使用 [quickstart](/langsmith/tool-gateway-quickstart#before-you-begin) 中的环境变量，并将请求发送到 [tool kit](/langsmith/tool-gateway-tool-kits)。相同的请求适用于 [me kit](/langsmith/tool-gateway-tool-kits#use-the-me-kit) 和单个服务器的端点 `/v1/managed-tools/servers/<server-id>/mcp`。

## 发送 MCP 请求将每个 MCP 消息作为 JSON-RPC `POST` 请求发送到端点。工具包和 me 工具包在请求之间不保留会话，因此您不需要在列出或调用工具之前发送 `initialize`。工具包每个请求接受一条消息并拒绝 JSON-RPC 批次。单个服务器的端点将每个请求按原样传递给服务器，并可以使用 `text/event-stream` 进行应答。如果该服务器使用会话，请首先发送 `initialize`，然后重复它在每个请求上返回的 `MCP-Session-Id` 标头。

每个请求都会发送这些标头：

* **`X-Api-Key`**：LangSmith API 密钥。密钥决定调用使用谁的凭据。要以其他用户、代理或个人资料的身份进行呼叫，请参阅 [Act as users and agents](/langsmith/tool-gateway-identity)。
* **`X-Tenant-Id`**：您的工作区 ID。
* **`Content-Type`**：`application/json`。
* **`Accept`**：`application/json, text/event-stream`。
* **`MCP-Protocol-Version`**：请求使用的MCP协议版本。

MCP 协议版本 `2026-07-28` 上的请求还必须在请求的 `_meta` 中发送协议版本和客户端功能。他们还必须在标题中重复方法和工具名称：

* **`Mcp-Method`**：JSON-RPC `method`，例如`tools/list`。
* **`Mcp-Name`**：对于`tools/call`，工具名称，匹配`params.name`。

缺少任一标头的 `2026-07-28` 请求将返回 `400` 并带有 JSON-RPC 错误，代码为 `-32020`。需要协议版本 `2026-07-28` 才能在 MCP 响应中获取 [connection](#connect-when-a-call-asks) 和 [approval](#approve-a-tool-call) 提示。早期版本（例如 `2025-06-18`）上的请求会省略额外的标头和 `_meta`，并收到 HTTP 错误而不是提示。

### 列出工具

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/kits/<kit-id>/mcp" \
  -H "X-Api-Key: $LANGSMITH_API_KEY" \
  -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "MCP-Protocol-Version: 2026-07-28" \
  -H "Mcp-Method: tools/list" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {
      "_meta": {
        "io.modelcontextprotocol/protocolVersion": "2026-07-28",
        "io.modelcontextprotocol/clientCapabilities": {}
      }
    }
  }'
```

响应的 `result.tools` 在代理调用的名称下列出每个工具，例如 `linear_list_issues`。工具网关如何命名工具，请参见[How kit tools are named](/langsmith/tool-gateway-tool-kits#how-kit-tools-are-named)。

该列表包括您尚未连接的服务器上的工具。参见[Connect when a call asks](#connect-when-a-call-asks)。

### 调用工具

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/kits/<kit-id>/mcp" \
  -H "X-Api-Key: $LANGSMITH_API_KEY" \
  -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "MCP-Protocol-Version: 2026-07-28" \
  -H "Mcp-Method: tools/call" \
  -H "Mcp-Name: linear_list_issues" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "linear_list_issues",
      "arguments": {},
      "_meta": {
        "io.modelcontextprotocol/protocolVersion": "2026-07-28",
        "io.modelcontextprotocol/clientCapabilities": {}
      }
    }
  }'
```

响应的 `result.content` 保存服务器的结果，未更改地传递。将其视为代理的不可信输入。如果工具本身失败，`result.isError` 为 `true`，HTTP 状态仍为 `200`。

工具网关在每次调用时都会检查调用者的凭据和[policies](/langsmith/tool-gateway-policies)。无法运行的调用将返回以下部分中的响应之一。

## 当有电话询问时连接

工具包列出了它的所有工具，包括调用者未连接的服务器上的工具。对这些工具之一的调用不会运行。相反，工具网关会要求调用者连接服务器。它如何询问取决于呼叫者的身份以及客户支持什么。

### 致电前请检查要查看调用者仍需要连接哪些服务器，而不调用工具：

* **来自工具列表**：工具包的 `tools/list` 结果在 `result._meta["com.langchain.langsmith/missingCredentials"]` 中命名了每个缺失的凭据及其登录链接。我的工具包不包含此列表。
* **从连接端点**：`GET /v1/managed-tools/kits/<kit-id>/connections` 列出套件使用的每个服务器，并为调用者设置`connected`。要开始连接，请参阅[Connect accounts](/langsmith/tool-gateway-connect-accounts#connect-your-own-account)。

调用者尚未连接且其工具工具网关尚不知道的服务器被列为一个名为 `connect_<server>` 的占位符工具。与任何其他呼叫一样，呼叫占位符会要求呼叫者进行连接。

工具列表中丢失的凭据可能会落后于此后建立的连接。工具调用始终会检查调用者的当前凭据。

### 当调用者是用户时

用户可以连接自己的帐户，因此调用会返回登录链接：

* **支持 URL 获取的客户端**：在协议 `2026-07-28` 上，声明 `elicitation.url` 功能的客户端会获取 `input_required` 结果，其中每个服务器都有一个链接用于连接。客户端向用户显示链接。用户连接后，呼叫继续。
* **所有其他客户端**：调用返回`428`。打开正文中的每个`verification_url`，连接，然后再次发送呼叫。`428` 主体因端点而异。工具包或 me 工具包返回一个 `credentials` 数组，因为一次调用可能需要多个服务器：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "status": 428,
  "detail": "Authorize the linked servers, then retry the MCP request",
  "credentials": [
    {
      "kind": "oauth",
      "slug": "mt-<server-id>",
      "display_name": "Linear",
      "verification_url": "<sign-in-url>",
      "auth_id": "<auth-id>"
    }
  ]
}
```

单个服务器的端点为其顶层的一个凭证返回相同的字段，没有 `credentials` 数组：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "status": 428,
  "kind": "oauth",
  "slug": "mt-<server-id>",
  "display_name": "Linear",
  "verification_url": "<sign-in-url>",
  "auth_id": "<auth-id>"
}
```

对于使用 OAuth 登录的服务器，`kind` 是 `oauth`，对于需要 API 密钥的服务器，`secret`。该链接会打开一个页面，用户可以在其中登录或输入密钥。对于 OAuth，它可以直接进入服务自己的登录页面。只有呼叫者才能打开它：登录的人会将其帐户链接到呼叫者。

### 当呼叫者是代理或个人资料时

代理或 [profile](/langsmith/tool-gateway-connect-accounts#connect-an-account-for-a-profile) 无法连接自己的凭据，因为没有人在场进行登录。该调用返回 `409`，其 `credentials` 数组与 `428` 相同，但没有登录链接。工作区管理员必须连接代理或配置文件的凭据，然后代理才能重试。参见[Connect accounts](/langsmith/tool-gateway-connect-accounts)。

## 批准工具调用

[approval policy](/langsmith/tool-gateway-policies) 会暂停每个匹配的呼叫，直到呼叫者批准为止。批准来自使用 MCP 客户端的人，而不是来自单独的审阅者。使用它在运行之前确认呼叫，而不是将呼叫路由给管理员。在协议`2026-07-28`上，支持表单获取的客户端会显示批准表单。该表单命名了工具、其服务器、需要批准的策略以及调用的参数。

* **接受**：呼叫运行。
* **拒绝或取消**：呼叫不会运行。结果是出现工具错误，并显示文本“用户拒绝了此工具调用，因此它没有运行。”

无法显示表单（包括早期协议版本上的任何请求）的客户端将获取 `403`，并且调用不会运行。要调用该工具，请使用支持表单诱导的客户端，或要求组织管理员更改策略。

拒绝策略会阻止使用 `403` 和 `"code": "tool_call_blocked"` 的呼叫。当工具网关因不安全而阻止调用时，它会返回相同的响应，因此该响应不会说明哪一个调用阻止了该调用。匹配`code`，因为`detail` 文本可以更改。被阻止的工具仍然出现在工具列表中。

## 错误

大多数错误响应都是 JSON 问题详细信息。 `detail` 字段说明出了什么问题，而 `remedy` 如果存在，则说明下一步要做什么。有两个错误使用其他主体：身份验证失败可能返回 `{"error": "Unauthorized"}`，丢失或不匹配的 `Mcp-Method` 或 `Mcp-Name` 标头返回 JSON-RPC 错误。|状态 |意义|该怎么办 |
| - | - | - |
| `400` |请求格式错误：例如，JSON-RPC 批处理、`search` 以外的 `mode`，或者协议 `2026-07-28` 上缺少 `Mcp-Method` 或 `Mcp-Name` 标头。 |每个请求发送一条 JSON-RPC 消息，检查查询字符串并检查标头。 |
| `401` |身份验证丢失或无效。 |检查API密钥和`X-Tenant-Id`。 |
| `403` |拒绝策略阻止了呼叫，批准策略需要可以显示表单的客户端，工作区管理员关闭了服务器，或者呼叫者缺乏权限。 |阅读`detail`。有关政策，请参阅[Approve a tool call](#approve-a-tool-call)。 |
| `404` |工具包、服务器或配置文件不存在，或者调用者看不到它。 |检查 URL 或 `X-LangSmith-Profile` 标头中的 ID。 |
| `409` |代理或配置文件没有呼叫所需服务器的凭据。 |请工作区管理员[connect it](/langsmith/tool-gateway-connect-accounts)。 |
| `413` |请求正文大于 1 MB。 |发送较小的请求。 |
| `428` |用户尚未连接呼叫所需的服务器。 |打开每个`verification_url`，连接，然后重试。参见[When the caller is a user](#when-the-caller-is-a-user)。 || `429` |工作区达到其请求速率限制，或者计量内置服务器达到其每月限制。 |等待 `Retry-After` 标头中的秒数，然后重试。 |
| `502` | MCP 服务器无法访问或返回错误。 |检查服务器的 URL 是否正确以及服务是否已启动。 |
| `503` |工具调用暂时不可用。 |稍后重试。 |
| `504` | MCP 服务器在 60 秒内未开始响应。 |重试或检查服务的状态。 |

单个服务器的端点不变地传递来自 MCP 服务器的其他状态代码。有关请求、响应和速率限制，请参阅[Limits](/langsmith/tool-gateway-how-it-works#limits)。

## 另请参阅

* [Connect an MCP client](/langsmith/tool-gateway-clients)
* [Act as users and agents](/langsmith/tool-gateway-identity)
* [Connect accounts](/langsmith/tool-gateway-connect-accounts)
* [Set policies](/langsmith/tool-gateway-policies)
* [How Tool Gateway works](/langsmith/tool-gateway-how-it-works)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tool-gateway-call-tools.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。