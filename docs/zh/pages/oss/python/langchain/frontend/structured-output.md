<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Structured output | https://docs.langchain.com/oss/python/langchain/frontend/structured-output -->

# 结构化输出

使用自定义 UI 组件而不是纯文本呈现结构化代理响应

结构化输出使代理可以返回键入的机器可读数据，而不是纯文本。您获得的不是渲染单个字符串，而是可以映射到任何 UI 的结构化对象：卡片、表格、图表、分步细分或特定于域的渲染器。

<PatternEmbed />

## 什么是结构化输出？

代理不返回自由格式的文本响应，而是使用工具调用返回符合预定义模式的结构化对象。这给你：

* **类型安全数据**：将响应解析为已知的 TypeScript 类型
* **精确的渲染控制**：用自己的UI处理渲染每个字段
* **一致的格式**：无论底层模型如何，每个响应都遵循相同的结构

代理通过调用“结构化输出”工具来实现此目的，该工具的参数包含响应数据。该工具本身不执行任何逻辑，纯粹是返回类型化数据的工具。

## 用例* **产品比较**：功能表、优缺点列表、评级
* **数据分析**：包含指标、细分和亮点的摘要
* **分步指南**：带有描述和代码片段的有序说明
* **食谱**：成分、步骤、时间和营养信息
* **数学和科学**：用 LaTeX 渲染的公式，逐步推导
* **旅行计划**：包含日期、地点和费用估算的行程

## 定义一个模式

为代理返回的结构化数据定义 TypeScript 类型。此架构的形状决定了呈现 UI 的方式。

以下是嵌入式演示使用的数学解决方案架构：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
interface MathSolution {
  problem: string; // The original math problem
  steps: {
    explanation: string;
    latex: string; // Optional display math for this step
  }[]; // Step-by-step derivation
  finalAnswer: string; // Plain-text final answer
  finalAnswerLatex: string; // LaTeX representation of the final answer
}
```

您的架构可以是任何东西。无论形状如何，该图案的工作方式都是相同的。

## 从消息中提取结构化输出

结构化输出位于最后一个`AIMessage`的`tool_calls`数组中。通过查找 AI 消息并访问第一个工具调用的参数来提取它：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AIMessage } from "langchain";

function extractStructuredOutput<T>(messages: any[]): T | null {
  const aiMessage = messages.find(AIMessage.isInstance);
  const toolCall = aiMessage?.tool_calls?.[0];
  if (!toolCall) return null;

  return toolCall.args as T;
}
```

<Note>
  在代理完成流式传输之前，结构化输出工具调用可能不会填充`args`。在流式传输期间，`args`可能会部分填充或未定义。在渲染之前始终检查完整性。
</Note>

## 设置`useStream`将 [⟦T15⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 连接到您的结构化输出代理，然后阅读
`stream.messages` 并从最新的 [⟦T17⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage) 中提取键入的有效负载
工具调用。 `args` 完成后渲染您的自定义 UI，显示加载状态
而`stream.isLoading`为真（工具参数可能会逐渐流入），并且
使用`stream.submit()`发送下一个提示。

<Info>
  代码示例使用 `useStream<typeof myAgent>` 来实现类型安全的流状态。请参阅 [Python](/oss/python/langchain/frontend/overview#type-inference) 或 [JavaScript](/oss/javascript/langchain/frontend/overview#type-inference) 后端的类型推断。
</Info>

<CodeGroup>
  ```tsx React theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { useStream } from "@langchain/react";
  import { AIMessage } from "langchain";

  function MathSolutionChat() {
    const stream = useStream<typeof myAgent>({
      apiUrl: "http://localhost:2024",
      assistantId: "structured_output_latex",
    });

    const solution = extractStructuredOutput<MathSolution>(stream.messages);

    return (
      <div>
        {!solution && !stream.isLoading && (
          <PromptInput onSubmit={(text) =>
            stream.submit({ messages: [{ type: "human", content: text }] })
          } />
        )}
        {stream.isLoading && <LoadingIndicator />}
        {solution && <SolutionCard solution={solution} />}
      </div>
    );
  }
  ```

  ```vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  import { useStream } from "@langchain/vue";
  import { AIMessage } from "langchain";
  import { computed } from "vue";

  const stream = useStream<typeof myAgent>({
    apiUrl: "http://localhost:2024",
    assistantId: "structured_output_latex",
  });

  const solution = computed(() =>
    extractStructuredOutput<MathSolution>(stream.messages.value)
  );

  function handleSubmit(text: string) {
    stream.submit({ messages: [{ type: "human", content: text }] });
  }
  </script>

  <template>
    <div>
      <PromptInput v-if="!solution && !stream.isLoading" @submit="handleSubmit" />
      <LoadingIndicator v-if="stream.isLoading" />
      <SolutionCard v-if="solution" :solution="solution" />
    </div>
  </template>
  ```

  ```svelte Svelte theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script lang="ts">
    import { useStream } from "@langchain/svelte";
    import { AIMessage } from "langchain";

    const stream = useStream<typeof myAgent>({
      apiUrl: "http://localhost:2024",
      assistantId: "structured_output_latex",
    });

    const solution = $derived(extractStructuredOutput<MathSolution>(stream.messages));

    function handleSubmit(text: string) {
      stream.submit({ messages: [{ type: "human", content: text }] });
    }
  </script>

  <div>
    {#if !solution && !stream.isLoading}
      <PromptInput on:submit={(e) => handleSubmit(e.detail)} />
    {/if}
    {#if stream.isLoading}
      <LoadingIndicator />
    {/if}
    {#if solution}
      <SolutionCard {solution} />
    {/if}
  </div>
  ```

  ```ts Angular theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Component, computed } from "@angular/core";
  import { injectStream } from "@langchain/angular";

  @Component({
    selector: "app-math-solution-chat",
    template: `
      @if (!solution() && !stream.isLoading()) {
        <prompt-input (onSubmit)="handleSubmit($event)" />
      }
      @if (stream.isLoading()) {
        <loading-indicator />
      }
      @if (solution()) {
        <solution-card [solution]="solution()" />
      }
    `,
  })
  export class MathSolutionChatComponent {
    stream = injectStream<typeof myAgent>({
      apiUrl: "http://localhost:2024",
      assistantId: "structured_output_latex",
    });

    solution = computed(() =>
      extractStructuredOutput<MathSolution>(this.stream.messages())
    );

    handleSubmit(text: string) {
      this.stream.submit({
        messages: [{ type: "human", content: text }],
      });
    }
  }
  ```
</CodeGroup>

## 渲染结构化数据

拥有类型化对象后，构建一个将每个字段映射到
适当的 UI 元素。这就是该模式的核心：转向结构化
数据进入专门构建的界面。

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function LatexBlock({ latex }: { latex: string }) {
  return <div className="latex-block">{latex}</div>; // Render with KaTeX or MathJax.
}

function SolutionCard({ solution }: { solution: MathSolution }) {
  return (
    <div className="solution-card">
      <h3>{solution.problem}</h3>
      <ol>
        {solution.steps.map((step, i) => (
          <li key={i}>
            <span>{step.explanation}</span>
            {step.latex && <LatexBlock latex={step.latex} />}
          </li>
        ))}
      </ol>
      <strong>{solution.finalAnswer}</strong>
      {solution.finalAnswerLatex && <LatexBlock latex={solution.finalAnswerLatex} />}
    </div>
  );
}
```

## 处理部分流数据

在流式传输期间，工具调用参数可能是不完整的 JSON。在提取逻辑中防止这种情况：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function extractStructuredOutput<T>(
  messages: any[],
  requiredFields: string[] = [],
): T | null {
  const aiMessages = messages.filter(AIMessage.isInstance);
  if (aiMessages.length === 0) return null;

  const lastAI = aiMessages[aiMessages.length - 1];
  const toolCall = lastAI.tool_calls?.[0];
  if (!toolCall?.args) return null;

  const args = toolCall.args as Record<string, unknown>;
  const hasRequired = requiredFields.every(
    (field) => args[field] !== undefined
  );

  if (requiredFields.length > 0 && !hasRequired) return null;
  return args as T;
}
```

使用 `requiredFields` 参数等待关键字段填充后再渲染：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const solution = extractStructuredOutput<MathSolution>(stream.messages, [
  "problem",
  "steps",
  "finalAnswer",
]);
```

## 在流式传输期间逐步渲染

与其等待完整的结构化输出，不如在字段到达时对其进行渲染。这可以在代理仍在生成时为用户提供即时反馈：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function ProgressiveSolutionCard({ messages }: { messages: any[] }) {
  const partial = extractStructuredOutput<Partial<MathSolution>>(messages);
  if (!partial) return null;

  return (
    <div className="solution-card">
      {partial.problem && <h3>{partial.problem}</h3>}

      {partial.steps && partial.steps.length > 0 && (
        <div className="solution-steps">
          <h4>Steps</h4>
          {partial.steps.map((step, i) => (
            <div key={i} className="step">
              <div className="step-number">Step {i + 1}</div>
              <p>{step.explanation}</p>
              {step.latex && <LatexBlock latex={step.latex} />}
            </div>
          ))}
        </div>
      )}

      {partial.finalAnswer && <strong>{partial.finalAnswer}</strong>}
    </div>
  );
}
```<Tip>
  当架构具有自然的从上到下的结构时，渐进式渲染效果很好
  顺序：问题，然后推导步骤，然后最终答案。代理人通常
  按架构顺序生成字段，因此 UI 会自然填充。
</Tip>

## 最佳实践

* **渲染前验证**：在渲染之前始终检查所需字段是否存在，因为流式传输可能会传递部分数据
* **使用通用提取函数**：使用类型和必填字段参数化您的提取逻辑，以便它可以跨不同模式工作
* **渐进式渲染**：在字段到达时显示字段，而不是等待完整的对象，以便用户看到即时反馈
* **提供后备表示**：如果字段支持丰富的渲染（LaTeX、Markdown、图表），还可以在架构中包含等效的纯文本作为后备
* **尽可能保持架构平坦**：深度嵌套的架构更难逐步渲染，并且在部分流式传输期间更有可能中断
* **将 UI 与数据匹配**：选择最能代表每种字段类型的渲染策略（数组的表格、嵌套对象的卡片、状态字段的徽章）

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/structured-output.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>