<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Vector store integrations | https://docs.langchain.com/oss/python/integrations/vectorstores/index -->

# 矢量存储集成

使用 LangChain Python 与向量存储集成。

## 概述

向量存储[embedded](/oss/python/integrations/embeddings)数据并执行相似性搜索。

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

集成组件
箭头显示了典型的检索流程。突出显示的组件是本页所涵盖的组件。

### 典型检索流程

### 代理能力

### 执行和状态

### 接口

LangChain 为矢量商店提供统一的界面，允许您：

* `add_documents` - 将文档添加到商店。
* `delete` - 按 ID 删除存储的文档。
* `similarity_search` - 查询语义相似的文档。

这种抽象允许您在不同的实现之间切换，而无需更改应用程序逻辑。

### 初始化

要初始化向量存储，请为其提供嵌入模型：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_core.vectorstores import InMemoryVectorStore
vector_store = InMemoryVectorStore(embedding=SomeEmbeddingModel())
```

### 添加文档

添加 [⟦T105⟧](https://reference.langchain.com/python/langchain-core/documents/base/Document) 对象（包含 `page_content` 和可选元数据），如下所示：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
vector_store.add_documents(documents=[doc1, doc2], ids=["id1", "id2"])
```

### 删除文档

通过指定ID删除：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
vector_store.delete(ids=["id1"])
```

### 相似性搜索

使用 `similarity_search` 发出语义查询，它返回最接近的嵌入文档：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
similar_docs = vector_store.similarity_search("your query here")
```

许多矢量存储支持以下参数：

* `k` — 返回的结果数
* `filter` — 基于元数据的条件过滤### 相似度指标和索引

嵌入相似度可以使用以下方法计算：

* **余弦相似度**
* **欧几里得距离**
* **点积**

高效搜索通常采用 HNSW（分层可导航小世界）等索引方法，但具体情况取决于向量存储。

### 元数据过滤

按元数据（例如来源、日期）过滤可以细化搜索结果：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
vector_store.similarity_search(
  "query",
  k=3,
  filter={"source": "tweets"}
)
```

> [!注意]
>
> 对基于元数据的过滤的支持因实现而异。
> 检查您选择的矢量存储的文档以了解详细信息。

## 顶级集成

**选择嵌入模型：**

> [手风琴] OpenAI
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-openai
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-openai
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import getpass
> import os
>
> if not os.environ.get("OPENAI_API_KEY"):
>   os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter API key for OpenAI: ")
>
> from langchain_openai import OpenAIEmbeddings
>
> embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
> ```

> [手风琴] 天蓝色
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-azure-ai
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import getpass
> import os
>
> if not os.environ.get("AZURE_OPENAI_API_KEY"):
>   os.environ["AZURE_OPENAI_API_KEY"] = getpass.getpass("Enter API key for Azure: ")
>
> from langchain_openai import AzureOpenAIEmbeddings
>
> embeddings = AzureOpenAIEmbeddings(
>     azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
>     azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"],
>     openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
> )
> ```

> [手风琴] 谷歌双子座
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-google-genai
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import getpass
> import os
>
> if not os.environ.get("GOOGLE_API_KEY"):
>   os.environ["GOOGLE_API_KEY"] = getpass.getpass("Enter API key for Google Gemini: ")
>
> from langchain_google_genai import GoogleGenerativeAIEmbeddings
>
> embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
> ```

> [手风琴] Gemini 企业代理平台
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-google-vertexai
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai import VertexAIEmbeddings
>
> embeddings = VertexAIEmbeddings(model="text-embedding-005")
> ```

> [手风琴] AWS
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-aws
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_aws import BedrockEmbeddings
>
> embeddings = BedrockEmbeddings(model_id="amazon.titan-embed-text-v2:0")
> ```

> [手风琴] HuggingFace
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-huggingface
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_huggingface import HuggingFaceEmbeddings
>
> embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
> ```

> [手风琴] Ollama
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-ollama
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_ollama import OllamaEmbeddings
>
> embeddings = OllamaEmbeddings(model="nomic-embed-text")
> ```

> [手风琴] Cohere
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-cohere
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import getpass
> import os
>
> if not os.environ.get("COHERE_API_KEY"):
>   os.environ["COHERE_API_KEY"] = getpass.getpass("Enter API key for Cohere: ")
>
> from langchain_cohere import CohereEmbeddings
>
> embeddings = CohereEmbeddings(model="embed-english-v3.0")
> ```

> [手风琴] Mistral AI
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-mistralai
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import getpass
> import os
>
> if not os.environ.get("MISTRALAI_API_KEY"):
>   os.environ["MISTRALAI_API_KEY"] = getpass.getpass("Enter API key for MistralAI: ")
>
> from langchain_mistralai import MistralAIEmbeddings
>
> embeddings = MistralAIEmbeddings(model="mistral-embed")
> ```

> [手风琴] Nomic
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-nomic
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import getpass
> import os
>
> if not os.environ.get("NOMIC_API_KEY"):
>   os.environ["NOMIC_API_KEY"] = getpass.getpass("Enter API key for Nomic: ")
>
> from langchain_nomic import NomicEmbeddings
>
> embeddings = NomicEmbeddings(model="nomic-embed-text-v1.5")
> ```

> [手风琴] NVIDIA
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-nvidia-ai-endpoints
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import getpass
> import os
>
> if not os.environ.get("NVIDIA_API_KEY"):
>   os.environ["NVIDIA_API_KEY"] = getpass.getpass("Enter API key for NVIDIA: ")
>
> from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
>
> embeddings = NVIDIAEmbeddings(model="NV-Embed-QA")
> ```

> [手风琴] Voyage AI
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-voyageai
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import getpass
> import os
>
> if not os.environ.get("VOYAGE_API_KEY"):
>   os.environ["VOYAGE_API_KEY"] = getpass.getpass("Enter API key for Voyage AI: ")
>
> from langchain_voyageai import VoyageAIEmbeddings
>
> embeddings = VoyageAIEmbeddings(model="voyage-3")
> ```
>
> 欲了解更多信息，请参阅[Voyage AI documentation](https://www.mongodb.com/docs/voyageai/models/text-embeddings/)。> [手风琴] IBM watsonx
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-ibm
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import getpass
> import os
>
> if not os.environ.get("WATSONX_APIKEY"):
>   os.environ["WATSONX_APIKEY"] = getpass.getpass("Enter API key for IBM watsonx: ")
>
> from langchain_ibm import WatsonxEmbeddings
>
> embeddings = WatsonxEmbeddings(
>     model_id="ibm/slate-125m-english-rtrvr",
>     url="https://us-south.ml.cloud.ibm.com",
>     project_id="<WATSONX PROJECT_ID>",
> )
> ```

> [手风琴] 假的
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-core
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_core.embeddings import DeterministicFakeEmbedding
>
> embeddings = DeterministicFakeEmbedding(size=4096)
> ```

> [手风琴] xAI
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-xai
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import getpass
> import os
>
> if not os.environ.get("XAI_API_KEY"):
>   os.environ["XAI_API_KEY"] = getpass.getpass("Enter API key for xAI: ")
>
> from langchain.chat_models import init_chat_model
>
> model = init_chat_model("grok-2", model_provider="xai")
> ```

> [手风琴] 困惑
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-perplexity
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import getpass
> import os
>
> if not os.environ.get("PPLX_API_KEY"):
>   os.environ["PPLX_API_KEY"] = getpass.getpass("Enter API key for Perplexity: ")
>
> from langchain.chat_models import init_chat_model
>
> model = init_chat_model("llama-3.1-sonar-small-128k-online", model_provider="perplexity")
> ```

> [手风琴] DeepSeek
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-deepseek
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import getpass
> import os
>
> if not os.environ.get("DEEPSEEK_API_KEY"):
>   os.environ["DEEPSEEK_API_KEY"] = getpass.getpass("Enter API key for DeepSeek: ")
>
> from langchain.chat_models import init_chat_model
>
> model = init_chat_model("deepseek-chat", model_provider="deepseek")
> ```

**选择矢量存储：**

> [手风琴] 内存中
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-core
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-core
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_core.vectorstores import InMemoryVectorStore
>
> vector_store = InMemoryVectorStore(embeddings)
> ```

> [手风琴] Amazon OpenSearch
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU boto3
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from opensearchpy import RequestsHttpConnection
>
> service = "es"  # must set the service as 'es'
> region = "us-east-2"
> credentials = boto3.Session(
>     aws_access_key_id="xxxxxx", aws_secret_access_key="xxxxx"
> ).get_credentials()
> awsauth = AWS4Auth("xxxxx", "xxxxxx", region, service, session_token=credentials.token)
>
> vector_store = OpenSearchVectorSearch.from_documents(
>     docs,
>     embeddings,
>     opensearch_url="host url",
>     http_auth=awsauth,
>     timeout=300,
>     use_ssl=True,
>     verify_certs=True,
>     connection_class=RequestsHttpConnection,
>     index_name="test-index",
> )
> ```

> [手风琴] Amazon S3 矢量图
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-aws
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-aws
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_aws.vectorstores import AmazonS3Vectors
>
> vector_store = AmazonS3Vectors(
>     vector_bucket_name="my-vector-bucket",
>     index_name="my-index",
>     embedding=embeddings,
> )
> ```
>
> S3向量桶必须已经存在。详情请参阅[Amazon S3 Vectors guide](/oss/python/integrations/vectorstores/s3_vectors)。

> [手风琴] Astra DB
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-astradb
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-astradb
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_astradb import AstraDBVectorStore
>
> vector_store = AstraDBVectorStore(
>     embedding=embeddings,
>     api_endpoint=ASTRA_DB_API_ENDPOINT,
>     collection_name="astra_vector_langchain",
>     token=ASTRA_DB_APPLICATION_TOKEN,
>     namespace=ASTRA_DB_NAMESPACE,
> )
> ```

> [手风琴] Azure Cosmos DB NoSQL
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-azure-cosmosdb azure-cosmos
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-azure-cosmosdb azure-cosmos
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_azure_cosmosdb import AzureCosmosDBNoSqlVectorSearch
>
> vector_search = AzureCosmosDBNoSqlVectorSearch.from_documents(
>     documents=docs,
>     embedding=openai_embeddings,
>     cosmos_client=cosmos_client,
>     database_name=database_name,
>     container_name=container_name,
>     vector_embedding_policy=vector_embedding_policy,
>     full_text_policy=full_text_policy,
>     indexing_policy=indexing_policy,
>     cosmos_container_properties=cosmos_container_properties,
>     cosmos_database_properties={},
>     full_text_search_enabled=True,
> )
> ```

> [手风琴] Azure Cosmos DB Mongo vCore
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-azure-cosmosdb pymongo
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-azure-cosmosdb pymongo
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_azure_cosmosdb import AzureCosmosDBMongoVCoreVectorSearch
>
> vectorstore = AzureCosmosDBMongoVCoreVectorSearch.from_documents(
>     docs,
>     openai_embeddings,
>     collection=collection,
>     index_name=INDEX_NAME,
> )
> ```

> [手风琴] Chroma
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-chroma
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-chroma
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_chroma import Chroma
>
> vector_store = Chroma(
>     collection_name="example_collection",
>     embedding_function=embeddings,
>     persist_directory="./chroma_langchain_db",  # Where to save data locally, remove if not necessary
> )
> ```

> [手风琴] CockroachDB
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-cockroachdb
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-cockroachdb
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_cockroachdb import AsyncCockroachDBVectorStore, CockroachDBEngine
>
> CONNECTION_STRING = "cockroachdb://user:pass@host:26257/db?sslmode=verify-full"
>
> engine = CockroachDBEngine.from_connection_string(CONNECTION_STRING)
> await engine.ainit_vectorstore_table(
>     table_name="vectors",
>     vector_dimension=1536,
> )
>
> vector_store = AsyncCockroachDBVectorStore(
>     engine=engine,
>     embeddings=embeddings,
>     collection_name="vectors",
> )
> ```

> [手风琴] Elasticsearch
>
> 安装软件包并使用 [start-local](https://github.com/elastic/start-local) 脚本在本地启动 Elasticsearch：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-elasticsearch
> curl -fsSL https://elastic.co/start-local | sh
> ```
>
> 这将创建一个 `elastic-start-local` 文件夹。启动 Elasticsearch：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> cd elastic-start-local
> ./start.sh
> ```
>
> Elasticsearch 将于 `http://localhost:9200` 提供。 `elastic` 用户的密码和 API 密钥存储在 `elastic-start-local` 文件夹中的 `.env` 文件中。
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_elasticsearch import ElasticsearchStore
>
> vector_store = ElasticsearchStore(
>     index_name="langchain-demo",
>     embedding=embeddings,
>     es_url="http://localhost:9200",
> )
> ```

> [手风琴] Google AlloyDB
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-google-alloydb-pg
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-google-alloydb-pg
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_alloydb_pg import AlloyDBEngine, AlloyDBVectorStore
>
> engine = AlloyDBEngine.from_instance(
>     project_id="my-project",
>     region="us-central1",
>     cluster="my-cluster",
>     instance="my-instance",
>     database="my-database",
> )
>
> vector_store = AlloyDBVectorStore.create_sync(
>     engine=engine,
>     table_name="my_vectors",
>     embedding_service=embeddings
> )
> ```> [手风琴] Milvus
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-milvus
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-milvus
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_milvus import Milvus
>
> URI = "./milvus_example.db"
>
> vector_store = Milvus(
>     embedding_function=embeddings,
>     connection_args={"uri": URI},
>     index_params={"index_type": "FLAT", "metric_type": "L2"},
> )
> ```

> [手风琴] MongoDB
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-mongodb
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_mongodb import MongoDBAtlasVectorSearch
>
> vector_store = MongoDBAtlasVectorSearch(
>     embedding=embeddings,
>     collection=MONGODB_COLLECTION,
>     index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
>     relevance_score_fn="cosine",
> )
> ```
>
> 欲了解更多信息，请参阅[MongoDB LangChain integration docs](https://www.mongodb.com/docs/atlas/ai-integrations/langchain/#vector-store)。

> [手风琴] PGVector
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-postgres
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-postgres
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_postgres import PGVector
>
> vector_store = PGVector(
>     embeddings=embeddings,
>     collection_name="my_docs",
>     connection="postgresql+psycopg://..."
> )
> ```

> [手风琴] PGVectorStore
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-postgres
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-postgres
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_postgres import PGEngine, PGVectorStore
>
> pg_engine = PGEngine.from_connection_string(
>     url="postgresql+psycopg://..."
> )
>
> vector_store = PGVectorStore.create_sync(
>     engine=pg_engine,
>     table_name='test_table',
>     embedding_service=embedding
> )
> ```

> [手风琴] 松果
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-pinecone
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-pinecone
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_pinecone import PineconeVectorStore
> from pinecone import Pinecone
>
> pc = Pinecone(api_key=...)
> index = pc.Index(index_name)
>
> vector_store = PineconeVectorStore(embedding=embeddings, index=index)
> ```

> [手风琴] Qdrant
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-qdrant
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-qdrant
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from qdrant_client.models import Distance, VectorParams
> from langchain_qdrant import QdrantVectorStore
> from qdrant_client import QdrantClient
>
> client = QdrantClient(":memory:")
>
> vector_size = len(embeddings.embed_query("sample text"))
>
> if not client.collection_exists("test"):
>     client.create_collection(
>         collection_name="test",
>         vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE)
>     )
> vector_store = QdrantVectorStore(
>     client=client,
>     collection_name="test",
>     embedding=embeddings,
> )
> ```

> [手风琴] Redis
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-redis
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-redis
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import os
> from langchain_redis import RedisConfig, RedisVectorStore
>
> config = RedisConfig(
>     index_name="my_vectors",
>     redis_url=os.getenv("REDIS_URL", "redis://localhost:6379"),
>     distance_metric="COSINE"
> )
>
> vector_store = RedisVectorStore(embeddings=embeddings, config=config)
> ```

> [手风琴] Oracle AI 数据库
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-oracledb
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-oracledb
> ```
>
>> [!警告]
>>
>> `langchain-community` 包不再维护。从 `langchain_community` 导入的示例可能已过时或已损坏。谨慎使用。
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import oracledb
> from langchain_oracledb.vectorstores import OracleVS
> from langchain_oracledb.vectorstores.oraclevs import create_index
> from langchain_community.vectorstores.utils import DistanceStrategy
>
> username = "<username>"
> password = "<password>"
> dsn = "<hostname>:<port>/<service_name>"
>
> connection = oracledb.connect(user=username, password=password, dsn=dsn)
>
> vector_store = OracleVS(
>     client=connection,
>     embedding_function=embedding_model,
>     table_name="VECTOR_SEARCH_DEMO",
>     distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE
> )
> ```

> [手风琴] 涡轮增压器
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-turbopuffer
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-turbopuffer
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_turbopuffer import TurbopufferVectorStore
> from turbopuffer import Turbopuffer
>
> tpuf = Turbopuffer(region="gcp-us-central1")
> ns = tpuf.namespace("langchain-test")
>
> vector_store = TurbopufferVectorStore(embedding=embeddings, namespace=ns)
> ```

> [手风琴] Valkey
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU "langchain-aws[valkey]"
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-aws --extra valkey
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_aws.vectorstores import ValkeyVectorStore
>
> vector_store = ValkeyVectorStore(
>     embedding=embeddings,
>     valkey_url="valkey://localhost:6379",
>     index_name="my_index"
> )
> ```

> [手风琴] Weaviate
>
> ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -qU langchain-weaviate
> ```
>
> ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add langchain-weaviate
> ```
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import weaviate
> from langchain_weaviate import WeaviateVectorStore
>
> # Assumes a local Weaviate instance on http://localhost:8080 with gRPC on 50051.
> # See the Weaviate guide for other deployment options (Weaviate Cloud, Docker, etc.).
> weaviate_client = weaviate.connect_to_local()
>
> vector_store = WeaviateVectorStore(
>     client=weaviate_client,
>     index_name="langchain_example",
>     text_key="text",
>     embedding=embeddings,
> )
> ```|矢量商店 |按 ID 删除 |过滤 |按矢量搜索 |用分数搜索 |异步|通过标准测试 |多租户 |添加文档中的 ID |下载 |
| :-| :-| :-| :-| :-| :-| :-| :-| :-| :-|
| [⟦T117⟧](/oss/python/integrations/vectorstores/valkey) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | [  ⟦T216⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T118⟧](/oss/python/integrations/vectorstores/mongodb_atlas) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | [  ⟦T217⟧](https://pypi.org/project/langchain-mongodb/) |
| [⟦T119⟧](/oss/python/integrations/vectorstores/qdrant) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | [  ⟦T218⟧](https://pypi.org/project/langchain-qdrant/) |
| [⟦T120⟧](/oss/python/integrations/vectorstores/azure_cosmos_db_mongo_vcore) | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | [  ⟦T219⟧](https://pypi.org/project/langchain-azure-ai/) |
| [⟦T121⟧](/oss/python/integrations/vectorstores/databricks_vector_search) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | [  ⟦T220⟧](https://pypi.org/project/databricks-langchain/) |
| [⟦T122⟧](/oss/python/integrations/vectorstores/pinecone) | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | [  ⟦T221⟧](https://pypi.org/project/langchain-pinecone/) |
| [⟦T123⟧](/oss/python/integrations/vectorstores/milvus) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | [  ⟦T222⟧](https://pypi.org/project/langchain-milvus/) |
| [⟦T124⟧](/oss/python/integrations/vectorstores/weaviate) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | [  ⟦T223⟧](https://pypi.org/project/langchain-weaviate/) |
| [⟦T125⟧](/oss/python/integrations/vectorstores/oracle) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | [  ⟦T224⟧](https://pypi.org/project/langchain-oracledb/) |
| [⟦T126⟧](/oss/python/integrations/vectorstores/astradb) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | [  ⟦T225⟧](https://pypi.org/project/langchain-astradb/) |
| [⟦T127⟧](/oss/python/integrations/vectorstores/elasticsearch) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | [  ⟦T226⟧](https://pypi.org/project/langchain-elasticsearch/) |
| [⟦T128⟧](/oss/python/integrations/vectorstores/redis) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | [  ⟦T227⟧](https://pypi.org/project/langchain-redis/) |
| [⟦T129⟧](/oss/python/integrations/vectorstores/google_alloydb) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | [  ⟦T228⟧](https://pypi.org/project/langchain-google-alloydb-pg/) |
| [⟦T130⟧](/oss/python/integrations/vectorstores/azure_cosmos_db_no_sql) | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | [  ⟦T229⟧](https://pypi.org/project/langchain-azure-cosmosdb/) |
| [⟦T131⟧](/oss/python/integrations/vectorstores/in_memory) | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |不适用 |

## 所有向量存储|矢量商店 |按 ID 删除 |过滤 |按矢量搜索 |用分数搜索 |异步|通过标准测试 |多租户 |添加文档中的 ID |下载 |
| :-| :-| :-| :-| :-| :-| :-| :-| :-| :-|
| [⟦T132⟧](/oss/python/integrations/vectorstores/google_vertex_ai_feature_store) | | | | | | | | | [  ⟦T230⟧](https://pypi.org/project/langchain-google-vertexai/) |
| [⟦T133⟧](/oss/python/integrations/vectorstores/google_bigquery_vector_search) | | | | | | | | | [  ⟦T231⟧](https://pypi.org/project/langchain-google-vertexai/) |
| [⟦T134⟧](/oss/python/integrations/vectorstores/google_vertex_ai_vector_search) | | | | | | | | | [  ⟦T232⟧](https://pypi.org/project/langchain-google-vertexai/) |
| [⟦T135⟧](/oss/python/integrations/vectorstores/memorydb) | | | | | | | | | [  ⟦T233⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T136⟧](/oss/python/integrations/vectorstores/valkey) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | [  ⟦T234⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T137⟧](/oss/python/integrations/vectorstores/pgvector) | | | | | | | | | [  ⟦T235⟧](https://pypi.org/project/langchain-postgres/) |
| [⟦T138⟧](/oss/python/integrations/vectorstores/pgvectorstore) | ✅ | ✅ | ✅ | ✅ | ✅ | | | ✅ | [  ⟦T236⟧](https://pypi.org/project/langchain-postgres/) |
| [⟦T139⟧](/oss/python/integrations/vectorstores/mongodb_atlas) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | [  ⟦T237⟧](https://pypi.org/project/langchain-mongodb/) |
| [⟦T140⟧](/oss/python/integrations/vectorstores/chroma) | | | | | | | | | [  ⟦T238⟧](https://pypi.org/project/langchain-chroma/) |
| [⟦T141⟧](/oss/python/integrations/vectorstores/qdrant) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | [  ⟦T239⟧](https://pypi.org/project/langchain-qdrant/) |
| [⟦T142⟧](/oss/python/integrations/vectorstores/azure_cosmos_db_mongo_vcore) | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | [  ⟦T240⟧](https://pypi.org/project/langchain-azure-ai/) |
| [⟦T143⟧](/oss/python/integrations/vectorstores/databricks_vector_search) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | [  ⟦T241⟧](https://pypi.org/project/databricks-langchain/) |
| [⟦T144⟧](/oss/python/integrations/vectorstores/pinecone_sparse) | | | | | | | | | [  ⟦T242⟧](https://pypi.org/project/langchain-pinecone/) |
| [⟦T145⟧](/oss/python/integrations/vectorstores/pinecone) | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | [  ⟦T243⟧](https://pypi.org/project/langchain-pinecone/) |
| [⟦T146⟧](/oss/python/integrations/vectorstores/milvus) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | [  ⟦T244⟧](https://pypi.org/project/langchain-milvus/) |
| [⟦T147⟧](/oss/python/integrations/vectorstores/weaviate) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | [  ⟦T245⟧](https://pypi.org/project/langchain-weaviate/) |
| [⟦T148⟧](/oss/python/integrations/vectorstores/oracle) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | [  ⟦T246⟧](https://pypi.org/project/langchain-oracledb/) |
| [⟦T149⟧](/oss/python/integrations/vectorstores/astradb) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | [  ⟦T247⟧](https://pypi.org/project/langchain-astradb/) |
| [⟦T150⟧](/oss/python/integrations/vectorstores/neo4jvector) | | | | | | | | | [  ⟦T248⟧](https://pypi.org/project/langchain-neo4j/) |
| [⟦T151⟧](/oss/python/integrations/vectorstores/elasticsearch) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | [  ⟦T249⟧](https://pypi.org/project/langchain-elasticsearch/) |
| [⟦T152⟧](/oss/python/integrations/vectorstores/redis) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | [  ⟦T250⟧](https://pypi.org/project/langchain-redis/) || [⟦T153⟧](/oss/python/integrations/vectorstores/google_alloydb) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | [  ⟦T251⟧](https://pypi.org/project/langchain-google-alloydb-pg/) |
| [⟦T154⟧](/oss/python/integrations/vectorstores/azure_cosmos_db_no_sql) | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | [  ⟦T252⟧](https://pypi.org/project/langchain-azure-cosmosdb/) |
| [⟦T155⟧](/oss/python/integrations/vectorstores/google_cloud_sql_pg) | | | | | | | | | [  ⟦T253⟧](https://pypi.org/project/langchain-google-cloud-sql-pg/) |
| [⟦T156⟧](/oss/python/integrations/vectorstores/sap_hanavector) | | | | | | | | | [  ⟦T254⟧](https://pypi.org/project/langchain-hana/) |
| [⟦T157⟧](/oss/python/integrations/vectorstores/google_firestore) | | | | | | | | | [  ⟦T255⟧](https://pypi.org/project/langchain-google-firestore/) |
| [⟦T158⟧](https://docs.getsemantica.ai/integrations/langchain) | ❌ | | | | | | | | [  ⟦T256⟧](https://pypi.org/project/semantica/)​​ |
| [⟦T159⟧](/oss/python/integrations/vectorstores/google_spanner) | | | | | | | | | [  ⟦T257⟧](https://pypi.org/project/langchain-google-spanner/) |
| [⟦T160⟧](https://github.com/cockroachdb/langchain-cockroachdb/) | | | | | | | | | [  ⟦T258⟧](https://pypi.org/project/langchain-cockroachdb/) |
| [⟦T161⟧](https://pypi.org/project/langchain-oceanbase/) | | | | | | | | | [  ⟦T259⟧](https://pypi.org/project/langchain-oceanbase/) |
| [⟦T162⟧](https://github.com/langchain-ai/langchain-ibm/tree/main/libs/langchain-db2) | | | | | | | | | [  ⟦T260⟧](https://pypi.org/project/langchain-db2/) |
| [⟦T163⟧](https://infino.ai/docs) | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | [  ⟦T261⟧](https://pypi.org/project/langchain-infino/) |
| [⟦T164⟧](https://opensolr.com/langchain) | | | | | | | | | [  ⟦T262⟧](https://pypi.org/project/langchain-opensolr/) |
| [⟦T165⟧](https://github.com/Teradata/langchain-teradata) | | | | | | | | | [  ⟦T263⟧](https://pypi.org/project/langchain-teradata/) |
| [⟦T166⟧](https://docs.cyborg.co/versions/latest/integrations/langchain/introduction) | ✅ | ✅ | ✅ | ✅ | ✅ | | ✅ | | [  ⟦T264⟧](https://pypi.org/project/langchain-cyborgdb/) |
| [⟦T167⟧](https://docs.singlestore.com/cloud/developer-resources/functional-extensions/working-with-vector-data/) | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | [  ⟦T265⟧](https://pypi.org/project/langchain-singlestore/) |
| [⟦T168⟧](https://ydb.tech/) | | | | | | | | | [  ⟦T266⟧](https://pypi.org/project/langchain-ydb/) |
| [⟦T169⟧](https://docs.couchbase.com/server/current/vector-search/vector-search.html) | | | | | | | | | [  ⟦T267⟧](https://pypi.org/project/langchain-couchbase/) |
| [⟦T170⟧](/oss/python/integrations/vectorstores/azure_db_for_postgresql) | | | | | | | | | [  ⟦T268⟧](https://pypi.org/project/langchain-azure-postgresql/) |
| [⟦T171⟧](https://github.com/IntelLabs/vdms) | | | | | | | | | [  ⟦T269⟧](https://pypi.org/project/langchain-vdms/) |
| [⟦T172⟧](https://learn.microsoft.com/en-us/azure/azure-sql/database/ai-artificial-intelligence-intelligent-applications?view=azuresql) | | | | | | | | | [  ⟦T270⟧](https://pypi.org/project/langchain-sqlserver/) |
| [⟦T173⟧](https://docs.falkordb.com/genai-tools/langchain.html) | | ✅ | ✅ | | | | | | [  ⟦T271⟧](https://pypi.org/project/langchain-falkordb/) |
| [⟦T174⟧](https://github.com/vast-data/vast-vector-store) | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | [  ⟦T272⟧](https://pypi.org/project/langchain-vastdb/) |
| [⟦T175⟧](https://mariadb.com/docs/connectors/other/langchain-mariadb/api-reference) | | | | | | | | | [  ⟦T273⟧](https://pypi.org/project/langchain-mariadb/) |
| [⟦T176⟧](https://github.com/sangaraju1988/amu-pgvector#readme) | ✅ | | | | | | | | [  ⟦T274⟧](https://pypi.org/project/langchain-amu/) |
| [⟦T177⟧](https://mixpeek.com/docs/agent-integrations/langchain) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | [  ⟦T275⟧](https://pypi.org/project/langchain-mixpeek/) |
| [⟦T178⟧](https://surrealdb.com/docs/build/deployment/surrealdb-cloud/getting-started) | | | | | | | | | [  ⟦T276⟧](https://pypi.org/project/langchain-surrealdb/) |
| [⟦T179⟧](https://github.com/polardb/langchain-polardbx) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | [  ⟦T277⟧](https://pypi.org/project/langchain-polardbx/) |
| [⟦T180⟧](https://github.com/infinispan/langchain-infinispan/blob/main/libs/infinispan/README.md) | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | [  ⟦T278⟧](https://pypi.org/project/langchain-infinispan/) |
| [⟦T181⟧](https://cloud.google.com/bigtable) | | | | | | | | | [  ⟦T279⟧](https://pypi.org/project/langchain-google-bigtable/) || [⟦T182⟧](https://github.com/apoorva-01/langchain-shannonbase) | | | | | | | | | [  ⟦T280⟧](https://pypi.org/project/langchain-shannonbase/) |
| [⟦T183⟧](https://github.com/mpb159753/langchain-opengauss) | | | | | | | | | [  ⟦T281⟧](https://pypi.org/project/langchain-opengauss/) |
| [⟦T184⟧](/oss/python/integrations/vectorstores/google_memorystore_redis) | | | | | | | | | [  ⟦T282⟧](https://pypi.org/project/langchain-google-memorystore-redis/) |
| [⟦T185⟧](https://mchl-labs.github.io/chronovec/integrations/langchain) | | | | | | | | | [  ⟦T283⟧](https://pypi.org/project/chronovec/) |
| [⟦T186⟧](/oss/python/integrations/vectorstores/turbopuffer) | | | | | | | | | [  ⟦T284⟧](https://pypi.org/project/langchain-turbopuffer/) |
| [⟦T187⟧](https://github.com/typesense/langchain-typesense#readme) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | [  ⟦T285⟧](https://pypi.org/project/langchain-typesense/) |
| [⟦T188⟧](https://docs.lambdadb.ai/guides/get-started/quickstart) | | | | | | | | | [  ⟦T286⟧](https://pypi.org/project/langchain-lambdadb/) |
| [⟦T189⟧](https://docs.zeusdb.com/en/latest/) | | | | | | | | | [  ⟦T287⟧](https://pypi.org/project/langchain-zeusdb/) |
| [⟦T190⟧](https://docs.pixeltable.com/overview/pixeltable) | | | | | | | | | [  ⟦T288⟧](https://pypi.org/project/langchain-pixeltable/) |
| [⟦T191⟧](https://github.com/geldata/langchain-gel) | | | | | | | | | [  ⟦T289⟧](https://pypi.org/project/langchain-gel/) |
| [⟦T192⟧](https://www.vectorpanda.com/docs/tutorials/langchain) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | [  ⟦T290⟧](https://pypi.org/project/langchain-vectorpanda/) |
| [⟦T193⟧](/oss/python/integrations/vectorstores/google_cloud_sql_mysql) | | | | | | | | | [  ⟦T291⟧](https://pypi.org/project/langchain-google-cloud-sql-mysql/) |
| [⟦T194⟧](https://github.com/kineticadb/langchain-kinetica) | | | | | | | | | [  ⟦T292⟧](https://pypi.org/project/langchain-kinetica/) |
| [⟦T195⟧](https://github.com/moorcheh-ai/langchain-moorcheh) | | | | | | | | | [  ⟦T293⟧](https://pypi.org/project/langchain-moorcheh/) |
| [⟦T196⟧](https://github.com/polardb/langchain-polardb-pg) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | [  ⟦T294⟧](https://pypi.org/project/langchain-polardb-pg/) |
| [⟦T197⟧](https://docs.vectara.com/) | | | | | | | | | [  ⟦T295⟧](https://pypi.org/project/langchain-vectara/) |
| [⟦T198⟧](https://github.com/houyidb-community/houyidb/blob/main/sdk/python/langchain-houyidb/README.en.md) | ✅ | ✅ | | | | | | | [  ⟦T296⟧](https://pypi.org/project/langchain-houyidb/) |
| [⟦T199⟧](https://docs.vectoraidb.actian.com) | ✅ | ✅ | ✅ | ✅ | ✅ | | | ✅ | [  ⟦T297⟧](https://pypi.org/project/langchain-actian-vectorai/) |
| [⟦T200⟧](https://github.com/Polign/polign/tree/main/python/langchain-polign) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | [  ⟦T298⟧](https://pypi.org/project/langchain-polign/) |
| [⟦T201⟧](https://docs.firebolt.io/guides/integrations/langchain) | | | | | | | | | [  ⟦T299⟧](https://pypi.org/project/langchain-firebolt/) |
| [⟦T202⟧](https://serenedb.com/docs/clients/langchain-serenedb) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | [  ⟦T300⟧](https://pypi.org/project/langchain-serenedb/) |
| [⟦T203⟧](https://github.com/meetdewey/langchain-dewey) | | | | | | | | | [  ⟦T301⟧](https://pypi.org/project/langchain-dewey/) |
| [⟦T204⟧](https://docs.deeplake.ai/) | | | | | | | | | [  ⟦T302⟧](https://pypi.org/project/langchain-deeplake/) |
| [⟦T205⟧](https://docs.volcengine.com/docs/6357?lang=en) | | | | | | | | | [  ⟦T303⟧](https://pypi.org/project/langchain-volcengine-mysql/) |
| [⟦T206⟧](https://docs.volcengine.com/docs/6313?lang=en) | | | | | | | | | [  ⟦T304⟧](https://pypi.org/project/langchain-volcengine-mysql/) |
| [⟦T207⟧](https://github.com/rostamlabs/rostam/tree/main/clients/langchain-rostam) | | | | | | | | | [  ⟦T305⟧](https://pypi.org/project/langchain-rostam/) |
| [⟦T208⟧](https://github.com/wangkuahai/langchain-alibabacloud-mysql) | | | | | | | | | [  ⟦T306⟧](https://pypi.org/project/langchain-alibabacloud-mysql/) |
| [⟦T209⟧](https://help.aliyun.com/en/lindorm/user-guide/enable-vector-engine) | | | | | | | | | [  ⟦T307⟧](https://pypi.org/project/langchain-lindorm-integration/) |
| [⟦T210⟧](https://github.com/chdb-io/langchain-chdb) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | [  ⟦T308⟧](https://pypi.org/project/langchain-chdb/) || [⟦T211⟧](https://github.com/yantrikos/langchain-yantrikdb) | ✅ | | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | [  ⟦T309⟧](https://pypi.org/project/langchain-yantrikdb/) |
| [⟦T212⟧](https://docs.rushdb.com/connect/langchain) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | | ✅ | [  ⟦T310⟧](https://pypi.org/project/langchain-rushdb/) |
| [⟦T213⟧](https://github.com/dxmt/dxmt/tree/main/vectordb/clients/langchain-dxmt) | ✅ | ✅ | ✅ | ✅ | ✅ | | | ✅ | [  ⟦T311⟧](https://pypi.org/project/langchain-dxmt/) |
| [⟦T214⟧](https://github.com/facebookresearch/faiss) | | | | | | | | |不适用 |
| [⟦T215⟧](/oss/python/integrations/vectorstores/in_memory) | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |不适用 |

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/vectorstores/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。