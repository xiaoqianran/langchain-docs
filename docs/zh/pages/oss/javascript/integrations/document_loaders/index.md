<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Document loader integrations | https://docs.langchain.com/oss/javascript/integrations/document_loaders/index -->

# 文档加载器集成

使用 LangChain JavaScript 与文档加载器集成。

文档加载器提供了一个**标准接口**，用于将来自不同来源（例如 Slack、Notion 或 Google Drive）的数据读取为 LangChain 的 [Document](https://reference.langchain.com/javascript/langchain-core/documents/Document) 格式。
这确保了无论来源如何，都可以一致地处理数据。

所有文档加载器都实现 [BaseLoader](https://reference.langchain.com/javascript/langchain-core/document_loaders/base/BaseDocumentLoader) 接口。

<Warning>
  社区文档加载器是用户贡献的且未经验证。 LangChain 不审查或认可这些集成；使用它们的风险由您自行承担。
</Warning>

## 接口

每个文档加载器可以定义自己的参数，但它们共享一个公共 API：

* `load()`：一次加载所有文档。
* `loadAndSplit()`：一次加载所有文档并将它们分割成更小的文档。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { OracleDocLoader } from "@oracle/langchain-oracledb";

const loader = new OracleDocLoader(,
  ...  // <-- Integration specific parameters here
);
const data = await loader.load();
```

## 按类别

LangChain.js 以两种不同的方式对文档加载器进行分类：

* [File loaders](/oss/javascript/integrations/document_loaders/file_loaders/)，它将数据从本地文件系统加载为LangChain 格式。
* [Web loaders](/oss/javascript/integrations/document_loaders/web_loaders/)，从远程源加载数据。

### 文件加载器

<Info>
  如果您想贡献集成，请参阅[Contributing integrations](/oss/javascript/contributing#add-a-new-integration)。
</Info>

#### 常见文件类型|文档加载器|描述 |包/API |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ----------- |
| [⟦T3⟧](/oss/javascript/integrations/document_loaders/file_loaders/directory) |使用自定义加载程序映射从目录加载所有文件 |套餐 |
| [JSON](/oss/javascript/integrations/document_loaders/file_loaders/json) |使用 JSON 指针加载 JSON 文件以定位特定键 |套餐 |
| [⟦T4⟧](/oss/javascript/integrations/document_loaders/file_loaders/jsonlines) |从 JSONLines/JSONL 文件加载数据 |套餐 |
| [⟦T5⟧](/oss/javascript/integrations/document_loaders/file_loaders/text) |加载纯文本文件 |套餐 |

#### 专用文件加载器|文档加载器|描述 |包/API |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ----------- |
| [⟦T6⟧](/oss/javascript/integrations/document_loaders/file_loaders/multi_file) |从多个单独的文件路径加载数据 |套餐 |
| [⟦T7⟧](/oss/javascript/integrations/document_loaders/file_loaders/oracleai) |摄取 Oracle AI Vector Search 表或 Oracle Text 支持的文件 |套餐 |

### 网络加载器

#### 云提供商

|文档加载器|描述 |网络支持 |包/API |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | :---------: | ----------- |
| [Google Cloud SQL for PostgreSQL](/oss/javascript/integrations/document_loaders/web_loaders/google_cloudsql_pg) |从 Cloud SQL PostgreSQL 数据库加载文档 |      ✅ |套餐 |

#### 音频和视频|文档加载器|描述 |网络支持 |包/API |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | :---------: | ----------- |
| [⟦T8⟧](/oss/javascript/integrations/document_loaders/web_loaders/soniox) |使用 Soniox API 转录多语言音频文件并提供可选翻译 |      ✅ |应用程序接口 |

####其他

|文档加载器|描述 |网络支持 |包/API |
| -------------------------------------------------------------------------------------------------- | --------------------------------------- | :---------: | ----------- |
| [⟦T9⟧](/oss/javascript/integrations/document_loaders/web_loaders/langsmith) |从 LangSmith 加载数据集和轨迹 |      ✅ |应用程序接口 |

## 所有文档加载器<div>
  |整合|下载 |
  | :-------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
  | [⟦T10⟧](/oss/javascript/integrations/document_loaders/web_loaders/google_cloudsql_pg) | <span><a href="https://www.npmjs.com/package/@langchain/google-cloud-sql-pg"><img alt="Downloads per month" /></a></span> |
  | [⟦T11⟧](/oss/javascript/integrations/document_loaders/web_loaders/soniox) | <span><a href="https://www.npmjs.com/package/@soniox/langchain"><img alt="Downloads per month" /></a></span> |
  | [⟦T12⟧](/oss/javascript/integrations/document_loaders/file_loaders/directory) | <span>N/A</span> |
  | [⟦T13⟧](/oss/javascript/integrations/document_loaders/file_loaders/json) | <span>N/A</span> |
  | [⟦T14⟧](/oss/javascript/integrations/document_loaders/file_loaders/jsonlines) | <span>N/A</span> || [⟦T15⟧](/oss/javascript/integrations/document_loaders/web_loaders/langsmith) | <span>N/A</span> |
  | [⟦T16⟧](/oss/javascript/integrations/document_loaders/file_loaders/multi_file) | <span>N/A</span> |
  | [⟦T17⟧](/oss/javascript/integrations/document_loaders/file_loaders/oracleai) | <span>N/A</span> |
  | [⟦T18⟧](/oss/javascript/integrations/document_loaders/file_loaders/text) | <span>N/A</span> |
</div>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/document_loaders/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>