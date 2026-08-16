<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to define a code evaluator | https://docs.langchain.com/langsmith/code-evaluator-sdk -->

# 如何定义代码评估器

代码评估器是一种函数，它采用数据集示例和生成的应用程序输出，并返回一个或多个指标。这些函数可以直接传递到[⟦T4⟧](https://reference.langchain.com/python/langsmith/client/Client/evaluate)或[⟦T5⟧](https://reference.langchain.com/python/langsmith/client/Client/aevaluate)函数中。

<Tip>
要在LangSmith UI 中定义代码评估器，请参阅[How to define a code evaluator (UI)](/langsmith/code-evaluator-ui)。要根据数据集示例中保存的断言对输出进行评分，请参阅[Use assertions](/langsmith/assertions)。
</Tip>

## 基本示例

<CodeGroup>

```python Python
from langsmith import evaluate

def correct(outputs: dict, reference_outputs: dict) -> bool:
    """Check if the answer exactly matches the expected answer."""
    return outputs["answer"] == reference_outputs["answer"]

def dummy_app(inputs: dict) -> dict:
    return {"answer": "hmm i'm not sure", "reasoning": "i didn't understand the question"}

results = evaluate(
    dummy_app,
    data="dataset_name",
    evaluators=[correct]
)
```

```typescript TypeScript
import type { EvaluationResult } from "langsmith/evaluation";

const correct = async ({ outputs, referenceOutputs }: {
  outputs: Record<string, any>;
  referenceOutputs?: Record<string, any>;
}): Promise<EvaluationResult> => {
  const score = outputs?.answer === referenceOutputs?.answer;
  return { key: "correct", score };
}
```

</CodeGroup>

## 评估器参数

代码评估器函数必须具有特定的参数名称。它们可以采用以下参数的任意子集：

* `run: Run`：应用程序在给定示例中生成的完整 [Run](/langsmith/run-data-format) 对象。
* `example: Example`：完整数据集[Example](/langsmith/example-data-format)，包括示例输入、输出（如果可用）和元数据（如果可用）。
* `inputs: dict`：与数据集中单个示例相对应的输入字典。
* `outputs: dict`：应用程序在给定`inputs`上生成的输出的字典。
* `reference_outputs/referenceOutputs: dict`：与示例相关的参考输出的字典（如果有）。对于大多数用例，您只需要 `inputs`、`outputs` 和 `reference_outputs`。仅当您需要应用程序实际输入和输出之外的一些额外跟踪或示例元数据时，`run` 和 `example` 才有用。

当使用 JS/TS 时，这些都应该作为单个对象参数的一部分传入。

## 评估器输出

代码评估器预计返回以下类型之一：

Python 和 JS/TS

* `dict`：`{"score" | "value": ..., "key": ...}`形式的字典允许您自定义指标类型（“分数”表示数字，“值”表示分类）和指标名称。例如，如果您想要将整数记录为分类指标，则此功能很有用。

仅限Python

* `int | float | bool`：这被解释为连续指标，可以进行平均、排序等操作。函数名称用作指标的名称。
* `str`：这被解释为分类指标。函数名称用作指标的名称。
* `list[dict]`：使用单个函数返回多个指标。

## 其他示例

需要`langsmith>=0.2.0`

<CodeGroup>

```python Python
from langsmith import evaluate, wrappers
from langsmith.schemas import Run, Example
from openai import AsyncOpenAI
# Assumes you've installed pydantic.
from pydantic import BaseModel

# We can still pass in Run and Example objects if we'd like
def correct_old_signature(run: Run, example: Example) -> dict:
    """Check if the answer exactly matches the expected answer."""
    return {"key": "correct", "score": run.outputs["answer"] == example.outputs["answer"]}

# Just evaluate actual outputs
def concision(outputs: dict) -> int:
    """Score how concise the answer is. 1 is the most concise, 5 is the least concise."""
    return min(len(outputs["answer"]) // 1000, 4) + 1

# Use an LLM-as-a-judge
oai_client = wrappers.wrap_openai(AsyncOpenAI())

async def valid_reasoning(inputs: dict, outputs: dict) -> bool:
    """Use an LLM to judge if the reasoning and the answer are consistent."""
    instructions = """
Given the following question, answer, and reasoning, determine if the reasoning for the
answer is logically valid and consistent with question and the answer."""

    class Response(BaseModel):
        reasoning_is_valid: bool

    msg = f"Question: {inputs['question']}\nAnswer: {outputs['answer']}\nReasoning: {outputs['reasoning']}"
    response = await oai_client.beta.chat.completions.parse(
        model="gpt-5.4-mini",
        messages=[{"role": "system", "content": instructions,}, {"role": "user", "content": msg}],
        response_format=Response
    )
    return response.choices[0].message.parsed.reasoning_is_valid

def dummy_app(inputs: dict) -> dict:
    return {"answer": "hmm i'm not sure", "reasoning": "i didn't understand the question"}

results = evaluate(
    dummy_app,
    data="dataset_name",
    evaluators=[correct_old_signature, concision, valid_reasoning]
)
```

```typescript TypeScript
import { Client } from "langsmith";
import { evaluate } from "langsmith/evaluation";
import { Run, Example } from "langsmith/schemas";
import OpenAI from "openai";

// Type definitions
interface AppInputs {
    question: string;
}

interface AppOutputs {
    answer: string;
    reasoning: string;
}

interface Response {
    reasoning_is_valid: boolean;
}

// Old signature evaluator
function correctOldSignature(run: Run, example: Example) {
    return {
        key: "correct",
        score: run.outputs?.["answer"] === example.outputs?.["answer"],
    };
}

// Output-only evaluator
function concision({ outputs }: { outputs: AppOutputs }) {
    return {
        key: "concision",
        score: Math.min(Math.floor(outputs.answer.length / 1000), 4) + 1,
    };
}

// LLM-as-judge evaluator
const openai = new OpenAI();

async function validReasoning({
    inputs,
    outputs
}: {
    inputs: AppInputs;
    outputs: AppOutputs;
}) {
    const instructions = `\
  Given the following question, answer, and reasoning, determine if the reasoning for the \
  answer is logically valid and consistent with question and the answer.`;

    const msg = `Question: ${inputs.question}
Answer: ${outputs.answer}
Reasoning: ${outputs.reasoning}`;

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            { role: "system", content: instructions },
            { role: "user", content: msg }
        ],
        response_format: { type: "json_object" },
        functions: [{
            name: "parse_response",
            parameters: {
                type: "object",
                properties: {
                    reasoning_is_valid: {
                        type: "boolean",
                        description: "Whether the reasoning is valid"
                    }
                },
                required: ["reasoning_is_valid"]
            }
        }]
    });

    const parsed = JSON.parse(response.choices[0].message.content ?? "{}") as Response;
    return {
        key: "valid_reasoning",
        score: parsed.reasoning_is_valid ? 1 : 0
    };
}

// Example application
function dummyApp(inputs: AppInputs): AppOutputs {
    return {
        answer: "hmm i'm not sure",
        reasoning: "i didn't understand the question"
    };
}

const results = await evaluate(dummyApp, {
    data: "dataset_name",
    evaluators: [correctOldSignature, concision, validReasoning],
    client: new Client()
});
```

</CodeGroup>

## 相关* [Evaluate aggregate experiment results](/langsmith/summary)：定义摘要评估器，计算整个实验的指标。
* [Run an evaluation comparing two experiments](/langsmith/evaluate-pairwise)：定义成对评估器，它通过相互比较两个（或更多）实验来计算指标。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/code-evaluator-sdk.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>