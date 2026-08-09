<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Human-in-the-loop | https://docs.langchain.com/oss/javascript/deepagents/human-in-the-loop -->

# 人机交互

了解如何为敏感工具操作配置人工审批

某些工具操作可能很敏感，需要人工批准才能执行。深度代理通过 LangGraph 的中断功能支持人机交互工作流程。您可以使用 `interrupt_on` 参数配置哪些工具需要批准。当设置`interrupt_on`时，`HumanInTheLoopMiddleware`将添加到[Deep Agents stack](/oss/javascript/deepagents/customization#deep-agents-stack)。如果在工具返回结果之前运行被取消或中断，同一堆栈中的 ⟦​​T39⟧ 会自动修复消息历史记录。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    Agent[Agent] --> Check{Interrupt?}
    Check --> |no| Execute[Execute]
    Check --> |yes| Human{Human}

    Human --> |approve| Execute
    Human --> |edit| Execute
    Human --> |reject| ToolMessage[ToolMessage]
    Human --> |respond| ToolMessage

    Execute --> Agent
    ToolMessage --> Agent

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef decision fill:#FDF3FF,stroke:#7E65AE,stroke-width:2px,color:#504B5F
    classDef alert fill:#F8E8E6,stroke:#B27D75,stroke-width:2px,color:#634643

    class Agent trigger
    class Check,Human decision
    class Execute process
    class ToolMessage process
```

## 基本配置

`interrupt_on`参数接受字典映射工具名称以中断配置。每个工具都可以配置：

* **`True`**：以默认行为启用中断（允许批准、编辑、拒绝、响应）
* **`False`**：禁用该工具的中断
* **`InterruptOnConfig`**：自定义配置。设置`allowed_decisions`来控制审阅选项。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import { createDeepAgent } from "deepagents";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";

const removeFile = tool(
  async ({ path }: { path: string }) => {
    return `Deleted ${path}`;
  },
  {
    name: "remove_file",
    description: "Delete a file from the filesystem.",
    schema: z.object({
      path: z.string(),
    }),
  },
);

const fetchFile = tool(
  async ({ path }: { path: string }) => {
    return `Contents of ${path}`;
  },
  {
    name: "fetch_file",
    description: "Read a file from the filesystem.",
    schema: z.object({
      path: z.string(),
    }),
  },
);

const notifyEmail = tool(
  async ({
    to,
    subject,
    body,
  }: {
    to: string;
    subject: string;
    body: string;
  }) => {
    return `Sent email to ${to}`;
  },
  {
    name: "notify_email",
    description: "Send an email.",
    schema: z.object({
      to: z.string(),
      subject: z.string(),
      body: z.string(),
    }),
  },
);

// Checkpointer is REQUIRED for human-in-the-loop
const checkpointer = new MemorySaver();

const agent = createDeepAgent({
  model: "google_genai:gemini-3.6-flash",
  tools: [removeFile, fetchFile, notifyEmail],
  interruptOn: {
    remove_file: true, // Default: approve, edit, reject, respond
    fetch_file: false, // No interrupts needed
    notify_email: { allowedDecisions: ["approve", "reject"] }, // No editing
  },
  checkpointer, // Required!
});
```

## 决策类型

`allowed_decisions` 列表控制人们在查看工具调用时可以采取的操作：|决策类型|描述 |示例用例 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| ✅ `approve` |使用代理建议的原始参数执行该工具。                                          |发送与书面内容完全一致的电子邮件草稿 |
| ✏️ `edit` |执行前修改工具参数。                                                                     |发送电子邮件之前更改收件人 |
| ❌ `reject` |完全跳过执行此工具调用并向代理返回拒绝反馈。                              |拒绝文件删除并解释原因 |
| 💬 `respond` |对于“询问用户”风格的工具，直接将人类的消息作为合成工具结果返回，跳过执行。 |通过直接回复来回答 `"ask_user"` 提示 |当人类拒绝提议的行动时使用`reject`。仅当人类充当工具时才使用`respond`，例如回答`ask_user`提示。不要使用`respond`来拒绝副作用工具，因为它的消息可能会被模型视为成功的工具结果。

<Tip>
  **编辑**工具参数时，请保守地进行更改。对原始参数的重大修改可能会导致模型重新评估其方法，并可能多次执行该工具或采取意外的操作。
</Tip>

您可以自定义每个工具可用的决策：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const interruptOn = {
  // Sensitive operations: allow all options
  delete_file: { allowedDecisions: ["approve", "edit", "reject"] },

  // Moderate risk: approval or rejection only
  write_file: { allowedDecisions: ["approve", "reject"] },

  // Must approve (no rejection allowed)
  critical_operation: { allowedDecisions: ["approve"] },
};
```

## 处理中断

当中断被触发时，代理暂停执行并返回控制权。检查结果中是否存在中断并进行相应处理。如果用户拒绝某个操作，请包含一个明确的 `message`，告诉代理该工具未执行以及下一步要做什么。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { v7 as uuid7 } from "uuid";
import { Command } from "@langchain/langgraph";

// Create config with thread_id for state persistence
const config = { configurable: { thread_id: uuid7() } };

// Invoke the agent
let result = await agent.invoke({
  messages: [{ role: "user", content: "Delete the file temp.txt" }],
}, config);

// Check if execution was interrupted
if (result.__interrupt__) {
  // Extract interrupt information
  const interrupts = result.__interrupt__[0].value;
  const actionRequests = interrupts.actionRequests;
  const reviewConfigs = interrupts.reviewConfigs;

  // Create a lookup map from tool name to review config
  const configMap = Object.fromEntries(
    reviewConfigs.map((cfg) => [cfg.actionName, cfg])
  );

  // Display the pending actions to the user
  for (const action of actionRequests) {
    const reviewConfig = configMap[action.name];
    console.log(`Tool: ${action.name}`);
    console.log(`Arguments: ${JSON.stringify(action.args)}`);
    console.log(`Allowed decisions: ${reviewConfig.allowedDecisions}`);
  }

  // Get user decisions (one per actionRequest, in order)
  const decisions = [
    {
      type: "reject",
      message: "User rejected deleting temp.txt. Do not retry deletion.",
    }
  ];

  // Resume execution with decisions
  result = await agent.invoke(
    new Command({ resume: { decisions } }),
    config  // Must use the same config!
  );
}

// Process final result
console.log(result.messages[result.messages.length - 1].content);
```

## 多个工具调用

当代理调用需要批准的多个工具时，所有中断都会在单个中断中批量处理。您必须按顺序为每一项做出决定。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const config = { configurable: { thread_id: uuid7() } };

let result = await agent.invoke({
  messages: [{
    role: "user",
    content: "Delete temp.txt and send an email to admin@example.com"
  }]
}, config);

if (result.__interrupt__) {
  const interrupts = result.__interrupt__[0].value;
  const actionRequests = interrupts.actionRequests;

  // Two tools need approval
  console.assert(actionRequests.length === 2);

  // Provide decisions in the same order as actionRequests
  const decisions = [
    { type: "approve" },  // First tool: delete_file
    {
      type: "reject",
      message: "User rejected this action. Do not retry this tool call.",
    }  // Second tool: send_email
  ];

  result = await agent.invoke(
    new Command({ resume: { decisions } }),
    config
  );
}
```

## 拒绝消息当审阅者返回`reject`决策时，深度代理会跳过工具调用并将拒绝反馈发送回代理。如果省略 `message`，默认反馈会告诉模型该工具尚未执行，并且除非用户要求，否则不要重试相同的工具调用。

对于敏感或副作用工具，请通过决策传递特定于域的`message`。明确客服人员是否应该放弃该操作、提出后续问题或尝试更安全的替代方案。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const decisions = [
  {
    type: "reject",
    message: "User rejected deleting this file. Do not retry deletion. Ask which file to archive instead.",
  },
];
```

## 编辑工具参数

当`"edit"`在允许的决策范围内时，您可以在执行前修改工具参数：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
if (result.__interrupt__) {
  const interrupts = result.__interrupt__[0].value;
  const actionRequest = interrupts.actionRequests[0];

  // Original args from the agent
  console.log(actionRequest.args);  // { to: "everyone@company.com", ... }

  // User decides to edit the recipient
  const decisions = [{
    type: "edit",
    editedAction: {
      name: actionRequest.name,  // Must include the tool name
      args: { to: "team@company.com", subject: "...", body: "..." }
    }
  }];

  result = await agent.invoke(
    new Command({ resume: { decisions } }),
    config
  );
}
```

## 子代理中断

使用子代理时，可以使用中断[on tool calls](#interrupts-on-tool-calls)和[within tool calls](#interrupts-within-tool-calls)。

### 工具调用中断

每个子代理都可以有自己的 `interrupt_on` 配置，该配置会覆盖主代理的设置：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const agent = createDeepAgent({
  tools: [deleteFile, readFile],
  interruptOn: {
    delete_file: true,
    read_file: false,
  },
  subagents: [{
    name: "file-manager",
    description: "Manages file operations",
    systemPrompt: "You are a file management assistant.",
    tools: [deleteFile, readFile],
    interruptOn: {
      // Override: require approval for reads in this subagent
      delete_file: true,
      read_file: true,  // Different from main agent!
    }
  }],
  checkpointer
});
```

当子代理触发中断时，处理是相同的 - 检查结果中的 `interrupts` 并使用 `Command` 恢复。

### 工具调用中的中断

子代理工具可以直接调用`interrupt()`暂停执行并等待批准：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver, Command, interrupt } from "@langchain/langgraph";
import { createDeepAgent } from "deepagents";
import { z } from "zod";

const requestApproval = tool(
  async ({ actionDescription }: { actionDescription: string }) => {
    const approval = interrupt({
      type: "approval_request",
      action: actionDescription,
      message: `Please approve or reject: ${actionDescription}`,
    }) as { approved?: boolean; reason?: string };

    if (approval.approved) {
      return `Action '${actionDescription}' was APPROVED. Proceeding...`;
    } else {
      return `Action '${actionDescription}' was REJECTED. Reason: ${
        approval.reason || "No reason provided"
      }`;
    }
  },
  {
    name: "request_approval",
    description: "Request human approval before proceeding with an action.",
    schema: z.object({
      actionDescription: z
        .string()
        .describe("The action that requires approval"),
    }),
  }
);

async function main() {
  const checkpointer = new MemorySaver();
  const model = new ChatOpenAI({
    model: "gpt-5.4-mini",
    maxTokens: 4096,
  });

  const compiledSubagent = createAgent({
    model: model,
    tools: [requestApproval],
    name: "approval-agent",
  });

  const parentAgent = await createDeepAgent({
    checkpointer: checkpointer,
    subagents: [
      {
        name: "approval-agent",
        description: "An agent that can request approvals",
        runnable: compiledSubagent as any,
      },
    ],
  });

  const threadId = "test_interrupt_directly";
  const config = { configurable: { thread_id: threadId } };

  console.log("Invoking agent - sub-agent will use request_approval tool...");

  let result = await parentAgent.invoke(
    {
      messages: [
        new HumanMessage({
          content:
            "Use the task tool to launch the approval-agent sub-agent. " +
            "Tell it to use the request_approval tool to request approval for 'deploying to production'.",
        }),
      ],
    },
    config
  );

  if (result.__interrupt__) {
    const interruptValue = result.__interrupt__[0].value as {
      type?: string;
      action?: string;
      message?: string;
    };
    console.log("\nInterrupt received!");
    console.log(`  Type: ${interruptValue.type}`);
    console.log(`  Action: ${interruptValue.action}`);
    console.log(`  Message: ${interruptValue.message}`);

    console.log("\nResuming with Command(resume={'approved': true})...");
    const result2 = await parentAgent.invoke(
      new Command({ resume: { approved: true } }),
      config
    );

    if (!result2.__interrupt__) {
      console.log("\nExecution completed!");
      // Find the tool response
      const toolMsgs = result2.messages?.filter((m) => m.type === "tool") || [];
      if (toolMsgs.length > 0) {
        const lastToolMsg = toolMsgs[toolMsgs.length - 1];
        console.log(`  Tool result: ${lastToolMsg.content}`);
      }
    } else {
      console.log("\nAnother interrupt occurred");
    }
  } else {
    console.log(
      "\n  No interrupt - the model may not have called request_approval"
    );
  }
}

main().catch(console.error);
```

运行时，会产生以下输出：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Invoking agent - sub-agent will use request_approval tool...

Interrupt received!
  Type: approval_request
  Action: deploying to production
  Message: Please approve or reject: deploying to production

Resuming with Command(resume={'approved': true})...

Execution completed!
  Tool result: Approval for "deploying to production" has been granted. You can proceed with the deployment.
```

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/human-in-the-loop.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>