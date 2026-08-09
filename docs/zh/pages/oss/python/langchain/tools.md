<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tools | https://docs.langchain.com/oss/python/langchain/tools -->

# 工具

工具扩展了[agents](/oss/python/langchain/agents)的功能——让它们获取实时数据、执行代码、查询外部数据库以及在现实世界中采取行动。

在底层，工具是可调用的函数，具有明确定义的输入和输出，并传递给[chat model](/oss/python/langchain/models)。该模型根据对话上下文决定何时调用工具以及提供哪些输入参数。

<Tip>
  有关模型如何处理工具调用的详细信息，请参阅[Tool calling](/oss/python/langchain/models#tool-calling)。使用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-tools) 跟踪工具调用和调试错误。按照[tracing quickstart](/langsmith/trace-with-langchain)进行设置。

  我们建议您还设置 [LangSmith Engine](/langsmith/engine) 来监视您的痕迹、检测问题并提出修复建议。
</Tip>

## 创建工具

### 基本工具定义

创建工具最简单的方法是使用 [⟦T44⟧](https://reference.langchain.com/python/langchain-core/tools/convert/tool) 装饰器。默认情况下，函数的文档字符串成为工具的描述，帮助模型理解何时使用它：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool

@tool
def search_database(query: str, limit: int = 10) -> str:
    """Search the customer database for records matching the query.

    Args:
        query: Search terms to look for
        limit: Maximum number of results to return
    """
    return f"Found {limit} results for '{query}'"
```

类型提示是**必需的**，因为它们定义了工具的输入模式。文档字符串应该内容丰富且简洁，以帮助模型理解工具的用途。<Note>
  **服务器端工具的使用：** 一些聊天模型具有在服务器端执行的内置工具（网络搜索、代码解释器）。详情请参阅[Server-side tool use](#server-side-tool-use)。
</Note>

<Warning>
  优选使用 `snake_case` 作为工具名称（例如，`web_search` 而不是 `Web Search`）。一些模型提供者对包含空格或特殊字符的名称存在问题或拒绝包含错误的名称。坚持使用字母数字字符、下划线和连字符有助于提高提供商之间的兼容性。
</Warning>

### 自定义工具属性

#### 自定义工具名称

默认情况下，工具名称来自函数名称。当您需要更具描述性的内容时覆盖它：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
@tool("web_search")  # Custom name
def search(query: str) -> str:
    """Search the web for information."""
    return f"Results for: {query}"

print(search.name)  # web_search
```

#### 自定义工具说明

覆盖自动生成的工具描述以获得更清晰的模型指导：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
@tool("calculator", description="Performs arithmetic calculations. Use this for any math problems.")
def calc(expression: str) -> str:
    """Evaluate mathematical expressions."""
    return str(eval(expression))
```

### 高级模式定义

使用 Pydantic 模型或 JSON 模式定义复杂输入：

<CodeGroup>
  ```python Pydantic model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from pydantic import BaseModel, Field
  from typing import Literal

  class WeatherInput(BaseModel):
      """Input for weather queries."""
      location: str = Field(description="City name or coordinates")
      units: Literal["celsius", "fahrenheit"] = Field(
          default="celsius",
          description="Temperature unit preference"
      )
      include_forecast: bool = Field(
          default=False,
          description="Include 5-day forecast"
      )

  @tool(args_schema=WeatherInput)
  def get_weather(location: str, units: str = "celsius", include_forecast: bool = False) -> str:
      """Get current weather and optional forecast."""
      temp = 22 if units == "celsius" else 72
      result = f"Current weather in {location}: {temp} degrees {units[0].upper()}"
      if include_forecast:
          result += "\nNext 5 days: Sunny"
      return result
  ```

  ```python JSON Schema theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  weather_schema = {
      "type": "object",
      "properties": {
          "location": {"type": "string"},
          "units": {"type": "string"},
          "include_forecast": {"type": "boolean"}
      },
      "required": ["location", "units", "include_forecast"]
  }

  @tool(args_schema=weather_schema)
  def get_weather(location: str, units: str = "celsius", include_forecast: bool = False) -> str:
      """Get current weather and optional forecast."""
      temp = 22 if units == "celsius" else 72
      result = f"Current weather in {location}: {temp} degrees {units[0].upper()}"
      if include_forecast:
          result += "\nNext 5 days: Sunny"
      return result
  ```
</CodeGroup>

### 保留参数名称

以下参数名称是保留的，不能用作工具参数。使用这些名称将导致运行时错误。|参数名称|目的|
| -------------- | ---------------------------------------------------------------------------------- |
| `config` |保留用于将 `RunnableConfig` 传递给内部工具 |
| `runtime` |为`ToolRuntime`参数保留（访问状态、上下文、存储）|

要访问运行时信息，请使用 [⟦T52⟧](https://reference.langchain.com/python/langchain/tools/#langchain.tools.ToolRuntime) 参数，而不是命名您自己的参数 `config` 或 `runtime`。

如果您使用 `InjectedState`、`InjectedStore`、`get_runtime()` 或 `InjectedToolCallId`，请参阅 [Migrate from older injection patterns](#migrate-from-older-injection-patterns)。

## 访问上下文

当工具可以访问运行时信息（例如对话历史记录、用户数据和持久内存）时，它们是最强大的。本节介绍如何从您的工具中访问和更新此信息。

工具可以通过[⟦T59⟧](https://reference.langchain.com/python/langchain/tools/#langchain.tools.ToolRuntime)参数访问运行时信息，该参数提供：|组件|描述 |使用案例 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| **状态** |短期记忆 - 当前对话中存在的可变数据（消息、计数器、自定义字段）|访问对话历史记录、跟踪工具调用计数 |
| **背景** |调用时传递的不可变配置（用户 ID、会话信息）|根据用户身份个性化响应 |
| **商店** |长期记忆 - 在对话中保存的持久数据 |保存用户偏好，维护知识库 || **流作家** |在工具执行期间发出实时更新 |显示长时间运行的操作的进度 |
| **执行信息** |当前执行的标识和重试信息（线程 ID、运行 ID、尝试次数）|访问线程/运行 ID，根据重试状态调整行为 |
| **服务器信息** |在 LangGraph Server 上运行时的服务器特定元数据（助手 ID、图形 ID、经过身份验证的用户）|访问助手 ID、图形 ID 或经过身份验证的用户信息 |
| **配置** | [⟦T60⟧](https://reference.langchain.com/python/langchain-core/runnables/config/RunnableConfig) 执行 |访问回调、标签和元数据 |
| **工具调用 ID** |当前工具调用的唯一标识符 |将日志和模型调用的工具调用关联起来

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    %% Runtime Context
    subgraph "🔧 Tool Runtime Context"
        A[Tool Call] --> B[ToolRuntime]
        B --> C[State Access]
        B --> D[Context Access]
        B --> E[Store Access]
        B --> F[Stream Writer]
    end

    %% Available Resources
    subgraph "📊 Available Resources"
        C --> G[Messages]
        C --> H[Custom State]
        D --> I[User ID]
        D --> J[Session Info]
        E --> K[Long-term Memory]
        E --> L[User Preferences]
    end

    %% Tool Capabilities
    subgraph "⚡ Enhanced Tool Capabilities"
        M[Context-Aware Tools]
        N[Stateful Tools]
        O[Memory-Enabled Tools]
        P[Streaming Tools]
    end

    %% Connections
    G --> M
    H --> N
    I --> M
    J --> M
    K --> O
    L --> O
    F --> P

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33
    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68

    class A trigger
    class B,C,D,E,F process
    class G,H,I,J,K,L neutral
    class M,N,O,P output
```

### 短期记忆（状态）

状态代表对话期间存在的短期记忆。它包括消息历史记录和您在 [graph state](/oss/python/langgraph/graph-api#state) 中定义的任何自定义字段。<Info>
  将 `runtime: ToolRuntime` 添加到您的工具签名中以访问状态。此参数会自动注入并在 LLM 中隐藏 - 它不会出现在工具的架构中。
</Info>

#### 访问状态

工具可以使用`runtime.state`访问当前对话状态：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool, ToolRuntime
from langchain.messages import HumanMessage

@tool
def get_last_user_message(runtime: ToolRuntime) -> str:
    """Get the most recent message from the user."""
    messages = runtime.state["messages"]

    # Find the last human message
    for message in reversed(messages):
        if isinstance(message, HumanMessage):
            return message.content

    return "No user messages found"

# Access custom state fields
@tool
def get_user_preference(
    pref_name: str,
    runtime: ToolRuntime
) -> str:
    """Get a user preference value."""
    preferences = runtime.state.get("user_preferences", {})
    return preferences.get(pref_name, "Not set")
```

<Warning>
  `runtime` 参数对模型隐藏。对于上面的示例，模型仅在工具架构中看到`pref_name`。
</Warning>

#### 更新状态

使用[⟦T65⟧](https://reference.langchain.com/python/langgraph/types/Command)更新代理的状态。这对于需要更新自定义状态字段的工具非常有用。
在更新中包含 `ToolMessage`，以便模型可以看到工具调用的结果：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import AgentState
from langchain.messages import ToolMessage
from langchain.tools import ToolRuntime, tool
from langgraph.types import Command


class CustomState(AgentState):
    user_name: str


@tool
def set_user_name(new_name: str, runtime: ToolRuntime[None, CustomState]) -> Command:
    """Set the user's name in the conversation state."""
    return Command(
        update={
            "user_name": new_name,
            "messages": [
                ToolMessage(
                    content=f"User name set to {new_name}.",
                    tool_call_id=runtime.tool_call_id,
                )
            ],
        }
    )
```

<Tip>
  当工具更新状态变量时，请考虑为这些字段定义 [reducer](/oss/python/langgraph/graph-api#reducers)。由于 LLM 可以并行调用多个工具，因此当并发工具调用更新同一状态字段时，reducer 决定如何解决冲突。
</Tip>

### 上下文

上下文提供在调用时传递的不可变配置数据。将其用于在对话期间不应更改的用户 ID、会话详细信息或特定于应用程序的设置。<Note>
  虽然`thread_id`（通过`config={"configurable": {"thread_id": ...}}`传递）范围是*对话*：消息历史记录和检查点，`context`携带您的工具和中间件在调用时读取的*每次运行*数据。在生产中，您通常将两者一起传递：每个会话一个稳定的`thread_id`，以及每次调用时一个`context`对象。
</Note>

通过`runtime.context`访问上下文。将其与 `thread_id` 一起传递，以便对话在轮流中持续进行：

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.agents import create_agent
  from langchain.tools import tool, ToolRuntime
  from langchain_core.utils.uuid import uuid7
  from langchain_openai import ChatOpenAI


  USER_DATABASE = {
      "user123": {
          "name": "Alice Johnson",
          "account_type": "Premium",
          "balance": 5000,
          "email": "alice@example.com",
      },
      "user456": {
          "name": "Bob Smith",
          "account_type": "Standard",
          "balance": 1200,
          "email": "bob@example.com",
      },
  }


  @dataclass
  class UserContext:
      user_id: str


  @tool
  def get_account_info(runtime: ToolRuntime[UserContext]) -> str:
      """Get the current user's account information."""
      user_id = runtime.context.user_id

      if user_id in USER_DATABASE:
          user = USER_DATABASE[user_id]
          return (
              f"Account holder: {user['name']}\n"
              f"Type: {user['account_type']}\n"
              f"Balance: ${user['balance']}"
          )
      return "User not found"


  model = ChatOpenAI(model="google_genai:gemini-3.6-flash")
  agent = create_agent(
      model,
      tools=[get_account_info],
      context_schema=UserContext,
      system_prompt="You are a financial assistant.",
  )

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's my current balance?"}]},
      config={"configurable": {"thread_id": str(uuid7())}},
      context=UserContext(user_id="user123"),
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.agents import create_agent
  from langchain.tools import tool, ToolRuntime
  from langchain_core.utils.uuid import uuid7
  from langchain_openai import ChatOpenAI


  USER_DATABASE = {
      "user123": {
          "name": "Alice Johnson",
          "account_type": "Premium",
          "balance": 5000,
          "email": "alice@example.com",
      },
      "user456": {
          "name": "Bob Smith",
          "account_type": "Standard",
          "balance": 1200,
          "email": "bob@example.com",
      },
  }


  @dataclass
  class UserContext:
      user_id: str


  @tool
  def get_account_info(runtime: ToolRuntime[UserContext]) -> str:
      """Get the current user's account information."""
      user_id = runtime.context.user_id

      if user_id in USER_DATABASE:
          user = USER_DATABASE[user_id]
          return (
              f"Account holder: {user['name']}\n"
              f"Type: {user['account_type']}\n"
              f"Balance: ${user['balance']}"
          )
      return "User not found"


  model = ChatOpenAI(model="openai:gpt-5.5")
  agent = create_agent(
      model,
      tools=[get_account_info],
      context_schema=UserContext,
      system_prompt="You are a financial assistant.",
  )

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's my current balance?"}]},
      config={"configurable": {"thread_id": str(uuid7())}},
      context=UserContext(user_id="user123"),
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.agents import create_agent
  from langchain.tools import tool, ToolRuntime
  from langchain_core.utils.uuid import uuid7
  from langchain_openai import ChatOpenAI


  USER_DATABASE = {
      "user123": {
          "name": "Alice Johnson",
          "account_type": "Premium",
          "balance": 5000,
          "email": "alice@example.com",
      },
      "user456": {
          "name": "Bob Smith",
          "account_type": "Standard",
          "balance": 1200,
          "email": "bob@example.com",
      },
  }


  @dataclass
  class UserContext:
      user_id: str


  @tool
  def get_account_info(runtime: ToolRuntime[UserContext]) -> str:
      """Get the current user's account information."""
      user_id = runtime.context.user_id

      if user_id in USER_DATABASE:
          user = USER_DATABASE[user_id]
          return (
              f"Account holder: {user['name']}\n"
              f"Type: {user['account_type']}\n"
              f"Balance: ${user['balance']}"
          )
      return "User not found"


  model = ChatOpenAI(model="anthropic:claude-sonnet-4-6")
  agent = create_agent(
      model,
      tools=[get_account_info],
      context_schema=UserContext,
      system_prompt="You are a financial assistant.",
  )

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's my current balance?"}]},
      config={"configurable": {"thread_id": str(uuid7())}},
      context=UserContext(user_id="user123"),
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.agents import create_agent
  from langchain.tools import tool, ToolRuntime
  from langchain_core.utils.uuid import uuid7
  from langchain_openai import ChatOpenAI


  USER_DATABASE = {
      "user123": {
          "name": "Alice Johnson",
          "account_type": "Premium",
          "balance": 5000,
          "email": "alice@example.com",
      },
      "user456": {
          "name": "Bob Smith",
          "account_type": "Standard",
          "balance": 1200,
          "email": "bob@example.com",
      },
  }


  @dataclass
  class UserContext:
      user_id: str


  @tool
  def get_account_info(runtime: ToolRuntime[UserContext]) -> str:
      """Get the current user's account information."""
      user_id = runtime.context.user_id

      if user_id in USER_DATABASE:
          user = USER_DATABASE[user_id]
          return (
              f"Account holder: {user['name']}\n"
              f"Type: {user['account_type']}\n"
              f"Balance: ${user['balance']}"
          )
      return "User not found"


  model = ChatOpenAI(model="openrouter:z-ai/glm-5.2")
  agent = create_agent(
      model,
      tools=[get_account_info],
      context_schema=UserContext,
      system_prompt="You are a financial assistant.",
  )

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's my current balance?"}]},
      config={"configurable": {"thread_id": str(uuid7())}},
      context=UserContext(user_id="user123"),
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.agents import create_agent
  from langchain.tools import tool, ToolRuntime
  from langchain_core.utils.uuid import uuid7
  from langchain_openai import ChatOpenAI


  USER_DATABASE = {
      "user123": {
          "name": "Alice Johnson",
          "account_type": "Premium",
          "balance": 5000,
          "email": "alice@example.com",
      },
      "user456": {
          "name": "Bob Smith",
          "account_type": "Standard",
          "balance": 1200,
          "email": "bob@example.com",
      },
  }


  @dataclass
  class UserContext:
      user_id: str


  @tool
  def get_account_info(runtime: ToolRuntime[UserContext]) -> str:
      """Get the current user's account information."""
      user_id = runtime.context.user_id

      if user_id in USER_DATABASE:
          user = USER_DATABASE[user_id]
          return (
              f"Account holder: {user['name']}\n"
              f"Type: {user['account_type']}\n"
              f"Balance: ${user['balance']}"
          )
      return "User not found"


  model = ChatOpenAI(model="fireworks:accounts/fireworks/models/glm-5p2")
  agent = create_agent(
      model,
      tools=[get_account_info],
      context_schema=UserContext,
      system_prompt="You are a financial assistant.",
  )

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's my current balance?"}]},
      config={"configurable": {"thread_id": str(uuid7())}},
      context=UserContext(user_id="user123"),
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.agents import create_agent
  from langchain.tools import tool, ToolRuntime
  from langchain_core.utils.uuid import uuid7
  from langchain_openai import ChatOpenAI


  USER_DATABASE = {
      "user123": {
          "name": "Alice Johnson",
          "account_type": "Premium",
          "balance": 5000,
          "email": "alice@example.com",
      },
      "user456": {
          "name": "Bob Smith",
          "account_type": "Standard",
          "balance": 1200,
          "email": "bob@example.com",
      },
  }


  @dataclass
  class UserContext:
      user_id: str


  @tool
  def get_account_info(runtime: ToolRuntime[UserContext]) -> str:
      """Get the current user's account information."""
      user_id = runtime.context.user_id

      if user_id in USER_DATABASE:
          user = USER_DATABASE[user_id]
          return (
              f"Account holder: {user['name']}\n"
              f"Type: {user['account_type']}\n"
              f"Balance: ${user['balance']}"
          )
      return "User not found"


  model = ChatOpenAI(model="baseten:zai-org/GLM-5.2")
  agent = create_agent(
      model,
      tools=[get_account_info],
      context_schema=UserContext,
      system_prompt="You are a financial assistant.",
  )

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's my current balance?"}]},
      config={"configurable": {"thread_id": str(uuid7())}},
      context=UserContext(user_id="user123"),
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.agents import create_agent
  from langchain.tools import tool, ToolRuntime
  from langchain_core.utils.uuid import uuid7
  from langchain_openai import ChatOpenAI


  USER_DATABASE = {
      "user123": {
          "name": "Alice Johnson",
          "account_type": "Premium",
          "balance": 5000,
          "email": "alice@example.com",
      },
      "user456": {
          "name": "Bob Smith",
          "account_type": "Standard",
          "balance": 1200,
          "email": "bob@example.com",
      },
  }


  @dataclass
  class UserContext:
      user_id: str


  @tool
  def get_account_info(runtime: ToolRuntime[UserContext]) -> str:
      """Get the current user's account information."""
      user_id = runtime.context.user_id

      if user_id in USER_DATABASE:
          user = USER_DATABASE[user_id]
          return (
              f"Account holder: {user['name']}\n"
              f"Type: {user['account_type']}\n"
              f"Balance: ${user['balance']}"
          )
      return "User not found"


  model = ChatOpenAI(model="ollama:north-mini-code-1.0")
  agent = create_agent(
      model,
      tools=[get_account_info],
      context_schema=UserContext,
      system_prompt="You are a financial assistant.",
  )

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's my current balance?"}]},
      config={"configurable": {"thread_id": str(uuid7())}},
      context=UserContext(user_id="user123"),
  )
  ```
</CodeGroup>

### 长期记忆（存储）

[⟦T74⟧](https://reference.langchain.com/python/langchain-core/stores/BaseStore) 提供跨对话持续存在的持久存储。与状态（短期记忆）不同，保存到存储的数据在未来的会话中仍然可用。

通过`runtime.store`进入商店。存储使用命名空间/键模式来组织数据：

<Tip>
  对于生产部署，请使用持久存储实现，例如 [⟦T76⟧](https://reference.langchain.com/python/langgraph/store/#langgraph.store.postgres.PostgresStore)、`MongoDBStore` 或 `RedisStore`，而不是 `InMemoryStore`。有关设置详细信息，请参阅[memory documentation](/oss/python/langgraph/add-memory)。
</Tip>

```python expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import Any
from langgraph.store.memory import InMemoryStore
from langchain.agents import create_agent
from langchain.tools import tool, ToolRuntime
from langchain_openai import ChatOpenAI

# Access memory
@tool
def get_user_info(user_id: str, runtime: ToolRuntime) -> str:
    """Look up user info."""
    store = runtime.store
    user_info = store.get(("users",), user_id)
    return str(user_info.value) if user_info else "Unknown user"

# Update memory
@tool
def save_user_info(user_id: str, user_info: dict[str, Any], runtime: ToolRuntime) -> str:
    """Save user info."""
    store = runtime.store
    store.put(("users",), user_id, user_info)
    return "Successfully saved user info."

model = ChatOpenAI(model="gpt-5.5")

store = InMemoryStore()
agent = create_agent(
    model,
    tools=[get_user_info, save_user_info],
    store=store
)

# First session: save user info
agent.invoke({
    "messages": [{"role": "user", "content": "Save the following user: userid: abc123, name: Foo, age: 25, email: foo@langchain.dev"}]
})

# Second session: get user info
agent.invoke({
    "messages": [{"role": "user", "content": "Get user info for user with id 'abc123'"}]
})
# Here is the user info for user with ID "abc123":
# - Name: Foo
# - Age: 25
# - Email: foo@langchain.dev
```

### 流作者

在执行期间从工具流式传输实时更新。这对于在长时间运行的操作期间向用户提供进度反馈非常有用。

使用 `runtime.stream_writer` 发出自定义更新：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool, ToolRuntime

@tool
def get_weather(city: str, runtime: ToolRuntime) -> str:
    """Get weather for a given city."""
    writer = runtime.stream_writer

    # Stream custom updates as the tool executes
    writer(f"Looking up data for city: {city}")
    writer(f"Acquired data for city: {city}")

    return f"It's always sunny in {city}!"
```<Note>
  如果您在工具中使用`runtime.stream_writer`，则必须在 LangGraph 执行上下文中调用该工具。更多详情请参阅[Streaming](/oss/python/langchain/streaming)。
</Note>

### 执行信息

通过 `runtime.execution_info` 从工具内访问线程 ID、运行 ID 和重试状态：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool, ToolRuntime

@tool
def log_execution_context(runtime: ToolRuntime) -> str:
    """Log execution identity information."""
    info = runtime.execution_info
    print(f"Thread: {info.thread_id}, Run: {info.run_id}")  # [!code highlight]
    print(f"Attempt: {info.node_attempt}")
    return "done"
```

<Note>
  需要`deepagents>=0.5.0`（或`langgraph>=1.1.5`）。
</Note>

### 服务器信息

当您的工具在 LangGraph Server 上运行时，通过 `runtime.server_info` 访问助手 ID、图形 ID 和经过身份验证的用户：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool, ToolRuntime

@tool
def get_assistant_scoped_data(runtime: ToolRuntime) -> str:
    """Fetch data scoped to the current assistant."""
    server = runtime.server_info
    if server is not None:
        print(f"Assistant: {server.assistant_id}, Graph: {server.graph_id}")  # [!code highlight]
        if server.user is not None:
            print(f"User: {server.user.identity}")  # [!code highlight]
    return "done"
```

当该工具未在 LangGraph Server 上运行时（例如，在本地开发或测试期间），`server_info` 为 `None`。

<Note>
  需要`deepagents>=0.5.0`（或`langgraph>=1.1.5`）。
</Note>

<Accordion title="Migrate from older injection patterns">
  较旧的示例使用 `InjectedState`、`InjectedStore`、`get_runtime()` 或 `InjectedToolCallId`。使用 [⟦T94⟧](https://reference.langchain.com/python/langchain/tools/#langchain.tools.ToolRuntime) 来代替一个用于状态、上下文、存储和执行元数据的显式接口。

  #### 之前的模式

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.tools import tool, InjectedState

  @tool
  def summarize(state: InjectedState) -> str:
      """Summarize the conversation."""
      messages = state["messages"]
      return f"Conversation length: {len(messages)} messages."
  ```

  ####推荐图案

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.tools import tool, ToolRuntime

  @tool
  def summarize(runtime: ToolRuntime) -> str:
      """Summarize the conversation."""
      messages = runtime.state["messages"]
      return f"Conversation length: {len(messages)} messages."
  ```

  对于代理级别的迁移（例如 `create_react_agent` 和自定义状态），请参阅 [LangChain v1 migration guide](/oss/python/migrate/langchain-v1)。
</Accordion>

## 工具执行

在LangChain中，工具由代理使用（例如通过[⟦T96⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)），工具错误处理通过[middleware](/oss/python/langchain/middleware)配置。对于 LangGraph 工作流程，工具执行由 [⟦T97⟧](https://reference.langchain.com/python/langgraph/agents/#langgraph.prebuilt.tool_node.ToolNode) 处理。请参阅[ToolNode](/oss/python/langgraph/workflows-agents#toolnode)了解图形 API 的使用，包括工具如何访问当前图形状态和运行范围的上下文。

### 工具返回值

您可以为您的工具选择不同的返回值：

* 返回 `string` 以获得人类可读的结果。
* 返回 `object` 以获得模型应解析的结构化结果。
* 当您需要写入状态时，返回带有可选消息的`Command`。

#### 返回一个字符串

当工具应提供纯文本供模型在下一个响应中读取和使用时，返回一个字符串。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool


@tool
def get_weather(city: str) -> str:
    """Get weather for a city."""
    return f"It is currently sunny in {city}."
```

行为：

* 返回值转换为`ToolMessage`。
* 模型看到该文本并决定下一步做什么。
* 除非模型或其他工具稍后进行更改，否则不会更改代理状态字段。

当结果是自然可读的文本时使用此选项。

#### 返回一个对象

当您的工具生成模型应检查的结构化数据时，返回一个对象（例如，`dict`）。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool


@tool
def get_weather_data(city: str) -> dict:
    """Get structured weather data for a city."""
    return {
        "city": city,
        "temperature_c": 22,
        "conditions": "sunny",
    }
```

行为：

* 对象被序列化并作为工具输出发回。
* 模型可以读取特定字段并对其进行推理。
* 与字符串返回一样，这不会直接更新图状态。当下游推理受益于显式字段而不是自由格式文本时，请使用此选项。

#### 返回多模式内容

工具不限于纯文本。当模型支持多模式工具结果时，该工具可以返回[standard content blocks](/oss/python/langchain/messages#standard-content-blocks)，以便模型在一个工具结果中接收文本、图像和其他媒体。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool


@tool
def capture_screenshot() -> list[dict]:
    """Capture a screenshot of the current page."""
    return [
        {"type": "text", "text": "Screenshot of the current page:"},
        {"type": "image", "url": "https://example.com/page.png"},
    ]
```

行为：

* 返回值转换为具有多模式`content`的`ToolMessage`。
* 工具运行后使用`message.content_blocks`读取标准化块列表。
* 该模型必须支持您返回的模式。在返回图像、音频或视频之前检查您的[model's capabilities](/oss/python/integrations/chat)。

有关块类型和提供商特定要求，请参阅[Multimodal messages](/oss/python/langchain/messages#multimodal)。返回图像或混合内容的 MCP 工具以相同的方式进行转换；参见[Multimodal tool content](/oss/python/langchain/mcp#multimodal-tool-content)。

#### 返回命令

当工具需要更新图形状态（例如，设置用户首选项或应用程序状态）时，返回[⟦T106⟧](https://reference.langchain.com/python/langgraph/types/Command)。
您可以退回包含或不包含 `ToolMessage` 的 `Command`。
如果模型需要查看工具是否成功（例如，确认首选项更改），请在更新中包含 `ToolMessage`，并使用 `runtime.tool_call_id` 作为 `tool_call_id` 参数。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import ToolMessage
from langchain.tools import ToolRuntime, tool
from langgraph.types import Command


@tool
def set_language(language: str, runtime: ToolRuntime) -> Command:
    """Set the preferred response language."""
    return Command(
        update={
            "preferred_language": language,
            "messages": [
                ToolMessage(
                    content=f"Language set to {language}.",
                    tool_call_id=runtime.tool_call_id,
                )
            ],
        }
    )
```

行为：* 该命令使用`update`更新状态。
* 更新后的状态可用于同一运行中的后续步骤。
* 对可能通过并行工具调用更新的字段使用缩减器。

当工具不仅返回数据，而且还改变代理状态时，请使用此选项。

#### 直接从工具返回

在工具上设置 return direct 以短路代理循环：代理立即将工具的输出返回给调用者，而不通过模型将其发送回以进行进一步处理。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool
  from langchain_openai import ChatOpenAI


  @tool(return_direct=True)
  def fetch_order_status(order_id: str) -> str:
      """Fetch the current status of a customer order."""
      # In production, query your order management system here
      return f"Order {order_id} is shipped and will arrive in 2 days."


  agent = create_agent(
      ChatOpenAI(model="google_genai:gemini-3.6-flash"),
      tools=[fetch_order_status],
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "What is the status of order #12345?"}]
  })
  # The agent returns the tool output directly without another LLM call:
  # "Order 12345 is shipped and will arrive in 2 days."
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool
  from langchain_openai import ChatOpenAI


  @tool(return_direct=True)
  def fetch_order_status(order_id: str) -> str:
      """Fetch the current status of a customer order."""
      # In production, query your order management system here
      return f"Order {order_id} is shipped and will arrive in 2 days."


  agent = create_agent(
      ChatOpenAI(model="openai:gpt-5.5"),
      tools=[fetch_order_status],
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "What is the status of order #12345?"}]
  })
  # The agent returns the tool output directly without another LLM call:
  # "Order 12345 is shipped and will arrive in 2 days."
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool
  from langchain_openai import ChatOpenAI


  @tool(return_direct=True)
  def fetch_order_status(order_id: str) -> str:
      """Fetch the current status of a customer order."""
      # In production, query your order management system here
      return f"Order {order_id} is shipped and will arrive in 2 days."


  agent = create_agent(
      ChatOpenAI(model="anthropic:claude-sonnet-4-6"),
      tools=[fetch_order_status],
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "What is the status of order #12345?"}]
  })
  # The agent returns the tool output directly without another LLM call:
  # "Order 12345 is shipped and will arrive in 2 days."
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool
  from langchain_openai import ChatOpenAI


  @tool(return_direct=True)
  def fetch_order_status(order_id: str) -> str:
      """Fetch the current status of a customer order."""
      # In production, query your order management system here
      return f"Order {order_id} is shipped and will arrive in 2 days."


  agent = create_agent(
      ChatOpenAI(model="openrouter:z-ai/glm-5.2"),
      tools=[fetch_order_status],
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "What is the status of order #12345?"}]
  })
  # The agent returns the tool output directly without another LLM call:
  # "Order 12345 is shipped and will arrive in 2 days."
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool
  from langchain_openai import ChatOpenAI


  @tool(return_direct=True)
  def fetch_order_status(order_id: str) -> str:
      """Fetch the current status of a customer order."""
      # In production, query your order management system here
      return f"Order {order_id} is shipped and will arrive in 2 days."


  agent = create_agent(
      ChatOpenAI(model="fireworks:accounts/fireworks/models/glm-5p2"),
      tools=[fetch_order_status],
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "What is the status of order #12345?"}]
  })
  # The agent returns the tool output directly without another LLM call:
  # "Order 12345 is shipped and will arrive in 2 days."
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool
  from langchain_openai import ChatOpenAI


  @tool(return_direct=True)
  def fetch_order_status(order_id: str) -> str:
      """Fetch the current status of a customer order."""
      # In production, query your order management system here
      return f"Order {order_id} is shipped and will arrive in 2 days."


  agent = create_agent(
      ChatOpenAI(model="baseten:zai-org/GLM-5.2"),
      tools=[fetch_order_status],
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "What is the status of order #12345?"}]
  })
  # The agent returns the tool output directly without another LLM call:
  # "Order 12345 is shipped and will arrive in 2 days."
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool
  from langchain_openai import ChatOpenAI


  @tool(return_direct=True)
  def fetch_order_status(order_id: str) -> str:
      """Fetch the current status of a customer order."""
      # In production, query your order management system here
      return f"Order {order_id} is shipped and will arrive in 2 days."


  agent = create_agent(
      ChatOpenAI(model="ollama:north-mini-code-1.0"),
      tools=[fetch_order_status],
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "What is the status of order #12345?"}]
  })
  # The agent returns the tool output directly without another LLM call:
  # "Order 12345 is shipped and will arrive in 2 days."
  ```
</CodeGroup>

行为：

* 该工具正常执行，其输出包装在 `ToolMessage` 中。
* 代理停止循环并返回工具的输出作为最终响应，绕过任何其他模型调用。
* 如果模型单次调用多个工具，只有当**所有**调用的工具都有`return_direct=True`时，`return_direct`才生效。

在以下情况下使用此功能：* 该工具的输出是完整的、可供用户使用的答案（例如，返回可立即显示的结果的查找）。
* 当不需要额外的推理时，您希望避免额外的模型调用。
* 您需要确定性的、未经修改的输出 - 模型无法重新表述、总结或对工具结果采取行动。

<Warning>
  由于模型不处理工具的输出，`return_direct=True` 不适合其结果需要进一步推理、汇总或与其他工具调用链接的工具。
</Warning>

### 错误处理

使用 LangChain 代理[middleware](/oss/python/langchain/middleware)处理工具错误，重试失败的工具调用或返回自定义错误消息：

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from collections.abc import Callable

  from langchain.agents import create_agent
  from langchain.agents.middleware import wrap_tool_call
  from langchain.messages import ToolMessage
  from langchain.tools.tool_node import ToolCallRequest


  @wrap_tool_call
  def handle_tool_errors(
      request: ToolCallRequest,
      handler: Callable[[ToolCallRequest], ToolMessage],
  ) -> ToolMessage:
      """Convert tool exceptions into ToolMessages the model can handle."""
      try:
          return handler(request)
      except Exception as e:
          return ToolMessage(
              content=f"Tool error: Please check your input and try again. ({e})",
              tool_call_id=request.tool_call["id"],
          )


  agent = create_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[],
      middleware=[handle_tool_errors],
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from collections.abc import Callable

  from langchain.agents import create_agent
  from langchain.agents.middleware import wrap_tool_call
  from langchain.messages import ToolMessage
  from langchain.tools.tool_node import ToolCallRequest


  @wrap_tool_call
  def handle_tool_errors(
      request: ToolCallRequest,
      handler: Callable[[ToolCallRequest], ToolMessage],
  ) -> ToolMessage:
      """Convert tool exceptions into ToolMessages the model can handle."""
      try:
          return handler(request)
      except Exception as e:
          return ToolMessage(
              content=f"Tool error: Please check your input and try again. ({e})",
              tool_call_id=request.tool_call["id"],
          )


  agent = create_agent(
      model="openai:gpt-5.5",
      tools=[],
      middleware=[handle_tool_errors],
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from collections.abc import Callable

  from langchain.agents import create_agent
  from langchain.agents.middleware import wrap_tool_call
  from langchain.messages import ToolMessage
  from langchain.tools.tool_node import ToolCallRequest


  @wrap_tool_call
  def handle_tool_errors(
      request: ToolCallRequest,
      handler: Callable[[ToolCallRequest], ToolMessage],
  ) -> ToolMessage:
      """Convert tool exceptions into ToolMessages the model can handle."""
      try:
          return handler(request)
      except Exception as e:
          return ToolMessage(
              content=f"Tool error: Please check your input and try again. ({e})",
              tool_call_id=request.tool_call["id"],
          )


  agent = create_agent(
      model="anthropic:claude-sonnet-4-6",
      tools=[],
      middleware=[handle_tool_errors],
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from collections.abc import Callable

  from langchain.agents import create_agent
  from langchain.agents.middleware import wrap_tool_call
  from langchain.messages import ToolMessage
  from langchain.tools.tool_node import ToolCallRequest


  @wrap_tool_call
  def handle_tool_errors(
      request: ToolCallRequest,
      handler: Callable[[ToolCallRequest], ToolMessage],
  ) -> ToolMessage:
      """Convert tool exceptions into ToolMessages the model can handle."""
      try:
          return handler(request)
      except Exception as e:
          return ToolMessage(
              content=f"Tool error: Please check your input and try again. ({e})",
              tool_call_id=request.tool_call["id"],
          )


  agent = create_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=[],
      middleware=[handle_tool_errors],
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from collections.abc import Callable

  from langchain.agents import create_agent
  from langchain.agents.middleware import wrap_tool_call
  from langchain.messages import ToolMessage
  from langchain.tools.tool_node import ToolCallRequest


  @wrap_tool_call
  def handle_tool_errors(
      request: ToolCallRequest,
      handler: Callable[[ToolCallRequest], ToolMessage],
  ) -> ToolMessage:
      """Convert tool exceptions into ToolMessages the model can handle."""
      try:
          return handler(request)
      except Exception as e:
          return ToolMessage(
              content=f"Tool error: Please check your input and try again. ({e})",
              tool_call_id=request.tool_call["id"],
          )


  agent = create_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=[],
      middleware=[handle_tool_errors],
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from collections.abc import Callable

  from langchain.agents import create_agent
  from langchain.agents.middleware import wrap_tool_call
  from langchain.messages import ToolMessage
  from langchain.tools.tool_node import ToolCallRequest


  @wrap_tool_call
  def handle_tool_errors(
      request: ToolCallRequest,
      handler: Callable[[ToolCallRequest], ToolMessage],
  ) -> ToolMessage:
      """Convert tool exceptions into ToolMessages the model can handle."""
      try:
          return handler(request)
      except Exception as e:
          return ToolMessage(
              content=f"Tool error: Please check your input and try again. ({e})",
              tool_call_id=request.tool_call["id"],
          )


  agent = create_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=[],
      middleware=[handle_tool_errors],
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from collections.abc import Callable

  from langchain.agents import create_agent
  from langchain.agents.middleware import wrap_tool_call
  from langchain.messages import ToolMessage
  from langchain.tools.tool_node import ToolCallRequest


  @wrap_tool_call
  def handle_tool_errors(
      request: ToolCallRequest,
      handler: Callable[[ToolCallRequest], ToolMessage],
  ) -> ToolMessage:
      """Convert tool exceptions into ToolMessages the model can handle."""
      try:
          return handler(request)
      except Exception as e:
          return ToolMessage(
              content=f"Tool error: Please check your input and try again. ({e})",
              tool_call_id=request.tool_call["id"],
          )


  agent = create_agent(
      model="ollama:north-mini-code-1.0",
      tools=[],
      middleware=[handle_tool_errors],
  )
  ```
</CodeGroup>

### 状态注入

工具通过[⟦T117⟧](https://reference.langchain.com/python/langchain/tools/#langchain.tools.ToolRuntime)访问图状态。有关状态、上下文、存储和流 API，请参阅 [Access context](#access-context)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool, ToolRuntime

@tool
def get_message_count(runtime: ToolRuntime) -> str:
    """Get the number of messages in the conversation."""
    messages = runtime.state["messages"]
    return f"There are {len(messages)} messages."
```

有关从工具访问状态、上下文和长期记忆的更多详细信息，请参阅[Access context](#access-context)。

## 动态工具选择使用动态工具，代理可用的工具集可以在运行时修改，而不是预先定义。并非每种工具都适合每种情况。太多的工具可能会压垮模型（超载上下文）并增加错误；太少限制了能力。动态工具选择可以根据身份验证状态、用户权限、功能标志或对话阶段来调整可用的工具集。

根据工具是否提前已知，有两种方法：

<Tabs>
  <Tab title="Filtering pre-registered tools">
    当所有可能的工具在代理创建时已知时，您可以预先注册它们，并根据状态、权限或上下文动态过滤哪些工具暴露给模型。

    <Tabs>
      <Tab title="State">
        仅在某些对话里程碑后启用高级工具：

        ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langchain.agents import create_agent
        from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
        from typing import Callable

        @wrap_model_call
        def state_based_tools(
            request: ModelRequest,
            handler: Callable[[ModelRequest], ModelResponse]
        ) -> ModelResponse:
            """Filter tools based on conversation State."""
            # Read from State: check if user has authenticated
            state = request.state
            is_authenticated = state.get("authenticated", False)
            message_count = len(state["messages"])

            # Only enable sensitive tools after authentication
            if not is_authenticated:
                tools = [t for t in request.tools if t.name.startswith("public_")]
                request = request.override(tools=tools)
            elif message_count < 5:
                # Limit tools early in conversation
                tools = [t for t in request.tools if t.name != "advanced_search"]
                request = request.override(tools=tools)

            return handler(request)

        agent = create_agent(
            model="gpt-5.5",
            tools=[public_search, private_search, advanced_search],
            middleware=[state_based_tools]
        )
        ```
      </Tab>

      <Tab title="Store">
        根据用户偏好或商店中的功能标志过滤工具：

        ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from dataclasses import dataclass
        from langchain.agents import create_agent
        from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
        from typing import Callable
        from langgraph.store.memory import InMemoryStore

        @dataclass
        class Context:
            user_id: str

        @wrap_model_call
        def store_based_tools(
            request: ModelRequest,
            handler: Callable[[ModelRequest], ModelResponse]
        ) -> ModelResponse:
            """Filter tools based on Store preferences."""
            user_id = request.runtime.context.user_id

            # Read from Store: get user's enabled features
            store = request.runtime.store
            feature_flags = store.get(("features",), user_id)

            if feature_flags:
                enabled_features = feature_flags.value.get("enabled_tools", [])
                # Only include tools that are enabled for this user
                tools = [t for t in request.tools if t.name in enabled_features]
                request = request.override(tools=tools)

            return handler(request)

        agent = create_agent(
            model="gpt-5.5",
            tools=[search_tool, analysis_tool, export_tool],
            middleware=[store_based_tools],
            context_schema=Context,
            store=InMemoryStore()
        )
        ```
      </Tab>

      <Tab title="Runtime Context">
        根据运行时上下文中的用户权限过滤工具：

        ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from dataclasses import dataclass
        from langchain.agents import create_agent
        from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
        from typing import Callable

        @dataclass
        class Context:
            user_role: str

        @wrap_model_call
        def context_based_tools(
            request: ModelRequest,
            handler: Callable[[ModelRequest], ModelResponse]
        ) -> ModelResponse:
            """Filter tools based on Runtime Context permissions."""
            # Read from Runtime Context: get user role
            if request.runtime is None or request.runtime.context is None:
                # If no context provided, default to viewer (most restrictive)
                user_role = "viewer"
            else:
                user_role = request.runtime.context.user_role

            if user_role == "admin":
                # Admins get all tools
                pass
            elif user_role == "editor":
                # Editors can't delete
                tools = [t for t in request.tools if t.name != "delete_data"]
                request = request.override(tools=tools)
            else:
                # Viewers get read-only tools
                tools = [t for t in request.tools if t.name.startswith("read_")]
                request = request.override(tools=tools)

            return handler(request)

        agent = create_agent(
            model="gpt-5.5",
            tools=[read_data, write_data, delete_data],
            middleware=[context_based_tools],
            context_schema=Context
        )
        ```
      </Tab>
    </Tabs>

    这种方法在以下情况下效果最佳：* 所有可能的工具在编译/启动时都是已知的
    * 您想要根据权限、功能标志或对话状态进行过滤
    * 工具是静态的，但其可用性是动态的

    更多示例请参见[Dynamically selecting tools](/oss/python/langchain/middleware/custom#dynamically-selecting-tools)。
  </Tab>

  <Tab title="Runtime tool registration">
    当在运行时发现或创建工具时（例如，从 MCP 服务器加载、根据用户数据生成或从远程注册表获取），您需要注册工具并动态处理其执行。

    这需要两个中间件挂钩：

    1. `wrap_model_call` - 将动态工具添加到请求中
    2. `wrap_tool_call` - 处理动态添加工具的执行

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.tools import tool
    from langchain.agents import create_agent
    from langchain.agents.middleware import AgentMiddleware, ModelRequest, ToolCallRequest

    # A tool that will be added dynamically at runtime
    @tool
    def calculate_tip(bill_amount: float, tip_percentage: float = 20.0) -> str:
        """Calculate the tip amount for a bill."""
        tip = bill_amount * (tip_percentage / 100)
        return f"Tip: ${tip:.2f}, Total: ${bill_amount + tip:.2f}"

    class DynamicToolMiddleware(AgentMiddleware):
        """Middleware that registers and handles dynamic tools."""

        def wrap_model_call(self, request: ModelRequest, handler):
            # Add dynamic tool to the request
            # This could be loaded from an MCP server, database, etc.
            updated = request.override(tools=[*request.tools, calculate_tip])
            return handler(updated)

        def wrap_tool_call(self, request: ToolCallRequest, handler):
            # Handle execution of the dynamic tool
            if request.tool_call["name"] == "calculate_tip":
                return handler(request.override(tool=calculate_tip))
            return handler(request)

    agent = create_agent(
        model="gpt-5.5",
        tools=[get_weather],  # Only static tools registered here
        middleware=[DynamicToolMiddleware()],
    )

    # The agent can now use both get_weather AND calculate_tip
    result = agent.invoke({
        "messages": [{"role": "user", "content": "Calculate a 20% tip on $85"}]
    })
    ```

    这种方法在以下情况下效果最佳：

    * 工具在运行时发现（例如，从 MCP 服务器）
    * 工具根据用户数据或配置动态生成
    * 您正在与外部工具注册表集成

    <Note>
      运行时注册的工具需要 `wrap_tool_call` 钩子，因为代理需要知道如何执行原始工具列表中没有的工具。如果没有它，代理将不知道如何调用动态添加的工具。
    </Note>
  </Tab>
</Tabs>

## 无头工具某些工具应该在**用户应用程序运行的地方**（通常是浏览器）运行，而不是在进程内部运行。 **无头工具**是工具定义，其中包括您在代理的**服务器**上注册的名称、描述和参数架构。 **实现**仅在**客户端**上注册，并在短暂的中断/恢复握手后执行。

这与函数体运行在服务器上的普通工具不同，也与模型提供者远程执行内置工具的[server-side tool use](#server-side-tool-use)不同。

### 何时使用无头工具

当工作依赖于仅存在于客户端的**环境、设备或 UI** 时，请使用它们。例如：

* **浏览器 API：** 地理定位、IndexedDB、剪贴板、Canvas 2D、文件选择器、电池 API 等。
* **隐私和局部性：** 数据保留在设备上（例如，IndexedDB 中的本地“内存”）。
* **延迟：** 纯本地操作无需额外的服务器往返。
* **结构化、安全的效果：** 更喜欢许多小型的类型化工具（例如每个画布图元一个工具），而不是向 `eval` 发送任意代码。

### 该模式如何运作在这两个运行时中，模型都会看到它可以调用的普通工具，但实际执行发生在服务器进程之外。

1. **定义**一个带有 `tool(name=..., description=..., args_schema=...)` 和 `langchain.tools` 的无头工具。无头工具仅具有模式，没有进程内实现。
2. **使用 `create_agent` 或您的 LangGraph 图表注册**该工具，以便模型可以正常调用它。
3. 调用该工具时**处理**中断负载。该图不是在本地运行，而是以形状类似 `{"type": "tool", "tool_call": {"id", "name", "args"}}` 的有效负载暂停。
4. **在您的应用程序、其他服务或人工步骤执行操作后恢复**图表。对于基于浏览器的流程，您可以在前端镜像架构并在那里附加 `.implement(...)`。

<Info>
  如果您在Python中仅使用`name`、`description`和`args_schema`调用`tool(...)`，LangChain将返回`HeadlessTool`。 Python 端没有`.implement()` API。
</Info>当模型发出对这些工具之一的工具调用时，运行**中断**，而不是在本地执行该工具。您的应用程序可以检查有效负载，在正确的环境（例如浏览器、其他服务或人工审核步骤）中执行操作，然后使用工具结果**恢复**图表。当您使用受支持的 JS SDK 挂钩时，它们可以检测无头工具中断，运行匹配的客户端实现，并为您提交恢复命令。

使用可选的 **`onTool`** 回调来观察生命周期事件（`start`、`success`、`error`）以获取 UI 反馈，例如旋转器或 toast。

<Card title="Headless tools frontend pattern" href="/oss/python/langchain/frontend/headless-tools" icon="device-desktop">
  请参阅使用 `useStream` 在客户端中执行的仅模式工具的端到端示例。
</Card>

## 预构建工具

LangChain 提供了大量预构建工具和工具包，用于执行 Web 搜索、代码解释、数据库访问等常见任务。这些即用型工具可以直接集成到您的代理中，无需编写自定义代码。

请参阅 [tools and toolkits](/oss/python/integrations/tools) 集成页面，获取按类别组织的可用工具的完整列表。

## 服务器端工具使用某些聊天模型具有由模型提供者在服务器端执行的内置工具。其中包括网络搜索和代码解释器等功能，不需要您定义或托管工具逻辑。

有关启用和使用这些内置工具的详细信息，请参阅单独的 [chat model integration pages](/oss/python/integrations/providers) 和 [tool calling documentation](/oss/python/langchain/models#server-side-tool-use)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/tools.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>