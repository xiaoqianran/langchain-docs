<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete a user group | https://docs.langchain.com/langsmith/smith-api/user-groups/delete-a-user-group -->

# 删除用户组

/langsmith/langsmith-platform-openapi.json 删除 /api/v1/platform/orgs/current/user-groups/{user_group_id}
删除组织范围内的用户组及其成员、工作区授权和访问权限
策略及其下的工作区范围的用户组。工作区范围内的用户组返回
400：在工作区中删除其父级的授权会将其删除。当以下情况时也返回 204
用户组不存在。需要组织：用户组：管理。