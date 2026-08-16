<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Strands Agents applications | https://docs.langchain.com/langsmith/trace-with-strands-agents -->

# Trace Stress Agents 应用程序

[Strands Agents](https://strandsagents.com/)是一个用于构建模型驱动代理的SDK。 LangSmith 提供 Strands Agents 集成，以 LangSmith 兼容格式导出 Strands OpenTelemetry 跨度，包括代理运行、模型调用、工具调用、提示、完成和令牌使用。

## 安装

安装带有 Strands Agent 支持的 LangSmith：

<CodeGroup>

```bash pip
pip install "langsmith[strands-agents]"
```

```bash uv
uv add "langsmith[strands-agents]"
```

</CodeGroup>

这将安装 LangSmith、Strands Agents、Strands Agents 工具和 OpenTelemetry OTLP HTTP 导出器。

## 设置

### 1.配置环境变量

设置您的 [LangSmith API key](/langsmith/create-account-api-key) 和项目名称。如果您使用 Amazon Bedrock 作为 Strands Agent 的模型提供程序，还可以使用您的首选 AWS 身份验证方法配置 AWS 凭证。

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=https://api.smith.langchain.com/otel/v1/traces
export OTEL_EXPORTER_OTLP_HEADERS="x-api-key=<your_langsmith_api_key>,Langsmith-Project=<your_project_name>"

# Required when using Amazon Bedrock.
export AWS_REGION=<your_aws_region>
```

<Note>
Strands Agents 集成使用标准 OpenTelemetry OTLP 导出器。在调用`setup_langsmith_telemetry()`之前配置LangSmith端点和标头。
</Note>

### 2.启用 Strands Agents 遥测

在创建或调用代理之前，在应用程序启动时调用 `setup_langsmith_telemetry()` 一次：

```python
from langsmith.integrations.strands_agents import setup_langsmith_telemetry

setup_langsmith_telemetry()
```

对于本地调试，传递 `console=True` 也可以将转换后的跨度打印到标准输出：

```python
setup_langsmith_telemetry(console=True)
```

### 3. 创建并运行您的代理

配置完成后，Strands Agent 跟踪会自动导出到 LangSmith：

```python
from langsmith.integrations.strands_agents import setup_langsmith_telemetry
from strands import Agent

setup_langsmith_telemetry()

agent = Agent(
    system_prompt="You are a concise assistant.",
)

response = agent("Explain what LangSmith tracing is in one sentence.")
print(response)
```## 查看LangSmith中的踪迹

运行应用程序后，打开 LangSmith 项目以查看跟踪，其中包括：

- 代理调用跨度
- 事件循环周期跨度
- LLM 通话涵盖提示、完成和令牌使用
- 当您的代理使用工具时，工具调用范围包含工具输入和输出

## 自定义 OTLP 导出器

如果您需要将自定义选项传递给底层 OpenTelemetry 导出器，请使用 `create_langsmith_exporter()` 创建一个 `LangSmithSpanExporter` 并将其手动附加到 Strands 跟踪器提供程序：

```python
from langsmith.integrations.strands_agents import create_langsmith_exporter
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from strands.telemetry import StrandsTelemetry

telemetry = StrandsTelemetry()
exporter = create_langsmith_exporter(
    endpoint="https://api.smith.langchain.com/otel/v1/traces",
    headers={
        "x-api-key": "<your_langsmith_api_key>",
        "Langsmith-Project": "<your_project_name>",
    },
)
telemetry.tracer_provider.add_span_processor(BatchSpanProcessor(exporter))
```

当您想要在代码中而不是环境变量中配置导出器选项时，请使用此方法。

## 资源

- [Strands Agents documentation](https://strandsagents.com/)
- [LangSmith OpenTelemetry guide](/langsmith/trace-with-opentelemetry)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-strands-agents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>