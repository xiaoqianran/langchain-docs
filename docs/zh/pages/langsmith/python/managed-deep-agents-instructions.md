<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add instructions to Managed Deep Agents | https://docs.langchain.com/langsmith/python/managed-deep-agents-instructions -->

# 向托管Deep Agents添加指令

指令定义永远在线的代理行为。它们构成了座席系统提示的核心。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

将代理指令放入项目根目录下的 `instructions.md` 中：

```text
my-agent/
  instructions.md
```




完整的项目布局请参见[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

## 添加说明

创建或修改 `instructions.md` 来定义代理的角色、行为、约束以及使用其工具的指导：

```markdown instructions.md
# Assistant

You are a helpful assistant.
```

MDA 在每次运行时将指令插入代理的系统提示符中。
代理无法在运行时修改这些指令。

## 部署

当您运行 `mda deploy` 时，MDA 会将 `instructions.md` 同步到代理的 [Context Hub](/langsmith/use-the-context-hub)。

然后，您可以在 LangSmith UI 中编辑说明并将这些更改应用到代理。

最好将 `instructions.md` 文件保留在存储库中作为持久更改的事实来源，因为稍后的部署会再次同步项目副本。

## 何时使用说明|概念|角色 |加载时间 |
| --- | --- | --- |
| **说明** |永远在线的系统提示 |每次跑步 |
| **[Skills](/langsmith/python/managed-deep-agents-skills)** |特定任务的程序 |当代理选择他们时 |
| **[Memory](/langsmith/python/managed-deep-agents-memory)** |代理可以更新的知识 |当启用持久内存时 |

有关更多信息，请参阅[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-instructions.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>