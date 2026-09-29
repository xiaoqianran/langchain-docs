<!-- langchain-docs: MCP Post | https://docs.langchain.com/langsmith/agent-server-api/mcp/mcp-post -->

# MCP Post

/langsmith/agent-server-openapi.json post /mcp/
Implemented according to the Streamable HTTP Transport specification.
Sends a JSON-RPC 2.0 message to the server.

- **Request**: Provide an object with `jsonrpc`, `id`, `method`, and optional `params`.
- **Response**: Returns a JSON-RPC response or acknowledgment.

**Notes:**
- Stateless: Sessions are not persisted across requests.