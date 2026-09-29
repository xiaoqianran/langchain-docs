<!-- langchain-docs: Protocol v2 Event Stream (SSE) | https://docs.langchain.com/langsmith/agent-server-api/streaming/protocol-v2-event-stream-sse -->

# Protocol v2 Event Stream (SSE)

/langsmith/agent-server-openapi.json post /threads/{thread_id}/stream/events
Open a connection-scoped SSE event stream for a thread. The request body is a `ProtocolEventStreamRequest` carrying channel and namespace filters; the server replies with `Content-Type: text/event-stream` and pushes matching `ProtocolEvent` frames for the lifetime of the connection. Closing the connection unsubscribes — no state is persisted server-side.

Reconnect: clients pass the last `seq` they received as `since` in the body. Buffered events with `seq > since` are replayed before the stream goes live. The endpoint is POST-only, so browser-native `EventSource` auto-resume (`Last-Event-ID`) does not apply — clients drive resume explicitly via the body.