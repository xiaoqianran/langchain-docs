<!-- langchain-docs: Get a single run | https://docs.langchain.com/langsmith/smith-api/runs/get-a-single-run -->

# Get a single run

/langsmith/langsmith-platform-openapi.json get /api/v2/runs/{run_id}
Returns one run by ID for the given session. Use the `selects` query parameter (repeatable) to select fields to return.

Self-hosted deployments require LangSmith `v0.16` or later.