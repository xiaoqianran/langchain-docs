<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Essentials | https://docs.langchain.com/langsmith/fleet/essentials -->

# 必需品

LangSmith 舰队要素是构成代理基础的核心功能。它们包括工具、渠道、内存、子代理和批准。

## 代理身份

代理身份控制代理与应用程序和服务交互时使用的[credentials](/langsmith/fleet/workspace-admin)。

请参阅[Agent identity](/langsmith/fleet/agent-identity)了解更多信息。

## 代理侧边栏

从代理聊天页面内置的侧边栏配置您的代理。侧边栏将代理配置组织到抽屉中：

- **渠道**：连接代理运行的位置，例如 Slack、Gmail 和 Microsoft Teams。参见[Channels](/langsmith/fleet/channels)。
- **共享**：控制谁可以使用代理，并提供私人、工作空间或特定人员的选项。参见[Change access to the agent](/langsmith/fleet/manage-agent-settings#change-access-to-the-agent)。
- **连接**：管理代理可以使用的集成和工具，设置连接格式，并将每个工具设置为自动运行或请求批准。请参阅 [Tools](#tools)、[Agent identity](#agent-identity) 和 [Human-in-the-loop](#human-in-the-loop)。
- **知识**：管理代理的指令、技能和记忆。请参阅 [Instructions](#instructions)、[Skills](#skills) 和 [Memory](#memory)。
- **时间表**：定期运行您的代理。参见[Schedules](/langsmith/fleet/schedules)。
- **高级设置**：为您的代理配置模型、API 密钥、子代理、诊断和开发人员选项。<Tip>
您还可以通过与代理聊天来配置代理。在座席聊天中，告诉座席如何改进自己，例如：“添加 Slack 工具，以便您可以回复消息。”
</Tip>

## 频道

<Anchor id="triggers" />

通道定义代理应何时开始运行。您可以将代理连接到外部工具或基于时间的计划，让它自动响应消息、电子邮件或重复事件。

有关设置说明和支持的通道类型，请参阅[Channels](/langsmith/fleet/channels)。

## 人机交互

保持对重要决策的控制。您可以将代理设置为在采取某些操作之前暂停并请求您的批准。这可确保您的代理自动处理大多数任务，同时您保留监督权。

### 设置审批模式

每个工具都有一个批准模式，您可以在[agent sidebar](#agent-sidebar)的**连接**抽屉中设置：

- **自动**：该工具自动运行，无需批准。
- **询问**：在工具运行之前，代理会暂停并等待您的批准。

要要求批准工具，请将其设置为 **询问**。当代理到达该工具时，它会暂停，直到您做出响应。

### 当您的代理暂停时您可以做什么

当您的代理人停下来请求批准时，您有两种选择：<CardGroup cols={2}>
  <Card title="Accept" icon="check">
    开绿灯，让您的代理人继续执行其计划。
  </Card>
  <Card title="Reject" icon="x">
    拒绝该操作并告诉客服人员要更改哪些内容。
  </Card>
</CardGroup>

<Note>
当从 Slack 触发代理时，它会通过 **Approve** 和 **Deny** 按钮直接在 Slack 线程中提出批准请求，因此您无需离开 Slack 即可做出响应。参见[Approve or deny actions in Slack](/langsmith/fleet/slack-app#approve-or-deny-actions-in-slack)。
</Note>

## 说明

指令是定义座席行为、个性和能力的系统提示。它们指导代理如何解释请求、使用其工具以及响应用户。

编辑指令：

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-essentials)中，打开您的代理。
1. 在侧栏中，展开 **知识** 抽屉。
1. 在 **说明** 部分中，编辑代理说明。

<Tip>
您还可以通过直接在聊天中提示客服人员来更新说明。例如：“更新您的说明，始终以要点形式进行回复。”
</Tip>

## LangChain 计算单元 (LCU)

队列使用情况以LangChain 计算单元 (LCU) 来衡量。 LCU 使用情况基于代理执行的 [model](#models) 工作，包括所选层及其处理和生成的内容量。<Note>
新的 [model tiers](#models) 和 LCU 定价适用于自 **2026 年 7 月 15 日**起的新机队使用情况。在此日期之前已经使用 Fleet 的组织将保留其当前设置，并于 **2026 年 10 月 1 日**过渡到新模型。如果您使用自定义模型，请联系您的 LangChain 客户团队了解转换事宜。
</Note>

配额在您的组织内共享并每月重置：

- **免费计划**：每个组织每月 5 个 LCU。当配额用完时，Fleet 会暂停新的运行，直到配额重置或组织升级到 Plus。
- **Plus 计划**：每个组织每月 25 个 LCU。额外使用需付费。有关当前费率，请参阅[LangSmith pricing page](https://www.langchain.com/pricing)。

运行成本各不相同。舰队运行可以进行多个模型调用，任务的长度和复杂性各不相同。较长的任务、较大量的上下文或较高的层可能比快速层中的短任务消耗更多的 LCU。

如果您的组织采用了祖父级 Plus 席位或跟踪定价，则当机队转向 LCU 定价时，这些费率不会发生变化。请联系您的客户团队以确认您组织的定价。

＃＃ 记忆客服人员会记住之前对话中的重要信息，并可以自我更新以更好地工作。舰队代理使用两种内存来源：

- **线程范围内存**：当前对话线程的上下文，包括该线程中的消息和操作。
- **长期记忆**：代理工作区中的持久文件，例如`AGENTS.md`、`tools.json`（工具配置）、`subagents/*` 和 `skills/*`。它们在运行时加载，并在每次运行开始时可用。 `AGENTS.md` 自动插入到系统提示符中。其他长期文件不会自动添加到提示中；代理必须按需阅读它们（例如，使用`read_file`工具）。

代理通过将文件写入**内存文件夹**（使用`write_file`和`edit_file`工具调用）来保留过去交互的相关详细信息。这有助于他们在未来的对话中做出更好的决定。

<Note>
默认情况下，代理在保存到记忆文件夹之前需要批准。您可以在**内存**下的**知识**抽屉中更改此设置。

对于在自动化 [schedules](/langsmith/fleet/schedules#add-a-schedule) 上运行的代理，我们建议使用 [disabling the approval requirement](/langsmith/fleet/manage-agent-settings#disable-required-approval-for-memory-updates)，以便代理可以在无需手动干预的情况下保留信息。
</Note>

欲了解更多信息，请参阅[How we built the memory system for Fleet (formerly known as Agent Builder)](https://www.langchain.com/conceptual-guides/how-we-built-agent-builders-memory)。

## 型号Fleet 为您管理模型。它为每项任务选择并维护一个强大的模型，因此您无需选择提供者、配置模型或提供 API 密钥即可获得良好的结果。使用量按[LangChain Compute Units (LCUs)](#langchain-compute-units-lcus)计费。

<Note>
自 **2026 年 7 月 15 日**起，新车型等级和 [LCU](#langchain-compute-units-lcus) 定价适用于新车队使用。在此日期之前已经使用 Fleet 的组织将保留其当前设置，并于 **2026 年 10 月 1 日**过渡到新模型。如果您使用自定义模型，请联系您的 LangChain 客户团队了解转换事宜。
</Note>

Fleet 提供三个托管层。随着新模型的推出，每层背后的模型可能会随着时间的推移而发生变化，因此您可以根据需要完成的工作而不是特定的提供商或模型进行选择。

|等级 |最适合 | <Tooltip tip="Higher tiers typically cost more and take longer.">相对成本</Tooltip> |
| ---- | -------- | ------------- |
| **快** |研究、总结和起草等日常任务 |低|
| **专业版** |更复杂的任务受益于更强的推理 |中等|
| **最大** |最苛刻的任务，最大能力最重要 |高|

### 定制模型在托管舰队模型选择器中，自定义模型不与 Fast、Pro 和 Max 一起使用。 LangChain 管理托管层的模型提供程序访问，因此您不需要自己的模型提供程序 API 密钥。如果企业部署需要自定义模型，请联系您的LangChain客户团队或[reach out to sales](https://www.langchain.com/contact-sales)。

## 自我更新

代理可以自我更新：他们可以添加新工具、删除不需要的工具或调整指令。但是，代理无法更改其名称、描述或启动它们的频道。

## 技能

技能是一种捆绑功能并在上下文不普遍相关的情况下提供更具体信息的方法。

使用技能可以帮助：

- 通过仅提供与当前任务相关的上下文来节省令牌使用。
- 防止座席在系统提示中出现过多上下文，这可能导致幻觉和错误响应。

要添加技能，请展开客服侧栏中的 **知识** 抽屉，然后单击 **+ 添加技能**。

有关更多信息，请参阅[Skills](/langsmith/fleet/skills)。

## 子代理通过将大任务分解为更小的、专门的助手来构建复杂的代理。将次级代理视为一个专家团队，每个专家在与您的主要代理合作时处理工作的特定部分。

这种方法可以更轻松地构建复杂的系统。您可以拥有专门的助手，每个人都擅长完成自己的任务，而不是由一个代理尝试完成所有事情。

以下是您可以使用子代理的一些方法：

- 分成子任务：让一个代理获取数据，另一个代理汇总数据，第三个代理格式化结果。
- 专用工具：根据不同的代理需要执行的操作，让他们可以使用不同的工具。
- 独立工作：让子代理独立工作，然后将结果返回给主代理。

要添加子代理，请打开代理，展开边栏中的**高级设置**抽屉，然后在**子代理**下单击**+ 添加子代理**。

## 线程

话题是您和您的代理之间的对话。每个线程都包含消息、代理响应以及代理采取的任何操作。

要查看线程，请导航到 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-essentials) 中的代理。收件箱显示该代理的所有线程。单击某个线程即可查看对话。### 已读和未读状态

线程的标记方式取决于代理是否使用通道：

- **聊天代理（无通道）：** 响应将线程标记为 **未读**。查看该线程会将其标记为已读。
- **基于通道的代理：** 响应默认将线程保持为 **已读**。

您可以随时手动将任何线程标记为已读或未读。

## 工具

工具可让您的代理与您的应用程序和服务进行交互。您的代理可以发送电子邮件、创建日历事件、发布消息、搜索网络等等。从 Gmail、Slack、Google Calendar、GitHub 等内置工具中进行选择。

无论代理是如何触发的，工具都可以工作。例如，您可以在队列聊天 UI 中启动任务，并让客服人员在完成后向您发送 [Slack message](/langsmith/fleet/slack-app#add-slack-tools)。

请参阅[Tool integrations](/langsmith/fleet/tools)了解更多信息。

## 痕迹

跟踪是代理从输入到输出所采取的一系列步骤。您可以使用[LangSmith](/langsmith/observability)来可视化这些执行步骤。

要查看代理的所有跟踪：

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-essentials)中，打开您的代理。
1. 在边栏中，展开 **高级设置** 抽屉。
1. 在 **诊断** 下，单击 **查看代理跟踪**。

要查看特定线程的跟踪：1. 在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-essentials) 中，导航至代理的收件箱。
1. 右键单击​​要跟踪的线程，然后选择“**查看跟踪**”。

欲了解更多信息，请参阅[LangSmith Observability](/langsmith/observability)。

<Note>
Fleet 跟踪所有代理运行并将其存储在 LangSmith 中。 LLM 提供商不会保留您的数据。在LangSmith云上，跟踪数据默认保存14天。
</Note>

## 后续步骤

- [Set up your workspace](/langsmith/fleet/workspace-admin)
- [Connect apps and services](/langsmith/fleet/tools)
- [Use remote servers for tools](/langsmith/fleet/remote-mcp-servers)
- [Choose between workspace and private agents](/langsmith/fleet/manage-agent-settings)
- [Call agents from your app](/langsmith/fleet/code)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/essentials.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>