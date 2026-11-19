<!-- langchain-docs: List the caller's connections for a tool kit | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/list-the-callers-connections-for-a-tool-kit -->

# List the caller's connections for a tool kit

/langsmith/tool-gateway-openapi.json get /v1/managed-tools/kits/{kit_id}/connections
Lists the MCP servers a tool kit uses that you can call, with whether you're connected and which kit tools use each server. For the me kit, lists every server you can use. Requires mcp-servers:invoke. This only checks status; to connect, call POST /v1/managed-tools/kits/{kit_id}/connections/{server_id}.