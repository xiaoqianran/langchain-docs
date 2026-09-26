<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up decision model online evaluators | https://docs.langchain.com/langsmith/online-evaluations-decision-models -->

# 设置决策模型在线评估器

[Online evaluations](/langsmith/evaluation-concepts#online-evaluations) 提供您的生产轨迹的实时反馈。在线评估者可以使用决策模型（例如 SemIf 或 Jev）作为法官来代替 LLM。要使用法学硕士作为评判，请参阅[Set up LLM-as-a-judge online evaluators](/langsmith/online-evaluations-llm-as-judge)。

<Note>
当在线评估器在跟踪内的任何运行上运行时，LangSmith 会将跟踪升级到 [extended data retention](/langsmith/usage-and-billing#data-retention-auto-upgrades)。此升级会影响跟踪定价。
</Note>

## 决策模型

决策模型回答有关文本的结构化问题并返回键入的答案，例如概率、所选选项或分数，而不是自由格式的文本。有关它们的工作原理，请参阅[Decision models in the LLM Gateway](/langsmith/llm-gateway-decision-models)。当您使用决策模型作为判断时，LangSmith会在其自己的反馈键下记录您定义的每个问题的答案。您不需要编写输出模式或解析自由文本推理。

### 支持的型号

LangSmith 支持评估者在跟踪项目和数据集上的两种决策模型。两者的配置和行为方式相同。它们仅在提供者和设置方面有所不同。要通过其他提供商或您自己的服务器调用决策模型，请使用 [TypeSafe-compatible endpoint](/langsmith/typesafe-compatible-model)。|型号|供应商|设置|
|--------|----------|--------|
| [SemIf](/langsmith/llm-gateway-decision-models#semif) | **LangSmith网关** |无需提供商密钥。 SemIf 贯穿[LLM Gateway](/langsmith/llm-gateway)。 |
| [Jev](/langsmith/llm-gateway-decision-models#typesafe-jev) | **类型安全** |需要存储为工作区机密的 TypeSafe API 密钥。默认为`TYPESAFE_API_KEY`。 |

<Note>
SemIf 已为美国组织的 Free、Developer 和 Plus 计划启用。
</Note>

<Warning>
TypeSafe 不提供零数据保留。提供商可以保留发送给 Jev 进行评估的提示和输出。
</Warning>

<Note>
您只能在 LangSmith UI 中创建决策模型评估器。 LangSmith SDK 尚不支持创建它们。要直接从代码调用决策模型，请参阅[Decision models in the LLM Gateway](/langsmith/llm-gateway-decision-models)。
</Note>

### 问题类型

您添加到决策模型评估器的每个问题都具有三种类型之一。有关完整定义，请参阅[TypeSafe primitives documentation](https://docs.typesafe.ai/primitives)。- **Noul**：连续布尔值。返回某个陈述为真的概率（从 0 到 1）。接近 1 的值表示是，接近 0 的值表示否，接近 0.5 的值表示模型不确定。使用它进行是或否检查，例如输出是否包含个人身份信息。将说明表述为是或否问题，并可选择描述正确和错误的含义。
- **选择**：从固定的无序列表中选择一个选项，例如对用户是否询问 `question`、做出 `request` 或两者都不是 (`other`) 进行分类。为每个选项指定一个名称，并提供描述（除非该名称不言自明）。
- **分数**：按照有序级别对状态进行评分，例如用户的沮丧程度，从平静到非常愤怒。按顺序定义级别，从级别 0 开始。分数可以介于两个级别之间。

每个模型对问题都有自己的限制。 SemIf 评估器最多接受 32 个问题。

|限制|杰夫| SEM |
|--------|-----|--------|
|每个选择题的选项 | 2 至 255 | 2 至 16 |
|每个分数问题的级别 | 2 至 10 | 2 至 10 |

### 将答案映射到反馈键每个问题的名称都会成为评估的运行或线程的反馈键。 LangSmith 将每个输入的答案转换为反馈，如下所示：

|问题类型 |反馈栏 |价值|
|--------------|----------------|--------|
|努尔 | `score` | 0 到 1 之间的数字 |
|选择| `value` |所选选项的名称 |
|分数 | `score` |从 0 到最高级别索引的数字。例如，具有四个级别的问题返回从 0 到 3 的分数。

LangSmith 还将模型对每个反馈条目的完整答案存储在反馈源元数据中的 `typesafe` 下。对于选择题和分数题，答案包括`probabilities`和`confidence`。由于每个答案都是标准反馈，因此您可以对其进行筛选、绘制图表和发出警报，并从中触发 [automations](/langsmith/rules)，就像处理任何其他评估者的反馈一样。

问题名称遵循与其他反馈键相同的限制，并且每个名称在评估器中必须是唯一的。

## 添加决策模型在线评估器

要添加决策模型在线评估器：1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-online-evaluations-decision-models)中，导航至**追踪**页面，选择追踪项目。
1. 单击 **评估者** 选项卡。
1. 单击**+ 评估器** 打开**配置评估器** 面板。
1. 在 **从头开始创建** 下，选择 **LLM-as-a-Judge Evaluator**，然后为您的评估员命名。
1. 选择决策模型，将运行或线程变量映射到 **状态**，然后添加问题。对于每个设置，请参阅[How to define a decision model evaluator](/langsmith/decision-model-evaluator)。
1. （可选）应用[filter](/langsmith/online-evaluations-llm-as-judge#apply-a-filter-to-runs-that-trigger-the-evaluator)、设置[sampling rate](/langsmith/online-evaluations-llm-as-judge#configure-a-sampling-rate)或[apply the rule to past runs or threads](/langsmith/online-evaluations-llm-as-judge#apply-a-rule-to-past-runs-or-threads)。这些设置的工作方式与 LLM-as-a-judge 在线评估器的工作方式相同。
1. 要保存评估器，请单击 **创建** 或 **保存**。

评估器检查与其过滤器匹配的每个新运行或线程。每个问题的答案都显示在其自己的反馈键下。

## 另请参阅

- [How to define a decision model evaluator](/langsmith/decision-model-evaluator)：配置模型、状态和问题。
- [Connect to a TypeSafe-compatible model provider](/langsmith/typesafe-compatible-model)：基本 URL 格式和示例端点。
- [Decision models in the LLM Gateway](/langsmith/llm-gateway-decision-models)：直接从代码中调用 SemIf 和 Jev。

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/online-evaluations-decision-models.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>