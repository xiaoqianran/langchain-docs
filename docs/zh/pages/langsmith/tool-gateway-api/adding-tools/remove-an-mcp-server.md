<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Remove an MCP server | https://docs.langchain.com/langsmith/tool-gateway-api/adding-tools/remove-an-mcp-server -->

# 删除MCP服务器

/langsmith/tool-gateway-openapi.json 删除 /v1/managed-tools/servers/{id}
删除 MCP 服务器及其凭证设置；保留共享的 OAuth 连接。工作区服务器需要 mcp-servers:delete。以您自己的身份打电话。只有注册个人服务器的用户才能删除它。