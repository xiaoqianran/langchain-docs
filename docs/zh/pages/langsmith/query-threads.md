<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Query threads using the SDK | https://docs.langchain.com/langsmith/query-threads -->

# 使用SDK查询线程

以编程方式从 LangSmith 项目中获取和检查多轮对话线程。

如果您正在构建会话代理或任何多轮应用程序，LangSmith 会自动将您的 [runs](/langsmith/run-data-format) 分组为 [*threads*](/langsmith/observability-concepts#threads)。通过查询线程，您可以重播完整对话、审核代理在会话中的行为、构建对话长度和延迟分析，并为下游工作流程（例如微调和评估）提供数据。

SDK 公开了两种处理线程的方法：

|方法|使用时 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| [⟦T14⟧](https://reference.langchain.com/python/langsmith/client/Client/list_threads) / [⟦T15⟧](https://reference.langchain.com/javascript/langsmith/client/Client/listThreads) |您想要浏览项目中的所有线程 |
| [⟦T16⟧](https://reference.langchain.com/python/langsmith/client/Client/read_thread) / [⟦T17⟧](https://reference.langchain.com/javascript/langsmith/client/Client/readThread) |您已经知道线程 ID 并且需要它的运行 |

## 线程如何工作您创建的每次运行都可以在其元数据中携带`thread_id`。 LangSmith 使用它来将运行分组为线程。后端在`metadata`中查找`thread_id`（回落到`session_id`）。

<Note>
  我们建议使用 **UUID v7** 线程 ID。 UUIDv7 嵌入了一个时间戳，它可以保留线程的正确时间顺序。 LangSmith SDK 导出 uuid7 帮助程序（Python v0.4.43+、JS v0.3.80+）：

  * **Python**：`from langsmith import uuid7`
  * **JS/TS**: `import { uuid7 } from 'langsmith'`
</Note>

如果您使用 [tracing integration](/langsmith/integrations)，请在运行元数据中传递 `thread_id`：

<CodeGroup>
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
</CodeGroup>

## 列出项目中的所有线程

`list_threads` / `listThreads` 获取项目中的所有线程并将它们的运行分组在一起。结果首先按最近的活动排序。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client

  client = Client()

  threads = client.list_threads(project_name="my-project")

  for thread in threads:
      print(thread["thread_id"])
      print(f"  {thread['count']} runs")
      print(f"  last active: {thread['max_start_time']}")
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";

  const client = new Client();

  const threads = await client.listThreads({ projectName: "my-project" });

  for (const thread of threads) {
    console.log(thread.thread_id);
    console.log(`  ${thread.count} runs`);
    console.log(`  last active: ${thread.max_start_time}`);
  }
  ```
</CodeGroup>

结果按最近的活动排序：

```text Output theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
conv-abc123
  3 runs
  last active: 2026-02-25T10:05:42+00:00
conv-def456
  1 runs
  last active: 2026-02-25T09:30:00+00:00
```

### 参数|参数|类型 |默认|描述 |
| ------------------------------------------ | ------------------- | ---------| ---------------------------------------------------------------------------------------------------------------------------------- |
| `project_name` / `projectName` | `string` | — |项目名称。如果未设置 `project_id`，则为必需。                                                                 |
| `project_id` / `projectId` | `string` | — |项目编号。如果未设置 `project_name`，则为必需。                                                                 |
| `limit` | `int` |全部 |返回的最大线程数。                                                                               |
| `offset` | `int` | `0` |要跳过的线程数（用于分页）。                                                                        |
| `filter` | `string` | — |获取运行时应用的过滤器表达式，使用[LangSmith trace query syntax](/langsmith/trace-query-syntax)。 || `start_time` / `startTime` | `datetime` / `Date` | 1 天前 |仅包括在此时间之后开始的运行。扩大此窗口以显示较旧的线程。                             |

### 返回值

线程对象列表，每个对象包含：

|领域 |类型 |描述 |
| ---------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `thread_id` | `string` |线程标识符。                                           |
| `runs` | `[Run](https://reference.langchain.com/python/langsmith/schemas/Run)[]` |根在此线程中运行，按时间顺序排序（最旧的在前）。 |
| `count` | `int` |该线程中的运行次数。                                   |
| `min_start_time` | `string \| null` |最早运行的 ISO 时间戳。                               || `max_start_time` | `string \| null` |最近运行的 ISO 时间戳。                            |

<Note>
  `list_threads` 始终仅返回根运行。如果您需要子运行（例如，工具调用、子链），请使用 `read_thread` 代替，它接受 `is_root` / `isRoot` 参数，您可以将其设置为 `false`。
</Note>

## 单线程的读取运行

当您已经知道 `thread_id` 时，请使用 `read_thread` / `readThread`。它直接返回线程运行的迭代器，而不首先获取所有线程。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client

  client = Client()

  for run in client.read_thread(
      thread_id="conv-abc123",
      project_name="my-project",
  ):
      print(run.id, run.name, run.start_time)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";

  const client = new Client();

  for await (const run of client.readThread({
    threadId: "conv-abc123",
    projectName: "my-project",
  })) {
    console.log(run.id, run.name, run.start_time);
  }
  ```
</CodeGroup>

与`list_threads`不同，这里的每个项目都是直接的`Run`对象——没有分组包装器。默认情况下，运行按时间升序返回。

```python Output theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[
    Run(id=UUID("a1b2..."), name="my_agent", run_type="chain", status="success", start_time=datetime(2026, 2, 25, 10, 0, 0, tzinfo=utc), ...),
    Run(id=UUID("c3d4..."), name="my_agent", run_type="chain", status="success", start_time=datetime(2026, 2, 25, 10, 3, 11, tzinfo=utc), ...),
    Run(id=UUID("e5f6..."), name="my_agent", run_type="chain", status="error",   start_time=datetime(2026, 2, 25, 10, 5, 42, tzinfo=utc), ...),
]
```

### 参数|参数|类型 |默认 |描述 |
| ------------------------------------------ | -------------------- | ---------- | ------------------------------------------------------------------ |
| `thread_id` / `threadId` | `string` | — | **必需。** 要查询的线程。                                |
| `project_name` / `projectName` | `string` | — |项目名称。如果未设置 `project_id`，则为必需。                |
| `project_id` / `projectId` | `string \| string[]` | — |项目 ID 或 ID 列表。如果未设置 `project_name`，则为必需。 |
| `is_root` / `isRoot` | `bool` | `true` |仅返回根运行。设置为 `false` 以包含子运行。      |
| `limit` | `int` |全部 |返回的最大运行次数。                                 |
| `filter` | `string` | — |附加过滤器表达式（与线程过滤器组合）。   |
| `order` | `"asc" \| "desc"` | `"asc"` |排序顺序。 `"asc"` 返回最旧的优先（按时间顺序）运行。    || `select` | `string[]` |所有领域 |返回特定的运行字段，以减少响应大小。           |

### 返回值

`Run` 对象的迭代器 ([Python](https://reference.langchain.com/python/langsmith)) 或异步迭代器 ([TypeScript](https://reference.langchain.com/javascript/langsmith))。

## 示例

### 按运行属性过滤线程

使用 [LangSmith trace query syntax](/langsmith/trace-query-syntax) 传递过滤表达式以缩小结果范围。例如，仅显示包含至少一次失败运行的线程：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  threads = client.list_threads(
      project_name="my-project",
      filter='eq(status, "error")',
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const threads = await client.listThreads({
    projectName: "my-project",
    filter: 'eq(status, "error")',
  });
  ```
</CodeGroup>

###回顾过去24小时

默认情况下，`list_threads` 仅显示最后一天运行的线程。通过`start_time`拉宽窗口：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import datetime

  threads = client.list_threads(
      project_name="my-project",
      start_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2),
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const threads = await client.listThreads({
    projectName: "my-project",
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });
  ```
</CodeGroup>

### 重建对话

使用 `read_thread` 和 `order="asc"` 依次重播对话：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  runs = list(
      client.read_thread(
          thread_id="conv-abc123",
          project_name="my-project",
          order="asc",
      )
  )

  for run in runs:
      user_msg = run.inputs.get("messages", [{}])[-1].get("content", "")
      assistant_msg = (run.outputs or {}).get("content", "")
      print(f"User:      {user_msg}")
      print(f"Assistant: {assistant_msg}")
      print()
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const runs: Run[] = [];
  for await (const run of client.readThread({
    threadId: "conv-abc123",
    projectName: "my-project",
    order: "asc",
  })) {
    runs.push(run);
  }

  for (const run of runs) {
    const messages = (run.inputs?.messages ?? []) as Array<Record<string, string>>;
    const userMsg = messages.at(-1)?.content ?? "";
    const assistantMsg = (run.outputs as Record<string, string>)?.content ?? "";
    console.log(`User:      ${userMsg}`);
    console.log(`Assistant: ${assistantMsg}`);
  }
  ```
</CodeGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/query-threads.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>