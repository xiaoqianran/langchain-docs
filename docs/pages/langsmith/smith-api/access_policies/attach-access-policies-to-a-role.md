<!-- langchain-docs: Attach access policies to a role | https://docs.langchain.com/langsmith/smith-api/access_policies/attach-access-policies-to-a-role -->

# Attach access policies to a role

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/orgs/current/access-policies/roles/{role_id}/access-policies
Attaches one or more access policies to a specific role. The request body must contain an array of access policy IDs.