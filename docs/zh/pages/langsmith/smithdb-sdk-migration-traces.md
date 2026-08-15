<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Migrate trace methods to SmithDB | https://docs.langchain.com/langsmith/smithdb-sdk-migration-traces -->

# 将跟踪方法迁移到 SmithDB

将 LangSmith SDK 跟踪方法迁移到 SmithDB 支持的等效方法。

这些方法查询跟踪并列出跟踪内的运行。有关弃用日期、最低 SDK 版本以及适用于每种方法的代理提示，请参阅 [Migrate to SmithDB-backed SDK methods](/langsmith/smithdb-sdk-migration)。

## 痕迹：查询

返回单个跟踪项目的跟踪（根运行）列表。每个项目都包含跟踪的根运行以及 `trace_aggregates` 下的可选跟踪范围聚合（`total_tokens`、`total_cost`、`first_token_time`），因此客户端永远不必按 `trace_id` 进行合并。

跟踪在`start_time`窗口内扫描：`min_start_time`默认为请求前24小时，`max_start_time`默认为请求时间。明确设置以加宽或缩小窗口。

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
  </Tab><Tab title="TypeScript">
    |之前 |之后 |
    | -------------------------------------------------------- | ----------------------- |
    | `client.listRuns({ isRoot: true })`（通用）| `client.traces.query()` |

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/javascript/langsmith/_openapi_client/Langsmith/Traces/query)。
  </Tab>

  <Tab title="Java">
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
    * `is_root` 已删除：`traces.query` 始终隐式限定为根运行。
    * 通用的`filter`（针对任何运行进行评估）没有直接等效项；请使用 `trace_filter` 或 `tree_filter` 代替。
    * `trace_filter`和`tree_filter`结转不变；两者都已经存在于`list_runs`上。
    * `trace_ids` 是新功能：对一组已知跟踪 UUID 的快速路径限制，在规模上比等效的 `trace_filter` 更高效。
    * `start_time`（无默认）变为`min_start_time`，省略时默认为 24​​ 小时前。
    * `max_start_time`新增，默认为请求时间； `list_runs` 的 `end_time` 按运行自己的结束时间戳进行过滤，而不是扫描窗口范围。
    * `select`更名为`selects`；条目路由至`trace_aggregates`（`total_tokens`、`total_cost`、`first_token_time`）或`root_run`（其他所有内容）。
  </Tab><Tab title="TypeScript">
    * `session`（项目UUID列表）变为`project_id`，单个UUID； `traces.query` 每次调用的范围仅限于一个项目。
    * `isRoot` 已删除：`traces.query` 的作用域始终隐式限定为根运行。
    * 通用的`filter`（针对任何运行进行评估）没有直接等价物；请使用 `trace_filter` 或 `tree_filter` 代替。
    * `traceFilter` 和 `treeFilter` 结转为 `trace_filter`/`tree_filter`；两者都已经存在于`listRuns`上。请注意，v1 方法采用驼峰命名法选项 (`traceFilter`)； v2 资源方法直接采用有线格式 `snake_case` 键。
    * `trace_ids` 是新功能：对一组已知跟踪 UUID 的快速路径限制，在规模上比等效的 `trace_filter` 更高效。
    * `startTime`（无默认）变为`min_start_time`，省略时默认为 24​​ 小时前。
    * `max_start_time`新增，默认为请求时间； `listRuns` 的 `endTime` 按运行自己的结束时间戳进行过滤，而不是扫描窗口范围。
    * `select`更名为`selects`；条目路由至`trace_aggregates`（`total_tokens`、`total_cost`、`first_token_time`）或`root_run`（其他所有内容）。
  </Tab><Tab title="Java">
    * `session`（项目UUID的`List<String>`）变为`projectId`，单个UUID； `traces().query()` 每次调用的范围仅限于一个项目。
    * `isRoot` 已删除：`traces().query()` 的作用域始终隐式限定为根运行。
    * 通用的`filter`（针对任何运行进行评估）没有直接等价物；请使用 `traceFilter` 或 `treeFilter` 代替。
    * `traceFilter`和`treeFilter`结转不变；两者都已经存在于`RunQueryParams`上。
    * `traceIds` 是新功能：对一组已知跟踪 UUID 的快速路径限制，在规模上比等效的 `traceFilter` 更高效。
    * `startTime`（无默认）变为`minStartTime`，省略时默认为 24​​ 小时前。
    * `maxStartTime`新增，默认为请求时间； `RunQueryParams` 的 `endTime` 按运行自己的结束时间戳进行过滤，而不是扫描窗口范围。
    * `select`更名为`selects`；条目路由至`traceAggregates`（`totalTokens`、`totalCost`、`firstTokenTime`）或`rootRun`（其他所有内容）。
  </Tab><Tab title="Go">
    * `Session`（项目UUID的`[]string`）变为`ProjectID`，单个UUID； `Traces.Query()` 每次调用的范围仅限于一个项目。
    * `IsRoot` 已删除：`Traces.Query()` 始终隐式限定为根运行。
    * 通用的`Filter`（针对任何运行进行评估）没有直接等效项；请使用 `TraceFilter` 或 `TreeFilter` 代替。
    * `TraceFilter`和`TreeFilter`结转不变；两者都已经存在于`RunQueryParams`上。
    * `TraceIDs` 是新功能：对一组已知跟踪 UUID 的快速路径限制，在规模上比等效的 `TraceFilter` 更高效。
    * `StartTime`（无默认）变为`MinStartTime`，省略时默认为 24​​ 小时前。
    * `MaxStartTime`新增，默认为请求时间； `RunQueryParams` 的 `EndTime` 按运行自己的结束时间戳进行过滤，而不是扫描窗口范围。
    * `Select`更名为`Selects`；条目路由至`TraceAggregates`（`TotalTokens`、`TotalCost`、`FirstTokenTime`）或`RootRun`（其他所有内容）。
  </Tab><Tab title="cURL">
    * `session`（项目 UUID 列表）变为 `project_id`，单个 UUID。
    * `is_root` 被删除：端点的作用域始终是隐式的根运行。
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
    * `total_tokens`/`total_cost` 从 `root_run` 移至 `trace_aggregates`，对跟踪中的每个运行进行求和，而不仅仅是根运行。当未选择聚合字段时，响应中完全省略`trace_aggregates`。
    * `trace_aggregates.first_token_time` 是新的
  </Tab><Tab title="TypeScript">
    * `root_run` 与 Runs 具有相同的 `Run` 形状：查询（`id`、`name`、`run_type`、`status` 等），由 `selects` 门控。
    * `total_tokens`/`total_cost` 从 `root_run` 移至 `trace_aggregates`，对跟踪中的每个运行进行求和，而不仅仅是根运行。当未选择聚合字段时，响应中完全省略`trace_aggregates`。
    * `trace_aggregates.first_token_time` 是新的
  </Tab>

  <Tab title="Java">
    * `rootRun()` 具有与 Runs 相同的 `RunSchema` 形状：查询（`totalTokens()`、`name()`、`runType()`、`status()` 等），由 `selects` 门控。
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
        from datetime import datetime, timedelta, timezone

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            count = 0
            async for trace in client.traces.query(
                project_id=str(project.id),
                min_start_time=datetime.now(timezone.utc) - timedelta(days=30),
                max_start_time=datetime.now(timezone.utc),
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
          min_start_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          max_start_time: new Date().toISOString(),
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
                .minStartTime(OffsetDateTime.now().minusMonths(1))
                .maxStartTime(OffsetDateTime.now())
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

        	maxStart := time.Now().UTC()
        	minStart := maxStart.AddDate(0, -1, 0)

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

        MAX_START=$(date -u +%Y-%m-%dT%H:%M:%SZ)
        MIN_START=$(date -u -d '-1 month' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-1m +%Y-%m-%dT%H:%M:%SZ)
        curl -X POST "https://api.smith.langchain.com/api/v2/traces/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" --arg min "$MIN_START" --arg max "$MAX_START" '{
            "project_id": $pid,
            "min_start_time": $min,
            "max_start_time": $max,
            "page_size": 5,
            "selects": ["NAME"]
          }')" | jq '.items | map({trace_id: .root_run.trace_id, name: .root_run.name})'
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

#### 获取跟踪的总代币和成本

从 `trace_aggregates` 而不是 v1 保存它们的根运行中读取跟踪的令牌和成本总计。

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
            print(root_run.trace_id, root_run.total_tokens, root_run.total_cost)
        ```
      </Tab><Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio
        from datetime import datetime, timedelta, timezone

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")
            count = 0
            async for trace in client.traces.query(
                project_id=str(project.id),
                min_start_time=datetime.now(timezone.utc) - timedelta(days=30),
                max_start_time=datetime.now(timezone.utc),
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
          min_start_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          max_start_time: new Date().toISOString(),
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
                .minStartTime(OffsetDateTime.now().minusMonths(1))
                .maxStartTime(OffsetDateTime.now())
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

        	maxStart := time.Now().UTC()
        	minStart := maxStart.AddDate(0, -1, 0)

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

        MAX_START=$(date -u +%Y-%m-%dT%H:%M:%SZ)
        MIN_START=$(date -u -d '-1 month' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-1m +%Y-%m-%dT%H:%M:%SZ)
        curl -X POST "https://api.smith.langchain.com/api/v2/traces/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" --arg min "$MIN_START" --arg max "$MAX_START" '{
            "project_id": $pid,
            "min_start_time": $min,
            "max_start_time": $max,
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
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio
        from datetime import datetime, timedelta, timezone

        from langsmith import Client


        async def main():
            client = Client()
            project = await client.aread_project(project_name="default")

            # trace_filter is implicitly root-run-only — no is_root needed.
            count = 0
            async for trace in client.traces.query(
                project_id=str(project.id),
                min_start_time=datetime.now(timezone.utc) - timedelta(days=30),
                max_start_time=datetime.now(timezone.utc),
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
                min_start_time=datetime.now(timezone.utc) - timedelta(days=30),
                max_start_time=datetime.now(timezone.utc),
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
      </Tab><Tab title="After">
        ```ts After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { Client } from "langsmith";

        const client = new Client();
        const project = await client.readProject({ projectName: "default" });

        // trace_filter is implicitly root-run-only — no is_root needed.
        let count = 0;
        for await (const trace of client.traces.query({
          project_id: project.id,
          min_start_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          max_start_time: new Date().toISOString(),
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
          min_start_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          max_start_time: new Date().toISOString(),
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

        val maxStart = OffsetDateTime.now()
        val minStart = maxStart.minusMonths(1)

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

        	maxStart := time.Now().UTC()
        	minStart := maxStart.AddDate(0, -1, 0)

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

        MAX_START=$(date -u +%Y-%m-%dT%H:%M:%SZ)
        MIN_START=$(date -u -d '-1 month' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-1m +%Y-%m-%dT%H:%M:%SZ)

        # trace_filter is implicitly root-run-only — no is_root needed.
        curl -s -X POST "https://api.smith.langchain.com/api/v2/traces/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" --arg min "$MIN_START" --arg max "$MAX_START" '{
            "project_id": $pid,
            "min_start_time": $min,
            "max_start_time": $max,
            "page_size": 5,
            "trace_filter": "eq(status, \"error\")"
          }')" | jq '.items | map(.root_run.trace_id)'

        # trace_ids is a fast-path when you already know which traces you want.
        TRACE_ID="<trace-id>"
        curl -s -X POST "https://api.smith.langchain.com/api/v2/traces/query" \
          -H "x-api-key: $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d "$(jq -n --arg pid "$PROJECT_ID" --arg min "$MIN_START" --arg max "$MAX_START" --arg tid "$TRACE_ID" '{
            "project_id": $pid,
            "min_start_time": $min,
            "max_start_time": $max,
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
      `client.traces.list_runs()` 现在是异步的。用`await`来调用它。
    </Note>

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/python/langsmith/_openapi_client/resources/traces/TracesResource/list_runs)。
  </Tab>

  <Tab title="TypeScript">
    |之前 |之后|
    | ---------------------------------------------------- | -------------------------- |
    | `client.listRuns({ traceId })`（通用）| `client.traces.listRuns()` |有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/javascript/langsmith/_openapi_client/Langsmith/Traces/listRuns)。
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
    * `trace` 从主体字段移动到路径段，`{trace_id}`。
    * `project_id` 是新的并且**必需**（SmithDB 分区键）； `POST /api/v1/runs/query`不需要它。
    * `filter` 不变。
    * `min_start_time`/`max_start_time` 是新的。与`traces.query`不同，两者都没有默认值：省略两者并且运行根本不按时间过滤。它们是单独可选的，但如果设置了其中一个，则必须一起传递。
    * `select`更名为`selects`。
  </Tab>
</Tabs>

#### 响应字段

<Tabs>
  <Tab title="Python">
    响应有一个 `items` 字段：按 `start_time` 顺序排列的 `Run` 对象列表，其形状与 [Runs: query](/langsmith/smithdb-sdk-migration-query-runs) 响应相同。
  </Tab>

  <Tab title="TypeScript">
    响应有一个 `items` 字段：按 `start_time` 顺序排列的 `Run` 对象数组，其形状与 [Runs: query](/langsmith/smithdb-sdk-migration-query-runs) 响应相同。
  </Tab>

  <Tab title="Java">
    响应有一个 `items()` 方法，返回 `Optional<List<Run>>`：跟踪按 `start_time` 顺序运行，与 [Runs: query](/langsmith/smithdb-sdk-migration-query-runs) 响应形状相同。
  </Tab>

  <Tab title="Go">
    响应有一个 `Items` 字段，类型为 `[]Run`：跟踪按 `start_time` 顺序运行，形状与 [Runs: query](/langsmith/smithdb-sdk-migration-query-runs) 响应相同。
  </Tab>

  <Tab title="cURL">
    JSON 响应有一个 `items` 数组字段：跟踪按 `start_time` 顺序运行，与 [Runs: query](/langsmith/smithdb-sdk-migration-query-runs) 响应的形状相同。
  </Tab>
</Tabs>### 示例

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
        from datetime import datetime, timedelta, timezone

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
      </Tab>

      <Tab title="After">
        ```python After theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import asyncio
        from datetime import datetime, timedelta, timezone

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
      </Tab><Tab title="After">
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

## 另请参阅

* [Query runs](/langsmith/smithdb-sdk-migration-query-runs)
* [Threads](/langsmith/smithdb-sdk-migration-threads)
* [Migration overview](/langsmith/smithdb-sdk-migration)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/smithdb-sdk-migration-traces.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>