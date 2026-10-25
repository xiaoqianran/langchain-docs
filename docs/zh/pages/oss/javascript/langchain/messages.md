<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Messages | https://docs.langchain.com/oss/javascript/langchain/messages -->

# 消息

消息是LangChain中模型上下文的基本单位。它们代表模型的输入和输出，携带与法学硕士交互时表示对话状态所需的内容和元数据。

消息是包含以下内容的对象：

* [**Role**](#message-types) - 标识消息类型（例如`system`、`user`）
* [**Content**](#message-content) - 表示消息的实际内容（如文本、图像、音频、文档等）
* [**Metadata**](#message-metadata) - 可选字段，例如响应信息、消息 ID 和令牌使用情况

LangChain 提供了适用于所有模型提供者的标准消息类型，确保无论调用哪个模型，行为都保持一致。

## 基本用法

使用消息的最简单方法是创建消息对象并在 [invoking](/oss/javascript/langchain/models#invocation) 时将它们传递给模型。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { initChatModel, HumanMessage, SystemMessage } from "langchain";

const model = await initChatModel("gpt-5-nano");

const systemMsg = new SystemMessage("You are a helpful assistant.");
const humanMsg = new HumanMessage("Hello, how are you?");

const messages = [systemMsg, humanMsg];
const response = await model.invoke(messages);  // Returns AIMessage
```

> [!提示]
>
> 多回合[agents](/oss/javascript/langchain/agents)累积长消息历史。 [LangSmith](/langsmith/observability) 记录每个回合、工具结果和模型响应，以便您可以检查完整的对话。按照[tracing quickstart](/langsmith/trace-with-langchain)启用跟踪。
>
> 我们建议您还设置 [LangSmith Engine](/langsmith/engine) 来监控您的痕迹、检测问题并提出修复建议。

### 文字提示文本提示是字符串 - 非常适合不需要保留对话历史记录的简单生成任务。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke("Write a haiku about spring");
```

**在以下情况下使用文本提示：**

* 您有一个独立的请求
* 您不需要对话历史记录
* 你想要最小的代码复杂性

### 消息提示

或者，您可以通过提供消息对象列表将消息列表传递到模型。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { SystemMessage, HumanMessage, AIMessage } from "langchain";

const messages = [
  new SystemMessage("You are a poetry expert"),
  new HumanMessage("Write a haiku about spring"),
  new AIMessage("Cherry blossoms bloom..."),
];
const response = await model.invoke(messages);
```

**在以下情况下使用消息提示：**

* 管理多轮对话
* 处理多模式内容（图像、音频、文件）
* 包括系统指令

### 字典格式

您还可以直接以 OpenAI 聊天完成格式指定消息。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const messages = [
  { role: "system", content: "You are a poetry expert" },
  { role: "user", content: "Write a haiku about spring" },
  { role: "assistant", content: "Cherry blossoms bloom..." },
];
const response = await model.invoke(messages);
```

## 消息类型

* [System message](#system-message) - 告诉模型如何表现并为交互提供上下文
* [Human message](#human-message) - 表示用户输入以及与模型的交互
* [AI message](#ai-message) - 模型生成的响应，包括文本内容、工具调用和元数据
* [Tool message](#tool-message) - 代表[tool calls](/oss/javascript/langchain/models#tool-calling)的输出

###系统消息[⟦T32⟧](https://reference.langchain.com/javascript/langchain-core/messages/SystemMessage) 表示启动模型行为的一组初始指令。您可以使用系统消息来定调、定义模型的角色并建立响应指南。

```typescript Basic instructions theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { SystemMessage, HumanMessage, AIMessage } from "langchain";

const systemMsg = new SystemMessage("You are a helpful coding assistant.");

const messages = [
  systemMsg,
  new HumanMessage("How do I create a REST API?"),
];
const response = await model.invoke(messages);
```

```typescript Detailed persona theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { SystemMessage, HumanMessage } from "langchain";

const systemMsg = new SystemMessage(`
You are a senior TypeScript developer with expertise in web frameworks.
Always provide code examples and explain your reasoning.
Be concise but thorough in your explanations.
`);

const messages = [
  systemMsg,
  new HumanMessage("How do I create a REST API?"),
];
const response = await model.invoke(messages);
```

***

### 人类讯息

[⟦T33⟧](https://reference.langchain.com/javascript/langchain-core/messages/HumanMessage) 代表用户输入和交互。它们可以包含文本、图像、音频、文件和任何其他数量的多模式[content](#message-content)。

####文字内容

```typescript Message object theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke([
  new HumanMessage("What is machine learning?"),
]);
```

```typescript String shortcut theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke("What is machine learning?");
```

#### 消息元数据

```typescript Add metadata theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const humanMsg = new HumanMessage({
  content: "Hello!",
  name: "alice",
  id: "msg_123",
});
```

> [!注意]
>
> `name` 字段行为因提供商而异 — 有些将其用于用户识别，有些则忽略它。要检查，请参阅模型提供商的[reference](https://reference.langchain.com/python/integrations/)。

***

###人工智能消息

[⟦T35⟧](https://reference.langchain.com/javascript/langchain-core/messages/AIMessage) 表示模型调用的输出。它们可以包括多模式数据、工具调用以及您稍后可以访问的特定于提供商的元数据。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke("Explain AI");
console.log(typeof response);  // AIMessage
```

[⟦T36⟧](https://reference.langchain.com/javascript/langchain-core/messages/AIMessage) 模型在调用时返回对象，其中包含响应中的所有关联元数据。

提供者以不同的方式权衡/上下文化消息类型，这意味着手动创建新的 [⟦T37⟧](https://reference.langchain.com/javascript/langchain-core/messages/AIMessage) 对象并将其插入消息历史记录中有时会很有帮助，就像它来自模型一样。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AIMessage, SystemMessage, HumanMessage } from "langchain";

const aiMsg = new AIMessage("I'd be happy to help you with that question!");

const messages = [
  new SystemMessage("You are a helpful assistant"),
  new HumanMessage("Can you help me?"),
  aiMsg,  // Insert as if it came from the model
  new HumanMessage("Great! What's 2+2?")
]

const response = await model.invoke(messages);
```> **属性**
>
> **文字** `string`
>
> 消息的文本内容。
>
> **内容** `string | ContentBlock[]`
>
> 消息的原始内容。
>
> **内容\_块** `ContentBlock.Standard[]`
>
> 消息的标准化内容块。 （参见[content](#message-content)）
>
> **工具\_调用** `ToolCall[] | None`
>
> 模型调用的工具。
>
> 如果没有调用任何工具则为空。
>
> **id** `string`
>
> 消息的唯一标识符（由 LangChain 自动生成或在提供商响应中返回）
>
> **使用\_元数据** `UsageMetadata | None`
>
> 消息的使用元数据，其中可以包含令牌计数（如果可用）。参见[⟦T44⟧](https://reference.langchain.com/javascript/langchain-core/messages/UsageMetadata)。
>
> **响应\_元数据** `ResponseMetadata | None`
>
> 消息的响应元数据。

#### 工具调用

当模型制作[tool calls](/oss/javascript/langchain/models#tool-calling)时，它们包含在[⟦T46⟧](https://reference.langchain.com/javascript/langchain-core/messages/AIMessage)中：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const modelWithTools = model.bindTools([getWeather]);
const response = await modelWithTools.invoke("What's the weather in Paris?");

for (const toolCall of response.tool_calls) {
  console.log(`Tool: ${toolCall.name}`);
  console.log(`Args: ${toolCall.args}`);
  console.log(`ID: ${toolCall.id}`);
}
```

其他结构化数据，例如推理或引文，也可以出现在消息[content](/oss/javascript/langchain/messages#message-content)中。

#### 代币使用

[⟦T47⟧](https://reference.langchain.com/javascript/langchain-core/messages/AIMessage) 可以在其 [⟦T48⟧](https://reference.langchain.com/javascript/langchain-core/messages/UsageMetadata) 字段中保存令牌计数和其他使用元数据：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { initChatModel } from "langchain";

const model = await initChatModel("gpt-5-nano");

const response = await model.invoke("Hello!");
console.log(response.usage_metadata);
```

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "output_tokens": 304,
  "input_tokens": 8,
  "total_tokens": 312,
  "input_token_details": {
    "cache_read": 0
  },
  "output_token_details": {
    "reasoning": 256
  }
}
```

详情请参阅[⟦T49⟧](https://reference.langchain.com/javascript/langchain-core/messages/UsageMetadata)。

#### 流和块

在流式传输期间，您将收到 [⟦T50⟧](https://reference.langchain.com/javascript/langchain-core/messages/AIMessageChunk) 对象，这些对象可以组合成完整的消息对象：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AIMessageChunk } from "langchain";

let finalChunk: AIMessageChunk | undefined;
for (const chunk of chunks) {
  finalChunk = finalChunk ? finalChunk.concat(chunk) : chunk;
}
```

> [!注意]
>
> 了解更多：
>
> * [Streaming tokens from chat models](/oss/javascript/langchain/models#stream)
> * [Streaming tokens and/or steps from agents](/oss/javascript/langchain/streaming)

***

### 工具消息对于支持[tool calling](/oss/javascript/langchain/models#tool-calling)的模型，AI消息可以包含工具调用。工具消息用于将单个工具执行的结果传递回模型。

[Tools](/oss/javascript/langchain/tools)可以直接生成[⟦T51⟧](https://reference.langchain.com/javascript/langchain-core/messages/ToolMessage)对象。下面，我们展示一个简单的例子。阅读[tools guide](/oss/javascript/langchain/tools)了解更多信息。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AIMessage, ToolMessage } from "langchain";

const aiMessage = new AIMessage({
  content: [],
  tool_calls: [{
    name: "get_weather",
    args: { location: "San Francisco" },
    id: "call_123"
  }]
});

const toolMessage = new ToolMessage({
  content: "Sunny, 72°F",
  tool_call_id: "call_123"
});

const messages = [
  new HumanMessage("What's the weather in San Francisco?"),
  aiMessage,  // Model's tool call
  toolMessage,  // Tool execution result
];

const response = await model.invoke(messages);  // Model processes the result
```

> **属性**
>
> **内容** `string` *必填*
>
> 工具调用的字符串化输出。
>
> **工具\_call\_id** `string` *必填*
>
> 此消息正在响应的工具调用的 ID。必须与 [⟦T54⟧](https://reference.langchain.com/javascript/langchain-core/messages/AIMessage) 中工具调用的 ID 匹配。
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
>> 例如，[retrieval](/oss/javascript/deepagents/retrieval) 工具可以从文档中检索一段段落以供模型参考。当消息`content`包含模型将引用的文本时，`artifact`可以包含应用程序可以使用的文档标识符或其他元数据（例如，用于呈现页面）。请参阅下面的示例：
>>
>> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > import { ToolMessage } from "langchain";
> >
> > // Artifact available downstream
> > const artifact = { document_id: "doc_123", page: 0 };
> >
> > const toolMessage = new ToolMessage({
> >   content: "It was the best of times, it was the worst of times.",
> >   tool_call_id: "call_123",
> >   name: "search_books",
> >   artifact
> > });
> > ```
>>
>> 请参阅 [RAG tutorial](/oss/javascript/deepagents/rag)，了解使用 LangChain 构建检索 [agents](/oss/javascript/langchain/agents) 的端到端示例。

***

## 留言内容

您可以将消息的内容视为发送到模型的数据的有效负载。消息具有松散类型的 `content` 属性，支持字符串和非类型化对象列表（例如字典）。这允许直接在LangChain聊天模型中支持提供者本机结构，例如[multimodal](#multimodal)内容和其他数据。另外，LangChain为文本、推理、引文、多模态数据、服务器端工具调用和其他消息内容提供专用内容类型。请参阅下面的[content blocks](#standard-content-blocks)。

LangChain 聊天模型接受 `content` 属性中的消息内容。

这可能包含：

1. 一根绳子
2. 提供者原生格式的内容块列表
3. [LangChain's standard content blocks](#standard-content-blocks)列表

请参阅下面使用 [multimodal](#multimodal) 输入的示例：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { HumanMessage } from "langchain";

// String content
const humanMessage = new HumanMessage("Hello, how are you?");

// Provider-native format (e.g., OpenAI)
const humanMessage = new HumanMessage({
  content: [
    { type: "text", text: "Hello, how are you?" },
    {
      type: "image_url",
      image_url: { url: "https://example.com/image.jpg" },
    },
  ],
});

// List of standard content blocks
const humanMessage = new HumanMessage({
  contentBlocks: [
    { type: "text", text: "Hello, how are you?" },
    { type: "image", url: "https://example.com/image.jpg" },
  ],
});
```

### 标准内容块

LangChain 为跨提供商的消息内容提供标准表示。

消息对象实现一个 `contentBlocks` 属性，它将延迟地将 `content` 属性解析为标准的、类型安全的表示形式。例如，从[⟦T64⟧](/oss/javascript/integrations/chat/anthropic)或[⟦T65⟧](/oss/javascript/integrations/chat/openai)生成的消息将包含相应提供者格式的`thinking`或`reasoning`块，但可以延迟解析为一致的[⟦T68⟧](#content-block-reference)表示：

**Anthropic**

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AIMessage } from "@langchain/core/messages";

const message = new AIMessage({
  content: [
    {
      "type": "thinking",
      "thinking": "...",
      "signature": "WaUjzkyp...",
    },
    {
      "type":"text",
      "text": "...",
      "id": "msg_abc123",
    },
  ],
  response_metadata: { model_provider: "anthropic" },
});

console.log(message.contentBlocks);
```

**OpenAI**

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AIMessage } from "@langchain/core/messages";

const message = new AIMessage({
  content: [
    {
      "type": "reasoning",
      "id": "rs_abc123",
      "summary": [
        {"type": "summary_text", "text": "summary 1"},
        {"type": "summary_text", "text": "summary 2"},
      ],
    },
    {"type": "text", "text": "..."},
  ],
  response_metadata: { model_provider: "openai" },
});

console.log(message.contentBlocks);
```

请参阅 [integrations guides](/oss/javascript/integrations/providers/overview) 开始使用
您选择的推理提供者。> [!注意]
>
> **序列化标准内容**
>
> 如果 LangChain 之外的应用程序需要访问标准内容块
> 表示，您可以选择在消息内容中存储内容块。
>
> 为此，您可以将 `LC_OUTPUT_VERSION` 环境变量设置为 `v1`。或者，
> 使用 `outputVersion: "v1"` 初始化任何聊天模型：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { initChatModel } from "langchain";
>
> const model = await initChatModel(
>   "gpt-5-nano",
>   { outputVersion: "v1" }
> );
> ```

### 多式联运

**多模态**是指处理不同形式数据的能力
形式，例如文本、音频、图像和视频。 LangChain 包括标准类型
这些数据可以跨提供商使用。

[Chat models](/oss/javascript/langchain/models)可以接受多模态数据作为输入并生成
它作为输出。下面我们展示了具有多模式数据的输入消息的简短示例。

> [!注意]
>
> 额外的键可以包含在内容块的顶层或嵌套在 `"extras": {"key": value}` 中。
>
> [OpenAI](/oss/javascript/integrations/chat/openai),
> 例如，需要 PDF 的文件名。参见[provider page](/oss/javascript/integrations/providers/overview)
> 针对您选择的型号了解具体信息。

```typescript Image input theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// From URL
const message = new HumanMessage({
  content: [
    { type: "text", text: "Describe the content of this image." },
    {
      type: "image",
      source_type: "url",
      url: "https://example.com/path/to/image.jpg"
    },
  ],
});

// From base64 data
const message = new HumanMessage({
  content: [
    { type: "text", text: "Describe the content of this image." },
    {
      type: "image",
      source_type: "base64",
      mime_type: "image/jpeg",
      data: "AAAAIGZ0eXBtcDQyAAAAAGlzb21tcDQyAAACAGlzb2...",
    },
  ],
});

// From provider-managed File ID
const message = new HumanMessage({
  content: [
    { type: "text", text: "Describe the content of this image." },
    { type: "image", source_type: "id", id: "file-abc123" },
  ],
});
```

```typescript PDF document input theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// From URL
const message = new HumanMessage({
  content: [
    { type: "text", text: "Describe the content of this document." },
    { type: "file", source_type: "url", url: "https://example.com/path/to/document.pdf", mime_type: "application/pdf" },
  ],
});

// From base64 data
const message = new HumanMessage({
  content: [
    { type: "text", text: "Describe the content of this document." },
    {
      type: "file",
      source_type: "base64",
      data: "AAAAIGZ0eXBtcDQyAAAAAGlzb21tcDQyAAACAGlzb2...",
      mime_type: "application/pdf",
    },
  ],
});

// From provider-managed File ID
const message = new HumanMessage({
  content: [
    { type: "text", text: "Describe the content of this document." },
    { type: "file", source_type: "id", id: "file-abc123" },
  ],
});
```

```typescript Audio input theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// From base64 data
const message = new HumanMessage({
  content: [
    { type: "text", text: "Describe the content of this audio." },
    {
      type: "audio",
      source_type: "base64",
      data: "AAAAIGZ0eXBtcDQyAAAAAGlzb21tcDQyAAACAGlzb2...",
    },
  ],
});

// From provider-managed File ID
const message = new HumanMessage({
  content: [
    { type: "text", text: "Describe the content of this audio." },
    { type: "audio", source_type: "id", id: "file-abc123" },
  ],
});
```

```typescript Video input theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// From base64 data
const message = new HumanMessage({
  content: [
    { type: "text", text: "Describe the content of this video." },
    {
      type: "video",
      source_type: "base64",
      data: "AAAAIGZ0eXBtcDQyAAAAAGlzb21tcDQyAAACAGlzb2...",
    },
  ],
});

// From provider-managed File ID
const message = new HumanMessage({
  content: [
    { type: "text", text: "Describe the content of this video." },
    { type: "video", source_type: "id", id: "file-abc123" },
  ],
});
```

> [!警告]
>
> 并非所有型号都支持所有文件类型。检查模型提供商的[reference](https://reference.langchain.com/python/integrations/)以了解支持的格式和大小限制。

### 内容块引用内容块（在创建消息或访问`contentBlocks`字段时）表示为类型对象列表。列表中的每个项目必须遵守以下块类型之一：

> **核心**
>
>> **ContentBlock.Text**
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
>> **注释** `Citation[]`
>>
>> 文本注释列表
>>
>> **示例：**
>>
>> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > {
> >     type: "text",
> >     text: "Hello world",
> >     annotations: []
> > }
> > ```
>
>> **ContentBlock.Reasoning**
>>
>> **目的：**模型推理步骤
>>
>> **类型** `string` *必填*
>>
>> 永远`"reasoning"`
>>
>> **推理** `string` *必填*
>>
>> 推理内容
>>
>> **示例：**
>>
>> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > {
> >     type: "reasoning",
> >     reasoning: "The user is asking about..."
> > }
> > ```> **多式联运**
>
>> **ContentBlock.Multimodal.Image**
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
>> **数据** `string`
>>
>> Base64 编码的图像数据。
>>
>> **文件ID** `string`
>>
>> 引用外部文件存储系统中的图像（例如，OpenAI或Anthropic的文件API）。
>>
>> **mimeType** `string`
>>
>> 图片[MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml#image)（例如，`image/jpeg`、`image/png`）。对于 Base64 数据是必需的。
>
>> **ContentBlock.Multimodal.Audio**
>>
>> **用途：** 音频数据
>>
>> **类型** `string` *必填*
>>
>> 始终`"audio"`
>>
>> **网址** `string`
>>
>> 指向音频位置的 URL。
>>
>> **数据** `string`
>>
>> Base64 编码的音频数据。
>>
>> **文件ID** `string`
>>
>> 引用外部文件存储系统中的音频文件（例如OpenAI或Anthropic的文件API）。
>>
>> **mimeType** `string`
>>
>> 音频[MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml#audio)（例如，`audio/mpeg`、`audio/wav`）。对于 Base64 数据是必需的。
>
>> **ContentBlock.Multimodal.Video**
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
>> **数据** `string`
>>>> Base64 编码的视频数据。
>>
>> **文件ID** `string`
>>
>> 引用外部文件存储系统中的视频文件（例如OpenAI或Anthropic的文件API）。
>>
>> **mimeType** `string`
>>
>> 视频 [MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml#video)（例如，`video/mp4`、`video/webm`）。对于 Base64 数据是必需的。
>
>> **ContentBlock.Multimodal.File**
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
>> **数据** `string`
>>
>> Base64 编码的文件数据。
>>
>> **文件ID** `string`
>>
>> 引用外部文件存储系统中的文件（例如OpenAI或Anthropic的文件API）。
>>
>> **mimeType** `string`
>>
>> 文件[MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml)（例如，`application/pdf`）。对于 Base64 数据是必需的。
>
>> **ContentBlock.Multimodal.PlainText**
>>
>> **用途：** 文档文本（`.txt`、`.md`）
>>
>> **类型** `string` *必填*
>>
>> 永远`"text-plain"`
>>
>> **文字** `string` *必填*
>>
>> 正文内容
>>
>> **标题** `string`
>>
>> 文字内容标题
>>
>> **mimeType** `string`
>>
>> 文本的[MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml)（例如，`text/plain`、`text/markdown`）> **工具调用**
>
>> **ContentBlock.Tools.ToolCall**
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
>> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> > {
> >     type: "tool_call",
> >     name: "search",
> >     args: { query: "weather" },
> >     id: "call_123"
> > }
> > ```
>
>> **ContentBlock.Tools.ToolCallChunk**
>>
>> **用途：** 推流工具片段
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
>> **索引** `number | string` *必填*
>>
>> 该块在流中的位置
>
>> **ContentBlock.Tools.InvalidToolCall**
>>
>> **目的：** 格式错误的调用
>>
>> **类型** `string` *必填*
>>
>> 永远`"invalid_tool_call"`
>>
>> **姓名** `string`
>>
>> 调用失败的工具名称
>>
>> **参数** `string`
>>
>> 无法解析的原始参数
>>
>> **错误** `string` *必填*
>>
>> 错误描述
>>>> **常见错误：** 无效 JSON、缺少必填字段

> **服务器端工具执行**
>
>> **ContentBlock.Tools.ServerToolCall**
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
>> **ContentBlock.Tools.ServerToolCallChunk**
>>
>> **用途：**流式传输服务器端工具调用片段
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
>> **ContentBlock.Tools.ServerToolResult**
>>
>> **用途：** 搜索结果
>>
>> **类型** `string` *必填*
>>
>> 永远`"server_tool_result"`
>>
>> **工具\_call\_id** `string` *必填*
>>>> 相应服务器工具调用的标识符。
>>
>> **id** `string`
>>
>> 与服务器工具结果关联的标识符。
>>
>> **状态** `string` *必填*
>>
>> 服务器端工具的执行状态。 `"success"` 或 `"error"`。
>>
>> **输出**
>>
>> 执行工具的输出。

> **特定于提供商的块**
>
>> **ContentBlock.NonStandard**
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
> 其他特定于提供商的内容类型可以在每个模型提供商的 [reference documentation](/oss/javascript/integrations/providers/overview) 中找到。

在导入 [⟦T158⟧](https://reference.langchain.com/javascript/langchain-core/messages/ContentBlock) 类型时，上述每个内容块都可以作为类型单独寻址。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ContentBlock } from "langchain";

// Text block
const textBlock: ContentBlock.Text = {
    type: "text",
    text: "Hello world",
}

// Image block
const imageBlock: ContentBlock.Multimodal.Image = {
    type: "image",
    url: "https://example.com/image.png",
    mimeType: "image/png",
}
```

> [!提示]
>
> 查看[API reference](https://reference.langchain.com/javascript/langchain-core/messages)中的规范类型定义。> [!注意]
>
> 内容块作为 LangChain v1 中消息的新属性引入，以标准化跨提供商的内容格式，同时保持与现有代码的向后兼容性。
>
> 内容块不是 [⟦T159⟧](https://reference.langchain.com/javascript/langchain-core/messages/BaseMessage) 属性的替代品，而是一个可用于以标准化格式访问消息内容的新属性。

## 序列化

您可以将消息序列化为普通对象进行存储，然后反序列化回消息实例。这对于保留对话历史记录和恢复会话非常有用。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { HumanMessage } from "@langchain/core/messages";
import { load } from "@langchain/core/load";

const message = new HumanMessage("What is the capital of France?");

// Serialize to a plain object
const serialized = message.toJSON();

// Deserialize back to a message object
const restored = await load<HumanMessage>(JSON.stringify(serialized));
```

> [!警告]
>
> **`load()` 通过实例化类和调用构造函数来反序列化数据。切勿对不受信任或用户提供的输入调用 `load()`。** 仅反序列化源自您控制的源（例如您自己的数据库）的数据。

## 与聊天模型一起使用

[Chat models](/oss/javascript/langchain/models) 接受一系列消息对象作为输入，并返回 [⟦T162⟧](https://reference.langchain.com/javascript/langchain-core/messages/AIMessage) 作为输出。交互通常是无状态的，因此简单的对话循环涉及调用具有不断增长的消息列表的模型。

请参阅以下指南以了解更多信息：

* [persisting and managing conversation histories](/oss/javascript/langchain/short-term-memory)的内置功能
* 管理上下文窗口的策略，包括[trimming and summarizing messages](/oss/javascript/langchain/short-term-memory#common-patterns)

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/messages.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。