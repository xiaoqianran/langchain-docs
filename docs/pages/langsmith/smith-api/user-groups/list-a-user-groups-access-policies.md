<!-- langchain-docs: List a user group's access policies | https://docs.langchain.com/langsmith/smith-api/user-groups/list-a-user-groups-access-policies -->

# List a user group's access policies

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/orgs/current/user-groups/{user_group_id}/access-policies
Lists the access policies attached to a user group. A page carries next_cursor, which is
the value to send back as cursor for the next page, and null once the last page
has been read. A cursor this endpoint did not issue for this user group starts again at
the first page.
An organization scoped user group needs organization:user-groups:read.
A workspace scoped user group needs workspaces:user-groups:read in its workspace.