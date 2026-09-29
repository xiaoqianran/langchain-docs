<!-- langchain-docs: Share a run | https://docs.langchain.com/langsmith/smith-api/runs/share-a-run -->

# Share a run

/langsmith/langsmith-platform-openapi.json post /api/v2/runs/{run_id}/share
Creates or returns a share token for a run. Child runs share their trace root.

Self-hosted deployments require LangSmith `v0.16` or later.