<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Open an MCP event stream from a server | https://docs.langchain.com/langsmith/tool-gateway-api/calling-tools/open-an-mcp-event-stream-from-a-server -->

# 从服务器打开 MCP 事件流

/langsmith/tool-gateway-openapi.json 获取 /v1/managed-tools/servers/{id}/mcp
将 MCP 可流式 HTTP 请求代理到一台 MCP 服务器或内置服务器。需要 mcp-servers:invoke。更喜欢为代理和 MCP 客户提供工具包。如果您未连接，则会收到 428 或 MCP URL 提示； API 概述涵盖了两者。