<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Migrate feedback and sharing methods to SmithDB | https://docs.langchain.com/langsmith/smithdb-sdk-migration-feedback -->

# 将反馈和共享方法迁移到 SmithDB

将 LangSmith SDK 反馈、注释队列和公共运行方法迁移到 SmithDB 支持的等效方法。

这些方法将运行添加到注释队列、公开共享运行并创建反馈。有关弃用日期、最低 SDK 版本以及适用于每种方法的代理提示，请参阅 [Migrate to SmithDB-backed APIs](/langsmith/smithdb-sdk-migration)。

## 注释队列：添加运行

将运行添加到注释队列。旧的 `POST /api/v1/annotation-queues/{queue_id}/runs` 和 `POST /api/v1/annotation-queues/{queue_id}/runs/by-key` 端点均已弃用。请改用注释队列项 API：每个运行都是一个 `RUN` 项目，其 ID 加上 `project_id`（项目 UUID）和 `start_time` 查找键，因此可以直接定位运行而不是扫描。

> [!注意]
>
> 在 Python 和 TypeScript 中，项目 API 位于新客户端资源 (`client.annotation_queues.items` / `client.annotationQueues.items`) 上，因此[Exceptions](/langsmith/smithdb-sdk-migration#exceptions) 表适用。在自托管上，项目端点需要 LangSmith v0.16.14 或更高版本。

### 主要变化

#### 方法名称

> [选项卡] Python
>
> |之前 |之后 |
> | - | - |
> | `client.add_runs_to_annotation_queue()` | `client.annotation_queues.items.create()`（异步）|

> [选项卡] TypeScript
>
> |之前 |之后 |
> | - | - |
> | `client.addRunsToAnnotationQueue()` | `client.annotationQueues.items.create()` |

> [选项卡] Java
>
> |之前 |之后 |
> | - | - |
> | `client.annotationQueues().runs().create()` | `client.annotationQueues().items().create()` |> [选项卡] 前往
>
> |之前 |之后 |
> | - | - |
> | `client.AnnotationQueues.Runs.New()` | `client.AnnotationQueues.Items.New()` |
>
> 完整参数列表请参见[reference](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#AnnotationQueueItemService.New)。

> [选项卡] 卷曲
>
> |之前 |之后 |
> | - | - |
> | `POST /api/v1/annotation-queues/{queue_id}/runs` | `POST /api/v1/platform/annotation-queues/{queue_id}/items` |

#### 输入

该请求采用项目列表（每次调用最多 100 个）而不是运行 ID 列表。每次运行都会成为一项：

|领域|价值|
| - | - |
| `item_type` | `RUN` |
| `run_id` |运行 ID |
| `project_id` |运行的项目 UUID（从 `runs.query` 运行时的`project_id`；`session_id` 也可以作为别名接受）|
| `start_time` |运行的开始时间 (RFC3339) |

`extend_trace_retention` 未更改，仍然是可选查询参数。

> [选项卡] Python
>
> |之前 |之后 |
> | - | - |
> | `run_ids=[...]` 或 `runs=[RunKey, ...]` | `items=[{"item_type": "RUN", "run_id", "project_id", "start_time"}, ...]` |

> [选项卡] TypeScript
>
> |之前 |之后 |
> | - | - |
> | `string[]` 或 `RunKey[]`（第二个参数）| `{ items: [{ item_type: "RUN", run_id, project_id, start_time }] }` |

> [选项卡] Java
>
> |之前 (`RunCreateParams`) |之后(`ItemCreateParams`)|
> | - | - |
> | `.bodyOfRunsUuidArray(List<String>)` | `.addItem(ItemCreateParams.Item)` 与 `itemType(RUN)`、`runId`、`projectId`、`startTime` |
> | `.queueId(String)` | `.queueId(String)` |

> [选项卡] 前往
>
> |之前 (`AnnotationQueueRunNewParams`) |之后(`AnnotationQueueItemNewParams`)|
> | - | - |
> | `Body: AnnotationQueueRunNewParamsBodyRunsUuidArray` | `Items: []AnnotationQueueItemNewParamsItem` 与 `ItemType`、`RunID`、`ProjectID`、`StartTime` |

> [选项卡] 卷曲
>
> |之前（正文）|之后（正文）|
> | - | - |
> | `["<run-id>", ...]` | `{"items": [{"item_type": "RUN", "run_id", "project_id", "start_time"}]}` |

＃＃＃＃ 回复items API 返回 `{"items": [...]}`，每个输入创建一个队列项目（`id`、`queue_id`、`item_type`、`run_id`、`project_id`、`start_time`、`added_at`、`last_reviewed_time`）。将项目 `id` 与其他项目端点（更新、删除、状态）一起使用。旧版 Python 和 TypeScript 方法不返回任何内容。

### 示例

#### 将运行添加到队列

> [选项卡] Python
>
> 每次运行从您已有的运行对象构建一个 `RUN` 项目。
>
>> [选项卡] 之前
>>
>> ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > from langsmith import Client
> >
> > client = Client()
> > queue_id = "<queue-id>"
> > runs = list(client.list_runs(project_name="default", limit=5))
> > client.add_runs_to_annotation_queue(queue_id, run_ids=[run.id for run in runs])
> > ```
>
>> [选项卡] 之后
>>
>> ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > import asyncio
> > from datetime import datetime, timedelta, timezone
> >
> > from langsmith import Client
> >
> >
> > async def main():
> >     client = Client()
> >     queue_id = "<queue-id>"
> >     project_id = "<project-id>"
> >     page = await client.runs.query(
> >         project_ids=[project_id],
> >         min_start_time=datetime.now(timezone.utc) - timedelta(days=30),
> >         selects=["ID", "PROJECT_ID", "START_TIME"],
> >         page_size=5,
> >     )
> >     runs = page.items
> >     await client.annotation_queues.items.create(
> >         queue_id,
> >         items=[
> >             {
> >                 "item_type": "RUN",
> >                 "run_id": str(run.id),
> >                 "project_id": str(run.project_id),
> >                 "start_time": run.start_time.isoformat(),
> >             }
> >             for run in runs
> >         ],
> >     )
> >
> >
> > asyncio.run(main())
> > ```

> [选项卡] TypeScript
>
> 每次运行从您已有的运行对象构建一个 `RUN` 项目。
>
>> [选项卡] 之前
>>
>> ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > import { uuid7 } from "langsmith";
> > import { Client } from "langsmith";
> >
> > const client = new Client();
> > let queueId = "<queue-id>";
> > const runs = [];
> > for await (const run of client.listRuns({ projectName: "default", limit: 5 })) {
> >   runs.push(run);
> > }
> > await client.addRunsToAnnotationQueue(
> >   queueId,
> >   runs.map((run) => run.id),
> > );
> > ```
>
>> [选项卡] 之后
>>
>> ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > import { Client } from "langsmith";
> >
> > const client = new Client();
> > let queueId = "<queue-id>";
> > let projectId = "<project-id>";
> > const page = await client.runs.query({
> >   project_ids: [projectId],
> >   min_start_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
> >   selects: ["ID", "PROJECT_ID", "START_TIME"],
> >   page_size: 5,
> > });
> > const runs = page.items ?? [];
> > await client.annotationQueues.items.create(queueId, {
> >   items: runs.map((run) => ({
> >     item_type: "RUN" as const,
> >     run_id: run.id,
> >     project_id: run.project_id!,
> >     start_time: run.start_time!,
> >   })),
> > });
> > ```

> [选项卡] Java
>
> 每次运行添加一个 `ItemCreateParams.Item`。
>
>> [选项卡] 之前
>>
>> ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > import com.langchain.smith.client.LangsmithClient
> > import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
> > import com.langchain.smith.models.annotationqueues.AnnotationQueueAnnotationQueuesParams
> > import com.langchain.smith.models.annotationqueues.runs.RunCreateParams
> > import com.langchain.smith.models.runs.RunQueryParams
> > import com.langchain.smith.models.sessions.SessionListParams
> >
> > val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()
> >
> > var queueId = "<queue-id>"
> > var projectId = "<project-id>"
> > val runs = client.runs().query(
> >     RunQueryParams.builder().session(listOf(projectId)).limit(5L).build()
> > ).items()
> >
> > client.annotationQueues().runs().create(
> >     RunCreateParams.builder()
> >         .queueId(queueId)
> >         .bodyOfRunsUuidArray(runs.map { it.id() })
> >         .build()
> > )
> > ```
>
>> [选项卡] 之后
>>
>> ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > import com.langchain.smith.client.LangsmithClient
> > import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
> > import com.langchain.smith.models.annotationqueues.AnnotationQueueAnnotationQueuesParams
> > import com.langchain.smith.models.annotationqueues.items.ItemCreateParams
> > import com.langchain.smith.models.runs.RunQueryV2Params
> > import com.langchain.smith.models.runs.RunSelectField
> > import com.langchain.smith.models.sessions.SessionListParams
> > import java.time.OffsetDateTime
> >
> > val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()
> >
> > var queueId = "<queue-id>"
> > var projectId = "<project-id>"
> > val runs = client.runs().queryV2(
> >     RunQueryV2Params.builder()
> >         .addProjectId(projectId)
> >         .minStartTime(OffsetDateTime.now().minusDays(30))
> >         .addSelect(RunSelectField.ID)
> >         .addSelect(RunSelectField.PROJECT_ID)
> >         .addSelect(RunSelectField.START_TIME)
> >         .pageSize(5L)
> >         .build()
> > ).items()
> >
> > val params = ItemCreateParams.builder().queueId(queueId)
> > for (run in runs) {
> >     params.addItem(
> >         ItemCreateParams.Item.builder()
> >             .itemType(ItemCreateParams.Item.ItemType.RUN)
> >             .runId(run.id().get())
> >             .projectId(run.projectId().get())
> >             .startTime(run.startTime().get())
> >             .build()
> >     )
> > }
> > client.annotationQueues().items().create(params.build())
> > ```

> [选项卡] 前往
>
> 每次运行添加一个 `AnnotationQueueItemNewParamsItem`。
>
>> [选项卡] 之前
>>
>> ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > package main
> >
> > import (
> > 	"context"
> > 	"time"
> >
> > 	"github.com/langchain-ai/langsmith-go"
> > )
> >
> > ctx := context.Background()
> > client := langsmith.NewClient()
> >
> > queueID := "<queue-id>"
> > projectID := "<project-id>"
> > found, err := client.Runs.Query(ctx, langsmith.RunQueryParams{
> > 	Session: langsmith.F([]string{projectID}),
> > 	Limit:   langsmith.F(int64(5)),
> > })
> > runIDs := make([]string, len(found.Runs))
> > for i, run := range found.Runs {
> > 	runIDs[i] = run.ID
> > }
> > _, err = client.AnnotationQueues.Runs.New(ctx, queueID, langsmith.AnnotationQueueRunNewParams{
> > 	Body: langsmith.AnnotationQueueRunNewParamsBodyRunsUuidArray(runIDs),
> > })
> > ```
>
>> [选项卡] 之后
>>
>> ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > package main
> >
> > import (
> > 	"context"
> > 	"time"
> >
> > 	"github.com/langchain-ai/langsmith-go"
> > )
> >
> > ctx := context.Background()
> > client := langsmith.NewClient()
> >
> > queueID := "<queue-id>"
> > projectID := "<project-id>"
> > found, err := client.Runs.QueryV2(ctx, langsmith.RunQueryV2Params{
> > 	ProjectIDs:   langsmith.F([]string{projectID}),
> > 	MinStartTime: langsmith.F(time.Now().UTC().AddDate(0, 0, -30)),
> > 	Selects: langsmith.F([]langsmith.RunSelectField{
> > 		langsmith.RunSelectFieldID,
> > 		langsmith.RunSelectFieldProjectID,
> > 		langsmith.RunSelectFieldStartTime,
> > 	}),
> > 	PageSize: langsmith.F(int64(5)),
> > })
> > items := make([]langsmith.AnnotationQueueItemNewParamsItem, len(found.Items))
> > for i, run := range found.Items {
> > 	items[i] = langsmith.AnnotationQueueItemNewParamsItem{
> > 		ItemType:  langsmith.F(langsmith.AnnotationQueueItemNewParamsItemsItemTypeRun),
> > 		RunID:     langsmith.F(run.ID),
> > 		ProjectID: langsmith.F(run.ProjectID),
> > 		StartTime: langsmith.F(run.StartTime),
> > 	}
> > }
> > _, err = client.AnnotationQueues.Items.New(ctx, queueID, langsmith.AnnotationQueueItemNewParams{
> > 	Items: langsmith.F(items),
> > })
> > ```

> [选项卡] 卷曲
>
> `POST /runs` 采用运行 ID 字符串数组。 `POST /items` 采用 `items` 对象数组。
>
>> [选项卡] 之前
>>
>> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > QUEUE_ID="<queue-id>"
> > RUN_ID="<run-id>"
> >
> > curl -X POST "https://api.smith.langchain.com/api/v1/annotation-queues/$QUEUE_ID/runs" \
> >   -H "x-api-key: $LANGSMITH_API_KEY" \
> >   -H "Content-Type: application/json" \
> >   -d "[\"$RUN_ID\"]"
> > ```
>
>> [选项卡] 之后
>>
>> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > QUEUE_ID="<queue-id>"
> > RUN_ID="<run-id>"
> > PROJECT_ID="<project-id>"
> > START_TIME="2026-06-01T12:00:00Z"
> >
> > curl -X POST "https://api.smith.langchain.com/api/v1/platform/annotation-queues/$QUEUE_ID/items" \
> >   -H "x-api-key: $LANGSMITH_API_KEY" \
> >   -H "Content-Type: application/json" \
> >   -d "{\"items\": [{\"item_type\": \"RUN\", \"run_id\": \"$RUN_ID\", \"project_id\": \"$PROJECT_ID\", \"start_time\": \"$START_TIME\"}]}"
> > ```

## 分享和阅读公开跑步

共享跟踪、删除其公共访问权限或读取公开共享跟踪中的运行。 v2 方法使用显式 SmithDB 坐标并返回选择驱动的运行对象。公共读取方法不需要 LangSmith API 密钥。将共享令牌视为秘密，因为拥有该令牌的任何人都可以读取共享跟踪。

### 主要变化

#### 方法名称

> [选项卡] Python
>
> |之前 |之后 |
> | - | - |
> | `client.share_run()` | `client.runs.share.create()` |
> | `client.unshare_run()` | `client.runs.share.delete()` |
> | `client.list_shared_runs()` | `client.public.runs.query()` |
> | `client.read_shared_run()` | `client.public.runs.retrieve()` |
> | `client.read_run_shared_link()` | `client.runs.retrieve(selects=["SHARE_URL"])` |
>
>> [!注意]
>>
>> v2 资源方法是异步的。用`await`给他们打电话。

> [选项卡] TypeScript
>
> |之前 |之后 |
> | - | - |
> | `client.shareRun()` | `client.runs.share.create()` |
> | `client.unshareRun()` | `client.runs.share.delete()` |
> | `client.listSharedRuns()` | `client.public.runs.query()` |
> | `client.listSharedRuns({ runIds: [...] })` | `client.public.runs.retrieve()` |
> | `client.readRunSharedLink()` | `client.runs.retrieve({ selects: ["SHARE_URL"] })` |
>
> TypeScript 没有直接相当于 Python 的 `read_shared_run`。过滤后的`listSharedRuns`调用迁移到点读取方法。

> [选项卡] Java
>
> Java SDK 没有传统的方便迁移方法。使用 [⟦T118⟧](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/runs/ShareService.html) 和公共 [⟦T119⟧](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/public_/RunService.html) 进行 v2 访问。 Kotlin 使用 Java SDK；没有单独的 Kotlin 参考站点。

> [选项卡] 前往
>
> Go SDK 没有传统的便捷迁移方法。使用 [⟦T120⟧](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#RunShareService) 和 [⟦T121⟧](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#PublicRunService) 进行 v2 访问。> [选项卡] 卷曲
>
> |运营|之前 |之后 |
> | - | - | - |
> |分享 | `PUT /api/v1/runs/{run_id}/share` | `POST /api/v2/runs/{run_id}/share` |
> |取消分享 | `DELETE /api/v1/runs/{run_id}/share` | `DELETE /api/v2/runs/{trace_id}/share` |
> |查询公开运行 | `POST /api/v1/public/{share_token}/runs/query` | `POST /api/v2/public/{share_token}/runs/query` |
> |检索公开运行 | `GET /api/v1/public/{share_token}/run/{run_id}` | `GET /api/v2/public/{share_token}/run/{run_id}` |
> |阅读分享状态 | `GET /api/v1/runs/{run_id}/share` | `GET /api/v2/runs/{run_id}?selects=SHARE_URL` |
>
> 没有运行 ID 的旧版 `GET /api/v1/public/{share_token}/run` 端点没有直接的 v2 等效项。

#### 共享和取消共享参数

> [选项卡] Python
>
> * `runs.share.create` 将运行 ID 作为其位置参数。传递 `session_id`（跟踪项目 UUID）和 `trace_id`（根跟踪 UUID）。
> * `runs.share.delete` 采用根跟踪 ID，而不是任意子运行 ID。传递跟踪项目 UUID 作为 `session_id`。
> * `share_id` 已删除。服务器生成共享令牌。

> [选项卡] TypeScript
>
> * `runs.share.create` 将运行 ID 作为其位置参数。在选项对象中传递 `session_id` 和根 `trace_id`。
> * `runs.share.delete` 采用根跟踪 ID 和包含 `session_id` 的选项对象。
> * `shareId` 已删除。服务器生成共享令牌。

> [选项卡] 卷曲
>
> * v2共享请求体包含`session_id`和`trace_id`。
> * v2 取消共享路径标识根跟踪。其请求正文包含`session_id`。
> * v2 取消共享操作是幂等的并返回`204 No Content`。尽管生成的参数类型可能会将这些坐标标记为可选，但在共享时提供 `session_id` 和 `trace_id`，在取消共享时提供 `session_id`。 SmithDB 使用这些坐标进行查找。

#### 公共读取参数

* `public.runs.query` 获取共享代币和`selects` 列表。该令牌将查询范围限定为完整的共享跟踪。旧版运行 ID 过滤器和游标响应已被删除。
* `public.runs.retrieve` 需要运行 ID、共享代币、精确运行 `start_time` 和 `selects` 列表。从`public.runs.query`获取准确存储的开始时间。
* 公共点读取仅返回选定的字段。对于以下示例，请使用 `ID`、`NAME`、`RUN_TYPE`、`STATUS` 和 `START_TIME`。
* 要检索经过身份验证的运行的公共 URL，请使用 `selects=["SHARE_URL"]` 调用 `runs.retrieve`，然后读取 `run.share_url`。提供 `start_time` 可以为 SmithDB 提供最高效的查找。

不要从 API 源构建公共 URL。检索 `share_url` 使用部署的已配置应用程序源，适用于云和自托管部署。

#### 回应|运营|之前 |之后 |
| - | - | - |
|分享 |运行 ID、共享跟踪 ID 和共享令牌 | `share_token` |
|取消分享 | `{"message": "Run unshared"}` | `204 No Content` |
|查询公开运行 | `runs` 和 `cursors` | `items` |
|检索公开运行 |完整的传统运行|选择驱动运行对象|
|阅读分享状态 |共享状态对象或 `null` |共享时使用 `share_url` 运行对象 |

### 示例

这些示例在读取点之前查询公共跟踪，因为 `public.runs.retrieve` 需要运行的精确存储的 `start_time`。

> [选项卡] Python
>
>> [选项卡] 之前
>>
>> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > # Share a trace.
> > share_url = client.share_run(run_id)
> >
> > # Read the shared runs and one specific run.
> > runs = list(client.list_shared_runs(share_token))
> > run = client.read_shared_run(share_token, run_id=run_id)
> >
> > # Check whether the run is shared.
> > share_url = client.read_run_shared_link(run_id)
> >
> > # Remove public access.
> > client.unshare_run(run_id)
> > ```
>
>> [选项卡] 之后
>>
>> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > PUBLIC_RUN_SELECTS = ["ID", "NAME", "RUN_TYPE", "STATUS", "START_TIME"]
> >
> > # Share a trace.
> > share = await client.runs.share.create(
> >     run_id,
> >     session_id=project_id,
> >     trace_id=trace_id,
> > )
> > if not share.share_token:
> >     raise RuntimeError("The server did not return a share token")
> > share_token = share.share_token
> >
> > # Query the public trace and use its stored start time for a point read.
> > response = await client.public.runs.query(
> >     share_token,
> >     selects=PUBLIC_RUN_SELECTS,
> > )
> > runs = response.items
> > item = next(run for run in runs if str(run.id) == run_id)
> > run = await client.public.runs.retrieve(
> >     run_id,
> >     share_token=share_token,
> >     selects=PUBLIC_RUN_SELECTS,
> >     start_time=item.start_time,
> > )
> >
> > # Retrieve the deployment-aware public URL for an authenticated run.
> > authenticated_run = await client.runs.retrieve(
> >     run_id,
> >     project_id=project_id,
> >     start_time=item.start_time,
> >     selects=["SHARE_URL"],
> > )
> > share_url = authenticated_run.share_url
> >
> > # Remove public access by root trace ID.
> > await client.runs.share.delete(trace_id, session_id=project_id)
> > ```

> [选项卡] TypeScript
>
>> [选项卡] 之前
>>
>> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > // Share a trace.
> > const shareUrl = await client.shareRun(runId);
> >
> > // Read the shared runs and one specific run.
> > const runs = await client.listSharedRuns(shareToken);
> > const [run] = await client.listSharedRuns(shareToken, {
> >   runIds: [runId],
> > });
> >
> > // Check whether the run is shared.
> > const existingShareUrl = await client.readRunSharedLink(runId);
> >
> > // Remove public access.
> > await client.unshareRun(runId);
> > ```
>
>> [选项卡] 之后
>>
>> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > const PUBLIC_RUN_SELECTS = [
> >   "ID",
> >   "NAME",
> >   "RUN_TYPE",
> >   "STATUS",
> >   "START_TIME",
> > ] as const;
> >
> > // Share a trace.
> > const share = await client.runs.share.create(runId, {
> >   session_id: projectId,
> >   trace_id: traceId,
> > });
> > if (!share.share_token) {
> >   throw new Error("The server did not return a share token");
> > }
> > const shareToken = share.share_token;
> >
> > // Query the public trace and use its stored start time for a point read.
> > const response = await client.public.runs.query(shareToken, {
> >   selects: [...PUBLIC_RUN_SELECTS],
> > });
> > const runs = response.items ?? [];
> > const item = runs.find((candidate) => candidate.id === runId);
> > if (!item?.start_time) {
> >   throw new Error("The public run or its start_time was not found");
> > }
> > const run = await client.public.runs.retrieve(runId, {
> >   share_token: shareToken,
> >   selects: [...PUBLIC_RUN_SELECTS],
> >   start_time: item.start_time,
> > });
> >
> > // Retrieve the deployment-aware public URL for an authenticated run.
> > const authenticatedRun = await client.runs.retrieve(runId, {
> >   project_id: projectId,
> >   start_time: item.start_time,
> >   selects: ["SHARE_URL"],
> > });
> > const shareUrl = authenticatedRun.share_url;
> >
> > // Remove public access by root trace ID.
> > await client.runs.share.delete(traceId, { session_id: projectId });
> > ```

> [选项卡] 卷曲
>
>> [选项卡] 之前
>>
>> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > # Share a run.
> > curl --request PUT \
> >   "$API_URL/api/v1/runs/$RUN_ID/share" \
> >   --header "X-API-Key: $LANGSMITH_API_KEY"
> >
> > # Query the public trace and retrieve one public run.
> > curl --request POST \
> >   "$API_URL/api/v1/public/$SHARE_TOKEN/runs/query" \
> >   --header "Content-Type: application/json" \
> >   --data '{}'
> > curl "$API_URL/api/v1/public/$SHARE_TOKEN/run/$RUN_ID"
> >
> > # Read the share state, then remove public access.
> > curl "$API_URL/api/v1/runs/$RUN_ID/share" \
> >   --header "X-API-Key: $LANGSMITH_API_KEY"
> > curl --request DELETE \
> >   "$API_URL/api/v1/runs/$RUN_ID/share" \
> >   --header "X-API-Key: $LANGSMITH_API_KEY"
> > ```
>
>> [选项卡] 之后
>>
>> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > # Share a trace.
> > curl --request POST \
> >   "$API_URL/api/v2/runs/$RUN_ID/share" \
> >   --header "X-API-Key: $LANGSMITH_API_KEY" \
> >   --header "Content-Type: application/json" \
> >   --data "{\"session_id\":\"$PROJECT_ID\",\"trace_id\":\"$TRACE_ID\"}"
> >
> > # Query the public trace.
> > curl --request POST \
> >   "$API_URL/api/v2/public/$SHARE_TOKEN/runs/query" \
> >   --header "Content-Type: application/json" \
> >   --data '{"selects":["ID","NAME","RUN_TYPE","STATUS","START_TIME"]}'
> >
> > # Retrieve one public run using its exact start time from the query response.
> > curl --get "$API_URL/api/v2/public/$SHARE_TOKEN/run/$RUN_ID" \
> >   --data-urlencode "start_time=$START_TIME" \
> >   --data-urlencode "selects=ID" \
> >   --data-urlencode "selects=NAME" \
> >   --data-urlencode "selects=RUN_TYPE" \
> >   --data-urlencode "selects=STATUS" \
> >   --data-urlencode "selects=START_TIME"
> >
> > # Retrieve the deployment-aware public URL for an authenticated run.
> > curl --get "$API_URL/api/v2/runs/$RUN_ID" \
> >   --header "X-API-Key: $LANGSMITH_API_KEY" \
> >   --data-urlencode "project_id=$PROJECT_ID" \
> >   --data-urlencode "start_time=$START_TIME" \
> >   --data-urlencode "selects=SHARE_URL"
> >
> > # Remove public access by root trace ID.
> > curl --request DELETE \
> >   "$API_URL/api/v2/runs/$TRACE_ID/share" \
> >   --header "X-API-Key: $LANGSMITH_API_KEY" \
> >   --header "Content-Type: application/json" \
> >   --data "{\"session_id\":\"$PROJECT_ID\"}"
> > ```

## 反馈：创建

为跑步创建反馈（分数、更正或评论）。

### 主要变化

#### 必需参数

方法名称和端点不变。仅会话（项目）ID 要求发生变化。> [选项卡] Python
>
>> [!警告]
>>
>> `create_feedback` 现在需要 `session_id`，即拥有运行的项目（会话）的 UUID。以前它是可选的。
>
> |之前 |之后 |笔记|
> | - | - | - |
> | `session_id`（可选）| `session_id`（**必填**）|拥有运行的项目的 UUID；如果您还没有，请使用 `client.read_project()` 解决它 |

> [选项卡] TypeScript
>
>> [!警告]
>>
>> `client.createFeedback` 现在需要 `sessionId`，即拥有运行的项目（会话）的 UUID。以前它是可选的。
>
> |之前 |之后 |笔记|
> | - | - | - |
> | `sessionId`（可选）| `sessionId`（**必填**）|拥有运行的项目的 UUID；如果您还没有，请使用 `client.readProject()` 解决它 |

> [选项卡] Java
>
>> [!警告]
>>
>> 现在需要`FeedbackCreateSchema.sessionId()`。以前它是可选的。
>
> |之前 |之后 |笔记|
> | - | - | - |
> | `sessionId()`（可选）| `sessionId()`（**必填**）|拥有运行的项目的 UUID；如果您还没有，请使用 `client.sessions().list()` 解决它 |> [选项卡] 前往
>
>> [!警告]
>>
>> 现在需要`FeedbackCreateSchemaParam.SessionID`。以前它是可选的。
>
> |之前 |之后 |笔记|
> | - | - | - |
> | `SessionID`（可选）| `SessionID`（**必填**）|拥有运行的项目的 UUID；如果您还没有，请使用 `client.Sessions.List()` 解决它 |

> [选项卡] 卷曲
>
>> [!警告]
>>
>> `POST /api/v1/feedback` 现在要求请求正文中包含 `session_id` 字段。以前它是可选的。
>
> |之前 |之后 |笔记|
> | - | - | - |
> | `session_id`（可选）| `session_id`（**必填**）|拥有运行的项目的 UUID；如果您还没有，请使用 `GET /api/v1/sessions` 解决它 |

### 示例

#### 创建反馈时提供`session_id`

> [选项卡] Python
>
> `create_feedback` 现在除了 `run_id` 之外还需要 `session_id`。
>
>> [选项卡] 之前
>>
>> ```python Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > from langsmith import Client
> >
> > client = Client()
> > run_id = "<run-id>"
> > client.create_feedback(
> >     run_id=run_id,
> >     key="user_feedback",
> >     score=1,
> > )
> > ```
>
>> [选项卡] 之后
>>
>> ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > from langsmith import Client
> >
> > client = Client()
> > run_id = "<run-id>"
> > session_id = "<session-id>"
> > client.create_feedback(
> >     run_id=run_id,
> >     key="user_feedback",
> >     score=1,
> >     session_id=session_id,
> > )
> > ```

> [选项卡] TypeScript
>
> `client.createFeedback` 现在除了 `runId` 之外还需要 `sessionId`。
>
>> [选项卡] 之前
>>
>> ```ts Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > import { Client } from "langsmith";
> >
> > const client = new Client();
> > let runId = "<run-id>";
> > await client.createFeedback(runId, "user_feedback", {
> >   score: 1,
> > });
> > ```
>
>> [选项卡] 之后
>>
>> ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > import { Client } from "langsmith";
> >
> > const client = new Client();
> > let runId = "<run-id>";
> > let sessionId = "<session-id>";
> > await client.createFeedback(runId, "user_feedback", {
> >   score: 1,
> >   sessionId,
> > });
> > ```

> [选项卡] Java
>
> `.create()` 现在除了 `.runId()` 之外还需要 `.sessionId()`。
>
>> [选项卡] 之前
>>
>> ```kotlin Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > import com.langchain.smith.client.LangsmithClient
> > import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
> > import com.langchain.smith.models.feedback.FeedbackCreateSchema
> >
> > val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()
> >
> > var runId = "<run-id>"
> > client.feedback().create(
> >     FeedbackCreateSchema.builder()
> >         .runId(runId)
> >         .key("user_feedback")
> >         .score(1.0)
> >         .build()
> > )
> > ```
>
>> [选项卡] 之后
>>
>> ```kotlin After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > import com.langchain.smith.client.LangsmithClient
> > import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
> > import com.langchain.smith.models.feedback.FeedbackCreateSchema
> >
> > val client: LangsmithClient = LangsmithOkHttpClient.fromEnv()
> >
> > var runId = "<run-id>"
> > var sessionId = "<session-id>"
> > client.feedback().create(
> >     FeedbackCreateSchema.builder()
> >         .runId(runId)
> >         .key("user_feedback")
> >         .score(1.0)
> >         .sessionId(sessionId)
> >         .build()
> > )
> > ```

> [选项卡] 前往
>
> `Feedback.New` 现在除了 `RunID` 之外还需要 `SessionID`。
>
>> [选项卡] 之前
>>
>> ```go Before theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > package main
> >
> > import (
> > 	"context"
> >
> > 	"github.com/langchain-ai/langsmith-go"
> > 	"github.com/langchain-ai/langsmith-go/shared"
> > )
> >
> > ctx := context.Background()
> > client := langsmith.NewClient()
> >
> > runID := "<run-id>"
> > var err error
> > _, err = client.Feedback.New(ctx, langsmith.FeedbackNewParams{
> > 	FeedbackCreateSchema: langsmith.FeedbackCreateSchemaParam{
> > 		RunID: langsmith.F(runID),
> > 		Key:   langsmith.F("user_feedback"),
> > 		Score: langsmith.F[langsmith.FeedbackCreateSchemaScoreUnionParam](shared.UnionFloat(1.0)),
> > 	},
> > })
> > ```
>
>> [选项卡] 之后
>>
>> ```go After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > package main
> >
> > import (
> > 	"context"
> >
> > 	"github.com/langchain-ai/langsmith-go"
> > 	"github.com/langchain-ai/langsmith-go/shared"
> > )
> >
> > ctx := context.Background()
> > client := langsmith.NewClient()
> >
> > runID := "<run-id>"
> > sessionID := "<session-id>"
> > var err error
> > _, err = client.Feedback.New(ctx, langsmith.FeedbackNewParams{
> > 	FeedbackCreateSchema: langsmith.FeedbackCreateSchemaParam{
> > 		RunID:     langsmith.F(runID),
> > 		Key:       langsmith.F("user_feedback"),
> > 		Score:     langsmith.F[langsmith.FeedbackCreateSchemaScoreUnionParam](shared.UnionFloat(1.0)),
> > 		SessionID: langsmith.F(sessionID),
> > 	},
> > })
> > ```> [选项卡] 卷曲
>
> 除了 `run_id` 之外，`POST /api/v1/feedback` 现在还需要 `session_id` 字段。
>
>> [选项卡] 之前
>>
>> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > RUN_ID="<run-id>"
> >
> > curl -X POST "https://api.smith.langchain.com/api/v1/feedback" \
> >   -H "x-api-key: $LANGSMITH_API_KEY" \
> >   -H "Content-Type: application/json" \
> >   -d "$(jq -n --arg run "$RUN_ID" '{"run_id": $run, "key": "user_feedback", "score": 1}')"
> > ```
>
>> [选项卡] 之后
>>
>> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > RUN_ID="<run-id>"
> > SESSION_ID="<session-id>"
> >
> > curl -X POST "https://api.smith.langchain.com/api/v1/feedback" \
> >   -H "x-api-key: $LANGSMITH_API_KEY" \
> >   -H "Content-Type: application/json" \
> >   -d "$(jq -n --arg run "$RUN_ID" --arg session "$SESSION_ID" '{"run_id": $run, "key": "user_feedback", "score": 1, "session_id": $session}')"
> > ```

## 另请参阅

* [Retrieve runs](/langsmith/smithdb-sdk-migration-runs)
* [Dataset experiment runs](/langsmith/smithdb-sdk-migration-experiments)
* [Migration overview](/langsmith/smithdb-sdk-migration)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/smithdb-sdk-migration-feedback.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。