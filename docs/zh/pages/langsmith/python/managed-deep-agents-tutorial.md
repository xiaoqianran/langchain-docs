<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a daily digest agent | https://docs.langchain.com/langsmith/python/managed-deep-agents-tutorial -->

# 构建每日摘要代理

构建一个代理来记住您关注的主题并每个工作日发送摘要。

每日消化剂结合了持久记忆和时间表。告诉它你关注哪些主题，每个工作日的早上它都会搜索最近的新闻并撰写简短的摘要。

> [!注意]
>
> 托管 Deep Agents 在 [LangSmith Cloud](/langsmith/cloud) 和 [Bring Your Own Cloud (BYOC)](/langsmith/byoc) **公开 [beta](/langsmith/release-stages)**。使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。

> [!注意]
>
> 此 Python 示例需要 `managed-deepagents>=0.10.4` 和匹配的 `mda` CLI。

![Mock chat interface showing two threads: a Monday thread saving topics to /memories/agent/topics.md and a Tuesday 8:00 AM scheduled thread delivering a cited daily digest.](https://mintcdn.com/langchain-5e9cc07a/bdTAbHGS6Uo5z-4d/langsmith/images/managed-deep-agents-daily-digest-light.png?fit=max\&auto=format\&n=bdTAbHGS6Uo5z-4d\&q=85\&s=f4f4c9f8504f6b6a1d3b2031e6e9bf2d)

## 配置代理

从[quickstart](/langsmith/python/managed-deep-agents-quickstart)的研究助理开始，它已经有了网络搜索。启用共享[memory](/langsmith/python/managed-deep-agents-memory)：

```python memory.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import MemoryLayer, define_memory

memory = define_memory(agent=MemoryLayer())
```

替换`instructions.md`：

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Digest agent

You are a research assistant. When someone asks you to follow or stop
following a topic, update /memories/agent/topics.md and confirm the change.

When asked for a digest, read that file, search for news from the last day on
each topic, and write a short digest with one or two cited items per topic.
```

## 添加时间表

添加太平洋地区每个工作日上午 8:00 运行的 [schedule](/langsmith/python/managed-deep-agents-schedules)：

```python schedules/daily_digest.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_schedule

schedule = define_schedule(
    cron="0 8 * * 1-5",
    timezone="America/Los_Angeles",
    prompt="Write today's digest.",
)
```

## 尝试一下

使用 `mda dev` 运行代理并告诉它遵循一个主题，例如“遵循 LangChain 版本”。开始一个新线程并询问今天的摘要。即使新线程没有历史记录，代理也会从内存中读取您保存的主题。

[Deploy the agent](/langsmith/python/managed-deep-agents-deploy) 自动运行计划。每个计划运行都会在部署上启动一个新线程。

## 扩展模式* 使用 [schedule delivery](/langsmith/python/managed-deep-agents-schedules#deliver-results-to-slack) 将摘要发布到 Slack。
* 让人们通过[runtime schedules](/langsmith/python/managed-deep-agents-schedules#create-schedules-at-runtime)设置自己的消化时间。
* 切换到内置[web search](/langsmith/python/managed-deep-agents-search)，因此搜索不需要单独的 API 密钥。

## 另请参阅

* [Memory](/langsmith/python/managed-deep-agents-memory)：选择和控制持久内存层。
* [Schedules](/langsmith/python/managed-deep-agents-schedules)：配置和管理计划运行。
* [Web search](/langsmith/python/managed-deep-agents-search)：添加内置搜索，无需单独的 API 密钥。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-tutorial.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。