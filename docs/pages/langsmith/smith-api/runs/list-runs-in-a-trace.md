<!-- langchain-docs: List runs in a trace | https://docs.langchain.com/langsmith/smith-api/runs/list-runs-in-a-trace -->

# List runs in a trace

/langsmith/langsmith-platform-openapi.json get /api/v2/traces/{trace_id}/runs
Returns runs for a trace ID within min/max start time. Optional `filter`; repeatable `selects` to select fields to return.

Self-hosted deployments require LangSmith `v0.16` or later.