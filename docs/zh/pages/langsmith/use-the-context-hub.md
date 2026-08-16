<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use the Context Hub | https://docs.langchain.com/langsmith/use-the-context-hub -->

# 使用上下文中心

**Context Hub** 为您的团队提供对代理在生产中使用的指令和工具的版本控制、环境感知管理。 _context_ 是一个版本化的代理指令和工具包，可以是一项技能，也可以是一个完整的代理，您可以在 LangSmith 中进行管理。

使用本指南创建您的第一个上下文，查看其文件和历史记录，并将其提升到环境，以便您的代理可以拉取它。

## 1. 打开上下文中心

<Note>
如果您在左侧导航中没有看到 **Context**，请验证您的工作区是否已启用 Context Hub，并且您是否拥有所需的权限。
</Note>

在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-use-the-context-hub)中，选择**上下文**
左侧导航。 Context Hub 列出了您工作区中的每个客服人员和技能。

![The Context Hub home view listing existing Agent and Skill contexts with their commit metadata.](/langsmith/images/context-hub-home.png)

## 2. 创建上下文

1. 单击 Context Hub 左上角的 **+ 创建**。
1. 选择上下文类型：
    - **代理：** 完整的代理包，包括 `AGENTS.md` 文件和工具。
    - **技能：**代理可以使用的可重用功能，包括 `SKILL.md` 文件。

    <img src="/langsmith/images/context-hub-create-context.png" alt="The Create dropdown showing the Agent and Skill context type options." width="360" />1. 填写名称和描述。对于技能，需要描述。您还可以立即输入初始文件内容（技能为`SKILL.md`，代理为`AGENTS.md`），或在创建后添加它们。单击**创建代理**或**创建技能**。 LangSmith 创建存储库并打开它进行编辑。

## 3. 查看上下文

单击 Context Hub 中的客服人员或技能即可查看。

![An Agent context with an AGENTS.md file open, showing the environments panel, commit history, and file tree.](/langsmith/images/context-hub-agent-view.png)

中间面板显示当前提交的文件树，右侧面板预览所选文件。单击中间面板中的文件将其打开，然后在右侧面板中对其进行编辑并保存更改以创建新的提交。

每个保存的更改都会在 **Commit History** 面板中创建一个新的 **commit**
左侧，这样您就可以浏览、比较和恢复以前的版本而不会丢失
工作。

## 4. 标记并提升提交

一旦提交准备好交付，请将其提升到下游环境
代理可以拉它。

<Note>
Context Hub 目前支持两种环境标签进行升级：`staging` 和 `production`。
</Note>1. 选择目标提交后，单击右上角的 **Promote**。
1. 选择目标环境：
    - **升级到生产：**生产代理拉动的提交。
    - **升级到暂存：**用于验证的预生产环境。

    <img src="/langsmith/images/context-hub-promote.png" alt="The Promote dropdown with options to promote a commit to Production or Staging." width="300" />

1. 环境标签（例如`Production 7ca95573`）移动到
   提升提交。使用 **Promote** 旁边的 **Tag** 按钮附加
   任何提交都有人类可读的标签，以便于参考。

通过环境标签（例如，`:production`）解析上下文的代理运行时现在会拉取此提升的提交。

## 后续步骤

- [Context engineering concepts](/langsmith/context-engineering-concepts)：了解技能、代理、版本控制和共享。
- [Manage contexts with the SDK](/langsmith/manage-contexts-sdk)：以编程方式推送、拉取、列出和删除上下文。
- [Configure commit webhooks](/langsmith/context-hub-webhooks)：将工作区 Context Hub 提交发送到外部 HTTPS 端点。
- [Mount a Context Hub repo in a sandbox](/langsmith/sandbox-sdk#mount-a-context-hub-repo)：为沙箱代码提供对存储库的只读文件系统访问权限，并在更改时保持同步。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/use-the-context-hub.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>