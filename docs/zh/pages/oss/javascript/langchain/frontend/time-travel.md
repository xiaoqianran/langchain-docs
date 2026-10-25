<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Time travel | https://docs.langchain.com/oss/javascript/langchain/frontend/time-travel -->

# 时间旅行

从对话历史记录中的任何检查点检查、导航和恢复

[checkpoint](/oss/javascript/langgraph/persistence#checkpoints) 是一个保存的快照
LangGraph 座席状态。时间旅行可以让你检查检查站并继续
从保存的状态执行以探索替代路径。

> [!注意]
>
> 此功能需要[LangGraph Agent Server](/oss/javascript/langgraph/local-server)。使用 `langgraph dev` 或 [deploy it to LangSmith](/langsmith/deployment) 在本地运行代理以使用此模式。

## 检查点如何工作

LangGraph 在超步边界保持代理状态。运行的节点
同一超步中的并行共享检查点边界。每个持久状态
是一个 [ThreadState](https://reference.langchain.com/javascript/langchain-langgraph-sdk/index/ThreadState) 对象，它捕获：

* **checkpoint**：检查点标识符，包括其ID和命名空间。
* **created\_at**：快照创建时间。
* **parent\_checkpoint**：此路径中的上一个检查点。
* **值**：此时的完整代理状态（消息、自定义键）。
* **任务**：计划接下来运行的图节点。
* **next**：执行计划中即将到来的节点的名称。历史记录可以包含多个执行路径，而不是一个线性对话。
`getHistory()` 首先返回最新的检查点，默认限制为 10。
使用 `parent_checkpoint` 遵循祖先而不是处理相邻条目
作为父母和孩子。下面的例子显示了返回的历史页面。

## 设置`useStream`

为您的代理创建流，然后显式从中获取检查点历史记录
活动线程的 LangGraph 客户端。从检查点恢复使用
`forkFrom: checkpointId`。

> [!注意]
>
> 代码示例使用 `useStream<typeof myAgent>` 来实现类型安全的流状态。请参阅 [Python](/oss/python/langchain/frontend/overview#type-inference) 或 [JavaScript](/oss/javascript/langchain/frontend/overview#type-inference) 后端的类型推断。

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
    if (!cp.checkpoint.checkpoint_id) return;
    stream.submit(undefined, {
      forkFrom: cp.checkpoint.checkpoint_id,
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
  if (!cp.checkpoint.checkpoint_id) return;
  stream.submit(undefined, {
    forkFrom: cp.checkpoint.checkpoint_id,
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
    if (!cp.checkpoint.checkpoint_id) return;
    stream.submit(undefined, {
      forkFrom: cp.checkpoint.checkpoint_id,
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
    if (!cp.checkpoint.checkpoint_id) return;
    this.stream.submit(undefined, {
      forkFrom: cp.checkpoint.checkpoint_id,
    });
  }
}
```

## 建立检查点时间线

时间线侧边栏将每个检查点显示为可单击的条目。每个条目
显示计划的节点以及当时存在的消息数量。
`tasks` 描述下一步的工作，而不是产生该结果的节点
检查站。使用`next`来标记所有调度节点，包括并行工作：

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
          const nextNodes = cp.next?.join(", ") || "Complete";
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
                <NodeBadge name={nextNodes} />
              </div>
              <p className="mt-1 text-sm font-medium">Next: {nextNodes}</p>
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
          Checkpoint {checkpoint.checkpoint.checkpoint_id?.slice(0, 8)}...
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
```> [!提示]
>
> 对于生产 UI，请考虑使用适当的 JSON 查看器组件
> 可折叠节点而不是原始 `JSON.stringify`。图书馆喜欢
> `react-json-view`或`react-json-tree`给用户更好的探索
> 经验。

## 从检查点恢复

时间旅行的核心是能够从之前的任何状态恢复执行
检查站**。当用户选择检查点时，使用 `undefined` 调用 `submit`
输入并传递检查点 ID 作为`forkFrom`：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const checkpointId = selectedCheckpoint.checkpoint.checkpoint_id;
if (checkpointId) {
  stream.submit(undefined, { forkFrom: checkpointId });
}
```

SDK 将 `undefined` 或 `null` 输入作为 `null` 发送，从
选择检查点而不提供新输入。空对象 (`{}`) 是新的
输入，不是相同的连续信号。如果检查点没有下一个节点，
没有待重播的待处理工作。

新的运行在同一线程中创建另一个路径。 UI 显示该路径；
原始检查点在历史中仍然可用。

> [!警告]
>
> 重放检查点可以再次执行下游工具和 API 调用。
> 它不会逆转早期的外部影响，例如发送的消息或数据库
> 写道。在重播运行之前检查这些效果。

## SplitView 布局

时间旅行最好采用分体式布局，主要聊天内容位于左侧，右侧聊天内容位于左侧。
右边时间轴：```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
          onResume={(cp) => {
            if (!cp.checkpoint.checkpoint_id) return;
            stream.submit(undefined, {
              forkFrom: cp.checkpoint.checkpoint_id,
            });
          }}
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
    nextLabel: cp.next?.join(", ") || "Complete",
    messageCount: (cp.values?.messages as unknown[])?.length ?? 0,
    hasInterrupts: cp.tasks?.some((t) => t.interrupts?.length) ?? false,
    nextNodes: cp.next ?? [],
  }));
}
```

这使得使用有意义的标签渲染时间线条目变得很容易，而不是
原始 ID。

## 用例

时间旅行在许多场景中都是无价的：

* **调试代理行为**：逐步执行代理的决策
  理解为什么它选择一条特定的道路
* **尝试另一条路径**：从先前保存的状态继续，无需
  删除原来的检查点
* **探索替代方案**：从对话中间检查点分叉以查看
  不同的输入如何改变结果
* **审核**：查看代理操作的完整历史记录
  合规性、质量保证或事件后分析
* **教学**：逐步完成代理的执行，解释如何执行
  多步骤推理工作

> [!注意]
>
> 与时间旅行相结合时，时间旅行尤其强大
> [human-in-the-loop](/oss/javascript/langchain/frontend/human-in-the-loop) 模式。如果人类审阅者
> 在中断时拒绝代理的操作，他们可以从检查点恢复
> 在采取行动之前并提供纠正意见。

## 处理时间线中的中断包含中断（人机循环暂停）的检查点值得特殊处理
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
        Next: {checkpoint.next?.join(", ") || "Complete"}
      </p>
    </div>
  );
}
```

## 最佳实践

* **延迟加载历史记录**：对于具有数百个检查点的线程，分页
  或者仅加载最近的 N 个条目以保持 UI 响应。
* **显示有意义的标签**：显示计划的下一个节点和消息计数
  而不是原始检查点 ID。用户需要上下文，而不是 UUID。
* **恢复前确认**：开始前显示确认对话框
  另一条路径，特别是当下游节点有外部影响时。
* **突出显示当前检查点**：使其在视觉上显而易见
  检查点对应于对话的当前状态。
* **支持键盘导航**：高级用户会想要逐步完成
  用箭头键检查点。将键盘处理程序添加到时间线
  流畅的调试体验。
* **检查点之间的差异状态**：对于高级用户，显示发生了什么变化
  两个连续检查点之间的数据可以准确揭示智能体的状态
  每一步都在进化。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/time-travel.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。