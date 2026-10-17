<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Model providers | https://docs.langchain.com/oss/openwiki/providers -->

# 模型提供者

为 OpenWiki 配置推理提供程序和凭据

OpenWiki supports the following providers:

|供应商|资质证书 |笔记|
| - | - | - |
| `openai` | `OPENAI_API_KEY` |可选的 `OPENAI_BASE_URL` 用于公开响应 API 的 OpenAI 兼容网关 |
| `openai-chatgpt` | ChatGPT OAuth 令牌 |使用 ChatGPT 登录；使用量取决于 Plus/Pro/Team Codex 津贴 |
| `copilot` | GitHub CLI session or `COPILOT_API_KEY` |可选`COPILOT_BASE_URL`。 CI needs an OAuth token, not a classic PAT |
| `openrouter` | `OPENROUTER_API_KEY` |可选 `OPENWIKI_OPENROUTER_PROVIDER_ONLY` 允许名单 |
| `anthropic` | `ANTHROPIC_API_KEY` |可选`ANTHROPIC_BASE_URL` |
| `bob` | `BOB_API_KEY` |可选`BOB_BASE_URL`。固定型号 ID `premium`；没有模型选择器|
| `gemini` | `GEMINI_API_KEY` |谷歌人工智能工作室 |
| `gemini-enterprise` |谷歌 ADC + `GOOGLE_CLOUD_PROJECT` |可选`GOOGLE_CLOUD_LOCATION`（默认为`global`）|
| `bedrock` | AWS credentials + region |显式基岩密钥或 AWS 开发工具包默认链 |
| `baseten` | `BASETEN_API_KEY` |可选`BASETEN_BASE_URL` |
| `fireworks` | `FIREWORKS_API_KEY` |可选`FIREWORKS_BASE_URL`|
| `nebius` | `NEBIUS_API_KEY` | Nebius 代币工厂 |
| `nvidia` | `NVIDIA_API_KEY` |可选`NVIDIA_BASE_URL` |
| `openai-compatible` | `OPENAI_COMPATIBLE_API_KEY` |需要 `OPENAI_COMPATIBLE_BASE_URL` 和自定义型号 ID |

凭证和默认值存储在`~/.openwiki/.env`中。进程环境值优先于文件值。

您可以使用以下方式设置活动提供者和模型：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER=openai
OPENWIKI_MODEL_ID=gpt-5.6-terra
```### 提供者重试

Override retries after the first provider request:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER_RETRY_ATTEMPTS=3
```

该值必须是正整数。 If unset, OpenWiki defaults to 3 retries, or 5 when `OPENWIKI_PAGE_CONCURRENCY` is above `1`.

### 输出令牌限制

`OPENWIKI_MAX_OUTPUT_TOKENS` is an optional override for the per-request output budget.设置后，它必须是正整数。 OpenWiki maps it to the active provider's request shape:

* **`maxOutputTokens`**: `gemini`
* **`maxTokens`**: `anthropic`, `openai`, `openai-compatible`, `openrouter`, `bedrock`, Gemini Enterprise non-Google surfaces, `openai-chatgpt`, and `copilot`

When unset, OpenWiki preserves each provider's SDK default except for these built-in ceilings:

* **Anthropic**：现代 Claude 4 和 5 模型默认为 `16384` 令牌，因为较旧的 LangChain 元数据否则会在 `4096` 处限制较新的 Claude 别名
* **基岩**：默认为`16000`代币。 Override with `OPENWIKI_BEDROCK_MAX_TOKENS` when a model supports a lower ceiling

To set one limit across whichever of those providers is active, set:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_MAX_OUTPUT_TOKENS=16384
```

默认情况下，OpenRouter 不发送 `max_tokens`，因此模型的完整广告输出上限和低余额的信用预检查预算可能会失败并出现 402 错误。 `OPENWIKI_OPENROUTER_MAX_TOKENS` takes precedence over `OPENWIKI_MAX_OUTPUT_TOKENS` on OpenRouter runs, you can set token limits with:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_OPENROUTER_MAX_TOKENS=8192
```使用限制意味着您可能会在长代上被截断，而不是 402 失败，因此更喜欢余额允许的最大值。

### 推理努力

`OPENWIKI_REASONING_EFFORT` 是用于宣传推理支持的模型的可选全局设置。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_REASONING_EFFORT=high
```

将其保留为未设置以保留提供程序默认值。无效的提供者、模型或工作组合在发送请求之前失败。当活动提供程序和模型不支持继承值时，继承值也会失败。

|供应商|型号|支持的值 |请求映射 |
| - | - | - | - |
| `openai` | `gpt-5.6-terra`、`gpt-5.6-luna`、`gpt-5.6-sol` | `none`、`low`、`medium`、`high`、`xhigh`、`max` |响应 API `reasoning.effort` |
| `openai-chatgpt` | `gpt-5.6-terra`、`gpt-5.6-luna`、`gpt-5.6-sol` | `none`、`low`、`medium`、`high`、`xhigh`、`max` |响应 API `reasoning.effort` |
| `nvidia` | `nvidia/nemotron-3-super-120b-a12b` | `none`、`low`、`high` |聊天完成`reasoning_effort` |
| `gemini` | `gemini-3.6-flash` | `low`、`medium`、`high` |双子座思维水平|
| `openai-compatible` |任何型号 ID（启用后）| `none`、`low`、`medium`、`high`、`xhigh`、`max` |响应 API `reasoning.effort` 或聊天完成 `reasoning_effort` |

所有其他提供程序和模型组合（包括 OpenRouter）不提供推理工作选择。

对于 `openai-compatible`，推理工作将保持关闭，直到您选择加入：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_OPENAI_COMPATIBLE_REASONING_EFFORT_SUPPORTED=true
```When that flag is set, OpenWiki maps `OPENWIKI_REASONING_EFFORT` through the Responses API if `OPENWIKI_OPENAI_COMPATIBLE_USE_RESPONSES_API=true`, and through Chat Completions `reasoning_effort` otherwise.

In interactive chat, use `/effort` to choose an available value or `/effort default` to restore the provider default.

## IBM 鲍勃

IBM Bob is an API-key provider with a fixed model ID of `premium`, so OpenWiki skips the model picker:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER=bob
BOB_API_KEY=your-bob-api-key
```

Optional `BOB_BASE_URL` overrides the default inference endpoint (`https://api.us-east.bob.ibm.com/inference/v1`).该提供商的流媒体始终处于开启状态。

To run OpenWiki inside IBM Bob / Bob Shell instead of configuring Bob as the standalone provider, see [Coding-agent integrations](/oss/openwiki/integrations).

## GitHub 副驾驶

要使用 GitHub Copilot：

1. 在`openwiki --init`期间选择 GitHub Copilot。 If you have an active GitHub CLI session, OpenWiki can reuse it. Otherwise, run `gh auth login` from the credential prompt.
2. 选择型号（例如`gpt-5.5`）。

OpenWiki leaves the GitHub CLI token in the GitHub CLI credential store.它不会将该令牌复制到`~/.openwiki/.env`。 For CI or headless environments without a GitHub CLI session, set `COPILOT_API_KEY` to a GitHub **OAuth token**. Personal Access Tokens (classic or fine-grained) are rejected by the Copilot API for third-party integrations.

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER=copilot
OPENWIKI_MODEL_ID=gpt-5.5
```

## 微软 Entra 授权OpenWiki 支持 Microsoft Entra ID（以前称为 Azure Active Directory）作为 OpenAI 兼容端点的令牌提供程序，这些端点需要 Entra 承载令牌而不是静态 API 密钥。

<Note>
  Entra ID 身份验证需要 OpenWiki v0.7.0 或更高版本。
</Note>

要以交互方式配置 Entra 身份验证，请运行 `openwiki --init`，选择 **OpenAI 兼容**，然后选择 **Microsoft Entra ID**。输入 HTTPS API 根、网关接受的令牌范围以及模型 ID。 OpenWiki 保存这些设置以供以后 `--update` 运行。它不要求或存储访问令牌。

对于非交互式运行，请设置与环境变量相同的值：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_AUTH=entra-id
OPENAI_COMPATIBLE_BASE_URL=https://gateway.example.com/openai/v1
OPENAI_COMPATIBLE_ENTRA_SCOPE=api://gateway-application-id/.default
OPENWIKI_MODEL_ID=your-gateway-model
```

* **`OPENAI_COMPATIBLE_AUTH`**：设置为`entra-id`以启用 Entra 身份验证。默认为`api-key`。在 Entra 模式下，不需要`OPENAI_COMPATIBLE_API_KEY`。
* **`OPENAI_COMPATIBLE_BASE_URL`**：必须使用 HTTPS 并且不能包含嵌入式凭据。
* **`OPENAI_COMPATIBLE_ENTRA_SCOPE`**：可选。默认为 `https://cognitiveservices.azure.com/.default`，Azure OpenAI 范围。自定义网关可能需要不同的范围。

OpenWiki 通过[Azure Identity](https://learn.microsoft.com/en-us/javascript/api/overview/azure/identity-readme)获取令牌，并在过期前对其进行缓存和刷新。在运行 OpenWiki 的每个环境中单独配置 Azure Identity 凭据：* **工作负载身份联合**：设置 `AZURE_CLIENT_ID`、`AZURE_TENANT_ID` 和 `AZURE_FEDERATED_TOKEN_FILE`。当`AZURE_FEDERATED_TOKEN_FILE`设置时，OpenWiki使用`WorkloadIdentityCredential`。将文件变量指向运行者提供的令牌文件。 Do not commit the file.
* **其他环境**：OpenWiki 使用 `DefaultAzureCredential`，它接受 `az login` 等凭证、托管身份或环境凭证。

生成的 CI 工作流保留身份验证模式和范围，但仍需要在 CI 中配置无人值守的 Azure Identity 凭据。

## OpenAI（ChatGPT 登录）

`openai-chatgpt` 提供商使用您的 ChatGPT 订阅而不是计量的 API 密钥来调用 OpenAI 的 Codex 后端：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER=openai-chatgpt openwiki code --init
```

该向导在浏览器中打开 OpenAI 身份验证页面（并打印 URL 以供无头使用）。登录后，OpenWiki 将托管的 OAuth 令牌存储在`~/.openwiki/.env` 中并自动刷新访问令牌。将刷新令牌视为密码。

## Gemini 企业代理平台

`gemini-enterprise` 提供商使用 Google 应用程序默认凭据。 No API key is required:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER=gemini-enterprise
GOOGLE_CLOUD_PROJECT=your-gcp-project
GOOGLE_CLOUD_LOCATION=global
```The credentials need Gemini Enterprise Agent Platform access (`roles/aiplatform.user`), and the models you use must be enabled in Model Garden. Partner/open-weight (MaaS) models are region-specific, so set `GOOGLE_CLOUD_LOCATION` explicitly when using them.

## AWS 基岩

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER=bedrock
BEDROCK_AWS_ACCESS_KEY_ID=your-access-key-id
BEDROCK_AWS_SECRET_ACCESS_KEY=your-secret-access-key
BEDROCK_AWS_REGION=us-east-1
OPENWIKI_MODEL_ID=anthropic.claude-sonnet-5
```

When explicit Bedrock credentials are not set, OpenWiki uses the AWS SDK default credential provider chain.直接粘贴基岩模型 ID。 Some newer models require a cross-region inference profile ID (for example `us.anthropic.claude-sonnet-5`) instead of the bare model ID.

Bedrock defaults to a `16000`-token output ceiling when neither `OPENWIKI_MAX_OUTPUT_TOKENS` nor `OPENWIKI_BEDROCK_MAX_TOKENS` is set. Without an explicit limit, the Converse API caps output at `4096` tokens and can truncate long wiki pages.

For Bedrock stream idle timeout, set `OPENWIKI_STREAM_IDLE_TIMEOUT` in milliseconds (an integer from `0` to `2147483647`).设置`0`禁用看门狗。 If unset, OpenWiki preserves the `@langchain/aws` provider default.

## OpenAI 兼容端点

Use the `openai-compatible` provider for gateways or local servers that expose OpenAI-compatible chat completions:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_API_KEY=your-gateway-key
OPENAI_COMPATIBLE_BASE_URL=https://your-gateway.example.com/v1
OPENWIKI_MODEL_ID=your-gateway-model-name
```Ollama (`http://localhost:11434/v1`) 和 LM Studio (`http://localhost:1234/v1`) 等本地示例使用相同的模式。即使本地服务器忽略键值，OpenWiki 仍然需要`OPENAI_COMPATIBLE_API_KEY`。

即使您没有在终端中观看实时输出，OpenWiki 也会在内部发送非流请求。某些网关仅接受流请求，其中模型通过开放连接以块形式返回输出。当 OpenWiki 通过非流式请求访问这些网关之一时，该网关可能会拒绝该调用或返回带有空内容的 HTTP 200。没有错误的空白 wiki 通常意味着您需要启用流式传输。

当您的网关需要时，为 `openai-compatible` 提供商启用流式传输：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_OPENAI_COMPATIBLE_STREAMING=true
```

默认情况下，流式传输处于关闭状态，因为该提供程序可以指向任意第三方端点，而在这些端点上，不能保证流式传输能够通过代理和负载均衡器工作。启用它还可以使客户端报告估计而不是服务器报告的令牌计数。

要选择将与 openai 兼容的提供商添加到 Responses API 而不是聊天完成中：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_OPENAI_COMPATIBLE_USE_RESPONSES_API=true
```

## OpenRouter 提供商固定

当 OpenRouter 通过多个上游提供商提供模型服务时，限制路由：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER=openrouter
OPENROUTER_API_KEY=your-key
OPENWIKI_OPENROUTER_PROVIDER_ONLY=Novita
```

## 另请参阅* [Quickstart](/oss/openwiki/quickstart)
* [CLI reference](/oss/openwiki/cli-reference)
* [Customize OpenWiki](/oss/openwiki/customize)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/openwiki/providers.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>