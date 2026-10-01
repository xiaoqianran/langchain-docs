<!-- langchain-docs: Delete tracer session | https://docs.langchain.com/langsmith/smith-api/tracer-sessions/delete-tracer-session -->

# Delete tracer session

/langsmith/langsmith-platform-openapi.json delete /api/v1/sessions/{session_id}
Delete a specific project.

Returns 202 when deletion is accepted. Cleanup runs asynchronously.
Location identifies the affected project, not a cleanup-status endpoint.
For a caller with read access, GET at that URL returns 200 with the project
while it is still available, or 404 after the project is removed. A 404 does
not confirm that background trace cleanup has finished. Polling for cleanup
completion is not supported.