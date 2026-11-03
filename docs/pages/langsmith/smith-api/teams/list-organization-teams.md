<!-- langchain-docs: List organization teams | https://docs.langchain.com/langsmith/smith-api/teams/list-organization-teams -->

# List organization teams

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/orgs/current/teams
Lists the organization's teams in name order. A page carries next_cursor, which is
the value to send back as cursor for the next page, and null once the last page
has been read. A cursor this endpoint did not issue, or one issued for different
filters, starts again at the first page. Organization scoped teams are listed when
the caller has organization:teams:read. Workspace scoped teams are listed only in
workspaces where the caller has workspaces:teams:read. With workspace_id, the list
has the workspace's own teams and the organization scoped teams granted into it,
each with role_id and role_name; granted teams are also listed when the caller has
workspaces:teams:read in that workspace.