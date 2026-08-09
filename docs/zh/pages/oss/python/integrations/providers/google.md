<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Google integrations | https://docs.langchain.com/oss/python/integrations/providers/google -->

# 谷歌集成

使用 LangChain Python 与 Google 集成。

本页面涵盖了 LangChain 与[Google Gemini](https://ai.google.dev/gemini-api/docs)、[Google Cloud](https://cloud.google.com/)以及其他 Google 产品（例如 Google 地图、YouTube 和[more](#other-google-products)）的所有集成。

<Note>
  **统一 SDK 和软件包整合**

  从 `langchain-google-genai` 4.0.0 开始，此软件包使用整合的 [⟦T23⟧](https://googleapis.github.io/python-genai/) SDK，现在支持 **Gemini Developer API 和 Vertex AI** 后端。

  `langchain-google-vertexai` 包仍然支持 Vertex AI 平台特定功能（模型花园、矢量搜索、评估服务等）。

  阅读[full announcement and migration guide](https://github.com/langchain-ai/langchain-google/discussions/1422)。
</Note>

不确定使用哪个包？

<AccordionGroup>
  <Accordion title="Google Generative AI (Gemini API & Vertex AI)">
    通过 **[Gemini Developer API](https://ai.google.dev/)** 或 **[Vertex AI](https://cloud.google.com/vertex-ai)** 访问 Google Gemini 模型。根据您的配置自动选择后端。

    * **Gemini Developer API**：使用 API 密钥快速设置，非常适合个人开发人员和快速原型设计
    * **Vertex AI**：与 Google Cloud 集成的企业功能（需要 GCP 项目）

    使用 `langchain-google-genai` 包进行聊天模型、LLM 和嵌入。

    [See integrations.](#google-generative-ai)
  </Accordion><Accordion title="Google Cloud (Vertex AI Platform Services)">
    访问 Gemini 模型之外的 Vertex AI 平台特定服务：Model Garden（Llama、Mistral、Anthropic）、评估服务和专业视觉模型。

    将 `langchain-google-vertexai` 包用于平台服务，将特定包（例如 `langchain-google-community`、`langchain-google-cloud-sql-pg`）用于其他云服务（例如数据库和存储）。

    [See integrations.](#google-cloud)
  </Accordion>
</AccordionGroup>

有关差异的更多详细信息，请参阅 Google 关于 [migrating from the Gemini API to Vertex AI](https://ai.google.dev/gemini-api/docs/migrate-to-cloud) 的指南。

***

## 谷歌生成人工智能

使用统一的 `langchain-google-genai` 包通过 [Gemini Developer API](https://ai.google.dev/gemini-api/docs) 或 [Vertex AI](https://cloud.google.com/vertex-ai) 访问 Google Gemini 模型。

### 聊天模型

<Columns>
  <Card title="ChatGoogleGenerativeAI" href="/oss/python/integrations/chat/google_generative_ai" icon="message">
    通过 **Gemini Developer API** 或 **Vertex AI** 的 Google Gemini 聊天模型。
  </Card>
</Columns>

### 法学硕士

<Columns>
  <Card title="GoogleGenerativeAI" href="/oss/python/integrations/llms/google_generative_ai" icon="cursor-text">
    Gemini 模型使用（传统）LLM 文本完成界面。
  </Card>
</Columns>

### 嵌入模型

<Columns>
  <Card title="GoogleGenerativeAIEmbeddings" href="/oss/python/integrations/embeddings/google_generative_ai" icon="stack-2">
    通过 **Gemini Developer API** 或 **Vertex AI** 嵌入模型。
  </Card>
</Columns>

***

## 谷歌云

访问 Vertex AI 平台特定服务，包括 Model Garden（Llama、Mistral、Anthropic）、矢量搜索、评估服务和专业视觉模型。<Note>
  **对于 Gemini 型号**，使用 `langchain-google-genai` 中的 [⟦T30⟧](/oss/python/integrations/chat/google_generative_ai)。以下课程重点介绍整合 SDK 中不提供的 **Vertex AI 平台服务**。
</Note>

### 聊天模型

<Columns>
  <Card title="ChatAnthropicVertex" icon="messages" href="/oss/python/integrations/chat/google_anthropic_vertex">
    Anthropic on Vertex AI 模型花园
  </Card>
</Columns>

<AccordionGroup>
  <Accordion title="ChatVertexAI (deprecated)">
    **已弃用**—对 Gemini 型号使用 [⟦T32⟧](/oss/python/integrations/chat/google_generative_ai)。

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai import ChatVertexAI
    ```
  </Accordion>

  <Accordion title="VertexModelGardenLlama">
    Vertex AI 模型花园上的 Llama

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.model_garden_maas.llama import VertexModelGardenLlama
    ```
  </Accordion>

  <Accordion title="VertexModelGardenMistral">
    Mistral 上的 Vertex AI 模型花园

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.model_garden_maas.mistral import VertexModelGardenMistral
    ```
  </Accordion>

  <Accordion title="GemmaChatLocalHF">
    从 HuggingFace 加载本地 Gemma 模型。

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.gemma import GemmaChatLocalHF
    ```
  </Accordion>

  <Accordion title="GemmaChatLocalKaggle">
    从 Kaggle 加载的本地 Gemma 模型。

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.gemma import GemmaChatLocalKaggle
    ```
  </Accordion>

  <Accordion title="GemmaChatVertexAIModelGarden">
    Gemma 谈 Vertex AI 模型花园

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.gemma import GemmaChatVertexAIModelGarden
    ```
  </Accordion>

  <Accordion title="VertexAIImageCaptioningChat">
    作为聊天界面的图像字幕模型。

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.vision_models import VertexAIImageCaptioningChat
    ```
  </Accordion>

  <Accordion title="VertexAIImageEditorChat">
    根据提示编辑图像。目前仅支持无遮罩编辑。

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.vision_models import VertexAIImageEditorChat
    ```
  </Accordion>

  <Accordion title="VertexAIImageGeneratorChat">
    根据提示生成图像。

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.vision_models import VertexAIImageGeneratorChat
    ```
  </Accordion>

  <Accordion title="VertexAIVisualQnAChat">
    作为聊天界面的视觉问答模型。

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.vision_models import VertexAIVisualQnAChat
    ```
  </Accordion>
</AccordionGroup>

### 法学硕士

（旧版）字符串输入、字符串输出 LLM 接口。

<Columns>
  <Card title="VertexAIModelGarden" icon="cursor-text" href="/oss/python/integrations/llms/google_vertex_ai#vertex-model-garden">
    通过 Vertex AI Model Garden 提供数百个 OSS 模型。
  </Card>
</Columns><AccordionGroup>
  <Accordion title="VertexAI (deprecated)">
    **已弃用**—对 Gemini 型号使用 [⟦T33⟧](/oss/python/integrations/llms/google_generative_ai)。

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai import VertexAI
    ```
  </Accordion>

  <Accordion title="Gemma local from Hugging Face">
    从 HuggingFace 加载本地 Gemma 模型。

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.gemma import GemmaLocalHF
    ```
  </Accordion>

  <Accordion title="Gemma local from Kaggle">
    从 Kaggle 加载的本地 Gemma 模型。

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.gemma import GemmaLocalKaggle
    ```
  </Accordion>

  <Accordion title="Gemma on Vertex AI Model Garden">
    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.gemma import GemmaVertexAIModelGarden
    ```
  </Accordion>

  <Accordion title="Vertex AI image captioning">
    作为 LLM 接口的图像字幕模型。

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.vision_models import VertexAIImageCaptioning
    ```
  </Accordion>
</AccordionGroup>

### 嵌入模型

<AccordionGroup>
  <Accordion title="VertexAIEmbeddings (deprecated)">
    **已弃用** - 使用 [⟦T34⟧](/oss/python/integrations/embeddings/google_generative_ai) 代替。

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai import VertexAIEmbeddings
    ```
  </Accordion>
</AccordionGroup>

### 文档加载器

<Columns>
  <Card title="AlloyDB for PostgreSQL" href="/oss/python/integrations/document_loaders/google_alloydb">
    Google Cloud 上兼容 PostgreSQL 的数据库。
  </Card>

  <Card title="BigQuery" href="/oss/python/integrations/document_loaders/google_bigquery">
    无服务器数据仓库。
  </Card>

  <Card title="Bigtable" href="/oss/python/integrations/document_loaders/google_bigtable">
    用于结构化和半结构化数据的键值和宽列存储。
  </Card>

  <Card title="Cloud SQL for MySQL" href="/oss/python/integrations/document_loaders/google_cloud_sql_mysql">
    托管 MySQL 数据库。
  </Card>

  <Card title="Cloud SQL for SQL Server" href="/oss/python/integrations/document_loaders/google_cloud_sql_mssql">
    托管 SQL Server 数据库。
  </Card>

  <Card title="Cloud SQL for PostgreSQL" href="https://cloud.google.com/sql/docs/postgres">
    托管 PostgreSQL 数据库。
  </Card>

  <Card title="Cloud Storage (directory)" href="/oss/python/integrations/document_loaders/google_cloud_storage_directory">
    从 GCS 存储桶目录加载文档。
  </Card>

  <Card title="Cloud Storage (file)" href="/oss/python/integrations/document_loaders/google_cloud_storage_file">
    从 GCS 加载单个文档。
  </Card>

  <Card title="El Carro for Oracle Workloads" href="https://github.com/googleapis/langchain-google-el-carro-python/">
    通过 El Carro 运行的 Kubernetes 上的 Oracle 数据库。
  </Card>

  <Card title="Firestore (Native Mode)" href="/oss/python/integrations/document_loaders/google_firestore">
    NoSQL 文档数据库。
  </Card>

  <Card title="Firestore (Datastore Mode)" href="/oss/python/integrations/document_loaders/google_datastore">
    数据存储模式下的 Firestore。
  </Card>

  <Card title="Memorystore for Redis" href="/oss/python/integrations/document_loaders/google_memorystore_redis">
    托管 Redis 服务。
  </Card><Card title="Spanner" href="/oss/python/integrations/document_loaders/google_spanner">
    全球分布式关系数据库。
  </Card>

  <Card title="Speech-to-Text" href="/oss/python/integrations/document_loaders/google_speech_to_text">
    转录音频文件。
  </Card>
</Columns>

<Accordion title="Cloud Vision loader">
  使用 Google Cloud Vision API 加载数据。

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain_google_community.vision import CloudVisionLoader
  ```
</Accordion>

### 文档转换器

<Columns>
  <Card title="Document AI" href="/oss/python/integrations/document_transformers/google_docai">
    从非结构化文档中提取结构化数据。
  </Card>

  <Card title="Google Translate" href="/oss/python/integrations/document_transformers/google_translate">
    通过 Cloud Translation API 翻译文本和 HTML。
  </Card>
</Columns>

### 矢量商店

使用 Google Cloud 数据库和 Vertex AI 矢量搜索存储和搜索矢量。

<Columns>
  <Card title="AlloyDB for PostgreSQL" href="/oss/python/integrations/vectorstores/google_alloydb">
    AlloyDB 上的 PostgreSQL 兼容矢量存储。
  </Card>

  <Card title="BigQuery Vector Search" href="/oss/python/integrations/vectorstores/google_bigquery_vector_search">
    使用 GoogleSQL 和向量索引进行语义搜索。
  </Card>

  <Card title="Memorystore for Redis" href="/oss/python/integrations/vectorstores/google_memorystore_redis">
    Redis 的 Memorystore 上的矢量存储。
  </Card>

  <Card title="Spanner" href="/oss/python/integrations/vectorstores/google_spanner">
    Cloud Spanner 上的矢量存储。
  </Card>

  <Card title="Bigtable" href="https://cloud.google.com/bigtable">
    Cloud Bigtable 上的矢量存储。
  </Card>

  <Card title="Firestore (Native Mode)" href="/oss/python/integrations/vectorstores/google_firestore">
    Firestore 上的矢量存储。
  </Card>

  <Card title="Cloud SQL for MySQL" href="/oss/python/integrations/vectorstores/google_cloud_sql_mysql">
    Cloud SQL for MySQL 上的向量存储。
  </Card>

  <Card title="Cloud SQL for PostgreSQL" href="/oss/python/integrations/vectorstores/google_cloud_sql_pg">
    Cloud SQL for PostgreSQL 上的向量存储。
  </Card><Card title="Vertex AI Vector Search" href="/oss/python/integrations/vectorstores/google_vertex_ai_vector_search">
    以前称为 Vertex AI 匹配引擎，提供低延迟矢量数据库。这些矢量数据库通常称为矢量相似性匹配或近似最近邻 (ANN) 服务。
  </Card>

  <Card title="Vertex AI Vector Search + Datastore" href="/oss/python/integrations/vectorstores/google_vertex_ai_vector_search#optional--you-can-also-create-vector-and-store-chunks-in-a-datastore">
    使用数据存储进行矢量搜索以进行文档存储。
  </Card>
</Columns>

### 猎犬

<Columns>
  <Card title="Vertex AI Search" icon="search" href="/oss/python/integrations/retrievers/google_vertex_ai_search">
    通过 Vertex AI Search 进行生成式 AI 支持的搜索。
  </Card>

  <Card title="Document AI Warehouse" icon="building-warehouse" href="https://cloud.google.com/document-ai-warehouse">
    使用 Document AI Warehouse 搜索、存储和管理文档。
  </Card>
</Columns>

```python Other retrievers theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_google_community import VertexAIMultiTurnSearchRetriever
from langchain_google_community import VertexAISearchRetriever
from langchain_google_community import VertexAISearchSummaryTool
```

### 工具

将代理与各种 Google Cloud 服务集成。

<Columns>
  <Card title="Text-to-Speech" icon="volume" href="/oss/python/integrations/tools/google_cloud_texttospeech">
    使用 100 多种声音合成听起来自然的语音。
  </Card>
</Columns>

### 回调

跟踪 LLM/Chat 模型的使用情况。

<AccordionGroup>
  <Accordion title="Vertex AI callback handler">
    跟踪`VertexAI`使用信息。

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.callbacks import VertexAICallbackHandler
    ```
  </Accordion>

  <Accordion title="Google BigQuery">
    更多详情请参阅[documentation](/oss/python/integrations/callbacks/google_bigquery)。

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_community.callbacks.bigquery_callback import BigQueryCallbackHandler
    ```
  </Accordion>
</AccordionGroup>

### 评估者

使用 Vertex AI 评估模型输出。

<AccordionGroup>
  <Accordion title="VertexPairWiseStringEvaluator">
    使用 Vertex AI 模型进行配对评估。

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.evaluators.evaluation import VertexPairWiseStringEvaluator
    ```
  </Accordion>

  <Accordion title="VertexStringEvaluator">
    使用 Vertex AI 模型进行单一预测评估。

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.evaluators.evaluation import VertexStringEvaluator
    ```
  </Accordion>
</AccordionGroup>

***

## 其他 Google 产品

与核心云平台之外的各种 Google 服务集成。### 文档加载器

<Columns>
  <Card title="Google Drive" href="/oss/python/integrations/document_loaders/google_drive">
    从 Google 云端硬盘加载文件。目前支持 Google 文档。
  </Card>
</Columns>

### 猎犬

<Columns>
  <Card title="Google Drive" href="/oss/python/integrations/retrievers/google_drive">
    从 Google 云端硬盘检索文档。
  </Card>
</Columns>

### 工具

<Columns>
  <Card title="Google Search" href="/oss/python/integrations/tools/google_search">
    通过 Google 自定义搜索引擎 (CSE) 进行网络搜索。
  </Card>

  <Card title="Google Drive" href="/oss/python/integrations/tools/google_drive">
    与 Google 云端硬盘交互。
  </Card>
</Columns>

### MCP

<Columns>
  <Card title="MCP Toolbox" href="/oss/python/integrations/tools/mcp_toolbox">
    连接到数据库，包括 Cloud SQL 和 AlloyDB。
  </Card>
</Columns>

### 工具包

<Columns>
  <Card title="Gmail" icon="mail" href="/oss/python/integrations/tools/google_gmail">
    通过 Gmail API 创建、搜索和发送电子邮件。
  </Card>
</Columns>

***

## 第 3 方集成

通过非官方第三方 API 访问 Google 服务。

### 搜索

<Columns>
  <Card title="cloro" icon="search" href="https://docs.cloro.dev">
    具有 AI 概述支持的 Google 搜索结果。
  </Card>
</Columns>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/google.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>