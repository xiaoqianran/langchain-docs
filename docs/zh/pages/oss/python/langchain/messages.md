<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Messages | https://docs.langchain.com/oss/python/langchain/messages -->

# 消息

消息是LangChain中模型上下文的基本单位。它们代表模型的输入和输出，携带与法学硕士交互时表示对话状态所需的内容和元数据。

消息是包含以下内容的对象：

* [**Role**](#message-types) - 标识消息类型（例如`system`、`user`）
* [**Content**](#message-content) - 表示消息的实际内容（如文本、图像、音频、文档等）
* [**Metadata**](#message-metadata) - 可选字段，例如响应信息、消息 ID 和令牌使用情况

LangChain 提供了适用于所有模型提供者的标准消息类型，确保无论调用哪个模型，行为都保持一致。

## 基本用法

使用消息的最简单方法是创建消息对象并在 [invoking](/oss/python/langchain/models#invocation) 时将它们传递给模型。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.chat_models import init_chat_model
from langchain.messages import HumanMessage, AIMessage, SystemMessage

model = init_chat_model("gpt-5-nano")

system_msg = SystemMessage("You are a helpful assistant.")
human_msg = HumanMessage("Hello, how are you?")

# Use with chat models
messages = [system_msg, human_msg]
response = model.invoke(messages)  # Returns AIMessage
```

> [!提示]
>
> 多回合[agents](/oss/python/langchain/agents)累积长消息历史。 [LangSmith](/langsmith/observability) 记录每个回合、工具结果和模型响应，以便您可以检查完整的对话。按照[tracing quickstart](/langsmith/trace-with-langchain)启用跟踪。
>
> 我们建议您还设置 [LangSmith Engine](/langsmith/engine) 来监控您的痕迹、检测问题并提出修复建议。

### 文字提示文本提示是字符串 - 非常适合不需要保留对话历史记录的简单生成任务。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
response = model.invoke("Write a haiku about spring")
```

**在以下情况下使用文本提示：**

* 您有一个独立的请求
* 您不需要对话历史记录
* 你想要最小的代码复杂性

### 消息提示

或者，您可以通过提供消息对象列表将消息列表传递到模型。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import SystemMessage, HumanMessage, AIMessage

messages = [
    SystemMessage("You are a poetry expert"),
    HumanMessage("Write a haiku about spring"),
    AIMessage("Cherry blossoms bloom...")
]
response = model.invoke(messages)
```

**在以下情况下使用消息提示：**

* 管理多轮对话
* 处理多模式内容（图像、音频、文件）
* 包括系统指令

### 字典格式

您还可以直接以 OpenAI 聊天完成格式指定消息。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
messages = [
    {"role": "system", "content": "You are a poetry expert"},
    {"role": "user", "content": "Write a haiku about spring"},
    {"role": "assistant", "content": "Cherry blossoms bloom..."}
]
response = model.invoke(messages)
```

## 消息类型

* [System message](#system-message) - 告诉模型如何表现并为交互提供上下文
* [Human message](#human-message) - 表示用户输入以及与模型的交互
* [AI message](#ai-message) - 模型生成的响应，包括文本内容、工具调用和元数据
* [Tool message](#tool-message) - 代表[tool calls](/oss/python/langchain/models#tool-calling)的输出

###系统消息[⟦T33⟧](https://reference.langchain.com/python/langchain-core/messages/system/SystemMessage) 表示启动模型行为的一组初始指令。您可以使用系统消息来定调、定义模型的角色并建立响应指南。

```python Basic instructions theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
system_msg = SystemMessage("You are a helpful coding assistant.")

messages = [
    system_msg,
    HumanMessage("How do I create a REST API?")
]
response = model.invoke(messages)
```

```python Detailed persona theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import SystemMessage, HumanMessage

system_msg = SystemMessage("""
You are a senior Python developer with expertise in web frameworks.
Always provide code examples and explain your reasoning.
Be concise but thorough in your explanations.
""")

messages = [
    system_msg,
    HumanMessage("How do I create a REST API?")
]
response = model.invoke(messages)
```

***

### 人类讯息

[⟦T34⟧](https://reference.langchain.com/python/langchain-core/messages/human/HumanMessage) 代表用户输入和交互。它们可以包含文本、图像、音频、文件和任何其他数量的多模式[content](#message-content)。

####文字内容

```python Message object theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
response = model.invoke([
  HumanMessage("What is machine learning?")
])
```

```python String shortcut theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Using a string is a shortcut for a single HumanMessage
response = model.invoke("What is machine learning?")
```

#### 消息元数据

```python Add metadata theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
human_msg = HumanMessage(
    content="Hello!",
    name="alice",  # Optional: identify different users
    id="msg_123",  # Optional: unique identifier for tracing
)
```

> [!注意]
>
> `name` 字段行为因提供商而异 — 有些将其用于用户识别，有些则忽略它。要检查，请参阅模型提供商的[reference](https://reference.langchain.com/python/integrations/)。

***

###人工智能消息

[⟦T36⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage) 表示模型调用的输出。它们可以包括多模式数据、工具调用以及您稍后可以访问的特定于提供商的元数据。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
response = model.invoke("Explain AI")
print(type(response))  # <class 'langchain.messages.AIMessage'>
```

[⟦T37⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage) 模型在调用时返回对象，其中包含响应中的所有关联元数据。

提供者以不同的方式权衡/上下文化消息类型，这意味着手动创建新的 [⟦T38⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage) 对象并将其插入消息历史记录中有时会很有帮助，就像它来自模型一样。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import AIMessage, SystemMessage, HumanMessage

# Create an AI message manually (e.g., for conversation history)
ai_msg = AIMessage("I'd be happy to help you with that question!")

# Add to conversation history
messages = [
    SystemMessage("You are a helpful assistant"),
    HumanMessage("Can you help me?"),
    ai_msg,  # Insert as if it came from the model
    HumanMessage("Great! What's 2+2?")
]

response = model.invoke(messages)
```> **属性**
>
> **文本** `string`
>
> 消息的文本内容。
>
> **内容** `string | dict[]`
>
> 消息的原始内容。
>
> **内容\_块** `ContentBlock[]`
>
> 消息的标准化[content blocks](#message-content)。
>
> **工具\_调用** `dict[] | None`
>
> 模型调用的工具。
>
> 如果没有调用任何工具则为空。
>
> **id** `string`
>
> 消息的唯一标识符（由 LangChain 自动生成或在提供商响应中返回）
>
> **使用\_元数据** `dict | None`
>
> 消息的使用元数据，其中可以包含令牌计数（如果可用）。
>
> **响应\_元数据** `ResponseMetadata | None`
>
> 消息的响应元数据。

#### 工具调用

当模型制作[tool calls](/oss/python/langchain/models#tool-calling)时，它们包含在[⟦T46⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage)中：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.chat_models import init_chat_model

model = init_chat_model("gpt-5-nano")

def get_weather(location: str) -> str:
    """Get the weather at a location."""
    ...

model_with_tools = model.bind_tools([get_weather])
response = model_with_tools.invoke("What's the weather in Paris?")

for tool_call in response.tool_calls:
    print(f"Tool: {tool_call['name']}")
    print(f"Args: {tool_call['args']}")
    print(f"ID: {tool_call['id']}")
```

其他结构化数据，例如推理或引文，也可以出现在消息[content](/oss/python/langchain/messages#message-content)中。

#### 代币使用

[⟦T47⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage) 可以在其 [⟦T48⟧](https://reference.langchain.com/python/langchain-core/messages/ai/UsageMetadata) 字段中保存令牌计数和其他使用元数据：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.chat_models import init_chat_model

model = init_chat_model("gpt-5-nano")

response = model.invoke("Hello!")
response.usage_metadata
```

```
{'input_tokens': 8,
 'output_tokens': 304,
 'total_tokens': 312,
 'input_token_details': {'audio': 0, 'cache_read': 0},
 'output_token_details': {'audio': 0, 'reasoning': 256}}
```

详情请参阅[⟦T49⟧](https://reference.langchain.com/python/langchain-core/messages/ai/UsageMetadata)。

#### 流和块

在流式传输期间，您将收到 [⟦T50⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessageChunk) 对象，这些对象可以组合成完整的消息对象：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
chunks = []
full_message = None
for chunk in model.stream("Hi"):
    chunks.append(chunk)
    print(chunk.text)
    full_message = chunk if full_message is None else full_message + chunk
```

> [!注意]
>
> 了解更多：
>
> * [Streaming tokens from chat models](/oss/python/langchain/models#stream)
> * [Streaming tokens and/or steps from agents](/oss/python/langchain/streaming)

***

### 工具消息对于支持[tool calling](/oss/python/langchain/models#tool-calling)的模型，AI消息可以包含工具调用。工具消息用于将单个工具执行的结果传递回模型。

[Tools](/oss/python/langchain/tools)可以直接生成[⟦T51⟧](https://reference.langchain.com/python/langchain-core/messages/tool/ToolMessage)对象。下面，我们展示一个简单的例子。阅读[tools guide](/oss/python/langchain/tools)了解更多信息。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import AIMessage
from langchain.messages import ToolMessage

# After a model makes a tool call
# (Here, we demonstrate manually creating the messages for brevity)
ai_message = AIMessage(
    content=[],
    tool_calls=[{
        "name": "get_weather",
        "args": {"location": "San Francisco"},
        "id": "call_123"
    }]
)

# Execute tool and create result message
weather_result = "Sunny, 72°F"
tool_message = ToolMessage(
    content=weather_result,
    tool_call_id="call_123"  # Must match the call ID
)

# Continue conversation
messages = [
    HumanMessage("What's the weather in San Francisco?"),
    ai_message,  # Model's tool call
    tool_message,  # Tool execution result
]
response = model.invoke(messages)  # Model processes the result
```

> **属性**
>
> **内容** `string` *必填*
>
> 工具调用的字符串化输出。
>
> **工具\_call\_id** `string` *必填*
>
> 此消息正在响应的工具调用的 ID。必须与 [⟦T54⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage) 中工具调用的 ID 匹配。
>
> **姓名** `string` *必填*
>
> 调用的工具的名称。
>
> **神器** `dict`
>
> 其他数据未发送到模型，但可以通过编程方式访问。> [!注意]
>
> `artifact` 字段存储不会发送到模型但可以通过编程方式访问的补充数据。这对于存储原始结果、调试信息或下游处理数据非常有用，而不会扰乱模型的上下文。
>
>> **示例：使用工件检索元数据**
>>
>> 例如，[retrieval](/oss/python/deepagents/retrieval) 工具可以从文档中检索一段段落以供模型参考。当消息`content`包含模型将引用的文本时，`artifact`可以包含应用程序可以使用的文档标识符或其他元数据（例如，用于呈现页面）。请参阅下面的示例：
>>
>> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > from langchain.messages import ToolMessage
> >
> > # Sent to model
> > message_content = "It was the best of times, it was the worst of times."
> >
> > # Artifact available downstream
> > artifact = {"document_id": "doc_123", "page": 0}
> >
> > tool_message = ToolMessage(
> >     content=message_content,
> >     tool_call_id="call_123",
> >     name="search_books",
> >     artifact=artifact,
> > )
> > ```
>>
>> 请参阅 [RAG tutorial](/oss/python/deepagents/rag)，了解使用 LangChain 构建检索 [agents](/oss/python/langchain/agents) 的端到端示例。

***

## 留言内容

您可以将消息的内容视为发送到模型的数据的有效负载。消息具有松散类型的 `content` 属性，支持字符串和非类型化对象列表（例如字典）。这允许直接在LangChain聊天模型中支持提供者本机结构，例如[multimodal](#multimodal)内容和其他数据。另外，LangChain为文本、推理、引文、多模态数据、服务器端工具调用和其他消息内容提供专用内容类型。请参阅下面的[content blocks](#standard-content-blocks)。

LangChain 聊天模型接受 `content` 属性中的消息内容。

这可能包含：

1. 一根绳子
2. 提供者原生格式的内容块列表
3. [LangChain's standard content blocks](#standard-content-blocks)列表

请参阅下面使用 [multimodal](#multimodal) 输入的示例：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import HumanMessage

# String content
human_message = HumanMessage("Hello, how are you?")

# Provider-native format (e.g., OpenAI)
human_message = HumanMessage(content=[
    {"type": "text", "text": "Hello, how are you?"},
    {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
])

# List of standard content blocks
human_message = HumanMessage(content_blocks=[
    {"type": "text", "text": "Hello, how are you?"},
    {"type": "image", "url": "https://example.com/image.jpg"},
])
```

> [!提示]
>
> 初始化消息时指定`content_blocks`仍会填充消息
> `content`，但为此提供了类型安全的接口。

### 标准内容块

LangChain 提供跨提供商工作的消息内容的标准表示形式。

消息对象实现一个 `content_blocks` 属性，它将延迟地将 `content` 属性解析为标准的、类型安全的表示形式。例如，从[⟦T66⟧](/oss/python/integrations/chat/anthropic)或[⟦T67⟧](/oss/python/integrations/chat/openai)生成的消息将包含相应提供者格式的`thinking`或`reasoning`块，但可以延迟解析为一致的[⟦T70⟧](#content-block-reference)表示：

**Anthropic**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import AIMessage

message = AIMessage(
    content=[
        {"type": "thinking", "thinking": "...", "signature": "WaUjzkyp..."},
        {"type": "text", "text": "..."},
    ],
    response_metadata={"model_provider": "anthropic"}
)
message.content_blocks
```

```
[{'type': 'reasoning',
  'reasoning': '...',
  'extras': {'signature': 'WaUjzkyp...'}},
 {'type': 'text', 'text': '...'}]
```

**OpenAI**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import AIMessage

message = AIMessage(
    content=[
        {
            "type": "reasoning",
            "id": "rs_abc123",
            "summary": [
                {"type": "summary_text", "text": "summary 1"},
                {"type": "summary_text", "text": "summary 2"},
            ],
        },
        {"type": "text", "text": "...", "id": "msg_abc123"},
    ],
    response_metadata={"model_provider": "openai"}
)
message.content_blocks
```

```
[{'type': 'reasoning', 'id': 'rs_abc123', 'reasoning': 'summary 1'},
 {'type': 'reasoning', 'id': 'rs_abc123', 'reasoning': 'summary 2'},
 {'type': 'text', 'text': '...', 'id': 'msg_abc123'}]
```

请参阅 [integrations guides](/oss/python/integrations/providers/overview) 开始使用
您选择的推理提供者。> [!注意]
>
> **序列化标准内容**
>
> 如果 LangChain 之外的应用程序需要访问标准内容块
> 表示，您可以选择在消息内容中存储内容块。
>
> 为此，您可以将 `LC_OUTPUT_VERSION` 环境变量设置为 `v1`。或者，
> 使用 `output_version="v1"` 初始化任何聊天模型：
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain.chat_models import init_chat_model
>
> model = init_chat_model("gpt-5-nano", output_version="v1")
> ```

### 多式联运

**多模态**是指处理不同形式数据的能力
形式，例如文本、音频、图像和视频。 LangChain 包括标准类型
这些数据可以跨提供商使用。

[Chat models](/oss/python/langchain/models)可以接受多模态数据作为输入并生成
它作为输出。下面我们展示了具有多模式数据的输入消息的简短示例。

> [!注意]
>
> 额外的键可以包含在内容块的顶层或嵌套在 `"extras": {"key": value}` 中。
>
> [OpenAI](/oss/python/integrations/chat/openai),
> 例如，需要 PDF 的文件名。参见[provider page](/oss/python/integrations/providers/overview)
> 针对您选择的型号了解具体信息。

```python Image input theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# From URL
message = {
    "role": "user",
    "content": [
        {"type": "text", "text": "Describe the content of this image."},
        {"type": "image", "url": "https://example.com/path/to/image.jpg"},
    ]
}

# From base64 data
message = {
    "role": "user",
    "content": [
        {"type": "text", "text": "Describe the content of this image."},
        {
            "type": "image",
            "base64": "AAAAIGZ0eXBtcDQyAAAAAGlzb21tcDQyAAACAGlzb2...",
            "mime_type": "image/jpeg",
        },
    ]
}

# From provider-managed File ID
message = {
    "role": "user",
    "content": [
        {"type": "text", "text": "Describe the content of this image."},
        {"type": "image", "file_id": "file-abc123"},
    ]
}
```

```python PDF document input theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# From URL
message = {
    "role": "user",
    "content": [
        {"type": "text", "text": "Describe the content of this document."},
        {"type": "file", "url": "https://example.com/path/to/document.pdf"},
    ]
}

# From base64 data
message = {
    "role": "user",
    "content": [
        {"type": "text", "text": "Describe the content of this document."},
        {
            "type": "file",
            "base64": "AAAAIGZ0eXBtcDQyAAAAAGlzb21tcDQyAAACAGlzb2...",
            "mime_type": "application/pdf",
        },
    ]
}

# From provider-managed File ID
message = {
    "role": "user",
    "content": [
        {"type": "text", "text": "Describe the content of this document."},
        {"type": "file", "file_id": "file-abc123"},
    ]
}
```

```python Audio input theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# From base64 data
message = {
    "role": "user",
    "content": [
        {"type": "text", "text": "Describe the content of this audio."},
        {
            "type": "audio",
            "base64": "AAAAIGZ0eXBtcDQyAAAAAGlzb21tcDQyAAACAGlzb2...",
            "mime_type": "audio/wav",
        },
    ]
}

# From provider-managed File ID
message = {
    "role": "user",
    "content": [
        {"type": "text", "text": "Describe the content of this audio."},
        {"type": "audio", "file_id": "file-abc123"},
    ]
}
```

```python Video input theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# From base64 data
message = {
    "role": "user",
    "content": [
        {"type": "text", "text": "Describe the content of this video."},
        {
            "type": "video",
            "base64": "AAAAIGZ0eXBtcDQyAAAAAGlzb21tcDQyAAACAGlzb2...",
            "mime_type": "video/mp4",
        },
    ]
}

# From provider-managed File ID
message = {
    "role": "user",
    "content": [
        {"type": "text", "text": "Describe the content of this video."},
        {"type": "video", "file_id": "file-abc123"},
    ]
}
```

> [!警告]
>
> 并非所有型号都支持所有文件类型。检查模型提供商的[reference](https://reference.langchain.com/python/integrations/)以了解支持的格式和大小限制。

### 内容块引用内容块（在创建消息或访问 `content_blocks` 属性时）表示为类型化字典列表。列表中的每个项目必须遵守以下块类型之一：

> **核心**
>
>> **文本内容块**
>>
>> **用途：** 标准文本输出
>>
>> **类型** `string` *必填*
>>
>> 永远`"text"`
>>
>> **文字** `string` *必填*
>>
>> 正文内容
>>
>> **注释** `object[]`
>>
>> 文本注释列表
>>
>> **额外** `object`
>>
>> 其他特定于提供商的数据
>>
>> **示例：**
>>
>> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > {
> >     "type": "text",
> >     "text": "Hello world",
> >     "annotations": []
> > }
> > ```
>
>> **推理内容块**
>>
>> **目的：**模型推理步骤
>>
>> **类型** `string` *必填*
>>
>> 永远`"reasoning"`
>>
>> **推理** `string`
>>
>> 推理内容
>>
>> **额外** `object`
>>
>> 其他特定于提供商的数据
>>
>> **示例：**
>>
>> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > {
> >     "type": "reasoning",
> >     "reasoning": "The user is asking about...",
> >     "extras": {"signature": "abc123"},
> > }
> > ```> **多式联运**
>
>> **图像内容块**
>>
>> **用途：** 图像数据
>>
>> **类型** `string` *必填*
>>
>> 永远`"image"`
>>
>> **网址** `string`
>>
>> 指向图像位置的 URL。
>>
>> **base64** `string`
>>
>> Base64 编码的图像数据。
>>
>> **id** `string`
>>
>> 该内容块的唯一标识符（由提供者或LangChain生成）。
>>
>> **哑剧\_类型** `string`
>>
>> 图片[MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml#image)（例如，`image/jpeg`、`image/png`）。对于 Base64 数据是必需的。
>
>> **音频内容块**
>>
>> **用途：** 音频数据
>>
>> **类型** `string` *必填*
>>
>> 永远`"audio"`
>>
>> **网址** `string`
>>
>> 指向音频位置的 URL。
>>
>> **base64** `string`
>>
>> Base64 编码的音频数据。
>>
>> **id** `string`
>>
>> 该内容块的唯一标识符（由提供者或LangChain生成）。
>>
>> **mime\_type** `string`
>>
>> 音频[MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml#audio)（例如，`audio/mpeg`、`audio/wav`）。对于 Base64 数据是必需的。
>
>> **视频内容块**
>>
>> **用途：**视频数据
>>
>> **类型** `string` *必填*
>>
>> 永远`"video"`
>>
>> **网址** `string`
>>
>> 指向视频位置的 URL。
>>
>> **base64** `string`
>>
>> Base64 编码的视频数据。
>>>> **id** `string`
>>
>> 该内容块的唯一标识符（由提供者或LangChain生成）。
>>
>> **哑剧\_类型** `string`
>>
>> 视频 [MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml#video)（例如，`video/mp4`、`video/webm`）。对于 Base64 数据是必需的。
>
>> **文件内容块**
>>
>> **用途：** 通用文件（PDF等）
>>
>> **类型** `string` *必填*
>>
>> 永远`"file"`
>>
>> **网址** `string`
>>
>> 指向文件位置的URL。
>>
>> **base64** `string`
>>
>> Base64 编码的文件数据。
>>
>> **id** `string`
>>
>> 该内容块的唯一标识符（由提供者或LangChain生成）。
>>
>> **mime\_type** `string`
>>
>> 文件[MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml)（例如，`application/pdf`）。对于 Base64 数据是必需的。
>
>> **纯文本内容块**
>>
>> **用途：** 文档文本（`.txt`、`.md`）
>>
>> **类型** `string` *必填*
>>
>> 永远`"text-plain"`
>>
>> **文本** `string`
>>
>> 正文内容
>>
>> **哑剧\_类型** `string`
>>
>> 文本的[MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml)（例如，`text/plain`、`text/markdown`）> **工具调用**
>
>> **工具调用**
>>
>> **用途：**函数调用
>>
>> **类型** `string` *必填*
>>
>> 永远`"tool_call"`
>>
>> **姓名** `string` *必填*
>>
>> 调用的工具名称
>>
>> **参数** `object` *必填*
>>
>> 传递给工具的参数
>>
>> **id** `string` *必填*
>>
>> 该工具调用的唯一标识符
>>
>> **示例：**
>>
>> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > {
> >     "type": "tool_call",
> >     "name": "search",
> >     "args": {"query": "weather"},
> >     "id": "call_123"
> > }
> > ```
>
>> **工具调用块**
>>
>> **用途：** 流媒体工具调用片段
>>
>> **类型** `string` *必填*
>>
>> 永远`"tool_call_chunk"`
>>
>> **姓名** `string`
>>
>> 被调用的工具名称
>>
>> **参数** `string`
>>
>> 部分工具参数（可能是不完整的 JSON）
>>
>> **id** `string`
>>
>> 工具调用标识符
>>
>> **索引** `number | string`
>>
>> 该块在流中的位置
>
>> **无效工具调用**
>>
>> **目的：** 格式错误的调用，旨在捕获 JSON 解析错误。
>>
>> **类型** `string` *必填*
>>
>> 永远`"invalid_tool_call"`
>>
>> **姓名** `string`
>>
>> 调用失败的工具名称
>>
>> **参数** `object`
>>
>> 传递给工具的参数
>>
>> **错误** `string`
>>
>> 错误描述> **服务器端工具执行**
>
>> **服务器工具调用**
>>
>> **用途：** 在服务器端执行的工具调用。
>>
>> **类型** `string` *必填*
>>
>> 永远`"server_tool_call"`
>>
>> **id** `string` *必填*
>>
>> 与工具调用相关的标识符。
>>
>> **姓名** `string` *必填*
>>
>> 需要调用的工具的名称。
>>
>> **参数** `string` *必填*
>>
>> 部分工具参数（可能是不完整的 JSON）
>
>> **ServerToolCallChunk**
>>
>> **用途：**流式传输服务端工具调用片段
>>
>> **类型** `string` *必填*
>>
>> 永远`"server_tool_call_chunk"`
>>
>> **id** `string`
>>
>> 与工具调用相关的标识符。
>>
>> **姓名** `string`
>>
>> 被调用的工具名称
>>
>> **参数** `string`
>>
>> 部分工具参数（可能是不完整的 JSON）
>>
>> **索引** `number | string`
>>
>> 该块在流中的位置
>
>> **服务器工具结果**
>>
>> **用途：** 搜索结果
>>
>> **类型** `string` *必填*
>>
>> 永远`"server_tool_result"`
>>
>> **工具\_call\_id** `string` *必填*
>>
>> 相应服务器工具调用的标识符。
>>
>> **id** `string`
>>
>> 与服务器工具结果关联的标识符。
>>>> **状态** `string` *必填*
>>
>> 服务器端工具的执行状态。 `"success"` 或 `"error"`。
>>
>> **输出**
>>
>> 执行工具的输出。

> **特定于提供商的块**
>
>> **非标准内容块**
>>
>> **用途：** 提供商特定的逃生舱口
>>
>> **类型** `string` *必填*
>>
>> 永远`"non_standard"`
>>
>> **值** `object` *必填*
>>
>> 提供商特定的数据结构
>>
>> **用途：** 用于实验性或提供商独有的功能
>
> 其他特定于提供商的内容类型可以在每个模型提供商的 [reference documentation](/oss/python/integrations/providers/overview) 中找到。

> [!提示]
>
> 查看[API reference](https://reference.langchain.com/python/langchain/messages)中的规范类型定义。

> [!注意]
>
> 内容块作为 LangChain v1 中消息的新属性引入，以标准化跨提供商的内容格式，同时保持与现有代码的向后兼容性。
>
> 内容块并不是 [⟦T161⟧](https://reference.langchain.com/python/langchain-core/messages/base/BaseMessage) 属性的替代品，而是一个可用于以标准化格式访问消息内容的新属性。

## 序列化

您可以将消息序列化为普通对象进行存储，然后反序列化回消息实例。这对于保留对话历史记录和恢复会话非常有用。```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import HumanMessage
from langchain_core.load import dumpd, load

message = HumanMessage("What is the capital of France?")

# Serialize to a plain dict
serialized = dumpd(message)

# Deserialize back to a message object
restored = load(serialized)
```

> [!警告]
>
> **`load()` 实例化Python对象，并且可以在反序列化过程中触发副作用。切勿对来自不受信任或未经身份验证的来源的数据调用 `load()`。**

## 与聊天模型一起使用

[Chat models](/oss/python/langchain/models) 接受一系列消息对象作为输入，并返回 [⟦T164⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage) 作为输出。交互通常是无状态的，因此简单的对话循环涉及调用具有不断增长的消息列表的模型。

请参阅以下指南以了解更多信息：

* [persisting and managing conversation histories](/oss/python/langchain/short-term-memory)的内置功能
* 管理上下文窗口的策略，包括[trimming and summarizing messages](/oss/python/langchain/short-term-memory#common-patterns)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/messages.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。