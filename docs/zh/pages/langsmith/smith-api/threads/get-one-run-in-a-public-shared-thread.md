<!-- langchain-docs: translation failed; English fallback -->

<!-- langchain-docs: Get one run in a public shared thread | https://docs.langchain.com/langsmith/smith-api/threads/get-one-run-in-a-public-shared-thread -->

# Get one run in a public shared thread

/langsmith/langsmith-platform-openapi.json get /api/v2/public/threads/{share_token}/runs/{run_id}
Returns a single run, including full inputs and outputs, provided its trace root belongs to the shared thread.

Self-hosted deployments require LangSmith `v0.16` or later.