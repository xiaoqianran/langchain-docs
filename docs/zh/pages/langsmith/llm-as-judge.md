<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to define an LLM-as-a-judge evaluator | https://docs.langchain.com/langsmith/llm-as-judge -->

# 如何定义LLM法官评估员

评估法学硕士申请可能具有挑战性，因为它们通常会生成没有单一正确答案的对话文本。

本指南向您展示如何使用 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-llm-as-judge) 为 [offline evaluation](/langsmith/evaluation-concepts#offline-evaluations) 定义 [LLM-as-a-judge evaluator](/langsmith/evaluation-concepts#llm-as-judge)。

> [!注意]
>
> 本指南使用 LangSmith UI。您还可以使用 SDK 以编程方式创建一个 LLM 作为法官评估器，它显示在 LangSmith UI 中，与按照本指南创建的评估器相同。参考[Manage evaluators with the SDK](/langsmith/manage-evaluators-sdk)。
>
> 要对生产轨迹进行实时评估，请参阅[setting up online evaluations](/langsmith/online-evaluations-llm-as-judge)。

> [!提示]
>
> 如果您的数据集示例是使用 [assertions written in an annotation queue](/langsmith/assertions) 构建的，LLM 作为法官评估者可以读取 `example.outputs["assertions"]` 并根据您应用程序的输出对每个数据集进行评分。

## 步骤 1. 创建评估器

1. 在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-llm-as-judge) 中，从 [Evaluators](/langsmith/evaluators) 页面或数据集或跟踪项目中的 **Evaluators** 选项卡单击 **+ Evaluator**。
2. 在 **添加评估者** 面板中，选择 **从头开始创建** 下的 **LLM-as-a-Judge Evaluator**。或者，选择 **从模板创建** 以从现成的评估器开始并对其进行编辑。

### 评估器模板评估器模板是设置评估时的有用起点。在“添加评估程序”面板中选择“从模板创建”，以浏览按类别（例如安全性、安全性和质量）组织的模板。

您可以配置 LLM-as-a-Judge 评估器：

*来自[Evaluators](/langsmith/evaluators)页面
* 作为[automatically run evaluations on experiments](/langsmith/bind-evaluator-to-dataset)数据集的一部分
* 运行[online evaluation](/langsmith/online-evaluations-llm-as-judge)时

### 定制您的 LLM 法官评估器

为您的 LLM-as-a-judge 评估器提示添加具体说明，并配置输入/输出/参考输出的哪些部分应传递给评估器。

## 步骤 2. 配置评估器

### 提示

为您的评估者创建内联自定义提示。

### 型号

从提供的选项中选择所需的型号。

使用决策模型作为判断，参见[How to define a decision model evaluator](/langsmith/decision-model-evaluator)。

#### 使用 OpenAI 弹性服务层

[OpenAI's flex service tier](https://developers.openai.com/api/docs/guides/flex-processing) 以较低的成本运行模型调用，以换取较慢的响应。将其用于分数可以在几分钟后到达的评估器，例如在线评估器和绑定到数据集的评估器。弹性层适用于 OpenAI GPT-5 和 GPT-6 型号、`o3` 和 `o4-mini`。要使用它，请单击 **Prompt & Model** 下的模型名称以打开 **Model Configuration** 对话框，然后将 **Service Tier** 设置为 **Flex**。新的 OpenAI 评估器从 **auto** 层开始，该层使用您的 API 密钥所属的 OpenAI 项目的默认层。 **Flex** 选项仅针对支持 Flex 的型号出现。

Flex 呼叫的工作方式与标准呼叫不同：

* **等待时间更长**：LangSmith 每次 Flex 调用最多等待 10 分钟才能返回分数。
* **一次尝试**：LangSmith 不会重试超时的 Flex 调用，因此您不必为缓慢的响应付出两次代价。超时调用中的每次运行都会收到错误而不是分数。
* **时间限制**：每次LangSmith将评估器应用于一批运行时，都有固定的时间限制。当时间快用完时，LangSmith 会跳过剩余的 Flex 调用并保留其已有的分数。跳过的调用会返回错误 `Skipped: this rule run used up its time on slower OpenAI flex calls`。
* **测试运行**：当您单击 **测试** 时，LangSmith 会等待最多 4 分钟。缓慢的 Flex 调用可能会在测试中超时，但在保存评估器后仍然会成功。当 [Model pricing](/langsmith/cost-tracking#create-a-new-or-modify-an-existing-model-price-entry) 中的模型条目包含弹性费率时，[Evaluator spend limits](/langsmith/evaluator-spend) 按弹性费率计算弹性呼叫。没有弹性费率的自定义价格条目会按标准费率计算弹性呼叫。

### 映射变量

使用变量映射来指示从运行或示例传递到评估器提示符的变量。为了帮助进行变量映射，提供了一个示例（或运行）以供参考。单击提示中的变量，然后使用下拉列表将它们映射到输入、输出或参考输出的相关部分。

要添加提示变量，如果使用小胡子格式（默认），请键入带有双大括号 `{{prompt_var}}` 的变量；如果使用 f 字符串格式，请键入带有单大括号 `{prompt_var}` 的变量。

您可以根据需要删除变量。例如，如果您正在评估简洁性等指标，通常不需要参考输出，因此您可以删除该变量。

### 预览

预览提示将使用右侧显示的参考运行和数据集示例向您展示格式化提示的外观。

### 通过少量示例改进您的评估器为了更好地将 LLM 作为法官的评估者与人类偏好保持一致，LangSmith 允许您收集评估者分数的 [human corrections](/langsmith/create-few-shot-evaluators#make-corrections)。启用此选择后，更正将作为少数示例自动插入到提示中。

学习[how to set up few-shot examples and make corrections](/langsmith/create-few-shot-evaluators)。

### 反馈配置

反馈配置是您的法学硕士评审评估员将使用的评分标准。将此视为评估员评分的标准。分数将作为 [feedback](/langsmith/observability-concepts#feedback) 添加到运行或示例中。为评估者定义反馈：

1. **命名反馈键**：这是查看评估结果时将出现的名称。实验中的名称应该是唯一的。

2. **添加描述**：描述反馈代表什么。

3. **选择反馈类型**：

   * **布尔值**：真/假反馈。
   * **分类**：从预定义的类别中选择。
   * **连续**：指定范围内的数值评分。

在幕后，反馈配置作为 [structured output](/oss/python/langchain/structured-output) 添加到 LLM-as-a-judge 提示中。输出模式中的每个顶级键将被视为单独的反馈。

## 步骤 3. 保存评估器

完成配置后，保存更改。

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-as-judge.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。