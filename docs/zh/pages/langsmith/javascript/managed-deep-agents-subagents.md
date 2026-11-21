<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Subagents | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-subagents -->

# 子代理

将工作委派给内联运行或在托管深度代理后台运行的子代理。

为托管深度代理子代理分配专门的或上下文繁重的工作，例如研究主题、审查更改或使用异步子代理在后台运行长时间任务，同时代理不断与用户通信。每个子代理都有自己的提示和上下文窗口。它还可以使用自己的模型和工具。

> [!注意]
>
> 托管 Deep Agents 在 [LangSmith Cloud](/langsmith/cloud) 和 [Bring Your Own Cloud (BYOC)](/langsmith/byoc) **公共 [beta](/langsmith/release-stages)**。使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。

子代理有两种类型：

|类型 |代理如何使用 |用它来 |
| - | - | - |
|子代理 |用`task`调用它并等待它的答案 |重点工作，座席在继续之前需要其结果 |
|异步子代理 |用 `start_async_task` 启动并继续工作；子代理完成后会报告 |代理无需等待的长时间运行或并行工作 |子代理在代理的图表内运行。托管 Deep Agents 在同一部署中将每个异步子代理构建为其自己的图。两种类型都在代理的[sandbox](/langsmith/javascript/managed-deep-agents-sandboxes) 中工作。有关子代理如何在开源 Deep Agents SDK 中工作的信息，请参阅 [Subagents](/oss/javascript/deepagents/subagents) 和 [Async subagents](/oss/javascript/deepagents/async-subagents)。

> [!注意]
>
> 异步子代理需要`managed-deepagents>=0.10.0`。

## 通用子代理

每个代理都会获得一个内置的 `general-purpose` 子代理，即使您从 [agent definition](/langsmith/javascript/managed-deep-agents-agent-definition) 中省略 `subagents` 也是如此。代理可以在运行时将独立任务委托给它，包括[fanning out tasks in parallel](#fan-out-tasks-in-parallel)，而无需预先声明专门的子代理。

与自定义子代理不同，`general-purpose` 自动继承代理的技能及其模型和工具。与其他子代理一样，它使用自己的提示和上下文窗口运行，而不是代理的对话或[instructions](/langsmith/javascript/managed-deep-agents-instructions)。在每个任务的 `description` 中包含所有需要的上下文、约束和预期输出。

当任务需要不同的模型、受限工具集或可重用的系统提示时，声明自定义子代理。有关自定义选项，请参阅[The general-purpose subagent](/oss/javascript/deepagents/subagents#the-general-purpose-subagent)。

## 声明一个自定义子代理将子代理定义添加到代理定义中的`subagents`。每人需要一个`name`和一个`description`；代理使用描述来决定何时进行委派。要使子代理异步，请将 `async` 添加到其定义中：

> [选项卡] 子代理
>
> ```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { defineDeepAgent } from "managed-deepagents";
>
> export const agent = defineDeepAgent({
>   name: "research-assistant",
>   model: "openai:gpt-6.1-sol",
>   subagents: [
>     {
>       name: "reviewer",
>       description: "Reviews a draft for accuracy and clarity.",
>       systemPrompt: "Review the draft and list concrete fixes.",
>     },
>   ],
> });
> ```

> [选项卡] 异步子代理
>
> ```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { defineDeepAgent } from "managed-deepagents";
>
> export const agent = defineDeepAgent({
>   name: "research-assistant",
>   model: "openai:gpt-6.1-sol",
>   subagents: [
>     {
>       name: "researcher",
>       description: "Researches a topic in the background.",
>       systemPrompt: "Research the topic and report your findings.",
>       async: true,
>     },
>   ],
> });
> ```

## 子代理

代理使用 `task` 工具运行子代理并等待其答复。子代理在代理的图表内运行并在代理的[sandbox](/langsmith/javascript/managed-deep-agents-sandboxes)中工作。

### 子代理继承了什么

子代理从代理的配置开始，并替换其定义设置的内容：

|设置|行为 |
| - | - |
| `model`、`tools`、`permissions`、`interruptOn` |使用代理的设置，除非子代理设置了自己的 |
| `systemPrompt` |仅使用子代理的提示，而不使用代理的 [instructions](/langsmith/javascript/managed-deep-agents-instructions) |
| `skills` |仅加载子代理列出的技能；列表 `"/skills/"` 加载代理的 |
| `middleware`、`responseFormat` |仅使用子代理自己的 |
|内存|未加载|

分叉模式下的子代理从代理对话的副本开始，并且还使用代理的指令、中间件、技能和内存。参见[Choose a launch mode](/oss/javascript/deepagents/async-subagents#choose-a-launch-mode)。

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

在子代理上设置 `mcp` 以选择哪些 [MCP server](/langsmith/javascript/managed-deep-agents-mcp-connectors) 定义为其提供工具。 `mcp` 不影响子代理的其他工具。

> [!注意]
>
> 子代理 MCP 选择需要 `managed-deepagents` 版本 0.10.2 或更高版本。

| `mcp`值|子代理 |异步子代理 |
| - | - | - |
|省略 |继承代理工具|继承代理的 MCP 服务器 |
|定义列表 |仅使 MCP 工具不受这些定义的影响。代理还必须加载它们。 |仅加载这些定义 |
| `[]` 或 `null` |没有 MCP 工具 |没有 MCP 工具 |

异步子代理仅连接到它选择的服务器，并且仅询问其凭据。只有[graph factory](/langsmith/javascript/managed-deep-agents-agent-definition#select-configuration-per-run)可以在代理上设置`mcp`。

```ts agent.ts expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import {
  connections,
  defineDeepAgent,
  defineMcp,
  type ManagedServerRuntime,
} from "managed-deepagents";

const knowledge = defineMcp({
  servers: {
    langchainDocs: { transport: "http", url: "https://docs.langchain.com/mcp" },
    notion: {
      transport: "http",
      url: "https://mcp.notion.com/mcp",
      connection: connections.get("engineering-notion", { type: "user" }),
    },
  },
});

const planning = defineMcp({
  servers: {
    linear: {
      transport: "http",
      url: "https://mcp.linear.app/mcp",
      connection: connections.get("engineering-linear", { type: "user" }),
    },
  },
});

export function agent(_runtime: ManagedServerRuntime) {
  return defineDeepAgent({
    name: "research-assistant",
    model: "openai:gpt-5.5",
    mcp: [knowledge, planning],
    subagents: [
      {
        name: "researcher",
        description: "Answers questions from the docs and the team wiki.",
        systemPrompt: "Search the docs and Notion, and cite the pages you use.",
        mcp: [knowledge],
      },
      {
        name: "planner",
        description: "Turns findings into Linear issues.",
        systemPrompt: "Create one Linear issue for each follow-up.",
        mcp: [planning],
      },
    ],
  });
}
```

## 异步子代理

代理使用 `start_async_task` 启动异步子代理，并在子代理在其自己的线程上运行时继续工作。子代理在完成时会报告。

### 异步子代理如何运行

每个异步子代理在部署中显示为其自己的图，以代理和子代理命名，例如 `research-assistant--researcher`。托管 Deep Agents 通过在构建时读取代理文件（而不是运行它）来查找异步子代理。将每个值直接写入 `subagents` 或变量中，并使用固定的 `name` 和 `async` 值。由函数或循环构建的异步子代理没有得到图形，并且代理无法启动。 [graph factory](/langsmith/javascript/managed-deep-agents-agent-definition#select-configuration-per-run)也可以声明异步子代理，只要它直接返回代理定义即可。

由 `mda dev` 或部署提供服务的代理还会获得 `general-purpose` 子代理的异步版本，因此代理可以在前台或后台运行委派的工作。

代理使用以下工具管理异步子代理：|工具|它有什么作用 |
| - | - |
| `start_async_task` |在自己的线程上启动异步子代理并立即返回任务 ID |
| `check_async_task` |获取任务的状态以及任务完成后的结果 |
| `update_async_task` |向任务发送新指令 |
| `cancel_async_task` |停止正在运行的任务 |
| `list_async_tasks` |列出代理的任务及其状态 |

这些工具附带异步 `general-purpose` 子代理，因此 `mda dev` 或部署提供服务的每个代理都有它们。使用 `mda eval` 运行的代理则不然。

### 当子代理完成时收到通知

异步子代理会自行报告，无论代理是忙碌、空闲还是等待批准。代理不需要使用 `check_async_task` 进行轮询：

|当子代理完成时，代理为 |会发生什么 |
| - | - |
|忙碌 |代理在每次模型调用之前检查其未完成的任务，因此它会在运行中获取结果 |
|闲置|子代理通过新的运行唤醒代理 |
|批准后暂停 |批准不予处理；一旦用户回答，代理就会得到结果 |

每个结果报告一次。在每次模型调用之前，代理会对每个未完成的任务进行一次状态检查，检查时间上限为 5 秒。如果子代理暂停等待批准，则代理会将其任务视为`waiting`，直到有人在子代理的线程上做出答复。参见[Answer approvals in channels](#answer-approvals-in-channels)。

### 配置异步子代理

不要在异步子代理上设置 `graphId`、`url`、`headers` 或 `runnable`：托管 Deep Agents 自行构建并启动其图表。这些选项传递到Deep Agents：

|选项 |默认|描述 |
| - | - | - |
| `updateStrategy` | `"interrupt"` | `"enqueue"` 将后续操作排队到当前运行之后，而不是中断它 |
| `notifyParent` | `true` |当子代理完成且代理空闲时唤醒代理。设置为 `false` 自己处理结果，例如使用 `webhook` |
| `webhook` |未设置|每当子代理运行完成时，代理服务器都会调用 URL，其中包含运行的线程 ID、运行 ID 和状态。参见[Deliver results through your app](/oss/javascript/deepagents/async-subagents#deliver-results-through-your-app) |
| `mode` | `"isolated"` | `"fork"` 使用代理对话的副本启动子代理 |

有关每个选项的行为方式，请参阅[Async subagents](/oss/javascript/deepagents/async-subagents)。

要将另一个部署上的代理用作异步子代理，请使用其图形 ID 和 `url` 来声明它，并且不使用 `async`，并且托管 Deep Agents 将其原封不动地传递给 Deep Agents。对于托管深度代理，图 ID 是其 `name`。参见[remote subagents](/oss/javascript/deepagents/async-subagents#http-transport-remote)。

### 异步子代理继承了什么异步子代理从代理继承的方式与 [subagent](#what-a-subagent-inherits) 相同。在 fork 模式下，它以代理对话的副本开始，但保留自己的提示、工具和中间件，因此它通常不会重用代理的[prompt cache](/oss/javascript/deepagents/async-subagents#fork-mode)。

### 共享沙箱和跟踪

异步子代理在新线程上启动，与代理的线程分开。由于代理以同一用户身份启动它，因此它共享代理的沙箱。使用 [private threads](/langsmith/javascript/managed-deep-agents-identity)，来自不同用户的子代理运行将获得自己的沙箱。当它共享沙箱时，它会按原样使用代理的文件，并且仅刷新连接器凭据。如果代理尚未使用其沙箱，则子代理会创建它，并且代理稍后会使用相同的沙箱。

当跟踪打开时，异步子代理的运行将显示在 LangSmith 中的代理运行下方。

### 在渠道中回复批准

当代理在 [channel](/langsmith/javascript/managed-deep-agents-channels) 中运行时，其异步子代理向同一通道线程报告：1. 用户请求代理在通道线程中工作，代理启动异步子代理。
2. 如果子代理暂停[approval](/langsmith/javascript/managed-deep-agents-tools#human-in-the-loop)，Slack 会在线程中显示请求，并在线程中应答该请求以恢复子代理。其他渠道不发布请求；像在 Studio 中或通过 API 恢复任何 [interrupt](/langsmith/javascript/managed-deep-agents-tools#respond-to-an-interrupt) 一样恢复子代理的线程。
3. 当子代理完成时，代理会获取其结果并在线程中进行回复：如果仍在工作，则在当前运行中进行回复；如果空闲，则在新的运行中进行回复。关闭父级通知会停止新的运行。

托管 Deep Agents 不会将子代理的答复发布到频道；代理决定告诉用户什么。

### 评估代理

`mda eval` 在没有代理服务器的情况下运行，因此它无法评估声明异步子代理的代理。评估的代理也不会获得异步`general-purpose`子代理或异步任务工具。

## 另请参阅

* [Subagents](/oss/javascript/deepagents/subagents)
* [Async subagents](/oss/javascript/deepagents/async-subagents)
* [Agent definition](/langsmith/javascript/managed-deep-agents-agent-definition)
* [Sandboxes](/langsmith/javascript/managed-deep-agents-sandboxes)
* [Channels](/langsmith/javascript/managed-deep-agents-channels)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-subagents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。