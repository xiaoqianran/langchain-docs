<!-- langchain-docs: Delete a tool kit | https://docs.langchain.com/langsmith/tool-gateway-api/exposing-tools/delete-a-tool-kit -->

# Delete a tool kit

/langsmith/tool-gateway-openapi.json delete /v1/managed-tools/kits/{kit_id}
Deletes a tool kit; its MCP servers and user credentials are kept. Requires mcp-servers:delete for a workspace kit. Only the owner can delete a personal kit, with mcp-servers:create-personal or mcp-servers:create. Returns 204 if the kit is already gone.