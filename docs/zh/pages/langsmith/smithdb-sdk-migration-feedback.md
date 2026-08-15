<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Migrate feedback and sharing methods to SmithDB | https://docs.langchain.com/langsmith/smithdb-sdk-migration-feedback -->

# 将反馈和共享方法迁移到 SmithDB

将 LangSmith SDK 反馈、注释队列和公共运行方法迁移到 SmithDB 支持的等效方法。

这些方法将运行添加到注释队列、公开共享运行并创建反馈。有关弃用日期、最低 SDK 版本以及适用于每种方法的代理提示，请参阅 [Migrate to SmithDB-backed SDK methods](/langsmith/smithdb-sdk-migration)。

## 注释队列：添加运行

将运行添加到注释队列。 SmithDB 支持的路径采用每个运行的完整查找键（其 ID 加上 `session_id`（项目 UUID）和 `start_time` 分区键），因此可以直接定位运行而不是扫描。

<Note>
  此方法保留在现有客户端上，而不是新的 `runs` v2 客户端上，因此 [Exceptions](/langsmith/smithdb-sdk-migration#exceptions) 表不适用 - 错误处理未更改。
</Note>

### 主要变化

#### 方法名称

<Tabs>
  <Tab title="Python">
    没有变化——`client.add_runs_to_annotation_queue()`。 SmithDB 路径由您传递的参数选择（请参阅下面的输入）。

    完整参数列表请参见[reference](https://reference.langchain.com/python/langsmith/client/Client/add_runs_to_annotation_queue)。
  </Tab>

  <Tab title="TypeScript">
    没有变化——`client.addRunsToAnnotationQueue()`。 SmithDB 路径由您传递的参数选择（请参阅下面的输入）。

    完整参数列表请参见[reference](https://reference.langchain.com/javascript/langsmith/client/Client/addRunsToAnnotationQueue)。
  </Tab><Tab title="Java">
    |之前 |之后|
    | ------------------------------------------- | ------------------------------------------------ |
    | `client.annotationQueues().runs().create()` | `client.annotationQueues().runs().createByKey()` |

    完整参数列表请参见[reference](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/annotationqueues/RunService.html)。
  </Tab>

  <Tab title="Go">
    |之前 |之后|
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

    准确提供`runs`或`run_ids`之一；通过两项都会提高 `LangSmithUserError`。
  </Tab>

  <Tab title="TypeScript">
    <Warning>
      SmithDB 路径除了 `runId` 之外，还需要每次运行的 `sessionId`（项目 UUID）和 `startTime`。这些已经存在于您获取的运行对象上（例如从`client.listRuns()`）。
    </Warning>|之前 (`string[]`) |之后(`RunKey[]`) |笔记|
    | ------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
    | `runs: string[]` | *（已弃用）* |旧路径（运行 ID 字符串数组）。仍然有效并达到`/runs`。将在未来版本中删除 |
    | *（不可用）* | `runs: RunKey[]` | **新首选。** 每个`RunKey`都是`{ runId, sessionId, startTime }`； `startTime` 接受 `Date`、纪元 ms 或 ISO 字符串 |

    两个形状的第二个参数的位置相同；当您传递`RunKey[]`时，SDK会选择SmithDB路径。
  </Tab><Tab title="Java">
    |之前 (`RunCreateParams`) |之后(`RunCreateByKeyParams`)|笔记|
    | ------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------- |
    | `.bodyOfRunsUuidArray(List<String>)` | *（已删除）* |旧体；仅运行 ID |
    | *（不可用）* | `.addBody(RunCreateByKeyParams.Body)` |每个 `Body` 都有 `runId`、`sessionId` 和 `startTime` |
    | `.queueId(String)` | `.queueId(String)` |不变 |
    | `.extendTraceRetention(Boolean)` | `.extendTraceRetention(Boolean)` |未更改的可选查询参数 |
  </Tab><Tab title="Go">
    |之前 (`AnnotationQueueRunNewParams`) |之后(`AnnotationQueueRunNewByKeyParams`) |笔记|
    | ------------------------------------------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------- |
    | `Body: AnnotationQueueRunNewParamsBodyRunsUuidArray` (`[]string`) | *（已删除）* |旧体；仅运行 ID |
    | *（不可用）* | `Body: []AnnotationQueueRunNewByKeyParamsBody` |每个都有 `RunID`、`SessionID` 和 `StartTime` |
    | *（不可用）* | `ExtendTraceRetention` |可选查询参数 |
  </Tab>

  <Tab title="cURL">
    <Warning>
      `/runs/by-key` 请求正文是一个对象数组，而不是 ID 字符串数组。每个对象都需要 `run_id`、`session_id`（项目 UUID）和 `start_time` (RFC3339)。
    </Warning>|之前（`POST /runs`本体）|之后（`POST /runs/by-key`本体）|笔记|
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
    `createByKey()` 返回 `List<RunCreateByKeyResponse>` — 返回相同的形状 `create()`，包括 `id()`、`queueId()`、`runId()`、`addedAt()` 和 `lastReviewedTime()`。
  </Tab>

  <Tab title="Go">
    `NewByKey()` 返回 `*[]AnnotationQueueRunNewByKeyResponse` — 返回相同的形状 `New()`，包括 `ID`、`QueueID`、`RunID`、`AddedAt` 和 `LastReviewedTime`。
  </Tab>

  <Tab title="cURL">
    没有变化。 `POST /runs/by-key` 返回创建的队列运行记录数组（`id`、`queue_id`、`run_id`、`added_at`、`last_reviewed_time`），与`POST /runs`形状相同。
  </Tab>
</Tabs>

### 示例

#### 将运行添加到队列<Tabs>
  <Tab title="Python">
    `run_ids=` 采用运行 ID 的简单列表。 `runs=` 获取每次运行的完整查找键 — 从已有的运行对象中读取 `run_id`、`session_id` 和 `start_time`。

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
    传递旧路径的运行 ID 字符串数组，或从已有的运行对象构建的 `RunKey` 对象（`runId`、`sessionId`、`startTime`）数组。

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
    `New()` 通过 `AnnotationQueueRunNewParamsBodyRunsUuidArray` 获取运行 ID。 `NewByKey()` 每次运行需要 `AnnotationQueueRunNewByKeyParamsBody` 以及 `RunID`、`SessionID` 和 `StartTime`。

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
  </Tab>

  <Tab title="cURL">
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
      </Tab><Tab title="After">
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
    |之前 |之后 |
    | ------------------------------------------- | -------------------------------------------------------- |
    | `client.share_run()` | `client.runs.share.create()` |
    | `client.unshare_run()` | `client.runs.share.delete()` |
    | `client.list_shared_runs()` | `client.public.runs.query()` |
    | `client.read_shared_run()` | `client.public.runs.retrieve()` |
    | `client.read_run_shared_link()` | `client.runs.retrieve(selects=["SHARE_URL"])` |

    <Note>
      v2 资源方法是异步的。用 `await` 打电话给他们。
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
    Java SDK 没有传统的方便迁移方法。使用[⟦T179⟧](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/runs/ShareService.html)和公共[⟦T180⟧](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/public_/RunService.html)进行v2访问。 Kotlin 使用 Java SDK；没有单独的 Kotlin 参考站点。
  </Tab>

  <Tab title="Go">
    Go SDK 没有传统的便捷迁移方法。使用 [⟦T181⟧](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#RunShareService) 和 [⟦T182⟧](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#PublicRunService) 进行 v2 访问。
  </Tab><Tab title="cURL">
    |运营|之前 |之后|
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
    * `runs.share.delete` 采用根跟踪 ID，而不是任意子运行 ID。将跟踪项目 UUID 作为 `session_id` 传递。
    * `share_id` 已删除。服务器生成共享令牌。
  </Tab><Tab title="TypeScript">
    * `runs.share.create` 将运行 ID 作为其位置参数。在选项对象中传递 `session_id` 和根 `trace_id`。
    * `runs.share.delete` 采用根跟踪 ID 和包含 `session_id` 的选项对象。
    * `shareId` 已删除。服务器生成共享令牌。
  </Tab>

  <Tab title="cURL">
    * v2共享请求体包含`session_id`和`trace_id`。
    * v2 取消共享路径标识根跟踪。其请求体包含`session_id`。
    * v2 取消共享操作是幂等的并返回`204 No Content`。
  </Tab>
</Tabs>

尽管生成的参数类型可能会将这些坐标标记为可选，但在共享时提供 `session_id` 和 `trace_id`，在取消共享时提供 `session_id`。 SmithDB 使用这些坐标进行查找。

#### 公共读取参数* `public.runs.query` 获取共享代币和`selects` 列表。该令牌将查询范围限定为完整的共享跟踪。旧版运行 ID 过滤器和游标响应已被删除。
* `public.runs.retrieve` 需要运行 ID、共享令牌、精确运行 `start_time` 和 `selects` 列表。从`public.runs.query`获取准确存储的开始时间。
* 公共点读取仅返回选定的字段。对于以下示例，请使用 `ID`、`NAME`、`RUN_TYPE`、`STATUS` 和 `START_TIME`。
* 要检索经过身份验证的运行的公共 URL，请使用 `selects=["SHARE_URL"]` 调用 `runs.retrieve`，然后读取 `run.share_url`。提供 `start_time` 可以为 SmithDB 提供最高效的查找。

不要从 API 源构建公共 URL。检索 `share_url` 使用部署的已配置应用程序源，适用于云和自托管部署。

#### 回应|运营|之前 |之后|
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
  </Tab>

  <Tab title="cURL">
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
      </Tab><Tab title="After">
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
      `POST /api/v1/feedback` 现在需要在请求正文中包含 `session_id` 字段。以前它是可选的。
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
    除了`runId`之外，`client.createFeedback`现在还需要`sessionId`。

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
    除了`.runId()`之外，`.create()`现在还需要`.sessionId()`。

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
    除了`RunID`之外，`Feedback.New`现在还需要`SessionID`。

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

## 另请参阅

* [Retrieve runs](/langsmith/smithdb-sdk-migration-runs)
* [Dataset experiment runs](/langsmith/smithdb-sdk-migration-experiments)
* [Migration overview](/langsmith/smithdb-sdk-migration)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/smithdb-sdk-migration-feedback.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>