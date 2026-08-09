<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Subagent streaming | https://docs.langchain.com/oss/python/deepagents/frontend/subagent-streaming -->

# 子代理流式传输

显示具有流媒体内容、进度跟踪和可折叠卡片的专家子代理

当协调代理产生专业子代理（研究员、
分析师、作家），您需要单独渲染协调器的消息
来自每个子代理的流输出。 v1 SDK 保持协调器消息开启
根流并将子代理公开为发现快照。将快照传递给
选择器挂钩或可组合项（例如用于渲染的 `useMessages(stream, subagent)`）
专家的范围流。

这就是 LangChain 前端 SDK 超越平面聊天记录的地方：
子代理是一流的流实体，具有自己的状态、消息、
工具调用元数据和结果。您的 UI 可以显示委托、进度、错误、
和最终综合，而不要求用户从每个中读取交错的标记
工人。

<PatternEmbed />

## 为什么基于选择器的子代理流

根流始终专注于协调器对话：* `stream.messages` 仅包含协调者的消息
* `stream.subagents` 包含带有身份、命名空间和状态的发现快照
* 每个子代理的消息、工具调用和值都使用选择器助手读取
* UI 保持干净：协调者的推理与实际情况是分开的
  专家的工作

这种分离使您可以在一个地方呈现编排器的消息，并且
仅当用户需要查看专家工作时才安装子代理卡。

对于大型任务，这还可以保持 UI 可扩展。用户可以浏览
协调员的高层计划，仅扩展他们关心的专业工作，
并且仍然保留完整的子代理跟踪以进行调试、审核或重放。

## 设置`useStream`不需要额外的流选项。将溪流指向你的深层代理人，
渲染来自`stream.messages`的协调器消息，并使用`stream.subagents`
为活跃的专家安装卡片。在聊天布局中，按以下方式索引子代理
生成它们的工具调用 ID，以便每张卡都出现在协调员回合下
将流指向您的深度代理，渲染来自 `stream.messages` 的协调器消息，并使用 `stream.subagents` 为活跃专家挂载卡。在聊天布局中，按以下方式索引子代理
生成它们的工具调用 ID，因此每张卡都会出现在委派工作的协调员轮次下。

<Info>
  代码示例使用 `useStream<typeof myAgent>` 来实现类型安全的流状态。请参阅 [Python](/oss/python/langchain/frontend/overview#type-inference) 或 [JavaScript](/oss/javascript/langchain/frontend/overview#type-inference) 后端的类型推断。
</Info>

<CodeGroup>
  ```tsx React theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { useStream } from "@langchain/react";
  import { AIMessage, HumanMessage } from "langchain";

  const AGENT_URL = "http://localhost:2024";

  export function DeepAgentChat() {
    const stream = useStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "deep_agent_subagent_cards",
    });
    const subagents = [...stream.subagents.values()];
    const subagentsByCallId = new Map(subagents.map((s) => [s.id, s]));

    return (
      <div>
        {stream.messages.map((msg) => {
          const turnSubagents = AIMessage.isInstance(msg)
            ? (msg.tool_calls ?? [])
                .map((tc) => subagentsByCallId.get(tc.id ?? ""))
                .filter((s): s is NonNullable<typeof s> => !!s)
            : [];

          return (
            <div key={msg.id}>
              {HumanMessage.isInstance(msg) && <HumanBubble>{msg.text}</HumanBubble>}
              {AIMessage.isInstance(msg) && msg.text.trim() && (
                <AIBubble>{msg.text}</AIBubble>
              )}
              {turnSubagents.map((subagent) => (
                <SubagentCard key={subagent.id} stream={stream} subagent={subagent} />
              ))}
            </div>
          );
        })}
      </div>
    );
  }
  ```

  ```vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  import { computed } from "vue";
  import { useStream } from "@langchain/vue";
  import { AIMessage, HumanMessage } from "langchain";

  const AGENT_URL = "http://localhost:2024";

  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "deep_agent_subagent_cards",
  });

  const subagentsByCallId = computed(
    () => new Map([...stream.subagents.value.values()].map((s) => [s.id, s]))
  );

  function subagentsForMessage(msg: unknown) {
    if (!AIMessage.isInstance(msg)) return [];
    return (msg.tool_calls ?? [])
      .map((tc) => subagentsByCallId.value.get(tc.id ?? ""))
      .filter(Boolean);
  }
  </script>

  <template>
    <div>
      <div
        v-for="msg in stream.messages.value"
        :key="msg.id"
      >
        <HumanBubble v-if="HumanMessage.isInstance(msg)">
          {{ msg.text }}
        </HumanBubble>
        <AIBubble v-else-if="AIMessage.isInstance(msg) && msg.text.trim()">
          {{ msg.text }}
        </AIBubble>
        <SubagentCard
          v-for="subagent in subagentsForMessage(msg)"
          :key="subagent.id"
          :stream="stream"
          :subagent="subagent"
        />
      </div>
    </div>
  </template>
  ```

  ```svelte Svelte theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script lang="ts">
    import { useStream } from "@langchain/svelte";

    const AGENT_URL = "http://localhost:2024";

    const stream = useStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "deep_agent_subagent_cards",
    });
  </script>

  <div>
    {#each stream.messages as msg (msg.id)}
      <Message {msg} />
    {/each}
    {#each [...stream.subagents.values()] as subagent (subagent.id)}
      <SubagentCard {stream} {subagent} />
    {/each}
  </div>
  ```

  ```ts Angular theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Component, computed } from "@angular/core";
  import { injectStream } from "@langchain/angular";

  const AGENT_URL = "http://localhost:2024";

  @Component({
    selector: "app-deep-agent-chat",
    template: `
      @for (msg of stream.messages(); track msg.id) {
        <app-message [message]="msg" />
      }
      @for (subagent of subagents(); track subagent.id) {
        <app-subagent-card [stream]="stream" [subagent]="subagent" />
      }
    `,
  })
  export class DeepAgentChatComponent {
    stream = injectStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "deep_agent_subagent_cards",
    });

    subagents = computed(() => [...this.stream.subagents().values()]);
  }
  ```
</CodeGroup>

## 提交消息

通过根流提交消息。深度代理工作流程通常涉及
多层嵌套子图，因此设置适当的递归限制，如果
您的代理人可以深度委托：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
stream.submit(
  { messages: [{ type: "human", content: text }] },
  { config: { recursion_limit: 100 } }
);
```

<Note>
  Deep Agents 设置默认递归限制为 10,000，这对于
  大多数多专家设置。您可以通过 `config.recursion_limit` 覆盖它，如果
  需要。
</Note>

## 子代理发现快照每个[SubagentDiscoverySnapshot](https://reference.langchain.com/javascript/langchain-react/SubagentDiscoverySnapshot)都是一个轻量级的发现记录
子代理在线程内运行。它告诉您的 UI 存在子代理，
它位于子代理树中的位置，以及它处于什么生命周期状态。

该快照**不**包括子代理的流式消息或工具调用。
相反，将快照传递给选择器挂钩，例如
`useMessages(stream, subagent)` 或 `useToolCalls(stream, subagent)`。这些钩子
仅使用快照命名空间订阅子代理的流原语
当安装相应的卡或面板时。

## 构建子代理卡

每个子代理卡都会显示专家的姓名、状态、流媒体内容和
工具调用。使用选择器挂钩订阅子代理命名空间：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { useState } from "react";
import { AIMessage } from "langchain";
import {
  useMessages,
  useToolCalls,
  type AnyStream,
  type SubagentDiscoverySnapshot,
} from "@langchain/react";

function SubagentCard({
  stream,
  subagent,
}: {
  stream: AnyStream;
  subagent: SubagentDiscoverySnapshot;
}) {
  const [expanded, setExpanded] = useState(true);
  const messages = useMessages(stream, subagent);
  const toolCalls = useToolCalls(stream, subagent);

  const lastAIMessage = messages
    .filter(AIMessage.isInstance)
    .at(-1);

  const displayContent =
    lastAIMessage?.text ?? subagent.output ?? "";

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <StatusIcon status={subagent.status} />
          <div>
            <h4 className="font-semibold capitalize">{subagent.name}</h4>
            <p className="text-xs text-gray-500">
              {toolCalls.length} tool call{toolCalls.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={subagent.status} />
        </div>
      </button>

      {expanded && displayContent && (
        <div className="border-t px-4 py-3">
          <div className="prose prose-sm max-w-none line-clamp-6">
            {displayContent}
            {subagent.status === "running" && (
              <span className="inline-block h-4 w-1 animate-pulse bg-blue-500" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

## 进度跟踪

显示进度条和计数器，以便用户知道有多少子代理已完成：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function SubagentProgress({
  subagents,
}: {
  subagents: SubagentDiscoverySnapshot[];
}) {
  const completed = subagents.filter((s) => s.status === "complete").length;
  const total = subagents.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Subagent progress</span>
        <span>
          {completed}/{total} complete
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

## 使用子代理卡渲染消息

关键的布局模式是从根流渲染协调器消息
并将子代理卡附加到其工具调用生成它们的 AI 消息中：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function DeepAgentLayout({ stream }: { stream: AnyStream }) {
  const subagents = [...stream.subagents.values()];
  const subagentsByCallId = new Map(subagents.map((s) => [s.id, s]));

  return (
    <div className="space-y-3">
      {stream.messages.map((message) => {
        const turnSubagents = AIMessage.isInstance(message)
          ? (message.tool_calls ?? [])
              .map((tc) => subagentsByCallId.get(tc.id ?? ""))
              .filter((s): s is SubagentDiscoverySnapshot => !!s)
          : [];

        return (
          <div key={message.id}>
            <Message message={message} />
            {turnSubagents.length > 0 && (
              <div className="ml-4 space-y-3 border-l-2 border-blue-200 pl-4">
                <SubagentProgress subagents={subagents} />
                {turnSubagents.map((subagent) => (
                  <SubagentCard key={subagent.id} stream={stream} subagent={subagent} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```您可以将内联卡与全局子代理视图结合起来：索引子代理
协调器工具调用为成绩单卡生成它们，并使用
`stream.subagents` 用于汇总所有活跃工作人员的持久侧边栏。
这为用户提供了本地上下文和整个运行的鸟瞰图。

## 最佳实践

* **仅在需要的地方安装选择器**。作用域消息和工具调用流
  当卡调用`useMessages(stream, subagent)`或`useToolCalls(stream, subagent)`时。
* **显示专家姓名**。 `subagent.name` 告诉用户哪个工作线程处于活动状态。
* **使用可折叠卡片**。在具有 5 个以上子代理的工作流程中，自动折叠
  完成卡片，以便用户可以专注于积极的工作。
* **仅在需要时覆盖递归**。 Deep Agents 设置了较高的默认值
  递归限制；通过`config.recursion_limit`仅适用于异常深度的定制
  工作流程。
* **处理每个子代理的错误**。一个子代理失败不应导致系统崩溃
  整个用户界面。在其他子代理的卡中显示错误，而其他代理继续
  运行。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/frontend/subagent-streaming.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>