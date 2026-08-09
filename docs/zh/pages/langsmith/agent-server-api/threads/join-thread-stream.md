<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Join Thread Stream | https://docs.langchain.com/langsmith/agent-server-api/threads/join-thread-stream -->

# 加入线程流

/langsmith/agent-server-openapi.json 获取 /threads/{thread_id}/stream
该端点从线程实时传输输出。该流将包含在线程上顺序执行的每个运行的输出，并将无限期保持打开状态。调用客户端有责任关闭连接。