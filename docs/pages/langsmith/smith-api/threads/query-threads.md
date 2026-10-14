<!-- langchain-docs: Query threads | https://docs.langchain.com/langsmith/smith-api/threads/query-threads -->

# Query threads

/langsmith/langsmith-platform-openapi.json post /api/v2/threads/query
Query threads within a project (session), with cursor-based pagination.
Returns threads matching the given time range and optional filters.

When `ai_search` is set, `Accept: text/event-stream` is required; requests without it return 406. AI search is unavailable on deployments that route queries to the v1 backend and returns 501 there.

Self-hosted deployments require LangSmith `v0.16` or later.