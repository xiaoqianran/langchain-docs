<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect to a compatible decision model provider | https://docs.langchain.com/langsmith/compatible-decision-model-provider -->

# 连接到兼容的决策模型提供者

将 LangSmith 决策模型评估器指向任何实现 OpenAI Decisions API 或 TypeSafe System One API 的服务器，例如 OpenRouter 或自托管模型。

兼容端点是保存的[model configuration](/langsmith/model-configurations)，它将决策模型评估器的请求发送到您选择的服务器。使用兼容的端点，您可以通过其他提供程序（例如 OpenRouter）调用决策模型，或调用您自己托管的决策模型。 LangSmith支持两种：

* **OpenAI-决策兼容端点**：使用服务器服务的任何模型名称调用实现[OpenAI Decisions API](https://developers.openai.com/api/docs/guides/decisions)的任何服务器。
* **TypeSafe 兼容端点**：调用任何实现 [TypeSafe System One API](https://docs.typesafe.ai) 的服务器。

[decision model evaluators](/langsmith/decision-model-evaluator) 中提供了兼容的端点。要直接从 OpenAI 使用 `gpt-6-luna` 或直接从 TypeSafe 使用 Jev，您不需要兼容的端点。对于实现OpenAI API的聊天模型，请参阅[Connect to an OpenAI compliant model provider/proxy](/langsmith/custom-openai-compliant-model)。

## 配置

兼容端点具有三种设置：

* **型号**：服务器期望的型号 ID。
* **API 密钥名称**：存储服务器 API 密钥的工作区密钥的名称。
* **基本 URL**：服务器 API 的根。参见[Base URL format](#base-url-format)。默认值取决于端点的类型：

|设置| OpenAI-决策兼容端点 | TypeSafe 兼容端点 |
| - | - | - |
|型号| `gpt-6-luna` | `jev-latest` |
| API 密钥名称 | `OPENAI_API_KEY` | `TYPESAFE_API_KEY` |

## 在评估器中使用端点

仅当您将端点保存为模型配置后，评估器才能使用兼容端点。

要在评估器中使用兼容端点：

1. 添加服务器的 API 密钥作为工作区密钥。转至 **设置 > 集成 > 提供者密钥**，单击 **+ 密钥**，然后选择 **自定义** 以输入您自己的密钥名称。要使用默认名称，请选择 **OpenAI** 或 **TypeSafe**。
2. 在评估器中的 **提示和模型** 下，打开 **模型配置**。
3. 对于 **Provider**，选择 **OpenAI Decisions Compatible Endpoint** 或 **TypeSafe Compatible Endpoint**。两者都出现在**其他**下。
4. 输入**型号**、**API 密钥名称**和**基本 URL**。
5. 单击**另存为预设**并命名配置。
6. 选择保存的配置作为评估器的模型。当评估器运行时，它会使用存储在您在 **API 密钥名称** 中输入的密钥中的 API 密钥来调用端点。接下来，添加问题并保存评估器，如[How to define a decision model evaluator](/langsmith/decision-model-evaluator)中所述。

## 基本 URL 格式

**基本 URL** 应指向服务器 API 的根目录。 LangSmith 添加的路径取决于端点的类型。

### OpenAI-决策兼容端点

LangSmith 将 `/v1/decisions` 附加到基本 URL，因此请勿包含它。

|供应商|型号|示例基本 URL |
| - | - | - |
| [OpenAI](https://developers.openai.com/api/docs/guides/decisions) | `gpt-6-luna` | `https://api.openai.com` |
|自托管（远程）|您的型号 ID | `https://decisions.example.com` |

### TypeSafe 兼容端点

LangSmith 将 `/v1/systemone` 附加到基本 URL，因此请勿包含它。要完全按照输入的内容调用 URL（包括其路径），请清除 **Append /v1/systemone**。

|供应商|型号|示例基本 URL |
| - | - | - |
| [TypeSafe](https://docs.typesafe.ai) | `jev-latest` | `https://api.typesafe.ai` |
| [OpenRouter](https://openrouter.ai) | `~typesafe/jev-latest` | `https://openrouter.ai/api` |
|自托管（远程）|您的型号 ID | `https://my-model-server.example.com` |

## 另请参阅

* [How to define a decision model evaluator](/langsmith/decision-model-evaluator)：设置一个使用决策模型的评估器。
* [Decision models in the LLM Gateway](/langsmith/llm-gateway-decision-models)：从您自己的应用程序通过LLM网关调用决策模型。
* [Model configurations](/langsmith/model-configurations)：管理工作区保存的模型配置。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/compatible-decision-model-provider.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。