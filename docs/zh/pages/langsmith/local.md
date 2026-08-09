<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to run an evaluation locally (Python only) | https://docs.langchain.com/langsmith/local -->

# 如何在本地运行评估（仅限 Python）

有时，在本地运行评估而不将任何结果上传到 LangSmith 会很有帮助。例如，如果您快速迭代提示并希望在几个示例上对其进行冒烟测试，或者如果您正在验证目标和评估器函数是否已正确定义，则您可能不想记录这些评估。

您可以通过使用 LangSmith Python SDK 并将 `upload_results=False` 传递给 `evaluate()` / `aevaluate()` 来完成此操作。

这将像往常一样运行您的应用程序和评估器并返回相同的输出，但不会向 LangSmith 记录任何内容。这不仅包括实验结果，还包括应用和评估者痕迹。

<Note>
  如果您想将结果上传到 LangSmith，但还需要在脚本中处理它们（用于质量门、自定义聚合等），请参阅[Read experiment results locally](/langsmith/read-local-experiment-results)。
</Note>

## 示例

让我们看一个例子：

需要`langsmith>=0.2.0`。示例还使用了`pandas`。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client

# 1. Create and/or select your dataset
ls_client = Client()
dataset = ls_client.clone_public_dataset(
    "https://smith.langchain.com/public/a63525f9-bdf2-4512-83e3-077dc9417f96/d"
)

# 2. Define an evaluator
def is_concise(outputs: dict, reference_outputs: dict) -> bool:
    return len(outputs["answer"]) < (3 * len(reference_outputs["answer"]))

# 3. Define the interface to your app
def chatbot(inputs: dict) -> dict:
    return {"answer": inputs["question"] + " is a good question. I don't know the answer."}

# 4. Run an evaluation
experiment = ls_client.evaluate(
    chatbot,
    data=dataset,
    evaluators=[is_concise],
    experiment_prefix="my-first-experiment",
    # 'upload_results' is the relevant arg.
    upload_results=False
)

# 5. Analyze results locally
results = list(experiment)

# Check if 'is_concise' returned False.
failed = [r for r in results if not r["evaluation_results"]["results"][0].score]

# Explore the failed inputs and outputs.
for r in failed:
    print(r["example"].inputs)
    print(r["run"].outputs)

# Explore the results as a Pandas DataFrame.
# Must have 'pandas' installed.
df = experiment.to_pandas()
df[["inputs.question", "outputs.answer", "reference.answer", "feedback.is_concise"]]
```

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{'question': 'What is the largest mammal?'}
{'answer': "What is the largest mammal? is a good question. I don't know the answer."}
{'question': 'What do mammals and birds have in common?'}
{'answer': "What do mammals and birds have in common? is a good question. I don't know the answer."}
```|   |输入问题 |输出.answer |参考答案 |反馈是\_简洁的|
| - | ---------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------- | -------------------- |
| 0 |最大的哺乳动物是什么？               |最大的哺乳动物是什么？这是一个好问题。我不知道答案。               |蓝鲸|假 |
| 1 |哺乳动物和鸟类有什么共同点？ |哺乳动物和鸟类有什么共同点？这是一个好问题。我不知道答案。 |他们都是热血人|假 |

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/local.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>