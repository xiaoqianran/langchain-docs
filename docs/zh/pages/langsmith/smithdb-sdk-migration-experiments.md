<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Migrate dataset experiment runs to SmithDB | https://docs.langchain.com/langsmith/smithdb-sdk-migration-experiments -->

# 将实验运行数据集迁移到 SmithDB

这些方法查询附加到数据集实验的运行。有关弃用日期、最低 SDK 版本以及适用于每种方法的代理提示，请参阅 [Migrate to SmithDB-backed SDK methods](/langsmith/smithdb-sdk-migration)。

## 数据集实验运行：查询

查询数据集示例以及针对每个示例记录的实验运行。接受一个或多个`experiment_ids`，以便您可以并排查看多个实验的运行情况；结果作为游标分页页面返回。

### 主要变化

#### 方法名称

<Tabs>
  <Tab title="Python">
    |之前 |之后 |
    |--------|--------|
    | `client.get_experiment_results()` | `client.datasets.experiment_runs.query()` |

    <Note>
    `client.datasets.experiment_runs.query()` 现在是异步的。用 `await` 来调用它。
    </Note>

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/python/langsmith/_openapi_client/resources/datasets/experiment_runs/ExperimentRunsResource/query)。
  </Tab>
  <Tab title="TypeScript">
    |之前 |之后 |
    |--------|--------|
    | *（没有遗留的公共`Client`方法）* | `client.datasets.experimentRuns.query()` |

    有关完整参数和字段列表，请参阅[reference](https://reference.langchain.com/javascript/langsmith/_openapi_client/resources/Datasets/ExperimentRuns/query)。
  </Tab>
  <Tab title="Java">
    |之前 |之后 |
    |--------|--------|
    | `client.datasets().runs().query()` | `client.datasets().experimentRuns().query()` |

    完整参数列表请参见[reference](https://javadoc.io/doc/com.langchain.smith/langsmith-java/latest/com/langchain/smith/services/blocking/datasets/ExperimentRunService.html)。
  </Tab>
  <Tab title="Go">
    |之前 |之后 |
    |--------|--------|
    | `client.Datasets.Runs.Query()` | `client.Datasets.ExperimentRuns.Query()` |完整参数列表请参见[reference](https://pkg.go.dev/github.com/langchain-ai/langsmith-go#DatasetExperimentRunService.Query)。
  </Tab>
  <Tab title="cURL">
    |之前 |之后 |
    |--------|--------|
    | `POST /api/v1/datasets/{dataset_id}/runs` | `POST /api/v2/datasets/{dataset_id}/experiment-runs` |

    有关完整参数和字段列表，请参阅[API doc](/langsmith/smith-api/datasets/fetch-experiment-runs-for-dataset-examples)。
  </Tab>
</Tabs>

#### 查询参数

<Tabs>
  <Tab title="Python">
    <Warning>
    `experiment_ids` 是必需的并替换 `session_ids`。值仍然是实验跟踪项目 UUID - 如果您只知道实验名称，请首先解析它：异步代码中的`client.read_project(project_name="my-experiment").id`或`await client.aread_project(project_name="my-experiment")`。
    </Warning>

    |之前 (`get_experiment_results`) |之后(`datasets.experiment_runs.query`)|笔记|
    |---|---|---|
    | `project_id` | `experiment_ids` | `get_experiment_results` 接受1个项目/实验；新方法接受必需的非空列表 |
    | `limit` | *（已删除）* |使用 `page_size` 作为每个请求的批量大小 |
    | *（不可用）* | `page_size` |每个请求结果计数（默认 20，最大 100）|
    | *（内部处理）* | `cursor` |传递上一页的`next_cursor`来获取下一页 |
    | `preview` | `selects` |省略 `selects` 仅返回运行 ID；使用 `INPUTS_PREVIEW` 和 `OUTPUTS_PREVIEW` 进行预览，或使用 `INPUTS` 和 `OUTPUTS` 进行完整有效负载 |
    | *（未暴露）* | `sort` |使用`{by, order}`进行反馈分数排序|
    | `filters` | `filters` |不变；将实验 UUID 字符串映射到过滤表达式 |
    | `comparative_experiment_id` | `comparative_experiment_id` |不变 || *（未暴露）* | `example_ids` |可选示例 UUID 过滤器，最大 1000 |
  </Tab>
  <Tab title="TypeScript">
    <Warning>
    需要 `experiment_ids` 并替换 `session_ids`。值仍然是实验跟踪项目 UUID — 如果您只知道实验名称，请先解析它：`(await client.readProject({ projectName: "my-experiment" })).id`。
    </Warning>

    |之前 |之后(`datasets.experimentRuns.query`) |笔记|
    |---|---|---|
    | *（没有遗留的公共`Client`方法）* | `experiment_ids` |必填且非空 |
    | *（没有遗留的公共`Client`方法）* | `page_size` |默认为 20，最大 100 |
    | *（没有遗留的公共`Client`方法）* | `cursor` |传递上一页的 `next_cursor` 而不是数字偏移量 |
    | *（没有遗留的公共`Client`方法）* | `selects` |省略 `selects` 仅返回运行 ID；使用 `INPUTS_PREVIEW` 和 `OUTPUTS_PREVIEW` 进行预览，或使用 `INPUTS` 和 `OUTPUTS` 进行完整有效负载 |
    | *（没有遗留的公共`Client`方法）* | `sort` |使用`{ by, order }`进行反馈分数排序|
    | *（没有遗留的公共`Client`方法）* | `filters` |将实验 UUID 字符串映射到过滤表达式 |
    | *（没有遗留的公共`Client`方法）* | `comparative_experiment_id` |范围成对注释反馈 |
    | *（没有遗留的公共`Client`方法）* | `example_ids` |可选示例 UUID 过滤器，最大 1000 |
  </Tab>
  <Tab title="Java">
    <Warning>`experimentIds()` 是必需的并替换 `sessionIds()`。值仍然是实验跟踪项目 UUID - 如果您只知道实验名称，请先解析它：`client.sessions().list(SessionListParams.builder().name("my-experiment").build()).items().first().id()`。
    </Warning>

    |之前 (`RunQueryParams`) |之后（`ExperimentRunQueryParams`）|笔记|
    |---|---|---|
    | `sessionIds()` | `experimentIds()` |更名；必填且非空 |
    | `limit()` | *（已删除）* |使用 `pageSize()` 作为每个请求的批量大小 |
    | *（不可用）* | `pageSize()` |每个请求结果计数（默认 20，最大 100）|
    | `offset()` | `cursor()` |传递上一页的 `nextCursor()` 而不是数字偏移量 |
    | `preview()` | `selects()` |省略选择仅返回运行 ID；添加 `Select.INPUTS_PREVIEW` 和 `Select.OUTPUTS_PREVIEW` 进行预览 |
    | `sortParams()` | `sort()` |形状从 `sortBy()` / `sortOrder()` 更改为 `by()` / `order()` |
    | `filters()` | `filters()` |不变 |
    | `comparativeExperimentId()` | `comparativeExperimentId()` |不变 |
    | `exampleIds()` | `exampleIds()` |不变，最多 1000 |
    | `format()` | *（已删除）* |新端点仅返回 JSON |
    | `includeAnnotatorDetail()` | *（已删除）* |没有新的 JSON 等效项 |
  </Tab>
  <Tab title="Go">
    <Warning>
    `ExperimentIDs` 是必需的并取代 `SessionIDs`。值仍然是实验跟踪项目 UUID — 如果您只知道实验名称，请先解析它：列出按 `Name` 过滤的会话，并获取第一个结果的 `ID`。</Warning>

    |之前 (`DatasetRunQueryParams`) |之后（`DatasetExperimentRunQueryParams`）|笔记|
    |---|---|---|
    | `SessionIDs` | `ExperimentIDs` |更名；必填且非空 |
    | `Limit` | *（已删除）* |使用 `PageSize` 作为每个请求的批量大小 |
    | *（不可用）* | `PageSize` |每个请求结果计数（默认 20，最大 100）|
    | `Offset` | `Cursor` |传递上一页的 `NextCursor` 而不是数字偏移量 |
    | `Preview` | `Selects` |省略选择仅返回运行 ID；使用 `InputsPreview` 和 `OutputsPreview` 选择预览常量 |
    | `SortParams` | `Sort` |形状从 `SortBy` / `SortOrder` 更改为 `By` / `Order` |
    | `Filters` | `Filters` |不变 |
    | `ComparativeExperimentID` | `ComparativeExperimentID` |不变 |
    | `ExampleIDs` | `ExampleIDs` |不变，最多 1000 |
    | `Format` | *（已删除）* |新端点仅返回 JSON |
    | `IncludeAnnotatorDetail` | *（已删除）* |没有新的 JSON 等效项 |
  </Tab>
  <Tab title="cURL">
    <Warning>
    需要 `experiment_ids` 并替换 `session_ids`。值仍然是实验跟踪项目 UUID - 如果您只知道实验名称，请先解析它：`GET /api/v1/sessions?name=my-experiment` 并采用 `.[0].id`。
    </Warning>|之前（`POST /api/v1/datasets/{dataset_id}/runs`本体）|之后（`POST /api/v2/datasets/{dataset_id}/experiment-runs`本体）|笔记|
    |---|---|---|
    | `session_ids` | `experiment_ids` |更名；必填且非空 |
    | `limit` | *（已删除）* |使用 `page_size` 作为每个请求的批量大小 |
    | *（不可用）* | `page_size` |每个请求结果计数（默认 20，最大 100）|
    | `offset` | `cursor` |传递上一页的 `next_cursor` 而不是数字偏移量 |
    | `preview` | `selects` |省略 `selects` 仅返回运行 ID；使用 `INPUTS_PREVIEW` 和 `OUTPUTS_PREVIEW` 进行预览，或使用 `INPUTS` 和 `OUTPUTS` 进行完整有效负载 |
    | `sort_params` | `sort` |形状从`{sort_by, sort_order}`更改为`{by, order}` |
    | `filters` | `filters` |不变；将实验 UUID 字符串映射到过滤表达式 |
    | `comparative_experiment_id` | `comparative_experiment_id` |不变 |
    | `example_ids` | `example_ids` |不变，最多 1000 |
    | `format=csv` | *（已删除）* |新端点仅返回 JSON |
    | `include_annotator_detail` | *（已删除）* |没有新的 JSON 等效项 |
  </Tab>
</Tabs>

#### 响应字段

每个页面项目都是一个数据集示例，与为其生成的运行配对——而不是一个裸露的`Run`。它的 `runs` 字段保存与 [Querying runs](#response-fields) 返回的相同的 `Run` 对象；请参阅该部分了解每次运行字段。下表描述了该项目的其余部分：`runs` 旁边的示例字段。<Tabs>
  <Tab title="Python">
    `get_experiment_results` 使用`examples_with_runs` 迭代器返回实验结果。 `datasets.experiment_runs.query` 返回分页页面对象（`page.items`、`page.next_cursor`）；每个项目有：

    |领域|笔记|
    |---|---|
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
    旧数据集运行端点未在公共 TypeScript `Client` 上公开。 `datasets.experimentRuns.query` 返回分页页面（`page.getPaginatedItems()`、`page.next_cursor`）；每个项目有：|领域|笔记|
    |---|---|
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
    `runs().query` 返回一个可选列表。 `experimentRuns().query` 返回页面对象（`items()`，`nextCursor()`）；每个项目有：

    |领域|笔记|
    |---|---|
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
    |---|---|
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
    `POST /api/v1/datasets/{dataset_id}/runs` 返回一个 JSON 数组。 `POST /api/v2/datasets/{dataset_id}/experiment-runs` 返回`{ "items": [...], "next_cursor": "..." }`；每个项目有：

    |领域|笔记|
    |---|---|
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
    `preview=True` 自动返回截断的输入/输出。在新 API 中，明确请求：对于相同的截断形状，在 `selects` 中传递 `INPUTS_PREVIEW` 和 `OUTPUTS_PREVIEW`，或者对于未截断的值，传递 `INPUTS`/`OUTPUTS`。省略 `selects` 仅返回 `id`。

<Tabs sync={false}>
  <Tab title="Before">
    ```python Before
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
    ```python After
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

<Tabs sync={false}>
  <Tab title="Before">
    ```ts Before
// The legacy dataset runs endpoint was not exposed on the public TypeScript Client.
// Use the cURL example for the old request body shape.
```
  </Tab>
  <Tab title="After">
    ```ts After
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

<Tabs sync={false}>
  <Tab title="Before">
    ```kotlin Before
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
    ```kotlin After
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
</Tabs></Tab>
  <Tab title="Go">
    `Preview: true` 自动返回截断的输入/输出。在新 API 中，明确请求：为相同的截断形状添加 `InputsPreview` 和 `OutputsPreview` 选择常量，或为未截断的值添加 `Inputs`/`Outputs`。省略选择仅返回`ID`。

<Tabs sync={false}>
  <Tab title="Before">
    ```go Before
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
    ```go After
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
    `preview: true` 自动返回截断的输入/输出。在新 API 中，明确请求：对于相同的截断形状，在 `selects` 中传递 `INPUTS_PREVIEW` 和 `OUTPUTS_PREVIEW`，对于未截断的值，传递 `INPUTS`/`OUTPUTS`。省略 `selects` 仅返回 `id`。

<Tabs sync={false}>
  <Tab title="Before">
    ```bash Before
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
    ```bash After
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

下面的两个示例都会跨尽可能多的页面获取最多 100 个结果，然后停止，因此这两个操作是可比较的，而不是“一页”与“所有内容”。根据您自己的用例调整 `100`/`page_size` 值。

<Tabs>
  <Tab title="Python">
    `get_experiment_results` 内部分页，并在 `limit` 返回总结果后停止。 `datasets.experiment_runs.query`没有总计数`limit`；一旦足够了，就用 `async for` 和 `break` 迭代返回的页面。<Tabs sync={false}>
  <Tab title="Before">
    ```python Before
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
    ```python After
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
    旧数据集运行端点未在公共 TypeScript `Client` 上公开。 `client.datasets.experimentRuns.query(...)` 返回一个异步迭代 - 使用 `for await...of` （不需要额外的 `await`）和 `break` 一旦你有足够的。

<Tabs sync={false}>
  <Tab title="Before">
    ```ts Before
// The legacy dataset runs endpoint was not exposed on the public TypeScript Client.
// Use the cURL example for the old request body shape.
```
  </Tab>
  <Tab title="After">
    ```ts After
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

<Tabs sync={false}>
  <Tab title="Before">
    ```kotlin Before
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
    ```kotlin After
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

  </Tab>
  <Tab title="Go">
    旧端点每次调用都会返回一页，没有自动寻呼机 - 手动循环，递增 `Offset`，一旦足够就停止。在新端点上，通过对来自先前响应的 `NextCursor` 的请求设置 `Cursor` 来手动分页，并在足够时停止；此处避免使用 `QueryAutoPaging` — 它将游标作为查询参数发送，该 POST 端点不会读取该游标，因此它会永远默默地重新获取第一页。

<Tabs sync={false}>
  <Tab title="Before">
    ```go Before
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
    ```go After
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
</Tabs></Tab>
  <Tab title="cURL">
    原始 HTTP 没有自动分页助手：将先前响应的 `next_cursor` 作为 `cursor` 传回以获取下一页。

<Tabs sync={false}>
  <Tab title="Before">
    ```bash Before
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
    ```bash After
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
    `get_experiment_results`不支持按反馈分数排序。

<Tabs sync={false}>
  <Tab title="Before">
    ```python
# get_experiment_results did not support sorting results by feedback score.
```
  </Tab>
  <Tab title="After">
    ```python After
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

<Tabs sync={false}>
  <Tab title="Before">
    ```ts Before
// The legacy dataset runs endpoint was not exposed on the public TypeScript Client.
// Use the cURL example for the old request body shape.
```
  </Tab>
  <Tab title="After">
    ```ts After
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
    `sortParams()` 被`sort()` 取代，`sortBy()`/`sortOrder()` 更名为`by()`/`order()`。

<Tabs sync={false}>
  <Tab title="Before">
    ```kotlin Before
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
    ```kotlin After
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
    `SortParams` 被 `Sort` 取代，`SortBy`/`SortOrder` 重命名为 `By`/`Order`。<Tabs sync={false}>
  <Tab title="Before">
    ```go Before
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
    ```go After
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
<Tabs sync={false}>
  <Tab title="Before">
    ```bash Before
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
    ```bash After
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

## 另请参阅

- [Threads](/langsmith/smithdb-sdk-migration-threads)
- [Feedback and annotation queues](/langsmith/smithdb-sdk-migration-feedback)
- [Migration overview](/langsmith/smithdb-sdk-migration)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/smithdb-sdk-migration-experiments.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>