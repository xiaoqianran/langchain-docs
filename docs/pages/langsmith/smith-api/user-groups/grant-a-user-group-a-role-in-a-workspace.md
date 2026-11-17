<!-- langchain-docs: Grant a user group a role in a workspace | https://docs.langchain.com/langsmith/smith-api/user-groups/grant-a-user-group-a-role-in-a-workspace -->

# Grant a user group a role in a workspace

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/orgs/current/user-groups/{user_group_id}/workspaces
Gives an organization-wide user group a role in a workspace. User Group members who are
members of the workspace get the role's permissions there, and their workspace
identities are recorded as the user group's members in the workspace. The grant also
creates the user group's workspace scoped user group in the workspace, named after the user group and
the workspace id, with no members or access policies. A user group has at most one
grant per workspace. A workspace scoped user group's grant is set when it is created, so
it cannot be granted. Needs organization:user-groups:manage-grants.