<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Act as users and agents | https://docs.langchain.com/langsmith/tool-gateway-identity -->

# 充当用户和代理

选择每个工具网关调用使用谁的凭据，以便代理可以作为每个最终用户、他们自己或使用共享配置文件凭据来调用工具。

> [!注意]
>
> 工具网关位于[beta](/langsmith/release-stages)。

调用者发送到[Tool Gateway](/langsmith/tool-gateway)的凭证决定每个工具调用使用谁的连接帐户。为许多最终用户提供服务的产品可以使用每个用户自己的帐户来调用工具。在无人登录的情况下运行的代理可以使用自己的凭据或共享配置文件调用工具。有关此层如何与其他两层身份验证配合的信息，请参阅[How Tool Gateway works](/langsmith/tool-gateway-how-it-works#three-layers-of-authentication)。

此页面涵盖调用方：每个请求发送的内容。要连接用户、客服人员或个人资料呼叫所用的帐户，请参阅 [Connect accounts](/langsmith/tool-gateway-connect-accounts)。

## 选择一个凭证|资质证书 |当 | 时使用它通话使用谁的帐户 |它能达到什么 |
| - | - | - | - |
| [Personal access token](#call-as-yourself) |您可以从 Claude Code、Cursor 或脚本调用工具 |你自己的 |管理 API 和 MCP 调用 |
| LangSmith 会议 |您在LangSmith UI 中使用工具网关 |你自己的 |管理 API 和 MCP 调用 |
| [Service key and the user's identity provider token](#send-a-user-token-with-a-service-key) |多用户后端为其登录用户服务 |最终用户的 |列出服务器和 MCP 调用 |
| [Service key and ⟦T6⟧](#name-the-user-from-your-backend) |后端自行命名其用户 |指定用户的 |列出服务器和 MCP 调用 |
| [Identity provider token only](#send-only-a-user-token) |用户或应用程序使用您公司的身份进行呼叫，但没有 LangSmith 密钥 |最终用户的 |仅 MCP 呼叫 |
| [API key bound to an agent environment](#call-as-an-agent) |已部署的代理将工具称为自身 |代理|列出服务器和 MCP 调用 |
| [Service key and ⟦T7⟧](#call-with-a-profile) |代理、作业或部署在无人登录的情况下运行 |个人资料的 |列出服务器和 MCP 调用 |

服务密钥可以列出服务器并调用工具，但不能创建服务器或工具包，也不能连接其他所有者的凭据。为这些使用个人访问令牌。密钥类型的区别请参见[API keys](/langsmith/administration-overview#api-keys)。每个呼叫都充当一个身份。指定多个名称的请求（例如 `X-LangSmith-Profile` 与 `X-LangSmith-Identity` 或最终用户的令牌）将被拒绝，并显示 `400`。

## 以您自己的身份调用

要使用您自己的连接帐户调用工具，请在 `X-Api-Key` 中发送您的个人访问令牌。不需要其他标头。这就是[quickstart](/langsmith/tool-gateway-quickstart)和[MCP clients](/langsmith/tool-gateway-clients)调用工具网关的方式。

```http theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
X-Api-Key: <personal-access-token>
X-Tenant-Id: <workspace-id>
```

个人访问令牌始终充当其所有者。工具网关忽略作为用户进行身份验证的请求上的`X-LangSmith-Identity`。

## 作为您的最终用户致电

如果您的产品为许多最终用户调用工具，则每个调用都可以以该用户身份运行，并使用该用户连接的帐户。选择三种模式之一。其中两个使用来自公司身份提供商的访问令牌，例如 Okta 或 Microsoft Entra ID。这两个首先需要工作区管理员[link the identity provider](#link-your-identity-provider)。

代表最终用户的服务密钥需要`workspaces:credentials:use`或`agent-auth-credentials:use`权限。工作区管理员角色和 [deployment runtime keys](/langsmith/agent-environments) 具有其中之一。没有任何许可的密钥将获得 `403`。

用户第一次调用尚未连接的服务器时，该调用将返回登录链接而不是运行。将链接传递给用户，然后在连接后重试呼叫。参见[When the caller is a user](/langsmith/tool-gateway-call-tools#when-the-caller-is-a-user)。

### 链接您的身份提供商通过链接身份提供者，工具网关可以接受提供者颁发的访问令牌，并将每个令牌与其指定的用户进行匹配。工作区链接一个身份提供者。

链接身份提供商需要 `workspaces:integrations:manage` 权限和个人访问令牌或 LangSmith 会话，而不是服务密钥。

要链接身份提供商：

1. 转到**工具**，然后单击**配置 OIDC**。
2. 在 **身份提供商** 对话框中，选择一个现有提供商并单击 **链接**，或添加一个新提供商：
   * **显示名称**：提供者的名称，例如`Okta`。
   * **Slug**：短标识符，例如`okta`。
   * **发行者**：您的提供商的发行者 URL。工具网关将其与每个令牌的`iss`声明进行匹配。
   * **受众**：您的提供商为其发行代币的受众。
3. 单击“**添加并链接**”。

要删除链接，请打开同一对话框并取消链接提供程序。来自提供商的令牌在下一次调用时停止工作。

### 发送带有服务密钥的用户令牌将此模式用于为许多用户提供服务的后端。在后端保留一个服务密钥，而不是在浏览器中，并将每个最终用户的访问令牌与其一起发送。工具网关根据链接的身份提供者验证令牌，并且调用以令牌名称的用户身份运行。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/managed-tools/kits/<kit-id>/mcp" \
  -H "X-Api-Key: <service-key>" \
  -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
  -H "Authorization: Bearer <user-access-token>" \
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

只发送一个 `Authorization` 标头。链接的提供商未颁发或已过期的令牌将返回 `401`。不要在同一请求中发送 `X-LangSmith-Identity`。

### 从您的后端命名用户

如果您的后端已经知道用户是谁，请发送服务密钥并在 `X-LangSmith-Identity` 标头中命名用户。当您的用户不通过您可以链接的身份提供商登录时，请使用此模式。

```http theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
X-Api-Key: <service-key>
X-Tenant-Id: <workspace-id>
X-LangSmith-Identity: <provider>:<user-id>
```

该值为`provider:user-id`，例如`gtm:user-123`，或来自[Agent Auth](/langsmith/agent-auth)的用户主体ID。每个不同的值都是一个单独的用户，具有单独的连接帐户。

> [!警告]
>
> 工具网关信任发送的 `X-LangSmith-Identity` 值。任何持有服务密钥的调用者都可以充当任何用户。仅从您控制的后端发送标头，切勿将服务密钥暴露给浏览器或最终用户。

### 仅发送用户令牌用户或应用程序可以仅使用用户的访问令牌来调用工具包或服务器，而无需使用LangSmith密钥。发送令牌作为请求的唯一凭证：

```http theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Authorization: Bearer <user-access-token>
```

这种模式有局限性：

* 它仅适用于对工具包或服务器端点的 MCP 调用，不适用于管理 API。
* 它不适用于 [me kit](/langsmith/tool-gateway-tool-kits#use-the-me-kit)，因为 me 套件不属于任何单个工作区。
* 对内置服务器端点的调用还必须发送 `X-Tenant-Id`，以便工具网关知道要检查哪个工作区的身份提供者。

> [!警告]
>
> 仅通过身份提供者令牌进行身份验证的调用者可以访问工作区中的任何服务器或工具包。通过套件，它仅到达套件包含的工具。控制身份提供商向哪些用户和应用程序颁发令牌的访问权限，并使用 [policies](/langsmith/tool-gateway-policies) 限制这些调用者可以调用的内容。

## 作为代理致电

部署的代理可以通过管理员为其[agent environment](/langsmith/agent-environments)连接的凭据来调用工具本身。发送绑定到该代理环境的 API 密钥。工具网关识别密钥并使用代理的凭据，无需额外的标头。

```http theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
X-Api-Key: <agent-environment-api-key>
X-Tenant-Id: <workspace-id>
```

该密钥还需要 `workspaces:credentials:use` 或 `agent-auth-credentials:use` 权限。

要将密钥绑定到代理环境：1. 在代理的概述页面上，单击设置图标，然后选择 **API 密钥**。
2. 在该环境下，从“**添加服务密钥…**”中选择现有的服务密钥，或单击“**创建密钥**”创建服务密钥并绑定。创建密钥还需要`organization:pats:create`权限。

绑定密钥需要`workspaces:manage-keys`权限，以及代理环境的跟踪项目上的`projects:update`。一把密钥一次可以属于一个代理环境。 **API 密钥** 选项仅针对 [agent traced from outside LangSmith](/langsmith/create-an-agent#name-an-agent-traced-from-outside-langsmith) 出现。 LangSmith部署的代理不需要绑定：其部署运行所使用的API密钥已经属于其代理环境。

由于每个代理环境都拥有自己的凭据，因此代理的开发和生产环境可以使用不同的帐户调用同一服务器。要连接代理的凭据，请参阅[Connect an account for an agent](/langsmith/tool-gateway-connect-accounts#connect-an-account-for-an-agent)。

代理无法连接自己的帐户，因为没有人在场登录。对代理未连接的服务器的调用会返回 `409`，工作区管理员必须连接它。

如果带有代理密钥的请求还发送 `X-LangSmith-Profile` 或命名最终用户，则使用该身份而不是代理的身份。

## 使用个人资料进行通话[profile](/langsmith/tool-gateway-connect-accounts#connect-an-account-for-a-profile) 是工作区管理员连接一次的一组命名凭据。使用代理、计划作业或在无人登录的情况下运行的部署的配置文件。示例包括夜间报告代理和通过共享 GitHub 帐户工作的编码代理。

在 `X-LangSmith-Profile` 标头中添加配置文件的 ID：

```http theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
X-Api-Key: <service-key>
X-Tenant-Id: <workspace-id>
X-LangSmith-Profile: <profile-id>
```

要从 UI 复制标头，请在 **工具** > **MCP 服务器** 上将 **连接为** 设置为 **配置文件**，选择配置文件，然后单击 **复制配置文件标头**。要使用 API 列出配置文件 ID，请发送 `GET /v1/managed-tools/profiles`。

使用配置文件需要 `workspaces:credentials:use` 或 `agent-auth-credentials:use` 权限。工作区管理员、具有工作区管理员角色的服务密钥以及部署运行时密钥均符合资格。其他钥匙得到`403`。

配置文件仅适用于工作区工具包和工作区服务器，不适用于个人工具包和工作区服务器。对配置文件未连接的服务器的调用会返回 `409`，工作区管理员必须连接它。

## 修复身份错误

该表中的错误来自请求如何命名其身份。其他错误请参见[Errors](/langsmith/tool-gateway-call-tools#errors)。|状态 |原因 |该怎么办 |
| - | - | - |
| `400` |该请求命名多个身份，例如配置文件和用户，或用户的令牌和`X-LangSmith-Identity`。 |发送 `X-LangSmith-Profile`、`X-LangSmith-Identity` 之一或用户的令牌。 |
| `400` | `X-LangSmith-Identity` 不是 `provider:user-id` 或主体 ID，或者 `X-LangSmith-Profile` 不是配置文件 ID。 |修复标题值。 |
| `401` |用户的访问令牌已过期、格式错误或不是来自链接的身份提供商。 |从提供商[linked to the workspace](#link-your-identity-provider)发送一个当前令牌。 |
| `403` |服务密钥未发送用户身份，或者密钥缺少 `workspaces:credentials:use` 或 `agent-auth-credentials:use`。 |命名用户，或使用具有这些权限之一的密钥。 |
| `404` |此工作区中不存在该配置文件。 |使用`GET /v1/managed-tools/profiles`检查ID。 |
| `409` |代理或配置文件没有呼叫所需的服务器的凭据。 |请工作区管理员[connect it](/langsmith/tool-gateway-connect-accounts)。 |

## 另请参阅

* [Connect accounts](/langsmith/tool-gateway-connect-accounts)
* [Call tools through Tool Gateway](/langsmith/tool-gateway-call-tools)
* [How Tool Gateway works](/langsmith/tool-gateway-how-it-works)
* [Set policies](/langsmith/tool-gateway-policies)
* [Agent environments](/langsmith/agent-environments)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tool-gateway-identity.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。