<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List the caller's connections for a tool kit | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/list-the-callers-connections-for-a-tool-kit -->

# 列出工具包的调用者连接

/langsmith/tool-gateway-openapi.json 获取 /v1/managed-tools/kits/{kit_id}/connections
列出工具包使用的您可以调用的 MCP 服务器，以及您是否已连接以及哪些工具包工具使用每个服务器。对于 me 工具包，列出了您可以使用的每个服务器。需要 mcp-servers:invoke。这仅检查状态；要连接，请调用 POST /v1/managed-tools/kits/{kit_id}/connections/{server_id}。