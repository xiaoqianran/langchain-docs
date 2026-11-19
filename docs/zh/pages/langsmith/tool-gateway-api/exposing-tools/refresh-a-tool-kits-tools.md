<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Refresh a tool kit's tools | https://docs.langchain.com/langsmith/tool-gateway-api/exposing-tools/refresh-a-tool-kits-tools -->

# 刷新工具包的工具

/langsmith/tool-gateway-openapi.json 发布 /v1/managed-tools/kits/{kit_id}/tool-refresh
刷新工具包的 MCP 服务器并等待缓存更新。需要 mcp-servers:update 和 mcp-servers:invoke，并且 MCP 服务器或内置服务器上没有 ABAC 拒绝策略。以您自己的身份打电话。还存储您列出的服务器工具定义（不是内置工具），因此未连接的用户仍然可以看到这些工具。当每个服务器都刷新或需要凭证时返回200； Missing_credentials 列出了您必须连接的凭证。其他失败会返回错误，但保留其他服务器的写入。 90 秒后超时。