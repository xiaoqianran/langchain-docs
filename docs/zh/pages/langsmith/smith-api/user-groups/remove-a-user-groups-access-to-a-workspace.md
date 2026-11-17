<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Remove a user group's access to a workspace | https://docs.langchain.com/langsmith/smith-api/user-groups/remove-a-user-groups-access-to-a-workspace -->

# 删除用户组对工作空间的访问权限

/langsmith/langsmith-platform-openapi.json 删除 /api/v1/platform/orgs/current/user-groups/{user_group_id}/workspaces/{workspace_id}
删除工作区中组织范围用户组的授权。这也分离了
为该工作区附加用户组的访问策略并删除用户组的工作区
那里的范围用户组。每次工作空间住宿均附有政策。当以下情况时也返回 204
用户组无权访问工作区。
需要组织：用户组：管理授予。