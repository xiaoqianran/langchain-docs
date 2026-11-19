<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete a tool kit | https://docs.langchain.com/langsmith/tool-gateway-api/exposing-tools/delete-a-tool-kit -->

# 删除工具包

/langsmith/tool-gateway-openapi.json 删除 /v1/managed-tools/kits/{kit_id}
删除工具包；保留其 MCP 服务器和用户凭据。工作区工具包需要 mcp-servers:delete。只有所有者才能使用 mcp-servers:create-personal 或 mcp-servers:create 删除个人套件。如果套件已经消失，则返回 204。