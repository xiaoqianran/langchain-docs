<!-- langchain-docs: Delete workspace | https://docs.langchain.com/langsmith/smith-api/workspaces/delete-workspace -->

# Delete workspace

/langsmith/langsmith-platform-openapi.json delete /api/v1/workspaces/{workspace_id}
Delete a workspace and its data.

Only the workspace the request is scoped to (the X-Tenant-Id header, or the API key's workspace)
can be deleted; any other ID returns 403. Requires the workspace delete permission.