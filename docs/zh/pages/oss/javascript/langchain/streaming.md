<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Streaming | https://docs.langchain.com/oss/javascript/langchain/streaming -->

# 流媒体

从代理运行流式传输实时更新

<Tip>
  对于新应用，我们推荐[event streaming](/oss/javascript/langchain/event-streaming)——LangChain v1.3中引入的类型化投影API。事件流为每个投影（消息、值、工具调用、子图）提供单独的迭代器，因此您可以独立使用它们，而不是在 `stream_mode` 块上分支。
</Tip>

LangChain实现了一个流系统来显示实时更新。

流媒体对于增强基于 LLM 构建的应用程序的响应能力至关重要。通过逐步显示输出，甚至在完整响应准备好之前，流式传输显着改善了用户体验 (UX)，特别是在处理 LLM 的延迟时。

## 概述

LangChain 的流媒体系统可让您将代理运行的实时反馈显示到您的应用程序。

LangChain 流媒体可以实现什么：

* <Icon icon="brain" /> [**Stream agent progress**](#agent-progress)—在每个代理步骤之后获取状态更新。
* <Icon icon="binary" /> [**Stream LLM tokens**](#llm-tokens)—生成时流式传输语言模型标记。
* <Icon icon="bulb" /> [**Stream thinking / reasoning tokens**](#streaming-thinking-/-reasoning-tokens)—生成的表面模型推理。
* <Icon icon="table" /> [**Stream custom updates**](#custom-updates)—发出用户定义的信号（例如，`"Fetched 10/100 records"`）。
* <Icon icon="stack-push" /> [**Stream multiple modes**](#stream-multiple-modes) — 从 `updates`（代理进度）、`messages`（LLM 代币 + 元数据）或 `custom`（任意用户数据）中选择。有关其他端到端示例，请参阅下面的[common patterns](#common-patterns)部分。

## 支持的流模式

将以下一种或多种流模式作为列表传递给 [⟦T19⟧](https://reference.langchain.com/javascript/classes/_langchain_langgraph.index.CompiledStateGraph.html#stream) 方法：

|模式|描述 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `updates` |每个代理步骤后流状态更新。如果在同一步骤中进行多个更新（例如，运行多个节点），则这些更新将单独流式传输。 |
| `messages` |从调用 LLM 的任何图形节点流式传输 `(token, metadata)` 的元组。                                                                               |
| `custom` |使用流编写器从图形节点内部流式传输自定义数据。                                                                                         |

## 代理进度

要流式传输代理进度，请使用 [⟦T24⟧](https://reference.langchain.com/javascript/classes/_langchain_langgraph.index.CompiledStateGraph.html#stream) 方法和 `streamMode: "updates"`。这会在每个代理步骤之后发出一个事件。例如，如果您有一个代理调用一次工具，您应该会看到以下更新：

* **LLM 节点**：[⟦T26⟧](https://reference.langchain.com/javascript/langchain-core/messages/AIMessage) 带有工具调用请求
* **工具节点**：[⟦T27⟧](https://reference.langchain.com/javascript/langchain-core/messages/ToolMessage)及执行结果
* **LLM节点**：最终AI响应

通过 `configurable` 传递 `thread_id`，因此对话会被检查点，并且后续回合可以恢复相同的历史记录。 `thread_id` 独立于`streamMode`；您还可以将 `context` 与其一起传递，以获取工具从 `runtime.context` 读取的每次运行数据。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, tool } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";
  import z from "zod";

  const getWeather = tool(
    async ({ city }) => {
      return `The weather in ${city} is always sunny!`;
    },
    {
      name: "get_weather",
      description: "Get weather for a given city.",
      schema: z.object({
        city: z.string(),
      }),
    },
  );

  const agent = createAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [getWeather],
    checkpointer: new MemorySaver(),
  });

  const config = { configurable: { thread_id: crypto.randomUUID() } };

  const stream = await agent.streamEvents(
    { messages: [{ role: "user", content: "what is the weather in sf" }] },
    { ...config, version: "v3" },
  );
  await Promise.all([
    (async () => {
      for await (const message of stream.messages) {
        for await (const token of message.text) {
          process.stdout.write(token);
        }
      }
    })(),
    (async () => {
      for await (const call of stream.toolCalls) {
        console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
        console.log(`Tool result: ${await call.output}`);
      }
    })(),
  ]);

  const finalState = await stream.output;
  // Tool call: get_weather({"city":"San Francisco"})
  // Tool result: [object ToolMessage]
  // According to the data I have, the weather in San Francisco is always sunny! Would you like current conditions or a short forecast for today or the next few days?
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, tool } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";
  import z from "zod";

  const getWeather = tool(
    async ({ city }) => {
      return `The weather in ${city} is always sunny!`;
    },
    {
      name: "get_weather",
      description: "Get weather for a given city.",
      schema: z.object({
        city: z.string(),
      }),
    },
  );

  const agent = createAgent({
    model: "openai:gpt-5.5",
    tools: [getWeather],
    checkpointer: new MemorySaver(),
  });

  const config = { configurable: { thread_id: crypto.randomUUID() } };

  const stream = await agent.streamEvents(
    { messages: [{ role: "user", content: "what is the weather in sf" }] },
    { ...config, version: "v3" },
  );
  await Promise.all([
    (async () => {
      for await (const message of stream.messages) {
        for await (const token of message.text) {
          process.stdout.write(token);
        }
      }
    })(),
    (async () => {
      for await (const call of stream.toolCalls) {
        console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
        console.log(`Tool result: ${await call.output}`);
      }
    })(),
  ]);

  const finalState = await stream.output;
  // Tool call: get_weather({"city":"San Francisco"})
  // Tool result: [object ToolMessage]
  // According to the data I have, the weather in San Francisco is always sunny! Would you like current conditions or a short forecast for today or the next few days?
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, tool } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";
  import z from "zod";

  const getWeather = tool(
    async ({ city }) => {
      return `The weather in ${city} is always sunny!`;
    },
    {
      name: "get_weather",
      description: "Get weather for a given city.",
      schema: z.object({
        city: z.string(),
      }),
    },
  );

  const agent = createAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [getWeather],
    checkpointer: new MemorySaver(),
  });

  const config = { configurable: { thread_id: crypto.randomUUID() } };

  const stream = await agent.streamEvents(
    { messages: [{ role: "user", content: "what is the weather in sf" }] },
    { ...config, version: "v3" },
  );
  await Promise.all([
    (async () => {
      for await (const message of stream.messages) {
        for await (const token of message.text) {
          process.stdout.write(token);
        }
      }
    })(),
    (async () => {
      for await (const call of stream.toolCalls) {
        console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
        console.log(`Tool result: ${await call.output}`);
      }
    })(),
  ]);

  const finalState = await stream.output;
  // Tool call: get_weather({"city":"San Francisco"})
  // Tool result: [object ToolMessage]
  // According to the data I have, the weather in San Francisco is always sunny! Would you like current conditions or a short forecast for today or the next few days?
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, tool } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";
  import z from "zod";

  const getWeather = tool(
    async ({ city }) => {
      return `The weather in ${city} is always sunny!`;
    },
    {
      name: "get_weather",
      description: "Get weather for a given city.",
      schema: z.object({
        city: z.string(),
      }),
    },
  );

  const agent = createAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [getWeather],
    checkpointer: new MemorySaver(),
  });

  const config = { configurable: { thread_id: crypto.randomUUID() } };

  const stream = await agent.streamEvents(
    { messages: [{ role: "user", content: "what is the weather in sf" }] },
    { ...config, version: "v3" },
  );
  await Promise.all([
    (async () => {
      for await (const message of stream.messages) {
        for await (const token of message.text) {
          process.stdout.write(token);
        }
      }
    })(),
    (async () => {
      for await (const call of stream.toolCalls) {
        console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
        console.log(`Tool result: ${await call.output}`);
      }
    })(),
  ]);

  const finalState = await stream.output;
  // Tool call: get_weather({"city":"San Francisco"})
  // Tool result: [object ToolMessage]
  // According to the data I have, the weather in San Francisco is always sunny! Would you like current conditions or a short forecast for today or the next few days?
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, tool } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";
  import z from "zod";

  const getWeather = tool(
    async ({ city }) => {
      return `The weather in ${city} is always sunny!`;
    },
    {
      name: "get_weather",
      description: "Get weather for a given city.",
      schema: z.object({
        city: z.string(),
      }),
    },
  );

  const agent = createAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [getWeather],
    checkpointer: new MemorySaver(),
  });

  const config = { configurable: { thread_id: crypto.randomUUID() } };

  const stream = await agent.streamEvents(
    { messages: [{ role: "user", content: "what is the weather in sf" }] },
    { ...config, version: "v3" },
  );
  await Promise.all([
    (async () => {
      for await (const message of stream.messages) {
        for await (const token of message.text) {
          process.stdout.write(token);
        }
      }
    })(),
    (async () => {
      for await (const call of stream.toolCalls) {
        console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
        console.log(`Tool result: ${await call.output}`);
      }
    })(),
  ]);

  const finalState = await stream.output;
  // Tool call: get_weather({"city":"San Francisco"})
  // Tool result: [object ToolMessage]
  // According to the data I have, the weather in San Francisco is always sunny! Would you like current conditions or a short forecast for today or the next few days?
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, tool } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";
  import z from "zod";

  const getWeather = tool(
    async ({ city }) => {
      return `The weather in ${city} is always sunny!`;
    },
    {
      name: "get_weather",
      description: "Get weather for a given city.",
      schema: z.object({
        city: z.string(),
      }),
    },
  );

  const agent = createAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [getWeather],
    checkpointer: new MemorySaver(),
  });

  const config = { configurable: { thread_id: crypto.randomUUID() } };

  const stream = await agent.streamEvents(
    { messages: [{ role: "user", content: "what is the weather in sf" }] },
    { ...config, version: "v3" },
  );
  await Promise.all([
    (async () => {
      for await (const message of stream.messages) {
        for await (const token of message.text) {
          process.stdout.write(token);
        }
      }
    })(),
    (async () => {
      for await (const call of stream.toolCalls) {
        console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
        console.log(`Tool result: ${await call.output}`);
      }
    })(),
  ]);

  const finalState = await stream.output;
  // Tool call: get_weather({"city":"San Francisco"})
  // Tool result: [object ToolMessage]
  // According to the data I have, the weather in San Francisco is always sunny! Would you like current conditions or a short forecast for today or the next few days?
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, tool } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";
  import z from "zod";

  const getWeather = tool(
    async ({ city }) => {
      return `The weather in ${city} is always sunny!`;
    },
    {
      name: "get_weather",
      description: "Get weather for a given city.",
      schema: z.object({
        city: z.string(),
      }),
    },
  );

  const agent = createAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [getWeather],
    checkpointer: new MemorySaver(),
  });

  const config = { configurable: { thread_id: crypto.randomUUID() } };

  const stream = await agent.streamEvents(
    { messages: [{ role: "user", content: "what is the weather in sf" }] },
    { ...config, version: "v3" },
  );
  await Promise.all([
    (async () => {
      for await (const message of stream.messages) {
        for await (const token of message.text) {
          process.stdout.write(token);
        }
      }
    })(),
    (async () => {
      for await (const call of stream.toolCalls) {
        console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
        console.log(`Tool result: ${await call.output}`);
      }
    })(),
  ]);

  const finalState = await stream.output;
  // Tool call: get_weather({"city":"San Francisco"})
  // Tool result: [object ToolMessage]
  // According to the data I have, the weather in San Francisco is always sunny! Would you like current conditions or a short forecast for today or the next few days?
  ```
</CodeGroup>

<Note>
  保留与 `thread_id` 的对话历史记录需要使用 [checkpointer](/oss/javascript/langchain/long-term-memory) 配置代理。在 [LangSmith deployments](/langsmith/deployment) 上，会自动配置检查点。在本地，显式传递一个，例如 `createAgent({ ..., checkpointer: new MemorySaver() })`。为了简洁起见，此页面上的其余片段省略了 `thread_id`，但您应该在生产中传递它。
</Note>

## LLM 代币

要流式传输 LLM 生成的令牌，请使用 `streamMode: "messages"`：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import z from "zod";
import { createAgent, tool } from "langchain";

const getWeather = tool(
    async ({ city }) => {
        return `The weather in ${city} is always sunny!`;
    },
    {
        name: "get_weather",
        description: "Get weather for a given city.",
        schema: z.object({
        city: z.string(),
        }),
    }
);

const agent = createAgent({
    model: "gpt-5.4-mini",
    tools: [getWeather],
});

for await (const [token, metadata] of await agent.stream(
    { messages: [{ role: "user", content: "what is the weather in sf" }] },
    { streamMode: "messages" }
)) {
    console.log(`node: ${metadata.langgraph_node}`);
    console.log(`content: ${JSON.stringify(token.contentBlocks, null, 2)}`);
}
```

<Note>
  **将代理包装为父级`StateGraph`中的节点？** [⟦T39⟧](https://reference.langchain.com/javascript/langchain/index/createAgent)返回一个`ReactAgent`包装器；添加为节点时传递`agent.graph`。使用`subgraphs: true`，因此消息块包含子图名称空间。参见[Subgraph outputs](/oss/javascript/langgraph/streaming#subgraph-outputs)。
</Note>

## 自定义更新要在工具执行时流式传输更新，您可以使用配置中的 `writer` 参数。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import z from "zod";
import { tool, createAgent } from "langchain";
import { LangGraphRunnableConfig } from "@langchain/langgraph";

const getWeather = tool(
    async (input, config: LangGraphRunnableConfig) => {
        // Stream any arbitrary data
        config.writer?.(`Looking up data for city: ${input.city}`);
        // ... fetch city data
        config.writer?.(`Acquired data for city: ${input.city}`);
        return `It's always sunny in ${input.city}!`;
    },
    {
        name: "get_weather",
        description: "Get weather for a given city.",
        schema: z.object({
        city: z.string().describe("The city to get weather for."),
        }),
    }
);

const agent = createAgent({
    model: "gpt-5.4-mini",
    tools: [getWeather],
});

for await (const chunk of await agent.stream(
    { messages: [{ role: "user", content: "what is the weather in sf" }] },
    { streamMode: "custom" }
)) {
    console.log(chunk);
}
```

```shell title="Output" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Looking up data for city: San Francisco
Acquired data for city: San Francisco
```

<Note>
  如果将 `writer` 参数添加到工具中，则在不提供编写器函数的情况下，您将无法在 LangGraph 执行上下文之外调用该工具。
</Note>

## 多种流模式

您可以通过将streamMode作为数组传递来指定多种流模式：`streamMode: ["updates", "messages", "custom"]`。

流式输出将是 `[mode, chunk]` 的元组，其中 `mode` 是流模式的名称，`chunk` 是该模式流式传输的数据。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import z from "zod";
import { tool, createAgent } from "langchain";
import { LangGraphRunnableConfig } from "@langchain/langgraph";

const getWeather = tool(
    async (input, config: LangGraphRunnableConfig) => {
        // Stream any arbitrary data
        config.writer?.(`Looking up data for city: ${input.city}`);
        // ... fetch city data
        config.writer?.(`Acquired data for city: ${input.city}`);
        return `It's always sunny in ${input.city}!`;
    },
    {
        name: "get_weather",
        description: "Get weather for a given city.",
        schema: z.object({
        city: z.string().describe("The city to get weather for."),
        }),
    }
);

const agent = createAgent({
    model: "gpt-5.4-mini",
    tools: [getWeather],
});

for await (const [streamMode, chunk] of await agent.stream(
    { messages: [{ role: "user", content: "what is the weather in sf" }] },
    { streamMode: ["updates", "messages", "custom"] }
)) {
    console.log(`${streamMode}: ${JSON.stringify(chunk, null, 2)}`);
}
```

## 常见模式

以下示例显示了流式传输的常见用例。

### 流式思维/推理代币

一些模型在产生最终答案之前执行内部推理。您可以流式传输这些通过过滤 [standard content blocks](/oss/javascript/langchain/messages#standard-content-blocks) 以获得 `type` `"reasoning"` 生成的思考/推理标记。

<Note>
  必须在模型上启用推理输出。

  请参阅 [reasoning section](/oss/javascript/langchain/models#reasoning) 和您的 [provider's integration page](/oss/javascript/integrations/providers/overview) 了解配置详细信息。

  要快速检查模型的推理支持，请参阅[models.dev](https://models.dev)。
</Note>要从代理流式传输思考令牌，请使用 `streamMode: "messages"` 并过滤推理内容块。当模型支持时，使用启用扩展思维的模型实例（例如`ChatAnthropic`）：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import z from "zod";
import { createAgent, tool } from "langchain";
import { ChatAnthropic } from "@langchain/anthropic";

const getWeather = tool(
  async ({ city }) => {
    return `It's always sunny in ${city}!`;
  },
  {
    name: "get_weather",
    description: "Get weather for a given city.",
    schema: z.object({ city: z.string() }),
  },
);

const agent = createAgent({
  model: new ChatAnthropic({
    model: "claude-sonnet-4-6",
    thinking: { type: "enabled", budget_tokens: 5000 },
  }),
  tools: [getWeather],
});

const stream = await agent.streamEvents(
  { messages: [{ role: "user", content: "What is the weather in SF?" }] },
  { version: "v3" }, // [!code highlight]
);
for await (const message of stream.messages) {
  for await (const token of message.reasoning) {
    process.stdout.write(`[thinking] ${token}`);
  }
  for await (const token of message.text) {
    process.stdout.write(token);
  }
}
```

```shell title="Output" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[thinking] The user is asking about the weather in San Francisco. I have a tool
[thinking]  available to get this information. Let me call the get_weather tool
[thinking]  with "San Francisco" as the city parameter.
The weather in San Francisco is: It's always sunny in San Francisco!
```

无论模型提供者如何，它的工作方式都是相同的 - LangChain 通过 [⟦T56⟧](/oss/javascript/langchain/messages#standard-content-blocks) 属性将特定于提供者的格式（Anthropic `thinking` 块、OpenAI `reasoning` 摘要等）标准化为标准 `"reasoning"` 内容块类型。

要直接从聊天模型流式传输推理令牌（无需代理），请参阅[streaming with chat models](/oss/javascript/langchain/models#reasoning)。

## 禁用流媒体

在某些应用程序中，您可能需要禁用给定模型的单个令牌的流式传输。这在以下情况下很有用：

* 使用[multi-agent](/oss/javascript/langchain/multi-agent)系统来控制哪些代理流式传输其输出
* 混合支持流媒体和不支持流媒体的模型
* 部署到[LangSmith](/langsmith/observability)并希望阻止某些模型输出流式传输到客户端

初始化模型时设置`streaming: false`。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  model: "gpt-5.5",
  streaming: false,  // [!code highlight]
});
```

<Tip>
  部署到 LangSmith 时，在您不希望将其输出流式传输到客户端的任何模型上设置 `streaming=False`。这是在部署之前在图形代码中配置的。
</Tip><Note>
  并非所有聊天模型集成都支持 `streaming` 参数。如果您的型号不支持，请改用`disableStreaming: true`。此参数可通过基类在所有聊天模型上使用。
</Note>

更多详情请参阅[LangGraph streaming guide](/oss/javascript/langgraph/streaming#disable-streaming-for-specific-chat-models)。

## 相关

* [Frontend streaming](/oss/javascript/langchain/frontend/overview)—使用 [⟦T61⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 构建 React UI 以实现实时代理交互
* [Streaming with chat models](/oss/javascript/langchain/models#stream)—直接从聊天模型流式传输令牌，无需使用代理或图
* [Reasoning with chat models](/oss/javascript/langchain/models#reasoning)—配置和访问聊天模型的推理输出
* [Standard content blocks](/oss/javascript/langchain/messages#standard-content-blocks)—了解用于推理、文本和其他内容类型的标准化内容块格式
* [Streaming with human-in-the-loop](/oss/javascript/langchain/human-in-the-loop#streaming-with-human-in-the-loop)—在处理中断以供人工审核时流式传输代理进度
* [LangGraph streaming](/oss/javascript/langgraph/streaming)—高级流选项，包括 `values`、`debug` 模式和子图流

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/streaming.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>