<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add custom middleware to Managed Deep Agents | https://docs.langchain.com/langsmith/python/managed-deep-agents-middleware -->

# 将自定义中间件添加到托管Deep Agents

将内置或自定义中间件添加到托管深度代理。

中间件添加了围绕模型调用、工具调用和代理生命周期的行为。与[custom tools](/langsmith/python/managed-deep-agents-tools)一样，MDA 不会自动发现中间件。导入它并将其传递给代理定义。

> [!注意]
>
> 托管 Deep Agents 于 [LangSmith Cloud](/langsmith/cloud) **公开 [beta](/langsmith/release-stages)**。

将自定义中间件放在`middleware/`下，将其导入到代理条目中，并将其传递给代理定义：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
my-agent/
  agent.py
  middleware/
    audit.py
```

完整的项目布局请参见[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

托管运行时仍然拥有 `backend`、`store`、`checkpointer`、`memory`、`skills` 和系统提示符。中间件应该关注围绕模型调用、工具调用和生命周期挂钩的代理行为。

## 添加中间件

使用中间件来编辑 PII、强制调用限制、重试失败、在模型之间回退、动态选择模型或记录和检查工具调用。

**1.使用预构建的中间件**

您可以直接在代理定义中使用 LangChain [prebuilt middleware](/oss/python/langchain/middleware/built-in)：

```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents.middleware import ModelCallLimitMiddleware, PIIMiddleware
from managed_deepagents import define_deep_agent

agent = define_deep_agent(
    name="support-agent",
    model="openai:gpt-5.5",
    middleware=[
        PIIMiddleware("email", strategy="redact", apply_to_input=True),
        ModelCallLimitMiddleware(run_limit=50),
    ],
)
```

**2.定义自定义中间件（可选）**

对于更高级的选项，请在本地模块中定义 [custom middleware](/oss/python/langchain/middleware/custom)。> [!注意]
>
> 中间件是一个共享的LangChain原语。 Managed Deep Agents always invoke the agent with `ainvoke` and `astream`, so custom middleware must use async hooks. Synchronous hooks remain available when you call [Deep Agents](/oss/python/deepagents/overview) with `invoke` or `stream`.

```python middleware/audit.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from collections.abc import Awaitable, Callable

from langchain.agents.middleware import wrap_tool_call
from langchain.messages import ToolMessage
from langchain.tools.tool_node import ToolCallRequest
from langgraph.types import Command


@wrap_tool_call
async def log_tool_calls(
    request: ToolCallRequest,
    handler: Callable[[ToolCallRequest], Awaitable[ToolMessage | Command]],
) -> ToolMessage | Command:
    print(f"Calling tool: {request.tool_call['name']}")
    result = await handler(request)
    print(f"Finished tool: {request.tool_call['name']}")
    return result
```

Import the middleware into the project-root agent entry and pass it in the `middleware` list:

```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_deep_agent

from middleware.audit import log_tool_calls

agent = define_deep_agent(
    name="support-agent",
    model="openai:gpt-5.5",
    middleware=[log_tool_calls],
)
```

Your middleware imports should work the same way they do in a normal local Python project.

## 使用运行时上下文

Middleware can read per-run context through the normal LangChain runtime APIs.使用用户 ID、组织 ID、功能标志、请求元数据或默认情况下不应成为模型提示一部分的凭据的上下文。

例如，请参阅[Custom middleware](/oss/python/langchain/middleware/custom)。

For the caller, channel, and sandbox fields that Managed Deep Agents adds, see [Runtime](/langsmith/python/managed-deep-agents-runtime).

To read or write files in the thread's sandbox from a middleware hook, use `runtime.backend`.参见[Read and write sandbox files from code](/langsmith/python/managed-deep-agents-sandboxes#read-and-write-sandbox-files-from-code)。

## 部署

`mda dev` and `mda deploy` copy project files into the compiled build, including modules under `middleware/`.中间件未同步到 Context Hub；它附带代理代码。

## 何时使用中间件|概念 |亲切 |它如何到达代理|
| - | - | - |
| **中间件** |申请代码 |导入并传入代理定义 |
| **[Custom tools](/langsmith/python/managed-deep-agents-tools)** |申请代码 |导入并传入代理定义 |
| **[Instructions](/langsmith/python/managed-deep-agents-instructions)** |托管上下文 |永远在线的系统提示 |

欲了解更多信息，请参阅[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-middleware.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。