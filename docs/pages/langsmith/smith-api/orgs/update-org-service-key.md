<!-- langchain-docs: Update org service key | https://docs.langchain.com/langsmith/smith-api/orgs/update-org-service-key -->

# Update org service key

/langsmith/langsmith-platform-openapi.json patch /api/v1/orgs/current/service-keys/{api_key_id}
Update an API key's role(s) in place without rotating the key.

Restricted to org admins (ORGANIZATION_MANAGE). Applies to both
org-scoped and workspace-scoped keys listed in /orgs/current/service-keys.