<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Reasoning tokens | https://docs.langchain.com/oss/python/langchain/frontend/reasoning-tokens -->

# 推理标记

在可折叠块中显示模型思维和推理过程

推理代币通过扩展思维揭示了 OpenAI 的 GPT-5 和 Anthropic 的 Claude 等高级模型的内部思维过程。这些模型生成结构化内容块，将推理与最终答案分开，让您构建显示模型“如何”得出响应的 UI。

<PatternEmbed />

## 什么是推理标记？

当具有推理能力的模型处理提示时，它们会生成两种不同类型的内容：

1. **推理块**：模型内部思路、问题分解、逐步分析
2. **文本块**：呈现给用户的最终、完善的响应

这些内容作为 `AIMessage` 中的类型化内容块进行交付，可通过 `contentBlocks` 属性进行访问：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// Reasoning block
{ type: "reasoning", reasoning: "Let me think about this step by step..." }

// Text block
{ type: "text", text: "The answer is 42." }
```

<Note>
  并非所有模型都会产生推理标记。此模式特别适用于支持扩展思维或思维链输出的模型。标准聊天模型仅返回文本块。
</Note>

## 用例* **透明度**：向用户展示模型的推理过程，以建立对其答案的信任
* **调试**：检查模型的思维过程以确定哪里出了问题
* **教育工具**：通过揭示人工智能如何处理问题来教学生解决问题
* **决策支持**：让领域专家验证建议背后的推理
* **质量保证**：受监管行业合规性的审计推理链

## 提取推理和文本块

`AIMessage` 上的 `contentBlocks` 数组按生成顺序包含所有块。通过 `type` 过滤它们，将推理与文本分开：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AIMessage } from "langchain";

function extractBlocks(msg: AIMessage) {
  const reasoningBlocks = msg.contentBlocks
    .filter((b) => b.type === "reasoning")
    .map((b) => b.reasoning);

  const textBlocks = msg.contentBlocks
    .filter((b) => b.type === "text")
    .map((b) => b.text);

  return {
    reasoning: reasoningBlocks.join(""),
    text: textBlocks.join(""),
  };
}
```

一条消息可能包含多个推理块（例如，如果模型暂停其推理，生成部分文本，然后进一步推理）。加入他们会给你完整的思考过程。

## 访问来自 `useStream` 的消息

将 [⟦T16⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 连接到具有推理能力的代理并进行迭代
聊天界面中的`stream.messages`。 `HumanMessage.isInstance` 分支和
`AIMessage.isInstance`，然后将每个辅助消息传递给一个组件
阅读`contentBlocks`并将推理与文本分开。将 `isStreaming` 设置为开启
当 `stream.isLoading` 为 true 时，最后一条消息因此思维块更新为
代币到达。<Info>
  代码示例使用 `useStream<typeof myAgent>` 来实现类型安全的流状态。请参阅 [Python](/oss/python/langchain/frontend/overview#type-inference) 或 [JavaScript](/oss/javascript/langchain/frontend/overview#type-inference) 后端的类型推断。
</Info>

<CodeGroup>
  ```tsx React theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { useStream } from "@langchain/react";
  import { AIMessage, HumanMessage } from "langchain";

  function Chat() {
    const stream = useStream<typeof myAgent>({
      apiUrl: "http://localhost:2024",
      assistantId: "reasoning",
    });

    return (
      <div className="messages">
        {stream.messages.map((msg, i) => {
          if (HumanMessage.isInstance(msg)) {
            return <HumanBubble key={i} text={msg.text} />;
          }
          if (AIMessage.isInstance(msg)) {
            return (
              <AIResponse
                key={i}
                message={msg}
                isStreaming={stream.isLoading && i === stream.messages.length - 1}
              />
            );
          }
          return null;
        })}
      </div>
    );
  }
  ```

  ```vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  import { useStream } from "@langchain/vue";
  import { AIMessage, HumanMessage } from "langchain";

  const stream = useStream<typeof myAgent>({
    apiUrl: "http://localhost:2024",
    assistantId: "reasoning",
  });
  </script>

  <template>
    <div class="messages">
      <template v-for="(msg, i) in stream.messages.value" :key="i">
        <HumanBubble v-if="HumanMessage.isInstance(msg)" :text="msg.text" />
        <AIResponse
          v-else-if="AIMessage.isInstance(msg)"
          :message="msg"
          :isStreaming="stream.isLoading.value && i === stream.messages.value.length - 1"
        />
      </template>
    </div>
  </template>
  ```

  ```svelte Svelte theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script lang="ts">
    import { useStream } from "@langchain/svelte";
    import { AIMessage, HumanMessage } from "langchain";

    const stream = useStream<typeof myAgent>({
      apiUrl: "http://localhost:2024",
      assistantId: "reasoning",
    });
  </script>

  <div class="messages">
    {#each stream.messages as msg, i}
      {#if HumanMessage.isInstance(msg)}
        <HumanBubble text={msg.text} />
      {:else if AIMessage.isInstance(msg)}
        <AIResponse
          message={msg}
          isStreaming={stream.isLoading && i === stream.messages.length - 1}
        />
      {/if}
    {/each}
  </div>
  ```

  ```ts Angular theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Component } from "@angular/core";
  import { injectStream } from "@langchain/angular";
  import { AIMessage, HumanMessage } from "langchain";

  @Component({
    selector: "app-chat",
    template: `
      <div class="messages">
        @for (msg of stream.messages(); track $index) {
          @if (isHuman(msg)) {
            <human-bubble [text]="msg.text" />
          } @else if (isAI(msg)) {
            <ai-response
              [message]="msg"
              [isStreaming]="stream.isLoading() && $index === stream.messages().length - 1"
            />
          }
        }
      </div>
    `,
  })
  export class ChatComponent {
    stream = injectStream<typeof myAgent>({
      apiUrl: "http://localhost:2024",
      assistantId: "reasoning",
    });

    isHuman = HumanMessage.isInstance;
    isAI = AIMessage.isInstance;
  }
  ```
</CodeGroup>

## 构建 ThinkingBubble 组件

`ThinkingBubble` 在视觉上独特的可折叠容器中呈现推理令牌。用户可以将其展开以查看完整的思考过程，也可以将其折叠以专注于最终答案。

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { useState } from "react";

function ThinkingBubble({
  reasoning,
  isStreaming,
}: {
  reasoning: string;
  isStreaming: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const charCount = reasoning.length;
  const previewLength = 120;
  const preview =
    reasoning.length > previewLength
      ? reasoning.slice(0, previewLength) + "..."
      : reasoning;

  return (
    <div className="thinking-bubble">
      <button
        className="thinking-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="thinking-icon">
          {isStreaming ? (
            <span className="thinking-spinner" />
          ) : (
            "💭"
          )}
        </span>
        <span className="thinking-label">
          {isStreaming ? "Thinking..." : `Thought process (${charCount} chars)`}
        </span>
        <span className={`chevron ${isExpanded ? "expanded" : ""}`}>▶</span>
      </button>

      {isExpanded && (
        <div className="thinking-content">
          <pre>{reasoning}</pre>
        </div>
      )}

      {!isExpanded && !isStreaming && (
        <div className="thinking-preview">{preview}</div>
      )}
    </div>
  );
}
```

## 渲染完整的 AI 响应

将 `ThinkingBubble` 和标准文本气泡组合成单个 `AIResponse` 组件：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function AIResponse({
  message,
  isStreaming,
}: {
  message: AIMessage;
  isStreaming: boolean;
}) {
  const reasoningBlocks = message.contentBlocks
    .filter((b) => b.type === "reasoning")
    .map((b) => b.reasoning)
    .join("");

  const textBlocks = message.contentBlocks
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const hasReasoning = reasoningBlocks.length > 0;
  const hasText = textBlocks.length > 0;

  const isReasoningPhase = isStreaming && !hasText;
  const isTextPhase = isStreaming && hasText;

  return (
    <div className="ai-response">
      {hasReasoning && (
        <ThinkingBubble
          reasoning={reasoningBlocks}
          isStreaming={isReasoningPhase}
        />
      )}
      {hasText && (
        <div className="ai-text-bubble">
          <p>{textBlocks}</p>
          {isTextPhase && <span className="cursor-blink">▊</span>}
        </div>
      )}
    </div>
  );
}
```

## 处理边缘情况

### 没有推理的消息

并非每条人工智能消息都会包含推理块。当 `contentBlocks` 只有文本块时，渲染一个标准消息气泡，而不使用 ThinkingBubble。

### 空推理块

某些模型会生成空推理块作为占位符。过滤掉这些：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const meaningfulReasoning = message.contentBlocks
  .filter((b) => b.type === "reasoning" && b.reasoning.trim().length > 0);
```

### 多个推理文本循环

一条消息可以在推理块和文本块之间交替。如果需要保留这种交错，请按顺序迭代 `contentBlocks` 而不是按类型分组：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
message.contentBlocks.forEach((block) => {
  if (block.type === "reasoning") {
    // Render ThinkingBubble
  } else if (block.type === "text") {
    // Render text paragraph
  }
});
```

## 最佳实践* **默认折叠**：按需显示推理，默认情况下不显示
* **显示字符数**：让用户快速了解响应中考虑了多少内容
* **视觉上区分**：使用不同的颜色、边框或背景，这样推理就不会与实际答案混淆
* **动画过渡**：平滑的展开/折叠动画提高感知质量
* **考虑可访问性**：在切换按钮上使用适当的 ARIA 属性（`aria-expanded`、`aria-controls`）
* **预览中截断**：折叠时显示推理的简短预览，以便用户决定是否展开

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/reasoning-tokens.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>