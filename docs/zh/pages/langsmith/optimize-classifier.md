<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Optimize a classifier | https://docs.langchain.com/langsmith/optimize-classifier -->

# 优化分类器

本教程向您展示如何根据用户反馈优化分类器。分类器非常适合优化，因为收集所需的输出通常非常简单，这使得根据用户反馈创建一些镜头示例变得很容易。这正是我们在本例中要做的事情。

## 目标

在此示例中，我们将构建一个机器人，根据标题对 GitHub 问题进行分类。它将接受一个标题并将其分类为许多不同的类别之一。然后，我们将开始收集用户反馈并使用它来塑造该分类器的执行方式。

## 开始使用

首先，我们将首先对其进行设置，以便将所有跟踪发送到特定项目。我们可以通过设置环境变量来做到这一点：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os
os.environ["LANGSMITH_PROJECT"] = "classifier"
```

然后我们可以创建我们的初始应用程序。这将是一个非常简单的函数，仅接受 GitHub 问题标题并尝试对其进行标记。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import openai
from langsmith import traceable, Client
import uuid

client = openai.Client()

available_topics = [
    "bug",
    "improvement",
    "new_feature",
    "documentation",
    "integration",
]

prompt_template = """Classify the type of the issue as one of {topics}.
Issue: {text}"""

@traceable(
    run_type="chain",
    name="Classifier",
)
def topic_classifier(
    topic: str):
    return client.chat.completions.create(
        model="gpt-5.4-mini",
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": prompt_template.format(
                    topics=','.join(available_topics),
                    text=topic,
                )
            }
        ],
    ).choices[0].message.content
```

然后我们就可以开始与它交互。与它交互时，我们将提前生成 LangSmith 运行 ID 并将其传递给该函数。我们这样做是为了稍后可以附加反馈。

以下是我们调用该应用程序的方法：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import uuid7

run_id = uuid7()
topic_classifier(
    "fix bug in LCEL",
    langsmith_extra={"run_id": run_id})
```以下是我们之后附加反馈的方法。我们可以通过两种形式收集反馈。

首先，我们可以收集“积极”反馈——这是模型正确的例子。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ls_client = Client()
run_id = uuid7()
topic_classifier(
    "fix bug in LCEL",
    langsmith_extra={"run_id": run_id})
# Resolve the UUID of the project that owns the trace
session_id = ls_client.create_project(project_name="classifier", upsert=True).id
ls_client.create_feedback(
    run_id,
    key="user-score",
    score=1.0,
    session_id=session_id,
)
```

接下来，我们可以集中精力收集对应于一代“修正”的反馈。在此示例中，模型会将其分类为错误，而我确实希望将其分类为文档。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ls_client = Client()
run_id = uuid7()
topic_classifier(
    "fix bug in documentation",
    langsmith_extra={"run_id": run_id})
session_id = ls_client.create_project(project_name="classifier", upsert=True).id
ls_client.create_feedback(
    run_id,
    key="correction",
    correction="documentation",
    session_id=session_id)
```

## 设置自动化

我们现在可以设置自动化，将带有某种形式反馈的示例移动到数据集中。我们将设置两种自动化，一种用于积极反馈，另一种用于消极反馈。

第一个将获取所有具有积极反馈的运行，并将它们自动添加到数据集中。这背后的逻辑是，任何具有积极反馈的运行都可以作为未来迭代的好例子。让我们创建一个名为 `classifier-github-issues` 的数据集来添加此数据。

<img alt="Optimization Negative" />第二个将对所有运行进行更正，并使用 Webhook 将它们添加到数据集。创建此 webhook 时，我们将选择“使用更正”选项。此选项将使得当从运行创建数据集时，它将使用校正，而不是使用运行的输出作为数据点的真实输出。

<img alt="Optimization Positive" />

## 更新应用程序

我们现在可以更新代码以提取我们要发送运行的数据集。一旦我们将其拉下来，我们就可以创建一个包含示例的字符串。然后我们可以将此字符串作为提示的一部分！

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
### NEW CODE ###
# Initialize the LangSmith Client so we can use to get the dataset
ls_client = Client()

# Create a function that will take in a list of examples and format them into a string
def create_example_string(examples):
    final_strings = []
    for e in examples:
        final_strings.append(f"Input: {e.inputs['topic']}\n> {e.outputs['output']}")
    return "\n\n".join(final_strings)
### NEW CODE ###

client = openai.Client()

available_topics = [
    "bug",
    "improvement",
    "new_feature",
    "documentation",
    "integration",
]

prompt_template = """Classify the type of the issue as one of {topics}.

Here are some examples:
{examples}

Begin!
Issue: {text}
>"""

@traceable(
    run_type="chain",
    name="Classifier",
)
def topic_classifier(
    topic: str):
    # We can now pull down the examples from the dataset
    # We do this inside the function so it always get the most up-to-date examples,
    # But this can be done outside and cached for speed if desired
    examples = list(ls_client.list_examples(dataset_name="classifier-github-issues"))  # <- New Code
    example_string = create_example_string(examples)
    return client.chat.completions.create(
        model="gpt-5.4-mini",
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": prompt_template.format(
                    topics=','.join(available_topics),
                    text=topic,
                    examples=example_string,
                )
            }
        ],
    ).choices[0].message.content
```

如果现在使用与以前类似的输入运行应用程序，我们可以看到它正确地学习到与文档相关的任何内容（即使是错误）都应分类为 `documentation`

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ls_client = Client()
run_id = uuid7()
topic_classifier(
    "address bug in documentation",
    langsmith_extra={"run_id": run_id})
```

## 对示例进行语义搜索

我们可以做的另一件事是仅使用语义上最相似的示例。当您开始构建大量示例时，这非常有用。

为此，我们可以首先定义一个示例来查找 `k` 最相似的示例：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import numpy as np

def find_similar(examples, topic, k=5):
    inputs = [e.inputs['topic'] for e in examples] + [topic]
    vectors = client.embeddings.create(input=inputs, model="text-embedding-3-small")
    vectors = [e.embedding for e in vectors.data]
    vectors = np.array(vectors)
    args = np.argsort(-vectors.dot(vectors[-1])[:-1])[:5]
    examples = [examples[i] for i in args]
    return examples
```

然后我们可以在应用程序中使用它

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ls_client = Client()

def create_example_string(examples):
    final_strings = []
    for e in examples:
        final_strings.append(f"Input: {e.inputs['topic']}\n> {e.outputs['output']}")
    return "\n\n".join(final_strings)

client = openai.Client()

available_topics = [
    "bug",
    "improvement",
    "new_feature",
    "documentation",
    "integration",
]

prompt_template = """Classify the type of the issue as one of {topics}.

Here are some examples:
{examples}

Begin!
Issue: {text}
>"""

@traceable(
    run_type="chain",
    name="Classifier",
)
def topic_classifier(
    topic: str):
    examples = list(ls_client.list_examples(dataset_name="classifier-github-issues"))
    examples = find_similar(examples, topic)
    example_string = create_example_string(examples)
    return client.chat.completions.create(
        model="gpt-5.4-mini",
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": prompt_template.format(
                    topics=','.join(available_topics),
                    text=topic,
                    examples=example_string,
                )
            }
        ],
    ).choices[0].message.content
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/optimize-classifier.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>