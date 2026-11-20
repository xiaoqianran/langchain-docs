<!-- langchain-docs: Query users in a tracing project | https://docs.langchain.com/langsmith/smith-api/runsanalytics/query-users-in-a-tracing-project -->

# Query users in a tracing project

/langsmith/langsmith-platform-openapi.json post /api/v2/runs/users/query
GET with body payload — no resources created. Returns users ordered by their most recent matching finished root run, with cursor pagination. Costs and token usage aggregate the window's runs that carry the user's metadata.user_id. The activity window defaults to seven days and must not exceed 31 days. Continuation keeps a fixed activity window but does not provide a snapshot; concurrent activity changes can cause skipped or repeated users.
Users whose statistics are not yet available have stats_status=pending and null trace_count and error_count. Query again to retrieve statistics; stats_status=ready means statistics were returned, but they may still lag recent activity. Other unavailable metrics are omitted. Backend query failures still return an error.