<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Google integration | https://docs.langchain.com/oss/javascript/integrations/tools/google -->

# 谷歌集成

使用 LangChain JavaScript 与 Google Gemini 工具集成。

`@langchain/google` 包支持 Gemini 的内置工具，这些工具提供 Web 搜索基础、代码执行、URL 上下文检索等功能。这些工具作为 Gemini 原生对象通过 `bindTools()` 或 `tools` 调用选项传递给 `ChatGoogle`。

<Warning>
  您不能在同一请求中混合使用 Gemini 原生工具（Google 搜索、代码执行等）和标准 LangChain 工具（基于 Zod 的功能工具）。标准工具调用用法请参见[ChatGoogle](/oss/javascript/integrations/chat/google)页面。
</Warning>

### 谷歌搜索

`googleSearch` 工具将模型响应与实时 Google 搜索结果结合起来。这对于有关当前事件或特定事实的问题很有用。

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

您可以选择将搜索结果过滤到特定时间范围：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const llm = new ChatGoogle("gemini-2.5-flash")
  .bindTools([
  {
    googleSearch: {
      timeRangeFilter: {
        startTime: "2025-01-01T00:00:00Z",
        endTime: "2025-12-31T23:59:59Z",
      },
    },
  },
]);
```

<Note>
  维护 `googleSearchRetrieval` 工具是为了向后兼容，但`googleSearch` 是首选。
</Note>

有关更多信息，请参阅[Google's Grounding with Google Search documentation](https://ai.google.dev/gemini-api/docs/grounding)。

### 代码执行

`codeExecution`工具允许Gemini生成并运行Python代码来解决复杂的问题。模型编写代码、执行代码并返回结果。

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
```响应在`contentBlocks`字段中包含生成的代码及其执行结果：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
for (const block of res.contentBlocks) {
  if (block.type === "tool_code") {
    console.log("Code:", block.toolCode);
  } else if (block.type === "tool_result") {
    console.log("Result:", block.toolResult);
  }
}
```

有关更多信息，请参阅[Google's Code Execution documentation](https://ai.google.dev/gemini-api/docs/code-execution)。

### URL 上下文

`urlContext` 工具允许 Gemini 获取并使用 URL 中的内容来确定其响应。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle("gemini-2.5-flash")
  .bindTools([
    {
      urlContext: {},
    },
  ]);

const res = await llm.invoke("Summarize this page: https://js.langchain.com/");
console.log(res.text);
```

有关更多信息，请参阅[Google's URL Context documentation](https://ai.google.dev/gemini-api/docs/url-context)。

### 谷歌地图

`googleMaps` 工具根据 Google 地图的地理空间上下文进行响应。这对于与地点相关的查询很有用。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle("gemini-2.5-flash")
  .bindTools([
    {
      googleMaps: {},
    },
  ]);

const res = await llm.invoke("What are the best coffee shops near Times Square?");
console.log(res.text);
```

您可以启用小部件上下文令牌来呈现 Google 地图小部件：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const llm = new ChatGoogle("gemini-2.5-flash")
  .bindTools([
    {
      googleMaps: {
        enableWidget: true,
    },
  },
]);

const res = await llm.invoke("Find Italian restaurants in downtown Chicago");

// Access the widget context token from grounding metadata
const groundingMetadata = res.response_metadata?.groundingMetadata;
console.log(groundingMetadata?.googleMapsWidgetContextToken);
```

有关更多信息，请参阅[Google's Google Maps grounding documentation](https://ai.google.dev/gemini-api/docs/grounding/google-maps)。

### 文件搜索

`fileSearch` 工具从文件搜索存储中执行语义检索。必须首先使用 Gemini File API 导入文件。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle("gemini-2.5-flash")
  .bindTools([
    {
      fileSearch: {
      fileSearchStoreNames: ["fileSearchStores/my-store-123"],
    },
  },
]);

const res = await llm.invoke("What does the report say about Q4 revenue?");
console.log(res.text);
```

配置选项：

* `fileSearchStoreNames`（必需）--要从中检索的文件搜索存储的名称
* `metadataFilter` (可选) -- 应用于检索的元数据过滤器
* `topK` (可选) -- 返回的语义检索块的数量

欲了解更多信息，请参阅[Google's File Search documentation](https://ai.google.dev/gemini-api/docs/file-search)。

### 电脑使用

`computerUse` 工具使 Gemini 能够与浏览器环境交互。该模型可以查看屏幕截图并执行单击、键入和滚动等操作。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle("gemini-2.5-flash")
  .bindTools([
    {
      computerUse: {
      environment: "ENVIRONMENT_BROWSER",
    },
  },
]);
```

配置选项：* `environment`（必填）--正在运行的环境（例如`"ENVIRONMENT_BROWSER"`）
* `excludedPredefinedFunctions`（可选）--从操作空间中排除的预定义函数

欲了解更多信息，请参阅[Google's Computer Use documentation](https://ai.google.dev/gemini-api/docs/computer-use)。

### MCP 服务器

`mcpServers` 字段允许 Gemini 连接到远程 MCP（模型上下文协议）服务器。与其他本机工具不同，MCP 服务器被指定为工具对象上的数组。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle("gemini-2.5-flash")
  .bindTools([
    {
      mcpServers: [
      {
        name: "my-mcp-server",
        streamableHttpTransport: {
          url: "https://my-mcp-server.example.com/mcp",
        },
      },
    ],
  },
]);

const res = await llm.invoke("Use the tools from the MCP server to help me.");
console.log(res.text);
```

欲了解更多信息，请参阅[Google's MCP documentation](https://ai.google.dev/gemini-api/docs/mcp)。

### Vertex AI 搜索数据存储

如果您使用 Vertex AI (`platformType: "gcp"`)，则可以使用 Vertex AI 搜索数据存储来接地响应。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";

const projectId = "YOUR_PROJECT_ID";
const datastoreId = "YOUR_DATASTORE_ID";

const llm = new ChatGoogle({
  model: "gemini-2.5-pro",
  platformType: "gcp",
}).bindTools([
  {
    retrieval: {
      vertexAiSearch: {
        datastore: `projects/${projectId}/locations/global/collections/default_collection/dataStores/${datastoreId}`,
      },
      disableAttribution: false,
    },
  },
]);

const res = await llm.invoke(
  "What is the score of Argentina vs Bolivia football game?"
);
console.log(res.text);
```

有关更多信息，请参阅[Google's Vertex AI Search grounding documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/grounding/ground-with-vertex-ai-search)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/tools/google.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>