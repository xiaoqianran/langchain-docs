<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up coding agents | https://docs.langchain.com/langsmith/llm-gateway-coding-agents -->

# 设置编码代理

配置 Claude Code、Codex、Gemini CLI 和 Deep Agents Code 以通过 LLM 网关路由 LLM 呼叫。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

配置编码代理以使用标准 LLM 网关端点来实现集中成本控制、可观察性和审计跟踪。网关对每个呼叫者进行身份验证、按模型 ID 进行路由、执行策略并跟踪每个呼叫。

## 先决条件

* 管理员已完成任何必需的 [gateway setup](/langsmith/llm-gateway-admin-setup)。
* 您拥有工作区范围的 LangSmith API 密钥。有关密钥类型、权限和每个客户端发送的标头，请参阅[Authenticate to the LLM Gateway](/langsmith/llm-gateway-authentication)。
* 对于自带密钥模型，您的工作区具有相应的提供者密钥。 [Gateway Credits models](/langsmith/llm-gateway-credits) 不需要提供商秘密。

在配置客户端之前设置您的 LangSmith API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY="lsv2_..._....cbed3e"
```

然后配置您的代理：

* [Claude Code](#claude-code-cli) 使用标准 Anthropic 消息格式。
* [Codex](#codex-cli) 和 [Deep Agents Code](#deep-agents-code) 使用标准 OpenAI 兼容格式。
* [Gemini CLI](#gemini-cli) 使用 Google 原生 API，需要 [direct model access](/langsmith/llm-gateway-direct-model-access)。

## 克劳德代码 CLI

Claude Code 始终使用您的 LangSmith API 密钥对网关进行身份验证。它支持网关对Anthropic进行身份验证的两种方式，每种方式都有不同的计费所有者。配置前选择一项：* **工作区提供者秘密**：组织通过存储在工作区秘密中的提供者密钥来管理计费和策略。将此方法用于组织管理的使用。
* **Claude 订阅 OAuth**：Anthropic 将 LLM 调用计费到用户的个人 Claude Plus 或 Max 订阅，而不是工作区提供商密钥。 LangSmith 仍然强制执行网关权限、速率限制、模型访问和数据策略，并跟踪每个调用。支出限制不适用。当开发人员拥有自己的订阅时，请使用此方法。

### 使用工作区提供者机密

将 `ANTHROPIC_API_KEY` 设置为您的 LangSmith API 密钥。 Claude Code 从您的 shell 环境或通过 `--settings` 传递的设置文件中的 `env` 块读取这些变量。

如果您的 LangSmith 部署位于区域实例上，请将以下示例中的网关主机名替换为您的 [regional gateway](/langsmith/llm-gateway-how-it-works#use-a-regional-gateway) 主机名。在 [self-hosted installation](/langsmith/llm-gateway-how-it-works#use-a-self-hosted-installation) 上，将 `https://gateway.smith.langchain.com` 替换为 `https://<your-hostname>/gateway`。

#### 仅使用 Anthropic 型号

将 `ANTHROPIC_BASE_URL` 设置为 Anthropic 格式的网关端点。网关从端点推断 `anthropic/` 提供商前缀。> [tab] 设置文件（推荐）
>
> 在 `--settings` 文件中声明的变量优先于您的 shell 中已导出的任何内容，因此网关 URL 和 API 密钥保证覆盖您的环境中可能已设置的任何环境 `ANTHROPIC_*` 值（例如，从全局 shell 配置文件或其他工具）。
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> touch ~/.claude/langsmith_gateway.settings.json
> echo '{"env": {"ANTHROPIC_BASE_URL": "https://gateway.smith.langchain.com/anthropic/","ANTHROPIC_API_KEY": "YOUR_LANGSMITH_KEY_HERE"}}' > ~/.claude/langsmith_gateway.settings.json
> claude --settings ~/.claude/langsmith_gateway.settings.json
> ```
>
> 将 `YOUR_LANGSMITH_KEY_HERE` 替换为您的 LangSmith API 密钥。

> [选项卡] 环境变量
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> export ANTHROPIC_BASE_URL="https://gateway.smith.langchain.com/anthropic/"
> export ANTHROPIC_API_KEY="$LANGSMITH_API_KEY"
>
> claude
> ```

#### 跨提供商路由模型层

将 `ANTHROPIC_BASE_URL` 设置为网关根，然后将每个 Claude 模型层映射到以提供商为前缀的网关模型 ID。

> [tab] 设置文件（推荐）
>
> 在 `--settings` 文件中声明的变量优先于 shell 中已导出的任何内容，因此网关 URL、API 密钥和模型映射保证覆盖任何环境 `ANTHROPIC_*` 值。
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> touch ~/.claude/langsmith_gateway.settings.json
> echo '{"env": {"ANTHROPIC_BASE_URL": "https://gateway.smith.langchain.com","ANTHROPIC_API_KEY": "YOUR_LANGSMITH_KEY_HERE","ANTHROPIC_DEFAULT_OPUS_MODEL": "anthropic/claude-opus-5","ANTHROPIC_DEFAULT_SONNET_MODEL": "openai/gpt-5.6-terra","ANTHROPIC_DEFAULT_HAIKU_MODEL": "fireworks/accounts/fireworks/models/glm-5p2"}}' > ~/.claude/langsmith_gateway.settings.json
> claude --settings ~/.claude/langsmith_gateway.settings.json
> ```
>
> 将 `YOUR_LANGSMITH_KEY_HERE` 替换为您的 LangSmith API 密钥。

> [选项卡] 环境变量
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> export ANTHROPIC_BASE_URL="https://gateway.smith.langchain.com"
> export ANTHROPIC_API_KEY="$LANGSMITH_API_KEY"
> export ANTHROPIC_DEFAULT_OPUS_MODEL="anthropic/claude-opus-5"
> export ANTHROPIC_DEFAULT_SONNET_MODEL="openai/gpt-5.6-terra"
> export ANTHROPIC_DEFAULT_HAIKU_MODEL="fireworks/accounts/fireworks/models/glm-5p2"
>
> claude
> ```

型号 ID 是示例。将每个层映射到工作区机密中配置的或通过 [Gateway Credits](/langsmith/llm-gateway-credits) 提供的任何模型；网关处理跨提供商的请求转换。详情请参阅[API formats](/langsmith/llm-gateway-api-formats#understand-translation-behavior)。> [!警告]
>
> Claude Code 默认使用[tool search](https://code.claude.com/docs/en/agent-sdk/tool-search)，网关无法将工具搜索转换为 Chat Completions 格式。映射到网关仅通过聊天完成才能到达的模型的层（例如 Google Gemini 模型或 OpenAI 兼容的 [custom configuration](/langsmith/llm-gateway-model-configurations)）会失败，并出现 `400` 错误，该错误在网关调用提供商之前提及 `deferred tools, tool search`。
>
> 要避免该错误，请执行以下操作之一：
>
> * 将层映射到Anthropic、OpenAI 或 Fireworks 的模型，网关通过消息或响应格式到达该模型。
> * 使用 Anthropic 兼容的配置，或为 Responses API 设置的 OpenAI 兼容的配置。
> * 在您的设置文件或环境中设置`ENABLE_TOOL_SEARCH=false`。然后，克劳德代码每次都会将每个工具定义加载到上下文中，这会使用更多的输入标记。

### 使用 Claude 订阅 OAuth

> [!注意]
>
> Claude 订阅 OAuth 需要有效的 Claude Code Plus 或 Max 订阅。如果您使用工作区 Anthropic API 密钥，请改用 [workspace provider secret](#use-a-workspace-provider-secret) 方法。

Claude Code Plus 和 Max 用户可以通过网关发送其保存的 Anthropic OAuth 凭证。此模式不需要工作区提供者机密中的`ANTHROPIC_API_KEY`。使用您的订阅登录 Claude Code，然后配置网关。

> [tab] 设置文件（推荐）
>
> 在 `--settings` 文件中声明的变量优先于 shell 中已导出的任何内容，因此网关 URL 和自定义标头保证覆盖任何环境 `ANTHROPIC_*` 值。设置文件还将您的 LangSmith API 密钥保留在 shell 历史记录和点文件之外。
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> touch ~/.claude/langsmith_gateway.settings.json
> echo '{"env": {"ANTHROPIC_BASE_URL": "https://gateway.smith.langchain.com/anthropic","ANTHROPIC_CUSTOM_HEADERS": "X-Api-Key: YOUR_LANGSMITH_KEY_HERE"}}' > ~/.claude/langsmith_gateway.settings.json
> claude --settings ~/.claude/langsmith_gateway.settings.json
> ```
>
> 将 `YOUR_LANGSMITH_KEY_HERE` 替换为您的 LangSmith API 密钥。

> [选项卡] 环境变量
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> export ANTHROPIC_BASE_URL="https://gateway.smith.langchain.com/anthropic"
> export ANTHROPIC_CUSTOM_HEADERS="X-Api-Key: $LANGSMITH_API_KEY"
>
> claude
> ```
>
> 将 `ANTHROPIC_CUSTOM_HEADERS` 值视为秘密：它嵌入了您的 LangSmith API 密钥，因此请将其排除在 shell 历史记录、点文件和共享配置之外。

Claude Code 使用并刷新其保存的登录中的 OAuth 凭据，包括 `anthropic-beta` 标头中所需的 OAuth 功能。LangSmith API 密钥对网关请求进行身份验证，并始终受网关权限以及速率限制、模型访问和数据策略的约束。网关将 OAuth 承载转发到 Anthropic，因此 Anthropic 将对用户的 Claude 订阅而不是工作区提供者密钥的呼叫进行计费。 [Spend limits](/langsmith/llm-gateway-spend-policies) 不适用于这些通话，并且这些通话不计入支出总额。要确认呼叫路由通过网关，请检查`gateway` 跟踪项目中是否出现跟踪，如[Verify the setup](#verify-the-setup) 中所述。

> [!警告]
>
> 在此模式下，保留 `ANTHROPIC_AUTH_TOKEN` 和 `ANTHROPIC_API_KEY` 未设置。任一变量均优先于已保存的订阅登录名。

> [!警告]
>
> 配置网关时，克劳德桌面插件会中断。

## Codex CLI

Codex 使用响应 API。将以下内容添加到`~/.codex/config.toml`，以通过标准端点使用 Gateway Credits 调用托管的 Kimi K3 模型：

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
model = "moonshotai/kimi-k3"
model_provider = "langsmith-gateway"

[model_providers.langsmith-gateway]
name = "LangSmith Gateway"
base_url = "https://gateway.smith.langchain.com/v1"
env_key = "LANGSMITH_API_KEY"
wire_api = "responses"
supports_websockets = false
```

然后运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
codex
```

要改用自带密钥模型，请将 `model` 替换为其提供商前缀 ID，例如 `openai/gpt-5.4-mini`。

> [!警告]
>
> 配置网关时，Codex Desktop 插件会中断。 TOML 配置强制通过网关进行身份验证，因此OpenAI 不再直接处理插件身份验证。## Gemini CLI

Gemini CLI 发送 Google 的本机生成内容请求，标准端点不会公开该请求。按照[Direct model access](/langsmith/llm-gateway-direct-model-access#configure-provider-sdks)配置`/gemini`路由，然后运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
gemini
```

## Deep Agents 代码

将 OpenAI 兼容客户端与标准端点结合使用，然后通过 `openai` 集成传递托管模型 slug：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export OPENAI_BASE_URL="https://gateway.smith.langchain.com/v1"
export OPENAI_API_KEY="$LANGSMITH_API_KEY"

dcode --model openai:moonshotai/kimi-k3
```

要使用自带密钥模型，请保留标准基本 URL 并在 `openai:` 之后传递提供者前缀模型，例如 `openai:anthropic/claude-opus-5`。有关提供商本机集成和模型 ID，请参阅 [Direct model access](/langsmith/llm-gateway-direct-model-access#configure-langchain-and-deep-agents)。

## 全公司部署

对于向所有开发人员推出网关的组织，可以通过移动设备管理或共享 shell 配置文件分发配置。分发：

1. 每个客户端的标准网关基本 URL。
2. 每个用户或每个成本中心的工作区范围[LangSmith API key](/langsmith/llm-gateway-authentication#choose-a-key-type)，具体取决于您的策略粒度。
3. 为每个编码代理批准的型号 ID。
4. Codex `config.toml`（如果您的组织使用 Codex）。

提供商 API 密钥集中在 LangSmith 工作区机密中。

## 将呼叫分组到对话线程中网关将识别的编码代理会话标头映射到LangSmith`thread_id`元数据。具有相同 ID 的呼叫属于跟踪项目中的同一对话线程。

标头检测适用于所有提供程序、请求路径和 API 格式。网关按顺序检查这些标头：

1.`X-Claude-Code-Session-Id`
2.`X-Deepseek-Harness-Session-Id`
3.`thread-id`
4.`thread_id`
5.`session-id`
6.`session_id`

网关修剪空白、跳过空白值并使用第一个非空白标头值。

如果没有标头提供 ID，则网关可以从聊天完成或响应请求的正文中读取 ID。它使用 `conversation` 字段（字符串或对象的 `id`），并回退到 `prompt_cache_key`。仅当网关已出于其他原因（例如保护策略）加载请求正文时，网关才会读取这些字段。发送标头以实现一致的线程。

要显式设置线程 ID，请发送 `X-Gateway-Thread-Id` 或在 `X-Gateway-Metadata` 的 JSON 对象中设置 `thread_id`。非空显式值会覆盖自动检测。如果两个元数据标头都指定了线程 ID，则`X-Gateway-Metadata` 优先。

如果网关未找到显式 ID、可识别的会话标头或正文字段，则不会添加 `thread_id` 元数据。

## 验证设置配置编码代理后，进行测试呼叫并确认：

1. 呼叫成功，座席收到响应。
2. LangSmith 工作区中的`gateway` 跟踪项目中会出现一条跟踪。

如果调用失败并显示 `401` 或 `403`，请参阅 [Fix authentication errors](/langsmith/llm-gateway-authentication#fix-authentication-errors)。如果自带密钥调用失败并出现 `424` 提及缺少提供程序密钥，请要求工作区管理员将提供程序的密钥添加到工作区机密中。详情请参见[Fix provider credential errors](/langsmith/llm-gateway-provider-authentication#fix-provider-credential-errors)。

## 另请参阅

* [Gateway Credits](/langsmith/llm-gateway-credits)：无需提供者密钥即可调用托管模型。
* [Direct model access](/langsmith/llm-gateway-direct-model-access)：为需要它们的编码代理配置提供者本地路由。
* [Spend policies](/langsmith/llm-gateway-spend-policies)：对开发者LLM使用设置成本限制。
* [View LLM Gateway traces](/langsmith/llm-gateway-traces)：了解网关痕迹出现的位置。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-coding-agents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。