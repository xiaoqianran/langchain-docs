<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangChain v1 migration guide | https://docs.langchain.com/oss/python/migrate/langchain-v1 -->

# LangChain v1迁移指南

本指南概述了[LangChain v1](/oss/python/releases/langchain-v1)与之前版本之间的主要变化。

## 简化包

v1 中的 `langchain` 包命名空间已显着减少，以专注于代理的基本构建块。精简的包使您更容易发现和使用核心功能。

### 命名空间

|模块|有什么可用的 |笔记|
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| [⟦T46⟧](https://reference.langchain.com/python/langchain/agents) | [⟦T47⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)、[⟦T48⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/AgentState) |核心代理创建功能 || [⟦T49⟧](https://reference.langchain.com/python/langchain/messages) |消息类型，[content blocks](https://reference.langchain.com/python/langchain-core/messages/content/ContentBlock)，[⟦T50⟧](https://reference.langchain.com/python/langchain-core/messages/utils/trim_messages) |从`langchain-core`转口|
| [⟦T52⟧](https://reference.langchain.com/python/langchain/tools) | [⟦T53⟧](https://reference.langchain.com/python/langchain-core/tools/convert/tool)、[⟦T54⟧](https://reference.langchain.com/python/langchain-core/tools/base/BaseTool)、注射助手 |从`langchain-core`转口|
| [⟦T56⟧](https://reference.langchain.com/python/langchain/models) | [⟦T57⟧](https://reference.langchain.com/python/langchain/chat_models/base/init_chat_model)、[⟦T58⟧](https://reference.langchain.com/python/langchain-core/language_models/chat_models/BaseChatModel) |统一模型初始化|
| [⟦T59⟧](https://reference.langchain.com/python/langchain/embeddings) | [⟦T60⟧](https://reference.langchain.com/python/langchain/embeddings/base/init_embeddings)、[⟦T61⟧](https://reference.langchain.com/python/langchain-core/embeddings/embeddings/Embeddings) |嵌入模型|

### `langchain-classic`

如果您使用 `langchain` 包中的以下任何一项，则需要安装 [⟦T64⟧](https://pypi.org/project/langchain-classic/) 并更新您的导入：

* 旧链（`LLMChain`、`ConversationChain`等）
* 检索器（例如 `MultiQueryRetriever` 或之前的 `langchain.retrievers` 模块中的任何内容）
* 索引API
* hub模块（用于以编程方式管理提示）
* 嵌入模块（例如 `CacheBackedEmbeddings` 和社区嵌入）
* [⟦T70⟧](https://pypi.org/project/langchain-community) 转口
* 其他已弃用的功能

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Chains
  from langchain_classic.chains import LLMChain

  # Retrievers
  from langchain_classic.retrievers import ...

  # Indexing
  from langchain_classic.indexes import ...

  # Hub
  from langchain_classic import hub
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Chains
  from langchain_classic.chains import LLMChain

  # Retrievers
  from langchain.retrievers import ...

  # Indexing
  from langchain.indexes import ...

  # Hub
  from langchain import hub
  ```
</CodeGroup>

安装：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain-classic
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-classic
  ```
</CodeGroup>

***

## 迁移到`create_agent`

在 v1.0 之前，我们建议使用 [⟦T72⟧](https://reference.langchain.com/python/langchain-classic/agents/react/agent/create_react_agent) 来构建代理。现在，我们推荐您使用[⟦T73⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)来构建代理。

下表概述了从 [⟦T74⟧](https://reference.langchain.com/python/langchain-classic/agents/react/agent/create_react_agent) 到 [⟦T75⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 的功能更改：|部分| TL;DR - 发生了什么变化 |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Import path](#import-path) |包裹从`langgraph.prebuilt`移至`langchain.agents` |
| [Prompts](#prompts) |参数重命名为[⟦T78⟧](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent\(system_prompt\))，动态提示使用中间件 |
| [Pre-model hook](#pre-model-hook) |被中间件替换为`before_model`方法 || [Post-model hook](#post-model-hook) |替换为`after_model`方法的中间件 |
| [Custom state](#custom-state) |仅限`TypedDict`，可以通过[⟦T82⟧](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.AgentMiddleware.state_schema)或中间件定义 |
| [Model](#model) |通过中间件动态选择，不支持预绑定模型 |
| [Tools](#tools) |工具错误处理已通过 `wrap_tool_call` 转移到中间件 |
| [Structured output](#structured-output) |提示输出已删除，请使用`ToolStrategy`/`ProviderStrategy` |
| [Streaming node name](#streaming-node-name-rename) |节点名称由`"agent"`更改为`"model"` || [Runtime context](#runtime-context) |通过 `context` 参数而不是 `config["configurable"]` 进行依赖注入 |
| [Namespace](#simplified-package) |精简以专注于代理构建块，遗留代码移至`langchain-classic` |

### 导入路径

预构建代理的导入路径已从 `langgraph.prebuilt` 更改为 `langchain.agents`。
函数名称已从 [⟦T93⟧](https://reference.langchain.com/python/langchain-classic/agents/react/agent/create_react_agent) 更改为 [⟦T94⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph.prebuilt import create_react_agent # [!code --]
from langchain.agents import create_agent # [!code ++]
```

有关更多信息，请参阅[Agents](/oss/python/langchain/agents)。

### 提示

#### 静态提示重命名

`prompt`参数已重命名为[⟦T96⟧](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent\(system_prompt\)）：

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(
      model="claude-sonnet-4-6",
      tools=[check_weather],
      system_prompt="You are a helpful assistant"  # [!code highlight]
  )
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langgraph.prebuilt import create_react_agent

  agent = create_react_agent(
      model="claude-sonnet-4-6",
      tools=[check_weather],
      prompt="You are a helpful assistant"  # [!code highlight]
  )
  ```
</CodeGroup>

#### `SystemMessage` 转为字符串

如果在系统提示符中使用[⟦T98⟧](https://reference.langchain.com/python/langchain-core/messages/system/SystemMessage)对象，则提取字符串内容：

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(
      model="claude-sonnet-4-6",
      tools=[check_weather],
      system_prompt="You are a helpful assistant"  # [!code highlight]
  )
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.messages import SystemMessage
  from langgraph.prebuilt import create_react_agent

  agent = create_react_agent(
      model="claude-sonnet-4-6",
      tools=[check_weather],
      prompt=SystemMessage(content="You are a helpful assistant")  # [!code highlight]
  )
  ```
</CodeGroup>

####动态提示

动态提示是一种核心上下文工程模式——它们根据当前对话状态调整您告诉模型的内容。为此，请使用 [⟦T99⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/dynamic_prompt) 装饰器：

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.agents import create_agent
  from langchain.agents.middleware import dynamic_prompt, ModelRequest
  from langgraph.runtime import Runtime


  @dataclass
  class Context:  # [!code highlight]
      user_role: str = "user"

  @dynamic_prompt  # [!code highlight]
  def dynamic_prompt(request: ModelRequest) -> str:  # [!code highlight]
      user_role = request.runtime.context.user_role
      base_prompt = "You are a helpful assistant."

      if user_role == "expert":
          prompt = (
              f"{base_prompt} Provide detailed technical responses."
          )
      elif user_role == "beginner":
          prompt = (
              f"{base_prompt} Explain concepts simply and avoid jargon."
          )
      else:
          prompt = base_prompt

      return prompt  # [!code highlight]

  agent = create_agent(
      model="gpt-5.5",
      tools=tools,
      middleware=[dynamic_prompt],  # [!code highlight]
      context_schema=Context
  )

  # Use with context
  agent.invoke(
      {"messages": [{"role": "user", "content": "Explain async programming"}]},
      context=Context(user_role="expert")
  )
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langgraph.prebuilt import create_react_agent, AgentState
  from langgraph.runtime import get_runtime

  @dataclass
  class Context:
      user_role: str

  def dynamic_prompt(state: AgentState) -> str:
      runtime = get_runtime(Context)  # [!code highlight]
      user_role = runtime.context.user_role
      base_prompt = "You are a helpful assistant."

      if user_role == "expert":
          return f"{base_prompt} Provide detailed technical responses."
      elif user_role == "beginner":
          return f"{base_prompt} Explain concepts simply and avoid jargon."
      return base_prompt

  agent = create_react_agent(
      model="gpt-5.5",
      tools=tools,
      prompt=dynamic_prompt,
      context_schema=Context
  )

  # Use with context
  agent.invoke(
      {"messages": [{"role": "user", "content": "Explain async programming"}]},
      context=Context(user_role="expert")
  )
  ```
</CodeGroup>

### 预模型钩子预模型挂钩现在通过 `before_model` 方法实现为中间件。
这种新模式更具可扩展性——您可以定义多个中间件在调用模型之前运行，
在不同代理之间重用通用模式。

常见用例包括：

* 总结对话历史
* 修剪消息
* 输入护栏，例如 PII 修订

v1 现在将摘要中间件作为内置选项：

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import SummarizationMiddleware

  agent = create_agent(
      model="claude-sonnet-4-6",
      tools=tools,
      middleware=[
          SummarizationMiddleware(  # [!code highlight]
              model="claude-sonnet-4-6",  # [!code highlight]
              trigger={"tokens": 1000}  # [!code highlight]
          )  # [!code highlight]
      ]  # [!code highlight]
  )
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langgraph.prebuilt import create_react_agent, AgentState

  def custom_summarization_function(state: AgentState):
      """Custom logic for message summarization."""
      ...

  agent = create_react_agent(
      model="claude-sonnet-4-6",
      tools=tools,
      pre_model_hook=custom_summarization_function
  )
  ```
</CodeGroup>

### 后模型挂钩

后模型挂钩现在通过 `after_model` 方法实现为中间件。
这种新模式更具可扩展性——您可以定义多个中间件在模型调用后运行，
在不同代理之间重用通用模式。

常见用例包括：

* [Human in the loop](/oss/python/langchain/human-in-the-loop)
* 输出护栏

v1 有一个内置中间件，用于工具调用的人工循环批准：

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import HumanInTheLoopMiddleware

  agent = create_agent(
      model="claude-sonnet-4-6",
      tools=[read_email, send_email],
      middleware=[
          HumanInTheLoopMiddleware(
              interrupt_on={
                  "send_email": {
                      "description": "Please review this email before sending",
                      "allowed_decisions": ["approve", "reject"]
                  }
              }
          )
      ]
  )
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langgraph.prebuilt import create_react_agent
  from langgraph.prebuilt import AgentState

  def custom_human_in_the_loop_hook(state: AgentState):
      """Custom logic for human in the loop approval."""
      ...

  agent = create_react_agent(
      model="claude-sonnet-4-6",
      tools=[read_email, send_email],
      post_model_hook=custom_human_in_the_loop_hook
  )
  ```
</CodeGroup>

### 自定义状态

自定义状态通过附加字段扩展了默认代理状态。您可以通过两种方式定义自定义状态：

1. **通过[⟦T102⟧](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.AgentMiddleware.state_schema) on [⟦T103⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)** - 最适合工具中使用的状态
2. **通过中间件** - 最适合由特定中间件挂钩和附加到所述中间件的工具管理的状态<Note>
  通过中间件定义自定义状态优于通过 [⟦T105⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 上的 [⟦T104⟧](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.AgentMiddleware.state_schema) 定义自定义状态，因为它允许您在概念上将状态扩展保持在相关中间件和工具的范围内。

  仍支持 `state_schema` 以向后兼容 `create_agent`。
</Note>

#### 通过 `state_schema` 定义状态

当您的自定义状态需要通过工具访问时，请使用 [⟦T109⟧](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.AgentMiddleware.state_schema) 参数：

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.tools import tool, ToolRuntime
  from langchain.agents import create_agent, AgentState  # [!code highlight]


  # Define custom state extending AgentState
  class CustomState(AgentState):
      user_name: str

  @tool  # [!code highlight]
  def greet(
      runtime: ToolRuntime[None, CustomState]
  ) -> str:
      """Use this to greet the user by name."""
      user_name = runtime.state.get("user_name", "Unknown")  # [!code highlight]
      return f"Hello {user_name}!"

  agent = create_agent(  # [!code highlight]
      model="claude-sonnet-4-6",
      tools=[greet],
      state_schema=CustomState  # [!code highlight]
  )
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from typing import Annotated
  from langgraph.prebuilt import InjectedState, create_react_agent
  from langgraph.prebuilt.chat_agent_executor import AgentState

  class CustomState(AgentState):
      user_name: str

  def greet(
      state: Annotated[CustomState, InjectedState]
  ) -> str:
      """Use this to greet the user by name."""
      user_name = state["user_name"]
      return f"Hello {user_name}!"

  agent = create_react_agent(
      model="claude-sonnet-4-6",
      tools=[greet],
      state_schema=CustomState
  )
  ```
</CodeGroup>

#### 通过中间件定义状态

中间件还可以通过设置 [⟦T110⟧](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.AgentMiddleware.state_schema) 属性来定义自定义状态。
这有助于将状态扩展概念性地限定在相关中间件和工具的范围内。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents.middleware import AgentState, AgentMiddleware
from typing_extensions import NotRequired
from typing import Any

class CustomState(AgentState):
    model_call_count: NotRequired[int]

class CallCounterMiddleware(AgentMiddleware[CustomState]):
    state_schema = CustomState  # [!code highlight]

    def before_model(self, state: CustomState, runtime) -> dict[str, Any] | None:
        count = state.get("model_call_count", 0)
        if count > 10:
            return {"jump_to": "end"}
        return None

    def after_model(self, state: CustomState, runtime) -> dict[str, Any] | None:
        return {"model_call_count": state.get("model_call_count", 0) + 1}

agent = create_agent(
    model="claude-sonnet-4-6",
    tools=[...],
    middleware=[CallCounterMiddleware()]  # [!code highlight]
)
```

有关通过中间件定义自定义状态的更多详细信息，请参阅[middleware documentation](/oss/python/langchain/middleware#custom-state-schema)。

#### 状态类型限制

[⟦T111⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 仅支持状态模式的 `TypedDict`。不再支持 Pydantic 模型和数据类。

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import AgentState, create_agent

  # AgentState is a TypedDict
  class CustomAgentState(AgentState):  # [!code highlight]
      user_id: str

  agent = create_agent(
      model="claude-sonnet-4-6",
      tools=tools,
      state_schema=CustomAgentState  # [!code highlight]
  )
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from typing_extensions import Annotated

  from pydantic import BaseModel
  from langgraph.graph import StateGraph
  from langgraph.graph.messages import add_messages
  from langchain.messages import AnyMessage


  class AgentState(BaseModel):  # [!code highlight]
      messages: Annotated[list[AnyMessage], add_messages]
      user_id: str

  agent = create_react_agent(
      model="claude-sonnet-4-6",
      tools=tools,
      state_schema=AgentState
  )
  ```
</CodeGroup>

只需继承`langchain.agents.AgentState`而不是`BaseModel`或用`dataclass`装饰即可。
如果您需要执行验证，请在中间件挂钩中处理它。

＃＃＃ 模型动态模型选择允许您根据运行时上下文（例如任务复杂性、成本约束或用户偏好）选择不同的模型。 [⟦T117⟧](https://pypi.org/project/langgraph-prebuilt) v0.6 中发布的[⟦T116⟧](https://reference.langchain.com/python/langchain-classic/agents/react/agent/create_react_agent) 支持通过传递给`model` 参数的可调用动态模型和工具选择。

此功能已在 v1 中移植到中间件接口。

#### 动态模型选择

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import (
      AgentMiddleware, ModelRequest
  )
  from langchain.agents.middleware.types import ModelResponse
  from langchain_openai import ChatOpenAI
  from typing import Callable

  basic_model = ChatOpenAI(model="gpt-5-nano")
  advanced_model = ChatOpenAI(model="gpt-5.5")

  class DynamicModelMiddleware(AgentMiddleware):

      def wrap_model_call(self, request: ModelRequest, handler: Callable[[ModelRequest], ModelResponse]) -> ModelResponse:
          if len(request.state.messages) > self.messages_threshold:
              model = advanced_model
          else:
              model = basic_model
          return handler(request.override(model=model))

      def __init__(self, messages_threshold: int) -> None:
          self.messages_threshold = messages_threshold

  agent = create_agent(
      model=basic_model,
      tools=tools,
      middleware=[DynamicModelMiddleware(messages_threshold=10)]
  )
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langgraph.prebuilt import create_react_agent, AgentState
  from langchain_openai import ChatOpenAI

  basic_model = ChatOpenAI(model="gpt-5-nano")
  advanced_model = ChatOpenAI(model="gpt-5.5")

  def select_model(state: AgentState) -> BaseChatModel:
      # use a more advanced model for longer conversations
      if len(state.messages) > 10:
          return advanced_model
      return basic_model

  agent = create_react_agent(
      model=select_model,
      tools=tools,
  )
  ```
</CodeGroup>

#### 预绑定模型

为了更好地支持结构化输出，[⟦T119⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)不再接受通过工具或配置预先绑定的模型：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# No longer supported
model_with_tools = ChatOpenAI().bind_tools([some_tool])
agent = create_agent(model_with_tools, tools=[])

# Use instead
agent = create_agent("gpt-5.4-mini", tools=[some_tool])
```

<Note>
  如果*不*使用结构化输出，动态模型函数可以返回预先绑定的模型。
</Note>

### 工具

[⟦T121⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 的 [⟦T120⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 参数接受以下列表：

* LangChain [⟦T122⟧](https://reference.langchain.com/python/langchain-core/tools/base/BaseTool)实例（用[⟦T123⟧](https://reference.langchain.com/python/langchain-core/tools/convert/tool)修饰的函数）
* 具有正确类型提示和文档字符串的可调用对象（函数）
* `dict` 代表内置提供者工具

该参数将不再接受 [⟦T125⟧](https://reference.langchain.com/python/langgraph/agents/#langgraph.prebuilt.tool_node.ToolNode) 实例。

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent

  agent = create_agent(
      model="claude-sonnet-4-6",
      tools=[check_weather, search_web]
  )
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langgraph.prebuilt import create_react_agent, ToolNode


  agent = create_react_agent(
      model="claude-sonnet-4-6",
      tools=ToolNode([check_weather, search_web]) # [!code highlight]
  )
  ```
</CodeGroup>

#### 处理工具错误

您现在可以使用实现 `wrap_tool_call` 方法的中间件来配置工具错误的处理。

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import wrap_tool_call
  from langchain.messages import ToolMessage


  @wrap_tool_call
  def handle_tool_errors(request, handler):
      """Handle tool execution errors with custom messages."""
      try:
          return handler(request)
      except Exception as e:
          # Only handle errors that occur during tool execution due to invalid inputs
          # that pass schema validation but fail at runtime (e.g., invalid SQL syntax).
          # Do NOT handle:
          # - Network failures (use tool retry middleware instead)
          # - Incorrect tool implementation errors (should bubble up)
          # - Schema mismatch errors (already auto-handled by the framework)
          #
          # Return a custom error message to the model
          return ToolMessage(
              content=f"Tool error: Please check your input and try again. ({str(e)})",
              tool_call_id=request.tool_call["id"]
          )

  agent = create_agent(
      model="claude-sonnet-4-6",
      tools=[check_weather, search_web],
      middleware=[handle_tool_errors]
  )
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langgraph.prebuilt import create_react_agent, ToolNode
  from langchain.messages import ToolMessage


  def handle_tool_error(error: Exception) -> str:
      """Custom error handler function."""
      return f"Tool error: Please check your input and try again. ({str(error)})"

  agent = create_react_agent(
      model="claude-sonnet-4-6",
      tools=ToolNode(
          [check_weather, search_web],
          handle_tool_errors=handle_tool_error  # [!code highlight]
      )
  )
  ```
</CodeGroup>

### 结构化输出

#### 节点变化结构化输出过去是在与主代理不同的节点中生成的。现在情况已不再如此。
我们在主循环中生成结构化输出，从而降低成本和延迟。

#### 工具和提供商策略

在 v1 中，有两种新的结构化输出策略：

* `ToolStrategy` 使用人工工具调用生成结构化输出
* `ProviderStrategy` 使用提供商原生结构化输出生成

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.structured_output import ToolStrategy, ProviderStrategy
  from pydantic import BaseModel


  class OutputSchema(BaseModel):
      summary: str
      sentiment: str

  # Using ToolStrategy
  agent = create_agent(
      model="gpt-5.4-mini",
      tools=tools,
      # explicitly using tool strategy
      response_format=ToolStrategy(OutputSchema)  # [!code highlight]
  )
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langgraph.prebuilt import create_react_agent
  from pydantic import BaseModel

  class OutputSchema(BaseModel):
      summary: str
      sentiment: str

  agent = create_react_agent(
      model="gpt-5.4-mini",
      tools=tools,
      # using tool strategy by default with no option for provider strategy
      response_format=OutputSchema  # [!code highlight]
  )

  # OR

  agent = create_react_agent(
      model="gpt-5.4-mini",
      tools=tools,
      # using a custom prompt to instruct the model to generate the output schema
      response_format=("please generate ...", OutputSchema)  # [!code highlight]
  )
  ```
</CodeGroup>

#### 提示输出已删除

**提示输出**不再通过 `response_format` 参数支持。与策略相比
与人工工具调用和提供者本机结构化输出一样，提示输出尚未被证明特别可靠。

### 流节点名称重命名

当从代理流式传输事件时，节点名称已从 `"agent"` 更改为 `"model"`，以更好地反映节点的用途。

### 运行时上下文

当您调用代理时，通常需要传递两种类型的数据：

* 在整个对话过程中变化的动态状态（例如消息历史记录）
* 对话期间不会改变的静态上下文（例如用户元数据）在 v1 中，通过将 `context` 参数设置为 `invoke` 和 `stream` 来支持静态上下文。

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass

  from langchain.agents import create_agent


  @dataclass
  class Context:
      user_id: str
      session_id: str

  agent = create_agent(
      model=model,
      tools=tools,
      context_schema=Context  # [!code highlight]
  )

  result = agent.invoke(
      {"messages": [{"role": "user", "content": "Hello"}]},
      context=Context(user_id="123", session_id="abc")  # [!code highlight]
  )
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langgraph.prebuilt import create_react_agent


  agent = create_react_agent(model, tools)

  # Pass context via configurable
  result = agent.invoke(
      {"messages": [{"role": "user", "content": "Hello"}]},
      config={  # [!code highlight]
          "configurable": {  # [!code highlight]
              "user_id": "123",  # [!code highlight]
              "session_id": "abc"  # [!code highlight]
          }  # [!code highlight]
      }  # [!code highlight]
  )
  ```
</CodeGroup>

<Note>
  旧的 `config["configurable"]` 模式仍然适用于向后兼容，但建议新应用程序或迁移到 v1 的应用程序使用新的 `context` 参数。
</Note>

***

## 标准内容

在 v1 中，消息获得与提供商无关的标准内容块。通过 [⟦T137⟧](https://reference.langchain.com/python/langchain_core/language_models/#langchain_core.messages.BaseMessage.content_blocks) 访问它们，以获得跨提供商的一致的类型化视图。对于字符串或提供者本机结构，现有的 [⟦T138⟧](https://reference.langchain.com/python/langchain-core/messages/base/BaseMessage) 字段保持不变。

### 发生了什么变化

* 规范化内容消息的新 [⟦T139⟧](https://reference.langchain.com/python/langchain-core/messages/base/BaseMessage) 属性
*标准化块形状，记录在[Messages](/oss/python/langchain/messages#standard-content-blocks)中
* 通过 `LC_OUTPUT_VERSION=v1` 或 `output_version="v1"` 将标准块可选序列化为 `content`

### 阅读标准化内容

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.chat_models import init_chat_model

  model = init_chat_model("gpt-5-nano")
  response = model.invoke("Explain AI")

  for block in response.content_blocks:
      if block["type"] == "reasoning":
          print(block.get("reasoning"))
      elif block["type"] == "text":
          print(block.get("text"))
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Provider-native formats vary; you needed per-provider handling
  response = model.invoke("Explain AI")
  for item in response.content:
      if item.get("type") == "reasoning":
          ...  # OpenAI-style reasoning
      elif item.get("type") == "thinking":
          ...  # Anthropic-style thinking
      elif item.get("type") == "text":
          ...  # Text
  ```
</CodeGroup>

### 创建多模式消息

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.messages import HumanMessage

  message = HumanMessage(content_blocks=[
      {"type": "text", "text": "Describe this image."},
      {"type": "image", "url": "https://example.com/image.jpg"},
  ])
  res = model.invoke([message])
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.messages import HumanMessage

  message = HumanMessage(content=[
      # Provider-native structure
      {"type": "text", "text": "Describe this image."},
      {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}},
  ])
  res = model.invoke([message])
  ```
</CodeGroup>

### 块形状示例

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Text block
text_block = {
    "type": "text",
    "text": "Hello world",
}

# Image block
image_block = {
    "type": "image",
    "url": "https://example.com/image.png",
    "mime_type": "image/png",
}
```

有关更多详细信息，请参阅内容块[reference](/oss/python/langchain/messages#content-block-reference)。

### 序列化标准内容默认情况下，标准内容块**不会序列化**到 `content` 属性中。如果您需要访问 `content` 属性中的标准内容块（例如，向客户端发送消息时），您可以选择将它们序列化为 `content`。

<CodeGroup>
  ```bash Environment variable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  export LC_OUTPUT_VERSION=v1
  ```

  ```python Initialization parameter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.chat_models import init_chat_model

  model = init_chat_model(
      "gpt-5-nano",
      output_version="v1",
  )
  ```
</CodeGroup>

<Note>
  了解更多：[Messages](/oss/python/langchain/messages#message-content)、[Standard content blocks](/oss/python/langchain/messages#standard-content-blocks)和[Multimodal](/oss/python/langchain/messages#multimodal)。
</Note>

***

## 简化包

v1 中的 `langchain` 包命名空间已显着减少，以专注于代理的基本构建块。精简的包使您更容易发现和使用核心功能。

### 命名空间|模块|有什么可用的 |笔记|
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| [⟦T147⟧](https://reference.langchain.com/python/langchain/agents) | [⟦T148⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)、[⟦T149⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/AgentState) |核心代理创建功能 |
| [⟦T150⟧](https://reference.langchain.com/python/langchain/messages) |消息类型，[content blocks](https://reference.langchain.com/python/langchain-core/messages/content/ContentBlock)，[⟦T151⟧](https://reference.langchain.com/python/langchain-core/messages/utils/trim_messages) |从`langchain-core`转口|
| [⟦T153⟧](https://reference.langchain.com/python/langchain/tools) | [⟦T154⟧](https://reference.langchain.com/python/langchain-core/tools/convert/tool)、[⟦T155⟧](https://reference.langchain.com/python/langchain-core/tools/base/BaseTool)、注射助手 |从`langchain-core`转口|
| [⟦T157⟧](https://reference.langchain.com/python/langchain/models) | [⟦T158⟧](https://reference.langchain.com/python/langchain/chat_models/base/init_chat_model)、[⟦T159⟧](https://reference.langchain.com/python/langchain-core/language_models/chat_models/BaseChatModel) |统一模型初始化|
| [⟦T160⟧](https://reference.langchain.com/python/langchain/embeddings) | [⟦T161⟧](https://reference.langchain.com/python/langchain/embeddings/base/init_embeddings)、[⟦T162⟧](https://reference.langchain.com/python/langchain-core/embeddings/embeddings/Embeddings) |嵌入模型|

### `langchain-classic`如果您使用 `langchain` 包中的以下任何一项，则需要安装 [⟦T165⟧](https://pypi.org/project/langchain-classic/) 并更新您的导入：

* 旧链（`LLMChain`、`ConversationChain`等）
* 检索器（例如 `MultiQueryRetriever` 或之前的 `langchain.retrievers` 模块中的任何内容）
* 索引API
* hub模块（用于以编程方式管理提示）
* 嵌入模块（例如 `CacheBackedEmbeddings` 和社区嵌入）
* [⟦T171⟧](https://pypi.org/project/langchain-community) 转口
* 其他已弃用的功能

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Chains
  from langchain_classic.chains import LLMChain

  # Retrievers
  from langchain_classic.retrievers import ...

  # Indexing
  from langchain_classic.indexes import ...

  # Hub
  from langchain_classic import hub
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Chains
  from langchain_classic.chains import LLMChain

  # Retrievers
  from langchain.retrievers import ...

  # Indexing
  from langchain.indexes import ...

  # Hub
  from langchain import hub
  ```
</CodeGroup>

**安装**：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv pip install langchain-classic
```

***

## 重大变更

### 放弃了 Python 3.9 支持

所有 LangChain 软件包现在都需要 **Python 3.10 或更高版本**。 Python 3.9 将于 2025 年 10 月达到[end of life](https://devguide.python.org/versions/)。

### 更新了聊天模型的返回类型

聊天模型调用的返回类型签名已从 [⟦T172⟧](https://reference.langchain.com/python/langchain-core/messages/base/BaseMessage) 修复为 [⟦T173⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage)。实现 [⟦T174⟧](https://reference.langchain.com/python/langchain-core/language_models/chat_models/BaseChatModel/bind_tools) 的自定义聊天模型应更新其返回签名：

<CodeGroup>
  ```python v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  def bind_tools(
          ...
      ) -> Runnable[LanguageModelInput, AIMessage]:
  ```

  ```python v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  def bind_tools(
          ...
      ) -> Runnable[LanguageModelInput, BaseMessage]:
  ```
</CodeGroup>

### OpenAI 响应 API 的默认消息格式

与响应 API 交互时，`langchain-openai` 现在默认将响应项存储在消息 `content` 中。要恢复以前的行为，请将 `LC_OUTPUT_VERSION` 环境变量设置为 `v0`，或在实例化 [⟦T180⟧](https://reference.langchain.com/python/langchain-openai/chat_models/base/ChatOpenAI) 时指定 `output_version="v0"`。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Enforce previous behavior with output_version flag
model = ChatOpenAI(model="gpt-5.4-mini", output_version="v0")
```### `langchain-anthropic` 中的默认`max_tokens`

`langchain-anthropic` 中的 `max_tokens` 参数现在根据所选模型默认为更高的值，而不是之前的默认值 `1024`。如果您依赖旧的默认值，请显式设置 `max_tokens=1024`。

### 旧代码移至`langchain-classic`

标准接口和代理之外的现有功能已移至 [⟦T188⟧](https://pypi.org/project/langchain-classic) 包。请参阅 [Simplified namespace](#simplified-package) 部分，了解有关核心 `langchain` 包中可用内容以及移至 `langchain-classic` 的内容的详细信息。

### 删除已弃用的 API

已被弃用并计划在 1.0 中删除的方法、函数和其他对象已被删除。检查以前版本中的[deprecation notices](https://python.langchain.com/docs/versions/migrating_chains)以获取替换 API。

### 文本属性

在消息对象上使用 `.text()` 方法应该删除括号，因为它现在是一个属性：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Property access
text = response.text

# Deprecated method call
text = response.text()
```

现有的使用模式（即`.text()`）将继续发挥作用，但现在会发出警告。方法形式将在 v2 中删除。

### `example` 参数已从 `AIMessage` 中删除

`example` 参数已从 [⟦T196⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage) 对象中删除。我们建议迁移到使用`additional_kwargs`来根据需要传递额外的元数据。

## 小改动* `AIMessageChunk` 对象现在包含一个 `chunk_position` 属性，其位置为 `'last'` 来指示流中的最终块。这允许更清晰地处理流消息。如果该块不是最后一个块，则`chunk_position`将是`None`。
* `LanguageModelOutputVar` 现在输入为 [⟦T204⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage) 而不是 [⟦T205⟧](https://reference.langchain.com/python/langchain-core/messages/base/BaseMessage)。
* 合并消息块 (`AIMessageChunk.add`) 的逻辑已更新，对合并块的最终 id 进行了更复杂的选择处理。它优先考虑提供商分配的 ID，而不是 LangChain 生成的 ID。
* 现在我们默认打开使用`utf-8`编码的文件。
* 标准测试现在使用多模式内容块。

## 存档文档

旧文档存档以供参考：

* [v0.3 docs content](https://github.com/langchain-ai/langchain/tree/v0.3/docs/docs)
* [v0.3 API reference](https://reference.langchain.com/v0.3/python/)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/migrate/langchain-v1.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>