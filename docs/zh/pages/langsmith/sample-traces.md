<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set a sampling rate for traces | https://docs.langchain.com/langsmith/sample-traces -->

# 设置轨迹的采样率

当使用大容量应用程序时，您可能不希望将每个跟踪记录到 LangSmith。采样率允许您控制记录跟踪的百分比，帮助您平衡可观察性需求与成本考虑。

本指南向您展示如何使用 `LANGSMITH_TRACING_SAMPLING_RATE` 环境变量设置全局采样率，以及如何对每个 `Client` 实例应用不同的采样率，以更细粒度地控制跟踪哪些操作。

<Tip>
  要根据运行时条件（例如数据敏感性、租户或功能标志）启用或禁用对特定请求的跟踪，请参阅[Conditional tracing](/langsmith/conditional-tracing)。
</Tip>

## 设置全局采样率

<Note>
  本节与使用 [LangSmith SDK](/langsmith/reference) 或 [LangChain](/oss/python/langchain/overview) 的用户相关，而不是直接使用 LangSmith API 进行日志记录的用户。
</Note>

默认情况下，所有跟踪都会记录到 LangSmith。要对记录到 LangSmith 的跟踪数量进行下采样，请将 `LANGSMITH_TRACING_SAMPLING_RATE` 环境变量设置为 `0`（无跟踪）和 `1`（所有跟踪）之间的任意浮点数。例如，设置以下环境变量将记录 75% 的跟踪。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING_SAMPLING_RATE=0.75
```

这适用于 `traceable` 装饰器和 `RunTree` 对象。

##为每个客户端设置不同的采样率您还可以在特定的`Client`实例上设置采样率并使用[⟦T10⟧](/langsmith/annotate-code#use-the-trace-context-manager-python-only)上下文管理器：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client, tracing_context

# Create clients with different sampling rates
client_1 = Client(tracing_sampling_rate=0.5)  # 50% sampling
client_2 = Client(tracing_sampling_rate=0.25)  # 25% sampling
client_no_trace = Client(tracing_sampling_rate=0.0)  # No tracing

# Use different sampling rates for different operations
with tracing_context(client=client_1):
    # Your code here - will be traced with 50% sampling rate
    agent_1.invoke(...)

with tracing_context(client=client_2):
    # Your code here - will be traced with 25% sampling rate
    agent_1.invoke(...)

with tracing_context(client=client_no_trace):
    # Your code here - will not be traced
    agent_1.invoke(...)
```

这允许您在操作级别控制采样率。

## 采样或条件追踪

采样提供对跟踪量的**概率**控制，而[conditional tracing](/langsmith/conditional-tracing)提供基于业务逻辑的**确定性**控制。

当您想要减少总体跟踪量同时保持应用程序行为的统计表示时，请使用**采样**。

当您需要保证特定请求的跟踪行为时，请使用[conditional tracing](/langsmith/conditional-tracing)，例如：

* 禁用对具有零保留策略的客户端的跟踪。
* 根据租户将跟踪路由到不同的项目。
* 处理永远不应被追踪的敏感数据。

您可以结合使用这两种方法来对可观察性策略进行细粒度控制。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/sample-traces.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>