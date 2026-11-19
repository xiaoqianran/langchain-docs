<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Disconnect a server | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/disconnect-a-server -->

# 断开服务器连接

/langsmith/tool-gateway-openapi.json 删除 /v1/managed-tools/servers/{id}/credential
通过删除您的凭据来断开您与 MCP 服务器的连接；保留服务器和其他用户的凭据。共享 OAuth 凭据将从使用其连接的每个集成中删除。如果您已断开连接，则返回 204。使用 credential_owner_type，断开该所有者的连接并撤销托管 OAuth 令牌：代理需要代理跟踪项目上的工作区：凭证：管理和项目：更新；工作区（credential_owner_id = 工作区 ID）需要工作区：凭证：管理并且仅在工作区秘密服务器上工作，否则为 409。