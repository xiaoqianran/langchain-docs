<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete a data plane | https://docs.langchain.com/langsmith/smith-api/data_planes/delete-a-data-plane -->

# 删除数据平面

/langsmith/langsmith-platform-openapi.json 删除 /orgs/current/data-planes/{id}
验证存储的客户 AWS 角色是否具有删除权限，删除链接的工作区，并开始异步取消配置调用者组织拥有的活动或 Provisioning_failed 数据平面。要求为组织和组织:基础设施:管理启用 BYOC。