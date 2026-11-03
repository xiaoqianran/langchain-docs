<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Grant a team a role in a workspace | https://docs.langchain.com/langsmith/smith-api/teams/grant-a-team-a-role-in-a-workspace -->

# 授予团队在工作区中的角色

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/orgs/current/teams/{team_id}/workspaces
为组织范围内的团队提供工作空间中的角色。团队成员是
工作区的成员获得该角色的权限，以及他们的工作区
身份在工作区中被记录为团队成员。该补助金还
在工作区中创建团队的工作区范围团队，以团队命名，并且
工作区 ID，没有成员或访问策略。一个团队最多有一个
每个工作区的补助金。工作区范围的团队的授权是在创建时设置的，因此
它不能被授予。需要组织：团队：管理拨款。