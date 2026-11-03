<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Detach an access policy from a team | https://docs.langchain.com/langsmith/smith-api/teams/detach-an-access-policy-from-a-team -->

# 从团队中分离访问策略

/langsmith/langsmith-platform-openapi.json 删除 /api/v1/platform/orgs/current/teams/{team_id}/access-policies/{access_policy_id}
从团队中分离访问策略。工作空间范围内的团队的策略是分离的
从它的工作区。组织范围内的团队的政策与实际情况是分离的
给定的workspace_id，或者来自团队可以访问的每个工作区
省略。当未附加保单时也会返回 204。需要同样的
附加策略时的权限。