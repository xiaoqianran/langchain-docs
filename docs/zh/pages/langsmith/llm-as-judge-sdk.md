<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to define an LLM-as-a-judge evaluator | https://docs.langchain.com/langsmith/llm-as-judge-sdk -->

# 如何定义LLM法官评估员

评估法学硕士申请可能具有挑战性，因为它们通常会生成没有单一正确答案的对话文本。

本指南向您展示如何使用 [LangSmith SDK](https://reference.langchain.com/python/langsmith/observability/sdk) 为 [offline evaluation](/langsmith/evaluation-concepts#offline-evaluations) 定义 [LLM-as-a-judge evaluator](/langsmith/evaluation-concepts#llm-as-judge)。

<Tip>
  如需快速入门，请使用 [openevals](/langsmith/openevals)，它提供了即用型 LLM 法官评估器。
</Tip>

## 创建您自己的法学硕士法官评估员

为了完全控制评估器逻辑，请创建您自己的 LLM 作为法官评估器并使用 LangSmith SDK ([Python](https://docs.smith.langchain.com/reference/python/reference) / [TypeScript](https://docs.smith.langchain.com/reference/js)) 运行它。

需要`langsmith>=0.2.0`

法学硕士法官评估员由三个关键组成部分组成：

1. **评估器函数**：接收示例输入和应用程序输出，然后使用 LLM 对质量进行评分的函数。该函数应返回带有分数信息的布尔值、数字、字符串或字典。
2. **目标函数**：正在评估的应用程序逻辑（用 [⟦T2⟧](https://reference.langchain.com/python/langsmith/run_helpers/traceable) 包装以提高可观察性）。
3. **数据集和评估**：测试示例的数据集和 `evaluate()` 函数，该函数在每个示例上运行目标函数并应用评估器。

### 示例

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import evaluate, traceable, wrappers, Client
from openai import OpenAI
from pydantic import BaseModel

# Wrap the OpenAI client to automatically trace all LLM calls
oai_client = wrappers.wrap_openai(OpenAI())

# 1. Define your evaluator function
# This function receives the inputs and outputs from each test example
def valid_reasoning(inputs: dict, outputs: dict) -> bool:
    """Use an LLM to judge if the reasoning and the answer are consistent."""
    # Define the evaluation criteria
    instructions = """
Given the following question, answer, and reasoning, determine if the reasoning
for the answer is logically valid and consistent with the question and the answer."""

    # Use structured output to get a boolean score
    class Response(BaseModel):
        reasoning_is_valid: bool

    # Construct the prompt with the actual inputs and outputs
    msg = f"Question: {inputs['question']}\nAnswer: {outputs['answer']}\nReasoning: {outputs['reasoning']}"

    # Call the LLM to judge the output
    response = oai_client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[{"role": "system", "content": instructions}, {"role": "user", "content": msg}],
        response_format=Response
    )

    # Return the boolean score
    return response.choices[0].message.parsed.reasoning_is_valid

# 2. Define your target function (the application being evaluated)
# The @traceable decorator logs traces to LangSmith for debugging
@traceable
def dummy_app(inputs: dict) -> dict:
    return {"answer": "hmm i'm not sure", "reasoning": "i didn't understand the question"}

# 3. Create a dataset with test examples
ls_client = Client()
dataset = ls_client.create_dataset("big questions")
examples = [
    {"inputs": {"question": "how will the universe end"}},
    {"inputs": {"question": "are we alone"}},
]
ls_client.create_examples(dataset_id=dataset.id, examples=examples)

# 4. Run the evaluation
# This runs dummy_app on each example and applies the valid_reasoning evaluator
results = evaluate(
    dummy_app,              # Your application function
    data=dataset,           # Dataset to evaluate on
    evaluators=[valid_reasoning]  # List of evaluator functions
)
```

有关如何编写自定义评估器的更多信息，请参阅[How to define a code evaluator (SDK)](/langsmith/code-evaluator-sdk)。

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-as-judge-sdk.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>