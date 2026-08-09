<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Human-in-the-loop | https://docs.langchain.com/oss/javascript/langchain/human-in-the-loop -->

# 人机交互

人在环 (HITL) [middleware](/oss/javascript/langchain/middleware/built-in#human-in-the-loop) 允许您为代理工具调用添加人工监督。
当模型提出可能需要审查的操作（例如写入文件或执行 SQL）时，中间件可以暂停执行并等待决策。

它通过根据可配置策略检查每个工具调用来实现此目的。如果需要干预，中间件会发出 [interrupt](https://reference.langchain.com/javascript/langchain-langgraph/index/interrupt) 来停止执行。图状态是使用 LangGraph 的 [persistence layer](/oss/javascript/langgraph/persistence) 保存的，因此执行可以安全地暂停并稍后恢复。

然后，人类的决定决定接下来会发生什么：该操作可以按原样批准（`approve`），在运行前修改（`edit`），拒绝反馈（`reject`），或者直接响应（`respond`）“询问用户”风格的工具。

## 中断决策类型

[middleware](/oss/javascript/langchain/middleware/built-in#human-in-the-loop) 定义了人类响应中断的四种内置方式：|决策类型|描述 |示例用例 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| ✅ `approve` |使用代理建议的原始参数执行该工具。                                          |发送与书面内容完全一致的电子邮件草稿 |
| ✏️ `edit` |执行前修改工具参数。                                                                     |发送电子邮件之前更改收件人 |
| ❌ `reject` |完全跳过执行此工具调用并向代理返回拒绝反馈。                              |拒绝文件删除并解释原因 |
| 💬 `respond` |对于“询问用户”风格的工具，直接将人类的消息作为合成工具结果返回，跳过执行。 |通过直接回复回答 `"ask_user"` 提示 |每个工具的可用决策类型取决于您在 `interrupt_on` 中配置的策略。
当多个工具调用同时暂停时，每个操作都需要单独的决策。
必须按照中断请求中出现的操作的顺序提供决策。

当人类拒绝请求的操作时使用`reject`。仅当人类充当工具时才使用`respond`，例如回答`ask_user`提示。不要使用`respond`来拒绝副作用工具，因为它的消息被视为成功的工具结果。

<Tip>
  **编辑**工具参数时，请保守地进行更改。对原始参数的重大修改可能会导致模型重新评估其方法，并可能多次执行该工具或采取意外的操作。
</Tip>

## 配置中断

要使用 HITL，请在创建代理时将 [middleware](/oss/javascript/langchain/middleware/built-in#human-in-the-loop) 添加到代理的 `middleware` 列表中。

您可以使用工具操作到每个操作允许的决策类型的映射来配置它。当工具调用与映射中的操作匹配时，中间件将中断执行。

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
```

<Info>
  您必须配置检查指针以跨中断保持图形状态。在生产中，使用持久检查指针，例如 [⟦T23⟧](https://reference.langchain.com/javascript/classes/_langchain_langgraph-checkpoint-postgres.AsyncPostgresSaver.html) 或 [⟦T24⟧](https://reference.langchain.com/javascript/langchain-langgraph-checkpoint-mongodb/MongoDBSaver)。对于测试或原型设计，请使用[⟦T25⟧](https://reference.langchain.com/javascript/classes/_langchain_langgraph-checkpoint.MemorySaver.html)。

  调用代理时，传递包含 **线程 ID** 的 `config` 将执行与会话线程关联起来。
  详情请参阅[LangGraph interrupts documentation](/oss/javascript/langgraph/interrupts)。
</Info>

<Accordion title="Configuration options">
  <ParamField type="object">
    工具名称到批准配置的映射
  </ParamField>

  **工具批准配置选项：**

  <ParamField type="boolean">
    是否允许审批
  </ParamField>

  <ParamField type="boolean">
    是否允许编辑
  </ParamField>

  <ParamField type="boolean">
    是否允许回复/拒绝
  </ParamField>
</Accordion>

## 条件中断

默认情况下，`interrupt_on` 中列出的每个工具调用都会暂停以供审核。要仅暂停某些调用，请将 `when` 谓词添加到工具的 `InterruptOnConfig`。该谓词接收 `ToolCallRequest` 并返回 `True` 以中断或返回 `False` 以自动批准，因此您可以控制工具的参数。

条件中断目前仅在 Python 中可用。

## 响应中断当您调用代理时，它会一直运行，直到完成或引发中断。当工具调用与您在`interrupt_on`中配置的策略匹配时，会触发中断。使用 `version="v2"`，结果是 `GraphOutput`，其 `interrupts` 属性包含需要审核的操作。然后，您可以将这些操作呈现给审阅者，并在做出决定后恢复执行。

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


// The interrupt contains the full HITL request with action_requests and review_configs
console.log(result.__interrupt__);
// > [
// >    Interrupt(
// >       value: {
// >          actionRequests: [
// >             {
// >                name: 'execute_sql',
// >                arguments: { query: 'DELETE FROM records WHERE created_at < NOW() - INTERVAL \'30 days\';' },
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

<Tabs>
  <Tab title="✅ approve">
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
  </Tab>

  <Tab title="✏️ edit">
    在执行之前使用`edit`修改工具调用。
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

    <Tip>
      **编辑**工具参数时，请保守地进行更改。对原始参数的重大修改可能会导致模型重新评估其方法，并可能多次执行该工具或采取意外的操作。
    </Tip>
  </Tab>

  <Tab title="❌ reject">
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
    ````message` 作为反馈添加到对话中，以帮助代理了解操作被拒绝的原因以及应该做什么。当您省略 `message` 时，中间件将使用默认拒绝消息，告诉模型该工具未执行，并且除非用户要求，否则不要重试相同的工具调用。对于副作用工具，提供特定于域的消息，明确说明代理是否应该放弃操作、提出后续问题或尝试更安全的替代方案。
  </Tab>

  <Tab title="💬 respond">
    将 `respond` 用于“询问用户”风格的工具，其中该工具的真正实现是人类的回复。 `message`内容直接作为工具结果返回；该工具本身不被执行。

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
  </Tab>
</Tabs>

***

### 多项决定

当审查多个操作时，请按照中断中出现的顺序为每个操作提供决策：```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

有关流模式的更多详细信息，请参阅 [Streaming](/oss/javascript/langchain/streaming) 指南。

## 执行生命周期

中间件定义了一个 `after_model` 钩子，该钩子在模型生成响应之后但在执行任何工具调用之前运行：

1. 代理调用模型来生成响应。
2. 中间件检查工具调用的响应。
3. 如果任何调用需要人工输入，中间件将使用 `action_requests` 和 `review_configs` 构建 `HITLRequest` 并调用 [interrupt](https://reference.langchain.com/javascript/langchain-langgraph/index/interrupt)。
4. 代理等待人类的决定。
5. 根据`HITLResponse`决策，中间件执行批准或编辑的调用，综合[ToolMessage](https://reference.langchain.com/javascript/langchain-core/messages/ToolMessage)的拒绝调用，直接返回人工回复作为[ToolMessage](https://reference.langchain.com/javascript/langchain-core/messages/ToolMessage)的`respond`决策，并恢复执行。

## 自定义 HITL 逻辑

对于更专业的工作流程，您可以直接使用 [interrupt](https://reference.langchain.com/javascript/langchain-langgraph/index/interrupt) 原语和 [middleware](/oss/javascript/langchain/middleware) 抽象构建自定义 HITL 逻辑。

查看上面的[execution lifecycle](#execution-lifecycle)，了解如何将中断集成到代理的操作中。

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/human-in-the-loop.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>