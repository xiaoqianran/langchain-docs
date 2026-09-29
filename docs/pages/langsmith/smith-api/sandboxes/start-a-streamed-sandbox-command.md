<!-- langchain-docs: Start a streamed sandbox command | https://docs.langchain.com/langsmith/smith-api/sandboxes/start-a-streamed-sandbox-command -->

# Start a streamed sandbox command

/langsmith/langsmith-platform-openapi.json post /api/v2/sandboxes/{sandbox_id}/execute/stream/start
Execute a command inside a sandbox and stream stdout/stderr as Server-Sent Events with base64 payloads. Requires a sandbox on the v2 runtime. Passing a command_id reuses a running command instead of starting a second one. The response ends with an ack_required event when the sandbox's output buffer needs an ack; continue from the reported offsets with the resume endpoint.