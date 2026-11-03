<!-- langchain-docs: List repos | https://docs.langchain.com/langsmith/smith-api/repos/list-repos -->

# List repos

/langsmith/langsmith-platform-openapi.json get /api/v1/repos
Get all repos.

Page with page_size and cursor: pass next_cursor from the previous response
as cursor until next_cursor is null. The limit and offset parameters are
still accepted but cannot be combined with cursor.