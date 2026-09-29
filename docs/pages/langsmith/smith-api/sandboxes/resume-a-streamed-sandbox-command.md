<!-- langchain-docs: Resume a streamed sandbox command | https://docs.langchain.com/langsmith/smith-api/sandboxes/resume-a-streamed-sandbox-command -->

# Resume a streamed sandbox command

/langsmith/langsmith-platform-openapi.json post /api/v2/sandboxes/{sandbox_id}/execute/stream/resume
Continue streaming a command started by the stream start endpoint. The offsets are also the ack for everything below them, which frees the sandbox's output buffer and unpauses a command waiting for room. Attaches only: a command the sandbox no longer has returns 404 rather than running again.