<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Overview | https://docs.langchain.com/oss/python/langchain/middleware/overview -->

# 概述

控制和定制代理执行的每一步

中间件提供了一种更严格地控制代理内部发生的事情的方法。中间件可用于以下用途：

* 通过日志记录、分析和调试来跟踪代理行为。
* 转换提示、[tool selection](/oss/python/langchain/middleware/built-in#llm-tool-selector)和输出格式。
* 添加[retries](/oss/python/langchain/middleware/built-in#tool-retry)、[fallbacks](/oss/python/langchain/middleware/built-in#model-fallback)和提前终止逻辑。
* 应用[rate limits](/oss/python/langchain/middleware/built-in#model-call-limit)、护栏、[PII detection](/oss/python/langchain/middleware/built-in#pii-detection)。

通过将中间件传递给[⟦T2⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)来添加中间件：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware, HumanInTheLoopMiddleware

agent = create_agent(
    model="gpt-5.5",
    tools=[...],
    middleware=[
        SummarizationMiddleware(...),
        HumanInTheLoopMiddleware(...)
    ],
)
```

## 代理循环

核心代理循环涉及调用模型，让它选择要执行的工具，然后在不再调用工具时完成：

<img alt="Core agent loop diagram" />

中间件在每个步骤之前和之后公开挂钩：

<img alt="Middleware flow diagram" />

## 在 LangGraph 工作流程中使用中间件

中间件不是一个单独的运行时：挂钩在 [⟦T3⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 返回的已编译的 [LangGraph](/oss/python/langgraph/overview) 内运行。您可以将整个代理（中间件和所有）放入更大的[StateGraph](https://reference.langchain.com/python/langgraph/graph/state/StateGraph)作为节点或子图，并且每个中间件挂钩继续运行。当周围拓扑不仅仅是标准的“完成之前的循环”时，就可以采用这种模式：在路由到多个代理之一之前对输入进行分类，并行地展开工作，或者将代理调用与确定性步骤缝合在一起。

`HumanInTheLoopMiddleware` 与每个工具的 `.name` 匹配。

`@tool` 修饰的函数从函数中获取其名称，因此下面的键是 `"send_email"`。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import AgentState, create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware
from langgraph.graph import START, StateGraph

# Assumes read_email, send_email, classify_node, and route are defined elsewhere.
email_agent = create_agent(
    model="claude-sonnet-4-6",
    tools=[read_email, send_email],
    middleware=[HumanInTheLoopMiddleware(interrupt_on={"send_email": True})],
)

graph = (
    StateGraph(AgentState)
    .add_node("classify", classify_node)
    .add_node("email_agent", email_agent)
    .add_edge(START, "classify")
    .add_conditional_edges("classify", route)
    .compile()
)
```

HITL 中断、摘要、PII 编辑、重试和任何自定义挂钩都与代理节点一起传输。请参阅 [Use subgraphs](/oss/python/langgraph/use-subgraphs) 了解完整的组合模式，包括子图检查点范围（每个调用与每个线程）。

## 其他资源

<CardGroup>
  <Card title="Built-in middleware" icon="box" href="/oss/python/langchain/middleware/built-in">
    探索常见用例的内置中间件。
  </Card>

  <Card title="Custom middleware" icon="code" href="/oss/python/langchain/middleware/custom">
    使用钩子和装饰器构建您自己的中间件。
  </Card>

  <Card title="Middleware API reference" icon="book" href="https://reference.langchain.com/python/langchain/middleware/">
    中间件的完整 API 参考。
  </Card>

  <Card title="Middleware integrations" icon="plug" href="/oss/python/integrations/middleware/">
    适用于 Anthropic、AWS、OpenAI 等的特定于提供商的中间件。
  </Card>

  <Card title="Testing agents" icon="scale" href="/oss/python/langchain/test/">
    使用 LangSmith 测试您的代理。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/middleware/overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>