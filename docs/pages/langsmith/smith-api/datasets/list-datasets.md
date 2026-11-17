<!-- langchain-docs: List datasets | https://docs.langchain.com/langsmith/smith-api/datasets/list-datasets -->

# List datasets

/langsmith/langsmith-platform-openapi.json get /api/v2/datasets
Returns one page of the datasets in the workspace, filtered and sorted by the query parameters.
Pass the next_cursor of a response as cursor, with the same filters and sort, to get the next page. next_cursor is null on the last page.