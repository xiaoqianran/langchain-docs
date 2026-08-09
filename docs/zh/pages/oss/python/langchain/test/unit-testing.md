<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Unit testing | https://docs.langchain.com/oss/python/langchain/test/unit-testing -->

# 单元测试

使用假聊天模型和内存持久性测试代理逻辑，无需 API 调用。

单元测试单独测试代理的小型确定性部分。通过用内存中的伪造（又名固定装置）替换真正的 LLM，您可以编写精确的响应（文本、工具调用和错误），因此测试快速、免费且可重复，无需 API 密钥。

## 模拟聊天模型

LangChain提供了[⟦T3⟧](https://reference.langchain.com/python/langchain-core/language_models/fake_chat_models/GenericFakeChatModel)来模拟文本回复。它接受响应的迭代器（[⟦T4⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage)对象或字符串）并每次调用返回一个。它支持常规和流式使用。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel

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

## InMemorySaver 检查指针

要在测试期间启用持久性，您可以使用 [⟦T5⟧](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.memory.InMemorySaver) 检查指针。这允许您模拟多轮来测试与状态相关的行为：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph.checkpoint.memory import InMemorySaver

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

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/test/unit-testing.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>