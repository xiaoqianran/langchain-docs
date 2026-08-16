<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to improve your evaluator with few-shot examples | https://docs.langchain.com/langsmith/create-few-shot-evaluators -->

# 如何通过少量示例改进评估器

当您无法以编程方式评估系统时，使用 LLM 作为法官评估器会非常有帮助。然而，它们的有效性取决于它们的质量以及它们与人类审阅者反馈的一致性程度。 LangSmith 提供了使用少量示例来提高 LLM 作为法官评估者与人类偏好的一致性的能力。

使用少量示例，人工更正会自动插入到评估器提示中。 Few-shot Examples 是一种受 [few-shot prompting](https://www.promptingguide.ai/techniques/fewshot) 启发的技术，它通过一些高质量的示例来指导模型输出。

本指南介绍了如何设置少量示例作为 LLM 法官评估程序的一部分，并对反馈分数进行更正。

## 少样本示例如何工作* 使用 `{{Few-shot examples}}` 变量将少量示例添加到评估器提示中。
* 使用少量样本创建评估器，将自动为您创建一个数据集，一旦您开始进行更正，该数据集将自动填充少量样本。
* 在运行时，这些示例将被插入到评估器中，作为其输出的指南。这将有助于评估者更好地符合人类偏好。

## 配置你的评估器

<Note>
目前，使用提示中心的 LLM-as-a-judge 评估器不支持少数样本示例，并且仅与使用胡子格式的提示兼容。

Few-shot 示例仅支持运行级别评估器，而不支持线程级别。在 [**Configure Evaluator** panel](/langsmith/evaluators#edit-an-evaluator) 中打开 **运行**。
</Note>

在启用少量示例之前，请设置您的 LLM 作为法官评估器。如果您尚未执行此操作，请按照[LLM-as-a-judge evaluator guide](/langsmith/llm-as-judge) 中的步骤操作。

### 1.配置变量映射每个小样本示例均根据配置中指定的变量映射进行格式化。少数镜头示例的变量映射应包含与主提示相同的变量，以及一个 `few_shot_explanation` 和一个 `score` 变量，它们应与您的反馈键具有相同的名称。

例如，如果您的主提示具有变量 `question` 和 `response`，并且您的评估器输出 `correctness` 分数，则您的几次提示应具有变量 `question`、`response`、`few_shot_explanation` 和 `correctness`。

### 2.指定要使用的小样本示例的数量

您还可以指定要使用的少数样本示例的数量。默认值为 5。如果您的示例很长，您可能需要将此数字设置得较低以节省标记，而如果您的示例往往很短，您可以设置一个较高的数字，以便为评估者提供更多示例以供学习。如果您的数据集中的示例数量超过此数量，我们将为您随机选择它们。

## 进行更正

<Info>
[Audit evaluator scores](/langsmith/audit-evaluator-scores)
</Info>当您开始记录跟踪或运行实验时，您可能会不同意评估者给出的某些分数。当您[make corrections to these scores](/langsmith/audit-evaluator-scores)时，您将开始看到校正数据集中填充的示例。当您进行更正时，请确保附加解释 - 这些解释将代替 `few_shot_explanation` 变量填充到您的评估器提示中。

少数样本示例的输入将是链/数据集的输入、输出和参考（如果这是离线评估器）的相关字段。输出将是更正的评估者分数以及您在留下更正时创建的解释。您可以根据自己的喜好随意编辑这些内容。以下是校正数据集中的几个样本的示例：

![Few-shot example](/langsmith/images/few-shot-example.png)

请注意，更正可能需要一两分钟才能填充到您的几次数据集中。一旦它们出现，您的评估器将来的运行将把它们包含在提示中！

## 查看您的修正数据集

为了查看您的更正数据集：

* **在线评估器**：选择您的运行规则并单击 **编辑规则**
* **离线评估者**：选择您的评估者并单击 **编辑评估者**

![Edit Evaluator](/langsmith/images/edit-evaluator.png)前往**使用少量示例提高评估器准确性**部分中链接的修正数据集。您可以查看和更新​​数据集中的少数样本示例。

![View few-shot dataset](/langsmith/images/view-few-shot-ds.png)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/create-few-shot-evaluators.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>