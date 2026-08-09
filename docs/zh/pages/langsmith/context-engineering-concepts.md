<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Context engineering concepts | https://docs.langchain.com/langsmith/context-engineering-concepts -->

# 上下文工程概念

LangSmith 上下文工程的核心概念，包括技能、代理、版本控制和共享。

当上下文管理不善时，代理在生产中的行为会不一致。 *上下文*是代理执行操作所依赖的信息，例如系统指令、工具定义和参考材料。 *上下文工程*是构建和优化上下文以提高代理性能和能力的实践。

本页涵盖了 LangSmith 中上下文工程的核心概念：[skills](#skills)、[agents](#agents)、[the Context Hub](#context-hub-vs-store-backend)、[versioning](#versioning) 和 [sharing](#sharing-and-permissions)。

## 技能

*技能* 是 Context Hub 中的版本化存储库，它打包了代理可以调用的可重用功能。

技能库通常包含：

**常用文件：**

* 根目录下的`SKILL.md`，提供说明和使用指导。
* 可选的支持文件，例如参考、模板和架构。

示例包括电子邮件格式、代码审查和网络研究。

## 代理

*代理*是一种人工智能系统，它使用工具、技能和子代理来端到端地完成任务。 *代理存储库*打包其配置，包括高级指令、链接的技能和子代理以及工具配置。代理存储库通常包含：

**常用文件：**

* `AGENTS.md`为系统提示及操作说明。
* 可选文件，例如 `tools.json` 和链接的 `agents/*` 或 `skills/*` 条目。

例如电子邮件助理、编码副驾驶或客户支持代理。

## 在技能和代理之间进行选择

技能是可重用的上下文模块。代理存储库是定义代理应如何操作的顶级捆绑包。

* 使用跨代理共享的可重复使用的指令、策略或示例的技能。
* 使用代理存储库来获取一个代理的操作说明、工具和链接的依赖项。

## 链接的仓库

Context Hub 承诺支持 `files` 中的三种条目类型：

* `file`：内联文件内容。
* `agent`：链接到另一个代理存储库。
* `skill`：链接到另一个技能库。

当链接的代理或技能存储库获得新的提交时，LangSmith 会将该更新传播到引用它的父存储库。

<Tip>
  如果您发现自己将相同的上下文块复制到多个代理中，请将其提取到技能存储库中并从每个代理中引用它。
</Tip>

## Context Hub 与商店后端LangSmith 中的上下文可以由两个不同的后端管理：
**Context Hub** 和 **商店后端**。它们有不同的用途，大多数代理都使用这两种用途。

[Context Hub](/langsmith/use-the-context-hub) 是您代理的长期上下文存储。它跟踪每次更改作为提交，并支持版本控制、共享和持续改进。

*存储后端*是为运行时状态构建的。它保存代理在运行时积累的信息：记忆、对话历史记录、用户偏好、学到的事实以及每个会话或每个用户演变的其他数据。

## 版本控制

**Context Hub** 中存储库的每次更改都会创建一个新的提交。提交是不可变的、可浏览的且可比较的，因此您可以：

* 准确查看代理的两个版本之间发生了什么变化。
* 如果更改导致行为退化，则恢复到之前的任何提交。
* 标记重要的提交（例如，您在
  具体日期）以方便参考。
* 促进对 **环境** 的提交，例如 `Staging` 或 `Production`
  因此下游代理会拉取稳定版本而不是最新版本
  编辑。

如果此工作流程看起来很熟悉，那是故意的：Context Hub 为代理指令带来了与 Git 为代码带来的相同规则。## 共享和权限

**Context Hub** 是为团队设计的。每个存储库都位于 [workspace](/langsmith/administration-overview#workspaces) 中，访问权限取决于工作区权限和存储库可见性：

* **私人** 存储库仅在工作空间内可见。
* **公共** 存储库可以被任何人发现和提取。
* 创建提交、添加标签和升级环境需要工作区中的更新访问权限。

工作区级别的共享和可见性控制使中心成为座席和技能协作的自然场所，并随着时间的推移不断改进。

## 后续步骤

* [Use the Context Hub](/langsmith/use-the-context-hub) 创建你的第一个技能或代理。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/context-engineering-concepts.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>