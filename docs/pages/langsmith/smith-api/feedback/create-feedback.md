<!-- langchain-docs: Create feedback | https://docs.langchain.com/langsmith/smith-api/feedback/create-feedback -->

# Create feedback

/langsmith/langsmith-platform-openapi.json post /api/v1/feedback
Create a new feedback.

`session_id` identifies the tracing project the feedback belongs to. It is
required unless the feedback is addressed by `address`, which names that
project through an Agent environment that already exists.