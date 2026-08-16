<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configuration | https://docs.langchain.com/oss/deepagents/code/configuration -->

# 配置

Deep Agents 代码将配置存储在`~/.deepagents/`下和项目级点文件中。有关完整的目录树、会话存储和技能路径，请参阅[Data locations](/oss/deepagents/code/configuration#data-locations)。

主要的配置文件是：
<CardGroup cols={2}>
    <Card title="Config file" icon="file-code" href="/oss/deepagents/code/config-file">
        编辑 `config.toml` 以获取模型默认值、提供程序设置、主题和更新设置。
    </Card>
    <Card title="Environment variables" icon="variable" href="/oss/deepagents/code/configuration#environment-variables">
        在 `~/.deepagents/.env` 或 shell 导出中设置全局 API 密钥和机密。
    </Card>
    <Card title="Hooks" icon="webhook" href="/oss/deepagents/code/hooks">
        订阅`hooks.json`中的外部命令生命周期事件。
    </Card>
    <Card title="MCP servers" icon="plug" href="/oss/deepagents/code/mcp-tools">
        在`~/.deepagents/.mcp.json`中定义全局MCP服务器。
    </Card>
</CardGroup>

## 设置如何解析

Deep Agents 代码合并了多个来源的设置。哪个来源获胜取决于设置类型。

**常规选项**（解释器限制、更新设置、主题和其他 `config.toml` 键）按以下顺序解析：

1. `DEEPAGENTS_CODE_`-前缀的环境变量
2. 规范环境变量（如果适用）
3.`~/.deepagents/config.toml`
4. 内置默认值

使用`dcode config show`或`dcode config get <key>`查看有效值和来源。参见[Inspect configuration](#inspect-configuration)。

**提供商 API 密钥** 使用单独的顺序。参见[Key resolution order](/oss/deepagents/code/credentials#key-resolution-order)。**Dotenv 文件** 在启动时加载：最近的项目`.env`（从启动目录向上走），然后是`~/.deepagents/.env`。壳牌出口始终超过 `.env` 值。参见[Loading order and precedence](#loading-order-and-precedence)。

**提供商端点** (`base_url`) 使用其匹配的 API 密钥进行解析。参见[Endpoints, keys, and gateways](/oss/deepagents/code/config-file#endpoints-keys-and-gateways)。

## 检查配置

`dcode config` 命令组报告有效的配置以及每个值的来源，而无需启动会话。这对于确认正在选择环境变量或`config.toml`设置以及在错误报告中共享经过编辑的快照非常有用。

|命令 |描述 |
|---------|-------------|
| `dcode config show` |针对实时环境和`config.toml`解析每个选项，打印有效值以及提供它的来源 |
| `dcode config list`（别名`ls`）|列出每个可用选项及其类型、默认值以及可以设置的位置，无需解析值 |
| `dcode config get <key>` |显示单个选项的有效值和来源，例如`dcode config get interpreter.memory_limit_mb` |
| `dcode config path` |显示磁盘上配置文件位置（`config.toml`、项目和全局 `.env`、`hooks.json` 和托管状态文件）以及每个文件是否存在 |

所有四个命令都接受 `--json` 以获得机器可读的输出。有关管理子命令的完整列表，请参阅 [CLI reference](/oss/deepagents/code/cli-reference)。<Warning>
    提供者凭据和其他机密仅报告为已配置/未配置 - 它们的值永远不会由 `config show` 或 `config get` 打印，因此输出可以安全地粘贴到错误报告中。
</Warning>

## 环境变量

除了 shell 导出之外，Deep Agents 代码还从 dotenv 文件中读取环境变量，因此您可以将 API 密钥保留在 shell 配置文件之外，并避免跨项目重复 `.env` 文件。

```bash title="~/.deepagents/.env"
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

对于具体的提供者密钥，请参阅[Provider credentials](/oss/deepagents/code/credentials)。

### 加载顺序和优先级启动时，Deep Agents代码读取最近的项目`.env`，通过搜索您启动的目录并向上遍历其父项找到（第一个找到的`.env`获胜），然后读取`~/.deepagents/.env`作为所有项目的全局后备。项目 `.env` 胜过全局项目，并且两者都不会覆盖 shell 中已设置的值。运行 `/reload` 会重新读取两个 `.env` 文件，以便您无需重新启动即可更改密钥，并且 shell 值仍然优先。这适用于代码读取的每个变量 Deep Agents（例如，`TAVILY_API_KEY` 或 `DEEPAGENTS_CODE_*` 设置），`DEEPAGENTS_CODE_DANGEROUSLY_ENABLE_PROJECT_MCP_SERVERS` 和 `DEEPAGENTS_CODE_DISABLED_PROJECT_MCP_SERVERS` 除外。 Deep Agents 代码会忽略项目 `.env` 中的这些项目 MCP 信任设置，因此存储库无法批准自己的服务器。将它们设置在您的 shell 或全局 `~/.deepagents/.env` 中。

<Warning>
    在不受信任的项目目录中运行 `dcode` 会使您暴露于项目控制的文件。该目录中的恶意 `.env`、`Makefile` 或构建脚本可能会影响代理的进程环境及其运行内容。将您不会在其中运行任意脚本的任何目录视为不受信任，并对不受信任的存储库使用 [remote sandbox](/oss/deepagents/code/remote-sandboxes)。
</Warning>

### `DEEPAGENTS_CODE_` 前缀所有Deep Agents代码特定的环境变量都使用`DEEPAGENTS_CODE_`前缀（例如，`DEEPAGENTS_CODE_AUTO_UPDATE`、`DEEPAGENTS_CODE_DEBUG`）。完整列表请参见[environment variable reference](#environment-variable-reference)。

该前缀还可以用作任何环境变量Deep Agents代码读取的覆盖机制，包括第三方凭据。 Deep Agents 代码首先检查`DEEPAGENTS_CODE_{NAME}`，然后回退到`{NAME}`：

```bash title="~/.deepagents/.env"
# Give Deep Agents Code its own value, without affecting other tools
DEEPAGENTS_CODE_OPENAI_API_KEY=sk-cli-only

# Or set it empty so Deep Agents Code ignores a key exported in your shell
DEEPAGENTS_CODE_ANTHROPIC_API_KEY=
```

## 技能目录白名单

默认情况下，当Deep Agents代码加载技能时，它会验证已解析的技能文件路径是否保留在标准[skill directories](/oss/deepagents/code/configuration#skills)之一内。这可以防止技能目录内的符号链接读取这些根目录之外的任意文件。

如果您将共享技能资产存储在非标准位置并使用标准技能目录中的符号链接来引用它们，则可以将该位置添加到遏制允许列表中。这不会**添加新的技能发现位置：技能仍然只能从标准目录中发现。

<ResponseField name="extra_allowed_dirs" type="string[]" post={["optional"]}>
    添加到技能限制允许列表的路径。支持`~`扩展。

    ```toml
    [skills]
    extra_allowed_dirs = [
        "~/shared-skills",
        "/opt/team-skills",
    ]
    ```
</ResponseField>

或者，将 `DEEPAGENTS_CODE_EXTRA_SKILLS_DIRS` 环境变量设置为冒号分隔的列表：

```bash
export DEEPAGENTS_CODE_EXTRA_SKILLS_DIRS="~/shared-skills:/opt/team-skills"
```

设置环境变量后，它优先于配置文件值。更改于 `/reload` 生效。

## 主题使用 `/theme` 打开交互式主题选择器。导航列表以实时预览主题，按`Enter`将您的选择保留到`config.toml`。

Deep Agents 代码附带许多内置主题。默认主题是 `langchain`，带有 LangChain 品牌颜色的深色主题。所选主题保留在 `[ui]` 下：

```toml
[ui]
theme = "langchain-dark"
```

对于用户定义的主题、内置覆盖和特定于终端的映射，请参阅[Config file](/oss/deepagents/code/config-file)中的`[themes.*]`和`[ui.terminal_themes]`部分或直接在`config.toml`中配置它们：

<Accordion title="User-defined themes, overrides, and terminal mapping" icon="palette">
    ### 用户定义的主题

    在 `config.toml` 的 `[themes.<name>]` 部分下定义自定义主题。每个部分都需要 `label` (str)。 `dark` (bool) 如果省略则默认为 `false` — 对于深色主题设置为 `true`。所有颜色字段都是可选的 - 省略的字段根据 `dark` 标志回退到内置的深色或浅色调色板。

    ```toml
    [themes.my-solarized]
    label = "My Solarized"
    dark = true
    primary = "#268BD2"
    warning = "#B58900"

    # Theme names with spaces require TOML quoting
    [themes."ocean breeze"]
    label = "Ocean Breeze"
    primary = "#0077B6"
    background = "#CAF0F8"
    ```

    用户定义的主题与 `/theme` 选择器中的内置主题一起显示。

    ### 覆盖内置主题颜色

    要调整内置主题的颜色而不创建新主题，请使用 `[themes.<builtin-name>]` 部分。仅读取颜色字段 - `label` 和 `dark` 继承自内置：

    ```toml
    [themes.langchain]
    primary = "#FF5500"
    ```省略的颜色字段保留现有的内置值。对 `[themes.*]` 部分的更改将于 `/reload` 生效。

    ### 将主题映射到终端

    如果您在具有不同配色方案的终端之间切换（例如，深色 iTerm 和浅色 Apple 终端），请将每个终端映射到 `[ui.terminal_themes]` 下的主题。 Deep Agents 代码与 shell 的 `TERM_PROGRAM` 匹配并自动应用映射的主题：

    ```toml
    [ui.terminal_themes]
    "Apple_Terminal" = "langchain-light"
    "iTerm.app" = "langchain"
    ```

    在 `/theme` 选择器中按 `T` 保存当前终端突出显示的主题，或运行 `echo $TERM_PROGRAM` 查找终端的标识符并手动添加。

    #### 常见 `TERM_PROGRAM` 值

    |终端| `TERM_PROGRAM` |
    | ---| ---|
    |苹果终端| `Apple_Terminal` |
    | iTerm2 | `iTerm.app` |
    | WezTerm | `WezTerm` |
    | VS Code 集成终端 | `vscode` |
    |幽灵 | `ghostty` |

    #### 主题解析顺序

    1. `DEEPAGENTS_CODE_THEME`环境变量（显式覆盖）。
    2. `[ui.terminal_themes]` 映射当前`TERM_PROGRAM`。
    3. `[ui] theme`已保存的偏好设置（由`/theme`设置）。
    4. 内置默认值（`langchain`）。
</Accordion>

## 自动更新

Deep Agents 代码默认自动检查并安装更新。

要选择退出自动更新：<Tabs>
    <Tab title="Config file">
        ```toml
        [update]
        auto_update = false
        ```
    </Tab>
    <Tab title="Environment variable">
        ```bash
        export DEEPAGENTS_CODE_AUTO_UPDATE=0
        ```
    </Tab>
</Tabs>

环境变量优先于配置文件。

启用后（默认），Deep Agents代码会在会话启动时检查 PyPI 是否有较新版本并自动升级。禁用后，Deep Agents 代码会显示更新提示以及相应的安装命令。

要完全禁止自动更新检查：

<Tabs>
    <Tab title="Config file">
        ```toml
        [update]
        check = false
        ```
    </Tab>
    <Tab title="Environment variable">
        ```bash
        export DEEPAGENTS_CODE_NO_UPDATE_CHECK=1
        ```
    </Tab>
</Tabs>

禁用更新检查还会阻止启动时自动安装更新。

您仍然可以随时使用 `/update` 斜线命令手动检查和安装更新，该命令运行按需检查并内联报告成功或失败。

升级后，Deep Agents代码会在下次启动时显示“新增内容”横幅，并附有更改日志的链接。

会话退出时，如果在会话期间检测到较新版本，则会显示更新横幅作为提醒。

## 卸载

要删除 `dcode` 和 `deepagents-code` 二进制文件以及隔离的工具环境，请运行：

```bash
uv tool uninstall deepagents-code
```卸载命令不会删除用户配置或会话数据。 Deep Agents代码将这些文件存储在`~/.deepagents/`下，包括`config.toml`、`hooks.json`、全局`.env`和`.state/`内容，例如保存的会话和凭据。要同时删除该数据，请运行：

```bash
rm -rf ~/.deepagents
```

## 托管部署

[install script](https://github.com/langchain-ai/deepagents/blob/main/libs/code/scripts/install.sh) 支持以 root 身份运行，针对在最小 root 环境中执行脚本的 macOS MDM 工具（Kandji、Jamf 等）。

当`id -u`为`0`时，脚本：

1. 解析真实控制台用户的`HOME`（通过`/dev/console`或`/Users`目录扫描）
2. `chown`在每个安装步骤后将所有创建的文件返回给目标用户

非 root 安装不受影响：当不以 root 身份运行时，所有特定于 root 的代码路径都会短路。

### 使用环境变量固定安装

安装脚本会读取环境变量，让您固定版本、选择附加功能以及在整个队列范围内选择 Python 版本。将它们设置在与管道安装相同的行上：

```bash
# Pin an exact version for reproducible installs across the fleet
curl -LsSf https://langch.in/dcode | DEEPAGENTS_CODE_VERSION="0.1.16" bash
```

<ResponseField name="DEEPAGENTS_CODE_VERSION" type="string" post={["optional"]}>
    要安装的确切软件包版本，例如`0.1.0`（或预发布版，例如`0.1.0rc1`）。与 `DEEPAGENTS_CODE_PRERELEASE` 互斥 - 设置两者都是错误的，因为确切的引脚已经选择了单个版本。
</ResponseField><ResponseField name="DEEPAGENTS_CODE_PRERELEASE" type="string" post={["optional"]}>
    解析最新版本时应用的uv预发布策略：`disallow`、`allow`、`if-necessary`、`explicit`或`if-necessary-or-explicit`。与`DEEPAGENTS_CODE_VERSION`互斥。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_EXTRAS" type="string" post={["optional"]}>
    要安装的以逗号分隔的 pip extra，例如`ollama`、`ollama,groq` 或 `daytona`。请参阅[⟦T137⟧](https://github.com/langchain-ai/deepagents/blob/main/libs/code/pyproject.toml)了解可用的附加功能。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_PYTHON" type="string" default="3.13" post={["optional"]}>
    用于安装的 Python 版本。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_SKIP_OPTIONAL" type="string" post={["optional"]}>
    设置为 `1` 以跳过可选工具检查。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_VERBOSE" type="string" post={["optional"]}>
    设置为 `1` 以显示 uv 的原始标准错误（时间线、未过滤的包差异）和默认安静状态线（可选工具检查、安装后页脚）。调试安装时很有用。
</ResponseField>

<ResponseField name="UV_BIN" type="string" post={["optional"]}>
    uv 二进制文件的路径。如果未设置则自动检测。
</ResponseField>

默认情况下，托管安装启用自动更新。要选择退出，请在用户的 shell 配置文件中设置 `DEEPAGENTS_CODE_AUTO_UPDATE=0` 或部署 `config.toml`，其中 `[update] auto_update = false` 为 `~/.deepagents/config.toml`。要完全抑制自动更新和更新检查，请设置`DEEPAGENTS_CODE_NO_UPDATE_CHECK=1`或部署`[update] check = false`。

要通过托管网关路由每个用户的模型流量（在整个队列范围内配置网关密钥和基本 URL），请参阅 [Managed gateways](/oss/deepagents/code/config-file#managed-gateways)。

## 环境变量引用所有 Deep Agents 代码特定的环境变量都使用 `DEEPAGENTS_CODE_` 前缀。请参阅 [⟦T147⟧ prefix](#deepagents_code_-prefix) 了解前缀如何替代第三方凭证。

<ResponseField name="DEEPAGENTS_CODE_AUTO_UPDATE" type="string" post={["optional"]}>
    切换自动 Deep Agents 代码更新。默认启用；设置为 `0`、`false`、`no` 或 `off` 以选择退出。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_AUTO_CLASSIFIER_TIMEOUT" type="integer" post={["optional"]}>
    [Auto mode](/oss/deepagents/code/approval-modes) 分类器审查每批门控操作的时间预算（以秒为单位）。有效范围：`1`–`300`。超出范围或非整数值将恢复为默认值 (`20`)。在提高此值之前请考虑[selecting a faster classifier model](/oss/deepagents/code/config-file#default-and-recent-model)。覆盖 `config.toml` 中的 `[models].auto_classifier_timeout`。参见[Auto classifier timeout](/oss/deepagents/code/config-file#auto-classifier-timeout)。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_DEBUG" type="string" post={["optional"]}>
    启用对文件的详细调试日志记录。接受`1`、`true`、`yes`、`on`（不区分大小写）作为启用； `0`、`false`、`no`、`off`、空字符串或未设置会禁用它。启用后，每个会话的服务器日志文件将在关闭时保留，并将其路径打印到 stderr 以进行分类。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_EXPERIMENTAL" type="string" post={["optional"]}>
    选择实验性的、不稳定的Deep Agents代码行为。设置为`1`（或任何真值）以启用实验功能。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_DEBUG_FILE" type="string" default="/tmp/deepagents_debug.log" post={["optional"]}>
    调试日志文件的路径。
</ResponseField><Note>
    下面的项目MCP信任变量需要`deepagents-code>=0.1.40`。该版本忽略了之前的`DEEPAGENTS_CODE_ENABLED_PROJECT_MCP_SERVERS`变量；使用 `DEEPAGENTS_CODE_DANGEROUSLY_ENABLE_PROJECT_MCP_SERVERS` 来实现相同的基于名称的行为。
</Note>

<ResponseField name="DEEPAGENTS_CODE_DISABLED_PROJECT_MCP_SERVERS" type="string" post={["optional"]}>
    以逗号分隔的项目 MCP 服务器名称始终按名称拒绝。 Deep Agents 代码将这些名称与`[mcp].disabled_project_servers`组合起来；拒绝赢得已保存的批准和 `--trust-project-mcp` 标志。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_DANGEROUSLY_ENABLE_PROJECT_MCP_SERVERS" type="string" post={["optional"]}>
    以逗号分隔的项目 MCP 服务器名称，可按名称预先批准任何项目。这是一个进程范围的逃生口：同一服务器名称下的不同项目、命令更改或 URL 更改仍然匹配。设置后，此变量将替换保存的流程批准。如果可能，最好从项目 MCP 提示中保存批准。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_EXTRA_SKILLS_DIRS" type="string" post={["optional"]}>
    添加到 [skill containment allowlist](#skill-directory-allowlist) 的以冒号分隔的路径。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_LANGSMITH_PROJECT" type="string" post={["optional"]}>
    覆盖 Deep Agents 代码自己的代理跟踪的 LangSmith 项目名称。 Shell 命令仍然使用用户的原始 `LANGSMITH_PROJECT` 运行，因此应用程序、测试或脚本跟踪可以出现在单独的项目中。参见[Trace with LangSmith](/oss/deepagents/code/quickstart#trace-with-langsmith)。
</ResponseField><ResponseField name="DEEPAGENTS_CODE_LANGSMITH_REDACT" type="string" default="false" post={["optional"]}>
    切换 Deep Agents 代码的 LangSmith 代理跟踪输入和输出的客户端秘密编辑。接受 `1`、`true`、`yes` 或 `on` 以启用密文，并接受 `0`、`false`、`no` 或 `off` 来禁用密文，不区分大小写。启用编辑后，如果无法配置编辑，则会禁用该运行的跟踪。参见[Configure LangSmith trace redaction](/oss/deepagents/code/config-file#redact-langsmith-trace-secrets)。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_LANGSMITH_REPLICA_PROJECTS" type="string" post={["optional"]}>
    第二个LangSmith项目*也*写入代理跟踪。当设置和跟踪处于活动状态时，每个代理运行都会双重写入主项目（默认情况下从`DEEPAGENTS_CODE_LANGSMITH_PROJECT`，或`deepagents-code`）和此项目。默认关闭。参见[Trace with LangSmith](/oss/deepagents/code/quickstart#trace-with-langsmith)。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_NO_UPDATE_CHECK" type="string" post={["optional"]}>
    设置后禁用自动更新检查。这也会阻止启动时自动安装更新。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_ONBOARDING" type="string" post={["optional"]}>
    覆盖首次运行的入门流程。设置为真实值以强制其在每次启动时打开；设置为虚假值以完全抑制它（对于 CI 和配置的机器有用）。对于默认的首次运行行为，保留未设置。
</ResponseField><ResponseField name="DEEPAGENTS_CODE_RECURSION_LIMIT" type="integer" post={["optional"]}>
    LangGraph图步预算，这是`dcode`代理图每回合可以执行的最大节点调用数。有效范围：`25`–`100000`。超出范围或非整数值会记录警告并回退到默认值 (`2000`)。在 CLI 中被 `--recursion-limit` 覆盖。参见[Agent runtime limits](/oss/deepagents/code/config-file#agent-runtime-limits)。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_SHELL_ALLOW_LIST" type="string" post={["optional"]}>
    允许使用逗号分隔的 shell 命令（或 `recommended` / `all`）。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_USER_ID" type="string" post={["optional"]}>
    将用户标识符附加到 LangSmith 跟踪元数据。
</ResponseField>

## 使用 `dcode doctor` 运行诊断

当 Deep Agents 代码未正确启动、提供商或 MCP 服务器未连接、跟踪配置错误或者安装或更新看起来错误时，请使用 `dcode doctor`。它在不启动会话的情况下运行诊断并总结当前运行时状态。

```bash
# Show diagnostics in the terminal
dcode doctor
```

输出：

```text
  Diagnostics ✓
  ├ deepagents-code: 0.1.30
  ├ deepagents (SDK): 0.7.0
  ├ Commit hash: e4709c2
  ├ Python: 3.13.11
  ├ Platform: darwin-arm64
  ├ Install method: uv
  └ Path: /Users/naomi/.local/share/uv/tools/deepagents-code

  Updates ✓
  ├ Update checks: enabled
  ├ Auto-updates: enabled
  ├ Latest version: up to date
  └ Last checked: 21m ago

  Tracing ✓
  ├ Tracing: enabled
  ├ Credentials: configured
  ├ Project: shared-deepagents
  └ Endpoint: https://api.smith.langchain.com

  Configuration ✓
  ├ Data directory: /Users/naomi/.deepagents (exists)
  └ Config file: /Users/naomi/.deepagents/config.toml (exists)

  Tip: Run `dcode config show` or `dcode config get <key>` to drill into config details.
       Run `dcode --version` (or `dcode -v`) for dependency versions.
```

<Tip>
    当您需要高级运行状况检查和特定设置的确切来源时，请将 `dcode doctor` 与 `dcode config show` 配对。
</Tip>

## 数据位置

Deep Agents 代码将数据存储在两个目录层次结构中：

- **`~/.deepagents/`** — Deep Agents特定数据（座席记忆、技能、会话）
- **`~/.agents/`** — 与工具无关的数据（跨 AI CLI 工具共享的技能）

### 目录结构

```text
~/.deepagents/
├── .state/                  # Per-machine Deep Agents Code state (managed automatically)
│   ├── sessions.db          #   SQLite database for conversation checkpoints
│   ├── history.jsonl        #   Command input history
│   ├── chatgpt-auth.json    #   ChatGPT OAuth token for the openai_codex provider
│   ├── ...                  #   Other markers & credentials
└── {agent}/                 # Per-agent directory (default: "agent")
    ├── AGENTS.md            # User customizations to agent instructions
    ├── skills/              # User-level skills
    │   └── {skill-name}/
    │       └── SKILL.md
    └── agents/              # Custom subagent definitions
        └── {subagent-name}/
            └── AGENTS.md

~/.agents/                   # Tool-agnostic alias (shared across AI CLIs)
└── skills/                  # Skills available to any compatible tool
    └── {skill-name}/
        └── SKILL.md

{project}/                   # Project-level (in git repo root)
├── AGENTS.md                # Project instructions (root-level)
└── .deepagents/
│   ├── AGENTS.md            # Project instructions (preferred location)
│   ├── skills/              # Project-specific skills
│   │   └── {skill-name}/
│   │       └── SKILL.md
│   └── agents/              # Project-specific subagents
│       └── {subagent-name}/
│           └── AGENTS.md
└── .agents/                 # Tool-agnostic project skills
    └── skills/
        └── {skill-name}/
            └── SKILL.md
```

#### 什么去哪里|数据|地点 |读/写|笔记|
|------|----------|------------|--------|
| **会议** | `~/.deepagents/.state/sessions.db` |读/写 | SQLite 检查点数据库 |
| **输入历史记录** | `~/.deepagents/.state/history.jsonl` |读/写 | JSON 行，向上/向下箭头调用 |
| **ChatGPT OAuth 令牌** | `~/.deepagents/.state/chatgpt-auth.json` |读/写|支持[⟦T198⟧](/oss/deepagents/code/providers)提供商；当您使用 ChatGPT 登录时创建并自动刷新。只能由您的用户帐户读取。 |
| **基本说明** |套餐`default_agent_prompt.md` |右 |不可变，通过 Deep Agents​​ 代码升级进行更新 |
| **用户定制** | `~/.deepagents/{agent}/AGENTS.md` |读/写 |附加到基本说明 |
| **项目说明** | `.deepagents/AGENTS.md` 或 `AGENTS.md` |右 |两者均已加载（如果存在）|
| **用户技能** | `~/.deepagents/{agent}/skills/` |读/写 |代理特定技能 |
| **共享技能** | `~/.agents/skills/` |右 |与工具无关、跨 CLI |
| **项目技能** | `.deepagents/skills/` 或 `.agents/skills/` |右 |项目范围 |
| **自定义子代理** | `~/.deepagents/{agent}/agents/` |读/写|用户定义的子代理 |
| **项目分代理** | `.deepagents/agents/` |右 |项目定义的子代理 |

### 优先规则

当同一项目存在于多个位置时，**较高的优先级完全获胜**（不合并）。

#### 技能

优先顺序（从最低到最高）：1. `~/.deepagents/{agent}/skills/` — 用户Deep Agents代码
2. `~/.agents/skills/` — 与用户工具无关
3. `.deepagents/skills/` — 项目Deep Agents代码
4. `.agents/skills/` — 项目工具无关*（最高）*

加载技能时，Deep Agents代码会验证解析的文件路径是否位于这些目录之一中。在所有技能根之外解析的符号链接将被拒绝。要允许其他目录中的符号链接目标，请参阅[⟦T213⟧](/oss/deepagents/code/configuration#skill-directory-allowlist)。

#### 子代理

优先顺序（从最低到最高）：

1. `~/.deepagents/{agent}/agents/` — 用户级
2. `.deepagents/agents/` — 项目级别*（最高）*

每个子代理都是一个 `AGENTS.md` 文件，其中包含 YAML frontmatter（`name`、`description`、可选 `model`）和系统提示符的 Markdown 正文。有关完整格式参考，请参阅[Use subagents in Deep Agents Code](/oss/deepagents/code/subagents)。

#### 说明

所有指令源都是**组合**（不覆盖）：

1. 包基本提示*（始终加载）*
2. `~/.deepagents/{agent}/AGENTS.md` *（已附加）*
3. `.deepagents/AGENTS.md` *（已附加）*
4. `AGENTS.md` 位于项目根目录*（已附加）*

### `.deepagents` vs `.agents`

|目录 |目的|何时使用 |
|------------|---------|-------------|
| `.deepagents/` | Deep Agents 代码特定 |使用 Deep Agents 代码特定功能的技能和配置 |
| `.agents/` |与工具无关 |您想要在不同的 AI CLI 工具之间共享的技能 |<Tip>
使用 `.agents/skills/` 获得与任何 AI 编码助手配合使用的技能。
对于依赖于 Deep Agents 特定工具或约定的技能，请使用 `.deepagents/skills/`。
</Tip>

### 清理

|需要|行动|
|------|--------|
|重置所有数据 | `rm -rf ~/.deepagents` |
|仅清除会话 | `rm ~/.deepagents/.state/sessions.db*` |
|清除输入历史记录 | `rm ~/.deepagents/.state/history.jsonl` |
|清除存储的 API 密钥 | `rm ~/.deepagents/.state/auth.json` |
|清除 MCP OAuth 令牌 | `rm -rf ~/.deepagents/.state/mcp-tokens` |
|清除已保存的 MCP 项目审批 |从 `~/.deepagents/config.toml` 的 `[mcp]` 表中删除 `enabled_project_server_approvals` |
|重新运行首次运行入职 | `rm ~/.deepagents/.state/onboarding_complete` |
|重置代理说明 | `dcode agents reset --agent {name}` |
|删除技能 | `rm -rf ~/.deepagents/{agent}/skills/{skill-name}` |

<Warning>
    删除`~/.deepagents/.state/sessions.db`将删除所有对话历史记录和检查点。

    除非您有 `sessions.db` 文件的备份，否则此操作无法撤消。
</Warning>

## 另请参阅

- [Provider credentials](/oss/deepagents/code/credentials)
- [Config file](/oss/deepagents/code/config-file)
- [CLI reference](/oss/deepagents/code/cli-reference)
- [Hooks](/oss/deepagents/code/hooks)
- [Data locations](#data-locations)
- [MCP tools](/oss/deepagents/code/mcp-tools)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/configuration.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>