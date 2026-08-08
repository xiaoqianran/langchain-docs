<!-- langchain-docs: Get a public shared trace run | https://docs.langchain.com/langsmith/smith-api/runs/get-a-public-shared-trace-run -->

# Get a public shared trace run

/langsmith/langsmith-platform-openapi.json get /api/v2/public/{share_token}/run/{run_id}
Returns one run within the trace identified by the share token. The request supplies only the run ID and that run's exact start_time coordinate.

Self-hosted deployments require LangSmith `v0.16` or later.