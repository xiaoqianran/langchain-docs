<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to upload experiments run outside of LangSmith with the REST API | https://docs.langchain.com/langsmith/upload-existing-experiments -->

# 如何使用 REST API 上传在 LangSmith 外部运行的实验

一些用户更喜欢在 LangSmith 之外管理数据集并运行实验，但希望使用 LangSmith UI 来查看结果。这是通过我们的端点支持的。

本指南将向您展示如何使用 REST API 上传评估，以 Python 中的 `requests` 库为例。然而，同样的原则适用于任何语言。

## 请求主体架构

上传实验需要指定实验和数据集的相关高级信息，以及示例和实验中运行的各个数据。 `results` 中的每个对象代表实验中的一个“行” - 单个数据集示例以及关联的运行。请注意，`dataset_id`和`dataset_name`指的是外部系统中的数据集标识符，并将用于将外部实验分组到单个数据集中。它们不应引用 LangSmith 中的现有数据集（除非该数据集是通过此端点创建的）。

您可以使用以下架构将实验上传到`/datasets/upload-experiment`端点：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "experiment_name": "string (required)",
  "experiment_description": "string (optional)",
  "experiment_start_time": "datetime (required)",
  "experiment_end_time": "datetime (required)",
  "dataset_id": "uuid (optional - an external dataset id, used to group experiments together)",
  "dataset_name": "string (optional - must provide either dataset_id or dataset_name)",
  "dataset_description": "string (optional)",
  "experiment_metadata": { // Object (any shape - optional)
    "key": "value"
  },
  "summary_experiment_scores": [ // List of summary feedback objects (optional)
    {
      "key": "string (required)",
      "score": "number (optional)",
      "value": "string (optional)",
      "comment": "string (optional)",
      "feedback_source": { // Object (optional)
        "type": "string (required)"
      },
      "feedback_config": { // Object (optional)
        "type": "string enum: continuous, categorical, or freeform",
        "min": "number (optional)",
        "max": "number (optional)",
        "categories": [ // List of feedback category objects (optional)
          {
            "value": "number (required)",
            "label": "string (optional)"
          }
        ]
      },
      "created_at": "datetime (optional - defaults to now)",
      "modified_at": "datetime (optional - defaults to now)",
      "correction": "Object or string (optional)"
    }
  ],
  "results": [ // List of experiment row objects (required)
    {
      "row_id": "uuid (required)",
      "inputs": { // Object (required - any shape). This will
        "key": "val" // be the input to both the run and the dataset example.
      },
      "expected_outputs": { // Object (optional - any shape).
        "key": "val" // These will be the outputs of the dataset examples.
      },
      "actual_outputs": { // Object (optional - any shape).
        "key": "val" // These will be the outputs of the runs.
      },
      "evaluation_scores": [ // List of feedback objects for the run (optional)
        {
          "key": "string (required)",
          "score": "number (optional)",
          "value": "string (optional)",
          "comment": "string (optional)",
          "feedback_source": { // Object (optional)
            "type": "string (required)"
          },
          "feedback_config": { // Object (optional)
            "type": "string enum: continuous, categorical, or freeform",
            "min": "number (optional)",
            "max": "number (optional)",
            "categories": [ // List of feedback category objects (optional)
              {
                "value": "number (required)",
                "label": "string (optional)"
              }
            ]
          },
          "created_at": "datetime (optional - defaults to now)",
          "modified_at": "datetime (optional - defaults to now)",
          "correction": "Object or string (optional)"
        }
      ],
      "start_time": "datetime (required)", // The start/end times for the runs will be used to
      "end_time": "datetime (required)", // calculate latency. They must all fall between the
      "run_name": "string (optional)", // start and end times for the experiment.
      "error": "string (optional)",
      "run_metadata": { // Object (any shape - optional)
        "key": "value"
      }
    }
  ]
}
```响应 JSON 将是一个带有键 `experiment` 和 `dataset` 的字典，每个键都是一个对象，其中包含有关所创建的实验和数据集的相关信息。

## 注意事项

您可以通过在多次调用之间提供相同的 dataset\_id 或 dataset\_name 来将多个实验上传到同一数据集。您的实验将被分组在一个数据集下，您将能够[use the comparison view to compare results between experiments](/langsmith/compare-experiment-results)。

确保各行的开始时间和结束时间均位于实验的开始时间和结束时间之间。

您必须提供数据集\_id 或数据集\_name。如果您仅提供 ID 并且数据集尚不存在，我们将为您生成一个名称，如果您仅提供名称，则反之亦然。

您不得将实验上传到不是通过此端点创建的数据集。仅外部管理的数据集支持上传实验。

## 请求示例

下面是一个简单调用 `/datasets/upload-experiment` 的示例。这是一个基本示例，仅使用最重要的字段作为说明。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os
import requests

body = {
    "experiment_name": "My external experiment",
    "experiment_description": "An experiment uploaded to LangSmith",
    "dataset_name": "my-external-dataset",
    "summary_experiment_scores": [
        {
            "key": "summary_accuracy",
            "score": 0.9,
            "comment": "Great job!"
        }
    ],
    "results": [
        {
            "row_id": "<<uuid>>",
            "inputs": {
                "input": "Hello, what is the weather in San Francisco today?"
            },
            "expected_outputs": {
                "output": "Sorry, I am unable to provide information about the current weather."
            },
            "actual_outputs": {
                "output": "The weather is partly cloudy with a high of 65."
            },
            "evaluation_scores": [
                {
                    "key": "hallucination",
                    "score": 1,
                    "comment": "The chatbot made up the weather instead of identifying that "
                               "they don't have enough info to answer the question. This is "
                               "a hallucination."
                }
            ],
            "start_time": "2024-08-03T00:12:39",
            "end_time": "2024-08-03T00:12:41",
            "run_name": "Chatbot"
        },
        {
            "row_id": "<<uuid>>",
            "inputs": {
                "input": "Hello, what is the square root of 49?"
            },
            "expected_outputs": {
                "output": "The square root of 49 is 7."
            },
            "actual_outputs": {
                "output": "7."
            },
            "evaluation_scores": [
                {
                    "key": "hallucination",
                    "score": 0,
                    "comment": "The chatbot correctly identified the answer. This is not a "
                               "hallucination."
                }
            ],
            "start_time": "2024-08-03T00:12:40",
            "end_time": "2024-08-03T00:12:42",
            "run_name": "Chatbot"
        }
    ],
    "experiment_start_time": "2024-08-03T00:12:38",
    "experiment_end_time": "2024-08-03T00:12:43"
}

resp = requests.post(
    "https://api.smith.langchain.com/api/v1/datasets/upload-experiment", # Update appropriately for self-hosted installations or regional SaaS
    json=body,
    headers={"x-api-key": os.environ["LANGSMITH_API_KEY"]}
)

print(resp.json())
```

以下是收到的回复：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "dataset": {
    "name": "my-external-dataset",
    "description": null,
    "created_at": "2024-08-03T00:36:23.289730+00:00",
    "data_type": "kv",
    "inputs_schema_definition": null,
    "outputs_schema_definition": null,
    "externally_managed": true,
    "id": "<<uuid>>",
    "tenant_id": "<<uuid>>",
    "example_count": 0,
    "session_count": 0,
    "modified_at": "2024-08-03T00:36:23.289730+00:00",
    "last_session_start_time": null
  },
  "experiment": {
    "start_time": "2024-08-03T00:12:38",
    "end_time": "2024-08-03T00:12:43+00:00",
    "extra": null,
    "name": "My external experiment",
    "description": "An experiment uploaded to LangSmith",
    "default_dataset_id": null,
    "reference_dataset_id": "<<uuid>>",
    "trace_tier": "longlived",
    "id": "<<uuid>>",
    "run_count": null,
    "latency_p50": null,
    "latency_p99": null,
    "first_token_p50": null,
    "first_token_p99": null,
    "total_tokens": null,
    "prompt_tokens": null,
    "completion_tokens": null,
    "total_cost": null,
    "prompt_cost": null,
    "completion_cost": null,
    "tenant_id": "<<uuid>>",
    "last_run_start_time": null,
    "last_run_start_time_live": null,
    "feedback_stats": null,
    "session_feedback_stats": null,
    "run_facets": null,
    "error_rate": null,
    "streaming_rate": null,
    "test_run_number": 1
  }
}
```请注意，实验结果中的延迟和反馈统计信息为空，因为运行还没有机会持久化，这可能需要几秒钟。如果您保存实验 ID 并在几秒钟内再次查询，您将看到所有统计信息（尽管令牌/成本仍为空，因为我们不会在请求正文中要求此信息）。

## 在 UI 中查看实验

现在，登录 UI 并单击新创建的数据集！您应该看到一个实验：<img alt="Uploaded experiments table" />

您的示例将已上传：<img alt="Uploaded examples" />

单击您的实验将带您进入比较视图：<img alt="Uploaded experiment comparison view" />

当您将更多实验上传到数据集时，您将能够比较结果并在比较视图中轻松识别回归。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/upload-existing-experiments.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>