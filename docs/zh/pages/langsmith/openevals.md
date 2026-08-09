<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Run evals with openevals package | https://docs.langchain.com/langsmith/openevals -->

# 使用 openevals 包运行 evals

使用 LangSmith 的开源 openevals 和 agentevals 包运行评估。

LangSmith 与开源 `openevals` 包集成，提供一套评估实用程序和提示，您可以将其用作评估的起点。

<Note>
  本操作指南将演示如何设置和运行一种类型的评估程序（法学硕士作为法官）。有关评估实用程序和提示以及使用示例的完整列表，请参阅 [openevals](https://github.com/langchain-ai/openevals) 和 [agentevals](https://github.com/langchain-ai/agentevals) 存储库。
</Note>

## 设置

您需要安装 `openevals` 软件包才能使用 LLM-as-a-judge 评估器。

<CodeGroup>
  ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U openevals
  ```

  ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add openevals @langchain/core
  ```
</CodeGroup>

您还需要将 OpenAI API 密钥设置为环境变量，不过您也可以选择不同的提供程序：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export OPENAI_API_KEY="your_openai_api_key"
```

我们还将使用 LangSmith 的 Python [pytest](/langsmith/pytest) 集成和 TypeScript 的 [Vitest/Jest](/langsmith/vitest-jest) 来运行我们的评估。 `openevals`还与[⟦T10⟧](https://docs.smith.langchain.com/reference/python/evaluation/langsmith.evaluation._runner.evaluate)方法无缝集成。请参阅 [appropriate guides](/langsmith/pytest) 了解设置说明。

## 运行评估器一般流程很简单：从 `openevals` 导入求值器或工厂函数，然后在带有输入、输出和参考输出的测试文件中运行它。 LangSmith 将自动记录评估者的结果作为反馈。

请注意，并非所有评估器都需要每个参数（例如，精确匹配评估器仅需要输出和参考输出）。此外，如果您的 LLM-as-a-judge 提示需要其他变量，则将它们作为 kwargs 传递会将它们格式化为提示。

像这样设置你的测试文件：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import pytest
  from langsmith import testing as t
  from openevals.llm import create_llm_as_judge
  from openevals.prompts import CORRECTNESS_PROMPT

  correctness_evaluator = create_llm_as_judge(
      prompt=CORRECTNESS_PROMPT,
      feedback_key="correctness",
      model="openai:o3-mini",
  )

  # Mock standin for your application
  def my_llm_app(inputs: dict) -> str:
      return "Doodads have increased in price by 10% in the past year."

  @pytest.mark.langsmith
  def test_correctness():
      inputs = "How much has the price of doodads changed in the past year?"
      reference_outputs = "The price of doodads has decreased by 50% in the past year."
      outputs = my_llm_app(inputs)

      t.log_inputs({"question": inputs})
      t.log_outputs({"answer": outputs})
      t.log_reference_outputs({"answer": reference_outputs})

      correctness_evaluator(
          inputs=inputs,
          outputs=outputs,
          reference_outputs=reference_outputs
      )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as ls from "langsmith/vitest";
  // import * as ls from "langsmith/jest";
  import { createLLMAsJudge, CORRECTNESS_PROMPT } from "openevals";

  const correctnessEvaluator = createLLMAsJudge({
      prompt: CORRECTNESS_PROMPT,
      feedbackKey: "correctness",
      model: "openai:o3-mini",
  });

  // Mock standin for your application
  const myLLMApp = async (_inputs: Record<string, unknown>) => {
      return "Doodads have increased in price by 10% in the past year.";
  };

  ls.describe("Correctness", () => {
      ls.test("incorrect answer", {
          inputs: {
              question: "How much has the price of doodads changed in the past year?"
          },
          referenceOutputs: {
              answer: "The price of doodads has decreased by 50% in the past year."
          }
      }, async ({ inputs, referenceOutputs }) => {
          const outputs = await myLLMApp(inputs);
          ls.logOutputs({ answer: outputs });
          await correctnessEvaluator({
              inputs,
              outputs,
              referenceOutputs,
          });
      });
  });
  ```
</CodeGroup>

`feedback_key`/`feedbackKey` 参数将用作实验中反馈的名称。

在终端中运行 eval 将产生如下结果：

<img alt="Prebuilt evaluator terminal result" />

如果您已经在 LangSmith 中创建了数据集，您还可以将评估器直接传递到 `evaluate` 方法中。如果使用 Python，则需要 `langsmith>=0.3.11`：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client
  from openevals.llm import create_llm_as_judge
  from openevals.prompts import CONCISENESS_PROMPT

  client = Client()
  conciseness_evaluator = create_llm_as_judge(
      prompt=CONCISENESS_PROMPT,
      feedback_key="conciseness",
      model="openai:o3-mini",
  )

  experiment_results = client.evaluate(
      # This is a dummy target function, replace with your actual LLM-based system
      lambda inputs: "What color is the sky?",
      data="Sample dataset",
      evaluators=[
          conciseness_evaluator
      ]
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { evaluate } from "langsmith/evaluation";
  import { createLLMAsJudge, CONCISENESS_PROMPT } from "openevals";

  const concisenessEvaluator = createLLMAsJudge({
      prompt: CONCISENESS_PROMPT,
      feedbackKey: "conciseness",
      model: "openai:o3-mini",
  });

  await evaluate((inputs) => "What color is the sky?", {
      data: datasetName,
      evaluators: [concisenessEvaluator],
  });
  ```
</CodeGroup>

有关可用评估实用程序和提示的完整列表，请参阅 [openevals](https://github.com/langchain-ai/openevals) 和 [agentevals](https://github.com/langchain-ai/agentevals) 存储库。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/openevals.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>