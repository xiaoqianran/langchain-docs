<!-- langchain-docs: Update dataset splits | https://docs.langchain.com/langsmith/smith-api/datasets/update-dataset-splits -->

# Update dataset splits

/langsmith/langsmith-platform-openapi.json put /api/v1/datasets/{dataset_id}/splits
Add examples to a split, or remove them from it.

Returns the IDs of the given examples found in the dataset. Each of them gets
a new version, even when its splits do not change. An example's other splits
are kept, and an example without a split counts as being in the base split.
Removing an example's last split leaves it in no split.