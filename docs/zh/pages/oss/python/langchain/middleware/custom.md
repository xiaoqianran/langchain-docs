<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Custom middleware | https://docs.langchain.com/oss/python/langchain/middleware/custom -->

# 自定义中间件

通过实现在代理执行流程中的特定点运行的挂钩来构建自定义中间件。

## 钩子

中间件提供了两种类型的钩子来拦截代理执行：

<CardGroup>
  <Card title="Node-style hooks" icon="share" href="#node-style-hooks">
    在特定的执行点顺序运行。
  </Card>

  <Card title="Wrap-style hooks" icon="container" href="#wrap-style-hooks">
    围绕每个模型或工具调用运行。
  </Card>
</CardGroup>

### 节点式挂钩

在特定的执行点顺序运行。用于日志记录、验证和状态更新。

选择您的中间件需要的挂钩。您可以在节点式挂钩和环绕式挂钩之间进行选择。

**节点式挂钩**在特定执行点运行：

|钩|当它运行时 |
| -------------- | ------------------------------------------- |
| `before_agent` |代理启动之前（每次调用一次）|
| `before_model` |每次模型调用之前 |
| `after_model` |每次模型响应后 |
| `after_agent` |代理完成后（每次调用一次）|

**环绕式钩子**围绕每个调用运行，让您可以控制执行：|钩|当它运行时 |
| ----------------- | ---------------------- |
| `wrap_model_call` |各地型号调用|
| `wrap_tool_call` |围绕每个工具调用|

**示例：**

<Tabs>
  <Tab title="Decorator">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents.middleware import before_model, after_model, AgentState
    from langchain.messages import AIMessage
    from langgraph.runtime import Runtime
    from typing import Any


    @before_model(can_jump_to=["end"])
    def check_message_limit(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        if len(state["messages"]) >= 50:
            return {
                "messages": [AIMessage("Conversation limit reached.")],
                "jump_to": "end"
            }
        return None

    @after_model
    def log_response(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        print(f"Model returned: {state['messages'][-1].content}")
        return None
    ```
  </Tab>

  <Tab title="Class">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents.middleware import AgentMiddleware, AgentState, hook_config
    from langchain.messages import AIMessage
    from langgraph.runtime import Runtime
    from typing import Any

    class MessageLimitMiddleware(AgentMiddleware):
        def __init__(self, max_messages: int = 50):
            super().__init__()
            self.max_messages = max_messages

        @hook_config(can_jump_to=["end"])
        def before_model(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
            if len(state["messages"]) >= self.max_messages:
                return {
                    "messages": [AIMessage("Conversation limit reached.")],
                    "jump_to": "end"
                }
            return None

        def after_model(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
            print(f"Model returned: {state['messages'][-1].content}")
            return None
    ```
  </Tab>
</Tabs>

### 缠绕式挂钩

调用处理程序时拦截执行和控制。用于重试、缓存和转换。

您可以决定处理程序是否被调用零次（短路）、一次（正常流程）或多次（重试逻辑）。

**可用的挂钩：**

* `wrap_model_call` - 围绕每个模型调用
* `wrap_tool_call` - 围绕每个工具调用

**示例：**

<Tabs>
  <Tab title="Decorator">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    from typing import Callable


    @wrap_model_call
    def retry_model(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse],
    ) -> ModelResponse:
        for attempt in range(3):
            try:
                return handler(request)
            except Exception as e:
                if attempt == 2:
                    raise
                print(f"Retry {attempt + 1}/3 after error: {e}")
    ```
  </Tab>

  <Tab title="Class">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents.middleware import AgentMiddleware, ModelRequest, ModelResponse
    from typing import Callable

    class RetryMiddleware(AgentMiddleware):
        def __init__(self, max_retries: int = 3):
            super().__init__()
            self.max_retries = max_retries

        def wrap_model_call(
            self,
            request: ModelRequest,
            handler: Callable[[ModelRequest], ModelResponse],
        ) -> ModelResponse:
            for attempt in range(self.max_retries):
                try:
                    return handler(request)
                except Exception as e:
                    if attempt == self.max_retries - 1:
                        raise
                    print(f"Retry {attempt + 1}/{self.max_retries} after error: {e}")
    ```
  </Tab>
</Tabs>

## 状态更新

节点式和包裹式钩子都可以更新代理状态。机制不同：* **节点式钩子** (`before_agent`, `before_model`, `after_model`, `after_agent`): 直接返回一个dict。使用图的化简器将字典应用于代理状态。
* **Wrap-style hooks** (`wrap_model_call`, `wrap_tool_call`)：对于模型调用，返回 [⟦T39⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/ExtendedModelResponse) 和 [⟦T40⟧](https://reference.langchain.com/python/langgraph/types/Command) 以在模型响应旁边注入状态更新。对于工具调用，直接返回[⟦T41⟧](https://reference.langchain.com/python/langgraph/types/Command)。当您需要根据模型或工具调用期间运行的逻辑（例如汇总触发点、使用元数据或根据请求或响应计算的自定义字段）跟踪或更新状态时，请使用这些。

### 节点式挂钩

从节点式挂钩返回一个字典，将更新合并到代理状态中。字典键映射到状态字段。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents.middleware import after_model, AgentState
from langgraph.runtime import Runtime
from typing import Any
from typing_extensions import NotRequired


class TrackingState(AgentState):
    model_call_count: NotRequired[int]


@after_model(state_schema=TrackingState)
def increment_after_model(state: TrackingState, runtime: Runtime) -> dict[str, Any] | None:
    return {"model_call_count": state.get("model_call_count", 0) + 1}
```

### 缠绕式挂钩

从 `wrap_model_call` 返回一个 [⟦T42⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/ExtendedModelResponse) 和 [⟦T43⟧](https://reference.langchain.com/python/langgraph/types/Command)，以从模型调用层注入状态更新：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import Callable
from langchain.agents.middleware import (
    wrap_model_call,
    ModelRequest,
    ModelResponse,
    AgentState,
    ExtendedModelResponse
)
from langgraph.types import Command
from typing_extensions import NotRequired

class UsageTrackingState(AgentState):
    """Agent state with token usage tracking."""

    last_model_call_tokens: NotRequired[int]


@wrap_model_call(state_schema=UsageTrackingState)
def track_usage(
    request: ModelRequest,
    handler: Callable[[ModelRequest], ModelResponse],
) -> ExtendedModelResponse:
    response = handler(request)
    return ExtendedModelResponse(
        model_response=response,
        command=Command(update={"last_model_call_tokens": 150}),
    )
```

[⟦T45⟧](https://reference.langchain.com/python/langgraph/types/Command) 流经图的化简器，因此可以正确应用更新，并且消息是附加的而不是替换现有状态。

#### 多个中间件的组合

当多个中间件层返回`ExtendedModelResponse`时，它们的命令组成：* **命令通过reducers应用：** 每个`Command`成为一个单独的状态更新。对于消息来说，这意味着它们是可加的。
* **外部在冲突时获胜：** 对于非减速器状态字段，命令先应用内部，然后应用外部。最外层中间件的值优先于冲突的键。
* **重试安全：** 如果外部中间件实现了可能导致再次多次调用`handler()`的逻辑（例如重试逻辑），则先前调用的命令将被丢弃。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import Annotated, Callable

from langchain.agents.middleware import (
    AgentMiddleware,
    AgentState,
    ExtendedModelResponse,
    ModelRequest,
    ModelResponse,
)
from langchain.messages import SystemMessage
from langgraph.types import Command
from typing_extensions import NotRequired


def _last_wins(_a: str, b: str) -> str:
    """Reducer: last writer wins (outer overwrites inner)."""
    return b


class CustomMiddlewareState(AgentState):
    """Agent state: trace_layer uses last-wins (outer wins), messages use additive reducer."""

    # Non-reducer field with last-wins: both middleware write; outermost value wins
    trace_layer: NotRequired[Annotated[str, _last_wins]]


class OuterMiddleware(AgentMiddleware):
    def wrap_model_call(
        self,
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse],
    ) -> ExtendedModelResponse:
        response = handler(request)
        return ExtendedModelResponse(
            model_response=response,
            command=Command(update={
                "trace_layer": "outer",
                "messages": [SystemMessage(content="[Outer ran]")],
            }),
        )


class InnerMiddleware(AgentMiddleware):
    """Adds trace_layer and message. Outer adds to same keys; trace_layer: outer wins, messages: additive."""

    def wrap_model_call(
        self,
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse],
    ):
        response = handler(request)
        return ExtendedModelResponse(
            model_response=response,
            command=Command(update={
                "trace_layer": "inner",
                "messages": [SystemMessage(content="[Inner ran]")],
            }),
        )
```

## 创建中间件

您可以通过两种方式创建中间件：

<CardGroup>
  <Card title="Decorator-based middleware" icon="at" href="#decorator-based-middleware">
    单钩子中间件快速而简单。使用装饰器来包装各个函数。
  </Card>

  <Card title="Class-based middleware" icon="braces" href="#class-based-middleware">
    对于具有多个钩子或配置的复杂中间件来说更强大。
  </Card>
</CardGroup>

### 基于装饰器的中间件

单钩子中间件快速而简单。使用装饰器来包装各个函数。

**可用的装饰器：**

**节点样式：**

* [⟦T49⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/before_agent) - 在代理启动之前运行（每次调用一次）
* [⟦T50⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/before_model) - 在每次模型调用之前运行
* [⟦T51⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/after_model) - 在每个模型响应后运行
* [⟦T52⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/after_agent) - 代理完成后运行（每次调用一次）

**包裹式：*** [⟦T53⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/wrap_model_call) - 用自定义逻辑包装每个模型调用
* [⟦T54⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/wrap_tool_call) - 用自定义逻辑包装每个工具调用

**方便：**

* [⟦T55⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/dynamic_prompt) - 生成动态系统提示

**示例：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents.middleware import (
    before_model,
    wrap_model_call,
    AgentState,
    ModelRequest,
    ModelResponse,
)
from langchain.agents import create_agent
from langgraph.runtime import Runtime
from typing import Any, Callable


@before_model
def log_before_model(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
    print(f"About to call model with {len(state['messages'])} messages")
    return None

@wrap_model_call
def retry_model(
    request: ModelRequest,
    handler: Callable[[ModelRequest], ModelResponse],
) -> ModelResponse:
    for attempt in range(3):
        try:
            return handler(request)
        except Exception as e:
            if attempt == 2:
                raise
            print(f"Retry {attempt + 1}/3 after error: {e}")

agent = create_agent(
    model="gpt-5.5",
    middleware=[log_before_model, retry_model],
    tools=[...],
)
```

**何时使用装饰器：**

* 需要单钩
* 无需复杂的配置
* 快速原型制作

### 基于类的中间件

对于具有多个钩子或配置的复杂中间件来说更强大。当您需要为同一个钩子定义同步和异步实现时，或者当您想要在单个中间件中组合多个钩子时，请使用类。

蟒蛇
`AgentMiddleware` 子类可以声明代理工厂在编译时获取的三个类属性：

* `state_schema` — 使用自定义字段扩展代理状态。参见[Custom state schema](#custom-state-schema)。
* `tools` — 注册中间件附带的其他工具（例如，待办事项列表中间件上的 `write_todos`）。
* `transformers` — 注册作用域感知的流转换器工厂。参见[Custom stream transformers](#custom-stream-transformers)。
  :::

**示例：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents.middleware import (
    AgentMiddleware,
    AgentState,
    ModelRequest,
    ModelResponse,
)
from langgraph.runtime import Runtime
from typing import Any, Callable

class LoggingMiddleware(AgentMiddleware):
    def before_model(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        print(f"About to call model with {len(state['messages'])} messages")
        return None

    def after_model(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        print(f"Model returned: {state['messages'][-1].content}")
        return None

    async def abefore_model(
        self, state: AgentState, runtime: Runtime
    ) -> dict[str, Any] | None:
        # Async version of before_model
        return None

    async def aafter_model(
        self, state: AgentState, runtime: Runtime
    ) -> dict[str, Any] | None:
        # Async version of after_model
        print(f"Model returned: {state['messages'][-1].content}")
        return None


agent = create_agent(
    model="gpt-5.5",
    middleware=[LoggingMiddleware()],
    tools=[...],
)
```

**何时使用类：*** 为同一个钩子定义同步和异步实现
* 单个中间件中需要多个钩子
* 需要复杂的配置（例如，可配置阈值、自定义模型）
* 通过初始化时配置跨项目重用

:::

## 自定义状态模式

如果您的中间件需要跨钩子跟踪状态，中间件可以使用自定义属性扩展代理的状态。这使得中间件能够：

* **跟踪执行过程中的状态**：维护在代理执行生命周期中持续存在的计数器、标志或其他值

* **在钩子之间共享数据**：从`before_model`到`after_model`或不同中间件实例之间传递信息

* **实现横切关注点**：添加速率限制、使用跟踪、用户上下文或审核日志记录等功能，而无需修改核心代理逻辑

* **做出条件决策**：使用累积状态来确定是否继续执行、跳转到不同节点或动态修改行为

<Tabs>
  <Tab title="Decorator">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents import create_agent
    from langchain.messages import HumanMessage
    from langchain.agents.middleware import AgentState, before_model, after_model
    from typing_extensions import NotRequired
    from typing import Any
    from langgraph.runtime import Runtime


    class CustomState(AgentState):
        model_call_count: NotRequired[int]
        user_id: NotRequired[str]


    @before_model(state_schema=CustomState, can_jump_to=["end"])
    def check_call_limit(state: CustomState, runtime: Runtime) -> dict[str, Any] | None:
        count = state.get("model_call_count", 0)
        if count > 10:
            return {"jump_to": "end"}
        return None


    @after_model(state_schema=CustomState)
    def increment_counter(state: CustomState, runtime: Runtime) -> dict[str, Any] | None:
        return {"model_call_count": state.get("model_call_count", 0) + 1}


    agent = create_agent(
        model="gpt-5.5",
        middleware=[check_call_limit, increment_counter],
        tools=[],
    )

    # Invoke with custom state
    result = agent.invoke({
        "messages": [HumanMessage("Hello")],
        "model_call_count": 0,
        "user_id": "user-123",
    })
    ```
  </Tab>

  <Tab title="Class">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents import create_agent
    from langchain.messages import HumanMessage
    from langchain.agents.middleware import AgentState, AgentMiddleware
    from typing_extensions import NotRequired
    from typing import Any


    class CustomState(AgentState):
        model_call_count: NotRequired[int]
        user_id: NotRequired[str]


    class CallCounterMiddleware(AgentMiddleware[CustomState]):
        state_schema = CustomState

        def before_model(self, state: CustomState, runtime) -> dict[str, Any] | None:
            count = state.get("model_call_count", 0)
            if count > 10:
                return {"jump_to": "end"}
            return None

        def after_model(self, state: CustomState, runtime) -> dict[str, Any] | None:
            return {"model_call_count": state.get("model_call_count", 0) + 1}


    agent = create_agent(
        model="gpt-5.5",
        middleware=[CallCounterMiddleware()],
        tools=[],
    )

    # Invoke with custom state
    result = agent.invoke({
        "messages": [HumanMessage("Hello")],
        "model_call_count": 0,
        "user_id": "user-123",
    })
    ```
  </Tab>
</Tabs>

## 自定义流转换器

<Note>中间件注册变压器需要`langchain>=1.3.2`。</Note>中间件可以注册流转换器工厂，将事件从实时代理流投影到类型化扩展通道上。这对于在不耦合到框架的内置投影的情况下显示计数器、侧通道工件、部分输出或线级编辑非常有用。

在编译时，中间件注册的工厂与调用者直接传递给代理工厂的任何内容合并。 [final ordering rules](/oss/python/langchain/event-streaming#register-transformers-on-middleware) 将内置的 `ToolCallTransformer` 保留在前面，并让调用者提供的条目最后落地。

将 `transformers` 类属性设置为工厂可调用元组。每个工厂都有形状`Callable[[tuple[str, ...]], StreamTransformer]`，并被调用为`factory(scope)`，其中`scope`是迷你多路复用范围元组（`()`表示根，子图非空）；每次调用返回一个新的变压器使每个子图保持隔离。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import AgentMiddleware


class ToolActivityMiddleware(AgentMiddleware):
    transformers = (ToolActivityTransformer,)


agent = create_agent(
    model="gpt-5-nano",
    tools=[...],
    middleware=[ToolActivityMiddleware()],
)
```

请参阅 [Register transformers on middleware](/oss/python/langchain/event-streaming#register-transformers-on-middleware) 了解完整的排序规则和 PII 编辑示例。

## 执行顺序

使用多个中间件时，了解它们如何执行：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
agent = create_agent(
    model="gpt-5.5",
    middleware=[middleware1, middleware2, middleware3],
    tools=[...],
)
```

<Accordion title="Execution flow">
  **在钩子按顺序运行之前：**

  1.`middleware1.before_agent()`
  2.`middleware2.before_agent()`
  3.`middleware3.before_agent()`

  **代理循环开始**

  4.`middleware1.before_model()`
  5.`middleware2.before_model()`
  6.`middleware3.before_model()`

  **像函数调用一样包裹钩子嵌套：**

  7. `middleware1.wrap_model_call()` → `middleware2.wrap_model_call()` → `middleware3.wrap_model_call()` → 型号

  **挂钩以相反顺序运行后：**8.`middleware3.after_model()`
  9. `middleware2.after_model()`
  10.`middleware1.after_model()`

  **代理循环结束**

  11.`middleware3.after_agent()`
  12.`middleware2.after_agent()`
  13.`middleware1.after_agent()`
</Accordion>

**关键规则：**

* `before_*` 挂钩：从第一个到最后一个
* `after_*` 挂钩：最后到第一个（反向）
* `wrap_*` 钩子：嵌套（第一个中间件包装所有其他中间件）

## 特工跳跃

要提前退出中间件，请返回带有 `jump_to` 的字典：

**可用的跳跃目标：**

* `'end'`：跳转到代理执行的末尾（或第一个`after_agent`钩子）
* `'tools'`：跳转到工具节点
* `'model'`：跳转到模型节点（或者第一个`before_model`钩子）

<Tabs>
  <Tab title="Decorator">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents.middleware import after_model, hook_config, AgentState
    from langchain.messages import AIMessage
    from langgraph.runtime import Runtime
    from typing import Any


    @after_model
    @hook_config(can_jump_to=["end"])
    def check_for_blocked(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        last_message = state["messages"][-1]
        if "BLOCKED" in last_message.content:
            return {
                "messages": [AIMessage("I cannot respond to that request.")],
                "jump_to": "end"
            }
        return None
    ```
  </Tab>

  <Tab title="Class">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents.middleware import AgentMiddleware, hook_config, AgentState
    from langchain.messages import AIMessage
    from langgraph.runtime import Runtime
    from typing import Any

    class BlockedContentMiddleware(AgentMiddleware):
        @hook_config(can_jump_to=["end"])
        def after_model(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
            last_message = state["messages"][-1]
            if "BLOCKED" in last_message.content:
                return {
                    "messages": [AIMessage("I cannot respond to that request.")],
                    "jump_to": "end"
                }
            return None
    ```
  </Tab>
</Tabs>

## 最佳实践

1. 集中中间件——每个中间件都应该做好一件事
2. 优雅地处理错误——不要让中间件错误导致代理崩溃
3. **使用适当的钩子类型**：
   * 用于顺序逻辑的节点样式（日志记录、验证）
   * 控制流的环绕式（重试、回退、缓存）
4. 清楚地记录任何自定义状态属性
5. 集成前独立对中间件进行单元测试
6. 考虑执行顺序 - 将关键中间件放在列表的第一位
7. 尽可能使用内置中间件

## 示例

###动态提示在运行时动态修改系统提示符，以在每次模型调用之前注入上下文、用户特定的指令或其他信息。这是最常见的中间件用例之一。

使用`ModelRequest`上的`system_message`字段读取和修改系统提示符。它包含一个 [⟦T96⟧](https://reference.langchain.com/python/langchain-core/messages/system/SystemMessage) 对象（即使代理是使用字符串 `system_prompt` 创建的）。

<Tabs>
  <Tab title="Decorator">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from collections.abc import Callable

    from langchain.agents.middleware import ModelRequest, ModelResponse, wrap_model_call
    from langchain.messages import SystemMessage


    @wrap_model_call
    def add_context(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse],
    ) -> ModelResponse:
        new_content = list(request.system_message.content_blocks) + [
            {"type": "text", "text": "Additional context."}
        ]
        new_system_message = SystemMessage(content=new_content)
        return handler(request.override(system_message=new_system_message))
    ```
  </Tab>

  <Tab title="Class">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from collections.abc import Callable

    from langchain.agents.middleware import AgentMiddleware, ModelRequest, ModelResponse


    class ContextMiddleware(AgentMiddleware):
        def wrap_model_call(
            self,
            request: ModelRequest,
            handler: Callable[[ModelRequest], ModelResponse],
        ) -> ModelResponse:
            new_content = list(request.system_message.content_blocks) + [
                {"type": "text", "text": "Additional context."}
            ]
            new_system_message = SystemMessage(content=new_content)
            return handler(request.override(system_message=new_system_message))
    ```
  </Tab>
</Tabs>

<Note>
  * `ModelRequest.system_message` 始终是 [⟦T99⟧](https://reference.langchain.com/python/langchain-core/messages/system/SystemMessage) 对象，即使代理是使用 `system_prompt="string"` 创建的
  * 使用`SystemMessage.content_blocks`以块列表的形式访问内容，无论原始内容是字符串还是列表
  * 修改系统消息时，使用`content_blocks`并附加新块以保留现有结构
  * 您可以将 [⟦T103⟧](https://reference.langchain.com/python/langchain-core/messages/system/SystemMessage) 对象直接传递给 `create_agent` 的 `system_prompt` 参数，以实现缓存控制等高级用例
</Note>

### 动态模型选择

<Tabs>
  <Tab title="Decorator">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from collections.abc import Callable

    from langchain.agents.middleware import ModelRequest, ModelResponse, wrap_model_call
    from langchain.chat_models import init_chat_model

    complex_model = init_chat_model("claude-sonnet-4-6")
    simple_model = init_chat_model("claude-haiku-4-5-20251001")


    @wrap_model_call
    def dynamic_model(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse],
    ) -> ModelResponse:
        if len(request.messages) > 10:
            model = complex_model
        else:
            model = simple_model
        return handler(request.override(model=model))
    ```
  </Tab>

  <Tab title="Class">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from collections.abc import Callable

    from langchain.agents.middleware import AgentMiddleware, ModelRequest, ModelResponse
    from langchain.chat_models import init_chat_model

    complex_model = init_chat_model("claude-sonnet-4-6")
    simple_model = init_chat_model("claude-haiku-4-5-20251001")


    class DynamicModelMiddleware(AgentMiddleware):
        def wrap_model_call(
            self,
            request: ModelRequest,
            handler: Callable[[ModelRequest], ModelResponse],
        ) -> ModelResponse:
            if len(request.messages) > 10:
                model = complex_model
            else:
                model = simple_model
            return handler(request.override(model=model))
    ```
  </Tab>
</Tabs>

### 动态选择工具

在运行时选择相关工具以提高性能和准确性。本节介绍过滤预注册工具。有关注册在运行时发现的工具（例如，从 MCP 服务器），请参阅[Runtime tool registration](/oss/python/langchain/tools#dynamic-tool-selection)。**好处：**

* **更短的提示** - 通过仅公开相关工具来降低复杂性
* **更高的准确性** - 模型从更少的选项中正确选择
* **权限控制** - 根据用户访问权限动态过滤工具

<Tabs>
  <Tab title="Decorator">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents import create_agent
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    from typing import Callable


    @wrap_model_call
    def select_tools(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse],
    ) -> ModelResponse:
        """Middleware to select relevant tools based on state/context."""
        # Select a small, relevant subset of tools based on state/context
        relevant_tools = select_relevant_tools(request.state, request.runtime)
        return handler(request.override(tools=relevant_tools))

    agent = create_agent(
        model="gpt-5.5",
        tools=all_tools,  # All available tools need to be registered upfront
        middleware=[select_tools],
    )
    ```
  </Tab>

  <Tab title="Class">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents import create_agent
    from langchain.agents.middleware import AgentMiddleware, ModelRequest, ModelResponse
    from typing import Callable


    class ToolSelectorMiddleware(AgentMiddleware):
        def wrap_model_call(
            self,
            request: ModelRequest,
            handler: Callable[[ModelRequest], ModelResponse],
        ) -> ModelResponse:
            """Middleware to select relevant tools based on state/context."""
            # Select a small, relevant subset of tools based on state/context
            relevant_tools = select_relevant_tools(request.state, request.runtime)
            return handler(request.override(tools=relevant_tools))

    agent = create_agent(
        model="gpt-5.5",
        tools=all_tools,  # All available tools need to be registered upfront
        middleware=[ToolSelectorMiddleware()],
    )
    ```
  </Tab>
</Tabs>

### 工具调用监控

<Tabs>
  <Tab title="Decorator">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from collections.abc import Callable

    from langchain.agents.middleware import wrap_tool_call
    from langchain.messages import ToolMessage
    from langchain.tools.tool_node import ToolCallRequest
    from langgraph.types import Command


    @wrap_tool_call
    def monitor_tool(
        request: ToolCallRequest,
        handler: Callable[[ToolCallRequest], ToolMessage | Command],
    ) -> ToolMessage | Command:
        print(f"Executing tool: {request.tool_call['name']}")
        print(f"Arguments: {request.tool_call['args']}")
        try:
            result = handler(request)
            print("Tool completed successfully")
            return result
        except Exception as e:
            print(f"Tool failed: {e}")
            raise
    ```
  </Tab>

  <Tab title="Class">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from collections.abc import Callable

    from langchain.agents.middleware import AgentMiddleware
    from langchain.messages import ToolMessage
    from langchain.tools.tool_node import ToolCallRequest
    from langgraph.types import Command


    class ToolMonitoringMiddleware(AgentMiddleware):
        def wrap_tool_call(
            self,
            request: ToolCallRequest,
            handler: Callable[[ToolCallRequest], ToolMessage | Command],
        ) -> ToolMessage | Command:
            print(f"Executing tool: {request.tool_call['name']}")
            print(f"Arguments: {request.tool_call['args']}")
            try:
                result = handler(request)
                print("Tool completed successfully")
                return result
            except Exception as e:
                print(f"Tool failed: {e}")
                raise
    ```
  </Tab>
</Tabs>

### 提示缓存（人为）

使用 Anthropic 模型时，使用带有缓存控制指令的结构化内容块来缓存大型系统提示：

<Tabs>
  <Tab title="Decorator">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    from langchain.messages import SystemMessage
    from typing import Callable


    @wrap_model_call
    def add_cached_context(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse],
    ) -> ModelResponse:
        # Always work with content blocks
        new_content = list(request.system_message.content_blocks) + [
            {
                "type": "text",
                "text": "Here is a large document to analyze:\n\n<document>...</document>",
                # content up until this point is cached
                "cache_control": {"type": "ephemeral"}
            }
        ]

        new_system_message = SystemMessage(content=new_content)
        return handler(request.override(system_message=new_system_message))
    ```
  </Tab>

  <Tab title="Class">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents.middleware import AgentMiddleware, ModelRequest, ModelResponse
    from langchain.messages import SystemMessage
    from typing import Callable


    class CachedContextMiddleware(AgentMiddleware):
        def wrap_model_call(
            self,
            request: ModelRequest,
            handler: Callable[[ModelRequest], ModelResponse],
        ) -> ModelResponse:
            # Always work with content blocks
            new_content = list(request.system_message.content_blocks) + [
                {
                    "type": "text",
                    "text": "Here is a large document to analyze:\n\n<document>...</document>",
                    "cache_control": {"type": "ephemeral"}  # This content will be cached
                }
            ]

            new_system_message = SystemMessage(content=new_content)
            return handler(request.override(system_message=new_system_message))
    ```
  </Tab>
</Tabs>

**注释：**

* `ModelRequest.system_message` 始终是 [⟦T107⟧](https://reference.langchain.com/python/langchain-core/messages/system/SystemMessage) 对象，即使代理是使用 `system_prompt="string"` 创建的
* 使用`SystemMessage.content_blocks`以块列表的形式访问内容，无论原始内容是字符串还是列表
* 修改系统消息时，使用`content_blocks`并附加新块以保留现有结构
* 您可以将 [⟦T111⟧](https://reference.langchain.com/python/langchain-core/messages/system/SystemMessage) 对象直接传递给 `create_agent` 的 `system_prompt` 参数，以实现缓存控制等高级用例

:::

## 其他资源

* [Middleware API reference](https://reference.langchain.com/python/langchain/middleware/)
* [Built-in middleware](/oss/python/langchain/middleware/built-in)
* [Testing agents](/oss/python/langchain/test/)

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/middleware/custom.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>