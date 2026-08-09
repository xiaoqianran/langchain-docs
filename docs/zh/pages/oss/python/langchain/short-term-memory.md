<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Short-term memory | https://docs.langchain.com/oss/python/langchain/short-term-memory -->

## 概述

记忆是一个记住先前交互信息的系统。对于人工智能代理来说，记忆至关重要，因为它可以让它们记住之前的交互、从反馈中学习并适应用户偏好。随着代理通过大量用户交互处理更复杂的任务，此功能对于效率和用户满意度变得至关重要。

短期记忆可让您的应用程序记住单个线程或对话中先前的交互。

<Note>
  线程在会话中组织多个交互，类似于电子邮件在单个对话中对消息进行分组的方式。
</Note>

对话历史是短期记忆最常见的形式。长时间的对话对当今的法学硕士提出了挑战；完整的历史记录可能不适合法学硕士的上下文窗口，从而导致上下文丢失或错误。

即使您的模型支持完整的上下文长度，大多数法学硕士在长上下文中仍然表现不佳。他们会被陈旧或偏离主题的内容“分散注意力”，同时还要承受响应时间较慢和成本较高的问题。聊天模型使用[messages](/oss/python/langchain/messages)接受上下文，其中包括指令（系统消息）和输入（人类消息）。在聊天应用程序中，消息在人工输入和模型响应之间交替，导致消息列表随着时间的推移而变长。由于上下文窗口有限，许多应用程序可以从使用删除或“忘记”过时信息的技术中受益。

<Tip>
  需要记住**跨**对话的信息？使用[long-term memory](/oss/python/langchain/long-term-memory)跨不同线程和会话存储和调用用户特定或应用程序级数据。
</Tip>

## 用法

要为代理添加短期内存（线程级持久性），您需要在创建代理时指定`checkpointer`。

<Info>
  LangChain 的代理将短期记忆作为代理状态的一部分进行管理。

  通过将这些存储在图的状态中，代理可以访问给定对话的完整上下文，同时保持不同线程之间的分离。

  使用检查指针将状态保存到数据库（或内存），以便可以随时恢复线程。当调用代理或完成一个步骤（如工具调用）时，短期内存会更新，并且在每个步骤开始时读取状态。
</Info>

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langgraph.checkpoint.memory import InMemorySaver  # [!code highlight]


  def get_user_info() -> str:
      """Look up information about the current user."""
      return "No user profile on file."


  agent = create_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[get_user_info],
      checkpointer=InMemorySaver(),  # [!code highlight]
  )

  thread_config = {"configurable": {"thread_id": "1"}}
  response = agent.invoke(
      {"messages": [{"role": "user", "content": "Hi! My name is Bob."}]},
      thread_config,  # [!code highlight]
  )["messages"][-1].content

  print(response)  # "Hi Bob! Nice to see you here. How are you doing?"

  response = agent.invoke(
      {"messages": [{"role": "user", "content": "What's my name?"}]},
      thread_config,  # [!code highlight]
  )["messages"][-1].content

  print(response)  # "You are Bob!"
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langgraph.checkpoint.memory import InMemorySaver  # [!code highlight]


  def get_user_info() -> str:
      """Look up information about the current user."""
      return "No user profile on file."


  agent = create_agent(
      model="openai:gpt-5.5",
      tools=[get_user_info],
      checkpointer=InMemorySaver(),  # [!code highlight]
  )

  thread_config = {"configurable": {"thread_id": "1"}}
  response = agent.invoke(
      {"messages": [{"role": "user", "content": "Hi! My name is Bob."}]},
      thread_config,  # [!code highlight]
  )["messages"][-1].content

  print(response)  # "Hi Bob! Nice to see you here. How are you doing?"

  response = agent.invoke(
      {"messages": [{"role": "user", "content": "What's my name?"}]},
      thread_config,  # [!code highlight]
  )["messages"][-1].content

  print(response)  # "You are Bob!"
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langgraph.checkpoint.memory import InMemorySaver  # [!code highlight]


  def get_user_info() -> str:
      """Look up information about the current user."""
      return "No user profile on file."


  agent = create_agent(
      model="anthropic:claude-sonnet-4-6",
      tools=[get_user_info],
      checkpointer=InMemorySaver(),  # [!code highlight]
  )

  thread_config = {"configurable": {"thread_id": "1"}}
  response = agent.invoke(
      {"messages": [{"role": "user", "content": "Hi! My name is Bob."}]},
      thread_config,  # [!code highlight]
  )["messages"][-1].content

  print(response)  # "Hi Bob! Nice to see you here. How are you doing?"

  response = agent.invoke(
      {"messages": [{"role": "user", "content": "What's my name?"}]},
      thread_config,  # [!code highlight]
  )["messages"][-1].content

  print(response)  # "You are Bob!"
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langgraph.checkpoint.memory import InMemorySaver  # [!code highlight]


  def get_user_info() -> str:
      """Look up information about the current user."""
      return "No user profile on file."


  agent = create_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=[get_user_info],
      checkpointer=InMemorySaver(),  # [!code highlight]
  )

  thread_config = {"configurable": {"thread_id": "1"}}
  response = agent.invoke(
      {"messages": [{"role": "user", "content": "Hi! My name is Bob."}]},
      thread_config,  # [!code highlight]
  )["messages"][-1].content

  print(response)  # "Hi Bob! Nice to see you here. How are you doing?"

  response = agent.invoke(
      {"messages": [{"role": "user", "content": "What's my name?"}]},
      thread_config,  # [!code highlight]
  )["messages"][-1].content

  print(response)  # "You are Bob!"
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langgraph.checkpoint.memory import InMemorySaver  # [!code highlight]


  def get_user_info() -> str:
      """Look up information about the current user."""
      return "No user profile on file."


  agent = create_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=[get_user_info],
      checkpointer=InMemorySaver(),  # [!code highlight]
  )

  thread_config = {"configurable": {"thread_id": "1"}}
  response = agent.invoke(
      {"messages": [{"role": "user", "content": "Hi! My name is Bob."}]},
      thread_config,  # [!code highlight]
  )["messages"][-1].content

  print(response)  # "Hi Bob! Nice to see you here. How are you doing?"

  response = agent.invoke(
      {"messages": [{"role": "user", "content": "What's my name?"}]},
      thread_config,  # [!code highlight]
  )["messages"][-1].content

  print(response)  # "You are Bob!"
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langgraph.checkpoint.memory import InMemorySaver  # [!code highlight]


  def get_user_info() -> str:
      """Look up information about the current user."""
      return "No user profile on file."


  agent = create_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=[get_user_info],
      checkpointer=InMemorySaver(),  # [!code highlight]
  )

  thread_config = {"configurable": {"thread_id": "1"}}
  response = agent.invoke(
      {"messages": [{"role": "user", "content": "Hi! My name is Bob."}]},
      thread_config,  # [!code highlight]
  )["messages"][-1].content

  print(response)  # "Hi Bob! Nice to see you here. How are you doing?"

  response = agent.invoke(
      {"messages": [{"role": "user", "content": "What's my name?"}]},
      thread_config,  # [!code highlight]
  )["messages"][-1].content

  print(response)  # "You are Bob!"
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langgraph.checkpoint.memory import InMemorySaver  # [!code highlight]


  def get_user_info() -> str:
      """Look up information about the current user."""
      return "No user profile on file."


  agent = create_agent(
      model="ollama:north-mini-code-1.0",
      tools=[get_user_info],
      checkpointer=InMemorySaver(),  # [!code highlight]
  )

  thread_config = {"configurable": {"thread_id": "1"}}
  response = agent.invoke(
      {"messages": [{"role": "user", "content": "Hi! My name is Bob."}]},
      thread_config,  # [!code highlight]
  )["messages"][-1].content

  print(response)  # "Hi Bob! Nice to see you here. How are you doing?"

  response = agent.invoke(
      {"messages": [{"role": "user", "content": "What's my name?"}]},
      thread_config,  # [!code highlight]
  )["messages"][-1].content

  print(response)  # "You are Bob!"
  ```
</CodeGroup>

### 生产中

在生产中，使用由数据库支持的检查指针：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U langgraph-checkpoint-postgres "psycopg[binary]"
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langgraph-checkpoint-postgres "psycopg[binary]"
  ```
</CodeGroup>

<Note>
  默认情况下，`langgraph-checkpoint-postgres` 安装 `psycopg` (Psycopg 3)，无需额外安装。上面的安装添加了`psycopg[binary]`，推荐大多数用户使用。其他选项请参见[Psycopg installation docs](https://www.psycopg.org/psycopg3/docs/basic/install.html)。
</Note>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langgraph.checkpoint.postgres import PostgresSaver  # [!code highlight]

def get_user_info() -> str:
    """Look up information about the current user."""
    return "No user profile on file."

DB_URI = "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"
with PostgresSaver.from_conn_string(DB_URI) as checkpointer:
    checkpointer.setup() # auto create tables in PostgreSQL
    agent = create_agent(
        "gpt-5.5",
        tools=[get_user_info],
        checkpointer=checkpointer,  # [!code highlight]
    )
```

<Note>
  有关更多检查点选项，包括 SQLite、Postgres 和 Azure Cosmos DB，请参阅持久性文档中的 [list of checkpointer libraries](/oss/python/langgraph/checkpointers#checkpointer-libraries)。
</Note>

## 定制代理内存

默认情况下，代理使用 [⟦T29⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/AgentState) 来管理短期记忆，特别是通过 `messages` 键管理对话历史记录。

您可以扩展 [⟦T31⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/AgentState) 以添加其他字段。自定义状态模式使用 [⟦T33⟧](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.AgentMiddleware.state_schema) 参数传递到 [⟦T32⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent, AgentState
from langgraph.checkpoint.memory import InMemorySaver


class CustomAgentState(AgentState):  # [!code highlight]
    user_id: str  # [!code highlight]
    preferences: dict  # [!code highlight]

agent = create_agent(
    "gpt-5.5",
    tools=[get_user_info],
    state_schema=CustomAgentState,  # [!code highlight]
    checkpointer=InMemorySaver(),
)

# Custom state can be passed in invoke
result = agent.invoke(
    {
        "messages": [{"role": "user", "content": "Hello"}],
        "user_id": "user_123",  # [!code highlight]
        "preferences": {"theme": "dark"}  # [!code highlight]
    },
    {"configurable": {"thread_id": "1"}})
```

## 常见模式

启用 [short-term memory](#usage) 后，长时间对话可能会超出 LLM 的上下文窗口。常见的解决方案有：

<CardGroup>
  <Card title="Trim messages" icon="scissors" href="#trim-messages">
    删除前 N 条或后 N 条消息（在调用 LLM 之前）
  </Card>

  <Card title="Delete messages" icon="trash" href="#delete-messages">
    永久删除 LangGraph 状态中的消息
  </Card><Card title="Summarize messages" icon="stack-2" href="#summarize-messages">
    总结历史记录中较早的消息并将其替换为摘要
  </Card>

  <Card title="Custom strategies" icon="adjustments">
    自定义策略（例如消息过滤等）
  </Card>
</CardGroup>

这允许代理在不超出 LLM 上下文窗口的情况下跟踪对话。

### 修剪消息

大多数法学硕士都有最大支持的上下文窗口（以令牌计价）。

决定何时截断消息的一种方法是计算消息历史记录中的标记，并在接近该限制时进行截断。如果您使用 LangChain，则可以使用修剪消息实用程序并指定要从列表中保留的令牌数量，以及用于处理边界的`strategy`（例如，保留最后一个`max_tokens`）。

要修剪代理中的消息历史记录，请使用 [⟦T36⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/before_model) 中间件装饰器：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import RemoveMessage
from langgraph.graph.message import REMOVE_ALL_MESSAGES
from langgraph.checkpoint.memory import InMemorySaver
from langchain.agents import create_agent, AgentState
from langchain.agents.middleware import before_model
from langgraph.runtime import Runtime
from langchain_core.runnables import RunnableConfig
from typing import Any


@before_model
def trim_messages(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
    """Keep only the last few messages to fit context window."""
    messages = state["messages"]

    if len(messages) <= 3:
        return None  # No changes needed

    first_msg = messages[0]
    recent_messages = messages[-3:] if len(messages) % 2 == 0 else messages[-4:]
    new_messages = [first_msg] + recent_messages

    return {
        "messages": [
            RemoveMessage(id=REMOVE_ALL_MESSAGES),
            *new_messages
        ]
    }

agent = create_agent(
    "gpt-5.5",
    tools=[...],
    middleware=[trim_messages],
    checkpointer=InMemorySaver(),
)

config: RunnableConfig = {"configurable": {"thread_id": "1"}}

agent.invoke({"messages": "hi, my name is bob"}, config)
agent.invoke({"messages": "write a short poem about cats"}, config)
agent.invoke({"messages": "now do the same but for dogs"}, config)
final_response = agent.invoke({"messages": "what's my name?"}, config)

final_response["messages"][-1].pretty_print()
"""
================================== Ai Message ==================================

Your name is Bob. You told me that earlier.
If you'd like me to call you a nickname or use a different name, just say the word.
"""
```

### 删除消息

您可以从图形状态中删除消息以管理消息历史记录。

当您想要删除特定消息或清除整个消息历史记录时，这非常有用。

要从图形状态中删除消息，您可以使用`RemoveMessage`。

为了使 `RemoveMessage` 工作，您需要将状态密钥与 [⟦T39⟧](https://reference.langchain.com/python/langgraph/graph/message/add_messages) [reducer](/oss/python/langgraph/graph-api#reducers) 一起使用。

默认的 [⟦T40⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/AgentState) 提供了这一点。

要删除特定消息：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import RemoveMessage  # [!code highlight]

def delete_messages(state):
    messages = state["messages"]
    if len(messages) > 2:
        # remove the earliest two messages
        return {"messages": [RemoveMessage(id=m.id) for m in messages[:2]]}  # [!code highlight]
```要删除**所有**消息：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph.graph.message import REMOVE_ALL_MESSAGES  # [!code highlight]

def delete_messages(state):
    return {"messages": [RemoveMessage(id=REMOVE_ALL_MESSAGES)]}  # [!code highlight]
```

<Warning>
  删除消息时，**确保**生成的消息历史记录有效。检查您正在使用的 LLM 提供商的限制。例如：

  * 一些提供商希望消息历史记录以 `user` 消息开始
  * 大多数提供商要求带有工具调用的 `assistant` 消息后跟相应的 `tool` 结果消息。
</Warning>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import RemoveMessage
from langchain.agents import create_agent, AgentState
from langchain.agents.middleware import after_model
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.runtime import Runtime
from langchain_core.runnables import RunnableConfig


@after_model
def delete_old_messages(state: AgentState, runtime: Runtime) -> dict | None:
    """Remove old messages to keep conversation manageable."""
    messages = state["messages"]
    if len(messages) > 2:
        # remove the earliest two messages
        return {"messages": [RemoveMessage(id=m.id) for m in messages[:2]]}
    return None


agent = create_agent(
    "gpt-5-nano",
    tools=[...],
    system_prompt="Please be concise and to the point.",
    middleware=[delete_old_messages],
    checkpointer=InMemorySaver(),
)

config: RunnableConfig = {"configurable": {"thread_id": "1"}}

stream = agent.stream_events(
    {"messages": [{"role": "user", "content": "hi! I'm bob"}]},
    config,
    version="v3",
)
for snapshot in stream.values:
    print([(message.type, message.content) for message in snapshot["messages"]])

stream = agent.stream_events(
    {"messages": [{"role": "user", "content": "write a short poem about cats"}]},
    config,
    version="v3",
)
for snapshot in stream.values:
    print([(message.type, message.content) for message in snapshot["messages"]])

stream = agent.stream_events(
    {"messages": [{"role": "user", "content": "what's my name?"}]},
    config,
    version="v3",
)
for snapshot in stream.values:
    print([(message.type, message.content) for message in snapshot["messages"]])
```

```
[('human', "hi! I'm bob")]
[('human', "hi! I'm bob"), ('ai', 'Hi Bob! Nice to meet you. How can I help you today? I can answer questions, brainstorm ideas, draft text, explain things, or help with code.')]
[('human', "hi! I'm bob"), ('ai', 'Hi Bob! Nice to meet you. How can I help you today? I can answer questions, brainstorm ideas, draft text, explain things, or help with code.'), ('human', "write a short poem about cats")]
[('human', "hi! I'm bob"), ('ai', 'Hi Bob! Nice to meet you. How can I help you today? I can answer questions, brainstorm ideas, draft text, explain things, or help with code.'), ('human', "write a short poem about cats"), ('ai', 'There once was a cat on a wall, Who barely moved at all...')]
[('human', 'write a short poem about cats'), ('ai', 'There once was a cat on a wall, Who barely moved at all...')]
[('human', 'write a short poem about cats'), ('ai', 'There once was a cat on a wall, Who barely moved at all...'), ('human', "what's my name?")]
[('human', 'write a short poem about cats'), ('ai', 'There once was a cat on a wall, Who barely moved at all...'), ('human', "what's my name?"), ('ai', "I don't know your name - you haven't told me!")]
[('human', "what's my name?"), ('ai', "I don't know your name - you haven't told me!")]
```

### 总结消息

如上所示，修剪或删除消息的问题是您可能会因消息队列的剔除而丢失信息。
因此，一些应用程序受益于使用聊天模型总结消息历史记录的更复杂的方法。

<img alt="Summary" />

要汇总代理中的消息历史记录，请使用内置的 [⟦T44⟧](/oss/python/langchain/middleware#summarization)：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware
from langgraph.checkpoint.memory import InMemorySaver
from langchain_core.runnables import RunnableConfig


checkpointer = InMemorySaver()

agent = create_agent(
    model="gpt-5.5",
    tools=[...],
    middleware=[
        SummarizationMiddleware(
            model="gpt-5.4-mini",
            trigger=("tokens", 4000),
            keep=("messages", 20)
        )
    ],
    checkpointer=checkpointer,
)

config: RunnableConfig = {"configurable": {"thread_id": "1"}}
agent.invoke({"messages": "hi, my name is bob"}, config)
agent.invoke({"messages": "write a short poem about cats"}, config)
agent.invoke({"messages": "now do the same but for dogs"}, config)
final_response = agent.invoke({"messages": "what's my name?"}, config)

final_response["messages"][-1].pretty_print()
"""
================================== Ai Message ==================================

Your name is Bob!
"""
```

更多配置选项请参见[⟦T45⟧](/oss/python/langchain/middleware#summarization)。

## 访问内存

您可以通过多种方式访问和修改代理的短期记忆（状态）：

### 工具

#### 在工具中读取短期记忆

使用 `runtime` 参数（键入为 `ToolRuntime`）访问工具中的短期内存（状态）。

`runtime` 参数在工具签名中隐藏（因此模型看不到它），但工具可以通过它访问状态。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent, AgentState
from langchain.tools import tool, ToolRuntime


class CustomState(AgentState):
    user_id: str

@tool
def get_user_info(
    runtime: ToolRuntime
) -> str:
    """Look up user info."""
    user_id = runtime.state["user_id"]
    return "User is John Smith" if user_id == "user_123" else "Unknown user"

agent = create_agent(
    model="gpt-5-nano",
    tools=[get_user_info],
    state_schema=CustomState,
)

result = agent.invoke({
    "messages": "look up user information",
    "user_id": "user_123"
})
print(result["messages"][-1].content)
# > User is John Smith.
```#### 从工具中写入短期记忆

要在执行期间修改代理的短期记忆（状态），您可以直接从工具返回状态更新。

这对于保留中间结果或使后续工具或提示可以访问信息非常有用。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool, ToolRuntime
from langchain_core.runnables import RunnableConfig
from langchain.messages import ToolMessage
from langchain.agents import create_agent, AgentState
from langgraph.types import Command
from pydantic import BaseModel


class CustomState(AgentState):  # [!code highlight]
    user_name: str

class CustomContext(BaseModel):
    user_id: str

@tool
def update_user_info(
    runtime: ToolRuntime[CustomContext, CustomState],
) -> Command:
    """Look up and update user info."""
    user_id = runtime.context.user_id
    name = "John Smith" if user_id == "user_123" else "Unknown user"
    return Command(update={  # [!code highlight]
        "user_name": name,
        # update the message history
        "messages": [
            ToolMessage(
                "Successfully looked up user information",
                tool_call_id=runtime.tool_call_id
            )
        ]
    })

@tool
def greet(
    runtime: ToolRuntime[CustomContext, CustomState]
) -> str | Command:
    """Use this to greet the user once you found their info."""
    user_name = runtime.state.get("user_name", None)
    if user_name is None:
       return Command(update={
            "messages": [
                ToolMessage(
                    "Please call the 'update_user_info' tool it will get and update the user's name.",
                    tool_call_id=runtime.tool_call_id
                )
            ]
        })
    return f"Hello {user_name}!"

agent = create_agent(
    model="gpt-5-nano",
    tools=[update_user_info, greet],
    state_schema=CustomState, # [!code highlight]
    context_schema=CustomContext,
)

agent.invoke(
    {"messages": [{"role": "user", "content": "greet the user"}]},
    context=CustomContext(user_id="user_123"),
)
```

### 提示

访问中间件中的短期记忆（状态），以根据对话历史记录或自定义状态字段创建动态提示。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from typing import TypedDict
from langchain.agents.middleware import dynamic_prompt, ModelRequest


class CustomContext(TypedDict):
    user_name: str


def get_weather(city: str) -> str:
    """Get the weather in a city."""
    return f"The weather in {city} is always sunny!"


@dynamic_prompt
def dynamic_system_prompt(request: ModelRequest) -> str:
    user_name = request.runtime.context["user_name"]
    system_prompt = f"You are a helpful assistant. Address the user as {user_name}."
    return system_prompt


agent = create_agent(
    model="gpt-5-nano",
    tools=[get_weather],
    middleware=[dynamic_system_prompt],
    context_schema=CustomContext,
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "What is the weather in SF?"}]},
    context=CustomContext(user_name="John Smith"),
)
for msg in result["messages"]:
    msg.pretty_print()

```

```shell title="Output" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
================================ Human Message =================================

What is the weather in SF?
================================== Ai Message ==================================
Tool Calls:
  get_weather (call_WFQlOGn4b2yoJrv7cih342FG)
 Call ID: call_WFQlOGn4b2yoJrv7cih342FG
  Args:
    city: San Francisco
================================= Tool Message =================================
Name: get_weather

The weather in San Francisco is always sunny!
================================== Ai Message ==================================

Hi John Smith, the weather in San Francisco is always sunny!
```

### 模型之前

访问[⟦T49⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/before_model)中间件中的短期内存（状态）以在模型调用之前处理消息。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{
    init: {
        "fontFamily": "monospace",
        "flowchart": {
        "curve": "basis"
        }
    }
}%%
graph TD
    S(["\_\_start\_\_"])
    PRE(before_model)
    MODEL(model)
    TOOLS(tools)
    END(["\_\_end\_\_"])
    S --> PRE
    PRE --> MODEL
    MODEL -.-> TOOLS
    MODEL -.-> END
    TOOLS --> PRE
    classDef blueHighlight fill:#E5F4FF,stroke:#006DDD,color:#030710;
    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68;
    class S blueHighlight;
    class END blueHighlight;
    class PRE,MODEL,TOOLS neutral;
```

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import RemoveMessage
from langgraph.graph.message import REMOVE_ALL_MESSAGES
from langgraph.checkpoint.memory import InMemorySaver
from langchain.agents import create_agent, AgentState
from langchain.agents.middleware import before_model
from langchain_core.runnables import RunnableConfig
from langgraph.runtime import Runtime
from typing import Any


@before_model
def trim_messages(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
    """Keep only the last few messages to fit context window."""
    messages = state["messages"]

    if len(messages) <= 3:
        return None  # No changes needed

    first_msg = messages[0]
    recent_messages = messages[-3:] if len(messages) % 2 == 0 else messages[-4:]
    new_messages = [first_msg] + recent_messages

    return {
        "messages": [
            RemoveMessage(id=REMOVE_ALL_MESSAGES),
            *new_messages
        ]
    }


agent = create_agent(
    "gpt-5-nano",
    tools=[],
    middleware=[trim_messages],
    checkpointer=InMemorySaver()
)

config: RunnableConfig = {"configurable": {"thread_id": "1"}}

agent.invoke({"messages": "hi, my name is bob"}, config)
agent.invoke({"messages": "write a short poem about cats"}, config)
agent.invoke({"messages": "now do the same but for dogs"}, config)
final_response = agent.invoke({"messages": "what's my name?"}, config)

final_response["messages"][-1].pretty_print()
"""
================================== Ai Message ==================================

Your name is Bob. You told me that earlier.
If you'd like me to call you a nickname or use a different name, just say the word.
"""
```

### 模型后

访问[⟦T50⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/after_model)中间件中的短期内存（状态）以在模型调用后处理消息。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{
    init: {
        "fontFamily": "monospace",
        "flowchart": {
        "curve": "basis"
        }
    }
}%%
graph TD
    S(["\_\_start\_\_"])
    MODEL(model)
    POST(after_model)
    TOOLS(tools)
    END(["\_\_end\_\_"])
    S --> MODEL
    MODEL --> POST
    POST -.-> END
    POST -.-> TOOLS
    TOOLS --> MODEL
    classDef blueHighlight fill:#E5F4FF,stroke:#006DDD,color:#030710;
    classDef greenHighlight fill:#F6FFDB,stroke:#6E8900,color:#2E3900;
    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68;
    class S blueHighlight;
    class END blueHighlight;
    class POST greenHighlight;
    class MODEL,TOOLS neutral;
```

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import RemoveMessage
from langgraph.checkpoint.memory import InMemorySaver
from langchain.agents import create_agent, AgentState
from langchain.agents.middleware import after_model
from langgraph.runtime import Runtime


@after_model
def validate_response(state: AgentState, runtime: Runtime) -> dict | None:
    """Remove messages containing sensitive words."""
    STOP_WORDS = ["password", "secret"]
    last_message = state["messages"][-1]
    if any(word in last_message.content for word in STOP_WORDS):
        return {"messages": [RemoveMessage(id=last_message.id)]}
    return None

agent = create_agent(
    model="gpt-5-nano",
    tools=[],
    middleware=[validate_response],
    checkpointer=InMemorySaver(),
)
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/short-term-memory.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>