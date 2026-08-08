<!-- langchain-docs: Embedding model integrations | https://docs.langchain.com/oss/javascript/integrations/embeddings/index -->

# Embedding model integrations

Integrate with embedding models using LangChain JavaScript.

## Overview

<Note>
  This overview covers **text-based embedding models**. LangChain does not currently support multimodal embeddings.
</Note>

Embedding models transform raw text—such as a sentence, paragraph, or tweet—into a fixed-length vector of numbers that captures its **semantic meaning**. These vectors allow machines to compare and search text based on meaning rather than exact words.

In practice, this means that texts with similar ideas are placed close together in the vector space. For example, instead of matching only the phrase *"machine learning"*, embeddings can surface documents that discuss related concepts even when different wording is used.

### How it works

1. **Vectorization** — The model encodes each input string as a high-dimensional vector.
2. **Similarity scoring** — Vectors are compared using mathematical metrics to measure how closely related the underlying texts are.

### Similarity metrics

Several metrics are commonly used to compare embeddings:

* **Cosine similarity** — measures the angle between two vectors.
* **Euclidean distance** — measures the straight-line distance between points.
* **Dot product** — measures how much one vector projects onto another.

## Interface

LangChain provides a standard interface for text embedding models (e.g., OpenAI, Cohere, Hugging Face) via the [Embeddings](https://reference.langchain.com/javascript/langchain-core/embeddings/Embeddings) interface.

Two main methods are available:

* `embedDocuments(documents: string[]) → number[][]`: Embeds a list of documents.
* `embedQuery(text: string) → number[]`: Embeds a single query.

<Note>
  The interface allows queries and documents to be embedded with different strategies, though most providers handle them the same way in practice.
</Note>

## Install and use

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
      npm install @langchain/aws @langchain/core
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/aws @langchain/core
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/aws @langchain/core
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
      npm install @langchain/google-genai @langchain/core
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/google-genai @langchain/core
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/google-genai @langchain/core
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
      npm install @langchain/google-vertexai @langchain/core
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/google-vertexai @langchain/core
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/google-vertexai @langchain/core
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
      npm install @langchain/cohere @langchain/core
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/cohere @langchain/core
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/cohere @langchain/core
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

## Caching

Embeddings can be stored or temporarily cached to avoid needing to recompute them.

Caching embeddings can be done using a `CacheBackedEmbeddings`. This wrapper stores embeddings in a key-value store, where the text is hashed and the hash is used as the key in the cache.

The main supported way to initialize a `CacheBackedEmbeddings` is `fromBytesStore`. It takes the following parameters:

* **underlyingEmbeddings**: The embedder to use for embedding.
* **documentEmbeddingStore**: Any [`BaseStore`](/oss/javascript/integrations/stores/) for caching document embeddings.
* **options.namespace**: (optional, defaults to `""`) The namespace to use for the document cache. Helps avoid collisions (e.g., set it to the embedding model name).

<Important>
  - Always set the `namespace` parameter to avoid collisions when using different embedding models.
  - `CacheBackedEmbeddings` does not cache query embeddings by default. To enable this, specify a `query_embedding_store`.
</Important>

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

In production, you would typically use a more robust persistent store, such as a database or cloud storage. Please see [stores integrations](/oss/javascript/integrations/stores/) for options.

## All integrations

<div>
  | Integration                                                                                    | Downloads                                                                                                               |
  | :--------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
  | [`AzureOpenAIEmbeddings`](/oss/javascript/integrations/embeddings/azure_openai)                | <span><a href="https://www.npmjs.com/package/@langchain/openai">  <img alt="Downloads per month" /></a></span>          |
  | [`OpenAIEmbeddings`](/oss/javascript/integrations/embeddings/openai)                           | <span><a href="https://www.npmjs.com/package/@langchain/openai">  <img alt="Downloads per month" /></a></span>          |
  | [`GoogleGenerativeAIEmbeddings`](/oss/javascript/integrations/embeddings/google_generative_ai) | <span><a href="https://www.npmjs.com/package/@langchain/google-genai">  <img alt="Downloads per month" /></a></span>    |
  | [`Bedrock`](/oss/javascript/integrations/embeddings/bedrock)                                   | <span><a href="https://www.npmjs.com/package/@langchain/aws">  <img alt="Downloads per month" /></a></span>             |
  | [`VertexAIEmbeddings`](/oss/javascript/integrations/embeddings/google_vertex_ai)               | <span><a href="https://www.npmjs.com/package/@langchain/google-vertexai">  <img alt="Downloads per month" /></a></span> |
  | [`OllamaEmbeddings`](/oss/javascript/integrations/embeddings/ollama)                           | <span><a href="https://www.npmjs.com/package/@langchain/ollama">  <img alt="Downloads per month" /></a></span>          |
  | [`MistralAIEmbeddings`](/oss/javascript/integrations/embeddings/mistralai)                     | <span><a href="https://www.npmjs.com/package/@langchain/mistralai">  <img alt="Downloads per month" /></a></span>       |
  | [`PineconeEmbeddings`](/oss/javascript/integrations/embeddings/pinecone)                       | <span><a href="https://www.npmjs.com/package/@langchain/pinecone">  <img alt="Downloads per month" /></a></span>        |
  | [`CohereEmbeddings`](/oss/javascript/integrations/embeddings/cohere)                           | <span><a href="https://www.npmjs.com/package/@langchain/cohere">  <img alt="Downloads per month" /></a></span>          |
  | [`VoyageEmbeddings`](/oss/javascript/integrations/embeddings/voyageai)                         | <span><a href="https://www.npmjs.com/package/@langchain/mongodb">  <img alt="Downloads per month" /></a></span>         |
  | [`Baidu qianfan`](/oss/javascript/integrations/embeddings/baidu_qianfan)                       | <span><a href="https://www.npmjs.com/package/@langchain/baidu-qianfan">  <img alt="Downloads per month" /></a></span>   |
  | [`Nomic`](/oss/javascript/integrations/embeddings/nomic)                                       | <span><a href="https://www.npmjs.com/package/@langchain/nomic">  <img alt="Downloads per month" /></a></span>           |
  | [`CloudflareWorkersAIEmbeddings`](/oss/javascript/integrations/embeddings/cloudflare_ai)       | <span><a href="https://www.npmjs.com/package/@langchain/cloudflare">  <img alt="Downloads per month" /></a></span>      |
  | [`WatsonxEmbeddings`](/oss/javascript/integrations/embeddings/ibm)                             | <span><a href="https://www.npmjs.com/package/@langchain/ibm">  <img alt="Downloads per month" /></a></span>             |
  | [`FireworksEmbeddings`](/oss/javascript/integrations/embeddings/fireworks)                     | <span><a href="https://www.npmjs.com/package/@langchain/fireworks">  <img alt="Downloads per month" /></a></span>       |
  | [`TogetherAIEmbeddings`](/oss/javascript/integrations/embeddings/togetherai)                   | <span><a href="https://www.npmjs.com/package/@langchain/together-ai">  <img alt="Downloads per month" /></a></span>     |
  | [`SCXEmbeddings`](https://scx.ai/)                                                             | <span><a href="https://www.npmjs.com/package/@scx-ai/langchain">  <img alt="Downloads per month" /></a></span>          |
  | [`Mixedbread AI`](/oss/javascript/integrations/embeddings/mixedbread_ai)                       | <span><a href="https://www.npmjs.com/package/@langchain/mixedbread-ai">  <img alt="Downloads per month" /></a></span>   |
  | [`Minimax`](/oss/javascript/integrations/embeddings/minimax)                                   | <span>N/A</span>                                                                                                        |
  | [`OracleEmbeddings`](/oss/javascript/integrations/embeddings/oracleai)                         | <span>N/A</span>                                                                                                        |
</div>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/embeddings/index.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>