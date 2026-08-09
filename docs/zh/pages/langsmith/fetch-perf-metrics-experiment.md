<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to fetch performance metrics for an experiment | https://docs.langchain.com/langsmith/fetch-perf-metrics-experiment -->

# 如何获取实验的性能指标

<Check>
  跟踪项目和实验在我们的后端使用相同的底层数据结构，称为“会话”。

  您可能会在我们的文档中看到这些术语，但它们都指的是相同的底层数据结构。

  我们正在努力统一我们的文档和 API 中的术语。
</Check>

当您使用 `evaluate` 与 Python 或 TypeScript SDK 运行实验时，您可以使用 `read_project`/`readProject` 方法获取实验的性能指标。

实验详细信息的有效负载包括以下值：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "start_time": "2024-06-06T01:02:51.299960",
  "end_time": "2024-06-06T01:03:04.557530+00:00",
  "extra": {
    "metadata": {
      "git": {
        "tags": null,
        "dirty": true,
        "branch": "ankush/agent-eval",
        "commit": "...",
        "repo_name": "...",
        "remote_url": "...",
        "author_name": "Ankush Gola",
        "commit_time": "...",
        "author_email": "..."
      },
      "revision_id": null,
      "dataset_splits": ["base"],
      "dataset_version": "2024-06-05T04:57:01.535578+00:00",
      "num_repetitions": 3
    }
  },
  "name": "SQL Database Agent-ae9ad229",
  "description": null,
  "default_dataset_id": null,
  "reference_dataset_id": "...",
  "id": "...",
  "run_count": 9,
  "latency_p50": 7.896,
  "latency_p99": 13.09332,
  "first_token_p50": null,
  "first_token_p99": null,
  "total_tokens": 35573,
  "prompt_tokens": 32711,
  "completion_tokens": 2862,
  "total_cost": 0.206485,
  "prompt_cost": 0.163555,
  "completion_cost": 0.04293,
  "tenant_id": "...",
  "last_run_start_time": "2024-06-06T01:02:51.366397",
  "last_run_start_time_live": null,
  "feedback_stats": {
    "cot contextual accuracy": {
      "n": 9,
      "avg": 0.6666666666666666,
      "values": {
        "CORRECT": 6,
        "INCORRECT": 3
      }
    }
  },
  "session_feedback_stats": {},
  "run_facets": [],
  "error_rate": 0,
  "streaming_rate": 0,
  "test_run_number": 11
}
```

从这里，您可以提取性能指标，例如：* `latency_p50`：第 50 个百分位数的延迟（以秒为单位）。
* `latency_p99`：第 99 个百分位数的延迟（以秒为单位）。
* `total_tokens`：使用的代币总数。
* `prompt_tokens`：使用的提示令牌数量。
* `completion_tokens`：使用的完成令牌数量。
* `total_cost`：实验的总成本。
* `prompt_cost`：提示代币的成本。
* `completion_cost`：完成代币的成本。
* `feedback_stats`：实验的反馈统计。
* `error_rate`：实验的错误率。
* `first_token_p50`：生成第一个令牌的时间的第 50 个百分位数延迟（如果使用流式传输）。
* `first_token_p99`：生成第一个令牌的时间的第 99 个百分位数延迟（如果使用流式传输）。

以下示例说明了如何使用 Python 和 TypeScript SDK 获取实验的性能指标。

首先，作为先决条件，我们将创建一个简单的数据集。在这里，我们仅在 Python 中演示这一点，但您可以在 TypeScript 中执行相同的操作。更多详情请查看评测[how-to guide](/langsmith/evaluate-llm-application)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client

client = Client()

# Create a dataset
dataset_name = "HelloDataset"
dataset = client.create_dataset(dataset_name=dataset_name)

examples = [
    {
        "inputs": {"input": "Harrison"},
        "outputs": {"expected": "Hello Harrison"},
    },
    {
        "inputs": {"input": "Ankush"},
        "outputs": {"expected": "Hello Ankush"},
    },
]

client.create_examples(dataset_id=dataset.id, examples=examples)
```

接下来，我们将创建一个实验，从`evaluate`的结果中检索实验名称，然后获取实验的性能指标。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith.schemas import Example, Run
  dataset_name = "HelloDataset"

  def foo_label(root_run: Run, example: Example) -> dict:
      return {"score": 1, "key": "foo"}

  from langsmith import evaluate

  results = evaluate(
      lambda inputs: "Hello " + inputs["input"],
      data=dataset_name,
      evaluators=[foo_label],
      experiment_prefix="Hello",
  )

  resp = client.read_project(project_name=results.experiment_name, include_stats=True)
  print(resp.model_dump_json(indent=2))
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";
  import { evaluate } from "langsmith/evaluation";
  import type { EvaluationResult } from "langsmith/evaluation";
  import type { Run, Example } from "langsmith/schemas";

  // Row-level evaluator
  function fooLabel(rootRun: Run, example: Example): EvaluationResult {
      return {score: 1, key: "foo"};
  }

  const client = new Client();

  const results = await evaluate(
      (inputs) => {
          return { output: "Hello " + inputs.input };
      },
      {
          data: "HelloDataset",
          experimentPrefix: "Hello",
          evaluators: [fooLabel],
      }
  );

  const resp = await client.readProject({
      projectName: results.experimentName,
      includeStats: true
  })
  console.log(JSON.stringify(resp, null, 2))
  ```
</CodeGroup>

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fetch-perf-metrics-experiment.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>