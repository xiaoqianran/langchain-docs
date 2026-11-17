<!-- langchain-docs: Update a project | https://docs.langchain.com/langsmith/smith-api/sessions/update-a-project -->

# Update a project

/langsmith/langsmith-platform-openapi.json patch /api/v2/sessions/{session_id}
Updates supplied fields and returns the refreshed resource without optional run statistics. Omitted fields remain unchanged. Null clears description, default_dataset_id, end_time, or extra. Extra merges top-level keys; null values remove keys.