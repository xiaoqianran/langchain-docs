<!-- langchain-docs: Detach an access policy from a user group | https://docs.langchain.com/langsmith/smith-api/user-groups/detach-an-access-policy-from-a-user-group -->

# Detach an access policy from a user group

/langsmith/langsmith-platform-openapi.json delete /api/v1/platform/orgs/current/user-groups/{user_group_id}/access-policies/{access_policy_id}
Detaches an access policy from a user group. A workspace scoped user group's policy is detached
from its workspace. An organization-wide user group's policy is detached from the
workspace_id given, or from every workspace the user group has access to when it is
omitted. Returns 204 also when the policy was not attached. Needs the same
permissions as attaching the policy.