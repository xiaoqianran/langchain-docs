<!-- langchain-docs: Search or list items within a namespace prefix. | https://docs.langchain.com/langsmith/agent-server-api/store/search-or-list-items-within-a-namespace-prefix -->

# Search or list items within a namespace prefix.

/langsmith/agent-server-openapi.json post /store/items/search
Lists items ordered by last updated time. If a `query` is provided, performs a natural language search instead. Supports pagination via `limit` and `offset`, and filtering via `filter`.