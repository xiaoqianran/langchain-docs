<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Attach an access policy to a user group | https://docs.langchain.com/langsmith/smith-api/user-groups/attach-an-access-policy-to-a-user-group -->

# 将访问策略附加到用户组

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/orgs/current/user-groups/{user_group_id}/access-policies
将组织中现有的访问策略附加到用户组。一个工作区
范围用户组的策略适用于其工作区。适用组织范围内的用户组策略
在给定的workspace_id中，或者在用户组有权访问的每个工作空间中
省略。如果已附加保单，则返回 201；如果已附加保单，则返回 200
附。工作空间范围内的用户组需要其中的工作空间：用户组：管理策略
工作区。组织范围的用户组需要组织：用户组：管理策略，并且
对于一个工作区中的策略，调用者也必须是该工作区的成员。