<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List workspace scoped user group members | https://docs.langchain.com/langsmith/smith-api/user-groups/list-workspace-scoped-user-group-members -->

# 列出工作区范围内的用户组成员

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/orgs/current/user-groups/{user_group_id}/workspace-members
列出工作区范围内的用户组成员的工作区身份。一页载有
next_cursor，它是作为下一页的光标发回的值，并且为 null
一旦读完最后一页。此端点未为此发出游标
用户组再次从第一页开始。需要工作区：用户组：读入
用户组的工作区。