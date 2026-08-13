<!-- langchain-docs: Get a snapshot | https://docs.langchain.com/langsmith/smith-api/sandboxes/get-a-snapshot -->

# Get a snapshot

/langsmith/langsmith-platform-openapi.json get /api/v2/sandboxes/snapshots/{snapshot_id}
Get a sandbox snapshot by ID or by a Docker-style reference. A bare name means name:latest, falling back to the newest ready untagged snapshot of that name. To list the tags under a name, use /api/v2/sandboxes/snapshots-by-name/{name}.