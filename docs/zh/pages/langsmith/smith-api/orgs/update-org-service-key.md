<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Update org service key | https://docs.langchain.com/langsmith/smith-api/orgs/update-org-service-key -->

# 更新组织服务密钥

/langsmith/langsmith-platform-openapi.json 补丁 /api/v1/orgs/current/service-keys/{api_key_id}
就地更新 API 密钥的角色，无需轮换密钥。

组织操作员无法分配或更改组织管理员角色
一把已经拥有它的钥匙，没有钥匙可以改变自己的角色。
工作区范围的密钥还需要每个密钥管理权限
他们覆盖的工作空间。适用于组织范围和工作空间范围的键。