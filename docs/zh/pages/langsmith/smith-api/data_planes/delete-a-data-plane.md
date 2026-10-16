<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete a data plane | https://docs.langchain.com/langsmith/smith-api/data_planes/delete-a-data-plane -->

# 删除数据平面

/langsmith/langsmith-platform-openapi.json 删除 /orgs/current/data-planes/{id}
验证存储的客户 AWS 角色是否具有删除权限、存储的 Azure 订阅是否可访问，或者存储的 GCP 配置程序服务帐户是否可以模拟。然后删除链接的工作区并开始异步取消配置调用者组织拥有的活动或 Provisioning_failed 数据平面。 Azure 和 GCP 数据平面也可以在预配时删除。要求为组织和组织:基础设施:管理启用 BYOC。