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
* **工作区管理员 [role](/langsmith/rbac#workspace-roles)。** 本快速入门为整个工作区添加了服务器和工具包，这需要工作区管理员。工作区编辑者只能添加个人服务器和套件。如果这适用于您，请按照以下说明中的个人选项进行操作。
* **A [personal access token](/langsmith/create-account-api-key).** 创建服务器和工具包需要用户凭据。服务密钥不适用于这些步骤。
* **您的工作区 ID**。每个 API 请求都会在 `X-Tenant-Id` 标头中发送它。
* **提供远程 MCP 服务器的两项服务上的帐户。** 本快速入门使用 Linear 和 Notion。要使用其他服务，请替换其 MCP URL 和工具名称。如果您遵循线性示例，请使用测试线性工作区，因为该套件包含一个可能会产生问题的工具。
* **支持 Streamable HTTP 并允许您设置自定义标头的 MCP 客户端**，其中包含您的 LangSmith API 密钥。本快速入门使用 [Claude Code](https://code.claude.com/docs/en/overview)。要在没有客户端的情况下调用这些工具，您可以使用 `curl` 发送 HTTP 请求。
* **[jq](https://jqlang.org/)**，如果您遵循 API 步骤。命令使用它来保存每个响应的 ID。> [!提示]
>
> 如果您没有 Linear 或 Notion 帐户，请使用公共 [LangChain docs MCP server](/use-these-docs) 代替。将其添加为 **公共** 服务器 (`"connection": {"type": "none"}`)，其 URL `https://docs.langchain.com/mcp`。跳过第 2 步，因为它不需要登录，并将其 `search_docs_by_lang_chain` 工具添加到您的套件中。

设置这些环境变量，以便您可以按原样将命令粘贴到此页面上。如果您的组织不在 GCP US 区域，请将 `LANGSMITH_ENDPOINT` 设置为您所在区域的 [Base URL](/langsmith/tool-gateway-api-ref#base-url) 网址。

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

为整个工作区注册一次 MCP 服务器及其所需的凭据类型。 Linear 和 Notion 这两个示例服务器都使用 OAuth。

> [选项卡] 用户界面
>
> 1. 在[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-tool-gateway-quickstart)中，转到**工具** > **MCP 服务器**。
> 2. 确保“**您**”和“**工作区**”为选定选项。
> 3. 单击“**添加 MCP 服务器**”。
> 4. 输入 `Linear` 作为名称，`https://mcp.linear.app/mcp` 作为 URL。
> 5. 选择“**OAuth**”，然后单击“**添加服务器**”。
> 6. 对 Notion 重复上述操作，使用 URL `https://mcp.notion.com/mcp`。
>
> 两台服务器均显示状态 **未连接**。> [选项卡] API
>
> 将 Linear 和 Notion 注册为使用 OAuth 登录的工作区服务器。每个命令都会将新服务器的 ID 保存在环境变量中，以供后续步骤使用：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> export LINEAR_SERVER_ID=$(curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/servers" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
>   -H "Content-Type: application/json" \
>   -d '{"name": "Linear", "upstream_url": "https://mcp.linear.app/mcp", "scope": "workspace", "connection": {"type": "oauth"}}' \
>   | jq -r '.id')
>
> export NOTION_SERVER_ID=$(curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/servers" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
>   -H "Content-Type: application/json" \
>   -d '{"name": "Notion", "upstream_url": "https://mcp.notion.com/mcp", "scope": "workspace", "connection": {"type": "oauth"}}' \
>   | jq -r '.id')
>
> echo "$LINEAR_SERVER_ID $NOTION_SERVER_ID"
> ```
>
> 最后一行打印两个 ID。如果打印 `null`，请运行不带 `| jq` 行的 `curl` 命令来查看错误。

> [!提示]
>
> 服务器名称和 URL 在工作区中必须是唯一的。如果有人已将 Linear 或 Notion 添加为工作区服务器，您将无法再次添加它们。要自行完成快速入门，请将两台服务器添加为个人服务器。在 UI 中选择 **个人** 代替 **工作空间**，或在 API 中发送 `"scope": "personal"`。

## 步骤 2. 连接您的帐户

每个服务登录一次。工具网关存储您的令牌并将其附加到充当您角色的每个后续调用。来自使用您的 API 密钥的 MCP 客户端的调用将充当您的角色。

> [选项卡] 用户界面
>
> 1. 在**工具** > **MCP 服务器**中，单击线性行上的**连接**。
> 2. 在打开的浏览器选项卡中，批准 Linear 中的访问。 LangSmith 页面应确认身份验证已成功。
> 3. 对概念重复上述步骤。
>
> 两台服务器现在均显示状态**已连接**。> [选项卡] API
>
> 启动 Linear 连接，并打印登录链接：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/kits/me/connections/$LINEAR_SERVER_ID" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
>   | jq -r '.verification_url'
> ```
>
> 打开链接并批准访问。然后等待LangSmith确认认证成功的页面。重复`$NOTION_SERVER_ID`。如果该命令没有打印任何内容，则表明您已经连接。

## 步骤 3. 创建工具包

工具包是一组精选的工具，来自任意数量的服务器，工具网关为一个 MCP URL 上的代理提供服务。

> [选项卡] 用户界面
>
> 1. 转到 **工具** > **工具包**。
> 2. 选择 **工作空间** 选项后，单击 **创建工具包**。
> 3. 输入`Quickstart kit`作为名称，并将谁可以使用它设置为**工作空间**。如果您在步骤 1 中添加了个人服务器，请选择“**个人**”。
> 4. 在工具选择器中，按服务器过滤并从 Linear 选择 `list_issues` 和 `save_issue`，从 Notion 中选择 `notion-search`。
> 5. 单击 **查看工具选择**，然后单击 **创建工具包**。
> 6. 打开您创建的工具包进行检查。
>
> 该工具包的面板列出了代理所看到的工具，并显示了该工具包的 MCP URL。套件 ID 是该 URL 中`/kits/` 和 `/mcp` 之间的 UUID。保存以供下一步使用：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> export KIT_ID="<kit-id>"
> ```> [选项卡] API
>
> 创建套件，并保存其 ID：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> export KIT_ID=$(curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/kits" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
>   -H "Content-Type: application/json" \
>   -d "{
>     \"name\": \"Quickstart kit\",
>     \"scope\": \"workspace\",
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
> 如果您在步骤 1 中添加了个人服务器，请将 `"scope"` 更改为 `"personal"`。如果该命令打印 `null`，请在不包含 `| jq` 行的情况下运行它以查看错误。

工作区中的所有用户都可以查看和使用工作区套件。拥有 [custom role](/langsmith/rbac) 的用户还需要查看和调用 MCP 服务器的权限。套件名称在工作区中必须是唯一的。如果使用了`Quickstart kit`，请选择其他名称。

> [!提示]
>
> 代理将服务器名称下的每个工具视为前缀，例如 `linear_list_issues`、`linear_save_issue` 和 `notion_notion-search`。工具命名及其他套件设置请参见[Create tool kits](/langsmith/tool-gateway-tool-kits)。

## 步骤 4. 从 MCP 客户端调用工具

工具包是标准的 Streamable HTTP MCP 端点。您的代理或编码助理作为 MCP 客户端连接到它。客户端发送您的 LangSmith API 密钥，工具网关将您存储的 Linear 和 Notion 令牌附加到每次调用。> [选项卡] 克劳德·代码
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
> 响应的 `result.content` 保存了 Notion 的搜索结果，未更改地传递。有关原始请求的更多信息，请参阅[Call tools](/langsmith/tool-gateway-call-tools)。

## 后续步骤

现在，您应该拥有一个 MCP URL，该 URL 可以为来自两个服务的工具提供服务，每个服务都使用您自己的帐户进行调用，而客户端中无需任何身份验证代码。

测试完成后，删除套件和您添加的服务器，以避免将来的测试人员遇到错误。> [!警告]
>
> 删除服务器会删除其所有连接的帐户。如果您添加了工作区服务器，它们对于工作区中的每个人来说都会消失。仅当没有其他人使用它们时才删除它们。

> [选项卡] 用户界面
>
> 1. 如果您已将套件添加到 Claude Code，请使用 `claude mcp remove quickstart-kit` 将其删除。
> 2. 进入**工具** > **工具包**，打开`Quickstart kit`。单击“**删除**”，然后确认。
> 3. 转至 **工具** > **MCP 服务器**。打开线性行的操作，然后删除服务器（假设这只是一个测试）。
> 4. 对概念重复上述步骤。

> [选项卡] API
>
> 如果您已将该套件添加到 Claude Code，请将其删除：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> claude mcp remove quickstart-kit
> ```
>
> 删除套件，然后删除两台服务器（如果它们仅用于测试）：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> curl -sS -X DELETE "$LANGSMITH_ENDPOINT/v1/managed-tools/kits/$KIT_ID" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID"
>
> for SERVER_ID in "$LINEAR_SERVER_ID" "$NOTION_SERVER_ID"; do
>   curl -sS -X DELETE "$LANGSMITH_ENDPOINT/v1/managed-tools/servers/$SERVER_ID" \
>     -H "X-Api-Key: $LANGSMITH_API_KEY" \
>     -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID"
> done
> ```
>
> 每个请求成功时都会返回 `204` 且正文为空。

要在此设置的基础上进行构建：

1. [Add more servers](/langsmith/tool-gateway-servers)，或者开启内置服务器。
2. [Give each agent a kit](/langsmith/tool-gateway-tool-kits) 仅配备所需的工具。
3. [Let every user or agent connect their own account](/langsmith/tool-gateway-connect-accounts)、[choose whose credentials each call uses](/langsmith/tool-gateway-identity)。
4. [Set policies](/langsmith/tool-gateway-policies) 和 [record traces](/langsmith/tool-gateway-traces)，因此您可以控制并查看每个工具调用。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tool-gateway-quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。