<!-- langchain-docs: List model prices | https://docs.langchain.com/langsmith/smith-api/model-price-map/list-model-prices -->

# List model prices

/langsmith/langsmith-platform-openapi.json get /api/v1/model-price-map
List the model prices LangSmith uses to compute run costs in this workspace.

Returns both the workspace's custom entries (`tenant_id` set) and the
LangSmith default entries (`tenant_id` null). Default entries can be read
but not updated or deleted; to price a model differently, for example
because of a negotiated rate with an inference provider, create a custom
entry with the same match pattern.

The total number of matching entries is returned in the
`X-Pagination-Total` response header.