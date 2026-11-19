<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect accounts to Tool Gateway | https://docs.langchain.com/langsmith/tool-gateway-connect-accounts -->

# 将账户连接到工具网关

存储 Tool Gateway 用于为您自己、代理、配置文件或整个工作区调用 MCP 服务器的凭据。

> [!注意]
>
> 工具网关位于[beta](/langsmith/release-stages)。

连接帐户会存储 [Tool Gateway](/langsmith/tool-gateway) 在调用 MCP 服务器时附加的凭据。该凭据是 OAuth 令牌，或者是需要标头中包含该令牌的服务器的 API 密钥。

每个凭证都属于一个所有者。因此，同一服务器可以作为调用它的每个用户、代理或配置文件的不同帐户运行。有关工具网关如何在每次调用时选择所有者，请参阅[Credential owners](/langsmith/tool-gateway-how-it-works#credential-owners)。

添加服务器后连接帐户。公共服务器不需要凭据，因此无需连接。要添加服务器，请参阅[Add MCP servers](/langsmith/tool-gateway-servers)。

|业主|谁连接它 |哪里 |
| - | - | - |
| [You](#connect-your-own-account) |任何可以调用服务器的用户| **连接为** > **您** |
| [An agent](#connect-an-account-for-an-agent) |工作区管理员 | **连接为** > **代理** |
| [A profile](#connect-an-account-for-a-profile) |工作区管理员 | **连接为** > **个人资料** |
| [The workspace](#connect-one-api-key-for-the-workspace) |工作区管理员 |添加服务器或API时|

**连接为** 选择器位于 **工具** > **MCP 服务器** 上的 **工作空间** 视图中。本页上的 API 示例使用 [quickstart](/langsmith/tool-gateway-quickstart#before-you-begin) 中的环境变量。管理其他所有者的凭据需要用户凭据，例如个人访问令牌，而不是服务密钥。

## 连接您自己的帐户

连接您自己的帐户，以您自己的身份调用服务器，例如从使用您的 API 密钥的 MCP 客户端。每个用户单独连接，其他人无法使用您的凭据。

> [选项卡] 用户界面
>
> 1. 转至 **工具** > **MCP 服务器**。
> 2. 在服务器所在行，单击“**连接**”。
> 3. 完成服务器凭据类型的步骤：
> * **OAuth**：在打开的选项卡中，批准对服务的访问。 LangSmith 页面确认身份验证成功。
> * **API 密钥**：输入您的密钥，然后单击 **保存并连接**。
>
> 服务器的状态更改为 **已连接**。> [选项卡] API
>
> 对于 OAuth 服务器，启动连接并打印登录链接：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/kits/me/connections/<server-id>" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
>   | jq -r '.verification_url'
> ```
>
> 打开链接并批准访问。如果您已连接，或者服务器不需要凭据，则请求将返回 `204`，不带链接。
>
> 对于需要 API 密钥的服务器，请直接存储您的密钥。 `fields` 的键是服务器声明的标头名称。每个值都是完整的标头值，包括任何前缀，例如 `Bearer `：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> curl -sS -X PUT "$LANGSMITH_ENDPOINT/v1/managed-tools/servers/<server-id>/credential" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
>   -H "Content-Type: application/json" \
>   -d '{"fields": {"X-Api-Key": "<your-service-api-key>"}}'
> ```
>
> 再次发送请求将替换存储的密钥。工具网关从不返回存储的值。

您也可以在第一次需要时进行连接。您未连接的服务器上的工具调用会返回登录链接。参见[Call tools](/langsmith/tool-gateway-call-tools)。

## 连接代理账户

代理的凭据允许代理在使用绑定到代理环境的 API 密钥进行的调用时像其本身一样调用服务器。每个[agent environment](/langsmith/agent-environments)都拥有自己的凭据，因此代理的开发和生产环境可以使用不同的帐户。

连接代理需要`workspaces:credentials:manage`权限，以及代理环境的跟踪项目上的`projects:update`。> [选项卡] 用户界面
>
> 1. 进入**工具** > **MCP 服务器**，将**连接方式**设置为**代理**。
> 2. 选择代理，然后选择环境。
> 3. 在服务器行，单击“**连接**”，然后完成登录或输入代理的 API 密钥。

> [选项卡] API
>
> 使用 `GET /api/v1/agents/<agent-id>` 查找代理环境 ID，或使用 **复制代理环境 ID** 从 UI 复制它。然后为代理启动凭证会话：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/servers/<server-id>/credential-sessions?credential_owner_type=agent_identity&credential_owner_id=<agent-environment-id>" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID"
> ```
>
> 从响应中打开 `verification_url` 并使用代理应使用的帐户登录，或输入其 API 密钥。该链接是一次性的，并在 10 分钟后过期。对于使用客户端凭据的 OAuth 服务器，响应具有 `"status": "completed"` 并且没有链接，因为工具网关在请求期间连接它。
>
> 对于需要 API 密钥的服务器，您可以直接存储代理的密钥，并使用 `PUT /v1/managed-tools/servers/<server-id>/credential` 和相同的查询参数。

代理无法连接自己的凭据。如果缺少一个，代理的工具调用将返回`409`，直到管理员连接它。

要绑定代理调用的 API 密钥，请参阅[Call as an agent](/langsmith/tool-gateway-identity#call-as-an-agent)。

## 连接一个个人资料帐户配置文件是管理员连接一次的一组命名凭据，适用于在无人登录的情况下运行的代理或其他调用者。调用者通过在 `X-LangSmith-Profile` 标头中发送其 ID 来选择配置文件。参见[Act as users and agents](/langsmith/tool-gateway-identity)。

创建配置文件并连接其凭据需要 `workspaces:credentials:manage` 权限。连接服务器还需要调用该服务器的权限。

> [选项卡] 用户界面
>
> 1. 转到 **工具** > **MCP 服务器**，并将 **连接方式** 设置为 **配置文件**。
> 2. 点击**添加个人资料**，输入名称，例如`Support agent`，然后点击**创建个人资料**。
> 3. 在每个服务器的行上，单击“**连接**”，然后完成登录或输入配置文件的 API 密钥。
>
> 要复制选择配置文件的标题，请单击 **复制配置文件标题**。> [选项卡] API
>
> 创建配置文件并保存其 ID：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> export PROFILE_ID=$(curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/profiles" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
>   -H "Content-Type: application/json" \
>   -d '{"name": "Support agent"}' \
>   | jq -r '.id')
> ```
>
> 为配置文件所需的每个服务器启动凭证会话：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/profiles/$PROFILE_ID/servers/<server-id>/credential-sessions" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID"
> ```
>
> 从响应中打开 `verification_url`，然后代表个人资料登录或输入 API 密钥。与代理一样，该链接是一次性的，并在 10 分钟后过期，并且使用客户端凭据的 OAuth 服务器无需链接即可进行连接。
>
> 对于需要 API 密钥的服务器，您可以直接使用 `PUT /v1/managed-tools/profiles/$PROFILE_ID/servers/<server-id>/credential` 和 `fields` 主体存储密钥。

使用配置文件的调用者无法连接丢失的凭据。它的工具调用返回`409`，直到管理员连接为止。

要重命名或删除配置文件，请使用 UI 中配置文件的操作菜单，或者 `PATCH` 或 `DELETE /v1/managed-tools/profiles/<profile-id>`。删除配置文件会删除与其连接的每个凭据，并撤销其与提供商的 OAuth 令牌。使用该配置文件的代理停止工作。

## 为工作区连接一个 API 密钥

工作区凭证是服务器的每个调用者（包括工作区中的代理）使用的一个 API 密钥。将其用于每个人共享一个帐户的服务，这样任何用户都不需要连接自己的密钥。只有需要 API 密钥的工作区服务器才接受工作区凭证。设置1需要`workspaces:credentials:manage`权限。

> [!警告]
>
> 存储工作区凭据会永久删除服务器上每个用户、代理和配置文件的所有其他凭据。存储工作区凭据后，其他所有者都无法连接该凭据。

要在添加服务器时设置密钥，请选择 **API key**，将 **Credentials** 设置为 **Workspace**，然后输入密钥。在 API 中，在 `POST /v1/managed-tools/servers` 请求中包含 `"credential": {"owner_type": "workspace", "fields": {...}}`。参见[Add MCP servers](/langsmith/tool-gateway-servers)。

要设置或替换服务器上已存在的密钥，请使用 API：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -sS -X PUT "$LANGSMITH_ENDPOINT/v1/managed-tools/servers/<server-id>/credential?credential_owner_type=workspace&credential_owner_id=$LANGSMITH_WORKSPACE_ID" \
  -H "X-Api-Key: $LANGSMITH_API_KEY" \
  -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
  -H "Content-Type: application/json" \
  -d '{"fields": {"X-Api-Key": "<shared-service-api-key>"}}'
```

不需要 API 密钥或不是工作区服务器的服务器将返回 `409`。

## 断开帐户

断开连接会删除一个所有者的凭据，并保留服务器和所有其他所有者的凭据。在所有者再次连接之前，依赖该凭据的调用将会失败。断开连接会撤销与提供商的 OAuth 令牌。

要断开您自己的帐户：

* **UI**：在 **工具** > **MCP 服务器** 上，打开服务器，然后单击 **断开连接**。不要使用该行的删除操作，这会删除每个人的服务器。
* **API**：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl -sS -X DELETE "$LANGSMITH_ENDPOINT/v1/managed-tools/servers/<server-id>/credential" \
    -H "X-Api-Key: $LANGSMITH_API_KEY" \
    -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID"
  ```要断开另一个所有者的连接，请在 UI 中将 **连接为** 设置为该所有者，然后单击服务器行上的 **断开连接**。在 API 中，向名为以下的所有者发送相同的请求：

* **代理**：添加`?credential_owner_type=agent_identity&credential_owner_id=<agent-environment-id>`。
* **个人资料**：发送`DELETE /v1/managed-tools/profiles/<profile-id>/servers/<server-id>/credential`。
* **工作区**：添加`?credential_owner_type=workspace&credential_owner_id=$LANGSMITH_WORKSPACE_ID`。然后，调用者在连接自己的服务器之前就没有服务器的凭据。

如果所有者已断开连接，则请求返回`204`。

如果服务器使用 [Manual OAuth](/langsmith/tool-gateway-servers#choose-what-credentials-the-server-needs)，则您的凭证位于共享 [Agent Auth](/langsmith/agent-auth) 连接中。断开连接会将其从使用该连接的每个服务器和集成中删除。

## 另请参阅

* [How Tool Gateway works](/langsmith/tool-gateway-how-it-works)
* [Add MCP servers](/langsmith/tool-gateway-servers)
* [Act as users and agents](/langsmith/tool-gateway-identity)
* [Call tools](/langsmith/tool-gateway-call-tools)
* [Agent Auth](/langsmith/agent-auth)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tool-gateway-connect-accounts.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。