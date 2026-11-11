<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Async subagents | https://docs.langchain.com/oss/python/deepagents/async-subagents -->

# 异步子代理

启动后台子代理，在主管继续与用户交互的同时运行

异步子代理允许主管代理启动立即返回的后台任务。当子代理同时工作时，主管可以继续与用户交互。主管可以随时检查任务的状态、发送后续指令或取消任务。在代理服务器上，子代理还会在完成、失败或需要输入时报告。主管不必检查。

它建立在 [subagents](/oss/python/deepagents/subagents) 的基础上，它同步运行并阻止主管直到完成。当任务长时间运行、可并行或需要中途引导时，请使用异步子代理。

要在托管代理中运行异步子代理，请使用 `async: true` 启用它们。参见[Async subagents in Managed Deep Agents](/langsmith/python/managed-deep-agents-subagents#async-subagents)。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph TB
    User([User]) <--> Supervisor[Supervisor Agent]

    Supervisor --> |launch| Researcher[Researcher]
    Supervisor --> |launch| Coder[Coder]

    Researcher -.-> |notify| Supervisor
    Coder -.-> |notify| Supervisor
```

> [!注意]
>
> 异步子代理可以在任何实现 [Agent Protocol](https://github.com/langchain-ai/agent-protocol) 的服务器上运行，例如 [LangSmith Deployments](/langsmith/deployment) 或自托管代理协议服务器。每个子代理独立于主管运行。 Supervisor通过SDK启动、检查、更新、取消。通知和 Webhook 需要 [Agent Server](/langsmith/agent-server)。

## 比较同步和异步子代理|尺寸|同步子代理 |异步子代理 |
| - | - | - |
| **执行模型** |主管阻塞直到子代理完成 |立即返回任务ID；主管继续|
| **它在哪里运行** |在主管的运行中|在服务器（代理服务器或另一个代理协议服务器）上的自己的线程上 |
| **并发** |并行但阻塞 |并行和非阻塞|
| **结果** |作为工具结果返回 |在代理服务器上，子代理通知主管；否则主管会致电 `check_async_task` |
| **任务中期更新** |不可能|通过`update_async_task`发送后续指令 |
| **取消** |不阻止主管就不可能 |通过`cancel_async_task`取消任务 |
| **有状态** |无状态——调用之间没有持久状态|有状态——跨交互在自己的线程上维护状态
| **最适合** |代理在继续之前应等待结果的任务 |在聊天中以交互方式管理长时间运行的复杂任务 |

## 配置异步子代理

将异步子代理定义为 [⟦T19⟧](https://reference.langchain.com/python/deepagents/middleware/async_subagents/AsyncSubAgent) 规范列表，每个都指向一个代理协议服务器：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import AsyncSubAgent, create_deep_agent

async_subagents = [
    AsyncSubAgent(
        name="researcher",
        description="Research agent for information gathering and synthesis",
        graph_id="researcher",
        # No url → ASGI transport (co-deployed in the same deployment)
    ),
    AsyncSubAgent(
        name="coder",
        description="Coding agent for code generation and review",
        graph_id="coder",
        # url="https://coder-deployment.langsmith.dev"  # Optional: HTTP transport for remote
    ),
]

agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    subagents=async_subagents,
)
```|领域|类型 |描述 |
| - | - | - |
| `name` | `str` |必需的。唯一标识符。主管在启动任务时使用它。 |
| `description` | `str` |必需的。该子代理的作用。主管用它来决定委托给哪个代理。 |
| `graph_id` | `str` |必需的。代理协议服务器上的图形 ID（或助理 ID）。对于基于 LangGraph 的部署，这必须与在 `langgraph.json` 中注册的图表匹配。 |
| `url` | `str` |选修的。省略时，使用 ASGI 传输（进程中）。设置后，使用 HTTP 传输到远程代理协议服务器。 |
| `headers` | `dict[str, str]` |选修的。用于向远程服务器发出请求的附加标头。用于使用自托管代理协议服务器进行自定义身份验证。 |
| `mode` | `"isolated" \| "fork"` |选修的。控制子代理在启动时接收的对话上下文。默认为`"isolated"`。参见[Choose a launch mode](#choose-a-launch-mode)。 |
| `update_strategy` | `"interrupt" \| "enqueue"` |选修的。 `update_async_task` 如何在运行期间发送后续信息。默认为`"interrupt"`。参见[Understand the lifecycle](#understand-the-lifecycle)。 |
| `webhook` | `str` |选修的。每当此子代理运行完成时，代理服务器都会调用 URL。参见[Deliver results through your app](#deliver-results-through-your-app)。 || `notify_parent` | `bool` |选修的。当子代理完成或在主管空闲时失败时，子代理是否可以唤醒主管。默认为`True`。 |

对于基于 LangGraph 的部署，请在同一 `langgraph.json` 中注册所有图表以进行共同部署设置：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "graphs": {
    "supervisor": "./src/supervisor.py:graph",
    "researcher": "./src/researcher.py:graph",
    "coder": "./src/coder.py:graph"
  }
}
```

## 使用异步子代理工具

配置异步子代理时，[Deep Agents stack](/oss/python/deepagents/customization#deep-agents-stack)中包含的[⟦T44⟧](https://reference.langchain.com/python/deepagents/middleware/async_subagents/AsyncSubAgentMiddleware)为主管提供了五种工具：

|工具|目的|返回|
| - | - | - |
| `start_async_task` |启动新的后台任务 |任务 ID（立即）|
| `check_async_task` |获取任务的当前状态，及其结果、错误或询问用户的内容 |状态，加上结果、错误或待处理的请求 |
| `update_async_task` |向任务发送新指令 |确认后续已开始或已排队 |
| `cancel_async_task` |停止任务 |确认|
| `list_async_tasks` |列出跟踪的任务及其实时状态，可以选择按状态过滤 |每个任务的状态（无结果） |

主管的法学硕士将这些工具称为任何其他工具。中间件自动处理线程创建、运行管理和状态持久性。

### 了解生命周期

典型的交互遵循以下顺序：> [!注意]
>
> 在代理服务器上，主管不需要检查任务：当子代理完成时，任务会通知主管。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sequenceDiagram
    participant User
    participant Supervisor
    participant Researcher

    User->>Supervisor: "Research topic X"
    Supervisor->>Researcher: start_async_task("topic X")
    Researcher-->>Supervisor: task_id (immediately)
    Supervisor-->>User: "I have started the research. You can keep chatting while it runs."

    Note over User,Supervisor: User keeps chatting with the supervisor
    Note over Researcher: Researcher working...

    Researcher-->>Supervisor: notification: success + result
    Note over Supervisor: Woken by the notification
    Supervisor-->>User: "The research is done. Here is what it found..."
```

* **Launch** 在服务器上创建一个新线程，并使用由 [launch mode](#choose-a-launch-mode) 确定的输入开始运行。隔离模式仅发送任务描述。分叉模式还会发送家长的有效对话历史记录。 `start_async_task` 返回线程 ID 作为任务 ID。
* **Check** 获取任务的当前状态，以及其结果、错误或询问用户的内容。
* **更新** 在同一线程上创建新的运行。默认情况下，它会中断先前的运行，并且子代理将使用完整的对话历史记录和新指令重新启动。任务 ID 保持不变。
* **取消** 在服务器上调用`runs.cancel()`，并将任务标记为`"cancelled"`。
* **List** 迭代所有跟踪的任务。对于非终端任务，它并行从服务器获取实时状态。对于终端状态（`success`、`error`、`timeout`、`cancelled`、`interrupted`），它使用缓存的状态。要让后续人员等待，请设置`update_strategy="enqueue"`。 **更新**然后将新的运行排在当前运行的后面，并且任务是`pending`直到它开始。取消任务还会取消仍处于活动状态的早期运行。
如果当前运行在后续操作开始之前暂停以进行输入或批准，则后续操作仍会开始并且该请求将被删除。

> [!注意]
>
> `update_strategy` 需要 `deepagents>=0.7.30`。位于[**beta**](/oss/python/versioning)； API 和行为可能会在版本之间发生变化。

如果子代理暂停输入或批准，**检查**和**列表**将其报告为 `waiting`。更新 `waiting` 任务会删除其挂起的请求，而取消一个任务只会将其标记为 `"cancelled"`，因为它没有活动的运行。参见[Handle subagents waiting for input](#handle-subagents-waiting-for-input)。

在[Agent Server](/langsmith/agent-server)，子代理在完成、失败或需要输入时通知主管。当主管忙碌时，它会在下一次模型调用之前收到这些通知。完成或失败的子代理会通过新的运行唤醒空闲的主管（如果两者都在[same deployment](#single-deployment)上）。只有深度代理的子代理才能唤醒空闲的主管。等待输入的子代理不会唤醒主管。主管在下次运行时会收到该通知。> [!注意]
>
> 任务通知需要`deepagents>=0.7.26`，通知元数据需要`deepagents>=0.7.33`。他们在[**beta**](/oss/python/versioning)； API 和行为可能会在版本之间发生变化。

主管以`HumanMessage` 的形式收到每条通知。通知可以包括图像和其他多模式媒体。每个通知都携带元数据：其`source`是`"async_subagent"`，其`data`是[⟦T71⟧](https://reference.langchain.com/python/deepagents/middleware/async_subagents/TaskEvent)（`task_id`、`agent_name`、`status`、`run_id`）。使用 `get_notification_metadata` 读取它，以不同于用户消息的方式显示通知：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_core.messages import get_notification_metadata

for message in state["messages"]:
    metadata = get_notification_metadata(message)
    if metadata and metadata["source"] == "async_subagent":
        event = metadata["data"]
        print(event["agent_name"], event["status"])  # success, error, timeout, cancelled, or waiting
```

> [!注意]
>
> 异步子代理的拒绝结果需要`deepagents>=0.7.33`。

如果子代理的运行以模型拒绝结束，主管会收到一个简短的结果，而不是拒绝本身。参见[Model refusals](/oss/python/deepagents/subagents#model-refusals)。

### 通过您的应用程序交付结果

> [!注意]
>
> `webhook` 和 `notify_parent` 需要 `deepagents>=0.7.30`。 `notify_parent`在[**beta**](/oss/python/versioning)； API 和行为可能会在版本之间发生变化。

设置 `webhook` 以使代理服务器在子代理运行完成时调用您的应用程序。该调用包括运行的线程 ID、运行 ID、状态和元数据，包括 `parent_thread_id` 和 `subagent_name`。要通过应用程序提供结果而不是唤醒主管，还要关闭家长通知。 Supervisor 在运行时仍会收到通知。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import AsyncSubAgent

async_subagents = [
    AsyncSubAgent(
        name="researcher",
        description="Research agent for information gathering and synthesis",
        graph_id="researcher",
        webhook="https://my-app.example.com/hooks/subagent-finished",
        notify_parent=False,  # Your app delivers the result
    ),
]
```## 处理等待输入的子代理

> [!注意]
>
> `waiting` 状态需要`deepagents>=0.7.26`。位于[**beta**](/oss/python/versioning)； API 和行为可能会在版本之间发生变化。

当子代理暂停输入或批准`interrupt()`或[human-in-the-loop](/oss/python/deepagents/human-in-the-loop)时，`check_async_task`和`list_async_tasks`将其报告为`waiting`。只有`check_async_task`也返回其挂起的中断。主管不能代表用户答复或批准。该请求是针对用户的。

您的应用程序在子代理自己的线程上回答它。任务 ID 是子代理的线程 ID：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph_sdk import get_client


async def answer_waiting_subagent(task_id: str, graph_id: str, answer: object) -> None:
    client = get_client()  # Pass url=... for a subagent on another deployment
    thread = await client.threads.get(task_id)  # The task ID is the subagent's thread ID
    interrupt = next(iter(thread["interrupts"].values()))[0]
    await client.runs.create(
        task_id,
        graph_id,
        command={"resume": {interrupt["id"]: answer}},
    )
```

当子代理完成回答后，主管会像往常一样收到通知。如果子代理需要来自主管而不是用户的信息，请让它在结果中询问。主管回复`update_async_task`。

## 了解状态管理

任务元数据存储在主管图上的专用状态通道 (`async_tasks`) 中，与消息历史记录分开。这很重要，因为当上下文窗口填满时，深度代理[compact their message history](/oss/python/deepagents/context-engineering#summarization)。如果任务 ID 仅存在于工具消息中，则它们会在压缩过程中丢失。专用通道确保主管可以随时通过`list_async_tasks`回忆自己的任务，即使经过多轮总结。每个跟踪的任务都会记录任务 ID、代理名称、线程 ID、运行 ID、状态和时间戳（`created_at`、`last_checked_at`、`last_updated_at`）。

### 查找主管的子代理线程

> [!注意]
>
> 话题标签需要`deepagents>=0.7.26`。位于[**beta**](/oss/python/versioning)； API 和行为可能会在版本之间发生变化。

`start_async_task` 使用`metadata={"parent_thread_id": ...}`（主管的线程 ID）创建每个子代理线程。使用它来查找主管的子代理线程，或在子代理的图工厂中读取主管的线程：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_core.runnables import RunnableConfig
from langgraph_sdk import get_client

from deepagents import create_deep_agent


async def find_subagent_threads(parent_thread_id: str) -> list[dict]:
    client = get_client()
    return await client.threads.search(metadata={"parent_thread_id": parent_thread_id})


def researcher(config: RunnableConfig):
    # Set when a supervisor launched this run with `start_async_task`
    parent_thread_id = (config.get("metadata") or {}).get("parent_thread_id")
    return create_deep_agent(
        model="openai:gpt-5.5",
        system_prompt="You research topics thoroughly.",
    )
```

例如，子代理可以通过使用 `parent_thread_id` 查找来重用主管的 [thread-scoped sandbox](/oss/python/deepagents/sandboxes#thread-scoped-default)。检查调用者是否可以首先访问该线程，因为有权访问该线程的任何人都可以编辑其元数据。

## 选择交通工具

### ASGI 传输（共同部署）

当子代理规范省略 `url` 字段时，LangGraph SDK 使用 ASGI 传输 - SDK 调用通过进程内函数调用而不是 HTTP 进行路由。对于基于LangGraph的部署，这要求两个图都注册在同一个`langgraph.json`中。

ASGI 传输消除了网络延迟，并且不需要额外的身份验证配置。子代理仍然作为具有自己状态的单独线程运行。这是推荐的默认值。

### HTTP 传输（远程）添加 `url` 字段以切换到 HTTP 传输，其中 SDK 调用通过网络传输到远程代理协议服务器：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import AsyncSubAgent

AsyncSubAgent(
    name="researcher",
    description="Research agent",
    graph_id="researcher",
    url="https://my-research-deployment.langsmith.dev",
)
```

对于 LangGraph 部署，身份验证由 LangGraph SDK 使用环境变量中的 `LANGSMITH_API_KEY`（或 `LANGGRAPH_API_KEY`）进行处理。自承载代理协议服务器可能使用不同的身份验证机制。

当子代理需要独立扩展、不同的资源配置文件或由不同的团队维护时，请使用 HTTP 传输。

## 选择启动模式

每个 [⟦T108⟧](https://reference.langchain.com/python/deepagents/middleware/async_subagents/AsyncSubAgent) 规范上的 `mode` 字段控制任务启动时子代理接收的对话上下文。

|模式|行为 |
| - | - |
| `"isolated"`（默认）|仅发送委派的任务描述。子代理重新开始，不知道父代理的对话历史记录。 |
| `"fork"` |在启动时发送家长对话的快照，然后发送任务说明。子代理可以在后台工作时使用该上下文。 |

`"isolated"` 是大多数任务的正确选择。当子代理需要建立上下文时使用`"fork"`。例如，使用 `"fork"` 作为后台起草代理，该代理应以对话中已设置的风格和声音进行书写。

### 分叉模式> [!警告]
>
> Fork 模式是实验性的，可能会在未来的版本中发生变化。

在任何 `AsyncSubAgent` 规格上设置 `mode="fork"`：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
async_subagents=[
    {
        "name": "drafter",
        "description": "Drafts documents based on the conversation context",
        "graph_id": "drafter",
        "mode": "fork",
    }
]
```

启动时，`start_async_task` 发送父级有效对话历史记录的快照，后跟任务描述。如果父级已压缩其历史记录，则快照包含该压缩上下文，而不是每条原始消息。来自父级的后续消息不会转发给子级。

子代理在新的服务器线程上启动。 Fork模式发送对话消息作为运行输入；它不会复制父级的检查点历史记录或所有父级状态。元数据可以将新线程与其主管相关联，但该关联本身并不传输对话上下文。

**提示缓存重用。** 要获得对分叉对话前缀的缓存命中，请使用与父代理相同的模型、系统提示、工具和提示处理中间件来配置远程代理。 Fork模式复制对话历史记录；它不会同步这些设置。匹配配置是必要的，但还不够：呈现的前缀必须匹配，缓存命中取决于提供者。

## 选择部署拓扑

### 单一部署单一部署意味着所有代理都使用 ASGI 传输共同部署在同一台服务器上。对于基于LangGraph的部署，将所有图表注册在一个`langgraph.json`中。这是推荐的起点——管理一台服务器，代理之间的网络延迟为零。

### 拆分部署

一台服务器上的主管，另一台服务器上的子代理通过 HTTP 传输。当子代理需要不同的计算配置文件或独立扩展时使用。

### 混合动力

在混合部署中，一些子代理通过 ASGI 共同部署，其他子代理通过 HTTP 远程部署：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import AsyncSubAgent

async_subagents = [
    AsyncSubAgent(
        name="researcher",
        description="Research agent",
        graph_id="researcher",
        # No url → ASGI (co-deployed)
    ),
    AsyncSubAgent(
        name="coder",
        description="Coding agent",
        graph_id="coder",
        url="https://coder-deployment.langsmith.dev",
        # url present → HTTP (remote)
    ),
]
```

## 最佳实践

### 调整工人池规模以适应当地发展

当使用 `langgraph dev` 在本地运行时，增加工作池以适应并发子代理运行。每个活动运行都会占用一个工作槽。具有 3 个并发子代理任务的主管需要 4 个插槽（1 个主管 + 3 个子代理）。配置不足会导致启动排队。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langgraph dev --n-jobs-per-worker 10
```

### 编写清晰的子代理描述

主管使用描述来决定启动哪个子代理。具体并以行动为导向：

```python Good theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import AsyncSubAgent

AsyncSubAgent(
    name="researcher",
    description="Conducts in-depth research using web search. Use for questions requiring multiple searches and synthesis.",
    graph_id="researcher",
)
```

```python Bad theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import AsyncSubAgent

AsyncSubAgent(
    name="helper",
    description="helps with stuff",
    graph_id="helper",
)
```

### 跟踪子代理运行使用基于 LangGraph 的部署时，每个异步子代理运行都是标准 LangGraph 运行，在 LangSmith 中完全可见。主管的跟踪显示其 `start_async_task`、`check_async_task`、`update_async_task`、`cancel_async_task` 和 `list_async_tasks` 调用。默认情况下，每个子代理运行显示为单独的跟踪。使用线程 ID（任务 ID）将子代理的跟踪与主管的跟踪相匹配。

同一部署上的子代理还会接收主管的跟踪标头。要显示嵌套在主管跟踪下的子代理运行，请让子代理的图表采用这些跟踪标头。参见[distributed tracing on Agent Server](/langsmith/agent-server-distributed-tracing)。

## 故障排除

### 启动后立即进行主管民意调查

**问题**：主管在启动后立即循环调用`check_async_task`，将异步执行变成阻塞。

**解决办法**：主管不需要检查。在代理服务器上，当任务完成、失败或需要输入时，子代理会通知主管。 `start_async_task`工具描述已经告诉模型不要在启动后立即检查状态。如果轮询持续存在，请在主管的系统提示中强调这一点：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import create_deep_agent

agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    system_prompt="""...your instructions...

    After launching an async subagent, ALWAYS return control to the user.
    Never call check_async_task immediately after launch.""",
    subagents=async_subagents,
)
```

### 主管报告过时状态**问题**：主管报告对话早期的任务状态，而不是再次检查任务。

**解决方案**： `check_async_task` 和 `list_async_tasks` 工具描述告诉模型对话历史记录中的状态已过时。如果仍然出现这种情况，请添加指令以在报告任务状态之前调用`check_async_task`或`list_async_tasks`。打开通知后，主管无需检查即可了解每个状态变化。

### 任务 ID 查找失败

**问题**：主管截断或重新格式化任务ID，导致`check_async_task`或`cancel_async_task`失败。

**解决方案**：每个工具的任务 ID 参数告诉模型传递完整的任务 ID。如果截断仍然存在，则原因通常是特定于模型的。尝试不同的模型，或将“始终显示完整的任务\_id，从不截断或缩写它”添加到系统提示符中。

### 子代理启动队列而不是运行

**问题**：启动子代理挂起或需要很长时间才能启动。

**解决方案**：工作池可能已耗尽。使用 `--n-jobs-per-worker` 增加池大小。参见[Size the worker pool](#size-the-worker-pool-for-local-development)。

## 参考实现[async-deep-agents](https://github.com/langchain-ai/async-deep-agents) 存储库包含部署到 LangSmith 部署的 Python 和 TypeScript 工作示例。它演示了一个主管以及作为后台任务运行的研究员和编码器子代理。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/async-subagents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。