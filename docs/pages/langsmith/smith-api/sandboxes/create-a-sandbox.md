<!-- langchain-docs: Create a sandbox | https://docs.langchain.com/langsmith/smith-api/sandboxes/create-a-sandbox -->

# Create a sandbox

/langsmith/langsmith-platform-openapi.json post /api/v2/sandboxes/boxes
Create a new sandbox from a snapshot. Provide at most one of `snapshot_id` or `snapshot_name`; if neither is provided, the server uses the default snapshot.