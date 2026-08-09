<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Evaluate a chatbot | https://docs.langchain.com/langsmith/evaluate-chatbot-tutorial -->

# 评估聊天机器人

在本指南中，我们将为聊天机器人设置评估。这些允许您衡量应用程序在一组数据上的执行情况。能够快速可靠地获得这种洞察力将使您充满信心地进行迭代。

在高层次上，在本教程中我们将：

* *创建初始黄金数据集来衡量性能*
* *定义用于衡量绩效的指标*
* *对几个不同的提示或模型进行评估*
* *手动比较结果*
* *跟踪一段时间内的结果*
* *设置自动化测试以在 CI/CD 中运行*

有关 LangSmith 支持的评估工作流程的更多信息，请查看 [how-to guides](/langsmith/evaluation)，或参阅 [evaluate](https://reference.langchain.com/python/langsmith/client/Client/evaluate) 及其异步 [aevaluate](https://reference.langchain.com/python/langsmith/client/Client/aevaluate) 对应项的参考文档。

有很多内容要介绍，让我们深入了解吧！

## 设置

首先安装本教程所需的依赖项。我们碰巧使用 OpenAI，但 LangSmith 可以与任何模型一起使用：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U langsmith openai
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langsmith openai
  ```
</CodeGroup>

并设置环境变量以启用 LangSmith 跟踪：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="<Your LangSmith API key>"
export OPENAI_API_KEY="<Your OpenAI API key>"
```

## 创建数据集

准备测试和评估应用程序的第一步是定义要评估的数据点。这里有几个方面需要考虑：* 每个数据点的模式应该是什么？
* 我应该收集多少个数据点？
* 我应该如何收集这些数据点？

**架构：** 每个数据点至少应包含应用程序的输入。如果可以的话，定义预期输出也非常有帮助 - 这些输出代表您期望正常运行的应用程序输出的内容。很多时候你无法定义完美的输出——没关系！评估是一个迭代过程。有时您可能还想为每个示例定义更多信息 - 例如在 RAG 中获取的预期文档，或作为代理采取的预期步骤。 LangSmith 数据集非常灵活，允许您定义任意模式。

**数量：** 对于您应该收集多少没有硬性规定。最重要的是确保您对可能想要防范的边缘情况有适当的覆盖。即使 10-50 个示例也可以提供很多价值！不用担心开始时会得到大量的数据 - 您可以（并且应该）随着时间的推移不断添加！**如何获得：** 这可能是最棘手的部分。一旦你知道你想要收集数据集......你实际上如何去做呢？对于大多数开始新项目的团队来说，我们通常会看到他们首先手动收集前 10-20 个数据点。从这些数据点开始之后，这些数据集通常是“活的”结构，并随着时间的推移而增长。通常，在了解真实用户将如何使用您的应用程序、了解存在的痛点，然后将其中一些数据点移入该集合后，它们通常会增长。还有一些方法，例如综合生成数据，可用于增强数据集。首先，我们建议不要担心这些，只需手动标记大约 10-20 个示例。

获得数据集后，可以通过几种不同的方法将其上传到 LangSmith。在本教程中，我们将使用客户端，但您也可以通过 UI 上传（甚至在 UI 中创建它们）。在本教程中，我们将创建 5 个数据点进行评估。我们将评估一个问答应用程序。输入将是一个问题，输出将是一个答案。由于这是一个问答应用程序，我们可以定义预期的答案。让我们展示如何创建此数据集并将其上传到 LangSmith！

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client

client = Client()

# Define dataset: these are your test cases
dataset_name = "QA Example Dataset"
dataset = client.create_dataset(dataset_name)

client.create_examples(
    dataset_id=dataset.id,
    examples=[
        {
            "inputs": {"question": "What is LangChain?"},
            "outputs": {"answer": "A framework for building LLM applications"},
        },
        {
            "inputs": {"question": "What is LangSmith?"},
            "outputs": {"answer": "A platform for observing and evaluating LLM applications"},
        },
        {
            "inputs": {"question": "What is OpenAI?"},
            "outputs": {"answer": "A company that creates Large Language Models"},
        },
        {
            "inputs": {"question": "What is Google?"},
            "outputs": {"answer": "A technology company known for search"},
        },
        {
            "inputs": {"question": "What is Mistral?"},
            "outputs": {"answer": "A company that creates Large Language Models"},
        }
    ]
)
```

现在，如果我们进入 LangSmith UI 并在 `Datasets & Testing` 页面中查找 `QA Example Dataset`，当我们单击它时，我们应该看到我们有五个新示例。

<img alt="Testing tutorial dataset" />

## 定义指标

创建数据集后，我们现在可以定义一些指标来评估我们的响应。由于我们有预期的答案，因此我们可以将其进行比较，作为评估的一部分。然而，我们并不期望我们的应用程序输出那些**精确**的答案，而是输出类似的东西。这使得我们的评估变得有点棘手。

除了评估正确性之外，我们还要确保我们的答案简短明了。这会更容易一点——我们可以定义一个简单的 Python 函数来测量响应的长度。

让我们继续定义这两个指标。首先，我们将使用LLM来**判断**输出是否正确（相对于预期输出）。对于过于复杂而无法用简单函数衡量的案例，这种**法学硕士作为法官**相对常见。我们可以在这里定义自己的提示和 LLM 用于评估：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import openai
from langsmith import wrappers

openai_client = wrappers.wrap_openai(openai.OpenAI())

eval_instructions = "You are an expert professor specialized in grading students' answers to questions."

def correctness(inputs: dict, outputs: dict, reference_outputs: dict) -> bool:
    user_content = f"""You are grading the following question:
{inputs['question']}
Here is the real answer:
{reference_outputs['answer']}
You are grading the following predicted answer:
{outputs['response']}
Respond with CORRECT or INCORRECT:
Grade:"""
    response = openai_client.chat.completions.create(
        model="gpt-5.4-mini",
        temperature=0,
        messages=[
            {"role": "system", "content": eval_instructions},
            {"role": "user", "content": user_content},
        ],
    ).choices[0].message.content
    return response == "CORRECT"
```

对于评估响应的长度，这要容易得多！我们可以定义一个简单的函数来检查实际输出是否小于预期结果长度的 2 倍。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def concision(outputs: dict, reference_outputs: dict) -> bool:
    return int(len(outputs["response"]) < 2 * len(reference_outputs["answer"]))
```

## 运行评估

太棒了！现在我们如何进行评估？现在我们有了数据集和评估器，我们所需要的就是我们的应用程序！我们将构建一个简单的应用程序，其中只有一条系统消息，其中包含有关如何响应的说明，然后将其传递给法学硕士。我们将直接使用 OpenAI SDK 构建它：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
default_instructions = "Respond to the users question in a short, concise manner (one short sentence)."

def my_app(question: str, model: str = "gpt-5.4-mini", instructions: str = default_instructions) -> str:
    return openai_client.chat.completions.create(
        model=model,
        temperature=0,
        messages=[
            {"role": "system", "content": instructions},
            {"role": "user", "content": question},
        ],
    ).choices[0].message.content
```

在通过 LangSmith 评估运行此操作之前，我们需要定义一个简单的包装器，将数据集中的输入键映射到我们想要调用的函数，然后还将函数的输出映射到我们期望的输出键。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def ls_target(inputs: str) -> dict:
    return {"response": my_app(inputs["question"])}
```

太棒了！现在我们准备进行评估。我们开始做吧！

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
experiment_results = client.evaluate(
    ls_target, # Your AI system
    data=dataset_name, # The data to predict and grade over
    evaluators=[concision, correctness], # The evaluators to score the results
    experiment_prefix="openai-4o-mini", # A prefix for your experiment names to easily identify them
)
```这将输出一个 URL。如果我们点击它，我们应该会看到评估结果！

<img alt="Testing tutorial run" />

如果我们返回数据集页面并选择 `Experiments` 选项卡，我们现在可以看到一次运行的摘要！

<img alt="Testing tutorial one run" />

现在让我们尝试使用不同的模型！来试试`gpt-4-turbo`

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def ls_target_v2(inputs: str) -> dict:
    return {"response": my_app(inputs["question"], model="gpt-4-turbo")}

experiment_results = client.evaluate(
    ls_target_v2,
    data=dataset_name,
    evaluators=[concision, correctness],
    experiment_prefix="openai-4-turbo",
)
```

现在让我们使用 GPT-4，同时更新提示，要求答案简短一点。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
instructions_v3 = "Respond to the users question in a short, concise manner (one short sentence). Do NOT use more than ten words."

def ls_target_v3(inputs: str) -> dict:
    response = my_app(
        inputs["question"],
        model="gpt-4-turbo",
        instructions=instructions_v3
    )
    return {"response": response}

experiment_results = client.evaluate(
    ls_target_v3,
    data=dataset_name,
    evaluators=[concision, correctness],
    experiment_prefix="strict-openai-4-turbo",
)
```

如果我们返回数据集页面上的 `Experiments` 选项卡，我们应该看到所有三个运行现在都显示了！

<img alt="Testing tutorial three runs" />

## 比较结果

太棒了，我们评估了三种不同的运行。但我们如何比较结果呢？我们可以做到这一点的第一种方法是查看 `Experiments` 选项卡中的运行。如果我们这样做，我们可以看到每次运行的指标的高级视图：

<img alt="Testing tutorial compare metrics" />

我们可以看出，GPT-4 在了解谁是公司方面比 GPT-3.5 更好，而且严格的提示对长度有很大帮助。但如果我们想更详细地探索怎么办？为此，我们可以选择要比较的所有运行（在本例中为全部三个）并在比较视图中打开它们。我们立即并排看到所有三个测试。一些单元格采用颜色编码 - 这显示了*某个指标*与*某个基线*相比的回归。我们会自动选择基准和指标的默认值，但您可以自行更改这些值。您还可以使用 `Display` 控件选择要查看的列和指标。您还可以通过单击顶部的图标自动过滤以仅查看有改进/回归的运行。

<img alt="Testing tutorial compare runs" />

如果我们想查看更多信息，我们还可以选择将鼠标悬停在一行上时出现的`Expand`按钮，以打开包含更详细信息的侧面板：

<img alt="Testing tutorial side panel" />

## 设置自动化测试以在 CI/CD 中运行现在我们已经以一次性方式运行它，我们可以将其设置为以自动方式运行。我们可以很容易地做到这一点，只需将其作为我们在 CI/CD 中运行的 pytest 文件包含进来。作为其中的一部分，我们可以只记录结果或设置一些标准来确定它是否通过。例如，如果我想确保我们始终获得至少 80% 的生成响应通过 `length` 检查，我们可以通过以下测试进行设置：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def test_length_score() -> None:
    """Test that the length score is at least 80%."""
    experiment_results = evaluate(
        ls_target, # Your AI system
        data=dataset_name, # The data to predict and grade over
        evaluators=[concision, correctness], # The evaluators to score the results
    )
    # This will be cleaned up in the next release:
    feedback = client.list_feedback(
        run_ids=[r.id for r in client.list_runs(project_name=experiment_results.experiment_name)],
        feedback_key="concision"
    )
    scores = [f.score for f in feedback]
    assert sum(scores) / len(scores) >= 0.8, "Aggregate score should be at least .8"
```

## 随着时间的推移跟踪结果

现在我们已经以自动化方式运行这些实验，我们希望随着时间的推移跟踪这些结果。我们可以从数据集页面的整体`Experiments`选项卡中执行此操作。默认情况下，我们显示随时间变化的评估指标（以红色突出显示）。我们还自动跟踪 git 指标，以便轻松地将其与代码分支关联起来（以黄色突出显示）。

<img alt="Testing tutorial over time" />

## 结论

这就是本教程的内容！

我们已经介绍了如何创建初始测试集、定义一些评估指标、运行实验、手动比较它们、设置 CI/CD 以及跟踪一段时间内的结果。这可以帮助您充满信心地进行迭代。这只是开始。如前所述，评估是一个持续的过程。例如 - 您想要评估的数据点可能会随着时间的推移而不断变化。您可能希望探索多种类型的评估器。有关这方面的信息，请查看[how-to guides](/langsmith/evaluation)。

此外，除了这种“离线”方式之外，还有其他方法来评估数据（例如，您可以评估生产数据）。更多在线评估信息，请查看[Set up LLM-as-a-judge online evaluators](/langsmith/online-evaluations-llm-as-judge)。

## 参考代码

<Accordion title="Click to see a consolidated code snippet">
  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import openai
  from langsmith import Client, wrappers

  # Application code
  openai_client = wrappers.wrap_openai(openai.OpenAI())

  default_instructions = "Respond to the users question in a short, concise manner (one short sentence)."

  def my_app(question: str, model: str = "gpt-5.4-mini", instructions: str = default_instructions) -> str:
      return openai_client.chat.completions.create(
          model=model,
          temperature=0,
          messages=[
              {"role": "system", "content": instructions},
              {"role": "user", "content": question},
          ],
      ).choices[0].message.content

  client = Client()

  # Define dataset: these are your test cases
  dataset_name = "QA Example Dataset"
  dataset = client.create_dataset(dataset_name)

  client.create_examples(
      dataset_id=dataset.id,
      examples=[
          {
              "inputs": {"question": "What is LangChain?"},
              "outputs": {"answer": "A framework for building LLM applications"},
          },
          {
              "inputs": {"question": "What is LangSmith?"},
              "outputs": {"answer": "A platform for observing and evaluating LLM applications"},
          },
          {
              "inputs": {"question": "What is OpenAI?"},
              "outputs": {"answer": "A company that creates Large Language Models"},
          },
          {
              "inputs": {"question": "What is Google?"},
              "outputs": {"answer": "A technology company known for search"},
          },
          {
              "inputs": {"question": "What is Mistral?"},
              "outputs": {"answer": "A company that creates Large Language Models"},
          }
      ]
  )

  # Define evaluators
  eval_instructions = "You are an expert professor specialized in grading students' answers to questions."

  def correctness(inputs: dict, outputs: dict, reference_outputs: dict) -> bool:
      user_content = f"""You are grading the following question:
  {inputs['question']}
  Here is the real answer:
  {reference_outputs['answer']}
  You are grading the following predicted answer:
  {outputs['response']}
  Respond with CORRECT or INCORRECT:
  Grade:"""
      response = openai_client.chat.completions.create(
          model="gpt-5.4-mini",
          temperature=0,
          messages=[
              {"role": "system", "content": eval_instructions},
              {"role": "user", "content": user_content},
          ],
      ).choices[0].message.content
      return response == "CORRECT"

  def concision(outputs: dict, reference_outputs: dict) -> bool:
      return int(len(outputs["response"]) < 2 * len(reference_outputs["answer"]))

  # Run evaluations
  def ls_target(inputs: str) -> dict:
      return {"response": my_app(inputs["question"])}

  experiment_results_v1 = client.evaluate(
      ls_target, # Your AI system
      data=dataset_name, # The data to predict and grade over
      evaluators=[concision, correctness], # The evaluators to score the results
      experiment_prefix="openai-4o-mini", # A prefix for your experiment names to easily identify them
  )

  def ls_target_v2(inputs: str) -> dict:
      return {"response": my_app(inputs["question"], model="gpt-4-turbo")}

  experiment_results_v2 = client.evaluate(
      ls_target_v2,
      data=dataset_name,
      evaluators=[concision, correctness],
      experiment_prefix="openai-4-turbo",
  )

  instructions_v3 = "Respond to the users question in a short, concise manner (one short sentence). Do NOT use more than ten words."

  def ls_target_v3(inputs: str) -> dict:
      response = my_app(
          inputs["question"],
          model="gpt-4-turbo",
          instructions=instructions_v3
      )
      return {"response": response}

  experiment_results_v3 = client.evaluate(
      ls_target_v3,
      data=dataset_name,
      evaluators=[concision, correctness],
      experiment_prefix="strict-openai-4-turbo",
  )
  ```
</Accordion>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluate-chatbot-tutorial.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>