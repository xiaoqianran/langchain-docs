<!-- langchain-docs: Send an MCP message to a server | https://docs.langchain.com/langsmith/tool-gateway-api/calling-tools/send-an-mcp-message-to-a-server -->

# Send an MCP message to a server

/langsmith/tool-gateway-openapi.json post /v1/managed-tools/servers/{id}/mcp
Proxies MCP Streamable HTTP requests to one MCP server or built-in. Requires mcp-servers:invoke. Prefer a tool kit for agents and MCP clients. If you aren't connected, you get 428 or an MCP URL elicitation; the API overview covers both.