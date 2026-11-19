<!-- langchain-docs: Store a profile credential | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/store-a-profile-credential -->

# Store a profile credential

/langsmith/tool-gateway-openapi.json put /v1/managed-tools/profiles/{profile_id}/servers/{id}/credential
Stores or replaces a profile's header credentials for a secret MCP server. Requires workspaces:credentials:manage and mcp-servers:invoke for the server. Call as yourself. Values are never returned.