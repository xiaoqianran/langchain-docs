<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build customer support with handoffs | https://docs.langchain.com/oss/python/langchain/multi-agent/handoffs-customer-support -->

# 通过交接建立客户支持

[state machine pattern](/oss/python/langchain/multi-agent/handoffs) 描述了代理的行为随着任务的不同状态而变化的工作流程。本教程展示如何通过使用工具调用来动态更改单个代理的配置（根据当前状态更新其可用工具和指令）来实现状态机。状态可以从多个来源确定：代理过去的操作（工具调用）、外部状态（例如 API 调用结果），甚至初始用户输入（例如，通过运行分类器来确定用户意图）。

在本教程中，您将构建一个执行以下操作的客户支持代理：

* 在继续操作之前收集保修信息。
* 将问题分类为硬件或软件。
* 提供解决方案或升级为人工支持。
* 在多个回合中保持对话状态。

与子代理被称为工具的[subagents pattern](/oss/python/langchain/multi-agent/subagents-personal-assistant)不同，**状态机模式**使用单个代理，其配置根据工作流程进度而变化。每个“步骤”只是同一底层代理的不同配置（系统提示+工具），根据状态动态选择。这是我们将构建的工作流程：

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#E5F4FF','primaryTextColor':'#030710','primaryBorderColor':'#006DDD','lineColor':'#40668D','secondaryColor':'#F6FFDB','tertiaryColor':'#FDF3FF'}}}%%
flowchart TD
    %% Start
    Start([💬 Customer reports<br>an issue]) --> Warranty{Is the device<br>under warranty?}

    %% Warranty check
    Warranty -->|✅ Yes| IssueType{What type<br>of issue?}
    Warranty -->|❌ No| OutOfWarranty{What type<br>of issue?}

    %% In-Warranty branch
    IssueType -->|🔩 Hardware| Repair[Provide warranty<br>repair instructions]
    IssueType -->|💻 Software| Troubleshoot[Provide troubleshooting<br>steps]

    %% Out-of-Warranty branch
    OutOfWarranty -->|🔩 Hardware| Escalate[Escalate to human<br>for paid repair options]
    OutOfWarranty -->|💻 Software| Troubleshoot

    %% Troubleshooting follow-up
    Troubleshoot --> Close([✅ Issue Resolved])
    Repair --> Close
    Escalate --> Close

    %% === Styling ===
    classDef startEnd fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef decisionNode fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef actionNode fill:#FDF3FF,stroke:#7E65AE,stroke-width:2px,color:#504B5F
    classDef escalateNode fill:#F8E8E6,stroke:#B27D75,stroke-width:2px,color:#634643

    class Start,Close startEnd
    class Warranty,IssueType,OutOfWarranty decisionNode
    class Repair,Troubleshoot actionNode
    class Escalate escalateNode
```

## 设置

### 安装

本教程需要`langchain`包：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain
  ```

  ```bash conda theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  conda install langchain -c conda-forge
  ```
</CodeGroup>

欲了解更多详情，请参阅我们的[Installation guide](/oss/python/langchain/install)。

### 朗史密斯

设置 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-multi-agent-handoffs-customer-support) 来检查代理内部发生的情况。然后设置以下环境变量：

<CodeGroup>
  ```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  export LANGSMITH_TRACING="true"
  export LANGSMITH_API_KEY="..."
  ```

  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import getpass
  import os

  os.environ["LANGSMITH_TRACING"] = "true"
  os.environ["LANGSMITH_API_KEY"] = getpass.getpass()
  ```
</CodeGroup>

### 选择法学硕士

从 LangChain 的集成套件中选择聊天模型：

<Tabs>
  <Tab title="OpenAI">
    👉 阅读[OpenAI chat model integration docs](/oss/python/integrations/chat/openai/)

    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langchain[openai]"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langchain[openai]"
      ```
    </CodeGroup>

    <CodeGroup>
      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model

      os.environ["OPENAI_API_KEY"] = "sk-..."

      model = init_chat_model("gpt-5.5")
      ```

      ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_openai import ChatOpenAI

      os.environ["OPENAI_API_KEY"] = "sk-..."

      model = ChatOpenAI(model="gpt-5.5")
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Anthropic">
    👉 阅读[Anthropic chat model integration docs](/oss/python/integrations/chat/anthropic/)

    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langchain[anthropic]"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langchain[anthropic]"
      ```
    </CodeGroup>

    <CodeGroup>
      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model

      os.environ["ANTHROPIC_API_KEY"] = "sk-..."

      model = init_chat_model("claude-sonnet-4-6")
      ```

      ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_anthropic import ChatAnthropic

      os.environ["ANTHROPIC_API_KEY"] = "sk-..."

      model = ChatAnthropic(model="claude-sonnet-4-6")
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Azure">
    👉 阅读[Azure chat model integration docs](/oss/python/integrations/chat/azure_chat_openai/)

    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langchain[openai]"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langchain[openai]"
      ```
    </CodeGroup>

    <CodeGroup>
      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model

      os.environ["AZURE_OPENAI_API_KEY"] = "..."
      os.environ["AZURE_OPENAI_ENDPOINT"] = "..."
      os.environ["OPENAI_API_VERSION"] = "2025-03-01-preview"

      model = init_chat_model(
          "azure_openai:gpt-5.5",
          azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"],
      )
      ```

      ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_openai import AzureChatOpenAI

      os.environ["AZURE_OPENAI_API_KEY"] = "..."
      os.environ["AZURE_OPENAI_ENDPOINT"] = "..."
      os.environ["OPENAI_API_VERSION"] = "2025-03-01-preview"

      model = AzureChatOpenAI(
          model="gpt-5.5",
          azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"]
      )
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Google Gemini">
    👉 阅读[Google GenAI chat model integration docs](/oss/python/integrations/chat/google_generative_ai/)

    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langchain[google-genai]"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langchain[google-genai]"
      ```
    </CodeGroup>

    <CodeGroup>
      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model

      os.environ["GOOGLE_API_KEY"] = "..."

      model = init_chat_model("google_genai:gemini-2.5-flash-lite")
      ```

      ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_google_genai import ChatGoogleGenerativeAI

      os.environ["GOOGLE_API_KEY"] = "..."

      model = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite")
      ```
    </CodeGroup>
  </Tab>

  <Tab title="AWS Bedrock">
    👉 阅读[AWS Bedrock chat model integration docs](/oss/python/integrations/chat/bedrock/)

    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langchain[aws]"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langchain[aws]"
      ```
    </CodeGroup>

    <CodeGroup>
      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from langchain.chat_models import init_chat_model

      # Follow the steps here to configure your credentials:
      # https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

      model = init_chat_model(
          "us.anthropic.claude-sonnet-4-6",
          model_provider="bedrock_converse",
      )
      ```

      ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from langchain_aws import ChatBedrock

      model = ChatBedrock(model="us.anthropic.claude-sonnet-4-6")
      ```
    </CodeGroup>
  </Tab>

  <Tab title="HuggingFace">
    👉 阅读[HuggingFace chat model integration docs](/oss/python/integrations/chat/huggingface/)

    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langchain[huggingface]"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langchain[huggingface]"
      ```
    </CodeGroup><CodeGroup>
      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model

      os.environ["HUGGINGFACEHUB_API_TOKEN"] = "hf_..."

      model = init_chat_model(
          "microsoft/Phi-3-mini-4k-instruct",
          model_provider="huggingface",
          temperature=0.7,
          max_tokens=1024,
      )
      ```

      ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint

      os.environ["HUGGINGFACEHUB_API_TOKEN"] = "hf_..."

      llm = HuggingFaceEndpoint(
          repo_id="microsoft/Phi-3-mini-4k-instruct",
          temperature=0.7,
          max_length=1024,
      )
      model = ChatHuggingFace(llm=llm)
      ```
    </CodeGroup>
  </Tab>

  <Tab title="OpenRouter">
    👉 阅读[OpenRouter chat model integration docs](/oss/python/integrations/chat/openrouter/)

    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langchain-openrouter"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langchain-openrouter"
      ```
    </CodeGroup>

    <CodeGroup>
      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model

      os.environ["OPENROUTER_API_KEY"] = "sk-..."

      model = init_chat_model(
          "auto",
          model_provider="openrouter",
      )
      ```

      ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_openrouter import ChatOpenRouter

      os.environ["OPENROUTER_API_KEY"] = "sk-..."

      model = ChatOpenRouter(model="auto")
      ```
    </CodeGroup>
  </Tab>
</Tabs>

## 1.定义自定义状态

首先，定义一个自定义状态模式来跟踪当前处于活动状态的步骤：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import AgentState
from typing_extensions import NotRequired
from typing import Literal

# Define the possible workflow steps
SupportStep = Literal["warranty_collector", "issue_classifier", "resolution_specialist"]  # [!code highlight]

class SupportState(AgentState):  # [!code highlight]
    """State for customer support workflow."""
    current_step: NotRequired[SupportStep]  # [!code highlight]
    warranty_status: NotRequired[Literal["in_warranty", "out_of_warranty"]]
    issue_type: NotRequired[Literal["hardware", "software"]]
```

`current_step` 字段是状态机模式的核心 - 它决定每轮加载哪个配置（提示+工具）。

## 2. 创建管理工作流程状态的工具

创建更新工作流程状态的工具。这些工具允许代理记录信息并过渡到下一步。

关键是使用`Command`来更新状态，包括`current_step`字段：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool, ToolRuntime
from langchain.messages import ToolMessage
from langgraph.types import Command

@tool
def record_warranty_status(
    status: Literal["in_warranty", "out_of_warranty"],
    runtime: ToolRuntime[None, SupportState],
) -> Command:  # [!code highlight]
    """Record the customer's warranty status and transition to issue classification."""
    return Command(  # [!code highlight]
        update={  # [!code highlight]
            "messages": [
                ToolMessage(
                    content=f"Warranty status recorded as: {status}",
                    tool_call_id=runtime.tool_call_id,
                )
            ],
            "warranty_status": status,
            "current_step": "issue_classifier",  # [!code highlight]
        }
    )


@tool
def record_issue_type(
    issue_type: Literal["hardware", "software"],
    runtime: ToolRuntime[None, SupportState],
) -> Command:  # [!code highlight]
    """Record the type of issue and transition to resolution specialist."""
    return Command(  # [!code highlight]
        update={  # [!code highlight]
            "messages": [
                ToolMessage(
                    content=f"Issue type recorded as: {issue_type}",
                    tool_call_id=runtime.tool_call_id,
                )
            ],
            "issue_type": issue_type,
            "current_step": "resolution_specialist",  # [!code highlight]
        }
    )


@tool
def escalate_to_human(reason: str) -> str:
    """Escalate the case to a human support specialist."""
    # In a real system, this would create a ticket, notify staff, etc.
    return f"Escalating to human support. Reason: {reason}"


@tool
def provide_solution(solution: str) -> str:
    """Provide a solution to the customer's issue."""
    return f"Solution provided: {solution}"
```

请注意`record_warranty_status`和`record_issue_type`如何返回更新数据（`warranty_status`，`issue_type`）和`current_step`的`Command`对象。这就是状态机的工作原理 - 工具控制工作流程的进展。

## 3. 定义步骤配置

为每个步骤定义提示和工具。首先，定义每个步骤的提示：

<Accordion title="View complete prompt definitions">
  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Define prompts as constants for easy reference
  WARRANTY_COLLECTOR_PROMPT = """You are a customer support agent helping with device issues.

  CURRENT STAGE: Warranty verification

  At this step, you need to:
  1. Greet the customer warmly
  2. Ask if their device is under warranty
  3. Use record_warranty_status to record their response and move to the next step

  Be conversational and friendly. Don't ask multiple questions at once."""

  ISSUE_CLASSIFIER_PROMPT = """You are a customer support agent helping with device issues.

  CURRENT STAGE: Issue classification
  CUSTOMER INFO: Warranty status is {warranty_status}

  At this step, you need to:
  1. Ask the customer to describe their issue
  2. Determine if it's a hardware issue (physical damage, broken parts) or software issue (app crashes, performance)
  3. Use record_issue_type to record the classification and move to the next step

  If unclear, ask clarifying questions before classifying."""

  RESOLUTION_SPECIALIST_PROMPT = """You are a customer support agent helping with device issues.

  CURRENT STAGE: Resolution
  CUSTOMER INFO: Warranty status is {warranty_status}, issue type is {issue_type}

  At this step, you need to:
  1. For SOFTWARE issues: provide troubleshooting steps using provide_solution
  2. For HARDWARE issues:
     - If IN WARRANTY: explain warranty repair process using provide_solution
     - If OUT OF WARRANTY: escalate_to_human for paid repair options

  Be specific and helpful in your solutions."""
  ```
</Accordion>

然后使用字典将步骤名称映射到其配置：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Step configuration: maps step name to (prompt, tools, required_state)
STEP_CONFIG = {
    "warranty_collector": {
        "prompt": WARRANTY_COLLECTOR_PROMPT,
        "tools": [record_warranty_status],
        "requires": [],
    },
    "issue_classifier": {
        "prompt": ISSUE_CLASSIFIER_PROMPT,
        "tools": [record_issue_type],
        "requires": ["warranty_status"],
    },
    "resolution_specialist": {
        "prompt": RESOLUTION_SPECIALIST_PROMPT,
        "tools": [provide_solution, escalate_to_human],
        "requires": ["warranty_status", "issue_type"],
    },
}
```

这种基于字典的配置可以轻松地：* 所有步骤一目了然
* 添加新步骤（只需添加另一个条目）
* 了解工作流依赖关系（`requires`字段）
* 使用带有状态变量的提示模板（例如，`{warranty_status}`）

## 4. 创建基于步骤的中间件

创建从状态读取`current_step`并应用适当配置的中间件。我们将使用 `@wrap_model_call` 装饰器来实现干净的实现：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
from typing import Callable


@wrap_model_call  # [!code highlight]
def apply_step_config(
    request: ModelRequest,
    handler: Callable[[ModelRequest], ModelResponse],
) -> ModelResponse:
    """Configure agent behavior based on the current step."""
    # Get current step (defaults to warranty_collector for first interaction)
    current_step = request.state.get("current_step", "warranty_collector")  # [!code highlight]

    # Look up step configuration
    stage_config = STEP_CONFIG[current_step]  # [!code highlight]

    # Validate required state exists
    for key in stage_config["requires"]:
        if request.state.get(key) is None:
            raise ValueError(f"{key} must be set before reaching {current_step}")

    # Format prompt with state values (supports {warranty_status}, {issue_type}, etc.)
    system_prompt = stage_config["prompt"].format(**request.state)

    # Inject system prompt and step-specific tools
    request = request.override(  # [!code highlight]
        system_prompt=system_prompt,  # [!code highlight]
        tools=stage_config["tools"],  # [!code highlight]
    )

    return handler(request)
```

这个中间件：

1. **读取当前步骤**：从状态获取`current_step`（默认为“warranty\_collector”）。
2. **查找配置**：在`STEP_CONFIG`中查找匹配条目。
3. **验证依赖关系**：确保所需的状态字段存在。
4. **格式化提示**：将状态值注入到提示模板中。
5. **应用配置**：覆盖系统提示和可用工具。

`request.override()` 方法是关键 - 它允许我们根据状态动态更改代理的行为，而无需创建单独的代理实例。

## 5. 创建代理

现在使用基于步骤的中间件和用于状态持久性的检查指针创建代理：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

# Collect all tools from all step configurations
all_tools = [
    record_warranty_status,
    record_issue_type,
    provide_solution,
    escalate_to_human,
]

# Create the agent with step-based configuration
agent = create_agent(
    model,
    tools=all_tools,
    state_schema=SupportState,  # [!code highlight]
    middleware=[apply_step_config],  # [!code highlight]
    checkpointer=InMemorySaver(),  # [!code highlight]
)
```<Note>
  **为什么需要检查点？** 检查点在对话轮次中维护状态。如果没有它，`current_step` 状态将在用户消息之间丢失，从而破坏工作流程。
</Note>

## 6. 测试工作流程

测试完整的工作流程：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import HumanMessage
from langchain_core.utils.uuid import uuid7

# Configuration for this conversation thread
thread_id = str(uuid7())
config = {"configurable": {"thread_id": thread_id}}

# Turn 1: Initial message - starts with warranty_collector step
print("=== Turn 1: Warranty Collection ===")
result = agent.invoke(
    {"messages": [HumanMessage("Hi, my phone screen is cracked")]},
    config
)
for msg in result['messages']:
    msg.pretty_print()

# Turn 2: User responds about warranty
print("\n=== Turn 2: Warranty Response ===")
result = agent.invoke(
    {"messages": [HumanMessage("Yes, it's still under warranty")]},
    config
)
for msg in result['messages']:
    msg.pretty_print()
print(f"Current step: {result.get('current_step')}")

# Turn 3: User describes the issue
print("\n=== Turn 3: Issue Description ===")
result = agent.invoke(
    {"messages": [HumanMessage("The screen is physically cracked from dropping it")]},
    config
)
for msg in result['messages']:
    msg.pretty_print()
print(f"Current step: {result.get('current_step')}")

# Turn 4: Resolution
print("\n=== Turn 4: Resolution ===")
result = agent.invoke(
    {"messages": [HumanMessage("What should I do?")]},
    config
)
for msg in result['messages']:
    msg.pretty_print()
```

预期流量：

1. **保修验证步骤**：询问保修状态
2. **问题分类步骤**：询问问题，确定其硬件
3. **解决步骤**：提供保修维修说明

## 7. 理解状态转换

让我们追踪一下每个回合会发生什么：

### 第 1 回合：初始消息

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
    "messages": [HumanMessage("Hi, my phone screen is cracked")],
    "current_step": "warranty_collector"  # Default value
}
```

中间件适用：

* 系统提示：`WARRANTY_COLLECTOR_PROMPT`
* 工具：`[record_warranty_status]`

### 第 2 回合：保修后记录

工具调用：`record_warranty_status("in_warranty")`返回：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Command(update={
    "warranty_status": "in_warranty",
    "current_step": "issue_classifier"  # State transition!
})
```

下一步，中间件适用：

* 系统提示：`ISSUE_CLASSIFIER_PROMPT`（格式化为`warranty_status="in_warranty"`）
* 工具：`[record_issue_type]`

### 第 3 回合：问题分类后

工具调用：`record_issue_type("hardware")`返回：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Command(update={
    "issue_type": "hardware",
    "current_step": "resolution_specialist"  # State transition!
})
```

下一步，中间件适用：

* 系统提示：`RESOLUTION_SPECIALIST_PROMPT`（格式为`warranty_status`和`issue_type`）
* 工具：`[provide_solution, escalate_to_human]`

关键见解：**工具通过更新`current_step`来驱动工作流程**，而**中间件通过在下一轮应用适当的配置来响应**。

## 8.管理消息历史记录随着代理逐步推进，消息历史记录也会增长。使用 [summarization middleware](/oss/python/langchain/short-term-memory#summarize-messages) 压缩早期消息，同时保留对话上下文：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware  # [!code highlight]
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    model,
    tools=all_tools,
    state_schema=SupportState,
    middleware=[
        apply_step_config,
        SummarizationMiddleware(  # [!code highlight]
            model="gpt-5.4-mini",
            trigger=("tokens", 4000),
            keep=("messages", 10)
        )
    ],
    checkpointer=InMemorySaver(),
)
```

有关其他内存管理技术，请参阅[short-term memory guide](/oss/python/langchain/short-term-memory)。

## 9. 增加灵活性：返回

某些工作流程需要允许用户返回到之前的步骤以更正信息（例如，更改保修状态或问题分类）。然而，并非所有转换都有意义，例如，一旦退款处理完成，您通常就无法返回。对于此支持工作流程，我们将添加工具以返回保修验证和问题分类步骤。

<Tip>
  如果您的工作流程需要在大多数步骤之间进行任意转换，请考虑您是否需要结构化工作流程。当步骤遵循清晰的顺序进展并偶尔向后过渡以进行修正时，此模式效果最佳。
</Tip>

在解决步骤中添加“返回”工具：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
@tool
def go_back_to_warranty() -> Command:  # [!code highlight]
    """Go back to warranty verification step."""
    return Command(update={"current_step": "warranty_collector"})  # [!code highlight]


@tool
def go_back_to_classification() -> Command:  # [!code highlight]
    """Go back to issue classification step."""
    return Command(update={"current_step": "issue_classifier"})  # [!code highlight]


# Update the resolution_specialist configuration to include these tools
STEP_CONFIG["resolution_specialist"]["tools"].extend([
    go_back_to_warranty,
    go_back_to_classification
])
```

更新解决专家的提示以提及这些工具：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
RESOLUTION_SPECIALIST_PROMPT = """You are a customer support agent helping with device issues.

CURRENT STAGE: Resolution
CUSTOMER INFO: Warranty status is {warranty_status}, issue type is {issue_type}

At this step, you need to:
1. For SOFTWARE issues: provide troubleshooting steps using provide_solution
2. For HARDWARE issues:
   - If IN WARRANTY: explain warranty repair process using provide_solution
   - If OUT OF WARRANTY: escalate_to_human for paid repair options

If the customer indicates any information was wrong, use:
- go_back_to_warranty to correct warranty status
- go_back_to_classification to correct issue type

Be specific and helpful in your solutions."""
```

现在代理可以处理更正：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
result = agent.invoke(
    {"messages": [HumanMessage("Actually, I made a mistake - my device is out of warranty")]},
    config
)
# Agent will call go_back_to_warranty and restart the warranty verification step
```

## 完整示例

以下是可运行脚本中的所有内容：

<Expandable title="Complete code">
  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  """
  Customer Support State Machine Example

  This example demonstrates the state machine pattern.
  A single agent dynamically changes its behavior based on the current_step state,
  creating a state machine for sequential information collection.
  """

  from langchain_core.utils.uuid import uuid7

  from langgraph.checkpoint.memory import InMemorySaver
  from langgraph.types import Command
  from typing import Callable, Literal
  from typing_extensions import NotRequired

  from langchain.agents import AgentState, create_agent
  from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse, SummarizationMiddleware
  from langchain.chat_models import init_chat_model
  from langchain.messages import HumanMessage, ToolMessage
  from langchain.tools import tool, ToolRuntime

  model = init_chat_model("google_genai:gemini-3.6-flash")


  # Define the possible workflow steps
  SupportStep = Literal["warranty_collector", "issue_classifier", "resolution_specialist"]


  class SupportState(AgentState):
      """State for customer support workflow."""

      current_step: NotRequired[SupportStep]
      warranty_status: NotRequired[Literal["in_warranty", "out_of_warranty"]]
      issue_type: NotRequired[Literal["hardware", "software"]]


  @tool
  def record_warranty_status(
      status: Literal["in_warranty", "out_of_warranty"],
      runtime: ToolRuntime[None, SupportState],
  ) -> Command:
      """Record the customer's warranty status and transition to issue classification."""
      return Command(
          update={
              "messages": [
                  ToolMessage(
                      content=f"Warranty status recorded as: {status}",
                      tool_call_id=runtime.tool_call_id,
                  )
              ],
              "warranty_status": status,
              "current_step": "issue_classifier",
          }
      )


  @tool
  def record_issue_type(
      issue_type: Literal["hardware", "software"],
      runtime: ToolRuntime[None, SupportState],
  ) -> Command:
      """Record the type of issue and transition to resolution specialist."""
      return Command(
          update={
              "messages": [
                  ToolMessage(
                      content=f"Issue type recorded as: {issue_type}",
                      tool_call_id=runtime.tool_call_id,
                  )
              ],
              "issue_type": issue_type,
              "current_step": "resolution_specialist",
          }
      )


  @tool
  def escalate_to_human(reason: str) -> str:
      """Escalate the case to a human support specialist."""
      # In a real system, this would create a ticket, notify staff, etc.
      return f"Escalating to human support. Reason: {reason}"


  @tool
  def provide_solution(solution: str) -> str:
      """Provide a solution to the customer's issue."""
      return f"Solution provided: {solution}"


  # Define prompts as constants
  WARRANTY_COLLECTOR_PROMPT = """You are a customer support agent helping with device issues.

  CURRENT STEP: Warranty verification

  At this step, you need to:
  1. Greet the customer warmly
  2. Ask if their device is under warranty
  3. Use record_warranty_status to record their response and move to the next step

  Be conversational and friendly. Don't ask multiple questions at once."""

  ISSUE_CLASSIFIER_PROMPT = """You are a customer support agent helping with device issues.

  CURRENT STEP: Issue classification
  CUSTOMER INFO: Warranty status is {warranty_status}

  At this step, you need to:
  1. Ask the customer to describe their issue
  2. Determine if it's a hardware issue (physical damage, broken parts) or software issue (app crashes, performance)
  3. Use record_issue_type to record the classification and move to the next step

  If unclear, ask clarifying questions before classifying."""

  RESOLUTION_SPECIALIST_PROMPT = """You are a customer support agent helping with device issues.

  CURRENT STEP: Resolution
  CUSTOMER INFO: Warranty status is {warranty_status}, issue type is {issue_type}

  At this step, you need to:
  1. For SOFTWARE issues: provide troubleshooting steps using provide_solution
  2. For HARDWARE issues:
     - If IN WARRANTY: explain warranty repair process using provide_solution
     - If OUT OF WARRANTY: escalate_to_human for paid repair options

  Be specific and helpful in your solutions."""


  # Step configuration: maps step name to (prompt, tools, required_state)
  STEP_CONFIG = {
      "warranty_collector": {
          "prompt": WARRANTY_COLLECTOR_PROMPT,
          "tools": [record_warranty_status],
          "requires": [],
      },
      "issue_classifier": {
          "prompt": ISSUE_CLASSIFIER_PROMPT,
          "tools": [record_issue_type],
          "requires": ["warranty_status"],
      },
      "resolution_specialist": {
          "prompt": RESOLUTION_SPECIALIST_PROMPT,
          "tools": [provide_solution, escalate_to_human],
          "requires": ["warranty_status", "issue_type"],
      },
  }


  @wrap_model_call
  def apply_step_config(
      request: ModelRequest,
      handler: Callable[[ModelRequest], ModelResponse],
  ) -> ModelResponse:
      """Configure agent behavior based on the current step."""
      # Get current step (defaults to warranty_collector for first interaction)
      current_step = request.state.get("current_step", "warranty_collector")

      # Look up step configuration
      step_config = STEP_CONFIG[current_step]

      # Validate required state exists
      for key in step_config["requires"]:
          if request.state.get(key) is None:
              raise ValueError(f"{key} must be set before reaching {current_step}")

      # Format prompt with state values
      system_prompt = step_config["prompt"].format(**request.state)

      # Inject system prompt and step-specific tools
      request = request.override(
          system_prompt=system_prompt,
          tools=step_config["tools"],
      )

      return handler(request)


  # Collect all tools from all step configurations
  all_tools = [
      record_warranty_status,
      record_issue_type,
      provide_solution,
      escalate_to_human,
  ]

  # Create the agent with step-based configuration and summarization
  agent = create_agent(
      model,
      tools=all_tools,
      state_schema=SupportState,
      middleware=[
          apply_step_config,
          SummarizationMiddleware(
              model="gpt-5.4-mini",
              trigger=("tokens", 4000),
              keep=("messages", 10)
          )
      ],
      checkpointer=InMemorySaver(),
  )


  # ============================================================================
  # Test the workflow
  # ============================================================================

  if __name__ == "__main__":
      thread_id = str(uuid7())
      config = {"configurable": {"thread_id": thread_id}}

      result = agent.invoke(
          {"messages": [HumanMessage("Hi, my phone screen is cracked")]},
          config
      )

      result = agent.invoke(
          {"messages": [HumanMessage("Yes, it's still under warranty")]},
          config
      )

      result = agent.invoke(
          {"messages": [HumanMessage("The screen is physically cracked from dropping it")]},
          config
      )

      result = agent.invoke(
          {"messages": [HumanMessage("What should I do?")]},
          config
      )
      for msg in result['messages']:
          msg.pretty_print()
  ```
</Expandable>

## 后续步骤* 了解用于集中编排的[subagents pattern](/oss/python/langchain/multi-agent/subagents-personal-assistant)
* 探索[middleware](/oss/python/langchain/middleware)以获得更多动态行为
* 阅读[multi-agent overview](/oss/python/langchain/multi-agent)来比较模式
* 使用[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-multi-agent-handoffs-customer-support)调试和监控您的多代理系统

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/multi-agent/handoffs-customer-support.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>