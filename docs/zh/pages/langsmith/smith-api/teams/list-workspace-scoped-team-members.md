<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List workspace scoped team members | https://docs.langchain.com/langsmith/smith-api/teams/list-workspace-scoped-team-members -->

# 列出工作区范围内的团队成员

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/orgs/current/teams/{team_id}/workspace-members
列出工作区范围内的团队成员的工作区身份。一页载有
next_cursor，它是作为下一页的光标发回的值，并且为 null
一旦读完最后一页。此端点未为此发出游标
团队再次从第一页开始。需要工作区：团队：读入
团队的工作空间。