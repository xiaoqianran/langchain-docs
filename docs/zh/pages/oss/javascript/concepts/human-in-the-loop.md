<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Human-in-the-loop overview | https://docs.langchain.com/oss/javascript/concepts/human-in-the-loop -->

# 人机交互概述

代理如何暂停工具调用以供人工审核，以及每次调用和批量中断有何不同。

人机交互 (HITL) 在工具调用运行之前暂停代理，以便人员可以查看它。审阅者批准调用、编辑其参数、通过反馈拒绝调用或代替工具进行回答。将其用于难以撤消或需要签署的操作，例如删除记录、发送电子邮件或写入文件。

您可以使用[LangChain](/oss/javascript/langchain/human-in-the-loop)中的[⟦T5⟧](https://reference.langchain.com/javascript/langchain/middleware/humanInTheLoopMiddleware)或[Deep Agents](/oss/javascript/deepagents/human-in-the-loop)中的`interruptOn`参数添加评论。中间件以两种模式之一暂停：

* **每次调用**：每个需要审核的工具调用暂停一次。
* **批量**：每个模型回合一次暂停，涵盖该回合中的每个工具调用。批处理模式是当前的默认模式。

<Note>
  每次调用模式需要`langchain>=1.5.18`。 Deep Agents使用批处理模式。
</Note>

## 遵循从暂停到恢复的批准

无论哪种模式，每次批准都遵循相同的步骤：1. 模型提出一个或多个工具调用。
2. 中间件根据您的 `interruptOn` 策略检查每个调用。需要审核的呼叫会使用 [interrupt](https://reference.langchain.com/javascript/langchain-langgraph/index/interrupt) 暂停客服人员。
3. [checkpointer](/oss/javascript/langgraph/persistence) 保存代理的状态，因此即使在另一个进程中，运行也可以停止并稍后恢复。
4. 您的应用程序会向审阅者显示待处理的呼叫，并收集每个呼叫的决定。
5. 您使用 `new Command({ resume })` 恢复代理。中间件应用每个决策，然后代理继续。

决策是以下四种类型之一：

|决策类型|描述 |示例用例 |
| - | - | - |
| ✅ `approve` |使用代理建议的原始参数执行该工具。 |发送与书面内容完全一致的电子邮件草稿 |
| ✏️ `edit` |执行前修改工具参数。 |发送电子邮件之前更改收件人 |
| ❌ `reject` |完全跳过执行此工具调用并向代理返回拒绝反馈。 |拒绝文件删除并解释原因 |
| 💬 `respond` |对于“询问用户”风格的工具，直接将人类的消息作为合成工具结果返回，跳过执行。 |通过直接回复来回答 `"ask_user"` 提示 |本页上的示例使用带有三个工具的代理。 `write_file` 允许所有决策类型。 `execute_sql` 仅允许 `approve` 和 `reject`。 `read_data` 无需审核即可运行。在一轮中，模型调用了所有三个。

## 分别查看每个工具调用

在每次调用模式下，每个需要审核的工具调用在启动时都会自行暂停：

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sequenceDiagram
    participant App as Your app
    participant Agent
    participant Tools

    App->>Agent: invoke(user message)
    Agent->>Tools: write_file, execute_sql, read_data
    Tools-->>Agent: read_data result (not gated, runs right away)
    Tools-->>App: interrupt for write_file
    Tools-->>App: interrupt for execute_sql
    App->>Agent: resume {write_file ID: approve, execute_sql ID: reject}
    Note over Agent: Each answer is checked against its response_schema before it is saved
    Agent->>Tools: run write_file
    Agent-->>App: final result
```

每个中断值描述一次调用并具有`type: "tool_approval"`。 `execute_sql`中断如下所示：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  type: "tool_approval",
  tool_call_id: "call_sql",
  name: "execute_sql",
  args: { query: "DELETE FROM orders WHERE created_at < '2025-01-01'" },
  description: "Tool execution requires approval\n\nTool: execute_sql\nArgs: {\n  \"query\": \"DELETE FROM orders WHERE created_at < '2025-01-01'\"\n}",
}
```

每个中断还携带一个 [⟦T22⟧](/oss/javascript/langgraph/interrupts#define-an-interrupt-response-schema)，这是调用接受的答案的 JSON 模式。对于 `execute_sql`，架构允许 `approve` 和 `reject`。对于`write_file`，它还允许`respond`和`edit`。 `edit`分支包括`write_file`自己的参数模式。客户端可以从架构中呈现表单，而不是对决策类型进行硬编码。 [LangChain guide](/oss/javascript/langchain/human-in-the-loop#read-the-response-schema) 显示了每种决策类型的架构。

您可以通过一个决定来应答每个中断，该决定由中断 ID 指定：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
new Command({
  resume: {
    [writeFileInterrupt.id]: { type: "approve" },
    [executeSqlInterrupt.id]: { type: "reject", message: "Archive the rows before deleting them." },
  },
});
```

LangGraph 在保存之前拒绝无效答案，以便审阅者可以更正它并再次回答。您不回答的中断将保持待处理状态，这样审阅者可以一次回答一个问题。

## 立即回顾整个回合在批处理模式下，中间件在模型响应后、任何工具运行之前暂停一次。 `read_data`也在等待审核，尽管它没有被限制。一个中断列出了`actionRequests`中的每个门控调用，以及每个调用允许的决策在单独的`reviewConfigs`列表中：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  actionRequests: [
    { name: "write_file", args: { path: "orders_archive.csv", content: "id,total\n1,20\n" }, description: "..." },
    { name: "execute_sql", args: { query: "DELETE FROM orders WHERE created_at < '2025-01-01'" }, description: "..." },
  ],
  reviewConfigs: [
    { actionName: "write_file", allowedDecisions: ["approve", "edit", "reject", "respond"] },
    { actionName: "execute_sql", allowedDecisions: ["approve", "reject"] },
  ],
}
```

您以与 `actionRequests` 相同的顺序回答一系列决策：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
new Command({
  resume: {
    decisions: [
      { type: "approve" },
      { type: "reject", message: "Archive the rows before deleting them." },
    ],
  },
});
```

该中断没有`response_schema`。中间件仅在LangGraph保存答案后应用每个决策时才检查每个决策。

## 比较批处理模式问题

批量模式按位置匹配呼叫的答案，并仅在保存后检查每个答案。每行显示示例代理在批处理模式下遇到的问题，以及每次调用模式如何避免该问题：|在批处理模式下 |会发生什么 |在每次通话模式下 |
| - | - | - |
|决策按位置匹配呼叫 |审阅者意味着批准`write_file`并拒绝`execute_sql`，但发送`[reject, approve]`。拒绝将转到`write_file`。 |每个决定都由其调用的中断 ID 决定。 |
|允许的决定位于 `reviewConfigs` |客户按位置配对两个列表，并为每种决策类型硬编码一个按钮。 |每个中断的`response_schema`列出其决策和编辑参数。 |
|在检查之前保存答案 |两次调用的一个决定会抛出`Error: Number of human decisions (1) does not match number of hanging tool calls (2).`，然后正确的答案会因相同的错误而失败，因此线程保持卡住状态。 |首先检查答案。修复它并再次回答。 |
|不检查编辑的参数 |对没有 `content` 的 `write_file` 进行编辑仍会运行该工具，并且模型会因从未进行过的调用而收到错误。 |编辑被拒绝，并显示 `edited_action.args.content Invalid input: expected string, received undefined`。 |
|一个`reject`停止整个转弯 |批准 `write_file` 和拒绝 `execute_sql` 既不会运行工具，也不会运行未门控的 `read_data`。该模型仅收到拒绝。 |每个调用都会自行运行或被拒绝。 |

## 选择中断模式| |每次通话 |批量（默认）|
| - | - | - |
| **当它暂停时** |当每个门控工具调用开始时 |模型响应之后、任何工具运行之前 |
| **每轮中断** |每个门控工具调用一个 |一整回合 |
| **轮流取消门控呼叫** |马上跑|等待审核|
| **答案** |每个中断一个决定，由中断 ID 控制 |按位置匹配的决策列表 |
| **最适合** |新代理、每次呼叫一张审批卡或一条消息、根据架构构建的表单 |批准 UI 已显示为 `actionRequests` |

对新代理使用每次呼叫模式。 LangChain 计划在下一个主要版本中将其设为默认值。

当您的审批 UI 读取批处理格式时，请保持批处理模式，例如使用 [⟦T51⟧ approval pattern](/oss/javascript/langchain/frontend/human-in-the-loop) 构建的格式。

每次调用模式还改变了中间件顺序和多答案恢复的行为方式。在切换之前，请阅读[Order middleware for per-call review](/oss/javascript/langchain/human-in-the-loop#order-middleware-for-per-call-review)和[Resume each call by ID](/oss/javascript/langchain/human-in-the-loop#resume-each-call-by-id)。

## 另请参阅

* [Human-in-the-loop in LangChain](/oss/javascript/langchain/human-in-the-loop)：配置中间件并回答每种决策类型。
* [Human-in-the-loop in Deep Agents](/oss/javascript/deepagents/human-in-the-loop)：对深度代理及其子代理的批准。
* [Define an interrupt response schema](/oss/javascript/langgraph/interrupts#define-an-interrupt-response-schema)：LangGraph 如何检查简历值。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/concepts/human-in-the-loop.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>