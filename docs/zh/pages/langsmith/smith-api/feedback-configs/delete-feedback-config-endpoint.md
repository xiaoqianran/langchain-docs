<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete feedback config endpoint | https://docs.langchain.com/langsmith/smith-api/feedback-configs/delete-feedback-config-endpoint -->

# 删除反馈配置端点

/langsmith/langsmith-platform-openapi.json 删除 /api/v1/feedback-configs
按 id 软删除一个反馈配置，或反馈键的每个配置。

稍后可以使用相同的密钥重新创建配置（简单的重用模式）。
使用此键的现有反馈记录将保持不变。删除一个
强制配置关闭其强制而不是删除它，并且需要
反馈配置：管理强制权限。
拒绝删除注释队列使用的非强制配置。