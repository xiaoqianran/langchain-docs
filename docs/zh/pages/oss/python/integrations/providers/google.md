<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Google integrations | https://docs.langchain.com/oss/python/integrations/providers/google -->

# 谷歌集成

使用 LangChain Python 与 Google 集成。

本页面涵盖了 LangChain 与 [Google Gemini](https://ai.google.dev/gemini-api/docs)、[Google Cloud](https://cloud.google.com/) 以及其他 Google 产品（例如 Google 地图、YouTube 和 [more](#other-google-products)）的集成。

> [!注意]
>
> **统一 SDK 和软件包整合**
>
> 从 `langchain-google-genai` 4.0.0 开始，此软件包使用整合的 [⟦T23⟧](https://googleapis.github.io/python-genai/) SDK，现在支持 **Gemini Developer API 和 Gemini Enterprise Agent Platform** 后端。
>
> `langchain-google-vertexai` 软件包仍然支持 Gemini Enterprise Agent Platform 特定功能（模型花园、矢量搜索、评估服务等）。
>
> 阅读[full announcement and migration guide](https://github.com/langchain-ai/langchain-google/discussions/1422)。

不确定使用哪个包？

> **Google 生成式 AI（Gemini API 和 Gemini 企业代理平台）**
>
> 通过 **[Gemini Developer API](https://ai.google.dev/)** 或 **[Gemini Enterprise Agent Platform](https://cloud.google.com/products/gemini-enterprise-agent-platform)** 访问 Google Gemini 模型。根据您的配置自动选择后端。
>
> * **Gemini Developer API**：使用 API 密钥快速设置，非常适合个人开发人员和快速原型设计
> * **Gemini Enterprise Agent Platform**：与 Google Cloud 集成的企业功能（需要 GCP 项目）
>
> 使用 `langchain-google-genai` 包进行聊天模型、LLM 和嵌入。
>
> [See integrations.](#google-generative-ai)> **Google Cloud（Gemini 企业代理平台服务）**
>
> 访问 Gemini 模型之外的 Gemini 企业代理平台特定服务：Model Garden（Llama、Mistral、Anthropic）、评估服务和专业视觉模型。
>
> 对平台服务使用 `langchain-google-vertexai` 软件包，对数据库和存储等其他云服务使用特定软件包（例如 `langchain-google-community`、`langchain-google-cloud-sql-pg`）。
>
> [See integrations.](#google-cloud)

有关差异的更多详细信息，请参阅 Google 关于 [migrating from the Gemini API to Gemini Enterprise Agent Platform](https://ai.google.dev/gemini-api/docs/migrate-to-cloud) 的指南。

***

## 谷歌生成人工智能

使用统一的 `langchain-google-genai` 包通过 [Gemini Developer API](https://ai.google.dev/gemini-api/docs) 或 [Gemini Enterprise Agent Platform](https://cloud.google.com/products/gemini-enterprise-agent-platform) 访问 Google Gemini 模型。

### 聊天模型

> **[ChatGoogleGenerativeAI](/oss/python/integrations/chat/google_generative_ai)**
>
> 通过 **Gemini Developer API** 或 **Gemini Enterprise Agent Platform** 建立 Google Gemini 聊天模型。

### 法学硕士

> **[GoogleGenerativeAI](/oss/python/integrations/llms/google_generative_ai)**
>
> 使用（传统）LLM 文本完成界面的 Gemini 模型。

### 嵌入模型

> **[GoogleGenerativeAIEmbeddings](/oss/python/integrations/embeddings/google_generative_ai)**
>
> 通过 **Gemini Developer API** 或 **Gemini Enterprise Agent Platform** 嵌入模型。

***

## 谷歌云

访问 Gemini 企业代理平台特定服务，包括 Model Garden（Llama、Mistral、Anthropic）、矢量搜索、评估服务和专业视觉模型。> [!注意]
>
> **对于 Gemini 型号**，使用 `langchain-google-genai` 中的 [⟦T30⟧](/oss/python/integrations/chat/google_generative_ai)。以下课程重点关注整合 SDK 中不提供的 **Gemini Enterprise Agent Platform 服务**。

### 聊天模型

> **[ChatAnthropicVertex](/oss/python/integrations/chat/google_anthropic_vertex)**
>
> Anthropic on Gemini 企业代理平台模型园

> **ChatVertexAI（已弃用）**
>
> **已弃用** - 对 Gemini 型号使用 [⟦T32⟧](/oss/python/integrations/chat/google_generative_ai)。
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai import ChatVertexAI
> ```

> **VertexModelGardenLlama**
>
> Gemini企业代理平台模型园上的Llama
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai.model_garden_maas.llama import VertexModelGardenLlama
> ```

> **顶点模型花园米斯特拉尔**
>
> Gemini 企业代理平台模型花园上的 Mistral
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai.model_garden_maas.mistral import VertexModelGardenMistral
> ```

> **GemmaChatLocalHF**
>
> 从 HuggingFace 加载本地 Gemma 模型。
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai.gemma import GemmaChatLocalHF
> ```

> **GemmaChatLocalKaggle**
>
> 从 Kaggle 加载本地 Gemma 模型。
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai.gemma import GemmaChatLocalKaggle
> ```

> **GemmaChatVertexAIModelGarden**
>
> Gemma谈Gemini企业代理平台模型园
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai.gemma import GemmaChatVertexAIModelGarden
> ```

> **VertexAIImageCaptioningChat**
>
> 作为聊天界面的图像字幕模型。
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai.vision_models import VertexAIImageCaptioningChat
> ```

> **VertexAIImageEditor聊天**
>
> 根据提示编辑图像。目前仅支持无遮罩编辑。
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai.vision_models import VertexAIImageEditorChat
> ```

> **VertexAIImageGenerator聊天**
>
> 根据提示生成图像。
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai.vision_models import VertexAIImageGeneratorChat
> ```> **VertexAIVisualQnAChat**
>
> 作为聊天界面的可视化问答模型。
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai.vision_models import VertexAIVisualQnAChat
> ```

### 法学硕士

（旧版）字符串输入、字符串输出 LLM 接口。

> **[VertexAIModelGarden](/oss/python/integrations/llms/google_vertex_ai#vertex-model-garden)**
>
> 通过 Gemini Enterprise Agent Platform Model Garden 提供数百个 OSS 模型。

> **VertexAI（已弃用）**
>
> **已弃用** - 对 Gemini 型号使用 [⟦T33⟧](/oss/python/integrations/llms/google_generative_ai)。
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai import VertexAI
> ```

> **Gemma 本地来自 Hugging Face**
>
> 从 HuggingFace 加载本地 Gemma 模型。
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai.gemma import GemmaLocalHF
> ```

> **来自 Kaggle 的本地 Gemma**
>
> 从 Kaggle 加载本地 Gemma 模型。
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai.gemma import GemmaLocalKaggle
> ```

> **Gemma 上 Gemini 企业代理平台模型花园**
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai.gemma import GemmaVertexAIModelGarden
> ```

> **Gemini 企业代理平台图像字幕**
>
> 作为 LLM 接口的图像字幕模型。
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai.vision_models import VertexAIImageCaptioning
> ```

### 嵌入模型

> **VertexAIEmbeddings（已弃用）**
>
> **已弃用** - 使用 [⟦T34⟧](/oss/python/integrations/embeddings/google_generative_ai) 代替。
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai import VertexAIEmbeddings
> ```

### 文档加载器

> **[AlloyDB for PostgreSQL](/oss/python/integrations/document_loaders/google_alloydb)**
>
> Google Cloud 上的 PostgreSQL 兼容数据库。

> **[BigQuery](/oss/python/integrations/document_loaders/google_bigquery)**
>
> 无服务器数据仓库。

> **[Bigtable](/oss/python/integrations/document_loaders/google_bigtable)**
>
> 用于结构化和半结构化数据的键值和宽列存储。

> **[Cloud SQL for MySQL](/oss/python/integrations/document_loaders/google_cloud_sql_mysql)**
>
> 托管 MySQL 数据库。

> **[Cloud SQL for SQL Server](/oss/python/integrations/document_loaders/google_cloud_sql_mssql)**
>
> 托管 SQL Server 数据库。

> **[Cloud SQL for PostgreSQL](https://cloud.google.com/sql/docs/postgres)**
>
> 托管 PostgreSQL 数据库。> **[Cloud Storage (directory)](/oss/python/integrations/document_loaders/google_cloud_storage_directory)**
>
> 从 GCS 存储桶目录加载文档。

> **[Cloud Storage (file)](/oss/python/integrations/document_loaders/google_cloud_storage_file)**
>
> 从 GCS 加载单个文档。

> **[El Carro for Oracle Workloads](https://github.com/googleapis/langchain-google-el-carro-python/)**
>
> 通过 El Carro 运行的 Kubernetes 上的 Oracle 数据库。

> **[Firestore (Native Mode)](/oss/python/integrations/document_loaders/google_firestore)**
>
> NoSQL 文档数据库。

> **[Firestore (Datastore Mode)](/oss/python/integrations/document_loaders/google_datastore)**
>
> Firestore 处于数据存储模式。

> **[Memorystore for Redis](/oss/python/integrations/document_loaders/google_memorystore_redis)**
>
> 托管 Redis 服务。

> **[Spanner](/oss/python/integrations/document_loaders/google_spanner)**
>
> 全球分布式关系数据库。

> **[Speech-to-Text](/oss/python/integrations/document_loaders/google_speech_to_text)**
>
> 转录音频文件。

> **云视觉加载器**
>
> 使用 Google Cloud Vision API 加载数据。
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_community.vision import CloudVisionLoader
> ```

### 文档转换器

> **[Document AI](/oss/python/integrations/document_transformers/google_docai)**
>
> 从非结构化文档中提取结构化数据。

> **[Google Translate](/oss/python/integrations/document_transformers/google_translate)**
>
> 通过 Cloud Translation API 翻译文本和 HTML。

### 矢量商店

使用 Google Cloud 数据库和 Gemini Enterprise Agent Platform 上的矢量搜索来存储和搜索矢量。

> **[AlloyDB for PostgreSQL](/oss/python/integrations/vectorstores/google_alloydb)**
>
> AlloyDB 上兼容 PostgreSQL 的矢量存储。

> **[BigQuery Vector Search](/oss/python/integrations/vectorstores/google_bigquery_vector_search)**
>
> 使用 GoogleSQL 和向量索引进行语义搜索。

> **[Memorystore for Redis](/oss/python/integrations/vectorstores/google_memorystore_redis)**
>
> 用于 Redis 的 Memorystore 上的矢量存储。

> **[Spanner](/oss/python/integrations/vectorstores/google_spanner)**
>
> Cloud Spanner 上的矢量存储。

> **[Bigtable](https://cloud.google.com/bigtable)**
>
> Cloud Bigtable 上的矢量存储。

> **[Firestore (Native Mode)](/oss/python/integrations/vectorstores/google_firestore)**
>
> Firestore 上的矢量存储。

> **[Cloud SQL for MySQL](/oss/python/integrations/vectorstores/google_cloud_sql_mysql)**
>
> Cloud SQL for MySQL 上的向量存储。> **[Cloud SQL for PostgreSQL](/oss/python/integrations/vectorstores/google_cloud_sql_pg)**
>
> Cloud SQL for PostgreSQL 上的向量存储。

> **[Vector Search on Gemini Enterprise Agent Platform](/oss/python/integrations/vectorstores/google_vertex_ai_vector_search)**
>
> 以前称为 Vertex AI 匹配引擎，提供低延迟矢量数据库。这些矢量数据库通常称为矢量相似性匹配或近似最近邻 (ANN) 服务。

> **[Vector Search on Gemini Enterprise Agent Platform + Datastore](/oss/python/integrations/vectorstores/google_vertex_ai_vector_search#optional--you-can-also-create-vector-and-store-chunks-in-a-datastore)**
>
> 使用数据存储进行矢量搜索以进行文档存储。

### 猎犬

> **[Agent Search on Gemini Enterprise Agent Platform](/oss/python/integrations/retrievers/google_vertex_ai_search)**
>
> 通过 Gemini Enterprise Agent Platform 上的 Agent Search 进行生成式 AI 支持的搜索。

> **[Document AI Warehouse](https://cloud.google.com/document-ai-warehouse)**
>
> 使用 Document AI Warehouse 搜索、存储和管理文档。

```python Other retrievers theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_google_community import VertexAIMultiTurnSearchRetriever
from langchain_google_community import VertexAISearchRetriever
from langchain_google_community import VertexAISearchSummaryTool
```

### 工具

将代理与各种 Google Cloud 服务集成。

> **[Text-to-Speech](/oss/python/integrations/tools/google_cloud_texttospeech)**
>
> 用 100 多种声音合成听起来自然的语音。

### 回调

跟踪 LLM/Chat 模型的使用情况。

> **Gemini 企业代理平台回调处理程序**
>
> 跟踪`VertexAI`使用信息。
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai.callbacks import VertexAICallbackHandler
> ```

> **谷歌 BigQuery**
>
> 更多详情请参阅[documentation](/oss/python/integrations/callbacks/google_bigquery)。
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_community.callbacks.bigquery_callback import BigQueryCallbackHandler
> ```

### 评估者

使用 Gemini Enterprise Agent Platform 评估模型输出。

> **VertexPairWiseStringEvaluator**
>
> 使用 Gemini Enterprise Agent Platform 模型进行配对评估。
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai.evaluators.evaluation import VertexPairWiseStringEvaluator
> ```> **顶点字符串评估器**
>
> 使用 Gemini Enterprise Agent Platform 模型进行单一预测评估。
>
> ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain_google_vertexai.evaluators.evaluation import VertexStringEvaluator
> ```

***

## 其他 Google 产品

与核心云平台之外的各种 Google 服务集成。

### 文档加载器

> **[Google Drive](/oss/python/integrations/document_loaders/google_drive)**
>
> 从 Google 云端硬盘加载文件。 Currently supports Google Docs.

### 猎犬

> **[Google Drive](/oss/python/integrations/retrievers/google_drive)**
>
> Retrieve documents from Google Drive.

### 工具

> **[Google Search](/oss/python/integrations/tools/google_search)**
>
> 通过 Google 自定义搜索引擎 (CSE) 进行网络搜索。

> **[Google Drive](/oss/python/integrations/tools/google_drive)**
>
> Interact with Google Drive.

### MCP

> **[MCP Toolbox](/oss/python/integrations/tools/mcp_toolbox)**
>
> 连接到数据库，包括 Cloud SQL 和 AlloyDB。

### 工具包

> **[Gmail](/oss/python/integrations/tools/google_gmail)**
>
> 通过 Gmail API 创建、搜索和发送电子邮件。

***

## 3rd party integrations

通过非官方第三方 API 访问 Google 服务。

### 搜索

> **[cloro](https://cloro.dev/docs)**
>
> 支持 AI 概述的 Google 搜索结果。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/google.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。