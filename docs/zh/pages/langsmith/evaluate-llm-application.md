<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to evaluate agents | https://docs.langchain.com/langsmith/evaluate-llm-application -->

# 如何评估代理

本指南向您展示如何使用 LangSmith SDK 对代理运行评估。

<Info>
[Evaluations](/langsmith/evaluation-concepts#evaluation-lifecycle) | [Evaluators](/langsmith/evaluation-concepts#evaluators) | [Datasets](/langsmith/evaluation-concepts#datasets)
</Info>

在本指南中，我们将介绍如何使用 LangSmith SDK 中的 [evaluate()](https://docs.smith.langchain.com/reference/python/evaluation/langsmith.evaluation._runner.evaluate) 方法评估应用程序。

<Check>
对于 Python 中的大型评估作业，我们建议使用 [aevaluate()](https://docs.smith.langchain.com/reference/python/evaluation/langsmith.evaluation._arunner.aevaluate)，即 [evaluate()](https://docs.smith.langchain.com/reference/python/evaluation/langsmith.evaluation._runner.evaluate) 的异步版本。在阅读 [running an evaluation asynchronously](/langsmith/evaluation-async) 的操作指南之前，仍然值得先阅读本指南，因为两者具有相同的界面。

在 JS/TS 中，evaluate() 已经是异步的，因此不需要单独的方法。

运行大型作业时配置 `max_concurrency`/`maxConcurrency` arg 也很重要。这通过有效地将数据集跨线程分割来并行化评估。
</Check>

## 定义一个应用程序

首先我们需要一个应用程序来评估。让我们为此示例创建一个简单的毒性分类器。

<CodeGroup>

```python Python
from langsmith import traceable, wrappers
from openai import OpenAI

# Optionally wrap the OpenAI client to trace all model calls.
oai_client = wrappers.wrap_openai(OpenAI())

# Optionally add the 'traceable' decorator to trace the inputs/outputs of this function.
@traceable
def toxicity_classifier(inputs: dict) -> dict:
    instructions = (
      "Please review the user query below and determine if it contains any form of toxic behavior, "
      "such as insults, threats, or highly negative comments. Respond with 'Toxic' if it does "
      "and 'Not toxic' if it doesn't."
    )
    messages = [
        {"role": "system", "content": instructions},
        {"role": "user", "content": inputs["text"]},
    ]
    result = oai_client.chat.completions.create(
        messages=messages, model="gpt-5.4-mini", temperature=0
    )
    return {"class": result.choices[0].message.content}
```

```typescript TypeScript
import { OpenAI } from "openai";
import { wrapOpenAI } from "langsmith/wrappers";
import { traceable } from "langsmith/traceable";

// Optionally wrap the OpenAI client to trace all model calls.
const oaiClient = wrapOpenAI(new OpenAI());

// Optionally add the 'traceable' wrapper to trace the inputs/outputs of this function.
const toxicityClassifier = traceable(
  async (text: string) => {
    const result = await oaiClient.chat.completions.create({
      messages: [
        {
           role: "system",
          content: "Please review the user query below and determine if it contains any form of toxic behavior, such as insults, threats, or highly negative comments. Respond with 'Toxic' if it does, and 'Not toxic' if it doesn't.",
        },
        { role: "user", content: text },
      ],
      model: "gpt-5.4-mini",
      temperature: 0,
    });

    return result.choices[0].message.content;
  },
  { name: "toxicityClassifier" }
);
```

</CodeGroup>

我们可以选择启用跟踪来捕获管道中每个步骤的输入和输出。要了解如何注释代码以进行跟踪，请参阅[Custom instrumentation](/langsmith/annotate-code)。

## 创建或选择数据集我们需要一个[Dataset](/langsmith/evaluation-concepts#datasets)来评估我们的应用程序。我们的数据集将包含有毒和无毒文本的标记[examples](/langsmith/evaluation-concepts#examples)。


需要`langsmith>=0.3.13`

<CodeGroup>

```python Python
from langsmith import Client
ls_client = Client()

examples = [
  {
    "inputs": {"text": "Shut up, idiot"},
    "outputs": {"label": "Toxic"},
  },
  {
    "inputs": {"text": "You're a wonderful person"},
    "outputs": {"label": "Not toxic"},
  },
  {
    "inputs": {"text": "This is the worst thing ever"},
    "outputs": {"label": "Toxic"},
  },
  {
    "inputs": {"text": "I had a great day today"},
    "outputs": {"label": "Not toxic"},
  },
  {
    "inputs": {"text": "Nobody likes you"},
    "outputs": {"label": "Toxic"},
  },
  {
    "inputs": {"text": "This is unacceptable. I want to speak to the manager."},
    "outputs": {"label": "Not toxic"},
  },
]

dataset = ls_client.create_dataset(dataset_name="Toxic Queries")
ls_client.create_examples(
  dataset_id=dataset.id,
  examples=examples,
)
```

```typescript TypeScript
import { Client } from "langsmith";

const langsmith = new Client();

// create a dataset
const labeledTexts = [
  ["Shut up, idiot", "Toxic"],
  ["You're a wonderful person", "Not toxic"],
  ["This is the worst thing ever", "Toxic"],
  ["I had a great day today", "Not toxic"],
  ["Nobody likes you", "Toxic"],
  ["This is unacceptable. I want to speak to the manager.", "Not toxic"],
];

const [inputs, outputs] = labeledTexts.reduce<
  [Array<{ input: string }>, Array<{ outputs: string }>]
>(
  ([inputs, outputs], item) => [
    [...inputs, { input: item[0] }],
    [...outputs, { outputs: item[1] }],
  ],
  [[], []]
);

const datasetName = "Toxic Queries";
const toxicDataset = await langsmith.createDataset(datasetName);
await langsmith.createExamples({ inputs, outputs, datasetId: toxicDataset.id });
```

</CodeGroup>

有关数据集的更多详细信息，请参阅[Manage datasets](/langsmith/manage-datasets)页面。

## 定义一个评估器

定义评估者有两种主要方法。

### 本地代码中

<Check>
您还可以查看LangChain的开源评估包[openevals](https://github.com/langchain-ai/openevals)以获取常见的预构建评估器。
</Check>

[Evaluators](/langsmith/evaluation-concepts#evaluators) 是用于对应用程序输出进行评分的函数。它们采用示例输入、实际输出以及参考输出（如果存在）。由于我们有此任务的标签，因此我们的评估器可以直接检查实际输出是否与参考输出匹配。

- Python：需要`langsmith>=0.3.13`
- TypeScript：需要`langsmith>=0.2.9`

<CodeGroup>

```python Python
def correct(inputs: dict, outputs: dict, reference_outputs: dict) -> bool:
    return outputs["class"] == reference_outputs["label"]
```

```typescript TypeScript
import type { EvaluationResult } from "langsmith/evaluation";

function correct({
  outputs,
  referenceOutputs,
}: {
  outputs: Record<string, any>;
  referenceOutputs?: Record<string, any>;
}): EvaluationResult {
  const score = outputs.output === referenceOutputs?.outputs;
  return { key: "correct", score };
}
```

</CodeGroup>

### 在LangSmith UI 中

您还可以在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-evaluate-llm-application)中定义评估器。您可以在 **Evaluators** 选项卡下[create evaluators in the UI](/langsmith/llm-as-judge)。这些评估者将是[automatically triggered with every new experiment](/langsmith/bind-evaluator-to-dataset)。


## 运行评估

我们将使用 [evaluate()](https://docs.smith.langchain.com/reference/python/evaluation/langsmith.evaluation._runner.evaluate) / [aevaluate()](https://docs.smith.langchain.com/reference/python/evaluation/langsmith.evaluation._arunner.aevaluate) 方法来运行评估。

关键论点是：* 一个目标函数，它接受输入字典并返回输出字典。每个 [Example](/langsmith/example-data-format) 的 `example.inputs` 字段是传递给目标函数的内容。在这种情况下，我们的 `toxicity_classifier` 已经设置为接受示例输入，因此我们可以直接使用它。
* `data` - 要评估的 LangSmith 数据集的名称或 UUID，或示例的迭代器。
* `evaluators` - 对函数输出进行评分的评估者列表； [Langsmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-evaluate-llm-application) 中的数据集评估器也会自动触发。
* `metadata` - 附加到实验的可选对象。通过 `models`、`prompts` 和 `tools` 键来填充实验表视图中的相应列。

Python：需要`langsmith>=0.3.13`

<CodeGroup>

```python Python
# optional metadata, used to populate model/prompt/tool columns in UI
EXPERIMENT_METADATA = {
    "models": [
        "openai:gpt-5.4-mini",
        {
            "id": ["langchain", "chat_models", "openai", "ChatOpenAI"],
            "lc": 1,
            "type": "constructor",
            "kwargs": {"model_name": "gpt-5.5", "temperature": 0.2},
        },
    ],
    "prompts": ["my-org/my-eval-prompt:abc12345"],
    "tools": [
        {
            "name": "web_search",
            "description": "Search the web for information",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"],
            },
        },
    ],
}

# Can equivalently use the 'evaluate' function directly:
# from langsmith import evaluate; evaluate(...)
results = ls_client.evaluate(
    toxicity_classifier,
    data=dataset.name,
    evaluators=[correct],
    experiment_prefix="gpt-5.4-mini, baseline",  # optional, experiment name prefix
    description="Testing the baseline system.",  # optional, experiment description
    max_concurrency=4,  # optional, add concurrency
    metadata=EXPERIMENT_METADATA,  # optional, used to populate model/prompt/tool columns in UI
)
```

```typescript TypeScript
import { evaluate } from "langsmith/evaluation";

// optional metadata, used to populate model/prompt/tool columns in UI
const EXPERIMENT_METADATA = {
  models: [
    "openai:gpt-5.4-mini",
    {
      id: ["langchain", "chat_models", "openai", "ChatOpenAI"],
      lc: 1,
      type: "constructor",
      kwargs: { model_name: "gpt-5.5", temperature: 0.2 },
    },
  ],
  prompts: ["my-org/my-eval-prompt:abc12345"],
  tools: [
    {
      name: "web_search",
      description: "Search the web for information",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  ],
};

await evaluate((inputs) => toxicityClassifier(inputs["input"]), {
  data: datasetName,
  evaluators: [correct],
  experimentPrefix: "gpt-5.4-mini, baseline",  // optional, experiment name prefix
  maxConcurrency: 4, // optional, add concurrency
  metadata: EXPERIMENT_METADATA,  // optional, used to populate model/prompt/tool columns in UI
});
```

</CodeGroup>

## 将元数据添加到实验中

元数据是一组键值对，您可以将其附加到实验，以对实验表中的实验进行分组和筛选。您可以在运行实验时通过 `metadata` 参数传递元数据（请参阅[Run the evaluation](#run-the-evaluation)），或者随后直接在 LangSmith UI 中添加元数据。

要打开 **编辑实验** 面板，请将鼠标悬停在实验表中的实验行上，然后单击该行右侧显示的 **编辑** 铅笔图标。

<img
  className="block dark:hidden"
  src="/langsmith/images/experiments-table-edit-icon-light.png"
  alt="Experiments table with the edit pencil icon visible on a hovered row."
/>
<img
  className="hidden dark:block"
  src="/langsmith/images/experiments-table-edit-icon-dark.png"
  alt="Experiments table with the edit pencil icon visible on a hovered row."
/>**编辑实验**面板可让您更新实验名称和描述，并管理元数据键值对。单击 **+ 添加元数据** 添加新的键值对，然后单击右上角的 **提交** 保存更改。

<img
  className="block dark:hidden"
  src="/langsmith/images/edit-experiment-panel-light.png"
  alt="Edit Experiment panel showing metadata key-value pairs and the Add Metadata button."
/>
<img
  className="hidden dark:block"
  src="/langsmith/images/edit-experiment-panel-dark.png"
  alt="Edit Experiment panel showing metadata key-value pairs and the Add Metadata button."
/>

使用元数据标记实验后，请使用实验表顶部的 **Group by** 控件按任何元数据字段对实验进行聚类。表上方的摘要图表按组更新，显示每个配置的平均反馈分数、延迟和令牌使用情况。这样可以轻松比较不同提示版本、模型或其他更改在同一数据集上的执行情况。

保留的 `models`、`prompts` 和 `tools` 键会自动填充实验表中的专用列。单击其中一列中的值可按其进行过滤或分组。有关完整详细信息，请参阅[Filter and group by models, prompts, and tools](/langsmith/analyze-an-experiment#filter-and-group-by-models-prompts-and-tools-in-the-experiments-tab-view)。

## 探索结果

每次调用`evaluate()`都会创建一个[experiment](/langsmith/evaluation-concepts#experiment)，您可以在LangSmith UI中查看或通过SDK查询。更多详情请参见[Analyze an experiment](/langsmith/analyze-an-experiment)。

实验表中列出了针对数据集运行的实验。

<img
  className="block dark:hidden"
  src="/langsmith/images/experiments-table-light.png"
  alt="Experiments table showing a list of experiments with columns for experiment name, description, dataset, feedback score, and more."
/>

<img
  className="hidden dark:block"
  src="/langsmith/images/experiments-table-dark.png"
  alt="Experiments table showing a list of experiments with columns for experiment name, description, dataset, feedback score, and more."
/>对于从 Playground 或通过 SDK 运行的实验，**进度** 列会实时跟踪完成情况。进度反映了运行和评估状态。将鼠标悬停在进度条上可查看已完成的运行数和评估的运行数。

<Note>
通过 SDK 运行的实验的进度跟踪需要：

- Python：`langsmith>=0.8.16`
- 打字稿：`langsmith>=0.7.8`
</Note>

单击实验行可查看每个示例的分数。按分数进行过滤和排序，以确定应用程序性能良好或较差的模式。

<img
  className="block dark:hidden"
  src="/langsmith/images/experiment-view-light.png"
  alt="Experiment view showing a table of examples with columns for input, output, reference output, feedback score, and more."
/>

<img
  className="hidden dark:block"
  src="/langsmith/images/experiment-view-dark.png"
  alt="Experiment view showing a table of examples with columns for input, output, reference output, feedback score, and more."
/>

单击示例可打开其详细信息面板，其中包括输入、输出、参考输出和任何关联的跟踪（如果您已为跟踪代码添加了注释）。

<img
  className="block dark:hidden"
  src="/langsmith/images/experiment-view-details-panel-light.png"
  alt="Experiment view details panel showing the inputs, outputs, reference outputs, and trace for a single example."
/>

<img
  className="hidden dark:block"
  src="/langsmith/images/experiment-view-details-panel-dark.png"
  alt="Experiment view details panel showing the inputs, outputs, reference outputs, and trace for a single example."
/>


## 参考代码

<Accordion title="Click to see a consolidated code snippet">
    <CodeGroup>

```python Python
from langsmith import Client, traceable, wrappers
from openai import OpenAI

# Step 1. Define an application
oai_client = wrappers.wrap_openai(OpenAI())

@traceable
def toxicity_classifier(inputs: dict) -> str:
    system = (
      "Please review the user query below and determine if it contains any form of toxic behavior, "
      "such as insults, threats, or highly negative comments. Respond with 'Toxic' if it does "
      "and 'Not toxic' if it doesn't."
    )
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": inputs["text"]},
    ]
    result = oai_client.chat.completions.create(
        messages=messages, model="gpt-5.4-mini", temperature=0
    )
    return result.choices[0].message.content

# Step 2. Create a dataset
ls_client = Client()
dataset = ls_client.create_dataset(dataset_name="Toxic Queries")
examples = [
  {
    "inputs": {"text": "Shut up, idiot"},
    "outputs": {"label": "Toxic"},
  },
  {
    "inputs": {"text": "You're a wonderful person"},
    "outputs": {"label": "Not toxic"},
  },
  {
    "inputs": {"text": "This is the worst thing ever"},
    "outputs": {"label": "Toxic"},
  },
  {
    "inputs": {"text": "I had a great day today"},
    "outputs": {"label": "Not toxic"},
  },
  {
    "inputs": {"text": "Nobody likes you"},
    "outputs": {"label": "Toxic"},
  },
  {
    "inputs": {"text": "This is unacceptable. I want to speak to the manager."},
    "outputs": {"label": "Not toxic"},
  },
]
ls_client.create_examples(
  dataset_id=dataset.id,
  examples=examples,
)

# Step 3. Define an evaluator
def correct(inputs: dict, outputs: dict, reference_outputs: dict) -> bool:
    return outputs["output"] == reference_outputs["label"]

# Step 4. Run the evaluation

# optional metadata, used to populate model/prompt/tool columns in UI
EXPERIMENT_METADATA = {
    "models": [
        "openai:gpt-5.4-mini",
        {
            "id": ["langchain", "chat_models", "openai", "ChatOpenAI"],
            "lc": 1,
            "type": "constructor",
            "kwargs": {"model_name": "gpt-5.5", "temperature": 0.2},
        },
    ],
    "prompts": ["my-org/my-eval-prompt:abc12345"],
    "tools": [
        {
            "name": "web_search",
            "description": "Search the web for information",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"],
            },
        },
    ],
}

# Client.evaluate() and evaluate() behave the same.
results = ls_client.evaluate(
    toxicity_classifier,
    data=dataset.name,
    evaluators=[correct],
    experiment_prefix="gpt-5.4-mini, simple",  # optional, experiment name prefix
    description="Testing the baseline system.",  # optional, experiment description
    max_concurrency=4,  # optional, add concurrency
    metadata=EXPERIMENT_METADATA,  # optional, used to populate model/prompt/tool columns in UI
)
```

```typescript TypeScript
import { OpenAI } from "openai";
import { Client } from "langsmith";
import { evaluate, EvaluationResult } from "langsmith/evaluation";
import type { Run, Example } from "langsmith/schemas";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";

const oaiClient = wrapOpenAI(new OpenAI());

const toxicityClassifier = traceable(
  async (text: string) => {
    const result = await oaiClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Please review the user query below and determine if it contains any form of toxic behavior, such as insults, threats, or highly negative comments. Respond with 'Toxic' if it does, and 'Not toxic' if it doesn't.",
        },
        { role: "user", content: text },
      ],
      model: "gpt-5.4-mini",
      temperature: 0,
    });
    return result.choices[0].message.content;
  },
  { name: "toxicityClassifier" }
);

const langsmith = new Client();

// create a dataset
const labeledTexts = [
  ["Shut up, idiot", "Toxic"],
  ["You're a wonderful person", "Not toxic"],
  ["This is the worst thing ever", "Toxic"],
  ["I had a great day today", "Not toxic"],
  ["Nobody likes you", "Toxic"],
  ["This is unacceptable. I want to speak to the manager.", "Not toxic"],
];

const [inputs, outputs] = labeledTexts.reduce<
  [Array<{ input: string }>, Array<{ outputs: string }>]
>(
  ([inputs, outputs], item) => [
    [...inputs, { input: item[0] }],
    [...outputs, { outputs: item[1] }],
  ],
  [[], []]
);

const datasetName = "Toxic Queries";
const toxicDataset = await langsmith.createDataset(datasetName);
await langsmith.createExamples({ inputs, outputs, datasetId: toxicDataset.id });

// Row-level evaluator
function correct({
  outputs,
  referenceOutputs,
}: {
  outputs: Record<string, any>;
  referenceOutputs?: Record<string, any>;
}): EvaluationResult {
  const score = outputs.output === referenceOutputs?.outputs;
  return { key: "correct", score };
}

// optional metadata, used to populate model/prompt/tool columns in UI
const EXPERIMENT_METADATA = {
  models: [
    "openai:gpt-5.4-mini",
    {
      id: ["langchain", "chat_models", "openai", "ChatOpenAI"],
      lc: 1,
      type: "constructor",
      kwargs: { model_name: "gpt-5.5", temperature: 0.2 },
    },
  ],
  prompts: ["my-org/my-eval-prompt:abc12345"],
  tools: [
    {
      name: "web_search",
      description: "Search the web for information",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  ],
};

await evaluate((inputs) => toxicityClassifier(inputs["input"]), {
  data: datasetName,
  evaluators: [correct],
  experimentPrefix: "gpt-5.4-mini, simple",  // optional, experiment name prefix
  maxConcurrency: 4, // optional, add concurrency
  metadata: EXPERIMENT_METADATA,  // optional, used to populate model/prompt/tool columns in UI
});
```

</CodeGroup>
</Accordion>

## 相关

* [Run an evaluation asynchronously](/langsmith/evaluation-async)
* [Run an evaluation via the REST API](/langsmith/run-evals-api-only)
* [Run an evaluation from the Playground](/langsmith/run-evaluation-from-playground)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluate-llm-application.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>