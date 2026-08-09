<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: CopilotKit | https://docs.langchain.com/oss/javascript/langchain/frontend/integrations/copilotkit -->

# 副驾驶套件

将 CopilotKit 与 LangGraph、Deep Agents 以及 React 与自定义端点、Python AG-UI 桥和结构化生成 UI 结合使用

[CopilotKit](https://www.copilotkit.ai/) 提供了完整的 React 聊天运行时，并且当您希望代理返回**结构化 UI 有效负载**而不仅仅是纯文本时，它与 LangGraph 配合得特别好。在此模式中，您的 LangGraph 部署同时服务于图形 API 和自定义 CopilotKit 端点，而前端将辅助消息解析为动态 React 组件。

在服务器上，[copilotkit](https://pypi.org/project/copilotkit/) 包提供 [⟦T10⟧](https://docs.copilotkit.ai)，因此 LangGraph 图形、LangChain 代理或 [Deep Agent](/oss/javascript/deepagents/overview) 可以使用 [Agent UI (AG-UI)](https://docs.ag-ui.com/) 有线协议，将工具和消息事件流式传输到聊天 UI，并读取或写入共享的 **CopilotKit** 状态切片，并使用帮助程序在图形前面安装与 CopilotKit 兼容的 HTTP 端点。

当您需要以下情况时，此方法很有用：

* 一个现成的聊天运行时，而不是自己连接`stream.messages`
* 一个自定义服务器端点，可以在部署的图表旁边添加特定于提供者的行为
* 从受限组件注册表呈现的结构化生成 UI

[CopilotKit for LangGraph](https://docs.copilotkit.ai/langgraph) 还在相同的中间件和客户端之上记录了 [generative UI](https://docs.copilotkit.ai/langgraph/generative-ui)、[human in the loop](https://docs.copilotkit.ai/langgraph/human-in-the-loop) (HITL) 和 [shared state](https://docs.copilotkit.ai/langgraph/shared-state)。<Info>
  有关 CopilotKit 特定的 API、UI 模式和运行时配置，请参阅
  [CopilotKit docs](https://docs.copilotkit.ai/langgraph)。有关 Deep Agent 演练，请参阅
  CopilotKit 文档中的 [Deep Agents and CopilotKit](https://docs.copilotkit.ai/langgraph/deep-agents)。
</Info>

<ExampleEmbed />

## 它是如何工作的

从较高的层面来看，CopilotKit 位于 React 应用程序和 LangGraph 部署之间。前端将对话状态发送到与图形 API 一起安装的自定义 `/api/copilotkit` 路由，该路由将请求转发到 LangGraph，响应会返回辅助消息和组件注册表可以呈现的任何结构化 UI 负载。

1. **像平常一样部署图**使用 LangSmith 或使用 LangGraph 开发服务器。
2. **使用 HTTP 应用程序扩展部署**，该应用程序在图形 API 旁边安装 CopilotKit 路由。
3. **将前端包装在 `CopilotKit`** 中并将其指向该自定义运行时 URL。
4. **注册动态 UI 组件**并在渲染时将助手响应解析到这些组件中。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{
  init: {
    "fontFamily": "monospace",
    "flowchart": {
      "curve": "curve"
    }
  }
}%%
graph LR
  USER["User input"]
  UI["CopilotKit React app"]
  ENDPOINT["/api/copilotkit"]
  GRAPH["LangGraph deployment"]
  RENDER["Hashbrown UI kit"]

  USER --> UI
  UI --> ENDPOINT
  ENDPOINT --> GRAPH
  GRAPH --> ENDPOINT
  ENDPOINT --> UI
  UI --> RENDER
```

## 安装

对于后端端点：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bun add @copilotkit/runtime hono
```

对于前端应用程序：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bun add @copilotkit/react-core @copilotkit/react-ui @hashbrownai/core @hashbrownai/react
```

## 使用自定义端点扩展 LangGraph 部署关键思想是 LangGraph 部署不仅仅服务于图。它还可以加载 HTTP 应用程序，让您可以在部署本身旁边安装额外的路由。

在 `langgraph.json` 中，将 `http.app` 指向您的自定义应用程序入口点：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "graphs": {
    "copilotkit_shadify": "./src/agents/copilotkit-shadify.ts:agent"
  },
  "http": {
    "app": "./src/api/app.ts:app"
  }
}
```

然后创建Hono应用程序并注册CopilotKit路线：

```ts app.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Hono } from "hono";
import { registerCopilotKit } from "./copilotkit.js";

export const app = new Hono();

registerCopilotKit(app);
```

这个自定义应用程序是重要的扩展点：它安装了 CopilotKit 感知的运行时，而无需替换底层的 LangGraph 部署。

在该路线内，创建一个 `CopilotRuntime` 并使用 `LangGraphAgent` 将其指向已部署的图表：

```ts expandable copilotkit.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { type Hono } from "hono";

import { createCopilotEndpointSingleRoute, CopilotRuntime } from "@copilotkit/runtime/v2";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

const defaultAgentHost = process.env.LANGGRAPH_DEPLOYMENT_URL || "http://127.0.0.1:2024";
const agentUrl = defaultAgentHost.startsWith("http")
  ? defaultAgentHost
  : `http://${defaultAgentHost}`;

class BridgedLangGraphAgent extends LangGraphAgent {
  override prepareRunAgentInput(
    input: Parameters<LangGraphAgent["prepareRunAgentInput"]>[0],
  ): ReturnType<LangGraphAgent["prepareRunAgentInput"]> {
    const prepared = super.prepareRunAgentInput(input);

    return {
      ...prepared,
      context: normalizeCopilotContext(prepared.context) as ReturnType<
        LangGraphAgent["prepareRunAgentInput"]
      >["context"],
    };
  }

  override async getAssistant(): Promise<Awaited<ReturnType<LangGraphAgent["getAssistant"]>>> {
    const assistants = await this.client.assistants.search({
      graphId: this.graphId,
      limit: 100,
    });

    const assistant = assistants.find((candidate) => candidate.graph_id === this.graphId);
    if (assistant) {
      return assistant;
    }

    return super.getAssistant();
  }
}

export function registerCopilotKit(app: Hono) {
  const runtime = new CopilotRuntime({
    agents: {
      default: new BridgedLangGraphAgent({
        deploymentUrl: agentUrl,
        graphId: "copilotkit_shadify",
      }),
    },
  });

  const copilotApp = createCopilotEndpointSingleRoute({
    runtime,
    basePath: "/api/copilotkit",
  });

  app.route("/", copilotApp);
}

function normalizeCopilotContext(context: unknown): unknown {
  if (!Array.isArray(context)) {
    return context;
  }

  const normalizedEntries = context.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const entry = item as { description?: unknown; value?: unknown };
    return typeof entry.description === "string" ? [[entry.description, entry.value] as const] : [];
  });

  return Object.fromEntries(normalizedEntries);
}
```

路由适配器只是 TypeScript 设置的一半。你的LangChain代理还需要中间件来读取转发的`output_schema`并将其转换为模型的结构化`responseFormat`：

```ts expandable agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, createMiddleware, toolStrategy } from "langchain";
import { z } from "zod";

import { deepSearchTool, searchWebTool } from "../tools/index.js";

const contextSchema = z.object({
  output_schema: z.unknown().optional(),
});

const structuredOutputMiddleware = createMiddleware({
  name: "CopilotKitStructuredOutput",
  contextSchema,
  wrapModelCall: async (request, handler) => {
    const rawOutputSchema = getRuntimeOutputSchema(request.runtime);
    const schema = normalizeOutputSchema(rawOutputSchema);
    if (!schema) {
      return handler(request);
    }

    const responseFormat = toolStrategy(
      schema as unknown as Parameters<typeof toolStrategy>[0],
      {
        toolMessageContent: "Structured UI response generated.",
      },
    );

    return handler({
      ...request,
      responseFormat,
    });
  },
});

export const agent = createAgent({
  model: process.env.COPILOTKIT_MODEL ?? "google_genai:gemini-3.6-flash",
  contextSchema,
  middleware: [structuredOutputMiddleware],
  tools: [searchWebTool, deepSearchTool],
  systemPrompt: `You are a helpful UI assistant inspired by the CopilotKit Shadify example.

Build rich visual responses with the available UI components when they add value.
Only wrap actual UI layouts inside cards. Plain Markdown answers should stay as Markdown.
Use rows for side-by-side layouts with at most two columns.
Prefer simple, polished outputs over dense dashboards.
When using charts, make labels and values concise and easy to read.
When showing code, prefer the code_block component.
When researching topics, use the available search tools first and then present the result cleanly.`,
});

function normalizeOutputSchema(value: unknown): Record<string, unknown> | null {
  let schema = value;

  if (typeof schema === "string") {
    try {
      schema = JSON.parse(schema);
    } catch {
      return null;
    }
  }

  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return null;
  }

  const normalized = { ...(schema as Record<string, unknown>) };

  if (!normalized.title) {
    normalized.title = "CopilotKitStructuredOutput";
  }

  if (!normalized.description) {
    normalized.description = "Structured response schema for the CopilotKit preview.";
  }

  return normalized;
}

function getRuntimeOutputSchema(runtime: {
  context?: { output_schema?: unknown };
  configurable?: Record<string, unknown>;
}): unknown {
  if (runtime.context?.output_schema !== undefined) {
    return runtime.context.output_schema;
  }

  const configurable = runtime.configurable;
  if (!configurable || typeof configurable !== "object" || Array.isArray(configurable)) {
    return undefined;
  }

  return configurable.output_schema;
}
```

这个中间件使得 `useAgentContext({ description: "output_schema", ... })` 在前端变得有用。 CopilotKit 运行时转发架构，代理将其转换为模型必须遵循的结构化输出契约。

结果是完全分离关注点：

* LangGraph仍然拥有图执行和持久化
* CopilotKit 拥有面向聊天的运行时合约
* 您的自定义端点将它们在一个部署中粘合在一起请遵循节点 **CopilotRuntime** 中的 [LangGraphHttpAgent](https://docs.copilotkit.ai/langgraph) 或 `LangGraphAgent` 的 CopilotKit 文档； **Python** 图形和中间件仍然定义工具行为和代理逻辑。
:::

## 构建前端应用程序

在前端，将您的应用程序包装在 `CopilotKit` 中并将其指向自定义运行时 URL：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat, useAgentContext } from "@copilotkit/react-core/v2";
import { s } from "@hashbrownai/core";

import { useChatKit } from "@/components/chat/chat-kit";
import { chatTheme } from "@/lib/chat-theme";

export function App() {
  return (
    <CopilotKit runtimeUrl={import.meta.env.VITE_RUNTIME_URL ?? "/api/copilotkit"}>
      <Page />
    </CopilotKit>
  );
}

function Page() {
  const chatKit = useChatKit();

  useAgentContext({
    description: "output_schema",
    value: s.toJsonSchema(chatKit.schema),
  });

  return <CopilotChat {...chatTheme} />;
}
```

这里有两个重要的部分：

* `runtimeUrl="/api/copilotkit"` 将聊天发送到您的自定义后端路由，而不是直接发送到原始 LangGraph API
* `useAgentContext(...)` 将 UI 模式发送给代理，以便模型知道它应该生成什么结构化输出格式

## 注册动态组件

组件注册表位于`useChatKit()`。您可以在此处定义允许代理发出的组件集，例如卡片、行、列、图表、代码块和按钮。

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { s } from "@hashbrownai/core";
import { exposeComponent, exposeMarkdown, useUiKit } from "@hashbrownai/react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { Row, Column } from "@/components/ui/layout";
import { SimpleChart } from "@/components/ui/simple-chart";

export function useChatKit() {
  return useUiKit({
    components: [
      exposeMarkdown(),
      exposeComponent(Card, {
        name: "card",
        description: "Card to wrap generative UI content.",
        children: "any",
      }),
      exposeComponent(Row, {
        name: "row",
        props: {
          gap: s.string("Tailwind gap size") as never,
        },
        children: "any",
      }),
      exposeComponent(Column, {
        name: "column",
        children: "any",
      }),
      exposeComponent(SimpleChart, {
        name: "chart",
        props: {
          labels: s.array("Category labels", s.string("A label")),
          values: s.array("Numeric values", s.number("A value")),
        },
        children: false,
      }),
      exposeComponent(CodeBlock, {
        name: "code_block",
        props: {
          code: s.streaming.string("The code to display"),
          language: s.string("Programming language") as never,
        },
        children: false,
      }),
      exposeComponent(Button, {
        name: "button",
        children: "text",
      }),
    ],
  });
}
```

该注册表成为代理和 UI 之间的合同。该模型不会生成任意 JSX。它正在生成必须针对您公开的组件和道具进行验证的结构化数据。

## 将助手消息渲染为动态 UI

一旦助理响应到达，自定义消息渲染器就会决定如何显示它。在这个例子中：* 助理消息根据 UI 套件架构解析为结构化 JSON
* 有效的结构化输出被渲染为真实的 React 组件
* 用户消息呈现为普通聊天气泡

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import type { AssistantMessage } from "@ag-ui/core";
import type { RenderMessageProps } from "@copilotkit/react-ui";
import { useJsonParser } from "@hashbrownai/react";
import { memo } from "react";

import { useChatKit } from "@/components/chat/chat-kit";
import { Squircle } from "@/components/squircle";

const AssistantMessageRenderer = memo(function AssistantMessageRenderer({
  message,
}: {
  message: AssistantMessage;
}) {
  const kit = useChatKit();
  const { value } = useJsonParser(message.content ?? "", kit.schema);

  if (!value) return null;

  return (
    <div className="group/msg mt-2 flex w-full justify-start">
      <div className="magic-text-output w-full px-1 py-1">{kit.render(value)}</div>
    </div>
  );
});

export function CustomMessageRenderer({ message }: RenderMessageProps) {
  if (message.role === "assistant") {
    return <AssistantMessageRenderer message={message} />;
  }

  return (
    <div className="flex w-full justify-end">
      <Squircle className="w-full max-w-[64ch] px-4 py-3">
        <pre>{typeof message.content === "string" ? message.content : JSON.stringify(message.content, null, 2)}</pre>
      </Squircle>
    </div>
  );
}
```

这种渲染器模式使集成感觉很原生：

* CopilotKit 处理聊天状态和传输
* 自定义渲染器决定助手负载如何变成 UI
* [Hashbrown](https://hashbrown.dev/) 将经过验证的结构化数据转化为具体的 React 元素

## 资源

* CopilotKit 文档中的 [Deep Agents and CopilotKit](https://docs.copilotkit.ai/langgraph/deep-agents) — 端到端 Next.js、开发服务器和 **Deep Agent** 路径
* [CopilotKit: LangGraph features](https://docs.copilotkit.ai/langgraph) — 生成式 UI、HITL、共享状态
* [LangGraph deployment](/oss/javascript/langgraph/deploy) — 生产和开发服务器

## 最佳实践* **保持自定义端点的精简：** 使用它来使 CopilotKit 适应您的图形部署，而不是重复图形内已有的业务逻辑
* **显式发送模式：** `useAgentContext` 应在每次页面安装时描述 UI 契约
* **注册受约束的组件集：**仅公开您实际希望模型使用的组件和道具
* **将渲染视为解析步骤：** 在渲染之前根据您的模式解析助手内容
* **保持用户消息简单：** 只有辅助消息需要结构化渲染器；用户消息可以保持正常的聊天气泡

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/integrations/copilotkit.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>