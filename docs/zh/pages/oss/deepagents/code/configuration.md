<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configuration | https://docs.langchain.com/oss/deepagents/code/configuration -->

# 配置

Deep Agents 代码将用户配置存储在其配置文件目录（默认为`~/.deepagents/`）和项目级点文件中。管理员可以使用 [⟦T38⟧](#managed-configuration) 从固定系统路径强制设置。有关完整的目录树、会话存储和技能路径，请参阅[Data locations](/oss/deepagents/code/configuration#data-locations)。

主要的配置文件是：
<CardGroup cols={2}>
    <Card title="Config file" icon="file-code" href="/oss/deepagents/code/config-file">
        编辑 `config.toml` 以获取模型默认值、提供程序设置、主题和更新设置。
    </Card>
    <Card title="Managed configuration" icon="shield-lock" href="#managed-configuration">
        使用 `managed_config.toml` 为每个用户设置管理员控制的设置。
    </Card>
    <Card title="Environment variables" icon="variable" href="/oss/deepagents/code/configuration#environment-variables">
        在 `~/.deepagents/.env` 或 shell 导出中设置全局 API 密钥和机密。
    </Card>
    <Card title="Hooks" icon="webhook" href="/oss/deepagents/code/hooks">
        将外部命令订阅到`hooks.json`中的生命周期事件。
    </Card>
    <Card title="MCP servers" icon="plug" href="/oss/deepagents/code/mcp-tools">
        在`~/.deepagents/.mcp.json`中定义全局MCP服务器。
    </Card>
    <Card title="Python extensions" icon="puzzle" href="/oss/deepagents/code/extensions">
        添加自定义工具、中间件和存储路由。
    </Card>
</CardGroup>

## 设置如何解析

Deep Agents 代码采用分层配置。优先顺序取决于设置类型。

**常规选项**（解释器限制、更新设置、主题和其他 `config.toml` 键）按以下顺序使用第一个可用值：1.管理员拥有`managed_config.toml`
2. `DEEPAGENTS_CODE_`-前缀的环境变量
3. 规范环境变量（如果适用）
4.`~/.deepagents/config.toml`
5. 内置默认值

使用 `dcode config` 或 `dcode config get <key>` 查看当前值及其来源。参见[Inspect configuration](#inspect-configuration)。

**提供商 API 密钥** 使用单独的顺序。参见[Key resolution order](/oss/deepagents/code/credentials#key-resolution-order)。

**Dotenv 文件** 在启动时加载：最近的项目`.env`（从启动目录向上走），然后是`~/.deepagents/.env`。壳牌出口始终超过 `.env` 值。参见[Loading order and precedence](#loading-order-and-precedence)。

**提供商端点** (`base_url`) 使用其匹配的 API 密钥进行解析。参见[Endpoints, keys, and gateways](/oss/deepagents/code/config-file#endpoints-keys-and-gateways)。

## 检查配置

`dcode config` 命令显示Deep Agents 代码使用的设置以及每个值的来源，而无需启动会话。使用它们来确认管理员设置、环境变量或 `config.toml` 设置处于活动状态。

|命令|描述 |
|---------|-------------|
| `dcode config` |显示每个设置、其当前值以及该值的来源 |
| `dcode config get <key>` |显示一项设置的当前值和来源，例如 `dcode config get interpreter.memory_limit_mb` |
| `dcode config path` |显示 `managed_config.toml`、`config.toml`、项目和全局 `.env` 文件、`hooks.json` 和托管状态的文件位置，包括每个文件是否存在 |将 `--verbose` 添加到 `dcode config` 或 `dcode config get` 以显示说明、默认值以及可以定义每个设置的位置。将 `--verbose` 与 `--json` 组合以包含接受的类型和其他参考详细信息。所有三个命令都接受 `--json` 以获得机器可读的输出。有关命令的完整列表，请参阅[CLI reference](/oss/deepagents/code/cli-reference)。

<Warning>
    提供者凭据和其他机密仅报告为已配置/未配置。它们的值永远不会被 `config` 或 `config get` 打印。
</Warning>

## 环境变量

除了 shell 导出之外，Deep Agents 代码还从 dotenv 文件中读取环境变量，因此您可以将 API 密钥保留在 shell 配置文件之外，并避免跨项目重复 `.env` 文件。

```bash title="~/.deepagents/.env"
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

对于具体的提供者密钥，请参阅[Provider credentials](/oss/deepagents/code/credentials)。

### 加载顺序和优先级

启动时，Deep Agents代码读取最近的项目`.env`，通过搜索您启动的目录并向上遍历其父项找到（第一个找到的`.env`获胜），然后将`~/.deepagents/.env`作为所有项目的全局后备。项目 `.env` 胜过全局项目，并且两者都不会覆盖 shell 中已设置的值。

要完全跳过项目`.env`（全局`~/.deepagents/.env`仍然加载），请设置`startup.read_project_dotenv`。<Tabs>
    <Tab title="Config file">
        ```toml title="~/.deepagents/config.toml"
        [startup]
        read_project_dotenv = false
        ```
    </Tab>
    <Tab title="Environment variable">
        ```bash
        export DEEPAGENTS_CODE_READ_PROJECT_DOTENV=0
        ```
    </Tab>
</Tabs>

该设置从托管配置、环境变量和用户`config.toml`解析。所有这些都在应用任何项目 `.env` 之前读取，因此项目 `.env` 无法自行关闭（或重新打开）切换。

Deep Agents 代码会忽略来自 dotenv 文件时可能改变可执行文件查找、解释器或 shell 启动、Git 行为或信任设置的环境变量。

<Accordion title="View environment variables blocked in dotenv files">
    无法在项目或全局 dotenv 文件中设置以下键：

    - 个人资料和信任根：`DEEPAGENTS_HOME`、`DEEPAGENTS_HOME_IS_DEFAULT`、`DEEPAGENTS_CODE_READ_PROJECT_DOTENV`、`DEEPAGENTS_INHERITED_PYTHONPATH`
    - 动态链接器预加载/审核：`DYLD_INSERT_LIBRARIES`、`DYLD_LIBRARY_PATH`、`LD_AUDIT`、`LD_LIBRARY_PATH`、`LD_PRELOAD`
    - 解释器启动/路径：`NODE_OPTIONS`、`PATH`、`PYTHONEXECUTABLE`、`PYTHONHOME`、`PYTHONPATH`、`PYTHONSTARTUP`
    - Shell 启动挂钩：`BASH_ENV`、`ENV`、`BASHOPTS`、`SHELLOPTS`、`CDPATH`、`GLOBIGNORE`
    - 凭据提示劫持：`GIT_ASKPASS`、`SSH_ASKPASS`
    - Git config/exec 注入：`GIT_DIR`、`GIT_WORK_TREE`、`GIT_OBJECT_DIRECTORY`、`GIT_EXEC_PATH`、`GIT_EDITOR`、`GIT_PAGER`、`GIT_SSH`、`GIT_SSH_COMMAND`，以及前缀系列`GIT_CONFIG_COUNT`、`GIT_CONFIG_KEY_*`、`GIT_CONFIG_VALUE_*`、`GIT_CONFIG_PARAMETERS`、`GIT_CONFIG_SYSTEM`、`GIT_CONFIG_GLOBAL`
    - Windows 进程变量：`COMSPEC`、`SYSTEMROOT`、`WINDIR`项目 `.env` 也无法设置 `DEEPAGENTS_CODE_DANGEROUSLY_ENABLE_PROJECT_MCP_SERVERS`、`DEEPAGENTS_CODE_DISABLED_PROJECT_MCP_SERVERS`、`DEEPAGENTS_CODE_AUTO_CLASSIFIER_MODEL`、`DEEPAGENTS_CODE_AUTO_CLASSIFIER_TIMEOUT` 或 `TERM_PROGRAM`。在您的 shell 或全局 `~/.deepagents/.env` 中设置它们。
</Accordion>

<Warning>
    在不受信任的项目目录中运行 `dcode` 会使您暴露于项目控制的文件。该目录中的恶意 `.env`、`Makefile` 或构建脚本可能会影响代理的进程环境及其运行内容。将您不会在其中运行任意脚本的任何目录视为不受信任，并对不受信任的存储库使用 [remote sandbox](/oss/deepagents/code/remote-sandboxes)。
</Warning>

### `DEEPAGENTS_CODE_` 前缀

所有Deep Agents代码特定的环境变量都使用`DEEPAGENTS_CODE_`前缀（例如，`DEEPAGENTS_CODE_AUTO_UPDATE`、`DEEPAGENTS_CODE_DEBUG`）。完整列表请参见[environment variable reference](#environment-variable-reference)。

该前缀还可以用作任何环境变量Deep Agents代码读取的覆盖机制，包括第三方凭据。 Deep Agents 代码首先检查`DEEPAGENTS_CODE_{NAME}`，然后回退到`{NAME}`：

```bash title="~/.deepagents/.env"
# Give Deep Agents Code its own value, without affecting other tools
DEEPAGENTS_CODE_OPENAI_API_KEY=sk-cli-only

# Or set it empty so Deep Agents Code ignores a key exported in your shell
DEEPAGENTS_CODE_ANTHROPIC_API_KEY=
```

## 技能目录白名单

默认情况下，当Deep Agents代码加载技能时，它会验证解析的技能文件路径是否保留在标准[skill directories](/oss/deepagents/code/configuration#skills)之一内。这可以防止技能目录内的符号链接读取这些根目录之外的任意文件。如果您将共享技能资产存储在非标准位置并使用标准技能目录中的符号链接来引用它们，则可以将该位置添加到遏制允许列表中。这不会**添加新的技能发现位置：技能仍然只能从标准目录中发现。

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

设置环境变量后，它优先于配置文件值。更改于`/reload`生效。

## 个人资料位置 (`DEEPAGENTS_HOME`)

`DEEPAGENTS_HOME` 选择目录 Deep Agents 代码用作其用户配置文件 — 通常存储在 `~/.deepagents/` 下的所有内容都会移动到配置的路径下。这包括 `config.toml`、全局 `.env`、`~/.deepagents/.mcp.json` 和 `hooks.json`、`extensions/`、每个代理目录（`AGENTS.md`、`skills/`、`memories/`、`agents/`）、插件和`.state/`（会话、输入历史记录、凭证和锁）。取消设置时，配置文件默认为 `~/.deepagents`。

有效形式是绝对路径或以 `~/` 开头的路径：

```bash
export DEEPAGENTS_HOME="~/profiles/work"        # resolved against your home directory
export DEEPAGENTS_HOME="/opt/dcode-profiles/work"  # absolute; works even with no resolvable home
```相对路径和`~user`形式被拒绝。解析的路径也不能是文件系统根、主目录本身、现有的非目录、不可读或不可搜索的目录或缺少目标的符号链接——这些在启动时会失败并出现错误。

<Warning>
    `DEEPAGENTS_HOME` 是信任边界：它选择代码将哪个 `config.toml`、`.env` 和 `.mcp.json` Deep Agents 视为用户信任。它必须在继承的 shell 环境中设置（例如，启动前的`export DEEPAGENTS_HOME=...`）。它是在启动时、dotenv 加载之前捕获的，并且没有任何 `.env` 文件可以设置或更改它 — 项目控制的 `.env` 可能会将信任根重新定位到它控制的文件。子进程继承解析的路径。
</Warning>

别名 `~/.agents/skills/`（在 AI CLI 工具之间共享）是从启动主目录解析的，而不是从 `DEEPAGENTS_HOME` 解析的。有关完整目录树，请参阅[Data locations](#data-locations)。

## 主题

使用 `/theme` 打开交互式主题选择器。导航列表实时预览主题，按`Enter`将您的选择保留到`config.toml`。

Deep Agents 代码附带许多内置主题。默认主题是 `langchain`，带有 LangChain 品牌颜色的深色主题。所选主题保留在 `[ui]` 下：

```toml
[ui]
theme = "langchain-dark"
```对于用户定义的主题、内置覆盖和特定于终端的映射，请参阅[Config file](/oss/deepagents/code/config-file)中的`[themes.*]`和`[ui.terminal_themes]`部分或直接在`config.toml`中配置它们：

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
    ```

    省略的颜色字段保留现有的内置值。对 `[themes.*]` 部分的更改将于 `/reload` 生效。

    ### 将主题映射到终端

    如果您在具有不同配色方案的终端之间切换（例如，深色 iTerm 和浅色 Apple 终端），请将每个终端映射到 `[ui.terminal_themes]` 下的主题。 Deep Agents 代码与 shell 的 `TERM_PROGRAM` 匹配并自动应用映射的主题：```toml
    [ui.terminal_themes]
    "Apple_Terminal" = "langchain-light"
    "iTerm.app" = "langchain"
    ```

    在 `/theme` 选择器中按 `T` 保存当前终端突出显示的主题，或运行 `echo $TERM_PROGRAM` 查找终端的标识符并手动添加。

    #### 常见 `TERM_PROGRAM` 值

    |终端| `TERM_PROGRAM` |
    | --- | --- |
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

要选择退出自动更新：

<Tabs>
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

环境变量优先于配置文件。将环境变量设置为空值会禁用该功能。

启用后（默认），Deep Agents 代码会在会话启动时检查 PyPI 是否有较新版本并自动升级。禁用后，Deep Agents 代码会显示更新提示以及相应的安装命令。### 定价目录自动更新

Deep Agents 代码在后台每小时从上游刷新其模型定价目录，以便成本估算保持最新。选择退出：

<Tabs>
    <Tab title="Config file">
        ```toml
        [update]
        prices_auto_update = false
        ```
    </Tab>
    <Tab title="Environment variable">
        ```bash
        export DEEPAGENTS_CODE_PRICES_AUTO_UPDATE=0
        ```
    </Tab>
</Tabs>

### 自定义定价覆盖

对于目录未涵盖的型号，请将费率添加到`~/.deepagents/prices.json`。该文件使用 [genai-prices](https://github.com/pydantic/genai-prices) 提供者数组架构。例如：

```json
[
  {
    "id": "my-provider",
    "name": "My provider",
    "api_pattern": "gateway\\.example\\.com",
    "models": [
      {
        "id": "my-model",
        "match": { "equals": "my-model" },
        "prices": { "input_mtok": 2.5, "output_mtok": 10.0 }
      }
    ]
  }
]
```

费率以每百万代币美元为单位。编辑文件后重新启动Deep Agents代码。仅当 genai-prices 目录不包含该型号时，才适用定制费率。

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

会话退出时，如果在会话期间检测到较新版本，则会显示更新横幅作为提醒。## 显示选项

这些 `[ui]` 键可调整终端 UI 显示的内容。

### 会话使用统计

Deep Agents 代码显示会话结束时的会话使用统计信息（默认开启）：

<Tabs>
    <Tab title="Config file">
        ```toml
        [ui]
        show_usage_stats = false
        ```
    </Tab>
    <Tab title="Environment variable">
        ```bash
        export DEEPAGENTS_CODE_SHOW_USAGE_STATS=0
        ```
    </Tab>
</Tabs>

环境变量优先；将其设置为空值也会禁用统计信息。

### 折叠大粘贴

聊天输入中的大量粘贴会折叠为紧凑的占位符（默认打开）。要保持完整粘贴的文本可见：

<Tabs>
    <Tab title="Config file">
        ```toml
        [ui]
        collapse_pastes = false
        ```
    </Tab>
    <Tab title="Environment variable">
        ```bash
        export DEEPAGENTS_CODE_COLLAPSE_PASTES=0
        ```
    </Tab>
</Tabs>

## 自动记忆

Deep Agents 代码自动将学习内容保存到内存中。要在停止自动保存时继续加载内存，请更改 [automatic memory setting](/oss/deepagents/code/memory-and-skills#automatic-memory)：

<Tabs>
    <Tab title="Config file">
        ```toml title="~/.deepagents/config.toml"
        [memory]
        auto_save = false
        ```
    </Tab>
    <Tab title="Environment variable">
        ```bash
        export DEEPAGENTS_CODE_MEMORY_AUTO_SAVE=0
        ```
    </Tab>
</Tabs>

您仍然可以使用`/remember`明确保存记忆。环境变量优先于配置文件。

## 对话历史记录保留使用 `/offload` 卸载线程会在 `~/.deepagents/conversation_history/` 下写入 Markdown 存档。启动扫描会删除超过 30 天的存档。扫描仅直接触及存档目录内的常规`.md`文件，从不阻止启动，并记录和吞掉文件系统错误。

更改保留窗口，或使用 `0` 禁用清理：

<Tabs>
    <Tab title="Config file">
        ```toml title="~/.deepagents/config.toml"
        [history]
        retention_days = 90   # 0 disables the sweep
        ```
    </Tab>
    <Tab title="Environment variable">
        ```bash
        export DEEPAGENTS_CODE_HISTORY_RETENTION_DAYS=90
        ```
    </Tab>
</Tabs>

环境变量优先于配置文件。通过 `DEEPAGENTS_HOME` 配置文件，档案位于 `$DEEPAGENTS_HOME/conversation_history/` 下。

## 简历紧凑

恢复线程会恢复其完整上下文，因此下一轮会为此付出代价。当恢复的线程的上下文超过阈值时，Deep Agents代码会在下一条消息之前压缩它；拒绝是免费的，`/compact`（或`/offload`）仍然可用。默认阈值为 400,000 个代币；将其设置为 `0` 以禁用该优惠：

```toml title="~/.deepagents/config.toml"
[threads]
compact_on_resume_threshold = 200000
```

## 卸载

要删除 `dcode` 和 `deepagents-code` 二进制文件以及隔离的工具环境，请运行：

```bash
uv tool uninstall deepagents-code
```卸载命令不会删除用户配置或会话数据。 Deep Agents代码将这些文件存储在`~/.deepagents/`下，包括`config.toml`、`hooks.json`、全局`.env`和`.state/`内容，例如保存的会话和凭据。要同时删除该数据，请运行：

```bash
rm -rf ~/.deepagents
```

## 托管配置

托管配置允许管理员控制整个队列的Deep Agents代码设置。 Deep Agents 代码在用户环境变量和配置之前检查管理员拥有的`managed_config.toml`，因此用户无法覆盖其中定义的设置。

### 找到托管配置文件

Deep Agents 代码在每个操作系统上的固定位置查找 `managed_config.toml`：

|操作系统 |路径|
|------------------|------|
| macOS | `/Library/Application Support/dcode/managed_config.toml` |
| Linux | `/etc/dcode/managed_config.toml` |
|窗户| `<ProgramData>\dcode\managed_config.toml` |

在 Windows 上，Deep Agents 代码通过系统注册表查找 ProgramData，而不是 `%ProgramData%` 环境变量。环境变量无法更改托管配置位置。如果注册表不可用，则Deep Agents代码检查`C:\ProgramData\dcode\managed_config.toml`。如果该文件也丢失，Deep Agents 代码无法确定管理员是否配置了策略，因此使用配置的命令会停止而不是在没有配置的情况下运行。

### 创建托管策略使用与 `~/.deepagents/config.toml` 相同的 TOML 部分和键。运行 `dcode config --verbose --json` 查看可用的设置、它们接受的类型以及是否可以在配置文件中设置它们。

例如，以下策略固定手动批准模式，从`Shift+Tab`模式周期中删除YOLO，限制shell自动批准，限制模型使用，禁用JavaScript解释器，并启用客户端LangSmith秘密编辑：

```toml title="managed_config.toml"
[startup]
mode = "manual"
yolo_switcher = false

[shell]
allow_list = ["git", "make"]

[models]
allowed = ["acme:production", "openai:*"]

[interpreter]
enable_interpreter = false

[tracing]
langsmith_redact = true
```

只有管理员才有权编辑此文件。 Deep Agents 代码将其视为只读。用户仍然可以将首选项保存到 `config.toml`，但管理员设置在从 `managed_config.toml` 中删除之前仍然有效。

### 限制模型使用

将 `[models].allowed` 设置为精确、区分大小写的 `provider:model` 规范，或使用 `provider:*` 允许来自一个提供商的所有可发现模型。允许列表适用于启动默认值、`--model`、`/model`、保存的默认值、自动分类器、评分标准和显式本地子代理模型。

```toml title="managed_config.toml"
[models]
allowed = [
    "acme:production",
    "openai:*",
]
default = "acme:production"
auto_classifier = "openai:gpt-5.5"
```如果省略`allowed`，用户可以选择任意型号。空列表会阻止所有模型。如果用户的列表无效，Deep Agents 代码会阻止所有模型。如果管理员列表无效，Deep Agents 代码会阻止启动、重新加载和其他使用配置的命令。管理员列表会替换用户列表，而不是与其合并。托管的 `default`、`recent` 和 `auto_classifier` 值也必须出现在管理员的允许列表中。

在`[models.providers.<name>].models`下添加模型使其可供选择，但不会自动允许。将确切的型号或提供商通配符添加到允许列表中。通配符仅涵盖该提供商可用的模型。如果没有可用型号，Deep Agents代码无法选择默认值。当Deep Agents代码可以识别界面中输入的裸模型名称的提供者时，它会在检查白名单之前将该名称转换为`provider:model`。

<Warning>
    当用户使用 `--sandbox` 启动时，`[sandboxes].default` 选择后端。它不强制沙箱。没有 `--sandbox` 的启动在主机上运行，​​并报告它没有使用托管后端。
</Warning>

### 远程加载策略您可以将策略存储在中央服务器上，同时保留其位置在本地`managed_config.toml`：

```toml title="managed_config.toml"
[managed_config]
source = "https://config.example.com/dcode-policy.toml"
```

配置远程策略时，本地文件只能包含 `[managed_config].source` 设置。将完整的策略放入远程 TOML 文件中。 Deep Agents 代码未结合远程和本地策略设置，并且远程文件无法指向另一个源。

<Accordion title="View remote policy requirements">
    URL 必须使用 HTTPS，不包含凭据或查询参数，并且不超过 2,048 个 ASCII 字符。 Deep Agents 代码不遵循重定向、使用代理环境变量或将远程策略保存到磁盘。

    服务器必须返回一个非空的 UTF-8 TOML 文件，其 HTTP 状态为`200`，无压缩，最大大小为 1 MiB。五秒后请求超时。

    <Warning>
        `SSL_CERT_FILE` 和 `SSL_CERT_DIR` 可以更改 Python 信任的证书颁发机构。确保用户无法更改 Deep Agents 代码流程的这些变量。
    </Warning>
</Accordion>

### 验证托管策略

部署或更改策略后使用配置和诊断命令：

```bash
dcode config path
dcode config
dcode config get startup.mode
dcode doctor
````dcode config path` 显示托管文件位置以及Deep Agents 代码是否可以读取它。文件中的 `dcode config` 和 `dcode config get` 标签设置为 `managed config`。 `dcode doctor` 列出了解析错误、无效值以及需要更正的设置。对于远程策略，它还显示本地文件和远程 URL。如果更新失败，则确认会话是否继续使用之前的有效策略。

### 修复无效的策略

Deep Agents 当代码无法读取或解析托管文件、无法下载完整的远程策略或无法安全地应用策略时，如果没有所需的管理员设置，代码将停止而不是运行。使用配置退出的命令带有代码`78`。您仍然可以运行`dcode config`、`dcode doctor`、`dcode auth path`和帮助命令来解决问题。

如果在运行会话期间更新失败，Deep Agents 代码将继续使用之前的有效策略并报告失败。新进程在加载有效策略之前无法启动。

<Accordion title="View settings that fail closed">
    以下任何设置的无效值都会停止启动，因为回退到用户值可能会删除所需的限制：- `interpreter.enable_interpreter`
    - `interpreter.ptc`
    - `interpreter.ptc_acknowledge_unsafe`
    - `models.allowed`
    - `models.auto_classifier`
    - `runtime.recursion_limit`
    - `sandboxes.default`
    - `shell.allow_list`
    - `skills.extra_allowed_dirs`
    - `startup.mode`
    - `startup.yolo_switcher`
    - `tracing.langsmith_redact`

    如果已知的配置节具有错误的 TOML 结构，它也会停止启动。对于其他设置，Deep Agents 代码会忽略无效的管理员值，使用下一个有效源，并在 `dcode config` 和 `dcode doctor` 中列出忽略的设置。
</Accordion>

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
```<ResponseField name="DEEPAGENTS_CODE_VERSION" type="string" post={["optional"]}>
    要安装的确切软件包版本，例如`0.1.0`（或预发行版，例如`0.1.0rc1`）。与 `DEEPAGENTS_CODE_PRERELEASE` 互斥 — 设置两者都是错误的，因为确切的引脚已经选择了单个版本。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_PRERELEASE" type="string" post={["optional"]}>
    解析最新版本时应用 uv 预发布策略：`disallow`、`allow`、`if-necessary`、`explicit` 或 `if-necessary-or-explicit`。与`DEEPAGENTS_CODE_VERSION`互斥。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_EXTRAS" type="string" post={["optional"]}>
    要安装的以逗号分隔的 pip extra，例如`ollama`、`ollama,groq` 或 `daytona`。请参阅[⟦T298⟧](https://github.com/langchain-ai/deepagents/blob/main/libs/code/pyproject.toml)了解可用的附加功能。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_PYTHON" type="string" default="3.13" post={["optional"]}>
    用于安装的 Python 版本。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_SKIP_OPTIONAL" type="string" post={["optional"]}>
    设置为 `1` 以跳过可选工具检查。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_VERBOSE" type="string" post={["optional"]}>
    设置为 `1` 以显示 uv 的原始 stderr（时间线、未过滤的包差异）和默认安静状态线（可选工具检查、安装后页脚）。调试安装时很有用。
</ResponseField>

<ResponseField name="UV_BIN" type="string" post={["optional"]}>
    uv 二进制文件的路径。如果未设置则自动检测。
</ResponseField>

默认情况下，托管安装启用自动更新。要控制每个用户的更新，请在[⟦T303⟧](#managed-configuration)中设置`[update] auto_update = false`或`[update] check = false`。对于其他安装，请使用`DEEPAGENTS_CODE_AUTO_UPDATE=0`、`DEEPAGENTS_CODE_NO_UPDATE_CHECK=1`或`~/.deepagents/config.toml`中的相应设置。要通过托管网关路由每个用户的模型流量（在整个队列范围内配置网关密钥和基本 URL），请参阅 [Managed gateways](/oss/deepagents/code/config-file#managed-gateways)。

## 环境变量引用

所有 Deep Agents 代码特定的环境变量都使用 `DEEPAGENTS_CODE_` 前缀。请参阅 [⟦T308⟧ prefix](#deepagents_code_-prefix) 了解前缀如何替代第三方凭证。

<ResponseField name="DEEPAGENTS_CODE_AUTO_UPDATE" type="string" post={["optional"]}>
    切换自动 Deep Agents 代码更新。默认启用；设置为 `0`、`false`、`no` 或 `off`（或空值）以选择退出。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_AUTO_CLASSIFIER_TIMEOUT" type="integer" post={["optional"]}>
    [Auto mode](/oss/deepagents/code/approval-modes) 分类器审查每批门控操作的时间预算（以秒为单位）。有效范围：`1`–`300`。超出范围或非整数值将恢复为默认值 (`20`)。在提高此值之前请考虑[selecting a faster classifier model](/oss/deepagents/code/config-file#default-and-recent-model)。覆盖 `config.toml` 中的 `[models].auto_classifier_timeout`。参见[Auto classifier timeout](/oss/deepagents/code/config-file#auto-classifier-timeout)。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_DEBUG" type="string" post={["optional"]}>
    启用对文件的详细调试日志记录。接受`1`、`true`、`yes`、`on`（不区分大小写）作为启用； `0`、`false`、`no`、`off`、空字符串或未设置会禁用它。启用后，每个会话服务器日志文件将在关闭时保留，并将其路径打印到 stderr 以进行分类。
</ResponseField><ResponseField name="DEEPAGENTS_CODE_EXPERIMENTAL" type="string" post={["optional"]}>
    选择实验性的、不稳定的Deep Agents代码行为。设置为 `1` （或任何真值）以启用实验功能。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_EXTENSIONS" type="string" default="true" post={["optional"]}>
    启用或禁用每个源的[Python extension](/oss/deepagents/code/extensions)发现，包括`-e`/`--extension`。覆盖 `config.toml` 中的 `[extensions].enabled`。仍然需要`DEEPAGENTS_CODE_EXPERIMENTAL=1`。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_EXTENSIONS_TRUST" type="string" default='"ask"' post={["optional"]}>
    将默认项目扩展信任策略设置为 `ask`、`always` 或 `never`。覆盖 `config.toml` 中的 `[extensions].trust`。仅当您打开的每个项目都可信时才使用`always`。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_DEBUG_FILE" type="string" default="/tmp/deepagents_debug.log" post={["optional"]}>
    调试日志文件的路径。
</ResponseField>

<Note>
    下面的项目MCP信任变量需要`deepagents-code>=0.1.40`。该版本忽略了之前的`DEEPAGENTS_CODE_ENABLED_PROJECT_MCP_SERVERS`变量；使用 `DEEPAGENTS_CODE_DANGEROUSLY_ENABLE_PROJECT_MCP_SERVERS` 来实现相同的基于名称的行为。
</Note>

<ResponseField name="DEEPAGENTS_CODE_DISABLED_PROJECT_MCP_SERVERS" type="string" post={["optional"]}>
    以逗号分隔的项目 MCP 服务器名称始终按名称拒绝。 Deep Agents 代码将这些名称与`[mcp].disabled_project_servers`组合起来；拒绝赢得已保存的批准和 `--trust-project-mcp` 标志。
</ResponseField><ResponseField name="DEEPAGENTS_CODE_DANGEROUSLY_ENABLE_PROJECT_MCP_SERVERS" type="string" post={["optional"]}>
    以逗号分隔的项目 MCP 服务器名称，可按名称预先批准任何项目。这是一个进程范围的逃生口：同一服务器名称下的不同项目、命令更改或 URL 更改仍然匹配。设置后，此变量将替换保存的流程批准。如果可能，最好从项目 MCP 提示中保存批准。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_COLLAPSE_PASTES" type="string" default="true" post={["optional"]}>
    将大型聊天输入粘贴折叠到紧凑的占位符中。设置为假值（或空）以保持完整粘贴的文本可见。覆盖`[ui].collapse_pastes`。参见[Collapse large pastes](#collapse-large-pastes)。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_EXTRA_SKILLS_DIRS" type="string" post={["optional"]}>
    添加到 [skill containment allowlist](#skill-directory-allowlist) 的冒号分隔路径。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_HISTORY_RETENTION_DAYS" type="integer" default="30" post={["optional"]}>
    在启动扫描将其删除之前，已卸载的对话历史记录存档的保留天数； `0` 禁用清理。覆盖`[history].retention_days`。参见[Conversation history retention](#conversation-history-retention)。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_LANGSMITH_PROJECT" type="string" post={["optional"]}>
    覆盖 Deep Agents 代码自己的代理跟踪的 LangSmith 项目名称。 Shell 命令仍然使用用户的原始 `LANGSMITH_PROJECT` 运行，因此应用程序、测试或脚本跟踪可以出现在单独的项目中。参见[Trace with LangSmith](/oss/deepagents/code/quickstart#trace-with-langsmith)。
</ResponseField><ResponseField name="DEEPAGENTS_CODE_LANGSMITH_REDACT" type="string" default="true" post={["optional"]}>
    切换Deep Agents代码的LangSmith代理跟踪输入和输出的客户端秘密编辑。默认启用。接受 `1`、`true`、`yes` 或 `on` 以启用密文，并接受 `0`、`false`、`no` 或 `off` 来禁用密文，不区分大小写。启用编辑后，如果无法配置编辑，则会禁用该运行的跟踪。参见[Configure LangSmith trace redaction](/oss/deepagents/code/config-file#redact-langsmith-trace-secrets)。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_LANGSMITH_REPLICA_PROJECTS" type="string" post={["optional"]}>
    第二个LangSmith项目*也*写入代理跟踪。当设置和跟踪处于活动状态时，每个代理运行都会双重写入主项目（默认情况下来自`DEEPAGENTS_CODE_LANGSMITH_PROJECT`，或`deepagents-code`）和此项目。默认关闭。参见[Trace with LangSmith](/oss/deepagents/code/quickstart#trace-with-langsmith)。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_MEMORY_AUTO_SAVE" type="string" default="true" post={["optional"]}>
    让代理主动将学习内容保存到内存中。设置为假值（或空）以继续加载内存，同时停止无提示的自动保存；显式保存仍然有效。覆盖`[memory].auto_save`。参见[Automatic memory](/oss/deepagents/code/memory-and-skills#automatic-memory)。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_NO_UPDATE_CHECK" type="string" post={["optional"]}>
    设置后禁用自动更新检查。这也会阻止启动时自动安装更新。
</ResponseField><ResponseField name="DEEPAGENTS_HOME" type="string" post={["optional"]}>
    选择用户配置文件和信任根而不是默认的 `~/.deepagents`。接受绝对路径或以`~/`开头的路径； `~user` 表单和相对路径被拒绝。必须在继承的 shell 环境中设置 — 没有 `.env` 文件可以设置它。参见[Profile location](#profile-location-deepagents_home)。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_ONBOARDING" type="string" post={["optional"]}>
    覆盖首次运行的入门流程。设置为真实值以强制其在每次启动时打开；设置为虚假值以完全抑制它（对于 CI 和配置的机器有用）。对于默认的首次运行行为，保留未设置。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_PRICES_AUTO_UPDATE" type="string" default="true" post={["optional"]}>
    每小时在后台从上游刷新模型定价目录。设置为假值（或空）以选择退出。覆盖`[update].prices_auto_update`。参见[Pricing catalog auto-update](#pricing-catalog-auto-update)。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_READ_PROJECT_DOTENV" type="string" default="true" post={["optional"]}>
    将项目`.env`（从工作目录向上找到）加载到流程环境中。设置为假值以跳过不受信任的存储库的文件；全局`~/.deepagents/.env`仍在加载。覆盖`[startup].read_project_dotenv`。参见[Loading order and precedence](#loading-order-and-precedence)。
</ResponseField><ResponseField name="DEEPAGENTS_CODE_RECURSION_LIMIT" type="integer" post={["optional"]}>
    LangGraph图步预算，这是`dcode`代理图每回合可以执行的最大节点调用数。无效值会记录警告，并继续解决下一个来源。未设置时，Deep Agents代码继承`LANGGRAPH_DEFAULT_RECURSION_LIMIT`或将限制留给LangGraph服务器。参见[Agent runtime limits](/oss/deepagents/code/config-file#agent-runtime-limits)。
</ResponseField>

<ResponseField name="LANGGRAPH_DEFAULT_RECURSION_LIMIT" type="integer" post={["optional"]}>
    当没有 Deep Agents 递归限制源获胜时，上游 LangGraph 图步骤预算继承。在您的 shell 或全局 `~/.deepagents/.env` 中设置它。 Deep Agents 代码在项目 `.env` 中忽略它，因为它绕过了有界的 `runtime.recursion_limit` 解析器。参见[Agent runtime limits](/oss/deepagents/code/config-file#agent-runtime-limits)。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_SHELL_ALLOW_LIST" type="string" post={["optional"]}>
    允许使用逗号分隔的 shell 命令（或 `recommended` / `all`）。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_SHOW_REASONING" type="string" default="false" post={["optional"]}>
    在交互式脚本中和非交互式模式下的 stderr 上显示提供者可见的推理。覆盖`[ui].show_reasoning`； `--show-reasoning` 对于单次启动优先。参见[Show provider-visible reasoning](/oss/deepagents/code/config-file#show-provider-visible-reasoning)。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_SHOW_USAGE_STATS" type="string" default="true" post={["optional"]}>
    会话结束时显示会话使用统计信息。设置为假值（或空）以隐藏它们。覆盖`[ui].show_usage_stats`。参见[Session usage stats](#session-usage-stats)。
</ResponseField>

<ResponseField name="DEEPAGENTS_CODE_USER_ID" type="string" post={["optional"]}>
    将用户标识符附加到 LangSmith 跟踪元数据。
</ResponseField>

## 使用 `dcode doctor` 运行诊断当 Deep Agents 代码未正确启动、提供商或 MCP 服务器未连接、跟踪配置错误或者安装或更新看起来错误时，请使用 `dcode doctor`。它在不启动会话的情况下运行诊断并总结当前运行时状态。

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

  Tip: Run `dcode config` or `dcode config get <key>` to drill into config details.
       Run `dcode --version` (or `dcode -v`) for dependency versions.
```

<Tip>
    将 `dcode doctor` 与 `dcode config` 配对，检查整体运行状况并查看特定设置的来源。
</Tip>

## 数据位置

Deep Agents 代码将数据存储在两个目录层次结构中：

- **`~/.deepagents/`** — Deep Agents特定数据（座席记忆、技能、会话）。可通过[⟦T381⟧](#profile-location-deepagents_home)重新定位；然后，下面的路径将以该目录为根。
- **`~/.agents/`** — 与工具无关的数据（跨 AI CLI 工具共享的技能）

### 目录结构

```text
~/.deepagents/
├── .state/                  # Per-machine Deep Agents Code state (managed automatically)
│   ├── sessions.db          #   SQLite database for conversation checkpoints
│   ├── history.jsonl        #   Command input history
│   ├── chatgpt-auth.json    #   ChatGPT OAuth token for the openai_codex provider
│   ├── ...                  #   Other markers & credentials
├── extensions/              # User-wide Python extensions (experimental)
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
│   ├── extensions/          # Project Python extensions (requires trust; experimental)
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

#### 什么去哪里|数据|地点 |读/写 |笔记|
|------|----------|------------|--------|
| **会议** | `~/.deepagents/.state/sessions.db` |读/写| SQLite 检查点数据库 |
| **输入历史记录** | `~/.deepagents/.state/history.jsonl` |读/写 | JSON 行，向上/向下箭头调用 |
| **ChatGPT OAuth 令牌** | `~/.deepagents/.state/chatgpt-auth.json` |读/写|支持[⟦T386⟧](/oss/deepagents/code/providers)提供商；当您使用 ChatGPT 登录时创建并自动刷新。只能由您的用户帐户读取。 |
| **基本说明** |套餐`default_agent_prompt.md` |右 |不可变，通过 Deep Agents 代码升级进行更新 |
| **用户定制** | `~/.deepagents/{agent}/AGENTS.md` |读/写|附加到基本说明 |
| **项目说明** | `.deepagents/AGENTS.md` 或 `AGENTS.md` |右 |两者均已加载（如果存在）|
| **用户技能** | `~/.deepagents/{agent}/skills/` |读/写|代理特定技能 |
| **共享技能** | `~/.agents/skills/` |右 |与工具无关、跨 CLI |
| **项目技能** | `.deepagents/skills/` 或 `.agents/skills/` |右 |项目范围 |
| **用户Python扩展** | `~/.deepagents/extensions/` |读/写 |实验性；参见 [Python extensions](/oss/deepagents/code/extensions) |
| **项目 Python 扩展** | `.deepagents/extensions/` |右 |实验性；需要项目信任 |
| **自定义子代理** | `~/.deepagents/{agent}/agents/` |读/写 |用户定义的子代理 |
| **项目分代理** | `.deepagents/agents/` |右 |项目定义的子代理 |

### 优先规则当同一项目存在于多个位置时，**较高的优先级完全获胜**（不合并）。

#### 技能

优先顺序（从最低到最高）：

1. `~/.deepagents/{agent}/skills/` — 用户Deep Agents代码
2. `~/.agents/skills/` — 与用户工具无关
3. `.deepagents/skills/` — 项目Deep Agents代码
4. `.agents/skills/` — 项目工具无关*（最高）*

加载技能时，Deep Agents代码会验证解析的文件路径是否位于这些目录之一中。在所有技能根之外解析的符号链接将被拒绝。要允许其他目录中的符号链接目标，请参阅[⟦T403⟧](/oss/deepagents/code/configuration#skill-directory-allowlist)。

#### 子代理

优先顺序（从最低到最高）：

1. `~/.deepagents/{agent}/agents/`——用户级
2. `.deepagents/agents/` — 项目级别*（最高）*

每个子代理都是一个 `AGENTS.md` 文件，其中包含 YAML frontmatter（`name`、`description`、可选 `model`）和系统提示符的 Markdown 正文。有关完整格式参考，请参阅[Use subagents in Deep Agents Code](/oss/deepagents/code/subagents)。

#### 说明

所有指令源都是**组合**（不覆盖）：

1. 包基本提示*（始终加载）*
2. `~/.deepagents/{agent}/AGENTS.md` *（附加）*
3. `.deepagents/AGENTS.md` *（已附加）*
4. `AGENTS.md` 位于项目根目录*（已附加）*

### `.deepagents` vs `.agents`|目录 |目的|何时使用 |
|------------|---------|-------------|
| `.deepagents/` | Deep Agents 代码特定 |使用 Deep Agents 代码特定功能的技能和配置 |
| `.agents/` |与工具无关 |您希望在不同的 AI CLI 工具之间分享的技能 |

<Tip>
使用 `.agents/skills/` 获得可与任何 AI 编码助手配合使用的技能。
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
- [Python extensions](/oss/deepagents/code/extensions)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/configuration.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>