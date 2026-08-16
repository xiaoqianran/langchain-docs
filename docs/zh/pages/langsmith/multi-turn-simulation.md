<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to simulate multi-turn interactions | https://docs.langchain.com/langsmith/multi-turn-simulation -->

# 如何模拟多轮交互

具有对话界面的人工智能应用程序（例如聊天机器人）通过与用户的多次交互进行操作，也称为对话“回合”。在评估此类应用程序的性能时，诸如[building a dataset](/langsmith/evaluation-concepts#datasets)和定义[evaluators](/langsmith/evaluation-concepts#evaluators)等核心概念以及判断应用程序输出的指标仍然有用。但是，您可能还会发现在应用程序和用户之间运行“模拟”，然后评估这个动态创建的轨迹很有用。

这样做的一些优点是：

* 易于上手与对预先存在的轨迹的完整数据集进行评估
* 从初始查询到成功或不成功解决的端到端覆盖
* 能够检测应用程序多次迭代中的重复行为或上下文丢失

缺点是，由于您正在扩大评估表面积以包含多个转弯，因此与给定数据集的静态输入评估应用程序的单个输出相比，一致性较差。

![Multi turn trace](/langsmith/images/multi-turn-trace.png)本指南将向您展示如何模拟多轮交互并使用开源 [⟦T12⟧](https://github.com/langchain-ai/openevals) 包对其进行评估，其中包含预构建的评估器和其他用于评估 AI 应用程序的便捷资源。它还将使用 OpenAI 模型，尽管您也可以使用其他提供商。

## 设置

首先，确保安装了所需的依赖项：

<CodeGroup>

```bash Python
pip install -U langsmith openevals
```

```bash TypeScript
npm install langsmith openevals
```

</CodeGroup>

<Info>
如果您使用 `yarn` 作为包管理器，则还需要手动安装 `@langchain/core` 作为 `openevals` 的对等依赖项。一般来说，LangSmith 评估不需要这样做。
</Info>

并设置您的环境变量：

```bash
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="<Your LangSmith API key>"
export OPENAI_API_KEY="<Your OpenAI API key>"
```

## 运行模拟

开始时您需要两个主要组件：

* `app`：您的应用程序，或包装它的函数。必须接受一条聊天消息（带有“角色”和“内容”键的字典）作为输入参数和 `thread_id` 作为 kwarg。应该接受其他 kwargs，因为未来版本中可能会添加更多 kwargs。返回一条聊天消息作为输出，至少包含角色和内容键。
* `user`：模拟用户。在本指南中，我们将使用名为 `create_llm_simulated_user` 的导入预构建函数，该函数使用 LLM 生成用户响应，但您也可以 [create your own too](https://github.com/langchain-ai/openevals?tab=readme-ov-file#custom-simulated-users)。`openevals` 中的模拟器每回合都会从 `user` 将一条聊天消息传递到您的 `app`。因此，如果需要，您应该根据 `thread_id` 在内部有状态地跟踪当前历史记录。

下面是一个模拟多轮客户支持交互的示例。本指南使用一个简单的聊天应用程序，该应用程序包装了对 OpenAI 聊天完成 API 的单个调用，但是这是您调用应用程序或代理的地方。在此示例中，我们的模拟用户扮演一个特别激进的客户的角色：

<CodeGroup>

```python Python
from openevals.simulators import run_multiturn_simulation, create_llm_simulated_user
from openevals.types import ChatCompletionMessage
from langsmith.wrappers import wrap_openai
from openai import OpenAI

# Wrap OpenAI client for tracing
client = wrap_openai(OpenAI())
history = {}

# Your application logic
def app(inputs: ChatCompletionMessage, *, thread_id: str, **kwargs):
    if thread_id not in history:
        history[thread_id] = []
    history[thread_id].append(inputs)
    # inputs is a message object with role and content
    res = client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a patient and understanding customer service agent.",
            },
        ] + history[thread_id],
    )
    response_message = res.choices[0].message
    history[thread_id].append(response_message)
    return response_message

user = create_llm_simulated_user(
    system="You are an aggressive and hostile customer who wants a refund for their car.",
    model="openai:gpt-5.4-mini",
)

# Run the simulation directly with the new function
simulator_result = run_multiturn_simulation(
    app=app,
    user=user,
    max_turns=5,
)
print(simulator_result)
```

```typescript TypeScript
import { OpenAI } from "openai";
import { wrapOpenAI } from "langsmith/wrappers/openai";
import {
  createLLMSimulatedUser,
  runMultiturnSimulation,
  type ChatCompletionMessage,
} from "openevals";

// Wrap OpenAI client for tracing
const client = wrapOpenAI(new OpenAI());
const history = {};

// Your application logic
const app = async ({ inputs, threadId }: { inputs: ChatCompletionMessage, threadId: string }) => {
  if (history[threadId] === undefined) {
    history[threadId] = [];
  }
  history[threadId].push(inputs);
  const res = await client.chat.completions.create({
    model: "gpt-5.4-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a patient and understanding customer service agent.",
      },
      inputs,
    ],
  });
  const responseMessage = res.choices[0].message;
  history[threadId].push(responseMessage);
  return res.choices[0].message;
};

const user = createLLMSimulatedUser({
  system: "You are an aggressive and hostile customer who wants a refund for their car.",
  model: "openai:gpt-5.4-mini",
});

const result = await runMultiturnSimulation({
  app,
  user,
  maxTurns: 5,
});
console.log(result);
```

</CodeGroup>

响应如下所示：

```json
{
  "trajectory": [
    {
      "role": "user",
      "content": "This piece of junk car is a complete disaster! I demand a full refund immediately. How dare you sell me such a worthless vehicle!",
      "id": "chatcmpl-BUpXa07LaM7wXbyaNnng1Gtn5Dsbh"
    },
    {
      "role": "assistant",
      "content": "I'm really sorry to hear about your experience and understand how frustrating this must be. I'd like to help resolve this issue as smoothly as possible. Could you please provide some details about the problem with the vehicle? Once I have more information, I'll do my best to assist you with a solution, whether it's a refund or other options. Thank you for your patience.",
      "refusal": null,
      "annotations": [],
      "id": "d7520f6a-7cf8-46f8-abe4-7df04f134482"
    },
    "...",
    {
      "role": "assistant",
      "content": "I truly understand your frustration and sincerely apologize for the inconvenience you've experienced.\n\nPlease allow me a moment to review your case, and I will do everything I can to expedite your refund. Your patience is greatly appreciated, and I am committed to resolving this matter to your satisfaction.",
      "refusal": null,
      "annotations": [],
      "id": "a0536d4f-9353-4cfa-84df-51c8d29e076d"
    }
  ]
}
```

模拟首先从模拟的`user`生成初始查询，然后来回传递响应聊天消息，直到到达`max_turns`（您也可以传递一个`stopping_condition`，它采用当前轨迹并返回`True`或`False` - [see the OpenEvals README for more information](https://github.com/langchain-ai/openevals?tab=readme-ov-file#multiturn-simulation)）。返回值是构成对话**轨迹**的聊天消息的最终列表。

<Info>
有多种方法可以配置模拟用户，例如让它在模拟的第一轮以及整个模拟中返回固定响应。有关完整详细信息，请查看[the OpenEvals README](https://github.com/langchain-ai/openevals?tab=readme-ov-file#multiturn-simulation)。
</Info>最终的跟踪将看起来像 [like this](https://smith.langchain.com/public/648ca37d-1c4d-4f7b-9b6a-89e35dc5d4f0/r) ，其中包含 `app` 和 `user` 的响应交错：

![Multi turn trace](/langsmith/images/multi-turn-trace.png)

恭喜！您刚刚运行了第一次多回合模拟。接下来，我们将介绍如何在 LangSmith 实验中运行它。

## 运行LangSmith实验

您可以使用多轮模拟的结果作为 LangSmith 实验的一部分来跟踪一段时间内的性能和进度。对于这些部分，熟悉至少一个 LangSmith 的 [⟦T31⟧](/langsmith/pytest)（仅限 Python）、[⟦T32⟧/⟦T33⟧](/langsmith/vitest-jest)（仅限 JS）或 [⟦T34⟧](/langsmith/evaluate-llm-application) 运行器会有所帮助。

### 使用`pytest`或`Vitest/Jest`

<Check>
请参阅以下指南，了解如何使用 LangSmith 与测试框架的集成来设置评估：

* [⟦T37⟧](https://docs.smith.langchain.com/langsmith/pytest)
* [⟦T38⟧ or ⟦T39⟧](https://docs.smith.langchain.com/langsmith/vitest-jest)

</Check>

如果您使用 [LangSmith test framework integrations](/langsmith/pytest) 之一，则可以在运行模拟时将 OpenEvals 求值器数组作为 `trajectory_evaluators` 参数传递。这些评估器将在模拟结束时运行，将最终的聊天消息列表作为`outputs` kwarg。因此，您通过的`trajectory_evaluator`必须接受这个kwarg。

![Multi turn vitest](/langsmith/images/multi-turn-vitest.png)

这是一个例子：

<CodeGroup>

```python Python
from openevals.simulators import run_multiturn_simulation, create_llm_simulated_user
from openevals.llm import create_llm_as_judge
from openevals.types import ChatCompletionMessage
from langsmith import testing as t
from langsmith.wrappers import wrap_openai
from openai import OpenAI
import pytest

@pytest.mark.langsmith
def test_multiturn_message_with_openai():
    inputs = {"role": "user", "content": "I want a refund for my car!"}
    t.log_inputs(inputs)
    # Wrap OpenAI client for tracing
    client = wrap_openai(OpenAI())
    history = {}

    def app(inputs: ChatCompletionMessage, *, thread_id: str):
        if thread_id not in history:
            history[thread_id] = []
        history[thread_id] = history[thread_id] + [inputs]
        res = client.chat.completions.create(
            model="gpt-5.4-nano",
            messages=[
                {
                    "role": "system",
                    "content": "You are a patient and understanding customer service agent.",
                }
            ]
            + history[thread_id],
        )
        response = res.choices[0].message
        history[thread_id].append(response)
        return response

    user = create_llm_simulated_user(
        system="You are a nice customer who wants a refund for their car.",
        model="openai:gpt-5.4-nano",
        fixed_responses=[
            inputs,
        ],
    )
    trajectory_evaluator = create_llm_as_judge(
        model="openai:o3-mini",
        prompt="Based on the below conversation, was the user satisfied?\n{outputs}",
        feedback_key="satisfaction",
    )
    res = run_multiturn_simulation(
        app=app,
        user=user,
        trajectory_evaluators=[trajectory_evaluator],
        max_turns=5,
    )
    t.log_outputs(res)
    # Optionally, assert that the evaluator scored the interaction as satisfactory.
    # This will cause the overall test case to fail if "score" is False.
    assert res["evaluator_results"][0]["score"]
```

```typescript TypeScript
import { OpenAI } from "openai";
import { wrapOpenAI } from "langsmith/wrappers/openai";
import * as ls from "langsmith/vitest";
import { expect } from "vitest";
// import * as ls from "langsmith/jest";
// import { expect } from "@jest/globals";
import {
  createLLMSimulatedUser,
  runMultiturnSimulation,
  createLLMAsJudge,
  type ChatCompletionMessage,
} from "openevals";

const client = wrapOpenAI(new OpenAI());

ls.describe("Multiturn demo", () => {
  ls.test(
    "Should have a satisfactory interaction with a nice user",
    {
      inputs: {
        messages: [{ role: "user" as const, content: "I want a refund for my car!" }],
      },
    },
    async ({ inputs }) => {
      const history = {};
      // Create a custom app function
      const app = async (
        { inputs, threadId }: { inputs: ChatCompletionMessage, threadId: string }
      ) => {
        if (history[threadId] === undefined) {
          history[threadId] = [];
        }
        history[threadId].push(inputs);
        const res = await client.chat.completions.create({
          model: "gpt-5.4-nano",
          messages: [
            {
              role: "system",
              content:
                "You are a patient and understanding customer service agent",
            },
            inputs,
          ],
        });
        const responseMessage = res.choices[0].message;
        history[threadId].push(responseMessage);
        return responseMessage;
      };

      const user = createLLMSimulatedUser({
        system:
          "You are a nice customer who wants a refund for their car.",
        model: "openai:gpt-5.4-nano",
        fixedResponses: inputs.messages,
      });

      const trajectoryEvaluator = createLLMAsJudge({
        model: "openai:o3-mini",
        prompt:
          "Based on the below conversation, was the user satisfied?\n{outputs}",
        feedbackKey: "satisfaction",
      });

      const result = await runMultiturnSimulation({
        app,
        user,
        trajectoryEvaluators: [trajectoryEvaluator],
        maxTurns: 5,
      });

      ls.logOutputs(result);
      // Optionally, assert that the evaluator scored the interaction as satisfactory.
      // This will cause the overall test case to fail if "score" is false.
      expect(result.evaluatorResults[0].score).toBe(true);
    }
  );
});
```

</CodeGroup>LangSmith会自动检测并记录通过的`trajectory_evaluators`返回的反馈，并将其添加到实验中。另请注意，测试用例使用模拟用户上的 `fixed_responses` 参数来启动与特定输入的对话，您可以记录该输入并将其作为存储数据集的一部分。

您可能还会发现将模拟用户的系统提示作为记录数据集的一部分会很方便。

### 使用`evaluate`

您还可以使用 [⟦T46⟧](/langsmith/evaluate-llm-application) 运行器来评估模拟的多轮交互。这与 `pytest`/`Vitest`/`Jest` 示例在以下方面略有不同：

* 模拟应该是`target`函数的一部分，并且你的目标函数应该返回最终轨迹。
  * 这将使轨迹成为 `outputs`，LangSmith 将传递给您的评估者。
* 您应该将评估器作为参数传递到 `evaluate()` 方法中，而不是使用 `trajectory_evaluators` 参数。
* 您将需要现有的输入数据集和（可选）参考轨迹。

这是一个例子：

<CodeGroup>

```python Python
from openevals.simulators import run_multiturn_simulation, create_llm_simulated_user
from openevals.llm import create_llm_as_judge
from openevals.types import ChatCompletionMessage
from langsmith.wrappers import wrap_openai
from langsmith import Client
from openai import OpenAI

ls_client = Client()
examples = [
    {
        "inputs": {
            "messages": [{ "role": "user", "content": "I want a refund for my car!" }]
        },
    },
]
dataset = ls_client.create_dataset(dataset_name="multiturn-starter")
ls_client.create_examples(
    dataset_id=dataset.id,
    examples=examples,
)
trajectory_evaluator = create_llm_as_judge(
    model="openai:o3-mini",
    prompt="Based on the below conversation, was the user satisfied?\n{outputs}",
    feedback_key="satisfaction",
)

def target(inputs: dict):
    # Wrap OpenAI client for tracing
    client = wrap_openai(OpenAI())
    history = {}

    def app(next_message: ChatCompletionMessage, *, thread_id: str):
        if thread_id not in history:
            history[thread_id] = []
        history[thread_id] = history[thread_id] + [next_message]
        res = client.chat.completions.create(
            model="gpt-5.4-nano",
            messages=[
                {
                    "role": "system",
                    "content": "You are a patient and understanding customer service agent.",
                }
            ]
            + history[thread_id],
        )
        response = res.choices[0].message
        history[thread_id].append(response)
        return response

    user = create_llm_simulated_user(
        system="You are a nice customer who wants a refund for their car.",
        model="openai:gpt-5.4-nano",
        fixed_responses=inputs["messages"],
    )
    res = run_multiturn_simulation(
        app=app,
        user=user,
        max_turns=5,
    )
    return res["trajectory"]

results = ls_client.evaluate(
    target,
    data=dataset.name,
    evaluators=[trajectory_evaluator],
)
```

```typescript TypeScript
import { OpenAI } from "openai";
import { Client } from "langsmith";
import { wrapOpenAI } from "langsmith/wrappers/openai";
import { evaluate } from "langsmith/evaluation";
import {
  createLLMSimulatedUser,
  runMultiturnSimulation,
  createLLMAsJudge,
  type ChatCompletionMessage,
} from "openevals";

const lsClient = new Client();
const inputs = {
  messages: [
    {
      role: "user",
      content: "I want a refund for my car!",
    },
  ],
};
const datasetName = "Multiturn";
const dataset = await lsClient.createDataset(datasetName);
await lsClient.createExamples([{ inputs, dataset_id: dataset.id }]);

const trajectoryEvaluator = createLLMAsJudge({
  model: "openai:o3-mini",
  prompt:
    "Based on the below conversation, was the user satisfied?\n{outputs}",
  feedbackKey: "satisfaction",
});

const client = wrapOpenAI(new OpenAI());

const target = async (inputs: { messages: ChatCompletionMessage[]}) => {
  const history = {};
  // Create a custom app function
  const app = async (
    { inputs: nextMessage, threadId }: { inputs: ChatCompletionMessage, threadId: string }
  ) => {
    if (history[threadId] === undefined) {
      history[threadId] = [];
    }
    history[threadId].push(nextMessage);
    const res = await client.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: [
        {
          role: "system",
          content:
            "You are a patient and understanding customer service agent",
        },
        nextMessage,
      ],
    });
    const responseMessage = res.choices[0].message;
    history[threadId].push(responseMessage);
    return responseMessage;
  };

  const user = createLLMSimulatedUser({
    system:
      "You are a nice customer who wants a refund for their car.",
    model: "openai:gpt-5.4-nano",
    fixedResponses: inputs.messages,
  });

  const result = await runMultiturnSimulation({
    app,
    user,
    maxTurns: 5,
  });
  return result.trajectory;
};

await evaluate(target, {
  data: datasetName,
  evaluators: [trajectoryEvaluator],
});
```

</CodeGroup>

## 修改模拟用户角色上述示例对所有输入示例使用相同的模拟用户角色运行，由传递到 `create_llm_simulated_user` 的 `system` 参数定义。如果您想对数据集中的特定项目使用不同的角色，您可以更新数据集示例，使其还包含带有所需 `system` 提示的额外字段，然后在创建模拟用户时传递该字段，如下所示：

<CodeGroup>

```python Python
from openevals.simulators import run_multiturn_simulation, create_llm_simulated_user
from openevals.llm import create_llm_as_judge
from openevals.types import ChatCompletionMessage
from langsmith.wrappers import wrap_openai
from langsmith import Client
from openai import OpenAI

ls_client = Client()
examples = [
    {
        "inputs": {
            "messages": [{ "role": "user", "content": "I want a refund for my car!" }],
            "simulated_user_prompt": "You are an angry and belligerent customer who wants a refund for their car."
        },
    },
    {
        "inputs": {
            "messages": [{ "role": "user", "content": "Please give me a refund for my car." }],
            "simulated_user_prompt": "You are a nice customer who wants a refund for their car.",
        },
    }
]
dataset = ls_client.create_dataset(dataset_name="multiturn-with-personas")
ls_client.create_examples(
    dataset_id=dataset.id,
    examples=examples,
)
trajectory_evaluator = create_llm_as_judge(
    model="openai:o3-mini",
    prompt="Based on the below conversation, was the user satisfied?\n{outputs}",
    feedback_key="satisfaction",
)

def target(inputs: dict):
    # Wrap OpenAI client for tracing
    client = wrap_openai(OpenAI())
    history = {}

    def app(next_message: ChatCompletionMessage, *, thread_id: str):
        if thread_id not in history:
            history[thread_id] = []
        history[thread_id] = history[thread_id] + [next_message]
        res = client.chat.completions.create(
            model="gpt-5.4-nano",
            messages=[
                {
                    "role": "system",
                    "content": "You are a patient and understanding customer service agent.",
                }
            ]
            + history[thread_id],
        )
        response = res.choices[0].message
        history[thread_id].append(response)
        return response

    user = create_llm_simulated_user(
        system=inputs["simulated_user_prompt"],
        model="openai:gpt-5.4-nano",
        fixed_responses=inputs["messages"],
    )
    res = run_multiturn_simulation(
        app=app,
        user=user,
        max_turns=5,
    )
    return res["trajectory"]

results = ls_client.evaluate(
    target,
    data=dataset.name,
    evaluators=[trajectory_evaluator],
)
```

```typescript TypeScript
import { OpenAI } from "openai";
import { Client } from "langsmith";
import { wrapOpenAI } from "langsmith/wrappers/openai";
import { evaluate } from "langsmith/evaluation";
import {
  createLLMSimulatedUser,
  runMultiturnSimulation,
  createLLMAsJudge,
  type ChatCompletionMessage,
} from "openevals";

const lsClient = new Client();
const datasetName = "Multiturn with personas";
const dataset = await lsClient.createDataset(datasetName);
const examples = [{
  inputs: {
    messages: [
      {
        role: "user",
        content: "I want a refund for my car!",
      },
    ],
    simulated_user_prompt: "You are an angry and belligerent customer who wants a refund for their car.",
  },
  dataset_id: dataset.id,
}, {
  inputs: {
    messages: [
      {
        role: "user",
        content: "Please give me a refund for my car."
      }
    ],
    simulated_user_prompt: "You are a nice customer who wants a refund for their car.",
  },
  dataset_id: dataset.id,
}];
await lsClient.createExamples(examples);

const trajectoryEvaluator = createLLMAsJudge({
  model: "openai:o3-mini",
  prompt:
    "Based on the below conversation, was the user satisfied?\n{outputs}",
  feedbackKey: "satisfaction",
});

const client = wrapOpenAI(new OpenAI());

const target = async (inputs: {
  messages: ChatCompletionMessage[],
  simulated_user_prompt: string,
}) => {
  const history = {};
  // Create a custom app function
  const app = async (
    { inputs: nextMessage, threadId }: { inputs: ChatCompletionMessage, threadId: string }
  ) => {
    if (history[threadId] === undefined) {
      history[threadId] = [];
    }
    history[threadId].push(nextMessage);
    const res = await client.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: [
        {
          role: "system",
          content:
            "You are a patient and understanding customer service agent",
        },
        nextMessage,
      ],
    });
    const responseMessage = res.choices[0].message;
    history[threadId].push(responseMessage);
    return responseMessage;
  };

  const user = createLLMSimulatedUser({
    system: inputs.simulated_user_prompt,
    model: "openai:gpt-5.4-nano",
    fixedResponses: inputs.messages,
  });

  const result = await runMultiturnSimulation({
    app,
    user,
    maxTurns: 5,
  });
  return result.trajectory;
};

await evaluate(target, {
  data: datasetName,
  evaluators: [trajectoryEvaluator],
});
```

</CodeGroup>

## 后续步骤

您刚刚了解了一些模拟多轮交互并在 LangSmith 评估中运行它们的技术。

以下是您接下来可能想要探索的一些主题：

* [Trace multiturn conversations across different traces](/langsmith/threads)
* [Use multiple messages in the playground UI](/langsmith/multiple-messages)
* [Return multiple metrics in one evaluator](/langsmith/multiple-scores)

您还可以探索 [OpenEvals readme](https://github.com/langchain-ai/openevals) 了解有关预构建评估器的更多信息。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/multi-turn-simulation.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>