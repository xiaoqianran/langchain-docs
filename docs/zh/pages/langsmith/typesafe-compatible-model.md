<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect to a TypeSafe-compatible model provider | https://docs.langchain.com/langsmith/typesafe-compatible-model -->

# 连接到 TypeSafe 兼容的模型提供者

TypeSafe 兼容端点是保存的 [model configuration](/langsmith/model-configurations)。它将决策模型评估器的请求发送到任何实现[TypeSafe System One API](https://docs.typesafe.ai)的服务器。使用与 TypeSafe 兼容的端点，您可以通过其他提供程序（例如 OpenRouter）调用 TypeSafe 模型，或调用您自己托管的决策模型。对于实现OpenAI API的模型，请参阅[Connect to an OpenAI compliant model provider/proxy](/langsmith/custom-openai-compliant-model)。

[decision model evaluators](/langsmith/decision-model-evaluator) 中提供了与 TypeSafe 兼容的端点。要通过 LLM 网关直接从 TypeSafe 或 SemIf 使用 Jev，您不需要兼容的端点。

## 配置

TypeSafe 兼容端点具有三个设置：

- **型号**：服务器期望的型号 ID。默认为`jev-latest`。
- **API 密钥名称**：存储服务器 API 密钥的工作区密钥的名称。默认为`TYPESAFE_API_KEY`。
- **基本 URL**：服务器的 System One API 的根。参见[Base URL format](#base-url-format)。

## 在评估器中使用端点

仅当您将端点保存为模型配置后，评估器才能使用与 TypeSafe 兼容的端点。

要在评估器中使用 TypeSafe 兼容端点：1. 添加服务器的 API 密钥作为工作区密钥。转至 **设置 > 集成 > 提供者密钥**，单击 **+ 密钥**，然后选择 **自定义** 以输入您自己的密钥名称。要使用默认名称，请选择 **TypeSafe**。
1. 在评估器中的 **提示和模型** 下，打开 **模型配置**。
1. 对于 **Provider**，选择 **TypeSafe Compatible Endpoint**。它出现在**其他**下。
1. 输入**型号**、**API 密钥名称**和**基本 URL**。
1. 单击 **另存为预设** 并命名配置。
1. 选择保存的配置作为评估器的模型。

当评估器运行时，它会使用存储在您在 **API 密钥名称** 中输入的密钥中的 API 密钥来调用端点。接下来，添加问题并保存评估器，如[How to define a decision model evaluator](/langsmith/decision-model-evaluator)中所述。

## 基本 URL 格式

**基本 URL** 应指向服务器的 System One API 的根。 LangSmith 自动附加 `/v1/systemone`。不要将其包含在基本 URL 中。

### 基本 URL 示例

|供应商|型号|示例基本 URL |
|----------|------|------------------|
| [TypeSafe](https://docs.typesafe.ai) | `jev-latest` | `https://api.typesafe.ai` |
| [OpenRouter](https://openrouter.ai) | `~typesafe/jev-latest` | `https://openrouter.ai/api` |
|自托管（远程）|您的型号 ID | `https://my-model-server.example.com` |

## 另请参阅- [How to define a decision model evaluator](/langsmith/decision-model-evaluator)：设置使用决策模型的评估器。
- [Decision models in the LLM Gateway](/langsmith/llm-gateway-decision-models)：通过LLM网关直接调用SemIf和Jev。
- [Model configurations](/langsmith/model-configurations)：管理工作区保存的模型配置。

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/typesafe-compatible-model.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>