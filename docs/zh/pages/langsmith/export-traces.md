<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Query traces using the SDK | https://docs.langchain.com/langsmith/export-traces -->

# 使用SDK查询轨迹

查询 [runs](/langsmith/observability-concepts#runs)（LangSmith 迹线中的跨度数据）的推荐方法是使用 [SDK](https://reference.langchain.com/python/langsmith/) 中的 `list_runs` 方法或 [API](/langsmith/smith-api-ref) 中的 `/runs/query` 端点。 LangSmith 以 [Run (span) data format](/langsmith/run-data-format) 中指定的简单格式存储跟踪。

此页面涵盖：

* [Use filter arguments](#use-filter-arguments)：使用SDK参数进行基于关键字的过滤。
* [Use filter query language](#use-filter-query-language)：使用 LangSmith 的过滤语法进行复杂查询。
* [Query trace trees with child-run predicates](#query-trace-trees-with-child-run-predicates)：将服务器端缩小与本地子运行遍历相结合。
* [Rate limits](#rate-limits)：每个租户的限制以及遵守其中的最佳实践。

<Note>
  如果您希望导出大量跟踪，我们建议您使用[Bulk Data Export](/langsmith/data-export)功能，因为它可以更好地处理大数据量，并支持自动重试和跨分区并行化。
</Note>

## 使用过滤器参数

对于简单的查询，您不必依赖我们的查询语法。您可以使用[filter arguments reference](/langsmith/trace-query-syntax#filter-arguments)中指定的过滤器参数。

<Warning>
  **先决条件**

  在运行以下代码片段之前初始化客户端。
</Warning>

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client

  client = Client()
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client, Run } from "langsmith";

  const client = new Client();
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.client.LangsmithClient;
  import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;

  LangsmithClient client = LangsmithOkHttpClient.fromEnv();
  ```
</CodeGroup>

以下是使用关键字参数列出运行的一些方法示例：

### 列出项目中的所有运行

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  project_runs = client.list_runs(project_name="<your_project>")
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // Download runs in a project
  const projectRuns: Run[] = [];
  for await (const run of client.listRuns({
    projectName: "<your_project>",
  })) {
    projectRuns.push(run);
  };
  ``````java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.models.runs.RunQueryParams;

  RunQueryParams projectRuns = RunQueryParams.builder()
      .addSession("<your_project>")
      .build();
  ```
</CodeGroup>

### 列出过去 24 小时内的 LLM 和聊天运行情况

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  todays_llm_runs = client.list_runs(
      project_name="<your_project>",
      start_time=datetime.now() - timedelta(days=1),
      run_type="llm",
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const todaysLlmRuns: Run[] = [];
  for await (const run of client.listRuns({
    projectName: "<your_project>",
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    runType: "llm",
  })) {
    todaysLlmRuns.push(run);
  };
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  OffsetDateTime now = OffsetDateTime.now();
  OffsetDateTime twentyFourHoursAgo = now.minus(24, ChronoUnit.HOURS);

  RunQueryParams todaysLlmRuns = RunQueryParams.builder()
      .runType(RunQueryParams.RunType.LLM)
      .startTime(twentyFourHoursAgo)
      .addSession("<your_project>")
      .limit(50L)
      .build();
  ```
</CodeGroup>

### 列出项目中的根运行

根运行是没有父运行的运行。这些被分配给 `is_root` 的值 `True`。您可以使用它来过滤根运行。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  root_runs = client.list_runs(
      project_name="<your_project>",
      is_root=True
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const rootRuns: Run[] = [];
  for await (const run of client.listRuns({
    projectName: "<your_project>",
    isRoot: 1,
  })) {
    rootRuns.push(run);
  };
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.models.runs.RunQueryParams;

  RunQueryParams rootRuns = RunQueryParams.builder()
      .addSession("<your_project>")
      .isRoot(true)
      .build();
  ```
</CodeGroup>

### 列表运行没有错误

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  correct_runs = client.list_runs(project_name="<your_project>", error=False)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const correctRuns: Run[] = [];
  for await (const run of client.listRuns({
    projectName: "<your_project>",
    error: false,
  })) {
    correctRuns.push(run);
  };
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.models.runs.RunQueryParams;

  RunQueryParams noErrorRuns = RunQueryParams.builder()
      .addSession("<your_project>")
      .error(false)
      .build();
  ```
</CodeGroup>

### 按运行 ID 列出运行

<Warning>
  **忽略其他参数**

  如果您按照上述方式提供运行 ID 列表，它将忽略所有其他过滤参数，如 `project_name`、`run_type` 等，并直接返回与给定 ID 匹配的运行。
</Warning>

如果您有运行 ID 列表，则可以直接列出它们：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  run_ids = ['a36092d2-4ad5-4fb4-9c0d-0dba9a2ed836','9398e6be-964f-4aa4-8ae9-ad78cd4b7074']
  selected_runs = client.list_runs(id=run_ids)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const runIds = [
    "a36092d2-4ad5-4fb4-9c0d-0dba9a2ed836",
    "9398e6be-964f-4aa4-8ae9-ad78cd4b7074",
  ];
  const selectedRuns: Run[] = [];
  for await (const run of client.listRuns({
    id: runIds,
  })) {
    selectedRuns.push(run);
  };
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.models.runs.RunQueryParams;

  RunQueryParams runIdsRuns = RunQueryParams.builder()
      .addSession("<your_project>")
      .id(runIds)
      .build();
  ```
</CodeGroup>

### 通过 ID 获取单次运行

要通过 ID 获取单个运行（跟踪），请使用 `read_run` 方法。当您有特定的跟踪 ID（例如，来自 LangSmith 共享链接，如 `https://smith.langchain.com/public/<trace-id>/r`）并想要检索其完整数据时，这非常有用。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  run_id = "a36092d2-4ad5-4fb4-9c0d-0dba9a2ed836"
  run = client.read_run(run_id)

  # Access run data
  print(run.inputs)
  print(run.outputs)
  print(run.name)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const runId = "a36092d2-4ad5-4fb4-9c0d-0dba9a2ed836";
  const run = await client.readRun(runId);

  // Access run data
  console.log(run.inputs);
  console.log(run.outputs);
  console.log(run.name);
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.models.runs.RunQueryParams;

  RunQueryParams runIdRun = RunQueryParams.builder()
      .addSession("<your_project>")
      .addId(runId)
      .build();
  ```
</CodeGroup>

<Tip>
  **使用 LangGraph 在本地重放跟踪**如果您使用具有检查点功能的 LangGraph，则可以从 LangSmith 获取跟踪并在本地重播以进行调试。有关从检查点恢复执行的详细信息，请参阅[LangGraph's time travel and replay documentation](/oss/python/langgraph/use-time-travel)。
</Tip>

## 使用过滤查询语言

对于更复杂的查询，您可以使用过滤查询语言。以下示例涵盖了最常见的模式。有关完整的运算符和字段参考，包括所有比较器、可过滤字段、值格式化规则和快速参考示例表，请参阅[Trace query syntax: filter query language](/langsmith/trace-query-syntax#filter-query-language)。

### 列出对话线程中的所有根运行

这是在会话线程中获取运行的方法。有关设置线程的更多信息，请参阅我们的[how-to guide on setting up threads](/langsmith/threads)。
通过设置共享线程 ID 对线程进行分组。 LangSmith UI 允许您使用以下元数据键之一：`session_id` 或 `thread_id`。会话 ID 也称为跟踪项目 ID。以下查询与其中任何一个匹配。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  group_key = "<your_thread_id>"
  filter_string = f'and(in(metadata_key, ["session_id","thread_id"]), eq(metadata_value, "{group_key}"))'
  thread_runs = client.list_runs(
      project_name="<your_project>",
      filter=filter_string,
      is_root=True
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const groupKey = "<your_thread_id>";
  const filterString = `and(in(metadata_key, ["session_id","thread_id"]), eq(metadata_value, "${groupKey}"))`;
  const threadRuns: Run[] = [];
  for await (const run of client.listRuns({
    projectName: "<your_project>",
    filter: filterString,
    isRoot: true
  })) {
    threadRuns.push(run);
  };
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.models.runs.RunQueryParams;

  String groupKey = "<your_thread_id>";

  String filterString = String.format(
      "and(in(metadata_key, [\"session_id\",\"thread_id\"]), eq(metadata_value, \"%s\"))",
      groupKey
  );

  RunQueryParams threadRuns = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter(filterString)
      .build();
  ```
</CodeGroup>

### 列出所有名为“extractor”的运行，其跟踪根被分配反馈“user\_score”分数为 1

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.list_runs(
      project_name="<your_project>",
      filter='eq(name, "extractor")',
      trace_filter='and(eq(feedback_key, "user_score"), eq(feedback_score, 1))'
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.listRuns({
    projectName: "<your_project>",
    filter: 'eq(name, "extractor")',
    traceFilter: 'and(eq(feedback_key, "user_score"), eq(feedback_score, 1))'
  })
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  RunQueryParams extractorRuns = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter("eq(name, \"extractor\")")
      .traceFilter("and(eq(feedback_key, \"user_score\"), eq(feedback_score, 1))")
      .build();
  ```
</CodeGroup>

### 列出使用“star\_ rating”键运行且分数大于 4 的列表<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.list_runs(
      project_name="<your_project>",
      filter='and(eq(feedback_key, "star_rating"), gt(feedback_score, 4))'
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.listRuns({
    projectName: "<your_project>",
    filter: 'and(eq(feedback_key, "star_rating"), gt(feedback_score, 4))'
  })
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter("and(eq(feedback_key, \"star_rating\"), gt(feedback_score, 4))")
      .build();
  ```
</CodeGroup>

### 列出耗时超过 5 秒才能完成的运行

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.list_runs(project_name="<your_project>", filter='gt(latency, "5s")')
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.listRuns({projectName: "<your_project>", filter: 'gt(latency, "5s")'})
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter("gt(latency, \"5s\")")
      .build();
  ```
</CodeGroup>

### 列出状态不是“错误”的所有运行

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.list_runs(project_name="<your_project>", filter='neq(status, "error")')
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.listRuns({projectName: "<your_project>", filter: 'neq(status, "error")'})
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter("neq(status, \"error\")")
      .build();
  ```
</CodeGroup>

### 列出 start\_time 大于特定时间戳的所有运行

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.list_runs(project_name="<your_project>", filter='gt(start_time, "2023-07-15T12:34:56Z")')
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.listRuns({projectName: "<your_project>", filter: 'gt(start_time, "2023-07-15T12:34:56Z")'})
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter("gt(start_time, \"2023-07-15T12:34:56Z\")")
      .build();
  ```
</CodeGroup>

### 列出包含字符串“substring”的所有运行

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.list_runs(project_name="<your_project>", filter='search("substring")')
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.listRuns({projectName: "<your_project>", filter: 'search("substring")'})
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter("search(\"substring\")")
      .build();
  ```
</CodeGroup>

### 列出所有用 git 哈希“2aa1cf4”标记的运行

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.list_runs(project_name="<your_project>", filter='has(tags, "2aa1cf4")')
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.listRuns({projectName: "<your_project>", filter: 'has(tags, "2aa1cf4")'})
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter("has(tags, \"2aa1cf4\")")
      .build();
  ```
</CodeGroup>

### 列出在特定时间戳之后开始的所有运行，并且具有非错误状态或“正确性”反馈分数等于 0

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.list_runs(
    project_name="<your_project>",
    filter='and(gt(start_time, "2023-07-15T12:34:56Z"), or(neq(status, "error"), and(eq(feedback_key, "Correctness"), eq(feedback_score, 0.0))))'
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.listRuns({
    projectName: "<your_project>",
    filter: 'and(gt(start_time, "2023-07-15T12:34:56Z"), or(neq(status, "error"), and(eq(feedback_key, "Correctness"), eq(feedback_score, 0.0))))'
  })
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter("and(gt(start_time, \"2023-07-15T12:34:56Z\"), or(neq(status, \"error\"), and(eq(feedback_key, \"Correctness\"), eq(feedback_score, 0.0))))")
      .build();
  ```
</CodeGroup>

### 复杂查询：列出标签包含“experimental”或“beta”且延迟大于 2 秒的所有运行

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.list_runs(
    project_name="<your_project>",
    filter='and(or(has(tags, "experimental"), has(tags, "beta")), gt(latency, 2))'
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.listRuns({
    projectName: "<your_project>",
    filter: 'and(or(has(tags, "experimental"), has(tags, "beta")), gt(latency, 2))'
  })
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter("and(or(has(tags, 'experimental'), has(tags, 'beta')), gt(latency, 2))")
      .build();
  ```
</CodeGroup>

### 通过全文搜索跟踪树

您可以使用不带任何特定字段的 `search()` 函数对运行中的所有字符串字段进行全文搜索。这使您可以快速找到与搜索词匹配的痕迹。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.list_runs(
    project_name="<your_project>",
    filter='search("image classification")'
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.listRuns({
    projectName: "<your_project>",
    filter: 'search("image classification")'
  })
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter("search(\"image classification\")")
      .build();
  ```
</CodeGroup>

### 检查元数据是否存在如果要检查元数据是否存在，可以使用 `eq` 运算符，也可以选择使用 `and` 语句来按值进行匹配。如果您想记录有关跑步的更多结构化信息，这非常有用。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  to_search = {
      "user_id": ""
  }

  # Check for any run with the "user_id" metadata key
  client.list_runs(
    project_name="default",
    filter="eq(metadata_key, 'user_id')"
  )
  # Check for runs with user_id=4070f233-f61e-44eb-bff1-da3c163895a3
  client.list_runs(
    project_name="default",
    filter="and(eq(metadata_key, 'user_id'), eq(metadata_value, '4070f233-f61e-44eb-bff1-da3c163895a3'))"
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // Check for any run with the "user_id" metadata key
  client.listRuns({
    projectName: 'default',
    filter: `eq(metadata_key, 'user_id')`
  });
  // Check for runs with user_id=4070f233-f61e-44eb-bff1-da3c163895a3
  client.listRuns({
    projectName: 'default',
    filter: `and(eq(metadata_key, 'user_id'), eq(metadata_value, '4070f233-f61e-44eb-bff1-da3c163895a3'))`
  });
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter("eq(metadata_key, 'user_id')")
      .build();

  RunQueryParams runs = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter("and(eq(metadata_key, 'user_id'), eq(metadata_value, '4070f233-f61e-44eb-bff1-da3c163895a3'))")
      .build();
  ```
</CodeGroup>

### 检查元数据中的环境详细信息

一种常见的模式是通过元数据将环境信息添加到跟踪中。如果要过滤包含环境元数据的运行，可以使用与上面相同的模式：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.list_runs(
    project_name="default",
    filter="and(eq(metadata_key, 'environment'), eq(metadata_value, 'production'))"
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.listRuns({
    projectName: 'default',
    filter: `and(eq(metadata_key, 'environment'), eq(metadata_value, 'production'))`
  });
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter("and(eq(metadata_key, 'environment'), eq(metadata_value, 'production'))")
      .build();
  ```
</CodeGroup>

### 检查元数据中的线程 ID

在同一对话中关联跟踪的常见方法是使用共享线程 ID。如果您想以这种方式根据线程 ID 过滤运行，您可以在元数据中搜索该 ID。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.list_runs(
    project_name="default",
    filter="and(eq(metadata_key, 'thread_id'), eq(metadata_value, 'a1b2c3d4-e5f6-7890'))"
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.listRuns({
    projectName: 'default',
    filter: `and(eq(metadata_key, 'thread_id'), eq(metadata_value, 'a1b2c3d4-e5f6-7890'))`
  });
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter("and(eq(metadata_key, 'thread_id'), eq(metadata_value, 'a1b2c3d4-e5f6-7890'))")
      .build();
  ```
</CodeGroup>

### 对键值对进行负向过滤

您可以对元数据、输入和输出键值对使用负过滤，以从结果中排除特定运行。以下是元数据键值对的一些示例，但相同的逻辑适用于输入和输出键值对。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Find all runs where the metadata does not contain a "thread_id" key
  client.list_runs(
    project_name="default",
    filter="and(neq(metadata_key, 'thread_id'))"
  )

  # Find all runs where the thread_id in metadata is not "a1b2c3d4-e5f6-7890"
  client.list_runs(
    project_name="default",
    filter="and(eq(metadata_key, 'thread_id'), neq(metadata_value, 'a1b2c3d4-e5f6-7890'))"
  )

  # Find all runs where there is no "thread_id" metadata key and the "a1b2c3d4-e5f6-7890" value is not present
  client.list_runs(
    project_name="default",
    filter="and(neq(metadata_key, 'thread_id'), neq(metadata_value, 'a1b2c3d4-e5f6-7890'))"
  )

  # Find all runs where the thread_id metadata key is not present but the "a1b2c3d4-e5f6-7890" value is present
  client.list_runs(
    project_name="default",
    filter="and(neq(metadata_key, 'thread_id'), eq(metadata_value, 'a1b2c3d4-e5f6-7890'))"
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // Find all runs where the metadata does not contain a "thread_id" key
  client.listRuns({
    projectName: 'default',
    filter: `and(neq(metadata_key, 'thread_id'))`
  });

  // Find all runs where the thread_id in metadata is not "a1b2c3d4-e5f6-7890"
  client.listRuns({
    projectName: 'default',
    filter: `and(eq(metadata_key, 'thread_id'), neq(metadata_value, 'a1b2c3d4-e5f6-7890'))`
  });

  // Find all runs where there is no "thread_id" metadata key and the "a1b2c3d4-e5f6-7890" value is not present
  client.listRuns({
    projectName: 'default',
    filter: `and(neq(metadata_key, 'thread_id'), neq(metadata_value, 'a1b2c3d4-e5f6-7890'))`
  });

  // Find all runs where the thread_id metadata key is not present but the "a1b2c3d4-e5f6-7890" value is present
  client.listRuns({
    projectName: 'default',
    filter: `and(neq(metadata_key, 'thread_id'), eq(metadata_value, 'a1b2c3d4-e5f6-7890'))`
  });
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // Find all runs where the metadata does not contain a "thread_id" key
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("default")
      .filter("and(neq(metadata_key, 'thread_id'))")
      .build();

  // Find all runs where the thread_id in metadata is not "a1b2c3d4-e5f6-7890"
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("default")
      .filter("and(eq(metadata_key, 'thread_id'), neq(metadata_value, 'a1b2c3d4-e5f6-7890'))")
      .build();

  // Find all runs where there is no "thread_id" metadata key and the "a1b2c3d4-e5f6-7890" value is not present
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("default")
      .filter("and(neq(metadata_key, 'thread_id'), neq(metadata_value, 'a1b2c3d4-e5f6-7890'))")
      .build();

  // Find all runs where the thread_id metadata key is not present but the "a1b2c3d4-e5f6-7890" value is present
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("default")
      .filter("and(neq(metadata_key, 'thread_id'), eq(metadata_value, 'a1b2c3d4-e5f6-7890'))")
      .build();
  ```
</CodeGroup>

### 组合多个过滤器如果您想组合多个条件来优化搜索，可以使用 `and` 运算符以及其他过滤功能。以下是您如何搜索名为“ChatOpenAI”的运行，这些运行在其元数据中也具有特定的`thread_id`：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.list_runs(
    project_name="default",
    filter="and(eq(name, 'ChatOpenAI'), eq(metadata_key, 'thread_id'), eq(metadata_value, '69b12c91-b1e2-46ce-91de-794c077e8151'))"
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.listRuns({
    projectName: 'default',
    filter: `and(eq(name, 'ChatOpenAI'), eq(metadata_key, 'thread_id'), eq(metadata_value, '69b12c91-b1e2-46ce-91de-794c077e8151'))`
  });
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter("and(eq(name, 'ChatOpenAI'), eq(metadata_key, 'thread_id'), eq(metadata_value, '69b12c91-b1e2-46ce-91de-794c077e8151'))")
      .build();
  ```
</CodeGroup>

### 树过滤器

列出名为“RetrieveDocs”的所有运行，其根运行的“user\_score”反馈为 1，并且完整跟踪中的任何运行都名为“ExpandQuery”。

如果您想要提取跟踪中达到的各种状态或步骤的特定运行条件，则这种类型的查询非常有用。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.list_runs(
      project_name="<your_project>",
      filter='eq(name, "RetrieveDocs")',
      trace_filter='and(eq(feedback_key, "user_score"), eq(feedback_score, 1))',
      tree_filter='eq(name, "ExpandQuery")'
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  client.listRuns({
    projectName: "<your_project>",
    filter: 'eq(name, "RetrieveDocs")',
    traceFilter: 'and(eq(feedback_key, "user_score"), eq(feedback_score, 1))',
    treeFilter: 'eq(name, "ExpandQuery")'
  })
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  RunQueryParams runs = RunQueryParams.builder()
      .addSession("<your_project>")
      .filter("eq(name, \"RetrieveDocs\")")
      .traceFilter("and(eq(feedback_key, 'user_score'), eq(feedback_score, 1))")
      .treeFilter("eq(name, 'ExpandQuery')")
      .build();
  ```
</CodeGroup>

## 使用子运行谓词查询跟踪树

使用 `trace_filter` 匹配根运行上的字段，使用 `tree_filter` 匹配跟踪树中任何运行上支持的可搜索字段。对于任意返回的子运行字段（例如嵌套 `inputs`、`outputs` 或 `extra` 负载）的谓词，请使用以下步骤：1. 窄候选根跟踪服务器端，包括 `filter`、`trace_filter`、`tree_filter`、`run_type`、元数据过滤器、`parent_run_id` 和 `ls_run_depth` [system metadata key](/langsmith/ls-metadata-parameters#ls_run_depth)。
2. 通过在 Python 中调用 `read_run(..., load_child_runs=True)` 或在 TypeScript 中调用 `readRun(..., { loadChildRuns: true })`，将每个候选根跟踪与子运行水合。
3. 在本地遍历水合`child_runs`树，并将谓词应用于不可用作服务器端过滤字段的字段。

以下示例（Python 0.8 和 JS 0.7）返回根跟踪，其中包含工具运行，其输出包含特定值。服务器端`tree_filter`将候选范围缩小到包含相关工具运行的跟踪，并且本地谓词检查水合的`outputs`有效负载。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from datetime import datetime, timedelta

  from langsmith import Client

  client = Client()
  project_name = "<your_project>"


  def iter_runs(run):
      yield run
      for child in run.child_runs or []:
          yield from iter_runs(child)


  candidate_roots = client.list_runs(
      project_name=project_name,
      is_root=True,
      start_time=datetime.now() - timedelta(days=7),
      tree_filter='and(eq(run_type, "tool"), eq(name, "<tool_name>"))',
      select=["id"],
  )

  matching_roots = []
  for candidate in candidate_roots:
      root = client.read_run(candidate.id, load_child_runs=True)
      has_matching_child = any(
          child.id != root.id
          and child.run_type == "tool"
          and child.name == "<tool_name>"
          and "<expected_value>" in str(child.outputs or {})
          for child in iter_runs(root)
      )
      if has_matching_child:
          matching_roots.append(root)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client, Run } from "langsmith";

  const client = new Client();
  const projectName = "<your_project>";

  function* iterRuns(run: Run): Generator<Run> {
    yield run;
    for (const child of run.child_runs ?? []) {
      yield* iterRuns(child);
    }
  }

  const candidateRoots: Run[] = [];
  for await (const run of client.listRuns({
    projectName,
    isRoot: true,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    treeFilter: 'and(eq(run_type, "tool"), eq(name, "<tool_name>"))',
    select: ["id"],
  })) {
    candidateRoots.push(run);
  }

  const matchingRoots: Run[] = [];
  for (const candidate of candidateRoots) {
    const root = await client.readRun(candidate.id, { loadChildRuns: true });
    const hasMatchingChild = [...iterRuns(root)].some(
      (child) =>
        child.id !== root.id &&
        child.run_type === "tool" &&
        child.name === "<tool_name>" &&
        JSON.stringify(child.outputs ?? {}).includes("<expected_value>"),
    );
    if (hasMatchingChild) {
      matchingRoots.push(root);
    }
  }
  ```
</CodeGroup>

### 高级：导出带有子工具使用情况的扁平化跟踪视图

以下 Python 示例演示了如何导出跟踪的扁平视图，包括有关代理在每个跟踪中使用的工具（来自嵌套运行）的信息。
这可用于分析代理在多个跟踪中的行为。此示例查询指定天数内的所有工具运行，并按其父（根）运行 ID 对它们进行分组。然后，它获取每个根运行的相关信息，例如运行名称、输入、输出，并将该信息与子运行信息组合。

为了优化查询，示例：

1、查询工具运行时只选择必要的字段，以减少查询时间。
2. 批量获取根运行，同时处理工具同时运行。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from collections import defaultdict
  from concurrent.futures import Future, ThreadPoolExecutor
  from datetime import datetime, timedelta

  from langsmith import Client
  from tqdm.auto import tqdm

  client = Client()
  project_name = "my-project"
  num_days = 30

  # List all tool runs
  tool_runs = client.list_runs(
      project_name=project_name,
      start_time=datetime.now() - timedelta(days=num_days),
      run_type="tool",
      # We don't need to fetch inputs, outputs, and other values that # may increase the query time
      select=["trace_id", "name", "run_type"],
  )

  data = []
  futures: list[Future] = []
  trace_cursor = 0
  trace_batch_size = 50

  tool_runs_by_parent = defaultdict(lambda: defaultdict(set))
  # Do not exceed rate limit
  with ThreadPoolExecutor(max_workers=2) as executor:
      # Group tool runs by parent run ID
      for run in tqdm(tool_runs):
          # Collect all tools invoked within a given trace
          tool_runs_by_parent[run.trace_id]["tools_involved"].add(run.name)
          # maybe send a batch of parent run IDs to the server
          # this lets us query for the root runs in batches
          # while still processing the tool runs
          if len(tool_runs_by_parent) % trace_batch_size == 0:
              if this_batch := list(tool_runs_by_parent.keys())[
                  trace_cursor : trace_cursor + trace_batch_size
              ]:
                  trace_cursor += trace_batch_size
                  futures.append(
                      executor.submit(
                          client.list_runs,
                          project_name=project_name,
                          run_ids=this_batch,
                          select=["name", "inputs", "outputs", "run_type"],
                      )
                  )
      if this_batch := list(tool_runs_by_parent.keys())[trace_cursor:]:
          futures.append(
              executor.submit(
                  client.list_runs,
                  project_name=project_name,
                  run_ids=this_batch,
                  select=["name", "inputs", "outputs", "run_type"],
              )
          )

  for future in tqdm(futures):
      root_runs = future.result()
      for root_run in root_runs:
          root_data = tool_runs_by_parent[root_run.id]
          data.append(
              {
                  "run_id": root_run.id,
                  "run_name": root_run.name,
                  "run_type": root_run.run_type,
                  "inputs": root_run.inputs,
                  "outputs": root_run.outputs,
                  "tools_involved": list(root_data["tools_involved"]),
              }
          )

  # (Optional): Convert to a pandas DataFrame
  import pandas as pd

  df = pd.DataFrame(data)
  df.head()
  ```
</CodeGroup>

### 高级：导出检索器 IO 以获取带有反馈的跟踪

如果您想根据检索器行为微调嵌入或诊断端到端系统性能问题，则此查询非常有用。
以下 Python 示例演示了如何在具有特定反馈分数的跟踪中导出检索器输入和输出。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from collections import defaultdict
  from concurrent.futures import Future, ThreadPoolExecutor
  from datetime import datetime, timedelta

  import pandas as pd
  from langsmith import Client
  from tqdm.auto import tqdm

  client = Client()
  project_name = "your-project-name"
  num_days = 1

  # List all tool runs
  retriever_runs = client.list_runs(
      project_name=project_name,
      start_time=datetime.now() - timedelta(days=num_days),
      run_type="retriever",
      # This time we do want to fetch the inputs and outputs, since they
      # may be adjusted by query expansion steps.
      select=["trace_id", "name", "run_type", "inputs", "outputs"],
      trace_filter='eq(feedback_key, "user_score")',
  )

  data = []
  futures: list[Future] = []
  trace_cursor = 0
  trace_batch_size = 50

  retriever_runs_by_parent = defaultdict(lambda: defaultdict(list))
  # Do not exceed rate limit
  with ThreadPoolExecutor(max_workers=2) as executor:
      # Group retriever runs by parent run ID
      for run in tqdm(retriever_runs):
          # Collect all retriever calls invoked within a given trace
          for k, v in run.inputs.items():
              retriever_runs_by_parent[run.trace_id][f"retriever.inputs.{k}"].append(v)
          for k, v in (run.outputs or {}).items():
              # Extend the docs
              retriever_runs_by_parent[run.trace_id][f"retriever.outputs.{k}"].extend(v)
          # maybe send a batch of parent run IDs to the server
          # this lets us query for the root runs in batches
          # while still processing the retriever runs
          if len(retriever_runs_by_parent) % trace_batch_size == 0:
              if this_batch := list(retriever_runs_by_parent.keys())[
                  trace_cursor : trace_cursor + trace_batch_size
              ]:
                  trace_cursor += trace_batch_size
                  futures.append(
                      executor.submit(
                          client.list_runs,
                          project_name=project_name,
                          run_ids=this_batch,
                          select=[
                              "name",
                              "inputs",
                              "outputs",
                              "run_type",
                              "feedback_stats",
                          ],
                      )
                  )
      if this_batch := list(retriever_runs_by_parent.keys())[trace_cursor:]:
          futures.append(
              executor.submit(
                  client.list_runs,
                  project_name=project_name,
                  run_ids=this_batch,
                  select=["name", "inputs", "outputs", "run_type"],
              )
          )

  for future in tqdm(futures):
      root_runs = future.result()
      for root_run in root_runs:
          root_data = retriever_runs_by_parent[root_run.id]
          feedback = {
              f"feedback.{k}": v.get("avg")
              for k, v in (root_run.feedback_stats or {}).items()
          }
          inputs = {f"inputs.{k}": v for k, v in root_run.inputs.items()}
          outputs = {f"outputs.{k}": v for k, v in (root_run.outputs or {}).items()}
          data.append(
              {
                  "run_id": root_run.id,
                  "run_name": root_run.name,
                  **inputs,
                  **outputs,
                  **feedback,
                  **root_data,
              }
          )

  # (Optional): Convert to a pandas DataFrame
  import pandas as pd
  df = pd.DataFrame(data)
  df.head()
  ```
</CodeGroup>

## 速率限制

[⟦T107⟧](/langsmith/smith-api/run/query-runs) 端点（Python 中的[⟦T108⟧](https://reference.langchain.com/python/langsmith/client/Client/list_runs)，JavaScript 中的[⟦T109⟧](https://reference.langchain.com/javascript/langsmith/client/Client/listRuns)）具有根据查询参数而变化的每租户速率限制：| **查询类型** | **限制** | **窗口** |
| ---------------------------------------------------------------- | ----------- | ---------- |
|短时间窗口（≤ 7 天）| 10 个请求 | 10 秒 |
|大时间窗口（> 7 天）| 3 个请求 | 10 秒 |
|全文检索，时间窗口短（≤7天）| 3 个请求 | 10 秒 |
|全文检索，大时间窗口（>7天）| 1 请求 | 10 秒 |
|选择`child_run_ids`，短时间窗口（≤7天）| 3 个请求 | 10 秒 |
|选择`child_run_ids`，大时间窗口（> 7天）| 1 请求 | 10 秒 |

时间窗口由`end_time - start_time`决定。如果未提供`end_time`，LangSmith 将使用当前时间。没有 `start_time` 的查询将被视为大时间窗口查询。

### 最佳实践

为了避免达到速率限制并减少查询时间，特别是对于具有大量输入/输出的运行：* **设置`start_time`**：省略它会触发大时间窗口速率限制层（每10秒3个请求而不是10个）。尽可能使用 7 天或更短的时间窗口。
* **使用`select`**：默认返回所有字段。仅指定您需要的字段（例如，`select=["inputs", "outputs"]`）可以大大减少响应大小和查询时间，特别是对于具有大量输入/输出的运行。
* **设置`limit`**：如果您不需要对所有内容进行分页，则限制结果数量。
* **避免全文搜索**：`filter='search("...")'`具有最严格的速率限制；尽可能使用结构化过滤器（例如，`eq()`、`has()`）。
* **避免选择`child_run_ids`**：这也会触发更严格的速率限制等级。

当您超过这些限制时，API 将返回 `429 Too Many Requests` 响应。有关一般速率限制信息，请参阅[Administration overview](/langsmith/usage-and-billing#rate-limits)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/export-traces.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>