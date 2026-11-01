<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: API formats | https://docs.langchain.com/langsmith/llm-gateway-api-formats -->

# API 格式

使用 OpenAI 聊天完成、Anthropic 消息或 OpenAI 响应请求通过 LLM 网关跨提供商调用模型。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

标准LLM网关API支持三种请求和响应格式。选择您的应用程序已使用的格式。然后通过同一端点使用您自己的提供商密钥或网关积分调用模型。

## 比较API格式

在美国地区的LangSmith云上，每种格式都使用以下基本 URL 和端点。对于其他区域、BYOC 数据平面和自托管安装，请参阅[Check availability](/langsmith/llm-gateway-how-it-works#check-availability)。

| API格式 |基本网址 |提示端点 |常见客户 |
| - | - | - | - |
| OpenAI 聊天完成 | `https://gateway.smith.langchain.com/v1` | `POST /chat/completions` | OpenAI SDK 和大多数 OpenAI 兼容工具 |
| Anthropic 留言 | `https://gateway.smith.langchain.com` | `POST /v1/messages` | Anthropic SDK、[Claude Code](/langsmith/llm-gateway-coding-agents) |
| OpenAI 回应 | `https://gateway.smith.langchain.com/v1` | `POST /responses` | OpenAI SDK、[Codex](/langsmith/llm-gateway-coding-agents) |

> [!提示]
>
> 所有格式均使用工作区范围的 LangSmith API 密钥进行身份验证。有关密钥类型、权限和每个客户端发送的标头，请参阅[Authenticate to the LLM Gateway](/langsmith/llm-gateway-authentication)。

## 了解翻译行为

端点决定您的应用程序发送和接收的格式。型号 ID 确定上游提供商。* 当提供商本身支持所选格式时，网关将保留该格式。
* 否则，网关将请求转换为提供商支持的格式，并将响应转换回来，包括流式响应。
* 翻译可以拒绝无法以目标提供者格式表示的字段。当需要提供者本机行为时使用[direct model access](/langsmith/llm-gateway-direct-model-access)。

无论格式如何，每个请求都会解析相同的提供者机密、策略和跟踪配置。

### 使用提示缓存

您请求提示缓存的方式取决于您发送的格式和您调用的模型：* **OpenAI型号**：OpenAI自动缓存提示。要控制缓存生命周期或断点，请使用OpenAI的缓存字段，例如`prompt_cache_options`或`prompt_cache_retention`。每个模型接受哪些字段和值由OpenAI 设置。详情请参阅[OpenAI prompt caching guide](https://developers.openai.com/api/docs/guides/prompt-caching)。
* **消息格式的Anthropic模型**：使用Anthropic的`cache_control`字段。详情请参阅[Anthropic prompt caching guide](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching)。
* **聊天完成或响应格式的Anthropic模型**：设置`prompt_cache_options`、`prompt_cache_retention`或`prompt_cache_key`中的任意一个。网关打开 Anthropic 提示缓存，并具有 Anthropic 的默认五分钟缓存生命周期。它不延续请求的生存期、保留期或断点模式。
* **消息格式的OpenAI模型**：网关丢弃`cache_control`字段。 OpenAI的自动缓存仍然适用。

## 发送请求

每种格式都有自己的请求形状。例如，聊天完成需要`messages`，响应需要`input`，消息需要`max_tokens`。将 `<MODEL_ID>` 替换为 [model ID](#choose-a-model-id)：

```bash Chat Completions theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/v1/chat/completions \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"<MODEL_ID>","messages":[{"role":"user","content":"Hello!"}]}'
```

```bash Messages theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/v1/messages \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"<MODEL_ID>","max_tokens":1024,"messages":[{"role":"user","content":"Hello!"}]}'
```

```bash Responses theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/v1/responses \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"<MODEL_ID>","input":"Hello!"}'
```

有关完整的请求和响应架构，请参阅 [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat)、[Anthropic Messages API](https://docs.anthropic.com/en/api/messages) 和 [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses)。> [!提示]
>
> 对于 Python 或 TypeScript 中的相同请求，打开 **LLM Gateway** 中的 **Simulator** 选项卡，选择格式和语言，然后单击复制图标。复制的代码已使用您的部署的网关 URL。详情请参阅[Send your first LLM Gateway request](/langsmith/llm-gateway-first-request)。

## 选择型号 ID

模型 ID 选择提供者和支付呼叫费用的凭证。模型 ID 在每种格式中的工作方式都相同：

* **您自己的提供商密钥**：`<provider>/<model>`，例如`openai/gpt-5.4-mini`或`azure/<deployment-name>`。网关使用存储在工作区中的[provider key](/langsmith/llm-gateway-provider-authentication)来调用提供商。
* **Gateway Credits**：托管模型 slug，例如 `moonshotai/kimi-k3`。 [Gateway Credits](/langsmith/llm-gateway-credits) 将 LangChain 托管模型记入您的 LangSmith 帐户，无需提供商密钥。
* **保存的模型配置**：`custom/<name>`。网关使用保存的 [model configuration](/langsmith/llm-gateway-model-configurations) 中的提供程序、模型和凭据。

### 列出型号

调用 `GET /v1/models` 列出您的工作区可以调用的模型 ID。网关返回单个OpenAI兼容列表：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/v1/models \
    -H "Authorization: Bearer $LANGSMITH_API_KEY"
```

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "object": "list",
  "data": [
    {"id": "openai/gpt-5.4-mini", "object": "model"},
    {"id": "fireworks/accounts/fireworks/models/glm-5p2", "object": "model"},
    {"id": "anthropic/claude-opus-5", "object": "model"},
    {"id": "moonshotai/kimi-k3", "object": "model"}
  ]
}
```

严格按照所示方式传递 ID。该列表忽略了没有配置提供程序密钥的提供程序以及您的 [model access policies](/langsmith/llm-gateway-model-access-policies) 阻止的模型。保存的模型配置不会出现在列表中。

## 读取响应元数据网关在其响应中添加一个 `X-LangSmith-Gateway-Metadata` 标头。标头是一个 JSON 对象，描述网关如何处理请求，例如它调用的提供程序和模型以及策略是否阻止该请求。它不包含凭据或提示和响应内容。

要区分网关决策与提供商错误，请读取两个字段：`outcome` 表示请求如何结束，例如 `success`、`blocked` 或 `upstream_error`，`error_source` 表示故障是否来自调用方 (`request`)、提供商 (`upstream`) 或网关（`internal`）。当 [fallback chain](/langsmith/llm-gateway-fallbacks#investigate-fallback-attempts) 运行时，标题还会列出每次尝试。

Python 中的 LangChain 聊天模型（`langchain-openai>=1.6.7` 或 `langchain-anthropic>=1.7.5`）将标头附加到模型的运行，因此在 [tracing](/langsmith/observability) 打开时，相同的详细信息会出现在运行的 **Gateway** 部分中。

## 修复请求错误

|状态或症状 |意义|
| - | - |
| `400 Bad Request` |请求格式错误、模型 ID 不可用或格式不正确，或者请求无法翻译。 |
| `429 Too Many Requests` |已达到网关[rate limit policy](/langsmith/llm-gateway-rate-limit-policies)或上游提供商速率限制。 |
| `GET /v1/models` | 中没有出现带有提供者前缀的模型提供者可能未配置或可能未返回模型目录。 |要判断网关或提供商是否返回错误，请读取 [response metadata](#read-response-metadata) 中的 `outcome` 和 `error_source` 字段。

> [!提示]
>
> 对于 `401` 和 `403` 错误，请参阅 [Fix authentication errors](/langsmith/llm-gateway-authentication#fix-authentication-errors)。对于 `424` 错误，请参阅 [Fix provider credential errors](/langsmith/llm-gateway-provider-authentication#fix-provider-credential-errors)。

## 另请参阅

* [Send your first LLM Gateway request](/langsmith/llm-gateway-first-request)：发出您的第一个请求并查看其跟踪。
* [How the gateway works](/langsmith/llm-gateway-how-it-works)：每个请求会发生什么，以及在每个区域和 BYOC 上使用哪个主机名。
* [Direct model access](/langsmith/llm-gateway-direct-model-access)：绕过格式转换并使用提供商原生 API。
* [Model fallbacks](/langsmith/llm-gateway-fallbacks)：针对备份模型重试请求。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-api-formats.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。