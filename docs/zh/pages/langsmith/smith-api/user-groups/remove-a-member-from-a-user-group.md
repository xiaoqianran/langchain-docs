<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Remove a member from a user group | https://docs.langchain.com/langsmith/smith-api/user-groups/remove-a-member-from-a-user-group -->

# 从用户组中删除成员

/langsmith/langsmith-platform-openapi.json 删除 /api/v1/platform/orgs/current/user-groups/{user_group_id}/members/{identity_id}
从用户组中删除组织成员以及工作区身份
为他们记录的用户组。当身份不是成员时也会返回 204。
需要与添加成员相同的权限。