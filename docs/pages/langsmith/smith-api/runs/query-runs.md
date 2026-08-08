<!-- langchain-docs: Query runs | https://docs.langchain.com/langsmith/smith-api/runs/query-runs -->

# Query runs

/langsmith/langsmith-platform-openapi.json post /api/v2/runs/query
Returns a paginated list of runs for the given projects within min/max start_time. Supports filters, cursor pagination, and `selects` to select fields to return.

Self-hosted deployments require LangSmith `v0.16` or later.