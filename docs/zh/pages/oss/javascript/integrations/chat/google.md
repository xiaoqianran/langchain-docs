<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: ChatGoogle integration | https://docs.langchain.com/oss/javascript/integrations/chat/google -->

# ChatGoogle 集成

使用 LangChain JavaScript 与 ChatGoogle 聊天模型集成。

该库支持访问各种 Google 模型，包括 Gemini
系列模型及其 Nano Banana 图像生成模型。您可以访问这些
通过 Google 的 [Google AI](https://ai.google.dev/) API（有时也
称为 Generative AI API 或 AI Studio API）或通过 Google Cloud Platform
[Vertex AI](https://cloud.google.com/vertex-ai)服务。

这将帮助您开始使用 `ChatGoogle` [chat models](/oss/javascript/langchain/models)。
有关所有 `ChatGoogle` 功能和配置的详细文档，请访问
[API reference](https://reference.langchain.com/javascript/langchain-google/index/ChatGoogle)。

<Tip>
  `@langchain/google` 是所有新的 Google Gemini 集成的推荐软件包。
  它取代了旧的 [⟦T42⟧](/oss/javascript/integrations/chat/google_generative_ai)
  和 [⟦T43⟧](/oss/javascript/integrations/chat/google_vertex_ai) 封装。
  有关迁移详细信息，请参阅[legacy packages](/oss/javascript/integrations/providers/google#legacy-packages)。
</Tip>

## 概述

### 集成细节|班级 |套餐 |可串行化| PY支持|                                             下载 |                                             版本 |
| :-------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- | :----------: | :--------: | :------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------: |
| [⟦T44⟧](https://reference.langchain.com/javascript/langchain-google/index/ChatGoogle) | [⟦T45⟧](https://www.npmjs.com/package/@langchain/google) |       ✅ |      ✅ | ![NPM - Downloads](https://img.shields.io/npm/dm/@langchain/google?style=flat-square\&label=%20&) | ![NPM - Version](https://img.shields.io/npm/v/@langchain/google?style=flat-square\&label=%20&) |

### 模型特点

有关如何使用特定功能的指南，请参阅下面表标题中的链接。| [Tool calling](/oss/javascript/langchain/tools) | [Structured output](/oss/javascript/langchain/structured-output) | [Image input](/oss/javascript/langchain/messages#multimodal) |音频输入|视频输入| [Token-level streaming](/oss/javascript/langchain/streaming/) | [Token usage](/oss/javascript/langchain/models#token-usage) | [Logprobs](/oss/javascript/langchain/models#log-probabilities) |
| :---------------------------------------------: | :--------------------------------------------------------------------------: | :----------------------------------------------------------: | :---------: | :---------: | :------------------------------------------------------------------------: | :---------------------------------------------------------: | :------------------------------------------------------------------------: |
|                        ✅ |                                 ✅ |                               ✅ |      ✅ |      ✅ |                               ✅ |                              ✅ |                                ✅ |

请注意，虽然支持 logprobs，但 Gemini 对它们的使用相当有限。

## 设置

### 通过 AI Studio 获得的凭证（API 密钥）

通过 Google AI Studio（有时称为 Generative AI
API），您将需要一个 API 密钥。您可以从
[Google AI Studio](https://aistudio.google.com/app/apikey)。获得 API 密钥后，您可以将其设置为环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export GOOGLE_API_KEY="your-api-key"
```

或者您可以将其直接传递给模型构造函数：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle({
  apiKey: "your-api-key",
  model: "gemini-2.5-flash",
});
```

### 通过 Vertex AI Express 模式获得的凭证（API 密钥）

Vertex AI 还支持[Express Mode](https://cloud.google.com/vertex-ai/docs/start/introduction-unified-platform#express-mode)，
它允许您使用 API 密钥进行身份验证。您可以获得 Vertex AI
来自 [Google Cloud Console](https://console.cloud.google.com/vertex-ai/studio/api-key) 的 API 密钥。

获得 API 密钥后，您可以将其设置为环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export GOOGLE_API_KEY="your-api-key"
```

使用[Vertex AI Express Mode](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/express-mode/overview)时，还需要指定平台
实例化模型时输入`gcp`。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const llm = new ChatGoogle({
  model: "gemini-2.5-flash",
  platformType: "gcp",
  // apiKey: "...", // Optional if GOOGLE_API_KEY is set
});
```

### 通过 Vertex AI 的凭证（OAuth 应用程序默认凭证/ADC）

对于Google Cloud上的生产环境，建议使用
[Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/provide-credentials-adc)。
Node.js 环境支持此功能。

如果您在本地计算机上运行，则可以通过安装
[Google Cloud SDK](https://cloud.google.com/sdk) 并运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
gcloud auth application-default login
```

或者，您可以设置`GOOGLE_APPLICATION_CREDENTIALS`环境
变量到您的服务帐户密钥文件的路径：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
```

### 通过 Vertex AI 的凭据（OAuth 保存的凭据）如果您在 Web 环境中运行或想要直接提供凭据，
您可以使用 `GOOGLE_CLOUD_CREDENTIALS` 环境变量。这应该
包含服务帐户密钥文件的**内容**（而不是路径）。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account","project_id":"your-project-id",...}'
```

您还可以使用以下方法直接在代码中提供这些凭据
`credentials`参数。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const llm = new ChatGoogle({
  model: "gemini-2.5-flash",
  platformType: "gcp",
  credentials: {
    type: "service_account",
    project_id: "your-project-id",
    private_key_id: "your-private-key-id",
    private_key: "your-private-key",
    client_email: "your-service-account-email",
    client_id: "your-client-id",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "your-cert-url",
  }
});
```

### 追踪

如果您想自动跟踪模型调用，您还可以设置
通过取消下面的注释来删除您的 [LangSmith](/langsmith/observability) API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# export LANGSMITH_TRACING="true"
# export LANGSMITH_API_KEY="your-api-key"
```

### 安装

LangChain `ChatGoogle` 集成位于 `@langchain/google` 包中：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/google @langchain/core
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @langchain/google @langchain/core
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add @langchain/google @langchain/core
  ```
</CodeGroup>

## 实例化

根据您是在 Node.js 环境还是 Web/Edge 环境中运行，导入路径会有所不同。

<CodeGroup>
  ```typescript Node.js theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { ChatGoogle } from "@langchain/google/node";
  ```

  ```typescript Web/Edge theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { ChatGoogle } from "@langchain/google";
  ```
</CodeGroup>

模型将根据您的配置自动确定是使用 Google AI API 还是 Vertex AI：

* 如果您提供`apiKey`（或设置`GOOGLE_API_KEY`），则默认为Google AI。
* 如果您提供`credentials`（或在Node中设置`GOOGLE_APPLICATION_CREDENTIALS` / `GOOGLE_CLOUD_CREDENTIALS`），则默认为Vertex AI。

### 谷歌人工智能（AI Studio）

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const llm = new ChatGoogle({
  model: "gemini-2.5-flash",
  maxRetries: 2,
  // apiKey: "...", // Optional if GOOGLE_API_KEY is set
});
```

### 顶点人工智能

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const llm = new ChatGoogle({
  model: "gemini-2.5-flash",
  // credentials: { ... }, // Optional if using ADC or GOOGLE_CLOUD_CREDENTIALS
});
```

### Vertex AI Express 模式

要通过 API 密钥（快速模式）使用 Vertex AI，您必须显式设置 `platformType`。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const llm = new ChatGoogle({
  model: "gemini-2.5-flash",
  platformType: "gcp",
  // apiKey: "...", // Optional if GOOGLE_API_KEY is set
});
```### 模型配置最佳实践

虽然`ChatGoogle`支持`temperature`、`topP`和`topK`等标准模型参数，
Gemini 模型的最佳实践是将它们保留为默认值。型号
围绕这些默认值进行了高度调整。

如果你想控制模型的“随机性”或者“创造性”，建议
使用提示或系统提示中的特定说明（例如，“发挥创意”、
“给出简洁的事实答案”）而不是调整温度。

## 调用

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const aiMsg = await llm.invoke([
  new SystemMessage(
    "You are a helpful assistant that translates English to French. Translate the user sentence."
  ),
  new HumanMessage("I love programming."),
]);
```

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
console.log(aiMsg.text);
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
J'adore programmer.
```

## 响应元数据

`AIMessage` 响应包含有关生成的元数据，包括
令牌使用和日志概率。

### 代币使用

`usage_metadata` 属性允许您检查令牌计数。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const res = await llm.invoke("Hello, how are you?");

console.log(res.usage_metadata);
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{ input_tokens: 6, output_tokens: 7, total_tokens: 13 }
```

### 对数概率

如果您在模型配置中启用`logprobs`，它们将在
`response_metadata`。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const llmWithLogprobs = new ChatGoogle({
  model: "gemini-2.5-flash",
  logprobs: 2, // Number of top candidates to return
});

const resWithLogprobs = await llmWithLogprobs.invoke("Hello");

console.log(resWithLogprobs.response_metadata.logprobs_result);
```

## 安全设置

默认情况下，当前版本的 Gemini 的安全设置是关闭的。

如果您想启用各种类别的安全设置，您可以使用
模型的 `safetySettings` 属性。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle({
  model: "gemini-2.5-flash",
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_LOW_AND_ABOVE",
    },
  ],
});
```

## 结构化输出

您可以使用 `withStructuredOutput` 方法从模型获取结构化 JSON 输出。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";
import { z } from "zod";

const llm = new ChatGoogle("gemini-2.5-flash");

const schema = z.object({
  people: z.array(z.object({
    name: z.string().describe("The name of the person"),
    age: z.number().describe("The age of the person"),
  })),
});

const structuredLlm = llm.withStructuredOutput(schema);

const res = await structuredLlm.invoke("John is 25 and Jane is 30.");
console.log(res);
```

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "people": [
    { "name": "John", "age": 25 },
    { "name": "Jane", "age": 30 }
  ]
}
```

## 工具调用`ChatGoogle` 支持标准LangChain [tool calling](/oss/javascript/langchain/tools)
以及双子座特定的“专业工具”（如代码执行和基础）。

### 标准工具

您可以使用通过 Zod 模式定义的标准 LangChain 工具。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const weatherTool = tool((input) => {
  return "It is sunny and 75 degrees.";
}, {
  name: "get_weather",
  description: "Get the weather for a location",
  schema: z.object({
    location: z.string(),
  }),
});

const llm = new ChatGoogle("gemini-2.5-flash")
  .bindTools([weatherTool]);

const res = await llm.invoke("What is the weather in SF?");
console.log(res.tool_calls);
```

### 专业工具

Gemini 提供了多种用于代码执行和基础的内置工具。

<Warning>
  您不能混合使用这些“专用工具”（代码执行、Google 搜索等）
  与标准 LangChain 工具（如上面的天气工具）在相同的请求中。
</Warning>

#### 代码执行

Gemini模型支持代码执行，允许模型生成并运行
用于解决复杂问题的 Python 代码。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle("gemini-2.5-flash")
  .bindTools([
    {
      codeExecution: {},
    },
  ]);

const res = await llm.invoke("Calculate the 100th Fibonacci number.");
console.log(res.contentBlocks);
```

#### 以 Google 搜索为基础

您可以使用 `googleSearch` 工具通过 Google 搜索来验证回复。
这对于有关当前事件或特定事实的问题很有用。

<Note>
  维护 `googleSearchRetrieval` 工具是为了向后兼容，但`googleSearch` 是首选。
</Note>

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle("gemini-2.5-flash")
  .bindTools([
    {
      googleSearch: {},
    },
  ]);

const res = await llm.invoke("Who won the latest World Series?");
console.log(res.text);
```

#### URL 检索基础

您还可以使用特定 URL 来处理响应。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle("gemini-2.5-flash")
  .bindTools([
    {
      urlContext: {},
    },
  ]);

const prompt = "Summarize this page: https://js.langchain.com/";
const res = await llm.invoke(prompt);
console.log(res.text);
```

#### 数据存储基础

如果您使用 Vertex AI (`platformType: "gcp"`)，您可以使用以下命令来接地响应
Vertex AI 搜索数据存储。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";

const projectId = "YOUR_PROJECT_ID";
const datastoreId = "YOUR_DATASTORE_ID";

const searchRetrievalToolWithDataset = {
  retrieval: {
    vertexAiSearch: {
      datastore: `projects/${projectId}/locations/global/collections/default_collection/dataStores/${datastoreId}`,
    },
    disableAttribution: false,
  },
};

const llm = new ChatGoogle({
  model: "gemini-2.5-pro",
  platformType: "gcp",
}).bindTools([searchRetrievalToolWithDataset]);

const res = await llm.invoke(
  "What is the score of Argentina vs Bolivia football game?"
);
console.log(res.text);
```

## 上下文缓存默认情况下，Gemini 模型进行隐式上下文缓存。如果开始时
您发送给双子座的历史记录与双子座的上下文完全匹配
它的缓存，它将减少该请求的令牌成本。

您还可以一次显式地将一些内容传递给模型，缓存输入
token，然后在后续请求时引用缓存的token，降低成本
和延迟。 LangChain不支持创建此显式缓存，但是
如果您已创建缓存，则可以在调用中引用它。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle("gemini-2.5-pro");

// Pass the cache name to the model
const res = await llm.invoke("Summarize this document", {
  cachedContent: "projects/123/locations/us-central1/cachedContents/456",
});
```

## 多模式请求

`ChatGoogle`模型支持多模式请求，允许您发送图像，
音频、视频和文本。您可以在您的中使用 `contentBlocks` 字段
消息以结构化方式提供这些输入。

### 图片

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";
import { HumanMessage } from "@langchain/core/messages";
import * as fs from "fs";

const llm = new ChatGoogle("gemini-2.5-flash");

const image = fs.readFileSync("./hotdog.jpg").toString("base64");

const res = await llm.invoke([
  new HumanMessage({
    contentBlocks: [
      {
        type: "text",
        text: "What is in this image?",
      },
      {
        type: "image",
        mimeType: "image/jpeg",
        data: image,
      },
    ],
  }),
]);

console.log(res.text);
```

### 音频

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const audio = fs.readFileSync("./speech.wav").toString("base64");

const res = await llm.invoke([
  new HumanMessage({
    contentBlocks: [
      {
        type: "text",
        text: "Summarize this audio.",
      },
      {
        type: "audio",
        mimeType: "audio/wav",
        data: audio,
      },
    ],
  }),
]);

console.log(res.text);
```

### 视频

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const video = fs.readFileSync("./movie.mp4").toString("base64");

const res = await llm.invoke([
  new HumanMessage({
    contentBlocks: [
      {
        type: "text",
        text: "Describe the video.",
      },
      {
        type: "video",
        mimeType: "video/mp4",
        data: video,
      },
    ],
  }),
]);

console.log(res.text);
```

## 推理/思考

Google 的 Gemini 2.5 和 Gemini 3 型号支持“思考”或“推理”步骤。
即使您没有明确配置这些模型也可以执行推理，
但图书馆只会返回推理摘要（思想块），如果你
明确设定一个值来说明推理/思考的程度。该库提供模型之间的兼容性，允许您使用统一的参数：

* `maxReasoningTokens`（或`thinkingBudget`）：指定用于推理的最大标记数。
  * `0`：关闭推理（如果支持）。
  * `-1`：使用模型的默认值。
  * `> 0`：设置具体的代币预算。

* `reasoningEffort`（或`thinkingLevel`）：设置相对努力。
  * 值：`"minimal"`、`"low"`、`"medium"`、`"high"`。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle({
  model: "gemini-3.1-pro-preview",
  reasoningEffort: "high",
});

const res = await llm.invoke("What is the square root of 144?");

// The reasoning steps are available in the contentBlocks
const reasoningBlocks = res.contentBlocks.filter((block) => block.type === "reasoning");
reasoningBlocks.forEach((block) => {
  if (block.type === "reasoning") {
    console.log("Thought:", block.reasoning);
  }
});

console.log("Answer:", res.text);
```

<Note>
  思想块还包括一个`reasoningContentBlock`字段。这包含基于的`ContentBlock`
  Gemini 发送的底层部分。虽然这通常是一个文本块，但对于像这样的多模式模型
  Nano Banana Pro，它可以是图像或其他媒体块。
</Note>

## 使用 Nano Banana 和 Nano Banana Pro 生成图像

要生成图像，需要使用支持它的模型（例如
`gemini-2.5-flash-image`）并将`responseModalities`配置为
包括“图像”。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";
import * as fs from "fs";

const llm = new ChatGoogle({
  model: "gemini-2.5-flash-image",
  responseModalities: ["IMAGE", "TEXT"],
});

const res = await llm.invoke(
  "I would like to see a drawing of a house with the sun shining overhead. Drawn in crayon."
);

// Generated images are returned in the contentBlocks of the message
for (const [index, block] of res.contentBlocks.entries()) {
  if (block.type === "file" && block.data) {
    const base64Data = block.data;
    // Determine the correct file extension from the MIME type
    const mimeType = (block.mimeType || "image/png").split(";")[0];
    const extension = mimeType.split("/")[1] || "png";
    const filename = `generated_image_${index}.${extension}`;

    // Save the image to a file
    fs.writeFileSync(filename, Buffer.from(base64Data, "base64"));
    console.log(`[Saved image to ${filename}]`);
  } else if (block.type === "text") {
    console.log(block.text);
  }
}
```

## 语音生成 (TTS)

某些 Gemini 型号支持生成语音（音频输出）。为了实现这一点，
配置 `responseModalities` 以包含“AUDIO”并提供
`speechConfig`。

`speechConfig` 可以是
[full Gemini speech configuration object](https://ai.google.dev/api/generate-content#SpeechConfig),
但在大多数情况下，您只需要提供一个带有预构建的字符串
[voice name](https://ai.google.dev/gemini-api/docs/speech-generation#voices)。许多型号以原始 PCM 格式 (`audio/L16`) 返回音频，这需要
大多数媒体播放器都可以播放 WAV 标头。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";
import * as fs from "fs";

const llm = new ChatGoogle({
  model: "gemini-2.5-flash-preview-tts",
  responseModalities: ["AUDIO", "TEXT"],
  speechConfig: "Zubenelgenubi", // Prebuilt voice name
});

const res = await llm.invoke("Say cheerfully: Have a wonderful day!");

// Function to add a WAV header to raw PCM data
function addWavHeader(pcmData: Buffer, sampleRate = 24000) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmData.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // Mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // Byte rate (16-bit mono)
  header.writeUInt16LE(2, 32); // Block align
  header.writeUInt16LE(16, 34); // Bits per sample
  header.write("data", 36);
  header.writeUInt32LE(pcmData.length, 40);
  return Buffer.concat([header, pcmData]);
}

// Generated audio is returned in the contentBlocks
for (const [index, block] of res.contentBlocks.entries()) {
  if (block.type === "file" && block.data) {
    let audioBuffer = Buffer.from(block.data, "base64");
    let filename = `generated_audio_${index}.wav`;

    if (block.mimeType?.startsWith("audio/L16")) {
      audioBuffer = addWavHeader(audioBuffer);
    } else if (block.mimeType) {
      // Ignore parameters in the mimeType, such as "; rate=24000"
      const mimeType = block.mimeType.split(";")[0];
      const extension = mimeType.split("/")[1] || "wav";
      filename = `generated_audio_${index}.${extension}`;
    }

    // Save the audio to a file
    fs.writeFileSync(filename, audioBuffer);
    console.log(`[Saved audio to ${filename}]`);
  } else if (block.type === "text") {
    console.log(block.text);
  }
}
```

### 多扬声器 TTS

您还可以为单个请求配置多个扬声器。这很有用
双子座读剧本。简化的 `speechConfig` 需要您分配
将 `speaker` 分配给每个代表语音的预定义 `name`，然后使用它
脚本中的发言人。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const multiSpeakerLlm = new ChatGoogle({
  model: "gemini-2.5-flash-preview-tts",
  responseModalities: ["AUDIO"],
  speechConfig: [
    { speaker: "Joe", name: "Kore" },
    { speaker: "Jane", name: "Puck" },
  ],
});

const res = await multiSpeakerLlm.invoke(`
  Joe: How's it going today, Jane?
  Jane: Not too bad, how about you?
`);
```

## API 参考

有关所有 `ChatGoogle` 功能和配置的详细文档，请访问
[API reference](https://reference.langchain.com/javascript/langchain-google/index/ChatGoogle)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/chat/google.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>