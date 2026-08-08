<!-- langchain-docs: Delete evaluator | https://docs.langchain.com/langsmith/smith-api/evaluators/delete-evaluator -->

# Delete evaluator

/langsmith/langsmith-platform-openapi.json delete /api/v1/platform/evaluators/{evaluator_id}
Delete an evaluator. When delete_run_rules is true, all run rules referencing this evaluator are deleted first (same tenant). Associated llm_evaluators and code_evaluators rows are removed by foreign-key cascade when the evaluator row is deleted.