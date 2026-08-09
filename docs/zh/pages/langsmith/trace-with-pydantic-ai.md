<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace PydanticAI applications | https://docs.langchain.com/langsmith/trace-with-pydantic-ai -->

# 跟踪 PydanticAI 应用程序

LangSmith 可以使用其内置的 OpenTelemetry 仪器捕获 PydanticAI 生成的痕迹。本指南向您展示如何自动捕获来自 PydanticAI 代理的跟踪并将其发送到 LangSmith 进行监控和分析。

## 安装

安装所需的软件包：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langsmith pydantic-ai opentelemetry-exporter-otlp
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langsmith pydantic-ai opentelemetry-exporter-otlp
  ```
</CodeGroup>

<Info>
  需要 LangSmith Python SDK 版本 `langsmith>=0.4.26` 以获得最佳 OpenTelemetry 支持。
</Info>

## 设置

### 1.配置环境变量

设置您的 [API keys](/langsmith/create-account-api-key) 和项目名称：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY=<your_langsmith_api_key>
export LANGSMITH_PROJECT=<your_project_name>
export OPENAI_API_KEY=<your_openai_api_key>
```

### 2. 配置 OpenTelemetry 集成

在您的 PydanticAI 应用程序中，配置 LangSmith OpenTelemetry 集成：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith.integrations.otel import configure
from pydantic_ai import Agent

# Configure LangSmith tracing
configure(project_name="pydantic-ai-demo")

# Instrument all PydanticAI agents
Agent.instrument_all()
```

<Note>
  您不需要设置任何 OpenTelemetry 环境变量或手动配置导出器 — `configure()` 会自动处理一切。
</Note>

### 3. 创建并运行您的 PydanticAI 代理

配置完成后，您的 PydanticAI 代理将自动向 LangSmith 发送跟踪：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith.integrations.otel import configure
from pydantic_ai import Agent

# Configure LangSmith tracing
configure(project_name="pydantic-ai-demo")

# Instrument all PydanticAI agents
Agent.instrument_all()

# Create and run an agent
agent = Agent('openai:gpt-5.5')
result = agent.run_sync('What is the capital of France?')
print(result.output)
#> Paris
```

## 高级用法

### 自定义元数据和标签

您可以使用 OpenTelemetry span 属性将自定义元数据添加到跟踪中：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from opentelemetry import trace
from pydantic_ai import Agent
from langsmith.integrations.otel import configure

configure(project_name="pydantic-ai-metadata")
Agent.instrument_all()

tracer = trace.get_tracer(__name__)

agent = Agent('openai:gpt-5.5')

with tracer.start_as_current_span("pydantic_ai_workflow") as span:
    span.set_attribute("langsmith.metadata.user_id", "user_123")
    span.set_attribute("langsmith.metadata.workflow_type", "question_answering")
    span.set_attribute("langsmith.span.tags", "pydantic-ai,production")

    result = agent.run_sync('Explain quantum computing in simple terms')
    print(result.output)
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-pydantic-ai.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>