<!-- langchain-docs: Deep Agents overview | https://docs.langchain.com/oss/javascript/deepagents/overview -->

# Deep Agents overview

Agent harness for planning, subagents, and file-system context, available as Managed Deep Agents or the Deep Agents SDK

Deep Agents is the [agent harness](/oss/javascript/concepts/products#agent-harnesses-like-the-deep-agents-sdk) for complex, multi-step work. It adds planning, a virtual filesystem for context, subagent spawning, and long-term memory on top of LangChain and LangGraph.

Start with [Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview) to run production agents without having to manage infrastructure. Alternatively, for maximum flexibility while using the same Deep Agents harness, use the [Deep Agents SDK](#self-host-with-the-sdk) and host agents yourself, or run a custom [LangSmith Deployment](/langsmith/deployment).

## Choose how to run Deep Agents

> [card] [Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview)
>
> Build deep agents with managed deployment infrastructure for complex, long-running tasks. LangSmith runs the harness, Agent Server, sandboxes, and schedules.

> [card] [Deep Agents SDK](#self-host-with-the-sdk)
>
> The same deep agents harness with maximum flexibility. Host agents yourself, or run a custom LangSmith Deployment when you need more control over the runtime.

Deep Agents includes the following capabilities:

* **Take actions in an environment**: Take actions via tools, read and write files, execute code
* **Connect to your data**: Load memories, skills, and domain knowledge at the right moment
* **Manage growing context**: Summarize history and offload large results across long runs
* **Parallelize tasks**: Delegate to general or specialized subagents running in isolated context windows
* **Stay in the loop**: Pause for human approval at critical decision points
* **Improve over time**: Update memory, skills, and prompts based on real usage

Optional capabilities such as [task planning](#task-planning) and [skills](#skills) extend the harness when your use case needs them. See [Core capabilities](#core-capabilities) for a full breakdown of each component.

## Self-host with the SDK

Use the open source SDK when you run the agent in your own process or container, need a custom [backend](/oss/javascript/deepagents/backends), store, or checkpointer, or want a [LangSmith Deployment](/langsmith/deployment) you configure yourself. For managed deployment instead, see [Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview).

### Try it

### Quickstart

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod";
// npm install deepagents langchain @langchain/core
import { createDeepAgent } from "deepagents";
import { tool } from "langchain";

const getWeather = tool(({ city }) => `It's always sunny in ${city}!`, {
  name: "get_weather",
  description: "Get the weather for a given city",
  schema: z.object({
    city: z.string(),
  }),
});

const agent = await createDeepAgent({
  tools: [getWeather],
  systemPrompt: "You are a helpful assistant",
});

console.log(
  await agent.invoke({
    messages: [{ role: "user", content: "What's the weather in Tokyo?" }],
  }),
);
```

> [card] [View example trace](https://smith.langchain.com/public/863e743e-5e51-4c04-9165-a6884536c09c/r)
>
> Open a public LangSmith run for this example.

See the [Quickstart](/oss/javascript/deepagents/quickstart/) and [Customization guide](/oss/javascript/deepagents/customization/) to build with the SDK.

> [!TIP]
>
> Trace requests, debug agent behavior, and evaluate outputs with [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-overview). Follow the [observability quickstart](/langsmith/observability-quickstart) to get set up.

## Core capabilities

![Agent harness capabilities by category](https://mintcdn.com/langchain-5e9cc07a/jtty0O--UJOKG0nK/oss/images/agent_harness_capabilities.svg?fit=max\&auto=format\&n=jtty0O--UJOKG0nK\&q=85\&s=0ff671d72badd0844826660dfcb04391)

Deep Agents is an ["agent harness"](/oss/javascript/concepts/products#agent-harnesses-like-the-deep-agents-sdk). It is the same core tool calling loop as other agent frameworks, but with built-in capabilities that make agents reliable for real tasks:

> [card] [Execution environment](#execution-environment)
>
> Tools, virtual filesystem, optional sandbox, and REPL (interpreter)

> [card] [Context management](#context-management)
>
> Skills, memory, summarization, context offloading, and prompt caching

> [card] [Delegation](#delegation)
>
> Subagent spawning and optional task planning

> [card] [Steering](#steering)
>
> Human-in-the-loop approval and interrupts

[`deepagents`](https://www.npmjs.com/package/deepagents) is a standalone library built on top of [LangChain](/oss/javascript/langchain/)'s core building blocks for agents and using [LangGraph](/oss/javascript/langgraph/)'s tooling for running agents in production.

[LangChain](/oss/javascript/langchain/) is the framework that provides the core building blocks for your agents.
To learn more about the differences between LangChain, LangGraph, and Deep Agents, see [Frameworks, runtimes, and harnesses](/oss/javascript/concepts/products). For a side-by-side comparison with Anthropic's harness, see [Deep Agents vs. Claude Agent SDK](/oss/javascript/deepagents/comparison).

For building custom agents without these built-in capabilities, consider using LangChain's [`createAgent`](/oss/javascript/langchain/agents) or building a custom [LangGraph](/oss/javascript/langgraph/overview) workflow.

## Execution environment

The execution environment is where an agent acts. It has four layers:

* **[Tools](#tools-and-mcp)**: custom functions, APIs, and databases the agent can call
* **[Virtual filesystem](#virtual-filesystem-access)**: file tools backed by pluggable backends
* **[Filesystem permissions](#filesystem-permissions)**: declarative access control over which paths agents can read or write
* **[Code execution](#code-execution)**: sandboxed shell execution and an in-process JavaScript interpreter

**[Streaming](#streaming)** allows you to keep up with everything happening using typed event streams for messages, tools, values, and delegated tasks.

### Tools and MCP

Pass custom functions, LangChain tools, or tools from any [MCP server](/oss/javascript/deepagents/tools#mcp-tools) with the `tools=` parameter. Deep Agents fully support the [Model Context Protocol (MCP)](/oss/javascript/langchain/mcp), letting you connect to databases, APIs, file systems, and more through a standard interface.

For more information on defining custom tools, using MCP servers, and the full list of built-in harness tools, see [Tools](/oss/javascript/deepagents/tools).

### Virtual filesystem access

The harness provides a configurable virtual filesystem which can be backed by different [pluggable backends](/oss/javascript/deepagents/backends): in-memory state, local disk, LangGraph store, composite routing, or a custom backend with [permission rules](/oss/javascript/deepagents/permissions) for read and write access.

The backends support the following file system operations:

| Tool | Description |
| - | - |
| `ls` | List files in a directory with metadata (size, modified time) |
| `read_file` | Read file contents with line numbers, supports offset/limit for large files. Also supports returning multimodal content blocks for non-text files (images, video, audio, and documents). See supported extensions below. |
| `write_file` | Create new files |
| `edit_file` | Perform exact string replacements in files (with global replace mode) |
| `glob` | Find files matching patterns (e.g., `**/*.py`) |
| `grep` | Search file contents with multiple output modes (files only, content with context, or counts) |
| `execute` | Run shell commands in the environment (available with [sandbox backends](/oss/javascript/deepagents/sandboxes) only) |

> [accordion] Supported multimodal file extensions
>
> | Type | Extensions |
> | - | - |
> | [Image](/oss/javascript/langchain/messages#multimodal) | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.heic`, `.heif` |
> | [Video](/oss/javascript/langchain/messages#multimodal) | `.mp4`, `.mpeg`, `.mov`, `.avi`, `.flv`, `.mpg`, `.webm`, `.wmv`, `.3gpp` |
> | [Audio](/oss/javascript/langchain/messages#multimodal) | `.wav`, `.mp3`, `.aiff`, `.aac`, `.ogg`, `.flac` |
> | [File](/oss/javascript/langchain/messages#multimodal) | `.pdf`, `.ppt`, `.pptx` |

> [accordion] Running without the default filesystem tools
>
> To hide the filesystem tools listed above from the model, register a [harness profile](/oss/javascript/deepagents/profiles#harness-profiles) with `excluded_tools`:
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from deepagents import HarnessProfile, register_harness_profile
>
> register_harness_profile(
>     "anthropic:claude-sonnet-4-6",
>     HarnessProfile(
>         excluded_tools=frozenset(
>             {"ls", "read_file", "write_file", "edit_file", "delete", "glob", "grep"}
>         ),
>     ),
> )
> ```
>
> Removing [`FilesystemMiddleware`](https://reference.langchain.com/javascript/deepagents/middleware/createFilesystemMiddleware) itself via `excluded_middleware` is intentionally rejected—it is required scaffolding in the [Deep Agents stack](/oss/javascript/deepagents/customization#deep-agents-stack). Use `excluded_tools` to hide only the model-visible tool surface and leave the middleware in place. To remove the `task` tool, see [Running without subagents](/oss/javascript/deepagents/subagents#running-without-subagents).

The virtual filesystem is used by several other harness capabilities such as skills, memory, code execution, and context management.
You can also use the file system when building custom tools and middleware for Deep Agents.

For more information, see [backends](/oss/javascript/deepagents/backends). To generate a durable repository wiki that agents can read from the filesystem, see [OpenWiki](/oss/openwiki/overview).

### Filesystem permissions

The harness supports declarative permission rules that control which files and directories the agent can read or write. Permissions apply to the built-in filesystem tools listed above and are evaluated in declaration order with first-match-wins semantics.

Define permissions by passing a list of rules to `permissions=` when creating the agent. Each rule includes:

* `operations`: `"read"` and/or `"write"`
* `paths`: Glob patterns for files or directories
* `mode`: `"allow"` or `"deny"`

Rules are evaluated top to bottom, and the first matching rule wins. If no rule matches, the operation is allowed.

This model lets you restrict agents to specific directories (for example, `/workspace/`), protect sensitive files such as `.env` or credentials, and give subagents narrower access than the parent agent.

Permissions do not apply to [sandbox backends](/oss/javascript/deepagents/sandboxes), which support arbitrary command execution via the `execute` tool. For custom validation logic, use [backend policy hooks](/oss/javascript/deepagents/backends#add-policy-hooks).

For the full rule structure, examples, and subagent inheritance, see [Permissions](/oss/javascript/deepagents/permissions).

### Code execution

Deep Agents supports code execution in two ways:

* [Sandbox backends](/oss/javascript/deepagents/sandboxes) expose an `execute` tool for shell commands in an isolated environment.
* [Interpreters](/oss/javascript/deepagents/interpreters) add an `eval` tool that runs JavaScript in a scoped QuickJS runtime.

Use sandbox backends when the agent needs to install dependencies, run tests, call CLIs, or work with an operating-system filesystem. Sandbox backends implement the `SandboxBackendProtocolV2`; when detected, the harness adds the `execute` tool to the agent's available tools.

Use interpreters when the agent needs a lightweight programmable layer for loops, batching, deterministic data transformations, or programmatic tool calling. Interpreters do not provide shell access, package installs, or filesystem and network access.

For sandbox setup, providers, and file transfer APIs, see [Sandboxes](/oss/javascript/deepagents/sandboxes). For the QuickJS runtime and programmatic tool calling, see [Interpreters](/oss/javascript/deepagents/interpreters).

### Streaming

[Event streaming](/oss/javascript/deepagents/event-streaming) exposes agent runs as typed projections for messages, tool calls, values, and output. Deep Agents add `stream.subagents` so each delegated task gets its own handle with independent message, tool-call, and nested subagent streams.

## Context management

The context management component controls what the agent knows, how long it can operate within token limits, and what it retains across sessions. It has four layers:

* **[Skills](#skills)**: on-demand domain knowledge loaded progressively from skill files
* **[Memory](#memory)**: persistent instructions and preferences loaded at startup from `AGENTS.md` files
* **[Summarization and context offloading](#summarization-and-context-offloading)**: automatic compression of conversation history and large tool results
* **[Prompt caching](#prompt-caching)**: static prompt sections are cache-eligible to speed up inference and reduce cost on supported models

### Skills

Skills package specialized workflows, domain knowledge, and custom instructions for your deep agent.

Each skill follows the [Agent Skills standard](https://agentskills.io/) and lives in a directory with a `SKILL.md` file. Skills can also include scripts, templates, reference docs, and other supporting resources.

Deep Agents load skills with progressive disclosure: the agent reads `SKILL.md` frontmatter at startup, then reads full skill content only when a task needs it. This keeps startup context compact while still making rich capabilities available on demand.

For more information, see [Skills](/oss/javascript/deepagents/skills).

### Memory

Memory gives your deep agent persistent context across conversations, such as coding style, preferences, conventions, and project guidelines.

Memory uses [`AGENTS.md` files](https://agents.md/) that you pass through the `memory` parameter when creating the agent. Unlike skills, memory files are always loaded, and the content is stored in the configured backend (`StateBackend`, `StoreBackend`, or `FilesystemBackend`).

The agent can also update memory based on interactions and feedback, so preferences and patterns can carry forward without needing to restate them in each thread.

For configuration details and examples, see [Memory](/oss/javascript/deepagents/customization#memory). To generate a repository wiki that coding agents discover through `AGENTS.md`, see [OpenWiki](/oss/openwiki/overview).

### Summarization and context offloading

The harness manages context so deep agents can handle long-running work within token limits while keeping the most relevant information in scope.

This context flow has four parts:

* **Input context**: System prompt, memory, skills, and tool prompts define what the agent starts with.
* **Compression**: Built-in offloading and summarization compress conversation history and large intermediate results.
* **Isolation**: Subagents quarantine heavy subtasks and return only final results (see [Delegation](#delegation)).
* **Long-term memory**: Persistent storage in the virtual filesystem carries information across threads.

Together, these mechanisms support multi-step tasks that exceed a single context window while reducing manual context trimming and token usage.

For configuration details, see [Context engineering](/oss/javascript/deepagents/context-engineering). For multimodal inputs and tool outputs, see [Multimodal](/oss/javascript/deepagents/multimodal).

### Prompt caching

For Anthropic and Amazon Bedrock models, `create_deep_agent` automatically applies prompt caching to static sections of the system prompt—the base agent instructions, memory, and skill content that repeat on every turn. This avoids reprocessing the same tokens across calls, reducing both latency and cost on long-running agents.

Prompt caching is enabled by default when using an Anthropic model, or a Bedrock model (Claude or Nova). No configuration is required.

For other providers, see [Middleware integrations](/oss/javascript/integrations/middleware) for available provider-specific caching middleware.

## Delegation

The delegation component enables agents to break large problems into smaller, parallelizable units of work. It has two layers:

* **[Task planning](#task-planning)**: an opt-in `write_todos` tool for structured task tracking
* **[Subagents](#subagents)**: ephemeral child agents that handle isolated subtasks

### Task planning

Task planning is an opt-in harness capability that lets agents maintain a structured task list during execution.

Starting in v0.7 task planning is opt-in only. In earlier versions, task planning middleware was included by default.

Planning is often useful for:

* Long or complicated multi-step tasks
* Less capable models that benefit from an explicit accountability tool
* UIs that stream progress from agent state (see [Todo list](/oss/javascript/deepagents/frontend/todo-list))

Pass [`TodoListMiddleware`](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware) to the middleware parameter to give the agent a `write_todos` tool for maintaining a structured task list during execution.

```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent } from "deepagents";
import { todoListMiddleware } from "langchain";

const agent = await createDeepAgent({
  model: "google:gemini-3.6-flash",
  middleware: [todoListMiddleware()],
});
```

```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent } from "deepagents";
import { todoListMiddleware } from "langchain";

const agent = await createDeepAgent({
  model: "openai:gpt-5.5",
  middleware: [todoListMiddleware()],
});
```

```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent } from "deepagents";
import { todoListMiddleware } from "langchain";

const agent = await createDeepAgent({
  model: "anthropic:claude-sonnet-5",
  middleware: [todoListMiddleware()],
});
```

```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent } from "deepagents";
import { todoListMiddleware } from "langchain";

const agent = await createDeepAgent({
  model: "openrouter:z-ai/glm-5.2",
  middleware: [todoListMiddleware()],
});
```

```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent } from "deepagents";
import { todoListMiddleware } from "langchain";

const agent = await createDeepAgent({
  model: "fireworks:accounts/fireworks/models/glm-5p2",
  middleware: [todoListMiddleware()],
});
```

```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent } from "deepagents";
import { todoListMiddleware } from "langchain";

const agent = await createDeepAgent({
  model: "baseten:zai-org/GLM-5.2",
  middleware: [todoListMiddleware()],
});
```

```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent } from "deepagents";
import { todoListMiddleware } from "langchain";

const agent = await createDeepAgent({
  model: "ollama:north-mini-code-1.0",
  middleware: [todoListMiddleware()],
});
```

Tasks support status tracking (`'pending'`, `'in_progress'`, `'completed'`) and are persisted in agent state. This gives agents a lightweight planning layer for organizing long-running and multi-step work.

For configuration options and behavior details, see [To-do list](/oss/javascript/langchain/middleware/built-in#to-do-list).

### Subagents

The harness includes a built-in `task` tool that lets the main agent create ephemeral subagents for isolated, long-running, multi-step, or parallel tasks.
Two subagent types are available: synchronous subagents (the default) block the supervisor until they return a single report, and [async subagents](/oss/javascript/deepagents/async-subagents) run in parallel and support mid-flight steering via launch, check, update, and cancel tools.

Subagent execution provides:

* **Isolated or inherited context**: By default, each invocation creates a new agent instance with its own context (`mode: "isolated"`). Use `mode: "fork"` to inherit the parent's full conversation history instead. See [Forked subagents](/oss/javascript/deepagents/subagents#forked-subagents).
* **Autonomous execution**: The subagent runs independently until completion.
* **Single handoff**: It returns one final report to the main agent.
* **Configurable strategy**: Use the [default `general-purpose` subagent](/oss/javascript/deepagents/subagents#default-subagent) (enabled by default) or define [custom subagents](/oss/javascript/deepagents/subagents#custom-subagents).
* **Stateless messaging**: Subagents are stateless and cannot send multiple messages back.
* **Context and token efficiency**: Heavy subtask work stays isolated and is compressed into a compact result.

For more information, see [Subagents](/oss/javascript/deepagents/subagents). To remove the `task` tool, see [Running without subagents](/oss/javascript/deepagents/subagents#running-without-subagents).

## Steering

The steering component gives humans control over agent behavior at runtime and sets filesystem permissions for agent work.

### Human-in-the-loop

Deep Agents integrate with LangGraph interrupts so you can pause for approval on sensitive tool calls. Enable this behavior with the `interrupt_on` parameter in `create_deep_agent`.

`interrupt_on` accepts a mapping of tool names to interrupt configurations. For example, `interrupt_on={"edit_file": True}` pauses before every edit, letting you approve the call, add guidance, or modify tool inputs before execution.

This gives you a runtime safety and control layer for destructive operations, expensive API calls, and interactive debugging.

For more information, see [Human-in-the-loop](/oss/javascript/deepagents/human-in-the-loop).

## Get started

> [card] [Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview)
>
> Build deep agents with managed deployment infrastructure

> [card] [SDK quickstart](/oss/javascript/deepagents/quickstart)
>
> The same deep agents harness, self-hosted

> [card] [Customization](/oss/javascript/deepagents/customization)
>
> Learn about SDK customization options

> [card] [Code](/oss/deepagents/code/overview)
>
> Use Deep Agents Code

> [card] [ACP](/oss/javascript/deepagents/acp)
>
> Use deep agents in code editors with ACP

> [card] [Reference](https://reference.langchain.com/javascript/modules/deepagents.html)
>
> See the `deepagents` API reference

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/overview.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).