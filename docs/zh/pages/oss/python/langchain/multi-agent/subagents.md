<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Subagents | https://docs.langchain.com/oss/python/langchain/multi-agent/subagents -->

# 子代理

在**子代理**架构中，中央主[agent](/oss/python/langchain/agents)（通常称为**主管**）通过将子代理称为[tools](/oss/python/langchain/tools)来协调子代理。主代理决定调用哪个子代理、提供什么输入以及如何组合结果。子代理是无状态的——它们不记得过去的交互，所有对话记忆都由主代理维护。这提供了[context](/oss/python/langchain/context-engineering)隔离：每个子代理调用都在一个干净的上下文窗口中工作，防止主对话中的上下文膨胀。

有关内置子代理支持，请参阅[Deep Agents](/oss/python/deepagents/subagents)。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    A[User] --> B[Main Agent]
    B --> C[Subagent A]
    B --> D[Subagent B]
    B --> E[Subagent C]
    C --> B
    D --> B
    E --> B
    B --> F[User response]

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710

    class A,F trigger
    class B,C,D,E process
```

## 主要特征

* 集中控制：所有路由均经过主代理
* 无直接用户交互：子代理将结果返回给主代理，而不是用户（尽管您可以在子代理中使用 [interrupts](/oss/python/langgraph/interrupts#pause-using-interrupt) 来允许用户交互）
* Subagents via tools：子代理通过工具调用
* 并行执行：主代理可以单轮调用多个子代理<Note>
  **Supervisor 与 Router**：Supervisor 代理（此模式）与 [router](/oss/python/langchain/multi-agent/router) 不同。主管是一个完整的代理，它维护对话上下文并动态决定在多个回合中调用哪些子代理。路由器通常是一个单一的分类步骤，它向代理进行分派，而不维护正在进行的对话状态。
</Note>

## 何时使用

当您有多个不同的域（例如，日历、电子邮件、CRM、数据库）、子代理不需要直接与用户对话，或者您需要集中式工作流控制时，请使用子代理模式。对于只有几个 [tools](/oss/python/langchain/tools) 的简单情况，请使用 [single agent](/oss/python/langchain/agents)。

<Tip>
  **需要在子代理中进行用户交互？** 虽然子代理通常将结果返回给主代理而不是直接与用户对话，但您可以在子代理中使用 [interrupts](/oss/python/langgraph/interrupts#pause-using-interrupt) 来暂停执行并收集用户输入。当子代理在继续操作之前需要澄清或批准时，这非常有用。主代理仍然是协调器，但子代理可以从用户中间任务收集信息。
</Tip>

## 基本实现

核心机制将子代理包装为主代理可以调用的工具：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool
from langchain.agents import create_agent

# Create a subagent
subagent = create_agent(model="google_genai:gemini-3.6-flash", tools=[...])

# Wrap it as a tool
@tool("research", description="Research a topic and return findings")
def call_research_agent(query: str):
    result = subagent.invoke({"messages": [{"role": "user", "content": query}]})
    return result["messages"][-1].content

# Main agent with subagent as a tool
main_agent = create_agent(model="google_genai:gemini-3.6-flash", tools=[call_research_agent])
```<Card title="Tutorial: Build a personal assistant with subagents" icon="sitemap" href="/oss/python/langchain/multi-agent/subagents-personal-assistant">
  了解如何使用子代理模式构建个人助理，其中中央主代理（主管）协调专门的工作代理。
</Card>

## 设计决策

实现子代理模式时，您将做出几个关键的设计选择。该表总结了这些选项 - 每个选项都在下面的部分中详细介绍。

|决定|选项|
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [**Sync vs. async**](#sync-vs-async) |同步（阻塞）与异步（后台）|
| [**Tool patterns**](#tool-patterns) |每个代理使用的工具与单个调度工具|
| [**Subagent specs**](#subagent-specs) |系统提示与枚举约束与基于工具的发现（仅限单个调度工具）|
| [**Subagent inputs**](#subagent-inputs) |仅查询与完整上下文 |
| [**Subagent outputs**](#subagent-outputs) |子代理结果与完整对话历史记录 |

## 同步与异步子代理执行可以是**同步**（阻塞）或**异步**（后台）。您的选择取决于主代理是否需要结果才能继续。

|模式|主要代理行为|最适合 |权衡 |
| ---------| ------------------------------------------- | -------------------------------------- | ----------------------------------- |
| **同步** |等待子代理完成 |主代理需要结果才能继续 |简单，但阻碍对话 |
| **异步** |子代理在后台运行时继续 |独立任务，用户无需等待 |反应灵敏，但更复杂 |

<Tip>
  不要与 Python 的 `async`/`await` 混淆。这里，“异步”意味着主代理启动后台作业（通常在单独的进程或服务中）并继续而不阻塞。
</Tip>

### 同步（默认）

默认情况下，子代理调用是**同步**：主代理在继续之前等待每个子代理完成。当主代理的下一步操作取决于子代理的结果时，请使用同步。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sequenceDiagram
    participant User
    participant Main Agent
    participant Research Subagent

    User->>Main Agent: "What's the weather in Tokyo?"
    Main Agent->>Research Subagent: research("Tokyo weather")
    Note over Main Agent: Waiting for result...
    Research Subagent-->>Main Agent: "Currently 72°F, sunny"
    Main Agent-->>User: "It's 72°F and sunny in Tokyo"
```

**何时使用同步：*** 主代理需要子代理的结果来制定其响应
* 任务具有顺序依赖性（例如，获取数据→分析→响应）
* 子代理故障应阻止主代理的响应

**权衡：**

* 实现简单——只需调用并等待
* 在所有子代理完成之前，用户看不到任何响应
* 长时间运行的任务会冻结对话

### 异步

当子代理的工作是独立的时，使用**异步执行** - 主代理不需要结果来继续与用户对话。主代理启动后台工作并保持响应。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sequenceDiagram
    participant User
    participant Main Agent
    participant Job System
    participant Contract Reviewer

    User->>Main Agent: "Review this M&A contract"
    Main Agent->>Job System: run_agent("legal_reviewer", task)
    Job System->>Contract Reviewer: Start agent
    Job System-->>Main Agent: job_id: "job_123"
    Main Agent-->>User: "Started review (job_123)"

    Note over Contract Reviewer: Reviewing 150+ pages...

    User->>Main Agent: "What's the status?"
    Main Agent->>Job System: check_status(job_id)
    Job System-->>Main Agent: "running"
    Main Agent-->>User: "Still reviewing contract..."

    Note over Contract Reviewer: Review completes

    User->>Main Agent: "Is it done yet?"
    Main Agent->>Job System: check_status(job_id)
    Job System-->>Main Agent: "completed"
    Main Agent->>Job System: get_result(job_id)
    Job System-->>Main Agent: Contract analysis
    Main Agent-->>User: "Review complete: [findings]"
```

**何时使用异步：**

* 子代理的工作独立于主对话流程
* 用户应该能够在工作时继续聊天
* 你想要并行运行多个独立的任务

**三工具模式：**

1. **启动作业**：启动后台任务，返回作业ID
2. **检查状态**：返回当前状态（待处理、正在运行、已完成、失败）
3. **获取结果**：检索完成的结果**处理作业完成：** 当作业完成时，您的应用程序需要通知用户。一种方法：显示一条通知，单击该通知后，会发送一个 `HumanMessage`，例如“检查作业\_123 并总结结果”。

## 工具模式

将子代理公开为工具有两种主要方法：

|图案|最适合 |权衡|
| ------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------- |
| [**Tool per agent**](#tool-per-agent) |对每个子代理的输入/输出的细粒度控制更多设置，更多定制 |
| [**Single dispatch tool**](#single-dispatch-tool) |多个代理、分布式团队、约定优于配置 |更简单的组合，更少的每个代理定制 |

### 每个代理的工具

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    A[User] --> B[Main Agent]
    B --> C[Subagent A]
    B --> D[Subagent B]
    B --> E[Subagent C]
    C --> B
    D --> B
    E --> B
    B --> F[User response]

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710

    class A,F trigger
    class B,C,D,E process
```

关键思想是将子代理包装为主代理可以调用的工具：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool
from langchain.agents import create_agent

# Create a sub-agent
subagent = create_agent(model="...", tools=[...])  # [!code highlight]

# Wrap it as a tool  # [!code highlight]
@tool("subagent_name", description="subagent_description")  # [!code highlight]
def call_subagent(query: str):  # [!code highlight]
    result = subagent.invoke({"messages": [{"role": "user", "content": query}]})
    return result["messages"][-1].content

# Main agent with subagent as a tool  # [!code highlight]
main_agent = create_agent(model="...", tools=[call_subagent])  # [!code highlight]
```

当主代理确定任务与子代理的描述匹配、接收结果并继续编排时，它会调用子代理工具。有关细粒度控制，请参阅[Context engineering](#context-engineering)。### 单一调度工具

另一种方法使用单个参数化工具来调用临时子代理来执行独立任务。与每个子代理包装为单独工具的 [tool per agent](#tool-per-agent) 方法不同，该方法使用基于约定的方法和单个 `task` 工具：任务描述作为人工消息传递给子代理，子代理的最终消息作为工具结果返回。

当您想要在多个团队之间分配代理开发、需要将复杂的任务隔离到单独的上下文窗口中、需要一种可扩展的方式来添加新代理而不修改协调器，或者更喜欢约定而不是自定义时，请使用此方法。这种方法牺牲了上下文工程的灵活性，换取了代理组成的简单性和强大的上下文隔离。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    A[User] --> B[Main Agent]
    B --> C{task<br/>agent_name, description}
    C -->|research| D[Research Agent]
    C -->|writer| E[Writer Agent]
    C -->|reviewer| F[Reviewer Agent]
    D --> C
    E --> C
    F --> C
    C --> B
    B --> G[User response]

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef decision fill:#FDF3FF,stroke:#7E65AE,stroke-width:2px,color:#504B5F

    class A,G trigger
    class B,D,E,F process
    class C decision
```

**主要特征：*** 单任务工具：一种参数化工具，可以通过名称调用任何已注册的子代理
* 基于约定的调用：按名称选择代理，将任务作为人工消息传递，最终消息作为工具结果返回
* 团队分布：不同团队可以独立开发和部署代理
* 代理发现：可以通过系统提示（列出可用代理）或通过[progressive disclosure](/oss/python/langchain/multi-agent/skills-sql-assistant)（通过工具按需加载代理信息）发现子代理

<Tip>
  这种方法的一个有趣的方面是子代理可能具有与主代理完全相同的功能。在这种情况下，调用子代理**实际上与上下文隔离**是主要原因 - 允许复杂的多步骤任务在隔离的上下文窗口中运行，而不会增加主代理的对话历史记录。子代理自主完成工作，仅返回简洁的摘要，保持主线程的专注和高效。
</Tip>

<Accordion title="Agent registry with task dispatcher">
  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.tools import tool
  from langchain.agents import create_agent

  # Sub-agents developed by different teams
  research_agent = create_agent(
      model="gpt-5.5",
      prompt="You are a research specialist..."
  )

  writer_agent = create_agent(
      model="gpt-5.5",
      prompt="You are a writing specialist..."
  )

  # Registry of available sub-agents
  SUBAGENTS = {
      "research": research_agent,
      "writer": writer_agent,
  }

  @tool
  def task(
      agent_name: str,
      description: str
  ) -> str:
      """Launch an ephemeral subagent for a task.

      Available agents:
      - research: Research and fact-finding
      - writer: Content creation and editing
      """
      agent = SUBAGENTS[agent_name]
      result = agent.invoke({
          "messages": [
              {"role": "user", "content": description}
          ]
      })
      return result["messages"][-1].content

  # Main coordinator agent
  main_agent = create_agent(
      model="gpt-5.5",
      tools=[task],
      system_prompt=(
          "You coordinate specialized sub-agents. "
          "Available: research (fact-finding), "
          "writer (content creation). "
          "Use the task tool to delegate work."
      ),
  )
  ```
</Accordion>

## 上下文工程

控制上下文在主代理与其子代理之间的流动方式：|类别 |目的|影响 |
| ---------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------- |
| [**Subagent specs**](#subagent-specs) |确保子代理在应该的时候被调用 |主代理路由决策|
| [**Subagent inputs**](#subagent-inputs) |确保子代理可以在优化的上下文中良好执行 |分代理业绩|
| [**Subagent outputs**](#subagent-outputs) |确保主管可以根据子代理结果采取行动 |主要代理业绩 |

另请参阅我们针对代理商的[context engineering](/oss/python/langchain/context-engineering)综合指南。

### 子代理规格

与子代理关联的**名称**和**描述**是主代理了解要调用哪些子代理的主要方式。这些都是激励杠杆——仔细选择它们。

* **名称**：主代理如何称呼子代理。保持清晰且以行动为导向（例如，`research_agent`、`code_reviewer`）。
* **描述**：主代理对子代理功能的了解。具体说明它处理什么任务以及何时使用它。对于 [single dispatch tool](#single-dispatch-tool) 设计，您还必须向主代理提供有关它可以调用的子代理的信息。
您可以根据代理的数量以及您的注册表是静态还是动态，以不同的方式提供此信息：

|方法|最适合 |权衡 |
| -------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| **系统提示枚举** |小型静态代理列表 (\< 10 agents) | Simple, but requires prompt updates when agents change               |
| **Enum constraint**           | Small, static agent lists (\< 10 agents) | Type-safe and explicit, but requires code changes when agents change |
| **Tool-based discovery**      | Large or dynamic agent registries        | Flexible and scalable, but adds complexity                           |

#### System prompt enumeration

List available agents directly in the main agent's system prompt. The main agent sees the list of agents and their descriptions as part of its instructions.

**When to use:**

* You have a small, fixed set of agents (\< 10)
* Agent registry rarely changes
* You want the simplest implementation

**Example:**

⟦T8⟧

#### Enum constraint on dispatch tool

Add an enum constraint to the ⟦T19⟧ parameter in your dispatch tool. This provides type safety and makes available agents explicit in the tool schema.

**When to use:**

* You have a small, fixed set of agents (\< 10)
* You want type safety and explicit agent names
* You prefer schema-based validation over prompt-based guidance

**Example:**

⟦T9⟧

#### Tool-based discovery

Provide a separate tool (e.g., ⟦T20⟧ or ⟦T21⟧) that the main agent can call to discover available agents on-demand. This enables progressive disclosure and supports dynamic registries.

**When to use:**

* You have many agents (> 10) 或不断增长的注册表
* 代理注册表经常更改或者是动态的
* 您想要减少提示大小和令牌使用
* 不同团队独立管理不同代理

**示例：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
@tool
def list_agents(query: str = "") -> str:
    """List available subagents, optionally filtered by query."""
    agents = search_agent_registry(query)
    return format_agent_list(agents)

@tool
def task(agent_name: str, description: str) -> str:
    """Launch an ephemeral subagent for a task."""
    # ...

main_agent = create_agent(
    model="...",
    tools=[task, list_agents],
    system_prompt="Use list_agents to discover available subagents, then use task to invoke them."
)
```

### 子代理输入

自定义子代理接收的上下文来执行其任务。通过从代理的状态中提取，添加无法在静态提示中捕获的输入（完整消息历史记录、先前结果或任务元数据）。

```python Subagent inputs example expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import AgentState
from langchain.tools import tool, ToolRuntime

class CustomState(AgentState):
    example_state_key: str

@tool(
    "subagent1_name",
    description="subagent1_description"
)
def call_subagent1(query: str, runtime: ToolRuntime[None, CustomState]):
    # Apply any logic needed to transform the messages into a suitable input
    subagent_input = some_logic(query, runtime.state["messages"])
    result = subagent1.invoke({
        "messages": subagent_input,
        # You could also pass other state keys here as needed.
        # Make sure to define these in both the main and subagent's
        # state schemas.
        "example_state_key": runtime.state["example_state_key"]
    })
    return result["messages"][-1].content
```

### 子代理输出

自定义主代理收到的返回内容，以便它可以做出正确的决策。两种策略：1. **提示子代理**：准确指定应返回的内容。一种常见的失败模式是子代理执行工具调用或推理，但在其最终消息中不包含结果 - 提醒它主管只能看到最终输出。
2. **代码格式**：在返回响应之前调整或丰富响应。例如，使用 [⟦T22⟧](/oss/python/langgraph/graph-api#command) 除了最终文本之外还传递回特定状态键。

```python Subagent outputs example expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import Annotated
from langchain.agents import AgentState
from langchain.tools import InjectedToolCallId
from langgraph.types import Command


@tool(
    "subagent1_name",
    description="subagent1_description"
)
def call_subagent1(
    query: str,
    tool_call_id: Annotated[str, InjectedToolCallId],
) -> Command:
    result = subagent1.invoke({
        "messages": [{"role": "user", "content": query}]
    })
    return Command(update={
        # Pass back additional state from the subagent
        "example_state_key": result["example_state_key"],
        "messages": [
            ToolMessage(
                content=result["messages"][-1].content,
                tool_call_id=tool_call_id
            )
        ]
    })
```

## 检查点和状态检查

默认情况下，子代理使用 **继承的检查点** 模式 - 每个调用都以新鲜状态开始，支持[interrupts](/oss/python/langgraph/interrupts#pause-using-interrupt)，并且安全地并行运行。如果您需要子代理在调用之间维护其自己的持久对话历史记录，请使用`checkpointer=True`（连续模式）进行编译。有关模式的完整比较，请参阅[subgraph persistence](/oss/python/langgraph/use-subgraphs#subgraph-persistence)。

因为子代理是在工具函数内部调用的，所以 LangGraph 无法[statically discover](/oss/python/langgraph/use-subgraphs#view-subgraph-state) 它们。这意味着[⟦T24⟧ with ⟦T25⟧](/oss/python/langgraph/use-subgraphs#view-subgraph-state)不会返回子代理状态。如果您需要读取嵌套图状态（例如，在 [interrupt](/oss/python/langgraph/interrupts#pause-using-interrupt) 期间），请从自定义图中的 [node function](/oss/python/langgraph/use-subgraphs#call-a-subgraph-inside-a-node) 调用子代理。有关每种模式如何影响状态可见性的详细信息，请参阅[subgraph persistence](/oss/python/langgraph/use-subgraphs#subgraph-persistence)。<Card title="Migrate from langgraph-supervisor" icon="arrow-right" href="/oss/python/migrate/langgraph-supervisor">
  langgraph-supervisor 包不再主动维护。了解如何从 create\_supervisor 迁移到子代理模式，包括使用外部 API 回调中断和恢复流程。
</Card>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/multi-agent/subagents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>