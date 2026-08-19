<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith CLI | https://docs.langchain.com/langsmith/langsmith-cli -->

# LangSmith CLI

LangSmith CLI 是一个用于查询和管理 LangSmith 数据的命令行工具。它是为开发人员和 AI 编码代理设计的，默认情况下输出人类可读的表格，并带有用于脚本编写的 `--format json` 选项。当您需要对 LangSmith 数据进行脚本化访问时，例如批量导出、自动化或让编码代理直接访问您的 [traces, runs, and datasets](/langsmith/observability-concepts)，请使用它。

## 安装

<CodeGroup>
```bash macOS / Linux (recommended)
curl -fsSL https://cli.langsmith.com/install.sh | sh
```

```powershell Windows
irm https://cli.langsmith.com/install.ps1 | iex
```

```bash Homebrew
brew install langchain-ai/tap/langsmith-cli
```

```powershell Scoop
scoop install langsmith-cli
```

```bash GitHub Releases
# Download the latest binary for your platform:
# https://github.com/langchain-ai/langsmith-cli/releases
```

```bash Go install
go install github.com/langchain-ai/langsmith-cli/cmd/langsmith@latest
```
</CodeGroup>

随时升级：

```bash
langsmith self-update
```

使用 `--dry-run` 标志即可预览更新而无需安装。

<Note>
查询 [SmithDB](/langsmith/smithdb-sdk-migration) 支持的部署需要 LangSmith CLI `v0.2.44` 或更高版本。
</Note>

## 验证

`langsmith auth login` 需要 LangSmith CLI `v0.2.30` 或更高版本。 `langsmith profile` 命令需要 LangSmith CLI `v0.2.26` 或更高版本。

推荐的本地设置是使用 OAuth 进行身份验证：

<Note>
`langsmith auth login` 还适用于来自 LangSmith CLI `v0.2.46` 及更高版本的自托管实例，前提是部署位于 LangSmith `0.16` 或更高版本上并启用了 OAuth 授权服务器（需要配置签名 JWKS）。参见[Self-hosted instances](#self-hosted-instances)。在早期部署中，或者没有签名 JWKS，请使用 API 密钥进行身份验证或创建 API 密钥配置文件。
</Note>

```bash
langsmith auth login
```这将打开基于浏览器的授权流程，并将 OAuth 令牌存储在所选 [profile](/langsmith/profile-configuration) 下的 `~/.langsmith/config.json` 中。选择带有 `--profile` 或 `LANGSMITH_PROFILE` 的配置文件：

```bash
langsmith auth login --profile dev
langsmith --profile dev project list
```

在无头环境中，传递 `--no-browser` 并手动打开打印的 URL：

```bash
langsmith auth login --no-browser --workspace-id <workspace-id>
```

要管理保存的配置文件：

```bash
langsmith profile list
langsmith profile create dev --workspace-id <workspace-id> --set-current
langsmith profile use dev
langsmith profile set-workspace <workspace-id>
```

有关完整配置文件配置参考，请参阅[Profile configuration](/langsmith/profile-configuration)。

您还可以直接使用 API 密钥进行身份验证。

将 [API key](/langsmith/create-account-api-key) 设置为环境变量：

```bash
export LANGSMITH_API_KEY="lsv2_..."
```

（可选）设置查询的默认项目：

```bash
export LANGSMITH_PROJECT="my-default-project"
```

如果您使用 LangSmith [self-hosted](/langsmith/self-hosted)，还请设置端点：

```bash
export LANGSMITH_ENDPOINT="https://your-langsmith-instance.com"
```

或者，将它们作为每个命令的标志传递：

```bash
langsmith --api-key lsv2_... trace list --project my-app
```

### 自托管实例

使用 `--api-url` 或 `LANGSMITH_ENDPOINT` 将 CLI 指向您的实例。支持基于浏览器的登录和 API 密钥。

<Tabs>
<Tab title="OAuth">
需要 LangSmith CLI `v0.2.46` 或更高版本，并在 LangSmith `0.16` 或更高版本上部署，并启用 OAuth 授权服务器。该图表在 `/api` 下公开了 OAuth 授权服务器，但这些端点在您配置签名 JWKS 之前保持惰性。有关设置步骤，请参阅[Enabling Remote MCP](/langsmith/langsmith-remote-mcp#enabling-remote-mcp)。当在 Helm 图表中设置 `config.hostname` 并配置签名 JWKS（通过 `config.signingJwks` 或 `config.existingSecretName` 中的密钥 `langsmith_signing_jwks`）时，OAuth 授权服务器会自动启用。如果没有签名 JWKS，OAuth 端点将处于非活动状态，并且 CLI 将收到 `404` — 请改用 API 密钥选项卡。

```bash
langsmith auth login --api-url https://langsmith.example.com --profile self-hosted
```

传递您实例的基本 URL。 CLI 读取部署的授权服务器元数据以查找 OAuth 端点，因此 `https://langsmith.example.com` 和 `https://langsmith.example.com/api` 都可以工作。

令牌存储在命名配置文件下，因此后面的命令只需要`--profile`：

```bash
langsmith --profile self-hosted project list
```
</Tab>

<Tab title="API key">
适用于每个 LangSmith 版本。

```bash
export LANGSMITH_ENDPOINT="https://langsmith.example.com"
export LANGSMITH_API_KEY="lsv2_..."

langsmith project list
```

要将端点和密钥另存为可重复使用的配置文件：

```bash
LANGSMITH_API_KEY="lsv2_..." langsmith profile create self-hosted \
  --api-url https://langsmith.example.com --set-current
```
</Tab>
</Tabs>

<Warning>
`LANGSMITH_ENDPOINT` 优先于配置文件的 `api_url`。如果在您的 shell 中进行了设置，则您选择的每个配置文件都会解析到该端点 - 这是在自托管配置文件处于活动状态时命令意外到达 LangSmith 云的常见原因。使用配置文件时取消设置它，或显式传递 `--api-url`。
</Warning>

## 快速入门

以下命令涵盖了核心资源类型：

```bash
# List tracing projects
langsmith project list

# List recent traces in a project
langsmith trace list --project my-app --limit 5

# Get a specific trace with full detail
langsmith trace get <trace-id> --project my-app --full

# List LLM runs with token counts
langsmith run list --project my-app --run-type llm --include-metadata

# Datasets and experiments
langsmith dataset list
langsmith experiment list --dataset my-eval-set

# Conversation threads
langsmith thread list --project my-chatbot

# Sandboxes
langsmith sandbox list
langsmith sandbox tunnel my-vm --remote-port 5432
```

## 输出格式

**默认**

人类可读的表格：

  ```bash
  langsmith trace list --project my-app
  ```

**JSON**

`--format json` 通过管道、脚本或将输出提供给代理：

  ```bash
  langsmith --format json trace list --project my-app
  ```**写入文件**

`-o <path>`：

  ```bash
  langsmith trace list --project my-app -o traces.json
  ```

## 命令

每个命令组都针对特定的 LangSmith 资源。大多数命令支持 `--limit`、`--offset` 和一组共享的 [filter flags](#filter-flags)。

### 列出项目

默认情况下最多返回 20 个项目，按最近的活动排序。仅列出跟踪项目。 （使用[⟦T66⟧](#view-experiments)列出评估实验。）

```bash
langsmith project list
langsmith project list --limit 50 --name-contains chatbot
langsmith --format json project list
```

### 查询痕迹

默认为最近 7 天，最新的在前。使用`--since`或`--last-n-minutes`更改时间窗口。

```bash
langsmith trace list --project my-app --limit 50 --last-n-minutes 60
langsmith trace list --project my-app --error                     # errors only
langsmith trace list --project my-app --min-latency 5             # slow traces (>5s)
langsmith trace list --project my-app --tags production           # filter by tag
langsmith trace list --project my-app --full                      # all fields
langsmith trace list --project my-app --show-hierarchy --limit 3  # include full run tree
langsmith trace get <trace-id> --project my-app --full
langsmith trace export ./traces --project my-app --limit 20 --full
```

### 查询运行

默认为 50 个结果（大多数其他命令默认为 20 个）。同样适用 7 天的时间窗口。使用 `--since` 或 `--last-n-minutes` 覆盖。

```bash
langsmith run list --project my-app --run-type llm
langsmith run list --project my-app --run-type tool --name search
langsmith run list --project my-app --min-tokens 1000 --include-metadata
langsmith run get <run-id> --full
langsmith run export llm_calls.jsonl --project my-app --run-type llm --full
```

### 查询线程

所有线程命令都需要`--project`。

```bash
langsmith thread list --project my-chatbot --last-n-minutes 120
langsmith thread get <thread-id> --project my-chatbot --full
```

### 管理数据集

`dataset export` 导出数据集中的示例（行），而不是数据集元数据本身。

```bash
langsmith dataset list
langsmith dataset list --name-contains eval
langsmith dataset get my-dataset
langsmith dataset create --name my-eval-set --description "QA pairs for v2"
langsmith dataset delete my-old-dataset --yes
langsmith dataset export my-dataset ./data.json --limit 500
langsmith dataset upload data.json --name new-dataset
```

### 管理示例

创建或列出时，使用 `--split` 将示例分配给命名拆分（例如 `test` 或 `train`）。

```bash
langsmith example list --dataset my-dataset --limit 50
langsmith example list --dataset my-dataset --split test
langsmith example create --dataset my-dataset \
  --inputs '{"question": "What is LangSmith?"}' \
  --outputs '{"answer": "A platform for LLM observability"}' \
  --split test
langsmith example delete <example-id> --yes
```

### 管理评估者

评估器可以离线（在实验期间针对数据集运行）或在线（针对实时项目运行）。使用 `--sampling-rate` 仅评估生产运行的一小部分，并使用 `--replace` 按名称覆盖现有评估器。

```bash
langsmith evaluator list
langsmith evaluator upload evals.py --name accuracy \
  --function check_accuracy --dataset my-eval-set
langsmith evaluator upload evals.py --name latency-check \
  --function check_latency --project my-app --sampling-rate 0.5
langsmith evaluator upload evals.py --name accuracy \
  --function check_accuracy_v2 --dataset my-eval-set --replace --yes
langsmith evaluator delete accuracy --yes
```

### 查看实验`experiment list` 显示评估实验，而不是跟踪项目。 （使用[⟦T79⟧](#list-projects)列出跟踪项目。）

```bash
langsmith experiment list
langsmith experiment list --dataset my-eval-set
langsmith experiment get my-experiment-2024-01-15
```

### 管理沙箱

沙箱命令允许您构建快照、创建沙箱、执行命令、打开交互式控制台以及将 TCP 端口隧道传输到沙箱内运行的服务。

有关完整的沙箱命令参考，请参阅 [Sandbox CLI](/langsmith/sandbox-cli)。

### 直接调用LangSmith API

`api` 命令是一个经过身份验证的、可编写脚本的包装器，围绕原始 LangSmith REST API - 对于上面键入的命令未涵盖的端点很有用，或者用于将 JSON 通过管道传入和传出 shell 脚本。它模仿 `gh api` 和 `curl`：将路径作为唯一的位置参数传递，并使用 `-X` 设置 HTTP 方法（默认为 `GET`）。身份验证标头（`x-api-key`、`x-tenant-id`）会自动注入。

```bash
# GET (default method) — query string supported in the path
langsmith api sessions?limit=5

# Discover endpoints from the OpenAPI spec
langsmith api ls --tag datasets
langsmith api info GET sessions

# Typed JSON fields with -F (numbers, booleans, null, objects, arrays parsed as JSON)
# Method auto-promotes to POST when -F/-f/--input/--body is supplied
langsmith api runs/query -F session_id=abc -F limit=10

# String-typed fields with -f (always sent as a JSON string, even if numeric)
langsmith api datasets -f name=my-dataset -f description="QA pairs"

# Other HTTP methods via -X
langsmith api sessions/abc-123 -X DELETE

# Send a request body from a file or stdin
langsmith api datasets --input create-dataset.json
echo '{"name":"test"}' | langsmith api sessions --input -

# Force GET with fields — fields go to the query string instead of a body
langsmith api runs -X GET -F limit=5 -F session=abc

# Inspect response status + headers
langsmith api sessions --include

# Add custom headers
langsmith api sessions -H "Accept: text/csv"
```

关键标志：|旗帜|短|默认|描述 |
|------|--------|---------|-------------|
| `--method` | `-X` | `GET` | HTTP 方法 |
| `--field` | `-F` | — |输入 JSON 字段为 `key=value`。可重复。使用 `@<path>` 或 `@-` 作为文件/标准输入值。 |
| `--raw-field` | `-f` | — |字符串 JSON 字段为 `key=value`。可重复。 |
| `--input` | — | — |用作请求正文的文件（`-` 对于标准输入）|
| `--body` | — | — |原始请求正文（JSON 字符串、`@file` 或 `@-` 对于标准输入）|
| `--header` | `-H` | — |附加标头为 `Key:Value`。可重复。 |
| `--include` | `-i` | `false` |在正文之前打印响应状态行和标题 |

`--input` 和 `--body` 是互斥的。子命令 `langsmith api ls` 和 `langsmith api info` 浏览并描述缓存的 OpenAPI 规范中的端点 — 传递 `--refresh` 进行重新获取。

## 过滤标志

大多数 `trace` 和 `run` 命令共享这些过滤器：|旗帜|描述 |示例|
|------|-------------|---------|
| `--project` |项目名称| `--project my-app` |
| `--limit, -n` |最大结果 | `-n 10` |
| `--offset` |分页偏移 | `--offset 20` |
| `--last-n-minutes` |覆盖 7 天默认值 | `--last-n-minutes 60` |
| `--since` | ISO 时间戳之后 | `--since 2024-01-15T00:00:00Z` |
| `--error` / `--no-error` |按错误状态过滤 | `--error` |
| `--name` |名称搜索（不区分大小写）| `--name ChatOpenAI` |
| `--run-type` |运行类型（`llm` 或 `tool`）| `--run-type llm` |
| `--min-latency` / `--max-latency` |延迟范围（以秒为单位）| `--min-latency 2.5` |
| `--min-tokens` |最低总代币 | `--min-tokens 1000` |
| `--tags` |标签，逗号分隔（OR 逻辑）| `--tags prod,v2` |
| `--filter` |原始LangSmith过滤器DSL | `--filter 'eq(status, "error")'` |
| `--trace-ids` |特定跟踪 ID | `--trace-ids abc123,def456` |

**详细标志** — 控制响应中包含哪些字段：

|旗帜|添加 |
|------|------|
| `--include-metadata` |状态、持续时间、代币、成本 |
| `--include-io` |输入、输出、错误 |
| `--include-feedback` |反馈统计 |
| `--full` |以上全部|
| `--show-hierarchy` |完整运行树（仅跟踪）|

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/langsmith-cli.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>