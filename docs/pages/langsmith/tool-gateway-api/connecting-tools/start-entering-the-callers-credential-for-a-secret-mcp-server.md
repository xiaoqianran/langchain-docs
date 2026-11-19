<!-- langchain-docs: Start entering the caller's credential for a secret MCP server | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/start-entering-the-callers-credential-for-a-secret-mcp-server -->

# Start entering the caller's credential for a secret MCP server

/langsmith/tool-gateway-openapi.json post /v1/managed-tools/servers/{id}/credential-sessions
Returns a link where you enter the values a workspace or built-in secret MCP server needs, to connect without calling the server first. Requires mcp-servers:invoke for the server. Choose who you call as the same way as for MCP calls. The link is single-use, expires in 10 minutes, and its token is returned only once; stored values stay in use until you submit. Other servers return 409. With credential_owner_type, you as an admin get a link to connect that agent; this requires workspaces:credentials:manage and projects:update on the agent's tracing project.