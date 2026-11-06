<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Visual Studio Code Copilot Chat sessions | https://docs.langchain.com/langsmith/trace-with-vscode-copilot -->

# 跟踪 Visual Studio Code Copilot 聊天会话

通过 OpenTelemetry 捕获 VS Code Copilot Chat 代理交互、LLM 调用、工具执行和 LangSmith 中的令牌使用情况。

[Visual Studio Code Copilot Chat](https://code.visualstudio.com/docs/copilot/overview) 可以通过[OpenTelemetry](https://opentelemetry.io/) (OTel) 导出轨迹。 LangSmith 直接摄取 OTLP，因此您可以将 Copilot Chat 指向 LangSmith，并检查代理轮次、模型元数据、工具调用和令牌使用情况以及 LLM 跟踪的其余部分。

本指南基于 Copilot 的 [Monitor agent usage with OpenTelemetry](https://code.visualstudio.com/docs/copilot/guides/monitoring-agents) 参考。

> [!注意]
>
> 在发送跟踪之前，在[agent-based workspace](/langsmith/agent-registry)、[create an agent](/langsmith/create-an-agent) 中进行一次。使用[agent addressing](/langsmith/log-traces-to-agent)选择其标识符和环境。如果集成需要 `project_name`，请使用所选环境的 [⟦T3⟧](/langsmith/create-an-agent#use-an-environment-project) 作为兼容性值。

## 先决条件

在设置跟踪之前，请确保您拥有：

* 安装并登录了 GitHub Copilot Chat 的最新版本 [Visual Studio Code](https://code.visualstudio.com/)。
* A [LangSmith API key](/langsmith/create-account-api-key)。

## 选择你的安全带

自 [VS Code 1.143](https://code.visualstudio.com/updates/v1_143) 起，Copilot 默认在新的 Copilot 线束上运行，您仍然可以从线束选择器切换回旧的本地线束。每个都有自己的端点和设置。只有本地线束发送[Git information](#trace-metadata)，因此如果您希望使用存储库和分支标记您的跟踪，请使用它。

## 配置跟踪当设置了 `COPILOT_OTEL_ENABLED`、`OTEL_EXPORTER_OTLP_ENDPOINT` 或 `github.copilot.chat.otel.enabled` 设置（本地线束）时，Copilot Chat 会启用 OTel 发射。将 Copilot 聊天跟踪发送到 LangSmith 的最简单方法是在启动 VS Code 之前导出以下环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export COPILOT_OTEL_ENABLED=true
export COPILOT_OTEL_PROTOCOL=http
export COPILOT_OTEL_ENDPOINT=https://api.smith.langchain.com/otel/v1/traces
export COPILOT_OTEL_CAPTURE_CONTENT=true
export OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=true
export OTEL_EXPORTER_OTLP_HEADERS="x-api-key=<your_langsmith_api_key>,Langsmith-Agent-Id=<your-agent-id>,Langsmith-Agent-Environment=local"
```

|变量|描述 |
| - | - |
| `COPILOT_OTEL_ENABLED` |设置为 `true` 以启用 Copilot Chat OTel 导出。 |
| `COPILOT_OTEL_PROTOCOL` | OTLP 协议。使用 `http` 定位 LangSmith 的 HTTP OTLP 摄取端点。 |
| `COPILOT_OTEL_ENDPOINT` | LangSmith OTLP 端点。在 Local 线束上，它优先于 `OTEL_EXPORTER_OTLP_ENDPOINT`，而在 Copilot 线束上，它仅在未设置该变量时使用。 |
| `COPILOT_OTEL_CAPTURE_CONTENT` |捕获本地线束上跨度上的完整提示、响应、工具参数和工具结果。默认关闭。 |
| `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT` |副驾驶安全带上捕获的内容相同。默认关闭。 |
| `OTEL_EXPORTER_OTLP_HEADERS` | OTLP 导出器的身份验证标头。使用 `x-api-key=<your_langsmith_api_key>` 和 `Langsmith-Agent-Id=<your-agent-id>,Langsmith-Agent-Environment=local` 将跟踪路由到已注册的 [agent and environment](/langsmith/log-traces-to-agent)。 |

此端点用于 Copilot 线束，它完全按照写入的方式发送到 URL。本地线束自行添加 `/v1/traces`，因此请改用 `https://api.smith.langchain.com/otel`。VS Code 必须继承这些环境变量，因此在启动编辑器之前，请在启动 VS Code 的 shell 会话中导出它们（例如，通过将它们添加到 `~/.zshrc`、`~/.bashrc` 或 shell 配置文件）。

将端点设置为您的 LangSmith API URL (`LANGSMITH_ENDPOINT`) 加上 Local 线束上的 `/otel`，或加上 Copilot 线束上的 `/otel/v1/traces`。有关每种部署类型的 URL，请参阅 [Find your OTLP endpoint](/langsmith/trace-with-opentelemetry#find-your-otlp-endpoint)。

> [!警告]
>
> 内容捕获记录完整的提示和响应内容、系统提示、工具模式、工具参数和工具结果。仅在可接受捕获源代码、文件内容和用户提示的受信任环境中启用它。

### 替代方案：VS Code 设置

如果您不想设置环境变量，则可以从 VS Code 设置中启用 OTel。打开 **设置** (`⌘,` / `Ctrl+,`)，搜索 `copilot otel`，并为本地线束配置这些：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "github.copilot.chat.otel.enabled": true,
  "github.copilot.chat.otel.exporterType": "otlp-http",
  "github.copilot.chat.otel.otlpEndpoint": "https://api.smith.langchain.com/otel",
  "github.copilot.chat.otel.captureContent": true
}
```

Copilot 线束改为读取自己的设置：`chat.agentHost.otel.enabled`、`chat.agentHost.otel.otlpEndpoint`（设置为 `https://api.smith.langchain.com/otel/v1/traces`）和 `chat.agentHost.otel.captureContent`，如 VS Code 的 [Agent Host OTel reference](https://github.com/microsoft/vscode/blob/main/src/vs/platform/agentHost/OTEL.md) 中所列。身份验证标头仍必须通过 `OTEL_EXPORTER_OTLP_HEADERS` 环境变量提供 - VS Code 设置不会公开标头字段。在本地工具上，当两者都设置时，环境变量也优先于 VS Code 设置。

## 查看LangSmith中的踪迹

启动 Copilot 聊天会话并发送请求。在[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-with-vscode-copilot)中，选择您的代理和环境，然后打开**跟踪**。每个代理交互都会生成一个遵循 [OTel GenAI Semantic Conventions](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/gen-ai/) 的分层生成树：

* `invoke_agent` spans 包含完整的代理编排，包括代理名称、对话 ID、回合数和总令牌使用量。
* `chat` 跨度捕获单个 LLM API 调用，包括模型、令牌计数、响应时间和完成原因。
* `execute_tool` 涵盖捕获工具调用，包括工具名称、类型、持续时间和成功状态。

当代理调用子代理时，Copilot Chat 会自动传播跟踪上下文，因此子代理的 `invoke_agent` 范围在 LangSmith 中显示为父代理的 `execute_tool` 范围的子项。

### 跟踪元数据

LangSmith 添加了与 Claude Code、Codex 和 Cursor 插件发送的相同的 [coding agent metadata](/langsmith/coding-agent-metadata-contract)，因此 Copilot 跟踪可以使用相同的过滤器和图表。每个对话被分组为一个线程，并且`ls_integration`设置为`copilot`。在本地线束上，顶级运行包括打开文件夹的分支和提交，以及具有远程文件夹时的存储库详细信息。您不需要为此打开任何东西。 Copilot 线束不会发送 Git 信息，因此这些字段不会出现在其跟踪中。

## 故障排除

* **LangSmith 中没有出现任何痕迹。** 确认 `COPILOT_OTEL_ENABLED=true` 以及 VS Code 是从导出变量的 shell 启动的。验证 `OTEL_EXPORTER_OTLP_HEADERS` 包含 `x-api-key=<your_langsmith_api_key>` 并且 API 密钥属于您要跟踪的工作区。更改环境变量后重新启动 VS Code。
* **在错误的环境中追踪着陆。** 将 `Langsmith-Agent-Id=<your-agent-id>,Langsmith-Agent-Environment=local` 设置为 `OTEL_EXPORTER_OTLP_HEADERS`。使用注册的代理 ID 和预期环境。使用代理标头时删除 `Langsmith-Project`。
* **Copilot 线束没有任何痕迹。** 其端点必须以 `/otel/v1/traces` 结尾，因为它本身不添加路径。
* **缺少提示和响应。** 内容捕获是可选的。在本地安全带上设置 `COPILOT_OTEL_CAPTURE_CONTENT=true`（或启用 `github.copilot.chat.otel.captureContent`），在副驾驶安全带上设置 `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=true`（或启用 `chat.agentHost.otel.captureContent`）。

## 相关资源

* [VS Code Copilot: Monitor agent usage with OpenTelemetry](https://code.visualstudio.com/docs/copilot/guides/monitoring-agents)
* [Trace with OpenTelemetry](/langsmith/trace-with-opentelemetry)
* [Configure legacy integrations](/langsmith/create-an-agent#use-an-environment-project)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-vscode-copilot.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。