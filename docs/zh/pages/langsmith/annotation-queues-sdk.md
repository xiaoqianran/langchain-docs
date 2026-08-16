<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage feedback & annotation queues programmatically | https://docs.langchain.com/langsmith/annotation-queues-sdk -->

# 以编程方式管理反馈和注释队列

使用 LangSmith SDK 以编程方式管理反馈配置和 [annotation queue](/langsmith/evaluation-concepts#human) 评分标准。在组织级别定义可重用的反馈模式（例如准确性分数或通过/失败判断），然后使用自定义指令将它们分配到特定队列。这可以实现版本控制、跨项目自动化和一致性，对于 CI/CD 管道或跨环境复制评估设置特别有用。

<Callout icon="code">
本指南使用 Python 和 TypeScript SDK。安装和设置请参考[Python SDK documentation](https://reference.langchain.com/python/langsmith)和[TypeScript SDK documentation](https://reference.langchain.com/javascript/modules/langsmith.html)。
</Callout>

<Note>
要在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-annotation-queues-sdk) 中审核时编写各个运行的自由形式验收标准，请参阅[Use assertions](/langsmith/assertions)。
</Note>

## 反馈层

LangSmith 使用三层架构来实现结构化的人类反馈：1. **反馈配置**：组织范围内的反馈键定义，用于建立评估指标的架构。例如，您可以将“准确性”定义为连续的 0-1 分数，或将“正确性”定义为通过/失败的分类选择。这些配置可在组织中的所有注释队列中重复使用。
1. **注释队列标题项**：特定于队列的分配，用于确定注释者在查看特定队列中的[runs](/langsmith/observability-concepts#runs)时必须填写哪些反馈配置。每个评分标准项目可以包括自定义描述、特定分值的指导以及反馈是必需的还是可选的。
1. **反馈**：注释者在特定[runs](/langsmith/observability-concepts#runs)上提交的个人分数和值。这是使用您定义的模式收集的实际评估数据。了解更多关于[feedback in LangSmith](/langsmith/observability-concepts#feedback)的信息。

## 反馈配置

### 创建反馈配置

反馈配置定义反馈键的架构 - 无论是连续分数、分类选择还是自由格式文本。唯一的密钥标识组织内的每个配置，并指定注释者如何提交该指标的反馈。<Note>
使用已存在的相同配置调用 [⟦T18⟧](https://reference.langchain.com/python/langsmith/client/Client/create_feedback_config) 将返回现有配置。如果同一密钥已存​​在不同的配置，系统将引发 400 错误。
</Note>

<CodeGroup>
```python Python
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
```typescript TypeScript
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
</CodeGroup>

- **连续** (`"accuracy"`)：定义从 0 到 1 的数字范围。`is_lower_score_better` 参数指示较低的值是否代表更好的性能。使用连续配置进行评级范围或基于百分比的指标。
- **分类** (`"correctness"`)：提供具有关联值的预定义选项。每个类别都需要一个`value`（用于评分和分析）和一个`label`（向注释者显示）。使用分类配置进行二元选择或多类分类。
- **自由格式** (`"notes"`)：允许没有预定义结构的开放式文本输入。使用自由格式配置进行定性观察或解释。

### 列出反馈配置

使用 [⟦T25⟧](https://reference.langchain.com/python/langsmith/client/Client/list_feedback_configs) 检索反馈配置以查看您的组织中可用的评估标准。您可以列出所有配置或按特定键进行过滤。每个返回的配置对象包括密钥、类型、配置详细信息（如`min`/`max`或`categories`）以及元数据（如`is_lower_score_better`）：

<CodeGroup>
```python Python
# List all configs
for config in client.list_feedback_configs():
    print(f"{config.feedback_key}: {config.feedback_config}")

# Filter by specific keys
for config in client.list_feedback_configs(
    feedback_key=["accuracy", "correctness"]
):
    print(config.feedback_key)
```
```typescript TypeScript
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
</CodeGroup>

### 更新反馈配置通过更新特定字段，使用 [⟦T30⟧](https://reference.langchain.com/python/langsmith/client/Client/update_feedback_config) 修改现有反馈配置。该方法仅更改您提供的字段，其余字段保持不变。这是保留其他配置设置的部分更新：

<CodeGroup>
```python Python
client.update_feedback_config(
    "accuracy",
    is_lower_score_better=True,
)
```
```typescript TypeScript
await client.updateFeedbackConfig("accuracy", {
  isLowerScoreBetter: true,
});
```
</CodeGroup>

### 删除反馈配置

使用 [⟦T31⟧](https://reference.langchain.com/python/langsmith/client/Client/delete_feedback_config) 从您的组织中删除反馈配置。这将执行软删除，将配置标记为已删除，但不会将其从系统中永久删除。如果需要，您可以稍后使用相同的密钥重新创建配置：

<CodeGroup>
```python Python
client.delete_feedback_config("accuracy")
```
```typescript TypeScript
await client.deleteFeedbackConfig("accuracy");
```
</CodeGroup>

## 注释队列标题项

Rubric 项目将反馈配置分配给特定的注释队列。它们控制注释者在审阅该队列中的[runs](/langsmith/observability-concepts#runs)时看到哪些反馈表单，以及每个表单是必需的还是可选的。

### 创建一个包含标题项目的队列

使用 [⟦T32⟧](https://reference.langchain.com/python/langsmith/client/Client/create_annotation_queue) 创建注释队列，并通过 rubric 项目为其分配反馈配置。每个标题项都通过其键引用反馈配置，并自定义它在此特定队列中的注释者面前的显示方式。

该示例创建一个包含三个标题项的队列。队列级别`rubric_instructions`提供了注释界面顶部显示的一般指导：<CodeGroup>
```python Python
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
```typescript TypeScript
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
```
</CodeGroup>

- `feedback_key`：现有反馈配置的密钥（首先创建它）。
- `description`：针对此指标的注释者的队列特定指南。
- `score_descriptions` / `value_descriptions`：可选标签，解释特定值的含义（使用`score_descriptions`表示连续配置，`value_descriptions`表示分类）。
- `is_required`：注释者是否必须在提交之前完成此反馈。

### 更新现有队列上的标题项

使用 [⟦T41⟧](https://reference.langchain.com/python/langsmith/client/Client/update_annotation_queue) 修改分配给注释队列的标题项。此操作会替换整个标题项目列表，因此您必须包括要保留的所有项目 - 该操作会删除您不包括的所有项目。

您将需要队列 ID，该 ID 是在创建队列或通过列出队列时获得的：

<Note>
更新标题项目将替换完整列表。包括您想要保留的所有物品。
</Note>

<CodeGroup>
```python Python
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
```typescript TypeScript
await client.updateAnnotationQueue(queue.id, {
  rubricItems: [
    { feedback_key: "accuracy", is_required: true },
    { feedback_key: "correctness", is_required: true },
    { feedback_key: "tone", description: "Is the tone appropriate?", is_required: false },
  ],
});
```
</CodeGroup>

## 反馈配置类型（详细）

### 连续

连续配置定义具有最小值和最大值的数字评级范围。注释者可以选择该范围内的任何值，这使得这非常适合在数字尺度上对准确性、质量或相关性等维度进行评分：

<CodeGroup>
```python Python
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
```typescript TypeScript
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
</CodeGroup>第一个示例显示没有标签的 0-1 等级。第二个示例演示了在量表上添加带有标记锚点的`categories`（如“差”、“平均”、“优秀”），以帮助注释者理解不同值代表什么。这些标签是可选的，但可以提高注释者解释比例的一致性。

### 分类

分类配置提供了一组离散的预定义选项供注释者选择。每个类别必须有一个`value`（用于评分和分析的数字标识符）和`label`（向注释者显示的文本）。您必须定义至少 2 个类别。

使用分类配置进行二元决策（通过/失败、正确/不正确）、多类分类（情绪、主题类别）或使用一组固定的离散选项进行任何评估。不要为分类配置设置 `min` 或 `max`：

<CodeGroup>
```python Python
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
```typescript TypeScript
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
```
</CodeGroup>

第一个示例显示了二进制通过/失败配置。第二个示例演示了具有三个选项的情感多类配置。即使对于分类反馈，数值也允许您计算汇总分数。

### 自由形式自由格式配置允许注释者提供开放式文本反馈，而无需任何预定义的结构或约束。此类型没有 `min`、`max` 或 `categories` 字段 - 注释者可以输入他们想要的任何文本。

自由形式反馈对于捕捉细致入微的见解很有价值，但与结构化反馈类型相比更难聚合和分析：

<CodeGroup>
```python Python
client.create_feedback_config(
    "notes",
    feedback_config={"type": "freeform"},
)
```
```typescript TypeScript
await client.createFeedbackConfig({
  feedbackKey: "notes",
  feedbackConfig: { type: "freeform" },
});
```
</CodeGroup>

## 验证规则

|类型 |最小/最大 |类别 |限制条件|
|------|---------|------------|------------|
| `continuous` |可选|可选（标记刻度点）| `min < max`； [`min`, `max`] 内的类别值 |
| `categorical` |不得设置 |必需，最少 2 |独特的价值观和标签|
| `freeform` |不得设置 |不得设置 |不适用 |

## 参考

### 反馈配置类型

|类型 |领域 |描述 |
|------|--------|-------------|
| `continuous` | `min`、`max` |范围内的数值分数 |
| `categorical` |类别（`{value, label}`列表）|从预定义选项中进行选择 |
| `freeform` |无 |自由文本输入 |

### 评分项字段|领域|类型 |描述 |
|--------|------|-------------|
| `feedback_key` | `string` |必需的。必须与现有反馈配置键匹配。 |
| `description` | `string` |显示此项目的注释者指南。 |
| `score_descriptions` | `Record<string, string>` |特定分数值的标签（连续）。 |
| `value_descriptions` | `Record<string, string>` |特定类别值的标签（分类）。 |
| `is_required` | `boolean` |注释者是否必须在提交前完成此项。默认为 false。 |

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/annotation-queues-sdk.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>