<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Send an MCP message to a server | https://docs.langchain.com/langsmith/tool-gateway-api/calling-tools/send-an-mcp-message-to-a-server -->

# 向服务器发送MCP消息

/langsmith/tool-gateway-openapi.json 发布 /v1/managed-tools/servers/{id}/mcp
将 MCP 可流式 HTTP 请求代理到一台 MCP 服务器或内置服务器。需要 mcp-servers:invoke。更喜欢为代理和 MCP 客户提供工具包。如果您未连接，则会收到 428 或 MCP URL 提示； API 概述涵盖了两者。