<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Query traces using the SDK | https://docs.langchain.com/langsmith/export-traces -->

# 使用SDK查询轨迹

查询[runs](/langsmith/observability-concepts#runs)（LangSmith迹线中的跨度数据）的推荐方法是使用[SDK](https://reference.langchain.com/python/langsmith/)中的`runs.query`方法或[API](/langsmith/smith-api-ref)中的`POST /api/v2/runs/query`端点。 LangSmith 以[Run (span) data format](/langsmith/run-data-format) 中指定的简单格式存储跟踪。

此页面涵盖：

* [Use filter arguments](#use-filter-arguments)：使用SDK参数进行基于关键字的过滤。
* [Use filter query language](#use-filter-query-language)：使用LangSmith的过滤语法进行复杂查询。
* [Query trace trees with child-run predicates](#query-trace-trees-with-child-run-predicates)：将服务器端缩小范围与每个跟踪的运行相结合。
* [Rate limits](#rate-limits)：限制和最佳实践。

> [!注意]
>
> 如果您希望导出大量跟踪，我们建议您使用[Bulk Data Export](/langsmith/data-export)功能，因为它可以更好地处理大数据量，并支持自动重试和跨分区并行化。

> [!注意]
>
> `runs.query` 替换已弃用的 `list_runs` / `listRuns` 和 `read_run` / `readRun`。 LangSmith Cloud 于 2027 年 1 月 31 日删除它们，自托管 LangSmith 在 v0.19 中删除它们。新方法需要 `langsmith>=0.10.15` (Python) 或 `langsmith>=0.8.9` (TypeScript)，以及自托管的 LangSmith v0.16 或更高版本。有关更改的完整列表，请参阅[migration guide](/langsmith/smithdb-sdk-migration-query-runs)。

> [!注意]
>
> 查询代理、实验或评估者的踪迹，[find its project ID](/langsmith/resolve-an-agent) 并将其作为项目 ID 传递。## 使用过滤器参数

对于简单的查询，您不必依赖我们的查询语法。您可以使用[filter arguments reference](/langsmith/trace-query-syntax#filter-arguments)中指定的过滤器参数。

> [!警告]
>
> **先决条件**
>
> 在运行以下代码片段之前初始化客户端、查找项目 ID 并设置时间窗口：
>
> * `runs.query` 采用项目 ID，而不是项目名称。
> * 除非您通过`min_start_time`，否则只会回顾**1天**。下面的片段使用 7 天的窗口。一个查询最多可以跨越 401 天。
> * 它仅返回运行 `ID`，除非您传递 `selects`（大写字段名称，例如 `NAME`、`INPUTS`、`OUTPUTS`）。
> * 在 Python 中，`client.runs` 是异步的：在 `async` 函数内运行代码片段，例如使用 `asyncio.run()`。每个查询都会返回一个异步迭代器，为您分页结果。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from datetime import datetime, timedelta, timezone

from langsmith import Client

client = Client()
project_id = str(client.read_project(project_name="<your_project>").id)
since = datetime.now(timezone.utc) - timedelta(days=7)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const projectId = (await client.readProject({ projectName: "<your_project>" })).id;
const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import com.langchain.smith.client.LangsmithClient;
import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;
import com.langchain.smith.models.runs.RunQueryV2Params;
import java.time.OffsetDateTime;

LangsmithClient client = LangsmithOkHttpClient.fromEnv();
String projectId = "<your_project_id>";
OffsetDateTime since = OffsetDateTime.now().minusDays(7);

// Run any of the queries below with: client.runs().queryV2(params)
```

以下是使用关键字参数列出运行的一些方法示例：

### 列出项目中的所有运行

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
project_runs = [
    run
    async for run in client.runs.query(
        project_ids=[project_id],
        min_start_time=since,
        selects=["ID", "NAME", "RUN_TYPE", "START_TIME"],
    )
]
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const projectRuns = [];
for await (const run of client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  selects: ["ID", "NAME", "RUN_TYPE", "START_TIME"],
})) {
  projectRuns.push(run);
}
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import com.langchain.smith.models.runs.RunSelectField;

RunQueryV2Params projectRuns = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .addSelect(RunSelectField.ID)
    .addSelect(RunSelectField.NAME)
    .build();
```

### 列出过去 24 小时内的 LLM 和聊天运行情况

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
todays_llm_runs = [
    run
    async for run in client.runs.query(
        project_ids=[project_id],
        min_start_time=datetime.now(timezone.utc) - timedelta(days=1),
        run_type="LLM",
    )
]
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const todaysLlmRuns = [];
for await (const run of client.runs.query({
  project_ids: [projectId],
  min_start_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  run_type: "LLM",
})) {
  todaysLlmRuns.push(run);
}
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import com.langchain.smith.models.runs.RunType;

RunQueryV2Params todaysLlmRuns = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(OffsetDateTime.now().minusDays(1))
    .runType(RunType.LLM)
    .build();
```

### 列出项目中的根运行

根运行是没有父运行的运行。这些被分配给 `is_root` 的值 `True`。您可以使用它来过滤根运行。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
root_runs = client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    is_root=True,
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const rootRuns = client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  is_root: true,
});
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params rootRuns = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .isRoot(true)
    .build();
```

### 列表运行没有错误

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
correct_runs = client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    has_error=False,
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const correctRuns = client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  has_error: false,
});
``````java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params noErrorRuns = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .hasError(false)
    .build();
```

### 按运行 ID 列出运行

如果您有运行 ID 列表，则可以直接列出它们。也传递项目 ID；您可以将`ids`与其他过滤器结合使用。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
run_ids = ["a36092d2-4ad5-4fb4-9c0d-0dba9a2ed836", "9398e6be-964f-4aa4-8ae9-ad78cd4b7074"]
selected_runs = client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    ids=run_ids,
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const runIds = [
  "a36092d2-4ad5-4fb4-9c0d-0dba9a2ed836",
  "9398e6be-964f-4aa4-8ae9-ad78cd4b7074",
];
const selectedRuns = client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  ids: runIds,
});
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params runIdsRuns = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .ids(runIds)
    .build();
```

### 通过 ID 获取单次运行

要按 ID 获取单个运行，请使用 `runs.retrieve` 方法。它需要运行所属项目的 ID。对于从公共共享链接运行，请改用 [public runs methods](/langsmith/smithdb-sdk-migration-feedback)。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
run_id = "a36092d2-4ad5-4fb4-9c0d-0dba9a2ed836"
run = await client.runs.retrieve(
    run_id,
    project_id=project_id,
    selects=["NAME", "INPUTS", "OUTPUTS"],
)

# Access run data
print(run.inputs)
print(run.outputs)
print(run.name)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const runId = "a36092d2-4ad5-4fb4-9c0d-0dba9a2ed836";
const run = await client.runs.retrieve(runId, {
  project_id: projectId,
  selects: ["NAME", "INPUTS", "OUTPUTS"],
});

// Access run data
console.log(run.inputs);
console.log(run.outputs);
console.log(run.name);
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import com.langchain.smith.models.runs.Run;
import com.langchain.smith.models.runs.RunRetrieveV2Params;

Run run = client.runs().retrieveV2(
    runId,
    RunRetrieveV2Params.builder().projectId(projectId).build()
);
```

> [!提示]
>
> **使用 LangGraph** 在本地重放跟踪
>
> 如果您将 LangGraph 与检查点结合使用，则可以从 LangSmith 获取跟踪并在本地重播以进行调试。有关从检查点恢复执行的详细信息，请参阅[LangGraph's time travel and replay documentation](/oss/python/langgraph/use-time-travel)。

## 使用过滤查询语言

对于更复杂的查询，您可以使用过滤查询语言。以下示例涵盖了最常见的模式。有关完整的运算符和字段参考，包括所有比较器、可过滤字段、值格式化规则和快速参考示例表，请参阅[Trace query syntax: filter query language](/langsmith/trace-query-syntax#filter-query-language)。

### 列出对话线程中的所有 root 运行这是在会话线程中获取运行的方法。有关设置线程的更多信息，请参阅我们的[how-to guide on setting up threads](/langsmith/threads)。要直接列出线程及其跟踪，请参阅[Query threads](/langsmith/query-threads)。
通过设置共享线程 ID 对线程进行分组。 LangSmith UI 允许您使用以下元数据键之一：`session_id` 或 `thread_id`。会话 ID 也称为跟踪项目 ID。以下查询与其中任何一个匹配。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
group_key = "<your_thread_id>"
filter_string = f'and(in(metadata_key, ["session_id","thread_id"]), eq(metadata_value, "{group_key}"))'
thread_runs = client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    filter=filter_string,
    is_root=True,
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const groupKey = "<your_thread_id>";
const filterString = `and(in(metadata_key, ["session_id","thread_id"]), eq(metadata_value, "${groupKey}"))`;
const threadRuns = client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  filter: filterString,
  is_root: true,
});
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
String groupKey = "<your_thread_id>";

String filterString = String.format(
    "and(in(metadata_key, [\"session_id\",\"thread_id\"]), eq(metadata_value, \"%s\"))",
    groupKey
);

RunQueryV2Params threadRuns = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter(filterString)
    .isRoot(true)
    .build();
```

### 列出所有名为“extractor”的运行，其跟踪根被分配反馈“user\_score”分数为 1

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    filter='eq(name, "extractor")',
    trace_filter='and(eq(feedback_key, "user_score"), eq(feedback_score, 1))',
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  filter: 'eq(name, "extractor")',
  trace_filter: 'and(eq(feedback_key, "user_score"), eq(feedback_score, 1))',
});
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params extractorRuns = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("eq(name, \"extractor\")")
    .traceFilter("and(eq(feedback_key, \"user_score\"), eq(feedback_score, 1))")
    .build();
```

### 列出使用“star\_ rating”键运行且分数大于 4 的列表

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    filter='and(eq(feedback_key, "star_rating"), gt(feedback_score, 4))',
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  filter: 'and(eq(feedback_key, "star_rating"), gt(feedback_score, 4))',
});
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params runs = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("and(eq(feedback_key, \"star_rating\"), gt(feedback_score, 4))")
    .build();
```

### 列出耗时超过 5 秒才能完成的运行

以秒数形式传递延迟。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query(project_ids=[project_id], min_start_time=since, filter="gt(latency, 5)")
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query({ project_ids: [projectId], min_start_time: since, filter: "gt(latency, 5)" });
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params runs = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("gt(latency, 5)")
    .build();
```

### 列出状态不是“错误”的所有运行

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query(project_ids=[project_id], min_start_time=since, filter='neq(status, "error")')
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query({ project_ids: [projectId], min_start_time: since, filter: 'neq(status, "error")' });
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params runs = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("neq(status, \"error\")")
    .build();
```

### 列出 start\_time 大于特定时间戳的所有运行

要限制时间窗口本身，首选 `min_start_time` 和 `max_start_time` 参数； `start_time` 过滤器仅缩小该窗口内的结果范围。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    filter='gt(start_time, "2023-07-15T12:34:56Z")',
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  filter: 'gt(start_time, "2023-07-15T12:34:56Z")',
});
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params runs = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("gt(start_time, \"2023-07-15T12:34:56Z\")")
    .build();
```

### 列出包含字符串“substring”的所有运行

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query(project_ids=[project_id], min_start_time=since, filter='search("substring")')
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query({ project_ids: [projectId], min_start_time: since, filter: 'search("substring")' });
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params runs = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("search(\"substring\")")
    .build();
```### 列出所有用 git 哈希“2aa1cf4”标记的运行

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query(project_ids=[project_id], min_start_time=since, filter='has(tags, "2aa1cf4")')
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query({ project_ids: [projectId], min_start_time: since, filter: 'has(tags, "2aa1cf4")' });
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params runs = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("has(tags, \"2aa1cf4\")")
    .build();
```

### 列出在特定时间戳之后开始的所有运行，并且具有非错误状态或“正确性”反馈分数等于 0

将时间戳作为`min_start_time`传递，并将`or`条件保留在`filter`中。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query(
    project_ids=[project_id],
    min_start_time=datetime(2026, 7, 15, 12, 34, 56, tzinfo=timezone.utc),
    filter='or(neq(status, "error"), and(eq(feedback_key, "Correctness"), eq(feedback_score, 0.0)))',
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query({
  project_ids: [projectId],
  min_start_time: "2026-07-15T12:34:56Z",
  filter: 'or(neq(status, "error"), and(eq(feedback_key, "Correctness"), eq(feedback_score, 0.0)))',
});
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params runs = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(OffsetDateTime.parse("2026-07-15T12:34:56Z"))
    .filter("or(neq(status, \"error\"), and(eq(feedback_key, \"Correctness\"), eq(feedback_score, 0.0)))")
    .build();
```

### 复杂查询：列出标签包含“experimental”或“beta”且延迟大于 2 秒的所有运行

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    filter='and(or(has(tags, "experimental"), has(tags, "beta")), gt(latency, 2))',
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  filter: 'and(or(has(tags, "experimental"), has(tags, "beta")), gt(latency, 2))',
});
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params runs = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("and(or(has(tags, 'experimental'), has(tags, 'beta')), gt(latency, 2))")
    .build();
```

### 通过全文搜索跟踪树

您可以使用不带任何特定字段的 `search()` 函数对运行中的所有字符串字段进行全文搜索。这使您可以快速找到与搜索词匹配的痕迹。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    filter='search("image classification")',
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  filter: 'search("image classification")',
});
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params runs = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("search(\"image classification\")")
    .build();
```

### 检查元数据是否存在

如果要检查元数据是否存在，可以使用 `eq` 运算符，也可以选择使用 `and` 语句来按值进行匹配。如果您想记录有关跑步的更多结构化信息，这非常有用。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Check for any run with the "user_id" metadata key
client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    filter="eq(metadata_key, 'user_id')",
)
# Check for runs with user_id=4070f233-f61e-44eb-bff1-da3c163895a3
client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    filter="and(eq(metadata_key, 'user_id'), eq(metadata_value, '4070f233-f61e-44eb-bff1-da3c163895a3'))",
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// Check for any run with the "user_id" metadata key
client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  filter: `eq(metadata_key, 'user_id')`,
});
// Check for runs with user_id=4070f233-f61e-44eb-bff1-da3c163895a3
client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  filter: `and(eq(metadata_key, 'user_id'), eq(metadata_value, '4070f233-f61e-44eb-bff1-da3c163895a3'))`,
});
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params runsWithUserId = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("eq(metadata_key, 'user_id')")
    .build();

RunQueryV2Params runsForUser = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("and(eq(metadata_key, 'user_id'), eq(metadata_value, '4070f233-f61e-44eb-bff1-da3c163895a3'))")
    .build();
```

### 检查元数据中的环境详细信息一种常见的模式是通过元数据将环境信息添加到跟踪中。如果要过滤包含环境元数据的运行，可以使用与上面相同的模式：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    filter="and(eq(metadata_key, 'environment'), eq(metadata_value, 'production'))",
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  filter: `and(eq(metadata_key, 'environment'), eq(metadata_value, 'production'))`,
});
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params runs = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("and(eq(metadata_key, 'environment'), eq(metadata_value, 'production'))")
    .build();
```

### 检查元数据中的线程 ID

在同一对话中关联跟踪的常见方法是使用共享线程 ID。如果您想以这种方式根据线程 ID 过滤运行，您可以在元数据中搜索该 ID。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    filter="and(eq(metadata_key, 'thread_id'), eq(metadata_value, 'a1b2c3d4-e5f6-7890'))",
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  filter: `and(eq(metadata_key, 'thread_id'), eq(metadata_value, 'a1b2c3d4-e5f6-7890'))`,
});
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params runs = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("and(eq(metadata_key, 'thread_id'), eq(metadata_value, 'a1b2c3d4-e5f6-7890'))")
    .build();
```

### 对键值对进行负向过滤

您可以对元数据、输入和输出键值对使用负过滤，以从结果中排除特定运行。以下是元数据键值对的一些示例，但相同的逻辑适用于输入和输出键值对。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Find all runs where the metadata does not contain a "thread_id" key
client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    filter="and(neq(metadata_key, 'thread_id'))",
)

# Find all runs where the thread_id in metadata is not "a1b2c3d4-e5f6-7890"
client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    filter="and(eq(metadata_key, 'thread_id'), neq(metadata_value, 'a1b2c3d4-e5f6-7890'))",
)

# Find all runs where there is no "thread_id" metadata key and the "a1b2c3d4-e5f6-7890" value is not present
client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    filter="and(neq(metadata_key, 'thread_id'), neq(metadata_value, 'a1b2c3d4-e5f6-7890'))",
)

# Find all runs where the thread_id metadata key is not present but the "a1b2c3d4-e5f6-7890" value is present
client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    filter="and(neq(metadata_key, 'thread_id'), eq(metadata_value, 'a1b2c3d4-e5f6-7890'))",
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// Find all runs where the metadata does not contain a "thread_id" key
client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  filter: `and(neq(metadata_key, 'thread_id'))`,
});

// Find all runs where the thread_id in metadata is not "a1b2c3d4-e5f6-7890"
client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  filter: `and(eq(metadata_key, 'thread_id'), neq(metadata_value, 'a1b2c3d4-e5f6-7890'))`,
});

// Find all runs where there is no "thread_id" metadata key and the "a1b2c3d4-e5f6-7890" value is not present
client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  filter: `and(neq(metadata_key, 'thread_id'), neq(metadata_value, 'a1b2c3d4-e5f6-7890'))`,
});

// Find all runs where the thread_id metadata key is not present but the "a1b2c3d4-e5f6-7890" value is present
client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  filter: `and(neq(metadata_key, 'thread_id'), eq(metadata_value, 'a1b2c3d4-e5f6-7890'))`,
});
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// Find all runs where the metadata does not contain a "thread_id" key
RunQueryV2Params runsWithoutThreadId = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("and(neq(metadata_key, 'thread_id'))")
    .build();

// Find all runs where the thread_id in metadata is not "a1b2c3d4-e5f6-7890"
RunQueryV2Params runsWithOtherThreadId = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("and(eq(metadata_key, 'thread_id'), neq(metadata_value, 'a1b2c3d4-e5f6-7890'))")
    .build();

// Find all runs where there is no "thread_id" metadata key and the "a1b2c3d4-e5f6-7890" value is not present
RunQueryV2Params runsWithoutThreadIdOrValue = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("and(neq(metadata_key, 'thread_id'), neq(metadata_value, 'a1b2c3d4-e5f6-7890'))")
    .build();

// Find all runs where the thread_id metadata key is not present but the "a1b2c3d4-e5f6-7890" value is present
RunQueryV2Params runsWithValueNotThreadId = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("and(neq(metadata_key, 'thread_id'), eq(metadata_value, 'a1b2c3d4-e5f6-7890'))")
    .build();
```

### 组合多个过滤器

如果您想组合多个条件来优化搜索，可以使用 `and` 运算符以及其他过滤功能。以下是您如何搜索名为“ChatOpenAI”的运行，这些运行在其元数据中也具有特定的`thread_id`：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    filter="and(eq(name, 'ChatOpenAI'), eq(metadata_key, 'thread_id'), eq(metadata_value, '69b12c91-b1e2-46ce-91de-794c077e8151'))",
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  filter: `and(eq(name, 'ChatOpenAI'), eq(metadata_key, 'thread_id'), eq(metadata_value, '69b12c91-b1e2-46ce-91de-794c077e8151'))`,
});
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params runs = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("and(eq(name, 'ChatOpenAI'), eq(metadata_key, 'thread_id'), eq(metadata_value, '69b12c91-b1e2-46ce-91de-794c077e8151'))")
    .build();
```

### 树过滤器列出名为“RetrieveDocs”的所有运行，其根运行的“user\_score”反馈为 1，并且完整跟踪中的任何运行都名为“ExpandQuery”。

如果您想要提取跟踪中达到的各种状态或步骤的特定运行条件，则这种类型的查询非常有用。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query(
    project_ids=[project_id],
    min_start_time=since,
    filter='eq(name, "RetrieveDocs")',
    trace_filter='and(eq(feedback_key, "user_score"), eq(feedback_score, 1))',
    tree_filter='eq(name, "ExpandQuery")',
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.runs.query({
  project_ids: [projectId],
  min_start_time: since,
  filter: 'eq(name, "RetrieveDocs")',
  trace_filter: 'and(eq(feedback_key, "user_score"), eq(feedback_score, 1))',
  tree_filter: 'eq(name, "ExpandQuery")',
});
```

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RunQueryV2Params runs = RunQueryV2Params.builder()
    .addProjectId(projectId)
    .minStartTime(since)
    .filter("eq(name, \"RetrieveDocs\")")
    .traceFilter("and(eq(feedback_key, 'user_score'), eq(feedback_score, 1))")
    .treeFilter("eq(name, 'ExpandQuery')")
    .build();
```

## 使用子运行谓词查询跟踪树

使用 `trace_filter` 匹配根运行上的字段，使用 `tree_filter` 匹配跟踪树中任何运行上支持的可搜索字段。对于任意返回的子运行字段（例如嵌套 `inputs`、`outputs` 或 `extra` 负载）的谓词，请使用以下步骤：

1. 使用 `filter`、`trace_filter`、`tree_filter`、`run_type`、元数据过滤器和 `ls_run_depth` [system metadata key](/langsmith/ls-metadata-parameters#ls_run_depth) 缩小候选根跟踪服务器端。
2. 使用 `traces.list_runs` / `traces.listRuns` 获取每个候选轨迹的运行。
3. 将谓词本地应用到不可用作服务器端筛选字段的字段。

以下示例返回根跟踪，其中包含工具运行，其输出包含特定值。服务器端`tree_filter`将候选范围缩小到包含相关工具运行的跟踪，并且本地谓词检查`outputs`有效负载。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio
from datetime import datetime, timedelta, timezone

from langsmith import Client


async def main():
    client = Client()
    project_id = str(client.read_project(project_name="<your_project>").id)

    matching_trace_ids = []
    async for candidate in client.runs.query(
        project_ids=[project_id],
        min_start_time=datetime.now(timezone.utc) - timedelta(days=7),
        is_root=True,
        tree_filter='and(eq(run_type, "tool"), eq(name, "<tool_name>"))',
        selects=["TRACE_ID"],
    ):
        response = await client.traces.list_runs(
            str(candidate.trace_id),
            project_id=project_id,
            selects=["NAME", "RUN_TYPE", "OUTPUTS"],
        )
        if any(
            run.run_type == "tool"
            and run.name == "<tool_name>"
            and "<expected_value>" in str(run.outputs or {})
            for run in response.items
        ):
            matching_trace_ids.append(candidate.trace_id)


asyncio.run(main())
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const projectId = (await client.readProject({ projectName: "<your_project>" })).id;

const matchingTraceIds: string[] = [];
for await (const candidate of client.runs.query({
  project_ids: [projectId],
  min_start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  is_root: true,
  tree_filter: 'and(eq(run_type, "tool"), eq(name, "<tool_name>"))',
  selects: ["TRACE_ID"],
})) {
  const response = await client.traces.listRuns(candidate.trace_id!, {
    project_id: projectId,
    selects: ["NAME", "RUN_TYPE", "OUTPUTS"],
  });
  const hasMatchingChild = (response.items ?? []).some(
    (run) =>
      run.run_type === "tool" &&
      run.name === "<tool_name>" &&
      JSON.stringify(run.outputs ?? {}).includes("<expected_value>"),
  );
  if (hasMatchingChild) {
    matchingTraceIds.push(candidate.trace_id!);
  }
}
```### 高级：导出带有子工具使用情况的扁平化跟踪视图

以下 Python 示例演示如何导出跟踪的扁平视图，包括有关代理在每个跟踪中使用的工具（来自嵌套运行）的信息。
这可用于分析代理在多个跟踪中的行为。

此示例查询指定天数内运行的所有工具，并按跟踪 ID 对它们进行分组。然后，它获取每个根运行的相关信息，例如运行名称、输入、输出，并将该信息与子运行信息组合。

为了优化查询，示例：

1. 查询工具运行时只选择必要的字段，以减少查询时间。
2. 批量获取根运行 ID。根运行的 ID 是其跟踪 ID。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from langsmith import Client


async def main():
    client = Client()
    project_id = str(client.read_project(project_name="my-project").id)
    num_days = 30
    since = datetime.now(timezone.utc) - timedelta(days=num_days)

    # Collect all tools invoked within each trace
    tools_by_trace = defaultdict(set)
    async for run in client.runs.query(
        project_ids=[project_id],
        min_start_time=since,
        run_type="TOOL",
        # We don't need inputs, outputs, and other values that may increase the query time
        selects=["TRACE_ID", "NAME"],
    ):
        tools_by_trace[str(run.trace_id)].add(run.name)

    # Fetch the root runs in batches
    data = []
    trace_ids = list(tools_by_trace)
    trace_batch_size = 50
    for i in range(0, len(trace_ids), trace_batch_size):
        async for root_run in client.runs.query(
            project_ids=[project_id],
            min_start_time=since,
            ids=trace_ids[i : i + trace_batch_size],
            selects=["ID", "NAME", "RUN_TYPE", "INPUTS", "OUTPUTS"],
        ):
            data.append(
                {
                    "run_id": root_run.id,
                    "run_name": root_run.name,
                    "run_type": root_run.run_type,
                    "inputs": root_run.inputs,
                    "outputs": root_run.outputs,
                    "tools_involved": list(tools_by_trace[str(root_run.id)]),
                }
            )
    return data


data = asyncio.run(main())

# (Optional): Convert to a pandas DataFrame
import pandas as pd

df = pd.DataFrame(data)
df.head()
```

### 高级：导出检索器 IO 以获取带有反馈的跟踪

如果您想根据检索器行为微调嵌入或诊断端到端系统性能问题，则此查询非常有用。
以下 Python 示例演示了如何在具有特定反馈分数的跟踪中导出检索器输入和输出。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from langsmith import Client


async def main():
    client = Client()
    project_id = str(client.read_project(project_name="your-project-name").id)
    num_days = 1
    since = datetime.now(timezone.utc) - timedelta(days=num_days)

    # List all retriever runs in traces with "user_score" feedback
    retriever_data = defaultdict(lambda: defaultdict(list))
    async for run in client.runs.query(
        project_ids=[project_id],
        min_start_time=since,
        run_type="RETRIEVER",
        # This time we do want to fetch the inputs and outputs, since they
        # may be adjusted by query expansion steps.
        selects=["TRACE_ID", "INPUTS", "OUTPUTS"],
        trace_filter='eq(feedback_key, "user_score")',
    ):
        for k, v in (run.inputs or {}).items():
            retriever_data[str(run.trace_id)][f"retriever.inputs.{k}"].append(v)
        for k, v in (run.outputs or {}).items():
            retriever_data[str(run.trace_id)][f"retriever.outputs.{k}"].extend(v)

    # Fetch the root runs, with their feedback, in batches
    data = []
    trace_ids = list(retriever_data)
    trace_batch_size = 50
    for i in range(0, len(trace_ids), trace_batch_size):
        async for root_run in client.runs.query(
            project_ids=[project_id],
            min_start_time=since,
            ids=trace_ids[i : i + trace_batch_size],
            selects=["ID", "NAME", "INPUTS", "OUTPUTS", "FEEDBACK_STATS"],
        ):
            feedback = {
                f"feedback.{k}": v.avg
                for k, v in (root_run.feedback_stats or {}).items()
            }
            inputs = {f"inputs.{k}": v for k, v in (root_run.inputs or {}).items()}
            outputs = {f"outputs.{k}": v for k, v in (root_run.outputs or {}).items()}
            data.append(
                {
                    "run_id": root_run.id,
                    "run_name": root_run.name,
                    **inputs,
                    **outputs,
                    **feedback,
                    **retriever_data[str(root_run.id)],
                }
            )
    return data


data = asyncio.run(main())

# (Optional): Convert to a pandas DataFrame
import pandas as pd

df = pd.DataFrame(data)
df.head()
```

## 速率限制`runs.query` (`POST /api/v2/runs/query`) 具有比已弃用的 `POST /runs/query` 端点更高的专用速率限制：LangSmith 云中每个 API 密钥每 10 秒 300 个请求。超过它的请求返回`429 Too Many Requests`。它不受已弃用端点的每租户限制的约束。有关一般最佳实践，请参阅[Run query endpoint rate limits](/langsmith/usage-and-billing#run-query-endpoint)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/export-traces.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。