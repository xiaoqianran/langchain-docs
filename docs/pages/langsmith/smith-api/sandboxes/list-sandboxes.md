<!-- langchain-docs: List sandboxes | https://docs.langchain.com/langsmith/smith-api/sandboxes/list-sandboxes -->

# List sandboxes

/langsmith/langsmith-platform-openapi.json get /api/v2/sandboxes/boxes
List sandboxes for the authenticated tenant, with optional filtering, sorting, and pagination.
Page with page_size and cursor: replay the response's next_cursor until it comes back null, which is the only signal that no pages remain.
Cursors are opaque and only valid on this endpoint; do not parse or construct one.