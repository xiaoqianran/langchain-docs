<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Unlink your identity provider | https://docs.langchain.com/langsmith/tool-gateway-api/calling-tools/unlink-your-identity-provider -->

# 取消与您的身份提供商的链接

/langsmith/tool-gateway-openapi.json 删除 /v1/managed-tools/oidc-connection
取消链接身份提供者，使其访问令牌不再验证 MCP 调用；积分被保留。需要工作区：集成：管理。以您自己的身份打电话。如果没有链接提供者，则返回 204。