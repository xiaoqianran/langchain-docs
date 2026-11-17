<!-- langchain-docs: Delete a user group | https://docs.langchain.com/langsmith/smith-api/user-groups/delete-a-user-group -->

# Delete a user group

/langsmith/langsmith-platform-openapi.json delete /api/v1/platform/orgs/current/user-groups/{user_group_id}
Deletes an organization-wide user group with its members, workspace grants and access
policies, and the workspace scoped user groups under it. A workspace scoped user group returns
400: removing its parent's grant in the workspace deletes it. Returns 204 also when
the user group does not exist. Needs organization:user-groups:manage.