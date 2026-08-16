<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Improve LLM-as-judge evaluators using human feedback | https://docs.langchain.com/langsmith/improve-judge-evaluator-feedback -->

# 利用人类反馈改进法学硕士法官评估员

<Check>
在浏览本页之前，阅读以下内容可能会有所帮助：

* [Evaluation concepts](/langsmith/evaluation-concepts#evaluators)
* [Creating LLM-as-a-judge evaluators](/langsmith/llm-as-judge)
</Check>

可靠的[_LLM-as-a-judge evaluators_](/langsmith/evaluation-concepts#llm-as-judge)对于做出有关人工智能应用程序的明智决策至关重要（例如提示、模型、架构更改）。正确定义评估器提示可能很困难，但它直接影响评估的可信度。

本指南介绍了如何使用人工反馈来调整作为法官的法学硕士评估人员，以提高评估人员的质量并帮助您构建可靠的人工智能应用程序。

## 它是如何工作的

LangSmith 的 **对齐评估器** 功能包含一系列步骤，可帮助您将 LLM 作为法官的评估器与人类专家的反馈保持一致。您可以使用此功能来调整在 [offline evaluations](/langsmith/evaluation-concepts#offline-evaluations) 或 [online evaluations](/langsmith/evaluation-concepts#online-evaluations) 数据集上运行的评估器。无论哪种情况，步骤都是相似的：1. **选择包含应用程序输出的实验或运行**。
2. 将选定的实验或运行添加到**注释队列**，人类专家可以在其中标记数据。
3. **根据标记示例测试您的 LLM 作为法官评估提示**。检查评估器结果与标记数据不一致的情况。这表明您的评估器提示需要改进的领域。
4. **细化并重复**以改善评估者的一致性。更新您的 LLM 法官评估提示并再次测试。

## 先决条件

在开始本 [offline evaluations](#offline-evaluations) 或 [online evaluations](#online-evaluations) 指南之前，您需要以下内容：

### 线下评价

- 一个[dataset](/langsmith/evaluation-concepts#datasets)，至少有一个[experiment](/langsmith/evaluation-concepts#experiment)。
- 您需要通过[SDK](/langsmith/manage-datasets-programmatically#create-a-dataset)或[UI](/langsmith/manage-datasets-in-application#create-a-dataset-and-add-examples)上传或创建数据集，并通过[SDK](/langsmith/evaluate-llm-application#run-the-evaluation)或[Playground](/langsmith/run-evaluation-from-playground)运行实验。

### 在线评价

- 已经向 LangSmith 发送跟踪的应用程序。
- 使用 [tracing integrations](/langsmith/observability-concepts) 之一配置此启动。

## 开始使用

您可以为数据集和跟踪项目中的新评估器和现有评估器输入对齐流程。|                                              |数据集评估器 |追踪项目评估员|
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ || **从头开始创建一个一致的评估器** | 1. **数据集和实验**并选择您的数据集<br></br>2。单击 **+评估器** > **从标记数据创建**<br></br>3。输入描述性反馈键名称（例如`correctness`、`hallucination`）| 1. **项目**并选择您的项目<br></br>2。单击 **+新建** > **评估器** > **从标记数据创建**<br></br>3。输入描述性反馈键名称（例如`correctness`、`hallucination`）|
| **调整现有评估器** | 1. **数据集和实验** > 选择您的数据集 > **评估器** 选项卡<br></br>2。在 **将评估器与实验数据对齐** 框中，单击 **选择实验** | 1. **项目** > 选择您的项目 > **评估者** 选项卡<br></br>2。在 **将评估器与实验数据对齐** 框中，单击 **选择实验** |

## 1. 选择实验或运行

选择一项或多项实验（或运行）以发送进行人工标记。这会将运行添加到[annotation queue](/langsmith/annotation-queues)。

![Add to evaluator queue](/langsmith/images/add-to-evaluator-queue.gif)

要将任何新实验/运行添加到现有注释队列，请转到 **Evaluators** 选项卡，选择您要对齐的评估器，然后单击 **Add to Queue。**<Check>
数据集应该代表您期望在生产中看到的输入和输出。

虽然您不需要涵盖所有可能的场景，但包含所有预期用例的示例非常重要。例如，如果您正在构建一个体育机器人来回答有关棒球、篮球和足球的问题，则您的数据集应至少包含每项运动的一个带标签的示例。
</Check>

## 2. 标签示例

通过添加反馈分数来标记注释队列中的示例。标记示例后，单击 **添加到参考数据集**。

<Check>
如果您的实验中有大量示例，则无需为每个示例添加标签即可开始。我们建议从至少 20 个示例开始，您可以随时添加更多示例。我们建议您标记的示例是多样化的（在 0 和 1 标签中保持平衡），以确保您构建一个全面的评估器提示。
</Check>

## 3. 根据标记的示例测试您的评估器提示

标记示例后，下一步就是迭代评估器提示，以尽可能模仿标记的数据。此迭代是在 **Evaluator Playground** 中完成的。要转到评估器游乐场：单击评估器队列右上角的 **查看评估器** 按钮。这将带您进入正在调整的评估器的详细信息页面。单击 **Evaluator Playground** 按钮访问 Playground。

![Evaluator Playground](/langsmith/images/evaluator-pg.gif)

在评估器游乐场中，您可以创建或编辑评估器提示，然后单击 **开始对齐** 以在您在步骤 2 中创建的一组带标签示例上运行它。运行评估器后，您将看到其生成的分数与人工标签的比较情况。对齐分数是评估者的判断与人类专家的判断相匹配的示例的百分比。

## 4. 重复以改进评估器对齐

通过更新提示并再次测试来进行迭代，以提高评估器的一致性。

<Check>
**默认情况下不保存对评估程序提示的更新**。我们建议定期保存您的评估器提示，尤其是在您看到对齐分数提高之后。

评估器游乐场将显示最近保存的评估器提示版本的对齐分数，以便在您迭代提示时进行比较。
</Check>提高评估器的对齐分数并不是一门精确的科学，但有一些策略有助于提高对齐分数。

### 提高评估者一致性的技巧

**1.调查未对齐的示例**

深入研究未对齐的示例并尝试将它们分组为常见的故障模式是改进评估器对齐的重要第一步。

一旦您确定了常见的故障模式，请在评估器提示中添加说明，以便法学硕士了解它们。例如，如果您注意到它不理解特定的缩写词，您可以解释“MFA 代表“多重身份验证”。或者，如果它对评估者上下文中的好/坏含义感到困惑，您可以告诉它“良好的响应将始终包含至少 3 家可供预订的潜在酒店”。

**2.检查 LLM 分数背后的推理**

要了解为什么 LLM 以这种方式对示例进行评分，您可以为 LLM 作为法官评估器启用推理。推理有助于理解法学硕士的思维过程，也可以帮助您识别常见的失败模式，并将其纳入您的评估提示中。为了在评估器游乐场中查看推理，请将鼠标悬停在 LLM 分数上。

![Enable reasoning](/langsmith/images/enable-reasoning.gif)

这将显示评估者游乐场中法学硕士分数背后的推理。

**3.添加更多标记示例并验证性能**

为了避免过度拟合带标签的示例，添加更多带标签的示例和测试性能非常重要，特别是如果您一开始只使用少量示例。

## 视频指南
<iframe
  className="w-full aspect-video rounded-xl"
  src="https://www.youtube.com/embed/-9o94oj4x0A?si=wfv9cN3L4DalMD2e"
  title="YouTube video player"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
></iframe>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/improve-judge-evaluator-feedback.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>