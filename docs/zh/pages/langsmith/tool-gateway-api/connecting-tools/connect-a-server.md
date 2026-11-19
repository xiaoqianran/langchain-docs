<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect a server | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/connect-a-server -->

# 连接服务器

/langsmith/tool-gateway-openapi.json 把 /v1/managed-tools/servers/{id}/credential
通过存储或替换您的标头凭据将您连接到秘密 MCP 服务器。需要 mcp-servers:invoke。以您自己的身份打电话。值永远不会返回。使用 credential_owner_type，存储所有者的凭据：代理需要代理跟踪项目上的工作区：凭据：管理和项目：更新。工作区（credential_owner_id = 工作区 ID）需要工作区：凭证：管理并且仅在工作区秘密服务器上工作，否则为 409；永久存储它会删除服务器上的所有其他凭据并阻止新的凭据。