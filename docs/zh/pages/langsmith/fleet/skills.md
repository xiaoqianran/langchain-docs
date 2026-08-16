<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Skills | https://docs.langchain.com/langsmith/fleet/skills -->

# 技能

技能是可重用的功能，可为您的代理提供专门的工作流程和领域知识。每个技能都存储在代理的长期记忆中`memories/skills/<skill-name>`。技能的名称和描述会在代理启动时加载。根据此信息，代理可以决定使用该技能。仅当代理确定其与当前任务相关时，才会加载完整的技能文件。如果任何引用的附加资源变得相关，则代理可以加载它们。

使用技能可以帮助：

- 通过仅提供与当前任务相关的上下文来节省令牌使用。
- 防止座席在系统提示中出现过多上下文，这可能导致幻觉和错误响应。

<Info>
舰队技能建立在[Deep Agents](/oss/python/deepagents/skills)之上，并遵循[Agent Skills specification](https://agentskills.io/specification)。有关技能结构、`SKILL.md` 格式和创作最佳实践的详细信息，请参阅[Deep Agents skills documentation](/oss/python/deepagents/skills)。
</Info>

## 私人技能与共享技能

技能可以是单个代理的**私有**，也可以在整个工作空间中**共享**：- **私人技能**：对其所属的代理私有，并存储在代理的长期记忆中。
- **共享技能**：与工作区共享并在[**Skills**](https://smith.langchain.com/agents/skills)页面上列出。
    - 对工作区中的所有座席可见。
    - 只有创建该技能的用户才能编辑或删除该技能。
    - 可以添加到工作区中的任何代理，并在技能更新时保持同步。
    - 通过通用聊天自动访问。

## 编写有效的技能描述

将描述写为何时使用该技能的说明，而不是作为其用途的标签。代理仅根据描述来路由任务。它仅在决定使用它后才读取完整的技能文件。

例如，不要写“帮助处理电子邮件”，而是写：“在起草、回复或总结电子邮件时使用。包括语气调整、后续安排和收件箱分类。”

过于宽泛的描述意味着代理即使能够正确处理任务也可能无法使用该技能。与另一项技能重叠的描述意味着客服人员可能会选择错误的技能或无法选择。随着您的技能库不断增长，请检查重叠的描述并缩小任何不明确的范围。## 创建技能

您可以通过两种方式创建技能：

- **使用人工智能**：使用自然语言描述技能，代理将为您创建它。您还可以添加其他资源。任何其他文件都必须在 `SKILL.md` 中引用，以便代理了解它们。
- **手动**：使用 `SKILL.md` 文件创建技能。

<Note>
默认情况下，技能对其所属的代理来说是**私有的**，并存储在代理的长期记忆中。你可以[share a skill with the workspace](#share-a-skill)。
</Note>

<Tabs>
    <Tab title="With AI">
    在[Fleet](https://smith.langchain.com/agents?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-skills)中，选择一个代理并提示其创建技能：

    <Prompt description="Create a skill that helps the agent use the web to research a topic.">
    创建一项技能来帮助代理使用网络来研究主题。当被要求研究主题、人物、公司、技术、事件或任何需要从网络收集和综合信息的问题时使用。涵盖新闻查找、竞争分析、背景研究和事实调查任务。对于大多数查询，首选 `tavily_web_search`。
    </Prompt>

    您还可以随时将之前的对话变成可重复使用的技能。完成任务后，要求代理捕获工作流程：

    <Prompt description="Turn this conversation into a reusable skill.">
    将我们刚才所做的变成一项技能，以便您将来可以重复。
    </Prompt>

    </Tab>
    <Tab title="From a template">1. 导航至[**Fleet > Skills**](https://smith.langchain.com/agents/skills)。
    1. 浏览可用模板并选择一个添加到您的代理中。

    </Tab>

    <Tab title="Manually">

    1. 在[Fleet](https://smith.langchain.com/agents?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-skills)中选择代理。
    1. 在侧栏中，展开 **知识** 抽屉。
    1. 在 **技能** 部分中，单击 **+ 添加技能**。
    1. 输入技能名称、描述和说明。

    </Tab>
</Tabs>

<Tip>
当您创建新代理时，如果代理可以从中受益，Fleet 会自动生成相关技能。这些技能默认是私有的。您可以从代理侧边栏[share them to your workspace](#share-a-skill)。
</Tip>

## 修复重复出现的错误

对代理错误的默认响应是立即纠正它。技能改变了这一点：它为智能体提供了每次遇到此类任务时要遵循的明确规则，因此同样的错误不会再次发生。

当代理错误地处理任务时，纠正它，然后要求它捕获修复：

<Prompt description="Capture this fix as a skill.">
将这种修正变成一种技能，这样你就总是能以这种方式处理它。
</Prompt>

代理创建一个`SKILL.md`编码正确的行为。在未来的会话中，它会在处理该任务之前读取技能，而不是从头开始推理。

## 编辑私人技能1. 在[Fleet](https://smith.langchain.com/agents?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-skills)中选择代理。
1. 在侧栏中，展开 **知识** 抽屉。
1. 在 **技能** 部分中，选择要编辑的技能。
1. 更新技能名称、描述或说明。

## 编辑共享技能

<Note>
只有创建共享技能的用户才能编辑它。
</Note>

1. 导航至[**Fleet > Skills**](https://smith.langchain.com/agents/skills)。
1. 选择要编辑的技能。
1. 更新技能名称、描述或说明。
1. 单击“**保存更改**”。

## 分享一个技能

1. 在[Fleet](https://smith.langchain.com/agents?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-skills)中选择代理。
1. 在侧栏中，展开 **知识** 抽屉。
1. 在 **技能** 部分中，选择要共享的技能。
1. 点击<Icon icon="share"/> **分享**。

分享后，该技能会出现在[**Skills**](https://smith.langchain.com/agents/skills)页面上。您可以从代理侧边栏向工作区中的任何代理添加共享技能，通用聊天会自动选择它们。

<Note>
只有共享技能的创建者才能编辑或删除它。
</Note>

## 删除私有技能

删除私人技能会将其永久删除，因为它存储在该代理的内存中。

1. 在[Fleet](https://smith.langchain.com/agents?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-skills)中选择代理。
1. 在侧栏中，展开 **知识** 抽屉。
1. 在 **技能** 部分中，单击要删除的技能的 <Icon icon="trash"/> 图标。

## 删除共享技能只有创建共享技能的用户才能删除它。

<Warning>
删除技能会将其从工作区以及使用它的所有客服人员中删除。此操作无法撤消。
</Warning>

1. 导航至[**Fleet > Skills**](https://smith.langchain.com/agents/skills)。
1. 选择要删除的技能。
1. 点击<Icon icon="trash"/> **删除技能**图标。

## 在本地发展中使用舰队技能

使用 LangSmith CLI 从 Fleet 工作区下载技能，并将其安装在本地，以便在 Claude Code、Cursor 或 Codex 等编码代理中使用。

默认情况下，文件保存到`~/.agents/skills/[skill-name]/`并符号链接到`~/.claude/skills/[skill-name]/`。

```bash
langsmith fleet skills pull [skill-name] [flags]
```

|旗帜|描述 |
|------|-------------|
| `--global=false` |安装到项目级目录（`.agents/` 和 `.claude/`）而不是主目录。 |
| `--agent` |定位特定代理（`claude`、`cursor`、`codex`）。 |
| `--copy` |复制文件而不是符号链接。 |
| `--format pretty` |显示已安装技能的文件树。 |

例如：

```bash
$ langsmith fleet skills pull web-research --format pretty
Installed skill "web-research" to ~/.agents/skills/web-research
  Linked: ~/.claude/skills/web-research

web-research/
├── SKILL.md
└── references/
    └── search-tips.md
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/skills.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>