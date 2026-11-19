<!-- langchain-docs: Create a tool kit | https://docs.langchain.com/langsmith/tool-gateway-api/exposing-tools/create-a-tool-kit -->

# Create a tool kit

/langsmith/tool-gateway-openapi.json post /v1/managed-tools/kits
Creates a tool kit, a named set of tools served through one MCP endpoint. Requires mcp-servers:invoke, plus mcp-servers:create for a workspace kit (the default), or mcp-servers:create-personal or mcp-servers:create for a personal kit (scope personal). Call as yourself. A workspace kit links only workspace MCP servers and built-ins. A personal kit can also link your personal servers and is visible only to you. Tool definitions are stored as you list them (not built-ins), so users who aren't connected still see the tools; a listing failure doesn't fail the write.