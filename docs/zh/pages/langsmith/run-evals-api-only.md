<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to use the REST API | https://docs.langchain.com/langsmith/run-evals-api-only -->

# 如何使用 REST API

推荐使用 [Python](https://reference.langchain.com/python/langsmith/) 和 [TypeScript](https://reference.langchain.com/javascript/modules/langsmith.html) SDK 在 LangSmith 中运行 [evaluations](/langsmith/evaluation-concepts)。它们包括增强性能和可靠性的优化和功能。

如果您无法使用 SDK（例如，如果您使用不同的语言或受限环境），则可以直接使用 REST API。本指南演示了如何使用 [REST API](/langsmith/smith-api-ref) 和 Python 的 [⟦T6⟧](https://requests.readthedocs.io/) 库运行评估，但相同的原则适用于任何语言。

在深入了解此内容之前，阅读以下内容可能会有所帮助：
- [Evaluate LLM applications](/langsmith/evaluate-llm-application)。
- [LangSmith API Reference](/langsmith/smith-api-ref)：本指南中使用的所有端点的完整 API 文档。

## 创建数据集

对于这个例子，我们使用Python SDK快速创建一个[dataset](/langsmith/evaluation-concepts#datasets)。要通过 API 或 UI 创建数据集，请参阅[Managing datasets](/langsmith/manage-datasets-in-application)。

```python
import os
import requests

from datetime import datetime
from langsmith import Client
from openai import OpenAI
from uuid import uuid4

client = Client()
oa_client = OpenAI()

#  Create a dataset
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

dataset_name = "Toxic Queries - API Example"
dataset = client.create_dataset(dataset_name=dataset_name)
client.create_examples(dataset_id=dataset.id, examples=examples)
```

## 运行单个实验

要通过 API 运行实验，您需要：

1. 从数据集中获取示例。
1. 创建实验（在 API 中也称为“会话”）。
1. 对于每个示例，创建引用示例和实验的运行。
1. 通过设置`end_time` 关闭实验。

首先，使用 `/examples` 端点提取您想要在实验中使用的所有示例：```python
#  Pick a dataset id. In this case, we are using the dataset we created above.
#  API Reference: https://docs.langchain.com/langsmith/smith-api/examples/read-examples
dataset_id = dataset.id
params = { "dataset": dataset_id }

resp = requests.get(
    "https://api.smith.langchain.com/api/v1/examples",
    params=params,
    headers={"x-api-key": os.environ["LANGSMITH_API_KEY"]}
)

examples = resp.json()
```
从 langsmith 导入 uuid7

接下来，定义一个函数，该函数将在单个示例上运行模型并将结果记录到LangSmith。直接使用 API 时，您负责：

- 通过 POST 创建运行对象到 `/runs`，并设置 `reference_example_id` 和 `session_id`。
- 跟踪运行之间的父子关系（例如，包含子“llm”运行的父“链”运行）。
- 通过 PATCH 将输出更新为`/runs/{run_id}`。

```python
os.environ["OPENAI_API_KEY"] = "sk-..."

def run_completion_on_example(example, model_name, experiment_id):
    """Run completions on a list of examples."""
    # We are using the OpenAI API here, but you can use any model you like

    def _post_run(run_id, name, run_type, inputs, parent_id=None):
        """Function to post a new run to the API.
        API Reference: https://docs.langchain.com/langsmith/smith-api/runs/create-a-run
        """
        data = {
            "id": run_id.hex,
            "name": name,
            "run_type": run_type,
            "inputs": inputs,
            "start_time": datetime.utcnow().isoformat(),
            "reference_example_id": example["id"],
            "session_id": experiment_id,
        }
        if parent_id:
            data["parent_run_id"] = parent_id.hex
        resp = requests.post(
            "https://api.smith.langchain.com/api/v1/runs", # Update appropriately for self-hosted installations or regional SaaS
            json=data,
            headers=headers
        )
        resp.raise_for_status()

    def _patch_run(run_id, outputs):
        """Function to patch a run with outputs.
        API Reference: https://docs.langchain.com/langsmith/smith-api/run/update-run
        """
        resp = requests.patch(
            f"https://api.smith.langchain.com/api/v1/runs/{run_id}",
            json={
                "outputs": outputs,
                "end_time": datetime.utcnow().isoformat(),
            },
            headers=headers,
        )
        resp.raise_for_status()

    # Send your API Key in the request headers
    headers = {"x-api-key": os.environ["LANGSMITH_API_KEY"]}

    text = example["inputs"]["text"]

    messages = [
        {
            "role": "system",
            "content": "Please review the user query below and determine if it contains any form of toxic behavior, such as insults, threats, or highly negative comments. Respond with 'Toxic' if it does, and 'Not toxic' if it doesn't.",
        },
        {"role": "user", "content": text},
    ]


    # Create parent run
    parent_run_id = uuid7()
    _post_run(parent_run_id, "LLM Pipeline", "chain", {"text": text})

    # Create child run
    child_run_id = uuid7()
    _post_run(child_run_id, "OpenAI Call", "llm", {"messages": messages}, parent_run_id)

    # Generate completion
    chat_completion = oa_client.chat.completions.create(model=model_name, messages=messages)
    output_text = chat_completion.choices[0].message.content

    # End run
    _patch_run(child_run_id, {
    "messages": messages,
        "output": output_text,
        "model": model_name
    })

    _patch_run(parent_run_id, {"label": output_text})
```

现在创建实验并对所有示例运行补全。在 API 中，“实验”表示为通过 `reference_dataset_id` 引用数据集的会话（或“跟踪器会话”）。与常规跟踪的主要区别在于，实验中的运行必须有一个 `reference_example_id` 将每次运行链接到数据集中的特定示例。

```python
#  Create a new experiment using the /sessions endpoint
#  An experiment is a collection of runs with a reference to the dataset used
#  API Reference: https://docs.langchain.com/langsmith/smith-api/tracer-sessions/create-tracer-session

model_names = ("gpt-3.5-turbo", "gpt-5.4-mini")
experiment_ids = []
for model_name in model_names:
    resp = requests.post(
        "https://api.smith.langchain.com/api/v1/sessions",
        json={
            "start_time": datetime.utcnow().isoformat(),
            "reference_dataset_id": str(dataset_id),
            "description": "An optional description for the experiment",
            "name": f"Toxicity detection - API Example - {model_name} - {str(uuid4())[0:8]}",  # A name for the experiment
            "extra": {
                "metadata": {"foo": "bar"},  # Optional metadata
            },
        },
        headers={"x-api-key": os.environ["LANGSMITH_API_KEY"]}
    )

    experiment = resp.json()
    experiment_ids.append(experiment["id"])

    # Run completions on all examples
    for example in examples:
        run_completion_on_example(example, model_name, experiment["id"])

    # Issue a patch request to "end" the experiment by updating the end_time
    requests.patch(
        f"https://api.smith.langchain.com/api/v1/sessions/{experiment['id']}",
        json={"end_time": datetime.utcnow().isoformat()},
        headers={"x-api-key": os.environ["LANGSMITH_API_KEY"]}
    )
```

### 添加评价反馈

运行 [experiments](/langsmith/evaluation-concepts#experiment) 后，您通常希望通过添加反馈分数来评估结果。这使您可以跟踪正确性、准确性或任何自定义评估标准等指标。在此示例中，评估检查每个模型的输出是否与数据集中的预期标签匹配。该代码发布了一个“正确性”分数（1.0 表示正确，0.0 表示错误），以跟踪每个模型对有毒文本和无毒文本进行分类的准确程度。

以下代码向 [single experiment example](#run-a-single-experiment) 的运行添加反馈：

```python
# Fetch the runs from one of the experiments
# API Reference: https://docs.langchain.com/langsmith/smith-api/run/query-runs
experiment_id = experiment_ids[0]  # Evaluate the first experiment

runs_resp = requests.post(
    "https://api.smith.langchain.com/api/v1/runs/query",
    headers={"x-api-key": os.environ["LANGSMITH_API_KEY"]},
    json={
        "session": [experiment_id],
        "is_root": True,  # Only fetch root runs
        "select": ["id", "reference_example_id", "outputs", "session_id"],
    }
)

runs = runs_resp.json()["runs"]

# Evaluate each run by comparing outputs to expected values
for run in runs:
    # Get the expected output from the original example
    example_id = run["reference_example_id"]
    expected_output = next(
        ex["outputs"]["label"]
        for ex in examples
        if ex["id"] == example_id
    )

    # Compare the model output to the expected output
    actual_output = run["outputs"].get("label", "")
    is_correct = expected_output.lower() == actual_output.lower()

    # Post feedback score
    # API Reference: https://docs.langchain.com/langsmith/smith-api/feedback/create-feedback
    feedback = {
        "run_id": str(run["id"]),
        "key": "correctness",  # The name of your evaluation metric
        "score": 1.0 if is_correct else 0.0,
        "session_id": run["session_id"],  # Required: the run's tracing project UUID
        "comment": f"Expected: {expected_output}, Got: {actual_output}",  # Optional
    }

    resp = requests.post(
        "https://api.smith.langchain.com/api/v1/feedback",
        json=feedback,
        headers={"x-api-key": os.environ["LANGSMITH_API_KEY"]}
    )
    resp.raise_for_status()
```

您可以使用不同的键添加多个反馈分数来跟踪各种指标。例如，您可以添加“正确性”分数和“检测到的毒性”分数。

## 进行配对实验

接下来，我们将演示如何进行配对实验。在成对实验中，您可以相互比较两个示例。

欲了解更多信息，请查看[How to run a pairwise evaluation](/langsmith/evaluate-pairwise)。

```python
#  A comparative experiment allows you to provide a preferential ranking on the outputs of two or more experiments
#  API Reference: https://docs.langchain.com/langsmith/smith-api/datasets/create-comparative-experiment
resp = requests.post(
    "https://api.smith.langchain.com/api/v1/datasets/comparative",
    json={
        "experiment_ids": experiment_ids,
        "name": "Toxicity detection - API Example - Comparative - " + str(uuid4())[0:8],
        "description": "An optional description for the comparative experiment",
        "extra": {
            "metadata": {"foo": "bar"},  # Optional metadata
        },
        "reference_dataset_id": str(dataset_id),
    },
    headers={"x-api-key": os.environ["LANGSMITH_API_KEY"]}
)

comparative_experiment = resp.json()
comparative_experiment_id = comparative_experiment["id"]

#  You can iterate over the runs in the experiments belonging to the comparative experiment and preferentially rank the outputs

#  Fetch the comparative experiment
resp = requests.get(
    f"https://api.smith.langchain.com/api/v1/datasets/{str(dataset_id)}/comparative",
    params={"id": comparative_experiment_id},
    headers={"x-api-key": os.environ["LANGSMITH_API_KEY"]}
)

comparative_experiment = resp.json()[0]
experiment_ids = [info["id"] for info in comparative_experiment["experiments_info"]]

from collections import defaultdict
example_id_to_runs_map = defaultdict(list)

#  API Reference: https://docs.langchain.com/langsmith/smith-api/run/query-runs
runs = requests.post(
    f"https://api.smith.langchain.com/api/v1/runs/query",
    headers={"x-api-key": os.environ["LANGSMITH_API_KEY"]},
    json={
        "session": experiment_ids,
        "is_root": True, # Only fetch root runs (spans) which contain the end outputs
        "select": ["id", "reference_example_id", "outputs", "session_id"],
    }
).json()
runs = runs["runs"]
for run in runs:
    example_id = run["reference_example_id"]
    example_id_to_runs_map[example_id].append(run)

for example_id, runs in example_id_to_runs_map.items():
    print(f"Example ID: {example_id}")
    # Preferentially rank the outputs, in this case we will always prefer the first output
    # In reality, you can use an LLM to rank the outputs
    feedback_group_id = uuid4()

    # Post a feedback score for each run, with the first run being the preferred one
    # API Reference: https://docs.langchain.com/langsmith/smith-api/feedback/create-feedback
    # We'll use the feedback group ID to associate the feedback scores with the same group
    for i, run in enumerate(runs):
        print(f"Run ID: {run['id']}")
        feedback = {
            "score": 1 if i == 0 else 0,
            "run_id": str(run["id"]),
            "key": "ranked_preference",
            "session_id": run["session_id"],  # Required: the run's tracing project UUID
            "feedback_group_id": str(feedback_group_id),
            "comparative_experiment_id": comparative_experiment_id,
        }
        resp = requests.post(
            "https://api.smith.langchain.com/api/v1/feedback",
            json=feedback,
            headers={"x-api-key": os.environ["LANGSMITH_API_KEY"]}
        )
        resp.raise_for_status()
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/run-evals-api-only.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>