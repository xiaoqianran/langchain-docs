<!-- langchain-docs: Investigate an incident with a swarm | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-swarm -->

# Investigate an incident with a swarm

Coordinate async subagents to investigate an incident in parallel.

A swarm splits a task across parallel subagents and combines their findings. In this example, a lead agent starts three specialized [async subagents](/langsmith/javascript/managed-deep-agents-subagents#async-subagents) to investigate an incident in parallel, then writes one report. When the number of parallel tasks depends on the request, the lead can also [fan out dynamically](#fan-out-dynamically) with the built-in `general-purpose` subagent.

> [!NOTE]
>
> Managed Deep Agents is in [beta](/langsmith/release-stages) on [LangSmith Cloud](/langsmith/cloud) and [Bring Your Own Cloud (BYOC)](/langsmith/byoc). Use Managed Deep Agents CLI and SDK v0.10 or later for BYOC.

> [!NOTE]
>
> This TypeScript example requires `managed-deepagents` version 0.10.0 or later and the matching `mda` CLI.

![Mock incident-investigator chat launching logs-investigator, changes-investigator, and issues-investigator in parallel via start_async_task and combining their findings into one report.](https://mintcdn.com/langchain-5e9cc07a/bdTAbHGS6Uo5z-4d/langsmith/images/managed-deep-agents-swarm-light.png?fit=max\&auto=format\&n=bdTAbHGS6Uo5z-4d\&q=85\&s=78b935962181244c0b1b208d22295f04)

## Declare the subagents

Start with a project from the [quickstart](/langsmith/javascript/managed-deep-agents-quickstart) and replace the agent definition:

```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineDeepAgent } from "managed-deepagents";

export const agent = defineDeepAgent({
  name: "incident-investigator",
  model: "openai:gpt-6.1-sol",
  subagents: [
    {
      name: "logs-investigator",
      description: "Analyzes incident logs.",
      systemPrompt: "Find symptoms and timing in the logs. Cite sources.",
      async: true,
    },
    {
      name: "changes-investigator",
      description: "Analyzes recent changes.",
      systemPrompt: "Find changes that could explain the incident. Cite sources.",
      async: true,
    },
    {
      name: "issues-investigator",
      description: "Analyzes related issues.",
      systemPrompt: "Find similar past issues. Cite sources.",
      async: true,
    },
  ],
});
```

Subagents inherit the lead's model and tools. An async subagent sees only its task description, not the lead's conversation.

## Write the instructions

Replace `instructions.md`:

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Incident investigator

For an incident, start logs-investigator, changes-investigator, and
issues-investigator as async tasks at the same time. Give each one the
relevant evidence from the request. When all three finish, write one report
that separates confirmed findings from hypotheses and lists missing evidence.
```

The lead launches each task with `start_async_task`. Tasks run in separate threads and notify the lead as each one finishes.

## Try it

Run the agent with `mda dev` or [deploy it](/langsmith/javascript/managed-deep-agents-deploy). In a new conversation, describe an incident and paste logs, recent changes, and related issues. Confirm that the lead starts all three tasks at once and combines their findings.

## Fan out dynamically

When the number of parallel tasks depends on the request (such as one investigation per affected service), you do not need to declare subagents up front. Every deployed or `mda dev` agent includes a built-in [`general-purpose`](/oss/javascript/deepagents/subagents#the-general-purpose-subagent) subagent that inherits the lead's model, tools, and skills.

Instruct the lead to launch multiple `general-purpose` tasks in one turn, using `start_async_task` for background runs or `task` to wait for all results:

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
When an incident spans multiple services, launch one `general-purpose` task
per service in the same turn. Include the service, time range, symptoms, and
expected output in each description, then combine the findings.
```

Each task runs in its own context window and does not see the user's message, so include all needed details in the `description`.

## Extend the pattern

* Add read-only [tools](/langsmith/javascript/managed-deep-agents-tools) or [MCP servers](/langsmith/javascript/managed-deep-agents-mcp-connectors) so the subagents pull live logs, changes, and issues.
* Add a [Slack channel](/langsmith/javascript/managed-deep-agents-channels-slack) so people can start an investigation by mentioning the agent.
* Add more async subagents, such as one for metrics, and name them in `instructions.md`.

## See also

* [Subagents](/langsmith/javascript/managed-deep-agents-subagents): configure delegation and subagent access.
* [Async subagents](/oss/javascript/deepagents/async-subagents): manage background tasks.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-swarm.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).