<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Migrate to SmithDB-backed SDK methods | https://docs.langchain.com/langsmith/smithdb-sdk-migration -->

# 迁移到 SmithDB 支持的 SDK 方法

将现有的 LangSmith SDK 方法迁移到 SmithDB 支持的等效方法，以实现更快的代理可观察性。

## 上下文

2026 年 5 月，我们发布了[SmithDB](https://www.langchain.com/blog/introducing-smithdb?utm_source=docs)，这是一个为现代人工智能代理构建的新可观测性数据库。 SmithDB 在每个关键可观测性工作负载中提供业界领先的性能，使核心 LangSmith 体验显着加快。

使用 SmithDB 查询跟踪记录需要新的 SDK 方法。本指南可帮助您迁移代码库。

## 弃用和删除

每个 SDK 方法及其底层端点共享相同的弃用日期。

|部署|弃用 |移除 |
| ----------------- | ---------------- | ----------- |
|所有云区域 | 2026 年 7 月结束 | 2027 年 1 月 31 日 |
|自托管 | `v0.16` | `v0.18` |

有关 LangSmith 如何弃用和删除 API 端点和 SDK 方法的详细信息，请参阅[API and SDK deprecation policy](/langsmith/endpoint-deprecation)。

## 最低 SDK 版本

新的 SDK 方法从以下 SDK 版本开始可用：|语言 |套餐 |最低版本 |
| ---------- | ---------------- | ---------------- |
|蟒蛇 | `langsmith` | `>=0.10.15` |
|打字稿 | `langsmith` | `>=0.8.9` |
|爪哇 | `langsmith-java` | `0.1.0-beta.22` |
|去 | `langsmith-go` | `v0.25.4` |
|命令行 | `langsmith-cli` | `v0.2.44` |

[LangSmith CLI](/langsmith/langsmith-cli) 查询相同的 SmithDB 支持的端点，并且需要 `v0.2.44` 或更高版本。

## 关于自托管

* 本指南中记录的新方法需要 `>=0.16` 自托管版本，独立于所使用的数据存储。
* 一旦 ClickHouse 被禁用，已弃用的方法将停止工作。
* 在可能的情况下，SDK 会发出警告或错误，标识要升级到的版本，而不是在没有任何解释的情况下失败。

## 使用 AI 代理进行迁移

本指南旨在由 AI 编码代理直接获取和应用。将以下提示复制到您的代理中，以将您的代码库迁移到 SmithDB 支持的方法。

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Migrate this codebase's LangSmith SDK usage to the new SmithDB-backed methods.

Fetch https://docs.langchain.com/langsmith/smithdb-sdk-migration.md and treat it
as the source of truth for what changed, including which methods and
parameters are affected, what replaces them, and deployment support.

1. Check the installed LangSmith SDK version against the minimum version
   required for the SmithDB-backed methods per the guide, and upgrade the
   dependency if it does not meet that minimum.
2. Identify every call site in this codebase that uses a method the guide
   marks as migrated, in whichever language(s) this codebase uses.
3. For each call site, apply the corresponding before/after change from the
   guide, including any added, removed, or renamed parameters.

If a call site or parameter is not covered by the guide, stop and ask rather
than guessing.
```

## 运行：查询

查询从具有可选过滤和字段投影的项目运行。返回分页结果集。

### 主要变化

#### 方法名称<Tabs>
  <Tab title="Python">
    |之前 |之后 |
    | -------------------- | -------------------- |
    | `client.list_runs()` | `client.runs.query()` |

    <Note>
      `client.runs.query()` 现在是异步的。用 `await` 来调用它。
    </Note>

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/python/langsmith/_openapi_client/resources/runs/RunsResource/query_v2)。
  </Tab>

  <Tab title="TypeScript">
    |之前 |之后 |
    | ------------------- | -------------------- |
    | `client.listRuns()` | `client.runs.query()` |

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/javascript/langsmith/_openapi_client/Langsmith/Runs/queryV2)。
  </Tab>

  <Tab title="Java">
    |之前 |之后 |
    | ----------------------- | ---------------------------------- |
    | `client.runs().query()` | `client.runs().queryV2()` |

    完整参数列表请参见[reference](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/RunService.html)。
  </Tab>

  <Tab title="Go">
    |之前 |之后 |
    | -------------------- | ----------------------- |
    | `client.Runs.Query()` | `client.Runs.QueryV2()` |

    完整参数列表请参见[reference](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#RunService.QueryV2AutoPaging)。
  </Tab>

  <Tab title="cURL">
    |之前 |之后 |
    | ---------------------------------- | ---------------------------------- |
    | `POST /api/v1/runs/query` | `POST /api/v2/runs/query` |

    有关完整参数和字段列表，请参阅[API doc](/langsmith/smith-api/runs/query-runs)。
  </Tab>
</Tabs>

#### 查询参数<Tabs>
  <Tab title="Python">
    <Warning>
      `runs.query` 不支持`project_name`。改为使用项目 UUID 传递 `project_ids`。要按名称查找 UUID，请在异步代码中使用 `client.read_project(project_name="my-project")` 或 `await client.aread_project(project_name="my-project")`。
    </Warning>

    <Warning>
      省略时，`min_start_time` 默认为 **1 天前**。没有 `start_time` 的 `list_runs` 返回所有历史运行；没有 `min_start_time` 的 `runs.query` 会静默地将查询范围限定为过去 24 小时。如果您需要更宽的窗口，请传递显式的 `min_start_time`。
    </Warning>

    |之前 (`list_runs`) |之后（`runs.query`）|笔记|
    | ---------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
    | `project_name` | *（已删除）* |将 `project_ids` 与 UUID 一起使用 - 请参阅上面的警告 |
    | `project_id` | `project_ids` |现在拿出一个清单；与 `reference_dataset_id` 互斥 || `run_type` | `run_type` |值现在必须为大写：`"LLM"`、`"CHAIN"`、`"TOOL"`、`"RETRIEVER"`、`"EMBEDDING"`、`"PROMPT"`、`"PARSER"` |
    | `trace_id` | `trace_id` |不变 |
    | `reference_example_id` | `reference_examples` |现在获取 UUID 列表 |
    | `query` | *（已删除）* |没有同等的|
    | `filter` | `filter` |语法不变 |
    | `trace_filter` | `trace_filter` |不变 |
    | `tree_filter` | `tree_filter` |不变 || `is_root` | `is_root` |不变 |
    | `parent_run_id` | *（已删除）* |没有同等的|
    | `start_time` | `min_start_time` |更名；默认为 1 天前 - 请参阅上面的警告 |
    | `error` | `has_error` |更名|
    | `run_ids` | `ids` |更名|
    | `select` | `selects` |字段名称现在为大写（`"NAME"`、`"STATUS"` 等）|
    | `limit` | *（已删除）* |使用 `page_size` 作为每个请求的批量大小 || *（不可用）* | `max_start_time` | `start_time` 的上限；默认为现在 |
    | *（不可用）* | `page_size` |每个请求结果计数（默认 100，最大 1000）|
    | *（不可用）* | `reference_dataset_id` |替代`project_ids`；互斥|
    | *（不可用）* | `cursor` |从上一个响应中传递 `next_cursor` 以获取下一页 |
  </Tab>

  <Tab title="TypeScript">
    <Warning>
      `client.runs.query` 不支持`projectName`。改为使用项目 UUID 传递 `project_ids`。要按名称查找 UUID，请使用 `client.readProject({ projectName: "my-project" })`。
    </Warning>

    <Warning>
      省略时，`min_start_time` 默认为 **1 天前**。没有 `startTime` 的 `listRuns` 返回所有历史运行；不带 `min_start_time` 的 `client.runs.query` 会静默地将查询范围限定为过去 24 小时。如果您需要更宽的窗口，请传递显式的 `min_start_time`。
    </Warning>|之前 (`listRuns`) |之后（`client.runs.query`）|笔记|
    | -------------------- | ------------------------ | | ---------------------------------------------------------------------------------------------------------------------------------------------- |
    | `projectName` | *（已删除）* |将 `project_ids` 与 UUID 一起使用 - 请参阅上面的警告 |
    | `projectId` | `project_ids` |更名为`snake_case`；现在需要一个列表；与 `reference_dataset_id` 互斥 |
    | `runType` | `run_type` |更名为`snake_case`；值现在必须为大写：`"LLM"`、`"CHAIN"`、`"TOOL"`、`"RETRIEVER"`、`"EMBEDDING"`、`"PROMPT"`​​、`"PARSER"` |
    | `traceId` | `trace_id` |更名为`snake_case` || `referenceExampleId` | `reference_examples` |更名为`snake_case`；现在获取 UUID 列表 |
    | `query` | *（已删除）* |没有同等的|
    | `filter` | `filter` |语法不变 |
    | `traceFilter` | `trace_filter` |更名为`snake_case` |
    | `treeFilter` | `tree_filter` |更名为`snake_case` |
    | `isRoot` | `is_root` |更名为`snake_case` || `parentRunId` | *（已删除）* |没有同等的|
    | `startTime` | `min_start_time` |更名为`snake_case`；默认为 1 天前 - 请参阅上面的警告 |
    | `error` | `has_error` |更名|
    | `id` | `ids` |更名|
    | `select` | `selects` |字段名称现在为大写（`"NAME"`、`"STATUS"` 等）|
    | `limit` | *（已删除）* |使用 `page_size` 作为每个请求的批量大小 || `order` | *（已删除）* |没有同等的|
    | `executionOrder` | *（已删除）* |没有同等的|
    | *（不可用）* | `max_start_time` | `start_time` 的上限；默认为现在 |
    | *（不可用）* | `page_size` |每个请求结果计数（默认 100，最大 1000）|
    | *（不可用）* | `reference_dataset_id` |替代`project_ids`；互斥|
    | *（不可用）* | `cursor` |从上一个响应中传递 `next_cursor` 以获取下一页 |
  </Tab><Tab title="Java">
    <Warning>
      省略时，`minStartTime()` 默认为 **1 天前**。没有 `startTime()` 的 `query()` 返回所有历史运行；没有 `minStartTime()` 的 `queryV2()` 会静默地将查询范围限定为过去 24 小时。如果您需要更宽的窗口，请传递显式的 `minStartTime()`。
    </Warning>

    |之前 (`RunQueryParams`) |之后（`RunQueryV2Params`）|笔记|
    | ---------------------------------- | -------------------------- | ------------------------------------------------ |
    | `session()` | `projectIds()` |更名；现在采用显式项目 UUID |
    | `runType()` | `runType()` |值现在必须为大写 |
    | `trace()` | `traceId()` |更名|
    | `referenceExample()` | `referenceExamples()` |重命名为复数 |
    | `query()` | *（已删除）* |没有同等的 |
    | `filter()` | `filter()` |语法不变 |
    | `traceFilter()` | `traceFilter()` |不变 || `treeFilter()` | `treeFilter()` |不变 |
    | `isRoot()` | `isRoot()` |不变 |
    | `parentRun()` | *（已删除）* |没有同等的 |
    | `startTime()` | `minStartTime()` |更名；默认为 1 天前 - 请参阅上面的警告 |
    | `error()` | `hasError()` |更名|
    | `id()` | `ids()` |更名|
    | `select()` | `selects()` |字段名称现在为大写 |
    | `limit()` | *（已删除）* |使用`pageSize()` |
    | `order()` | *（已删除）* |没有同等的 |
    | `executionOrder()` | *（已删除）* |没有同等的 |
    | `cursor()` | `cursor()` |不变 || *（不可用）* | `maxStartTime()` |开始时间的上限；默认为现在 |
    | *（不可用）* | `pageSize()` |每个请求结果计数（默认 100，最大 1000）|
    | *（不可用）* | `referenceDatasetId()` | `projectIds()` 的替代方案 |
  </Tab>

  <Tab title="Go">
    <Warning>
      省略时，`MinStartTime` 默认为 **1 天前**。没有 `StartTime` 的 `Query()` 返回所有历史运行；不带 `MinStartTime` 的 `QueryV2()` 会静默地将查询范围限定为过去 24 小时。如果您需要更宽的窗口，请传递显式的 `MinStartTime`。
    </Warning>|之前 (`RunQueryParams`) |之后（`RunQueryV2Params`）|笔记|
    | ---------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------ |
    | `Session` | `ProjectIDs` |更名；现在采用显式项目 UUID |
    | `RunType` | `RunType` |值现在必须为大写：`RunQueryV2ParamsRunTypeLLM`、`RunQueryV2ParamsRunTypeChain` 等 |
    | `Trace` | `TraceID` |更名|
    | `ReferenceExample` | `ReferenceExamples` |重命名为复数 |
    | `Query` | *（已删除）* |没有同等的 |
    | `Filter` | `Filter` |不变 || `TraceFilter` | `TraceFilter` |不变 |
    | `TreeFilter` | `TreeFilter` |不变 |
    | `IsRoot` | `IsRoot` |不变 |
    | `ParentRun` | *（已删除）* |没有同等的 |
    | `StartTime` | `MinStartTime` |更名；默认为 1 天前 - 请参阅上面的警告 |
    | `Error` | `HasError` |更名|
    | `ID` | `IDs` |更名|| `Select` | `Selects` |字段名称常量现在为大写（例如，`RunQueryV2ParamsSelectName`）|
    | `Limit` | *（已删除）* |使用`PageSize` |
    | `Order` | *（已删除）* |没有同等的 |
    | `ExecutionOrder` | *（已删除）* |没有同等的 |
    | `Cursor` | `Cursor` |不变 |
    | *（不可用）* | `MaxStartTime` |开始时间的上限；默认为现在 |
    | *（不可用）* | `PageSize` |每个请求结果计数（默认 100，最大 1000）|| *（不可用）* | `ReferenceDatasetID` | `ProjectIDs` 的替代品 |
  </Tab>

  <Tab title="cURL">
    <Warning>
      省略时，`min_start_time` 默认为 **1 天前**。没有 `start_time` 的 `POST /api/v1/runs/query` 返回所有历史运行；没有 `min_start_time` 的 `POST /api/v2/runs/query` 会静默地将查询范围限定为过去 24 小时。如果您需要更宽的窗口，请传递显式的 `min_start_time`。
    </Warning>

    |之前 (v1 `POST /api/v1/runs/query` 正文字段) |之后 (v2 `POST /api/v2/runs/query` 正文字段) |笔记|
    | ------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
    | `session` | `project_ids` |更名；两者都采用一系列项目 UUID。 `project_ids` 与 `reference_dataset_id` 互斥 |
    | `run_type` | `run_type` |值现在必须为大写：`"LLM"`、`"CHAIN"`、`"TOOL"`、`"RETRIEVER"`、`"EMBEDDING"`、`"PROMPT"`、`"PARSER"` || `trace` | `trace_id` |更名|
    | `reference_example` | `reference_examples` |重命名为复数；现在采用 UUID 数组 |
    | `query` | *（已删除）* |没有同等的|
    | `filter` | `filter` |语法不变 |
    | `trace_filter` | `trace_filter` |不变 || `tree_filter` | `tree_filter` |不变 |
    | `is_root` | `is_root` |不变 |
    | `parent_run` | *（已删除）* |没有同等的|
    | `start_time` | `min_start_time` |更名；默认为 1 天前 - 请参阅上面的警告 |
    | `error` | `has_error` |更名|| `id` | `ids` |重命名为复数 |
    | `select` | `selects` |字段名称现在为大写（`"NAME"`、`"STATUS"` 等）|
    | `limit` | *（已删除）* |使用 `page_size` 作为每个请求的批量大小 |
    | *（不可用）* | `max_start_time` | `start_time` 的上限；默认为现在 |
    | *（不可用）* | `page_size` |每个请求结果计数（默认 100，最大 1000）|| *（不可用）* | `reference_dataset_id` |替代`project_ids`；互斥|
    | *（不可用）* | `cursor` |从上一个响应中传递 `next_cursor` 以获取下一页 |
  </Tab>
</Tabs>

#### 响应字段

<Tabs>
  <Tab title="Python">
    将 SCREAMING\_SNAKE\_CASE 字符串传递给`selects`（例如`"ID"`、`"NAME"`、`"STATUS"`）以控制每个`Run`上填充哪些字段；只有选定的字段是非`None`。默认 `selects` 仅包含 `"ID"`。|之前（v1 `Run` 属性）| (v2 `Run` 属性) | 之后笔记|
    | ------------------------------------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
    | `run.id` | `run.id` |不变；省略 `selects` 时默认返回 |
    | `run.name` | `run.name` |不变 |
    | `run.run_type` | `run.run_type` |值现在为大写文字：`"LLM"`、`"CHAIN"` 等 |
    | `run.status` | `run.status` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` |
    | `run.start_time` | `run.start_time` |不变 || `run.end_time` | `run.end_time` |不变 |
    | `run.error` | `run.error` |不变 |
    | `run.inputs` | `run.inputs` |不变 |
    | `run.outputs` | `run.outputs` |不变 |
    | `run.tags` | `run.tags` |不变 |
    | `run.extra` | `run.extra` |不变 |
    | `run.metadata` | `run.metadata` |不变 || `run.events` | `run.events` |不变 |
    | `run.reference_example_id` | `run.reference_example_id` |不变 |
    | `run.trace_id` | `run.trace_id` |不变 |
    | `run.dotted_order` | `run.dotted_order` |不变 |
    | `run.parent_run_id` | *（已删除）* |使用`run.parent_run_ids`（所有祖先UUID的列表，根在前）|
    | `run.parent_run_ids` | `run.parent_run_ids` |不变 |
    | `run.session_id` | `run.project_id` |更名； `session_id` 是项目 UUID |
    | `run.feedback_stats` | `run.feedback_stats` |不变 || `run.app_path` | `run.app_path` |不变 |
    | `run.attachments` | `run.attachments` | v2 返回预签名的下载 URL，而不是原始字节 |
    | `run.total_tokens` | `run.total_tokens` |不变 |
    | `run.prompt_tokens` | `run.prompt_tokens` |不变 |
    | `run.completion_tokens` | `run.completion_tokens` |不变 |
    | `run.total_cost` | `run.total_cost` |不变 |
    | `run.prompt_cost` | `run.prompt_cost` |不变 |
    | `run.completion_cost` | `run.completion_cost` |不变 || `run.first_token_time` | `run.first_token_time` |不变 |
    | `run.latency`（属性）| `run.latency_seconds` |更名；是一个计算的 `timedelta` 属性，现在是一个原生的 `float` 字段 |
    | `run.in_dataset` | `run.is_in_dataset` |更名|
    | `run.child_run_ids` | *（已删除）* |没有同等的 |
    | `run.child_runs` | *（已删除）* |没有同等的 |
    | `run.serialized` | *（已删除）* |使用`run.manifest` |
    | `run.manifest_id` | *（已删除）* |使用`run.manifest`|| *（不可用）* | `run.is_root` |新 |
    | *（不可用）* | `run.manifest` |新：完整清单对象（替换`serialized`和`manifest_id`）|
    | *（不可用）* | `run.error_preview` |新：截断的错误片段 |
    | *（不可用）* | `run.inputs_preview` |新：截断的输入预览 |
    | *（不可用）* | `run.outputs_preview` |新：截断的输出预览 |
    | *（不可用）* | `run.thread_id` |新：对话线程 UUID |
    | *（不可用）* | `run.reference_dataset_id` |新：参考示例的数据集 UUID || *（不可用）* | `run.share_url` |新功能：公共共享 URL（仅在共享运行时设置）|
    | `run.prompt_token_details` | `run.prompt_token_details.raw` |字段现在包裹了字典；访问`.raw`得到`dict[str, int]`（元素类型不变） |
    | `run.completion_token_details` | `run.completion_token_details.raw` |字段现在包裹了字典；访问`.raw`得到`dict[str, int]`（元素类型不变） |
    | `run.prompt_cost_details` | `run.prompt_cost_details.raw` |字段现在包裹了字典；访问`.raw`以获得`dict[str, float]`（原为`dict[str, Decimal]`）|
    | `run.completion_cost_details` | `run.completion_cost_details.raw` |字段现在包裹了字典；访问`.raw`以获得`dict[str, float]`（原为`dict[str, Decimal]`）|
  </Tab>

  <Tab title="TypeScript">
    将 SCREAMING\_SNAKE\_CASE 字符串传递给 `selects`（例如 `"ID"`、`"NAME"`、`"STATUS"`）以控制每个 `Run` 上填充哪些字段。默认 `selects` 仅包含 `"ID"`。|之前（v1 `Run` 属性）|之后（v2 `Run` 属性）|笔记|
    | -------------------------- | ------------------------------------------ | --------------------------------------------------------------------------- |
    | `run.id` | `run.id` |不变 |
    | `run.name` | `run.name` |不变 |
    | `run.runType` | `run.run_type` |更名为`snake_case`；值现在为大写：`"LLM"`、`"CHAIN"` 等 |
    | `run.status` | `run.status` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` |
    | `run.startTime` | `run.start_time` |更名为`snake_case` |
    | `run.endTime` | `run.end_time` |更名为`snake_case` |
    | `run.error` | `run.error` |不变 || `run.inputs` | `run.inputs` |不变 |
    | `run.outputs` | `run.outputs` |不变 |
    | `run.tags` | `run.tags` |不变 |
    | `run.extra` | `run.extra` |不变 |
    | *（不可用）* | `run.metadata` |新：之前通过 `run.extra.metadata` 访问过 |
    | `run.events` | `run.events` |不变 |
    | `run.referenceExampleId` | `run.reference_example_id` |更名为`snake_case` |
    | `run.traceId` | `run.trace_id` |更名为`snake_case` |
    | `run.dottedOrder` | `run.dotted_order` |更名为`snake_case` || `run.parentRunId` | *（已删除）* |使用`run.parent_run_ids`（所有祖先UUID的列表，根在前）|
    | `run.parentRunIds` | `run.parent_run_ids` |更名为`snake_case` |
    | `run.sessionId` | `run.project_id` |更名； `sessionId` 是项目 UUID |
    | `run.feedbackStats` | `run.feedback_stats` |更名为`snake_case` |
    | `run.appPath` | `run.app_path` |更名为`snake_case` |
    | `run.attachments` | `run.attachments` | v2 返回预签名的下载 URL，而不是原始字节 |
    | `run.totalTokens` | `run.total_tokens` |更名为`snake_case` |
    | `run.promptTokens` | `run.prompt_tokens` |更名为`snake_case` |
    | `run.completionTokens` | `run.completion_tokens` |更名为`snake_case` |
    | `run.totalCost` | `run.total_cost` |更名为`snake_case` || `run.promptCost` | `run.prompt_cost` |更名为`snake_case` |
    | `run.completionCost` | `run.completion_cost` |更名为`snake_case` |
    | `run.firstTokenTime` | `run.first_token_time` |更名为`snake_case` |
    | `run.latency` | `run.latency_seconds` |更名；是一个计算属性，现在是一个本机 `number` 字段（秒） |
    | `run.inDataset` | `run.is_in_dataset` |更名|
    | `run.childRunIds` | *（已删除）* |没有同等的 |
    | `run.childRuns` | *（已删除）* |没有同等的 |
    | `run.serialized` | *（已删除）* |使用`run.manifest` |
    | `run.manifestId` | *（已删除）* |使用`run.manifest` || `run.shareToken` | *（已删除）* |使用`run.share_url`（完整 URL，仅在共享运行时设置）|
    | *（不可用）* | `run.is_root` |新 |
    | *（不可用）* | `run.manifest` |新：完整清单对象（替换`serialized`和`manifestId`）|
    | *（不可用）* | `run.error_preview` |新：截断的错误片段 |
    | *（不可用）* | `run.inputs_preview` |新：截断的输入预览 |
    | *（不可用）* | `run.outputs_preview` |新：截断的输出预览 |
    | *（不可用）* | `run.thread_id` |新：对话线程 UUID |
    | *（不可用）* | `run.reference_dataset_id` |新：参考示例的数据集 UUID |
    | *（不可用）* | `run.share_url` |新功能：公共共享 URL（仅在共享运行时设置）|| *（不可用）* | `run.prompt_token_details` |新：按类别提示令牌细分 |
    | *（不可用）* | `run.completion_token_details` |新：按类别完成标记细分 |
    | *（不可用）* | `run.prompt_cost_details` |新：按类别提示成本明细 |
    | *（不可用）* | `run.completion_cost_details` |新：按类别完成成本明细 |
  </Tab>

  <Tab title="Java">
    通过`.addSelect(...)`添加`RunQueryV2Params.Select`值（例如`Select.NAME`、`Select.STATUS`）来控制填充哪些字段；未选择的字段返回空 `Optional` 值。 `selects()` 默认为`ID`。|之前（`RunSchema`方法）|之后（`Run`方法）|笔记|
    | ------------------------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
    | `run.id()` | `run.id()` |不变 |
    | `run.name()` | `run.name()` |不变 |
    | `run.runType()` | `run.runType()` |值现在为大写：`"LLM"`、`"CHAIN"` 等 |
    | `run.status()` | `run.status()` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` |
    | `run.startTime()` | `run.startTime()` |不变 || `run.endTime()` | `run.endTime()` |不变 |
    | `run.error()` | `run.error()` |不变 |
    | `run.inputs()` | `run.inputs()` |不变 |
    | `run.outputs()` | `run.outputs()` |不变 |
    | `run.tags()` | `run.tags()` |不变 |
    | `run.extra()` | `run.extra()` |不变 |
    | `run.events()` | `run.events()` |不变 || `run.feedbackStats()` | `run.feedbackStats()` |不变 |
    | `run.inputsPreview()` | `run.inputsPreview()` |不变 |
    | `run.outputsPreview()` | `run.outputsPreview()` |不变 |
    | `run.referenceExampleId()` | `run.referenceExampleId()` |不变 |
    | `run.traceId()` | `run.traceId()` |不变 |
    | `run.dottedOrder()` | `run.dottedOrder()` |不变 |
    | `run.parentRunId()` | *（已删除）* |使用`run.parentRunIds()`（所有祖先UUID的列表，根在前）|
    | `run.parentRunIds()` | `run.parentRunIds()` |不变 || `run.sessionId()` | `run.projectId()` |更名； `sessionId()` 返回项目UUID |
    | `run.appPath()` | `run.appPath()` |不变 |
    | `run.firstTokenTime()` | `run.firstTokenTime()` |不变 |
    | `run.totalTokens()` | `run.totalTokens()` |不变 |
    | `run.promptTokens()` | `run.promptTokens()` |不变 |
    | `run.completionTokens()` | `run.completionTokens()` |不变 |
    | `run.totalCost()` | `run.totalCost()` |返回类型从`Optional<String>`更改为`Optional<Double>` |
    | `run.promptCost()` | `run.promptCost()` |返回类型从`Optional<String>`更改为`Optional<Double>` || `run.completionCost()` | `run.completionCost()` |返回类型从`Optional<String>`更改为`Optional<Double>` |
    | `run.promptTokenDetails()` | `run.promptTokenDetails()` |不变 |
    | `run.completionTokenDetails()` | `run.completionTokenDetails()` |不变 |
    | `run.promptCostDetails()` | `run.promptCostDetails()` |不变 |
    | `run.completionCostDetails()` | `run.completionCostDetails()` |不变 |
    | `run.priceModelId()` | `run.priceModelId()` |不变 |
    | `run.inDataset()` | `run.isInDataset()` |更名|
    | `run.referenceDatasetId()` | `run.referenceDatasetId()` |不变 |
    | `run.threadId()` | `run.threadId()` |不变 || `run.shareToken()` | *（已删除）* |使用`run.shareUrl()`（完整URL，仅在共享运行时设置）|
    | `run.childRunIds()` | *（已删除）* |没有同等的|
    | `run.directChildRunIds()` | *（已删除）* |没有同等的|
    | `run.serialized()` | *（已删除）* |使用`run.manifest()` |
    | `run.manifestId()` | *（已删除）* |使用`run.manifest()` |
    | `run.messages()` | *（已删除）* |没有同等的|
    | `run.executionOrder()` | *（已删除）* |没有同等的|| `run.lastQueuedAt()` | *（已删除）* |没有同等的|
    | `run.traceFirstReceivedAt()` | *（已删除）* |没有同等的|
    | `run.traceMaxStartTime()` | *（已删除）* |没有同等的|
    | `run.traceMinStartTime()` | *（已删除）* |没有同等的|
    | `run.traceTier()` | *（已删除）* |没有同等的|
    | `run.traceUpgrade()` | *（已删除）* |没有同等的|
    | `run.ttlSeconds()` | *（已删除）* |没有同等的|| *（不可用）* | `run.attachments()` |新功能：附件的预签名下载 URL（替换 S3 URL 字段）|
    | *（不可用）* | `run.latencySeconds()` |新：挂钟持续时间（以秒为单位）|
    | *（不可用）* | `run.isRoot()` |新 |
    | *（不可用）* | `run.errorPreview()` |新：截断的错误片段 |
    | *（不可用）* | `run.manifest()` |新：完整清单，键入为`Optional<Manifest>`（替换`serialized()`和`manifestId()`）|
    | *（不可用）* | `run.metadata()` |新：元数据，类型为`Optional<Metadata>`（源自`extra.metadata`）|
    | *（不可用）* | `run.shareUrl()` |新功能：公共共享 URL（仅在共享运行时设置）|
    | *（不可用）* | `run.threadEvaluationTime()` |新 |</Tab>

  <Tab title="Go">
    将`RunQueryV2ParamsSelect`常量（例如`RunQueryV2ParamsSelectName`、`RunQueryV2ParamsSelectStatus`）传递给`Selects`来控制填充哪些字段；未选择的字段在返回的结构上为零值。 `Selects` 仅默认为 `ID`。

    |之前（`RunSchema`场）|之后（`Run`字段）|笔记|
    | ---------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
    | `run.ID` | `run.ID` |不变 |
    | `run.Name` | `run.Name` |不变 |
    | `run.RunType` | `run.RunType` |值更改为大写：`"LLM"`、`"CHAIN"` 等 |
    | `run.Status` | `run.Status` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` || `run.TraceID` | `run.TraceID` |不变 |
    | `run.DottedOrder` | `run.DottedOrder` |不变 |
    | `run.AppPath` | `run.AppPath` |不变 |
    | `run.StartTime` | `run.StartTime` |不变 |
    | `run.EndTime` | `run.EndTime` |不变 |
    | `run.Error` | `run.Error` |不变 |
    | `run.Events` | `run.Events` |不变；元素类型现在为 `RunEvent`（原为 `map[string]interface{}`）|
    | `run.Extra` | `run.Extra` |不变；类型现在为 `interface{}`（原为 `map[string]interface{}`）|| `run.FeedbackStats` | `run.FeedbackStats` |不变；元素类型现在为 `RunFeedbackStat` |
    | `run.FirstTokenTime` | `run.FirstTokenTime` |不变 |
    | `run.Inputs` | `run.Inputs` |不变；类型现在为 `interface{}`（原为 `map[string]interface{}`）|
    | `run.InputsPreview` | `run.InputsPreview` |不变 |
    | `run.Outputs` | `run.Outputs` |不变；类型现在为 `interface{}`（原为 `map[string]interface{}`）|
    | `run.OutputsPreview` | `run.OutputsPreview` |不变 |
    | `run.ParentRunIDs` | `run.ParentRunIDs` |不变 |
    | `run.PriceModelID` | `run.PriceModelID` |不变 || `run.PromptCost` | `run.PromptCost` |不变 |
    | `run.PromptCostDetails` | `run.PromptCostDetails.Raw` |字段现在包裹了地图；访问`.Raw`以获得`map[string]float64`（原为`map[string]string`）|
    | `run.PromptTokenDetails` | `run.PromptTokenDetails.Raw` |字段现在包裹了地图；访问`.Raw`得到`map[string]int64`（元素类型不变） |
    | `run.PromptTokens` | `run.PromptTokens` |不变 |
    | `run.CompletionCost` | `run.CompletionCost` |不变 |
    | `run.CompletionCostDetails` | `run.CompletionCostDetails.Raw` |字段现在包裹了地图；访问`.Raw`以获得`map[string]float64`（原为`map[string]string`）|
    | `run.CompletionTokenDetails` | `run.CompletionTokenDetails.Raw` |字段现在包裹了地图；访问`.Raw`得到`map[string]int64`（元素类型不变） |
    | `run.CompletionTokens` | `run.CompletionTokens` |不变 |
    | `run.TotalCost` | `run.TotalCost` |不变 || `run.TotalTokens` | `run.TotalTokens` |不变 |
    | `run.ReferenceDatasetID` | `run.ReferenceDatasetID` |不变 |
    | `run.ReferenceExampleID` | `run.ReferenceExampleID` |不变 |
    | `run.Tags` ​​| `run.Tags` |不变 |
    | `run.ThreadID` | `run.ThreadID` |不变 |
    | `run.SessionID` | `run.ProjectID` |更名|
    | `run.InDataset` | `run.IsInDataset` |更名|
    | `run.ChildRunIDs` | *（已删除）* |没有同等的 || `run.DirectChildRunIDs` | *（已删除）* |没有同等的 |
    | `run.ExecutionOrder` | *（已删除）* |没有同等的 |
    | `run.InputsS3URLs` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `run.LastQueuedAt` | *（已删除）* |没有同等的 |
    | `run.ManifestID` | *（已删除）* |使用`run.Manifest`|
    | `run.ManifestS3ID` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `run.Messages` | *（已删除）* |没有同等的 || `run.OutputsS3URLs` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `run.ParentRunID` | *（已删除）* |使用`run.ParentRunIDs` |
    | `run.S3URLs` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `run.Serialized` | *（已删除）* |使用`run.Manifest` |
    | `run.ShareToken` | *（已删除）* |使用`run.ShareURL`|
    | `run.TraceFirstReceivedAt` | *（已删除）* |没有同等的 |
    | `run.TraceMaxStartTime` | *（已删除）* |没有同等的 || `run.TraceMinStartTime` | *（已删除）* |没有同等的 |
    | `run.TraceTier` | *（已删除）* |没有同等的 |
    | `run.TraceUpgrade` | *（已删除）* |没有同等的 |
    | `run.TtlSeconds` | *（已删除）* |没有同等的 |
    | *（不可用）* | `run.Attachments` |新功能：将附件文件名映射到预签名的下载 URL |
    | *（不可用）* | `run.ErrorPreview` |新：截断的错误片段 |
    | *（不可用）* | `run.IsRoot` |新 || *（不可用）* | `run.LatencySeconds` |新：挂钟持续时间（以秒为单位）|
    | *（不可用）* | `run.Manifest` |新：完整清单对象（替换`Serialized`和`ManifestID`）|
    | *（不可用）* | `run.Metadata` |新功能：任意用户定义的 JSON 元数据 |
    | *（不可用）* | `run.ShareURL` |新功能：公共共享 URL（仅在共享运行时设置）|
    | *（不可用）* | `run.ThreadEvaluationTime` |新 |
  </Tab>

  <Tab title="cURL">
    JSON 响应中的字段名称使用`snake_case`。

    在 `selects` JSON 数组中传递 SCREAMING\_SNAKE\_CASE 字符串（例如 `"ID"`、`"NAME"`、`"STATUS"`）来控制填充哪些字段。默认 `selects` 仅包含 `"ID"`。|之前（v1 响应字段）|之后（v2 响应字段）|笔记|
    | -------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
    | `id` | `id` |不变 |
    | `name` | `name` |不变 |
    | `run_type` | `run_type` |值更改为大写：`"LLM"`、`"CHAIN"` 等 |
    | `status` | `status` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` || `trace_id` | `trace_id` |不变 |
    | `dotted_order` | `dotted_order` |不变 |
    | `app_path` | `app_path` |不变 |
    | `start_time` | `start_time` |不变 |
    | `end_time` | `end_time` |不变 |
    | `error` | `error` |不变 || `events` | `events` |不变 |
    | `extra` | `extra` |不变 |
    | `feedback_stats` | `feedback_stats` |不变 |
    | `first_token_time` | `first_token_time` |不变 |
    | `inputs` | `inputs` |不变 |
    | `inputs_preview` | `inputs_preview` |不变 || `outputs` | `outputs` |不变 |
    | `outputs_preview` | `outputs_preview` |不变 |
    | `parent_run_ids` | `parent_run_ids` |不变 |
    | `price_model_id` | `price_model_id` |不变 |
    | `prompt_cost` | `prompt_cost` |不变 |
    | `prompt_cost_details` | `prompt_cost_details.raw` | Field 现在包裹了对象；读取 `.raw` 以获得相同的 `{category: cost}` 映射，现在带有数值（是字符串） |
    | `prompt_token_details` | `prompt_token_details.raw` | Field 现在包裹了对象；读取 `.raw` 以获得相同的 `{category: count}` 映射（值不变） || `prompt_tokens` | `prompt_tokens` |不变 |
    | `completion_cost` | `completion_cost` |不变 |
    | `completion_cost_details` | `completion_cost_details.raw` | Field 现在包裹了对象；读取 `.raw` 以获得相同的 `{category: cost}` 映射，现在带有数值（是字符串） |
    | `completion_token_details` | `completion_token_details.raw` | Field 现在包裹了对象；读取 `.raw` 以获得相同的 `{category: count}` 映射（值不变） |
    | `completion_tokens` | `completion_tokens` |不变 |
    | `total_cost` | `total_cost` |不变 |
    | `total_tokens` | `total_tokens` |不变 || `reference_dataset_id` | `reference_dataset_id` |不变 |
    | `reference_example_id` | `reference_example_id` |不变 |
    | `tags` | `tags` |不变 |
    | `thread_id` | `thread_id` |不变 |
    | `session_id` | `project_id` |更名|
    | `in_dataset` | `is_in_dataset` |更名|| `child_run_ids` | *（已删除）* |没有同等的 |
    | `direct_child_run_ids` | *（已删除）* |没有同等的 |
    | `execution_order` | *（已删除）* |没有同等的 |
    | `inputs_s3_urls` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `last_queued_at` | *（已删除）* |没有同等的 |
    | `manifest_id` | *（已删除）* |使用`manifest` || `manifest_s3_id` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `messages` | *（已删除）* |没有同等的 |
    | `outputs_s3_urls` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `parent_run_id` | *（已删除）* |使用`parent_run_ids` |
    | `s3_urls` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `serialized` | *（已删除）* |使用`manifest` || `share_token` | *（已删除）* |使用`share_url` |
    | `trace_first_received_at` | *（已删除）* |没有同等的 |
    | `trace_max_start_time` | *（已删除）* |没有同等的 |
    | `trace_min_start_time` | *（已删除）* |没有同等的 |
    | `trace_tier` | *（已删除）* |没有同等的 |
    | `trace_upgrade` | *（已删除）* |没有同等的 || `ttl_seconds` | *（已删除）* |没有同等的 |
    | *（不可用）* | `attachments` |新功能：将附件文件名映射到预签名的下载 URL |
    | *（不可用）* | `error_preview` |新：截断的错误片段 |
    | *（不可用）* | `is_root` |新 |
    | *（不可用）* | `latency_seconds` |新：挂钟持续时间（以秒为单位）|
    | *（不可用）* | `manifest` |新：完整清单对象（替换`serialized`和`manifest_id`）|| *（不可用）* | `metadata` |新：之前嵌套在 `extra.metadata` | 下
    | *（不可用）* | `share_url` |新功能：公共共享 URL（仅在共享运行时设置）|
    | *（不可用）* | `thread_evaluation_time` |新 |
  </Tab>
</Tabs>

### 示例

#### 列出项目中的所有运行

<Tabs>
  <Tab title="Python">
    `runs.query` 不直接接受项目名称。首先用`client.aread_project()`解析项目UUID，然后将其作为字符串传递到`project_ids`。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        runs = client.list_runs(project_name="default")
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            runs = client.runs.query(project_ids=[str(project.id)])


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    `client.runs.query`不直接接受项目名称。首先用`client.readProject()`解析项目UUID，然后将其作为字符串传递到`project_ids`。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const runs = client.listRuns({ projectName: "default" });
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        const runs = client.runs.query({ project_ids: [project.id] });
        ```
      </Tab>
    </Tabs>
  </Tab><Tab title="Java">
    `queryV2()` 不直接接受项目名称。首先用`client.sessions().list()`解析项目UUID，然后将其作为字符串传递到`projectIds()`。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val runs = client.runs().query(
            RunQueryParams.builder().addSession(project.id()).build()
        ).items()
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryV2Params
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val runs = client.runs().queryV2(
            RunQueryV2Params.builder().addProjectId(project.id()).build()
        ).items()
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    `QueryV2()` 不直接接受项目名称。首先用`client.Sessions.List()`解析项目UUID，然后将其作为字符串传递到`ProjectIDs`。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        runs, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        	Session: langsmith.F([]string{project.ID}),
        })
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        runs, err := client.Runs.QueryV2(ctx, langsmith.RunQueryV2Params{
        	ProjectIDs: langsmith.F([]string{project.ID}),
        })
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    `POST /api/v2/runs/query` 不直接接受项目名称。首先使用 `GET /api/v1/sessions` 请求解析项目 UUID，然后将其作为字符串传递到 `project_ids` 中。

    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid]}')"
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{"project_ids": [$pid]}')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 选择字段

<Tabs>
  <Tab title="Python">
    `list_runs` 返回一组默认字段，无需选择。默认情况下，`runs.query` 仅返回 `id` — 通过 `selects=[...]` 请求更多。字段名称现在为大写 (`"name"` → `"NAME"`)。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        # returns a default set of fields; no explicit selection needed
        runs = client.list_runs(project_name="default")
        for run in runs:
            print(run.id, run.name, run.run_type, run.status, run.start_time, run.inputs, run.error)
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            # must explicitly list every field needed; default returns only id
            async for run in client.runs.query(
                project_ids=[str(project.id)],
                selects=["ID", "NAME", "RUN_TYPE", "STATUS", "START_TIME", "INPUTS", "ERROR"],
            ):
                print(run.id, run.name, run.run_type, run.status, run.start_time, run.inputs, run.error)


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab><Tab title="TypeScript">
    `listRuns` 返回一组默认字段，无需选择。默认情况下，`client.runs.query` 仅返回 `id` — 通过 `selects: [...]` 请求更多。字段名称现在为大写 (`"name"` → `"NAME"`)。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        // returns a default set of fields; no explicit selection needed
        const runs = client.listRuns({ projectName: "default" });
        for await (const run of runs) {
          console.log(run.id, run.name, run.run_type, run.status, run.start_time, run.inputs, run.error);
        }
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        // must explicitly list every field needed; default returns only id
        for await (const run of client.runs.query({
          project_ids: [project.id],
          selects: ["ID", "NAME", "RUN_TYPE", "STATUS", "START_TIME", "INPUTS", "ERROR"],
        })) {
          console.log(run.id, run.name, run.run_type, run.status, run.start_time, run.inputs, run.error);
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    `query()` 返回一组默认字段，无需选择。默认情况下，`queryV2()` 仅返回 `id`，为您需要的每个字段调用 `.addSelect(RunQueryV2Params.Select.X)`。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        // returns a default set of fields; no explicit selection needed
        val runs = client.runs().query(
            RunQueryParams.builder().addSession(project.id()).build()
        ).items()
        for (run in runs) {
            println("${run.id()} ${run.name()} ${run.runType()} ${run.status()} ${run.startTime()} ${run.inputs()} ${run.error()}")
        }
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryV2Params
        import com.langchain.smith.models.runs.RunSelectField
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        // must explicitly list every field needed; default returns only id
        val runs = client.runs().queryV2(
            RunQueryV2Params.builder()
                .addProjectId(project.id())
                .addSelect(RunSelectField.ID)
                .addSelect(RunSelectField.NAME)
                .addSelect(RunSelectField.RUN_TYPE)
                .addSelect(RunSelectField.STATUS)
                .addSelect(RunSelectField.START_TIME)
                .addSelect(RunSelectField.INPUTS)
                .addSelect(RunSelectField.ERROR)
                .build()
        ).items()
        for (run in runs) {
            println("${run.id()} ${run.name()} ${run.runType()} ${run.status()} ${run.startTime()} ${run.inputs()} ${run.error()}")
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    `Query` 返回一组默认字段，无需选择。默认情况下，`QueryV2` 仅返回 `ID` — 将 `Selects` 与您需要的大写字段常量一起传递（例如 `RunQueryV2ParamsSelectName`）。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        // returns a default set of fields; no explicit selection needed
        runs, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        	Session: langsmith.F([]string{project.ID}),
        })
        for _, run := range runs.Runs {
        	fmt.Println(run.ID, run.Name, run.RunType, run.Status, run.StartTime, run.Inputs, run.Error)
        }
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        // must explicitly list every field needed; default returns only id
        runs, err := client.Runs.QueryV2(ctx, langsmith.RunQueryV2Params{
        	ProjectIDs: langsmith.F([]string{project.ID}),
        	Selects: langsmith.F([]langsmith.RunSelectField{
        		langsmith.RunSelectFieldID,
        		langsmith.RunSelectFieldName,
        		langsmith.RunSelectFieldRunType,
        		langsmith.RunSelectFieldStatus,
        		langsmith.RunSelectFieldStartTime,
        		langsmith.RunSelectFieldInputs,
        		langsmith.RunSelectFieldError,
        	}),
        })
        for _, run := range runs.Items {
        	fmt.Println(run.ID, run.Name, run.RunType, run.Status, run.StartTime, run.Inputs, run.Error)
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    `POST /api/v1/runs/query` 返回一组默认字段，无需选择。默认情况下，`POST /api/v2/runs/query` 仅返回 `id` — 传递 `selects` 以及您需要的大写字段名称（例如 `"NAME"`）。

    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid]}')"
        ```
      </Tab><Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{"project_ids": [$pid], "selects": ["ID", "NAME", "RUN_TYPE", "STATUS", "START_TIME", "INPUTS", "ERROR"]}')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 按运行类型和时间范围过滤

<Tabs>
  <Tab title="Python">
    `start_time` 已重命名为 `min_start_time`，`run_type` 值现在为大写 (`"llm"` → `"LLM"`)。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from datetime import datetime, timedelta

        from langsmith import Client

        client = Client()
        runs = client.list_runs(
            project_name="default",
            start_time=datetime.now() - timedelta(days=1),
            run_type="llm",
        )
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio
        from datetime import datetime, timedelta

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            runs = client.runs.query(
                project_ids=[str(project.id)],
                min_start_time=datetime.now() - timedelta(days=1),
                run_type="LLM",
            )


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    `startTime` (camelCase) 变为 `min_start_time`（snake\_case，匹配 v2 请求正文），`runType` 值现在为大写 (`"llm"` → `"LLM"`)。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const runs = client.listRuns({
          projectName: "default",
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          runType: "llm",
        });
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const runs = client.runs.query({
          project_ids: [project.id],
          min_start_time: oneDayAgo.toISOString(),
          run_type: "LLM",
        });
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    `.startTime()` 已重命名为 `.minStartTime()`，`.runType()` 现在采用新的 `RunQueryV2Params.RunType` 枚举而不是 `RunTypeEnum`。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import java.time.OffsetDateTime

        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.runs.RunTypeEnum
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val runs = client.runs().query(
            RunQueryParams.builder()
                .addSession(project.id())
                .startTime(OffsetDateTime.now().minusDays(1))
                .runType(RunTypeEnum.LLM)
                .build()
        ).items()
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import java.time.OffsetDateTime

        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryV2Params
        import com.langchain.smith.models.runs.RunType
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val runs = client.runs().queryV2(
            RunQueryV2Params.builder()
                .addProjectId(project.id())
                .minStartTime(OffsetDateTime.now().minusDays(1))
                .runType(RunType.LLM)
                .build()
        ).items()
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    `StartTime` 重命名为 `MinStartTime`，`RunType` 现在采用新的 `RunQueryV2ParamsRunType` 枚举而不是 `RunTypeEnum`。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        runs, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        	Session:   langsmith.F([]string{project.ID}),
        	StartTime: langsmith.F(time.Now().Add(-24 * time.Hour)),
        	RunType:   langsmith.F(langsmith.RunTypeEnumLlm),
        })
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        runs, err := client.Runs.QueryV2(ctx, langsmith.RunQueryV2Params{
        	ProjectIDs:   langsmith.F([]string{project.ID}),
        	MinStartTime: langsmith.F(time.Now().Add(-24 * time.Hour)),
        	RunType:      langsmith.F(langsmith.RunTypeLlm),
        })
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    `start_time` 重命名为 `min_start_time`，`run_type` 值现在为大写 (`"llm"` → `"LLM"`)。<Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid], "run_type": "llm", "start_time": "2025-01-01T00:00:00Z"}')"
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{"project_ids": [$pid], "run_type": "LLM", "min_start_time": "2025-01-01T00:00:00Z"}')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 过滤器根仅运行

<Tabs>
  <Tab title="Python">
    `is_root` 不变。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        runs = client.list_runs(project_name="default", is_root=True)
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            runs = client.runs.query(project_ids=[str(project.id)], is_root=True)


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    `isRoot` (camelCase) 变为 `is_root` (snake\_case, 匹配 v2 请求正文)。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const runs = client.listRuns({ projectName: "default", isRoot: true });
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        const runs = client.runs.query({
          project_ids: [project.id],
          is_root: true,
        });
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    `.isRoot()` 不变。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val runs = client.runs().query(
            RunQueryParams.builder().addSession(project.id()).isRoot(true).build()
        ).items()
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryV2Params
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val runs = client.runs().queryV2(
            RunQueryV2Params.builder().addProjectId(project.id()).isRoot(true).build()
        ).items()
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    `IsRoot` 不变。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        runs, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        	Session: langsmith.F([]string{project.ID}),
        	IsRoot:  langsmith.F(true),
        })
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        runs, err := client.Runs.QueryV2(ctx, langsmith.RunQueryV2Params{
        	ProjectIDs: langsmith.F([]string{project.ID}),
        	IsRoot:     langsmith.F(true),
        })
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    `is_root` 不变。

    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid], "is_root": true}')"
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{"project_ids": [$pid], "is_root": true}')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

<Note>要具体枚举跟踪，请使用 `traces.query` 而不是 `is_root=True`。请参阅[Traces: query](/langsmith/smithdb-sdk-migration#traces-query)：它还通过`trace_aggregates`公开跟踪范围的`total_tokens`/`total_cost`。</Note>

#### 通过 ID 列表获取运行<Tabs>
  <Tab title="Python">
    `id=[...]` 更名为`ids=[...]`。即使按运行 ID 进行过滤，现在也需要 `project_ids` — v1 允许省略项目上下文。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        runs = client.list_runs(id=["<run-id-1>", "<run-id-2>"])
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            runs = client.runs.query(
                project_ids=[str(project.id)],
                ids=["<run-id-1>", "<run-id-2>"],
            )


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    `id: [...]` 更名为`ids: [...]`。即使按运行 ID 进行过滤，现在也需要 `project_ids` — v1 允许省略项目上下文。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const runs = client.listRuns({ id: ["<run-id-1>", "<run-id-2>"] });
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        const runs = client.runs.query({
          project_ids: [project.id],
          ids: ["<run-id-1>", "<run-id-2>"],
        });
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    `.addId(...)` 未更改 - 每个运行 ID 调用一次。即使按运行 ID 进行过滤，现在也需要 `.addProjectId(...)` — v1 允许省略项目上下文。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        var runId1 = "<run-id-1>"
        var runId2 = "<run-id-2>"
        val runs = client.runs().query(
            RunQueryParams.builder()
                .addSession(project.id())
                .addId(runId1)
                .addId(runId2)
                .build()
        ).items()
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryV2Params
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val runs = client.runs().queryV2(
            RunQueryV2Params.builder()
                .addProjectId(project.id())
                .addId("<run-id-1>")
                .addId("<run-id-2>")
                .build()
        ).items()
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    `ID: [...]` 更名为`IDs: [...]`。即使按运行 ID 进行过滤，现在也需要 `ProjectIDs` — v1 允许省略项目上下文。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        runID1 := "<run-id-1>"
        runID2 := "<run-id-2>"
        runs, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        	Session: langsmith.F([]string{project.ID}),
        	ID:      langsmith.F([]string{runID1, runID2}),
        })
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        runID1 := "<run-id-1>"
        runID2 := "<run-id-2>"
        runs, err := client.Runs.QueryV2(ctx, langsmith.RunQueryV2Params{
        	ProjectIDs: langsmith.F([]string{project.ID}),
        	IDs:        langsmith.F([]string{runID1, runID2}),
        })
        ```
      </Tab>
    </Tabs>
  </Tab><Tab title="cURL">
    `id` 更名为`ids`。现在，即使按运行 ID 进行过滤，请求正文中也需要 `project_ids` — v1 允许省略项目上下文。

    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        RUN_ID_1="<run-id-1>"
        RUN_ID_2="<run-id-2>"

        curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg r1 "$RUN_ID_1" --arg r2 "$RUN_ID_2" '{"id": [$r1, $r2]}')"
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        RUN_ID_1="<run-id-1>"
        RUN_ID_2="<run-id-2>"

        curl -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" --arg r1 "$RUN_ID_1" --arg r2 "$RUN_ID_2" '{"project_ids": [$pid], "ids": [$r1, $r2]}')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 迭代运行

<Tabs>
  <Tab title="Python">
    `list_runs` 透明地自动分页，每个 API 调用最多获取 100 次运行，并在返回 `limit` 结果后停止。 `runs.query`不接受总计`limit`；一旦足够，就使用 `async for` 和 `break` 进行迭代，或者使用返回页面的 `has_next_page()`/`get_next_page()` 进行手动逐页控制。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        runs = client.list_runs(project_name="default", limit=150)
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            runs = []
            async for run in client.runs.query(
                project_ids=[str(project.id)],
            ):
                runs.append(run)
                if len(runs) >= 150:
                    break


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    `listRuns` 透明地自动分页。 `client.runs.query` 返回单个运行的异步迭代 - 一旦你有足够的，就使用 `for await` 和 `break`。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const runs: unknown[] = [];
        for await (const run of client.listRuns({ projectName: "default" })) {
          runs.push(run);
          if (runs.length >= 150) break;
        }
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        const runs: unknown[] = [];
        for await (const run of client.runs.query({
          project_ids: [project.id],
        })) {
          runs.push(run);
          if (runs.length >= 150) break;
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    `.autoPager()` 在 `query()` 和 `queryV2()` 上的使用方式相同——一旦运行足够多，就跳出循环。<Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val runs = mutableListOf<Any>()
        for (run in client.runs().query(
            RunQueryParams.builder().addSession(project.id()).build()
        ).autoPager()) {
            runs.add(run)
            if (runs.size >= 150) break
        }
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryV2Params
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val runs = mutableListOf<Any>()
        for (run in client.runs().queryV2(
            RunQueryV2Params.builder().addProjectId(project.id()).build()
        ).autoPager()) {
            runs.add(run)
            if (runs.size >= 150) break
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    `QueryAutoPaging`更名为`QueryV2AutoPaging`；两者都使用相同的`iter.Next()`/`iter.Current()`模式——一旦你有足够的运行就跳出循环。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        runs := []langsmith.RunSchema{}
        iter := client.Runs.QueryAutoPaging(ctx, langsmith.RunQueryParams{
        	Session: langsmith.F([]string{project.ID}),
        })
        for iter.Next() {
        	runs = append(runs, iter.Current())
        	if len(runs) >= 150 {
        		break
        	}
        }
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        runs := []langsmith.Run{}
        iter := client.Runs.QueryV2AutoPaging(ctx, langsmith.RunQueryV2Params{
        	ProjectIDs: langsmith.F([]string{project.ID}),
        })
        for iter.Next() {
        	runs = append(runs, iter.Current())
        	if len(runs) >= 150 {
        		break
        	}
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    v1 API 在一个响应中返回所有匹配的运行，不带光标。 v2 API 分页 — 从响应的 `next_cursor` 字段传递 `cursor` 以获取下一页。

    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid], "limit": 150}')"
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        # Fetch pages, passing the cursor from each response's next_cursor field
        # to fetch the next page, until 150 runs are collected or pages run out.
        TOTAL=0
        CURSOR=""
        while :; do
          BODY=$(jq -n --arg pid "$PROJECT_ID" --arg cursor "$CURSOR" \
            'if $cursor == "" then {"project_ids": [$pid]} else {"project_ids": [$pid], "cursor": $cursor} end')
          RESPONSE=$(curl -s -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
            -H "x-api-key: $LANGSMITH_API_KEY" \
            -H "Content-Type: application/json" \
            -d "$BODY")
          TOTAL=$((TOTAL + $(echo "$RESPONSE" | jq '.items | length')))
          CURSOR=$(echo "$RESPONSE" | jq -r '.next_cursor // empty')
          [ "$TOTAL" -lt 150 ] && [ -n "$CURSOR" ] || break
        done
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 过滤器运行时出现错误

<Tabs>
  <Tab title="Python">
    `error=True/False` 更名为`has_error=True/False`。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        runs = client.list_runs(project_name="default", error=True)
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            runs = client.runs.query(project_ids=[str(project.id)], has_error=True)


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    `error: true/false` 更名为`has_error: true/false`。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const runs = client.listRuns({ projectName: "default", error: true });
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        const runs = client.runs.query({
          project_ids: [project.id],
          has_error: true,
        });
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    `.error(true/false)` 更名为`.hasError(true/false)`。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val runs = client.runs().query(
            RunQueryParams.builder().addSession(project.id()).error(true).build()
        ).items()
        ```
      </Tab><Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryV2Params
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val runs = client.runs().queryV2(
            RunQueryV2Params.builder().addProjectId(project.id()).hasError(true).build()
        ).items()
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    `Error` 更名为`HasError`。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        runs, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        	Session: langsmith.F([]string{project.ID}),
        	Error:   langsmith.F(true),
        })
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        runs, err := client.Runs.QueryV2(ctx, langsmith.RunQueryV2Params{
        	ProjectIDs: langsmith.F([]string{project.ID}),
        	HasError:   langsmith.F(true),
        })
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    `error` 更名为`has_error`。

    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid], "error": true}')"
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{"project_ids": [$pid], "has_error": true}')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 按元数据过滤

<Tabs>
  <Tab title="Python">
    `filter` 字符串语法保持不变：`eq(metadata_key, ...)` 检查键是否存在，与 `eq(metadata_value, ...)` 组合以匹配特定值。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        filter_str = 'and(eq(metadata_key, "user_id"), eq(metadata_value, "u_123"))'
        runs = client.list_runs(project_name="default", filter=filter_str)
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            filter_str = 'and(eq(metadata_key, "user_id"), eq(metadata_value, "u_123"))'
            project = await client.aread_project(project_name="default")
            runs = client.runs.query(project_ids=[str(project.id)], filter=filter_str)


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    `filter` 字符串语法保持不变：`eq(metadata_key, ...)` 检查键是否存在，与 `eq(metadata_value, ...)` 结合以匹配特定值。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const filterStr = 'and(eq(metadata_key, "user_id"), eq(metadata_value, "u_123"))';
        const runs = client.listRuns({ projectName: "default", filter: filterStr });
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const filterStr = 'and(eq(metadata_key, "user_id"), eq(metadata_value, "u_123"))';
        const project = await client.readProject({ projectName: "default" });
        const runs = client.runs.query({
          project_ids: [project.id],
          filter: filterStr,
        });
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    `.filter(...)` 字符串语法保持不变：`eq(metadata_key, ...)` 检查键是否存在，与 `eq(metadata_value, ...)` 结合以匹配特定值。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val filterStr = "and(eq(metadata_key, \"user_id\"), eq(metadata_value, \"u_123\"))"
        val runs = client.runs().query(
            RunQueryParams.builder().addSession(project.id()).filter(filterStr).build()
        ).items()
        ```
      </Tab><Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryV2Params
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val filterStr = "and(eq(metadata_key, \"user_id\"), eq(metadata_value, \"u_123\"))"
        val runs = client.runs().queryV2(
            RunQueryV2Params.builder().addProjectId(project.id()).filter(filterStr).build()
        ).items()
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    `Filter` 字符串语法保持不变：`eq(metadata_key, ...)` 检查键是否存在，与 `eq(metadata_value, ...)` 结合以匹配特定值。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        filterStr := `and(eq(metadata_key, "user_id"), eq(metadata_value, "u_123"))`
        runs, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        	Session: langsmith.F([]string{project.ID}),
        	Filter:  langsmith.F(filterStr),
        })
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        filterStr := `and(eq(metadata_key, "user_id"), eq(metadata_value, "u_123"))`
        runs, err := client.Runs.QueryV2(ctx, langsmith.RunQueryV2Params{
        	ProjectIDs: langsmith.F([]string{project.ID}),
        	Filter:     langsmith.F(filterStr),
        })
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    `filter` 字符串语法保持不变：`eq(metadata_key, ...)` 检查键是否存在，与 `eq(metadata_value, ...)` 结合以匹配特定值。

    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        FILTER='and(eq(metadata_key, "user_id"), eq(metadata_value, "u_123"))'

        curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" --arg f "$FILTER" '{"session": [$pid], "filter": $f}')"
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        FILTER='and(eq(metadata_key, "user_id"), eq(metadata_value, "u_123"))'

        curl -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" --arg f "$FILTER" '{"project_ids": [$pid], "filter": $f}')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 复杂布尔过滤器

<Tabs>
  <Tab title="Python">
    嵌套 `and()` / `or()` 过滤器表达式未更改。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        filter_str = (
            'and(gt(start_time, "2023-07-15T12:34:56Z"),'
            ' or(neq(status, "error"),'
            '    and(eq(feedback_key, "Correctness"), eq(feedback_score, 0.0))))'
        )
        runs = client.list_runs(project_name="default", filter=filter_str)
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            filter_str = (
                'and(gt(start_time, "2023-07-15T12:34:56Z"),'
                ' or(neq(status, "error"),'
                '    and(eq(feedback_key, "Correctness"), eq(feedback_score, 0.0))))'
            )
            project = await client.aread_project(project_name="default")
            runs = client.runs.query(project_ids=[str(project.id)], filter=filter_str)


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    嵌套 `and()` / `or()` 过滤器表达式未更改。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const filterStr =
          'and(gt(start_time, "2023-07-15T12:34:56Z"),' +
          ' or(neq(status, "error"),' +
          '    and(eq(feedback_key, "Correctness"), eq(feedback_score, 0.0))))';
        const runs = client.listRuns({ projectName: "default", filter: filterStr });
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const filterStr =
          'and(gt(start_time, "2023-07-15T12:34:56Z"),' +
          ' or(neq(status, "error"),' +
          '    and(eq(feedback_key, "Correctness"), eq(feedback_score, 0.0))))';
        const project = await client.readProject({ projectName: "default" });
        const runs = client.runs.query({
          project_ids: [project.id],
          filter: filterStr,
        });
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    嵌套 `and()` / `or()` 过滤器表达式未更改。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val filterStr = "and(gt(start_time, \"2023-07-15T12:34:56Z\")," +
            " or(neq(status, \"error\")," +
            "    and(eq(feedback_key, \"Correctness\"), eq(feedback_score, 0.0))))"
        val runs = client.runs().query(
            RunQueryParams.builder().addSession(project.id()).filter(filterStr).build()
        ).items()
        ```
      </Tab><Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryV2Params
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val filterStr = "and(gt(start_time, \"2023-07-15T12:34:56Z\")," +
            " or(neq(status, \"error\")," +
            "    and(eq(feedback_key, \"Correctness\"), eq(feedback_score, 0.0))))"
        val runs = client.runs().queryV2(
            RunQueryV2Params.builder().addProjectId(project.id()).filter(filterStr).build()
        ).items()
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    嵌套 `and()` / `or()` 过滤器表达式未更改。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        filterStr := `and(gt(start_time, "2023-07-15T12:34:56Z"), or(neq(status, "error"), and(eq(feedback_key, "Correctness"), eq(feedback_score, 0.0))))`
        runs, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        	Session: langsmith.F([]string{project.ID}),
        	Filter:  langsmith.F(filterStr),
        })
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        filterStr := `and(gt(start_time, "2023-07-15T12:34:56Z"), or(neq(status, "error"), and(eq(feedback_key, "Correctness"), eq(feedback_score, 0.0))))`
        runs, err := client.Runs.QueryV2(ctx, langsmith.RunQueryV2Params{
        	ProjectIDs: langsmith.F([]string{project.ID}),
        	Filter:     langsmith.F(filterStr),
        })
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    嵌套 `and()` / `or()` 过滤器表达式未更改。

    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        FILTER='and(gt(start_time, "2023-07-15T12:34:56Z"), or(neq(status, "error"), and(eq(feedback_key, "Correctness"), eq(feedback_score, 0.0))))'

        curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" --arg f "$FILTER" '{"session": [$pid], "filter": $f}')"
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        FILTER='and(gt(start_time, "2023-07-15T12:34:56Z"), or(neq(status, "error"), and(eq(feedback_key, "Correctness"), eq(feedback_score, 0.0))))'

        curl -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" --arg f "$FILTER" '{"project_ids": [$pid], "filter": $f}')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 作用域过滤器：filter、trace\_filter、tree\_filter

<Tabs>
  <Tab title="Python">
    `filter`、`trace_filter` 和 `tree_filter` 不变。 `filter` 适用于匹配的运行，`trace_filter` 应用于其跟踪的根，`tree_filter` 应用于跟踪树中的其他运行（同级和子级）。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        runs = client.list_runs(
            project_name="default",
            filter='eq(name, "RetrieveDocs")',
            trace_filter='and(eq(feedback_key, "user_score"), eq(feedback_score, 1))',
            tree_filter='eq(name, "ExpandQuery")',
        )
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            runs = client.runs.query(
                project_ids=[str(project.id)],
                filter='eq(name, "RetrieveDocs")',
                trace_filter='and(eq(feedback_key, "user_score"), eq(feedback_score, 1))',
                tree_filter='eq(name, "ExpandQuery")',
            )


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    `filter`、`trace_filter` 和 `tree_filter` 不变。 `filter` 适用于匹配的运行，`trace_filter` 应用于其跟踪的根，`tree_filter` 应用于跟踪树中的其他运行（同级和子级）。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const runs = client.listRuns({
          projectName: "default",
          filter: 'eq(name, "RetrieveDocs")',
          traceFilter: 'and(eq(feedback_key, "user_score"), eq(feedback_score, 1))',
          treeFilter: 'eq(name, "ExpandQuery")',
        });
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        const runs = client.runs.query({
          project_ids: [project.id],
          filter: 'eq(name, "RetrieveDocs")',
          trace_filter: 'and(eq(feedback_key, "user_score"), eq(feedback_score, 1))',
          tree_filter: 'eq(name, "ExpandQuery")',
        });
        ```
      </Tab>
    </Tabs>
  </Tab><Tab title="Java">
    `.filter()`、`.traceFilter()` 和 `.treeFilter()` 不变。 `filter` 适用于匹配的运行，`traceFilter` 应用于其跟踪的根，`treeFilter` 应用于跟踪树中的其他运行（同级和子级）。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val runs = client.runs().query(
            RunQueryParams.builder()
                .addSession(project.id())
                .filter("eq(name, \"RetrieveDocs\")")
                .traceFilter("and(eq(feedback_key, \"user_score\"), eq(feedback_score, 1))")
                .treeFilter("eq(name, \"ExpandQuery\")")
                .build()
        ).items()
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryV2Params
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()
        val runs = client.runs().queryV2(
            RunQueryV2Params.builder()
                .addProjectId(project.id())
                .filter("eq(name, \"RetrieveDocs\")")
                .traceFilter("and(eq(feedback_key, \"user_score\"), eq(feedback_score, 1))")
                .treeFilter("eq(name, \"ExpandQuery\")")
                .build()
        ).items()
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    `Filter`、`TraceFilter` 和 `TreeFilter` 保持不变。 `Filter` 适用于匹配的运行，`TraceFilter` 应用于其跟踪的根，`TreeFilter` 应用于跟踪树中的其他运行（同级和子级）。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        runs, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        	Session:     langsmith.F([]string{project.ID}),
        	Filter:      langsmith.F(`eq(name, "RetrieveDocs")`),
        	TraceFilter: langsmith.F(`and(eq(feedback_key, "user_score"), eq(feedback_score, 1))`),
        	TreeFilter:  langsmith.F(`eq(name, "ExpandQuery")`),
        })
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        	Name:  langsmith.F("default"),
        	Limit: langsmith.F(int64(1)),
        })
        project := sessions.Items[0]

        runs, err := client.Runs.QueryV2(ctx, langsmith.RunQueryV2Params{
        	ProjectIDs:  langsmith.F([]string{project.ID}),
        	Filter:      langsmith.F(`eq(name, "RetrieveDocs")`),
        	TraceFilter: langsmith.F(`and(eq(feedback_key, "user_score"), eq(feedback_score, 1))`),
        	TreeFilter:  langsmith.F(`eq(name, "ExpandQuery")`),
        })
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    `filter`、`trace_filter` 和 `tree_filter` 不变。 `filter` 适用于匹配的运行，`trace_filter` 应用于其跟踪的根，`tree_filter` 应用于跟踪树中的其他运行（同级和子级）。

    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        FILTER='eq(name, "RetrieveDocs")'
        TRACE_FILTER='and(eq(feedback_key, "user_score"), eq(feedback_score, 1))'
        TREE_FILTER='eq(name, "ExpandQuery")'

        curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n \
            --arg pid "$PROJECT_ID" \
            --arg f "$FILTER" \
            --arg tf "$TRACE_FILTER" \
            --arg treef "$TREE_FILTER" \
            '{"session": [$pid], "filter": $f, "trace_filter": $tf, "tree_filter": $treef}')"
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        FILTER='eq(name, "RetrieveDocs")'
        TRACE_FILTER='and(eq(feedback_key, "user_score"), eq(feedback_score, 1))'
        TREE_FILTER='eq(name, "ExpandQuery")'

        curl -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n \
            --arg pid "$PROJECT_ID" \
            --arg f "$FILTER" \
            --arg tf "$TRACE_FILTER" \
            --arg treef "$TREE_FILTER" \
            '{"project_ids": [$pid], "filter": $f, "trace_filter": $tf, "tree_filter": $treef}')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

## 运行：检索

按 ID 获取单个运行。默认情况下仅返回运行 ID — 指定字段选择列表以检索其他数据。

### 主要变化

#### 方法名称<Tabs>
  <Tab title="Python">
    |之前 |之后|
    | ------------------- | ------------------------ |
    | ⟦T1384​​⟧ | `client.runs.retrieve()` |

    <Note>
      `client.runs.retrieve()` 现在是异步的。用 `await` 来调用它。
    </Note>

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/python/langsmith/_openapi_client/resources/runs/RunsResource/retrieve_v2)。
  </Tab>

  <Tab title="TypeScript">
    |之前 |之后|
    | ------------------ | ------------------------ |
    | `client.readRun()` | `client.runs.retrieve()` |

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/javascript/langsmith/_openapi_client/Langsmith/Runs/retrieveV2)。
  </Tab>

  <Tab title="Java">
    |之前 |之后|
    | -------------------------- | ---------------------------- |
    | `client.runs().retrieve()` | `client.runs().retrieveV2()` |

    完整参数列表请参见[reference](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/RunService.html)。
  </Tab>

  <Tab title="Go">
    |之前 |之后 |
    | ------------------- | -------------------- |
    | `client.Runs.Get()` | `client.Runs.GetV2()` |

    完整参数列表请参见[reference](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#RunService.GetV2)。
  </Tab>

  <Tab title="cURL">
    |之前 |之后|
    | ------------------------ | | ------------------------ | |
    | `GET /api/v1/runs/{run_id}` | `GET /api/v2/runs/{run_id}` |

    有关完整参数和字段列表，请参阅[API doc](/langsmith/smith-api/runs/get-a-single-run)。
  </Tab>
</Tabs>#### 查询参数

<Tabs>
  <Tab title="Python">
    <Warning>
      `runs.retrieve` 需要一个新的 `project_id` 字段，而 `read_run` 不需要。它还接受可选的 `start_time` — 提供它加快检索速度，但不是必需的。
    </Warning>

    |之前 (`read_run`) |之后（`runs.retrieve`）|笔记|
    | ---------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
    | `run_id` | `run_id` |不变 |
    | `load_child_runs` | *（已删除）* |使用 `traces.list_runs` 获取跟踪的运行并按 `parent_run_ids` 进行过滤。请参阅[Load a run's child runs](#load-a-runs-child-runs) |
    | *（不可用）* | `project_id` | **必需** - 拥有运行的项目的 UUID || *（不可用）* | `start_time` |可选 — 运行的开始时间 (RFC3339)；提供它可以加快检索速度|
    | *（默认返回所有字段）* | `selects` |现场投影；仅默认为`["ID"]`；字段名称均为大写 |
  </Tab>

  <Tab title="TypeScript">
    <Warning>
      `client.runs.retrieve` 需要一个新的 `project_id` 字段，而 `readRun` 不需要。它还接受可选的 `start_time` — 提供它加快检索速度，但不是必需的。
    </Warning>|之前 (`readRun`) |之后 (`client.runs.retrieve`) |笔记|
    | ---------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `runId` | `runId` |不变（位置参数）|
    | `options.loadChildRuns` | *（已删除）* |使用 `client.traces.listRuns` 获取跟踪的运行并按 `parent_run_ids` 进行过滤。请参阅[Load a run's child runs](#load-a-runs-child-runs) |
    | *（不可用）* | `project_id` | **必填**—`snake_case`；拥有运行的项目的 UUID |
    | *（不可用）* | `start_time` |可选—`snake_case`；运行的开始时间（RFC3339）；提供它可以加快检索速度|| *（默认返回所有字段）* | `selects` |现场投影；仅默认为`["ID"]`；字段名称均为大写 |
  </Tab>

  <Tab title="Java">
    <Warning>
      `retrieveV2()` 需要 `projectId()`，它替换已删除的 `sessionId()`。 `startTime()` 仍然是可选的——只要它可以加快检索速度，但不是必需的。
    </Warning>

    |之前 (`RunRetrieveParams`) |之后 (`RunRetrieveV2Params`) |笔记|
    | ---------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
    | `runId()` | `runId()` |不变 |
    | `sessionId()` | *（已删除）* |替换为 `projectId()` |
    | `startTime()` | `startTime()` |仍然是可选的；提供它可以加快检索速度|| `excludeS3StoredAttributes()` | *（已删除）* |没有同等的|
    | `excludeSerialized()` | *（已删除）* |没有同等的 |
    | `includeMessages()` | *（已删除）* |没有同等的 |
    | *（不可用）* | `projectId()` | **必需** - 拥有运行的项目的 UUID |
    | *（默认返回所有字段）* | `selects()` |现场投影；仅默认为`["ID"]`；字段名称均为大写 |
  </Tab>

  <Tab title="Go">
    <Warning>
      `GetV2()` 需要 `ProjectID`，它取代了已删除的 `SessionID`。 `StartTime` 仍然是可选的——只要它可以加快检索速度，但不是必需的。
    </Warning>|之前 (`RunGetParams`) |之后 (`RunGetV2Params`) |笔记|
    | ---------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
    | `runID`（位置）| `runID`（位置）|不变 |
    | `ExcludeS3StoredAttributes` | *（已删除）* |没有同等的 |
    | `ExcludeSerialized` | *（已删除）* |没有同等的 |
    | `IncludeMessages` | *（已删除）* |没有同等的 || `SessionID` | *（已删除）* |替换为`ProjectID` |
    | `StartTime` | `StartTime` |仍然是可选的；提供它可以加快检索速度|
    | *（不可用）* | `ProjectID` | **必需** - 拥有运行的项目的 UUID |
    | *（默认返回所有字段）* | `Selects` |现场投影；仅默认为`["ID"]`；字段名称常量为大写（例如，`RunGetV2ParamsSelectName`）|
  </Tab>

  <Tab title="cURL">
    `run_id` 保留在 URL 路径中。所有其他参数都是具有 `snake_case` 名称的查询字符串值。

    <Warning>
      `GET /api/v2/runs/{run_id}` 需要新的 `project_id` 查询参数。 `start_time` 仍然是可选的——只要它可以加快检索速度，但不是必需的。
    </Warning>|之前（`GET /api/v1/runs/{run_id}`参数）| (`GET /api/v2/runs/{run_id}`参数)之后|笔记|
    | ------------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
    | `run_id`（路径）| `run_id`（路径）|不变 |
    | *（不可用）* | `project_id`（查询）| **必需** - 拥有运行的项目的 UUID |
    | `start_time`（查询）| `start_time`（查询）|仍然是可选的；提供它可以加快检索速度|
    | *（默认返回所有字段）* | `selects`（查询，可重复）|现场投影；仅默认为`["ID"]`；字段名称均为大写 |
  </Tab>
</Tabs>

#### 响应字段<Tabs>
  <Tab title="Python">
    将 SCREAMING\_SNAKE\_CASE 字符串传递给`selects`（例如`"ID"`、`"NAME"`、`"STATUS"`）以控制返回的`Run`上填充哪些字段；只有选定的字段是非`None`。默认 `selects` 仅包含 `"ID"`。

    |之前（v1 `Run` 属性）| (v2 `Run` 属性) | 之后笔记|
    | ------------------------------------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
    | `run.id` | `run.id` |不变；省略 `selects` 时默认返回 |
    | `run.name` | `run.name` |不变 |
    | `run.run_type` | `run.run_type` |值现在为大写文字：`"LLM"`、`"CHAIN"` 等 || `run.status` | `run.status` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` |
    | `run.start_time` | `run.start_time` |不变 |
    | `run.end_time` | `run.end_time` |不变 |
    | `run.error` | `run.error` |不变 |
    | `run.inputs` | `run.inputs` |不变 |
    | `run.outputs` | `run.outputs` |不变 || `run.tags` | `run.tags` |不变 |
    | `run.extra` | `run.extra` |不变 |
    | `run.metadata` | `run.metadata` |不变 |
    | `run.events` | `run.events` |不变 |
    | `run.reference_example_id` | `run.reference_example_id` |不变 |
    | `run.trace_id` | `run.trace_id` |不变 || `run.dotted_order` | `run.dotted_order` |不变 |
    | `run.parent_run_id` | *（已删除）* |使用`run.parent_run_ids`（所有祖先UUID的列表，根在前）|
    | `run.parent_run_ids` | `run.parent_run_ids` |不变 |
    | `run.session_id` | `run.project_id` |更名； `session_id` 是项目 UUID |
    | `run.feedback_stats` | `run.feedback_stats` |不变 |
    | `run.app_path` | `run.app_path` |不变 || `run.attachments` | `run.attachments` | v2 返回预签名的下载 URL，而不是原始字节 |
    | `run.total_tokens` | `run.total_tokens` |不变 |
    | `run.prompt_tokens` | `run.prompt_tokens` |不变 |
    | `run.completion_tokens` | `run.completion_tokens` |不变 |
    | `run.total_cost` | `run.total_cost` |不变 |
    | `run.prompt_cost` | `run.prompt_cost` |不变 || `run.completion_cost` | `run.completion_cost` |不变 |
    | `run.first_token_time` | `run.first_token_time` |不变 |
    | `run.latency`（财产）| `run.latency_seconds` |更名；是一个计算的 `timedelta` 属性，现在是一个原生的 `float` 字段 |
    | `run.in_dataset` | `run.is_in_dataset` |更名|
    | `run.child_run_ids` | *（已删除）* |过滤 `parent_run_ids` 上的跟踪运行。请参阅[Load a run's child runs](#load-a-runs-child-runs) |
    | `run.child_runs` | *（已删除）* |按 `parent_run_ids` 中的最后一个条目对跟踪运行进行分组。请参阅[Load a run's child runs](#load-a-runs-child-runs) |
    | `run.serialized` | *（已删除）* |使用`run.manifest`|| `run.manifest_id` | *（已删除）* |使用`run.manifest` |
    | *（不可用）* | `run.is_root` |新 |
    | *（不可用）* | `run.manifest` |新：完整清单对象（替换`serialized`和`manifest_id`）|
    | *（不可用）* | `run.error_preview` |新：截断的错误片段 |
    | *（不可用）* | `run.inputs_preview` |新：截断的输入预览 |
    | *（不可用）* | `run.outputs_preview` |新：截断的输出预览 || *（不可用）* | `run.thread_id` |新：对话线程 UUID |
    | *（不可用）* | `run.reference_dataset_id` |新：参考示例的数据集 UUID |
    | *（不可用）* | `run.share_url` |新功能：公共共享 URL（仅在共享运行时设置）|
    | `run.prompt_token_details` | `run.prompt_token_details.raw` |字段现在包裹了字典；访问`.raw`得到`dict[str, int]`（元素类型不变） |
    | `run.completion_token_details` | `run.completion_token_details.raw` |字段现在包裹了字典；访问`.raw`得到`dict[str, int]`（元素类型不变） |
    | `run.prompt_cost_details` | `run.prompt_cost_details.raw` |字段现在包裹了字典；访问`.raw`以获得`dict[str, float]`（原为`dict[str, Decimal]`）|
    | `run.completion_cost_details` | `run.completion_cost_details.raw` |字段现在包裹了字典；访问`.raw`以获得`dict[str, float]`（原为`dict[str, Decimal]`）|
  </Tab><Tab title="TypeScript">
    将 SCREAMING\_SNAKE\_CASE 字符串传递给`selects`（例如`"ID"`、`"NAME"`、`"STATUS"`）以控制返回的`Run`上填充哪些字段。默认 `selects` 仅包含 `"ID"`。

    |之前（v1 `Run` 属性）|之后（v2 `Run` 属性）|笔记|
    | -------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
    | `run.id` | `run.id` |不变 |
    | `run.name` | `run.name` |不变 |
    | `run.runType` | `run.run_type` |更名为`snake_case`；值现在为大写：`"LLM"`、`"CHAIN"` 等 || `run.status` | `run.status` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` |
    | `run.startTime` | `run.start_time` |更名为`snake_case` |
    | `run.endTime` | `run.end_time` |更名为`snake_case` |
    | `run.error` | `run.error` |不变 |
    | `run.inputs` | `run.inputs` |不变 |
    | `run.outputs` | `run.outputs` |不变 || `run.tags` | `run.tags` |不变 |
    | `run.extra` | `run.extra` |不变 |
    | *（不可用）* | `run.metadata` |新：之前通过 `run.extra.metadata` 访问过 |
    | `run.events` | `run.events` |不变 |
    | `run.referenceExampleId` | `run.reference_example_id` |更名为`snake_case` |
    | `run.traceId` | `run.trace_id` |更名为`snake_case` |
    | `run.dottedOrder` | `run.dotted_order` |更名为`snake_case` || `run.parentRunId` | *（已删除）* |使用`run.parent_run_ids`（所有祖先UUID的列表，根在前）|
    | `run.parentRunIds` | `run.parent_run_ids` |更名为`snake_case` |
    | `run.sessionId` | `run.project_id` |更名； `sessionId` 是项目 UUID |
    | `run.feedbackStats` | `run.feedback_stats` |更名为`snake_case` |
    | `run.appPath` | `run.app_path` |更名为`snake_case` |
    | `run.attachments` | `run.attachments` | v2 返回预签名的下载 URL，而不是原始字节 |
    | `run.totalTokens` | `run.total_tokens` |更名为`snake_case` || `run.promptTokens` | `run.prompt_tokens` |更名为`snake_case` |
    | `run.completionTokens` | `run.completion_tokens` |更名为`snake_case` |
    | `run.totalCost` | `run.total_cost` |更名为`snake_case` |
    | `run.promptCost` | `run.prompt_cost` |更名为`snake_case` |
    | `run.completionCost` | `run.completion_cost` |更名为`snake_case` |
    | `run.firstTokenTime` | `run.first_token_time` |更名为`snake_case` |
    | `run.latency` | `run.latency_seconds` |更名；是一个计算属性，现在是一个本机 `number` 字段（秒） || `run.inDataset` | `run.is_in_dataset` |更名|
    | `run.child_run_ids` | *（已删除）* |过滤 `parent_run_ids` 上的跟踪运行。请参阅[Load a run's child runs](#load-a-runs-child-runs) |
    | `run.child_runs` | *（已删除）* |按 `parent_run_ids` 中的最后一个条目对跟踪运行进行分组。请参阅[Load a run's child runs](#load-a-runs-child-runs) |
    | `run.serialized` | *（已删除）* |使用`run.manifest` |
    | `run.manifestId` | *（已删除）* |使用`run.manifest` |
    | `run.shareToken` | *（已删除）* |使用`run.share_url`（完整 URL，仅在共享运行时设置）|
    | *（不可用）* | `run.is_root` |新 || *（不可用）* | `run.manifest` |新：完整清单对象（替换`serialized`和`manifestId`）|
    | *（不可用）* | `run.error_preview` |新：截断的错误片段 |
    | *（不可用）* | `run.inputs_preview` |新：截断的输入预览 |
    | *（不可用）* | `run.outputs_preview` |新：截断的输出预览 |
    | *（不可用）* | `run.thread_id` |新：对话线程 UUID |
    | *（不可用）* | `run.reference_dataset_id` |新：参考示例的数据集 UUID || *（不可用）* | `run.share_url` |新功能：公共共享 URL（仅在共享运行时设置）|
    | *（不可用）* | `run.prompt_token_details` |新：按类别提示令牌细分 |
    | *（不可用）* | `run.completion_token_details` |新：按类别完成标记细分 |
    | *（不可用）* | `run.prompt_cost_details` |新：按类别提示成本明细 |
    | *（不可用）* | `run.completion_cost_details` |新：按类别完成成本明细 |
  </Tab>

  <Tab title="Java">
    通过`.addSelect(...)`添加`RunRetrieveV2Params.Select`值（例如`Select.NAME`、`Select.STATUS`）来控制填充哪些字段；未选择的字段返回空 `Optional` 值。 `selects()` 仅默认为 `ID`。|之前（`RunSchema`方法）|之后（`Run`方法）|笔记|
    | ------------------------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
    | `run.id()` | `run.id()` |不变 |
    | `run.name()` | `run.name()` |不变 |
    | `run.runType()` | `run.runType()` |值现在为大写：`"LLM"`、`"CHAIN"` 等 |
    | `run.status()` | `run.status()` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` |
    | `run.startTime()` | `run.startTime()` |不变 || `run.endTime()` | `run.endTime()` |不变 |
    | `run.error()` | `run.error()` |不变 |
    | `run.inputs()` | `run.inputs()` |不变 |
    | `run.outputs()` | `run.outputs()` |不变 |
    | `run.tags()` | `run.tags()` |不变 |
    | `run.extra()` | `run.extra()` |不变 |
    | `run.events()` | `run.events()` |不变 || `run.feedbackStats()` | `run.feedbackStats()` |不变 |
    | `run.inputsPreview()` | `run.inputsPreview()` |不变 |
    | `run.outputsPreview()` | `run.outputsPreview()` |不变 |
    | `run.referenceExampleId()` | `run.referenceExampleId()` |不变 |
    | `run.traceId()` | `run.traceId()` |不变 |
    | `run.dottedOrder()` | `run.dottedOrder()` |不变 |
    | `run.parentRunId()` | *（已删除）* |使用`run.parentRunIds()`（所有祖先UUID的列表，根在前）|
    | `run.parentRunIds()` | `run.parentRunIds()` |不变 || `run.sessionId()` | `run.projectId()` |更名； `sessionId()` 返回项目 UUID |
    | `run.appPath()` | `run.appPath()` |不变 |
    | `run.firstTokenTime()` | `run.firstTokenTime()` |不变 |
    | `run.totalTokens()` | `run.totalTokens()` |不变 |
    | `run.promptTokens()` | `run.promptTokens()` |不变 |
    | `run.completionTokens()` | `run.completionTokens()` |不变 |
    | `run.totalCost()` | `run.totalCost()` |返回类型从 `Optional<String>` 更改为 `Optional<Double>` |
    | `run.promptCost()` | `run.promptCost()` |返回类型从 `Optional<String>` 更改为 `Optional<Double>` || `run.completionCost()` | `run.completionCost()` |返回类型从 `Optional<String>` 更改为 `Optional<Double>` |
    | `run.promptTokenDetails()` | `run.promptTokenDetails()` |不变 |
    | `run.completionTokenDetails()` | `run.completionTokenDetails()` |不变 |
    | `run.promptCostDetails()` | `run.promptCostDetails()` |不变 |
    | `run.completionCostDetails()` | `run.completionCostDetails()` |不变 |
    | `run.priceModelId()` | `run.priceModelId()` |不变 |
    | `run.inDataset()` | `run.isInDataset()` |更名|
    | `run.referenceDatasetId()` | `run.referenceDatasetId()` |不变 || `run.threadId()` | `run.threadId()` |不变 |
    | `run.shareToken()` | *（已删除）* |使用`run.shareUrl()`（完整URL，仅在共享运行时设置）|
    | `run.childRunIds()` | *（已删除）* |没有同等的|
    | `run.directChildRunIds()` | *（已删除）* |没有同等的|
    | `run.serialized()` | *（已删除）* |使用`run.manifest()` |
    | `run.manifestId()` | *（已删除）* |使用`run.manifest()`|
    | `run.messages()` | *（已删除）* |没有同等的|| `run.executionOrder()` | *（已删除）* |没有同等的|
    | `run.lastQueuedAt()` | *（已删除）* |没有同等的|
    | `run.traceFirstReceivedAt()` | *（已删除）* |没有同等的|
    | `run.traceMaxStartTime()` | *（已删除）* |没有同等的|
    | `run.traceMinStartTime()` | *（已删除）* |没有同等的|
    | `run.traceTier()` | *（已删除）* |没有同等的|
    | `run.traceUpgrade()` | *（已删除）* |没有同等的|| `run.ttlSeconds()` | *（已删除）* |没有同等的|
    | *（不可用）* | `run.attachments()` |新功能：附件的预签名下载 URL（替换 S3 URL 字段）|
    | *（不可用）* | `run.latencySeconds()` |新：挂钟持续时间（以秒为单位）|
    | *（不可用）* | `run.isRoot()` |新 |
    | *（不可用）* | `run.errorPreview()` |新：截断的错误片段 |
    | *（不可用）* | `run.manifest()` |新：完整清单，输入为 `Optional<Manifest>`（替换 `serialized()` 和 `manifestId()`）|
    | *（不可用）* | `run.metadata()` |新：元数据，类型为`Optional<Metadata>`（源自`extra.metadata`）|| *（不可用）* | `run.shareUrl()` |新功能：公共共享 URL（仅在共享运行时设置）|
    | *（不可用）* | `run.threadEvaluationTime()` |新 |
  </Tab>

  <Tab title="Go">
    将`RunGetV2ParamsSelect`常量（例如`RunGetV2ParamsSelectName`、`RunGetV2ParamsSelectStatus`）传递给`Selects`来控制填充哪些字段；未选择的字段在返回的结构上为零值。 `Selects` 仅默认为 `ID`。|之前（`RunSchema`字段）|之后（`Run`字段）|笔记|
    | ---------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
    | `run.ID` | `run.ID` |不变 |
    | `run.Name` | `run.Name` |不变 |
    | `run.RunType` | `run.RunType` |值更改为大写：`"LLM"`、`"CHAIN"` 等 |
    | `run.Status` | `run.Status` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` |
    | `run.TraceID` | `run.TraceID` |不变 || `run.DottedOrder` | `run.DottedOrder` |不变 |
    | `run.AppPath` | `run.AppPath` |不变 |
    | `run.StartTime` | `run.StartTime` |不变 |
    | `run.EndTime` | `run.EndTime` |不变 |
    | `run.Error` | `run.Error` |不变 |
    | `run.Events` | `run.Events` |不变；元素类型现在为 `RunEvent`（原为 `map[string]interface{}`）|
    | `run.Extra` | `run.Extra` |不变；类型现在为 `interface{}`（原为 `map[string]interface{}`）|
    | `run.FeedbackStats` | `run.FeedbackStats` |不变；元素类型现在为 `RunFeedbackStat` || `run.FirstTokenTime` | `run.FirstTokenTime` |不变 |
    | `run.Inputs` | `run.Inputs` |不变；类型现在为 `interface{}`（原为 `map[string]interface{}`）|
    | `run.InputsPreview` | `run.InputsPreview` |不变 |
    | `run.Outputs` | `run.Outputs` |不变；类型现在为 `interface{}`（原为 `map[string]interface{}`）|
    | `run.OutputsPreview` | `run.OutputsPreview` |不变 |
    | `run.ParentRunIDs` | `run.ParentRunIDs` |不变 |
    | `run.PriceModelID` | `run.PriceModelID` |不变 |
    | `run.PromptCost` | `run.PromptCost` |不变 || `run.PromptCostDetails` | `run.PromptCostDetails.Raw` |字段现在包裹了地图；访问`.Raw`以获得`map[string]float64`（原为`map[string]string`）|
    | `run.PromptTokenDetails` | `run.PromptTokenDetails.Raw` |字段现在包裹了地图；访问`.Raw`得到`map[string]int64`（元素类型不变）|
    | `run.PromptTokens` | `run.PromptTokens` |不变 |
    | `run.CompletionCost` | `run.CompletionCost` |不变 |
    | `run.CompletionCostDetails` | `run.CompletionCostDetails.Raw` |字段现在包裹了地图；访问`.Raw`以获得`map[string]float64`（原为`map[string]string`）|
    | `run.CompletionTokenDetails` | `run.CompletionTokenDetails.Raw` |字段现在包裹了地图；访问`.Raw`得到`map[string]int64`（元素类型不变）|
    | `run.CompletionTokens` | `run.CompletionTokens` |不变 |
    | `run.TotalCost` | `run.TotalCost` |不变 |
    | `run.TotalTokens` | `run.TotalTokens` |不变 || `run.ReferenceDatasetID` | `run.ReferenceDatasetID` |不变 |
    | `run.ReferenceExampleID` | `run.ReferenceExampleID` |不变 |
    | `run.Tags` | `run.Tags` |不变 |
    | `run.ThreadID` | `run.ThreadID` |不变 |
    | `run.SessionID` | `run.ProjectID` |更名|
    | `run.InDataset` | `run.IsInDataset` |更名|
    | `run.ChildRunIDs` | *（已删除）* |没有同等的 |
    | `run.DirectChildRunIDs` | *（已删除）* |没有同等的 || `run.ExecutionOrder` | *（已删除）* |没有同等的 |
    | `run.InputsS3URLs` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `run.LastQueuedAt` | *（已删除）* |没有同等的 |
    | `run.ManifestID` | *（已删除）* |使用`run.Manifest` |
    | `run.ManifestS3ID` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `run.Messages` | *（已删除）* |没有同等的 |
    | `run.OutputsS3URLs` | *（已删除）* |内部存储URL； v2 中未公开 || `run.ParentRunID` | *（已删除）* |使用`run.ParentRunIDs` |
    | `run.S3URLs` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `run.Serialized` | *（已删除）* |使用`run.Manifest` |
    | `run.ShareToken` | *（已删除）* |使用`run.ShareURL` |
    | `run.TraceFirstReceivedAt` | *（已删除）* |没有同等的 |
    | `run.TraceMaxStartTime` | *（已删除）* |没有同等的 |
    | `run.TraceMinStartTime` | *（已删除）* |没有同等的 || `run.TraceTier` | *（已删除）* |没有同等的 |
    | `run.TraceUpgrade` | *（已删除）* |没有同等的 |
    | `run.TtlSeconds` | *（已删除）* |没有同等的 |
    | *（不可用）* | `run.Attachments` |新功能：将附件文件名映射到预签名的下载 URL |
    | *（不可用）* | `run.ErrorPreview` |新：截断的错误片段 |
    | *（不可用）* | `run.IsRoot` |新 |
    | *（不可用）* | `run.LatencySeconds` |新：挂钟持续时间（以秒为单位）|| *（不可用）* | `run.Manifest` |新：完整清单对象（替换`Serialized`和`ManifestID`）|
    | *（不可用）* | `run.Metadata` |新功能：任意用户定义的 JSON 元数据 |
    | *（不可用）* | `run.ShareURL` |新功能：公共共享 URL（仅在共享运行时设置）|
    | *（不可用）* | `run.ThreadEvaluationTime` |新 |
  </Tab>

  <Tab title="cURL">
    将 SCREAMING\_SNAKE\_CASE 字符串作为重复的 `selects` 查询参数（例如 `selects=NAME&selects=STATUS`）传递以控制填充哪些字段。默认 `selects` 仅包含 `"ID"`。|之前（v1 响应字段）|之后（v2 响应字段）|笔记|
    | -------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
    | `id` | `id` |不变 |
    | `name` | `name` |不变 |
    | `run_type` | `run_type` |值更改为大写：`"LLM"`、`"CHAIN"` 等 |
    | `status` | `status` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` || `trace_id` | `trace_id` |不变 |
    | `dotted_order` | `dotted_order` |不变 |
    | `app_path` | `app_path` |不变 |
    | `start_time` | `start_time` |不变 |
    | `end_time` | `end_time` |不变 |
    | `error` | `error` |不变 || `events` | `events` |不变 |
    | `extra` | `extra` |不变 |
    | `feedback_stats` | `feedback_stats` |不变 |
    | `first_token_time` | `first_token_time` |不变 |
    | `inputs` | `inputs` |不变 |
    | `inputs_preview` | `inputs_preview` |不变 || `outputs` | `outputs` |不变 |
    | `outputs_preview` | `outputs_preview` |不变 |
    | `parent_run_ids` | `parent_run_ids` |不变 |
    | `price_model_id` | `price_model_id` |不变 |
    | `prompt_cost` | `prompt_cost` |不变 |
    | `prompt_cost_details` | `prompt_cost_details.raw` | Field 现在包裹了对象；读取 `.raw` 以获得相同的 `{category: cost}` 映射，现在带有数值（是字符串） |
    | `prompt_token_details` | `prompt_token_details.raw` | Field 现在包裹了对象；读取 `.raw` 以获得相同的 `{category: count}` 映射（值不变） || `prompt_tokens` | `prompt_tokens` |不变 |
    | `completion_cost` | `completion_cost` |不变 |
    | `completion_cost_details` | `completion_cost_details.raw` ​​| Field 现在包裹了对象；读取 `.raw` 以获得相同的 `{category: cost}` 映射，现在带有数值（是字符串） |
    | `completion_token_details` | `completion_token_details.raw` | Field 现在包裹了对象；读取 `.raw` 以获得相同的 `{category: count}` 映射（值不变） |
    | `completion_tokens` | `completion_tokens` |不变 |
    | `total_cost` | `total_cost` |不变 |
    | `total_tokens` | `total_tokens` |不变 || `reference_dataset_id` | `reference_dataset_id` |不变 |
    | `reference_example_id` | `reference_example_id` |不变 |
    | `tags` | `tags` |不变 |
    | `thread_id` | `thread_id` |不变 |
    | `session_id` | `project_id` |更名|
    | `in_dataset` | `is_in_dataset` |更名|| `child_run_ids` | *（已删除）* |没有同等的 |
    | `direct_child_run_ids` | *（已删除）* |没有同等的 |
    | `execution_order` | *（已删除）* |没有同等的 |
    | `inputs_s3_urls` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `last_queued_at` | *（已删除）* |没有同等的 |
    | `manifest_id` | *（已删除）* |使用`manifest`|| `manifest_s3_id` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `messages` | *（已删除）* |没有同等的 |
    | `outputs_s3_urls` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `parent_run_id` | *（已删除）* |使用`parent_run_ids` |
    | `s3_urls` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `serialized` | *（已删除）* |使用`manifest` || `share_token` | *（已删除）* |使用`share_url`|
    | `trace_first_received_at` | *（已删除）* |没有同等的 |
    | `trace_max_start_time` | *（已删除）* |没有同等的 |
    | `trace_min_start_time` | *（已删除）* |没有同等的 |
    | `trace_tier` | *（已删除）* |没有同等的 |
    | `trace_upgrade` | *（已删除）* |没有同等的 || `ttl_seconds` | *（已删除）* |没有同等的 |
    | *（不可用）* | `attachments` |新功能：将附件文件名映射到预签名的下载 URL |
    | *（不可用）* | `error_preview` |新：截断的错误片段 |
    | *（不可用）* | `is_root` |新 |
    | *（不可用）* | `latency_seconds` |新：挂钟持续时间（以秒为单位）|
    | *（不可用）* | `manifest` |新：完整清单对象（替换`serialized`和`manifest_id`）|| *（不可用）* | `metadata` |新：之前嵌套在 `extra.metadata` | 下
    | *（不可用）* | `share_url` |新功能：公共共享 URL（仅在共享运行时设置）|
    | *（不可用）* | `thread_evaluation_time` |新 |
  </Tab>
</Tabs>

### 示例

#### 通过 ID 获取单次运行

<Tabs>
  <Tab title="Python">
    `runs.retrieve` 需要额外的 `project_id` (UUID) 参数，而 `read_run` 不需要。它还接受可选的 `start_time` — 提供它加快检索速度，但不是必需的。首先通过`client.aread_project()`解析项目UUID。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        run_id = "<run-id>"
        run = client.read_run(run_id)
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            run_id = "<run-id>"
            start_time = "2026-06-01T12:00:00Z"  # Optional, but speeds up retrieval
            run = await client.runs.retrieve(
                run_id=run_id,
                project_id=str(project.id),
                start_time=start_time,
            )


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    `client.runs.retrieve` 需要额外的 `project_id` (UUID) 参数，而 `readRun` 不需要。它还接受可选的 `start_time` — 提供它加快检索速度，但不是必需的。首先通过`client.readProject()`解析项目UUID。<Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        let runId = "<run-id>";
        await client.readRun(runId);
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        let runId = "<run-id>";
        let startTime = "2026-06-01T12:00:00Z"; // Optional, but speeds up retrieval
        await client.runs.retrieve(runId, {
          project_id: project.id,
          start_time: startTime,
        });
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    `retrieveV2()` 需要额外的 `projectId()` (UUID) 参数，而 `client.runs().retrieve()` 不需要。它还接受可选的 `startTime()` — 提供它加快检索速度，但不是必需的。首先通过`client.sessions().list()`解析项目UUID。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        var runId = "<run-id>"
        client.runs().retrieve(runId)
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import java.time.OffsetDateTime

        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunRetrieveV2Params
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        var runId = "<run-id>"
        var startTime = "<run-start-time-rfc3339>" // Optional, but speeds up retrieval
        client.runs().retrieveV2(
            runId,
            RunRetrieveV2Params.builder()
                .projectId(project.id())
                .startTime(OffsetDateTime.parse(startTime))
                .build()
        )
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    `GetV2()` 需要额外的 `ProjectID` (UUID) 参数，而 `client.Runs.Get()` 不需要。它还接受可选的 `StartTime` — 提供它加快检索速度，但不是必需的。首先通过`client.Sessions.List()`解析项目UUID。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        runID := "<run-id>"
        run, err := client.Runs.Get(ctx, runID, langsmith.RunGetParams{})
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        runID := "<run-id>"
        startTime := time.Date(2026, 6, 1, 12, 0, 0, 0, time.UTC) // Optional, but speeds up retrieval
        projectID := "<project-id>"
        run, err := client.Runs.GetV2(ctx, runID, langsmith.RunGetV2Params{
        	ProjectID: langsmith.F(projectID),
        	StartTime: langsmith.F(startTime),
        })
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    `GET /api/v2/runs/{run_id}` 需要额外的 `project_id` (UUID) 查询参数，而 `GET /api/v1/runs/{run_id}` 不需要。它还接受可选的 `start_time` — 提供它加快检索速度，但不是必需的。首先通过 `GET /api/v1/sessions` 请求解析项目 UUID。

    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        RUN_ID="<run-id>"

        curl "https://api.smith.langchain.com/api/v1/runs/$RUN_ID" \
          -H "x-api-key: $LANGSMITH_API_KEY"
        ```
      </Tab><Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        RUN_ID="<run-id>"
        START_TIME="2025-01-01T12:00:00Z" # Optional, but speeds up retrieval

        curl "https://api.smith.langchain.com/api/v2/runs/$RUN_ID?project_id=$PROJECT_ID&start_time=$START_TIME" \
          -H "x-api-key: $LANGSMITH_API_KEY"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 选择字段

<Tabs>
  <Tab title="Python">
    `read_run` 返回完整运行对象，无需选择。默认情况下，`runs.retrieve` 仅返回 `id` — 通过 `selects=[...]` 请求更多。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        run_id = "<run-id>"
        run = client.read_run(run_id=run_id)
        print(run.name, run.status, run.total_tokens)
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            run_id = "<run-id>"
            start_time = "2026-06-01T12:00:00Z"  # Optional, but speeds up retrieval
            run = await client.runs.retrieve(
                run_id=run_id,
                project_id=str(project.id),
                start_time=start_time,
                selects=["NAME", "STATUS", "TOTAL_TOKENS"],
            )
            print(run.name, run.status, run.total_tokens)


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    `readRun` 返回完整运行对象，无需选择。默认情况下，`client.runs.retrieve` 仅返回 `id` — 通过 `selects: [...]` 请求更多。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        let runId = "<run-id>";
        const retrievedRun = await client.readRun(runId);
        console.log(retrievedRun.name, retrievedRun.status, retrievedRun.total_tokens);
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        let runId = "<run-id>";
        let startTime = "2026-06-01T12:00:00Z";
        let projectId = "<project-id>";
        const retrievedRun = await client.runs.retrieve(runId, {
          project_id: projectId,
          start_time: startTime,
          selects: ["NAME", "STATUS", "TOTAL_TOKENS"],
        });
        console.log(retrievedRun.name, retrievedRun.status, retrievedRun.total_tokens);
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    `.retrieve()` 返回完整运行对象，无需选择。默认情况下，`.retrieveV2()` 仅返回 `id`，为您需要的每个字段调用 `.addSelect(...)`。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        var runId = "<run-id>"
        val run = client.runs().retrieve(runId)
        println("${run.name()} ${run.status()} ${run.totalTokens()}")
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import java.time.OffsetDateTime

        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunRetrieveV2Params
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        var runId = "<run-id>"
        var startTime = "<run-start-time-rfc3339>"
        val run = client.runs().retrieveV2(
            runId,
            RunRetrieveV2Params.builder()
                .projectId(project.id())
                .startTime(OffsetDateTime.parse(startTime))
                .addSelect(RunRetrieveV2Params.Select.NAME)
                .addSelect(RunRetrieveV2Params.Select.STATUS)
                .addSelect(RunRetrieveV2Params.Select.TOTAL_TOKENS)
                .build()
        )
        println("${run.name()} ${run.status()} ${run.totalTokens()}")
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    `Get` 返回完整的运行结构，无需选择。默认情况下，`GetV2` 仅返回 `ID` — 将 `Selects` 与您需要的字段一起传递。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        runID := "<run-id>"
        run, err := client.Runs.Get(ctx, runID, langsmith.RunGetParams{})
        fmt.Println(run.Name, run.Status, run.TotalTokens)
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        runID := "<run-id>"
        startTime := time.Date(2026, 6, 1, 12, 0, 0, 0, time.UTC)
        projectID := "<project-id>"
        run, err := client.Runs.GetV2(ctx, runID, langsmith.RunGetV2Params{
        	ProjectID: langsmith.F(projectID),
        	StartTime: langsmith.F(startTime),
        	Selects: langsmith.F([]langsmith.RunGetV2ParamsSelect{
        		langsmith.RunGetV2ParamsSelectName,
        		langsmith.RunGetV2ParamsSelectStatus,
        		langsmith.RunGetV2ParamsSelectTotalTokens,
        	}),
        })
        fmt.Println(run.Name, run.Status, run.TotalTokens)
        ```
      </Tab>
    </Tabs>
  </Tab><Tab title="cURL">
    `GET /api/v1/runs/{run_id}` 返回完整运行对象，无需选择。默认情况下，`GET /api/v2/runs/{run_id}`仅返回`id`，为您需要的字段传递`selects`查询参数。

    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        RUN_ID="<run-id>"

        curl "https://api.smith.langchain.com/api/v1/runs/$RUN_ID" \
          -H "x-api-key: $LANGSMITH_API_KEY"
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        RUN_ID="<run-id>"
        START_TIME="2026-06-01T12:00:00Z"

        curl "https://api.smith.langchain.com/api/v2/runs/$RUN_ID?project_id=$PROJECT_ID&start_time=$START_TIME&selects=NAME&selects=STATUS&selects=TOTAL_TOKENS" \
          -H "x-api-key: $LANGSMITH_API_KEY"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 处理未找到的运行

<Tabs>
  <Tab title="Python">
    由于缺少运行，`read_run`从`langsmith.utils`提高了`LangSmithNotFoundError`。 `runs.retrieve` 从 `langsmith` 提高 `NotFoundError`。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client
        from langsmith.utils import LangSmithNotFoundError

        client = Client()
        run_id = "<run-id>"

        try:
            run = client.read_run(run_id)
        except LangSmithNotFoundError:
            print(f"Run {run_id} not found")
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client
        from langsmith import NotFoundError


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            run_id = "<run-id>"
            start_time = "2026-06-01T12:00:00Z"

            try:
                run = await client.runs.retrieve(
                    run_id=run_id,
                    project_id=str(project.id),
                    start_time=start_time,
                )
            except NotFoundError:
                print(f"Run {run_id} not found")


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    `client.runs.retrieve`因错过一局而加注`NotFoundError`。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        let runId = "<run-id>";

        try {
          await client.readRun(runId);
        } catch (e: any) {
          if (e?.status === 404) {
            console.log(`Run ${runId} not found`);
          }
        }
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client, NotFoundError } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        let runId = "<run-id>";
        const startTime = "2026-06-01T12:00:00Z";

        try {
          await client.runs.retrieve(runId, {
            project_id: project.id,
            start_time: startTime,
          });
        } catch (e) {
          if (e instanceof NotFoundError) {
            console.log(`Run ${runId} not found`);
          }
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    `.retrieve()` 和 `.retrieveV2()` 都引发 `com.langchain.smith.errors.NotFoundException` — 不变，因为 Java SDK 已经在 SmithDB 之前由不锈钢生成。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.errors.NotFoundException

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        var runId = "<run-id>"
        try {
            client.runs().retrieve(runId)
        } catch (e: NotFoundException) {
            println("Run $runId not found")
        }
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import java.time.OffsetDateTime

        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.errors.NotFoundException
        import com.langchain.smith.models.runs.RunRetrieveV2Params
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        var runId = "<run-id>"
        var startTime = "<run-start-time-rfc3339>"
        try {
            client.runs().retrieveV2(
                runId,
                RunRetrieveV2Params.builder()
                    .projectId(project.id())
                    .startTime(OffsetDateTime.parse(startTime))
                    .build()
            )
        } catch (e: NotFoundException) {
            println("Run $runId not found")
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    `Get` 和 `GetV2` 都返回一个 `*langsmith.Error`，您可以使用 `errors.As` 进行检查——不变，因为 Go SDK 已经在 SmithDB 之前由不锈钢生成。检查 `StatusCode` 是否有 `404`。<Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"errors"
        	"fmt"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        runID := "<run-id>"
        _, err := client.Runs.Get(ctx, runID, langsmith.RunGetParams{})
        if err != nil {
        	var apiErr *langsmith.Error
        	if errors.As(err, &apiErr) && apiErr.StatusCode == 404 {
        		fmt.Printf("Run %s not found\n", runID)
        	} else {
        		panic(err)
        	}
        }
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"errors"
        	"fmt"
        	"time"

        	"github.com/google/uuid"
        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        runID := "<run-id>"
        startTime := time.Date(2026, 6, 1, 12, 0, 0, 0, time.UTC)
        projectID := "<project-id>"
        _, err := client.Runs.GetV2(ctx, runID, langsmith.RunGetV2Params{
        	ProjectID: langsmith.F(projectID),
        	StartTime: langsmith.F(startTime),
        })
        if err != nil {
        	var apiErr *langsmith.Error
        	if errors.As(err, &apiErr) && apiErr.StatusCode == 404 {
        		fmt.Printf("Run %s not found\n", runID)
        	} else {
        		panic(err)
        	}
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    对于缺少运行，`GET /api/v1/runs/{run_id}` 和 `GET /api/v2/runs/{run_id}` 都会返回 HTTP 404。检查响应状态码。

    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        RUN_ID="<run-id>"

        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
          "https://api.smith.langchain.com/api/v1/runs/$RUN_ID" \
          -H "x-api-key: $LANGSMITH_API_KEY")

        if [ "$HTTP_STATUS" = "404" ]; then
          echo "Run $RUN_ID not found"
        fi
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        RUN_ID="<run-id>"
        START_TIME="2025-01-01T12:00:00Z"

        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
          "https://api.smith.langchain.com/api/v2/runs/$RUN_ID?project_id=$PROJECT_ID&start_time=$START_TIME" \
          -H "x-api-key: $LANGSMITH_API_KEY")

        if [ "$HTTP_STATUS" = "404" ]; then
          echo "Run $RUN_ID not found"
        fi
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 加载运行的子运行

`load_child_runs` 标志和嵌套 `child_runs` 字段被删除。使用 `traces.list_runs` 获取跟踪中的每个运行，然后对 `parent_run_ids` 进行过滤，它保存每个运行的完整祖先链，首先是根，最后是最接近的父级。

<Tabs>
  <Tab title="Python">
    将 `read_run(run_id, load_child_runs=True)` 替换为 `client.traces.list_runs`。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        run_id = "<run-id>"

        run = client.read_run(run_id, load_child_runs=True)

        # `child_runs` holds the direct children, each with its own nested `child_runs`.
        # `child_run_ids` holds every descendant, at any depth.
        for child in run.child_runs or []:
            print(child.name, child.run_type, len(child.child_runs or []))
        print(len(run.child_run_ids or []), "descendants")
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio
        from collections import defaultdict

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            # A root run is its own trace, so `trace_id` is also the run ID.
            trace_id = "<trace-id>"

            trace_runs = await client.traces.list_runs(
                trace_id,
                project_id=str(project.id),
                selects=["ID", "NAME", "RUN_TYPE", "PARENT_RUN_IDS", "START_TIME", "END_TIME"],
            )

            # `parent_run_ids` is the full ancestor chain, root first, closest parent
            # last. A run is a descendant of any ID in that chain, at any depth, not
            # only of the immediate parent. This flat list replaces `child_run_ids`.
            descendants = [
                run for run in (trace_runs.items or []) if trace_id in (run.parent_run_ids or [])
            ]
            print(len(descendants), "descendants")

            # Optional: rebuild the nested `child_runs` shape instead of a flat list.
            by_parent = defaultdict(list)
            for run in trace_runs.items or []:
                if run.parent_run_ids:
                    # The last ancestor is the immediate parent.
                    by_parent[run.parent_run_ids[-1]].append(run)

            def attach(run):
                run.child_runs = by_parent.get(run.id, [])
                for child in run.child_runs:
                    attach(child)

            for run in trace_runs.items or []:
                attach(run)

            children = by_parent.get(trace_id, [])
            for child in children:
                print(child.name, child.run_type, len(child.child_runs))


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    将 `loadChildRuns` 选项替换为 `client.traces.listRuns`。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        let runId = "<run-id>";

        const run = await client.readRun(runId, { loadChildRuns: true });

        // `child_runs` holds the direct children, each with its own nested `child_runs`.
        // `child_run_ids` holds every descendant, at any depth.
        for (const child of run.child_runs ?? []) {
          console.log(child.name, child.run_type, (child.child_runs ?? []).length);
        }
        console.log((run.child_run_ids ?? []).length, "descendants");
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        // A root run is its own trace, so `traceId` is also the run ID.
        let traceId = "<trace-id>";

        const traceRuns = await client.traces.listRuns(traceId, {
          project_id: project.id,
          selects: ["ID", "NAME", "RUN_TYPE", "PARENT_RUN_IDS", "START_TIME", "END_TIME"],
        });

        // `parent_run_ids` is the full ancestor chain, root first, closest parent last.
        // A run is a descendant of any ID in that chain, at any depth, not only of the
        // immediate parent. This flat list replaces `child_run_ids`.
        const descendants = (traceRuns.items ?? []).filter((traceRun) =>
          (traceRun.parent_run_ids ?? []).includes(traceId),
        );
        console.log(descendants.length, "descendants");

        // Optional: group the runs by immediate parent to walk the trace as a tree,
        // which is the information `child_runs` used to carry.
        type TraceRun = NonNullable<typeof traceRuns.items>[number];
        const byParent = new Map<string, TraceRun[]>();
        for (const traceRun of traceRuns.items ?? []) {
          const ancestors = traceRun.parent_run_ids ?? [];
          if (ancestors.length === 0) continue;
          // The last ancestor is the immediate parent.
          const parentId = ancestors[ancestors.length - 1];
          byParent.set(parentId, [...(byParent.get(parentId) ?? []), traceRun]);
        }

        const children = byParent.get(traceId) ?? [];
        for (const child of children) {
          console.log(child.name, child.run_type, (byParent.get(child.id!) ?? []).length);
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    无需迁移：Java SDK 从未在一次调用中加载子运行，因此请使用 `client.traces().listRuns()` 遍历跟踪的运行。
  </Tab><Tab title="Go">
    无需迁移：Go SDK 从未在一次调用中加载子运行，因此使用 `client.Traces.ListRuns()` 遍历跟踪的运行。
  </Tab>

  <Tab title="cURL">
    无需迁移：`GET /api/v1/runs/{run_id}` 从未返回子运行，因此使用 `GET /api/v2/traces/{trace_id}/runs` 遍历跟踪的运行。
  </Tab>
</Tabs>

## 运行：获取 URL

获取运行的 LangSmith UI URL。

### 主要变化

#### 方法名称

<Tabs>
  <Tab title="Python">
    |之前 |之后 |
    | ---------------------- | ----------------------- |
    | `client.get_run_url()` | `client.runs.get_url()` |

    <Note>
      `client.runs.get_url()` 现在是异步的。用 `await` 来调用它。
    </Note>

    完整参数列表请参见[reference](https://reference.langchain.com/python/langsmith/_openapi_client/resources/runs/RunsResource/get_url)。
  </Tab>

  <Tab title="TypeScript">
    |之前 |之后 |
    | -------------------- | ---------------------- |
    | `client.getRunUrl()` | `client.runs.getURL()` |

    完整参数列表请参见[reference](https://reference.langchain.com/javascript/langsmith/_openapi_client/Langsmith/Runs/getURL)。
  </Tab>

  <Tab title="Java">
    <Note>Java SDK 没有用于检索运行的 UI URL 的旧版等效项。</Note>

    |之前 |之后|
    | -------------------- | ------------------------ |
    | *（无遗留方法）* | `client.runs().getUrl()` |

    完整参数列表请参见[reference](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/RunService.html)。
  </Tab><Tab title="Go">
    <Note>Go SDK 没有用于检索运行的 UI URL 的旧版本。</Note>

    |之前 |之后 |
    | -------------------- | ---------------------- |
    | *（无遗留方法）* | `client.Runs.GetURL()` |

    完整参数列表请参见[reference](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#RunService.GetURL)。
  </Tab>

  <Tab title="cURL">
    <Note>REST API 没有用于检索运行的 UI URL 的旧版等效项。</Note>

    |之前 |之后|
    | ---------------------- | ------------------------------------------- |
    | *（无旧端点）* | `GET /api/v2/runs/{run_id}/url` |
  </Tab>
</Tabs>

#### 参数

<Tabs>
  <Tab title="Python">
    <Warning>
      `runs.get_url` 需要直接传递运行的 `project_id` 和 `trace_id`，而不是从 `run` 对象或 `project_name`/`project_id` 后备解析它们。
    </Warning>|之前 (`get_run_url`) |之后 (`runs.get_url`) |笔记|
    | ---------------------- | ---------------------- | -------------------------------------------------------------------------------------- |
    | `run` (`RunBase`) | *（已删除）* |不需要完整的运行对象；单独传递其标识字段 |
    | `project_name` | *（已删除）* |没有同等的；如果您只有项目名称，请自行解析项目 UUID |
    | `project_id` | `project_id` | **必需的**;仍然是项目（会话）UUID |
    | *（不可用）* | `run_id` | **必填**（位置）；运行的 ID，之前从 `run.id` | 读取
    | *（不可用）* | `trace_id` | **必需的**;运行的跟踪 UUID，之前从 `run` 内部读取 |
    | *（不可用）* | `start_time` |选修的;运行的开始时间（RFC3339）；如果未知则省略 |
  </Tab><Tab title="TypeScript">
    <Warning>
      `client.runs.getURL` 需要直接传递运行的 `project_id` 和 `trace_id`，而不是从 `run` 对象或 `runId` 后备解析它们。
    </Warning>

    |之前 (`getRunUrl`) |之后（`getURL`）|笔记|
    | -------------------- | -------------------- | ------------------------------------------------------------------------------------------ |
    | `run` (`Run`) | *（已删除）* |不需要完整的运行对象；单独传递其标识字段 |
    | `runId` | `runID`（位置）|目的不变；现在第一个位置参数而不是命名选项 |
    | `projectOpts` | *（已删除）* |没有同等的；自己解析项目UUID |
    | *（不可用）* | `project_id` | **必需的**; `snake_case`；项目（会话）UUID |
    | *（不可用）* | `trace_id` | **必需的**; `snake_case`；运行的跟踪 UUID || *（不可用）* | `start_time` |选修的; `snake_case`；运行的开始时间（RFC3339）；如果未知则省略 |
  </Tab>

  <Tab title="Java">
    |之前 |之后（`RunGetUrlParams`）|笔记|
    | -------------------- | ---------------------------------- | ---------------------------------------------------------------- |
    | *（无遗留方法）* | `runId` | **必填**（位置）；运行的 ID |
    | *（无遗留方法）* | `projectId()` | **必需的**;项目（会话）UUID |
    | *（无遗留方法）* | `traceId()` | **必需的**;运行的跟踪 UUID |
    | *（无遗留方法）* | `startTime()` |选修的;运行的开始时间（RFC3339）；如果未知则省略 |
  </Tab><Tab title="Go">
    |之前 |之后 (`RunGetURLParams`) |笔记|
    | -------------------- | ---------------------------------- | ---------------------------------------------------------------- |
    | *（无遗留方法）* | `runID`（位置）| **必需的**;运行的 ID |
    | *（无遗留方法）* | `ProjectID` | **必需的**;项目（会话）UUID |
    | *（无遗留方法）* | `TraceID` | **必需的**;运行的跟踪 UUID |
    | *（无遗留方法）* | `StartTime` |选修的;运行的开始时间（RFC3339）；如果未知则省略 |
  </Tab><Tab title="cURL">
    |之前 |之后（`GET /api/v2/runs/{run_id}/url`）|笔记|
    | ---------------------- | --------------------------------------- | ---------------------------------------------------------------- |
    | *（无旧端点）* | `run_id`（路径）| **必填** |
    | *（无旧端点）* | `project_id`（查询）| **必需的**;项目（会话）UUID |
    | *（无旧端点）* | `trace_id`（查询）| **必需的**;运行的跟踪 UUID |
    | *（无旧端点）* | `start_time`（查询）|选修的;运行的开始时间（RFC3339）；如果未知则省略 |
  </Tab>
</Tabs>

#### 回应

<Tabs>
  <Tab title="Python">
    |之前 |之后 |笔记|
    | ---------------- | ----------------------- | --------------------------------------------------------------------------- |
    | `str`（网址）| `RunGetURLResponse.url` |响应现在被包装在一个对象中；读取 `.url` 属性 |
  </Tab><Tab title="TypeScript">
    |之前 |之后 |笔记|
    | ------------------ | ----------------------- | -------------------------------------------------------------------------- |
    | `string`（网址）| `RunGetURLResponse.url` |响应现在被包装在一个对象中；阅读`.url`属性|
  </Tab>

  <Tab title="Java">
    |之前 |之后 |笔记|
    | -------------------- | ---------------------------------- | -------------------------- |
    | *（无遗留方法）* | `RunGetUrlResponse.url`() |返回 `Optional<String>` |
  </Tab>

  <Tab title="Go">
    |之前 |之后 |笔记|
    | -------------------- | ----------------------- | ------------------ |
    | *（无遗留方法）* | `RunGetURLResponse.URL` |返回 `string` |
  </Tab>

  <Tab title="cURL">
    |之前 |之后 |笔记|
    | ---------------------- | ---------------- | -------------------------------------------------- |
    | *（无旧端点）* | `{"url": "..."}` |具有单个 `url` 字段的 JSON 对象 |
  </Tab>
</Tabs>

### 示例

#### 获取运行的 URL<Tabs>
  <Tab title="Python">
    `get_run_url` 接受完整运行对象。 `runs.get_url` 是异步的，需要运行的 `project_id` （旧 v1 模式下的 `session_id`）和 `trace_id` 单独传递，`start_time` 可选。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        run_id = "<run-id>"
        run = client.read_run(run_id)
        url = client.get_run_url(run=run)
        print(url)
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            run_id = "<run-id>"
            run = client.read_run(run_id)
            response = await client.runs.get_url(
                run.id,
                project_id=str(run.session_id),
                trace_id=str(run.trace_id),
                start_time=run.start_time.isoformat(),  # Optional, but speeds up retrieval
            )
            print(response.url)


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    `getRunUrl` 接受完整运行对象。 `runs.getURL` 需要运行的 `project_id` （旧 v1 模式下的 `session_id`）和 `trace_id` 单独传递，`start_time` 可选。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        let runId = "<run-id>";
        const url = await client.getRunUrl({ runId });
        console.log(url);
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        let runId = "<run-id>";
        const run = await client.readRun(runId);
        const response = await client.runs.getURL(run.id, {
          project_id: run.session_id!,
          trace_id: run.trace_id!,
          start_time: String(run.start_time!), // Optional, but speeds up retrieval
        });
        console.log(response.url);
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    Java SDK 没有传统的等效项。 `runs().getUrl` 需要运行的 `projectId()` 和 `traceId()`，`startTime()` 可选。

    ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import com.langchain.smith.client.LangsmithClient
    import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
    import com.langchain.smith.models.runs.RunGetUrlParams

    fun main() {
        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        var runId = "<run-id>"
        val run = client.runs().retrieve(runId)

        val response = client.runs().getUrl(
            run.id(),
            RunGetUrlParams.builder()
                .projectId(run.sessionId())
                .traceId(run.traceId())
                .startTime(run.startTime().get().toString()) // Optional, but speeds up retrieval
                .build()
        )
        println(response.url().get())
    }
    ```
  </Tab>

  <Tab title="Go">
    Go SDK 没有对应的遗留版本。 `Runs.GetURL` 需要运行的 `ProjectID` 和 `TraceID`，`StartTime` 可选。

    ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    package main

    import (
    	"context"
    	"fmt"
    	"time"

    	"github.com/langchain-ai/langsmith-go"
    )

    func main() {
    	ctx := context.Background()
    	client := langsmith.NewClient()

    	runID := "<run-id>"
    	run, err := client.Runs.Get(ctx, runID, langsmith.RunGetParams{})
    	if err != nil {
    		panic(err.Error())
    	}

    	response, err := client.Runs.GetURL(ctx, run.ID, langsmith.RunGetURLParams{
    		ProjectID: langsmith.F(run.SessionID),
    		TraceID:   langsmith.F(run.TraceID),
    		StartTime: langsmith.F(run.StartTime.Format(time.RFC3339)), // Optional, but speeds up retrieval
    	})
    	if err != nil {
    		panic(err.Error())
    	}
    	fmt.Println(response.URL)
    }
    ```
  </Tab>

  <Tab title="cURL">
    REST API 没有等效的旧版本。 `GET /api/v2/runs/{run_id}/url` 需要运行的 `project_id` 和 `trace_id` 查询参数，`start_time` 可选。

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    RUN_ID="<run-id>"

    RUN=$(curl -s "https://api.smith.langchain.com/api/v1/runs/$RUN_ID" \
      -H "x-api-key: $LANGSMITH_API_KEY")
    PROJECT_ID=$(echo "$RUN" | jq -r '.session_id')
    TRACE_ID=$(echo "$RUN" | jq -r '.trace_id')
    START_TIME=$(echo "$RUN" | jq -r '.start_time') # Optional, but speeds up retrieval

    curl "https://api.smith.langchain.com/api/v2/runs/$RUN_ID/url?project_id=$PROJECT_ID&trace_id=$TRACE_ID&start_time=$START_TIME" \
      -H "x-api-key: $LANGSMITH_API_KEY"
    ```
  </Tab>
</Tabs>

## 痕迹：查询返回单个跟踪项目的跟踪（根运行）列表。每个项目都包含跟踪的根运行以及 `trace_aggregates` 下的可选跟踪范围聚合（`total_tokens`、`total_cost`、`first_token_time`），因此客户端永远不必按 `trace_id` 进行合并。

跟踪在 `start_time` 窗口内扫描：`min_start_time` 默认为请求前 24 小时，`max_start_time` 默认为请求时间。明确设置以加宽或缩小窗口。

支持滤镜（`trace_filter`、`tree_filter`）和场投影（`selects`）。

### 主要变化

#### 方法名称

<Tabs>
  <Tab title="Python">
    |之前 |之后 |
    | ------------------------------------------------------ | ----------------------- |
    | `client.list_runs(is_root=True)`（通用）| `client.traces.query()` |

    <Note>
      `client.traces.query()` 现在是异步的。用 `await` 来调用它。
    </Note>

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/python/langsmith/_openapi_client/resources/traces/TracesResource/query)。
  </Tab>

  <Tab title="TypeScript">
    |之前 |之后 |
    | -------------------------------------------------------- | ----------------------- |
    | `client.listRuns({ isRoot: true })`（通用）| `client.traces.query()` |

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/javascript/langsmith/_openapi_client/Langsmith/Traces/query)。
  </Tab><Tab title="Java">
    |之前 |之后 |
    | ------------------------------------------------- | ---------------------------------- |
    | `client.runs().query()`（通用，`isRoot(true)`）| `client.traces().query()` |

    完整参数列表请参见[reference](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/TraceService.html)。
  </Tab>

  <Tab title="Go">
    |之前 |之后 |
    | ----------------------------------------------------------- | ----------------------- |
    | `client.Runs.Query()`（通用，`IsRoot: true`）| `client.Traces.Query()` |

    完整参数列表请参见[reference](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#TraceService.QueryAutoPaging)。
  </Tab>

  <Tab title="cURL">
    |之前 |之后|
    | ------------------------------------------------------ | ------------------------ | |
    | `POST /api/v1/runs/query` (`is_root=true`) | `POST /api/v2/traces/query` |
  </Tab>
</Tabs>

#### 查询参数<Tabs>
  <Tab title="Python">
    * `session`（项目UUID列表）变为`project_id`，单个UUID； `traces.query` 每次调用的范围仅限于一个项目。
    * `is_root` 已删除：`traces.query` 的作用域始终隐式限定为根运行。
    * 通用的`filter`（针对任何运行进行评估）没有直接等效项；请使用 `trace_filter` 或 `tree_filter` 代替。
    * `trace_filter`和`tree_filter`结转不变；两者都已经存在于`list_runs`上。
    * `trace_ids` 是新的：对一组已知跟踪 UUID 的快速路径限制，在规模上比等效的 `trace_filter` 更高效。
    * `start_time`（无默认）变为`min_start_time`，省略时默认为 24​​ 小时前。
    * `max_start_time`新增，默认为请求时间； `list_runs` 的 `end_time` 按运行自己的结束时间戳进行过滤，而不是扫描窗口范围。
    * `select`更名为`selects`；条目路由至`trace_aggregates`（`total_tokens`、`total_cost`、`first_token_time`）或`root_run`（其他所有内容）。
  </Tab><Tab title="TypeScript">
    * `session`（项目UUID列表）变为`project_id`，单个UUID； `traces.query` 每次调用的范围仅限于一个项目。
    * `isRoot` 已删除：`traces.query` 的作用域始终隐式限定为根运行。
    * 通用的`filter`（针对任何运行进行评估）没有直接等效项；请使用 `trace_filter` 或 `tree_filter` 代替。
    * `traceFilter` 和 `treeFilter` 结转为 `trace_filter`/`tree_filter`；两者都已经存在于`listRuns`上。请注意，v1 方法采用驼峰命名法选项 (`traceFilter`)； v2 资源方法直接采用有线格式 `snake_case` 键。
    * `trace_ids` 是新的：对一组已知跟踪 UUID 的快速路径限制，在规模上比等效的 `trace_filter` 更高效。
    * `startTime`（无默认）变为`min_start_time`，省略时默认为 24​​ 小时前。
    * `max_start_time`新增，默认为请求时间； `listRuns` 的 `endTime` 按运行自己的结束时间戳进行过滤，而不是扫描窗口范围。
    * `select`更名为`selects`；条目路由至`trace_aggregates`（`total_tokens`、`total_cost`、`first_token_time`）或`root_run`（其他所有内容）。
  </Tab><Tab title="Java">
    * `session`（项目UUID的`List<String>`）变为`projectId`，单个UUID； `traces().query()` 每次调用的范围仅限于一个项目。
    * `isRoot` 已删除：`traces().query()` 的作用域始终为隐式根运行。
    * 通用的`filter`（针对任何运行进行评估）没有直接等效项；请使用 `traceFilter` 或 `treeFilter` 代替。
    * `traceFilter`和`treeFilter`结转不变；两者都已经存在于`RunQueryParams`上。
    * `traceIds` 是新的：对一组已知跟踪 UUID 的快速路径限制，在规模上比等效的 `traceFilter` 更高效。
    * `startTime`（无默认）变为`minStartTime`，省略时默认为 24​​ 小时前。
    * `maxStartTime`新增，默认为请求时间； `RunQueryParams` 的 `endTime` 按运行自己的结束时间戳过滤，而不是扫描窗口范围。
    * `select`更名为`selects`；条目路由至`traceAggregates`（`totalTokens`、`totalCost`、`firstTokenTime`）或`rootRun`（其他所有内容）。
  </Tab><Tab title="Go">
    * `Session`（项目UUID的`[]string`）变为`ProjectID`，单个UUID； `Traces.Query()` 每次调用的范围仅限于一个项目。
    * `IsRoot` 已删除：`Traces.Query()` 的作用域始终为隐式根运行。
    * 通用的`Filter`（针对任何运行进行评估）没有直接等效项；请使用 `TraceFilter` 或 `TreeFilter` 代替。
    * `TraceFilter`和`TreeFilter`结转不变；两者都已经存在于`RunQueryParams`上。
    * `TraceIDs` 是新功能：对一组已知跟踪 UUID 的快速路径限制，在规模上比等效的 `TraceFilter` 更高效。
    * `StartTime`（无默认）变为`MinStartTime`，省略时默认为 24​​ 小时前。
    * `MaxStartTime`新增，默认为请求时间； `RunQueryParams` 的 `EndTime` 按运行自己的结束时间戳进行过滤，而不是扫描窗口范围。
    * `Select`更名为`Selects`；条目路由至`TraceAggregates`（`TotalTokens`、`TotalCost`、`FirstTokenTime`）或`RootRun`（其他所有内容）。
  </Tab><Tab title="cURL">
    * `session`（项目 UUID 列表）变为 `project_id`，单个 UUID。
    * `is_root` 已删除：端点始终隐式限定为根运行。
    * 通用`filter`没有直接等效项；请使用 `trace_filter` 或 `tree_filter` 代替。两者都已经存在于`POST /api/v1/runs/query`上。
    * `trace_ids` 是新功能：对一组已知跟踪 UUID 的快速路径限制。
    * `start_time`（无默认）变为`min_start_time`，省略时默认为 24​​ 小时前。
    * `max_start_time`新增，默认为请求时间。
    * `select`更名为`selects`。
  </Tab>
</Tabs>

#### 响应字段

<Tabs>
  <Tab title="Python">
    * `root_run` 与 Runs 具有相同的 `Run` 形状：查询（`id`、`name`、`run_type`、`status` 等），由 `selects` 门控。
    * `total_tokens`/`total_cost` 从 `root_run` 移至 `trace_aggregates`，对跟踪中的每个运行（而不仅仅是根运行）进行求和。当未选择聚合字段时，响应中完全省略`trace_aggregates`。
    * `trace_aggregates.first_token_time` 是新的
  </Tab><Tab title="TypeScript">
    * `root_run` 具有与 Runs 相同的 `Run` 形状：查询（`id`、`name`、`run_type`、`status` 等），由 `selects` 门控。
    * `total_tokens`/`total_cost` 从 `root_run` 移至 `trace_aggregates`，对跟踪中的每个运行（而不仅仅是根运行）进行求和。当未选择聚合字段时，响应中完全省略`trace_aggregates`。
    * `trace_aggregates.first_token_time` 是新的
  </Tab>

  <Tab title="Java">
    * `rootRun()` 与 Runs 具有相同的 `RunSchema` 形状：查询（`totalTokens()`、`name()`、`runType()`、`status()` 等），由 `selects` 门控。
    * `totalTokens()`/`totalCost()` 从 `rootRun()` 移至 `traceAggregates()`，对跟踪中的每个运行进行求和，而不仅仅是根运行。
    * `traceAggregates().firstTokenTime()` 是新的
  </Tab>

  <Tab title="Go">
    * `RootRun` 具有与 Runs: query 相同的 `Run` 形状，由 `Selects` 门控。
    * `TotalTokens`/`TotalCost` 从 `RootRun` 移至 `TraceAggregates`，对跟踪中的每个运行进行求和，而不仅仅是根运行。通过 `trace.TraceAggregates.JSON.RawJSON() == ""` 检查是否存在 `TraceAggregates`，因为它是值类型，而不是指针。
    * `TraceAggregates.FirstTokenTime` 是新的
  </Tab>

  <Tab title="cURL">
    JSON 响应字段使用 `snake_case`，与下面的项目符号匹配。* `root_run` 具有与 Runs: query 相同的形状，由 `selects` 门控。
    * `total_tokens`/`total_cost` 从 `root_run` 移至 `trace_aggregates`，对跟踪中的每个运行进行求和，而不仅仅是根运行。
    * `trace_aggregates.first_token_time` 是新的
  </Tab>
</Tabs>

### 示例

#### 列出跟踪（根运行）

获取项目中的每个跟踪（根运行），替换 `list_runs(is_root=True)`。

<Tabs>
  <Tab title="Python">
    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        project = client.read_project(project_name="default")

        root_runs = list(client.list_runs(project_id=project.id, is_root=True, limit=5))
        for root_run in root_runs:
            print(root_run.trace_id, root_run.name)
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            count = 0
            async for trace in client.traces.query(
                project_id=str(project.id),
                min_start_time="2026-07-01T00:00:00Z",
                max_start_time="2026-07-31T23:59:59Z",
                selects=["NAME"],
            ):
                print(trace.root_run.trace_id, trace.root_run.name)
                count += 1
                if count >= 5:
                    break


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });

        for await (const run of client.listRuns({ projectId: project.id, isRoot: true, limit: 5 })) {
          console.log(run.trace_id, run.name);
        }
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        let count = 0;
        for await (const trace of client.traces.query({
          project_id: project.id,
          min_start_time: "2026-07-01T00:00:00Z",
          max_start_time: "2026-07-31T23:59:59Z",
          selects: ["NAME"],
        })) {
          console.log(trace.root_run?.trace_id, trace.root_run?.name);
          count += 1;
          if (count >= 5) break;
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        val rootRuns = client.runs().query(
            RunQueryParams.builder()
                .addSession(project.id())
                .isRoot(true)
                .limit(5L)
                .build()
        ).runs()
        for (run in rootRuns) {
            println("${run.traceId()} ${run.name()}")
        }
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import java.time.OffsetDateTime

        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunSelectField
        import com.langchain.smith.models.sessions.SessionListParams
        import com.langchain.smith.models.traces.TraceQueryParams
        import kotlin.jvm.optionals.getOrNull

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        val traces = client.traces().query(
            TraceQueryParams.builder()
                .projectId(project.id())
                .minStartTime(OffsetDateTime.parse("2026-07-01T00:00:00Z"))
                .maxStartTime(OffsetDateTime.parse("2026-07-31T23:59:59Z"))
                .addSelect(RunSelectField.NAME)
                .build()
        ).items().take(5)
        for (trace in traces) {
            println("${trace.rootRun().get().traceId().getOrNull()} ${trace.rootRun().get().name().getOrNull()}")
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID

        	rootRuns, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        		Session: langsmith.F([]string{projectID}),
        		IsRoot:  langsmith.F(true),
        		Limit:   langsmith.F(int64(5)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	for _, run := range rootRuns.Runs {
        		fmt.Println(run.TraceID, run.Name)
        	}
        }
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID

        	minStart, _ := time.Parse(time.RFC3339, "2026-07-01T00:00:00Z")
        	maxStart, _ := time.Parse(time.RFC3339, "2026-07-31T23:59:59Z")

        	iter := client.Traces.QueryAutoPaging(ctx, langsmith.TraceQueryParams{
        		ProjectID:    langsmith.F(projectID),
        		MinStartTime: langsmith.F(minStart),
        		MaxStartTime: langsmith.F(maxStart),
        		Selects:      langsmith.F([]langsmith.RunSelectField{langsmith.RunSelectFieldName}),
        	})
        	count := 0
        	for iter.Next() {
        		trace := iter.Current()
        		fmt.Println(trace.RootRun.TraceID, trace.RootRun.Name)
        		count++
        		if count >= 5 {
        			break
        		}
        	}
        	if err := iter.Err(); err != nil {
        		panic(err.Error())
        	}
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -s -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid], "is_root": true, "limit": 5}')" \
          | jq '(.runs // []) | map({trace_id: .trace_id, name: .name})'
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -X POST "https://api.smith.langchain.com/api/v2/traces/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{
            "project_id": $pid,
            "min_start_time": "2026-07-01T00:00:00Z",
            "max_start_time": "2026-07-31T23:59:59Z",
            "page_size": 5,
            "selects": ["NAME"]
          }')" | jq '.items | map({trace_id: .root_run.trace_id, name: .root_run.name})'
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 获取跟踪的总代币和成本

从 `trace_aggregates` 读取跟踪的令牌和成本总计，而不是从 v1 保存它们的根运行中读取。<Tabs>
  <Tab title="Python">
    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        project = client.read_project(project_name="default")

        root_runs = list(client.list_runs(project_id=project.id, is_root=True, limit=5))

        for root_run in root_runs:
            print(root_run.trace_id, root_run.total_tokens, root_run.total_cost)
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            count = 0
            async for trace in client.traces.query(
                project_id=str(project.id),
                min_start_time="2026-07-01T00:00:00Z",
                max_start_time="2026-07-31T23:59:59Z",
                selects=["NAME", "TOTAL_TOKENS", "TOTAL_COST"],
            ):
                count += 1
                if trace.trace_aggregates is not None:
                    print(
                        trace.root_run.name,
                        trace.trace_aggregates.total_tokens,
                        trace.trace_aggregates.total_cost,
                    )
                if count >= 5:
                    break


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });

        for await (const rootRun of client.listRuns({ projectId: project.id, isRoot: true, limit: 5 })) {
          console.log(rootRun.trace_id, rootRun.total_tokens, rootRun.total_cost);
        }
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        let count = 0;
        for await (const trace of client.traces.query({
          project_id: project.id,
          min_start_time: "2026-07-01T00:00:00Z",
          max_start_time: "2026-07-31T23:59:59Z",
          selects: ["NAME", "TOTAL_TOKENS", "TOTAL_COST"],
        })) {
          count += 1;
          if (trace.trace_aggregates) {
            console.log(trace.root_run?.name, trace.trace_aggregates.total_tokens, trace.trace_aggregates.total_cost);
          }
          if (count >= 5) break;
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    <Note>之前的示例仅读取`totalTokens`。 `totalCost` 被省略，因为在 v1 `RunSchema` 类型上读取它会触发当前 Java 绑定中的已知反序列化错误（它需要一个字符串，API 返回一个数字）。</Note>

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams
        import kotlin.jvm.optionals.getOrNull

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        val rootRuns = client.runs().query(
            RunQueryParams.builder()
                .addSession(project.id())
                .isRoot(true)
                .limit(5L)
                .build()
        ).runs()

        // totalCost() is omitted here — RunSchema.totalCost() has a known
        // deserialization bug in the v1 Java binding.
        for (rootRun in rootRuns) {
            println("${rootRun.traceId()} ${rootRun.totalTokens().getOrNull()}")
        }
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import java.time.OffsetDateTime

        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunSelectField
        import com.langchain.smith.models.sessions.SessionListParams
        import com.langchain.smith.models.traces.TraceQueryParams
        import kotlin.jvm.optionals.getOrNull

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        val traces = client.traces().query(
            TraceQueryParams.builder()
                .projectId(project.id())
                .minStartTime(OffsetDateTime.parse("2026-07-01T00:00:00Z"))
                .maxStartTime(OffsetDateTime.parse("2026-07-31T23:59:59Z"))
                .addSelect(RunSelectField.NAME)
                .addSelect(RunSelectField.TOTAL_TOKENS)
                .addSelect(RunSelectField.TOTAL_COST)
                .build()
        ).items()

        var count = 0
        for (trace in traces) {
            count++
            val aggregates = trace.traceAggregates().getOrNull()
            if (aggregates != null) {
                println("${trace.rootRun().get().name().getOrNull()} ${aggregates.totalTokens().getOrNull()} ${aggregates.totalCost().getOrNull()}")
            }
            if (count >= 5) break
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID

        	rootRuns, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        		Session: langsmith.F([]string{projectID}),
        		IsRoot:  langsmith.F(true),
        		Limit:   langsmith.F(int64(5)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}

        	for _, rootRun := range rootRuns.Runs {
        		fmt.Println(rootRun.TraceID, rootRun.TotalTokens, rootRun.TotalCost)
        	}
        }
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID

        	minStart, _ := time.Parse(time.RFC3339, "2026-07-01T00:00:00Z")
        	maxStart, _ := time.Parse(time.RFC3339, "2026-07-31T23:59:59Z")

        	iter := client.Traces.QueryAutoPaging(ctx, langsmith.TraceQueryParams{
        		ProjectID:    langsmith.F(projectID),
        		MinStartTime: langsmith.F(minStart),
        		MaxStartTime: langsmith.F(maxStart),
        		Selects: langsmith.F([]langsmith.RunSelectField{
        			langsmith.RunSelectFieldName,
        			langsmith.RunSelectFieldTotalTokens,
        			langsmith.RunSelectFieldTotalCost,
        		}),
        	})
        	count := 0
        	for iter.Next() {
        		trace := iter.Current()
        		count++
        		if trace.TraceAggregates.JSON.RawJSON() != "" {
        			fmt.Println(trace.RootRun.Name, trace.TraceAggregates.TotalTokens, trace.TraceAggregates.TotalCost)
        		}
        		if count >= 5 {
        			break
        		}
        	}
        	if err := iter.Err(); err != nil {
        		panic(err.Error())
        	}
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -s -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid], "is_root": true, "limit": 5}')" \
          | jq '.runs[] | {trace_id, total_tokens, total_cost}'
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -X POST "https://api.smith.langchain.com/api/v2/traces/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{
            "project_id": $pid,
            "min_start_time": "2026-07-01T00:00:00Z",
            "max_start_time": "2026-07-31T23:59:59Z",
            "page_size": 5,
            "selects": ["NAME", "TOTAL_TOKENS", "TOTAL_COST"]
          }')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 按状态查找跟踪，或按 ID 获取跟踪

使用 `trace_filter` 按状态（例如，错误）过滤跟踪，或使用 `trace_ids` 跳过过滤并直接更快地获取已知跟踪。

<Tabs>
  <Tab title="Python">
    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        project = client.read_project(project_name="default")

        # v1 has no root-run-only filter concept — is_root plus a regular filter is
        # the closest equivalent, still scanning every run to match.
        error_traces = client.list_runs(
            project_id=project.id,
            is_root=True,
            filter='eq(status, "error")',
            limit=5,
        )
        for run in error_traces:
            print(run.trace_id)
        ```
      </Tab><Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")

            # trace_filter is implicitly root-run-only — no is_root needed.
            count = 0
            async for trace in client.traces.query(
                project_id=str(project.id),
                min_start_time="2026-07-01T00:00:00Z",
                max_start_time="2026-07-31T23:59:59Z",
                trace_filter='eq(status, "error")',
            ):
                print(trace.root_run.trace_id)
                count += 1
                if count >= 5:
                    break

            # trace_ids is a fast-path when you already know which traces you want.
            trace_id = "<trace-id>"
            async for trace in client.traces.query(
                project_id=str(project.id),
                min_start_time="2026-07-01T00:00:00Z",
                max_start_time="2026-07-31T23:59:59Z",
                trace_ids=[trace_id],
            ):
                print(trace.root_run.trace_id)


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });

        // v1 has no root-run-only filter concept — isRoot plus a regular filter is
        // the closest equivalent, still scanning every run to match.
        for await (const run of client.listRuns({
          projectId: project.id,
          isRoot: true,
          filter: 'eq(status, "error")',
          limit: 5,
        })) {
          console.log(run.trace_id);
        }
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });

        // trace_filter is implicitly root-run-only — no is_root needed.
        let count = 0;
        for await (const trace of client.traces.query({
          project_id: project.id,
          min_start_time: "2026-07-01T00:00:00Z",
          max_start_time: "2026-07-31T23:59:59Z",
          trace_filter: 'eq(status, "error")',
        })) {
          console.log(trace.root_run?.trace_id);
          count += 1;
          if (count >= 5) break;
        }

        // trace_ids is a fast-path when you already know which traces you want.
        let traceId = "<trace-id>";
        for await (const trace of client.traces.query({
          project_id: project.id,
          min_start_time: "2026-07-01T00:00:00Z",
          max_start_time: "2026-07-31T23:59:59Z",
          trace_ids: [traceId],
        })) {
          console.log(trace.root_run?.trace_id);
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        // v1 has no root-run-only filter concept — isRoot plus a regular filter is
        // the closest equivalent, still scanning every run to match.
        val runs = client.runs().query(
            RunQueryParams.builder()
                .addSession(project.id())
                .isRoot(true)
                .filter("eq(status, \"error\")")
                .limit(5L)
                .build()
        ).runs()
        for (run in runs) {
            println(run.traceId())
        }
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import java.time.OffsetDateTime

        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.sessions.SessionListParams
        import com.langchain.smith.models.traces.TraceQueryParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        val minStart = OffsetDateTime.parse("2026-07-01T00:00:00Z")
        val maxStart = OffsetDateTime.parse("2026-07-31T23:59:59Z")

        // trace_filter is implicitly root-run-only — no is_root needed.
        val errorTraces = client.traces().query(
            TraceQueryParams.builder()
                .projectId(project.id())
                .minStartTime(minStart)
                .maxStartTime(maxStart)
                .traceFilter("eq(status, \"error\")")
                .build()
        ).items().take(5)
        for (trace in errorTraces) {
            println(trace.rootRun().get().traceId().get())
        }

        // traceIds is a fast-path when you already know which traces you want.
        var traceId = "<trace-id>"
        val knownTraces = client.traces().query(
            TraceQueryParams.builder()
                .projectId(project.id())
                .minStartTime(minStart)
                .maxStartTime(maxStart)
                .traceIds(listOf(traceId))
                .build()
        ).items()
        for (trace in knownTraces) {
            println(trace.rootRun().get().traceId().get())
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID

        	// v1 has no root-run-only filter concept — IsRoot plus a regular filter is
        	// the closest equivalent, still scanning every run to match.
        	runs, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        		Session: langsmith.F([]string{projectID}),
        		IsRoot:  langsmith.F(true),
        		Filter:  langsmith.F(`eq(status, "error")`),
        		Limit:   langsmith.F(int64(5)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	for _, run := range runs.Runs {
        		fmt.Println(run.TraceID)
        	}
        }
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID

        	minStart, _ := time.Parse(time.RFC3339, "2026-07-01T00:00:00Z")
        	maxStart, _ := time.Parse(time.RFC3339, "2026-07-31T23:59:59Z")

        	// trace_filter is implicitly root-run-only — no is_root needed.
        	iter := client.Traces.QueryAutoPaging(ctx, langsmith.TraceQueryParams{
        		ProjectID:    langsmith.F(projectID),
        		MinStartTime: langsmith.F(minStart),
        		MaxStartTime: langsmith.F(maxStart),
        		TraceFilter:  langsmith.F(`eq(status, "error")`),
        	})
        	count := 0
        	for iter.Next() {
        		trace := iter.Current()
        		fmt.Println(trace.RootRun.TraceID)
        		count++
        		if count >= 5 {
        			break
        		}
        	}
        	if err := iter.Err(); err != nil {
        		panic(err.Error())
        	}

        	// trace_ids is a fast-path when you already know which traces you want.
        	traceID := "<trace-id>"
        	knownIter := client.Traces.QueryAutoPaging(ctx, langsmith.TraceQueryParams{
        		ProjectID:    langsmith.F(projectID),
        		MinStartTime: langsmith.F(minStart),
        		MaxStartTime: langsmith.F(maxStart),
        		TraceIDs:     langsmith.F([]string{traceID}),
        	})
        	for knownIter.Next() {
        		trace := knownIter.Current()
        		fmt.Println(trace.RootRun.TraceID)
        	}
        	if err := knownIter.Err(); err != nil {
        		panic(err.Error())
        	}
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        # v1 has no root-run-only filter concept — is_root plus a regular filter is
        # the closest equivalent, still scanning every run to match.
        curl -s -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid], "is_root": true, "filter": "eq(status, \"error\")", "limit": 5}')" \
          | jq '(.runs // []) | map(.trace_id)'
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        # trace_filter is implicitly root-run-only — no is_root needed.
        curl -s -X POST "https://api.smith.langchain.com/api/v2/traces/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{
            "project_id": $pid,
            "min_start_time": "2026-07-01T00:00:00Z",
            "max_start_time": "2026-07-31T23:59:59Z",
            "page_size": 5,
            "trace_filter": "eq(status, \"error\")"
          }')" | jq '.items | map(.root_run.trace_id)'

        # trace_ids is a fast-path when you already know which traces you want.
        TRACE_ID="<trace-id>"
        curl -s -X POST "https://api.smith.langchain.com/api/v2/traces/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" --arg tid "$TRACE_ID" '{
            "project_id": $pid,
            "min_start_time": "2026-07-01T00:00:00Z",
            "max_start_time": "2026-07-31T23:59:59Z",
            "trace_ids": [$tid]
          }')" | jq '.items | map(.root_run.trace_id)'
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

## Traces：列表运行

返回最小/最大开始时间内跟踪 ID 的运行。可选`filter`；可重复 `selects` 选择要返回的字段。

### 主要变化

#### 方法名称

<Tabs>
  <Tab title="Python">
    |之前 |之后|
    | ------------------------------------------------------ | ------------------------ | |
    | `client.list_runs(trace_id=...)`（通用）| `client.traces.list_runs()` |

    <Note>
      `client.traces.list_runs()` 现在是异步的。用 `await` 来调用它。
    </Note>

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/python/langsmith/_openapi_client/resources/traces/TracesResource/list_runs)。
  </Tab><Tab title="TypeScript">
    |之前 |之后|
    | ---------------------------------------------------- | -------------------------- |
    | `client.listRuns({ traceId })`（通用）| `client.traces.listRuns()` |

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/javascript/langsmith/_openapi_client/Langsmith/Traces/listRuns)。
  </Tab>

  <Tab title="Java">
    |之前 |之后|
    | ---------------------------------------------------------------- | ---------------------------- |
    | `client.runs().query()`（通用，`.trace(traceId)`）| `client.traces().listRuns()` |

    完整参数列表请参见[reference](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/TraceService.html)。
  </Tab>

  <Tab title="Go">
    |之前 |之后|
    | ------------------------------------------------- | -------------------------- |
    | `client.Runs.Query()`（通用，`Trace: traceID`）| `client.Traces.ListRuns()` |

    完整参数列表请参见[reference](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#TraceService.ListRuns)。
  </Tab>

  <Tab title="cURL">
    |之前 |之后|
    | ---------------------------------------------------- | ------------------------------------------------ |
    | `POST /api/v1/runs/query`（`trace`字段）| `GET /api/v2/traces/{trace_id}/runs` |
  </Tab>
</Tabs>

#### 查询参数<Tabs>
  <Tab title="Python">
    * `trace_id`/`trace`从查询参数移动到路径参数。
    * `project_id` 是新的并且**必需**（SmithDB 分区键）； `list_runs(trace_id=...)`不需要它。
    * `filter` 不变。
    * `min_start_time`/`max_start_time` 是新的。与`traces.query`不同，两者都没有默认值：省略两者并且运行根本不按时间过滤。它们是单独可选的，但如果设置了其中一个，则必须一起传递。
    * `select` 更名为 `selects`，使用与 `traces.query` 相同的 44 值枚举。
  </Tab>

  <Tab title="TypeScript">
    * `traceId`/`trace`从查询参数移动到路径参数。
    * `project_id` 是新的并且**必需**（SmithDB 分区键）； `listRuns({ traceId })`不需要它。
    * `filter` 不变。
    * `min_start_time`/`max_start_time` 是新的。与`traces.query`不同，两者都没有默认值：省略两者并且运行根本不按时间过滤。它们是单独可选的，但如果设置了其中一个，则必须一起传递。
    * `select` 更名为 `selects`，使用与 `traces.query` 相同的 44 值枚举。
  </Tab><Tab title="Java">
    * `traceId` 从查询参数 (`.trace(traceId)`) 移动到位置路径参数。
    * `projectId` 是新的并且**必需**（SmithDB 分区键）；通用的`runs().query()`不需要它。
    * `filter` 不变。
    * `minStartTime`/`maxStartTime` 是新的。与`traces().query()`不同，两者都没有默认值：省略两者并且运行根本不按时间过滤。它们是单独可选的，但如果设置了其中一个，则必须一起传递。
    * `select` 更名为 `selects`（44 值枚举）。
  </Tab>

  <Tab title="Go">
    * `traceID` 从查询参数 (`Trace: traceID`) 移动到位置路径参数。
    * `ProjectID` 是新的并且**必需**（SmithDB 分区键）；通用的`Runs.Query()`不需要它。
    * `Filter` 不变。
    * `MinStartTime`/`MaxStartTime` 是新的。与`Traces.Query()`不同，两者都没有默认值：省略两者并且运行根本不按时间过滤。它们是单独可选的，但如果设置了其中一个，则必须一起传递。
    * `Select`更名为`Selects`。
  </Tab><Tab title="cURL">
    * `trace` 从主体字段移动到路径段`{trace_id}`。
    * `project_id` 是新的并且**必需**（SmithDB 分区键）； `POST /api/v1/runs/query`不需要它。
    * `filter` 不变。
    * `min_start_time`/`max_start_time` 是新的。与`traces.query`不同，两者都没有默认值：省略两者并且运行根本不按时间过滤。它们是单独可选的，但如果设置了其中一个，则必须一起传递。
    * `select`更名为`selects`。
  </Tab>
</Tabs>

#### 响应字段

<Tabs>
  <Tab title="Python">
    该响应有一个 `items` 字段：按 `start_time` 顺序排列的 `Run` 对象列表，其形状与上面的 [Runs: query](/langsmith/smithdb-sdk-migration#runs-query) 响应相同。
  </Tab>

  <Tab title="TypeScript">
    该响应有一个 `items` 字段：按 `start_time` 顺序排列的 `Run` 对象数组，其形状与上面的 [Runs: query](/langsmith/smithdb-sdk-migration#runs-query) 响应相同。
  </Tab>

  <Tab title="Java">
    该响应有一个 `items()` 方法，返回 `Optional<List<Run>>`：跟踪按 `start_time` 顺序运行，与上面的 [Runs: query](/langsmith/smithdb-sdk-migration#runs-query) 响应形状相同。
  </Tab>

  <Tab title="Go">
    该响应有一个 `Items` 字段，类型为 `[]Run`：跟踪按 `start_time` 顺序运行，形状与上面的 [Runs: query](/langsmith/smithdb-sdk-migration#runs-query) 响应相同。
  </Tab><Tab title="cURL">
    JSON 响应有一个 `items` 数组字段：跟踪按 `start_time` 顺序运行，形状与上面的 [Runs: query](/langsmith/smithdb-sdk-migration#runs-query) 响应相同。
  </Tab>
</Tabs>

### 示例

#### 列出跟踪中的每个运行

根据给定的跟踪 ID，获取属于一个跟踪的所有运行。

<Tabs>
  <Tab title="Python">
    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        project = client.read_project(project_name="default")
        trace_id = "<trace-id>"
        runs = list(client.list_runs(project_id=project.id, trace_id=trace_id))
        for run in runs:
            print(run.name, run.run_type, run.status)
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            trace_id = "<trace-id>"
            response = await client.traces.list_runs(
                trace_id,
                project_id=str(project.id),
                selects=["NAME", "RUN_TYPE", "STATUS"],
            )
            for run in response.items:
                print(run.name, run.run_type, run.status)


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        let traceId = "<trace-id>";
        const runs = [];
        for await (const run of client.listRuns({ projectId: project.id, traceId })) {
          runs.push(run);
        }
        for (const run of runs) {
          console.log(run.name, run.run_type, run.status);
        }
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        let traceId = "<trace-id>";
        const response = await client.traces.listRuns(traceId, {
          project_id: project.id,
          selects: ["NAME", "RUN_TYPE", "STATUS"],
        });
        for (const run of response.items ?? []) {
          console.log(run.name, run.run_type, run.status);
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        var traceId = "<trace-id>"

        val runs = client.runs().query(
            RunQueryParams.builder()
                .addSession(project.id())
                .trace(traceId)
                .build()
        ).runs()
        for (run in runs) {
            println("${run.name()} ${run.runType()} ${run.status()}")
        }
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import java.time.OffsetDateTime

        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.sessions.SessionListParams
        import com.langchain.smith.models.traces.TraceListRunsParams
        import com.langchain.smith.models.traces.TraceQueryParams
        import kotlin.jvm.optionals.getOrNull

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        var traceId = "<trace-id>"

        val response = client.traces().listRuns(
            traceId,
            TraceListRunsParams.builder()
                .projectId(project.id())
                .addSelect(TraceListRunsParams.Select.NAME)
                .addSelect(TraceListRunsParams.Select.RUN_TYPE)
                .addSelect(TraceListRunsParams.Select.STATUS)
                .build()
        )
        for (run in response.items().getOrNull() ?: emptyList()) {
            println("${run.name().getOrNull()} ${run.runType().getOrNull()} ${run.status().getOrNull()}")
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID
        	traceID := "<trace-id>"

        	runs, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        		Session: langsmith.F([]string{projectID}),
        		Trace:   langsmith.F(traceID),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	for _, run := range runs.Runs {
        		fmt.Println(run.Name, run.RunType, run.Status)
        	}
        }
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID
        	traceID := "<trace-id>"

        	response, err := client.Traces.ListRuns(ctx, traceID, langsmith.TraceListRunsParams{
        		ProjectID: langsmith.F(projectID),
        		Selects: langsmith.F([]langsmith.TraceListRunsParamsSelect{
        			langsmith.TraceListRunsParamsSelectName,
        			langsmith.TraceListRunsParamsSelectRunType,
        			langsmith.TraceListRunsParamsSelectStatus,
        		}),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	for _, run := range response.Items {
        		fmt.Println(run.Name, run.RunType, run.Status)
        	}
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')
        TRACE_ID="<trace-id>"

        curl -s -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" --arg tid "$TRACE_ID" '{"session": [$pid], "trace": $tid}')" \
          | jq '.runs // []'
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')
        TRACE_ID="<trace-id>"

        curl -G "https://api.smith.langchain.com/api/v2/traces/$TRACE_ID/runs" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          --data-urlencode "project_id=$PROJECT_ID" \
          --data-urlencode "selects=NAME" \
          --data-urlencode "selects=RUN_TYPE" \
          --data-urlencode "selects=STATUS"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 仅获取跟踪中的 LLM 调用

将跟踪的运行范围缩小到特定的运行类型，例如仅 LLM 调用。

<Tabs>
  <Tab title="Python">
    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        project = client.read_project(project_name="default")
        trace_id = "<trace-id>"
        llm_runs = list(
            client.list_runs(
                project_id=project.id,
                trace_id=trace_id,
                filter='eq(run_type, "llm")',
            )
        )
        ```
      </Tab><Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            trace_id = "<trace-id>"
            response = await client.traces.list_runs(
                trace_id,
                project_id=str(project.id),
                filter='eq(run_type, "llm")',
                selects=["NAME", "STATUS"],
            )
            llm_runs = response.items


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        let traceId = "<trace-id>";
        const llmRuns = [];
        for await (const run of client.listRuns({
          projectId: project.id,
          traceId,
          filter: 'eq(run_type, "llm")',
        })) {
          llmRuns.push(run);
        }
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        let traceId = "<trace-id>";
        const response = await client.traces.listRuns(traceId, {
          project_id: project.id,
          filter: 'eq(run_type, "llm")',
          selects: ["NAME", "STATUS"],
        });
        const llmRuns = response.items ?? [];
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        var traceId = "<trace-id>"

        client.runs().query(
            RunQueryParams.builder()
                .addSession(project.id())
                .trace(traceId)
                .filter("eq(run_type, \"llm\")")
                .build()
        ).runs()
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import java.time.OffsetDateTime

        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.sessions.SessionListParams
        import com.langchain.smith.models.traces.TraceListRunsParams
        import com.langchain.smith.models.traces.TraceQueryParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        var traceId = "<trace-id>"

        client.traces().listRuns(
            traceId,
            TraceListRunsParams.builder()
                .projectId(project.id())
                .filter("eq(run_type, \"llm\")")
                .addSelect(TraceListRunsParams.Select.NAME)
                .addSelect(TraceListRunsParams.Select.STATUS)
                .build()
        )
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID
        	traceID := "<trace-id>"

        	_, err = client.Runs.Query(ctx, langsmith.RunQueryParams{
        		Session: langsmith.F([]string{projectID}),
        		Trace:   langsmith.F(traceID),
        		Filter:  langsmith.F(`eq(run_type, "llm")`),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        }
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID
        	traceID := "<trace-id>"

        	_, err = client.Traces.ListRuns(ctx, traceID, langsmith.TraceListRunsParams{
        		ProjectID: langsmith.F(projectID),
        		Filter:    langsmith.F(`eq(run_type, "llm")`),
        		Selects: langsmith.F([]langsmith.TraceListRunsParamsSelect{
        			langsmith.TraceListRunsParamsSelectName,
        			langsmith.TraceListRunsParamsSelectStatus,
        		}),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')
        TRACE_ID="<trace-id>"

        curl -s -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" --arg tid "$TRACE_ID" '{"session": [$pid], "trace": $tid, "filter": "eq(run_type, \"llm\")"}')" \
          | jq '.runs // []'
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')
        TRACE_ID="<trace-id>"

        curl -G "https://api.smith.langchain.com/api/v2/traces/$TRACE_ID/runs" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          --data-urlencode "project_id=$PROJECT_ID" \
          --data-urlencode "filter=eq(run_type, \"llm\")" \
          --data-urlencode "selects=NAME" \
          --data-urlencode "selects=STATUS"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

## 主题：查询

使用基于游标的分页查询项目内的线程。返回与给定时间范围和可选过滤器匹配的线程。

### 主要变化

#### 方法名称

<Tabs>
  <Tab title="Python">
    |之前 |之后|
    | ----------------------- | ------------------------ |
    | `client.list_threads()` | `client.threads.query()` |

    <Note>
      `client.threads.query()` 现在是异步的。用 `await` 来调用它。
    </Note>

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/python/langsmith/_openapi_client/resources/threads/ThreadsResource/query)。
  </Tab><Tab title="TypeScript">
    |之前 |之后|
    | ---------------------- | ------------------------ |
    | `client.listThreads()` | `client.threads.query()` |

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/javascript/langsmith/_openapi_client/Langsmith/Threads/query)。
  </Tab>

  <Tab title="Java">
    <Note>Java 从来没有专门的线程列表方法。最接近的传统等效项是通用运行查询，按 `thread_id` 元数据约定手动分组。</Note>

    |之前 |之后|
    | ------------------------------------------------------ | -------------------------- |
    | `client.runs().query()`（通用、分组客户端）| `client.threads().query()` |

    完整参数列表请参见[reference](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/ThreadService.html)。
  </Tab>

  <Tab title="Go">
    <Note>Go 从来没有专门的线程列表方法。最接近的传统等效项是通用运行查询，按 `thread_id` 元数据约定手动分组。</Note>

    |之前 |之后|
    | ---------------------------------------------------------------- | ------------------------ |
    | `client.Runs.Query()`（通用、分组客户端）| `client.Threads.Query()` |

    完整参数列表请参见[reference](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#ThreadService.QueryAutoPaging)。
  </Tab><Tab title="cURL">
    |之前 |之后|
    | --------------------------------------------------------------------------- | ---------------------------- |
    | `POST /api/v1/runs/query`（`is_root=true`，分组客户端）| `POST /api/v2/threads/query` |

    有关完整参数和字段列表，请参阅[API doc](/langsmith/smith-api/threads/query-threads)。
  </Tab>
</Tabs>

#### 查询参数

<Tabs>
  <Tab title="Python">
    |之前 (`list_threads`) |之后 (`threads.query`) |笔记|
    | ------------------------------------------------ | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
    | `project_id` 异或 `project_name` | `project_id` |新方法只需要 UUID；首先通过 `aread_project()` 解析名称，与 `Runs: query` 模式相同 |
    | `start_time`（默认为1天前）| `min_start_time` + `max_start_time` |选修的;默认为现在结束的 1 天窗口，与 `start_time` || `offset` + `limit` | `cursor` + `page_size` |偏移分页被光标分页取代 |
    | `filter`（针对运行进行评估）| `filter` |语法相同；现在针对每个线程的根运行进行评估 |
  </Tab>

  <Tab title="TypeScript">
    |之前 (`listThreads`) |之后（`threads.query`）|笔记|
    | ----------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- |
    | `projectId` 异或 `projectName` | `project_id` |新方法只需要 UUID；首先通过 `readProject()` 解析名称 |
    | `startTime`（默认为1天前）| `min_start_time` + `max_start_time` |选修的;默认为现在结束的 1 天窗口，与 `startTime` |
    | `offset` + `limit` | `cursor` + `page_size` |偏移分页被光标分页取代 || `filter` | `filter` |语法相同；现在针对每个线程的根运行进行评估 |
  </Tab>

  <Tab title="Java">
    没有要映射的查询参数。没有专门的方法。旧方法使用通用运行查询（`is_root=true`，按`thread_id`元数据手动分组）。 `threads().query()` 采用 `projectId`、`minStartTime`、`maxStartTime`（均为可选，默认为现在结束的 1 天窗口）、`filter`、`pageSize`、`cursor`。
  </Tab>

  <Tab title="Go">
    没有要映射的查询参数。没有专门的方法。旧方法使用通用运行查询（`IsRoot: true`，按`thread_id`元数据手动分组）。 `Threads.Query()` 采用 `ProjectID`、`MinStartTime`、`MaxStartTime`（均为可选，默认为现在结束的 1 天窗口）、`Filter`、`PageSize`、`Cursor`。
  </Tab>

  <Tab title="cURL">
    `POST /api/v2/threads/query`正文字段：`project_id`、`min_start_time`（可选）、`max_start_time`（可选）、`filter`、`page_size`、`cursor`（全部`snake_case`）。如果省略，`min_start_time`/`max_start_time` 默认为 1 天窗口，现在结束。
  </Tab>
</Tabs>

#### 响应字段

<Tabs>
  <Tab title="Python">
    Python 的遗留`ListThreadsItem` 只有`thread_id`、`runs`（完全嵌入`Run[]`）、`count`、`min_start_time`、`max_start_time`。它根本没有令牌/成本/延迟/反馈字段。新的`Thread`永远不会嵌入完整的运行列表（这就是`threads.list_traces`的用途），而是添加真实的`feedback_stats`，`latency_p50`/`latency_p99`，每个类别的成本/代币总和`_details`， `first_trace_id`/`last_trace_id`、`first_inputs`/`last_outputs`预览、`last_error`、`num_errored_turns`。

    |之前（旧版`ListThreadsItem`）|之后（新`Thread`）|笔记|
    | --------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
    | `thread_id` | `thread_id` |不变 |
    | `runs`（全嵌入式`Run[]`）| *（不可用）* |使用 `threads.list_traces` 获取每条轨迹的详细信息 |
    | `count` | `count` |不变 || `min_start_time` | `min_start_time` |不变 |
    | `max_start_time` | `max_start_time` |不变 |
    | *（不可用）* | `start_time` |新：该行的参考开始时间，例如用于排序 |
    | *（不可用）* | `trace_id` |新功能：具有代表性的根跟踪 UUID，例如用于深层链接 |
    | *（不可用）* | `first_trace_id`、`last_trace_id` |新：查询窗口中按时间顺序排列的第一个/最后一个跟踪 UUID |
    | *（不可用）* | `first_inputs`、`last_outputs` |新功能：第一条/最后一条轨迹的预览被截断 |
    | *（不可用）* | `last_error` |新 || *（不可用）* | `num_errored_turns` |新 |
    | *（不可用）* | `latency_p50`、`latency_p99` |新 |
    | *（不可用）* | `total_tokens`、`total_cost` |新 |
    | *（不可用）* | `total_token_details`、`total_cost_details` |新功能：按类别的字典，与 `threads.list_traces` 不同，它们不包含在 `.raw` | 中
    | *（不可用）* | `feedback_stats` |新 |
  </Tab><Tab title="TypeScript">
    |之前（旧版`ListThreadsItem`）|之后（新`Thread`）|笔记|
    | --------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
    | `thread_id` | `thread_id` |不变 |
    | `runs`（全嵌入式`Run[]`）| *（不可用）* |使用 `threads.listTraces` 获取每条轨迹的详细信息 |
    | `count` | `count` |不变 |
    | `min_start_time` | `min_start_time` |不变 |
    | `max_start_time` | `max_start_time` |不变 || `total_tokens` | `total_tokens` |不变 |
    | `total_cost` | `total_cost` |不变 |
    | `latency_p50`、`latency_p99` | `latency_p50`、`latency_p99` |不变 |
    | `feedback_stats` | `feedback_stats` |不变 |
    | `first_inputs`、`last_outputs` | `first_inputs`、`last_outputs` |不变 |
    | `last_error` | `last_error` |不变 |
    | *（不可用）* | `start_time` |新：该行的参考开始时间，例如用于排序 || *（不可用）* | `trace_id` |新功能：具有代表性的根跟踪 UUID，例如用于深层链接 |
    | *（不可用）* | `first_trace_id`、`last_trace_id` |新功能：查询窗口中按时间顺序排列的第一个/最后一个跟踪 UUID |
    | *（不可用）* | `num_errored_turns` |新 |
    | *（不可用）* | `total_token_details`、`total_cost_details` |新功能：按类别的字典，与 `threads.listTraces` 不同，它们不包含在 `.raw` | 中
  </Tab>

  <Tab title="Java">
    `Thread` 有 19 个字段：`threadId`、`count`、`feedbackStats`、`firstInputs`、`firstTraceId`、`lastError`、`lastOutputs`、 `lastTraceId`、`latencyP50`、`latencyP99`、`maxStartTime`、`minStartTime`、`numErroredTurns`、`startTime`、`totalCost`、`totalCostDetails`、 `totalTokenDetails`、`totalTokens`、`traceId`（全部`Optional`）。

    旧版 SDK 从来没有对此进行类型化响应。 Java 最接近的等效分组原始 `runs().query()` 结果由 `thread_id` 元数据客户端提供。下面的每个字段都是新的。|新`Thread`方法 |笔记|
    | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
    | `threadId()` |                                                                                                                        |
    | `count()` |                                                                                                                        |
    | `minStartTime()`、`maxStartTime()`、`startTime()` |                                                                                                                        |
    | `firstTraceId()`、`lastTraceId()`、`traceId()` | `traceId()` 是一个代表性的根跟踪 UUID，例如，除了第一个/最后一个跟踪 UUID 之外，还用于深层链接 |
    | `firstInputs()`、`lastOutputs()` |第一个/最后一个跟踪的预览被截断 || `lastError()` |                                                                                                                        |
    | `numErroredTurns()` |                                                                                                                        |
    | `latencyP50()`、`latencyP99()` |                                                                                                                        |
    | `totalTokens()`、`totalCost()` |                                                                                                                        |
    | `totalTokenDetails()`、`totalCostDetails()` |按类别地图 |
    | `feedbackStats()` |                                                                                                                        |
  </Tab>

  <Tab title="Go">
    `Thread` 有 19 个字段，采用 `PascalCase` Go 结构体形式（例如 `ThreadID`、`Count`、`LatencyP50`）。旧版 SDK 从来没有对此进行类型化响应。 Go 最接近的等效分组原始 `Runs.Query()` 由 `thread_id` 元数据客户端结果。下面的每个字段都是新的。

    |新`Thread`字段|笔记|
    | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
    | `ThreadID` |                                                                                                                      |
    | `Count` |                                                                                                                      |
    | `MinStartTime`、`MaxStartTime`、`StartTime` |                                                                                                                      |
    | `FirstTraceID`、`LastTraceID`、`TraceID` | `TraceID` 是一个代表性的根跟踪 UUID，例如，除了第一个/最后一个跟踪 UUID 之外，还用于深层链接 || `FirstInputs`、`LastOutputs` |第一个/最后一个跟踪的预览被截断 |
    | `LastError` |                                                                                                                      |
    | `NumErroredTurns` |                                                                                                                      |
    | `LatencyP50`、`LatencyP99` |                                                                                                                      |
    | `TotalTokens`、`TotalCost` |                                                                                                                      |
    | `TotalTokenDetails`、`TotalCostDetails` |按类别地图 |
    | `FeedbackStats` |                                                                                                                      |
  </Tab><Tab title="cURL">
    JSON 响应字段使用 `snake_case`：`thread_id`、`count`、`feedback_stats`、`first_inputs`、`first_trace_id`、`last_error`、`last_outputs`、 `last_trace_id`、`latency_p50`、`latency_p99`、`max_start_time`、`min_start_time`、`num_errored_turns`、`start_time`、`total_cost`、`total_cost_details`、 `total_token_details`、`total_tokens`、`trace_id`。

    旧版 API 从来没有专用的线程端点。最接近的等效项是 `POST /api/v1/runs/query`，在客户端按 `thread_id` 元数据分组。下面的每个字段都是新的。

    |新`threads.query`响应字段 |笔记|
    | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
    | `thread_id` |                                                                                                                       |
    | `count` |                                                                                                                       || `min_start_time`、`max_start_time`、`start_time` |                                                                                                                       |
    | `first_trace_id`、`last_trace_id`、`trace_id` | `trace_id` 是一个代表性的根跟踪 UUID，例如，除了第一个/最后一个跟踪 UUID 之外，还用于深层链接 |
    | `first_inputs`、`last_outputs` |第一个/最后一个跟踪的预览被截断 |
    | `last_error` |                                                                                                                       |
    | `num_errored_turns` |                                                                                                                       |
    | `latency_p50`、`latency_p99` |                                                                                                                       |
    | `total_tokens`、`total_cost` |                                                                                                                       || `total_token_details`、`total_cost_details` |按类别听写 |
    | `feedback_stats` |                                                                                                                       |
  </Tab>
</Tabs>

### 示例

#### 列出项目中的线程

获取某个时间范围内项目中具有活动的每个线程。

<Tabs>
  <Tab title="Python">
    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        threads = client.list_threads(project_name="default")
        for thread in threads:
            print(thread["thread_id"], thread["count"])
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            async for thread in client.threads.query(
                project_id=str(project.id),
                min_start_time="2026-07-01T00:00:00Z",
                max_start_time="2026-07-31T23:59:59Z",
            ):
                print(thread.thread_id, thread.count)


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const threads = await client.listThreads({ projectName: "default" });
        for (const thread of threads) {
          console.log(thread.thread_id, thread.count);
        }
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        for await (const thread of client.threads.query({
          project_id: project.id,
          min_start_time: "2026-07-01T00:00:00Z",
          max_start_time: "2026-07-31T23:59:59Z",
        })) {
          console.log(thread.thread_id, thread.count);
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        // v1 has no dedicated thread grouping — the generic run query returns raw
        // root runs, with no built-in way to bucket them by thread.
        val rootRuns = client.runs().query(
            RunQueryParams.builder()
                .addSession(project.id())
                .isRoot(true)
                .build()
        ).runs()
        for (run in rootRuns) {
            println("${run.traceId()} ${run.id()}")
        }
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import java.time.OffsetDateTime

        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.sessions.SessionListParams
        import com.langchain.smith.models.threads.ThreadQueryParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        val threads = client.threads().query(
            ThreadQueryParams.builder()
                .projectId(project.id())
                .minStartTime(OffsetDateTime.parse("2026-07-01T00:00:00Z"))
                .maxStartTime(OffsetDateTime.parse("2026-07-31T23:59:59Z"))
                .build()
        ).items()
        for (thread in threads) {
            println("${thread.threadId().get()} ${thread.count().get()}")
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID

        	runs, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        		Session: langsmith.F([]string{projectID}),
        		IsRoot:  langsmith.F(true),
        	})
        	if err != nil {
        		panic(err.Error())
        	}

        	threads := map[string]int{}
        	for _, run := range runs.Runs {
        		metadata, ok := run.Extra["metadata"].(map[string]interface{})
        		if !ok {
        			continue
        		}
        		threadID, ok := metadata["thread_id"].(string)
        		if ok {
        			threads[threadID]++
        		}
        	}
        	for threadID, count := range threads {
        		fmt.Println(threadID, count)
        	}
        }
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID

        	minStart, _ := time.Parse(time.RFC3339, "2026-07-01T00:00:00Z")
        	maxStart, _ := time.Parse(time.RFC3339, "2026-07-31T23:59:59Z")

        	iter := client.Threads.QueryAutoPaging(ctx, langsmith.ThreadQueryParams{
        		ProjectID:    langsmith.F(projectID),
        		MinStartTime: langsmith.F(minStart),
        		MaxStartTime: langsmith.F(maxStart),
        	})
        	for iter.Next() {
        		thread := iter.Current()
        		fmt.Println(thread.ThreadID, thread.Count)
        	}
        	if err := iter.Err(); err != nil {
        		panic(err.Error())
        	}
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -s -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid], "is_root": true}')" \
          | jq '[(.runs // [])[] | select(.extra.metadata.thread_id != null)] | group_by(.extra.metadata.thread_id) | map({
              thread_id: .[0].extra.metadata.thread_id,
              count: length
            })'
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -X POST "https://api.smith.langchain.com/api/v2/threads/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{
            "project_id": $pid,
            "min_start_time": "2026-07-01T00:00:00Z",
            "max_start_time": "2026-07-31T23:59:59Z"
          }')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 查找有错误的线程查找回合结束时出现错误的线程。

<Tabs>
  <Tab title="Python">
    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        threads = client.list_threads(project_name="default", filter='eq(status, "error")')
        for thread in threads:
            print(thread["thread_id"])
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            async for thread in client.threads.query(
                project_id=str(project.id),
                min_start_time="2026-07-01T00:00:00Z",
                max_start_time="2026-07-31T23:59:59Z",
                filter='eq(status, "error")',
            ):
                print(thread.thread_id, thread.last_error)


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const threads = await client.listThreads({
          projectName: "default",
          filter: 'eq(status, "error")',
        });
        for (const thread of threads) {
          console.log(thread.thread_id, thread.last_error);
        }
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        for await (const thread of client.threads.query({
          project_id: project.id,
          min_start_time: "2026-07-01T00:00:00Z",
          max_start_time: "2026-07-31T23:59:59Z",
          filter: 'eq(status, "error")',
        })) {
          console.log(thread.thread_id, thread.last_error);
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams
        import kotlin.jvm.optionals.getOrNull

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        val rootRuns = client.runs().query(
            RunQueryParams.builder()
                .addSession(project.id())
                .isRoot(true)
                .filter("eq(status, \"error\")")
                .build()
        ).runs()
        for (run in rootRuns) {
            println("${run.traceId()} ${run.error().getOrNull()}")
        }
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import java.time.OffsetDateTime

        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.sessions.SessionListParams
        import com.langchain.smith.models.threads.ThreadQueryParams
        import kotlin.jvm.optionals.getOrNull

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        val threads = client.threads().query(
            ThreadQueryParams.builder()
                .projectId(project.id())
                .minStartTime(OffsetDateTime.parse("2026-07-01T00:00:00Z"))
                .maxStartTime(OffsetDateTime.parse("2026-07-31T23:59:59Z"))
                .filter("eq(status, \"error\")")
                .build()
        ).items()
        for (thread in threads) {
            println("${thread.threadId().get()} ${thread.lastError().getOrNull()}")
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID

        	runs, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        		Session: langsmith.F([]string{projectID}),
        		IsRoot:  langsmith.F(true),
        		Filter:  langsmith.F(`eq(status, "error")`),
        	})
        	if err != nil {
        		panic(err.Error())
        	}

        	threadIDs := map[string]bool{}
        	for _, run := range runs.Runs {
        		metadata, ok := run.Extra["metadata"].(map[string]interface{})
        		if !ok {
        			continue
        		}
        		if threadID, ok := metadata["thread_id"].(string); ok {
        			threadIDs[threadID] = true
        		}
        	}
        	for threadID := range threadIDs {
        		fmt.Println(threadID)
        	}
        }
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID

        	minStart, _ := time.Parse(time.RFC3339, "2026-07-01T00:00:00Z")
        	maxStart, _ := time.Parse(time.RFC3339, "2026-07-31T23:59:59Z")

        	iter := client.Threads.QueryAutoPaging(ctx, langsmith.ThreadQueryParams{
        		ProjectID:    langsmith.F(projectID),
        		MinStartTime: langsmith.F(minStart),
        		MaxStartTime: langsmith.F(maxStart),
        		Filter:       langsmith.F(`eq(status, "error")`),
        	})
        	for iter.Next() {
        		thread := iter.Current()
        		fmt.Println(thread.ThreadID, thread.LastError)
        	}
        	if err := iter.Err(); err != nil {
        		panic(err.Error())
        	}
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -s -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid], "is_root": true, "filter": "eq(status, \"error\")"}')" \
          | jq -r '[(.runs // [])[].extra.metadata.thread_id] | unique | .[]'
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

        curl -X POST "https://api.smith.langchain.com/api/v2/threads/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" '{
            "project_id": $pid,
            "min_start_time": "2026-07-01T00:00:00Z",
            "max_start_time": "2026-07-31T23:59:59Z",
            "filter": "eq(status, \"error\")"
          }')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

## 线程：列出痕迹

检索属于项目内特定线程的所有跟踪。

### 主要变化

#### 方法名称

<Tabs>
  <Tab title="Python">
    |之前 |之后 |
    | ---------------------- | ------------------------------------------ |
    | `client.read_thread()` | `client.threads.list_traces()` |

    <Note>
      `client.threads.list_traces()` 现在是异步的。用 `await` 来调用它。
    </Note>

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/python/langsmith/_openapi_client/resources/threads/ThreadsResource/list_traces)。
  </Tab><Tab title="TypeScript">
    |之前 |之后|
    | -------------------- | -------------------------------------- |
    | `client.readThread()` | `client.threads.listTraces()` |

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/javascript/langsmith/_openapi_client/Langsmith/Threads/listTraces)。
  </Tab>

  <Tab title="Java">
    <Note>Java 从来没有专用的每线程方法。最接近的传统等效项是按 `thread_id` 元数据约定过滤的通用运行查询。</Note>

    |之前 |之后|
    | ------------------------------------------------- | ------------------------------------------- |
    | `client.runs().query()`（由`thread_id`过滤）| `client.threads().listTraces()` |

    完整参数列表请参见[reference](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/ThreadService.html)。
  </Tab>

  <Tab title="Go">
    <Note>Go 从来没有专用的每线程方法。最接近的传统等效项是按 `thread_id` 元数据约定过滤的通用运行查询。</Note>

    |之前 |之后|
    | ----------------------------------------------------------- | -------------------------------------- |
    | `client.Runs.Query()`（由`thread_id`过滤）| `client.Threads.ListTraces()` |

    完整参数列表请参见[reference](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#ThreadService.ListTracesAutoPaging)。
  </Tab><Tab title="cURL">
    |之前 |之后 |
    | ------------------------------------------------------- | ---------------------------------------------------- |
    | `POST /api/v1/runs/query` (`filter=eq(thread_id, ...)`) | `GET /api/v2/threads/{thread_id}/traces` |

    有关完整参数和字段列表，请参阅[API doc](/langsmith/smith-api/threads/query-thread-traces)。
  </Tab>
</Tabs>

#### 查询参数

<Tabs>
  <Tab title="Python">
    `read_thread` 的 `is_root` 没有新的等效项。 `list_traces` 始终仅返回与其名称匹配的跟踪（根运行）。 `read_thread` 的 `order` (asc/desc) 也没有新的等效项：结果始终按 `start_time` 升序（固定的服务器端顺序）排序。|之前 (`read_thread`) |之后 (`list_traces`) |笔记|
    | ----------------------------------- | ------------------------ | ----------------------------------------------------------------------------------- |
    | `thread_id` | `thread_id`（路径参数）|不变 |
    | `project_id` 异或 `project_name` | `project_id` |新方法只需要 UUID |
    | `is_root` | *（不可用）* |新方法始终仅返回跟踪（根运行）|
    | `order` | *（不可用）* |新方法没有排序/顺序字段 |
    | `filter` | `filter` |相同的语法，现在针对每个根跟踪运行进行评估 |
    | `select`（任意运行字段列表）| `selects` |新方法使用 `ThreadTraceSelectField`，一个 24 值大写枚举 || *（不可用）* | `page_size` + `cursor` |新方法添加光标分页 |
  </Tab>

  <Tab title="TypeScript">
    `readThread` 的 `isRoot` 没有新的等效项。 `listTraces` 始终仅返回与其名称匹配的跟踪（根运行）。 `readThread` 的 `order` (asc/desc) 也没有新的等效项：结果始终按 `start_time` 升序（固定的服务器端顺序）排序。

    |之前 (`readThread`) |之后 (`listTraces`) |笔记|
    | ----------------------------------- | ----------------------- | ------------------------------------------------------ |
    | `threadId` | `threadId`（路径参数）|不变 |
    | `projectId` 异或 `projectName` | `project_id` |新方法只需要 UUID |
    | `isRoot` | *（不可用）* |新方法始终仅返回跟踪（根运行）|
    | `order` | *（不可用）* |新方法没有排序/顺序字段 || `filter` | `filter` |相同的语法，现在针对每个根跟踪运行进行评估 |
    | `select`（任意运行字段列表）| `selects` |新方法使用 24 值大写枚举 |
    | *（不可用）* | `page_size` + `cursor` |新方法添加光标分页 |
  </Tab>

  <Tab title="Java">
    没有要映射的查询参数。没有专门的方法。 `listTraces(threadId, params)` 采用 `projectId`、`filter`、`pageSize`、`cursor`、`selects`（24 值枚举）。结果始终按 `startTime` 升序（固定的服务器端顺序）排序。
  </Tab>

  <Tab title="Go">
    没有要映射的查询参数。没有专门的方法。 `ListTraces(ctx, threadID, params)` 采用 `ProjectID`、`Filter`、`PageSize`、`Cursor`、`Selects`（24 值枚举）。结果始终按 `StartTime` 升序（固定的服务器端顺序）排序。
  </Tab>

  <Tab title="cURL">
    `GET /api/v2/threads/{thread_id}/traces`查询参数：`project_id`、`filter`、`page_size`、`cursor`、`selects`（可重复）、全部`snake_case`。结果始终按 `start_time` 升序（固定的服务器端顺序）排序。
  </Tab>
</Tabs>

#### 响应字段<Tabs>
  <Tab title="Python">
    旧版 `read_thread` 返回完整的 `Run` 对象（生成器）。新的`ThreadTrace`是轻量级的：预览字段（`inputs_preview`/`outputs_preview`）而不是完整的`inputs`/`outputs`，没有嵌入式子运行。 `selects` 控制填充的内容，与`traces.query` 相同。

    |之前（旧版 `Run` 字段，来自 `read_thread`）|之后（新 `ThreadTrace` 字段）|笔记|
    | ---------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
    | `id` | *（不可用）* |旧版根运行`id`和`trace_id`是相同的；新 API 仅公开 `trace_id` |
    | `trace_id` | `trace_id` |省略 `selects` 时默认返回 || `name` | `name` |除非包含在 `selects` 中，否则将被省略 |
    | `start_time` | `start_time` |除非包含在 `selects` 中，否则将被省略 |
    | `end_time` | `end_time` |除非包含在 `selects` 中，否则将被省略 |
    | `run_type` | `op` |更名；编码为数字而不是字符串 |
    | `inputs` | `inputs_preview`，或 `inputs` 对于未截断的有效负载 |默认情况下预览被截断；选择`INPUTS`作为完整有效负载 || `outputs` | `outputs_preview`，或 `outputs` 对于未截断的有效负载 |默认情况下预览被截断；选择`OUTPUTS`作为完整有效负载 |
    | `error` | `error_preview`，或 `error` 获取完整消息 |默认情况下摘要被截断；选择 `ERROR` 查看完整错误消息 |
    | `latency`（属性）| `latency` |原生字段而不是计算的 `timedelta` 属性 |
    | `total_tokens`、`prompt_tokens`、`completion_tokens` | `total_tokens`、`prompt_tokens`、`completion_tokens` |不变 |
    | `total_cost`、`prompt_cost`、`completion_cost` | `total_cost`、`prompt_cost`、`completion_cost` |不变 |
    | `prompt_token_details`、`completion_token_details` | `prompt_token_details`、`completion_token_details` |字段现在包裹了字典；访问`.raw` || `prompt_cost_details`、`completion_cost_details` | `prompt_cost_details`、`completion_cost_details` |字段现在包裹了字典；访问`.raw` |
    | `first_token_time` | `first_token_time` |除非包含在 `selects` 中，否则将被省略 |
    | *（不可用）* | `thread_id` |新：此跟踪所属的线程 UUID |
    | `child_runs`、`child_run_ids` | *（不可用）* |没有嵌入的子进程运行；使用 `traces.list_runs` 进行后代运行 |
  </Tab>

  <Tab title="TypeScript">
    旧版 `readThread` 返回完整的 `Run` 对象（异步生成器）。新的`ThreadTrace`是轻量级的：预览字段（`inputs_preview`/`outputs_preview`）而不是完整的`inputs`/`outputs`，没有嵌入式子运行。 `selects` 控制填充内容，与`traces.query` 相同。|之前（旧版 `Run` 字段，来自 `readThread`）|之后（新`ThreadTrace`字段）|笔记|
    | ---------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
    | `id` | *（不可用）* |旧版根运行`id`和`trace_id`是相同的；新 API 仅公开 `trace_id` |
    | `trace_id` | `trace_id` |省略`selects`时默认返回 |
    | `name` | `name` |除非包含在 `selects` 中，否则省略 || `start_time` | `start_time` |除非包含在 `selects` 中，否则省略 |
    | `end_time` | `end_time` |除非包含在 `selects` 中，否则省略 |
    | `run_type` | `op` |更名；编码为数字而不是字符串 |
    | `inputs` | `inputs_preview`，或 `inputs` 对于未截断的有效负载 |默认情况下预览被截断；选择 `INPUTS` 作为完整有效负载 |
    | `outputs` | `outputs_preview`，或 `outputs` 对于未截断的有效负载 |默认情况下预览被截断；选择 `OUTPUTS` 作为完整有效负载 || `error` | `error_preview`，或`error` 获取完整消息 |默认情况下摘要被截断；选择 `ERROR` 查看完整错误消息 |
    | `latency` | `latency` |原生字段上的新类型 |
    | `total_tokens`、`prompt_tokens`、`completion_tokens` | `total_tokens`、`prompt_tokens`、`completion_tokens` |不变 |
    | `total_cost`、`prompt_cost`、`completion_cost` | `total_cost`、`prompt_cost`、`completion_cost` |不变 |
    | `prompt_token_details`、`completion_token_details` | `prompt_token_details`、`completion_token_details` |不变 |
    | `prompt_cost_details`、`completion_cost_details` | `prompt_cost_details`、`completion_cost_details` |不变 || `first_token_time` | `first_token_time` |除非包含在 `selects` 中，否则省略 |
    | *（不可用）* | `thread_id` |新：此跟踪所属的线程 UUID |
    | `child_runs`、`child_run_ids` | *（不可用）* |没有嵌入的子进程运行；使用 `traces.listRuns` 进行后代运行 |
  </Tab>

  <Tab title="Java">
    `ThreadTrace` 有 24 个`Optional` 字段：`traceId`、`threadId`、`name`、`startTime`、`endTime`、`latency`、 `op`，每个类别的令牌/成本字段`_details`，`inputsPreview`/`outputsPreview`/`inputs`/`outputs`，`errorPreview`/`error`， `firstTokenTime`。|之前（旧版`RunSchema`方法）|之后（新`ThreadTrace`方法）|笔记|
    | ------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
    | `id()` | *（不可用）* |旧版根运行`id()`和`traceId()`是相同的；新 API 仅公开 `traceId()` |
    | `traceId()` | `traceId()` |省略 `selects` 时默认返回 |
    | `name()` | `name()` |除非包含在 `selects` 中，否则省略 || `startTime()` | `startTime()` |除非包含在 `selects` 中，否则省略 |
    | `endTime()` | `endTime()` |除非包含在 `selects` 中，否则省略 |
    | `runType()` | `op()` |更名；编码为数字而不是字符串 |
    | `inputs()` | `inputsPreview()`，或 `inputs()` 对于未截断的有效负载 |默认情况下预览被截断；选择 `INPUTS` 以获得完整的有效负载 |
    | `outputs()` | `outputsPreview()`，或 `outputs()` 对于未截断的有效负载 |默认情况下预览被截断；选择 `OUTPUTS` 作为完整有效负载 || `error()` | `errorPreview()`，或 `error()` 获取完整消息 |默认情况下摘要被截断；选择 `ERROR` 查看完整错误消息 |
    | `latency()` | `latency()` |不变 |
    | `totalTokens()`、`promptTokens()`、`completionTokens()` | `totalTokens()`、`promptTokens()`、`completionTokens()` |不变 |
    | `totalCost()`、`promptCost()`、`completionCost()` | `totalCost()`、`promptCost()`、`completionCost()` |不变 |
    | `promptTokenDetails()`、`completionTokenDetails()` | `promptTokenDetails()`、`completionTokenDetails()` |不变 |
    | `promptCostDetails()`、`completionCostDetails()` | `promptCostDetails()`、`completionCostDetails()` |不变 || `firstTokenTime()` | `firstTokenTime()` |除非包含在 `selects` 中，否则省略 |
    | *（不可用）* | `threadId()` |新：此跟踪所属的线程 UUID |
    | `childRuns()`、`childRunIds()` | *（不可用）* |没有嵌入的子进程运行；使用 `traces().listRuns()` 进行后代运行 |
  </Tab>

  <Tab title="Go">
    `ThreadTrace` 有 24 个字段，采用 `PascalCase` Go 结构体形式。|之前（旧根`Run`字段）|之后（新`ThreadTrace`字段）|笔记|
    | ------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
    | `ID` | *（不可用）* |旧版根运行`ID`和`TraceID`是相同的；新 API 仅公开 `TraceID` |
    | `TraceID` | `TraceID` |省略`Selects`时默认返回 |
    | `Name` | `Name` |除非包含在 `Selects` 中，否则省略 || `StartTime` | `StartTime` |除非包含在 `Selects` 中，否则将被省略 |
    | `EndTime` | `EndTime` |除非包含在 `Selects` 中，否则省略 |
    | `RunType` | `Op` |更名；编码为数字而不是字符串 |
    | `Inputs` | `InputsPreview`，或 `Inputs` 对于未截断的有效负载 |默认情况下预览被截断；选择 `INPUTS` 以获得完整有效负载 |
    | `Outputs` | `OutputsPreview`，或 `Outputs` 对于未截断的有效负载 |默认情况下预览被截断；选择 `OUTPUTS` 作为完整有效负载 || `Error` | `ErrorPreview`，或 `Error` 获取完整消息 |默认情况下摘要被截断；选择 `ERROR` 查看完整错误消息 |
    | `Latency` | `Latency` |不变 |
    | `TotalTokens`、`PromptTokens`、`CompletionTokens` | `TotalTokens`、`PromptTokens`、`CompletionTokens` |不变 |
    | `TotalCost`、`PromptCost`、`CompletionCost` | `TotalCost`、`PromptCost`、`CompletionCost` |不变 |
    | `PromptTokenDetails`、`CompletionTokenDetails` | `PromptTokenDetails`、`CompletionTokenDetails` |不变 |
    | `PromptCostDetails`、`CompletionCostDetails` | `PromptCostDetails`、`CompletionCostDetails` |不变 || `FirstTokenTime` | `FirstTokenTime` |除非包含在 `Selects` 中，否则省略 |
    | *（不可用）* | `ThreadID` |新：此跟踪所属的线程 UUID |
    | `ChildRuns`、`ChildRunIDs` | *（不可用）* |没有嵌入的子进程运行；使用 `Traces.ListRuns` 进行后代运行 |
  </Tab>

  <Tab title="cURL">
    JSON 响应字段使用`snake_case`，与下表匹配。|之前（旧根运行字段）|之后（新`ThreadTrace`字段）|笔记|
    | ---------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
    | `id` | *（不可用）* |旧版根运行`id`和`trace_id`是相同的；新 API 仅公开 `trace_id` |
    | `trace_id` | `trace_id` |省略 `selects` 时默认返回 |
    | `name` | `name` |除非包含在 `selects` 中，否则将被省略 || `start_time` | `start_time` |除非包含在 `selects` 中，否则将被省略 |
    | `end_time` | `end_time` |除非包含在 `selects` 中，否则将被省略 |
    | `run_type` | `op` |更名；编码为数字而不是字符串 |
    | `inputs` | `inputs_preview`，或 `inputs` 对于未截断的有效负载 |默认情况下预览被截断；选择`INPUTS`作为完整有效负载 |
    | `outputs` | `outputs_preview`，或 `outputs` 对于未截断的有效负载 |默认情况下预览被截断；选择`OUTPUTS`作为完整有效负载 || `error` | `error_preview`，或 `error` 获取完整消息 |默认情况下摘要被截断；选择 `ERROR` 查看完整的错误消息 |
    | `latency` | `latency` |不变 |
    | `total_tokens`、`prompt_tokens`、`completion_tokens` | `total_tokens`、`prompt_tokens`、`completion_tokens` |不变 |
    | `total_cost`、`prompt_cost`、`completion_cost` | `total_cost`、`prompt_cost`、`completion_cost` |不变 |
    | `prompt_token_details`、`completion_token_details` | `prompt_token_details`、`completion_token_details` |不变 |
    | `prompt_cost_details`、`completion_cost_details` | `prompt_cost_details`、`completion_cost_details` |不变 || `first_token_time` | `first_token_time` |除非包含在 `selects` 中，否则将被省略 |
    | *（不可用）* | `thread_id` |新：此跟踪所属的线程 UUID |
    | `child_runs`、`child_run_ids` | *（不可用）* |没有嵌入的子进程运行；使用 `traces.list_runs` 进行后代运行 |
  </Tab>
</Tabs>

### 示例

#### 列出线程中的每个跟踪（回合）

获取属于一个线程的所有痕迹（会话轮次）。

<Tabs>
  <Tab title="Python">
    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        thread_id = "<thread-id>"
        for run in client.read_thread(thread_id=thread_id, project_name="default"):
            print(run.id, run.start_time)
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            thread_id = "<thread-id>"
            async for trace in client.threads.list_traces(
                thread_id, project_id=str(project.id), selects=["START_TIME"]
            ):
                print(trace.trace_id, trace.start_time)


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        let threadId = "<thread-id>";
        for await (const run of client.readThread({ threadId, projectName: "default" })) {
          console.log(run.id, run.start_time);
        }
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        let threadId = "<thread-id>";
        for await (const trace of client.threads.listTraces(threadId, {
          project_id: project.id,
          selects: ["START_TIME"],
        })) {
          console.log(trace.trace_id, trace.start_time);
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}

        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        var threadId = "<thread-id>"

        val runs = client.runs().query(
            RunQueryParams.builder()
                .addSession(project.id())
                .isRoot(true)
                .filter("eq(thread_id, \"$threadId\")")
                .build()
        ).runs()
        for (run in runs) {
            println("${run.id()} ${run.startTime().get()}")
        }
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}

        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.sessions.SessionListParams
        import com.langchain.smith.models.threads.ThreadListTracesParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        var threadId = "<thread-id>"

        val traces = client.threads().listTraces(
            threadId,
            ThreadListTracesParams.builder()
                .projectId(project.id())
                .addSelect(ThreadListTracesParams.Select.START_TIME)
                .build()
        ).items()
        for (trace in traces) {
            println("${trace.traceId().get()} ${trace.startTime().get()}")
        }
        ```
      </Tab>
    </Tabs>
  </Tab><Tab title="Go">
    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID
        	threadID := "<thread-id>"

        	runs, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        		Session: langsmith.F([]string{projectID}),
        		IsRoot:  langsmith.F(true),
        		Filter:  langsmith.F(fmt.Sprintf(`eq(thread_id, "%s")`, threadID)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	for _, run := range runs.Runs {
        		fmt.Println(run.ID, run.StartTime)
        	}
        }
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID
        	threadID := "<thread-id>"

        	iter := client.Threads.ListTracesAutoPaging(ctx, threadID, langsmith.ThreadListTracesParams{
        		ProjectID: langsmith.F(projectID),
        		Selects:   langsmith.F([]langsmith.ThreadListTracesParamsSelect{langsmith.ThreadListTracesParamsSelectStartTime}),
        	})
        	for iter.Next() {
        		trace := iter.Current()
        		fmt.Println(trace.TraceID, trace.StartTime)
        	}
        	if err := iter.Err(); err != nil {
        		panic(err.Error())
        	}
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')
        THREAD_ID="<thread-id>"

        curl -s -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" --arg tid "$THREAD_ID" '{"session": [$pid], "is_root": true, "filter": ("eq(thread_id, \"" + $tid + "\")")}')" \
          | jq '.runs // []'
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')
        THREAD_ID="<thread-id>"

        curl -G "https://api.smith.langchain.com/api/v2/threads/$THREAD_ID/traces" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          --data-urlencode "project_id=$PROJECT_ID" \
          --data-urlencode "selects=START_TIME"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 选择特定跟踪的字段

仅请求您需要的字段而不是每个字段，以减少响应大小。

<Tabs>
  <Tab title="Python">
    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        thread_id = "<thread-id>"
        for run in client.read_thread(
            thread_id=thread_id,
            project_name="default",
            select=["id", "total_tokens", "total_cost"],
        ):
            print(run.id, run.total_tokens, run.total_cost)
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            thread_id = "<thread-id>"
            async for trace in client.threads.list_traces(
                thread_id,
                project_id=str(project.id),
                selects=["TRACE_ID", "TOTAL_TOKENS", "TOTAL_COST"],
            ):
                print(trace.trace_id, trace.total_tokens, trace.total_cost)


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        let threadId = "<thread-id>";
        for await (const run of client.readThread({
          threadId,
          projectName: "default",
          select: ["id", "total_tokens", "total_cost"],
        })) {
          console.log(run.id, run.total_tokens, run.total_cost);
        }
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });
        let threadId = "<thread-id>";
        for await (const trace of client.threads.listTraces(threadId, {
          project_id: project.id,
          selects: ["TRACE_ID", "TOTAL_TOKENS", "TOTAL_COST"],
        })) {
          console.log(trace.trace_id, trace.total_tokens, trace.total_cost);
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    <Note>之前的示例在这里省略了`total_cost`。在旧版 `RunSchema` 类型上选择它会触发当前 Java 绑定中的已知反序列化错误（它需要一个字符串，API 返回一个数字）。</Note>

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}

        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams
        import kotlin.jvm.optionals.getOrNull

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        var threadId = "<thread-id>"

        // Note: selecting total_cost here triggers a known deserialization bug in the
        // v1 Java binding (RunSchema.totalCost() expects a string, the API returns a
        // number) — omitted to keep this example runnable; see the migration notes.
        val runs = client.runs().query(
            RunQueryParams.builder()
                .addSession(project.id())
                .isRoot(true)
                .filter("eq(thread_id, \"$threadId\")")
                .addSelect(RunQueryParams.Select.ID)
                .addSelect(RunQueryParams.Select.TOTAL_TOKENS)
                .build()
        ).runs()
        for (run in runs) {
            println("${run.id()} ${run.totalTokens().getOrNull()}")
        }
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}

        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.sessions.SessionListParams
        import com.langchain.smith.models.threads.ThreadListTracesParams
        import kotlin.jvm.optionals.getOrNull

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        val project = client.sessions().list(
            SessionListParams.builder().name("default").limit(1L).build()
        ).items().first()

        var threadId = "<thread-id>"

        val traces = client.threads().listTraces(
            threadId,
            ThreadListTracesParams.builder()
                .projectId(project.id())
                .addSelect(ThreadListTracesParams.Select.TRACE_ID)
                .addSelect(ThreadListTracesParams.Select.TOTAL_TOKENS)
                .addSelect(ThreadListTracesParams.Select.TOTAL_COST)
                .build()
        ).items()
        for (trace in traces) {
            println("${trace.traceId().get()} ${trace.totalTokens().getOrNull()} ${trace.totalCost().getOrNull()}")
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID
        	threadID := "<thread-id>"

        	runs, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        		Session: langsmith.F([]string{projectID}),
        		IsRoot:  langsmith.F(true),
        		Filter:  langsmith.F(fmt.Sprintf(`eq(thread_id, "%s")`, threadID)),
        		Select: langsmith.F([]langsmith.RunQueryParamsSelect{
        			langsmith.RunQueryParamsSelectID,
        			langsmith.RunQueryParamsSelectTotalTokens,
        			langsmith.RunQueryParamsSelectTotalCost,
        		}),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	for _, run := range runs.Runs {
        		fmt.Println(run.ID, run.TotalTokens, run.TotalCost)
        	}
        }
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"fmt"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        func main() {
        	ctx := context.Background()
        	client := langsmith.NewClient()

        	sessions, err := client.Sessions.List(ctx, langsmith.SessionListParams{
        		Name:  langsmith.F("default"),
        		Limit: langsmith.F(int64(1)),
        	})
        	if err != nil {
        		panic(err.Error())
        	}
        	projectID := sessions.Items[0].ID
        	threadID := "<thread-id>"

        	iter := client.Threads.ListTracesAutoPaging(ctx, threadID, langsmith.ThreadListTracesParams{
        		ProjectID: langsmith.F(projectID),
        		Selects: langsmith.F([]langsmith.ThreadListTracesParamsSelect{
        			langsmith.ThreadListTracesParamsSelectTraceID,
        			langsmith.ThreadListTracesParamsSelectTotalTokens,
        			langsmith.ThreadListTracesParamsSelectTotalCost,
        		}),
        	})
        	for iter.Next() {
        		trace := iter.Current()
        		fmt.Println(trace.TraceID, trace.TotalTokens, trace.TotalCost)
        	}
        	if err := iter.Err(); err != nil {
        		panic(err.Error())
        	}
        }
        ```
      </Tab>
    </Tabs>
  </Tab><Tab title="cURL">
    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')
        THREAD_ID="<thread-id>"

        curl -s -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" --arg tid "$THREAD_ID" '{"session": [$pid], "is_root": true, "filter": ("eq(thread_id, \"" + $tid + "\")"), "select": ["id", "total_tokens", "total_cost"]}')" \
          | jq '.runs // []'
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
          -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')
        THREAD_ID="<thread-id>"

        curl -G "https://api.smith.langchain.com/api/v2/threads/$THREAD_ID/traces" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          --data-urlencode "project_id=$PROJECT_ID" \
          --data-urlencode "selects=TRACE_ID" \
          --data-urlencode "selects=TOTAL_TOKENS" \
          --data-urlencode "selects=TOTAL_COST"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

## 数据集实验运行：查询

查询数据集示例以及针对每个示例记录的实验运行。接受一个或多个`experiment_ids`，以便您可以并排查看多个实验的运行情况；结果作为游标分页页面返回。

### 主要变化

#### 方法名称

<Tabs>
  <Tab title="Python">
    |之前 |之后 |
    | --------------------------------- | ---------------------------------------------------- |
    | `client.get_experiment_results()` | `client.datasets.experiment_runs.query()` |

    <Note>
      `client.datasets.experiment_runs.query()` 现在是异步的。用 `await` 来调用它。
    </Note>

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/python/langsmith/_openapi_client/resources/datasets/experiment_runs/ExperimentRunsResource/query)。
  </Tab>

  <Tab title="TypeScript">
    |之前 |之后 |
    | ------------------------------------------------ | ---------------------------------------------------- |
    | *（没有遗留的公共`Client`方法）* | `client.datasets.experimentRuns.query()` |

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/javascript/langsmith/_openapi_client/resources/Datasets/ExperimentRuns/query)。
  </Tab><Tab title="Java">
    |之前 |之后|
    | ---------------------------------- | -------------------------------------------------------- |
    | `client.datasets().runs().query()` | `client.datasets().experimentRuns().query()` |

    完整参数列表请参见[reference](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/datasets/ExperimentRunService.html)。
  </Tab>

  <Tab title="Go">
    |之前 |之后 |
    | ------------------------------------------ | ---------------------------------------------------- |
    | `client.Datasets.Runs.Query()` | `client.Datasets.ExperimentRuns.Query()` |

    完整参数列表请参见[reference](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#DatasetExperimentRunService.Query)。
  </Tab>

  <Tab title="cURL">
    |之前 |之后 |
    | ---------------------------------------------------- | ---------------------------------------------------------------- |
    | `POST /api/v1/datasets/{dataset_id}/runs` | `POST /api/v2/datasets/{dataset_id}/experiment-runs` |

    有关完整参数和字段列表，请参阅[API doc](/langsmith/smith-api/datasets/fetch-experiment-runs-for-dataset-examples)。
  </Tab>
</Tabs>

#### 查询参数

<Tabs>
  <Tab title="Python">
    <Warning>
      `experiment_ids` 是必需的并替换 `session_ids`。值仍然是实验跟踪项目 UUID - 如果您只知道实验名称，请首先解析它：异步代码中的`client.read_project(project_name="my-experiment").id`或`await client.aread_project(project_name="my-experiment")`。
    </Warning>|之前 (`get_experiment_results`) |之后 (`datasets.experiment_runs.query`) |笔记|
    | --------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `project_id` | `experiment_ids` | `get_experiment_results` 接受1个项目/实验；新方法接受必需的非空列表 |
    | `limit` | *（已删除）* |使用 `page_size` 作为每个请求的批量大小 |
    | *（不可用）* | `page_size` |每个请求结果计数（默认 20，最大 100）|| *（内部处理）* | `cursor` |传递上一页的`next_cursor`来获取下一页 |
    | `preview` | `selects` |省略 `selects` 仅返回运行 ID；使用 `INPUTS_PREVIEW` 和 `OUTPUTS_PREVIEW` 进行预览，或使用 `INPUTS` 和 `OUTPUTS` 进行完整有效负载 |
    | *（未暴露）* | `sort` |使用`{by, order}`进行反馈分数排序|
    | `filters` | `filters` |不变；将实验 UUID 字符串映射到过滤表达式 |
    | `comparative_experiment_id` | `comparative_experiment_id` |不变 || *（未暴露）* | `example_ids` |可选示例 UUID 过滤器，最大 1000 |
  </Tab>

  <Tab title="TypeScript">
    <Warning>
      `experiment_ids` 是必需的并替换 `session_ids`。值仍然是实验跟踪项目 UUID - 如果您只知道实验名称，请先解析它：`(await client.readProject({ projectName: "my-experiment" })).id`。
    </Warning>

    |之前 |之后 (`datasets.experimentRuns.query`) |笔记|
    | ------------------------------------------------ | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | *（没有遗留的公共`Client`方法）* | `experiment_ids` |必填且非空 || *（没有遗留的公共`Client`方法）* | `page_size` |默认为 20，最大 100 |
    | *（没有遗留的公共`Client`方法）* | `cursor` |传递上一页的 `next_cursor` 而不是数字偏移量 |
    | *（没有遗留的公共`Client`方法）* | `selects` |省略 `selects` 仅返回运行 ID；使用 `INPUTS_PREVIEW` 和 `OUTPUTS_PREVIEW` 进行预览，或使用 `INPUTS` 和 `OUTPUTS` 进行完整有效负载 |
    | *（没有遗留的公共`Client`方法）* | `sort` |使用`{ by, order }`进行反馈分数排序 |
    | *（没有遗留的公共`Client`方法）* | `filters` |将实验 UUID 字符串映射到过滤表达式 || *（没有遗留的公共`Client`方法）* | `comparative_experiment_id` |范围成对注释反馈 |
    | *（没有遗留的公共`Client`方法）* | `example_ids` |可选示例 UUID 过滤器，最大 1000 |
  </Tab>

  <Tab title="Java">
    <Warning>
      需要 `experimentIds()` 并替换 `sessionIds()`。值仍然是实验跟踪项目 UUID - 如果您只知道实验名称，请先解析它：`client.sessions().list(SessionListParams.builder().name("my-experiment").build()).items().first().id()`。
    </Warning>|之前 (`RunQueryParams`) |之后 (`ExperimentRunQueryParams`) |笔记|
    | ------------------------ | | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
    | `sessionIds()` | `experimentIds()` |更名；必填且非空 |
    | `limit()` | *（已删除）* |使用 `pageSize()` 作为每个请求的批量大小 |
    | *（不可用）* | `pageSize()` |每个请求结果计数（默认 20，最大 100）|
    | `offset()` | `cursor()` |传递上一页的 `nextCursor()` 而不是数字偏移量 |
    | `preview()` | `selects()` |省略选择仅返回运行 ID；添加 `Select.INPUTS_PREVIEW` 和 `Select.OUTPUTS_PREVIEW` 进行预览 || `sortParams()` | `sort()` |形状从 `sortBy()` / `sortOrder()` 更改为 `by()` / `order()` |
    | `filters()` | `filters()` |不变 |
    | `comparativeExperimentId()` | `comparativeExperimentId()` |不变 |
    | `exampleIds()` | `exampleIds()` |不变，最多 1000 |
    | `format()` | *（已删除）* |新端点仅返回 JSON |
    | `includeAnnotatorDetail()` | *（已删除）* |没有新的 JSON 等效项 |
  </Tab><Tab title="Go">
    <Warning>
      需要 `ExperimentIDs` 并替换 `SessionIDs`。值仍然是实验跟踪项目 UUID - 如果您只知道实验名称，请先解析它：列出按 `Name` 过滤的会话，并获取第一个结果的 `ID`。
    </Warning>

    |之前 (`DatasetRunQueryParams`) |之后 (`DatasetExperimentRunQueryParams`) |笔记|
    | -------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
    | `SessionIDs` | `ExperimentIDs` |更名；必填且非空 |
    | `Limit` | *（已删除）* |使用 `PageSize` 作为每个请求的批量大小 |
    | *（不可用）* | `PageSize` |每个请求结果计数（默认 20，最大 100）|| `Offset` | `Cursor` |传递上一页的 `NextCursor` 而不是数字偏移量 |
    | `Preview` | `Selects` |省略选择仅返回运行 ID；使用 `InputsPreview` 和 `OutputsPreview` 选择预览常量 |
    | `SortParams` | `Sort` |形状从 `SortBy` / `SortOrder` 更改为 `By` / `Order` |
    | `Filters` | `Filters` |不变 |
    | `ComparativeExperimentID` | `ComparativeExperimentID` |不变 |
    | `ExampleIDs` | `ExampleIDs` |不变，最多 1000 || `Format` | *（已删除）* |新端点仅返回 JSON |
    | `IncludeAnnotatorDetail` | *（已删除）* |没有新的 JSON 等效项 |
  </Tab>

  <Tab title="cURL">
    <Warning>
      需要 `experiment_ids` 并替换 `session_ids`。值仍然是实验跟踪项目 UUID - 如果您只知道实验名称，请先解析它：`GET /api/v1/sessions?name=my-experiment` 并采用 `.[0].id`。
    </Warning>|之前（`POST /api/v1/datasets/{dataset_id}/runs`本体）|之后（`POST /api/v2/datasets/{dataset_id}/experiment-runs`身体）|笔记|
    | ------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `session_ids` | `experiment_ids` |更名；必填且非空 |
    | `limit` | *（已删除）* |使用 `page_size`​​ 作为每个请求的批量大小 || *（不可用）* | `page_size` |每个请求结果计数（默认 20，最大 100）|
    | `offset` | `cursor` |传递上一页的 `next_cursor` 而不是数字偏移量 |
    | `preview` | `selects` |省略 `selects` 仅返回运行 ID；使用 `INPUTS_PREVIEW` 和 `OUTPUTS_PREVIEW` 进行预览，或使用 `INPUTS` 和 `OUTPUTS` 进行完整有效负载 |
    | `sort_params` | `sort` |形状从`{sort_by, sort_order}`更改为`{by, order}` || `filters` | `filters` |不变；将实验 UUID 字符串映射到过滤表达式 |
    | `comparative_experiment_id` | `comparative_experiment_id` |不变 |
    | `example_ids` | `example_ids` |不变，最多 1000 |
    | `format=csv` | *（已删除）* |新端点仅返回 JSON || `include_annotator_detail` | *（已删除）* |没有新的 JSON 等效项 |
  </Tab>
</Tabs>

#### 响应字段

每个页面项目都是一个数据集示例，与为其生成的运行配对，而不是一个裸露的`Run`。它的 `runs` 字段保存与 [Querying runs](#response-fields) 返回的相同的 `Run` 对象；请参阅该部分了解每次运行字段。下表描述了该项目的其余部分：`runs` 旁边的示例字段。

<Tabs>
  <Tab title="Python">
    `get_experiment_results` 使用`examples_with_runs` 迭代器返回实验结果。 `datasets.experiment_runs.query` 返回分页页面对象（`page.items`、`page.next_cursor`）；每个项目有：|领域 |笔记|
    | ---------------------------- | -------------------------------------------------------------------- |
    | `id` |数据集示例 UUID |
    | `dataset_id` |父数据集 UUID |
    | `name` |示例名称（如果设置）|
    | `created_at` / `modified_at` |时间戳示例 |
    | `inputs` / `outputs` |输入和参考输出有效负载示例 |
    | `metadata` |元数据示例 |
    | `source_run_id` |运行创建示例的 UUID（如果有） |
    | `attachment_urls` |每个附件名称的预签名下载 URL |
    | `runs` |此示例的运行 - 请参阅 [Querying runs](#response-fields) |
  </Tab>

  <Tab title="TypeScript">
    旧数据集运行端点未在公共 TypeScript `Client` 上公开。 `datasets.experimentRuns.query` 返回分页页面（`page.getPaginatedItems()`、`page.next_cursor`）；每个项目有：|领域 |笔记|
    | ---------------------------- | -------------------------------------------------------------------- |
    | `id` |数据集示例 UUID |
    | `dataset_id` |父数据集 UUID |
    | `name` |示例名称（如果设置）|
    | `created_at` / `modified_at` |时间戳示例 |
    | `inputs` / `outputs` |输入和参考输出有效负载示例 |
    | `metadata` |元数据示例 |
    | `source_run_id` |运行创建示例的 UUID（如果有） |
    | `attachment_urls` |每个附件名称的预签名下载 URL |
    | `runs` |此示例的运行 - 请参阅 [Querying runs](#response-fields) |
  </Tab>

  <Tab title="Java">
    `runs().query` 返回一个可选列表。 `experimentRuns().query` 返回页面对象（`items()`，`nextCursor()`）；每个项目有：|领域|笔记|
    | ------------------------------------------ | -------------------------------------------------------------------- |
    | `id()` |数据集示例 UUID |
    | `datasetId()` |父数据集 UUID |
    | `name()` |示例名称（如果设置）|
    | `createdAt()` / `modifiedAt()` |时间戳示例 |
    | `inputs()` / `outputs()` |输入和参考输出有效负载示例 |
    | `metadata()` |元数据示例 |
    | `sourceRunId()` |运行创建示例的 UUID（如果有） |
    | `attachmentUrls()` |每个附件名称的预签名下载 URL |
    | `runs()` |此示例的运行 - 请参阅 [Querying runs](#response-fields) |
  </Tab>

  <Tab title="Go">
    `Datasets.Runs.Query` 返回一个切片指针。 `Datasets.ExperimentRuns.Query` 返回`ItemsCursorPostPagination` (`Items`, `NextCursor`)；每个项目有：|领域|笔记|
    | -------------------------- | -------------------------------------------------------------------- |
    | `ID` |数据集示例 UUID |
    | `DatasetID` |父数据集 UUID |
    | `Name` |示例名称（如果设置）|
    | `CreatedAt` / `ModifiedAt` |时间戳示例 |
    | `Inputs` / `Outputs` |输入和参考输出有效负载示例 |
    | `Metadata` |元数据示例 |
    | `SourceRunID` |运行创建示例的 UUID（如果有） |
    | `AttachmentURLs` |每个附件名称的预签名下载 URL |
    | `Runs` |此示例的运行 - 请参阅 [Querying runs](#response-fields) |
  </Tab>

  <Tab title="cURL">
    `POST /api/v1/datasets/{dataset_id}/runs` 返回一个 JSON 数组。 `POST /api/v2/datasets/{dataset_id}/experiment-runs` 返回`{ "items": [...], "next_cursor": "..." }`；每个项目有：|领域 |笔记|
    | ---------------------------- | -------------------------------------------------------------------- |
    | `id` |数据集示例 UUID |
    | `dataset_id` |父数据集 UUID |
    | `name` |示例名称（如果设置）|
    | `created_at` / `modified_at` |时间戳示例 |
    | `inputs` / `outputs` |输入和参考输出有效负载示例 |
    | `metadata` |元数据示例 |
    | `source_run_id` |运行创建示例的 UUID（如果有） |
    | `attachment_urls` |每个附件名称的预签名下载 URL |
    | `runs` |此示例的运行 - 请参阅 [Querying runs](#response-fields) |
  </Tab>
</Tabs>

### 示例

#### 查询实验运行并请求预览字段<Tabs>
  <Tab title="Python">
    `preview=True` 自动返回截断的输入/输出。在新 API 中，明确请求：对于相同的截断形状，在 `selects` 中传递 `INPUTS_PREVIEW` 和 `OUTPUTS_PREVIEW`，对于未截断的值，传递 `INPUTS`/`OUTPUTS`。省略 `selects` 仅返回 `id`。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        experiment_id = client.read_project(project_name=experiment_name).id
        results = client.get_experiment_results(
            project_id=experiment_id,
            limit=20,
            preview=True,
        )
        examples_with_runs = list(results["examples_with_runs"])
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client
        import asyncio


        async def main():
            client = Client()
            experiment_id = client.read_project(project_name=experiment_name).id
            page = await client.datasets.experiment_runs.query(
                str(dataset_id),
                experiment_ids=[str(experiment_id)],
                page_size=20,
                selects=["ID", "NAME", "STATUS", "INPUTS_PREVIEW", "OUTPUTS_PREVIEW"],
            )
            return page.items


        examples_with_runs = asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    新的 TypeScript SDK 方法公开了实验运行查询端点。旧版直接端点请求形状显示在 cURL 选项卡中。对于截断的输入/输出，在 `selects` 中传递 `INPUTS_PREVIEW` 和 `OUTPUTS_PREVIEW`，对于未截断的值，传递 `INPUTS`/`OUTPUTS`。省略 `selects` 仅返回 `id`。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        // The legacy dataset runs endpoint was not exposed on the public TypeScript Client.
        // Use the cURL example for the old request body shape.
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const experimentId = (await client.readProject({ projectName: experimentName })).id;
        const page = await client.datasets.experimentRuns.query(datasetId, {
          experiment_ids: [experimentId],
          page_size: 20,
          selects: ["ID", "NAME", "STATUS", "INPUTS_PREVIEW", "OUTPUTS_PREVIEW"],
        });
        const examplesWithRuns = page.getPaginatedItems();
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    `preview(true)` 自动返回截断的输入/输出。在新 API 中，明确请求：为相同的截断形状添加 `Select.INPUTS_PREVIEW` 和 `Select.OUTPUTS_PREVIEW`，或为未截断的值添加 `Select.INPUTS`/`Select.OUTPUTS`。省略选择仅返回`id`。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.datasets.runs.RunQueryParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()
        val examplesWithRuns = client.datasets().runs().query(
            datasetId,
            RunQueryParams.builder()
                .addSessionId(experimentId)
                .limit(20L)
                .preview(true)
                .build()
        )
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.datasets.experimentruns.ExperimentRunQueryParams
        import com.langchain.smith.models.runs.RunSelectField

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()
        val page = client.datasets().experimentRuns().query(
            datasetId,
            ExperimentRunQueryParams.builder()
                .addExperimentId(experimentId)
                .pageSize(20L)
                .addSelect(RunSelectField.ID)
                .addSelect(RunSelectField.NAME)
                .addSelect(RunSelectField.STATUS)
                .addSelect(RunSelectField.INPUTS_PREVIEW)
                .addSelect(RunSelectField.OUTPUTS_PREVIEW)
                .build()
        )
        val examplesWithRuns = page.items()
        ```
      </Tab>
    </Tabs>
  </Tab><Tab title="Go">
    `Preview: true` 自动返回截断的输入/输出。在新 API 中，明确请求：为相同的截断形状添加 `InputsPreview` 和 `OutputsPreview` 选择常量，或为未截断的值添加 `Inputs`/`Outputs`。省略选择仅返回`ID`。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()
        examplesWithRuns, err := client.Datasets.Runs.Query(ctx, datasetID, langsmith.DatasetRunQueryParams{
        	SessionIDs: langsmith.F([]string{experimentID}),
        	Limit:      langsmith.F(int64(20)),
        	Preview:    langsmith.F(true),
        })
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()
        page, err := client.Datasets.ExperimentRuns.Query(ctx, datasetID, langsmith.DatasetExperimentRunQueryParams{
        	ExperimentIDs: langsmith.F([]string{experimentID}),
        	PageSize:      langsmith.F(int64(20)),
        	Selects: langsmith.F([]langsmith.RunSelectField{
        		langsmith.RunSelectFieldID,
        		langsmith.RunSelectFieldName,
        		langsmith.RunSelectFieldStatus,
        		langsmith.RunSelectFieldInputsPreview,
        		langsmith.RunSelectFieldOutputsPreview,
        	}),
        })
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    `preview: true` 自动返回截断的输入/输出。在新 API 中，明确请求：对于相同的截断形状，在 `selects` 中传递 `INPUTS_PREVIEW` 和 `OUTPUTS_PREVIEW`，或者对于未截断的值，传递 `INPUTS`/`OUTPUTS`。省略 `selects` 仅返回 `id`。

    <Tabs>
      <Tab title="Before">
        ```bash Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        curl -X POST "https://api.smith.langchain.com/api/v1/datasets/$DATASET_ID/runs" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg eid "$EXPERIMENT_ID" '{
            "session_ids": [$eid],
            "limit": 20,
            "preview": true
          }')"
        ```
      </Tab>

      <Tab title="After">
        ```bash After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        curl -X POST "https://api.smith.langchain.com/api/v2/datasets/$DATASET_ID/experiment-runs" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg eid "$EXPERIMENT_ID" '{
            "experiment_ids": [$eid],
            "page_size": 20,
            "selects": ["ID", "NAME", "STATUS", "INPUTS_PREVIEW", "OUTPUTS_PREVIEW"]
          }')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 翻页结果

下面的两个示例都会跨尽可能多的页面获取最多 100 个结果，然后停止，因此这两个操作是可比较的，而不是“一页”与“所有内容”。根据您自己的用例调整 `100`/`page_size` 值。<Tabs>
  <Tab title="Python">
    `get_experiment_results` 内部分页，并在 `limit` 返回总结果后停止。 `datasets.experiment_runs.query`没有总计数`limit`；一旦足够了，就用 `async for` 和 `break` 迭代返回的页面。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        experiment_id = client.read_project(project_name=experiment_name).id
        # get_experiment_results paginated internally; increase `limit` to fetch
        # more results in a single call. There is no cursor to pass in manually.
        results = client.get_experiment_results(
            project_id=experiment_id,
            limit=100,
        )
        examples_with_runs = list(results["examples_with_runs"])
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client
        import asyncio


        async def main():
            client = Client()
            experiment_id = client.read_project(project_name=experiment_name).id
            page = await client.datasets.experiment_runs.query(
                str(dataset_id),
                experiment_ids=[str(experiment_id)],
                page_size=1,
            )
            runs = []
            async for run in page:
                runs.append(run)
                if len(runs) >= 100:
                    break
            return runs


        examples_with_runs = asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    旧数据集运行端点未在公共 TypeScript `Client` 上公开。 `client.datasets.experimentRuns.query(...)` 返回一个异步迭代 - 一旦你有足够的，就使用 `for await...of` （不需要额外的 `await`）和 `break`。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        // The legacy dataset runs endpoint was not exposed on the public TypeScript Client.
        // Use the cURL example for the old request body shape.
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const experimentId = (await client.readProject({ projectName: experimentName })).id;
        const runs: unknown[] = [];
        for await (const run of client.datasets.experimentRuns.query(datasetId, {
          experiment_ids: [experimentId],
          page_size: 1,
        })) {
          runs.push(run);
          if (runs.length >= 100) break;
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    旧端点每次调用都会返回一页，没有自动寻呼机 - 手动循环，递增 `offset`，一旦足够就停止。 `.experimentRuns().query(...).autoPager()` 为您行走页面——一旦您跑了足够多的路，就可以跳出循环。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.datasets.runs.RunQueryParams
        import com.langchain.smith.models.datasets.runs.ExampleWithRunsCh

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()
        val examplesWithRuns = mutableListOf<ExampleWithRunsCh>()
        var offset = 0L
        val limit = 20L
        while (true) {
            val page = client.datasets().runs().query(
                datasetId,
                RunQueryParams.builder()
                    .addSessionId(experimentId)
                    .limit(limit)
                    .offset(offset)
                    .build()
            ).orElse(emptyList())
            examplesWithRuns.addAll(page)
            if (examplesWithRuns.size >= 100 || page.size.toLong() < limit) break
            offset += limit
        }
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.datasets.experimentruns.ExperimentRunQueryParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()
        val page = client.datasets().experimentRuns().query(
            datasetId,
            ExperimentRunQueryParams.builder()
                .addExperimentId(experimentId)
                .pageSize(1L)
                .build()
        )
        var count = 0
        for (run in page.autoPager()) {
            count++
            if (count >= 100) break
        }
        ```
      </Tab>
    </Tabs>
  </Tab><Tab title="Go">
    旧端点每次调用都会返回一页，没有自动寻呼机 - 手动循环，递增 `Offset`，一旦足够就停止。在新端点上，通过对来自先前响应的 `NextCursor` 的请求设置 `Cursor` 来手动分页，并在足够时停止；此处避免使用 `QueryAutoPaging` — 它将游标作为查询参数发送，该 POST 端点不会读取该游标，因此它会永远默默地重新获取第一页。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()
        var examplesWithRuns []langsmith.ExampleWithRunsCh
        offset := int64(0)
        limit := int64(20)
        for {
        	page, err := client.Datasets.Runs.Query(ctx, datasetID, langsmith.DatasetRunQueryParams{
        		SessionIDs: langsmith.F([]string{experimentID}),
        		Limit:      langsmith.F(limit),
        		Offset:     langsmith.F(offset),
        	})
        	examplesWithRuns = append(examplesWithRuns, *page...)
        	if len(examplesWithRuns) >= 100 || int64(len(*page)) < limit {
        		break
        	}
        	offset += limit
        }
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()
        params := langsmith.DatasetExperimentRunQueryParams{
        	ExperimentIDs: langsmith.F([]string{experimentID}),
        	PageSize:      langsmith.F(int64(1)),
        }
        var examplesWithRuns []langsmith.DatasetExperimentRunQueryResponse
        for {
        	page, err := client.Datasets.ExperimentRuns.Query(ctx, datasetID, params)
        	examplesWithRuns = append(examplesWithRuns, page.Items...)
        	if page.NextCursor == "" || len(examplesWithRuns) >= 100 {
        		break
        	}
        	params.Cursor = langsmith.F(page.NextCursor)
        }
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    原始 HTTP 没有自动分页助手：将先前响应的 `next_cursor` 作为 `cursor` 传回以获取下一页。

    <Tabs>
      <Tab title="Before">
        ```bash Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        curl -X POST "https://api.smith.langchain.com/api/v1/datasets/$DATASET_ID/runs" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg eid "$EXPERIMENT_ID" '{
            "session_ids": [$eid],
            "limit": 20,
            "offset": 20
          }')"
        ```
      </Tab>

      <Tab title="After">
        ```bash After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        curl -X POST "https://api.smith.langchain.com/api/v2/datasets/$DATASET_ID/experiment-runs" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg eid "$EXPERIMENT_ID" --arg cursor "$NEXT_CURSOR" '{
            "experiment_ids": [$eid],
            "page_size": 20,
            "cursor": $cursor
          }')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 按反馈分数排序

按反馈分数对数据集示例进行排序，仅在查询单个实验时支持。在 Go 和 Java 中，这取代了旧版 `sort_params.sort_by`/`sort_params.sort_order`（现在为 `sort.by`/`sort.order`）； Python 和 TypeScript 在新 API 中首次获得排序功能。

<Tabs>
  <Tab title="Python">
    `get_experiment_results` 不支持按反馈分数排序。<Tabs>
      <Tab title="Before">
        ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        # get_experiment_results did not support sorting results by feedback score.
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client
        import asyncio


        async def main():
            client = Client()
            experiment_id = client.read_project(project_name=experiment_name).id
            page = await client.datasets.experiment_runs.query(
                str(dataset_id),
                experiment_ids=[str(experiment_id)],
                sort={"by": "feedback.correctness", "order": "ASC"},
            )
            return page.items


        examples_with_runs = asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    旧数据集运行端点未在公共 TypeScript `Client` 上公开，因此在新 API 之前无法按反馈分数排序。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        // The legacy dataset runs endpoint was not exposed on the public TypeScript Client.
        // Use the cURL example for the old request body shape.
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const experimentId = (await client.readProject({ projectName: experimentName })).id;
        const page = await client.datasets.experimentRuns.query(datasetId, {
          experiment_ids: [experimentId],
          sort: { by: "feedback.correctness", order: "ASC" },
        });
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    `sortParams()` 替换为 `sort()`，`sortBy()`/`sortOrder()` 重命名为 `by()`/`order()`。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.datasets.runs.RunQueryParams
        import com.langchain.smith.models.datasets.runs.SortParamsForRunsComparisonView

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()
        val examplesWithRuns = client.datasets().runs().query(
            datasetId,
            RunQueryParams.builder()
                .addSessionId(experimentId)
                .sortParams(
                    SortParamsForRunsComparisonView.builder()
                        .sortBy("correctness")
                        .sortOrder(SortParamsForRunsComparisonView.SortOrder.ASC)
                        .build()
                )
                .build()
        )
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.datasets.experimentruns.ExperimentRunQueryParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()
        val page = client.datasets().experimentRuns().query(
            datasetId,
            ExperimentRunQueryParams.builder()
                .addExperimentId(experimentId)
                .sort(
                    ExperimentRunQueryParams.Sort.builder()
                        .by("feedback.correctness")
                        .order("ASC")
                        .build()
                )
                .build()
        )
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    `SortParams` 替换为 `Sort`，`SortBy`/`SortOrder` 重命名为 `By`/`Order`。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()
        examplesWithRuns, err := client.Datasets.Runs.Query(ctx, datasetID, langsmith.DatasetRunQueryParams{
        	SessionIDs: langsmith.F([]string{experimentID}),
        	SortParams: langsmith.F(langsmith.SortParamsForRunsComparisonView{
        		SortBy:    langsmith.F("correctness"),
        		SortOrder: langsmith.F(langsmith.SortParamsForRunsComparisonViewSortOrderAsc),
        	}),
        })
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()
        page, err := client.Datasets.ExperimentRuns.Query(ctx, datasetID, langsmith.DatasetExperimentRunQueryParams{
        	ExperimentIDs: langsmith.F([]string{experimentID}),
        	Sort: langsmith.F(langsmith.DatasetExperimentRunQueryParamsSort{
        		By:    langsmith.F("feedback.correctness"),
        		Order: langsmith.F("ASC"),
        	}),
        })
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    <Tabs>
      <Tab title="Before">
        ```bash Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        curl -X POST "https://api.smith.langchain.com/api/v1/datasets/$DATASET_ID/runs" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg eid "$EXPERIMENT_ID" '{
            "session_ids": [$eid],
            "sort_params": {
              "sort_by": "correctness",
              "sort_order": "ASC"
            }
          }')"
        ```
      </Tab>

      <Tab title="After">
        ```bash After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        curl -X POST "https://api.smith.langchain.com/api/v2/datasets/$DATASET_ID/experiment-runs" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg eid "$EXPERIMENT_ID" '{
            "experiment_ids": [$eid],
            "sort": {
              "by": "feedback.correctness",
              "order": "ASC"
            }
          }')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

## 注释队列：添加运行将运行添加到注释队列。 SmithDB 支持的路径采用每个运行的完整查找键（其 ID 加上 `session_id`（项目 UUID）和 `start_time` 分区键），因此可以直接定位运行而不是扫描。

<Note>
  此方法保留在现有客户端上，而不是新的 `runs` v2 客户端上，因此上面的 [Exceptions](/langsmith/smithdb-sdk-migration#exceptions) 表不适用 - 错误处理未更改。
</Note>

### 主要变化

#### 方法名称

<Tabs>
  <Tab title="Python">
    没有变化—`client.add_runs_to_annotation_queue()`。 SmithDB 路径由您传递的参数选择（请参阅下面的输入）。

    完整参数列表请参见[reference](https://reference.langchain.com/python/langsmith/client/Client/add_runs_to_annotation_queue)。
  </Tab>

  <Tab title="TypeScript">
    没有变化—`client.addRunsToAnnotationQueue()`。 SmithDB 路径由您传递的参数选择（请参阅下面的输入）。

    完整参数列表请参见[reference](https://reference.langchain.com/javascript/langsmith/client/Client/addRunsToAnnotationQueue)。
  </Tab>

  <Tab title="Java">
    |之前 |之后 |
    | ------------------------------------------- | ------------------------------------------------ |
    | `client.annotationQueues().runs().create()` | `client.annotationQueues().runs().createByKey()` |

    完整参数列表请参见[reference](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/annotationqueues/RunService.html)。
  </Tab><Tab title="Go">
    |之前 |之后 |
    | ------------------------------------------------ | ---------------------------------------------------- |
    | `client.AnnotationQueues.Runs.New()` | `client.AnnotationQueues.Runs.NewByKey()` |

    完整参数列表请参见[reference](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#AnnotationQueueRunService.NewByKey)。
  </Tab>

  <Tab title="cURL">
    |之前 |之后 |
    | ------------------------------------------------ | ------------------------------------------------------- |
    | `POST /api/v1/annotation-queues/{queue_id}/runs` | `POST /api/v1/annotation-queues/{queue_id}/runs/by-key` |

    完整参数列表请参见[API doc](/langsmith/smith-api/annotation-queues/add-runs-to-annotation-queue-by-key)。
  </Tab>
</Tabs>

#### 输入

<Tabs>
  <Tab title="Python">
    <Warning>
      SmithDB 路径除了 `run_id` 之外，还需要每次运行的 `session_id`（项目 UUID）和 `start_time`。这些已经存在于您获取的运行对象上（例如从`client.list_runs()`）。
    </Warning>|之前 (`run_ids`) |之后（`runs`）|笔记|
    | ---------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
    | `run_ids: list[UUID \| str]` | *（已弃用）* |遗留路径。仍然有效并命中`/runs`，解决每个运行服务器端的问题。将在未来版本中删除 |
    | *（不可用）* | `runs: Sequence[RunKey]` | **新首选。** 每个 `RunKey` 都是 `TypedDict`，其中包含 `run_id`、`session_id` 和 `start_time` |

    准确提供`runs`或`run_ids`之一；通过两项都会引发 `LangSmithUserError`。
  </Tab>

  <Tab title="TypeScript">
    <Warning>
      SmithDB 路径除了 `runId` 之外，还需要每次运行的 `sessionId`（项目 UUID）和 `startTime`。这些已经存在于您获取的运行对象上（例如从`client.listRuns()`）。
    </Warning>|之前 (`string[]`) |之后 (`RunKey[]`) |笔记|
    | ------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
    | `runs: string[]` | *（已弃用）* |旧路径（运行 ID 字符串数组）。仍然有效并点击`/runs`。将在未来版本中删除 |
    | *（不可用）* | `runs: RunKey[]` | **新的优选。** 每个`RunKey`都是`{ runId, sessionId, startTime }`； `startTime` 接受 `Date`、纪元 ms 或 ISO 字符串 |

    两个形状的第二个参数的位置相同；当您传递`RunKey[]`时，SDK会选择SmithDB路径。
  </Tab><Tab title="Java">
    |之前 (`RunCreateParams`) |之后 (`RunCreateByKeyParams`) |笔记|
    | ------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------- |
    | `.bodyOfRunsUuidArray(List<String>)` | *（已删除）* |旧体；仅运行 ID |
    | *（不可用）* | `.addBody(RunCreateByKeyParams.Body)` |每个 `Body` 都有 `runId`、`sessionId` 和 `startTime` |
    | `.queueId(String)` | `.queueId(String)` |不变 |
    | `.extendTraceRetention(Boolean)` | `.extendTraceRetention(Boolean)` |未更改的可选查询参数 |
  </Tab><Tab title="Go">
    |之前 (`AnnotationQueueRunNewParams`) |之后 (`AnnotationQueueRunNewByKeyParams`) |笔记|
    | ------------------------------------------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------- |
    | `Body: AnnotationQueueRunNewParamsBodyRunsUuidArray` (`[]string`) | *（已删除）* |旧体；仅运行 ID |
    | *（不可用）* | `Body: []AnnotationQueueRunNewByKeyParamsBody` |每个都有 `RunID`、`SessionID` 和 `StartTime` |
    | *（不可用）* | `ExtendTraceRetention` |可选查询参数 |
  </Tab>

  <Tab title="cURL">
    <Warning>
      `/runs/by-key` 请求正文是一个对象数组，而不是 ID 字符串数组。每个对象都需要 `run_id`、`session_id`（项目 UUID）和 `start_time` (RFC3339)。
    </Warning>|之前（`POST /runs`本体）|之后（`POST /runs/by-key`身体）|笔记|
    | --------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
    | `["<run-id>", ...]` | `[{"run_id", "session_id", "start_time"}]` | `session_id`是项目UUID； `start_time` 是 RFC3339 |
    | `?extend_trace_retention`（查询）| `?extend_trace_retention`（查询）|未更改的可选查询参数 |
  </Tab>
</Tabs>

#### 回应

<Tabs>
  <Tab title="Python">
    没有变化。 `run_ids=`和`runs=`都返回`None`。
  </Tab>

  <Tab title="TypeScript">
    没有变化。两种形状都解析为 `void`。
  </Tab>

  <Tab title="Java">
    `createByKey()` 返回 `List<RunCreateByKeyResponse>` — 返回相同的形状 `create()`，其中包括 `id()`、`queueId()`、`runId()`、`addedAt()` 和 `lastReviewedTime()`。
  </Tab>

  <Tab title="Go">
    `NewByKey()` 返回 `*[]AnnotationQueueRunNewByKeyResponse` — 返回相同的形状 `New()`，其中包括 `ID`、`QueueID`、`RunID`、`AddedAt` 和 `LastReviewedTime`。
  </Tab>

  <Tab title="cURL">
    没有变化。 `POST /runs/by-key` 返回创建的队列运行记录数组（`id`、`queue_id`、`run_id`、`added_at`、`last_reviewed_time`），与`POST /runs`形状相同。
  </Tab>
</Tabs>

### 示例

#### 将运行添加到队列<Tabs>
  <Tab title="Python">
    `run_ids=` 采用运行 ID 的简单列表。 `runs=` 获取每个运行的完整查找键 — 从您已有的运行对象中读取 `run_id`、`session_id` 和 `start_time`。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        queue_id = "<queue-id>"
        runs = list(client.list_runs(project_name="default", limit=5))
        client.add_runs_to_annotation_queue(queue_id, run_ids=[run.id for run in runs])
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        queue_id = "<queue-id>"
        runs = list(client.list_runs(project_name="default", limit=5))
        client.add_runs_to_annotation_queue(
            queue_id,
            runs=[
                {
                    "run_id": run.id,
                    "session_id": run.session_id,
                    "start_time": run.start_time,
                }
                for run in runs
            ],
        )
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    传递旧路径的运行 ID 字符串数组，或从已有的运行对象构建的 `RunKey` 对象数组（`runId`、`sessionId`、`startTime`）。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        let queueId = "<queue-id>";
        const runs = [];
        for await (const run of client.listRuns({ projectName: "default", limit: 5 })) {
          runs.push(run);
        }
        await client.addRunsToAnnotationQueue(
          queueId,
          runs.map((run) => run.id),
        );
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        let queueId = "<queue-id>";
        const runs = [];
        for await (const run of client.listRuns({ projectName: "default", limit: 5 })) {
          runs.push(run);
        }
        await client.addRunsToAnnotationQueue(
          queueId,
          runs.map((run) => ({
            runId: run.id,
            sessionId: run.session_id!,
            startTime: run.start_time!,
          })),
        );
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    `create()` 通过 `bodyOfRunsUuidArray` 获取运行 ID。 `createByKey()` 每次运行需要 `Body` 以及 `runId`、`sessionId` 和 `startTime`。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.annotationqueues.AnnotationQueueAnnotationQueuesParams
        import com.langchain.smith.models.annotationqueues.runs.RunCreateParams
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        var queueId = "<queue-id>"
        var projectId = "<project-id>"
        val runs = client.runs().query(
            RunQueryParams.builder().session(listOf(projectId)).limit(5L).build()
        ).items()

        client.annotationQueues().runs().create(
            RunCreateParams.builder()
                .queueId(queueId)
                .bodyOfRunsUuidArray(runs.map { it.id() })
                .build()
        )
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.annotationqueues.AnnotationQueueAnnotationQueuesParams
        import com.langchain.smith.models.annotationqueues.runs.RunCreateByKeyParams
        import com.langchain.smith.models.runs.RunQueryParams
        import com.langchain.smith.models.sessions.SessionListParams

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        var queueId = "<queue-id>"
        var projectId = "<project-id>"
        val runs = client.runs().query(
            RunQueryParams.builder().session(listOf(projectId)).limit(5L).build()
        ).items()

        val params = RunCreateByKeyParams.builder().queueId(queueId)
        for (run in runs) {
            params.addBody(
                RunCreateByKeyParams.Body.builder()
                    .runId(run.id())
                    .sessionId(run.sessionId())
                    .startTime(run.startTime().get())
                    .build()
            )
        }
        client.annotationQueues().runs().createByKey(params.build())
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    `New()` 通过 `AnnotationQueueRunNewParamsBodyRunsUuidArray` 获取运行 ID。 `NewByKey()` 每次运行使用 `RunID`、`SessionID` 和 `StartTime`。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        queueID := "<queue-id>"
        projectID := "<project-id>"
        found, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        	Session: langsmith.F([]string{projectID}),
        	Limit:   langsmith.F(int64(5)),
        })
        runIDs := make([]string, len(found.Runs))
        for i, run := range found.Runs {
        	runIDs[i] = run.ID
        }
        _, err = client.AnnotationQueues.Runs.New(ctx, queueID, langsmith.AnnotationQueueRunNewParams{
        	Body: langsmith.AnnotationQueueRunNewParamsBodyRunsUuidArray(runIDs),
        })
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"
        	"time"

        	"github.com/langchain-ai/langsmith-go"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        queueID := "<queue-id>"
        projectID := "<project-id>"
        found, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
        	Session: langsmith.F([]string{projectID}),
        	Limit:   langsmith.F(int64(5)),
        })
        body := make([]langsmith.AnnotationQueueRunNewByKeyParamsBody, len(found.Runs))
        for i, run := range found.Runs {
        	body[i] = langsmith.AnnotationQueueRunNewByKeyParamsBody{
        		RunID:     langsmith.F(run.ID),
        		SessionID: langsmith.F(run.SessionID),
        		StartTime: langsmith.F(run.StartTime),
        	}
        }
        _, err = client.AnnotationQueues.Runs.NewByKey(ctx, queueID, langsmith.AnnotationQueueRunNewByKeyParams{
        	Body: body,
        })
        ```
      </Tab>
    </Tabs>
  </Tab><Tab title="cURL">
    `POST /runs` 采用运行 ID 字符串数组。 `POST /runs/by-key` 采用一个对象数组，每个对象都有 `run_id`、`session_id` 和 `start_time`。

    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        QUEUE_ID="<queue-id>"
        RUN_ID="<run-id>"

        curl -X POST "https://api.smith.langchain.com/api/v1/annotation-queues/$QUEUE_ID/runs" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "[\"$RUN_ID\"]"
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        QUEUE_ID="<queue-id>"
        RUN_ID="<run-id>"
        PROJECT_ID="<project-id>"
        START_TIME="2026-06-01T12:00:00Z"

        curl -X POST "https://api.smith.langchain.com/api/v1/annotation-queues/$QUEUE_ID/runs/by-key" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "[{\"run_id\": \"$RUN_ID\", \"session_id\": \"$PROJECT_ID\", \"start_time\": \"$START_TIME\"}]"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

## 分享和阅读公开跑步

共享跟踪、删除其公共访问权限或读取公开共享跟踪中的运行。 v2 方法使用显式 SmithDB 坐标并返回选择驱动的运行对象。

公共读取方法不需要 LangSmith API 密钥。将共享令牌视为秘密，因为拥有该令牌的任何人都可以读取共享跟踪。

### 主要变化

#### 方法名称

<Tabs>
  <Tab title="Python">
    |之前 |之后|
    | ------------------------------------------- | -------------------------------------------------------- |
    | `client.share_run()` | `client.runs.share.create()` |
    | `client.unshare_run()` | `client.runs.share.delete()` |
    | `client.list_shared_runs()` | `client.public.runs.query()` |
    | `client.read_shared_run()` | `client.public.runs.retrieve()` |
    | `client.read_run_shared_link()` | `client.runs.retrieve(selects=["SHARE_URL"])` |

    <Note>
      v2 资源方法是异步的。请使用 `await` 致电他们。
    </Note>
  </Tab><Tab title="TypeScript">
    |之前 |之后|
    | ------------------------------------------------------ | -------------------------------------------------- |
    | `client.shareRun()` | `client.runs.share.create()` |
    | `client.unshareRun()` | `client.runs.share.delete()` |
    | `client.listSharedRuns()` | `client.public.runs.query()` |
    | `client.listSharedRuns({ runIds: [...] })` | `client.public.runs.retrieve()` |
    | `client.readRunSharedLink()` | `client.runs.retrieve({ selects: ["SHARE_URL"] })` |

    TypeScript 没有直接相当于 Python 的 `read_shared_run`。过滤后的`listSharedRuns`调用迁移到点读取方法。
  </Tab>

  <Tab title="Java">
    Java SDK 没有传统的方便迁移方法。使用 [⟦T3742⟧](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/runs/ShareService.html) 和公共 [⟦T3743⟧](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/public_/RunService.html) 进行 v2 访问。 Kotlin 使用 Java SDK；没有单独的 Kotlin 参考站点。
  </Tab>

  <Tab title="Go">
    Go SDK 没有传统的便捷迁移方法。使用 [⟦T3744⟧](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#RunShareService) 和 [⟦T3745⟧](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#PublicRunService) 进行 v2 访问。
  </Tab><Tab title="cURL">
    |运营|之前 |之后 |
    | -------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
    |分享 | `PUT /api/v1/runs/{run_id}/share` | `POST /api/v2/runs/{run_id}/share` |
    |取消分享 | `DELETE /api/v1/runs/{run_id}/share` | `DELETE /api/v2/runs/{trace_id}/share` |
    |查询公开运行 | `POST /api/v1/public/{share_token}/runs/query` | `POST /api/v2/public/{share_token}/runs/query` |
    |检索公开运行 | `GET /api/v1/public/{share_token}/run/{run_id}` | `GET /api/v2/public/{share_token}/run/{run_id}` |
    |阅读分享状态 | `GET /api/v1/runs/{run_id}/share` | `GET /api/v2/runs/{run_id}?selects=SHARE_URL` |

    没有运行 ID 的旧版 `GET /api/v1/public/{share_token}/run` 端点没有直接的 v2 等效项。
  </Tab>
</Tabs>

#### 共享和取消共享参数

<Tabs>
  <Tab title="Python">
    * `runs.share.create` 将运行 ID 作为其位置参数。传递 `session_id`（跟踪项目 UUID）和 `trace_id`（根跟踪 UUID）。
    * `runs.share.delete` 采用根跟踪 ID，而不是任意子运行 ID。传递跟踪项目 UUID 作为 `session_id`。
    * `share_id` 已删除。服务器生成共享令牌。
  </Tab><Tab title="TypeScript">
    * `runs.share.create` 将运行 ID 作为其位置参数。在选项对象中传递 `session_id` 和根 `trace_id`。
    * `runs.share.delete` 采用根跟踪 ID 和包含 `session_id` 的选项对象。
    * `shareId` 已删除。服务器生成共享令牌。
  </Tab>

  <Tab title="cURL">
    * v2共享请求体包含`session_id`和`trace_id`。
    * v2 取消共享路径标识根跟踪。其请求正文包含`session_id`。
    * v2 取消共享操作是幂等的并返回`204 No Content`。
  </Tab>
</Tabs>

尽管生成的参数类型可能会将这些坐标标记为可选，但在共享时提供 `session_id` 和 `trace_id`，在取消共享时提供 `session_id`。 SmithDB 使用这些坐标进行查找。

#### 公共读取参数* `public.runs.query` 获取共享代币和`selects` 列表。该令牌将查询范围限定为完整的共享跟踪。旧版运行 ID 过滤器和游标响应已被删除。
* `public.runs.retrieve` 需要运行 ID、共享令牌、精确运行 `start_time` 和 `selects` 列表。从`public.runs.query`获取准确存储的开始时间。
* 公共点读取仅返回选定的字段。对于以下示例，请使用 `ID`、`NAME`、`RUN_TYPE`、`STATUS` 和 `START_TIME`。
* 要检索经过身份验证的运行的公共 URL，请使用 `selects=["SHARE_URL"]` 调用 `runs.retrieve`，然后读取 `run.share_url`。提供 `start_time` 可以为 SmithDB 提供最高效的查找。

不要从 API 源构建公共 URL。检索 `share_url` 使用部署的配置应用程序源，适用于云和自托管部署。

#### 回应|运营|之前 |之后 |
| -------------------- | ---------------------------------------------------- | --------------------------------------- |
|分享 |运行 ID、共享跟踪 ID 和共享令牌 | `share_token` |
|取消分享 | `{"message": "Run unshared"}` | `204 No Content` |
|查询公开运行 | `runs` 和 `cursors` | `items` |
|检索公开运行 |完整的传统运行|选择驱动运行对象|
|阅读分享状态 |共享状态对象或 `null` |共享时使用 `share_url` 运行对象 |

### 示例

这些示例在读取点之前查询公共跟踪，因为 `public.runs.retrieve` 需要运行的精确存储的 `start_time`。

<Tabs>
  <Tab title="Python">
    <Tabs>
      <Tab title="Before">
        ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        # Share a trace.
        share_url = client.share_run(run_id)

        # Read the shared runs and one specific run.
        runs = list(client.list_shared_runs(share_token))
        run = client.read_shared_run(share_token, run_id=run_id)

        # Check whether the run is shared.
        share_url = client.read_run_shared_link(run_id)

        # Remove public access.
        client.unshare_run(run_id)
        ```
      </Tab>

      <Tab title="After">
        ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        PUBLIC_RUN_SELECTS = ["ID", "NAME", "RUN_TYPE", "STATUS", "START_TIME"]

        # Share a trace.
        share = await client.runs.share.create(
            run_id,
            session_id=project_id,
            trace_id=trace_id,
        )
        if not share.share_token:
            raise RuntimeError("The server did not return a share token")
        share_token = share.share_token

        # Query the public trace and use its stored start time for a point read.
        response = await client.public.runs.query(
            share_token,
            selects=PUBLIC_RUN_SELECTS,
        )
        runs = response.items
        item = next(run for run in runs if str(run.id) == run_id)
        run = await client.public.runs.retrieve(
            run_id,
            share_token=share_token,
            selects=PUBLIC_RUN_SELECTS,
            start_time=item.start_time,
        )

        # Retrieve the deployment-aware public URL for an authenticated run.
        authenticated_run = await client.runs.retrieve(
            run_id,
            project_id=project_id,
            start_time=item.start_time,
            selects=["SHARE_URL"],
        )
        share_url = authenticated_run.share_url

        # Remove public access by root trace ID.
        await client.runs.share.delete(trace_id, session_id=project_id)
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    <Tabs>
      <Tab title="Before">
        ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        // Share a trace.
        const shareUrl = await client.shareRun(runId);

        // Read the shared runs and one specific run.
        const runs = await client.listSharedRuns(shareToken);
        const [run] = await client.listSharedRuns(shareToken, {
          runIds: [runId],
        });

        // Check whether the run is shared.
        const existingShareUrl = await client.readRunSharedLink(runId);

        // Remove public access.
        await client.unshareRun(runId);
        ```
      </Tab>

      <Tab title="After">
        ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        const PUBLIC_RUN_SELECTS = [
          "ID",
          "NAME",
          "RUN_TYPE",
          "STATUS",
          "START_TIME",
        ] as const;

        // Share a trace.
        const share = await client.runs.share.create(runId, {
          session_id: projectId,
          trace_id: traceId,
        });
        if (!share.share_token) {
          throw new Error("The server did not return a share token");
        }
        const shareToken = share.share_token;

        // Query the public trace and use its stored start time for a point read.
        const response = await client.public.runs.query(shareToken, {
          selects: [...PUBLIC_RUN_SELECTS],
        });
        const runs = response.items ?? [];
        const item = runs.find((candidate) => candidate.id === runId);
        if (!item?.start_time) {
          throw new Error("The public run or its start_time was not found");
        }
        const run = await client.public.runs.retrieve(runId, {
          share_token: shareToken,
          selects: [...PUBLIC_RUN_SELECTS],
          start_time: item.start_time,
        });

        // Retrieve the deployment-aware public URL for an authenticated run.
        const authenticatedRun = await client.runs.retrieve(runId, {
          project_id: projectId,
          start_time: item.start_time,
          selects: ["SHARE_URL"],
        });
        const shareUrl = authenticatedRun.share_url;

        // Remove public access by root trace ID.
        await client.runs.share.delete(traceId, { session_id: projectId });
        ```
      </Tab>
    </Tabs>
  </Tab><Tab title="cURL">
    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        # Share a run.
        curl --request PUT \
          "$API_URL/api/v1/runs/$RUN_ID/share" \
          --header "X-API-Key: $LANGSMITH_API_KEY"

        # Query the public trace and retrieve one public run.
        curl --request POST \
          "$API_URL/api/v1/public/$SHARE_TOKEN/runs/query" \
          --header "Content-Type: application/json" \
          --data '{}'
        curl "$API_URL/api/v1/public/$SHARE_TOKEN/run/$RUN_ID"

        # Read the share state, then remove public access.
        curl "$API_URL/api/v1/runs/$RUN_ID/share" \
          --header "X-API-Key: $LANGSMITH_API_KEY"
        curl --request DELETE \
          "$API_URL/api/v1/runs/$RUN_ID/share" \
          --header "X-API-Key: $LANGSMITH_API_KEY"
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        # Share a trace.
        curl --request POST \
          "$API_URL/api/v2/runs/$RUN_ID/share" \
          --header "X-API-Key: $LANGSMITH_API_KEY" \
          --header "Content-Type: application/json" \
          --data "{\"session_id\":\"$PROJECT_ID\",\"trace_id\":\"$TRACE_ID\"}"

        # Query the public trace.
        curl --request POST \
          "$API_URL/api/v2/public/$SHARE_TOKEN/runs/query" \
          --header "Content-Type: application/json" \
          --data '{"selects":["ID","NAME","RUN_TYPE","STATUS","START_TIME"]}'

        # Retrieve one public run using its exact start time from the query response.
        curl --get "$API_URL/api/v2/public/$SHARE_TOKEN/run/$RUN_ID" \
          --data-urlencode "start_time=$START_TIME" \
          --data-urlencode "selects=ID" \
          --data-urlencode "selects=NAME" \
          --data-urlencode "selects=RUN_TYPE" \
          --data-urlencode "selects=STATUS" \
          --data-urlencode "selects=START_TIME"

        # Retrieve the deployment-aware public URL for an authenticated run.
        curl --get "$API_URL/api/v2/runs/$RUN_ID" \
          --header "X-API-Key: $LANGSMITH_API_KEY" \
          --data-urlencode "project_id=$PROJECT_ID" \
          --data-urlencode "start_time=$START_TIME" \
          --data-urlencode "selects=SHARE_URL"

        # Remove public access by root trace ID.
        curl --request DELETE \
          "$API_URL/api/v2/runs/$TRACE_ID/share" \
          --header "X-API-Key: $LANGSMITH_API_KEY" \
          --header "Content-Type: application/json" \
          --data "{\"session_id\":\"$PROJECT_ID\"}"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

## 反馈：创建

为跑步创建反馈（分数、更正或评论）。

### 主要变化

#### 必需参数

方法名称和端点不变。仅会话（项目）ID 要求发生变化。

<Tabs>
  <Tab title="Python">
    <Warning>
      `create_feedback` 现在需要 `session_id`，即拥有运行的项目（会话）的 UUID。以前它是可选的。
    </Warning>

    |之前 |之后|笔记|
    | ----------------------- | ------------------------ | | ------------------------------------------------------------------------------------------------------------------------ |
    | `session_id`（可选）| `session_id`（**必填**）|拥有运行的项目的 UUID；如果您还没有，请使用 `client.read_project()` 解决它 |
  </Tab>

  <Tab title="TypeScript">
    <Warning>
      `client.createFeedback` 现在需要 `sessionId`，即拥有运行的项目（会话）的 UUID。以前它是可选的。
    </Warning>|之前 |之后|笔记|
    | ---------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
    | `sessionId`（可选）| `sessionId`（**必填**）|拥有运行的项目的 UUID；如果您还没有，请使用 `client.readProject()` 解决它 |
  </Tab>

  <Tab title="Java">
    <Warning>
      现在需要`FeedbackCreateSchema.sessionId()`。以前它是可选的。
    </Warning>

    |之前 |之后|笔记|
    | ------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
    | `sessionId()`（可选）| `sessionId()`（**必填**）|拥有运行的项目的 UUID；如果您还没有，请使用 `client.sessions().list()` 解决它 |
  </Tab>

  <Tab title="Go">
    <Warning>
      现在需要`FeedbackCreateSchemaParam.SessionID`。以前它是可选的。
    </Warning>|之前 |之后|笔记|
    | ---------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
    | `SessionID`（可选）| `SessionID`（**必填**）|拥有运行的项目的 UUID；如果您还没有，请使用 `client.Sessions.List()` 解决它 |
  </Tab>

  <Tab title="cURL">
    <Warning>
      `POST /api/v1/feedback` 现在需要请求正文中包含 `session_id` 字段。以前它是可选的。
    </Warning>

    |之前 |之后|笔记|
    | ----------------------- | ------------------------ | | -------------------------------------------------------------------------------------------------------------------------- |
    | `session_id`（可选）| `session_id`（**必填**）|拥有运行的项目的 UUID；如果您还没有，请使用 `GET /api/v1/sessions` 解决它 |
  </Tab>
</Tabs>

### 示例

#### 创建反馈时提供`session_id`<Tabs>
  <Tab title="Python">
    除了 `run_id` 之外，`create_feedback` 现在还需要 `session_id`。

    <Tabs>
      <Tab title="Before">
        ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        run_id = "<run-id>"
        client.create_feedback(
            run_id=run_id,
            key="user_feedback",
            score=1,
        )
        ```
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from langsmith import Client

        client = Client()
        run_id = "<run-id>"
        session_id = "<session-id>"
        client.create_feedback(
            run_id=run_id,
            key="user_feedback",
            score=1,
            session_id=session_id,
        )
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="TypeScript">
    除了 `runId` 之外，`client.createFeedback` 现在还需要 `sessionId`。

    <Tabs>
      <Tab title="Before">
        ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        let runId = "<run-id>";
        await client.createFeedback(runId, "user_feedback", {
          score: 1,
        });
        ```
      </Tab>

      <Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        let runId = "<run-id>";
        let sessionId = "<session-id>";
        await client.createFeedback(runId, "user_feedback", {
          score: 1,
          sessionId,
        });
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Java">
    除了 `.runId()` 之外，`.create()` 现在还需要 `.sessionId()`。

    <Tabs>
      <Tab title="Before">
        ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.feedback.FeedbackCreateSchema

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        var runId = "<run-id>"
        client.feedback().create(
            FeedbackCreateSchema.builder()
                .runId(runId)
                .key("user_feedback")
                .score(1.0)
                .build()
        )
        ```
      </Tab>

      <Tab title="After">
        ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import com.langchain.smith.client.LangsmithClient
        import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
        import com.langchain.smith.models.feedback.FeedbackCreateSchema

        val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()

        var runId = "<run-id>"
        var sessionId = "<session-id>"
        client.feedback().create(
            FeedbackCreateSchema.builder()
                .runId(runId)
                .key("user_feedback")
                .score(1.0)
                .sessionId(sessionId)
                .build()
        )
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Go">
    除了 `RunID` 之外，`Feedback.New` 现在还需要 `SessionID`。

    <Tabs>
      <Tab title="Before">
        ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        	"github.com/langchain-ai/langsmith-go/shared"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        runID := "<run-id>"
        var err error
        _, err = client.Feedback.New(ctx, langsmith.FeedbackNewParams{
        	FeedbackCreateSchema: langsmith.FeedbackCreateSchemaParam{
        		RunID: langsmith.F(runID),
        		Key:   langsmith.F("user_feedback"),
        		Score: langsmith.F[langsmith.FeedbackCreateSchemaScoreUnionParam](shared.UnionFloat(1.0)),
        	},
        })
        ```
      </Tab>

      <Tab title="After">
        ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        package main

        import (
        	"context"

        	"github.com/langchain-ai/langsmith-go"
        	"github.com/langchain-ai/langsmith-go/shared"
        )

        ctx := context.Background()
        client := langsmith.NewClient()

        runID := "<run-id>"
        sessionID := "<session-id>"
        var err error
        _, err = client.Feedback.New(ctx, langsmith.FeedbackNewParams{
        	FeedbackCreateSchema: langsmith.FeedbackCreateSchemaParam{
        		RunID:     langsmith.F(runID),
        		Key:       langsmith.F("user_feedback"),
        		Score:     langsmith.F[langsmith.FeedbackCreateSchemaScoreUnionParam](shared.UnionFloat(1.0)),
        		SessionID: langsmith.F(sessionID),
        	},
        })
        ```
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="cURL">
    除了 `run_id` 之外，`POST /api/v1/feedback` 现在还需要 `session_id` 字段。

    <Tabs>
      <Tab title="Before">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        RUN_ID="<run-id>"

        curl -X POST "https://api.smith.langchain.com/api/v1/feedback" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg run "$RUN_ID" '{"run_id": $run, "key": "user_feedback", "score": 1}')"
        ```
      </Tab>

      <Tab title="After">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        RUN_ID="<run-id>"
        SESSION_ID="<session-id>"

        curl -X POST "https://api.smith.langchain.com/api/v1/feedback" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg run "$RUN_ID" --arg session "$SESSION_ID" '{"run_id": $run, "key": "user_feedback", "score": 1, "session_id": $session}')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

## 例外情况

<Tabs>
  <Tab title="Python">
    SmithDB 支持的方法引发新的异常类，而不是旧的 `langsmith.utils` 异常类。|之前 (`langsmith.utils`) |之后 (`langsmith`) |笔记|
    | -------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
    | `LangSmithError` | `LangsmithError` | SDK的异常基类；外壳已更改 |
    | `LangSmithAPIError` | `InternalServerError` | 5xx |
    | `LangSmithRequestTimeout` | `APITimeoutError` |请求超时时引发 || `LangSmithUserError` | *（已删除）* |没有直接等价物。 403 org-scoped-key 案例现在引发 `PermissionDeniedError`；客户端参数验证现在提出了标准 `ValueError` 或 `TypeError` |
    | `LangSmithRateLimitError` | `RateLimitError` | 429；不变的名字 |
    | `LangSmithAuthError` | `AuthenticationError` | 401 | 401
    | `LangSmithNotFoundError` | `NotFoundError` | 404;不变的名字 |
    | `LangSmithConflictError` | `ConflictError` | 409；不变的名字 || `LangSmithConnectionError` | `APIConnectionError` |当客户端无法连接到 API 时引发 |
    | `LangSmithExceptionGroup` | *（已删除）* |没有同等的|
    | *（不可用）* | `APIError` |新增：所有 API 相关错误的基类，具有 `message`、`request` 和 `body` 属性 |
    | *（不可用）* | `APIStatusError` |新：所有 4xx/5xx 状态错误的基类 |
    | *（不可用）* | `BadRequestError` |新：400 || *（不可用）* | `PermissionDeniedError` |新：403 |
    | *（不可用）* | `UnprocessableEntityError` |新：422 |
    | *（不可用）* | `APIResponseValidationError` |新：当响应与预期模式不匹配时引发 |
  </Tab>

  <Tab title="TypeScript">
    SmithDB 支持的方法引发新的异常类，而不是普通的 `Error`。|之前（简单`Error`）|之后 (`langsmith`) |笔记|
    | ---------------------- | ------------------------ | | ------------------------------------------------------------------------------------------- |
    | *（不可用）* | `LangsmithError` |所有 SDK 错误的基类 |
    | *（不可用）* | `InternalServerError` | 5xx |
    | *（不可用）* | `APIConnectionTimeoutError` |请求超时时引发 |
    | *（不可用）* | `RateLimitError` | 429 | 429
    | *（不可用）* | `AuthenticationError` | 401 | 401
    | *（不可用）* | `NotFoundError` | 404 | 404| *（不可用）* | `ConflictError` | 409 | 409
    | *（不可用）* | `APIConnectionError` |当客户端无法连接到 API 时引发 |
    | *（不可用）* | `APIError` |所有与 API 相关的错误的基类，具有 `status`、`headers` 和 `error` 属性 |
    | *（不可用）* | `BadRequestError` | 400 |
    | *（不可用）* | `PermissionDeniedError` | 403 | 403
    | *（不可用）* | `UnprocessableEntityError` | 422 | 422
    | *（不可用）* | `APIUserAbortError` |当请求通过 `AbortController` | 中止时引发
  </Tab>

  <Tab title="Java">
    没有变化。错误处理不受此迁移的影响。
  </Tab>

  <Tab title="Go">
    没有变化。错误处理不受此迁移的影响。
  </Tab><Tab title="cURL">
    没有变化。错误处理不受此迁移的影响。
  </Tab>
</Tabs>

## 停产

以下方法已停止使用。他们调用已退役的 `/feedback/formulas` 端点，这些端点在复合反馈 v2 上返回 `410 Gone`，并计划于 2026 年 8 月 20 日删除。综合分数现在管理为[composite evaluators](/langsmith/composite-evaluators-ui)，它将综合分数实现为代码评估器加运行规则。没有 SDK 替代品。

###反馈公式方法

|蟒蛇 |打字稿 |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| [⟦T3896⟧](https://reference.langchain.com/python/langsmith/client/Client/list_feedback_formulas) |不适用 |
| [⟦T3897⟧](https://reference.langchain.com/python/langsmith/client/Client/get_feedback_formula_by_id) |不适用 |
| [⟦T3898⟧](https://reference.langchain.com/python/langsmith/client/Client/create_feedback_formula) |不适用 |
| [⟦T3899⟧](https://reference.langchain.com/python/langsmith/client/Client/update_feedback_formula) |不适用 |
| [⟦T3900⟧](https://reference.langchain.com/python/langsmith/client/Client/delete_feedback_formula) |不适用 |

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/smithdb-sdk-migration.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>