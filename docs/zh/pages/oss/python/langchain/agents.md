<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Agents | https://docs.langchain.com/oss/python/langchain/agents -->

# 代理

代理是一个循环调用工具的模型，直到给定的任务完成。

<img alt="Core agent loop diagram" />

线束是围绕该循环的一切：提示、工具以及塑造模型行为的任何中间件。

<Note>
  **特工=模特+线束**

  线束的工作：为给定任务在正确的时间为模型提供正确的上下文。
</Note>

[⟦T112⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 是一款高度可配置的线束。最简单的是，您可以使用以下命令创建一个：

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(model="google_genai:gemini-3.6-flash", tools=tools)
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(model="openai:gpt-5.5", tools=tools)
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(model="anthropic:claude-sonnet-4-6", tools=tools)
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(model="openrouter:z-ai/glm-5.2", tools=tools)
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(model="fireworks:accounts/fireworks/models/glm-5p2", tools=tools)
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(model="baseten:zai-org/GLM-5.2", tools=tools)
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(model="ollama:north-mini-code-1.0", tools=tools)
  ```
</CodeGroup>

在此基础上，您可以直接使用 `model=`、`tools=` 和 `system_prompt=` 参数配置基础知识。如需更高级的功能，请使用 [middleware](#configure-the-harness) 延长线束。

<Tip>
  [Deep Agents](/oss/python/deepagents/overview) 构建于 `create_agent` 之上，并附带已组装的常用功能，例如规划、文件系统工具、子代理和内存。当您需要自己配置线束时，请使用`create_agent`。
</Tip>

## 核心组件

<img alt="Agent model and harness components diagram" />

### 型号

传递模型标识符字符串 (`"provider:model"`) 或初始化的模型实例来为代理选择模型。有关参数、提供程序设置和动态模型选择，请参阅[Models](/oss/python/langchain/models)。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(model="google_genai:gemini-3.6-flash", tools=tools)
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(model="openai:gpt-5.5", tools=tools)
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(model="anthropic:claude-sonnet-4-6", tools=tools)
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(model="openrouter:z-ai/glm-5.2", tools=tools)
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(model="fireworks:accounts/fireworks/models/glm-5p2", tools=tools)
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(model="baseten:zai-org/GLM-5.2", tools=tools)
  ``````python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(model="ollama:north-mini-code-1.0", tools=tools)
  ```
</CodeGroup>

### 工具

要为代理提供工具，请传递任何 Python 可调用工具、LangChain 工具或工具字典。有关工具定义、上下文访问和动态工具选择，请参阅[Tools](/oss/python/langchain/tools)。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for information."""
      return f"Results for: {query}"


  agent = create_agent(model="google_genai:gemini-3.6-flash", tools=[search])
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for information."""
      return f"Results for: {query}"


  agent = create_agent(model="openai:gpt-5.5", tools=[search])
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for information."""
      return f"Results for: {query}"


  agent = create_agent(model="anthropic:claude-sonnet-4-6", tools=[search])
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for information."""
      return f"Results for: {query}"


  agent = create_agent(model="openrouter:z-ai/glm-5.2", tools=[search])
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for information."""
      return f"Results for: {query}"


  agent = create_agent(model="fireworks:accounts/fireworks/models/glm-5p2", tools=[search])
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for information."""
      return f"Results for: {query}"


  agent = create_agent(model="baseten:zai-org/GLM-5.2", tools=[search])
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for information."""
      return f"Results for: {query}"


  agent = create_agent(model="ollama:north-mini-code-1.0", tools=[search])
  ```
</CodeGroup>

###系统提示

塑造代理处理任务的方式。系统提示参数接受字符串或`SystemMessage`。对于运行时的动态提示，请使用[middleware](/oss/python/langchain/middleware)。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  agent = create_agent(
      model="google_genai:gemini-3.6-flash",
      tools=tools,
      system_prompt="You are a helpful assistant. Be concise and accurate.",
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  agent = create_agent(
      model="openai:gpt-5.5",
      tools=tools,
      system_prompt="You are a helpful assistant. Be concise and accurate.",
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  agent = create_agent(
      model="anthropic:claude-sonnet-4-6",
      tools=tools,
      system_prompt="You are a helpful assistant. Be concise and accurate.",
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  agent = create_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=tools,
      system_prompt="You are a helpful assistant. Be concise and accurate.",
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  agent = create_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=tools,
      system_prompt="You are a helpful assistant. Be concise and accurate.",
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  agent = create_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=tools,
      system_prompt="You are a helpful assistant. Be concise and accurate.",
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  agent = create_agent(
      model="ollama:north-mini-code-1.0",
      tools=tools,
      system_prompt="You are a helpful assistant. Be concise and accurate.",
  )
  ```
</CodeGroup>

### 结构化输出

使用`response_format=`从代理返回经过验证的模式。有关策略和示例，请参阅[Structured output](/oss/python/langchain/structured-output)。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from pydantic import BaseModel
  from langchain.agents import create_agent


  class Answer(BaseModel):
      summary: str
      confidence: float


  agent = create_agent(model="google_genai:gemini-3.6-flash", tools=tools, response_format=Answer)
  result = agent.invoke({"messages": [{"role": "user", "content": "Summarize AI trends"}]})
  result["structured_response"]  # Answer(summary=..., confidence=...)
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from pydantic import BaseModel
  from langchain.agents import create_agent


  class Answer(BaseModel):
      summary: str
      confidence: float


  agent = create_agent(model="openai:gpt-5.5", tools=tools, response_format=Answer)
  result = agent.invoke({"messages": [{"role": "user", "content": "Summarize AI trends"}]})
  result["structured_response"]  # Answer(summary=..., confidence=...)
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from pydantic import BaseModel
  from langchain.agents import create_agent


  class Answer(BaseModel):
      summary: str
      confidence: float


  agent = create_agent(model="anthropic:claude-sonnet-4-6", tools=tools, response_format=Answer)
  result = agent.invoke({"messages": [{"role": "user", "content": "Summarize AI trends"}]})
  result["structured_response"]  # Answer(summary=..., confidence=...)
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from pydantic import BaseModel
  from langchain.agents import create_agent


  class Answer(BaseModel):
      summary: str
      confidence: float


  agent = create_agent(model="openrouter:z-ai/glm-5.2", tools=tools, response_format=Answer)
  result = agent.invoke({"messages": [{"role": "user", "content": "Summarize AI trends"}]})
  result["structured_response"]  # Answer(summary=..., confidence=...)
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from pydantic import BaseModel
  from langchain.agents import create_agent


  class Answer(BaseModel):
      summary: str
      confidence: float


  agent = create_agent(model="fireworks:accounts/fireworks/models/glm-5p2", tools=tools, response_format=Answer)
  result = agent.invoke({"messages": [{"role": "user", "content": "Summarize AI trends"}]})
  result["structured_response"]  # Answer(summary=..., confidence=...)
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from pydantic import BaseModel
  from langchain.agents import create_agent


  class Answer(BaseModel):
      summary: str
      confidence: float


  agent = create_agent(model="baseten:zai-org/GLM-5.2", tools=tools, response_format=Answer)
  result = agent.invoke({"messages": [{"role": "user", "content": "Summarize AI trends"}]})
  result["structured_response"]  # Answer(summary=..., confidence=...)
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from pydantic import BaseModel
  from langchain.agents import create_agent


  class Answer(BaseModel):
      summary: str
      confidence: float


  agent = create_agent(model="ollama:north-mini-code-1.0", tools=tools, response_format=Answer)
  result = agent.invoke({"messages": [{"role": "user", "content": "Summarize AI trends"}]})
  result["structured_response"]  # Answer(summary=..., confidence=...)
  ```
</CodeGroup>

### 代理状态

每个代理都通过[⟦T121⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/AgentState)管理其执行上下文，这是一个类型化字典，其中保存当前对话历史记录以及您的工具和中间件所需的任何自定义字段。

内置字段是：|领域 |类型 |描述 |
| ---------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `messages` | `list[BaseMessage]` |当前线程的完整对话历史记录。仅追加：添加新消息，从不替换。 |

`AgentState` 也是每个节点样式中间件挂钩的类型签名（`before_model`、`after_model` 等）。钩子接收当前状态并可以返回更新字典以合并回其中。

要添加自定义字段（例如，`user_id`或计数器），子类`AgentState`并通过`state_schema=`将子类传递给`create_agent`：

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import AgentState, create_agent


  class MyState(AgentState):
      user_id: str
      call_count: int


  agent = create_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[],
      state_schema=MyState,  # [!code highlight]
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import AgentState, create_agent


  class MyState(AgentState):
      user_id: str
      call_count: int


  agent = create_agent(
      model="openai:gpt-5.5",
      tools=[],
      state_schema=MyState,  # [!code highlight]
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import AgentState, create_agent


  class MyState(AgentState):
      user_id: str
      call_count: int


  agent = create_agent(
      model="anthropic:claude-sonnet-4-6",
      tools=[],
      state_schema=MyState,  # [!code highlight]
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import AgentState, create_agent


  class MyState(AgentState):
      user_id: str
      call_count: int


  agent = create_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=[],
      state_schema=MyState,  # [!code highlight]
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import AgentState, create_agent


  class MyState(AgentState):
      user_id: str
      call_count: int


  agent = create_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=[],
      state_schema=MyState,  # [!code highlight]
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import AgentState, create_agent


  class MyState(AgentState):
      user_id: str
      call_count: int


  agent = create_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=[],
      state_schema=MyState,  # [!code highlight]
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import AgentState, create_agent


  class MyState(AgentState):
      user_id: str
      call_count: int


  agent = create_agent(
      model="ollama:north-mini-code-1.0",
      tools=[],
      state_schema=MyState,  # [!code highlight]
  )
  ```
</CodeGroup>

有关完整的详细信息、示例和中间件级状态模式，请参阅[Short-term memory](/oss/python/langchain/short-term-memory#customizing-agent-memory)和[Custom middleware](/oss/python/langchain/middleware/custom#state-updates)。

## 调用

<Tip>
  跟踪此循环的每个步骤，调试工具调用，并使用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-agents) 评估代理输出。按照[tracing quickstart](/langsmith/trace-with-langchain)进行设置。我们建议您还设置 [LangSmith Engine](/langsmith/engine) 来监视您的痕迹、检测问题并提出修复建议。
</Tip>您可以使用消息调用代理。在幕后将更新传递给代理的[⟦T131⟧](/oss/python/langgraph/graph-api#state)。所有代理在其所在州都包含[sequence of messages](/oss/python/langgraph/use-graph-api#messagesstate)；要调用代理，请传递新消息以及`thread_id`，以便代理可以保留并恢复对话历史记录：

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[],
      checkpointer=InMemorySaver(),
  )

  config = {"configurable": {"thread_id": str(uuid7())}}

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]},
      config=config,
  )

  # A follow-up turn on the same conversation: reuse the same thread_id to keep history
  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What about tomorrow?"}]},
      config=config,
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_agent(
      model="openai:gpt-5.5",
      tools=[],
      checkpointer=InMemorySaver(),
  )

  config = {"configurable": {"thread_id": str(uuid7())}}

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]},
      config=config,
  )

  # A follow-up turn on the same conversation: reuse the same thread_id to keep history
  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What about tomorrow?"}]},
      config=config,
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_agent(
      model="anthropic:claude-sonnet-4-6",
      tools=[],
      checkpointer=InMemorySaver(),
  )

  config = {"configurable": {"thread_id": str(uuid7())}}

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]},
      config=config,
  )

  # A follow-up turn on the same conversation: reuse the same thread_id to keep history
  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What about tomorrow?"}]},
      config=config,
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=[],
      checkpointer=InMemorySaver(),
  )

  config = {"configurable": {"thread_id": str(uuid7())}}

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]},
      config=config,
  )

  # A follow-up turn on the same conversation: reuse the same thread_id to keep history
  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What about tomorrow?"}]},
      config=config,
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=[],
      checkpointer=InMemorySaver(),
  )

  config = {"configurable": {"thread_id": str(uuid7())}}

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]},
      config=config,
  )

  # A follow-up turn on the same conversation: reuse the same thread_id to keep history
  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What about tomorrow?"}]},
      config=config,
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=[],
      checkpointer=InMemorySaver(),
  )

  config = {"configurable": {"thread_id": str(uuid7())}}

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]},
      config=config,
  )

  # A follow-up turn on the same conversation: reuse the same thread_id to keep history
  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What about tomorrow?"}]},
      config=config,
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_agent(
      model="ollama:north-mini-code-1.0",
      tools=[],
      checkpointer=InMemorySaver(),
  )

  config = {"configurable": {"thread_id": str(uuid7())}}

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]},
      config=config,
  )

  # A follow-up turn on the same conversation: reuse the same thread_id to keep history
  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What about tomorrow?"}]},
      config=config,
  )
  ```
</CodeGroup>

<Note>
  保留与 `thread_id` 的对话历史记录需要使用 [checkpointer](/oss/python/langchain/long-term-memory) 配置代理。当部署在[LangSmith](/langsmith/deployment)上时，会自动配置检查点。在本地，显式传递一个，例如 `create_agent(..., checkpointer=InMemorySaver())`。
</Note>

如果您还需要将每次运行的配置（例如用户 ID、API 密钥或功能标志）传递给工具和中间件，请将其作为 `context` 与 `config` 一起传递。使用 `context_schema` 定义该数据的形状并通过 `runtime.context` 访问它：

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver


  @dataclass
  class Context:
      user_id: str


  agent = create_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[],
      context_schema=Context,
      checkpointer=InMemorySaver(),
  )

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]},
      config={"configurable": {"thread_id": str(uuid7())}},
      context=Context(user_id="user-123"),
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver


  @dataclass
  class Context:
      user_id: str


  agent = create_agent(
      model="openai:gpt-5.5",
      tools=[],
      context_schema=Context,
      checkpointer=InMemorySaver(),
  )

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]},
      config={"configurable": {"thread_id": str(uuid7())}},
      context=Context(user_id="user-123"),
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver


  @dataclass
  class Context:
      user_id: str


  agent = create_agent(
      model="anthropic:claude-sonnet-4-6",
      tools=[],
      context_schema=Context,
      checkpointer=InMemorySaver(),
  )

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]},
      config={"configurable": {"thread_id": str(uuid7())}},
      context=Context(user_id="user-123"),
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver


  @dataclass
  class Context:
      user_id: str


  agent = create_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=[],
      context_schema=Context,
      checkpointer=InMemorySaver(),
  )

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]},
      config={"configurable": {"thread_id": str(uuid7())}},
      context=Context(user_id="user-123"),
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver


  @dataclass
  class Context:
      user_id: str


  agent = create_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=[],
      context_schema=Context,
      checkpointer=InMemorySaver(),
  )

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]},
      config={"configurable": {"thread_id": str(uuid7())}},
      context=Context(user_id="user-123"),
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver


  @dataclass
  class Context:
      user_id: str


  agent = create_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=[],
      context_schema=Context,
      checkpointer=InMemorySaver(),
  )

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]},
      config={"configurable": {"thread_id": str(uuid7())}},
      context=Context(user_id="user-123"),
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.agents import create_agent
  from langchain_core.utils.uuid import uuid7
  from langgraph.checkpoint.memory import InMemorySaver


  @dataclass
  class Context:
      user_id: str


  agent = create_agent(
      model="ollama:north-mini-code-1.0",
      tools=[],
      context_schema=Context,
      checkpointer=InMemorySaver(),
  )

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]},
      config={"configurable": {"thread_id": str(uuid7())}},
      context=Context(user_id="user-123"),
  )
  ```
</CodeGroup>

`thread_id` 限定*对话*（消息历史记录、检查点），而 `context` 则携带您的工具和中间件在调用时读取的*每次运行*数据。两者通常一起传递。有关更多信息，请参阅[tool context](/oss/python/langchain/tools#context) 和 [Runtime](/oss/python/langchain/runtime)。

## 流媒体`invoke` 返回运行结束时的最终响应。如果代理执行多个工具调用，用户通常需要在完成之前更新进度。使用流式传输来显示发生的中间消息和工具活动。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import AIMessage, HumanMessage


stream = agent.stream_events(
    {"messages": [{"role": "user", "content": "Search for AI news and summarize the findings"}]},
    version="v3",
)
for snapshot in stream.values:
    # Each snapshot contains the full state at that point
    latest_message = snapshot["messages"][-1]
    if latest_message.content:
        if isinstance(latest_message, HumanMessage):
            print(f"User: {latest_message.content}")
        elif isinstance(latest_message, AIMessage):
            print(f"Agent: {latest_message.content}")
    elif latest_message.tool_calls:
        print(f"Calling tools: {[tc['name'] for tc in latest_message.tool_calls]}")
```

<Tip>
  有关流模式、事件类型和 UI 模式，请参阅 [Streaming](/oss/python/langchain/streaming)。
</Tip>

## 配置线束

`create_agent` 具有高度可扩展性。中间件是定制的基础：每个部分处理一个问题，在适当的时刻挂接到代理循环中，并与任何其他部分自由组合。准确获取您的用例所需的内容并跳过其余部分。

通用模式被预先构建为一流的中间件。您可以构建任何其他东西作为[custom middleware](/oss/python/langchain/middleware/custom)。

<img alt="Agent harness capabilities by category" />

当代理承担复杂的工作时，他们需要几个关键领域的支持。中间件生态系统提供：

<CardGroup>
  <Card title="Execution environment" icon="bolt" href="#execution-environment">
    工具、文件系统、沙箱和代码执行
  </Card>

  <Card title="Context management" icon="database" href="#context-management">
    总结、记忆、技巧、提示缓存
  </Card>

  <Card title="Planning and delegation" icon="sitemap" href="#planning-and-delegation">
    用于并行、隔离工作的待办事项列表和子代理
  </Card>

  <Card title="Fault tolerance" icon="shield" href="#fault-tolerance">
    重试、回退和调用限制
  </Card>

  <Card title="Guardrails" icon="lock" href="#guardrails">
    PII 检测和内容控制
  </Card><Card title="Steering" icon="user" href="#steering">
    在采取高影响力行动之前进行人机交互批准
  </Card>
</CardGroup>

<Tip>
  `create_deep_agent` 为长时间运行的编码和研究任务预先组装该堆栈（默认情况下包括文件系统、摘要、子代理和提示缓存）。请参阅 [Deep Agents](/oss/python/deepagents/harness) 了解完整的预制线束。
</Tip>

### 执行环境

当代理可以采取行动而不仅仅是生成文本时，它们特别有用。执行环境为代理提供了一个工作空间：它可以调用的工具、用于跨轮读写文件的文件系统以及用于运行脚本或 shell 命令的代码执行。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware

  agent = create_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[search],
      middleware=[FilesystemMiddleware(backend=StateBackend())],
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware

  agent = create_agent(
      model="openai:gpt-5.5",
      tools=[search],
      middleware=[FilesystemMiddleware(backend=StateBackend())],
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware

  agent = create_agent(
      model="anthropic:claude-sonnet-4-6",
      tools=[search],
      middleware=[FilesystemMiddleware(backend=StateBackend())],
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware

  agent = create_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=[search],
      middleware=[FilesystemMiddleware(backend=StateBackend())],
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware

  agent = create_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=[search],
      middleware=[FilesystemMiddleware(backend=StateBackend())],
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware

  agent = create_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=[search],
      middleware=[FilesystemMiddleware(backend=StateBackend())],
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware

  agent = create_agent(
      model="ollama:north-mini-code-1.0",
      tools=[search],
      middleware=[FilesystemMiddleware(backend=StateBackend())],
  )
  ```
</CodeGroup>

参见[⟦T144⟧](https://reference.langchain.com/python/deepagents/middleware/filesystem/FilesystemMiddleware)、[Sandboxes](/oss/python/deepagents/sandboxes)、[Interpreters](/oss/python/deepagents/interpreters)。

<Note>
  此示例从 `deepagents` 包导入。安装它：

  <CodeGroup>
    ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install deepagents
    ```

    ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    uv add deepagents
    ```
  </CodeGroup>
</Note>

### 上下文管理每个模型调用都有一个固定的上下文窗口。当代理运行时，该窗口会填充累积的历史记录、工具结果和中间步骤。汇总会在溢出发生之前压缩历史记录；内存在启动时加载持久指令，以便知识跨会话传递；技能按需呈现领域知识，而不是预先加载所有内容。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware, MemoryMiddleware, SkillsMiddleware, SummarizationMiddleware

  backend = StateBackend()
  model="google_genai:gemini-3.6-flash"

  agent = create_agent(
      model=model,
      tools=[search],
      middleware=[
          FilesystemMiddleware(backend=backend),
          SummarizationMiddleware(model=model, backend=backend),
          MemoryMiddleware(backend=backend, sources=["./AGENTS.md"]),
          SkillsMiddleware(backend=backend, sources=["./skills/"]),
      ],
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware, MemoryMiddleware, SkillsMiddleware, SummarizationMiddleware

  backend = StateBackend()
  model="openai:gpt-5.5"

  agent = create_agent(
      model=model,
      tools=[search],
      middleware=[
          FilesystemMiddleware(backend=backend),
          SummarizationMiddleware(model=model, backend=backend),
          MemoryMiddleware(backend=backend, sources=["./AGENTS.md"]),
          SkillsMiddleware(backend=backend, sources=["./skills/"]),
      ],
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware, MemoryMiddleware, SkillsMiddleware, SummarizationMiddleware

  backend = StateBackend()
  model="anthropic:claude-sonnet-4-6"

  agent = create_agent(
      model=model,
      tools=[search],
      middleware=[
          FilesystemMiddleware(backend=backend),
          SummarizationMiddleware(model=model, backend=backend),
          MemoryMiddleware(backend=backend, sources=["./AGENTS.md"]),
          SkillsMiddleware(backend=backend, sources=["./skills/"]),
      ],
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware, MemoryMiddleware, SkillsMiddleware, SummarizationMiddleware

  backend = StateBackend()
  model="openrouter:z-ai/glm-5.2"

  agent = create_agent(
      model=model,
      tools=[search],
      middleware=[
          FilesystemMiddleware(backend=backend),
          SummarizationMiddleware(model=model, backend=backend),
          MemoryMiddleware(backend=backend, sources=["./AGENTS.md"]),
          SkillsMiddleware(backend=backend, sources=["./skills/"]),
      ],
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware, MemoryMiddleware, SkillsMiddleware, SummarizationMiddleware

  backend = StateBackend()
  model="fireworks:accounts/fireworks/models/glm-5p2"

  agent = create_agent(
      model=model,
      tools=[search],
      middleware=[
          FilesystemMiddleware(backend=backend),
          SummarizationMiddleware(model=model, backend=backend),
          MemoryMiddleware(backend=backend, sources=["./AGENTS.md"]),
          SkillsMiddleware(backend=backend, sources=["./skills/"]),
      ],
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware, MemoryMiddleware, SkillsMiddleware, SummarizationMiddleware

  backend = StateBackend()
  model="baseten:zai-org/GLM-5.2"

  agent = create_agent(
      model=model,
      tools=[search],
      middleware=[
          FilesystemMiddleware(backend=backend),
          SummarizationMiddleware(model=model, backend=backend),
          MemoryMiddleware(backend=backend, sources=["./AGENTS.md"]),
          SkillsMiddleware(backend=backend, sources=["./skills/"]),
      ],
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware, MemoryMiddleware, SkillsMiddleware, SummarizationMiddleware

  backend = StateBackend()
  model="ollama:north-mini-code-1.0"

  agent = create_agent(
      model=model,
      tools=[search],
      middleware=[
          FilesystemMiddleware(backend=backend),
          SummarizationMiddleware(model=model, backend=backend),
          MemoryMiddleware(backend=backend, sources=["./AGENTS.md"]),
          SkillsMiddleware(backend=backend, sources=["./skills/"]),
      ],
  )
  ```
</CodeGroup>

参见[⟦T146⟧](https://reference.langchain.com/python/langchain/agents/middleware/summarization/SummarizationMiddleware)、[⟦T147⟧](https://reference.langchain.com/python/deepagents/middleware/memory/MemoryMiddleware)、[Skills](/oss/python/langchain/multi-agent/skills)、[Context engineering](/oss/python/deepagents/context-engineering)。

<Note>
  此示例从 `deepagents` 包导入。安装它：

  <CodeGroup>
    ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install deepagents
    ```

    ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    uv add deepagents
    ```
  </CodeGroup>
</Note>

### 规划和授权

复杂的任务通常超出一个上下文窗口的处理能力。委派让主代理将工作分解成多个部分，将它们交给每个子代理，每个子代理都在自己的隔离上下文中运行，并专注于协调而不是执行。工作可以并行运行；主要代理的上下文保持干净。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware
  from deepagents.middleware.subagents import SubAgentMiddleware
  from langchain.agents import create_agent
  from langchain.agents.middleware import TodoListMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  backend = StateBackend()

  agent = create_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[search],
      middleware=[
          FilesystemMiddleware(backend=backend),
          TodoListMiddleware(),
          SubAgentMiddleware(
              backend=backend,
              subagents=[
                  {
                      "name": "researcher",
                      "description": "Searches and returns a structured summary.",
                      "system_prompt": "Use the search tool to research the question and summarize key points.",
                      "tools": [search],
                      "model": "anthropic:claude-sonnet-4-6",
                      "middleware": [],
                  }
              ],
          ),
      ],
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware
  from deepagents.middleware.subagents import SubAgentMiddleware
  from langchain.agents import create_agent
  from langchain.agents.middleware import TodoListMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  backend = StateBackend()

  agent = create_agent(
      model="openai:gpt-5.5",
      tools=[search],
      middleware=[
          FilesystemMiddleware(backend=backend),
          TodoListMiddleware(),
          SubAgentMiddleware(
              backend=backend,
              subagents=[
                  {
                      "name": "researcher",
                      "description": "Searches and returns a structured summary.",
                      "system_prompt": "Use the search tool to research the question and summarize key points.",
                      "tools": [search],
                      "model": "anthropic:claude-sonnet-4-6",
                      "middleware": [],
                  }
              ],
          ),
      ],
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware
  from deepagents.middleware.subagents import SubAgentMiddleware
  from langchain.agents import create_agent
  from langchain.agents.middleware import TodoListMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  backend = StateBackend()

  agent = create_agent(
      model="anthropic:claude-sonnet-4-6",
      tools=[search],
      middleware=[
          FilesystemMiddleware(backend=backend),
          TodoListMiddleware(),
          SubAgentMiddleware(
              backend=backend,
              subagents=[
                  {
                      "name": "researcher",
                      "description": "Searches and returns a structured summary.",
                      "system_prompt": "Use the search tool to research the question and summarize key points.",
                      "tools": [search],
                      "model": "anthropic:claude-sonnet-4-6",
                      "middleware": [],
                  }
              ],
          ),
      ],
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware
  from deepagents.middleware.subagents import SubAgentMiddleware
  from langchain.agents import create_agent
  from langchain.agents.middleware import TodoListMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  backend = StateBackend()

  agent = create_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=[search],
      middleware=[
          FilesystemMiddleware(backend=backend),
          TodoListMiddleware(),
          SubAgentMiddleware(
              backend=backend,
              subagents=[
                  {
                      "name": "researcher",
                      "description": "Searches and returns a structured summary.",
                      "system_prompt": "Use the search tool to research the question and summarize key points.",
                      "tools": [search],
                      "model": "anthropic:claude-sonnet-4-6",
                      "middleware": [],
                  }
              ],
          ),
      ],
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware
  from deepagents.middleware.subagents import SubAgentMiddleware
  from langchain.agents import create_agent
  from langchain.agents.middleware import TodoListMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  backend = StateBackend()

  agent = create_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=[search],
      middleware=[
          FilesystemMiddleware(backend=backend),
          TodoListMiddleware(),
          SubAgentMiddleware(
              backend=backend,
              subagents=[
                  {
                      "name": "researcher",
                      "description": "Searches and returns a structured summary.",
                      "system_prompt": "Use the search tool to research the question and summarize key points.",
                      "tools": [search],
                      "model": "anthropic:claude-sonnet-4-6",
                      "middleware": [],
                  }
              ],
          ),
      ],
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware
  from deepagents.middleware.subagents import SubAgentMiddleware
  from langchain.agents import create_agent
  from langchain.agents.middleware import TodoListMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  backend = StateBackend()

  agent = create_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=[search],
      middleware=[
          FilesystemMiddleware(backend=backend),
          TodoListMiddleware(),
          SubAgentMiddleware(
              backend=backend,
              subagents=[
                  {
                      "name": "researcher",
                      "description": "Searches and returns a structured summary.",
                      "system_prompt": "Use the search tool to research the question and summarize key points.",
                      "tools": [search],
                      "model": "anthropic:claude-sonnet-4-6",
                      "middleware": [],
                  }
              ],
          ),
      ],
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents.backends import StateBackend
  from deepagents.middleware import FilesystemMiddleware
  from deepagents.middleware.subagents import SubAgentMiddleware
  from langchain.agents import create_agent
  from langchain.agents.middleware import TodoListMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  backend = StateBackend()

  agent = create_agent(
      model="ollama:north-mini-code-1.0",
      tools=[search],
      middleware=[
          FilesystemMiddleware(backend=backend),
          TodoListMiddleware(),
          SubAgentMiddleware(
              backend=backend,
              subagents=[
                  {
                      "name": "researcher",
                      "description": "Searches and returns a structured summary.",
                      "system_prompt": "Use the search tool to research the question and summarize key points.",
                      "tools": [search],
                      "model": "anthropic:claude-sonnet-4-6",
                      "middleware": [],
                  }
              ],
          ),
      ],
  )
  ```
</CodeGroup>

参见[Subagents](/oss/python/langchain/multi-agent/subagents)。

<Note>
  此示例从 `deepagents` 包导入。安装它：

  <CodeGroup>
    ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install deepagents
    ```

    ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    uv add deepagents
    ```
  </CodeGroup>
</Note>

### 命名您的代理人可以选择使用代理的标识符。当将代理作为子图嵌入到 [multi-agent](/oss/python/langchain/multi-agent) 系统中时，这特别有用。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  agent = create_agent(model="google_genai:gemini-3.6-flash", tools=tools, name="research_assistant")
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  agent = create_agent(model="openai:gpt-5.5", tools=tools, name="research_assistant")
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  agent = create_agent(model="anthropic:claude-sonnet-4-6", tools=tools, name="research_assistant")
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  agent = create_agent(model="openrouter:z-ai/glm-5.2", tools=tools, name="research_assistant")
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  agent = create_agent(model="fireworks:accounts/fireworks/models/glm-5p2", tools=tools, name="research_assistant")
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  agent = create_agent(model="baseten:zai-org/GLM-5.2", tools=tools, name="research_assistant")
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  agent = create_agent(model="ollama:north-mini-code-1.0", tools=tools, name="research_assistant")
  ```
</CodeGroup>

### 容错

生产中的代理会遇到开发中很少出现的故障：速率限制、模型超时、瞬时 API 错误。容错中间件在基础设施级别处理这些问题，因此您的工具和业务逻辑不需要在每次调用时进行 try/catch。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import ModelRetryMiddleware, ToolRetryMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[search],
      middleware=[
          ModelRetryMiddleware(max_retries=3),
          ToolRetryMiddleware(max_retries=2),
      ],
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import ModelRetryMiddleware, ToolRetryMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="openai:gpt-5.5",
      tools=[search],
      middleware=[
          ModelRetryMiddleware(max_retries=3),
          ToolRetryMiddleware(max_retries=2),
      ],
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import ModelRetryMiddleware, ToolRetryMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="anthropic:claude-sonnet-4-6",
      tools=[search],
      middleware=[
          ModelRetryMiddleware(max_retries=3),
          ToolRetryMiddleware(max_retries=2),
      ],
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import ModelRetryMiddleware, ToolRetryMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=[search],
      middleware=[
          ModelRetryMiddleware(max_retries=3),
          ToolRetryMiddleware(max_retries=2),
      ],
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import ModelRetryMiddleware, ToolRetryMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=[search],
      middleware=[
          ModelRetryMiddleware(max_retries=3),
          ToolRetryMiddleware(max_retries=2),
      ],
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import ModelRetryMiddleware, ToolRetryMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=[search],
      middleware=[
          ModelRetryMiddleware(max_retries=3),
          ToolRetryMiddleware(max_retries=2),
      ],
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import ModelRetryMiddleware, ToolRetryMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="ollama:north-mini-code-1.0",
      tools=[search],
      middleware=[
          ModelRetryMiddleware(max_retries=3),
          ToolRetryMiddleware(max_retries=2),
      ],
  )
  ```
</CodeGroup>

参见[⟦T150⟧](https://reference.langchain.com/python/langchain/agents/middleware/model_retry/ModelRetryMiddleware)、[⟦T151⟧](https://reference.langchain.com/python/langchain/agents/middleware/tool_retry/ToolRetryMiddleware)、[Prebuilt middleware](/oss/python/langchain/middleware/built-in)。

### 护栏

有些策略不能立即生效——无论模型做什么，它们都需要确定性地执行。 Guardrails 在数据流经代理循环时拦截数据，在工具结果到达模型上下文之前应用合规性规则或内容策略。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import PIIMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[search],
      middleware=[PIIMiddleware("email")],
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import PIIMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="openai:gpt-5.5",
      tools=[search],
      middleware=[PIIMiddleware("email")],
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import PIIMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="anthropic:claude-sonnet-4-6",
      tools=[search],
      middleware=[PIIMiddleware("email")],
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import PIIMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=[search],
      middleware=[PIIMiddleware("email")],
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import PIIMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=[search],
      middleware=[PIIMiddleware("email")],
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import PIIMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=[search],
      middleware=[PIIMiddleware("email")],
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import PIIMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="ollama:north-mini-code-1.0",
      tools=[search],
      middleware=[PIIMiddleware("email")],
  )
  ```
</CodeGroup>

参见[⟦T152⟧](https://reference.langchain.com/python/langchain/agents/middleware/pii/PIIMiddleware)、[Prebuilt middleware](/oss/python/langchain/middleware/built-in)。

### 转向完全自治并不总是合适的。引导可以让您将人员置于特定的决策点 - 在破坏性写入、昂贵的 API 调用或任何需要判断的事情之前 - 无需重组您的代理。代理暂停并等待；人类批准、编辑或拒绝；执行仍在继续。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import HumanInTheLoopMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[search],
      middleware=[HumanInTheLoopMiddleware(interrupt_on={"write_file": True})],
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import HumanInTheLoopMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="openai:gpt-5.5",
      tools=[search],
      middleware=[HumanInTheLoopMiddleware(interrupt_on={"write_file": True})],
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import HumanInTheLoopMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="anthropic:claude-sonnet-4-6",
      tools=[search],
      middleware=[HumanInTheLoopMiddleware(interrupt_on={"write_file": True})],
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import HumanInTheLoopMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=[search],
      middleware=[HumanInTheLoopMiddleware(interrupt_on={"write_file": True})],
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import HumanInTheLoopMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=[search],
      middleware=[HumanInTheLoopMiddleware(interrupt_on={"write_file": True})],
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import HumanInTheLoopMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=[search],
      middleware=[HumanInTheLoopMiddleware(interrupt_on={"write_file": True})],
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import HumanInTheLoopMiddleware
  from langchain.tools import tool


  @tool
  def search(query: str) -> str:
      """Search for a query and return a short summary."""
      return f"Search results for: {query}"


  agent = create_agent(
      model="ollama:north-mini-code-1.0",
      tools=[search],
      middleware=[HumanInTheLoopMiddleware(interrupt_on={"write_file": True})],
  )
  ```
</CodeGroup>

参见[⟦T153⟧](https://reference.langchain.com/python/langchain/agents/middleware/human_in_the_loop/HumanInTheLoopMiddleware)、[Human-in-the-loop](/oss/python/langchain/human-in-the-loop)。

### 中间件资源

<CardGroup>
  <Card title="Middleware overview" icon="route" href="/oss/python/langchain/middleware/overview">
    中间件堆栈如何工作以及钩子何时触发
  </Card>

  <Card title="Prebuilt middleware" icon="package" href="/oss/python/langchain/middleware/built-in">
    包含配置示例的完整参考
  </Card>

  <Card title="Custom middleware" icon="code" href="/oss/python/langchain/middleware/custom">
    为业务逻辑、PII 清理等编写您自己的挂钩
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/agents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>