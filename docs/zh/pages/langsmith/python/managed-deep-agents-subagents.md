<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Subagents | https://docs.langchain.com/langsmith/python/managed-deep-agents-subagents -->

# 子代理

将工作委派给内联运行或在托管深度代理后台运行的子代理。

为托管深度代理子代理分配专门的或上下文繁重的工作，例如研究主题、审查更改或使用异步子代理在后台运行长时间任务，同时代理不断与用户通信。每个子代理都有自己的提示和上下文窗口。它还可以使用自己的模型和工具。

> [!注意]
>
> 托管 Deep Agents 在 [LangSmith Cloud](/langsmith/cloud) 和 [Bring Your Own Cloud (BYOC)](/langsmith/byoc) **公开 [beta](/langsmith/release-stages)**。使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。

子代理有两种类型：

|类型 |代理如何使用 |用它来 |
| - | - | - |
|子代理 |用`task`调用它并等待它的答案 |重点工作，座席在继续之前需要其结果 |
|异步子代理 |用 `start_async_task` 启动并继续工作；子代理完成后会报告 |代理无需等待的长时间运行或并行工作 |

子代理在代理的图表内运行。托管Deep Agents在同一部署中将每个异步子代理构建为其自己的图。两种都在代理的[sandbox](/langsmith/python/managed-deep-agents-sandboxes)中工作。有关子代理如何在开源Deep Agents SDK 中工作，请参阅[Subagents](/oss/python/deepagents/subagents) 和 [Async subagents](/oss/python/deepagents/async-subagents)。> [!注意]
>
> 异步子代理需要`managed-deepagents>=0.10.0`。

## 通用子代理

每个代理都会获得一个内置的 `general-purpose` 子代理，即使您从 [agent definition](/langsmith/python/managed-deep-agents-agent-definition) 中省略 `subagents` 也是如此。代理可以在运行时将独立任务委托给它，包括[fanning out tasks in parallel](#fan-out-tasks-in-parallel)，而无需预先声明专门的子代理。

与自定义子代理不同，`general-purpose` 自动继承代理的技能及其模型和工具。与其他子代理一样，它使用自己的提示和上下文窗口运行，而不是代理的对话或[instructions](/langsmith/python/managed-deep-agents-instructions)。在每个任务的 `description` 中包含所有需要的上下文、约束和预期输出。

当任务需要不同的模型、受限工具集或可重用的系统提示时，声明自定义子代理。有关自定义选项，请参阅[The general-purpose subagent](/oss/python/deepagents/subagents#the-general-purpose-subagent)。

## 声明一个自定义子代理

将子代理定义添加到代理定义中的`subagents`。每人需要一个`name`和一个`description`；代理使用描述来决定何时进行委派。要使子代理异步，请将 `async` 添加到其定义中：

> [选项卡] 子代理
>
> ```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from managed_deepagents import define_deep_agent
>
> agent = define_deep_agent(
>     name="research-assistant",
>     model="openai:gpt-6.1-sol",
>     subagents=[
>         {
>             "name": "reviewer",
>             "description": "Reviews a draft for accuracy and clarity.",
>             "system_prompt": "Review the draft and list concrete fixes.",
>         },
>     ],
> )
> ```

> [选项卡] 异步子代理
>
> ```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from managed_deepagents import define_deep_agent
>
> agent = define_deep_agent(
>     name="research-assistant",
>     model="openai:gpt-6.1-sol",
>     subagents=[
>         {
>             "name": "researcher",
>             "description": "Researches a topic in the background.",
>             "system_prompt": "Research the topic and report your findings.",
>             "async": True,
>         },
>     ],
> )
> ```

## 子代理代理使用 `task` 工具运行子代理并等待其答复。子代理在代理的图表内运行并在代理的[sandbox](/langsmith/python/managed-deep-agents-sandboxes)中工作。

### 子代理继承了什么

子代理从代理的配置开始，并替换其定义设置的内容：

|设置|行为 |
| - | - |
| `model`、`tools`、`permissions`、`interrupt_on` |使用代理的设置，除非子代理设置了自己的 |
| `system_prompt` |仅使用子代理的提示，而不使用代理的 [instructions](/langsmith/python/managed-deep-agents-instructions) |
| `skills` |仅加载子代理列出的技能；列表 `"/skills/"` 加载代理的 |
| `middleware`、`response_format` |仅使用子代理自己的 |
|内存|未加载|

分叉模式下的子代理从代理对话的副本开始，并且还使用代理的指令、中间件、技能和内存。参见[Choose a launch mode](/oss/python/deepagents/async-subagents#choose-a-launch-mode)。

### 并行扇出任务为了并行地分散工作，代理会一轮发出多个 `task` 调用。这适用于内置 `general-purpose` 子代理或任何声明的自定义子代理。每个调用都会设置 `subagent_type` 和不同的 `description`，并在其自己的上下文窗口中运行。代理在下一回合之前接收所有结果并将它们组合成一个答案。为了在任务在后台运行时继续工作，代理会发出多个 `start_async_task` 调用。参见[Async subagents](#async-subagents)。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
flowchart LR
    A["Agent (one turn)"] -->|"task: project-a"| S1["general-purpose"]
    A -->|"task: project-b"| S2["general-purpose"]
    S1 -->|"findings"| R["Agent combines results"]
    S2 -->|"findings"| R

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33

    class A trigger
    class S1,S2 process
    class R output
```

例如，要并行调查多个项目的日志，请向 `instructions.md` 添加指导：

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
When investigating multiple independent projects, delegate one task per project
to the general-purpose subagent in the same turn. Include the project, time
range, symptoms to look for, and expected output in each task description.
Wait for all results, then compare the findings and cite sources.
```

### 选择 MCP 服务器

在子代理上设置 `mcp` 以选择哪些 [MCP server](/langsmith/python/managed-deep-agents-mcp-connectors) 定义为其提供工具。 `mcp` 不影响子代理的其他工具。

> [!注意]
>
> 子代理 MCP 选择需要`managed-deepagents>=0.10.2`。

| `mcp`值|子代理 |异步子代理 |
| - | - | - |
|省略 |继承代理工具|继承代理的 MCP 服务器 |
|定义列表 |仅使 MCP 工具不受这些定义的影响。代理还必须加载它们。 |仅加载这些定义 |
| `[]` 或 `None` |没有 MCP 工具 |没有 MCP 工具 |

异步子代理仅连接到它选择的服务器，并且仅询问其凭据。

只有[graph factory](/langsmith/python/managed-deep-agents-agent-definition#select-configuration-per-run)可以在代理上设置`mcp`。```python agent.py expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import ManagedServerRuntime, connections, define_deep_agent, define_mcp

knowledge = define_mcp(
    servers={
        "langchainDocs": {"transport": "http", "url": "https://docs.langchain.com/mcp"},
        "notion": {
            "transport": "http",
            "url": "https://mcp.notion.com/mcp",
            "connection": connections.get("engineering-notion", {"type": "user"}),
        },
    },
)

planning = define_mcp(
    servers={
        "linear": {
            "transport": "http",
            "url": "https://mcp.linear.app/mcp",
            "connection": connections.get("engineering-linear", {"type": "user"}),
        },
    },
)

def agent(runtime: ManagedServerRuntime):
    return define_deep_agent(
        name="research-assistant",
        model="openai:gpt-5.5",
        mcp=[knowledge, planning],
        subagents=[
            {
                "name": "researcher",
                "description": "Answers questions from the docs and the team wiki.",
                "system_prompt": "Search the docs and Notion, and cite the pages you use.",
                "mcp": [knowledge],
            },
            {
                "name": "planner",
                "description": "Turns findings into Linear issues.",
                "system_prompt": "Create one Linear issue for each follow-up.",
                "mcp": [planning],
            },
        ],
    )
```

## 异步子代理

异步子代理在其自己的线程上运行，而父代理继续工作，并在完成或暂停时自动报告。有关完整生命周期，请参阅 [Async subagents](/oss/python/deepagents/async-subagents)、[tools](/oss/python/deepagents/async-subagents#use-the-async-subagent-tools) 和 [options](/oss/python/deepagents/async-subagents#configure-async-subagents)。

托管 Deep Agents 在同一部署中将每个异步子代理构建为其自己的图（例如，`research-assistant--researcher`）。使用静态 `name` 和 `async` 值直接在 `subagents` 中（或在直接返回定义的 [graph factory](/langsmith/python/managed-deep-agents-agent-definition#select-configuration-per-run) 中）声明每个值，因为 CLI 在构建时发现它们而不执行代码。由 `mda dev` 或部署提供服务的代理还会自动获取异步 `general-purpose` 子代理和异步任务工具。

不要在 `async` 子代理上设置 `graph_id`、`url`、`headers` 或 `runnable`；托管 Deep Agents 连接图表本身。 `update_strategy`、`notify_parent`、`webhook`、`mode` 经过Deep Agents。要将另一个部署上的代理作为 [remote subagent](/oss/python/deepagents/async-subagents#http-transport-remote) 调用，请省略 `async` 并传递其 `graph_id`（对于托管深度代理，其 `name`）和 `url`。* **继承**：遵循与同步子代理相同的[inheritance rules](#what-a-subagent-inherits)。在`fork`模式下，它会复制对话，但保留自己的提示、工具和中间件。
* **沙箱和跟踪**：在单独的线程上以同一用户身份运行，共享代理的沙箱并嵌套在LangSmith中的代理跟踪下。使用[private threads](/langsmith/python/managed-deep-agents-identity)，不同的用户可以获得单独的沙箱。
* **渠道和批准**：结果返回给父代理，父代理决定在[channel](/langsmith/python/managed-deep-agents-channels)线程中回复什么。在 Slack 上，[approval interrupts](/langsmith/python/managed-deep-agents-tools#human-in-the-loop) 出现在线程内；在其他通道上，在 Studio 中或通过 API 恢复子代理的线程（请参阅[Respond to an interrupt](/langsmith/python/managed-deep-agents-tools#respond-to-an-interrupt)）。
* **评估**：`mda eval` 为声明异步子代理的代理启动本地代理服务器（需要 `managed-deepagents>=0.10.2` 和匹配的 `mda` CLI）。未声明异步子代理的评估代理不会收到异步 `general-purpose` 子代理或异步任务工具。

## 另请参阅

* [Subagents](/oss/python/deepagents/subagents)
* [Async subagents](/oss/python/deepagents/async-subagents)
* [Agent definition](/langsmith/python/managed-deep-agents-agent-definition)
* [Sandboxes](/langsmith/python/managed-deep-agents-sandboxes)
* [Channels](/langsmith/python/managed-deep-agents-channels)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-subagents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。