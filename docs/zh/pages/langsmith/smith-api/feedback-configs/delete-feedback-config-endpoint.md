<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete feedback config endpoint | https://docs.langchain.com/langsmith/smith-api/feedback-configs/delete-feedback-config-endpoint -->

# 删除反馈配置端点

/langsmith/langsmith-platform-openapi.json 删除 /api/v1/feedback-configs
通过将反馈配置标记为已删除来软删除反馈配置。

稍后可以使用相同的密钥重新创建配置（简单的重用模式）。
使用此键的现有反馈记录将保持不变。