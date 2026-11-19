<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tool Gateway quickstart | https://docs.langchain.com/langsmith/tool-gateway-quickstart -->

# 工具网关快速入门

将两个 MCP 服务器添加到工具网关，连接您的帐户，创建工具包，并从 MCP 客户端调用其工具。

> [!注意]
>
> 工具网关位于[beta](/langsmith/release-stages)。

[Tool Gateway](/langsmith/tool-gateway) 在一个 MCP URL 上为任意数量的 MCP 服务器提供工具。它使用 LangSmith 为您存储的凭据调用每个工具。在本快速入门中，您将添加两个 MCP 服务器并连接您的帐户。然后，您将选择的工具放入工具包中，并从 MCP 客户端调用这些工具。

## 开始之前

您需要：* **A LangSmith [Plus or Enterprise plan](https://www.langchain.com/pricing).**
* **可以添加服务器的[workspace role](/langsmith/rbac#workspace-roles)。** 工作区管理员和工作区编辑者都可以添加个人服务器。
* **A [personal access token](/langsmith/create-account-api-key).** 创建服务器和工具包需要用户凭据。服务密钥不适用于这些步骤。
* **您的工作区 ID**。每个 API 请求都会在 `X-Tenant-Id` 标头中发送它。
* **提供远程 MCP 服务器的两项服务上的帐户。** 本快速入门使用 Linear 和 Notion。要使用其他服务，请替换其 MCP URL 和工具名称。如果您遵循线性示例，请使用测试线性工作区，因为该套件包含一个可能会产生问题的工具。
* **支持 Streamable HTTP 并允许您设置自定义标头的 MCP 客户端**，其中包含您的 LangSmith API 密钥。本快速入门使用 [Claude Code](https://code.claude.com/docs/en/overview)。要在没有客户端的情况下调用这些工具，您可以使用 `curl` 发送 HTTP 请求。
* **[jq](https://jqlang.org/)**，如果您遵循 API 步骤。命令使用它来保存每个响应的 ID。

> [!提示]
>
> 如果您没有 Linear 或 Notion 帐户，请使用公共 [LangChain docs MCP server](/use-these-docs) 代替。将其添加为 **公共** 服务器 (`"connection": {"type": "none"}`)，其 URL 为 `https://docs.langchain.com/mcp`。跳过第 2 步，因为它不需要登录，并将其 `search_docs_by_lang_chain` 工具添加到您的套件中。设置这些环境变量，以便您可以按原样将命令粘贴到此页面上。如果您的组织不在 GCP US 区域，请将 `LANGSMITH_ENDPOINT` 设置为 [Base URL](/langsmith/tool-gateway-api-ref#base-url) 中您所在区域的网址。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY="<your-personal-access-token>"
export LANGSMITH_WORKSPACE_ID="<your-workspace-id>"
export LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
```

要检查您的密钥和工作区 ID 是否有效，请请求 MCP 服务器列表并仅打印 HTTP 状态代码：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -sS -o /dev/null -w "%{http_code}\n" \
  "$LANGSMITH_ENDPOINT/v1/managed-tools/servers" \
  -H "X-Api-Key: $LANGSMITH_API_KEY" \
  -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID"
```

当您的设置有效时，该命令会打印 `200`。

## 步骤 1. 添加 MCP 服务器

将每个 MCP 服务器及其所需的凭据类型注册一次。 Linear 和 Notion 这两个示例服务器都使用 OAuth。

> [选项卡] 用户界面
>
> 1. 在[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-tool-gateway-quickstart)中，转到**工具** > **MCP 服务器**。
> 2. 选择**个人**，然后单击**添加 MCP 服务器**。
> 3. 输入 `Linear` 作为名称，`https://mcp.linear.app/mcp` 作为 URL，然后选择 **OAuth**。
> 4. 对 Notion 重复上述操作，使用 URL `https://mcp.notion.com/mcp`。
>
> 两台服务器均显示状态 **未连接**。

> [选项卡] API
>
> 将 Linear 和 Notion 注册为使用 OAuth 登录的个人服务器。每个命令都会将新服务器的 ID 保存在环境变量中，以供后续步骤使用：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> export LINEAR_SERVER_ID=$(curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/servers" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
>   -H "Content-Type: application/json" \
>   -d '{"name": "Linear", "upstream_url": "https://mcp.linear.app/mcp", "scope": "personal", "connection": {"type": "oauth"}}' \
>   | jq -r '.id')
>
> export NOTION_SERVER_ID=$(curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/servers" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
>   -H "Content-Type: application/json" \
>   -d '{"name": "Notion", "upstream_url": "https://mcp.notion.com/mcp", "scope": "personal", "connection": {"type": "oauth"}}' \
>   | jq -r '.id')
>
> echo "$LINEAR_SERVER_ID $NOTION_SERVER_ID"
> ```
>
> 最后一行打印两个 ID。如果打印 `null`，请运行不带 `| jq` 行的 `curl` 命令来查看错误。> [!提示]
>
> 如果添加服务器返回“尚不支持此 MCP 服务器”，则服务器不会发布工具网关可以使用的 OAuth 设置。如果服务器不需要登录，请将其添加为 **Public** (`"connection": {"type": "none"}`)。对于每种服务器类型，请参阅[Add MCP servers](/langsmith/tool-gateway-servers)。

## 步骤 2. 连接您的帐户

每个服务登录一次。工具网关存储您的令牌并将其附加到充当您角色的每个后续调用。来自使用您的 API 密钥的 MCP 客户端的调用将充当您的角色。

> [选项卡] 用户界面
>
> 1. 在 **工具** > **MCP 服务器** 上，单击线性行上的 **连接**。
> 2. 在打开的选项卡中，批准 Linear 中的访问。 LangSmith 页面确认身份验证成功。
> 3. 对概念重复上述步骤。
>
> 两台服务器现在均显示状态**已连接**。

> [选项卡] API
>
> 启动 Linear 连接并打印登录链接：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/kits/me/connections/$LINEAR_SERVER_ID" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
>   | jq -r '.verification_url'
> ```
>
> 打开链接，批准访问，然后等待LangSmith确认身份验证成功的页面。重复`$NOTION_SERVER_ID`。如果该命令没有打印任何内容，则表明您已经连接。

> [!注意]
>
> 此快速入门连接您自己的帐户。要连接代理、配置文件或整个工作区的凭据，请参阅 [Connect accounts](/langsmith/tool-gateway-connect-accounts)。

## 步骤 3. 创建工具包工具包是一组精选的工具，来自任意数量的服务器，工具网关为一个 MCP URL 上的代理提供服务。该套件包含 Linear 的 `list_issues` 和 `save_issue` 工具以及 Notion 的 `notion-search` 工具。

> [选项卡] 用户界面
>
> 1. 转到**工具** > **工具包**，然后单击**创建工具包**。
> 2. 输入`Quickstart kit`作为名称，并将谁可以使用它设置为**个人**。
> 3. 在工具选择器中，按服务器过滤并从 Linear 选择 `list_issues` 和 `save_issue`，从 Notion 中选择 `notion-search`。
> 4. 单击 **查看工具选择**，然后单击 **创建工具包**。
>
> 该工具包的面板列出了代理所看到的工具，并显示了该工具包的 MCP URL。套件 ID 是该 URL 中`/kits/` 之后的路径段。保存：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> export KIT_ID="<kit-id>"
> ```

> [选项卡] API
>
> 创建套件并保存其 ID：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> export KIT_ID=$(curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/kits" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
>   -H "Content-Type: application/json" \
>   -d "{
>     \"name\": \"Quickstart kit\",
>     \"scope\": \"personal\",
>     \"tools\": [
>       {\"server_id\": \"$LINEAR_SERVER_ID\", \"tool_name\": \"list_issues\"},
>       {\"server_id\": \"$LINEAR_SERVER_ID\", \"tool_name\": \"save_issue\"},
>       {\"server_id\": \"$NOTION_SERVER_ID\", \"tool_name\": \"notion-search\"}
>     ]
>   }" \
>   | jq -r '.id')
>
> echo "$KIT_ID"
> ```
>
> 如果命令打印 `null`，请在不包含 `| jq` 行的情况下运行它以查看错误。

该套件是个人的，因为本快速入门的服务器是个人的。工作区套件不能包含个人服务器。套件名称必须是唯一的，因此如果使用 `Quickstart kit`，请选择其他名称。

> [!提示]
>
> 代理将服务器名称下的每个工具视为前缀，例如 `linear_list_issues`、`linear_save_issue` 和 `notion_notion-search`。工具命名及其他套件设置请参见[Create tool kits](/langsmith/tool-gateway-tool-kits)。

## 步骤 4. 从 MCP 客户端调用工具工具包是标准的 Streamable HTTP MCP 端点。您的代理或编码助理作为 MCP 客户端连接到它。客户端发送您的 LangSmith API 密钥，工具网关将您存储的 Linear 和 Notion 令牌附加到每次调用。

> [选项卡] 克劳德·代码
>
> 将套件添加到 Claude Code，并将您的 API 密钥添加到 `X-Api-Key` 标头中：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> claude mcp add --transport http quickstart-kit \
>   "$LANGSMITH_ENDPOINT/v1/managed-tools/kits/$KIT_ID/mcp" \
>   --header "X-Api-Key: $LANGSMITH_API_KEY"
> ```
>
> 运行`claude mcp list`并确认`quickstart-kit`显示为已连接。然后启动 Claude Code，并要求它在 Notion 中搜索某个主题，或者列出您的线性问题。每个调用都使用您的帐户在服务上运行。
>
> **工具** 上的套件面板 > **工具套件** 显示此命令，并填写了套件的 URL。它还显示了光标和托管 Deep Agents 的设置。对于其他客户端，请参阅[Connect an MCP client](/langsmith/tool-gateway-clients)。

> [选项卡] HTTP
>
> 将 JSON-RPC 请求发送到套件的 MCP 端点。在协议 `2026-07-28` 上，如此例所示，发送 `Mcp-Method` 标头，对于 `tools/call`，还发送带有工具名称的 `Mcp-Name`。缺少任一标头的请求都会返回 `400`。 `2025-06-18` 上的请求将两者都排除；参见[Call tools](/langsmith/tool-gateway-call-tools#send-an-mcp-request)。
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/kits/$KIT_ID/mcp" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
>   -H "Content-Type: application/json" \
>   -H "Accept: application/json, text/event-stream" \
>   -H "MCP-Protocol-Version: 2026-07-28" \
>   -H "Mcp-Method: tools/call" \
>   -H "Mcp-Name: notion_notion-search" \
>   -d '{
>     "jsonrpc": "2.0",
>     "id": 1,
>     "method": "tools/call",
>     "params": {
>       "name": "notion_notion-search",
>       "arguments": {"query": "onboarding"},
>       "_meta": {
>         "io.modelcontextprotocol/protocolVersion": "2026-07-28",
>         "io.modelcontextprotocol/clientCapabilities": {}
>       }
>     }
>   }'
> ```
>
> 响应的 `result.content` 保存 Notion 的搜索结果，未更改地传递。有关原始请求的更多信息，请参阅[Call tools](/langsmith/tool-gateway-call-tools)。

## 后续步骤您现在拥有一个 MCP URL，它为来自两项服务的工具提供服务，每项服务都使用您自己的帐户进行调用，而无需在客户端中提供任何身份验证代码。

本快速入门中的所有内容都是个人的。当您共享此设置时，工具网关最有用：

1. [Register servers once for the whole workspace](/langsmith/tool-gateway-servers)，或者开启内置服务器。
2. [Give each agent a kit](/langsmith/tool-gateway-tool-kits) 仅包含所需的工具。
3. [Let every user or agent connect their own account](/langsmith/tool-gateway-connect-accounts)、[choose whose credentials each call uses](/langsmith/tool-gateway-identity)。
4. [Set policies](/langsmith/tool-gateway-policies) 和 [record traces](/langsmith/tool-gateway-traces)，因此您可以控制并查看每个工具调用。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tool-gateway-quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。