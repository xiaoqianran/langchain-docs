<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to read experiment results locally | https://docs.langchain.com/langsmith/read-local-experiment-results -->

# 如何在本地读取实验结果

运行 [evaluations](/langsmith/evaluation-concepts) 时，您可能希望在脚本中以编程方式处理结果，而不是在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-read-local-experiment-results) 中查看它们。这对于以下场景很有用：

- **CI/CD 管道**：实施质量门，如果评估分数低于阈值，则构建失败。
- **本地调试**：无需 API 调用即可检查和分析结果。
- **自定义聚合**：使用您自己的逻辑计算指标和统计数据。
- **集成测试**：使用评估结果来控制合并或部署。

本指南向您展示如何迭代和处理 [⟦T5⟧](https://reference.langchain.com/python/langsmith/client/Client/evaluate) 返回的 [⟦T4⟧](https://reference.langchain.com/python/langsmith/schemas/ExperimentResults) 对象的 [experiment](/langsmith/evaluation-concepts#experiment) 结果。

<Note>
本页面重点介绍以编程方式处理结果，同时仍将结果上传到LangSmith。

如果您想在本地运行评估**而不**将任何内容记录到LangSmith（用于快速测试或验证），请参阅使用`upload_results=False`的[Run an evaluation locally](/langsmith/local)。
</Note>

## 迭代评估结果

[⟦T7⟧](https://reference.langchain.com/python/langsmith/client/Client/evaluate) 函数返回一个可以迭代的 [⟦T8⟧](https://reference.langchain.com/python/langsmith/schemas/ExperimentResults) 对象。 `blocking` 参数控制结果何时可用：- `blocking=False`：立即返回一个迭代器，该迭代器在生成结果时产生结果。这使您可以在评估运行时实时处理结果。
- `blocking=True`（默认）：阻塞直到所有评估完成后再返回。当您迭代结果时，所有数据都已可用。

两种模式返回相同的 `ExperimentResults` 类型；区别在于函数是否在返回之前等待完成。使用 `blocking=False` 进行流式处理和实时调试，或者在需要完整数据集时使用 `blocking=True` 进行批处理。

以下示例演示了`blocking=False`。它会在结果流入时对其进行迭代，将它们收集在列表中，然后在单独的循环中处理它们：

```python
from langsmith import Client
import random

client = Client()

def target(inputs):
    """Your application or LLM chain"""
    return {"output": "MY OUTPUT"}

def evaluator(run, example):
    """Your evaluator function"""
    return {"key": "randomness", "score": random.randint(0, 1)}

# Run evaluation with blocking=False to get an iterator
streamed_results = client.evaluate(
    target,
    data="MY_DATASET_NAME",
    evaluators=[evaluator],
    blocking=False
)

# Collect results as they stream in
aggregated_results = []
for result in streamed_results:
    aggregated_results.append(result)

# Separate loop to avoid logging at the same time as logs from evaluate()
for result in aggregated_results:
    print("Input:", result["run"].inputs)
    print("Output:", result["run"].outputs)
    print("Evaluation Results:", result["evaluation_results"]["results"])
    print("--------------------------------")
```

这会产生如下输出：

```
Input: {'input': 'MY INPUT'}
Output: {'output': 'MY OUTPUT'}
Evaluation Results: [EvaluationResult(key='randomness', score=1, value=None, comment=None, correction=None, evaluator_info={}, feedback_config=None, source_run_id=UUID('7ebb4900-91c0-40b0-bb10-f2f6a451fd3c'), target_run_id=None, extra=None)]
--------------------------------
```

## 理解结果结构

迭代器中的每个结果包含：

- `result["run"]`：目标函数的执行。
  - `result["run"].inputs`：来自 [dataset](/langsmith/evaluation-concepts#datasets) 示例的输入。
  - `result["run"].outputs`：目标函数产生的输出。
  - `result["run"].id`：本次运行的唯一 ID。- `result["evaluation_results"]["results"]`：`EvaluationResult` 对象的列表，每个评估者一个。
  - `key`：指标名称（来自评估器的返回值）。
  - `score`：数字分数（通常为 0-1 或布尔值）。
  - `comment`：可选的解释性文本。
  - `source_run_id`：评估器运行的 ID。

- `result["example"]`：评估的数据集示例。
  - `result["example"].inputs`：输入值。
  - `result["example"].outputs`：参考输出（如果有）。

## 示例

### 实施质量门

此示例使用评估结果根据质量阈值自动通过或失败 CI/CD 构建。该脚本迭代结果，计算平均准确度分数，如果准确度低于 85%，则以非零状态代码退出。这确保您可以部署符合质量标准的代码更改。

```python
from langsmith import Client
import sys

client = Client()

def my_application(inputs):
    # Your application logic
    return {"response": "..."}

def accuracy_evaluator(run, example):
    # Your evaluation logic
    is_correct = run.outputs["response"] == example.outputs["expected"]
    return {"key": "accuracy", "score": 1 if is_correct else 0}

# Run evaluation
results = client.evaluate(
    my_application,
    data="my_test_dataset",
    evaluators=[accuracy_evaluator],
    blocking=False
)

# Calculate aggregate metrics
total_score = 0
count = 0

for result in results:
    eval_result = result["evaluation_results"]["results"][0]
    total_score += eval_result.score
    count += 1

average_accuracy = total_score / count

print(f"Average accuracy: {average_accuracy:.2%}")

# Fail the build if accuracy is too low
if average_accuracy < 0.85:
    print("❌ Evaluation failed! Accuracy below 85% threshold.")
    sys.exit(1)

print("✅ Evaluation passed!")
```

### 批处理，blocking=True

当您需要执行需要完整数据集的操作（例如计算百分位数、按分数排序或生成摘要报告）时，请使用 `blocking=True` 等待所有评估完成后再进行处理：

```python
# Run evaluation and wait for all results
results = client.evaluate(
    target,
    data=dataset,
    evaluators=[evaluator],
    blocking=True  # Wait for all evaluations to complete
)

# Process all results after evaluation completes
for result in results:
    print("Input:", result["run"].inputs)
    print("Output:", result["run"].outputs)

    # Access individual evaluation results
    for eval_result in result["evaluation_results"]["results"]:
        print(f"  {eval_result.key}: {eval_result.score}")
```

使用`blocking=True`，您的处理代码仅在所有评估完成后运行，从而避免与评估日志混合输出。有关在不上传结果的情况下运行评估的更多信息，请参阅[Run an evaluation locally](/langsmith/local)。

## 相关

- [Evaluate your LLM application](/langsmith/evaluate-llm-application)
- [Run an evaluation locally](/langsmith/local)
- [Fetch performance metrics from an experiment](/langsmith/fetch-perf-metrics-experiment)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/read-local-experiment-results.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>