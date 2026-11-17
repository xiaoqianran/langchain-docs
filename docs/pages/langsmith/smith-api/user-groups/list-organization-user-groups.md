<!-- langchain-docs: List organization user groups | https://docs.langchain.com/langsmith/smith-api/user-groups/list-organization-user-groups -->

# List organization user groups

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/orgs/current/user-groups
Lists the organization's user groups in name order. A page carries next_cursor, which is
the value to send back as cursor for the next page, and null once the last page
has been read. A cursor this endpoint did not issue, or one issued for different
filters, starts again at the first page. Organization scoped user groups are listed when
the caller has organization:user-groups:read. Workspace scoped user groups are listed only in
workspaces where the caller has workspaces:user-groups:read. With workspace_id, the list
has the workspace's own user groups and the organization scoped user groups granted into it,
each with role_id and role_name; granted user groups are also listed when the caller has
workspaces:user-groups:read in that workspace.