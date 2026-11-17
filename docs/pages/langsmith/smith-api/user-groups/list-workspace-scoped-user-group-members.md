<!-- langchain-docs: List workspace scoped user group members | https://docs.langchain.com/langsmith/smith-api/user-groups/list-workspace-scoped-user-group-members -->

# List workspace scoped user group members

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/orgs/current/user-groups/{user_group_id}/workspace-members
Lists the workspace identities of a workspace scoped user group's members. A page carries
next_cursor, which is the value to send back as cursor for the next page, and null
once the last page has been read. A cursor this endpoint did not issue for this
user group starts again at the first page. Needs workspaces:user-groups:read in
the user group's workspace.