<!-- langchain-docs: Roll an issues agent webhook signing secret | https://docs.langchain.com/langsmith/smith-api/issues-agent/roll-an-issues-agent-webhook-signing-secret -->

# Roll an issues agent webhook signing secret

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/sessions/{session_id}/issues-agent/webhooks/{id}/roll-secret
Replaces the signing secret for the given issues agent webhook and returns the
updated webhook. Future deliveries are signed with the new secret immediately.