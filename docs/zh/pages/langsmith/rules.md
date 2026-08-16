<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up automation rules | https://docs.langchain.com/langsmith/rules -->

# 设置自动化规则

虽然您可以手动筛选和处理来自 LLM 应用程序的生产日志，但随着您的应用程序扩展到更多用户，这通常会变得困难。 LangSmith 提供**自动化**，允许您对跟踪数据触发某些操作。您可以通过**过滤器**、**采样率**和**操作**来定义自动化。

自动化规则可以触发以下操作：向数据集添加跟踪、添加到注释队列、触发 Webhook（例如，用于远程评估）或扩展数据保留。您可以设置的一些自动化示例：

- 将所有带有负面反馈的跟踪发送到注释队列以供人工审核。
- 将所有跟踪的 10% 发送到注释队列以供人工审核以抽查问题。
- 升级所有有错误的跟踪，以延长数据保留时间。

<Info>
要配置在线评估，请访问[online evaluations](/langsmith/online-evaluations-llm-as-judge)页面。
</Info><Note>
当为该规则启用保留扩展时，自动化规则可以将匹配跟踪升级到[extended data retention](/langsmith/usage-and-billing#data-retention-auto-upgrades)。此升级会影响跟踪定价，但可确保保留满足自动化标准的跟踪（通常是对分析最有价值的跟踪）以供调查。每种动作类型都有自己的默认值，详细信息请参阅[action-level retention settings](#create-a-rule)。对于完全保留模型，请参阅[data retention auto-upgrades](/langsmith/usage-and-billing#data-retention-auto-upgrades)。
</Note>

## 自动化规则如何执行

每个自动化规则都按照独立的轮询计划运行。如果同一项目有多个规则，则 Webhook 规则可能会在评估程序规则对运行进行评分之前对其进行处理，反之亦然。

在单个规则内，如果配置了多个操作，它们将按以下顺序执行：

1. 添加到注释队列。
1. 添加到数据集。
1. 触发网络钩子。
1. 运行在线评估器。
1. 运行自定义代码评估器。
1. 触发警报。

如果您的工作流程要求在另一条规则触发时显示一条规则生成的数据（例如，您希望 Webhook 包含评估分数），请使用下游规则上的过滤器来显式创建该依赖项。例如，请参阅[Ensuring evaluations complete before the webhook fires](/langsmith/webhooks#ensuring-evaluations-complete-before-the-webhook-fires)。

## 查看自动化规则在[UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-rules)中，导航至侧边栏中的**跟踪**并选择一个跟踪项目。要查看该跟踪项目的现有自动化规则，请单击“**自动化**”选项卡。

## 创建规则

1. 在[UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-rules)中，导航至侧边栏中的**跟踪**，然后选择一个跟踪项目。单击跟踪项目页面右上角的 **+ New**，然后单击 **New Automation**。
1. 为您的规则命名。
1. 创建过滤器。自动化规则过滤器的工作方式与应用于项目中跟踪的过滤器相同。更多关于滤镜的信息，可以参考[Filter traces](/langsmith/filter-traces-in-application)。
1. 配置 **采样率** 以控制触发自动化操作的过滤运行的百分比。您可以为自动化指定 0 到 1 之间的采样率。这将控制发送到自动化操作的已过滤运行的百分比。例如，如果将采样率设置为 0.5，则通过过滤器的跟踪的 50% 将发送到操作。
1. （可选）通过切换 **应用到过去的运行** 并输入 **回填自** 日期，将规则应用于过去的运行。这只有在创建规则时才有可能。<Note>
    回填作为后台作业进行处理，因此您不会立即看到结果。为了跟踪回填进度，您可以[view logs for your automations](#view-logs-for-your-automations)。
    </Note>

1. 选择应用规则时要触发的操作。您可以使用自动化规则执行四种操作：

    - **添加到数据集**：将跟踪的输入和输出添加到[dataset](/langsmith/evaluation-concepts#datasets)。
    - **添加到注释队列**：将匹配的运行/跟踪添加到[annotation queue](/langsmith/annotation-queues)作为**运行**项。自动化规则不会将整个[threads](/langsmith/observability-concepts#threads)作为线程项排队；要查看完整的对话，请从 UI ([Assign runs and threads](/langsmith/annotation-queues#assign-runs-and-threads-to-a-single-run-queue)) 添加线程。
    - **触发 webhook**：使用跟踪数据触发 [webhook](/langsmith/use-webhooks)。
    - **延长数据保留**：延长使用基本保留[(refer to the data retention docs for more details)](/langsmith/usage-and-billing#data-retention)的匹配跟踪的数据保留期限。

        <Note>
        每个操作都有一个独立的**延长数据保留**开关，用于控制匹配跟踪是否升级为延长保留：- **添加到数据集**：选择加入（默认值：关闭）。启用切换以升级匹配的跟踪。
        - **添加到注释队列**：选择退出（默认值：打开）。禁用切换以跳过升级匹配跟踪。
        - **触发 webhook**：选择加入（默认值：关闭）。启用切换以升级匹配的跟踪。
        - **延长数据保留**操作和在线/代码评估器：不变；始终升级匹配的痕迹。

        每个操作的保留切换是仅限管理员控制，由 [⟦T0⟧](/langsmith/organization-workspace-operations#rules) 权限控制。非管理工作区成员会看到切换已禁用并且无法更改它们，但仍然可以创建和编辑规则而不影响保留设置。完全保留模型请参考[data retention auto-upgrades](/langsmith/usage-and-billing#data-retention-auto-upgrades)。
        </Note>

## 查看自动化日志

日志可以让您确信您的规则正在按预期运行。您可以通过导航到跟踪项目中的“自动化”选项卡并单击您创建的规则的“日志”按钮来查看自动化的日志。

日志选项卡允许您：- 查看给定规则在选定时间段内处理的所有运行。
- 如果特定规则执行触发了错误，您可以将鼠标悬停在错误图标上查看错误消息。
- 您可以通过过滤规则的创建时间戳来监控回填作业的进度。这是因为回填从规则创建时开始。
- 使用 **查看运行** 按钮检查自动化规则应用到的运行。对于将运行作为示例添加到数据集的规则，您可以查看生成的示例。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/rules.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>