<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Sandbox auth proxy | https://docs.langchain.com/langsmith/sandbox-auth-proxy -->

# 沙盒身份验证代理

身份验证代理允许沙箱代码调用外部 API（OpenAI、Anthropic、GitHub 等），而无需硬编码凭据。在沙箱上配置时，在沙箱外部运行的出口代理会使用您的工作区机密或您在代理配置中提供的只写凭据自动将身份验证标头注入到匹配的出站请求中。

<Warning>
在创建引用它们的沙箱之前，您必须在 LangSmith [workspace](/langsmith/administration-overview#workspaces) 设置中配置您的机密（例如 `OPENAI_API_KEY`）。
</Warning>

## 出口和网络访问控制

注入凭证的相同`proxy_config`还控制沙箱可以到达的目的地。沙箱主机上的每个连接都强制执行访问控制，因此对 `access_control` 的更改会立即生效。

### 出口如何工作- **访问控制适用于每个出站 TCP 连接**，无论是否为 HTTP。
- **HTTPS 到与规则或回调匹配的主机由代理解密**，以便它可以注入标头；沙箱信任代理的 CA。到不匹配的主机的 HTTPS 和每个非 HTTP 连接（包括 PostgreSQL、SSH 和 Redis）均保持不变。端口 80 和 443 保留用于 HTTP 和 TLS；任一端口上的非 HTTP 协议都不起作用。
- **按主机名寻址目标。** 与非 HTTP 端口上的文字 IP 地址的直接原始 TCP 连接会被丢弃，即使该 IP 位于 `allow_list` 上也是如此。到文字 IP 的 HTTPS 也被删除，因为代理在 TLS 握手中需要主机名。只有端口 80 上的明文 HTTP 才适用于文字 IP。
- **只有 TCP 离开沙箱。** UDP（包括 QUIC）和 ICMP 被丢弃。

### 默认出口姿势

如果没有 `access_control`，**每个主机名都可以在每个 TCP 端口上访问**，除非您的组织位于 [restricted egress](#organization-level-restricted-egress)。唯一的例外是解析为私有、环回或云元数据地址的主机，代理始终拒绝拨打这些地址。添加 `access_control` 来限制这一点。要允许任何主机使用 HTTP 和 HTTPS，同时阻止所有其他端口，请使用端口限定的允许列表。 `*` 匹配每个主机名：

```json
{
  "access_control": {
    "allow_list": ["*:80", "*:443"]
  }
}
```

添加 `host:PORT` 条目以打开特定的原始 TCP 目标，例如 `db.example.com:5432`。

### 允许和拒绝列表

将 `access_control` 对象添加到 `proxy_config`，并使用**或** `allow_list` **或** `deny_list`（不能同时设置，如果两者都设置，则请求将被拒绝）：

|模式|行为 |
|------|----------|
| `allow_list` | **默认拒绝。** 在任何协议上都只能访问列出的目的地。列出沙箱所需的每个主机，包括您的 `rules` 和 `callbacks` 目标的 HTTP(S) 主机。 |
| `deny_list` | **默认允许。** 除列出的协议外，每个目的地均可通过任何协议到达。 |

这两个列表都适用于 HTTP、HTTPS 和原始 TCP。这两种模式都不区分协议；使用端口后缀将条目限制为一个端口。

<Warning>
`deny_list` 仅阻止您列出的主机。 `{"deny_list": ["example.com"]}` 在每个端口上阻止 `example.com`，并使每个其他主机在每个端口上均可访问，包括 DNS、SSH 和数据库端口。要在各处关闭原始 TCP，请使用 `allow_list`，例如 `["*:80", "*:443"]`。
</Warning>

### 模式语法

每个`allow_list`/`deny_list`条目使用以下形式：|图案|意义|
|---------|---------|
| `host` |裸主机 → **每个端口**。 |
| `host:PORT` |正好在`PORT`主持。 `db.example.com:5432`仅覆盖5432；为任何其他端口添加另一个条目。 |
| `*.example.com` | Glob（RFC 1034 样式）。 **不**包括顶点 (`example.com`)。可以携带一个端口。 |
| `~regex` |正则表达式与主机名、每个端口相匹配。不解析端口后缀。 |
| `1.2.3.4` / `[::1]` |字面上的IP。可携带端口：`1.2.3.4:443`、`[::1]:22`。 |
| `10.0.0.0/8` | CIDR。无法携带端口。 |

匹配的目的地与沙箱所寻址的完全相同。主机名条目与对该主机名发出的请求相匹配； IP 或 CIDR 条目与对文字 IP 地址发出的请求相匹配。两者都没有被解析：即使它解析到该范围，`deny_list: ["203.0.113.0/24"]`也不会阻止`foo.example.com`，并且`allow_list: ["203.0.113.7"]`也不允许它。由于在访问控制运行之前，原始 TCP 和 HTTPS 会被丢弃（请参阅[How egress works](#how-egress-works)），因此 IP 和 CIDR 条目只会影响端口 80 上直接命名 IP 的明文 HTTP 请求。

创建或更新沙箱时，无法解析的条目（`example.com:abc`、`example.com:99999` 或带有端口的 CIDR）将被拒绝。

### 组织级限制出站可以将组织置于**限制出口**。如果是这样，LangSmith 会用包注册表、操作系统包镜像、源代码和容器映像主机、CDN 以及模型提供程序 API 的固定允许列表替换每个沙箱的 `access_control`，每个端口都固定到特定端口（HTTPS，以及 Ubuntu 和 Debian 镜像的 HTTP）。调用者提供的 `allow_list` 和 `deny_list` 值被 API 接受，但在策略处于活动状态时无效。

### 连接到数据库（原始 TCP）

要让沙箱代码通过 `psql`、`dbt` 或任何驱动程序到达外部 PostgreSQL 数据库，请将主机的端口列入白名单。由于 `allow_list` 是默认拒绝的，因此还要列出沙箱所需的任何 HTTP(S) 主机。将它们固定到`:443`，除非您还需要其他端口：

```bash
curl -X POST "$LANGSMITH_ENDPOINT/v2/sandboxes/boxes" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "db-sandbox",
    "proxy_config": {
      "access_control": {
        "allow_list": [
          "db.example.com:5432",
          "api.openai.com:443"
        ]
      }
    }
  }'
```

与`db.example.com:5432`的连接在 TCP 层传递，不会被拦截，因此 PostgreSQL 有线协议以及 TLS、主机密钥检查以及其上的任何其他端到端协议都保持不变。

<Note>
创建沙箱会启动它，并在报告 `ready` 后返回，因此无需添加等待步骤。如果您稍后需要重新检查，`GET /api/v2/sandboxes/boxes/{name}/status` 会报告当前状态。
</Note>

### 通过SDK配置

<CodeGroup>

```python Python
from langsmith.sandbox import SandboxClient

client = SandboxClient()

client.create_sandbox(
    name="db-sandbox",
    proxy_config={
        "access_control": {
            "allow_list": ["db.example.com:5432", "api.openai.com:443"]
        }
    },
)
```

```ts TypeScript
import { SandboxClient } from "langsmith/sandbox";

const client = new SandboxClient();

await client.createSandbox({
  name: "db-sandbox",
  proxyConfig: {
    access_control: {
      allow_list: ["db.example.com:5432", "api.openai.com:443"],
    },
  },
});
```

</CodeGroup>## 配置授权代理规则

创建沙箱时添加`proxy_config`，或通过修补其`proxy_config`来更新现有沙箱。 `proxy_config` 具有：

|领域|描述 |
|--------|-------------|
| `rules` |标头注入和提供者身份验证规则。启用的标头规则按列表顺序匹配首场比赛获胜； `aws` 和 `gcp` 规则与其提供商的主机相匹配，无论位置如何 |
| `callbacks` |动态凭证查找；参见[Callback credential example](#callback-credential-example) |
| `access_control` | `allow_list`或`deny_list`；参见[Allow and deny lists](#allow-and-deny-lists)|
| `description` |可选，最多 1024 个字符。此配置让沙箱能够达到什么目的，以交给代理|

每条规则指定：|领域|描述 |
|--------|-------------|
| `name` |必需的。规则的标识符 |
| `type` |省略标头注入； `aws` 或 `gcp` 用于提供商身份验证 |
| `match_hosts` |标头规则必需的；根据 `aws` 和 `gcp` 规则被拒绝。裸主机名，或可注册域前面的前导 `*.` 通配符（`*.github.com`，而不是 `*.com` 或 `*`）。没有方案、路径或端口。通配符与顶级域不匹配 |
| `match_paths` |要匹配的路径（空=所有路径）。仅标题规则 |
| `headers` |要注入的标头，每个标头都有 `name`、`type` 和 `value`。仅标题规则 |
| `aws` / `gcp` |提供者凭证；请参阅 [Authenticate AWS requests](#authenticate-aws-requests) 和 [Authenticate GCP requests](#authenticate-gcp-requests) |
| `env_vars` |启用规则时在沙箱中设置的环境变量 |
| `enabled` |默认为 `true` |
| `description` |可选，最多 1024 个字符。这个规则让沙箱达到什么目的 |

### 标头类型

每个标头都有一个必需的 `type` 来控制其值的存储和显示方式：|类型 |描述 |
|------|-------------|
| `workspace_secret` |使用 `{KEY}` 语法引用工作区机密。应用代理配置后即可解决。 |
| `plaintext` |值按原样存储和返回。用于非敏感标头。 |
| `opaque` |只写。值在静态时被加密，并且永远不会通过 API 返回。 |

### 根据规则设置环境变量

规则的 `env_vars` 是在启用该规则时为沙箱中的每个命令设置的纯文本环境变量。将它们用于拒绝运行的工具，除非存在凭证变量，即使代理在线路上注入真实凭证：为变量提供一个占位符值，以便命令启动，并且代理提供真实凭证。

值是明文并由 API 返回，因此切勿在 `env_vars` 中放置秘密。请改用 `workspace_secret` 或 `opaque` 类型的标头。

环境变量按以下顺序解析，从最低优先级到最高优先级：1. **当沙箱选择使用 `apply_image_config` 时，快照图像的`ENV`**。
2. **启用的代理规则**：当两个启用的规则声明相同名称时，`rules`中较晚的规则获胜。
3. **沙箱自己的`env_vars`**：显式的每个沙箱值会覆盖规则中的值。

由已启用的 AWS 或 GCP 身份验证规则（`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_EC2_METADATA_DISABLED`、`AWS_CA_BUNDLE`、`CLOUDSDK_AUTH_ACCESS_TOKEN`、`CLOUDSDK_CORE_CUSTOM_CA_CERTS_FILE`）管理的变量不符合此顺序：声明其中之一被拒绝的规则或沙箱 `env_vars` 条目同时启用匹配的身份验证规则。

每个沙箱还具有指向系统信任存储的通用 CA 捆绑包环境变量，其中包括代理的 CA，因此固定其自己的捆绑包的工具仍然会验证代理注入的主机。自己设置其中任何一个来覆盖。

```json
{
  "name": "github-api",
  "match_hosts": ["api.github.com"],
  "headers": [
    {"name": "Authorization", "type": "opaque", "value": "Bearer <github-token>"}
  ],
  "env_vars": {"GH_TOKEN": "proxy-injected"}
}
```

## 验证 AWS 请求

当沙盒代码需要使用 AWS 开发工具包或 CLI 调用 AWS 服务时，请使用 AWS 身份验证规则。代理将真实的 AWS 凭证保留在沙箱之外，然后使用 AWS SigV4 将出站 HTTPS 请求签署到 `*.amazonaws.com` 终端节点。当代理代码需要检查 S3 对象、调用 Bedrock 或使用另一个 AWS 终端节点而不暴露沙箱文件、环境变量、shell 历史记录或日志中的长期 AWS 访问密钥时，这非常有用。沙箱接收占位符 `AWS_ACCESS_KEY_ID` 和 `AWS_SECRET_ACCESS_KEY` 值（加上 `AWS_EC2_METADATA_DISABLED=true` 和 `AWS_CA_BUNDLE`），因此 SDK 凭证检测可以正常工作，而代理会用真实的 SigV4 签名替换请求携带的任何内容。仅对`service.region.amazonaws.com`主机、S3虚拟托管和路径式主机以及一些全局端点（例如`iam`、`sts`和`s3`）进行签名；发送到匹配的 AWS 主机的纯文本 HTTP 会被拒绝，并显示 `403`。

<Warning>
不要将真实的 AWS 访问密钥设置为沙箱环境变量。将它们配置为 `workspace_secret` 或 `opaque` 代理值。明文 AWS 凭证值被拒绝。
</Warning>

AWS 身份验证规则与标头注入规则不同：

- 将 `type` 设置为 `aws`。
- 将凭证放在 `aws` 对象下。
- 请勿设置`match_hosts`、`match_paths`、`headers`； AWS 主机匹配内置于代理中。
- 每个沙箱最多配置一个 AWS 身份验证规则。该限制计算每个 AWS 规则，包括禁用的规则。

```bash
curl -X POST "$LANGSMITH_ENDPOINT/v2/sandboxes/boxes" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "aws-sandbox",
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

```python Python
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

```ts TypeScript
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

</CodeGroup>沙箱准备就绪后，在沙箱内正常使用 AWS 开发工具包或 CLI。开发工具包或 CLI 发现占位符 AWS 环境变量，并且代理将真实的 SigV4 签名应用于出站 AWS 请求。代理不设置区域：通过沙箱的 `env_vars` 或规则的 `env_vars` 设置`AWS_REGION`，否则大多数 SDK 和 CLI 调用在到达代理之前就会失败。

<Note>
AWS 身份验证代理规则当前支持访问密钥 ID 和秘密访问密钥凭证。它们不包含会话令牌或假设角色配置。
</Note>

## 验证 GCP 请求

当沙箱代码需要使用 Google SDK 或 CLI 调用 Google API 时，请使用 GCP 身份验证规则。代理将服务帐户 JSON 保留在沙箱之外，然后对 `googleapis.com` 及其子域的出站 HTTPS 请求进行身份验证。当代理代码需要检查 GCS 对象或调用另一个 Google API 而不在沙箱文件、环境变量、shell 历史记录或日志中公开服务帐户 JSON 时，这非常有用。沙箱接收占位符 `CLOUDSDK_AUTH_ACCESS_TOKEN`（加上 `CLOUDSDK_CORE_CUSTOM_CA_CERTS_FILE`），因此 `gcloud` 运行，而代理会使用从配置的服务帐户创建的令牌替换请求携带的任何授权。通过应用程序默认凭据发现凭据的 Google 客户端库不会读取这些变量，因此无法找到凭据；仅支持`gcloud`和直接HTTPS调用。

<Warning>
不要将真实服务帐户 JSON 设置为沙箱环境变量。将其配置为 `workspace_secret` 或 `opaque` 代理值。明文 GCP 凭证值被拒绝。
</Warning>

GCP 身份验证规则与标头注入规则不同：- 将 `type` 设置为 `gcp`。
- 将凭据放在`gcp.service_account_json`下。
- 将 `gcp.scopes` 设置为 OAuth 范围的非空列表。
- 代理自动匹配`googleapis.com`及其子域，并使用配置的服务帐户对这些请求进行身份验证。 `google.com`下的主机不匹配。发送至匹配主机的纯文本 HTTP 会被拒绝，并显示 `403`。
- 每个沙箱最多配置一个 GCP 身份验证规则。该限制计算每个 GCP 规则，包括已禁用的规则。

SDK `gcp_auth` 和 `gcpAuth` 帮助程序构建了相同的规则形状。

```bash
curl -X POST "$LANGSMITH_ENDPOINT/v2/sandboxes/boxes" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "gcp-sandbox",
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

```python Python
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

```ts TypeScript
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

沙箱准备就绪后，使用`gcloud`或直接HTTPS调用`googleapis.com`正常在沙箱内的主机。代理应用真正的 GCP 身份验证，而不在沙箱内公开服务帐户 JSON。

## 单个 API 示例

创建一个沙箱，自动将 OpenAI API 密钥注入出站请求中：

```bash
curl -X POST "$LANGSMITH_ENDPOINT/v2/sandboxes/boxes" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "openai-sandbox",
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

对`api.openai.com`的请求现在由代理进行身份验证；沙箱中没有存储真正的密钥。拒绝在没有 API 密钥的情况下启动的 SDK 仍然需要一个占位符 - 使用规则的 `env_vars` 设置一个占位符，如 [GitHub example](#github-example) 中所示。

## 多个API示例添加多个规则以同时对多个服务进行身份验证：

```bash
curl -X POST "$LANGSMITH_ENDPOINT/v2/sandboxes/boxes" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "multi-api-sandbox",
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
      ]
    }
  }'
```

## GitHub 示例

[Open SWE](https://github.com/langchain-ai/open-swe/blob/main/agent/integrations/langsmith.py) 通过在沙箱外创建短期 GitHub 应用程序安装令牌来验证 GitHub 访问，然后使用只写 `opaque` 代理规则修补沙箱。这使得短暂的 GitHub 访问令牌远离沙箱文件系统和部署环境变量。

配置两条规则：

|主持人|标题|
|------|--------|
| `api.github.com` | `Authorization: Bearer <github-token>` 用于 `gh` 和 REST API 调用 |
| `github.com`、`*.github.com` | `Authorization: Basic <base64("x-access-token:<github-token>")>` 用于通过 HTTPS 操作的 Git，例如克隆、获取和推送 |

```python Python
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
            "env_vars": {"GH_TOKEN": "proxy-injected"},
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
        timeout=180.0,
    )
    response.raise_for_status()
```

创建或重新附加到沙箱后调用`configure_github_proxy`。 GitHub 应用程序安装令牌会过期，因此每当您重新使用沙箱进行新运行时，请刷新代理配置。

<Warning>
`PATCH` 替换储存的 `proxy_config` 批发。如果沙箱还使用`access_control`或`callbacks`，请将它们包含在每次更新中，否则它们将被删除。您留空的不透明标头值将从当前配置中继承。
</Warning>

`github-api` 规则将 `GH_TOKEN` 设置为非秘密占位符，这满足 `gh` CLI 的本地凭证检查。然后命令在没有每个命令前缀的情况下运行：

```bash
gh repo view langchain-ai/langchain
gh pr list --repo langchain-ai/langchain
gh repo clone langchain-ai/langchain
```占位符永远不会离开沙箱。代理将真实的 `Authorization` 标头注入出站请求中。

## 通过SDK配置

<CodeGroup>

```python Python
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

```ts TypeScript
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

回调与`proxy_config`下的规则一起配置：|领域|描述 |
|--------|-------------|
| `match_hosts` |要拦截的主机（与规则相同的语法；支持像`*.github.com`这样的通配符）。 |
| `url` |您的回调端点。必须是解析为公共地址的 `http://` 或 `https://` URL；私有、环回、Kubernetes 内部和云元数据目标被拒绝。 |
| `request_headers` |附加到代理 → 回调请求的标头，例如端点用于验证请求的 HMAC 或共享密钥。仅允许使用 `plaintext` 和 `opaque` 类型（不允许使用 `workspace_secret`）。 |
| `ttl_seconds` |必需的。在重新调用回调之前，已解析的标头会被缓存多长时间。必须介于 60 和 3600 之间。
| `full_request` |当`true`时，对匹配主机的每个请求都会调用回调（不缓存任何内容），并且正文包含`request`快照：`method`，`url`，`scheme`，`host`，`path`， `query`、`headers`，以及最多 1 MiB 的正文作为 `body_base64`（`body_truncated` 标记剪切）。 |

**静态规则获胜。** 如果启用的标头注入规则与主机和路径均匹配，则将跳过该请求的回调。在规则范围内，首场获胜；如果多个匹配，这同样适用于回调之间。

### 回调合约每当代理需要在缓存未命中时解析匹配主机的凭据时，都会发出以下请求：

```
POST <callback.url>
Content-Type: application/json
X-LangSmith-Signature-JWT: <signature>
<request_headers from your config, attached verbatim except Content-Type and X-LangSmith-Signature-JWT, which the proxy always sets>

{
  "host": "api.example.com",
  "port": 443,
  "identity": {
    "tenant_id": "<workspace-uuid>",
    "sandbox_id": "<sandbox-uuid>",
    "organization_id": "<organization-uuid>",
    "ls_user_id": "<creator-uuid>"
  }
}
```

`identity` 告诉您的端点哪个沙箱正在请求，因此一个回调 URL 可以为多个沙箱提供服务，并为每个沙箱或每个用户生成凭据。 `ls_user_id` 是创建用户，当使用工作区或服务密钥创建沙箱时将被省略。忽略您不认识的字段和标题；代理可能会添加更多。

您的端点必须使用 JSON 正文响应 `2xx`：

```json
{
  "headers": {
    "Authorization": "Bearer <token>",
    "X-Org-Id": "..."
  }
}
```

代理将响应中的每个标头注入沙箱的出站请求中，并缓存`ttl_seconds`的响应。任何非 2xx 响应、传输错误或格式错误的 JSON 都会失败关闭：沙箱的请求被拒绝，并显示 `502 callback resolution failed`（未注入标头，未缓存响应）。不遵循重定向并视为失败。

### 验证回调请求

`request_headers` 让您的端点检查您选择的共享密钥。要验证请求是否来自 LangSmith 并且在传输过程中未被更改，请检查 `X-LangSmith-Signature-JWT` 标头。它是使用 Ed25519 密钥 (`alg: EdDSA`) 签名的 JWT，其公共部分发布在 `<LANGSMITH_ENDPOINT>/.well-known/jwks.json`，由令牌的 `kid` 选择。|索赔 |预期值|
|--------|----------------|
| `iss` |您的 LangSmith 端点来源，例如`https://api.smith.langchain.com` |
| `sub` | `langsmith-sandbox-callback` |
| `aud` |您的回调 URL，与配置完全一致 |
| `exp` |发出后五分钟；拒绝过期令牌 |
| `body_sha256` |原始请求正文的十六进制 SHA-256 |

根据 JWKS 验证签名，检查上面的每项声明，对您收到的正文进行哈希处理，并将其与 `body_sha256` 进行比较。然后信任身体中的`identity`。

### 示例

当您自己的服务按需创建 OAuth 令牌时，请使用回调：

```bash
curl -X POST "$LANGSMITH_ENDPOINT/v2/sandboxes/boxes" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "snapshot_id": "<snapshot-uuid>",
    "name": "callback-sandbox",
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

```python Python
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

```ts TypeScript
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

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/sandbox-auth-proxy.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>