<!-- langchain-docs: Query runs | https://docs.langchain.com/langsmith/smith-api/runs/query-runs -->

# Query runs

/langsmith/langsmith-platform-openapi.json post /api/v2/runs/query
Returns a paginated list of runs for the given projects within min/max start_time. Supports filters, cursor pagination, and `selects` to select fields to return.

When `ai_search` is set, `Accept: text/event-stream` is required; requests without it return 406. AI search is unavailable on deployments that route queries to the v1 backend and returns 501 there.

Self-hosted deployments require LangSmith `v0.16` or later.