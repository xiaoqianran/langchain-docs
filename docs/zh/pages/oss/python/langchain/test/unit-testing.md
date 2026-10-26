<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Unit testing | https://docs.langchain.com/oss/python/langchain/test/unit-testing -->

# 单元测试

使用假聊天模型和内存持久性测试代理逻辑，无需 API 调用。

单元测试单独测试代理的小型确定性部分。通过用内存中的假数据（又名固定装置）替换真实的 LLM，您可以编写精确的响应（文本、工具调用和错误），因此测试快速、免费且可重复，无需 API 密钥。

## 模拟聊天模型

LangChain 提供 [⟦T6⟧](https://reference.langchain.com/python/langchain-core/language_models/fake_chat_models/GenericFakeChatModel) 用于模拟文本响应。它接受响应的迭代器（[⟦T7⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage)对象或字符串）并每次调用返回一个。它支持常规和流式使用。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langchain.messages import AIMessage, ToolCall

model = GenericFakeChatModel(messages=iter([
    AIMessage(content="", tool_calls=[ToolCall(name="foo", args={"bar": "baz"}, id="call_1")]),
    "bar"
]))

model.invoke("hello")
# AIMessage(content='', ..., tool_calls=[{'name': 'foo', 'args': {'bar': 'baz'}, 'id': 'call_1', 'type': 'tool_call'}])
```

如果我们再次调用该模型，它将返回迭代器中的下一项：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
model.invoke("hello, again!")
# AIMessage(content='bar', ...)
```

## 使用 `FakeListChatModel` 返回纯文本

对于仅需要文本响应的测试，请使用`FakeListChatModel`。它需要一个字符串列表，因此您不需要构造 `AIMessage` 对象：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_core.language_models import FakeListChatModel

model = FakeListChatModel(responses=["Paris", "The Eiffel Tower"])

model.invoke("What is the capital of France?")
# AIMessage(content='Paris', ...)

model.invoke("What is a famous landmark there?")
# AIMessage(content='The Eiffel Tower', ...)
```

`FakeListChatModel` 循环显示其响应。当调用次数多于列表条目数时，它会从第一个响应重新开始。当您需要精确控制每个回合（例如工具调用）时，请使用`GenericFakeChatModel`。

## 测试工具调用循环代理通常调用工具，然后使用结果进行应答。要编写此循环的脚本，请为假模型提供两个响应：工具调用，然后是最终答案。

`GenericFakeChatModel` 未实现 `bind_tools`，[⟦T15⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 在传递工具时调用。将其子类化，以便 `bind_tools` 返回模型不变：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.messages import AIMessage, HumanMessage, ToolCall
from langchain.tools import tool
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel


class FakeToolCallingModel(GenericFakeChatModel):
    def bind_tools(self, tools, **kwargs):
        return self


@tool
def get_weather(city: str) -> str:
    """Get the weather for a city."""
    return f"72°F and sunny in {city}"


def test_agent_calls_tool_then_answers():
    model = FakeToolCallingModel(messages=iter([
        # Turn 1: the model calls the tool
        AIMessage(
            content="",
            tool_calls=[ToolCall(name="get_weather", args={"city": "Tokyo"}, id="call_1")],
        ),
        # Turn 2: the model answers using the tool result
        AIMessage(content="It is 72°F and sunny in Tokyo."),
    ]))
    agent = create_agent(model, tools=[get_weather])

    result = agent.invoke({"messages": [HumanMessage(content="Weather in Tokyo?")]})

    tool_call_messages = [
        m for m in result["messages"] if isinstance(m, AIMessage) and m.tool_calls
    ]
    assert len(tool_call_messages) == 1
    assert tool_call_messages[0].tool_calls[0]["name"] == "get_weather"
    assert "Tokyo" in result["messages"][-1].text
```

## 使用 pytest 装置共享假模型

要在测试中重复使用假模型，请从 `pytest` 夹具返回它。此示例使用上一节中的 `FakeToolCallingModel` 和 `get_weather`：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import pytest
from langchain.agents import create_agent
from langchain.messages import AIMessage, HumanMessage, ToolCall


@pytest.fixture
def weather_model():
    return FakeToolCallingModel(messages=iter([
        AIMessage(
            content="",
            tool_calls=[ToolCall(name="get_weather", args={"city": "Tokyo"}, id="call_1")],
        ),
        AIMessage(content="It is 72°F and sunny in Tokyo."),
    ]))


def test_tool_is_called(weather_model):
    agent = create_agent(weather_model, tools=[get_weather])
    result = agent.invoke({"messages": [HumanMessage(content="Weather in Tokyo?")]})
    tool_call_messages = [
        m for m in result["messages"] if isinstance(m, AIMessage) and m.tool_calls
    ]
    assert tool_call_messages[0].tool_calls[0]["name"] == "get_weather"


def test_final_response(weather_model):
    agent = create_agent(weather_model, tools=[get_weather])
    result = agent.invoke({"messages": [HumanMessage(content="Weather in Tokyo?")]})
    assert "Tokyo" in result["messages"][-1].text
```

> [!注意]
>
> `GenericFakeChatModel` 从迭代器读取响应，并且耗尽的迭代器无法重用。将夹具保持在默认的 `function` 范围，这会为每个测试构建一个新的模型。 `module` 或 `session` 作用域共享一个迭代器，因此一旦迭代器用完，后面的测试就会失败。

## InMemorySaver 检查指针

要在测试期间启用持久性，您可以使用 [⟦T24⟧](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.memory.InMemorySaver) 检查指针。这允许您模拟多轮来测试与状态相关的行为：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph.checkpoint.memory import InMemorySaver
from langchain.agents import create_agent
from langchain.messages import HumanMessage

agent = create_agent(
    model,
    tools=[],
    checkpointer=InMemorySaver()
)

# First invocation
agent.invoke(
    {"messages": [HumanMessage(content="I live in Sydney, Australia")]},
    config={"configurable": {"thread_id": "session-1"}}
)

# Second invocation: the first message is persisted (Sydney location), so the model returns GMT+10 time
agent.invoke(
    {"messages": [HumanMessage(content="What's my local time?")]},
    config={"configurable": {"thread_id": "session-1"}}
)
```

## 后续步骤

了解如何使用 [Integration testing](/oss/python/langchain/test/integration-testing) 中的真实模型提供程序 API 测试您的代理。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/test/unit-testing.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。