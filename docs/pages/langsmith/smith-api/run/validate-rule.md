<!-- langchain-docs: Validate rule | https://docs.langchain.com/langsmith/smith-api/run/validate-rule -->

# Validate rule

/langsmith/langsmith-platform-openapi.json post /api/v1/runs/rules/validate
Validate a rule by executing it with test data without creating a saved rule.

This endpoint allows testing LLM-as-judge evaluators before saving them. It accepts
a rule configuration (same as rule creation) and test data, executes the evaluator,
and returns the evaluation results in the same format as batch_invoke_evaluator.

Only LLM-as-judge rules (evaluators) are supported. Code evaluators are not allowed.

The evaluator execution traces are written to the database (in the "evaluators"
project), which allows users to see the evaluator execution history.