<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Agent Evals | https://docs.langchain.com/oss/javascript/langchain/test/evals -->

# 代理评估

使用确定性匹配或 LLM-as-judge 评估器以及 AgentEvals 和 LangSmith 来评估代理轨迹。

评估（“evals”）通过评估代理的执行轨迹、消息序列和它生成的工具调用来衡量代理的执行情况。与验证基本正确性的[integration tests](/oss/javascript/langchain/test/integration-testing)不同，评估根据参考或评分标准对代理行为进行评分，这使得它们在您更改提示、工具或模型时可用于捕获回归。

评估器是一个函数，它获取代理输出（以及可选的参考输出）并返回分数：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function evaluator({ outputs, referenceOutputs }: {
  outputs: Record<string, any>;
  referenceOutputs: Record<string, any>;
}) {
  const outputMessages = outputs.messages;
  const referenceMessages = referenceOutputs.messages;
  const score = compareMessages(outputMessages, referenceMessages);
  return { key: "evaluator_score", score: score };
}
```

[⟦T12⟧](https://github.com/langchain-ai/agentevals) 包提供了针对代理轨迹的预构建评估器。您可以通过执行**轨迹匹配**（确定性比较）或使用**LLM法官**（定性评估）来进行评估：|方法|何时使用 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [Trajectory match](#trajectory-match-evaluator) |您知道预期的工具调用并希望进行快速、确定性、免费的检查 |
| [LLM-as-judge](#llm-as-judge-evaluator) |您想要在没有严格期望的情况下评估整体质量和推理 |

## 安装 AgentEvals

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install agentevals @langchain/core
```

或者直接克隆[AgentEvals repository](https://github.com/langchain-ai/agentevals)。

## 轨迹匹配评估器

AgentEvals 提供 `createTrajectoryMatchEvaluator` 函数来将代理的轨迹与参考进行匹配。有四种模式：|模式|描述 |使用案例 |
| ----------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `strict` |消息结构和工具调用以相同顺序精确匹配（消息内容可以不同）|测试特定序列（例如，授权前的策略查找）|
| `unordered` |与参考相同的消息结构和工具调用，但工具调用可以按任何顺序发生 |当顺序无关紧要时验证信息检索 |
| `subset` |代理仅调用参考工具（无额外功能）|确保代理不超出预期范围 |
| `superset` |代理至少调用参考工具（允许额外）|验证已采取最低限度的必要措施 |

下面的示例共享一个通用设置，即带有 `get_weather` 工具的代理：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";
import { tool } from "@langchain/core/tools";
import { HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { createTrajectoryMatchEvaluator } from "agentevals";
import * as z from "zod";

const getWeather = tool(
  async ({ city }) => {
    return `It's 75 degrees and sunny in ${city}.`;
  },
  {
    name: "get_weather",
    description: "Get weather information for a city.",
    schema: z.object({ city: z.string() }),
  }
);

const agent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [getWeather],
});
```<Accordion title="Strict match">
  `strict` 模式确保轨迹通过相同的工具调用以相同的顺序包含相同的消息，尽管它允许消息内容存在差异。当您需要强制执行特定的操作序列（例如在授权操作之前需要进行策略查找）时，这非常有用。

  ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
    expect(evaluation.score).toBe(true);
  }
  ```
</Accordion>

<Accordion title="Unordered match">
  `unordered` 模式允许以任意顺序调用相同的工具。当您想要验证是否检索到特定信息但不关心顺序时，这非常有用。例如，使用不同工具调用检查城市天气和事件的代理。

  ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
    model: "claude-sonnet-4-6",
    tools: [getWeather, getEvents],
  });

  const evaluator = createTrajectoryMatchEvaluator({  // [!code highlight]
    trajectoryMatchMode: "unordered",  // [!code highlight]
  });  // [!code highlight]

  async function testMultipleToolsAnyOrder() {
    const result = await agent.invoke({
      messages: [new HumanMessage("What's happening in SF today?")]
    });

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
    expect(evaluation.score).toBe(true);
  }
  ```
</Accordion>

<Accordion title="Subset and superset match">
  `superset` 和 `subset` 模式匹配部分轨迹。 `superset` 模式验证代理是否至少调用了参考轨迹中的工具，从而允许调用其他工具。 `subset` 模式确保代理不会调用参考中的工具之外的任何工具。

  ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
    model: "claude-sonnet-4-6",
    tools: [getWeather, getDetailedForecast],
  });

  const evaluator = createTrajectoryMatchEvaluator({  // [!code highlight]
    trajectoryMatchMode: "superset",  // [!code highlight]
  });  // [!code highlight]

  async function testAgentCallsRequiredToolsPlusExtra() {
    const result = await agent.invoke({
      messages: [new HumanMessage("What's the weather in Boston?")]
    });

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
    expect(evaluation.score).toBe(true);
  }
  ```
</Accordion><Info>
  您还可以设置 `toolArgsMatchMode` 属性和/或 `toolArgsMatchOverrides` 来自定义评估器如何考虑实际轨迹与参考轨迹中的工具调用之间的相等性。默认情况下，只有对同一工具具有相同参数的工具调用才被视为相等。请访问[repository](https://github.com/langchain-ai/agentevals?tab=readme-ov-file#tool-args-match-modes)了解更多详情。
</Info>

## 法学硕士作为法官评估员

您可以使用 LLM 通过 `createTrajectoryLLMAsJudge` 函数评估代理的执行路径。与轨迹匹配评估器不同，它不需要参考轨迹，但如果有的话可以提供。

<Accordion title="Without reference trajectory">
  ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createTrajectoryLLMAsJudge, TRAJECTORY_ACCURACY_PROMPT } from "agentevals";

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
    expect(evaluation.score).toBe(true);
  }
  ```
</Accordion>

<Accordion title="With reference trajectory">
  如果您有参考轨迹，请使用预先构建的 `TRAJECTORY_ACCURACY_PROMPT_WITH_REFERENCE` 提示：

  ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createTrajectoryLLMAsJudge, TRAJECTORY_ACCURACY_PROMPT_WITH_REFERENCE } from "agentevals";

  const evaluator = createTrajectoryLLMAsJudge({
    model: "openai:o3-mini",
    prompt: TRAJECTORY_ACCURACY_PROMPT_WITH_REFERENCE,
  });

  const evaluation = await evaluator({
    outputs: result.messages,
    referenceOutputs: referenceTrajectory,
  });
  ```
</Accordion>

<Info>
  有关 LLM 如何评估轨迹的更多可配置性，请访问 [repository](https://github.com/langchain-ai/agentevals?tab=readme-ov-file#trajectory-llm-as-judge)。
</Info>

## 在 LangSmith 中运行评估

为了随着时间的推移跟踪实验，请将评估器结果记录到[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-test-evals)。首先，设置所需的环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY="your_langsmith_api_key"
export LANGSMITH_TRACING="true"
```

LangSmith 提供了两种主要的运行评估方法：[Vitest/Jest](/langsmith/vitest-jest) 集成和`evaluate` 函数。

<Accordion title="Use vitest/jest integration">
  ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as ls from "langsmith/vitest";
  // import * as ls from "langsmith/jest";

  import { createTrajectoryLLMAsJudge, TRAJECTORY_ACCURACY_PROMPT } from "agentevals";

  const trajectoryEvaluator = createTrajectoryLLMAsJudge({
    model: "openai:o3-mini",
    prompt: TRAJECTORY_ACCURACY_PROMPT,
  });

  ls.describe("trajectory accuracy", () => {
    ls.test("accurate trajectory", {
      inputs: {
        messages: [
          { role: "user", content: "What is the weather in SF?" }
        ]
      },
      referenceOutputs: {
        messages: [
          new HumanMessage("What is the weather in SF?"),
          new AIMessage({
            content: "",
            tool_calls: [
              { id: "call_1", name: "get_weather", args: { city: "SF" } }
            ]
          }),
          new ToolMessage({
            content: "It's 75 degrees and sunny in SF.",
            tool_call_id: "call_1"
          }),
          new AIMessage("The weather in SF is 75 degrees and sunny."),
        ],
      },
    }, async ({ inputs, referenceOutputs }) => {
      const result = await agent.invoke({
        messages: [new HumanMessage("What is the weather in SF?")]
      });

      ls.logOutputs({ messages: result.messages });

      await trajectoryEvaluator({
        inputs,
        outputs: result.messages,
        referenceOutputs,
      });
    });
  });
  ```

  使用您的测试运行程序运行评估：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  vitest run test_trajectory.eval.ts
  # or
  jest test_trajectory.eval.ts
  ```
</Accordion>

<Accordion title="Use the evaluate function">
  创建一个 [LangSmith dataset](/langsmith/manage-datasets) 并使用 `evaluate` 函数。数据集必须具有以下架构：* **输入**：`{"messages": [...]}` 输入消息来呼叫代理。
  * **输出**：`{"messages": [...]}` 代理输出中的预期消息历史记录。对于轨迹评估，您可以选择仅保留辅助消息。

  ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { evaluate } from "langsmith/evaluation";
  import { createTrajectoryLLMAsJudge, TRAJECTORY_ACCURACY_PROMPT } from "agentevals";

  const trajectoryEvaluator = createTrajectoryLLMAsJudge({
    model: "openai:o3-mini",
    prompt: TRAJECTORY_ACCURACY_PROMPT,
  });

  async function runAgent(inputs: any) {
    const result = await agent.invoke(inputs);
    return result.messages;
  }

  await evaluate(
    runAgent,
    {
      data: "your_dataset_name",
      evaluators: [trajectoryEvaluator],
    }
  );
  ```
</Accordion>

<Tip>
  要了解有关评估代理的更多信息，请参阅[LangSmith docs](/langsmith/vitest-jest)。
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