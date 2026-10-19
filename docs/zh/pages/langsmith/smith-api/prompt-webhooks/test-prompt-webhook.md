<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Test prompt webhook | https://docs.langchain.com/langsmith/smith-api/prompt-webhooks/test-prompt-webhook -->

# 测试提示 webhook

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/prompt-webhooks/test
测试特定的提示 Webhook。

将示例有效负载发送到请求正文中的 Webhook 配置
不保存它，但前提是 webhook 的触发器包含有效负载的
事件及其提示过滤器与有效负载的提示匹配。否则什么都没有
已发送。如果目标不接受负载，则失败。