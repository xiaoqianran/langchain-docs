<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Run backtests on a new version of an agent | https://docs.langchain.com/langsmith/run-backtests-new-agent -->

# 在新版本的代理上运行回测

部署应用程序只是持续改进过程的开始。部署到生产环境后，您需要通过增强提示、语言模型、工具和架构来完善您的系统。回溯测试涉及使用历史数据评估应用程序的新版本，并将新输出与原始输出进行比较。与使用预生产数据集的评估相比，回溯测试可以更清晰地表明应用程序的新版本是否比当前部署有所改进。

以下是回测的基本步骤：

1. 从生产跟踪项目中选择示例运行进行测试。
2. 将运行输入转换为数据集，并将运行输出记录为针对该数据集的初始实验。
3. 在新数据集上执行新系统并比较实验结果。

此过程将为您提供一个新的代表性输入数据集，您可以对其进行版本控制并用于对模型进行回溯测试。<Info>
  通常，您不会获得明确的“基本事实”答案。在这种情况下，您可以手动标记输出或使用不依赖参考数据的评估器。如果您的应用程序允许捕获真实标签，例如允许用户留下反馈，我们强烈建议您这样做。
</Info>

## 设置

### 配置环境

安装并设置环境变量。本指南需要`langsmith>=0.2.4`。

<Info>
  为了方便起见，我们将在本教程中使用 LangChain OSS 框架，但所示的 LangSmith 功能与框架无关。
</Info>

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U langsmith langchain langchain-anthropic langchainhub emoji
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langsmith langchain langchain-anthropic langchainhub emoji
  ```
</CodeGroup>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import getpass
import os

# Set the project name to whichever project you'd like to be testing against
project_name = "Tweet Writing Task"
os.environ["LANGSMITH_PROJECT"] = project_name
os.environ["LANGSMITH_TRACING"] = "true"

if not os.environ.get("LANGSMITH_API_KEY"):
    os.environ["LANGSMITH_API_KEY"] = getpass.getpass("YOUR API KEY")

# Optional. You can swap OpenAI for any other tool-calling chat model.
os.environ["OPENAI_API_KEY"] = "YOUR OPENAI API KEY"

# Optional. You can swap Tavily for the free DuckDuckGo search tool if preferred.
# Get Tavily API key: https://tavily.com
os.environ["TAVILY_API_KEY"] = "YOUR TAVILY API KEY"
```

### 定义应用程序

对于此示例，让我们创建一个简单的推文编写应用程序，该应用程序可以访问一些互联网搜索工具：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.chat_models import init_chat_model
from langchain.agents import create_agent
from langchain_community.tools import DuckDuckGoSearchRun, TavilySearchResults
from langchain.rate_limiters import InMemoryRateLimiter


# We will use GPT-3.5 Turbo as the baseline and compare against GPT-4o
gpt_3_5_turbo = init_chat_model(
    "gpt-3.5-turbo",
    temperature=1,
    configurable_fields=("model", "model_provider"),
)

# The instructions are passed as a system message to the agent
instructions = """You are a tweet writing assistant. Given a topic, do some research and write a relevant and engaging tweet about it.
- Use at least 3 emojis in each tweet
- The tweet should be no longer than 280 characters
- Always use the search tool to gather recent information on the tweet topic
- Write the tweet only based on the search content. Do not rely on your internal knowledge
- When relevant, link to your sources
- Make your tweet as engaging as possible"""

# Define the tools our agent can use
# If you have a higher tiered Tavily API plan you can increase this
rate_limiter = InMemoryRateLimiter(requests_per_second=0.08)

# Use DuckDuckGo if you don't have a Tavily API key:
# tools = [DuckDuckGoSearchRun(rate_limiter=rate_limiter)]
tools = [TavilySearchResults(max_results=5, rate_limiter=rate_limiter)]

agent = create_agent(gpt_3_5_turbo, tools=tools, system_prompt=instructions)
```

### 模拟生产数据

现在让我们模拟一些生产数据：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
fake_production_inputs = [
    "Alan turing's early childhood",
    "Economic impacts of the European Union",
    "Underrated philosophers",
    "History of the Roxie theater in San Francisco",
    "ELI5: gravitational waves",
    "The arguments for and against a parliamentary system",
    "Pivotal moments in music history",
    "Big ideas in programming languages",
    "Big questions in biology",
    "The relationship between math and reality",
    "What makes someone funny",
]

agent.batch(
    [{"messages": [{"role": "user", "content": content}]} for content in fake_production_inputs],
)
```

## 将生产痕迹转换为实验痕迹

第一步是根据生产*输入*生成数据集。然后复制所有迹线作为基线实验。

### 选择要回测的运行

您可以使用 `list_runs` 的 `filter` 参数选择要回测的运行。 `filter` 参数使用 LangSmith [trace query syntax](/langsmith/trace-query-syntax) 来选择运行。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from datetime import datetime, timedelta, timezone
from uuid import uuid4
from langsmith import Client
from langsmith.beta import convert_runs_to_test

# Fetch the runs we want to convert to a dataset/experiment
client = Client()

# How we are sampling runs to include in our dataset
end_time = datetime.now(tz=timezone.utc)
start_time = end_time - timedelta(days=1)
run_filter = f'and(gt(start_time, "{start_time.isoformat()}"), lt(end_time, "{end_time.isoformat()}"))'
prod_runs = list(
    client.list_runs(
        project_name=project_name,
        is_root=True,
        filter=run_filter,
    )
)
```### 将运行转换为实验

`convert_runs_to_test` 是一个需要运行一些函数并执行以下操作的函数：

1. 输入和可选的输出作为示例保存到数据集。
2. 输入和输出存储为实验，就好像您运行了 `evaluate` 函数并收到了这些输出一样。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Name of the dataset we want to create
dataset_name = f'{project_name}-backtesting {start_time.strftime("%Y-%m-%d")}-{end_time.strftime("%Y-%m-%d")}'
# Name of the experiment we want to create from the historical runs
baseline_experiment_name = f"prod-baseline-gpt-3.5-turbo-{str(uuid4())[:4]}"

# This converts the runs to a dataset + experiment
convert_runs_to_test(
    prod_runs,
    # Name of the resulting dataset
    dataset_name=dataset_name,
    # Whether to include the run outputs as reference/ground truth
    include_outputs=False,
    # Whether to include the full traces in the resulting experiment
    # (default is to just include the root run)
    load_child_runs=True,
    # Name of the experiment so we can apply evalautors to it after
    test_project_name=baseline_experiment_name
)
```

完成此步骤后，您应该在 LangSmith 项目中看到一个名为“Tweetwriting Task-backtesting TODAYS DATE”的新数据集，其中包含一个如下实验：

<img alt="Baseline experiment" />

## 新系统基准测试

现在我们可以开始针对新系统对我们的生产运行进行基准测试。

### 定义评估者

首先，让我们定义用于比较两个系统的评估器。请注意，我们没有参考输出，因此我们需要提出仅需要实际输出的评估指标。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import emoji
from pydantic import BaseModel, Field
from langchain_core.messages import convert_to_openai_messages

class Grade(BaseModel):
    """Grade whether a response is supported by some context."""
    grounded: bool = Field(..., description="Is the majority of the response supported by the retrieved context?")

grounded_instructions = f"""You have given somebody some contextual information and asked them to write a statement grounded in that context.

Grade whether their response is fully supported by the context you have provided. \
If any meaningful part of their statement is not backed up directly by the context you provided, then their response is not grounded. \
Otherwise it is grounded."""
grounded_model = init_chat_model(model="gpt-5.5").with_structured_output(Grade)

def lt_280_chars(outputs: dict) -> bool:
    messages = convert_to_openai_messages(outputs["messages"])
    return len(messages[-1]['content']) <= 280

def gte_3_emojis(outputs: dict) -> bool:
    messages = convert_to_openai_messages(outputs["messages"])
    return len(emoji.emoji_list(messages[-1]['content'])) >= 3

async def is_grounded(outputs: dict) -> bool:
    context = ""
    messages = convert_to_openai_messages(outputs["messages"])
    for message in messages:
        if message["role"] == "tool":
            # Tool message outputs are the results returned from the Tavily/DuckDuckGo tool
            context += "\n\n" + message["content"]
    tweet = messages[-1]["content"]
    user = f"""CONTEXT PROVIDED:
    {context}

    RESPONSE GIVEN:
    {tweet}"""
    grade = await grounded_model.ainvoke([
        {"role": "system", "content": grounded_instructions},
        {"role": "user", "content": user}
    ])
    return grade.grounded
```

### 评估基线

现在，让我们针对基线实验运行我们的评估器。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
baseline_results = await client.aevaluate(
    baseline_experiment_name,
    evaluators=[lt_280_chars, gte_3_emojis, is_grounded],
)
# If you have pandas installed can easily explore results as df:
# baseline_results.to_pandas()
```

### 定义和评估新系统现在，让我们定义并评估我们的新系统。在此示例中，我们的新系统将与旧系统相同，但将使用 GPT-4o 而不是 GPT-3.5。由于我们已经使模型可配置，因此我们只需更新传递给代理的默认配置即可：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
candidate_results = await client.aevaluate(
    agent.with_config(model="gpt-5.5"),
    data=dataset_name,
    evaluators=[lt_280_chars, gte_3_emojis, is_grounded],
    experiment_prefix="candidate-gpt-5.5",
)
# If you have pandas installed can easily explore results as df:
# candidate_results.to_pandas()
```

## 比较结果

运行这两个实验后，您可以在数据集中查看它们：

<img alt="Dataset page" />

结果揭示了两个模型之间有趣的权衡：

1. GPT-4o 在遵循格式规则方面表现出改进的性能，始终包括所需数量的表情符号
2. 然而，GPT-4o 在提供的搜索结果方面不太可靠

为了说明接地问题：在 [this example run](https://smith.langchain.com/public/be060e19-0bc0-4798-94f5-c3d35719a5f6/r/07d43e7a-8632-479d-ae28-c7eac6e54da4) 中，GPT-4o 包含了有关 Abu Bakr Muhammad ibn Zakariyyā al-Rāzī 的医学贡献的事实，但这些事实未出现在搜索结果中。这展示了它如何从其内部知识中提取而不是严格使用所提供的信息。

这次回测表明，虽然 GPT-4o 通常被认为是一个功能更强大的模型，但简单地升级到它并不能改善我们的推文撰写者。为了有效地使用 GPT-4o，我们需要：* 完善我们的提示，更加强调仅使用提供的信息
* 或者修改我们的系统架构以更好地约束模型的输出

这种见解证明了回溯测试的价值 - 它帮助我们在部署之前识别潜在问题。

<img alt="Tutorial comparison view" />

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/run-backtests-new-agent.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>