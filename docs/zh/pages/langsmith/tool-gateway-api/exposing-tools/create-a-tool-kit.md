<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create a tool kit | https://docs.langchain.com/langsmith/tool-gateway-api/exposing-tools/create-a-tool-kit -->

# 创建工具包

/langsmith/tool-gateway-openapi.json 发布 /v1/managed-tools/kits
创建一个工具包，这是一组通过一个 MCP 端点提供服务的命名工具。需要 mcp-servers:invoke，加上 mcp-servers:create 用于工作区工具包（默认），或 mcp-servers:create-personal 或 mcp-servers:create 用于个人工具包（范围为个人）。以您自己的身份打电话。工作区套件仅链接工作区 MCP 服务器和内置程序。个人工具包还可以链接您的个人服务器，并且只有您自己可见。工具定义按照您列出的方式存储（不是内置的），因此未连接的用户仍然可以看到这些工具；列表失败不会导致写入失败。