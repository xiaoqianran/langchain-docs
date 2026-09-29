<!-- langchain-docs: Hard delete examples | https://docs.langchain.com/langsmith/smith-api/examples/hard-delete-examples -->

# Hard delete examples

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/datasets/examples/delete
This endpoint hard deletes *all* versions of a dataset example(s).
Deletion is performed by setting inputs, outputs, and metadata to null and deleting attachment files while keeping the example ID, dataset ID, and creation timestamp.
IMPORTANT: attachment files can take up to 7 days to be deleted. inputs, outputs and metadata are nullified immediately.