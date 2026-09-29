<!-- langchain-docs: Fetch shared experiment runs for dataset examples | https://docs.langchain.com/langsmith/smith-api/datasets/fetch-shared-experiment-runs-for-dataset-examples -->

# Fetch shared experiment runs for dataset examples

/langsmith/langsmith-platform-openapi.json post /api/v2/datasets/public/{share_token}/experiment-runs
Public share-token variant of POST /v2/datasets/{dataset_id}/experiment-runs.
Returns a paginated page of dataset examples with runs from the requested experiments.

Self-hosted deployments require LangSmith `v0.16` or later.