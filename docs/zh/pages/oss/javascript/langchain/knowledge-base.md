<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a semantic search engine with LangChain | https://docs.langchain.com/oss/javascript/langchain/knowledge-base -->

## 概述

使用 LangChain [embeddings](/oss/javascript/integrations/embeddings) 和 [vector stores](/oss/javascript/integrations/vectorstores) 在 PDF 上构建语义搜索引擎。使用它来检索类似于查询的段落，然后将检索器插入[retrieval-augmented generation (RAG)](/oss/javascript/deepagents/retrieval)或其他LLM工作流程。

本教程涵盖：

1. 从 PDF 创建 `Document` 对象。
2. 生成嵌入。
3. 加载并分割 PDF。
4. 对向量存储中的块进行索引并通过相似性进行查询。
5. 将商店包裹成猎犬。

该指南还包括在搜索引擎之上的最小 RAG 实现。

### 概念

本教程重点关注文本检索并涵盖以下概念：

* [⟦T70⟧](https://reference.langchain.com/javascript/langchain-core/documents/Document)
* [Text splitters](/oss/javascript/integrations/splitters)
* [Embeddings](/oss/javascript/integrations/embeddings)
* [Vector stores](/oss/javascript/integrations/vectorstores) 和 [retrievers](/oss/javascript/integrations/retrievers)

## 设置

### 安装依赖项

本教程使用 `pdf-parse` 包读取 PDF：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm i pdf-parse
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add pdf-parse
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add pdf-parse
  ```
</CodeGroup>

欲了解更多详情，请参阅[Installation guide](/oss/javascript/langchain/install)。

### 配置 LangSmith

您使用 LangChain 构建的许多应用程序将包含多个步骤以及多次调用 LLM 调用。
随着这些应用程序变得越来越复杂，能够检查链或代理内部到底发生了什么变得至关重要。
最好的方法是使用[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-knowledge-base)。在上面的链接注册后，请确保设置环境变量以开始记录跟踪：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="..."
```

## 创建文档

LangChain 为文本单元和相关元数据实现了[⟦T72⟧](https://reference.langchain.com/javascript/langchain-core/documents/Document) 抽象。它具有三个属性：

* `pageContent`：表示内容的字符串。
* `metadata`：包含任意元数据的字典。
* `id`：（可选）文档的字符串标识符。

`metadata`可以捕获文档的来源、它与其他文档的关系以及其他信息。单个[⟦T77⟧](https://reference.langchain.com/javascript/langchain-core/documents/Document)通常代表较大文档的一部分。

以下代码创建示例文档：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Document } from "@langchain/core/documents";

const documents = [
  new Document({
    pageContent:
      "Dogs are great companions, known for their loyalty and friendliness.",
    metadata: { source: "mammal-pets-doc" },
  }),
  new Document({
    pageContent: "Cats are independent pets that often enjoy their own space.",
    metadata: { source: "mammal-pets-doc" },
  }),
];
```

## 生成嵌入

矢量搜索存储与文本关联的数字向量。将查询嵌入为相同维度的向量，然后使用相似性度量（例如余弦相似性）来查找相关文本。

LangChain支持[many providers](/oss/javascript/integrations/embeddings/)的嵌入。选择一个模型来指定如何将文本转换为数字向量：

<Tabs>
  <Tab title="OpenAI">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i @langchain/openai
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/openai
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/openai
      ```
    </CodeGroup>

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { OpenAIEmbeddings } from "@langchain/openai";

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large"
    });
    ```
  </Tab>

  <Tab title="Azure">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i @langchain/openai
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/openai
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/openai
      ```
    </CodeGroup>

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    AZURE_OPENAI_API_INSTANCE_NAME=<YOUR_INSTANCE_NAME>
    AZURE_OPENAI_API_KEY=<YOUR_KEY>
    AZURE_OPENAI_API_VERSION="2024-02-01"
    ```

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { AzureOpenAIEmbeddings } from "@langchain/openai";

    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiEmbeddingsDeploymentName: "text-embedding-ada-002"
    });
    ```
  </Tab>

  <Tab title="AWS">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i @langchain/aws
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/aws
      ``````bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/aws
      ```
    </CodeGroup>

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    BEDROCK_AWS_REGION=your-region
    ```

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { BedrockEmbeddings } from "@langchain/aws";

    const embeddings = new BedrockEmbeddings({
      model: "amazon.titan-embed-text-v1"
    });
    ```
  </Tab>

  <Tab title="VertexAI">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i @langchain/google-vertexai
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/google-vertexai
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/google-vertexai
      ```
    </CodeGroup>

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    GOOGLE_APPLICATION_CREDENTIALS=credentials.json
    ```

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { VertexAIEmbeddings } from "@langchain/google-vertexai";

    const embeddings = new VertexAIEmbeddings({
      model: "gemini-embedding-001"
    });
    ```
  </Tab>

  <Tab title="MistralAI">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i @langchain/mistralai
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/mistralai
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/mistralai
      ```
    </CodeGroup>

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    MISTRAL_API_KEY=your-api-key
    ```

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { MistralAIEmbeddings } from "@langchain/mistralai";

    const embeddings = new MistralAIEmbeddings({
      model: "mistral-embed"
    });
    ```
  </Tab>

  <Tab title="Cohere">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i @langchain/cohere
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/cohere
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/cohere
      ```
    </CodeGroup>

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    COHERE_API_KEY=your-api-key
    ```

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { CohereEmbeddings } from "@langchain/cohere";

    const embeddings = new CohereEmbeddings({
      model: "embed-english-v3.0"
    });
    ```
  </Tab>
</Tabs>

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const vector1 = await embeddings.embedQuery(documents[0].pageContent);
const vector2 = await embeddings.embedQuery(documents[1].pageContent);

assert vector1.length === vector2.length;
console.log(`Generated vectors of length ${vector1.length}\n`);
console.log(vector1.slice(0, 10));
```

```text wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Generated vectors of length 1536

[-0.008586574345827103, -0.03341241180896759, -0.008936782367527485, -0.0036674530711025, 0.010564599186182022, 0.009598285891115665, -0.028587326407432556, -0.015824200585484505, 0.0030416189692914486, -0.012899317778646946]
```

接下来，将嵌入存储在支持高效相似性搜索的向量存储中。

## 选择一个向量存储

LangChain [⟦T78⟧](https://reference.langchain.com/javascript/langchain-core/vectorstores/VectorStore) 对象将文本和 [⟦T79⟧](https://reference.langchain.com/javascript/langchain-core/documents/Document) 对象添加到存储中，并使用相似性指标查询它们。它们通常使用 [embedding](/oss/javascript/integrations/embeddings) 模型进行初始化，将文本转换为数字向量。

LangChain包含[integrations](/oss/javascript/integrations/vectorstores)以及多种向量存储技术。有些是托管的并且需要凭据，有些在单独的基础设施（本地或第三方）中运行，而另一些则在内存中运行以实现轻量级工作负载。选择矢量存储：

<Tabs>
  <Tab title="Memory">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i @langchain/classic
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/classic
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/classic
      ```
    </CodeGroup>

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

    const vectorStore = new MemoryVectorStore(embeddings);
    ```
  </Tab>

  <Tab title="MongoDB">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i @langchain/mongodb
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/mongodb
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/mongodb
      ```
    </CodeGroup>

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"
    import { MongoClient } from "mongodb";

    const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
    const collection = client
      .db(process.env.MONGODB_ATLAS_DB_NAME)
      .collection(process.env.MONGODB_ATLAS_COLLECTION_NAME);

    const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
      collection: collection,
      indexName: "vector_index",
      textKey: "text",
      embeddingKey: "embedding",
    });
    ```
  </Tab>

  <Tab title="Pinecone">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i @langchain/pinecone
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/pinecone
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/pinecone
      ```
    </CodeGroup>

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { PineconeStore } from "@langchain/pinecone";
    import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

    const pinecone = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY,
    });
    const pineconeIndex = pinecone.Index("your-index-name");

    const vectorStore = new PineconeStore(embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
    });
    ```
  </Tab><Tab title="Qdrant">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i @langchain/qdrant
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/qdrant
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/qdrant
      ```
    </CodeGroup>

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { QdrantVectorStore } from "@langchain/qdrant";

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL,
      collectionName: "langchainjs-testing",
    });
    ```
  </Tab>

  <Tab title="Redis">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i @langchain/redis
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/redis
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/redis
      ```
    </CodeGroup>

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { RedisVectorStore } from "@langchain/redis";

    const vectorStore = new RedisVectorStore(embeddings, {
      redisClient: client,
      indexName: "langchainjs-testing",
    });
    ```
  </Tab>
</Tabs>

## 加载并分割 PDF

从 PDF 加载内容，然后在建立索引之前将其分割成更小的块。此示例使用[a sample Nike 10-K filing from 2023](https://github.com/langchain-ai/langchain/blob/v0.3/docs/docs/example_data/nke-10k-2023.pdf)。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { readFileSync } from "node:fs";
import { Document } from "@langchain/core/documents";
import { PDFParse } from "pdf-parse";

// Below is a minimal helper for demonstration purposes.
async function loadPdfPages(filePath: string): Promise<Document[]> {
  const parser = new PDFParse({
    data: new Uint8Array(readFileSync(filePath)),
  });
  try {
    const { pages } = await parser.getText();
    return pages.map(
      (page) =>
        new Document({
          pageContent: page.text,
          metadata: { source: filePath, page: page.num - 1 },
        })
    );
  } finally {
    await parser.destroy();
  }
}

const filePath = "../../data/nke-10k-2023.pdf";
const docs = await loadPdfPages(filePath);
console.log(docs.length);
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
107
```

页面通常过于粗糙而无法检索。进一步拆分页面，以便相关段落不会被周围的文本冲淡。 [⟦T80⟧](https://reference.langchain.com/javascript/langchain-textsplitters/RecursiveCharacterTextSplitter) 在公共分隔符（例如换行符）上递归分割，直到每个块达到目标大小。这是针对一般文本用例推荐的文本分割器。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const allSplits = await textSplitter.splitDocuments(docs);

console.log(allSplits.length);
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
516
```

## 索引文件

将块索引到向量存储中：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await vectorStore.addDocuments(allSplits);
```

大多数矢量存储集成还支持连接到现有存储（例如使用客户端或索引名称）。有关详细信息，请参阅特定 [integration](/oss/javascript/integrations/vectorstores) 的文档。

## 查询向量存储

将文档添加到[⟦T81⟧](https://reference.langchain.com/javascript/langchain-core/vectorstores/VectorStore)后，即可查询：

* 同步和异步
* 按字符串查询和按向量查询
* 有和没有相似度分数
* 通过相似性和[maximum marginal relevance](https://reference.langchain.com/javascript/classes/_langchain_core.vectorstores.VectorStore.html#maxMarginalRelevanceSearch)（平衡相似性和多样性）

这些方法通常返回 [⟦T82⟧](https://reference.langchain.com/javascript/langchain-core/documents/Document) 对象的列表。### 按字符串搜索

嵌入将文本映射到密集向量，因此相似的含义在几何上很接近。这意味着您可以通过传递自然语言问题来检索相关段落：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const results1 = await vectorStore.similaritySearch(
  "When was Nike incorporated?"
);

console.log(results1[0]);
```

```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Document {
    pageContent: 'direct to consumer operations sell products...',
    metadata: {'page': 4, 'source': '../example_data/nke-10k-2023.pdf', 'start_index': 3125}
}
```

### 返回分数

您可以返回文档的相似度分数。分数的含义因提供商而异。在这种情况下，分数是一个与相似度成反比变化的距离度量：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const results2 = await vectorStore.similaritySearchWithScore(
  "What was Nike's revenue in 2023?"
);

console.log(results2[0]);
```

```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Score: 0.23699893057346344

Document {
    pageContent: 'Table of Contents...',
    metadata: {'page': 35, 'source': '../example_data/nke-10k-2023.pdf', 'start_index': 0}
}
```

### 按向量搜索

自己嵌入查询，然后使用结果向量进行搜索：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const embedding = await embeddings.embedQuery(
  "How were Nike's margins impacted in 2023?"
);

const results3 = await vectorStore.similaritySearchVectorWithScore(
  embedding,
  1
);

console.log(results3[0]);
```

```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Document {
    pageContent: 'FISCAL 2023 COMPARED TO FISCAL 2022...',
    metadata: {
        'page': 36,
        'source': '../example_data/nke-10k-2023.pdf',
        'start_index': 0
    }
}
```

了解更多：

* [API Reference](https://reference.langchain.com/javascript/langchain-core/vectorstores/VectorStore)
* [Integration-specific docs](/oss/javascript/integrations/vectorstores)

## 使用检索器

LangChain [⟦T83⟧](https://reference.langchain.com/javascript/langchain-core/vectorstores/VectorStore) 对象不会子类 [⟦T84⟧](https://reference.langchain.com/javascript/langchain-core/runnables/Runnable)。 [Retrievers](https://reference.langchain.com/javascript/interfaces/_langchain_core.retrievers.BaseRetriever.html)是Runnables，因此它们支持同步和异步`invoke`和`batch`等标准方法。

您还可以从向量存储构建检索器，并且检索器还可以包装非向量源（例如外部 API）。

向量存储实现了返回 [⟦T88⟧](https://reference.langchain.com/python/langchain-core/vectorstores/base/VectorStoreRetriever) 的 `as_retriever` 方法。这些检索器公开 `search_type` 和 `search_kwargs` 来选择和参数化底层存储方法。复制上面的例子：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const retriever = vectorStore.asRetriever({
  searchType: "mmr",
  searchKwargs: {
    fetchK: 1,
  },
});

await retriever.batch([
  "When was Nike incorporated?",
  "What was Nike's revenue in 2023?",
]);
```

```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[
    [Document {
        metadata: {'page': 4, 'source': '../example_data/nke-10k-2023.pdf', 'start_index': 3125},
        pageContent: 'direct to consumer operations sell products...',
    }],
    [Document {
        metadata: {'page': 3, 'source': '../example_data/nke-10k-2023.pdf', 'start_index': 0},
        pageContent: 'Table of Contents...',
    }],
]
```您可以在更复杂的应用程序中使用检索器，例如 [retrieval-augmented generation (RAG)](/oss/javascript/deepagents/retrieval)，它在 LLM 提示中将问题与检索到的上下文结合起来。要了解有关构建此类应用程序的更多信息，请查看 [RAG tutorial](/oss/javascript/deepagents/rag) 教程。

## 后续步骤

您现在已经了解了如何在 PDF 文档上构建语义搜索引擎。

欲了解更多信息，请参阅：

* [Available embedding integrations](/oss/javascript/integrations/embeddings)
* [Available vector store integrations](/oss/javascript/integrations/vectorstores)

有关 RAG 的更多信息：

* [Retrieval overview](/oss/javascript/deepagents/retrieval)
* [RAG with Deep Agents](/oss/javascript/deepagents/rag)
* [Evaluate a RAG application](/langsmith/evaluate-rag-tutorial)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/knowledge-base.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>