<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Custom model configurations | https://docs.langchain.com/langsmith/llm-gateway-model-configurations -->

# 自定义模型配置

通过 LLM 网关调用保存的模型配置以到达自定义端点并在后备链中使用它们。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

[Model configurations](/langsmith/model-configurations) 是命名的、可重用的定义，将提供者和模型与凭证和设置配对。当您将模型 ID 设置为 `custom/<name>` 时，LLM 网关可以通过保存的配置路由请求。使用配置到达提供者前缀模型 ID 无法寻址的端点，例如自定义 OpenAI 兼容端点。

## 了解网关的用途

自带密钥网关调用通常针对具有提供商前缀 ID（例如 `openai/gpt-5.4-mini`）的模型。当型号 ID 为 `custom/<name>` 时，网关会从保存的配置中读取以下内容：* **提供者和模型**：网关向上游发送配置的模型名称，替换请求正文中的 `custom/<name>` 值。
* **API 密钥秘密**：网关使用配置中指定的工作区秘密向提供者进行身份验证。
* **连接设置**：基本 URL、OpenAI 提供商 API（聊天完成或响应）、Vertex AI 项目和位置，以及提供商使用它们的 Amazon Bedrock 的 **首选 Bedrock 端点**。只有网关读取 Bedrock 端点设置。

网关忽略配置中保存的生成参数，例如温度、最高 P 和最大输出令牌。相反，请在每个 API 请求中传递这些内容。

工作区管理员在 **设置** > **模型配置** 下创建配置，组织管理员创建 [organization-scoped configurations](/langsmith/model-configurations#organization-scoped-model-configurations)。步骤请参见[Create a configuration](/langsmith/model-configurations#create-a-configuration)。

## 选择配置类型

网关可以调用这些提供程序的配置：

* **自定义端点**：OpenAI兼容、Anthropic兼容和[TypeSafe-compatible](/langsmith/compatible-decision-model-provider)端点。
* **内置提供商**：Anthropic、Amazon Bedrock、Fireworks、Gemini Enterprise Agent Platform、Google Gemini、OpenAI、TypeSafe 和 xAI。任何其他提供程序的配置都会返回错误。每个自定义端点类型对其 URL 的处理方式有所不同：

* **OpenAI兼容**：基本 URL 是 API 根。网关会附加请求路径，例如 `/chat/completions`，而不添加 `/v1`，因此如果服务器需要，请在基本 URL 中包含 `/v1`。
* **Anthropic兼容**：网关将请求完全按照输入的 URL 发送，因此请输入完整的消息端点，例如 `https://example.com/v1/messages`。仅支持消息请求。
* **TypeSafe 兼容**：除非您清除 **Append /v1/systemone**，否则网关会附加 `/v1/systemone`，在这种情况下，它将使用与输入完全相同的 URL。

## 通过网关调用配置

在任何标准网关请求中使用 `custom/<name>` 作为模型 ID，将 `<name>` 替换为配置的确切名称，如 **设置** > **模型配置** 中所示：

```bash Cloud theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/v1/responses \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"custom/my-openai-config","input":"Hello!"}'
```

```bash BYOC theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://<data_plane_host>/gateway/v1/responses \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"custom/my-openai-config","input":"Hello!"}'
```

网关在 API 密钥的工作区中按名称查找配置，包括 [organization-scoped configurations](/langsmith/model-configurations#organization-scoped-model-configurations)，将请求路由到配置的提供程序和端点，并在客户端使用的 [API format](/langsmith/llm-gateway-api-formats) 中返回响应。当工作区配置和组织范围的配置共享名称时，网关将使用工作区配置。网关不会检查 [Feature Access](/langsmith/model-configurations#feature-access) 表，因此可以调用组织范围的配置，而无需在工作区中启用它。它还会忽略保存在配置上的[OAuth client credentials](/langsmith/model-configurations#oauth-client-credentials)，并使用配置的 API 密钥进行身份验证。

保存的配置不会出现在`GET /v1/models`列表中，因此请直接与开发人员共享配置名称。

如果 [model access policy](/langsmith/llm-gateway-model-access-policies#allow-saved-model-configurations) 适用于请求，则策略必须允许保存的模型配置，否则网关将返回 `403` 响应。

保存的配置也可以是后备链中的主模型或备份模型。有关步骤，包括如何为 Playground 提示提供其自己的后备行为，请参阅 [Model fallbacks](/langsmith/llm-gateway-fallbacks)。

## 另请参阅

* [Manage model configurations](/langsmith/model-configurations)：创建、编辑、删除配置；配置 OAuth 客户端凭据；管理组织范围的配置。
* [Model fallbacks](/langsmith/llm-gateway-fallbacks)：针对备份模型和配置重试失败的请求。
* [API formats](/langsmith/llm-gateway-api-formats)：支持的请求和响应格式、模型ID语法和翻译行为。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-model-configurations.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。