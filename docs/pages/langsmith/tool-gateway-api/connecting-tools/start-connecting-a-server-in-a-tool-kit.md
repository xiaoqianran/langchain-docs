<!-- langchain-docs: Start connecting a server in a tool kit | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/start-connecting-a-server-in-a-tool-kit -->

# Start connecting a server in a tool kit

/langsmith/tool-gateway-openapi.json post /v1/managed-tools/kits/{kit_id}/connections/{server_id}
Connects you to one MCP server a tool kit uses and returns the link where you finish. For the me kit, any server you can use. Requires mcp-servers:invoke. Returns 204 if you're already connected or the server needs no credential. An agent or profile gets 409; an admin must connect it.