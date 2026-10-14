<!-- langchain-docs: Create a new data plane | https://docs.langchain.com/langsmith/smith-api/data_planes/create-a-new-data-plane -->

# Create a new data plane

/langsmith/langsmith-platform-openapi.json post /orgs/current/data-planes
Creates a new data plane object. Persists the rendered data plane spec, and returns 202 with the data plane in status=requested. Requires BYOC enabled org and org admin.
The cloud of the control plane selects the AWS or the Azure request. For AWS, the control plane uses the organization's assigned external ID to assume the AWS role. Configure that ID in the role's trust policy before creating a data plane. For Azure, the control plane uses the Entra tenant and the resource group in the request.