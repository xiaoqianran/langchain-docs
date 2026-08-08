<!-- langchain-docs: Stop a sandbox | https://docs.langchain.com/langsmith/smith-api/sandboxes/stop-a-sandbox -->

# Stop a sandbox

/langsmith/langsmith-platform-openapi.json post /api/v2/sandboxes/boxes/{name}/stop
Stop a ready sandbox. This endpoint is not idempotent; the filesystem is preserved for later restart.