<!-- langchain-docs: List a team's access policies | https://docs.langchain.com/langsmith/smith-api/teams/list-a-teams-access-policies -->

# List a team's access policies

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/orgs/current/teams/{team_id}/access-policies
Lists the access policies attached to a team. A page carries next_cursor, which is
the value to send back as cursor for the next page, and null once the last page
has been read. A cursor this endpoint did not issue for this team starts again at
the first page.
An organization scoped team needs organization:teams:read.
A workspace scoped team needs workspaces:teams:read in its workspace.