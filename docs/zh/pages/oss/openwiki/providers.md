<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Model providers | https://docs.langchain.com/oss/openwiki/providers -->

# 模型提供者

为 OpenWiki 配置推理提供程序和凭据

OpenWiki 支持以下提供者：

|供应商|资质证书 |笔记|
| ------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `openai` | `OPENAI_API_KEY` |用于公开响应 API 的 OpenAI 兼容网关的可选 `OPENAI_BASE_URL` |
| `openai-chatgpt` | ChatGPT OAuth 令牌 |使用 ChatGPT 登录；使用情况取决于 Plus/Pro/Team Codex 津贴 |
| `copilot` | GitHub CLI 会话或 `COPILOT_API_KEY` |可选`COPILOT_BASE_URL`。 CI 需要 OAuth 令牌，而不是经典的 PAT |
| `openrouter` | `OPENROUTER_API_KEY` |可选 `OPENWIKI_OPENROUTER_PROVIDER_ONLY` 允许名单 |
| `anthropic` | `ANTHROPIC_API_KEY` |可选`ANTHROPIC_BASE_URL` || `gemini` | `GEMINI_API_KEY` |谷歌人工智能工作室 |
| `gemini-enterprise` |谷歌 ADC + `GOOGLE_CLOUD_PROJECT` |可选`GOOGLE_CLOUD_LOCATION`（默认为`global`）|
| `bedrock` | AWS 凭证 + 区域 |显式基岩密钥或 AWS 开发工具包默认链 |
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
```

### 提供者重试在第一个提供商请求后覆盖重试：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER_RETRY_ATTEMPTS=3
```

该值必须是正整数。如果未设置，OpenWiki 默认重试 3 次。

## GitHub 副驾驶

要使用 GitHub Copilot：

1. 在`openwiki --init`期间选择 GitHub Copilot。如果您有活动的 GitHub CLI 会话，OpenWiki 可以重用它。否则，从凭据提示符处运行 `gh auth login`。
2. 选择型号（例如`gpt-5.5`）。

OpenWiki 将 GitHub CLI 令牌保留在 GitHub CLI 凭证存储中。它不会将该令牌复制到 `~/.openwiki/.env` 中。对于没有 GitHub CLI 会话的 CI 或无头环境，请将 `COPILOT_API_KEY` 设置为 GitHub **OAuth 令牌**。个人访问令牌（经典或细粒度）被 Copilot API 拒绝用于第三方集成。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER=copilot
OPENWIKI_MODEL_ID=gpt-5.5
```

## OpenAI（ChatGPT 登录）

`openai-chatgpt` 提供商使用您的 ChatGPT 订阅而不是计量的 API 密钥来调用 OpenAI 的 Codex 后端：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER=openai-chatgpt openwiki code --init
```

该向导会在浏览器中打开 OpenAI 身份验证页面（并打印 URL 以供无头使用）。登录后，OpenWiki 将托管的 OAuth 令牌存储在 `~/.openwiki/.env` 中并自动刷新访问令牌。将刷新令牌视为密码。

## Gemini 企业（Vertex AI）`gemini-enterprise` 提供商使用 Google 应用程序默认凭据。不需要 API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER=gemini-enterprise
GOOGLE_CLOUD_PROJECT=your-gcp-project
GOOGLE_CLOUD_LOCATION=global
```

凭证需要 Vertex AI 访问权限 (`roles/aiplatform.user`)，并且您使用的模型必须在 Model Garden 中启用。合作伙伴/开放权重 (MaaS) 模型是特定于区域的，因此在使用它们时明确设置 `GOOGLE_CLOUD_LOCATION`。

## AWS 基岩

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER=bedrock
BEDROCK_AWS_ACCESS_KEY_ID=your-access-key-id
BEDROCK_AWS_SECRET_ACCESS_KEY=your-secret-access-key
BEDROCK_AWS_REGION=us-east-1
OPENWIKI_MODEL_ID=anthropic.claude-sonnet-5
```

当未设置显式 Bedrock 凭证时，OpenWiki 使用 AWS SDK 默认凭证提供程序链。直接粘贴基岩模型 ID。一些较新的模型需要跨区域推理配置文件 ID（例如`us.anthropic.claude-sonnet-5`）而不是裸模型 ID。

## OpenAI 兼容端点

将 `openai-compatible` 提供程序用于公开 OpenAI 兼容聊天完成的网关或本地服务器：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_API_KEY=your-gateway-key
OPENAI_COMPATIBLE_BASE_URL=https://your-gateway.example.com/v1
OPENWIKI_MODEL_ID=your-gateway-model-name
```

Ollama (`http://localhost:11434/v1`) 和 LM Studio (`http://localhost:1234/v1`) 等本地示例使用相同的模式。即使本地服务器忽略键值，OpenWiki 仍然需要`OPENAI_COMPATIBLE_API_KEY`。

## OpenRouter 提供商固定

当 OpenRouter 通过多个上游提供商提供模型服务时，限制路由：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENWIKI_PROVIDER=openrouter
OPENROUTER_API_KEY=your-key
OPENWIKI_OPENROUTER_PROVIDER_ONLY=Novita
```

## 另请参阅

* [Quickstart](/oss/openwiki/quickstart)
* [CLI reference](/oss/openwiki/cli-reference)
* [Customize OpenWiki](/oss/openwiki/customize)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/openwiki/providers.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>