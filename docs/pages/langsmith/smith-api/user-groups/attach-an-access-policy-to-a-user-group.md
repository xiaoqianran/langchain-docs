<!-- langchain-docs: Attach an access policy to a user group | https://docs.langchain.com/langsmith/smith-api/user-groups/attach-an-access-policy-to-a-user-group -->

# Attach an access policy to a user group

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/orgs/current/user-groups/{user_group_id}/access-policies
Attaches an existing access policy in the organization to a user group. A workspace
scoped user group's policy applies in its workspace. An organization-wide user group's policy applies
in the workspace_id given, or in every workspace the user group has access to when it is
omitted. Returns 201 when the policy is attached, or 200 when it was already
attached. A workspace scoped user group needs workspaces:user-groups:manage-policies in its
workspace. An organization scoped user group needs organization:user-groups:manage-policies, and
for a policy in one workspace the caller must also be a member of that workspace.