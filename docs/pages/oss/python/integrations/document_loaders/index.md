<!-- langchain-docs: Document loader integrations | https://docs.langchain.com/oss/python/integrations/document_loaders/index -->

# Document loader integrations

Integrate with document loaders using LangChain Python.

Document loaders provide a **standard interface** for reading data from different sources (such as Slack, Notion, or Google Drive) into LangChain’s [Document](https://reference.langchain.com/python/langchain-core/documents/base/Document) format.
This ensures that data can be handled consistently regardless of the source.

All document loaders implement the [`BaseLoader`](https://reference.langchain.com/python/langchain-core/document_loaders/base/BaseLoader) interface.

<Warning>
  Community document loaders are user-contributed and unverified. LangChain does not review or endorse these integrations; use them at your own risk.
</Warning>

## Interface

Each document loader may define its own parameters, but they share a common API:

* `load()`: Loads all documents at once.
* `lazy_load()`: Streams documents lazily, useful for large datasets.

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_docling.loader import DoclingLoader

FILE_PATH = "https://arxiv.org/pdf/2408.09869"

loader = DoclingLoader(file_path=FILE_PATH)

# Load all documents
documents = loader.load()

# For large datasets, lazily load documents
for document in loader.lazy_load():
    print(document)
```

## By category

### Productivity tools

The below document loaders allow you to load data from commonly used productivity tools.

| Document Loader                                                                | API reference                                                                   |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| [AgentMail](https://github.com/agentmail-to/langchain-agentmail)               | [`AgentMailLoader`](https://github.com/agentmail-to/langchain-agentmail)        |
| [Google Classroom](/oss/python/integrations/document_loaders/google_classroom) | [`GoogleClassroomLoader`](https://pypi.org/project/langchain-google-classroom/) |

### Webpages

The below document loaders allow you to load webpages.

| Document Loader                                                             | Description                                                                                                          | Package/API |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------- |
| [Unstructured](/oss/python/integrations/document_loaders/unstructured_file) | Uses Unstructured to load and parse web pages                                                                        | Package     |
| [Apify Dataset](https://docs.apify.com/platform/storage/dataset)            | Load documents from Apify datasets                                                                                   | API         |
| [Docling](/oss/python/integrations/document_loaders/docling)                | Uses Docling to load and parse web pages                                                                             | Package     |
| [Firecrawl](https://docs.firecrawl.dev)                                     | Turns websites into clean, LLM-ready data via scrape/crawl/map/extract/search                                        | API         |
| [Hyperbrowser](https://docs.hyperbrowser.ai)                                | Platform for running and scaling headless browsers, can be used to scrape/crawl any site                             | API         |
| [OpeddFeedLoader](https://opedd.com/for-ai-agents)                          | Load a licensed Opedd content catalog as Documents with licensing provenance                                         | API         |
| [ProxyHatLoader](https://docs.proxyhat.com)                                 | Load web pages through ProxyHat residential proxies as Documents                                                     | API         |
| [AgentQL](https://docs.agentql.com/)                                        | Web interaction and structured data extraction from any web page using an AgentQL query or a Natural Language prompt | API         |
| [CRW](https://fastcrw.com)                                                  | Open-source Firecrawl-compatible web scraper via local binary or fastcrw\.com cloud                                  | Package     |
| [Plasmate](https://docs.plasmate.app/integration-langchain)                 | Agent-native headless browser with Set of Mark (SOM) structured UI extraction                                        | Package     |
| [Spidra](https://docs.spidra.io)                                            | AI-powered web scraper with real browsers, CAPTCHA solving, and structured data extraction                           | API         |

### PDFs

The below document loaders allow you to load PDF documents.

| Document Loader                                                                              | Description                                                                                                      | Package/API |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------- |
| [Unstructured](/oss/python/integrations/document_loaders/unstructured_file)                  | Uses Unstructured's open source library to load PDFs                                                             | Package     |
| [Upstage Document Parse Loader](/oss/python/integrations/document_loaders/upstage)           | Load PDF files using UpstageDocumentParseLoader                                                                  | Package     |
| [Docling](/oss/python/integrations/document_loaders/docling)                                 | Load PDF files using Docling                                                                                     | Package     |
| [MinerU](https://mineru.net)                                                                 | Load PDF and other documents using MinerU                                                                        | Package     |
| [UnDatasIO](https://undatas.io)                                                              | Load PDF files using UnDatasIO                                                                                   | Package     |
| [OpenDataLoader PDF](https://github.com/opendataloader-project/langchain-opendataloader-pdf) | Load PDF files using OpenDataLoader PDF                                                                          | Package     |
| [CVFileLoader](https://cvfile.org)                                                           | Load .cv PDF/A-3u files with embedded Markdown, HTML, and JSON Resume payloads                                   | Package     |
| [pdfmuse](https://github.com/casperkwok/pdfmuse)                                             | Load PDF and DOCX files deterministically, with exact coordinates, tables and per-block section metadata for RAG | Package     |
| [oxidize-pdf](https://github.com/bzsanti/oxidize-pdf-integrations/tree/main/langchain)       | Load PDF files using a Rust engine with element-disjoint RAG chunking                                            | Package     |
| [pdf-inspector](https://github.com/undacmic/langchain-pdf-inspector)                         | Load PDF files using pdf-inspector                                                                               | Package     |

### Cloud providers

The below document loaders allow you to load documents from your favorite cloud providers.

| Document Loader                                                                                            | Description                                         | Partner Package | API reference                                                                                                              |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [Google Cloud Storage Directory](/oss/python/integrations/document_loaders/google_cloud_storage_directory) | Load documents from GCS bucket                      | ✅               | [`GCSDirectoryLoader`](https://reference.langchain.com/python/langchain-google-community/gcs_directory/GCSDirectoryLoader) |
| [Google Cloud Storage File](/oss/python/integrations/document_loaders/google_cloud_storage_file)           | Load documents from GCS file object                 | ✅               | [`GCSFileLoader`](https://reference.langchain.com/python/langchain-google-community/gcs_file/GCSFileLoader)                |
| [Google Drive](/oss/python/integrations/document_loaders/google_drive)                                     | Load documents from Google Drive (Google Docs only) | ✅               | [`GoogleDriveLoader`](https://reference.langchain.com/python/langchain-google-community/drive/GoogleDriveLoader)           |

### Common file types

The below document loaders allow you to load data from common data formats.

| Document Loader                                                                  | Data Type                                                                                                                                                                    |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`Unstructured`](/oss/python/integrations/document_loaders/unstructured_file)    | Many file types (see [https://docs.unstructured.io/platform/supported-file-types](https://docs.unstructured.io/platform/supported-file-types))                               |
| [`DoclingLoader`](/oss/python/integrations/document_loaders/docling)             | Various file types (see [https://ds4sd.github.io/docling/](https://ds4sd.github.io/docling/))                                                                                |
| [`PolarisAIDataInsightLoader`](https://datainsight.polarisoffice.com/playground) | Various file types (see [https://datainsight.polarisoffice.com/documentation?docType=doc\_extract](https://datainsight.polarisoffice.com/documentation?docType=doc_extract)) |

## All document loaders

<div>
  | Integration                                                                                                  | Downloads                                                                                                                   |
  | :----------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
  | [`Google bigquery`](/oss/python/integrations/document_loaders/google_bigquery)                               | <span><a href="https://pypi.org/project/langchain-google-community/">  <img alt="Downloads per month" /></a></span>         |
  | [`Google cloud storage directory`](/oss/python/integrations/document_loaders/google_cloud_storage_directory) | <span><a href="https://pypi.org/project/langchain-google-community/">  <img alt="Downloads per month" /></a></span>         |
  | [`Google cloud storage file`](/oss/python/integrations/document_loaders/google_cloud_storage_file)           | <span><a href="https://pypi.org/project/langchain-google-community/">  <img alt="Downloads per month" /></a></span>         |
  | [`Google drive`](/oss/python/integrations/document_loaders/google_drive)                                     | <span><a href="https://pypi.org/project/langchain-google-community/">  <img alt="Downloads per month" /></a></span>         |
  | [`Google speech-to-text audio transcripts`](/oss/python/integrations/document_loaders/google_speech_to_text) | <span><a href="https://pypi.org/project/langchain-google-community/">  <img alt="Downloads per month" /></a></span>         |
  | [`UnstructuredLoader`](/oss/python/integrations/document_loaders/unstructured_file)                          | <span><a href="https://pypi.org/project/langchain-unstructured/">  <img alt="Downloads per month" /></a></span>             |
  | [`AstraDB`](/oss/python/integrations/document_loaders/astradb)                                               | <span><a href="https://pypi.org/project/langchain-astradb/">  <img alt="Downloads per month" /></a></span>                  |
  | [`Oracle AI vector search document processing`](/oss/python/integrations/document_loaders/oracleai)          | <span><a href="https://pypi.org/project/langchain-oracledb/">  <img alt="Downloads per month" /></a></span>                 |
  | [`Oracle autonomous database`](/oss/python/integrations/document_loaders/oracleadb_loader)                   | <span><a href="https://pypi.org/project/langchain-oracledb/">  <img alt="Downloads per month" /></a></span>                 |
  | [`Docling`](/oss/python/integrations/document_loaders/docling)                                               | <span><a href="https://pypi.org/project/langchain-docling/">  <img alt="Downloads per month" /></a></span>                  |
  | [`Upstage`](/oss/python/integrations/document_loaders/upstage)                                               | <span><a href="https://pypi.org/project/langchain-upstage/">  <img alt="Downloads per month" /></a></span>                  |
  | [`Google alloydb for postgresql`](/oss/python/integrations/document_loaders/google_alloydb)                  | <span><a href="https://pypi.org/project/langchain-google-alloydb-pg/">  <img alt="Downloads per month" /></a></span>        |
  | [`Google firestore (native mode)`](/oss/python/integrations/document_loaders/google_firestore)               | <span><a href="https://pypi.org/project/langchain-google-firestore/">  <img alt="Downloads per month" /></a></span>         |
  | [`Google spanner`](/oss/python/integrations/document_loaders/google_spanner)                                 | <span><a href="https://pypi.org/project/langchain-google-spanner/">  <img alt="Downloads per month" /></a></span>           |
  | [`ApifyDatasetLoader`](https://docs.apify.com/storage/dataset)                                               | <span><a href="https://pypi.org/project/langchain-apify/">  <img alt="Downloads per month" /></a></span>                    |
  | [`PyMuPDF4LLMLoader`](https://github.com/pymupdf/langchain-pymupdf4llm)                                      | <span><a href="https://pypi.org/project/langchain-pymupdf4llm/">  <img alt="Downloads per month" /></a></span>              |
  | [`Google cloud SQL for postgresql`](https://docs.cloud.google.com/sql/docs/postgres)                         | <span><a href="https://pypi.org/project/langchain-google-cloud-sql-pg/">  <img alt="Downloads per month" /></a></span>      |
  | [`OpenDataLoader PDF`](https://github.com/opendataloader-project/langchain-opendataloader-pdf)               | <span><a href="https://pypi.org/project/langchain-opendataloader-pdf/">  <img alt="Downloads per month" /></a></span>       |
  | [`YoutubeLoaderDL`](https://github.com/aqib0770/langchain-yt-dlp)                                            | <span><a href="https://pypi.org/project/langchain-yt-dlp/">  <img alt="Downloads per month" /></a></span>                   |
  | [`Docugami`](/oss/python/integrations/document_loaders/docugami)                                             | <span><a href="https://pypi.org/project/docugami-langchain/">  <img alt="Downloads per month" /></a></span>                 |
  | [`PDFParser`](https://dev.writer.com/api-reference/tool-api/pdf-parser#parse-pdf)                            | <span><a href="https://pypi.org/project/langchain-writer/">  <img alt="Downloads per month" /></a></span>                   |
  | [`Azure blob storage loader`](/oss/python/integrations/document_loaders/azure_blob_storage)                  | <span><a href="https://pypi.org/project/langchain-azure-storage/">  <img alt="Downloads per month" /></a></span>            |
  | [`Outline`](https://github.com/10Pines/langchain-outline)                                                    | <span><a href="https://pypi.org/project/langchain-outline/">  <img alt="Downloads per month" /></a></span>                  |
  | [`SingleStoreLoader`](https://github.com/singlestore-labs/langchain-singlestore/)                            | <span><a href="https://pypi.org/project/langchain-singlestore/">  <img alt="Downloads per month" /></a></span>              |
  | [`ProxyHatLoader`](https://docs.proxyhat.com)                                                                | <span><a href="https://pypi.org/project/langchain-proxyhat/">  <img alt="Downloads per month" /></a></span>                 |
  | [`MinerULoader`](https://mineru.net)                                                                         | <span><a href="https://pypi.org/project/langchain-mineru/">  <img alt="Downloads per month" /></a></span>                   |
  | [`OpeddFeedLoader`](https://opedd.com/for-ai-agents)                                                         | <span><a href="https://pypi.org/project/langchain-opedd/">  <img alt="Downloads per month" /></a></span>                    |
  | [`SpidraLoader`](https://docs.spidra.io)                                                                     | <span><a href="https://pypi.org/project/langchain-spidra/">  <img alt="Downloads per month" /></a></span>                   |
  | [`Google memorystore for Redis`](/oss/python/integrations/document_loaders/google_memorystore_redis)         | <span><a href="https://pypi.org/project/langchain-google-memorystore-redis/">  <img alt="Downloads per month" /></a></span> |
  | [`ReplyLayerLoader`](https://replylayer.ai/docs/guides/langchain)                                            | <span><a href="https://pypi.org/project/langchain-replylayer/">  <img alt="Downloads per month" /></a></span>               |
  | [`HyperbrowserLoader`](https://www.hyperbrowser.ai/docs/home)                                                | <span><a href="https://pypi.org/project/langchain-hyperbrowser/">  <img alt="Downloads per month" /></a></span>             |
  | [`Google bigtable`](/oss/python/integrations/document_loaders/google_bigtable)                               | <span><a href="https://pypi.org/project/langchain-google-bigtable/">  <img alt="Downloads per month" /></a></span>          |
  | [`CrwLoader`](https://fastcrw.com)                                                                           | <span><a href="https://pypi.org/project/langchain-crw/">  <img alt="Downloads per month" /></a></span>                      |
  | [`PaddleOCR-VL`](https://www.paddleocr.com)                                                                  | <span><a href="https://pypi.org/project/langchain-paddleocr/">  <img alt="Downloads per month" /></a></span>                |
  | [`PolarisAIDataInsightLoader`](https://datainsight.polarisoffice.com/playground)                             | <span><a href="https://pypi.org/project/langchain-polaris-ai-datainsight/">  <img alt="Downloads per month" /></a></span>   |
  | [`langchain_box`](https://developer.box.com/)                                                                | <span><a href="https://pypi.org/project/langchain-box/">  <img alt="Downloads per month" /></a></span>                      |
  | [`CVFileLoader`](https://cvfile.org)                                                                         | <span><a href="https://pypi.org/project/langchain-cvfile/">  <img alt="Downloads per month" /></a></span>                   |
  | [`SecureLangChainLoader`](https://github.com/arsbr/Veritensor)                                               | <span><a href="https://pypi.org/project/veritensor/">  <img alt="Downloads per month" /></a></span>                         |
  | [`Google Classroom`](/oss/python/integrations/document_loaders/google_classroom)                             | <span><a href="https://pypi.org/project/langchain-google-classroom/">  <img alt="Downloads per month" /></a></span>         |
  | [`Google cloud SQL for mysql`](/oss/python/integrations/document_loaders/google_cloud_sql_mysql)             | <span><a href="https://pypi.org/project/langchain-google-cloud-sql-mysql/">  <img alt="Downloads per month" /></a></span>   |
  | [`AgentQLLoader`](https://docs.agentql.com/home)                                                             | <span><a href="https://pypi.org/project/langchain-agentql/">  <img alt="Downloads per month" /></a></span>                  |
  | [`Kinetica document loader`](https://github.com/kineticadb/langchain-kinetica)                               | <span><a href="https://pypi.org/project/langchain-kinetica/">  <img alt="Downloads per month" /></a></span>                 |
  | [`Undatasio`](https://undatas.io)                                                                            | <span><a href="https://pypi.org/project/langchain-undatasio/">  <img alt="Downloads per month" /></a></span>                |
  | [`Google firestore in datastore mode`](/oss/python/integrations/document_loaders/google_datastore)           | <span><a href="https://pypi.org/project/langchain-google-datastore/">  <img alt="Downloads per month" /></a></span>         |
  | [`FirecrawlLoader`](https://docs.firecrawl.dev)                                                              | <span><a href="https://pypi.org/project/langchain-firecrawl/">  <img alt="Downloads per month" /></a></span>                |
  | [`PdfmuseLoader`](https://github.com/casperkwok/pdfmuse)                                                     | <span><a href="https://pypi.org/project/langchain-pdfmuse/">  <img alt="Downloads per month" /></a></span>                  |
  | [`PlasmateSOMLLoader`](https://docs.plasmate.app/integration-langchain)                                      | <span><a href="https://pypi.org/project/langchain-plasmate/">  <img alt="Downloads per month" /></a></span>                 |
  | [`Soniox`](https://soniox.com/docs/stt/concepts/supported-languages)                                         | <span><a href="https://pypi.org/project/langchain-soniox/">  <img alt="Downloads per month" /></a></span>                   |
  | [`AirbyteLoader`](https://docs.airbyte.com/integrations/)                                                    | <span><a href="https://pypi.org/project/langchain-airbyte/">  <img alt="Downloads per month" /></a></span>                  |
  | [`Google cloud SQL for SQL server`](/oss/python/integrations/document_loaders/google_cloud_sql_mssql)        | <span><a href="https://pypi.org/project/langchain-google-cloud-sql-mssql/">  <img alt="Downloads per month" /></a></span>   |
  | [`AgentMail`](https://github.com/agentmail-to/langchain-agentmail)                                           | <span><a href="https://pypi.org/project/langchain-agentmail/">  <img alt="Downloads per month" /></a></span>                |
  | [`AnakinLoader`](https://anakin.io/docs/documentation)                                                       | <span><a href="https://pypi.org/project/langchain-anakin/">  <img alt="Downloads per month" /></a></span>                   |
  | [`OxidizePdfLoader`](https://github.com/bzsanti/oxidize-pdf-integrations/tree/main/langchain)                | <span><a href="https://pypi.org/project/langchain-oxidize-pdf/">  <img alt="Downloads per month" /></a></span>              |
  | [`Google el carro for Oracle workloads`](https://github.com/googleapis/langchain-google-el-carro-python/)    | <span><a href="https://pypi.org/project/langchain-google-el-carro/">  <img alt="Downloads per month" /></a></span>          |
  | [`PowerScaleDocumentLoader`](/oss/python/integrations/document_loaders/powerscale)                           | <span><a href="https://pypi.org/project/powerscale-rag-connector/">  <img alt="Downloads per month" /></a></span>           |
  | [`LangSmithLoader`](/oss/python/integrations/document_loaders/langsmith)                                     | <span>N/A</span>                                                                                                            |
</div>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/document_loaders/index.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>