<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add identity to Managed Deep Agents | https://docs.langchain.com/langsmith/python/managed-deep-agents-identity -->

# 将身份添加到托管Deep Agents

使用 LangSmith API 密钥、Supabase、另一个 JWT 提供商或您自己的后端对托管 Deep Agents 部署的调用者进行身份验证。

身份控制谁可以调用您的托管深度代理，例如开始运行或发送消息的应用程序和 SDK 客户端。

> [!注意]
>
> 托管 Deep Agents 于 [LangSmith Cloud](/langsmith/cloud) **公开 [beta](/langsmith/release-stages)**。

将身份声明放在项目根目录下：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
my-agent/
  agent.py
  identity.py
```

完整的项目布局，请参阅[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

## 选择身份提供商

默认情况下，`mda init`要求调用者提供LangSmith API密钥。拥有该密钥的任何人都可以使用相同的部署，并且可能会看到相同的线程。要为每个登录的最终用户提供私人对话，请使用 Supabase、另一个 JWT 提供商或您自己的后端：

|目标|使用|
| - | - |
|锁定 SDK 客户端、脚本和服务的部署 | [LangSmith API key (default)](#configure-identity-with-a-langsmith-api-key) |
|通过私人聊天登录的最终用户，由托管 Deep Agents 验证 | [Supabase](#configure-identity-with-supabase) |
|来自其他身份提供商（例如 Auth0、Okta、Clerk 或 Microsoft Entra ID）的登录最终用户 | [Another JWT provider](#configure-identity-with-another-jwt-provider) |
|通过私人聊天登录的最终用户，已通过您自己的 API 进行身份验证 | [Your own backend](#configure-identity-with-your-own-backend) |Supabase、另一个 JWT 提供商和后端身份都为每个最终用户提供私有线程。区别在于由谁来验证用户。使用 Supabase 或其他 JWT 提供商，浏览器会发送其访问令牌，并由 Managed Deep Agents 进行验证。通过后端身份，您的 API 可以验证用户并断言生成的用户 ID。

欲了解更多信息，请参阅[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

> [!注意]
>
> 在托管部署中，LangSmith Studio 通过单独的工作区验证路径到达部署。具有对 LangSmith 工作区的 API 访问权限的调用者可以读取和搜索部署中的每个线程，无论您选择哪个身份提供商。该调用者无法修改最终用户拥有的线程。因此，每用户隐私针对的是您的最终用户，而不是针对您的 LangSmith 工作区的成员。

## 使用 LangSmith API 密钥配置身份

`mda init` 将此身份提供者作为安全默认设置。调用者必须提供有效的 LangSmith 工作区 API 密钥。托管Deep Agents 使用LangSmith 云验证密钥。

```python identity.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import auth, define_identity

identity = define_identity(auth=auth.langsmith_api_key())
```

客户端将密钥作为`x-api-key`发送。您不需要将验证端点或租户设置添加到您的项目`.env`。 LangSmith 云提供这些。> [!警告]
>
> 任何拥有密钥的人都可以访问部署，因此请将密钥视为秘密。此默认值不会为每个最终用户提供私有线程。如果 Alice 不能看到 Bob 的线程，请使用 [Supabase](#configure-identity-with-supabase)、[another JWT provider](#configure-identity-with-another-jwt-provider) 或 [your own backend](#configure-identity-with-your-own-backend)。

## 使用 Supabase 配置身份

当浏览器或其他客户端作为登录实体调用部署时，使用 Supabase。每个用户都有私有线程。托管 Deep Agents 为您配置该所有权。有关底层 LangSmith 部署模式的更多信息，请参阅 [Make conversations private](/langsmith/resource-auth)。

**1.在 Supabase 中启用身份验证**

在 Supabase 仪表板中，启用您将使用的身份验证提供程序（例如电子邮件/密码）。

**2.复制项目参考**

复制项目引用：项目 URL 中`.supabase.co` 之前的子域。

**3.声明身份**

声明与该项目引用的身份：

```python identity.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import auth, define_identity

identity = define_identity(
    auth=auth.supabase(project_ref="your-project-ref"),
)
```

传递 `url` 而不是自定义身份验证域的项目引用。

**4.从客户端发送访问令牌**

在客户端应用程序中，设置 Supabase 项目 URL 和可发布密钥（在 Supabase 仪表板中标记为 `anon`）。让用户登录，然后在每个部署请求上发送访问令牌：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import httpx

response = httpx.post(
    f"{deployment_url}/threads/{thread_id}/runs",
    headers={
        "Authorization": f"Bearer {supabase_access_token}",
        "Content-Type": "application/json",
    },
    json=run_body,
)
```可发布密钥（在 Supabase 仪表板中标记为 `anon`）仅供客户端登录 Supabase。在此模式下请勿发送 LangSmith API 密钥。承载令牌是调用者身份。

托管 Deep Agents 根据从项目引用 (`https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`) 派生的项目 JWKS URL 验证 JWT。

> [!注意]
>
> 将 Supabase 身份添加到现有部署不会将所有者元数据添加到现有线程。在依赖这些线程的基于身份的访问之前规划并测试迁移。

## 使用另一个 JWT 提供商配置身份

当您的用户使用颁发 JWT 访问令牌的身份提供商（例如 Auth0、Okta、Clerk 或 Microsoft Entra ID）登录时，请使用此选项。托管Deep Agents根据提供者的公钥检查令牌签名，然后为每个用户提供私有线程。

声明提供者及其发行者、您的代币使用的受众以及识别用户的声明：

```python identity.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_identity

identity = define_identity(
    auth={
        "issuer": "https://your-tenant.us.auth0.com/",
        "audience": "https://api.example.com",
        "discover": True,
        "claims": {"user": "sub"},
    }
)
```* **`issuer`**：必须与令牌中的 `iss` 声明匹配。
* **`audience`**：必须与令牌中的 `aud` 声明匹配。
* **`discover`**：从提供商的`/.well-known/openid-configuration`查找公钥。如果您的提供商未发布该文档，请删除 `discover` 并将 `jwks` 设置为公钥的 URL。
* **`claims.user`**：命名用作用户 ID 的声明。线程和存储的凭据取决于此值。您还可以设置`claims.groups`和`claims.email`。

客户端发送访问令牌为`Authorization: Bearer <access_token>`，与[Supabase example](#send-the-access-token)相同。

您的工具和中间件可以从`principal.claims`读取令牌中的每个经过验证的声明。有关示例，请参阅[Read the runtime in tools](/langsmith/python/managed-deep-agents-runtime#read-the-runtime-in-tools)。

## 使用您自己的后端配置身份

当您自己的 API 已经对用户进行身份验证并代表他们调用部署时，请使用后端身份。您的后端通过共享秘密证明自己并命名调用者。托管Deep Agents仅在秘密匹配后才信任该名称，然后为每个指定用户提供私有线程。

在此模式下，浏览器永远不会到达部署。请求从浏览器发送到您的 API，然后从您的 API 发送到部署。

**1.声明身份**

```python identity.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_identity

identity = define_identity(auth="backend")
```

**2.生成入口秘密**

生成一个随机值并将其添加到项目`.env`作为`MDA_INGRESS_SECRET`：```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
openssl rand -hex 32
```

```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
MDA_INGRESS_SECRET=<MDA_INGRESS_SECRET>
```

`mda deploy` 将值作为托管部署机密转发。声明没有此值的后端身份的项目将无法在任何构建工作之前进行部署预检，因为部署将拒绝每个带有 401 的请求。有关 `.env` 值如何到达部署，请参阅 [Deploy](/langsmith/python/managed-deep-agents-deploy#secrets-and-environment-files)。

**3.从您的后端发送两个标头**

在您自己的 API 中对用户进行身份验证，然后在每个部署请求中发送密钥和解析后的用户 ID：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import httpx

response = httpx.post(
    f"{deployment_url}/threads/{thread_id}/runs",
    headers={
        "x-mda-ingress-secret": mda_ingress_secret,
        "x-mda-user-id": user_id,
        "Content-Type": "application/json",
    },
    json=run_body,
)
```

对 `x-mda-user-id` 使用您自己的系统为该用户使用的相同标识符，并在各个会话中保持稳定。线程和存储的凭据都以此值为关键，因此使用新标识符到达的用户会到达一组不同的线程。

> [!警告]
>
> `MDA_INGRESS_SECRET` 是服务器端秘密。托管 Deep Agents 接受任何 `x-mda-user-id` 附带有效秘密的内容，因此任何秘密持有者都可以充当任何用户。将其保留在后端，而不是在浏览器代码、移动应用程序或客户端捆绑包中。

## 组织或租户的范围访问

托管 Deep Agents 不接受 [custom LangGraph auth handler](/langsmith/custom-auth)。它自己的处理程序将线程、存储的凭据和用户内存存储在用户 ID 上。更换处理程序会破坏这些功能。要按组织或租户确定访问范围，请根据用户必须共享的内容选择用户 ID：

* 如果组织中的每个人都应共享线程和凭据，请使用组织 ID 作为用户 ID。
* 如果每个人都需要私有线程，请使用该人的 ID。然后在调用部署之前检查后端中的组织，或者在工具和中间件中读取来自 `principal.claims` 的组织声明。

## 测试和部署

使用[⟦T39⟧](/langsmith/python/managed-deep-agents-cli#develop-locally)在本地测试项目，然后使用[⟦T40⟧](/langsmith/python/managed-deep-agents-deploy)进行部署。在LangSmith中打开部署跟踪以检查模型调用、工具调用、错误和延迟。身份验证失败返回 401。对于 LangSmith API 密钥默认值，请确认客户端发送 `x-api-key`。对于 Supabase，确认客户端发送 `Authorization: Bearer <access_token>`、`project_ref` / `projectRef` 与您的 Supabase 项目匹配，并且调用方无法访问其他用户的线程 (403)。对于另一个 JWT 提供程序，确认 `issuer` 和 `audience` 与令牌中的 `iss` 和 `aud` 声明匹配，并且调用者无法访问其他用户的线程 (403)。对于后端身份，请确认您的 API 发送 `x-mda-ingress-secret` 和 `x-mda-user-id`，密钥与部署上的 `MDA_INGRESS_SECRET` 匹配，并且一个用户的标识符无法到达另一用户的线程 (403)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-identity.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。