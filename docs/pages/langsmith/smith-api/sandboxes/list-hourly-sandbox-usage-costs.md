<!-- langchain-docs: List hourly sandbox usage costs | https://docs.langchain.com/langsmith/smith-api/sandboxes/list-hourly-sandbox-usage-costs -->

# List hourly sandbox usage costs

/langsmith/langsmith-platform-openapi.json get /api/v2/sandboxes/usage/costs
Returns priced usage per sandbox or snapshot and UTC hour in the half-open requested interval. LCU uses the recorded compute amount for sandboxes; snapshots have zero LCU. LSU allocates the recorded workspace storage amount proportionally to attributed bytes, including checkpoints on their sandbox and snapshots as separate resources. Resource filters preserve each resource's share. Rate changes do not reprice recorded amounts. An access-filtered page can have no items and a non-null next_cursor; continue until next_cursor is null.