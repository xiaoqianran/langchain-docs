<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to define a summary evaluator | https://docs.langchain.com/langsmith/summary -->

# 如何定义摘要评估器

某些指标只能在整个实验级别定义，而不是在实验的各个运行中定义。例如，您可能想要计算数据集中所有示例的评估目标的总体通过率或 f1 分数。这些被称为总结评估者。

## 基本示例

在这里，我们将计算 f1 分数，它是精度和召回率的组合。

这种度量只能在我们实验中的所有示例上进行计算，因此我们的评估器接受输出列表和参考输出列表。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  def f1_score_summary_evaluator(outputs: list[dict], reference_outputs: list[dict]) -> dict:
      true_positives = 0
      false_positives = 0
      false_negatives = 0

      for output_dict, reference_output_dict in zip(outputs, reference_outputs):
          output = output_dict["class"]
          reference_output = reference_output_dict["class"]

          if output == "Toxic" and reference_output == "Toxic":
              true_positives += 1
          elif output == "Toxic" and reference_output == "Not toxic":
              false_positives += 1
          elif output == "Not toxic" and reference_output == "Toxic":
              false_negatives += 1

      if true_positives == 0:
          return {"key": "f1_score", "score": 0.0}

      precision = true_positives / (true_positives + false_positives)
      recall = true_positives / (true_positives + false_negatives)
      f1_score = 2 * (precision * recall) / (precision + recall)

      return {"key": "f1_score", "score": f1_score}
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  function f1ScoreSummaryEvaluator({ outputs, referenceOutputs }: {
      outputs: Record<string, any>[],
      referenceOutputs: Record<string, any>[]
  }) {
      let truePositives = 0;
      let falsePositives = 0;
      let falseNegatives = 0;

      for (let i = 0; i < outputs.length; i++) {
          const output = outputs[i]["class"];
          const referenceOutput = referenceOutputs[i]["class"];

          if (output === "Toxic" && referenceOutput === "Toxic") {
              truePositives += 1;
          } else if (output === "Toxic" && referenceOutput === "Not toxic") {
              falsePositives += 1;
          } else if (output === "Not toxic" && referenceOutput === "Toxic") {
              falseNegatives += 1;
          }
      }

      if (truePositives === 0) {
          return { key: "f1_score", score: 0.0 };
      }

      const precision = truePositives / (truePositives + falsePositives);
      const recall = truePositives / (truePositives + falseNegatives);
      const f1Score = 2 * (precision * recall) / (precision + recall);

      return { key: "f1_score", score: f1Score };
  }
  ```
</CodeGroup>

然后，您可以将此评估器传递给 `evaluate` 方法，如下所示：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client

  ls_client = Client()
  dataset = ls_client.clone_public_dataset(
      "https://smith.langchain.com/public/3d6831e6-1680-4c88-94df-618c8e01fc55/d"
  )

  def bad_classifier(inputs: dict) -> dict:
      return {"class": "Not toxic"}

  def correct(outputs: dict, reference_outputs: dict) -> bool:
      """Row-level correctness evaluator."""
      return outputs["class"] == reference_outputs["label"]

  results = ls_client.evaluate(
      bad_classified,
      data=dataset,
      evaluators=[correct],
      summary_evaluators=[pass_50],
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";
  import { evaluate } from "langsmith/evaluation";
  import type { EvaluationResult } from "langsmith/evaluation";

  const client = new Client();
  const datasetName = "Toxic queries";
  const dataset = await client.clonePublicDataset(
      "https://smith.langchain.com/public/3d6831e6-1680-4c88-94df-618c8e01fc55/d",
      { datasetName: datasetName }
  );

  function correct({ outputs, referenceOutputs }: {
      outputs: Record<string, any>,
      referenceOutputs?: Record<string, any>
  }): EvaluationResult {
      const score = outputs["class"] === referenceOutputs?.["label"];
      return { key: "correct", score };
  }

  function badClassifier(inputs: Record<string, any>): { class: string } {
      return { class: "Not toxic" };
  }

  await evaluate(badClassifier, {
      data: datasetName,
      evaluators: [correct],
      summaryEvaluators: [summaryEval],
      experimentPrefix: "Toxic Queries",
  });
  ```
</CodeGroup>

在 LangSmith UI 中，您将使用相应的键显示摘要评估器的分数。

<img alt="summary_eval.png" />

## 评估器参数摘要

摘要求值器函数必须具有特定的参数名称。它们可以采用以下参数的任意子集：* `inputs: list[dict]`：与数据集中单个示例相对应的输入列表。
* `outputs: list[dict]`：给定输入的每个实验产生的字典输出列表。
* `reference_outputs/referenceOutputs: list[dict]`：与示例相关的参考输出列表（如果有）。
* `runs: list[Run]`：给定示例的两个实验生成的完整[Run](/langsmith/run-data-format)对象的列表。如果您需要访问有关每次运行的中间步骤或元数据，请使用此选项。
* `examples: list[Example]`：所有数据集[Example](/langsmith/example-data-format)对象，包括示例输入、输出（如果可用）和元数据（如果可用）。

## 评估器输出摘要

摘要评估器预计返回以下类型之一：

Python 和 JS/TS

* `dict`：`{"score": ..., "name": ...}` 形式的字典允许您传递数字或布尔分数和指标名称。

目前仅支持Python

* `int | float | bool`：这被解释为连续指标，可以进行平均、排序等操作。函数名称用作指标的名称。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/summary.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>