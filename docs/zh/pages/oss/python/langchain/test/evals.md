<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Agent Evals | https://docs.langchain.com/oss/python/langchain/test/evals -->

# 代理评估

使用确定性匹配或使用 AgentEvals 和 LangSmith 的 LLM-as-judge 评估器来评估智能体轨迹。

评估（“evals”）通过评估代理的执行轨迹、消息序列和它生成的工具调用来衡量代理的执行情况。与验证基本正确性的[integration tests](/oss/python/langchain/test/integration-testing)不同，评估根据参考或评分标准对代理行为进行评分，这使得它们在您更改提示、工具或模型时可用于捕获回归。

评估器是一个函数，它获取代理输出（以及可选的参考输出）并返回分数：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def evaluator(*, outputs: dict, reference_outputs: dict):
    output_messages = outputs["messages"]
    reference_messages = reference_outputs["messages"]
    score = compare_messages(output_messages, reference_messages)
    return {"key": "evaluator_score", "score": score}
```

[⟦T14⟧](https://github.com/langchain-ai/agentevals) 包提供了针对代理轨迹的预构建评估器。您可以通过执行**轨迹匹配**（确定性比较）或使用**LLM法官**（定性评估）来进行评估：|方法|何时使用 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [Trajectory match](#trajectory-match-evaluator) |您知道预期的工具调用并希望进行快速、确定性、免费的检查 |
| [LLM-as-judge](#llm-as-judge-evaluator) |您想要在没有严格期望的情况下评估整体质量和推理 |

## 安装 AgentEvals

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U agentevals
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add agentevals
  ```
</CodeGroup>

或者，直接克隆[AgentEvals repository](https://github.com/langchain-ai/agentevals)。

## 轨迹匹配评估器

AgentEvals 提供 `create_trajectory_match_evaluator` 函数来将代理的轨迹与参考进行匹配。有四种模式：|模式|描述 |使用案例 |
| ----------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `strict` |消息结构和工具调用以相同顺序精确匹配（消息内容可以不同）|测试特定序列（例如，授权前的策略查找）|
| `unordered` |与参考相同的消息结构和工具调用，但工具调用可以按任何顺序发生 |当顺序无关紧要时验证信息检索 |
| `subset` |代理仅调用参考工具（无额外功能）|确保代理不超出预期范围 |
| `superset` |代理至少调用参考工具（允许额外）|验证已采取最低限度的必要措施 |

下面的示例共享一个通用设置，即带有 `get_weather` 工具的代理：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.tools import tool
from langchain.messages import HumanMessage, AIMessage, ToolMessage
from agentevals.trajectory.match import create_trajectory_match_evaluator


@tool
def get_weather(city: str):
    """Get weather information for a city."""
    return f"It's 75 degrees and sunny in {city}."

agent = create_agent("claude-sonnet-4-6", tools=[get_weather])
```<Accordion title="Strict match">
  `strict` 模式确保轨迹通过相同的工具调用以相同的顺序包含相同的消息，尽管它允许消息内容存在差异。当您需要强制执行特定的操作序列（例如在授权操作之前需要进行策略查找）时，这非常有用。

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  evaluator = create_trajectory_match_evaluator(  # [!code highlight]
      trajectory_match_mode="strict",  # [!code highlight]
  )  # [!code highlight]

  def test_weather_tool_called_strict():
      result = agent.invoke({
          "messages": [HumanMessage(content="What's the weather in San Francisco?")]
      })

      reference_trajectory = [
          HumanMessage(content="What's the weather in San Francisco?"),
          AIMessage(content="", tool_calls=[
              {"id": "call_1", "name": "get_weather", "args": {"city": "San Francisco"}}
          ]),
          ToolMessage(content="It's 75 degrees and sunny in San Francisco.", tool_call_id="call_1"),
          AIMessage(content="The weather in San Francisco is 75 degrees and sunny."),
      ]

      evaluation = evaluator(
          outputs=result["messages"],
          reference_outputs=reference_trajectory
      )
      # {
      #     'key': 'trajectory_strict_match',
      #     'score': True,
      #     'comment': None,
      # }
      assert evaluation["score"] is True
  ```
</Accordion>

<Accordion title="Unordered match">
  `unordered` 模式允许以任意顺序调用相同的工具。当您想要验证是否检索到特定信息但不关心顺序时，这非常有用。例如，使用不同工具调用检查城市天气和事件的代理。

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  @tool
  def get_events(city: str):
      """Get events happening in a city."""
      return f"Concert at the park in {city} tonight."

  agent = create_agent("claude-sonnet-4-6", tools=[get_weather, get_events])

  evaluator = create_trajectory_match_evaluator(  # [!code highlight]
      trajectory_match_mode="unordered",  # [!code highlight]
  )  # [!code highlight]

  def test_multiple_tools_any_order():
      result = agent.invoke({
          "messages": [HumanMessage(content="What's happening in SF today?")]
      })

      reference_trajectory = [
          HumanMessage(content="What's happening in SF today?"),
          AIMessage(content="", tool_calls=[
              {"id": "call_1", "name": "get_events", "args": {"city": "SF"}},
              {"id": "call_2", "name": "get_weather", "args": {"city": "SF"}},
          ]),
          ToolMessage(content="Concert at the park in SF tonight.", tool_call_id="call_1"),
          ToolMessage(content="It's 75 degrees and sunny in SF.", tool_call_id="call_2"),
          AIMessage(content="Today in SF: 75 degrees and sunny with a concert at the park tonight."),
      ]

      evaluation = evaluator(
          outputs=result["messages"],
          reference_outputs=reference_trajectory,
      )
      assert evaluation["score"] is True
  ```
</Accordion>

<Accordion title="Subset and superset match">
  `superset` 和 `subset` 模式匹配部分轨迹。 `superset` 模式验证代理是否至少调用了参考轨迹中的工具，从而允许调用其他工具。 `subset` 模式确保代理不会调用参考中的工具之外的任何工具。

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  @tool
  def get_detailed_forecast(city: str):
      """Get detailed weather forecast for a city."""
      return f"Detailed forecast for {city}: sunny all week."

  agent = create_agent("claude-sonnet-4-6", tools=[get_weather, get_detailed_forecast])

  evaluator = create_trajectory_match_evaluator(  # [!code highlight]
      trajectory_match_mode="superset",  # [!code highlight]
  )  # [!code highlight]

  def test_agent_calls_required_tools_plus_extra():
      result = agent.invoke({
          "messages": [HumanMessage(content="What's the weather in Boston?")]
      })

      # Reference only requires get_weather, but agent may call additional tools
      reference_trajectory = [
          HumanMessage(content="What's the weather in Boston?"),
          AIMessage(content="", tool_calls=[
              {"id": "call_1", "name": "get_weather", "args": {"city": "Boston"}},
          ]),
          ToolMessage(content="It's 75 degrees and sunny in Boston.", tool_call_id="call_1"),
          AIMessage(content="The weather in Boston is 75 degrees and sunny."),
      ]

      evaluation = evaluator(
          outputs=result["messages"],
          reference_outputs=reference_trajectory,
      )
      assert evaluation["score"] is True
  ```
</Accordion><Info>
  您还可以设置 `tool_args_match_mode` 属性和/或 `tool_args_match_overrides` 来自定义评估器如何考虑实际轨迹与参考中的工具调用之间的相等性。默认情况下，只有对同一工具具有相同参数的工具调用才被视为相等。请访问[repository](https://github.com/langchain-ai/agentevals?tab=readme-ov-file#tool-args-match-modes)了解更多详情。
</Info>

## 法学硕士作为法官评估员

您可以使用 LLM 通过 `create_trajectory_llm_as_judge` 函数评估代理的执行路径。与轨迹匹配评估器不同，它不需要参考轨迹，但如果有的话可以提供。

<Accordion title="Without reference trajectory">
  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from agentevals.trajectory.llm import create_trajectory_llm_as_judge, TRAJECTORY_ACCURACY_PROMPT

  evaluator = create_trajectory_llm_as_judge(  # [!code highlight]
      model="openai:o3-mini",  # [!code highlight]
      prompt=TRAJECTORY_ACCURACY_PROMPT,  # [!code highlight]
  )  # [!code highlight]

  def test_trajectory_quality():
      result = agent.invoke({
          "messages": [HumanMessage(content="What's the weather in Seattle?")]
      })

      evaluation = evaluator(
          outputs=result["messages"],
      )
      assert evaluation["score"] is True
  ```
</Accordion>

<Accordion title="With reference trajectory">
  如果您有参考轨迹，请使用预先构建的 `TRAJECTORY_ACCURACY_PROMPT_WITH_REFERENCE` 提示：

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from agentevals.trajectory.llm import create_trajectory_llm_as_judge, TRAJECTORY_ACCURACY_PROMPT_WITH_REFERENCE

  evaluator = create_trajectory_llm_as_judge(
      model="openai:o3-mini",
      prompt=TRAJECTORY_ACCURACY_PROMPT_WITH_REFERENCE,
  )
  evaluation = evaluator(
      outputs=result["messages"],
      reference_outputs=reference_trajectory,
  )
  ```
</Accordion>

<Info>
  有关 LLM 如何评估轨迹的更多可配置性，请访问 [repository](https://github.com/langchain-ai/agentevals?tab=readme-ov-file#trajectory-llm-as-judge)。
</Info>

### 异步支持

所有 `agentevals` 评估器都支持 Python asyncio。通过在函数名称中的 `create_` 之后添加 `async` 可以使用异步版本。

<Accordion title="Async judge and evaluator example">
  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from agentevals.trajectory.llm import create_async_trajectory_llm_as_judge, TRAJECTORY_ACCURACY_PROMPT
  from agentevals.trajectory.match import create_async_trajectory_match_evaluator

  async_judge = create_async_trajectory_llm_as_judge(
      model="openai:o3-mini",
      prompt=TRAJECTORY_ACCURACY_PROMPT,
  )

  async_evaluator = create_async_trajectory_match_evaluator(
      trajectory_match_mode="strict",
  )

  async def test_async_evaluation():
      result = await agent.ainvoke({
          "messages": [HumanMessage(content="What's the weather?")]
      })

      evaluation = await async_judge(outputs=result["messages"])
      assert evaluation["score"] is True
  ```
</Accordion>

## 在 LangSmith 中运行评估

为了随着时间的推移跟踪实验，请将评估器结果记录到[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-test-evals)。首先，设置所需的环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY="your_langsmith_api_key"
export LANGSMITH_TRACING="true"
```

LangSmith 提供两种主要的运行评估方法：[pytest](/langsmith/pytest) 集成和 `evaluate` 函数。

<Accordion title="Use pytest integration">
  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import pytest
  from langsmith import testing as t
  from agentevals.trajectory.llm import create_trajectory_llm_as_judge, TRAJECTORY_ACCURACY_PROMPT

  trajectory_evaluator = create_trajectory_llm_as_judge(
      model="openai:o3-mini",
      prompt=TRAJECTORY_ACCURACY_PROMPT,
  )

  @pytest.mark.langsmith
  def test_trajectory_accuracy():
      result = agent.invoke({
          "messages": [HumanMessage(content="What's the weather in SF?")]
      })

      reference_trajectory = [
          HumanMessage(content="What's the weather in SF?"),
          AIMessage(content="", tool_calls=[
              {"id": "call_1", "name": "get_weather", "args": {"city": "SF"}},
          ]),
          ToolMessage(content="It's 75 degrees and sunny in SF.", tool_call_id="call_1"),
          AIMessage(content="The weather in SF is 75 degrees and sunny."),
      ]

      t.log_inputs({})
      t.log_outputs({"messages": result["messages"]})
      t.log_reference_outputs({"messages": reference_trajectory})

      trajectory_evaluator(
          outputs=result["messages"],
          reference_outputs=reference_trajectory
      )
  ```使用 pytest 运行评估：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pytest test_trajectory.py --langsmith-output
  ```
</Accordion>

<Accordion title="Use the evaluate function">
  创建一个 [LangSmith dataset](/langsmith/manage-datasets) 并使用 `evaluate` 函数。数据集必须具有以下架构：

  * **输入**：`{"messages": [...]}` 输入消息来呼叫代理。
  * **输出**：`{"messages": [...]}` 代理输出中的预期消息历史记录。对于轨迹评估，您可以选择仅保留辅助消息。

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client
  from agentevals.trajectory.llm import create_trajectory_llm_as_judge, TRAJECTORY_ACCURACY_PROMPT

  client = Client()

  trajectory_evaluator = create_trajectory_llm_as_judge(
      model="openai:o3-mini",
      prompt=TRAJECTORY_ACCURACY_PROMPT,
  )

  def run_agent(inputs):
      return agent.invoke(inputs)["messages"]

  experiment_results = client.evaluate(
      run_agent,
      data="your_dataset_name",
      evaluators=[trajectory_evaluator]
  )
  ```
</Accordion>

<Tip>
  要了解有关评估代理的更多信息，请参阅[LangSmith docs](/langsmith/pytest)。
</Tip>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/test/evals.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>