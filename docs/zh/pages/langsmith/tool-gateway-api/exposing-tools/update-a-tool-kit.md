<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Update a tool kit | https://docs.langchain.com/langsmith/tool-gateway-api/exposing-tools/update-a-tool-kit -->

# 更新工具包

/langsmith/tool-gateway-openapi.json 补丁 /v1/managed-tools/kits/{kit_id}
更新您发送的字段并返回工具包。需要 mcp-servers:invoke，以及工作区工具包的 mcp-servers:update，或者个人工具包的 mcp-servers:create-personal 或 mcp-servers:create。以您自己的身份打电话。发送工具会替换选择（空数组或 null 会删除所有内容）并在列出工具定义时存储它们；列表失败不会导致写入失败。套件保持其范围：只有个人套件才能连接个人服务器。