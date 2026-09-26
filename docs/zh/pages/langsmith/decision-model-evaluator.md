<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to define a decision model evaluator | https://docs.langchain.com/langsmith/decision-model-evaluator -->

# 如何定义决策模型评估器

决策模型评估器使用[decision model](/langsmith/online-evaluations-decision-models#decision-models)，例如 SemIf 或 Jev，作为判断者。您定义的每个问题都会返回一个键入的答案，LangSmith 在其自己的反馈键下记录该答案。

本指南向您展示如何在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-decision-model-evaluator) 中定义决策模型评估器。您可以将其用于[automatically run evaluations on experiments](/langsmith/bind-evaluator-to-dataset)的数据集，或作为[online evaluator](/langsmith/online-evaluations-decision-models)用于跟踪项目。要使用法学硕士作为法官，请参阅[How to define an LLM-as-a-judge evaluator](/langsmith/llm-as-judge)。

<Note>
您只能在 LangSmith UI 中创建决策模型评估器。 LangSmith SDK 尚不支持创建它们。
</Note>

<Note>
SemIf 已为美国组织的 Free、Developer 和 Plus 计划启用。
</Note>

## 步骤 1. 创建评估器1.（仅限 Jev）添加 TypeSafe API 密钥。从您的 TypeSafe 帐户生成 API 密钥。在 LangSmith 中，转到 **设置 > 集成 > 提供商机密**，然后单击 **+ 机密**。选择 **TypeSafe** 作为提供程序并粘贴您的密钥。 LangSmith 将其存储为工作空间秘密`TYPESAFE_API_KEY`。要将其存储在不同的名称下，请选择 **自定义** 并输入您自己的秘密名称。有关更多信息，请参阅[Add provider secrets](/langsmith/llm-gateway-admin-setup#1-add-provider-secrets)。
1. 在 LangSmith UI 中，打开数据集或跟踪项目的 **Evaluators** 选项卡，然后单击 **+ Evaluator**。
1. 在 **配置评估程序** 面板中，选择 **从头开始创建** 下的 **LLM 作为法官评估程序**。
1. 指定您的评估员。

## 步骤 2. 配置评估器

决策模型评估器支持 TypeSafe 模型，例如带有自带密钥 (BYOK) 的 Jev 和通过 [LLM Gateway](/langsmith/llm-gateway) 的 SemIf。您可以在评估器本身中定义状态和问题。决策模型评估器无法从 [Prompt Hub](/langsmith/prompt-context-hub#prompts) 加载提示或使用自定义输出模式。他们也不支持[few-shot examples](/langsmith/create-few-shot-evaluators)。要在另一个数据集或跟踪项目上重用决策模型评估器，请在 **配置评估器** 面板中选择 **附加现有评估器**。

＃＃＃ 模型在 **提示和模型** 下，打开 **模型配置** 并选择提供商和模型：

- 对于 SemIf，选择 **LangSmith Gateway** 作为提供商，然后选择 SemIf 模型。单击**应用**。
- 对于 Jev，选择 **TypeSafe** 作为提供程序，然后选择 Jev 模型。如果您将密钥存储在`TYPESAFE_API_KEY`以外的名称下，请在 **API 密钥名称** 中输入该名称。单击**应用**。
- 对于 TypeSafe 兼容端点，选择其保存的配置。参见[Use a TypeSafe-compatible endpoint](#use-a-typesafe-compatible-endpoint)。

有关支持型号的比较，请参阅[Supported models](/langsmith/online-evaluations-decision-models#supported-models)。

#### 使用 TypeSafe 兼容端点

兼容 TypeSafe 的端点将评估器指向任何实现 [TypeSafe System One API](https://docs.typesafe.ai) 的服务器。示例包括 OpenRouter 或您自己托管的决策模型。仅当您将其保存为模型配置后，评估者才能使用它。有关设置、设置步骤和示例基本 URL，请参阅[Connect to a TypeSafe-compatible model provider](/langsmith/typesafe-compatible-model)。

### 状态

**状态**是决策模型评估的上下文。将运行或示例中的变量映射到其中：

- 在数据集上映射输入、输出或参考输出。
- 在跟踪项目中，映射运行或线程变量，例如运行的输入和输出。与 LLM 法官的提示不同，该州不应包含评分说明。相反，请将评分标准放入问题中。

### 问题

问题是决策模型评估者使用的评分标准。每个问题的名称都会成为评估的运行或线程的反馈键。定义问题：

1. 在 **反馈配置** 下，为您要评估的每个标准添加一个问题。
1. 对于每个问题，输入 **名称**，选择 **类型**，然后编写 **说明**。
1. 定义问​​题类型的真假含义、选项或级别。

要将问题编辑为 JSON，请单击“**高级**”。

有关每种问题类型返回的内容以及答案如何映射到反馈，请参阅 [Question types](/langsmith/online-evaluations-decision-models#question-types) 和 [Map answers to feedback keys](/langsmith/online-evaluations-decision-models#map-answers-to-feedback-keys)。

## 步骤 3. 保存评估器

要保存评估器，请单击 **创建** 或 **保存**。

在数据集上，评估器在每个新实验上运行。在跟踪项目上，它评估与其过滤器匹配的传入运行或线程。有关过滤器、采样率和回填的信息，请参阅[Set up decision model online evaluators](/langsmith/online-evaluations-decision-models)。

## 另请参阅

- [Decision models](/langsmith/online-evaluations-decision-models#decision-models)：支持的模型、问题类型和反馈键。
- [Connect to a TypeSafe-compatible model provider](/langsmith/typesafe-compatible-model)：基本 URL 格式和示例端点。
- [Decision models in the LLM Gateway](/langsmith/llm-gateway-decision-models)：直接从代码中调用 SemIf 和 Jev。

---<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/decision-model-evaluator.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>