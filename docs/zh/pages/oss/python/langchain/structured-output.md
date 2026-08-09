<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Structured output | https://docs.langchain.com/oss/python/langchain/structured-output -->

# 结构化输出

结构化输出允许代理以特定的、可预测的格式返回数据。您无需解析自然语言响应，而是获得 JSON 对象、[Pydantic models](https://docs.pydantic.dev/latest/concepts/models/#basic-model-usage) 或应用程序可以直接使用的数据类形式的结构化数据。

<Tip>
  本页介绍了使用 `create_agent` 的代理的结构化输出。要直接在模型上（在代理之外）使用结构化输出，请参阅[Models - Structured output](/oss/python/langchain/models#structured-output)。
</Tip>

LangChain的[⟦T30⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)自动处理结构化输出。用户设置所需的结构化输出模式，当模型生成结构化数据时，它会被捕获、验证并以代理状态的 `'structured_response'` 键返回。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def create_agent(
    ...
    response_format: Union[
        ToolStrategy[StructuredResponseT],
        ProviderStrategy[StructuredResponseT],
        type[StructuredResponseT],
        None,
    ]
)
```

## 响应格式

使用`response_format`控制代理如何返回结构化数据：

* **`ToolStrategy[StructuredResponseT]`**：使用工具调用进行结构化输出
* **`ProviderStrategy[StructuredResponseT]`**：使用提供者本机结构化输出
* **`type[StructuredResponseT]`**：模式类型 - 根据模型能力自动选择最佳策略
* **`None`**：未明确请求结构化输出

当直接提供模式类型时，LangChain会自动选择：* `ProviderStrategy` 如果选择的模型和提供程序支持本机结构化输出（例如 [OpenAI](/oss/python/integrations/providers/openai)、[Anthropic (Claude)](/oss/python/integrations/providers/anthropic) 或 [xAI (Grok)](/oss/python/integrations/providers/xai)）。
* `ToolStrategy` 适用于所有其他型号。

<Warning>
  JSON 模式字典必须包装在显式策略中（`ProviderStrategy` 或 `ToolStrategy`）。当直接传递到`response_format`时，不会自动检测到它们。
</Warning>

<Note>
  如果使用 `langchain>=1.1`，则从模型的 [profile data](/oss/python/langchain/models#model-profiles) 动态读取对本机结构化输出功能的支持。如果数据不可用，请使用其他条件或手动指定：

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  custom_profile = {
      "structured_output": True,
      # ...
  }
  model = init_chat_model("...", profile=custom_profile)
  ```

  如果指定了工具，则模型必须支持同时使用工具和结构化输出。
</Note>

结构化响应以代理最终状态的 `structured_response` 键返回。

## 提供商策略

一些模型提供商通过其 API 原生支持结构化输出（例如 OpenAI、xAI (Grok)、Gemini、Anthropic (Claude)）。这是可用时最可靠的方法。

要使用此策略，请配置 `ProviderStrategy`：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
class ProviderStrategy(Generic[SchemaT]):
    schema: type[SchemaT]
    strict: bool | None = None
```

<Info>
  `strict` 参数需要 `langchain>=1.2`。
</Info>

<ParamField>
  定义结构化输出格式的模式。支持：* **Pydantic 模型**：具有现场验证的`BaseModel` 子类。返回经过验证的 Pydantic 实例。
  * **数据类**：带有类型注释的Python数据类。返回字典。
  * **TypedDict**：类型化字典类。返回字典。
  * **JSON Schema**：具有 JSON 模式规范的字典。必须包含顶级 `title` 和 `description` 键。返回字典。
</ParamField>

<ParamField>
  可选的布尔参数，用于启用严格的模式遵守。受某些提供商支持（例如，[OpenAI](/oss/python/integrations/chat/openai) 和 [xAI](/oss/python/integrations/chat/xai)）。默认为 `None`（禁用）。
</ParamField>

当您将模式类型直接传递给[⟦T52⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)并且模型支持原生结构化输出时，LangChain会自动使用`ProviderStrategy`：

<CodeGroup>
  ```python Pydantic Model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from pydantic import BaseModel, Field
  from langchain.agents import create_agent


  class ContactInfo(BaseModel):
      """Contact information for a person."""
      name: str = Field(description="The name of the person")
      email: str = Field(description="The email address of the person")
      phone: str = Field(description="The phone number of the person")

  agent = create_agent(
      model="gpt-5.5",
      response_format=ContactInfo  # Auto-selects ProviderStrategy
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "Extract contact info from: John Doe, john@example.com, (555) 123-4567"}]
  })

  print(result["structured_response"])
  # ContactInfo(name='John Doe', email='john@example.com', phone='(555) 123-4567')
  ```

  ```python Dataclass theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass
  from langchain.agents import create_agent


  @dataclass
  class ContactInfo:
      """Contact information for a person."""
      name: str # The name of the person
      email: str # The email address of the person
      phone: str # The phone number of the person

  agent = create_agent(
      model="gpt-5.5",
      tools=tools,
      response_format=ContactInfo  # Auto-selects ProviderStrategy
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "Extract contact info from: John Doe, john@example.com, (555) 123-4567"}]
  })

  result["structured_response"]
  # {'name': 'John Doe', 'email': 'john@example.com', 'phone': '(555) 123-4567'}
  ```

  ```python TypedDict theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from typing_extensions import TypedDict
  from langchain.agents import create_agent


  class ContactInfo(TypedDict):
      """Contact information for a person."""
      name: str # The name of the person
      email: str # The email address of the person
      phone: str # The phone number of the person

  agent = create_agent(
      model="gpt-5.5",
      tools=tools,
      response_format=ContactInfo  # Auto-selects ProviderStrategy
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "Extract contact info from: John Doe, john@example.com, (555) 123-4567"}]
  })

  result["structured_response"]
  # {'name': 'John Doe', 'email': 'john@example.com', 'phone': '(555) 123-4567'}
  ```

  ```python JSON Schema theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.structured_output import ProviderStrategy


  contact_info_schema = {
      "title": "ContactInfo",
      "type": "object",
      "description": "Contact information for a person.",
      "properties": {
          "name": {"type": "string", "description": "The name of the person"},
          "email": {"type": "string", "description": "The email address of the person"},
          "phone": {"type": "string", "description": "The phone number of the person"}
      },
      "required": ["name", "email", "phone"]
  }

  agent = create_agent(
      model="gpt-5.5",
      tools=tools,
      response_format=ProviderStrategy(contact_info_schema)
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "Extract contact info from: John Doe, john@example.com, (555) 123-4567"}]
  })

  result["structured_response"]
  # {'name': 'John Doe', 'email': 'john@example.com', 'phone': '(555) 123-4567'}
  ```
</CodeGroup>

提供者本机结构化输出提供高可靠性和严格的验证，因为模型提供者强制执行架构。可用时使用它。

<Note>
  如果提供程序本身支持您选择的模型的结构化输出，则在功能上相当于编写 `response_format=ProductReview` 而不是 `response_format=ProviderStrategy(ProductReview)`。

  在任何一种情况下，如果不支持结构化输出，代理将回退到工具调用策略。
</Note>

## 工具调用策略对于不支持原生结构化输出的模型，LangChain 使用工具调用来达到相同的结果。这适用于所有支持工具调用的模型（大多数现代模型）。

要使用此策略，请配置 `ToolStrategy`：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
class ToolStrategy(Generic[SchemaT]):
    schema: type[SchemaT]
    tool_message_content: str | None
    handle_errors: Union[
        bool,
        str,
        type[Exception],
        tuple[type[Exception], ...],
        Callable[[Exception], str],
    ]
```

<ParamField>
  定义结构化输出格式的模式。支持：

  * **Pydantic 模型**：具有现场验证的`BaseModel` 子类。返回经过验证的 Pydantic 实例。
  * **数据类**：带有类型注释的Python数据类。返回字典。
  * **TypedDict**：类型化字典类。返回字典。
  * **JSON Schema**：具有 JSON 模式规范的字典。必须包含顶级 `title` 和 `description` 键。返回字典。
  * **联合类型**：多个架构选项。该模型将根据上下文选择最合适的模式。
</ParamField>

<ParamField>
  生成结构化输出时返回的工具消息的自定义内容。
  如果未提供，则默认显示一条显示结构化响应数据的消息。
</ParamField>

<ParamField>
  结构化输出验证失败的错误处理策略。默认为`True`。* **`True`**：使用默认错误模板捕获所有错误
  * **`str`**：使用此自定义消息捕获所有错误
  * **`type[Exception]`**：仅捕获带有默认消息的异常类型
  * **`tuple[type[Exception], ...]`**：仅捕获这些带有默认消息的异常类型
  * **`Callable[[Exception], str]`**：返回错误消息的自定义函数
  * **`False`**：不重试，让异常传播
</ParamField>

<CodeGroup>
  ```python Pydantic Model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from pydantic import BaseModel, Field
  from typing import Literal
  from langchain.agents import create_agent
  from langchain.agents.structured_output import ToolStrategy


  class ProductReview(BaseModel):
      """Analysis of a product review."""
      rating: int | None = Field(description="The rating of the product", ge=1, le=5)
      sentiment: Literal["positive", "negative"] = Field(description="The sentiment of the review")
      key_points: list[str] = Field(description="The key points of the review. Lowercase, 1-3 words each.")

  agent = create_agent(
      model="gpt-5.5",
      tools=tools,
      response_format=ToolStrategy(ProductReview)
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "Analyze this review: 'Great product: 5 out of 5 stars. Fast shipping, but expensive'"}]
  })
  result["structured_response"]
  # ProductReview(rating=5, sentiment='positive', key_points=['fast shipping', 'expensive'])
  ```

  ```python Dataclass theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from dataclasses import dataclass
  from typing import Literal
  from langchain.agents import create_agent
  from langchain.agents.structured_output import ToolStrategy


  @dataclass
  class ProductReview:
      """Analysis of a product review."""
      rating: int | None  # The rating of the product (1-5)
      sentiment: Literal["positive", "negative"]  # The sentiment of the review
      key_points: list[str]  # The key points of the review

  agent = create_agent(
      model="gpt-5.5",
      tools=tools,
      response_format=ToolStrategy(ProductReview)
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "Analyze this review: 'Great product: 5 out of 5 stars. Fast shipping, but expensive'"}]
  })
  result["structured_response"]
  # {'rating': 5, 'sentiment': 'positive', 'key_points': ['fast shipping', 'expensive']}
  ```

  ```python TypedDict theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from typing import Literal
  from typing_extensions import TypedDict
  from langchain.agents import create_agent
  from langchain.agents.structured_output import ToolStrategy


  class ProductReview(TypedDict):
      """Analysis of a product review."""
      rating: int | None  # The rating of the product (1-5)
      sentiment: Literal["positive", "negative"]  # The sentiment of the review
      key_points: list[str]  # The key points of the review

  agent = create_agent(
      model="gpt-5.5",
      tools=tools,
      response_format=ToolStrategy(ProductReview)
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "Analyze this review: 'Great product: 5 out of 5 stars. Fast shipping, but expensive'"}]
  })
  result["structured_response"]
  # {'rating': 5, 'sentiment': 'positive', 'key_points': ['fast shipping', 'expensive']}
  ```

  ```python JSON Schema theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.structured_output import ToolStrategy


  product_review_schema = {
      "title": "ProductReview",
      "type": "object",
      "description": "Analysis of a product review.",
      "properties": {
          "rating": {
              "type": ["integer", "null"],
              "description": "The rating of the product (1-5)",
              "minimum": 1,
              "maximum": 5
          },
          "sentiment": {
              "type": "string",
              "enum": ["positive", "negative"],
              "description": "The sentiment of the review"
          },
          "key_points": {
              "type": "array",
              "items": {"type": "string"},
              "description": "The key points of the review"
          }
      },
      "required": ["sentiment", "key_points"]
  }

  agent = create_agent(
      model="gpt-5.5",
      tools=tools,
      response_format=ToolStrategy(product_review_schema)
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "Analyze this review: 'Great product: 5 out of 5 stars. Fast shipping, but expensive'"}]
  })
  result["structured_response"]
  # {'rating': 5, 'sentiment': 'positive', 'key_points': ['fast shipping', 'expensive']}
  ```

  ```python Union Types theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from pydantic import BaseModel, Field
  from typing import Literal, Union
  from langchain.agents import create_agent
  from langchain.agents.structured_output import ToolStrategy


  class ProductReview(BaseModel):
      """Analysis of a product review."""
      rating: int | None = Field(description="The rating of the product", ge=1, le=5)
      sentiment: Literal["positive", "negative"] = Field(description="The sentiment of the review")
      key_points: list[str] = Field(description="The key points of the review. Lowercase, 1-3 words each.")

  class CustomerComplaint(BaseModel):
      """A customer complaint about a product or service."""
      issue_type: Literal["product", "service", "shipping", "billing"] = Field(description="The type of issue")
      severity: Literal["low", "medium", "high"] = Field(description="The severity of the complaint")
      description: str = Field(description="Brief description of the complaint")

  agent = create_agent(
      model="gpt-5.5",
      tools=tools,
      response_format=ToolStrategy(Union[ProductReview, CustomerComplaint])
  )

  result = agent.invoke({
      "messages": [{"role": "user", "content": "Analyze this review: 'Great product: 5 out of 5 stars. Fast shipping, but expensive'"}]
  })
  result["structured_response"]
  # ProductReview(rating=5, sentiment='positive', key_points=['fast shipping', 'expensive'])
  ```
</CodeGroup>

### 自定义工具消息内容

`tool_message_content` 参数允许您自定义生成结构化输出时出现在对话历史记录中的消息：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from pydantic import BaseModel, Field
from typing import Literal
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy


class MeetingAction(BaseModel):
    """Action items extracted from a meeting transcript."""
    task: str = Field(description="The specific task to be completed")
    assignee: str = Field(description="Person responsible for the task")
    priority: Literal["low", "medium", "high"] = Field(description="Priority level")

agent = create_agent(
    model="gpt-5.5",
    tools=[],
    response_format=ToolStrategy(
        schema=MeetingAction,
        tool_message_content="Action item captured and added to meeting notes!"
    )
)

agent.invoke({
    "messages": [{"role": "user", "content": "From our meeting: Sarah needs to update the project timeline as soon as possible"}]
})
```

```
================================ Human Message =================================

From our meeting: Sarah needs to update the project timeline as soon as possible
================================== Ai Message ==================================
Tool Calls:
  MeetingAction (call_1)
 Call ID: call_1
  Args:
    task: Update the project timeline
    assignee: Sarah
    priority: high
================================= Tool Message =================================
Name: MeetingAction

Action item captured and added to meeting notes!
```

如果没有`tool_message_content`，我们最终的[⟦T68⟧](https://reference.langchain.com/python/langchain-core/messages/tool/ToolMessage)将是：

```
================================= Tool Message =================================
Name: MeetingAction

Returning structured response: {'task': 'update the project timeline', 'assignee': 'Sarah', 'priority': 'high'}
```

### 错误处理

通过工具调用生成结构化输出时，模型可能会出错。 LangChain提供了智能重试机制来自动处理这些错误。

#### 多个结构化输出错误

当模型错误调用多个结构化输出工具时，代理会在[⟦T69⟧](https://reference.langchain.com/python/langchain-core/messages/tool/ToolMessage)中提供错误反馈并提示模型重试：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from pydantic import BaseModel, Field
from typing import Union
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy


class ContactInfo(BaseModel):
    name: str = Field(description="Person's name")
    email: str = Field(description="Email address")

class EventDetails(BaseModel):
    event_name: str = Field(description="Name of the event")
    date: str = Field(description="Event date")

agent = create_agent(
    model="gpt-5.5",
    tools=[],
    response_format=ToolStrategy(Union[ContactInfo, EventDetails])  # Default: handle_errors=True
)

agent.invoke({
    "messages": [{"role": "user", "content": "Extract info: John Doe (john@email.com) is organizing Tech Conference on March 15th"}]
})
```

```
================================ Human Message =================================

Extract info: John Doe (john@email.com) is organizing Tech Conference on March 15th
None
================================== Ai Message ==================================
Tool Calls:
  ContactInfo (call_1)
 Call ID: call_1
  Args:
    name: John Doe
    email: john@email.com
  EventDetails (call_2)
 Call ID: call_2
  Args:
    event_name: Tech Conference
    date: March 15th
================================= Tool Message =================================
Name: ContactInfo

Error: Model incorrectly returned multiple structured responses (ContactInfo, EventDetails) when only one is expected.
 Please fix your mistakes.
================================= Tool Message =================================
Name: EventDetails

Error: Model incorrectly returned multiple structured responses (ContactInfo, EventDetails) when only one is expected.
 Please fix your mistakes.
================================== Ai Message ==================================
Tool Calls:
  ContactInfo (call_3)
 Call ID: call_3
  Args:
    name: John Doe
    email: john@email.com
================================= Tool Message =================================
Name: ContactInfo

Returning structured response: {'name': 'John Doe', 'email': 'john@email.com'}
```

#### 架构验证错误

当结构化输出与预期架构不匹配时，代理会提供特定的错误反馈：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from pydantic import BaseModel, Field
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy


class ProductRating(BaseModel):
    rating: int | None = Field(description="Rating from 1-5", ge=1, le=5)
    comment: str = Field(description="Review comment")

agent = create_agent(
    model="gpt-5.5",
    tools=[],
    response_format=ToolStrategy(ProductRating),  # Default: handle_errors=True
    system_prompt="You are a helpful assistant that parses product reviews. Do not make any field or value up."
)

agent.invoke({
    "messages": [{"role": "user", "content": "Parse this: Amazing product, 10/10!"}]
})
```

```
================================ Human Message =================================

Parse this: Amazing product, 10/10!
================================== Ai Message ==================================
Tool Calls:
  ProductRating (call_1)
 Call ID: call_1
  Args:
    rating: 10
    comment: Amazing product
================================= Tool Message =================================
Name: ProductRating

Error: Failed to parse structured output for tool 'ProductRating': 1 validation error for ProductRating.rating
  Input should be less than or equal to 5 [type=less_than_equal, input_value=10, input_type=int].
 Please fix your mistakes.
================================== Ai Message ==================================
Tool Calls:
  ProductRating (call_2)
 Call ID: call_2
  Args:
    rating: 5
    comment: Amazing product
================================= Tool Message =================================
Name: ProductRating

Returning structured response: {'rating': 5, 'comment': 'Amazing product'}
```#### 错误处理策略

您可以使用 `handle_errors` 参数自定义错误处理方式：

**自定义错误消息：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ToolStrategy(
    schema=ProductRating,
    handle_errors="Please provide a valid rating between 1-5 and include a comment."
)
```

如果 `handle_errors` 是一个字符串，代理将*总是*使用固定的工具消息提示模型重试：

```
================================= Tool Message =================================
Name: ProductRating

Please provide a valid rating between 1-5 and include a comment.
```

**仅处理特定异常：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ToolStrategy(
    schema=ProductRating,
    handle_errors=ValueError  # Only retry on ValueError, raise others
)
```

如果 `handle_errors` 是异常类型，则仅当引发的异常是指定类型时，代理才会重试（使用默认错误消息）。在所有其他情况下，都会引发异常。

**处理多种异常类型：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ToolStrategy(
    schema=ProductRating,
    handle_errors=(ValueError, TypeError)  # Retry on ValueError and TypeError
)
```

如果 `handle_errors` 是异常元组，则仅当引发的异常是指定类型之一时，代理才会重试（使用默认错误消息）。在所有其他情况下，都会引发异常。

**自定义错误处理函数：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}

from langchain.agents.structured_output import StructuredOutputValidationError
from langchain.agents.structured_output import MultipleStructuredOutputsError

def custom_error_handler(error: Exception) -> str:
    if isinstance(error, StructuredOutputValidationError):
        return "There was an issue with the format. Try again."
    elif isinstance(error, MultipleStructuredOutputsError):
        return "Multiple structured outputs were returned. Pick the most relevant one."
    else:
        return f"Error: {str(error)}"


agent = create_agent(
    model="gpt-5.5",
    tools=[],
    response_format=ToolStrategy(
                        schema=Union[ContactInfo, EventDetails],
                        handle_errors=custom_error_handler
                    )  # Default: handle_errors=True
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "Extract info: John Doe (john@email.com) is organizing Tech Conference on March 15th"}]
})

for msg in result['messages']:
    # If message is actually a ToolMessage object (not a dict), check its class name
    if type(msg).__name__ == "ToolMessage":
        print(msg.content)
    # If message is a dictionary or you want a fallback
    elif isinstance(msg, dict) and msg.get('tool_call_id'):
        print(msg['content'])

```

在`StructuredOutputValidationError`：

```
================================= Tool Message =================================
Name: ToolStrategy

There was an issue with the format. Try again.
```

在`MultipleStructuredOutputsError`：

```
================================= Tool Message =================================
Name: ToolStrategy

Multiple structured outputs were returned. Pick the most relevant one.
```

关于其他错误：

```
================================= Tool Message =================================
Name: ToolStrategy

Error: <error message>
```

**无错误处理：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
response_format = ToolStrategy(
    schema=ProductRating,
    handle_errors=False  # All errors raised
)
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/structured-output.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>