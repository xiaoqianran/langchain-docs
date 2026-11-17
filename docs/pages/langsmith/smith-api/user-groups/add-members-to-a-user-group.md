<!-- langchain-docs: Add members to a user group | https://docs.langchain.com/langsmith/smith-api/user-groups/add-members-to-a-user-group -->

# Add members to a user group

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/orgs/current/user-groups/{user_group_id}/members
Adds organization members to a user group and returns a status for each identity:
CREATED when it was added, UNCHANGED when it was already a member, and FAILED
when it is not an organization identity in this organization. A workspace
scoped user group only takes people who are members of its workspace, and also records
their workspace identity. An organization scoped user group records each person's workspace
identity in every workspace it is granted into. The other identities are still
added. A workspace scoped user group needs workspaces:user-groups:manage-members in its
workspace, and an organization scoped user group needs organization:user-groups:manage-members.