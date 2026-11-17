<!-- langchain-docs: Change a user group's role in a workspace | https://docs.langchain.com/langsmith/smith-api/user-groups/change-a-user-groups-role-in-a-workspace -->

# Change a user group's role in a workspace

/langsmith/langsmith-platform-openapi.json patch /api/v1/platform/orgs/current/user-groups/{user_group_id}/workspaces/{workspace_id}
Changes an organization-wide user group's role in a workspace it has access to. User Group
members get the new role's permissions there in place of the old role's. Access
policies attached to the user group for the workspace stay attached. Needs
organization:user-groups:manage-grants.