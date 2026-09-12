<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Define a Managed Deep Agent | https://docs.langchain.com/langsmith/python/managed-deep-agents-agent-definition -->

# 定义一个托管深度代理

代理定义选择托管深度代理的模型和核心功能。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

代理条目位于项目根目录：

```text
my-agent/
  agent.py
```




完整的项目布局请参见[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

要定义代理，请使用`define_deep_agent`：

<CodeGroup>
```python OpenAI
from managed_deepagents import define_deep_agent

agent = define_deep_agent(
    name="research-assistant",
    model="openai:gpt-5.5",
)
```

```python Anthropic
from managed_deepagents import define_deep_agent

agent = define_deep_agent(
    name="research-assistant",
    model="anthropic:claude-sonnet-4-6",
)
```

```python Google Gemini
from managed_deepagents import define_deep_agent

agent = define_deep_agent(
    name="research-assistant",
    model="google_genai:gemini-3.6-flash",
)
```
</CodeGroup>




通过项目文件而不是代理定义来配置系统提示、技能、内存、沙箱、身份、通道和计划。参见[Project structure](/langsmith/python/managed-deep-agents-project-structure)。

＃＃ 参数|参数|它有什么作用 |
|---|---|
| `name=` |必需的。传递以字母开头且仅包含字母、数字、下划线或连字符的静态字符串，例如 `"research-assistant"`.<br /><br /> 托管 Deep Agents 使用该名称作为 LangGraph 助手 ID 和默认 LangSmith 部署名称。您可以使用 `mda deploy --name` 覆盖部署名称，而无需更改代理定义。 |
| `model=` |设置代理使用的聊天模型。最简单的选项是 `provider:model` 字符串。将提供商的 API 密钥添加到 `.env`，以便模型在本地和部署中运行。<br /><br /> 当您需要在代码中配置模型参数时，请传递 LangChain 聊天模型实例。有关模型选项和支持的提供程序，请参阅[Models](/oss/python/deepagents/models)。<br /><br /> 要连接到 LLM Gateway，请参阅[Use LLM Gateway](#use-llm-gateway)。 |
| `tools=` |添加代理可以调用​​的工具。传递`tools`列表中的工具，以便代理可以调用​​应用程序逻辑或外部服务。<br /><br />在本地模块中定义工具，将它们导入到代理条目中，并将它们添加到定义中。参见[Custom tools](/langsmith/python/managed-deep-agents-tools)。要从远程 MCP 服务器添加工具而不将其导入代理条目，请使用 [MCP connectors](/langsmith/python/managed-deep-agents-mcp-connectors)。 || `middleware=` |添加有关模型调用、工具调用和代理生命周期的行为。传递`middleware`列表中的中间件。中间件按列表顺序运行。参见[Custom middleware](/langsmith/python/managed-deep-agents-middleware)。 |
| `subagents=` |为委派的任务定义专门的代理。当代理应委派专门或上下文繁重的工作时，传递子代理定义。每个子代理可以有自己的提示、模型和工具。参见[Subagents](/oss/python/deepagents/subagents)。 |
| `permissions=` |控制文件系统工具的路径级访问。传递文件系统权限规则来控制代理的内置文件系统工具可以读取或写入哪些路径。参见[Permissions](/oss/python/deepagents/permissions)。 |
| `interrupt_on=` |在选定的工具需要人工批准之前暂停。将 `interrupt_on` 设置为在选定工具调用之前暂停，以便人们可以在调用运行之前批准、编辑或拒绝调用。参见[Human-in-the-loop](/langsmith/python/managed-deep-agents-tools#human-in-the-loop)。 |
| `response_format=` |设置代理必须返回与架构匹配的数据而不是不受约束的文本响应的时间。参见[Structured output](/oss/python/langchain/structured-output)。 |




## 使用LLM网关

您可以使用 [LLM Gateway](/langsmith/llm-gateway) 将速率限制、回退和其他策略应用于模型调用。

网关型号 ID 前面加上 `langsmith:`：

```python
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

```bash
mda init my-agent --gateway
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-agent-definition.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>