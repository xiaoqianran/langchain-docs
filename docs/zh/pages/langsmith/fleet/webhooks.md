<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Fleet webhooks | https://docs.langchain.com/langsmith/fleet/webhooks -->

# 舰队网络钩子

将代理发布与外部系统、CI/CD 管道或自定义部署工作流程集成。

触发后，Webhook 会将代理配置和文件的完整包发送到指定端点。

<Callout icon="lock">
  **安全说明：**

  * Webhook URL 必须使用 HTTPS。
  * 自定义标头（例如 API 密钥）以加密方式存储。
  * 发布商身份包含在审计跟踪中。
  * Webhooks 仅对代理所有者可见。
</Callout>

## 添加网络钩子

1. 导航至[Settings > Fleet webhooks](https://smith.langchain.com/settings/workspaces/agent-builder-webhooks)。
2. 单击“**添加 Webhook**”。
3. 配置：
   * **名称**：描述性名称（例如“发布代理”、“部署到生产环境”）。
   * **URL**：将接收 Webhook 的 HTTPS 端点。
   * **标头**（可选）：用于身份验证的自定义标头（加密存储）。
   * **表单架构**（可选）：定义触发时用户必须填写的自定义输入字段。
4. 单击“**保存**”。

## 触发网络钩子

1. 在舰队编辑器中打开您的代理。
2. 单击 **设置** 菜单（齿轮图标）。
3. 在 **Webhooks** 下，单击 Webhook 名称。
4. 填写表单架构中定义的任何自定义字段。
5. 单击“**运行 Webhook**”。

## 编辑网络钩子1. 导航至[Settings > Fleet webhooks](https://smith.langchain.com/settings/workspaces/agent-builder-webhooks)。
2. 对于要编辑的 Webhook，单击“**编辑**”。
3. 进行更改并单击**保存**。

## 删除网络钩子

1. 导航至[Settings > Fleet webhooks](https://smith.langchain.com/settings/workspaces/agent-builder-webhooks)。
2. 对于要删除的 Webhook，单击 **删除**。
3. 要确认删除，请单击“**删除**”。

## Webhook 负载

Webhook 负载是一个包含以下字段的 JSON 对象：

|领域 |描述 |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `action` | Webhook 的名称。                                           |
| `input` |来自自定义表单字段的值（如果没有自定义字段则为空对象）。 |
| `publisher` |触发 Webhook 的人的用户 ID 和电子邮件。            |
| `agent` |代理名称和描述。                                        |
| [⟦T10⟧](#tool-auth-requirements) |代理使用的每个工具的身份验证要求。          || [⟦T11⟧](#zip-file-structure) |包含所有代理文件的 Base64 编码 ZIP。                     |
| [⟦T12⟧](#custom-input-fields) |自定义输入字段。                                               |

例如：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "action": "Webhook Name",
  "input": {
    "notes": "User-provided value",
    "environment": "prod",
    "dry_run": true
  },
  "publisher": {
    "user_id": "uuid-of-publishing-user",
    "email": "user@example.com"
  },
  "agent": {
    "name": "My Agent",
    "description": "Agent description text"
  },
  "tool_auth_requirements": [
    {
      "tool_name": "tavily_web_search",
      "auth_type": "api_key",
      "required_env_vars": ["TAVILY_API_KEY"]
    },
    {
      "tool_name": "google_calendar",
      "auth_type": "oauth",
      "auth_provider": "google",
      "scopes": ["calendar.readonly"]
    }
  ],
  "files": {
    "type": "zip",
    "filename": "My_Agent.zip",
    "content_base64": "<base64-encoded-zip>"
  },
  "fields": [
    {
      "name": "notes",
      "label": "Deployment Notes",
      "type": "textarea"
    }
  ]
}
```

### 工具授权要求

`tool_auth_requirements` 数组描述了每个工具所需的身份验证：

|身份验证类型 |领域 |描述 |
| ---------| ---------------------------------- | ------------------------------------------------ |
| `none` | - |工具无需身份验证 |
| `api_key` | `required_env_vars` |工具需要环境变量中的 API 密钥 |
| `oauth` | `auth_provider`、`scopes` |工具需要具有指定范围的 OAuth 令牌 |

使用此信息通过必要的凭据配置您的部署环境。

### ZIP 文件结构

`files.content_base64` 字段包含具有以下结构的 ZIP 存档：

```
.
├── AGENTS.md           # Agent system prompt and instructions
├── config.json         # Agent metadata (name, description, visibility)
├── tools.json          # Tool configurations and interrupt settings
├── skills/             # Optional skill definitions
│   └── skill-name/
│       └── SKILL.md
└── subagents/          # Optional subagent configurations
    └── research_worker/
        ├── AGENTS.md
        └── tools.json
```

`config.json`文件和`tools.json`文件的结构如下：

<Tabs>
  <Tab title="⟦T23⟧">
    ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
      "name": "My Agent",
      "description": "Agent description",
      "visibility_scope": "tenant",
      "triggers_paused": false
    }
    ```
  </Tab>

  <Tab title="⟦T24⟧">
    ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
      "tools": [
        {
          "name": "tavily_web_search",
          "mcp_server_url": "http://localhost:8084",
          "mcp_server_name": "Fleet",
          "display_name": "tavily_web_search"
        }
      ],
      "interrupt_config": {
        "http://localhost:8084::tavily_web_search::Fleet": false
      }
    }
    ```
  </Tab>
</Tabs>

### 自定义输入字段您可以定义自定义输入字段以在触发 Webhook 时收集信息。支持的字段类型如下：

|类型 |描述 |
| ---------- | --------------------------------- |
| `string` |单行文本输入（默认）。 |
| `number` |数字输入。                    |
| `boolean` |复选框（真/假）。            |
| `textarea` |多行文本输入。            |
| `json` | JSON 编辑器。                      |
| `select` |带有预定义选项的下拉菜单。 |

例如：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "fields": [
    {
      "name": "notes",
      "label": "Deployment Notes",
      "type": "textarea"
    },
    {
      "name": "environment",
      "label": "Environment",
      "type": "select",
      "options": [
        { "label": "Development", "value": "dev" },
        { "label": "Staging", "value": "staging" },
        { "label": "Production", "value": "prod" }
      ]
    },
    {
      "name": "dry_run",
      "label": "Dry Run",
      "type": "boolean",
      "default": true
    }
  ]
}
```

## 示例：Webhook 服务器

以下是 Python 中的 Webhook 服务器示例：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import base64
import zipfile
import io

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        body = json.loads(self.rfile.read(content_length))

        action = body.get("action")
        input_data = body.get("input", {})
        publisher = body.get("publisher", {})
        agent = body.get("agent", {})
        tool_auth = body.get("tool_auth_requirements", [])
        files = body.get("files", {})

        print(f"Webhook: {action}")
        print(f"Publisher: {publisher.get('email')}")
        print(f"Agent: {agent.get('name')}")
        print(f"Custom Input: {input_data}")

        # Extract ZIP contents
        if files.get("content_base64"):
            zip_bytes = base64.b64decode(files["content_base64"])
            with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
                print(f"Files: {zf.namelist()}")

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"status": "ok"}).encode())

HTTPServer(("", 8000), WebhookHandler).serve_forever()
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/webhooks.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>