<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Migrate to SmithDB-backed APIs | https://docs.langchain.com/langsmith/smithdb-sdk-migration -->

# 迁移到 SmithDB 支持的 API

将现有的 LangSmith SDK 方法迁移到 SmithDB 支持的等效方法，以实现更快的代理可观察性。

## 上下文

2026 年 5 月，我们发布了[SmithDB](https://www.langchain.com/blog/introducing-smithdb?utm_source=docs)，一个为现代人工智能代理构建的新可观测性数据库。 SmithDB 在每个关键可观测性工作负载中提供业界领先的性能，使核心LangSmith 体验速度显着加快。

使用 SmithDB 查询跟踪记录需要新的 SDK 方法。本指南可帮助您迁移代码库。

## 使用 AI 代理进行迁移

将以下提示复制到您的编码代理中。它会查找每个 SDK 方法以及对已弃用端点的直接 API 调用，等待您的批准，然后将它们迁移到本地。仅当您批准时，它才会推送并打开拉取请求。

迁移已弃用的 LangSmith 端点

帮助我将此代码库从已弃用的 LangSmith API 端点迁移出去。在 LangSmith Cloud 上，它们将于 2027 年 1 月 31 日停止工作。在自托管上，当 ClickHouse 关闭时，它们会停止工作，最迟升级到 v0.19。调用可以通过 LangSmith SDK（Python、TypeScript/JavaScript、Go 或 Java）或直接通过 HTTP 进行；处理所有这些。工作分 4 个阶段，按顺序进行。仅在阶段显示“停止”的地方停止，然后等待我的离开。在我批准第 2 阶段之前，请勿编辑任何文件。

**阶段 1：解释（简短）**

在 3 到 5 行中，告诉我发生了什么变化以及原因：LangSmith将运行存储移动到 SmithDB，v1 运行查询/读取端点和调用它们的 SDK 方法被 v2 端点取代，以及如果我们什么都不做会中断什么。

事实来源：首先获取[https://docs.langchain.com/langsmith/smithdb-sdk-migration.md](https://docs.langchain.com/langsmith/smithdb-sdk-migration.md)（每种语言的最低 SDK 版本、异常更改、已停止的方法）。然后仅获取该代码库需要的区域页面。每一个都有 Python、TypeScript、Go、Java 和 cURL 的前后示例：

* 搜索项目中的运行：[https://docs.langchain.com/langsmith/smithdb-sdk-migration-query-runs.md](https://docs.langchain.com/langsmith/smithdb-sdk-migration-query-runs.md)
* 通过 ID 获取一个运行、其子运行及其 URL：[https://docs.langchain.com/langsmith/smithdb-sdk-migration-runs.md](https://docs.langchain.com/langsmith/smithdb-sdk-migration-runs.md)
* 查询跟踪、它们的令牌和成本聚合，以及一个跟踪中的运行：[https://docs.langchain.com/langsmith/smithdb-sdk-migration-traces.md](https://docs.langchain.com/langsmith/smithdb-sdk-migration-traces.md)
* 查询线程以及单个线程中的踪迹：[https://docs.langchain.com/langsmith/smithdb-sdk-migration-threads.md](https://docs.langchain.com/langsmith/smithdb-sdk-migration-threads.md)
* 查询数据集上实验的运行情况：[https://docs.langchain.com/langsmith/smithdb-sdk-migration-experiments.md](https://docs.langchain.com/langsmith/smithdb-sdk-migration-experiments.md)
* 反馈、注释队列和共享运行：[https://docs.langchain.com/langsmith/smithdb-sdk-migration-feedback.md](https://docs.langchain.com/langsmith/smithdb-sdk-migration-feedback.md)

然后直接进入第 2 阶段。

**第二阶段：库存和计划（只读）**在指南概述页面的“受影响的方法和端点”部分中搜索整个存储库（应用程序代码、脚本、笔记本、测试、CI 和基础设施配置，使用其使用的每种语言）以查找每个 SDK 方法和端点：

* Python、TypeScript/JavaScript、Go 和 Java/Kotlin 中的 SDK 调用。在 Go 和 Java 中，一些替代品会在新服务下保留相似的名称，因此请根据指南的之前/之后进行匹配，而不仅仅是名称。
* 反馈创建（`create_feedback`、`createFeedback`、`Feedback.New`、`feedback().create()`）：方法和端点保留其名称，但现在需要项目（会话）ID。列出每个未通过的调用。
* 在原始或构建的 URL 以及任何 HTTP 客户端（请求、httpx、fetch、axios、net/http、OkHttp、curl）中直接对已弃用的路径进行 HTTP 调用，无论是否带有`/api/v1`。
* 测试、固定装置、模板或任务文件夹下的文件如果针对真实的LangSmith（脚本、构建步骤、笔记本）运行，则算作调用站点。
* 匹配方法名称，而不是调用语法：方法可以作为引用传递（`asyncio.to_thread`、`functools.partial`、回调、`getattr`），后面不带括号。将原始 HTTP 调用保留为原始 HTTP 调用：仅更改路径、请求正文、响应处理和分页，遵循指南的 cURL 示例。请注意，对于第 4 阶段，使用 SDK 方法会更简单的每个原始调用。

显示表格：文件：行、语言、SDK 或 HTTP、当前调用、替换、风险。

标记为风险：从运行查询中读取 `total_tokens`、`total_cost`、`prompt_*` 或 `completion_*` 的代码（不再包括子运行；使用跟踪查询及其聚合），并捕获旧异常类。

每种语言的列表：当前版本、最新稳定版、最低指南。

如果您发现超过 20 个调用站点，建议按区域将工作分成单独的 PR（每个文件夹、服务或包），并列出每个 PR 的调用站点计数，并询问先执行哪一个。第 3 阶段仅涵盖我选择的 PR。

对您需要我做出的每个决定（1、2、3...）进行编号，每个决定都包含您提出的答案，以便我可以一一批准或拒绝它们（例如“1 是，2 否，3 是”）。

然后停下来等待我的批准。

**第3阶段：迁移（批准后，仅限我批准的范围和决定）**1. 将正在使用的每个LangSmith SDK 升级到最新的稳定版本（及其锁定文件：uv.lock/poetry.lock、package-lock/pnpm-lock/yarn.lock、go.sum、Gradle/Maven）。指南的最低限度只是地板。如果最新版本破坏了与此迁移无关的内容，请使用有效的最新版本，切勿低于最低版本，并在 PR 中说明原因。
2. 从表中迁移每个调用站点。 v2 查询采用 `project_ids` (UUID)，而不是项目名称。按照指南所示按名称解析普通项目。如果项目是代理环境、实验或工作区评估器，建议使用[https://docs.langchain.com/langsmith/resolve-an-agent](https://docs.langchain.com/langsmith/resolve-an-agent)解决它，并标记它是测试版并且需要更新的 SDK 和服务器。
3. 为所涉及的每种语言运行测试、检查和构建。重新运行第 2 阶段搜索并显示没有找到任何内容，或解释每个剩余内容。
4. 将更改保留在本地：提交，而不是推送。显示摘要：每个文件、更改内容和原因，以及尚待审核的内容。然后停止。仅在我批准的情况下推送并打开拉取请求。

**第四阶段：反馈和跟进**1. 列出第 2 阶段中记录的可以使用 SDK 方法的原始 HTTP 调用。对于每个，说明 SDK 将为该调用站点带来什么，例如自动分页、速率限制和服务器错误的退避重试、捕获字段重命名的键入参数、删除端点之前的弃用警告或环境中的配置，以及适用于它的任何其他内容。然后问我是否想在单独的更改中切换它们。如果没有则跳过此操作。
2. 列出指南未涵盖或错误的所有内容，作为我可以发送至LangChain 的简短说明。始终以此注释结尾，即使它是空的（“没有什么可报告的”）。

**规则**

* 如果指南未涵盖调用站点或参数，请首先搜索 LangSmith 文档的其余部分（[https://docs.langchain.com/langsmith](https://docs.langchain.com/langsmith)，包括 API 参考）。然后询问我，并在支持它的文档链接中添加建议的替换项，或者说您什么也没找到。未经我许可，切勿应用未覆盖的更改。
* 测试时不要调用写入端点或更改LangSmith数据。
* 未经我的许可，切勿推送分支、打开拉取请求或将任何内容发布到 GitHub。

## 弃用和删除每个 SDK 方法及其底层端点共享相同的弃用日期。

|部署|弃用 |移除 |
| - | - | - |
|所有云区域 | 2026 年 7 月结束 | 2027 年 1 月 31 日 |
|自托管 | `v0.16` | `v0.19` |

有关LangSmith如何弃用和删除API端点和SDK方法的详细信息，请参阅[API and SDK deprecation policy](/langsmith/endpoint-deprecation)。

## 最低 SDK 版本

新的 SDK 方法从以下 SDK 版本开始可用：

|语言 |套餐 |最低版本 |
| - | - | - |
|蟒蛇 | `langsmith` | `>=0.10.15` |
|打字稿 | `langsmith` | `>=0.8.9` |
|爪哇 | `langsmith-java` | `0.1.0-beta.22` |
|去 | `langsmith-go` | `v0.25.4` |
|命令行| `langsmith-cli` | `v0.2.44` |

[LangSmith CLI](/langsmith/langsmith-cli) 查询相同的 SmithDB 支持的端点，并需要 `v0.2.44` 或更高版本。

## 关于自托管

* 本指南中记录的新方法需要自托管版本 0.16 或更高版本，与所使用的数据存储无关。
* 一旦 ClickHouse 被禁用，已弃用的方法将停止工作。
* 在可能的情况下，SDK 会发出警告或错误，标识要升级到的版本，而不是在没有任何解释的情况下失败。

## 按区域划分的方法

每种方法的更改前后都记录在其区域的页面上。> [卡][Query runs](/langsmith/smithdb-sdk-migration-query-runs)
>
> 搜索项目中的运行：过滤器、字段投影、排序和分页。迁移中表面积最大。

> [卡][Retrieve runs](/langsmith/smithdb-sdk-migration-runs)
>
> 通过 ID 获取一个运行，加载其子运行，并在 LangSmith UI 中构建运行的 URL。

> [卡][Traces](/langsmith/smithdb-sdk-migration-traces)
>
> 查询项目中的跟踪，读取其令牌和成本聚合，并列出属于一个跟踪的运行。

> [卡][Threads](/langsmith/smithdb-sdk-migration-threads)
>
> 查询项目中的线程并列出属于一个线程的迹线（匝数）。

> [卡][Dataset experiment runs](/langsmith/smithdb-sdk-migration-experiments)
>
> 查询数据集上的实验记录的运行，包括分页和按反馈分数排序。

> [卡][Feedback and sharing](/langsmith/smithdb-sdk-migration-feedback)
>
> 创建运行反馈、将运行添加到注释队列以及共享、取消共享或读取公开共享的运行。

## 受影响的方法和端点

下面的每个 SDK 方法和 API 端点均已弃用，并在上面的删除日期停止工作。在您的代码库中搜索所有这些内容。端点路径是相对于`/api/v1`；除非另有说明，各区域页面均包含之前/之后的示例。

### SDK方法> [选项卡] Python
>
> `Client` 和 `AsyncClient` 上已弃用的方法：
>
> |已弃用 |更换|
> | - | - |
> | `list_runs()` | `client.runs.query()` |
> | `read_run()` | `client.runs.retrieve()` |
> | `get_run_url()` | `client.runs.get_url()` |
> | `list_threads()` | `client.threads.query()` |
> | `read_thread()` | `client.threads.list_traces()` |
> | `share_run()` | `client.runs.share.create()` |
> | `unshare_run()` | `client.runs.share.delete()` |
> | `read_run_shared_link()`、`run_is_shared()` | `client.runs.retrieve(selects=["SHARE_URL"])` |
> | `list_shared_runs()` | `client.public.runs.query()` |
> | `read_shared_run()` | `client.public.runs.retrieve()` |
> | `get_experiment_results()` | `client.datasets.experiment_runs.query()` |
> | `add_runs_to_annotation_queue()` | `client.annotation_queues.items.create()` |
> | `list_runs_from_annotation_queue()`、`get_run_from_annotation_queue()` | `client.annotation_queues.items.list()` |
> | `delete_run_from_annotation_queue()` | `client.annotation_queues.items.delete_all()` |
> | `evaluate_run()`、`aevaluate_run()` |没有替代：自己运行评估器并使用 `create_feedback()` | 记录结果

> [选项卡] TypeScript
>
> `Client` 上已弃用的方法：
>
> |已弃用 |更换|
> | - | - |
> | `listRuns()` | `client.runs.query()` |
> | `readRun()` | `client.runs.retrieve()` |
> | `getRunUrl()` | `client.runs.getURL()` |
> | `listThreads()`、`listGroupRuns()` | `client.threads.query()` |
> | `readThread()` | `client.threads.listTraces()` |
> | `shareRun()` | `client.runs.share.create()` |
> | `unshareRun()` | `client.runs.share.delete()` |
> | `readRunSharedLink()` | `client.runs.retrieve({ selects: ["SHARE_URL"] })` |
> | `listSharedRuns()` | `client.public.runs.query()` |
> | `addRunsToAnnotationQueue()` | `client.annotationQueues.items.create()` |
> | `listRunsFromAnnotationQueue()`、`getRunFromAnnotationQueue()` | `client.annotationQueues.items.list()` |
> | `deleteRunFromAnnotationQueue()` | `client.annotationQueues.items.deleteAll()` |
> | `getSizeFromAnnotationQueue()` | `client.annotationQueues.items.retrieveCount()` |

> [选项卡] Java
>
> |已弃用 |更换|
> | - | - |
> | `client.runs().query()`、`queryV1()` | `client.runs().queryV2()` |
> | `client.runs().retrieve()`、`retrieveV1()` | `client.runs().retrieveV2()` |
> | `client.datasets().runs().query()` | `client.datasets().experimentRuns().query()` |
> | `client.annotationQueues().runs().create()`、`createByKey()` | `client.annotationQueues().items().create()` |
> | `client.annotationQueues().runs().list()`、`client.annotationQueues().retrieveRun()` | `client.annotationQueues().items().list()` |
> | `client.annotationQueues().runs().update()` | `client.annotationQueues().items().update()` |
> | `client.annotationQueues().runs().deleteAll()`、`deleteQueue()` | `client.annotationQueues().items().deleteAll()` |
> | `client.annotationQueues().retrieveSize()`、`retrieveTotalSize()`、`retrieveTotalArchived()` | `client.annotationQueues().items().retrieveCount()` |
> | `client.annotationQueues().createRunStatus()` | `client.annotationQueues().items().createStatus()` |> [选项卡] 前往
>
> |已弃用 |更换|
> | - | - |
> | `client.Runs.Query()`、`QueryAutoPaging()`、`QueryV1()` | `client.Runs.QueryV2()` |
> | `client.Runs.Get()`、`GetV1()` | `client.Runs.GetV2()` |
> | `client.Datasets.Runs.Query()` | `client.Datasets.ExperimentRuns.Query()` |
> | `client.AnnotationQueues.Runs.New()`、`NewByKey()` | `client.AnnotationQueues.Items.New()` |
> | `client.AnnotationQueues.Runs.List()`、`client.AnnotationQueues.GetRun()` | `client.AnnotationQueues.Items.List()` |
> | `client.AnnotationQueues.Runs.Update()` | `client.AnnotationQueues.Items.Update()` |
> | `client.AnnotationQueues.Runs.DeleteAll()`、`DeleteQueue()` | `client.AnnotationQueues.Items.DeleteAll()` |
> | `client.AnnotationQueues.GetSize()`、`GetTotalSize()`、`GetTotalArchived()` | `client.AnnotationQueues.Items.GetCount()` |
> | `client.AnnotationQueues.NewRunStatus()` | `client.AnnotationQueues.Items.NewStatus()` |

### 端点

|已弃用 |更换|面积 |
| - | - | - |
| `POST /runs/query` | `POST /api/v2/runs/query` | [Query runs](/langsmith/smithdb-sdk-migration-query-runs) |
| `GET /runs/{run_id}` | `GET /api/v2/runs/{run_id}` | [Retrieve runs](/langsmith/smithdb-sdk-migration-runs) |
| `POST /runs/group` | `POST /api/v2/threads/query` | [Threads](/langsmith/smithdb-sdk-migration-threads) |
| `GET /runs/{run_id}/share` | `GET /api/v2/runs/{run_id}?selects=SHARE_URL` | [Feedback and sharing](/langsmith/smithdb-sdk-migration-feedback) |
| `PUT /runs/{run_id}/share` | `POST /api/v2/runs/{run_id}/share` | [Feedback and sharing](/langsmith/smithdb-sdk-migration-feedback) |
| `DELETE /runs/{run_id}/share` | `DELETE /api/v2/runs/{trace_id}/share`（获取跟踪 ID）| [Feedback and sharing](/langsmith/smithdb-sdk-migration-feedback) |
| `POST /datasets/{dataset_id}/runs` | `POST /api/v2/datasets/{dataset_id}/experiment-runs` | [Dataset experiment runs](/langsmith/smithdb-sdk-migration-experiments) |
| `GET /public/{share_token}/run/{run_id}` | `GET /api/v2/public/{share_token}/run/{run_id}` | [Feedback and sharing](/langsmith/smithdb-sdk-migration-feedback) |
| `POST /public/{share_token}/runs/query` | `POST /api/v2/public/{share_token}/runs/query` | [Feedback and sharing](/langsmith/smithdb-sdk-migration-feedback) |

注释队列运行端点移动到`/api/v1/platform/annotation-queues`下的队列项API。要将运行添加到队列，请参阅[Annotation queues: add runs](/langsmith/smithdb-sdk-migration-feedback)。对于其他端点，请参阅 [API reference](/langsmith/smith-api) 了解请求和响应形状。

|已弃用 (`/annotation-queues/...`) |替换品（`/api/v1/platform/annotation-queues/...`）|
| - | - |
| `POST /{queue_id}/runs`、`POST /{queue_id}/runs/by-key` | `POST /{queue_id}/items` |
| `GET /{queue_id}/runs`、`GET /{queue_id}/run/{index}` | `GET /{queue_id}/items` |
| `GET /{queue_id}/runs/resolve/{queue_run_id}` | `GET /{queue_id}/items/{item_id}/placement` |
| `PATCH /{queue_id}/runs/{queue_run_id}` | `PATCH /{queue_id}/items/{item_id}` |
| `DELETE /{queue_id}/runs/{queue_run_id}`、`POST /{queue_id}/runs/delete` | `POST /{queue_id}/items/delete` |
| `GET /{queue_id}/size`、`GET /{queue_id}/total_size`、`GET /{queue_id}/total_archived` | `GET /{queue_id}/items/count` |
| `POST /status/{annotation_queue_run_id}` | `POST /items/{queue_item_id}/status` |

## 例外情况> [选项卡] Python
>
> SmithDB 支持的方法引发新的异常类，而不是旧的 `langsmith.utils` 异常类。
>
> |之前 (`langsmith.utils`) |之后（`langsmith`）|笔记|
> | - | - | - |
> | `LangSmithError` | `LangsmithError` | SDK的异常基类；外壳已更改 |
> | `LangSmithAPIError` | `InternalServerError` | 5xx |
> | `LangSmithRequestTimeout` | `APITimeoutError` |请求超时时引发 |
> | `LangSmithUserError` | *（已删除）* |没有直接等价物。 403 org-scoped-key 案例现在引发 `PermissionDeniedError`；客户端参数验证现在提出了标准 `ValueError` 或 `TypeError` |
> | `LangSmithRateLimitError` | `RateLimitError` | 429；不变的名字 |
> | `LangSmithAuthError` | `AuthenticationError` | 401 | 401
> | `LangSmithNotFoundError` | `NotFoundError` | 404;不变的名字 |
> | `LangSmithConflictError` | `ConflictError` | 409；不变的名字 |
> | `LangSmithConnectionError` | `APIConnectionError` |当客户端无法连接到 API 时引发 |
> | `LangSmithExceptionGroup` | *（已删除）* |没有同等的 |
> | *（不可用）* | `APIError` |新增：所有 API 相关错误的基类，具有 `message`、`request` 和 `body` 属性 |
> | *（不可用）* | `APIStatusError` |新：所有 4xx/5xx 状态错误的基类 |
> | *（不可用）* | `BadRequestError` |新：400 |
> | *（不可用）* | `PermissionDeniedError` |新：403 |
> | *（不可用）* | `UnprocessableEntityError` |新：422 |> | *（不可用）* | `APIResponseValidationError` |新：当响应与预期模式不匹配时引发 |

> [选项卡] TypeScript
>
> SmithDB 支持的方法引发新的异常类，而不是普通的 `Error`。
>
> |之前（普通`Error`）|之后（`langsmith`）|笔记|
> | - | - | - |
> | *（不可用）* | `LangsmithError` |所有 SDK 错误的基类 |
> | *（不可用）* | `InternalServerError` | 5xx |
> | *（不可用）* | `APIConnectionTimeoutError` |请求超时时引发 |
> | *（不可用）* | `RateLimitError` | 429 | 429
> | *（不可用）* | `AuthenticationError` | 401 | 401
> | *（不可用）* | `NotFoundError` | 404 | 404
> | *（不可用）* | `ConflictError` | 409 | 409
> | *（不可用）* | `APIConnectionError` |当客户端无法连接到 API 时引发 |
> | *（不可用）* | `APIError` |所有与 API 相关的错误的基类，具有 `status`、`headers` 和 `error` 属性 |
> | *（不可用）* | `BadRequestError` | 400 |
> | *（不可用）* | `PermissionDeniedError` | 403 | 403
> | *（不可用）* | `UnprocessableEntityError` | 422 | 422
> | *（不可用）* | `APIUserAbortError` |当请求通过 `AbortController` | 中止时引发

> [选项卡] Java
>
> 没有变化。错误处理不受此迁移的影响。

> [选项卡] 前往
>
> 没有变化。错误处理不受此迁移的影响。> [选项卡] 卷曲
>
> 没有变化。错误处理不受此迁移的影响。

## 停产

以下方法已停止使用。他们调用已退役的 `/feedback/formulas` 端点，这些端点在复合反馈 v2 上返回 `410 Gone`，并计划于 2026 年 8 月 20 日删除。综合分数现在作为[composite evaluators](/langsmith/composite-evaluators-ui)进行管理，它将综合分数实现为代码评估器加运行规则。没有 SDK 替代品。

###反馈公式方法

|蟒蛇 |打字稿 |
| - | - |
| [⟦T237⟧](https://reference.langchain.com/python/langsmith/client/Client/list_feedback_formulas) |不适用 |
| [⟦T238⟧](https://reference.langchain.com/python/langsmith/client/Client/get_feedback_formula_by_id) |不适用 |
| [⟦T239⟧](https://reference.langchain.com/python/langsmith/client/Client/create_feedback_formula) |不适用 |
| [⟦T240⟧](https://reference.langchain.com/python/langsmith/client/Client/update_feedback_formula) |不适用 |
| [⟦T241⟧](https://reference.langchain.com/python/langsmith/client/Client/delete_feedback_formula) |不适用 |

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/smithdb-sdk-migration.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。