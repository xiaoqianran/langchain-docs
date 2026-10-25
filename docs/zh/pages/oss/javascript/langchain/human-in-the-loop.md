<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Human-in-the-loop | https://docs.langchain.com/oss/javascript/langchain/human-in-the-loop -->

# 人机交互

人在环 (HITL) [middleware](/oss/javascript/langchain/middleware/built-in#human-in-the-loop) 允许您为代理工具调用添加人工监督。
当模型提出可能需要审查的操作（例如写入文件或执行 SQL）时，中间件可以暂停执行并等待决策。

它通过根据可配置策略检查每个工具调用来实现此目的。如果需要干预，中间件会发出 [interrupt](https://reference.langchain.com/javascript/langchain-langgraph/index/interrupt) 来停止执行。图状态使用LangGraph的[persistence layer](/oss/javascript/langgraph/persistence)保存，因此执行可以安全地暂停并稍后恢复。

然后，人类的决定决定接下来会发生什么：该操作可以按原样批准 (`approve`)、在运行前修改 (`edit`)、拒绝反馈 (`reject`) 或直接响应 (`respond`)“询问用户”风格的工具。

## 中断决策类型

[middleware](/oss/javascript/langchain/middleware/built-in#human-in-the-loop) 定义了人类响应中断的四种内置方式：|决策类型|描述 |示例用例 |
| - | - | - |
| ✅ `approve` |使用代理建议的原始参数执行该工具。 |发送与书面内容完全一致的电子邮件草稿 |
| ✏️ `edit` |执行前修改工具参数。 |发送电子邮件之前更改收件人 |
| ❌ `reject` |完全跳过执行此工具调用并向代理返回拒绝反馈。 |拒绝文件删除并解释原因 |
| 💬 `respond` |对于“询问用户”风格的工具，直接将人类的消息作为合成工具结果返回，跳过执行。 |通过直接回复来回答 `"ask_user"` 提示 |

每个工具的可用决策类型取决于您在 `interruptOn` 中配置的策略。

当多个工具调用同时暂停时，每个操作都需要单独的决策。

在默认批处理模式下，按照与中断请求中出现的操作相同的顺序提供决策。在[per-call mode](#pause-once-per-tool-call)中，每个工具调用都有自己的中断并做出一个决定。当人类拒绝请求的操作时使用`reject`。仅当人类充当工具时才使用`respond`，例如回答`ask_user`提示。不要使用`respond`来拒绝副作用工具，因为它的消息被视为成功的工具结果。

> [!提示]
>
> **编辑**工具参数时，请保守地进行更改。对原始参数的重大修改可能会导致模型重新评估其方法，并可能多次执行该工具或采取意外的操作。

## 配置中断

要使用 HITL，请在创建代理时将 [middleware](/oss/javascript/langchain/middleware/built-in#human-in-the-loop) 添加到代理的 `middleware` 列表中。

您可以使用工具操作到每个操作允许的决策类型的映射来配置它。当工具调用与映射中的操作匹配时，中间件将中断执行。

本示例使用默认的批处理模式。要每次工具调用暂停一次，请参阅[Set the interrupt mode](#set-the-interrupt-mode)。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, humanInTheLoopMiddleware } from "langchain"; // [!code highlight]
import { MemorySaver } from "@langchain/langgraph"; // [!code highlight]

const agent = createAgent({
    model: "gpt-5.5",
    tools: [writeFileTool, executeSQLTool, readDataTool],
    middleware: [
        humanInTheLoopMiddleware({
            interruptOn: {
                write_file: true, // All decisions (approve, edit, reject, respond) allowed
                execute_sql: {
                    allowedDecisions: ["approve", "reject"],
                    // No editing allowed
                    description: "🚨 SQL execution requires DBA approval",
                },
                // Safe operation, no approval needed
                read_data: false,
            },
            // Prefix for interrupt messages - combined with tool name and args to form the full message
            // e.g., "Tool execution pending approval: execute_sql with query='DELETE FROM...'"
            // Individual tools can override this by specifying a "description" in their interrupt config
            descriptionPrefix: "Tool execution pending approval",
        }),
    ],
    // Human-in-the-loop requires checkpointing to handle interrupts.
    // In production, use a persistent checkpointer like AsyncPostgresSaver or MongoDBSaver.
    checkpointer: new MemorySaver(), // [!code highlight]
});
```> [!注意]
>
> 您必须配置一个检查指针以跨中断保持图形状态。
>
> 在生产中，使用持久检查指针，例如 [⟦T47⟧](https://reference.langchain.com/javascript/langchain-langgraph-checkpoint-postgres/index/PostgresSaver) 或 [⟦T48⟧](https://reference.langchain.com/javascript/langchain-langgraph-checkpoint-mongodb/MongoDBSaver)。对于测试或原型设计，请使用[⟦T49⟧](https://reference.langchain.com/javascript/langchain-langgraph-checkpoint/index/MemorySaver)。
>
> 调用代理时，传递包含 **线程 ID** 的 `config`，以将执行与对话线程关联起来。
> 详情请参阅[LangGraph interrupts documentation](/oss/javascript/langgraph/interrupts)。

> **配置选项**
>
> **中断** `object` *必需*
>
> 将工具名称映射到批准配置。值可以是`true`（默认配置的中断）、`false`（自动批准）或`InterruptOnConfig`对象。
>
> **descriptionPrefix** `string`（默认：工具执行需要批准）
>
> 操作请求描述的前缀
>
> **中断模式** `string`（默认：批量）
>
> 代理如何暂停以进行审查。 `"batched"` 每个模型回合都会引发一个中断，并以有序列表进行响应。 `"per_call"` 每个门控调用产生一个中断，由中断 ID 应答。 `"per_call"` 需要`langchain>=1.5.18`。参见[Set the interrupt mode](#set-the-interrupt-mode)。
>
> **编辑通知** `string | null`
>> 在每次调用模式下，在调用结果之前添加文本，审阅者将其替换为 `edit` 决策，以便模型知道调用已更改。默认为人工审阅者替换了呼叫的注释。通过 `null` 不添加任何内容。
>
> **`InterruptOnConfig` 选项：**
>
> **允许的决定** `string[]`
>
> 允许的决策列表：`'approve'`、`'edit'`、`'reject'` 或 `'respond'`
>
> **描述** `string | callable`
>
> 用于自定义描述的静态字符串或可调用函数
>
> **当** `callable`
>
> 可选谓词，接收 [ToolCallRequest](https://reference.langchain.com/javascript/langchain/index/ToolCallRequest) 并返回 `true` 以中断或返回 `false` 以自动批准。用它来控制调用参数的中断。需要`langchain>=1.4.6`。

## 条件中断

默认情况下，`interruptOn` 中列出的每个工具调用都会暂停以供审核。要仅暂停某些调用，请将 `when` 谓词添加到工具的 `InterruptOnConfig`。该谓词接收 `ToolCallRequest` 并返回 `true` 以中断或返回 `false` 以自动批准，因此您可以控制工具的参数。

> [!注意]
>
> 条件中断需要`langchain>=1.4.6`。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, humanInTheLoopMiddleware } from "langchain";
import type { ToolCallRequest } from "langchain";
import { MemorySaver } from "@langchain/langgraph";

// Pause writes to paths outside the workspace directory.
const writesOutsideWorkspace = (request: ToolCallRequest) =>
  !String(request.toolCall.args.path ?? "").startsWith("/workspace/");

// Pause SQL that isn't a read-only SELECT.
const isWriteQuery = (request: ToolCallRequest) =>
  !String(request.toolCall.args.query ?? "")
    .trimStart()
    .toUpperCase()
    .startsWith("SELECT");

const agent = createAgent({
  model: "gpt-5.5",
  tools: [writeFile, executeSql, readData],
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        write_file: {
          allowedDecisions: ["approve", "edit", "reject"],
          when: writesOutsideWorkspace,
        },
        execute_sql: {
          allowedDecisions: ["approve", "reject"],
          when: isWriteQuery,
        },
      },
    }),
  ],
  checkpointer: new MemorySaver(),
});
```当 `when` 谓词返回 `false` 时，调用将不间断地运行。当它返回 `true` 时，或者当您省略 `when` 时，呼叫将照常暂停。评估为 `false` 的调用永远不会暂停，因此审阅者只能看到需要决策的操作。

当代理恢复时，谓词再次运行，因此它必须为同一调用返回相同的结果。如果它在简历中返回`false`，则该工具将运行并且审阅者的答案将被忽略，即使是`reject`。在批处理模式下，如果仅部分调用的结果发生变化，中间件会抛出错误。

## 设置中断模式

中间件以两种模式之一暂停，使用 `interruptMode` 设置：

* **`"per_call"`**：每个需要审查的工具调用在启动时都会引发自己的中断。每个中断都携带它接受的答案的[⟦T91⟧](/oss/javascript/langgraph/interrupts#define-an-interrupt-response-schema)。您可以通过一个决定来回答它，并以中断 ID 为关键。
* **`"batched"`**（默认）：每个模型回合一个中断会列出每个需要审核的调用。您以相同顺序列出一系列决定来回答。

对新代理使用每次呼叫模式。 LangChain 计划在下一个主要版本中将其设为默认值。有关并排比较和每次调用模式解决的问题，请参阅[human-in-the-loop overview](/oss/javascript/concepts/human-in-the-loop)。

## 每次工具调用暂停一次> [!注意]
>
> 每次调用中断需要 `langchain>=1.5.18` 和 `createAgent` 版本 `"v2"`，默认值。

设置 `interruptMode: "per_call"` 来单独查看每个工具调用。该代理控制`write_file`和`execute_sql`，并让`read_data`无需审查即可运行：

```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MemorySaver } from "@langchain/langgraph";
import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
import * as z from "zod";

const writeFile = tool(
  ({ path, content }) => `Wrote ${content.length} characters to ${path}`,
  {
    name: "write_file",
    description: "Write content to a file.",
    schema: z.object({ path: z.string(), content: z.string() }),
  },
);

const executeSql = tool(() => "Deleted 42 rows", {
  name: "execute_sql",
  description: "Run a SQL query.",
  schema: z.object({ query: z.string() }),
});

const readData = tool(({ table }) => `3 rows from ${table}`, {
  name: "read_data",
  description: "Read rows from a table.",
  schema: z.object({ table: z.string() }),
});

let agent = createAgent({
  model: "google:gemini-3.6-flash",
  tools: [writeFile, executeSql, readData],
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        write_file: true,
        execute_sql: { allowedDecisions: ["approve", "reject"] },
        read_data: false,
      },
      interruptMode: "per_call", // [!code highlight]
    }),
  ],
  checkpointer: new MemorySaver(),
});
```

```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MemorySaver } from "@langchain/langgraph";
import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
import * as z from "zod";

const writeFile = tool(
  ({ path, content }) => `Wrote ${content.length} characters to ${path}`,
  {
    name: "write_file",
    description: "Write content to a file.",
    schema: z.object({ path: z.string(), content: z.string() }),
  },
);

const executeSql = tool(() => "Deleted 42 rows", {
  name: "execute_sql",
  description: "Run a SQL query.",
  schema: z.object({ query: z.string() }),
});

const readData = tool(({ table }) => `3 rows from ${table}`, {
  name: "read_data",
  description: "Read rows from a table.",
  schema: z.object({ table: z.string() }),
});

let agent = createAgent({
  model: "openai:gpt-5.5",
  tools: [writeFile, executeSql, readData],
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        write_file: true,
        execute_sql: { allowedDecisions: ["approve", "reject"] },
        read_data: false,
      },
      interruptMode: "per_call", // [!code highlight]
    }),
  ],
  checkpointer: new MemorySaver(),
});
```

```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MemorySaver } from "@langchain/langgraph";
import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
import * as z from "zod";

const writeFile = tool(
  ({ path, content }) => `Wrote ${content.length} characters to ${path}`,
  {
    name: "write_file",
    description: "Write content to a file.",
    schema: z.object({ path: z.string(), content: z.string() }),
  },
);

const executeSql = tool(() => "Deleted 42 rows", {
  name: "execute_sql",
  description: "Run a SQL query.",
  schema: z.object({ query: z.string() }),
});

const readData = tool(({ table }) => `3 rows from ${table}`, {
  name: "read_data",
  description: "Read rows from a table.",
  schema: z.object({ table: z.string() }),
});

let agent = createAgent({
  model: "anthropic:claude-sonnet-5",
  tools: [writeFile, executeSql, readData],
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        write_file: true,
        execute_sql: { allowedDecisions: ["approve", "reject"] },
        read_data: false,
      },
      interruptMode: "per_call", // [!code highlight]
    }),
  ],
  checkpointer: new MemorySaver(),
});
```

```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MemorySaver } from "@langchain/langgraph";
import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
import * as z from "zod";

const writeFile = tool(
  ({ path, content }) => `Wrote ${content.length} characters to ${path}`,
  {
    name: "write_file",
    description: "Write content to a file.",
    schema: z.object({ path: z.string(), content: z.string() }),
  },
);

const executeSql = tool(() => "Deleted 42 rows", {
  name: "execute_sql",
  description: "Run a SQL query.",
  schema: z.object({ query: z.string() }),
});

const readData = tool(({ table }) => `3 rows from ${table}`, {
  name: "read_data",
  description: "Read rows from a table.",
  schema: z.object({ table: z.string() }),
});

let agent = createAgent({
  model: "openrouter:z-ai/glm-5.2",
  tools: [writeFile, executeSql, readData],
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        write_file: true,
        execute_sql: { allowedDecisions: ["approve", "reject"] },
        read_data: false,
      },
      interruptMode: "per_call", // [!code highlight]
    }),
  ],
  checkpointer: new MemorySaver(),
});
```

```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MemorySaver } from "@langchain/langgraph";
import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
import * as z from "zod";

const writeFile = tool(
  ({ path, content }) => `Wrote ${content.length} characters to ${path}`,
  {
    name: "write_file",
    description: "Write content to a file.",
    schema: z.object({ path: z.string(), content: z.string() }),
  },
);

const executeSql = tool(() => "Deleted 42 rows", {
  name: "execute_sql",
  description: "Run a SQL query.",
  schema: z.object({ query: z.string() }),
});

const readData = tool(({ table }) => `3 rows from ${table}`, {
  name: "read_data",
  description: "Read rows from a table.",
  schema: z.object({ table: z.string() }),
});

let agent = createAgent({
  model: "fireworks:accounts/fireworks/models/glm-5p2",
  tools: [writeFile, executeSql, readData],
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        write_file: true,
        execute_sql: { allowedDecisions: ["approve", "reject"] },
        read_data: false,
      },
      interruptMode: "per_call", // [!code highlight]
    }),
  ],
  checkpointer: new MemorySaver(),
});
```

```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MemorySaver } from "@langchain/langgraph";
import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
import * as z from "zod";

const writeFile = tool(
  ({ path, content }) => `Wrote ${content.length} characters to ${path}`,
  {
    name: "write_file",
    description: "Write content to a file.",
    schema: z.object({ path: z.string(), content: z.string() }),
  },
);

const executeSql = tool(() => "Deleted 42 rows", {
  name: "execute_sql",
  description: "Run a SQL query.",
  schema: z.object({ query: z.string() }),
});

const readData = tool(({ table }) => `3 rows from ${table}`, {
  name: "read_data",
  description: "Read rows from a table.",
  schema: z.object({ table: z.string() }),
});

let agent = createAgent({
  model: "baseten:zai-org/GLM-5.2",
  tools: [writeFile, executeSql, readData],
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        write_file: true,
        execute_sql: { allowedDecisions: ["approve", "reject"] },
        read_data: false,
      },
      interruptMode: "per_call", // [!code highlight]
    }),
  ],
  checkpointer: new MemorySaver(),
});
```

```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MemorySaver } from "@langchain/langgraph";
import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
import * as z from "zod";

const writeFile = tool(
  ({ path, content }) => `Wrote ${content.length} characters to ${path}`,
  {
    name: "write_file",
    description: "Write content to a file.",
    schema: z.object({ path: z.string(), content: z.string() }),
  },
);

const executeSql = tool(() => "Deleted 42 rows", {
  name: "execute_sql",
  description: "Run a SQL query.",
  schema: z.object({ query: z.string() }),
});

const readData = tool(({ table }) => `3 rows from ${table}`, {
  name: "read_data",
  description: "Read rows from a table.",
  schema: z.object({ table: z.string() }),
});

let agent = createAgent({
  model: "ollama:north-mini-code-1.0",
  tools: [writeFile, executeSql, readData],
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        write_file: true,
        execute_sql: { allowedDecisions: ["approve", "reject"] },
        read_data: false,
      },
      interruptMode: "per_call", // [!code highlight]
    }),
  ],
  checkpointer: new MemorySaver(),
});
```

### 读取中断

当模型一次调用所有三个工具时，`read_data` 立即运行。这两个门控调用各自引发一个中断：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { isToolApprovalInterrupt } from "langchain";

let config = { configurable: { thread_id: "1" } };
let result = await agent.invoke(
  {
    messages: [
      { role: "user", content: "Archive old orders, then delete them." },
    ],
  },
  config,
);

// One interrupt per gated tool call, in no fixed order
const approvals = (result.__interrupt__ ?? []).filter(isToolApprovalInterrupt);
for (const interrupt of approvals) {
  console.log(interrupt.value);
}
// > {
// >   type: 'tool_approval',
// >   tool_call_id: 'call_write',
// >   name: 'write_file',
// >   args: { path: 'orders_archive.csv', content: 'id,total\n1,20\n' },
// >   description: 'Tool execution requires approval\n\nTool: write_file\nArgs: {\n  "path": "orders_archive.csv",\n  "content": "id,total\\n1,20\\n"\n}'
// > }
// > {
// >   type: 'tool_approval',
// >   tool_call_id: 'call_sql',
// >   name: 'execute_sql',
// >   args: { query: "DELETE FROM orders WHERE created_at < '2025-01-01'" },
// >   description: `Tool execution requires approval\n\nTool: execute_sql\nArgs: {\n  "query": "DELETE FROM orders WHERE created_at < '2025-01-01'"\n}`
// > }
```

每个中断值都有`type: "tool_approval"`，因此客户端可以将其与其他中断区分开来。 `isToolApprovalInterrupt` 函数检查它并缩小值的类型。 `tool_call_id`、`name` 和 `args` 字段标识正在审核的呼叫。

### 读取响应模式

每个中断还携带一个 `response_schema`：一种 JSON 模式，工具允许的每个决策有一个分支，与决策的 `type` 相匹配。 `execute_sql` 模式有 `approve` 和 `reject` 分支。 `write_file` 模式具有全部四个。对于允许一个决策的工具，`response_schema` 是该决策的单独模式，没有 `oneOf`。

每个选项卡都会显示一个 `write_file` 分支、与其匹配的答案以及模型收到的 [ToolMessage](https://reference.langchain.com/javascript/langchain-core/messages/ToolMessage)。为了便于阅读，下面的分支省略了 `additionalProperties` 字段。

**批准**

按照建议运行呼叫。

```json Schema branch theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{"type": "object", "properties": {"type": {"type": "string", "const": "approve"}}, "required": ["type"]}
```

```ts Answer theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{ type: "approve" }
```

```text Model receives theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Wrote 14 characters to orders_archive.csv
```

**编辑**使用新参数运行调用。 `edited_action.name` 必须保持 `write_file`，并且 `edited_action.args` 必须匹配 `write_file` 的参数模式。工具未声明的参数的处理方式与模型发送参数时的处理方式相同：`z.object` 模式会删除它们，`z.looseObject` 模式会保留它们。

```json Schema branch theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "type": "object",
  "properties": {
    "type": {"type": "string", "const": "edit"},
    "edited_action": {
      "type": "object",
      "properties": {
        "name": {"type": "string", "const": "write_file"},
        "args": {
          "type": "object",
          "properties": {
            "path": {"type": "string"},
            "content": {"type": "string"}
          },
          "required": ["path", "content"]
        }
      },
      "required": ["name", "args"]
    }
  },
  "required": ["type", "edited_action"]
}
```

```ts Answer theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  type: "edit",
  edited_action: {
    name: "write_file",
    args: { path: "archive/orders_2024.csv", content: "id,total\n1,20\n" },
  },
}
```

在审阅者替换了调用的注释后，模型会收到工具的结果。在中间件上设置 `editNotice` 来更改注释，或者通过 `null` 来删除它。

```text Model receives theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Note: a human reviewer replaced this tool call before it ran. The call recorded in your message is the one you produced, not the one that executed. This was intentional and authorized. Do not re-issue your original call. Executed instead: write_file with arguments {"path":"archive/orders_2024.csv","content":"id,total\n1,20\n"}.

Tool response:
Wrote 14 characters to archive/orders_2024.csv
```

**拒绝**

跳过通话。 `message` 是可选的，并告诉模型原因。

```json Schema branch theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{"type": "object", "properties": {"type": {"type": "string", "const": "reject"}, "message": {"type": "string"}}, "required": ["type"]}
```

```ts Answer theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{ type: "reject", message: "Write to the archive/ folder instead." }
```

```text Model receives (error status) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Write to the archive/ folder instead.
```

**回应**

跳过呼叫并代替该工具接听。需要`message`。该模型将其作为成功的工具结果接收，因此使用 `reject` 拒绝呼叫。

```json Schema branch theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{"type": "object", "properties": {"type": {"type": "string", "const": "respond"}, "message": {"type": "string"}}, "required": ["type", "message"]}
```

```ts Answer theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{ type: "respond", message: "Saved orders_archive.csv to the shared drive myself." }
```

```text Model receives theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Saved orders_archive.csv to the shared drive myself.
```

### 通过 ID 恢复每个通话

用一个决定来应答每个中断，并通过其 ID 进行键入：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Command } from "@langchain/langgraph";

const decisions = Object.fromEntries(
  approvals.map((interrupt) => [
    interrupt.id,
    interrupt.value.name === "execute_sql"
      ? { type: "reject", message: "Archive the rows before deleting them." }
      : { type: "approve" },
  ]),
);

result = await agent.invoke(new Command({ resume: decisions }), config);
```

您还可以一次应答一个中断。您未应答的中断将保持待处理状态，一旦获得应答，其工具就会运行。> [!警告]
>
> 如果一起发送的多个答案之一无效，其他工具可以运行，而它们的中断仍显示为待处理。再次回答他们会运行这些工具两次。在将答案一起发送之前，请根据 `response_schema` 检查答案，或一次发送一个。

### 更正无效答案

LangGraph 在保存答案之前对照中断的 `response_schema` 检查每个答案。无效的答案会引发错误并且不会保存任何内容，因此您可以向同一中断 ID 发送正确的答案。中间件将错误包装在`MiddlewareError`中，其`cause`是带有问题列表的Zod错误。在这里，编辑遗漏了`content`：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const writeFileInterrupt = (result.__interrupt__ ?? [])
  .filter(isToolApprovalInterrupt)
  .find((interrupt) => interrupt.value.name === "write_file")!;
const args: Record<string, string> = { path: "archive/orders_2024.csv" };
const edit = { type: "edit", edited_action: { name: "write_file", args } };

try {
  await agent.invoke(
    new Command({ resume: { [writeFileInterrupt.id]: edit } }),
    config,
  );
} catch (error) {
  // The middleware wraps the error; its `cause` lists what failed
  if (!(error instanceof Error && error.cause instanceof z.core.$ZodError)) {
    throw error;
  }
  for (const issue of error.cause.issues) {
    console.log(`${issue.path.join(".")} ${issue.message}`);
  }
}
// > edited_action.args.content Invalid input: expected string, received undefined

// Nothing was saved, so answer the same interrupt again
args.content = "id,total\n1,20\n";
result = await agent.invoke(
  new Command({ resume: { [writeFileInterrupt.id]: edit } }),
  config,
);
```

每个问题都会命名失败的字段，以便您可以将其显示给审阅者。 LangGraph 仅检查具有 Zod v4 对象架构的工具的编辑。对于其他工具，例如具有 JSON 架构的工具，`response_schema` 接受任何 `args` 对象，并且该工具在运行时检查参数。

### 订购中间件以进行每次调用审核

在每次调用模式下，审查在工具调用开始时在工具调用中间件链内进行：* 在工具重试或错误处理中间件之前列出`humanInTheLoopMiddleware`，例如[toolRetryMiddleware](https://reference.langchain.com/javascript/langchain/index/toolRetryMiddleware)和[toolErrorMiddleware](https://reference.langchain.com/javascript/langchain/index/toolErrorMiddleware)，因此它将它们包装起来。否则，重试的调用会再次询问审阅者，并且会重试无效的答案或将其作为工具错误返回给模型。
* 当代理恢复时，`humanInTheLoopMiddleware`之前列出的中间件将再次运行直到暂停，因此在调用其处理程序之前它不能有副作用。该工具仅在回答后运行。
* 每次调用开始时都会运行 [⟦T136⟧ predicate](#conditional-interrupts)，因此它收到的 [ToolCallRequest](https://reference.langchain.com/javascript/langchain/index/ToolCallRequest) 包含该工具。

## 响应中断

当您调用代理时，它会一直运行，直到完成或引发中断。当工具调用与您在`interruptOn`中配置的策略匹配时，会触发中断。结果有一个 `__interrupt__` 字段，其中包含需要审核的操作。然后，您可以将这些操作呈现给审阅者，并在做出决定后恢复执行。

本节中的示例和下面的决策类型使用默认的批处理模式。对于每次调用模式，请参阅[Pause once per tool call](#pause-once-per-tool-call)。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { HumanMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";

// You must provide a thread ID to associate the execution with a conversation thread,
// so the conversation can be paused and resumed (as is needed for human review).
const config = { configurable: { thread_id: "some_id" } }; // [!code highlight]

// Run the graph until the interrupt is hit.
const result = await agent.invoke(
    {
        messages: [new HumanMessage("Delete old records from the database")],
    },
    config // [!code highlight]
);


// The interrupt contains the full HITL request with actionRequests and reviewConfigs
console.log(result.__interrupt__);
// > [
// >    Interrupt(
// >       value: {
// >          actionRequests: [
// >             {
// >                name: 'execute_sql',
// >                args: { query: 'DELETE FROM records WHERE created_at < NOW() - INTERVAL \'30 days\';' },
// >                description: 'Tool execution pending approval\n\nTool: execute_sql\nArgs: {...}'
// >             }
// >          ],
// >          reviewConfigs: [
// >             {
// >                actionName: 'execute_sql',
// >                allowedDecisions: ['approve', 'reject']
// >             }
// >          ]
// >       }
// >    )
// > ]

// Resume with approval decision
await agent.invoke(
    new Command({ // [!code highlight]
        resume: { decisions: [{ type: "approve" }] }, // or "reject" [!code highlight]
    }), // [!code highlight]
    config // Same thread ID to resume the paused conversation
);
```

### 决策类型

**批准**

使用 `approve` 按原样批准工具调用并在不进行更改的情况下执行它。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await agent.invoke(
    new Command({
        // Decisions are provided as a list, one per action under review.
        // The order of decisions must match the order of actions
        // in the interrupt request.
        resume: {
            decisions: [
                {
                    type: "approve",
                }
            ]
        }
    }),
    config  // Same thread ID to resume the paused conversation
);
```

**编辑**在执行前使用`edit`修改工具调用。
为编辑后的操作提供新的工具名称和参数。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await agent.invoke(
    new Command({
        // Decisions are provided as a list, one per action under review.
        // The order of decisions must match the order of actions
        // in the interrupt request.
        resume: {
            decisions: [
                {
                    type: "edit",
                    // Edited action with tool name and args
                    editedAction: {
                        // Tool name to call.
                        // Will usually be the same as the original action.
                        name: "new_tool_name",
                        // Arguments to pass to the tool.
                        args: { key1: "new_value", key2: "original_value" },
                    }
                }
            ]
        }
    }),
    config  // Same thread ID to resume the paused conversation
);
```

> [!提示]
>
> **编辑**工具参数时，请保守地进行更改。对原始参数的重大修改可能会导致模型重新评估其方法，并可能多次执行该工具或采取意外的操作。

**拒绝**

使用`reject`拒绝工具调用并提供反馈而不是执行。该工具未执行。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await agent.invoke(
    new Command({
        // Decisions are provided as a list, one per action under review.
        // The order of decisions must match the order of actions
        // in the interrupt request.
        resume: {
            decisions: [
                {
                    type: "reject",
                    // Optional: explain why the action was rejected
                    // and whether the agent should retry a different approach.
                    message: "User rejected this action. Do not retry this tool call.",
                }
            ]
        }
    }),
    config  // Same thread ID to resume the paused conversation
);
```

`message` 作为反馈添加到对话中，以帮助代理了解操作被拒绝的原因以及应该做什么。当您省略 `message` 时，中间件将使用默认拒绝消息，告诉模型该工具未执行，并且除非用户要求，否则不要重试相同的工具调用。对于副作用工具，提供特定于域的消息，明确说明代理是否应该放弃操作、提出后续问题或尝试更安全的替代方案。

**回应**使用`respond`作为“询问用户”风格的工具，该工具的真正实现是人类的回复。 `message`内容直接作为工具结果返回；该工具本身不被执行。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await agent.invoke(
    new Command({
        // Decisions are provided as a list, one per action under review.
        // The order of decisions must match the order of actions
        // in the interrupt request.
        resume: {
            decisions: [
                {
                    type: "respond",
                    // The human's reply, returned directly as the tool result
                    message: "Blue.",
                }
            ]
        }
    }),
    config  // Same thread ID to resume the paused conversation
);
```

`message` 作为成功的 `ToolMessage` 返回给代理。当该工具有意充当人工输入的占位符时，请使用 `respond`，例如提示澄清的 `ask_user` 工具。不要使用 `respond` 拒绝提议的操作，因为它告诉模型该工具已成功完成。

***

### 多项决定

当审查多个操作时，请按照中断中出现的顺序为每个操作提供决策：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
    decisions: [
        { type: "approve" },
        {
            type: "edit",
            editedAction: {
                name: "tool_name",
                args: { param: "new_value" }
            }
        },
        {
            type: "reject",
            message: "This action is not allowed"
        }
    ]
}
```

## 通过人机交互进行流式传输

您可以在代理运行时使用 `stream_events()` 传输实时更新并处理中断。使用 `stream.messages` 传输 LLM 令牌，并使用 `stream.values` 检查代理状态快照是否有中断。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Command } from "@langchain/langgraph";

const config = { configurable: { thread_id: "some_id" } };

// Stream agent progress and LLM tokens until interrupt
const stream = await agent.streamEvents(
    { messages: [{ role: "user", content: "Delete old records from the database" }] },
    { ...config, version: "v3" }  // [!code highlight]
);
for await (const message of stream.messages) {  // [!code highlight]
    for await (const token of message.text) {  // [!code highlight]
        process.stdout.write(token);
    }
}

// Check whether the run paused for human input
if (stream.interrupted) {  // [!code highlight]
    console.log(`\n\nInterrupt: ${JSON.stringify(stream.interrupts)}`);  // [!code highlight]
}

// Resume with streaming after human decision
const resumeStream = await agent.streamEvents(
    new Command({ resume: { decisions: [{ type: "approve" }] } }),
    { ...config, version: "v3" }  // [!code highlight]
);
for await (const message of resumeStream.messages) {  // [!code highlight]
    for await (const token of message.text) {
        process.stdout.write(token);
    }
}
```

在[per-call mode](#pause-once-per-tool-call)中，`stream.interrupts`为每个门控工具调用保留一个条目，其中中断值在`payload`中，而没有`response_schema`。使用由 `interruptId` 键入的对象继续：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const streamDecisions = Object.fromEntries(
  stream.interrupts.map((interrupt) => [
    interrupt.interruptId,
    { type: "approve" },
  ]),
);
stream = await agent.streamEvents(new Command({ resume: streamDecisions }), {
  ...config,
  version: "v3",
});
for await (const message of stream.messages) {
  for await (const token of message.text) {
    process.stdout.write(token);
  }
}
```

有关流模式的更多详细信息，请参阅 [Streaming](/oss/javascript/langchain/streaming) 指南。

## 执行生命周期中间件定义了一个 `afterModel` 钩子，该钩子在模型生成响应之后但在执行任何工具调用之前运行：

1. 代理调用模型来生成响应。
2. 中间件检查工具调用的响应。
3. 如果任何调用需要人工输入，中间件将使用 `actionRequests` 和 `reviewConfigs` 构建 [HITLRequest](https://reference.langchain.com/javascript/langchain/index/HITLRequest) 并调用 [interrupt](https://reference.langchain.com/javascript/langchain-langgraph/index/interrupt)。
4. 代理等待人类的决定。
5. 根据`HITLResponse`决策，中间件执行批准或编辑的调用，合成被拒绝的调用的[ToolMessage](https://reference.langchain.com/javascript/langchain-core/messages/ToolMessage)，直接返回人工回复作为`respond`决策的[ToolMessage](https://reference.langchain.com/javascript/langchain-core/messages/ToolMessage)，并恢复执行。

在 [per-call mode](#pause-once-per-tool-call) 中，`afterModel` 钩子不执行任何操作。相反，中间件会在每个门控调用运行时暂停它，每次调用一个[interrupt](https://reference.langchain.com/javascript/langchain-langgraph/index/interrupt)，并在调用决策到达后运行该工具。

## 自定义 HITL 逻辑

对于更专业的工作流程，您可以直接使用 [interrupt](https://reference.langchain.com/javascript/langchain-langgraph/index/interrupt) 原语和 [middleware](/oss/javascript/langchain/middleware) 抽象构建自定义 HITL 逻辑。

查看上面的[execution lifecycle](#execution-lifecycle)，了解如何将中断集成到代理的操作中。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/human-in-the-loop.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。