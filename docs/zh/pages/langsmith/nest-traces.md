<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Troubleshoot trace nesting | https://docs.langchain.com/langsmith/nest-traces -->

# 排除跟踪嵌套问题

使用 LangSmith SDK、LangGraph 和 LangChain 进行跟踪时，跟踪应自动传播正确的上下文，以便在父跟踪中执行的代码将呈现在 UI 中的预期位置。

如果您看到子运行转到单独的跟踪（并出现在顶层），则可能是由以下已知的“边缘情况”之一引起的。

##Python

下面概述了使用 python 构建时出现“分割”跟踪的常见原因。

### 使用 asyncio 进行上下文传播

在 Python 版本 \< 3.11 中使用异步调用（尤其是流式调用）时，您可能会遇到跟踪嵌套问题。这是因为Python的`asyncio`在3.11版本中只有[added full support for passing context](https://docs.python.org/3/library/asyncio-task.html#asyncio.create_task)。

#### 为什么

LangChain 和 LangSmith SDK 使用 [contextvars](https://docs.python.org/3/library/contextvars.html) 隐式传播跟踪信息。在 Python 3.11 及更高版本中，这可以无缝工作。但是，在早期版本（3.8、3.9、3.10）中，`asyncio`任务缺乏适当的`contextvar`支持，这可能会导致跟踪断开连接。

#### 解决

1. **升级Python版本（推荐）** 如果可能，请升级到Python 3.11或更高版本以实现自动上下文传播。2. **手动上下文传播** 如果无法升级，您将需要手动传播跟踪上下文。该方法根据您的设置而有所不同：

   a) **使用 LangGraph 或 LangChain** 将父级 `config` 传递给子级调用：

   ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   import asyncio
   from langchain_core.runnables import RunnableConfig, RunnableLambda

   @RunnableLambda
   async def my_child_runnable(
       inputs: str,
       # The config arg (present in parent_runnable below) is optional
   ):
       yield "A"
       yield "response"

   @RunnableLambda
   async def parent_runnable(inputs: str, config: RunnableConfig):
       async for chunk in my_child_runnable.astream(inputs, config):
           yield chunk

   async def main():
       return [val async for val in parent_runnable.astream("call")]

   asyncio.run(main())
   ```

   b) **直接使用LangSmith**直接传递运行树：

   ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   import asyncio
   import langsmith as ls

   @ls.traceable
   async def my_child_function(inputs: str):
       yield "A"
       yield "response"

   @ls.traceable
   async def parent_function(
       inputs: str,
       # The run tree can be auto-populated by the decorator
       run_tree: ls.RunTree,
   ):
       async for chunk in my_child_function(inputs, langsmith_extra={"parent": run_tree}):
           yield chunk

   async def main():
       return [val async for val in parent_function("call")]

   asyncio.run(main())
   ```

   c) **将修饰代码与LangGraph/LangChain**相结合使用手动切换技术的组合：

   ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   import asyncio
   import langsmith as ls
   from langchain_core.runnables import RunnableConfig, RunnableLambda

   @RunnableLambda
   async def my_child_runnable(inputs: str):
       yield "A"
       yield "response"

   @ls.traceable
   async def my_child_function(inputs: str, run_tree: ls.RunTree):
       with ls.tracing_context(parent=run_tree):
           async for chunk in my_child_runnable.astream(inputs):
               yield chunk

   @RunnableLambda
   async def parent_runnable(inputs: str, config: RunnableConfig):
       # @traceable decorated functions can directly accept a RunnableConfig when passed in via "config"
       async for chunk in my_child_function(inputs, langsmith_extra={"config": config}):
           yield chunk

   @ls.traceable
   async def parent_function(inputs: str, run_tree: ls.RunTree):
       # You can set the tracing context manually
       with ls.tracing_context(parent=run_tree):
           async for chunk in parent_runnable.astream(inputs):
               yield chunk

   async def main():
       return [val async for val in parent_function("call")]

   asyncio.run(main())
   ```

### 使用线程进行上下文传播

开始跟踪并希望在单个跟踪中对所有子任务应用一些并行性是很常见的。 Python 的 stdlib `ThreadPoolExecutor` 默认情况下会中断跟踪。

#### 为什么

Python 的上下文变量在新线程中以空开始。以下是处理维护跟踪连续性的两种方法：

#### 解决

1. **使用LangSmith的ContextThreadPoolExecutor**

   LangSmith 提供了 `ContextThreadPoolExecutor` 自动处理上下文传播：

   ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   from langsmith.utils import ContextThreadPoolExecutor
   from langsmith import traceable

   @traceable
   def outer_func():
       with ContextThreadPoolExecutor() as executor:
           inputs = [1, 2]
           r = list(executor.map(inner_func, inputs))

   @traceable
   def inner_func(x):
       print(x)

   outer_func()
   ```

2. **手动提供父运行树**

   或者，您可以手动将父运行树传递给内部函数：

   ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   from langsmith import traceable, get_current_run_tree
   from concurrent.futures import ThreadPoolExecutor

   @traceable
   def outer_func():
       rt = get_current_run_tree()
       with ThreadPoolExecutor() as executor:
           r = list(
               executor.map(
                   lambda x: inner_func(x, langsmith_extra={"parent": rt}), [1, 2]
               )
           )

   @traceable
   def inner_func(x):
       print(x)

   outer_func()
   ```

在这种方法中，我们使用`get_current_run_tree()`来获取当前的运行树，并使用`langsmith_extra`参数将其传递给内部函数。这两种方法都确保内部函数调用正确聚合在初始跟踪堆栈下，即使在单独的线程中执行时也是如此。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/nest-traces.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。