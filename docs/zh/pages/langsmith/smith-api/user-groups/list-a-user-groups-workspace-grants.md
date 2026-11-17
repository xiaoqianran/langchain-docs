<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List a user group's workspace grants | https://docs.langchain.com/langsmith/smith-api/user-groups/list-a-user-groups-workspace-grants -->

# 列出用户组的工作空间授权

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/orgs/current/user-groups/{user_group_id}/workspaces
列出组织范围内的用户组有权访问的工作区及其在每个工作区中的角色。
工作区范围内的用户组返回 400，因为它对其自己的工作区的访问权限已设置
当它被创建时。页面携带 next_cursor，它是发送回的值
光标指向下一页，读取完最后一页后为 null。光标这个
此用户组的端点未发出问题，并在首页重新启动。需求
组织：用户组：读取。