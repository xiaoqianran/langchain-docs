<!-- langchain-docs: Query single thread stats | https://docs.langchain.com/langsmith/smith-api/threads/query-single-thread-stats -->

# Query single thread stats

/langsmith/langsmith-platform-openapi.json get /api/v2/threads/{thread_id}/stats
Compute aggregate stats for a single thread (turn count, latency percentiles, token/cost sums, and detail breakdowns) within a project.

Self-hosted deployments require LangSmith `v0.16` or later.