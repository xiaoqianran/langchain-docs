<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Todo list | https://docs.langchain.com/oss/javascript/deepagents/frontend/todo-list -->

# 待办事项列表

通过与座席状态同步的实时待办事项列表来跟踪座席进度

并非每个代理交互都是聊天。有时代理正在执行
多步骤计划，显示进度的最佳方式是**待办事项列表**
实时更新。深度代理待办事项列表模式读取 `todos` 数组
直接从代理的状态，将每个项目的当前状态渲染为
代理人按照其计划行事。这是一个基于相同内容构建的进度仪表板
`useStream` 用于聊天的钩子。它表明代理状态可以为任何 UI 提供支持，
不仅仅是消息泡沫。

<PatternEmbed />

## 它是如何工作的

当您选择加入 [⟦T20⟧](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware) 时，深度代理可以公开 **`todos` 状态** 通道。该中间件添加了 `write_todos` 工具，并在代理执行其计划时保留任务进度。当代理执行时，它会更新每个
todo 的状态从 `"pending"` 到 `"in_progress"` 到 `"completed"`。的
[⟦T25⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 钩子通过 `stream.values.todos` 公开此状态，并且您的 UI
反应性地渲染它。

<Note>
  任务计划是可选择的。如果没有 [⟦T27⟧](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware)，则不存在 `stream.values.todos`。参见[Task planning](/oss/javascript/deepagents/overview#task-planning)。
</Note>

流程如下所示：1. 用户提交请求
2. Agent 创建计划并在其状态中填充 `todos`
3. Agent 通过 `pending` 开始执行每个待办事项转换 →
   `in_progress` → `completed`
4. `stream.values.todos`随着代理进度实时更新
5. 您的 UI 重新呈现当前状态的待办事项列表

## 设置`useStream`

在代理上启用[⟦T35⟧](https://reference.langchain.com/javascript/langchain/index/todoListMiddleware)。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { todoListMiddleware } from "langchain";

  const agent = await createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    middleware: [todoListMiddleware()],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { todoListMiddleware } from "langchain";

  const agent = await createDeepAgent({
    model: "openai:gpt-5.5",
    middleware: [todoListMiddleware()],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { todoListMiddleware } from "langchain";

  const agent = await createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    middleware: [todoListMiddleware()],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { todoListMiddleware } from "langchain";

  const agent = await createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    middleware: [todoListMiddleware()],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { todoListMiddleware } from "langchain";

  const agent = await createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    middleware: [todoListMiddleware()],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { todoListMiddleware } from "langchain";

  const agent = await createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    middleware: [todoListMiddleware()],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { todoListMiddleware } from "langchain";

  const agent = await createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    middleware: [todoListMiddleware()],
  });
  ```
</CodeGroup>

然后将 [⟦T36⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 指向该代理并
从`stream.values`读取`todos`。

<Info>
  代码示例使用 `useStream<typeof myAgent>` 来实现类型安全的流状态。请参阅 [Python](/oss/python/langchain/frontend/overview#type-inference) 或 [JavaScript](/oss/javascript/langchain/frontend/overview#type-inference) 后端的类型推断。
</Info>

<CodeGroup>
  ```tsx React theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { useStream } from "@langchain/react";

  const AGENT_URL = "http://localhost:2024";

  export function TodoAgent() {
    const stream = useStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "deep_agent_todo_list",
    });

    const todos = stream.values?.todos ?? [];

    return (
      <div>
        <TodoList todos={todos} />
        {stream.messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
      </div>
    );
  }
  ```

  ```vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  import { useStream } from "@langchain/vue";
  import { computed } from "vue";

  const AGENT_URL = "http://localhost:2024";

  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "deep_agent_todo_list",
  });

  const todos = computed(() => stream.values.value?.todos ?? []);
  </script>

  <template>
    <div>
      <TodoList :todos="todos" />
      <Message
        v-for="msg in stream.messages.value"
        :key="msg.id"
        :message="msg"
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
      assistantId: "deep_agent_todo_list",
    });

    const todos = $derived(stream.values?.todos ?? []);
  </script>

  <div>
    <TodoList {todos} />
    {#each stream.messages as msg (msg.id)}
      <Message message={msg} />
    {/each}
  </div>
  ```

  ```ts Angular theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Component, computed } from "@angular/core";
  import { injectStream } from "@langchain/angular";

  const AGENT_URL = "http://localhost:2024";

  @Component({
    selector: "app-todo-agent",
    template: `
      <div>
        <app-todo-list [todos]="todos()" />
        @for (msg of stream.messages(); track msg.id) {
          <app-message [message]="msg" />
        }
      </div>
    `,
  })
  export class TodoAgentComponent {
    stream = injectStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "deep_agent_todo_list",
    });

    todos = computed(() => this.stream.values()?.todos ?? []);
  }
  ```
</CodeGroup>

## 构建 TodoList 组件

待办事项列表用状态图标、颜色编码和视觉效果呈现每个项目
反映当前状态的样式：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function TodoList({ todos }: { todos: Todo[] }) {
  const completed = todos.filter((t) => t.status === "completed").length;
  const percentage = todos.length
    ? Math.round((completed / todos.length) * 100)
    : 0;

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Agent Progress</h2>
        <span className="text-sm text-gray-500">
          {completed}/{todos.length} tasks
        </span>
      </div>

      <ProgressBar percentage={percentage} />

      <ul className="mt-4 space-y-2">
        {todos.map((todo, i) => (
          <TodoItem key={i} todo={todo} />
        ))}
      </ul>
    </div>
  );
}
```

## 进度条

可视化进度条让用户可以一目了然地了解总体完成情况：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Progress</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

## 个人待办事项

每个项目都有一个状态图标、颜色编码文本和删除线样式
完成的任务：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function TodoItem({ todo }: { todo: Todo }) {
  const config = {
    pending: {
      icon: "○",
      textClass: "text-gray-600",
      bgClass: "bg-gray-50",
      iconClass: "text-gray-400",
    },
    in_progress: {
      icon: "◉",
      textClass: "text-amber-800",
      bgClass: "bg-amber-50 border-amber-200",
      iconClass: "text-amber-500 animate-pulse",
    },
    completed: {
      icon: "✓",
      textClass: "text-green-800 line-through",
      bgClass: "bg-green-50 border-green-200",
      iconClass: "text-green-500",
    },
  };

  const style = config[todo.status];

  return (
    <li
      className={`flex items-start gap-3 rounded-md border px-3 py-2 ${style.bgClass}`}
    >
      <span className={`mt-0.5 text-lg leading-none ${style.iconClass}`}>
        {style.icon}
      </span>
      <span className={`text-sm ${style.textClass}`}>{todo.content}</span>
    </li>
  );
}
```

`in_progress` 图标使用 `animate-pulse` 来引起人们对当前的关注
主动任务。

## 计算进度

直接从 todos 数组导出进度指标：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const todos = stream.values?.todos ?? [];

const completed = todos.filter((t) => t.status === "completed").length;
const inProgress = todos.filter((t) => t.status === "in_progress").length;
const pending = todos.filter((t) => t.status === "pending").length;
const percentage = todos.length
  ? Math.round((completed / todos.length) * 100)
  : 0;
```当代理修改其状态时，这些值会进行反应性更新，从而保持
进度条和计数器同步。

## 与聊天消息结合

待办事项列表与常规聊天界面一起使用。实用的布局
将待办事项列表显示为持久侧边栏或标题面板，并带有聊天消息
下面：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function TodoAgentLayout() {
  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "deep_agent_todo_list",
  });

  const todos = stream.values?.todos ?? [];

  return (
    <div className="flex h-screen flex-col">
      {todos.length > 0 && (
        <div className="border-b bg-gray-50 p-4">
          <TodoList todos={todos} />
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {stream.messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))}
        </div>
      </main>

      <ChatInput
        onSubmit={(text) =>
          stream.submit({ messages: [{ type: "human", content: text }] })
        }
        isLoading={stream.isLoading}
      />
    </div>
  );
}
```

<Tip>
  仅在`todos.length > 0`时显示待办事项列表。在代理创建其之前
  计划，没有什么可展示的。显示空组件会浪费空间。
</Tip>

## 用例

待办事项列表模式适合代理执行结构化任务的任何场景
计划：

* **项目规划**：代理将项目分解为任务并完成
  他们依次
* **研究工作流程**：每个研究问题都成为代理的待办事项
  调查并完成
* **数据处理**：摄取、验证、转换等步骤
  导出每个人都有自己的待办事项
* **入职流程**：代理逐步完成设置步骤，检查每一个步骤
  当它配置服务时
* **报告生成**：报告的各个部分变成待办事项：收集数据，
  分析趋势、撰写摘要、格式化输出

## 处理空和加载状态在代理创建其计划之前处理初始状态：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function TodoList({ todos, isLoading }: { todos: Todo[]; isLoading: boolean }) {
  if (todos.length === 0 && !isLoading) {
    return null;
  }

  if (todos.length === 0 && isLoading) {
    return (
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="animate-spin">⟳</span>
          Agent is creating a plan...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      {/* ... full todo list rendering */}
    </div>
  );
}
```

## 最佳实践

* **突出显示待办事项列表**。这是主要进度指标
  基于计划的代理。不要把它埋在折叠下面。
* **动画状态转换**。平滑的过渡让座席感觉更轻松
  反应灵敏。在背景颜色、文本装饰等上使用 CSS 过渡
  不透明度。
* **仅突出显示一项 `in_progress` 项目**。代理通常只执行一项任务
  一次。如果多个项目显示为 `in_progress`，则 UI 会变得嘈杂。
  考虑只脉冲第一个。
* **折叠或变暗已完成的项目**。随着列表的增长，已完成的项目
  变得不那么相关。减少视觉重量，让用户专注于内容
  仍在发生。
* **显示进度百分比**。像“67% 完成”这样的单一数字是
  即使从房间的另一边也能立即理解。
* **保持待办事项列表同步**。因为`stream.values`反应式更新，
  待办事项列表自动保持最新状态。不要添加手动轮询或
  刷新逻辑。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/frontend/todo-list.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>