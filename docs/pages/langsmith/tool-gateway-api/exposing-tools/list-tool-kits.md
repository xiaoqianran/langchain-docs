<!-- langchain-docs: List tool kits | https://docs.langchain.com/langsmith/tool-gateway-api/exposing-tools/list-tool-kits -->

# List tool kits

/langsmith/tool-gateway-openapi.json get /v1/managed-tools/kits
Lists the workspace's tool kits and your personal tool kits in creation order. Requires mcp-servers:read. Call as yourself. Items omit tools; get a kit to see its tools.