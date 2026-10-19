<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create prompt webhook | https://docs.langchain.com/langsmith/smith-api/prompt-webhooks/create-prompt-webhook -->

# 创建提示 webhook

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/prompt-webhooks
创建一个新的提示 Webhook。

LangSmith 向列出的每个事件的 Webhook URL 发送 POST 请求
在它匹配的提示上触发。一个工作区可以有一个提示 Webhook
除非其限额被提高；创建超过限制的值会返回 400。