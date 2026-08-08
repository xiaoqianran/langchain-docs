<!-- langchain-docs: Vector store integrations | https://docs.langchain.com/oss/python/integrations/vectorstores/index -->

# Vector store integrations

Integrate with vector stores using LangChain Python.

## Overview

A vector stores [embedded](/oss/python/integrations/embeddings) data and performs similarity search.

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

* `add_documents` - Add documents to the store.
* `delete` - Remove stored documents by ID.
* `similarity_search` - Query for semantically similar documents.

This abstraction lets you switch between different implementations without altering your application logic.

### Initialization

To initialize a vector store, provide it with an embedding model:

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_core.vectorstores import InMemoryVectorStore
vector_store = InMemoryVectorStore(embedding=SomeEmbeddingModel())
```

### Adding documents

Add [`Document`](https://reference.langchain.com/python/langchain-core/documents/base/Document) objects (holding `page_content` and optional metadata) like so:

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
vector_store.add_documents(documents=[doc1, doc2], ids=["id1", "id2"])
```

### Deleting documents

Delete by specifying IDs:

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
vector_store.delete(ids=["id1"])
```

### Similarity search

Issue a semantic query using `similarity_search`, which returns the closest embedded documents:

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
similar_docs = vector_store.similarity_search("your query here")
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

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
vector_store.similarity_search(
  "query",
  k=3,
  filter={"source": "tweets"}
)
```

<important>
  Support for metadata-based filtering varies between implementations.
  Check the documentation of your chosen vector store for details.
</important>

## Top integrations

**Select embedding model:**

<AccordionGroup>
  <Accordion title="OpenAI">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-openai
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-openai
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import getpass
    import os

    if not os.environ.get("OPENAI_API_KEY"):
      os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter API key for OpenAI: ")

    from langchain_openai import OpenAIEmbeddings

    embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
    ```
  </Accordion>

  <Accordion title="Azure">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-azure-ai
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import getpass
    import os

    if not os.environ.get("AZURE_OPENAI_API_KEY"):
      os.environ["AZURE_OPENAI_API_KEY"] = getpass.getpass("Enter API key for Azure: ")

    from langchain_openai import AzureOpenAIEmbeddings

    embeddings = AzureOpenAIEmbeddings(
        azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
        azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"],
        openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    )
    ```
  </Accordion>

  <Accordion title="Google Gemini">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-google-genai
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import getpass
    import os

    if not os.environ.get("GOOGLE_API_KEY"):
      os.environ["GOOGLE_API_KEY"] = getpass.getpass("Enter API key for Google Gemini: ")

    from langchain_google_genai import GoogleGenerativeAIEmbeddings

    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    ```
  </Accordion>

  <Accordion title="Google Vertex">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-google-vertexai
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai import VertexAIEmbeddings

    embeddings = VertexAIEmbeddings(model="text-embedding-005")
    ```
  </Accordion>

  <Accordion title="AWS">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-aws
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_aws import BedrockEmbeddings

    embeddings = BedrockEmbeddings(model_id="amazon.titan-embed-text-v2:0")
    ```
  </Accordion>

  <Accordion title="HuggingFace">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-huggingface
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_huggingface import HuggingFaceEmbeddings

    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
    ```
  </Accordion>

  <Accordion title="Ollama">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-ollama
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_ollama import OllamaEmbeddings

    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    ```
  </Accordion>

  <Accordion title="Cohere">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-cohere
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import getpass
    import os

    if not os.environ.get("COHERE_API_KEY"):
      os.environ["COHERE_API_KEY"] = getpass.getpass("Enter API key for Cohere: ")

    from langchain_cohere import CohereEmbeddings

    embeddings = CohereEmbeddings(model="embed-english-v3.0")
    ```
  </Accordion>

  <Accordion title="Mistral AI">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-mistralai
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import getpass
    import os

    if not os.environ.get("MISTRALAI_API_KEY"):
      os.environ["MISTRALAI_API_KEY"] = getpass.getpass("Enter API key for MistralAI: ")

    from langchain_mistralai import MistralAIEmbeddings

    embeddings = MistralAIEmbeddings(model="mistral-embed")
    ```
  </Accordion>

  <Accordion title="Nomic">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-nomic
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import getpass
    import os

    if not os.environ.get("NOMIC_API_KEY"):
      os.environ["NOMIC_API_KEY"] = getpass.getpass("Enter API key for Nomic: ")

    from langchain_nomic import NomicEmbeddings

    embeddings = NomicEmbeddings(model="nomic-embed-text-v1.5")
    ```
  </Accordion>

  <Accordion title="NVIDIA">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-nvidia-ai-endpoints
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import getpass
    import os

    if not os.environ.get("NVIDIA_API_KEY"):
      os.environ["NVIDIA_API_KEY"] = getpass.getpass("Enter API key for NVIDIA: ")

    from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings

    embeddings = NVIDIAEmbeddings(model="NV-Embed-QA")
    ```
  </Accordion>

  <Accordion title="Voyage AI">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-voyageai
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import getpass
    import os

    if not os.environ.get("VOYAGE_API_KEY"):
      os.environ["VOYAGE_API_KEY"] = getpass.getpass("Enter API key for Voyage AI: ")

    from langchain_voyageai import VoyageAIEmbeddings

    embeddings = VoyageAIEmbeddings(model="voyage-3")
    ```

    For more information, see the [Voyage AI documentation](https://www.mongodb.com/docs/voyageai/models/text-embeddings/).
  </Accordion>

  <Accordion title="IBM watsonx">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-ibm
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import getpass
    import os

    if not os.environ.get("WATSONX_APIKEY"):
      os.environ["WATSONX_APIKEY"] = getpass.getpass("Enter API key for IBM watsonx: ")

    from langchain_ibm import WatsonxEmbeddings

    embeddings = WatsonxEmbeddings(
        model_id="ibm/slate-125m-english-rtrvr",
        url="https://us-south.ml.cloud.ibm.com",
        project_id="<WATSONX PROJECT_ID>",
    )
    ```
  </Accordion>

  <Accordion title="Fake">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-core
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_core.embeddings import DeterministicFakeEmbedding

    embeddings = DeterministicFakeEmbedding(size=4096)
    ```
  </Accordion>

  <Accordion title="xAI">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-xai
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import getpass
    import os

    if not os.environ.get("XAI_API_KEY"):
      os.environ["XAI_API_KEY"] = getpass.getpass("Enter API key for xAI: ")

    from langchain.chat_models import init_chat_model

    model = init_chat_model("grok-2", model_provider="xai")
    ```
  </Accordion>

  <Accordion title="Perplexity">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-perplexity
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import getpass
    import os

    if not os.environ.get("PPLX_API_KEY"):
      os.environ["PPLX_API_KEY"] = getpass.getpass("Enter API key for Perplexity: ")

    from langchain.chat_models import init_chat_model

    model = init_chat_model("llama-3.1-sonar-small-128k-online", model_provider="perplexity")
    ```
  </Accordion>

  <Accordion title="DeepSeek">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-deepseek
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import getpass
    import os

    if not os.environ.get("DEEPSEEK_API_KEY"):
      os.environ["DEEPSEEK_API_KEY"] = getpass.getpass("Enter API key for DeepSeek: ")

    from langchain.chat_models import init_chat_model

    model = init_chat_model("deepseek-chat", model_provider="deepseek")
    ```
  </Accordion>
</AccordionGroup>

**Select vector store:**

<AccordionGroup>
  <Accordion title="In-memory">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-core
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-core
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_core.vectorstores import InMemoryVectorStore

    vector_store = InMemoryVectorStore(embeddings)
    ```
  </Accordion>

  <Accordion title="Amazon OpenSearch">
    ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU boto3
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from opensearchpy import RequestsHttpConnection

    service = "es"  # must set the service as 'es'
    region = "us-east-2"
    credentials = boto3.Session(
        aws_access_key_id="xxxxxx", aws_secret_access_key="xxxxx"
    ).get_credentials()
    awsauth = AWS4Auth("xxxxx", "xxxxxx", region, service, session_token=credentials.token)

    vector_store = OpenSearchVectorSearch.from_documents(
        docs,
        embeddings,
        opensearch_url="host url",
        http_auth=awsauth,
        timeout=300,
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection,
        index_name="test-index",
    )
    ```
  </Accordion>

  <Accordion title="Astra DB">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-astradb
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-astradb
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_astradb import AstraDBVectorStore

    vector_store = AstraDBVectorStore(
        embedding=embeddings,
        api_endpoint=ASTRA_DB_API_ENDPOINT,
        collection_name="astra_vector_langchain",
        token=ASTRA_DB_APPLICATION_TOKEN,
        namespace=ASTRA_DB_NAMESPACE,
    )
    ```
  </Accordion>

  <Accordion title="Azure Cosmos DB NoSQL">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-azure-cosmosdb azure-cosmos
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-azure-cosmosdb azure-cosmos
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_azure_cosmosdb import AzureCosmosDBNoSqlVectorSearch

    vector_search = AzureCosmosDBNoSqlVectorSearch.from_documents(
        documents=docs,
        embedding=openai_embeddings,
        cosmos_client=cosmos_client,
        database_name=database_name,
        container_name=container_name,
        vector_embedding_policy=vector_embedding_policy,
        full_text_policy=full_text_policy,
        indexing_policy=indexing_policy,
        cosmos_container_properties=cosmos_container_properties,
        cosmos_database_properties={},
        full_text_search_enabled=True,
    )
    ```
  </Accordion>

  <Accordion title="Azure Cosmos DB Mongo vCore">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-azure-ai pymongo
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add pymongo
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_azure_ai.vectorstores.azure_cosmos_db_mongo_vcore import (
        AzureCosmosDBMongoVCoreVectorSearch,
    )

    vectorstore = AzureCosmosDBMongoVCoreVectorSearch.from_documents(
        docs,
        openai_embeddings,
        collection=collection,
        index_name=INDEX_NAME,
    )
    ```
  </Accordion>

  <Accordion title="Chroma">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-chroma
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-chroma
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_chroma import Chroma

    vector_store = Chroma(
        collection_name="example_collection",
        embedding_function=embeddings,
        persist_directory="./chroma_langchain_db",  # Where to save data locally, remove if not necessary
    )
    ```
  </Accordion>

  <Accordion title="CockroachDB">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-cockroachdb
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-cockroachdb
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_cockroachdb import AsyncCockroachDBVectorStore, CockroachDBEngine

    CONNECTION_STRING = "cockroachdb://user:pass@host:26257/db?sslmode=verify-full"

    engine = CockroachDBEngine.from_connection_string(CONNECTION_STRING)
    await engine.ainit_vectorstore_table(
        table_name="vectors",
        vector_dimension=1536,
    )

    vector_store = AsyncCockroachDBVectorStore(
        engine=engine,
        embeddings=embeddings,
        collection_name="vectors",
    )
    ```
  </Accordion>

  <Accordion title="Elasticsearch">
    Install the package and start Elasticsearch locally using the [start-local](https://github.com/elastic/start-local) script:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-elasticsearch
    curl -fsSL https://elastic.co/start-local | sh
    ```

    This creates an `elastic-start-local` folder. To start Elasticsearch:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    cd elastic-start-local
    ./start.sh
    ```

    Elasticsearch will be available at `http://localhost:9200`. The password for the `elastic` user and API key are stored in the `.env` file in the `elastic-start-local` folder.

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_elasticsearch import ElasticsearchStore

    vector_store = ElasticsearchStore(
        index_name="langchain-demo",
        embedding=embeddings,
        es_url="http://localhost:9200",
    )
    ```
  </Accordion>

  <Accordion title="Google AlloyDB">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-google-alloydb-pg
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-google-alloydb-pg
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_alloydb_pg import AlloyDBEngine, AlloyDBVectorStore

    engine = AlloyDBEngine.from_instance(
        project_id="my-project",
        region="us-central1",
        cluster="my-cluster",
        instance="my-instance",
        database="my-database",
    )

    vector_store = AlloyDBVectorStore.create_sync(
        engine=engine,
        table_name="my_vectors",
        embedding_service=embeddings
    )
    ```
  </Accordion>

  <Accordion title="Milvus">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-milvus
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-milvus
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_milvus import Milvus

    URI = "./milvus_example.db"

    vector_store = Milvus(
        embedding_function=embeddings,
        connection_args={"uri": URI},
        index_params={"index_type": "FLAT", "metric_type": "L2"},
    )
    ```
  </Accordion>

  <Accordion title="MongoDB">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-mongodb
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_mongodb import MongoDBAtlasVectorSearch

    vector_store = MongoDBAtlasVectorSearch(
        embedding=embeddings,
        collection=MONGODB_COLLECTION,
        index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
        relevance_score_fn="cosine",
    )
    ```

    For more information, see the [MongoDB LangChain integration docs](https://www.mongodb.com/docs/atlas/ai-integrations/langchain/#vector-store).
  </Accordion>

  <Accordion title="PGVector">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-postgres
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-postgres
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_postgres import PGVector

    vector_store = PGVector(
        embeddings=embeddings,
        collection_name="my_docs",
        connection="postgresql+psycopg://..."
    )
    ```
  </Accordion>

  <Accordion title="PGVectorStore">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-postgres
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-postgres
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_postgres import PGEngine, PGVectorStore

    pg_engine = PGEngine.from_connection_string(
        url="postgresql+psycopg://..."
    )

    vector_store = PGVectorStore.create_sync(
        engine=pg_engine,
        table_name='test_table',
        embedding_service=embedding
    )
    ```
  </Accordion>

  <Accordion title="Pinecone">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-pinecone
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-pinecone
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_pinecone import PineconeVectorStore
    from pinecone import Pinecone

    pc = Pinecone(api_key=...)
    index = pc.Index(index_name)

    vector_store = PineconeVectorStore(embedding=embeddings, index=index)
    ```
  </Accordion>

  <Accordion title="Qdrant">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-qdrant
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-qdrant
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from qdrant_client.models import Distance, VectorParams
    from langchain_qdrant import QdrantVectorStore
    from qdrant_client import QdrantClient

    client = QdrantClient(":memory:")

    vector_size = len(embeddings.embed_query("sample text"))

    if not client.collection_exists("test"):
        client.create_collection(
            collection_name="test",
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE)
        )
    vector_store = QdrantVectorStore(
        client=client,
        collection_name="test",
        embedding=embeddings,
    )
    ```
  </Accordion>

  <Accordion title="Redis">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-redis
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-redis
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import os
    from langchain_redis import RedisConfig, RedisVectorStore

    config = RedisConfig(
        index_name="my_vectors",
        redis_url=os.getenv("REDIS_URL", "redis://localhost:6379"),
        distance_metric="COSINE"
    )

    vector_store = RedisVectorStore(embeddings=embeddings, config=config)
    ```
  </Accordion>

  <Accordion title="Oracle AI Database">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-oracledb
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-oracledb
      ```

      <Warning>
        The `langchain-community` package is no longer maintained. Examples that import from `langchain_community` may be outdated or broken. Use with caution.
      </Warning>
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import oracledb
    from langchain_oracledb.vectorstores import OracleVS
    from langchain_oracledb.vectorstores.oraclevs import create_index
    from langchain_community.vectorstores.utils import DistanceStrategy

    username = "<username>"
    password = "<password>"
    dsn = "<hostname>:<port>/<service_name>"

    connection = oracledb.connect(user=username, password=password, dsn=dsn)

    vector_store = OracleVS(
        client=connection,
        embedding_function=embedding_model,
        table_name="VECTOR_SEARCH_DEMO",
        distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE
    )
    ```
  </Accordion>

  <Accordion title="turbopuffer">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-turbopuffer
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-turbopuffer
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_turbopuffer import TurbopufferVectorStore
    from turbopuffer import Turbopuffer

    tpuf = Turbopuffer(region="gcp-us-central1")
    ns = tpuf.namespace("langchain-test")

    vector_store = TurbopufferVectorStore(embedding=embeddings, namespace=ns)
    ```
  </Accordion>

  <Accordion title="Valkey">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU "langchain-aws[valkey]"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-aws --extra valkey
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_aws.vectorstores import ValkeyVectorStore

    vector_store = ValkeyVectorStore(
        embedding=embeddings,
        valkey_url="valkey://localhost:6379",
        index_name="my_index"
    )
    ```
  </Accordion>

  <Accordion title="Weaviate">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -qU langchain-weaviate
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-weaviate
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import weaviate
    from langchain_weaviate import WeaviateVectorStore

    # Assumes a local Weaviate instance on http://localhost:8080 with gRPC on 50051.
    # See the Weaviate guide for other deployment options (Weaviate Cloud, Docker, etc.).
    weaviate_client = weaviate.connect_to_local()

    vector_store = WeaviateVectorStore(
        client=weaviate_client,
        index_name="langchain_example",
        text_key="text",
        embedding=embeddings,
    )
    ```
  </Accordion>
</AccordionGroup>

<div>
  | Vectorstore                                                                                               | Delete by ID   | Filtering      | Search by Vector | Search with score | Async          | Passes Standard Tests | Multi Tenancy  | IDs in add Documents | Downloads                                                                                                            |
  | :-------------------------------------------------------------------------------------------------------- | :------------- | :------------- | :--------------- | :---------------- | :------------- | :-------------------- | :------------- | :------------------- | :------------------------------------------------------------------------------------------------------------------- |
  | [`ValkeyVectorStore`](/oss/python/integrations/vectorstores/valkey)                                       | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>❌</span> | <span>❌</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-aws/">  <img alt="Downloads per month" /></a></span>               |
  | [`DatabricksVectorSearch`](/oss/python/integrations/vectorstores/databricks_vector_search)                | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>❌</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/databricks-langchain/">  <img alt="Downloads per month" /></a></span>        |
  | [`PineconeVectorStore`](/oss/python/integrations/vectorstores/pinecone)                                   | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>❌</span>    | <span>✅</span> | <span>❌</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-pinecone/">  <img alt="Downloads per month" /></a></span>          |
  | [`MongoDBAtlasVectorSearch`](/oss/python/integrations/vectorstores/mongodb_atlas)                         | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>✅</span>        | <span>✅</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-mongodb/">  <img alt="Downloads per month" /></a></span>           |
  | [`QdrantVectorStore`](/oss/python/integrations/vectorstores/qdrant)                                       | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>❌</span>        | <span>✅</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-qdrant/">  <img alt="Downloads per month" /></a></span>            |
  | [`AzureCosmosDBMongoVCoreVectorStore`](/oss/python/integrations/vectorstores/azure_cosmos_db_mongo_vcore) | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>❌</span> | <span>✅</span>        | <span>✅</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-azure-ai/">  <img alt="Downloads per month" /></a></span>          |
  | [`Milvus`](/oss/python/integrations/vectorstores/milvus)                                                  | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>✅</span>        | <span>✅</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-milvus/">  <img alt="Downloads per month" /></a></span>            |
  | [`ElasticsearchStore`](/oss/python/integrations/vectorstores/elasticsearch)                               | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>❌</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-elasticsearch/">  <img alt="Downloads per month" /></a></span>     |
  | [`Weaviate`](/oss/python/integrations/vectorstores/weaviate)                                              | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>❌</span>        | <span>✅</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-weaviate/">  <img alt="Downloads per month" /></a></span>          |
  | [`AstraDBVectorStore`](/oss/python/integrations/vectorstores/astradb)                                     | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>✅</span>        | <span>✅</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-astradb/">  <img alt="Downloads per month" /></a></span>           |
  | [`Oracle AI Database`](/oss/python/integrations/vectorstores/oracle)                                      | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>✅</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-oracledb/">  <img alt="Downloads per month" /></a></span>          |
  | [`RedisVectorStore`](/oss/python/integrations/vectorstores/redis)                                         | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>❌</span> | <span>❌</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-redis/">  <img alt="Downloads per month" /></a></span>             |
  | [`AzureCosmosDBNoSqlVectorStore`](/oss/python/integrations/vectorstores/azure_cosmos_db_no_sql)           | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>❌</span> | <span>✅</span>        | <span>✅</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-azure-cosmosdb/">  <img alt="Downloads per month" /></a></span>    |
  | [`Google AlloyDB`](/oss/python/integrations/vectorstores/google_alloydb)                                  | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>❌</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-google-alloydb-pg/">  <img alt="Downloads per month" /></a></span> |
  | [`InMemoryVectorStore`](/oss/python/integrations/vectorstores/in_memory)                                  | <span>✅</span> | <span>✅</span> | <span>❌</span>   | <span>✅</span>    | <span>✅</span> | <span>❌</span>        | <span>❌</span> | <span>✅</span>       | <span>N/A</span>                                                                                                     |
</div>

## All vector stores

<div>
  | Vectorstore                                                                                                                                 | Delete by ID   | Filtering      | Search by Vector | Search with score | Async          | Passes Standard Tests | Multi Tenancy  | IDs in add Documents | Downloads                                                                                                                   |
  | :------------------------------------------------------------------------------------------------------------------------------------------ | :------------- | :------------- | :--------------- | :---------------- | :------------- | :-------------------- | :------------- | :------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
  | [`Google bigquery vector search`](/oss/python/integrations/vectorstores/google_bigquery_vector_search)                                      | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-google-vertexai/">  <img alt="Downloads per month" /></a></span>          |
  | [`Google Vertex AI feature`](/oss/python/integrations/vectorstores/google_vertex_ai_feature_store)                                          | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-google-vertexai/">  <img alt="Downloads per month" /></a></span>          |
  | [`Google Vertex AI vector search`](/oss/python/integrations/vectorstores/google_vertex_ai_vector_search)                                    | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-google-vertexai/">  <img alt="Downloads per month" /></a></span>          |
  | [`Amazon memorydb`](/oss/python/integrations/vectorstores/memorydb)                                                                         | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-aws/">  <img alt="Downloads per month" /></a></span>                      |
  | [`ValkeyVectorStore`](/oss/python/integrations/vectorstores/valkey)                                                                         | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>❌</span> | <span>❌</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-aws/">  <img alt="Downloads per month" /></a></span>                      |
  | [`DatabricksVectorSearch`](/oss/python/integrations/vectorstores/databricks_vector_search)                                                  | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>❌</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/databricks-langchain/">  <img alt="Downloads per month" /></a></span>               |
  | [`Chroma`](/oss/python/integrations/vectorstores/chroma)                                                                                    | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-chroma/">  <img alt="Downloads per month" /></a></span>                   |
  | [`PGVector`](/oss/python/integrations/vectorstores/pgvector)                                                                                | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-postgres/">  <img alt="Downloads per month" /></a></span>                 |
  | [`PGVectorStore`](/oss/python/integrations/vectorstores/pgvectorstore)                                                                      | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-postgres/">  <img alt="Downloads per month" /></a></span>                 |
  | [`Pinecone (Sparse)`](/oss/python/integrations/vectorstores/pinecone_sparse)                                                                | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-pinecone/">  <img alt="Downloads per month" /></a></span>                 |
  | [`PineconeVectorStore`](/oss/python/integrations/vectorstores/pinecone)                                                                     | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>❌</span>    | <span>✅</span> | <span>❌</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-pinecone/">  <img alt="Downloads per month" /></a></span>                 |
  | [`MongoDBAtlasVectorSearch`](/oss/python/integrations/vectorstores/mongodb_atlas)                                                           | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>✅</span>        | <span>✅</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-mongodb/">  <img alt="Downloads per month" /></a></span>                  |
  | [`QdrantVectorStore`](/oss/python/integrations/vectorstores/qdrant)                                                                         | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>❌</span>        | <span>✅</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-qdrant/">  <img alt="Downloads per month" /></a></span>                   |
  | [`AzureCosmosDBMongoVCoreVectorStore`](/oss/python/integrations/vectorstores/azure_cosmos_db_mongo_vcore)                                   | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>❌</span> | <span>✅</span>        | <span>✅</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-azure-ai/">  <img alt="Downloads per month" /></a></span>                 |
  | [`Milvus`](/oss/python/integrations/vectorstores/milvus)                                                                                    | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>✅</span>        | <span>✅</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-milvus/">  <img alt="Downloads per month" /></a></span>                   |
  | [`ElasticsearchStore`](/oss/python/integrations/vectorstores/elasticsearch)                                                                 | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>❌</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-elasticsearch/">  <img alt="Downloads per month" /></a></span>            |
  | [`Weaviate`](/oss/python/integrations/vectorstores/weaviate)                                                                                | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>❌</span>        | <span>✅</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-weaviate/">  <img alt="Downloads per month" /></a></span>                 |
  | [`Neo4j vector index`](/oss/python/integrations/vectorstores/neo4jvector)                                                                   | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-neo4j/">  <img alt="Downloads per month" /></a></span>                    |
  | [`AstraDBVectorStore`](/oss/python/integrations/vectorstores/astradb)                                                                       | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>✅</span>        | <span>✅</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-astradb/">  <img alt="Downloads per month" /></a></span>                  |
  | [`Oracle AI Database`](/oss/python/integrations/vectorstores/oracle)                                                                        | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>✅</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-oracledb/">  <img alt="Downloads per month" /></a></span>                 |
  | [`RedisVectorStore`](/oss/python/integrations/vectorstores/redis)                                                                           | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>❌</span> | <span>❌</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-redis/">  <img alt="Downloads per month" /></a></span>                    |
  | [`AzureCosmosDBNoSqlVectorStore`](/oss/python/integrations/vectorstores/azure_cosmos_db_no_sql)                                             | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>❌</span> | <span>✅</span>        | <span>✅</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-azure-cosmosdb/">  <img alt="Downloads per month" /></a></span>           |
  | [`Google AlloyDB`](/oss/python/integrations/vectorstores/google_alloydb)                                                                    | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>❌</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-google-alloydb-pg/">  <img alt="Downloads per month" /></a></span>        |
  | [`Sap hana cloud vector engine`](/oss/python/integrations/vectorstores/sap_hanavector)                                                      | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-hana/">  <img alt="Downloads per month" /></a></span>                     |
  | [`Google firestore`](/oss/python/integrations/vectorstores/google_firestore)                                                                | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-google-firestore/">  <img alt="Downloads per month" /></a></span>         |
  | [`Google spanner`](/oss/python/integrations/vectorstores/google_spanner)                                                                    | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-google-spanner/">  <img alt="Downloads per month" /></a></span>           |
  | [`Google cloud SQL for postgresql`](/oss/python/integrations/vectorstores/google_cloud_sql_pg)                                              | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-google-cloud-sql-pg/">  <img alt="Downloads per month" /></a></span>      |
  | [`OceanbaseVectorStore`](https://pypi.org/project/langchain-oceanbase/)                                                                     | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-oceanbase/">  <img alt="Downloads per month" /></a></span>                |
  | [`AsyncCockroachDBVectorStore`](https://github.com/cockroachdb/langchain-cockroachdb/)                                                      | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-cockroachdb/">  <img alt="Downloads per month" /></a></span>              |
  | [`IBM db2 vector store and vector search`](https://github.com/langchain-ai/langchain-ibm/tree/main/libs/langchain-db2)                      | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-db2/">  <img alt="Downloads per month" /></a></span>                      |
  | [`InfinoVectorStore`](https://infino.ai/docs)                                                                                               | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>❌</span> | <span>✅</span>        | <span>✅</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-infino/">  <img alt="Downloads per month" /></a></span>                   |
  | [`TeradataVectorStore`](https://github.com/Teradata/langchain-teradata)                                                                     | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-teradata/">  <img alt="Downloads per month" /></a></span>                 |
  | [`CosVectors`](https://github.com/hushengquan/langchain-cos-vectors)                                                                        | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-cos-vectors/">  <img alt="Downloads per month" /></a></span>              |
  | [`CouchbaseSearchVectorStore`](https://docs.couchbase.com/server/current/vector-search/vector-search.html)                                  | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-couchbase/">  <img alt="Downloads per month" /></a></span>                |
  | [`PolarDBXVectorStore`](https://github.com/polardb/langchain-polardbx)                                                                      | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-polardbx/">  <img alt="Downloads per month" /></a></span>                 |
  | [`SingleStoreVectorStore`](https://docs.singlestore.com/cloud/developer-resources/functional-extensions/working-with-vector-data/)          | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-singlestore/">  <img alt="Downloads per month" /></a></span>              |
  | [`YDB`](https://ydb.tech/)                                                                                                                  | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-ydb/">  <img alt="Downloads per month" /></a></span>                      |
  | [`SurrealDBVectorStore`](https://surrealdb.com/docs/build/deployment/surrealdb-cloud/getting-started)                                       | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-surrealdb/">  <img alt="Downloads per month" /></a></span>                |
  | [`Intel's visual data management system (VDMS)`](https://github.com/IntelLabs/vdms)                                                         | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-vdms/">  <img alt="Downloads per month" /></a></span>                     |
  | [`Google memorystore for Redis`](/oss/python/integrations/vectorstores/google_memorystore_redis)                                            | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-google-memorystore-redis/">  <img alt="Downloads per month" /></a></span> |
  | [`SQLServer`](https://learn.microsoft.com/en-us/azure/azure-sql/database/ai-artificial-intelligence-intelligent-applications?view=azuresql) | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-sqlserver/">  <img alt="Downloads per month" /></a></span>                |
  | [`Mariadb`](https://mariadb.com/docs/connectors/other/langchain-mariadb/api-reference)                                                      | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-mariadb/">  <img alt="Downloads per month" /></a></span>                  |
  | [`MixpeekVectorStore`](https://mixpeek.com/docs/agent-integrations/langchain)                                                               | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>❌</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-mixpeek/">  <img alt="Downloads per month" /></a></span>                  |
  | [`BigtableVectorStore`](https://cloud.google.com/bigtable)                                                                                  | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-google-bigtable/">  <img alt="Downloads per month" /></a></span>          |
  | [`Azure database for postgresql - flexible server`](/oss/python/integrations/vectorstores/azure_db_for_postgresql)                          | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-azure-postgresql/">  <img alt="Downloads per month" /></a></span>         |
  | [`openGauss`](https://github.com/mpb159753/langchain-opengauss)                                                                             | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-opengauss/">  <img alt="Downloads per month" /></a></span>                |
  | [`VastDBVectorStore`](https://github.com/vast-data/vast-vector-store)                                                                       | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>❌</span> | <span>✅</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-vastdb/">  <img alt="Downloads per month" /></a></span>                   |
  | [`ZeusDB`](https://docs.zeusdb.com/en/latest/)                                                                                              | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-zeusdb/">  <img alt="Downloads per month" /></a></span>                   |
  | [`turbopuffer`](/oss/python/integrations/vectorstores/turbopuffer)                                                                          | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-turbopuffer/">  <img alt="Downloads per month" /></a></span>              |
  | [`Google cloud SQL for mysql`](/oss/python/integrations/vectorstores/google_cloud_sql_mysql)                                                | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-google-cloud-sql-mysql/">  <img alt="Downloads per month" /></a></span>   |
  | [`LambdaDB`](https://docs.lambdadb.ai/guides/get-started/quickstart)                                                                        | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-lambdadb/">  <img alt="Downloads per month" /></a></span>                 |
  | [`PixeltableVectorStore`](https://docs.pixeltable.com/overview/pixeltable)                                                                  | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-pixeltable/">  <img alt="Downloads per month" /></a></span>               |
  | [`Kinetica vectorstore`](https://github.com/kineticadb/langchain-kinetica)                                                                  | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-kinetica/">  <img alt="Downloads per month" /></a></span>                 |
  | [`Moorcheh`](https://www.moorcheh.ai/)                                                                                                      | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-moorcheh/">  <img alt="Downloads per month" /></a></span>                 |
  | [`FalkorDBVector`](https://docs.falkordb.com/genai-tools/langchain.html)                                                                    | <span />       | <span>✅</span> | <span>✅</span>   | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-falkordb/">  <img alt="Downloads per month" /></a></span>                 |
  | [`Activeloop Deep lake`](https://docs.deeplake.ai/)                                                                                         | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-deeplake/">  <img alt="Downloads per month" /></a></span>                 |
  | [`Gel`](https://github.com/geldata/langchain-gel)                                                                                           | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-gel/">  <img alt="Downloads per month" /></a></span>                      |
  | [`Vectara`](https://docs.vectara.com/)                                                                                                      | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-vectara/">  <img alt="Downloads per month" /></a></span>                  |
  | [`ChDBVectorStore`](https://github.com/chdb-io/langchain-chdb)                                                                              | <span>✅</span> | <span>✅</span> | <span>✅</span>   | <span>✅</span>    | <span>✅</span> | <span>✅</span>        | <span>❌</span> | <span>✅</span>       | <span><a href="https://pypi.org/project/langchain-chdb/">  <img alt="Downloads per month" /></a></span>                     |
  | [`Vedb for mysql`](https://docs.volcengine.com/docs/6357?lang=en)                                                                           | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-volcengine-mysql/">  <img alt="Downloads per month" /></a></span>         |
  | [`Volcengine rds for mysql`](https://docs.volcengine.com/docs/6313?lang=en)                                                                 | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-volcengine-mysql/">  <img alt="Downloads per month" /></a></span>         |
  | [`Alibaba cloud mysql`](https://github.com/wangkuahai/langchain-alibabacloud-mysql)                                                         | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-alibabacloud-mysql/">  <img alt="Downloads per month" /></a></span>       |
  | [`LindormVectorStore`](https://help.aliyun.com/en/lindorm/user-guide/enable-vector-engine)                                                  | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-lindorm-integration/">  <img alt="Downloads per month" /></a></span>      |
  | [`ActianVectorAIVectorStore`](https://docs.vectoraidb.actian.com)                                                                           | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-actian-vectorai/">  <img alt="Downloads per month" /></a></span>          |
  | [`DeweyVectorStore`](https://github.com/meetdewey/langchain-dewey)                                                                          | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span><a href="https://pypi.org/project/langchain-dewey/">  <img alt="Downloads per month" /></a></span>                    |
  | [`FAISS`](https://github.com/facebookresearch/faiss)                                                                                        | <span />       | <span />       | <span />         | <span />          | <span />       | <span />              | <span />       | <span />             | <span>N/A</span>                                                                                                            |
  | [`InMemoryVectorStore`](/oss/python/integrations/vectorstores/in_memory)                                                                    | <span>✅</span> | <span>✅</span> | <span>❌</span>   | <span>✅</span>    | <span>✅</span> | <span>❌</span>        | <span>❌</span> | <span>✅</span>       | <span>N/A</span>                                                                                                            |
</div>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/vectorstores/index.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>