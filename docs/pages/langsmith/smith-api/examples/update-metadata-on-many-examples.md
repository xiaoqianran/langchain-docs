<!-- langchain-docs: Update metadata on many examples | https://docs.langchain.com/langsmith/smith-api/examples/update-metadata-on-many-examples -->

# Update metadata on many examples

/langsmith/langsmith-platform-openapi.json patch /api/v1/platform/datasets/{dataset_id}/examples/metadata
Applies the same metadata changes, in order, to every listed example in
a dataset. Examples that are not in the dataset or were deleted are
skipped; the rest are updated together, so if the update fails none of
them change. Answers 207 with one status per submitted example ID:
UPDATED, or NOT_FOUND for a skipped example. Metadata keys the
operations do not name keep their values. To add examples to a split or
remove them from one, use ARRAY_ADD or ARRAY_REMOVE on the dataset_split
key. Requires permission to update datasets.