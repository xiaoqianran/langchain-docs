<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Event streaming | https://docs.langchain.com/oss/javascript/langchain/event-streaming -->

# 事件流

从 LangChain 代理运行中获取实时更新

LangChain 代理基于 LangGraph 构建，因此它们支持相同的流堆栈以及以代理为中心的消息、工具调用、状态和自定义更新的投影。

对于大多数应用程序和前端用例，通过 `stream_events(..., version="v3")` 使用 **事件流**。事件流返回带有类型化投影的运行对象，因此每个投影都可以独立使用，而不是解析流模式元组。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, tool } from "langchain";
import * as z from "zod";

const getWeather = tool(
  async ({ city }) => `It's always sunny in ${city}!`,
  {
    name: "get_weather",
    description: "Get weather for a city.",
    schema: z.object({ city: z.string() }),
  }
);

const agent = createAgent({
  model: "gpt-5-nano",
  tools: [getWeather],
});

const stream = await agent.streamEvents(
  { messages: [{ role: "user", content: "What is the weather in SF?" }] },
  { version: "v3" }
);

for await (const message of stream.messages) {
  for await (const delta of message.text) {
    process.stdout.write(delta);
  }
}

const finalState = await stream.output;
```

## 您可以流式传输的内容|投影|使用 |
| -------------------- | -------------------------------------------------------------------------------------- |
| `for event in stream` |原始协议事件具有完整的信封并可访问每个通道。        |
| `stream.messages` |模型消息流，每个 LLM 调用一个。                                   |
| `message.text` |消息的文本增量和最终文本。                                  |
| `message.reasoning` |公开推理内容的模型的推理增量。                 |
| `message.toolCalls` |工具调用参数块和最终的工具调用。                        |
| `message.output` |模型调用完成后的最终消息对象。                       |
| `message.usage` |提供商返回令牌时的令牌使用元数据。                         |
| `stream.values` |代理状态快照。                                                     |
| `stream.output` |最终代理状态。                                                         |
| `stream.subgraphs` |嵌套图运行（子代理和普通子图）。                        || `stream.extensions` |定制变压器投影。                                            |
| `stream.toolCalls` |工具执行生命周期、输入、输出增量、最终输出和错误。 |

`stream.messages` 产生消息流。每个消息流都公开 `.text`、`.reasoning`、`.toolCalls`、`.output` 和 `.usage`。异步投影可以迭代实时增量或等待最终值。

## 代理消息

当您想要每个 LLM 调用的模型输出时，请使用 `stream.messages`。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const stream = await agent.streamEvents(input, { version: "v3" });

for await (const message of stream.messages) {
  process.stdout.write(`[${message.node}] `);
  for await (const delta of message.text) {
    process.stdout.write(delta);
  }

  const fullMessage = await message.output;
  console.log(fullMessage.content);

  const usage = await message.usage;
  if (usage) {
    console.log(usage);
  }
}
```

`message.output` 为您提供最终确定的 AI 消息，包括特定于提供商的内容块。在 TypeScript 中，当您只需要令牌计数或其他使用元数据时，请使用`message.usage`；在 Python 中，请从 `message.output.usage_metadata` 读取用法。

## 推理内容

推理内容使用与文本内容相同的形状，但仅当所选模型发出推理块时才可用。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const stream = await agent.streamEvents(input, { version: "v3" });

for await (const message of stream.messages) {
  for await (const delta of message.reasoning) {
    process.stdout.write(`[thinking] ${delta}`);
  }

  for await (const delta of message.text) {
    process.stdout.write(delta);
  }
}
```

有关模型配置详细信息，请参阅 [reasoning guide](/oss/javascript/langchain/models#reasoning) 和提供商的集成页面。

## 工具调用

有两个有用的工具调用投影：

* `message.tool_calls` 在模型生成工具调用时流式传输工具调用参数块。
* `stream.tool_calls` 在工具调用开始后流式传输工具执行的生命周期。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const stream = await agent.streamEvents(input, { version: "v3" });

await Promise.all([
  (async () => {
    for await (const message of stream.messages) {
      for await (const chunk of message.toolCalls) {
        console.log("tool call chunk", chunk);
      }
    }
  })(),
  (async () => {
    for await (const call of stream.toolCalls) {
      console.log(call.name, call.input);
      console.log(await call.output, await call.error);
    }
  })(),
]);
```

## 流式子代理当 `createAgent` 调用调用另一个名为 `createAgent`（通常通过包装工具）时，内部代理的事件在嵌套命名空间中流动。您传递给 `createAgent` 的 `name` 标识流中的内部代理，因此您可以对每个代理进行过滤和标记。

指定的子代理表面位于专用的 `stream.subagents` 投影上。每个句柄都会公开内部代理自己的`.messages`、`.toolCalls`和`.output`，以及`.name`（您传递的`name=`）、`.cause`（调度子代理的工具调用）和嵌套的`.subagents`。因为这里只出现命名的 `createAgent` 运行，所以您不需要过滤掉普通子图。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, tool } from "langchain";
import { z } from "zod";

const getWeather = tool(
  async ({ city }) => `It's always sunny in ${city}!`,
  { name: "get_weather", schema: z.object({ city: z.string() }) }
);

const weatherAgent = createAgent({
  model: "openai:gpt-5.5",
  tools: [getWeather],
  name: "weather_agent",
});

const callWeather = tool(
  async ({ query }) => {
    const result = await weatherAgent.invoke({
      messages: [{ role: "user", content: query }],
    });
    return result.messages.at(-1)?.text ?? "";
  },
  { name: "call_weather", schema: z.object({ query: z.string() }) }
);

const supervisor = createAgent({
  model: "openai:gpt-5.5",
  tools: [callWeather],
  name: "supervisor",
});

const stream = await supervisor.streamEvents(
  { messages: [{ role: "user", content: "What's the weather in Boston?" }] },
  { version: "v3" }
);

for await (const subagent of stream.subagents) {
  process.stdout.write(`${subagent.name}: `);
  for await (const message of subagent.messages) {
    for await (const token of message.text) {
      process.stdout.write(token);
    }
  }
  process.stdout.write("\n");
}
//Output: "weather_agent: The weather in Boston is sunny!"
```

从工具调用的普通 `StateGraph` 子图也出现在 `stream.subgraphs` 上 — 在 `.compile(name=...)` 上设置 `name=` 以获取 `subagent.graph_name` 中的标签。

`stream.subagents`是命名的`createAgent`子代理的聚焦视图，而`stream.subgraphs`涵盖了每个嵌套图。使用与您的 UI 匹配的任何一个。

## 状态和最终输出

使用 `stream.values` 表示状态快照，使用 `stream.output` 表示最终代理状态。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const stream = await agent.streamEvents(input, { version: "v3" });

for await (const snapshot of stream.values) {
  console.log(snapshot);
}

const finalState = await stream.output;
```

## 多重投影

当您需要在 JavaScript 中进行多个投影时，请使用并发使用者：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const stream = await agent.streamEvents(input, { version: "v3" });

await Promise.all([
  (async () => {
    for await (const message of stream.messages) {
      console.log(await message.text);
    }
  })(),
  (async () => {
    for await (const call of stream.toolCalls) {
      console.log(call.name, call.input);
    }
  })(),
]);
```

要访问未公开为类型化投影的通道，或检查完整的事件信封，请迭代原始协议事件：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
for await (const event of stream) {
  console.log(event.method, event.params.namespace, event.params.data);
}
```

## 自定义更新当您的应用程序需要非内置的投影（例如检索进度、工件或特定于域的事件）时，请使用自定义流转换器。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const stream = await agent.streamEvents(input, {
  version: "v3",
  transformers: [toolActivityTransformer],
});

for await (const activity of stream.extensions.toolActivity) {
  console.log(activity);
}
```

### 在中间件上注册变压器

<Note>中间件注册变压器需要`langchain@1.4.3`或更高版本。</Note>

中间件可以声明流转换器工厂及其挂钩和工具。工厂形状因语言而异：

将 `streamTransformers` 作为工厂元组传递给 `createMiddleware`。每个工厂的形状为`() => StreamTransformer<any>`（零参数），并且每个作用域被调用一次。每次调用返回一个新的变压器可以使每个子图保持隔离。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, createMiddleware } from "langchain";

const toolActivityMiddleware = createMiddleware({
  name: "ToolActivityMiddleware",
  streamTransformers: [toolActivityTransformer],
});

const agent = createAgent({
  model: "gpt-5-nano",
  tools: [getWeather],
  middleware: [toolActivityMiddleware],
});
```

在编译时，`createAgent` 将中间件注册的工厂与传递给其自己的 `streamTransformers` 选项的任何内容合并。编译图上的最终顺序是：

1. 内置`ToolCallTransformer`。
2. 中间件注册工厂，按中间件顺序。
3. 调用者从 `createAgent` 提供 `streamTransformers`。

这使内置工具调用投影保持在消费者变压器面前，并为调用者提供的条目提供最终决定权。

变压器合同见[Build your own projection](/oss/javascript/langgraph/event-streaming#build-your-own-projection)。

＃＃ 有关的* [Streaming](/oss/javascript/langchain/streaming) 涵盖低级 Pregel 流模式。
* [Build your own projection](/oss/javascript/langgraph/event-streaming#build-your-own-projection) 涵盖编写特定于应用程序的投影。
* [Frontend streaming patterns](/oss/javascript/langchain/frontend/overview) 显示基于流状态构建的 UI 用例。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/event-streaming.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>