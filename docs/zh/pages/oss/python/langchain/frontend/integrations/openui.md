<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: OpenUI | https://docs.langchain.com/oss/python/langchain/frontend/integrations/openui -->

# 打开用户界面

使用 OpenUI 组件库和 openui-lang 生成完整的交互式仪表板和报告

[OpenUI](https://github.com/thesysdev/openui) 是一个生成式 UI 库，它允许语言模型以称为 **openui-lang** 的声明性格式生成完整的交互式 UI。代理不返回聊天消息，而是返回一个包含卡片、图表、表格、选项卡和表单的组件树，`Renderer` 将其转变为真正的 React UI。

这种集成非常适合数据丰富的输出，例如报告、仪表板和数据浏览器，其中模型既是数据分析师又是 UI 设计师。

<ExampleEmbed />

## 它是如何工作的

1. **生成系统提示：**启动时调用一次`openuiLibrary.prompt()`；它生成一个完整的 openui-lang 参考，模型用它来编写有效的组件树
2. **在第一条消息上注入：** 在新对话开始时发送系统提示作为打开系统消息
3. **模型编写 openui-lang:** 模型用类似 `root = Stack([header, kpis, chart])` 的程序而不是散文进行响应
4. **使用`Renderer`渲染：**将文本传递给OpenUI的`Renderer`和组件库；它解析并渲染树

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
  PROMPT["openuiLibrary.prompt()"]
  AGENT["createAgent()"]
  STREAM["useStream()"]
  RENDERER["Renderer"]

  PROMPT --"system message"--> AGENT
  AGENT --"openui-lang text"--> STREAM
  STREAM --"ai message content"--> RENDERER
```

## 安装

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/react @openuidev/react-ui @openuidev/react-headless @openuidev/react-lang
```<Tip>
  OpenUI 需要 React 19+ 和 [⟦T21⟧](https://www.npmjs.com/package/zustand)。前端代码仅限 React； LangGraph 代理后端可以用 TypeScript 或 Python 编写。
</Tip>

## 导入组件样式

在 CSS 入口点或直接在根组件中导入 OpenUI 的捆绑样式：

```css theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
@import "@openuidev/react-ui/components.css";
@import "@openuidev/react-ui/styles/index.css";
```

## 生成系统提示符

OpenUI 提供了一个 `openuiLibrary.prompt()` 函数，可以生成完整的 openui-lang 参考，其中包含所有组件签名、语法规则、流提示和示例。在模块加载时调用一次：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { openuiLibrary, openuiPromptOptions } from "@openuidev/react-ui/genui-lib";

// Generate the full openui-lang system prompt. Call this once at startup,
// not inside a component, to avoid recomputing it on every render.
const SYSTEM_PROMPT = openuiLibrary.prompt({
  ...openuiPromptOptions,
  preamble:
    "You are a report generator. When asked for a report, produce a detailed, " +
    "data-rich report using openui-lang: executive summary, KPI cards, charts, " +
    "tables, and multiple sections. Your ENTIRE response must be raw openui-lang " +
    "— no code fences, no markdown, no prose.",
});
```

`preamble` 会覆盖默认角色。添加 `additionalRules` 以注入特定于任务的约束：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const SYSTEM_PROMPT = openuiLibrary.prompt({
  ...openuiPromptOptions,
  preamble: "You are a report generator...",
  additionalRules: [
    ...(openuiPromptOptions.additionalRules ?? []),
    "Always end the report with 3–4 follow-up query buttons using " +
    "Button({ type: 'continue_conversation' }, 'secondary') inside a " +
    "Card([CardHeader('Explore Further'), Buttons([...])], 'sunk').",
  ],
});
```

## 通过useStream注入系统提示符

将系统提示作为每个新线程的第一条消息发送。检查 `stream.messages.length === 0` 来检测新线程并在前面添加 `system` 消息：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { useCallback } from "react";
import { useStream } from "@langchain/react";

const SYSTEM_PROMPT = openuiLibrary.prompt({ ... });

export function App() {
  const stream = useStream({
    apiUrl: import.meta.env.VITE_LANGGRAPH_API_URL ?? "http://localhost:2024",
    assistantId: "openui",
  });

  const handleSubmit = useCallback(
    (text: string) => {
      // Inject the system prompt only on the first message of a new thread.
      // Subsequent messages already have it in their persisted history.
      const isNewThread = stream.messages.length === 0;
      stream.submit({
        messages: [
          ...(isNewThread
            ? [{ type: "system", content: SYSTEM_PROMPT }]
            : []),
          { type: "human", content: text },
        ],
      });
    },
    [stream],
  );

  // ...
}
```

## 使用渲染器进行渲染

将AI消息的文本内容与`openuiLibrary`一起直接传递给`Renderer`：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Renderer } from "@openuidev/react-lang";
import { openuiLibrary } from "@openuidev/react-ui/genui-lib";
import { AIMessage } from "langchain";

function MessageList({ messages, isLoading }) {
  const lastAiIdx = messages.reduce(
    (acc, msg, i) => (AIMessage.isInstance(msg) ? i : acc),
    -1,
  );

  return messages.map((msg, i) => {
    if (AIMessage.isInstance(msg)) {
      const text = msg.text;
      return (
        <Renderer
          key={msg.id ?? i}
          response={text}
          library={openuiLibrary}
          isStreaming={isLoading && i === lastAiIdx}
        />
      );
    }
    // ... human message bubble
  });
}
```

在活动流期间传递`isStreaming={true}`，以便渲染器在定义到达时优雅地处理未解析的引用。

## openui-lang 格式该模型编写的是程序而不是 JSON 规范。每个语句都是一个赋值； `root`是入口点。官方提示教模型这种格式，包括提升 - 首先写入 `root`，以便 UI shell 立即出现：

```
root = Stack([header, execSummary, kpis, marketSection])

header    = CardHeader("State of AI in 2025", "Comprehensive Analysis")
execSummary = MarkDownRenderer("## Executive Summary\n\nThe AI market reached...")

kpi1 = Card([CardHeader("$826B", "Global Market"), TextContent("42% YoY", "small")], "sunk")
kpi2 = Card([CardHeader("78%",   "Adoption"),       TextContent("Fortune 500",  "small")], "sunk")
kpis = Stack([kpi1, kpi2], "row", "m", "stretch", "start", true)

col1 = Col("Segment", "string")
col2 = Col("Revenue ($B)", "number")
tbl  = Table([col1, col2], [["Generative AI", 286], ["ML Infra", 198]])
s1   = Series("Revenue", [286, 198, 147])
ch1  = BarChart(["Gen AI", "ML Infra", "Vision"], [s1])
marketSection = Card([CardHeader("Market Breakdown"), tbl, ch1])
```

启用提升（推荐）后，首先写入 `root` 行，以便页面结构立即显示，并且每个部分都会按照模型定义进行填充。

## 渐进式渲染实用程序

将 [⟦T33⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 连接到 `Renderer` 直接导致每个流令牌重新渲染，并为每个响应生成数百个无操作重新解析。这会导致图表组件在数据尚未到达时崩溃。以下实用程序可以解决这些问题：|问题 |解决方案 |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **部分字符串文字** | `truncateAtOpenString` / `closeOrTruncateOpenString` — 在解析之前删除或关闭不完整的字符串 |
| **中期代币流失** | `useStableText` — 门渲染器更新完整语句边界 (`name = Expr(…)`)，而不是每个标记 |
| **图表空数据崩溃** | `chartDataRefsResolved` — 在将图表包含在快照中之前验证图表的 `Series` 和标签数组是否已定义 |
| **还没有`root`/后备** | `buildProgressiveRoot` — 当模型尚未编写时，从顶级变量合成一个 `root = Stack([…])` |
| **Snake\_case 标识符** | `sanitizeIdentifiers` — 解析器仅接受驼峰命名法；转换模型发出的任何 `snake_case` 名称 |

将完整块复制到您的项目中并将 `stable` 传递给 `<Renderer>`：

````tsx expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type ActionEvent,
  BuiltinActionType,
  Renderer,
} from "@openuidev/react-lang";
import { openuiLibrary } from "@openuidev/react-ui/genui-lib";

/** Strip any markdown code fence the model may have emitted. */
function stripCodeFence(text: string): string {
  return text
    .replace(/^```[a-z]*\r?\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

/**
 * The openui-lang parser only accepts camelCase identifiers.
 * Convert any snake_case variable names the model emits; string content is untouched.
 */
function sanitizeIdentifiers(text: string): string {
  const toCamel = (s: string) =>
    s.replace(/_([a-zA-Z0-9])/g, (_, c: string) => c.toUpperCase());

  const snakeVars: string[] = [];
  for (const m of text.matchAll(/^([a-zA-Z][a-zA-Z0-9]*(?:_[a-zA-Z0-9]+)+)\s*=/gm)) {
    if (!snakeVars.includes(m[1])) snakeVars.push(m[1]);
  }
  if (snakeVars.length === 0) return text;

  let result = "";
  let inStr = false;
  let i = 0;
  while (i < text.length) {
    if (text[i] === "\\" && inStr) { result += text[i] + (text[i + 1] ?? ""); i += 2; continue; }
    if (text[i] === '"') { inStr = !inStr; result += text[i++]; continue; }
    if (!inStr) {
      let replaced = false;
      for (const v of snakeVars) {
        if (text.startsWith(v, i) && !/[a-zA-Z0-9_]/.test(text[i + v.length] ?? "")) {
          result += toCamel(v); i += v.length; replaced = true; break;
        }
      }
      if (!replaced) result += text[i++];
    } else {
      result += text[i++];
    }
  }
  return result;
}

/**
 * Walk the text tracking open strings. If the text ends mid-string, truncate to
 * the last safe newline — this prevents a partial string literal from consuming
 * any `root = Stack(…)` line we synthesise later.
 */
function truncateAtOpenString(text: string): string {
  let inStr = false;
  let lastSafeNewline = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\\" && inStr) { i++; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (ch === "\n" && !inStr) lastSafeNewline = i;
  }
  return inStr ? text.slice(0, lastSafeNewline) : text;
}

/**
 * Like truncateAtOpenString, but synthesises a closing `")` when the partial
 * line is a TextContent statement. This lets text render token-by-token while
 * all other partial-string lines are still truncated.
 */
function closeOrTruncateOpenString(text: string): string {
  let inStr = false;
  let lastSafeNewline = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\\" && inStr) { i++; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (ch === "\n" && !inStr) lastSafeNewline = i;
  }
  if (!inStr) return text;

  const safeText = lastSafeNewline > 0 ? text.slice(0, lastSafeNewline) : "";
  const partialLine = text.slice(lastSafeNewline > 0 ? lastSafeNewline + 1 : 0);

  if (/^[a-zA-Z][a-zA-Z0-9]*\s*=\s*TextContent\(/.test(partialLine)) {
    return (lastSafeNewline > 0 ? safeText + "\n" : "") + partialLine + '")';
  }
  return safeText;
}

/** Count lines that form a complete assignment ending with `)` or `]`. */
function countCompleteStatements(text: string): number {
  let count = 0;
  for (const line of text.split("\n")) {
    const t = line.trimEnd();
    if ((t.endsWith(")") || t.endsWith("]")) && /^[a-zA-Z]/.test(t)) count++;
  }
  return count;
}

const CHART_TYPES = new Set([
  "BarChart", "LineChart", "AreaChart", "RadarChart",
  "HorizontalBarChart", "PieChart", "RadialChart",
  "SingleStackedBarChart", "ScatterChart",
]);

const OPENUI_KEYWORDS = new Set([
  "true", "false", "null", "grouped", "stacked", "linear", "natural", "step",
  "pie", "donut", "string", "number", "action", "row", "column", "card", "sunk",
  "clear", "info", "warning", "error", "success", "neutral", "danger", "start",
  "end", "center", "between", "around", "evenly", "stretch", "baseline",
  "small", "default", "large", "none", "xs", "s", "m", "l", "xl",
  "horizontal", "vertical",
]);

/**
 * Chart components (recharts) crash with `.map() on null` when their labels or
 * series props are unresolved. Before committing a stable snapshot, verify that
 * every chart in the text has all its data variables already defined.
 */
function chartDataRefsResolved(text: string): boolean {
  const lines = text.split("\n");
  const complete = new Set<string>();
  for (const line of lines) {
    const t = line.trimEnd();
    const m = t.match(/^([a-zA-Z][a-zA-Z0-9]*)\s*=/);
    if (m && (t.endsWith(")") || t.endsWith("]"))) complete.add(m[1]);
  }
  for (const line of lines) {
    const t = line.trimEnd();
    const m = t.match(/^([a-zA-Z][a-zA-Z0-9]*)\s*=\s*([A-Z][a-zA-Z0-9]*)\(/);
    if (!m || !CHART_TYPES.has(m[2]) || !t.endsWith(")")) continue;
    const rhs = t.slice(t.indexOf("=") + 1).replace(/"(?:[^"\\]|\\.)*"/g, '""');
    for (const [, name] of rhs.matchAll(/\b([a-zA-Z][a-zA-Z0-9]*)\b/g)) {
      if (/^[a-z]/.test(name) && !OPENUI_KEYWORDS.has(name) && !complete.has(name))
        return false;
    }
  }
  return true;
}

/**
 * If the model hasn't written a `root = Stack(…)` yet, synthesise one from the
 * top-level variables (those defined but not referenced inside any other expression).
 * This enables progressive rendering even when the model writes root last.
 */
function buildProgressiveRoot(text: string): string {
  if (!text) return text;
  const safe = truncateAtOpenString(text);
  if (/^root\s*=/m.test(safe)) return safe;

  const defs: string[] = [];
  const seen = new Set<string>();
  for (const m of safe.matchAll(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=/gm)) {
    if (!seen.has(m[1])) { defs.push(m[1]); seen.add(m[1]); }
  }
  if (defs.length === 0) return safe;

  const referenced = new Set<string>();
  for (const line of safe.split("\n")) {
    const thisVar = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=/)?.[1];
    const stripped = line.replace(/"(?:[^"\\]|\\.)*"/g, '""');
    for (const v of defs) {
      if (v !== thisVar && new RegExp(`\\b${v}\\b`).test(stripped)) referenced.add(v);
    }
  }

  const topLevel = defs.filter((v) => !referenced.has(v));
  const rootVars = topLevel.length > 0 ? topLevel : defs;
  return `${safe.trimEnd()}\nroot = Stack([${rootVars.join(", ")}], "column", "l")`;
}

/**
 * Gate Renderer updates to moments when at least one new *complete* statement
 * has arrived. This eliminates hundreds of no-op re-parses during streaming.
 *
 * Special case: TextContent lines update token-by-token (via closeOrTruncate)
 * so text renders progressively without waiting for the full line to complete.
 */
function useStableText(raw: string, isStreaming: boolean): string {
  const [stable, setStable] = useState<string>("");
  const lastCount = useRef(0);

  useEffect(() => {
    const safe = truncateAtOpenString(raw);         // strict — for counting only
    const enhanced = closeOrTruncateOpenString(raw); // display — closes partial TextContent

    if (!isStreaming) { setStable(enhanced); return; }

    const count = countCompleteStatements(safe);
    const newComplete = count > lastCount.current && chartDataRefsResolved(safe);
    const partialTextContent = enhanced !== safe;

    if (newComplete || partialTextContent) {
      if (newComplete) lastCount.current = count;
      setStable(enhanced);
    }
  }, [raw, isStreaming]);

  return stable;
}

function AIMessageView({
  raw,
  isStreaming,
  onSubmit,
}: {
  raw: string;
  isStreaming: boolean;
  onSubmit: (text: string) => void;
}) {
  const stable = useStableText(raw, isStreaming);
  const processed = useMemo(() => buildProgressiveRoot(stable), [stable]);

  const handleAction = useCallback(
    (event: ActionEvent) => {
      if (event.type === BuiltinActionType.ContinueConversation) {
        onSubmit(event.humanFriendlyMessage);
      }
    },
    [onSubmit],
  );

  if (!processed) return null;

  return (
    <Renderer
      response={processed}
      library={openuiLibrary}
      isStreaming={isStreaming}
      onAction={handleAction}
    />
  );
}

export function MessageList({ messages, isLoading, onSubmit }) {
  const lastAiIdx = messages.reduce(
    (acc, msg, i) => (msg.getType() === "ai" ? i : acc),
    -1,
  );

  return messages.map((msg, i) => {
    if (msg.getType() === "human") {
      return (
        <div key={msg.id ?? i} className="flex justify-end">
          <div className="user-bubble">
            {msg.text}
          </div>
        </div>
      );
    }

    if (msg.getType() === "ai") {
      const raw = sanitizeIdentifiers(
        stripCodeFence(msg.text),
      );
      if (!raw) return null;
      return (
        <div key={msg.id ?? i}>
          <AIMessageView
            raw={raw}
            isStreaming={isLoading && i === lastAiIdx}
            onSubmit={onSubmit}
          />
        </div>
      );
    }

    return null;
  });
}
````

## 后续查询OpenUI 的 `Button` 组件支持 `continue_conversation` 操作类型。当用户单击后续按钮时，`Renderer` 会触发 `onAction`，上面的 `AIMessageView` 会提交按钮的标签作为下一条用户消息，与在输入中键入的代码路径完全相同。

通过系统提示中的`additionalRules`为每个报告添加“进一步探索”部分：

```
followUp1 = Button("Compare AI leaders 2024 vs 2025", { type: "continue_conversation" }, "secondary")
followUp2 = Button("Global AI investment breakdown",  { type: "continue_conversation" }, "secondary")
followUpBtns = Buttons([followUp1, followUp2], "row")
followUpCard  = Card([CardHeader("Explore Further"), followUpBtns], "sunk")
root = Stack([..., followUpCard])
```

## 使用 Deep Agents 构建并行仪表板

上面的流程将一个 OpenUI 程序渲染到一个表面上。对于更丰富的应用程序，[Deep Agents](/oss/python/deepagents/overview) 协调器可以委托给多个专业代理，每个代理都通过一个 [⟦T54⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 连接同时传输自己的 OpenUI 面板。 [OpenUI parallel dashboard example](https://github.com/langchain-ai/streaming-cookbook/tree/main/typescript/openui) 将一个仪表板简介转变为独立的流式 Stripe、PostHog、GitHub 和日历面板，无需自定义图形或流解复用代码。

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
  BRIEF["User brief"]
  COORD["Deep Agents coordinator"]
  PANELS["Stripe / PostHog / GitHub / Calendar panel agents"]
  SUBAGENTS["stream.subagents"]
  RENDERER["Renderer per panel"]

  BRIEF --> COORD
  COORD --"parallel task() calls"--> PANELS
  PANELS --"namespaced events"--> SUBAGENTS
  SUBAGENTS --"useMessages(stream, snapshot)"--> RENDERER
```

### 共享一个 OpenUI 库

在服务器（生成面板提示）和客户端（作为 `Renderer` 属性）上使用相同的库对象，以便模型被告知的组件始终与渲染器可以绘制的组件相匹配：

```ts library.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { openuiChatLibrary, openuiChatPromptOptions } from "@openuidev/react-ui";

export const library = openuiChatLibrary;
export const promptOptions = openuiChatPromptOptions;
```

### 定义协调员和面板代理@\[`createDeepAgent`] 构建一个协调器，其唯一的工作是路由：它选择专家的简要需求，并在一条消息中发出他们所有的 `task()` 调用，以便面板同时运行。每个面板子代理共享一个预生成的 OpenUI 系统提示符，并且仅接收其数据域的工具。

```ts expandable agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent, type SubAgent } from "deepagents";

import { library, promptOptions } from "./library.js";
import { calendarTools, githubTools, posthogTools, stripeTools } from "./tools.js";

// The coordinator only routes, so a fast model handles it; panels generate
// strict openui-lang and stay on the frontier model.
const COORDINATOR_MODEL = "openai:gpt-5.4-mini";
const PANEL_MODEL = "openai:gpt-5.5";

// Generate the shared panel prompt once at module load so the model prefix
// stays stable for provider prompt caching.
const PANEL_SYSTEM_PROMPT = library.prompt({
  ...promptOptions,
  preamble:
    "Build one panel of a live executive dashboard. Follow the coordinator's " +
    "task exactly and stay within the data available from your tools.",
  additionalRules: [
    ...(promptOptions.additionalRules ?? []),
    "Use your available data tools before writing the panel.",
    "Return the complete openui-lang program and nothing else.",
    "Emit the `root` statement on the first line so rendering can start immediately.",
  ],
});

const subagents: SubAgent[] = [
  {
    name: "stripe-panel",
    model: PANEL_MODEL,
    description: "Builds the revenue and payments panel from Stripe data.",
    systemPrompt: PANEL_SYSTEM_PROMPT,
    tools: stripeTools,
  },
  // posthog-panel, github-panel, and calendar-panel follow the same shape.
];

const COORDINATOR_PROMPT = `You orchestrate a live executive dashboard.

1. Delegate immediately. Never write openui-lang yourself.
2. Launch all selected specialists in a SINGLE message, one task call per
   panel, so they run concurrently.
3. Give each task a distinct, self-contained description.
4. After the tasks complete, reply with one short plain-text summary.`;

export const dashboard = createDeepAgent({
  model: COORDINATOR_MODEL,
  systemPrompt: COORDINATOR_PROMPT,
  subagents,
});
```

协调员从不写openui-lang。每个面板代理调用其工具，然后返回一个以`root`开头的完整程序，以便其渲染器可以在模型完成剩余语句之前进行绘制。

### 注册图表

将`langgraph.json`指向导出的协调器：

```json langgraph.json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "node_version": "22",
  "graphs": {
    "dashboard": "./src/agent.ts:dashboard"
  },
  "env": "../../.env"
}
```

### 在前端发现并渲染面板

一个 `useStream` 连接承载协调器和每个面板。面板未硬编码：每个并行 `task()` 将表面调用为 `stream.subagents` 快照。对于每个快照，范围化`useMessages(stream, snapshot)`投影，以便面板仅接收其自己的子代理的消息，然后将其OpenUI程序馈送到隔离的`Renderer`：

```tsx expandable App.tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { memo } from "react";

import type { SubagentDiscoverySnapshot } from "@langchain/langgraph-sdk/stream";
import { useMessages, useStream } from "@langchain/react";
import { Renderer, type ActionEvent } from "@openuidev/react-lang";

import { library } from "./library";

// One panel, scoped to one subagent. Memoized so the app shell's re-renders
// never reach this Renderer; the panel's own tokens arrive through useMessages.
const Panel = memo(function Panel({
  stream,
  snapshot,
  isStreaming,
  onAction,
}: {
  stream: ReturnType<typeof useStream>;
  snapshot: SubagentDiscoverySnapshot;
  isStreaming: boolean;
  onAction: (event: ActionEvent) => void;
}) {
  const messages = useMessages(stream, snapshot);
  // The program is the last AI message whose text starts with `root =`.
  const program = programFromMessages(messages);

  if (program === "") return <PanelSkeleton name={snapshot.name} />;

  return (
    <Renderer
      response={program}
      library={library}
      isStreaming={isStreaming}
      onAction={onAction}
    />
  );
});

export function Dashboard() {
  const stream = useStream({
    assistantId: "dashboard",
    apiUrl: import.meta.env.VITE_LANGGRAPH_API_URL ?? "http://localhost:2024",
  });

  // Discover top-level panels from the stream; the layout adapts to whichever
  // specialists the coordinator delegated.
  const panels = [...stream.subagents.values()].filter(
    (snapshot) => snapshot.parentId === null,
  );

  return (
    <main>
      {panels.map((snapshot) => (
        <Panel
          key={snapshot.id}
          stream={stream}
          snapshot={snapshot}
          isStreaming={snapshot.status === "running" && stream.isLoading}
          onAction={(event) => {
            // Handle continue_conversation and open_url actions.
          }}
        />
      ))}
    </main>
  );
}
```

由于 SDK 将子代理令牌事件保留在根存储之外，并且每个 `Panel` 都记录在其快照标识上，因此来自一个面板的令牌永远不会重新渲染另一个面板。

## 最佳实践* **在模块加载时生成系统提示：**不在 React 组件内；提示符为几千字节，应计算一次
* **仅在新线程上注入系统提示符：** 检查 `stream.messages.length === 0` 并在后续回合中跳过注入，以避免在线程历史记录中重复提示符
* **使用提升顺序：**先写`root = Stack([...])`； UI shell 立即出现，并且随着模型定义每个部分，各部分逐渐填充
* **完整语句的门控：** 避免在每个标记上重新渲染渲染器；仅在完整报表 (`name = ComponentCall(...)`) 到达时更新
* **在渲染之前验证图表数据：** 图表组件需要在包含在稳定快照中之前定义其 `Series` 和标签数组
* **保留驼峰命名法变量名：** openui-lang 解析器仅接受驼峰命名法标识符；在系统提示的`additionalRules`中强化这一点
* **在一条消息中委派面板：** 当分发给 Deep Agents 专家时，在单个协调器消息中发出所有 `task()` 调用，以便面板同时流式传输，而不是一次一个* **将每个面板的范围限制到其子代理：** 从 `stream.subagents` 发现面板并将每个快照传递到 `useMessages(stream, snapshot)`，以便面板仅渲染其自己的子代理的输出

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/integrations/openui.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>