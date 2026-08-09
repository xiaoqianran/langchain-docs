<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to return multiple scores in one evaluator | https://docs.langchain.com/langsmith/multiple-scores -->

# 如何在一个评估器中返回多个分数

有时，自定义评估器或摘要评估器返回多个指标很有用。例如，如果 LLM 法官生成多个指标，您可以通过生成多个指标的单个 LLM 调用（而不是进行多个 LLM 调用）来节省时间和金钱。

要使用 Python SDK 返回多个分数，只需返回以下形式的字典/对象列表：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[
    # 'key' is the metric name
    # 'score' is the value of a numerical metric
    {"key": string, "score": number},
    # 'value' is the value of a categorical metric
    {"key": string, "value": string},
    ... # You may log as many as you wish
]
```

要使用 JS/TS SDK 执行此操作，请返回一个带有“结果”键的对象，然后返回上述形式的列表

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{results: [{ key: string, score: number }, ...]};
```

这些词典中的每一个都可以包含任何或全部 [feedback fields](/langsmith/feedback-data-format)；查看链接文档以获取更多信息。

示例：

* Python：需要`langsmith>=0.2.0`
* TypeScript：`langsmith@0.1.32`及更高版本支持多种分数

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  def multiple_scores(outputs: dict, reference_outputs: dict) -> list[dict]:
      # Replace with real evaluation logic.
      precision = 0.8
      recall = 0.9
      f1 = 0.85
      return [
          {"key": "precision", "score": precision},
          {"key": "recall", "score": recall},
          {"key": "f1", "score": f1},
      ]
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import type { Run, Example } from "langsmith/schemas";

  function multipleScores(rootRun: Run, example: Example) {
    // Your evaluation logic here
    return {
        results: [
            { key: "precision", score: 0.8 },
            { key: "recall", score: 0.9 },
            { key: "f1", score: 0.85 },
        ],
    };
  }
  ```
</CodeGroup>

结果实验中的行将显示每个分数。

<img alt="multiple_scores.png" />

## 相关

* [Return categorical vs numerical metrics](/langsmith/metric-type)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/multiple-scores.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>