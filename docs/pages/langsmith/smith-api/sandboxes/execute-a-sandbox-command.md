<!-- langchain-docs: Execute a sandbox command | https://docs.langchain.com/langsmith/smith-api/sandboxes/execute-a-sandbox-command -->

# Execute a sandbox command

/langsmith/langsmith-platform-openapi.json post /api/v2/sandboxes/{sandbox_id}/execute
Execute a command inside a sandbox and return stdout, stderr, and exit code. Use the streaming execute endpoints for long-running commands that may exceed the synchronous request deadline.