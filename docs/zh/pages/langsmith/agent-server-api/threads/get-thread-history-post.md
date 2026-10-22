<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get Thread History Post | https://docs.langchain.com/langsmith/agent-server-api/threads/get-thread-history-post -->

# 获取帖子历史记录

/langsmith/agent-server-openapi.json 发布 /threads/{thread_id}/history
获取线程的所有过去状态。可以返回少于 `limit` 个状态；带有 `before` 的页面以进一步阅读。