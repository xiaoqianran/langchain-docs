<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace OpenAI Codex sessions | https://docs.langchain.com/langsmith/trace-with-codex -->

# 跟踪 OpenAI Codex 会话

在 LangSmith 中捕获 OpenAI Codex 代理轮次、工具调用、模型元数据和子代理线程。

[⟦T7⟧](https://github.com/langchain-ai/langsmith-codex-plugins) 市场提供了一个跟踪插件，该插件将 [OpenAI Codex](https://developers.openai.com/codex) 会话数据发送到 LangSmith。使用它来检查 Codex 工作流程中的代理轮次、模型元数据、令牌使用情况、工具调用和子代理线程。

## 先决条件

在设置跟踪之前，请确保您拥有：

* [Codex CLI](https://developers.openai.com/codex/quickstart?setup=cli) v0.128 或更高版本。
* [LangSmith API key](/langsmith/create-account-api-key)。

## 安装并启用插件

使用 Codex CLI 添加市场：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
codex plugin marketplace add langchain-ai/langsmith-codex-plugins
```

在 `~/.codex/config.toml` 中全局启用插件钩子和跟踪插件，或者仅在 `.codex/config.toml` 中为特定项目启用：

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[features]
plugin_hooks = true

[plugins."tracing@langsmith-codex-plugins"]
enabled = true
```

## 配置跟踪

跟踪将被禁用，直到配置文件中的 `TRACE_TO_LANGSMITH` 为 `"true"` 或 `enabled` 为 `true`。使用环境变量和/或 JSON 配置文件配置凭据。

### 环境变量

该插件首先读取 Codex 特定的变量，然后回退到通用 LangSmith SDK 变量。|变量|必填|默认|描述 |
| -------------------------------- | ----------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `TRACE_TO_LANGSMITH` |是的 | - |设置为 `"true"` 以启用跟踪。                                                                            |
| `LANGSMITH_CODEX_API_KEY` |有条件| - | LangSmith API 密钥。回落到`LANGSMITH_API_KEY`。除非每个副本都提供自己的 API 密钥，否则是必需的。 |
| `LANGSMITH_CODEX_ENDPOINT` |没有 | `https://api.smith.langchain.com` | LangSmith API URL。回落至`LANGSMITH_ENDPOINT`。                                                        |
| `LANGSMITH_CODEX_PROJECT` |没有 | `codex` |朗史密斯项目名称。回落到`LANGSMITH_PROJECT`。                                                    || `LANGSMITH_CODEX_METADATA` |没有 | - | JSON 对象合并到根跟踪元数据中。回落到`LANGSMITH_METADATA`。                              |
| `LANGSMITH_CODEX_RUNS_ENDPOINTS` |没有 | - |副本目标的 JSON 数组。回落到`LANGSMITH_RUNS_ENDPOINTS`。                                 |

将变量添加到 shell 配置文件中（`~/.zshrc`、`~/.bashrc` 或 `~/.bash_profile`）：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export TRACE_TO_LANGSMITH="true"
export LANGSMITH_CODEX_API_KEY="<your-langsmith-api-key>"
export LANGSMITH_CODEX_PROJECT="codex"
```

### 配置文件

使用 `<project>/.codex/langsmith.json` 进行项目级设置，或使用 `~/.codex/langsmith.json` 进行全局默认设置。全局文件首先加载，项目文件覆盖它，并且匹配的环境变量优先于两者。

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
```|领域 |环境变量 |默认 |描述 |
| ---------- | ------------------------------------------------------------------------ | ----------------- | -------------------------------------------------------------------- |
| `enabled` | `TRACE_TO_LANGSMITH` | `false` |设置为 `true` 以启用跟踪。                          |
| `api_key` | `LANGSMITH_CODEX_API_KEY`、`LANGSMITH_API_KEY` | - | LangSmith API 密钥。                                        |
| `api_url` | `LANGSMITH_CODEX_ENDPOINT`、`LANGSMITH_ENDPOINT` |朗史密斯默认| LangSmith API URL。                                        |
| `project` | `LANGSMITH_CODEX_PROJECT`、`LANGSMITH_PROJECT` | `codex` |朗史密斯项目名称。                                   |
| `metadata` | `LANGSMITH_CODEX_METADATA`、`LANGSMITH_METADATA` | - |对象合并到根跟踪元数据中。                   |
| `replicas` | `LANGSMITH_CODEX_RUNS_ENDPOINTS`、`LANGSMITH_RUNS_ENDPOINTS` | - |将跟踪复制到的其他 LangSmith 目标。 |

将包含 API 密钥的配置文件置于版本控制之外。

## 追踪到多个目的地在 `langsmith.json` 或 `LANGSMITH_CODEX_RUNS_ENDPOINTS` 中设置 `replicas` 可将相同的跟踪数据发送到其他 LangSmith 工作区或项目。设置后，副本列表将覆盖其他客户端设置。

追踪多个 [replicas](/langsmith/log-traces-to-project) 对于以下用途很有用：

* 将跟踪发送到生产和暂存项目。
* 使用不同的 API 密钥跟踪多个工作区。
* 将额外的元数据添加到特定的副本目的地。

<Tabs>
  <Tab title="Config file (recommended)">
    在 `<project>/.codex/langsmith.json` 或 `~/.codex/langsmith.json` 中：

    ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export LANGSMITH_CODEX_RUNS_ENDPOINTS='[{"apiUrl":"https://api.smith.langchain.com","apiKey":"lsv2_pt_workspace_a","projectName":"project-prod"},{"apiUrl":"https://api.smith.langchain.com","apiKey":"lsv2_pt_workspace_b","projectName":"project-staging","updates":{"metadata":{"environment":"staging"}}}]'
    ```

    要生成转义的 JSON 字符串，请使用：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    echo '[{"apiUrl":"...","apiKey":"...","projectName":"..."}]' | jq -c .
    ```
  </Tab>
</Tabs>

每个副本对象支持以下字段：

|领域 |必填|描述 |
| ------------- | -------- | --------------------------------------------------------------------------- |
| `apiUrl` |是的 | LangSmith API URL（通常为`https://api.smith.langchain.com`）。            |
| `apiKey` |是的 |目标工作区的 API 密钥。                                      |
| `projectName` |是的 |目标工作区中的项目名称。                                  |
| `updates` |没有 |用于覆盖复制运行的可选运行字段，例如额外的元数据。 |## 追踪什么

每个法学硕士运行包括：

* **输入**：累积的对话消息。
* **输出**：助理响应内容。
* **元数据**：模型提供商、模型名称、停止原因和令牌使用情况。

工具调用（函数调用、shell 调用、计算机调用、文件读取、Web 搜索）包含在其输入和输出中。当嵌套子进程在父进程下运行时，子代理线程将被解析和上传。

会话完成后，用户在响应中取消的中断回合仍会上传。

## 在 LangSmith 中查看痕迹

打开配置好的 LangSmith 项目并完成 Codex 回合。默认情况下，跟踪显示在 `codex` 项目中。该插件上传完整的 Codex 转录数据，包括消息、工具调用输入和输出、模型元数据、令牌使用情况和子代理线程结构。

<Warning>
  该插件将完整的 Codex 转录数据上传到 LangSmith。不要对包含您不希望存储在 LangSmith 中的数据的会话启用跟踪。
</Warning>

## 故障排除

如果 LangSmith 中没有出现痕迹：* 确认`plugin_hooks = true`，并在`config.toml`启用跟踪插件。
* 确认 `TRACE_TO_LANGSMITH=true` 对 Codex 流程可见。
* 确认`LANGSMITH_CODEX_API_KEY`或`LANGSMITH_API_KEY`已设置且有效。
* 如果运行在错误的项目中，请设置`LANGSMITH_CODEX_PROJECT`或`project`配置键。
* 如果未使用自定义端点，请设置`LANGSMITH_CODEX_ENDPOINT`或`api_url`配置键。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-codex.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>