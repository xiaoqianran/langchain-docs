<!-- langchain-docs: List runs of one trace in a public shared thread | https://docs.langchain.com/langsmith/smith-api/threads/list-runs-of-one-trace-in-a-public-shared-thread -->

# List runs of one trace in a public shared thread

/langsmith/langsmith-platform-openapi.json get /api/v2/public/threads/{share_token}/traces/{trace_id}/runs
Returns every run in the given trace, provided that trace's root belongs to the shared thread.

Self-hosted deployments require LangSmith `v0.16` or later.