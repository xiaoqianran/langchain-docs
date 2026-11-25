<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage feedback & annotation queues programmatically | https://docs.langchain.com/langsmith/annotation-queues-sdk -->

# 以编程方式管理反馈和注释队列

使用 LangSmith SDK 以编程方式管理反馈配置和 [annotation queue](/langsmith/evaluation-concepts#human) 评分标准，并将运行和线程添加到队列中以供审核。在工作区级别定义可重用的反馈模式（例如准确性分数或通过/失败判断），然后使用自定义指令将它们分配到特定队列。这可以实现版本控制、跨代理的自动化和一致性，对于 CI/CD 管道或跨环境复制评估设置特别有用。

本指南使用 Python 和 TypeScript SDK。安装和设置请参考[Python SDK documentation](https://reference.langchain.com/python/langsmith)和[TypeScript SDK documentation](https://reference.langchain.com/javascript/langsmith)。

> [!注意]
>
> 要查看[LangSmith Engine](/langsmith/engine) 针对重复出现的问题提出的自由形式验收标准，请参阅[Use assertions](/langsmith/assertions)。

## 反馈层

LangSmith 使用三层架构来实现结构化的人类反馈：1. **反馈配置**：反馈键的工作区范围定义，用于建立评估指标的架构。例如，您可以将“准确性”定义为连续的 0-1 分数，或将“正确性”定义为通过/失败的分类选择。这些配置可在工作区中的所有注释队列中重复使用。
2. **注释队列标题项**：特定于队列的分配，用于确定注释者在查看特定队列中的[runs](/langsmith/observability-concepts#runs)时必须填写哪些反馈配置。每个评分标准项目可以包括自定义描述、特定分值的指导、反馈是必需的还是可选的，以及根据先前的答案显示或需要该项目的条件。
3. **反馈**：注释者在特定[runs](/langsmith/observability-concepts#runs)上提交的个人分数和值。这是使用您定义的模式收集的实际评估数据。了解更多关于[feedback in LangSmith](/langsmith/observability-concepts#feedback)的信息。

## 反馈配置

### 创建反馈配置

反馈配置定义反馈键的架构 - 无论是连续分数、分类选择还是自由格式文本。唯一的密钥标识工作区中的每个配置，并指定注释者如何提交该指标的反馈。> [!注意]
>
> 使用已存在的相同配置调用 [⟦T28⟧](https://reference.langchain.com/python/langsmith/client/Client/create_feedback_config) 将返回现有配置。如果同一密钥已存​​在不同的配置，系统会引发 400 错误。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client

client = Client()

# Continuous score
client.create_feedback_config(
    "accuracy",
    feedback_config={
        "type": "continuous",
        "min": 0,
        "max": 1,
    },
    is_lower_score_better=False,
)

# Categorical
client.create_feedback_config(
    "correctness",
    feedback_config={
        "type": "categorical",
        "categories": [
            {"value": 1, "label": "Pass"},
            {"value": 0, "label": "Fail"},
        ],
    },
)

# Freeform text
client.create_feedback_config(
    "notes",
    feedback_config={"type": "freeform"},
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";

const client = new Client();

// Continuous score
await client.createFeedbackConfig({
  feedbackKey: "accuracy",
  feedbackConfig: { type: "continuous", min: 0, max: 1 },
  isLowerScoreBetter: false,
});

// Categorical
await client.createFeedbackConfig({
  feedbackKey: "correctness",
  feedbackConfig: {
    type: "categorical",
    categories: [
      { value: 1, label: "Pass" },
      { value: 0, label: "Fail" },
    ],
  },
});

// Freeform text
await client.createFeedbackConfig({
  feedbackKey: "notes",
  feedbackConfig: { type: "freeform" },
});
```

* **连续** (`"accuracy"`)：定义从 0 到 1 的数字范围。`is_lower_score_better` 参数指示较低的值是否代表更好的性能。使用连续配置进行评级尺度或基于百分比的指标。
* **分类** (`"correctness"`)：提供具有关联值的预定义选项。每个类别都需要一个`value`（用于评分和分析）和一个`label`（向注释者显示）。使用分类配置进行二元选择或多类分类。
* **自由格式** (`"notes"`)：允许没有预定义结构的开放式文本输入。使用自由格式配置进行定性观察或解释。

### 列出反馈配置

使用 [⟦T35⟧](https://reference.langchain.com/python/langsmith/client/Client/list_feedback_configs) 检索反馈配置以查看您的工作区中可用的评估标准。您可以列出所有配置或按特定键进行过滤。每个返回的配置对象包括密钥、类型、配置详细信息（如`min`/`max`或`categories`）以及元数据（如`is_lower_score_better`）：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# List all configs
for config in client.list_feedback_configs():
    print(f"{config.feedback_key}: {config.feedback_config}")

# Filter by specific keys
for config in client.list_feedback_configs(
    feedback_key=["accuracy", "correctness"]
):
    print(config.feedback_key)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// List all configs
for await (const config of client.listFeedbackConfigs()) {
  console.log(`${config.feedback_key}: ${JSON.stringify(config.feedback_config)}`);
}

// Filter by specific keys
for await (const config of client.listFeedbackConfigs({
  feedbackKeys: ["accuracy", "correctness"],
})) {
  console.log(config.feedback_key);
}
```

### 更新反馈配置通过更新特定字段，使用 [⟦T40⟧](https://reference.langchain.com/python/langsmith/client/Client/update_feedback_config) 修改现有反馈配置。该方法仅更改您提供的字段，其余字段保持不变。这是保留其他配置设置的部分更新：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.update_feedback_config(
    "accuracy",
    is_lower_score_better=True,
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await client.updateFeedbackConfig("accuracy", {
  isLowerScoreBetter: true,
});
```

传递 `feedback_config` 会替换整个配置，包括其类别列表。要保持多选配置多选，请在新配置中包含 `allows_multiple_categories`。

#### 添加或删除类别

要更改大型类别列表而不重新发送它，请使用 `add_feedback_categories` 和 `remove_feedback_categories` 添加或删除单个类别。两种方法都保留配置的其他类别及其 `allows_multiple_categories` 设置：

> [!注意]
>
> 这些方法需要 `langsmith>=0.15.0` (Python) 或 `langsmith>=0.12.0` (TypeScript)。自托管 LangSmith 需要 v0.18 或更高版本。早期版本会忽略更改并返回未更改的配置。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Add categories. Values and labels must not match existing ones.
client.add_feedback_categories(
    "topics",
    [{"value": 3, "label": "warranty"}],
)

# Remove categories by value, not label.
client.remove_feedback_categories("topics", [2])
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// Add categories. Values and labels must not match existing ones.
await client.addFeedbackCategories("topics", [
  { value: 3, label: "warranty" },
]);

// Remove categories by value, not label.
await client.removeFeedbackCategories("topics", [2]);
```

删除类别不会更改已使用该值编写的反馈。分类配置必须至少保留两个类别，因此删除少于两个类别会失败，并出现 422 错误。

### 删除反馈配置使用 [⟦T48⟧](https://reference.langchain.com/python/langsmith/client/Client/delete_feedback_config) 从工作区中删除反馈配置。这将执行软删除，将配置标记为已删除，但不会将其从系统中永久删除。如果需要，您可以稍后使用相同的密钥重新创建配置：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.delete_feedback_config("accuracy")
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await client.deleteFeedbackConfig("accuracy");
```

## 注释队列标题项目

Rubric 项目将反馈配置分配给特定的注释队列。它们控制注释者在审阅该队列中的[runs](/langsmith/observability-concepts#runs)时看到哪些反馈表单，以及每个表单是必需的还是可选的。

### 创建一个包含标题项目的队列

使用 [⟦T49⟧](https://reference.langchain.com/python/langsmith/client/Client/create_annotation_queue) 创建注释队列，并通过 rubric 项目为其分配反馈配置。每个标题项都通过其键引用反馈配置，并自定义它在此特定队列中的注释者面前的显示方式。

该示例创建一个包含三个标题项的队列。队列级别`rubric_instructions`提供了注释界面顶部显示的一般指导：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
queue = client.create_annotation_queue(
    name="QA Review Queue",
    description="Review LLM outputs for accuracy and correctness",
    rubric_instructions="Score each response. Add notes for anything unusual.",
    rubric_items=[
        {
            "feedback_key": "accuracy",
            "description": "How accurate is the response?",
            "score_descriptions": {
                "0": "Completely wrong",
                "1": "Perfectly accurate",
            },
            "is_required": True,
        },
        {
            "feedback_key": "correctness",
            "description": "Did the response pass or fail?",
            "value_descriptions": {
                "Pass": "Factually correct",
                "Fail": "Contains errors",
            },
            "is_required": True,
        },
        {
            "feedback_key": "notes",
            "description": "Any additional observations",
            "is_required": False,
        },
    ],
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const queue = await client.createAnnotationQueue({
  name: "QA Review Queue",
  description: "Review LLM outputs for accuracy and correctness",
  rubricInstructions: "Score each response. Add notes for anything unusual.",
  rubricItems: [
    {
      feedback_key: "accuracy",
      description: "How accurate is the response?",
      score_descriptions: { "0": "Completely wrong", "1": "Perfectly accurate" },
      is_required: true,
    },
    {
      feedback_key: "correctness",
      description: "Did the response pass or fail?",
      value_descriptions: { Pass: "Factually correct", Fail: "Contains errors" },
      is_required: true,
    },
    {
      feedback_key: "notes",
      description: "Any additional observations",
      is_required: false,
    },
  ],
});
```* `feedback_key`：现有反馈配置的密钥（首先创建它）。
* `description`：针对此指标的注释者的队列特定指南。
* `score_descriptions` / `value_descriptions`：可选标签，解释特定值的含义（使用 `score_descriptions` 表示连续配置，`value_descriptions` 表示分类配置）。
* `is_required`：注释者是否必须在提交之前完成此反馈。

### 更新现有队列上的标题项

使用 [⟦T58⟧](https://reference.langchain.com/python/langsmith/client/Client/update_annotation_queue) 修改分配给注释队列的标题项。此操作会替换整个标题项目列表，因此您必须包括要保留的所有项目 - 该操作会删除您不包括的所有项目。

您将需要队列 ID，该 ID 是在创建队列或通过列出队列时获得的：

> [!注意]
>
> 更新标题项目替换完整列表。包括您想要保留的所有物品。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.update_annotation_queue(
    queue.id,
    rubric_items=[
        {"feedback_key": "accuracy", "is_required": True},
        {"feedback_key": "correctness", "is_required": True},
        {
            "feedback_key": "tone",
            "description": "Is the tone appropriate?",
            "is_required": False,
        },
    ],
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await client.updateAnnotationQueue(queue.id, {
  rubricItems: [
    { feedback_key: "accuracy", is_required: true },
    { feedback_key: "correctness", is_required: true },
    { feedback_key: "tone", description: "Is the tone appropriate?", is_required: false },
  ],
});
```

当更新忽略项目的 `required_if` 或 `visible_if` 时，该项目将保持其当前状态。要清除条件，请传递 `None` (Python) 或 `null` (TypeScript)。

### 向标题项目添加条件

条件使标题项目依赖于先前项目的答案，因此审阅者仅在适用时才能看到后续问题。每个标题项接受两个可选条件字段：* **`required_if`**：该项目始终显示，并且仅在条件成立时才需要。
* **`visible_if`**：该项目将被隐藏，直到条件成立。显示后，它遵循`is_required`。

> [!注意]
>
> Rubric 项目条件需要 `langsmith>=0.15.0` (Python) 或 `langsmith>=0.12.0` (TypeScript)。

每个条件对象都有一个`"all"`或`"any"`的`join`和一个`rules`列表。每个规则都会命名同一标题中较早项目的 `key`、`op` 以及要匹配的类别 `values`：

* **`is`**：前一项的答案是给定的一个值。
* **`is_one_of`**：前面的项目的答案是给定的任何值。
* **`is_empty`**：前面的项目没有答案。不采用任何值。
* **`is_not_empty`**：前面的项目有答案。不采用任何值。

规则值是类别值，而不是标签。对于多选项目，如果任何选定类别匹配，则 `is` 和 `is_one_of` 保持不变。

以下示例仅当审阅者将响应标记为失败时才询问失败原因：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.update_annotation_queue(
    queue.id,
    rubric_items=[
        {"feedback_key": "correctness", "is_required": True},
        {
            "feedback_key": "failure_reason",
            "description": "Why did the response fail?",
            "is_required": True,
            "visible_if": {
                "join": "all",
                "rules": [{"key": "correctness", "op": "is", "values": [0]}],
            },
        },
    ],
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await client.updateAnnotationQueue(queue.id, {
  rubricItems: [
    { feedback_key: "correctness", is_required: true },
    {
      feedback_key: "failure_reason",
      description: "Why did the response fail?",
      is_required: true,
      visible_if: {
        join: "all",
        rules: [{ key: "correctness", op: "is", values: [0] }],
      },
    },
  ],
});
```规则只能引用标题中较早出现的项目。引用后面的项目或该项目本身的规则会失败并出现 422 错误。 LangSmith 存储条件并在审核视图中应用它们。当直接编写反馈时，API 不会强制执行它们。

### 将一个标题复制到另一个队列

`read_annotation_queue` 按顺序返回队列的标题项目，每个项目都带有它使用的反馈配置。要复制标题，请将这些项目按原样传递到另一个队列的 `rubric_items`：

> [!注意]
>
> 读取评分项及其反馈配置需要 `langsmith>=0.15.0` (Python) 或 `langsmith>=0.12.0` (TypeScript)。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
source = client.read_annotation_queue(source_queue_id)

client.update_annotation_queue(
    target_queue_id,
    rubric_instructions=source.rubric_instructions,
    rubric_items=source.rubric_items,
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const source = await client.readAnnotationQueue(sourceQueueId);

await client.updateAnnotationQueue(targetQueueId, {
  rubricInstructions: source.rubric_instructions,
  rubricItems: source.rubric_items,
});
```

由于更新会替换完整的标题项目列表，因此更新会替换目标队列的标题。要保留目标的现有项目，请在更新之前合并两个列表。

## 将运行和线程添加到队列中

将 [runs](/langsmith/observability-concepts#runs) 和 [threads](/langsmith/observability-concepts#threads) 添加到具有注释队列 `items` 资源的单次运行注释队列。单个请求接受混合批次的运行项和线程项，因此此方法涵盖了 UI [add flow](/langsmith/annotation-queues#assign-runs-and-threads-to-a-single-run-queue) 支持的所有内容。

> [!注意]
>
> `items` 资源需要 `langsmith>=0.10.13` (Python) 或 `langsmith>=0.8.8` (TypeScript)，由 `0.16.14` 或更高版本上的 LangSmith 后端提供服务。每个项目设置 `item_type` 为 `RUN` 或 `THREAD`：

* **RUN 项目** 需要 `run_id`。还提供`project_id`和`start_time`，它们一起直接定位运行。
* **THREAD 项目**需要 `thread_id` 和 `project_id`。

使用 SDK 解析这些 ID：

* **`project_id`**：代理环境的`tracer_session_id`。 [Resolve the agent environment](/langsmith/resolve-an-agent#resolve-an-agent-and-query-its-runs) 与 `client.sessions.resolve()` 并使用返回的 `session_id`。
* **`run_id`**：查询使用 `client.runs.query()` 运行。每次运行都会公开 `id`、`project_id` 和 `start_time`，这是 RUN 项所需的字段。
* **`thread_id`**：使用`client.threads.query()`查询线程。每个结果都会暴露其`thread_id`。

> [!注意]
>
> 解析代理环境需要最新的 SDK 和LangSmith 版本，并且在 BYOC 数据平面上不可用。有关要求和 BYOC 替代方案，请参阅[Resolve an agent environment](/langsmith/resolve-an-agent)。

您还可以在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-annotation-queues-sdk) 中找到这些 ID：* **`project_id`**：代理环境的`tracer_session_id`。选择您的代理，转到**跟踪**，然后选择环境。单击环境名称旁边的 **ID** 徽章，然后复制 **跟踪项目 ID**。要了解为什么这些 API 采用项目 ID，请参阅 [Resolve an agent environment](/langsmith/resolve-an-agent)。
* **`run_id`**：在 [Details view](/langsmith/view-traces#details-view) 中打开运行，然后单击运行名称旁边的 **ID** 徽章以复制运行 ID。
* **`thread_id`**：选择您的代理，转到**跟踪**，选择环境，然后打开**线程**选项卡。复制 **线程 ID** 列中的值。

要延长添加的运行项目的跟踪保留时间，请传递 `extend_trace_retention=True`。如果工作区[disables extended trace retention](/langsmith/data-purging-compliance#disable-extended-trace-retention)，则添加项目而不延长保留时间。响应是一个带有 `items` 数组的信封，每个添加的项目一个条目。

> [!注意]
>
> 在 Python 中，`annotation_queues.items.create` 是异步的，因此 `await` 它位于事件循环内。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

async def main():
    queue_name = "<queue_name>"
    project_id = "<project_id>"
    run_id = "<run_id>"
    thread_id = "<thread_id>"

    # Look up the annotation queue by name to get its ID.
    queue = next(client.list_annotation_queues(name=queue_name), None)
    if queue is None:
        raise SystemExit(f"No annotation queue named {queue_name!r}")

    # Fetch the run to add by id + project_id. runs.retrieve() requires
    # `selects` (uppercase RunSelectField names) to return fields like
    # start_time.
    run = await client.runs.retrieve(
        run_id=run_id,
        project_id=project_id,
        selects=["ID", "PROJECT_ID", "START_TIME"],
    )

    response = await client.annotation_queues.items.create(
        str(queue.id),
        items=[
            {
                "item_type": "RUN",
                "run_id": run_id,
                "project_id": project_id,
                "start_time": run.start_time,
            },
            {
                "item_type": "THREAD",
                "thread_id": thread_id,
                "project_id": project_id,
            },
        ],
    )

    # response.items contains one entry per added item.
    for item in response.items or []:
        print(item.id, item.item_type)

asyncio.run(main())
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const queueName = "<queue_name>";
const projectId = "<project_id>";
const runId = "<run_id>";
const threadId = "<thread_id>";

// Look up the annotation queue by name to get its ID.
let queue;
for await (const q of client.listAnnotationQueues({ name: queueName })) {
  queue = q;
  break;
}
if (!queue) {
  throw new Error(`No annotation queue named ${queueName}`);
}

// Fetch the run to add by id + project_id. retrieve() requires `selects`
// (uppercase RunSelectField names) to return fields like start_time.
const run = await client.runs.retrieve(runId, {
  project_id: projectId,
  selects: ["ID", "PROJECT_ID", "START_TIME"],
});

const response = await client.annotationQueues.items.create(queue.id, {
  items: [
    {
      item_type: "RUN",
      run_id: runId,
      project_id: projectId,
      start_time: run.start_time,
    },
    {
      item_type: "THREAD",
      thread_id: threadId,
      project_id: projectId,
    },
  ],
});

// response.items contains one entry per added item.
for (const item of response.items ?? []) {
  console.log(item.id, item.item_type);
}
```

> [!注意]
>
> 对于仅运行添加，[⟦T118⟧](https://reference.langchain.com/python/langsmith/client/Client/add_runs_to_annotation_queue) 仍然有效，并且在不添加线程时仍然是最简单的选项。添加线程或混合运行和线程批处理的新代码应使用 `items` 资源。

## 反馈配置类型（详细）

### 连续连续配置定义具有最小值和最大值的数字评级范围。注释者可以选择该范围内的任何值，这使得它非常适合在数字尺度上对准确性、质量或相关性等维度进行评分：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Simple continuous score
client.create_feedback_config(
    "accuracy",
    feedback_config={
        "type": "continuous",
        "min": 0,
        "max": 1,
    },
)

# Continuous with labeled points on the scale
client.create_feedback_config(
    "quality",
    feedback_config={
        "type": "continuous",
        "min": 1,
        "max": 5,
        "categories": [
            {"value": 1, "label": "Poor"},
            {"value": 3, "label": "Average"},
            {"value": 5, "label": "Excellent"},
        ],
    },
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await client.createFeedbackConfig({
  feedbackKey: "accuracy",
  feedbackConfig: { type: "continuous", min: 0, max: 1 },
});

await client.createFeedbackConfig({
  feedbackKey: "quality",
  feedbackConfig: {
    type: "continuous",
    min: 1,
    max: 5,
    categories: [
      { value: 1, label: "Poor" },
      { value: 3, label: "Average" },
      { value: 5, label: "Excellent" },
    ],
  },
});
```

第一个示例显示没有标签的 0-1 等级。第二个示例演示了在量表上添加带有标记锚点的`categories`（如“差”、“平均”、“优秀”），以帮助注释者理解不同值代表什么。这些标签是可选的，但可以提高注释者解释比例的一致性。

### 分类

分类配置提供了一组离散的预定义选项供注释者选择。每个类别必须有一个`value`（用于评分和分析的数字标识符）和`label`（向注释者显示的文本）。您必须定义至少 2 个类别。

使用分类配置进行二元决策（通过/失败、正确/不正确）、多类分类（情绪、主题类别）或使用一组固定的离散选项进行任何评估。不要为分类配置设置 `min` 或 `max`：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Binary pass/fail
client.create_feedback_config(
    "correctness",
    feedback_config={
        "type": "categorical",
        "categories": [
            {"value": 1, "label": "Pass"},
            {"value": 0, "label": "Fail"},
        ],
    },
)

# Multi-class
client.create_feedback_config(
    "sentiment",
    feedback_config={
        "type": "categorical",
        "categories": [
            {"value": 0, "label": "Negative"},
            {"value": 1, "label": "Neutral"},
            {"value": 2, "label": "Positive"},
        ],
    },
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await client.createFeedbackConfig({
  feedbackKey: "correctness",
  feedbackConfig: {
    type: "categorical",
    categories: [
      { value: 1, label: "Pass" },
      { value: 0, label: "Fail" },
    ],
  },
});

await client.createFeedbackConfig({
  feedbackKey: "sentiment",
  feedbackConfig: {
    type: "categorical",
    categories: [
      { value: 0, label: "Negative" },
      { value: 1, label: "Neutral" },
      { value: 2, label: "Positive" },
    ],
  },
});
```第一个示例显示了二进制通过/失败配置。第二个示例演示了具有三个选项的情感多类配置。即使对于分类反馈，数值也允许您计算汇总分数。

#### 允许多项选择

设置 `allows_multiple_categories` 让审阅者为单个项目选择多个类别。将其用于多标签分类法，例如标记对话涵盖的每个主题。该标志默认为 `false` 并且仅适用于分类配置：

> [!注意]
>
> `allows_multiple_categories` 需要 `langsmith>=0.15.0` (Python) 或 `langsmith>=0.12.0` (TypeScript)。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.create_feedback_config(
    "topics",
    feedback_config={
        "type": "categorical",
        "categories": [
            {"value": 0, "label": "billing"},
            {"value": 1, "label": "shipping"},
            {"value": 2, "label": "returns"},
        ],
        "allows_multiple_categories": True,
    },
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await client.createFeedbackConfig({
  feedbackKey: "topics",
  feedbackConfig: {
    type: "categorical",
    categories: [
      { value: 0, label: "billing" },
      { value: 1, label: "shipping" },
      { value: 2, label: "returns" },
    ],
    allows_multiple_categories: true,
  },
});
```

当审阅者在审阅窗格中选择多个类别时，LangSmith 将每个选择保存为配置键下自己的反馈条目，类别标签为 `value`，类别值为 `score`。清除拾取将删除其条目。要使用 SDK 编写多选答案，请为每个类别创建一个反馈条目。

复合求值器不能包含多选键，因为一次运行可以在该键下有多个分数。

### 自由形式自由格式配置允许注释者提供开放式文本反馈，而无需任何预定义的结构或约束。此类型没有 `min`、`max` 或 `categories` 字段 - 注释者可以输入他们想要的任何文本。

自由形式反馈对于捕捉细致入微的见解很有价值，但与结构化反馈类型相比更难聚合和分析：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
client.create_feedback_config(
    "notes",
    feedback_config={"type": "freeform"},
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await client.createFeedbackConfig({
  feedbackKey: "notes",
  feedbackConfig: { type: "freeform" },
});
```

## 验证规则

|类型 |最小/最大 |类别 |限制条件|
| - | - | - | - |
| `continuous` |可选|可选（标记刻度点）| `min < max`； \[`min`, `max`] | 内的类别值
| `categorical` |不得设置 |必需，最少 2 |独特的价值观和标签|
| `freeform` |不得设置 |不得设置 |不适用 |

## 参考

### 反馈配置类型

|类型 |领域 |描述 |
| - | - | - |
| `continuous` | `min`、`max` |范围内的数值分数 |
| `categorical` |类别（`{value, label}`列表）|从预定义选项中进行选择 |
| `freeform` |无 |自由文本输入 |

### 评分项字段|领域 |类型 |描述 |
| - | - | - |
| `feedback_key` | `string` |必需的。必须与现有反馈配置键匹配。 |
| `description` | `string` |显示此项目的注释者指南。 |
| `score_descriptions` | `Record<string, string>` |特定分数值的标签（连续）。 |
| `value_descriptions` | `Record<string, string>` |特定类别值的标签（分类）。 |
| `is_required` | `boolean` |注释者是否必须在提交前完成此项。默认为 false。 |
| `required_if` | `object` |早期项目的条件。该物品仅在持有时才需要。参见[Add conditions to rubric items](#add-conditions-to-rubric-items)。 |
| `visible_if` | `object` |早期项目的条件。该物品会被隐藏起来，直到它们固定为止。参见[Add conditions to rubric items](#add-conditions-to-rubric-items)。 |

### 反馈配置字段

|领域 |类型 |描述 |
| - | - | - |
| `allows_multiple_categories` | `boolean` |仅分类。审阅者是否可以选择多个类别。默认为 false。 |

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/annotation-queues-sdk.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。