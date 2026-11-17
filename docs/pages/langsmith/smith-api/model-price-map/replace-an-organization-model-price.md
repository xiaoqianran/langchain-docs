<!-- langchain-docs: Replace an organization model price | https://docs.langchain.com/langsmith/smith-api/model-price-map/replace-an-organization-model-price -->

# Replace an organization model price

/langsmith/langsmith-platform-openapi.json put /api/v1/orgs/current/model-price-map/{id}
Replace every field of a model price this organization has set.

The request body is the full entry, not a partial update: omitted
optional fields are reset to their defaults. Costs already recorded on
existing runs are not recomputed.