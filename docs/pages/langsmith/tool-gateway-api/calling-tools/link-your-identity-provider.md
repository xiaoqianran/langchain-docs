<!-- langchain-docs: Link your identity provider | https://docs.langchain.com/langsmith/tool-gateway-api/calling-tools/link-your-identity-provider -->

# Link your identity provider

/langsmith/tool-gateway-openapi.json put /v1/managed-tools/oidc-connection
Links an enabled identity provider in this workspace so its access tokens can authenticate MCP calls, replacing any current link. Requires workspaces:integrations:manage. Call as yourself.