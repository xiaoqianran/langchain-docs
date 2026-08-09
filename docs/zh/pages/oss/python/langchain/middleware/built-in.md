<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Prebuilt middleware | https://docs.langchain.com/oss/python/langchain/middleware/built-in -->

# 预构建中间件

适用于常见代理用例的预构建中间件

LangChain 和[Deep Agents](/oss/python/deepagents/overview) 为常见用例提供预构建的中间件。每个中间件均可投入生产并可根据您的特定需求进行配置。

## 与提供商无关的中间件

以下中间件适用于任何 LLM 提供商：

|中间件|描述 |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [Summarization](#summarization) |当接近令牌限制时自动总结对话历史记录。                   |
| [Human-in-the-loop](#human-in-the-loop) |暂停执行以供人工批准工具调用。                                             |
| [Model call limit](#model-call-limit) |限制模型调用次数，防止成本过高。                                   |
| [Tool call limit](#tool-call-limit) |通过限制调用计数来控制工具执行。                                               |
| [Model fallback](#model-fallback) |当主模型出现故障时，自动回退到替代模型。                              || [PII detection](#pii-detection) |检测和处理个人身份信息 (PII)。                                  |
| [To-do list](#to-do-list) |为代理配备任务规划和跟踪功能。                                    |
| [LLM tool selector](#llm-tool-selector) |在调用主模型之前，使用LLM选择相关工具。                                |
| [Tool error](#tool-error) |捕获工具执行异常并将其转换为模型的错误消息。             |
| [Tool retry](#tool-retry) |使用指数退避自动重试失败的工具调用。                               |
| [Model retry](#model-retry) |使用指数退避自动重试失败的模型调用。                              |
| [LLM tool emulator](#llm-tool-emulator) |使用 LLM 模拟工具执行以进行测试。                                     |
| [Context editing](#context-editing) |通过修剪或清除工具的使用来管理对话上下文。                                |
| [Provider tool search](#provider-tool-search) |将工具推迟到提供商的服务器端工具搜索后面，按需显示它们。              || [Shell tool](#shell-tool) |向代理公开持久 shell 会话以执行命令。                            |
| [File search](#file-search) |提供对文件系统文件的 Glob 和 Grep 搜索工具。                                     |
| [Filesystem](#filesystem-middleware) |为代理提供用于存储上下文和长期记忆的文件系统。                  |
| [Subagent](#subagent) |添加生成子代理的能力。                                                           |
| [Rubric grading (Beta)](#rubric-grading) |应用法学硕士作为评判评分，以便代理进行自我评估和迭代，直到满足标准。 |

### 总结

当接近令牌限制时自动总结对话历史记录，保留最近的消息，同时压缩旧的上下文。总结对于以下方面很有用：

* 超出上下文窗口的长时间运行的对话。
* 具有丰富历史的多轮对话。
* 保留完整对话上下文很重要的应用程序。<Note>
  摘要是面向文本的上下文压缩。它不会调整大小、缩减采样或以其他方式压缩图像/音频/视频有效负载。 `keep` 保留的最新消息仍然包含其原始多模式块，而汇总的旧多模式消息仅由生成的文本摘要表示。对于图像较多的应用程序，将媒体存储在文件系统或对象存储中，并通过消息历史记录传递 URL 或文件引用。
</Note>

**API参考：** [⟦T41⟧](https://reference.langchain.com/python/langchain/agents/middleware/summarization/SummarizationMiddleware)

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware

agent = create_agent(
    model="gpt-5.5",
    tools=[your_weather_tool, your_calculator_tool],
    middleware=[
        SummarizationMiddleware(
            model="gpt-5.4-mini",
            trigger=("tokens", 4000),
            keep=("messages", 20),
        ),
    ],
)
```

<Accordion title="Configuration options">
  <Tip>
    如果使用 `langchain>=1.1`，`trigger` 和 `keep`（如下所示）的 `fraction` 条件依赖于聊天模型的 [profile data](/oss/python/langchain/models#model-profiles)。如果数据不可用，请使用其他条件或手动指定：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.chat_models import init_chat_model

    custom_profile = {
        "max_input_tokens": 100_000,
        # ...
    }
    model = init_chat_model("gpt-5.5", profile=custom_profile)
    ```
  </Tip>

  <ParamField type="string | BaseChatModel">
    用于生成摘要的模型。可以是模型标识符字符串（例如，`'openai:gpt-5.4-mini'`）或`BaseChatModel`实例。请参阅[⟦T48⟧](https://reference.langchain.com/python/langchain/chat_models/base/init_chat_model)了解更多信息。
  </ParamField>

  <ParamField type="ContextSize | TriggerClause | list[ContextSize | TriggerClause] | None">
    触发汇总的条件。可以是：

    * 单个[⟦T49⟧](https://reference.langchain.com/python/langchain/agents/middleware/summarization/ContextSize)元组（必须满足指定的阈值）
    * 单个 [⟦T50⟧](https://reference.langchain.com/python/langchain/agents/middleware/summarization/TriggerClause) 字典（必须满足所有指定的阈值 - AND 逻辑）
    * 混合任一形式的列表（任何项目都必须满足 - OR 逻辑）

    支持的阈值有：* `fraction` (float): 模型上下文大小的分数 (0-1)
    * `tokens` (int): 绝对令牌数
    * `messages` (int): 消息计数

    一个 [⟦T54⟧](https://reference.langchain.com/python/langchain/agents/middleware/summarization/ContextSize) 元组正好表达一个阈值。 [⟦T55⟧](https://reference.langchain.com/python/langchain/agents/middleware/summarization/TriggerClause) 字典可以包含一个或多个阈值，例如`{"tokens": 4000, "messages": 10}`，并且必须满足字典中的所有阈值（AND）。

    每个 [⟦T57⟧](https://reference.langchain.com/python/langchain/agents/middleware/summarization/TriggerClause) 字典必须指定至少一个阈值。如果不提供`trigger`，则不会自动触发汇总。

    有关更多信息，请参阅 [⟦T59⟧](https://reference.langchain.com/python/langchain/agents/middleware/summarization/ContextSize) 和 [⟦T60⟧](https://reference.langchain.com/python/langchain/agents/middleware/summarization/TriggerClause) 的 API 参考。
  </ParamField>

  <ParamField type="ContextSize">
    总结后要保留多少上下文。准确指定以下之一：

    * `fraction` (float)：要保留的模型上下文大小的分数 (0-1)
    * `tokens` (int): 要保留的绝对令牌计数
    * `messages` (int): 要保留的最近消息数

    有关更多信息，请参阅 [⟦T64⟧](https://reference.langchain.com/python/langchain/agents/middleware/summarization/ContextSize) 的 API 参考。
  </ParamField>

  <ParamField type="function">
    自定义令牌计数功能。默认为基于字符的计数。
  </ParamField>

  <ParamField type="string">
    自定义摘要提示模板。如果未指定，则使用内置模板。模板应包含 `{messages}` 占位符，其中将插入对话历史记录。
  </ParamField><ParamField type="number">
    生成摘要时要包含的最大标记数。在汇总之前，消息将被修剪以适应此限制。
  </ParamField>

  <ParamField type="string">
    **已弃用：** 使用 `summary_prompt` 来提供完整的提示。
  </ParamField>

  <ParamField type="number">
    **已弃用：** 使用 `trigger: ("tokens", value)` 代替。触发汇总的令牌阈值。
  </ParamField>

  <ParamField type="number">
    **已弃用：** 使用 `keep: ("messages", value)` 代替。要保留的最近消息。
  </ParamField>
</Accordion>

<Accordion title="Full example">
  汇总中间件监视消息令牌计数，并在达到阈值时自动汇总旧消息。

  **触发条件**控制汇总何时运行：

  * 满足该阈值时触发单个阈值
  * 具有多个阈值的触发子句仅在满足所有阈值时触发（AND逻辑）
  * 触发条件列表，任意一项满足时触发（OR逻辑）
  * 每个阈值可以使用`fraction`（模型上下文大小）、`tokens`（绝对计数）或`messages`（消息计数）

  **保留条件**控制要保留的上下文数量（准确指定一个）：* `fraction` - 要保留的模型上下文大小的分数
  * `tokens` - 要保留的绝对令牌计数
  * `messages` - 要保留的最近消息数

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import SummarizationMiddleware


  # Single condition: trigger if tokens >= 4000
  agent = create_agent(
      model="gpt-5.5",
      tools=[your_weather_tool, your_calculator_tool],
      middleware=[
          SummarizationMiddleware(
              model="gpt-5.4-mini",
              trigger=("tokens", 4000),
              keep=("messages", 20),
          ),
      ],
  )

  # Multiple conditions: trigger if number of tokens >= 3000 OR messages >= 6
  agent2 = create_agent(
      model="gpt-5.5",
      tools=[your_weather_tool, your_calculator_tool],
      middleware=[
          SummarizationMiddleware(
              model="gpt-5.4-mini",
              trigger=[
                  ("tokens", 3000),
                  ("messages", 6),
              ],
              keep=("messages", 20),
          ),
      ],
  )

  # AND logic: trigger only when tokens >= 4000 AND messages >= 10
  agent3 = create_agent(
      model="gpt-5.5",
      tools=[your_weather_tool, your_calculator_tool],
      middleware=[
          SummarizationMiddleware(
              model="gpt-5.4-mini",
              trigger={"tokens": 4000, "messages": 10},
              keep=("messages", 20),
          ),
      ],
  )

  # Combine AND and OR: trigger if (tokens >= 5000 AND messages >= 3)
  # OR (tokens >= 3000 AND messages >= 6)
  agent4 = create_agent(
      model="gpt-5.5",
      tools=[your_weather_tool, your_calculator_tool],
      middleware=[
          SummarizationMiddleware(
              model="gpt-5.4-mini",
              trigger=[
                  {"tokens": 5000, "messages": 3},
                  {"tokens": 3000, "messages": 6},
              ],
              keep=("messages", 20),
          ),
      ],
  )

  # Using fractional limits
  agent5 = create_agent(
      model="gpt-5.5",
      tools=[your_weather_tool, your_calculator_tool],
      middleware=[
          SummarizationMiddleware(
              model="gpt-5.4-mini",
              trigger=("fraction", 0.8),
              keep=("fraction", 0.3),
          ),
      ],
  )
  ```
</Accordion>

### 人机交互

在执行之前暂停代理执行，以便人工批准、编辑或拒绝工具调用。 [Human-in-the-loop](/oss/python/langchain/human-in-the-loop) 适用于以下情况：

* 需要人工批准的高风险操作（例如数据库写入、金融交易）。
* 强制进行人工监督的合规工作流程。
* 长时间运行的对话，人工反馈指导代理。

**API参考：** [⟦T75⟧](https://reference.langchain.com/python/langchain/agents/middleware/human_in_the_loop/HumanInTheLoopMiddleware)

<Warning>
  人机循环中间件需要 [checkpointer](/oss/python/langgraph/checkpointers#checkpoints) 来维持中断状态。
</Warning>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware
from langgraph.checkpoint.memory import InMemorySaver


def your_read_email_tool(email_id: str) -> str:
    """Mock function to read an email by its ID."""
    return f"Email content for ID: {email_id}"

def your_send_email_tool(recipient: str, subject: str, body: str) -> str:
    """Mock function to send an email."""
    return f"Email sent to {recipient} with subject '{subject}'"

agent = create_agent(
    model="gpt-5.5",
    tools=[your_read_email_tool, your_send_email_tool],
    checkpointer=InMemorySaver(),
    middleware=[
        HumanInTheLoopMiddleware(
            interrupt_on={
                "your_send_email_tool": {
                    "allowed_decisions": ["approve", "edit", "reject"],
                },
                "your_read_email_tool": False,
            }
        ),
    ],
)
```

<Tip>
  有关完整示例、配置选项和集成模式，请参阅 [Human-in-the-loop documentation](/oss/python/langchain/human-in-the-loop)。
</Tip>

<Callout icon="player-play">
  观看这个 [video guide](https://www.youtube.com/watch?v=SpfT6-YAVPk) 演示人机循环中间件行为。
</Callout>

### 模型调用限制

限制模型调用的数量，以防止无限循环或过高的成本。模型调用限制对于以下情况很有用：

* 防止失控的代理进行过多的 API 调用。
* 对生产部署实施成本控制。
* 测试座席在特定呼叫预算内的行为。**API参考：** [⟦T76⟧](https://reference.langchain.com/python/langchain/agents/middleware/model_call_limit/ModelCallLimitMiddleware)

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import ModelCallLimitMiddleware
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    model="gpt-5.5",
    checkpointer=InMemorySaver(),  # Required for thread limiting
    tools=[],
    middleware=[
        ModelCallLimitMiddleware(
            thread_limit=10,
            run_limit=5,
            exit_behavior="end",
        ),
    ],
)
```

<Callout icon="player-play">
  观看这个 [video guide](https://www.youtube.com/watch?v=nJEER0uaNkE) 演示模型调用限制中间件行为。
</Callout>

<Accordion title="Configuration options">
  <ParamField type="number">
    线程中所有运行的最大模型调用数。默认为无限制。
  </ParamField>

  <ParamField type="number">
    每次调用的最大模型调用数。默认为无限制。
  </ParamField>

  <ParamField type="string">
    达到限制时的行为。选项：`'end'`（优雅终止）或`'error'`（引发异常）
  </ParamField>
</Accordion>

### 工具调用限制

通过限制工具调用的数量来控制代理执行，无论是在所有工具中全局还是针对特定工具。工具调用限制对于以下用途很有用：

* 防止过度调用昂贵的外部 API。
* 限制网络搜索或数据库查询。
* 对特定工具的使用实施速率限制。
* 防止代理失控循环。

**API参考：** [⟦T79⟧](https://reference.langchain.com/python/langchain/agents/middleware/tool_call_limit/ToolCallLimitMiddleware)

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import ToolCallLimitMiddleware

agent = create_agent(
    model="gpt-5.5",
    tools=[search_tool, database_tool],
    middleware=[
        # Global limit
        ToolCallLimitMiddleware(thread_limit=20, run_limit=10),
        # Tool-specific limit
        ToolCallLimitMiddleware(
            tool_name="search",
            thread_limit=5,
            run_limit=3,
        ),
    ],
)
```

<Callout icon="player-play">
  观看这个 [video guide](https://www.youtube.com/watch?v=6gYlaJJ8t0w) 演示工具调用限制中间件行为。
</Callout>

<Accordion title="Configuration options">
  <ParamField type="string">
    要限制的特定工具的名称。如果未提供，限制适用于**全球所有工具**。
  </ParamField><ParamField type="number">
    线程（对话）中所有运行的最大工具调用数。在具有相同线程 ID 的多次调用中保持不变。需要检查指针来维护状态。 `None`表示无线程限制。
  </ParamField>

  <ParamField type="number">
    每次调用的最大工具调用数（一条用户消息 → 响应周期）。每条新用户消息都会重置。 `None` 表示无运行限制。

    **注意：** 必须至少指定 `thread_limit` 或 `run_limit` 之一。
  </ParamField>

  <ParamField type="string">
    达到限制时的行为：

    * `'continue'`（默认）- 使用错误消息阻止超出的工具调用，让其他工具和模型继续。模型根据错误消息决定何时结束。
    * `'error'` - 引发 `ToolCallLimitExceededError` 异常，立即停止执行
    * `'end'` - 立即停止执行，并针对超出的工具调用发出 `ToolMessage` 和 AI 消息。仅在限制单个工具时有效；如果其他工具有挂起的调用，则会引发 `NotImplementedError`。
  </ParamField>
</Accordion>

<Accordion title="Full example">
  指定限制：

  * **线程限制** - 对话中所有运行的最大调用数（需要检查指针）
  * **运行限制** - 每次调用的最大调用次数（每轮重置）

  退出行为：* `'continue'`（默认）- 阻止超出的呼叫并显示错误消息，座席继续
  * `'error'` - 立即引发异常
  * `'end'` - 使用 ToolMessage + AI 消息停止（仅限单工具场景）

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import ToolCallLimitMiddleware


  global_limiter = ToolCallLimitMiddleware(thread_limit=20, run_limit=10)
  search_limiter = ToolCallLimitMiddleware(tool_name="search", thread_limit=5, run_limit=3)
  database_limiter = ToolCallLimitMiddleware(tool_name="query_database", thread_limit=10)
  strict_limiter = ToolCallLimitMiddleware(tool_name="scrape_webpage", run_limit=2, exit_behavior="error")

  agent = create_agent(
      model="gpt-5.5",
      tools=[search_tool, database_tool, scraper_tool],
      middleware=[global_limiter, search_limiter, database_limiter, strict_limiter],
  )
  ```
</Accordion>

### 模型后备

当主要模型失败时自动回退到替代模型。模型回退对于以下情况很有用：

* 构建处理模型中断的弹性代理。
* 通过使用更便宜的型号来优化成本。
* OpenAI、Anthropic 等提供者冗余。

**API参考：** [⟦T93⟧](https://reference.langchain.com/python/langchain/agents/middleware/model_fallback/ModelFallbackMiddleware)

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import ModelFallbackMiddleware

agent = create_agent(
    model="gpt-5.5",
    tools=[],
    middleware=[
        ModelFallbackMiddleware(
            "gpt-5.4-mini",
            "claude-3-5-sonnet-20241022",
        ),
    ],
)
```

<Callout icon="player-play">
  观看这个 [video guide](https://www.youtube.com/watch?v=8rCRO0DUeIM) 演示模型回退中间件行为。
</Callout>

<Accordion title="Configuration options">
  <ParamField type="string | BaseChatModel">
    当主要模型失败时尝试的第一个后备模型。可以是模型标识符字符串（例如，`'openai:gpt-5.4-mini'`）或`BaseChatModel`实例。
  </ParamField>

  <ParamField type="string | BaseChatModel">
    如果以前的模型失败，可以尝试其他后备模型
  </ParamField>
</Accordion>

### PII 检测

使用可配置策略检测和处理对话中的个人身份信息 (PII)。 PII 检测有以下用途：* 具有合规性要求的医疗保健和金融应用。
* 需要清理日志的客户服务代理。
* 任何处理敏感用户数据的应用程序。

<Note>
  借助 `apply_to_output=True`，`PIIMiddleware` 还可以通过注册的流转换器编辑流式传输输出（文本增量、工具调用参数、工具输出和状态快照）。需要`langchain>=1.3.2`。参见[Register transformers on middleware](/oss/python/langchain/event-streaming#register-transformers-on-middleware)。
</Note>

**API参考：** [⟦T99⟧](https://reference.langchain.com/python/langchain/agents/middleware/pii/PIIMiddleware)

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import PIIMiddleware

agent = create_agent(
    model="gpt-5.5",
    tools=[],
    middleware=[
        PIIMiddleware("email", strategy="redact", apply_to_input=True),
        PIIMiddleware("credit_card", strategy="mask", apply_to_input=True),
    ],
)
```

#### 自定义 PII 类型

您可以通过提供 `detector` 参数来创建自定义 PII 类型。这使您可以检测除内置类型之外的特定于您的用例的模式。

**创建自定义检测器的三种方法：**

1. **正则表达式模式字符串** - 简单模式匹配

2. **自定义函数** - 带验证的复杂检测逻辑

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import PIIMiddleware
import re


# Method 1: Regex pattern string
agent1 = create_agent(
    model="gpt-5.5",
    tools=[],
    middleware=[
        PIIMiddleware(
            "api_key",
            detector=r"sk-[a-zA-Z0-9]{32}",
            strategy="block",
        ),
    ],
)

# Method 2: Compiled regex pattern
agent2 = create_agent(
    model="gpt-5.5",
    tools=[],
    middleware=[
        PIIMiddleware(
            "phone_number",
            detector=re.compile(r"\+?\d{1,3}[\s.-]?\d{3,4}[\s.-]?\d{4}"),
            strategy="mask",
        ),
    ],
)

# Method 3: Custom detector function
def detect_ssn(content: str) -> list[dict[str, str | int]]:
    """Detect SSN with validation.

    Returns a list of dictionaries with 'text', 'start', and 'end' keys.
    """
    import re
    matches = []
    pattern = r"\d{3}-\d{2}-\d{4}"
    for match in re.finditer(pattern, content):
        ssn = match.group(0)
        # Validate: first 3 digits shouldn't be 000, 666, or 900-999
        first_three = int(ssn[:3])
        if first_three not in [0, 666] and not (900 <= first_three <= 999):
            matches.append({
                "text": ssn,
                "start": match.start(),
                "end": match.end(),
            })
    return matches

agent3 = create_agent(
    model="gpt-5.5",
    tools=[],
    middleware=[
        PIIMiddleware(
            "ssn",
            detector=detect_ssn,
            strategy="hash",
        ),
    ],
)
```

**自定义检测器函数签名：**

检测器函数必须接受字符串（内容）并返回匹配项：

返回带有 `text`、`start` 和 `end` 键的字典列表：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def detector(content: str) -> list[dict[str, str | int]]:
    return [
        {"text": "matched_text", "start": 0, "end": 12},
        # ... more matches
    ]
```

<Tip>
  对于定制探测器：* 对简单模式使用正则表达式字符串
  * 当需要标志时使用 RegExp 对象（例如，不区分大小写的匹配）
  * 当您需要模式匹配之外的验证逻辑时，请使用自定义函数
  * 自定义函数让您完全控制检测逻辑并可以实现复杂的验证规则
</Tip>

<Accordion title="Configuration options">
  <ParamField type="string">
    要检测的 PII 类型。可以是内置类型（`email`、`credit_card`、`ip`、`mac_address`、`url`）或自定义类型名称。
  </ParamField>

  <ParamField type="string">
    如何处理检测到的 PII。选项：

    * `'block'` - 检测到时引发异常
    * `'redact'` - 替换为 `[REDACTED_{PII_TYPE}]`
    * `'mask'` - 部分屏蔽（例如，`****-****-****-1234`）
    * `'hash'` - 替换为确定性哈希
  </ParamField>

  <ParamField type="function | regex">
    自定义检测器函数或正则表达式模式。如果未提供，则使用 PII 类型的内置检测器。
  </ParamField>

  <ParamField type="boolean">
    模型调用前检查用户消息
  </ParamField>

  <ParamField type="boolean">
    模型调用后查看AI消息。使用`langchain>=1.3.2`，还可以通过注册的流转换器编辑流式传输输出（文本增量、工具调用参数、工具输出、状态快照）。参见[event streaming](/oss/python/langchain/event-streaming#register-transformers-on-middleware)。
  </ParamField>

  <ParamField type="boolean">
    执行后检查工具结果消息
  </ParamField>
</Accordion>

### 待办事项列表为代理配备任务规划和跟踪功能，以执行复杂的多步骤任务。待办事项列表对于以下用途很有用：

* 复杂的多步骤任务需要跨多个工具进行协调。
* 长期运行的操作，其中进度可见性非常重要。

<Note>
  该中间件自动为代理提供`write_todos`工具和系统提示来指导有效的任务规划。
</Note>

**API参考：** [⟦T117⟧](https://reference.langchain.com/python/langchain/agents/middleware/todo/TodoListMiddleware)

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import TodoListMiddleware

agent = create_agent(
    model="gpt-5.5",
    tools=[read_file, write_file, run_tests],
    middleware=[TodoListMiddleware()],
)
```

<Callout icon="player-play">
  观看这个 [video guide](https://www.youtube.com/watch?v=yTWocbVKQxw) 演示待办事项列表中间件行为。
</Callout>

<Accordion title="Configuration options">
  <ParamField type="string">
    自定义系统提示，用于指导待办事项的使用。如果未指定，则使用内置提示。
  </ParamField>

  <ParamField type="string">
    `write_todos` 工具的自定义描述。如果未指定，则使用内置描述。
  </ParamField>
</Accordion>

### LLM 工具选择器

在调用主模型之前，使用LLM智能地选择相关工具。 LLM 工具选择器可用于以下用途：

* 具有许多工具（10+）的代理，其中大多数工具与每个查询都不相关。
* 通过过滤不相关的工具来减少代币使用。
* 提高模型焦点和准确性。该中间件使用结构化输出来询问法学硕士哪些工具与当前查询最相关。结构化输出模式定义了可用的工具名称和描述。模型提供者通常会将此结构化输出信息添加到幕后的系统提示中。

**API参考：** [⟦T119⟧](https://reference.langchain.com/python/langchain/agents/middleware/tool_selection/LLMToolSelectorMiddleware)

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import LLMToolSelectorMiddleware

agent = create_agent(
    model="gpt-5.5",
    tools=[tool1, tool2, tool3, tool4, tool5, ...],
    middleware=[
        LLMToolSelectorMiddleware(
            model="gpt-5.4-mini",
            max_tools=3,
            always_include=["search"],
        ),
    ],
)
```

<Accordion title="Configuration options">
  <ParamField type="string | BaseChatModel">
    工具选择模型。可以是模型标识符字符串（例如，`'openai:gpt-5.4-mini'`）或`BaseChatModel`实例。请参阅[⟦T122⟧](https://reference.langchain.com/python/langchain/chat_models/base/init_chat_model)了解更多信息。

    默认为代理的主要模型。
  </ParamField>

  <ParamField type="string">
    型号选择说明。如果未指定，则使用内置提示。
  </ParamField>

  <ParamField type="number">
    选择的工具的最大数量。如果模型选择更多，则仅使用第一个 max\_tools。如果没有指定则没有限制。
  </ParamField>

  <ParamField type="list[string]">
    无论选择如何，始终包含工具名称。这些不计入 max\_tools 限制。
  </ParamField>
</Accordion>

### 工具错误

捕获工具执行期间引发的异常并将其转换为模型可以看到并从中恢复的错误`ToolMessage`，而不是停止代理运行。工具错误对于以下情况很有用：* 让模型使用更正的参数重试失败的工具调用。
* 显示受控的、经过清理的错误消息，而不是原始的异常详细信息。
* 防止意外的工具异常导致代理崩溃。

<Note>
  工具错误中间件不会自动重试失败的调用。对于重试，请使用放置在*inner*（位于`middleware`列表中较早位置）的[Tool retry](#tool-retry)中间件进行组合，并使用`on_failure="error"`进行配置，以便异常到达工具错误中间件。请参阅下面的[full example](#tool-error-full-example)。
</Note>

**API参考：** [⟦T126⟧](https://reference.langchain.com/python/langchain/agents/middleware/tool_error/ToolErrorMiddleware)

<Note>
  `ToolErrorMiddleware` 需要 `langchain>=1.3.14`。
</Note>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import ToolErrorMiddleware


def on_error(exc: Exception, request: ToolCallRequest) -> str | None:
    if isinstance(exc, ValueError):
        return f"`{request.tool_call['name']}` failed with {type(exc).__name__}."
    # propagate everything else


agent = create_agent(
    model="gpt-5.5",
    tools=[your_tools],
    middleware=[ToolErrorMiddleware(on_error)],
)
```

<Accordion title="Configuration options">
  <ParamField type="Callable[[Exception, ToolCallRequest], str | list[ContentBlock] | None]">
    为工具执行引发的每个异常调用同步处理程序。返回内容（`str`或内容块列表）以将异常转换为`ToolMessage(status="error")`。返回 `None` 或省略 return 语句以使异常传播。用于同步路径，除非给出 `aon_error`，否则用于异步路径。
  </ParamField>

  <ParamField type="Callable[[Exception, ToolCallRequest], Awaitable[str | list[ContentBlock] | None]]">
    可选的异步处理程序，在异步执行路径上使用。如果未提供，则回退到 `on_error`。
  </ParamField>

  <ParamField type="list[BaseTool | str]">
    要应用错误处理的工具或工具名称的可选列表。如果`None`，适用于所有工具。
  </ParamField>
</Accordion><Accordion title="Tool error full example">
  `on_error` 处理程序接收异常和 `ToolCallRequest`（其中包括带有名称、参数和调用 ID 的工具调用字典）。对于您不想处理的异常，返回`None`，它们将正常传播。

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import ToolErrorMiddleware, ToolRetryMiddleware


  def on_error(exc: Exception, request: ToolCallRequest) -> str | None:
      # Surface ValueError to the model so it can correct the input
      if isinstance(exc, ValueError):
          return f"`{request.tool_call['name']}` failed: {type(exc).__name__}. Fix the input and retry."
      # Let all other exceptions propagate (halts the run)
      return None


  # Async-only usage
  async def aon_error(exc: Exception, request: ToolCallRequest) -> str | None:
      if isinstance(exc, ConnectionError):
          return f"Tool `{request.tool_call['name']}` encountered a connection error."
      return None


  agent = create_agent(
      model="gpt-5.5",
      tools=[search_tool, database_tool],
      middleware=[
          # Place retry inner so exceptions reach ToolErrorMiddleware after retries are exhausted
          ToolRetryMiddleware(max_retries=3, on_failure="error"),
          ToolErrorMiddleware(on_error=on_error, tools=["search_tool"]),
      ],
  )

  # Async-only: pass aon_error alone (do not pass on_error)
  async_agent = create_agent(
      model="gpt-5.5",
      tools=[api_tool],
      middleware=[ToolErrorMiddleware(aon_error=aon_error)],
  )
  ```

  <Note>
    优先返回指定异常类型的内容，而不是原始异常消息，因为原始异常消息可能包含敏感或内部详细信息。 `on_error` 处理程序控制披露：原始异常消息永远不会发送到模型，除非您选择包含它。
  </Note>
</Accordion>

### 工具重试

使用可配置的指数退避自动重试失败的工具调用。工具重试对于以下情况很有用：

* 处理外部 API 调用中的瞬时故障。
* 提高依赖网络的工具的可靠性。
* 构建能够优雅地处理临时错误的弹性代理。

**API参考：** [⟦T139⟧](https://reference.langchain.com/python/langchain/agents/middleware/tool_retry/ToolRetryMiddleware)

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import ToolRetryMiddleware

agent = create_agent(
    model="gpt-5.5",
    tools=[search_tool, database_tool],
    middleware=[
        ToolRetryMiddleware(
            max_retries=3,
            backoff_factor=2.0,
            initial_delay=1.0,
        ),
    ],
)
```

<Accordion title="Configuration options">
  <ParamField type="number">
    首次调用后的最大重试次数（默认为 3 次）
  </ParamField>

  <ParamField type="list[BaseTool | str]">
    要应用重试逻辑的工具或工具名称的可选列表。如果`None`，适用于所有工具。
  </ParamField><ParamField type="tuple[type[Exception], ...] | callable">
    要重试的异常类型的元组，或者是接受异常并在应该重试时返回 `True` 的可调用对象。默认情况下，所有异常都会重试。不匹配的异常会立即传播，并且不会由 `on_failure` 处理。
  </ParamField>

  <ParamField type="string | callable">
    所有重试都用尽时的行为。选项：

    * `'continue'`（默认）- 返回带有错误详细信息的`ToolMessage`，允许LLM处理失败
    * `'error'` - 重新引发异常，停止代理执行
    * 自定义可调用 - 接受异常并返回 `ToolMessage` 内容字符串的函数

    **弃用值：** `'return_message'`（使用 `'continue'` 代替）和 `'raise'`（使用 `'error'` 代替）。
  </ParamField>

  <ParamField type="number">
    指数退避的乘数。每次重试都会等待 `initial_delay * (backoff_factor ** retry_number)` 秒。设置为 `0.0` 以获得恒定延迟。
  </ParamField>

  <ParamField type="number">
    第一次重试之前的初始延迟（以秒为单位）
  </ParamField>

  <ParamField type="number">
    重试之间的最大延迟（以秒为单位）（限制指数退避增长）
  </ParamField>

  <ParamField type="boolean">
    是否添加随机抖动（`±25%`）进行延迟以避免雷群
  </ParamField>
</Accordion>

<Accordion title="Full example">
  中间件会通过指数退避自动重试失败的工具调用。**关键配置：**

  * `max_retries` - 重试次数（默认值：2）
  * `backoff_factor` - 指数退避乘数（默认值：2.0）
  * `initial_delay` - 启动延迟（以秒为单位）（默认值：1.0）
  * `max_delay` - 延迟增长上限（默认值：60.0）
  * `jitter` - 添加随机变化（默认值：True）

  **故障处理：**

  * `on_failure='continue'` (默认) - 返回错误信息
  * `on_failure='error'` - 重新引发异常
  * 自定义函数 - 返回错误消息的函数

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import ToolRetryMiddleware


  agent = create_agent(
      model="gpt-5.5",
      tools=[search_tool, database_tool, api_tool],
      middleware=[
          ToolRetryMiddleware(
              max_retries=3,
              backoff_factor=2.0,
              initial_delay=1.0,
              max_delay=60.0,
              jitter=True,
              tools=["api_tool"],
              retry_on=(ConnectionError, TimeoutError),
              on_failure="continue",
          ),
      ],
  )
  ```
</Accordion>

### 模型重试

使用可配置的指数退避自动重试失败的模型调用。模型重试对于以下情况很有用：

* 处理模型 API 调用中的瞬时故障。
* 提高网络相关模型请求的可靠性。
* 构建有弹性的代理，可以优雅地处理临时模型错误。

**API参考：** [⟦T161⟧](https://reference.langchain.com/python/langchain/agents/middleware/model_retry/ModelRetryMiddleware)

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import ModelRetryMiddleware

agent = create_agent(
    model="gpt-5.5",
    tools=[search_tool, database_tool],
    middleware=[
        ModelRetryMiddleware(
            max_retries=3,
            backoff_factor=2.0,
            initial_delay=1.0,
        ),
    ],
)
```

<Accordion title="Configuration options">
  <ParamField type="number">
    首次调用后的最大重试次数（默认为 3 次）
  </ParamField>

  <ParamField type="tuple[type[Exception], ...] | callable">
    要重试的异常类型的元组，或者是接受异常并在应该重试时返回 `True` 的可调用对象。
  </ParamField>

  <ParamField type="string | callable">
    所有重试都用尽时的行为。选项：* `'continue'`（默认）- 返回包含错误详细信息的 `AIMessage`，允许代理优雅地处理故障
    * `'error'` - 重新引发异常（停止代理执行）
    * 自定义可调用 - 接受异常并返回 `AIMessage` 内容字符串的函数
  </ParamField>

  <ParamField type="number">
    指数退避的乘数。每次重试都会等待 `initial_delay * (backoff_factor ** retry_number)` 秒。设置为 `0.0` 以获得恒定延迟。
  </ParamField>

  <ParamField type="number">
    第一次重试之前的初始延迟（以秒为单位）
  </ParamField>

  <ParamField type="number">
    重试之间的最大延迟（以秒为单位）（限制指数退避增长）
  </ParamField>

  <ParamField type="boolean">
    是否添加随机抖动（`±25%`）进行延迟以避免雷群
  </ParamField>
</Accordion>

<Accordion title="Full example">
  中间件会通过指数退避自动重试失败的模型调用。

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import ModelRetryMiddleware


  # Basic usage with default settings (2 retries, exponential backoff)
  agent = create_agent(
      model="gpt-5.5",
      tools=[search_tool],
      middleware=[ModelRetryMiddleware()],
  )

  # Custom exception filtering
  class TimeoutError(Exception):
      """Custom exception for timeout errors."""
      pass

  class ConnectionError(Exception):
      """Custom exception for connection errors."""
      pass

  # Retry specific exceptions only
  retry = ModelRetryMiddleware(
      max_retries=4,
      retry_on=(TimeoutError, ConnectionError),
      backoff_factor=1.5,
  )


  def should_retry(error: Exception) -> bool:
      # Only retry on rate limit errors
      if isinstance(error, TimeoutError):
          return True
      # Or check for specific HTTP status codes
      if hasattr(error, "status_code"):
          return error.status_code in (429, 503)
      return False

  retry_with_filter = ModelRetryMiddleware(
      max_retries=3,
      retry_on=should_retry,
  )

  # Return error message instead of raising
  retry_continue = ModelRetryMiddleware(
      max_retries=4,
      on_failure="continue",  # Return AIMessage with error instead of raising
  )

  # Custom error message formatting
  def format_error(error: Exception) -> str:
      return f"Model call failed: {error}. Please try again later."

  retry_with_formatter = ModelRetryMiddleware(
      max_retries=4,
      on_failure=format_error,
  )

  # Constant backoff (no exponential growth)
  constant_backoff = ModelRetryMiddleware(
      max_retries=5,
      backoff_factor=0.0,  # No exponential growth
      initial_delay=2.0,  # Always wait 2 seconds
  )

  # Raise exception on failure
  strict_retry = ModelRetryMiddleware(
      max_retries=2,
      on_failure="error",  # Re-raise exception instead of returning message
  )
  ```
</Accordion>

### LLM工具模拟器

使用 LLM 模拟工具执行以进行测试，用 AI 生成的响应替换实际的工具调用。 LLM 工具模拟器可用于以下用途：

* 无需执行真实工具即可测试代理行为。
* 当外部工具不可用或昂贵时开发代理。
* 在实施实际工具之前对代理工作流程进行原型设计。**API参考：** [⟦T170⟧](https://reference.langchain.com/python/langchain/agents/middleware/tool_emulator/LLMToolEmulator)

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import LLMToolEmulator

agent = create_agent(
    model="gpt-5.5",
    tools=[get_weather, search_database, send_email],
    middleware=[
        LLMToolEmulator(),  # Emulate all tools
    ],
)
```

<Accordion title="Configuration options">
  <ParamField type="list[str | BaseTool]">
    要模拟的工具名称 (str) 或 BaseTool 实例的列表。如果`None`（默认），将模拟所有工具。如果列表`[]`为空，则不会模拟任何工具。如果数组包含工具名称/实例，则仅模拟这些工具。
  </ParamField>

  <ParamField type="string | BaseChatModel">
    用于生成模拟工具响应的模型。可以是模型标识符字符串（例如，`'google_genai:gemini-3.6-flash'`）或`BaseChatModel`实例。如果未指定，则默认为代理的型号。请参阅[⟦T175⟧](https://reference.langchain.com/python/langchain/chat_models/base/init_chat_model)了解更多信息。
  </ParamField>
</Accordion>

<Accordion title="Full example">
  中间件使用 LLM 为工具调用生成合理的响应，而不是执行实际的工具。

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import LLMToolEmulator
  from langchain.tools import tool


  @tool
  def get_weather(location: str) -> str:
      """Get the current weather for a location."""
      return f"Weather in {location}"

  @tool
  def send_email(to: str, subject: str, body: str) -> str:
      """Send an email."""
      return "Email sent"


  # Emulate all tools (default behavior)
  agent = create_agent(
      model="gpt-5.5",
      tools=[get_weather, send_email],
      middleware=[LLMToolEmulator()],
  )

  # Emulate specific tools only
  agent2 = create_agent(
      model="gpt-5.5",
      tools=[get_weather, send_email],
      middleware=[LLMToolEmulator(tools=["get_weather"])],
  )

  # Use custom model for emulation
  agent4 = create_agent(
      model="gpt-5.5",
      tools=[get_weather, send_email],
      middleware=[LLMToolEmulator(model="claude-sonnet-4-6")],
  )
  ```
</Accordion>

### 上下文编辑

通过在达到令牌限制时清除旧工具调用输出来管理对话上下文，同时保留最近的结果。这有助于在与许多工具调用的长时间对话中保持上下文窗口的可管理性。上下文编辑对于以下用途很有用：

* 与许多超出令牌限制的工具调用进行长时间对话
* 通过删除不再相关的旧工具输出来降低代币成本
* 仅维护上下文中最新的 N 个工具结果

**API参考：** [⟦T176⟧](https://reference.langchain.com/python/langchain/agents/middleware/context_editing/ContextEditingMiddleware)、[⟦T177⟧](https://reference.langchain.com/python/langchain/agents/middleware/context_editing/ClearToolUsesEdit)

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import ContextEditingMiddleware, ClearToolUsesEdit

agent = create_agent(
    model="gpt-5.5",
    tools=[],
    middleware=[
        ContextEditingMiddleware(
            edits=[
                ClearToolUsesEdit(
                    trigger=100000,
                    keep=3,
                ),
            ],
        ),
    ],
)
```<Accordion title="Configuration options">
  <ParamField type="list[ContextEdit]">
    要应用的[⟦T178⟧](https://reference.langchain.com/python/langchain/agents/middleware/context_editing/ContextEdit)策略列表
  </ParamField>

  <ParamField type="string">
    令牌计数方法。选项：`'approximate'` 或 `'model'`
  </ParamField>

  **[⟦T181⟧](https://reference.langchain.com/python/langchain/agents/middleware/context_editing/ClearToolUsesEdit)选项：**

  <ParamField type="number">
    触发编辑的令牌计数。当对话超过此令牌计数时，旧工具输出将被清除。
  </ParamField>

  <ParamField type="number">
    编辑运行时要回收的最小令牌数。如果设置为 0，则根据需要清除。
  </ParamField>

  <ParamField type="number">
    必须保留的最新工具结果的数量。这些永远不会被清除。
  </ParamField>

  <ParamField type="boolean">
    是否清除AI消息上的原始工具调用参数。当`True`时，工具调用参数被替换为空对象。
  </ParamField>

  <ParamField type="list[string]">
    要从清除中排除的工具名称列表。这些工具的输出永远不会被清除。
  </ParamField>

  <ParamField type="string">
    为清除的工具输出插入占位符文本。这替换了原始工具消息内容。
  </ParamField>
</Accordion>

<Accordion title="Full example">
  当达到令牌限制时，中间件应用上下文编辑策略。最常见的策略是`ClearToolUsesEdit`，它清除旧的工具结果，同时保留最新的结果。

  **它是如何工作的：**1. 监控对话中的令牌计数
  2. 当达到阈值时，清除旧工具输出
  3.保留最近的N个工具结果
  4. 有选择地保留上下文的工具调用参数

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import ContextEditingMiddleware, ClearToolUsesEdit


  agent = create_agent(
      model="gpt-5.5",
      tools=[search_tool, your_calculator_tool, database_tool],
      middleware=[
          ContextEditingMiddleware(
              edits=[
                  ClearToolUsesEdit(
                      trigger=2000,
                      keep=3,
                      clear_tool_inputs=False,
                      exclude_tools=[],
                      placeholder="[cleared]",
                  ),
              ],
          ),
      ],
  )
  ```
</Accordion>

### 提供商工具搜索

将选定的工具推迟到模型提供者的服务器端工具搜索之后，以便模型按需发现它们，而不是预先接收每个工具模式。提供商工具搜索可用于：

* 减少使用许多工具时的上下文膨胀。
* 通过仅显示相关工具来提高工具选择的准确性。

<Note>
  需要具有服务器端工具搜索支持的模型：Anthropic (Claude Sonnet 4+/Opus 4+/Haiku 4.5+) 或 OpenAI (gpt-5.5+)。其他提供商提出`ValueError`。
</Note>

**API参考：** [⟦T185⟧](https://reference.langchain.com/python/langchain/agents/middleware/provider_tool_search/ProviderToolSearchMiddleware)

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import ProviderToolSearchMiddleware

agent = create_agent(
    model="anthropic:claude-opus-4-8",
    tools=[get_weather, lookup_order],
    middleware=[
        ProviderToolSearchMiddleware(searchable_tools=["lookup_order"]),
    ],
)
```

<Accordion title="Configuration options">
  <ParamField type="list[str | BaseTool]">
    推迟提供者工具搜索的工具，按名称或实例给出。延迟的工具将从模型中保留，直到搜索显示它们为止。无论此选项如何，使用 `extras={"defer_loading": True}` 构建的工具都会被推迟；如果省略`searchable_tools`，则仅推迟那些预先标记的工具。
  </ParamField>
</Accordion><Accordion title="Full example">
  中间件选择使用`searchable_tools`中包含的所有工具来进行延迟和搜索。工具还可以通过设置 `extras={"defer_loading": True}` 在构建时选择延迟。

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import ProviderToolSearchMiddleware
  from langchain.tools import tool


  # Marked `defer_loading` at construction, so it's deferred on its own —
  # no need to list it in `searchable_tools`.
  @tool(extras={"defer_loading": True})
  def send_email(to: str) -> str:
      """Send an email."""
      return "sent"


  agent = create_agent(
      model="anthropic:claude-opus-4-8",
      tools=[send_email],
      middleware=[ProviderToolSearchMiddleware()],
  )
  ```
</Accordion>

### 外壳工具

向代理公开持久 shell 会话以执行命令。 Shell 工具中间件可用于以下用途：

* 需要执行系统命令的代理
* 开发和部署自动化任务
* 测试和验证工作流程
* 文件系统操作和脚本执行

<Warning>
  **安全注意事项**：使用适当的执行策略（`HostExecutionPolicy`、`DockerExecutionPolicy` 或 `CodexSandboxExecutionPolicy`）来匹配您的部署的安全要求。
</Warning>

<Note>
  **限制**：持久 shell 会话当前不支持中断（人机交互）。我们预计将来会增加对此的支持。
</Note>

**API参考：** [⟦T193⟧](https://reference.langchain.com/python/langchain/agents/middleware/shell_tool/ShellToolMiddleware)

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import (
    ShellToolMiddleware,
    HostExecutionPolicy,
)

agent = create_agent(
    model="gpt-5.5",
    tools=[search_tool],
    middleware=[
        ShellToolMiddleware(
            workspace_root="/workspace",
            execution_policy=HostExecutionPolicy(),
        ),
    ],
)
```

<Accordion title="Configuration options">
  <ParamField type="str | Path | None">
    shell 会话的基目录。如果省略，则在代理启动时创建临时目录，并在代理结束时删除。
  </ParamField>

  <ParamField type="tuple[str, ...] | list[str] | str | None">
    会话开始后按顺序执行的可选命令
  </ParamField>

  <ParamField type="tuple[str, ...] | list[str] | str | None">
    会话关闭之前执行的可选命令
  </ParamField><ParamField type="BaseExecutionPolicy | None">
    执行策略控制超时、输出限制和资源配置。选项：

    * `HostExecutionPolicy` - 完全主机访问（默认）；最适合代理已在容器或虚拟机内运行的受信任环境
    * `DockerExecutionPolicy` - 为每个代理运行启动一个单独的 Docker 容器，提供更严格的隔离
    * `CodexSandboxExecutionPolicy` - 重用 Codex CLI 沙箱以实现额外的系统调用/文件系统限制
  </ParamField>

  <ParamField type="tuple[RedactionRule, ...] | list[RedactionRule] | None">
    可选的编辑规则，用于在将命令输出返回到模型之前对其进行清理。

    <Warning>
      编辑规则在执行后应用，并且在使用 `HostExecutionPolicy` 时不会阻止机密或敏感数据的泄露。
    </Warning>
  </ParamField>

  <ParamField type="str | None">
    注册 shell 工具描述的可选覆盖
  </ParamField>

  <ParamField type="Sequence[str] | str | None">
    用于启动持久会话的可选 shell 可执行文件（字符串）或参数序列。默认为`/bin/bash`。
  </ParamField>

  <ParamField type="Mapping[str, Any] | None">
    提供给 shell 会话的可选环境变量。在命令执行之前，值被强制转换为字符串。
  </ParamField>
</Accordion>

<Accordion title="Full example">
  中间件提供了一个持久的 shell 会话，代理可以使用该会话来顺序执行命令。**执行政策：**

  * `HostExecutionPolicy`（默认）- 具有完全主机访问权限的本机执行
  * `DockerExecutionPolicy` - 隔离的 Docker 容器执行
  * `CodexSandboxExecutionPolicy` - 通过 Codex CLI 沙盒执行

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import (
      ShellToolMiddleware,
      HostExecutionPolicy,
      DockerExecutionPolicy,
      RedactionRule,
  )


  # Basic shell tool with host execution
  agent = create_agent(
      model="gpt-5.5",
      tools=[search_tool],
      middleware=[
          ShellToolMiddleware(
              workspace_root="/workspace",
              execution_policy=HostExecutionPolicy(),
          ),
      ],
  )

  # Docker isolation with startup commands
  agent_docker = create_agent(
      model="gpt-5.5",
      tools=[],
      middleware=[
          ShellToolMiddleware(
              workspace_root="/workspace",
              startup_commands=["pip install requests", "export PYTHONPATH=/workspace"],
              execution_policy=DockerExecutionPolicy(
                  image="python:3.11-slim",
                  command_timeout=60.0,
              ),
          ),
      ],
  )

  # With output redaction (applied post execution)
  agent_redacted = create_agent(
      model="gpt-5.5",
      tools=[],
      middleware=[
          ShellToolMiddleware(
              workspace_root="/workspace",
              redaction_rules=[
                  RedactionRule(pii_type="api_key", detector=r"sk-[a-zA-Z0-9]{32}"),
              ],
          ),
      ],
  )
  ```
</Accordion>

### 文件搜索

在文件系统上提供 Glob 和 Grep 搜索工具。文件搜索中间件可用于以下用途：

* 代码探索与分析
* 按名称模式查找文件
* 使用正则表达式搜索代码内容
* 需要文件发现的大型代码库

**API参考：** [⟦T202⟧](https://reference.langchain.com/python/langchain/agents/middleware/file_search/FilesystemFileSearchMiddleware)

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import FilesystemFileSearchMiddleware

agent = create_agent(
    model="gpt-5.5",
    tools=[],
    middleware=[
        FilesystemFileSearchMiddleware(
            root_path="/workspace",
            use_ripgrep=True,
        ),
    ],
)
```

<Accordion title="Configuration options">
  <ParamField type="str">
    要搜索的根目录。所有的文件操作都是相对于这个路径的。
  </ParamField>

  <ParamField type="bool">
    是否使用 ripgrep 进行搜索。如果 ripgrep 不可用，则回退到 Python 正则表达式。
  </ParamField>

  <ParamField type="int">
    要搜索的最大文件大小（以 MB 为单位）。大于此大小的文件将被跳过。
  </ParamField>
</Accordion>

<Accordion title="Full example">
  中间件为代理添加了两个搜索工具：

  **Glob 工具** - 快速文件模式匹配：

  * 支持`**/*.py`、`src/**/*.ts`等图案
  * 返回按修改时间排序的匹配文件路径

  **Grep 工具** - 使用正则表达式进行内容搜索：* 完整的正则表达式语法支持
  * 使用`include`参数按文件模式过滤
  * 三种输出模式：`files_with_matches`、`content`、`count`

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import FilesystemFileSearchMiddleware
  from langchain.messages import HumanMessage


  agent = create_agent(
      model="gpt-5.5",
      tools=[],
      middleware=[
          FilesystemFileSearchMiddleware(
              root_path="/workspace",
              use_ripgrep=True,
              max_file_size_mb=10,
          ),
      ],
  )

  # Agent can now use glob_search and grep_search tools
  result = agent.invoke({
      "messages": [HumanMessage("Find all Python files containing 'async def'")]
  })

  # The agent will use:
  # 1. glob_search(pattern="**/*.py") to find Python files
  # 2. grep_search(pattern="async def", include="*.py") to find async functions
  ```
</Accordion>

### 文件系统中间件

上下文工程是构建有效代理的主要挑战。当使用返回可变长度结果的工具（例如，`web_search`和RAG）时，这尤其困难，因为长工具结果可以快速填充您的上下文窗口。

[Deep Agents](/oss/python/deepagents/overview) 中的`FilesystemMiddleware` 提供了四种与短期和长期记忆交互的工具：

* `ls`：列出文件系统中的文件
* `read_file`：读取整个文件或文件中的特定行数
* `write_file`：将新文件写入文件系统
* `edit_file`：编辑文件系统中的现有文件

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from deepagents.middleware.filesystem import FilesystemMiddleware

# FilesystemMiddleware is included by default in create_deep_agent
# You can customize it if building a custom agent
agent = create_agent(
    model="claude-sonnet-4-6",
    middleware=[
        FilesystemMiddleware(
            backend=None,  # Optional: custom backend (defaults to StateBackend)
            system_prompt="Write to the filesystem when...",  # Optional custom addition to the system prompt
            custom_tool_descriptions={
                "ls": "Use the ls tool when...",
                "read_file": "Use the read_file tool to..."
            },  # Optional: Custom descriptions for filesystem tools
            tools=["read_file", "ls", "glob", "grep"],  # Optional: Allowlist restricting which filesystem tools are exposed
        ),
    ],
)
```

#### 短期与长期文件系统

默认情况下，这些工具会写入图形状态下的本地“文件系统”。要跨线程启用持久存储，请配置将特定路径（如 `/memories/`）路由到 `StoreBackend` 的 `CompositeBackend`。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from deepagents.middleware import FilesystemMiddleware
from deepagents.backends import CompositeBackend, StateBackend, StoreBackend
from langgraph.store.memory import InMemoryStore

store = InMemoryStore()

agent = create_agent(
    model="claude-sonnet-4-6",
    store=store,
    middleware=[
        FilesystemMiddleware(
            backend=CompositeBackend(
                default=StateBackend(),
                routes={"/memories/": StoreBackend()}
            ),
            custom_tool_descriptions={
                "ls": "Use the ls tool when...",
                "read_file": "Use the read_file tool to..."
            }  # Optional: Custom descriptions for filesystem tools
        ),
    ],
)
```

当您为 `/memories/` 配置 `CompositeBackend` 和 `StoreBackend` 时，任何以 **/memories/** 为前缀的文件都会保存到持久存储中，并在不同线程中保存。没有此前缀的文件保留在临时状态存储中。### 子代理

将任务交给子代理可以隔离上下文，保持主（主管）代理的上下文窗口干净，同时仍然深入执行任务。

[Deep Agents](/oss/python/deepagents/overview) 的子代理中间件允许您通过 `task` 工具提供子代理。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool
from langchain.agents import create_agent
from deepagents.middleware.subagents import SubAgentMiddleware


@tool
def get_weather(city: str) -> str:
    """Get the weather in a city."""
    return f"The weather in {city} is sunny."

agent = create_agent(
    model="claude-sonnet-4-6",
    middleware=[
        SubAgentMiddleware(
            default_model="claude-sonnet-4-6",
            default_tools=[],
            subagents=[
                {
                    "name": "weather",
                    "description": "This subagent can get weather in cities.",
                    "system_prompt": "Use the get_weather tool to get the weather in a city.",
                    "tools": [get_weather],
                    "model": "gpt-5.5",
                    "middleware": [],
                }
            ],
        )
    ],
)
```

子代理使用**名称**、**描述**、**系统提示**和**工具**进行定义。您还可以为子代理提供自定义**模型**或附加**中间件**。当您想要为子代理提供额外的状态密钥以与主代理共享时，这尤其有用。

对于更复杂的用例，您还可以提供自己的预构建 LangGraph 图作为子代理。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from deepagents.middleware.subagents import SubAgentMiddleware
from deepagents import CompiledSubAgent
from langgraph.graph import StateGraph

# Create a custom LangGraph graph
def create_weather_graph():
    workflow = StateGraph(...)
    # Build your custom graph
    return workflow.compile()

weather_graph = create_weather_graph()

# Wrap it in a CompiledSubAgent
weather_subagent = CompiledSubAgent(
    name="weather",
    description="This subagent can get weather in cities.",
    runnable=weather_graph
)

agent = create_agent(
    model="claude-sonnet-4-6",
    middleware=[
        SubAgentMiddleware(
            default_model="claude-sonnet-4-6",
            default_tools=[],
            subagents=[weather_subagent],
        )
    ],
)
```

除了任何用户定义的子代理之外，主代理还可以随时访问`general-purpose`子代理。该子代理具有与主代理相同的指令以及它有权访问的所有工具。 `general-purpose` 子代理的主要目的是上下文隔离——主代理可以将复杂的任务委托给该子代理，并获得简洁的答案，而不会因中间工具调用而造成臃肿。

### 评分标准

<Note>
  `RubricMiddleware` 需要 `deepagents>=0.6.5`。位于[**beta**](/oss/python/versioning)； API 将来可能会发生变化。
</Note>有些任务有明确的“完成”定义，代理无法在第一次尝试时可靠地完成任务。 `RubricMiddleware` 允许您将“完成的内容”声明为评分标准，并让代理进行自我评估和迭代，直到满足评分标准或达到最大迭代上限。

**API参考：** [⟦T227⟧](https://reference.langchain.com/python/deepagents/middleware/rubric/RubricMiddleware)

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_deep_agent(
      model="google_genai:gemini-3.6-flash",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              max_iterations=3,
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_deep_agent(
      model="openai:gpt-5.5",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              max_iterations=3,
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_deep_agent(
      model="anthropic:claude-sonnet-4-6",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              max_iterations=3,
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_deep_agent(
      model="openrouter:z-ai/glm-5.2",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              max_iterations=3,
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_deep_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              max_iterations=3,
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_deep_agent(
      model="baseten:zai-org/GLM-5.2",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              max_iterations=3,
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_deep_agent(
      model="ollama:north-mini-code-1.0",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              max_iterations=3,
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```
</CodeGroup>

有关完整的配置选项、流事件和完整的代码生成示例，请参阅[Grading rubrics](/oss/python/deepagents/rubric)。

## 特定于提供商的中间件

这些中间件针对特定的 LLM 提供商进行了优化。有关完整的详细信息和示例，请参阅每个提供商的文档。

<Columns>
  <Card title="Anthropic" href="/oss/python/integrations/middleware/anthropic" icon="https://mintcdn.com/langchain-5e9cc07a/y4fKEo7ANyWBQMjp/images/providers/anthropic-icon.svg?fit=max&auto=format&n=y4fKEo7ANyWBQMjp&q=85&s=9212db764598a2d3f02f471b5436ae9e">
    Claude 模型的提示缓存、bash 工具、文本编辑器、内存和文件搜索中间件。
  </Card>

  <Card title="AWS" href="/oss/python/integrations/middleware/aws" icon="brand-aws">
    Amazon Bedrock 模型的提示缓存中间件。
  </Card>

  <Card title="OpenAI" href="/oss/python/integrations/middleware/openai" icon="brand-openai">
    适用于 OpenAI 模型的内容审核中间件。
  </Card>
</Columns>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/middleware/built-in.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>