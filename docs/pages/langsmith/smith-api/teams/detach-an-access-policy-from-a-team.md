<!-- langchain-docs: Detach an access policy from a team | https://docs.langchain.com/langsmith/smith-api/teams/detach-an-access-policy-from-a-team -->

# Detach an access policy from a team

/langsmith/langsmith-platform-openapi.json delete /api/v1/platform/orgs/current/teams/{team_id}/access-policies/{access_policy_id}
Detaches an access policy from a team. A workspace scoped team's policy is detached
from its workspace. An organization-wide team's policy is detached from the
workspace_id given, or from every workspace the team has access to when it is
omitted. Returns 204 also when the policy was not attached. Needs the same
permissions as attaching the policy.