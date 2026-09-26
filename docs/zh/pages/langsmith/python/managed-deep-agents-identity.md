<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add identity to Managed Deep Agents | https://docs.langchain.com/langsmith/python/managed-deep-agents-identity -->

# 将身份添加到托管Deep Agents

身份控制谁可以调用您的托管深度代理，例如开始运行或发送消息的应用程序和 SDK 客户端。

<Note>
托管 Deep Agents 在 **公共 [beta](/langsmith/release-stages)** 中可用，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

将身份声明放在项目根目录下：

```text
my-agent/
  agent.py
  identity.py
```




完整的项目布局请参见[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

## 选择身份提供商

默认情况下，`mda init`要求调用者提供LangSmith API密钥。拥有该密钥的任何人都可以使用相同的部署，并且可能会看到相同的线程。要为每个登录的最终用户提供私人对话，请改用 Supabase：

|目标|使用 |
| ---| ---|
|锁定 SDK 客户端、脚本和服务的部署 | [LangSmith API key (default)](#configure-identity-with-a-langsmith-api-key) |
|通过私人聊天登录的最终用户，由托管 Deep Agents 验证 | [Supabase](#configure-identity-with-supabase) |
|通过私人聊天登录的最终用户，已通过您自己的 API 进行身份验证 | [Your own backend](#configure-identity-with-your-own-backend) |

Supabase 和后端身份都为每个最终用户提供私有线程。区别在于由谁来验证用户。使用 Supabase，浏览器发送其访问令牌并由 Managed Deep Agents 验证它。通过后端身份，您的 API 可以验证用户并断言生成的用户 ID。

欲了解更多信息，请参阅[Project structure](/langsmith/python/managed-deep-agents-project-structure)。<Note>
在托管部署中，LangSmith Studio 通过单独的工作区验证路径到达部署。具有对 LangSmith 工作区的 API 访问权限的调用者可以读取和搜索部署中的每个线程，无论您选择哪个身份提供商。该调用者无法修改最终用户拥有的线程。因此，每用户隐私针对的是您的最终用户，而不是针对您的 LangSmith 工作区的成员。
</Note>

## 使用 LangSmith API 密钥配置身份

`mda init` 将此身份提供者作为安全默认设置。调用者必须提供有效的 LangSmith 工作区 API 密钥。托管 Deep Agents 使用 LangSmith 云验证密钥。

```python identity.py
from managed_deepagents import auth, define_identity

identity = define_identity(auth=auth.langsmith_api_key())
```




客户端以`x-api-key`的形式发送密钥。您不需要将验证端点或租户设置添加到您的项目`.env`。 LangSmith 云提供这些。

<Warning>
任何拥有密钥的人都可以访问部署，因此请将密钥视为秘密。此默认值不会为每个最终用户提供私有线程。如果 Alice 不能看到 Bob 的线程，请使用 [Supabase](#configure-identity-with-supabase) 或 [your own backend](#configure-identity-with-your-own-backend)。
</Warning>

## 使用 Supabase 配置身份当浏览器或其他客户端作为登录实体调用部署时，使用 Supabase。每个用户都有私有线程。托管 Deep Agents 为您配置该所有权。有关底层 LangSmith 部署模式的更多信息，请参阅 [Make conversations private](/langsmith/resource-auth)。

<Steps>
  <Step title="Enable auth in Supabase" id="enable-auth-in-supabase">

在 Supabase 仪表板中，启用您将使用的身份验证提供程序（例如电子邮件/密码）。

  </Step>
  <Step title="Copy the project reference" id="copy-the-project-reference">

复制项目引用：项目 URL 中`.supabase.co` 之前的子域。

  </Step>
  <Step title="Declare identity" id="declare-supabase-identity">

声明与该项目引用的身份：

```python identity.py
from managed_deepagents import auth, define_identity

identity = define_identity(
    auth=auth.supabase(project_ref="your-project-ref"),
)
```




传递 `url` 而不是自定义身份验证域的项目引用。

  </Step>
  <Step title="Send the access token from the client" id="send-the-access-token">

在客户端应用程序中，设置 Supabase 项目 URL 和可发布密钥（在 Supabase 仪表板中标记为 `anon`）。让用户登录，然后在每个部署请求上发送访问令牌：

```python
import httpx

response = httpx.post(
    f"{deployment_url}/threads/{thread_id}/runs",
    headers={
        "Authorization": f"Bearer {supabase_access_token}",
        "Content-Type": "application/json",
    },
    json=run_body,
)
```




可发布密钥（在 Supabase 仪表板中标记为 `anon`）仅供客户端登录 Supabase。在此模式下请勿发送 LangSmith API 密钥。承载令牌是调用者身份。

托管 Deep Agents 根据从项目引用 (`https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`) 派生的项目 JWKS URL 验证 JWT。<Note>
将 Supabase 身份添加到现有部署不会将所有者元数据添加到现有线程。在依赖这些线程的基于身份的访问之前规划并测试迁移。
</Note>

  </Step>
</Steps>

## 使用您自己的后端配置身份

当您自己的 API 已经对用户进行身份验证并代表他们调用部署时，请使用后端身份。您的后端通过共享秘密证明自己并命名调用者。托管Deep Agents仅在秘密匹配后才信任该名称，然后为每个指定用户提供私有线程。

在此模式下，浏览器永远不会到达部署。请求从浏览器发送到您的 API，然后从您的 API 发送到部署。

<Steps>
  <Step title="Declare identity" id="declare-backend-identity">

```python identity.py
from managed_deepagents import define_identity

identity = define_identity(auth="backend")
```




  </Step>
  <Step title="Generate the ingress secret" id="generate-the-ingress-secret">

生成一个随机值并将其添加到项目`.env`作为`MDA_INGRESS_SECRET`：

```bash
openssl rand -hex 32
```

```text .env
MDA_INGRESS_SECRET=<MDA_INGRESS_SECRET>
```

`mda deploy` 将值作为托管部署机密转发。声明没有此值的后端身份的项目将无法在任何构建工作之前进行部署预检，因为部署将拒绝带有 401 的每个请求。有关 `.env` 值如何到达部署，请参阅 [Deploy](/langsmith/python/managed-deep-agents-deploy#secrets-and-environment-files)。

  </Step>
  <Step title="Send both headers from your backend" id="send-both-headers">在您自己的 API 中对用户进行身份验证，然后在每个部署请求中发送密钥和解析后的用户 ID：

```python
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




对 `x-mda-user-id` 使用您自己的系统用于该用户的相同标识符，并在会话中保持其稳定。线程和存储的凭据都以此值为关键，因此使用新标识符到达的用户会到达一组不同的线程。

  </Step>
</Steps>

<Warning>
`MDA_INGRESS_SECRET` 是服务器端秘密。托管 Deep Agents 接受任何 `x-mda-user-id` 附带有效秘密的内容，因此任何秘密持有者都可以充当任何用户。将其保留在后端，而不是在浏览器代码、移动应用程序或客户端捆绑包中。
</Warning>

## 测试和部署

使用[⟦T24⟧](/langsmith/python/managed-deep-agents-cli#develop-locally)在本地测试项目，然后使用[⟦T25⟧](/langsmith/python/managed-deep-agents-deploy)进行部署。在LangSmith中打开部署跟踪以检查模型调用、工具调用、错误和延迟。身份验证失败返回 401。对于 LangSmith API 密钥默认值，请确认客户端发送 `x-api-key`。对于 Supabase，确认客户端发送 `Authorization: Bearer <access_token>`、`project_ref` / `projectRef` 与您的 Supabase 项目匹配，并且调用方无法访问其他用户的线程 (403)。对于后端身份，请确认您的 API 发送 `x-mda-ingress-secret` 和 `x-mda-user-id`，密钥与部署上的 `MDA_INGRESS_SECRET` 匹配，并且一个用户的标识符无法到达另一用户的线程 (403)。

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-identity.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>