<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace OpenCode sessions | https://docs.langchain.com/langsmith/trace-with-opencode -->

# 跟踪 OpenCode 会话

`@langchain/langsmith-opencode` 插件将 [OpenCode](https://opencode.ai/) 会话跟踪发送到 LangSmith。使用它来检查 OpenCode 工作流程中的代理轮次、模型元数据、令牌使用情况、工具调用、工具错误、附件和子代理活动。

## 先决条件

在设置跟踪之前，请确保您拥有：

- [OpenCode](https://opencode.ai/) 安装并配置。
- 一个[LangSmith API key](/langsmith/create-account-api-key)。
- 可以在 `opencode.json` 或 `~/.config/opencode/opencode.json` 中配置 OpenCode `plugin` 密钥。

## 安装并启用插件

将插件添加到您的 OpenCode 配置文件中。您可以在`opencode.json`中进行本地配置，也可以在`~/.config/opencode/opencode.json`中进行全局配置：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@langchain/langsmith-opencode"]
}
```

在启动 OpenCode 之前启用跟踪并提供您的 LangSmith API 密钥：

```bash
export TRACE_TO_LANGSMITH="true"
export LANGSMITH_API_KEY="<your-langsmith-api-key>"
export LANGSMITH_PROJECT="opencode"
```

像往常一样运行 OpenCode。该插件将完成的用户轮次发送到配置的 LangSmith 项目。

## 配置跟踪

默认情况下禁用跟踪。设置 `TRACE_TO_LANGSMITH=true` 后，插件会将跟踪发送到 LangSmith。您还可以使用 LangSmith 配置文件启用跟踪。

### 环境变量

该插件首先读取特定于 OpenCode 的变量，然后在可用时回退到通用 LangSmith SDK 变量。|变量|必填|默认 |描述 |
| ---| ---| ---| ---|
| `TRACE_TO_LANGSMITH` |是的 | `false` |设置为 `"true"` 以启用跟踪。 |
| `LANGSMITH_OPENCODE_API_KEY` |有条件| - | LangSmith API 密钥。回落到`LANGSMITH_API_KEY`。除非每个副本都提供自己的 API 密钥，否则是必需的。 |
| `LANGSMITH_OPENCODE_ENDPOINT` |没有 | LangSmith SDK 默认 | LangSmith API URL。回落到`LANGSMITH_ENDPOINT`。 |
| `LANGSMITH_OPENCODE_PROJECT` |没有 | `opencode` | LangSmith 项目名称。回落到`LANGSMITH_PROJECT`。 |
| `LANGSMITH_OPENCODE_METADATA` |没有 | - | JSON 对象合并到根跟踪元数据中。 |
| `LANGSMITH_OPENCODE_RUNS_ENDPOINTS` |没有 | - |副本目标的 JSON 数组。 |

例如：

```bash
export TRACE_TO_LANGSMITH="true"
export LANGSMITH_API_KEY="<your-langsmith-api-key>"
export LANGSMITH_PROJECT="opencode"
export LANGSMITH_OPENCODE_METADATA='{"team":"agents","environment":"dev"}'
```

### 配置文件

使用 `.opencode/langsmith.json` 进行项目级设置，或使用 `~/.config/opencode/langsmith.json` 进行全局默认设置。

```json
{
  "enabled": true,
  "api_key": "<your-langsmith-api-key>",
  "api_url": "https://api.smith.langchain.com",
  "project": "opencode",
  "metadata": {
    "team": "agents",
    "environment": "dev"
  }
}
```

|领域|必填|默认 |描述 |
| ---| ---| ---| ---|
| `enabled` |是的 | `false` |设置为 `true` 以启用从配置文件进行跟踪。 |
| `api_key` |有条件| - | LangSmith API 密钥。除非环境变量或副本提供，否则是必需的。 |
| `api_url` |没有 | LangSmith SDK默认 | LangSmith API URL，通常为`https://api.smith.langchain.com`。 |
| `project` |没有 | `opencode` | LangSmith 项目名称。 |
| `metadata` |没有 | - |对象合并到根跟踪元数据中。 |
| `replicas` |没有 | - |将跟踪复制到的其他 LangSmith 目的地。 |

将包含 API 密钥的配置文件置于版本控制之外。## 追踪到多个目的地

在 `langsmith.json` 或 `LANGSMITH_OPENCODE_RUNS_ENDPOINTS` 中设置 `replicas` 可将相同的跟踪数据发送到其他 LangSmith 工作区或项目。

```json
{
  "enabled": true,
  "api_key": "<your-langsmith-api-key>",
  "project": "opencode",
  "replicas": [
    {
      "api_url": "https://api.smith.langchain.com",
      "api_key": "<your-replica-langsmith-api-key>",
      "project": "opencode-replica",
      "updates": {
        "metadata": {
          "replica": true
        }
      }
    }
  ]
}
```

副本对象支持 Snake_case 和 LangSmith SDK 风格的驼峰命名法字段名称。建议在配置文件中使用snake_case。

|领域|描述 |
| ---| ---|
| `api_url` / `apiUrl` | LangSmith 副本目标的 API URL。 |
| `api_key` / `apiKey` |目标工作区的 API 密钥。 |
| `project` / `projectName` |目标工作区中的项目名称。 |
| `updates` |用于覆盖复制运行的可选运行字段，例如额外的元数据。 |

## 追踪什么

该插件监听 OpenCode 聊天和事件挂钩，聚合每个完成的用户回合，并将其作为运行树提交到 LangSmith。- `opencode.session` root 运行以完成用户轮次。
- `opencode.assistant.turn` 孩子们奔跑寻求助手和模型反应。
- 嵌套工具运行用于工具调用，包括输入、输出、错误、计时和附件（如果可用）。
- 嵌套在父工具调用下的子代理会话。
- 模型名称、提供程序、调用参数、令牌使用以及线程或会话 ID 元数据。
- 用户消息、助理消息、推理块、文件部分以及与助理轮流相关的系统提示。

跟踪完成基于 OpenCode `step-finish` 事件。当 OpenCode 服务器关闭时，该插件还会刷新待处理的跟踪批次。

## 查看LangSmith中的踪迹

打开配置的 LangSmith 项目并查找名为 `opencode.session` 的根运行。每个跟踪包含用户轮流作为根输入和助理响应、工具调用以及子代理跟踪作为子运行。该插件将 OpenCode 会话 ID 存储为 `thread_id` 元数据，因此您可以在 LangSmith 中过滤或分组相关的 OpenCode 轮次。

## 故障排除

如果LangSmith中没有出现痕迹：- 使用配置中的`TRACE_TO_LANGSMITH=true`或`"enabled": true`确认已启用跟踪。
- 确认LangSmith API 密钥已在 OpenCode 使用的同一 shell、项目配置或全局配置中设置。
- 确认插件包已安装在 OpenCode 可以解析的位置。
- 检查所选的LangSmith项目。如果未配置项目，跟踪将转到`opencode`。
- 更改 `opencode.json`、`langsmith.json` 或环境变量后重新启动 OpenCode。
- 确保用户回合完成。该插件不会发送不完整的回合。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-opencode.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>