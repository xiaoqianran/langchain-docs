<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Google ADK agents | https://docs.langchain.com/langsmith/trace-with-google-adk -->

# 追踪 Google ADK 代理

本指南向您展示如何在 LangSmith 中追踪 [Google Agent Development Kit (ADK)](https://github.com/google/adk-python) 特工。您将为 ADK 代理配置自动跟踪，以捕获代理调用、工具调用和 LLM 交互。

> [!注意]
>
> 本指南涵盖 ADK 的标准执行路径（文本代理、工具和多代理工作流程）。要跟踪使用 ADK 的 `Runner.run_live` 流循环的 **Gemini Live** 语音代理，请参阅 [Trace Gemini Live agents](/langsmith/trace-gemini-live)。

> [!注意]
>
> 在发送跟踪之前，在 [agent-based workspace](/langsmith/agents)、[create an agent](/langsmith/create-an-agent) 中进行一次。使用[agent addressing](/langsmith/log-traces-to-agent)选择其标识符和环境。如果集成需要 `project_name`，请使用所选环境的 [⟦T10⟧](/langsmith/create-an-agent#use-an-environment-project) 作为兼容性值。

## 安装

使用您首选的包管理器安装所需的包：

```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv add "langsmith[google-adk]"
```

```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install langsmith[google-adk]
```

## 设置

设置您的[API keys](/langsmith/create-account-api-key)：

```bash shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING=true
export LANGSMITH_ENDPOINT=https://api.smith.langchain.com
export LANGSMITH_API_KEY=<your_langsmith_api_key>
export LANGSMITH_PROJECT=<your_langsmith_project>

export GOOGLE_API_KEY=<your_google_api_key>
```

```dotenv .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=<your_langsmith_api_key>
LANGSMITH_PROJECT=<your_langsmith_project>

GOOGLE_API_KEY=<your_google_api_key>
```

要创建 Google API 密钥，请参阅[Google AI Studio](https://aistudio.google.com/api-keys)。

## 配置跟踪

将 `LANGSMITH_AGENT_ID` 和 `LANGSMITH_AGENT_ENVIRONMENT` 设置为设置期间注册的代理。保留 `project_name` 未设置以使用此目的地。

要跟踪 ADK 代理，请使用 LangSmith SDK 中的 `configure_google_adk()`。在创建任何 ADK 代理之前调用此函数一次：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith.integrations.google_adk import configure_google_adk

configure_google_adk()
```

该函数接受以下可选参数：* `project_name`：基于项目的跟踪的兼容性覆盖。保留其未设置以使用配置的代理和环境。
* `name`：根跟踪的名称。默认为`"google_adk.session"`。
* `metadata`：附加上下文的键值对字典。
* `tags`：用于对痕迹进行分类的字符串列表。

## 示例

此示例使用工具创建天气代理，然后在启用跟踪的情况下运行它：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

from dotenv import load_dotenv  # Optional
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from langsmith.integrations.google_adk import configure_google_adk

load_dotenv()  # Optional


async def main():
    # Configure LangSmith tracing
    configure_google_adk()

    # Define a tool
    def get_weather(city: str) -> dict:
        """Get weather for a city."""
        return {"city": city, "temperature": "72°F", "conditions": "Sunny"}

    # Create the agent
    agent = Agent(
        name="weather_agent",
        model="gemini-3.8-flash",
        description="Provides weather information.",
        instruction="Use the get_weather tool to answer weather questions.",
        tools=[get_weather],
    )

    # Set up session and runner
    session_service = InMemorySessionService()
    session = await session_service.create_session(
        app_name="weather_app",
        user_id="user_123",
        session_id="session_456",
    )

    runner = Runner(
        agent=agent,
        app_name="weather_app",
        session_service=session_service,
    )

    # Run the agent
    async for event in runner.run_async(
        user_id="user_123",
        session_id=session.id,
        new_message=types.Content(
            role="user",
            parts=[types.Part(text="What's the weather in San Francisco?")],
        ),
    ):
        if event.is_final_response():
            print(event.content.parts[0].text)


if __name__ == "__main__":
    asyncio.run(main())
```

## 查看LangSmith中的踪迹

运行代理后，您可以在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-with-google-adk)中查看跟踪，其中包括：

* **代理调用**：通过 ADK 代理的完整流程
* **工具调用**：代理进行的各个函数调用
* **LLM 互动**：来自 Gemini 模型的请求和响应
* **多代理工作流程**：来自顺序和并行代理组合的跟踪

## 自定义元数据和标签

配置跟踪时添加元数据和标签以对跟踪进行分类和过滤：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith.integrations.google_adk import configure_google_adk

configure_google_adk(
    metadata={
        "environment": "production",
        "team": "ml-platform",
    },
    tags=["adk", "weather", "v2"],
)
```

## 多代理工作流程

该集成自动跟踪多代理工作流程，包括顺序和并行代理组合：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

from dotenv import load_dotenv  # Optional
from google.adk.agents import Agent, SequentialAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from langsmith.integrations.google_adk import configure_google_adk

load_dotenv()  # Optional


async def main():
    # Configure LangSmith tracing
    # Traces go to LANGSMITH_PROJECT env var by default.
    # Pass project_name="my-project" to override.
    configure_google_adk()

    # Create sub-agents
    translator = Agent(
        name="translator",
        model="gemini-3.8-flash",
        description="Translates text to English.",
    )

    summarizer = Agent(
        name="summarizer",
        model="gemini-3.8-flash",
        description="Summarizes text concisely.",
    )

    # Create a sequential agent that runs sub-agents in order
    pipeline = SequentialAgent(
        name="translate_and_summarize",
        sub_agents=[translator, summarizer],
        description="Translates text then summarizes it.",
    )

    # Set up and run
    session_service = InMemorySessionService()
    session = await session_service.create_session(
        app_name="pipeline_app",
        user_id="user_123",
        session_id="session_456",
    )

    runner = Runner(
        agent=pipeline,
        app_name="pipeline_app",
        session_service=session_service,
    )

    events = runner.run_async(
        user_id="user_123",
        session_id=session.id,
        new_message=types.Content(
            role="user",
            parts=[types.Part(text="Quelle est la plus haute tour de Paris?")],
        ),
    )

    async for event in events:
        if event.is_final_response():
            print(event.content.parts[0].text)


if __name__ == "__main__":
    asyncio.run(main())
```

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-google-adk.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。