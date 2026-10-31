<!-- langchain-docs: Deep Agents Code | https://docs.langchain.com/oss/deepagents/code/overview -->

# Deep Agents Code

Terminal coding agent built on the Deep Agents SDK

Deep Agents Code (`dcode`) is an open source coding agent built on the [Deep Agents SDK](/oss/python/deepagents/quickstart).
It works with any large language model and supports switching providers or models.
Persistent memory carries context across conversations, customizable skills shape behavior, and approval controls gate code execution.

## Get started

Run the following command to install Deep Agents Code and launch an interactive session:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -LsSf https://langch.in/dcode | bash
dcode
```

See the [Quickstart](/oss/deepagents/code/quickstart) to add provider credentials, run your first task, and learn interactive mode.

<video aria-label="Deep Agents Code terminal demo">
  Your browser does not support the video tag.
</video>

## Capabilities

> [card] [Remote sandboxes](/oss/deepagents/code/remote-sandboxes)
>
> Run agent tools remotely instead of on your local machine.

> [card] [Goals and rubrics](/oss/deepagents/code/goals-and-rubrics)
>
> Define measurable objectives or grading criteria so the agent can check whether work is done.

> [card] [Subagents](/oss/deepagents/code/subagents)
>
> Delegate work to task-specific subagents for parallel execution.

> [card] [Memory](/oss/deepagents/code/memory-and-skills#memory)
>
> Store and retrieve information across sessions, including project conventions and learned patterns.

> [card] [Context compaction](/oss/deepagents/code/quickstart#interactive-mode)
>
> Summarize older messages and offload originals to storage.

> [card] [Human-in-the-loop](/oss/deepagents/code/quickstart#interactive-mode)
>
> Require human approval for sensitive tool operations.

> [card] [Skills](/oss/deepagents/code/memory-and-skills#skills)
>
> Extend agent capabilities with custom expertise and instructions.

> [card] [MCP tools](/oss/deepagents/code/mcp-tools)
>
> Load external tools from Model Context Protocol servers.

> [card] [Tracing](/oss/deepagents/code/quickstart#trace-with-langsmith)
>
> Trace agent operations in LangSmith for observability and debugging.

## Next steps

> [card] [Quickstart](/oss/deepagents/code/quickstart)
>
> Install Deep Agents Code, run your first task, and use interactive or non-interactive modes.

> [card] [Configuration](/oss/deepagents/code/configuration)
>
> Set up credentials, `config.toml`, environment variables, hooks, and CLI flags.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/overview.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).