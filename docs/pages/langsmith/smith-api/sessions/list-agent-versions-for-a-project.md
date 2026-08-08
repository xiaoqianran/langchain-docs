<!-- langchain-docs: List agent versions for a project | https://docs.langchain.com/langsmith/smith-api/sessions/list-agent-versions-for-a-project -->

# List agent versions for a project

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/sessions/{sessionID}/agent-versions
Returns all agent versions (commit SHAs) seen in the given tracing project, ordered by first_seen_at descending.