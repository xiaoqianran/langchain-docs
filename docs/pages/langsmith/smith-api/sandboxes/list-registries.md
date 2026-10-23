<!-- langchain-docs: List registries | https://docs.langchain.com/langsmith/smith-api/sandboxes/list-registries -->

# List registries

/langsmith/langsmith-platform-openapi.json get /api/v2/sandboxes/registries
List sandbox registries for pulling private images.
Page with page_size and cursor, replaying next_cursor until it is null. Results are ordered newest first, with stable ordering for equal creation times. Keep filters unchanged between pages.
Requests without page_size or cursor retain the legacy default of 50 results. Cursor requests default to 20 results, with a maximum of 100.