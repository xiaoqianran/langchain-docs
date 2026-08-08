<!-- langchain-docs: Protocol v2 Command | https://docs.langchain.com/langsmith/agent-server-api/streaming/protocol-v2-command -->

# Protocol v2 Command

/langsmith/agent-server-openapi.json post /threads/{thread_id}/commands
Send a single protocol command scoped to a thread. The request body is a `ProtocolCommand` envelope with a `method` (e.g. `run.start`, `input.respond`, `agent.getTree`) and method-specific `params`. The response is either a `ProtocolSuccess` (with method-specific `result`) or a `ProtocolError`.

Commands that create runs (`run.start`, `input.respond`) leave the run executing in the background on the worker queue. Event streaming for that run is observed via a concurrent `POST /threads/{thread_id}/stream/events` connection.

WebSocket clients use the same command envelope in-band on `/threads/{thread_id}/stream/events` and additionally have access to `subscription.subscribe` / `subscription.unsubscribe` over the same connection.