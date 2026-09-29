<!-- langchain-docs: Delete runs | https://docs.langchain.com/langsmith/smith-api/run/delete-runs -->

# Delete runs

/langsmith/langsmith-platform-openapi.json post /api/v1/runs/delete
DELETE with body payload — removes the runs identified by the request payload.

Delete runs by trace ID, or every run in a time range.

Supply `session_id` and `trace_ids` to delete a known list of traces, or
`metadata` with `start_time` to delete matching traces from that time
onward. Add `end_time` to bound the range; with both bounds set `metadata`
is optional, and omitting it deletes every trace that started in the range.