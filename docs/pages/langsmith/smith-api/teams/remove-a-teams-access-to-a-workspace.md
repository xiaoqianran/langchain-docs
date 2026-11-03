<!-- langchain-docs: Remove a team's access to a workspace | https://docs.langchain.com/langsmith/smith-api/teams/remove-a-teams-access-to-a-workspace -->

# Remove a team's access to a workspace

/langsmith/langsmith-platform-openapi.json delete /api/v1/platform/orgs/current/teams/{team_id}/workspaces/{workspace_id}
Removes an organization-wide team's grant in a workspace. This also detaches the
team's access policies attached for that workspace and deletes the team's workspace
scoped team there. Policies attached for every workspace stay. Returns 204 also when
the team had no access to the workspace.
Needs organization:teams:manage-grants.