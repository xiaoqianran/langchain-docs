<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Vector store integrations | https://docs.langchain.com/oss/javascript/integrations/vectorstores/index -->

# 矢量存储集成

使用 LangChain JavaScript 与矢量存储集成。

## 概述

[vector store](/oss/javascript/integrations/vectorstores)存储[embedded](/oss/javascript/integrations/embeddings)数据并执行相似性搜索。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
flowchart LR

    subgraph "📥 Indexing phase (store)"
        A[📄 Documents] --> B[🔢 Embedding model]
        B --> C[🔘 Embedding vectors]
        C --> D[(Vector store)]
    end

    subgraph "📤 Query phase (retrieval)"
        E[❓ Query text] --> F[🔢 Embedding model]
        F --> G[🔘 Query vector]
        G --> H[🔍 Similarity search]
        H --> D
        D --> I[📄 Top-k results]
    end

    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    class A,B,C,D,E,F,G,H,I process
```

### 接口

LangChain为矢量商店提供了统一的接口，允许您：

* `addDocuments` - 将文档添加到商店。
* `delete` - 按 ID 删除存储的文档。
* `similaritySearch` - 查询语义相似的文档。

这种抽象允许您在不同的实现之间切换，而无需更改应用程序逻辑。

### 初始化

LangChain 中的大多数向量存储在初始化向量存储时都接受嵌入模型作为参数。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});
const vectorStore = new MemoryVectorStore(embeddings);
```

### 添加文档

您可以使用 `addDocuments` 函数将文档添加到矢量存储。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Document } from "@langchain/core/documents";
const document = new Document({
  pageContent: "Hello world",
});
await vectorStore.addDocuments([document]);
```

### 删除文档

您可以使用 `delete` 函数从矢量存储中删除文档。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await vectorStore.delete({
  filter: {
    pageContent: "Hello world",
  },
});
```

### 相似性搜索

使用 `similaritySearch` 发出语义查询，它返回最接近的嵌入文档：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const results = await vectorStore.similaritySearch("Hello world", 10);
```

许多矢量存储支持以下参数：

* `k` — 返回的结果数
* `filter` — 基于元数据的条件过滤

### 相似度指标和索引

嵌入相似度可以使用以下方法计算：* **余弦相似度**
* **欧几里得距离**
* **点积**

高效搜索通常采用 HNSW（分层可导航小世界）等索引方法，但具体情况取决于向量存储。

### 元数据过滤

按元数据（例如来源、日期）过滤可以细化搜索结果：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
vectorStore.similaritySearch("query", 2, { source: "tweets" });
```

<important>
  对基于元数据的过滤的支持因实现而异。
  有关详细信息，请检查您选择的矢量存储的文档。
</important>

## 顶级集成

**选择嵌入模型：**

<AccordionGroup>
  <Accordion title="OpenAI">
    安装依赖项：

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/openai @langchain/core
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/openai @langchain/core
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/openai @langchain/core
      ```
    </CodeGroup>

    添加环境变量：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    OPENAI_API_KEY=your-api-key
    ```

    实例化模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { OpenAIEmbeddings } from "@langchain/openai";

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large"
    });
    ```
  </Accordion>

  <Accordion title="Azure">
    安装依赖项

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/openai @langchain/core
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/openai @langchain/core
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/openai @langchain/core
      ```
    </CodeGroup>

    添加环境变量：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    AZURE_OPENAI_API_INSTANCE_NAME=<YOUR_INSTANCE_NAME>
    AZURE_OPENAI_API_KEY=<YOUR_KEY>
    AZURE_OPENAI_API_VERSION="2024-02-01"
    ```

    实例化模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { AzureOpenAIEmbeddings } from "@langchain/openai";

    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiEmbeddingsDeploymentName: "text-embedding-ada-002"
    });
    ```
  </Accordion>

  <Accordion title="AWS">
    安装依赖项：

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i @langchain/aws
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/aws
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/aws
      ```
    </CodeGroup>

    添加环境变量：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    BEDROCK_AWS_REGION=your-region
    ```

    实例化模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { BedrockEmbeddings } from "@langchain/aws";

    const embeddings = new BedrockEmbeddings({
      model: "amazon.titan-embed-text-v1"
    });
    ```
  </Accordion>

  <Accordion title="Google Gemini">
    安装依赖项：

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i @langchain/google-genai
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/google-genai
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/google-genai
      ```
    </CodeGroup>添加环境变量：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    GOOGLE_API_KEY=your-api-key
    ```

    实例化模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004"
    });
    ```
  </Accordion>

  <Accordion title="Google Vertex">
    安装依赖项：

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

    添加环境变量：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    GOOGLE_APPLICATION_CREDENTIALS=credentials.json
    ```

    实例化模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { VertexAIEmbeddings } from "@langchain/google-vertexai";

    const embeddings = new VertexAIEmbeddings({
      model: "gemini-embedding-001"
    });
    ```
  </Accordion>

  <Accordion title="MistralAI">
    安装依赖项：

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/mistralai @langchain/core
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/mistralai @langchain/core
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/mistralai @langchain/core
      ```
    </CodeGroup>

    添加环境变量：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    MISTRAL_API_KEY=your-api-key
    ```

    实例化模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { MistralAIEmbeddings } from "@langchain/mistralai";

    const embeddings = new MistralAIEmbeddings({
      model: "mistral-embed"
    });
    ```
  </Accordion>

  <Accordion title="Cohere">
    安装依赖项：

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

    添加环境变量：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    COHERE_API_KEY=your-api-key
    ```

    实例化模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { CohereEmbeddings } from "@langchain/cohere";

    const embeddings = new CohereEmbeddings({
      model: "embed-english-v3.0"
    });
    ```
  </Accordion>

  <Accordion title="Ollama">
    安装依赖项：

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/ollama @langchain/core
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/ollama @langchain/core
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/ollama @langchain/core
      ```
    </CodeGroup>

    实例化模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { OllamaEmbeddings } from "@langchain/ollama";

    const embeddings = new OllamaEmbeddings({
      model: "llama2",
      baseUrl: "http://localhost:11434", // Default value
    });
    ```
  </Accordion>

  <Accordion title="Voyage AI">
    安装依赖项：

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/mongodb @langchain/core
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/mongodb @langchain/core
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/mongodb @langchain/core
      ```
    </CodeGroup>

    添加环境变量：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    VOYAGE_API_KEY=your-api-key
    ```

    实例化模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { VoyageEmbeddings } from "@langchain/mongodb";

    const embeddings = new VoyageEmbeddings({
      model: "voyage-4"
    });
    ```
  </Accordion>
</AccordionGroup>

**选择矢量存储：**

<AccordionGroup>
  <Accordion title="Memory">
    <CodeGroup>
      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i langchain
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add langchain
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add langchain
      ```
    </CodeGroup>

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

    const vectorStore = new MemoryVectorStore(embeddings);
    ```
  </Accordion>

  <Accordion title="MongoDB">
    <Tabs>
      <Tab title="Manual embedding">
        <CodeGroup>
          ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          npm install @langchain/mongodb mongodb @langchain/core
          ```

          ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          yarn add @langchain/mongodb mongodb @langchain/core
          ``````bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          pnpm add @langchain/mongodb mongodb @langchain/core
          ```
        </CodeGroup>

        ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"
        import { MongoClient } from "mongodb";

        const client = new MongoClient(process.env.MONGODB_ATLAS_URI!);
        const collection = client
          .db(process.env.MONGODB_ATLAS_DB_NAME)
          .collection(process.env.MONGODB_ATLAS_COLLECTION_NAME);

        const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
          collection,
          indexName: "vector_index",
          textKey: "text",
          embeddingKey: "embedding",
        });
        ```
      </Tab>

      <Tab title="Automated embedding">
        <CodeGroup>
          ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          npm install @langchain/mongodb mongodb @langchain/core
          ```

          ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          yarn add @langchain/mongodb mongodb @langchain/core
          ```

          ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          pnpm add @langchain/mongodb mongodb @langchain/core
          ```
        </CodeGroup>

        ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"
        import { MongoClient } from "mongodb";

        const client = new MongoClient(process.env.MONGODB_ATLAS_URI!);
        const collection = client
          .db(process.env.MONGODB_ATLAS_DB_NAME)
          .collection(process.env.MONGODB_ATLAS_COLLECTION_NAME);

        const vectorStore = new MongoDBAtlasVectorSearch({ collection });
        ```
      </Tab>
    </Tabs>
  </Accordion>

  <Accordion title="Pinecone">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/pinecone @langchain/core @pinecone-database/pinecone
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/pinecone @langchain/core @pinecone-database/pinecone
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/pinecone @langchain/core @pinecone-database/pinecone
      ```
    </CodeGroup>

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { PineconeStore } from "@langchain/pinecone";
    import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

    const pinecone = new PineconeClient();
    const vectorStore = new PineconeStore(embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
    });
    ```
  </Accordion>

  <Accordion title="Redis">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/redis @langchain/core redis
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/redis @langchain/core redis
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/redis @langchain/core redis
      ```
    </CodeGroup>

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { RedisVectorStore } from "@langchain/redis";

    const vectorStore = new RedisVectorStore(embeddings, {
      redisClient: client,
      indexName: "langchainjs-testing",
    });
    ```
  </Accordion>

  <Accordion title="Qdrant">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/qdrant @langchain/core
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/qdrant @langchain/core
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/qdrant @langchain/core
      ```
    </CodeGroup>

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { QdrantVectorStore } from "@langchain/qdrant";

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL,
      collectionName: "langchainjs-testing",
    });
    ```
  </Accordion>

  <Accordion title="Oracle AI Database">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i @oracle/langchain-oracledb @langchain/core
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @oracle/langchain-oracledb @langchain/core
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @oracle/langchain-oracledb @langchain/core
      ```
    </CodeGroup>

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import oracledb from "oracledb";
    import { OracleEmbeddings, OracleVS } from "@oracle/langchain-oracledb";

    const connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectionString: process.env.ORACLE_DSN,
    });

    const embeddings = new OracleEmbeddings(connection, {
      provider: "database",
      model: process.env.DEMO_ONNX_MODEL ?? "DEMO_MODEL",
    });

    const vectorStore = new OracleVS(embeddings, {
      client: connection,
      tableName: "DEMO_VECTORS",
      query: "Find support tickets mentioning service outages.",
      distanceStrategy: "DOT",
    });
    await vectorStore.initialize();
    ```
  </Accordion>

  <Accordion title="Weaviate">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/weaviate @langchain/core weaviate-client
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/weaviate @langchain/core weaviate-client
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/weaviate @langchain/core weaviate-client
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { WeaviateStore } from "@langchain/weaviate";

      const vectorStore = new WeaviateStore(embeddings, {
          client: weaviateClient,
          indexName: "Langchainjs_test",
      });
      ```
    </CodeGroup>
  </Accordion>
</AccordionGroup>

LangChain.js 与各种矢量商店集成。您可以查看下面的完整列表：

## 所有向量存储<div>
  |矢量商店 |下载 |
  | :-------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
  | [⟦T90⟧](/oss/javascript/integrations/vectorstores/weaviate) | <span><a href="https://www.npmjs.com/package/@langchain/weaviate"><img alt="Downloads per month" /></a></span>|
  | [⟦T91⟧](/oss/javascript/integrations/vectorstores/pinecone) | <span><a href="https://www.npmjs.com/package/@langchain/pinecone"> <img alt="Downloads per month" /></a></span> |
  | [⟦T92⟧](/oss/javascript/integrations/vectorstores/mongodb_atlas) | <span><a href="https://www.npmjs.com/package/@langchain/mongodb"> <img alt="Downloads per month" /></a></span> |
  | [⟦T93⟧](/oss/javascript/integrations/vectorstores/qdrant) | <span><a href="https://www.npmjs.com/package/@langchain/qdrant"> <img alt="Downloads per month" /></a></span> |
  | [⟦T94⟧](/oss/javascript/integrations/vectorstores/redis) | <span><a href="https://www.npmjs.com/package/@langchain/redis"> <img alt="Downloads per month" /></a></span> |
  | [⟦T95⟧](/oss/javascript/integrations/vectorstores/oracleai) | <span><a href="https://www.npmjs.com/package/@oracle/langchain-oracledb"> <img alt="Downloads per month" /></a></span> || [⟦T96⟧](/oss/javascript/integrations/vectorstores/pgvector) | <span><a href="https://www.npmjs.com/package/@langchain/pgvector"><img alt="Downloads per month" /></a></span>|
  | [⟦T97⟧](/oss/javascript/integrations/vectorstores/cloudflare_vectorize) | <span><a href="https://www.npmjs.com/package/@langchain/cloudflare"><img alt="Downloads per month" /></a></span>|
  | [⟦T98⟧](/oss/javascript/integrations/vectorstores/azure_cosmosdb_mongodb) | <span><a href="https://www.npmjs.com/package/@langchain/azure-cosmosdb"><img alt="Downloads per month" /></a></span>|
  | [⟦T99⟧](/oss/javascript/integrations/vectorstores/azure_cosmosdb_nosql) | <span><a href="https://www.npmjs.com/package/@langchain/azure-cosmosdb"><img alt="Downloads per month" /></a></span>|
  | [⟦T100⟧](/oss/javascript/integrations/vectorstores/azure_documentdb) | <span><a href="https://www.npmjs.com/package/@langchain/azure-cosmosdb"><img alt="Downloads per month" /></a></span>|
  | [⟦T101⟧](/oss/javascript/integrations/vectorstores/turbopuffer) | <span><a href="https://www.npmjs.com/package/@langchain/turbopuffer"> <img alt="Downloads per month" /></a></span> |
  | [⟦T102⟧](/oss/javascript/integrations/vectorstores/google_cloudsql_pg) | <span><a href="https://www.npmjs.com/package/@langchain/google-cloud-sql-pg"><img alt="Downloads per month" /></a></span>|
  | [⟦T103⟧](/oss/javascript/integrations/vectorstores/neo4jvector) | <span><a href="https://www.npmjs.com/package/@langchain/neo4j"> <img alt="Downloads per month" /></a></span> |
  | [⟦T104⟧](/oss/javascript/integrations/vectorstores/sap_hanavector) | <span><a href="https://www.npmjs.com/package/@sap/hana-langchain"><img alt="Downloads per month" /></a></span>|
  | [⟦T105⟧](https://infino.ai/docs) | <span><a href="https://www.npmjs.com/package/@infino-ai/langchain-infino"> <img alt="Downloads per month" /></a></span> |
  | [⟦T106⟧](/oss/javascript/integrations/vectorstores/ydb) | <span><a href="https://www.npmjs.com/package/@ydbjs/langchain"><img alt="Downloads per month" /></a></span>|| [⟦T107⟧](/oss/javascript/integrations/vectorstores/memory) | <span>不适用</span> |
</div>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/vectorstores/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>