<!-- langchain-docs: Build a daily digest agent | https://docs.langchain.com/langsmith/python/managed-deep-agents-tutorial -->

# Build a daily digest agent

Build an agent that remembers the topics you follow and sends a digest every weekday.

A daily digest agent combines durable memory and a schedule. Tell it which topics you follow, and each weekday morning it searches for recent news and writes a short digest.

> [!NOTE]
>
> Managed Deep Agents is in **public [beta](/langsmith/release-stages)** on [LangSmith Cloud](/langsmith/cloud) and [Bring Your Own Cloud (BYOC)](/langsmith/byoc). Use Managed Deep Agents CLI and SDK v0.10 or later for BYOC.

> [!NOTE]
>
> This Python example requires `managed-deepagents>=0.10.4` and the matching `mda` CLI.

![Mock chat interface showing two threads: a Monday thread saving topics to /memories/agent/topics.md and a Tuesday 8:00 AM scheduled thread delivering a cited daily digest.](https://mintcdn.com/langchain-5e9cc07a/bdTAbHGS6Uo5z-4d/langsmith/images/managed-deep-agents-daily-digest-light.png?fit=max\&auto=format\&n=bdTAbHGS6Uo5z-4d\&q=85\&s=f4f4c9f8504f6b6a1d3b2031e6e9bf2d)

## Configure the agent

Start with the research assistant from the [quickstart](/langsmith/python/managed-deep-agents-quickstart), which already has web search. Enable shared [memory](/langsmith/python/managed-deep-agents-memory):

```python memory.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import MemoryLayer, define_memory

memory = define_memory(agent=MemoryLayer())
```

Replace `instructions.md`:

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Digest agent

You are a research assistant. When someone asks you to follow or stop
following a topic, update /memories/agent/topics.md and confirm the change.

When asked for a digest, read that file, search for news from the last day on
each topic, and write a short digest with one or two cited items per topic.
```

## Add a schedule

Add a [schedule](/langsmith/python/managed-deep-agents-schedules) that runs every weekday at 8:00 AM Pacific:

```python schedules/daily_digest.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_schedule

schedule = define_schedule(
    cron="0 8 * * 1-5",
    timezone="America/Los_Angeles",
    prompt="Write today's digest.",
)
```

## Try it

Run the agent with `mda dev` and tell it to follow a topic, such as "Follow LangChain releases." Start a new thread and ask for today's digest. The agent reads your saved topics from memory even though the new thread has no history.

[Deploy the agent](/langsmith/python/managed-deep-agents-deploy) to run the schedule automatically. Each scheduled run starts a new thread on the deployment.

## Extend the pattern

* Post the digest to Slack with [schedule delivery](/langsmith/python/managed-deep-agents-schedules#deliver-results-to-slack).
* Let people set their own digest time with [runtime schedules](/langsmith/python/managed-deep-agents-schedules#create-schedules-at-runtime).
* Switch to built-in [web search](/langsmith/python/managed-deep-agents-search) so search requires no separate API key.

## See also

* [Memory](/langsmith/python/managed-deep-agents-memory): choose and control durable memory layers.
* [Schedules](/langsmith/python/managed-deep-agents-schedules): configure and manage scheduled runs.
* [Web search](/langsmith/python/managed-deep-agents-search): add built-in search without a separate API key.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-tutorial.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).