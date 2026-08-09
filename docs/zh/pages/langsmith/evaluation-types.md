<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Evaluation types | https://docs.langchain.com/langsmith/evaluation-types -->

# 评估类型

本页涵盖了 LangSmith 中评估的两个方面：

1. **[Evaluation types](#offline-evaluation-types)**：*何时以及为何*进行评估。用于部署前测试的离线评估类型（基准测试、单元测试、回归测试）和用于生产的在线评估类型（监控、异常检测）。
2. **[Evaluator implementations](#implement-evaluators)**：*如何*评估。可用的评估器方法（LLM-as-judge、代码、复合、摘要、成对）以及配置它们的位置（UI 或 SDK，离线或在线）。

了解这两个方面有助于您构建全面的评估策略，在部署之前验证功能并监控生产质量。

## 离线评估类型

离线评估在部署之前在精选数据集上测试应用程序。通过对具有参考输出的示例进行评估，团队可以在向用户公开更改之前比较版本、验证功能并建立信心。

使用 LangSmith SDK（[Python](https://reference.langchain.com/python/langsmith/observability/sdk/) 或 [TypeScript](https://reference.langchain.com/javascript/modules/langsmith.html)）在客户端运行离线评估，或通过 [Playground](/langsmith/prompt-engineering-concepts#playground) 或 [binding evaluators to a dataset](/langsmith/bind-evaluator-to-dataset) 在服务器端运行离线评估。

<img alt="Offline" />

### 基准测试*基准测试*在精选数据集上比较多个应用程序版本，以确定最佳执行者。此过程涉及创建代表性输入的数据集、定义性能指标以及测试每个版本。

基准测试需要使用黄金标准参考输出和精心设计的比较指标来管理数据集。示例：

* **RAG Q\&A 机器人**：问题和参考答案的数据集，由法学硕士作为法官评估员检查实际答案和参考答案之间的语义等效性。
* **ReAct 代理**：用户请求和参考工具调用的数据集，并使用启发式评估器验证所有预期的工具调用是否已进行。

### 单元测试

*单元测试*验证各个系统组件的正确性。在 LLM 上下文中，[unit tests are often rule-based assertions](https://hamel.dev/blog/posts/evals/#level-1-unit-tests) 用于验证基本功能的输入或输出（例如，验证 LLM 生成的代码编译、JSON 加载成功）。

单元测试通常期望一致的通过结果，这使得它们适合 CI 管道。在 CI 中运行时，配置缓存以最大限度地减少 LLM API 调用和相关成本。

欲了解更多详情，请参阅[Pytest](/langsmith/pytest)和[Vitest/Jest](/langsmith/vitest-jest)页面。

### 回归测试*回归测试*衡量应用程序版本随时间变化的性能一致性。它们确保新版本不会降低当前版本正确处理的情况下的性能，并理想地展示相对于基准的改进。这些测试通常在进行预计会影响用户体验的更新（例如模型或架构更改）时运行。

LangSmith 的比较视图突出显示了相对于基线的回归（红色）和改进（绿色），从而能够快速识别变化。

<img alt="Comparison view" />

### 回测

*回测*根据历史生产数据评估新的应用程序版本。生产日志被转换为数据集，然后较新的版本处理这些示例以评估过去的实际用户输入的性能。

这种方法通常用于评估新模型版本。例如，当新模型可用时，在最近的生产运行中对其进行测试，并将结果与​​实际生产结果进行比较。

### 成对评估*成对评估*通过确定相对质量而不是分配绝对分数来比较两个版本的输出。对于某些任务，[determining "version A is better than B"](https://www.oreilly.com/radar/what-we-learned-from-a-year-of-building-with-llms-part-i/)比独立评分每个版本更容易。

事实证明，这种方法对于法学硕士作为法官对主观任务的评估特别有用。例如，在总结时，确定“哪一个总结更清晰、更简洁？”通常比分配数字清晰度分数更简单。

学习[how run pairwise evaluations](/langsmith/evaluate-pairwise)。

## 在线评估类型

在线评估近乎实时地评估生产应用输出。在没有参考输出的情况下，这些评估侧重于检测问题、监控质量趋势以及识别为未来离线测试提供信息的边缘案例。

在线评估器通常在服务器端运行。 LangSmith 提供内置的[LLM-as-judge evaluators](/langsmith/llm-as-judge) 用于配置，并支持在 LangSmith 中运行的自定义代码评估器。

<img alt="Online" />

### 实时监控当用户与系统交互时，持续监控应用程序质量。在线评估会根据生产流量自动运行，为每次交互提供即时反馈。这样可以在质量下降、异常模式或意外行为影响大量用户群体之前对其进行检测。

### 异常检测

识别偏离预期模式的异常值和边缘情况。在线评估人员可以标记具有异常特征的运行（极长或极短的响应、意外的错误率或未通过安全检查的输出），以供人工审查和可能添加到离线数据集中。

### 生产反馈循环

利用生产中的见解来改进离线评估。在线评估揭示了可能不会出现在精选数据集中的现实问题和使用模式。失败的生产运行成为数据集示例的候选者，从而创建一个迭代周期，其中生产经验不断完善测试覆盖范围。

## 实施评估器

上面的评估类型描述了评估的*时间*。 LangSmith 提供了几种“如何”实现跨这些评估类型的评估器的方法。### 法学硕士法官

使用法学硕士根据提示中定义的标准对输出进行评分。这种方法对于语气、清晰度或语义正确性等难以用确定性规则捕获的主观品质非常有效。

常见用例包括根据参考输出（离线）评估事实准确性或检查生产响应中的毒性（在线）。例如，对 RAG 系统进行基准测试可能会使用 LLM 作为法官评估器来检查生成答案和参考答案之间的语义等价性。

配置 LLM 作为法官评估器：

* 程序化离线评估：[With the SDK](/langsmith/llm-as-judge-sdk)
* 数据集离线评估：[In the UI](/langsmith/llm-as-judge)
* 生产痕迹在线评估：[In the UI](/langsmith/online-evaluations-llm-as-judge)

### 代码评估器

编写确定性的、基于规则的函数来检查特定条件。这些评估器执行自定义逻辑来验证结构、检查模式或应用业务规则。

代码评估器对于单元测试特别有用 - 验证生成的代码编译、JSON 解析是否正确或是否存在必需的字段。在回归测试中，他们可以跟踪结构化输出的一致性。对于在线监控，他们实时捕获格式违规行为。定义代码评估器：

* 数据集离线评估：[In the UI](/langsmith/code-evaluator-ui)
* 程序化离线评估：[With the SDK](/langsmith/code-evaluator-sdk)
* 生产痕迹在线评估：[In the UI](/langsmith/online-evaluations-code)

### 综合评估器

使用加权平均值或总和将多个评估者分数合并为一个指标。这将创建同时反映多个评估标准的综合质量分数。

对于基准测试，综合分数有助于在多个维度上比较版本（例如，70% 准确性 + 20% 清晰度 + 10% 简洁性）。在在线监控中，它们为仪表板和警报提供单一指标。例如，通过有用性、正确性和语气分数的加权组合来跟踪聊天机器人的整体质量。

设置复合评估器：

* 使用预定义聚合的离线评估：[In the UI](/langsmith/composite-evaluators-ui)
* 使用自定义聚合逻辑进行离线评估：[With the SDK](/langsmith/composite-evaluators-sdk)
* 生产痕迹在线评估：[In the UI](/langsmith/online-evaluations-composite)

### 评估者总结

计算整个实验而不是单个示例的指标。这些评估器接收数据集的所有输出，并计算汇总统计数据，例如精度、召回率、F1 分数或分布分析。当您需要数据集级指标时，摘要评估器对于基准测试至关重要 - 比较各个版本的整体性能而不是逐个示例的分数。它们专门用于离线评估，因为它们需要处理完整的数据集。

实施总结评估器：

* 用于离线评估的自定义聚合函数：[With the SDK](/langsmith/summary)

### 成对评估器

比较两个版本的输出以确定相对质量。这种方法（之前在 [pairwise evaluation](#pairwise-evaluation) 中介绍过）在绝对评分困难但确定“哪个更好”很简单时会有所帮助。

运行成对评估：

* 比较现有实验：[With the SDK](/langsmith/evaluate-pairwise)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluation-types.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>