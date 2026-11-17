<!-- langchain-docs: List user group members | https://docs.langchain.com/langsmith/smith-api/user-groups/list-user-group-members -->

# List user group members

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/orgs/current/user-groups/{user_group_id}/members
Lists the members of a user group. A page carries next_cursor, which is the value to send
back as cursor for the next page, and null once the last page has been read. A
cursor this endpoint did not issue for this user group starts again at the first page.
An organization scoped user group needs organization:user-groups:read.
A workspace scoped user group needs workspaces:user-groups:read in its workspace.