<!-- langchain-docs: Query thread stats | https://docs.langchain.com/langsmith/smith-api/threads/query-thread-stats -->

# Query thread stats

/langsmith/langsmith-platform-openapi.json post /api/v2/threads/stats
GET with body payload — no resources created. Returns aggregate statistics for threads in a tracing project.
The response includes the thread counts, run counts, latency percentiles, rates, token totals, and cost totals requested in `select`.

Self-hosted deployments require LangSmith `v0.17` or later.