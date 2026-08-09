<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add custom middleware to Managed Deep Agents | https://docs.langchain.com/langsmith/python/managed-deep-agents-middleware -->

# 将自定义中间件添加到托管深度代理

将内置或自定义中间件添加到托管深度代理项目。

托管深度代理支持普通深度代理 `middleware` 配置界面。

在`define_deep_agent`中添加LangChain中间件，以监控工具调用、添加护栏、编辑数据、重试瞬时故障或自定义模型调用。

<Note>
  托管深度代理在 **公共 [beta](/langsmith/release-stages)** 中提供，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目结构

将代理入口点保留在项目根目录并将自定义中间件保留在`middleware/`下：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
my-agent/
  agent.py
  middleware/
    audit.py
```

托管运行时仍然拥有 `backend`、`store`、`checkpointer`、`memory`、`skills` 和系统提示符。中间件应该关注围绕模型调用、工具调用和生命周期挂钩的代理行为。

有关更深入的钩子、状态和上下文详细信息，请参阅[custom middleware](/oss/python/langchain/middleware/custom)。

## 使用预构建的中间件

您可以直接在代理定义中使用 LangChain 预构建的中间件。

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

中间件是横切行为的正确场所，例如 PII 处理、速率限制、重试策略、模型回退、动态模型选择和工具调用监控。

## 添加自定义中间件模块

对于更高级的选项，您还可以定义[custom middleware](/oss/python/langchain/middleware/custom)。

```python middleware/audit.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from collections.abc import Callable

from langchain.agents.middleware import wrap_tool_call
from langchain.messages import ToolMessage
from langchain.tools.tool_node import ToolCallRequest
from langgraph.types import Command


@wrap_tool_call
def log_tool_calls(
    request: ToolCallRequest,
    handler: Callable[[ToolCallRequest], ToolMessage | Command],
) -> ToolMessage | Command:
    print(f"Calling tool: {request.tool_call['name']}")
    result = handler(request)
    print(f"Finished tool: {request.tool_call['name']}")
    return result
```将中间件导入项目根代理条目并将其传递到`middleware`列表中。

```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_deep_agent

from middleware.audit import log_tool_calls

agent = define_deep_agent(
    name="support-agent",
    model="openai:gpt-5.5",
    middleware=[log_tool_calls],
)
```

`mda dev` 和 `mda deploy` 将项目文件复制到已编译的版本中。

您的中间件导入的工作方式应该与在普通本地 Python 项目中的工作方式相同。

## 使用运行时上下文

中间件可以通过正常的 LangChain 运行时 API 读取每次运行的上下文。使用用户 ID、组织 ID、功能标志、请求元数据或默认情况下不应成为模型提示一部分的凭据的上下文。

例如，请参阅[Custom middleware](/oss/python/langchain/middleware/custom)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-middleware.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>