<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to return categorical vs numerical metrics | https://docs.langchain.com/langsmith/metric-type -->

# 如何返回分类指标与数字指标

LangSmith 支持分类指标和数字指标，您可以在编写自定义评估器时返回其中之一。

对于要记录为数字指标的评估器结果，它必须返回为：

*（仅限 Python）`int`、`float` 或 `bool`
* `{"key": "metric_name", "score": int | float | bool}` 形式的字典

对于要记录为分类指标的评估器结果，必须将其返回为：

*（仅限 Python）a `str`
* `{"key": "metric_name", "value": str | int | float | bool}` 形式的字典

以下是一些示例：

- Python：需要`langsmith>=0.2.0`
- TypeScript：`langsmith@0.1.32`及更高版本支持多种分数

<CodeGroup>

```python Python
def numerical_metric(inputs: dict, outputs: dict, reference_outputs: dict) -> float:
    # Evaluation logic...
    return 0.8
    # Equivalently
    # return {"score": 0.8}
    # Or
    # return {"key": "numerical_metric", "score": 0.8}

def categorical_metric(inputs: dict, outputs: dict, reference_outputs: dict) -> str:
    # Evaluation logic...
    return "english"
    # Equivalently
    # return {"key": "categorical_metric", "score": "english"}
    # Or
    # return {"score": "english"}
```

```typescript TypeScript
import type { Run, Example } from "langsmith/schemas";

function numericalMetric(run: Run, example: Example) {
  // Your evaluation logic here
  return { key: "numerical_metric", score: 0.8};
}

function categoricalMetric(run: Run, example: Example) {
  // Your evaluation logic here
  return { key: "categorical_metric", value: "english"};
}
```

</CodeGroup>

## 相关

* [Return multiple metrics in one evaluator](/langsmith/multiple-scores)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/metric-type.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>