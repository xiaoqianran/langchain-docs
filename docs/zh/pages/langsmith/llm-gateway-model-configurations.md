<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Custom model configurations | https://docs.langchain.com/langsmith/llm-gateway-model-configurations -->

# 自定义模型配置

通过 LLM 网关调用保存的模型配置以到达自定义端点并在后备链中使用它们。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

[Model configurations](/langsmith/model-configurations) 是命名的、可重用的定义，将提供者和模型与凭证和设置配对。当您将模型 ID 设置为 `custom/<name>` 时，LLM 网关可以通过保存的配置路由请求。使用配置到达提供者前缀模型 ID 无法寻址的端点，例如自定义 OpenAI 兼容端点。

## 了解网关的用途

自带密钥网关调用通常针对具有提供商前缀 ID（例如 `openai/gpt-5.4-mini`）的模型。当型号 ID 为 `custom/<name>` 时，网关会从保存的配置中读取以下内容：

* **提供者和模型**：网关向上游发送配置的模型名称，替换请求正文中的 `custom/<name>` 值。
* **API 密钥秘密**：网关使用配置中指定的工作区秘密向提供者进行身份验证。
* **连接设置**：基本 URL、OpenAI 提供商 API（聊天完成或响应）以及提供商使用它们的 Vertex AI 项目和位置。网关忽略配置中保存的生成参数，例如温度、最高 P 和最大输出令牌。相反，请在每个 API 请求中传递这些内容。

工作区管理员在 **设置** > **模型配置** 下创建配置。步骤请参见[Create a configuration](/langsmith/model-configurations#create-a-configuration)。

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

网关在 API 密钥的工作区中按名称查找配置，包括 [organization-scoped configurations](/langsmith/model-configurations#organization-scoped-model-configurations)，将请求路由到配置的提供程序和端点，并在客户端使用的 [API format](/langsmith/llm-gateway-api-formats) 中返回响应。

保存的配置不会出现在`GET /v1/models`列表中，因此请直接与开发人员共享配置名称。

如果 [model access policy](/langsmith/llm-gateway-model-access-policies#allow-saved-model-configurations) 适用于请求，则策略必须允许保存的模型配置，否则网关将返回 `403` 响应。

## 在后备链中使用配置

[fallback chain](/langsmith/llm-gateway-fallbacks) 可以在两个地方使用保存的配置：* **作为主要模型**：选择配置作为链的主要模型。然后，对`custom/<name>`的请求将故障转移到链的备份模型。
* **作为后备候选**：添加配置作为备份模型之一。然后，对链的主要模型 ID 的请求可以故障转移到配置的端点。

要为 Playground 提示提供其自己的后备行为，请将提示的模型设置为 `custom/<name>` 并将一条链附加到该配置。步骤请参见[Set fallbacks for a prompt](/langsmith/llm-gateway-fallbacks#set-fallbacks-for-a-prompt)。

## 另请参阅

* [Manage model configurations](/langsmith/model-configurations)：创建、编辑、删除配置；配置 OAuth 客户端凭据；管理组织范围的配置。
* [Model fallbacks](/langsmith/llm-gateway-fallbacks)：针对备份模型和配置重试失败的请求。
* [API formats](/langsmith/llm-gateway-api-formats)：支持的请求和响应格式、模型ID语法和翻译行为。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-model-configurations.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。