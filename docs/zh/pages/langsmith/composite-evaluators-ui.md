<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to create a composite evaluator | https://docs.langchain.com/langsmith/composite-evaluators-ui -->

# 如何创建复合评估器

_综合评估器_是将多个评估器分数组合成单个[score](/langsmith/evaluation-concepts#evaluator-outputs)的方法。当您想要评估应用程序的多个方面并将结果合并为单个结果时，这非常有用。

本指南向您展示如何使用 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-composite-evaluators-ui) 定义 [composite evaluator](/langsmith/evaluation-concepts#llm-as-judge)。

<Note>
要使用 SDK 以编程方式创建复合评估器，请参阅[How to create a composite evaluator (SDK)](/langsmith/composite-evaluators-sdk)。
</Note>

## 创建一个复合评估器

您可以在[tracing project](/langsmith/observability-concepts#projects)（对于[online evaluations](/langsmith/evaluation-concepts#online-evaluations)）或[dataset](/langsmith/evaluation-concepts#datasets)（对于[offline evaluations](/langsmith/evaluation-concepts#offline-evaluations)）创建复合赋值器。通过 UI 中的复合评估器，您可以计算多个评估器分数的加权平均值或加权总和，并具有可配置的权重。

<div style={{ textAlign: 'center' }}>
<img
    className="block dark:hidden"
    src="/langsmith/images/create_composite_evaluator-light.png"
    alt="LangSmith UI showing an LLM call trace called ChatOpenAI with a system and human input followed by an AI Output."
/>

<img
    className="hidden dark:block"
    src="/langsmith/images/create_composite_evaluator-dark.png"
    alt="LangSmith UI showing an LLM call trace called ChatOpenAI with a system and human input followed by an AI Output."
/>
</div>


### 1. 导航到跟踪项目或数据集

要开始配置复合评估器，请导航到 **跟踪项目** 或 **数据集和实验** 选项卡，然后选择一个项目或数据集。
- 从跟踪项目中：**+ 新建** > **评估器** > **综合分数**
- 从数据集中：**+ 评估器** > **综合得分**

### 2. 配置复合求值器1. 指定您的评估员。
2. 选择聚合方法：**平均** 或 **求和**。
    - **平均**：Σ（体重*分数）/Σ（体重）。
    - **总和**：Σ（体重*分数）。
3. 添加您想要包含在综合乐谱中的反馈键。
4. 添加反馈键的权重。默认情况下，每个反馈键的权重是相等的。调整权重以增加或减少最终分数中特定反馈键的重要性。
5. 单击**创建**以保存评估器。

<Tip> 如果您需要调整综合分数的权重，可以在创建评估器后更新它们。对于配置了评估器的所有运行，所得分数将被更新。 </Tip>

### 3. 查看综合评估器结果
综合分数作为**反馈**附加到运行中，类似于单个评估者的反馈。如何查看它们取决于评估的运行位置：

**关于追踪项目**：
- 综合分数显示为跑步反馈。
- [Filter for runs](/langsmith/filter-traces-in-application) 具有综合分数，或综合分数满足特定阈值。
- [Create a chart](/langsmith/dashboards#custom-dashboards) 可视化综合分数随时间变化的趋势。**在数据集上**：
- 在实验选项卡中查看综合分数。您还可以根据实验运行的平均综合得分对实验进行过滤和排序。
- 单击进入实验以查看每次运行的综合得分。

<Note> 如果运行时未配置任何组成评估器，则不会计算该运行的综合分数。 </Note>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/composite-evaluators-ui.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>