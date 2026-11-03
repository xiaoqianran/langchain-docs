<!-- langchain-docs: Get a team's role in a workspace | https://docs.langchain.com/langsmith/smith-api/teams/get-a-teams-role-in-a-workspace -->

# Get a team's role in a workspace

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/orgs/current/teams/{team_id}/workspaces/{workspace_id}
Gets an organization-wide team's grant in one workspace. A workspace scoped team
returns 400, since its access to its own workspace is set when it is created.
Needs organization:teams:read, or workspaces:teams:read in the workspace.