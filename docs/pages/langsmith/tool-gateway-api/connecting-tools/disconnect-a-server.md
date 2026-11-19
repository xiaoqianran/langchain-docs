<!-- langchain-docs: Disconnect a server | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/disconnect-a-server -->

# Disconnect a server

/langsmith/tool-gateway-openapi.json delete /v1/managed-tools/servers/{id}/credential
Disconnects you from an MCP server by deleting your credential; the server and other users' credentials are kept. A shared OAuth credential is removed from every integration that uses its connection. Returns 204 if you're already disconnected. With credential_owner_type, disconnects that owner and revokes managed OAuth tokens: an agent requires workspaces:credentials:manage and projects:update on the agent's tracing project; the workspace (credential_owner_id = workspace ID) requires workspaces:credentials:manage and works only on a workspace secret server, else 409.