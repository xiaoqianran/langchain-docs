<!-- langchain-docs: A2A JSON-RPC | https://docs.langchain.com/langsmith/agent-server-api/a2a/a2a-json-rpc -->

# A2A JSON-RPC

/langsmith/agent-server-openapi.json post /a2a/{assistant_id}
Communicate with an assistant using the Agent-to-Agent (A2A) Protocol over JSON-RPC 2.0.
This endpoint accepts a JSON-RPC envelope and dispatches based on `method`.

**Supported Methods:**
- `message/send`: Send a message and wait for the final Task result.
- `message/stream`: Send a message and receive Server-Sent Events (SSE) JSON-RPC responses.
- `tasks/get`: Fetch the current state of a Task by ID.
- `tasks/cancel`: Request cancellation (currently not supported; returns an error).

**LangGraph Mapping:**
- `message.contextId` maps to LangGraph `thread_id`.

**Notes:**
- Only `text` and `data` parts are supported; `file` parts are not.
- If `message.contextId` is omitted, a new context is created.
- Text parts require the assistant input schema to include a `messages` field.