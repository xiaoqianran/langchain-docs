<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Join Run Stream | https://docs.langchain.com/langsmith/agent-server-api/thread-runs/join-run-stream -->

# 加入运行流

/langsmith/agent-server-openapi.json 获取 /threads/{thread_id}/runs/{run_id}/stream
加入跑步流。此端点从类似于 /threads/__THREAD_ID__/runs/stream 端点的运行中实时流式输出。如果运行已使用 `stream_resumable=true` 创建，则可以从上次看到的事件 ID 恢复流。