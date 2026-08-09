<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Sandbox auth proxy | https://docs.langchain.com/langsmith/sandbox-auth-proxy -->

# 沙盒身份验证代理

将凭据注入出站请求并控制沙箱可以到达的目的地。

身份验证代理允许沙箱代码调用外部 API（OpenAI、Anthropic、GitHub 等），而无需硬编码凭据。在沙盒上配置时，代理 sidecar 会使用您在代理配置中提供的工作区密钥或只写凭据自动将身份验证标头注入到匹配的出站请求中。

<Warning>
  在创建引用它们的沙箱之前，您必须在 LangSmith [workspace](/langsmith/administration-overview#workspaces) 设置中配置您的机密（例如 `OPENAI_API_KEY`）。
</Warning>

## 出口和网络访问控制

注入凭据的相同`proxy_config`还控制沙箱可以到达的目的地。

### 默认出口姿势

默认情况下（未配置`access_control`）：

* **允许到任何主机的 HTTP 和 HTTPS（端口 80 和 443）。** 出站 HTTP(S) 通过代理透明地路由，您的 `rules` 和 `callbacks` 注入凭据。
* **所有其他原始 TCP 均被阻止。** 除非您明确允许，否则与非 HTTP 端口（数据库（5432 上的`psql`/`dbt`）、SSH (22)、Redis (6379) 等）的连接将被删除。这意味着原始协议不会被阻止，因为代理“无法说话”它们 - 默认情况下它们被阻止并通过 `access_control` 每个主机和端口打开。

### 允许和拒绝列表

将 `access_control` 对象添加到 `proxy_config`，并使用**或** `allow_list` **或** `deny_list`（不能同时设置，如果两者都设置，则请求将被拒绝）：

|模式|行为 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allow_list` | **默认拒绝。** 仅可访问列出的目标，包括 HTTP/HTTPS。如果您设置 `allow_list`，您还必须列出沙箱所需的每个 HTTP(S) 主机。 |
| `deny_list` | **默认允许 HTTP/HTTPS。** 除列出的主机外，所有 HTTP(S) 主机均保持可访问。 `deny_list` 无法打开原始 TCP 端口。                                  |<Note>
  原始 TCP 出口（例如 5432 上的 PostgreSQL）**只能**通过指定显式非 HTTP 端口 (`host:PORT`) 的 `allow_list` 条目启用。默认状态和 `deny_list` 模式仅允许 HTTP/HTTPS。
</Note>

### 模式语法

每个`allow_list`/`deny_list`条目使用以下形式：

|图案|意义|
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `host` |裸主机 → 端口 **仅限 80 和 443** (HTTP/S)。                                                                  |
| `host:PORT` |恰好在 `PORT` 上主持。 `:22` 仅授予 22，**不**与 80/443 相加 — 如果您需要两者，请将主机列出两次。 |
| `*.example.com` | Glob（RFC 1034 样式）。 **不**包括顶点 (`example.com`)。                                             |
| `~regex` |不透明的正则表达式匹配；没有端口后缀解析。                                                                      || `1.2.3.4` / `10.0.0.0/8` |字面量 IP 或 CIDR。 CIDR **不能**携带端口（HTTP/S 仅在允许模式下；在拒绝模式下阻止所有端口）。     |
| `[::1]:22` | IPv6 文字在指定端口时使用括号形式。                                                     |

### 连接到数据库（原始 TCP）

要让沙箱代码通过 `psql`、`dbt` 或任何驱动程序到达外部 PostgreSQL 数据库，请将主机的端口列入白名单。因为 `allow_list` 是默认拒绝的，所以还列出沙箱需要的任何 HTTP(S) 主机：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -X POST "$LANGSMITH_ENDPOINT/v2/sandboxes/boxes" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "db-sandbox",
    "wait_for_ready": true,
    "proxy_config": {
      "access_control": {
        "allow_list": [
          "db.example.com:5432",
          "api.openai.com"
        ]
      }
    }
  }'
```

与`db.example.com:5432`的连接在 TCP 层传递，不会被拦截，因此 PostgreSQL 有线协议以及 TLS、主机密钥检查以及其上的任何其他端到端协议都保持不变。

### 通过SDK配置

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith.sandbox import SandboxClient

  client = SandboxClient()

  client.create_sandbox(
      name="db-sandbox",
      proxy_config={
          "access_control": {
              "allow_list": ["db.example.com:5432", "api.openai.com"]
          }
      },
  )
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { SandboxClient } from "langsmith/sandbox";

  const client = new SandboxClient();

  await client.createSandbox({
    name: "db-sandbox",
    proxyConfig: {
      access_control: {
        allow_list: ["db.example.com:5432", "api.openai.com"],
      },
    },
  });
  ```
</CodeGroup>

## 配置授权代理规则

创建沙箱时添加`proxy_config`，或通过修补其`proxy_config`来更新现有沙箱。每条规则指定：|领域 |描述 |
| ------------- | ---------------------------------------------------------------------- |
| `match_hosts` |要拦截的主机（支持像`*.github.com`这样的glob）|
| `match_paths` |要匹配的路径（空=所有路径）|
| `headers` |要注入的标头，每个标头都有 `name`、`type` 和 `value` |
| `no_proxy` |主机完全绕过代理（例如`localhost`）|

### 标头类型

每个标头都有一个 `type` 来控制其值的存储和显示方式：

|类型 |描述 |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `workspace_secret` |使用 `{KEY}` 语法引用工作区机密。应用代理配置后即可解决。 |
| `plaintext` |值按原样存储和返回。用于非敏感标头。                                    |
| `opaque` |只写。值在静态时被加密，并且永远不会通过 API 返回。                                |

## 验证 AWS 请求当沙盒代码需要使用 AWS 开发工具包或 CLI 调用 AWS 服务时，请使用 AWS 身份验证规则。代理将真实的 AWS 凭证保留在沙箱之外，然后使用 AWS SigV4 签署受支持的出站 HTTPS 请求。

当代理代码需要检查 S3 对象、调用 Bedrock 或使用其他受支持的 AWS HTTPS 终端节点而不暴露沙箱文件、环境变量、shell 历史记录或日志中的长期 AWS 访问密钥时，这非常有用。沙箱接收兼容性 AWS 凭证占位符，以便 SDK 凭证检测正常工作，而代理则使用配置的凭证对出站请求进行签名。

<Warning>
  不要将真实的 AWS 访问密钥设置为沙箱环境变量。将它们配置为 `workspace_secret` 或 `opaque` 代理值。明文 AWS 凭证值被拒绝。
</Warning>

AWS 身份验证规则与标头注入规则不同：

* 将`type`设置为`aws`。
* 将凭证放在 `aws` 对象下。
* 请勿设置`match_hosts`、`match_paths`、`headers`； AWS 主机匹配内置于代理中。
* 每个沙箱最多配置一个 AWS 身份验证规则。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -X POST "$LANGSMITH_ENDPOINT/v2/sandboxes/boxes" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "aws-sandbox",
    "wait_for_ready": true,
    "proxy_config": {
      "rules": [
        {
          "name": "aws",
          "type": "aws",
          "enabled": true,
          "aws": {
            "access_key_id": {
              "type": "workspace_secret",
              "value": "{AWS_ACCESS_KEY_ID}"
            },
            "secret_access_key": {
              "type": "workspace_secret",
              "value": "{AWS_SECRET_ACCESS_KEY}"
            }
          }
        }
      ]
    }
  }'
```

### 通过 SDK 配置 AWS 身份验证

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith.sandbox import (
      SandboxClient,
      aws_auth,
      proxy_config,
      workspace_secret,
  )

  client = SandboxClient()

  client.create_sandbox(
      name="aws-sandbox",
      proxy_config=proxy_config(
          rules=[
              aws_auth(
                  access_key_id=workspace_secret("AWS_ACCESS_KEY_ID"),
                  secret_access_key=workspace_secret("AWS_SECRET_ACCESS_KEY"),
              )
          ]
      ),
  )
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    SandboxClient,
    awsAuth,
    proxyConfig,
    workspaceSecret,
  } from "langsmith/sandbox";

  const client = new SandboxClient();

  await client.createSandbox({
    name: "aws-sandbox",
    proxyConfig: proxyConfig({
      rules: [
        awsAuth({
          accessKeyId: workspaceSecret("AWS_ACCESS_KEY_ID"),
          secretAccessKey: workspaceSecret("AWS_SECRET_ACCESS_KEY"),
        }),
      ],
    }),
  });
  ```
</CodeGroup>沙箱准备就绪后，在沙箱内正常使用 AWS 开发工具包或 CLI。开发工具包或 CLI 可以发现占位符 AWS 环境变量，并且代理将真实的 SigV4 签名应用于出站 AWS 请求。

<Note>
  AWS 身份验证代理规则当前支持访问密钥 ID 和秘密访问密钥凭证。它们不包含会话令牌或假设角色配置。
</Note>

## 验证 GCP 请求

当沙箱代码需要使用 Google SDK 或 CLI 调用 Google API 时，请使用 GCP 身份验证规则。代理将服务帐户 JSON 保留在沙箱之外，然后对沙箱代理匹配的 Google API 主机支持的出站 HTTPS 请求进行身份验证。

当代理代码需要检查 GCS 对象或调用另一个 Google API 而不在沙箱文件、环境变量、shell 历史记录或日志中公开服务帐户 JSON 时，这非常有用。沙箱接收兼容性凭据，以便 SDK 凭据检测正常工作，而代理则使用配置的服务帐户对出站请求进行身份验证。<Warning>
  不要将真实服务帐户 JSON 设置为沙箱环境变量。将其配置为 `workspace_secret` 或 `opaque` 代理值。明文 GCP 凭证值被拒绝。
</Warning>

GCP 身份验证规则与标头注入规则不同：

* 将`type`设置为`gcp`。
* 将凭据放在`gcp.service_account_json`下。
* 将 `gcp.scopes` 设置为 OAuth 范围的非空列表。
* 代理自动匹配 Google API 主机，并使用配置的服务帐户对这些请求进行身份验证。
* 每个沙箱最多配置一个启用的 GCP 身份验证规则。

SDK `gcp_auth` 和 `gcpAuth` 帮助程序构建了相同的规则形状。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -X POST "$LANGSMITH_ENDPOINT/v2/sandboxes/boxes" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "gcp-sandbox",
    "wait_for_ready": true,
    "proxy_config": {
      "rules": [
        {
          "name": "gcp",
          "type": "gcp",
          "enabled": true,
          "gcp": {
            "service_account_json": {
              "type": "workspace_secret",
              "value": "{GCP_SERVICE_ACCOUNT_JSON}"
            },
            "scopes": [
              "https://www.googleapis.com/auth/devstorage.read_only"
            ]
          }
        }
      ]
    }
  }'
```

### 通过 SDK 配置 GCP 身份验证

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith.sandbox import (
      SandboxClient,
      gcp_auth,
      proxy_config,
      workspace_secret,
  )

  client = SandboxClient()

  client.create_sandbox(
      name="gcp-sandbox",
      proxy_config=proxy_config(
          rules=[
              gcp_auth(
                  service_account_json=workspace_secret("GCP_SERVICE_ACCOUNT_JSON"),
                  scopes=["https://www.googleapis.com/auth/devstorage.read_only"],
              )
          ]
      ),
  )
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    SandboxClient,
    gcpAuth,
    proxyConfig,
    workspaceSecret,
  } from "langsmith/sandbox";

  const client = new SandboxClient();

  await client.createSandbox({
    name: "gcp-sandbox",
    proxyConfig: proxyConfig({
      rules: [
        gcpAuth({
          serviceAccountJson: workspaceSecret("GCP_SERVICE_ACCOUNT_JSON"),
          scopes: ["https://www.googleapis.com/auth/devstorage.read_only"],
        }),
      ],
    }),
  });
  ```
</CodeGroup>

沙箱准备就绪后，通常在沙箱内使用 Google SDK 或 CLI 来获取受支持的 Google API 请求。 SDK 或 CLI 可以发现兼容性凭据，并且代理应用真正的 GCP 身份验证，而无需在沙箱内公开服务帐户 JSON。

## 单个 API 示例

创建一个沙箱，自动将 OpenAI API 密钥注入出站请求中：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -X POST "$LANGSMITH_ENDPOINT/v2/sandboxes/boxes" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "openai-sandbox",
    "wait_for_ready": true,
    "proxy_config": {
      "rules": [
        {
          "name": "openai-api",
          "match_hosts": ["api.openai.com"],
          "headers": [
            {
              "name": "Authorization",
              "type": "workspace_secret",
              "value": "Bearer {OPENAI_API_KEY}"
            }
          ]
        }
      ]
    }
  }'
```

沙箱现在可以调用 OpenAI，无需设置 API 密钥 - 代理会自动注入它。

## 多个API示例添加多个规则以同时对多个服务进行身份验证：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -X POST "$LANGSMITH_ENDPOINT/v2/sandboxes/boxes" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "multi-api-sandbox",
    "wait_for_ready": true,
    "proxy_config": {
      "rules": [
        {
          "name": "openai-api",
          "match_hosts": ["api.openai.com"],
          "headers": [
            {
              "name": "Authorization",
              "type": "workspace_secret",
              "value": "Bearer {OPENAI_API_KEY}"
            }
          ]
        },
        {
          "name": "anthropic-api",
          "match_hosts": ["api.anthropic.com"],
          "headers": [
            {
              "name": "x-api-key",
              "type": "workspace_secret",
              "value": "{ANTHROPIC_API_KEY}"
            },
            {
              "name": "anthropic-version",
              "type": "plaintext",
              "value": "2023-06-01"
            }
          ]
        },
        {
          "name": "github-api",
          "match_hosts": ["api.github.com"],
          "match_paths": ["/repos/*", "/user"],
          "headers": [
            {
              "name": "Authorization",
              "type": "workspace_secret",
              "value": "Bearer {GITHUB_TOKEN}"
            }
          ]
        }
      ],
      "no_proxy": ["localhost", "127.0.0.1"]
    }
  }'
```

## GitHub 示例

[Open SWE](https://github.com/langchain-ai/open-swe/blob/main/agent/integrations/langsmith.py) 通过在沙箱外创建短期 GitHub 应用程序安装令牌来验证 GitHub 访问，然后使用只写 `opaque` 代理规则修补沙箱。这使得短暂的 GitHub 访问令牌远离沙箱文件系统和部署环境变量。

配置两条规则：

|主持人|标题|
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `api.github.com` | `Authorization: Bearer <github-token>` 用于 `gh` 和 REST API 调用 |
| `github.com`、`*.github.com` | `Authorization: Basic <base64("x-access-token:<github-token>")>` 用于通过 HTTPS 操作的 Git，例如克隆、获取和推送 |

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import base64
import os
from typing import Any

import httpx


def github_proxy_rules(github_token: str) -> list[dict[str, Any]]:
    basic_auth = base64.b64encode(
        f"x-access-token:{github_token}".encode()
    ).decode()

    return [
        {
            "name": "github-api",
            "match_hosts": ["api.github.com"],
            "headers": [
                {
                    "name": "Authorization",
                    "type": "opaque",
                    "value": f"Bearer {github_token}",
                }
            ],
        },
        {
            "name": "github",
            "match_hosts": ["github.com", "*.github.com"],
            "headers": [
                {
                    "name": "Authorization",
                    "type": "opaque",
                    "value": f"Basic {basic_auth}",
                }
            ],
        },
    ]


def configure_github_proxy(sandbox_name: str, github_token: str) -> None:
    endpoint = os.environ.get(
        "LANGSMITH_ENDPOINT", "https://api.smith.langchain.com"
    )
    response = httpx.patch(
        f"{endpoint}/v2/sandboxes/boxes/{sandbox_name}",
        headers={"x-api-key": os.environ["LANGSMITH_API_KEY"]},
        json={"proxy_config": {"rules": github_proxy_rules(github_token)}},
        timeout=30.0,
    )
    response.raise_for_status()
```

创建或重新附加到沙箱后调用`configure_github_proxy`。 GitHub 应用程序安装令牌会过期，因此每当您重新使用沙箱进行新运行时，请刷新代理配置。在沙箱内，当 CLI 在发送请求之前需要本地凭据时，设置一个非秘密占位符令牌：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
GH_TOKEN=dummy gh repo view langchain-ai/langchain
GH_TOKEN=dummy gh pr list --repo langchain-ai/langchain
GH_TOKEN=dummy gh repo clone langchain-ai/langchain
```

占位符仅满足`gh` CLI 的本地检查。代理将真实的`Authorization`标头注入出站请求中。

## 通过SDK配置

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith.sandbox import SandboxClient

  client = SandboxClient()

  client.create_sandbox(
      name="openai-sandbox",
      proxy_config={
          "rules": [
              {
                  "name": "openai-api",
                  "match_hosts": ["api.openai.com"],
                  "headers": [
                      {
                          "name": "Authorization",
                          "type": "workspace_secret",
                          "value": "Bearer {OPENAI_API_KEY}",
                      }
                  ],
              }
          ]
      },
  )
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { SandboxClient } from "langsmith/sandbox";

  const client = new SandboxClient();

  await client.createSandbox({
    name: "openai-sandbox",
    proxyConfig: {
      rules: [
        {
          name: "openai-api",
          match_hosts: ["api.openai.com"],
          headers: [
            {
              name: "Authorization",
              type: "workspace_secret",
              value: "Bearer {OPENAI_API_KEY}",
            },
          ],
        },
      ],
    },
  });
  ```
</CodeGroup>

## 回调凭证示例

应用代理配置时，静态 `workspace_secret` 规则会从您的工作区中提取凭据，而 `opaque` 规则可让您的应用程序修补短期凭据，例如 [GitHub token example](#github-example)。对于必须由您自己的服务在代理时解析的凭据，请使用 **回调**。代理 POST 到您提供的 URL，您的端点返回要注入的标头，代理缓存结果。

回调与`proxy_config`下的规则一起配置：|领域 |描述 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `match_hosts` |要拦截的主机（与规则相同的语法；支持像`*.github.com`这样的通配符）。                                                                                                                        |
| `url` |您的回调端点。必须是可从代​​理访问的 `http://` 或 `https://` URL。                                                                                                              |
| `request_headers` |附加到代理 → 回调请求的标头，例如端点用于验证请求的 HMAC 或共享密钥。仅允许使用 `plaintext` 和 `opaque` 类型（不允许使用 `workspace_secret`）。 || `ttl_seconds` |在重新调用回调之前，已解析的标头会被缓存多长时间。必须介于 60 和 3600 之间。

**静态规则获胜。** 如果 `rules` 中的任何规则与主机匹配，则跳过该主机的回调。在规则范围内，首场获胜；如果多个匹配，这同样适用于回调之间。

### 回调合约

每当代理需要在缓存未命中时解析匹配主机的凭据时，都会发出以下请求：

```
POST <callback.url>
Content-Type: application/json
<request_headers from your config, attached verbatim>

{"host": "api.example.com", "port": 443}
```

您的端点必须使用 JSON 正文响应 `2xx`：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "headers": {
    "Authorization": "Bearer <token>",
    "X-Org-Id": "..."
  }
}
```

代理将响应中的每个标头注入沙箱的出站请求中，并缓存`ttl_seconds`的响应。任何非 2xx 响应、传输错误或格式错误的 JSON 都会失败关闭：沙箱的请求被拒绝，并显示 `502 callback resolution failed`（未注入标头，未缓存响应）。

### 示例

当您自己的服务按需创建 OAuth 令牌时，请使用回调：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -X POST "$LANGSMITH_ENDPOINT/v2/sandboxes/boxes" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "snapshot_id": "<snapshot-uuid>",
    "name": "callback-sandbox",
    "wait_for_ready": true,
    "proxy_config": {
      "callbacks": [
        {
          "match_hosts": ["api.github.com", "*.githubusercontent.com"],
          "url": "https://auth.your-app.example.com/sandbox-credentials",
          "request_headers": [
            {
              "name": "X-Integrator-Secret",
              "type": "opaque",
              "value": "<shared-secret-your-endpoint-verifies>"
            }
          ],
          "ttl_seconds": 300
        }
      ]
    }
  }'
```

### 通过SDK配置

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith.sandbox import SandboxClient

  client = SandboxClient()

  client.create_sandbox(
      name="callback-sandbox",
      proxy_config={
          "callbacks": [
              {
                  "match_hosts": ["api.github.com", "*.githubusercontent.com"],
                  "url": "https://auth.your-app.example.com/sandbox-credentials",
                  "request_headers": [
                      {
                          "name": "X-Integrator-Secret",
                          "type": "opaque",
                          "value": "<shared-secret-your-endpoint-verifies>",
                      }
                  ],
                  "ttl_seconds": 300,
              }
          ]
      },
  )
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { SandboxClient } from "langsmith/sandbox";

  const client = new SandboxClient();

  await client.createSandbox({
    name: "callback-sandbox",
    proxyConfig: {
      callbacks: [
        {
          match_hosts: ["api.github.com", "*.githubusercontent.com"],
          url: "https://auth.your-app.example.com/sandbox-credentials",
          request_headers: [
            {
              name: "X-Integrator-Secret",
              type: "opaque",
              value: "<shared-secret-your-endpoint-verifies>",
            },
          ],
          ttl_seconds: 300,
        },
      ],
    },
  });
  ```
</CodeGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/sandbox-auth-proxy.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>