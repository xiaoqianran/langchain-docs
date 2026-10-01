<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Roll an issues agent webhook signing secret | https://docs.langchain.com/langsmith/smith-api/issues-agent/roll-an-issues-agent-webhook-signing-secret -->

# 滚动问题代理 webhook 签名密钥

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/sessions/{session_id}/issues-agent/webhooks/{id}/roll-secret
替换给定通用 URL 问题代理 Webhook 的签名密钥。松弛
并且 Jira 目标没有签名秘密。新的秘密在此返回一次
回应；未来的交付立即使用它。 URL 和标头值经过编辑；
仅返回安全的 URL 显示和标头名称。