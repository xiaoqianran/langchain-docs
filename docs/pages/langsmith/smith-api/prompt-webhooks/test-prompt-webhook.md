<!-- langchain-docs: Test prompt webhook | https://docs.langchain.com/langsmith/smith-api/prompt-webhooks/test-prompt-webhook -->

# Test prompt webhook

/langsmith/langsmith-platform-openapi.json post /api/v1/prompt-webhooks/test
Test a specific prompt webhook.

Sends the sample payload to the webhook configuration in the request body
without saving it, but only if the webhook's triggers include the payload's
event and its prompt filters match the payload's prompt. Otherwise nothing
is sent. Fails if the destination does not accept the payload.