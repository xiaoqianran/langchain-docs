<!-- langchain-docs: List commits | https://docs.langchain.com/langsmith/smith-api/commits/list-commits -->

# List commits

/langsmith/langsmith-platform-openapi.json get /api/v1/commits/{owner}/{repo}
List commits for a repository, newest first, with pagination support.
Page with page_size and cursor: pass next_cursor from the previous response as cursor, until next_cursor is null.
The limit and offset parameters are still accepted but cannot be combined with page_size or cursor.
This endpoint supports both authenticated and unauthenticated access.
Authenticated users can access private repositories; unauthenticated users can only access public repositories.
The include_stats parameter controls whether download and view statistics are computed (defaults to true).