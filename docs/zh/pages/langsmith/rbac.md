<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Role-based access control | https://docs.langchain.com/langsmith/rbac -->

# 基于角色的访问控制

本参考资料介绍了 LangSmith 用于管理组织级和工作区级权限的基于角色的访问控制 (RBAC) 系统。

<Note>
RBAC（基于角色的访问控制）是一项用于管理工作区级别权限的企业功能。如果您对此功能感兴趣，[contact our sales team](https://www.langchain.com/contact-sales)。其他计划默认为所有用户使用管理员角色。
</Note>

LangSmith 的 RBAC 系统管理工作空间内的用户权限。 RBAC 允许您控制谁可以访问您的 LangSmith [workspace](/langsmith/administration-overview#workspaces) 以及他们可以在其中执行哪些操作。

在LangSmith中，每个用户拥有：
- 一个适用于整个组织的[**organization role**](#organization-roles)（与工作区 RBAC 分开）。
    - 组织用户和组织查看者角色仅在 [Plus and Enterprise plans](https://langchain.com/pricing) 上的组织中可用。在开发人员组织（单个工作区）中，默认情况下为所有用户分配组织管理员角色。
- 他们所属的每个工作区一个 [**workspace role**](#workspace-roles)（需要企业 RBAC 功能）。

在企业计划中，组织可以创建具有精细权限组合的[custom workspace roles](#custom-roles)。要了解如何设置 RBAC 并为用户分配角色，请参阅[User Management guide](/langsmith/user-management#set-up-access-control)。您的身份提供商还可以通过 [SCIM groups](/langsmith/user-management#set-up-scim-for-your-organization) 或 [SSO Groups Sync](/langsmith/user-management#sso-groups-sync-alternative) 自动分配角色。

<Note>
有关所需权限以及可以执行这些权限的操作和角色的完整列表，请参阅[Organization and workspace reference](/langsmith/organization-workspace-operations)。
</Note>

## 角色类型

### 组织角色

组织角色**与工作区 RBAC 功能**不同，用于管理组织范围的功能。这些角色是系统定义的，无法修改或扩展。 [Organization User](#organization-user) 和 [Organization Viewer](#organization-viewer) 角色仅在[Plus and Enterprise plans](https://langchain.com/pricing) 上的组织中可用。在开发者组织（单个工作区）中，默认情况下为所有用户分配 [Organization Admin](#organization-admin) 角色。

|角色 |描述 |
|------|-------------|
| [Organization Admin](#organization-admin) |管理组织配置、用户、计费和工作区的完全权限 |
| [Organization Operator](#organization-operator) |对工作区和用户进行日常操作的管理访问权限，不包括管理员级别权限 |
| [Organization User](#organization-user) |对组织信息的读取访问权限以及创建个人访问令牌的能力 |
| [Organization Viewer](#organization-viewer) |对组织信息的只读访问权限 |

#### 组织管理员**描述**：管理所有组织配置、用户、计费和工作区的完全权限。

**权限**：
- `organization:manage` - 完全控制组织设置、SSO、安全性、计费
- `organization:read` - 对所有组织信息的读取权限
- `organization:pats:create` - 创建组织级别[personal access tokens](/langsmith/administration-overview#personal-access-tokens-pats)

有关所需权限以及可以执行这些权限的操作和角色的完整列表，请参阅[Organization and workspace reference](/langsmith/organization-workspace-operations)。

**关键能力**：
- 管理[organization settings](/langsmith/set-up-hierarchy#set-up-an-organization)和品牌
- 配置[SSO and authentication methods](/langsmith/user-management#set-up-saml-sso-for-your-organization)
- 管理[billing](/langsmith/billing)和订阅计划
- 创建和删除[workspaces](/langsmith/set-up-hierarchy)
- 邀请和删除组织成员
- 为成员分配组织和工作区角色
- 创建和管理[custom roles](#custom-roles)
- 配置RBAC和ABAC（基于属性的访问控制）策略
- 查看组织[usage](/langsmith/usage-and-billing#usage-limits)和分析
- 查看[audit logs](/langsmith/audit-logs)（企业）

有关设置和管理组织的详细信息，请参阅[Administration Overview](/langsmith/administration-overview#organizations)。

#### 组织运营者

日常操作的管理访问权限，包括工作区和用户管理，但无法管理组织管理员或创建组织范围的服务密钥。**权限：**
- `organization:manage` - 控制组织设置、工作区和非管理员用户
- `organization:read` - 对所有组织信息的读取权限
- `organization:pats:create` - 创建个人访问令牌

有关所需权限以及可以执行这些权限的操作和角色的完整列表，请参阅[Organization and workspace reference](/langsmith/organization-workspace-operations)。

**关键能力：**
- 创建和管理[workspaces](/langsmith/set-up-hierarchy#set-up-a-workspace)
- 邀请组织成员（除组织管理员之外的所有角色）
- 管理非管理员组织成员（修改和删除组织用户、查看者和操作员）
- 为成员分配工作空间角色
- 创建工作区范围的服务密钥和服务帐户
- 查看组织[usage](/langsmith/usage-and-billing#usage-limits)和分析
- 查看[audit logs](/langsmith/audit-logs)（企业）

**限制：**

- 无法邀请、修改或删除组织管理员
- 无法将组织管理员角色分配给用户
- 无法创建组织范围（非工作区特定）服务密钥
- 不会自动添加到现有工作区（仅添加到他们创建或明确邀请的工作区）
- 无法管理组织[billing](/langsmith/billing)或订阅计划
- 无法配置[SSO or authentication methods](/langsmith/user-management#set-up-saml-sso-for-your-organization)
- 无法创建或管理[custom roles](#custom-roles)

#### 组织用户**描述**：对组织信息的读取访问权限以及创建个人访问令牌的能力。

**权限**：
- `organization:read` - 读取组织信息
- `organization:pats:create` - 创建个人访问令牌

有关所需权限以及可以执行这些权限的操作和角色的完整列表，请参阅[Organization and workspace reference](/langsmith/organization-workspace-operations)。

**关键能力**：
- 查看组织成员和工作区
- 查看组织设置（但不能修改）
- 创建[personal access tokens](/langsmith/administration-overview#personal-access-tokens-pats)用于API访问
- 加入他们受邀加入的工作空间

**限制**：
- 无法修改组织设置
- 无法管理账单或订阅
- 无法创建或删除工作区
- 无法邀请或删除组织成员
- 无法管理角色或权限

您可以将组织用户添加到工作区子集并分配工作区角色（如果启用了 RBAC），这些角色指定工作区级别的权限。

#### 组织查看器

**描述**：对组织信息的只读访问权限。

**权限**：
- `organization:read` - 读取组织信息

有关所需权限以及可以执行这些权限的操作和角色的完整列表，请参阅[Organization and workspace reference](/langsmith/organization-workspace-operations)。**关键能力**：
- 查看组织成员和工作区
- 查看组织设置

**限制**：
- 无法在组织级别修改任何内容
- 无法创建个人访问令牌
- 无法管理账单、工作区或成员

### 工作区角色

工作区角色是**企业 RBAC 功能**的一部分，控制用户可以对工作区内的资源执行哪些操作：

|角色 |描述 |
|------|-------------|
| [Workspace Admin](#workspace-admin) |所有资源的完全权限，包括工作区设置和成员管理 |
| [Workspace Editor](#workspace-editor) |对大多数资源具有完全权限，无法管理工作区设置或删除某些资源 |
| [Workspace Viewer](#workspace-viewer) |对所有工作区资源的只读访问权限

<Note>
RBAC（基于角色的访问控制）是一项仅适用于 [Enterprise](https://langchain.com/pricing) 客户的功能。如果您对此功能感兴趣，[contact our sales team](https://www.langchain.com/contact-sales)。其他计划默认为所有用户使用管理员角色。
</Note>

#### 工作区管理员

**描述**：具有所有资源的完全权限以及管理工作区的能力的角色。

**权限**：
- 所有资源类型的所有创建、读取、更新、删除和共享权限
- 工作区管理功能有关所需权限以及可以执行这些权限的操作和角色的完整列表，请参阅[Organization and workspace reference](/langsmith/organization-workspace-operations)。

#### 工作区编辑器

**描述**：对大多数资源拥有完全权限的角色。无法管理工作区设置或删除某些关键资源。

**与管理员的主要区别**：
- 无法删除[runs](/langsmith/observability-concepts#runs)
- 无法管理工作区设置（更改工作区名称等）
- 无法管理工作区成员（添加、删除或更新成员角色）

#### 工作区查看器

**描述**：对所有工作区资源的只读访问权限。

**权限**：对所有资源类型的只读访问权限。

有关所需权限以及可以执行这些权限的操作和角色的完整列表，请参阅[Organization and workspace reference](/langsmith/organization-workspace-operations)。

<Tip>
有关为用户分配工作区角色的分步说明，请参阅 [User Management guide](/langsmith/user-management#assign-a-role-to-a-user)。
</Tip>

## 自定义角色

<Info>企业计划中的组织可以创建自定义角色。</Info>

[Organization Admins](#organization-admin) 可以根据组织的需求创建具有特定权限组合的自定义角色。

### 创建自定义角色自定义角色在 [organization](/langsmith/administration-overview#organizations) 级别创建，并且可以分配给该组织内任何 [workspace](/langsmith/administration-overview#workspaces) 中的用户。

**步骤**：
1. 导航到组织 **设置** > **角色**。
2. 单击**创建自定义角色**。
3. 选择要包含在角色中的权限。
4. 将自定义角色分配给特定工作区中的用户。

有关每个操作需要哪些特定权限的详细信息，请参阅[Organization and workspace operations reference](/langsmith/organization-workspace-operations)。

请注意有关自定义角色的以下详细信息：

- 自定义角色只能由组织管理员创建和管理。
- 自定义角色是特定于组织的（不可在组织之间转移）。
- 每个自定义角色可以具有工作区级别权限的任意组合。
- 自定义角色不能拥有组织级别的权限。
- 用户可以在不同的工作空间中拥有不同的角色（包括自定义角色）。

### 限制角色

<Info>角色限制适用于[Enterprise](/langsmith/pricing-plans)计划的组织。</Info>[Organization Admins](#organization-admin) 和 [Organization Operators](#organization-operator)（具有 `organization:manage` 权限的角色）可以将任何角色（系统或自定义）标记为 **受限**。受限角色只能由拥有内置 [Workspace Admin](#workspace-admin) 角色的用户分配给工作区成员。拥有`workspaces:manage-members`权限但不拥有工作区管理员角色的用户无法分配受限角色。

这可以防止权限升级：即使用户被授权管理工作区成员身份，他们也无法授予已标记为越界的角色。

**默认行为：** 默认情况下没有角色受到限制。组织必须明确切换每个角色的限制。

要限制角色，在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-rbac)中：

1. 导航到组织 **设置** > **角色**。
1. 在角色表中找到您要限制的角色。
1. 启用该角色的 **Restricted** 设置。

一旦角色受到限制，成员邀请和成员编辑流程将对不拥有工作区管理员角色的用户隐藏该角色，并且 API 将拒绝非工作区管理员调用者分配该角色的尝试。

要取消限制角色，请按照相同的步骤操作并关闭 **Restricted** 设置。<Note>
角色限制适用于系统角色（工作区管理员、工作区编辑者、工作区查看者）和自定义角色。它适用于 LangSmith [Cloud](/langsmith/cloud) 和 [Self-hosted](/langsmith/self-hosted)。
</Note>

### 了解权限行为

某些权限在用于自定义角色时提供精细控制：

- `workspaces:manage` **不** 包含管理工作区成员的功能。要允许自定义角色添加、删除或更新工作区成员，您必须显式授予 `workspaces:manage-members`。内置的工作区管理员角色自动包含这两种权限。
- `workspaces:manage-model-configs` 控制创建、编辑或删除 [model configurations](/langsmith/model-configurations)（包括附加 [OAuth client credentials](/langsmith/model-configurations#oauth-client-credentials)）以及更改每个模型可用的 LangSmith 功能的能力。它与 `workspaces:manage` 是分开的——在应该能够配置模型的自定义角色上显式授予它。内置的工作区管理员角色自动包含它。
- `bulk-exports:read` 和 `bulk-exports:manage` 涵盖批量导出端点（列出、创建、取消导出和管理目的地）。在自定义角色中使用它们来授予最低权限的批量导出访问权限，而无需 `workspaces:manage`。内置工作区管理员角色包括 `bulk-exports:manage`，所有具有读取功能的角色自动包括 `bulk-exports:read`。- `projects:increase-trace-tier`和`projects:decrease-trace-tier`是独立的，可以单独授予。例如，您可以允许角色减少保留率，但不允许其增加保留率。如果用户缺乏这两种权限，则保留设置 UI 将完全隐藏。如果只有一个，则 UI 部分启用（禁止的方向被禁用）。
- `projects:update` 仅涵盖元数据更新（名称、描述、标签），并且 **不** 授予更改跟踪保留的能力。要允许自定义角色修改跟踪层，您必须显式授予 `projects:increase-trace-tier`、`projects:decrease-trace-tier` 或两者。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/rbac.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>