<!-- langchain-docs: Send an MCP message to a tool kit | https://docs.langchain.com/langsmith/tool-gateway-api/calling-tools/send-an-mcp-message-to-a-tool-kit -->

# Send an MCP message to a tool kit

/langsmith/tool-gateway-openapi.json post /v1/managed-tools/kits/{kit_id}/mcp
Serves a tool kit as one stateless MCP endpoint: initialize, server/discover, ping, tools/list, and tools/call. Requires mcp-servers:invoke. Tool lists are cached for 2 hours and served stale for up to 30 more minutes while they refresh. tools/list includes tools from servers you haven't connected and names each missing credential in result._meta["com.langchain.langsmith/missingCredentials"]. The me kit holds every server you can use; pair it with search mode. The API overview covers connecting, approvals, and search mode.