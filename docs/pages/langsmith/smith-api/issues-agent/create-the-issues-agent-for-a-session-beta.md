<!-- langchain-docs: Create the issues agent for a session (Beta) | https://docs.langchain.com/langsmith/smith-api/issues-agent/create-the-issues-agent-for-a-session-beta -->

# Create the issues agent for a session (Beta)

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/sessions/{session_id}/issues-agent
**Beta:** This endpoint is in active development and may change without notice.

Configures the issues agent for the given tracer session and enqueues
the initial scan. Fails if an agent already exists for the session.