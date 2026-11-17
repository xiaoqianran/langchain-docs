<!-- langchain-docs: Get a model price | https://docs.langchain.com/langsmith/smith-api/model-price-map/get-a-model-price -->

# Get a model price

/langsmith/langsmith-platform-openapi.json get /api/v1/model-price-map/{id}
Get one model price this workspace uses to compute run costs.

Any entry the list returns can be read here: the workspace's custom
entries, its organization's entries, and the LangSmith default entries.
Returns 404 for an ID the workspace does not price against, including
other workspaces' entries.