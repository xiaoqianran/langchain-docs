<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Time travel | https://docs.langchain.com/oss/javascript/langchain/frontend/time-travel -->

# 时间旅行

从对话历史记录中的任何检查点检查、导航和恢复

LangGraph 代理中的每个状态更改都会创建一个**检查点**，一个完整的检查点
代理当时状态的快照。时间旅行可以让你检查任何
检查点，查看代理所持有的确切状态，并从**恢复执行
到那时**探索替代路径。它是一个调试器、一个撤消按钮，以及
审计日志合二为一。

<PatternEmbed />

<Note>
  此功能需要[LangGraph Agent Server](/oss/javascript/langgraph/local-server)。使用 `langgraph dev` 或 [deploy it to LangSmith](/langsmith/deployment) 在本地运行代理以使用此模式。
</Note>

## 检查点如何工作

LangGraph 在每次节点执行后都会保留代理状态。每个持久状态
是一个 [ThreadState](https://reference.langchain.com/javascript/langchain-langgraph-sdk/index/ThreadState) 对象，它捕获：

* **检查点**：标识此特定快照的元数据（ID、时间戳）
* **值**：此时的完整代理状态（消息、自定义键）
* **任务**：计划接下来运行的图节点
* **next**：执行计划中即将到来的节点的名称

这为代理做出的每个决定、每个工具创建了一个线性时间表
调用，以及它产生的每一个响应。你的 UI 可以渲染这个时间线并让
用户跳转到任意点。

## 设置`useStream`为您的代理创建流，然后显式从中获取检查点历史记录
活动线程的 LangGraph 客户端。从检查点恢复使用
`forkFrom: { checkpointId }`。

<Info>
  代码示例使用 `useStream<typeof myAgent>` 来实现类型安全的流状态。请参阅 [Python](/oss/python/langchain/frontend/overview#type-inference) 或 [JavaScript](/oss/javascript/langchain/frontend/overview#type-inference) 后端的类型推断。
</Info>

<CodeGroup>
  ```tsx React theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { useStream } from "@langchain/react";
  import { useEffect, useState } from "react";

  const AGENT_URL = "http://localhost:2024";

  export function TimeTravelChat() {
    const [threadId, setThreadId] = useState<string | null>(null);
    const [history, setHistory] = useState<ThreadState[]>([]);
    const stream = useStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "time_travel",
      threadId,
      onThreadId: setThreadId,
    });

    useEffect(() => {
      if (!threadId || stream.isLoading) return;
      stream.client.threads.getHistory(threadId).then(setHistory);
    }, [stream.client, threadId, stream.isLoading]);

    function resumeFrom(cp: ThreadState) {
      stream.submit({}, {
        forkFrom: { checkpointId: cp.checkpoint.checkpoint_id },
      });
    }

    return (
      <div className="flex h-screen">
        <ChatPanel messages={stream.messages} />
        <TimelineSidebar history={history} onSelect={resumeFrom} />
      </div>
    );
  }
  ```

  ```vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  import { useStream } from "@langchain/vue";
  import { ref, watch } from "vue";

  const AGENT_URL = "http://localhost:2024";
  const threadId = ref<string | null>(null);
  const history = ref<ThreadState[]>([]);

  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "time_travel",
    threadId,
    onThreadId: (id) => (threadId.value = id),
  });

  watch(
    [threadId, stream.isLoading],
    async ([id, isLoading]) => {
      if (isLoading) return;
      history.value = id
        ? ((await stream.client.threads.getHistory(id)) as ThreadState[])
        : [];
    },
    { immediate: true },
  );

  function resumeFrom(cp: ThreadState) {
    stream.submit({}, {
      forkFrom: { checkpointId: cp.checkpoint.checkpoint_id },
    });
  }
  </script>

  <template>
    <div class="flex h-screen">
      <ChatPanel :messages="stream.messages.value" />
      <TimelineSidebar :history="history" @select="resumeFrom" />
    </div>
  </template>
  ```

  ```svelte Svelte theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script lang="ts">
    import { useStream } from "@langchain/svelte";

    const AGENT_URL = "http://localhost:2024";
    let threadId = $state<string | null>(null);
    let history = $state<ThreadState[]>([]);

    const stream = useStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "time_travel",
      threadId: () => threadId,
      onThreadId: (id) => (threadId = id),
    });

    $effect(() => {
      if (!threadId) {
        history = [];
        return;
      }
      if (stream.isLoading) return;
      stream.client.threads.getHistory(threadId).then((states) => {
        history = states as ThreadState[];
      });
    });

    function resumeFrom(cp: ThreadState) {
      stream.submit({}, {
        forkFrom: { checkpointId: cp.checkpoint.checkpoint_id },
      });
    }
  </script>

  <div class="flex h-screen">
    <ChatPanel messages={stream.messages} />
    <TimelineSidebar {history} onSelect={resumeFrom} />
  </div>
  ```

  ```ts Angular theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Component, effect, signal } from "@angular/core";
  import { injectStream } from "@langchain/angular";

  const AGENT_URL = "http://localhost:2024";

  @Component({
    selector: "app-time-travel-chat",
    template: `
      <div class="flex h-screen">
        <app-chat-panel [messages]="stream.messages()" />
        <app-timeline-sidebar
          [history]="history()"
          (select)="resumeFrom($event)"
        />
      </div>
    `,
  })
  export class TimeTravelChatComponent {
    threadId = signal<string | null>(null);
    history = signal<ThreadState[]>([]);

    stream = injectStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "time_travel",
      threadId: this.threadId,
      onThreadId: (id) => this.threadId.set(id),
    });

    constructor() {
      effect(() => {
        if (this.stream.isLoading()) return;
        void this.refreshHistory(this.threadId());
      });
    }

    async refreshHistory(id: string | null) {
      this.history.set(id
        ? ((await this.stream.client.threads.getHistory(id)) as ThreadState[])
        : []);
    }

    resumeFrom(cp: ThreadState) {
      this.stream.submit({}, {
        forkFrom: { checkpointId: cp.checkpoint.checkpoint_id },
      });
    }
  }
  ```
</CodeGroup>

## 建立检查点时间线

时间线侧边栏将每个检查点显示为可单击的条目。每个条目
显示运行的节点以及当时存在的消息数量：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function TimelineSidebar({
  history,
  onSelect,
}: {
  history: ThreadState[];
  onSelect: (cp: ThreadState) => void;
}) {
  return (
    <aside className="w-80 overflow-y-auto border-l bg-gray-50 p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase text-gray-500">
        Checkpoint Timeline
      </h2>
      <div className="space-y-2">
        {history.map((cp, i) => {
          const taskName = cp.tasks?.[0]?.name ?? "unknown";
          const msgCount = (cp.values?.messages as unknown[])?.length ?? 0;

          return (
            <button
              key={cp.checkpoint.checkpoint_id}
              onClick={() => onSelect(cp)}
              className="w-full rounded-lg border bg-white p-3 text-left
                         hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">#{i + 1}</span>
                <NodeBadge name={taskName} />
              </div>
              <p className="mt-1 text-sm font-medium">{taskName}</p>
              <p className="text-xs text-gray-500">
                {msgCount} message{msgCount !== 1 ? "s" : ""}
              </p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
```

## 检查检查点状态

单击检查点应显示该点的完整状态。 JSON 查看器
使开发人员能够全面了解代理的了解和决定：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function CheckpointInspector({ checkpoint }: { checkpoint: ThreadState }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Checkpoint {checkpoint.checkpoint.checkpoint_id.slice(0, 8)}...
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:underline"
        >
          {expanded ? "Collapse" : "Expand"} state
        </button>
      </div>

      <div className="mt-2 space-y-1 text-sm">
        <p>
          <strong>Node:</strong>{" "}
          {checkpoint.tasks?.[0]?.name ?? "—"}
        </p>
        <p>
          <strong>Next:</strong>{" "}
          {checkpoint.next?.join(", ") || "—"}
        </p>
        <p>
          <strong>Messages:</strong>{" "}
          {(checkpoint.values?.messages as unknown[])?.length ?? 0}
        </p>
      </div>

      {expanded && (
        <div className="mt-3 max-h-96 overflow-auto rounded bg-gray-900 p-3">
          <pre className="text-xs text-gray-200">
            {JSON.stringify(checkpoint.values, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

<Tip>
  对于生产 UI，请考虑使用适当的 JSON 查看器组件
  可折叠节点而不是原始的`JSON.stringify`。图书馆喜欢
  `react-json-view`或`react-json-tree`给用户更好的探索
  经验。
</Tip>

## 从检查点恢复

时间旅行的核心是能够从之前的任何状态恢复执行
检查站**。当用户选择检查点时，使用 `null` 输入调用 `submit`
并传递检查点ID：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream.submit({}, {
  forkFrom: { checkpointId: selectedCheckpoint.checkpoint.checkpoint_id },
});
```

这告诉 LangGraph：1. 回滚到所选检查点的状态
2. 从该点开始重新执行图表
3. 将新结果传输给客户端

所选检查点之后的现有消息将被新消息替换
执行路径。这有效地在对话中创建了一个**分支**
时间线。

<Note>
  从检查点恢复不会删除原始时间线。上一个
  检查点在历史记录中仍然可用。这意味着用户可以随时返回
  并在不丢失任何先前工作的情况下尝试不同的路径。
</Note>

## SplitView 布局

时间旅行最好采用分体式布局，主要聊天内容位于左侧，右侧聊天内容位于左侧。
右边时间轴：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function TimeTravelLayout() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [history, setHistory] = useState<ThreadState[]>([]);
  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "time_travel",
    threadId,
    onThreadId: setThreadId,
  });

  const [selectedCheckpoint, setSelectedCheckpoint] =
    useState<ThreadState | null>(null);

  useEffect(() => {
    if (!threadId || stream.isLoading) return;
    stream.client.threads.getHistory(threadId).then(setHistory);
  }, [stream.client, threadId, stream.isLoading]);

  return (
    <div className="flex h-screen">
      {/* Main chat area */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {stream.messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))}
        </div>
        <ChatInput
          onSubmit={(text) =>
            stream.submit({ messages: [{ type: "human", content: text }] })
          }
          isLoading={stream.isLoading}
        />
      </main>

      {/* Timeline sidebar */}
      <aside className="w-96 overflow-y-auto border-l bg-gray-50">
        <TimelineSidebar
          history={history}
          selected={selectedCheckpoint}
          onSelect={setSelectedCheckpoint}
          onResume={(cp) =>
            stream.submit({}, {
              forkFrom: { checkpointId: cp.checkpoint.checkpoint_id },
            })
          }
        />
        {selectedCheckpoint && (
          <CheckpointInspector checkpoint={selectedCheckpoint} />
        )}
      </aside>
    </div>
  );
}
```

## 提取检查点元数据

将原始检查点数据转换为适合时间线显示的条目：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function formatCheckpoints(history: ThreadState[]) {
  return history.map((cp, index) => ({
    index,
    id: cp.checkpoint?.checkpoint_id,
    taskName: cp.tasks?.[0]?.name ?? "unknown",
    messageCount: (cp.values?.messages as unknown[])?.length ?? 0,
    hasInterrupts: cp.tasks?.some((t) => t.interrupts?.length) ?? false,
    nextNodes: cp.next ?? [],
  }));
}
```

这使得使用有意义的标签渲染时间线条目变得很容易，而不是
原始 ID。

## 用例

时间旅行在许多场景中都是无价的：* **调试代理行为**：逐步执行代理的决策
  理解为什么它选择一条特定的道路
* **撤消操作**：如果代理走错了方向，则从较早的位置恢复
  检查点并重试
* **探索替代方案**：从对话中间检查点分叉以查看
  不同的输入如何改变结果
* **审核**：查看代理操作的完整历史记录
  合规性、质量保证或事件后分析
* **教学**：逐步完成代理的执行，解释如何执行
  多步骤推理工作

<Info>
  与时间旅行相结合时，时间旅行尤其强大
  [human-in-the-loop](/oss/javascript/langchain/frontend/human-in-the-loop) 图案。如果人类审阅者
  在中断时拒绝代理的操作，他们可以从检查点恢复
  在采取行动之前并提供纠正意见。
</Info>

## 处理时间线中的中断

包含中断（人机循环暂停）的检查点值得特殊处理
视觉治疗。它们代表了代理停下来等待的时刻
人工输入：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function TimelineEntry({
  checkpoint,
  index,
}: {
  checkpoint: ThreadState;
  index: number;
}) {
  const hasInterrupt = checkpoint.tasks?.some(
    (t) => t.interrupts && t.interrupts.length > 0
  );

  return (
    <div
      className={`rounded-lg border p-3 ${
        hasInterrupt
          ? "border-amber-300 bg-amber-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">#{index + 1}</span>
        {hasInterrupt && (
          <span className="rounded bg-amber-200 px-1.5 py-0.5 text-xs font-medium text-amber-800">
            Interrupt
          </span>
        )}
      </div>
      <p className="mt-1 text-sm font-medium">
        {checkpoint.tasks?.[0]?.name ?? "—"}
      </p>
    </div>
  );
}
```

## 最佳实践* **延迟加载历史记录**：对于具有数百个检查点的线程，分页
  或者仅加载最近的 N 个条目以保持 UI 响应。
* **显示有意义的标签**：显示节点名称和消息计数而不是
  原始检查点 ID。用户需要上下文，而不是 UUID。
* **恢复前确认**：从旧检查点恢复取代
  当前执行路径。显示确认对话框，这样用户就不会
  意外丢失当前对话状态。
* **突出显示当前检查点**：使其在视觉上显而易见
  检查点对应于对话的当前状态。
* **支持键盘导航**：高级用户会想要逐步完成
  用箭头键检查点。将键盘处理程序添加到时间线
  流畅的调试体验。
* **检查点之间的差异状态**：对于高级用户，显示发生了什么变化
  两个连续检查点之间的数据可以准确揭示智能体的状态
  每一步都在进化。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/time-travel.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>