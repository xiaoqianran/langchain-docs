<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to run an evaluation asynchronously | https://docs.langchain.com/langsmith/evaluation-async -->

# 如何异步运行评估

<Info>
[Evaluations](/langsmith/evaluation-concepts#evaluation-lifecycle) | [Evaluators](/langsmith/evaluation-concepts#evaluators) | [Datasets](/langsmith/evaluation-concepts#datasets) | [Experiments](/langsmith/evaluation-concepts#experiment)
</Info>

我们可以使用 [aevaluate()](https://docs.smith.langchain.com/reference/python/evaluation/langsmith.evaluation._arunner.aevaluate) 通过 SDK 异步运行评估，它接受与 [evaluate()](https://docs.smith.langchain.com/reference/python/evaluation/langsmith.evaluation._runner.evaluate) 相同的所有参数，但期望应用程序函数是异步的。要了解更多信息，请参阅[how to use the ⟦T1⟧ function](/langsmith/evaluate-llm-application)。

<Info>
本指南仅在使用 Python SDK 时相关。在 JS/TS 中，`evaluate()` 函数已经是异步的。有关更多信息，请参阅[Evaluate LLM applications](/langsmith/evaluate-llm-application)。
</Info>

## 使用`aevaluate()`

* Python

需要`langsmith>=0.3.13`

```python
from langsmith import wrappers, Client
from openai import AsyncOpenAI

# Optionally wrap the OpenAI client to trace all model calls.
oai_client = wrappers.wrap_openai(AsyncOpenAI())

# Optionally add the 'traceable' decorator to trace the inputs/outputs of this function.
@traceable
async def researcher_app(inputs: dict) -> str:
    instructions = """You are an excellent researcher. Given a high-level research idea, \
list 5 concrete questions that should be investigated to determine if the idea is worth pursuing."""

    response = await oai_client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {"role": "system", "content": instructions},
            {"role": "user", "content": inputs["idea"]},
        ],
    )
    return response.choices[0].message.content

# Evaluator functions can be sync or async
def concise(inputs: dict, outputs: dict) -> bool:
    return len(outputs["output"]) < 3 * len(inputs["idea"])

ls_client = Client()
ideas = [
    "universal basic income",
    "nuclear fusion",
    "hyperloop",
    "nuclear powered rockets",
]
dataset = ls_client.create_dataset("research ideas")
ls_client.create_examples(
    dataset_name=dataset.name,
    examples=[{"inputs": {"idea": i}} for i in ideas],
)

# Can equivalently use the 'aevaluate' function directly:
# from langsmith import aevaluate
# await aevaluate(...)
results = await ls_client.aevaluate(
    researcher_app,
    data=dataset,
    evaluators=[concise],
    # Optional, add concurrency.
    max_concurrency=2,  # Optional, add concurrency.
    experiment_prefix="gpt-5.4-mini-baseline"  # Optional, random by default.
)
```

## 相关

* [Run an evaluation (synchronously)](/langsmith/evaluate-llm-application)
* [Handle model rate limits](/langsmith/handle-model-rate-limiting)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluation-async.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>