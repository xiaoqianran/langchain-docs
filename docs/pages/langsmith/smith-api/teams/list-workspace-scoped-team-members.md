<!-- langchain-docs: List workspace scoped team members | https://docs.langchain.com/langsmith/smith-api/teams/list-workspace-scoped-team-members -->

# List workspace scoped team members

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/orgs/current/teams/{team_id}/workspace-members
Lists the workspace identities of a workspace scoped team's members. A page carries
next_cursor, which is the value to send back as cursor for the next page, and null
once the last page has been read. A cursor this endpoint did not issue for this
team starts again at the first page. Needs workspaces:teams:read in
the team's workspace.