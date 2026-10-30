<!-- langchain-docs: Delete a model price | https://docs.langchain.com/langsmith/smith-api/model-price-map/delete-a-model-price -->

# Delete a model price

/langsmith/langsmith-platform-openapi.json delete /api/v1/model-price-map/{id}
Delete a custom model price from this workspace.

Only the workspace's own entries can be deleted; LangSmith default entries
cannot. Deleting an ID that does not belong to the workspace succeeds
without changing anything. Existing run costs are not recomputed.