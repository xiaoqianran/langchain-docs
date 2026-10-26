<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Embedding model integrations | https://docs.langchain.com/oss/javascript/integrations/embeddings/index -->

# 嵌入模型集成

使用 LangChain JavaScript 与嵌入模型集成。

## 概述

> [!注意]
>
> 本概述涵盖**基于文本的嵌入模型**。 LangChain 目前不支持多模态嵌入。

嵌入模型将原始文本（例如句子、段落或推文）转换为固定长度的数字向量，以捕获其**语义意义**。这些向量允许机器根据含义而不是确切的单词来比较和搜索文本。

实际上，这意味着具有相似想法的文本在向量空间中被紧密地放置在一起。例如，即使使用不同的措辞，嵌入也可以显示讨论相关概念的文档，而不是仅匹配短语“机器学习”。

### 它是如何工作的

1. **向量化**：模型将每个输入字符串编码为高维向量。
2. **相似性评分**：使用数学指标对向量进行比较，以衡量底层文本的相关程度。

### 相似度指标

通常使用几个指标来比较嵌入：* **余弦相似度**：测量两个向量之间的角度。
* **欧氏距离**：测量点之间的直线距离。
* **点积**：测量一个向量投射到另一个向量上的程度。

## 接口

LangChain通过[Embeddings](https://reference.langchain.com/javascript/langchain-core/embeddings/Embeddings)接口为文本嵌入模型（例如OpenAI、Cohere、Hugging Face）提供标准接口。

有两种主要方法可用：

* `embedDocuments(documents: string[]) → number[][]`：嵌入文档列表。
* `embedQuery(text: string) → number[]`：嵌入单个查询。

> [!注意]
>
> 该界面允许使用不同的策略嵌入查询和文档，尽管大多数提供商在实践中以相同的方式处理它们。

## 安装和使用

> **OpenAI**
>
> 安装依赖项：
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install @langchain/openai @langchain/core
> ```
>
> ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> yarn add @langchain/openai @langchain/core
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm add @langchain/openai @langchain/core
> ```
>
> 添加环境变量：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> OPENAI_API_KEY=your-api-key
> ```
>
> 实例化模型：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { OpenAIEmbeddings } from "@langchain/openai";
>
> const embeddings = new OpenAIEmbeddings({
>   model: "text-embedding-3-large"
> });
> ```

> **天蓝色**
>
> 安装依赖项
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install @langchain/openai @langchain/core
> ```
>
> ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> yarn add @langchain/openai @langchain/core
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm add @langchain/openai @langchain/core
> ```
>
> 添加环境变量：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> AZURE_OPENAI_API_INSTANCE_NAME=<YOUR_INSTANCE_NAME>
> AZURE_OPENAI_API_KEY=<YOUR_KEY>
> AZURE_OPENAI_API_VERSION="2024-02-01"
> ```
>
> 实例化模型：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { AzureOpenAIEmbeddings } from "@langchain/openai";
>
> const embeddings = new AzureOpenAIEmbeddings({
>   azureOpenAIApiEmbeddingsDeploymentName: "text-embedding-ada-002"
> });
> ```

> **AWS**
>
> 安装依赖项：
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install @langchain/aws @langchain/core
> ```
>
> ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> yarn add @langchain/aws @langchain/core
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm add @langchain/aws @langchain/core
> ```
>
> 添加环境变量：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> BEDROCK_AWS_REGION=your-region
> ```
>
> 实例化模型：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { BedrockEmbeddings } from "@langchain/aws";
>
> const embeddings = new BedrockEmbeddings({
>   model: "amazon.titan-embed-text-v1"
> });
> ```> **谷歌双子座**
>
> 安装依赖项：
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install @langchain/google-genai @langchain/core
> ```
>
> ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> yarn add @langchain/google-genai @langchain/core
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm add @langchain/google-genai @langchain/core
> ```
>
> 添加环境变量：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> GOOGLE_API_KEY=your-api-key
> ```
>
> 实例化模型：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
>
> const embeddings = new GoogleGenerativeAIEmbeddings({
>   model: "gemini-embedding-001"
> });
> ```

> **Gemini 企业代理平台**
>
> 安装依赖项：
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install @langchain/google-vertexai @langchain/core
> ```
>
> ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> yarn add @langchain/google-vertexai @langchain/core
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm add @langchain/google-vertexai @langchain/core
> ```
>
> 添加环境变量：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> GOOGLE_APPLICATION_CREDENTIALS=credentials.json
> ```
>
> 实例化模型：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { VertexAIEmbeddings } from "@langchain/google-vertexai";
>
> const embeddings = new VertexAIEmbeddings({
>   model: "gemini-embedding-001"
> });
> ```

> **米斯特拉尔人工智能**
>
> 安装依赖项：
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install @langchain/mistralai @langchain/core
> ```
>
> ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> yarn add @langchain/mistralai @langchain/core
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm add @langchain/mistralai @langchain/core
> ```
>
> 添加环境变量：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> MISTRAL_API_KEY=your-api-key
> ```
>
> 实例化模型：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { MistralAIEmbeddings } from "@langchain/mistralai";
>
> const embeddings = new MistralAIEmbeddings({
>   model: "mistral-embed"
> });
> ```

> **连贯**
>
> 安装依赖项：
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install @langchain/cohere @langchain/core
> ```
>
> ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> yarn add @langchain/cohere @langchain/core
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm add @langchain/cohere @langchain/core
> ```
>
> 添加环境变量：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> COHERE_API_KEY=your-api-key
> ```
>
> 实例化模型：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { CohereEmbeddings } from "@langchain/cohere";
>
> const embeddings = new CohereEmbeddings({
>   model: "embed-english-v3.0"
> });
> ```

> **奥拉马**
>
> 安装依赖项：
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install @langchain/ollama @langchain/core
> ```
>
> ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> yarn add @langchain/ollama @langchain/core
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm add @langchain/ollama @langchain/core
> ```
>
> 实例化模型：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { OllamaEmbeddings } from "@langchain/ollama";
>
> const embeddings = new OllamaEmbeddings({
>   model: "llama2",
>   baseUrl: "http://localhost:11434", // Default value
> });
> ```

> **航行人工智能**
>
> 安装依赖项：
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install @langchain/mongodb @langchain/core
> ```
>
> ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> yarn add @langchain/mongodb @langchain/core
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm add @langchain/mongodb @langchain/core
> ```
>
> 添加环境变量：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> VOYAGE_API_KEY=your-api-key
> ```
>
> 实例化模型：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { VoyageEmbeddings } from "@langchain/mongodb";
>
> const embeddings = new VoyageEmbeddings({
>   model: "voyage-4"
> });
> ```

## 缓存

嵌入可以被存储或临时缓存以避免需要重新计算它们。

缓存嵌入可以使用`CacheBackedEmbeddings`来完成。该包装器将嵌入存储在键值存储中，其中对文本进行哈希处理，并将哈希值用作缓存中的键。初始化`CacheBackedEmbeddings`的主要受支持方式是`fromBytesStore`。它需要以下参数：

* **underlyingEmbeddings**：用于嵌入的嵌入器。
* **documentEmbeddingStore**：任何用于缓存文档嵌入的[⟦T50⟧](/oss/javascript/integrations/stores/)。
* **options.namespace**：（可选，默认为`""`）用于文档缓存的命名空间。有助于避免冲突（例如，将其设置为嵌入模型名称）。

- 始终设置`namespace`参数以避免使用不同嵌入模型时发生冲突。
- `CacheBackedEmbeddings` 默认情况下不缓存查询嵌入。要启用此功能，请指定`query_embedding_store`。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { CacheBackedEmbeddings } from "@langchain/classic/embeddings/cache_backed";
import { InMemoryStore } from "@langchain/core/stores";

const underlyingEmbeddings = new OpenAIEmbeddings();

const inMemoryStore = new InMemoryStore();

const cacheBackedEmbeddings = CacheBackedEmbeddings.fromBytesStore(
  underlyingEmbeddings,
  inMemoryStore,
  {
    namespace: underlyingEmbeddings.model,
  }
);

// Example: caching a query embedding
const tic = Date.now();
const queryEmbedding = cacheBackedEmbeddings.embedQuery("Hello, world!");
console.log(`First call took: ${Date.now() - tic}ms`);

// Example: caching a document embedding
const tic = Date.now();
const documentEmbedding = cacheBackedEmbeddings.embedDocuments(["Hello, world!"]);
console.log(`Cached creation time: ${Date.now() - tic}ms`);
```

在生产中，您通常会使用更强大的持久存储，例如数据库或云存储。请参阅[stores integrations](/oss/javascript/integrations/stores/)了解选项。

## 所有集成

|整合 |下载 |
| :-| :-|
| [⟦T55⟧](/oss/javascript/integrations/embeddings/azure_openai) | [  ⟦T76⟧](https://www.npmjs.com/package/@langchain/openai) |
| [⟦T56⟧](/oss/javascript/integrations/embeddings/openai) | [  ⟦T77⟧](https://www.npmjs.com/package/@langchain/openai) |
| [⟦T57⟧](/oss/javascript/integrations/embeddings/google_generative_ai) | [  ⟦T78⟧](https://www.npmjs.com/package/@langchain/google-genai) |
| [⟦T58⟧](/oss/javascript/integrations/embeddings/bedrock) | [  ⟦T79⟧](https://www.npmjs.com/package/@langchain/aws) |
| [⟦T59⟧](/oss/javascript/integrations/embeddings/google_vertex_ai) | [  ⟦T80⟧](https://www.npmjs.com/package/@langchain/google-vertexai) |
| [⟦T60⟧](/oss/javascript/integrations/embeddings/ollama) | [  ⟦T81⟧](https://www.npmjs.com/package/@langchain/ollama) |
| [⟦T61⟧](/oss/javascript/integrations/embeddings/mistralai) | [  ⟦T82⟧](https://www.npmjs.com/package/@langchain/mistralai) |
| [⟦T62⟧](/oss/javascript/integrations/embeddings/pinecone) | [  ⟦T83⟧](https://www.npmjs.com/package/@langchain/pinecone) |
| [⟦T63⟧](/oss/javascript/integrations/embeddings/voyageai) | [  ⟦T84⟧](https://www.npmjs.com/package/@langchain/mongodb) |
| [⟦T64⟧](/oss/javascript/integrations/embeddings/cohere) | [  ⟦T85⟧](https://www.npmjs.com/package/@langchain/cohere) |
| [⟦T65⟧](/oss/javascript/integrations/embeddings/fireworks) | [  ⟦T86⟧](https://www.npmjs.com/package/@langchain/fireworks) |
| [⟦T66⟧](/oss/javascript/integrations/embeddings/nomic) | [  ⟦T87⟧](https://www.npmjs.com/package/@langchain/nomic) |
| [⟦T67⟧](/oss/javascript/integrations/embeddings/baidu_qianfan) | [  ⟦T88⟧](https://www.npmjs.com/package/@langchain/baidu-qianfan) |
| [⟦T68⟧](/oss/javascript/integrations/embeddings/cloudflare_ai) | [  ⟦T89⟧](https://www.npmjs.com/package/@langchain/cloudflare) |
| [⟦T69⟧](/oss/javascript/integrations/embeddings/togetherai) | [  ⟦T90⟧](https://www.npmjs.com/package/@langchain/together-ai) |
| [⟦T70⟧](/oss/javascript/integrations/embeddings/ibm) | [  ⟦T91⟧](https://www.npmjs.com/package/@langchain/ibm) |
| [⟦T71⟧](/oss/javascript/integrations/embeddings/mixedbread_ai) | [  ⟦T92⟧](https://www.npmjs.com/package/@langchain/mixedbread-ai) |
| [⟦T72⟧](https://scx.ai/) | [  ⟦T93⟧](https://www.npmjs.com/package/@scx-ai/langchain) |
| [⟦T73⟧](https://docs.empiriolabs.ai/integrations#langchain) |不适用 |
| [⟦T74⟧](/oss/javascript/integrations/embeddings/minimax) |不适用 |
| [⟦T75⟧](/oss/javascript/integrations/embeddings/oracleai) |不适用 |

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/embeddings/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。