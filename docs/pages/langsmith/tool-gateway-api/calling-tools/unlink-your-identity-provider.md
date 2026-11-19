<!-- langchain-docs: Unlink your identity provider | https://docs.langchain.com/langsmith/tool-gateway-api/calling-tools/unlink-your-identity-provider -->

# Unlink your identity provider

/langsmith/tool-gateway-openapi.json delete /v1/managed-tools/oidc-connection
Unlinks the identity provider so its access tokens no longer authenticate MCP calls; the integration is kept. Requires workspaces:integrations:manage. Call as yourself. Returns 204 if no provider is linked.