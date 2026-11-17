<!-- langchain-docs: Remove a user group's access to a workspace | https://docs.langchain.com/langsmith/smith-api/user-groups/remove-a-user-groups-access-to-a-workspace -->

# Remove a user group's access to a workspace

/langsmith/langsmith-platform-openapi.json delete /api/v1/platform/orgs/current/user-groups/{user_group_id}/workspaces/{workspace_id}
Removes an organization-wide user group's grant in a workspace. This also detaches the
user group's access policies attached for that workspace and deletes the user group's workspace
scoped user group there. Policies attached for every workspace stay. Returns 204 also when
the user group had no access to the workspace.
Needs organization:user-groups:manage-grants.