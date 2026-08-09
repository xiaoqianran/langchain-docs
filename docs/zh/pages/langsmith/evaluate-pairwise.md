<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to run a pairwise evaluation | https://docs.langchain.com/langsmith/evaluate-pairwise -->

# 如何运行成对评估

<Info>
  概念：[Pairwise evaluations](/langsmith/evaluation-concepts#pairwise)
</Info>

LangSmith 支持以比较方式评估**现有**实验。您可以对多个实验的输出进行相互比较，而不是一次评估一个输出。在本指南中，您将使用 [⟦T2⟧](https://docs.smith.langchain.com/reference/python/evaluation/langsmith.evaluation._runner.evaluate) 以及 [define an evaluator](#define-a-pairwise-evaluator) 和 [run a pairwise evaluation](#run-a-pairwise-evaluation) 的两个现有实验。最后，您将使用 LangSmith UI 来[view the pairwise experiments](#view-pairwise-experiments)。

## 先决条件

* 如果您尚未创建要比较的实验，请查看 [quick start](/langsmith/evaluation-quickstart) 或 [how-to guide](/langsmith/evaluate-llm-application) 开始评估。
* 本指南需要`langsmith`Python版本`>=0.2.0`或JS版本`>=0.2.9`。

<Info>
  您还可以将 [⟦T6⟧](https://docs.smith.langchain.com/reference/python/evaluation/langsmith.evaluation._runner.evaluate_comparative) 与两个以上的现有实验一起使用。
</Info>

## `evaluate()` 比较参数

最简单的是，`evaluate` / `aevaluate` 函数采用以下参数：|论证|描述 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `target` |您想要相互评估的两个**现有实验**的列表。这些可以是 uuid 或实验名称。  |
| `evaluators` |您想要附加到此评估的成对评估器的列表。请参阅下面的部分了解如何定义它们。 |

除此之外，您还可以传入以下可选参数：|论证|描述 |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- || `randomize_order` / `randomizeOrder` |一个可选布尔值，指示每次评估的输出顺序是否应随机化。这是一种最大限度地减少提示中的位置偏差的策略：通常，法学硕士会根据顺序偏向其中一个答案。这主要应该通过及时工程来解决，但这是另一种可选的缓解措施。默认为 False。 |
| `experiment_prefix` / `experimentPrefix` |要附加到成对实验名称开头的前缀。默认为无。                                                                                                                                                                                                                                                                                    |
| `description` |配对实验的描述。默认为无。                                                                                                                                                                                                                                                                                                                    || `max_concurrency` / `maxConcurrency` |要运行的并发评估的最大数量。默认为 5。
| `client` |要使用的 LangSmith 客户端。默认为无。                                                                                                                                                                                                                                                                                                                                 || `metadata` |附加到配对实验的元数据。默认为无。                                                                                                                                                                                                                                                                                                              |
| `load_nested` / `loadNested` |是否加载实验的所有子运行。当为 False 时，只有根跟踪将传递给您的评估器。默认为 False。                                                                                                                                                                                                                                        |

## 定义一个成对评估器

成对求值器只是具有预期签名的函数。

### 评估器参数

自定义求值器函数必须具有特定的参数名称。它们可以采用以下参数的任意子集：* `inputs: dict`：与数据集中单个示例相对应的输入字典。
* `outputs: list[dict]`：给定输入的每个实验产生的字典输出的两项列表。
* `reference_outputs` / `referenceOutputs: dict`：与示例关联的参考输出的字典（如果有）。
* `runs: list[Run]`：由给定示例的两个实验生成的完整[Run](/langsmith/run-data-format)对象的两项列表。如果您需要访问有关每次运行的中间步骤或元数据，请使用此选项。
* `example: Example`：完整数据集[Example](/langsmith/example-data-format)，包括示例输入、输出（如果可用）和元数据（如果可用）。

对于大多数用例，您只需要 `inputs`、`outputs` 和 `reference_outputs` / `referenceOutputs`。仅当您需要应用程序实际输入和输出之外的一些额外跟踪或示例元数据时，`runs` 和 `example` 才有用。

### 评估器输出

自定义评估器预计会返回以下类型之一：

Python 和 JS/TS

* `dict`：带有键的字典：

  * `key`，代表将要记录的反馈键
  * `scores`，这是从运行 ID 到该运行得分的映射。
  * `comment`，这是一个字符串。最常用于模型推理。

目前仅支持Python* `list[int | float | bool]`：包含两项的分数列表。假设该列表与 `runs` / `outputs` 评估器参数具有相同的顺序。评估器函数名称用于反馈键。

请注意，您应该选择与跑步中的标准反馈不同的反馈键。我们建议在成对反馈键前添加 `pairwise_` 或 `ranked_`。

## 进行成对评估

以下示例使用[a prompt](https://smith.langchain.com/hub/langchain-ai/pairwise-evaluation-2)，要求法学硕士决定两个人工智能助理响应之间哪个更好。它使用结构化输出来解析 AI 的响应：0、1 或 2。

<Info>
  在下面的 Python 示例中，我们从 [LangChain Hub](/langsmith/manage-prompts#public-prompt-hub) 中提取 [this structured prompt](https://smith.langchain.com/hub/langchain-ai/pairwise-evaluation-2) 并将其与 LangChain 聊天模型包装器一起使用。

  **LangChain 的使用完全是可选的。** 为了说明这一点，TypeScript 示例直接使用 OpenAI SDK。
</Info>

* Python：需要`langsmith>=0.2.0`
* TypeScript：需要`langsmith>=0.2.9`

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain_classic import hub
  from langchain.chat_models import init_chat_model
  from langsmith import evaluate

  # See the prompt: https://smith.langchain.com/hub/langchain-ai/pairwise-evaluation-2
  prompt = hub.pull("langchain-ai/pairwise-evaluation-2")
  model = init_chat_model("gpt-5.5")
  chain = prompt | model

  def ranked_preference(inputs: dict, outputs: list[dict]) -> list:
      # Assumes example inputs have a 'question' key and experiment
      # outputs have an 'answer' key.
      response = chain.invoke({
          "question": inputs["question"],
          "answer_a": outputs[0].get("answer", "N/A"),
          "answer_b": outputs[1].get("answer", "N/A"),
      })
      if response["Preference"] == 1:
          scores = [1, 0]
      elif response["Preference"] == 2:
          scores = [0, 1]
      else:
          scores = [0, 0]
      return scores

  evaluate(
      ("experiment-1", "experiment-2"),  # Replace with the names/IDs of your experiments
      evaluators=[ranked_preference],
      randomize_order=True,
      max_concurrency=4,
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { evaluate} from "langsmith/evaluation";
  import { Run } from "langsmith/schemas";
  import { wrapOpenAI } from "langsmith/wrappers";
  import OpenAI from "openai";
  import { z } from "zod";

  const openai = wrapOpenAI(new OpenAI());

  async function rankedPreference({
    inputs,
    runs,
  }: {
    inputs: Record<string, any>;
    runs: Run[];
  }) {
    const scores: Record<string, number> = {};
    const [runA, runB] = runs;
    if (!runA || !runB) throw new Error("Expected at least two runs");

    const payload = {
      question: inputs.question,
      answer_a: runA?.outputs?.output ?? "N/A",
      answer_b: runB?.outputs?.output ?? "N/A",
    };

    const output = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: [
            "Please act as an impartial judge and evaluate the quality of the responses provided by two AI assistants to the user question displayed below.",
            "You should choose the assistant that follows the user's instructions and answers the user's question better.",
            "Your evaluation should consider factors such as the helpfulness, relevance, accuracy, depth, creativity, and level of detail of their responses.",
            "Begin your evaluation by comparing the two responses and provide a short explanation.",
            "Avoid any position biases and ensure that the order in which the responses were presented does not influence your decision.",
            "Do not allow the length of the responses to influence your evaluation. Do not favor certain names of the assistants. Be as objective as possible.",
          ].join(" "),
        },
        {
          role: "user",
          content: [
            `[User Question] ${payload.question}`,
            `[The Start of Assistant A's Answer] ${payload.answer_a} [The End of Assistant A's Answer]`,
            `The Start of Assistant B's Answer] ${payload.answer_b} [The End of Assistant B's Answer]`,
          ].join("\n\n"),
        },
      ],
      tool_choice: {
        type: "function",
        function: { name: "Score" },
      },
      tools: [
        {
          type: "function",
          function: {
            name: "Score",
            description: [
              `After providing your explanation, output your final verdict by strictly following this format:`,
              `Output "1" if Assistant A answer is better based upon the factors above.`,
              `Output "2" if Assistant B answer is better based upon the factors above.`,
              `Output "0" if it is a tie.`,
            ].join(" "),
            parameters: {
              type: "object",
              properties: {
                Preference: {
                  type: "integer",
                  description: "Which assistant answer is preferred?",
                },
              },
            },
          },
        },
      ],
    });

    const { Preference } = z
      .object({ Preference: z.number() })
      .parse(
        JSON.parse(output.choices[0].message.tool_calls[0].function.arguments)
      );

    if (Preference === 1) {
      scores[runA.id] = 1;
      scores[runB.id] = 0;
    } else if (Preference === 2) {
      scores[runA.id] = 0;
      scores[runB.id] = 1;
    } else {
      scores[runA.id] = 0;
      scores[runB.id] = 0;
    }

    return { key: "ranked_preference", scores };
  }

  await evaluate(["earnest-name-40", "reflecting-pump-91"], {
    evaluators: [rankedPreference],
  });
  ```
</CodeGroup>

## 查看成对实验

从数据集页面导航到“配对实验”选项卡：

<img alt="Pairwise Experiments Tab" />

单击您想要检查的成对实验，您将进入比较视图：

<img alt="Pairwise Comparison View" />您可以通过单击表标题中的“向上”/“向下”按钮来筛选第一个实验更好的运行，反之亦然：

<img alt="Pairwise Filtering" />

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluate-pairwise.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>