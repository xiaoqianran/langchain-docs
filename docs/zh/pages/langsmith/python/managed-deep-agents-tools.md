<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add custom tools to Managed Deep Agents | https://docs.langchain.com/langsmith/python/managed-deep-agents-tools -->

# 将自定义工具添加到托管Deep Agents

自定义工具是代理可以调用的应用程序代码，用于获取实时数据、查询数据库、执行代码和采取操作。与 [instructions](/langsmith/python/managed-deep-agents-instructions) 和 [skills](/langsmith/python/managed-deep-agents-skills) 不同，MDA 不会自动发现它们。

要从远程 MCP 服务器加载工具，请参阅[Connect to MCP servers](/langsmith/python/managed-deep-agents-mcp-connectors)。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

将编写的工具放在`tools/`下，将它们导入到代理条目中，并将它们传递给代理定义：

```text
my-agent/
  agent.py
  tools/
    customer.py
```




完整的项目布局请参见[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

要从远程 MCP 服务器加载工具而不将其导入代理条目，请改用 [MCP connector](/langsmith/python/managed-deep-agents-mcp-connectors)。

## 添加工具

使用编写的工具来处理业务逻辑、私有 API、数据库访问以及属于代理项目的其他代码。

<Steps>
  <Step title="Define a tool module" id="define-a-tool-module">

```python tools/customer.py
from langchain.tools import tool


@tool(parse_docstring=True)
def lookup_customer(customer_id: str) -> str:
    """Look up a customer record by ID.

    Args:
        customer_id: Customer ID from the CRM.
    """
    return f"Customer {customer_id} is on the enterprise plan."
```




使用清晰、独特的工具名称以避免冲突。有关LangChain工具定义的更多信息，请参阅[Tools](/oss/python/langchain/tools)。

  </Step>
  <Step title="Attach the tool to the agent" id="attach-the-tool">

将工具导入到项目根代理条目中并将其传递到`tools`列表中：

```python agent.py
from managed_deepagents import define_deep_agent

from tools.customer import lookup_customer

agent = define_deep_agent(
    name="support-agent",
    model="openai:gpt-5.5",
    tools=[lookup_customer],
)
```




您的导入工作方式应该与在普通本地 Python 项目中的工作方式相同。




  </Step>
  <Step title="Add human-in-the-loop (Optional)" id="human-in-the-loop">在敏感工具调用之前暂停代理，以便人们可以批准、编辑或拒绝它们。

在代理定义中设置`interrupt_on`，并可以选择设置`permissions`来控制工具和文件系统访问：




```python agent.py
from managed_deepagents import define_deep_agent

from tools.customer import lookup_customer

agent = define_deep_agent(
    name="support-agent",
    model="openai:gpt-5.5",
    tools=[lookup_customer],
    interrupt_on={"lookup_customer": True},
)
```




`interrupt_on` 字段应用与 LangChain 的 [human-in-the-loop middleware](/oss/python/langchain/guardrails#human-in-the-loop) 相同的中断行为。




有关决策类型（批准、编辑、拒绝）、条件中断和权限规则，请参阅 Deep Agents [Human-in-the-loop](/oss/python/deepagents/human-in-the-loop) 和 [Permissions](/oss/python/deepagents/permissions) 指南。

要恢复暂停的运行，请参阅[Respond to an interrupt](#respond-to-an-interrupt)。

  </Step>
</Steps>

## 使用秘密和上下文

工具可以从环境变量中读取部署机密。将`mda dev`的本地值放入`.env`； `mda deploy` 将非保留的 `.env` 值作为托管部署机密转发。

对于每次运行的值（例如请求元数据或功能标志），请使用工具的正常 LangChain 运行时上下文模式。参见[how to access context from within your tools](/oss/python/langchain/tools#access-context)。

## 部署

`mda dev`和`mda deploy`将项目文件复制到已编译的版本中，包括`tools/`下的模块。工具未同步到 Context Hub；他们附带代理代码。

## 何时使用工具|概念|亲切 |它如何到达代理|
| --- | --- | --- |
| **工具** |申请代码 |导入并传入代理定义 |
| **[MCP connectors](/langsmith/python/managed-deep-agents-mcp-connectors)** |托管配置|根据`connectors/`声明；没有导入到代理条目|
| **[Skills](/langsmith/python/managed-deep-agents-skills)** |托管上下文 |代理在相关时加载的程序 |
| **[Instructions](/langsmith/python/managed-deep-agents-instructions)** |托管上下文 |永远在线的系统提示 |

有关更多信息，请参阅[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

## 响应中断

当运行遇到中断时，它会暂停并等待人类响应，然后再继续。

- **在本地开发期间**，`mda dev` 在 LangSmith Studio 中运行代理，它会显示中断，以便您可以检查挂起的工具调用并恢复运行。
- **在已部署的代理上**，通过具有 `Command(resume=...)` 负载的 LangGraph 服务器 API 恢复暂停的运行。参见[Human-in-the-loop using server API](/langsmith/add-human-in-the-loop)。



<Note>
在公开测试期间，托管 Deep Agents 是 CLI 优先，并且尚未记录编程调用。要从您自己的应用程序以编程方式恢复运行，请联系您的 LangChain 团队。
</Note>

人机交互需要持久的线程状态来暂停和恢复。托管运行时拥有检查指针，因此不需要额外的设置。

## 使用需要身份验证的工具如果工具需要 API 密钥或 OAuth 令牌，请使用连接在运行时解析凭据。参见[Manage connections](/langsmith/python/managed-deep-agents-connections)。

## 访问运行时上下文

对于每次运行的值（例如请求元数据或功能标志），请使用工具的正常 LangChain 运行时上下文模式。参见[how to access context from within your tools](/oss/python/langchain/tools#access-context)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-tools.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>