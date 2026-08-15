<!-- langchain-docs: Migrate feedback and sharing methods to SmithDB | https://docs.langchain.com/langsmith/smithdb-sdk-migration-feedback -->

# Migrate feedback and sharing methods to SmithDB

Migrate the LangSmith SDK feedback, annotation queue, and public run methods to their SmithDB-backed equivalents.

These methods add runs to annotation queues, share runs publicly, and create feedback. For deprecation dates, minimum SDK versions, and the agent prompt that applies to every method, see [Migrate to SmithDB-backed SDK methods](/langsmith/smithdb-sdk-migration).

## Annotation queues: add runs

Add runs to an annotation queue. The SmithDB-backed path takes each run's full lookup key—its ID plus the `session_id` (project UUID) and `start_time` partition keys—so the run can be located directly instead of scanned for.

<Note>
  This method stays on the existing client, not the new `runs` v2 client, so the [Exceptions](/langsmith/smithdb-sdk-migration#exceptions) table does not apply—error handling is unchanged.
</Note>

### Main changes

#### Method name

<Tabs>
  <Tab title="Python">
    No change—`client.add_runs_to_annotation_queue()`. The SmithDB path is selected by the parameters you pass (see Inputs below).

    See the [reference](https://reference.langchain.com/python/langsmith/client/Client/add_runs_to_annotation_queue) for the full parameter list.
  </Tab>

  <Tab title="TypeScript">
    No change—`client.addRunsToAnnotationQueue()`. The SmithDB path is selected by the argument you pass (see Inputs below).

    See the [reference](https://reference.langchain.com/javascript/langsmith/client/Client/addRunsToAnnotationQueue) for the full parameter list.
  </Tab>

  <Tab title="Java">
    | Before                                      | After                                            |
    | ------------------------------------------- | ------------------------------------------------ |
    | `client.annotationQueues().runs().create()` | `client.annotationQueues().runs().createByKey()` |

    See the [reference](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/annotationqueues/RunService.html) for the full parameter list.
  </Tab>

  <Tab title="Go">
    | Before                               | After                                     |
    | ------------------------------------ | ----------------------------------------- |
    | `client.AnnotationQueues.Runs.New()` | `client.AnnotationQueues.Runs.NewByKey()` |

    See the [reference](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#AnnotationQueueRunService.NewByKey) for the full parameter list.
  </Tab>

  <Tab title="cURL">
    | Before                                           | After                                                   |
    | ------------------------------------------------ | ------------------------------------------------------- |
    | `POST /api/v1/annotation-queues/{queue_id}/runs` | `POST /api/v1/annotation-queues/{queue_id}/runs/by-key` |

    See the [API doc](/langsmith/smith-api/annotation-queues/add-runs-to-annotation-queue-by-key) for the full parameter list.
  </Tab>
</Tabs>

#### Inputs

<Tabs>
  <Tab title="Python">
    <Warning>
      The SmithDB path needs each run's `session_id` (project UUID) and `start_time` in addition to its `run_id`. These are already present on the run objects you fetch (for example from `client.list_runs()`).
    </Warning>

    | Before (`run_ids`)           | After (`runs`)           | Notes                                                                                                          |
    | ---------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
    | `run_ids: list[UUID \| str]` | *(deprecated)*           | Legacy path. Still works and hits `/runs`, resolving each run server-side. Will be removed in a future release |
    | *(not available)*            | `runs: Sequence[RunKey]` | **New preferred.** Each `RunKey` is a `TypedDict` with `run_id`, `session_id`, and `start_time`                |

    Provide exactly one of `runs` or `run_ids`; passing both raises a `LangSmithUserError`.
  </Tab>

  <Tab title="TypeScript">
    <Warning>
      The SmithDB path needs each run's `sessionId` (project UUID) and `startTime` in addition to its `runId`. These are already present on the run objects you fetch (for example from `client.listRuns()`).
    </Warning>

    | Before (`string[]`) | After (`RunKey[]`) | Notes                                                                                                                        |
    | ------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
    | `runs: string[]`    | *(deprecated)*     | Legacy path (array of run-ID strings). Still works and hits `/runs`. Will be removed in a future release                     |
    | *(not available)*   | `runs: RunKey[]`   | **New preferred.** Each `RunKey` is `{ runId, sessionId, startTime }`; `startTime` accepts a `Date`, epoch ms, or ISO string |

    Both shapes are the same positional second argument; the SDK selects the SmithDB path when you pass `RunKey[]`.
  </Tab>

  <Tab title="Java">
    | Before (`RunCreateParams`)           | After (`RunCreateByKeyParams`)        | Notes                                                 |
    | ------------------------------------ | ------------------------------------- | ----------------------------------------------------- |
    | `.bodyOfRunsUuidArray(List<String>)` | *(removed)*                           | Legacy body; run IDs only                             |
    | *(not available)*                    | `.addBody(RunCreateByKeyParams.Body)` | Each `Body` has `runId`, `sessionId`, and `startTime` |
    | `.queueId(String)`                   | `.queueId(String)`                    | Unchanged                                             |
    | `.extendTraceRetention(Boolean)`     | `.extendTraceRetention(Boolean)`      | Unchanged optional query param                        |
  </Tab>

  <Tab title="Go">
    | Before (`AnnotationQueueRunNewParams`)                            | After (`AnnotationQueueRunNewByKeyParams`)     | Notes                                          |
    | ----------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
    | `Body: AnnotationQueueRunNewParamsBodyRunsUuidArray` (`[]string`) | *(removed)*                                    | Legacy body; run IDs only                      |
    | *(not available)*                                                 | `Body: []AnnotationQueueRunNewByKeyParamsBody` | Each has `RunID`, `SessionID`, and `StartTime` |
    | *(not available)*                                                 | `ExtendTraceRetention`                         | Optional query param                           |
  </Tab>

  <Tab title="cURL">
    <Warning>
      The `/runs/by-key` request body is an array of objects, not an array of ID strings. Each object needs `run_id`, `session_id` (project UUID), and `start_time` (RFC3339).
    </Warning>

    | Before (`POST /runs` body)        | After (`POST /runs/by-key` body)           | Notes                                                     |
    | --------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
    | `["<run-id>", ...]`               | `[{"run_id", "session_id", "start_time"}]` | `session_id` is the project UUID; `start_time` is RFC3339 |
    | `?extend_trace_retention` (query) | `?extend_trace_retention` (query)          | Unchanged optional query param                            |
  </Tab>
</Tabs>

#### Response

<Tabs>
  <Tab title="Python">
    No change. Both `run_ids=` and `runs=` return `None`.
  </Tab>

  <Tab title="TypeScript">
    No change. Both shapes resolve to `void`.
  </Tab>

  <Tab title="Java">
    `createByKey()` returns `List<RunCreateByKeyResponse>`—the same shape `create()` returned, with `id()`, `queueId()`, `runId()`, `addedAt()`, and `lastReviewedTime()`.
  </Tab>

  <Tab title="Go">
    `NewByKey()` returns `*[]AnnotationQueueRunNewByKeyResponse`—the same shape `New()` returned, with `ID`, `QueueID`, `RunID`, `AddedAt`, and `LastReviewedTime`.
  </Tab>

  <Tab title="cURL">
    No change. `POST /runs/by-key` returns the array of created queue-run records (`id`, `queue_id`, `run_id`, `added_at`, `last_reviewed_time`), the same shape as `POST /runs`.
  </Tab>
</Tabs>

### Examples

#### Add runs to a queue

<Tabs>
  <Tab title="Python">
    `run_ids=` takes a plain list of run IDs. `runs=` takes each run's full lookup key—read `run_id`, `session_id`, and `start_time` off the run objects you already have.

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
    Pass an array of run-ID strings for the legacy path, or an array of `RunKey` objects (`runId`, `sessionId`, `startTime`) built from the run objects you already have.

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
    `create()` takes run IDs via `bodyOfRunsUuidArray`. `createByKey()` takes a `Body` per run with `runId`, `sessionId`, and `startTime`.

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
    `New()` takes run IDs via `AnnotationQueueRunNewParamsBodyRunsUuidArray`. `NewByKey()` takes an `AnnotationQueueRunNewByKeyParamsBody` per run with `RunID`, `SessionID`, and `StartTime`.

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
    `POST /runs` takes an array of run-ID strings. `POST /runs/by-key` takes an array of objects, each with `run_id`, `session_id`, and `start_time`.

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

## Share and read public runs

Share a trace, remove its public access, or read the runs in a publicly shared trace. The v2 methods use explicit SmithDB coordinates and return select-driven run objects.

Public read methods do not require a LangSmith API key. Treat the share token as a secret because anyone with the token can read the shared trace.

### Main changes

#### Method names

<Tabs>
  <Tab title="Python">
    | Before                          | After                                         |
    | ------------------------------- | --------------------------------------------- |
    | `client.share_run()`            | `client.runs.share.create()`                  |
    | `client.unshare_run()`          | `client.runs.share.delete()`                  |
    | `client.list_shared_runs()`     | `client.public.runs.query()`                  |
    | `client.read_shared_run()`      | `client.public.runs.retrieve()`               |
    | `client.read_run_shared_link()` | `client.runs.retrieve(selects=["SHARE_URL"])` |

    <Note>
      The v2 resource methods are async. Call them with `await`.
    </Note>
  </Tab>

  <Tab title="TypeScript">
    | Before                                     | After                                              |
    | ------------------------------------------ | -------------------------------------------------- |
    | `client.shareRun()`                        | `client.runs.share.create()`                       |
    | `client.unshareRun()`                      | `client.runs.share.delete()`                       |
    | `client.listSharedRuns()`                  | `client.public.runs.query()`                       |
    | `client.listSharedRuns({ runIds: [...] })` | `client.public.runs.retrieve()`                    |
    | `client.readRunSharedLink()`               | `client.runs.retrieve({ selects: ["SHARE_URL"] })` |

    TypeScript did not have a direct equivalent of Python's `read_shared_run`. Filtered `listSharedRuns` calls migrate to the point-read method.
  </Tab>

  <Tab title="Java">
    The Java SDK has no legacy convenience methods to migrate. Use [`ShareService`](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/runs/ShareService.html) and the public [`RunService`](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/public_/RunService.html) for v2 access. Kotlin uses the Java SDK; there is no separate Kotlin reference site.
  </Tab>

  <Tab title="Go">
    The Go SDK has no legacy convenience methods to migrate. Use [`RunShareService`](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#RunShareService) and [`PublicRunService`](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#PublicRunService) for v2 access.
  </Tab>

  <Tab title="cURL">
    | Operation             | Before                                          | After                                           |
    | --------------------- | ----------------------------------------------- | ----------------------------------------------- |
    | Share                 | `PUT /api/v1/runs/{run_id}/share`               | `POST /api/v2/runs/{run_id}/share`              |
    | Unshare               | `DELETE /api/v1/runs/{run_id}/share`            | `DELETE /api/v2/runs/{trace_id}/share`          |
    | Query public runs     | `POST /api/v1/public/{share_token}/runs/query`  | `POST /api/v2/public/{share_token}/runs/query`  |
    | Retrieve a public run | `GET /api/v1/public/{share_token}/run/{run_id}` | `GET /api/v2/public/{share_token}/run/{run_id}` |
    | Read share state      | `GET /api/v1/runs/{run_id}/share`               | `GET /api/v2/runs/{run_id}?selects=SHARE_URL`   |

    The legacy `GET /api/v1/public/{share_token}/run` endpoint without a run ID has no direct v2 equivalent.
  </Tab>
</Tabs>

#### Share and unshare parameters

<Tabs>
  <Tab title="Python">
    * `runs.share.create` takes the run ID as its positional argument. Pass `session_id` (the tracing project UUID) and `trace_id` (the root trace UUID).
    * `runs.share.delete` takes the root trace ID, not an arbitrary child run ID. Pass the tracing project UUID as `session_id`.
    * `share_id` is removed. The server generates the share token.
  </Tab>

  <Tab title="TypeScript">
    * `runs.share.create` takes the run ID as its positional argument. Pass `session_id` and the root `trace_id` in the options object.
    * `runs.share.delete` takes the root trace ID and an options object containing `session_id`.
    * `shareId` is removed. The server generates the share token.
  </Tab>

  <Tab title="cURL">
    * The v2 share request body contains `session_id` and `trace_id`.
    * The v2 unshare path identifies the root trace. Its request body contains `session_id`.
    * The v2 unshare operation is idempotent and returns `204 No Content`.
  </Tab>
</Tabs>

Although generated parameter types may mark these coordinates as optional, provide `session_id` and `trace_id` when sharing, and provide `session_id` when unsharing. SmithDB uses these coordinates for the lookup.

#### Public read parameters

* `public.runs.query` takes the share token and a `selects` list. The token scopes the query to the complete shared trace. The legacy run-ID filter and cursor response are removed.
* `public.runs.retrieve` requires the run ID, share token, exact run `start_time`, and a `selects` list. Obtain the exact stored start time from `public.runs.query`.
* The public point read returns only selected fields. Use `ID`, `NAME`, `RUN_TYPE`, `STATUS`, and `START_TIME` for the examples below.
* To retrieve the public URL for an authenticated run, call `runs.retrieve` with `selects=["SHARE_URL"]`, then read `run.share_url`. Supplying `start_time` gives SmithDB the most efficient lookup.

Do not construct the public URL from the API origin. Retrieving `share_url` uses the deployment's configured application origin and works for both Cloud and self-hosted deployments.

#### Responses

| Operation             | Before                                   | After                                   |
| --------------------- | ---------------------------------------- | --------------------------------------- |
| Share                 | Run ID, shared trace ID, and share token | `share_token`                           |
| Unshare               | `{"message": "Run unshared"}`            | `204 No Content`                        |
| Query public runs     | `runs` and `cursors`                     | `items`                                 |
| Retrieve a public run | Full legacy run                          | Select-driven run object                |
| Read share state      | Share-state object or `null`             | Run object with `share_url` when shared |

### Examples

The examples query the public trace before the point read because `public.runs.retrieve` requires the run's exact stored `start_time`.

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

## Feedback: create

Create feedback (a score, correction, or comment) for a run.

### Main changes

#### Required parameter

The method name and endpoint are unchanged. Only the session (project) ID requirement changes.

<Tabs>
  <Tab title="Python">
    <Warning>
      `create_feedback` now requires `session_id`, the UUID of the project (session) that owns the run. It was previously optional.
    </Warning>

    | Before                  | After                       | Notes                                                                                                        |
    | ----------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------ |
    | `session_id` (optional) | `session_id` (**required**) | UUID of the project that owns the run; resolve it with `client.read_project()` if you do not already have it |
  </Tab>

  <Tab title="TypeScript">
    <Warning>
      `client.createFeedback` now requires `sessionId`, the UUID of the project (session) that owns the run. It was previously optional.
    </Warning>

    | Before                 | After                      | Notes                                                                                                       |
    | ---------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------- |
    | `sessionId` (optional) | `sessionId` (**required**) | UUID of the project that owns the run; resolve it with `client.readProject()` if you do not already have it |
  </Tab>

  <Tab title="Java">
    <Warning>
      `FeedbackCreateSchema.sessionId()` is now required. It was previously optional.
    </Warning>

    | Before                   | After                        | Notes                                                                                                           |
    | ------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
    | `sessionId()` (optional) | `sessionId()` (**required**) | UUID of the project that owns the run; resolve it with `client.sessions().list()` if you do not already have it |
  </Tab>

  <Tab title="Go">
    <Warning>
      `FeedbackCreateSchemaParam.SessionID` is now required. It was previously optional.
    </Warning>

    | Before                 | After                      | Notes                                                                                                         |
    | ---------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------- |
    | `SessionID` (optional) | `SessionID` (**required**) | UUID of the project that owns the run; resolve it with `client.Sessions.List()` if you do not already have it |
  </Tab>

  <Tab title="cURL">
    <Warning>
      `POST /api/v1/feedback` now requires a `session_id` field in the request body. It was previously optional.
    </Warning>

    | Before                  | After                       | Notes                                                                                                       |
    | ----------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------- |
    | `session_id` (optional) | `session_id` (**required**) | UUID of the project that owns the run; resolve it with `GET /api/v1/sessions` if you do not already have it |
  </Tab>
</Tabs>

### Examples

#### Provide `session_id` when creating feedback

<Tabs>
  <Tab title="Python">
    `create_feedback` now requires `session_id` in addition to `run_id`.

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
    `client.createFeedback` now requires `sessionId` in addition to `runId`.

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
    `.create()` now requires `.sessionId()` in addition to `.runId()`.

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
    `Feedback.New` now requires `SessionID` in addition to `RunID`.

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
    `POST /api/v1/feedback` now requires a `session_id` field in addition to `run_id`.

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

## See also

* [Retrieve runs](/langsmith/smithdb-sdk-migration-runs)
* [Dataset experiment runs](/langsmith/smithdb-sdk-migration-experiments)
* [Migration overview](/langsmith/smithdb-sdk-migration)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/smithdb-sdk-migration-feedback.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>