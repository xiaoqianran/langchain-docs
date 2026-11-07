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
> 社区文档加载器由用户贡献且未经验证。 LangChain 不审查或认可这些集成；使用它们的风险由您自行承担。

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

> [!注意]
>
> `PyPDFLoader`、`PyMuPDFLoader`、`PDFMinerLoader` 和 `PDFPlumberLoader` 位于未维护的 [⟦T10⟧](https://pypi.org/project/langchain-community/) 包中，但不应再使用。对于新工作，首选上述合作伙伴包之一。请参阅[LangChain Community sunset notice](https://github.com/langchain-ai/langchain-community/issues/674)。

### PDF

PDF 文件的合作伙伴和社区加载程序。首先列出托管合作伙伴指南。随后是来自 [⟦T11⟧](https://pypi.org/project/langchain-community/) 的经典加载器和其他社区包。如需完整下载分类目录，请参阅[All document loaders](#all-document-loaders)。|文档加载器|描述 |包/API |
| - | - | - |
| [Unstructured](/oss/python/integrations/document_loaders/unstructured_file) |使用Unstructed的开源库加载PDF |套餐 |
| [Upstage Document Parse Loader](/oss/python/integrations/document_loaders/upstage) |使用 UpstageDocumentParseLoader 加载 PDF 文件 |套餐 |
| [Docling](/oss/python/integrations/document_loaders/docling) |使用 Docling 加载 PDF 文件 |套餐 |
| `PyPDFLoader` |使用 `pypdf` (`langchain-community`) 加载 PDF 文件 |社区 |
| `PyMuPDFLoader` |使用 PyMuPDF 加载 PDF 文件 (`langchain-community`) |社区 |
| `PDFMinerLoader` |使用 PDFMiner 加载 PDF 文件 (`langchain-community`) |社区 |
| `PDFPlumberLoader` |使用 pdfplumber (`langchain-community`) 加载 PDF 文件 |社区 |
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
| [Azure Blob Storage](/oss/python/integrations/document_loaders/azure_blob_storage) |从 Azure Blob 存储容器或单个 Blob 加载文档 | ✅ | [⟦T21⟧](https://github.com/langchain-ai/langchain-azure/tree/main/libs/azure-storage) |
| [Google Cloud Storage Directory](/oss/python/integrations/document_loaders/google_cloud_storage_directory) |从 GCS 存储桶加载文档 | ✅ | [⟦T22⟧](https://reference.langchain.com/python/langchain-google-community/gcs_directory/GCSDirectoryLoader) |
| [Google Cloud Storage File](/oss/python/integrations/document_loaders/google_cloud_storage_file) |从 GCS 文件对象加载文档 | ✅ | [⟦T23⟧](https://reference.langchain.com/python/langchain-google-community/gcs_file/GCSFileLoader) |
| [Google Drive](/oss/python/integrations/document_loaders/google_drive) |从 Google 云端硬盘加载文档（仅限 Google 文档）| ✅ | [⟦T24⟧](https://reference.langchain.com/python/langchain-google-community/drive/GoogleDriveLoader) |

### 常见文件类型

以下文档加载器允许您从常见数据格式加载数据。

|文档加载器|数据类型 |
| - | - |
| [⟦T25⟧](/oss/python/integrations/document_loaders/unstructured_file) |许多文件类型（请参阅[https://docs.unstructured.io/platform/supported-file-types](https://docs.unstructured.io/platform/supported-file-types)）|
| [⟦T26⟧](https://github.com/jaypakdevkr/HWP-Loader) | HWP/HWPX 文件 |
| [⟦T27⟧](/oss/python/integrations/document_loaders/docling) |各种文件类型（参见[https://docling-project.github.io/docling/](https://docling-project.github.io/docling/)）|
| [⟦T28⟧](https://datainsight.polarisoffice.com/playground) |各种文件类型（参见[https://datainsight.polarisoffice.com/documentation?docType=doc\_extract](https://datainsight.polarisoffice.com/documentation?docType=doc_extract)）|

> [!注意]
>
> 较旧的教程通常从 `langchain_community` 导入 `TextLoader` 和 `JSONLoader`。这些类仍然在未维护的 [⟦T32⟧](https://pypi.org/project/langchain-community/) 包中提供，但不应再使用。对于新工作，首选上述合作伙伴包之一。请参阅[LangChain Community sunset notice](https://github.com/langchain-ai/langchain-community/issues/674)。

## 所有文档加载器|整合 |下载 |
| :- | :- |
| [⟦T33⟧](/oss/python/integrations/document_loaders/google_bigquery) | [  ⟦T117⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T34⟧](/oss/python/integrations/document_loaders/google_cloud_storage_directory) | [  ⟦T118⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T35⟧](/oss/python/integrations/document_loaders/google_cloud_storage_file) | [  ⟦T119⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T36⟧](/oss/python/integrations/document_loaders/google_drive) | [  ⟦T120⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T37⟧](/oss/python/integrations/document_loaders/google_speech_to_text) | [  ⟦T121⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T38⟧](/oss/python/integrations/document_loaders/oracleai) | [  ⟦T122⟧](https://pypi.org/project/langchain-oracledb/) |
| [⟦T39⟧](/oss/python/integrations/document_loaders/oracleadb_loader) | [  ⟦T123⟧](https://pypi.org/project/langchain-oracledb/) |
| [⟦T40⟧](/oss/python/integrations/document_loaders/unstructured_file) | [  ⟦T124⟧](https://pypi.org/project/langchain-unstructured/) |
| [⟦T41⟧](/oss/python/integrations/document_loaders/astradb) | [  ⟦T125⟧](https://pypi.org/project/langchain-astradb/) |
| [⟦T42⟧](/oss/python/integrations/document_loaders/docling) | [  ⟦T126⟧](https://pypi.org/project/langchain-docling/) |
| [⟦T43⟧](/oss/python/integrations/document_loaders/google_alloydb) | [  ⟦T127⟧](https://pypi.org/project/langchain-google-alloydb-pg/) |
| [⟦T44⟧](https://github.com/pymupdf/langchain-pymupdf4llm) | [  ⟦T128⟧](https://pypi.org/project/langchain-pymupdf4llm/) |
| [⟦T45⟧](https://docs.apify.com/integrations/langchain) | [  ⟦T129⟧](https://pypi.org/project/langchain-apify/) |
| [⟦T46⟧](https://docs.apify.com/integrations/langchain) | [  ⟦T130⟧](https://pypi.org/project/langchain-apify/) |
| [⟦T47⟧](/oss/python/integrations/document_loaders/upstage) | [  ⟦T131⟧](https://pypi.org/project/langchain-upstage/) |
| [⟦T48⟧](https://docs.cloud.google.com/sql/docs/postgres) | [  ⟦T132⟧](https://pypi.org/project/langchain-google-cloud-sql-pg/) |
| [⟦T49⟧](/oss/python/integrations/document_loaders/google_firestore) | [  ⟦T133⟧](https://pypi.org/project/langchain-google-firestore/) |
| [⟦T50⟧](/oss/python/integrations/document_loaders/google_spanner) | [  ⟦T134⟧](https://pypi.org/project/langchain-google-spanner/) |
| [⟦T51⟧](https://github.com/docling-project/docling.rs/blob/master/crates/docling-py/README.md#langchain) | [  ⟦T135⟧](https://pypi.org/project/langchain-docling-rs/) |
| [⟦T52⟧](/oss/python/integrations/document_loaders/azure_blob_storage) | [  ⟦T136⟧](https://pypi.org/project/langchain-azure-storage/) |
| [⟦T53⟧](https://github.com/flatmark-dev/flatmark-integrations/blob/main/langchain/README.md) | [  ⟦T137⟧](https://pypi.org/project/langchain-flatmark/) |
| [⟦T54⟧](https://docs.firecrawl.dev) | [  ⟦T138⟧](https://pypi.org/project/langchain-firecrawl/) |
| [⟦T55⟧](https://github.com/opendataloader-project/langchain-opendataloader-pdf) | [  ⟦T139⟧](https://pypi.org/project/langchain-opendataloader-pdf/) |
| [⟦T56⟧](https://anakin.io/docs/documentation) | [  ⟦T140⟧](https://pypi.org/project/langchain-anakin/) |
| [⟦T57⟧](/oss/python/integrations/document_loaders/docugami) | [  ⟦T141⟧](https://pypi.org/project/docugami-langchain/) |
| [⟦T58⟧](https://github.com/jaypakdevkr/HWP-Loader) | [  ⟦T142⟧](https://pypi.org/project/langchain-hwp-hwpx-loader/) |
| [⟦T59⟧](https://dev.writer.com/api-reference/tool-api/pdf-parser#parse-pdf) | [  ⟦T143⟧](https://pypi.org/project/langchain-writer/) |
| [⟦T60⟧](https://github.com/singlestore-labs/langchain-singlestore/) | [  ⟦T144⟧](https://pypi.org/project/langchain-singlestore/) |
| [⟦T61⟧](https://github.com/aqib0770/langchain-yt-dlp) | [  ⟦T145⟧](https://pypi.org/project/langchain-yt-dlp/) |
| [⟦T62⟧](https://superpdf.ai/docs/python/langchain-llamaindex#langchain) | [  ⟦T146⟧](https://pypi.org/project/langchain-superpdf/) |
| [⟦T63⟧](https://mesharc.dev/docs/langchain) | [  ⟦T147⟧](https://pypi.org/project/langchain-mesharc/) |
| [⟦T64⟧](https://www.hyperbrowser.ai/docs/home) | [  ⟦T148⟧](https://pypi.org/project/langchain-hyperbrowser/) |
| [⟦T65⟧](https://github.com/fastocr-org/langchain-fastocr#readme) | [  ⟦T149⟧](https://pypi.org/project/langchain-fastocr/) |
| [⟦T66⟧](https://replylayer.ai/docs/guides/langchain) | [  ⟦T150⟧](https://pypi.org/project/langchain-replylayer/) |
| [⟦T67⟧](https://docs.hydrafetch.com) | [  ⟦T151⟧](https://pypi.org/project/langchain-hydrafetch/) |
| [⟦T68⟧](https://github.com/arsbr/Veritensor) | [  ⟦T152⟧](https://pypi.org/project/veritensor/) |
| [⟦T69⟧](https://docs.spidra.io) | [  ⟦T153⟧](https://pypi.org/project/langchain-spidra/) |
| [⟦T70⟧](https://github.com/undacmic/langchain-pdf-inspector) | [  ⟦T154⟧](https://pypi.org/project/langchain-pdf-inspector/) |
| [⟦T71⟧](https://webcrawlerapi.com/docs/sdk/langchain) | [  ⟦T155⟧](https://pypi.org/project/webcrawlerapi-langchain/) |
| [⟦T72⟧](https://fastcrw.com) | [  ⟦T156⟧](https://pypi.org/project/langchain-crw/) |
| [⟦T73⟧](/oss/python/integrations/document_loaders/google_bigtable) | [  ⟦T157⟧](https://pypi.org/project/langchain-google-bigtable/) |
| [⟦T74⟧](https://github.com/10Pines/langchain-outline) | [  ⟦T158⟧](https://pypi.org/project/langchain-outline/) |
| [⟦T75⟧](https://mineru.net) | [  ⟦T159⟧](https://pypi.org/project/langchain-mineru/) |
| [⟦T76⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T160⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T77⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T161⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T78⟧](https://github.com/dong7812/dompruner-py) | [  ⟦T162⟧](https://pypi.org/project/dompruner/) |
| [⟦T79⟧](https://datainsight.polarisoffice.com/playground) | [  ⟦T163⟧](https://pypi.org/project/langchain-polaris-ai-datainsight/) |
| [⟦T80⟧](https://proxmint.com/docs/langchain) | [  ⟦T164⟧](https://pypi.org/project/langchain-proxmint/) |
| [⟦T81⟧](/oss/python/integrations/document_loaders/google_memorystore_redis) | [  ⟦T165⟧](https://pypi.org/project/langchain-google-memorystore-redis/) |
| [⟦T82⟧](https://opedd.com/for-ai-agents) | [  ⟦T166⟧](https://pypi.org/project/langchain-opedd/) |
| [⟦T83⟧](https://developer.box.com/) | [  ⟦T167⟧](https://pypi.org/project/langchain-box/) |
| [⟦T84⟧](https://pypi.org/project/langchain-anytomarkdown/) | [  ⟦T168⟧](https://pypi.org/project/langchain-anytomarkdown/) |
| [⟦T85⟧](https://github.com/kanavsingla28/web2md-clients/tree/main/python#readme) | [  ⟦T169⟧](https://pypi.org/project/web2md-client/) |
| [⟦T86⟧](https://www.paddleocr.com) | [  ⟦T170⟧](https://pypi.org/project/langchain-paddleocr/) |
| [⟦T87⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Loader.md#alfrescoloader) | [  ⟦T171⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T88⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Loader.md) | [  ⟦T172⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T89⟧](https://comment-scraper.com/langchain) | [  ⟦T173⟧](https://pypi.org/project/langchain-comment-scraper/) || [⟦T90⟧](/oss/python/integrations/document_loaders/google_classroom) | [  ⟦T174⟧](https://pypi.org/project/langchain-google-classroom/) |
| [⟦T91⟧](/oss/python/integrations/document_loaders/google_cloud_sql_mysql) | [  ⟦T175⟧](https://pypi.org/project/langchain-google-cloud-sql-mysql/) |
| [⟦T92⟧](https://github.com/kineticadb/langchain-kinetica) | [  ⟦T176⟧](https://pypi.org/project/langchain-kinetica/) |
| [⟦T93⟧](/oss/python/integrations/document_loaders/google_datastore) | [  ⟦T177⟧](https://pypi.org/project/langchain-google-datastore/) |
| [⟦T94⟧](https://docs.agentql.com/home) | [  ⟦T178⟧](https://pypi.org/project/langchain-agentql/) |
| [⟦T95⟧](https://cvfile.org) | [  ⟦T179⟧](https://pypi.org/project/langchain-cvfile/) |
| [⟦T96⟧](https://docs.proxyhat.com) | [  ⟦T180⟧](https://pypi.org/project/langchain-proxyhat/) |
| [⟦T97⟧](https://docs.airbyte.com/integrations/) | [  ⟦T181⟧](https://pypi.org/project/langchain-airbyte/) |
| [⟦T98⟧](https://capslane.com/integrations/langchain) | [  ⟦T182⟧](https://pypi.org/project/capslane/) |
| [⟦T99⟧](https://github.com/casperkwok/pdfmuse) | [  ⟦T183⟧](https://pypi.org/project/langchain-pdfmuse/) |
| [⟦T100⟧](https://lyrenth.com/docs/integrations) | [  ⟦T184⟧](https://pypi.org/project/langchain-lyrenth/) |
| [⟦T101⟧](https://docs.plasmate.app/integration-langchain) | [  ⟦T185⟧](https://pypi.org/project/langchain-plasmate/) |
| [⟦T102⟧](https://undatas.io) | [  ⟦T186⟧](https://pypi.org/project/langchain-undatasio/) |
| [⟦T103⟧](https://github.com/enconvert/langchain-enconvert) | [  ⟦T187⟧](https://pypi.org/project/langchain-enconvert/) |
| [⟦T104⟧](https://soniox.com/docs/stt/concepts/supported-languages) | [  ⟦T188⟧](https://pypi.org/project/langchain-soniox/) |
| [⟦T105⟧](https://github.com/agentmail-to/langchain-agentmail) | [  ⟦T189⟧](https://pypi.org/project/langchain-agentmail/) |
| [⟦T106⟧](https://quanticdata.io/docs/) | [  ⟦T190⟧](https://pypi.org/project/langchain-quanticdata/) |
| [⟦T107⟧](/oss/python/integrations/document_loaders/google_cloud_sql_mssql) | [  ⟦T191⟧](https://pypi.org/project/langchain-google-cloud-sql-mssql/) |
| [⟦T108⟧](https://github.com/bzsanti/oxidize-pdf-integrations/tree/main/langchain)​​ | [  ⟦T192⟧](https://pypi.org/project/langchain-oxidize-pdf/) |
| [⟦T109⟧](https://docs.xns.tech) | [  ⟦T193⟧](https://pypi.org/project/langchain-xns/) |
| [⟦T110⟧](https://docs.xns.tech) | [  ⟦T194⟧](https://pypi.org/project/langchain-xns/) |
| [⟦T111⟧](https://github.com/googleapis/langchain-google-el-carro-python/) | [  ⟦T195⟧](https://pypi.org/project/langchain-google-el-carro/) |
| [⟦T112⟧](/oss/python/integrations/document_loaders/powerscale) | [  ⟦T196⟧](https://pypi.org/project/powerscale-rag-connector/) |
| [⟦T113⟧](https://github.com/Omniwot/section-anything/tree/main/packages/langchain-section-anything) | [  ⟦T197⟧](https://pypi.org/project/langchain-section-anything/) |
| [⟦T114⟧](https://github.com/agentreader-xyz/agentreader-python/tree/main/langchain-agentreader) |不适用 |
| [⟦T115⟧](/oss/python/integrations/document_loaders/langsmith) |不适用 |
| [⟦T116⟧](https://transcriptfetch.com/docs/langchain) |不适用 |

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/document_loaders/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。