<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Context engineering in agents | https://docs.langchain.com/oss/python/langchain/context-engineering -->

## 概述

构建代理（或任何法学硕士申请）的困难部分是使它们足够可靠。虽然它们可能适用于原型，但在现实用例中经常会失败。

### 为什么代理会失败？

当代理失败时，通常是因为代理内部的 LLM 调用采取了错误的操作/没有执行我们预期的操作。法学硕士因以下两个原因之一失败：

1. 底层LLM能力不够
2.“正确”的背景没有传递给法学硕士

通常情况下，这实际上是导致代理商不可靠的第二个原因。

**背景工程**是以正确的格式提供正确的信息和工具，以便法学硕士能够完成任务。这是人工智能工程师的首要工作。缺乏“正确”的上下文是更可靠代理的首要障碍，而 LangChain 的代理抽象经过独特设计，可以促进上下文工程。

<Tip>
  环境工程新手？从[conceptual overview](/oss/python/concepts/context)开始了解不同类型的上下文以及何时使用它们。
</Tip>

### 代理循环

典型的代理循环由两个主要步骤组成：1. **模型调用** - 使用提示和可用工具调用 LLM，返回响应或执行工具的请求
2. **工具执行** - 执行LLM请求的工具，返回工具结果

<div>
  <img alt="Core agent loop diagram" />
</div>

这个循环一直持续到法学硕士决定结束。

### 你可以控制什么

要构建可靠的代理，您需要控制代理循环的每个步骤以及步骤之间发生的情况。

|上下文类型 |你控制什么 |短暂或持续|
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------- |
| **[Model Context](#model-context)** |模型调用的内容（说明、消息历史记录、工具、响应格式）|瞬态|
| **[Tool Context](#tool-context)** |哪些工具可以访问和生成（读/写状态、存储、运行时上下文）|坚持不懈|
| **[Life-cycle Context](#life-cycle-context)** |模型和工具调用之间会发生什么（摘要、护栏、日志记录等）|坚持不懈|<CardGroup>
  <Card title="Transient context" icon="bolt">
    法学硕士在一次通话中看到了什么。您可以修改消息、工具或提示，而无需更改状态中保存的内容。
  </Card>

  <Card title="Persistent context" icon="database">
    各个回合中状态中保存的内容。生命周期挂钩和工具写入会永久修改这一点。
  </Card>
</CardGroup>

### 数据来源

在整个过程中，您的代理访问（读取/写入）不同的数据源：

|数据来源|也称为|范围 |示例 |
| ------------------- | -------------------- | ------------------- | -------------------------------------------------------------------------------------- |
| **运行时上下文** |静态配置|对话范围 |用户 ID、API 密钥、数据库连接、权限、环境设置 |
| **状态** |短期记忆 |对话范围 |当前消息、上传的文件、身份验证状态、工具结果 |
| **商店** |长期记忆 |交叉对话 |用户偏好、提取的见解、记忆、历史数据 |

### 它是如何工作的LangChain [middleware](/oss/python/langchain/middleware) 是一种底层机制，使上下文工程对于使用 LangChain 的开发人员来说变得实用。

中间件允许您连接到代理生命周期中的任何步骤，并且：

* 更新上下文
* 跳转到代理生命周期的不同步骤

在本指南中，您将看到频繁使用中间件 API 作为上下文工程端的手段。

## 模型上下文

控制每个模型调用的内容 - 指令、可用工具、使用哪个模型以及输出格式。这些决策直接影响可靠性和成本。

<CardGroup>
  <Card title="System Prompt" icon="message-2" href="#system-prompt">
    开发人员向法学硕士发出的基本指示。
  </Card>

  <Card title="Messages" icon="messages" href="#messages">
    发送给法学硕士的完整消息列表（对话历史记录）。
  </Card>

  <Card title="Tools" icon="tool" href="#tools">
    代理可以访问以采取操作的实用程序。
  </Card>

  <Card title="Model" icon="cpu" href="#model">
    要调用的实际模型（包括配置）。
  </Card>

  <Card title="Response Format" icon="braces" href="#response-format">
    模型最终响应的架构规范。
  </Card>
</CardGroup>

所有这些类型的模型上下文都可以从**状态**（短期记忆）、**存储**（长期记忆）或**运行时上下文**（静态配置）中获取。

###系统提示系统提示设置 LLM 的行为和能力。不同的用户、上下文或对话阶段需要不同的指令。成功的代理利用记忆、偏好和配置为当前对话状态提供正确的指令。

<Tabs>
  <Tab title="State">
    从状态访问消息计数或对话上下文：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents import create_agent
    from langchain.agents.middleware import dynamic_prompt, ModelRequest

    @dynamic_prompt
    def state_aware_prompt(request: ModelRequest) -> str:
        # request.messages is a shortcut for request.state["messages"]
        message_count = len(request.messages)

        base = "You are a helpful assistant."

        if message_count > 10:
            base += "\nThis is a long conversation - be extra concise."

        return base

    agent = create_agent(
        model="gpt-5.5",
        tools=[...],
        middleware=[state_aware_prompt]
    )
    ```
  </Tab>

  <Tab title="Store">
    从长期记忆中访问用户偏好：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass
    from langchain.agents import create_agent
    from langchain.agents.middleware import dynamic_prompt, ModelRequest
    from langgraph.store.memory import InMemoryStore

    @dataclass
    class Context:
        user_id: str

    @dynamic_prompt
    def store_aware_prompt(request: ModelRequest) -> str:
        user_id = request.runtime.context.user_id

        # Read from Store: get user preferences
        store = request.runtime.store
        user_prefs = store.get(("preferences",), user_id)

        base = "You are a helpful assistant."

        if user_prefs:
            style = user_prefs.value.get("communication_style", "balanced")
            base += f"\nUser prefers {style} responses."

        return base

    agent = create_agent(
        model="gpt-5.5",
        tools=[...],
        middleware=[store_aware_prompt],
        context_schema=Context,
        store=InMemoryStore()
    )
    ```
  </Tab>

  <Tab title="Runtime Context">
    从运行时上下文访问用户 ID 或配置：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass
    from langchain.agents import create_agent
    from langchain.agents.middleware import dynamic_prompt, ModelRequest

    @dataclass
    class Context:
        user_role: str
        deployment_env: str

    @dynamic_prompt
    def context_aware_prompt(request: ModelRequest) -> str:
        # Read from Runtime Context: user role and environment
        user_role = request.runtime.context.user_role
        env = request.runtime.context.deployment_env

        base = "You are a helpful assistant."

        if user_role == "admin":
            base += "\nYou have admin access. You can perform all operations."
        elif user_role == "viewer":
            base += "\nYou have read-only access. Guide users to read operations only."

        if env == "production":
            base += "\nBe extra careful with any data modifications."

        return base

    agent = create_agent(
        model="gpt-5.5",
        tools=[...],
        middleware=[context_aware_prompt],
        context_schema=Context
    )
    ```
  </Tab>
</Tabs>

### 消息

消息组成了发送给 LLM 的提示。
管理消息内容至关重要，以确保法学硕士拥有正确的信息来做出良好的回应。

<Tabs>
  <Tab title="State">
    当与当前查询相关时，从 State 注入上传的文件上下文：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents import create_agent
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    from typing import Callable

    @wrap_model_call
    def inject_file_context(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse]
    ) -> ModelResponse:
        """Inject context about files user has uploaded this session."""
        # Read from State: get uploaded files metadata
        uploaded_files = request.state.get("uploaded_files", [])  # [!code highlight]

        if uploaded_files:
            # Build context about available files
            file_descriptions = []
            for file in uploaded_files:
                file_descriptions.append(
                    f"- {file['name']} ({file['type']}): {file['summary']}"
                )

            file_context = f"""Files you have access to in this conversation:
    {chr(10).join(file_descriptions)}

    Reference these files when answering questions."""

            # Inject file context before recent messages
            messages = [  # [!code highlight]
                *request.messages,
                {"role": "user", "content": file_context},
            ]
            request = request.override(messages=messages)  # [!code highlight]

        return handler(request)

    agent = create_agent(
        model="gpt-5.5",
        tools=[...],
        middleware=[inject_file_context]
    )
    ```
  </Tab>

  <Tab title="Store">
    从商店注入用户的电子邮件写作风格以指导起草：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass
    from langchain.agents import create_agent
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    from typing import Callable
    from langgraph.store.memory import InMemoryStore

    @dataclass
    class Context:
        user_id: str

    @wrap_model_call
    def inject_writing_style(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse]
    ) -> ModelResponse:
        """Inject user's email writing style from Store."""
        user_id = request.runtime.context.user_id  # [!code highlight]

        # Read from Store: get user's writing style examples
        store = request.runtime.store  # [!code highlight]
        writing_style = store.get(("writing_style",), user_id)  # [!code highlight]

        if writing_style:
            style = writing_style.value
            # Build style guide from stored examples
            style_context = f"""Your writing style:
    - Tone: {style.get('tone', 'professional')}
    - Typical greeting: "{style.get('greeting', 'Hi')}"
    - Typical sign-off: "{style.get('sign_off', 'Best')}"
    - Example email you've written:
    {style.get('example_email', '')}"""

            # Append at end - models pay more attention to final messages
            messages = [
                *request.messages,
                {"role": "user", "content": style_context}
            ]
            request = request.override(messages=messages)  # [!code highlight]

        return handler(request)

    agent = create_agent(
        model="gpt-5.5",
        tools=[...],
        middleware=[inject_writing_style],
        context_schema=Context,
        store=InMemoryStore()
    )
    ```
  </Tab>

  <Tab title="Runtime Context">
    根据用户的权限从运行时上下文注入合规性规则：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass
    from langchain.agents import create_agent
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    from typing import Callable

    @dataclass
    class Context:
        user_jurisdiction: str
        industry: str
        compliance_frameworks: list[str]

    @wrap_model_call
    def inject_compliance_rules(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse]
    ) -> ModelResponse:
        """Inject compliance constraints from Runtime Context."""
        # Read from Runtime Context: get compliance requirements
        jurisdiction = request.runtime.context.user_jurisdiction  # [!code highlight]
        industry = request.runtime.context.industry  # [!code highlight]
        frameworks = request.runtime.context.compliance_frameworks  # [!code highlight]

        # Build compliance constraints
        rules = []
        if "GDPR" in frameworks:
            rules.append("- Must obtain explicit consent before processing personal data")
            rules.append("- Users have right to data deletion")
        if "HIPAA" in frameworks:
            rules.append("- Cannot share patient health information without authorization")
            rules.append("- Must use secure, encrypted communication")
        if industry == "finance":
            rules.append("- Cannot provide financial advice without proper disclaimers")

        if rules:
            compliance_context = f"""Compliance requirements for {jurisdiction}:
    {chr(10).join(rules)}"""

            # Append at end - models pay more attention to final messages
            messages = [
                *request.messages,
                {"role": "user", "content": compliance_context}
            ]
            request = request.override(messages=messages)  # [!code highlight]

        return handler(request)

    agent = create_agent(
        model="gpt-5.5",
        tools=[...],
        middleware=[inject_compliance_rules],
        context_schema=Context
    )
    ```
  </Tab>
</Tabs>

<Note>
  **瞬时消息更新与持久消息更新：**上面的示例使用 `wrap_model_call` 进行**瞬时**更新 - 修改单个调用发送到模型的消息，而不更改状态中保存的内容。

  对于修改状态的**持久**更新，您可以：

  * 从 `wrap_model_call` 返回一个 [⟦T24⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/ExtendedModelResponse) 和 [⟦T25⟧](https://reference.langchain.com/python/langgraph/types/Command)，以从模型调用层注入状态更新。
  * 使用生命周期挂钩，如 `before_model`、`after_model` 或 `wrap_tool_call`（用于工具返回）来更新对话历史记录。更多详情请参阅[middleware documentation](/oss/python/langchain/middleware)。

  请参阅[State updates](/oss/python/langchain/middleware/custom#state-updates)了解更多信息。
</Note>

### 工具

工具允许模型与数据库、API 和外部系统交互。如何定义和选择工具直接影响模型能否有效完成任务。

#### 定义工具

每个工具都需要一个清晰的名称、描述、参数名称和参数描述。这些不仅仅是元数据，它们指导模型关于何时以及如何使用该工具的推理。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool

@tool(parse_docstring=True)
def search_orders(
    user_id: str,
    status: str,
    limit: int = 10
) -> str:
    """Search for user orders by status.

    Use this when the user asks about order history or wants to check
    order status. Always filter by the provided status.

    Args:
        user_id: Unique identifier for the user
        status: Order status: 'pending', 'shipped', or 'delivered'
        limit: Maximum number of results to return
    """
    # Implementation here
    pass
```

#### 选择工具并非每种工具都适合每种情况。太多的工具可能会压垮模型（超载上下文）并增加错误；太少限制了能力。动态工具选择根据身份验证状态、用户权限、功能标志或对话阶段来调整可用的工具集。

<Tabs>
  <Tab title="State">
    仅在某些对话里程碑后启用高级工具：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents import create_agent
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    from typing import Callable

    @wrap_model_call
    def state_based_tools(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse]
    ) -> ModelResponse:
        """Filter tools based on conversation State."""
        # Read from State: check if user has authenticated
        state = request.state  # [!code highlight]
        is_authenticated = state.get("authenticated", False)  # [!code highlight]
        message_count = len(state["messages"])

        # Only enable sensitive tools after authentication
        if not is_authenticated:
            tools = [t for t in request.tools if t.name.startswith("public_")]
            request = request.override(tools=tools)  # [!code highlight]
        elif message_count < 5:
            # Limit tools early in conversation
            tools = [t for t in request.tools if t.name != "advanced_search"]
            request = request.override(tools=tools)  # [!code highlight]

        return handler(request)

    agent = create_agent(
        model="gpt-5.5",
        tools=[public_search, private_search, advanced_search],
        middleware=[state_based_tools]
    )
    ```
  </Tab>

  <Tab title="Store">
    根据用户偏好或商店中的功能标志过滤工具：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass
    from langchain.agents import create_agent
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    from typing import Callable
    from langgraph.store.memory import InMemoryStore

    @dataclass
    class Context:
        user_id: str

    @wrap_model_call
    def store_based_tools(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse]
    ) -> ModelResponse:
        """Filter tools based on Store preferences."""
        user_id = request.runtime.context.user_id

        # Read from Store: get user's enabled features
        store = request.runtime.store
        feature_flags = store.get(("features",), user_id)

        if feature_flags:
            enabled_features = feature_flags.value.get("enabled_tools", [])
            # Only include tools that are enabled for this user
            tools = [t for t in request.tools if t.name in enabled_features]
            request = request.override(tools=tools)

        return handler(request)

    agent = create_agent(
        model="gpt-5.5",
        tools=[search_tool, analysis_tool, export_tool],
        middleware=[store_based_tools],
        context_schema=Context,
        store=InMemoryStore()
    )
    ```
  </Tab>

  <Tab title="Runtime Context">
    根据运行时上下文中的用户权限过滤工具：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass
    from langchain.agents import create_agent
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    from typing import Callable

    @dataclass
    class Context:
        user_role: str

    @wrap_model_call
    def context_based_tools(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse]
    ) -> ModelResponse:
        """Filter tools based on Runtime Context permissions."""
        # Read from Runtime Context: get user role
        user_role = request.runtime.context.user_role

        if user_role == "admin":
            # Admins get all tools
            pass
        elif user_role == "editor":
            # Editors can't delete
            tools = [t for t in request.tools if t.name != "delete_data"]
            request = request.override(tools=tools)
        else:
            # Viewers get read-only tools
            tools = [t for t in request.tools if t.name.startswith("read_")]
            request = request.override(tools=tools)

        return handler(request)

    agent = create_agent(
        model="gpt-5.5",
        tools=[read_data, write_data, delete_data],
        middleware=[context_based_tools],
        context_schema=Context
    )
    ```
  </Tab>
</Tabs>

有关过滤预注册工具和在运行时注册工具（例如，从 MCP 服务器）的信息，请参阅[Dynamic tools](/oss/python/langchain/tools#dynamic-tool-selection)。

### 型号

不同的模型有不同的优势、成本和上下文窗口。为手头的任务选择正确的模型，
在代理运行期间可能会发生变化。

<Tabs>
  <Tab title="State">
    根据州的对话长度使用不同的模型：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents import create_agent
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    from langchain.chat_models import init_chat_model
    from typing import Callable

    # Initialize models once outside the middleware
    large_model = init_chat_model("claude-sonnet-4-6")
    standard_model = init_chat_model("gpt-5.5")
    efficient_model = init_chat_model("gpt-5.4-mini")

    @wrap_model_call
    def state_based_model(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse]
    ) -> ModelResponse:
        """Select model based on State conversation length."""
        # request.messages is a shortcut for request.state["messages"]
        message_count = len(request.messages)  # [!code highlight]

        if message_count > 20:
            # Long conversation - use model with larger context window
            model = large_model
        elif message_count > 10:
            # Medium conversation
            model = standard_model
        else:
            # Short conversation - use efficient model
            model = efficient_model

        request = request.override(model=model)  # [!code highlight]

        return handler(request)

    agent = create_agent(
        model="gpt-5.4-mini",
        tools=[...],
        middleware=[state_based_model]
    )
    ```
  </Tab>

  <Tab title="Store">
    使用商店中用户的首选型号：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass
    from langchain.agents import create_agent
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    from langchain.chat_models import init_chat_model
    from typing import Callable
    from langgraph.store.memory import InMemoryStore

    @dataclass
    class Context:
        user_id: str

    # Initialize available models once
    MODEL_MAP = {
        "gpt-5.5": init_chat_model("gpt-5.5"),
        "gpt-5.4-mini": init_chat_model("gpt-5.4-mini"),
        "claude-sonnet": init_chat_model("claude-sonnet-4-6"),
    }

    @wrap_model_call
    def store_based_model(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse]
    ) -> ModelResponse:
        """Select model based on Store preferences."""
        user_id = request.runtime.context.user_id

        # Read from Store: get user's preferred model
        store = request.runtime.store
        user_prefs = store.get(("preferences",), user_id)

        if user_prefs:
            preferred_model = user_prefs.value.get("preferred_model")
            if preferred_model and preferred_model in MODEL_MAP:
                request = request.override(model=MODEL_MAP[preferred_model])

        return handler(request)

    agent = create_agent(
        model="gpt-5.5",
        tools=[...],
        middleware=[store_based_model],
        context_schema=Context,
        store=InMemoryStore()
    )
    ```
  </Tab>

  <Tab title="Runtime Context">
    根据运行时上下文中的成本限制或环境选择模型：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass
    from langchain.agents import create_agent
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    from langchain.chat_models import init_chat_model
    from typing import Callable

    @dataclass
    class Context:
        cost_tier: str
        environment: str

    # Initialize models once outside the middleware
    premium_model = init_chat_model("claude-sonnet-4-6")
    standard_model = init_chat_model("gpt-5.5")
    budget_model = init_chat_model("gpt-5.4-mini")

    @wrap_model_call
    def context_based_model(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse]
    ) -> ModelResponse:
        """Select model based on Runtime Context."""
        # Read from Runtime Context: cost tier and environment
        cost_tier = request.runtime.context.cost_tier
        environment = request.runtime.context.environment

        if environment == "production" and cost_tier == "premium":
            # Production premium users get best model
            model = premium_model
        elif cost_tier == "budget":
            # Budget tier gets efficient model
            model = budget_model
        else:
            # Standard tier
            model = standard_model

        request = request.override(model=model)

        return handler(request)

    agent = create_agent(
        model="gpt-5.5",
        tools=[...],
        middleware=[context_based_model],
        context_schema=Context
    )
    ```
  </Tab>
</Tabs>

更多示例请参见[Dynamic model](/oss/python/langchain/models#dynamic-model-selection)。### 响应格式

结构化输出将非结构化文本转换为经过验证的结构化数据。当提取特定字段或为下游系统返回数据时，自由格式文本是不够的。

**工作原理：** 当您提供架构作为响应格式时，模型的最终响应将保证符合该架构。代理运行模型/工具调用循环，直到模型完成调用工具，然后将最终响应强制转换为提供的格式。

#### 定义格式

模式定义指导模型。字段名称、类型和描述准确指定输出应遵循的格式。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from pydantic import BaseModel, Field

class CustomerSupportTicket(BaseModel):
    """Structured ticket information extracted from customer message."""

    category: str = Field(
        description="Issue category: 'billing', 'technical', 'account', or 'product'"
    )
    priority: str = Field(
        description="Urgency level: 'low', 'medium', 'high', or 'critical'"
    )
    summary: str = Field(
        description="One-sentence summary of the customer's issue"
    )
    customer_sentiment: str = Field(
        description="Customer's emotional tone: 'frustrated', 'neutral', or 'satisfied'"
    )
```

#### 选择格式

动态响应格式选择根据用户偏好、对话阶段或角色来调整模式——尽早返回简单格式，并随着复杂性的增加而返回详细格式。

<Tabs>
  <Tab title="State">
    根据对话状态配置结构化输出：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents import create_agent
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    from pydantic import BaseModel, Field
    from typing import Callable

    class SimpleResponse(BaseModel):
        """Simple response for early conversation."""
        answer: str = Field(description="A brief answer")

    class DetailedResponse(BaseModel):
        """Detailed response for established conversation."""
        answer: str = Field(description="A detailed answer")
        reasoning: str = Field(description="Explanation of reasoning")
        confidence: float = Field(description="Confidence score 0-1")

    @wrap_model_call
    def state_based_output(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse]
    ) -> ModelResponse:
        """Select output format based on State."""
        # request.messages is a shortcut for request.state["messages"]
        message_count = len(request.messages)  # [!code highlight]

        if message_count < 3:
            # Early conversation - use simple format
            request = request.override(response_format=SimpleResponse)  # [!code highlight]
        else:
            # Established conversation - use detailed format
            request = request.override(response_format=DetailedResponse)  # [!code highlight]

        return handler(request)

    agent = create_agent(
        model="gpt-5.5",
        tools=[...],
        middleware=[state_based_output]
    )
    ```
  </Tab>

  <Tab title="Store">
    根据 Store 中的用户偏好配置输出格式：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass
    from langchain.agents import create_agent
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    from pydantic import BaseModel, Field
    from typing import Callable
    from langgraph.store.memory import InMemoryStore

    @dataclass
    class Context:
        user_id: str

    class VerboseResponse(BaseModel):
        """Verbose response with details."""
        answer: str = Field(description="Detailed answer")
        sources: list[str] = Field(description="Sources used")

    class ConciseResponse(BaseModel):
        """Concise response."""
        answer: str = Field(description="Brief answer")

    @wrap_model_call
    def store_based_output(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse]
    ) -> ModelResponse:
        """Select output format based on Store preferences."""
        user_id = request.runtime.context.user_id

        # Read from Store: get user's preferred response style
        store = request.runtime.store
        user_prefs = store.get(("preferences",), user_id)

        if user_prefs:
            style = user_prefs.value.get("response_style", "concise")
            if style == "verbose":
                request = request.override(response_format=VerboseResponse)
            else:
                request = request.override(response_format=ConciseResponse)

        return handler(request)

    agent = create_agent(
        model="gpt-5.5",
        tools=[...],
        middleware=[store_based_output],
        context_schema=Context,
        store=InMemoryStore()
    )
    ```
  </Tab>

  <Tab title="Runtime Context">
    根据运行时上下文（例如用户角色或环境）配置输出格式：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass
    from langchain.agents import create_agent
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    from pydantic import BaseModel, Field
    from typing import Callable

    @dataclass
    class Context:
        user_role: str
        environment: str

    class AdminResponse(BaseModel):
        """Response with technical details for admins."""
        answer: str = Field(description="Answer")
        debug_info: dict = Field(description="Debug information")
        system_status: str = Field(description="System status")

    class UserResponse(BaseModel):
        """Simple response for regular users."""
        answer: str = Field(description="Answer")

    @wrap_model_call
    def context_based_output(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse]
    ) -> ModelResponse:
        """Select output format based on Runtime Context."""
        # Read from Runtime Context: user role and environment
        user_role = request.runtime.context.user_role
        environment = request.runtime.context.environment

        if user_role == "admin" and environment == "production":
            # Admins in production get detailed output
            request = request.override(response_format=AdminResponse)
        else:
            # Regular users get simple output
            request = request.override(response_format=UserResponse)

        return handler(request)

    agent = create_agent(
        model="gpt-5.5",
        tools=[...],
        middleware=[context_based_output],
        context_schema=Context
    )
    ```
  </Tab>
</Tabs>

## 工具上下文工具的特殊之处在于它们可以读取和写入上下文。

在最基本的情况下，当工具执行时，它会接收LLM的请求参数并返回工具消息。该工具完成其工作并产生结果。

工具还可以获取模型的重要信息，使其能够执行和完成任务。

### 阅读

大多数现实世界的工具需要的不仅仅是法学硕士的参数。他们需要用于数据库查询的用户 ID、用于外部服务的 API 密钥或当前会话状态来做出决策。工具从状态、存储和运行时上下文中读取以访问此信息。

<Tabs>
  <Tab title="State">
    读取State来检查当前会话信息：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.tools import tool, ToolRuntime
    from langchain.agents import create_agent

    @tool
    def check_authentication(
        runtime: ToolRuntime
    ) -> str:
        """Check if user is authenticated."""
        # Read from State: check current auth status
        current_state = runtime.state
        is_authenticated = current_state.get("authenticated", False)

        if is_authenticated:
            return "User is authenticated"
        else:
            return "User is not authenticated"

    agent = create_agent(
        model="gpt-5.5",
        tools=[check_authentication]
    )
    ```
  </Tab>

  <Tab title="Store">
    从 Store 读取以访问持久的用户首选项：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass
    from langchain.tools import tool, ToolRuntime
    from langchain.agents import create_agent
    from langgraph.store.memory import InMemoryStore

    @dataclass
    class Context:
        user_id: str

    @tool
    def get_preference(
        preference_key: str,
        runtime: ToolRuntime[Context]
    ) -> str:
        """Get user preference from Store."""
        user_id = runtime.context.user_id

        # Read from Store: get existing preferences
        store = runtime.store
        existing_prefs = store.get(("preferences",), user_id)

        if existing_prefs:
            value = existing_prefs.value.get(preference_key)
            return f"{preference_key}: {value}" if value else f"No preference set for {preference_key}"
        else:
            return "No preferences found"

    agent = create_agent(
        model="gpt-5.5",
        tools=[get_preference],
        context_schema=Context,
        store=InMemoryStore()
    )
    ```
  </Tab>

  <Tab title="Runtime Context">
    从运行时上下文中读取 API 密钥和用户 ID 等配置：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass
    from langchain.tools import tool, ToolRuntime
    from langchain.agents import create_agent

    @dataclass
    class Context:
        user_id: str
        api_key: str
        db_connection: str

    @tool
    def fetch_user_data(
        query: str,
        runtime: ToolRuntime[Context]
    ) -> str:
        """Fetch data using Runtime Context configuration."""
        # Read from Runtime Context: get API key and DB connection
        user_id = runtime.context.user_id
        api_key = runtime.context.api_key
        db_connection = runtime.context.db_connection

        # Use configuration to fetch data
        results = perform_database_query(db_connection, query, api_key)

        return f"Found {len(results)} results for user {user_id}"

    agent = create_agent(
        model="gpt-5.5",
        tools=[fetch_user_data],
        context_schema=Context
    )

    # Invoke with runtime context
    result = agent.invoke(
        {"messages": [{"role": "user", "content": "Get my data"}]},
        context=Context(
            user_id="user_123",
            api_key="sk-...",
            db_connection="postgresql://..."
        )
    )
    ```
  </Tab>
</Tabs>

### 写

工具结果可用于帮助代理完成给定的任务。工具都可以将结果直接返回给模型
并更新代理的内存，以便为未来的步骤提供重要的上下文。<Tabs>
  <Tab title="State">
    使用命令写入状态以跟踪特定于会话的信息：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.tools import tool, ToolRuntime
    from langchain.agents import create_agent
    from langgraph.types import Command

    @tool
    def authenticate_user(
        password: str,
        runtime: ToolRuntime
    ) -> Command:
        """Authenticate user and update State."""
        # Perform authentication (simplified)
        if password == "correct":
            # Write to State: mark as authenticated using Command
            return Command(
                update={"authenticated": True},
            )
        else:
            return Command(update={"authenticated": False})

    agent = create_agent(
        model="gpt-5.5",
        tools=[authenticate_user]
    )
    ```
  </Tab>

  <Tab title="Store">
    写入 Store 以跨会话保存数据：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass
    from langchain.tools import tool, ToolRuntime
    from langchain.agents import create_agent
    from langgraph.store.memory import InMemoryStore

    @dataclass
    class Context:
        user_id: str

    @tool
    def save_preference(
        preference_key: str,
        preference_value: str,
        runtime: ToolRuntime[Context]
    ) -> str:
        """Save user preference to Store."""
        user_id = runtime.context.user_id

        # Read existing preferences
        store = runtime.store
        existing_prefs = store.get(("preferences",), user_id)

        # Merge with new preference
        prefs = existing_prefs.value if existing_prefs else {}
        prefs[preference_key] = preference_value

        # Write to Store: save updated preferences
        store.put(("preferences",), user_id, prefs)

        return f"Saved preference: {preference_key} = {preference_value}"

    agent = create_agent(
        model="gpt-5.5",
        tools=[save_preference],
        context_schema=Context,
        store=InMemoryStore()
    )
    ```
  </Tab>
</Tabs>

有关在工具中访问状态、存储和运行时上下文的完整示例，请参阅[Tools](/oss/python/langchain/tools)。

## 生命周期上下文

控制核心代理步骤**之间**发生的情况 - 拦截数据流以实现横切关注点，例如汇总、护栏和日志记录。

正如您在 [Model Context](#model-context) 和 [Tool Context](#tool-context) 中看到的，[middleware](/oss/python/langchain/middleware) 是使上下文工程变得实用的机制。中间件允许您连接到代理生命周期中的任何步骤，并且：

1. **更新上下文** - 修改状态和存储以保存更改、更新对话历史记录或保存见解
2. **生命周期跳转** - 根据上下文移动到代理周期中的不同步骤（例如，如果满足条件则跳过工具执行，使用修改后的上下文重复模型调用）

<div>
  <img alt="Middleware hooks in the agent loop" />
</div>

### 示例：总结最常见的生命周期模式之一是当对话历史记录太长时自动压缩。与 [Model Context](#messages) 中显示的瞬时消息修剪不同，摘要**持续更新状态** - 使用为所有未来轮次保存的摘要永久替换旧消息。

LangChain为此提供了内置中间件：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware

agent = create_agent(
    model="gpt-5.5",
    tools=[...],
    middleware=[
        SummarizationMiddleware(
            model="gpt-5.4-mini",
            trigger={"tokens": 4000},
            keep=("messages", 20),
        ),
    ],
)
```

当会话超过令牌限制时，`SummarizationMiddleware`自动：

1. 使用单独的 LLM 调用总结旧消息
2. 将它们替换为状态中的摘要消息（永久）
3. 保持最近消息的上下文完整

摘要对话历史记录会永久更新 - 将来的对话将看到摘要而不是原始消息。

<Note>
  有关内置中间件、可用挂钩以及如何创建自定义中间件的完整列表，请参阅 [Middleware documentation](/oss/python/langchain/middleware)。
</Note>

## 最佳实践1. **从简单开始** - 从静态提示和工具开始，仅在需要时添加动态
2. **增量测试** - 一次添加一项上下文工程功能
3. **监控性能** - 跟踪模型调用、令牌使用情况和延迟
4. **使用内置中间件** - 利用[⟦T31⟧](/oss/python/langchain/middleware#summarization)、[⟦T32⟧](/oss/python/langchain/middleware#llm-tool-selector)等。
5. **记录你的上下文策略** - 明确正在传递的上下文以及原因
6. **了解瞬态与持久性**：模型上下文更改是瞬态的（每次调用），而生命周期上下文更改会持续到状态

## 相关资源

* [Context conceptual overview](/oss/python/concepts/context) - 了解上下文类型以及何时使用它们
* [Middleware](/oss/python/langchain/middleware) - 完整的中间件指南
* [Tools](/oss/python/langchain/tools) - 工具创建和上下文访问
* [Memory](/oss/python/concepts/memory) - 短期和长期记忆模式
* [Agents](/oss/python/langchain/agents) - 核心代理概念

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/context-engineering.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>