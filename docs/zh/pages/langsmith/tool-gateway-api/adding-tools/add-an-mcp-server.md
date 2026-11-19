<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add an MCP server | https://docs.langchain.com/langsmith/tool-gateway-api/adding-tools/add-an-mcp-server -->

# 添加MCP服务器

/langsmith/tool-gateway-openapi.json 发布 /v1/managed-tools/servers
注册公共或使用 OAuth 或每用户标头凭据的 HTTPS MCP 服务器。需要 mcp-servers:create 用于工作区服务器（默认设置，对工作区可见），或 mcp-servers:create-personal 或 mcp-servers:create 用于个人服务器（仅对您可见）。以您自己的身份打电话。选择共享 OAuth 连接还需要工作空间：集成：管理。工作区秘密服务器可以包含工作区凭证，每个调用者都可以使用该凭证并阻止其他凭证；这需要工作空间：凭据：管理。凭证值永远不会返回。