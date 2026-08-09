<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Runtime | https://docs.langchain.com/oss/python/langchain/runtime -->

## 概述

LangChain 的 [⟦T5⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 在 LangGraph 的运行时上运行。

LangGraph 公开了一个 [⟦T6⟧](https://reference.langchain.com/python/langgraph/runtime/Runtime) 对象，其中包含以下信息：

1. **上下文**：静态信息，例如用户 ID、数据库连接或代理调用的其他依赖项
2. **Store**：用于[long-term memory](/oss/python/langchain/long-term-memory)的[BaseStore](https://reference.langchain.com/python/langchain-core/stores/BaseStore)实例
3. **Stream writer**：用于通过`"custom"`流模式传输信息的对象
4. **执行信息**：当前执行的身份和重试信息（线程ID、运行ID、尝试次数）
5. **服务器信息**：在 LangGraph Server 上运行时特定于服务器的元数据（助手 ID、图形 ID、经过身份验证的用户）

<Tip>
  运行时上下文为您的工具和中间件提供**依赖注入**。您可以在调用代理时注入运行时依赖项（例如数据库连接、用户 ID 或配置），而不是硬编码值或使用全局状态。这使您的工具更加可测试、可重用且灵活。
</Tip>

您可以在[tools](#inside-tools)和[middleware](#inside-middleware)中访问运行时信息。

## 访问

使用[⟦T8⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)创建代理时，可以指定一个`context_schema`来定义存储在代理[⟦T11⟧](https://reference.langchain.com/python/langgraph/runtime/Runtime)中的`context`的结构。调用代理时，传递 `context` 参数以及运行的相关配置：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from dataclasses import dataclass

from langchain.agents import create_agent


@dataclass
class Context:
    user_name: str

agent = create_agent(
    model="gpt-5-nano",
    tools=[...],
    context_schema=Context  # [!code highlight]
)

agent.invoke(
    {"messages": [{"role": "user", "content": "What's my name?"}]},
    context=Context(user_name="John Smith")  # [!code highlight]
)
```

### 内部工具

您可以访问工具内部的运行时信息来：

* 访问上下文
* 读取或写入长期记忆
* 写入[custom stream](/oss/python/langchain/streaming#custom-updates)（例如，工具进度/更新）

使用 `ToolRuntime` 参数访问工具内的 [⟦T14⟧](https://reference.langchain.com/python/langgraph/runtime/Runtime) 对象。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from dataclasses import dataclass
from langchain.tools import tool, ToolRuntime  # [!code highlight]

@dataclass
class Context:
    user_id: str

@tool
def fetch_user_email_preferences(runtime: ToolRuntime[Context]) -> str:  # [!code highlight]
    """Fetch the user's email preferences from the store."""
    user_id = runtime.context.user_id  # [!code highlight]

    preferences: str = "The user prefers you to write a brief and polite email."
    if runtime.store:  # [!code highlight]
        if memory := runtime.store.get(("users",), user_id):  # [!code highlight]
            preferences = memory.value["preferences"]

    return preferences
```

### 工具内的执行信息和服务器信息

在 LangGraph Server 上运行时，通过 `runtime.execution_info` 访问执行身份（线程 ID、运行 ID），并通过 `runtime.server_info` 访问服务器特定的元数据（助手 ID、经过身份验证的用户）：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool, ToolRuntime

@tool
def context_aware_tool(runtime: ToolRuntime) -> str:
    """A tool that uses execution and server info."""
    # Access thread and run IDs
    info = runtime.execution_info
    print(f"Thread: {info.thread_id}, Run: {info.run_id}")  # [!code highlight]

    # Access server info (only available on LangGraph Server)
    server = runtime.server_info
    if server is not None:
        print(f"Assistant: {server.assistant_id}")  # [!code highlight]
        if server.user is not None:
            print(f"User: {server.user.identity}")  # [!code highlight]

    return "done"
```

当不在 LangGraph Server 上运行时（例如，在本地开发期间），`server_info` 是 `None`。

<Note>
  `runtime.execution_info` 和 `runtime.server_info` 需要 `deepagents>=0.5.0`（或 `langgraph>=1.1.5`）。
</Note>

### 内部中间件

您可以访问中间件中的运行时信息，以创建动态提示、修改消息或根据用户上下文控制代理行为。

使用`Runtime`参数访问[node-style hooks](/oss/python/langchain/middleware/custom#node-style-hooks)内的[⟦T24⟧](https://reference.langchain.com/python/langgraph/runtime/Runtime)对象。  对于 [wrap-style hooks](/oss/python/langchain/middleware/custom#wrap-style-hooks)，`Runtime` 对象在 [⟦T26⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/ModelRequest) 参数内可用。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from dataclasses import dataclass

from langchain.messages import AnyMessage
from langchain.agents import create_agent, AgentState
from langchain.agents.middleware import dynamic_prompt, ModelRequest, before_model, after_model
from langgraph.runtime import Runtime


@dataclass
class Context:
    user_name: str

# Dynamic prompts
@dynamic_prompt
def dynamic_system_prompt(request: ModelRequest) -> str:
    user_name = request.runtime.context.user_name  # [!code highlight]
    system_prompt = f"You are a helpful assistant. Address the user as {user_name}."
    return system_prompt

# Before model hook
@before_model
def log_before_model(state: AgentState, runtime: Runtime[Context]) -> dict | None:  # [!code highlight]
    print(f"Processing request for user: {runtime.context.user_name}")  # [!code highlight]
    return None

# After model hook
@after_model
def log_after_model(state: AgentState, runtime: Runtime[Context]) -> dict | None:  # [!code highlight]
    print(f"Completed request for user: {runtime.context.user_name}")  # [!code highlight]
    return None

agent = create_agent(
    model="gpt-5-nano",
    tools=[...],
    middleware=[dynamic_system_prompt, log_before_model, log_after_model],  # [!code highlight]
    context_schema=Context
)

agent.invoke(
    {"messages": [{"role": "user", "content": "What's my name?"}]},
    context=Context(user_name="John Smith")
)
```

### 中间件内的执行信息和服务器信息

中间件钩子还可以访问`runtime.execution_info`和`runtime.server_info`：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import AgentState
from langchain.agents.middleware import before_model
from langgraph.runtime import Runtime


@before_model
def auth_gate(state: AgentState, runtime: Runtime) -> dict | None:
    """Block unauthenticated users when running on LangGraph Server."""
    server = runtime.server_info
    if server is not None and server.user is None:  # [!code highlight]
        raise ValueError("Authentication required")
    print(f"Thread: {runtime.execution_info.thread_id}")  # [!code highlight]
    return None
```

<Note>
  需要`deepagents>=0.5.0`（或`langgraph>=1.1.5`）。
</Note>

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/runtime.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>