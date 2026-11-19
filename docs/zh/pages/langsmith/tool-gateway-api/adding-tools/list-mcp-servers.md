<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List MCP servers | https://docs.langchain.com/langsmith/tool-gateway-api/adding-tools/list-mcp-servers -->

# 列出 MCP 服务器

/langsmith/tool-gateway-openapi.json 获取 /v1/managed-tools/servers
列出工作区的 MCP 服务器、您的个人服务器以及工作区可用的内置程序以及您的连接状态。需要 mcp 服务器：读取。 credential_source 表示调用使用谁的凭证；工作区凭据显示为每个人都已连接。使用 credential_owner_type，显示该所有者的状态：代理需要工作区：凭证：读取元数据和项目：读取代理的跟踪项目；工作区（credential_owner_id = 工作区 ID）需要工作区:credentials:read-metadata。