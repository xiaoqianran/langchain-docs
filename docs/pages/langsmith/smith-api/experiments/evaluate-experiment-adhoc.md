<!-- langchain-docs: Evaluate experiment adhoc | https://docs.langchain.com/langsmith/smith-api/experiments/evaluate-experiment-adhoc -->

# Evaluate experiment adhoc

/langsmith/langsmith-platform-openapi.json post /api/v1/runs/experiments/{experiment_id}/evaluate
Evaluate an existing experiment with a specific evaluator.

This triggers immediate evaluation using the run_over_dataset approach,
processing runs in batches to handle large experiments efficiently.