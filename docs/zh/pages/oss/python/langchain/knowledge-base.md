<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a semantic search engine with LangChain | https://docs.langchain.com/oss/python/langchain/knowledge-base -->

## 概述

使用 LangChain [embeddings](/oss/python/integrations/embeddings) 和 [vector stores](/oss/python/integrations/vectorstores) 在 PDF 上构建语义搜索引擎。使用它来检索类似于查询的段落，然后将检索器插入[retrieval-augmented generation (RAG)](/oss/python/deepagents/retrieval)或其他LLM工作流程。

本教程涵盖：

1. 从 PDF 创建 `Document` 对象。
2. 生成嵌入。
3. 加载并分割 PDF。
4. 对向量存储中的块进行索引并通过相似性进行查询。
5. 将商店包裹成猎犬。

该指南还包括在搜索引擎之上的最小 RAG 实现。

### 概念

本教程重点关注文本检索并涵盖以下概念：

* [⟦T76⟧](https://reference.langchain.com/python/langchain-core/documents/base/Document)
* [Text splitters](/oss/python/integrations/splitters)
* [Embeddings](/oss/python/integrations/embeddings)
* [Vector stores](/oss/python/integrations/vectorstores) 和 [retrievers](/oss/python/integrations/retrievers)

## 设置

### 安装依赖项

本教程使用 `pypdf` 包读取 PDF：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install pypdf
  ```

  ```bash conda theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  conda install pypdf -c conda-forge
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add pypdf
  ```
</CodeGroup>

欲了解更多详情，请参阅[Installation guide](/oss/python/langchain/install)。

### 配置 LangSmith

您使用 LangChain 构建的许多应用程序将包含多个步骤以及多次调用 LLM 调用。
随着这些应用程序变得越来越复杂，能够检查链或代理内部到底发生了什么变得至关重要。
最好的方法是使用[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-knowledge-base)。在上面的链接注册后，请确保设置环境变量以开始记录跟踪：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="..."
```

在笔记本中，您可以使用以下方式设置它们：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import getpass
import os

os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_API_KEY"] = getpass.getpass()
```

## 创建文档

LangChain 为文本单元和相关元数据实现了[⟦T78⟧](https://reference.langchain.com/python/langchain-core/documents/base/Document) 抽象。它具有三个属性：

* `page_content`：代表内容的字符串。
* `metadata`：包含任意元数据的字典。
* `id`：（可选）文档的字符串标识符。

`metadata`可以捕获文档的来源、它与其他文档的关系以及其他信息。单个[⟦T83⟧](https://reference.langchain.com/python/langchain-core/documents/base/Document)通常代表较大文档的一部分。

以下代码创建示例文档：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_core.documents import Document

documents = [
    Document(
        page_content="Dogs are great companions, known for their loyalty and friendliness.",
        metadata={"source": "mammal-pets-doc"},
    ),
    Document(
        page_content="Cats are independent pets that often enjoy their own space.",
        metadata={"source": "mammal-pets-doc"},
    ),
]
```

## 生成嵌入

矢量搜索存储与文本关联的数字向量。将查询嵌入为相同维度的向量，然后使用相似性度量（例如余弦相似性）来查找相关文本。

LangChain支持[many providers](/oss/python/integrations/embeddings/)的嵌入。选择一个模型来指定如何将文本转换为数字向量：

<Tabs>
  <Tab title="OpenAI">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -U "langchain-openai"
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import getpass
    import os

    if not os.environ.get("OPENAI_API_KEY"):
        os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter API key for OpenAI: ")

    from langchain_openai import OpenAIEmbeddings

    embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
    ```
  </Tab>

  <Tab title="Azure">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -U "langchain-openai"
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
  </Tab>

  <Tab title="Google Gemini">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
  </Tab>

  <Tab title="Google Vertex">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-google-vertexai
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai import VertexAIEmbeddings

    embeddings = VertexAIEmbeddings(model="text-embedding-005")
    ```
  </Tab>

  <Tab title="AWS">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-aws
    ``````python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_aws import BedrockEmbeddings

    embeddings = BedrockEmbeddings(model_id="amazon.titan-embed-text-v2:0")
    ```
  </Tab>

  <Tab title="HuggingFace">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-huggingface
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_huggingface import HuggingFaceEmbeddings

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-mpnet-base-v2",
        encode_kwargs={"normalize_embeddings": True},
    )
    ```
  </Tab>

  <Tab title="Ollama">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-ollama
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_ollama import OllamaEmbeddings

    embeddings = OllamaEmbeddings(model="llama3")
    ```
  </Tab>

  <Tab title="Cohere">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
  </Tab>

  <Tab title="MistralAI">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
  </Tab>

  <Tab title="Nomic">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
  </Tab>

  <Tab title="NVIDIA">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
  </Tab>

  <Tab title="Voyage AI">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-voyageai
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import getpass
    import os

    if not os.environ.get("VOYAGE_API_KEY"):
        os.environ["VOYAGE_API_KEY"] = getpass.getpass("Enter API key for Voyage AI: ")

    from langchain-voyageai import VoyageAIEmbeddings

    embeddings = VoyageAIEmbeddings(model="voyage-3")
    ```
  </Tab>

  <Tab title="IBM watsonx">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
  </Tab>

  <Tab title="Fake">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-core
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_core.embeddings import DeterministicFakeEmbedding

    embeddings = DeterministicFakeEmbedding(size=4096)
    ```
  </Tab>

  <Tab title="Isaacus">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-isaacus
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import getpass
    import os

    if not os.environ.get("ISAACUS_API_KEY"):
    os.environ["ISAACUS_API_KEY"] = getpass.getpass("Enter API key for Isaacus: ")

    from langchain_isaacus import IsaacusEmbeddings

    embeddings = IsaacusEmbeddings(model="kanon-2-embedder")
    ```
  </Tab>
</Tabs>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
vector_1 = embeddings.embed_query(documents[0].page_content)
vector_2 = embeddings.embed_query(documents[1].page_content)

assert len(vector_1) == len(vector_2)
print(f"Generated vectors of length {len(vector_1)}\n")
print(vector_1[:10])
```

```text wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Generated vectors of length 1536

[-0.008586574345827103, -0.03341241180896759, -0.008936782367527485, -0.0036674530711025, 0.010564599186182022, 0.009598285891115665, -0.028587326407432556, -0.015824200585484505, 0.0030416189692914486, -0.012899317778646946]
```

接下来，将嵌入存储在支持高效相似性搜索的向量存储中。

## 选择一个向量存储

LangChain [⟦T84⟧](https://reference.langchain.com/python/langchain-core/vectorstores/base/VectorStore) 对象将文本和 [⟦T85⟧](https://reference.langchain.com/python/langchain-core/documents/base/Document) 对象添加到存储中，并使用相似性度量来查询它们。它们通常使用 [embedding](/oss/python/integrations/embeddings) 模型进行初始化，将文本转换为数字向量。

LangChain包含[integrations](/oss/python/integrations/vectorstores)以及多种向量存储技术。有些是托管的并且需要凭据，有些在单独的基础设施（本地或第三方）中运行，而另一些则在内存中运行以实现轻量级工作负载。选择矢量存储：

<Tabs>
  <Tab title="In-memory">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -U "langchain-core"
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_core.vectorstores import InMemoryVectorStore

    vector_store = InMemoryVectorStore(embeddings)
    ```
  </Tab>

  <Tab title="Amazon OpenSearch">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU  boto3
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
  </Tab>

  <Tab title="AstraDB">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -U "langchain-astradb"
    ```

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
  </Tab>

  <Tab title="Chroma">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-chroma
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_chroma import Chroma

    vector_store = Chroma(
        collection_name="example_collection",
        embedding_function=embeddings,
        persist_directory="./chroma_langchain_db",  # Where to save data locally, remove if not necessary
    )
    ```
  </Tab>

  <Tab title="Milvus">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-milvus
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_milvus import Milvus

    URI = "./milvus_example.db"

    vector_store = Milvus(
        embedding_function=embeddings,
        connection_args={"uri": URI},
        index_params={"index_type": "FLAT", "metric_type": "L2"},
    )
    ```
  </Tab><Tab title="MongoDB">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
  </Tab>

  <Tab title="PGVector">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-postgres
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_postgres import PGVector

    vector_store = PGVector(
        embeddings=embeddings,
        collection_name="my_docs",
        connection="postgresql+psycopg://...",
    )
    ```
  </Tab>

  <Tab title="PGVectorStore">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-postgres
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_postgres import PGEngine, PGVectorStore

    pg_engine = PGEngine.from_connection_string(
        url="postgresql+psycopg://..."
    )

    vector_store = PGVectorStore.create_sync(
        engine=pg_engine,
        table_name='test_table',
        embedding_service=embeddings
    )
    ```
  </Tab>

  <Tab title="Pinecone">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-pinecone
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_pinecone import PineconeVectorStore
    from pinecone import Pinecone

    pc = Pinecone(api_key=...)
    index = pc.Index(index_name)

    vector_store = PineconeVectorStore(embedding=embeddings, index=index)
    ```
  </Tab>

  <Tab title="Qdrant">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -qU langchain-qdrant
    ```

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
  </Tab>
</Tabs>

## 加载并分割 PDF

从 PDF 加载内容，然后在建立索引之前将其分割成更小的块。此示例使用[a sample Nike 10-K filing from 2023](https://github.com/langchain-ai/langchain/blob/v0.3/docs/docs/example_data/nke-10k-2023.pdf)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import pypdf
from langchain_core.documents import Document


# Below is a minimal helper for demonstration purposes.
def load_pdf_pages(file_path: str) -> list[Document]:
    reader = pypdf.PdfReader(file_path)
    return [
        Document(
            page_content=page.extract_text() or "",
            metadata={"source": file_path, "page": i},
        )
        for i, page in enumerate(reader.pages)
    ]


file_path = "../example_data/nke-10k-2023.pdf"
docs = load_pdf_pages(file_path)
print(len(docs))
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
107
```

页面通常过于粗糙而无法检索。进一步拆分页面，以便相关段落不会被周围的文本冲淡。 [⟦T86⟧](https://reference.langchain.com/python/langchain-text-splitters/character/RecursiveCharacterTextSplitter) 在公共分隔符（例如换行符）上递归分割，直到每个块达到目标大小。这是针对一般文本用例推荐的文本分割器。

设置 `add_start_index=True` ，以便每个拆分都为其在原始文档中的字符偏移量保留一个 `start_index` 元数据字段。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000, chunk_overlap=200, add_start_index=True
)
all_splits = text_splitter.split_documents(docs)

print(len(all_splits))
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
516
```

## 索引文件

将块索引到向量存储中：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ids = vector_store.add_documents(documents=all_splits)
```

大多数矢量存储集成还支持连接到现有存储（例如使用客户端或索引名称）。有关详细信息，请参阅特定 [integration](/oss/python/integrations/vectorstores) 的文档。

## 查询向量存储

将文档添加到[⟦T89⟧](https://reference.langchain.com/python/langchain-core/vectorstores/base/VectorStore)后，即可查询：* 同步和异步
* 按字符串查询和按向量查询
* 有和没有相似度分数
* 通过相似性和[maximum marginal relevance](https://reference.langchain.com/python/langchain-core/vectorstores/base/VectorStore/max_marginal_relevance_search)（平衡相似性和多样性）

这些方法通常返回 [⟦T90⟧](https://reference.langchain.com/python/langchain-core/documents/base/Document) 对象的列表。

### 按字符串搜索

嵌入将文本映射到密集向量，因此相似的含义在几何上很接近。这意味着您可以通过传递自然语言问题来检索相关段落：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
results = vector_store.similarity_search(
    "How many distribution centers does Nike have in the US?"
)

print(results[0])
```

```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
page_content='direct to consumer operations sell products through the following number of retail stores in the United States:
U.S. RETAIL STORES NUMBER
NIKE Brand factory stores 213
NIKE Brand in-line stores (including employee-only stores) 74
Converse stores (including factory stores) 82
TOTAL 369
In the United States, NIKE has eight significant distribution centers. Refer to Item 2. Properties for further information.
2023 FORM 10-K 2' metadata={'page': 4, 'source': '../example_data/nke-10k-2023.pdf', 'start_index': 3125}
```

异步查询：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
results = await vector_store.asimilarity_search("When was Nike incorporated?")

print(results[0])
```

```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
page_content='Table of Contents
PART I
ITEM 1. BUSINESS
GENERAL
NIKE, Inc. was incorporated in 1967 under the laws of the State of Oregon. As used in this Annual Report on Form 10-K (this "Annual Report"), the terms "we," "us," "our,"
"NIKE" and the "Company" refer to NIKE, Inc. and its predecessors, subsidiaries and affiliates, collectively, unless the context indicates otherwise.
Our principal business activity is the design, development and worldwide marketing and selling of athletic footwear, apparel, equipment, accessories and services. NIKE is
the largest seller of athletic footwear and apparel in the world. We sell our products through NIKE Direct operations, which are comprised of both NIKE-owned retail stores
and sales through our digital platforms (also referred to as "NIKE Brand Digital"), to retail accounts and to a mix of independent distributors, licensees and sales' metadata={'page': 3, 'source': '../example_data/nke-10k-2023.pdf', 'start_index': 0}
```

### 返回分数

您可以返回文档的相似度分数。分数的含义因提供商而异。在这种情况下，分数是一个与相似度成反比变化的距离度量：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Note that providers implement different scores; the score here
# is a distance metric that varies inversely with similarity.

results = vector_store.similarity_search_with_score("What was Nike's revenue in 2023?")
doc, score = results[0]
print(f"Score: {score}\n")
print(doc)
```

```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Score: 0.23699893057346344

page_content='Table of Contents
FISCAL 2023 NIKE BRAND REVENUE HIGHLIGHTS
The following tables present NIKE Brand revenues disaggregated by reportable operating segment, distribution channel and major product line:
FISCAL 2023 COMPARED TO FISCAL 2022
•NIKE, Inc. Revenues were $51.2 billion in fiscal 2023, which increased 10% and 16% compared to fiscal 2022 on a reported and currency-neutral basis, respectively.
The increase was due to higher revenues in North America, Europe, Middle East & Africa ("EMEA"), APLA and Greater China, which contributed approximately 7, 6,
2 and 1 percentage points to NIKE, Inc. Revenues, respectively.
•NIKE Brand revenues, which represented over 90% of NIKE, Inc. Revenues, increased 10% and 16% on a reported and currency-neutral basis, respectively. This
increase was primarily due to higher revenues in Men's, the Jordan Brand, Women's and Kids' which grew 17%, 35%,11% and 10%, respectively, on a wholesale
equivalent basis.' metadata={'page': 35, 'source': '../example_data/nke-10k-2023.pdf', 'start_index': 0}
```

### 按向量搜索

自己嵌入查询，然后使用结果向量进行搜索：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
embedding = embeddings.embed_query("How were Nike's margins impacted in 2023?")

results = vector_store.similarity_search_by_vector(embedding)
print(results[0])
```

```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
page_content='Table of Contents
GROSS MARGIN
FISCAL 2023 COMPARED TO FISCAL 2022
For fiscal 2023, our consolidated gross profit increased 4% to $22,292 million compared to $21,479 million for fiscal 2022. Gross margin decreased 250 basis points to
43.5% for fiscal 2023 compared to 46.0% for fiscal 2022 due to the following:
*Wholesale equivalent
The decrease in gross margin for fiscal 2023 was primarily due to:
•Higher NIKE Brand product costs, on a wholesale equivalent basis, primarily due to higher input costs and elevated inbound freight and logistics costs as well as
product mix;
•Lower margin in our NIKE Direct business, driven by higher promotional activity to liquidate inventory in the current period compared to lower promotional activity in
the prior period resulting from lower available inventory supply;
•Unfavorable changes in net foreign currency exchange rates, including hedges; and
•Lower off-price margin, on a wholesale equivalent basis.
This was partially offset by:' metadata={'page': 36, 'source': '../example_data/nke-10k-2023.pdf', 'start_index': 0}
```

了解更多：

* [API Reference](https://reference.langchain.com/python/langchain-core/vectorstores/base/VectorStore)
* [Integration-specific docs](/oss/python/integrations/vectorstores)

## 使用检索器

LangChain [⟦T91⟧](https://reference.langchain.com/python/langchain-core/vectorstores/base/VectorStore) 对象不会子类[⟦T92⟧](https://reference.langchain.com/python/langchain-core/runnables/base/Runnable)。 [Retrievers](https://reference.langchain.com/python/langchain-core/retrievers/BaseRetriever) 是 Runnables，因此它们支持同步和异步 `invoke` 和 `batch` 等标准方法。

您还可以从向量存储构建检索器，并且检索器还可以包装非向量源（例如外部 API）。

在本例中，通过包装 `similarity_search` 创建一个简单的检索器，无需子类化 `Retriever`：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import List

from langchain_core.documents import Document
from langchain_core.runnables import chain


@chain
def retriever(query: str) -> List[Document]:
    return vector_store.similarity_search(query, k=1)


retriever.batch(
    [
        "How many distribution centers does Nike have in the US?",
        "When was Nike incorporated?",
    ],
)
```

```text wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[[Document(metadata={'page': 4, 'source': '../example_data/nke-10k-2023.pdf', 'start_index': 3125}, page_content='direct to consumer operations sell products through the following number of retail stores in the United States:\nU.S. RETAIL STORES NUMBER\nNIKE Brand factory stores 213 \nNIKE Brand in-line stores (including employee-only stores) 74 \nConverse stores (including factory stores) 82 \nTOTAL 369 \nIn the United States, NIKE has eight significant distribution centers. Refer to Item 2. Properties for further information.\n2023 FORM 10-K 2')],
 [Document(metadata={'page': 3, 'source': '../example_data/nke-10k-2023.pdf', 'start_index': 0}, page_content='Table of Contents\nPART I\nITEM 1. BUSINESS\nGENERAL\nNIKE, Inc. was incorporated in 1967 under the laws of the State of Oregon. As used in this Annual Report on Form 10-K (this "Annual Report"), the terms "we," "us," "our,"\n"NIKE" and the "Company" refer to NIKE, Inc. and its predecessors, subsidiaries and affiliates, collectively, unless the context indicates otherwise.\nOur principal business activity is the design, development and worldwide marketing and selling of athletic footwear, apparel, equipment, accessories and services. NIKE is\nthe largest seller of athletic footwear and apparel in the world. We sell our products through NIKE Direct operations, which are comprised of both NIKE-owned retail stores\nand sales through our digital platforms (also referred to as "NIKE Brand Digital"), to retail accounts and to a mix of independent distributors, licensees and sales')]]
```向量存储实现了返回 [⟦T98⟧](https://reference.langchain.com/python/langchain-core/vectorstores/base/VectorStoreRetriever) 的 `as_retriever` 方法。这些检索器公开 `search_type` 和 `search_kwargs` 来选择和参数化底层存储方法。复制上面的例子：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
retriever = vector_store.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 1},
)

retriever.batch(
    [
        "How many distribution centers does Nike have in the US?",
        "When was Nike incorporated?",
    ],
)
```

```text wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[[Document(metadata={'page': 4, 'source': '../example_data/nke-10k-2023.pdf', 'start_index': 3125}, page_content='direct to consumer operations sell products through the following number of retail stores in the United States:\nU.S. RETAIL STORES NUMBER\nNIKE Brand factory stores 213 \nNIKE Brand in-line stores (including employee-only stores) 74 \nConverse stores (including factory stores) 82 \nTOTAL 369 \nIn the United States, NIKE has eight significant distribution centers. Refer to Item 2. Properties for further information.\n2023 FORM 10-K 2')],
 [Document(metadata={'page': 3, 'source': '../example_data/nke-10k-2023.pdf', 'start_index': 0}, page_content='Table of Contents\nPART I\nITEM 1. BUSINESS\nGENERAL\nNIKE, Inc. was incorporated in 1967 under the laws of the State of Oregon. As used in this Annual Report on Form 10-K (this "Annual Report"), the terms "we," "us," "our,"\n"NIKE" and the "Company" refer to NIKE, Inc. and its predecessors, subsidiaries and affiliates, collectively, unless the context indicates otherwise.\nOur principal business activity is the design, development and worldwide marketing and selling of athletic footwear, apparel, equipment, accessories and services. NIKE is\nthe largest seller of athletic footwear and apparel in the world. We sell our products through NIKE Direct operations, which are comprised of both NIKE-owned retail stores\nand sales through our digital platforms (also referred to as "NIKE Brand Digital"), to retail accounts and to a mix of independent distributors, licensees and sales')]]
```

`VectorStoreRetriever` 支持`"similarity"`（默认）、`"mmr"`（最大边缘相关性）和`"similarity_score_threshold"` 的搜索类型。使用最后一个选项按相似度分数过滤文档。

您可以在更复杂的应用程序中使用检索器，例如 [retrieval-augmented generation (RAG)](/oss/python/deepagents/retrieval)，它在 LLM 提示中将问题与检索到的上下文结合起来。要了解有关构建此类应用程序的更多信息，请查看 [RAG tutorial](/oss/python/deepagents/rag) 教程。

## 后续步骤

您现在已经了解了如何在 PDF 文档上构建语义搜索引擎。

欲了解更多信息，请参阅：

* [Available embedding integrations](/oss/python/integrations/embeddings)
* [Available vector store integrations](/oss/python/integrations/vectorstores)

有关 RAG 的更多信息：

* [Retrieval overview](/oss/python/deepagents/retrieval)
* [RAG with Deep Agents](/oss/python/deepagents/rag)
* [Evaluate a RAG application](/langsmith/evaluate-rag-tutorial)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/knowledge-base.mdx) 或[file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>