<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Detach an access policy from a user group | https://docs.langchain.com/langsmith/smith-api/user-groups/detach-an-access-policy-from-a-user-group -->

# 从用户组中分离访问策略

/langsmith/langsmith-platform-openapi.json 删除 /api/v1/platform/orgs/current/user-groups/{user_group_id}/access-policies/{access_policy_id}
将访问策略与用户组分离。工作区范围内的用户组的策略已分离
从它的工作区。组织范围内的用户组的策略与
给定的workspace_id，或来自用户组有权访问的每个工作空间
省略。当未附加保单时也会返回 204。需要同样的
附加策略时的权限。