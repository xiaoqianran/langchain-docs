<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace CrewAI agents | https://docs.langchain.com/langsmith/trace-with-crewai -->

# Trace CrewAI 代理

LangSmith 可以使用 OpenTelemetry 仪器捕获 [CrewAI](https://github.com/crewAIInc/crewAI) 生成的痕迹。本指南向您展示如何自动从 CrewAI 多代理工作流程捕获跟踪并将其发送到 LangSmith 进行监控和分析。

> [!注意]
>
> 在发送跟踪之前，在[agent-based workspace](/langsmith/agents)、[create an agent](/langsmith/create-an-agent) 中进行一次。使用[agent addressing](/langsmith/log-traces-to-agent)选择其标识符和环境。如果集成需要 `project_name`，请使用所选环境的 [⟦T8⟧](/langsmith/create-an-agent#use-an-environment-project) 作为兼容性值。

## 安装

使用您首选的包管理器安装所需的包：

```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install langsmith crewai opentelemetry-instrumentation-crewai opentelemetry-instrumentation-openai
```

```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv add langsmith crewai opentelemetry-instrumentation-crewai opentelemetry-instrumentation-openai
```

## 设置

### 1.配置环境变量

设置您的 [API keys](/langsmith/create-account-api-key)、代理标识符和环境：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY=<your_langsmith_api_key>
export LANGSMITH_AGENT_ID="<your-agent-id>"
export LANGSMITH_AGENT_ENVIRONMENT="production"
export OPENAI_API_KEY=<your_openai_api_key>
```

### 2. 配置 OpenTelemetry 集成

在您的 CrewAI 代理中，配置 LangSmith OpenTelemetry 集成以及 CrewAI 和 OpenAI 仪器：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith.integrations.otel import OtelSpanProcessor
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.instrumentation.crewai import CrewAIInstrumentor
from opentelemetry.instrumentation.openai import OpenAIInstrumentor

# Get or create tracer provider
current_provider = trace.get_tracer_provider()
if isinstance(current_provider, TracerProvider):
    tracer_provider = current_provider
else:
    tracer_provider = TracerProvider()
    trace.set_tracer_provider(tracer_provider)

# Add OtelSpanProcessor to the tracer provider
tracer_provider.add_span_processor(OtelSpanProcessor())

# Instrument CrewAI and OpenAI
CrewAIInstrumentor().instrument(tracer_provider=tracer_provider)
OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)
```

### 3. 创建并运行您的 CrewAI 代理

配置完成后，您的 CrewAI 代理将自动将跟踪发送到 LangSmith：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from crewai import Agent, Crew, Task
from crewai.llm import LLM
from langsmith.integrations.otel import OtelSpanProcessor
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.instrumentation.crewai import CrewAIInstrumentor
from opentelemetry.instrumentation.openai import OpenAIInstrumentor

# Configure OpenTelemetry
current_provider = trace.get_tracer_provider()
if isinstance(current_provider, TracerProvider):
    tracer_provider = current_provider
else:
    tracer_provider = TracerProvider()
    trace.set_tracer_provider(tracer_provider)

tracer_provider.add_span_processor(OtelSpanProcessor())

# Instrument CrewAI and OpenAI
CrewAIInstrumentor().instrument(tracer_provider=tracer_provider)
OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)

# Define your agent
llm = LLM(model="gpt-6-luna")

coder = Agent(
    role="Software developer",
    goal="Write clear, concise code on demand",
    backstory="An expert coder with a keen eye for software trends.",
    verbose=True,
    llm=llm,
)

# Define your task
task = Task(
    description="Write a Python function that checks if a number is prime.",
    expected_output="A clear and concise Python function with documentation.",
    agent=coder,
)

# Create and run the crew
crew = Crew(
    agents=[coder],
    tasks=[task],
    verbose=True,
)

def run_crew():
    result = crew.kickoff()
    return result

if __name__ == "__main__":
    output = run_crew()
    print(output)
```

## 高级用法

### 自定义元数据和标签

您可以通过设置 span 属性将自定义元数据添加到跟踪中：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

def run_crew_with_metadata():
    with tracer.start_as_current_span("crewai_workflow") as span:
        span.set_attribute("langsmith.metadata.crew_type", "code_generation")
        span.set_attribute("langsmith.metadata.agent_count", "1")
        span.set_attribute("langsmith.span.tags", "crewai,code-generation")

        result = crew.kickoff()
        return result
```

### 与其他乐器结合您可以将 CrewAI 仪器与其他 OpenTelemetry 仪器结合起来：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from opentelemetry.instrumentation.crewai import CrewAIInstrumentor
from opentelemetry.instrumentation.openai import OpenAIInstrumentor

# Initialize multiple instrumentors
CrewAIInstrumentor().instrument(tracer_provider=tracer_provider)
OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)
```

## 资源

* [CrewAI documentation](https://docs.crewai.com/)
* [LangSmith OpenTelemetry guide](/langsmith/trace-with-opentelemetry)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-crewai.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。