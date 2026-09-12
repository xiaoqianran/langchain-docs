<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add custom middleware to Managed Deep Agents | https://docs.langchain.com/langsmith/python/managed-deep-agents-middleware -->

# 将自定义中间件添加到托管Deep Agents

中间件添加了围绕模型调用、工具调用和代理生命周期的行为。与[custom tools](/langsmith/python/managed-deep-agents-tools)一样，MDA 不会自动发现中间件。导入它并将其传递给代理定义。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

将自定义中间件放在`middleware/`下，将其导入到代理条目中，并将其传递给代理定义：

```text
my-agent/
  agent.py
  middleware/
    audit.py
```




完整的项目布局请参见[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

托管运行时仍然拥有 `backend`、`store`、`checkpointer`、`memory`、`skills` 和系统提示符。中间件应该关注围绕模型调用、工具调用和生命周期挂钩的代理行为。

## 添加中间件

使用中间件来编辑 PII、强制调用限制、重试失败、在模型之间回退、动态选择模型或记录和检查工具调用。

<Steps>
  <Step title="Use prebuilt middleware" id="use-prebuilt-middleware">

您可以直接在代理定义中使用 LangChain [prebuilt middleware](/oss/python/langchain/middleware/built-in)：

```python agent.py
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




  </Step>
  <Step title="Define custom middleware (Optional)" id="define-custom-middleware">

对于更高级的选项，请在本地模块中定义 [custom middleware](/oss/python/langchain/middleware/custom)。<Note>
中间件是一个共享的LangChain原语。托管 Deep Agents 始终使用 `ainvoke` 和 `astream` 调用代理，因此自定义中间件必须使用异步挂钩。当您使用 `invoke` 或 `stream` 调用 [Deep Agents](/oss/python/deepagents/overview) 时，同步挂钩仍然可用。
</Note>

```python middleware/audit.py
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




将中间件导入到项目根代理条目中，并将其传递到`middleware`列表中：

```python agent.py
from managed_deepagents import define_deep_agent

from middleware.audit import log_tool_calls

agent = define_deep_agent(
    name="support-agent",
    model="openai:gpt-5.5",
    middleware=[log_tool_calls],
)
```




您的中间件导入的工作方式应该与在普通本地 Python 项目中的工作方式相同。




  </Step>
</Steps>

## 使用运行时上下文

中间件可以通过正常的 LangChain 运行时 API 读取每次运行的上下文。使用用户 ID、组织 ID、功能标志、请求元数据或默认情况下不应成为模型提示一部分的凭据的上下文。

例如，请参阅[Custom middleware](/oss/python/langchain/middleware/custom)。

## 部署

`mda dev`和`mda deploy`将项目文件复制到已编译的版本中，包括`middleware/`下的模块。中间件未同步到 Context Hub；它附带代理代码。

## 何时使用中间件|概念|亲切 |它如何到达代理|
| --- | --- | --- |
| **中间件** |申请代码 |导入并传入代理定义 |
| **[Custom tools](/langsmith/python/managed-deep-agents-tools)** |申请代码 |导入并传入代理定义 |
| **[Instructions](/langsmith/python/managed-deep-agents-instructions)** |托管上下文 |永远在线的系统提示 |

欲了解更多信息，请参阅[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-middleware.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>