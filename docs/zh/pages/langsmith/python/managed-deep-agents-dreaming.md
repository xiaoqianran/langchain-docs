<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Dream over traces | https://docs.langchain.com/langsmith/python/managed-deep-agents-dreaming -->

# 梦过痕迹

安排一名特工每晚检查一个人的踪迹并更新他们的记忆。

梦想是对特工过去工作的定期回顾。在此示例中，每晚计划都会在每个选择加入的用户时运行，读取他们最近的跟踪记录并更新他们的用户内存。

> [!注意]
>
> 托管 Deep Agents 在 [LangSmith Cloud](/langsmith/cloud) 和 [Bring Your Own Cloud (BYOC)](/langsmith/byoc) **公开 [beta](/langsmith/release-stages)**。使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。

> [!注意]
>
> 此 Python 示例需要 `managed-deepagents>=0.10.4`、匹配的 `mda` CLI 和 `langsmith>=0.10.15`。自托管 LangSmith 必须是 v0.16 或更高版本。

![Mock private assistant chat alongside memory files showing an approved nightly dreaming schedule running at 03:00 UTC, updating /memories/user/AGENTS.md, and writing a skill proposal to dreaming-proposals.md.](https://mintcdn.com/langchain-5e9cc07a/bdTAbHGS6Uo5z-4d/langsmith/images/managed-deep-agents-dreaming-light.png?fit=max\&auto=format\&n=bdTAbHGS6Uo5z-4d\&q=85\&s=a34b5ef5b2eaf0f3ec29cae9d77455b9)

## 开始之前

* 配置[identity](/langsmith/python/managed-deep-agents-identity)，以便每个人都以自己的身份登录。用户内存和每用户跟踪查找需要登录人员。
* 将每个人的踪迹路由到他们自己的LangSmith追踪项目。
* 将 `DREAM_TRACE_PROJECTS` 添加到 `.env` 并用单引号括起来，以便 `mda deploy` 保留 JSON 双引号。将 MDA 主体 ID 映射到项目 ID，并确保部署的 LangSmith 凭证具有对这些项目的读取访问权限：

```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
DREAM_TRACE_PROJECTS='{"<principal-id>": "<project-id>"}'
```

## 添加个人记忆

在项目根目录声明[user memory](/langsmith/python/managed-deep-agents-memory)：

```python memory.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import MemoryLayer, define_memory

memory = define_memory(user=MemoryLayer())
```计划运行没有通道事件，因此当运行没有通道来源（例如计划运行和 Studio）时，请在代理工厂中选择用户内存。在通道运行时省略 `memory` 会保留 MDA 的默认访问规则，该规则会在 Slack 直接消息中装载用户内存，并在共享通道中将其关闭。需要在 `schedule_dreaming` 上中断，会在创建计划之前提示您批准：

```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import MemoryLayer, define_deep_agent, define_memory

from tools.dreaming import recent_user_traces, schedule_dreaming


def agent(runtime):
    extra = (
        {"memory": define_memory(user=MemoryLayer())}
        if runtime.thread is None or runtime.thread.origin is None
        else {}
    )
    return define_deep_agent(
        name="private-assistant",
        model="openai:gpt-6.1-sol",
        tools=[recent_user_traces, schedule_dreaming],
        interrupt_on={"schedule_dreaming": True},
        **extra,
    )
```

MDA 始终装载登录者的内存，因此提示无法读取其他人的内存。

## 添加工具

`recent_user_traces` 最多可读取当前人最近一天的 25 条痕迹。 `schedule_dreaming` 创建一个以该人身份运行的夜间时间表。

安装模型提供程序包（工厂定义不会自动安装提供程序包）：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv add langchain-openai
```

```python tools/dreaming.py expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import json
import os
from datetime import datetime, timedelta, timezone

from langchain.tools import tool
from langsmith import Client
from managed_deepagents import ManagedDeepAgentRuntime

DREAM_PROMPT = """Read your recent traces with recent_user_traces. Save useful
preferences and recurring context to /memories/user/AGENTS.md, without secrets.
Write ideas for improving your instructions or skills to
/memories/user/dreaming-proposals.md."""


def trace_project(runtime: ManagedDeepAgentRuntime) -> str | None:
    principal = runtime.server_info.principal if runtime.server_info else None
    if principal is None or principal.kind != "person":
        return None
    return json.loads(os.environ["DREAM_TRACE_PROJECTS"]).get(principal.id)


@tool
async def recent_user_traces(runtime: ManagedDeepAgentRuntime) -> str:
    """Read the current person's traces from the last day."""
    if runtime.thread.origin is not None:
        return "Ask outside Slack or other channels, including DMs."
    project = trace_project(runtime)
    if project is None:
        return "No trace project for this person."
    records = []
    async for run in Client().runs.query(
        project_ids=[project],
        min_start_time=datetime.now(timezone.utc) - timedelta(days=1),
        is_root=True,
        selects=["INPUTS", "OUTPUTS"],
        page_size=25,
    ):
        records.append(json.dumps([run.inputs, run.outputs], default=str)[:6000])
        if len(records) == 25:
            break
    return "\n".join(records) or "No recent traces."


@tool
async def schedule_dreaming(runtime: ManagedDeepAgentRuntime) -> str:
    """Schedule a nightly trace review for the current person."""
    if runtime.thread.origin is not None:
        return "Ask outside Slack or other channels, including DMs."
    if trace_project(runtime) is None:
        return "No trace project for this person."
    item = await runtime.schedules.create(
        owner={"type": "user"},
        cron="0 3 * * *",
        timezone="UTC",
        prompt=DREAM_PROMPT,
    )
    return f"Created nightly dreaming schedule {item['id']}."
```

跟踪内容到达模型，因此为它不应该看到的任何内容配置 [trace masking](/langsmith/mask-inputs-outputs)。

## 开始梦想

[Deploy the agent](/langsmith/python/managed-deep-agents-deploy)，登录，并要求它通过外部渠道（例如LangSmith Studio 或您自己的登录应用程序，而不是 Slack DM）的直接对话安排夜间做梦。批准`schedule_dreaming`通话。每天晚上 03:00 UTC，代理会检查您的踪迹并更新`/memories/user/AGENTS.md`。部署的指令和技能在运行时是只读的。要应用 `/memories/user/dreaming-proposals.md` 中的想法，请编辑 `instructions.md` 或项目中的技能并重新部署。为了停止梦想，[delete the schedule](/langsmith/python/managed-deep-agents-schedules#manage-schedules)。

## 扩展模式

* 通过更改 cron 和查询窗口来查看一周的跟踪而不是一天。
* 在部署之前使用[evals](/langsmith/python/managed-deep-agents-evals)测试建议的指令更改。
* 添加 [skill](/langsmith/python/managed-deep-agents-skills) 定义值得记住的内容，以便评论保持一致。

## 另请参阅

* [Schedules](/langsmith/python/managed-deep-agents-schedules)：管理用户拥有的重复运行。
* [Memory](/langsmith/python/managed-deep-agents-memory)：配置持久内存和访问策略。
* [Export traces](/langsmith/export-traces)：查询并分页跟踪数据。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-dreaming.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。