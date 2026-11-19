<!-- langchain-docs: Refresh a tool kit's tools | https://docs.langchain.com/langsmith/tool-gateway-api/exposing-tools/refresh-a-tool-kits-tools -->

# Refresh a tool kit's tools

/langsmith/tool-gateway-openapi.json post /v1/managed-tools/kits/{kit_id}/tool-refresh
Refreshes a tool kit's MCP servers and waits for the cache to update. Requires mcp-servers:update and mcp-servers:invoke, and no ABAC deny policy on MCP servers or built-ins. Call as yourself. Also stores the servers' tool definitions as you list them (not built-ins), so users who aren't connected still see the tools. Returns 200 when every server refreshes or needs a credential; missing_credentials lists the ones you must connect. Other failures return an error but keep other servers' writes. Times out after 90 seconds.