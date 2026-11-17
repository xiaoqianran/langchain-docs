<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get a user group's role in a workspace | https://docs.langchain.com/langsmith/smith-api/user-groups/get-a-user-groups-role-in-a-workspace -->

# 获取用户组在工作空间中的角色

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/orgs/current/user-groups/{user_group_id}/workspaces/{workspace_id}
在一个工作区中获取组织范围的用户组的授权。工作区范围内的用户组
返回 400，因为它对其自己的工作区的访问权限是在创建时设置的。
需要在工作区中组织：用户组：读取或工作区：用户组：读取。