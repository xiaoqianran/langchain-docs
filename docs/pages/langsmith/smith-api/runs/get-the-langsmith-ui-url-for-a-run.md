<!-- langchain-docs: Get the LangSmith UI URL for a run | https://docs.langchain.com/langsmith/smith-api/runs/get-the-langsmith-ui-url-for-a-run -->

# Get the LangSmith UI URL for a run

/langsmith/langsmith-platform-openapi.json get /api/v2/runs/{run_id}/url
Returns the URL to view a specific run in the LangSmith UI. The caller must supply the
run's project_id and trace_id as query parameters; start_time is optional.

Self-hosted deployments require LangSmith `v0.16` or later.