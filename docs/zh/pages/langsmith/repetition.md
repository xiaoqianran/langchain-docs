<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to evaluate with repetitions | https://docs.langchain.com/langsmith/repetition -->

# 如何通过重复进行评估

由于 LLM 输出不确定，运行多次重复可以更准确地估计系统性能。一次重复的输出可能与下一次重复的输出不同。重复是减少易发生高变化的系统（例如代理）中噪音的一种方法。

## 配置实验的重复次数

将可选的 `num_repetitions` 参数添加到 `evaluate` / `aevaluate` 函数（[Python](https://docs.smith.langchain.com/reference/python/evaluation/langsmith.evaluation._runner.evaluate)、[TypeScript](https://docs.smith.langchain.com/reference/js/interfaces/evaluation.EvaluateOptions#numrepetitions)），以指定对数据集中的每个示例进行评估的次数。例如，如果数据集中有 5 个示例并设置 `num_repetitions=5`，则每个示例将运行 5 次，总共运行 25 次。

<CodeGroup>

```python Python
from langsmith import evaluate

results = evaluate(
    lambda inputs: label_text(inputs["text"]),
    data=dataset_name,
    evaluators=[correct_label],
    experiment_prefix="Toxic Queries",
    num_repetitions=3,
)
```

```typescript TypeScript
import { evaluate } from "langsmith/evaluation";

await evaluate((inputs) => labelText(inputs["input"]), {
  data: datasetName,
  evaluators: [correctLabel],
  experimentPrefix: "Toxic Queries",
  numRepetitions: 3,
});
```

</CodeGroup>

## 查看重复运行的实验结果

如果您使用 [repetitions](/langsmith/repetition) 运行实验，输出结果列中将会有箭头，以便您可以在表中查看输出。要查看重复中的每个运行，请将鼠标悬停在输出单元格上并单击展开视图。当您进行重复实验时，LangSmith 在表中显示每个反馈分数的平均值。单击反馈分数可查看各个运行的反馈分数，或查看重复之间的标准偏差。

![Repetitions](/langsmith/images/repetitions.png)

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/repetition.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>