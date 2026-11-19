<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Send an MCP message to a tool kit | https://docs.langchain.com/langsmith/tool-gateway-api/calling-tools/send-an-mcp-message-to-a-tool-kit -->

# 向工具包发送MCP消息

/langsmith/tool-gateway-openapi.json 发布 /v1/managed-tools/kits/{kit_id}/mcp
将工具包用作一个无状态 MCP 端点：初始化、服务器/发现、ping、工具/列表和工具/调用。需要 mcp-servers:invoke。工具列表会缓存 2 小时，并在刷新时保持最多 30 分钟的陈旧状态。 tools/list 包含来自您尚未连接的服务器的工具，并在 result._meta["com.langchain.langsmith/missingCredentials"] 中命名每个缺失的凭证。 me 套件包含您可以使用的所有服务器；将其与搜索模式配对。 API 概述涵盖连接、批准和搜索模式。