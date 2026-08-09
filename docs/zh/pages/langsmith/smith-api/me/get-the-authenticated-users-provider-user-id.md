<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get the authenticated user's provider user ID | https://docs.langchain.com/langsmith/smith-api/me/get-the-authenticated-users-provider-user-id -->

# 获取经过身份验证的用户的提供商用户 ID

/langsmith/langsmith-platform-openapi.json 获取 /me/providers/{providerType}
返回与给定提供程序类型的经过身份验证的用户关联的提供程序用户 ID，如果未设置，则返回 null。范围仅限于当前租户。