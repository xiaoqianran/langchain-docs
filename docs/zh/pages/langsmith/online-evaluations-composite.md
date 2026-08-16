<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up composite online evaluators | https://docs.langchain.com/langsmith/online-evaluations-composite -->

# 设置复合在线评估器

[Online evaluations](/langsmith/evaluation-concepts#online-evaluations) 提供有关您的生产的实时反馈[traces](/langsmith/observability-concepts#traces)。这对于持续监控应用程序的性能非常有用：识别问题、衡量改进并确保长期稳定的质量。

[**Composite evaluators**](/langsmith/composite-evaluators-ui) 是将多个评估者分数合并为单个 [score](/langsmith/evaluation-concepts#evaluator-outputs) 的方法。当您想要评估应用程序的多个方面并将结果合并为单个结果时，这非常有用。

<Note>当在线评估器在跟踪内的任何运行上运行时，跟踪将自动升级到[extended data retention](/langsmith/usage-and-billing#data-retention-auto-upgrades)。此升级将影响跟踪定价，但可确保保留符合您的评估标准的跟踪（通常是对分析最有价值的跟踪）以供调查。 </Note>

## 查看在线评估器

前往 **Tracing Projects** 选项卡并选择一个跟踪项目。要查看该项目的现有在线评估程序，请单击“**评估程序**”选项卡。

## 配置复合在线评估器

您可以在 [tracing project](/langsmith/observability-concepts#projects) 上为 [online evaluations](/langsmith/evaluation-concepts#online-evaluations) 创建复合赋值器。通过 UI 中的复合评估器，您可以计算多个评估器分数的加权平均值或加权总和，并具有可配置的权重。### 1. 导航到跟踪项目

要开始配置复合评估器，请导航到 **跟踪** 页面并选择一个跟踪项目。

从跟踪项目视图中，导航到 **Evaluators** 选项卡。单击 **+ 评估器** 打开 **添加评估器** 面板。单击“从头开始创建”下的“综合得分”。

### 2. 配置复合求值器

1. 指定您的评估员。
2. 选择聚合方法：**平均** 或 **求和**。
    - **平均**：Σ（体重*分数）/Σ（体重）。
    - **总和**：Σ（体重*分数）。
3. 添加您想要包含在综合乐谱中的反馈键。
4. 添加反馈键的权重。默认情况下，每个反馈键的权重是相等的。调整权重以增加或减少最终分数中特定反馈键的重要性。
5. 单击**创建**以保存评估器。

<Tip> 如果您需要调整综合分数的权重，可以在创建评估器后更新它们。对于配置了评估器的所有运行，所得分数将被更新。 </Tip>

### 3. 查看综合评估器结果综合分数作为**反馈**附加到运行中，类似于单个评估者的反馈。

**关于追踪项目**：
- 综合分数显示为跑步反馈。
- [Filter for runs](/langsmith/filter-traces-in-application) 具有综合分数，或综合分数满足特定阈值。
- [Create a chart](/langsmith/dashboards#custom-dashboards) 可视化综合分数随时间变化的趋势。

<Note> 如果运行时未配置任何组成评估器，则不会计算该运行的综合分数。 </Note>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/online-evaluations-composite.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>