<!-- langchain-docs: Create prompt webhook | https://docs.langchain.com/langsmith/smith-api/prompt-webhooks/create-prompt-webhook -->

# Create prompt webhook

/langsmith/langsmith-platform-openapi.json post /api/v1/prompt-webhooks
Create a new prompt webhook.

LangSmith sends a POST request to the webhook URL for each event listed in
triggers on the prompts it matches. A workspace can have one prompt webhook
unless its limit was raised; creating one past the limit returns 400.