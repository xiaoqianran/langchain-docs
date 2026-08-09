<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Guardrails | https://docs.langchain.com/oss/python/langchain/guardrails -->

# 护栏

为您的代理实施安全检查和内容过滤

Guardrails 通过在代理执行的关键点验证和过滤内容，帮助您构建安全、合规的 AI 应用程序。他们可以检测敏感信息、执行内容策略、验证输出并在不安全行为引起问题之前阻止它们。

常见用例包括：

* 防止 PII 泄露
* 检测并阻止即时注入攻击
* 阻止不适当或有害的内容
* 执行业务规则和合规要求
* 验证输出质量和准确性

您可以使用 [middleware](/oss/python/langchain/middleware) 实现护栏，以在代理启动之前、完成之后或模型和工具调用周围拦截战略点的执行。

<div>
  <img alt="Middleware flow diagram" />
</div>

护栏可以使用两种互补的方法来实现：

<CardGroup>
  <Card title="Deterministic guardrails" icon="list-check">
    使用基于规则的逻辑，例如正则表达式模式、关键字匹配或显式检查。快速、可预测且具有成本效益，但可能会错过细微的违规行为。
  </Card><Card title="Model-based guardrails" icon="brain">
    使用法学硕士或分类器通过语义理解来评估内容。捕捉规则遗漏的微妙问题，但速度更慢且成本更高。
  </Card>
</CardGroup>

LangChain 提供内置护栏（例如[PII detection](#pii-detection)、[human-in-the-loop](#human-in-the-loop)）和灵活的中间件系统，用于使用任一方法构建自定义护栏。

## 内置护栏

### PII 检测

LangChain提供内置中间件来检测和处理对话中的个人身份信息（PII）。该中间件可以检测常见的 PII 类型，例如电子邮件、信用卡、IP 地址等。

PII 检测中间件对于具有合规性要求的医疗保健和金融应用程序、需要清理日志的客户服务代理以及通常处理敏感用户数据的任何应用程序等情况很有帮助。

PII 中间件支持多种处理检测到的 PII 的策略：|战略|描述 |示例|
| -------- | --------------------------------------- | -------------------- |
| `redact` |替换为`[REDACTED_{PII_TYPE}]`| `[REDACTED_EMAIL]` |
| `mask` |部分模糊（例如最后 4 位数字）| `****-****-****-1234` |
| `hash` |替换为确定性哈希 | `a8f5f167...` |
| `block` |检测到时引发异常 |抛出错误 |

<Note>
  借助 `apply_to_output=True`，`PIIMiddleware` 还可以通过注册的流转换器编辑流式传输输出（文本增量、工具调用参数、工具输出和状态快照）。需要`langchain>=1.3.2`。参见[Register transformers on middleware](/oss/python/langchain/event-streaming#register-transformers-on-middleware)。
</Note>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import PIIMiddleware


agent = create_agent(
    model="gpt-5.5",
    tools=[customer_service_tool, email_tool],
    middleware=[
        # Redact emails in user input before sending to model
        PIIMiddleware(
            "email",
            strategy="redact",
            apply_to_input=True,
        ),
        # Mask credit cards in user input
        PIIMiddleware(
            "credit_card",
            strategy="mask",
            apply_to_input=True,
        ),
        # Block API keys - raise error if detected
        PIIMiddleware(
            "api_key",
            detector=r"sk-[a-zA-Z0-9]{32}",
            strategy="block",
            apply_to_input=True,
        ),
    ],
)

# When user provides PII, it will be handled according to the strategy
result = agent.invoke({
    "messages": [{"role": "user", "content": "My email is john.doe@example.com and card is 5105-1051-0510-5100"}]
})
```

<Accordion title="Built-in PII types and configuration">
  **内置 PII 类型：**

  * `email` - 电子邮件地址
  * `credit_card` - 信用卡号码（经过 Luhn 验证）
  * `ip` - IP 地址
  * `mac_address` - MAC 地址
  * `url` - URL

  **配置选项：**|参数|描述 |默认|
  | ----------------------- | ---------------------------------------------------------------------------------- | ---------------------- |
  | `pii_type` |要检测的 PII 类型（内置或自定义）|必填|
  | `strategy` |如何处理检测到的 PII（`"block"`、`"redact"`、`"mask"`、`"hash"`）| `"redact"` |
  | `detector` |自定义检测器函数或正则表达式模式 | `None`（使用内置）|
  | `apply_to_input` |模型调用前查看用户消息 | `True` |
  | `apply_to_output` |模型调用后查看AI消息 | `False` |
  | `apply_to_tool_results` |执行后检查工具结果消息 | `False` |
</Accordion>

有关 PII 检测功能的完整详细信息，请参阅[middleware documentation](/oss/python/langchain/middleware#pii-detection)。

### 人机交互LangChain提供内置中间件，在执行敏感操作之前需要人工批准。这是高风险决策最有效的护栏之一。

人机交互中间件对于金融交易和转账、删除或修改生产数据、向外部各方发送通信以及任何具有重大业务影响的操作等情况很有帮助。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command


agent = create_agent(
    model="gpt-5.5",
    tools=[search_tool, send_email_tool, delete_database_tool],
    middleware=[
        HumanInTheLoopMiddleware(
            interrupt_on={
                # Require approval for sensitive operations
                "send_email": True,
                "delete_database": True,
                # Auto-approve safe operations
                "search": False,
            }
        ),
    ],
    # Persist the state across interrupts
    checkpointer=InMemorySaver(),
)

# Human-in-the-loop requires a thread ID for persistence
config = {"configurable": {"thread_id": "some_id"}}

# Agent will pause and wait for approval before executing sensitive tools
result = agent.invoke(
    {"messages": [{"role": "user", "content": "Send an email to the team"}]},
    config=config
)

result = agent.invoke(
    Command(resume={"decisions": [{"type": "approve"}]}),
    config=config  # Same thread ID to resume the paused conversation
)
```

<Tip>
  有关实施审批工作流程的完整详细信息，请参阅[human-in-the-loop documentation](/oss/python/langchain/human-in-the-loop)。
</Tip>

## 定制护栏

对于更复杂的护栏，您可以创建在代理执行之前或之后运行的自定义中间件。这使您可以完全控制验证逻辑、内容过滤和安全检查。

### 特工护栏前

使用“before agent”挂钩在每次调用开始时验证一次请求。这对于会话级检查非常有用，例如身份验证、速率限制或在任何处理开始之前阻止不适当的请求。

<CodeGroup>
  ```python title="Class syntax" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from typing import Any

  from langchain.agents.middleware import AgentMiddleware, AgentState, hook_config
  from langgraph.runtime import Runtime

  class ContentFilterMiddleware(AgentMiddleware):
      """Deterministic guardrail: Block requests containing banned keywords."""

      def __init__(self, banned_keywords: list[str]):
          super().__init__()
          self.banned_keywords = [kw.lower() for kw in banned_keywords]

      @hook_config(can_jump_to=["end"])
      def before_agent(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
          # Get the first user message
          if not state["messages"]:
              return None

          first_message = state["messages"][0]
          if first_message.type != "human":
              return None

          content = first_message.content.lower()

          # Check for banned keywords
          for keyword in self.banned_keywords:
              if keyword in content:
                  # Block execution before any processing
                  return {
                      "messages": [{
                          "role": "assistant",
                          "content": "I cannot process requests containing inappropriate content. Please rephrase your request."
                      }],
                      "jump_to": "end"
                  }

          return None

  # Use the custom guardrail
  from langchain.agents import create_agent

  agent = create_agent(
      model="gpt-5.5",
      tools=[search_tool, calculator_tool],
      middleware=[
          ContentFilterMiddleware(
              banned_keywords=["hack", "exploit", "malware"]
          ),
      ],
  )

  # This request will be blocked before any processing
  result = agent.invoke({
      "messages": [{"role": "user", "content": "How do I hack into a database?"}]
  })
  ```

  ```python title="Decorator syntax" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from typing import Any

  from langchain.agents.middleware import before_agent, AgentState, hook_config
  from langgraph.runtime import Runtime

  banned_keywords = ["hack", "exploit", "malware"]

  @before_agent(can_jump_to=["end"])
  def content_filter(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
      """Deterministic guardrail: Block requests containing banned keywords."""
      # Get the first user message
      if not state["messages"]:
          return None

      first_message = state["messages"][0]
      if first_message.type != "human":
          return None

      content = first_message.content.lower()

      # Check for banned keywords
      for keyword in banned_keywords:
          if keyword in content:
              # Block execution before any processing
              return {
                  "messages": [{
                      "role": "assistant",
                      "content": "I cannot process requests containing inappropriate content. Please rephrase your request."
                  }],
                  "jump_to": "end"
              }

      return None

  # Use the custom guardrail
  from langchain.agents import create_agent

  agent = create_agent(
      model="gpt-5.5",
      tools=[search_tool, calculator_tool],
      middleware=[content_filter],
  )

  # This request will be blocked before any processing
  result = agent.invoke({
      "messages": [{"role": "user", "content": "How do I hack into a database?"}]
  })
  ```
</CodeGroup>

### 特工护栏后在返回给用户之前，使用“after agent”挂钩验证最终输出一次。这对于基于模型的安全检查、质量验证或对完整代理响应的最终合规性扫描非常有用。

<CodeGroup>
  ```python title="Class syntax" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents.middleware import AgentMiddleware, AgentState, hook_config
  from langgraph.runtime import Runtime
  from langchain.messages import AIMessage
  from langchain.chat_models import init_chat_model
  from typing import Any

  class SafetyGuardrailMiddleware(AgentMiddleware):
      """Model-based guardrail: Use an LLM to evaluate response safety."""

      def __init__(self):
          super().__init__()
          self.safety_model = init_chat_model("gpt-5.4-mini")

      @hook_config(can_jump_to=["end"])
      def after_agent(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
          # Get the final AI response
          if not state["messages"]:
              return None

          last_message = state["messages"][-1]
          if not isinstance(last_message, AIMessage):
              return None

          # Use a model to evaluate safety
          safety_prompt = f"""Evaluate if this response is safe and appropriate.
          Respond with only 'SAFE' or 'UNSAFE'.

          Response: {last_message.content}"""

          result = self.safety_model.invoke([{"role": "user", "content": safety_prompt}])

          if "UNSAFE" in result.content:
              last_message.content = "I cannot provide that response. Please rephrase your request."

          return None

  # Use the safety guardrail
  from langchain.agents import create_agent

  agent = create_agent(
      model="gpt-5.5",
      tools=[search_tool, calculator_tool],
      middleware=[SafetyGuardrailMiddleware()],
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "How do I make explosives?"}]
  })
  ```

  ```python title="Decorator syntax" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents.middleware import after_agent, AgentState, hook_config
  from langgraph.runtime import Runtime
  from langchain.messages import AIMessage
  from langchain.chat_models import init_chat_model
  from typing import Any

  safety_model = init_chat_model("gpt-5.4-mini")

  @after_agent(can_jump_to=["end"])
  def safety_guardrail(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
      """Model-based guardrail: Use an LLM to evaluate response safety."""
      # Get the final AI response
      if not state["messages"]:
          return None

      last_message = state["messages"][-1]
      if not isinstance(last_message, AIMessage):
          return None

      # Use a model to evaluate safety
      safety_prompt = f"""Evaluate if this response is safe and appropriate.
      Respond with only 'SAFE' or 'UNSAFE'.

      Response: {last_message.content}"""

      result = safety_model.invoke([{"role": "user", "content": safety_prompt}])

      if "UNSAFE" in result.content:
          last_message.content = "I cannot provide that response. Please rephrase your request."

      return None

  # Use the safety guardrail
  from langchain.agents import create_agent

  agent = create_agent(
      model="gpt-5.5",
      tools=[search_tool, calculator_tool],
      middleware=[safety_guardrail],
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "How do I make explosives?"}]
  })
  ```
</CodeGroup>

### 组合多个护栏

您可以通过将多个护栏添加到中间件数组来堆叠它们。它们按顺序执行，允许您构建分层保护：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import PIIMiddleware, HumanInTheLoopMiddleware

agent = create_agent(
    model="gpt-5.5",
    tools=[search_tool, send_email_tool],
    middleware=[
        # Layer 1: Deterministic input filter (before agent)
        ContentFilterMiddleware(banned_keywords=["hack", "exploit"]),

        # Layer 2: PII protection (before and after model)
        PIIMiddleware("email", strategy="redact", apply_to_input=True),
        PIIMiddleware("email", strategy="redact", apply_to_output=True),

        # Layer 3: Human approval for sensitive tools
        HumanInTheLoopMiddleware(interrupt_on={"send_email": True}),

        # Layer 4: Model-based safety check (after agent)
        SafetyGuardrailMiddleware(),
    ],
)
```

## 其他资源

* [Middleware documentation](/oss/python/langchain/middleware) - 自定义中间件完整指南
* [Middleware API reference](https://reference.langchain.com/python/langchain/middleware/) - 自定义中间件完整指南
* [Human-in-the-loop](/oss/python/langchain/human-in-the-loop) - 为敏感操作添加人工审核
* [Testing agents](/oss/python/langchain/test/) - 测试安全机制的策略

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/guardrails.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>