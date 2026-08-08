<!-- langchain-docs: Get a commit | https://docs.langchain.com/langsmith/smith-api/commits/get-a-commit -->

# Get a commit

/langsmith/langsmith-platform-openapi.json get /api/v1/commits/{owner}/{repo}/{commit}
Retrieves a specific commit by hash, tag, or "latest" for a repository.
This endpoint supports both authenticated and unauthenticated access.
Authenticated users can access private repos, while unauthenticated users can only access public repos.
Commit resolution logic:
- "latest" or empty: Get the most recent commit
- Less than 8 characters: Only check for tags
- 8 or more characters: Prioritize commit hash over tag, check both