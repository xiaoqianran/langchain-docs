<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Document loader integrations | https://docs.langchain.com/oss/python/integrations/document_loaders/index -->

# 文档加载器集成

使用 LangChain Python 与文档加载器集成。

文档加载器提供了一个**标准接口**，用于将来自不同来源（例如 Slack、Notion 或 Google Drive）的数据读取为 LangChain 的 [Document](https://reference.langchain.com/python/langchain-core/documents/base/Document) 格式。
这确保了无论来源如何，都可以一致地处理数据。

所有文档加载器都实现 [⟦T1⟧](https://reference.langchain.com/python/langchain-core/document_loaders/base/BaseLoader) 接口。

<Warning>
  社区文档加载器是用户贡献的且未经验证。 LangChain 不审查或认可这些集成；使用它们的风险由您自行承担。
</Warning>

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

以下文档加载器允许您从常用的生产力工具加载数据。|文档加载器| API参考|
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [AgentMail](https://github.com/agentmail-to/langchain-agentmail) | [⟦T4⟧](https://github.com/agentmail-to/langchain-agentmail) |
| [Google Classroom](/oss/python/integrations/document_loaders/google_classroom) | [⟦T5⟧](https://pypi.org/project/langchain-google-classroom/) |

### 网页

下面的文档加载器允许您加载网页。

|文档加载器|描述 |包/API |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| [Unstructured](/oss/python/integrations/document_loaders/unstructured_file) |使用Unstructed 加载和解析网页|套餐 |
| [Apify Dataset](https://docs.apify.com/platform/storage/dataset) |从 Apify 数据集加载文档 |应用程序接口 || [Docling](/oss/python/integrations/document_loaders/docling) |使用Docling加载和解析网页|套餐 |
| [DomPruner](https://github.com/dong7812/dompruner-py) | DOM AST 修剪：将网页加载为紧凑的 Markdown，令牌减少 97% 以上，无需 API 密钥 |套餐 |
| [Firecrawl](https://docs.firecrawl.dev) |通过抓取/抓取/地图/提取/搜索将网站转变为干净的、可供法学硕士使用的数据 |应用程序接口 |
| [Hyperbrowser](https://docs.hyperbrowser.ai) |用于运行和扩展无头浏览器的平台，可用于抓取/爬行任何网站 |应用程序接口 |
| [OpeddFeedLoader](https://opedd.com/for-ai-agents) |将获得许可的 Opedd 内容目录加载为具有许可来源的文档 |应用程序接口 |
| [ProxyHatLoader](https://docs.proxyhat.com) |通过 ProxyHat 住宅代理加载网页作为文档 |应用程序接口 || [AgentQL](https://docs.agentql.com/) |使用 AgentQL 查询或自然语言提示从任何网页进行 Web 交互和结构化数据提取 |应用程序接口 |
| [CRW](https://fastcrw.com) |通过本地二进制文件或 fastcrw\.com 云实现与 Firecrawl 兼容的开源网络爬虫 |套餐 |
| [Plasmate](https://docs.plasmate.app/integration-langchain) |具有标记集 (SOM) 结构化 UI 提取功能的代理原生无头浏览器 |套餐 |
| [Spidra](https://docs.spidra.io) |具有真实浏览器、验证码解决和结构化数据提取的人工智能网络抓取工具 |应用程序接口 |

### PDF

下面的文档加载器允许您加载 PDF 文档。|文档加载器|描述 |包/API |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| [Unstructured](/oss/python/integrations/document_loaders/unstructured_file) |使用Unstructed的开源库加载PDF |套餐 |
| [Upstage Document Parse Loader](/oss/python/integrations/document_loaders/upstage) |使用 UpstageDocumentParseLoader 加载 PDF 文件 |套餐 |
| [Docling](/oss/python/integrations/document_loaders/docling) |使用 Docling 加载 PDF 文件 |套餐 |
| [MinerU](https://mineru.net) |使用 MinerU 加载 PDF 和其他文档 |套餐 || [UnDatasIO](https://undatas.io) |使用 UnDatasIO 加载 PDF 文件 |套餐 |
| [OpenDataLoader PDF](https://github.com/opendataloader-project/langchain-opendataloader-pdf) |使用 OpenDataLoader PDF | 加载 PDF 文件套餐 |
| [CVFileLoader](https://cvfile.org) |加载带有嵌入式 Markdown、HTML 和 JSON 简历负载的 .cv PDF/A-3u 文件 |套餐 |
| [pdfmuse](https://github.com/casperkwok/pdfmuse) |确定性地加载 PDF 和 DOCX 文件，并为 RAG | 提供精确的坐标、表格和每块部分元数据套餐 |
| [oxidize-pdf](https://github.com/bzsanti/oxidize-pdf-integrations/tree/main/langchain) |使用带有元素不相交 RAG 分块的 Rust 引擎加载 PDF 文件 |套餐 |
| [pdf-inspector](https://github.com/undacmic/langchain-pdf-inspector) |使用 pdf-inspector 加载 PDF 文件 |套餐 |

### 云提供商

下面的文档加载器允许您从您最喜欢的云提供商加载文档。|文档加载器|描述 |合作伙伴套餐 | API参考|
| -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [Google Cloud Storage Directory](/oss/python/integrations/document_loaders/google_cloud_storage_directory) |从 GCS 存储桶加载文档 | ✅ | [⟦T6⟧](https://reference.langchain.com/python/langchain-google-community/gcs_directory/GCSDirectoryLoader) |
| [Google Cloud Storage File](/oss/python/integrations/document_loaders/google_cloud_storage_file) |从 GCS 文件对象加载文档 | ✅ | [⟦T7⟧](https://reference.langchain.com/python/langchain-google-community/gcs_file/GCSFileLoader) |
| [Google Drive](/oss/python/integrations/document_loaders/google_drive) |从 Google 云端硬盘加载文档（仅限 Google 文档）| ✅ | [⟦T8⟧](https://reference.langchain.com/python/langchain-google-community/drive/GoogleDriveLoader) |

### 常见文件类型

以下文档加载器允许您从常见数据格式加载数据。|文档加载器|数据类型|
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [⟦T9⟧](/oss/python/integrations/document_loaders/unstructured_file) |许多文件类型（请参阅[https://docs.unstructured.io/platform/supported-file-types](https://docs.unstructured.io/platform/supported-file-types)）|
| [⟦T10⟧](https://github.com/jaypakdevkr/HWP-Loader) | HWP/HWPX 文件 |
| [⟦T11⟧](/oss/python/integrations/document_loaders/docling) |各种文件类型（参见[https://ds4sd.github.io/docling/](https://ds4sd.github.io/docling/)）|
| [⟦T12⟧](https://datainsight.polarisoffice.com/playground) |各种文件类型（参见[https://datainsight.polarisoffice.com/documentation?docType=doc\_extract](https://datainsight.polarisoffice.com/documentation?docType=doc_extract)）|

## 所有文档加载器<div>
  |整合 |下载 |
  | :------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------ |
  | [⟦T13⟧](/oss/python/integrations/document_loaders/google_bigquery) | <span><a href="https://pypi.org/project/langchain-google-community/"><img alt="Downloads per month" /></a></span>|
  | [⟦T14⟧](/oss/python/integrations/document_loaders/google_cloud_storage_directory) | <span><a href="https://pypi.org/project/langchain-google-community/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T15⟧](/oss/python/integrations/document_loaders/google_cloud_storage_file) | <span><a href="https://pypi.org/project/langchain-google-community/"><img alt="Downloads per month" /></a></span>|
  | [⟦T16⟧](/oss/python/integrations/document_loaders/google_drive) | <span><a href="https://pypi.org/project/langchain-google-community/"><img alt="Downloads per month" /></a></span>|
  | [⟦T17⟧](/oss/python/integrations/document_loaders/google_speech_to_text) | <span><a href="https://pypi.org/project/langchain-google-community/"><img alt="Downloads per month" /></a></span>|
  | [⟦T18⟧](/oss/python/integrations/document_loaders/unstructured_file) | <span><a href="https://pypi.org/project/langchain-unstructured/"><img alt="Downloads per month" /></a></span>|
  | [⟦T19⟧](/oss/python/integrations/document_loaders/astradb) | <span><a href="https://pypi.org/project/langchain-astradb/"><img alt="Downloads per month" /></a></span>|
  | [⟦T20⟧](/oss/python/integrations/document_loaders/oracleai) | <span><a href="https://pypi.org/project/langchain-oracledb/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T21⟧](/oss/python/integrations/document_loaders/oracleadb_loader) | <span><a href="https://pypi.org/project/langchain-oracledb/"> <img alt="Downloads per month" /></a></span> || [⟦T22⟧](/oss/python/integrations/document_loaders/docling) | <span><a href="https://pypi.org/project/langchain-docling/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T23⟧](/oss/python/integrations/document_loaders/upstage) | <span><a href="https://pypi.org/project/langchain-upstage/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T24⟧](/oss/python/integrations/document_loaders/google_alloydb) | <span><a href="https://pypi.org/project/langchain-google-alloydb-pg/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T25⟧](/oss/python/integrations/document_loaders/google_spanner) | <span><a href="https://pypi.org/project/langchain-google-spanner/"><img alt="Downloads per month" /></a></span>|
  | [⟦T26⟧](/oss/python/integrations/document_loaders/google_firestore) | <span><a href="https://pypi.org/project/langchain-google-firestore/"><img alt="Downloads per month" /></a></span>|
  | [⟦T27⟧](https://docs.apify.com/storage/dataset) | <span><a href="https://pypi.org/project/langchain-apify/"><img alt="Downloads per month" /></a></span>|
  | [⟦T28⟧](https://github.com/pymupdf/langchain-pymupdf4llm) | <span><a href="https://pypi.org/project/langchain-pymupdf4llm/"><img alt="Downloads per month" /></a></span>|
  | [⟦T29⟧](https://docs.cloud.google.com/sql/docs/postgres) | <span><a href="https://pypi.org/project/langchain-google-cloud-sql-pg/"><img alt="Downloads per month" /></a></span>|
  | [⟦T30⟧](https://github.com/opendataloader-project/langchain-opendataloader-pdf) | <span><a href="https://pypi.org/project/langchain-opendataloader-pdf/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T31⟧](https://dev.writer.com/api-reference/tool-api/pdf-parser#parse-pdf) | <span><a href="https://pypi.org/project/langchain-writer/"><img alt="Downloads per month" /></a></span>|
  | [⟦T32⟧](https://github.com/aqib0770/langchain-yt-dlp) | <span><a href="https://pypi.org/project/langchain-yt-dlp/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T33⟧](/oss/python/integrations/document_loaders/azure_blob_storage) | <span><a href="https://pypi.org/project/langchain-azure-storage/"><img alt="Downloads per month" /></a></span>|
  | [⟦T34⟧](/oss/python/integrations/document_loaders/docugami) | <span><a href="https://pypi.org/project/docugami-langchain/"> <img alt="Downloads per month" /></a></span> || [⟦T35⟧](https://replylayer.ai/docs/guides/langchain) | <span><a href="https://pypi.org/project/langchain-replylayer/"><img alt="Downloads per month" /></a></span>|
  | [⟦T36⟧](https://github.com/arsbr/Veritensor) | <span><a href="https://pypi.org/project/veritensor/"><img alt="Downloads per month" /></a></span>|
  | [⟦T37⟧](https://mineru.net) | <span><a href="https://pypi.org/project/langchain-mineru/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T38⟧](https://opedd.com/for-ai-agents) | <span><a href="https://pypi.org/project/langchain-opedd/"><img alt="Downloads per month" /></a></span>|
  | [⟦T39⟧](https://docs.proxyhat.com) | <span><a href="https://pypi.org/project/langchain-proxyhat/"><img alt="Downloads per month" /></a></span>|
  | [⟦T40⟧](https://github.com/singlestore-labs/langchain-singlestore/) | <span><a href="https://pypi.org/project/langchain-singlestore/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T41⟧](/oss/python/integrations/document_loaders/google_memorystore_redis) | <span><a href="https://pypi.org/project/langchain-google-memorystore-redis/"><img alt="Downloads per month" /></a></span>|
  | [⟦T42⟧](https://docs.spidra.io) | <span><a href="https://pypi.org/project/langchain-spidra/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T43⟧](https://fastcrw.com) | <span><a href="https://pypi.org/project/langchain-crw/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T44⟧](https://github.com/10Pines/langchain-outline) | <span><a href="https://pypi.org/project/langchain-outline/"> <img alt="Downloads per month" /></a></span> || [⟦T45⟧](https://github.com/undacmic/langchain-pdf-inspector) | <span><a href="https://pypi.org/project/langchain-pdf-inspector/"><img alt="Downloads per month" /></a></span>|
  | [⟦T46⟧](https://www.hyperbrowser.ai/docs/home) | <span><a href="https://pypi.org/project/langchain-hyperbrowser/"><img alt="Downloads per month" /></a></span>|
  | [⟦T47⟧](https://github.com/jaypakdevkr/HWP-Loader) | <span><a href="https://pypi.org/project/langchain-hwp-hwpx-loader/"><img alt="Downloads per month" /></a></span>|
  | [⟦T48⟧](/oss/python/integrations/document_loaders/google_bigtable) | <span><a href="https://pypi.org/project/langchain-google-bigtable/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T49⟧](https://anakin.io/docs/documentation) | <span><a href="https://pypi.org/project/langchain-anakin/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T50⟧](https://datainsight.polarisoffice.com/playground) | <span><a href="https://pypi.org/project/langchain-polaris-ai-datainsight/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T51⟧](https://www.paddleocr.com) | <span><a href="https://pypi.org/project/langchain-paddleocr/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T52⟧](https://developer.box.com/) | <span><a href="https://pypi.org/project/langchain-box/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T53⟧](https://cvfile.org) | <span><a href="https://pypi.org/project/langchain-cvfile/"><img alt="Downloads per month" /></a></span>|
  | [⟦T54⟧](/oss/python/integrations/document_loaders/google_classroom) | <span><a href="https://pypi.org/project/langchain-google-classroom/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T55⟧](/oss/python/integrations/document_loaders/google_cloud_sql_mysql) | <span><a href="https://pypi.org/project/langchain-google-cloud-sql-mysql/"><img alt="Downloads per month" /></a></span>|| [⟦T56⟧](https://github.com/kineticadb/langchain-kinetica) | <span><a href="https://pypi.org/project/langchain-kinetica/"><img alt="Downloads per month" />​​</a></span>|
  | [⟦T57⟧](/oss/python/integrations/document_loaders/google_datastore) | <span><a href="https://pypi.org/project/langchain-google-datastore/"><img alt="Downloads per month" /></a></span>|
  | [⟦T58⟧](https://docs.agentql.com/home) | <span><a href="https://pypi.org/project/langchain-agentql/"><img alt="Downloads per month" /></a></span>|
  | [⟦T59⟧](https://undatas.io) | <span><a href="https://pypi.org/project/langchain-undatasio/"><img alt="Downloads per month" /></a></span>|
  | [⟦T60⟧](https://docs.firecrawl.dev) | <span><a href="https://pypi.org/project/langchain-firecrawl/"><img alt="Downloads per month" /></a></span>|
  | [⟦T61⟧](https://github.com/casperkwok/pdfmuse) | <span><a href="https://pypi.org/project/langchain-pdfmuse/"><img alt="Downloads per month" /></a></span>|
  | [⟦T62⟧](https://docs.plasmate.app/integration-langchain) | <span><a href="https://pypi.org/project/langchain-plasmate/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T63⟧](https://soniox.com/docs/stt/concepts/supported-languages) | <span><a href="https://pypi.org/project/langchain-soniox/"><img alt="Downloads per month" /></a></span>|
  | [⟦T64⟧](https://docs.airbyte.com/integrations/) | <span><a href="https://pypi.org/project/langchain-airbyte/"><img alt="Downloads per month" /></a></span>|
  | [⟦T65⟧](/oss/python/integrations/document_loaders/google_cloud_sql_mssql) | <span><a href="https://pypi.org/project/langchain-google-cloud-sql-mssql/"><img alt="Downloads per month" /></a></span>|
  | [⟦T66⟧](https://github.com/agentmail-to/langchain-agentmail) | <span><a href="https://pypi.org/project/langchain-agentmail/"><img alt="Downloads per month" /></a></span>|| [⟦T67⟧](https://github.com/bzsanti/oxidize-pdf-integrations/tree/main/langchain) | <span><a href="https://pypi.org/project/langchain-oxidize-pdf/"><img alt="Downloads per month" /></a></span>|
  | [⟦T68⟧](https://github.com/googleapis/langchain-google-el-carro-python/) | <span><a href="https://pypi.org/project/langchain-google-el-carro/"><img alt="Downloads per month" /></a></span> |
  | [⟦T69⟧](https://github.com/diffbot/langchain-diffbot) | <span><a href="https://pypi.org/project/langchain-diffbot/"><img alt="Downloads per month" /></a></span>|
  | [⟦T70⟧](https://github.com/diffbot/langchain-diffbot) | <span><a href="https://pypi.org/project/langchain-diffbot/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T71⟧](https://github.com/dong7812/dompruner-py) | <span><a href="https://pypi.org/project/dompruner/"><img alt="Downloads per month" /></a></span>|
  | [⟦T72⟧](/oss/python/integrations/document_loaders/powerscale) | <span><a href="https://pypi.org/project/powerscale-rag-connector/"><img alt="Downloads per month" /></a></span>|
  | [⟦T73⟧](/oss/python/integrations/document_loaders/langsmith) | <span>不适用</span> |
</div>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/document_loaders/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>