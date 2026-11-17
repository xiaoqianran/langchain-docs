<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Grant a user group a role in a workspace | https://docs.langchain.com/langsmith/smith-api/user-groups/grant-a-user-group-a-role-in-a-workspace -->

# 授予用户组在工作空间中的角色

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/orgs/current/user-groups/{user_group_id}/workspaces
为组织范围的用户组授予工作区中的角色。用户组成员是
工作区的成员获得该角色的权限，以及他们的工作区
身份在工作区中被记录为用户组的成员。该补助金还
在工作区中创建用户组的工作区范围用户组，以用户组命名，并且
工作区 ID，没有成员或访问策略。一个用户组最多有一个
每个工作区的补助金。工作区范围的用户组的授权是在创建时设置的，因此
它不能被授予。需要组织：用户组：管理授予。