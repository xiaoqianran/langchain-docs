<!-- langchain-docs: List team members | https://docs.langchain.com/langsmith/smith-api/teams/list-team-members -->

# List team members

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/orgs/current/teams/{team_id}/members
Lists the members of a team. A page carries next_cursor, which is the value to send
back as cursor for the next page, and null once the last page has been read. A
cursor this endpoint did not issue for this team starts again at the first page.
An organization scoped team needs organization:teams:read.
A workspace scoped team needs workspaces:teams:read in its workspace.