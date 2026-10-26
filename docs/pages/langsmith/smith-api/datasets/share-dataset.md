<!-- langchain-docs: Share dataset | https://docs.langchain.com/langsmith/smith-api/datasets/share-dataset -->

# Share dataset

/langsmith/langsmith-platform-openapi.json put /api/v1/datasets/{dataset_id}/share
Share a dataset publicly and return its share token.

Anyone with the share token can view the dataset, its examples, and its
experiments, including their runs and feedback, without signing in. When the
dataset is already shared, returns its existing share token. Fails with 403
when the organization disables public sharing.