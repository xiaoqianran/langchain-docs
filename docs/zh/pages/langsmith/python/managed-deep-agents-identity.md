<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add identity to Managed Deep Agents | https://docs.langchain.com/langsmith/python/managed-deep-agents-identity -->

# 将身份添加到托管Deep Agents

使用 LangSmith API 密钥或 Supabase 对托管 Deep Agents 部署的调用者进行身份验证。

身份控制谁可以调用您的托管Deep Agents部署。默认情况下，身份是安全的：`mda init` 使用 LangSmith API 密钥配置身份验证。

该默认值回答是否允许调用者。还要将每个登录者的对话保密，请使用 [Supabase](#authenticate-end-users-with-supabase)。

<Note>
  托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 选择路径

|目标|使用|
| --------------------------------------------------------------------------- | ------------------------ | |
|锁定 SDK 客户端、脚本和服务的部署 | LangSmith API 密钥（默认）|
|已登录的最终用户可进行私人聊天 |苏帕巴斯|

## 默认：LangSmith API 密钥

`mda init` 搭建了这种安全默认设置。调用者必须提供有效的 LangSmith 工作区 API 密钥。托管 Deep Agents 使用 LangSmith 云验证密钥。

```python identity.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import auth, define_identity

identity = define_identity(auth=auth.langsmith_api_key())
```客户端将密钥作为`x-api-key`发送。您不需要将验证端点或租户设置添加到您的项目`.env`。 LangSmith 云提供了这些。

任何拥有密钥的人都可以访问部署，因此请将密钥视为秘密。此默认值不会为每个最终用户提供私有线程。如果 Alice 不能看到 Bob 的线程，请使用 [Supabase](#authenticate-end-users-with-supabase)。

## 项目结构

身份声明位于项目根目录：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
my-agent/
  agent.py
  identity.py
```

## 使用 Supabase 对最终用户进行身份验证

当浏览器或其他客户端以登录用户身份调用部署时，请使用 Supabase。每个用户都有私有线程。托管 Deep Agents 为您配置该所有权。有关底层 LangSmith 部署模式的更多信息，请参阅 [Make conversations private](/langsmith/resource-auth)。

配置 Supabase 身份验证：

1. 在 Supabase 仪表板中，启用您将使用的身份验证提供程序（例如电子邮件/密码）。
2. 复制项目引用：项目 URL 中`.supabase.co` 之前的子域。
3. 声明与该项目参考的身份：

```python identity.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import auth, define_identity

identity = define_identity(
    auth=auth.supabase(project_ref="your-project-ref"),
)
```

传递 `url` 而不是自定义身份验证域的项目引用。

4. 在客户端应用程序中，设置 Supabase 项目 URL 和可发布（匿名）密钥。让用户登录，然后在每个部署请求上发送访问令牌：

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
```可发布（匿名）密钥仅供客户端使用 Supabase 登录。在此模式下请勿发送 LangSmith API 密钥。承载令牌是调用者身份。

托管 Deep Agents 根据从项目引用 (`https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`) 派生的项目 JWKS URL 验证 JWT。

<Note>
  将 Supabase 身份添加到现有部署不会将所有者元数据添加到现有线程。在依赖这些线程的基于身份的访问之前规划并测试迁移。
</Note>

## 测试和部署

使用[⟦T11⟧](/langsmith/python/managed-deep-agents-cli#develop-locally)在本地测试项目，然后使用[⟦T12⟧](/langsmith/python/managed-deep-agents-deploy)进行部署。在LangSmith中打开部署跟踪以检查模型调用、工具调用、错误和延迟。

身份验证失败返回 401。对于 LangSmith API 密钥默认值，请确认客户端发送 `x-api-key`。对于 Supabase，确认客户端发送 `Authorization: Bearer <access_token>`、`project_ref` / `projectRef` 与您的 Supabase 项目匹配，并且调用方无法访问其他用户的线程 (403)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-identity.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>