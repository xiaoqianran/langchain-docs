<!-- langchain-docs: Remove an MCP server | https://docs.langchain.com/langsmith/tool-gateway-api/adding-tools/remove-an-mcp-server -->

# Remove an MCP server

/langsmith/tool-gateway-openapi.json delete /v1/managed-tools/servers/{id}
Deletes an MCP server and its credential setup; shared OAuth connections are kept. Requires mcp-servers:delete for a workspace server. Call as yourself. Only the user who registered a personal server can delete it.