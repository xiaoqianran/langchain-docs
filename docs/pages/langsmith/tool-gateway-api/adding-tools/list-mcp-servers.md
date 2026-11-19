<!-- langchain-docs: List MCP servers | https://docs.langchain.com/langsmith/tool-gateway-api/adding-tools/list-mcp-servers -->

# List MCP servers

/langsmith/tool-gateway-openapi.json get /v1/managed-tools/servers
Lists the workspace's MCP servers, your personal servers, and the built-ins available to the workspace, with your connection status. Requires mcp-servers:read. credential_source says whose credential calls use; a workspace credential shows as connected for everyone. With credential_owner_type, shows status for that owner: an agent requires workspaces:credentials:read-metadata and projects:read on the agent's tracing project; the workspace (credential_owner_id = workspace ID) requires workspaces:credentials:read-metadata.