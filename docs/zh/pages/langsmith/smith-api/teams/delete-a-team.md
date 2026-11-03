<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete a team | https://docs.langchain.com/langsmith/smith-api/teams/delete-a-team -->

# 删除一个团队

/langsmith/langsmith-platform-openapi.json 删除 /api/v1/platform/orgs/current/teams/{team_id}
删除组织范围内的团队及其成员、工作区授权和访问权限
政策及其下的工作区范围团队。工作空间范围内的团队返回
400：在工作区中删除其父级的授权会将其删除。当以下情况时也返回 204
该团队不存在。需要组织：团队：管理。