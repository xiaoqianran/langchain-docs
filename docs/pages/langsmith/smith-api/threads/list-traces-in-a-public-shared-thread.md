<!-- langchain-docs: List traces in a public shared thread | https://docs.langchain.com/langsmith/smith-api/threads/list-traces-in-a-public-shared-thread -->

# List traces in a public shared thread

/langsmith/langsmith-platform-openapi.json get /api/v2/public/threads/{share_token}/traces
Returns a page of root traces belonging to the thread identified by the share token. The share token supplies the tenant, project, and thread scope.

Self-hosted deployments require LangSmith `v0.16` or later.