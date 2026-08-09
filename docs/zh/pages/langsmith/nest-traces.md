<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Troubleshoot trace nesting | https://docs.langchain.com/langsmith/nest-traces -->

# 排除跟踪嵌套问题

使用 LangSmith SDK、LangGraph 和 LangChain 进行跟踪时，跟踪应自动传播正确的上下文，以便在父跟踪中执行的代码将呈现在 UI 中的预期位置。

如果您看到子运行转到单独的跟踪（并出现在顶层），则可能是由以下已知的“边缘情况”之一引起的。

##Python

下面概述了使用 python 构建时出现“分割”跟踪的常见原因。

### 使用 asyncio 进行上下文传播

在 Python 版本中使用异步调用（尤其是流式传输）时 \< 3.11, you may encounter issues with trace nesting. This is because Python's ⟦T5⟧ only ⟦T13⟧ in version 3.11.

#### Why

LangChain and LangSmith SDK use ⟦T14⟧ to propagate tracing information implicitly. In Python 3.11 and above, this works seamlessly. However, in earlier versions (3.8, 3.9, 3.10), ⟦T6⟧ tasks lack proper ⟦T7⟧ support, which can lead to disconnected traces.

#### To resolve

1. **Upgrade Python Version (Recommended)** If possible, upgrade to Python 3.11 or later for automatic context propagation.

2. **Manual Context Propagation** If upgrading isn't an option, you'll need to manually propagate the tracing context. The method varies depending on your setup:

   a) **Using LangGraph or LangChain** Pass the parent ⟦T8⟧ to the child call:

   ⟦T0⟧

   b) **Using LangSmith Directly** Pass the run tree directly:

   ⟦T1⟧

   c) **Combining Decorated Code with LangGraph/LangChain** Use a combination of techniques for manual handoff:

   ⟦T2⟧

### Context propagation using threading

It's common to start tracing and want to apply some parallelism on child tasks all within a single trace. Python's stdlib ⟦T9⟧ by default breaks tracing.

#### Why

Python's contextvars start empty within new threads. Here are two approaches to handle maintain trace contiguity:

#### To resolve

1. **Using LangSmith's ContextThreadPoolExecutor**

   LangSmith provides a ⟦T10⟧ that automatically handles context propagation:

   ⟦T3⟧

2. **Manually providing the parent run tree**

   Alternatively, you can manually pass the parent run tree to the inner function:

   ⟦T4⟧

In this approach, we use ⟦T11⟧ to obtain the current run tree and pass it to the inner function using the ⟦T12⟧ parameter.

Both methods ensure that the inner function calls are correctly aggregated under the initial trace stack, even when executed in separate threads.

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/nest-traces.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>