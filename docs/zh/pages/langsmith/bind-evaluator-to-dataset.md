<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Automatically run evaluators on experiments | https://docs.langchain.com/langsmith/bind-evaluator-to-dataset -->

# 自动运行实验评估器

LangSmith 支持两种对通过 SDK 创建的实验进行评分的方法：

* **以编程方式**，通过在代码中指定评估器（有关详细信息，请参阅[How to evaluate an LLM application](/langsmith/evaluate-llm-application)）
* 通过 **将评估器绑定到 UI 中的数据集**。除了您通过 SDK 设置的任何评估器之外，这还将自动对创建的任何新实验运行评估器。当您迭代应用程序（目标函数）并且拥有一组要为所有实验运行的标准评估器时，这非常有用。

## 在数据集上配置评估器

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-bind-evaluator-to-dataset)中，选择一个数据集。
2. 单击**评估者**选项卡。
3. 单击**+ 评估器** 打开**添加评估器** 面板。
4. 选择以下选项之一：
   * **从头开始创建**：构建新的 [LLM-as-a-Judge](/langsmith/llm-as-judge)、[Code](/langsmith/online-evaluations-code) 或 [Composite](/langsmith/composite-evaluators-ui) 评估器，或选择 **从标记数据** 创建 LLM 作为法官评估器 [aligned to human feedback](/langsmith/improve-judge-evaluator-feedback)。
   * **附加现有评估器**：选择工作区中已有的评估器以重用它。
   * **从模板创建**：从现成的评估器开始。<Note>
  为数据集配置评估器时，它只会影响配置评估器后创建的实验运行。它不会影响在配置评估器之前创建的实验运行的评估。
</Note>

## 法学硕士法官评估员

将评估器绑定到数据集的过程与在 Playground 中配置 LLM 作为法官评估器的过程非常相似。查看[configuring an LLM-as-a-judge evaluator in the Playground.](/langsmith/llm-as-judge?mode=ui)的说明

## 自定义代码评估器

将代码评估器绑定到数据集的过程与在线评估中配置代码评估器的过程非常相似。查看[configuring code evaluators](/langsmith/online-evaluations-code)的说明。

在在线评估中配置代码评估器与将代码评估器绑定到数据集之间的唯一区别在于，自定义代码评估器可以引用属于数据集`Example`一部分的输出。

对于绑定到数据集的自定义代码评估器，评估器函数接受两个参数：* A `Run` ([reference](/langsmith/run-data-format))。这代表您实验中的新运行。例如，如果您通过 SDK 运行实验，这将包含您正在测试的链或模型的输入/输出。
* `Example` ([reference](/langsmith/example-data-format))。这代表您正在测试的链或模型使用的数据集中的参考示例。运行和示例的 `inputs` 应该相同。如果您的示例有参考 `outputs`，那么您可以使用它来与运行的输出进行比较以进行评分。

下面的代码显示了一个简单的评估器函数的示例，该函数检查输出是否完全等于参考输出。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import numpy as np

  def perform_eval(run, example):
      # run is a Run object
      # example is an Example object
      output = run['outputs']['output']
      ref_output = example['outputs']['outputs']
      output_match = np.array_equal(output, ref_output)

      return { "exact_match": output_match }
  ```

  ```javascript JavaScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  function perform_eval(run, example) {
      // run is a Run object
      // example is an Example object
      const output = run.outputs.output;
      const refOutput = example.outputs.outputs;

      // Deep equality check for arrays/objects
      const outputMatch = JSON.stringify(output) === JSON.stringify(refOutput);

      return { "exact_match": outputMatch };
  }
  ```
</CodeGroup>

## 后续步骤

* 在[experiments tab](/langsmith/analyze-an-experiment)中分析您的实验结果
* 比较[comparison view](/langsmith/compare-experiment-results)中的实验结果

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/bind-evaluator-to-dataset.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>