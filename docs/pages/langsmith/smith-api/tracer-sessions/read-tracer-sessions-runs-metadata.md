<!-- langchain-docs: Read tracer sessions runs metadata | https://docs.langchain.com/langsmith/smith-api/tracer-sessions/read-tracer-sessions-runs-metadata -->

# Read tracer sessions runs metadata

/langsmith/langsmith-platform-openapi.json get /api/v1/sessions/{session_id}/metadata
Given a session, a number K, and (optionally) a list of metadata keys, return the top K values for each key.