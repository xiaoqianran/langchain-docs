<!-- langchain-docs: Create decision model rule | https://docs.langchain.com/langsmith/smith-api/run/create-decision-model-rule -->

# Create decision model rule

/langsmith/langsmith-platform-openapi.json post /api/v1/runs/rules/decision-models
Create a decision-model evaluator (Jev, SemIf or OpenAI Decisions) from
its prompt and questions, and attach it to a project or dataset. Each
question's key becomes a feedback key.