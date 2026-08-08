<!-- langchain-docs: Get tag transition history | https://docs.langchain.com/langsmith/smith-api/tag-transitions/get-tag-transition-history -->

# Get tag transition history

/langsmith/langsmith-platform-openapi.json get /repos/{owner}/{repo}/tags/{tag_name}/history
Returns the paginated audit log of transitions for a specific
tag in a repository. Each entry records a commit change
(from_commit → to_commit) along with who performed it.