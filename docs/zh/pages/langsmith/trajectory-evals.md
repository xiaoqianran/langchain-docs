<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to evaluate your agent with trajectory evaluations | https://docs.langchain.com/langsmith/trajectory-evals -->

# 如何通过轨迹评估来评估你的智能体

许多代理行为只有在使用真正的 LLM 时才会出现，例如代理决定调用哪个工具、如何格式化响应，或者提示修改是否会影响整个执行轨迹。 LangChain的[⟦T13⟧](https://github.com/langchain-ai/agentevals)包提供了专门为使用实时模型测试智能体轨迹而设计的评估器。

<Note>
  本指南涵盖开源 [LangChain](/oss/python/langchain/overview) `agentevals` 软件包，该软件包与 LangSmith 集成以进行轨迹评估。
</Note>

AgentEvals 允许您通过执行“轨迹匹配”或使用“LLM 判断”来评估代理的轨迹（消息的确切序列，包括工具调用）：

<Card title="Trajectory match" icon="equal" href="#trajectory-match-evaluator">
  为给定输入硬编码参考轨迹，并通过逐步比较来验证运行。

  非常适合测试明确定义的工作流程，您知道预期的行为。当您对应调用哪些工具以及按什么顺序有特定期望时使用。这种方法具有确定性、快速且经济高效的特点，因为它不需要额外的 LLM 调用。
</Card><Card title="LLM-as-judge" icon="hammer" href="#llm-as-judge-evaluator">
  使用法学硕士来定性验证您的代理的执行轨迹。 “法官”法学硕士根据提示规则（可以包括参考轨迹）审查代理人的决定。

  更灵活，可以评估效率和适当性等细微差别，但需要法学硕士，并且确定性较差。当您想要评估代理轨迹的整体质量和合理性而无需严格的工具调用或订购要求时使用。
</Card>

## 安装 AgentEvals

<CodeGroup>
  ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install agentevals
  ```

  ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install agentevals @langchain/core
  ```
</CodeGroup>

或者直接克隆[AgentEvals repository](https://github.com/langchain-ai/agentevals)。

## 轨迹匹配评估器

AgentEvals 在 Python 中提供了 `create_trajectory_match_evaluator` 函数，在 TypeScript 中提供了 `createTrajectoryMatchEvaluator` 来将代理的轨迹与参考轨迹进行匹配。

您可以使用以下模式：|模式|描述 |使用案例|
| ---------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [⟦T17⟧](#strict-match) |消息和工具调用的顺序完全一致 |测试特定序列（例如，授权前的策略查找）|
| [⟦T18⟧](#unordered-match) |允许以任何顺序调用相同的工具 |当顺序无关紧要时验证信息检索 |
| [⟦T19⟧](#subset-and-superset-match) |代理仅调用参考工具（无额外功能）|确保代理不超出预期范围 |
| [⟦T20⟧](#subset-and-superset-match) |代理至少调用参考工具（允许额外）|验证已采取最低限度的必要措施 |

### 严格匹配`strict` 模式确保轨迹通过相同的工具调用以相同的顺序包含相同的消息，尽管它允许消息内容存在差异。当您需要强制执行特定的操作序列（例如在授权操作之前需要进行策略查找）时，这非常有用。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool
  from langchain.messages import HumanMessage, AIMessage, ToolMessage
  from agentevals.trajectory.match import create_trajectory_match_evaluator


  @tool
  def get_weather(city: str):
      """Get weather information for a city."""
      return f"It's 75 degrees and sunny in {city}."

  agent = create_agent("gpt-5.5", tools=[get_weather])

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

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, tool, HumanMessage, AIMessage, ToolMessage } from "langchain"
  import { createTrajectoryMatchEvaluator } from "agentevals";
  import * as z from "zod";

  const getWeather = tool(
    async ({ city }: { city: string }) => {
      return `It's 75 degrees and sunny in ${city}.`;
    },
    {
      name: "get_weather",
      description: "Get weather information for a city.",
      schema: z.object({
        city: z.string(),
      }),
    }
  );

  const agent = createAgent({
    model: "gpt-5.5",
    tools: [getWeather]
  });

  const evaluator = createTrajectoryMatchEvaluator({  // [!code highlight]
    trajectoryMatchMode: "strict",  // [!code highlight]
  });  // [!code highlight]

  async function testWeatherToolCalledStrict() {
    const result = await agent.invoke({
      messages: [new HumanMessage("What's the weather in San Francisco?")]
    });

    const referenceTrajectory = [
      new HumanMessage("What's the weather in San Francisco?"),
      new AIMessage({
        content: "",
        tool_calls: [
          { id: "call_1", name: "get_weather", args: { city: "San Francisco" } }
        ]
      }),
      new ToolMessage({
        content: "It's 75 degrees and sunny in San Francisco.",
        tool_call_id: "call_1"
      }),
      new AIMessage("The weather in San Francisco is 75 degrees and sunny."),
    ];

    const evaluation = await evaluator({
      outputs: result.messages,
      referenceOutputs: referenceTrajectory
    });
    // {
    //     'key': 'trajectory_strict_match',
    //     'score': true,
    //     'comment': null,
    // }
    expect(evaluation.score).toBe(true);
  }
  ```
</CodeGroup>

### 无序匹配

`unordered` 模式允许以任意顺序调用相同的工具，当您想要验证是否正在调用正确的工具集但不关心顺序时，这非常有用。例如，代理可能需要检查某个城市的天气和事件，但顺序并不重要。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool
  from langchain.messages import HumanMessage, AIMessage, ToolMessage
  from agentevals.trajectory.match import create_trajectory_match_evaluator


  @tool
  def get_weather(city: str):
      """Get weather information for a city."""
      return f"It's 75 degrees and sunny in {city}."

  @tool
  def get_events(city: str):
      """Get events happening in a city."""
      return f"Concert at the park in {city} tonight."

  agent = create_agent("gpt-5.5", tools=[get_weather, get_events])

  evaluator = create_trajectory_match_evaluator(  # [!code highlight]
      trajectory_match_mode="unordered",  # [!code highlight]
  )  # [!code highlight]

  def test_multiple_tools_any_order():
      result = agent.invoke({
          "messages": [HumanMessage(content="What's happening in SF today?")]
      })

      # Reference shows tools called in different order than actual execution
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
      # {
      #     'key': 'trajectory_unordered_match',
      #     'score': True,
      # }
      assert evaluation["score"] is True
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, tool, HumanMessage, AIMessage, ToolMessage } from "langchain"
  import { createTrajectoryMatchEvaluator } from "agentevals";
  import * as z from "zod";

  const getWeather = tool(
    async ({ city }: { city: string }) => {
      return `It's 75 degrees and sunny in ${city}.`;
    },
    {
      name: "get_weather",
      description: "Get weather information for a city.",
      schema: z.object({ city: z.string() }),
    }
  );

  const getEvents = tool(
    async ({ city }: { city: string }) => {
      return `Concert at the park in ${city} tonight.`;
    },
    {
      name: "get_events",
      description: "Get events happening in a city.",
      schema: z.object({ city: z.string() }),
    }
  );

  const agent = createAgent({
    model: "gpt-5.5",
    tools: [getWeather, getEvents]
  });

  const evaluator = createTrajectoryMatchEvaluator({  // [!code highlight]
    trajectoryMatchMode: "unordered",  // [!code highlight]
  });  // [!code highlight]

  async function testMultipleToolsAnyOrder() {
    const result = await agent.invoke({
      messages: [new HumanMessage("What's happening in SF today?")]
    });

    // Reference shows tools called in different order than actual execution
    const referenceTrajectory = [
      new HumanMessage("What's happening in SF today?"),
      new AIMessage({
        content: "",
        tool_calls: [
          { id: "call_1", name: "get_events", args: { city: "SF" } },
          { id: "call_2", name: "get_weather", args: { city: "SF" } },
        ]
      }),
      new ToolMessage({
        content: "Concert at the park in SF tonight.",
        tool_call_id: "call_1"
      }),
      new ToolMessage({
        content: "It's 75 degrees and sunny in SF.",
        tool_call_id: "call_2"
      }),
      new AIMessage("Today in SF: 75 degrees and sunny with a concert at the park tonight."),
    ];

    const evaluation = await evaluator({
      outputs: result.messages,
      referenceOutputs: referenceTrajectory,
    });
    // {
    //     'key': 'trajectory_unordered_match',
    //     'score': true,
    // }
    expect(evaluation.score).toBe(true);
  }
  ```
</CodeGroup>

### 子集和超集匹配

`superset` 和 `subset` 模式重点关注调用哪些工具而不是工具调用的顺序，从而允许您控制代理的工具调用必须与参考对齐的严格程度。* 当您想要验证执行中是否调用了一些关键工具，但您可以接受代理调用其他工具时，请使用`superset`模式。代理的轨迹必须至少包括参考轨迹中的所有工具调用，并且可以包括参考之外的其他工具调用。
* 使用`subset`模式通过验证代理没有调用参考中的工具之外的任何不相关或不必要的工具来确保代理效率。代理的轨迹必须仅包括参考轨迹中出现的工具调用。

以下示例演示了`superset`模式，其中参考轨迹仅需要`get_weather`工具，但代理可以调用其他工具：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool
  from langchain.messages import HumanMessage, AIMessage, ToolMessage
  from agentevals.trajectory.match import create_trajectory_match_evaluator


  @tool
  def get_weather(city: str):
      """Get weather information for a city."""
      return f"It's 75 degrees and sunny in {city}."

  @tool
  def get_detailed_forecast(city: str):
      """Get detailed weather forecast for a city."""
      return f"Detailed forecast for {city}: sunny all week."

  agent = create_agent("gpt-5.5", tools=[get_weather, get_detailed_forecast])

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
      # {
      #     'key': 'trajectory_superset_match',
      #     'score': True,
      #     'comment': None,
      # }
      assert evaluation["score"] is True
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain"
  import { tool } from "@langchain/core/tools";
  import { HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
  import { createTrajectoryMatchEvaluator } from "agentevals";
  import * as z from "zod";

  const getWeather = tool(
    async ({ city }: { city: string }) => {
      return `It's 75 degrees and sunny in ${city}.`;
    },
    {
      name: "get_weather",
      description: "Get weather information for a city.",
      schema: z.object({ city: z.string() }),
    }
  );

  const getDetailedForecast = tool(
    async ({ city }: { city: string }) => {
      return `Detailed forecast for ${city}: sunny all week.`;
    },
    {
      name: "get_detailed_forecast",
      description: "Get detailed weather forecast for a city.",
      schema: z.object({ city: z.string() }),
    }
  );

  const agent = createAgent({
    model: "gpt-5.5",
    tools: [getWeather, getDetailedForecast]
  });

  const evaluator = createTrajectoryMatchEvaluator({  // [!code highlight]
    trajectoryMatchMode: "superset",  // [!code highlight]
  });  // [!code highlight]

  async function testAgentCallsRequiredToolsPlusExtra() {
    const result = await agent.invoke({
      messages: [new HumanMessage("What's the weather in Boston?")]
    });

    // Reference only requires getWeather, but agent may call additional tools
    const referenceTrajectory = [
      new HumanMessage("What's the weather in Boston?"),
      new AIMessage({
        content: "",
        tool_calls: [
          { id: "call_1", name: "get_weather", args: { city: "Boston" } },
        ]
      }),
      new ToolMessage({
        content: "It's 75 degrees and sunny in Boston.",
        tool_call_id: "call_1"
      }),
      new AIMessage("The weather in Boston is 75 degrees and sunny."),
    ];

    const evaluation = await evaluator({
      outputs: result.messages,
      referenceOutputs: referenceTrajectory,
    });
    // {
    //     'key': 'trajectory_superset_match',
    //     'score': true,
    //     'comment': null,
    // }
    expect(evaluation.score).toBe(true);
  }
  ```
</CodeGroup>

<Info>
  您还可以通过设置 `tool_args_match_mode` (Python) 或 `toolArgsMatchMode` (TypeScript) 属性以及 `tool_args_match_overrides` (Python) 或 `toolArgsMatchOverrides` (TypeScript) 属性，自定义评估器如何考虑实际轨迹与参考中的工具调用之间的相等性。默认情况下，只有对同一工具具有相同参数的工具调用才被视为相等。请访问[repository](https://github.com/langchain-ai/agentevals?tab=readme-ov-file#tool-args-match-modes)了解更多详情。
</Info>

## 法学硕士作为法官评估员<Note>
  本节介绍 `agentevals` 包中特定于轨迹的 LLM-as-a-judge 评估器。对于 LangSmith 中的通用 LLM 作为法官评估器，请参阅[LLM-as-a-judge evaluator](/langsmith/llm-as-judge)。
</Note>

您还可以使用 LLM 来评估代理的执行路径。与轨迹匹配评估器不同，它不需要参考轨迹，但如果有的话可以提供。

### 无参考轨迹

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.tools import tool
  from langchain.messages import HumanMessage, AIMessage, ToolMessage
  from agentevals.trajectory.llm import create_trajectory_llm_as_judge, TRAJECTORY_ACCURACY_PROMPT


  @tool
  def get_weather(city: str):
      """Get weather information for a city."""
      return f"It's 75 degrees and sunny in {city}."

  agent = create_agent("gpt-5.5", tools=[get_weather])

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
      # {
      #     'key': 'trajectory_accuracy',
      #     'score': True,
      #     'comment': 'The provided agent trajectory is reasonable...'
      # }
      assert evaluation["score"] is True
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain"
  import { tool } from "@langchain/core/tools";
  import { HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
  import { createTrajectoryLLMAsJudge, TRAJECTORY_ACCURACY_PROMPT } from "agentevals";
  import * as z from "zod";

  const getWeather = tool(
    async ({ city }: { city: string }) => {
      return `It's 75 degrees and sunny in ${city}.`;
    },
    {
      name: "get_weather",
      description: "Get weather information for a city.",
      schema: z.object({ city: z.string() }),
    }
  );

  const agent = createAgent({
    model: "gpt-5.5",
    tools: [getWeather]
  });

  const evaluator = createTrajectoryLLMAsJudge({  // [!code highlight]
    model: "openai:o3-mini",  // [!code highlight]
    prompt: TRAJECTORY_ACCURACY_PROMPT,  // [!code highlight]
  });  // [!code highlight]

  async function testTrajectoryQuality() {
    const result = await agent.invoke({
      messages: [new HumanMessage("What's the weather in Seattle?")]
    });

    const evaluation = await evaluator({
      outputs: result.messages,
    });
    // {
    //     'key': 'trajectory_accuracy',
    //     'score': true,
    //     'comment': 'The provided agent trajectory is reasonable...'
    // }
    expect(evaluation.score).toBe(true);
  }
  ```
</CodeGroup>

### 有参考轨迹

如果您有参考轨迹，则可以在提示中添加额外的变量并传入参考轨迹。下面，我们使用预构建的 `TRAJECTORY_ACCURACY_PROMPT_WITH_REFERENCE` 提示符并配置 `reference_outputs` 变量：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  evaluator = create_trajectory_llm_as_judge(
      model="openai:o3-mini",
      prompt=TRAJECTORY_ACCURACY_PROMPT_WITH_REFERENCE,
  )
  evaluation = evaluator(
      outputs=result["messages"],
      reference_outputs=reference_trajectory,
  )
  ```

  ```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { TRAJECTORY_ACCURACY_PROMPT_WITH_REFERENCE } from "agentevals";

  const evaluator = createTrajectoryLLMAsJudge({
    model: "openai:o3-mini",
    prompt: TRAJECTORY_ACCURACY_PROMPT_WITH_REFERENCE,
  });

  const evaluation = await evaluator({
    outputs: result.messages,
    referenceOutputs: referenceTrajectory,
  });
  ```
</CodeGroup>

<Info>
  有关 LLM 如何评估轨迹的更多可配置性，请访问[repository](https://github.com/langchain-ai/agentevals?tab=readme-ov-file#trajectory-llm-as-judge)。
</Info>

## 异步支持 (Python)

所有 `agentevals` 评估器都支持 Python asyncio。对于使用工厂函数的评估器，可以通过在函数名称中的 `create_` 之后添加 `async` 来使用异步版本。

这是使用异步判断器和评估器的示例：

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

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trajectory-evals.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>