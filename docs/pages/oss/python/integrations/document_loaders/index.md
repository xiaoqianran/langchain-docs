<!-- langchain-docs: Document loader integrations | https://docs.langchain.com/oss/python/integrations/document_loaders/index -->

# Document loader integrations

Integrate with document loaders using LangChain Python.

Document loaders provide a **standard interface** for reading data from different sources (such as Slack, Notion, or Google Drive) into LangChain’s [Document](https://reference.langchain.com/python/langchain-core/documents/base/Document) format.
This ensures that data can be handled consistently regardless of the source.

All document loaders implement the [`BaseLoader`](https://reference.langchain.com/python/langchain-core/document_loaders/base/BaseLoader) interface.

Integration components
Arrows show a typical retrieval flow. The highlighted component is the one this page covers.

### Typical retrieval flow

### Agent capabilities

### Execution and state

> [!WARNING]
>
> Community document loaders are user-contributed and unverified. LangChain does not review or endorse these integrations; use them at your own risk.

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

| Document Loader | API reference |
| - | - |
| [AgentMail](https://github.com/agentmail-to/langchain-agentmail) | [`AgentMailLoader`](https://github.com/agentmail-to/langchain-agentmail) |
| [Google Classroom](/oss/python/integrations/document_loaders/google_classroom) | [`GoogleClassroomLoader`](https://pypi.org/project/langchain-google-classroom/) |

### Webpages

The below document loaders allow you to load webpages.

| Document Loader | Description | Package/API |
| - | - | - |
| [Unstructured](/oss/python/integrations/document_loaders/unstructured_file) | Uses Unstructured to load and parse web pages | Package |
| [Apify Dataset](https://docs.apify.com/integrations/langchain) | Load documents from Apify datasets | API |
| [Apify Crawl](https://docs.apify.com/integrations/langchain) | Crawl a website on demand and load each page as a Document | API |
| [Diffbot Crawl Loader](https://github.com/diffbot/langchain-diffbot) | Crawl a website and load each page as ontologically consistent JSON using the Diffbot Crawl API | API |
| [Diffbot Extract Loader](https://github.com/diffbot/langchain-diffbot) | Load web pages as ontologically consistent JSON using the Diffbot Extract API | API |
| [Docling](/oss/python/integrations/document_loaders/docling) | Uses Docling to load and parse web pages | Package |
| [DomPruner](https://github.com/dong7812/dompruner-py) | DOM AST pruning: loads web pages as compact Markdown with 97%+ token reduction, no API key | Package |
| [Firecrawl](https://docs.firecrawl.dev) | Turns websites into clean, LLM-ready data via scrape/crawl/map/extract/search | API |
| [Hyperbrowser](https://docs.hyperbrowser.ai) | Platform for running and scaling headless browsers, can be used to scrape/crawl any site | API |
| [OpeddFeedLoader](https://opedd.com/for-ai-agents) | Load a licensed Opedd content catalog as Documents with licensing provenance | API |
| [ProxyHatLoader](https://docs.proxyhat.com) | Load web pages through ProxyHat residential proxies as Documents | API |
| [AgentQL](https://docs.agentql.com/) | Web interaction and structured data extraction from any web page using an AgentQL query or a Natural Language prompt | API |
| [CRW](https://fastcrw.com) | Open-source Firecrawl-compatible web scraper via local binary or fastcrw\.com cloud | Package |
| [Plasmate](https://docs.plasmate.app/integration-langchain) | Agent-native headless browser with Set of Mark (SOM) structured UI extraction | Package |
| [Spidra](https://docs.spidra.io) | AI-powered web scraper with real browsers, CAPTCHA solving, and structured data extraction | API |

### PDFs

Partner and community loaders for PDF files. Hosted partner guides are listed first. Classic loaders from [`langchain-community`](https://pypi.org/project/langchain-community/) and other community packages follow. For the full download-sorted catalog, see [All document loaders](#all-document-loaders).

| Document Loader | Description | Package/API |
| - | - | - |
| [Unstructured](/oss/python/integrations/document_loaders/unstructured_file) | Uses Unstructured's open source library to load PDFs | Package |
| [Upstage Document Parse Loader](/oss/python/integrations/document_loaders/upstage) | Load PDF files using UpstageDocumentParseLoader | Package |
| [Docling](/oss/python/integrations/document_loaders/docling) | Load PDF files using Docling | Package |
| `PyPDFLoader` | Load PDF files with `pypdf` (`langchain-community`) | Community |
| `PyMuPDFLoader` | Load PDF files with PyMuPDF (`langchain-community`) | Community |
| `PDFMinerLoader` | Load PDF files with PDFMiner (`langchain-community`) | Community |
| `PDFPlumberLoader` | Load PDF files with pdfplumber (`langchain-community`) | Community |
| [MinerU](https://mineru.net) | Load PDF and other documents using MinerU | Package |
| [UnDatasIO](https://undatas.io) | Load PDF files using UnDatasIO | Package |
| [OpenDataLoader PDF](https://github.com/opendataloader-project/langchain-opendataloader-pdf) | Load PDF files using OpenDataLoader PDF | Package |
| [CVFileLoader](https://cvfile.org) | Load .cv PDF/A-3u files with embedded Markdown, HTML, and JSON Resume payloads | Package |
| [pdfmuse](https://github.com/casperkwok/pdfmuse) | Load PDF and DOCX files deterministically, with exact coordinates, tables and per-block section metadata for RAG | Package |
| [oxidize-pdf](https://github.com/bzsanti/oxidize-pdf-integrations/tree/main/langchain) | Load PDF files using a Rust engine with element-disjoint RAG chunking | Package |
| [pdf-inspector](https://github.com/undacmic/langchain-pdf-inspector) | Load PDF files using pdf-inspector | Package |

### Cloud providers

The below document loaders allow you to load documents from your favorite cloud providers.

| Document Loader | Description | Partner Package | API reference / Source |
| - | - | - | - |
| [Azure Blob Storage](/oss/python/integrations/document_loaders/azure_blob_storage) | Load documents from Azure Blob Storage containers or individual blobs | ✅ | [`langchain-ai/langchain-azure`](https://github.com/langchain-ai/langchain-azure/tree/main/libs/azure-storage) |
| [Google Cloud Storage Directory](/oss/python/integrations/document_loaders/google_cloud_storage_directory) | Load documents from GCS bucket | ✅ | [`GCSDirectoryLoader`](https://reference.langchain.com/python/langchain-google-community/gcs_directory/GCSDirectoryLoader) |
| [Google Cloud Storage File](/oss/python/integrations/document_loaders/google_cloud_storage_file) | Load documents from GCS file object | ✅ | [`GCSFileLoader`](https://reference.langchain.com/python/langchain-google-community/gcs_file/GCSFileLoader) |
| [Google Drive](/oss/python/integrations/document_loaders/google_drive) | Load documents from Google Drive (Google Docs only) | ✅ | [`GoogleDriveLoader`](https://reference.langchain.com/python/langchain-google-community/drive/GoogleDriveLoader) |

### Common file types

The below document loaders allow you to load data from common data formats.

| Document Loader | Data Type |
| - | - |
| [`Unstructured`](/oss/python/integrations/document_loaders/unstructured_file) | Many file types (see [https://docs.unstructured.io/platform/supported-file-types](https://docs.unstructured.io/platform/supported-file-types)) |
| [`HwpHwpxLoader`](https://github.com/jaypakdevkr/HWP-Loader) | HWP/HWPX files |
| [`DoclingLoader`](/oss/python/integrations/document_loaders/docling) | Various file types (see [https://docling-project.github.io/docling/](https://docling-project.github.io/docling/)) |
| [`PolarisAIDataInsightLoader`](https://datainsight.polarisoffice.com/playground) | Various file types (see [https://datainsight.polarisoffice.com/documentation?docType=doc\_extract](https://datainsight.polarisoffice.com/documentation?docType=doc_extract)) |

## All document loaders

| Integration | Downloads |
| :- | :- |
| [`Google bigquery`](/oss/python/integrations/document_loaders/google_bigquery) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-google-community/month)](https://pypi.org/project/langchain-google-community/) |
| [`Google cloud storage directory`](/oss/python/integrations/document_loaders/google_cloud_storage_directory) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-google-community/month)](https://pypi.org/project/langchain-google-community/) |
| [`Google cloud storage file`](/oss/python/integrations/document_loaders/google_cloud_storage_file) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-google-community/month)](https://pypi.org/project/langchain-google-community/) |
| [`Google drive`](/oss/python/integrations/document_loaders/google_drive) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-google-community/month)](https://pypi.org/project/langchain-google-community/) |
| [`Google speech-to-text audio transcripts`](/oss/python/integrations/document_loaders/google_speech_to_text) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-google-community/month)](https://pypi.org/project/langchain-google-community/) |
| [`Oracle AI vector search document processing`](/oss/python/integrations/document_loaders/oracleai) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-oracledb/month)](https://pypi.org/project/langchain-oracledb/) |
| [`Oracle autonomous database`](/oss/python/integrations/document_loaders/oracleadb_loader) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-oracledb/month)](https://pypi.org/project/langchain-oracledb/) |
| [`UnstructuredLoader`](/oss/python/integrations/document_loaders/unstructured_file) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-unstructured/month)](https://pypi.org/project/langchain-unstructured/) |
| [`AstraDB`](/oss/python/integrations/document_loaders/astradb) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-astradb/month)](https://pypi.org/project/langchain-astradb/) |
| [`Docling`](/oss/python/integrations/document_loaders/docling) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-docling/month)](https://pypi.org/project/langchain-docling/) |
| [`Google alloydb for postgresql`](/oss/python/integrations/document_loaders/google_alloydb) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-google-alloydb-pg/month)](https://pypi.org/project/langchain-google-alloydb-pg/) |
| [`PyMuPDF4LLMLoader`](https://github.com/pymupdf/langchain-pymupdf4llm) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-pymupdf4llm/month)](https://pypi.org/project/langchain-pymupdf4llm/) |
| [`Upstage`](/oss/python/integrations/document_loaders/upstage) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-upstage/month)](https://pypi.org/project/langchain-upstage/) |
| [`ApifyCrawlLoader`](https://docs.apify.com/integrations/langchain) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-apify/month)](https://pypi.org/project/langchain-apify/) |
| [`ApifyDatasetLoader`](https://docs.apify.com/integrations/langchain) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-apify/month)](https://pypi.org/project/langchain-apify/) |
| [`Google cloud SQL for postgresql`](https://docs.cloud.google.com/sql/docs/postgres) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-google-cloud-sql-pg/month)](https://pypi.org/project/langchain-google-cloud-sql-pg/) |
| [`Google firestore (native mode)`](/oss/python/integrations/document_loaders/google_firestore) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-google-firestore/month)](https://pypi.org/project/langchain-google-firestore/) |
| [`Google spanner`](/oss/python/integrations/document_loaders/google_spanner) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-google-spanner/month)](https://pypi.org/project/langchain-google-spanner/) |
| [`Azure blob storage loader`](/oss/python/integrations/document_loaders/azure_blob_storage) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-azure-storage/month)](https://pypi.org/project/langchain-azure-storage/) |
| [`FlatmarkLoader`](https://github.com/flatmark-dev/flatmark-integrations/blob/main/langchain/README.md) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-flatmark/month)](https://pypi.org/project/langchain-flatmark/) |
| [`DoclingLoader`](https://github.com/docling-project/docling.rs/blob/master/crates/docling-py/README.md#langchain) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-docling-rs/month)](https://pypi.org/project/langchain-docling-rs/) |
| [`FirecrawlLoader`](https://docs.firecrawl.dev) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-firecrawl/month)](https://pypi.org/project/langchain-firecrawl/) |
| [`OpenDataLoader PDF`](https://github.com/opendataloader-project/langchain-opendataloader-pdf) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-opendataloader-pdf/month)](https://pypi.org/project/langchain-opendataloader-pdf/) |
| [`ReplyLayerLoader`](https://replylayer.ai/docs/guides/langchain) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-replylayer/month)](https://pypi.org/project/langchain-replylayer/) |
| [`SingleStoreLoader`](https://github.com/singlestore-labs/langchain-singlestore/) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-singlestore/month)](https://pypi.org/project/langchain-singlestore/) |
| [`AnakinLoader`](https://anakin.io/docs/documentation) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-anakin/month)](https://pypi.org/project/langchain-anakin/) |
| [`Docugami`](/oss/python/integrations/document_loaders/docugami) | [  ![Downloads per month](https://static.pepy.tech/badge/docugami-langchain/month)](https://pypi.org/project/docugami-langchain/) |
| [`HwpHwpxLoader`](https://github.com/jaypakdevkr/HWP-Loader) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-hwp-hwpx-loader/month)](https://pypi.org/project/langchain-hwp-hwpx-loader/) |
| [`PDFParser`](https://dev.writer.com/api-reference/tool-api/pdf-parser#parse-pdf) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-writer/month)](https://pypi.org/project/langchain-writer/) |
| [`YoutubeLoaderDL`](https://github.com/aqib0770/langchain-yt-dlp) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-yt-dlp/month)](https://pypi.org/project/langchain-yt-dlp/) |
| [`OpeddFeedLoader`](https://opedd.com/for-ai-agents) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-opedd/month)](https://pypi.org/project/langchain-opedd/) |
| [`DiffbotCrawlLoader`](https://github.com/diffbot/langchain-diffbot) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-diffbot/month)](https://pypi.org/project/langchain-diffbot/) |
| [`DiffbotExtractLoader`](https://github.com/diffbot/langchain-diffbot) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-diffbot/month)](https://pypi.org/project/langchain-diffbot/) |
| [`SuperPDFLoader`](https://superpdf.ai/docs/python/langchain-llamaindex#langchain) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-superpdf/month)](https://pypi.org/project/langchain-superpdf/) |
| [`HyperbrowserLoader`](https://www.hyperbrowser.ai/docs/home) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-hyperbrowser/month)](https://pypi.org/project/langchain-hyperbrowser/) |
| [`SecureLangChainLoader`](https://github.com/arsbr/Veritensor) | [  ![Downloads per month](https://static.pepy.tech/badge/veritensor/month)](https://pypi.org/project/veritensor/) |
| [`HydrafetchLoader`](https://docs.hydrafetch.com) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-hydrafetch/month)](https://pypi.org/project/langchain-hydrafetch/) |
| [`WebCrawlerAPILoader`](https://webcrawlerapi.com/docs/sdk/langchain) | [  ![Downloads per month](https://static.pepy.tech/badge/webcrawlerapi-langchain/month)](https://pypi.org/project/webcrawlerapi-langchain/) |
| [`CrwLoader`](https://fastcrw.com) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-crw/month)](https://pypi.org/project/langchain-crw/) |
| [`MinerULoader`](https://mineru.net) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-mineru/month)](https://pypi.org/project/langchain-mineru/) |
| [`DomPrunerLoader`](https://github.com/dong7812/dompruner-py) | [  ![Downloads per month](https://static.pepy.tech/badge/dompruner/month)](https://pypi.org/project/dompruner/) |
| [`Outline`](https://github.com/10Pines/langchain-outline) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-outline/month)](https://pypi.org/project/langchain-outline/) |
| [`PolarisAIDataInsightLoader`](https://datainsight.polarisoffice.com/playground) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-polaris-ai-datainsight/month)](https://pypi.org/project/langchain-polaris-ai-datainsight/) |
| [`Google bigtable`](/oss/python/integrations/document_loaders/google_bigtable) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-google-bigtable/month)](https://pypi.org/project/langchain-google-bigtable/) |
| [`langchain_box`](https://developer.box.com/) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-box/month)](https://pypi.org/project/langchain-box/) |
| [`AlfrescoLoader`](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Loader.md#alfrescoloader) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-opendma/month)](https://pypi.org/project/langchain-opendma/) |
| [`OpenDMALoader`](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Loader.md) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-opendma/month)](https://pypi.org/project/langchain-opendma/) |
| [`MeshArcLoader`](https://mesharc.dev/docs/langchain) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-mesharc/month)](https://pypi.org/project/langchain-mesharc/) |
| [`Google memorystore for Redis`](/oss/python/integrations/document_loaders/google_memorystore_redis) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-google-memorystore-redis/month)](https://pypi.org/project/langchain-google-memorystore-redis/) |
| [`PaddleOCR-VL`](https://www.paddleocr.com) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-paddleocr/month)](https://pypi.org/project/langchain-paddleocr/) |
| [`ProxmintLoader`](https://proxmint.com/docs/langchain) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-proxmint/month)](https://pypi.org/project/langchain-proxmint/) |
| [`Web2MDLoader`](https://github.com/kanavsingla28/web2md-clients/tree/main/python#readme) | [  ![Downloads per month](https://static.pepy.tech/badge/web2md-client/month)](https://pypi.org/project/web2md-client/) |
| [`CapslaneLoader`](https://capslane.com/integrations/langchain) | [  ![Downloads per month](https://static.pepy.tech/badge/capslane/month)](https://pypi.org/project/capslane/) |
| [`Google Classroom`](/oss/python/integrations/document_loaders/google_classroom) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-google-classroom/month)](https://pypi.org/project/langchain-google-classroom/) |
| [`SpidraLoader`](https://docs.spidra.io) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-spidra/month)](https://pypi.org/project/langchain-spidra/) |
| [`Google cloud SQL for mysql`](/oss/python/integrations/document_loaders/google_cloud_sql_mysql) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-google-cloud-sql-mysql/month)](https://pypi.org/project/langchain-google-cloud-sql-mysql/) |
| [`Kinetica document loader`](https://github.com/kineticadb/langchain-kinetica) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-kinetica/month)](https://pypi.org/project/langchain-kinetica/) |
| [`CVFileLoader`](https://cvfile.org) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-cvfile/month)](https://pypi.org/project/langchain-cvfile/) |
| [`EnconvertLoader`](https://github.com/enconvert/langchain-enconvert) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-enconvert/month)](https://pypi.org/project/langchain-enconvert/) |
| [`PdfInspectorLoader`](https://github.com/undacmic/langchain-pdf-inspector) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-pdf-inspector/month)](https://pypi.org/project/langchain-pdf-inspector/) |
| [`LyrenthLoader`](https://lyrenth.com/docs/integrations) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-lyrenth/month)](https://pypi.org/project/langchain-lyrenth/) |
| [`Google firestore in datastore mode`](/oss/python/integrations/document_loaders/google_datastore) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-google-datastore/month)](https://pypi.org/project/langchain-google-datastore/) |
| [`AgentQLLoader`](https://docs.agentql.com/home) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-agentql/month)](https://pypi.org/project/langchain-agentql/) |
| [`ProxyHatLoader`](https://docs.proxyhat.com) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-proxyhat/month)](https://pypi.org/project/langchain-proxyhat/) |
| [`AirbyteLoader`](https://docs.airbyte.com/integrations/) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-airbyte/month)](https://pypi.org/project/langchain-airbyte/) |
| [`PdfmuseLoader`](https://github.com/casperkwok/pdfmuse) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-pdfmuse/month)](https://pypi.org/project/langchain-pdfmuse/) |
| [`Soniox`](https://soniox.com/docs/stt/concepts/supported-languages) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-soniox/month)](https://pypi.org/project/langchain-soniox/) |
| [`PlasmateSOMLLoader`](https://docs.plasmate.app/integration-langchain) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-plasmate/month)](https://pypi.org/project/langchain-plasmate/) |
| [`Google cloud SQL for SQL server`](/oss/python/integrations/document_loaders/google_cloud_sql_mssql) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-google-cloud-sql-mssql/month)](https://pypi.org/project/langchain-google-cloud-sql-mssql/) |
| [`Undatasio`](https://undatas.io) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-undatasio/month)](https://pypi.org/project/langchain-undatasio/) |
| [`QuanticDataLoader`](https://quanticdata.io/docs/) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-quanticdata/month)](https://pypi.org/project/langchain-quanticdata/) |
| [`XNSBlobLoader`](https://docs.xns.tech) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-xns/month)](https://pypi.org/project/langchain-xns/) |
| [`XNSLoader`](https://docs.xns.tech) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-xns/month)](https://pypi.org/project/langchain-xns/) |
| [`AnyToMarkdownLoader`](https://pypi.org/project/langchain-anytomarkdown/) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-anytomarkdown/month)](https://pypi.org/project/langchain-anytomarkdown/) |
| [`AgentMail`](https://github.com/agentmail-to/langchain-agentmail) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-agentmail/month)](https://pypi.org/project/langchain-agentmail/) |
| [`OxidizePdfLoader`](https://github.com/bzsanti/oxidize-pdf-integrations/tree/main/langchain) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-oxidize-pdf/month)](https://pypi.org/project/langchain-oxidize-pdf/) |
| [`Google el carro for Oracle workloads`](https://github.com/googleapis/langchain-google-el-carro-python/) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-google-el-carro/month)](https://pypi.org/project/langchain-google-el-carro/) |
| [`PowerScaleDocumentLoader`](/oss/python/integrations/document_loaders/powerscale) | [  ![Downloads per month](https://static.pepy.tech/badge/powerscale-rag-connector/month)](https://pypi.org/project/powerscale-rag-connector/) |
| [`CommentScraperLoader`](https://comment-scraper.com/langchain) | N/A |
| [`LangSmithLoader`](/oss/python/integrations/document_loaders/langsmith) | N/A |

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/document_loaders/index.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).