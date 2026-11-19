<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add MCP servers to Tool Gateway | https://docs.langchain.com/langsmith/tool-gateway-servers -->

# 将MCP服务器添加到工具网关

为您的工作区或您自己向 Tool Gateway 注册远程 MCP 服务器，选择每个服务器所需的凭据，并使用内置服务器。

> [!注意]
>
> 工具网关位于[beta](/langsmith/release-stages)。

MCP 服务器是[Tool Gateway](/langsmith/tool-gateway) 为代理提供的工具的来源。工具网关与两种服务器配合使用：

* **您添加的服务器**：您注册的任何远程 MCP 服务器及其所需的凭据类型。
* **内置服务器**：LangSmith托管的用于公共服务的服务器。它们在每个工作区都可用，无需注册。

添加服务器声明它需要什么凭证，但不存储任何凭证。然后，每个用户、代理或配置文件连接其自己的帐户。参见[Connect accounts](/langsmith/tool-gateway-connect-accounts)。

## 添加您自己的 MCP 服务器

服务器必须使用基于 HTTPS 的 Streamable HTTP。工作区管理员可以为整个工作区添加服务器。工作区编辑者只能添加个人服务器。

在用户界面中：

1. 转至 **工具** > **MCP 服务器**，然后单击 **添加 MCP 服务器**。
2. 输入名称和服务器的 URL。
3. 选择服务器所需的凭据（如下一节所述），然后保存。在 API 中，将 `POST /v1/managed-tools/servers` 与 `name`、`upstream_url` 和 `connection` 一起发送。使用个人访问令牌，因为服务密钥无法添加服务器。如需完整请求，请参阅[Step 1 of the quickstart](/langsmith/tool-gateway-quickstart#step-1-add-mcp-servers)。

### 选择服务器需要什么凭据

每个服务器都会在每次调用时声明它对工具网关的期望。在 API 中，`connection` 字段保存此声明。要在添加使用 **API 密钥** 的工作区服务器时存储共享密钥，还需发送 `credential` 字段；参见[Connect accounts](/langsmith/tool-gateway-connect-accounts)。

* **公共**：服务器无需登录。
  * 用户界面：**公开**
  * API：`"connection": {"type": "none"}`
* **OAuth**：每个所有者在连接时使用服务登录。
  * **自动 OAuth**： LangSmith 从服务器自己的 OAuth 设置设置 OAuth。在 UI 中，选择 **OAuth** > **自动 OAuth**。在API中，使用`"connection": {"type": "oauth"}`。
  * **手动 OAuth**：使用现有的 [Agent Auth](/langsmith/agent-auth) 连接，例如您自己的 OAuth 应用程序。仅限管理员。在 UI 中，选择 **OAuth** > **手动 OAuth**，然后选择连接。在API中，使用`"connection": {"type": "oauth", "agent_auth_connection_slug": "<slug>"}`。
* **API 密钥**：服务器期望请求标头中包含 API 密钥。命名标头，每个所有者在连接时输入自己的密钥。
  * UI: **API key**，然后输入标头名称，如`X-Api-Key`。
  * API：

    ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    "connection": {
      "type": "secret",
      "fields": [{"name": "X-Api-Key", "injection": {"type": "header", "name": "X-Api-Key"}}]
    }
    ```对于使用 **API 密钥** 的工作区服务器，管理员可以为每个调用者存储一个共享密钥。参见[Connect accounts](/langsmith/tool-gateway-connect-accounts)。

如果添加服务器返回“尚不支持此 MCP 服务器”，则工具网关无法自动设置 OAuth。响应的`detail`给出了原因。如果服务器不使用 OAuth，请将其添加为 **Public** 或 **API key**。如果它需要您向提供商注册的 OAuth 应用程序，请使用 **手动 OAuth**。

### 选项

* **个人服务器**：添加服务器之前选择**个人**（API：`"scope": "personal"`）。只有您可以使用它，工作区工具包不能包含它。
* **专用网络**：使用 [tunnel](/langsmith/tunnels) URL 作为服务器 URL，并使用 **手动 OAuth** 或 **API 密钥**。

## 使用内置服务器

内置服务器列于 **工具** > **MCP 服务器**。在API中，内置有`"owner": "langsmith"`，其`id`是固定键，如`parallel`。|资质证书 |内置服务器|
| - | - |
|无 |基础，平行|
| OAuth | Excel、GitHub、Gmail、Google BigQuery、Google 日历、Google 文档、Google 云端硬盘、Google Meet、Google 表格、Google 幻灯片、线性、LinkedIn、OneDrive、Outlook、PowerPoint、Salesforce、SharePoint、Slack、Teams、Word、X |
| API 密钥 |阿波罗、阿什比、Exa、Pylon、塔维利 |

需要凭证的内置程序仍然需要 [connected account](/langsmith/tool-gateway-connect-accounts)。

## 列出服务器

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -sS "$LANGSMITH_ENDPOINT/v1/managed-tools/servers" \
  -H "X-Api-Key: $LANGSMITH_API_KEY" \
  -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID"
```

该列表包括工作区服务器、您的个人服务器和内置服务器。如果`next_cursor`不为空，则将其作为下一页的`cursor`查询参数传递。

## 删除服务器

在 UI 中，打开服务器的行操作并将其删除。在 API 中：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -sS -X DELETE "$LANGSMITH_ENDPOINT/v1/managed-tools/servers/<server-id>" \
  -H "X-Api-Key: $LANGSMITH_API_KEY" \
  -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID"
```

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tool-gateway-servers.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。