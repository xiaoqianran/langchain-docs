<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List team members | https://docs.langchain.com/langsmith/smith-api/teams/list-team-members -->

# 列出团队成员

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/orgs/current/teams/{team_id}/members
列出团队的成员。页面携带 next_cursor，这是要发送的值
back 作为下一页的光标，读取最后一页后为 null。一个
光标此端点没有为该团队发出，再次从第一页开始。
组织范围的团队需要组织：团队：读取。
工作空间范围的团队需要在其工作空间中工作空间:团队:读取。