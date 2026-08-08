<!-- langchain-docs: Rotate an oauth client secret | https://docs.langchain.com/langsmith/smith-api/oauth/rotate-an-oauth-client-secret -->

# Rotate an oauth client secret

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/oauth/clients/{id}/rotate-secret
Generates a new client secret for a confidential client, invalidating the previous one. The new secret is shown only once.