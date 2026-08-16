<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Track and limit evaluator spend | https://docs.langchain.com/langsmith/evaluator-spend -->

# 跟踪和限制评估者支出

限制每位评估员每周的 LLM 支出，以防止单个评估员超出您的预算。 LangSmith 跟踪本周迄今为止的评估者支出，并于周一上午 12 点（世界标准时间）重置。它让 [organization admins](/langsmith/rbac#organization-admin) 为每个评估者的 [attached projects and datasets](/langsmith/evaluation-concepts#attaching-an-evaluator-to-a-tracing-project-or-dataset) 设置每周上限。该上限可以是单个组织范围内的默认值，也可以是特定附加项目或数据集上的自定义覆盖。

本指南向您展示如何查看和配置每周评估者支出上限。

<Tip>
LangSmith还提供[per-trace and per-model cost tracking](/langsmith/cost-tracking)和[tracing usage limits](/langsmith/administration-overview#usage-limits)用于成本控制。
</Tip>

<Warning>
设置支出限额适用于 OpenAI、Anthropic 和 Gemini 型号。支出限制仅针对在 LangSmith 中具有 [pricing configured](/langsmith/cost-tracking#create-a-new-or-modify-an-existing-model-price-entry) 的受支持模型上执行。在依赖限制之前验证模型定价。一旦设置限制，不支持的模型就不能在评估器中使用。
</Warning>

<Note>
用户界面将本周至今的窗口标记为**本周**。
</Note>

## 执法如何运作LangSmith 记录每次评估器运行完成后的支出，然后汇总从世界标准时间周一上午 12 点到当前时刻的支出。当总数达到有效限制时，LangSmith 暂停附加项目或数据集上的评估器。在最终确定之前，运行中的运行可能会使总数略高于上限，因此支出可能会短暂超出一小部分。

代理和跟踪不受影响。只有评估者才会停止生成分数，直到支出限额重置或限额为[manually increased](#override-the-default-for-an-attached-project-or-dataset)。

## 花费视图和控件

|查看 |在哪里可以找到它 |谁可以看到或更改它 |
|------|--------------------------------|--------------------------|
| [Evaluators page dashboard](#evaluators-page-dashboard) | **左侧边栏中的评估者** |所有工作区成员 |
| [Evaluators table](#evaluators-table)（消费、消费状态）| **左侧边栏中的评估者** |所有工作区成员 |
| [Projects & Datasets tab](#projects-%26-datasets-tab-on-an-evaluator) |打开评估器，**项目和数据集** |所有工作区成员 |
| [Organization default spend limit](#set-an-organization-default-spend-limit) |组织 **设置** > **使用配置** |需要`organization:manage`查看和编辑|
| [Per-evaluator override](#override-the-default-for-an-attached-project-or-dataset) |编辑评估器 > **高级** > **支出限额** |所有会员均可查看，需要`organization:manage`编辑|<CardGroup cols={2}>
  <Card title="Set your first limit" icon="settings" href="#set-an-organization-default-spend-limit">
    打开组织**设置**并定义一个每周上限，该上限适用于组织中所有工作区中每个项目和数据集的所有评估器附件。
  </Card>
  <Card title="Override for one project or dataset" icon="edit" href="#override-the-default-for-an-attached-project-or-dataset">
    自定义附加到评估器的特定项目或数据集的限制。
  </Card>
</CardGroup>

## 查看评估者支出

您可以在以下 UI 位置找到支出：

### 评估者页面仪表板

从左侧边栏导航至 **评估者** 页面。页面顶部显示整个工作区的每周视图：

- **每日评估支出**：每天支出的堆积条形图。在 **评估器** 和 **项目/数据集** 细分之间切换。
- **本周评估者支出**：所有评估者的美元总支出，与上周相比有所变化。
- **本周评估者跟踪**：所有评估者的总跟踪计数，与上周相比有所变化。
- **每周评估者支出限制监控**：根据 `$ spent / $ limit` 按项目或数据集进度条排序最高支出者列表。标题显示已达到限制（**限制达到**）或**即将达到限制**的项目或数据集的数量。使用页眉中的 **上一周** 和 **下一周** 控件来移动每周视图。

跟踪项目或数据集视图有一个 **Evaluators** 选项卡，该选项卡反映了适用于该项目或数据集的这些小部件，例如，**此跟踪项目的每日评估者支出**。

### 评估者表

同一页面上的评估者表包括：

- **支出（本周）**：自世界标准时间周一 12 点以来评估者在所有附加项目和数据集上的 LLM 总成本。不调用 LLM 的评估器（例如，代码评估器）、禁用的评估器以及没有附加项目或数据集的评估器不显示任何值。
- **支出状态**：以下之一：
    - **低于限制**：至少一个附加项目或数据集有限制，并且没有一个达到上限。
    - **N 限制命中**：评估器已达到其附加的一个或多个项目或数据集的限制。该数字反映了有多少个已暂停。
    - **无限制**：未设置任何限制。
    - 对于不调用 LLM 的评估者（例如，代码评估者）和没有附加项目或数据集的评估者，不会显示任何值。

### 评估器上的“项目和数据集”选项卡打开评估器并选择 **项目和数据集** 选项卡以查看每个项目或数据集的支出和限制：

- **支出（本周）**：自世界标准时间周一 12 点以来评估者在该项目或数据集上的 LLM 总成本。
- **支出限额的百分比**：进度条显示自世界标准时间周一 12 点以来的支出限额。
- **每周限制**：该项目或数据集的有效每周限制，组织默认值或自定义覆盖。

附件管理请参考[Manage evaluators](/langsmith/evaluators)。

## 设置组织默认支出限额

组织管理员设置一个每周上限，该上限适用于组织中每个工作区中每个评估者附加的项目和数据集。每个组织都有一个默认值，而不是每个工作区都有一个默认值。

<Note>设置和编辑组织默认值需要`organization:manage`[permission](/langsmith/rbac)。</Note>

1. 打开组织**设置**并导航至**使用配置**。
1. 对于**评估者支出限额**，输入美元金额。单位是`/ week`。留空表示没有限制。
1. 单击“**保存**”。如果未设置组织默认值，则附加项目和数据集不受限制，除非配置了自定义覆盖。清除默认值会删除当前继承它的每个附加项目或数据集的上限。

更改默认值只会更新继承它的附加项目和数据集。自定义覆盖被保留。

## 覆盖附加项目或数据集的默认值

组织管理员可以覆盖附加到评估器的特定项目或数据集的默认值。

1. 导航到左侧边栏中的**评估器**，然后打开评估器。
1. 单击右上角的 **编辑评估器** 图标。
1. 在 **来源** 下，选择特定项目或数据集。
1. 滚动经过**过滤器**和**采样率**，然后展开**高级**。
1. 在 **支出限额** 字段中，设置自定义美元金额。单位是`/ week`。
1. **保存**评估器配置。

该字段下方的提示文本显示当前值是组织默认值还是自定义限制。要将覆盖恢复为组织默认值，请单击“**重置为组织默认值**”。

没有`organization:manage`的会员可以看到限制，但无法更改。只读视图显示以下之一：- `Unlimited / week (organization default)`
- `$<amount> / week (organization default)`
- `$<amount> / week (custom limit)`

## 当达到限制时

当附加项目或数据集的每周支出达到其有效限制时：

- LangSmith 停止在该项目或数据集的新运行中运行评估器。
- 评估者表**支出状态**列显示**N 限制命中**，每周评估者支出限制监控小部件显示受影响的项目或数据集。
- 跳过的运行不会回填。一旦支出限额重置或限额为[manually increased](#override-the-default-for-an-attached-project-or-dataset)，评估将在新的运行中自动恢复。

## 配置模型定价

设置支出限制后，评估器只能在支持的模型（OpenAI、Anthropic 和 Gemini）上运行，并且模型需要配置定价。未配置定价的模型不能在评估器中使用。

在 [Model pricing](/langsmith/cost-tracking#create-a-new-or-modify-an-existing-model-price-entry) 下为评估者使用的模型配置定价。

## 故障排除

**创建评估器时出现问题**：设置限制后，评估器必须使用受支持的模型（OpenAI、Anthropic 或 Gemini），并在 [Model pricing](/langsmith/cost-tracking#create-a-new-or-modify-an-existing-model-price-entry) 中输入定价条目。**LangSmith 支出与我的 LLM 提供商发票不匹配**：LangSmith 根据 [Model pricing](/langsmith/cost-tracking#create-a-new-or-modify-an-existing-model-price-entry) 中配置的每个模型费率计算支出，而不是根据提供商的账单。如果您的提供商应用您未添加到 LangSmith 的折扣、定制合同或型号变体，则预计会出现差异。

## 相关资源

- [Manage evaluators](/langsmith/evaluators)
- [Set up LLM-as-a-judge online evaluators](/langsmith/online-evaluations-llm-as-judge)
- [Cost tracking](/langsmith/cost-tracking)
- [Model pricing](/langsmith/cost-tracking#create-a-new-or-modify-an-existing-model-price-entry)
- [Billing](/langsmith/billing)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluator-spend.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>