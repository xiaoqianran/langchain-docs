<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up coding agents | https://docs.langchain.com/langsmith/llm-gateway-coding-agents -->

# 设置编码代理

<Note>
**测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。
</Note>

配置编码代理以使用标准 LLM 网关端点来实现集中成本控制、可观察性和审计跟踪。网关对每个呼叫者进行身份验证、按模型 ID 进行路由、执行策略并跟踪每个呼叫。

Claude Code 可以使用标准的 Anthropic 消息格式，而 Codex 和 Deep Agents Code 可以使用标准的 OpenAI 兼容格式。 Gemini CLI 使用 Google 的本机 API 并需要 [direct model access](/langsmith/llm-gateway-direct-model-access)。

## 先决条件

- 您的[Organization admin](/langsmith/rbac#organization-admin)已启用网关并完成任何所需的[provider setup](/langsmith/llm-gateway-admin-setup)。
- 您有一个工作空间范围的 [LangSmith API key](/langsmith/create-account-api-key) 以及 `gateway:invoke` 和 `workspaces:read` [permissions](/langsmith/organization-workspace-operations)。
- 对于自带密钥模型，您的工作区具有相应的提供者密钥。 [Gateway Credits models](/langsmith/llm-gateway-credits) 不需要提供商机密。

在配置客户端之前设置您的 LangSmith API 密钥：

```bash
export LANGSMITH_API_KEY="lsv2_..._....cbed3e"
```

## 克劳德代码 CLI

Claude Code 支持两种独立的身份验证方法。配置前选择一项：- **工作区提供商秘密**：组织通过存储在工作区秘密中的提供商密钥来管理计费和策略。将此方法用于组织管理的使用。
- **Claude 订阅 OAuth**：Anthropic 对用户的个人 Claude Plus 或 Max 订阅（而不是工作区提供者密钥）的 LLM 调用进行计费，而 LangSmith 仍然强制执行网关权限、策略和跟踪。当开发人员拥有自己的订阅时，请使用此方法。

### 使用工作区提供者机密

将 `ANTHROPIC_API_KEY` 设置为您的 LangSmith API 密钥。 Claude Code 从您的 shell 环境或通过 `--settings` 传递的设置文件中的 `env` 块读取这些变量。

如果您的 LangSmith 部署位于区域或自托管实例上，请将以下示例中的网关主机名替换为您的 [regional gateway](/langsmith/llm-gateway-api-formats#use-a-regional-gateway) 主机名。

#### 仅使用 Anthropic 型号

将 `ANTHROPIC_BASE_URL` 设置为 Anthropic 格式的网关端点。网关从端点推断 `anthropic/` 提供商前缀。<Tabs>
  <Tab title="Settings file (recommended)">
    `--settings` 文件中声明的变量优先于 shell 中已导出的任何内容，因此网关 URL 和 API 密钥保证覆盖环境中可能已设置的任何环境 `ANTHROPIC_*` 值（例如，从全局 shell 配置文件或其他工具）。

    ```bash
    touch ~/.claude/langsmith_gateway.settings.json
    echo '{"env": {"ANTHROPIC_BASE_URL": "https://gateway.smith.langchain.com/anthropic/","ANTHROPIC_API_KEY": "YOUR_LANGSMITH_KEY_HERE"}}' > ~/.claude/langsmith_gateway.settings.json
    claude --settings ~/.claude/langsmith_gateway.settings.json
    ```

    将 `YOUR_LANGSMITH_KEY_HERE` 替换为您的 LangSmith API 密钥。
  </Tab>
  <Tab title="Environment variables">
    ```bash
    export ANTHROPIC_BASE_URL="https://gateway.smith.langchain.com/anthropic/"
    export ANTHROPIC_API_KEY="$LANGSMITH_API_KEY"

    claude
    ```
  </Tab>
</Tabs>

#### 跨提供商路由模型层

将 `ANTHROPIC_BASE_URL` 设置为网关根，然后将每个 Claude 模型层映射到提供商前缀的网关模型 ID。

<Tabs>
  <Tab title="Settings file (recommended)">
    `--settings` 文件中声明的变量优先于 shell 中已导出的任何内容，因此网关 URL、API 密钥和模型映射保证覆盖任何环境 `ANTHROPIC_*` 值。

    ```bash
    touch ~/.claude/langsmith_gateway.settings.json
    echo '{"env": {"ANTHROPIC_BASE_URL": "https://gateway.smith.langchain.com","ANTHROPIC_API_KEY": "YOUR_LANGSMITH_KEY_HERE","ANTHROPIC_DEFAULT_OPUS_MODEL": "anthropic/claude-opus-5","ANTHROPIC_DEFAULT_SONNET_MODEL": "openai/gpt-5.6-terra","ANTHROPIC_DEFAULT_HAIKU_MODEL": "fireworks/accounts/fireworks/models/glm-5p2"}}' > ~/.claude/langsmith_gateway.settings.json
    claude --settings ~/.claude/langsmith_gateway.settings.json
    ```

    将 `YOUR_LANGSMITH_KEY_HERE` 替换为您的 LangSmith API 密钥。
  </Tab>
  <Tab title="Environment variables">
    ```bash
    export ANTHROPIC_BASE_URL="https://gateway.smith.langchain.com"
    export ANTHROPIC_API_KEY="$LANGSMITH_API_KEY"
    export ANTHROPIC_DEFAULT_OPUS_MODEL="anthropic/claude-opus-5"
    export ANTHROPIC_DEFAULT_SONNET_MODEL="openai/gpt-5.6-terra"
    export ANTHROPIC_DEFAULT_HAIKU_MODEL="fireworks/accounts/fireworks/models/glm-5p2"

    claude
    ```
  </Tab>
</Tabs>

型号 ID 是示例。将每个层映射到工作区机密中配置的或通过 [Gateway Credits](/langsmith/llm-gateway-credits) 提供的任何模型；网关处理跨提供商的请求转换。详情请参见[API formats](/langsmith/llm-gateway-api-formats#understand-translation-behavior)。

<a id="use-claude-subscription-oauth"></a>
### 使用 Claude 订阅 OAuth<Note>
Claude 订阅 OAuth 需要有效的 Claude Code Plus 或 Max 订阅。如果您使用工作区 Anthropic API 密钥，请改用 [workspace provider secret](#use-a-workspace-provider-secret) 方法。
</Note>

Claude Code Plus 和 Max 用户可以通过网关发送其保存的 Anthropic OAuth 凭证。此模式不需要工作区提供者机密中的`ANTHROPIC_API_KEY`。

使用您的订阅登录 Claude Code，然后配置网关。

<Tabs>
  <Tab title="Settings file (recommended)">
    在 `--settings` 文件中声明的变量优先于 shell 中已导出的任何内容，因此网关 URL 和自定义标头保证覆盖任何环境 `ANTHROPIC_*` 值。设置文件还将您的 LangSmith API 密钥保留在 shell 历史记录和点文件之外。

    ```bash
    touch ~/.claude/langsmith_gateway.settings.json
    echo '{"env": {"ANTHROPIC_BASE_URL": "https://gateway.smith.langchain.com/anthropic","ANTHROPIC_CUSTOM_HEADERS": "X-Api-Key: YOUR_LANGSMITH_KEY_HERE"}}' > ~/.claude/langsmith_gateway.settings.json
    claude --settings ~/.claude/langsmith_gateway.settings.json
    ```

    将 `YOUR_LANGSMITH_KEY_HERE` 替换为您的 LangSmith API 密钥。
  </Tab>
  <Tab title="Environment variables">
    ```bash
    export ANTHROPIC_BASE_URL="https://gateway.smith.langchain.com/anthropic"
    export ANTHROPIC_CUSTOM_HEADERS="X-Api-Key: $LANGSMITH_API_KEY"

    claude
    ```

    将 `ANTHROPIC_CUSTOM_HEADERS` 值视为秘密：它嵌入了您的 LangSmith API 密钥，因此请将其排除在 shell 历史记录、点文件和共享配置之外。
  </Tab>
</Tabs>

Claude Code 使用并刷新其保存的登录中的 OAuth 凭据，包括 `anthropic-beta` 标头中所需的 OAuth 功能。LangSmith API 密钥对网关请求进行身份验证，并始终遵守网关权限和策略。网关将 OAuth 承载转发到 Anthropic，因此 Anthropic 将对用户的 Claude 订阅而不是工作区提供者密钥的呼叫进行计费。要确认呼叫路由通过网关，请检查`gateway` 跟踪项目中是否出现跟踪，如[Verify the setup](#verify-the-setup) 中所述。

<Warning>
对于此模式，请保留 `ANTHROPIC_AUTH_TOKEN` 和 `ANTHROPIC_API_KEY` 未设置。任一变量均优先于已保存的订阅登录名。
</Warning>

<Warning>
配置网关时，Claude Desktop 插件会中断。
</Warning>

## Codex CLI

Codex 使用响应 API。将以下内容添加到`~/.codex/config.toml`，以通过标准端点使用 Gateway Credits 调用托管的 Kimi K3 模型：

```toml
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

```bash
codex
```

要改用自带密钥模型，请将 `model` 替换为其提供商前缀 ID，例如 `openai/gpt-5.4-mini`。

<Warning>
配置网关时 Codex Desktop 插件会中断。 TOML 配置强制通过网关进行身份验证，因此OpenAI 不再直接处理插件身份验证。
</Warning>

## Gemini CLIGemini CLI 发送 Google 的本机生成内容请求，标准端点不会公开该请求。按照[Direct model access](/langsmith/llm-gateway-direct-model-access#configure-provider-sdks)配置`/gemini`路由，然后运行：

```bash
gemini
```

## Deep Agents 代码

将 OpenAI 兼容客户端与标准端点结合使用，然后通过 `openai` 集成传递托管模型 slug：

```bash
export OPENAI_BASE_URL="https://gateway.smith.langchain.com/v1"
export OPENAI_API_KEY="$LANGSMITH_API_KEY"

dcode --model openai:moonshotai/kimi-k3
```

要使用自带密钥模型，请保留标准基本 URL 并在 `openai:` 之后传递提供者前缀模型，例如 `openai:anthropic/claude-opus-5`。有关提供商本机集成和模型 ID，请参阅 [Direct model access](/langsmith/llm-gateway-direct-model-access#configure-langchain-and-deep-agents)。

## 全公司部署

对于向所有开发人员推出网关的组织，可以通过移动设备管理或共享 shell 配置文件分发配置。分发：

1. 每个客户端的标准网关基本 URL。
1. 每个用户或团队一个工作区范围的[LangSmith API key](/langsmith/create-account-api-key)，具体取决于您的策略粒度。
1. 为每个编码代理批准的型号 ID。
1. Codex `config.toml`（如果您的组织使用 Codex）。

提供商 API 密钥集中在 LangSmith 工作区机密中。 Gateway Credits 模型不需要提供商 API 密钥。

## 验证设置

配置编码代理后，进行测试呼叫并确认：1. 呼叫成功，座席收到响应。
1. 跟踪出现在您的 LangSmith 工作区的 `gateway` 或 `gateway-<short_api_key>-<api_key_id>` 跟踪项目中。

如果调用失败并显示 `403`，请检查您的 API 密钥的角色是否包含 `gateway:invoke` 和 `workspaces:read`。如果自带密钥调用失败并出现 `400` 提及缺少提供程序密钥，请要求组织管理员将提供程序的密钥添加到工作区机密中。

## 后续步骤

- [Gateway Credits](/langsmith/llm-gateway-credits)：无需提供者密钥即可调用托管模型。
- [Direct model access](/langsmith/llm-gateway-direct-model-access)：为需要它们的编码代理配置提供商本机路由。
- [Spend policies](/langsmith/llm-gateway-spend-policies)：对开发人员 LLM 使用设置成本限制。
- [Traces, Engine, and access control](/langsmith/llm-gateway-access)：了解网关痕迹出现的位置。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-coding-agents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>