<!-- langchain-docs: Patch workspace | https://docs.langchain.com/langsmith/smith-api/workspaces/patch-workspace -->

# Patch workspace

/langsmith/langsmith-platform-openapi.json patch /api/v1/workspaces/{workspace_id}
Rename a workspace in the current organization.

Requires the workspace settings manage permission. A name that is already taken returns 409.