<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Model providers | https://docs.langchain.com/oss/openwiki/providers -->

# 模型提供者

OpenWiki 支持以下提供商：

|供应商|资质证书 |笔记|
| --- | --- | --- |
| `openai` | `OPENAI_API_KEY` |可选的 `OPENAI_BASE_URL` 用于公开响应 API 的 OpenAI 兼容网关 |
| `openai-chatgpt` | ChatGPT OAuth 令牌 |使用 ChatGPT 登录；使用量取决于 Plus/Pro/Team Codex 津贴 |
| `copilot` | GitHub CLI 会话或 `COPILOT_API_KEY` |可选`COPILOT_BASE_URL`。 CI 需要 OAuth 令牌，而不是经典的 PAT |
| `openrouter` | `OPENROUTER_API_KEY` |可选 `OPENWIKI_OPENROUTER_PROVIDER_ONLY` 允许名单 |
| `anthropic` | `ANTHROPIC_API_KEY` |可选`ANTHROPIC_BASE_URL`|
| `gemini` | `GEMINI_API_KEY` |谷歌人工智能工作室 |
| `gemini-enterprise` |谷歌 ADC + `GOOGLE_CLOUD_PROJECT` |可选`GOOGLE_CLOUD_LOCATION`（默认为`global`）|
| `bedrock` | AWS 凭证 + 区域 |显式基岩密钥或 AWS 开发工具包默认链 |
| `baseten` | `BASETEN_API_KEY` |可选`BASETEN_BASE_URL`|
| `fireworks` | `FIREWORKS_API_KEY` |可选`FIREWORKS_BASE_URL` |
| `nebius` | `NEBIUS_API_KEY` | Nebius 代币工厂 |
| `nvidia` | `NVIDIA_API_KEY` |可选`NVIDIA_BASE_URL` |
| `openai-compatible` | `OPENAI_COMPATIBLE_API_KEY` |需要 `OPENAI_COMPATIBLE_BASE_URL` 和自定义型号 ID |

凭证和默认值存储在`~/.openwiki/.env`中。进程环境值优先于文件值。

您可以使用以下方式设置活动提供者和模型：

```bash
OPENWIKI_PROVIDER=openai
OPENWIKI_MODEL_ID=gpt-5.6-terra
```

### 提供者重试

在第一个提供商请求后覆盖重试：

```bash
OPENWIKI_PROVIDER_RETRY_ATTEMPTS=3
```该值必须是正整数。如果未设置，OpenWiki 默认重试 3 次。

### 输出令牌限制

`OPENWIKI_MAX_OUTPUT_TOKENS` 是每个请求输出预算的可选覆盖。设置后，它必须是正整数。 OpenWiki 将其映射到活动提供者的请求形状：

- **`maxOutputTokens`**：`gemini`
- **`maxTokens`**：`anthropic`、`openai`、`openai-compatible`、`openrouter`、`bedrock`、Gemini Enterprise 非 Google 表面、`openai-chatgpt` 和 `copilot`

取消设置时，OpenWiki 会保留每个提供商的 SDK 默认值，但这些内置上限除外：

- **Anthropic**：现代 Claude 4 和 5 模型默认为 `16384` 令牌，因为较旧的 LangChain 元数据否则会在 `4096` 处限制较新的 Claude 别名
- **基岩**：默认为`16000`代币。当模型支持较低上限时，使用 `OPENWIKI_BEDROCK_MAX_TOKENS` 覆盖

要对其中任一活动的提供程序设置一个限制，请设置：

```bash
OPENWIKI_MAX_OUTPUT_TOKENS=16384
```

默认情况下，OpenRouter 不发送 `max_tokens`，因此模型的完整广告输出上限和低余额的信用预检查预算可能会失败并出现 402 错误。在 OpenRouter 运行中，`OPENWIKI_OPENROUTER_MAX_TOKENS` 优先于 `OPENWIKI_MAX_OUTPUT_TOKENS`，您可以通过以下方式设置令牌限制：

```bash
OPENWIKI_OPENROUTER_MAX_TOKENS=8192
```使用限制意味着您可能会在长代上被截断，而不是 402 失败，因此更喜欢余额允许的最大值。

### 推理努力

`OPENWIKI_REASONING_EFFORT` 是用于宣传推理支持的模型的可选全局设置。

```bash
OPENWIKI_REASONING_EFFORT=high
```

将其保留为未设置以保留提供程序默认值。无效的提供者、模型或工作组合在发送请求之前失败。当活动提供程序和模型不支持继承值时，继承值也会失败。

|供应商|型号|支持的值 |请求映射 |
| --- | --- | --- | --- |
| `openai` | `gpt-5.6-terra`、`gpt-5.6-luna`、`gpt-5.6-sol` | `none`、`low`、`medium`、`high`、`xhigh`、`max` |响应 API `reasoning.effort` |
| `openai-chatgpt` | `gpt-5.6-terra`、`gpt-5.6-luna`、`gpt-5.6-sol` | `none`、`low`、`medium`、`high`、`xhigh`、`max` |响应 API `reasoning.effort` |
| `nvidia` | `nvidia/nemotron-3-super-120b-a12b` | `none`、`low`、`high` |聊天完成`reasoning_effort` |

所有其他提供程序和模型组合（包括 OpenRouter）不提供推理工作选择。

在交互式聊天中，使用 `/effort` 选择可用值或使用 `/effort default` 恢复提供程序默认值。

## GitHub 副驾驶

要使用 GitHub Copilot：1. 在`openwiki --init`期间选择 GitHub Copilot。如果您有活动的 GitHub CLI 会话，OpenWiki 可以重用它。否则，从凭据提示符处运行 `gh auth login`。
2. 选择型号（例如`gpt-5.5`）。

OpenWiki 将 GitHub CLI 令牌保留在 GitHub CLI 凭证存储中。它不会将该令牌复制到`~/.openwiki/.env`。对于没有 GitHub CLI 会话的 CI 或无头环境，请将 `COPILOT_API_KEY` 设置为 GitHub **OAuth 令牌**。个人访问令牌（经典或细粒度）被 Copilot API 拒绝用于第三方集成。

```bash
OPENWIKI_PROVIDER=copilot
OPENWIKI_MODEL_ID=gpt-5.5
```

## OpenAI（ChatGPT 登录）

`openai-chatgpt` 提供商使用您的 ChatGPT 订阅而不是计量的 API 密钥来调用 OpenAI 的 Codex 后端：

```bash
OPENWIKI_PROVIDER=openai-chatgpt openwiki code --init
```

该向导在浏览器中打开 OpenAI 身份验证页面（并打印 URL 以供无头使用）。登录后，OpenWiki 将托管的 OAuth 令牌存储在`~/.openwiki/.env` 中并自动刷新访问令牌。将刷新令牌视为密码。

## Gemini 企业代理平台

`gemini-enterprise` 提供商使用 Google 应用程序默认凭据。不需要 API 密钥：

```bash
OPENWIKI_PROVIDER=gemini-enterprise
GOOGLE_CLOUD_PROJECT=your-gcp-project
GOOGLE_CLOUD_LOCATION=global
```凭证需要 Gemini Enterprise Agent Platform 访问权限 (`roles/aiplatform.user`)，并且您使用的模型必须在 Model Garden 中启用。合作伙伴/开放权重 (MaaS) 模型是特定于区域的，因此在使用它们时明确设置 `GOOGLE_CLOUD_LOCATION`。

## AWS 基岩

```bash
OPENWIKI_PROVIDER=bedrock
BEDROCK_AWS_ACCESS_KEY_ID=your-access-key-id
BEDROCK_AWS_SECRET_ACCESS_KEY=your-secret-access-key
BEDROCK_AWS_REGION=us-east-1
OPENWIKI_MODEL_ID=anthropic.claude-sonnet-5
```

当未设置显式 Bedrock 凭证时，OpenWiki 使用 AWS SDK 默认凭证提供程序链。直接粘贴基岩模型 ID。一些较新的模型需要跨区域推理配置文件 ID（例如`us.anthropic.claude-sonnet-5`）而不是裸模型 ID。

当`OPENWIKI_MAX_OUTPUT_TOKENS`和`OPENWIKI_BEDROCK_MAX_TOKENS`均未设置时，基岩默认为`16000`代币输出上限。如果没有明确的限制，Converse API 会将输出限制为 `4096` 标记，并且可以截断长 wiki 页面。

对于基岩流空闲超时，设置 `OPENWIKI_STREAM_IDLE_TIMEOUT` 以毫秒为单位（从 `0` 到 `2147483647` 的整数）。设置`0`禁用看门狗。如果未设置，OpenWiki 将保留 `@langchain/aws` 提供程序默认值。

## OpenAI 兼容端点

将 `openai-compatible` 提供程序用于公开 OpenAI 兼容聊天完成的网关或本地服务器：

```bash
OPENWIKI_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_API_KEY=your-gateway-key
OPENAI_COMPATIBLE_BASE_URL=https://your-gateway.example.com/v1
OPENWIKI_MODEL_ID=your-gateway-model-name
```Ollama (`http://localhost:11434/v1`) 和 LM Studio (`http://localhost:1234/v1`) 等本地示例使用相同的模式。即使本地服务器忽略键值，OpenWiki 仍然需要`OPENAI_COMPATIBLE_API_KEY`。

即使您没有在终端中观看实时输出，OpenWiki 也会在内部发送非流请求。某些网关仅接受流请求，其中模型通过开放连接以块形式返回输出。当 OpenWiki 通过非流式请求访问这些网关之一时，该网关可能会拒绝该调用或返回带有空内容的 HTTP 200。没有错误的空白 wiki 通常意味着您需要启用流式传输。

当您的网关需要时，为 `openai-compatible` 提供商启用流式传输：

```bash
OPENWIKI_OPENAI_COMPATIBLE_STREAMING=true
```

默认情况下，流式传输处于关闭状态，因为该提供程序可以指向任意第三方端点，而在这些端点上，不能保证流式传输能够通过代理和负载均衡器工作。启用它还可以使客户端报告估计而不是服务器报告的令牌计数。

要选择将与 openai 兼容的提供商添加到 Responses API 而不是聊天完成中：

```bash
OPENWIKI_OPENAI_COMPATIBLE_USE_RESPONSES_API=true
```

## OpenRouter 提供商固定

当 OpenRouter 通过多个上游提供商提供模型服务时，限制路由：

```bash
OPENWIKI_PROVIDER=openrouter
OPENROUTER_API_KEY=your-key
OPENWIKI_OPENROUTER_PROVIDER_ONLY=Novita
```

## 另请参阅- [Quickstart](/oss/openwiki/quickstart)
- [CLI reference](/oss/openwiki/cli-reference)
- [Customize OpenWiki](/oss/openwiki/customize)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/openwiki/providers.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>