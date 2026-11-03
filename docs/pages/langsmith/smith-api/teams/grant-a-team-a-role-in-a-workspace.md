<!-- langchain-docs: Grant a team a role in a workspace | https://docs.langchain.com/langsmith/smith-api/teams/grant-a-team-a-role-in-a-workspace -->

# Grant a team a role in a workspace

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/orgs/current/teams/{team_id}/workspaces
Gives an organization-wide team a role in a workspace. Team members who are
members of the workspace get the role's permissions there, and their workspace
identities are recorded as the team's members in the workspace. The grant also
creates the team's workspace scoped team in the workspace, named after the team and
the workspace id, with no members or access policies. A team has at most one
grant per workspace. A workspace scoped team's grant is set when it is created, so
it cannot be granted. Needs organization:teams:manage-grants.