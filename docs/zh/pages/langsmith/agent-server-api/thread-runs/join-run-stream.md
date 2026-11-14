<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Join Run Stream | https://docs.langchain.com/langsmith/agent-server-api/thread-runs/join-run-stream -->

# 加入运行流

/langsmith/agent-server-openapi.json 获取 /threads/{thread_id}/runs/{run_id}/stream
加入跑步流。此端点从类似于 /threads/__THREAD_ID__/runs/stream 端点的运行实时流式输出。流可以从上次看到的事件 ID 或从带有 `checkpoint_id` 的运行检查点恢复。在内存运行时 (`langgraph dev`) 中，只能恢复使用 `stream_resumable=true` 创建的运行。当客户端应该接收的事件可能丢失时，首先在恢复或中流时发送 `gap` 事件。当它们可能已经超出流的历史记录时，它的 `reason` 是 `expired`； `unknown_id` 当 `Last-Event-ID` 晚于线程流式传输的任何事件时，并且流从运行的第一个事件开始；或 `too_large` 当事件超过大小限制时，该事件的流模式为 `mode`。为了安全起见，`expired` 会犯错误：一旦流的历史记录过期，恢复就会获取它，除非它的 ID 是线程的最后一个流事件，该事件会在该事件之后保留一个小时。