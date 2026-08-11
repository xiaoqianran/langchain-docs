<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Embedding model integrations | https://docs.langchain.com/oss/python/integrations/embeddings/index -->

# 嵌入模型集成

使用 LangChain Python 与嵌入模型集成。

## 概述

<Note>
  本概述涵盖**基于文本的嵌入模型**。 LangChain 目前不支持多模式嵌入。

  参见[top embedding models](#top-integrations)。
</Note>

嵌入模型将原始文本（例如句子、段落或推文）转换为固定长度的数字向量，以捕获其**语义意义**。这些向量允许机器根据含义而不是确切的单词来比较和搜索文本。

实际上，这意味着具有相似想法的文本在向量空间中被紧密地放置在一起。例如，即使使用不同的措辞，嵌入也可以显示讨论相关概念的文档，而不是仅匹配短语“机器学习”。

### 它是如何工作的

1. **矢量化** — 该模型将每个输入字符串编码为高维向量。
2. **相似性评分** — 使用数学指标对向量进行比较，以衡量底层文本的相关程度。

### 相似度指标

通常使用几个指标来比较嵌入：* **余弦相似度** — 测量两个向量之间的角度。
* **欧几里德距离** — 测量点之间的直线距离。
* **点积** — 测量一个向量投射到另一个向量上的程度。

下面是计算两个向量之间的余弦相似度的示例：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import numpy as np

def cosine_similarity(vec1, vec2):
    dot = np.dot(vec1, vec2)
    return dot / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

similarity = cosine_similarity(query_embedding, document_embedding)
print("Cosine Similarity:", similarity)
```

## 接口

LangChain 通过[Embeddings](https://reference.langchain.com/python/langchain-core/embeddings/embeddings/Embeddings) 接口为文本嵌入模型（例如，OpenAI、Cohere、Hugging Face）提供标准接口。

有两种主要方法可用：

* `embed_documents(texts: List[str]) → List[List[float]]`：嵌入文档列表。
* `embed_query(text: str) → List[float]`：嵌入单个查询。

<Note>
  该接口允许使用不同的策略嵌入查询和文档，尽管大多数提供商在实践中以相同的方式处理它们。
</Note>

## 顶级集成<div>
  |整合|下载 |
  | :---------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
  | [⟦T5⟧](/oss/python/integrations/embeddings/azure_openai) | <span><a href="https://pypi.org/project/langchain-openai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T6⟧](/oss/python/integrations/embeddings/openai) | <span><a href="https://pypi.org/project/langchain-openai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T7⟧](/oss/python/integrations/embeddings/google_generative_ai) | <span><a href="https://pypi.org/project/langchain-google-genai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T8⟧](/oss/python/integrations/embeddings/databricks) | <span><a href="https://pypi.org/project/databricks-langchain/"><img alt="Downloads per month" /></a></span>|
  | [⟦T9⟧](/oss/python/integrations/embeddings/ollama) | <span><a href="https://pypi.org/project/langchain-ollama/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T10⟧](/oss/python/integrations/embeddings/sentence_transformers) | <span><a href="https://pypi.org/project/langchain-huggingface/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T11⟧](/oss/python/integrations/embeddings/mistralai) | <span><a href="https://pypi.org/project/langchain-mistralai/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T12⟧](/oss/python/integrations/embeddings/cohere) | <span><a href="https://pypi.org/project/langchain-cohere/"><img alt="Downloads per month" /></a></span>|| [⟦T13⟧](/oss/python/integrations/embeddings/nvidia_ai_endpoints) | <span><a href="https://pypi.org/project/langchain-nvidia-ai-endpoints/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T14⟧](/oss/python/integrations/embeddings/perplexity) | <span><a href="https://pypi.org/project/langchain-perplexity/"><img alt="Downloads per month" /></a></span>|
  | [⟦T15⟧](/oss/python/integrations/embeddings/together) | <span><a href="https://pypi.org/project/langchain-together/"><img alt="Downloads per month" /></a></span>|
</div>

### 常见部署模式

在实践中，大多数团队都集中在以下四种模式之一：

1. 托管、旗舰：OpenAI `text-embedding-3-large`、Cohere `embed-english-v3`、Google `gemini-embedding-001`、Voyage `voyage-3`。一次 API 调用，开箱即用的一流质量，无需本地基础设施。每次调用成本和数据输出依赖性。
2.本地、开源：`BAAI/bge-*`、`mixedbread-ai/mxbai-embed-*`、`Qwen/Qwen3-Embedding-*`、`nomic-ai/modernbert-embed-*`、`sentence-transformers/all-*`。下载一次，随处运行。无每次调用成本，数据永远不会离开您的环境。在 CPU 上可能比小规模的托管 API 慢；使用 GPU 具有竞争力或更快。
3. 本地、开源、专家：针对您的特定领域、语言或任务的微调模型。从强大的开放基础（例如`BAAI/bge-m3`）开始，甚至对几千个域内查询/文档对进行微调，通常会在该域的检索准确性方面击败托管旗舰。4. 生产规模的自托管：通过 [Text Embeddings Inference (TEI)](https://github.com/huggingface/text-embeddings-inference) 或 Ollama 提供相同的开放模型（基础或微调）。通过托管提供商的水平扩展和 API 人体工程学设计，为您提供本地推理的经济性。

LangChain 对所有四个相同：您实例化一个 `Embeddings` 子类并将其交给向量存储或检索器。模式(2)和(3)使用`HuggingFaceEmbeddings`；模式 (4) 针对 TEI 的 OpenAI 兼容端点或 `OllamaEmbeddings` 使用 `OpenAIEmbeddings`。

### 权衡因素

#### 质量

从[MTEB leaderboard](https://huggingface.co/spaces/mteb/leaderboard)开始。 MTEB 对检索、聚类、分类和重新排名任务中的嵌入模型进行基准测试，是事实上的行业参考。按您的语言和任务进行过滤（对于 RAG 最常见的是检索）。

排行榜数字并不总是会转移，因此在提交之前对您自己的数据进行一次小型评估。 LangSmith 有用于此目的的工具；参见[evaluation guides](/langsmith/evaluation-concepts)。

#### 成本

托管嵌入的价格通常在每百万代币几美分到 0.15 美元之间。对于嵌入一次、每天查询数千次的语料库来说，成本往往由查询端主导。本地推理的每次调用成本为零，但需要 CPU（速度慢）或 GPU（资本或云成本）。交叉取决于工作负载：小批量的个人项目本质上是免费的 CPU；对于中等批量生产，通过 TEI 为本地模型提供服务的单个 GPU 通常胜过托管在单位经济上。

#### 延迟

托管嵌入 API 会为每个请求增加大约 50-200 毫秒的网络延迟。 CPU 上的本地模型对于小型模型（`all-MiniLM-L6-v2` 级）的短查询需要 10-100 毫秒，对于较大模型需要 50-500 毫秒。在 GPU 上，本地推理通常比往返托管 API 更快。

对于批量索引，每个请求的延迟比吞吐量更重要。 TEI 和多进程本地推理批量积极。考虑例如在 GPU 上运行时，`encode_kwargs={"batch_size": 64}` 或`HuggingFaceEmbeddings` 更高版本。

#### 维度

嵌入维度影响向量存储和查询计算。典型尺寸：

* 384（小型句子变形金刚模型，`all-MiniLM-L6-v2`）
* 768（中型 ST 型号，`all-mpnet-base-v2`、`bge-base`）
* 1024（`bge-large`、Cohere v3、Voyage）
* 1536（OpenAI`text-embedding-3-small`，Qwen3-Embedding-0.6B）
* 3072+（OpenAI`text-embedding-3-large`，Qwen3-嵌入-4B/8B）较大的向量通常更准确，但会消耗更多的存储和查询计算。一些现代模型（OpenAI`text-embedding-3-*`、`mixedbread-ai/mxbai-embed-large-v1`、Matryoshka 训练的 ST 模型、Qwen3-Embedding）支持 **截断**：将向量切片为更小的维度，同时实现优雅的质量降级。对于将更多向量拟合到更小的索引中非常有用。

#### 上下文长度

大多数经典嵌入模型的上限为 512 个代币（`all-mpnet-base-v2`，经典 BGE）。较新的模型支持更长的上下文：

* `nomic-ai/modernbert-embed-base`：8192 个代币
* `Alibaba-NLP/gte-multilingual-base`：8192 个代币
* `BAAI/bge-m3`：8192 个代币
* OpenAI `text-embedding-3-*`：8191 个代币

如果您的块很长（整页技术文档、法律段落），则更喜欢长上下文模型。对于短块，512 个令牌的限制很少具有约束力。

#### 多语言支持

对于多语言检索，请选择一个针对您的语言进行训练的模型。强默认值：

* 开行：`BAAI/bge-m3`、`intfloat/multilingual-e5-*`、`Alibaba-NLP/gte-multilingual-*`、`Qwen/Qwen3-Embedding-*`（经停`HuggingFaceEmbeddings`）
* 主办：Cohere `embed-multilingual-v3`、OpenAI `text-embedding-3-*`

#### 查询和文档提示

几种现代开放模型（E5、BGE、Qwen3-Embedding、GTE）使用不同的文本前缀进行训练，用于查询与文档。在查询时使用错误的前缀是一种常见的质量回归。使用`HuggingFaceEmbeddings`时，明确传递提示：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(
    model_name="intfloat/e5-large-v2",
    encode_kwargs={"prompt": "passage: "},
    query_encode_kwargs={"prompt": "query: "},
)
```检查Hugging Face上每个型号的卡片以获取推荐的提示字符串。

#### 许可

大多数流行的开放嵌入模型都是经过许可的（Apache 2.0、MIT）。最近的一些专业模型需要商业许可证才能用于生产。发货前检查每个型号的许可证。

### 超越单向量密集嵌入

每个块一个密集向量是默认的，但不是唯一的选择。

#### 稀疏和混合检索

密集嵌入不处理完全匹配查询（产品代码、命名实体、代码标识符）以及基于关键字的索引。混合检索将密集索引与 BM25 或稀疏神经索引（SPLADE，`BAAI/bge-m3` 的稀疏输出）相结合以覆盖这两种情况。

#### 后期交互和多向量ColBERT 风格的模型为每个标记而不是每个块生成一个向量，然后通过后期交互对文档的查询进行评分。这通常比复杂查询上的单向量密集检索更准确，但代价是更高的存储和更复杂的索引。该领域当前的开放模型包括`jinaai/jina-colbert-v2`、`answerdotai/answerai-colbert-small-v1`，以及较新的后期交互变体，例如`lightonai/LateOn`。 LangChain的内置检索器针对单向量嵌入；后期交互通常需要专业索引（Vespa、Qdrant 的多向量支持或 PyLate）。

### 起点

如果您只想要一个工作起点：

* 快速原型，主办：`OpenAIEmbeddings(model="text-embedding-3-small")`
* 快速原型，本地，无 API 密钥：`HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2", encode_kwargs={"normalize_embeddings": True})`
* 制作、托管、质量第一：`VoyageAIEmbeddings(model="voyage-3")` 或 `OpenAIEmbeddings(model="text-embedding-3-large")`
* 生产、开放、质量第一：`HuggingFaceEmbeddings(model_name="BAAI/bge-m3", encode_kwargs={"normalize_embeddings": True})` 通过 TEI 提供
* 多语言，开放：`HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-large")`，配置查询和文档提示

衡量您自己的数据的检索质量，然后进行迭代。

## 缓存

嵌入可以被存储或临时缓存以避免需要重新计算它们。

缓存嵌入可以使用`CacheBackedEmbeddings`来完成。该包装器将嵌入存储在键值存储中，其中对文本进行哈希处理，并将哈希值用作缓存中的键。初始化`CacheBackedEmbeddings`的主要支持方式是`from_bytes_store`。它需要以下参数：

* **`underlying_embedder`**：用于嵌入的嵌入器。
* **`document_embedding_cache`**：任何用于缓存文档嵌入的[⟦T69⟧](/oss/python/integrations/stores/)。
* **`batch_size`**：（可选，默认为`None`）商店更新之间嵌入的文档数量。
* **`namespace`**：（可选，默认为`""`）用于文档缓存的命名空间。有助于避免冲突（例如，将其设置为嵌入模型名称）。
* **`query_embedding_cache`**：（可选，默认为`None`）[⟦T76⟧](/oss/python/integrations/stores/)用于缓存查询嵌入，或`True`重用与`document_embedding_cache`相同的存储。

<Important>
  - 始终设置`namespace`参数以避免使用不同嵌入模型时发生冲突。
  - `CacheBackedEmbeddings` 默认情况下不缓存查询嵌入。要启用此功能，请指定`query_embedding_cache`。
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

在生产中，您通常会使用更强大的持久存储，例如数据库或云存储。请参阅[stores integrations](/oss/python/integrations/stores/)了解选项。

## 所有嵌入模型<div>
  |整合 |下载 |
  | :-------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
  | [⟦T82⟧](/oss/python/integrations/embeddings/azure_openai) | <span><a href="https://pypi.org/project/langchain-openai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T83⟧](/oss/python/integrations/embeddings/openai) | <span><a href="https://pypi.org/project/langchain-openai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T84⟧](/oss/python/integrations/embeddings/google_vertex_ai) | <span><a href="https://pypi.org/project/langchain-google-vertexai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T85⟧](/oss/python/integrations/embeddings/google_generative_ai) | <span><a href="https://pypi.org/project/langchain-google-genai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T86⟧](/oss/python/integrations/embeddings/bedrock) | <span><a href="https://pypi.org/project/langchain-aws/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T87⟧](/oss/python/integrations/embeddings/databricks) | <span><a href="https://pypi.org/project/databricks-langchain/"><img alt="Downloads per month" /></a></span>|
  | [⟦T88⟧](/oss/python/integrations/embeddings/ollama) | <span><a href="https://pypi.org/project/langchain-ollama/"><img alt="Downloads per month" /></a></span>|
  | [⟦T89⟧](/oss/python/integrations/embeddings/bge_huggingface) | <span><a href="https://pypi.org/project/langchain-huggingface/"><img alt="Downloads per month" /></a></span>|| [⟦T90⟧](/oss/python/integrations/embeddings/huggingfacehub) | <span><a href="https://pypi.org/project/langchain-huggingface/"><img alt="Downloads per month" /></a></span>|
  | [⟦T91⟧](/oss/python/integrations/embeddings/instruct_embeddings) | <span><a href="https://pypi.org/project/langchain-huggingface/"><img alt="Downloads per month" /></a></span>|
  | [⟦T92⟧](/oss/python/integrations/embeddings/sentence_transformers) | <span><a href="https://pypi.org/project/langchain-huggingface/"><img alt="Downloads per month" /></a></span>|
  | [⟦T93⟧](/oss/python/integrations/embeddings/text_embeddings_inference) | <span><a href="https://pypi.org/project/langchain-huggingface/"><img alt="Downloads per month" /></a></span>|
  | [⟦T94⟧](/oss/python/integrations/embeddings/fireworks) | <span><a href="https://pypi.org/project/langchain-fireworks/"><img alt="Downloads per month" /></a></span>|
  | [⟦T95⟧](/oss/python/integrations/embeddings/mistralai) | <span><a href="https://pypi.org/project/langchain-mistralai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T96⟧](/oss/python/integrations/embeddings/pinecone) | <span><a href="https://pypi.org/project/langchain-pinecone/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T97⟧](/oss/python/integrations/embeddings/cohere) | <span><a href="https://pypi.org/project/langchain-cohere/"><img alt="Downloads per month" /></a></span>|
  | [⟦T98⟧](/oss/python/integrations/embeddings/nvidia_ai_endpoints) | <span><a href="https://pypi.org/project/langchain-nvidia-ai-endpoints/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T99⟧](/oss/python/integrations/embeddings/ibm_watsonx) | <span><a href="https://pypi.org/project/langchain-ibm/"><img alt="Downloads per month" /></a></span>|
  | [⟦T100⟧](/oss/python/integrations/embeddings/perplexity) | <span><a href="https://pypi.org/project/langchain-perplexity/"><img alt="Downloads per month" /></a></span>|
  | [⟦T101⟧](/oss/python/integrations/embeddings/elasticsearch) | <span><a href="https://pypi.org/project/langchain-elasticsearch/"><img alt="Downloads per month" /></a></span>|
  | [⟦T102⟧](/oss/python/integrations/embeddings/oracleai) | <span><a href="https://pypi.org/project/langchain-oracledb/"><img alt="Downloads per month" /></a></span>|| [⟦T103⟧](/oss/python/integrations/embeddings/sambanova) | <span><a href="https://pypi.org/project/langchain-sambanova/"><img alt="Downloads per month" /></a></span>|
  | [⟦T104⟧](/oss/python/integrations/embeddings/oci_generative_ai) | <span><a href="https://pypi.org/project/langchain-oci/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T105⟧](/oss/python/integrations/embeddings/baseten) | <span><a href="https://pypi.org/project/langchain-baseten/"><img alt="Downloads per month" /></a></span>|
  | [⟦T106⟧](/oss/python/integrations/embeddings/together) | <span><a href="https://pypi.org/project/langchain-together/"><img alt="Downloads per month" /></a></span>|
  | [⟦T107⟧](/oss/python/integrations/embeddings/voyageai) | <span><a href="https://pypi.org/project/langchain-voyageai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T108⟧](/oss/python/integrations/embeddings/upstage) | <span><a href="https://pypi.org/project/langchain-upstage/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T109⟧](https://guide.ncloud-docs.com/docs/clovastudio-dev-langchain) | <span><a href="https://pypi.org/project/langchain-naver/"><img alt="Downloads per month" /></a></span>|
  | [⟦T110⟧](https://atlas.nomic.ai/) | <span><a href="https://pypi.org/project/langchain-nomic/">​​<img alt="Downloads per month" /></a></span>|
  | [⟦T111⟧](https://docs.tokenfactory.nebius.com/quickstart) | <span><a href="https://pypi.org/project/langchain-nebius/"><img alt="Downloads per month" /></a></span>|
  | [⟦T112⟧](https://developers.cloudflare.com/ai/models/#text-embeddings) | <span><a href="https://pypi.org/project/langchain-cloudflare/"><img alt="Downloads per month" /></a></span>|
  | [⟦T113⟧](https://localai.io/features/embeddings/index.html) | <span><a href="https://pypi.org/project/langchain-localai/"><img alt="Downloads per month" /></a></span>|| [⟦T114⟧](https://docs.aimlapi.com/) | <span><a href="https://pypi.org/project/langchain-aimlapi/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T115⟧](https://www.modelscope.cn/docs/sdk/pipelines) | <span><a href="https://pypi.org/project/langchain-modelscope-integration/"><img alt="Downloads per month" /></a></span>|
  | [⟦T116⟧](https://docs.doubleword.ai/inference-api/intro-to-doubleword-inference) | <span><a href="https://pypi.org/project/langchain-doubleword/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T117⟧](https://docs.predictionguard.com/api-reference/api-reference/embeddings) | <span><a href="https://pypi.org/project/langchain-predictionguard/"><img alt="Downloads per month" /></a></span>|
  | [⟦T118⟧](https://voxell.ai/forge) | <span><a href="https://pypi.org/project/langchain-voxell/"><img alt="Downloads per month" /></a></span>|
  | [⟦T119⟧](https://docs.empiriolabs.ai) | <span><a href="https://pypi.org/project/langchain-empiriolabs/"><img alt="Downloads per month" /></a></span>|
  | [⟦T120⟧](https://github.com/sbryngelson/langchain-aneforge) | <span><a href="https://pypi.org/project/langchain-aneforge/"><img alt="Downloads per month" /></a></span>|
  | [⟦T121⟧](https://github.com/Keirolabs-API/langchain-keiro) | <span><a href="https://pypi.org/project/langchain-keiro/"><img alt="Downloads per month" /></a></span>|
  | [⟦T122⟧](https://github.com/protagolabs/langchain-netmind) | <span><a href="https://pypi.org/project/langchain-netmind/"><img alt="Downloads per month" /></a></span>|
  | [⟦T123⟧](https://greennode.ai/) | <span><a href="https://pypi.org/project/langchain-greennode/"><img alt="Downloads per month" /></a></span>|
  | [⟦T124⟧](https://developers.telnyx.com/docs/inference/models) | <span><a href="https://pypi.org/project/langchain-telnyx/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T125⟧](https://isaacus.com/docs) | <span><a href="https://pypi.org/project/langchain-isaacus/"><img alt="Downloads per month" /></a></span>|| [⟦T126⟧](https://help.aliyun.com/en/lindorm/product-overview/product-introduction-overview) | <span><a href="https://pypi.org/project/langchain-lindorm-integration/"><img alt="Downloads per month" /></a></span>|
</div>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/embeddings/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>