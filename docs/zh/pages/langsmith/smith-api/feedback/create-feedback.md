<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create feedback | https://docs.langchain.com/langsmith/smith-api/feedback/create-feedback -->

# 创建反馈

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/feedback
创建新的反馈。

`session_id` 标识反馈所属的跟踪项目。它是
除非反馈是由`agent_id`解决的，并且
`agent_environment`，通过Agent环境命名该项目
那已经存在了。