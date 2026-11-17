<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List user group members | https://docs.langchain.com/langsmith/smith-api/user-groups/list-user-group-members -->

# 列出用户组成员

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/orgs/current/user-groups/{user_group_id}/members
列出用户组的成员。页面携带 next_cursor，这是要发送的值
返回作为下一页的光标，并在读取最后一页后返回 null。一个
该端点未针对该用户组发出光标，并在第一页再次启动。
组织范围的用户组需要organization:user-groups:read。
工作区范围内的用户组需要在其工作区中工作空间：用户组：读取。