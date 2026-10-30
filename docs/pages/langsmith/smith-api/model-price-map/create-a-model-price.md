<!-- langchain-docs: Create a model price | https://docs.langchain.com/langsmith/smith-api/model-price-map/create-a-model-price -->

# Create a model price

/langsmith/langsmith-platform-openapi.json post /api/v1/model-price-map
Create a custom model price for this workspace.

The entry prices LLM runs whose model name matches `match_pattern`. It
applies to runs ingested after it takes effect, which can take a few
minutes; costs already recorded on existing runs are not recomputed.
Costs are in US dollars per token.

Returns 409 if the workspace already has an entry with the same name,
match pattern, match path, provider, start time, and prompt token
threshold.