<!-- langchain-docs: Create Deployment Revision | https://docs.langchain.com/api-reference/deployments-v2/create-deployment-revision -->

# Create Deployment Revision

https://api.host.langchain.com/openapi.json post /v2/deployments/{deployment_id}/revisions
Create a new revision for a deployment.

The dedicated create-revision entry point: unlike PATCH, this always
creates a revision and returns the created ``Revision`` directly.