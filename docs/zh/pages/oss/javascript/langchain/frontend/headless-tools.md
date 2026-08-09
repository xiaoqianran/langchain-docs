<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Headless tools | https://docs.langchain.com/oss/javascript/langchain/frontend/headless-tools -->

# 无头工具

使用无头工具实现在客户端上运行浏览器和设备 API

无头工具让您的代理调用工具，其真正执行必须发生在
用户的应用程序而不是服务器上。代理仍然看到正常的工具架构，
但实现位于前端，可以访问浏览器 API
例如 IndexedDB、地理位置、剪贴板、画布或文件选择器。

当数据应保留在设备本地时，此模式特别有用。
本页上的 Playground 示例使用一个小型浏览器内存工具包支持
由 IndexedDB 加上完全在客户端运行的地理定位工具。

<PatternEmbed />

## 无头工具如何工作

在较高层面上，无头工具将工具架构与仅浏览器实现分开。

1. 在代理上注册仅架构工具定义。
2. 通过`.implement(...)`在前端实现匹配工具。
3. 将这些实现传递给`useStream({ tools: [...] })`。
4. 当代理发出匹配的工具调用时，客户端运行它并恢复
   工具结果的中断运行。<Tip>
  将工具定义和实现保留在单独的模块中。分享
  您的代理和前端之间的定义，因此工具名称和模式
  保持一致，然后将仅限浏览器的代码保留在仅限客户端的`impl`模块中。
</Tip>

## 在代理上注册该工具

Playground 定义了一小组遵循相同规则的客户端工具
模式：代理公开工具模式，前端处理实际的
执行。

在共享 `tools.ts` 文件中定义一次工具并在两个文件中使用该文件
代理和前端。

<CodeGroup>
  ```ts tools.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";
  import { tool } from "langchain";

  export const memoryPut = tool({
    name: "memory_put",
    description: "Store a memory in the user's browser.",
    schema: z.object({
      key: z.string(),
      value: z.unknown(),
    }),
  });

  export const memoryGet = tool({
    name: "memory_get",
    description: "Look up a memory stored in the user's browser.",
    schema: z.object({
      key: z.string(),
    }),
  });

  export const geolocationGet = tool({
    name: "geolocation_get",
    description: "Get the user's current location from the browser.",
    schema: z.object({
      save: z.boolean().optional(),
    }),
  });
  ```

  ```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";

  import { geolocationGet, memoryGet, memoryPut } from "./tools";

  export const agent = createAgent({
    model: "openai:gpt-5.5",
    tools: [memoryPut, memoryGet, geolocationGet],
    checkpointer: new MemorySaver(),
  });
  ```
</CodeGroup>

## 实现浏览器行为

将仅限客户端的行为放在单独的模块中并将其附加
`.implement(...)`。真正的游乐场包括一个更完整的 IndexedDB 存储
搜索、列出、过期和删除操作。以下示例显示
更高层次上的相同形状：

```ts impl.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import {
  geolocationGet as geolocationGetDefinition,
  memoryGet as memoryGetDefinition,
  memoryPut as memoryPutDefinition,
} from "./tools";

async function saveMemory(key: string, value: unknown) {
  localStorage.setItem(`agent-memory:${key}`, JSON.stringify(value));
}

async function getMemory(key: string) {
  const value = localStorage.getItem(`agent-memory:${key}`);
  return value ? JSON.parse(value) : null;
}

export const memoryPut = memoryPutDefinition.implement(async ({ key, value }) => {
  await saveMemory(key, value);
  return { success: true, key };
});

export const memoryGet = memoryGetDefinition.implement(async ({ key }) => {
  const value = await getMemory(key);
  return value === null ? { found: false, key } : { found: true, key, value };
});

export const geolocationGet = geolocationGetDefinition.implement(
  async ({ save = true }) => {
    const position = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject),
    );

    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };

    if (save) {
      await saveMemory("user_location", location);
    }

    return location;
  },
);
```

## 将实现连接到`useStream`

将实现的工具传递给`useStream`。当代理发出匹配工具时
调用时，挂钩运行客户端实现并为您恢复运行。

可以从代理定义推断代理状态：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import type { myAgent } from "./agent";

export type AgentState = typeof myAgent;
```

<CodeGroup>
  ```tsx React theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { useStream } from "@langchain/react";

  import { geolocationGet, memoryGet, memoryPut } from "./impl";
  import type { AgentState } from "./types";

  const AGENT_URL = "http://localhost:2024";

  export function Chat() {
    const stream = useStream<AgentState>({
      apiUrl: AGENT_URL,
      assistantId: "headless_tools",
      tools: [memoryPut, memoryGet, geolocationGet],
    });

    return <ChatView messages={stream.messages} toolCalls={stream.toolCalls} />;
  }
  ```

  ```vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  import { useStream } from "@langchain/vue";

  import { geolocationGet, memoryGet, memoryPut } from "./impl";
  import type { AgentState } from "./types";

  const AGENT_URL = "http://localhost:2024";

  const stream = useStream<AgentState>({
    apiUrl: AGENT_URL,
    assistantId: "headless_tools",
    tools: [memoryPut, memoryGet, geolocationGet],
  });
  </script>

  <template>
    <ChatView
      :messages="stream.messages.value"
      :tool-calls="stream.toolCalls.value"
    />
  </template>
  ```

  ```svelte Svelte theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script lang="ts">
    import { useStream } from "@langchain/svelte";

    import { geolocationGet, memoryGet, memoryPut } from "./impl";
    import type { AgentState } from "./types";

    const AGENT_URL = "http://localhost:2024";

    const { messages, toolCalls } = useStream<AgentState>({
      apiUrl: AGENT_URL,
      assistantId: "headless_tools",
      tools: [memoryPut, memoryGet, geolocationGet],
    });
  </script>

  <ChatView messages={$messages} toolCalls={$toolCalls} />
  ```

  ```ts Angular theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Component } from "@angular/core";
  import { useStream } from "@langchain/angular";

  import { geolocationGet, memoryGet, memoryPut } from "./impl";
  import type { AgentState } from "./types";

  const AGENT_URL = "http://localhost:2024";

  @Component({
    selector: "app-chat",
    template: `
      <app-chat-view
        [messages]="stream.messages()"
        [toolCalls]="stream.toolCalls()"
      />
    `,
  })
  export class ChatComponent {
    stream = useStream<AgentState>({
      apiUrl: AGENT_URL,
      assistantId: "headless_tools",
      tools: [memoryPut, memoryGet, geolocationGet],
    });
  }
  ```
</CodeGroup>

## 内联渲染工具活动游乐场将每个内存或地理定位操作呈现为自己的卡，并且
在输入附近保留一个小的内存统计面板。关键的一步是匹配每个
`stream.toolCalls`中的条目返回到触发它的AI消息：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import type { ToolCallWithResult, DefaultToolCall } from "@langchain/react";

function Message({ message, toolCalls }: {
  message: AIMessage,
  toolCalls: ToolCallWithResult[]
}) {
  const messageToolCalls = toolCalls.filter((tc) =>
    message.tool_calls?.some((call) => call.id === tc.call.id),
  );

  return (
    <div>
      {message.text && <p>{message.text}</p>}
      {messageToolCalls.map((tc) => (
        <HeadlessToolCard key={tc.call.id} toolCall={tc} />
      ))}
    </div>
  );
}
```

这对于更丰富的 UI 模式尤其有效
[Tool calling](/oss/javascript/langchain/frontend/tool-calling)，其中每个工具结果可以
渲染为专用卡片而不是原始 JSON。

## 用例

当工作依赖于仅存在于应用程序中的 API 或数据时，请使用无头工具
客户：

* IndexedDB 或 `localStorage` 中的本地内存
* 设备 API，例如地理位置、剪贴板、相机或文件选择器
* 画布、音频或其他仅限浏览器的渲染基元
* 应保留在用户设备上的隐私敏感数据
* 需要直接访问内存中前端状态的 UI 操作

## 最佳实践* 工具要小且要打字。比起一种通用的工具，更喜欢多种狭窄的工具
  “运行任意浏览器代码”工具。
* 返回 JSON 可序列化的结果。不要尝试返回 DOM 节点、文件
  句柄或其他不可序列化的浏览器对象。
* 共享定义，单独实现。代理人和客户应同意
  关于工具名称和模式，但只有客户端应该加载浏览器 API。
* UI 中显示工具状态。使用`stream.toolCalls`和`onTool`来显示
  待处理、成功和错误状态。
* 需要时添加评论。对于敏感的客户端操作，请将此模式配对
  与[Human-in-the-loop](/oss/javascript/langchain/frontend/human-in-the-loop)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/headless-tools.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>