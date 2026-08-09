<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Deep Agents applications | https://docs.langchain.com/langsmith/trace-deep-agents -->

# 跟踪深度代理应用程序

[⟦T8⟧](/oss/python/deepagents/overview) 是一个构建在 LangGraph 之上的开源代理框架，专为需要规划、工具使用和子代理委托的复杂、多步骤任务而设计。 Deep Agents 支持本机 LangSmith 跟踪。

本指南向您展示如何为深度代理启用 LangSmith 跟踪、在 LangSmith UI 中查看跟踪以及（可选）为更高级的用例自定义跟踪配置。

## 安装

在 Python 环境中安装 `deepagents`：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install deepagents
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add deepagents
  ```
</CodeGroup>

`deepagents` 要求：

* Python 3.11+。
* 支持工具调用的LLM（例如OpenAI或Anthropic模型）。
* 用于追踪，[LangSmith account and API key](/langsmith/create-account-api-key)（免费注册）。

<Note>
  您不需要安装 `langsmith` Python 包来跟踪 Deep Agent。 `deepagents` 基于 LangGraph 构建，其中包括原生 LangSmith 跟踪支持。只要设置了 LangSmith 环境变量，跟踪就会自动发送。

  仅当您需要 [programmatic control over tracing](#customize-langsmith-tracing) 时才需要 `langsmith` 包（例如，使用 `tracing_context`、添加自定义元数据或从 Python 查询运行）。
</Note>

## 设置

您可以在 **设置** 下的 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-deep-agents) 中找到您的 LangSmith API 密钥和项目名称：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY=<your-langsmith-api-key>
export LANGSMITH_TRACING=true
export LANGSMITH_PROJECT=<your-project-name>
```

## 创建跟踪一旦通过环境变量启用跟踪，Deep Agents 将自动向 LangSmith 发出跟踪。例如：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import Dict, Any, List

from deepagents import create_deep_agent


def compute_compound_interest(
    principal: float,
    annual_rate: float,
    years: int,
    compounds_per_year: int,
) -> Dict[str, Any]:
    """Compute compound interest and return ending balance and interest earned."""
    r = annual_rate
    n = compounds_per_year
    t = years
    amount = principal * (1 + r / n) ** (n * t)
    interest = amount - principal
    return {
        "principal": principal,
        "annual_rate": annual_rate,
        "years": years,
        "compounds_per_year": n,
        "ending_balance": round(amount, 2),
        "interest_earned": round(interest, 2),
    }


def yearly_balance_schedule(
    principal: float,
    annual_rate: float,
    years: int,
    compounds_per_year: int,
) -> List[Dict[str, Any]]:
    """Return a year-by-year balance schedule for the investment."""
    r = annual_rate
    n = compounds_per_year
    schedule: List[Dict[str, Any]] = []

    for year in range(1, years + 1):
        amount = principal * (1 + r / n) ** (n * year)
        schedule.append(
            {
                "year": year,
                "ending_balance": round(amount, 2),
                "interest_earned": round(amount - principal, 2),
            }
        )

    return schedule


agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    tools=[compute_compound_interest, yearly_balance_schedule],
    system_prompt=(
        "You are a careful assistant. "
        "Use tools for calculations and structured outputs. "
        "Return a concise final answer."
    ),
)

result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": (
                    "I have $2,500 invested at 6% annual interest compounded monthly for 5 years.\n"
                    "1) Compute the ending balance and total interest earned.\n"
                    "2) Generate a year-by-year ending balance schedule.\n"
                    "Then summarize the key takeaways in 3 bullets.\n\n"
                    "Use compounds_per_year=12."
                ),
            }
        ]
    }
)

print(result)
```

## 查看痕迹

### 详情查看

单击跟踪，然后切换到右上角的 **详细信息** 视图。 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-deep-agents) 中的跟踪树将类似于 [this](https://smith.langchain.com/public/ec82be64-b158-425e-a959-924be16b8588/r)，具有以下结构：

* 代理运行（顶层）代表完整的深度代理调用。
* LLM 调用，代理分析用户请求并决定使用哪些工具。
* 工具运行：`compute_compound_interest`：
  * 显示工具输入（例如，本金、年率、年数和每年的化合物）。
  * 显示结构化输出，包括期末余额和赚取的总利息。
* LLM 调用解释计算结果并确定下一步。
* 工具运行：`yearly_balance_schedule`：
  * 显示用于生成计划的输入。
  * 返回期末余额和利息收入的逐年细目。
* 最终 LLM 回复为用户总结了结果。

生成的跟踪包含多个嵌套范围，使您可以在 LangSmith UI 中遵循代理的规划、计算步骤和解释流程。

### 消息查看LangSmith UI 中的 **消息** 视图显示用户和代理之间的简化对话历史记录。该视图从顶级跟踪中提取消息（包括用户的初始请求、工具调用和代理的最终响应）并以类似聊天的格式表示它们。

### 按子代理过滤

Deep Agents 在子代理生成的每次运行中自动将子代理的 `name` 写入到 `lc_agent_name` 元数据键。使用它可以将所有运行与 LangSmith 中的特定子代理隔离，这对于调试、监视或比较子代理行为非常有用。

**在 LangSmith UI 中过滤：**

1. 在[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-deep-agents)中打开您的跟踪项目。
2. 将视图切换到 **Runs** 以查看各个跨度。
3. 单击“**添加过滤器**”并选择“**元数据**”。
4. 将 **Key** 设置为 `lc_agent_name`，将 **Value** 设置为子代理名称，例如 `coordinator`。

<img alt="LangSmith Runs view with a metadata filter on lc_agent_name set to coordinator" />

将过滤器保存为命名视图以便快速重用。有关过滤器选项的完整参考，请参阅[Filter traces](/langsmith/filter-traces-in-application)。

**使用 SDK 以编程方式过滤：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client

client = Client()

# Fetch all runs produced by a specific subagent
runs = client.list_runs(
    project_name="<your-project>",
    filter='has(metadata, \'{"lc_agent_name": "research-agent"}\')',
)

for run in runs:
    print(run.name, run.start_time, run.status)
```

有关完整的过滤器查询语言参考，请参阅[Trace query syntax](/langsmith/trace-query-syntax)。

## 自定义 LangSmith 追踪默认情况下，当通过环境变量启用 LangSmith 跟踪时，会自动发出 Deep Agents 跟踪。您可以直接使用 [LangSmith SDK](https://reference.langchain.com/python/langsmith/observability/sdk/) 自定义跟踪，例如将跟踪范围限定到部分代码、附加标签或元数据，或者覆盖项目名称。

如果您想执行以下操作，请安装并使用 `langsmith`：

* 仅跟踪特定代理调用。
* 添加自定义标签或元数据以在用户界面中进行过滤。
* 在运行时覆盖项目名称。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langsmith
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langsmith
  ```
</CodeGroup>

此示例调用同一深度代理两次：

* 第一次调用是未被跟踪的，因为它在 `tracing_context` 之外运行。
* 第二次调用被跟踪，因为它在`tracing_context(enabled=True, ...)`内部运行。

您可以有选择地仅跟踪工作流程的一部分，而无需使用 `LANGSMITH_TRACING=true` 启用整个流程的全局跟踪：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import Dict, Any, List

import langsmith as ls
from deepagents import create_deep_agent


def compute_compound_interest(
    principal: float,
    annual_rate: float,
    years: int,
    compounds_per_year: int,
) -> Dict[str, Any]:
    """Compute compound interest and return ending balance and interest earned."""
    r = annual_rate
    n = compounds_per_year
    t = years
    amount = principal * (1 + r / n) ** (n * t)
    interest = amount - principal
    return {
        "principal": principal,
        "annual_rate": annual_rate,
        "years": years,
        "compounds_per_year": n,
        "ending_balance": round(amount, 2),
        "interest_earned": round(interest, 2),
    }


def yearly_balance_schedule(
    principal: float,
    annual_rate: float,
    years: int,
    compounds_per_year: int,
) -> List[Dict[str, Any]]:
    """Return a year-by-year balance schedule for the investment."""
    r = annual_rate
    n = compounds_per_year
    schedule: List[Dict[str, Any]] = []

    for year in range(1, years + 1):
        amount = principal * (1 + r / n) ** (n * year)
        schedule.append(
            {
                "year": year,
                "ending_balance": round(amount, 2),
                "interest_earned": round(amount - principal, 2),
            }
        )

    return schedule


agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    tools=[compute_compound_interest, yearly_balance_schedule],
    system_prompt=(
        "You are a careful assistant. "
        "Use tools for calculations and structured outputs. "
        "Return a concise final answer."
    ),
)

# ----------------------------
# Untraced invocation
# ----------------------------
agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": (
                    "I have $2,500 invested at 6% annual interest compounded monthly for 5 years. "
                    "Compute the ending balance and total interest earned. "
                    "Use compounds_per_year=12."
                ),
            }
        ]
    }
)

# ----------------------------
# Traced invocation
# ----------------------------
with ls.tracing_context(
    enabled=True,
    project_name="deepagents-demo",
    tags=["deepagents", "scoped-tracing"],
    metadata={"example": "partial-workflow"},
):
    agent.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": (
                        "I have $2,500 invested at 6% annual interest compounded monthly for 5 years.\n"
                        "1) Compute the ending balance and total interest earned.\n"
                        "2) Generate a year-by-year ending balance schedule.\n"
                        "Then summarize the key takeaways in 3 bullets.\n\n"
                        "Use compounds_per_year=12."
                    ),
                }
            ]
        }
    )
```

`tracing_context` 块启用跟踪并配置在 LangSmith 中记录和组织跟踪的方式：* `enabled=True` 明确启用块持续时间内的跟踪，即使 `LANGSMITH_TRACING` 未设置或设置为 `false`。
* `project_name="deepagents-demo"` 将跟踪从此块路由到指定的 [LangSmith project](/langsmith/log-traces-to-project)。这会覆盖上下文中创建的运行的`LANGSMITH_PROJECT`。
* `tags=[...]` 将标签附加到跟踪的运行。 [Tags](/langsmith/add-metadata-tags)出现在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-deep-agents)中，您可以使用它来过滤和分组轨迹。
* `metadata={...}` 附加任意结构化元数据（例如，环境、实验名称或功能标志）。

在这个例子中，代理被调用了两次，但只记录了`tracing_context`内的调用。这演示了如何有选择地跟踪 Deep Agents 工作流程的特定部分，而无需启用整个流程的全局跟踪。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-deep-agents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>