<!-- langchain-docs: Get server info | https://docs.langchain.com/langsmith/smith-api/info/get-server-info -->

# Get server info

/langsmith/langsmith-platform-openapi.json get /api/v1/info
Returns information about the current LangSmith deployment: version,
instance feature flags, batch-ingest limits, and max SDK versions.
Unauthenticated by default; set FF_INFO_ENDPOINT_AUTH_REQUIRED=true to require auth.