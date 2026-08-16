<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add a custom search tool, memory, and a schedule | https://docs.langchain.com/langsmith/python/managed-deep-agents-tutorial -->

# 添加自定义搜索工具、内存和时间表

本教程从[quickstart](/langsmith/python/managed-deep-agents-quickstart)继续。使用您在此处创建的 `research-assistant` 项目，以及您的模型、说明和工作 `mda dev` 设置。

`mda init` 还可以搭建`identity` 和 `sandbox/` 等文件。保持原样；本教程不会改变它们。

本指南用编写的 [Tavily](https://tavily.com) 搜索工具替换了快速入门的内置提供商搜索，启用持久内存，添加每日计划，然后进行部署。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 扩展代理

<Steps>
  <Step title="Add a custom search tool" id="add-tool">

内置提供商搜索对于首次运行很方便。编写的工具为您提供更多控制：选择搜索 API、调整参数并将工具代码保留在您的项目中。

<Note>
如果您按照[Quickstart](/langsmith/python/managed-deep-agents-quickstart)中的步骤使用Tavily，请跳至下一步。
</Note>

将 [Tavily API key](https://app.tavily.com) 添加到 `.env`：

```text .env
TAVILY_API_KEY=<TAVILY_API_KEY>
```

安装Tavilly客户端：

```bash
uv add tavily-python
```




创建自定义 `internet_search` 工具：

```python tools/search.py
import os
from typing import Literal

from langchain.tools import tool
from tavily import TavilyClient


tavily_client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])


@tool
def internet_search(
    query: str,
    max_results: int = 5,
    topic: Literal["general", "news", "finance"] = "general",
) -> dict:
    """Search the internet for relevant sources."""
    return tavily_client.search(
        query,
        max_results=max_results,
        topic=topic,
    )
```




将提供商搜索工具字典替换为您编写的工具。保留快速入门中的 `model` 值：

```python agent.py
from managed_deepagents import define_deep_agent

from tools.search import internet_search

agent = define_deep_agent(
    name="research-assistant",
    model="openai:gpt-5.5",
    tools=[internet_search],
)
```




如果`mda dev`已经在运行，请重新启动它。在 Studio 中，询问：

```txt wrap
What were the main announcements from the latest LangChain release?
```确认代理致电`internet_search`并返回带有引用的答案。有关更多创作工具，请参阅[Custom tools](/langsmith/python/managed-deep-agents-tools)。

  </Step>

  <Step title="Update the instructions for memory" id="instructions">

扩展`instructions.md`，以便代理知道要保留哪些共享知识。保留研究行为并添加内存策略：

```markdown instructions.md
# Research assistant

You are a careful research assistant. Use internet search to find sources,
keep notes, and return concise answers with citations.

## Memory

- Record reusable research procedures and project knowledge that can improve future work.
- For release research, check the project's official changelog before secondary sources.
- Never store personal data or secrets in memory.
```
  </Step>

  <Step title="Enable and use durable memory" id="memory">

持久内存是可选的。在要求代理记住任何内容之前，请在项目根目录添加内存声明：

```python memory.py
from managed_deepagents import define_memory

memory = define_memory(scope="agent")
```




内存在整个部署中共享，并且对所有调用者可见，因此不要存储个人数据或机密。

重新启动`mda dev`，以便它发现新文件。在一个线程中，要求代理研究版本并记录可重用的项目规则，例如“对于版本研究，请在二手源之前检查官方变更日志”。然后在 Studio 中创建一个 **新线程** 并询问它将如何研究下一个版本。即使新线程没有对话历史记录，也请确认它应用了共享规则。

详情请参阅[Memory](/langsmith/python/managed-deep-agents-memory)。

  </Step>

  <Step title="Schedule a daily digest" id="schedule">

添加 `schedules/` 模块，以便代理按 cron 节奏运行，无需用户消息。该时间表在太平洋时间每个工作日上午 8 点运行：

```python schedules/daily_digest.py
from managed_deepagents import define_schedule

schedule = define_schedule(
    cron="0 8 * * 1-5",
    timezone="America/Los_Angeles",
    prompt=(
        "Review durable memory for reusable research rules. "
        "Summarize anything useful, then list open questions for today."
    ),
)
```




如果第一次触发时内存为空，代理仍会返回未解决的问题。部署上线后，`mda deploy` 将此计划协调为 LangSmith cron 作业。在下一步中部署后，您应该会看到：

- `mda deploy` 在没有进度错误的情况下完成（不要通过`--no-wait`，否则进度不协调）。
- 部署中此文件的托管 cron。计划名称与模块主干匹配：`daily_digest` (Python) 或 `daily-digest` (TypeScript)。
- 此 cron 没有立即运行摘要。第一场火灾要等到工作日美国/洛杉矶 8:00 才会发生。

有关线程行为和约束，请参阅[Schedules](/langsmith/python/managed-deep-agents-schedules)。

  </Step>

  <Step title="Deploy and inspect" id="deploy">

将项目部署到LangSmith：

```bash
mda deploy .
```

成功后，CLI 将打印部署仪表板 URL。部署将指令同步到 Context Hub、上传已编译的项目并协调每日计划。

打开该 URL 并确认：

- 部署已准备就绪。
- `daily_digest` 或 `daily-digest` cron 存在。
- 测试聊天运行显示模型调用、`internet_search` 工具调用以及跟踪中的内存读取或写入。

有关部署标志和故障排除，请参阅 [Deploy an agent](/langsmith/python/managed-deep-agents-deploy) 和 [CLI reference](/langsmith/python/managed-deep-agents-cli#deploy-projects)。

  </Step>
</Steps>

## 后续步骤<CardGroup cols={2}>
  <Card title="Custom middleware" icon="code" href="/langsmith/python/managed-deep-agents-middleware">
    围绕模型和工具调用添加日志记录、重试、限制和护栏。
  </Card>
  <Card title="Identity" icon="fingerprint" href="/langsmith/python/managed-deep-agents-identity">
    对调用者进行身份验证并在工具和中间件中使用经过验证的身份。
  </Card>
  <Card title="Evals" icon="flask" href="/langsmith/python/managed-deep-agents-evals">
    编写 Harbor 任务并编译 Harbor 的托管代理。
  </Card>
</CardGroup>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-tutorial.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>