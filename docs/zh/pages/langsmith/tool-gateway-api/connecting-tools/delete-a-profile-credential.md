<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete a profile credential | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/delete-a-profile-credential -->

# 删除个人资料凭证

/langsmith/tool-gateway-openapi.json 删除 /v1/management-tools/profiles/{profile_id}/servers/{id}/credential
断开配置文件与 MCP 服务器的连接，并撤销与其提供商的托管 OAuth 令牌。需要服务器的工作区：凭据：管理和 mcp-服务器：调用。以您自己的身份打电话。保留服务器和其他凭据。如果配置文件已断开连接，则返回 204。