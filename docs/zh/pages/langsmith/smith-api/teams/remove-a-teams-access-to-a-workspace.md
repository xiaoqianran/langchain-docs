<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Remove a team's access to a workspace | https://docs.langchain.com/langsmith/smith-api/teams/remove-a-teams-access-to-a-workspace -->

# 删除团队对工作区的访问权限

/langsmith/langsmith-platform-openapi.json 删除 /api/v1/platform/orgs/current/teams/{team_id}/workspaces/{workspace_id}
删除组织范围团队在工作区中的授权。这也分离了
为该工作区附加团队的访问策略并删除团队的工作区
那里的范围团队。每次工作空间住宿均附有政策。当以下情况时也返回 204
该团队无法访问工作区。
需要组织：团队：管理拨款。