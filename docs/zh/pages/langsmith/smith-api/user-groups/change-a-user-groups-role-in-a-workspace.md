<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Change a user group's role in a workspace | https://docs.langchain.com/langsmith/smith-api/user-groups/change-a-user-groups-role-in-a-workspace -->

# 更改用户组在工作区中的角色

/langsmith/langsmith-platform-openapi.json 补丁 /api/v1/platform/orgs/current/user-groups/{user_group_id}/workspaces/{workspace_id}
更改组织范围的用户组在其有权访问的工作区中的角色。用户组
成员在那里获得新角色的权限来代替旧角色的权限。访问
附加到工作区用户组的策略保持附加状态。需求
组织：用户组：管理授予。