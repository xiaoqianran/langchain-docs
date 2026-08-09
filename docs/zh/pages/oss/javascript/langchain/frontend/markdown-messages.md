<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Markdown messages | https://docs.langchain.com/oss/javascript/langchain/frontend/markdown-messages -->

# 降价消息

将 LLM 响应呈现为丰富的、格式化的 Markdown 并具有适当的流支持

LLM 自然会生成 Markdown 格式的文本，包括标题、列表、代码块、
表格和内联格式。将此内容呈现为纯文本会浪费
模型提供的结构。该模式向您展示了如何解析和渲染
从代理流式传输到所有主要前端时实时降价
框架。

<PatternEmbed />

## Markdown 渲染是如何工作的

渲染管线分为三个步骤：

1. **接收：** [⟦T9⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 将流式文本累积到 `msg.text` 中
   每一条人工智能消息，都会随着新代币的到来而进行反应性更新。
2. **解析：** Markdown 解析器将原始文本转换为 HTML（或 React
   元素树）。这会在每次更新时运行，但对于聊天长度而言速度足够快
   内容(\< 5ms for a 5 KB message).
3. **Render:** The parsed output is rendered into the DOM. React uses virtual
   DOM diffing; Vue and Svelte use ⟦T11⟧ / ⟦T12⟧ with sanitized HTML.

## Setting up ⟦T13⟧

The markdown pattern uses a simple chat agent with no special configuration.
Wire up ⟦T52⟧ with your agent URL and assistant ID.

<Info>
  代码示例使用 `useStream<typeof myAgent>` 来实现类型安全的流状态。请参阅 [Python](/oss/python/langchain/frontend/overview#type-inference) 或 [JavaScript](/oss/javascript/langchain/frontend/overview#type-inference) 后端的类型推断。
</Info>

<CodeGroup>
  ```tsx React theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { useStream } from "@langchain/react";
  import { AIMessage, HumanMessage } from "langchain";

  const AGENT_URL = "http://localhost:2024";

  export function Chat() {
    const stream = useStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "simple_agent",
    });

    return (
      <div>
        {stream.messages.map((msg) => {
          if (AIMessage.isInstance(msg)) {
            return <Markdown key={msg.id}>{msg.text}</Markdown>;
          }
          if (HumanMessage.isInstance(msg)) {
            return <p key={msg.id}>{msg.text}</p>;
          }
        })}
      </div>
    );
  }
  ```

  ```vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  import { useStream } from "@langchain/vue";
  import { AIMessage, HumanMessage } from "langchain";

  const AGENT_URL = "http://localhost:2024";

  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "simple_agent",
  });
  </script>

  <template>
    <div>
      <template v-for="msg in stream.messages.value" :key="msg.id">
        <Markdown v-if="AIMessage.isInstance(msg)">{{ msg.text }}</Markdown>
        <p v-else-if="HumanMessage.isInstance(msg)">{{ msg.text }}</p>
      </template>
    </div>
  </template>
  ```

  ```svelte Svelte theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script lang="ts">
    import { useStream } from "@langchain/svelte";
    import { AIMessage, HumanMessage } from "langchain";

    const AGENT_URL = "http://localhost:2024";

    const stream = useStream<typeof myAgent>({
      apiUrl: AGENT_URL,
      assistantId: "simple_agent",
    });
  </script>

  <div>
    {#each stream.messages as msg (msg.id)}
      {#if AIMessage.isInstance(msg)}
        <Markdown content={msg.text} />
      {:else if HumanMessage.isInstance(msg)}
        <p>{msg.text}</p>
      {/if}
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
        <app-markdown [content]="msg.text" />
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

## 选择 Markdown 库

每个框架对于 Markdown 渲染都有一个自然的选择：|框架|图书馆 |输出|为什么 |
| ---------| ------------------------------------------- | -------------------------------- | ------------------------------------------------------------------ |
|反应 | `react-markdown` + `remark-gfm` |反应元素 |基于组件的虚拟 DOM 比较，无 `dangerouslySetInnerHTML` |
|视图 | `marked` + `dompurify` |通过 `v-html` 净化 HTML |轻量级、快速、内置 GFM |
|苗条| `marked` + `dompurify` |通过 `{@html}` 净化 HTML |和Vue一样，API一致 |
|角度| `marked` + `dompurify` |通过 `[innerHTML]` 净化 HTML |与 Vue/Svelte 相同 |

<Tip>
  React 的 `react-markdown` 将 markdown 直接转换为 React 元素，所以它
  不需要 HTML 清理。不涉及`dangerouslySetInnerHTML`。
  对于 Vue、Svelte 和 Angular，请始终使用 `dompurify` 清理已解析的 HTML
  渲染之前。
</Tip>

## 构建 Markdown 组件

<CodeGroup>
  ```tsx React theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import ReactMarkdown from "react-markdown";
  import remarkGfm from "remark-gfm";

  export function Markdown({ children }: { children: string }) {
    return (
      <div className="markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {children}
        </ReactMarkdown>
      </div>
    );
  }
  ```

  ```vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  import { computed, useSlots } from "vue";
  import { marked } from "marked";
  import DOMPurify from "dompurify";

  marked.setOptions({ gfm: true, breaks: true });

  const slots = useSlots();

  const html = computed(() => {
    const slot = slots.default?.();
    const text = slot
      ?.map((vnode) =>
        typeof vnode.children === "string" ? vnode.children : ""
      )
      .join("") ?? "";
    if (!text) return "";
    return DOMPurify.sanitize(marked.parse(text) as string);
  });
  </script>

  <template>
    <div class="markdown-content" v-html="html" />
  </template>
  ```

  ```svelte Svelte theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script lang="ts">
    import { marked } from "marked";
    import DOMPurify from "dompurify";

    let { content }: { content: string } = $props();

    marked.setOptions({ gfm: true, breaks: true });

    let html = $derived.by(() => {
      if (!content) return "";
      return DOMPurify.sanitize(marked.parse(content) as string);
    });
  </script>

  <div class="markdown-content">
    {@html html}
  </div>
  ```

  ```ts Angular theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Component, Input, computed, signal } from "@angular/core";
  import { marked } from "marked";
  import DOMPurify from "dompurify";

  marked.setOptions({ gfm: true, breaks: true });

  @Component({
    selector: "app-markdown",
    template: `<div class="markdown-content" [innerHTML]="html()"></div>`,
  })
  export class MarkdownComponent {
    @Input() set content(value: string) {
      this._content.set(value);
    }

    private _content = signal("");

    html = computed(() => {
      const text = this._content();
      if (!text) return "";
      return DOMPurify.sanitize(marked.parse(text) as string);
    });
  }
  ```
</CodeGroup>

## 清理 HTML 输出将解析后的 Markdown 渲染为原始 HTML 时（`v-html`、`{@html}`、`[innerHTML]`），
您必须清理输出以防止跨站点脚本攻击 (XSS)。法学硕士
响应可能包含任意文本，包括 Markdown 解析器的标记
可以变成可执行的 HTML。

使用`dompurify`去除危险元素：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import DOMPurify from "dompurify";

const safeHtml = DOMPurify.sanitize(rawHtml);
```

DOMPurify 删除 `<script>` 标签、`onclick` 属性、`javascript:` URL、
和其他 XSS 向量，同时保留安全的降价输出，如标题，
列表、代码块、表格和链接。

<Note>
  React 的 `react-markdown` 不需要 `dompurify`，因为它产生 React
  直接元素，不涉及原始 HTML 注入。
</Note>

## 流媒体注意事项

当每个令牌到达时，`useStream` 会反应性地更新 `msg.text`。降价
组件在每次更新时都会重新解析。对于典型的聊天消息，这是
表演者：

* `marked` 解析速度为 \~1 MB/s。 5 KB 消息需要 \< 5ms
* ⟦T43⟧ + remark pipeline is similarly fast for chat-length content
* The browser's layout engine handles the DOM update efficiently

For very long responses (> 50 KB），请考虑以下优化：

* **节流渲染：** 使用 `requestAnimationFrame` 以 60fps 批量更新
  而不是在每个令牌上重新渲染
* **增量解析：**仅解析新内容并附加到渲染的内容
  缓冲区（高级，聊天 UI 通常不需要）<Info>
  对于大多数聊天应用程序，重新解析完整消息的简单方法
  每个令牌就足够了。仅当您观察到卡顿滚动或
  消息很长时丢帧。
</Info>

## 最佳实践

* **始终消毒：** 使用 `v-html`、`{@html}` 或 `[innerHTML]` 时，
  始终通过 `dompurify` 运行解析的输出。永远不要相信来自
  Markdown 解析器提供 LLM 输出。
* **启用 GFM：** GitHub Flavored Markdown 添加表格、删除线、任务
  列表和自动链接。这些功能是法学硕士常用的。
* **处理空内容：**在解析之前检查空字符串以避免
  渲染空容器。
* **使用 `breaks: true`:** 启用换行符转换，以便在
  LLM 输出渲染为 `<br>` 而不是被忽略。 LLM 经常使用单一
  视觉分离的换行符。
* **聊天上下文的样式：** 使用适合的紧凑边距和尺寸
  聊天气泡，而不是全角文章布局。
* **使用丰富的内容进行测试：** 使用标题、嵌套列表验证渲染，
  具有长行、宽表和块引用的代码块以捕获溢出
  或布局问题。

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/markdown-messages.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>