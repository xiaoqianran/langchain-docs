<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Customize user management | https://docs.langchain.com/langsmith/self-host-user-management -->

# 自定义用户管理

<Note>
本指南假设您已阅读 [admin guide](/langsmith/administration-overview) 和 [organization setup guide](/langsmith/set-up-hierarchy#set-up-an-organization)。
</Note>

LangSmith 使用功能标志为用户管理提供额外的自定义功能。

## 特点

### 组织的工作区级别邀请

LangSmith 中的默认行为要求用户是组织管理员才能邀请新用户加入组织。对于想要将此职责委托给工作区管理员的自托管客户，可以设置一个功能标志，使工作区管理员能够邀请新用户加入组织及其**工作区级别**的特定工作区。

通过下面的配置选项启用此功能后，工作区管理员可以在 `Settings` > `Workspaces` 下的 `Workspace members` 选项卡中添加新用户。在工作区级别邀请时支持以下两种情况，而组织级别邀请功能与以前相同。

1. 邀请组织中尚未活跃的用户：这会将用户添加为待处理的组织和特定工作区
2. 邀请已在组织中处于活动状态的用户：将用户作为活动成员直接添加到工作区（无待处理状态）。管理员可以同时邀请用户参与这两种情况。

#### 配置

```yaml Helm
config:
  workspaceScopeOrgInvitesEnabled: true
```

### SSO新会员登录流程

从 helm **v0.11.10** 开始，使用 OAuth SSO 的自托管部署将不再需要在 LangSmith 设置中手动添加成员才能加入。部署将有一个 <b>default</b> 组织，新用户首次登录 LangSmith 时将自动添加到该组织中。

对于您的**默认**组织，您可以设置分配给新成员的工作区和工作区角色。对于**非默认**组织，邀请流程保持不变。
用户加入组织后，对其工作区或角色的任何超出默认组织设置的更改都必须通过 LangSmith 设置（如之前）或 SCIM 进行管理。
<Note>
默认情况下，所有新用户都将添加到组织最初配置的工作区（默认情况下为**工作区 1**），并具有 **工作区编辑者** 角色。
</Note>
![Update SSO Member Settings](/langsmith/images/sso-member-settings-update.png)

<Note>
要更改默认组织，请使用组织选择器下拉列表中的 **设置默认组织**。 （源组织和目标组织都需要组织管理员权限。）
</Note>


### SSO 组同步<Note>
自托管上的 SSO 组同步需要 LangSmith 图表版本 **0.15.0-rc.3**（应用程序版本 **0.15.2rc1**）或更高版本。
</Note>

[SSO Groups Sync](/langsmith/user-management#sso-groups-sync-alternative) 从 OIDC ID 令牌读取组成员身份，并使用 [SCIM naming convention](/langsmith/user-management#group-naming-convention) 分配组织和工作区角色。对于自托管组织来说，它是 [SCIM](/langsmith/user-management#set-up-scim-for-your-organization) 的更简单替代方案，这些组织的 IdP 可以在 OIDC 令牌中包含组，但无法轻松运行 SCIM 配置。

对于 IdP 端配置（声明、范围），请参阅[SSO Groups Sync section in the OIDC SSO setup guide](/langsmith/self-host-sso#sso-groups-sync)。有关设置参考和行为，请参阅[main SSO Groups Sync documentation](/langsmith/user-management#sso-groups-sync-alternative)。

### 禁用组织创建

默认情况下，任何用户都可以在LangSmith中创建组织。对于自托管客户，管理员可能希望在设置初始组织后限制此能力。此功能标志允许管理员禁用用户创建新组织的能力。


#### 配置

<Note>
对于使用 [basic auth](/langsmith/self-host-basic-auth) 或 [SSO](/langsmith/self-host-sso) 的组织，`userOrgCreationDisabled` 功能标记默认设置为 `true`。
</Note>
```yaml Helm
config:
  userOrgCreationDisabled: true
```

### 禁用个人组织默认情况下，任何登录LangSmith的用户都会为其创建一个个人组织。对于自托管客户，管理员可能希望限制此能力。此功能标志允许管理员禁用用户创建个人组织的能力。

#### 配置

<Note>
对于使用 [basic auth](/langsmith/self-host-basic-auth) 或 [SSO](/langsmith/self-host-sso) 的组织，`personalOrgsDisabled` 功能标记默认设置为 `true`。
</Note>

```yaml Helm
config:
  personalOrgsDisabled: true
```

### 禁用个人访问令牌创建

<Note>
此功能需要 Helm Chart 版本 0.13.12（应用程序版本 0.13.12）或更高版本。
</Note>

默认情况下，用户可以在任何组织中创建个人访问令牌 (PAT)。对于自托管客户，管理员可能希望在所有组织中全局禁用 PAT 创建。此环境变量允许管理员阻止用户在实例上的任何组织中创建新的 PAT。

要为单个组织禁用 PAT 创建，请参阅 [per-organization API option](/langsmith/manage-organization-by-api#security-settings)。

#### 配置

```yaml Helm
commonEnv:
  - name: PAT_CREATION_DISABLED
    value: "true"
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-user-management.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>