<!-- langchain-docs: Join Run Stream | https://docs.langchain.com/langsmith/agent-server-api/thread-runs/join-run-stream -->

# Join Run Stream

/langsmith/agent-server-openapi.json get /threads/{thread_id}/runs/{run_id}/stream
Join a run stream. This endpoint streams output in real-time from a run similar to the /threads/__THREAD_ID__/runs/stream endpoint. If the run has been created with `stream_resumable=true`, the stream can be resumed from the last seen event ID.