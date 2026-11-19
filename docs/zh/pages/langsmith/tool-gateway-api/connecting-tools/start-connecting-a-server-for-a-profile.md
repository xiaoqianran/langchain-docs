<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Start connecting a server for a profile | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/start-connecting-a-server-for-a-profile -->

# 开始连接服务器以获取配置文件

/langsmith/tool-gateway-openapi.json 发布 /v1/managed-tools/profiles/{profile_id}/servers/{id}/credential-sessions
返回一个链接，您作为管理员可以通过 OAuth 或秘密值将配置文件连接到 MCP 服务器。需要服务器的工作区：凭据：管理和 mcp-服务器：调用。以您自己的身份打电话。该链接是一次性的，并在 10 分钟后过期；在您完成之前，任何存储的凭据都会继续使用。使用客户端凭据的 OAuth 服务器会立即连接并返回已完成的状态，但没有链接。公共服务器返回 409。