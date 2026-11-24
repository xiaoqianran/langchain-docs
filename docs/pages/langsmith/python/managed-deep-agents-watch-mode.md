<!-- langchain-docs: Build a Slack watch agent | https://docs.langchain.com/langsmith/python/managed-deep-agents-watch-mode -->

# Build a Slack watch agent

Build a Slack agent that reads every channel message and decides when to reply.

Watch mode lets a [Slack-connected agent](/langsmith/python/managed-deep-agents-channels-slack) read channel messages without waiting for a mention. The agent decides from context whether to reply or stay silent.

> [!NOTE]
>
> Managed Deep Agents is in **public [beta](/langsmith/release-stages)** on [LangSmith Cloud](/langsmith/cloud) and [Bring Your Own Cloud (BYOC)](/langsmith/byoc). Use Managed Deep Agents CLI and SDK v0.10 or later for BYOC.

> [!NOTE]
>
> This Python example requires `managed-deepagents>=0.10.4` and the matching `mda` CLI.

![Mock Slack channel #ops-deploys showing Watch Agent staying silent on casual chatter, silently scheduling a 15-minute check-in after a deploy message, and posting a latency check reply in the thread.](https://mintcdn.com/langchain-5e9cc07a/bdTAbHGS6Uo5z-4d/langsmith/images/managed-deep-agents-watch-mode-light.png?fit=max\&auto=format\&n=bdTAbHGS6Uo5z-4d\&q=85\&s=421a5e17e7ce21130f9d5ace97a2027c)

## Configure the Slack channel

Start with a project that has a [Slack channel](/langsmith/python/managed-deep-agents-channels-slack#add-a-slack-channel) and update its declaration:

```python channels/slack.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import channels

channel = channels.slack(
    trigger_mode="all",
    reactions=False,
    status=False,
)
```

Every message in channels the bot belongs to starts a run, and each run incurs usage. Turning off reactions and working status keeps the agent quiet when it chooses not to reply.

## Write the instructions

Add to `instructions.md`:

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Slack watch agent

Answer direct questions and mentions. For other messages, reply only when you
can add something useful. Otherwise, respond with exactly [quiet].
```

An exact `[quiet]` response posts nothing.

[Deploy the agent](/langsmith/python/managed-deep-agents-deploy) and invite it to a channel. Send a message that needs no reply and a message that mentions the agent, then confirm only the mention gets a reply.

## Add check-ins

To let the agent follow up later, add a [custom tool](/langsmith/python/managed-deep-agents-tools) that schedules a one-time [check-in](/langsmith/python/managed-deep-agents-schedules#create-schedules-at-runtime) in the current thread.

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

Register the tool:

```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_deep_agent

from tools.watch import schedule_check_in

agent = define_deep_agent(
    name="watch-agent",
    model="openai:gpt-6.1-sol",
    tools=[schedule_check_in],
)
```

Add to `instructions.md`:

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
When work is ongoing and a later check could help, call schedule_check_in.
When a check-in runs, reply only if there is something new; otherwise respond
with exactly [quiet].
```

For example, if someone says a fix is rolling out, the agent can schedule a check-in for 15 minutes later. Check-ins run as the agent and see only messages already delivered to its thread.

## Extend the pattern

* Filter messages before a run starts by returning `None` from an `on_event` `"message"` handler on `channels.slack(...)` to cut usage in busy channels.

* Add a Slack history [tool](/langsmith/python/managed-deep-agents-tools) so check-ins can read the latest replies in the thread.

* Track a thread across multiple check-ins by letting each check-in schedule the next, with tools to [list and delete](/langsmith/python/managed-deep-agents-schedules#manage-schedules) pending checks when done.

## See also

* [Slack](/langsmith/python/managed-deep-agents-channels-slack): set up the Slack app and configure channel triggers.
* [Schedules](/langsmith/python/managed-deep-agents-schedules): create and manage runtime schedules.
* [Instructions](/langsmith/python/managed-deep-agents-instructions): configure the agent's behavior.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-watch-mode.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).