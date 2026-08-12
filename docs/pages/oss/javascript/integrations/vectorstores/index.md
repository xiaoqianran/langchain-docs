<!-- langchain-docs: Vector store integrations | https://docs.langchain.com/oss/javascript/integrations/vectorstores/index -->

# Vector store integrations

Integrate with vector stores using LangChain JavaScript.

## Overview

A [vector store](/oss/javascript/integrations/vectorstores) stores [embedded](/oss/javascript/integrations/embeddings) data and performs similarity search.

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

### Interface

LangChain provides a unified interface for vector stores, allowing you to:

* `addDocuments` - Add documents to the store.
* `delete` - Remove stored documents by ID.
* `similaritySearch` - Query for semantically similar documents.

This abstraction lets you switch between different implementations without altering your application logic.

### Initialization

Most vectorstores in LangChain accept an embedding model as an argument when initializing the vector store.

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});
const vectorStore = new MemoryVectorStore(embeddings);
```

### Adding documents

You can add documents to the vector store by using the `addDocuments` function.

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Document } from "@langchain/core/documents";
const document = new Document({
  pageContent: "Hello world",
});
await vectorStore.addDocuments([document]);
```

### Deleting documents

You can delete documents from the vector store by using the `delete` function.

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await vectorStore.delete({
  filter: {
    pageContent: "Hello world",
  },
});
```

### Similarity search

Issue a semantic query using `similaritySearch`, which returns the closest embedded documents:

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const results = await vectorStore.similaritySearch("Hello world", 10);
```

Many vector stores support parameters like:

* `k` — number of results to return
* `filter` — conditional filtering based on metadata

### Similarity metrics & indexing

Embedding similarity may be computed using:

* **Cosine similarity**
* **Euclidean distance**
* **Dot product**

Efficient search often employs indexing methods such as HNSW (Hierarchical Navigable Small World), though specifics depend on the vector store.

### Metadata filtering

Filtering by metadata (e.g., source, date) can refine search results:

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
vectorStore.similaritySearch("query", 2, { source: "tweets" });
```

<important>
  Support for metadata-based filtering varies between implementations.
  Check the documentation of your chosen vector store for details.
</important>

## Top integrations

**Select embedding model:**

<AccordionGroup>
  <Accordion title="OpenAI">
    Install dependencies:

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

    Add environment variables:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    OPENAI_API_KEY=your-api-key
    ```

    Instantiate the model:

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { OpenAIEmbeddings } from "@langchain/openai";

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large"
    });
    ```
  </Accordion>

  <Accordion title="Azure">
    Install dependencies

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

    Add environment variables:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    AZURE_OPENAI_API_INSTANCE_NAME=<YOUR_INSTANCE_NAME>
    AZURE_OPENAI_API_KEY=<YOUR_KEY>
    AZURE_OPENAI_API_VERSION="2024-02-01"
    ```

    Instantiate the model:

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { AzureOpenAIEmbeddings } from "@langchain/openai";

    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiEmbeddingsDeploymentName: "text-embedding-ada-002"
    });
    ```
  </Accordion>

  <Accordion title="AWS">
    Install dependencies:

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

    Add environment variables:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    BEDROCK_AWS_REGION=your-region
    ```

    Instantiate the model:

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { BedrockEmbeddings } from "@langchain/aws";

    const embeddings = new BedrockEmbeddings({
      model: "amazon.titan-embed-text-v1"
    });
    ```
  </Accordion>

  <Accordion title="Google Gemini">
    Install dependencies:

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
    </CodeGroup>

    Add environment variables:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    GOOGLE_API_KEY=your-api-key
    ```

    Instantiate the model:

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004"
    });
    ```
  </Accordion>

  <Accordion title="Google Vertex">
    Install dependencies:

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

    Add environment variables:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    GOOGLE_APPLICATION_CREDENTIALS=credentials.json
    ```

    Instantiate the model:

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { VertexAIEmbeddings } from "@langchain/google-vertexai";

    const embeddings = new VertexAIEmbeddings({
      model: "gemini-embedding-001"
    });
    ```
  </Accordion>

  <Accordion title="MistralAI">
    Install dependencies:

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

    Add environment variables:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    MISTRAL_API_KEY=your-api-key
    ```

    Instantiate the model:

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { MistralAIEmbeddings } from "@langchain/mistralai";

    const embeddings = new MistralAIEmbeddings({
      model: "mistral-embed"
    });
    ```
  </Accordion>

  <Accordion title="Cohere">
    Install dependencies:

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

    Add environment variables:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    COHERE_API_KEY=your-api-key
    ```

    Instantiate the model:

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { CohereEmbeddings } from "@langchain/cohere";

    const embeddings = new CohereEmbeddings({
      model: "embed-english-v3.0"
    });
    ```
  </Accordion>

  <Accordion title="Ollama">
    Install dependencies:

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

    Instantiate the model:

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { OllamaEmbeddings } from "@langchain/ollama";

    const embeddings = new OllamaEmbeddings({
      model: "llama2",
      baseUrl: "http://localhost:11434", // Default value
    });
    ```
  </Accordion>

  <Accordion title="Voyage AI">
    Install dependencies:

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

    Add environment variables:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    VOYAGE_API_KEY=your-api-key
    ```

    Instantiate the model:

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { VoyageEmbeddings } from "@langchain/mongodb";

    const embeddings = new VoyageEmbeddings({
      model: "voyage-4"
    });
    ```
  </Accordion>
</AccordionGroup>

**Select vector store:**

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

LangChain.js integrates with a variety of vector stores. You can check out a full list below:

## All vector stores

<div>
  | Vectorstore                                                                                                          | Downloads                                                                                                                           |
  | :------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
  | [`WeaviateStore`](/oss/javascript/integrations/vectorstores/weaviate)                                                | <span><a href="https://www.npmjs.com/package/@langchain/weaviate">  <img alt="Downloads per month" /></a></span>                    |
  | [`PineconeStore`](/oss/javascript/integrations/vectorstores/pinecone)                                                | <span><a href="https://www.npmjs.com/package/@langchain/pinecone">  <img alt="Downloads per month" /></a></span>                    |
  | [`MongoDBAtlasVectorSearch`](/oss/javascript/integrations/vectorstores/mongodb_atlas)                                | <span><a href="https://www.npmjs.com/package/@langchain/mongodb">  <img alt="Downloads per month" /></a></span>                     |
  | [`QdrantVectorStore`](/oss/javascript/integrations/vectorstores/qdrant)                                              | <span><a href="https://www.npmjs.com/package/@langchain/qdrant">  <img alt="Downloads per month" /></a></span>                      |
  | [`RedisVectorStore`](/oss/javascript/integrations/vectorstores/redis)                                                | <span><a href="https://www.npmjs.com/package/@langchain/redis">  <img alt="Downloads per month" /></a></span>                       |
  | [`OracleVS`](/oss/javascript/integrations/vectorstores/oracleai)                                                     | <span><a href="https://www.npmjs.com/package/@oracle/langchain-oracledb">  <img alt="Downloads per month" /></a></span>             |
  | [`PGVectorStore`](/oss/javascript/integrations/vectorstores/pgvector)                                                | <span><a href="https://www.npmjs.com/package/@langchain/pgvector">  <img alt="Downloads per month" /></a></span>                    |
  | [`Cloudflare vectorize`](/oss/javascript/integrations/vectorstores/cloudflare_vectorize)                             | <span><a href="https://www.npmjs.com/package/@langchain/cloudflare">  <img alt="Downloads per month" /></a></span>                  |
  | [`Azure Cosmos DB for MongoDB vCore (deprecated)`](/oss/javascript/integrations/vectorstores/azure_cosmosdb_mongodb) | <span><a href="https://www.npmjs.com/package/@langchain/azure-cosmosdb">  <img alt="Downloads per month" /></a></span>              |
  | [`Azure Cosmos DB for NoSQL`](/oss/javascript/integrations/vectorstores/azure_cosmosdb_nosql)                        | <span><a href="https://www.npmjs.com/package/@langchain/azure-cosmosdb">  <img alt="Downloads per month" /></a></span>              |
  | [`Azure DocumentDB`](/oss/javascript/integrations/vectorstores/azure_documentdb)                                     | <span><a href="https://www.npmjs.com/package/@langchain/azure-cosmosdb">  <img alt="Downloads per month" /></a></span>              |
  | [`TurbopufferVectorStore`](/oss/javascript/integrations/vectorstores/turbopuffer)                                    | <span><a href="https://www.npmjs.com/package/@langchain/turbopuffer">  <img alt="Downloads per month" /></a></span>                 |
  | [`Google cloud SQL for postgresql`](/oss/javascript/integrations/vectorstores/google_cloudsql_pg)                    | <span><a href="https://www.npmjs.com/package/@langchain/google-cloud-sql-pg">  <img alt="Downloads per month" /></a></span>         |
  | [`SAP HANA Cloud Vector Engine`](/oss/javascript/integrations/vectorstores/sap_hanavector)                           | <span><a href="https://www.npmjs.com/package/@sap/hana-langchain">  <img alt="Downloads per month" /></a></span>                    |
  | [`Neo4jVectorStore`](/oss/javascript/integrations/vectorstores/neo4jvector)                                          | <span><a href="https://www.npmjs.com/package/@langchain/neo4j">  <img alt="Downloads per month" /></a></span>                       |
  | [`LambdaDB`](https://docs.lambdadb.ai/guides/get-started/quickstart)                                                 | <span><a href="https://www.npmjs.com/package/@functional-systems/langchain-lambdadb">  <img alt="Downloads per month" /></a></span> |
  | [`Infino`](https://infino.ai/docs)                                                                                   | <span><a href="https://www.npmjs.com/package/@infino-ai/langchain-infino">  <img alt="Downloads per month" /></a></span>            |
  | [`YDB`](/oss/javascript/integrations/vectorstores/ydb)                                                               | <span><a href="https://www.npmjs.com/package/@ydbjs/langchain">  <img alt="Downloads per month" /></a></span>                       |
  | [`langchain`](/oss/javascript/integrations/vectorstores/memory)                                                      | <span>N/A</span>                                                                                                                    |
</div>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/vectorstores/index.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>