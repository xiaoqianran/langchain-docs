<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Pi coding agent sessions | https://docs.langchain.com/langsmith/trace-with-pi -->

# 跟踪 Pi 编码代理会话

本指南向您展示如何使用 `@langchain/langsmith-pi-extension` 扩展跟踪 [Pi coding agent](https://pi.dev) 会话到 LangSmith。

配置完成后，每个 Pi 会话都会将跟踪发送到LangSmith。每个跟踪都包括用户消息、助理响应、工具调用和单独的 LLM 调用，这使您可以全面观察 Pi 编码代理的运行情况。

## 先决条件

在设置跟踪之前，请确保您拥有：

- [**Pi**](https://pi.dev)已安装。
- [**LangSmith API key**](/langsmith/create-account-api-key)。

## 安装

通过 Pi 安装扩展：

```sh
pi install npm:@langchain/langsmith-pi-extension
```

## 快速开始

默认情况下禁用跟踪。设置以下环境变量以启用跟踪并连接到您的 LangSmith 帐户：

```sh
export TRACE_TO_LANGSMITH=true
export LANGSMITH_PI_API_KEY="<your-langsmith-api-key>"
```

[Run Pi](https://pi.dev/docs/latest/quickstart) 和往常一样。当会话启动时，扩展会报告是否启用了 LangSmith 跟踪。您还可以随时从 Pi 中检查当前的跟踪状态：

```text
/langsmith-tracing
```

默认情况下，跟踪会写入 `pi-coding-agent` LangSmith 项目。

## 配置

配置可以来自环境变量或 JSON 配置文件。值按以下顺序合并，后面的源优先：

1. 默认值
1. `~/.pi/langsmith.json`（全局配置）
1. `<current-working-directory>/.pi/langsmith.json`（项目配置）
1.环境变量

### 环境变量|变量|描述 |
|---|---|
| `TRACE_TO_LANGSMITH` |设置为 `true`、`1`、`yes` 或 `on` 时启用跟踪。设置为 `false`、`0`、`no` 或 `off` 时禁用跟踪。 |
| `LANGSMITH_PI_API_KEY` | LangSmith API 密钥。回落至`LANGSMITH_API_KEY`。 |
| `LANGSMITH_PI_ENDPOINT` | LangSmith 用于自托管或自定义部署的 API URL。回落到`LANGSMITH_ENDPOINT`。 |
| `LANGSMITH_PI_PROJECT` | LangSmith 项目名称。回落到`LANGSMITH_PROJECT`。默认为`pi-coding-agent`。 |
| `LANGSMITH_PI_METADATA` |添加到根运行元数据的 JSON 对象。回落到`LANGSMITH_METADATA`。 |
| `LANGSMITH_PI_RUNS_ENDPOINTS` |副本运行目标的 JSON 数组。回落到`LANGSMITH_RUNS_ENDPOINTS`。 |

示例：

```sh
export TRACE_TO_LANGSMITH=true
export LANGSMITH_PI_API_KEY="<your-langsmith-api-key>"
export LANGSMITH_PI_PROJECT="pi-coding-agent-dev"
export LANGSMITH_PI_METADATA='{"team":"infra","environment":"local"}'
```

### 配置文件

创建 `~/.pi/langsmith.json` 用于全局设置或在项目目录中创建 `.pi/langsmith.json` 用于本地覆盖：

```json
{
  "enabled": true,
  "api_key": "<your-langsmith-api-key>",
  "api_url": "https://api.smith.langchain.com",
  "project": "pi-coding-agent",
  "metadata": { "environment": "local" }
}
```

配置文件字段：

|领域|必填|默认 |描述 |
|---|---|---|---|
| `enabled` |是的 | `false` |设置为 `true` 以启用从配置文件进行跟踪。 |
| `api_key` |否* | — | LangSmith API 密钥。除非环境变量或副本提供，否则是必需的。 |
| `api_url` |没有 | LangSmith SDK 默认 | LangSmith API URL，通常为`https://api.smith.langchain.com`。 |
| `project` |没有 | `pi-coding-agent` | LangSmith 项目名称。 |
| `metadata` |没有 | — |对象合并到根跟踪元数据中。 |
| `replicas` |没有 | — |用于复制跟踪的附加 LangSmith 目的地数组。 |

## 副本使用 `replicas` 同时将跟踪发送到多个 LangSmith 目的地。这对于将跟踪转发到个人工作区和共享团队项目，或者转发到 [cloud](/langsmith/cloud) 旁边的 [self-hosted LangSmith](/langsmith/self-hosted) 实例非常有用。

```json
{
  "enabled": true,
  "api_key": "<primary-api-key>",
  "project": "pi-coding-agent",
  "replicas": [
    {
      "api_key": "<replica-api-key>",
      "api_url": "https://replica-langsmith.example.com",
      "project": "pi-coding-agent-replica",
      "updates": {
        "tags": ["replica"]
      }
    }
  ]
}
```

每个副本条目可以包含一个`updates`对象来覆盖复制运行上的元数据或标签。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-pi.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>