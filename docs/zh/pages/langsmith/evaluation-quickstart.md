<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Evaluation quickstart | https://docs.langchain.com/langsmith/evaluation-quickstart -->

# 评估快速入门

[_Evaluations_](/langsmith/evaluation-concepts)是衡量LLM申请表现的定量方法。法学硕士的行为可能难以预测，即使提示、模型或输入的微小变化也会显着影响结果。评估提供了一种结构化的方法来识别故障、比较版本和构建更可靠的人工智能应用程序。

在 LangSmith 中运行评估需要三个关键组件：

- [_Dataset_](/langsmith/evaluation-concepts#datasets)：一组测试输入（以及可选的预期输出）。
- [_Target function_](/langsmith/define-target-function)：您想要测试的应用程序部分 - 这可能是带有新提示的单个 LLM 调用、一个模块或您的整个工作流程。
- [_Evaluators_](/langsmith/evaluation-concepts#evaluators)：对目标函数的输出进行评分的函数。

本快速入门将指导您使用 LangSmith SDK 或 UI 运行入门评估，检查 LLM 响应的正确性。

## 先决条件

在开始之前，请确保您拥有：

- **LangSmith帐户**：在[smith.langchain.com](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-evaluation-quickstart)注册或登录。
- **A LangSmith API 密钥**：遵循 [Create an API key](/langsmith/create-account-api-key) 指南。
- **OpenAI API 密钥**：从 [OpenAI dashboard](https://platform.openai.com/account/api-keys) 生成此密钥。

**选择 UI 或 SDK 过滤器以获取说明：**

<Tabs>
<Tab title="UI" icon="window">

## 1. 设置工作区机密

在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=snippets-langsmith-set-workspace-secrets) 中，确保您的 API 密钥设置为 [workspace secret](/langsmith/set-up-hierarchy#configure-workspace-settings)。1. 导航至 <Icon icon="settings" /> **设置**，然后移至 **秘密** 选项卡。
1. 选择 **添加密钥** 并输入密钥环境变量（例如，`OPENAI_API_KEY` 或 `ANTHROPIC_API_KEY`）以及您的 API 密钥作为 **值**。
1. 选择**保存机密**。

<Note> 在 LangSmith UI 中添加工作区密钥时，请确保密钥与模型提供程序期望的环境变量名称匹配。</Note>

<Note>如果您的提供商使用 OAuth2 `client_credentials` 进行身份验证，请改为在模型配置上配置凭据。在这种情况下，不需要工作空间机密。参见[OAuth client credentials](/langsmith/model-configurations#oauth-client-credentials)。</Note>

## 2. 创建提示

[Playground](/langsmith/prompt-engineering-concepts#playground) 可以对不同的提示、新模型进行评估，或测试不同的模型配置。

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-evaluation-quickstart)中，点击侧边栏中的**Playground**。
1. 在 **Prompts** 面板下，将 **system** 提示符修改为：

    ```
    Answer the following question accurately:
    ```

    保留 **Human** 消息不变：`{question}`。

## 3. 创建数据集

1. 单击**设置评估**，这将在页面底部打开**新实验**表。
1. 在 **选择或创建新数据集** 下拉列表中，单击 **+ 新建** 按钮以创建新数据集。

    <div style={{ textAlign: 'center' }}>
    <img
        className="block dark:hidden"
        src="/langsmith/images/playground-system-prompt-light.png"
        alt="Playground with the edited system prompt and new experiment with the dropdown for creating a new dataset."
    />

    <img
        className="hidden dark:block"
        src="/langsmith/images/playground-system-prompt-dark.png"
        alt="Playground with the edited system prompt and new experiment with the dropdown for creating a new dataset."
    />
    </div>1. 将以下示例添加到数据集中：

    |输入|参考输出|
    | -------------------------------------------------------------------- | ------------------------------------------------- |
    |问：乞力马扎罗山位于哪个国家？ |输出：乞力马扎罗山位于坦桑尼亚。 |
    |问题：地球的最低点是哪里？                  |输出：地球的最低点是死海。     |

1. 单击“**保存**”并输入名称以保存新创建的数据集。

## 4. 添加评估者

1. 单击 **+ Evaluator** 并从 **Prebuilt Evaluator** 选项中选择 **正确性**。
1. 在 **正确性** 面板中，单击 **保存**。

## 5. 运行您的评估

1. 选择右上角的<Icon icon="player-play" /> **开始** 运行评估。这将创建一个 [_experiment_](/langsmith/evaluation-concepts#experiment)，并在 **新实验** 表中进行预览。您可以通过单击实验名称来查看完整内容。

    <div style={{ textAlign: 'center' }}>
    <img
        className="block dark:hidden"
        src="/langsmith/images/full-experiment-view-light.png"
        alt="Full experiment view of the results that used the example dataset."
    />

    <img
        className="hidden dark:block"
        src="/langsmith/images/full-experiment-view-dark.png"
        alt="Full experiment view of the results that used the example dataset."
    />
    </div>

## 后续步骤

<Tip>
要了解有关在LangSmith中运行实验的更多信息，请阅读[evaluation conceptual guide](/langsmith/evaluation-concepts)。
</Tip>- 有关评估的更多详细信息，请参阅[Evaluation documentation](/langsmith/evaluation)。
- 了解如何[create and manage datasets in the UI](/langsmith/manage-datasets-in-application#create-a-dataset-and-add-examples)。
- 了解如何[run an evaluation from the Playground](/langsmith/run-evaluation-from-playground)。

</Tab>

<Tab title="SDK" icon="code">

<Tip>
本指南使用开源 [⟦T22⟧](https://github.com/langchain-ai/openevals) 包中预构建的 LLM 作为法官评估器。 OpenEvals 包含一组常用的评估器，如果您是评估新手，那么这是一个很好的起点。如果您希望更灵活地评估应用程序，您也可以[define completely custom evaluators](/langsmith/code-evaluator-ui)。
</Tip>

## 1.安装依赖

在终端中，为您的项目创建一个目录并在您的环境中安装依赖项：

<CodeGroup>

```bash Python
mkdir ls-evaluation-quickstart && cd ls-evaluation-quickstart
python -m venv .venv && source .venv/bin/activate
python -m pip install --upgrade pip
pip install -U langsmith openevals openai
```

```bash TypeScript
mkdir ls-evaluation-quickstart-ts && cd ls-evaluation-quickstart-ts
npm init -y
npm install langsmith openevals openai
npx tsc --init
```

</CodeGroup>

<Info>
如果您使用 `yarn` 作为包管理器，您还需要手动安装 `@langchain/core` 作为 `openevals` 的对等依赖项。一般来说，这对于 LangSmith 评估不是必需的，您可以定义评估器 [using arbitrary custom code](/langsmith/code-evaluator-ui)。
</Info>

## 2.设置环境变量

设置以下环境变量：

- `LANGSMITH_TRACING`
- `LANGSMITH_API_KEY`
- `OPENAI_API_KEY`（或您的 LLM 提供商的 API 密钥）
- （可选）`LANGSMITH_WORKSPACE_ID`：如果您的LangSmith API 密钥链接到多个[workspaces](/langsmith/administration-overview#workspaces)，请设置此变量以指定要使用的工作区。

``` bash
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY="<your-langsmith-api-key>"
export OPENAI_API_KEY="<your-openai-api-key>"
export LANGSMITH_WORKSPACE_ID="<your-workspace-id>"
```
<Note>
如果您使用 Anthropic，请使用 [Anthropic wrapper](/langsmith/trace-anthropic) 来跟踪您的呼叫。对于其他提供商，请使用[the traceable wrapper](/langsmith/annotate-code#use-%40traceable-%2F-traceable)。
</Note>

## 3. 创建数据集1. 创建一个文件并添加以下代码，该代码将：

    - 导入`Client`以连接到LangSmith。
    - 创建数据集。
    - 定义示例[_inputs_ and _outputs_](/langsmith/evaluation-concepts#examples)。
    - 将输入和输出对与LangSmith中的数据集相关联，以便它们可以用于评估。

    <CodeGroup>

    ```python Python
    # dataset.py
    from langsmith import Client

    def main():
        client = Client()

        # Programmatically create a dataset in LangSmith
        dataset = client.create_dataset(
            dataset_name="Sample dataset",
            description="A sample dataset in LangSmith."
        )

        # Create examples
        examples = [
            {
                "inputs": {"question": "Which country is Mount Kilimanjaro located in?"},
                "outputs": {"answer": "Mount Kilimanjaro is located in Tanzania."},
            },
            {
                "inputs": {"question": "What is Earth's lowest point?"},
                "outputs": {"answer": "Earth's lowest point is The Dead Sea."},
            },
        ]

        # Add examples to the dataset
        client.create_examples(dataset_id=dataset.id, examples=examples)
        print("Created dataset:", dataset.name)

    if __name__ == "__main__":
        main()

    ```

    ```typescript TypeScript
    // dataset.ts
    import { Client } from "langsmith";

    async function main() {
    const client = new Client();

    const dataset = await client.createDataset(
        "Sample dataset",
        { description: "A sample dataset in LangSmith." }
    );

    // Define examples
    const inputs = [
        { question: "Which country is Mount Kilimanjaro located in?" },
        { question: "What is Earth's lowest point?" },
    ];
    const outputs = [
        { answer: "Mount Kilimanjaro is located in Tanzania." },
        { answer: "Earth's lowest point is The Dead Sea." },
    ];

    await client.createExamples({
        datasetId: dataset.id,
        inputs,
        outputs,
    });

    console.log("Created dataset:", dataset.name);
    }

    if (require.main === module) {
    main().catch((e) => {
        console.error(e);
        process.exit(1);
    });
    }
    ```

    </CodeGroup>

1. 在您的终端中，运行 `dataset` 文件来创建用于评估应用程序的数据集：

    <CodeGroup>
    ```bash Python
    python dataset.py
    ```
    ```bash TypeScript
    npx ts-node dataset.ts
    ```

    </CodeGroup>

    您将看到以下输出：

    ```bash
    Created dataset: Sample dataset
    ```

## 4. 创建目标函数

定义一个包含您正在评估的内容的[target function](/langsmith/define-target-function)。在本指南中，您将定义一个目标函数，其中包含单个 LLM 调用来回答问题。

将以下内容添加到 `eval` 文件中：

<CodeGroup>

```python Python
# eval.py
from langsmith import Client, wrappers
from openai import OpenAI

# Wrap the OpenAI client for LangSmith tracing
openai_client = wrappers.wrap_openai(OpenAI())

# Define the application logic you want to evaluate inside a target function
# The SDK will automatically send the inputs from the dataset to your target function
def target(inputs: dict) -> dict:
    response = openai_client.chat.completions.create(
        model="gpt-5-mini",
        messages=[
            {"role": "system", "content": "Answer the following question accurately"},
            {"role": "user", "content": inputs["question"]},
        ],
    )
    return {"answer": response.choices[0].message.content.strip()}
```

```typescript TypeScript
// eval.ts
import { evaluate } from "langsmith/evaluation";
import { wrapOpenAI } from "langsmith/wrappers/openai";
import OpenAI from "openai";

const openaiClient = wrapOpenAI(new OpenAI());

async function target(inputs: Record<string, any>): Promise<Record<string, any>> {
  const question = String(inputs.question ?? "");
  const resp = await openaiClient.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: "Answer the following question accurately" },
      { role: "user", content: question },
    ],
  });
  return { answer: resp.choices[0].message.content?.trim() ?? "" };
}
```

</CodeGroup>


## 5. 定义评估器

在此步骤中，您将告诉 LangSmith 如何对您的应用程序生成的答案进行评分。

从 [⟦T34⟧](https://github.com/langchain-ai/openevals) 导入预构建的评估提示 (`CORRECTNESS_PROMPT`) 以及将其包装到 [_LLM-as-judge evaluator_](/langsmith/evaluation-concepts#llm-as-judge) 中的帮助程序，这将对应用程序的输出进行评分。

<Info>
`CORRECTNESS_PROMPT` 只是一个带有 `"inputs"`、`"outputs"` 和 `"reference_outputs"` 变量的 f 字符串。请参阅[customizing OpenEvals prompts](https://github.com/langchain-ai/openevals#customizing-prompts)了解更多信息。
</Info>

评估者比较：- `inputs`：传递到目标函数中的内容（例如问题文本）。
- `outputs`：目标函数返回的内容（例如模型的答案）。
- `reference_outputs`：您附加到[Step 3](#3-create-a-dataset)中每个数据集示例的基本事实答案。

将以下突出显示的代码添加到您的 `eval` 文件中：

<CodeGroup>

```python Python highlight={3,4,21-31}
from langsmith import Client, wrappers
from openai import OpenAI
from openevals.llm import create_llm_as_judge
from openevals.prompts import CORRECTNESS_PROMPT

# Wrap the OpenAI client for LangSmith tracing
openai_client = wrappers.wrap_openai(OpenAI())

# Define the application logic you want to evaluate inside a target function
# The SDK will automatically send the inputs from the dataset to your target function
def target(inputs: dict) -> dict:
    response = openai_client.chat.completions.create(
        model="gpt-5-mini",
        messages=[
            {"role": "system", "content": "Answer the following question accurately"},
            {"role": "user", "content": inputs["question"]},
        ],
    )
    return {"answer": response.choices[0].message.content.strip()}

def correctness_evaluator(inputs: dict, outputs: dict, reference_outputs: dict):
    evaluator = create_llm_as_judge(
        prompt=CORRECTNESS_PROMPT,
        model="openai:o3-mini",
        feedback_key="correctness",
    )
    return evaluator(
        inputs=inputs,
        outputs=outputs,
        reference_outputs=reference_outputs
    )
```

```typescript TypeScript highlight={4,20-37}
import { evaluate } from "langsmith/evaluation";
import { wrapOpenAI } from "langsmith/wrappers/openai";
import OpenAI from "openai";
import { createLLMAsJudge, CORRECTNESS_PROMPT } from "openevals";

const openaiClient = wrapOpenAI(new OpenAI());

async function target(inputs: Record<string, any>): Promise<Record<string, any>> {
  const question = String(inputs.question ?? "");
  const resp = await openaiClient.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: "Answer the following question accurately" },
      { role: "user", content: question },
    ],
  });
  return { answer: resp.choices[0].message.content?.trim() ?? "" };
}

const judge = createLLMAsJudge({
  prompt: CORRECTNESS_PROMPT,
  model: "openai:o3-mini",
  feedbackKey: "correctness",
});

async function correctnessEvaluator(run: {
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  referenceOutputs?: Record<string, any>;
}) {
  return judge({
    inputs: run.inputs,
    outputs: run.outputs,
    // OpenEvals expects snake_case here:
    reference_outputs: run.referenceOutputs,
  });
}
```

</CodeGroup>

## 6.运行并查看结果

要运行评估实验，您将调用 `evaluate(...)`，其中：

- 从您在 [Step 3](#3-create-a-dataset) 中创建的数据集中提取示例。
- 将每个示例的输入从 [Step 4](#4-add-an-evaluator) 发送到您的目标函数。
- 收集输出（模型的答案）。
- 将输出连同 `reference_outputs` 从 [Step 5](#5-define-an-evaluator) 传递给您的评估器。
- 将LangSmith中的所有结果记录为实验，以便您可以在UI中查看它们。

1. 将突出显示的代码添加到您的 `eval` 文件中：

    <CodeGroup>

    ```python Python highlight={33-49}
    from langsmith import Client, wrappers
    from openai import OpenAI
    from openevals.llm import create_llm_as_judge
    from openevals.prompts import CORRECTNESS_PROMPT

    # Wrap the OpenAI client for LangSmith tracing
    openai_client = wrappers.wrap_openai(OpenAI())

    # Define the application logic you want to evaluate inside a target function
    # The SDK will automatically send the inputs from the dataset to your target function
    def target(inputs: dict) -> dict:
        response = openai_client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": "Answer the following question accurately"},
                {"role": "user", "content": inputs["question"]},
            ],
        )
        return {"answer": response.choices[0].message.content.strip()}

    def correctness_evaluator(inputs: dict, outputs: dict, reference_outputs: dict):
        evaluator = create_llm_as_judge(
            prompt=CORRECTNESS_PROMPT,
            model="openai:o3-mini",
            feedback_key="correctness",
        )
        return evaluator(
            inputs=inputs,
            outputs=outputs,
            reference_outputs=reference_outputs
        )

    # After running the evaluation, a link will be provided to view the results in langsmith
    def main():
        client = Client()
        experiment_results = client.evaluate(
            target,
            data="Sample dataset",
            evaluators=[
                correctness_evaluator,
                # can add multiple evaluators here
            ],
            experiment_prefix="first-eval-in-langsmith",
            max_concurrency=2,
        )
        print(experiment_results)

    if __name__ == "__main__":
        main()
    ```

    ```typescript TypeScript highlight={39-57}
    import { evaluate } from "langsmith/evaluation";
    import { wrapOpenAI } from "langsmith/wrappers/openai";   // helper to wrap OpenAI client
    import OpenAI from "openai";                              // model provider
    import { createLLMAsJudge, CORRECTNESS_PROMPT } from "openevals"; // evaluator tools

    const openaiClient = wrapOpenAI(new OpenAI());

    async function target(inputs: Record<string, any>): Promise<Record<string, any>> {
    const question = String(inputs.question ?? "");
    const resp = await openaiClient.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
        { role: "system", content: "Answer the following question accurately" },
        { role: "user", content: question },
        ],
    });
    return { answer: resp.choices[0].message.content?.trim() ?? "" };
    }

    const judge = createLLMAsJudge({
    prompt: CORRECTNESS_PROMPT,
    model: "openai:o3-mini",
    feedbackKey: "correctness",
    });

    async function correctnessEvaluator(run: {
    inputs: Record<string, any>;
    outputs: Record<string, any>;
    referenceOutputs?: Record<string, any>;
    }) {
    return judge({
        inputs: run.inputs,
        outputs: run.outputs,
        // OpenEvals expects snake_case here:
        reference_outputs: run.referenceOutputs,
    });
    }

    async function main() {
    const datasetName = process.env.DATASET_NAME ?? "Sample dataset";

    const results = await evaluate(target, {
        data: datasetName,
        evaluators: [correctnessEvaluator],
        experimentPrefix: "first-eval-in-langsmith",
        maxConcurrency: 2,
    });

    console.log(results);
    }

    if (require.main === module) {
    main().catch((e) => {
        console.error(e);
        process.exit(1);
    });
    }
    ```

    </CodeGroup>

1. 运行评估器：

    <CodeGroup>

    ```bash Python
    python eval.py
    ```

    ```bash TypeScript
    npx ts-node eval.ts
    ```

    </CodeGroup>

1. 您将收到一个链接，用于查看实验结果的评估结果和元数据：

    ```
    View the evaluation results for experiment: 'first-eval-in-langsmith-00000000' at: https://smith.langchain.com/o/6551f9c4-2685-4a08-86b9-1b29643deb3d/datasets/e5fde557-c274-4e49-b39d-000000000000/compare?selectedSessions=70b11778-6a28-4cdb-be81-000000000000

    <ExperimentResults first-eval-in-langsmith-00000000>
    ```1. 按照评估运行输出中的链接访问 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-evaluation-quickstart) 中的 **数据集和实验** 页面，并探索实验结果。这将引导您进入创建的实验，其中有一个表格显示**输入**、**参考输出**和**输出**。您可以选择一个数据集来打开结果的扩展视图。

    <div style={{ textAlign: 'center' }}>
    <img
        className="block dark:hidden"
        src="/langsmith/images/experiment-results-link-light.png"
        alt="Experiment results in the UI after following the link."
    />

    <img
        className="hidden dark:block"
        src="/langsmith/images/experiment-results-link-dark.png"
        alt="Experiment results in the UI after following the link."
    />
    </div>

## 后续步骤

以下是您接下来可能想要探索的一些主题：

- [Evaluation concepts](/langsmith/evaluation-concepts) 提供了LangSmith 中评估关键术语的描述。
- [OpenEvals README](https://github.com/langchain-ai/openevals) 查看所有可用的预构建评估器以及如何自定义它们。
- [Define custom evaluators](/langsmith/code-evaluator-ui)。
- [Python](https://docs.smith.langchain.com/reference/python/reference) 或 [TypeScript](https://docs.smith.langchain.com/reference/js) SDK 参考，提供每个类和函数的全面描述。

</Tab>
</Tabs>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluation-quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>