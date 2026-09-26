<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace OpenAI Codex sessions | https://docs.langchain.com/langsmith/trace-with-codex -->

# 跟踪 OpenAI Codex 会话

[⟦T8⟧](https://github.com/langchain-ai/langsmith-codex-plugins) 市场提供了一个跟踪插件，该插件将 [OpenAI Codex](https://developers.openai.com/codex) 会话数据发送到 LangSmith。使用它来检查 Codex 工作流程中的代理轮次、模型元数据、令牌使用情况、工具调用和子代理线程。

## 先决条件

在设置跟踪之前，请确保您拥有：

- [Node.js](https://nodejs.org/) 22.x 或更高版本。
- [Codex CLI](https://developers.openai.com/codex/quickstart?setup=cli) v0.153.4 或更高版本，启用并信任同步 `UserPromptSubmit` 插件挂钩。
- [LangSmith API key](/langsmith/create-account-api-key)。

## 安装并启用插件

使用 Codex CLI 添加市场：

```bash
codex plugin marketplace add langchain-ai/langsmith-codex-plugins
```

在 `~/.codex/config.toml` 中全局启用跟踪插件，或仅在 `.codex/config.toml` 中为特定项目启用跟踪插件：

```toml
[plugins."tracing@langsmith-codex-plugins"]
enabled = true
```

然后使用 `/hooks` 信任该插件的钩子，或者在出现提示时在 Codex 的插件 UI 中信任该插件。单独启用插件并不信任它的钩子。

## 配置跟踪

跟踪将被禁用，直到配置文件中的 `TRACE_TO_LANGSMITH` 为 `"true"` 或 `enabled` 为 `true`。使用环境变量和/或 JSON 配置文件配置凭据。

### 环境变量

该插件首先读取 Codex 特定的变量，然后回退到通用 LangSmith SDK 变量。|变量|必填 |默认 |描述 |
| ---| ---| ---| ---|
| `TRACE_TO_LANGSMITH` |是的 | - |设置为 `"true"` 以启用跟踪。 |
| `LANGSMITH_CODEX_API_KEY` |有条件| - | LangSmith API 密钥。回落至`LANGSMITH_API_KEY`。除非每个副本都提供自己的 API 密钥，否则是必需的。 |
| `LANGSMITH_CODEX_ENDPOINT` |没有 | `https://api.smith.langchain.com` | LangSmith API URL。回落到`LANGSMITH_ENDPOINT`。 |
| `LANGSMITH_CODEX_PROJECT` |没有 | `codex` | LangSmith 项目名称。回落到`LANGSMITH_PROJECT`。 |
| `LANGSMITH_CODEX_METADATA` |没有 | - | JSON 对象合并到根跟踪元数据中。回落到`LANGSMITH_METADATA`。 |
| `LANGSMITH_CODEX_RUNS_ENDPOINTS` |没有 | - |副本目标的 JSON 数组。回落至`LANGSMITH_RUNS_ENDPOINTS`。 |
| `LANGSMITH_CODEX_REDACT` |没有 | `true` |设置为假值以禁用秘密编辑。回落到`LANGSMITH_REDACT`。 |
| `LANGSMITH_CODEX_REDACT_EXTRA` |没有 | - |额外 `{ pattern, replace }` 编辑规则的 JSON 数组。回落到`LANGSMITH_REDACT_EXTRA`。 |

将变量添加到 shell 配置文件（`~/.zshrc`、`~/.bashrc` 或 `~/.bash_profile`）：

```bash
export TRACE_TO_LANGSMITH="true"
export LANGSMITH_CODEX_API_KEY="<your-langsmith-api-key>"
export LANGSMITH_CODEX_PROJECT="codex"
```

### 配置文件

使用 `<project>/.codex/langsmith.json` 进行项目级设置，或使用 `~/.codex/langsmith.json` 进行全局默认设置。全局文件首先加载，项目文件覆盖它，并且匹配的环境变量优先于两者。

```json
{
  "enabled": true,
  "api_key": "<your-langsmith-api-key>",
  "api_url": "https://api.smith.langchain.com",
  "project": "codex",
  "metadata": {
    "team": "agents",
    "environment": "dev"
  }
}
```|领域 |环境变量|默认 |描述 |
| ---| ---| ---| ---|
| `enabled` | `TRACE_TO_LANGSMITH` | `false` |设置为 `true` 以启用跟踪。 |
| `api_key` | `LANGSMITH_CODEX_API_KEY`、`LANGSMITH_API_KEY` | - | LangSmith API 密钥。 |
| `api_url` | `LANGSMITH_CODEX_ENDPOINT`、`LANGSMITH_ENDPOINT` | LangSmith 默认 | LangSmith API URL。 |
| `project` | `LANGSMITH_CODEX_PROJECT`、`LANGSMITH_PROJECT` | `codex` | LangSmith 项目名称。 |
| `metadata` | `LANGSMITH_CODEX_METADATA`、`LANGSMITH_METADATA` | - |对象合并到根跟踪元数据中。 |
| `replicas` | `LANGSMITH_CODEX_RUNS_ENDPOINTS`、`LANGSMITH_RUNS_ENDPOINTS` | - |将跟踪复制到的其他 LangSmith 目的地。 |
| `redact` | `LANGSMITH_CODEX_REDACT`、`LANGSMITH_REDACT` | `true` |设置为 `false` 以禁用 [secret redaction](#secret-redaction)。 |
| `redact_extra_rules` | `LANGSMITH_CODEX_REDACT_EXTRA`、`LANGSMITH_REDACT_EXTRA` | - |在内置规则之后应用额外的 `{ pattern, replace }` 规则。 |

将包含 API 密钥的配置文件置于版本控制之外。

## 追踪到多个目的地

在 `langsmith.json` 或 `LANGSMITH_CODEX_RUNS_ENDPOINTS` 中设置 `replicas`，将相同的跟踪数据发送到其他 LangSmith 工作区或项目。设置后，副本列表将覆盖其他客户端设置。

跟踪多个 [replicas](/langsmith/log-traces-to-project) 对于以下用途很有用：

- 将跟踪发送到生产和暂存项目。
- 使用不同的 API 密钥跟踪多个工作区。
- 将额外的元数据添加到特定的副本目的地。

<Tabs>

<Tab title="Config file (recommended)">

在 `<project>/.codex/langsmith.json` 或 `~/.codex/langsmith.json` 中：

```json
{
  "enabled": true,
  "replicas": [
    {
      "apiUrl": "https://api.smith.langchain.com",
      "apiKey": "lsv2_pt_workspace_a",
      "projectName": "project-prod"
    },
    {
      "apiUrl": "https://api.smith.langchain.com",
      "apiKey": "lsv2_pt_workspace_b",
      "projectName": "project-staging",
      "updates": { "metadata": { "environment": "staging" } }
    }
  ]
}
```

</Tab>

<Tab title="Shell environment variable">

```bash
export LANGSMITH_CODEX_RUNS_ENDPOINTS='[{"apiUrl":"https://api.smith.langchain.com","apiKey":"lsv2_pt_workspace_a","projectName":"project-prod"},{"apiUrl":"https://api.smith.langchain.com","apiKey":"lsv2_pt_workspace_b","projectName":"project-staging","updates":{"metadata":{"environment":"staging"}}}]'
```要生成转义的 JSON 字符串，请使用：

```bash
echo '[{"apiUrl":"...","apiKey":"...","projectName":"..."}]' | jq -c .
```

</Tab>

</Tabs>

每个副本对象支持以下字段：

|领域 |必填 |描述 |
| ---| ---| ---|
| `apiUrl` |是的 | LangSmith API URL（通常为`https://api.smith.langchain.com`）。 |
| `apiKey` |是的 |目标工作区的 API 密钥。 |
| `projectName` |是的 |目标工作区中的项目名称。 |
| `updates` |没有 |用于覆盖复制运行的可选运行字段，例如额外的元数据。 |

## 秘密编辑

该插件会编辑从运行输入、输出、错误和元数据中检测到的秘密，然后将其上传到LangSmith。默认情况下，密文处于启用状态。

上传之前，编辑会在您的计算机上运行，​​因此未编辑的内容永远不会到达LangSmith。副本目标接收相同的编辑有效负载。

检测涵盖提供商 API 密钥前缀、JSON Web 令牌和 PEM 私钥块。它还涵盖上下文形状，例如 `API_KEY=<value>`、`Authorization` 标头以及嵌入 URL 中的密码。每场比赛都替换为`[SECRET_DETECTED]`。规则列表请参见[Redact secrets from traces](/langsmith/redact-secrets#rules-in-the-preset)。密文与已知的凭证形状相匹配，因此将其视为安全网而不是保证。无法识别格式的凭证仍会达到LangSmith，并且附件、运行名称和标签不会通过匿名器。编辑后的跟踪还保留了构建它所依据的提示、文件内容和工具结果，因此限制了谁可以读取跟踪项目。

要关闭密文，请将 `LANGSMITH_CODEX_REDACT` 设置为 `false`、`0`、`no` 或 `off`，或在配置文件中设置 `"redact": false`。值的修剪和比较不区分大小写。

要编辑其他模式，请将 `LANGSMITH_CODEX_REDACT_EXTRA` 设置为 `{ "pattern": ..., "replace": ... }` 规则的 JSON 数组，或在配置文件中设置 `redact_extra_rules`。每个`pattern`都是一个正则表达式字符串，全局应用且区分大小写。 `replace` 是可选的，并回退到 `[redacted]`。额外规则在内置规则之后运行。

```json
{
  "enabled": true,
  "project": "codex",
  "redact": true,
  "redact_extra_rules": [{ "pattern": "ACME-[A-Z0-9]{16}", "replace": "[REDACTED_ACME_KEY]" }]
}
```

将 `redact_extra_rules` 设置为 `[]` 会清除从较低优先级源继承的规则。在配置文件中，具有无效正则表达式的规则会丢弃该文件中的所有设置，因此请在提交之前验证模式。

由于项目级别 `.codex/langsmith.json` 或 `langsmith-plugins.json` 可以将 `redact` 设置为 `false`，因此请在不受您控制的存储库中启用跟踪之前检查这些文件。

## 追踪什么每个法学硕士运行包括：

- **输入**：累积的对话消息。
- **输出**：助理响应内容。
- **元数据**：模型提供商、模型名称、停止原因和令牌使用情况。

工具调用（函数调用、shell 调用、计算机调用、文件读取、Web 搜索）包含在其输入和输出中。当嵌套子进程在父进程下运行时，子代理线程将被解析和上传。

会话完成后，用户在响应中取消的中断回合仍会上传。

## 查看LangSmith中的踪迹

打开配置好的LangSmith项目并完成Codex回合。默认情况下，跟踪显示在 `codex` 项目中。该插件上传完整的 Codex 转录数据，包括消息、工具调用输入和输出、模型元数据、令牌使用情况和子代理线程结构。

<Warning>
该插件将完整的 Codex 转录数据上传到 LangSmith。不要对包含您不希望存储在 LangSmith 中的数据的会话启用跟踪。
</Warning>

## 故障排除

如果LangSmith中没有出现痕迹：- 确认在 `config.toml` 中启用了跟踪插件并且其挂钩是可信的 (`/hooks`)。 `[features] hooks` 默认情况下处于打开状态，因此仅将其设置为撤消本地覆盖。
- 确认 `TRACE_TO_LANGSMITH=true` 对 Codex 流程可见。
- 确认`LANGSMITH_CODEX_API_KEY`或`LANGSMITH_API_KEY`已设置且有效。
- 如果运行在错误的项目中，请设置`LANGSMITH_CODEX_PROJECT`或`project`配置键。
- 如果未使用自定义端点，请设置`LANGSMITH_CODEX_ENDPOINT`或`api_url`配置键。

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-codex.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>