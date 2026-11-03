<!-- langchain-docs: Add members to a team | https://docs.langchain.com/langsmith/smith-api/teams/add-members-to-a-team -->

# Add members to a team

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/orgs/current/teams/{team_id}/members
Adds organization members to a team and returns a status for each identity:
CREATED when it was added, UNCHANGED when it was already a member, and FAILED
when it is not an organization identity in this organization. A workspace
scoped team only takes people who are members of its workspace, and also records
their workspace identity. An organization scoped team records each person's workspace
identity in every workspace it is granted into. The other identities are still
added. A workspace scoped team needs workspaces:teams:manage-members in its
workspace, and an organization scoped team needs organization:teams:manage-members.