<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Migrate run queries to SmithDB | https://docs.langchain.com/langsmith/smithdb-sdk-migration-query-runs -->

# 将运行查询迁移到 SmithDB

将 LangSmith SDK 运行查询方法迁移到 SmithDB 支持的等效方法。

运行查询是迁移中最大的表面积，因此它们有自己的页面。有关弃用日期、最低 SDK 版本以及适用于每种方法的代理提示，请参阅 [Migrate to SmithDB-backed SDK methods](/langsmith/smithdb-sdk-migration)。

## 运行：查询

查询从具有可选过滤和字段投影的项目运行。返回分页结果集。

### 主要变化

#### 方法名称

**Python**

|之前 |之后 |
| - | - |
| `client.list_runs()` | `client.runs.query()` |

> [!注意]
>
> `client.runs.query()` 现在是异步的。用 `await` 来调用它。

有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/python/langsmith/_openapi_client/resources/runs/RunsResource/query_v2)。

**打字稿**

|之前 |之后 |
| - | - |
| `client.listRuns()` | `client.runs.query()` |

有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/javascript/langsmith/_openapi_client/Langsmith/Runs/queryV2)。

**Java**

|之前 |之后 |
| - | - |
| `client.runs().query()` | `client.runs().queryV2()` |

完整参数列表请参见[reference](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/RunService.html)。

**去**

|之前 |之后 |
| - | - |
| `client.Runs.Query()` | `client.Runs.QueryV2()` |

完整参数列表请参见[reference](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#RunService.QueryV2AutoPaging)。

**卷曲**

|之前 |之后 |
| - | - |
| `POST /api/v1/runs/query` | `POST /api/v2/runs/query` |

有关完整参数和字段列表，请参阅[API doc](/langsmith/smith-api/runs/query-runs)。

#### 查询参数

**Python**> [!警告]
>
> `runs.query` 不支持`project_name`。改为使用项目 UUID 传递 `project_ids`。要按名称查找 UUID，请在异步代码中使用 `client.read_project(project_name="my-project")` 或 `await client.aread_project(project_name="my-project")`。

> [!警告]
>
> 省略时，`min_start_time` 默认为 **1 天前**。没有 `start_time` 的 `list_runs` 返回所有历史运行；没有 `min_start_time` 的 `runs.query` 会静默地将查询范围限定为过去 24 小时。如果您需要更宽的窗口，请传递显式的 `min_start_time`。

|之前 (`list_runs`) |之后（`runs.query`）|笔记|
| - | - | - |
| `project_name` | *（已删除）* |将 `project_ids` 与 UUID 一起使用 - 请参阅上面的警告 |
| `project_id` | `project_ids` |现在拿出一个清单；与 `reference_dataset_id` 互斥 |
| `run_type` | `run_type` |值现在必须为大写：`"LLM"`、`"CHAIN"`、`"TOOL"`、`"RETRIEVER"`、`"EMBEDDING"`、`"PROMPT"`、`"PARSER"` |
| `trace_id` | `trace_id` |不变 |
| `reference_example_id` | `reference_examples` |现在获取 UUID 列表 |
| `query` | *（已删除）* |没有同等的 |
| `filter` | `filter` |语法不变 |
| `trace_filter` | `trace_filter` |不变 |
| `tree_filter` | `tree_filter` |不变 |
| `is_root` | `is_root` |不变 |
| `parent_run_id` | *（已删除）* |没有同等的 |
| `start_time` | `min_start_time` |更名；默认为 1 天前 - 请参阅上面的警告 |
| `error` | `has_error` |更名|
| `run_ids` | `ids` |更名|| `select` | `selects` |字段名称现在为大写（`"NAME"`、`"STATUS"` 等）|
| `limit` | *（已删除）* |使用 `page_size` 作为每个请求的批量大小 |
| *（不可用）* | `max_start_time` | `start_time` 的上限；默认为现在 |
| *（不可用）* | `page_size` |每个请求结果计数（默认 100，最大 1000）|
| *（不可用）* | `reference_dataset_id` |替代`project_ids`；互斥|
| *（不可用）* | `cursor` |从上一个响应中传递 `next_cursor` 以获取下一页 |

**打字稿**

> [!警告]
>
> `client.runs.query` 不支持`projectName`。改为使用项目 UUID 传递 `project_ids`。要按名称查找 UUID，请使用 `client.readProject({ projectName: "my-project" })`。

> [!警告]
>
> 省略时，`min_start_time` 默认为 **1 天前**。没有 `startTime` 的 `listRuns` 返回所有历史运行；没有 `min_start_time` 的 `client.runs.query` 会静默地将查询范围限定为过去 24 小时。如果您需要更宽的窗口，请传递显式的`min_start_time`。|之前 (`listRuns`) |之后(`client.runs.query`) |笔记|
| - | - | - |
| `projectName` | *（已删除）* |将 `project_ids` 与 UUID 一起使用 - 请参阅上面的警告 |
| `projectId` | `project_ids` |更名为`snake_case`；现在需要一个列表；与 `reference_dataset_id` 互斥 |
| `runType` | `run_type` |更名为`snake_case`；值现在必须为大写：`"LLM"`、`"CHAIN"`、`"TOOL"`、`"RETRIEVER"`、`"EMBEDDING"`、`"PROMPT"`、`"PARSER"` |
| `traceId` | `trace_id` |更名为`snake_case` |
| `referenceExampleId` | `reference_examples` |更名为`snake_case`；现在获取 UUID 列表 |
| `query` | *（已删除）* |没有同等的 |
| `filter` | `filter` |语法不变 |
| `traceFilter` | `trace_filter` |更名为`snake_case` |
| `treeFilter` | `tree_filter` |更名为`snake_case` |
| `isRoot` | `is_root` |更名为`snake_case` |
| `parentRunId` | *（已删除）* |没有同等的 |
| `startTime` | `min_start_time` |更名为`snake_case`；默认为 1 天前 - 请参阅上面的警告 |
| `error` | `has_error` |更名|
| `id` | `ids` |更名|
| `select` | `selects` |字段名称现在为大写（`"NAME"`、`"STATUS"` 等）|
| `limit` | *（已删除）* |使用 `page_size` 作为每个请求的批量大小 |
| `order` | *（已删除）* |没有同等的 |
| `executionOrder` | *（已删除）* |没有同等的 |
| *（不可用）* | `max_start_time` | `start_time` 的上限；默认为现在 || *（不可用）* | `page_size` |每个请求结果计数（默认 100，最大 1000）|
| *（不可用）* | `reference_dataset_id` |替代`project_ids`；互斥|
| *（不可用）* | `cursor` |从上一个响应中传递 `next_cursor` 以获取下一页 |

**Java**

> [!警告]
>
> 省略时，`minStartTime()` 默认为 **1 天前**。没有 `startTime()` 的 `query()` 返回所有历史运行；不带 `minStartTime()` 的 `queryV2()` 会静默地将查询范围限定为过去 24 小时。如果您需要更宽的窗口，请传递显式的 `minStartTime()`。|之前 (`RunQueryParams`) |之后（`RunQueryV2Params`）|笔记|
| - | - | - |
| `session()` | `projectIds()` |更名；现在采用显式项目 UUID |
| `runType()` | `runType()` |值现在必须为大写 |
| `trace()` | `traceId()` |更名|
| `referenceExample()` | `referenceExamples()` |重命名为复数 |
| `query()` | *（已删除）* |没有同等的 |
| `filter()` | `filter()` |语法不变 |
| `traceFilter()` | `traceFilter()` |不变 |
| `treeFilter()` | `treeFilter()` |不变 |
| `isRoot()` | `isRoot()` |不变 |
| `parentRun()` | *（已删除）* |没有同等的 |
| `startTime()` | `minStartTime()` |更名；默认为 1 天前 - 请参阅上面的警告 |
| `error()` | `hasError()` |更名|
| `id()` | `ids()` |更名|
| `select()` | `selects()` |字段名称现在为大写 |
| `limit()` | *（已删除）* |使用`pageSize()`|
| `order()` | *（已删除）* |没有同等的 |
| `executionOrder()` | *（已删除）* |没有同等的 |
| `cursor()` | `cursor()` |不变 |
| *（不可用）* | `maxStartTime()` |开始时间的上限；默认为现在 |
| *（不可用）* | `pageSize()` |每个请求结果计数（默认 100，最大 1000）|
| *（不可用）* | `referenceDatasetId()` | `projectIds()` 的替代方案 |

**去**> [!警告]
>
> 省略时，`MinStartTime` 默认为 **1 天前**。没有 `StartTime` 的 `Query()` 返回所有历史运行；不带 `MinStartTime` 的 `QueryV2()` 会静默地将查询范围限定为过去 24 小时。如果您需要更宽的窗口，请传递显式的 `MinStartTime`。

|之前 (`RunQueryParams`) |之后（`RunQueryV2Params`）|笔记|
| - | - | - |
| `Session` | `ProjectIDs` |更名；现在采用显式项目 UUID |
| `RunType` | `RunType` |值现在必须为大写：`RunQueryV2ParamsRunTypeLLM`、`RunQueryV2ParamsRunTypeChain` 等 |
| `Trace` | `TraceID` |更名|
| `ReferenceExample` | `ReferenceExamples` |重命名为复数 |
| `Query` | *（已删除）* |没有同等的 |
| `Filter` | `Filter` |不变 |
| `TraceFilter` | `TraceFilter` |不变 |
| `TreeFilter` | `TreeFilter` |不变 |
| `IsRoot` | `IsRoot` |不变 |
| `ParentRun` | *（已删除）* |没有同等的 |
| `StartTime` | `MinStartTime` |更名；默认为 1 天前 - 请参阅上面的警告 |
| `Error` | `HasError` |更名|
| `ID` | `IDs` |更名|
| `Select` | `Selects` |字段名称常量现在为大写（例如，`RunQueryV2ParamsSelectName`）|
| `Limit` | *（已删除）* |使用`PageSize` |
| `Order` | *（已删除）* |没有同等的 |
| `ExecutionOrder` | *（已删除）* |没有同等的 |
| `Cursor` | `Cursor` |不变 |
| *（不可用）* | `MaxStartTime` |开始时间的上限；默认为现在 || *（不可用）* | `PageSize` |每个请求结果计数（默认 100，最大 1000）|
| *（不可用）* | `ReferenceDatasetID` | `ProjectIDs` 的替代方案 |

**卷曲**

> [!警告]
>
> 省略时，`min_start_time` 默认为 **1 天前**。没有 `start_time` 的 `POST /api/v1/runs/query` 返回所有历史运行；不带 `min_start_time` 的 `POST /api/v2/runs/query` 会静默地将查询范围限定为过去 24 小时。如果您需要更宽的窗口，请传递显式的 `min_start_time`。

|之前 (v1 `POST /api/v1/runs/query` 正文字段) |之后 (v2 `POST /api/v2/runs/query` 正文字段) |笔记|
| - | - | - |
| `session` | `project_ids` |更名；两者都采用一系列项目 UUID。 `project_ids` 与 `reference_dataset_id` 互斥 |
| `run_type` | `run_type` |值现在必须为大写：`"LLM"`、`"CHAIN"`、`"TOOL"`、`"RETRIEVER"`、`"EMBEDDING"`、`"PROMPT"`、`"PARSER"` |
| `trace` | `trace_id` |更名|
| `reference_example` | `reference_examples` |重命名为复数；现在采用 UUID 数组 |
| `query` | *（已删除）* |没有同等的 |
| `filter` | `filter` |语法不变 |
| `trace_filter` | `trace_filter` |不变 |
| `tree_filter` | `tree_filter` |不变 |
| `is_root` | `is_root` |不变 |
| `parent_run` | *（已删除）* |没有同等的 |
| `start_time` | `min_start_time` |更名；默认为 1 天前 - 请参阅上面的警告 |
| `error` | `has_error` |更名|
| `id` | `ids` |重命名为复数 || `select` | `selects` |字段名称现在为大写（`"NAME"`、`"STATUS"` 等）|
| `limit` | *（已删除）* |使用 `page_size` 作为每个请求的批量大小 |
| *（不可用）* | `max_start_time` | `start_time` 的上限；默认为现在 |
| *（不可用）* | `page_size` |每个请求结果计数（默认 100，最大 1000）|
| *（不可用）* | `reference_dataset_id` |替代`project_ids`；互斥|
| *（不可用）* | `cursor` |从上一个响应中传递 `next_cursor` 以获取下一页 |

#### 响应字段

> [!警告]
>
> 令牌和成本字段不再包含子运行使用情况。在 v1 中，每个父运行（包括根运行）都包含其下的 LLM 运行的总使用量。在 v2 中，这些字段仅报告运行自身的使用情况。未进行自己的模型调用的根或链运行将返回空（`None`、`null`，或从 JSON 中省略），而不是跟踪总数。
>
> 要读取跟踪的总代币和成本，请使用 [Traces: query](/langsmith/smithdb-sdk-migration-traces) 并从 `trace_aggregates` 读取 `total_tokens` 和 `total_cost`。 `trace_aggregates` 没有提示或完成分割。

**Python**将 SCREAMING\_SNAKE\_CASE 字符串传递给`selects`（例如`"ID"`、`"NAME"`、`"STATUS"`）以控制每个`Run`上填充哪些字段；只有选定的字段是非`None`。默认 `selects` 仅包含 `"ID"`。

|之前（v1 `Run`​​ 属性）|之后（v2 `Run` 属性）|笔记|
| - | - | - |
| `run.id` | `run.id` |不变；省略 `selects` 时默认返回 |
| `run.name` | `run.name` |不变 |
| `run.run_type` | `run.run_type` |值现在为大写文字：`"LLM"`、`"CHAIN"` 等 |
| `run.status` | `run.status` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` |
| `run.start_time` | `run.start_time` |不变 |
| `run.end_time` | `run.end_time` |不变 |
| `run.error` | `run.error` |不变 |
| `run.inputs` | `run.inputs` |不变 |
| `run.outputs` | `run.outputs` |不变 |
| `run.tags` | `run.tags` |不变 |
| `run.extra` | `run.extra` |不变 |
| `run.metadata` | `run.metadata` |不变 |
| `run.events` | `run.events` |不变 |
| `run.reference_example_id` | `run.reference_example_id` |不变 |
| `run.trace_id` | `run.trace_id` |不变 |
| `run.dotted_order` | `run.dotted_order` |不变 |
| `run.parent_run_id` | *（已删除）* |使用`run.parent_run_ids`（所有祖先UUID的列表，根在前）|
| `run.parent_run_ids` | `run.parent_run_ids` |不变 |
| `run.session_id` | `run.project_id` |更名； `session_id` 是项目 UUID |
| `run.feedback_stats` | `run.feedback_stats` |不变 |
| `run.app_path` | `run.app_path` |不变 || `run.attachments` | `run.attachments` | v2 返回预签名的下载 URL，而不是原始字节 |
| `run.total_tokens` | `run.total_tokens` |仅供自己使用；不再从子运行中求和|
| `run.prompt_tokens` | `run.prompt_tokens` |仅供自己使用；不再从子运行中求和|
| `run.completion_tokens` | `run.completion_tokens` |仅供自己使用；不再从子运行中求和|
| `run.total_cost` | `run.total_cost` |仅供自己使用；不再从子运行中求和|
| `run.prompt_cost` | `run.prompt_cost` |仅供自己使用；不再从子运行中求和|
| `run.completion_cost` | `run.completion_cost` |仅供自己使用；不再从子运行中求和|
| `run.first_token_time` | `run.first_token_time` |不变 |
| `run.latency`（属性）| `run.latency_seconds` |更名；是一个计算的 `timedelta` 属性，现在是一个原生的 `float` 字段 |
| `run.in_dataset` | `run.is_in_dataset` |更名|
| `run.child_run_ids` | *（已删除）* |没有同等的 |
| `run.child_runs` | *（已删除）* |没有同等的 |
| `run.serialized` | *（已删除）* |使用`run.manifest`|
| `run.manifest_id` | *（已删除）* |使用`run.manifest` |
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

**打字稿**

将 SCREAMING\_SNAKE\_CASE 字符串传递给 `selects`（例如 `"ID"`、`"NAME"`、`"STATUS"`）以控制每个 `Run` 上填充哪些字段。默认 `selects` 仅包含 `"ID"`。|之前（v1 `Run` 属性）|之后（v2 `Run` 属性）|笔记|
| - | - | - |
| `run.id` | `run.id` |不变 |
| `run.name` | `run.name` |不变 |
| `run.runType` | `run.run_type` |更名为`snake_case`；值现在为大写：`"LLM"`、`"CHAIN"` 等 |
| `run.status` | `run.status` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` |
| `run.startTime` | `run.start_time` |更名为`snake_case` |
| `run.endTime` | `run.end_time` |更名为`snake_case` |
| `run.error` | `run.error` |不变 |
| `run.inputs` | `run.inputs` |不变 |
| `run.outputs` | `run.outputs` |不变 |
| `run.tags` | `run.tags` |不变 |
| `run.extra` | `run.extra` |不变 |
| *（不可用）* | `run.metadata` |新：之前通过 `run.extra.metadata` 访问过 |
| `run.events` | `run.events` |不变 |
| `run.referenceExampleId` | `run.reference_example_id` |更名为`snake_case` |
| `run.traceId` | `run.trace_id` |更名为`snake_case` |
| `run.dottedOrder` | `run.dotted_order` |更名为`snake_case` |
| `run.parentRunId` | *（已删除）* |使用`run.parent_run_ids`（所有祖先UUID的列表，根在前）|
| `run.parentRunIds` | `run.parent_run_ids` |更名为`snake_case` |
| `run.sessionId` | `run.project_id` |更名； `sessionId` 是项目 UUID |
| `run.feedbackStats` | `run.feedback_stats` |更名为`snake_case` |
| `run.appPath` | `run.app_path` |更名为`snake_case` |
| `run.attachments` | `run.attachments` | v2 返回预签名的下载 URL，而不是原始字节 |
| `run.totalTokens` | `run.total_tokens` |更名为`snake_case`；仅供自己使用；不再从子运行中求和|| `run.promptTokens` | `run.prompt_tokens` |更名为`snake_case`；仅供自己使用；不再从子运行中求和|
| `run.completionTokens` | `run.completion_tokens` |更名为`snake_case`；仅供自己使用；不再从子运行中求和|
| `run.totalCost` | `run.total_cost` |更名为`snake_case`；仅供自己使用；不再从子运行中求和|
| `run.promptCost` | `run.prompt_cost` |更名为`snake_case`；仅供自己使用；不再从子运行中求和|
| `run.completionCost` | `run.completion_cost` |更名为`snake_case`；仅供自己使用；不再从子运行中求和|
| `run.firstTokenTime` | `run.first_token_time` |更名为`snake_case` |
| `run.latency` | `run.latency_seconds` |更名；是一个计算属性，现在是一个本机 `number` 字段（秒） |
| `run.inDataset` | `run.is_in_dataset` |更名|
| `run.childRunIds` | *（已删除）* |没有同等的 |
| `run.childRuns` | *（已删除）* |没有同等的 |
| `run.serialized` | *（已删除）* |使用`run.manifest`|
| `run.manifestId` | *（已删除）* |使用`run.manifest` |
| `run.shareToken` | *（已删除）* |使用`run.share_url`（完整URL，仅在共享运行时设置）|
| *（不可用）* | `run.is_root` |新 |
| *（不可用）* | `run.manifest` |新：完整清单对象（替换`serialized`和`manifestId`）|
| *（不可用）* | `run.error_preview` |新：截断的错误片段 |
| *（不可用）* | `run.inputs_preview` |新：截断的输入预览 |
| *（不可用）* | `run.outputs_preview` |新：截断的输出预览 || *（不可用）* | `run.thread_id` |新：对话线程 UUID |
| *（不可用）* | `run.reference_dataset_id` |新：参考示例的数据集 UUID |
| *（不可用）* | `run.share_url` |新功能：公共共享 URL（仅在共享运行时设置）|
| *（不可用）* | `run.prompt_token_details` |新：按类别提示令牌细分 |
| *（不可用）* | `run.completion_token_details` |新：按类别完成标记细分 |
| *（不可用）* | `run.prompt_cost_details` |新：按类别提示成本明细 |
| *（不可用）* | `run.completion_cost_details` |新：按类别完成成本明细 |

**Java**

通过`.addSelect(...)`添加`RunQueryV2Params.Select`值（例如`Select.NAME`、`Select.STATUS`）来控制填充哪些字段；未选择的字段返回空 `Optional` 值。 `selects()` 仅默认为 `ID`。|之前（`RunSchema`方法）|之后（`Run`方法）|笔记|
| - | - | - |
| `run.id()` | `run.id()` |不变 |
| `run.name()` | `run.name()` |不变 |
| `run.runType()` | `run.runType()` |值现在为大写：`"LLM"`、`"CHAIN"` 等 |
| `run.status()` | `run.status()` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` |
| `run.startTime()` | `run.startTime()` |不变 |
| `run.endTime()` | `run.endTime()` |不变 |
| `run.error()` | `run.error()` |不变 |
| `run.inputs()` | `run.inputs()` |不变 |
| `run.outputs()` | `run.outputs()` |不变 |
| `run.tags()` | `run.tags()` |不变 |
| `run.extra()` | `run.extra()` |不变 |
| `run.events()` | `run.events()` |不变 |
| `run.feedbackStats()` | `run.feedbackStats()` |不变 |
| `run.inputsPreview()` | `run.inputsPreview()` |不变 |
| `run.outputsPreview()` | `run.outputsPreview()` |不变 |
| `run.referenceExampleId()` | `run.referenceExampleId()` |不变 |
| `run.traceId()` | `run.traceId()` |不变 |
| `run.dottedOrder()` | `run.dottedOrder()` |不变 |
| `run.parentRunId()` | *（已删除）* |使用`run.parentRunIds()`（所有祖先UUID的列表，根在前）|
| `run.parentRunIds()` | `run.parentRunIds()` |不变 |
| `run.sessionId()` | `run.projectId()` |更名； `sessionId()` 返回项目UUID |
| `run.appPath()` | `run.appPath()` |不变 |
| `run.firstTokenTime()` | `run.firstTokenTime()` |不变 |
| `run.totalTokens()` | `run.totalTokens()` |仅供自己使用；不再从子运行中求和|
| `run.promptTokens()` | `run.promptTokens()` |仅供自己使用；不再从子运行中求和|
| `run.completionTokens()` | `run.completionTokens()` |仅供自己使用；不再从子运行中求和|| `run.totalCost()` | `run.totalCost()` |返回类型由`Optional<String>`更改为`Optional<Double>`；仅供自己使用；不再从子运行中求和|
| `run.promptCost()` | `run.promptCost()` |返回类型由`Optional<String>`更改为`Optional<Double>`；仅供自己使用；不再从子运行中求和|
| `run.completionCost()` | `run.completionCost()` |返回类型由`Optional<String>`更改为`Optional<Double>`；仅供自己使用；不再从子运行中求和|
| `run.promptTokenDetails()` | `run.promptTokenDetails()` |不变 |
| `run.completionTokenDetails()` | `run.completionTokenDetails()` |不变 |
| `run.promptCostDetails()` | `run.promptCostDetails()` |不变 |
| `run.completionCostDetails()` | `run.completionCostDetails()` |不变 |
| `run.priceModelId()` | `run.priceModelId()` |不变 |
| `run.inDataset()` | `run.isInDataset()` |更名|
| `run.referenceDatasetId()` | `run.referenceDatasetId()` |不变 |
| `run.threadId()` | `run.threadId()` |不变 |
| `run.shareToken()` | *（已删除）* |使用`run.shareUrl()`（完整 URL，仅在共享运行时设置）|
| `run.childRunIds()` | *（已删除）* |没有同等的 |
| `run.directChildRunIds()` | *（已删除）* |没有同等的 |
| `run.serialized()` | *（已删除）* |使用`run.manifest()` |
| `run.manifestId()` | *（已删除）* |使用`run.manifest()` |
| `run.messages()` | *（已删除）* |没有同等的 |
| `run.executionOrder()` | *（已删除）* |没有同等的 |
| `run.lastQueuedAt()` | *（已删除）* |没有同等的 |
| `run.traceFirstReceivedAt()` | *（已删除）* |没有同等的 |
| `run.traceMaxStartTime()` | *（已删除）* |没有同等的 |
| `run.traceMinStartTime()` | *（已删除）* |没有同等的 |
| `run.traceTier()` | *（已删除）* |没有同等的 |
| `run.traceUpgrade()` | *（已删除）* |没有同等的 || `run.ttlSeconds()` | *（已删除）* |没有同等的 |
| *（不可用）* | `run.attachments()` |新功能：附件的预签名下载 URL（替换 S3 URL 字段）|
| *（不可用）* | `run.latencySeconds()` |新：挂钟持续时间（以秒为单位）|
| *（不可用）* | `run.isRoot()` |新 |
| *（不可用）* | `run.errorPreview()` |新：截断的错误片段 |
| *（不可用）* | `run.manifest()` |新：完整清单，键入为`Optional<Manifest>`（替换`serialized()`和`manifestId()`）|
| *（不可用）* | `run.metadata()` |新：元数据，类型为`Optional<Metadata>`（源自`extra.metadata`）|
| *（不可用）* | `run.shareUrl()` |新功能：公共共享 URL（仅在共享运行时设置）|
| *（不可用）* | `run.threadEvaluationTime()` |新 |

**去**

将`RunQueryV2ParamsSelect`常量（例如`RunQueryV2ParamsSelectName`、`RunQueryV2ParamsSelectStatus`）传递给`Selects`来控制填充哪些字段；未选择的字段在返回的结构上为零值。 `Selects` 默认为`ID`。|之前（`RunSchema`字段）|之后（`Run`字段）|笔记|
| - | - | - |
| `run.ID` | `run.ID` |不变 |
| `run.Name` | `run.Name` |不变 |
| `run.RunType` | `run.RunType` |值更改为大写：`"LLM"`、`"CHAIN"` 等 |
| `run.Status` | `run.Status` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` |
| `run.TraceID` | `run.TraceID` |不变 |
| `run.DottedOrder` | `run.DottedOrder` |不变 |
| `run.AppPath` | `run.AppPath` |不变 |
| `run.StartTime` | `run.StartTime` |不变 |
| `run.EndTime` | `run.EndTime` |不变 |
| `run.Error` | `run.Error` |不变 |
| `run.Events` | `run.Events` |不变；元素类型现在为 `RunEvent`（原为 `map[string]interface{}`）|
| `run.Extra` | `run.Extra` |不变；类型现在为 `interface{}`（原为 `map[string]interface{}`）|
| `run.FeedbackStats` | `run.FeedbackStats` |不变；元素类型现在为 `RunFeedbackStat` |
| `run.FirstTokenTime` | `run.FirstTokenTime` |不变 |
| `run.Inputs` | `run.Inputs` |不变；类型现在为 `interface{}`（原为 `map[string]interface{}`）|
| `run.InputsPreview` | `run.InputsPreview` |不变 |
| `run.Outputs` | `run.Outputs` |不变；类型现在为`interface{}`（原为`map[string]interface{}`）|
| `run.OutputsPreview` | `run.OutputsPreview` |不变 |
| `run.ParentRunIDs` | `run.ParentRunIDs` |不变 |
| `run.PriceModelID` | `run.PriceModelID` |不变 |
| `run.PromptCost` | `run.PromptCost` |仅供自己使用；不再从子运行中求和|
| `run.PromptCostDetails` | `run.PromptCostDetails.Raw` |字段现在包裹了地图；访问`.Raw`以获得`map[string]float64`（原为`map[string]string`）|
| `run.PromptTokenDetails` | `run.PromptTokenDetails.Raw` |字段现在包裹了地图；访问`.Raw`得到`map[string]int64`（元素类型不变）|| `run.PromptTokens` | `run.PromptTokens` |仅供自己使用；不再从子运行中求和|
| `run.CompletionCost` | `run.CompletionCost` |仅供自己使用；不再从子运行中求和|
| `run.CompletionCostDetails` | `run.CompletionCostDetails.Raw` |字段现在包裹了地图；访问`.Raw`以获得`map[string]float64`（原为`map[string]string`）|
| `run.CompletionTokenDetails` | `run.CompletionTokenDetails.Raw` |字段现在包裹了地图；访问`.Raw`得到`map[string]int64`（元素类型不变） |
| `run.CompletionTokens` | `run.CompletionTokens` |仅供自己使用；不再从子运行中求和|
| `run.TotalCost` | `run.TotalCost` |仅供自己使用；不再从子运行中求和|
| `run.TotalTokens` | `run.TotalTokens` |仅供自己使用；不再从子运行中求和|
| `run.ReferenceDatasetID` | `run.ReferenceDatasetID` |不变 |
| `run.ReferenceExampleID` | `run.ReferenceExampleID` |不变 |
| `run.Tags` | `run.Tags` |不变 |
| `run.ThreadID` | `run.ThreadID` |不变 |
| `run.SessionID` | `run.ProjectID` |更名|
| `run.InDataset` | `run.IsInDataset` |更名|
| `run.ChildRunIDs` | *（已删除）* |没有同等的 |
| `run.DirectChildRunIDs` | *（已删除）* |没有同等的 |
| `run.ExecutionOrder` | *（已删除）* |没有同等的 |
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
| `run.TraceMinStartTime` | *（已删除）* |没有同等的 |
| `run.TraceTier` | *（已删除）* |没有同等的 |
| `run.TraceUpgrade` | *（已删除）* |没有同等的 |
| `run.TtlSeconds` | *（已删除）* |没有同等的 |
| *（不可用）* | `run.Attachments` |新功能：将附件文件名映射到预签名的下载 URL |
| *（不可用）* | `run.ErrorPreview` |新：截断的错误片段 |
| *（不可用）* | `run.IsRoot` |新 |
| *（不可用）* | `run.LatencySeconds` |新：挂钟持续时间（以秒为单位）|
| *（不可用）* | `run.Manifest` |新：完整清单对象（替换`Serialized`和`ManifestID`）|
| *（不可用）* | `run.Metadata` |新功能：任意用户定义的 JSON 元数据 |
| *（不可用）* | `run.ShareURL` |新功能：公共共享 URL（仅在共享运行时设置）|
| *（不可用）* | `run.ThreadEvaluationTime` |新 |

**卷曲**

JSON 响应中的字段名称使用`snake_case`。在 `selects` JSON 数组中传递 SCREAMING\_SNAKE\_CASE 字符串（例如 `"ID"`、`"NAME"`、`"STATUS"`）来控制填充哪些字段。默认 `selects` 仅包含 `"ID"`。

|之前（v1 响应字段）|之后（v2 响应字段）|笔记|
| - | - | - |
| `id` | `id` |不变 |
| `name` | `name` |不变 |
| `run_type` | `run_type` |值更改为大写：`"LLM"`、`"CHAIN"` 等 |
| `status` | `status` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` |
| `trace_id` | `trace_id` |不变 |
| `dotted_order` | `dotted_order` |不变 |
| `app_path` | `app_path` |不变 |
| `start_time` | `start_time` |不变 |
| `end_time` | `end_time` |不变 |
| `error` | `error` |不变 |
| `events` | `events` |不变 |
| `extra` | `extra` |不变 |
| `feedback_stats` | `feedback_stats` |不变 |
| `first_token_time` | `first_token_time` |不变 |
| `inputs` | `inputs` |不变 |
| `inputs_preview` | `inputs_preview` |不变 |
| `outputs` | `outputs` |不变 |
| `outputs_preview` | `outputs_preview` |不变 |
| `parent_run_ids` | `parent_run_ids` |不变 |
| `price_model_id` | `price_model_id` |不变 |
| `prompt_cost` | `prompt_cost` |仅供自己使用；不再从子运行中求和|
| `prompt_cost_details` | `prompt_cost_details.raw` | Field 现在包裹了对象；读取 `.raw` 以获得相同的 `{category: cost}` 映射，现在带有数值（是字符串）|| `prompt_token_details` | `prompt_token_details.raw` | Field 现在包裹了对象；读取 `.raw` 以获得相同的 `{category: count}` 映射（值不变） |
| `prompt_tokens` | `prompt_tokens` |仅供自己使用；不再从子运行中求和|
| `completion_cost` | `completion_cost` |仅供自己使用；不再从子运行中求和|
| `completion_cost_details` | `completion_cost_details.raw` | Field 现在包裹了对象；阅读 `.raw` 以获得相同的 `{category: cost}` 映射，现在带有数字值（是字符串）|
| `completion_token_details` | `completion_token_details.raw` | Field 现在包裹了对象；读取 `.raw` 以获得相同的 `{category: count}` 映射（值不变） |
| `completion_tokens` | `completion_tokens` |仅供自己使用；不再从子运行中求和|
| `total_cost` | `total_cost` |仅供自己使用；不再从子运行中求和|
| `total_tokens` | `total_tokens` |仅供自己使用；不再从子运行中求和|
| `reference_dataset_id` | `reference_dataset_id` |不变 |
| `reference_example_id` | `reference_example_id` |不变 |
| `tags` | `tags` |不变 |
| `thread_id` | `thread_id` |不变 |
| `session_id` | `project_id` |更名|
| `in_dataset` | `is_in_dataset` |更名|
| `child_run_ids` | *（已删除）* |没有同等的 |
| `direct_child_run_ids` | *（已删除）* |没有同等的 |
| `execution_order` | *（已删除）* |没有同等的 |
| `inputs_s3_urls` | *（已删除）* |内部存储URL； v2 中未公开 |
| `last_queued_at` | *（已删除）* |没有同等的 |
| `manifest_id` | *（已删除）* |使用`manifest` || `manifest_s3_id` | *（已删除）* |内部存储URL； v2 中未公开 |
| `messages` | *（已删除）* |没有同等的 |
| `outputs_s3_urls` | *（已删除）* |内部存储URL； v2 中未公开 |
| `parent_run_id` | *（已删除）* |使用`parent_run_ids` |
| `s3_urls` | *（已删除）* |内部存储URL； v2 中未公开 |
| `serialized` | *（已删除）* |使用`manifest`|
| `share_token` | *（已删除）* |使用`share_url` |
| `trace_first_received_at` | *（已删除）* |没有同等的 |
| `trace_max_start_time` | *（已删除）* |没有同等的 |
| `trace_min_start_time` | *（已删除）* |没有同等的 |
| `trace_tier` | *（已删除）* |没有同等的 |
| `trace_upgrade` | *（已删除）* |没有同等的 |
| `ttl_seconds` | *（已删除）* |没有同等的 |
| *（不可用）* | `attachments` |新功能：将附件文件名映射到预签名的下载 URL |
| *（不可用）* | `error_preview` |新：截断的错误片段 |
| *（不可用）* | `is_root` |新 |
| *（不可用）* | `latency_seconds` |新：挂钟持续时间（以秒为单位）|
| *（不可用）* | `manifest` |新：完整清单对象（替换`serialized`和`manifest_id`）|
| *（不可用）* | `metadata` |新：之前嵌套在 `extra.metadata` | 下
| *（不可用）* | `share_url` |新功能：公共共享 URL（仅在共享运行时设置）|
| *（不可用）* | `thread_evaluation_time` |新 |

#### 速率限制SmithDB 支持的方法具有比它所替代的方法更高的专用速率限制。每个 API 密钥在云中均存在限制。

**Python**

| |之前 (`client.list_runs()`) |之后（`client.runs.query()`）|
| - | - | - |
|限制|每 10 秒 10 个请求 |每 10 秒 300 个请求 |

**打字稿**

| |之前 (`client.listRuns()`) |之后（`client.runs.query()`）|
| - | - | - |
|限制|每 10 秒 10 个请求 |每 10 秒 300 个请求 |

**Java**

| |之前 (`client.runs().query()`) |之后（`client.runs().queryV2()`）|
| - | - | - |
|限制|每 10 秒 10 个请求 |每 10 秒 300 个请求 |

**去**

| |之前 (`client.Runs.Query()`) |之后 (`client.Runs.QueryV2()`) |
| - | - | - |
|限制|每 10 秒 10 个请求 |每 10 秒 300 个请求 |

**卷曲**

| |之前 (`POST /api/v1/runs/query`) |之后（`POST /api/v2/runs/query`）|
| - | - | - |
|限制|每 10 秒 10 个请求 |每 10 秒 300 个请求 |

已弃用的方法还受到每个租户的限制，这些限制因查询形状而异，如 [Query traces using the SDK](/langsmith/export-traces#rate-limits) 中所述。 SmithDB 支持的方法不受这些每个租户的限制。

超过限制的请求将返回`429 Too Many Requests`。有关一般速率限制信息，请参阅[Usage and billing](/langsmith/usage-and-billing#rate-limits)。

### 示例

#### 列出项目中的所有运行

**Python**`runs.query` 不直接接受项目名称。首先用`client.aread_project()`解析项目UUID，然后将其作为字符串传递到`project_ids`。

**之前**

```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client

client = Client()
runs = client.list_runs(project_name="default")
```

**之后**

```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

from langsmith import Client


async def main():
    client = Client()
    project = await client.aread_project(project_name="default")
    runs = client.runs.query(project_ids=[str(project.id)])


asyncio.run(main())
```

**打字稿**

`client.runs.query` 不直接接受项目名称。首先用`client.readProject()`解析项目UUID，然后将其作为字符串传递到`project_ids`。

**之前**

```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const runs = client.listRuns({ projectName: "default" });
```

**之后**

```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const project = await client.readProject({ projectName: "default" });
const runs = client.runs.query({ project_ids: [project.id] });
```

**Java**

`queryV2()` 不直接接受项目名称。首先用`client.sessions().list()`解析项目UUID，然后将其作为字符串传递到`projectIds()`。

**之前**

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

**之后**

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

**去**

`QueryV2()` 不直接接受项目名称。首先用`client.Sessions.List()`解析项目UUID，然后将其作为字符串传递到`ProjectIDs`。

**之前**

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

**之后**

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

**卷曲**

`POST /api/v2/runs/query` 不直接接受项目名称。首先使用 `GET /api/v1/sessions` 请求解析项目 UUID，然后将其作为字符串传递到 `project_ids` 中。对于代理环境、实验或评估者，[resolve it](/langsmith/resolve-an-agent)（处于测试阶段）可获取项目 UUID。

**之前**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
  -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid]}')"
```

**之后**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
  -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

curl -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg pid "$PROJECT_ID" '{"project_ids": [$pid]}')"
```

#### 选择字段

**Python**`list_runs` 返回一组默认字段，无需选择。默认情况下，`runs.query` 仅返回 `id` — 通过 `selects=[...]` ​​请求更多。字段名称现在为大写 (`"name"` → `"NAME"`)。

**之前**

```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client

client = Client()
# returns a default set of fields; no explicit selection needed
runs = client.list_runs(project_name="default")
for run in runs:
    print(run.id, run.name, run.run_type, run.status, run.start_time, run.inputs, run.error)
```

**之后**

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

**打字稿**

`listRuns` 返回一组默认字段，无需选择。默认情况下，`client.runs.query` 仅返回 `id` — 通过 `selects: [...]` 请求更多。字段名称现在为大写 (`"name"` → `"NAME"`)。

**之前**

```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
// returns a default set of fields; no explicit selection needed
const runs = client.listRuns({ projectName: "default" });
for await (const run of runs) {
  console.log(run.id, run.name, run.run_type, run.status, run.start_time, run.inputs, run.error);
}
```

**之后**

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

**Java**

`query()` 返回一组默认字段，无需选择。默认情况下，`queryV2()` 仅返回 `id`，为您需要的每个字段调用 `.addSelect(RunQueryV2Params.Select.X)`。

**之前**

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

**之后**

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

**去**

`Query` 返回一组默认字段，无需选择。默认情况下，`QueryV2` 仅返回 `ID` — 将 `Selects` 与您需要的大写字段常量一起传递（例如 `RunQueryV2ParamsSelectName`）。

**之前**

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

**之后**

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

**卷曲**

`POST /api/v1/runs/query` 返回一组默认字段，无需选择。默认情况下，`POST /api/v2/runs/query` 仅返回 `id` — 传递 `selects` 以及您需要的大写字段名称（例如 `"NAME"`）。

**之前**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
  -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid]}')"
```

**之后**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
  -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

curl -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg pid "$PROJECT_ID" '{"project_ids": [$pid], "selects": ["ID", "NAME", "RUN_TYPE", "STATUS", "START_TIME", "INPUTS", "ERROR"]}')"
```

#### 按运行类型和时间范围过滤

**Python**`start_time` 已重命名为 `min_start_time`，`run_type` 值现在为大写 (`"llm"` → `"LLM"`)。

**之前**

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

**之后**

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

**打字稿**

`startTime` (camelCase) 变为`min_start_time`（snake\_case，匹配 v2 请求正文），`runType` 值现在为大写 (`"llm"` → `"LLM"`)。

**之前**

```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const runs = client.listRuns({
  projectName: "default",
  startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
  runType: "llm",
});
```

**之后**

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

**Java**

`.startTime()` 重命名为 `.minStartTime()`，`.runType()` 现在采用新的 `RunQueryV2Params.RunType` 枚举而不是 `RunTypeEnum`。

**之前**

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

**之后**

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

**去**

`StartTime` 重命名为 `MinStartTime`，`RunType` 现在采用新的 `RunQueryV2ParamsRunType` 枚举而不是 `RunTypeEnum`。

**之前**

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

**之后**

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

**卷曲**

`start_time` 重命名为 `min_start_time`，`run_type` 值现在为大写 (`"llm"` → `"LLM"`)。

**之前**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
  -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid], "run_type": "llm", "start_time": "2025-01-01T00:00:00Z"}')"
```

**之后**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
  -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

curl -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg pid "$PROJECT_ID" '{"project_ids": [$pid], "run_type": "LLM", "min_start_time": "2025-01-01T00:00:00Z"}')"
```

#### 过滤器根仅运行

**Python**

`is_root` 不变。

**之前**

```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client

client = Client()
runs = client.list_runs(project_name="default", is_root=True)
```

**之后**

```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

from langsmith import Client


async def main():
    client = Client()
    project = await client.aread_project(project_name="default")
    runs = client.runs.query(project_ids=[str(project.id)], is_root=True)


asyncio.run(main())
```

**打字稿**

`isRoot` (camelCase) 变为 `is_root` (snake\_case, 匹配 v2 请求正文)。

**之前**

```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const runs = client.listRuns({ projectName: "default", isRoot: true });
```

**之后**

```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const project = await client.readProject({ projectName: "default" });
const runs = client.runs.query({
  project_ids: [project.id],
  is_root: true,
});
```

**Java**

`.isRoot()` 不变。

**之前**

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

**之后**

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

**去**

`IsRoot` 不变。

**之前**

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

**之后**

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

**卷曲**

`is_root` 不变。

**之前**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
  -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid], "is_root": true}')"
```

**之后**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
  -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

curl -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg pid "$PROJECT_ID" '{"project_ids": [$pid], "is_root": true}')"
```> [!警告]
>
> 要列出跟踪，请使用 `traces.query` 而不是 `is_root=True`。从 `runs.query` 开始的根运行不携带跟踪范围的令牌或成本总计：它们的令牌和成本字段仅涵盖根运行自己的使用情况，并且当根未进行模型调用时为空。 `traces.query` 返回 `trace_aggregates` 下的跟踪范围 `total_tokens` 和 `total_cost`。参见[Traces: query](/langsmith/smithdb-sdk-migration-traces)。

#### 通过 ID 列表获取运行

**Python**

`id=[...]` 更名为`ids=[...]`。即使按运行 ID 进行过滤，现在也需要 `project_ids` — v1 允许省略项目上下文。

**之前**

```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client

client = Client()
runs = client.list_runs(id=["<run-id-1>", "<run-id-2>"])
```

**之后**

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

**打字稿**

`id: [...]` 更名为 `ids: [...]`。即使按运行 ID 进行过滤，现在也需要 `project_ids` — v1 允许省略项目上下文。

**之前**

```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const runs = client.listRuns({ id: ["<run-id-1>", "<run-id-2>"] });
```

**之后**

```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const project = await client.readProject({ projectName: "default" });
const runs = client.runs.query({
  project_ids: [project.id],
  ids: ["<run-id-1>", "<run-id-2>"],
});
```

**Java**

`.addId(...)` 未更改 - 每个运行 ID 调用一次。即使按运行 ID 进行过滤，现在也需要 `.addProjectId(...)` — v1 允许省略项目上下文。

**之前**

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

**之后**

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

**去**

`ID: [...]` 更名为 `IDs: [...]`。即使按运行 ID 进行过滤，现在也需要 `ProjectIDs` — v1 允许省略项目上下文。

**之前**

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

**之后**

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

**卷曲**`id` 更名为`ids`。现在，即使按运行 ID 进行过滤，请求正文中也需要 `project_ids` — v1 允许省略项目上下文。

**之前**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RUN_ID_1="<run-id-1>"
RUN_ID_2="<run-id-2>"

curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg r1 "$RUN_ID_1" --arg r2 "$RUN_ID_2" '{"id": [$r1, $r2]}')"
```

**之后**

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

#### 迭代运行

**Python**

`list_runs` 透明地自动分页，每个 API 调用最多获取 100 次运行，并在返回 `limit` 结果后停止。 `runs.query`不接受总计`limit`；一旦足够，就使用 `async for` 和 `break` 进行迭代，或者使用返回页面的 `has_next_page()`/`get_next_page()` 进行手动逐页控制。

**之前**

```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client

client = Client()
runs = client.list_runs(project_name="default", limit=150)
```

**之后**

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

**打字稿**

`listRuns` 透明地自动分页。 `client.runs.query` 返回单个运行的异步迭代 - 一旦你有足够的，就使用 `for await` 和 `break`。

**之前**

```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const runs: unknown[] = [];
for await (const run of client.listRuns({ projectName: "default" })) {
  runs.push(run);
  if (runs.length >= 150) break;
}
```

**之后**

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

**Java**

`.autoPager()` 在 `query()` 和 `queryV2()` 上的使用方式相同——一旦运行足够多，就跳出循环。

**之前**

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

**之后**

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

**去**

`QueryAutoPaging`更名为`QueryV2AutoPaging`；两者都使用相同的`iter.Next()`/`iter.Current()`模式——一旦你有足够的运行就跳出循环。

**之前**

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

**之后**

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

**卷曲**v1 API 在一个响应中返回所有匹配的运行，不带光标。 v2 API 分页 — 从响应的 `next_cursor` 字段传递 `cursor` 以获取下一页。

**之前**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
  -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid], "limit": 150}')"
```

**之后**

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

#### 过滤器运行时出现错误

**Python**

`error=True/False` 更名为 `has_error=True/False`。

**之前**

```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client

client = Client()
runs = client.list_runs(project_name="default", error=True)
```

**之后**

```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

from langsmith import Client


async def main():
    client = Client()
    project = await client.aread_project(project_name="default")
    runs = client.runs.query(project_ids=[str(project.id)], has_error=True)


asyncio.run(main())
```

**打字稿**

`error: true/false` 更名为`has_error: true/false`。

**之前**

```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const runs = client.listRuns({ projectName: "default", error: true });
```

**之后**

```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const project = await client.readProject({ projectName: "default" });
const runs = client.runs.query({
  project_ids: [project.id],
  has_error: true,
});
```

**Java**

`.error(true/false)` 更名为`.hasError(true/false)`。

**之前**

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

**之后**

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

**去**

`Error` 更名为 `HasError`。

**之前**

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

**之后**

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

**卷曲**

`error` 更名为 `has_error`。

**之前**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
  -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg pid "$PROJECT_ID" '{"session": [$pid], "error": true}')"
```

**之后**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
  -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

curl -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg pid "$PROJECT_ID" '{"project_ids": [$pid], "has_error": true}')"
```

#### 按元数据过滤

**Python**

`filter` 字符串语法保持不变：`eq(metadata_key, ...)` 检查键是否存在，与 `eq(metadata_value, ...)` 组合以匹配特定值。

**之前**

```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client

client = Client()
filter_str = 'and(eq(metadata_key, "user_id"), eq(metadata_value, "u_123"))'
runs = client.list_runs(project_name="default", filter=filter_str)
```

**之后**

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

**打字稿**

`filter` 字符串语法保持不变：`eq(metadata_key, ...)` 检查键是否存在，与 `eq(metadata_value, ...)` 组合以匹配特定值。

**之前**

```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const filterStr = 'and(eq(metadata_key, "user_id"), eq(metadata_value, "u_123"))';
const runs = client.listRuns({ projectName: "default", filter: filterStr });
```

**之后**

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

**Java**

`.filter(...)` 字符串语法保持不变：`eq(metadata_key, ...)` 检查键是否存在，与 `eq(metadata_value, ...)` 结合以匹配特定值。

**之前**

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

**之后**

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

**去**`Filter` 字符串语法保持不变：`eq(metadata_key, ...)` 检查键是否存在，与 `eq(metadata_value, ...)` 组合以匹配特定值。

**之前**

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

**之后**

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

**卷曲**

`filter` 字符串语法保持不变：`eq(metadata_key, ...)` 检查键是否存在，与 `eq(metadata_value, ...)` 结合以匹配特定值。

**之前**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
  -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

FILTER='and(eq(metadata_key, "user_id"), eq(metadata_value, "u_123"))'

curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg pid "$PROJECT_ID" --arg f "$FILTER" '{"session": [$pid], "filter": $f}')"
```

**之后**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
  -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

FILTER='and(eq(metadata_key, "user_id"), eq(metadata_value, "u_123"))'

curl -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg pid "$PROJECT_ID" --arg f "$FILTER" '{"project_ids": [$pid], "filter": $f}')"
```

#### 复杂布尔过滤器

嵌套 `and()` / `or()` 过滤表达式仍然有效。将 `or()` 操作数保留在同一字段类型上：SmithDB 拒绝在一个表达式中跨运行字段和反馈字段进行 OR 运算（例如将 `status` 与 `feedback_key` 混合）。

**Python**

**之前**

```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client

client = Client()
filter_str = (
    'and(gt(start_time, "2023-07-15T12:34:56Z"),'
    ' or(eq(status, "error"), eq(run_type, "llm")))'
)
runs = client.list_runs(project_name="default", filter=filter_str)
```

**之后**

```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

from langsmith import Client


async def main():
    client = Client()
    filter_str = (
        'and(gt(start_time, "2023-07-15T12:34:56Z"),'
        ' or(eq(status, "error"), eq(run_type, "llm")))'
    )
    project = await client.aread_project(project_name="default")
    runs = client.runs.query(project_ids=[str(project.id)], filter=filter_str)


asyncio.run(main())
```

**打字稿**

**之前**

```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const filterStr =
  'and(gt(start_time, "2023-07-15T12:34:56Z"),' +
  ' or(eq(status, "error"), eq(run_type, "llm")))';
const runs = client.listRuns({ projectName: "default", filter: filterStr });
```

**之后**

```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();
const filterStr =
  'and(gt(start_time, "2023-07-15T12:34:56Z"),' +
  ' or(eq(status, "error"), eq(run_type, "llm")))';
const project = await client.readProject({ projectName: "default" });
const runs = client.runs.query({
  project_ids: [project.id],
  filter: filterStr,
});
```

**Java**

**之前**

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
    " or(eq(status, \"error\"), eq(run_type, \"llm\")))"
val runs = client.runs().query(
    RunQueryParams.builder().addSession(project.id()).filter(filterStr).build()
).items()
```

**之后**

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
    " or(eq(status, \"error\"), eq(run_type, \"llm\")))"
val runs = client.runs().queryV2(
    RunQueryV2Params.builder().addProjectId(project.id()).filter(filterStr).build()
).items()
```

**去**

**之前**

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

filterStr := `and(gt(start_time, "2023-07-15T12:34:56Z"), or(eq(status, "error"), eq(run_type, "llm")))`
runs, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
	Session: langsmith.F([]string{project.ID}),
	Filter:  langsmith.F(filterStr),
})
```

**之后**

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

filterStr := `and(gt(start_time, "2023-07-15T12:34:56Z"), or(eq(status, "error"), eq(run_type, "llm")))`
runs, err := client.Runs.QueryV2(ctx, langsmith.RunQueryV2Params{
	ProjectIDs: langsmith.F([]string{project.ID}),
	Filter:     langsmith.F(filterStr),
})
```

**卷曲**

**之前**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
  -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

FILTER='and(gt(start_time, "2023-07-15T12:34:56Z"), or(eq(status, "error"), eq(run_type, "llm")))'

curl -X POST "https://api.smith.langchain.com/api/v1/runs/query" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg pid "$PROJECT_ID" --arg f "$FILTER" '{"session": [$pid], "filter": $f}')"
```

**之后**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
PROJECT_ID=$(curl -s "https://api.smith.langchain.com/api/v1/sessions?name=default&limit=1" \
  -H "x-api-key: $LANGSMITH_API_KEY" | jq -r '.[0].id')

FILTER='and(gt(start_time, "2023-07-15T12:34:56Z"), or(eq(status, "error"), eq(run_type, "llm")))'

curl -X POST "https://api.smith.langchain.com/api/v2/runs/query" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg pid "$PROJECT_ID" --arg f "$FILTER" '{"project_ids": [$pid], "filter": $f}')"
```

#### 作用域过滤器：filter、trace\_filter、tree\_filter

**Python**

`filter`、`trace_filter` 和 `tree_filter` 不变。 `filter` 适用于匹配的运行，`trace_filter` 应用于其跟踪的根，`tree_filter` 应用于跟踪树中的其他运行（同级和子级）。

**之前**

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

**之后**

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

**打字稿**`filter`、`trace_filter` 和 `tree_filter` 保持不变。 `filter` 适用于匹配的运行，`trace_filter` 应用于其跟踪的根，`tree_filter` 应用于跟踪树中的其他运行（同级和子级）。

**之前**

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

**之后**

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

**Java**

`.filter()`、`.traceFilter()` 和 `.treeFilter()` 不变。 `filter` 适用于匹配的运行，`traceFilter` 应用于其跟踪的根，`treeFilter` 应用于跟踪树中的其他运行（同级和子级）。

**之前**

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

**之后**

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

**去**

`Filter`、`TraceFilter` 和 `TreeFilter` 不变。 `Filter` 适用于匹配的运行，`TraceFilter` 应用于其跟踪的根，`TreeFilter` 应用于跟踪树中的其他运行（同级和子级）。

**之前**

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

**之后**

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

**卷曲**

`filter`、`trace_filter` 和 `tree_filter` 不变。 `filter` 适用于匹配的运行，`trace_filter` 应用于其跟踪的根，`tree_filter` 应用于跟踪树中的其他运行（同级和子级）。

**之前**

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

**之后**

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

## 另请参阅

* [Retrieve runs](/langsmith/smithdb-sdk-migration-runs)
* [Traces](/langsmith/smithdb-sdk-migration-traces)
* [Migration overview](/langsmith/smithdb-sdk-migration)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/smithdb-sdk-migration-query-runs.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。