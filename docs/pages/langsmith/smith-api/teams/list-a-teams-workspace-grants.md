<!-- langchain-docs: List a team's workspace grants | https://docs.langchain.com/langsmith/smith-api/teams/list-a-teams-workspace-grants -->

# List a team's workspace grants

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/orgs/current/teams/{team_id}/workspaces
Lists the workspaces an organization-wide team has access to and its role in each.
A workspace scoped team returns 400, since its access to its own workspace is set
when it is created. A page carries next_cursor, which is the value to send back as
cursor for the next page, and null once the last page has been read. A cursor this
endpoint did not issue for this team starts again at the first page. Needs
organization:teams:read.