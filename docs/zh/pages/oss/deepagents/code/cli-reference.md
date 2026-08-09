<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Command reference | https://docs.langchain.com/oss/deepagents/code/cli-reference -->

# 命令参考

Deep Agents Code 命令行标志和管理子命令

深度代理代码 (`dcode`) 在启动时接受命令行标志，并公开工具、代理、会话、技能、凭证和配置的管理子命令。当您需要从 shell 覆盖默认值、在脚本中运行非交互式任务或在不打开会话的情况下自动执行管理时，请使用此页面作为参考。安装和日常交互使用请参见[Quickstart](/oss/deepagents/code/quickstart)。有关 CLI 标志如何适应更广泛的配置模型，请参阅 [Configuration](/oss/deepagents/code/configuration)。

## 用法示例

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Use a specific agent configuration
dcode --agent mybot

# Use a specific model (provider:model format or auto-detect)
dcode --model anthropic:claude-opus-4-8
dcode --model gpt-5.5

# Auto-approve tool usage (skip human-in-the-loop prompts)
dcode -y

# List directory contents, then summarize directory as first prompt—the command runs first, then the prompt is submitted
# The prompt does NOT have access to the command output
dcode --startup-cmd "ls -la" -m "Summarize what's in this directory"

# Non-interactive with startup command: show git status before the task runs
# The task does NOT have access to the command output
dcode --startup-cmd "git diff --stat" -n "Review these changes"
```

## 选择型号

使用 `--model` (`-M`) 启动，将模型固定在一个会话中。使用 `provider:model` 格式（例如，`openai:gpt-5.5`）或在提供者明确时传递裸模型名称：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode --model anthropic:claude-opus-4-8
dcode --model openai:gpt-5.5
dcode --model fireworks:accounts/fireworks/models/deepseek-v4-pro
```

当 Deep Agents Code 在没有 `--model` 的情况下启动时，它按以下顺序解析模型：

1. **`--model` 标志**（如果提供）。
2. **`[models].default`** 在`~/.deepagents/config.toml`。
3. **`[models].recent`** in `~/.deepagents/config.toml`（在会话中切换模型时自动写入）。
4. **环境自动检测**：`OPENAI_API_KEY`、`ANTHROPIC_API_KEY`、`GOOGLE_API_KEY`、`GOOGLE_CLOUD_PROJECT`（Vertex AI）中第一个可用的凭证。其他提供程序（例如 Groq 或 Fireworks）仍然可以通过 `--model` 或保存的默认值使用，即使它们不属于启动自动检测列表。有关完整的提供商列表和凭证设置，请参阅[Model providers](/oss/deepagents/code/providers)。

### 设置或清除默认模型

为所有未来的发布保留默认模型：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Set the default
dcode --default-model anthropic:claude-opus-4-8

# View the current default
dcode --default-model

# Clear the default
dcode --clear-default-model
```

您还可以从交互式 `/model` 切换器 (`Ctrl+S`) 固定默认值或在 `config.toml` 中设置 `[models].default`。参见[Set a default model](/oss/deepagents/code/providers#set-a-default-model)。

### 模型参数和配置文件覆盖

使用 `--model-params` 作为 JSON 字符串将额外的构造函数 kwargs 传递给模型。这些仅适用于当前会话并覆盖 `config.toml` 提供者参数：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode --model openai:gpt-5.5 --model-params '{"reasoning": {"effort": "high"}}'
dcode --model anthropic:claude-opus-4-8 --model-params '{"thinking": {"type": "enabled", "budget_tokens": 10000}, "max_tokens": 16000}'
```

使用 `--profile-override` 覆盖 [model profile](/oss/python/langchain/models#model-profiles) 字段（例如，`max_input_tokens`）。值在配置文件覆盖之上合并并在会话中`/model`热交换中持续存在：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode --profile-override '{"max_input_tokens": 4096}'
dcode --model google_genai:gemini-3.6-flash --profile-override '{"max_input_tokens": 4096}'
```

对于暂时性错误的重试计数，请使用 `--max-retries` 或 `config.toml` 中的 `[retries]` 部分。参见[Model parameters](/oss/deepagents/code/providers#model-parameters)和[Profile overrides](/oss/deepagents/code/config-file#profile-overrides-advanced)。

### 安装提供商附加功能

可选的提供程序和沙箱包作为额外内容提供。从 shell 安装而不启动会话：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode --install groq
dcode --install fireworks
dcode --install ollama
```添加 `--package` 以通过 `uv --with` 安装任意提供程序包（请参阅 [Arbitrary providers](/oss/deepagents/code/config-file#arbitrary-providers)），并添加 `--yes` 以跳过确认提示。要在初始 CLI 安装期间预安装附加功能，请设置 `DEEPAGENTS_CODE_EXTRAS`（例如，`DEEPAGENTS_CODE_EXTRAS="groq,fireworks"`）。

## 代理和会话

使用 `-a`/`--agent` 启动具有自己记忆、技能的指定代理，以及 `~/.deepagents/<agent_name>/` 下的 `AGENTS.md`。该标志覆盖 `config.toml` 中的 `[agents].default` 和 `[agents].recent`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode --agent backend-dev
```

恢复之前与`-r`/`--resume`的对话。不传递 ID 以打开最近的线程，或传递线程 ID 以恢复特定会话。恢复绕过代理选择标志并恢复线程的原始代理：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode -r
dcode -r abc123-thread-id
```

列出和删除带有 `dcode threads list` 和 `dcode threads delete` 的会话。请参阅 [Memory and skills](/oss/deepagents/code/memory-and-skills) 了解每个代理内存的工作原理。

## 非交互模式和管道

使用 `-n`/`--non-interactive` 在没有交互式 UI 的情况下运行单个任务。每个非交互式运行都会启动一个新线程；基于文件的状态（内存、技能、配置）在调用中持续存在：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode -n "Write a Python script that prints hello world"
```

当标准输入通过管道传输时，深度代理代码会自动以非交互方式运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
echo "Explain this code" | dcode
cat error.log | dcode -n "What's causing this error?"
git diff | dcode -n "Review these changes"
```当您将管道输入与 `-n` 或 `-m` 组合时，管道内容首先出现，然后是标志文本。最大管道输入大小为 10 MiB。使用 `--stdin` 显式从 stdin 读取而不是自动检测。

### 输出、限制和 shell 访问

使用 `-q`/`--quiet` 仅在 stdout 上发出代理的响应（用于通过管道传输到其他命令）。添加 `--no-stream` 以在写入之前缓冲完整响应：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode -n "Generate a .gitignore for Python" -q > .gitignore
dcode -n "List dependencies" -q --no-stream | sort
```

Cap 代理以 `--max-turns` 或 `--timeout` 在 CI 中运行。当超出预算时，两者都会以代码 124 退出。需要 `-n` 或管道标准输入：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode -n "fix the failing tests" --max-turns 10
dcode -n "run the test suite and summarise failures" --timeout 120
```

默认情况下，在非交互模式下禁用 Shell 执行。使用`-S`/`--shell-allow-list`启用它：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode -n "Run the tests and fix failures" -S "pytest,git,make"
dcode -n "Build the project" -S recommended
dcode -n "Fix the build" -S all
```

<Warning>
  `-S all` 让代理执行任意 shell 命令，无需人工确认。
</Warning>

有关更多示例和跟踪设置，请参阅[Non-interactive mode and piping](/oss/deepagents/code/quickstart#non-interactive-mode-and-piping)。

## 启动时的技能

`--skill` 标志在交互式或非交互式模式下启动时立即调用技能：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode --skill code-review
dcode --skill code-review -m 'review the auth module'
cat diff.txt | dcode --skill code-review -n 'review this patch'
dcode --skill code-review -n 'review this patch' -q
```

`--skill` 与 `--quiet` 或 `--no-stream` 需要 `-n`。使用 `dcode skills list`、`create`、`info` 和 `delete` 管理技能。参见[Memory and skills](/oss/deepagents/code/memory-and-skills)。

## 脚本中的评分标准

非交互式运行无法暂停以进行交互式目标审核。当标准已知时，通过`--rubric`通过验收标准：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode -n "implement OAuth refresh handling" --rubric "tests pass; no unrelated files changed"
dcode -n "implement OAuth refresh handling" --rubric @acceptance.md
```分别设置分级机模型和迭代限制：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode -n "implement OAuth refresh handling" \
  --rubric "tests pass; no unrelated files changed" \
  --rubric-model openai:gpt-5.5 \
  --rubric-max-iterations 3
```

所有标题标志都需要 `-n` 或管道标准输入。参见[Goals and rubrics](/oss/deepagents/code/goals-and-rubrics)。

## 人机交互和 shell 访问

默认情况下，具有潜在破坏性的工具调用需要获得批准。有三种[approval modes](/oss/deepagents/code/approval-modes)可供选择：默认的手动模式需要在所有检查点进行确认，自动模式（`-y`/`--auto-approve`）使用LLM分类器，YOLO（`--yolo`）运行门控操作而无需审核。在与 `Shift+Tab` 的交互会话期间在手动和自动之间切换：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode -y
dcode --yolo
```

`-S`/`--shell-allow-list` 标志适用于交互和非交互模式。传递以逗号分隔的命令名称列表，`recommended`用于安全只读默认值，或`all`以允许任何命令。您还可以在环境中设置`DEEPAGENTS_CODE_SHELL_ALLOW_LIST`。

## 限制文件系统工具

默认情况下，Deep Agents Code 公开所有文件系统工具。要仅公开子集，请传递逗号分隔的列表：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode -n "Audit this repository" --allow-fs-tools ls,read_file,glob,grep
```

有效名称为 `ls`、`read_file`、`write_file`、`edit_file`、`delete`、`glob`、`grep` 和 `execute`。显式列表必须包含`read_file`。允许列表适用于每个会话模式下的主代理和同步子代理，但不适用于异步子代理或非文件系统工具。<Note>
  `--allow-fs-tools` 和 `-S`/`--shell-allow-list` 控制不同层的 shell 访问：

  * **`--allow-fs-tools`** 控制哪些文件系统工具可用。 Shell 访问需要`execute`。
  * **`-S`/`--shell-allow-list`** 通过`execute` 控制允许哪些 shell 命令。它不会影响其他文件系统工具。

  | `--allow-fs-tools` 包括`execute`？ | `-S` 设置了吗？ |外壳访问 |
  | -------------------------------------- | ---------| -------------------------------------------------------------------------------------- |
  |是的 |是的 |允许运行的命令（交互式确认；非交互式自动批准）|
  |是的 |没有 |工具存在，但没有预先批准命令 |
  |没有 |是的 |没有 shell 访问权限 — `execute` 不存在，因此 `-S` 没有什么可门控的 |
  |没有 |没有 |没有 shell 访问权限 |

  在非交互模式下，传递两者以启用命令，无需人工批准：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  dcode -n "Fix the failing tests" --allow-fs-tools execute -S "pytest,git,make"
  ```
</Note>在会话中运行 `/tools` 以检查活动工具集。在 shell 中，将工具调整标志放在子命令之前：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode tools list
dcode --allow-fs-tools ls,read_file tools list
dcode --allow-fs-tools ls,read_file tools list --json
```

## 启动命令和初始提示

使用 `-m`/`--message` 在交互式会话开始时自动提交初始提示。结合 `--startup-cmd` 首先运行 shell 命令：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode --startup-cmd "git diff --stat" -m "Summarize these changes"
```

`--startup-cmd` 输出呈现在文字记录中供您参考，但**不会**添加到代理的消息历史记录中。要将命令输出传递给代理，请通过 stdin 进行管道传输：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
git diff | dcode -n "Review these changes"
```

`--startup-cmd` 的非零退出和超时会发出警告，但不会中止会话。非交互模式对启动命令应用 60 秒的超时。

## 远程沙箱

使用 `--sandbox` 将代码执行路由到远程沙箱。内置提供程序包括 `langsmith`、`agentcore`、`daytona`、`modal`、`runloop` 和 `vercel`。还接受第三方和配置声明的提供程序。传递 `--sandbox`，但没有使用 `config.toml` 中的 `[sandboxes].default` 的价值：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode --sandbox langsmith
dcode --sandbox runloop --sandbox-id dbx_abc123
dcode --sandbox modal --sandbox-setup ./setup.sh
dcode --sandbox
```

<Note>
  由于 `--sandbox` 接受可选值，因此请在命令行上保留裸形式**最后**。否则，以下参数（例如，`dcode --sandbox agents`）将被用作标志的值。
</Note>使用 `dcode --install` 安装沙箱附加功能（例如 `dcode --install daytona` 或 `dcode --install all-sandboxes`）。请参阅 [Remote sandboxes](/oss/deepagents/code/remote-sandboxes) 了解提供程序设置、工作目录和第三方提供程序。

## MCP 标志

控制 MCP 服务器启动时加载：

|旗帜|行为 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `--mcp-config PATH` |添加显式配置作为最高优先级源（合并在自动发现的配置之上）|
| `--no-mcp` |完全禁用 MCP |
| `--trust-project-mcp` |信任项目级服务器，而不提示当前运行。被用户策略拒绝的服务器仍处于禁用状态。 |

`--mcp-config` 和 `--no-mcp` 是互斥的。在非交互模式下，除非通过 `--trust-project-mcp`，否则将静默跳过没有匹配保存或环境批准的项目服务器：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode --trust-project-mcp
dcode -n "run tests" --trust-project-mcp
```

对标记为 `auth: "oauth"` 和 `dcode mcp login <server>` 的 MCP 服务器运行 OAuth 登录。请参阅[MCP tools](/oss/deepagents/code/mcp-tools)。

## 命令行选项|选项 |描述 |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- || `-a`、`--agent NAME` |使用具有独立内存的命名代理。覆盖 `config.toml` 中的 `[agents].recent` 和 `[agents].default`。默认值：`agent`（如果设置了`[agents].recent`，则为最近使用的代理）|
| `-M`、`--model MODEL` |使用特定型号（`provider:model`）|
| `--model-params JSON` |额外的 kwargs 作为 JSON 字符串传递给模型（例如，`'{"temperature": 0.7}'`）|| `--max-retries N` |覆盖瞬态模型错误的最大重试次数 |
| `--default-model [MODEL]` |设置[default model](/oss/deepagents/code/providers#set-a-default-model)（省略`MODEL`查看当前默认值） |
| `--clear-default-model` |清除[default model](/oss/deepagents/code/providers#set-a-default-model) || `-r`、`--resume [ID]` |恢复会话：`-r` 对于最近的会话，`-r <ID>` 对于特定线程 |
| `-m`、`--message TEXT` |会话开始时自动提交的初始提示（交互模式） || `--skill NAME` |在启动时调用技能 |
| `--startup-cmd CMD` |在启动时、第一个提示符之前运行的 Shell 命令。输出呈现在文字记录中供您参考，但**不**添加到代理的消息历史记录中。要将命令输出传递给代理，请通过标准输入将其输入（例如，`git diff \| dcode -n "Review these changes"`）。非零退出和超时会发出警告但不会中止；非交互模式应用 60 秒超时。 |
| `--rubric TEXT\|@PATH` |评分细则的接受标准。接受文字文本或 `@path` 来读取文件。需要 `-n` 或管道标准输入 || `--rubric-model MODEL` |对评分者使用的评分标准进行建模。默认为主代理模型。需要 `-n` 或管​​道标准输入 |
| `--rubric-max-iterations N` |在停止之前，评分者对每个评分标准的尝试进行迭代。需要 `-n` 或管道标准输入 |
| `-n`、`--non-interactive TEXT` |以非交互方式运行单个任务并退出。除非设置了 `--shell-allow-list`，否则 Shell 将被禁用 || `--recursion-limit N` | LangGraph 图步骤预算（每轮最大节点调用数）。有效范围：`25`–`100000`。超出范围或非整数值会记录警告并回退到默认值 (`2000`)。覆盖 `config.toml` 中的 `DEEPAGENTS_CODE_RECURSION_LIMIT` 和 `[runtime].recursion_limit` |
| `--max-turns N` | Cap Agentic 转入非交互模式。超出时以代码 124 退出。需要 `-n` 或管道标准输入。请参阅[Non-interactive mode and piping](#non-interactive-mode-and-piping) |
| `--timeout SECONDS` |非交互模式的硬挂钟超时。超出时以代码 124 退出。需要 `-n` 或管道标准输入。请参阅[Non-interactive mode and piping](#non-interactive-mode-and-piping) || `-q`、`--quiet` |管道的干净输出 - 只有代理的响应才会发送到标准输出。需要 `-n` 或管道标准输入 |
| `--no-stream` |缓冲完整响应并立即写入标准输出而不是流式传输。需要 `-n` 或管道标准输入 || `--stdin` |显式从 stdin 读取输入而不是自动检测。当 stdin 不可用或者是 TTY 时明显出现错误 |
| `-y`、`--auto-approve` |启用分类器支持的[Auto](/oss/deepagents/code/approval-modes)模式。需要交互式本地会话；在交互式会话期间使用 `Shift+Tab` 进行切换 |
| `--auto-classifier-model MODEL` | [Auto classifier](/oss/deepagents/code/approval-modes#select-a-classifier-model) 用于审查门控工具调用的模型（`provider:model` 格式）。覆盖 `config.toml` 中的 `DEEPAGENTS_CODE_AUTO_CLASSIFIER_MODEL` 和 `[models].auto_classifier`。仅限交互式 TUI 会话 || `--yolo` |在一次性本地风险确认后，无需审查即可运行门控操作。仅交互模式 |
| `-S`、`--shell-allow-list LIST` |用于自动批准的以逗号分隔的 shell 命令，`'recommended'` 用于安全默认值，或 `'all'` 用于允许任何命令。适用于`-n`和交互模式 |
| `--allow-fs-tools LIST` |要公开的文件系统工具。默认为`all`。请参阅[Restrict filesystem tools](#restrict-filesystem-tools) || `--json` |从支持的管理子命令发出机器可读的 JSON，包括 `tools`、`agents`、`threads`、`skills` 和 `update`。输出包络：`{"schema_version": 1, "command": "...", "data": ...}` |
| `--sandbox TYPE` |用于代码执行的远程沙箱：`none`（默认）、`langsmith`、`agentcore`、`daytona`、`modal`、`runloop`、`vercel`和第三方提供商。包括朗史密斯；其他内置功能需要额外的东西。传递 `--sandbox`，但没有值可以从配置中使用 `[sandboxes].default` |
| `--sandbox-id ID` |重用现有沙箱（跳过创建和清理）|| `--sandbox-snapshot-name NAME` |要使用或创建的沙箱快照名称（`langsmith`、`runloop`以及宣传快照支持的提供商）|
| `--sandbox-setup PATH` |创建后在沙箱中运行的设置脚本的路径 || `--mcp-config PATH` |添加显式 MCP 配置作为最高优先级源（与自动发现的配置合并）|
| `--no-mcp` |禁用所有 MCP 工具加载 || `--trust-project-mcp` |信任项目级 MCP 服务器，而不提示当前运行。明确否认仍然适用。                                                                                                                                                                                                                                                                                            |
| `--interpreter` |当在配置中禁用 JS 解释器 (`js_eval`) 中间件时，在主代理上启用它。 `js_eval` 默认启用。                                                                                                                                                                                                                                                       || `--interpreter-tools VALUE` | `js_eval` 的 PTC 允许列表：`safe`、`all` 或以逗号分隔的工具名称列表。默认值：无 PTC（纯 REPL）|
| `--profile-override JSON` |将模型配置文件字段覆盖为 JSON 字符串（例如，`'{"max_input_tokens": 4096}'`）。合并在配置文件配置文件覆盖之上 |
| `--acp` |通过 stdio 作为 ACP 服务器运行，而不是启动交互式 UI || `--update` |检查并安装更新，然后退出 |
| `--auto-update` |打开或关闭自动更新，然后退出 |
| `--install NAME` |安装可选的附加组件（例如，`quickjs`、`daytona`、`fireworks`），然后退出。添加 `--package` 将 `NAME` 视为通过 `uv --with` 安装的自定义提供程序包，而不是额外的（请参阅 [arbitrary providers](/oss/deepagents/code/config-file#arbitrary-providers)），并添加 `--yes` 跳过确认提示 || `-v`、`--version` |显示版本 |
| `-h`、`--help` |显示帮助 |

## 管理凭证 (`dcode auth`)

`dcode auth` 命令组是 `/auth` 凭证管理器的可编写脚本的等效项。它在不启动 TUI 的情况下读取和写入相同的 `auth.json` 存储：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Pipe the key in (stdin)—never lands in shell history
echo "$ANTHROPIC_API_KEY" | dcode auth set anthropic

# Copy from an existing environment variable
dcode auth set openai --from-env OPENAI_API_KEY

# Inspect and remove
dcode auth list
dcode auth status openai
dcode auth remove anthropic
dcode auth path
````set` 拒绝在交互式终端中运行，除非您通过 stdin 管道传输密钥或使用 `--from-env`。 `dcode auth set` 仅管理 API 密钥； `openai_codex` 提供商改为通过 `/auth` 使用 ChatGPT 浏览器登录。参见[Provider credentials](/oss/deepagents/code/credentials#manage-credentials-from-the-shell-dcode-auth)。

## 检查配置（`dcode config`）

`dcode config`命令组报告有效配置而不启动会话。使用它来确认环境变量或`config.toml`设置已被选择，或者在错误报告中共享经过编辑的快照：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode config show
dcode config get interpreter.memory_limit_mb
dcode config list
dcode config path
```

提供者凭据仅报告为已配置或未配置；不打印值。所有四个命令都接受`--json`。参见[Inspect configuration](/oss/deepagents/code/configuration#inspect-configuration)。

## 运行诊断 (`dcode doctor`)

当 Deep Agents 代码未正确启动、提供商或 MCP 服务器未连接、跟踪配置错误或者安装或更新看起来错误时，请使用 `dcode doctor`。它总结了安装方法、依赖项版本、更新状态、跟踪配置和数据目录运行状况，而无需启动会话。

当您需要高级运行状况检查和特定设置的确切来源时，请将 `dcode doctor` 与 `dcode config show` 配对。参见[Run diagnostics with ⟦T289⟧](/oss/deepagents/code/configuration#run-diagnostics-with-dcode-doctor)。

## CLI 命令|命令 |描述 |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- || `dcode help` |显示帮助 |
| `dcode tools list [--json]` |列出已配置代理可用的工具。将顶级工具整形标志，例如 `--allow-fs-tools`、`--no-mcp`、`--mcp-config` 和 `--trust-project-mcp` 放置在 `tools list` 之前 || `dcode agents list` |列出所有代理（别名：`ls`）|
| `dcode agents reset --agent NAME` |清除代理内存并重置为默认值。支持`--dry-run` || `dcode agents reset --agent NAME --target SOURCE` |从另一个代理复制内存 |
| `dcode update` |检查并安装 Deep Agents 代码更新 || `dcode doctor` |无需启动会话即可运行诊断 |
| `dcode skills list [--project]` |列出所有技能（别名：`ls`）|| `dcode skills create NAME [--project]` |使用模板`SKILL.md`创建新技能。幂等 - 重新创建现有技能会打印信息性消息而不是错误 |
| `dcode skills info NAME [--project]` |显示有关技能的详细信息 |
| `dcode skills delete NAME [--project] [-f]` |删除技能及其内容。支持`--dry-run` || `dcode threads list [--agent NAME] [--limit N]` |列出会话（别名：`ls`）。默认限制：20。`-n`是`--limit`的短标志。其他标志：`--sort {created,updated}`、`--branch TEXT`（按 git 分支过滤）、`--cwd [PATH]`（按工作目录过滤；裸标志使用当前目录）、`-v`/`--verbose`（显示所有列，包括分支、创建时间和初始提示）， `-r`/`--relative`（相对时间戳）|
| `dcode threads delete ID` |删除会话。支持`--dry-run` |
| `dcode mcp login NAME [--mcp-config PATH]` |为标记为 `auth: "oauth"` 的 MCP 服务器运行 OAuth 登录流程。请参阅[MCP tools](/oss/deepagents/code/mcp-tools#oauth-login) || `dcode mcp config` |显示 MCP 配置发现路径 |
| `dcode config show` |显示每个配置选项的有效值及其解析来源。请参阅[Inspect configuration](#inspect-configuration-dcode-config) || `dcode config list` |列出所有可用的配置选项及其类型、默认值以及每个选项的设置位置（别名：`ls`）|
| `dcode config get KEY` |显示一个选项的有效值和来源（例如`interpreter.memory_limit_mb`）|| `dcode config path` |显示配置文件位置以及每个文件是否存在 |
| `dcode auth list` |列出已知的提供商以及每个凭据的解析来源 || `dcode auth status <provider>` |显示一个提供商的凭证来源 |
| `dcode auth set <provider>` |存储来自 stdin 或 `--from-env` 的提供者凭证| `dcode auth remove <provider>` |删除存储的提供商凭据 |
| `dcode auth path` |显示凭证存储路径 |

所有管理子命令都支持 `--json` 以获得机器可读的输出。请参阅[command-line options](#command-line-options)了解更多信息。

破坏性命令（`agents reset`、`skills delete`、`threads delete`）支持`--dry-run`，无需进行更改即可预览会发生的情况。在 JSON 模式下，`--dry-run` 返回带有 `dry_run: true` 字段的相同信封。

## 另请参阅

* [Quickstart](/oss/deepagents/code/quickstart)
* [Configuration](/oss/deepagents/code/configuration)
* [Config file](/oss/deepagents/code/config-file)
* [Provider credentials](/oss/deepagents/code/credentials)

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/cli-reference.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>