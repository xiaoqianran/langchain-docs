<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Turn an MCP server on or off | https://docs.langchain.com/langsmith/tool-gateway-api/adding-tools/turn-an-mcp-server-on-or-off -->

# 打开或关闭 MCP 服务器

/langsmith/tool-gateway-openapi.json 补丁 /v1/managed-tools/servers/{id}
打开或关闭整个工作区的个人 MCP 服务器或内置服务器。需要工作区：集成：管理或工作区：管理。对关闭的服务器的调用将被拒绝。内置开关与 Fleet 使用的开关相同。工作区服务器尚无法关闭。