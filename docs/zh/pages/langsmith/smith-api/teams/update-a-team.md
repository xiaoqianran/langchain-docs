<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Update a team | https://docs.langchain.com/langsmith/smith-api/teams/update-a-team -->

# 更新团队

/langsmith/langsmith-platform-openapi.json 补丁 /api/v1/platform/orgs/current/teams/{team_id}
重命名组织范围的团队或更改其描述或 IdP 组映射。
省略的字段保持不变，空描述或 idp_group_name 会被清除
它。 idp_sync_enabled 需要 IdP 组。工作空间范围内的团队返回 400：其
工作空间授予创建和删除它。需要组织：团队：管理。