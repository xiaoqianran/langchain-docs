<!-- langchain-docs: List rule logs (v2) | https://docs.langchain.com/langsmith/smith-api/run/list-rule-logs-v2 -->

# List rule logs (v2)

/langsmith/langsmith-platform-openapi.json get /api/v1/runs/rules/{rule_id}/logs/v2
List logs for a particular rule with cursor-based pagination.

This endpoint handles S3-stored outcomes correctly by using run_outcomes_count
to predict batch sizes and avoid over-fetching.