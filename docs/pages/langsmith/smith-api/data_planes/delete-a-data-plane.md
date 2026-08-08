<!-- langchain-docs: Delete a data plane | https://docs.langchain.com/langsmith/smith-api/data_planes/delete-a-data-plane -->

# Delete a data plane

/langsmith/langsmith-platform-openapi.json delete /orgs/current/data-planes/{id}
Verifies that the stored customer AWS role has delete permissions, removes linked workspaces, and starts asynchronous deprovisioning for a data plane owned by the caller's organization. Requires BYOC to be enabled for the org and org admin permissions.