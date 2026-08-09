<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Visual Studio Code Copilot Chat sessions | https://docs.langchain.com/langsmith/trace-with-vscode-copilot -->

# 跟踪 Visual Studio Code Copilot 聊天会话

通过 OpenTelemetry 在 LangSmith 中捕获 VS Code Copilot 聊天代理交互、LLM 调用、工具执行和令牌使用情况。

[Visual Studio Code Copilot Chat](https://code.visualstudio.com/docs/copilot/overview) 可以通过[OpenTelemetry](https://opentelemetry.io/) (OTel) 导出轨迹。 LangSmith 直接提取 OTLP，因此您可以将 Copilot Chat 指向 LangSmith，并检查代理轮次、模型元数据、工具调用和令牌使用情况以及 LLM 跟踪的其余部分。

本指南基于 Copilot 的 [Monitor agent usage with OpenTelemetry](https://code.visualstudio.com/docs/copilot/guides/monitoring-agents) 参考。

## 先决条件

在设置跟踪之前，请确保您拥有：

* 安装并登录了 GitHub Copilot Chat 的最新版本 [Visual Studio Code](https://code.visualstudio.com/)。
* A [LangSmith API key](/langsmith/create-account-api-key)。

## 配置跟踪

当设置 `COPILOT_OTEL_ENABLED`、`OTEL_EXPORTER_OTLP_ENDPOINT` 或 `github.copilot.chat.otel.enabled` 设置时，Copilot Chat 会启用 OTel 发射。将 Copilot 聊天跟踪发送到 LangSmith 的最简单方法是在启动 VS Code 之前导出以下环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export COPILOT_OTEL_ENABLED=true
export COPILOT_OTEL_PROTOCOL=http
export COPILOT_OTEL_ENDPOINT=https://api.smith.langchain.com/otel
export COPILOT_OTEL_CAPTURE_CONTENT=true
export OTEL_EXPORTER_OTLP_HEADERS="x-api-key=<your_langsmith_api_key>,Langsmith-Project=<your_project_name>"
```|变量|描述 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `COPILOT_OTEL_ENABLED` |设置为 `true` 以启用 Copilot Chat OTel 导出。                                                                                                                                                                        |
| `COPILOT_OTEL_PROTOCOL` | OTLP 协议。使用 `http` 定位 LangSmith 的 HTTP OTLP 摄取端点。                                                                                                                                            |
| `COPILOT_OTEL_ENDPOINT` | LangSmith OTLP 端点。优先于`OTEL_EXPORTER_OTLP_ENDPOINT`。                                                                                                                                            || `COPILOT_OTEL_CAPTURE_CONTENT` |捕获跨度上的完整提示、响应、工具参数和工具结果。默认关闭。                                                                                                                              |
| `OTEL_EXPORTER_OTLP_HEADERS` | OTLP 导出器的身份验证标头。使用 `x-api-key=<your_langsmith_api_key>` 和可选的 `Langsmith-Project=<project>` 将跟踪路由到特定的 [LangSmith project](/langsmith/log-traces-to-project)。 |

VS Code 必须继承这些环境变量，因此在启动编辑器之前，请在启动 VS Code 的 shell 会话中导出它们（例如，通过将它们添加到 `~/.zshrc`、`~/.bashrc` 或 shell 配置文件）。

<Note>
  更新自托管安装或区域 SaaS 的 LangSmith 端点：GCP EU 使用 `eu.api.smith.langchain.com`； GCP 亚太地区使用`apac.api.smith.langchain.com`； AWS US 使用`aws.api.smith.langchain.com`。对于自托管 LangSmith，请将 `/api/v1/otel` 附加到您的 LangSmith API URL，例如 `https://ai-company.com/api/v1/otel`。
</Note>

<Warning>
  `COPILOT_OTEL_CAPTURE_CONTENT=true` 记录完整的提示和响应内容、系统提示、工具架构、工具参数和工具结果。仅在可接受捕获源代码、文件内容和用户提示的受信任环境中启用它。
</Warning>

### 替代方案：VS Code 设置如果您不想设置环境变量，则可以从 VS Code 设置中启用 OTel。打开**设置**（`⌘,` / `Ctrl+,`），搜索`copilot otel`，然后配置：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "github.copilot.chat.otel.enabled": true,
  "github.copilot.chat.otel.exporterType": "otlp-http",
  "github.copilot.chat.otel.otlpEndpoint": "https://api.smith.langchain.com/otel",
  "github.copilot.chat.otel.captureContent": true
}
```

身份验证标头仍必须通过 `OTEL_EXPORTER_OTLP_HEADERS` 环境变量提供 - VS Code 设置不会公开标头字段。当两者都设置时，环境变量也优先于 VS Code 设置。

## 在 LangSmith 中查看痕迹

启动 Copilot 聊天会话并发送请求。打开 [LangSmith project](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-with-vscode-copilot) 查看结果轨迹。每个代理交互都会生成一个遵循 [OTel GenAI Semantic Conventions](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/gen-ai/) 的分层生成树：

* `invoke_agent` spans 包含完整的代理编排，包括代理名称、对话 ID、回合数和总令牌使用量。
* `chat` 跨度捕获单个 LLM API 调用，包括模型、令牌计数、响应时间和完成原因。
* `execute_tool` 涵盖捕获工具调用，包括工具名称、类型、持续时间和成功状态。

当代理调用子代理时，Copilot Chat 会自动传播跟踪上下文，因此子代理的 `invoke_agent` 跨度在 LangSmith 中显示为父代理的 `execute_tool` 跨度的子代。

## 故障排除* **LangSmith 中没有出现任何痕迹。** 确认 `COPILOT_OTEL_ENABLED=true` 以及 VS Code 是从导出变量的 shell 启动的。验证 `OTEL_EXPORTER_OTLP_HEADERS` 包含 `x-api-key=<your_langsmith_api_key>` 并且 API 密钥属于您要跟踪的工作区。更改环境变量后重新启动 VS Code。
* **在错误的项目中追踪土地。** 在 `OTEL_EXPORTER_OTLP_HEADERS` 中设置 `Langsmith-Project=<your_project_name>`。如果未设置，跟踪将转到工作区的 `default` 项目。
* **缺少提示和响应。** 内容捕获是可选的。设置`COPILOT_OTEL_CAPTURE_CONTENT=true`（或启用`github.copilot.chat.otel.captureContent`设置）。

## 相关资源

* [VS Code Copilot: Monitor agent usage with OpenTelemetry](https://code.visualstudio.com/docs/copilot/guides/monitoring-agents)
* [Trace with OpenTelemetry](/langsmith/trace-with-opentelemetry)
* [Log traces to a project](/langsmith/log-traces-to-project)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-vscode-copilot.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>