<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up automation rules | https://docs.langchain.com/langsmith/rules -->

# 设置自动化规则

虽然您可以手动筛选和处理来自 LLM 应用程序的生产日志，但随着您的应用程序扩展到更多用户，这通常会变得困难。 LangSmith 提供**自动化**，允许您对跟踪数据触发某些操作。您可以通过**项目类型**、**过滤器**、**采样率**和**操作**来定义自动化。

自动化规则可以触发以下操作：向数据集添加跟踪、添加到注释队列、触发 Webhook（例如，用于远程评估）或扩展数据保留。规则匹配单个运行或整个[threads](/langsmith/observability-concepts#threads)，具体取决于您选择的项目类型。您可以设置的一些自动化示例：

- 将所有带有负面反馈的跟踪发送到注释队列以供人工审核。
- 将所有跟踪或线程的 10% 发送到注释队列以供人工审核以抽查问题。
- 将评估器分数较低的所有跟踪发布到您的 webhook 端点。
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
1. 延长数据保留时间。
1. 触发警报。

如果您的工作流程要求在另一条规则触发时显示一条规则生成的数据（例如，您希望 Webhook 包含评估分数），请使用下游规则上的过滤器来显式创建该依赖项。例如，请参阅[Ensuring evaluations complete before the webhook fires](/langsmith/webhooks#ensuring-evaluations-complete-before-the-webhook-fires)。

## 将项目类型设置为运行或线程**项目类型**控件确定规则匹配的内容。将其设置为 **Runs**，规则会在每个匹配运行到达时对其进行评估。将其设置为**线程**，规则将等待对话完成，然后将其操作一次应用于整个线程。当您要查看或导出的单元是完整对话而不是单个回合时，请选择 **话题**。

线程规则需要一个将跟踪分组为线程的跟踪项目。欲了解更多信息，请参阅[Configure threads](/langsmith/threads)。

### 配置线程规则

选择 **Threads** 会更改规则形式的三个部分：- **线程过滤器**：过滤器构建器将 **跟踪计数** 和 **线程 ID** 添加到可用字段。根据 **跟踪计数** 进行过滤，将规则范围限定为给定长度的对话。其他字段评估线程中的每个跟踪而不是整个线程，因此当任何跟踪匹配时，线程就匹配。例如，**状态** 上的筛选器会选择包含错误跟踪的每个线程，而不仅仅是上次跟踪出错的线程。
- **操作**：表单提供一个操作，**添加到注释队列**或**触发 Webhooks**。 **添加到数据集** 目前不可用。
- **应用于过去的运行**：当前不为线程规则提供回填。

两个线程操作的行为如下：

- **添加到注释队列**：将线程作为线程项添加到队列中。主题项目显示对话记录并仅支持标题反馈。关于运行项和线程项的区别，请参阅[annotation queue capability table](/langsmith/annotation-queues#single-run-annotation-queues)。
- **触发 Webhooks**：发送一个有效负载，其顶级 `threads` 数组保存每个匹配的线程。欲了解更多信息，请参阅[Read a thread rule payload](/langsmith/webhooks#read-a-thread-rule-payload)。

### 设置线程空闲时间线程规则仅在线程空闲后起作用。一旦提取了线程中的最后一个跟踪，LangSmith 就会等待跟踪项目配置的空闲时间过去，这表示会话已完成。空闲时间默认为 10 分钟，且不能设置低于 2 分钟。

空闲时间是与[multi-turn online evaluators](/langsmith/online-evaluations-multi-turn)共享的项目级设置。在项目上创建第一个线程规则会应用默认值，而不会覆盖已为该项目设置的值，并且更改该值会影响其中的每个线程评估器和线程规则。

这些限制限制了线程规则处理的内容：

- **运行时间必须少于一周**：当线程空闲时，只有过去 7 天的运行才符合条件。
- **每次执行最多 500 个线程**：单个执行最多处理 500 个匹配线程，按最近的活动排序。

### 延长线程的数据保留

[Data retention](/langsmith/usage-and-billing#data-retention-auto-upgrades) 是跟踪的属性，而不是线程的属性。当线程规则启用了**扩展数据保留**时，它会将**匹配线程中的每个跟踪**升级为延长保留，而不仅仅是最近的跟踪。由于每个跟踪都是单独升级的，因此保留较长的对话成本更高。作为交换，整个对话将被保留以供调查，而不是依次过期。

## 查看自动化规则

在[UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-rules)中，导航到侧边栏中的**跟踪**并选择一个跟踪项目。要查看该跟踪项目的现有自动化规则，请单击“**自动化**”选项卡。

## 创建规则

1. 在[UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-rules)中，导航至侧边栏中的**跟踪**，然后选择一个跟踪项目。单击跟踪项目页面右上角的 **+ New**，然后单击 **New Automation**。
1. 为您的规则命名。
1. 选择 **项目类型**，**运行** 或 **线程**。项目类型决定哪些过滤器字段和操作可用，因此请在配置之前进行设置。欲了解更多信息，请参阅[Set the item type to runs or threads](#set-the-item-type-to-runs-or-threads)。
1. 创建过滤器。自动化规则过滤器的工作方式与应用于项目中跟踪的过滤器相同。更多关于滤镜的信息，可以参考[Filter traces](/langsmith/filter-traces-in-application)。1. 配置 **采样率** 以控制触发自动化操作的过滤项目的百分比。该表单接受 0 到 100 之间的百分比。例如，50% 的采样率会将通过过滤器的项目的一半发送到操作。等效的 API 字段 `sampling_rate` 采用 0 到 1 之间的小数。
1. （可选）通过切换 **应用到过去的运行** 并输入 **回填自** 日期，将规则应用于过去的运行。这仅在创建规则时才可能，并且不适用于项目类型为 **线程** 的规则。

    <Note>
    回填作为后台作业进行处理，因此您不会立即看到结果。为了跟踪回填进度，您可以[view logs for your automations](#view-logs-for-your-automations)。
    </Note>

1. 选择应用规则时要触发的操作。项目类型为 **运行** 的规则提供以下所有操作。项目类型为 **线程** 的规则仅提供 **添加到注释队列** 和 **触发 Webhooks**。- **添加到数据集**：将跟踪的输入和输出添加到[dataset](/langsmith/evaluation-concepts#datasets)。
    - **添加到注释队列**：将匹配的运行或跟踪添加到[annotation queue](/langsmith/annotation-queues)作为运行项。话题规则将整个对话添加为话题项目。如需手动添加线程，请参阅[Assign runs and threads](/langsmith/annotation-queues#assign-runs-and-threads-to-a-single-run-queue)。
    - **触发 Webhooks**：将匹配的项目发布到规则上配置的每个 [webhook](/langsmith/webhooks) URL。
    - **延长数据保留**：延长使用基本保留[(refer to the data retention docs for more details)](/langsmith/usage-and-billing#data-retention)的匹配跟踪的数据保留期限。

        <Note>
        每个操作都有一个独立的**扩展数据保留**开关，用于控制匹配跟踪是否升级为扩展保留。两种项目类型的默认值相同：

        - **添加到数据集**：选择加入（默认值：关闭）。启用切换以升级匹配的跟踪。
        - **添加到注释队列**：选择退出（默认：打开）。禁用切换以跳过升级匹配跟踪。
        - **触发 Webhooks**：选择加入（默认值：关闭）。启用切换以升级匹配的跟踪。
        - **扩展数据保留**操作和在线/代码评估器：不变；始终升级匹配的痕迹。对于线程规则，启用的切换会升级匹配线程中的每个跟踪。欲了解更多信息，请参阅[Extend data retention for a thread](#extend-data-retention-for-a-thread)。

        每个操作的保留切换是仅限管理员控制，由 [⟦T2⟧](/langsmith/organization-workspace-operations#rules) 权限控制。非管理工作区成员会看到切换已禁用并且无法更改它们，但仍然可以创建和编辑规则而不影响保留设置。完全保留模型请参考[data retention auto-upgrades](/langsmith/usage-and-billing#data-retention-auto-upgrades)。
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