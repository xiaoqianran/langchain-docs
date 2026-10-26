<!-- langchain-docs: Update dataset | https://docs.langchain.com/langsmith/smith-api/datasets/update-dataset -->

# Update dataset

/langsmith/langsmith-platform-openapi.json patch /api/v1/datasets/{dataset_id}
Update a dataset.

Only the fields in the request change; omitted fields keep their value.
Setting a schema or transformations checks every existing example against
the result. Returns 400, leaving the dataset unchanged, if an example does
not match, the dataset is not a key-value dataset, or a transformation
points into inputs or outputs that have no schema. The
X-Updated-Examples-Count response header holds the number of examples
changed through patch_examples. Returns 404 if the dataset does not exist
and 409 if the new name is already used.