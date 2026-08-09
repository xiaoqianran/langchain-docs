<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use subagents in Deep Agents Code | https://docs.langchain.com/oss/deepagents/code/subagents -->

# 在深度代理代码中使用子代理

使用 YAML frontmatter 将自定义 Deep Agents 代码子代理定义为 AGENTS.md 文件。涵盖项目和用户路径、可选模型覆盖和示例。

将自定义同步 [subagents](/oss/python/deepagents/subagents) 定义为 markdown 文件，以便 Deep Agents Code 可以将专门的任务委托给它们。

<Note>
  目前，深层代理代码中的最终用户无法使用异步子代理。
</Note>

每个子代理都位于自己的文件夹中，其中包含一个 `AGENTS.md` 文件：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
.deepagents/agents/{subagent-name}/AGENTS.md   # Project-level
~/.deepagents/{agent}/agents/{subagent-name}/AGENTS.md  # User-level
```

项目子代理会覆盖同名的用户子代理（请参阅[precedence rules](/oss/deepagents/code/configuration#subagents)）。

frontmatter 需要`name` 和`description`（与[⟦T6⟧ dictionary spec](/oss/python/deepagents/subagents#subagent-dictionary-based) 相同）。 Markdown 主体成为子代理的 `system_prompt`。除了基本规范之外，`AGENTS.md` 文件还支持可选的 `model` frontmatter 字段，该字段会覆盖该子代理的主代理模型。使用 `provider:model-name` 格式（例如，`anthropic:claude-opus-4-8`、`openai:gpt-5.5`）。省略它以继承主代理的模型。

<Note>
  其他 `SubAgent` 字段（`tools`、`middleware`、`interrupt_on`、`skills`）当前无法通过 `AGENTS.md` frontmatter 配置 - 以这种方式定义的自定义子代理继承主代理的工具。直接使用SDK进行完全控制。
</Note>

## 文件格式

子代理 `AGENTS.md` 文件使用 YAML frontmatter 后跟 markdown 正文：

```markdown theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
---
name: researcher
description: Research topics on the web before writing content
model: anthropic:claude-haiku-4-5-20251001
---

You are a research assistant with access to web search.

## Your Process
1. Search for relevant information
2. Summarize findings clearly
```## 动态子代理

`dcode` 附带启用的代码解释器，因此 [dynamic subagents](/oss/python/deepagents/dynamic-subagents) 开箱即用。

要触发动态子代理，请要求“工作流程”。代理不是自行完成工作或通过其本机 `task` 工具管理扇出，而是编写一个编排脚本来调用内置 `task()` 全局并在代码解释器中运行它。例如：“运行工作流来检查 src/ 中的每个文件以进行 SQL 注入。”

当子代理生成时，`dcode` 在动态子代理面板中显示它们，并按调度分组为阶段。

<Frame>
  <img alt="The dcode dynamic subagents panel showing spawned subagents grouped into phases by dispatch" />
</Frame>

您还可以在您选择的编码代理中使用动态子代理而不是[ACP](/oss/python/deepagents/acp)（例如，Zed）。

## 示例：具有成本效益的子代理

使用更便宜、更快的模型来执行简单的委托任务，同时使主代理保持在更强大的模型上：

```markdown theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
---
name: general-purpose
description: General-purpose agent for research and multi-step tasks
model: anthropic:claude-haiku-4-5-20251001
---

You are a general-purpose assistant. Complete the task efficiently and return a concise summary.
```

这会覆盖内置的通用子代理，将所有委派的任务路由到更便宜的模型。更多信息请参见[Override the general-purpose subagent](/oss/python/deepagents/subagents#override-the-general-purpose-subagent)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/subagents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>