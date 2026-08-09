<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Cursor sessions | https://docs.langchain.com/langsmith/trace-with-cursor -->

# 跟踪光标会话

在 LangSmith 中捕获游标代理转动、工具调用、模型元数据、令牌使用、附件和子代理。

使用 [Cursor hooks](https://cursor.com/docs/agent/hooks) 跟踪 LangSmith 中的 [Cursor](https://cursor.com/) 代理会话。每个回合都成为一个跟踪，每个游标对话分组为一个线程，它捕获提示、模型响应、工具调用、令牌使用和子代理活动。使用跟踪来调试代理行为、审核工具调用、跟踪每轮令牌花费以及比较游标运行。

插件源可在 [⟦T7⟧](https://github.com/langchain-ai/langsmith-cursor-plugins) 获取。

## 先决条件

在设置跟踪之前，请确保您拥有：

* 已安装[Cursor](https://cursor.com/)。
* [Node.js](https://nodejs.org/) 22.13 或更高版本。这些挂钩使用内置的 `node:sqlite` 模块从 Cursor 的本地数据库恢复附件。
* A [LangSmith API key](/langsmith/create-account-api-key)。

## 安装并启用插件

直接从 Cursor 设置中的 GitHub 存储库安装插件：

1. 打开 **光标 → 设置 → 插件**。
2. 将`https://github.com/langchain-ai/langsmith-cursor-plugins`粘贴到插件链接字段中。
3. 确认添加 **LangSmith Tracing for Cursor**。

这是推荐的路径：它安装钩子而无需克隆或构建步骤，因为存储库附带了预编译的包。

<Warning>
  安装后完全重新启动 Cursor，以便重新加载 `hooks.json`。
</Warning>### 替代方案：从本地克隆安装

从 [⟦T11⟧](https://github.com/langchain-ai/langsmith-cursor-plugins) 的本地克隆安装挂钩。这为所有 Cursor 项目写入 `~/.cursor/hooks.json`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
node scripts/install.mjs
```

要将挂钩范围改为单个项目，请从项目目录运行安装程序：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
node scripts/install.mjs --project
```

要预览挂钩配置而不写入它，请运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
node scripts/install.mjs --print
```

安装程序将其条目与任何现有的`hooks.json`合并。提交的 `bundle/` 意味着这些命令在没有 `pnpm install` 或 `pnpm build` 的情况下运行——只有在对 TypeScript 源进行更改时才需要这些命令。

安装后重新启动 Cursor，以便重新加载 `hooks.json`。

## 配置跟踪

在设置`enabled`（或`TRACE_TO_LANGSMITH=true`）和 API 密钥之前，跟踪将被禁用。使用 [environment variables](#environment-variables)、[JSON config file](#config-file) 或两者配置凭据。

### 环境变量

每个 `LANGSMITH_CURSOR_*` 变量还接受较短的 `LANGSMITH_*` 形式。当两者都设置时，`LANGSMITH_CURSOR_*`优先。|变量|默认|描述 |
| --------------------------------- | --------------------------------- | ------------------------------------------------------------------------ |
| `TRACE_TO_LANGSMITH` | `false` |设置为 `"true"` 以启用跟踪。                           |
| `LANGSMITH_CURSOR_API_KEY` | - | LangSmith API 密钥。回落到`LANGSMITH_API_KEY`。        |
| `LANGSMITH_CURSOR_ENDPOINT` | `https://api.smith.langchain.com` | LangSmith API URL。回落至`LANGSMITH_ENDPOINT`。       |
| `LANGSMITH_CURSOR_PROJECT` | `cursor` |朗史密斯项目名称。回落到`LANGSMITH_PROJECT`。   |
| `LANGSMITH_CURSOR_METADATA` | - | JSON 对象合并到根跟踪元数据中。                 |
| `LANGSMITH_CURSOR_RUNS_ENDPOINTS` | - |副本目标的 JSON 数组。                          |
| `LANGSMITH_CURSOR_ATTACHMENTS` | `true` |设置为 `"false"` 以禁用附件丰富。           |
| `LANGSMITH_CURSOR_DB_PATH` |平台默认|覆盖用于附件的光标`state.vscdb`路径。 |
| `LANGSMITH_CURSOR_STATE_FILE` | `~/.cursor/langsmith-state.json` |覆盖磁盘上的事件缓冲区状态文件。                || `LANGSMITH_CURSOR_LOG_FILE` | `~/.cursor/langsmith-hook.log` |覆盖挂钩日志文件。                                  |
| `LANGSMITH_CURSOR_DEBUG` | `false` |设置为 `"true"` 以启用详细的挂钩日志记录。              |

将变量添加到 shell 配置文件（`~/.zshrc`、`~/.bashrc` 或 `~/.bash_profile`）：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export TRACE_TO_LANGSMITH="true"
export LANGSMITH_CURSOR_API_KEY="<your-langsmith-api-key>"
export LANGSMITH_CURSOR_PROJECT="cursor"
```

要验证挂钩活动，请查看日志文件：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
tail -f ~/.cursor/langsmith-hook.log
```

### 配置文件

使用 `~/.cursor/langsmith.json` 进行全局默认设置，或使用 `./.cursor/langsmith.json` 进行项目级设置。设置按此顺序解析，后面的源覆盖前面的源：默认值、全局配置、项目配置、环境变量。

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "enabled": true,
  "api_key": "<your-langsmith-api-key>",
  "api_url": "https://api.smith.langchain.com",
  "project": "cursor"
}
```|领域 |环境变量|默认|描述 |
| ---------------- | ------------------------------------------------------------------------ | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `enabled` | `TRACE_TO_LANGSMITH` | `false` |设置为 `true` 以启用跟踪。                                                                          |
| `api_key` | `LANGSMITH_CURSOR_API_KEY`、`LANGSMITH_API_KEY` | - | LangSmith API 密钥。                                                                                        |
| `api_url` | `LANGSMITH_CURSOR_ENDPOINT`、`LANGSMITH_ENDPOINT` | `https://api.smith.langchain.com` | LangSmith API URL。                                                                                        || `project` | `LANGSMITH_CURSOR_PROJECT`、`LANGSMITH_PROJECT` | `cursor` |朗史密斯项目名称。                                                                                   |
| `metadata` | `LANGSMITH_CURSOR_METADATA`、`LANGSMITH_METADATA` | - |对象合并到根跟踪元数据中。                                                                   |
| `replicas` | `LANGSMITH_CURSOR_RUNS_ENDPOINTS`、`LANGSMITH_RUNS_ENDPOINTS` | - |将跟踪复制到的其他 LangSmith 目标。                                                 |
| `attachments` | `LANGSMITH_CURSOR_ATTACHMENTS` | `true` |设置为 `false` 以跳过使用 Cursor 本地数据库中的图像和文件附件字节进行丰富的轮次。 |
| `cursor_db_path` | `LANGSMITH_CURSOR_DB_PATH` |平台默认|覆盖用于附件的光标`state.vscdb`路径。                                              |

将包含 API 密钥的配置文件置于版本控制之外。

## 追踪什么

该插件监听 Cursor hooks 并在每个代理轮次中组装一个跟踪：* **转弯**：每个转弯都成为其自己的轨迹，使用 `thread_id` = 光标的 `conversation_id` 分组为一个线程。跟踪嵌套模型运行，并且任何工具或子代理在转弯下方运行。
* **令牌使用**：模型运行时每回合`usage_metadata`。
* **模型和提供商**：`ls_model_name` 和 `ls_provider`，从 Cursor 的模型标签标准化为规范的提供商 ID（例如，`claude-4.6-sonnet` 变为 `claude-sonnet-4-6`）。自动模式向提供商`cursor`报告`default`。
* **工具调用**：工具针对成功调用和失败调用运行，并带有输入和输出。
* **附件**：从 Cursor 的本地数据库恢复并内联呈现在用户消息上的图像和文件附件。将 `attachments` 设置为 `false` 可跳过此步骤。
* **子代理**：每个子代理显示为嵌套链运行，其下方有自己的工具调用，链接到父回合。

<Note>
  该插件不会在本地计算成本。由于 `ls_model_name` 已标准化为规范 ID，并且 `usage_metadata` 带有代币细分，因此 LangSmith 的服务器端模型价格表在 UI 中呈现成本。自动模式报告`default`，LangSmith 无法定价。
</Note><Warning>
  该插件上传 Cursor 对话数据，包括提示、模型响应、工具输入和输出以及恢复的附件。不要对包含您不希望存储在 LangSmith 中的数据的会话启用跟踪。
</Warning>

### 跟踪元数据

每次运行都在 `run.extra.metadata` 上承载共享的 `coding-agent-v1` 元数据合约，它可以识别来自任何编码代理（Claude Code、Codex、Cursor）的跟踪，并使用相同的稳定密钥进行分组。

|范围 |按键|
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ||永远在场| `ls_agent_type`（`"root"`、`"subagent"`、`"middleware"`、`"compaction"`）、`ls_agent_purpose`（`"coding"`）、`ls_integration`（`"cursor"`）、`ls_agent_runtime` (`"Cursor"`), `ls_trace_schema_version` (`"coding-agent-v1"`), `thread_id` (= 光标的`conversation_id`)。 |
|在已知的地方出现 | `ls_integration_version`、`ls_agent_runtime_version`（光标的`cursor_version`）、`turn_id`（= 光标的`generation_id`）、`turn_number`、`repository_url`、`repository_provider`、 `repository_name`、`git_branch`、`git_commit_sha`、`cwd`。                                |
|上下文 | `local_username`、`user_email`（暂定）。                                                                                                                                                                                                                              |
|子代理仅运行 | `ls_subagent_id`，`ls_subagent_type`。                                                                                                                                                                                                                                      |
|工具仅运行 | `ls_tool_name`（仅当运行名称与本机工具名称不同时发出）。                                                                                                                                                                                         ||仅模型和工具运行 | `ls_provider`、`ls_model_name`、`ls_invocation_params`、`usage_metadata`。                                                                                                                                                                                                  |

Cursor 的钩子不会公开 `user_id`、`sandbox_type` 或 `approval_policy` 的稳定源，因此这些键被省略。

## 在 LangSmith 中查看痕迹

打开配置好的 LangSmith 项目（默认`cursor`）并完成光标转动。该插件每回合上传一个跟踪，结构如下：

```
Cursor Turn N (chain)
├── <provider> (llm)   model and provider, token usage, assistant text
├── Read / Shell / ... (tool)
└── Task (tool)        subagent (type and task)
```

要对相关回合进行分组，请在项目的 **Threads** 选项卡中筛选 `thread_id`。

## 已知限制

* **子代理令牌使用情况**：游标不会通过挂钩或其本地数据库公开每个子代理使用情况细分，因此子代理的 `Task` 运行携带其工具调用，但没有令牌计数。

## 故障排除

如果 LangSmith 中没有出现痕迹：* 确认 `TRACE_TO_LANGSMITH=true` 或 `"enabled": true` 在 Cursor 进程可以看到的配置文件中设置。
* 确认`LANGSMITH_CURSOR_API_KEY`或`LANGSMITH_API_KEY`已设置且有效。
* 确认安装钩子后光标已完全重新启动。
* 跟踪钩子日志以查找错误：`tail -f ~/.cursor/langsmith-hook.log`。
* 使用 `LANGSMITH_CURSOR_DEBUG=true` 启用详细日志记录并重新检查日志。
* 如果运行在错误的项目中，请设置 `LANGSMITH_CURSOR_PROJECT` 或 `project` 配置键。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-cursor.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>