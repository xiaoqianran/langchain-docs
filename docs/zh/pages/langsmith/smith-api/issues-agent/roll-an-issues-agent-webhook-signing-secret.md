<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Roll an issues agent webhook signing secret | https://docs.langchain.com/langsmith/smith-api/issues-agent/roll-an-issues-agent-webhook-signing-secret -->

# 滚动问题代理 webhook 签名密钥

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/sessions/{session_id}/issues-agent/webhooks/{id}/roll-secret
替换给定问题代理 webhook 的签名密钥并返回
更新了网络钩子。未来的交付将立即使用新的秘密进行签名。