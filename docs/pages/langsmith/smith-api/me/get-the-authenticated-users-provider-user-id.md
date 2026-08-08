<!-- langchain-docs: Get the authenticated user's provider user ID | https://docs.langchain.com/langsmith/smith-api/me/get-the-authenticated-users-provider-user-id -->

# Get the authenticated user's provider user ID

/langsmith/langsmith-platform-openapi.json get /me/providers/{providerType}
Returns the provider user ID associated with the authenticated user for a given provider type, or null if not set. Scoped to the current tenant.