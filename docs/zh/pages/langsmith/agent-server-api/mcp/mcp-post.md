<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: MCP Post | https://docs.langchain.com/langsmith/agent-server-api/mcp/mcp-post -->

#MCP 帖子

/langsmith/agent-server-openapi.json 发布 /mcp/
根据 Streamable HTTP Transport 规范实现。
向服务器发送 JSON-RPC 2.0 消息。

- **请求**：提供一个带有`jsonrpc`、`id`、`method`和可选的`params`的对象。
- **响应**：返回 JSON-RPC 响应或确认。

**注释：**
- 无状态：会话不会在请求之间保留。