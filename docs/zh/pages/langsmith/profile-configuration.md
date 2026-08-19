<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Profile configuration | https://docs.langchain.com/langsmith/profile-configuration -->

# 配置文件配置

LangSmith SDK 配置文件允许您将 [API keys](/langsmith/create-account-api-key)、端点和工作区 ID 保存在可重用的 JSON 文件中，而不是在每个 shell 会话中设置相同的环境变量。

当您经常在 [LangSmith Cloud regions](/langsmith/cloud#regional-storage)、自托管实例或 [workspaces](/langsmith/administration-overview#workspaces) 之间切换时，或者当您希望远程运行时从已安装的文件加载相同的 SDK 配置时，请使用配置文件。

<Warning>
配置文件可以包含 API 密钥和 OAuth 刷新令牌。不要将它们提交到源代码控制、将它们烘焙到容器映像中或在日志中打印它们。像其他凭证一样小心地存储和安装它们。
</Warning>

## 最低版本

以下版本提供配置文件支持：

|工具或SDK |最低版本 |
| --- | --- |
| LangSmith CLI 配置文件命令 | `v0.2.26` |
| `langsmith auth login` | `v0.2.30` |
|去SDK | `v0.7.0` |
| Python SDK | `v0.8.1` |
| TypeScript SDK | `v0.6.1` |
| Java SDK | `v0.1.0-beta.3` |

## 配置文件位置

默认情况下，[SDKs](/langsmith/reference) 在以下位置查找配置文件：

```text
~/.langsmith/config.json
```

要使用不同的路径，请设置 `LANGSMITH_CONFIG_FILE`：

```shell
export LANGSMITH_CONFIG_FILE=/path/to/langsmith-config.json
```

TypeScript SDK 仅在类似 Node.js 的运行时中加载配置文件。浏览器和 Web Worker 运行时没有文件系统访问权限，因此在这些环境中显式传递配置。## 创建配置文件

使用 `profiles` 对象创建 `~/.langsmith/config.json`。每个配置文件可以定义：

|领域 |描述 |
| --- | --- |
| `api_url` | LangSmith API 端点。使用与 `LANGSMITH_ENDPOINT` 相同的值。 |
| `api_key` | LangSmith API 密钥。参见[Create an account and API key](/langsmith/create-account-api-key)。 |
| `workspace_id` |工作区 ID。当 API 密钥可以访问多个工作区时需要。 |
| `oauth` |由 LangSmith 工具创建的 OAuth 令牌元数据。 |

```json
{
  "current_profile": "dev",
  "profiles": {
    "dev": {
      "api_url": "https://api.smith.langchain.com",
      "api_key": "<LANGSMITH_API_KEY>",
      "workspace_id": "<WORKSPACE_ID>"
    },
    "eu": {
      "api_url": "https://eu.api.smith.langchain.com",
      "api_key": "<EU_LANGSMITH_API_KEY>",
      "workspace_id": "<EU_WORKSPACE_ID>"
    },
    "apac": {
      "api_url": "https://apac.api.smith.langchain.com",
      "api_key": "<APAC_LANGSMITH_API_KEY>",
      "workspace_id": "<APAC_WORKSPACE_ID>"
    }
  }
}
```

限制文件，以便只有您的用户可以读取它：

```shell
chmod 600 ~/.langsmith/config.json
```

## 选择一个配置文件

SDK 按以下顺序选择配置文件：

1. `LANGSMITH_PROFILE`，如果已设置。
1. 配置文件中的`current_profile`（如果已设置）。
1. 名为 `default` 的配置文件（如果存在）。

例如：

```shell
export LANGSMITH_PROFILE=eu
```

[LangSmith CLI](/langsmith/langsmith-cli) 还接受全局 `--profile` 标志，该标志优先于该命令的 `LANGSMITH_PROFILE`：

```shell
langsmith --profile eu project list
```

## 使用 CLI 管理配置文件

使用 [LangSmith CLI](/langsmith/langsmith-cli) 创建、检查、切换和删除配置文件，无需手动编辑 JSON 文件。

要从现有 API 密钥创建 API 密钥配置文件：

```shell
export LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
langsmith profile create dev \
  --workspace-id <WORKSPACE_ID> \
  --set-current
```

您还可以将密钥和端点作为标志传递。优先选择共享计算机上的环境变量，因为 shell 历史记录可能会记录命令标志。

```shell
langsmith profile create eu \
  --api-key <EU_LANGSMITH_API_KEY> \
  --api-url https://eu.api.smith.langchain.com \
  --workspace-id <EU_WORKSPACE_ID>
```

常用配置文件命令：|命令 |描述 |
| --- | --- |
| `langsmith profile list` |列出已保存的配置文件。别名：`langsmith profile ls`。 |
| `langsmith profile show <name>` |显示已保存的配置文件。秘密值在输出中被编辑。 |
| `langsmith profile use <name>` |在配置文件中设置`current_profile`。 |
| `langsmith profile set-workspace <workspace-id>` |为选定的配置文件设置默认工作区。 |
| `langsmith profile delete <name>` |删除已保存的配置文件。 |

默认情况下，输出是人类可读的表格。使用 `--format json` 进行可编写脚本的输出：

```shell
langsmith --format json profile list
```

## 使用`langsmith auth login`进行身份验证

运行 `langsmith auth login` 使用 OAuth 进行身份验证，而不是手动创建 API 密钥配置文件。该命令启动基于浏览器的设备授权流程，将 OAuth 令牌存储在所选配置文件中，并将该配置文件设置为当前配置文件。

<Note>
`langsmith auth login` 还适用于来自 LangSmith CLI `v0.2.46` 及更高版本的自托管实例，前提是部署位于 LangSmith `0.16` 或更高版本并启用了 OAuth 授权服务器。当在 Helm 图表中设置 `config.hostname` **并且配置了签名 JWKS（`config.signingJwks` 或`config.existingSecretName` 中的密钥 `langsmith_signing_jwks`）时，OAuth 授权服务器会自动启用。在早期部署中，或者如果未配置签名 JWKS，请改为创建 API 密钥配置文件。
</Note>

```shell
langsmith auth login
```

选择带有 `--profile` 或 `LANGSMITH_PROFILE` 的配置文件：

```shell
langsmith auth login --profile dev
```对于自托管实例，请传递其基本 URL。 CLI 读取部署的授权服务器元数据以查找 OAuth 端点：

```shell
langsmith auth login --api-url https://langsmith.example.com --profile self-hosted
```
自托管 OAuth 登录需要 Helm 图表 `0.16.0` 或更高版本以及签名 JWKS。配置请参见[Enabling Remote MCP](/langsmith/langsmith-remote-mcp#enabling-remote-mcp)。否则创建 API 密钥配置文件。

对于无头环境，禁止自动打开浏览器并传递工作区 ID：

```shell
langsmith auth login \
  --profile prod \
  --no-browser \
  --workspace-id <WORKSPACE_ID>
```

`langsmith auth login` 按以下顺序选择配置文件名称：

1. `--profile`，如果通过。
1. `LANGSMITH_PROFILE`，如果已设置。
1. 配置文件中的`current_profile`（如果已设置）。
1. `default`。

它按以下顺序选择 API URL：

1. `--api-url`，如果通过。
1. `LANGSMITH_ENDPOINT`，如果已设置。
1. 所选配置文件的 `api_url`（如果存在）。
1. 默认LangSmith云端点。

登录后，CLI 和 SDK 可以使用保存的配置文件。 CLI 在需要时刷新 OAuth 令牌，并将刷新的令牌字段写回配置文件。当未设置环境或构造函数 API 密钥身份验证时，SDK 还会使用配置文件中的 OAuth 访问令牌。

## 覆盖配置文件值

显式客户端构造函数参数和环境变量优先于配置文件值。|设置|优先级 |
| --- | --- |
|端点 |构造函数 `api_url` 或 `apiUrl`，然后是 `LANGSMITH_ENDPOINT`，然后是配置文件 `api_url`，然后是默认的 LangSmith 云端点。 |
|认证|构造函数 API 密钥，然后是 `LANGSMITH_API_KEY`，然后是配置文件 OAuth 访问令牌，然后是配置文件 `api_key`。 |
|工作空间 |构造函数`workspace_id`或`workspaceId`，然后是`LANGSMITH_WORKSPACE_ID`，然后是概要文件`workspace_id`。 |

旧的 `LANGCHAIN_API_KEY`、`LANGCHAIN_ENDPOINT` 和 `LANGCHAIN_WORKSPACE_ID` 别名仍然有效，但更喜欢新配置的 `LANGSMITH_*` 名称。

如果配置文件同时包含 `oauth.access_token` 和 `api_key`，则 SDK 首先使用 OAuth 访问令牌。如果存在 OAuth 刷新令牌并且访问令牌已过期或接近过期，SDK 可以刷新令牌并将更新的令牌字段写回配置文件。

<Note>
如果将配置文件安装为只读，OAuth 令牌刷新无法保留更新的令牌。只读安装适用于 API 密钥配置文件。仅当您有意依赖 OAuth 令牌刷新时才使用可写挂载。
</Note>

## 在代码中使用配置文件

当配置文件存在时，正常创建客户端：

<CodeGroup>

```python Python
from langsmith import Client

client = Client()
```

```typescript TypeScript
import { Client } from "langsmith";

const client = new Client();
```

</CodeGroup>

要覆盖代码中的配置文件，请显式传递值：

<CodeGroup>

```python Python
from langsmith import Client

client = Client(api_key="<LANGSMITH_API_KEY>")
```

```typescript TypeScript
import { Client } from "langsmith";

const client = new Client({ apiKey: "<LANGSMITH_API_KEY>" });
```

</CodeGroup>

## 在远程运行时挂载配置文件对于远程运行时，将配置文件挂载为秘密文件，并将 `LANGSMITH_CONFIG_FILE` 设置为挂载路径。请勿将文件复制到映像或存储库中。

### 码头工人

将本地配置文件目录挂载到容器中：

```shell
docker run --rm \
  -e LANGSMITH_CONFIG_FILE=/home/app/.langsmith/config.json \
  -e LANGSMITH_PROFILE=prod \
  -v "$HOME/.langsmith:/home/app/.langsmith:ro" \
  my-image
```

仅当配置文件使用 OAuth 刷新令牌时才使用读写挂载：

```shell
docker run --rm \
  -e LANGSMITH_CONFIG_FILE=/home/app/.langsmith/config.json \
  -e LANGSMITH_PROFILE=prod \
  -v "$HOME/.langsmith:/home/app/.langsmith" \
  my-image
```

### 库伯内特斯

从配置文件创建 Kubernetes 密钥：

```shell
kubectl create secret generic langsmith-profile \
  --from-file=config.json="$HOME/.langsmith/config.json"
```

安装该密钥并将 SDK 指向它：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  template:
    spec:
      containers:
        - name: app
          image: my-image
          env:
            - name: LANGSMITH_CONFIG_FILE
              value: /var/run/langsmith/config.json
            - name: LANGSMITH_PROFILE
              value: prod
          volumeMounts:
            - name: langsmith-profile
              mountPath: /var/run/langsmith
              readOnly: true
      volumes:
        - name: langsmith-profile
          secret:
            secretName: langsmith-profile
```

Kubernetes 秘密卷是只读的。为此模式使用 API 密钥配置文件，或者如果您的 OAuth 配置文件必须刷新并保留令牌，则使用可写秘密同步机制。

### 远程开发和 CI

在远程开发环境或 CI 作业中，将配置文件 JSON 存储在平台的秘密存储中，在运行时将其写入临时文件，并将 `LANGSMITH_CONFIG_FILE` 设置为该文件路径。

```shell
mkdir -p "$RUNNER_TEMP/langsmith"
printf '%s' "$LANGSMITH_PROFILE_JSON" > "$RUNNER_TEMP/langsmith/config.json"
chmod 600 "$RUNNER_TEMP/langsmith/config.json"
export LANGSMITH_CONFIG_FILE="$RUNNER_TEMP/langsmith/config.json"
export LANGSMITH_PROFILE=prod
```

对于托管的[LangSmith Cloud](/langsmith/cloud)，请将这些值配置为环境变量或[workspace secrets](/langsmith/set-up-hierarchy#configure-workspace-settings)，除非平台明确支持挂载机密文件。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/profile-configuration.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>