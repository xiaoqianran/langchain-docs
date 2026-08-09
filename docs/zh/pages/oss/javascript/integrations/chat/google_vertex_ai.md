<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: ChatVertexAI integration | https://docs.langchain.com/oss/javascript/integrations/chat/google_vertex_ai -->

# ChatVertexAI 集成

使用 LangChain JavaScript 与 ChatVertexAI 聊天模型集成。

[Google Vertex](https://cloud.google.com/vertex-ai) 是一项公开 Google Cloud 中可用的所有基础模型的服务，例如 `gemini-2.5-pro`、`gemini-2.5-flash` 等。
它还提供一些非 Google 模型，例如[Anthropic's Claude](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-claude)。

这将帮助您开始使用 `ChatVertexAI` [chat models](/oss/javascript/langchain/models)。有关所有 `ChatVertexAI` 功能和配置的详细文档，请前往 [API reference](https://reference.langchain.com/javascript/langchain-google-vertexai/index/ChatVertexAI)。

<Note>
  **该库将被弃用**

  该库将被 [ChatGoogle](/oss/javascript/integrations/chat/google) 库取代。
  新的实现应该使用 [ChatGoogle](/oss/javascript/integrations/chat/google) 库，并且
  现有的实现应考虑迁移。
</Note>

## 概述

### 集成细节|班级 |套餐 |可串行化| PY支持|                                                  下载 |                                                 版本 |
| :-------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- | :----------: | :--------: | :------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------: |
| [⟦T25⟧](https://reference.langchain.com/javascript/langchain-google-vertexai/index/ChatVertexAI) | [⟦T26⟧](https://www.npmjs.com/package/@langchain/google-vertexai) |       ✅ |      ✅ | ![NPM - Downloads](https://img.shields.io/npm/dm/@langchain/google-vertexai?style=flat-square\&label=%20&) | ![NPM - Version](https://img.shields.io/npm/v/@langchain/google-vertexai?style=flat-square\&label=%20&) |

### 模型特点

有关如何使用特定功能的指南，请参阅下面表标题中的链接。| [Tool calling](/oss/javascript/langchain/tools) | [Structured output](/oss/javascript/langchain/structured-output) | [Image input](/oss/javascript/langchain/messages#multimodal) |音频输入|视频输入| [Token-level streaming](/oss/javascript/langchain/streaming/) | [Token usage](/oss/javascript/langchain/models#token-usage) | [Logprobs](/oss/javascript/langchain/models#log-probabilities) |
| :---------------------------------------------: | :--------------------------------------------------------------------------: | :----------------------------------------------------------: | :---------: | :---------: | :------------------------------------------------------------------------: | :---------------------------------------------------------: | :------------------------------------------------------------------------: |
|                        ✅ |                                 ✅ |                               ✅ |      ✅ |      ✅ |                               ✅ |                              ✅ |                                ✅ |

请注意，虽然支持 logprobs，但 Gemini 对它们的使用相当有限。

＃＃ 设置LangChain.js 根据是否支持两种不同的身份验证方法
您正在 Node.js 环境或 Web 环境中运行。它还支持
使用任一包的 Vertex AI Express 模式使用的身份验证方法。

要访问 `ChatVertexAI` 模型，您需要在 Google Cloud Platform (GCP) 帐户中设置 Google VertexAI，保存凭据文件，然后安装 `@langchain/google-vertexai` 集成包。在 Node.js 上，该包使用 [⟦T29⟧](https://github.com/langchain-ai/langchainjs/tree/main/libs/providers/langchain-google-gauth) 进行身份验证（您不需要单独安装它）。

### 凭证

前往您的 [GCP account](https://console.cloud.google.com/) 并生成一个凭证文件。完成此操作后，设置 `GOOGLE_APPLICATION_CREDENTIALS` 环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/credentials.json"
```

或者，在本地计算机上，您可以运行 `gcloud auth application-default login` 以使用应用程序默认凭据。

如果在 Web 环境中运行，请安装 `@langchain/google-vertexai-web` 软件包（它使用 [⟦T33⟧](https://github.com/langchain-ai/langchainjs/tree/main/libs/providers/langchain-google-webauth) 进行身份验证）。在`GOOGLE_WEB_CREDENTIALS`中设置服务帐户JSON：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export GOOGLE_WEB_CREDENTIALS='{"type":"service_account","project_id":"YOUR_PROJECT-12345",...}'
```

`GOOGLE_VERTEX_AI_WEB_CREDENTIALS` 也受支持，但已弃用。

如果您使用 Vertex AI Express 模式，则可以安装 `@langchain/google-vertexai` 或 `@langchain/google-vertexai-web` 软件包。
然后您可以进入 [Express Mode](https://console.cloud.google.com/vertex-ai/studio) API Key 页面并在 `GOOGLE_API_KEY` 环境变量中设置您的 API Key：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export GOOGLE_API_KEY="api_key_value"
```如果您想自动跟踪模型调用，您还可以通过取消下面的注释来设置您的 [LangSmith](/langsmith/observability) API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# export LANGSMITH_TRACING="true"
# export LANGSMITH_API_KEY="your-api-key"
```

### 安装

LangChain `ChatVertexAI` 集成位于 `@langchain/google-vertexai` 包中：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/google-vertexai @langchain/core
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @langchain/google-vertexai @langchain/core
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add @langchain/google-vertexai @langchain/core
  ```
</CodeGroup>

或者如果在像[Vercel Edge function](https://vercel.com/blog/edge-functions-generally-available)这样的网络环境中使用：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/google-vertexai-web @langchain/core
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @langchain/google-vertexai-web @langchain/core
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add @langchain/google-vertexai-web @langchain/core
  ```
</CodeGroup>

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatVertexAI } from "@langchain/google-vertexai"
// Uncomment the following line if you're running in a web environment:
// import { ChatVertexAI } from "@langchain/google-vertexai-web"

const llm = new ChatVertexAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    maxRetries: 2,
    // For web, authOptions.credentials
    // authOptions: { ... }
    // other params...
})
```

## 调用

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const aiMsg = await llm.invoke([
    [
        "system",
        "You are a helpful assistant that translates English to French. Translate the user sentence.",
    ],
    ["human", "I love programming."],
])
aiMsg
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
AIMessageChunk {
  "content": "J'adore programmer. \n",
  "additional_kwargs": {},
  "response_metadata": {},
  "tool_calls": [],
  "tool_call_chunks": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "input_tokens": 20,
    "output_tokens": 7,
    "total_tokens": 27
  }
}
```

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
console.log(aiMsg.content)
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
J'adore programmer.
```

## 使用 Google 搜索检索调用工具

可以使用 Google 搜索工具调用该模型，您可以使用它来生成具有现实世界信息的[ground](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/grounding)内容并减少幻觉。

`gemini-2.0-flash-exp` 目前不支持接地。

您可以选择使用 Google 搜索或使用自定义数据存储进行接地。以下是两者的示例：

### Google 搜索检索

使用 Google 搜索的接地示例：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatVertexAI } from "@langchain/google-vertexai"

const searchRetrievalTool = {
  googleSearchRetrieval: {
    dynamicRetrievalConfig: {
      mode: "MODE_DYNAMIC", // Use Dynamic Retrieval
      dynamicThreshold: 0.7, // Default for Dynamic Retrieval threshold
    },
  },
};

const searchRetrievalModel = new ChatVertexAI({
  model: "gemini-2.5-pro",
  temperature: 0,
  maxRetries: 0,
}).bindTools([searchRetrievalTool]);

const searchRetrievalResult = await searchRetrievalModel.invoke("Who won the 2024 NBA Finals?");

console.log(searchRetrievalResult.content);
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
The Boston Celtics won the 2024 NBA Finals, defeating the Dallas Mavericks 4-1 in the series to claim their 18th NBA championship. This victory marked their first title since 2008 and established them as the team with the most NBA championships, surpassing the Los Angeles Lakers' 17 titles.
```

### 使用数据存储进行 Google 搜索检索

首先，设置您的数据存储（这是示例数据存储的架构）：|  身份证 |    日期 |   团队 1 |分数 |  团队 2 |
| :--: | :--------: | :-----: | :---: | :------: |
| 3001 | 3001 2023-09-07 |阿根廷 | 1 - 0 | 1 - 0  厄瓜多尔 |
| 3002 | 3002 2023-09-12 |委内瑞拉| 1 - 0 | 1 - 0巴拉圭 |
| 3003 | 3003 2023-09-12 |   智利 | 0 - 0 |哥伦比亚 |
| 3004 | 3004 2023-09-12 |    秘鲁 | 0 - 1 |  巴西 |
| 3005 | 3005 2024年10月15日 |阿根廷 | 6 - 0 | 6 - 0  玻利维亚 |

然后，在下面提供的示例中使用此数据存储：

（请注意，您必须为`projectId`和`datastoreId`使用自己的变量）

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatVertexAI } from "@langchain/google-vertexai";

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

const searchRetrievalModelWithDataset = new ChatVertexAI({
  model: "gemini-2.5-pro",
  temperature: 0,
  maxRetries: 0,
}).bindTools([searchRetrievalToolWithDataset]);

const searchRetrievalModelResult = await searchRetrievalModelWithDataset.invoke(
  "What is the score of Argentina vs Bolivia football game?"
);

console.log(searchRetrievalModelResult.content);
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Argentina won against Bolivia with a score of 6-0 on October 15, 2024.
```

您现在应该获得基于您提供的数据存储中的数据的结果。

## 上下文缓存

Vertex AI 提供上下文缓存功能，该功能通过跨多个 API 请求存储和重用长消息内容块来帮助优化成本。当您有冗长的对话历史记录或交互中频繁出现的消息片段时，这尤其有用。

要使用此功能，首先按照[this official guide](https://cloud.google.com/vertex-ai/generative-ai/docs/context-cache/context-cache-create)创建上下文缓存。

创建缓存后，您可以将其 id 作为运行时参数传递，如下所示：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatVertexAI } from "@langchain/google-vertexai";

const modelWithCachedContent = new ChatVertexAI({
  model: "gemini-2.5-pro-002",
  location: "us-east5",
});

await modelWithCachedContent.invoke("What is in the content?", {
  cachedContent:
    "projects/PROJECT_NUMBER/locations/LOCATION/cachedContents/CACHE_ID",
});
```

您还可以将此字段直接绑定到模型实例上：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const modelWithBoundCachedContent = new ChatVertexAI({
  model: "gemini-2.5-pro-002",
  location: "us-east5",
}).bind({
  cachedContent:
    "projects/PROJECT_NUMBER/locations/LOCATION/cachedContents/CACHE_ID",
});

```请注意，目前并非所有模型都支持上下文缓存。

***

## API 参考

有关所有 `ChatVertexAI` 功能和配置的详细文档，请前往 [API reference](https://reference.langchain.com/javascript/langchain-google-vertexai/index/ChatVertexAI)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/chat/google_vertex_ai.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>