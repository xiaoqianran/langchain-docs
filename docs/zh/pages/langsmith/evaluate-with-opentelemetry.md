<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to evaluate with OpenTelemetry | https://docs.langchain.com/langsmith/evaluate-with-opentelemetry -->

# 如何使用 OpenTelemetry 进行评估

本指南向您展示如何使用 OpenTelemetry 跟踪和 LangSmith 来运行评估。

<Info>
  [Evaluations](/langsmith/evaluation-concepts#evaluation-lifecycle) | [Datasets](/langsmith/evaluation-concepts#datasets) | [Trace with OpenTelemetry](/langsmith/trace-with-opentelemetry)
</Info>

如果您已经使用 OpenTelemetry 来跟踪您的 LLM 申请，您可以通过将跟踪路由到实验会话来运行评估。当您想要评估使用 OpenTelemetry 但不使用 LangSmith SDK 的 [⟦T10⟧](https://reference.langchain.com/python/langsmith/client/Client/evaluate) 函数的应用程序时，此方法非常有用。

## 概述

使用 OpenTelemetry 进行评估时，您需要：

1. 在 LangSmith 中创建一个实验会话。
2. 配置 OpenTelemetry 以将跟踪发送到 LangSmith。
3. 添加特定的跨度属性以将跟踪链接到实验和数据集示例。
4. 为数据集中的每个示例运行应用程序。

## 先决条件

本指南假设您拥有：

* 使用 OpenTelemetry 检测的应用程序，将跟踪发送到 LangSmith。
* 在 LangSmith 中创建的数据集，包含要评估的示例。您可以通过[LangSmith UI](/langsmith/evaluation-concepts#datasets)或通过[SDK](/langsmith/manage-datasets-programmatically)创建数据集。

本教程使用 Strands 代理作为示例实现，但该方法适用于任何 OpenTelemetry 仪器。

安装依赖项：

<CodeGroup>
  ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langsmith strands-agents strands-agents-tools opentelemetry-sdk opentelemetry-exporter-otlp
  ```

  ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install langsmith @strands-agents/sdk @opentelemetry/api @opentelemetry/sdk-trace-node @opentelemetry/sdk-trace-base @opentelemetry/exporter-trace-otlp-http @opentelemetry/resources
  ```
</CodeGroup>设置以下环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Tracing configuration
LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
LANGSMITH_API_KEY="<your-langsmith-api-key>"
OTEL_EXPORTER_OTLP_ENDPOINT = "https://api.smith.langchain.com/otel/"

# AWS Credentials
AWS_ACCESS_KEY_ID="<your-aws-access-key-id>"
AWS_SECRET_ACCESS_KEY="<your-aws-secret-access-key>"
AWS_REGION_NAME="<your-aws-region>"
```

<Note>
  如果您是 [self-hosting LangSmith](/langsmith/self-hosted)，请将 `OTEL_EXPORTER_OTLP_ENDPOINT` 替换为您的自托管 URL，并附加 `/api/v1/otel`。例如：`OTEL_EXPORTER_OTLP_ENDPOINT = "https://ai-company.com/api/v1/otel"`。

  将 `LANGSMITH_ENDPOINT` 替换为您的 LangSmith API 端点。例如：`LANGSMITH_ENDPOINT = "https://ai-company.com/api/v1"`。
</Note>

## 步骤 1. 创建实验会话

本指南假设已在 LangSmith 中创建了数据集并包含要评估的示例。您可以通过[LangSmith UI](/langsmith/evaluation-concepts#datasets)或通过[SDK](/langsmith/manage-datasets-programmatically)创建数据集。

实验会话将所有评估轨迹组合在一起。使用 LangSmith 客户端创建一个：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client

  # Initialize LangSmith client
  client = Client()

  experiment_name = "strands-agent-experiment"
  # Assumes a dataset has been created. You can find the dataset ID in the LangSmith UI or via the SDK.
  dataset_id = "<your-dataset-id>"

  # Create an experiment session linked to the dataset
  project = client.create_project(
      project_name=experiment_name,
      reference_dataset_id=dataset_id
  )

  experiment_id = str(project.id)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";

  // Initialize LangSmith client
  const client = new Client({
    apiKey: process.env.LANGSMITH_API_KEY,
  });

  const experimentName = "strands-agent-experiment";
  const datasetId = "your-dataset-id";

  // Create an experiment session linked to the dataset
  const project = await client.createProject({
    projectName: experimentName,
    referenceDatasetId: datasetId,
  });

  const experimentId = project.id;
  ```
</CodeGroup>

此外，您可以在 LangSmith UI 中创建评估器并将它们绑定到您的数据集。对于在 UI 中定义并绑定到数据集的评估器，它们将自动在实验轨迹上运行。

要了解有关评估器的更多信息，请参阅[Evaluators](/langsmith/evaluation-concepts#evaluators)。

## 步骤 2. 定义应用程序并配置 OpenTelemetry首先，您需要一个使用 OpenTelemetry 进行跟踪的应用程序。此示例使用 Strands 代理，但您可以使用任何 OpenTelemetry 检测的应用程序。设置 OpenTelemetry，通过在 OTEL 标头中包含实验 ID 来将跟踪路由到实验会话。此步骤的总体思路是拥有一个已使用 OpenTelemetry 进行检测的代理或应用程序。

<Note>
  此步骤未提供 TypeScript 示例，因为 `Strands TypeScript SDK` 目前不支持 `OpenTelemetry` 可观察性（截至 2026 年 2 月）。
</Note>

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import os
  from strands import Agent
  from strands_tools import file_read, file_write, python_repl, shell, journal
  from strands.telemetry import StrandsTelemetry

  # Set OTEL headers with experiment ID as the project
  api_key = os.getenv('LANGSMITH_API_KEY')
  os.environ['OTEL_EXPORTER_OTLP_HEADERS'] = f"x-api-key={api_key},Langsmith-Project={experiment_id}"

  # Initialize telemetry
  strands_telemetry = StrandsTelemetry()
  strands_telemetry.setup_otlp_exporter()

  # Create an agent (Strands automatically creates OTel spans)
  agent = Agent(
      tools=[file_read, file_write, python_repl, shell, journal],
      system_prompt="You are an Expert Software Developer.",
      model="us.anthropic.claude-sonnet-4-20250514-v1:0",
  )
  ```
</CodeGroup>

有关使用 LangSmith 设置 OpenTelemetry 跟踪的详细信息，请参阅 [Trace with OpenTelemetry](/langsmith/trace-with-opentelemetry)。

## 步骤 3. 设置关键跨度属性

将所需的跨度属性添加到每个应用程序运行。这些属性将每个跟踪链接到实验和特定数据集示例。

以下属性与实验评估相关：|属性 |目的|
| -------------------------------- | ------------------------------------------------- |
| `langsmith.trace.session_id` |将跟踪路由到您的实验会话 |
| `langsmith.reference_example_id` |将跟踪链接到特定数据集示例 |
| `langsmith.span.kind` |设置跨度类型（例如，“llm”、“链”、“工具”）|
| `inputs` |记录应用程序的输入 |
| `outputs` |记录应用程序的输出 |

有关支持的 OpenTelemetry 属性的完整列表，请参阅 [Trace with OpenTelemetry](/langsmith/trace-with-opentelemetry#supported-opentelemetry-attribute-and-event-mapping)。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from opentelemetry import trace

  def evaluate_with_opentelemetry(agent, example_id: str, example_input: str, experiment_id: str):
      tracer = trace.get_tracer(__name__)

      # Wrapper span to add experiment metadata
      with tracer.start_as_current_span("experiment_evaluation") as span:
          # Route trace to the experiment
          span.set_attribute("langsmith.trace.session_id", experiment_id)

          # Link trace to the specific dataset example
          span.set_attribute("langsmith.reference_example_id", example_id)

          # Record input
          span.set_attribute("inputs", example_input)

          # Run the application
          response = agent(example_input)

          # Record output
          output_text = getattr(response, "output", str(response))
          span.set_attribute("outputs", output_text)

          return output_text
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { trace, Span } from "@opentelemetry/api";

  async function evaluateWithAgent(
    agent: Agent,
    exampleId: string,
    exampleInput: string,
    experimentId: string
  ): Promise<string> {
    const tracer = trace.getTracer("experiment-runner");

    return await tracer.startActiveSpan(
      "experiment_evaluation",
      async (span: Span) => {
        try {
          // Route trace to the experiment
          span.setAttribute("langsmith.trace.session_id", experimentId);

          // Link trace to the specific dataset example
          span.setAttribute("langsmith.reference_example_id", exampleId);

          // Record input
          span.setAttribute("inputs", exampleInput);

          // Run the application
          const result = await agent.invoke(exampleInput);
          // Record output
          const response = String(result);
          span.setAttribute("outputs", response);

          return response;
        } finally {
          span.end();
        }
      }
    );
  }
  ```
</CodeGroup>

## 步骤 4. 通过迭代数据集示例来运行评估

每次实验运行都会在 LangSmith 中创建链接到数据集示例的跟踪。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Iterate through dataset examples
  for example in client.list_examples(dataset_name=dataset_name):

      # Extract input from the example inputs dictionary
      # Adjust the key based on your dataset structure
      # (e.g., "input", "question", etc.)
      example_input = example.inputs.get("input")

      evaluate_with_opentelemetry(
          agent=agent,
          example_id=str(example.id),
          example_input=str(example_input),
          experiment_id=experiment_id
      )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // Iterate through dataset examples
  for await (const example of client.listExamples({ datasetName })) {
    // Extract input from the example inputs dictionary
    // Adjust the key based on your dataset structure
    // (e.g., "input", "question", etc.)
    const exampleInput = example.inputs.input;

    await evaluateWithAgent(
      agent,
      example.id,
      String(exampleInput),
      experimentId
    );
  }
  ```
</CodeGroup>

运行评估后，您可以在LangSmith UI中[analyze the experiment](/langsmith/analyze-an-experiment)看到：

* 每个示例的单独跟踪详细信息
* 评估者评分和反馈
* 不同实验运行之间的比较

导航到 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-evaluate-with-opentelemetry) 中的实验来分析结果。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluate-with-opentelemetry.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>