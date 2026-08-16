<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Microsoft Agent Framework applications | https://docs.langchain.com/langsmith/trace-with-microsoft-agent-framework -->

# 跟踪 Microsoft Agent Framework 应用程序

LangSmith 可以使用其内置的 OpenTelemetry 仪器捕获 [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/overview/agent-framework-overview) 生成的轨迹。本指南向您展示如何自动捕获来自 Microsoft Agent Framework 代理的跟踪并将其发送到 LangSmith 进行监控和分析。

## 安装

安装所需的软件包：

<CodeGroup>

```bash pip
pip install agent-framework opentelemetry-exporter-otlp-proto-http
```

```bash uv
uv add agent-framework opentelemetry-exporter-otlp-proto-http
```

</CodeGroup>

## 设置

### 1.配置环境变量

启用代理的 OpenTelemetry 检测并将 OpenTelemetry 环境变量设置为指向 LangSmith OTEL 端点：

```bash
export ENABLE_INSTRUMENTATION=true
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_ENDPOINT=https://api.smith.langchain.com/otel/v1/traces
export OTEL_EXPORTER_OTLP_HEADERS="x-api-key=<your_langsmith_api_key>,Langsmith-Project=<your_project_name>"
```

### 2. 在您的应用程序中启用 OpenTelemetry

在您的 Microsoft Agent Framework 应用程序中，使用内置 `configure_otel_providers` 函数启用 OpenTelemetry 跟踪：

```python
from agent_framework.observability import configure_otel_providers

# Enable OpenTelemetry tracing
configure_otel_providers(enable_sensitive_data=True)
```

<Note>
设置 `enable_sensitive_data=True` 允许捕获跟踪中的输入和输出内容。如果您想从跟踪中排除敏感数据，请设置为 `False`。
</Note>

### 3. 创建并运行您的代理

配置完成后，您的 Microsoft Agent Framework 代理将自动将跟踪发送到 LangSmith：

```python
from agent_framework import ChatAgent
from agent_framework.observability import configure_otel_providers
from agent_framework.openai import OpenAIChatClient

# Enable OpenTelemetry tracing
configure_otel_providers(enable_sensitive_data=True)


agent = ChatAgent(
    chat_client=OpenAIChatClient(model_id="gpt-4o"),
)

result = await agent.run("What's the capital of Bavaria?")
print(result.text)
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-microsoft-agent-framework.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>