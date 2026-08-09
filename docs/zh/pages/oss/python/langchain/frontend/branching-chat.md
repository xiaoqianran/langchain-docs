<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Branching chat | https://docs.langchain.com/oss/python/langchain/frontend/branching-chat -->

# 分支聊天

通过从检查点分叉来编辑消息并重新生成响应

与人工智能代理的对话很少是线性的。您可能想改写
问题，重新生成您不喜欢的答案，或探索不同的答案
对话路径不会丢失检查点历史记录。分支聊天用途
LangGraph 检查点作为分叉点：每次编辑或重新生成都会提交一个新的
从所选消息的父检查点运行。

<PatternEmbed />

<Note>
  此功能需要[LangGraph Agent Server](/oss/python/langgraph/local-server)。使用 `langgraph dev` 或 [deploy it to LangSmith](/langsmith/deployment) 在本地运行代理以使用此模式。
</Note>

## 什么是分支聊天？

分支聊天将对话视为检查点时间线而不是
平面列表。每条消息都有指向之前检查点的元数据
消息已创建。编辑消息或重新生成响应会提交新消息
从那个检查站跑。

关键能力：

* **编辑任何用户消息：** 重写之前的提示并从该点重新运行代理
* **重新生成任何 AI 响应：** 要求代理针对相同的输入生成不同的答案
* **检查历史记录：** 当需要分支时间线时，使用 LangGraph 客户端加载检查点

## 设置流元数据使用消息的根流，然后读取每个消息的检查点元数据
呈现每条消息的组件。元数据包括父级
从中分叉的检查点 ID。

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
      assistantId: "simple_agent",
    });

    return (
      <div>
        {stream.messages.map((msg) => (
          <MessageWithForkControls key={msg.id} stream={stream} message={msg} />
        ))}
      </div>
    );
  }
  ```

  ```vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  import { useStream } from "@langchain/vue";

  const AGENT_URL = "http://localhost:2024";

  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "simple_agent",
  });
  </script>

  <template>
    <div>
      <MessageWithForkControls
        v-for="msg in stream.messages.value"
        :key="msg.id"
        :stream="stream"
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
      assistantId: "simple_agent",
    });
  </script>

  <div>
    {#each stream.messages as msg (msg.id)}
      <Message
        message={msg}
        {stream}
      />
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
        <app-message
          [message]="msg"
          [stream]="stream"
        />
      }
    `,
  })
  export class ChatComponent {
    stream = injectStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "simple_agent",
    });
  }
  ```
</CodeGroup>

## 了解消息元数据

`useMessageMetadata(stream, messageId)` 助手返回 [MessageMetadata](https://reference.langchain.com/javascript/langchain-react/MessageMetadata)
对于一条消息。在呈现每条消息的组件中使用它，以便
元数据的范围仅限于该消息 ID：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import type { BaseMessage } from "langchain";
import { useState } from "react";
import { useMessageMetadata, useStream } from "@langchain/react";

function Chat() {
  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "simple_agent",
  });

  return stream.messages.map((message) => (
    <MessageWithForkControls
      key={message.id}
      stream={stream}
      message={message}
    />
  ));
}

function MessageWithForkControls({
  stream,
  message,
}: {
  stream: ReturnType<typeof useStream>;
  message: BaseMessage;
}) {
  const metadata = useMessageMetadata(stream, message.id);
  const checkpointId = metadata?.parentCheckpointId;
  const [editedText, setEditedText] = useState(message.text);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!checkpointId) return;

        stream.submit(
          { messages: [{ type: "human", content: editedText }] },
          { forkFrom: { checkpointId } }
        );
      }}
    >
      <textarea
        value={editedText}
        onChange={(event) => setEditedText(event.target.value)}
      />
      <button disabled={!checkpointId || editedText === message.text}>
        Submit edited branch
      </button>
    </form>
  );
}
```

`parentCheckpointId` 是消息之前的检查点。使用它作为
用于编辑和重新生成的分叉点。

## 编辑消息

要编辑用户消息并分叉对话：

1. 从消息元数据中获取`parentCheckpointId`
2. 使用`forkFrom: { checkpointId }`提交编辑好的消息
3. 代理从该点重新运行

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function handleEdit(
  stream: ReturnType<typeof useStream>,
  originalMsg: HumanMessage,
  metadata: MessageMetadata | undefined,
  newText: string
) {
  if (!metadata?.parentCheckpointId) return;

  stream.submit(
    {
      messages: [{ type: "human", content: newText }],
    },
    { forkFrom: { checkpointId: metadata.parentCheckpointId } }
  );
}
```

编辑后：

* 代理使用更新的消息从分叉点重新运行
* 原始路径在线程历史记录中仍然可用

## 重新生成响应

要在不更改输入的情况下重新生成 AI 响应：

1. 从AI消息元数据中获取`parent_checkpoint`
2. 空输入和`forkFrom: { checkpointId }`提交
3. 代理从该点产生新的响应```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function handleRegenerate(
  stream: ReturnType<typeof useStream>,
  metadata: MessageMetadata | undefined
) {
  if (!metadata?.parentCheckpointId) return;

  stream.submit(undefined, {
    forkFrom: { checkpointId: metadata.parentCheckpointId },
  });
}
```

每次再生都会为该位置的 AI 消息创建一条新路径。

<Tip>
  再生对于非确定性代理很有用。由于 LLM 输出各不相同
  随着温度的变化，重新生成相同的提示通常会产生有意义的结果
  不同的反应。
</Tip>

## 分支在底层是如何工作的

LangGraph 将每个状态转换保留为**检查点**。当您提交时
使用`forkFrom`，后端从该点开始一个新的执行路径
附加到当前对话。结果是一个树结构：

```
User: "What is React?"
  └─ AI: "React is a JavaScript library..." (branch A)
  └─ AI: "React is a UI framework..." (branch B, regenerated)

User: "Tell me about hooks" (branch A)
  └─ AI: "Hooks are functions..."

User: "Tell me about JSX" (edited from branch A)
  └─ AI: "JSX is a syntax extension..."
```

每个路径都保留在检查点存储中。使用
`stream.client.threads.getHistory(threadId)` 当你想建立一个单独的
跨检查点的时间线视图。

## 最佳实践* **读取消息附近的元数据**：在组件中调用`useMessageMetadata`
  呈现消息控件。
* **在悬停时显示叉子控件**：编辑和重新生成按钮应出现在
  将鼠标悬停以保持 UI 干净。
* **按需刷新历史记录**：仅在以下情况下调用`client.threads.getHistory()`
  渲染时间线或在分叉稳定后。
* **流式传输时禁用控件**：不允许编辑或重新生成
  当代理正在积极地传输响应时。检查`stream.isLoading`
  在启用这些操作之前。
* **在取消时保留编辑文本**：如果用户开始编辑，然后取消，
  将文本区域重置为原始消息内容。
* **使用深度检查点树进行测试**：经常编辑和重新生成的用户
  可以创建许多路径。确保时间线渲染保持高性能。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/branching-chat.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>