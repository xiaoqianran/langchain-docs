<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Protocol v2 Event Stream (SSE) | https://docs.langchain.com/langsmith/agent-server-api/streaming/protocol-v2-event-stream-sse -->

# 协议 v2 事件流 (SSE)

/langsmith/agent-server-openapi.json 发布 /threads/{thread_id}/stream/events
为线程打开连接范围的 SSE 事件流。请求体是一个`ProtocolEventStreamRequest`，携带通道和命名空间过滤器；服务器回复`Content-Type: text/event-stream`，并在连接的生命周期内推送匹配的`ProtocolEvent`帧。关闭连接即取消订阅——服务器端不会保留任何状态。

重新连接：客户端将他们收到的最后一个 `seq` 作为 `since` 在正文中传递。具有 `seq > since` 的缓冲事件会在流上线之前重播。该端点仅是 POST，因此浏览器本机 `EventSource` 自动恢复 (`Last-Event-ID`) 不适用 — 客户端通过正文显式驱动恢复。