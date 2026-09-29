<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get Thread Storage | https://docs.langchain.com/langsmith/agent-server-api/threads/get-thread-storage -->

# 获取线程存储

/langsmith/agent-server-openapi.json 获取 /threads/{thread_id}/storage
线程的检查点在内置检查指针中占用的字节数，存储为：检查点、通道值（每个通道）和挂起的写入。配置自定义检查点时返回 501。