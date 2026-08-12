<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Handoffs | https://docs.langchain.com/oss/javascript/langchain/multi-agent/handoffs -->

# 交接

在**切换**架构中，行为根据状态动态变化。核心机制：[tools](/oss/javascript/langchain/tools)更新一个持续存在的状态变量（例如`current_step`或`active_agent`），系统读取该变量来调整行为——应用不同的配置（系统提示、工具）或路由到不同的[agent](/oss/javascript/langchain/agents)。此模式支持不同代理之间的切换以及单个代理内的动态配置更改。

<Tip>
  术语“切换”是由[OpenAI](https://openai.github.io/openai-agents-python/handoffs/)创造的，用于使用工具调用（例如`transfer_to_sales_agent`）在代理或状态之间转移控制。
</Tip>

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sequenceDiagram
    participant User
    participant Agent
    participant Workflow State

    User->>Agent: "My phone is broken"
    Note over Agent,Workflow State: Step: Get warranty status<br/>Tools: record_warranty_status
    Agent-->>User: "Is your device under warranty?"

    User->>Agent: "Yes, it's still under warranty"
    Agent->>Workflow State: record_warranty_status("in_warranty")
    Note over Agent,Workflow State: Step: Classify issue<br/>Tools: record_issue_type
    Agent-->>User: "Can you describe the issue?"

    User->>Agent: "The screen is cracked"
    Agent->>Workflow State: record_issue_type("hardware")
    Note over Agent,Workflow State: Step: Provide resolution<br/>Tools: provide_solution, escalate_to_human
    Agent-->>User: "Here's the warranty repair process..."
```

## 主要特征

* 状态驱动行为：基于状态变量的行为变化（例如，`current_step`或`active_agent`）
* 基于工具的转换：工具更新状态变量以在状态之间移动
* 直接用户交互：每个状态的配置直接处理用户消息
* 持久状态：状态在对话轮次中持续存在

## 何时使用当您需要强制执行顺序约束（仅在满足先决条件后解锁功能）、代理需要跨不同状态直接与用户对话或者您正在构建多阶段对话流时，请使用切换模式。此模式对于需要按特定顺序收集信息的客户支持场景特别有价值，例如，在处理退款之前收集保修 ID。

## 基本实现

核心机制是一个[tool](/oss/javascript/langchain/tools)，它返回一个[⟦T12⟧](/oss/javascript/langgraph/graph-api#command)来更新状态，触发到新步骤或代理的转换：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool, ToolMessage, type ToolRuntime } from "langchain";
import { Command } from "@langchain/langgraph";
import { z } from "zod";

const transferToSpecialist = tool(
  async (_, config: ToolRuntime<typeof StateSchema>) => {
    return new Command({
      update: {
        messages: [
          new ToolMessage({  // [!code highlight]
            content: "Transferred to specialist",
            tool_call_id: config.toolCallId  // [!code highlight]
          })
        ],
        currentStep: "specialist"  // Triggers behavior change
      }
    });
  },
  {
    name: "transfer_to_specialist",
    description: "Transfer to the specialist agent.",
    schema: z.object({})
  }
);
```

<Note>
  **为什么要包含`ToolMessage`？** 当 LLM 调用工具时，它期望得到响应。具有匹配的 `tool_call_id` 的 `ToolMessage` 完成了这个请求-响应周期——没有它，对话历史记录就会变得畸形。每当您的切换工具更新消息时都需要这样做。
</Note>

有关完整的实现，请参阅下面的教程。

<Card title="Tutorial: Build customer support with handoffs" icon="users" href="/oss/javascript/langchain/multi-agent/handoffs-customer-support">
  了解如何使用切换模式构建客户支持代理，其中单个代理在不同配置之间进行转换。
</Card>

## 实现方法有两种方法可以实现切换：**[single agent with middleware](#single-agent-with-middleware)**（具有动态配置的一个代理）或**[multiple agent subgraphs](#multiple-agent-subgraphs)**（不同的代理作为图节点）。

### 带中间件的单一代理

单个代理根据状态改变其行为。中间件拦截每个模型调用并动态调整系统提示和可用工具。工具更新状态变量以触发转换：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool, ToolMessage, type ToolRuntime } from "langchain";
import { Command } from "@langchain/langgraph";
import { z } from "zod";

const recordWarrantyStatus = tool(
  async ({ status }, config: ToolRuntime<typeof StateSchema>) => {
    return new Command({
      update: {
        messages: [
          new ToolMessage({
            content: `Warranty status recorded: ${status}`,
            tool_call_id: config.toolCallId,
          }),
        ],
        warrantyStatus: status,
        currentStep: "specialist", // Update state to trigger transition
      },
    });
  },
  {
    name: "record_warranty_status",
    description: "Record warranty status and transition to next step.",
    schema: z.object({
      status: z.string(),
    }),
  }
);
```

<Accordion title="Complete example: Customer support with middleware">
  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    createAgent,
    createMiddleware,
    tool,
    ToolMessage,
    type ToolRuntime,
  } from "langchain";
  import { Command, MemorySaver, StateSchema } from "@langchain/langgraph";
  import { z } from "zod";

  // 1. Define state with current_step tracker
  const SupportState = new StateSchema({ // [!code highlight]
    currentStep: z.string().default("triage"), // [!code highlight]
    warrantyStatus: z.string().optional(),
  });

  // 2. Tools update currentStep via Command
  const recordWarrantyStatus = tool(
    async ({ status }, config: ToolRuntime<typeof SupportState.State>) => {
      return new Command({ // [!code highlight]
        update: { // [!code highlight]
          messages: [ // [!code highlight]
            new ToolMessage({
              content: `Warranty status recorded: ${status}`,
              tool_call_id: config.toolCallId,
            }),
          ],
          warrantyStatus: status,
          // Transition to next step
          currentStep: "specialist", // [!code highlight]
        },
      });
    },
    {
      name: "record_warranty_status",
      description: "Record warranty status and transition",
      schema: z.object({ status: z.string() }),
    }
  );

  // 3. Middleware applies dynamic configuration based on currentStep
  const applyStepConfig = createMiddleware({
    name: "applyStepConfig",
    stateSchema: SupportState, // [!code highlight]
    wrapModelCall: async (request, handler) => {
      const step = request.state.currentStep || "triage"; // [!code highlight]

      // Map steps to their configurations
      const configs = {
        triage: {
          prompt: "Collect warranty information...",
          tools: [recordWarrantyStatus],
        },
        specialist: {
          prompt: `Provide solutions based on warranty: ${request.state.warrantyStatus}`,
          tools: [provideSolution, escalate],
        },
      };

      const config = configs[step as keyof typeof configs];
      return handler({
        ...request,
        systemPrompt: config.prompt,
        tools: config.tools,
      });
    },
  });

  // 4. Create agent with middleware
  const agent = createAgent({
    model,
    tools: [recordWarrantyStatus, provideSolution, escalate],
    middleware: [applyStepConfig], // [!code highlight]
    checkpointer: new MemorySaver(), // Persist state across turns  // [!code highlight]
  });
  ```
</Accordion>

### 多个代理子图

多个不同的代理作为图中的单独节点存在。切换工具使用 `Command.PARENT` 在代理节点之间导航，以指定接下来要执行的节点。

<Warning>
  子图切换需要小心**[context engineering](/oss/javascript/langchain/context-engineering)**。与单代理中间件（消息历史记录自然流动）不同，您必须明确决定代理之间传递哪些消息。如果出错，代理会收到格式错误的对话历史记录或臃肿的上下文。请参阅下面的[Context engineering](#context-engineering)。
</Warning>

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import {
  tool,
  ToolMessage,
  AIMessage,
  type ToolRuntime,
} from "langchain";
import { Command, StateSchema, MessagesValue } from "@langchain/langgraph";

const CustomState = new StateSchema({
  messages: MessagesValue,
});

const transferToSales = tool(
  async (_, runtime: ToolRuntime<typeof CustomState.State>) => {
    const lastAiMessage = runtime.state.messages // [!code highlight]
      .reverse() // [!code highlight]
      .find(AIMessage.isInstance); // [!code highlight]

    const transferMessage = new ToolMessage({ // [!code highlight]
      content: "Transferred to sales agent", // [!code highlight]
      tool_call_id: runtime.toolCallId, // [!code highlight]
    }); // [!code highlight]
    return new Command({
      goto: "sales_agent",
      update: {
        activeAgent: "sales_agent",
        messages: [lastAiMessage, transferMessage].filter(Boolean), // [!code highlight]
      },
      graph: Command.PARENT,
    });
  },
  {
    name: "transfer_to_sales",
    description: "Transfer to the sales agent.",
    schema: z.object({}),
  }
);
```

<Accordion title="Complete example: Sales and support with handoffs">
  此示例显示了具有单独销售和支持代理的多代理系统。每个代理都是一个单独的图节点，切换工具允许代理相互转移对话。

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    StateGraph,
    START,
    END,
    StateSchema,
    MessagesValue,
    Command,
    ConditionalEdgeRouter,
    GraphNode,
  } from "@langchain/langgraph";
  import { createAgent, AIMessage, ToolMessage } from "langchain";
  import { tool, ToolRuntime } from "@langchain/core/tools";
  import { z } from "zod/v4";

  // 1. Define state with active_agent tracker
  const MultiAgentState = new StateSchema({
    messages: MessagesValue,
    activeAgent: z.string().optional(),
  });

  // 2. Create handoff tools
  const transferToSales = tool(
    async (_, runtime: ToolRuntime<typeof MultiAgentState.State>) => {
      const lastAiMessage = [...runtime.state.messages] // [!code highlight]
        .reverse() // [!code highlight]
        .find(AIMessage.isInstance); // [!code highlight]
      const transferMessage = new ToolMessage({ // [!code highlight]
        content: "Transferred to sales agent from support agent", // [!code highlight]
        tool_call_id: runtime.toolCallId, // [!code highlight]
      }); // [!code highlight]
      return new Command({
        goto: "sales_agent",
        update: {
          activeAgent: "sales_agent",
          messages: [lastAiMessage, transferMessage].filter(Boolean), // [!code highlight]
        },
        graph: Command.PARENT,
      });
    },
    {
      name: "transfer_to_sales",
      description: "Transfer to the sales agent.",
      schema: z.object({}),
    }
  );

  const transferToSupport = tool(
    async (_, runtime: ToolRuntime<typeof MultiAgentState.State>) => {
      const lastAiMessage = [...runtime.state.messages] // [!code highlight]
        .reverse() // [!code highlight]
        .find(AIMessage.isInstance); // [!code highlight]
      const transferMessage = new ToolMessage({ // [!code highlight]
        content: "Transferred to support agent from sales agent", // [!code highlight]
        tool_call_id: runtime.toolCallId, // [!code highlight]
      }); // [!code highlight]
      return new Command({
        goto: "support_agent",
        update: {
          activeAgent: "support_agent",
          messages: [lastAiMessage, transferMessage].filter(Boolean), // [!code highlight]
        },
        graph: Command.PARENT,
      });
    },
    {
      name: "transfer_to_support",
      description: "Transfer to the support agent.",
      schema: z.object({}),
    }
  );

  // 3. Create agents with handoff tools
  const salesAgent = createAgent({
    model: "google_genai:gemini-3.6-flash",
    tools: [transferToSupport],
    systemPrompt:
      "You are a sales agent. Help with sales inquiries. If asked about technical issues or support, transfer to the support agent.",
  });

  const supportAgent = createAgent({
    model: "google_genai:gemini-3.6-flash",
    tools: [transferToSales],
    systemPrompt:
      "You are a support agent. Help with technical issues. If asked about pricing or purchasing, transfer to the sales agent.",
  });

  // 4. Create agent nodes that invoke the agents
  const callSalesAgent: GraphNode<typeof MultiAgentState.State> = async (state) => {
    const response = await salesAgent.invoke(state);
    return response;
  };

  const callSupportAgent: GraphNode<typeof MultiAgentState.State> = async (state) => {
    const response = await supportAgent.invoke(state);
    return response;
  };

  // 5. Create router that checks if we should end or continue
  const routeAfterAgent: ConditionalEdgeRouter<{ InputSchema: typeof MultiAgentState.State; Nodes: "sales_agent" | "support_agent" }> = (state) => {
    const messages = state.messages ?? [];

    // Check the last message - if it's an AIMessage without tool calls, we're done
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg instanceof AIMessage && !lastMsg.tool_calls?.length) { // [!code highlight]
        return END; // [!code highlight]
      } // [!code highlight]
    }

    // Otherwise route to the active agent
    const active = state.activeAgent ?? "sales_agent";
    return active as "sales_agent" | "support_agent";
  };

  const routeInitial: ConditionalEdgeRouter<{ InputSchema: typeof MultiAgentState.State; Nodes: "sales_agent" | "support_agent" }> = (state) => {
    // Route to the active agent based on state, default to sales agent
    return (state.activeAgent ?? "sales_agent") as
      | "sales_agent"
      | "support_agent";
  };

  // 6. Build the graph
  const builder = new StateGraph(MultiAgentState)
    .addNode("sales_agent", callSalesAgent)
    .addNode("support_agent", callSupportAgent);
    // Start with conditional routing based on initial activeAgent
    .addConditionalEdges(START, routeInitial, [
      "sales_agent",
      "support_agent",
    ])
    // After each agent, check if we should end or route to another agent
    .addConditionalEdges("sales_agent", routeAfterAgent, [
      "sales_agent",
      "support_agent",
      END,
    ]);
    builder.addConditionalEdges("support_agent", routeAfterAgent, [
      "sales_agent",
      "support_agent",
      END,
    ]);

  const graph = builder.compile();
  const result = await graph.invoke({
    messages: [
      {
        role: "user",
        content: "Hi, I'm having trouble with my account login. Can you help?",
      },
    ],
  });

  for (const msg of result.messages) {
    console.log(msg.content);
  }
  ```
</Accordion><Tip>
  对于大多数切换用例，使用**带有中间件的单一代理** - 这更简单。仅当您需要定制代理实现时才使用**多个代理子图**（例如，节点本身就是具有反射或检索步骤的复杂图）。
</Tip>

#### 情境工程

通过子图切换，您可以精确控制代理之间的消息流。这种精度对于维护有效的对话历史记录和避免可能使下游代理感到困惑的上下文膨胀至关重要。有关此主题的更多信息，请参阅[context engineering](/oss/javascript/langchain/context-engineering)。

**切换期间处理上下文**

在代理之间切换时，您需要确保对话历史记录仍然有效。 LLM 希望工具调用与他们的响应配对，因此当使用 `Command.PARENT` 移交给另一个代理时，您必须包括两者：

1. **包含工具调用的`AIMessage`**（触发切换的消息）
2. **A `ToolMessage` 确认切换**（对该工具调用的人为响应）

如果没有这种配对，接收代理将看到不完整的对话，并可能产生错误或意外行为。

下面的示例假设仅调用了切换工具（没有并行工具调用）：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const transferToSales = tool(
  async (_, runtime: ToolRuntime<typeof MultiAgentState.State>) => {
    // Get the AI message that triggered this handoff
    const lastAiMessage = runtime.state.messages.at(-1);

    // Create an artificial tool response to complete the pair
    const transferMessage = new ToolMessage({
      content: "Transferred to sales agent",
      tool_call_id: runtime.toolCallId,
    });

    return new Command({
      goto: "sales_agent",
      update: {
        activeAgent: "sales_agent",
        // Pass only these two messages, not the full subagent history
        messages: [lastAiMessage, transferMessage],
      },
      graph: Command.PARENT,
    });
  },
  {
    name: "transfer_to_sales",
    description: "Transfer to the sales agent.",
    schema: z.object({}),
  }
);
```<Note>
  **为什么不传递所有子代理消息？** 虽然您可以在切换中包含完整的子代理对话，但这通常会产生问题。接收代理可能会因不相关的内部推理而感到困惑，并且令牌成本不必要地增加。通过仅传递切换对，您可以使父图的上下文集中于高级协调。如果接收代理需要其他上下文，请考虑在 ToolMessage 内容中总结子代理的工作，而不是传递原始消息历史记录。
</Note>

**将控制权返回给用户**

当将控制权返回给用户时（结束代理的回合），请确保最终消息是`AIMessage`。这将维护有效的对话历史记录并向用户界面发出信号，表明代理已完成其工作。

## 实施注意事项

在设计多代理系统时，请考虑：* **上下文过滤策略**：每个代理是否会收到完整的对话历史记录、过滤的部分或摘要？不同的代理根据其角色可能需要不同的上下文。
* **工具语义**：阐明切换工具是否仅更新路由状态或也执行副作用。例如，`transfer_to_sales()` 还应该创建支持票证，还是应该单独执行操作？
* **令牌效率**：平衡上下文完整性与令牌成本。随着对话时间的延长，总结和选择性上下文传递变得更加重要。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/multi-agent/handoffs.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>