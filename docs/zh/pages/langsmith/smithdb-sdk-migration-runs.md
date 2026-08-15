<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Migrate run retrieval to SmithDB | https://docs.langchain.com/langsmith/smithdb-sdk-migration-runs -->

# 将运行检索迁移到 SmithDB

迁移检索单个运行或构建运行 URL 的 LangSmith SDK 方法。

这些方法读取单个运行或构建到一个运行的链接。要迁移运行查询，请参阅[Query runs](/langsmith/smithdb-sdk-migration-query-runs)。有关弃用日期和最低 SDK 版本的信息，请参阅 [Migrate to SmithDB-backed SDK methods](/langsmith/smithdb-sdk-migration)。

## 运行：检索

按 ID 获取单个运行。默认情况下仅返回运行 ID — 指定字段选择列表以检索其他数据。

### 主要变化

#### 方法名称

<Tabs>
  <Tab title="Python">
    |之前 |之后|
    | ------------------- | ------------------------ |
    | `client.read_run()` | `client.runs.retrieve()` |

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
  </Tab><Tab title="Go">
    |之前 |之后|
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
</Tabs>

#### 查询参数

<Tabs>
  <Tab title="Python">
    <Warning>
      `runs.retrieve` 需要一个新的 `project_id` 字段，而 `read_run` 不需要。它还接受可选的 `start_time` — 前提是它可以加快检索速度，但这不是必需的。
    </Warning>|之前 (`read_run`) |之后(`runs.retrieve`)|笔记|
    | ---------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
    | `run_id` | `run_id` |不变 |
    | `load_child_runs` | *（已删除）* |使用 `traces.list_runs` 获取跟踪的运行并按 `parent_run_ids` 进行过滤。参见[Load a run's child runs](#load-a-runs-child-runs)|
    | *（不可用）* | `project_id` | **必需** - 拥有运行的项目的 UUID |
    | *（不可用）* | `start_time` |可选 — 运行的开始时间 (RFC3339)；提供它可以加快检索速度|| *（默认返回所有字段）* | `selects` |现场投影；仅默认为`["ID"]`；字段名称均为大写 |
  </Tab>

  <Tab title="TypeScript">
    <Warning>
      `client.runs.retrieve` 需要一个新的 `project_id` 字段，而 `readRun` 不需要。它还接受可选的 `start_time` — 前提是它可以加快检索速度，但这不是必需的。
    </Warning>

    |之前 (`readRun`) |之后(`client.runs.retrieve`) |笔记|
    | ---------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `runId` | `runId` |不变（位置参数）|
    | `options.loadChildRuns` | *（已删除）* |使用 `client.traces.listRuns` 获取跟踪的运行并按 `parent_run_ids` 进行过滤。参见[Load a run's child runs](#load-a-runs-child-runs) || *（不可用）* | `project_id` | **必填**—`snake_case`；拥有运行的项目的 UUID |
    | *（不可用）* | `start_time` |可选—`snake_case`；运行的开始时间（RFC3339）；提供它可以加快检索速度|
    | *（默认返回所有字段）* | `selects` |现场投影；仅默认为`["ID"]`；字段名称均为大写 |
  </Tab>

  <Tab title="Java">
    <Warning>
      `retrieveV2()` 需要 `projectId()`，它取代了已删除的 `sessionId()`。 `startTime()` 仍然是可选的——只要它可以加快检索速度，但不是必需的。
    </Warning>|之前 (`RunRetrieveParams`) |之后（`RunRetrieveV2Params`）|笔记|
    | ---------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
    | `runId()` | `runId()` |不变 |
    | `sessionId()` | *（已删除）* |替换为`projectId()`|
    | `startTime()` | `startTime()` |仍然是可选的；提供它可以加快检索速度|
    | `excludeS3StoredAttributes()` | *（已删除）* |没有同等的|
    | `excludeSerialized()` | *（已删除）* |没有同等的|
    | `includeMessages()` | *（已删除）* |没有同等的|| *（不可用）* | `projectId()` | **必需** - 拥有运行的项目的 UUID |
    | *（默认返回所有字段）* | `selects()` |现场投影；仅默认为`["ID"]`；字段名称均为大写 |
  </Tab>

  <Tab title="Go">
    <Warning>
      `GetV2()` 需要 `ProjectID`，它取代了已删除的 `SessionID`。 `StartTime` 仍然是可选的——只要它可以加快检索速度，但不是必需的。
    </Warning>

    |之前 (`RunGetParams`) |之后(`RunGetV2Params`)|笔记|
    | ---------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
    | `runID`（位置）| `runID`（位置）|不变 |
    | `ExcludeS3StoredAttributes` | *（已删除）* |没有同等的|| `ExcludeSerialized` | *（已删除）* |没有同等的|
    | `IncludeMessages` | *（已删除）* |没有同等的|
    | `SessionID` | *（已删除）* |替换为`ProjectID` |
    | `StartTime` | `StartTime` |仍然是可选的；提供它可以加快检索速度|
    | *（不可用）* | `ProjectID` | **必需** - 拥有运行的项目的 UUID |
    | *（默认返回所有字段）* | `Selects` |现场投影；仅默认为`["ID"]`；字段名称常量为大写（例如，`RunGetV2ParamsSelectName`）|
  </Tab>

  <Tab title="cURL">
    `run_id` 保留在 URL 路径中。所有其他参数都是具有 `snake_case` 名称的查询字符串值。<Warning>
      `GET /api/v2/runs/{run_id}` 需要新的 `project_id` 查询参数。 `start_time` 仍然是可选的——只要它可以加快检索速度，但不是必需的。
    </Warning>

    |之前（`GET /api/v1/runs/{run_id}`参数）| (`GET /api/v2/runs/{run_id}`参数)之后|笔记|
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
    | `run.run_type` | `run.run_type` |值现在为大写文字：`"LLM"`、`"CHAIN"` 等。| `run.status` | `run.status` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` |
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
    | `run.app_path` | `run.app_path` |不变 |
    | `run.attachments` | `run.attachments` | v2 返回预签名的下载 URL，而不是原始字节 || `run.total_tokens` | `run.total_tokens` |不变 |
    | `run.prompt_tokens` | `run.prompt_tokens` |不变 |
    | `run.completion_tokens` | `run.completion_tokens` |不变 |
    | `run.total_cost` | `run.total_cost` |不变 |
    | `run.prompt_cost` | `run.prompt_cost` |不变 |
    | `run.completion_cost` | `run.completion_cost` |不变 |
    | `run.first_token_time` | `run.first_token_time` |不变 || `run.latency`（属性）| `run.latency_seconds` |更名；是一个计算的 `timedelta` 属性，现在是一个原生的 `float` 字段 |
    | `run.in_dataset` | `run.is_in_dataset` |更名|
    | `run.child_run_ids` | *（已删除）* |过滤 `parent_run_ids` 上的跟踪运行。请参阅[Load a run's child runs](#load-a-runs-child-runs) |
    | `run.child_runs` | *（已删除）* |按 `parent_run_ids` 中的最后一个条目对跟踪运行进行分组。参见[Load a run's child runs](#load-a-runs-child-runs)|
    | `run.serialized` | *（已删除）* |使用`run.manifest` |
    | `run.manifest_id` | *（已删除）* |使用`run.manifest`|
    | *（不可用）* | `run.is_root` |新 || *（不可用）* | `run.manifest` |新：完整清单对象（替换`serialized`和`manifest_id`）|
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
    将 SCREAMING\_SNAKE\_CASE 字符串传递给 `selects`（例如 `"ID"`、`"NAME"`、`"STATUS"`）以控制返回的 `Run` 上填充哪些字段。默认 `selects` 仅包含 `"ID"`。|之前（v1 `Run` 属性）|之后（v2 `Run` 属性）|笔记|
    | -------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
    | `run.id` | `run.id` |不变 |
    | `run.name` | `run.name` |不变 |
    | `run.runType` | `run.run_type` |更名为`snake_case`；值现在为大写：`"LLM"`、`"CHAIN"` 等 |
    | `run.status` | `run.status` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` || `run.startTime` | `run.start_time` |更名为`snake_case` |
    | `run.endTime` | `run.end_time` |更名为`snake_case` |
    | `run.error` | `run.error` |不变 |
    | `run.inputs` | `run.inputs` |不变 |
    | `run.outputs` | `run.outputs` |不变 |
    | `run.tags` | `run.tags` |不变 || `run.extra` | `run.extra` |不变 |
    | *（不可用）* | `run.metadata` |新：之前通过 `run.extra.metadata` 访问过 |
    | `run.events` | `run.events` |不变 |
    | `run.referenceExampleId` | `run.reference_example_id` |更名为`snake_case` |
    | `run.traceId` | `run.trace_id` |更名为`snake_case` |
    | `run.dottedOrder` | `run.dotted_order` |更名为`snake_case` |
    | `run.parentRunId` | *（已删除）* |使用`run.parent_run_ids`（所有祖先UUID的列表，根在前）|| `run.parentRunIds` | `run.parent_run_ids` |更名为`snake_case` |
    | `run.sessionId` | `run.project_id` |更名； `sessionId` 是项目 UUID |
    | `run.feedbackStats` | `run.feedback_stats` |更名为`snake_case` |
    | `run.appPath` | `run.app_path` |更名为`snake_case` |
    | `run.attachments` | `run.attachments` | v2 返回预签名的下载 URL，而不是原始字节 |
    | `run.totalTokens` | `run.total_tokens` |更名为`snake_case` |
    | `run.promptTokens` | `run.prompt_tokens` |更名为`snake_case` || `run.completionTokens` | `run.completion_tokens` |更名为`snake_case` |
    | `run.totalCost` | `run.total_cost` |更名为`snake_case` |
    | `run.promptCost` | `run.prompt_cost` |更名为`snake_case` |
    | `run.completionCost` | `run.completion_cost` |更名为`snake_case` |
    | `run.firstTokenTime` | `run.first_token_time` |更名为`snake_case` |
    | `run.latency` | `run.latency_seconds` |更名；是一个计算属性，现在是一个本机 `number` 字段（秒） |
    | `run.inDataset` | `run.is_in_dataset` |更名|| `run.child_run_ids` | *（已删除）* |过滤 `parent_run_ids` 上的跟踪运行。请参阅[Load a run's child runs](#load-a-runs-child-runs) |
    | `run.child_runs` | *（已删除）* |按 `parent_run_ids` 中的最后一个条目对跟踪运行进行分组。参见[Load a run's child runs](#load-a-runs-child-runs) |
    | `run.serialized` | *（已删除）* |使用`run.manifest` |
    | `run.manifestId` | *（已删除）* |使用`run.manifest` |
    | `run.shareToken` | *（已删除）* |使用`run.share_url`（完整URL，仅在共享运行时设置）|
    | *（不可用）* | `run.is_root` |新 |
    | *（不可用）* | `run.manifest` |新：完整清单对象（替换`serialized`和`manifestId`）|| *（不可用）* | `run.error_preview` |新：截断的错误片段 |
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
    通过`.addSelect(...)`添加`RunRetrieveV2Params.Select`值（例如`Select.NAME`、`Select.STATUS`）来控制填充哪些字段；未选择的字段返回空 `Optional` 值。 `selects()` 仅默认为 `ID`。|之前（`RunSchema`方法）|之后（`Run`方法）|笔记|
    | ------------------------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
    | `run.id()` | `run.id()` |不变 |
    | `run.name()` | `run.name()` |不变 |
    | `run.runType()` | `run.runType()` |值现在为大写：`"LLM"`、`"CHAIN"` 等 |
    | `run.status()` | `run.status()` |值：`"SUCCESS"`、`"ERROR"`、`"PENDING"` |
    | `run.startTime()` | `run.startTime()` |不变 || `run.endTime()` | `run.endTime()` |不变 |
    | `run.error()` | `run.error()` |不变 |
    | `run.inputs()` | `run.inputs()`​​ |不变 |
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
    | `run.referenceDatasetId()` | `run.referenceDatasetId()` |不变 |
    | `run.threadId()` | `run.threadId()` |不变 || `run.shareToken()` | *（已删除）* |使用`run.shareUrl()`（完整 URL，仅在共享运行时设置）|
    | `run.childRunIds()` | *（已删除）* |没有同等的|
    | `run.directChildRunIds()` | *（已删除）* |没有同等的|
    | `run.serialized()` | *（已删除）* |使用`run.manifest()`|
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
    将`RunGetV2ParamsSelect`常量（例如`RunGetV2ParamsSelectName`、`RunGetV2ParamsSelectStatus`）传递给`Selects`来控制填充哪些字段；未选择的字段在返回的结构上为零值。 `Selects` 默认为`ID`。

    |之前（`RunSchema`字段）|之后（`Run`字段）|笔记|
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
    | `run.Extra` | `run.Extra` |不变；类型现在为`interface{}`（原为`map[string]interface{}`）|| `run.FeedbackStats` | `run.FeedbackStats` |不变；元素类型现在为 `RunFeedbackStat` |
    | `run.FirstTokenTime` | `run.FirstTokenTime` |不变 |
    | `run.Inputs` | `run.Inputs` |不变；类型现在为 `interface{}`（原为 `map[string]interface{}`）|
    | `run.InputsPreview` | `run.InputsPreview` |不变 |
    | `run.Outputs` | `run.Outputs` |不变；类型现在为`interface{}`（原为`map[string]interface{}`）|
    | `run.OutputsPreview` | `run.OutputsPreview` |不变 |
    | `run.ParentRunIDs` | `run.ParentRunIDs` |不变 |
    | `run.PriceModelID` | `run.PriceModelID` |不变 || `run.PromptCost` | `run.PromptCost` |不变 |
    | `run.PromptCostDetails` | `run.PromptCostDetails.Raw` |字段现在包裹了地图；访问`.Raw`以获得`map[string]float64`（原为`map[string]string`）|
    | `run.PromptTokenDetails` | `run.PromptTokenDetails.Raw` |字段现在包裹了地图；访问`.Raw`得到`map[string]int64`（元素类型不变）|
    | `run.PromptTokens` | `run.PromptTokens` |不变 |
    | `run.CompletionCost` | `run.CompletionCost` |不变 |
    | `run.CompletionCostDetails` | `run.CompletionCostDetails.Raw` |字段现在包裹了地图；访问`.Raw`以获得`map[string]float64`（原为`map[string]string`）|
    | `run.CompletionTokenDetails` | `run.CompletionTokenDetails.Raw` |字段现在包裹了地图；访问`.Raw`得到`map[string]int64`（元素类型不变） |
    | `run.CompletionTokens` | `run.CompletionTokens` |不变 |
    | `run.TotalCost` | `run.TotalCost` |不变 || `run.TotalTokens` | `run.TotalTokens` |不变 |
    | `run.ReferenceDatasetID` | `run.ReferenceDatasetID` |不变 |
    | `run.ReferenceExampleID` | `run.ReferenceExampleID` |不变 |
    | `run.Tags` | `run.Tags` |不变 |
    | `run.ThreadID` | `run.ThreadID` |不变 |
    | `run.SessionID` | `run.ProjectID` |更名|
    | `run.InDataset` | `run.IsInDataset` |更名|
    | `run.ChildRunIDs` | *（已删除）* |没有同等的|| `run.DirectChildRunIDs` | *（已删除）* |没有同等的|
    | `run.ExecutionOrder` | *（已删除）* |没有同等的|
    | `run.InputsS3URLs` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `run.LastQueuedAt` | *（已删除）* |没有同等的|
    | `run.ManifestID` | *（已删除）* |使用`run.Manifest` |
    | `run.ManifestS3ID` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `run.Messages` | *（已删除）* |没有同等的|| `run.OutputsS3URLs` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `run.ParentRunID` | *（已删除）* |使用`run.ParentRunIDs` |
    | `run.S3URLs` | *（已删除）* |内部存储URL； v2 中未公开 |
    | `run.Serialized` | *（已删除）* |使用`run.Manifest` |
    | `run.ShareToken` | *（已删除）* |使用`run.ShareURL` |
    | `run.TraceFirstReceivedAt` | *（已删除）* |没有同等的|
    | `run.TraceMaxStartTime` | *（已删除）* |没有同等的|| `run.TraceMinStartTime` | *（已删除）* |没有同等的|
    | `run.TraceTier` | *（已删除）* |没有同等的|
    | `run.TraceUpgrade` | *（已删除）* |没有同等的|
    | `run.TtlSeconds` | *（已删除）* |没有同等的|
    | *（不可用）* | `run.Attachments` |新功能：将附件文件名映射到预签名的下载 URL |
    | *（不可用）* | `run.ErrorPreview` |新：截断的错误片段 |
    | *（不可用）* | `run.IsRoot` |新 || *（不可用）* | `run.LatencySeconds` |新：挂钟持续时间（以秒为单位）|
    | *（不可用）* | `run.Manifest` |新：完整清单对象（替换`Serialized`和`ManifestID`）|
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
    | `prompt_cost_details` | `prompt_cost_details.raw` | Field 现在包裹了对象；读取 `.raw` 以获得相同的 `{category: cost}` 映射，现在带有数值（是字符串）|
    | `prompt_token_details` | `prompt_token_details.raw` | Field 现在包裹了对象；读取 `.raw` 以获得相同的 `{category: count}` 映射（值不变） || `prompt_tokens` | `prompt_tokens` |不变 |
    | `completion_cost` | `completion_cost` |不变 |
    | `completion_cost_details` | `completion_cost_details.raw` | Field 现在包裹了对象；读取 `.raw` 以获得相同的 `{category: cost}` 映射，现在带有数值（是字符串） |
    | `completion_token_details` | `completion_token_details.raw` | Field 现在包裹了对象；读取 `.raw` 以获得相同的 `{category: count}` 映射（值不变）|
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

#### 通过 ID 获取单次运行

<Tabs>
  <Tab title="Python">
    `runs.retrieve` 需要额外的 `project_id` (UUID) 参数，而 `read_run` 不需要。它还接受可选的 `start_time` — 前提是它可以加快检索速度，但不是必需的。首先通过`client.aread_project()`解析项目UUID。

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
    `client.runs.retrieve` 需要额外的 `project_id` (UUID) 参数，而 `readRun` 不需要。它还接受可选的 `start_time` — 前提是它可以加快检索速度，但不是必需的。首先通过`client.readProject()`解析项目UUID。<Tabs>
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
      </Tab>

      <Tab title="After">
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

#### 选择字段<Tabs>
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
    `read_run`从`langsmith.utils`提高了`LangSmithNotFoundError`，因为缺少运行。 `runs.retrieve` 从 `langsmith` 提高 `NotFoundError`。

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
    `.retrieve()` 和 `.retrieveV2()` 都提高了 `com.langchain.smith.errors.NotFoundException` — 不变，因为 Java SDK 已经在 SmithDB 之前由不锈钢生成。

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
    `Get` 和 `GetV2` 都返回一个 `*langsmith.Error`，您可以使用 `errors.As` 检查 - 不变，因为 Go SDK 已经在 SmithDB 之前由不锈钢生成。检查 `StatusCode` 是否有 `404`。<Tabs>
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
  </Tab>

  <Tab title="Go">
    无需迁移：Go SDK 从未在一次调用中加载子运行，因此请使用 `client.Traces.ListRuns()` 遍历跟踪的运行。
  </Tab><Tab title="cURL">
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
      `client.runs.get_url()` 现在是异步的。用`await`来调用。
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
  </Tab>

  <Tab title="Go">
    <Note>Go SDK 没有用于检索运行的 UI URL 的旧版等效项。</Note>|之前 |之后 |
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
    </Warning>|之前 (`get_run_url`) |之后(`runs.get_url`)|笔记|
    | ---------------------- | ---------------------- | -------------------------------------------------------------------------------------- |
    | `run` (`RunBase`) | *（已删除）* |不需要完整的运行对象；单独传递其标识字段 |
    | `project_name` | *（已删除）* |没有同等的；如果您只有项目名称，请自行解析项目 UUID |
    | `project_id` | `project_id` | **必需的**;仍然是项目（会话）UUID |
    | *（不可用）* | `run_id` | **必填**（位置）；运行的 ID，之前从 `run.id` | 读取
    | *（不可用）* | `trace_id` | **必需的**;运行的跟踪 UUID，之前从 `run` 内部读取 |
    | *（不可用）* | `start_time` |选修的;运行的开始时间（RFC3339）；如果未知则省略 |
  </Tab>

  <Tab title="TypeScript">
    <Warning>
      `client.runs.getURL` 需要直接传递运行的 `project_id` 和 `trace_id`，而不是从 `run` 对象或 `runId` 后备解析它们。
    </Warning>|之前 (`getRunUrl`) |之后(`getURL`)|笔记|
    | -------------------- | -------------------- | ------------------------------------------------------------------------------------------ |
    | `run` (`Run`) | *（已删除）* |不需要完整的运行对象；单独传递其识别字段 |
    | `runId` | `runID`（位置）|目的不变；现在第一个位置参数而不是命名选项 |
    | `projectOpts` | *（已删除）* |没有同等的；自己解析项目UUID |
    | *（不可用）* | `project_id` | **必需的**; `snake_case`；项目（会话）UUID |
    | *（不可用）* | `trace_id` | **必需的**; `snake_case`；运行的跟踪 UUID |
    | *（不可用）* | `start_time` |选修的; `snake_case`；运行的开始时间（RFC3339）；如果未知则省略 |
  </Tab><Tab title="Java">
    |之前 |之后(`RunGetUrlParams`)|笔记|
    | -------------------- | ---------------------------------- | ---------------------------------------------------------------- |
    | *（无遗留方法）* | `runId` | **必填**（位置）；运行的 ID |
    | *（无遗留方法）* | `projectId()` | **必需的**;项目（会话）UUID |
    | *（无遗留方法）* | `traceId()` | **必需的**;运行的跟踪 UUID |
    | *（无遗留方法）* | `startTime()` |选修的;运行的开始时间（RFC3339）；如果未知则省略 |
  </Tab><Tab title="Go">
    |之前 |之后(`RunGetURLParams`) |笔记|
    | -------------------- | ---------------------------------- | ---------------------------------------------------------------- |
    | *（无遗留方法）* | `runID`（位置）| **必需的**;运行的 ID |
    | *（无遗留方法）* | `ProjectID` | **必需的**;项目（会话）UUID |
    | *（无遗留方法）* | `TraceID` | **必需的**;运行的跟踪 UUID |
    | *（无遗留方法）* | `StartTime` |选修的;运行的开始时间（RFC3339）；如果未知则省略 |
  </Tab><Tab title="cURL">
    |之前 |之后(`GET /api/v2/runs/{run_id}/url`)|笔记|
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
    | `str`（网址）| `RunGetURLResponse.url` |响应现在被包装在一个对象中；读取`.url`属性 |
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
    | *（无遗留方法）* | `RunGetURLResponse.URL` |返回`string` |
  </Tab>

  <Tab title="cURL">
    |之前 |之后|笔记|
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

## 另请参阅

* [Query runs](/langsmith/smithdb-sdk-migration-query-runs)
* [Feedback and annotation queues](/langsmith/smithdb-sdk-migration-feedback)
* [Migration overview](/langsmith/smithdb-sdk-migration)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/smithdb-sdk-migration-runs.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>