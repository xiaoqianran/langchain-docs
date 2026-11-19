<!-- langchain-docs: Start connecting a server for a profile | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/start-connecting-a-server-for-a-profile -->

# Start connecting a server for a profile

/langsmith/tool-gateway-openapi.json post /v1/managed-tools/profiles/{profile_id}/servers/{id}/credential-sessions
Returns a link where you, as an admin, connect a profile to an MCP server through OAuth or secret values. Requires workspaces:credentials:manage and mcp-servers:invoke for the server. Call as yourself. The link is single-use and expires in 10 minutes; any stored credential stays in use until you finish. An OAuth server that uses client credentials connects right away and returns status completed with no link. Public servers return 409.