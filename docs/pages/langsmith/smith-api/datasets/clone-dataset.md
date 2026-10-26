<!-- langchain-docs: Clone dataset | https://docs.langchain.com/langsmith/smith-api/datasets/clone-dataset -->

# Clone dataset

/langsmith/langsmith-platform-openapi.json post /api/v1/datasets/clone
Copy examples from a source dataset into an existing target dataset.

Each copied example gets a new ID and keeps the inputs, outputs, metadata,
and source run ID of its source example. Attachments are copied when blob
storage is enabled. Copying the same examples twice adds them twice.
Requires the datasets:clone permission on both datasets. Returns the ID,
dataset ID, creation and modification times, and source run ID of each new
example. Without example IDs, a source or target that is not found can
return an empty list instead of an error.