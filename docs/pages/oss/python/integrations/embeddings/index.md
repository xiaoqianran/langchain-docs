<!-- langchain-docs: Embedding model integrations | https://docs.langchain.com/oss/python/integrations/embeddings/index -->

# Embedding model integrations

Integrate with embedding models using LangChain Python.

## Overview

<Note>
  This overview covers **text-based embedding models**. LangChain does not currently support multimodal embeddings.

  See [top embedding models](#top-integrations).
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

Here's an example of computing cosine similarity between two vectors:

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import numpy as np

def cosine_similarity(vec1, vec2):
    dot = np.dot(vec1, vec2)
    return dot / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

similarity = cosine_similarity(query_embedding, document_embedding)
print("Cosine Similarity:", similarity)
```

## Interface

LangChain provides a standard interface for text embedding models (e.g., OpenAI, Cohere, Hugging Face) via the [Embeddings](https://reference.langchain.com/python/langchain-core/embeddings/embeddings/Embeddings) interface.

Two main methods are available:

* `embed_documents(texts: List[str]) → List[List[float]]`: Embeds a list of documents.
* `embed_query(text: str) → List[float]`: Embeds a single query.

<Note>
  The interface allows queries and documents to be embedded with different strategies, though most providers handle them the same way in practice.
</Note>

## Top integrations

<div>
  | Integration                                                                                          | Downloads                                                                                                              |
  | :--------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
  | [`AzureOpenAIEmbeddings`](/oss/python/integrations/embeddings/azure_openai)                          | <span><a href="https://pypi.org/project/langchain-openai/">  <img alt="Downloads per month" /></a></span>              |
  | [`OpenAIEmbeddings`](/oss/python/integrations/embeddings/openai)                                     | <span><a href="https://pypi.org/project/langchain-openai/">  <img alt="Downloads per month" /></a></span>              |
  | [`GoogleGenerativeAIEmbeddings`](/oss/python/integrations/embeddings/google_generative_ai)           | <span><a href="https://pypi.org/project/langchain-google-genai/">  <img alt="Downloads per month" /></a></span>        |
  | [`DatabricksEmbeddings`](/oss/python/integrations/embeddings/databricks)                             | <span><a href="https://pypi.org/project/databricks-langchain/">  <img alt="Downloads per month" /></a></span>          |
  | [`OllamaEmbeddings`](/oss/python/integrations/embeddings/ollama)                                     | <span><a href="https://pypi.org/project/langchain-ollama/">  <img alt="Downloads per month" /></a></span>              |
  | [`Sentence Transformers on Hugging Face`](/oss/python/integrations/embeddings/sentence_transformers) | <span><a href="https://pypi.org/project/langchain-huggingface/">  <img alt="Downloads per month" /></a></span>         |
  | [`MistralAIEmbeddings`](/oss/python/integrations/embeddings/mistralai)                               | <span><a href="https://pypi.org/project/langchain-mistralai/">  <img alt="Downloads per month" /></a></span>           |
  | [`CohereEmbeddings`](/oss/python/integrations/embeddings/cohere)                                     | <span><a href="https://pypi.org/project/langchain-cohere/">  <img alt="Downloads per month" /></a></span>              |
  | [`NVIDIAEmbeddings`](/oss/python/integrations/embeddings/nvidia_ai_endpoints)                        | <span><a href="https://pypi.org/project/langchain-nvidia-ai-endpoints/">  <img alt="Downloads per month" /></a></span> |
  | [`PerplexityEmbeddings`](/oss/python/integrations/embeddings/perplexity)                             | <span><a href="https://pypi.org/project/langchain-perplexity/">  <img alt="Downloads per month" /></a></span>          |
  | [`TogetherEmbeddings`](/oss/python/integrations/embeddings/together)                                 | <span><a href="https://pypi.org/project/langchain-together/">  <img alt="Downloads per month" /></a></span>            |
</div>

### Common deployment patterns

In practice, most teams converge on one of four patterns:

1. Hosted, flagship: OpenAI `text-embedding-3-large`, Cohere `embed-english-v3`, Google `gemini-embedding-001`, Voyage `voyage-3`. One API call, best-in-class quality out of the box, no local infrastructure. Per-call cost and a data-egress dependency.
2. Local, open-source: `BAAI/bge-*`, `mixedbread-ai/mxbai-embed-*`, `Qwen/Qwen3-Embedding-*`, `nomic-ai/modernbert-embed-*`, `sentence-transformers/all-*`. Download once, run anywhere. No per-call cost, data never leaves your environment. Likely slower on CPU than a hosted API at small scale; competitive or faster with a GPU.
3. Local, open-source, specialist: a fine-tuned model targeting your specific domain, language, or task. Starting from a strong open base (e.g. `BAAI/bge-m3`) and fine-tuning on even a few thousand in-domain query/document pairs often beats hosted flagships on retrieval accuracy for that domain.
4. Self-hosted at production scale: the same open models (base or fine-tuned) served via [Text Embeddings Inference (TEI)](https://github.com/huggingface/text-embeddings-inference) or Ollama. Gives you the economics of local inference with the horizontal scaling and API ergonomics of a hosted provider.

LangChain treats all four the same: you instantiate an `Embeddings` subclass and hand it to your vector store or retriever. Patterns (2) and (3) use `HuggingFaceEmbeddings`; pattern (4) uses `OpenAIEmbeddings` against TEI's OpenAI-compatible endpoint, or `OllamaEmbeddings`.

### Factors to weigh

#### Quality

Start from the [MTEB leaderboard](https://huggingface.co/spaces/mteb/leaderboard). MTEB benchmarks embedding models across retrieval, clustering, classification, and reranking tasks, and is the de-facto industry reference. Filter by your language(s) and by task (retrieval is the most common for RAG).

Leaderboard numbers don't always transfer, so run a small evaluation on your own data before committing. LangSmith has tooling for this; see the [evaluation guides](/langsmith/evaluation-concepts).

#### Cost

Hosted embeddings typically price in the range of a few cents to \~\$0.15 per million tokens. For a corpus embedded once and queried thousands of times a day, cost is often dominated by the query side.

Local inference has zero per-call cost but requires CPU (slow) or GPU (capital or cloud cost). The crossover is workload-dependent: low-volume personal projects are essentially free on CPU; for mid-volume production, a single GPU serving a local model via TEI often beats hosted on unit economics.

#### Latency

Hosted embedding APIs add roughly 50-200ms of network latency per request. Local models on CPU take 10-100ms for a short query with a small model (`all-MiniLM-L6-v2`-class), and 50-500ms for larger models. On GPU, local inference is typically faster than a round-trip to a hosted API.

For batch indexing, latency per request matters less than throughput. TEI and multi-process local inference batch aggressively. Consider e.g. `encode_kwargs={"batch_size": 64}` or higher on `HuggingFaceEmbeddings` when running on GPU.

#### Dimensionality

Embedding dimension affects vector store storage and query compute. Typical sizes:

* 384 (small Sentence Transformers models, `all-MiniLM-L6-v2`)
* 768 (mid-size ST models, `all-mpnet-base-v2`, `bge-base`)
* 1024 (`bge-large`, Cohere v3, Voyage)
* 1536 (OpenAI `text-embedding-3-small`, Qwen3-Embedding-0.6B)
* 3072+ (OpenAI `text-embedding-3-large`, Qwen3-Embedding-4B/8B)

Larger vectors are usually more accurate but consume more storage and query compute. Several modern models (OpenAI `text-embedding-3-*`, `mixedbread-ai/mxbai-embed-large-v1`, Matryoshka-trained ST models, Qwen3-Embedding) support **truncation**: slice the vector to a smaller dimension with graceful quality degradation. Useful for fitting more vectors into a smaller index.

#### Context length

Most classic embedding models cap out at 512 tokens (`all-mpnet-base-v2`, classic BGE). Newer models support longer contexts:

* `nomic-ai/modernbert-embed-base`: 8192 tokens
* `Alibaba-NLP/gte-multilingual-base`: 8192 tokens
* `BAAI/bge-m3`: 8192 tokens
* OpenAI `text-embedding-3-*`: 8191 tokens

If your chunks are long (full-page technical docs, legal paragraphs), prefer long-context models. For short chunks the 512-token limit is rarely binding.

#### Multilingual support

For multilingual retrieval, pick a model trained on your languages. Strong defaults:

* Open: `BAAI/bge-m3`, `intfloat/multilingual-e5-*`, `Alibaba-NLP/gte-multilingual-*`, `Qwen/Qwen3-Embedding-*` (via `HuggingFaceEmbeddings`)
* Hosted: Cohere `embed-multilingual-v3`, OpenAI `text-embedding-3-*`

#### Query and document prompts

Several modern open models (E5, BGE, Qwen3-Embedding, GTE) are trained with different text prefixes for queries versus documents. Using the wrong prefix at query time is a common quality regression. When using `HuggingFaceEmbeddings`, pass prompts explicitly:

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(
    model_name="intfloat/e5-large-v2",
    encode_kwargs={"prompt": "passage: "},
    query_encode_kwargs={"prompt": "query: "},
)
```

Check each model's card on Hugging Face for the recommended prompt strings.

#### Licensing

Most popular open embedding models are permissively licensed (Apache 2.0, MIT). A few recent specialist models require a commercial license for production use. Check each model's license before shipping.

### Beyond single-vector dense embeddings

A single dense vector per chunk is the default, but not the only option.

#### Sparse and hybrid retrieval

Dense embeddings don't handle exact-match queries (product codes, named entities, code identifiers) as well as keyword-based indexes. Hybrid retrieval combines a dense index with BM25 or a sparse neural index (SPLADE, `BAAI/bge-m3`'s sparse output) to cover both cases.

#### Late-interaction and multi-vector

ColBERT-style models produce a vector per token rather than per chunk, then score queries against documents via late interaction. This is typically more accurate than single-vector dense retrieval on complex queries, at the cost of higher storage and more complex indexing. Current open models in this space include `jinaai/jina-colbert-v2`, `answerdotai/answerai-colbert-small-v1`, and newer late-interaction variants such as `lightonai/LateOn`. LangChain's built-in retrievers target single-vector embeddings; late interaction typically requires a specialist index (Vespa, Qdrant's multi-vector support, or PyLate).

### Starting points

If you just want a working starting point:

* Quick prototype, hosted: `OpenAIEmbeddings(model="text-embedding-3-small")`
* Quick prototype, local, no API key: `HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2", encode_kwargs={"normalize_embeddings": True})`
* Production, hosted, quality-first: `VoyageAIEmbeddings(model="voyage-3")` or `OpenAIEmbeddings(model="text-embedding-3-large")`
* Production, open, quality-first: `HuggingFaceEmbeddings(model_name="BAAI/bge-m3", encode_kwargs={"normalize_embeddings": True})` served via TEI
* Multilingual, open: `HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-large")` with query and document prompts configured

Measure retrieval quality on your own data, then iterate.

## Caching

Embeddings can be stored or temporarily cached to avoid needing to recompute them.

Caching embeddings can be done using a `CacheBackedEmbeddings`. This wrapper stores embeddings in a key-value store, where the text is hashed and the hash is used as the key in the cache.

The main supported way to initialize a `CacheBackedEmbeddings` is `from_bytes_store`. It takes the following parameters:

* **`underlying_embedder`**: The embedder to use for embedding.
* **`document_embedding_cache`**: Any [`ByteStore`](/oss/python/integrations/stores/) for caching document embeddings.
* **`batch_size`**: (optional, defaults to `None`) The number of documents to embed between store updates.
* **`namespace`**: (optional, defaults to `""`) The namespace to use for the document cache. Helps avoid collisions (e.g., set it to the embedding model name).
* **`query_embedding_cache`**: (optional, defaults to `None`) A [`ByteStore`](/oss/python/integrations/stores/) for caching query embeddings, or `True` to reuse the same store as `document_embedding_cache`.

<Important>
  - Always set the `namespace` parameter to avoid collisions when using different embedding models.
  - `CacheBackedEmbeddings` does not cache query embeddings by default. To enable this, specify a `query_embedding_cache`.
</Important>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import time
from langchain_classic.embeddings import CacheBackedEmbeddings  # [!code highlight]
from langchain_classic.storage import LocalFileStore # [!code highlight]
from langchain_core.vectorstores import InMemoryVectorStore

# Create your underlying embeddings model
underlying_embeddings = ... # e.g., OpenAIEmbeddings(), HuggingFaceEmbeddings(), etc.

# Store persists embeddings to the local filesystem
# This isn't for production use, but is useful for local
store = LocalFileStore("./cache/") # [!code highlight]

cached_embedder = CacheBackedEmbeddings.from_bytes_store(
    underlying_embeddings,
    store,
    namespace=underlying_embeddings.model
)

# Example: caching a query embedding
tic = time.time()
print(cached_embedder.embed_query("Hello, world!"))
print(f"First call took: {time.time() - tic:.2f} seconds")

# Subsequent calls use the cache
tic = time.time()
print(cached_embedder.embed_query("Hello, world!"))
print(f"Second call took: {time.time() - tic:.2f} seconds")
```

In production, you would typically use a more robust persistent store, such as a database or cloud storage. Please see [stores integrations](/oss/python/integrations/stores/) for options.

## All embedding models

<div>
  | Integration                                                                                            | Downloads                                                                                                                 |
  | :----------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
  | [`AzureOpenAIEmbeddings`](/oss/python/integrations/embeddings/azure_openai)                            | <span><a href="https://pypi.org/project/langchain-openai/">  <img alt="Downloads per month" /></a></span>                 |
  | [`OpenAIEmbeddings`](/oss/python/integrations/embeddings/openai)                                       | <span><a href="https://pypi.org/project/langchain-openai/">  <img alt="Downloads per month" /></a></span>                 |
  | [`Google Vertex AI`](/oss/python/integrations/embeddings/google_vertex_ai)                             | <span><a href="https://pypi.org/project/langchain-google-vertexai/">  <img alt="Downloads per month" /></a></span>        |
  | [`GoogleGenerativeAIEmbeddings`](/oss/python/integrations/embeddings/google_generative_ai)             | <span><a href="https://pypi.org/project/langchain-google-genai/">  <img alt="Downloads per month" /></a></span>           |
  | [`BedrockEmbeddings`](/oss/python/integrations/embeddings/bedrock)                                     | <span><a href="https://pypi.org/project/langchain-aws/">  <img alt="Downloads per month" /></a></span>                    |
  | [`DatabricksEmbeddings`](/oss/python/integrations/embeddings/databricks)                               | <span><a href="https://pypi.org/project/databricks-langchain/">  <img alt="Downloads per month" /></a></span>             |
  | [`OllamaEmbeddings`](/oss/python/integrations/embeddings/ollama)                                       | <span><a href="https://pypi.org/project/langchain-ollama/">  <img alt="Downloads per month" /></a></span>                 |
  | [`BGE on Hugging Face`](/oss/python/integrations/embeddings/bge_huggingface)                           | <span><a href="https://pypi.org/project/langchain-huggingface/">  <img alt="Downloads per month" /></a></span>            |
  | [`Hugging Face`](/oss/python/integrations/embeddings/huggingfacehub)                                   | <span><a href="https://pypi.org/project/langchain-huggingface/">  <img alt="Downloads per month" /></a></span>            |
  | [`Instructor embeddings on Hugging Face`](/oss/python/integrations/embeddings/instruct_embeddings)     | <span><a href="https://pypi.org/project/langchain-huggingface/">  <img alt="Downloads per month" /></a></span>            |
  | [`Sentence Transformers on Hugging Face`](/oss/python/integrations/embeddings/sentence_transformers)   | <span><a href="https://pypi.org/project/langchain-huggingface/">  <img alt="Downloads per month" /></a></span>            |
  | [`Text embeddings inference`](/oss/python/integrations/embeddings/text_embeddings_inference)           | <span><a href="https://pypi.org/project/langchain-huggingface/">  <img alt="Downloads per month" /></a></span>            |
  | [`FireworksEmbeddings`](/oss/python/integrations/embeddings/fireworks)                                 | <span><a href="https://pypi.org/project/langchain-fireworks/">  <img alt="Downloads per month" /></a></span>              |
  | [`MistralAIEmbeddings`](/oss/python/integrations/embeddings/mistralai)                                 | <span><a href="https://pypi.org/project/langchain-mistralai/">  <img alt="Downloads per month" /></a></span>              |
  | [`Pinecone`](/oss/python/integrations/embeddings/pinecone)                                             | <span><a href="https://pypi.org/project/langchain-pinecone/">  <img alt="Downloads per month" /></a></span>               |
  | [`CohereEmbeddings`](/oss/python/integrations/embeddings/cohere)                                       | <span><a href="https://pypi.org/project/langchain-cohere/">  <img alt="Downloads per month" /></a></span>                 |
  | [`NVIDIAEmbeddings`](/oss/python/integrations/embeddings/nvidia_ai_endpoints)                          | <span><a href="https://pypi.org/project/langchain-nvidia-ai-endpoints/">  <img alt="Downloads per month" /></a></span>    |
  | [`WatsonxEmbeddings`](/oss/python/integrations/embeddings/ibm_watsonx)                                 | <span><a href="https://pypi.org/project/langchain-ibm/">  <img alt="Downloads per month" /></a></span>                    |
  | [`PerplexityEmbeddings`](/oss/python/integrations/embeddings/perplexity)                               | <span><a href="https://pypi.org/project/langchain-perplexity/">  <img alt="Downloads per month" /></a></span>             |
  | [`Elasticsearch`](/oss/python/integrations/embeddings/elasticsearch)                                   | <span><a href="https://pypi.org/project/langchain-elasticsearch/">  <img alt="Downloads per month" /></a></span>          |
  | [`Oracle AI vector search generate`](/oss/python/integrations/embeddings/oracleai)                     | <span><a href="https://pypi.org/project/langchain-oracledb/">  <img alt="Downloads per month" /></a></span>               |
  | [`SambanovaEmbeddings`](/oss/python/integrations/embeddings/sambanova)                                 | <span><a href="https://pypi.org/project/langchain-sambanova/">  <img alt="Downloads per month" /></a></span>              |
  | [`OCIGenAIEmbeddings`](/oss/python/integrations/embeddings/oci_generative_ai)                          | <span><a href="https://pypi.org/project/langchain-oci/">  <img alt="Downloads per month" /></a></span>                    |
  | [`BasetenEmbeddings`](/oss/python/integrations/embeddings/baseten)                                     | <span><a href="https://pypi.org/project/langchain-baseten/">  <img alt="Downloads per month" /></a></span>                |
  | [`TogetherEmbeddings`](/oss/python/integrations/embeddings/together)                                   | <span><a href="https://pypi.org/project/langchain-together/">  <img alt="Downloads per month" /></a></span>               |
  | [`Voyage AI`](/oss/python/integrations/embeddings/voyageai)                                            | <span><a href="https://pypi.org/project/langchain-voyageai/">  <img alt="Downloads per month" /></a></span>               |
  | [`UpstageEmbeddings`](/oss/python/integrations/embeddings/upstage)                                     | <span><a href="https://pypi.org/project/langchain-upstage/">  <img alt="Downloads per month" /></a></span>                |
  | [`Naver`](https://guide.ncloud-docs.com/docs/clovastudio-dev-langchain)                                | <span><a href="https://pypi.org/project/langchain-naver/">  <img alt="Downloads per month" /></a></span>                  |
  | [`NomicEmbeddings`](https://atlas.nomic.ai/)                                                           | <span><a href="https://pypi.org/project/langchain-nomic/">  <img alt="Downloads per month" /></a></span>                  |
  | [`Nebius`](https://docs.tokenfactory.nebius.com/quickstart)                                            | <span><a href="https://pypi.org/project/langchain-nebius/">  <img alt="Downloads per month" /></a></span>                 |
  | [`Cloudflare workers AI`](https://developers.cloudflare.com/ai/models/#text-embeddings)                | <span><a href="https://pypi.org/project/langchain-cloudflare/">  <img alt="Downloads per month" /></a></span>             |
  | [`Localai`](https://localai.io/features/embeddings/index.html)                                         | <span><a href="https://pypi.org/project/langchain-localai/">  <img alt="Downloads per month" /></a></span>                |
  | [`DoublewordEmbeddings`](https://docs.doubleword.ai/inference-api/intro-to-doubleword-inference)       | <span><a href="https://pypi.org/project/langchain-doubleword/">  <img alt="Downloads per month" /></a></span>             |
  | [`Modelscope`](https://www.modelscope.cn/docs/sdk/pipelines)                                           | <span><a href="https://pypi.org/project/langchain-modelscope-integration/">  <img alt="Downloads per month" /></a></span> |
  | [`PredictionGuardEmbeddings`](https://docs.predictionguard.com/api-reference/api-reference/embeddings) | <span><a href="https://pypi.org/project/langchain-predictionguard/">  <img alt="Downloads per month" /></a></span>        |
  | [`AIMlAPIEmbeddings`](https://docs.aimlapi.com/)                                                       | <span><a href="https://pypi.org/project/langchain-aimlapi/">  <img alt="Downloads per month" /></a></span>                |
  | [`ForgeEmbeddings`](https://voxell.ai/forge)                                                           | <span><a href="https://pypi.org/project/langchain-voxell/">  <img alt="Downloads per month" /></a></span>                 |
  | [`EmpirioLabsEmbeddings`](https://docs.empiriolabs.ai)                                                 | <span><a href="https://pypi.org/project/langchain-empiriolabs/">  <img alt="Downloads per month" /></a></span>            |
  | [`Netmind`](https://github.com/protagolabs/langchain-netmind)                                          | <span><a href="https://pypi.org/project/langchain-netmind/">  <img alt="Downloads per month" /></a></span>                |
  | [`KeiroEmbeddings`](https://github.com/Keirolabs-API/langchain-keiro)                                  | <span><a href="https://pypi.org/project/langchain-keiro/">  <img alt="Downloads per month" /></a></span>                  |
  | [`GreenNodeEmbeddings`](https://greennode.ai/)                                                         | <span><a href="https://pypi.org/project/langchain-greennode/">  <img alt="Downloads per month" /></a></span>              |
  | [`ANEEmbeddings`](https://github.com/sbryngelson/langchain-aneforge)                                   | <span><a href="https://pypi.org/project/langchain-aneforge/">  <img alt="Downloads per month" /></a></span>               |
  | [`TelnyxEmbeddings`](https://developers.telnyx.com/docs/inference/models)                              | <span><a href="https://pypi.org/project/langchain-telnyx/">  <img alt="Downloads per month" /></a></span>                 |
  | [`Isaacus`](https://isaacus.com/docs)                                                                  | <span><a href="https://pypi.org/project/langchain-isaacus/">  <img alt="Downloads per month" /></a></span>                |
  | [`Lindorm`](https://help.aliyun.com/en/lindorm/product-overview/product-introduction-overview)         | <span><a href="https://pypi.org/project/langchain-lindorm-integration/">  <img alt="Downloads per month" /></a></span>    |
  | [`PolarDBPGEmbeddings`](https://github.com/polardb/langchain-polardb-pg)                               | <span>N/A</span>                                                                                                          |
  | [`OpensolrEmbeddings`](https://opensolr.com/langchain)                                                 | <span><a href="https://pypi.org/project/langchain-opensolr/">  <img alt="Downloads per month" /></a></span>               |
</div>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/embeddings/index.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>