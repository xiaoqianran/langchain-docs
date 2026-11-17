<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List a user group's access policies | https://docs.langchain.com/langsmith/smith-api/user-groups/list-a-user-groups-access-policies -->

# 列出用户组的访问策略

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/orgs/current/user-groups/{user_group_id}/access-policies
列出附加到用户组的访问策略。一个页面带有next_cursor，即
作为下一页的光标发送回的值，最后一页为 null
已读。此端点未为此用户组发出的游标再次从以下位置开始
第一页。
组织范围的用户组需要organization:user-groups:read。
工作区范围内的用户组需要在其工作区中工作空间：用户组：读取。