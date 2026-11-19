<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Start connecting a server in a tool kit | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/start-connecting-a-server-in-a-tool-kit -->

# 开始连接工具包中的服务器

/langsmith/tool-gateway-openapi.json 发布 /v1/managed-tools/kits/{kit_id}/connections/{server_id}
将您连接到工具包使用的一台 MCP 服务器并返回您完成的链接。对于 me 套件，您可以使用任何服务器。需要 mcp-servers:invoke。如果您已连接或服务器不需要凭据，则返回 204。代理或个人资料得到 409；管理员必须连接它。