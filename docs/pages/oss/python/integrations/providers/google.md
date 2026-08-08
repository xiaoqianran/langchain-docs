<!-- langchain-docs: Google integrations | https://docs.langchain.com/oss/python/integrations/providers/google -->

# Google integrations

Integrate with Google using LangChain Python.

This page covers all LangChain integrations with [Google Gemini](https://ai.google.dev/gemini-api/docs), [Google Cloud](https://cloud.google.com/), and other Google products (such as Google Maps, YouTube, and [more](#other-google-products)).

<Note>
  **Unified SDK & package consolidation**

  As of `langchain-google-genai` 4.0.0, this package uses the consolidated [`google-genai`](https://googleapis.github.io/python-genai/) SDK and now supports **both the Gemini Developer API and Vertex AI** backends.

  The `langchain-google-vertexai` package remains supported for Vertex AI platform-specific features (Model Garden, Vector Search, evaluation services, etc.).

  Read the [full announcement and migration guide](https://github.com/langchain-ai/langchain-google/discussions/1422).
</Note>

Not sure which package to use?

<AccordionGroup>
  <Accordion title="Google Generative AI (Gemini API & Vertex AI)">
    Access Google Gemini models via the **[Gemini Developer API](https://ai.google.dev/)** or **[Vertex AI](https://cloud.google.com/vertex-ai)**. The backend is selected automatically based on your configuration.

    * **Gemini Developer API**: Quick setup with API key, ideal for individual developers and rapid prototyping
    * **Vertex AI**: Enterprise features with Google Cloud integration (requires GCP project)

    Use the `langchain-google-genai` package for chat models, LLMs, and embeddings.

    [See integrations.](#google-generative-ai)
  </Accordion>

  <Accordion title="Google Cloud (Vertex AI Platform Services)">
    Access Vertex AI platform-specific services beyond Gemini models: Model Garden (Llama, Mistral, Anthropic), evaluation services, and specialized vision models.

    Use the `langchain-google-vertexai` package for platform services and specific packages (e.g., `langchain-google-community`, `langchain-google-cloud-sql-pg`) for other cloud services like databases and storage.

    [See integrations.](#google-cloud)
  </Accordion>
</AccordionGroup>

See Google's guide on [migrating from the Gemini API to Vertex AI](https://ai.google.dev/gemini-api/docs/migrate-to-cloud) for more details on the differences.

***

## Google Generative AI

Access Google Gemini models via the [Gemini Developer API](https://ai.google.dev/gemini-api/docs) or [Vertex AI](https://cloud.google.com/vertex-ai) using the unified `langchain-google-genai` package.

### Chat models

<Columns>
  <Card title="ChatGoogleGenerativeAI" href="/oss/python/integrations/chat/google_generative_ai" icon="message">
    Google Gemini chat models via **Gemini Developer API** or **Vertex AI**.
  </Card>
</Columns>

### LLMs

<Columns>
  <Card title="GoogleGenerativeAI" href="/oss/python/integrations/llms/google_generative_ai" icon="cursor-text">
    Gemini models using the (legacy) LLM text completion interface.
  </Card>
</Columns>

### Embedding models

<Columns>
  <Card title="GoogleGenerativeAIEmbeddings" href="/oss/python/integrations/embeddings/google_generative_ai" icon="stack-2">
    Gemini embedding models via **Gemini Developer API** or **Vertex AI**.
  </Card>
</Columns>

***

## Google Cloud

Access Vertex AI platform-specific services including Model Garden (Llama, Mistral, Anthropic), Vector Search, evaluation services, and specialized vision models.

<Note>
  **For Gemini models**, use [`ChatGoogleGenerativeAI`](/oss/python/integrations/chat/google_generative_ai) from `langchain-google-genai`. The classes below focus on **Vertex AI platform services** not available in the consolidated SDK.
</Note>

### Chat models

<Columns>
  <Card title="ChatAnthropicVertex" icon="messages" href="/oss/python/integrations/chat/google_anthropic_vertex">
    Anthropic on Vertex AI Model Garden
  </Card>
</Columns>

<AccordionGroup>
  <Accordion title="ChatVertexAI (deprecated)">
    **Deprecated**—Use [`ChatGoogleGenerativeAI`](/oss/python/integrations/chat/google_generative_ai) for Gemini models instead.

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai import ChatVertexAI
    ```
  </Accordion>

  <Accordion title="VertexModelGardenLlama">
    Llama on Vertex AI Model Garden

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.model_garden_maas.llama import VertexModelGardenLlama
    ```
  </Accordion>

  <Accordion title="VertexModelGardenMistral">
    Mistral on Vertex AI Model Garden

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.model_garden_maas.mistral import VertexModelGardenMistral
    ```
  </Accordion>

  <Accordion title="GemmaChatLocalHF">
    Local Gemma model loaded from HuggingFace.

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.gemma import GemmaChatLocalHF
    ```
  </Accordion>

  <Accordion title="GemmaChatLocalKaggle">
    Local Gemma model loaded from Kaggle.

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.gemma import GemmaChatLocalKaggle
    ```
  </Accordion>

  <Accordion title="GemmaChatVertexAIModelGarden">
    Gemma on Vertex AI Model Garden

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.gemma import GemmaChatVertexAIModelGarden
    ```
  </Accordion>

  <Accordion title="VertexAIImageCaptioningChat">
    Image captioning model as a chat interface.

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.vision_models import VertexAIImageCaptioningChat
    ```
  </Accordion>

  <Accordion title="VertexAIImageEditorChat">
    Edit images given a prompt. Currently supports mask-free editing only.

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.vision_models import VertexAIImageEditorChat
    ```
  </Accordion>

  <Accordion title="VertexAIImageGeneratorChat">
    Generate images from a prompt.

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.vision_models import VertexAIImageGeneratorChat
    ```
  </Accordion>

  <Accordion title="VertexAIVisualQnAChat">
    Visual question answering model as a chat interface.

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.vision_models import VertexAIVisualQnAChat
    ```
  </Accordion>
</AccordionGroup>

### LLMs

(Legacy) string-in, string-out LLM interface.

<Columns>
  <Card title="VertexAIModelGarden" icon="cursor-text" href="/oss/python/integrations/llms/google_vertex_ai#vertex-model-garden">
    Hundreds of OSS models via Vertex AI Model Garden.
  </Card>
</Columns>

<AccordionGroup>
  <Accordion title="VertexAI (deprecated)">
    **Deprecated**—Use [`GoogleGenerativeAI`](/oss/python/integrations/llms/google_generative_ai) for Gemini models instead.

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai import VertexAI
    ```
  </Accordion>

  <Accordion title="Gemma local from Hugging Face">
    Local Gemma model loaded from HuggingFace.

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.gemma import GemmaLocalHF
    ```
  </Accordion>

  <Accordion title="Gemma local from Kaggle">
    Local Gemma model loaded from Kaggle.

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
    Image captioning model as an LLM interface.

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.vision_models import VertexAIImageCaptioning
    ```
  </Accordion>
</AccordionGroup>

### Embedding models

<AccordionGroup>
  <Accordion title="VertexAIEmbeddings (deprecated)">
    **Deprecated**—Use [`GoogleGenerativeAIEmbeddings`](/oss/python/integrations/embeddings/google_generative_ai) instead.

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai import VertexAIEmbeddings
    ```
  </Accordion>
</AccordionGroup>

### Document loaders

<Columns>
  <Card title="AlloyDB for PostgreSQL" href="/oss/python/integrations/document_loaders/google_alloydb">
    PostgreSQL-compatible database on Google Cloud.
  </Card>

  <Card title="BigQuery" href="/oss/python/integrations/document_loaders/google_bigquery">
    Serverless data warehouse.
  </Card>

  <Card title="Bigtable" href="/oss/python/integrations/document_loaders/google_bigtable">
    Key-value and wide-column store for structured and semi-structured data.
  </Card>

  <Card title="Cloud SQL for MySQL" href="/oss/python/integrations/document_loaders/google_cloud_sql_mysql">
    Managed MySQL database.
  </Card>

  <Card title="Cloud SQL for SQL Server" href="/oss/python/integrations/document_loaders/google_cloud_sql_mssql">
    Managed SQL Server database.
  </Card>

  <Card title="Cloud SQL for PostgreSQL" href="https://cloud.google.com/sql/docs/postgres">
    Managed PostgreSQL database.
  </Card>

  <Card title="Cloud Storage (directory)" href="/oss/python/integrations/document_loaders/google_cloud_storage_directory">
    Load documents from a GCS bucket directory.
  </Card>

  <Card title="Cloud Storage (file)" href="/oss/python/integrations/document_loaders/google_cloud_storage_file">
    Load a single document from GCS.
  </Card>

  <Card title="El Carro for Oracle Workloads" href="https://github.com/googleapis/langchain-google-el-carro-python/">
    Oracle databases on Kubernetes via El Carro.
  </Card>

  <Card title="Firestore (Native Mode)" href="/oss/python/integrations/document_loaders/google_firestore">
    NoSQL document database.
  </Card>

  <Card title="Firestore (Datastore Mode)" href="/oss/python/integrations/document_loaders/google_datastore">
    Firestore in Datastore mode.
  </Card>

  <Card title="Memorystore for Redis" href="/oss/python/integrations/document_loaders/google_memorystore_redis">
    Managed Redis service.
  </Card>

  <Card title="Spanner" href="/oss/python/integrations/document_loaders/google_spanner">
    Globally distributed relational database.
  </Card>

  <Card title="Speech-to-Text" href="/oss/python/integrations/document_loaders/google_speech_to_text">
    Transcribe audio files.
  </Card>
</Columns>

<Accordion title="Cloud Vision loader">
  Load data using Google Cloud Vision API.

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain_google_community.vision import CloudVisionLoader
  ```
</Accordion>

### Document transformers

<Columns>
  <Card title="Document AI" href="/oss/python/integrations/document_transformers/google_docai">
    Extract structured data from unstructured documents.
  </Card>

  <Card title="Google Translate" href="/oss/python/integrations/document_transformers/google_translate">
    Translate text and HTML via Cloud Translation API.
  </Card>
</Columns>

### Vector stores

Store and search vectors using Google Cloud databases and Vertex AI Vector Search.

<Columns>
  <Card title="AlloyDB for PostgreSQL" href="/oss/python/integrations/vectorstores/google_alloydb">
    PostgreSQL-compatible vector store on AlloyDB.
  </Card>

  <Card title="BigQuery Vector Search" href="/oss/python/integrations/vectorstores/google_bigquery_vector_search">
    Semantic search using GoogleSQL with vector indexes.
  </Card>

  <Card title="Memorystore for Redis" href="/oss/python/integrations/vectorstores/google_memorystore_redis">
    Vector store on Memorystore for Redis.
  </Card>

  <Card title="Spanner" href="/oss/python/integrations/vectorstores/google_spanner">
    Vector store on Cloud Spanner.
  </Card>

  <Card title="Bigtable" href="https://cloud.google.com/bigtable">
    Vector store on Cloud Bigtable.
  </Card>

  <Card title="Firestore (Native Mode)" href="/oss/python/integrations/vectorstores/google_firestore">
    Vector store on Firestore.
  </Card>

  <Card title="Cloud SQL for MySQL" href="/oss/python/integrations/vectorstores/google_cloud_sql_mysql">
    Vector store on Cloud SQL for MySQL.
  </Card>

  <Card title="Cloud SQL for PostgreSQL" href="/oss/python/integrations/vectorstores/google_cloud_sql_pg">
    Vector store on Cloud SQL for PostgreSQL.
  </Card>

  <Card title="Vertex AI Vector Search" href="/oss/python/integrations/vectorstores/google_vertex_ai_vector_search">
    Formerly known as Vertex AI Matching Engine, provides a low latency vector database. These vector databases are commonly referred to as vector similarity-matching or an approximate nearest neighbor (ANN) service.
  </Card>

  <Card title="Vertex AI Vector Search + Datastore" href="/oss/python/integrations/vectorstores/google_vertex_ai_vector_search#optional--you-can-also-create-vector-and-store-chunks-in-a-datastore">
    Vector search with Datastore for document storage.
  </Card>
</Columns>

### Retrievers

<Columns>
  <Card title="Vertex AI Search" icon="search" href="/oss/python/integrations/retrievers/google_vertex_ai_search">
    Generative AI powered search via Vertex AI Search.
  </Card>

  <Card title="Document AI Warehouse" icon="building-warehouse" href="https://cloud.google.com/document-ai-warehouse">
    Search, store, and manage documents using Document AI Warehouse.
  </Card>
</Columns>

```python Other retrievers theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_google_community import VertexAIMultiTurnSearchRetriever
from langchain_google_community import VertexAISearchRetriever
from langchain_google_community import VertexAISearchSummaryTool
```

### Tools

Integrate agents with various Google Cloud services.

<Columns>
  <Card title="Text-to-Speech" icon="volume" href="/oss/python/integrations/tools/google_cloud_texttospeech">
    Synthesize natural-sounding speech with 100+ voices.
  </Card>
</Columns>

### Callbacks

Track LLM/Chat model usage.

<AccordionGroup>
  <Accordion title="Vertex AI callback handler">
    Track `VertexAI` usage info.

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.callbacks import VertexAICallbackHandler
    ```
  </Accordion>

  <Accordion title="Google BigQuery">
    See the [documentation](/oss/python/integrations/callbacks/google_bigquery) for more details.

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_community.callbacks.bigquery_callback import BigQueryCallbackHandler
    ```
  </Accordion>
</AccordionGroup>

### Evaluators

Evaluate model outputs using Vertex AI.

<AccordionGroup>
  <Accordion title="VertexPairWiseStringEvaluator">
    Pair-wise evaluation using Vertex AI models.

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.evaluators.evaluation import VertexPairWiseStringEvaluator
    ```
  </Accordion>

  <Accordion title="VertexStringEvaluator">
    Single prediction evaluation using Vertex AI models.

    ```python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_google_vertexai.evaluators.evaluation import VertexStringEvaluator
    ```
  </Accordion>
</AccordionGroup>

***

## Other Google products

Integrations with various Google services beyond the core Cloud Platform.

### Document loaders

<Columns>
  <Card title="Google Drive" href="/oss/python/integrations/document_loaders/google_drive">
    Load files from Google Drive. Currently supports Google Docs.
  </Card>
</Columns>

### Retrievers

<Columns>
  <Card title="Google Drive" href="/oss/python/integrations/retrievers/google_drive">
    Retrieve documents from Google Drive.
  </Card>
</Columns>

### Tools

<Columns>
  <Card title="Google Search" href="/oss/python/integrations/tools/google_search">
    Web search via Google Custom Search Engine (CSE).
  </Card>

  <Card title="Google Drive" href="/oss/python/integrations/tools/google_drive">
    Interact with Google Drive.
  </Card>
</Columns>

### MCP

<Columns>
  <Card title="MCP Toolbox" href="/oss/python/integrations/tools/mcp_toolbox">
    Connect to databases including Cloud SQL and AlloyDB.
  </Card>
</Columns>

### Toolkits

<Columns>
  <Card title="Gmail" icon="mail" href="/oss/python/integrations/tools/google_gmail">
    Create, search, and send emails via the Gmail API.
  </Card>
</Columns>

***

## 3rd party integrations

Access Google services via unofficial third-party APIs.

### Search

<Columns>
  <Card title="cloro" icon="search" href="https://docs.cloro.dev">
    Google Search results with AI Overview support.
  </Card>
</Columns>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/google.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>