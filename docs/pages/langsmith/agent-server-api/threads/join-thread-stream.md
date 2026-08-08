<!-- langchain-docs: Join Thread Stream | https://docs.langchain.com/langsmith/agent-server-api/threads/join-thread-stream -->

# Join Thread Stream

/langsmith/agent-server-openapi.json get /threads/{thread_id}/stream
This endpoint streams output in real-time from a thread. The stream will include the output of each run executed sequentially on the thread and will remain open indefinitely. It is the responsibility of the calling client to close the connection.