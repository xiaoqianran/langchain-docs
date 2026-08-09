<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to retry failed runs in experiments (Python only) | https://docs.langchain.com/langsmith/evaluate-with-retry -->

# 如何重试实验中失败的运行（仅限 Python）

在大型 [datasets](/langsmith/evaluation-concepts#datasets) 上运行 [evaluations](/langsmith/evaluation-concepts#evaluation-lifecycle) 时，由于速率限制、网络问题或其他暂时性错误，您可能会在一小部分示例上遇到失败。您可以仅在 [experiment](/langsmith/evaluation-concepts#experiment) 上识别并重试失败的示例，而不是重新运行整个评估。

本指南展示了一种将重试逻辑构建到评估工作流程中并仅重试失败示例的方法。您可以使用 `error_handling='ignore'` 参数跳过记录错误的运行，然后自动识别不成功的示例并在 Python 中重新运行它们。

## 步骤 1. 运行初始评估

运行初始评估，忽略错误以防止记录错误的运行：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client

client = Client()

# Run initial evaluation, ignoring errors
# error_handling='ignore' prevents errored runs from being logged
results = await client.aevaluate(
    target,
    data="dataset",
    evaluators=[your_evaluators],
    error_handling='ignore'
)
```

## 步骤 2. 重试失败的示例并记录到相同的实验

获取所有不成功的例子：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Identify unsuccessful examples
runs = client.list_runs(project_name=results.experiment_name)
successful_example_ids = [r.reference_example_id for r in runs]
unsuccessful_examples = (e for e in client.list_examples(dataset_name="dataset") if e.id not in successful_examples)
```

接下来，重新运行所有失败的示例并将它们记录到同一实验中：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Retry only the failed examples, log
results_retry = await client.aevaluate(
    target,
    unsuccessful_examples,
    evaluators=[your_evaluators],
    experiment=results.experiment_name,
    error_handling='ignore'
)
```

## 相关主题

* [Run an evaluation](/langsmith/evaluate-llm-application)
* [Run an evaluation asynchronously](/langsmith/evaluation-async)
* [Handle model rate limits](/langsmith/handle-model-rate-limiting)
* [Experiment configuration](/langsmith/experiment-configuration)
* [Evaluate existing experiment](/langsmith/evaluate-existing-experiment)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluate-with-retry.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>