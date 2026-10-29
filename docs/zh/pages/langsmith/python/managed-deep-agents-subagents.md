<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Subagents | https://docs.langchain.com/langsmith/python/managed-deep-agents-subagents -->

# 子代理

将工作委派给内联运行或在托管深度代理后台运行的子代理。

为托管深度代理子代理分配专门的或上下文繁重的工作，例如研究主题、审查更改或使用异步子代理在后台运行长时间任务，同时代理不断与用户通信。每个子代理都有自己的提示和上下文窗口。它还可以使用自己的模型和工具。

> [!注意]
>
> 托管 Deep Agents 于 [LangSmith Cloud](/langsmith/cloud) **公开 [beta](/langsmith/release-stages)**。

子代理有两种类型：

|类型 |代理如何使用 |用它来 |
| - | - | - |
|子代理 |用 `task` 调用它并等待它的答案 |重点工作，座席在继续之前需要其结果 |
|异步子代理 |以 `start_async_task` 启动并继续工作；子代理完成后会报告 |代理无需等待的长时间运行或并行工作 |

子代理在代理的图表内运行。托管Deep Agents在同一部署中将每个异步子代理构建为其自己的图。两种类型都在代理的[sandbox](/langsmith/python/managed-deep-agents-sandboxes)中工作。有关子代理如何在开源 Deep Agents SDK 中工作的信息，请参阅 [Subagents](/oss/python/deepagents/subagents) 和 [Async subagents](/oss/python/deepagents/async-subagents)。

> [!注意]
>
> 异步子代理需要`managed-deepagents>=0.10.0`。

## 声明一个子代理将子代理定义添加到[agent definition](/langsmith/python/managed-deep-agents-agent-definition)中的`subagents`。每人需要一个`name`和一个`description`；代理使用描述来决定何时进行委派。要使子代理异步，请将 `async` 添加到其定义中：

**子代理**

```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_deep_agent

agent = define_deep_agent(
    name="research-assistant",
    model="openai:gpt-5.5",
    subagents=[
        {
            "name": "reviewer",
            "description": "Reviews a draft for accuracy and clarity.",
            "system_prompt": "Review the draft and list concrete fixes.",
        },
    ],
)
```

**异步子代理**

```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_deep_agent

agent = define_deep_agent(
    name="research-assistant",
    model="openai:gpt-5.5",
    subagents=[
        {
            "name": "researcher",
            "description": "Researches a topic in the background.",
            "system_prompt": "Research the topic and report your findings.",
            "async": True,
        },
    ],
)
```

## 子代理

代理使用`task`工具运行子代理并等待其答复。子代理在代理的图表内运行并在代理的[sandbox](/langsmith/python/managed-deep-agents-sandboxes)中工作。

每个代理还会获得一个 `general-purpose` 子代理来完成与声明的子代理不匹配的委派工作。参见[The general-purpose subagent](/oss/python/deepagents/subagents#the-general-purpose-subagent)。

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

## 异步子代理代理使用 `start_async_task` 启动异步子代理，并在子代理在其自己的线程上运行时继续工作。子代理在完成时会报告。

### 异步子代理如何运行

每个异步子代理在部署中显示为其自己的图，以代理和子代理命名，例如 `research-assistant--researcher`。 Managed Deep Agents 通过在构建时读取代理文件（而不是运行它）来查找异步子代理。将每个值直接写入 `subagents` 或变量中，并使用固定的 `name` 和 `async` 值。由函数或循环构建的异步子代理没有得到图形，并且代理无法启动。 [graph factory](/langsmith/python/managed-deep-agents-agent-definition#select-configuration-per-run)也可以声明异步子代理，只要它直接返回代理定义即可。

由 `mda dev` 或部署提供服务的代理还会获得 `general-purpose` 子代理的异步版本，因此代理可以在前台或后台运行委派的工作。

代理使用以下工具管理异步子代理：|工具|它有什么作用 |
| - | - |
| `start_async_task` |在自己的线程上启动异步子代理并立即返回任务 ID |
| `check_async_task` |获取任务的状态以及任务完成后的结果 |
| `update_async_task` |向任务发送新指令 |
| `cancel_async_task` |停止正在运行的任务 |
| `list_async_tasks` |列出代理的任务及其状态 |

这些工具附带异步 `general-purpose` 子代理，因此`mda dev` 或部署提供的每个代理都具有它们。使用 `mda eval` 运行的代理则不然。

### 当子代理完成时收到通知

异步子代理会自行报告，无论代理是忙碌、空闲还是等待批准。代理不需要使用 `check_async_task` 进行轮询：

|当子代理完成时，代理为 |会发生什么 |
| - | - |
|忙碌 |代理在每次模型调用之前检查其未完成的任务，以便在运行中获取结果 |
|闲置|子代理通过新的运行唤醒代理 |
|批准后暂停 |批准不予处理；一旦用户回答，代理就会得到结果 |

每个结果报告一次。在每次模型调用之前，代理会对每个未完成的任务进行一次状态检查，检查时间上限为 5 秒。如果子代理暂停等待批准，则代理会将其任务视为`waiting`，直到有人在子代理的线程上做出答复。参见[Answer approvals in channels](#answer-approvals-in-channels)。

### 配置异步子代理

请勿设置 `graph_id`、`url`、`headers` 或 `runnable`：托管 Deep Agents 自行构建并启动图表。这些选项传递到Deep Agents：

|选项 |默认|描述 |
| - | - | - |
| `update_strategy` | `"interrupt"` | `"enqueue"` 将后续操作排队到当前运行之后，而不是中断它 |
| `notify_parent` | `True` |当子代理完成且代理空闲时唤醒代理。设置为 `False` 自己处理结果，例如使用 `webhook` |
| `webhook` |未设置 |每当子代理运行完成时，代理服务器都会调用 URL，其中包含运行的线程 ID、运行 ID 和状态。参见[Deliver results through your app](/oss/python/deepagents/async-subagents#deliver-results-through-your-app)|
| `mode` | `"isolated"` | `"fork"` 使用代理对话的副本启动子代理 |

有关每个选项的行为方式，请参阅[Async subagents](/oss/python/deepagents/async-subagents)。

### 异步子代理继承了什么

异步子代理从代理继承的方式与 [subagent](#what-a-subagent-inherits) 相同。在 fork 模式下，它以代理对话的副本开始，但保留自己的提示、工具和中间件，因此它通常不会重用代理的[prompt cache](/oss/python/deepagents/async-subagents#fork-mode)。

### 共享沙箱和跟踪异步子代理在一个新线程上启动，与代理的线程分开。由于代理以同一用户身份启动它，因此它共享代理的沙箱。使用 [private threads](/langsmith/python/managed-deep-agents-identity)，来自不同用户的子代理运行将获得自己的沙箱。当它共享沙箱时，它会按原样使用代理的文件，并且仅刷新连接器凭据。如果代理尚未使用其沙箱，则子代理会创建它，并且代理稍后会使用相同的沙箱。

当跟踪打开时，异步子代理的运行将显示在 LangSmith 中的代理运行下方。

### 在渠道中回复批准

当代理在 [channel](/langsmith/python/managed-deep-agents-channels) 中运行时，其异步子代理向同一通道线程报告：

1. 用户请求代理在通道线程中工作，代理启动异步子代理。
2. 如果子代理暂停[approval](/langsmith/python/managed-deep-agents-tools#human-in-the-loop)，Slack 会在线程中显示请求，并在线程中应答该请求并恢复子代理。其他渠道不发布请求；像在 Studio 中或通过 API 恢复任何 [interrupt](/langsmith/python/managed-deep-agents-tools#respond-to-an-interrupt) 一样恢复子代理的线程。
3. 当子代理完成时，代理会获取其结果并在线程中进行回复：如果仍在工作，则在当前运行中进行回复；如果空闲，则在新的运行中进行回复。关闭父级通知会停止新的运行。托管 Deep Agents 不会将子代理的答复发布到频道；代理决定告诉用户什么。

### 评估代理

`mda eval` 在没有代理服务器的情况下运行，因此它无法评估声明异步子代理的代理。评估的代理也不会获得异步`general-purpose`子代理或异步任务工具。

## 另请参阅

* [Subagents](/oss/python/deepagents/subagents)
* [Async subagents](/oss/python/deepagents/async-subagents)
* [Agent definition](/langsmith/python/managed-deep-agents-agent-definition)
* [Sandboxes](/langsmith/python/managed-deep-agents-sandboxes)
* [Channels](/langsmith/python/managed-deep-agents-channels)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-subagents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。