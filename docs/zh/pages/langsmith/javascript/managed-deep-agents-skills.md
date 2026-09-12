<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add skills to Managed Deep Agents | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-skills -->

# 将技能添加到托管Deep Agents

技能将特定于任务的过程和支持文件打包到可重用的目录中。 MDA 会自动发现它们。仅当任务与 frontmatter 中的描述匹配时，代理才会加载技能的完整内容。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

将每个技能放在项目根目录下的`skills/`下：



```text
my-agent/
  agent.ts
  skills/
    research/
      SKILL.md
```


完整的项目布局请参见[Project structure](/langsmith/javascript/managed-deep-agents-project-structure)。

## 添加技能

仅当任务与 frontmatter 中的描述相匹配时，才应使用代理应遵循的程序技能：

<Steps>
  <Step title="Create a skill directory" id="create-a-skill-directory">

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

有关技能创作模式和完整格式，请参阅[Skills](/oss/javascript/deepagents/skills)。

要了解渐进式披露，请参阅[How the agent uses skills](#how-the-agent-uses-skills)。

  </Step>
  <Step title="Add supporting files (Optional)" id="add-supporting-files">

技能目录还可以包含支持脚本、参考文件和模板。从 `SKILL.md` 引用这些文件，以便代理知道何时使用它们：



```text
skills/
  research/
    SKILL.md
    templates/
      report.md
    scripts/
      fetch_sources.ts
```


  </Step>
</Steps>

## 代理如何使用技能启动时，代理会看到每个技能的 `name` 和 `description`。当任务与技能描述相匹配时，代理会读取完整的`SKILL.md`并遵循其说明。仅在需要时加载支持文件。

代理无法在运行时修改技能。

## 部署

当您运行 `mda deploy` 时，MDA 会将 `skills/` 下的每个 UTF-8 文件同步到代理的 [Context Hub](/langsmith/use-the-context-hub)。

然后，您可以在 LangSmith UI 中编辑技能并将这些更改应用到代理。

最好将技能文件保留在存储库中，作为持久更改的事实来源，因为稍后的部署会再次同步项目副本并删除本地不存在的已部署技能文件。

## 何时使用技能

|概念|角色 |加载时间 |
| --- | --- | --- |
| **[Instructions](/langsmith/javascript/managed-deep-agents-instructions)** |永远在线的系统提示 |每次跑步 |
| **技能** |特定任务的程序 |当代理选择他们时 |
| **[Memory](/langsmith/javascript/managed-deep-agents-memory)** |代理可以更新的知识 |当启用持久内存时 |

欲了解更多信息，请参阅[Project structure](/langsmith/javascript/managed-deep-agents-project-structure)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-skills.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>