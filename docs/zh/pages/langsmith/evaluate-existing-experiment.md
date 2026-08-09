<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to add evaluators to an existing experiment (Python only) | https://docs.langchain.com/langsmith/evaluate-existing-experiment -->

# 如何将评估器添加到现有实验（仅限 Python）

目前仅 Python SDK 支持对现有实验的评估。

运行实验后，您可能希望**添加新的评估指标，而不重新运行应用程序**。当您添加新的评估者或想要对现有结果应用不同的评分标准时，这非常有用。您可以直接评估现有的实验轨迹，而不是在所有示例上重新执行目标函数。

要将评估器添加到现有实验，请将实验名称或 ID 传递给 `evaluate()` / `aevaluate()` 而不是目标函数。评估器将在原始实验的缓存跟踪上运行，访问输入、输出以及记录的任何中间步骤。

## 示例

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import evaluate

def always_half(inputs: dict, outputs: dict) -> float:
    return 0.5

experiment_name = "my-experiment:abc"  # Replace with an actual experiment name or ID

evaluate(experiment_name, evaluators=[always_half])
```

## 相关主题

* [Retry failed examples in experiments](/langsmith/evaluate-with-retry)
* [Run an evaluation](/langsmith/evaluate-llm-application)
* [Run an evaluation asynchronously](/langsmith/evaluation-async)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluate-existing-experiment.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>