<!-- langchain-docs: List tracing projects | https://docs.langchain.com/langsmith/smith-api/sessions/list-tracing-projects -->

# List tracing projects

/langsmith/langsmith-platform-openapi.json get /api/v2/sessions
Returns a page of the workspace's tracing projects and experiments. Pass the response's next_cursor as cursor to fetch the next page; next_cursor is null on the last page. A cursor is valid only with the same query parameters as the request that returned it.