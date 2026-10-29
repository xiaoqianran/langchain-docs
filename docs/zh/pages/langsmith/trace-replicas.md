<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Write traces to multiple destinations with replicas | https://docs.langchain.com/langsmith/trace-replicas -->

# 使用副本将跟踪写入多个目的地

使用通过环境变量配置或在运行时配置的副本，将每个跟踪同时发送到多个代理环境或工作区。

副本允许您将每个跟踪同时发送到多个代理环境或工作区。其中 [dynamic routing](/langsmith/conditional-tracing#customize-tracing-configuration-per-request) 将每条跟踪发送到一个目标，副本会将跟踪并行复制到所有配置的目标。

使用副本可以：

* 将生产跟踪镜像到暂存环境或个人工作区以进行调试。
* 写入多个工作区以实现多租户隔离，无需更改任何代理代码。
* 将跟踪发送到不同代理环境的同一服务器，并覆盖每个副本的元数据。

> [!注意]
>
> 此集成使用旧目标设置，例如 `project_name` 或 `LANGSMITH_PROJECT`。 [Create an agent](/langsmith/create-an-agent)，选择其环境，然后[retrieve that environment's ⟦T12⟧](/langsmith/create-an-agent#use-an-environment-project)。在目标设置和任何覆盖中使用该返回值。对于支持代理寻址的集成，请直接使用 [agent identifier and environment](/langsmith/log-traces-to-agent)。

在启用路由之前配置每个目标，包括每个副本和租户工作区。将每个副本的 `project_name` 或 `projectName` 设置为其目标环境的 `tracer_session_name`。## 通过环境变量配置副本

Set the `LANGSMITH_RUNS_ENDPOINTS` environment variable to a JSON value.支持两种格式：

* **Object format**: maps each endpoint URL to its API key. Each URL appears once, so use the array format when two replicas share a URL:

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  export LANGSMITH_RUNS_ENDPOINTS='{
  "https://api.smith.langchain.com": "ls__key_us_workspace",
  "https://eu.api.smith.langchain.com": "ls__key_eu_workspace"
  }'
  ```

* **数组格式**：副本对象列表，当您需要多个副本指向同一 URL 或当您想要为每个副本设置 `project_name` 时非常有用：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  export LANGSMITH_RUNS_ENDPOINTS='[
  {"api_url": "https://api.smith.langchain.com", "api_key": "ls__key1", "project_name": "<production-tracer-session-name>"},
  {"api_url": "https://api.smith.langchain.com", "api_key": "ls__key2", "project_name": "<staging-tracer-session-name>"}
  ]'
  ```

> [!警告]
>
> 您不能将 `LANGSMITH_RUNS_ENDPOINTS` 与 `LANGSMITH_ENDPOINT` 一起使用。如果同时设置，LangSmith 会引发错误。仅使用一个来配置您的端点。

## 在运行时配置副本

You can also pass replicas directly in code, which is useful when destinations vary per request or tenant.

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import traceable, tracing_context
from langsmith.run_trees import WriteReplica, ApiKeyAuth

@traceable
def my_pipeline(query: str) -> str:
    # Your agent logic here
    return f"Answer to: {query}"

replicas = [
    WriteReplica(
        api_url="https://api.smith.langchain.com",
        auth=ApiKeyAuth(api_key="ls__key_workspace_a"),
        project_name="<production-tracer-session-name>",
    ),
    WriteReplica(
        api_url="https://api.smith.langchain.com",
        auth=ApiKeyAuth(api_key="ls__key_workspace_b"),
        project_name="<staging-tracer-session-name>",
        # Optionally override fields on the replicated run
        updates={"metadata": {"environment": "staging"}},
    ),
]

with tracing_context(replicas=replicas):
    my_pipeline("What is LangSmith?")
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { traceable } from "langsmith/traceable";

const myPipeline = traceable(
  async (query: string): Promise<string> => {
    // Your agent logic here
    return `Answer to: ${query}`;
  },
  {
    name: "my_pipeline",
    replicas: [
      {
        apiUrl: "https://api.smith.langchain.com",
        apiKey: "ls__key_workspace_a",
        projectName: "<production-tracer-session-name>",
      },
      {
        apiUrl: "https://api.smith.langchain.com",
        apiKey: "ls__key_workspace_b",
        projectName: "<staging-tracer-session-name>",
        // Optionally override fields on the replicated run
        updates: { metadata: { environment: "staging" } },
      },
    ],
  }
);

await myPipeline("What is LangSmith?");
```

您还可以使用 `updates` 字段将其他字段（例如 [metadata or tags](/langsmith/ls-metadata-parameters)）合并到仅针对特定副本的运行中，而保持主跟踪不变。 Replica errors are non-fatal: if a replica endpoint is unavailable, LangSmith logs the error without affecting the primary trace.> [!警告]
>
> 身份验证不会在分布式跟踪中传播。当跟踪跨越多个服务时，LangSmith 自动将副本 `project_name` 和 `updates` 转发到下游服务，但不转发 API 密钥或凭证。每个服务必须为副本目标配置自己的凭据。

## 在同一服务器上的环境之间复制

如果您的所有副本都使用相同的 LangSmith 服务器，则可以省略 `api_url` 和 `auth` 并仅指定 `project_name`。 SDK 重用默认的客户端凭据：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import traceable, tracing_context
from langsmith.run_trees import WriteReplica

@traceable
def my_pipeline(query: str) -> str:
    return f"Answer to: {query}"

with tracing_context(
    replicas=[
        WriteReplica(project_name="<production-tracer-session-name>"),
        WriteReplica(project_name="<staging-tracer-session-name>", updates={"metadata": {"env": "staging"}}),
    ]
):
    my_pipeline("What is LangSmith?")
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { traceable } from "langsmith/traceable";

const myPipeline = traceable(
  async (query: string) => `Answer to: ${query}`,
  {
    name: "my_pipeline",
    replicas: [
      { projectName: "<production-tracer-session-name>" },
      { projectName: "<staging-tracer-session-name>", updates: { metadata: { env: "staging" } } },
    ],
  }
);

await myPipeline("What is LangSmith?");
```

## 留下所有副本实例的反馈

当您使用副本时，每个副本都会收到每次运行的副本。要提交特定副本上运行的反馈，您需要该副本的运行 ID。在 Python SDK 0.10.8 或更高版本以及 JS SDK 0.8.5 或更高版本中，您可以将一个副本指定为 **primary** 并使用 `compute_run_id_for_secondary_replica` 确定性地计算所有其他副本的运行 ID。**主**副本保持原始运行 ID 不变。每个**辅助**副本都会接收从原始运行 ID 和辅助目标的 `tracer_session_name` 派生的确定性运行 ID。使用`compute_run_id_for_secondary_replica(original_run_id, project_name)`计算辅助运行ID并在调用`create_feedback`时传递它。如果运行 ID 不是 UUID v7，或者 `project_name` 为空，这两个 SDK 都会引发错误。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import (
    Client,
    compute_run_id_for_secondary_replica,
    trace,
    tracing_context,
)

primary_client = Client(api_key="primary-key")
secondary_client = Client(api_key="secondary-key")

primary_project = "<primary-tracer-session-name>"
secondary_project = "<replica-tracer-session-name>"

with tracing_context(
    replicas=[
        {
            "project_name": primary_project,
            "primary": True,
            "client": primary_client,
        },
        {
            "project_name": secondary_project,
            "primary": False,
            "client": secondary_client,
        },
    ]
):
    with trace("answer-question", inputs={"question": "Capital of France?"}) as run:
        run.outputs = {"answer": "Paris"}

# Compute the secondary replica's run ID from the original run ID and project name
secondary_run_id = compute_run_id_for_secondary_replica(
    run.id,
    secondary_project,
)

# Each destination has its own session_id; resolve it for feedback
primary_session_id = primary_client.read_project(project_name=primary_project).id
secondary_session_id = secondary_client.read_project(project_name=secondary_project).id

# Submit feedback to the primary replica using the original run ID
primary_client.create_feedback(
    trace_id=run.id,
    key="user-rating",
    score=1,
    session_id=primary_session_id,
)

# Submit feedback to the secondary replica using the computed run ID
secondary_client.create_feedback(
    trace_id=secondary_run_id,
    key="user-rating",
    score=1,
    session_id=secondary_session_id,
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";
import { traceable, getCurrentRunTree } from "langsmith/traceable";
import { computeRunIdForSecondaryReplica } from "langsmith";

const primaryClient = new Client({ apiKey: "primary-key" });
const secondaryClient = new Client({ apiKey: "secondary-key" });

const primaryProject = "<primary-tracer-session-name>";
const secondaryProject = "<replica-tracer-session-name>";

let primaryRunId: string | undefined;

const answerQuestion = traceable(
  async (question: string) => {
    primaryRunId = getCurrentRunTree()?.id;
    return { answer: "Paris" };
  },
  {
    name: "answer-question",
    client: primaryClient,
    replicas: [
      {
        projectName: primaryProject,
        primary: true,
        client: primaryClient,
      },
      {
        projectName: secondaryProject,
        primary: false,
        client: secondaryClient,
      },
    ],
  }
);

await answerQuestion("Capital of France?");

if (primaryRunId) {
  // Compute the secondary replica's run ID
  const secondaryRunId = computeRunIdForSecondaryReplica(
    primaryRunId,
    secondaryProject
  );

  // Each destination has its own session_id; resolve it for feedback
  const { id: primarySessionId } = await primaryClient.readProject({
    projectName: primaryProject,
  });
  const { id: secondarySessionId } = await secondaryClient.readProject({
    projectName: secondaryProject,
  });

  // Submit feedback to the primary replica using the original run ID
  await primaryClient.createFeedback({
    runId: primaryRunId,
    sessionId: primarySessionId,
    key: "user-rating",
    score: 1,
  });

  // Submit feedback to the secondary replica using the computed run ID
  await secondaryClient.createFeedback({
    runId: secondaryRunId,
    sessionId: secondarySessionId,
    key: "user-rating",
    score: 1,
  });
}
```

> [!注意]
>
> `compute_run_id_for_secondary_replica` / `computeRunIdForSecondaryReplica` 帮助程序在 Python SDK 0.10.8 或更高版本以及 JS SDK 0.8.5 或更高版本中可用。如果您使用的是较早的 SDK 版本，请升级以使用此功能。

## LangSmith 和 OpenTelemetry 目的地之间的路线

您可以在运行时决定给定调用是否将跟踪发送到LangSmith、OpenTelemetry (OTel) 后端或同时发送到两者，而无需重新部署或修改代理逻辑。当您想要在每个环境甚至每个请求的可观察性后端之间切换并在运行时做出决定时，这非常有用。

使用 `tracing_mode` 构造函数参数或 `LANGSMITH_TRACING_MODE` 环境变量设置跟踪模式。两者都接受相同的价值观；显式 `tracing_mode` 参数始终优先于环境变量：* **`"langsmith"`（默认）**：将跟踪本机发送到 LangSmith。
* **`"otel"`**：将跟踪作为 OpenTelemetry 跨度导出到配置的 OTel 后端。
* **`"hybrid"`（仅限 Python）**：从单个副本发送到 LangSmith 和 OTel 后端。

> [!注意]
>
> 如果您在 `Client`（仅限 Python）上使用已弃用的 `otel_enabled` 参数，请迁移到 `tracing_mode`：`Client(otel_enabled=True)` → `Client(tracing_mode="hybrid")`。传递 `otel_enabled` 仍然有效，但会发出 `FutureWarning`。

将配置好的 `Client` 直接传递到副本中以在运行时应用所需的模式：

```python Python expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client, traceable, tracing_context
from langsmith.run_trees import WriteReplica
from langsmith.wrappers import wrap_openai
import openai

# Create clients with different tracing modes
ls_client = Client()                            # tracing_mode="langsmith" (default)
otel_client = Client(tracing_mode="otel")       # tracing_mode="otel"
hybrid_client = Client(tracing_mode="hybrid")   # tracing_mode="hybrid" (both)

openai_client = wrap_openai(openai.Client())

@traceable()
def joke():
    response = openai_client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[{"role": "user", "content": "Tell me a short joke."}],
    )
    return response.choices[0].message.content

# Mix tracing modes across replicas in a single invocation:
# one replica sends via LangSmith's native format, another as OTel spans.
with tracing_context(replicas=[
    WriteReplica(client=ls_client),    # tracing_mode="langsmith"
    WriteReplica(client=otel_client),  # tracing_mode="otel"
]):
    joke()

# Alternatively, a single hybrid replica sends to both simultaneously.
with tracing_context(replicas=[WriteReplica(client=hybrid_client)]):
    joke()

# Swap replica lists at runtime, for example based on a feature flag or environment.
def get_replicas(send_to_otel: bool):
    replicas = [WriteReplica(client=ls_client)]
    if send_to_otel:
        replicas.append(WriteReplica(client=otel_client))
    return replicas

with tracing_context(replicas=get_replicas(send_to_otel=True)):   # LangSmith + OTel
    joke()

with tracing_context(replicas=get_replicas(send_to_otel=False)):  # LangSmith only
    joke()
```

```typescript TypeScript expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client } from "langsmith";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";
import OpenAI from "openai";

// Note: tracingMode: "otel" requires OTel SDK initialization
// (TracerProvider, SpanProcessor, etc.) before creating the client.
// See the OpenTelemetry integration guide for setup details.

// Create clients with different tracing modes
const lsClient = new Client();                           // tracingMode: "langsmith" (default)
const otelClient = new Client({ tracingMode: "otel" });  // tracingMode: "otel"

const openaiClient = wrapOpenAI(new OpenAI());

async function jokeImpl() {
  const response = await openaiClient.chat.completions.create({
    model: "gpt-5.4-mini",
    messages: [{ role: "user", content: "Tell me a short joke." }],
  });
  return response.choices[0].message.content;
}

// Mix tracing modes across replicas in a single traceable call:
// the primary client sends via LangSmith, the replica sends as OTel spans.
const joke = traceable(jokeImpl, {
  name: "joke",
  client: lsClient,                    // tracingMode: "langsmith" (default)
  replicas: [{ client: otelClient }],  // tracingMode: "otel"
});
await joke();

// Build replicas dynamically for runtime switching, for example based on a feature flag.
function buildReplicas(sendToOtel: boolean) {
  return sendToOtel ? [{ client: otelClient }] : [];
}

const sendToOtel = process.env.ROUTE_TO_OTEL === "true";
const jokeDynamic = traceable(jokeImpl, {
  name: "joke",
  client: lsClient,
  replicas: buildReplicas(sendToOtel),
});
await jokeDynamic();
```

每个 `Client` 上的 `tracing_mode` 确定该副本的导出路径。在 Python 中，`"hybrid"` 模式处理单个副本中的两个目的地。在 TypeScript 中，“发送到两者”的情况使用两个单独的副本，每个客户端一个，因为没有 `"hybrid"` 模式。由于每个副本独立解析其自己的客户端，因此您还可以在单​​个`tracing_context`内混合模式，例如，保留一个副本发送到LangSmith，同时通过第二个副本将相同的跟踪转发到 OTel 收集器。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-replicas.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。