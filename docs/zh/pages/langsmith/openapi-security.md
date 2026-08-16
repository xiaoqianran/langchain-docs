<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Document API authentication in OpenAPI | https://docs.langchain.com/langsmith/openapi-security -->

# 在 OpenAPI 中记录 API 身份验证

本指南介绍如何为您的 LangSmith API 文档自定义 OpenAPI 安全架构。详细记录的安全架构可帮助 API 使用者了解如何使用 API 进行身份验证，甚至支持自动生成客户端。有关LangGraph认证系统的更多详细信息，请参阅[Authentication & Access Control conceptual guide](/langsmith/auth)。

<Note>
**实施与文档**
本指南仅介绍如何在 OpenAPI 中记录您的安全要求。要实现实际的身份验证逻辑，请参阅[How to add custom authentication](/langsmith/custom-auth)。
</Note>

本指南适用于所有LangSmith部署（云和自托管）。如果您不使用LangSmith，则它不适用于LangGraph开源库的使用。

## 默认架构

默认安全方案因部署类型而异：

<Tabs>
    <Tab title="LangSmith">
    </Tab>
</Tabs>

默认情况下，LangSmith 需要 `x-api-key` 标头中的 LangSmith API 密钥：

```yaml
components:
  securitySchemes:
    apiKeyAuth:
      type: apiKey
      in: header
      name: x-api-key
security:
  - apiKeyAuth: []
```

当使用 LangGraph SDK 之一时，可以从环境变量中推断出这一点。

<Tabs>
    <Tab title="Self-hosted">
    </Tab>
</Tabs>

默认情况下，自托管部署没有安全方案。这意味着它们只能部署在安全网络上或通过身份验证。要添加自定义身份验证，请参阅[How to add custom authentication](/langsmith/custom-auth)。## 自定义安全模式

要在 OpenAPI 文档中自定义安全架构，请将 `openapi` 字段添加到 `langgraph.json` 中的 `auth` 配置中。请记住，这仅更新 API 文档 - 您还必须实现相应的身份验证逻辑，如 [How to add custom authentication](/langsmith/custom-auth) 中所示。

请注意，LangSmith 不提供身份验证端点 - 您需要在客户端应用程序中处理用户身份验证，并将生成的凭据传递给LangGraph API。

<Tabs>
    <Tab title="OAuth2 with Bearer Token">
    ```json
    {
      "auth": {
        "path": "./auth.py:my_auth",  // Implement auth logic here
        "openapi": {
          "securitySchemes": {
            "OAuth2": {
              "type": "oauth2",
              "flows": {
                "implicit": {
                  "authorizationUrl": "https://your-auth-server.com/oauth/authorize",
                  "scopes": {
                    "me": "Read information about the current user",
                    "threads": "Access to create and manage threads"
                  }
                }
              }
            }
          },
          "security": [
            {"OAuth2": ["me", "threads"]}
          ]
        }
      }
    }
    ```
    </Tab>
    <Tab title="API Key">
    ```json
    {
      "auth": {
        "path": "./auth.py:my_auth",  // Implement auth logic here
        "openapi": {
          "securitySchemes": {
            "apiKeyAuth": {
              "type": "apiKey",
              "in": "header",
              "name": "X-API-Key"
            }
          },
          "security": [
            {"apiKeyAuth": []}
          ]
        }
      }
    }
    ```
    </Tab>
</Tabs>

## 测试

更新配置后：

1. 部署您的应用程序
2.访问`/docs`查看更新的OpenAPI文档
3. 使用身份验证服务器中的凭据尝试端点（确保您已首先实现身份验证逻辑）

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/openapi-security.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>