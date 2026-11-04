<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Query threads using the SDK | https://docs.langchain.com/langsmith/query-threads -->

# 使用SDK查询线程

以编程方式从您的 LangSmith 项目中获取和检查多轮对话线程。

如果您正在构建会话代理或任何多轮应用程序，LangSmith会自动将您的[runs](/langsmith/run-data-format)分组为[*threads*](/langsmith/observability-concepts#threads)。通过查询线程，您可以重播完整对话、审核代理跨会话的行为、构建对话长度和延迟分析，并为下游工作流程（例如 [fine-tuning](/langsmith/smithtune) 和评估）提供数据。

SDK 公开了两种处理线程的方法：

|方法|使用时 |
| - | - |
| `client.threads.query()` ([Python](https://reference.langchain.com/python/langsmith/resources/threads/threads/AsyncThreadsResource/query), [TypeScript](https://reference.langchain.com/javascript/langsmith/client/Langsmith/Threads/query)) |您想要浏览项目中的线程 |
| `client.threads.list_traces()` / `client.threads.listTraces()` ([Python](https://reference.langchain.com/python/langsmith/resources/threads/threads/AsyncThreadsResource/list_traces), [TypeScript](https://reference.langchain.com/javascript/langsmith/client/Langsmith/Threads/listTraces)) |您已经知道线程 ID 并且需要它的踪迹 |

两种方法都需要一个项目 ID。如果您只有项目名称，请先使用 `aread_project()` / `readProject()` 查找，如下例所示。在 Python 中，这两种方法都是异步的。

> [!注意]
>
> 查询代理、实验或评估者的线程，[find its project ID](/langsmith/resolve-an-agent) 并将其作为项目 ID 传递。> [!注意]
>
> 这些方法替换了已弃用的`list_threads` / `listThreads` 和 `read_thread` / `readThread`。 LangSmith Cloud 于 2027 年 1 月 31 日删除它们，自托管 LangSmith 在 v0.19 中删除它们。新方法需要 `langsmith>=0.10.15` (Python) 或 `langsmith>=0.8.9` (TypeScript)，以及自托管的 LangSmith v0.16 或更高版本。有关更改的完整列表，请参阅[migration guide](/langsmith/smithdb-sdk-migration-threads)。

## 线程如何工作

您创建的每个运行都可以在其元数据中携带`thread_id`。 LangSmith 使用它来将运行分组为线程。后端在`metadata`中查找`thread_id`（回落到`session_id`）。

> [!注意]
>
> 我们建议使用 **UUID v7** 线程 ID。 UUIDv7 嵌入了时间戳，可以保留线程的正确时间顺序。 LangSmith SDK 导出 uuid7 帮助程序（Python v0.4.43+、JS v0.3.80+）：
>
> * **Python**：`from langsmith import uuid7`
> * **JS/TS**: `import { uuid7 } from 'langsmith'`

如果您使用 [tracing integration](/langsmith/integrations)，请在运行元数据中传递 `thread_id`：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import traceable, uuid7

THREAD_ID = str(uuid7())

@traceable(metadata={"thread_id": THREAD_ID})
def my_agent(user_message: str) -> str:
    ...
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { traceable } from "langsmith/traceable";
import { uuid7 } from "langsmith";

const THREAD_ID = uuid7();

const myAgent = traceable(
  async (userMessage: string) => {
    // ...
  },
  { metadata: { thread_id: THREAD_ID } }
);
```

## 列出项目中的线程

`threads.query` 返回项目中的线程，每个线程一行及其聚合。结果用光标分页； SDK 会为您迭代每个页面。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

from langsmith import Client


async def main():
    client = Client()
    project = await client.aread_project(project_name="my-project")

    async for thread in client.threads.query(project_id=str(project.id)):
        print(thread.thread_id)
        print(f"  {thread.count} traces")
        print(f"  last active: {thread.max_start_time}")


asyncio.run(main())
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const project = await client.readProject({ projectName: "my-project" });

for await (const thread of client.threads.query({ project_id: project.id })) {
  console.log(thread.thread_id);
  console.log(`  ${thread.count} traces`);
  console.log(`  last active: ${thread.max_start_time}`);
}
```

```text Output theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
conv-abc123
  3 traces
  last active: 2026-02-25T10:05:42+00:00
conv-def456
  1 traces
  last active: 2026-02-25T09:30:00+00:00
```

### 参数|参数|类型 |默认 |描述 |
| - | - | - | - |
| `project_id` | `string` | — | **必填。** 项目 ID。 |
| `min_start_time` | `datetime` / ISO `string` | 1 天前 |仅包含在此时间之后启动的跟踪的线程。扩大此窗口以显示较旧的线程。 |
| `max_start_time` | `datetime` / ISO `string` |现在 |仅包含在此时间之前启动的跟踪的线程。 |
| `filter` | `string` | — |使用[LangSmith trace query syntax](/langsmith/trace-query-syntax)针对每个线程的根运行评估过滤器表达式。 |
| `page_size` | `int` | — |每页的线程数。 |
| `cursor` | `string` | — |当您手动分页时，光标指向下一页。 |

### 返回值

`Thread` 对象的异步迭代器。最有用的字段：|领域|类型 |描述 |
| - | - | - |
| `thread_id` | `string` |线程标识符。 |
| `count` | `int` |该线程中的跟踪数。 |
| `min_start_time` | `datetime` (Python) / `string` (TypeScript) |最早跟踪的时间戳。 |
| `max_start_time` | `datetime` (Python) / `string` (TypeScript) |最近跟踪的时间戳。 |
| `first_trace_id`、`last_trace_id` | `string` |查询窗口中线程的第一个和最后一个跟踪。 |
| `first_inputs`、`last_outputs` | `string` |第一个输入和最后一个输出的预览被截断。 |
| `last_error`、`num_errored_turns` | `string`、`int` |最后的错误消息和出错的跟踪数。 |
| `total_tokens`、`total_cost` | `int`、`number` |整个线程的令牌和成本总计。 |
| `latency_p50`、`latency_p99` | `number` |线程轨迹上的延迟百分位。 |
| `feedback_stats` | `object` |线程上的汇总反馈。 |

`Thread` 不嵌入其运行。要获取它们，请使用 `thread_id` 拨打 `threads.list_traces`。

## 读取单个线程的痕迹

当您已经知道`thread_id`时，请使用`threads.list_traces` / `threads.listTraces`。它按升序 `start_time` 顺序返回线程的跟踪（根运行）。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

from langsmith import Client


async def main():
    client = Client()
    project = await client.aread_project(project_name="my-project")

    async for trace in client.threads.list_traces(
        "conv-abc123",
        project_id=str(project.id),
        selects=["TRACE_ID", "NAME", "START_TIME"],
    ):
        print(trace.trace_id, trace.name, trace.start_time)


asyncio.run(main())
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const project = await client.readProject({ projectName: "my-project" });

for await (const trace of client.threads.listTraces("conv-abc123", {
  project_id: project.id,
  selects: ["TRACE_ID", "NAME", "START_TIME"],
})) {
  console.log(trace.trace_id, trace.name, trace.start_time);
}
```每个项目都是轻量级的`ThreadTrace`，而不是完整的运行。仅填充`selects`中列出的字段；没有 `selects`，您只能获得 `trace_id`。使用 [⟦T87⟧](/langsmith/smithdb-sdk-migration-traces) 获取跟踪的子运行（工具调用、子链）。

### 参数

|参数|类型 |默认 |描述 |
| - | - | - | - |
| `thread_id` | `string` | — | **必需。** 要读取的线程（第一个位置参数）。 |
| `project_id` | `string` | — | **必填。** 项目 ID。 |
| `selects` | `string[]` | `["TRACE_ID"]` |要返回的字段。如果您需要将 `TRACE_ID` 与其他字段放在一起，也可以列出它。例如`NAME`、`START_TIME`、`END_TIME`、`LATENCY`、`INPUTS`、`OUTPUTS`、`INPUTS_PREVIEW`、`OUTPUTS_PREVIEW`、`ERROR`、 `TOTAL_TOKENS`、`TOTAL_COST`。 |
| `filter` | `string` | — |根据每个跟踪的根运行评估过滤器表达式。 |
| `page_size` | `int` | — |每页的迹线数。 |
| `cursor` | `string` | — |当您手动分页时，光标指向下一页。 |

### 返回值

`ThreadTrace` 对象的异步迭代器，按 `start_time` 升序排序。

## 示例

下面的代码片段延续了上面的示例：在 Python 中，在同一个 `async def main()` 中运行它们，并且已经设置了 `client` 和 `project`。

### 按运行属性过滤线程使用 [LangSmith trace query syntax](/langsmith/trace-query-syntax) 传递过滤表达式以缩小结果范围。例如，仅显示包含至少一次失败运行的线程：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
async for thread in client.threads.query(
    project_id=str(project.id),
    filter='eq(status, "error")',
):
    print(thread.thread_id, thread.last_error)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
for await (const thread of client.threads.query({
  project_id: project.id,
  filter: 'eq(status, "error")',
})) {
  console.log(thread.thread_id, thread.last_error);
}
```

###回顾过去24小时

默认情况下，`threads.query` 仅显示带有最后一天痕迹的线程。通过`min_start_time`拉宽窗口：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from datetime import datetime, timedelta, timezone

async for thread in client.threads.query(
    project_id=str(project.id),
    min_start_time=datetime.now(timezone.utc) - timedelta(days=2),
):
    print(thread.thread_id)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
for await (const thread of client.threads.query({
  project_id: project.id,
  min_start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
})) {
  console.log(thread.thread_id);
}
```

### 重建对话

`threads.list_traces` 首先返回最旧的跟踪，因此您可以依次重播对话。选择 `INPUTS` 和 `OUTPUTS` 以获得完整的有效负载：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
async for trace in client.threads.list_traces(
    "conv-abc123",
    project_id=str(project.id),
    selects=["INPUTS", "OUTPUTS"],
):
    user_msg = (trace.inputs or {}).get("messages", [{}])[-1].get("content", "")
    assistant_msg = (trace.outputs or {}).get("content", "")
    print(f"User:      {user_msg}")
    print(f"Assistant: {assistant_msg}")
    print()
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
for await (const trace of client.threads.listTraces("conv-abc123", {
  project_id: project.id,
  selects: ["INPUTS", "OUTPUTS"],
})) {
  const inputs = trace.inputs as { messages?: Array<Record<string, string>> } | undefined;
  const outputs = trace.outputs as Record<string, string> | undefined;
  const messages = inputs?.messages ?? [];
  const userMsg = messages.at(-1)?.content ?? "";
  const assistantMsg = outputs?.content ?? "";
  console.log(`User:      ${userMsg}`);
  console.log(`Assistant: ${assistantMsg}`);
}
```

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/query-threads.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。