<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add skills to Managed Deep Agents | https://docs.langchain.com/langsmith/python/managed-deep-agents-skills -->

# 将技能添加到托管Deep Agents

技能将特定于任务的过程和上下文打包到可重用的目录中。您可以在 Markdown 文件中定义它们，代理会自动选取它们。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目结构

将代理入口点保留在项目根目录，并在`skills/`下定义每个技能：

```text
my-agent/
  agent.py
  skills/
    research/
      SKILL.md
```




## 添加技能

每个技能目录都需要一个 `SKILL.md` 文件，其中包含 `name` 和 `description` frontmatter：

```markdown skills/research/SKILL.md
---
name: research
description: Gather and synthesize context before answering complex questions.
---

# Research

Use this skill when a task needs more than a direct answer.

1. Identify what information is missing.
2. Use `query_db` to look up relevant records.
3. Summarize findings before responding to the user.
```

技能目录还可以包含支持脚本、参考文件和模板。从 `SKILL.md` 引用这些文件，以便代理知道何时使用它们。

## 代理如何使用技能

启动时，代理会看到每个技能的 `name` 和 `description`。当任务与技能描述相匹配时，代理会读取完整的`SKILL.md`并遵循其说明。仅在需要时加载支持文件。

这种渐进式的披露使代理能够访问详细的过程，而无需将每个技能的完整内容添加到其上下文中。

## 同步到 Context Hub当您运行 `mda deploy` 时，`skills/` 下的每个 UTF-8 文件都会自动同步到代理的 [Context Hub](/langsmith/use-the-context-hub) 存储库。然后，您可以在 LangSmith UI 中编辑技能，并使更改可供代理使用。

稍后的部署将再次同步项目副本并删除本地不再存在的已部署技能文件。

## 技能与其他概念的比较

技能是当代理选择时动态加载的上下文。代理无法修改它们。

对于应该始终由代理加载的行为，请使用 [instructions](/langsmith/python/managed-deep-agents-instructions)。

使用[memory](/langsmith/python/managed-deep-agents-memory)获取您希望代理能够更新的知识。

有关技能创作模式和完整格式，请参阅[Skills](/oss/python/deepagents/skills)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-skills.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>