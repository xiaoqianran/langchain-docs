<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Log traces to a specific project | https://docs.langchain.com/langsmith/log-traces-to-project -->

# 记录对特定项目的跟踪

本页介绍如何控制 LangSmith 发送痕迹的位置：

- [Set the destination project statically](#set-the-destination-project-statically)
- [Set the destination project dynamically](#set-the-destination-project-dynamically)
- [Set the destination workspace dynamically](#set-the-destination-workspace-dynamically)
- [Write traces to multiple destinations with replicas](#write-traces-to-multiple-destinations-with-replicas)
- [Leave feedback on all replica instances](#leave-feedback-on-all-replica-instances)

## 静态设置目标项目

LangSmith 使用 [_project_](/langsmith/observability-concepts#projects) 的概念对迹线进行分组。如果未指定，项目将设置为 `default`。

您可以设置 `LANGSMITH_PROJECT` 环境变量来为整个应用程序运行配置自定义项目名称。在运行应用程序之前进行设置：

```bash
export LANGSMITH_PROJECT=my-custom-project
```

<Warning>
`LANGSMITH_PROJECT` 标志仅在 JS SDK 版本 >= 0.2.16 中受支持，如果您使用的是旧版本，请使用 `LANGCHAIN_PROJECT` 代替。
</Warning>

如果指定的项目不存在，LangSmith将在摄取第一个跟踪时自动创建它。

## 动态设置目标项目

您还可以通过多种方式在程序运行时设置项目名称，具体取决于您的情况[annotating your code for tracing](/langsmith/annotate-code)。当您想要在同一应用程序中记录对不同项目的跟踪时，这非常有用：

- 在装饰或配置时传递项目名称。
- 每次单独调用时覆盖它。
- 直接构建运行时设置。<Note>
使用以下方法之一动态设置项目名称会覆盖由 `LANGSMITH_PROJECT` 环境变量设置的项目名称。
</Note>

<CodeGroup>

```python Python expandable wrap
import openai
from langsmith import traceable
from langsmith.run_trees import RunTree

client = openai.Client()
messages = [
  {"role": "system", "content": "You are a helpful assistant."},
  {"role": "user", "content": "Hello!"}
]

# Use the @traceable decorator with the 'project_name' parameter to log traces to LangSmith
# Ensure that the LANGSMITH_TRACING environment variables is set for @traceable to work
@traceable(
  run_type="llm",
  name="OpenAI Call Decorator",
  project_name="My Project"
)
def call_openai(
  messages: list[dict], model: str = "gpt-5.4-mini"
) -> str:
  return client.chat.completions.create(
      model=model,
      messages=messages,
  ).choices[0].message.content

# Call the decorated function
call_openai(messages)

# You can also specify the Project via the project_name parameter
# This will override the project_name specified in the @traceable decorator
call_openai(
  messages,
  langsmith_extra={"project_name": "My Overridden Project"},
)

# The wrapped OpenAI client accepts all the same langsmith_extra parameters
# as @traceable decorated functions, and logs traces to LangSmith automatically.
# Ensure that the LANGSMITH_TRACING environment variables is set for the wrapper to work.
from langsmith import wrappers
wrapped_client = wrappers.wrap_openai(client)
wrapped_client.chat.completions.create(
  model="gpt-5.4-mini",
  messages=messages,
  langsmith_extra={"project_name": "My Project"},
)

# Alternatively, create a RunTree object
# You can set the project name using the project_name parameter
rt = RunTree(
  run_type="llm",
  name="OpenAI Call RunTree",
  inputs={"messages": messages},
  project_name="My Project"
)
chat_completion = client.chat.completions.create(
  model="gpt-5.4-mini",
  messages=messages,
)
# End and submit the run
rt.end(outputs=chat_completion)
rt.post()
```

```typescript TypeScript expandable wrap
import OpenAI from "openai";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";
import { RunTree} from "langsmith";

const client = new OpenAI();
const messages = [
  {role: "system", content: "You are a helpful assistant."},
  {role: "user", content: "Hello!"}
];

const traceableCallOpenAI = traceable(async (messages: {role: string, content: string}[], model: string) => {
  const completion = await client.chat.completions.create({
      model: model,
      messages: messages,
  });
  return completion.choices[0].message.content;
},{
  run_type: "llm",
  name: "OpenAI Call Traceable",
  project_name: "My Project"
});

// Call the traceable function
await traceableCallOpenAI(messages, "gpt-5.4-mini");

// Create and use a RunTree object
const rt = new RunTree({
  run_type: "llm",
  name: "OpenAI Call RunTree",
  inputs: { messages },
  project_name: "My Project"
});
await rt.postRun();

// Execute a chat completion and handle it within RunTree
rt.end({outputs: chatCompletion});
await rt.patchRun();
```

```java Java expandable wrap
import com.langchain.smith.otel.OtelConfig;
import com.langchain.smith.otel.OtelSpanCreator;
import com.langchain.smith.otel.OtelTraceExporter;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.StatusCode;
import io.opentelemetry.api.trace.Tracer;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Simple example: Send a single OpenTelemetry trace to LangSmith.
 *
 * Usage:
 *   export LANGSMITH_API_KEY=your_api_key
 *   export LANGSMITH_PROJECT=your_project_name  # Optional, defaults to "default"
 */
public class OtelLangSmithSimpleExample {
    public static void main(String[] args) throws Exception {
        // Get API key and project name
        String apiKey = System.getenv("LANGSMITH_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("ERROR: LANGSMITH_API_KEY environment variable is required!");
            return;
        }

        String projectName = System.getenv("LANGSMITH_PROJECT");
        if (projectName == null || projectName.isEmpty()) {
            projectName = "default";
        }

        // Configure exporter
        Map<String, String> headers = new HashMap<>();
        headers.put("x-api-key", apiKey);
        headers.put("Langsmith-Project", projectName);

        OtelConfig config = OtelConfig.builder()
                .enabled(true)
                .endpoint("https://api.smith.langchain.com/otel/v1/traces")
                .headers(headers)
                .timeout(Duration.ofSeconds(30))
                .serviceName("langsmith-java-simple")
                .build();

        OtelTraceExporter exporter = OtelTraceExporter.fromConfig(config);
        Tracer tracer = exporter.getTracer();

        // Create a simple span
        Span span = OtelSpanCreator.createLlmSpan(
                tracer, "simple.llm.call", "openai", "gpt-4", projectName, null);

        try {
            OtelSpanCreator.setInput(span, "Hello, world!");
            Thread.sleep(100); // Simulate processing
            OtelSpanCreator.setOutput(span, "Hello! How can I help you?");
            OtelSpanCreator.setTokenUsage(span, 5, 8);
            span.setStatus(StatusCode.OK);
        } finally {
            span.end();
        }

        // Flush and shutdown
        exporter.flush().join(5, java.util.concurrent.TimeUnit.SECONDS);
        exporter.shutdown().join(2, java.util.concurrent.TimeUnit.SECONDS);

        System.out.println("✓ Trace sent to LangSmith!");
    }
}
```

</CodeGroup>

## 动态设置目标工作空间

如果您需要根据运行时配置将跟踪动态路由到不同的LangSmith[workspaces](/langsmith/administration-overview#workspaces)（例如，将不同的用户或租户路由到单独的工作区），则方法因语言而异：

- **Python**：将工作区特定的 LangSmith 客户端与 [⟦T23⟧](/langsmith/annotate-code#use-the-trace-context-manager-python-only) 结合使用。
- **TypeScript**：将自定义客户端传递给[⟦T24⟧](/langsmith/annotate-code#use-%40traceable-%2F-traceable)，或将`LangChainTracer`与回调一起使用。

此方法对于您希望在工作区级别按客户、环境或团队隔离跟踪的多租户应用程序非常有用。它适用于任何LangSmith兼容的跟踪，包括LangChain、OpenAI以及用`@traceable`修饰的自定义函数。

### 先决条件

- 可以访问多个工作空间的[LangSmith API key](/langsmith/create-account-api-key)。
- 每个目标工作空间的[workspace IDs](/langsmith/set-up-hierarchy#set-up-a-workspace)。

### 通用跨工作空间跟踪

对于想要根据运行时逻辑（例如客户 ID、租户或环境）将跟踪动态路由到不同工作区的一般应用程序，请使用此方法。

**关键部件：**1. 使用各自的 `workspace_id` 为每个工作区初始化单独的 `Client` 实例。
2. 使用 `tracing_context` (Python) 或将工作区特定的 `client` 传递给 `traceable` (TypeScript) 来路由跟踪。
3. 通过应用程序的运行时配置传递工作区配置。
4. 覆盖每条路径的工作区和项目名称，以在每个工作区中进一步组织跟踪。

<CodeGroup>

```python Python
import os
import contextlib
from langsmith import Client, traceable, tracing_context

# API key with access to multiple workspaces
api_key = os.getenv("LS_CROSS_WORKSPACE_KEY")

# Initialize clients for different workspaces
workspace_a_client = Client(
    api_key=api_key,
    api_url="https://api.smith.langchain.com",
    workspace_id="<YOUR_WORKSPACE_A_ID>"  # e.g., "abc123..."
)

workspace_b_client = Client(
    api_key=api_key,
    api_url="https://api.smith.langchain.com",
    workspace_id="<YOUR_WORKSPACE_B_ID>"  # e.g., "def456..."
)

# Example: Route based on customer ID
def get_workspace_client(customer_id: str):
    """Route to appropriate workspace based on customer."""
    if customer_id.startswith("premium_"):
        return workspace_a_client, "premium-customer-traces"
    else:
        return workspace_b_client, "standard-customer-traces"

@traceable
def process_request(data: dict, customer_id: str):
    """Process a customer request with workspace-specific tracing."""
    # Your business logic here
    return {"status": "success", "data": data}

# Use tracing_context to route to the appropriate workspace
def handle_customer_request(customer_id: str, request_data: dict):
    client, project_name = get_workspace_client(customer_id)

    # Everything within this context will be traced to the selected workspace
    with tracing_context(enabled=True, client=client, project_name=project_name):
        result = process_request(request_data, customer_id)

    return result

# Example usage
handle_customer_request("premium_user_123", {"query": "Hello"})
handle_customer_request("standard_user_456", {"query": "Hi"})
```

```typescript TypeScript
import { Client } from "langsmith";
import { traceable } from "langsmith/traceable";

// API key with access to multiple workspaces
const apiKey = process.env.LS_CROSS_WORKSPACE_KEY;

// Initialize clients for different workspaces
const workspaceAClient = new Client({
  apiKey: apiKey,
  apiUrl: "https://api.smith.langchain.com",
  workspaceId: "<YOUR_WORKSPACE_A_ID>", // e.g., "abc123..."
});

const workspaceBClient = new Client({
  apiKey: apiKey,
  apiUrl: "https://api.smith.langchain.com",
  workspaceId: "<YOUR_WORKSPACE_B_ID>", // e.g., "def456..."
});

// Example: Route based on customer ID
function getWorkspaceClient(customerId: string): {
  client: Client;
  projectName: string;
} {
  if (customerId.startsWith("premium_")) {
    return {
      client: workspaceAClient,
      projectName: "premium-customer-traces",
    };
  } else {
    return {
      client: workspaceBClient,
      projectName: "standard-customer-traces",
    };
  }
}

// Route traces to the appropriate workspace by passing the client to traceable
async function handleCustomerRequest(
  customerId: string,
  requestData: Record<string, any>
) {
  const { client, projectName } = getWorkspaceClient(customerId);

  // Create a traceable function with the workspace-specific client
  const processRequest = traceable(
    async (data: Record<string, any>, customerId: string) => {
      // Your business logic here
      return { status: "success", data };
    },
    {
      name: "process_request",
      client,
      project_name: projectName,
    }
  );

  return await processRequest(requestData, customerId);
}

// Example usage
await handleCustomerRequest("premium_user_123", { query: "Hello" });
await handleCustomerRequest("standard_user_456", { query: "Hi" });
```

</CodeGroup>

### 覆盖 LangSmith 部署的默认工作区

当 [deploying agents](/langsmith/deployment) 到 LangSmith 时，您可以使用图形生命周期上下文管理器覆盖跟踪发送到的默认工作区。当您想要根据通过 `config` 参数传递的运行时配置将跟踪从已部署的代理路由到不同的工作区时，这非常有用。

<CodeGroup>

```python Python
import os
import contextlib
from typing_extensions import TypedDict
from langgraph.graph import StateGraph
from langgraph.graph.state import RunnableConfig
from langsmith import Client, tracing_context

# API key with access to multiple workspaces
api_key = os.getenv("LS_CROSS_WORKSPACE_KEY")

# Initialize clients for different workspaces
workspace_a_client = Client(
    api_key=api_key,
    api_url="https://api.smith.langchain.com",
    workspace_id="<YOUR_WORKSPACE_A_ID>"
)

workspace_b_client = Client(
    api_key=api_key,
    api_url="https://api.smith.langchain.com",
    workspace_id="<YOUR_WORKSPACE_B_ID>"
)

# Define configuration schema for workspace routing
class Configuration(TypedDict):
    workspace_id: str

# Define the graph state
class State(TypedDict):
    response: str

def greeting(state: State, config: RunnableConfig) -> State:
    """Generate a workspace-specific greeting."""
    workspace_id = config.get("configurable", {}).get("workspace_id", "workspace_a")

    if workspace_id == "workspace_a":
        response = "Hello from Workspace A!"
    elif workspace_id == "workspace_b":
        response = "Hello from Workspace B!"
    else:
        response = "Hello from the default workspace!"

    return {"response": response}

# Build the base graph
base_graph = (
    StateGraph(state_schema=State, config_schema=Configuration)
    .add_node("greeting", greeting)
    .set_entry_point("greeting")
    .set_finish_point("greeting")
    .compile()
)

@contextlib.asynccontextmanager
async def graph(config):
    """Dynamically route traces to different workspaces based on configuration."""
    # Extract workspace_id from the configuration
    workspace_id = config.get("configurable", {}).get("workspace_id", "workspace_a")

    # Route to the appropriate workspace
    if workspace_id == "workspace_a":
        client = workspace_a_client
        project_name = "production-traces"
    elif workspace_id == "workspace_b":
        client = workspace_b_client
        project_name = "development-traces"
    else:
        client = workspace_a_client
        project_name = "default-traces"

    # Apply the tracing context for the selected workspace
    with tracing_context(enabled=True, client=client, project_name=project_name):
        yield base_graph

# Usage: Invoke with different workspace configurations
# await graph({"configurable": {"workspace_id": "workspace_a"}})
# await graph({"configurable": {"workspace_id": "workspace_b"}})
```

```typescript TypeScript
import { Client } from "langsmith";
import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";
import { StateGraph, Annotation } from "@langchain/langgraph";

// API key with access to multiple workspaces
const apiKey = process.env.LS_CROSS_WORKSPACE_KEY;

// Initialize clients for different workspaces
const workspaceAClient = new Client({
  apiKey: apiKey,
  apiUrl: "https://api.smith.langchain.com",
  workspaceId: "<YOUR_WORKSPACE_A_ID>", // e.g., "abc123..."
});

const workspaceBClient = new Client({
  apiKey: apiKey,
  apiUrl: "https://api.smith.langchain.com",
  workspaceId: "<YOUR_WORKSPACE_B_ID>", // e.g., "def456..."
});

// Define the graph state
const StateAnnotation = Annotation.Root({
  response: Annotation<string>(),
});

async function greeting(state: typeof StateAnnotation.State, config: any) {
  const workspaceId = config?.configurable?.workspace_id || "workspace_a";

  let response: string;
  if (workspaceId === "workspace_a") {
    response = "Hello from Workspace A!";
  } else if (workspaceId === "workspace_b") {
    response = "Hello from Workspace B!";
  } else {
    response = "Hello from the default workspace!";
  }

  return { response };
}

// Build the base graph
const baseGraph = new StateGraph(StateAnnotation)
  .addNode("greeting", greeting)
  .addEdge("__start__", "greeting")
  .addEdge("greeting", "__end__")
  .compile();

// Helper to get workspace-specific client and project
function getWorkspaceConfig(workspaceId: string): {
  client: Client;
  projectName: string;
} {
  if (workspaceId === "workspace_a") {
    return { client: workspaceAClient, projectName: "production-traces" };
  } else if (workspaceId === "workspace_b") {
    return { client: workspaceBClient, projectName: "development-traces" };
  }
  return { client: workspaceAClient, projectName: "default-traces" };
}

// Invoke the graph with workspace-specific tracing
async function invokeWithWorkspaceTracing(
  workspaceId: string,
  input: typeof StateAnnotation.State
) {
  const { client, projectName } = getWorkspaceConfig(workspaceId);

  // Create a LangChainTracer with the workspace-specific client
  const tracer = new LangChainTracer({
    client,
    projectName,
  });

  // Invoke the graph with the tracer attached via callbacks
  // All traces will be routed to the selected workspace
  return await baseGraph.invoke(input, {
    configurable: { workspace_id: workspaceId },
    callbacks: [tracer],
  });
}

// Example usage
await invokeWithWorkspaceTracing("workspace_a", { response: "" });
await invokeWithWorkspaceTracing("workspace_b", { response: "" });
```

</CodeGroup>

<Note>
使用跨工作区跟踪进行部署时，请确保您的服务密钥或 PAT 具有所有目标工作区的必要权限。我们建议使用多工作区服务密钥进行生产部署。对于 LangSmith 部署，您必须添加可跨工作空间访问环境变量的服务密钥（例如，`LS_CROSS_WORKSPACE_KEY`），以覆盖部署生成的默认服务密钥。
</Note>## 使用副本将跟踪写入多个目标

副本让您可以**同时**将每个跟踪发送到多个项目或工作区。与每条跟踪都转到一个目标的动态路由模式不同，副本会将跟踪并行复制到所有已配置的目标。

副本可用于：

- 将生产跟踪镜像到暂存或个人项目中以进行调试。
- 写入多个工作区以实现多租户隔离，无需更改任何应用程序代码。
- 将跟踪发送到不同项目下的同一服务器，并覆盖每个副本的元数据。

### 通过环境变量配置副本

将 `LANGSMITH_RUNS_ENDPOINTS` 环境变量设置为 JSON 值。支持两种格式：

- **对象格式**：将每个端点 URL 映射到其 API 密钥：

    ```bash
    export LANGSMITH_RUNS_ENDPOINTS='{
    "https://api.smith.langchain.com": "ls__key_workspace_a",
    "https://api.smith.langchain.com": "ls__key_workspace_b"
    }'
    ```

- **数组格式**：副本对象列表，当您需要多个副本指向同一 URL 或您想要为每个副本设置 `project_name` 时非常有用：

    ```bash
    export LANGSMITH_RUNS_ENDPOINTS='[
    {"api_url": "https://api.smith.langchain.com", "api_key": "ls__key1", "project_name": "project-prod"},
    {"api_url": "https://api.smith.langchain.com", "api_key": "ls__key2", "project_name": "project-staging"}
    ]'
    ```

<Warning>
您不能将 `LANGSMITH_RUNS_ENDPOINTS` 与 `LANGSMITH_ENDPOINT` 一起使用。如果同时设置，LangSmith 会引发错误。仅使用一个来配置您的端点。
</Warning>

### 在运行时配置副本您还可以直接在代码中传递副本，这在目的地因请求或租户而异时非常有用。

<CodeGroup>

```python Python
from langsmith import traceable, tracing_context
from langsmith.run_trees import WriteReplica, ApiKeyAuth

@traceable
def my_pipeline(query: str) -> str:
    # Your application logic here
    return f"Answer to: {query}"

replicas = [
    WriteReplica(
        api_url="https://api.smith.langchain.com",
        auth=ApiKeyAuth(api_key="ls__key_workspace_a"),
        project_name="project-prod",
    ),
    WriteReplica(
        api_url="https://api.smith.langchain.com",
        auth=ApiKeyAuth(api_key="ls__key_workspace_b"),
        project_name="project-staging",
        # Optionally override fields on the replicated run
        updates={"metadata": {"environment": "staging"}},
    ),
]

with tracing_context(replicas=replicas):
    my_pipeline("What is LangSmith?")
```

```typescript TypeScript
import { traceable } from "langsmith/traceable";

const myPipeline = traceable(
  async (query: string): Promise<string> => {
    // Your application logic here
    return `Answer to: ${query}`;
  },
  {
    name: "my_pipeline",
    replicas: [
      {
        apiUrl: "https://api.smith.langchain.com",
        apiKey: "ls__key_workspace_a",
        projectName: "project-prod",
      },
      {
        apiUrl: "https://api.smith.langchain.com",
        apiKey: "ls__key_workspace_b",
        projectName: "project-staging",
        // Optionally override fields on the replicated run
        updates: { metadata: { environment: "staging" } },
      },
    ],
  }
);

await myPipeline("What is LangSmith?");
```

</CodeGroup>

您还可以使用 `updates` 字段将其他字段（例如 [metadata or tags](/langsmith/ls-metadata-parameters)）合并到仅针对特定副本的运行中 - 主跟踪保持不变。副本错误是非致命的：如果副本端点不可用，LangSmith 会记录错误，而不会影响主跟踪。

<Warning>
身份验证不会在分布式跟踪中传播。当跟踪跨越多个服务时，LangSmith 自动将副本 `project_name` 和 `updates` 转发到下游服务，但不转发 API 密钥或凭证。每个服务必须为副本目标配置自己的凭据。
</Warning>

### 在同一服务器内复制（仅项目副本）

如果您的所有副本都使用相同的 LangSmith 服务器，则可以省略 `api_url` 和 `auth` 并仅指定 `project_name`。 SDK 重用默认的客户端凭据：

<CodeGroup>

```python Python
from langsmith import traceable, tracing_context
from langsmith.run_trees import WriteReplica

@traceable
def my_pipeline(query: str) -> str:
    return f"Answer to: {query}"

with tracing_context(
    replicas=[
        WriteReplica(project_name="project-prod"),
        WriteReplica(project_name="project-staging", updates={"metadata": {"env": "staging"}}),
    ]
):
    my_pipeline("What is LangSmith?")
```

```typescript TypeScript
import { traceable } from "langsmith/traceable";

const myPipeline = traceable(
  async (query: string) => `Answer to: ${query}`,
  {
    name: "my_pipeline",
    replicas: [
      { projectName: "project-prod" },
      { projectName: "project-staging", updates: { metadata: { env: "staging" } } },
    ],
  }
);

await myPipeline("What is LangSmith?");
```

</CodeGroup>

### 留下有关所有副本实例的反馈当您使用副本时，每个副本都会收到每次运行的副本。要提交特定副本上运行的反馈，您需要该副本的运行 ID。从 **Python SDK 0.10.8** 和 **JS SDK 0.8.5** 开始，您可以将一个副本指定为 **主副本，并使用 `compute_run_id_for_secondary_replica` 确定性地计算所有其他副本的运行 ID。

**主**副本保持原始运行 ID 不变。每个**辅助**副本都会收到一个从原始运行 ID 和辅助副本的项目名称派生的确定性运行 ID。使用`compute_run_id_for_secondary_replica(original_run_id, project_name)`计算辅助运行ID并在调用`create_feedback`时传递它。

<CodeGroup>

```python Python
from langsmith import (
    Client,
    compute_run_id_for_secondary_replica,
    trace,
    tracing_context,
)

primary_client = Client(api_key="primary-key")
secondary_client = Client(api_key="secondary-key")

primary_project = "production"
secondary_project = "backup-project"

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

# Each replica has its own project; resolve the corresponding project UUIDs
primary_session_id = primary_client.create_project(project_name=primary_project, upsert=True).id
secondary_session_id = secondary_client.create_project(project_name=secondary_project, upsert=True).id

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

```typescript TypeScript
import { Client } from "langsmith";
import { traceable, getCurrentRunTree } from "langsmith/traceable";
import { computeRunIdForSecondaryReplica } from "langsmith";

const primaryClient = new Client({ apiKey: "primary-key" });
const secondaryClient = new Client({ apiKey: "secondary-key" });

const primaryProject = "production";
const secondaryProject = "backup-project";

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

  // Each replica has its own project; resolve the corresponding project UUIDs
  const { id: primarySessionId } = await primaryClient.createProject({
    projectName: primaryProject,
    upsert: true,
  });
  const { id: secondarySessionId } = await secondaryClient.createProject({
    projectName: secondaryProject,
    upsert: true,
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

</CodeGroup>

<Note>
`compute_run_id_for_secondary_replica` / `computeRunIdForSecondaryReplica` 帮助程序在 Python SDK >= 0.10.8 和 JS SDK >= 0.8.5 中可用。如果您使用的是较早的 SDK 版本，请升级以使用此功能。
</Note>

### LangSmith 和 OpenTelemetry 目的地之间的路线

您可以在运行时决定给定调用是否将跟踪发送到LangSmith、OpenTelemetry (OTel) 后端或同时发送到两者，而无需重新部署或修改应用程序逻辑。当您想要在每个环境甚至每个请求的可观察性后端之间切换并在运行时做出决定时，这非常有用。使用 `tracing_mode` 构造函数参数或 `LANGSMITH_TRACING_MODE` 环境变量设置跟踪模式。两者都接受相同的价值观；显式 `tracing_mode` 参数始终优先于环境变量：

- **`"langsmith"`（默认）**：将跟踪本机发送到LangSmith。
- **`"otel"`**：将跟踪作为 OpenTelemetry 跨度导出到配置的 OTel 后端。
- **`"hybrid"`（仅限 Python）**：从单个副本发送到 LangSmith 和 OTel 后端。

<Note>
如果您在 `Client`（仅限 Python）上使用已弃用的 `otel_enabled` 参数，请迁移到 `tracing_mode`：`Client(otel_enabled=True)` → `Client(tracing_mode="hybrid")`。 `otel_enabled`参数将在下一个小版本中删除。
</Note>

将配置好的 `Client` 直接传递到副本中以在运行时应用所需的模式：

<CodeGroup>

```python Python expandable wrap
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
        model="gpt-4o-mini",
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

# Swap replica lists at runtime — e.g. based on a feature flag or environment.
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

```typescript TypeScript expandable wrap
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
    model: "gpt-4o-mini",
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

// Build replicas dynamically for runtime switching — e.g. based on a feature flag.
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

</CodeGroup>每个 `Client` 上的 `tracing_mode` 确定该副本的导出路径。在 Python 中，`"hybrid"` 模式处理单个副本中的两个目标。在 TypeScript 中，“发送到两者”的情况使用两个单独的副本，每个客户端一个，因为没有 `"hybrid"` 模式。由于每个副本独立解析其自己的客户端，因此您还可以在单​​个`tracing_context`内混合模式，例如，保留一个副本发送到LangSmith，同时通过第二个副本将相同的跟踪转发到 OTel 收集器。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/log-traces-to-project.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>