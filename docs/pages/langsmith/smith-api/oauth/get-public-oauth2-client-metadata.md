<!-- langchain-docs: Get public OAuth2 client metadata | https://docs.langchain.com/langsmith/smith-api/oauth/get-public-oauth2-client-metadata -->

# Get public OAuth2 client metadata

/langsmith/langsmith-platform-openapi.json get /oauth/client/{clientID}
Returns the display metadata (name, logo, homepage/terms/privacy links) for a registered OAuth2 client. Used by the consent screen to show a human-readable client identity instead of the raw client_id. Public endpoint; exposes only non-sensitive display fields.