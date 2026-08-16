<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage user access in SSO organizations | https://docs.langchain.com/langsmith/jit-invite-sso -->

# 管理 SSO 组织中的用户访问

LangSmith 提供灵活的控件来管理用户在使用 [Single Sign-On (SSO) authentication](/langsmith/authentication-methods) 时如何加入您的 [organization](/langsmith/administration-overview#organizations)。您可以独立启用或禁用即时 (JIT) 配置和用户邀请，以满足您组织的安全和入职要求。

启用 SSO 后，您有两个独立的设置：[JIT provisioning](#jit-provisioning) 在用户通过 SSO 登录时自动添加用户，而 [invites](#invites) 允许管理员在用户访问组织之前手动邀请他们。 [Configure these settings](#configuration-scenarios) 以任意组合来控制您的用户入门工作流程。

本页介绍了这些设置的工作原理以及如何配置它们。

## 设置

您可以独立控制以下两个设置来管理用户加入您的组织的方式。

### JIT 供应

`jit_provisioning_enabled` 设置控制自动用户配置。启用后，通过 SSO 提供商进行身份验证的用户将自动添加到您的 [organization](/langsmith/administration-overview#organizations) 并分配给默认 [workspaces](/langsmith/administration-overview#workspaces) 和默认 [role](/langsmith/rbac)。更多详情请参考[Configure default SSO settings](#configure-default-sso-settings)。禁用后，用户必须通过 [SCIM](#scim-integration) 明确邀请或添加，然后才能访问组织。

### 邀请`invites_enabled` 设置控制手动用户邀请。启用后，[organization administrators](/langsmith/administration-overview#organization-roles) 可以在用户登录之前向他们发送邀请。受邀请的用户可以在通过 SSO 登录时领取邀请。禁用后，不允许手动邀请，用户只能通过 JIT 配置或[SCIM](#scim-integration) 加入。

### 更新设置

您可以在 LangSmith UI 或使用 LangSmith API 更新这些设置：

<Tabs>
<Tab title="UI" icon="layout">

在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-jit-invite-sso)中：

1. 导航到 **设置** → **组织** → **访问和安全** → **常规**。
1. 根据需要切换 **启用 JIT 配置** 和 **允许邀请**。
1. **设置**中的[Configure SSO default workspaces and roles](#configure-default-sso-settings) → **组织** → **SSO 配置**。

</Tab>
<Tab title="API" icon="code">

使用 [Update organization info](/langsmith/smith-api/orgs/update-current-organization-info) 端点以编程方式更新组织设置：

```bash
curl -X PATCH https://api.smith.langchain.com/api/v1/organizations/current/info \
  -H "Authorization: Bearer $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jit_provisioning_enabled": true,
    "invites_enabled": true
  }'
```

响应包括更新的当前组织配置：

```json
{
  "id": "org-uuid",
  "display_name": "My Organization",
  "jit_provisioning_enabled": true,
  "invites_enabled": true,
  "sso_login_slug": "my-org",
  ...
}
```

</Tab>
</Tabs>

<Note>
如果您使用 [LangSmith self-hosted](/langsmith/self-hosted)，请考虑以下事项：- JIT 配置和邀请设置仅适用于默认组织（由 `default_sso_provision=true` 标识）。其他组织必须在自托管中使用邀请。
- 环境变量`SELF_HOSTED_JIT_PROVISIONING_ENABLED`可以全局覆盖JIT配置设置。当设置为 `false` 时，所有组织都会禁用 JIT 配置，无论其各自的设置如何。
- 有关其他自托管用户管理自定义，请参阅[Customize user management](/langsmith/self-host-user-management)。
</Note>

## 用户访问如何工作

当用户尝试通过 SSO 登录时，LangSmith 遵循以下决策流程：


1. 用户向 SSO 提供商进行身份验证。
1. LangSmith 检查用户是否已经具有组织访问权限：
    ```
    ├─ YES → User is signed in
    └─ NO → Continue to step 3
    ```
1. 检查邀请是否已启用**以及**是否存在待处理的邀请：
    ```
   ├─ YES → Provision into organization with invite's organization role; provision into workspaces if invite included workspaces
   └─ NO → Continue to step 4
    ```
1. 检查JIT配置是否启用：
    ```
   ├─ YES → Automatically provision user with default SSO workspaces/role
   └─ NO → Deny access (user must be added via SCIM or by administrator)
    ```

<Note>
当 JIT 配置和邀请都启用时，**邀请优先**。如果用户有待处理的邀请，则会添加邀请的内容，而不是默认的 SSO 设置。
</Note>

## 配置场景

### 开放访问（均已启用）

**配置：**
- ✓ 启用 JIT 配置
- ✓ 已启用邀请**行为：**
- 用户可以通过 SSO 立即登录并自动配置。
- 管理员可以发送邀请来分配特定角色或工作区。
- 受邀用户获取邀请配置；非受邀用户获得默认 SSO 配置。

**示例：**
```
User alex@company.com signs in via SSO:
  - No invite exists → Added to default workspaces with Viewer role

User billy@company.com signs in via SSO:
  - Invite exists for Editor role in "Production" workspace → Added only to "Production" workspace with Editor role (invite takes precedence)
```

### 仅 JIT（邀请已禁用）

**配置：**
- ✓ 启用 JIT 配置
- ✗ 邀请已禁用

**行为：**
- 自动配置所有通过 SSO 进行身份验证的用户。
- 管理员无法发送邀请。
- 所有新用户都会收到相同的默认工作区和角色。

### 仅限邀请（禁用 JIT）

**配置：**
- ✗ JIT 配置已禁用
- ✓ 已启用邀请

**行为：**
- 用户必须先受到邀请才能访问组织。
- 即使具有有效的 SSO 凭据，没有邀请的用户也会被拒绝访问。
- 细粒度控制谁可以访问组织。

**示例：**
```
User alex@company.com signs in via SSO:
  - Has pending invite → Successfully joins organization

User billy@company.com signs in via SSO:
  - No invite → Access denied (must request invite from administrator)
```

### 封闭访问（均已禁用）

**配置：**
- ✗ JIT 配置已禁用
- ✗ 邀请已禁用**行为：**
- SSO 用户无法自动加入组织。
- 无法发送邀请。
- 用户必须通过 SCIM 进行配置，或者一旦用户已经通过 SCIM 成为组织的一部分，则必须由管理员直接进行配置。

## 用户访问快速参考

| JIT 已启用 |已启用邀请 |等待邀请 |结果 |
|----------|------------------|----------------|----------|
| ✓ | ✓ |是的 |已领取邀请（已使用邀请配置）|
| ✓ | ✓ |没有 |自动配置（默认 SSO 配置）|
| ✓ | ✗ |不适用 |自动配置（默认 SSO 配置）|
| ✗ | ✓ |是的 |邀请已领取 |
| ✗ | ✓ |没有 | **访问被拒绝** - 必须受到邀请 |
| ✗ | ✗ |不适用 | **访问被拒绝** - 必须使用 [SCIM](#scim-integration) 或 admin |

## 配置默认 SSO 设置

当[JIT provisioning](#jit-provisioning)启用时，为新用户配置默认设置：

1. 默认工作区角色。选择自动配置时用户收到的[workspace role](/langsmith/rbac#workspace-roles)。有关每个角色可以执行的详细信息，请参阅[Organization and workspace operations](/langsmith/organization-workspace-operations)。选项包括：

    - **[Viewer](/langsmith/rbac#workspace-viewer)**：只读访问
    - **[User](/langsmith/rbac#organization-user)**：标准访问
    - **[Editor](/langsmith/rbac#workspace-editor)**：可以修改资源
    - **[Admin](/langsmith/rbac#workspace-admin)**：完全工作区控制1. 默认工作区。选择自动添加用户的一个或多个工作区。用户在所有选定的工作区中获得相同的角色。配置：

    1. 转至 **设置** → **组织** → **SSO 配置**。
    1. 设置**默认工作区角色**。
    1. 选择**默认工作区**。
    1. 保存您的配置。

## SCIM 集成

如果您的组织使用[SCIM](/langsmith/user-management#set-up-scim-for-your-organization)（跨域身份管理系统），则可以通过您的身份提供商自动配置和管理用户。 SCIM 提供了一种与 JIT 和邀请设置一起工作的附加用户管理机制。

<Note>
SCIM 组成员身份会覆盖手动分配的角色或通过 JIT 配置分配的角色。如果您使用 SCIM，请考虑禁用 JIT 配置以避免冲突。
</Note>

## SSO 组同步

[SSO Groups Sync](/langsmith/user-management#sso-groups-sync-alternative) 是 SCIM 的替代方案，它在登录时从 SSO 令牌读取组成员身份，并使用 SCIM 命名约定分配组织和工作区角色。同步在每次登录时的 JIT 和邀请解析之后运行，并且仅拥有它创建的成员资格。

**JIT、邀请和 SCIM 的优先级：**- **源自 SCIM 的**成员资格绝不会被 SSO 组同步修改。
- **SSO 组同步来源** 成员身份在每次登录时根据令牌的组成员身份完全替换。
- **手动和 JIT 配置的**成员资格不会由 SSO 组同步修改。

我们建议为每个组织选择 SCIM 或 SSO 组同步之一，而不是同时选择两者，以避免混淆优先行为。有关配置和权衡，请参阅[SSO Groups Sync](/langsmith/user-management#sso-groups-sync-alternative)。

## 相关文档

- [Set up SSO with OAuth2.0 and OIDC](/langsmith/self-host-sso)（自托管）
- [Set up SAML SSO](/langsmith/user-management#set-up-saml-sso-for-your-organization)（云）
- [Set up SCIM](/langsmith/user-management#set-up-scim-for-your-organization)
- [User management](/langsmith/user-management)
- [Role-based access control](/langsmith/rbac)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/jit-invite-sso.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>