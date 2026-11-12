<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add custom tools to Managed Deep Agents | https://docs.langchain.com/langsmith/python/managed-deep-agents-tools -->

# 将自定义工具添加到托管Deep Agents

为托管深度代理项目定义创作工具。

自定义工具是代理可以调用​​的应用程序代码，用于获取实时数据、查询数据库、执行代码和采取操作。与 [instructions](/langsmith/python/managed-deep-agents-instructions) 和 [skills](/langsmith/python/managed-deep-agents-skills) 不同，MDA 不会自动发现它们。

要从远程 MCP 服务器加载工具，请参阅[Connect to MCP servers](/langsmith/python/managed-deep-agents-mcp-connectors)。

> [!注意]
>
> 托管 Deep Agents 在 [LangSmith Cloud](/langsmith/cloud) 和 [Bring Your Own Cloud (BYOC)](/langsmith/byoc) **公开 [beta](/langsmith/release-stages)**。使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。

将编写的工具放在`tools/`下，将它们导入到代理条目中，并将它们传递给代理定义：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
my-agent/
  agent.py
  tools/
    customer.py
```

完整的项目布局，请参阅[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

要从远程 MCP 服务器加载工具而不将其导入代理条目，请改用 [MCP connector](/langsmith/python/managed-deep-agents-mcp-connectors)。

MCP 连接器也在 `tools/` 下声明，因此 `tools/mcp.py` 文件名是为该声明保留的。

## 添加工具

使用编写的工具来处理业务逻辑、私有 API、数据库访问以及属于代理项目的其他代码。

**1.定义工具模块**

```python tools/customer.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

**2.将工具附加到代理**将工具导入到项目根代理条目中并将其传递到`tools`列表中：

```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_deep_agent

from tools.customer import lookup_customer

agent = define_deep_agent(
    name="support-agent",
    model="openai:gpt-6.1-sol",
    tools=[lookup_customer],
)
```

您的导入工作方式应该与在普通本地 Python 项目中的工作方式相同。

**3.添加人机交互（可选）**

在敏感工具调用之前暂停代理，以便人们可以批准、编辑或拒绝它们。

在代理定义中设置`interrupt_on`，并可以选择设置`permissions`来控制工具和文件系统访问：

```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_deep_agent

from tools.customer import lookup_customer

agent = define_deep_agent(
    name="support-agent",
    model="openai:gpt-6.1-sol",
    tools=[lookup_customer],
    interrupt_on={"lookup_customer": True},
)
```

`interrupt_on` 字段应用与 LangChain 的 [human-in-the-loop middleware](/oss/python/langchain/guardrails#human-in-the-loop) 相同的中断行为。

有关决策类型（批准、编辑、拒绝）、条件中断和权限规则，请参阅 Deep Agents [Human-in-the-loop](/oss/python/deepagents/human-in-the-loop) 和 [Permissions](/oss/python/deepagents/permissions) 指南。

要恢复暂停的运行，请参阅[Respond to an interrupt](#respond-to-an-interrupt)。

要在 Slack 中暂停您自己的工具帖子的表单，请参阅 [Agent-owned interrupts](/langsmith/python/managed-deep-agents-agent-owned-interrupts)。

有关暂停营销活动更改以获得 Slack 批准的完整项目，请参阅 [paid media agent template](/langsmith/python/managed-deep-agents-paid-media-agent)。

## 使用秘密和上下文

工具从环境变量中读取固定配置，例如区域或端点 URL。将 `mda dev` 的本地值放入 `.env` 中。 `mda deploy` 将非保留的 `.env` 值作为托管部署机密转发。相反，凭证属于 [connection](/langsmith/python/managed-deep-agents-connections)。 A connection keeps the value in your LangSmith workspace rather than the project.它还可以为每个调用者解析不同的凭据。参见[Use tools that require authentication](#use-tools-that-require-authentication)。

For per-run values such as request metadata or feature flags, see [Access runtime context](#access-runtime-context).

## 部署

`mda dev`和`mda deploy`将项目文件复制到已编译的版本中，包括`tools/`下的模块。工具未同步到 Context Hub；他们附带代理代码。

## 何时使用工具

|概念 |亲切 |它如何到达代理|
| - | - | - |
| **工具** |申请代码|导入并传入代理定义 |
| **[MCP connectors](/langsmith/python/managed-deep-agents-mcp-connectors)** |托管配置|在MCP模块中`tools/`下声明；没有导入到代理条目|
| **[Skills](/langsmith/python/managed-deep-agents-skills)** |托管上下文 |代理在相关时加载的程序 |
| **[Instructions](/langsmith/python/managed-deep-agents-instructions)** |托管上下文 |永远在线的系统提示 |

欲了解更多信息，请参阅[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

## 响应中断

当运行遇到中断时，它会暂停并等待人类响应，然后再继续。* **在本地开发期间**，`mda dev` 在 LangSmith Studio 中运行代理，它会显示中断，以便您可以检查挂起的工具调用并恢复运行。
* **在已部署的代理上**，通过具有 `Command(resume=...)` 负载的代理服务器 API 恢复暂停的运行。参见[Human-in-the-loop using server API](/langsmith/add-human-in-the-loop)。

人机交互需要持久的线程状态来暂停和恢复。托管运行时拥有检查指针，因此不需要额外的设置。

## 使用需要身份验证的工具

如果工具需要 API 密钥或 OAuth 令牌，请在运行时使用 [connection](/langsmith/python/managed-deep-agents-connections) 进行解析。 `connections.get(...)` 接受连接 slug 和凭证所有者，并将凭证作为字符串返回。

第二个参数选择所有者。传递 `{"type": "agent"}` 以获得整个部署共享的一个凭证，例如团队搜索密钥。通过`{"type": "user"}`作为呼叫者自己的凭证，因此代理充当他们的角色。有关更多信息，请参阅[Choose a credential owner](/langsmith/python/managed-deep-agents-connections#choose-a-credential-owner)。

该工具解析调用者自己的 GitHub 凭证：

```python tools/get_github_user.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import httpx
from langchain.tools import tool
from managed_deepagents import connections


@tool
async def get_github_user() -> str:
    """Get the authenticated caller's GitHub login."""
    # Replace `frontend-github` with the name of your connection.
    access_token = await connections.get("frontend-github", {"type": "user"})
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        response.raise_for_status()
        return response.json()["login"]
```

用户拥有的连接需要每个调用者的授权。未授权该服务的人的第一次运行会在 [⟦T25⟧ interrupt](/langsmith/python/managed-deep-agents-connections#handle-the-authorization-interrupt) 上暂停。 Slack 和 LangSmith Studio 为调用者完成该中断。Create the connection itself with `mda connections create`.创建模式、本地开发、授权中断请参见[Manage connections](/langsmith/python/managed-deep-agents-connections)。

## 访问运行时上下文

对于每次运行的值（例如请求元数据或功能标志），请使用工具的正常 LangChain 运行时上下文模式。 See [how to access context from within your tools](/oss/python/langchain/tools#access-context).

Managed Deep Agents 添加的调用者、通道和沙箱字段，请参阅[Runtime](/langsmith/python/managed-deep-agents-runtime)。

要从工具读取或写入线程沙箱中的文件，请使用 `runtime.backend`。参见[Read and write sandbox files from code](/langsmith/python/managed-deep-agents-sandboxes#read-and-write-sandbox-files-from-code)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-tools.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。