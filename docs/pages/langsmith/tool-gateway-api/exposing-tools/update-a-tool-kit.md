<!-- langchain-docs: Update a tool kit | https://docs.langchain.com/langsmith/tool-gateway-api/exposing-tools/update-a-tool-kit -->

# Update a tool kit

/langsmith/tool-gateway-openapi.json patch /v1/managed-tools/kits/{kit_id}
Updates the fields you send and returns the tool kit. Requires mcp-servers:invoke, plus mcp-servers:update for a workspace kit, or mcp-servers:create-personal or mcp-servers:create for a personal kit. Call as yourself. Sending tools replaces the selection (an empty array or null removes all) and stores tool definitions as you list them; a listing failure doesn't fail the write. A kit keeps its scope: only a personal kit can link personal servers.