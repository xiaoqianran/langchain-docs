<!-- langchain-docs: List viewed issues for a session (Beta) | https://docs.langchain.com/langsmith/smith-api/issues/list-viewed-issues-for-a-session-beta -->

# List viewed issues for a session (Beta)

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/sessions/{session_id}/issues/views
**Beta:** Returns the issues in this session that the current
user has opened, with timestamps. Used by the UI to derive
the per-row "unread" indicator and the Engine tab badge.