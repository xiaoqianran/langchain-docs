<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Attach an access policy to a team | https://docs.langchain.com/langsmith/smith-api/teams/attach-an-access-policy-to-a-team -->

# 将访问策略附加到团队

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/orgs/current/teams/{team_id}/access-policies
将组织中现有的访问策略附加到团队。一个工作区
范围团队的政策适用于其工作空间。适用组织范围团队的政策
在给定的workspace_id中，或者在团队可以访问的每个工作空间中
省略。如果已附加保单，则返回 201；如果已附加保单，则返回 200
附。工作区范围内的团队需要其工作区:teams:manage-policies
工作区。组织范围的团队需要组织：团队：管理策略，并且
对于一个工作区中的策略，调用者也必须是该工作区的成员。