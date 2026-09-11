<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Model fallbacks | https://docs.langchain.com/langsmith/llm-gateway-fallbacks -->

# 模型回退

<Note>
**测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。
</Note>

当主模型返回配置错误（例如速率限制或提供程序中断）时，模型回退会针对一个或多个备份模型重试请求。在 LangSmith 中定义一次后备顺序，然后继续在应用程序中使用标准 LLM 网关端点和模型 ID。

## 它是如何工作的

后备链具有：

- **主要模型**：请求失败时触发链的提供者和模型。
- **一到五个后备**：直接提供者模型的有序列表或保存的[model configurations](/langsmith/model-configurations)。
- **触发器**：将请求移至下一个模型的上游 HTTP 状态代码。例如，使用 `429` 进行速率限制，或使用 `500`、`502`、`503` 和 `504` 进行提供商错误。

对于每个请求，网关：

1. 调用由请求的提供者前缀模型 ID 选择的主模型。
1. 如果请求因配置的触发状态或传输错误而失败，则加载匹配的后备链。
1. 按顺序调用每个回退，直到一个成功，返回不会触发另一个回退的状态，或者链耗尽。
1. 以客户端使用的API格式返回最终响应。后备模型可以使用与主要模型不同的提供程序和 API 格式。网关在 [supported API formats](/langsmith/llm-gateway-api-formats) 之间转换请求和响应，因此 Anthropic 主节点可以回退到 OpenAI 模型，而无需客户端更改。

每次尝试都会被跟踪并分别针对 [spend policies](/langsmith/llm-gateway-spend-policies) 进行计数。使用两个回退的请求会记录三个模型调用：主要尝试和两次回退尝试。

## 创建后备链

<Warning>
创建和管理后备链需要`organization:manage`权限。有关完整权限细分，请参阅[Access control](/langsmith/llm-gateway-access)。
</Warning>

创建后备链：1. 转到 **LLM Gateway** 并选择 **模型回退** 选项卡。
1. 单击**创建后备链**。
1. 选择链适用的**工作区**。
1. 选择主要提供商和型号。当主要尝试失败时，对此提供者前缀的模型 ID 的请求将使用该链。
1. 在 **后备** 下，按照网关应尝试的顺序添加一到五个备份模型。直接选择提供商和模型、选择现有模型配置或创建自定义模型配置。
1. 在 **配置回退触发器（高级）** 下，查看应触发下一个回退的 HTTP 状态代码。根据需要添加或删除状态代码。
1. 点击**创建链**。

提供者和模型可以在每个工作区中拥有一个后备链。要更改其行为，请编辑现有链。

## 拨打电话

使用主提供商前缀的模型 ID 调用标准 LLM 网关端点。您不需要特定于路由的 URL 或其他请求字段：

<CodeGroup>

```bash Cloud
curl https://gateway.smith.langchain.com/v1/chat/completions \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"anthropic/claude-sonnet-4-6","messages":[{"role":"user","content":"Hello!"}]}'
```

```bash BYOC
curl https://<data_plane_host>/gateway/v1/chat/completions \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"anthropic/claude-sonnet-4-6","messages":[{"role":"user","content":"Hello!"}]}'
```

</CodeGroup>

网关应用在 API 密钥工作区中为 `anthropic/claude-sonnet-4-6` 配置的后备链。如果没有链匹配，网关将返回主要模型的响应，而不尝试回退。## 选择后备候选人

您可以添加两种类型的后备候选项：

- **直接提供商模型**：选择支持的网关提供商和模型。此选项使用该提供程序的工作区密钥，或使用符合条件的托管模型的网关积分。
- **模型配置**：选择已保存的工作空间[model configuration](/langsmith/model-configurations)。将此选项用于自定义 OpenAI 兼容或 Anthropic 端点、自定义模型名称或特定于配置的参数。

模型配置是工作空间范围内的。后备链只能使用其选定工作区中的配置。

例如，将 `anthropic/claude-sonnet-4-6` 配置为主要模型，将 `openai/gpt-5.4-mini` 配置为第一个后备模型，并将保存的 OpenAI 兼容模型配置配置为第二个后备模型。应用程序继续请求`anthropic/claude-sonnet-4-6`；网关在需要时选择并转换后备调用。

## 另请参阅

- [API formats](/langsmith/llm-gateway-api-formats)：查看支持的请求格式和翻译行为。
- [Custom model providers](/langsmith/llm-gateway-custom-providers)：为自定义OpenAI或Anthropic兼容端点创建模型配置。
- [Spend policies](/langsmith/llm-gateway-spend-policies)：在后备路由的同时应用成本限制。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-fallbacks.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>