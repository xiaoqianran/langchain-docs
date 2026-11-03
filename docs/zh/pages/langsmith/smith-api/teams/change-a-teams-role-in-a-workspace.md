<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Change a team's role in a workspace | https://docs.langchain.com/langsmith/smith-api/teams/change-a-teams-role-in-a-workspace -->

# 更改团队在工作区中的角色

/langsmith/langsmith-platform-openapi.json 补丁 /api/v1/platform/orgs/current/teams/{team_id}/workspaces/{workspace_id}
更改组织范围的团队在其有权访问的工作区中的角色。团队
成员在那里获得新角色的权限来代替旧角色的权限。访问
附加到团队的工作区策略保持附加状态。需求
组织：团队：管理赠款。