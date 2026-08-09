<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Protocol v2 Command | https://docs.langchain.com/langsmith/agent-server-api/streaming/protocol-v2-command -->

# 协议 v2 命令

/langsmith/agent-server-openapi.json 发布 /threads/{thread_id}/commands
发送作用域为线程的单个协议命令。请求正文是一个 `ProtocolCommand` 信封，带有 `method`（例如 `run.start`、`input.respond`、`agent.getTree`）和特定于方法的 `params`。响应是 `ProtocolSuccess`（具有特定于方法的 `result`）或 `ProtocolError`。

创建运行的命令（`run.start`、`input.respond`）使运行在工作队列的后台执行。通过并发 `POST /threads/{thread_id}/stream/events` 连接观察该运行的事件流。

WebSocket 客户端在 `/threads/{thread_id}/stream/events` 上使用相同的带内命令信封，并且还可以通过同一连接访问 `subscription.subscribe` / `subscription.unsubscribe`。