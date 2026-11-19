<!-- langchain-docs: Delete a profile credential | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/delete-a-profile-credential -->

# Delete a profile credential

/langsmith/tool-gateway-openapi.json delete /v1/managed-tools/profiles/{profile_id}/servers/{id}/credential
Disconnects a profile from an MCP server and revokes managed OAuth tokens with their provider. Requires workspaces:credentials:manage and mcp-servers:invoke for the server. Call as yourself. The server and other credentials are kept. Returns 204 if the profile is already disconnected.