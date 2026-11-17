<!-- langchain-docs: Translate an ai search into query filters | https://docs.langchain.com/langsmith/smith-api/runs/translate-an-ai-search-into-query-filters -->

# Translate an ai search into query filters

/langsmith/langsmith-platform-openapi.json post /api/v2/ai-search/parse
Translates a natural-language search into the scope, filters, semantic criterion and time bounds for the runs, traces or threads query API, without running the search. No resources are created. Send the returned fields to the query API named by scope, with the same projects.
When scope is omitted, it is inferred from the search and defaults to traces. A time period in the search sets min_start_time or max_start_time; bounds the search does not mention are omitted so you can keep your own time range.
Requires AI search to be enabled for the organization and read access to every project. Returns a single JSON response.