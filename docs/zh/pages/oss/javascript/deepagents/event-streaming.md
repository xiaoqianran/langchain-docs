<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Event streaming | https://docs.langchain.com/oss/javascript/deepagents/event-streaming -->

# 事件流

从 Deep Agents 传输子代理、消息、工具调用和最终输出。

本页面涵盖特定于 Deep Agents 的流式传输问题 — 最重要的是，通过 `stream.subagents` 从委托子代理进行流式传输。对于一般代理流（`stream.messages`、`stream.values`、工具调用、自定义更新），请参阅[LangChain Event Streaming](/oss/javascript/langchain/event-streaming)。

## 流子代理

Deep Agents 在 LangGraph 流之上添加子代理投影。当您希望每个委托的 `task` 调用有一个流句柄时，请使用 `stream.subagents`。投影是轻量级的：它首先发现子代理任务，并且仅当您在子代理句柄上访问消息、工具调用和价值流时才会打开它们。

每个句柄的`name`是子代理的配置名称：协调器在调用`task`工具时传递的`subagent_type`。 Deep Agents 将该名称绑定到委托运行，因此您在子代理规范中定义的相同标签就是您在流中过滤和路由的标签。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const stream = await agent.streamEvents(
  { messages: [{ role: "user", content: "Write me a haiku about the sea" }] },
  { version: "v3" },
);

const subagentNames: string[] = [];
for await (const subagent of stream.subagents) {
  console.log(subagent.name);
  console.log(await subagent.taskInput);

  for await (const message of subagent.messages) {
    console.log(await message.text);
  }

  subagentNames.push(subagent.name);
}

await stream.output;
```

## 子代理流字段

每个子代理流都公开与父运行相同类型的投影，例如消息、工具调用、嵌套子代理和最终输出。对于一般的父运行流模型，请参见[LangChain Event Streaming](/oss/javascript/langchain/event-streaming)。TypeScript 使用驼峰命名法投影名称，例如 `toolCalls` 和 `taskInput`。每个子代理流可以公开 `.messages`、`.toolCalls`、`.values`、`.subagents` 和 `.output`。

|领域 |描述 |
| - | - |
| `name` |子代理名称，取自协调器在其 `task` 调用中选择的 `subagent_type`。 |
| `messages` |子代理发出的消息。 |
| `subagents` |嵌套子代理调用。 |
| `output` |最终子代理状态，或委派任务的完成信号。 |
| `taskInput` | Promise 将提示传递给任务工具。 |
| `toolCalls` |工具调用范围为子代理。 |

## 跟踪子代理生命周期

当您只需要显示哪些子代理启动和完成时，请使用`stream.subagents`。您不需要订阅消息或价值流，除非您访问单个子代理上的这些预测。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const stream = await agent.streamEvents(input, { version: "v3" });

let running = 0;
let completed = 0;
let failed = 0;
const watchers: Promise<void>[] = [];

for await (const subagent of stream.subagents) {
  running += 1;
  console.log(`${subagent.name}: started`);

  watchers.push(
    subagent.output.then(
      () => {
        running -= 1;
        completed += 1;
        console.log(`${subagent.name}: completed`);
      },
      () => {
        running -= 1;
        failed += 1;
        console.log(`${subagent.name}: failed`);
      },
    ),
  );
}

await Promise.all(watchers);
console.log({ running, completed, failed });
```

<Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/772cbde0-b8d3-44ec-9ac8-3641bc61a567/r">
  为此示例打开公共 LangSmith 运行。
</Card>

## 流消息

Deep Agents 可以从协调器代理和委托子代理发出消息。对顶级消息使用 `stream.messages`，对每个委派的子代理使用 `subagent.messages`。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const stream = await agent.streamEvents(input, { version: "v3" });

const coordinatorMessages: string[] = [];
for await (const message of stream.messages) {
  const text = await message.text;
  console.log("[coordinator]", text);
  coordinatorMessages.push(text);
}

for await (const subagent of stream.subagents) {
  for await (const message of subagent.messages) {
    console.log(`[${subagent.name}]`, await message.text);
  }
}

await stream.output;
```

<Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/871e73d9-e98c-4ac5-bfec-2e6ab7a6bd6b/r">
  为此示例打开公共 LangSmith 运行。
</Card>

## 流工具调用Deep Agents 在代理树的每个级别公开工具调用。将顶级 `stream.tool_calls` 用于协调器工具，将每个 `subagent.tool_calls` 用于委派工作。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const stream = await agent.streamEvents(input, { version: "v3" });

const coordinatorToolNames: string[] = [];
for await (const call of stream.toolCalls) {
  console.log("[coordinator tool]", call.name, call.input);
  console.log(await call.status);
  coordinatorToolNames.push(call.name);
}

for await (const subagent of stream.subagents) {
  for await (const call of subagent.toolCalls) {
    console.log(`[${subagent.name} tool]`, call.name, call.input);

    const status = await call.status;
    if (status === "finished") {
      console.log(await call.output);
    } else if (status === "error") {
      console.error(await call.error);
    }
  }
}
```

<Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/3fdda16a-c42c-4931-81f5-36e4a4ecfc5c/r">
  为此示例打开公共 LangSmith 运行。
</Card>

## 流式嵌套工作

您可以递归到子代理流以观察嵌套的子代理、消息和工具调用。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const stream = await agent.streamEvents(input, { version: "v3" });

const subagentNames: string[] = [];
for await (const subagent of stream.subagents) {
  console.log(`subagent ${subagent.name}: started`);

  for await (const toolCall of subagent.toolCalls) {
    console.log(`${toolCall.name}(${JSON.stringify(toolCall.input)})`);

    const status = await toolCall.status;
    if (status === "finished") {
      console.log(await toolCall.output);
    } else if (status === "error") {
      console.error(await toolCall.error);
    }
  }

  for await (const nested of subagent.subagents) {
    console.log(`nested subagent ${nested.name}: started`);
  }

  subagentNames.push(subagent.name);
}
```

<Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/0b947581-de0c-491e-96c1-ba37cc862b0e/r">
  为此示例打开公共 LangSmith 运行。
</Card>

## 并发消费

协调器和子代理的输出经常交错。当您需要实时 UI 更新时，同时使用投影。

在 JavaScript 中使用并发消费者：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const stream = await agent.streamEvents(input, { version: "v3" });

await Promise.all([
  (async () => {
    for await (const message of stream.messages) {
      console.log("[coordinator]", await message.text);
    }
  })(),
  (async () => {
    for await (const subagent of stream.subagents) {
      void (async () => {
        for await (const message of subagent.messages) {
          console.log(`[${subagent.name}]`, await message.text);
        }
      })();
    }
  })(),
]);
```

<Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/2ad72588-6334-4d84-ad85-f66e6c13f0f3/r">
  为此示例打开公共 LangSmith 运行。
</Card>

当您需要协调器和所有子代理之间的准确到达顺序时，请迭代原始协议事件并使用 `namespace` 来识别源：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const stream = await agent.streamEvents(input, { version: "v3" });

const textDeltas: string[] = [];
for await (const event of stream) {
  if (event.method !== "messages") continue;

  const data = event.params.data;
  if (data.event !== "content-block-delta") continue;

  const block = data.delta ?? {};
  if (block.type === "text-delta") {
    const isSubagent = event.params.namespace.some((seg) =>
      seg.startsWith("tools:"),
    );
    const source = isSubagent ? "subagent" : "coordinator";
    console.log(`[${source}] ${block.text}`);
    textDeltas.push(block.text);
  }
}
```

<Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/da37e344-18bb-4a36-be3e-1a1740f281c6/r">
  为此示例打开公共 LangSmith 运行。
</Card>

## 子代理与子图

`stream.subgraphs`展示了图的执行结构。 `stream.subagents` 显示产品级别的Deep Agents 任务委派。将 `stream.subagents` 用于面向用户的 UI，因为它隐藏内部图节点并直接公开子代理概念。

＃＃ 有关的* [LangChain Event Streaming](/oss/javascript/langchain/event-streaming) 涵盖一般代理消息和工具调用流概念。
* [Subagent frontend streaming](/oss/javascript/deepagents/frontend/subagent-streaming) 显示将协调器消息与子代理卡分开的 UI 模式。
* [LangGraph Event Streaming](/oss/javascript/langgraph/event-streaming)涵盖了底层的图流模型。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/event-streaming.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>