<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Invalidate tools cache | https://docs.langchain.com/langsmith/smith-api/mcp/invalidate-tools-cache -->

# 使工具缓存无效

/langsmith/langsmith-platform-openapi.json 删除 /api/v1/mcp/tools
使给定服务器 URL 的缓存 MCP 工具无效。

当工具调用因 stale-tools 错误而失败时调用，因此后续
对 GET /mcp/tools 的请求将从远程服务器重新获取。