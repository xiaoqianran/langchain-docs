<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete a profile | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/delete-a-profile -->

# 删除个人资料

/langsmith/tool-gateway-openapi.json 删除 /v1/managed-tools/profiles/{profile_id}
删除配置文件及其凭据，并通过其提供者撤销托管 OAuth 令牌。需要工作区：凭据：管理。以您自己的身份打电话。如果配置文件已经消失，则返回 204。如果凭据清理失败，请重试删除。