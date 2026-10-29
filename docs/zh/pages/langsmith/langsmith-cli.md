<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith CLI | https://docs.langchain.com/langsmith/langsmith-cli -->

# LangSmith CLI

从终端查询和管理代理跟踪、运行、数据集、评估器、实验、见解和线程

LangSmith CLI 是一个用于查询和管理 LangSmith 数据的命令行工具。它是为开发人员和人工智能编码代理设计的，默认情况下输出人类可读的表格，并带有用于脚本编写的`--format json`选项。当您需要对 LangSmith 数据进行脚本化访问时，例如批量导出、自动化或让编码代理直接访问您的 [traces, runs, and datasets](/langsmith/observability-concepts)，请使用它。

## 安装

```bash macOS / Linux (recommended) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -fsSL https://cli.langsmith.com/install.sh | sh
```

```powershell Windows theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
irm https://cli.langsmith.com/install.ps1 | iex
```

```bash Homebrew theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
brew install langchain-ai/tap/langsmith-cli
```

```powershell Scoop theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
scoop install langsmith-cli
```

```bash GitHub Releases theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Download the latest binary for your platform:
# https://github.com/langchain-ai/langsmith-cli/releases
```

```bash Go install theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
go install github.com/langchain-ai/langsmith-cli/cmd/langsmith@latest
```

随时升级：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith self-update
```

使用 `--dry-run` 标志即可预览更新而无需安装。

> [!注意]
>
> 查询 [SmithDB](/langsmith/smithdb-sdk-migration) 支持的部署需要 LangSmith CLI `v0.2.44` 或更高版本。

## 验证

CLI 通过`--project` 或`LANGSMITH_PROJECT` 选择代理环境。 [Retrieve that environment's ⟦T42⟧](/langsmith/create-an-agent#use-an-environment-project) 并将其用于这些选项。名为 `project` 的命令在 [backing trace storage](/langsmith/observability-concepts#agents-and-environments) 上运行。

`langsmith auth login` 需要 LangSmith CLI `v0.2.30` 或更高版本。 `langsmith profile` 命令需要 LangSmith CLI `v0.2.26` 或更高版本。

推荐的本地设置是使用 OAuth 进行身份验证：> [!注意]
>
> `langsmith auth login` 也适用于来自 LangSmith CLI `v0.2.46` 及更新版本的自托管实例，前提是部署位于 LangSmith `0.16` 或更高版本上并启用了 OAuth 授权服务器（需要配置签名 JWKS）。参见[Self-hosted instances](#self-hosted-instances)。在早期部署中，或者没有签名 JWKS，请使用 API 密钥进行身份验证或创建 API 密钥配置文件。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith auth login
```

这将打开基于浏览器的授权流程，并将 OAuth 令牌存储在所选 [profile](/langsmith/profile-configuration) 下的 `~/.langsmith/config.json` 中。选择带有 `--profile` 或 `LANGSMITH_PROFILE` 的配置文件：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith auth login --profile dev
langsmith --profile dev project list
```

在无头环境中，传递 `--no-browser` 并手动打开打印的 URL：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith auth login --no-browser --workspace-id <workspace-id>
```

要管理保存的配置文件：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith profile list
langsmith profile create dev --workspace-id <workspace-id> --set-current
langsmith profile use dev
langsmith profile set-workspace <workspace-id>
```

有关完整配置文件配置参考，请参阅[Profile configuration](/langsmith/profile-configuration)。

您还可以直接使用 API 密钥进行身份验证。

将 [API key](/langsmith/create-account-api-key) 设置为环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY="lsv2_..."
```

（可选）将代理环境设置为默认使用其`tracer_session_name`进行查询：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_PROJECT="<environment-tracer-session-name>"
```

如果您使用 LangSmith [self-hosted](/langsmith/self-hosted)，还需设置端点：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_ENDPOINT="https://your-langsmith-instance.com"
```

或者，将它们作为每个命令的标志传递：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith --api-key lsv2_... trace list --project "<environment-tracer-session-name>"
```

### 自托管实例

使用 `--api-url` 或 `LANGSMITH_ENDPOINT` 将 CLI 指向您的实例。支持基于浏览器的登录和 API 密钥。

**OAuth**需要 LangSmith CLI `v0.2.46` 或更高版本，并在 LangSmith `0.16` 或更高版本上部署，并启用 OAuth 授权服务器。该图表在`/api`下公开了OAuth授权服务器，但这些端点在您[configure a signing JWKS](/langsmith/kubernetes#configure-a-signing-jwks)之前保持惰性。

当在 Helm 图表中设置 `config.hostname` 并配置签名 JWKS（通过 `config.signingJwks` 或 `config.existingSecretName` 中的密钥 `langsmith_signing_jwks`）时，OAuth 授权服务器会自动启用。如果没有签名 JWKS，OAuth 端点将处于非活动状态，并且 CLI 将收到 `404` — 请改用 API 密钥选项卡。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith auth login --api-url https://langsmith.example.com --profile self-hosted
```

传递您实例的基本 URL。 CLI 读取部署的授权服务器元数据以查找 OAuth 端点，因此 `https://langsmith.example.com` 和 `https://langsmith.example.com/api` 都可以工作。

令牌存储在命名配置文件下，因此后面的命令只需要`--profile`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith --profile self-hosted project list
```

**API 密钥**

适用于每个 LangSmith 版本。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_ENDPOINT="https://langsmith.example.com"
export LANGSMITH_API_KEY="lsv2_..."

langsmith project list
```

要将端点和密钥另存为可重复使用的配置文件：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LANGSMITH_API_KEY="lsv2_..." langsmith profile create self-hosted \
  --api-url https://langsmith.example.com --set-current
```> [!警告]
>
> `LANGSMITH_ENDPOINT` 优先于配置文件的 `api_url`。如果在您的 shell 中进行了设置，则您选择的每个配置文件都会解析到该端点 - 这是在自托管配置文件处于活动状态时命令意外到达 LangSmith 云的常见原因。使用配置文件时取消设置它，或显式传递 `--api-url`。

## 快速入门

以下命令涵盖了核心资源类型：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# List tracing projects
langsmith project list

# List recent traces in a project
langsmith trace list --project "<environment-tracer-session-name>" --limit 5

# Get a specific trace with full detail
langsmith trace get <trace-id> --project "<environment-tracer-session-name>" --full

# List LLM runs with token counts
langsmith run list --project "<environment-tracer-session-name>" --run-type llm --include-metadata

# Datasets and experiments
langsmith dataset list
langsmith experiment list --dataset my-eval-set

# Conversation threads
langsmith thread list --project "<environment-tracer-session-name>"

# Sandboxes
langsmith sandbox list
langsmith sandbox tunnel my-vm --remote-port 5432
```

## 输出格式

**默认**

人类可读的表格：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith trace list --project "<environment-tracer-session-name>"
```

**JSON**

`--format json` 通过管道、脚本或将输出提供给代理：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith --format json trace list --project "<environment-tracer-session-name>"
```

**写入文件**

`-o <path>`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith trace list --project "<environment-tracer-session-name>" -o traces.json
```

## 命令

每个命令组都针对特定的 LangSmith 资源。大多数命令支持 `--limit`、`--offset` 和一组共享的 [filter flags](#filter-flags)。

### 列出跟踪存储目的地

旧版 `project list` 命令列出了后备跟踪存储目标，包括与代理环境关联的目标。默认情况下，它最多返回 20 个，并按最近的活动排序。使用[⟦T77⟧](#view-experiments)列出评估实验。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith project list
langsmith project list --limit 50 --name-contains chatbot
langsmith --format json project list
```

### 查询痕迹

默认为最近 7 天，最新的在前。使用`--since`或`--last-n-minutes`更改时间窗口。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith trace list --project "<environment-tracer-session-name>" --limit 50 --last-n-minutes 60
langsmith trace list --project "<environment-tracer-session-name>" --error                     # errors only
langsmith trace list --project "<environment-tracer-session-name>" --min-latency 5             # slow traces (>5s)
langsmith trace list --project "<environment-tracer-session-name>" --tags production           # filter by tag
langsmith trace list --project "<environment-tracer-session-name>" --full                      # all fields
langsmith trace list --project "<environment-tracer-session-name>" --show-hierarchy --limit 3  # include full run tree
langsmith trace get <trace-id> --project "<environment-tracer-session-name>" --full
langsmith trace export ./traces --project "<environment-tracer-session-name>" --limit 20 --full
```

### 查询运行默认为 50 个结果（大多数其他命令默认为 20 个）。同样适用 7 天的时间窗口。使用 `--since` 或 `--last-n-minutes` 覆盖。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith run list --project "<environment-tracer-session-name>" --run-type llm
langsmith run list --project "<environment-tracer-session-name>" --run-type tool --name search
langsmith run list --project "<environment-tracer-session-name>" --min-tokens 1000 --include-metadata
langsmith run get <run-id> --full
langsmith run export llm_calls.jsonl --project "<environment-tracer-session-name>" --run-type llm --full
```

### 查询线程

所有线程命令都需要`--project`。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith thread list --project "<environment-tracer-session-name>" --last-n-minutes 120
langsmith thread get <thread-id> --project "<environment-tracer-session-name>" --full
```

### 管理数据集

`dataset export` 导出数据集中的示例（行），而不是数据集元数据本身。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith example list --dataset my-dataset --limit 50
langsmith example list --dataset my-dataset --split test
langsmith example create --dataset my-dataset \
  --inputs '{"question": "What is LangSmith?"}' \
  --outputs '{"answer": "A platform for LLM observability"}' \
  --split test
langsmith example delete <example-id> --yes
```

### 管理评估者

评估器可以离线（在实验期间针对数据集运行）或在线（针对代理环境运行）。使用 `--sampling-rate` 仅评估生产运行的一小部分，并使用 `--replace` 按名称覆盖现有评估器。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith evaluator list
langsmith evaluator upload evals.py --name accuracy \
  --function check_accuracy --dataset my-eval-set
langsmith evaluator upload evals.py --name latency-check \
  --function check_latency --project "<environment-tracer-session-name>" --sampling-rate 0.5
langsmith evaluator upload evals.py --name accuracy \
  --function check_accuracy_v2 --dataset my-eval-set --replace --yes
langsmith evaluator delete accuracy --yes
```

### 查看实验

`experiment list`展示了评估实验。使用 [⟦T90⟧](#list-projects) 作为与代理环境关联的跟踪存储目标。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith experiment list
langsmith experiment list --dataset my-eval-set
langsmith experiment get my-experiment-2024-01-15
```

### 管理见解

`insights` 命令创建、运行和读取 [Insights](/langsmith/insights) 报告，这些报告将代理环境的跟踪分为不同类别，以显示使用模式和故障模式。每个 `insights` 命令都需要 `--project`、`--project-id` 或 `LANGSMITH_PROJECT` 环境变量。

> [!注意]
>
> `insights create`、`insights run` 和 `insights config` 需要 LangSmith CLI v0.2.60 或更高版本。要创建报告，请在 JSON 文件中定义它：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "name": "Weekly reliability review",
  "summary_prompt": "Identify the request and outcome: {{run.inputs}} {{run.outputs}}",
  "last_n_hours": 168,
  "filter": "eq(is_root, true)",
  "model": "openai",
  "schedule_cron": "0 9 * * 1"
}
```

* **`name`** 和 **`summary_prompt`**：必填。 [summary prompt](/langsmith/insights#summary-prompt) 是 Mustache 模板，必须至少引用 `{{run.inputs}}`、`{{run.outputs}}`、`{{run.error}}`、`{{run.feedback}}` 或 `{{all_thread_messages}}` 之一。 CLI 不支持自动模式，因此请说明报告应在此提示中查找的内容。
* **`last_n_hours`**，或 **`start_time`** 和 **`end_time`**：采样迹线的时间范围。使用一种形式，而不是同时使用两种形式。
* **`model`**：`openai`（默认）或`anthropic`。要选择特定型号，请将 **`cluster_model`** 和 **`summary_model`** 设置在一起，分别设置为 `openai`、`anthropic` 或 [model configuration](/langsmith/model-configurations) UUID。不接受显示名称。
* **`schedule_cron`**：循环报告的 cron 表达式。第一个作业立即开始，后面的作业按照时间表进行。对于一次性报告，请忽略它。

该文件还接受 `filter`、`sample`、`hierarchy`、`partitions`、`attribute_schemas` 和 `description`。未知字段会导致错误。

`insights create` 将文件保存为作业配置并启动第一个报告。报告异步运行并产生模型成本。工作区需要所选模型的机密。通过`--wait`进行轮询，直到报告成功或失败，最长持续30分钟。通过 `--config -` 从标准输入读取文件。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith insights create --project "<environment-tracer-session-name>" --config insights.json
langsmith insights create --project "<environment-tracer-session-name>" --config insights.json --wait
````insights run` 从保存的配置启动新报告，而不更改配置或其计划：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith insights config list --project "<environment-tracer-session-name>"
langsmith insights config list --project "<environment-tracer-session-name>" --include-prebuilt
langsmith insights run <config-id> --project "<environment-tracer-session-name>" --wait
```

`insights list` 返回报告及其状态和类别计数。 `insights get` 添加执行摘要、突出显示的跟踪和每个类别的统计信息：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith insights list --project "<environment-tracer-session-name>" --limit 5
langsmith insights get <insight-id> --project "<environment-tracer-session-name>"
```

`insights config update` 以相同格式替换 JSON 文件中的配置名称和分析设置。它不会启动报告。省略 `description` 或 `schedule_cron` 以保留当前值，或将 `schedule_cron` 设置为 `null` 以停止计划。 `insights config delete` 删除配置及其生成的每个报告。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith insights config update <config-id> --project "<environment-tracer-session-name>" --config insights.json
langsmith insights config delete <config-id> --project "<environment-tracer-session-name>" --yes
```

### 管理沙箱

沙箱命令允许您构建快照、创建沙箱、执行命令、打开交互式控制台以及将 TCP 端口隧道传输到沙箱内运行的服务。

有关完整的沙箱命令参考，请参阅 [Sandbox CLI](/langsmith/sandbox-cli)。

### 管理自定义应用程序

`langsmith apps` 命令脚手架，在本地运行并发布 [custom apps](/langsmith/custom-apps)，在 LangSmith 内运行的 UI 并调用 LangSmith API。

完整的命令列表请参见[CLI reference](/langsmith/custom-apps#cli-reference)。

### 直接调用LangSmith API`api` 命令是一个经过身份验证的、可编写脚本的包装器，围绕原始 LangSmith REST API - 对于上面键入的命令未涵盖的端点很有用，或者用于将 JSON 通过管道传入和传出 shell 脚本。它模仿 `gh api` 和 `curl`：将路径作为唯一的位置参数传递，并使用 `-X` 设置 HTTP 方法（默认为 `GET`）。身份验证标头（`x-api-key`、`x-tenant-id`）会自动注入。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

关键标志：

|旗帜|短|默认|描述 |
| - | - | - | - |
| `--method` | `-X` | `GET` | HTTP 方法 |
| `--field` | `-F` | — |输入 JSON 字段为 `key=value`。可重复。使用 `@<path>` 或 `@-` 作为文件/标准输入值。 |
| `--raw-field` | `-f` | — |字符串 JSON 字段为 `key=value`。可重复。 |
| `--input` | — | — |用作请求正文的文件（`-` 对于标准输入）|
| `--body` | — | — |原始请求正文（JSON 字符串、`@file` 或 `@-` 对于标准输入）|
| `--header` | `-H` | — |附加标头为 `Key:Value`。可重复。 |
| `--include` | `-i` | `false` |在正文之前打印响应状态行和标题 |

`--input` 和 `--body` 是互斥的。子命令 `langsmith api ls` 和 `langsmith api info` 浏览并描述缓存的 OpenAPI 规范中的端点 — 传递 `--refresh` 进行重新获取。

## 过滤标志大多数 `trace` 和 `run` 命令共享这些过滤器：

|旗帜|描述 |示例|
| - | - | - |
| `--project` |代理环境的`tracer_session_name` | `--project "<environment-tracer-session-name>"` |
| `--limit, -n` |最大结果 | `-n 10` |
| `--offset` | Pagination offset | `--offset 20` |
| `--last-n-minutes` |覆盖 7 天默认值 | `--last-n-minutes 60` |
| `--since` | ISO 时间戳之后 | `--since 2024-01-15T00:00:00Z` |
| `--error` / `--no-error` |按错误状态过滤 | `--error` |
| `--name` |名称搜索（不区分大小写）| `--name ChatOpenAI` |
| `--run-type` |运行类型（`llm` 或 `tool`）| `--run-type llm` |
| `--min-latency` / `--max-latency` |延迟范围（以秒为单位）| `--min-latency 2.5` |
| `--min-tokens` | Minimum total tokens | `--min-tokens 1000` |
| `--tags` |标签，逗号分隔（OR 逻辑）| `--tags prod,v2` |
| `--filter` |原始LangSmith过滤器DSL | `--filter 'eq(status, "error")'` |
| `--trace-ids` | Specific trace IDs | `--trace-ids abc123,def456` |

**详细标志** — 控制响应中包含哪些字段：

|旗帜|添加 |
| - | - |
| `--include-metadata` |状态、持续时间、代币、成本 |
| `--include-io` | Inputs, outputs, error |
| `--include-feedback` | Feedback stats |
| `--full` | All of the above |
| `--show-hierarchy` |完整运行树（仅跟踪）|

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/langsmith-cli.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。