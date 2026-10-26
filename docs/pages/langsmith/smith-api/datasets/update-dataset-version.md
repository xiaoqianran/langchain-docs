<!-- langchain-docs: Update dataset version | https://docs.langchain.com/langsmith/smith-api/datasets/update-dataset-version -->

# Update dataset version

/langsmith/langsmith-platform-openapi.json put /api/v1/datasets/{dataset_id}/tags
Tag a dataset version.

Points the tag at the version given by as_of, creating the tag or moving it
if the dataset already has it. Other tags are unchanged. Requires permission
to update datasets. Returns the version's time and all of its tags. Returns
400 if the tag is latest, and 404 if the dataset or the as_of tag does not
exist.