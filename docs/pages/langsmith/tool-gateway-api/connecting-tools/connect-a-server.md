<!-- langchain-docs: Connect a server | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/connect-a-server -->

# Connect a server

/langsmith/tool-gateway-openapi.json put /v1/managed-tools/servers/{id}/credential
Connects you to a secret MCP server by storing or replacing your header credentials. Requires mcp-servers:invoke. Call as yourself. Values are never returned. With credential_owner_type, stores that owner's credentials: an agent requires workspaces:credentials:manage and projects:update on the agent's tracing project. The workspace (credential_owner_id = workspace ID) requires workspaces:credentials:manage and works only on a workspace secret server, else 409; storing it permanently deletes every other credential on the server and blocks new ones.