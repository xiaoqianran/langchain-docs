<!-- langchain-docs: Update org service key | https://docs.langchain.com/langsmith/smith-api/orgs/update-org-service-key -->

# Update org service key

/langsmith/langsmith-platform-openapi.json patch /api/v1/orgs/current/service-keys/{api_key_id}
Update an API key's role(s) in place without rotating the key.

Organization Operators cannot assign the Organization Admin role or change
a key that already holds it, and no key can change its own roles. Applies
to both org-scoped and workspace-scoped keys.