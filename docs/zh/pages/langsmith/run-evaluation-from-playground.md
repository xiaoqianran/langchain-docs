<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Run an evaluation from the Playground | https://docs.langchain.com/langsmith/run-evaluation-from-playground -->

# 从 Playground 运行评估

LangSmith 允许您直接在 UI 中运行评估。 [**Playground**](/langsmith/prompt-engineering-concepts#playground) 允许您通过一系列输入测试提示或模型配置，以查看它在不同上下文或场景中的得分情况，而无需编写任何代码。

在进行评估之前，您需要有一个[existing dataset](/langsmith/evaluation-concepts#datasets)。了解如何[create a dataset from the UI](/langsmith/manage-datasets-in-application#create-a-dataset-and-add-examples)。

要从 Studio 运行评估，请参阅 [run experiments over a dataset in Studio](/langsmith/observability-studio#run-experiments-over-a-dataset)。如果您更喜欢在代码中运行实验，请参阅[run an evaluation using the SDK](/langsmith/evaluate-llm-application)。

![Playground experiment](/langsmith/images/playground-experiment.gif)

<Callout type="info" icon="feather">
Playground 中提供 **[Chat](/langsmith/chat)**，可帮助您在运行评估之前优化提示。
</Callout>

## 在 Playground 中创建一个实验

1. **单击侧栏中的 Playground**。
2. **通过选择现有的已保存提示或创建新提示来添加提示**。
3. **从 **测试数据集** 下拉列表中选择一个数据集**

   * 请注意，数据集输入中的键必须与提示的输入变量相匹配。例如，在上面的视频中，所选数据集的输入带有键“blog”，它与提示的输入变量正确匹配。
   * Playground 中最多允许 15 个输入变量。4. **通过单击 **开始** 或 CMD+Enter 开始实验**。这将对数据集中的所有示例运行提示，并在数据集详细信息页面中为实验创建一个条目。我们建议在开始实验之前将提示提交到提示中心，以便稍后在检查实验时可以轻松引用。
5. **通过单击“**查看完整实验**”查看完整结果**。这将带您进入实验详细信息页面，您可以在其中查看实验结果。

实验运行时，实验表中的**进度**列和实验视图中的进度条会实时跟踪完成情况，包括已完成和评估的运行次数。有关更多信息，请参阅[Track experiment progress](/langsmith/analyze-an-experiment#track-experiment-progress)。

## 将评估分数添加到实验中

通过添加评估者，根据特定标准评估您的实验。使用 **+Evaluator** 按钮在 Playground 中添加 LLM-as-a-judge 或自定义代码评估器。

要了解有关通过 UI 添加评估器的更多信息，请访问 [how to define an LLM-as-a-judge evaluator](/langsmith/llm-as-judge)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/run-evaluation-from-playground.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>