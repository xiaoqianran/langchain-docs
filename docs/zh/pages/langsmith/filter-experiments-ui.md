<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to filter experiments in the UI | https://docs.langchain.com/langsmith/filter-experiments-ui -->

# 如何在 UI 中过滤实验

LangSmith 允许您通过反馈分数和元数据过滤以前的实验，以便轻松找到您关心的实验。

## 背景：将元数据添加到您的实验中

当您在 SDK 中运行实验时，您可以附加元数据，以便更轻松地在 UI 中进行过滤。如果您知道在运行实验时想要深入到哪些轴，这会很有帮助。

在我们的示例中，我们将围绕所使用的模型、模型提供程序和提示的已知 ID 将元数据附加到我们的实验中：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
models = {
    "openai-gpt-5.5": ChatOpenAI(model="gpt-5.5", temperature=0),
    "openai-gpt-5.4-mini": ChatOpenAI(model="gpt-5.4-mini", temperature=0),
    "anthropic-claude-sonnet-4-6": ChatAnthropic(temperature=0, model_name="claude-sonnet-4-6")
}

prompts = {
    "singleminded": "always answer questions with the word banana.",
    "fruitminded": "always discuss fruit in your answers.",
    "basic": "you are a chatbot."
}

def answer_evaluator(run, example) -> dict:
    llm = ChatOpenAI(model="gpt-5.5", temperature=0)
    answer_grader = hub.pull("langchain-ai/rag-answer-vs-reference") | llm
    score = answer_grader.invoke(
        {
            "question": example.inputs["question"],
            "correct_answer": example.outputs["answer"],
            "student_answer": run.outputs,
        }
    )
    return {"key": "correctness", "score": score["Score"]}

dataset_name = "Filterable Dataset"

for model_type, model in models.items():
    for prompt_type, prompt in prompts.items():
        def predict(example):
            return model.invoke(
                [("system", prompt), ("user", example["question"])]
            )

        model_provider = model_type.split("-")[0]
        model_name = model_type[len(model_provider) + 1:]

        evaluate(
            predict,
            data=dataset_name,
            evaluators=[answer_evaluator],
            # ADD IN METADATA HERE!!
            metadata={
                "model_provider": model_provider,
                "model_name": model_name,
                "prompt_id": prompt_type
            }
        )
```

## 在 UI 中过滤实验

在 UI 中，我们可以看到默认运行的所有实验。

<img alt="Filter all experiments" />

比如说，如果我们偏爱 openai 模型，我们可以轻松过滤并首先查看 openai 模型中的分数：

<img alt="Filter openai" />

我们可以堆叠过滤器，使我们能够过滤掉正确性上的低分，以确保我们只比较相关的实验：

<img alt="Filter feedback" />

最后，我们可以清除和重置过滤器。例如，如果我们看到有明显的获胜者并带有 `singleminded` 提示，我们可以更改过滤设置以查看是否有任何其他模型提供者的模型也能与它配合使用：

<img alt="Filter singleminded" />

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/filter-experiments-ui.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>