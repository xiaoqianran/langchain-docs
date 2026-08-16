<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage your organization using the API | https://docs.langchain.com/langsmith/manage-organization-by-api -->

# 使用 API 管理您的组织

LangSmith 的 API 支持通过 API 密钥以编程方式访问 UI 中可用的所有操作，只有 [User-only endpoints](#user-only-endpoints) 中注明的少数例外情况。

<Tip>
更喜欢基础设施即代码？使用 [LangSmith Terraform provider](/langsmith/manage-with-terraform) 以声明方式管理工作区、角色、成员、评估者和警报。
</Tip>

<Check>
在深入了解此内容之前，阅读以下内容可能会有所帮助：

* [Conceptual guide on organizations and workspaces](/langsmith/administration-overview)
* [Organization setup how-to guild](/langsmith/set-up-hierarchy#set-up-an-organization)
</Check>

<Note>
有一些限制很快就会取消：

* LangSmith SDK 尚不支持这些组织管理操作。
* 具有组织管理员权限的组织范围的[service keys](/langsmith/administration-overview#service-keys)可用于这些操作。
</Note>

<Warning>
使用 `X-Tenant-Id` 标头指定要定位的工作区。如果标头不存在，则操作将默认为最初创建密钥的工作区（如果它不在组织范围内）。

**如果使用组织范围的服务密钥访问工作区范围的资源时未指定 `X-Tenant-Id`，则请求将失败并显示 `403 Forbidden`。**
</Warning>下面列出了一些常用的端点和用例。有关可用端点的完整列表，请参阅[API docs](/langsmith/smith-api-ref)。 ** `X-Organization-Id` 标头应出现在所有请求中，而 `X-Tenant-Id` 标头应出现在特定工作区范围内的请求中。**

## 工作空间

* [List workspaces](/langsmith/smith-api/workspaces/list-workspaces)
* [Create workspace](/langsmith/smith-api/workspaces/create-workspace)
* [Update workspace name](/langsmith/smith-api/workspaces/patch-workspace)

## 用户管理

### 角色控制

* [List roles](/langsmith/smith-api/orgs/list-organization-roles)
* [List permissions](/langsmith/smith-api/orgs/update-organization-roles)
* [Create role](/langsmith/smith-api/orgs/create-organization-roles)
* [Update role](/langsmith/smith-api/orgs/update-organization-roles)

### 会员管理

[RBAC](#rbac)下的`List roles`应用于检索这些操作的角色ID。在这些操作中，`List [organization|workspace] members`端点（如下）响应`"id"`s应用作`identity_id`。

组织级别：

* [List active organization members](/langsmith/smith-api/orgs/get-current-active-org-members)
* [List pending organization members](/langsmith/smith-api/orgs/get-current-pending-org-members)
* [Invite a user to the organization and one or more workspaces](/langsmith/smith-api/orgs/add-members-to-current-org-batch)。当用户还不是组织中的成员时应使用此选项。
* [Update a user's organization role](/langsmith/smith-api/workspaces/add-member-to-current-workspace)
* [Remove someone from the organization](/langsmith/smith-api/orgs/remove-member-from-current-org)

工作区级别：

* [List workspace members](/langsmith/smith-api/workspaces/get-current-workspace-members)
* [Add a member to a workspace that is already part of the organization](/langsmith/smith-api/workspaces/add-member-to-current-workspace)
* [Update a user's workspace role](/langsmith/smith-api/workspaces/add-member-to-current-workspace)
* [Remove someone from a workspace](/langsmith/smith-api/workspaces/delete-current-workspace-member)

<Note>
应省略这些参数：`read_only`（已弃用）、`password` 和 `full_name`（仅限[basic auth](/langsmith/authentication-methods)）
</Note>

## API 密钥

* [Create a service key](/langsmith/smith-api/api-key/generate-api-key)
* [Update a service key role](/langsmith/smith-api/orgs/update-org-service-key)
* [Delete a service key](/langsmith/smith-api/api-key/delete-api-key)

## 安全设置

<Note>
需要组织管理员权限才能进行这些更改。
</Note>

<Note>
本文中的“共享资源”指的是 [public prompts](/langsmith/create-a-prompt#save-your-prompt)、[shared runs](/langsmith/manage-trace#share-a-trace) 和 [shared datasets](/langsmith/manage-datasets#share-a-dataset)。
</Note>

<Warning>
更新这些设置会影响**组织中的所有资源**。
</Warning>您可以在工作区的 **设置 > 共享** 选项卡下或通过 API 更新这些设置：
* [Update organization sharing settings](/langsmith/smith-api/orgs/update-current-organization-info)
  * 使用 `unshare_all` 取消共享所选工作区的 **所有** 共享资源 - 使用 `disable_public_sharing` 防止将来共享资源

这些设置只能通过 API 进行编辑：
* [Disable/enable PAT creation](/langsmith/smith-api/orgs/update-current-organization-info)（适用于自托管，Helm 图表版本 0.11.25+ 中可用）
  * 使用 `pat_creation_disabled` 禁用整个组织的 PAT 创建。
  * 有关组织查看者角色的信息，请参阅[admin guide](/langsmith/administration-overview#organization-roles)，该角色无法创建 PAT。
  * 对于自托管部署，您还可以使用环境变量在所有组织中进行[globally disable PAT creation](/langsmith/self-host-user-management#disabling-personal-access-token-creation)。

## 仅用户端点

这些端点是用户范围的，需要登录用户的 JWT，因此它们只能通过 UI 执行。

* `/api-key/current`端点：这些与用户的PAT相关
* `/sso/email-verification/send`（仅限云）：此端点与[SAML SSO](/langsmith/user-management)相关

## 示例代码

下面的示例代码介绍了与组织管理相关的一些常见工作流程。确保在代码中的任何`<replace_me>`处进行必要的替换。

```python
import os
import requests

def main():
    api_key = os.environ["LANGSMITH_API_KEY"]
    # LANGSMITH_ORGANIZATION_ID is not a standard environment variable in the SDK, just used for this example
    organization_id = os.environ["LANGSMITH_ORGANIZATION_ID"]
    base_url = os.environ.get("LANGSMITH_ENDPOINT")  # or "https://api.smith.langchain.com". Update appropriately for self-hosted installations or regional SaaS
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key,
        "X-Organization-Id": organization_id,
    }
    session = requests.Session()
    session.headers.update(headers)
    workspaces_path = f"{base_url}/api/v1/workspaces"
    orgs_path = f"{base_url}/api/v1/orgs/current"
    api_keys_path = f"{base_url}/api/v1/api-key"

    # Create a workspace
    workspace_res = session.post(workspaces_path, json={"display_name": "My Workspace"})
    workspace_res.raise_for_status()
    workspace = workspace_res.json()
    workspace_id = workspace["id"]
    new_workspace_headers = {
        "X-Tenant-Id": workspace_id,
    }

    # Grab roles - this includes both organization and workspace roles
    roles_res = session.get(f"{orgs_path}/roles")
    roles_res.raise_for_status()
    roles = roles_res.json()
    # system org roles are 'Organization Admin', 'Organization User'
    # system workspace roles are 'Admin', 'Editor', 'Viewer'
    org_roles_by_name = {role["display_name"]: role for role in roles if role["access_scope"] == "organization"}
    ws_roles_by_name = {role["display_name"]: role for role in roles if role["access_scope"] == "workspace"}

    # Invite a user to the org and the new workspace, as an Editor.
    # workspace_role_id is only allowed if RBAC is enabled (an enterprise feature).
    new_user_email = "<replace_me>"
    new_user_res = session.post(
        f"{orgs_path}/members",
        json={
            "email": new_user_email,
            "role_id": org_roles_by_name["Organization User"]["id"],
            "workspace_ids": [workspace_id],
            "workspace_role_id": ws_roles_by_name["Editor"]["id"],
        },
    )
    new_user_res.raise_for_status()

    # Add a user that already exists in the org to the new workspace, as a Viewer.
    # workspace_role_id is only allowed if RBAC is enabled (an enterprise feature).
    existing_user_email = "<replace_me>"
    org_members_res = session.get(f"{orgs_path}/members")
    org_members_res.raise_for_status()
    org_members = org_members_res.json()
    existing_org_member = next(
        (member for member in org_members["members"] if member["email"] == existing_user_email), None
    )
    existing_user_res = session.post(
        f"{workspaces_path}/current/members",
        json={
            "user_id": existing_org_member["user_id"],
            "workspace_ids": [workspace_id],
            "workspace_role_id": ws_roles_by_name["Viewer"]["id"],
        },
        headers=new_workspace_headers,
    )
    existing_user_res.raise_for_status()

    # List all members of the workspace
    members_res = session.get(f"{workspaces_path}/current/members", headers=new_workspace_headers)
    members_res.raise_for_status()
    members = members_res.json()
    workspace_member = next(
        (member for member in members["members"] if member["email"] == existing_user_email), None
    )

    # Update the user's workspace role to Admin (enterprise-only)
    existing_user_id = workspace_member["id"]
    update_res = session.patch(
        f"{workspaces_path}/current/members/{existing_user_id}",
        json={"role_id": ws_roles_by_name["Admin"]["id"]},
        headers=new_workspace_headers,
    )
    update_res.raise_for_status()

    # Update the user's organization role to Organization Admin
    update_res = session.patch(
        f"{orgs_path}/members/{existing_org_member['id']}",
        json={"role_id": org_roles_by_name["Organization Admin"]["id"]},
    )
    update_res.raise_for_status()

    # Create a new Service key
    api_key_res = session.post(
        api_keys_path,
        json={"description": "my key"},
        headers=new_workspace_headers,
    )
    api_key_res.raise_for_status()
    api_key_json = api_key_res.json()
    api_key = api_key_json["key"]

if __name__ == "__main__":
    main()
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/manage-organization-by-api.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>