<!-- langchain-docs: Update a sandbox | https://docs.langchain.com/langsmith/smith-api/sandboxes/update-a-sandbox -->

# Update a sandbox

/langsmith/langsmith-platform-openapi.json patch /api/v2/sandboxes/boxes/{name}
Update a sandbox's display name, retention, resources, tags, or proxy configuration. The name must be unique within the tenant. Proxy configuration sent to a sandbox that is not running is stored and applied when it next starts.