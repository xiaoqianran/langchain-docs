<!-- langchain-docs: Redact sensitive data with the OpenTelemetry Gateway architecture | https://docs.langchain.com/langsmith/otel-gateway-trace-redaction -->

# Redact sensitive data with the OpenTelemetry Gateway architecture

Use an OpenTelemetry collector to redact sensitive data from traces before they land in LangSmith.

Agents built with [LangChain](/langsmith/trace-with-langchain), [LangGraph](/langsmith/trace-with-langgraph), or [Deep Agents](/langsmith/trace-deep-agents) support [OpenTelemetry-based tracing](/langsmith/trace-with-opentelemetry). Instead of sending traces directly to LangSmith, you can route them through an OpenTelemetry collector you control, apply redaction rules to strip sensitive fields, and forward the sanitized traces to LangSmith.

Traces flow from your agent to the collector over OTLP/HTTP. The collector runs a transform processor that redacts sensitive span attributes, such as prompt inputs and model completions, before forwarding the sanitized spans to the LangSmith API.

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
flowchart TD
    A["Agent code<br/>(LangChain / LangGraph / Deep Agents)"]

    subgraph collector[":4318"]
        B["Receiver<br/>OTLP/HTTP"]
        C["Transform Processor<br/>PII Redaction<br/>(email, phone, SSN, CC)"]
        D["OTLP/HTTP Exporter"]
        B --> C --> D
    end

    E["LangSmith API<br/>api.smith.langchain.com"]

    A -->|"OTLP/HTTP"| B
    D -->|"OTLP/HTTP"| E
```

> [!NOTE]
>
> In an [agent-based workspace](/langsmith/agents), [create an agent](/langsmith/create-an-agent) once before sending traces. Use [agent addressing](/langsmith/log-traces-to-agent) to select its identifier and environment. If an integration requires `project_name`, use the selected environment's [`tracer_session_name`](/langsmith/create-an-agent#use-an-environment-project) as a compatibility value.

## Prerequisites

Both of the following approaches require the following environment variables. Set `OTEL_EXPORTER_OTLP_ENDPOINT` to the address of your collector:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LANGSMITH_OTEL_ENABLED="true"
LANGSMITH_TRACING="true"
LANGSMITH_OTEL_ONLY="true"
LANGSMITH_AGENT_ID="<your-agent-id>"
LANGSMITH_AGENT_ENVIRONMENT="production"
OTEL_EXPORTER_OTLP_ENDPOINT="http://<my-otel-collector-endpoint>:4318"
```

For destination configuration, refer to [Log traces to an agent](/langsmith/log-traces-to-agent).

> [!NOTE]
>
> **Agent-based workspaces.** Send OTLP traces to a registered agent and environment with both of the following headers:
>
> * **`Langsmith-Agent-Id`**: The identifier of the agent. It must be 1 to 63 lowercase letters, digits, or hyphens, start with a letter, and end with a letter or digit. [Create the agent](/langsmith/create-an-agent) before configuring the exporter. An archived agent still holds its identifier, so LangSmith rejects a request sent to it with a `409`.
> * **`Langsmith-Agent-Environment`**: The environment the traces belong to. One of `local`, `development`, `staging`, or `production`.
>
> For example, set `OTEL_EXPORTER_OTLP_HEADERS="x-api-key=<your langsmith api key>,Langsmith-Agent-Id=<agent id>,Langsmith-Agent-Environment=<environment>"`. With `langsmith>=0.14.9`, the Python SDK's OpenTelemetry exporter sets both headers from `LANGSMITH_AGENT_ID` and `LANGSMITH_AGENT_ENVIRONMENT` when `OTEL_EXPORTER_OTLP_HEADERS` is unset. With the TypeScript SDK or another OpenTelemetry exporter, set the headers yourself.
>
> In project-based workspaces, including self-hosted LangSmith, use `Langsmith-Project` instead of the two agent headers.
>
> The headers apply to every span in the request. Send both headers or neither: LangSmith rejects a request that sets one without the other, or that sets either alongside `Langsmith-Project`, with a `400` error. On [self-hosted](/langsmith/self-hosted) LangSmith, where agent-based workspaces are not available, LangSmith rejects the request with a `403` error and the message `agent addressing is not enabled for this workspace`. Span attributes, including `gen_ai.agent.name`, do not send traces to an agent. For how sending traces to an agent works, see [Log traces to an agent](/langsmith/log-traces-to-agent).

## Configure the collector

Both approaches also require an OpenTelemetry collector running as an intermediary between your agent and LangSmith. The following configuration sets up an OTLP receiver on port `4318`, a transform processor that redacts the `gen_ai.prompt` and `gen_ai.completion` span attributes, and an exporter that forwards the sanitized traces to the LangSmith API:

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318


processors:
  transform/redact:
    error_mode: ignore
    trace_statements:
      - context: span
        statements:
          - replace_pattern(attributes["gen_ai.completion"], "[\\s\\S]*", "[REDACTED]")
          - replace_pattern(attributes["gen_ai.prompt"], "[\\s\\S]*", "[REDACTED]")

exporters:
  otlphttp/langsmith:
    traces_endpoint: "https://api.smith.langchain.com/otel/v1/traces"
    headers:
      x-api-key: "${env:LANGSMITH_API_KEY}"
      Langsmith-Agent-Id: "${env:LANGSMITH_AGENT_ID}"
      Langsmith-Agent-Environment: "${env:LANGSMITH_AGENT_ENVIRONMENT}"
      x-Tenant-Id: "${env:LANGSMITH_TENANT_ID}" # Required if API key is not scoped to a specific workspace


service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [transform/redact]
      exporters: [otlphttp/langsmith]
```

## Trace with LangChain, LangGraph, or Deep Agents

Use this approach if your agent already uses [LangChain](/langsmith/trace-with-langchain), [LangGraph](/langsmith/trace-with-langgraph), or [Deep Agents](/langsmith/trace-deep-agents). The tracing integration handles span creation automatically based on your environment variables, so no additional instrumentation code is required:

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI


@tool
def tell_joke(topic: str) -> str:
   llm = ChatOpenAI()
   response = llm.invoke(f"Tell me a short, funny joke about {topic}.")
   return response.content


agent = create_agent(
   model=ChatOpenAI(),
   tools=[tell_joke],
   system_prompt="When the user asks for jokes, use the tell_joke tool for each topic.",
)


topics = ["programming", "python", "kubernetes", "machine learning"]


result = agent.invoke(
   {"messages": [{"role": "user", "content": f"Tell me jokes about these topics: {', '.join(topics)}"}]}
)


print(result["messages"][-1].content)
```

## Trace with the OpenTelemetry SDK directly

Use this approach if you need programmatic control over the tracer provider and exporter. For example, to set agent destinations or configure custom headers at runtime. You configure the provider explicitly in code rather than relying on environment variables alone:

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os

from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor


agent_id = os.environ["LANGSMITH_AGENT_ID"]
agent_environment = os.environ["LANGSMITH_AGENT_ENVIRONMENT"]
otlp_endpoint = os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"]


provider = TracerProvider()
provider.add_span_processor(
   BatchSpanProcessor(
       OTLPSpanExporter(
           endpoint=otlp_endpoint+"/v1/traces",
           headers={
               "Langsmith-Agent-Id": agent_id,
               "Langsmith-Agent-Environment": agent_environment,
           },
       )
   )
)
trace.set_tracer_provider(provider)


chain = ChatPromptTemplate.from_template("Tell me a joke about {topic}") | ChatOpenAI()


for topic in ["programming", "python", "databases", "kubernetes", "machine learning"]:
   print(f"Asking about {topic}...")
   result = chain.invoke({"topic": topic})
   print(f"  {result.content[:100]}\n")


provider.force_flush()
provider.shutdown()
```

> [!NOTE]
>
> If you prefer to redact sensitive data without routing through a collector, see [Prevent logging of sensitive data in traces](/langsmith/mask-inputs-outputs).

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/otel-gateway-trace-redaction.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).