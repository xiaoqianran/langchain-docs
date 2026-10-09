<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Define a Managed Deep Agent | https://docs.langchain.com/langsmith/python/managed-deep-agents-agent-definition -->

# 定义一个托管深度代理

配置托管深度代理的模型和核心功能。

代理定义选择托管深度代理的模型和核心功能。

<Note>
  托管 Deep Agents 于 [LangSmith Cloud](/langsmith/cloud) **公开 [beta](/langsmith/release-stages)**。
</Note>

代理条目位于项目根目录：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
my-agent/
  agent.py
```

完整的项目布局请参见[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

要定义代理，请使用`define_deep_agent`：

<CodeGroup>
  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from managed_deepagents import define_deep_agent

  agent = define_deep_agent(
      name="research-assistant",
      model="openai:gpt-5.5",
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from managed_deepagents import define_deep_agent

  agent = define_deep_agent(
      name="research-assistant",
      model="anthropic:claude-sonnet-4-6",
  )
  ```

  ```python Google Gemini theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from managed_deepagents import define_deep_agent

  agent = define_deep_agent(
      name="research-assistant",
      model="google_genai:gemini-3.6-flash",
  )
  ```
</CodeGroup>

通过项目文件而不是代理定义来配置系统提示、技能、内存、沙箱、身份、通道和计划。参见[Project structure](/langsmith/python/managed-deep-agents-project-structure)。要为每次运行选择系统提示符、技能、MCP 服务器或沙箱，请参阅[Select configuration per run](#select-configuration-per-run)。

`define_deep_agent` 不编译代理。它返回一个定义，托管运行时在部署时使用 [create\_deep\_agent](https://reference.langchain.com/python/deepagents/graph/create_deep_agent) 对其进行编译。下面的参数是[create\_deep\_agent](https://reference.langchain.com/python/deepagents/graph/create_deep_agent)表面，不包含运行时拥有的参数。参见[Relationship to Deep Agents](/langsmith/python/managed-deep-agents-overview#relationship-to-deep-agents)。

＃＃ 参数|参数|它有什么作用 |
| - | - |
| `name=` |必需的。传递以字母开头且仅包含字母、数字、下划线或连字符的静态字符串，例如 `"research-assistant"`.<br /><br /> 托管 Deep Agents 使用该名称作为代理的图形 ID 和默认的 LangSmith 部署名称，客户端在调用时将其作为 `assistant_id` 传递部署。您可以使用 `mda deploy --name` 覆盖部署名称，而无需更改代理定义。 |
| `model=` |设置代理使用的聊天模型。最简单的选项是 `provider:model` 字符串。将提供商的 API 密钥添加到 `.env`，以便模型在本地和部署中运行。<br /><br /> 当您需要在代码中配置模型参数时，请传递 LangChain 聊天模型实例。有关型号选项和支持的提供程序，请参阅[Models](/oss/python/deepagents/models)。<br /><br /> 要连接到 LLM Gateway，请参阅[Use LLM Gateway](#use-llm-gateway)。 |
| `tools=` |添加代理可以调用​​的工具。传递`tools`列表中的工具，以便代理可以调用​​应用程序逻辑或外部服务。<br /><br />在本地模块中定义工具，将它们导入到代理条目中，并将它们添加到定义中。参见[Custom tools](/langsmith/python/managed-deep-agents-tools)。要从远程 MCP 服务器添加工具而不将其导入代理条目，请使用 [MCP connectors](/langsmith/python/managed-deep-agents-mcp-connectors)。 || `middleware=` |添加有关模型调用、工具调用和代理生命周期的行为。传递`middleware`列表中的中间件。中间件按列表顺序运行。参见[Custom middleware](/langsmith/python/managed-deep-agents-middleware)。 |
| `subagents=` |为委派的任务定义专门的代理。当代理应委派专门或上下文繁重的工作时，传递子代理定义。每个子代理可以有自己的提示、模型和工具。参见[Subagents](/oss/python/deepagents/subagents)。 |
| `permissions=` |控制文件系统工具的路径级访问。传递文件系统权限规则来控制代理的内置文件系统工具可以读取或写入哪些路径。当项目声明[sandbox](/langsmith/python/managed-deep-agents-sandboxes)时清除，因为权限规则禁用了沙箱`execute`工具。参见[Permissions](/oss/python/deepagents/permissions)。 |
| `interrupt_on=` |在选定的工具需要人工批准之前暂停。将 `interrupt_on` 设置为在选定工具调用之前暂停，以便人们可以在调用运行之前批准、编辑或拒绝调用。参见[Human-in-the-loop](/langsmith/python/managed-deep-agents-tools#human-in-the-loop)。 |
| `response_format=` |设置代理必须返回与架构匹配的数据而不是不受约束的文本响应的时间。参见[Structured output](/oss/python/langchain/structured-output)。 |

## 选择每次运行的配置要为每次运行选择代理的配置，请将函数导出为 `agent` 而不是定义。然后，一种部署可以适应不同的用户、任务或存储库。该函数是一个图工厂，与 LangGraph 用于 [rebuild a graph at runtime](/langsmith/graph-rebuild) 的模式相同：它接收运行时并返回定义。

此示例选择运行所处理的存储库的说明和技能。它假设该项目有`skills/python-service/`和`skills/typescript-web/`，每个都有一个[⟦T31⟧](/langsmith/python/managed-deep-agents-skills)。

```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import TypedDict

from managed_deepagents import ManagedServerRuntime, define_deep_agent


class AppContext(TypedDict, total=False):
    repository: str


def agent(runtime: ManagedServerRuntime[AppContext]):
    execution = runtime.execution_runtime
    context = execution.context if execution is not None else None
    python_service = context is not None and context.get("repository") == "payments-service"
    return define_deep_agent(
        name="open-swe",
        model="openai:gpt-5.5",
        instructions=(
            "Follow the payments service's API and reliability conventions."
            if python_service
            else "Follow the storefront's frontend and accessibility conventions."
        ),
        skills=["./skills/python-service" if python_service else "./skills/typescript-web"],
        context_schema=AppContext,
    )
```

工厂可以是同步的或异步的。它接收一个`ManagedServerRuntime`，它扩展了原生的LangGraph`ServerRuntime`。从`execution_runtime.context`读取运行上下文。通道运行时为`None`，Agent Server 加载代理进行检查时`execution_runtime` 为`None`。

调用者通过运行的`context`选择配置：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await client.runs.create(
    thread_id,
    "open-swe",
    input={"messages": [{"role": "user", "content": "Run the service test suite."}]},
    context={"repository": "payments-service"},
)
```

运行上下文是应用程序数据，而不是经过验证的身份。根据运行时经过验证的调用者检查[tools](/langsmith/python/managed-deep-agents-tools)中的授权。

### 选择托管资源

工厂还可以选择静态代理从项目文件中读取的资源。省略字段会保留项目的配置。提供一个值来替换该运行：|领域 |省略 |已选择 |已清除 |
| - | - | - | - |
| `instructions` | Uses `instructions.md`. |使用提供的提示。 | `""` 删除编写的指令。 |
| `skills` |展示所有项目技能。 |仅公开选定的技能。 | `[]`没有暴露任何技能。 |
| `mcp` |使用 `mcp` 声明。 |仅使用选定的 MCP 定义。 | `[]` 不公开 MCP 工具。 |
| `sandbox` |使用 `sandbox` 声明。 |使用提供的沙箱。 | `None` 禁用沙箱。 |

静态定义无法设置这些字段。技能路径必须以 `skills/<name>` 结尾，并指向项目中的技能。工厂还可以返回生成的技能定义，其名称不得与项目技能名称重复。

此示例根据请求启用文档 MCP 服务器，并为一个存储库提供更长的沙箱超时。它从[⟦T51⟧](/langsmith/python/managed-deep-agents-mcp-connectors)和[⟦T52⟧](/langsmith/python/managed-deep-agents-sandboxes)导入声明：

```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import TypedDict

from managed_deepagents import ManagedServerRuntime, define_deep_agent, define_sandbox

from sandbox import sandbox
from tools.mcp import mcp


class AppContext(TypedDict, total=False):
    repository: str
    needs_docs: bool


def agent(runtime: ManagedServerRuntime[AppContext]):
    execution = runtime.execution_runtime
    context = execution.context if execution is not None else None
    python_service = context is not None and context.get("repository") == "payments-service"
    needs_docs = context is not None and context.get("needs_docs", False)
    return define_deep_agent(
        name="open-swe",
        model="openai:gpt-5.5",
        mcp=[mcp] if needs_docs else [],
        sandbox=define_sandbox(default_timeout=600) if python_service else sandbox,
        context_schema=AppContext,
    )
```

每次运行时不会选择内存。在项目的内存文件中声明它，并使用 `allow` 策略控制每次运行的访问。 See [Control access to a layer](/langsmith/python/managed-deep-agents-memory#control-access-to-a-layer).

### 保持工厂可重复

托管 Deep Agents 在每次运行开始时调用工厂，并在运行恢复或重试时再次调用。代理服务器还调用它来读取架构和状态。请遵循以下规则：* **无副作用**：为相同的上下文返回相同的定义。不要创建记录、调用外部 API 或更改工厂中的共享状态。
* **稳定中断**：保留可以在每个配置中中断运行的中间件。当运行恢复时，引发中断的中间件必须仍然存在。
* **内联名称**：将 `name` 设置为内联字符串。 `mda build` 无需调用工厂即可读取它，并将其用作图形 ID 和默认部署名称。
* **模型依赖项**：为工厂可以返回的每个模型安装集成包。构建不会检测到它们。

要更改运行中模型调用之间的行为，请使用 [custom middleware](/langsmith/python/managed-deep-agents-middleware)。

## 使用LLM网关

您可以使用 [LLM Gateway](/langsmith/llm-gateway) 将速率限制、回退和其他策略应用于模型调用。

网关型号 ID 前面加上 `langsmith:`：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_deep_agent

agent = define_deep_agent(
    name="my-agent",
    model="langsmith:moonshotai/kimi-k3",
)
```

<Note>
  网关模型 ID 在提供者和模型之间使用斜杠 (`langsmith:provider/model-name`)。直接调用提供程序的模型字符串使用冒号 (`provider:model-name`)。
</Note>网关按型号 ID 路由每个请求。 `moonshotai/kimi-k3` 是LangChain 托管模型，因此它不需要提供者密钥并利用 [Gateway Credits](/langsmith/llm-gateway-credits)。以您的工作区已配置的提供商开头的模型 ID（例如 `anthropic/claude-opus-5`）使用该 [provider secret](/langsmith/llm-gateway-admin-setup#1-add-provider-secrets) 并向您自己的提供商帐户计费。

有关更多信息，请参阅[LLM Gateway](/langsmith/llm-gateway)。

要搭建一个从一开始就使用 Gateway 的项目，请在初始化时传递 `--gateway`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
mda init my-agent --gateway
```

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-agent-definition.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>