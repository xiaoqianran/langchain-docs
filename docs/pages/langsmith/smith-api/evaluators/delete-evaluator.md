<!-- langchain-docs: Delete evaluator | https://docs.langchain.com/langsmith/smith-api/evaluators/delete-evaluator -->

# Delete evaluator

/langsmith/langsmith-platform-openapi.json delete /api/v1/platform/evaluators/{evaluator_id}
Delete an evaluator. Returns 409 when a code evaluator build is ENQUEUED or BUILDING, or when run rules still reference the evaluator and delete_run_rules is false. When delete_run_rules is true, all run rules referencing this evaluator are deleted first (same tenant) if the build is not in flight. Associated llm_evaluators and code_evaluators rows are removed by foreign-key cascade when the evaluator row is deleted.