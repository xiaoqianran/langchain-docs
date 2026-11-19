<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Start entering the caller's credential for a secret MCP server | https://docs.langchain.com/langsmith/tool-gateway-api/connecting-tools/start-entering-the-callers-credential-for-a-secret-mcp-server -->

# 开始输入秘密 MCP 服务器的调用者凭据

/langsmith/tool-gateway-openapi.json 发布 /v1/managed-tools/servers/{id}/credential-sessions
返回一个链接，您可以在其中输入工作区或内置秘密 MCP 服务器所需的值，以便在不先调用服务器的情况下进行连接。需要 mcp-servers:invoke 服务器。选择与 MCP 呼叫相同的呼叫对象。该链接是一次性的，10分钟后过期，并且其token仅返回一次；在您提交之前，存储的值将一直使用。其他服务器返回 409。通过 credential_owner_type，您作为管理员可以获得连接该代理的链接；这需要代理跟踪项目上的工作空间：凭证：管理和项目：更新。