<!-- langchain-docs: Get evaluator spend | https://docs.langchain.com/langsmith/smith-api/evaluators/get-evaluator-spend -->

# Get evaluator spend

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/evaluators/spend
Returns per-day LLM evaluator spend for the requested 7-day period, grouped by evaluator, resource, or run rule. Exactly one of group_by, evaluator_id, session_id, or dataset_id is required. resource_id, type, feedback_key, and tag_value_id may be supplied with group_by to narrow listing aggregations.