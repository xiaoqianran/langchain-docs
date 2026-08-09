<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get tools | https://docs.langchain.com/langsmith/smith-api/mcp/get-tools -->

# 获取工具

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/mcp/tools
返回 MCP 工具 — 如果是新鲜的，则从缓存中返回，否则从远程获取。

缓存未命中时，首先尝试清单获取（快速），然后回退到完整状态
MCP 握手。返回之前缓存结果。

通过force_refresh = true绕过缓存并始终从
远程服务器（结果仍然通过 upsert 缓存以供将来请求）。

``agent_id`` 让部署/服务密钥调用者命名代理 OAuth
主题。 ``ls_user_id`` 覆盖仅限于服务标识。