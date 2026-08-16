<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to define an LLM-as-a-judge evaluator | https://docs.langchain.com/langsmith/llm-as-judge -->

# 如何定义LLM法官评估员

评估法学硕士申请可能具有挑战性，因为它们通常会生成没有单一正确答案的对话文本。

本指南向您展示如何使用 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-llm-as-judge) 为 [offline evaluation](/langsmith/evaluation-concepts#offline-evaluations) 定义 [LLM-as-a-judge evaluator](/langsmith/evaluation-concepts#llm-as-judge)。

<Note>
本指南使用 LangSmith UI。您还可以使用 SDK 以编程方式创建一个 LLM 作为法官评估器，它显示在 LangSmith UI 中，与此处创建的评估器相同。参考[Manage evaluators with the SDK](/langsmith/manage-evaluators-sdk)。

要对生产轨迹进行实时评估，请参阅[setting up online evaluations](/langsmith/online-evaluations-llm-as-judge)。
</Note>

<Tip>
如果您的数据集示例是使用 [assertions written in an annotation queue](/langsmith/assertions) 构建的，LLM 作为法官评估者可以读取 `example.outputs["assertions"]` 并根据您应用程序的输出对每个数据集进行评分。
</Tip>

## 步骤 1. 创建评估器

1. 在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-llm-as-judge) 中，从 [Evaluators](/langsmith/evaluators) 页面或数据集或跟踪项目中的 **Evaluators** 选项卡单击 **+ Evaluator**。
1. 在 **添加评估者** 面板中，选择 **从头开始创建** 下的 **LLM-as-a-Judge Evaluator**。或者，选择 **从模板创建** 以从现成的评估器开始并对其进行编辑。

### 评估器模板评估器模板是设置评估时的有用起点。在“添加评估程序”面板中选择“从模板创建”，以浏览按类别（例如安全性、安全性和质量）组织的模板。

您可以配置 LLM-as-a-Judge 评估器：

- 来自[Evaluators](/langsmith/evaluators)页面
- 作为[automatically run evaluations on experiments](/langsmith/bind-evaluator-to-dataset)数据集的一部分
- 运行[online evaluation](/langsmith/online-evaluations-llm-as-judge)时

### 定制您的 LLM 法官评估器

为您的 LLM-as-a-judge 评估器提示添加具体说明，并配置输入/输出/参考输出的哪些部分应传递给评估器。

## 步骤 2. 配置评估器

### 提示

创建新提示，或从 [prompt hub](/langsmith/prompt-engineering-quickstart) 选择现有提示。

* **创建您自己的提示**：创建内联自定义提示。

* **从提示中心拉出提示**：使用 **选择提示** 下拉列表从现有提示中进行选择。您无法直接在提示编辑器中编辑这些提示，但可以查看提示及其使用的架构。要进行更改，请在 Playground 中编辑提示并提交版本，然后在评估器中引入新提示。

### 型号

从提供的选项中选择所需的型号。

### 映射变量使用变量映射来指示从运行或示例传递到评估器提示符的变量。为了帮助进行变量映射，提供了一个示例（或运行）以供参考。单击提示中的变量，然后使用下拉列表将它们映射到输入、输出或参考输出的相关部分。

要添加提示变量，如果使用小胡子格式（默认），请键入带有双大括号 `{{prompt_var}}` 的变量；如果使用 f 字符串格式，请键入带有单大括号 `{prompt_var}` 的变量。

您可以根据需要删除变量。例如，如果您正在评估简洁性等指标，通常不需要参考输出，因此您可以删除该变量。

### 预览

预览提示将向您展示使用右侧显示的参考运行和数据集示例的格式化提示的外观。

### 通过少量示例改进您的评估器

为了更好地使 LLM 作为法官评估者符合人类偏好，LangSmith 允许您收集评估者分数的 [human corrections](/langsmith/create-few-shot-evaluators#make-corrections)。启用此选择后，更正将作为少数示例自动插入到提示中。

学习[how to set up few-shot examples and make corrections](/langsmith/create-few-shot-evaluators)。

### 反馈配置反馈配置是您的法学硕士评审评估员将使用的评分标准。将此视为评估员评分的标准。分数将作为 [feedback](/langsmith/observability-concepts#feedback) 添加到运行或示例中。为评估者定义反馈：

1. **为反馈键命名**：这是查看评估结果时将出现的名称。实验中的名称应该是唯一的。

2. **添加描述**：描述反馈代表什么。

3. **选择反馈类型**：

   * **布尔值**：真/假反馈。
   * **分类**：从预定义的类别中选择。
   * **连续**：指定范围内的数值评分。

在幕后，反馈配置作为 [structured output](/oss/python/langchain/structured-output) 添加到 LLM-as-a-judge 提示中。如果您使用中心的现有提示，则必须先将输出架构添加到提示，然后再配置评估器以使用它。输出模式中的每个顶级键将被视为单独的反馈。

## 步骤 3. 保存评估器

完成配置后，保存更改。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-as-judge.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>