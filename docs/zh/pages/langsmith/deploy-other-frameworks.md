<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy other frameworks | https://docs.langchain.com/langsmith/deploy-other-frameworks -->

# 部署其他框架

LangSmith 部署运行任何框架。对于不是基于 Deep Agents、LangChain 或 LangGraph 构建的代理，请使用 [⟦T38⟧](https://pypi.org/project/deployments-wrap-sdk/) 包 (Google ADK) 或 [LangGraph Functional API](/oss/python/langgraph/functional-api)（Claude Agent SDK、Strands、CrewAI、AutoGen 和其他库）进行部署。

<Tip>
对于新构建，请考虑[Deep Agents](/oss/python/deepagents/overview)，这是一种开源工具，用于规划、使用工具、委托给子代理并长期工作。 Deep Agents 直接部署到 LangSmith 部署，[Managed Deep Agents](/langsmith/python/managed-deep-agents-overview) 可用于完全托管的运行时。
</Tip>

## 支持的框架

本指南中的以下框架包含端到端示例。每个示例从 `agent.py` 导出LangGraph 兼容图，[Agent Server](/langsmith/agent-server) 可以提供服务：

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
    <a href="#general-deployment-pattern" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/claude.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/claude.svg" alt="" noZoom />
        <span className="font-semibold">克劳德代理SDK</span>
    </a>

    <a href="#general-deployment-pattern" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/bedrock.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/bedrock.svg" alt="" noZoom />
        <span className="font-semibold">股线代理</span>
    </a>

    <a href="#general-deployment-pattern" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/crewai.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/crewai.svg" alt="" noZoom />
        <span className="font-semibold">CrewAI</span>
    </a>

    <a href="#general-deployment-pattern" className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 no-underline ">
        <img className="block dark:hidden w-5 h-5" src="/images/providers/light/autogen.svg" alt="" noZoom />
        <img className="hidden dark:block w-5 h-5" src="/images/providers/dark/autogen.svg" alt="" noZoom />
        <span className="font-semibold">AutoGen</span>
    </a>
</div><Note>
没有看到您的框架？功能 API 接受任何可调用，因此您可以将以下示例中显示的相同模式应用于任何代理库。用 `@task` 和 `@entrypoint` 包装代理的入口点，然后部署。
</Note>

## 函数式 API 的工作原理

当功能 API 包装代理的运行到达代理服务器时：

1. 平台使用运行输入和同一线程上先前回合中保存的任何状态（作为 `previous` 参数传递）来调用 `@entrypoint` 修饰的 `agent` 函数。
2. 入口点调用 `@task` 修饰的函数，该函数委托给框架代理（Claude Agent SDK、Strands、CrewAI、AutoGen 或其他库）。
3. 入口点返回`entrypoint.final(value=..., save=...)`。 `value` 是本回合的响应； `save` 是在下一回合用作 `previous` 的检查点状态。
4. 代理服务器保留检查点，在支持时流式传输部分输出，并在配置跟踪时记录跟踪。

此模式保留框架的执行语义，同时为您提供标准代理服务器功能：持久运行、多线程持久性、流端点和LangSmith可观察性。

## 先决条件

无论采用何种框架，您都需要：* 用于功能 API 框架的 Python 3.10+（Strands Agents 支持 Python 3.9+）
* [LangSmith API key](/langsmith/create-account-api-key)

## 通用部署模式

对每个框架执行相同的步骤。在每个步骤内的选项卡中选择堆栈，将片段合并到一个模块中（例如 `agent.py`），然后将 `@entrypoint` 修饰的函数导出为名为 `agent` 的模块级变量。 [end-to-end example](#end-to-end-example) 部分显示您可以复制的完整文件。

<Steps>
<Step title="Install dependencies">

为您的框架安装Python包以及LangGraph和LangSmith。

<Tabs>
<Tab title="Claude Agent SDK">

对于[Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview)：

```bash
pip install "langsmith[claude-agent-sdk]" langgraph "langgraph-cli[inmem]"
```

在您的环境中设置`ANTHROPIC_API_KEY`。对于Anthropic API 密钥，请参阅[Claude console](https://claude.ai/login)。

</Tab>
<Tab title="Strands Agents">

对于[Strands Agents](https://strandsagents.com/latest/documentation/docs/)：

```bash
pip install strands-agents strands-agents-tools langgraph "langsmith[strands-agents]" "langgraph-cli[inmem]"
```

如果您使用 Amazon Bedrock 作为模型提供程序，请配置 AWS 凭证。

</Tab>
<Tab title="CrewAI">

对于[CrewAI](https://docs.crewai.com/)：

```bash
pip install crewai langgraph langsmith opentelemetry-instrumentation-crewai opentelemetry-instrumentation-openai "langgraph-cli[inmem]"
```

在您的环境中设置 LLM 提供商凭据（例如，如果您使用 OpenAI 支持的模型，则为 `OPENAI_API_KEY`）。

</Tab>
<Tab title="AutoGen">

对于[AutoGen](https://microsoft.github.io/autogen/)：

```bash
pip install autogen-agentchat autogen-ext langgraph langsmith opentelemetry-instrumentation-openai "langgraph-cli[inmem]"
```

在您的环境中设置`OPENAI_API_KEY`（或您的模型提供商凭据）。

</Tab>
</Tabs>

</Step>
<Step title="Define your agent">

使用您选择的框架构建代理，就像在 LangSmith 之外一样。

<Tabs>
<Tab title="Claude Agent SDK">

```python
from claude_agent_sdk import ClaudeAgentOptions

options = ClaudeAgentOptions(
    model="claude-sonnet-4-6",
    system_prompt="You are a helpful assistant.",
)
```

</Tab>
<Tab title="Strands Agents">

```python
from strands import Agent

strands_agent = Agent(
    system_prompt="You are a helpful assistant.",
    model="us.anthropic.claude-sonnet-4-20250514-v1:0",
)
```

</Tab>
<Tab title="CrewAI">

```python
from crewai import Agent as CrewAgent, Crew, Task

researcher = CrewAgent(role="Researcher", goal="Research a topic", backstory="Expert researcher.")
crew = Crew(
    agents=[researcher],
    tasks=[Task(description="{topic}", agent=researcher, expected_output="A short report.")],
)
```

</Tab>
<Tab title="AutoGen">

```python
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient

assistant = AssistantAgent(
    name="assistant",
    model_client=OpenAIChatCompletionClient(model="gpt-4o"),
)
```

</Tab>
</Tabs>

</Step>
<Step title="Wrap with the Functional API">通过名为 `agent` 的 `@entrypoint` 修饰函数公开您的代理。在内部，使用 `@task` 作为调用框架的工作单元。使用 `entrypoint.final()` 返回响应并在同一线程上跨轮次保存对话历史记录。

<Tabs>
<Tab title="Claude Agent SDK">

```python
import operator

from claude_agent_sdk import ClaudeSDKClient
from langgraph.func import entrypoint, task

@task
async def invoke_claude(prompt: str) -> str:
    async with ClaudeSDKClient(options=options) as client:
        await client.query(prompt)
        chunks: list[str] = []
        async for message in client.receive_response():
            chunks.append(str(message))
        return "\n".join(chunks)

@entrypoint()
async def agent(messages: list[dict], previous: list[dict] | None = None):
    history = operator.add(previous or [], messages)
    prompt = history[-1]["content"]
    response = await invoke_claude(prompt)
    new_message = {"role": "assistant", "content": response}
    return entrypoint.final(
        value=[new_message],
        save=operator.add(history, [new_message]),
    )
```

</Tab>
<Tab title="Strands Agents">

```python
import operator

from langgraph.func import entrypoint, task
from strands.types.content import Message

@task
def invoke_strands(messages: list[Message]):
    result = strands_agent(messages)
    return [result.message]

@entrypoint()
def agent(messages: list[Message], previous: list[Message] | None = None):
    messages = operator.add(previous or [], messages)
    response = invoke_strands(messages).result()
    return entrypoint.final(value=response, save=operator.add(messages, response))
```

</Tab>
<Tab title="CrewAI">

```python
import operator

from langgraph.func import entrypoint, task

@task
def run_crew(topic: str) -> str:
    return str(crew.kickoff(inputs={"topic": topic}))

@entrypoint()
def agent(messages: list[dict], previous: list[dict] | None = None):
    history = operator.add(previous or [], messages)
    response = run_crew(history[-1]["content"]).result()
    new_message = {"role": "assistant", "content": response}
    return entrypoint.final(value=[new_message], save=operator.add(history, [new_message]))
```

</Tab>
<Tab title="AutoGen">

```python
import operator

from langgraph.func import entrypoint, task

@task
async def invoke_autogen(prompt: str) -> str:
    result = await assistant.run(task=prompt)
    return result.messages[-1].content

@entrypoint()
async def agent(messages: list[dict], previous: list[dict] | None = None):
    history = operator.add(previous or [], messages)
    response = await invoke_autogen(history[-1]["content"])
    new_message = {"role": "assistant", "content": response}
    return entrypoint.final(value=[new_message], save=operator.add(history, [new_message]))
```

</Tab>
</Tabs>

</Step>
<Step title="Configure tracing" id="configure-tracing">

将框架的本机跟踪转发到LangSmith。在创建或调用代理之前，在应用程序启动时调用跟踪设置一次。

<Tabs>
<Tab title="Claude Agent SDK">

```python
from langsmith.integrations.claude_agent_sdk import configure_claude_agent_sdk

configure_claude_agent_sdk()
```

有关完整设置的详细信息，请参阅[Trace Claude Agent SDK applications](/langsmith/trace-claude-agent-sdk)。

</Tab>
<Tab title="Strands Agents">

设置您的 [LangSmith API key](/langsmith/create-account-api-key) 和项目名称。如果您使用 Amazon Bedrock，还需配置 AWS 凭证。

```python
from langsmith.integrations.strands_agents import setup_langsmith_telemetry

setup_langsmith_telemetry()
```

<Note>
如果您是 [self-hosting LangSmith](/langsmith/self-hosted)，请为您的部署配置 OpenTelemetry OTLP 端点和标头。参见[Trace Strands Agents applications](/langsmith/trace-with-strands-agents)。
</Note>

<Note>
Strands 的 OTel 跟踪包含同步代码。部署到代理服务器时，您可能需要设置`BG_JOB_ISOLATED_LOOPS=true`。参见[⟦T61⟧](/langsmith/env-var#bg_job_isolated_loops)。
</Note>

有关完整设置详细信息，请参阅[Trace Strands Agents applications](/langsmith/trace-with-strands-agents)。

</Tab>
<Tab title="CrewAI">

使用 CrewAI 和 OpenAI 仪器注册 LangSmith span 处理器：

```python
from langsmith.integrations.otel import OtelSpanProcessor
from opentelemetry import trace
from opentelemetry.instrumentation.crewai import CrewAIInstrumentor
from opentelemetry.instrumentation.openai import OpenAIInstrumentor
from opentelemetry.sdk.trace import TracerProvider

current_provider = trace.get_tracer_provider()
if isinstance(current_provider, TracerProvider):
    tracer_provider = current_provider
else:
    tracer_provider = TracerProvider()
    trace.set_tracer_provider(tracer_provider)

tracer_provider.add_span_processor(OtelSpanProcessor())
CrewAIInstrumentor().instrument(tracer_provider=tracer_provider)
OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)
```

有关完整设置详细信息，请参阅[Trace CrewAI applications](/langsmith/trace-with-crewai)。

</Tab>
<Tab title="AutoGen">

将 LangSmith span 处理器注册到 OpenAI 仪器：

```python
from langsmith.integrations.otel import OtelSpanProcessor
from opentelemetry import trace
from opentelemetry.instrumentation.openai import OpenAIInstrumentor
from opentelemetry.sdk.trace import TracerProvider

tracer_provider = TracerProvider()
tracer_provider.add_span_processor(OtelSpanProcessor())
trace.set_tracer_provider(tracer_provider)
OpenAIInstrumentor().instrument()
```有关完整设置详细信息，请参阅[Trace AutoGen applications](/langsmith/trace-with-autogen)。

</Tab>
</Tabs>

</Step>
</Steps>

## 端到端示例

以下示例将代理定义、功能 API 包装、跟踪设置以及 `agent` 符号的导出结合到单个 `agent.py` 文件中。选择适合您的框架的选项卡。

<Tabs>
<Tab title="Claude Agent SDK">

```python agent.py
import operator

from claude_agent_sdk import ClaudeAgentOptions, ClaudeSDKClient
from langgraph.func import entrypoint, task
from langsmith.integrations.claude_agent_sdk import configure_claude_agent_sdk

configure_claude_agent_sdk()

options = ClaudeAgentOptions(
    model="claude-sonnet-4-6",
    system_prompt="You are a helpful assistant.",
)

@task
async def invoke_claude(prompt: str) -> str:
    async with ClaudeSDKClient(options=options) as client:
        await client.query(prompt)
        chunks: list[str] = []
        async for message in client.receive_response():
            chunks.append(str(message))
        return "\n".join(chunks)

@entrypoint()
async def agent(messages: list[dict], previous: list[dict] | None = None):
    history = operator.add(previous or [], messages)
    prompt = history[-1]["content"]
    response = await invoke_claude(prompt)
    new_message = {"role": "assistant", "content": response}
    return entrypoint.final(
        value=[new_message],
        save=operator.add(history, [new_message]),
    )
```

</Tab>
<Tab title="Strands Agents">

```python agent.py
import operator

from langgraph.func import entrypoint, task
from langsmith.integrations.strands_agents import setup_langsmith_telemetry
from strands import Agent
from strands.types.content import Message

setup_langsmith_telemetry()

strands_agent = Agent(
    system_prompt="You are a helpful assistant.",
    model="us.anthropic.claude-sonnet-4-20250514-v1:0",
)

@task
def invoke_strands(messages: list[Message]):
    result = strands_agent(messages)
    return [result.message]

@entrypoint()
def agent(messages: list[Message], previous: list[Message] | None = None):
    messages = operator.add(previous or [], messages)
    response = invoke_strands(messages).result()
    return entrypoint.final(value=response, save=operator.add(messages, response))
```

</Tab>
<Tab title="CrewAI">

```python agent.py
import operator

from crewai import Agent as CrewAgent, Crew, Task
from langgraph.func import entrypoint, task
from langsmith.integrations.otel import OtelSpanProcessor
from opentelemetry import trace
from opentelemetry.instrumentation.crewai import CrewAIInstrumentor
from opentelemetry.instrumentation.openai import OpenAIInstrumentor
from opentelemetry.sdk.trace import TracerProvider

current_provider = trace.get_tracer_provider()
if isinstance(current_provider, TracerProvider):
    tracer_provider = current_provider
else:
    tracer_provider = TracerProvider()
    trace.set_tracer_provider(tracer_provider)

tracer_provider.add_span_processor(OtelSpanProcessor())
CrewAIInstrumentor().instrument(tracer_provider=tracer_provider)
OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)

researcher = CrewAgent(role="Researcher", goal="Research a topic", backstory="Expert researcher.")
crew = Crew(
    agents=[researcher],
    tasks=[Task(description="{topic}", agent=researcher, expected_output="A short report.")],
)

@task
def run_crew(topic: str) -> str:
    return str(crew.kickoff(inputs={"topic": topic}))

@entrypoint()
def agent(messages: list[dict], previous: list[dict] | None = None):
    history = operator.add(previous or [], messages)
    response = run_crew(history[-1]["content"]).result()
    new_message = {"role": "assistant", "content": response}
    return entrypoint.final(value=[new_message], save=operator.add(history, [new_message]))
```

</Tab>
<Tab title="AutoGen">

```python agent.py
import operator

from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient
from langgraph.func import entrypoint, task
from langsmith.integrations.otel import OtelSpanProcessor
from opentelemetry import trace
from opentelemetry.instrumentation.openai import OpenAIInstrumentor
from opentelemetry.sdk.trace import TracerProvider

tracer_provider = TracerProvider()
tracer_provider.add_span_processor(OtelSpanProcessor())
trace.set_tracer_provider(tracer_provider)
OpenAIInstrumentor().instrument()

assistant = AssistantAgent(
    name="assistant",
    model_client=OpenAIChatCompletionClient(model="gpt-4o"),
)

@task
async def invoke_autogen(prompt: str) -> str:
    result = await assistant.run(task=prompt)
    return result.messages[-1].content

@entrypoint()
async def agent(messages: list[dict], previous: list[dict] | None = None):
    history = operator.add(previous or [], messages)
    response = await invoke_autogen(history[-1]["content"])
    new_message = {"role": "assistant", "content": response}
    return entrypoint.final(value=[new_message], save=operator.add(history, [new_message]))
```

</Tab>
</Tabs>

对于每个示例，有两点至关重要：

1. **在模块范围内将 `@entrypoint` 修饰的函数导出为 `agent`**。代理服务器在提供图形服务时导入此符号。
2. **返回 `entrypoint.final()` 并带有 `save` 参数**，以便对话状态在同一线程上的轮次中保持不变。

## 项目布局

可部署的项目需要这些文件：

```
my-agent/
├── agent.py              # exports the agent graph
├── langgraph.json        # Agent Server config
├── pyproject.toml        # Python dependencies
└── .env                  # Provider credentials and LangSmith variables
```

[⟦T68⟧](/langsmith/application-structure#configuration-file-concepts) 将 Agent Server 指向导出的符号：

<Tabs>
<Tab title="Claude Agent SDK">

```json langgraph.json
{
  "$schema": "https://langgra.ph/schema.json",
  "dependencies": ["."],
  "graphs": {
    "claude_agent": "./agent.py:agent"
  },
  "env": ".env"
}
```

```toml pyproject.toml
[project]
name = "my-claude-agent"
version = "0.0.1"
requires-python = ">=3.10"
dependencies = [
    "langsmith[claude-agent-sdk]>=0.3.0",
    "langgraph>=0.4.0",
]
```

```bash .env
LANGSMITH_API_KEY=your-langsmith-api-key
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=my-claude-agent
ANTHROPIC_API_KEY=your-anthropic-api-key
```

</Tab>
<Tab title="Strands Agents">

```json langgraph.json
{
  "$schema": "https://langgra.ph/schema.json",
  "dependencies": ["."],
  "graphs": {
    "strands_agent": "./agent.py:agent"
  },
  "env": ".env"
}
```

```toml pyproject.toml
[project]
name = "my-strands-agent"
version = "0.0.1"
requires-python = ">=3.9"
dependencies = [
    "strands-agents>=0.1.0",
    "strands-agents-tools>=0.1.0",
    "langsmith[strands-agents]>=0.3.0",
    "langgraph>=0.4.0",
]
```

```bash .env
LANGSMITH_API_KEY=your-langsmith-api-key
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=my-strands-agent
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.smith.langchain.com/otel/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=x-api-key=your-langsmith-api-key,Langsmith-Project=my-strands-agent
AWS_REGION=your-aws-region
AWS_PROFILE=your-aws-profile
```

</Tab>
<Tab title="CrewAI">

```json langgraph.json
{
  "$schema": "https://langgra.ph/schema.json",
  "dependencies": ["."],
  "graphs": {
    "crewai_agent": "./agent.py:agent"
  },
  "env": ".env"
}
```

```toml pyproject.toml
[project]
name = "my-crewai-agent"
version = "0.0.1"
requires-python = ">=3.10"
dependencies = [
    "crewai>=0.100.0",
    "langgraph>=0.4.0",
    "langsmith>=0.3.0",
    "opentelemetry-instrumentation-crewai>=0.1.0",
    "opentelemetry-instrumentation-openai>=0.1.0",
]
```

```bash .env
LANGSMITH_API_KEY=your-langsmith-api-key
LANGSMITH_PROJECT=my-crewai-agent
OPENAI_API_KEY=your-openai-api-key
```

</Tab>
<Tab title="AutoGen">

```json langgraph.json
{
  "$schema": "https://langgra.ph/schema.json",
  "dependencies": ["."],
  "graphs": {
    "autogen_agent": "./agent.py:agent"
  },
  "env": ".env"
}
```

```toml pyproject.toml
[project]
name = "my-autogen-agent"
version = "0.0.1"
requires-python = ">=3.10"
dependencies = [
    "autogen-agentchat>=0.4.0",
    "autogen-ext>=0.4.0",
    "langgraph>=0.4.0",
    "langsmith>=0.3.0",
    "opentelemetry-instrumentation-openai>=0.1.0",
]
```

```bash .env
LANGSMITH_API_KEY=your-langsmith-api-key
LANGSMITH_PROJECT=my-autogen-agent
OPENAI_API_KEY=your-openai-api-key
```

</Tab>
</Tabs>

## 安装依赖项

从您的项目目录：

```bash
pip install -e .
```

## 启用跟踪

在 [Project layout](#project-layout) 中使用特定于框架的 `.env` 模板。当在`langgraph.json`中设置`"env": ".env"`时，代理服务器加载此文件。在该文件中设置 `LANGSMITH_PROJECT` 和您的框架提供商凭据。对于 Claude Agent SDK 和 Strands Agent，还设置 `LANGSMITH_TRACING=true`。对于 CrewAI 和 AutoGen，在 `agent.py` 到 `OtelSpanProcessor()` 以及框架仪器中启用了跟踪，因此仅设置 `LANGSMITH_API_KEY` 和 `LANGSMITH_PROJECT`。

[Traces](/langsmith/observability) 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-deploy-other-frameworks) 中显示代理调用、工具调用和 LLM 交互。有关特定于框架的跟踪选项，请参阅[Configure tracing](#configure-tracing)中的链接。

## 本地运行

使用[LangGraph CLI](/langsmith/cli)启动本地代理服务器：

```bash
langgraph dev
```

<Note>
如果`langgraph dev`报告缺少`langgraph-api`，请在同一环境中安装`langgraph-cli[inmem]`。
</Note>

该服务位于 `http://127.0.0.1:2024` 并在 [LangSmith Studio](/langsmith/studio) 开放。使用`curl`发送请求：

<Note>
`langgraph dev` 可能在不同的端口上提供服务。检查终端输出中的 URL，并根据需要更新下面的 `curl` 命令。
</Note>

<Tabs>
<Tab title="Claude Agent SDK, CrewAI, AutoGen">

```bash
# Create a thread
THREAD=$(curl -s -X POST http://127.0.0.1:2024/threads \
  -H "Content-Type: application/json" -d '{}' | python -c "import sys, json; print(json.load(sys.stdin)['thread_id'])")

# Run the agent and wait for the final response
curl -s -X POST "http://127.0.0.1:2024/threads/$THREAD/runs/wait" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "ASSISTANT_ID",
    "input": [{"role": "user", "content": "Hello"}]
  }'
```

</Tab>
<Tab title="Strands Agents">

```bash
# Create a thread
THREAD=$(curl -s -X POST http://127.0.0.1:2024/threads \
  -H "Content-Type: application/json" -d '{}' | python -c "import sys, json; print(json.load(sys.stdin)['thread_id'])")

# Run the agent and wait for the final response
curl -s -X POST "http://127.0.0.1:2024/threads/$THREAD/runs/wait" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "ASSISTANT_ID",
    "input": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "Hello"}
        ]
      }
    ]
  }'
```

<Note>
如果此请求因 `NoCredentialsError` 失败，请为您的模型提供商配置 AWS 凭证（例如 `AWS_PROFILE` 或 `AWS_ACCESS_KEY_ID` 和 `AWS_SECRET_ACCESS_KEY`）并重新启动 `langgraph dev`。
</Note>

</Tab>
</Tabs>

将 `ASSISTANT_ID` 替换为 `langgraph.json` `graphs` 对象中的图形键。例如，如果您的配置是`"graphs": {"claude_agent": "./agent.py:agent"}`，请使用`claude_agent`；如果您的配置是`"graphs": {"strands_agent": "./agent.py:agent"}`，请使用`strands_agent`。<Note>
部署前的[Verify that the LangGraph API runs locally](/langsmith/local-dev-testing)。如果 `langgraph dev` 失败，部署到 LangSmith 也会失败。
</Note>

## 部署到LangSmith

代理在本地运行后，使用 `langgraph deploy` 进行部署：

```bash
langgraph deploy --name my-agent
```

有关环境配置、部署类型和修订管理，请参阅[Deploy to cloud](/langsmith/deploy-to-cloud)。对于自托管设置，请参阅[Self-hosted deployments](/langsmith/self-hosted)。对于没有控制平面的仅 Docker 托管，请参阅[Deploy standalone](/langsmith/deploy-standalone-server)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-other-frameworks.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>