<!-- langchain-docs: Turn an MCP server on or off | https://docs.langchain.com/langsmith/tool-gateway-api/adding-tools/turn-an-mcp-server-on-or-off -->

# Turn an MCP server on or off

/langsmith/tool-gateway-openapi.json patch /v1/managed-tools/servers/{id}
Turns a personal MCP server or built-in on or off for the whole workspace. Requires workspaces:integrations:manage or workspaces:manage. Calls to a server that is off are rejected. A built-in's switch is the same one Fleet uses. Workspace servers can't be turned off yet.