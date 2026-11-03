<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List a team's access policies | https://docs.langchain.com/langsmith/smith-api/teams/list-a-teams-access-policies -->

# 列出团队的访问策略

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/orgs/current/teams/{team_id}/access-policies
列出附加到团队的访问策略。一个页面带有next_cursor，即
作为下一页的光标发送回的值，最后一页为 null
已读。此端点未为该团队发出的光标再次从以下位置开始
第一页。
组织范围的团队需要组织：团队：读取。
工作空间范围的团队需要在其工作空间中工作空间:团队:读取。