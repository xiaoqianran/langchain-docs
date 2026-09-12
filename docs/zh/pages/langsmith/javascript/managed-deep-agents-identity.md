<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add identity to Managed Deep Agents | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-identity -->

# 将身份添加到托管Deep Agents

身份控制谁可以调用您的托管深度代理，例如开始运行或发送消息的应用程序和 SDK 客户端。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

将身份声明放在项目根目录下：



```text
my-agent/
  agent.ts
  identity.ts
```


完整的项目布局请参见[Project structure](/langsmith/javascript/managed-deep-agents-project-structure)。

## 选择身份提供商

默认情况下，`mda init`要求调用者提供LangSmith API密钥。拥有该密钥的任何人都可以使用相同的部署，并且可能会看到相同的线程。要为每个登录的最终用户提供私人对话，请改用 Supabase：

|目标|使用 |
| --- | --- |
|锁定 SDK 客户端、脚本和服务的部署 | [LangSmith API key (default)](#configure-identity-with-a-langsmith-api-key) |
|已登录的最终用户可进行私人聊天 | [Supabase](#configure-identity-with-supabase) |

有关更多信息，请参阅[Project structure](/langsmith/javascript/managed-deep-agents-project-structure)。

## 使用 LangSmith API 密钥配置身份

`mda init` 将此身份提供者作为安全默认设置。调用者必须提供有效的 LangSmith 工作区 API 密钥。托管 Deep Agents 使用 LangSmith 云验证密钥。



```ts identity.ts
import { auth, defineIdentity } from "managed-deepagents";

export const identity = defineIdentity({
  auth: auth.langsmithApiKey(),
});
```


客户端将密钥作为`x-api-key`发送。您不需要将验证端点或租户设置添加到您的项目`.env`。 LangSmith 云提供这些。<Warning>
任何拥有密钥的人都可以访问部署，因此请将密钥视为秘密。此默认值不会为每个最终用户提供私有线程。如果 Alice 不能看到 Bob 的线程，请使用 [Supabase](#configure-identity-with-supabase)。
</Warning>

## 使用 Supabase 配置身份

当浏览器或其他客户端作为登录实体调用部署时，使用 Supabase。每个用户都有私有线程。托管 Deep Agents 为您配置该所有权。有关底层 LangSmith 部署模式的更多信息，请参阅 [Make conversations private](/langsmith/resource-auth)。

<Steps>
  <Step title="Enable auth in Supabase" id="enable-auth-in-supabase">

在 Supabase 仪表板中，启用您将使用的身份验证提供程序（例如电子邮件/密码）。

  </Step>
  <Step title="Copy the project reference" id="copy-the-project-reference">

复制项目引用：项目 URL 中`.supabase.co` 之前的子域。

  </Step>
  <Step title="Declare identity" id="declare-supabase-identity">

声明与该项目引用的身份：



```ts identity.ts
import { auth, defineIdentity } from "managed-deepagents";

export const identity = defineIdentity({
  auth: auth.supabase({ projectRef: "your-project-ref" }),
});
```


传递 `url` 而不是自定义身份验证域的项目引用。

  </Step>
  <Step title="Send the access token from the client" id="send-the-access-token">

在客户端应用程序中，设置 Supabase 项目 URL 和可发布密钥（在 Supabase 仪表板中标记为 `anon`）。让用户登录，然后在每个部署请求上发送访问令牌：



```ts
await fetch(`${deploymentUrl}/threads/${threadId}/runs`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${supabaseAccessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(runBody),
});
```可发布密钥（在 Supabase 仪表板中标记为 `anon`）仅供客户端登录 Supabase。在此模式下请勿发送 LangSmith API 密钥。承载令牌是调用者身份。

托管 Deep Agents 根据从项目引用 (`https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`) 派生的项目 JWKS URL 验证 JWT。

<Note>
将 Supabase 身份添加到现有部署不会将所有者元数据添加到现有线程。在依赖这些线程的基于身份的访问之前规划并测试迁移。
</Note>

  </Step>
</Steps>

## 测试和部署

使用[⟦T13⟧](/langsmith/javascript/managed-deep-agents-cli#develop-locally)在本地测试项目，然后使用[⟦T14⟧](/langsmith/javascript/managed-deep-agents-deploy)进行部署。在LangSmith中打开部署跟踪以检查模型调用、工具调用、错误和延迟。

身份验证失败返回 401。对于 LangSmith API 密钥默认值，请确认客户端发送 `x-api-key`。对于 Supabase，确认客户端发送 `Authorization: Bearer <access_token>`、`project_ref` / `projectRef` 与您的 Supabase 项目匹配，并且调用方无法访问其他用户的线程 (403)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-identity.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>