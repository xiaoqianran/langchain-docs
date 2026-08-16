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
- 对于自带密钥模型，您的工作区具有相应的提供者密钥。 [Gateway Credits models](/langsmith/llm-gateway-credits) 不需要提供商秘密。

在配置客户端之前设置您的 LangSmith API 密钥：

```bash
export LANGSMITH_API_KEY="lsv2_..._....cbed3e"
```

## 克劳德代码 CLI

将 Claude 代码指向标准消息端点并使用提供者前缀的模型 ID：

```bash
export ANTHROPIC_BASE_URL="https://gateway.smith.langchain.com"
export ANTHROPIC_API_KEY="$LANGSMITH_API_KEY"
export ANTHROPIC_MODEL="anthropic/claude-opus-5"

claude
```

克劳德代码将 `/v1/messages` 附加到 `ANTHROPIC_BASE_URL`。网关使用 `anthropic/` 前缀来解析工作区的 Anthropic 提供程序机密。<Warning>
配置网关后，Claude Desktop 插件会中断。尚不支持付费计划（Plus、Max）的 Claude 用户。
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

## Gemini CLI

Gemini CLI 发送 Google 的本机生成内容请求，标准端点不会公开该请求。按照[Direct model access](/langsmith/llm-gateway-direct-model-access#configure-provider-sdks)配置`/gemini`路由，然后运行：

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

## 公司范围内的部署对于向所有开发人员推出网关的组织，可以通过移动设备管理或共享 shell 配置文件分发配置。分发：

1. 每个客户端的标准网关基本 URL。
1. 每个用户或团队的工作区范围[LangSmith API key](/langsmith/create-account-api-key)，具体取决于您的策略粒度。
1. 为每个编码代理批准的型号 ID。
1. Codex `config.toml`（如果您的组织使用 Codex）。

提供商 API 密钥集中在 LangSmith 工作区机密中。 Gateway Credits 模型不需要提供商 API 密钥。

## 验证设置

配置编码代理后，进行测试呼叫并确认：

1. 呼叫成功，座席收到响应。
1. LangSmith 工作区中的`gateway` 或`gateway-<short_api_key>-<api_key_id>` 跟踪项目中会出现一条跟踪。

如果调用失败并显示 `403`，请检查您的 API 密钥的角色是否包含 `gateway:invoke` 和 `workspaces:read`。如果自带密钥调用失败并显示 `400` 提及缺少提供程序密钥，请要求组织管理员将提供程序的密钥添加到工作区机密中。

## 后续步骤- [Gateway Credits](/langsmith/llm-gateway-credits)：无需提供者密钥即可调用托管模型。
- [Direct model access](/langsmith/llm-gateway-direct-model-access)：为需要它们的编码代理配置提供者本地路由。
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