<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to define a decision model evaluator | https://docs.langchain.com/langsmith/decision-model-evaluator -->

# 如何定义决策模型评估器

设置一个LangSmith评估器，使用决策模型作为法官，每个问题都会返回键入的反馈。

决策模型评估器使用[decision model](/langsmith/online-evaluations-decision-models#decision-models)作为判断者。您定义的每个问题都会返回一个键入的答案，LangSmith 在其自己的反馈键下记录该答案。

本指南向您展示如何在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-decision-model-evaluator) 中定义决策模型评估器。您可以将其用于[automatically run evaluations on experiments](/langsmith/bind-evaluator-to-dataset)的数据集，或作为[online evaluator](/langsmith/online-evaluations-decision-models)用于跟踪项目。要使用法学硕士作为法官，请参阅[How to define an LLM-as-a-judge evaluator](/langsmith/llm-as-judge)。

> [!注意]
>
> 您只能在LangSmith UI 中创建决策模型评估器。 LangSmith SDK 尚不支持创建它们。

> [!注意]
>
> 决策模型评估者需要 LangSmith Plus 或 Enterprise 计划。

## 步骤 1. 创建评估器

决策模型评估员仅提供决策模型提供者，LLM 法官评估员仅提供 LLM 提供者。要在 LLM 法官和决策模型之间切换，请创建一个新的评估员。

创建决策模型评估器：

1. 为您的决策模型提供程序添加 API 密钥。在 LangSmith 中，转到 **设置 > 集成 > 提供商机密** 并单击 **+ 机密**：* 对于 OpenAI，选择 **OpenAI** 并粘贴您的 OpenAI API 密钥。 LangSmith 将其存储为工作空间秘密`OPENAI_API_KEY`。
   * 对于 TypeSafe，选择 **TypeSafe** 并粘贴您的 TypeSafe 帐户中的密钥。 LangSmith 将其存储为工作空间秘密`TYPESAFE_API_KEY`。

   要将密钥存储在不同的名称下，请选择 **自定义** 并输入您自己的秘密名称。欲了解更多信息，请参阅[Add provider secrets](/langsmith/llm-gateway-admin-setup#1-add-provider-secrets)。
2. 在 LangSmith UI 中，打开数据集或跟踪项目的 **Evaluators** 选项卡，然后单击 **+ Evaluator**。
3. 在 **配置评估器** 面板中，选择 **从头开始创建** 下的 **决策模型评估器**。
4. 指定您的评估员。

## 步骤 2. 配置评估器

决策模型评估器支持 OpenAI 和带有自带密钥 (BYOK) 的 TypeSafe 决策模型。您可以在评估器本身中定义状态和问题。决策模型评估器无法从 [Prompt Hub](/langsmith/prompt-context-hub#prompts) 加载提示或使用自定义输出模式。他们也不支持[few-shot examples](/langsmith/create-few-shot-evaluators)。要在另一个数据集或跟踪项目上重用决策模型评估器，请在 **配置评估器** 面板中选择 **附加现有评估器**。

### 型号

在 **提示和模型** 下，打开 **模型配置** 并选择提供商和模型：* 对于OpenAI，选择**OpenAI**作为提供者，然后选择决策模型。如果您将密钥存储在 `OPENAI_API_KEY` 以外的名称下，请在 **API 密钥名称** 中输入该名称。单击**应用**。
* 对于 TypeSafe，选择 **TypeSafe** 作为提供程序，然后选择 Jev 模型。如果您将密钥存储在`TYPESAFE_API_KEY`以外的名称下，请在 **API 密钥名称** 中输入该名称。单击**应用**。
* 对于 OpenAI-Decisions 兼容端点或 TypeSafe 兼容端点，选择其保存的配置。参见[Use a compatible endpoint](#use-a-compatible-endpoint)。

> [!提示]
>
> 如果跟踪对于 Jev 的上下文限制来说太大，请打开 Jev 模型配置并在 **额外标头** 下添加具有值 `true` 的 `TypeSafe-Danger-Zone-Long-Context` 标头。标头提高了每个请求的上下文限制。有关带和不带标头的限制，请参阅 TypeSafe 文档中的 [Long context](https://docs.typesafe.ai/models#long-context)。

支持的型号请参见[Supported models](/langsmith/online-evaluations-decision-models#supported-models)。

#### 使用兼容的端点

兼容端点将评估器指向实现[OpenAI Decisions API](https://developers.openai.com/api/docs/guides/decisions)或[TypeSafe System One API](https://docs.typesafe.ai)的任何服务器。示例包括 OpenRouter 或您自己托管的决策模型。仅当您将其保存为模型配置后，评估者才能使用它。有关设置、设置步骤和示例基本 URL，请参阅[Connect to a compatible decision model provider](/langsmith/compatible-decision-model-provider)。

＃＃＃ 状态**状态**是决策模型评估的上下文。将运行或示例中的变量映射到其中：

* 在数据集上映射输入、输出或参考输出。
* 在跟踪项目上，映射运行或线程变量，例如运行的输入和输出。

与 LLM 法官的提示不同，该州不应包含评分说明。相反，请将评分标准放入问题中。

决策模型仅评估文本。如果状态包含多模式内容（例如图像），则评估器运行失败。

### 问题

问题是决策模型评估者使用的评分标准。每个问题的名称都会成为评估的运行或线程的反馈键。定义问题：

1. 在 **反馈配置** 下，为您要评估的每个标准添加一个问题。
2. 对于每个问题，输入 **名称**，选择 **类型**，然后编写 **说明**。对于 OpenAI 模型和 OpenAI 决策兼容端点，是或否问题类型标记为 **Predicate**，对于 TypeSafe 模型和 TypeSafe 兼容端点标记为 **Noul**。
3. 定义问​​题类型的真假含义、选项或级别。

要将问题编辑为 JSON，请单击“**高级**”。有关每种问题类型返回的内容以及答案如何映射到反馈，请参阅 [Question types](/langsmith/online-evaluations-decision-models#question-types) 和 [Map answers to feedback keys](/langsmith/online-evaluations-decision-models#map-answers-to-feedback-keys)。

## 步骤 3. 保存评估器

要保存评估器，请单击 **创建** 或 **保存**。

在数据集上，评估器在每个新实验上运行。在跟踪项目上，它评估与其过滤器匹配的传入运行或线程。有关过滤器、采样率和回填的信息，请参阅[Set up decision model online evaluators](/langsmith/online-evaluations-decision-models)。

## 另请参阅

* [Decision models](/langsmith/online-evaluations-decision-models#decision-models)：支持的模型、题型、反馈键。
* [Connect to a compatible decision model provider](/langsmith/compatible-decision-model-provider)：基本 URL 格式和示例端点。
* [Decision models in the LLM Gateway](/langsmith/llm-gateway-decision-models)：从您自己的应用程序通过LLM网关调用决策模型。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/decision-model-evaluator.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。