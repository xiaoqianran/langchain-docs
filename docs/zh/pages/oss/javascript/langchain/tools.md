<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tools | https://docs.langchain.com/oss/javascript/langchain/tools -->

# 工具

工具扩展了[agents](/oss/javascript/langchain/agents)的功能——让它们获取实时数据、执行代码、查询外部数据库以及在现实世界中采取行动。

在底层，工具是可调用的函数，具有明确定义的输入和输出，并传递给[chat model](/oss/javascript/langchain/models)。该模型根据对话上下文决定何时调用工具以及提供哪些输入参数。

<Tip>
  有关模型如何处理工具调用的详细信息，请参阅[Tool calling](/oss/javascript/langchain/models#tool-calling)。使用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-tools) 跟踪工具调用并调试错误。按照[tracing quickstart](/langsmith/trace-with-langchain)进行设置。

  我们建议您还设置 [LangSmith Engine](/langsmith/engine) 来监视您的痕迹、检测问题并提出修复建议。
</Tip>

## 创建工具

### 基本工具定义

创建工具的最简单方法是从 `langchain` 包中导入 `tool` 函数。您可以使用 [zod](https://zod.dev/) 定义工具的输入模式：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod"
import { tool } from "langchain"

const searchDatabase = tool(
  ({ query, limit }) => `Found ${limit} results for '${query}'`,
  {
    name: "search_database",
    description: "Search the customer database for records matching the query.",
    schema: z.object({
      query: z.string().describe("Search terms to look for"),
      limit: z.number().describe("Maximum number of results to return"),
    }),
  }
);
```

<Note>
  **服务器端工具的使用：** 一些聊天模型具有在服务器端执行的内置工具（网络搜索、代码解释器）。详情请参阅[Server-side tool use](#server-side-tool-use)。
</Note><Warning>
  优选使用 `snake_case` 作为工具名称（例如，`web_search` 而不是 `Web Search`）。一些模型提供者对包含空格或特殊字符的名称存在问题或拒绝包含错误的名称。坚持使用字母数字字符、下划线和连字符有助于提高提供商之间的兼容性。
</Warning>

## 访问上下文

当工具可以访问运行时信息（例如对话历史记录、用户数据和持久内存）时，它们是最强大的。本节介绍如何从您的工具中访问和更新此信息。

### 上下文

上下文提供在调用时传递的不可变配置数据。将其用于在对话期间不应更改的用户 ID、会话详细信息或特定于应用程序的设置。

<Note>
  虽然`thread_id`（通过`config={"configurable": {"thread_id": ...}}`传递）范围是*对话*：消息历史记录和检查点，`context`携带您的工具和中间件在调用时读取的*每次运行*数据。在生产中，您通常将两者一起传递：每个会话一个稳定的`thread_id`，以及每次调用时一个`context`对象。
</Note>

工具可以通过 `config` 参数访问代理的运行时上下文。将 `context` 与 `thread_id` 一起传递，以便对话在轮流中持续存在：<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";
  import { ChatOpenAI } from "@langchain/openai";
  import { createAgent, tool } from "langchain";

  const getUserName = tool(
    (_, config) => {
      return config.context.user_name;
    },
    {
      name: "get_user_name",
      description: "Get the user's name.",
      schema: z.object({}),
    },
  );

  const contextSchema = z.object({
    user_name: z.string(),
  });

  const agent = createAgent({
    model: new ChatOpenAI({ model: "google-genai:gemini-3.6-flash" }),
    tools: [getUserName],
    contextSchema,
  });

  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: "What is my name?" }],
    },
    {
      configurable: { thread_id: crypto.randomUUID() },
      context: { user_name: "John Smith" },
    },
  );
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";
  import { ChatOpenAI } from "@langchain/openai";
  import { createAgent, tool } from "langchain";

  const getUserName = tool(
    (_, config) => {
      return config.context.user_name;
    },
    {
      name: "get_user_name",
      description: "Get the user's name.",
      schema: z.object({}),
    },
  );

  const contextSchema = z.object({
    user_name: z.string(),
  });

  const agent = createAgent({
    model: new ChatOpenAI({ model: "openai:gpt-5.5" }),
    tools: [getUserName],
    contextSchema,
  });

  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: "What is my name?" }],
    },
    {
      configurable: { thread_id: crypto.randomUUID() },
      context: { user_name: "John Smith" },
    },
  );
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";
  import { ChatOpenAI } from "@langchain/openai";
  import { createAgent, tool } from "langchain";

  const getUserName = tool(
    (_, config) => {
      return config.context.user_name;
    },
    {
      name: "get_user_name",
      description: "Get the user's name.",
      schema: z.object({}),
    },
  );

  const contextSchema = z.object({
    user_name: z.string(),
  });

  const agent = createAgent({
    model: new ChatOpenAI({ model: "anthropic:claude-sonnet-4-6" }),
    tools: [getUserName],
    contextSchema,
  });

  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: "What is my name?" }],
    },
    {
      configurable: { thread_id: crypto.randomUUID() },
      context: { user_name: "John Smith" },
    },
  );
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";
  import { ChatOpenAI } from "@langchain/openai";
  import { createAgent, tool } from "langchain";

  const getUserName = tool(
    (_, config) => {
      return config.context.user_name;
    },
    {
      name: "get_user_name",
      description: "Get the user's name.",
      schema: z.object({}),
    },
  );

  const contextSchema = z.object({
    user_name: z.string(),
  });

  const agent = createAgent({
    model: new ChatOpenAI({ model: "openrouter:openrouter:z-ai/glm-5.2" }),
    tools: [getUserName],
    contextSchema,
  });

  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: "What is my name?" }],
    },
    {
      configurable: { thread_id: crypto.randomUUID() },
      context: { user_name: "John Smith" },
    },
  );
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";
  import { ChatOpenAI } from "@langchain/openai";
  import { createAgent, tool } from "langchain";

  const getUserName = tool(
    (_, config) => {
      return config.context.user_name;
    },
    {
      name: "get_user_name",
      description: "Get the user's name.",
      schema: z.object({}),
    },
  );

  const contextSchema = z.object({
    user_name: z.string(),
  });

  const agent = createAgent({
    model: new ChatOpenAI({ model: "fireworks:accounts/fireworks/models/glm-5p2" }),
    tools: [getUserName],
    contextSchema,
  });

  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: "What is my name?" }],
    },
    {
      configurable: { thread_id: crypto.randomUUID() },
      context: { user_name: "John Smith" },
    },
  );
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";
  import { ChatOpenAI } from "@langchain/openai";
  import { createAgent, tool } from "langchain";

  const getUserName = tool(
    (_, config) => {
      return config.context.user_name;
    },
    {
      name: "get_user_name",
      description: "Get the user's name.",
      schema: z.object({}),
    },
  );

  const contextSchema = z.object({
    user_name: z.string(),
  });

  const agent = createAgent({
    model: new ChatOpenAI({ model: "baseten:zai-org/GLM-5.2" }),
    tools: [getUserName],
    contextSchema,
  });

  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: "What is my name?" }],
    },
    {
      configurable: { thread_id: crypto.randomUUID() },
      context: { user_name: "John Smith" },
    },
  );
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";
  import { ChatOpenAI } from "@langchain/openai";
  import { createAgent, tool } from "langchain";

  const getUserName = tool(
    (_, config) => {
      return config.context.user_name;
    },
    {
      name: "get_user_name",
      description: "Get the user's name.",
      schema: z.object({}),
    },
  );

  const contextSchema = z.object({
    user_name: z.string(),
  });

  const agent = createAgent({
    model: new ChatOpenAI({ model: "ollama:north-mini-code-1.0" }),
    tools: [getUserName],
    contextSchema,
  });

  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: "What is my name?" }],
    },
    {
      configurable: { thread_id: crypto.randomUUID() },
      context: { user_name: "John Smith" },
    },
  );
  ```
</CodeGroup>

### 长期记忆（存储）

[⟦T47⟧](https://reference.langchain.com/javascript/langchain-core/stores/BaseStore) 提供跨对话持续存在的持久存储。与状态（短期记忆）不同，保存到存储的数据在未来的会话中仍然可用。

通过`config.store`进入商店。存储使用命名空间/键模式来组织数据：

```ts expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod";
import { createAgent, tool } from "langchain";
import { InMemoryStore } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

const store = new InMemoryStore();

// Access memory
const getUserInfo = tool(
  async ({ user_id }) => {
    const value = await store.get(["users"], user_id);
    console.log("get_user_info", user_id, value);
    return value;
  },
  {
    name: "get_user_info",
    description: "Look up user info.",
    schema: z.object({
      user_id: z.string(),
    }),
  }
);

// Update memory
const saveUserInfo = tool(
  async ({ user_id, name, age, email }) => {
    console.log("save_user_info", user_id, name, age, email);
    await store.put(["users"], user_id, { name, age, email });
    return "Successfully saved user info.";
  },
  {
    name: "save_user_info",
    description: "Save user info.",
    schema: z.object({
      user_id: z.string(),
      name: z.string(),
      age: z.number(),
      email: z.string(),
    }),
  }
);

const agent = createAgent({
  model: new ChatOpenAI({ model: "gpt-5.5" }),
  tools: [getUserInfo, saveUserInfo],
  store,
});

// First session: save user info
await agent.invoke({
  messages: [
    {
      role: "user",
      content: "Save the following user: userid: abc123, name: Foo, age: 25, email: foo@langchain.dev",
    },
  ],
});

// Second session: get user info
const result = await agent.invoke({
  messages: [
    { role: "user", content: "Get user info for user with id 'abc123'" },
  ],
});

console.log(result);
// Here is the user info for user with ID "abc123":
// - Name: Foo
// - Age: 25
// - Email: foo@langchain.dev
```

### 流作者

在执行期间从工具流式传输实时更新。这对于在长时间运行的操作期间向用户提供进度反馈非常有用。

使用 `config.writer` 发出自定义更新：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod";
import { tool, ToolRuntime } from "langchain";

const getWeather = tool(
  ({ city }, config: ToolRuntime) => {
    const writer = config.writer;

    // Stream custom updates as the tool executes
    if (writer) {
      writer(`Looking up data for city: ${city}`);
      writer(`Acquired data for city: ${city}`);
    }

    return `It's always sunny in ${city}!`;
  },
  {
    name: "get_weather",
    description: "Get weather for a given city.",
    schema: z.object({
      city: z.string(),
    }),
  }
);
```

### 执行信息

通过 `runtime.execution_info` 从工具内访问线程 ID、运行 ID 和重试状态：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import * as z from "zod";

const logExecutionContext = tool(
  async (_input, runtime) => {
    const info = runtime.executionInfo;
    console.log(`Thread: ${info.threadId}, Run: ${info.runId}`);  // [!code highlight]
    console.log(`Attempt: ${info.nodeAttempt}`);
    return "done";
  },
  {
    name: "log_execution_context",
    description: "Log execution identity information.",
    schema: z.object({}),
  }
);
```

<Note>
  需要`deepagents>=1.9.0`（或`@langchain/langgraph>=1.2.8`）。
</Note>

### 服务器信息

当您的工具在 LangGraph Server 上运行时，通过 `runtime.server_info` 访问助手 ID、图形 ID 和经过身份验证的用户：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import * as z from "zod";

const getAssistantScopedData = tool(
  async (_input, runtime) => {
    const server = runtime.serverInfo;
    if (server != null) {
      console.log(`Assistant: ${server.assistantId}, Graph: ${server.graphId}`);  // [!code highlight]
      if (server.user != null) {
        console.log(`User: ${server.user.identity}`);  // [!code highlight]
      }
    }
    return "done";
  },
  {
    name: "get_assistant_scoped_data",
    description: "Fetch data scoped to the current assistant.",
    schema: z.object({}),
  }
);
```

当该工具未在 LangGraph Server 上运行时，`serverInfo` 为 `null`。

<Note>
  需要`deepagents>=1.9.0`（或`@langchain/langgraph>=1.2.8`）。
</Note>

## 工具执行

在LangChain中，工具由代理使用（例如通过[⟦T58⟧](https://reference.langchain.com/javascript/langchain/index/createAgent)），工具错误处理通过[middleware](/oss/javascript/langchain/middleware)配置。对于 LangGraph 工作流程，工具执行由 [⟦T59⟧](https://reference.langchain.com/javascript/langchain-langgraph/prebuilt/ToolNode) 处理。请参阅[ToolNode](/oss/javascript/langgraph/workflows-agents#toolnode)了解图形 API 的使用，包括工具如何访问当前图形状态和运行范围的上下文。

### 工具返回值

您可以为您的工具选择不同的返回值：

* 返回 `string` 以获得人类可读的结果。
* 返回模型应解析的结构化结果的`object`。
* 当您需要写入状态时，返回带有可选消息的`Command`。

#### 返回一个字符串

当工具应提供纯文本供模型在下一个响应中读取和使用时，返回一个字符串。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import * as z from "zod";

const getWeather = tool(({ city }) => `It is currently sunny in ${city}.`, {
  name: "get_weather",
  description: "Get weather for a city.",
  schema: z.object({ city: z.string() }),
});
```

行为：

* 返回值转换为`ToolMessage`。
* 模型看到该文本并决定下一步做什么。
* 除非模型或其他工具稍后进行更改，否则不会更改代理状态字段。

当结果是自然可读的文本时使用此选项。

#### 返回一个对象

当您的工具生成模型应检查的结构化数据时，返回一个对象（例如，`dict`）。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import * as z from "zod";

const getWeatherData = tool(
  ({ city }) => ({
    city,
    temperature_c: 22,
    conditions: "sunny",
  }),
  {
    name: "get_weather_data",
    description: "Get structured weather data for a city.",
    schema: z.object({ city: z.string() }),
  },
);
```

行为：

* 对象被序列化并作为工具输出发回。
* 模型可以读取特定字段并对其进行推理。
* 与字符串返回一样，这不会直接更新图状态。当下游推理受益于显式字段而不是自由格式文本时，请使用此选项。

#### 返回多模式内容

工具不限于纯文本。当模型支持多模式工具结果时，该工具可以返回[standard content blocks](/oss/javascript/langchain/messages#standard-content-blocks)，以便模型在一个工具结果中接收文本、图像和其他媒体。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import { z } from "zod";

const captureScreenshot = tool(
  async () => [
    { type: "text", text: "Screenshot of the current page:" },
    { type: "image", url: "https://example.com/page.png" },
  ],
  {
    name: "capture_screenshot",
    description: "Capture a screenshot of the current page.",
    schema: z.object({}),
  }
);
```

行为：

* 返回值转换为具有多模式 `content` 的 `ToolMessage`。
* 工具运行后使用`message.content_blocks`读取标准化块列表。
* 该模型必须支持您返回的模式。在返回图像、音频或视频之前检查您的[model's capabilities](/oss/javascript/integrations/chat)。

有关块类型和提供商特定要求，请参阅[Multimodal messages](/oss/javascript/langchain/messages#multimodal)。返回图像或混合内容的 MCP 工具以相同的方式进行转换；参见[Multimodal tool content](/oss/javascript/langchain/mcp#multimodal-tool-content)。

#### 返回命令

当工具需要更新图形状态（例如，设置用户首选项或应用程序状态）时，返回[⟦T68⟧](https://reference.langchain.com/javascript/langchain-langgraph/index/Command)。
您可以退回包含或不包含 `ToolMessage` 的 `Command`。
如果模型需要查看工具是否成功（例如，确认首选项更改），请在更新中包含 `ToolMessage`，并使用 `runtime.tool_call_id` 作为 `tool_call_id` 参数。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool, ToolMessage, type ToolRuntime } from "langchain";
import { Command } from "@langchain/langgraph";
import * as z from "zod";

const setLanguage = tool(
  async ({ language }, config: ToolRuntime) => {
    return new Command({
      update: {
        preferredLanguage: language,
        messages: [
          new ToolMessage({
            content: `Language set to ${language}.`,
            tool_call_id: config.toolCallId,
          }),
        ],
      },
    });
  },
  {
    name: "set_language",
    description: "Set the preferred response language.",
    schema: z.object({ language: z.string() }),
  },
);
```

行为：* 该命令使用`update`更新状态。
* 更新后的状态可用于同一运行中的后续步骤。
* 对可能通过并行工具调用更新的字段使用缩减器。

当工具不仅返回数据，而且还改变代理状态时，请使用此选项。

#### 直接从工具返回

在工具上设置 return direct 以短路代理循环：代理立即将工具的输出返回给调用者，而不通过模型将其发送回以进行进一步处理。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { ChatOpenAI } from "@langchain/openai";
  import { createAgent, tool } from "langchain";
  import * as z from "zod";

  const fetchOrderStatus = tool(
    ({ order_id }) => {
      return `Order ${order_id} is shipped and will arrive in 2 days.`;
    },
    {
      name: "fetch_order_status",
      description: "Fetch the current status of a customer order.",
      schema: z.object({ order_id: z.string() }),
      returnDirect: true,
    },
  );

  const agent = createAgent({
    model: new ChatOpenAI({ model: "google-genai:gemini-3.6-flash" }),
    tools: [fetchOrderStatus],
  });

  const result = await agent.invoke({
    messages: [
      { role: "user", content: "What is the status of order #12345?" },
    ],
  });
  // The agent returns the tool output directly without another LLM call:
  // "Order 12345 is shipped and will arrive in 2 days."
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { ChatOpenAI } from "@langchain/openai";
  import { createAgent, tool } from "langchain";
  import * as z from "zod";

  const fetchOrderStatus = tool(
    ({ order_id }) => {
      return `Order ${order_id} is shipped and will arrive in 2 days.`;
    },
    {
      name: "fetch_order_status",
      description: "Fetch the current status of a customer order.",
      schema: z.object({ order_id: z.string() }),
      returnDirect: true,
    },
  );

  const agent = createAgent({
    model: new ChatOpenAI({ model: "openai:gpt-5.5" }),
    tools: [fetchOrderStatus],
  });

  const result = await agent.invoke({
    messages: [
      { role: "user", content: "What is the status of order #12345?" },
    ],
  });
  // The agent returns the tool output directly without another LLM call:
  // "Order 12345 is shipped and will arrive in 2 days."
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { ChatOpenAI } from "@langchain/openai";
  import { createAgent, tool } from "langchain";
  import * as z from "zod";

  const fetchOrderStatus = tool(
    ({ order_id }) => {
      return `Order ${order_id} is shipped and will arrive in 2 days.`;
    },
    {
      name: "fetch_order_status",
      description: "Fetch the current status of a customer order.",
      schema: z.object({ order_id: z.string() }),
      returnDirect: true,
    },
  );

  const agent = createAgent({
    model: new ChatOpenAI({ model: "anthropic:claude-sonnet-4-6" }),
    tools: [fetchOrderStatus],
  });

  const result = await agent.invoke({
    messages: [
      { role: "user", content: "What is the status of order #12345?" },
    ],
  });
  // The agent returns the tool output directly without another LLM call:
  // "Order 12345 is shipped and will arrive in 2 days."
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { ChatOpenAI } from "@langchain/openai";
  import { createAgent, tool } from "langchain";
  import * as z from "zod";

  const fetchOrderStatus = tool(
    ({ order_id }) => {
      return `Order ${order_id} is shipped and will arrive in 2 days.`;
    },
    {
      name: "fetch_order_status",
      description: "Fetch the current status of a customer order.",
      schema: z.object({ order_id: z.string() }),
      returnDirect: true,
    },
  );

  const agent = createAgent({
    model: new ChatOpenAI({ model: "openrouter:openrouter:z-ai/glm-5.2" }),
    tools: [fetchOrderStatus],
  });

  const result = await agent.invoke({
    messages: [
      { role: "user", content: "What is the status of order #12345?" },
    ],
  });
  // The agent returns the tool output directly without another LLM call:
  // "Order 12345 is shipped and will arrive in 2 days."
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { ChatOpenAI } from "@langchain/openai";
  import { createAgent, tool } from "langchain";
  import * as z from "zod";

  const fetchOrderStatus = tool(
    ({ order_id }) => {
      return `Order ${order_id} is shipped and will arrive in 2 days.`;
    },
    {
      name: "fetch_order_status",
      description: "Fetch the current status of a customer order.",
      schema: z.object({ order_id: z.string() }),
      returnDirect: true,
    },
  );

  const agent = createAgent({
    model: new ChatOpenAI({ model: "fireworks:accounts/fireworks/models/glm-5p2" }),
    tools: [fetchOrderStatus],
  });

  const result = await agent.invoke({
    messages: [
      { role: "user", content: "What is the status of order #12345?" },
    ],
  });
  // The agent returns the tool output directly without another LLM call:
  // "Order 12345 is shipped and will arrive in 2 days."
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { ChatOpenAI } from "@langchain/openai";
  import { createAgent, tool } from "langchain";
  import * as z from "zod";

  const fetchOrderStatus = tool(
    ({ order_id }) => {
      return `Order ${order_id} is shipped and will arrive in 2 days.`;
    },
    {
      name: "fetch_order_status",
      description: "Fetch the current status of a customer order.",
      schema: z.object({ order_id: z.string() }),
      returnDirect: true,
    },
  );

  const agent = createAgent({
    model: new ChatOpenAI({ model: "baseten:zai-org/GLM-5.2" }),
    tools: [fetchOrderStatus],
  });

  const result = await agent.invoke({
    messages: [
      { role: "user", content: "What is the status of order #12345?" },
    ],
  });
  // The agent returns the tool output directly without another LLM call:
  // "Order 12345 is shipped and will arrive in 2 days."
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { ChatOpenAI } from "@langchain/openai";
  import { createAgent, tool } from "langchain";
  import * as z from "zod";

  const fetchOrderStatus = tool(
    ({ order_id }) => {
      return `Order ${order_id} is shipped and will arrive in 2 days.`;
    },
    {
      name: "fetch_order_status",
      description: "Fetch the current status of a customer order.",
      schema: z.object({ order_id: z.string() }),
      returnDirect: true,
    },
  );

  const agent = createAgent({
    model: new ChatOpenAI({ model: "ollama:north-mini-code-1.0" }),
    tools: [fetchOrderStatus],
  });

  const result = await agent.invoke({
    messages: [
      { role: "user", content: "What is the status of order #12345?" },
    ],
  });
  // The agent returns the tool output directly without another LLM call:
  // "Order 12345 is shipped and will arrive in 2 days."
  ```
</CodeGroup>

行为：

* 该工具正常执行，其输出包装在 `ToolMessage` 中。
* 代理停止循环并返回工具的输出作为最终响应，绕过任何其他模型调用。
* 如果模型单回合调用多个工具，只有当**所有**调用的工具都有`return_direct=True`时，`return_direct`才生效。

在以下情况下使用此功能：* 该工具的输出是完整的、可供用户使用的答案（例如，返回可立即显示的结果的查找）。
* 当不需要额外的推理时，您希望避免额外的模型调用。
* 您需要确定性的、未经修改的输出 - 模型无法重新表述、总结或对工具结果采取行动。

<Warning>
  由于模型不处理工具的输出，`return_direct=True` 不适合其结果需要进一步推理、汇总或与其他工具调用链接的工具。
</Warning>

### 错误处理

使用 LangChain 代理[middleware](/oss/javascript/langchain/middleware)处理工具错误，重试失败的工具调用或返回自定义错误消息：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, createMiddleware, ToolMessage } from "langchain";

  const handleToolErrors = createMiddleware({
    name: "HandleToolErrors",
    wrapToolCall: async (request, handler) => {
      try {
        return await handler(request);
      } catch (error) {
        return new ToolMessage({
          content: `Tool error: Please check your input and try again. (${error})`,
          tool_call_id: request.toolCall.id!,
        });
      }
    },
  });

  const agent = createAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [],
    middleware: [handleToolErrors],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, createMiddleware, ToolMessage } from "langchain";

  const handleToolErrors = createMiddleware({
    name: "HandleToolErrors",
    wrapToolCall: async (request, handler) => {
      try {
        return await handler(request);
      } catch (error) {
        return new ToolMessage({
          content: `Tool error: Please check your input and try again. (${error})`,
          tool_call_id: request.toolCall.id!,
        });
      }
    },
  });

  const agent = createAgent({
    model: "openai:gpt-5.5",
    tools: [],
    middleware: [handleToolErrors],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, createMiddleware, ToolMessage } from "langchain";

  const handleToolErrors = createMiddleware({
    name: "HandleToolErrors",
    wrapToolCall: async (request, handler) => {
      try {
        return await handler(request);
      } catch (error) {
        return new ToolMessage({
          content: `Tool error: Please check your input and try again. (${error})`,
          tool_call_id: request.toolCall.id!,
        });
      }
    },
  });

  const agent = createAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [],
    middleware: [handleToolErrors],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, createMiddleware, ToolMessage } from "langchain";

  const handleToolErrors = createMiddleware({
    name: "HandleToolErrors",
    wrapToolCall: async (request, handler) => {
      try {
        return await handler(request);
      } catch (error) {
        return new ToolMessage({
          content: `Tool error: Please check your input and try again. (${error})`,
          tool_call_id: request.toolCall.id!,
        });
      }
    },
  });

  const agent = createAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [],
    middleware: [handleToolErrors],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, createMiddleware, ToolMessage } from "langchain";

  const handleToolErrors = createMiddleware({
    name: "HandleToolErrors",
    wrapToolCall: async (request, handler) => {
      try {
        return await handler(request);
      } catch (error) {
        return new ToolMessage({
          content: `Tool error: Please check your input and try again. (${error})`,
          tool_call_id: request.toolCall.id!,
        });
      }
    },
  });

  const agent = createAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [],
    middleware: [handleToolErrors],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, createMiddleware, ToolMessage } from "langchain";

  const handleToolErrors = createMiddleware({
    name: "HandleToolErrors",
    wrapToolCall: async (request, handler) => {
      try {
        return await handler(request);
      } catch (error) {
        return new ToolMessage({
          content: `Tool error: Please check your input and try again. (${error})`,
          tool_call_id: request.toolCall.id!,
        });
      }
    },
  });

  const agent = createAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [],
    middleware: [handleToolErrors],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, createMiddleware, ToolMessage } from "langchain";

  const handleToolErrors = createMiddleware({
    name: "HandleToolErrors",
    wrapToolCall: async (request, handler) => {
      try {
        return await handler(request);
      } catch (error) {
        return new ToolMessage({
          content: `Tool error: Please check your input and try again. (${error})`,
          tool_call_id: request.toolCall.id!,
        });
      }
    },
  });

  const agent = createAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [],
    middleware: [handleToolErrors],
  });
  ```
</CodeGroup>

### 状态注入

工具通过[⟦T79⟧](https://reference.langchain.com/javascript/langchain/index/Runtime)访问图状态。有关状态、上下文、存储和流 API，请参阅[Access context](#access-context)。

有关从工具访问状态、上下文和长期记忆的更多详细信息，请参阅[Access context](#access-context)。

## 动态工具选择使用动态工具，代理可用的工具集可以在运行时修改，而不是预先定义。并非每种工具都适合每种情况。太多的工具可能会压垮模型（超载上下文）并增加错误；太少限制了能力。动态工具选择可以根据身份验证状态、用户权限、功能标志或对话阶段来调整可用的工具集。

根据工具是否提前已知，有两种方法：

<Tabs>
  <Tab title="Filtering pre-registered tools">
    当所有可能的工具在代理创建时已知时，您可以预先注册它们，并根据状态、权限或上下文动态过滤哪些工具暴露给模型。

    <Tabs>
      <Tab title="State">
        仅在某些对话里程碑后启用高级工具：

        ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { createMiddleware, tool } from "langchain";
        import { createDeepAgent } from "deepagents";

        const stateBasedTools = createMiddleware({
            name: "StateBasedTools",
            wrapModelCall: (request, handler) => {
                // Read from State: check authentication and conversation length
                const state = request.state as typeof request.state & {
                    authenticated?: boolean;
                };
                const isAuthenticated = state.authenticated ?? false;
                const messageCount = state.messages.length;

                let filteredTools = request.tools;

                // Only enable sensitive tools after authentication
                if (!isAuthenticated) {
                    filteredTools = request.tools.filter(
                        (t: any) => typeof t.name === "string" && t.name.startsWith("public_"),
                    );
                } else if (messageCount < 5) {
                    filteredTools = request.tools.filter(
                        (t: any) => typeof t.name === "string" && t.name !== "advanced_search",
                    );
                }

                return handler({ ...request, tools: filteredTools });
            },
        });

        const agent = await createDeepAgent({
            model: "claude-sonnet-4-6",
            tools: tools,
            middleware: [stateBasedTools] as any,
        });
        ```
      </Tab>

      <Tab title="Store">
        根据用户偏好或商店中的功能标志过滤工具：

        ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { createMiddleware } from "langchain";
        import { createDeepAgent, StoreBackend } from "deepagents";
        import * as z from "zod";
        import { InMemoryStore } from "@langchain/langgraph";

        const contextSchema = z.object({
          userId: z.string(),
        });

        const storeBasedTools = createMiddleware({
          name: "StoreBasedTools",
          contextSchema,
          wrapModelCall: async (request, handler) => {
            const userId =
              (request.runtime?.context as { userId?: string } | undefined)?.userId ??
                "user-123";

            // Read from Store: get user's enabled features
            const runtimeStore = request.runtime?.store as InMemoryStore | undefined;
            const rawFlags = (await runtimeStore?.get(
              ["features"],
              userId as string,
            )) as unknown;
            const featureFlags = rawFlags as FeatureFlags | undefined;

            let filteredTools = request.tools;

            if (featureFlags) {
              const enabledFeatures = featureFlags.enabledTools || [];
              filteredTools = request.tools.filter((t) =>
                enabledFeatures.includes(t.name as string)
              );
            }

            return handler({ ...request, tools: filteredTools });
          },
        });

        const agent = await createDeepAgent({
          model: "claude-sonnet-4-6",
          backend: new StoreBackend(),
          store,
          checkpointer,
          tools,
          middleware: [storeBasedTools] as any,
        });
        ```
      </Tab>

      <Tab title="Runtime Context">
        根据运行时上下文中的用户权限过滤工具：

        ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import * as z from "zod";
        import { createMiddleware } from "langchain";
        import { createDeepAgent } from "deepagents";

        const contextSchema = z.object({
          userRole: z.string(),
        });

        const contextBasedTools = createMiddleware({
          name: "ContextBasedTools",
          contextSchema,
          wrapModelCall: (request, handler) => {
            // Read from Runtime Context: get user role
            const userRole = request.runtime.context.userRole;

            let filteredTools = request.tools;

            if (userRole === "admin") {
              // Admins get all tools
            } else if (userRole === "editor") {
              filteredTools = request.tools.filter((t) => t.name !== "delete_data");
            } else {
              filteredTools = request.tools.filter(
                (t) => (t.name as string).startsWith("read_"),
              );
            }

            return handler({ ...request, tools: filteredTools });
          },
        });

        const agent = await createDeepAgent({
          model: "claude-sonnet-4-6",
          store,
          checkpointer,
          tools,
          middleware: [contextBasedTools] as any,
        });
        ```
      </Tab>
    </Tabs>

    这种方法在以下情况下效果最佳：* 所有可能的工具在编译/启动时都是已知的
    * 您想要根据权限、功能标志或对话状态进行过滤
    * 工具是静态的，但其可用性是动态的

    更多示例请参见[Dynamically selecting tools](/oss/javascript/langchain/middleware/custom#dynamically-selecting-tools)。
  </Tab>

  <Tab title="Runtime tool registration">
    当在运行时发现或创建工具时（例如，从 MCP 服务器加载、根据用户数据生成或从远程注册表获取），您需要注册工具并动态处理其执行。

    这需要两个中间件挂钩：

    1. `wrap_model_call` - 将动态工具添加到请求中
    2. `wrap_tool_call` - 处理动态添加工具的执行

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createAgent, createMiddleware, tool } from "langchain";
    import * as z from "zod";

    // A tool that will be added dynamically at runtime
    const calculateTip = tool(
      ({ billAmount, tipPercentage = 20 }) => {
        const tip = billAmount * (tipPercentage / 100);
        return `Tip: $${tip.toFixed(2)}, Total: $${(billAmount + tip).toFixed(2)}`;
      },
      {
        name: "calculate_tip",
        description: "Calculate the tip amount for a bill",
        schema: z.object({
          billAmount: z.number().describe("The bill amount"),
          tipPercentage: z.number().default(20).describe("Tip percentage"),
        }),
      }
    );

    const dynamicToolMiddleware = createMiddleware({
      name: "DynamicToolMiddleware",
      wrapModelCall: (request, handler) => {
        // Add dynamic tool to the request
        // This could be loaded from an MCP server, database, etc.
        return handler({
          ...request,
          tools: [...request.tools, calculateTip],
        });
      },
      wrapToolCall: (request, handler) => {
        // Handle execution of the dynamic tool
        if (request.toolCall.name === "calculate_tip") {
          return handler({ ...request, tool: calculateTip });
        }
        return handler(request);
      },
    });

    const agent = createAgent({
      model: "gpt-5.5",
      tools: [getWeather], // Only static tools registered here
      middleware: [dynamicToolMiddleware],
    });

    // The agent can now use both getWeather AND calculateTip
    const result = await agent.invoke({
      messages: [{ role: "user", content: "Calculate a 20% tip on $85" }],
    });
    ```

    这种方法在以下情况下效果最佳：

    * 工具在运行时发现（例如，从 MCP 服务器）
    * 工具根据用户数据或配置动态生成
    * 您正在与外部工具注册表集成

    <Note>
      运行时注册的工具需要 `wrap_tool_call` 钩子，因为代理需要知道如何执行原始工具列表中没有的工具。如果没有它，代理将不知道如何调用动态添加的工具。
    </Note>
  </Tab>
</Tabs>

## 无头工具某些工具应该在**用户应用程序运行的地方**（通常是浏览器）运行，而不是在进程内部运行。 **无头工具**是工具定义，其中包括您在代理的**服务器**上注册的名称、描述和参数架构。 **实现**仅在**客户端**上注册，并在短暂的中断/恢复握手后执行。

这与函数体运行在服务器上的普通工具不同，也与模型提供者远程执行内置工具的[server-side tool use](#server-side-tool-use)不同。

### 何时使用无头工具

当工作依赖于仅存在于客户端的**环境、设备或 UI** 时，请使用它们。例如：

* **浏览器 API：** 地理定位、IndexedDB、剪贴板、Canvas 2D、文件选择器、电池 API 等。
* **隐私和局部性：** 数据保留在设备上（例如，IndexedDB 中的本地“内存”）。
* **延迟：** 纯本地操作无需额外的服务器往返。
* **结构化、安全的效果：** 更喜欢许多小型的类型化工具（例如每个画布基元一个工具），而不是向 `eval` 发送任意代码。

### 该模式如何运作在这两个运行时中，模型都会看到它可以调用的普通工具，但实际执行发生在服务器进程之外。

1. **定义**使用`langchain`中的`tool({ name, description, schema })`的工具，仅元数据和验证，无服务器端运行器。
2. **使用`.implement(async (args) => { ... })`附加**真实行为，它返回一个**无头工具实现**（定义+`execute`函数）。
3. **使用 `createAgent` 或您的图形**注册**步骤 1 中的定义，以便模型在其通常的工具调用循环中看到该工具。
4. **将**第 2 步的实现传递给流式挂钩的 `tools` 选项。

<Info>
  将**工具定义**（`tool({ name, description, schema })`）和**实现**（`.implement(...)`）放在**单独的模块**中。从服务器代理和前端导入共享定义文件，以便名称和架构保持一致；将仅客户端执行逻辑保留在服务器永远不会加载的实现模块中。
</Info>当模型发出对这些工具之一的工具调用时，运行**中断**，而不是在本地执行该工具。您的应用程序可以检查有效负载，在正确的环境（例如浏览器、其他服务或人工审核步骤）中执行操作，然后使用工具结果**恢复**图表。当您使用受支持的 JS SDK 挂钩时，它们可以检测无头工具中断，运行匹配的客户端实现，并为您提交恢复命令。

使用可选的 **`onTool`** 回调来观察生命周期事件（`start`、`success`、`error`）以获取 UI 反馈，例如旋转器或 toast。

<Card title="Headless tools frontend pattern" href="/oss/javascript/langchain/frontend/headless-tools" icon="device-desktop">
  请参阅使用 `useStream` 在客户端中执行的仅模式工具的端到端示例。
</Card>

## 预构建工具

LangChain 提供了大量预构建工具和工具包，用于执行 Web 搜索、代码解释、数据库访问等常见任务。这些即用型工具可以直接集成到您的代理中，无需编写自定义代码。

请参阅 [tools and toolkits](/oss/javascript/integrations/tools) 集成页面，获取按类别组织的可用工具的完整列表。

## 服务器端工具使用某些聊天模型具有由模型提供者在服务器端执行的内置工具。其中包括网络搜索和代码解释器等功能，不需要您定义或托管工具逻辑。

有关启用和使用这些内置工具的详细信息，请参阅单独的 [chat model integration pages](/oss/javascript/integrations/providers) 和 [tool calling documentation](/oss/javascript/langchain/models#server-side-tool-use)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/tools.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>