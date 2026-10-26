<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Document loader integrations | https://docs.langchain.com/oss/python/integrations/document_loaders/index -->

# 文档加载器集成

使用 LangChain Python 与文档加载器集成。

文档加载器提供了一个**标准接口**，用于将来自不同来源（例如 Slack、Notion 或 Google Drive）的数据读取为 LangChain 的 [Document](https://reference.langchain.com/python/langchain-core/documents/base/Document) 格式。
这确保了无论来源如何，都可以一致地处理数据。

所有文档加载器都实现 [⟦T1⟧](https://reference.langchain.com/python/langchain-core/document_loaders/base/BaseLoader) 接口。

集成组件
箭头显示了典型的检索流程。突出显示的组件是本页所涵盖的组件。

### 典型检索流程

### 代理能力

### 执行和状态

> [!警告]
>
> 社区文档加载器由用户贡献且未经验证。 LangChain​​ 不审查或认可这些集成；使用它们的风险由您自行承担。

## 接口

每个文档加载器可以定义自己的参数，但它们共享一个公共 API：

* `load()`：一次加载所有文档。
* `lazy_load()`：延迟流式传输文档，对于大型数据集很有用。

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

## 按类别

### 生产力工具

以下文档加载器允许您从常用的生产力工具加载数据。

|文档加载器| API参考|
| - | - |
| [AgentMail](https://github.com/agentmail-to/langchain-agentmail) | [⟦T4⟧](https://github.com/agentmail-to/langchain-agentmail) |
| [Google Classroom](/oss/python/integrations/document_loaders/google_classroom) | [⟦T5⟧](https://pypi.org/project/langchain-google-classroom/) |

### 网页下面的文档加载器允许您加载网页。

|文档加载器|描述 |包/API |
| - | - | - |
| [Unstructured](/oss/python/integrations/document_loaders/unstructured_file) |使用Unstructed 加载和解析网页|套餐 |
| [Apify Dataset](https://docs.apify.com/integrations/langchain) |从 Apify 数据集加载文档 |应用程序接口 |
| [Apify Crawl](https://docs.apify.com/integrations/langchain) |按需抓取网站并将每个页面作为文档加载 |应用程序接口 |
| [Diffbot Crawl Loader](https://github.com/diffbot/langchain-diffbot) |使用 Diffbot Crawl API 抓取网站并将每个页面加载为本体一致的 JSON |应用程序接口 |
| [Diffbot Extract Loader](https://github.com/diffbot/langchain-diffbot) |使用 Diffbot Extract API 将网页加载为本体一致的 JSON |应用程序接口 |
| [Docling](/oss/python/integrations/document_loaders/docling) |使用Docling加载和解析网页|套餐 |
| [DomPruner](https://github.com/dong7812/dompruner-py) | DOM AST 修剪：将网页加载为紧凑的 Markdown，令牌减少 97% 以上，无需 API 密钥 |套餐 |
| [Firecrawl](https://docs.firecrawl.dev) |通过抓取/抓取/地图/提取/搜索将网站转变为干净的、可供法学硕士使用的数据 |应用程序接口 |
| [Hyperbrowser](https://docs.hyperbrowser.ai) |用于运行和扩展无头浏览器的平台，可用于抓取/爬行任何网站 |应用程序接口 |
| [OpeddFeedLoader](https://opedd.com/for-ai-agents) |将获得许可的 Opedd 内容目录加载为具有许可来源的文档 |应用程序接口 |
| [ProxyHatLoader](https://docs.proxyhat.com) |通过 ProxyHat 住宅代理加载网页作为文档 |应用程序接口 || [AgentQL](https://docs.agentql.com/) |使用 AgentQL 查询或自然语言提示从任何网页进行 Web 交互和结构化数据提取 |应用程序接口 |
| [CRW](https://fastcrw.com) |通过本地二进制文件或 fastcrw\.com 云实现与 Firecrawl 兼容的开源网络爬虫 |套餐 |
| [Plasmate](https://docs.plasmate.app/integration-langchain) |具有标记集 (SOM) 结构化 UI 提取功能的代理原生无头浏览器 |套餐 |
| [Spidra](https://docs.spidra.io) |具有真实浏览器、验证码解决和结构化数据提取的人工智能网络抓取工具 |应用程序接口 |

### PDF

PDF 文件的合作伙伴和社区加载程序。首先列出托管合作伙伴指南。随后是来自 [⟦T6⟧](https://pypi.org/project/langchain-community/) 的经典加载器和其他社区包。如需完整下载分类目录，请参阅[All document loaders](#all-document-loaders)。|文档加载器|描述 |包/API |
| - | - | - |
| [Unstructured](/oss/python/integrations/document_loaders/unstructured_file) |使用Unstructed的开源库加载PDF |套餐 |
| [Upstage Document Parse Loader](/oss/python/integrations/document_loaders/upstage) |使用 UpstageDocumentParseLoader 加载 PDF 文件 |套餐 |
| [Docling](/oss/python/integrations/document_loaders/docling) |使用 Docling 加载 PDF 文件 |套餐 |
| `PyPDFLoader` |使用 `pypdf` (`langchain-community`) 加载 PDF 文件 |社区 |
| `PyMuPDFLoader` |使用 PyMuPDF 加载 PDF 文件 (`langchain-community`) |社区 |
| `PDFMinerLoader` |使用 PDFMiner 加载 PDF 文件 (`langchain-community`) |社区 |
| `PDFPlumberLoader` |使用 pdfplumber 加载 PDF 文件 (`langchain-community`) |社区 |
| [MinerU](https://mineru.net) |使用 MinerU 加载 PDF 和其他文档 |套餐 |
| [UnDatasIO](https://undatas.io) |使用 UnDatasIO 加载 PDF 文件 |套餐 |
| [OpenDataLoader PDF](https://github.com/opendataloader-project/langchain-opendataloader-pdf) |使用 OpenDataLoader PDF | 加载 PDF 文件套餐 |
| [CVFileLoader](https://cvfile.org) |加载带有嵌入式 Markdown、HTML 和 JSON 简历负载的 .cv PDF/A-3u 文件 |套餐 |
| [pdfmuse](https://github.com/casperkwok/pdfmuse) |确定性地加载 PDF 和 DOCX 文件，并为 RAG | 提供精确的坐标、表格和每块部分元数据套餐 |
| [oxidize-pdf](https://github.com/bzsanti/oxidize-pdf-integrations/tree/main/langchain) |使用带有元素不相交 RAG 分块的 Rust 引擎加载 PDF 文件 |套餐 |
| [pdf-inspector](https://github.com/undacmic/langchain-pdf-inspector) |使用 pdf-inspector 加载 PDF 文件 |套餐 |

### 云提供商

下面的文档加载器允许您从您最喜欢的云提供商加载文档。|文档加载器|描述 |合作伙伴套餐 | API 参考/来源 |
| - | - | - | - |
| [Azure Blob Storage](/oss/python/integrations/document_loaders/azure_blob_storage) |从 Azure Blob 存储容器或单个 Blob 加载文档 | ✅ | [⟦T16⟧](https://github.com/langchain-ai/langchain-azure/tree/main/libs/azure-storage) |
| [Google Cloud Storage Directory](/oss/python/integrations/document_loaders/google_cloud_storage_directory) |从 GCS 存储桶加载文档 | ✅ | [⟦T17⟧](https://reference.langchain.com/python/langchain-google-community/gcs_directory/GCSDirectoryLoader) |
| [Google Cloud Storage File](/oss/python/integrations/document_loaders/google_cloud_storage_file) |从 GCS 文件对象加载文档 | ✅ | [⟦T18⟧](https://reference.langchain.com/python/langchain-google-community/gcs_file/GCSFileLoader) |
| [Google Drive](/oss/python/integrations/document_loaders/google_drive) |从 Google 云端硬盘加载文档（仅限 Google 文档）| ✅ | [⟦T19⟧](https://reference.langchain.com/python/langchain-google-community/drive/GoogleDriveLoader) |

### 常见文件类型

以下文档加载器允许您从常见数据格式加载数据。

|文档加载器|数据类型 |
| - | - |
| [⟦T20⟧](/oss/python/integrations/document_loaders/unstructured_file) |许多文件类型（请参阅[https://docs.unstructured.io/platform/supported-file-types](https://docs.unstructured.io/platform/supported-file-types)）|
| [⟦T21⟧](https://github.com/jaypakdevkr/HWP-Loader) | HWP/HWPX 文件 |
| [⟦T22⟧](/oss/python/integrations/document_loaders/docling) |各种文件类型（参见[https://docling-project.github.io/docling/](https://docling-project.github.io/docling/)）|
| [⟦T23⟧](https://datainsight.polarisoffice.com/playground) |各种文件类型（参见[https://datainsight.polarisoffice.com/documentation?docType=doc\_extract](https://datainsight.polarisoffice.com/documentation?docType=doc_extract)）|

## 所有文档加载器|整合 |下载 |
| :-| :-|
| [⟦T24⟧](/oss/python/integrations/document_loaders/google_bigquery) | [  ⟦T105⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T25⟧](/oss/python/integrations/document_loaders/google_cloud_storage_directory) | [  ⟦T106⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T26⟧](/oss/python/integrations/document_loaders/google_cloud_storage_file) | [  ⟦T107⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T27⟧](/oss/python/integrations/document_loaders/google_drive) | [  ⟦T108⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T28⟧](/oss/python/integrations/document_loaders/google_speech_to_text) | [  ⟦T109⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T29⟧](/oss/python/integrations/document_loaders/oracleai) | [  ⟦T110⟧](https://pypi.org/project/langchain-oracledb/) |
| [⟦T30⟧](/oss/python/integrations/document_loaders/oracleadb_loader) | [  ⟦T111⟧](https://pypi.org/project/langchain-oracledb/) |
| [⟦T31⟧](/oss/python/integrations/document_loaders/unstructured_file) | [  ⟦T112⟧](https://pypi.org/project/langchain-unstructured/) |
| [⟦T32⟧](/oss/python/integrations/document_loaders/astradb) | [  ⟦T113⟧](https://pypi.org/project/langchain-astradb/) |
| [⟦T33⟧](/oss/python/integrations/document_loaders/docling) | [  ⟦T114⟧](https://pypi.org/project/langchain-docling/) |
| [⟦T34⟧](/oss/python/integrations/document_loaders/google_alloydb) | [  ⟦T115⟧](https://pypi.org/project/langchain-google-alloydb-pg/) |
| [⟦T35⟧](https://github.com/pymupdf/langchain-pymupdf4llm) | [  ⟦T116⟧](https://pypi.org/project/langchain-pymupdf4llm/) |
| [⟦T36⟧](/oss/python/integrations/document_loaders/upstage) | [  ⟦T117⟧](https://pypi.org/project/langchain-upstage/) |
| [⟦T37⟧](https://docs.apify.com/integrations/langchain) | [  ⟦T118⟧](https://pypi.org/project/langchain-apify/) |
| [⟦T38⟧](https://docs.apify.com/integrations/langchain) | [  ⟦T119⟧](https://pypi.org/project/langchain-apify/) |
| [⟦T39⟧](https://docs.cloud.google.com/sql/docs/postgres) | [  ⟦T120⟧](https://pypi.org/project/langchain-google-cloud-sql-pg/) |
| [⟦T40⟧](/oss/python/integrations/document_loaders/google_firestore) | [  ⟦T121⟧](https://pypi.org/project/langchain-google-firestore/) |
| [⟦T41⟧](/oss/python/integrations/document_loaders/google_spanner) | [  ⟦T122⟧](https://pypi.org/project/langchain-google-spanner/) |
| [⟦T42⟧](https://github.com/docling-project/docling.rs/blob/master/crates/docling-py/README.md#langchain) | [  ⟦T123⟧](https://pypi.org/project/langchain-docling-rs/) |
| [⟦T43⟧](/oss/python/integrations/document_loaders/azure_blob_storage) | [  ⟦T124⟧](https://pypi.org/project/langchain-azure-storage/) |
| [⟦T44⟧](https://github.com/flatmark-dev/flatmark-integrations/blob/main/langchain/README.md) | [  ⟦T125⟧](https://pypi.org/project/langchain-flatmark/) |
| [⟦T45⟧](https://docs.firecrawl.dev) | [  ⟦T126⟧](https://pypi.org/project/langchain-firecrawl/) |
| [⟦T46⟧](https://github.com/opendataloader-project/langchain-opendataloader-pdf) | [  ⟦T127⟧](https://pypi.org/project/langchain-opendataloader-pdf/) |
| [⟦T47⟧](https://replylayer.ai/docs/guides/langchain) | [  ⟦T128⟧](https://pypi.org/project/langchain-replylayer/) |
| [⟦T48⟧](https://anakin.io/docs/documentation) | [  ⟦T129⟧](https://pypi.org/project/langchain-anakin/) |
| [⟦T49⟧](/oss/python/integrations/document_loaders/docugami) | [  ⟦T130⟧](https://pypi.org/project/docugami-langchain/) |
| [⟦T50⟧](https://github.com/jaypakdevkr/HWP-Loader) | [  ⟦T131⟧](https://pypi.org/project/langchain-hwp-hwpx-loader/) |
| [⟦T51⟧](https://github.com/singlestore-labs/langchain-singlestore/) | [  ⟦T132⟧](https://pypi.org/project/langchain-singlestore/) |
| [⟦T52⟧](https://github.com/aqib0770/langchain-yt-dlp) | [  ⟦T133⟧](https://pypi.org/project/langchain-yt-dlp/) |
| [⟦T53⟧](https://dev.writer.com/api-reference/tool-api/pdf-parser#parse-pdf) | [  ⟦T134⟧](https://pypi.org/project/langchain-writer/) |
| [⟦T54⟧](https://superpdf.ai/docs/python/langchain-llamaindex#langchain) | [  ⟦T135⟧](https://pypi.org/project/langchain-superpdf/) |
| [⟦T55⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T136⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T56⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T137⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T57⟧](https://www.hyperbrowser.ai/docs/home) | [  ⟦T138⟧](https://pypi.org/project/langchain-hyperbrowser/) |
| [⟦T58⟧](https://mesharc.dev/docs/langchain) | [  ⟦T139⟧](https://pypi.org/project/langchain-mesharc/) |
| [⟦T59⟧](https://github.com/arsbr/Veritensor) | [  ⟦T140⟧](https://pypi.org/project/veritensor/) |
| [⟦T60⟧](https://docs.hydrafetch.com) | [  ⟦T141⟧](https://pypi.org/project/langchain-hydrafetch/) |
| [⟦T61⟧](https://webcrawlerapi.com/docs/sdk/langchain) | [  ⟦T142⟧](https://pypi.org/project/webcrawlerapi-langchain/) |
| [⟦T62⟧](https://fastcrw.com) | [  ⟦T143⟧](https://pypi.org/project/langchain-crw/) |
| [⟦T63⟧](https://github.com/dong7812/dompruner-py) | [  ⟦T144⟧](https://pypi.org/project/dompruner/) |
| [⟦T64⟧](https://mineru.net) | [  ⟦T145⟧](https://pypi.org/project/langchain-mineru/) |
| [⟦T65⟧](/oss/python/integrations/document_loaders/google_bigtable) | [  ⟦T146⟧](https://pypi.org/project/langchain-google-bigtable/) |
| [⟦T66⟧](https://github.com/10Pines/langchain-outline) | [  ⟦T147⟧](https://pypi.org/project/langchain-outline/) |
| [⟦T67⟧](https://opedd.com/for-ai-agents) | [  ⟦T148⟧](https://pypi.org/project/langchain-opedd/) |
| [⟦T68⟧](https://datainsight.polarisoffice.com/playground) | [  ⟦T149⟧](https://pypi.org/project/langchain-polaris-ai-datainsight/) |
| [⟦T69⟧](/oss/python/integrations/document_loaders/google_memorystore_redis) | [  ⟦T150⟧](https://pypi.org/project/langchain-google-memorystore-redis/) |
| [⟦T70⟧](https://developer.box.com/) | [  ⟦T151⟧](https://pypi.org/project/langchain-box/) |
| [⟦T71⟧](https://proxmint.com/docs/langchain) | [  ⟦T152⟧](https://pypi.org/project/langchain-proxmint/) |
| [⟦T72⟧](https://www.paddleocr.com) | [  ⟦T153⟧](https://pypi.org/project/langchain-paddleocr/) |
| [⟦T73⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Loader.md#alfrescoloader) | [  ⟦T154⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T74⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Loader.md) | [  ⟦T155⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T75⟧](https://github.com/kanavsingla28/web2md-clients/tree/main/python#readme) | [  ⟦T156⟧](https://pypi.org/project/web2md-client/) |
| [⟦T76⟧](/oss/python/integrations/document_loaders/google_classroom) | [  ⟦T157⟧](https://pypi.org/project/langchain-google-classroom/) |
| [⟦T77⟧](https://pypi.org/project/langchain-anytomarkdown/) | [  ⟦T158⟧](https://pypi.org/project/langchain-anytomarkdown/) |
| [⟦T78⟧](https://docs.spidra.io) | [  ⟦T159⟧](https://pypi.org/project/langchain-spidra/) |
| [⟦T79⟧](https://github.com/kineticadb/langchain-kinetica) | [  ⟦T160⟧](https://pypi.org/project/langchain-kinetica/) |
| [⟦T80⟧](https://cvfile.org) | [  ⟦T161⟧](https://pypi.org/project/langchain-cvfile/) || [⟦T81⟧](/oss/python/integrations/document_loaders/google_datastore) | [  ⟦T162⟧](https://pypi.org/project/langchain-google-datastore/) |
| [⟦T82⟧](/oss/python/integrations/document_loaders/google_cloud_sql_mysql) | [  ⟦T163⟧](https://pypi.org/project/langchain-google-cloud-sql-mysql/) |
| [⟦T83⟧](https://capslane.com/integrations/langchain) | [  ⟦T164⟧](https://pypi.org/project/capslane/) |
| [⟦T84⟧](https://comment-scraper.com/langchain) | [  ⟦T165⟧](https://pypi.org/project/langchain-comment-scraper/) |
| [⟦T85⟧](https://docs.agentql.com/home) | [  ⟦T166⟧](https://pypi.org/project/langchain-agentql/) |
| [⟦T86⟧](https://lyrenth.com/docs/integrations) | [  ⟦T167⟧](https://pypi.org/project/langchain-lyrenth/) |
| [⟦T87⟧](https://docs.proxyhat.com) | [  ⟦T168⟧](https://pypi.org/project/langchain-proxyhat/) |
| [⟦T88⟧](https://docs.airbyte.com/integrations/) | [  ⟦T169⟧](https://pypi.org/project/langchain-airbyte/) |
| [⟦T89⟧](https://github.com/undacmic/langchain-pdf-inspector) | [  ⟦T170⟧](https://pypi.org/project/langchain-pdf-inspector/) |
| [⟦T90⟧](https://github.com/enconvert/langchain-enconvert) | [  ⟦T171⟧](https://pypi.org/project/langchain-enconvert/) |
| [⟦T91⟧](https://undatas.io) | [  ⟦T172⟧](https://pypi.org/project/langchain-undatasio/) |
| [⟦T92⟧](https://github.com/casperkwok/pdfmuse) | [  ⟦T173⟧](https://pypi.org/project/langchain-pdfmuse/) |
| [⟦T93⟧](https://soniox.com/docs/stt/concepts/supported-languages) | [  ⟦T174⟧](https://pypi.org/project/langchain-soniox/) |
| [⟦T94⟧](https://docs.plasmate.app/integration-langchain) | [  ⟦T175⟧](https://pypi.org/project/langchain-plasmate/) |
| [⟦T95⟧](https://quanticdata.io/docs/) | [  ⟦T176⟧](https://pypi.org/project/langchain-quanticdata/) |
| [⟦T96⟧](/oss/python/integrations/document_loaders/google_cloud_sql_mssql) | [  ⟦T177⟧](https://pypi.org/project/langchain-google-cloud-sql-mssql/) |
| [⟦T97⟧](https://docs.xns.tech) | [  ⟦T178⟧](https://pypi.org/project/langchain-xns/) |
| [⟦T98⟧](https://docs.xns.tech) | [  ⟦T179⟧](https://pypi.org/project/langchain-xns/) |
| [⟦T99⟧](https://github.com/agentmail-to/langchain-agentmail) | [  ⟦T180⟧](https://pypi.org/project/langchain-agentmail/) |
| [⟦T100⟧](https://github.com/bzsanti/oxidize-pdf-integrations/tree/main/langchain) | [  ⟦T181⟧](https://pypi.org/project/langchain-oxidize-pdf/) |
| [⟦T101⟧](https://github.com/googleapis/langchain-google-el-carro-python/) | [  ⟦T182⟧](https://pypi.org/project/langchain-google-el-carro/) |
| [⟦T102⟧](https://github.com/fastocr-org/langchain-fastocr#readme) | [  ⟦T183⟧](https://pypi.org/project/langchain-fastocr/) |
| [⟦T103⟧](/oss/python/integrations/document_loaders/powerscale) | [  ⟦T184⟧](https://pypi.org/project/powerscale-rag-connector/) |
| [⟦T104⟧](/oss/python/integrations/document_loaders/langsmith) |不适用 |

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时答案。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/document_loaders/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。