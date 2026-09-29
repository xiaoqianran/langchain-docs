<!-- langchain-docs: Create an oauth client | https://docs.langchain.com/langsmith/smith-api/oauth/create-an-oauth-client -->

# Create an oauth client

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/oauth/clients
Registers a new OAuth 2.0 / OIDC client owned by the caller's organization. For confidential clients the response includes a client_secret that is shown only once.