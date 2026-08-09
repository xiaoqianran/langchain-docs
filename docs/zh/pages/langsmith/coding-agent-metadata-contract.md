<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Coding agent metadata contract | https://docs.langchain.com/langsmith/coding-agent-metadata-contract -->

# 编码代理元数据合约

元数据模式标准化了将运行发送到 LangSmith 时必须发出的跟踪元数据编码代理。

该模式是编码代理附加到 LangSmith 运行的元数据的权威契约。它定义了每次运行时需要哪些字段、运行时可以提供哪些字段时需要哪些字段以及哪些字段仅适用于特定的运行类型。

编码代理集成使用此模式来确保其跟踪结构一致、可查询，并与 LangSmith 的可观察性和过滤功能兼容。

## 支持的集成

以下集成实现了此架构：

|整合| `ls_integration`值|
| ------------------------------------------------------ | ---------------------- |
| [Claude Code](/langsmith/trace-claude-code) | `claude-code` |
| [OpenAI Codex](/langsmith/trace-with-codex) | `openai-codex` |
| [Deep Agents](/langsmith/trace-deep-agents) | `deepagents-code` |
| [Cursor](/langsmith/trace-with-cursor) | `cursor` |
| [Pi](/langsmith/trace-with-pi) | `pi` |
| [Opencode](/langsmith/trace-with-opencode) | `opencode` |
| [GitHub Copilot](/langsmith/trace-with-vscode-copilot) | `copilot` |

## 全局身份块每个运行类型必须在其元数据中包含以下标识字段：

|领域 |描述 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `ls_agent_type` |代理内的运行类型。应为 `"root"`、`"subagent"`、`"middleware"` 或 `"compaction"` 之一。 |
| `ls_agent_purpose` |代理的高级用途，例如`"coding"`。                                                     |
| `ls_integration` |发出运行的集成的标识符（请参阅[Supported integrations](#supported-integrations)）。      |
| `ls_agent_runtime` |人类可读的运行时名称，例如 `"Claude Code 1.0.28"`。                                             |
| `thread_id` |对话线程的稳定标识符。用于在 LangSmith 的线程视图中对相关运行进行分组。       |
| `ls_trace_schema_version` |目前`"coding-agent-v1"`。                                                                               |

## 可用性等级

此架构中的字段标有三个可用性层之一：|等级 |意义|
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **永远** |每次跑步都必须在场。                                                                                            |
| **哪里\_已知** |每当运行时可以公开该值时就需要。仅当运行时确实无法提供信息时才省略。 |
| **上下文** |可选元数据。不适用时省略。                                                                             |

## 运行类型

该架构区分了五种运行类型。某些字段仅适用于运行类型的子集。|运行类型 |描述 |
| ------------- | ------------------------------------------------------------------------ |
| `root` |代表完整座席轮次或会话的顶级运行。 |
| `llm` |一个回合内调用一个语言模型。                         |
| `tool` |一回合内的工具调用。                             |
| `subagent` |嵌套或委托代理运行。                             |
| `interrupted` |在完成之前被中断的运行。                |

## 按运行类型划分的必填字段

### 所有运行类型

每种运行类型**始终**需要 [global identity block](#global-identity-block) 字段。

所有运行类型都需要附加字段：|领域 |等级 |描述 |
| ------------------- | ------------- | ------------------------------------------------------------------------ |
| `ls_agent_version` | `where_known` |代理运行时的版本字符串，例如 `"1.0.28"`。 |
| `git_branch` | `where_known` |正在编辑的存储库中的活动 Git 分支。             |
| `git_commit_sha` | `where_known` |当前 Git 提交的完整 SHA。                           |
| `git_repo_url` | `where_known` |存储库的远程 URL。                                 |
| `working_directory` | `where_known` |工作目录的绝对路径。                       |

### `llm` 运行

|领域|等级 |描述 |
| ---------------- | ------------- | -------------------------------------------------- |
| `ls_model_name` | `where_known` |型号标识符，例如`"claude-opus-4-5"`。 |
| `ls_provider` | `where_known` |模型提供者，例如`"anthropic"`。         |

### `tool` 运行|领域 |等级 |描述 |
| -------------- | -------- | --------------------------------------------------------------------------- |
| `ls_tool_name` | `always` |调用的工具的名称，例如 `"bash"` 或 `"computer"`。 |

### `subagent` 运行

|领域 |等级 |描述 |
| ------------------ | -------- | -------------------------------------------------------------------- |
| `ls_subagent_id` | `always` |子代理的稳定标识符。                       |
| `ls_subagent_type` | `always` |子代理的类型或角色，例如`"researcher"`。 |

### `interrupted` 运行

中断的运行具有与 `root` 运行相同的字段。运行类型本身发出异常终止状态的信号；没有添加额外的必填字段。

## 相关

* [Metadata parameters reference](/langsmith/ls-metadata-parameters)：LangSmith 运行中普遍使用的`ls_` 前缀字段。
* [Add metadata and tags](/langsmith/add-metadata-tags)：如何使用 LangSmith SDK 将元数据附加到跟踪。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/coding-agent-metadata-contract.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>