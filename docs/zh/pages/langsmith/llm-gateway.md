<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LLM Gateway | https://docs.langchain.com/langsmith/llm-gateway -->

# 法学硕士网关

使用一个 LangSmith API 密钥访问跨提供商的模型，同时跟踪调用并执行支出和数据保护策略。

使用一个[LangSmith API key](/langsmith/create-account-api-key)跨配置的提供者调用模型。通过更改模型 ID 来切换提供商，而 LLM 网关则跟踪每个调用并应用集中式治理策略。

<Note>
  **测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。

  该网关也可在 [BYOC](/langsmith/byoc) 上使用，它在数据平面内运行。将请求发送到 `/gateway` 路径前缀后面的 [data plane endpoint](/langsmith/byoc-usage#find-your-data-plane-endpoint)，并使用作用域为该数据平面中工作区的 API 密钥进行身份验证。欲了解更多信息，请参阅[Use a BYOC data plane](/langsmith/llm-gateway-api-formats#use-a-byoc-data-plane)。
</Note>

<Note>
  **自托管可用性：** LLM Gateway 不包含在 LangSmith v0.16.0 自托管稳定版本中。它将在未来的稳定版本中提供。要表达兴趣，请提交[LLM Gateway self-hosted access request](https://www.langchain.com/langsmith-llm-gateway-self-hosted-access-request)。您还可以在稳定版本发布之前尝试 v17 RC 版本或 BYOC（自带云）上的 LLM Gateway。
</Note>

## 提出你的第一个请求

<Info>
  管理员必须为您的工作区[enable the gateway, add a provider secret, and grant access](/langsmith/llm-gateway-admin-setup) 一次。设置后，开发人员只需要一个工作区范围的LangSmith API 密钥。
</Info>设置您的密钥并发出标准聊天完成请求。此示例假设工作区有一个 Anthropic 提供者机密：

<CodeGroup>
  ```bash Cloud theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  export LANGSMITH_API_KEY="lsv2_..._....cbed3e"

  curl https://gateway.smith.langchain.com/v1/chat/completions \
      -H "Authorization: Bearer $LANGSMITH_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"model":"anthropic/claude-sonnet-4-6","messages":[{"role":"user","content":"Hello!"}]}'
  ```

  ```bash BYOC theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  export LANGSMITH_API_KEY="lsv2_..._....cbed3e"

  curl https://<data_plane_host>/gateway/v1/chat/completions \
      -H "Authorization: Bearer $LANGSMITH_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"model":"anthropic/claude-sonnet-4-6","messages":[{"role":"user","content":"Hello!"}]}'
  ```
</CodeGroup>

`200` 响应确认网关、您的 LangSmith API 密钥、权限和所选提供商机密已正确配置。对于 Python、TypeScript、替代 API 格式和故障排除，请遵循 [quickstart](/langsmith/llm-gateway-quickstart)。

## 网关提供什么

* **一键，多个提供程序：** 开发人员使用 LangSmith API 密钥进行身份验证，而不是在本地存储提供程序密钥。
* **一种请求格式，多种模型：** 将聊天完成、消息或响应与跨配置的提供程序的模型一起使用。
* **内置可观察性：** 每个网关调用都显示为 [LangSmith trace](/langsmith/llm-gateway-access)。
* **中央治理：** 应用 [spend limits](/langsmith/llm-gateway-spend-policies)、[rate limits](/langsmith/llm-gateway-rate-limit-policies) 和 [data-protection policies](/langsmith/llm-gateway-data-protection)。

## 使用标准API

选择您的应用程序已使用的请求格式。该格式不限制您可以调用哪个已配置的提供商。

| API格式 |端点|
| ----------------------- | ------------------------ | |
| OpenAI 聊天完成 | `POST /v1/chat/completions` |
| Anthropic 留言 | `POST /v1/messages` |
| OpenAI 回应 | `POST /v1/responses` |将 `model` 设置为提供者前缀的自带密钥 ID，例如 `openai/gpt-5.4-mini` 或 `anthropic/claude-opus-5`，或使用 [Gateway Credits](/langsmith/llm-gateway-credits) 模型段，例如 `moonshotai/kimi-k3`。型号ID决定上游路由。当所选提供商使用不同的本机格式时，网关会转换请求和响应。

在 BYOC 上，相同的路径位于 `/gateway` 前缀后面，例如 `POST /gateway/v1/chat/completions`。

有关基本 URL、示例、转换行为、区域端点和 BYOC 数据平面端点，请参阅 [API formats](/langsmith/llm-gateway-api-formats)。

## 选择凭证的管理方式|选项|上游凭证|设置和计费|
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
|带上您自己的提供商帐户 |管理员将提供者密钥存储在工作区[Provider Secrets](/langsmith/llm-gateway-admin-setup#1-add-provider-secrets)中。 |提供商将使用费用记入您的提供商帐户。                                |
| [Gateway Credits](/langsmith/llm-gateway-credits) | LangChain 拥有上游凭证。                                                                                              |不需要提供商秘密。调用费用将计入您的 LangSmith 帐户。 |

## 走得更远

<CardGroup>
  <Card title="Quickstart" icon="rocket" href="/langsmith/llm-gateway-quickstart">
    使用 cURL、Python 或 TypeScript 发出请求，然后查看其跟踪。
  </Card>

  <Card title="Administrator setup" icon="settings" href="/langsmith/llm-gateway-admin-setup">
    启用网关、添加提供商凭据并授予开发人员访问权限。
  </Card>
</CardGroup>需要提供者本机请求和响应行为吗？使用[Direct model access](/langsmith/llm-gateway-direct-model-access)绕过标准化层。这是标准 API 的高级替代方案。

如有其他问题，请联系[LangChain support](https://support.langchain.com)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>