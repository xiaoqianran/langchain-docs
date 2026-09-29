<!-- langchain-docs: Fetch experiment runs for dataset examples | https://docs.langchain.com/langsmith/smith-api/datasets/fetch-experiment-runs-for-dataset-examples -->

# Fetch experiment runs for dataset examples

/langsmith/langsmith-platform-openapi.json post /api/v2/datasets/{dataset_id}/experiment-runs
Returns a paginated page of dataset examples with runs from the requested experiments.
Response uses the canonical `{items, next_cursor}` envelope.

Self-hosted deployments require LangSmith `v0.16` or later.