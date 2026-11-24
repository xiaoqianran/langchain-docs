<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a Slack watch agent | https://docs.langchain.com/langsmith/python/managed-deep-agents-watch-mode -->

# 构建 Slack 手表代理

构建一个 Slack 代理来读取每个频道消息并决定何时回复。

观看模式让 [Slack-connected agent](/langsmith/python/managed-deep-agents-channels-slack) 无需等待提及即可读取频道消息。代理根据上下文决定是回复还是保持沉默。

> [!注意]
>
> 托管 Deep Agents 在 [LangSmith Cloud](/langsmith/cloud) 和 [Bring Your Own Cloud (BYOC)](/langsmith/byoc) **公开 [beta](/langsmith/release-stages)**。使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。

> [!注意]
>
> 此 Python 示例需要 `managed-deepagents>=0.10.4` 和匹配的 `mda` CLI。

![Mock Slack channel #ops-deploys showing Watch Agent staying silent on casual chatter, silently scheduling a 15-minute check-in after a deploy message, and posting a latency check reply in the thread.](https://mintcdn.com/langchain-5e9cc07a/bdTAbHGS6Uo5z-4d/langsmith/images/managed-deep-agents-watch-mode-light.png?fit=max\&auto=format\&n=bdTAbHGS6Uo5z-4d\&q=85\&s=421a5e17e7ce21130f9d5ace97a2027c)

## 配置 Slack 通道

从具有 [Slack channel](/langsmith/python/managed-deep-agents-channels-slack#add-a-slack-channel) 的项目开始并更新其声明：

```python channels/slack.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import channels

channel = channels.slack(
    trigger_mode="all",
    reactions=False,
    status=False,
)
```

机器人所属通道中的每条消息都会启动一次运行，并且每次运行都会产生使用量。当代理选择不回复时，关闭反应和工作状态可以使代理保持安静。

## 编写说明

添加到`instructions.md`：

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Slack watch agent

Answer direct questions and mentions. For other messages, reply only when you
can add something useful. Otherwise, respond with exactly [quiet].
```

精确的 `[quiet]` 回复什么也没发布。

[Deploy the agent](/langsmith/python/managed-deep-agents-deploy) 并邀请它加入频道。发送一条不需要回复的消息和一条提及代理的消息，然后确认仅提及的内容会得到回复。

## 添加签到

为了让代理稍后跟进，添加一个[custom tool](/langsmith/python/managed-deep-agents-tools)，在当前线程中调度一次性的[check-in](/langsmith/python/managed-deep-agents-schedules#create-schedules-at-runtime)。

```python tools/watch.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from datetime import datetime, timedelta, timezone

from langchain.tools import tool
from managed_deepagents import ManagedDeepAgentRuntime


@tool
async def schedule_check_in(
    prompt: str, minutes: int, runtime: ManagedDeepAgentRuntime
) -> str:
    """Schedule one check-in in the current conversation, 2 to 1440 minutes from now."""
    origin = runtime.thread.origin
    if origin is None or origin.channel.provider != "slack":
        return "A Slack conversation is required to schedule a check-in."
    if not 2 <= minutes <= 1440:
        return "Choose a delay between 2 and 1440 minutes."
    item = await runtime.schedules.create(
        owner={"type": "agent"},
        at=datetime.now(timezone.utc) + timedelta(minutes=minutes),
        new_thread=False,
        prompt=prompt,
    )
    return f"Scheduled check-in {item['id']}."
```

注册工具：

```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_deep_agent

from tools.watch import schedule_check_in

agent = define_deep_agent(
    name="watch-agent",
    model="openai:gpt-6.1-sol",
    tools=[schedule_check_in],
)
```

添加到`instructions.md`：

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
When work is ongoing and a later check could help, call schedule_check_in.
When a check-in runs, reply only if there is something new; otherwise respond
with exactly [quiet].
```例如，如果有人说修复即将推出，代理可以安排 15 分钟后签入。签入作为代理运行，并且仅查看已传递到其线程的消息。

## 扩展模式

* 在运行开始之前，通过从 `channels.slack(...)` 上的 `on_event` `"message"` 处理程序返回 `None` 来过滤消息，以减少繁忙通道中的使用。

* 添加 Slack 历史记录[tool](/langsmith/python/managed-deep-agents-tools)，以便签到可以读取线程中的最新回复。

* 通过让每个签入安排下一个签入来跟踪多个签入的线程，并使用工具在完成​​后进行 [list and delete](/langsmith/python/managed-deep-agents-schedules#manage-schedules) 挂起检查。

## 另请参阅

* [Slack](/langsmith/python/managed-deep-agents-channels-slack)：设置 Slack 应用程序并配置通道触发器。
* [Schedules](/langsmith/python/managed-deep-agents-schedules)：创建和管理运行时计划。
* [Instructions](/langsmith/python/managed-deep-agents-instructions)：配置代理的行为。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-watch-mode.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。