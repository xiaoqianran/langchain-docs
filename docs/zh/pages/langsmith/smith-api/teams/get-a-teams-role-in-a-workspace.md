<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get a team's role in a workspace | https://docs.langchain.com/langsmith/smith-api/teams/get-a-teams-role-in-a-workspace -->

# 获取团队在工作空间中的角色

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/orgs/current/teams/{team_id}/workspaces/{workspace_id}
在一个工作区中获得组织范围内的团队的资助。工作空间范围内的团队
返回 400，因为它对其自己的工作区的访问权限是在创建时设置的。
需要在工作区中组织：团队：读取或工作空间：团队：读取。