<!-- langchain-docs: Attach an access policy to a team | https://docs.langchain.com/langsmith/smith-api/teams/attach-an-access-policy-to-a-team -->

# Attach an access policy to a team

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/orgs/current/teams/{team_id}/access-policies
Attaches an existing access policy in the organization to a team. A workspace
scoped team's policy applies in its workspace. An organization-wide team's policy applies
in the workspace_id given, or in every workspace the team has access to when it is
omitted. Returns 201 when the policy is attached, or 200 when it was already
attached. A workspace scoped team needs workspaces:teams:manage-policies in its
workspace. An organization scoped team needs organization:teams:manage-policies, and
for a policy in one workspace the caller must also be a member of that workspace.