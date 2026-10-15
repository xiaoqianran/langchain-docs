<!-- langchain-docs: Delete a data plane | https://docs.langchain.com/langsmith/smith-api/data_planes/delete-a-data-plane -->

# Delete a data plane

/langsmith/langsmith-platform-openapi.json delete /orgs/current/data-planes/{id}
Verifies that the stored customer AWS role has delete permissions, that the stored Azure subscription is reachable, or that the stored GCP provisioner service account can be impersonated. Then removes linked workspaces and starts asynchronous deprovisioning for an active or provisioning_failed data plane owned by the caller's organization. Azure and GCP data planes can also be deleted while provisioning. Requires BYOC to be enabled for the org and organization:infrastructure:manage.