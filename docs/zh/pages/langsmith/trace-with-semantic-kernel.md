<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Semantic Kernel applications | https://docs.langchain.com/langsmith/trace-with-semantic-kernel -->

# 跟踪语义内核应用程序

LangSmith 可以使用其内置的 OpenTelemetry 支持捕获由 [Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/overview/) 生成的跟踪。本指南向您展示如何自动从语义内核应用程序捕获跟踪并将其发送到 LangSmith 进行监控和分析。

## 安装

使用您首选的包管理器安装所需的包：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langsmith semantic-kernel opentelemetry-instrumentation-openai
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langsmith semantic-kernel opentelemetry-instrumentation-openai
  ```
</CodeGroup>

## 设置

### 1.配置环境变量

设置您的 [API keys](/langsmith/create-account-api-key) 和项目名称：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY=<your_langsmith_api_key>
export LANGSMITH_PROJECT=<your_project_name>
export OPENAI_API_KEY=<your_openai_api_key>
```

### 2. 配置 OpenTelemetry 集成

在您的语义内核应用程序中，配置 LangSmith OpenTelemetry 集成以及 OpenAI 仪器：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith.integrations.otel import configure
from opentelemetry.instrumentation.openai import OpenAIInstrumentor

# Configure LangSmith tracing
configure(project_name="semantic-kernel-demo")

# Instrument OpenAI calls
OpenAIInstrumentor().instrument()
```

<Note>
  您不需要设置任何 OpenTelemetry 环境变量或手动配置导出器 — `configure()` 会自动处理一切。
</Note>

### 3. 创建并运行您的语义内核应用程序

配置完成后，您的语义内核应用程序将自动向 LangSmith 发送跟踪：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio
from semantic_kernel import Kernel
from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion
from semantic_kernel.prompt_template import InputVariable, PromptTemplateConfig
from langsmith.integrations.otel import configure
from opentelemetry.instrumentation.openai import OpenAIInstrumentor

# Configure LangSmith tracing
configure(project_name="semantic-kernel-assistant")

# Instrument OpenAI calls
OpenAIInstrumentor().instrument()

# Configure Semantic Kernel
kernel = Kernel()
kernel.add_service(OpenAIChatCompletion())

# Create a prompt template
code_analysis_prompt = """
Analyze the following code and provide insights:

Code: {{$code}}

Please provide:
1. A brief summary of what the code does
2. Any potential improvements
3. Code quality assessment
"""

prompt_template_config = PromptTemplateConfig(
    template=code_analysis_prompt,
    name="code_analyzer",
    template_format="semantic-kernel",
    input_variables=[
        InputVariable(name="code", description="The code to analyze", is_required=True),
    ],
)

# Add the function to the kernel
code_analyzer = kernel.add_function(
    function_name="analyzeCode",
    plugin_name="codeAnalysisPlugin",
    prompt_template_config=prompt_template_config,
)

async def main():
    sample_code = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
    """

    result = await kernel.invoke(code_analyzer, code=sample_code)
    print("Code Analysis:")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
```

## 高级用法

### 自定义元数据和标签

您可以通过设置 span 属性将自定义元数据添加到跟踪中：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

async def analyze_with_metadata(code: str):
    with tracer.start_as_current_span("semantic_kernel_workflow") as span:
        span.set_attribute("langsmith.metadata.workflow_type", "code_analysis")
        span.set_attribute("langsmith.metadata.user_id", "developer_123")
        span.set_attribute("langsmith.span.tags", "semantic-kernel,code-analysis")

        result = await kernel.invoke(code_analyzer, code=code)
        return result
```

### 与其他乐器结合您可以将语义内核跟踪与其他 OpenTelemetry 仪器结合起来：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from opentelemetry.instrumentation.openai import OpenAIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

# Initialize multiple instrumentors
OpenAIInstrumentor().instrument()
HTTPXClientInstrumentor().instrument()
```

## 资源

* [Semantic Kernel documentation](https://learn.microsoft.com/en-us/semantic-kernel/overview/)
* [Semantic Kernel observability guide](https://learn.microsoft.com/en-us/semantic-kernel/concepts/enterprise-readiness/observability/)
* [LangSmith OpenTelemetry guide](/langsmith/trace-with-opentelemetry)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-semantic-kernel.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>