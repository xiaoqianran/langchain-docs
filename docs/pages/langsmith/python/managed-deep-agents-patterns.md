<!-- langchain-docs: Managed Deep Agents patterns | https://docs.langchain.com/langsmith/python/managed-deep-agents-patterns -->

# Managed Deep Agents patterns

Build agents for common workflows with Managed Deep Agents patterns.

Patterns combine Managed Deep Agents primitives such as memory, schedules, channels, browsers, and subagents into working agents. Use each guide as a starting point and adapt its instructions and tools to your workflow.

> [!NOTE]
>
> Managed Deep Agents is in **public [beta](/langsmith/release-stages)** on [LangSmith Cloud](/langsmith/cloud) and [Bring Your Own Cloud (BYOC)](/langsmith/byoc). Use Managed Deep Agents CLI and SDK v0.10 or later for BYOC.

![A central agent connected to eight Managed Deep Agents primitives: channels, schedules, memory, tools, connections, sandboxes, subagents, and skills.](https://mintcdn.com/langchain-5e9cc07a/bdTAbHGS6Uo5z-4d/langsmith/images/managed-deep-agents-patterns-light.png?fit=max\&auto=format\&n=bdTAbHGS6Uo5z-4d\&q=85\&s=b903b397b77ccb242eb8b98cc41cd9b1)

## Patterns

* [Daily digest](/langsmith/python/managed-deep-agents-tutorial): Remember topics in durable memory and send a weekday news digest.
* [Watch mode](/langsmith/python/managed-deep-agents-watch-mode): Monitor a Slack channel, stay quiet by default, and schedule follow-up check-ins.
* [Goals](/langsmith/python/managed-deep-agents-goal-oriented): Schedule recurring progress checks until multi-turn work is done.
* [Dreaming](/langsmith/python/managed-deep-agents-dreaming): Review a person's traces nightly to update their memory and propose improvements.
* [Swarm](/langsmith/python/managed-deep-agents-swarm): Fan out an incident investigation across parallel async subagents.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-patterns.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).