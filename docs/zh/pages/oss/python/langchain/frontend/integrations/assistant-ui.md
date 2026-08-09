<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: assistant-ui | https://docs.langchain.com/oss/python/langchain/frontend/integrations/assistant-ui -->

# 助手用户界面

Headless React AI 聊天框架，具有完整的运行时层，桥接到 useStream

[assistant-ui](https://www.assistant-ui.com/) 是一个用于 AI 聊天的无头 React UI 框架。它提供了完整的运行时层（线程管理、消息分支、附件处理），通过 `useExternalStoreRuntime` 适配器连接到 [⟦T4⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream)。

<ExampleEmbed />

<Tip>
  克隆并运行[full assistant-ui example](https://github.com/langchain-ai/langgraphjs/tree/main/examples/assistant-ui-claude)，查看使用`useExternalStoreRuntime`连接到 LangChain 代理的 Claude 风格的聊天界面。
</Tip>

## 它是如何工作的

1. **使用 [⟦T7⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream)** 进行流式传输 — 连接到您的代理并获取反应消息、加载状态和提交/取消回调
2. **适配`useExternalStoreRuntime`** — 通过将`BaseMessage[]`转换为`ThreadMessageLike[]`，将`stream.messages`桥接到assistant-ui的运行时格式
3. **提供运行时** — 将您的 UI 包装在 `AssistantRuntimeProvider` 中并渲染任何 Assistant-ui 线程组件

## 安装

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bun add @assistant-ui/react @assistant-ui/react-markdown
```

## 接线`useStream`

`useExternalStoreRuntime` 适配器将 `stream.messages` 桥接至 Assistant-ui 运行时。将其传递给 `AssistantRuntimeProvider` 并渲染任何线程组件：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { useCallback, useMemo } from "react";
import {
  AssistantRuntimeProvider,
  useExternalStoreRuntime,
  type AppendMessage,
  type ThreadMessageLike,
} from "@assistant-ui/react";
import { useStream } from "@langchain/react";
import { Thread } from "@assistant-ui/react";

export function Chat() {
  const stream = useStream({
    apiUrl: "http://localhost:2024",
    assistantId: "claude",
  });

  const onNew = useCallback(
    async (message: AppendMessage) => {
      const text = message.content
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("");
      await stream.submit({ messages: [{ type: "human", content: text }] });
    },
    [stream],
  );

  // Convert LangChain messages to assistant-ui's ThreadMessageLike format
  const messages = useMemo(
    () => toThreadMessages(stream.messages),
    [stream.messages],
  );

  const runtime = useExternalStoreRuntime<ThreadMessageLike>({
    messages,
    onNew,
    onCancel: () => stream.stop(),
    convertMessage: (m) => m,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}
```

### 转换消息

`toThreadMessages`将LangChain`BaseMessage[]`映射为assistant-ui期望的`ThreadMessageLike[]`格式。处理每种消息类型——人类、人工智能和工具——并转换内容块、工具调用和推理令牌：

```tsx expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AIMessage, HumanMessage, ToolMessage, type BaseMessage } from "langchain";
import type { ThreadMessageLike } from "@assistant-ui/react";

export function toThreadMessages(messages: BaseMessage[]): ThreadMessageLike[] {
  const result: ThreadMessageLike[] = [];

  for (const msg of messages) {
    if (HumanMessage.isInstance(msg)) {
      result.push({
        role: "user",
        content: [{ type: "text", text: msg.text }],
      });
    } else if (AIMessage.isInstance(msg)) {
      const parts: ThreadMessageLike["content"] = [];

      // Reasoning tokens
      const reasoning = msg.contentBlocks.find((block) => block.type === "reasoning")?.reasoning;
      if (reasoning) parts.push({ type: "reasoning", text: reasoning });

      // Tool calls
      for (const tc of msg.tool_calls ?? []) {
        parts.push({
          type: "tool-call",
          toolCallId: tc.id ?? "",
          toolName: tc.name,
          args: tc.args,
        });
      }

      // Text response
      const text = msg.text;
      if (text) parts.push({ type: "text", text });

      result.push({ role: "assistant", content: parts });
    } else if (ToolMessage.isInstance(msg)) {
      // Attach tool results to the preceding assistant message
      const last = result[result.length - 1];
      if (last?.role === "assistant") {
        for (const part of last.content) {
          if (
            part.type === "tool-call" &&
            part.toolCallId === msg.tool_call_id
          ) {
            (part as { result?: string }).result = msg.text;
          }
        }
      }
    }
  }

  return result;
}
```

## 自定义线程UI`<Thread />` 提供完整的默认线程 UI，包括消息列表、编辑器和滚动管理。通过覆盖组件槽来自定义各个部件：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Thread, ThreadMessages, Composer } from "@assistant-ui/react";

function CustomThread() {
  return (
    <Thread.Root>
      <ThreadMessages
        components={{
          UserMessage: MyUserMessage,
          AssistantMessage: MyAssistantMessage,
          ToolFallback: MyToolCard,
        }}
      />
      <Composer />
    </Thread.Root>
  );
}
```

## 最佳实践

* **Memoise 消息转换：** 将 `toThreadMessages(stream.messages)` 包装在 `useMemo` 中以避免在每次渲染时重新运行转换
* **处理附件：** 使用`CompositeAttachmentAdapter`和`SimpleImageAttachmentAdapter`进行图片上传；使用文件的自定义适配器进行扩展
* **使用分支：** Assistant-ui 通过 `MessageBranch` 内置了消息分支支持；当您需要 LangGraph 检查点分叉时，将编辑与 `useMessageMetadata` 和 `forkFrom` 配对
* **线程持久化：** 将 `threadId` 与 `onThreadId` 一起持久化，并在页面加载时将其传递回 [⟦T30⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream)，以便 Assistant-ui 重新连接到同一线程

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/integrations/assistant-ui.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>