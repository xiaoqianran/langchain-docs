<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Quickstart | https://docs.langchain.com/oss/deepagents/code/quickstart -->

# 快速入门

安装Deep Agents代码，运行您的第一个任务，并使用交互或非交互模式

Deep Agents编码（`dcode`）是在[Deep Agents SDK](/oss/python/deepagents/quickstart)基础上构建的终端编码代理。本指南涵盖安装、您的第一个任务、日常交互使用、管道自动化以及LangSmith跟踪。有关功能概述，请参阅[Deep Agents Code overview](/oss/deepagents/code/overview)。有关`config.toml`和提供商设置，请参阅[Configuration](/oss/deepagents/code/configuration)。

## 安装并运行你的第一个任务

<Steps>
  <Step title="Install and launch" icon="terminal">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl -LsSf https://langch.in/dcode | bash
    ```
  </Step>

  <Step title="Add provider credentials" icon="key">
    Deep Agents 代码适用于任何调用 LLM 的工具。 OpenAI、Anthropic 和 Google 开箱即用。

    使用 `/auth` 命令与提供商连接。有关完整列表和凭证详细信息，请参阅[Providers](/oss/deepagents/code/providers)。

    <Note>
      网络搜索使用[Tavily](https://tavily.com)。添加带有 `/auth` 的密钥。参见[Enable web search](/oss/deepagents/code/credentials#enable-web-search-with-tavily)。
    </Note>
  </Step>

  <Step title="Give the agent a task" icon="message">
    ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    Create a Python script that prints "Hello, World!"
    ```

    代理会解释查询并提出带有差异的更改，以供您在修改文件之前批准。如果需要，它可以运行 shell 命令来测试代码、检查文档或在网络上搜索最新信息。
  </Step>

  <Step title="Enable tracing (optional)" icon="chart-dots">
    要在 LangSmith 中记录代理操作、工具调用和决策，请运行 `/auth` 并添加您的 LangSmith API 密钥。跟踪将在下次启动时启用。有关项目命名、高级选项以及 CI 或无头设置，请参阅 [Trace with LangSmith](#trace-with-langsmith)。
  </Step>
</Steps>

<Note>
  Deep Agents Windows 上不正式支持代码。 Windows用户可以尝试在[Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/install)下运行它。
</Note>

## 交互模式

就像在聊天界面中一样自然地打字。
代理使用其内置工具、技能和内存来帮助您完成任务。

<AccordionGroup>
  <Accordion title="Slash commands" icon="slash">
    在 Deep Agents 代码会话中使用以下命令：

    * `/model`：切换模型或打开交互式模型选择器。
    * `/effort`：设置当前模型的推理工作量。
    * `/agents`：预配置代理之间的热交换，无需重新启动。相关标志请参见[Command reference](/oss/deepagents/code/cli-reference#command-line-options)。
    * `/auth`：管理模型提供者和服务（例如 Tavily 网络搜索）存储的 API 密钥。详情请参阅[Provider credentials](/oss/deepagents/code/credentials)。
    * `/goal <objective>`：根据可衡量的目标起草验收标准。参见[Goals and rubrics](/oss/deepagents/code/goals-and-rubrics)。
    * `/rubric`：设置明确的评分接受标准。参见[Goals and rubrics](/oss/deepagents/code/goals-and-rubrics)。
    * `/remember [context]`：回顾对话并更新记忆和技能。可以选择传递附加上下文。
    * `/skill:<name> [args]`：直接通过名称调用技能。该技能的 `SKILL.md` 指令将与您提供的任何参数一起注入到提示中。* `/skill-creator [task]`：创建有效代理技能的指南。
    * `/offload`（别名`/compact`） - 通过使用摘要占位符将消息卸载到存储来释放上下文窗口空间。如果需要，代理可以从卸载的文件中检索完整的历史记录。
    * `/context`：打开颜色编码的上下文窗口使用报告，其中包含模型容量、使用类别和剩余空间。
    * `/tokens`：显示当前上下文窗口令牌使用情况明细。
    * `/clear`：清除对话历史记录并启动新线程。
    * `/force-clear`：停止活动工作，清除聊天，并启动新线程。
    * `/copy`：将最新的助手消息复制到剪贴板。
    * `/threads`：浏览并恢复之前的对话线程。
    * `/mcp [login <server> | reconnect]`：显示活动的 MCP 服务器和工具。 `login <server>` 运行服务器的 OAuth 流程； `reconnect` 加载延迟登录。
    * `/plugins`：管理[plugins and marketplaces](/oss/deepagents/code/plugins)。
    * `/notifications`：配置启动警告首选项。
    * `/reload`：重新读取`.env`文件，刷新配置，重新发现技能，无需重启。这还会重新加载插件技能和 MCP 配置。对话状态被保留。有关覆盖行为，请参阅[⟦T47⟧ prefix](/oss/deepagents/code/configuration#deepagents_code_-prefix)。* `/theme`：打开交互式主题选择器以切换颜色主题。内置主题以及任何 [user-defined themes](/oss/deepagents/code/configuration#themes) 都可用。
    * `/scrollbar`：显示或隐藏聊天滚动条。
    * `/line-numbers`：在新差异中显示或隐藏文件相关行号。参见[Diff line numbers](/oss/deepagents/code/config-file#diff-line-numbers)。
    * `/update`：检查并安装Deep Agents 内联代码更新。检测您的安装方法（uv、Homebrew、pip）并运行适当的升级命令。
    * `/auto-update`：打开或关闭自动更新。
    * `/install`：安装可选集成。
    * `/trace`：在LangSmith中打开当前线程。
    * `/editor`：在外部编辑器中打开当前提示符 (`$VISUAL` / `$EDITOR`)。参见[External editor](#external-editor)。
    * `/restart`：重启代理服务器。
    * `/timestamps`：切换消息时间戳页脚。
    * `/changelog`：在浏览器中打开Deep Agents代码更改日志。
    * `/docs`：在浏览器中打开文档。
    * `/feedback`：发送反馈或报告问题。
    * `/version`（别名`/about`）- 显示已安装的`deepagents-code`和SDK版本。
    * `/help`：显示帮助和可用命令。
    * `/quit`：退出应用程序。
  </Accordion>

  <Accordion title="Shell commands" icon="prompt">
    输入 `!` 进入 shell 模式，然后输入命令。

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    git status
    npm test
    ls -la
    ```
  </Accordion>

  <Accordion title="Keyboard shortcuts" icon="keyboard">
    **一般**|快捷方式 |行动|
    | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
    | `Enter` |提交提示 |
    | `Shift+Enter`、`Ctrl+J`、`Alt+Enter` 或 `Ctrl+Enter` |插入换行符 |
    | `@filename` |自动完成文件并注入内容 |
    | `Shift+Tab` 或 `Ctrl+T` |在手动和自动之间切换 [approval mode](/oss/deepagents/code/approval-modes) |
    | `Ctrl+X` |在外部编辑器中打开提示 |
    | `Ctrl+N` |查看待处理的通知 || `Ctrl+O` |展开/折叠最新的工具输出 |
    | `Escape` |中断当前操作 |
    | `Ctrl+C` |中断或退出 |
    | `Ctrl+D` |退出 |

    **提示中的文本编辑**

    聊天输入使用标准的 readline 样式绑定：|快捷方式|行动|
    | ---------------------------- | ----------------------------------- |
    | `Ctrl+A` 或 `Home` |将光标移至行首 |
    | `Ctrl+E` 或 `End` |将光标移至行尾 |
    | `Ctrl+U` |删除从光标到行首 |
    | `Ctrl+K` |删除从光标到行尾 |
    | `Ctrl+W` 或 `Ctrl+Backspace` |删除左边的单词 |
    | `Ctrl+Left` / `Ctrl+Right` |向左/向右移动光标一个字 |

    <Note>
      **macOS `Cmd+Left` / `Cmd+Right` / `Cmd+Delete`**

      终端模拟器会在 `Cmd` 修改的密钥到达正在运行的应用程序之前拦截它们，因此 Deep Agents 代码永远不会直接接收它们。相反，终端将它们转换为上面的 readline 快捷方式。* **幽灵：** 开箱即用。默认情况下，`Cmd+Left`、`Cmd+Right` 和 `Cmd+Delete` 会转换为 `Ctrl+A`、`Ctrl+E` 和 `Ctrl+U`。
      * **iTerm2：** 默认情况下不受约束。在 **设置 → 配置文件 → 按键 → 按键映射** 下添加以下内容作为 `Send Text with vim special chars`：
        * `Cmd+Left` → `\x01` (Ctrl+A)
        * `Cmd+Right` → `\x05` (Ctrl+E)
        * `Cmd+Delete` → `\x15` (Ctrl+U)
      * **Terminal.app：** 此重映射没有本机 UI。直接使用基于`Ctrl`的快捷键。

      按字移动 (`Option+Left` / `Option+Right`) 的处理方式相同：终端发送 `Esc+b` / `Esc+f`，Deep Agents 代码将其解释为字左/右。
    </Note>
  </Accordion>
</AccordionGroup>

### 检查上下文窗口的使用情况

运行 `/context` 打开当前模型上下文窗口使用情况的颜色编码报告。该报告显示模型的上下文限制、已使用的令牌、剩余容量以及对话和系统提示以及这些值可用时的工具之间的细分。提供商报告的总数仍然与当地对话的估计不同。当提供程序总数不可用时，报告会将对话计数标记为估计值，并将总使用量标记为不可用。当您想要在对话记录中使用文本摘要时，请使用`/tokens`。

### 外部编辑器

按 `Ctrl+X` 或键入 `/editor` 在外部编辑器中编写提示。 Deep Agents 代码先检查 `$VISUAL`，然后检查 `$EDITOR`，然后回退到 `vi` (macOS/Linux) 或 `notepad` (Windows)。 GUI 编辑器（VS Code、Cursor、Zed 等）会自动接收 `--wait` 标志，因此 Deep Agents 代码会阻塞，直到您关闭文件。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Set in your shell profile (~/.zshrc, ~/.bashrc, etc.)
export VISUAL="code"    # GUI editor (--wait auto-injected)
export EDITOR="nvim"    # Terminal fallback
```

## 非交互模式和管道

使用 `-n` 运行单个任务而不启动交互式 UI：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode -n "Write a Python script that prints hello world"
```

每个非交互式运行都会启动一个新线程 - 调用之间不会携带对话历史记录。基于文件的状态（内存、技能、配置）仍然存在。

您还可以通过 stdin 管道输入。当输入通过管道传输时，Deep Agents代码会自动以非交互方式运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
echo "Explain this code" | dcode
cat error.log | dcode -n "What's causing this error?"
git diff | dcode -n "Review these changes"
git diff | dcode --skill code-review -n 'summarize changes'
```

当您将管道输入与 `-n` 或 `-m` 组合时，管道内容首先出现，然后是您传递给标志的文本。

<Note>
  最大管道输入大小为 10 MiB。
</Note>默认情况下，在非交互模式下禁用 Shell 执行。使用 `-S`/`--shell-allow-list` 启用特定命令（例如，`-S "pytest,git,make"`），使用 `recommended` 实现安全默认值，或使用 `all` 允许任何命令。

<AccordionGroup>
  <Accordion title="Cap turn count" icon="gauge">
    CI/CD 管道中长时间运行或行为不当的代理可能会无限期循环。 `--max-turns N` 为操作员提供了硬性上限，而无需触及 SDK 内部结构：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    dcode -n "fix the failing tests" --max-turns 10
    ```

    `N` 必须是正整数，并覆盖内部安全默认值，否则会限制失控循环。当超出预算时，以代码 124 退出（与 GNU `timeout` 匹配），因此 CI 可以区分预算命中和一般失败。需要 `-n` 或管道标准输入；否则退出并返回代码 2。

    有关基于时间的限制而不是（或除此之外）回合计数限制，请参阅[Cap wall-clock time with ⟦T136⟧](#non-interactive-mode-and-piping)。
  </Accordion>

  <Accordion title="Cap wall-clock time" icon="clock">
    `--timeout SECONDS` 对非交互式运行实施硬挂钟限制。它通过基于时间的预算补充了`--max-turns`（轮次计数）——无论先达到哪个限制都会取消代理。

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Fail fast in CI if the task takes more than 2 minutes
    dcode -n "run the test suite and summarise failures" --timeout 120

    # Combine with --max-turns—whichever limit is hit first stops the agent
    dcode -n "refactor auth module" --timeout 300 --max-turns 20
    ```

    到期时，代理将被取消，流程会以代码 124 退出，与`--max-turns` 使用的代码相同，因此 CI 可以统一处理两个预算命中。需要 `-n` 或管道标准输入；否则退出并返回代码 2。
  </Accordion><Accordion title="Clean output and buffering" icon="buffer">
    使用 `-q` 进行干净的输出，适合通过管道传输到其他命令，并使用 `--no-stream` 在写入标准输出之前缓冲完整响应（而不是流式传输）：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    dcode -n "Generate a .gitignore for Python" -q > .gitignore
    dcode -n "List dependencies" -q --no-stream | sort
    ```

    在非交互模式下，代理被指示做出合理的假设并自主进行，而不是提出澄清问题。它还支持非交互式命令变体（例如，`npm init -y`、`apt-get install -y`）。
  </Accordion>

  <Accordion title="Shell execution examples" icon="shield-check">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Allow specific commands (validated against the list)
    dcode -n "Run the tests and fix failures" -S "pytest,git,make"

    # Use the curated safe-command list
    dcode -n "Build the project" -S recommended

    # Allow any shell command
    dcode -n "Fix the build" -S all
    ```
  </Accordion>
</AccordionGroup>

<Warning>
  **谨慎使用。**

  `-S all`（或`--shell-allow-list all`）允许代理执行任意 shell 命令，无需人工确认。
</Warning>

## 使用 LangSmith 进行追踪

启用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-code-quickstart) 跟踪以查看 LangSmith 项目中的代理操作、工具调用和决策。

运行 `/auth` 并添加您的 LangSmith API 密钥。跟踪在下次启动时启用，并在会话之间持续存在。有关凭证管理器的详细信息，请参阅[Provider credentials](/oss/deepagents/code/credentials#use-%2Fauth-recommended)。

要自定义项目名称或在不使用 TUI 的情况下配置跟踪，请将密钥添加到 `~/.deepagents/.env`，以便在每个会话中启用跟踪，而无需按 shell 导出：

```bash title="~/.deepagents/.env" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_...
DEEPAGENTS_CODE_LANGSMITH_PROJECT=deepagents-code  # Project for Deep Agents Code's own traces; defaults to "deepagents-code"
```使用 `DEEPAGENTS_CODE_LANGSMITH_PROJECT` 来命名接收 Deep Agents 代码自身跟踪的项目。它的作用域为 Deep Agents 代码，因此它不受项目的 `.env` 中设置的 `LANGSMITH_PROJECT` 的影响（它路由该项目的应用程序跟踪；请参阅下面的 **将代理跟踪与应用程序跟踪分开**）。

要覆盖特定工作目录的项目，请将 `DEEPAGENTS_CODE_LANGSMITH_PROJECT` 添加到该目录中的 `.env`。满载订单请参见[environment variables](/oss/deepagents/code/configuration#environment-variables)。

对于 CI、无头运行或临时覆盖，请改为设置 shell 环境变量。 Shell 导出始终优先于 `.env` 值：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING=false
```

<Accordion title="Separate agent traces from app traces">
  Deep Agents 代码可以产生两种LangSmith 痕迹：

  * `Agent traces` 是Deep Agents 代码自己的模型调用、工具调用、编排和中间件。
  * `Shell-command traces` 是Deep Agents 代码在 shell 中为您运行的代码发出的跟踪，例如测试、脚本或本地 LangGraph 应用程序。

  要将Deep Agents代码自己的跟踪发送到专用项目，请设置`DEEPAGENTS_CODE_LANGSMITH_PROJECT`：

  ```bash title="~/.deepagents/.env" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Example value; use any LangSmith project name you want.
  DEEPAGENTS_CODE_LANGSMITH_PROJECT=deepagents-code
  ```

  然后为您的应用程序跟踪配置`LANGSMITH_PROJECT`：

  ```bash title=".env" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  LANGSMITH_PROJECT=customer-support-agent
  ```

  例如，假设您要求 Deep Agents 代码来调试失败的 LangGraph 测试：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv run pytest tests/test_escalation_flow.py
  ```如果该测试在启用 LangSmith 跟踪的情况下运行您的应用程序，则这些应用程序跟踪将由 shell 进程创建并转到 `customer-support-agent`。 Deep Agents 代码自身的推理和工具使用痕迹转到`deepagents-code`。

  您还可以使用 [⟦T161⟧ prefix](/oss/deepagents/code/configuration#deepagents_code_-prefix)（例如 `DEEPAGENTS_CODE_LANGSMITH_API_KEY`）将 LangSmith 凭证范围限定为 Deep Agents 代码。
</Accordion>

<Accordion title="Dual-write traces to a second project">
  要将代理跟踪镜像到第二个LangSmith项目，请设置`DEEPAGENTS_CODE_LANGSMITH_REPLICA_PROJECTS`。这对于将相同的跟踪发送到个人项目和共享团队项目非常有用。

  ```bash title="~/.deepagents/.env" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  DEEPAGENTS_CODE_LANGSMITH_REPLICA_PROJECTS=team-shared
  ```

  当设置和跟踪处于活动状态时，每个代理运行都会写入主项目（默认为`DEEPAGENTS_CODE_LANGSMITH_PROJECT`，或`deepagents-code`）和您在此处命名的项目。保持变量未设置，以像往常一样写入单个项目。
</Accordion>

配置后，Deep Agents代码会显示一个状态行，其中包含指向LangSmith项目的链接。在支持的终端中，单击链接直接打开。您还可以使用 `/trace` 打印 URL 并在浏览器中打开它。

```sh theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
✓ LangSmith tracing: 'my-project'
```

<Tip>
  我们建议您还设置 [LangSmith Engine](/langsmith/engine)，它可以监视您的痕迹、检测问题并提出修复建议。
</Tip>

## 另请参阅

* [Deep Agents Code overview](/oss/deepagents/code/overview)
* [Configuration](/oss/deepagents/code/configuration)
* [Provider credentials](/oss/deepagents/code/credentials)
* [CLI reference](/oss/deepagents/code/cli-reference)
* [Providers](/oss/deepagents/code/providers)
* [Memory and skills](/oss/deepagents/code/memory-and-skills)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>