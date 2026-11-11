<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Teams | https://docs.langchain.com/langsmith/teams -->

# 团队

将组织成员分组，然后为每个团队指定一个角色并为其可以访问的工作区提供访问策略。

团队是一组组织成员。您可以授予团队访问多个工作区的权限，并在每个工作区中指定特定的角色。属于这些工作区的团队成员将在那里接收团队的角色。团队建立在 [role-based access control (RBAC)](/langsmith/rbac) 和 [attribute-based access control (ABAC)](/langsmith/abac) 的基础上。

> [!注意]
>
> 团队适用于 [Enterprise plan](https://www.langchain.com/pricing) 和 [self-hosted](/langsmith/self-hosted) 部署的组织。 [Contact our sales team](https://www.langchain.com/contact-sales) 了解更多。

## 访问规则

在工作空间中，用户的权限是他们自己的[workspace role](/langsmith/rbac#workspace-roles)和他们所属的每个团队的角色的总和。 [Access policies](/langsmith/abac) 可以来自这些角色和团队本身。匹配的拒绝策略首先应用并阻止访问，无论角色允许什么。评估顺序请参见[How ABAC works with RBAC](/langsmith/abac#how-abac-works-with-rbac)。

团队角色仅适用于属于工作区的成员。授予团队访问权限不会将任何人添加到工作区。要授予团队成员访问权限，[add the user to the workspace](/langsmith/set-up-hierarchy#set-up-a-workspace) 或 [sync the team from your identity provider](#sync-team-members-from-your-identity-provider)。

## 开始之前

* 确保为您的组织启用 [RBAC](/langsmith/rbac) 和 [ABAC](/langsmith/abac)。如果没有 ABAC，团队访问策略就不起作用。
* 对于自托管部署，请参见下文。

## 使团队能够进行自托管部署> [!注意]
>
> 在 [self-hosted](/langsmith/self-hosted) 部署中，团队需要 Helm Chart 0.18.0-rc.54 或更高版本以及应用程序版本 0.18.20rc1 或更高版本。

使用以下选项之一来启用团队：

* **为特定组织启用**：针对您的 LangSmith PostgreSQL 数据库运行以下命令，将 `<organization_id>` 替换为从 UI 中的组织设置页面复制的 ID：

  ```sql theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  UPDATE organizations SET config = config || '{"can_use_teams": true}' WHERE id = '<organization_id>' AND NOT is_personal;
  ```

* **为所有组织启用**：将以下环境变量添加到`values.yaml`中的`commonEnv`：

  ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  DEFAULT_ORG_FEATURE_CAN_USE_TEAMS: "true"
  ```

要在 UI 中管理团队，还需[enable ABAC](/langsmith/abac#enable-abac-on-a-self-hosted-deployment)。

## 创建团队

创建团队：

1. 导航到组织 **设置** > **团队**。
2. 单击**创建团队**。
3. 输入 **名称** 和可选的 **说明**。
4. （可选）添加成员、工作区访问权限和访问策略。参考[Edit a team](#edit-a-team)。
5. 单击**创建团队**。

团队名称在整个组织中必须是唯一的。

## 编辑团队

编辑团队：

1. 导航到组织 **设置** > **团队**，然后单击团队。
2. 在**成员**、**工作区**或**访问策略**中进行更改。
3. 单击“**更新团队**”。

LangSmith 一起保存更改。如果失败，LangSmith 会保留未保存的更改，以便您可以重试。

### 成员单击**+ 添加成员** 添加组织成员。要删除成员，请单击其行上的删除图标。被删除的成员将失去团队授予他们的访问权限。

该部分还列出了团队的 [workspace-only members](#add-workspace-only-members-and-policies)，以及他们添加到的工作区的链接。

### 工作区

单击 **+ 授予工作空间** 并选择一个工作空间，为团队成员授予其中的角色。该角色默认为[Workspace Viewer](/langsmith/rbac#workspace-viewer)。您可以选择任何内置或[custom workspace role](/langsmith/rbac#custom-roles)，然后在工作区的行上更改它。

要删除访问权限，请单击工作区行上的删除图标，然后键入工作区名称进行确认。删除访问权限还会删除团队的仅限工作区的成员以及该工作区中的访问策略。

### 访问策略

单击 **+ 附加策略** 以附加 [access policy](/langsmith/abac#access-policy-structure)。团队的访问策略适用于团队可以访问的每个工作区中的成员。

要将团队的策略限制到一个工作区，请通过 [API](#manage-teams-with-the-api) 和 `workspace_id` 集将其附加。团队必须有权访问该工作区，并且您必须是该工作区的成员。团队对话框显示应用此类策略的工作区。

## 添加仅限工作区的成员和策略在团队可以访问的工作空间中，[Workspace Admin](/langsmith/rbac#workspace-admin) 只能向该工作空间的团队添加成员和访问策略。这使得工作区的管理员无需组织级别的权限即可管理其工作区中的访问。

仅工作区成员不会获得团队角色。他们仅接收仅限工作区的访问策略，并且仅在该工作区中。仅工作区访问策略仅适用于仅工作区成员。

例如，`Support`团队在`Production`中具有[Workspace Editor](/langsmith/rbac#workspace-editor)角色。 `Production` 中的工作区管理员可以仅针对该工作区向 `Support` 添加更多用户，并附加允许他们读取标记为 `Environment=Development` 的项目的策略。

要添加仅限工作区的成员或策略：

1. 导航到工作区的 **设置** > **团队**。该页面列出了有权访问工作区的每个团队。
2. 单击一个团队。
3. 添加或删除成员，或者附加或分离访问策略。
4. 单击“**更新团队**”。

您只能添加属于工作区成员的用户。团队的名称、描述、成员和访问策略显示为只读。

## 删除团队要删除团队，请导航到组织 **设置** > **团队**，单击团队行上的删除图标，然后键入团队名称进行确认。

删除团队会删除其成员、工作区访问权限和访问策略，包括仅限工作区的成员和策略。

无法删除团队在工作区中使用的角色。首先更改团队的角色或删除其工作区访问权限。

## 从您的身份提供商同步团队成员

将团队链接到身份提供商 (IdP) 中的组，然后 LangSmith 设置该组中的团队成员。同步适用于[SCIM](/langsmith/user-management#set-up-scim-for-your-organization)和[SSO Groups Sync](/langsmith/user-management#sso-groups-sync-alternative)。仅工作区成员不会同步。

要同步团队：

1. 导航到组织 **设置** > **团队**，然后单击团队。
2. 在 **常规** 中，在 **IdP 组** 中输入组名称。对于 SCIM，输入 SCIM 组的名称。对于 SSO 组同步，输入 [groups claim](/langsmith/user-management#sso-groups-sync-alternative) 中的值。
3. 选择**同步 IdP 组中的成员**。
4. 单击“**更新团队**”。

### 同步行为

* **匹配**：当组名称等于团队的 IdP 组时，组将匹配，忽略前导空格和尾随空格。匹配区分大小写。每个 IdP 组只能链接到一个团队。* **时间**：SSO 组同步会在每次登录时更新用户的团队，并且需要 **同步工作区/角色分配**。当 SCIM 组发生更改时，SCIM 会更新用户的团队。

* **成员身份**：同步团队的成员是 IdP 组中的用户。您在 LangSmith 中所做的更改将持续到该用户下次同步。

* **组织角色**：当没有`LS:`组设置用户的组织角色时，团队匹配设置它：

  * 通过 SSO 组同步，新用户作为 [Organization Viewer](/langsmith/rbac#organization-viewer) 加入组织。 SSO Groups Sync 管理其成员身份的用户被设置为组织查看者。其他成员资格（例如来自邀请的成员资格）保留其角色。
  * 通过 SCIM，将 SCIM 不管理成员资格的用户设置为[Organization User](/langsmith/rbac#organization-user)，之后由 SCIM 管理成员资格。这包括具有更高角色的用户，例如组织管理员。

* **工作区成员资格**：同步将用户添加到团队可以访问的每个工作区。该成员资格本身没有任何作用。用户的访问来自团队的角色。在用户下次同步时，如果没有团队有权访问该工作区，LangSmith 将删除成员资格。* **登录门**：当启用**需要匹配组登录**时，与已同步团队匹配的组将被视为匹配组。对于 SSO 组同步，这还需要 **同步工作区/角色分配**。

* **禁用同步**：团队保留其成员，您可以在LangSmith中管理他们。

## 权限

每个动作的最小内置角色：

|行动|最小内置角色 |
| - | - |
|查看团队、成员和访问策略 | [Organization Viewer](/langsmith/rbac#organization-viewer) |
|创建、重命名或删除团队 | [Organization Operator](/langsmith/rbac#organization-operator) |
|添加或删除成员 |组织运营商|
|授予、更改或删除工作区访问权限 |组织运营商|
|附加或分离访问策略 |组织运营商|
|查看仅限工作区的成员和策略 | [Workspace Viewer](/langsmith/rbac#workspace-viewer) |
|添加或删除仅限工作区的成员和策略 | [Workspace Admin](/langsmith/rbac#workspace-admin) |

[Custom roles](/langsmith/rbac#custom-roles)可以持有`workspaces:teams:*`权限。每个操作检查的权限，请参阅[operations reference](/langsmith/organization-workspace-operations#workspace-teams)。

## 使用 API 管理团队

团队端点位于 `/api/v1/platform/orgs/current/teams` 下。 [Audit logs](/langsmith/audit-logs#tracked-operations-reference) 记录团队的每一次变化。

## 另请参阅

* [Role-based access control](/langsmith/rbac)
* [Attribute-based access control](/langsmith/abac)
* [User management](/langsmith/user-management)
* [Organization and workspace operations reference](/langsmith/organization-workspace-operations)
* [Audit logs](/langsmith/audit-logs)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/teams.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。