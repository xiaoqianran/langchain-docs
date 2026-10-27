<!-- langchain-docs: Trace with Strands Agents | https://docs.langchain.com/langsmith/trace-with-strands-agents -->

# Trace with Strands Agents

Trace with Strands Agents with LangSmith.

[Strands Agents](https://strandsagents.com/) is an SDK for building model-driven agents. LangSmith provides a Strands Agents integration that exports Strands OpenTelemetry spans in a LangSmith-compatible format, including agent runs, model calls, tool calls, prompts, completions, and token usage.

> [!NOTE]
>
> In an [agent-based workspace](/langsmith/agents), [create an agent](/langsmith/create-an-agent) once before sending traces. Use [agent addressing](/langsmith/log-traces-to-agent) to select its identifier and environment. If an integration requires `project_name`, use the selected environment's [`tracer_session_name`](/langsmith/create-an-agent#use-an-environment-project) as a compatibility value.

## Installation

Install LangSmith with Strands Agents support:

```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install "langsmith[strands-agents]"
```

```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv add "langsmith[strands-agents]"
```

This installs LangSmith, Strands Agents, Strands Agents tools, and the OpenTelemetry OTLP HTTP exporter.

## Setup

### 1. Configure environment variables

Set your [LangSmith API key](/langsmith/create-account-api-key) and the agent identifier and environment. If you use Amazon Bedrock as the model provider for Strands Agents, also configure AWS credentials with your preferred AWS authentication method.

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://api.smith.langchain.com/otel/v1/traces
export OTEL_EXPORTER_OTLP_HEADERS="x-api-key=<your_langsmith_api_key>,Langsmith-Agent-Id=<your-agent-id>,Langsmith-Agent-Environment=production"

# Required when using Amazon Bedrock.
export AWS_REGION=<your_aws_region>
```

> [!NOTE]
>
> The Strands Agents integration uses the standard OpenTelemetry OTLP exporter. Configure the LangSmith endpoint and headers before calling `setup_langsmith_telemetry()`.

### 2. Enable Strands Agents telemetry

Call `setup_langsmith_telemetry()` once when your process starts, before creating or invoking agents:

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith.integrations.strands_agents import setup_langsmith_telemetry

setup_langsmith_telemetry()
```

For local debugging, pass `console=True` to also print transformed spans to stdout:

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
setup_langsmith_telemetry(console=True)
```

### 3. Create and run your agent

Once configured, Strands Agents traces are exported to LangSmith automatically:

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith.integrations.strands_agents import setup_langsmith_telemetry
from strands import Agent

setup_langsmith_telemetry()

agent = Agent(
    system_prompt="You are a concise assistant.",
)

response = agent("Explain what LangSmith tracing is in one sentence.")
print(response)
```

## View traces in LangSmith

After running your agent, select your agent and environment in LangSmith, then open **Tracing** to view traces that include:

* Agent invocation spans
* Event loop cycle spans
* LLM call spans with prompts, completions, and token usage
* Tool call spans with tool inputs and outputs when your agent uses tools

## Customize the OTLP exporter

If you need to pass custom options to the underlying OpenTelemetry exporter, create a `LangSmithSpanExporter` with `create_langsmith_exporter()` and attach it to the Strands tracer provider manually:

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith.integrations.strands_agents import create_langsmith_exporter
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from strands.telemetry import StrandsTelemetry

telemetry = StrandsTelemetry()
exporter = create_langsmith_exporter(
    endpoint="https://api.smith.langchain.com/otel/v1/traces",
    headers={
        "x-api-key": "<your_langsmith_api_key>",
        "Langsmith-Agent-Id": "<your-agent-id>",
        "Langsmith-Agent-Environment": "production",
    },
)
telemetry.tracer_provider.add_span_processor(BatchSpanProcessor(exporter))
```

Use this approach when you want to configure exporter options in code instead of environment variables.

## Resources

* [Strands Agents documentation](https://strandsagents.com/)
* [LangSmith OpenTelemetry guide](/langsmith/trace-with-opentelemetry)

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-strands-agents.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).