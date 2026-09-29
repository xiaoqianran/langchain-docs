<!-- langchain-docs: Roll an issues agent webhook signing secret | https://docs.langchain.com/langsmith/smith-api/issues-agent/roll-an-issues-agent-webhook-signing-secret -->

# Roll an issues agent webhook signing secret

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/sessions/{session_id}/issues-agent/webhooks/{id}/roll-secret
Replaces the signing secret for the given generic URL issues agent webhook. Slack
and Jira destinations do not have signing secrets. The new secret is returned once in this
response; future deliveries use it immediately. URL and header values are redacted;
only a safe URL display and header names are returned.