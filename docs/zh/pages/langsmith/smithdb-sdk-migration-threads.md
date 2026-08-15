<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Migrate thread methods to SmithDB | https://docs.langchain.com/langsmith/smithdb-sdk-migration-threads -->

# 将线程方法迁移到SmithDB

将 LangSmith SDK 线程方法迁移到 SmithDB 支持的等效方法。

这些方法查询线程并列出线程内的跟踪。有关弃用日期、最低 SDK 版本以及适用于每种方法的代理提示，请参阅 [Migrate to SmithDB-backed SDK methods](/langsmith/smithdb-sdk-migration)。

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
  </Tab>

  <Tab title="TypeScript">
    |之前 |之后|
    | ---------------------- | ------------------------ |
    | `client.listThreads()` | `client.threads.query()` |

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/javascript/langsmith/_openapi_client/Langsmith/Threads/query)。
  </Tab>

  <Tab title="Java">
    <Note>Java 从来没有专门的线程列表方法。最接近的传统等效项是通用运行查询，按 `thread_id` 元数据约定手动分组。</Note>|之前 |之后|
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
  </Tab>

  <Tab title="cURL">
    |之前 |之后|
    | --------------------------------------------------------------------------- | ---------------------------- |
    | `POST /api/v1/runs/query`（`is_root=true`，分组客户端）| `POST /api/v2/threads/query` |

    有关完整参数和字段列表，请参阅[API doc](/langsmith/smith-api/threads/query-threads)。
  </Tab>
</Tabs>

#### 查询参数<Tabs>
  <Tab title="Python">
    |之前 (`list_threads`) |之后(`threads.query`) |笔记|
    | ------------------------------------------------ | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
    | `project_id` 异或 `project_name` | `project_id` |新方法只需要 UUID；首先通过 `aread_project()` 解析名称，与 `Runs: query` 相同的模式 |
    | `start_time`（默认为 1 天前）| `min_start_time` + `max_start_time` |选修的;默认为现在结束的 1 天窗口，与 `start_time` |
    | `offset` + `limit` | `cursor` + `page_size` |偏移分页被光标分页取代 |
    | `filter`（根据运行进行评估）| `filter` |语法相同；现在针对每个线程的根运行进行评估 |
  </Tab><Tab title="TypeScript">
    |之前 (`listThreads`) |之后(`threads.query`) |笔记|
    | ----------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- |
    | `projectId` 异或 `projectName` | `project_id` |新方法只需要 UUID；首先通过 `readProject()` 解析名称 |
    | `startTime`（默认为 1 天前）| `min_start_time` + `max_start_time` |选修的;默认为现在结束的 1 天窗口，与 `startTime` |
    | `offset` + `limit` | `cursor` + `page_size` |偏移分页被光标分页取代 |
    | `filter` | `filter` |语法相同；现在针对每个线程的根运行进行评估 |
  </Tab>

  <Tab title="Java">
    没有要映射的查询参数。没有专门的方法。旧方法使用通用运行查询（`is_root=true`，按`thread_id`元数据手动分组）。 `threads().query()` 需要 `projectId`、`minStartTime`、`maxStartTime`（均为可选，默认为现在结束的 1 天窗口）、`filter`、`pageSize`、`cursor`。
  </Tab><Tab title="Go">
    没有要映射的查询参数。没有专门的方法。旧方法使用通用运行查询（`IsRoot: true`，按`thread_id`元数据手动分组）。 `Threads.Query()` 需要 `ProjectID`、`MinStartTime`、`MaxStartTime`（均为可选，默认为现在结束的 1 天窗口）、`Filter`、`PageSize`、`Cursor`。
  </Tab>

  <Tab title="cURL">
    `POST /api/v2/threads/query`正文字段：`project_id`、`min_start_time`（可选）、`max_start_time`（可选）、`filter`、`page_size`、`cursor`（全部`snake_case`）。 `min_start_time`/`max_start_time` 如果省略，则默认为现在结束的 1 天窗口。
  </Tab>
</Tabs>

#### 响应字段

<Tabs>
  <Tab title="Python">
    Python 的遗留`ListThreadsItem` 只有`thread_id`、`runs`（完全嵌入`Run[]`）、`count`、`min_start_time`、`max_start_time`。它根本没有令牌/成本/延迟/反馈字段。

    新的`Thread`永远不会嵌入完整的运行列表（这就是`threads.list_traces`的用途），而是添加真实的`feedback_stats`、`latency_p50`/`latency_p99`、每个类别的成本/代币总和`_details`、 `first_trace_id`/`last_trace_id`、`first_inputs`/`last_outputs`预览、`last_error`、`num_errored_turns`。|之前（旧版`ListThreadsItem`）|之后（新`Thread`）|笔记|
    | --------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
    | `thread_id` | `thread_id` |不变 |
    | `runs`（全嵌入式`Run[]`）| *（不可用）* |使用 `threads.list_traces` 获取每条轨迹的详细信息 |
    | `count` | `count` |不变 |
    | `min_start_time` | `min_start_time` |不变 |
    | `max_start_time` | `max_start_time` |不变 || *（不可用）* | `start_time` |新：该行的参考开始时间，例如用于排序 |
    | *（不可用）* | `trace_id` |新功能：具有代表性的根跟踪 UUID，例如用于深层链接 |
    | *（不可用）* | `first_trace_id`、`last_trace_id` |新功能：查询窗口中按时间顺序排列的第一个/最后一个跟踪 UUID |
    | *（不可用）* | `first_inputs`、`last_outputs` |新功能：第一条/最后一条轨迹的预览被截断 |
    | *（不可用）* | `last_error` |新 |
    | *（不可用）* | `num_errored_turns` |新 |
    | *（不可用）* | `latency_p50`、`latency_p99` |新 || *（不可用）* | `total_tokens`、`total_cost` |新 |
    | *（不可用）* | `total_token_details`、`total_cost_details` |新功能：按类别的字典，与 `threads.list_traces` 不同，它们不包含在 `.raw` | 中
    | *（不可用）* | `feedback_stats` |新 |
  </Tab>

  <Tab title="TypeScript">
    |之前（旧版`ListThreadsItem`）|之后（新`Thread`）|笔记|
    | --------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
    | `thread_id` | `thread_id` |不变 |
    | `runs`（全嵌入式`Run[]`）| *（不可用）* |使用 `threads.listTraces` 获取每条轨迹的详细信息 || `count` | `count` |不变 |
    | `min_start_time` | `min_start_time` |不变 |
    | `max_start_time` | `max_start_time` |不变 |
    | `total_tokens` | `total_tokens` |不变 |
    | `total_cost` | `total_cost` |不变 |
    | `latency_p50`、`latency_p99` | `latency_p50`、`latency_p99` |不变 |
    | `feedback_stats` | `feedback_stats` |不变 || `first_inputs`、`last_outputs` | `first_inputs`、`last_outputs` |不变 |
    | `last_error` | `last_error` |不变 |
    | *（不可用）* | `start_time` |新：该行的参考开始时间，例如用于排序 |
    | *（不可用）* | `trace_id` |新功能：具有代表性的根跟踪 UUID，例如用于深层链接 |
    | *（不可用）* | `first_trace_id`、`last_trace_id` |新功能：查询窗口中按时间顺序排列的第一个/最后一个跟踪 UUID |
    | *（不可用）* | `num_errored_turns` |新 |
    | *（不可用）* | `total_token_details`、`total_cost_details` |新功能：按类别的字典，与 `threads.listTraces` 不同，这些字典不包含在 `.raw` 中 |
  </Tab><Tab title="Java">
    `Thread` 有 19 个字段：`threadId`、`count`、`feedbackStats`、`firstInputs`、`firstTraceId`、`lastError`、`lastOutputs`、`lastTraceId`、 `latencyP50`、`latencyP99`、`maxStartTime`、`minStartTime`、`numErroredTurns`、`startTime`、`totalCost`、`totalCostDetails`、`totalTokenDetails`、 `totalTokens`、`traceId`（全部`Optional`）。

    旧版 SDK 从来没有对此进行类型化响应。 Java 最接近的等效分组原始 `runs().query()` 结果由 `thread_id` 元数据客户端提供。下面的每个字段都是新的。

    |新`Thread`方法 |笔记|
    | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
    | `threadId()` |                                                                                                                        |
    | `count()` |                                                                                                                        || `minStartTime()`、`maxStartTime()`、`startTime()` |                                                                                                                        |
    | `firstTraceId()`、`lastTraceId()`、`traceId()` | `traceId()` 是一个代表性的根跟踪 UUID，例如对于深层链接，除了第一个/最后一个跟踪 UUID 之外 |
    | `firstInputs()`、`lastOutputs()` |第一个/最后一个跟踪的预览被截断 |
    | `lastError()` |                                                                                                                        |
    | `numErroredTurns()` |                                                                                                                        |
    | `latencyP50()`、`latencyP99()` |                                                                                                                        |
    | `totalTokens()`、`totalCost()` |                                                                                                                        || `totalTokenDetails()`、`totalCostDetails()` |按类别地图 |
    | `feedbackStats()` |                                                                                                                        |
  </Tab>

  <Tab title="Go">
    `Thread` 有 19 个字段，采用 `PascalCase` Go 结构体形式（例如 `ThreadID`、`Count`、`LatencyP50`）。

    旧版 SDK 从来没有对此进行类型化响应。 Go 最接近的等效分组原始 `Runs.Query()` 结果由 `thread_id` 元数据客户端提供。下面的每个字段都是新的。|新`Thread`字段|笔记|
    | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
    | `ThreadID` |                                                                                                                      |
    | `Count` |                                                                                                                      |
    | `MinStartTime`、`MaxStartTime`、`StartTime` |                                                                                                                      |
    | `FirstTraceID`、`LastTraceID`、`TraceID` | `TraceID` 是一个代表性的根跟踪 UUID，例如对于深层链接，除了第一个/最后一个跟踪 UUID 之外 |
    | `FirstInputs`、`LastOutputs` |第一个/最后一个跟踪的预览被截断 || `LastError` |                                                                                                                      |
    | `NumErroredTurns` |                                                                                                                      |
    | `LatencyP50`、`LatencyP99` |                                                                                                                      |
    | `TotalTokens`、`TotalCost` |                                                                                                                      |
    | `TotalTokenDetails`、`TotalCostDetails` |按类别地图 |
    | `FeedbackStats` |                                                                                                                      |
  </Tab>

  <Tab title="cURL">
    JSON 响应字段使用 `snake_case`：`thread_id`、`count`、`feedback_stats`、`first_inputs`、`first_trace_id`、`last_error`、`last_outputs`、`last_trace_id`、 `latency_p50`、`latency_p99`、`max_start_time`、`min_start_time`、`num_errored_turns`、`start_time`、`total_cost`、`total_cost_details`、`total_token_details`、 `total_tokens`，`trace_id`。旧版 API 从来没有专用的线程端点。最接近的等效项是 `POST /api/v1/runs/query`，在客户端按 `thread_id` 元数据分组。下面的每个字段都是新的。

    |新`threads.query`响应字段 |笔记|
    | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
    | `thread_id` |                                                                                                                       |
    | `count` |                                                                                                                       |
    | `min_start_time`、`max_start_time`、`start_time` |                                                                                                                       |
    | `first_trace_id`、`last_trace_id`、`trace_id` | `trace_id` 是一个代表性的根跟踪 UUID，例如对于深层链接，除了第一个/最后一个跟踪 UUID 之外 || `first_inputs`、`last_outputs` |第一个/最后一个跟踪的预览被截断 |
    | `last_error` |                                                                                                                       |
    | `num_errored_turns` |                                                                                                                       |
    | `latency_p50`、`latency_p99` |                                                                                                                       |
    | `total_tokens`、`total_cost` |                                                                                                                       |
    | `total_token_details`、`total_cost_details` |按类别听写 |
    | `feedback_stats` |                                                                                                                       |
  </Tab>
</Tabs>

### 示例

#### 列出项目中的线程获取某个时间范围内项目中具有活动的每个线程。

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
        from datetime import datetime, timedelta, timezone

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            async for thread in client.threads.query(
                project_id=str(project.id),
                min_start_time=datetime.now(timezone.utc) - timedelta(days=30),
                max_start_time=datetime.now(timezone.utc),
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
          min_start_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          max_start_time: new Date().toISOString(),
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
                .minStartTime(OffsetDateTime.now().minusMonths(1))
                .maxStartTime(OffsetDateTime.now())
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

        	maxStart := time.Now().UTC()
        	minStart := maxStart.AddDate(0, -1, 0)

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

        MAX_START=$(date -u +%Y-%m-%dT%H:%M:%SZ)
        MIN_START=$(date -u -d '-1 month' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-1m +%Y-%m-%dT%H:%M:%SZ)
        curl -X POST "https://api.smith.langchain.com/api/v2/threads/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" --arg min "$MIN_START" --arg max "$MAX_START" '{
            "project_id": $pid,
            "min_start_time": $min,
            "max_start_time": $max
          }')"
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 查找有错误的线程

查找回合结束时出现错误的线程。

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
        from datetime import datetime, timedelta, timezone

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            async for thread in client.threads.query(
                project_id=str(project.id),
                min_start_time=datetime.now(timezone.utc) - timedelta(days=30),
                max_start_time=datetime.now(timezone.utc),
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
          min_start_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          max_start_time: new Date().toISOString(),
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
                .minStartTime(OffsetDateTime.now().minusMonths(1))
                .maxStartTime(OffsetDateTime.now())
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
      </Tab><Tab title="After">
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

        	maxStart := time.Now().UTC()
        	minStart := maxStart.AddDate(0, -1, 0)

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

        MAX_START=$(date -u +%Y-%m-%dT%H:%M:%SZ)
        MIN_START=$(date -u -d '-1 month' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-1m +%Y-%m-%dT%H:%M:%SZ)
        curl -X POST "https://api.smith.langchain.com/api/v2/threads/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" --arg min "$MIN_START" --arg max "$MAX_START" '{
            "project_id": $pid,
            "min_start_time": $min,
            "max_start_time": $max,
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
  </Tab>

  <Tab title="TypeScript">
    |之前 |之后 |
    | -------------------- | -------------------------------------- |
    | `client.readThread()` | `client.threads.listTraces()` |

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/javascript/langsmith/_openapi_client/Langsmith/Threads/listTraces)。
  </Tab>

  <Tab title="Java">
    <Note>Java 从来没有专用的每线程方法。最接近的传统等效项是按 `thread_id` 元数据约定过滤的通用运行查询。</Note>|之前 |之后|
    | ------------------------------------------------- | ------------------------------------------- |
    | `client.runs().query()`（由`thread_id`过滤）| `client.threads().listTraces()` |

    完整参数列表请参见[reference](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/ThreadService.html)。
  </Tab>

  <Tab title="Go">
    <Note>Go 从来没有专用的每线程方法。最接近的传统等效项是按 `thread_id` 元数据约定过滤的通用运行查询。</Note>

    |之前 |之后 |
    | ----------------------------------------------------------- | -------------------------------------- |
    | `client.Runs.Query()`（由`thread_id`过滤）| `client.Threads.ListTraces()` |

    完整参数列表请参见[reference](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#ThreadService.ListTracesAutoPaging)。
  </Tab>

  <Tab title="cURL">
    |之前 |之后 |
    | ------------------------------------------------------- | ---------------------------------------------------- |
    | `POST /api/v1/runs/query` (`filter=eq(thread_id, ...)`) | `GET /api/v2/threads/{thread_id}/traces` |

    有关完整参数和字段列表，请参阅[API doc](/langsmith/smith-api/threads/query-thread-traces)。
  </Tab>
</Tabs>

#### 查询参数<Tabs>
  <Tab title="Python">
    `read_thread` 的 `is_root` 没有新的等效项。 `list_traces` 始终仅返回与其名称匹配的跟踪（根运行）。 `read_thread` 的 `order` (asc/desc) 也没有新的等效项：结果始终按 `start_time` 升序（固定的服务器端顺序）排序。

    |之前 (`read_thread`) |之后 (`list_traces`) |笔记|
    | ----------------------------------- | ------------------------ | ----------------------------------------------------------------------------------- |
    | `thread_id` | `thread_id`（路径参数）|不变 |
    | `project_id` 异或 `project_name` | `project_id` |新方法只需要 UUID |
    | `is_root` | *（不可用）* |新方法始终仅返回跟踪（根运行）|
    | `order` | *（不可用）* |新方法没有排序/顺序字段 || `filter` | `filter` |相同的语法，现在针对每个根跟踪运行进行评估 |
    | `select`（任意运行字段列表）| `selects` |新方法使用 `ThreadTraceSelectField`，一个 24 值大写枚举 |
    | *（不可用）* | `page_size` + `cursor` |新方法添加光标分页 |
  </Tab>

  <Tab title="TypeScript">
    `readThread` 的 `isRoot` 没有新的等效项。 `listTraces` 始终仅返回与其名称匹配的跟踪（根运行）。 `readThread` 的 `order` (asc/desc) 也没有新的等效项：结果始终按 `start_time` 升序（固定的服务器端顺序）排序。|之前 (`readThread`) |之后（`listTraces`）|笔记|
    | ----------------------------------- | ----------------------- | ------------------------------------------------------ |
    | `threadId` | `threadId`（路径参数）|不变 |
    | `projectId` 异或 `projectName` | `project_id` |新方法只需要 UUID |
    | `isRoot` | *（不可用）* |新方法始终仅返回跟踪（根运行）|
    | `order` | *（不可用）* |新方法没有排序/顺序字段 |
    | `filter` | `filter` |相同的语法，现在针对每个根跟踪运行进行评估 |
    | `select`（任意运行字段列表）| `selects` |新方法使用 24 值大写枚举 |
    | *（不可用）* | `page_size` + `cursor` |新方法添加光标分页 |
  </Tab><Tab title="Java">
    没有要映射的查询参数。没有专门的方法。 `listTraces(threadId, params)` 采用 `projectId`、`filter`、`pageSize`、`cursor`、`selects`（24 值枚举）。结果始终按 `startTime` 升序（固定的服务器端顺序）排序。
  </Tab>

  <Tab title="Go">
    没有要映射的查询参数。没有专门的方法。 `ListTraces(ctx, threadID, params)` 采用 `ProjectID`、`Filter`、`PageSize`、`Cursor`、`Selects`（24 值枚举）。结果始终按 `StartTime` 升序（固定的服务器端顺序）排序。
  </Tab>

  <Tab title="cURL">
    `GET /api/v2/threads/{thread_id}/traces`查询参数：`project_id`、`filter`、`page_size`、`cursor`、`selects`（可重复）、全部`snake_case`。结果始终按 `start_time` 升序（固定的服务器端顺序）排序。
  </Tab>
</Tabs>

#### 响应字段

<Tabs>
  <Tab title="Python">
    旧版 `read_thread` 返回完整的 `Run` 对象（生成器）。新的`ThreadTrace`是轻量级的：预览字段（`inputs_preview`/`outputs_preview`）而不是完整的`inputs`/`outputs`，没有嵌入式子运行。 `selects` 控制填充的内容，与 `traces.query` 相同。|之前（旧版 `Run` 字段，来自 `read_thread`）|之后（新`ThreadTrace`字段）|笔记|
    | ---------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
    | `id` | *（不可用）* |旧版根运行`id`和`trace_id`是相同的；新 API 仅公开 `trace_id` |
    | `trace_id` | `trace_id` |省略 `selects` 时默认返回 |
    | `name` | `name` |除非包含在 `selects` 中，否则省略 || `start_time` | `start_time` |除非包含在 `selects` 中，否则将被省略 |
    | `end_time` | `end_time` |除非包含在 `selects` 中，否则将被省略 |
    | `run_type` | `op` |更名；编码为数字而不是字符串 |
    | `inputs` | `inputs_preview`，或 `inputs` 对于未截断的有效负载 |默认情况下预览被截断；选择`INPUTS`作为完整有效负载 |
    | `outputs` | `outputs_preview`，或 `outputs` 对于未截断的有效负载 |默认情况下预览被截断；选择`OUTPUTS`作为完整有效负载 || `error` | `error_preview`，或 `error` 获取完整消息 |默认情况下摘要被截断；选择 `ERROR` 查看完整错误消息 |
    | `latency`（属性）| `latency` |原生字段而不是计算的 `timedelta` 属性 |
    | `total_tokens`、`prompt_tokens`、`completion_tokens` | `total_tokens`、`prompt_tokens`、`completion_tokens` |不变 |
    | `total_cost`、`prompt_cost`、`completion_cost` | `total_cost`、`prompt_cost`、`completion_cost` |不变 |
    | `prompt_token_details`、`completion_token_details` | `prompt_token_details`、`completion_token_details` |字段现在包裹了字典；访问`.raw` |
    | `prompt_cost_details`、`completion_cost_details` | `prompt_cost_details`、`completion_cost_details` |字段现在包裹了字典；访问`.raw` || `first_token_time` | `first_token_time` |除非包含在 `selects` 中，否则将被省略 |
    | *（不可用）* | `thread_id` |新：此跟踪所属的线程 UUID |
    | `child_runs`、`child_run_ids` | *（不可用）* |没有嵌入的子进程运行；使用 `traces.list_runs` 进行后代运行 |
  </Tab>

  <Tab title="TypeScript">
    旧版 `readThread` 返回完整的 `Run` 对象（异步生成器）。新的`ThreadTrace`是轻量级的：预览字段（`inputs_preview`/`outputs_preview`）而不是完整的`inputs`/`outputs`，没有嵌入式子运行。 `selects` 控制填充内容，与`traces.query` 相同。|之前（旧版 `Run` 字段，来自 `readThread`）|之后（新`ThreadTrace`字段）|笔记|
    | ---------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
    | `id` | *（不可用）* |旧版根运行`id`和`trace_id`是相同的；新 API 仅公开 `trace_id` |
    | `trace_id` | `trace_id` |省略 `selects` 时默认返回 |
    | `name` | `name` |除非包含在 `selects` 中，否则省略 || `start_time` | `start_time` |除非包含在 `selects` 中，否则将被省略 |
    | `end_time` | `end_time` |除非包含在 `selects` 中，否则省略 |
    | `run_type` | `op` |更名；编码为数字而不是字符串 |
    | `inputs` | `inputs_preview`，或 `inputs` 对于未截断的有效负载 |默认情况下预览被截断；选择`INPUTS`作为完整有效负载 |
    | `outputs` | `outputs_preview`，或 `outputs` 对于未截断的有效负载 |默认情况下预览被截断；选择`OUTPUTS`作为完整有效负载 || `error` | `error_preview`，或 `error` 获取完整消息 |默认情况下摘要被截断；选择 `ERROR` 查看完整错误消息 |
    | `latency` | `latency` |原生字段上的新类型 |
    | `total_tokens`、`prompt_tokens`、`completion_tokens` | `total_tokens`、`prompt_tokens`、`completion_tokens` |不变 |
    | `total_cost`、`prompt_cost`、`completion_cost` | `total_cost`、`prompt_cost`、`completion_cost` |不变 |
    | `prompt_token_details`、`completion_token_details` | `prompt_token_details`、`completion_token_details` |不变 |
    | `prompt_cost_details`、`completion_cost_details` | `prompt_cost_details`、`completion_cost_details` |不变 || `first_token_time` | `first_token_time` |除非包含在 `selects` 中，否则省略 |
    | *（不可用）* | `thread_id` |新：此跟踪所属的线程 UUID |
    | `child_runs`、`child_run_ids` | *（不可用）* |没有嵌入的子进程运行；使用 `traces.listRuns` 进行后代运行 |
  </Tab>

  <Tab title="Java">
    `ThreadTrace` 有 24 个 `Optional` 字段：`traceId`、`threadId`、`name`、`startTime`、`endTime`、`latency`、`op`，令牌/成本字段每个类别`_details`、`inputsPreview`/`outputsPreview`/`inputs`/`outputs`、`errorPreview`/`error`、`firstTokenTime`。|之前（旧版`RunSchema`方法）|之后（新`ThreadTrace`方法）|笔记|
    | ------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
    | `id()` | *（不可用）* |旧版根运行`id()`和`traceId()`是相同的；新 API 仅公开 `traceId()` |
    | `traceId()` | `traceId()` |省略`selects`时默认返回 |
    | `name()` | `name()` |除非包含在 `selects` 中，否则将被省略 || `startTime()` | `startTime()` |除非包含在 `selects` 中，否则将被省略 |
    | `endTime()` | `endTime()` |除非包含在 `selects` 中，否则将被省略 |
    | `runType()` | `op()` |更名；编码为数字而不是字符串 |
    | `inputs()` | `inputsPreview()`，或 `inputs()` 对于未截断的有效负载 |默认情况下预览被截断；选择`INPUTS`作为完整有效负载 |
    | `outputs()` | `outputsPreview()`，或 `outputs()` 对于未截断的有效负载 |默认情况下预览被截断；选择`OUTPUTS`作为完整有效负载 || `error()` | `errorPreview()`，或 `error()` 获取完整消息 |默认情况下摘要被截断；选择 `ERROR` 查看完整的错误消息 |
    | `latency()` | `latency()` |不变 |
    | `totalTokens()`、`promptTokens()`、`completionTokens()` | `totalTokens()`、`promptTokens()`、`completionTokens()` |不变 |
    | `totalCost()`、`promptCost()`、`completionCost()` | `totalCost()`、`promptCost()`、`completionCost()` |不变 |
    | `promptTokenDetails()`、`completionTokenDetails()` | `promptTokenDetails()`、`completionTokenDetails()` |不变 |
    | `promptCostDetails()`、`completionCostDetails()` | `promptCostDetails()`、`completionCostDetails()` |不变 || `firstTokenTime()` | `firstTokenTime()` |除非包含在 `selects` 中，否则将被省略 |
    | *（不可用）* | `threadId()` |新：此跟踪所属的线程 UUID |
    | `childRuns()`、`childRunIds()` | *（不可用）* |没有嵌入的子进程运行；使用 `traces().listRuns()` 进行后代运行 |
  </Tab>

  <Tab title="Go">
    `ThreadTrace` 有 24 个字段，采用 `PascalCase` Go 结构体形式。|之前（旧根`Run`字段）|之后（新`ThreadTrace`字段）|笔记|
    | ------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
    | `ID` | *（不可用）* |旧版根运行`ID`和`TraceID`是相同的；新 API 仅公开 `TraceID` |
    | `TraceID` | `TraceID` |省略 `Selects` 时默认返回 |
    | `Name` | `Name` |除非包含在 `Selects` 中，否则省略 || `StartTime` | `StartTime` |除非包含在 `Selects` 中，否则省略 |
    | `EndTime` | `EndTime` |除非包含在 `Selects` 中，否则将被省略 |
    | `RunType` | `Op` |更名；编码为数字而不是字符串 |
    | `Inputs` | `InputsPreview`，或 `Inputs` 用于未截断的有效负载 |默认情况下预览被截断；选择`INPUTS`作为完整有效负载 |
    | `Outputs` | `OutputsPreview`，或 `Outputs` 对于未截断的有效负载 |默认情况下预览被截断；选择 `OUTPUTS` 以获得完整有效负载 |
    | `Error` | `ErrorPreview`，或 `Error` 获取完整消息 |默认情况下摘要被截断；选择 `ERROR` 查看完整错误消息 || `Latency` | `Latency` |不变 |
    | `TotalTokens`、`PromptTokens`、`CompletionTokens` | `TotalTokens`、`PromptTokens`、`CompletionTokens` |不变 |
    | `TotalCost`、`PromptCost`、`CompletionCost` | `TotalCost`、`PromptCost`、`CompletionCost` |不变 |
    | `PromptTokenDetails`、`CompletionTokenDetails` | `PromptTokenDetails`、`CompletionTokenDetails` |不变 |
    | `PromptCostDetails`、`CompletionCostDetails` | `PromptCostDetails`、`CompletionCostDetails` |不变 |
    | `FirstTokenTime` | `FirstTokenTime` |除非包含在 `Selects` 中，否则省略 || *（不可用）* | `ThreadID` |新：此跟踪所属的线程 UUID |
    | `ChildRuns`、`ChildRunIDs` | *（不可用）* |没有嵌入的子进程运行；使用 `Traces.ListRuns` 进行后代运行 |
  </Tab>

  <Tab title="cURL">
    JSON 响应字段使用`snake_case`，与下表匹配。

    |之前（旧根运行字段）|之后（新`ThreadTrace`字段）|笔记|
    | ---------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
    | `id` | *（不可用）* |旧版根运行`id`和`trace_id`是相同的；新 API 仅公开 `trace_id` || `trace_id` | `trace_id` |省略 `selects` 时默认返回 |
    | `name` | `name` |除非包含在 `selects` 中，否则将被省略 |
    | `start_time` | `start_time` |除非包含在 `selects` 中，否则省略 |
    | `end_time` | `end_time` |除非包含在 `selects` 中，否则省略 |
    | `run_type` | `op` |更名；编码为数字而不是字符串 || `inputs` | `inputs_preview`，或 `inputs` 对于未截断的有效负载 |默认情况下预览被截断；选择 `INPUTS` 以获得完整的有效负载 |
    | `outputs` | `outputs_preview`，或 `outputs` 对于未截断的有效负载 |默认情况下预览被截断；选择`OUTPUTS`作为完整有效负载 |
    | `error` | `error_preview`，或 `error` 获取完整消息 |默认情况下摘要被截断；选择 `ERROR` 查看完整的错误消息 |
    | `latency` | `latency` |不变 |
    | `total_tokens`、`prompt_tokens`、`completion_tokens` | `total_tokens`、`prompt_tokens`、`completion_tokens` |不变 |
    | `total_cost`、`prompt_cost`、`completion_cost` | `total_cost`、`prompt_cost`、`completion_cost` |不变 || `prompt_token_details`、`completion_token_details` | `prompt_token_details`、`completion_token_details` |不变 |
    | `prompt_cost_details`、`completion_cost_details` | `prompt_cost_details`、`completion_cost_details` |不变 |
    | `first_token_time` | `first_token_time` |除非包含在 `selects` 中，否则将被省略 |
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
                thread_id, project_id=str(project.id), selects=["TRACE_ID", "START_TIME"]
            ):
                print(trace.trace_id, trace.start_time)


        asyncio.run(main())
        ```
      </Tab>
    </Tabs>
  </Tab><Tab title="TypeScript">
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
          selects: ["TRACE_ID", "START_TIME"],
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
                .addSelect(ThreadListTracesParams.Select.TRACE_ID)
                .addSelect(ThreadListTracesParams.Select.START_TIME)
                .build()
        ).items()
        for (trace in traces) {
            println("${trace.traceId().get()} ${trace.startTime().get()}")
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
        		Selects:   langsmith.F([]langsmith.ThreadListTracesParamsSelect{langsmith.ThreadListTracesParamsSelectTraceID, langsmith.ThreadListTracesParamsSelectStartTime}),
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
          --data-urlencode "selects=TRACE_ID" \
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

## 另请参阅

* [Traces](/langsmith/smithdb-sdk-migration-traces)
* [Dataset experiment runs](/langsmith/smithdb-sdk-migration-experiments)
* [Migration overview](/langsmith/smithdb-sdk-migration)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/smithdb-sdk-migration-threads.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>