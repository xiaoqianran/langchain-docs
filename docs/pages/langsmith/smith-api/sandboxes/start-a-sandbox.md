<!-- langchain-docs: Start a sandbox | https://docs.langchain.com/langsmith/smith-api/sandboxes/start-a-sandbox -->

# Start a sandbox

/langsmith/langsmith-platform-openapi.json post /api/v2/sandboxes/boxes/{name}/start
Start a stopped or failed sandbox. This endpoint is not idempotent. The optional volumes field is beta and requires sandbox volumes to be enabled for your workspace. Omit it to keep attachments, or send an empty array to detach all volumes. Changing attachments requires a stopped or failed sandbox, runtime access to it (its creator or sandboxes:exec), and, for each newly attached volume, being its creator or holding sandboxes:exec. A start whose volumes differ from those the sandbox's saved memory was captured with fails with 409 unless discard_memory is set, which cold-boots the sandbox without that memory.