<!-- langchain-docs: Invalidate tools cache | https://docs.langchain.com/langsmith/smith-api/mcp/invalidate-tools-cache -->

# Invalidate tools cache

/langsmith/langsmith-platform-openapi.json delete /api/v1/mcp/tools
Invalidate cached MCP tools for a given server URL.

Called when a tool call fails with a stale-tools error, so subsequent
requests to GET /mcp/tools will re-fetch from the remote server.