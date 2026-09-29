<!-- langchain-docs: Query public shared trace runs | https://docs.langchain.com/langsmith/smith-api/runs/query-public-shared-trace-runs -->

# Query public shared trace runs

/langsmith/langsmith-platform-openapi.json post /api/v2/public/{share_token}/runs/query
Returns all runs within the trace identified by the share token. The share token supplies the tenant, project, and trace scope.

Self-hosted deployments require LangSmith `v0.16` or later.