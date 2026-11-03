<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Async subagents | https://docs.langchain.com/oss/javascript/deepagents/async-subagents -->

# 异步子代理

启动后台子代理，在主管继续与用户交互的同时运行

异步子代理允许主管代理启动立即返回的后台任务，因此主管可以在子代理同时工作时继续与用户交互。主管可以随时检查进度、发送后续指令或取消任务。

它建立在 [subagents](/oss/javascript/deepagents/subagents) 的基础上，它同步运行并阻止主管直到完成。当任务长时间运行、可并行或需要中途引导时，请使用异步子代理。

在代理服务器上，主管还会了解任务何时完成、失败或需要输入，因此无需进行检查。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph TB
    User([User]) --> Supervisor[Supervisor Agent]

    Supervisor --> |launch| Researcher[Researcher]
    Supervisor --> |launch| Coder[Coder]

    Researcher --> |check| Supervisor
    Coder --> |check| Supervisor
```

> [!注意]
>
> 异步子代理与任何实现 [Agent Protocol](https://github.com/langchain-ai/agent-protocol) 的服务器进行通信。您可以使用[LangSmith Deployments](/langsmith/deployment)，或自行托管任何与代理协议兼容的服务器。每个子代理独立于主管运行，主管通过 SDK 控制子代理的启动、检查、更新和取消。

## 何时使用异步子代理|尺寸|同步子代理 |异步子代理 |
| - | - | - |
| **执行模型** |主管阻塞直到子代理完成 |立即返回作业ID；主管继续|
| **并发** |并行但阻塞 |并行和非阻塞|
| **任务中期更新** |不可能|通过`update_async_task`发送后续指令 |
| **取消** |不可能|通过`cancel_async_task`取消正在运行的任务 |
| **有状态** |无状态——调用之间没有持久状态|有状态——跨交互在自己的线程上维护状态
| **最适合** |代理在继续之前应等待结果的任务 |在聊天中以交互方式管理长时间运行的复杂任务 |

## 配置异步子代理

将异步子代理定义为[⟦T29⟧](https://reference.langchain.com/javascript/deepagents/agent/createDeepAgent)规范列表，每个都指向一个代理协议服务器：

```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent, type AsyncSubAgent } from "deepagents";

const asyncSubagents: AsyncSubAgent[] = [
  {
    name: "researcher",
    description: "Research agent for information gathering and synthesis",
    graphId: "researcher",
    // No url → ASGI transport (co-deployed in the same deployment)
  },
  {
    name: "coder",
    description: "Coding agent for code generation and review",
    graphId: "coder",
    // url: "https://coder-deployment.langsmith.dev"  // Optional: HTTP transport for remote
  },
];

const agent = createDeepAgent({
  model: "google:gemini-3.6-flash",
  subagents: [...asyncSubagents],
});
```

```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent, type AsyncSubAgent } from "deepagents";

const asyncSubagents: AsyncSubAgent[] = [
  {
    name: "researcher",
    description: "Research agent for information gathering and synthesis",
    graphId: "researcher",
    // No url → ASGI transport (co-deployed in the same deployment)
  },
  {
    name: "coder",
    description: "Coding agent for code generation and review",
    graphId: "coder",
    // url: "https://coder-deployment.langsmith.dev"  // Optional: HTTP transport for remote
  },
];

const agent = createDeepAgent({
  model: "openai:gpt-5.5",
  subagents: [...asyncSubagents],
});
```

```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent, type AsyncSubAgent } from "deepagents";

const asyncSubagents: AsyncSubAgent[] = [
  {
    name: "researcher",
    description: "Research agent for information gathering and synthesis",
    graphId: "researcher",
    // No url → ASGI transport (co-deployed in the same deployment)
  },
  {
    name: "coder",
    description: "Coding agent for code generation and review",
    graphId: "coder",
    // url: "https://coder-deployment.langsmith.dev"  // Optional: HTTP transport for remote
  },
];

const agent = createDeepAgent({
  model: "anthropic:claude-sonnet-5",
  subagents: [...asyncSubagents],
});
```

```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent, type AsyncSubAgent } from "deepagents";

const asyncSubagents: AsyncSubAgent[] = [
  {
    name: "researcher",
    description: "Research agent for information gathering and synthesis",
    graphId: "researcher",
    // No url → ASGI transport (co-deployed in the same deployment)
  },
  {
    name: "coder",
    description: "Coding agent for code generation and review",
    graphId: "coder",
    // url: "https://coder-deployment.langsmith.dev"  // Optional: HTTP transport for remote
  },
];

const agent = createDeepAgent({
  model: "openrouter:z-ai/glm-5.2",
  subagents: [...asyncSubagents],
});
```

```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent, type AsyncSubAgent } from "deepagents";

const asyncSubagents: AsyncSubAgent[] = [
  {
    name: "researcher",
    description: "Research agent for information gathering and synthesis",
    graphId: "researcher",
    // No url → ASGI transport (co-deployed in the same deployment)
  },
  {
    name: "coder",
    description: "Coding agent for code generation and review",
    graphId: "coder",
    // url: "https://coder-deployment.langsmith.dev"  // Optional: HTTP transport for remote
  },
];

const agent = createDeepAgent({
  model: "fireworks:accounts/fireworks/models/glm-5p2",
  subagents: [...asyncSubagents],
});
```

```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent, type AsyncSubAgent } from "deepagents";

const asyncSubagents: AsyncSubAgent[] = [
  {
    name: "researcher",
    description: "Research agent for information gathering and synthesis",
    graphId: "researcher",
    // No url → ASGI transport (co-deployed in the same deployment)
  },
  {
    name: "coder",
    description: "Coding agent for code generation and review",
    graphId: "coder",
    // url: "https://coder-deployment.langsmith.dev"  // Optional: HTTP transport for remote
  },
];

const agent = createDeepAgent({
  model: "baseten:zai-org/GLM-5.2",
  subagents: [...asyncSubagents],
});
```

```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent, type AsyncSubAgent } from "deepagents";

const asyncSubagents: AsyncSubAgent[] = [
  {
    name: "researcher",
    description: "Research agent for information gathering and synthesis",
    graphId: "researcher",
    // No url → ASGI transport (co-deployed in the same deployment)
  },
  {
    name: "coder",
    description: "Coding agent for code generation and review",
    graphId: "coder",
    // url: "https://coder-deployment.langsmith.dev"  // Optional: HTTP transport for remote
  },
];

const agent = createDeepAgent({
  model: "ollama:north-mini-code-1.0",
  subagents: [...asyncSubagents],
});
```|领域|类型 |描述 |
| - | - | - |
| `name` | `string` |必需的。唯一标识符。主管在启动任务时使用它。 |
| `description` | `string` |必需的。该子代理的作用。主管用它来决定委托给哪个代理。 |
| `graphId` | `string` |必需的。代理协议服务器上的图形 ID（或助理 ID）。对于基于 LangGraph 的部署，这必须与在 `langgraph.json` 中注册的图表匹配。 |
| `url` | `string` |选修的。省略时，与同一代理服务器部署进行对话（服务器为运行图提供的地址）。为远程服务器设置`url`，或者当您的代理服务器尚未提供该地址时。参见[Choose a transport](#choose-a-transport)。 |
| `headers` | `Record<string, string>` |选修的。用于向远程服务器发出请求的附加标头。用于使用自托管代理协议服务器进行自定义身份验证。 |
| `mode` | `"isolated" \| "fork"` |选修的。控制子代理在启动时接收的对话上下文。默认为`"isolated"`。参见[Choose a launch mode](#choose-a-launch-mode)。 |
| `updateStrategy` | `"interrupt" \| "enqueue"` |选修的。 `update_async_task` 如何在跑步活动期间发送后续信息。默认为`"interrupt"`。参见[Understand the lifecycle](#understand-the-lifecycle)。 |
| `webhook` | `string` |选修的。每当此子代理运行完成时，代理服务器都会调用 URL。参见[Deliver results through your app](#deliver-results-through-your-app)。 || `notifyParent` | `boolean` |选修的。子代理在主管空闲时完成时是否可以唤醒主管。默认为`true`。 |

对于基于 LangGraph 的部署，请在同一 `langgraph.json` 中注册所有图形以进行共同部署设置：

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

配置异步子代理时，[Deep Agents stack](/oss/javascript/deepagents/customization#deep-agents-stack) 中包含的 [⟦T55⟧](https://reference.langchain.com/javascript/deepagents/agent/createDeepAgent) 为主管提供了五种工具：

|工具|目的|返回|
| - | - | - |
| `start_async_task` |启动新的后台任务 |任务 ID（立即）|
| `check_async_task` |获取任务的当前状态和结果 |状态+结果（如果完成）|
| `update_async_task` |向正在运行的任务发送新指令 |确认+更新状态|
| `cancel_async_task` |停止正在运行的任务 |确认|
| `list_async_tasks` |列出所有跟踪任务的实时状态 |所有任务摘要 |

主管的法学硕士将这些工具称为任何其他工具。中间件自动处理线程创建、运行管理和状态持久性。

### 了解生命周期

典型的交互遵循以下顺序：

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sequenceDiagram
    participant User
    participant Supervisor
    participant Platform as Agent Protocol Server

    User->>Supervisor: "Research topic X"
    Supervisor->>Platform: launch(researcher, "topic X")
    Platform-->>Supervisor: task_id: abc123

    Note over Platform: Researcher working...

    Supervisor-->>User: "Started task abc123"

    Note over User,Platform: User continues conversation

    User->>Supervisor: "How's the research going?"
    Supervisor->>Platform: check(abc123)
    Platform-->>Supervisor: status: success, result: "findings..."
    Supervisor-->>User: "Here are the results"
```* **Launch** 在服务器上创建一个新线程，并使用由 [launch mode](#choose-a-launch-mode) 确定的输入开始运行。隔离模式仅发送任务描述； fork模式还发送父级的有效对话历史记录。线程 ID 作为任务 ID 返回。主管将此 ID 报告给用户，并且不会轮询是否完成。
* **Check** 获取当前运行状态。如果运行成功，它将检索线程状态以提取子代理的最终输出。如果仍在运行，它会向用户报告该情况。
* **更新** 在同一线程上创建新的运行。默认情况下，它会中断先前的运行，并且子代理将使用完整的对话历史记录和新指令重新启动。任务 ID 保持不变。
* **取消** 在服务器上调用`runs.cancel()`，并将任务标记为`"cancelled"`。
* **List** 迭代所有跟踪的任务。对于非终端任务，它并行从服务器获取实时状态。终端状态（`success`、`error`、`cancelled`）从缓存中返回。要让后续人员等待，请设置`updateStrategy: "enqueue"`。 **更新**然后将新的运行排在当前运行的后面，并且任务是`pending`直到它开始。取消任务还会取消仍处于活动状态的早期运行。
如果当前运行在后续操作开始之前暂停以进行输入或批准，则后续操作仍会开始并且该请求将被删除。

> [!注意]
>
> `updateStrategy` 需要 `deepagents>=1.16.0`。位于[**beta**](/oss/javascript/versioning)； API 和行为可能会在版本之间发生变化。

如果子代理暂停输入或批准，**检查**和**列表**将其报告为 `waiting`。更新 `waiting` 任务会删除其挂起的请求，取消任务只会将其标记为 `"cancelled"`，因为它没有活动的运行。参见[Handle subagents waiting for input](#handle-subagents-waiting-for-input)。

当在 [Agent Protocol](https://github.com/langchain-ai/agent-protocol) 服务器上运行时，子代理会在完成时自动更新 Supervisor。如果对主管和子代理使用[single deployment](#single-deployment)，子代理将在主管空闲时唤醒主管；否则它会在下次运行开始时收到更新。

> [!注意]
>
> 任务通知需要`deepagents>=1.16.0`。他们在[**beta**](/oss/javascript/versioning)； API 和行为可能会在版本之间发生变化。通知以 `HumanMessage` 返回给主管。它们可以包括图像和其他多模式媒体。该消息在 `additional_kwargs.deepagents_notification` 中携带 `TaskEvent` (`task_id`、`agent_name`、`status`、`run_id`)，因此您的应用可以以不同于用户消息的方式显示通知：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
for (const message of state.messages) {
  const event = message.additional_kwargs.deepagents_notification as
    | { agent_name: string; status: string }
    | undefined;
  if (event) {
    console.log(event.agent_name, event.status); // success, error, timeout, cancelled, or waiting
  }
}
```

### 通过您的应用程序交付结果

> [!注意]
>
> `webhook` 和 `notifyParent` 需要 `deepagents>=1.16.0`。 `notifyParent`位于[**beta**](/oss/javascript/versioning)； API 和行为可能会在版本之间发生变化。

设置 `webhook` 以使代理服务器在子代理运行完成时调用您的应用程序。该调用包括运行的线程 ID、运行 ID、状态和元数据，包括 `parent_thread_id` 和 `subagent_name`。要通过应用程序提供结果而不是唤醒主管，还要关闭家长通知。当子代理运行时，主管仍然会收到子代理的更新。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import type { AsyncSubAgent } from "deepagents";

const asyncSubagents: AsyncSubAgent[] = [
  {
    name: "researcher",
    description: "Research agent for information gathering and synthesis",
    graphId: "researcher",
    webhook: "https://my-app.example.com/hooks/subagent-finished",
    notifyParent: false, // Your app delivers the result
  },
];
```

## 处理等待输入的子代理

> [!注意]
>
> `waiting` 状态需要`deepagents>=1.16.0`。位于[**beta**](/oss/javascript/versioning)； API 和行为可能会在版本之间发生变化。

当子代理暂停输入或批准`interrupt()`或[human-in-the-loop](/oss/javascript/deepagents/human-in-the-loop)时，**检查**和**列表**工具将其报告为`waiting`及其挂起的中断。主管不能代表用户答复或批准。该请求是针对用户的。您的应用程序在子代理自己的线程上回答它。任务 ID 是子代理的线程 ID：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "@langchain/langgraph-sdk";

async function answerWaitingSubagent(
  taskId: string,
  graphId: string,
  answer: unknown,
): Promise<void> {
  const client = new Client(); // Pass apiUrl for a subagent on another deployment
  const thread = await client.threads.get(taskId); // The task ID is the subagent's thread ID
  const [interrupt] = Object.values(thread.interrupts ?? {})[0];
  await client.runs.create(taskId, graphId, {
    command: { resume: { [interrupt.id!]: answer } },
  });
}
```

当子代理完成回答后，主管会像往常一样收到通知。如果子代理需要来自主管而不是用户的信息，请让它在结果中询问。主管回复`update_async_task`。

## 了解状态管理

任务元数据存储在主管图上的专用状态通道 (`asyncTasks`) 中，与消息历史记录分开。这很重要，因为当上下文窗口填满时，深度代理[compact their message history](/oss/javascript/deepagents/context-engineering#summarization)。如果任务 ID 仅存在于工具消息中，则它们会在压缩过程中丢失。专用通道确保主管可以随时通过`list_async_tasks`回忆自己的任务，即使经过多轮总结。

每个跟踪的任务都会记录任务 ID、代理名称、线程 ID、运行 ID、状态和时间戳（`createdAt`、`checkedAt`、`updatedAt`）。

### 查找主管的子代理线程

> [!注意]
>
> 话题标签需要`deepagents>=1.16.0`。

`start_async_task` 使用`metadata: { parent_thread_id }`（主管的线程 ID）创建每个子代理线程。使用它来查找主管的子代理线程，或在子代理的图工厂中读取主管的线程：

```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "@langchain/langgraph-sdk";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";
import { createDeepAgent } from "deepagents";

async function findSubagentThreads(parentThreadId: string) {
  const client = new Client();
  return client.threads.search({ metadata: { parent_thread_id: parentThreadId } });
}

function researcher(config: LangGraphRunnableConfig) {
  // Set when a supervisor launched this run with `start_async_task`
  const parentThreadId = config.metadata?.parent_thread_id;
  return createDeepAgent({
    model: "google:gemini-3.6-flash",
    systemPrompt: "You research topics thoroughly.",
  });
}
```

```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "@langchain/langgraph-sdk";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";
import { createDeepAgent } from "deepagents";

async function findSubagentThreads(parentThreadId: string) {
  const client = new Client();
  return client.threads.search({ metadata: { parent_thread_id: parentThreadId } });
}

function researcher(config: LangGraphRunnableConfig) {
  // Set when a supervisor launched this run with `start_async_task`
  const parentThreadId = config.metadata?.parent_thread_id;
  return createDeepAgent({
    model: "openai:gpt-5.5",
    systemPrompt: "You research topics thoroughly.",
  });
}
```

```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "@langchain/langgraph-sdk";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";
import { createDeepAgent } from "deepagents";

async function findSubagentThreads(parentThreadId: string) {
  const client = new Client();
  return client.threads.search({ metadata: { parent_thread_id: parentThreadId } });
}

function researcher(config: LangGraphRunnableConfig) {
  // Set when a supervisor launched this run with `start_async_task`
  const parentThreadId = config.metadata?.parent_thread_id;
  return createDeepAgent({
    model: "anthropic:claude-sonnet-5",
    systemPrompt: "You research topics thoroughly.",
  });
}
```

```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "@langchain/langgraph-sdk";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";
import { createDeepAgent } from "deepagents";

async function findSubagentThreads(parentThreadId: string) {
  const client = new Client();
  return client.threads.search({ metadata: { parent_thread_id: parentThreadId } });
}

function researcher(config: LangGraphRunnableConfig) {
  // Set when a supervisor launched this run with `start_async_task`
  const parentThreadId = config.metadata?.parent_thread_id;
  return createDeepAgent({
    model: "openrouter:z-ai/glm-5.2",
    systemPrompt: "You research topics thoroughly.",
  });
}
``````ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "@langchain/langgraph-sdk";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";
import { createDeepAgent } from "deepagents";

async function findSubagentThreads(parentThreadId: string) {
  const client = new Client();
  return client.threads.search({ metadata: { parent_thread_id: parentThreadId } });
}

function researcher(config: LangGraphRunnableConfig) {
  // Set when a supervisor launched this run with `start_async_task`
  const parentThreadId = config.metadata?.parent_thread_id;
  return createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    systemPrompt: "You research topics thoroughly.",
  });
}
```

```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "@langchain/langgraph-sdk";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";
import { createDeepAgent } from "deepagents";

async function findSubagentThreads(parentThreadId: string) {
  const client = new Client();
  return client.threads.search({ metadata: { parent_thread_id: parentThreadId } });
}

function researcher(config: LangGraphRunnableConfig) {
  // Set when a supervisor launched this run with `start_async_task`
  const parentThreadId = config.metadata?.parent_thread_id;
  return createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    systemPrompt: "You research topics thoroughly.",
  });
}
```

```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "@langchain/langgraph-sdk";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";
import { createDeepAgent } from "deepagents";

async function findSubagentThreads(parentThreadId: string) {
  const client = new Client();
  return client.threads.search({ metadata: { parent_thread_id: parentThreadId } });
}

function researcher(config: LangGraphRunnableConfig) {
  // Set when a supervisor launched this run with `start_async_task`
  const parentThreadId = config.metadata?.parent_thread_id;
  return createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    systemPrompt: "You research topics thoroughly.",
  });
}
```

## 选择交通工具

### 相同部署（省略`url`）

当子代理规范省略 `url` 字段时，LangGraph SDK 使用服务器提供的地址与运行此图的代理服务器进行通信。在其他地方，SDK 默认为 `http://localhost:8123`。对于基于 LangGraph 的部署，将两个图注册在同一个 `langgraph.json` 中。

部署的代理服务器从版本 0.18.0 开始提供此地址（`langgraph dev` 已经提供）。在早期版本中，将 `url` 设置为部署 URL。

### HTTP 传输（远程）

添加 `url` 字段以切换到 HTTP 传输，其中 SDK 调用通过网络传输到远程代理协议服务器：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  name: "researcher",
  description: "Research agent",
  graphId: "researcher",
  url: "https://my-research-deployment.langsmith.dev",
}
```

对于 LangGraph 部署，身份验证由 LangGraph SDK 使用环境变量中的 `LANGSMITH_API_KEY`（或 `LANGGRAPH_API_KEY`）进行处理。自承载代理协议服务器可能使用不同的身份验证机制。

当子代理需要独立扩展、不同的资源配置文件或由不同的团队维护时，请使用 HTTP 传输。

## 选择启动模式

每个 [⟦T111⟧](https://reference.langchain.com/javascript/deepagents/agent/createDeepAgent) 规范上的 `mode` 字段控制任务启动时子代理接收的对话上下文。|模式|行为 |
| - | - |
| `"isolated"`（默认）|仅发送委派的任务描述。子代理重新开始，不知道父代理的对话历史记录。 |
| `"fork"` |在启动时发送家长对话的快照，然后发送任务说明。子代理可以在后台工作时使用该上下文。 |

`"isolated"` 是大多数任务的正确选择。当子代理需要建立上下文时，请使用`"fork"` - 例如，后台起草代理应以对话中已设置的风格和声音进行书写。

### 分叉模式

> [!警告]
>
> Fork 模式需要`deepagents>=1.16.0`。它是实验性的，可能会在未来的版本中发生变化。

在任何 `AsyncSubAgent` 规格上设置 `mode: "fork"`：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const asyncSubagents: AsyncSubAgent[] = [
  {
    name: "drafter",
    description: "Drafts documents based on the conversation context",
    graphId: "drafter",
    mode: "fork",
  },
];
```

启动时，`start_async_task` 发送父级有效对话历史记录的快照，后跟任务描述。如果父级已压缩其历史记录，则快照包含该压缩上下文，而不是每条原始消息。来自父级的后续消息不会转发给子级。子代理在新的服务器线程上启动。 Fork模式发送对话消息作为运行输入；它不会复制父级的检查点历史记录或所有父级状态。元数据可以将新线程与其主管相关联，但该关联本身并不传输对话上下文。

**提示缓存重用。** 要获得对分叉对话前缀的缓存命中，请使用与父代理相同的模型、系统提示、工具和提示处理中间件来配置远程代理。 Fork模式复制对话历史记录；它不会同步这些设置。匹配配置是必要的，但还不够：呈现的前缀必须匹配，缓存命中取决于提供者。

**卸载媒体。** 如果父级使用 `offloadBinaryContent` 卸载媒体，fork 模式会发送对它的引用而不是媒体本身。子代理必须是深度代理，共享父代理的后端以查看媒体；其他深度代理会收到一条不可用的注释，并且其他图形无法使用这些消息。

## 选择部署拓扑

### 单一部署单一部署意味着所有代理共同部署在同一代理服务器上。省略 `url`，以便每个图都通过该服务器到达其他图。对于基于 LangGraph 的部署，将所有图表注册在一个 `langgraph.json` 中。这是推荐的起点——管理一台服务器。

### 拆分部署

一台服务器上的主管，另一台服务器上的子代理通过 HTTP 传输。当子代理需要不同的计算配置文件或独立扩展时使用。

### 混合动力

在混合部署中，一些子代理省略`url`（同一代理服务器），其他子代理为远程服务器设置`url`：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import type { AsyncSubAgent } from "deepagents";

const asyncSubagents: AsyncSubAgent[] = [
  {
    name: "researcher",
    description: "Research agent",
    graphId: "researcher",
    // No url → same Agent Server
  },
  {
    name: "coder",
    description: "Coding agent",
    graphId: "coder",
    url: "https://coder-deployment.langsmith.dev",
    // url present → HTTP (remote)
  },
];
```

## 最佳实践

### 调整工人池规模以适应当地发展

当使用 `langgraph dev` 在本地运行时，增加工作池以适应并发子代理运行。每个活动运行都会占用一个工作槽。具有 3 个并发子代理任务的主管需要 4 个插槽（1 个主管 + 3 个子代理）。配置不足会导致启动排队。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langgraph dev --n-jobs-per-worker 10
```

### 编写清晰的子代理描述

主管使用描述来决定启动哪个子代理。具体并以行动为导向：

```typescript Good theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// Good
{
  name: "researcher",
  description: "Conducts in-depth research using web search. Use for questions requiring multiple searches and synthesis.",
  graphId: "researcher",
}
```

```typescript Bad theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// Bad
{
  name: "helper",
  description: "helps with stuff",
  graphId: "helper",
}
```

### 使用线程 ID 进行跟踪使用基于 LangGraph 的部署时，每个异步子代理运行都是标准 LangGraph 运行，在 LangSmith 中完全可见。 Supervisor 的跟踪显示对 `launch`、`check`、`update`、`cancel` 和 `list` 的工具调用。每个子代理运行都显示为单独的跟踪，通过线程 ID 链接。使用线程 ID（任务 ID）将主管编排跟踪与子代理执行跟踪关联起来。

## 故障排除

### 启动后立即进行主管民意调查

**问题**：主管在启动后立即循环调用`check`，将异步执行变成阻塞。

**解决方案**：中间件注入系统提示规则来防止这种情况。如果轮询持续存在，请强化主管系统提示中的行为：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent } from "deepagents";

const agent = createDeepAgent({
  model: "google:gemini-3.6-flash",
  systemPrompt: `...your instructions...

    After launching an async subagent, ALWAYS return control to the user.
    Never call check_async_task immediately after launch.`,
  subagents: [...asyncSubagents],
});
```

### 主管报告过时状态

**问题**：主管引用对话历史记录中较早的任务状态，而不是进行新的 `check` 呼叫。

**解决方案**：中间件提示指示模型“对话历史记录中的任务状态始终是陈旧的”。如果这种情况仍然发生，请添加显式指令以在报告状态之前始终调用`check`或`list`。

### 任务 ID 查找失败**问题**：主管截断或重新格式化任务ID，导致`check`或`cancel`失败。

**解决方案**：中间件提示指示模型始终使用完整的任务 ID。如果截断仍然存在，这通常是特定于模型的问题 - 尝试不同的模型或将“始终显示完整任务\_id，从不截断或缩写它”添加到系统提示符中。

### 子代理启动队列而不是运行

**问题**：启动子代理挂起或需要很长时间才能启动。

**解决方案**：工作池可能已耗尽。使用 `--n-jobs-per-worker` 增加池大小。参见[Size the worker pool](#size-the-worker-pool-for-local-development)。

## 参考实现

[async-deep-agents](https://github.com/langchain-ai/async-deep-agents) 存储库包含部署到 LangSmith 部署的 Python 和 TypeScript 工作示例。它演示了一个主管以及作为后台任务运行的研究员和编码器子代理。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/async-subagents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。