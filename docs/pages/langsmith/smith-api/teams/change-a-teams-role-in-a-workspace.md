<!-- langchain-docs: Change a team's role in a workspace | https://docs.langchain.com/langsmith/smith-api/teams/change-a-teams-role-in-a-workspace -->

# Change a team's role in a workspace

/langsmith/langsmith-platform-openapi.json patch /api/v1/platform/orgs/current/teams/{team_id}/workspaces/{workspace_id}
Changes an organization-wide team's role in a workspace it has access to. Team
members get the new role's permissions there in place of the old role's. Access
policies attached to the team for the workspace stay attached. Needs
organization:teams:manage-grants.