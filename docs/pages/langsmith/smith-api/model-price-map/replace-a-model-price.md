<!-- langchain-docs: Replace a model price | https://docs.langchain.com/langsmith/smith-api/model-price-map/replace-a-model-price -->

# Replace a model price

/langsmith/langsmith-platform-openapi.json put /api/v1/model-price-map/{id}
Replace every field of a custom model price in this workspace.

The request body is the full entry, not a partial update: omitted
optional fields are reset to their defaults. Only the workspace's own
entries can be updated; LangSmith default entries cannot. Costs already
recorded on existing runs are not recomputed.

Returns 404 if the workspace has no entry with this ID, including
LangSmith default entries. Returns 409 if the change would duplicate
another entry's match conditions.