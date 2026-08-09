<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Agent platform comparison | https://docs.langchain.com/langsmith/fleet/comparison -->

# 代理平台对比

将 LangSmith Fleet 与 Claude Cowork、Amazon Quick、Google Workspace Studio 和 Microsoft Copilot 进行比较，为您的团队选择合适的企业代理平台

[**LangSmith Fleet**](/langsmith/fleet/index) 是一个企业代理平台，用于在整个组织中构建、共享和管理代理。本页面将其与类似平台进行比较，以帮助您为您的团队选择合适的平台。

<div>
  | **平台** | **选择如果...** |
  | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- || [LangSmith Fleet](/langsmith/fleet/index) |您希望在整个组织中构建和共享专门构建的代理，保持模型无关性，并通过 LangSmith 保持完全可观察性。 **Fleet** 是具有自托管部署路径并能够通过 [Deep Agents](/oss/python/deepagents/overview) 将代理导出为代码的唯一选项。 |
  |克劳德·科沃克 |您希望从桌面将开放式任务委托给 Claude 进行个人知识工作，而设备上的数据存储可以满足您的隐私要求。                                                                                                                                               |
  |亚马逊快速|您已经在 AWS 上，并且想要一个能够直接访问您的 AWS 数据源和企业集成的 AI 助手。                                                                                                                                                                                || Google Workspace Studio |您的组织在 Google Workspace 上运行，并且您希望无代码代理能够在 Gmail、云端硬盘和表格中本地运行，而无需离开 Google 生态系统。                                                                                                                                         |
  |微软副驾驶 |您的组织在 Microsoft 365 上运行，并且您需要低代码代理（通过 Copilot Studio）本地发布到 Teams 和 Microsoft 365 Copilot，并通过 Power Platform 管理中心进行管理。                                                                                                   |
</div>

## 比较能力

* ❌ 不可用
* ⚠️ 部分或有限
* — 未从公开文件中确认<div>
  | **方面** | **朗史密斯舰队** | **克劳德·科沃克** | **亚马逊快速** | **Google Workspace Studio** | **微软副驾驶** |
  | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------- || **主要用例** |团队构建专用代理以在整个组织中共享，无需创建代码并导出代码以进行自定义部署；使用通用聊天代理来完成任何任务的个人 |个人桌面知识工作|企业人工智能与 AWS 数据集成 | Google Workspace 的无代码代理 | Microsoft 365 的低代码代理 |
  | **模型支持** |与模型无关：任何具有 OpenAI 兼容或 Anthropic 兼容 API 的法学硕士 |仅克劳德| — |双子座3 |精心策划的 OpenAI + Anthropic 模型；通过 Azure AI Foundry 自带 || **界面** | Web 应用程序、Slack 应用程序、Teams 应用程序、API |桌面、移动、Slack、M365 连接器 | Web、桌面、浏览器扩展、Slack、Teams | Web 应用程序、Gmail 和聊天侧边栏 | Teams、M365 应用程序、网络、移动、Windows、Copilot Studio |
  | **部署** |云（LangSmith）或自托管 |默认本地；在 Anthropic 云上远程 |云 (AWS) |云（谷歌）|云（微软）|
  | **自托管** | ✅ [beta](/langsmith/deploy-self-hosted-full-platform#enable-fleet-insights-and-chat)、[contact sales](https://www.langchain.com/contact-sales) 了解生产准备详细信息 | ❌ | ❌ | ❌ | ❌ || **代码导出** | ✅ [Export to Deep Agents](/langsmith/fleet/code) | ❌ | ❌ | ❌ | ❌ |
  | **可观察性** | LangSmith 大规模追踪和评估 | OpenTelemetry 到 SIEM | CloudTrail + 运行日志 |活动选项卡+审核日志|应用程序洞察 + 权限 || **平台许可证** |专有|专有|专有|专有|专有|
  | **代码出口许可证** |麻省理工学院 ([Deep Agents](/oss/python/deepagents/overview)) |不适用 |不适用 |不适用 |不适用 |
</div>

### 目标用户**舰队**涵盖组织范围和个人用例。团队可以构建专门构建的代理以在整个组织中共享（例如，为整个运营组织提供服务的供应商接收代理，或为每个客户经理在周一早上节省三十分钟的每周报告代理），并且任何用户都可以通过 Fleet 的通用默认聊天使用任何工具获得任何任务的帮助。其他平台专注于个人生产力、特定于生态系统的自动化或两者兼而有之，但没有一个平台将无代码代理构建与组织范围的共享和代码导出结合起来。

**Fleet** 还允许您设置工具级审批要求，以便代理在执行敏感步骤之前与您进行核对，并使用 [centralized inbox](https://smith.langchain.com/agents/inbox) 来审核、编辑和批准操作。在此比较中，没有其他平台提供涵盖所有代理的单一集中审批收件箱。<div>
  |特色 | **舰队** | **克劳德·科沃克** | **亚马逊快速** | **Google Workspace Studio** | **微软副驾驶** |
  | ------------------------ | | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------- | ------------------------ | | ------------------------ | |
  |通用聊天代理 | ✅ [Fleet chat](https://smith.langchain.com/agents?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-fleet-comparison) | ✅ | ✅ | ❌ | ✅ |
  |无代码代理构建器 | ✅ | ❌ | ✅ | ✅ | ✅ || Slack 原生集成 | ✅ [Native Slack app](/langsmith/fleet/slack-app) | ✅ | ✅ | ⚠️ | ⚠️（通过 Azure 机器人服务）|
  |微软团队集成 | ✅ [Teams app](/langsmith/fleet/teams-app) | ✅ | ✅ | ❌ | ✅ |
  |预定运行 | ✅ [Schedules](/langsmith/fleet/schedules) | ✅ | ✅ | ✅ | ✅ |
  |分代理 | ✅ [Sub-agents](/langsmith/fleet/essentials#sub-agents) | ✅ | ✅ | ❌ | ✅ ||技能系统| ✅ [Skills](/langsmith/fleet/skills) | ✅ | ❌ | ❌ | — |
  |人机交互 | ✅ [Central approvals inbox](/langsmith/fleet/essentials#human-in-the-loop) | ✅ | ✅ | ⚠️ | ⚠️ |
  | MCP 客户端 | ✅ [Remote MCP servers](/langsmith/fleet/remote-mcp-servers) | ✅ | ✅ | ❌ | ✅ |
  |网络搜索| ✅（通过 Exa、Tavily）| ✅ | ✅ | ✅ | ✅ |
</div>

### 企业控制和访问**Fleet** 提供 RBAC、基于属性的访问控制和每个代理共享权限（克隆、运行和编辑）。在此处比较的平台中，只有 Fleet 记录了基于每个 MCP 服务器属性的访问控制。所有平台都提供某种形式的 RBAC，但粒度各不相同。

**车队** 管理工作空间级别的支出。对于企业计费选项，[contact sales](https://www.langchain.com/contact-sales)。

<div>
  |特色| **舰队** | **克劳德·科沃克** | **亚马逊快速** | **Google Workspace Studio** | **微软副驾驶** |
  | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------- | ------------------------ | | -------------------- |
  |基于角色的访问控制| ✅ [RBAC with per-tool permissions](/langsmith/rbac) | ✅ | ✅ | ✅ | ✅ ||基于属性的访问控制| ✅ [Per MCP server and integration](/langsmith/fleet/access-and-oversight#attribute-based-access-control) | ❌ | ❌ | ❌ | — |
  |每个代理共享和权限 | ✅ [Clone, Run, and Edit access per agent](/langsmith/fleet/access-and-oversight#permissions-and-sharing) | ⚠️ | ✅ | ⚠️ | ✅ |
  |凭证模型（固定或每个用户）| ✅ [Configurable per agent](/langsmith/fleet/access-and-oversight#agent-identity-and-credentials) | ✅ | ✅ | ✅ | ✅ |
  |支出限额 | ⚠️ 在工作区级别进行管理 | ✅ | ⚠️ | ⚠️ | ✅ |
  | SCIM 配置 | ✅ | ✅ | ✅ | — | ✅ |
  |审计追踪| ✅ [Structured LangSmith traces](/langsmith/fleet/access-and-oversight#observability-and-audit-trail) | ✅ | ✅ | ✅ | ✅ |
</div>

### 模型灵活性**Fleet** 通过 OpenAI 或 Anthropic 聊天规范支持任何 LLM，包括自托管提供商，不依赖于生态系统。 Microsoft Copilot 通过 Azure AI Foundry 提供精心策划的多供应商模型和自带路径，但完全的灵活性需要 Azure 基础设施。 Google Workspace Studio 和 Amazon Quick 更受各自供应商生态系统的限制。

在此处比较的平台中，只有 Fleet 可与任何 OpenAI 或 Anthropic 兼容的 API 端点兼容，无论云提供商如何。

### 记忆、自我更新和学习

**舰队**代理可以使用专用记忆系统在对话中保留上下文，并且可以在从交互中学习时更新自己的指令、添加工具或删除工具。在此处比较的平台中，只有 Fleet 记录代理在运行时的自我修改。<div>
  |特色| **舰队** | **克劳德·科沃克** | **亚马逊快速** | **Google Workspace Studio** | **微软副驾驶** |
  | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------- | ------------------------ | | -------------------- |
  |长期记忆 | ✅ [Persistent memory files across sessions](/langsmith/fleet/essentials#memory) | ✅ | ✅ | ❌ | — |
  |线程范围上下文 | ✅ | ✅ | ✅ | ✅ | ✅ |
  |自动更新代理 | ✅ [Agents can add tools, remove tools, and update their own instructions](/langsmith/fleet/essentials#self-updates) | ❌ | ❌ | ❌ | ❌ ||内存写入的批准门 | ✅ [Configurable per agent](/langsmith/fleet/manage-agent-settings) | ❌ | ❌ | ❌ | — |
</div>

### 可观察性和治理

**Fleet** 最明显的优势是它与 LangSmith 的本地连接。每个代理运行都会在 LangSmith 中进行跟踪，从而可以轻松调试性能并大规模运行评估。其他平台提供基本的日志记录和审计跟踪，但没有一个平台能与 Fleet 通过专用可观察性平台进行 LLM 感知跟踪、评估和调试的深度相媲美。<div>
  |特色| **舰队** | **克劳德·科沃克** | **亚马逊快速** | **Google Workspace Studio** | **微软副驾驶** |
  | -------------- | ------------------------------------------------------------------------ | ----------------- | ---------------- | ------------------------ | | -------------------- |
  |原生追踪 | ✅ [LangSmith traces for every run](/langsmith/observability) | ✅ | ⚠️ | ⚠️ | ⚠️ |
  |评价| ✅ [LangSmith evaluations](/langsmith/evaluation-concepts) | ❌ | ❌ | ❌ | ⚠️ |
</div>

### 代码导出和托管

**Fleet** 允许您通过 [Deep Agents](/oss/python/deepagents/overview)（Fleet 运行的开源代理运行时）将构建的任何代理导出为代码。导出的代理已获得 MIT 许可，可以独立于 Fleet 部署、修改代码，或通过 [API](/langsmith/fleet/code) 直接集成到您自己的应用程序中。此比较中的其他平台均不提供代码导出路径。**Fleet** 是本次比较中唯一具有自托管部署选项的平台。对于有合规性要求的团队，自托管和 BYOC（自带云）配置可让您完全在自己的基础设施中运行 Fleet。所有其他平台都是纯云托管服务。

<div>
  |特色 | **舰队** | **克劳德·科沃克** | **亚马逊快速** | **Google Workspace Studio** | **微软副驾驶** |
  | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------- | ------------------------ | | -------------------- ||云托管| ✅ | ⚠️ | ✅ | ✅ | ✅ |
  |自托管 | ✅ [beta](/langsmith/deploy-self-hosted-full-platform#enable-fleet-insights-and-chat)、[contact sales](https://www.langchain.com/contact-sales) 了解生产准备详情 | ❌ | ❌ | ❌ | ❌ |
  |定制型号| ⚠️ [Enterprise only](/langsmith/fleet/essentials#custom-models) | ❌ | ❌ | ⚠️ | ⚠️ |
  |从您的应用程序呼叫代理 | ✅ [API access](/langsmith/fleet/code) | ✅ | ⚠️ | ❌ | ✅ ||导出到代码 | ✅ [Export to Deep Agents](/langsmith/fleet/code) | ❌ | ❌ | ❌ | ❌ |
</div>

### 集成和工具

A ✅ 表示集成可用；支持的操作和深度因平台而异。请参阅 [Fleet tool integrations](/langsmith/fleet/tools) 了解 Fleet 内置集成的完整列表以及每个集成的功能。

<div>
  |特色 | **舰队** | **克劳德·科沃克** | **亚马逊快速** | **Google Workspace Studio** | **微软副驾驶** |
  | ------------------------------------------------- | --------------------------------------- | ----------------- | ---------------- | ------------------------ | | -------------------- |
  | Google Workspace（Gmail、云端硬盘、表格、文档）| ✅ | ✅ | ⚠️ | ✅ | ⚠️ || Microsoft 365（Outlook、团队、SharePoint、Excel）| ✅ | ✅ | ✅ | ❌ | ✅ |
  | GitHub | ✅ | ✅ | ✅ | — | — |
  |松弛| ✅ [Native](/langsmith/fleet/slack-app) | ✅ | ✅ | ⚠️ | ❌ |
  | CRM（Salesforce、HubSpot）| ✅ | — | ✅ | ⚠️ | ✅ |
  |项目管理（Linear、Jira、Notion）| ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
  |通过 MCP 定制工具 | ✅ | ✅ | ✅ | ❌ | ✅ ||网络钩子 | ✅ [Webhooks](/langsmith/fleet/webhooks) | ❌ | ❌ | ⚠️ | ✅ |
</div>

有关定价和 SLA 信息，[contact sales](https://www.langchain.com/contact-sales)。

<Note>
  最后更新时间为 2026 年 5 月 5 日。这些产品发展迅速。如果有任何更改，请[file an issue](https://github.com/langchain-ai/docs/issues)帮助我们保持此页面最新。
</Note>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/comparison.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>