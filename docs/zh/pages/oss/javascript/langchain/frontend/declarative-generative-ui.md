<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Declarative generative UI | https://docs.langchain.com/oss/javascript/langchain/frontend/declarative-generative-ui -->

# 声明式生成 UI

使用 json-render 和 A2UI 从已注册的组件目录编写代理生成的接口

## 概述

声明式生成 UI 位于中间
[generative UI spectrum](/oss/javascript/langchain/frontend/generative-ui-overview)。代理发出一个
结构化规范，前端根据以下目录组成界面
您提前注册的组件。而不是在聊天中呈现文本响应
气泡中，代理输出**是** UI：表单、卡片、仪表板等。你
定义哪些组件可用（“目录”），然后代理将它们组合起来
进入有效的 UI 树。目录是使这种方法安全的护栏：代理商可以安排
并自由组合您的组件，但不能超出您批准的集合。
这平衡了创造力和可预测性。这是长尾巴居住的地方，
用像素完美换取广度，这适合二次交互、内部交互
工具和仪表板，其中显示有用的内容比精确更重要
控制。本页涵盖了声明式生成 UI
[json-render](https://json-render.dev)，生成式 UI 框架
定义组件目录、使用 AI 生成规格并安全地渲染它们
跨越 React、Vue、Svelte 和 Angular。对于 Google 的 A2UI 规范（集成
通过 CopilotKit），请参阅下面的[A2UI](#a2ui-an-alternative-declarative-spec)。

<PatternEmbed />

## 何时使用此方法

对产品的长尾使用声明式生成 UI，其中
代理可以在待在集合中时编写您未完全预料到的布局
您批准的组件：辅助交互、内部工具和仪表板。
当某个表面人流量大或对品牌至关重要并且必须准确时，请转向
[controlled generative UI](/oss/javascript/langchain/frontend/controlled-generative-ui)。当
如果您希望在应用程序外部创建接口，请转向
[open-ended generative UI](/oss/javascript/langchain/frontend/open-ended-generative-ui)。

## 它是如何工作的1. **定义目录**：通过类型化的 props 声明 AI 可以使用哪些组件
2. **提示AI**：用自然语言描述你想要的UI
3. **AI生成规范**：描述组件树的JSON文档
4. **安全渲染**：json-render 的 `Renderer` 使用您的组件渲染规范

目录充当护栏：AI只能使用您定义的组件，
使用与您的模式匹配的道具。输出始终是可预测且安全的。

## 定义组件目录

该目录描述了人工智能可以使用的每个组件。每个组件都有一个
其道具的 Zod 模式以及 AI 读取以了解何时进行的描述
使用它：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

const catalog = defineCatalog(schema, {
  components: {
    Card: {
      description: "A card container with optional title and padding",
      props: z.object({
        title: z.string().optional(),
        padding: z.enum(["sm", "md", "lg"]).optional(),
      }),
    },
    Stack: {
      description: "Layout children vertically or horizontally with consistent spacing",
      props: z.object({
        direction: z.enum(["vertical", "horizontal"]).optional(),
        gap: z.enum(["sm", "md", "lg"]).optional(),
      }),
    },
    TextInput: {
      description: "A text input field with optional label and placeholder",
      props: z.object({
        label: z.string().optional(),
        placeholder: z.string().optional(),
        type: z.enum(["text", "email", "password", "number", "textarea"]).optional(),
      }),
    },
    Button: {
      description: "A clickable button with label and style variants",
      props: z.object({
        label: z.string(),
        variant: z.enum(["primary", "secondary", "ghost", "link"]).optional(),
        fullWidth: z.boolean().optional(),
      }),
    },
  },
  actions: {},
});
```

<Tip>
  保持目录的重点。仅包含 AI 用例所需的组件。
  较小的目录比厨房水槽方法产生更好的结果。
</Tip>

## 构建组件注册表

注册表将每个目录组件映射到其实际的呈现实现。
使用 `defineRegistry` 获取目录 props 和
你的组件功能：

<CodeGroup>
  ```tsx React theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { defineRegistry, Renderer, JSONUIProvider } from "@json-render/react";

  const { registry } = defineRegistry(catalog, {
    components: {
      Card: ({ props, children }) => (
        <div className="card">
          {props.title && <h2>{props.title}</h2>}
          {children}
        </div>
      ),
      Stack: ({ props, children }) => (
        <div className={`stack stack-${props.direction ?? "vertical"} gap-${props.gap ?? "md"}`}>
          {children}
        </div>
      ),
      TextInput: ({ props }) => (
        <div>
          {props.label && <label>{props.label}</label>}
          <input type={props.type ?? "text"} placeholder={props.placeholder} />
        </div>
      ),
      Button: ({ props }) => (
        <button className={props.variant ?? "primary"}>
          {props.label}
        </button>
      ),
    },
  });
  ```

  ```vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  import { h } from "vue";
  import { defineRegistry, Renderer, JSONUIProvider } from "@json-render/vue";

  const { registry } = defineRegistry(catalog, {
    components: {
      Card: ({ props, children }) =>
        h("div", { class: "card" }, [
          props.title ? h("h2", null, props.title) : null,
          children,
        ]),
      Stack: ({ props, children }) =>
        h("div", { class: `stack stack-${props.direction ?? "vertical"} gap-${props.gap ?? "md"}` }, children),
      TextInput: ({ props }) =>
        h("div", null, [
          props.label ? h("label", null, props.label) : null,
          h("input", { type: props.type ?? "text", placeholder: props.placeholder }),
        ]),
      Button: ({ props }) =>
        h("button", { class: props.variant ?? "primary" }, props.label),
    },
  });
  </script>
  ```
</CodeGroup>

## 连接到代理该代理使用结构化输出返回 json-render 规范。设置`useStream`
与您的代理的助理 ID，然后从 AI 消息中提取规范
`tool_calls`：

<CodeGroup>
  ```tsx React theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { useStream } from "@langchain/react";
  import { AIMessage } from "langchain";

  function GenerativeUI() {
    const stream = useStream<typeof myAgent>({
      apiUrl: "http://localhost:2024",
      assistantId: "generative_ui",
    });

    const aiMessage = stream.messages.find(AIMessage.isInstance);
    const rawSpec = aiMessage?.tool_calls?.[0]?.args;

    // ... filter and render (see streaming section below)
  }
  ```

  ```vue Vue theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script setup lang="ts">
  import { useStream } from "@langchain/vue";
  import { AIMessage } from "langchain";
  import { computed } from "vue";

  const stream = useStream<typeof myAgent>({
    apiUrl: "http://localhost:2024",
    assistantId: "generative_ui",
  });

  const aiMessage = computed(() => stream.messages.value.find(AIMessage.isInstance));
  const rawSpec = computed(() => aiMessage.value?.tool_calls?.[0]?.args);
  </script>
  ```

  ```svelte Svelte theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  <script lang="ts">
    import { useStream } from "@langchain/svelte";
    import { AIMessage } from "langchain";

    const stream = useStream<typeof myAgent>({
      apiUrl: "http://localhost:2024",
      assistantId: "generative_ui",
    });

    const aiMessage = $derived(stream.messages.find((m) => AIMessage.isInstance(m)));
    const rawSpec = $derived(aiMessage?.tool_calls?.[0]?.args);
  </script>
  ```

  ```ts Angular theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Component } from "@angular/core";
  import { injectStream } from "@langchain/angular";
  import { AIMessage } from "langchain";

  @Component({
    selector: "app-generative-ui",
    template: `...`,
  })
  export class GenerativeUIComponent {
    stream = injectStream<typeof myAgent>({
      apiUrl: "http://localhost:2024",
      assistantId: "generative_ui",
    });

    get rawSpec() {
      const ai = this.stream.messages().find(AIMessage.isInstance);
      return ai?.tool_calls?.[0]?.args;
    }
  }
  ```
</CodeGroup>

## 渐进式流式传输和渲染

在流式传输期间，规范会逐步建立。元素到达一个
时间，并且最初可能缺少 `type` 或 `props`。过滤为仅完整元素
并将 `loading={true}` 传递给 `Renderer`，让它默默地跳过
还没有到的孩子们。 UI 按组件构建：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
/*
 * Filter the streamed spec to only include elements with valid type/props,
 * enabling progressive rendering as the AI response builds up. Passing
 * loading={true} to the Renderer tells it to skip missing children silently.
 */
const spec = (() => {
  if (!rawSpec?.root || !rawSpec?.elements) return null;
  const rootEl = rawSpec.elements[rawSpec.root];
  if (!rootEl?.type || rootEl?.props == null) return null;

  const safeElements = {};
  for (const [key, el] of Object.entries(rawSpec.elements)) {
    if (el?.type && el?.props != null) {
      safeElements[key] = el;
    }
  }
  return { root: rawSpec.root, elements: safeElements };
})();

return (
  <>
    {spec && (
      <JSONUIProvider registry={registry}>
        <Renderer spec={spec} registry={registry} loading={stream.isLoading} />
      </JSONUIProvider>
    )}
  </>
);
```

<Note>
  设置 json-render 的内部上下文需要 `JSONUIProvider`
  提供者（状态、可见性、验证、操作）。 `Renderer` 组件
  必须在其中渲染。
</Note>

## 规范格式

AI 代理生成一个平面 JSON 规范，其中 `root` 键指向
根元素和包含所有组件的 `elements` 映射：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "root": "login-card",
  "elements": {
    "login-card": {
      "type": "Card",
      "props": { "title": "Login" },
      "children": ["login-stack"]
    },
    "login-stack": {
      "type": "Stack",
      "props": { "direction": "vertical", "gap": "md" },
      "children": ["email-input", "password-input", "submit-btn"]
    },
    "email-input": {
      "type": "TextInput",
      "props": { "label": "Email", "placeholder": "Enter your email", "type": "email" },
      "children": []
    },
    "password-input": {
      "type": "TextInput",
      "props": { "label": "Password", "placeholder": "Enter your password", "type": "password" },
      "children": []
    },
    "submit-btn": {
      "type": "Button",
      "props": { "label": "Sign In", "variant": "primary", "fullWidth": true },
      "children": []
    }
  }
}
```

每个元素通过 ID 引用其子元素，而叶元素如 `TextInput`
和 `Button` 有空的 `children` 数组。

## A2UI：另一种声明性规范以声明方式描述接口的一种方法是 json-render。 A2UI 是另一个：
Google 的声明式流优先生成 UI 规范，通过集成
副驾驶套件。与 json-render 一样，它由您的组件组成接口
注册，以便代理留在您定义的护栏内。 A2UI 有两种
变种：

* **动态模式**：辅助模型生成完整的界面，包括
  来自对话的架构、数据和布局，以实现最大的灵活性。
* **固定架构**：组件树在前端和代理上定义
  仅将数据传输到其中，以实现最快且最可预测的渲染。

有关详细信息，请参阅 CopilotKit 的 [A2UI](https://docs.copilotkit.ai/generative-ui/a2ui) 文档，
[dynamic schema](https://docs.copilotkit.ai/generative-ui/a2ui/dynamic-schema)，以及
[fixed schema](https://docs.copilotkit.ai/generative-ui/a2ui/fixed-schema)。至
将 CopilotKit 连接到 LangGraph 部署，请参阅 [CopilotKit](/oss/javascript/langchain/frontend/integrations/copilotkit)。

## 最佳实践* **使用描述性组件描述**：人工智能使用这些来理解何时
  使用每个组件。清晰的描述可以生成更好的 UI。
* **渲染前验证**：始终检查元素是否具有有效的 `type` 和
  在传递给渲染器之前非空`props`，因为流传输会传递部分数据。
* **流式传输设计**：在流式传输期间传递`loading={true}`，以便渲染器
  优雅地接待尚未到来的孩子。用户看到 UI 构建
  实时而不是等待完整响应。
* **具有设计标记的样式**：使用 CSS 自定义属性来渲染组件
  自动适应浅色和深色主题。
* **用 JSONUIProvider 包装**：`Renderer` 必须位于 `JSONUIProvider` 内
  访问 json-render 的内部上下文以获取状态、可见性和操作。

## 另请参阅

* [Generative UI overview](/oss/javascript/langchain/frontend/generative-ui-overview)
* [Controlled generative UI](/oss/javascript/langchain/frontend/controlled-generative-ui)
* [Open-ended generative UI](/oss/javascript/langchain/frontend/open-ended-generative-ui)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/declarative-generative-ui.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>