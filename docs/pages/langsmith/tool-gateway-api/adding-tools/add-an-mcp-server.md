<!-- langchain-docs: Add an MCP server | https://docs.langchain.com/langsmith/tool-gateway-api/adding-tools/add-an-mcp-server -->

# Add an MCP server

/langsmith/tool-gateway-openapi.json post /v1/managed-tools/servers
Registers an HTTPS MCP server that is public or uses OAuth or per-user header credentials. Requires mcp-servers:create for a workspace server (the default, visible to the workspace), or mcp-servers:create-personal or mcp-servers:create for a personal server (visible only to you). Call as yourself. Selecting a shared OAuth connection also requires workspaces:integrations:manage. A workspace secret server can include a workspace credential, which every caller then uses and which blocks other credentials; this requires workspaces:credentials:manage. Credential values are never returned.