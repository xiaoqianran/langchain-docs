<!-- langchain-docs: Get a user group's role in a workspace | https://docs.langchain.com/langsmith/smith-api/user-groups/get-a-user-groups-role-in-a-workspace -->

# Get a user group's role in a workspace

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/orgs/current/user-groups/{user_group_id}/workspaces/{workspace_id}
Gets an organization-wide user group's grant in one workspace. A workspace scoped user group
returns 400, since its access to its own workspace is set when it is created.
Needs organization:user-groups:read, or workspaces:user-groups:read in the workspace.