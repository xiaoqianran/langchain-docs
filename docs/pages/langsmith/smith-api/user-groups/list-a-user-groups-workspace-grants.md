<!-- langchain-docs: List a user group's workspace grants | https://docs.langchain.com/langsmith/smith-api/user-groups/list-a-user-groups-workspace-grants -->

# List a user group's workspace grants

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/orgs/current/user-groups/{user_group_id}/workspaces
Lists the workspaces an organization-wide user group has access to and its role in each.
A workspace scoped user group returns 400, since its access to its own workspace is set
when it is created. A page carries next_cursor, which is the value to send back as
cursor for the next page, and null once the last page has been read. A cursor this
endpoint did not issue for this user group starts again at the first page. Needs
organization:user-groups:read.