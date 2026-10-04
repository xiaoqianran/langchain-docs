<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Log traces to a specific project | https://docs.langchain.com/langsmith/log-traces-to-project -->

# 记录对特定项目的跟踪

路由 LangSmith 使用环境变量或 SDK 跟踪到指定项目而不是默认项目。

本页介绍项目寻址，它通过命名跟踪项目所在的跟踪来路由跟踪。[Agent addressing](/langsmith/log-traces-to-agent) 是替代方案，跟踪使用其中之一而不是两者。

<Note>
  **基于项目的工作区。** 如果您的工作区按 [tracing project](/langsmith/observability-concepts#tracing-projects) 组织跟踪，则本部分适用。要进行检查，请查看左上角的控件。在基于项目的工作区中，它显示 LangSmith 徽标，并且侧边栏具有带有应用程序选择器的 **应用程序** 部分。如果控件显示您的工作区名称，则您的工作区是基于代理的，位于 [beta](/langsmith/release-stages) 中。跳过本节并阅读[Agents](/langsmith/agents)。
</Note>

本页介绍如何控制 LangSmith 发送痕迹的位置：

* [Set the destination project statically](#set-the-destination-project-statically)
* [Set the destination project dynamically](#set-the-destination-project-dynamically)
* [Set the destination workspace dynamically](#set-the-destination-workspace-dynamically)

要将每条跟踪一次发送到多个目的地，请参阅[Write traces to multiple destinations with replicas](/langsmith/trace-replicas)。

## 静态设置目标项目

LangSmith 使用 [*project*](/langsmith/observability-concepts#tracing-projects) 的概念对迹线进行分组。如果未指定，项目将设置为 `default`。您可以设置 `LANGSMITH_PROJECT` 环境变量来为整个应用程序运行配置自定义项目名称。在运行应用程序之前进行设置：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_PROJECT=my-custom-project
```

<Warning>
  仅 JS SDK 0.2.16 或更高版本支持 `LANGSMITH_PROJECT` 标志，如果您使用的是旧版本，请使用 `LANGCHAIN_PROJECT` 代替。
</Warning>

如果指定的项目不存在，LangSmith将在摄取第一个跟踪时自动创建它。

## 动态设置目标项目

您还可以通过多种方式在程序运行时设置项目名称，具体取决于您的情况[annotating your code for tracing](/langsmith/annotate-code)。当您想要记录同一应用程序中不同项目的跟踪时，这非常有用：

* 装饰或配置时传递项目名称。
* 每次单独调用时覆盖它。
* 直接构建run时设置。

<Note>
  使用以下方法之一动态设置项目名称会覆盖由 `LANGSMITH_PROJECT` 环境变量设置的项目名称。
</Note>

<CodeGroup>
  ```python Python expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

  ```typescript TypeScript expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

  ```java Java expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

## 动态设置目标工作空间如果您需要根据运行时配置将跟踪动态路由到不同的LangSmith[workspaces](/langsmith/administration-overview#workspaces)（例如，将不同的用户或租户路由到单独的工作区），则方法因语言而异：

* **Python**：将工作区特定的 LangSmith 客户端与 [⟦T13⟧](/langsmith/annotate-code#use-the-trace-context-manager-python-only) 结合使用。
* **TypeScript**：将自定义客户端传递给[⟦T14⟧](/langsmith/annotate-code#use-%40traceable-%2F-traceable)，或使用带有回调的`LangChainTracer`。

此方法对于您希望在工作区级别按客户、环境或团队隔离跟踪的多租户应用程序非常有用。它适用于任何与LangSmith兼容的跟踪，包括LangChain、OpenAI以及用`@traceable`修饰的自定义函数。

### 先决条件

* 可以访问多个工作空间的[LangSmith API key](/langsmith/create-account-api-key)。
* 每个目标工作空间的[workspace IDs](/langsmith/set-up-hierarchy#set-up-a-workspace)。

### 通用跨工作空间跟踪

对于想要根据运行时逻辑（例如客户 ID、租户或环境）将跟踪动态路由到不同工作区的一般应用程序，请使用此方法。

**关键部件：**1. 使用各自的 `workspace_id` 为每个工作区初始化单独的 `Client` 实例。
2. 使用 `tracing_context` (Python) 或将工作区特定的 `client` 传递给 `traceable` (TypeScript) 来路由跟踪。
3. 通过应用程序的运行时配置传递工作区配置。
4. 覆盖每条路径的工作区和项目名称，以在每个工作区中进一步组织跟踪。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
</Note>

***<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/log-traces-to-project.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>