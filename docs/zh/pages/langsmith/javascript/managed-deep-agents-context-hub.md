<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage Context Hub for Managed Deep Agents | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-context-hub -->

# 管理托管 Deep Agents 的上下文中心

托管 Deep Agents 在 [LangSmith Context Hub](/langsmith/use-the-context-hub) 中存储部署拥有的指令和技能以及可选的持久内存。这种拆分使您可以在不重建应用程序代码的情况下更改代理行为，同时项目仍然是持久指导和技能更新的真实来源。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## Context Hub 中包含哪些内容

|内容 |项目来源|于 `mda deploy` 同步 |代理可写 |
| ---| ---| ---| ---|
|系统提示| [⟦T3⟧](/langsmith/javascript/managed-deep-agents-instructions) |是的 |没有 |
|技能 | [⟦T4⟧](/langsmith/javascript/managed-deep-agents-skills) |是的 |没有 |
|持久记忆|可选的[⟦T5⟧](/langsmith/javascript/managed-deep-agents-memory)声明|启用树；不覆盖现有内存|是的，在`/memories/agent/` |

工具、中间件、MCP 连接器、通道、计划、沙箱和代理定义随已编译的部署一起提供。它们未同步到 Context Hub。

有关托管运行时字段的所有权，请参阅[Agent definition](/langsmith/javascript/managed-deep-agents-agent-definition)。

## 事实来源

该项目和 Context Hub 都持有 `instructions.md` 和 `skills/` 的副本。哪个副本获胜取决于您在何处进行持久更改以及如何解决部署冲突。- **项目文件**：将项目中的`instructions.md`和`skills/`视为持久更改的事实来源。每个 `mda deploy` 将这些文件同步到代理的 Context Hub 存储库中。
- **Context Hub 编辑**：当您需要快速更改且无需重新部署代码即可应用时，可以在 Context Hub 中编辑文件。这些 Hub 编辑将保持有效，直到稍后的部署覆盖它们，或者直到您在出现冲突提示时选择保留 Hub 副本。
- **持久内存**：`/memories/agent/`下的内存归代理所有。部署启用树，但不会覆盖已存储在其中的内容。

## 部署如何同步上下文

`mda deploy` 将部署拥有的上下文同步为部署管道的一部分：- **说明和技能**：每次部署都会从项目文件更新代理的 Context Hub 存储库。稍后再次部署同步项目副本。对于技能，部署还会删除本地不再存在的已部署技能文件。
- **持久内存**：启用内存后，部署会在 `/memories/agent/` 挂载一棵 Context Hub 树。部署不会覆盖已存储在其中的内容。
- **冲突**：如果自上次 `mda deploy` 之后 Context Hub 中的 `instructions.md` 或 `skills/` 发生更改，CLI 将在同步前停止并询问是否使用项目副本覆盖 Context Hub 副本。默认答案保留 Context Hub 版本并跳过同步该部分。在非交互式 shell 中没有提示。部署因错误退出，您必须使用 `--context-strategy overwrite` 或 `--context-strategy keep-hub` 重新运行。重新运行 `mda deploy` 再次报告相同的冲突。
- **并发编辑**：如果存储库在同步期间发生更改，则部署会因提交冲突而失败。重新运行`mda deploy`。

互动冲突提示：

```text
◇  Checked Context Hub context
│
▲  Context Hub instructions.md changed since the last MDA sync.
│
◆  Overwrite Hub-edited instructions.md with the local version?
│  ○ Yes / ● No
└
```

非交互式冲突（CI 或重定向输出）：

```text
└  Context Hub instructions.md and skills/ changed since the last MDA sync. Re-run with --context-strategy overwrite or --context-strategy keep-hub.
```|战略|效果|
| ---| ---|
| `overwrite` |将 Hub 编辑的 `instructions.md` 或 `skills/` 替换为项目副本，然后继续部署。 |
| `keep-hub` |保留 Context Hub 版本，跳过同步该部分，然后继续部署。 |

有关完整的部署步骤列表和标志，请参阅 [CLI reference](/langsmith/javascript/managed-deep-agents-cli#deploy-projects)。有关秘密路由和部署选项，请参阅[Deploy an agent](/langsmith/javascript/managed-deep-agents-deploy)。

## 在LangSmith中编辑上下文

部署成功后：

1. 在LangSmith中打开部署。
1. 使用“详细信息”侧边栏链接指向包含部署说明、技能和内存的 Context Hub 存储库。当上下文不再存在时，存档的存储库会被标记。
1. 当您需要快速更改且无需重新部署代码即可应用时，请在 Context Hub 中编辑文件。

对于持久更改，请编辑项目副本并重新部署。有关部署如何解析 Hub 编辑的信息，请参阅[Source of truth](#source-of-truth)。

有关托管 Deep Agents 之外的浏览提交、升级环境和 Context Hub 概念，请参阅 [Use the Context Hub](/langsmith/use-the-context-hub) 和 [Context engineering concepts](/langsmith/context-engineering-concepts)。

## 本地开发

`mda dev` 创建一个本地 Context Hub 模拟，用于说明、技能和记忆。本地 Studio 会话不会创建或更新部署的托管 Context Hub 存储库。

欲了解更多信息，请参阅[Develop locally with LangSmith Studio](/langsmith/javascript/managed-deep-agents-local-development)。

## 选择上下文所属的位置|目标|使用 |
| ---| ---|
|永远在线的系统提示 | [Instructions](/langsmith/javascript/managed-deep-agents-instructions) |
|特定任务的程序 | [Skills](/langsmith/javascript/managed-deep-agents-skills) |
|代理跨线程学习和保留的知识 | [Memory](/langsmith/javascript/managed-deep-agents-memory) |
|应用逻辑和外部调用| [Tools](/langsmith/javascript/managed-deep-agents-tools)、[MCP connectors](/langsmith/javascript/managed-deep-agents-mcp-connectors) 或 [middleware](/langsmith/javascript/managed-deep-agents-middleware) |

## 另请参阅

- [Project structure](/langsmith/javascript/managed-deep-agents-project-structure)
- [Deploy an agent](/langsmith/javascript/managed-deep-agents-deploy)
- [Use the Context Hub](/langsmith/use-the-context-hub)
- [Manage contexts with the SDK](/langsmith/manage-contexts-sdk)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-context-hub.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>