<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Role-based access control | https://docs.langchain.com/langsmith/rbac -->

# 基于角色的访问控制

有关LangSmith组织和工作区角色、每个角色授予的权限以及如何创建和限制自定义角色的参考。

基于角色的访问控制 (RBAC) 确定谁可以访问您的 LangSmith 组织和 [workspaces](/langsmith/administration-overview#workspaces)，以及他们可以在每个组织中执行哪些操作。

每个用户拥有：

* 适用于整个组织的一个[organization role](#organization-roles)。
* 他们所属的每个工作区中都有一个 [workspace role](#workspace-roles)。

用户还可以通过 [user groups](/langsmith/user-groups) 接收其他工作区角色。然后，用户将拥有其分配的角色以及该工作区中每个用户组角色的权限。

您可以分配哪些角色取决于您的[plan](https://langchain.com/pricing)：

* **开发人员**：每个用户都具有组织管理员和工作区管理员角色。
* **加**：所有组织角色均可用。每个工作区成员都具有工作区管理员角色。
* **企业**：所有组织和工作空间角色都可用，您可以创建[custom roles](#custom-roles)。要升级，[contact our sales team](https://www.langchain.com/contact-sales)。

> [!注意]
>
> 要设置 RBAC 并分配角色，请参阅[User Management guide](/langsmith/user-management#set-up-access-control)。您的身份提供商还可以通过[SCIM groups](/langsmith/user-management#set-up-scim-for-your-organization)或[SSO Groups Sync](/langsmith/user-management#sso-groups-sync-alternative)自动分配角色。每个操作所需的权限请参见[Organization and workspace operations reference](/langsmith/organization-workspace-operations)。

## 组织角色组织角色控制用户可以在组织中执行的操作，例如管理计费、成员和工作区。它们与[workspace roles](#workspace-roles)分开，后者控制对工作区内资源的访问。组织角色是系统定义的，无法修改或扩展。

|角色 |描述 |可用性 |
| - | - | - |
| [Organization Admin](#organization-admin) |管理组织配置、用户、计费和工作区的完全权限 |所有计划|
| [Organization Operator](#organization-operator) |对工作区和用户进行日常操作的管理访问权限，不包括管理员级别权限 | [Plus and Enterprise](https://langchain.com/pricing) |
| [Organization User](#organization-user) |对组织信息的读取访问权限以及创建个人访问令牌的能力 | [Plus and Enterprise](https://langchain.com/pricing) |
| [Organization Viewer](#organization-viewer) |对组织信息的只读访问权限 | [Plus and Enterprise](https://langchain.com/pricing) |
| [Organization Restricted](#organization-restricted) |无需组织范围内的读取访问权限即可访问工作区 | [Plus and Enterprise](https://langchain.com/pricing) |

### 组织管理员

组织管理员角色拥有管理所有组织配置、用户、计费和工作区的完全权限。

**关键权限**：|许可 |补助金 |
| - | - |
| `organization:manage` | Full control over organization settings, SSO, security, and billing |
| `organization:read` |读取所有组织信息 |
| `organization:pats:create` |创建组织级别[personal access tokens](/langsmith/administration-overview#personal-access-tokens-pats) |
| `organization:pats:read` | View every organization member's personal access tokens |
| `organization:pats:manage` | Deactivate, reactivate, or delete any organization member's personal access token |

**关键能力**：

* 管理 [organization settings](/langsmith/set-up-hierarchy#set-up-an-organization) 和品牌。
* 配置[SSO and authentication methods](/langsmith/user-management#set-up-saml-sso-for-your-organization)。
* 管理 [billing](/langsmith/billing) 和订阅计划。
* 创建和删除工作区。
* 邀请和删除组织成员。
* View, deactivate, reactivate, and delete any member's personal access tokens.
* Assign organization and workspace roles to members.
* 创建和管理[custom roles](#custom-roles)。
* 配置 RBAC 和[attribute-based access control (ABAC)](/langsmith/abac) 策略。
* 查看组织[usage](/langsmith/usage-and-billing#usage-limits) 和分析。
* 查看[audit logs](/langsmith/audit-logs)（企业）。

For details on setting up and managing your organization, see the [Administration overview](/langsmith/administration-overview#organizations).

### 组织运营商

组织操作员角色具有日常操作的管理访问权限，包括工作区和用户管理，但无法管理组织管理员或创建组织范围的服务密钥。

**关键权限**：|许可 |补助金 |
| - | - |
| `organization:manage` |控制组织设置、工作区和非管理员用户 |
| `organization:read` |读取所有组织信息 |
| `organization:pats:create` |创建个人访问令牌 |
| `organization:pats:read` |查看每个组织成员的个人访问令牌 |
| `organization:pats:manage` |停用、重新激活或删除任何组织成员的个人访问令牌 |

**关键能力**：

* 创建和管理[workspaces](/langsmith/set-up-hierarchy#set-up-a-workspace)。
* 邀请具有除组织管理员之外的任何角色的组织成员。
* 修改和删除组织用户、查看者和操作员。
* 查看、停用、重新激活和删除任何成员的个人访问令牌。
* 为成员分配工作区角色。
* 创建工作区范围的服务密钥和服务帐户。
* 管理组织计费和订阅计划。
* 创建、编辑和删除自定义角色。
* 配置单点登录和身份验证方法。
* 查看组织使用情况和分析。
* 查看审核日志（企业）。

**限制**：* 无法邀请、修改或删除组织管理员。
* 无法将组织管理员角色分配给用户。
* 无法创建组织范围（非工作区特定）服务密钥。
* 不会自动添加到现有工作区。组织操作员仅加入他们创建或明确邀请加入的工作区。

### 组织用户

组织用户角色具有对组织信息的读取访问权限，并且可以创建个人访问令牌。

**关键权限**：

|许可 |补助金 |
| - | - |
| `organization:read` |读取组织信息 |
| `organization:pats:create` |创建个人访问令牌 |

**关键能力**：

* 查看组织成员和工作区。
* 查看组织设置。
* 创建用于 API 访问的个人访问令牌。
* 加入他们受邀加入的工作空间。

**限制**：

* 无法修改组织设置。
* 无法管理账单或订阅。
* 无法创建或删除工作区。
* 无法邀请或删除组织成员。
* 无法管理角色或权限。

组织用户可以属于工作区的子集，每个工作区中都有一个工作区角色，用于设置其权限。

### 组织查看器组织查看者角色对组织信息具有只读访问权限。

**关键权限**：

|许可 |补助金 |
| - | - |
| `organization:read` |读取组织信息 |

**关键能力**：

* 查看组织成员和工作区。
* 查看组织设置。

**限制**：

* 无法在组织级别修改任何内容。
* 无法创建个人访问令牌。
* 无法管理账单、工作区或成员。

### 组织受限

组织受限角色授予对分配的工作区的访问权限，而无需组织范围的读取访问权限。将其分配给应在自己的工作区中工作而不会看到其他组织成员或组织级别详细信息的用户。

**关键权限**：

|许可 |补助金 |
| - | - |
| `organization:read-metadata` |对组织元数据的读取权限，包括组织角色 |

**关键能力**：

* 查看组织元数据和角色定义。
* 在分配的工作区中工作，并具有由每个工作区角色设置的权限。

**限制**：* 不包括`organization:read`，因此无法列出组织成员或服务密钥。
* 无法通过[just-in-time (JIT) provisioning](/langsmith/jit-invite-sso)分配。通过 JIT 创建的新用户接收组织用户，并且 SSO 默认角色设置仅适用于工作区角色。

分配组织限制的方式与任何其他组织角色相同：通过成员邀请、[SCIM group](/langsmith/user-management#group-naming-convention) 或[SSO Groups Sync](/langsmith/user-management#sso-groups-sync-alternative) 小组比赛。

工作空间范围的[service keys](/langsmith/administration-overview#service-keys)也可以担任这个角色。创建或编辑范围为 **特定工作空间** 的服务密钥时，选择组织查看器（默认）或组织受限。此选择不会更改可以创建或编辑服务密钥的人员。

## 工作区角色

工作区角色控制用户和 API 密钥可以对工作区内的资源执行哪些操作。|角色 |描述 |
| - | - |
| [Workspace Admin](#workspace-admin) |所有资源的完全权限，包括工作区设置和成员管理 |
| [Workspace Editor](#workspace-editor) |对大多数资源具有完全权限，无法管理工作区设置或删除某些资源 |
| [Workspace Viewer](#workspace-viewer) |对所有工作区资源的只读访问权限
| [Fleet User](#fleet-roles) |使用并评价与他们共享的舰队代理，无法访问痕迹 |
| [Fleet Builder](#fleet-roles) |舰队用户权限以及创建、编辑和删除舰队代理和技能 |
| [Fleet Admin](#fleet-roles) |舰队构建器权限以及舰队管理、工作区集成和机密、部署、跟踪读取访问权限以及工作区管理 |
| [Workspace Member Only](#workspace-member-only) |没有自己的权限的工作区成员资格 |

> [!注意]
>
> LangSmith 还定义了[keys LangSmith creates](#roles-for-keys-that-langsmith-creates) 的工作区角色。这些角色显示在角色列表中，例如服务密钥的角色选择器，但并不适用于用户。

### 工作区管理员

工作区管理员角色拥有工作区中所有资源的完全权限，并且可以管理工作区本身。

**关键权限**：

* 所有资源类型的所有创建、读取、更新、删除和共享权限。
* 工作空间管理，包括`workspaces:manage`和`workspaces:manage-members`。### Workspace Editor

工作区编辑者角色对工作区中的大多数资源拥有完全权限，但无法管理工作区设置或删除某些关键资源。

**限制**：

* 无法删除[runs](/langsmith/observability-concepts#runs)。
* 无法管理工作区设置，例如工作区名称。
* 无法管理工作区成员（添加、删除或更新成员角色）。

### Workspace Viewer

工作区查看者角色对工作区中的所有资源具有只读访问权限。

**关键权限**：

* 对所有资源类型的只读访问。

### Fleet roles

舰队角色授予对 [Fleet](/langsmith/fleet/index) 的访问权限，而无需工作空间编辑器或工作空间管理员角色的更广泛访问权限。每个角色都包含下表中其上方角色的权限：|角色 |权限 |
| - | - |
|车队用户 | `fleet-agents:read`、`fleet-agents:invoke`、`fleet-skills:read`、`mcp-servers:read`、`mcp-servers:invoke`、`deployments:read`、`prompts:read`、`workspaces:read`、`feedback:read`、`feedback:update`、以及`feedback:delete`。无法访问痕迹。 |
|舰队建造者 |队列用户权限，加上 `fleet-agents:create`、`fleet-agents:update`、`fleet-agents:delete`、`fleet-skills:create`、`fleet-skills:update` 和 `fleet-skills:delete`。 |
|车队管理| Fleet Builder permissions, plus: • Fleet administration: `fleet:read-admin-config`, `fleet:write-admin-config`, and `workspaces:fleet-feedback:read-all` • MCP servers and integrations: `mcp-servers:create`, `mcp-servers:update`, `mcp-servers:delete`, and `workspaces:integrations:manage` • Deployments, sandboxes, and snapshots: `deployments:create`, `deployments:update`, `deployments:delete`, `sandboxes:read`, `snapshots:create`, and `snapshots:delete` • Traces: `projects:read` and `runs:read` • Workspace management: `workspaces:manage` and `workspaces:manage-secrets` |

Fleet Admin 包括 `workspaces:manage`，它还涵盖 Fleet 外部的工作区设置。它不包括`workspaces:manage-members`。有关每个舰队权限允许的内容，请参阅[Fleet access and oversight](/langsmith/fleet/access-and-oversight#configure-a-fleet-role)。

### 仅限工作区会员

“仅工作区成员”角色使用户成为工作区的成员，而无需授予任何权限。用户对该工作区的访问来自其 [user groups](/langsmith/user-groups) 的角色。

### LangSmith 创建的键的角色

这些工作区角色属于 LangSmith 为其自身功能（例如部署、[Engine](/langsmith/engine) 和任务集运行）创建的 API 密钥。它们在 LangSmith UI 中的描述以 `(System)` 开头。|角色 |用于 |权限 |
| - | - | - |
|部署运行时 | LangSmith 为部署运行时创建的密钥 |工作区编辑器权限，不含 `simulations:create`、`tasksets:run` 或 `workspaces:tracing-keys:create`，加上 `gateway:invoke`、`sandboxes:exec`、`snapshots:update`、`functions:update` 和 `agent-auth-credentials:use` |
|网关调用者| LangSmith 创建用于调用 [LLM Gateway](/langsmith/llm-gateway) | 的键`gateway:invoke` 和 `workspaces:read` |
|任务集代理 |为任务集试用的代理服务器写入跟踪的键 | `projects:create`、`projects:read`、`runs:create`、`prompts:read` 和 `workspaces:read` |
|问题代理 |引擎创建用于分析跟踪和记录问题的短期密钥 |读取跟踪、反馈、问题、提示、规则、图表和模型价格，以及 `issues:create`、`issues:update` 和 `gateway:invoke` |
|问题代理（副本）|发动机的短期钥匙 |问题代理权限，没有 `gateway:invoke` |
|问题代理数据租户读者 |发动机的短期钥匙 |只读访问跟踪、反馈、问题、提示、规则、图表和模型价格 |
|问题代理跟踪编写器 |写入引擎自身痕迹的短期密钥 | `projects:read`、`workspaces:read`、`runs:create`、`feedback:create`、`feedback:update` 和 `agent-auth-connections:read` |

不要将这些角色分配给用户。您可以将网关调用程序分配给仅调用 LLM 网关的服务密钥。详情请参见[Grant permission to call the LLM gateway](/langsmith/llm-gateway-authentication#grant-permission-to-call-the-gateway)。

## 自定义角色> [!注意]
>
> 创建自定义角色仅适用于企业计划中的组织。

自定义角色是您定义的工作区角色。 [Organization Admins](#organization-admin) 和 [Organization Operators](#organization-operator) 可以创建具有工作区级别权限的特定组合的自定义角色，然后将它们与内置 [workspace roles](#workspace-roles) 一起分配。

### 创建自定义角色

自定义角色在 [organization](/langsmith/administration-overview#organizations) 级别创建，并且可以分配给该组织内任何 [workspace](/langsmith/administration-overview#workspaces) 中的用户。

要创建自定义角色：

1. 导航到组织 **设置** > **角色**。
2. 单击“**创建角色**”。
3. 输入 **角色名称** 和可选的 **描述**。
4. 在 **权限** 下，选择要包含在角色中的权限。
5. 单击“**创建**”。

创建角色后，[assign it to users](/langsmith/user-management#assign-a-role-to-a-user) 在特定工作区中。

有关每个操作需要哪些具体权限的详细信息，请参阅[Organization and workspace operations reference](/langsmith/organization-workspace-operations)。

请注意有关自定义角色的以下详细信息：* 只有组织管理员和组织操作员可以创建和管理自定义角色。
* 自定义角色是特定于组织的（不可在组织之间转移）。
* 每个自定义角色可以具有工作区级别权限的任意组合。
* 自定义角色不能拥有组织级别的权限。
* 用户可以在不同的工作空间中拥有不同的角色（包括自定义角色）。

### 了解权限行为

某些权限在用于自定义角色时提供精细控制：* `workspaces:manage` **不** 包含管理工作区成员的功能。要允许自定义角色添加、删除或更新工作区成员，您必须显式授予 `workspaces:manage-members`。内置的工作区管理员角色自动包含这两种权限。
* `workspaces:manage-model-configs` 控制创建、编辑或删除 [model configurations](/langsmith/model-configurations)（包括附加 [OAuth client credentials](/langsmith/model-configurations#oauth-client-credentials)）以及更改每个模型可用的 LangSmith 功能的能力。它与 `workspaces:manage` 是分开的——在应该能够配置模型的自定义角色上显式授予它。内置的工作区管理员角色自动包含它。
* `workspaces:manage-keys` 控制创建和删除工作区 API 密钥（作用范围为工作区的服务密钥）的能力。它与 `workspaces:manage` 是分开的——在自定义角色上显式授予它，这些角色应该能够管理 API 密钥，而无需完整的工作区管理。为了防止权限升级，由不具有 `workspaces:manage` 的用户创建的密钥不能被授予比该用户拥有的权限更多的权限，并且不能被分配组织标记为受限的角色。内置的工作区管理员角色自动包含它。* `bulk-exports:read` 和 `bulk-exports:manage` 涵盖批量导出端点（列出、创建、取消导出和管理目的地）。在自定义角色中使用它们来授予最低权限的批量导出访问权限，而无需 `workspaces:manage`。内置工作区管理员角色包括 `bulk-exports:manage`，所有具有读取功能的角色自动包括 `bulk-exports:read`。
* `projects:increase-trace-tier`和`projects:decrease-trace-tier`是独立的，可以单独授予。例如，您可以允许角色减少保留率，但不允许其增加保留率。如果用户缺乏这两种权限，则保留设置 UI 将完全隐藏。如果只有一个，则 UI 部分启用（禁止的方向被禁用）。
* `runs:read-inputs`和`runs:read-outputs`控制角色是否可以看到运行输入和输出，并且与`runs:read`分开。具有 `runs:read` 但没有这些权限之一的角色仍然可以列出和打开运行，但响应会忽略被拒绝的字段及其预览。消息和轨迹视图需要这两种权限。要仅在特定项目中隐藏输入或输出，请使用[access policy](/langsmith/abac#control-access-to-run-inputs-and-outputs)。* `projects:update` 仅涵盖元数据更新（名称、描述、标签），并且 **不** 授予更改跟踪保留的能力。要允许自定义角色修改跟踪层，您必须显式授予 `projects:increase-trace-tier`、`projects:decrease-trace-tier` 或两者。

## 限制角色

> [!注意]
>
> 角色限制适用于 [Enterprise](/langsmith/pricing-plans) 计划的组织。

[Organization Admins](#organization-admin) 和 [Organization Operators](#organization-operator)（具有 `organization:manage` 权限的角色）可以将任何角色（系统或自定义）标记为 **受限**。受限角色只能由拥有内置 [Workspace Admin](#workspace-admin) 角色的用户分配给工作区成员。拥有`workspaces:manage-members`权限但不拥有工作区管理员角色的用户无法分配受限角色。

这可以防止权限升级：即使用户被授权管理工作区成员身份，他们也无法授予已标记为越界的角色。

默认情况下，没有角色受到限制。组织必须明确限制每个角色。

要限制角色，在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-rbac)中：

1. 导航到组织 **设置** > **角色**。
2. 在角色表中找到您要限制的角色。
3. 选择该角色的 **Restricted** 复选框。角色受到限制后，不拥有工作区管理员角色的用户无法在成员邀请、成员编辑或 API 密钥创建流程中查看或分配该角色。 API 还会拒绝不具有工作区管理员角色的调用者的分配尝试。如果不拥有工作区管理员角色的用户创建 API 密钥，他们无法使用自己的受限角色作为密钥的默认角色。

要取消限制角色，请按照相同的步骤操作并清除 **受限** 复选框。

> [!注意]
>
> 角色限制适用于系统角色（例如工作区管理员、工作区编辑者和工作区查看者）以及自定义角色。可在 LangSmith [Cloud](/langsmith/cloud) 和 [Self-hosted](/langsmith/self-hosted) 上使用。

## 另请参阅

* [Organization and workspace operations reference](/langsmith/organization-workspace-operations)
* [User management](/langsmith/user-management)
* [User groups](/langsmith/user-groups)
* [Attribute-based access control](/langsmith/abac)
* [Administration overview](/langsmith/administration-overview)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/rbac.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。