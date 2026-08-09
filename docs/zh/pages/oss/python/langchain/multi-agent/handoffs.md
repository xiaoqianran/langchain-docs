<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Handoffs | https://docs.langchain.com/oss/python/langchain/multi-agent/handoffs -->

# 交接

在**切换**架构中，行为根据状态动态变化。核心机制：[tools](/oss/python/langchain/tools)更新一个持续存在的状态变量（例如`current_step`或`active_agent`），系统读取该变量来调整行为——应用不同的配置（系统提示、工具）或路由到不同的[agent](/oss/python/langchain/agents)。此模式支持不同代理之间的切换以及单个代理内的动态配置更改。

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

核心机制是一个[tool](/oss/python/langchain/tools)，它返回一个[⟦T12⟧](/oss/python/langgraph/graph-api#command)来更新状态，触发到新步骤或代理的转换：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool
from langchain.messages import ToolMessage
from langgraph.types import Command

@tool
def transfer_to_specialist(runtime) -> Command:
    """Transfer to the specialist agent."""
    return Command(
        update={
            "messages": [
                ToolMessage(  # [!code highlight]
                    content="Transferred to specialist",
                    tool_call_id=runtime.tool_call_id  # [!code highlight]
                )
            ],
            "current_step": "specialist"  # Triggers behavior change
        }
    )
```

<Note>
  **为什么要包含`ToolMessage`？** 当 LLM 调用工具时，它期望得到响应。具有匹配的 `tool_call_id` 的 `ToolMessage` 完成了这个请求-响应周期——没有它，对话历史记录就会变得畸形。每当您的切换工具更新消息时都需要这样做。
</Note>

有关完整的实现，请参阅下面的教程。

<Card title="Tutorial: Build customer support with handoffs" icon="users" href="/oss/python/langchain/multi-agent/handoffs-customer-support">
  了解如何使用切换模式构建客户支持代理，其中单个代理在不同配置之间进行转换。
</Card>

## 实现方法有两种方法可以实现切换：**[single agent with middleware](#single-agent-with-middleware)**（具有动态配置的一个代理）或**[multiple agent subgraphs](#multiple-agent-subgraphs)**（不同的代理作为图节点）。

### 带中间件的单一代理

单个代理根据状态改变其行为。中间件拦截每个模型调用并动态调整系统提示和可用工具。工具更新状态变量以触发转换：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import ToolRuntime, tool
from langchain.messages import ToolMessage
from langgraph.types import Command

@tool
def record_warranty_status(
    status: str,
    runtime: ToolRuntime[None, SupportState]
) -> Command:
    """Record warranty status and transition to next step."""
    return Command(
        update={
            "messages": [
                ToolMessage(
                    content=f"Warranty status recorded: {status}",
                    tool_call_id=runtime.tool_call_id
                )
            ],
            "warranty_status": status,
            "current_step": "specialist"  # Update state to trigger transition
        }
    )
```

<Accordion title="Complete example: Customer support with middleware">
  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import AgentState, create_agent
  from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
  from langchain.tools import tool, ToolRuntime
  from langchain.messages import ToolMessage
  from langgraph.types import Command
  from typing import Callable

  # 1. Define state with current_step tracker
  class SupportState(AgentState):  # [!code highlight]
      """Track which step is currently active."""
      current_step: str = "triage"  # [!code highlight]
      warranty_status: str | None = None

  # 2. Tools update current_step via Command
  @tool
  def record_warranty_status(
      status: str,
      runtime: ToolRuntime[None, SupportState]
  ) -> Command:  # [!code highlight]
      """Record warranty status and transition to next step."""
      return Command(update={  # [!code highlight]
          "messages": [  # [!code highlight]
              ToolMessage(
                  content=f"Warranty status recorded: {status}",
                  tool_call_id=runtime.tool_call_id
              )
          ],
          "warranty_status": status,
          # Transition to next step
          "current_step": "specialist"    # [!code highlight]
      })

  # 3. Middleware applies dynamic configuration based on current_step
  @wrap_model_call  # [!code highlight]
  def apply_step_config(
      request: ModelRequest,
      handler: Callable[[ModelRequest], ModelResponse]
  ) -> ModelResponse:
      """Configure agent behavior based on current_step."""
      step = request.state.get("current_step", "triage")  # [!code highlight]

      # Map steps to their configurations
      configs = {
          "triage": {
              "prompt": "Collect warranty information...",
              "tools": [record_warranty_status]
          },
          "specialist": {
              "prompt": "Provide solutions based on warranty: {warranty_status}",
              "tools": [provide_solution, escalate]
          }
      }

      config = configs[step]
      request = request.override(  # [!code highlight]
          system_prompt=config["prompt"].format(**request.state),  # [!code highlight]
          tools=config["tools"]  # [!code highlight]
      )
      return handler(request)

  # 4. Create agent with middleware
  agent = create_agent(
      model,
      tools=[record_warranty_status, provide_solution, escalate],
      state_schema=SupportState,
      middleware=[apply_step_config],  # [!code highlight]
      checkpointer=InMemorySaver()  # Persist state across turns  # [!code highlight]
  )
  ```
</Accordion>

### 多个代理子图

多个不同的代理作为图中的单独节点存在。切换工具使用 `Command.PARENT` 在代理节点之间导航，以指定接下来要执行的节点。

<Warning>
  子图切换需要小心**[context engineering](/oss/python/langchain/context-engineering)**。与单代理中间件（消息历史记录自然流动）不同，您必须明确决定代理之间传递哪些消息。如果出错，代理会收到格式错误的对话历史记录或臃肿的上下文。请参阅下面的[Context engineering](#context-engineering)。
</Warning>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import AIMessage, ToolMessage
from langchain.tools import tool, ToolRuntime
from langgraph.types import Command

@tool
def transfer_to_sales(
    runtime: ToolRuntime,
) -> Command:
    """Transfer to the sales agent."""
    last_ai_message = next(  # [!code highlight]
        msg for msg in reversed(runtime.state["messages"]) if isinstance(msg, AIMessage)  # [!code highlight]
    )  # [!code highlight]
    transfer_message = ToolMessage(  # [!code highlight]
        content="Transferred to sales agent",  # [!code highlight]
        tool_call_id=runtime.tool_call_id,  # [!code highlight]
    )  # [!code highlight]
    return Command(
        goto="sales_agent",
        update={
            "active_agent": "sales_agent",
            "messages": [last_ai_message, transfer_message],  # [!code highlight]
        },
        graph=Command.PARENT
    )
```

<Accordion title="Complete example: Sales and support with handoffs">
  此示例显示了具有单独销售和支持代理的多代理系统。每个代理都是一个单独的图节点，切换工具允许代理相互转移对话。

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from typing import Literal

  from langchain.agents import AgentState, create_agent
  from langchain.messages import AIMessage, ToolMessage
  from langchain.tools import tool, ToolRuntime
  from langgraph.graph import StateGraph, START, END
  from langgraph.types import Command
  from typing_extensions import NotRequired


  # 1. Define state with active_agent tracker
  class MultiAgentState(AgentState):
      active_agent: NotRequired[str]


  # 2. Create handoff tools
  @tool
  def transfer_to_sales(
      runtime: ToolRuntime,
  ) -> Command:
      """Transfer to the sales agent."""
      last_ai_message = next(  # [!code highlight]
          msg for msg in reversed(runtime.state["messages"]) if isinstance(msg, AIMessage)  # [!code highlight]
      )  # [!code highlight]
      transfer_message = ToolMessage(  # [!code highlight]
          content="Transferred to sales agent from support agent",  # [!code highlight]
          tool_call_id=runtime.tool_call_id,  # [!code highlight]
      )  # [!code highlight]
      return Command(
          goto="sales_agent",
          update={
              "active_agent": "sales_agent",
              "messages": [last_ai_message, transfer_message],  # [!code highlight]
          },
          graph=Command.PARENT,
      )


  @tool
  def transfer_to_support(
      runtime: ToolRuntime,
  ) -> Command:
      """Transfer to the support agent."""
      last_ai_message = next(  # [!code highlight]
          msg for msg in reversed(runtime.state["messages"]) if isinstance(msg, AIMessage)  # [!code highlight]
      )  # [!code highlight]
      transfer_message = ToolMessage(  # [!code highlight]
          content="Transferred to support agent from sales agent",  # [!code highlight]
          tool_call_id=runtime.tool_call_id,  # [!code highlight]
      )  # [!code highlight]
      return Command(
          goto="support_agent",
          update={
              "active_agent": "support_agent",
              "messages": [last_ai_message, transfer_message],  # [!code highlight]
          },
          graph=Command.PARENT,
      )


  # 3. Create agents with handoff tools
  sales_agent = create_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[transfer_to_support],
      system_prompt="You are a sales agent. Help with sales inquiries. If asked about technical issues or support, transfer to the support agent.",
  )

  support_agent = create_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[transfer_to_sales],
      system_prompt="You are a support agent. Help with technical issues. If asked about pricing or purchasing, transfer to the sales agent.",
  )


  # 4. Create agent nodes that invoke the agents
  def call_sales_agent(state: MultiAgentState) -> Command:
      """Node that calls the sales agent."""
      response = sales_agent.invoke(state)
      return response


  def call_support_agent(state: MultiAgentState) -> Command:
      """Node that calls the support agent."""
      response = support_agent.invoke(state)
      return response


  # 5. Create router that checks if we should end or continue
  def route_after_agent(
      state: MultiAgentState,
  ) -> Literal["sales_agent", "support_agent", "__end__"]:
      """Route based on active_agent, or END if the agent finished without handoff."""
      messages = state.get("messages", [])

      # Check the last message - if it's an AIMessage without tool calls, we're done
      if messages:
          last_msg = messages[-1]
          if isinstance(last_msg, AIMessage) and not last_msg.tool_calls:  # [!code highlight]
              return "__end__"  # [!code highlight]

      # Otherwise route to the active agent
      active = state.get("active_agent", "sales_agent")
      return active if active else "sales_agent"


  def route_initial(
      state: MultiAgentState,
  ) -> Literal["sales_agent", "support_agent"]:
      """Route to the active agent based on state, default to sales agent."""
      return state.get("active_agent") or "sales_agent"


  # 6. Build the graph
  builder = StateGraph(MultiAgentState)
  builder.add_node("sales_agent", call_sales_agent)
  builder.add_node("support_agent", call_support_agent)

  # Start with conditional routing based on initial active_agent
  builder.add_conditional_edges(START, route_initial, ["sales_agent", "support_agent"])

  # After each agent, check if we should end or route to another agent
  builder.add_conditional_edges(
      "sales_agent", route_after_agent, ["sales_agent", "support_agent", END]
  )
  builder.add_conditional_edges(
      "support_agent", route_after_agent, ["sales_agent", "support_agent", END]
  )

  graph = builder.compile()
  result = graph.invoke(
      {
          "messages": [
              {
                  "role": "user",
                  "content": "Hi, I'm having trouble with my account login. Can you help?",
              }
          ]
      }
  )

  for msg in result["messages"]:
      msg.pretty_print()
  ```
</Accordion><Tip>
  对于大多数切换用例，使用**带有中间件的单一代理** - 这更简单。仅当您需要定制代理实现时才使用**多个代理子图**（例如，节点本身就是具有反射或检索步骤的复杂图）。
</Tip>

#### 情境工程

通过子图切换，您可以精确控制代理之间的消息流。这种精度对于维护有效的对话历史记录和避免可能使下游代理感到困惑的上下文膨胀至关重要。有关此主题的更多信息，请参阅[context engineering](/oss/python/langchain/context-engineering)。

**切换期间处理上下文**

在代理之间切换时，您需要确保对话历史记录仍然有效。 LLM 希望工具调用与他们的响应配对，因此当使用 `Command.PARENT` 移交给另一个代理时，您必须包括两者：

1. **包含工具调用的`AIMessage`**（触发切换的消息）
2. **A `ToolMessage` 确认切换**（对该工具调用的人为响应）

如果没有这种配对，接收代理将看到不完整的对话，并可能产生错误或意外行为。

下面的示例假设仅调用了切换工具（没有并行工具调用）：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
@tool
def transfer_to_sales(runtime: ToolRuntime) -> Command:
    # Get the AI message that triggered this handoff
    last_ai_message = runtime.state["messages"][-1]

    # Create an artificial tool response to complete the pair
    transfer_message = ToolMessage(
        content="Transferred to sales agent",
        tool_call_id=runtime.tool_call_id,
    )

    return Command(
        goto="sales_agent",
        update={
            "active_agent": "sales_agent",
            # Pass only these two messages, not the full subagent history
            "messages": [last_ai_message, transfer_message],
        },
        graph=Command.PARENT,
    )
```<Note>
  **为什么不传递所有子代理消息？** 虽然您可以在切换中包含完整的子代理对话，但这通常会产生问题。接收代理可能会因不相关的内部推理而感到困惑，并且令牌成本不必要地增加。通过仅传递切换对，您可以将父图的上下文集中于高级协调。如果接收代理需要其他上下文，请考虑在 ToolMessage 内容中总结子代理的工作，而不是传递原始消息历史记录。
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