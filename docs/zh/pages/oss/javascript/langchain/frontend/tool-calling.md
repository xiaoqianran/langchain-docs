<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tool calling | https://docs.langchain.com/oss/javascript/langchain/frontend/tool-calling -->

# 工具调用

使用丰富的、类型安全的 UI 卡显示代理工具调用

代理可以调用外部工具，例如天气 API、计算器、网络搜索、
数据库查询等等。结果采用原始 JSON 格式。这个图案告诉你
如何渲染
结构化、类型安全的 UI 卡，适用于您的代理进行的每个工具调用，完整
具有加载状态和错误处理。

<PatternEmbed />

## 工具调用如何工作

当 LangGraph 代理决定需要外部数据时，它会发出一个或多个
**工具调用**作为 AI 消息的一部分。每个工具调用包括：

* **名称**：被调用的工具（例如`"get_weather"`、`"calculator"`）
* **args**：传递给工具的结构化参数
* **id**：将调用链接到其结果的唯一标识符

代理运行时执行该工具，结果作为
`ToolMessage`。 [⟦T14⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 钩子将所有这些统一到一个单一的
`toolCalls`数组，可以直接渲染。

## 设置`useStream`

第一步是将 [⟦T17⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 连接到您的代理后端。钩子返回
反应状态包括一个实时更新的`toolCalls`数组
代理流。

<Info>
  代码示例使用 `useStream<typeof myAgent>` 来实现类型安全的流状态。请参阅 [Python](/oss/python/langchain/frontend/overview#type-inference) 或 [JavaScript](/oss/javascript/langchain/frontend/overview#type-inference) 后端的类型推断。
</Info>

<CodeGroup>
  ```tsx React theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { useStream } from "@langchain/react";

  const AGENT_URL = "http://localhost:2024";

  export function Chat() {
    const stream = useStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "tool_calling",
    });

    return (
      <div>
        {stream.messages.map((msg) => (
          <Message key={msg.id} message={msg} toolCalls={stream.toolCalls} />
        ))}
      </div>
    );
  }
  ``````vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  import { useStream } from "@langchain/vue";

  const AGENT_URL = "http://localhost:2024";

  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "tool_calling",
  });
  </script>

  <template>
    <div>
      <Message
        v-for="msg in stream.messages.value"
        :key="msg.id"
        :message="msg"
        :tool-calls="stream.toolCalls.value"
      />
    </div>
  </template>
  ```

  ```svelte Svelte theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script lang="ts">
    import { useStream } from "@langchain/svelte";

    const AGENT_URL = "http://localhost:2024";

    const stream = useStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "tool_calling",
    });
  </script>

  <div>
    {#each stream.messages as msg (msg.id)}
      <Message message={msg} toolCalls={stream.toolCalls} />
    {/each}
  </div>
  ```

  ```ts Angular theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Component } from "@angular/core";
  import { injectStream } from "@langchain/angular";

  const AGENT_URL = "http://localhost:2024";

  @Component({
    selector: "app-chat",
    template: `
      @for (msg of stream.messages(); track msg.id) {
        <app-message [message]="msg" [toolCalls]="stream.toolCalls()" />
      }
    `,
  })
  export class ChatComponent {
    stream = injectStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "tool_calling",
    });
  }
  ```
</CodeGroup>

## AssembledToolCall 类型

`toolCalls` 数组中的每个条目都是一个 `AssembledToolCall` 对象：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
interface AssembledToolCall<
  TName extends string = string,
  TInput = unknown,
  TOutput = unknown,
> {
  name: TName;
  callId: string;
  id: string;
  namespace: string[];
  input: TInput;
  args: TInput;
  output: TOutput | null;
  status: "running" | "finished" | "error";
  error: string | undefined;
}
```

|物业 |描述 |
| ----------- | ------------------------------------------------------------------------------------------ |
| `name` |工具的名称（例如`"get_weather"`）|
| `callId` |与 AI 消息的 `tool_calls` 条目匹配的唯一 ID |
| `id` | `callId`的别名，匹配消息级工具调用 |
| `namespace` |发出工具调用的命名空间 |
| `input` |代理传递给工具的结构化参数 |
| `args` | `input`的别名，匹配消息级工具调用 |
| `output` |成功调用后的工具输出，或运行时或错误后的`null` |
| `status` |生命周期状态：`"running"`、`"finished"` 或 `"error"` |
| `error` |工具调用失败时的错误详细信息 |

## 每条消息的过滤工具调用一条AI消息可能会触发多个工具调用，你的聊天中可能会包含很多AI
消息。要在每条消息下呈现正确的工具卡，请通过匹配进行过滤
`callId` 与消息的 `tool_calls` 数组：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function Message({
  message,
  toolCalls,
}: {
  message: AIMessage;
  toolCalls: AssembledToolCall[];
}) {
  const messageToolCalls = toolCalls.filter((tc) =>
    message.tool_calls?.find((t) => t.id === tc.callId)
  );

  return (
    <div>
      <p>{message.text}</p>
      {messageToolCalls.map((tc) => (
        <ToolCard key={tc.callId} toolCall={tc} />
      ))}
    </div>
  );
}
```

## 构建专用工具卡

不要转储原始 JSON，而是为每个工具构建专用的 UI 组件。使用
`name` 选择正确的卡：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function ToolCard({ toolCall }: { toolCall: AssembledToolCall }) {
  if (toolCall.status === "running") {
    return <LoadingCard name={toolCall.name} />;
  }

  if (toolCall.status === "error") {
    return <ErrorCard name={toolCall.name} error={toolCall.error} />;
  }

  switch (toolCall.name) {
    case "get_weather":
      return <WeatherCard input={toolCall.input} output={toolCall.output} />;
    case "calculator":
      return (
        <CalculatorCard input={toolCall.input} output={toolCall.output} />
      );
    case "web_search":
      return <SearchCard input={toolCall.input} output={toolCall.output} />;
    default:
      return <GenericToolCard toolCall={toolCall} />;
  }
}
```

### 天气卡示例

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function WeatherCard({
  input,
  output,
}: {
  input: { location: string };
  output: { temperature: number; condition: string };
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <CloudIcon />
        <h3 className="font-semibold">{input.location}</h3>
      </div>
      <div className="mt-2 text-3xl font-bold">{output.temperature}°F</div>
      <p className="text-muted-foreground">{output.condition}</p>
    </div>
  );
}
```

### 加载和错误状态

始终处理待处理和错误状态，以便为用户提供清晰的反馈：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function LoadingCard({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border p-4 animate-pulse">
      <Spinner />
      <span>Running {name}...</span>
    </div>
  );
}

function ErrorCard({ name, error }: { name: string; error?: unknown }) {
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-4">
      <h3 className="font-semibold text-red-700">Error in {name}</h3>
      <p className="text-sm text-red-600">
        {String(error ?? "Tool execution failed")}
      </p>
    </div>
  );
}
```

## 类型安全的工具参数

如果您的工具是使用结构化模式定义的，则可以使用
`ToolCallFromTool` 实用程序类型以获得完整类型`args`：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const getWeather = tool(async ({ location }) => { /* ... */ }, {
  name: "get_weather",
  description: "Get the current weather for a location",
  schema: z.object({
    location: z.string().describe("City name"),
  }),
});

type WeatherToolCall = ToolCallFromTool<typeof getWeather>;
// WeatherToolCall.input and WeatherToolCall.args are now { location: string }
```

<Tip>
  使用 `ToolCallFromTool` 可以为您提供编译时安全性。如果工具架构
  更改时，您的 UI 组件将立即标记类型错误。
</Tip>

## 渲染工具调用内联流文本

工具调用通常与流文本交织在一起。 [⟦T45⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 挂钩
保持 `toolCalls` 与流同步，因此待处理的卡片一旦出现
代理在工具完成执行之前发出调用。

这意味着用户会看到：1. AI 传入的文本
2. 发出工具调用时的加载卡
3. 工具完成后，卡片会更新以显示结果

<Note>
  工具调用就地更新。同样的`callId`从`"running"`过渡到
  `"finished"`（或`"error"`），因此您的 UI 重新渲染相同的组件
  与新状态。
</Note>

## 处理多个并发工具调用

代理可以并行调用多个工具。 `toolCalls` 数组将包含
同时使用`status: "running"`进行多个条目。每一个解决
独立地，所以你的 UI 应该优雅地处理部分完成：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function ToolCallList({ toolCalls }: { toolCalls: AssembledToolCall[] }) {
  const pending = toolCalls.filter((tc) => tc.status === "running");
  const completed = toolCalls.filter((tc) => tc.status === "finished");

  return (
    <div className="space-y-2">
      {completed.map((tc) => (
        <ToolCard key={tc.callId} toolCall={tc} />
      ))}
      {pending.map((tc) => (
        <LoadingCard key={tc.callId} name={tc.name} />
      ))}
    </div>
  );
}
```

## 最佳实践

构建工具调用 UI 时请遵循以下准则：* **始终处理所有三种状态**：`running`、`finished` 和 `error`。
  用户永远不应该看到空白卡。
* **安全地验证结果**。工具输出的类型为 `unknown`，直到您
  将它们缩小到特定的卡。
* **提供通用后备**。并非每个工具都需要定制卡。渲染
  未知工具名称的可折叠 JSON 视图。
* **加载期间显示工具名称和参数**。用户想知道*什么*
  甚至在结果到达之前，代理就正在做。
* **保持卡片紧凑**。工具卡与聊天消息内嵌。避免
  用超大的小部件压倒对话。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/tool-calling.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>