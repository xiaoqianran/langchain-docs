<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Message queues | https://docs.langchain.com/oss/javascript/langchain/frontend/message-queues -->

# 消息队列

将多条消息排队并在代理按顺序处理时管理它们

消息队列允许用户快速连续发送多条消息，而无需等待代理完成当前消息的处理。每条消息都会立即接受，排队等候活动线程，并按顺序进行处理，从而使您能够完全了解和控制待处理的工作。

<PatternEmbed />

<Note>
  此功能需要[LangGraph Agent Server](/oss/javascript/langgraph/local-server)。使用 `langgraph dev` 或 [deploy it to LangSmith](/langsmith/deployment) 在本地运行代理以使用此模式。
</Note>

## 为什么要使用消息队列？

在典型的聊天界面中，用户必须等待代理完成响应才能发送另一条消息。这会在多种情况下产生摩擦：

* **批量问题**：用户想要一次提出五个相关问题，而不是等待每个答案
* **后续链**：在代理仍在工作时提交澄清或其他上下文
* **自动化测试序列**：以编程方式发送一系列提示来验证代理行为
* **数据输入工作流程**：依次输入结构化输入进行处理消息队列通过立即接受所有提交并按顺序处理它们来解决这个问题。

这是一个代理用户体验原语，而不是一个装饰性的聊天功能。 SDK保留
作为流控制器的一部分跟踪队列，以便您的 UI 可以显示待处理
工作，取消过时的请求，并在当前运行时保持作曲家处于活动状态
继续。

## 它是如何工作的

当您希望提交等待时，请通过`multitaskStrategy: "enqueue"`
当前正在运行的请求。当代理正在处理时，排队提交
被添加到活动线程的队列中。当前运行完成后，
下一条排队消息会自动发送。

使用框架的配套队列助手读取队列状态：

|物业 |类型 |描述 |
| ------------------ | ------------------------------------------- | ---------------------------------------------------- |
| `queue.entries` | `SubmissionQueueEntry[]` |所有待处理队列条目的数组 |
| `queue.size` | `number` |当前队列中的条目数 |
| `queue.cancel(id)` | `(id: string) => Promise<void>` |按 ID 取消特定排队条目 |
| `queue.clear()` | `() => Promise<void>` |取消所有排队条目 |每个[SubmissionQueueEntry](https://reference.langchain.com/javascript/langchain-react/SubmissionQueueEntry)对象包含：

|领域 |类型 |描述 |
| ----------- | -------- | -------------------------------------------------------------------- |
| `id` | `string` |此队列条目的唯一标识符 |
| `values` | `object` |提交的输入值（包括消息）|
| `options` | `object` |提交时通过的任何其他选项 |
| `createdAt` | `string` |创建条目时的 ISO 时间戳 |

## 设置`useStream`

将[⟦T31⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream)连接到您的代理，然后将其与提交队列配对
您的框架的帮手。跑步时调用`stream.submit()`发送消息
正在进行中；通过`multitaskStrategy: "enqueue"`提交应该
等待活动请求后面。读取`queue.entries`和`queue.size`进行渲染
待处理的工作，并使用`queue.cancel()`或`queue.clear()`删除之前的项目
他们开始处理。

<Info>
  代码示例使用 `useStream<typeof myAgent>` 来实现类型安全的流状态。请参阅 [Python](/oss/python/langchain/frontend/overview#type-inference) 或 [JavaScript](/oss/javascript/langchain/frontend/overview#type-inference) 后端的类型推断。
</Info>

<CodeGroup>
  ```tsx React theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { useStream, useSubmissionQueue } from "@langchain/react";

  function Chat() {
    const stream = useStream<typeof myAgent>({
      apiUrl: "http://localhost:2024",
      assistantId: "simple_agent",
    });
    const queue = useSubmissionQueue(stream);

    const handleSubmit = (text: string) => {
      stream.submit({
        messages: [{ type: "human", content: text }],
      });
    };

    const pendingCount = queue.size;
    const entries = queue.entries;

    return (
      <div>
        <MessageList messages={stream.messages} />
        {pendingCount > 0 && <QueueList entries={entries} queue={queue} />}
        <ChatInput onSubmit={handleSubmit} />
      </div>
    );
  }
  ```

  ```vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  import { useStream, useSubmissionQueue } from "@langchain/vue";
  import { computed } from "vue";

  const stream = useStream<typeof myAgent>({
    apiUrl: "http://localhost:2024",
    assistantId: "simple_agent",
  });
  const queue = useSubmissionQueue(stream);

  function handleSubmit(text: string) {
    stream.submit({
      messages: [{ type: "human", content: text }],
    });
  }

  const pendingCount = computed(() => queue.size.value);
  const entries = computed(() => queue.entries.value);
  </script>

  <template>
    <div>
      <MessageList :messages="stream.messages" />
      <QueueList v-if="pendingCount > 0" :entries="entries" :queue="queue" />
      <ChatInput @submit="handleSubmit" />
    </div>
  </template>
  ```

  ```svelte Svelte theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script lang="ts">
    import { useStream, useSubmissionQueue } from "@langchain/svelte";

    const stream = useStream<typeof myAgent>({
      apiUrl: "http://localhost:2024",
      assistantId: "simple_agent",
    });
    const queue = useSubmissionQueue(stream);

    function handleSubmit(text: string) {
      stream.submit({
        messages: [{ type: "human", content: text }],
      });
    }
  </script>

  <div>
    <MessageList messages={stream.messages} />
    {#if queue.size > 0}
      <QueueList entries={queue.entries} {queue} />
    {/if}
    <ChatInput on:submit={(e) => handleSubmit(e.detail)} />
  </div>
  ```

  ```ts Angular theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Component } from "@angular/core";
  import { injectStream, injectSubmissionQueue } from "@langchain/angular";

  @Component({
    selector: "app-chat",
    template: `
      <message-list [messages]="stream.messages()" />
      @if (queue.size() > 0) {
        <queue-list [entries]="queue.entries()" [queue]="queue" />
      }
      <chat-input (onSubmit)="handleSubmit($event)" />
    `,
  })
  export class ChatComponent {
    stream = injectStream<typeof myAgent>({
      apiUrl: "http://localhost:2024",
      assistantId: "simple_agent",
    });
    queue = injectSubmissionQueue(this.stream);

    handleSubmit(text: string) {
      this.stream.submit({
        messages: [{ type: "human", content: text }],
      });
    }
  }
  ```
</CodeGroup>

## 显示队列构建一个 `QueueList` 组件，用取消按钮显示每条待处理消息。这使用户可以了解正在等待的内容，并能够删除不再需要的项目。

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function QueueList({ entries, queue }) {
  return (
    <div className="queue-panel">
      <div className="queue-header">
        <span>Queued messages ({entries.length})</span>
        <button onClick={() => queue.clear()}>Clear all</button>
      </div>
      <ul className="queue-entries">
        {entries.map((entry) => {
          const text = entry.values?.messages?.at(-1)?.content ?? "Pending...";
          return (
            <li key={entry.id} className="queue-entry">
              <span className="queue-text">{text}</span>
              <span className="queue-time">
                {new Date(entry.createdAt).toLocaleTimeString()}
              </span>
              <button
                className="queue-cancel"
                onClick={() => queue.cancel(entry.id)}
              >
                Cancel
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

<Tip>
  将每条排队消息的前几个字符显示为预览，以便用户可以快速识别要取消的项目，而无需阅读完整消息。
</Tip>

## 取消排队消息

您有两个级别的取消：

### 取消单个条目

按 ID 从队列中删除特定消息。代理将跳过它并移至下一个条目。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await queue.cancel(entryId);
```

### 清除整个队列

立即删除所有待处理的消息。当用户更改上下文或想要重新开始时很有用。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await queue.clear();
```

<Note>
  取消队列条目仅影响尚未开始的消息
  处理**。如果代理已经在处理消息，则将其取消
  队列没有任何影响。使用`stream.stop()`中断当前运行。
</Note>

## 使用 `onCreated` 链接后续提交创建新运行时会触发 `onCreated` 回调，为您提供一个以编程方式提交后续消息的钩子。这对于构建多步骤工作流程非常有用，其中下一个问题取决于之前提交的内容是否被接受。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream.submit(
  { messages: [{ type: "human", content: "What is quantum computing?" }] },
  {
    onCreated(run) {
      console.log("Run created:", run.runId);
      // Chain a follow-up
      stream.submit({
        messages: [{ type: "human", content: "Give me a simple analogy." }],
      });
    },
  }
);
```

这种模式自然会排满队列。第一条消息开始处理
立即，后续的在其后面排队。

## 启动一个新线程

当用户想要开始新的对话时，更新反应式 `threadId`
您传递到流中。传递`null`清除当前线程绑定；
下一次提交将创建一个新线程。

<CodeGroup>
  ```tsx React theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  function NewThreadButton() {
    const [threadId, setThreadId] = useState<string | null>(null);
    const stream = useStream<typeof myAgent>({ threadId, onThreadId: setThreadId });

    return (
      <button onClick={() => setThreadId(null)}>
        New conversation
      </button>
    );
  }
  ```

  ```vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  const threadId = ref<string | null>(null);
  const stream = useStream<typeof myAgent>({
    threadId,
    onThreadId: (id) => (threadId.value = id),
  });
  </script>

  <template>
    <button @click="threadId = null">New conversation</button>
  </template>
  ```

  ```svelte Svelte theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script lang="ts">
    let threadId = $state<string | null>(null);
    const stream = useStream<typeof myAgent>({
      threadId: () => threadId,
      onThreadId: (id) => (threadId = id),
    });
  </script>

  <button onclick={() => (threadId = null)}>New conversation</button>
  ```

  ```ts Angular theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  threadId = signal<string | null>(null);
  stream = injectStream<typeof myAgent>({
    threadId: this.threadId,
    onThreadId: (id) => this.threadId.set(id),
  });

  // In template:
  // <button (click)="threadId.set(null)">New conversation</button>
  ```
</CodeGroup>

## 最佳实践* **限制队列大小**：虽然客户端对队列大小没有硬性限制，
  请注意，过大的队列会降低用户体验。考虑
  当队列超过合理阈值（例如 10
  项）。
* **显示队列位置**：对每个排队的项目进行编号，以便用户了解处理顺序。
* **保留输入焦点**：提交后保持输入字段焦点，以便用户可以立即键入下一条消息。
* **动画过渡**：当项目开始处理时，将项目从队列面板平滑地移动到消息列表中。
* **优雅地处理错误**：如果排队的消息失败，则在不阻止后续队列条目的情况下显示错误。
* **消除快速提交**：对于自动或编程提交，请在消息之间添加一个小的延迟，以避免服务器不堪重负。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/message-queues.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>