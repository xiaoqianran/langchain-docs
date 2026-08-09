<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create Deployment Revision | https://docs.langchain.com/api-reference/deployments-v2/create-deployment-revision -->

# 创建部署修订

https://api.host.langchain.com/openapi.json 发布 /v2/deployments/{deployment_id}/revisions
为部署创建新修订版。

专用的创建修订入口点：与 PATCH 不同，这总是
创建修订版并直接返回创建的``Revision``。