<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Retriever integrations | https://docs.langchain.com/oss/python/integrations/retrievers/index -->

# 检索器集成

使用 LangChain Python 与检索器集成。

[retriever](/oss/python/deepagents/retrieval#building-blocks) 是一个根据非结构化查询返回文档的接口。
它比矢量存储更通用。
检索器不需要能够存储文档，只需返回（或检索）它们即可。
检索器可以从向量存储中创建，但也足够广泛以包含其他来源。

检索器接受字符串查询作为输入，并返回 [⟦T0⟧](https://reference.langchain.com/python/langchain-core/documents/base/Document) 对象列表作为输出。

请注意，所有 [vector stores](/oss/python/integrations/vectorstores) 都可以转换为检索器。请参阅矢量存储 [integration docs](/oss/python/integrations/vectorstores/) 了解可用的矢量存储。
此页面列出了通过子类化 BaseRetriever 实现的自定义检索器。

集成组件
箭头显示了典型的检索流程。突出显示的组件是本页所涵盖的组件。

### 典型检索流程

### 代理能力

### 执行和状态

## 自备文件

以下检索器允许您索引和搜索自定义文档语料库。|猎犬 |自托管 |云产品|套餐 |
| - | - | - | - |
| [⟦T1⟧](/oss/python/integrations/retrievers/bedrock) | ❌ | ✅ | [⟦T2⟧](https://reference.langchain.com/python/langchain-aws/retrievers/bedrock/AmazonKnowledgeBasesRetriever) |
| [⟦T3⟧](/oss/python/integrations/retrievers/azure_ai_search) | ❌ | ✅ | [⟦T4⟧](https://reference.langchain.com/python/langchain-azure-ai) |
| [⟦T5⟧](/oss/python/integrations/retrievers/elasticsearch_retriever) | ✅ | ✅ | [⟦T6⟧](https://reference.langchain.com/python/langchain-elasticsearch/retrievers/ElasticsearchRetriever) |
| [⟦T7⟧](/oss/python/integrations/retrievers/mongodb_atlas) | ❌ | ✅ | [⟦T8⟧](https://reference.langchain.com/python/langchain-mongodb/retrievers/MongoDBAtlasHybridSearchRetriever) |
| [⟦T9⟧](https://memstate.ai/docs/integrations/langchain) | ❌ | ✅ | [⟦T10⟧](https://pypi.org/project/langchain-memstate/) |
| [⟦T11⟧](https://mengram.io/docs) | ✅ | ✅ | [⟦T12⟧](https://pypi.org/project/langchain-mengram/) |
| [⟦T13⟧](/oss/python/integrations/retrievers/nvidia) | ✅ | ❌ | [⟦T14⟧](https://reference.langchain.com/python/langchain-nvidia-ai-endpoints/retrievers/NVIDIARAGRetriever) |
| [⟦T15⟧](/oss/python/integrations/retrievers/google_vertex_ai_search) | ❌ | ✅ | [⟦T16⟧](https://reference.langchain.com/python/langchain-google-community/vertex_ai_search/VertexAISearchRetriever) |

## 外部索引

以下检索器将搜索外部索引（例如，根据互联网数据或类似数据构建）。

|猎犬 |来源 |套餐 |
| - | - | - |
| [⟦T17⟧](https://docs.apify.com/integrations/langchain) |通过[Apify RAG Web Browser](https://apify.com/apify/rag-web-browser)互联网搜索| [⟦T18⟧](https://pypi.org/project/langchain-apify/) |
| [⟦T19⟧](https://github.com/diffbot/langchain-diffbot) |通过 Diffbot 知识图进行实体搜索 | [⟦T20⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T21⟧](https://github.com/diffbot/langchain-diffbot) |通过 Diffbot Web Search API 进行互联网搜索 | [⟦T22⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T23⟧](/oss/python/integrations/retrievers/parallel) |通过[Parallel Search API](https://docs.parallel.ai/search/search-quickstart)互联网搜索| [⟦T24⟧](https://reference.langchain.com/python/langchain-parallel/retrievers/ParallelSearchRetriever) |
| [⟦T25⟧](/oss/python/integrations/retrievers/perplexity_search) |通过[Perplexity Search API](https://docs.perplexity.ai/docs/search/quickstart)互联网搜索 | [⟦T26⟧](https://reference.langchain.com/python/langchain-perplexity/retrievers/PerplexitySearchRetriever) |
| [⟦T27⟧](https://you.com/docs/integrations/langchain) |网络搜索| [⟦T28⟧](https://pypi.org/project/langchain-youdotcom/) |

## 所有猎犬|猎犬 |自托管 |云产品|套餐 |下载 |
| :- | :- | :- | :- | :- |
| [⟦T29⟧](/oss/python/integrations/retrievers/google_drive) | | | [⟦T30⟧](https://pypi.org/project/langchain-google-community/) | [  ⟦T231⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T31⟧](/oss/python/integrations/retrievers/google_vertex_ai_search) | ❌ | ✅ | [⟦T32⟧](https://reference.langchain.com/python/langchain-google-community/vertex_ai_search/VertexAISearchRetriever) | [  ⟦T232⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T33⟧](/oss/python/integrations/retrievers/bedrock) | ❌ | ✅ | [⟦T34⟧](https://reference.langchain.com/python/langchain-aws/retrievers/bedrock/AmazonKnowledgeBasesRetriever) | [  ⟦T233⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T35⟧](/oss/python/integrations/retrievers/mongodb_atlas) | | | [⟦T36⟧](https://pypi.org/project/langchain-mongodb/) | [  ⟦T234⟧](https://pypi.org/project/langchain-mongodb/) |
| [⟦T37⟧](/oss/python/integrations/retrievers/cohere) | | | [⟦T38⟧](https://pypi.org/project/langchain-cohere/) | [  ⟦T235⟧](https://pypi.org/project/langchain-cohere/) |
| [⟦T39⟧](/oss/python/integrations/retrievers/cohere-reranker) | | | [⟦T40⟧](https://pypi.org/project/langchain-cohere/) | [  ⟦T236⟧](https://pypi.org/project/langchain-cohere/) |
| [⟦T41⟧](/oss/python/integrations/retrievers/nvidia) | ✅ | ❌ | [⟦T42⟧](https://reference.langchain.com/python/langchain-nvidia-ai-endpoints/retrievers/NVIDIARAGRetriever) | [  ⟦T237⟧](https://pypi.org/project/langchain-nvidia-ai-endpoints/) |
| [⟦T43⟧](/oss/python/integrations/retrievers/pinecone_rerank) | | | [⟦T44⟧](https://pypi.org/project/langchain-pinecone/) | [  ⟦T238⟧](https://pypi.org/project/langchain-pinecone/) |
| [⟦T45⟧](/oss/python/integrations/retrievers/ibm_watsonx_ranker) | | | [⟦T46⟧](https://reference.langchain.com/python/langchain-ibm) | [  ⟦T239⟧](https://pypi.org/project/langchain-ibm/) |
| [⟦T47⟧](/oss/python/integrations/retrievers/perplexity_search) | ❌ | ✅ | [⟦T48⟧](https://reference.langchain.com/python/langchain-perplexity/retrievers/PerplexitySearchRetriever) | [  ⟦T240⟧](https://pypi.org/project/langchain-perplexity/) |
| [⟦T49⟧](/oss/python/integrations/retrievers/graph_rag) | | | [⟦T50⟧](https://pypi.org/project/langchain-graph-retriever/) | [  ⟦T241⟧](https://pypi.org/project/langchain-graph-retriever/) |
| [⟦T51⟧](/oss/python/integrations/retrievers/elasticsearch_retriever) | ✅ | ✅ | [⟦T52⟧](https://reference.langchain.com/python/langchain-elasticsearch/retrievers/ElasticsearchRetriever) | [  ⟦T242⟧](https://pypi.org/project/langchain-elasticsearch/)​​ |
| [⟦T53⟧](/oss/python/integrations/retrievers/parallel) | ❌ | ✅ | [⟦T54⟧](https://reference.langchain.com/python/langchain-parallel/retrievers/ParallelSearchRetriever) | [  ⟦T243⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T55⟧](https://docs.apify.com/integrations/langchain) | | | [⟦T56⟧](https://pypi.org/project/langchain-apify/) | [  ⟦T244⟧](https://pypi.org/project/langchain-apify/) |
| [⟦T57⟧](https://pypi.org/project/langchain-hana/) | | | [⟦T58⟧](https://pypi.org/project/langchain-hana/) | [  ⟦T245⟧](https://pypi.org/project/langchain-hana/) |
| [⟦T59⟧](https://github.com/skynetcmd/m3-memory/blob/main/docs/integrations/LANGCHAIN.md) | ✅ | ❌ | [⟦T60⟧](https://pypi.org/project/m3-memory/) | [  ⟦T246⟧](https://pypi.org/project/m3-memory/) |
| [⟦T61⟧](https://docs.getsemantica.ai/integrations/langchain) | ✅ | ❌ | [⟦T62⟧](https://pypi.org/project/semantica/) | [  ⟦T247⟧](https://pypi.org/project/semantica/) |
| [⟦T63⟧](/oss/python/integrations/retrievers/ragatouille) | | | [⟦T64⟧](https://pypi.org/project/ragatouille/) | [  ⟦T248⟧](https://pypi.org/project/ragatouille/) |
| [⟦T65⟧](https://github.com/Thanatos9404/llmslim/blob/main/docs/integrations/LANGCHAIN.md) | ✅ | ❌ | [⟦T66⟧](https://pypi.org/project/llmslim/) | [  ⟦T249⟧](https://pypi.org/project/llmslim/) |
| [⟦T67⟧](https://docs.tokenfactory.nebius.com/quickstart) | | | [⟦T68⟧](https://pypi.org/project/langchain-nebius/) | [  ⟦T250⟧](https://pypi.org/project/langchain-nebius/) |
| [⟦T69⟧](https://github.com/LinkupPlatform/langchain-linkup) | | | [⟦T70⟧](https://pypi.org/project/langchain-linkup/) | [  ⟦T251⟧](https://pypi.org/project/langchain-linkup/) |
| [⟦T71⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | | | [⟦T72⟧](https://pypi.org/project/langchain-nimble/) | [  ⟦T252⟧](https://pypi.org/project/langchain-nimble/) |
| [⟦T73⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | | | [⟦T74⟧](https://pypi.org/project/langchain-nimble/) | [  ⟦T253⟧](https://pypi.org/project/langchain-nimble/) |
| [⟦T75⟧](https://giulioder.github.io/RE-call/integrations.html) | ✅ | ❌ | [⟦T76⟧](https://pypi.org/project/recall-rag/) | [  ⟦T254⟧](https://pypi.org/project/recall-rag/) |
| [⟦T77⟧](https://github.com/singlestore-labs/langchain-singlestore/) | ✅ | ✅ | [⟦T78⟧](https://pypi.org/project/langchain-singlestore/) | [  ⟦T255⟧](https://pypi.org/project/langchain-singlestore/) |
| [⟦T79⟧](https://sourcey.com/docs/guides/guide-langchain-retriever) | | | [⟦T80⟧](https://pypi.org/project/langchain-sourcey/) | [  ⟦T256⟧](https://pypi.org/project/langchain-sourcey/) |
| [⟦T81⟧](https://maximem.ai) | | | [⟦T82⟧](https://pypi.org/project/maximem-synap-langchain/) | [  ⟦T257⟧](https://pypi.org/project/maximem-synap-langchain/) |
| [⟦T83⟧](https://github.com/SpaceFrontiers/machinelibrary-integrations/tree/main/python/langchain-machinelibrary) | | | [⟦T84⟧](https://pypi.org/project/langchain-machinelibrary/) | [  ⟦T258⟧](https://pypi.org/project/langchain-machinelibrary/) |
| [⟦T85⟧](https://you.com/docs/integrations/langchain) | ❌ | ✅ | [⟦T86⟧](https://pypi.org/project/langchain-youdotcom/) | [  ⟦T259⟧](https://pypi.org/project/langchain-youdotcom/) |
| [⟦T87⟧](https://docs.kapa.ai/retrieval/frameworks/langchain) | | | [⟦T88⟧](https://pypi.org/project/langchain-kapa-ai/) | [  ⟦T260⟧](https://pypi.org/project/langchain-kapa-ai/) |
| [⟦T89⟧](https://replylayer.ai/docs/guides/langchain) | ❌ | ✅ | [⟦T90⟧](https://pypi.org/project/langchain-replylayer/) | [  ⟦T261⟧](https://pypi.org/project/langchain-replylayer/) || [⟦T91⟧](https://specstream.ai/docs/langchain) | | | [⟦T92⟧](https://pypi.org/project/langchain-specstream/) | [  ⟦T262⟧](https://pypi.org/project/langchain-specstream/) |
| [⟦T93⟧](https://docs.hydrafetch.com) | | | [⟦T94⟧](https://pypi.org/project/langchain-hydrafetch/) | [  ⟦T263⟧](https://pypi.org/project/langchain-hydrafetch/) |
| [⟦T95⟧](https://docs.valyu.ai/overview) | | | [⟦T96⟧](https://pypi.org/project/langchain-valyu/) | [  ⟦T264⟧](https://pypi.org/project/langchain-valyu/) |
| [⟦T97⟧](https://github.com/ClickHouse/loom/blob/v1.3.0-rc.1/docs/features/integrations/frameworks.md#langchain) | ✅ | | [⟦T98⟧](https://pypi.org/project/clickhouse-loom/) | [  ⟦T265⟧](https://pypi.org/project/clickhouse-loom/) |
| [⟦T99⟧](https://github.com/ClickHouse/loom/blob/v1.3.0-rc.1/docs/features/integrations/frameworks.md#langchain) | ✅ | | [⟦T100⟧](https://pypi.org/project/clickhouse-loom/) | [  ⟦T266⟧](https://pypi.org/project/clickhouse-loom/) |
| [⟦T101⟧](https://github.com/diffbot/langchain-diffbot) | | | [⟦T102⟧](https://pypi.org/project/langchain-diffbot/) | [  ⟦T267⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T103⟧](https://github.com/diffbot/langchain-diffbot) | | | [⟦T104⟧](https://pypi.org/project/langchain-diffbot/) | [  ⟦T268⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T105⟧](https://github.com/Yarmoluk/langchain-ckg) | | | [⟦T106⟧](https://pypi.org/project/langchain-ckg/) | [  ⟦T269⟧](https://pypi.org/project/langchain-ckg/) |
| [⟦T107⟧](https://blopus.ai/docs/) | | | [⟦T108⟧](https://pypi.org/project/langchain-blopus/) | [  ⟦T270⟧](https://pypi.org/project/langchain-blopus/) |
| [⟦T109⟧](https://recallmem.dev/guides/langchain) | ✅ | ✅ | [⟦T110⟧](https://pypi.org/project/langchain-recall/) | [  ⟦T271⟧](https://pypi.org/project/langchain-recall/) |
| [⟦T111⟧](https://docs.contextual.ai/) | | | [⟦T112⟧](https://pypi.org/project/langchain-contextual/) | [  ⟦T272⟧](https://pypi.org/project/langchain-contextual/) |
| [⟦T113⟧](https://foxnose.net/docs/integrations/langchain) | ❌ | ✅ | [⟦T114⟧](https://pypi.org/project/langchain-foxnose/) | [  ⟦T273⟧](https://pypi.org/project/langchain-foxnose/) |
| [⟦T115⟧](/oss/python/integrations/retrievers/box) | | | [⟦T116⟧](https://pypi.org/project/langchain-box/) | [  ⟦T274⟧](https://pypi.org/project/langchain-box/) |
| [⟦T117⟧](https://docs.dappier.com/) | | | [⟦T118⟧](https://pypi.org/project/langchain-dappier/) | [  ⟦T275⟧](https://pypi.org/project/langchain-dappier/) |
| [⟦T119⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T120⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T276⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T121⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T122⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T277⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T123⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T124⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T278⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T125⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T126⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T279⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T127⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T128⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T280⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T129⟧](https://github.com/priya-sundaram-dev/whoosh/tree/main/integrations/langchain-whoosh#readme) | ✅ | ❌ | [⟦T130⟧](https://pypi.org/project/langchain-whoosh/) | [  ⟦T281⟧](https://pypi.org/project/langchain-whoosh/) |
| [⟦T131⟧](https://github.com/Veroq-ai/polaris-sdks/tree/main/python/langchain_polaris) | | | [⟦T132⟧](https://pypi.org/project/langchain-polaris/) | [  ⟦T282⟧](https://pypi.org/project/langchain-polaris/) |
| [⟦T133⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#alfrescoretriever) | ✅ | ❌ | [⟦T134⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T283⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T135⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#documentumretriever) | ✅ | ❌ | [⟦T136⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T284⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T137⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#filenetp8retriever) | ✅ | ❌ | [⟦T138⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T285⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T139⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#onbaseretriever) | ✅ | ❌ | [⟦T140⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T286⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T141⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md) | ✅ | ❌ | [⟦T142⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T287⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T143⟧](https://memstate.ai/docs/integrations/langchain) | ❌ | ✅ | [⟦T144⟧](https://pypi.org/project/langchain-memstate/) | [  ⟦T288⟧](https://pypi.org/project/langchain-memstate/) |
| [⟦T145⟧](https://alphai.io/developers) | | | [⟦T146⟧](https://pypi.org/project/langchain-alphai/) | [  ⟦T289⟧](https://pypi.org/project/langchain-alphai/) |
| [⟦T147⟧](https://axiora.dev/docs) | ❌ | ✅ | [⟦T148⟧](https://pypi.org/project/langchain-axiora/) | [  ⟦T290⟧](https://pypi.org/project/langchain-axiora/) |
| [⟦T149⟧](https://mengram.io/docs) | ✅ | ✅ | [⟦T150⟧](https://pypi.org/project/langchain-mengram/) | [  ⟦T291⟧](https://pypi.org/project/langchain-mengram/) |
| [⟦T151⟧](https://github.com/authzed/langchain-spicedb) | | | [⟦T152⟧](https://pypi.org/project/langchain-spicedb/) | [  ⟦T292⟧](https://pypi.org/project/langchain-spicedb/) |
| [⟦T153⟧](https://github.com/unibaseio/membase/tree/main/integrations/langchain#readme) | | ✅ | [⟦T154⟧](https://pypi.org/project/langchain-membase/) | [  ⟦T293⟧](https://pypi.org/project/langchain-membase/) |
| [⟦T155⟧](https://github.com/ashishsinha1602/langchain-schemagate#readme) | | | [⟦T156⟧](https://pypi.org/project/langchain-schemagate/) | [  ⟦T294⟧](https://pypi.org/project/langchain-schemagate/) |
| [⟦T157⟧](https://docs.cala.ai) | ❌ | ✅ | [⟦T158⟧](https://pypi.org/project/langchain-cala/) | [  ⟦T295⟧](https://pypi.org/project/langchain-cala/) || [⟦T159⟧](https://github.com/kineticadb/langchain-kinetica) | | | [⟦T160⟧](https://pypi.org/project/langchain-kinetica/) | [  ⟦T296⟧](https://pypi.org/project/langchain-kinetica/) |
| [⟦T161⟧](/oss/python/integrations/retrievers/egnyte) | | | [⟦T162⟧](https://pypi.org/project/egnyte-langchain-connector/) | [  ⟦T297⟧](https://pypi.org/project/egnyte-langchain-connector/) |
| [⟦T163⟧](https://docs.permit.io/) | | | [⟦T164⟧](https://pypi.org/project/langchain-permit/) | [  ⟦T298⟧](https://pypi.org/project/langchain-permit/) |
| [⟦T165⟧](https://www.high-snr.com/docs.html) | ❌ | ✅ | [⟦T166⟧](https://pypi.org/project/langchain-highsnr/) | [  ⟦T299⟧](https://pypi.org/project/langchain-highsnr/) |
| [⟦T167⟧](https://coalent.ai/docs) | ✅ | ❌ | [⟦T168⟧](https://pypi.org/project/langchain-coalent/) | [  ⟦T300⟧](https://pypi.org/project/langchain-coalent/) |
| [⟦T169⟧](https://pypi.org/project/langchain-hugging-bay/0.1.0/) | | | [⟦T170⟧](https://pypi.org/project/langchain-hugging-bay/) | [  ⟦T301⟧](https://pypi.org/project/langchain-hugging-bay/) |
| [⟦T171⟧](https://smabbler.gitbook.io/smabbler/api-rag/smabblers-api-rag) | | | [⟦T172⟧](https://pypi.org/project/langchain-galaxia-retriever/) | [  ⟦T302⟧](https://pypi.org/project/langchain-galaxia-retriever/) |
| [⟦T173⟧](https://docs.cognee.ai/) | | | [⟦T174⟧](https://pypi.org/project/langchain-cognee/) | [  ⟦T303⟧](https://pypi.org/project/langchain-cognee/) |
| [⟦T175⟧](https://github.com/urraf/langchain-stackoverflow#readme) | | | [⟦T176⟧](https://pypi.org/project/langchain-stackoverflow/) | [  ⟦T304⟧](https://pypi.org/project/langchain-stackoverflow/) |
| [⟦T177⟧](https://github.com/urraf/langchain-stackoverflow#readme) | | | [⟦T178⟧](https://pypi.org/project/langchain-stackoverflow/) | [  ⟦T305⟧](https://pypi.org/project/langchain-stackoverflow/) |
| [⟦T179⟧](https://github.com/agentmail-to/langchain-agentmail) | | | [⟦T180⟧](https://pypi.org/project/langchain-agentmail/) | [  ⟦T306⟧](https://pypi.org/project/langchain-agentmail/) |
| [⟦T181⟧](https://github.com/meetdewey/langchain-dewey) | ❌ | ✅ | [⟦T182⟧](https://pypi.org/project/langchain-dewey/) | [  ⟦T307⟧](https://pypi.org/project/langchain-dewey/) |
| [⟦T183⟧](https://docs.vectorize.io/rag-pipelines/retrieval-endpoint#access-tokens) | | | [⟦T184⟧](https://pypi.org/project/langchain-vectorize/) | [  ⟦T308⟧](https://pypi.org/project/langchain-vectorize/) |
| [⟦T185⟧](https://j1c.github.io/langchain-arxiv-retriever) | | | [⟦T186⟧](https://pypi.org/project/langchain-arxiv-retriever/) | [  ⟦T309⟧](https://pypi.org/project/langchain-arxiv-retriever/) |
| [⟦T187⟧](https://docs.igpt.ai/docs/sdks/langchain#igpt-search-retriever) | | | [⟦T188⟧](https://pypi.org/project/langchain-igpt/) | [  ⟦T310⟧](https://pypi.org/project/langchain-igpt/) |
| [⟦T189⟧](https://getalchemystai.com/docs) | ❌ | ✅ | [⟦T190⟧](https://pypi.org/project/alchemyst-langchain/) | [  ⟦T311⟧](https://pypi.org/project/alchemyst-langchain/) |
| [⟦T191⟧](https://github.com/urraf/langchain-reddit#readme) | | | [⟦T192⟧](https://pypi.org/project/langchain-reddit/) | [  ⟦T312⟧](https://pypi.org/project/langchain-reddit/) |
| [⟦T193⟧](https://github.com/urraf/langchain-reddit#readme) | | | [⟦T194⟧](https://pypi.org/project/langchain-reddit/) | [  ⟦T313⟧](https://pypi.org/project/langchain-reddit/) |
| [⟦T195⟧](https://github.com/urraf/langchain-reddit#readme) | | | [⟦T196⟧](https://pypi.org/project/langchain-reddit/) | [  ⟦T314⟧](https://pypi.org/project/langchain-reddit/) |
| [⟦T197⟧](https://github.com/SecAI-Lab/RAGDefender/blob/main/docs/integrations.md#langchain) | | | [⟦T198⟧](https://pypi.org/project/ragdefender/) | [  ⟦T315⟧](https://pypi.org/project/ragdefender/) |
| [⟦T199⟧](https://quanticdata.io/docs/) | | | [⟦T200⟧](https://pypi.org/project/langchain-quanticdata/) | [  ⟦T316⟧](https://pypi.org/project/langchain-quanticdata/) |
| [⟦T201⟧](https://github.com/urraf/langchain-hackernews#readme) | | | [⟦T202⟧](https://pypi.org/project/langchain-hackernews/) | [  ⟦T317⟧](https://pypi.org/project/langchain-hackernews/) |
| [⟦T203⟧](https://github.com/urraf/langchain-hackernews#readme) | | | [⟦T204⟧](https://pypi.org/project/langchain-hackernews/) | [  ⟦T318⟧](https://pypi.org/project/langchain-hackernews/) |
| [⟦T205⟧](https://github.com/urraf/langchain-hackernews#readme) | | | [⟦T206⟧](https://pypi.org/project/langchain-hackernews/) | [  ⟦T319⟧](https://pypi.org/project/langchain-hackernews/) |
| [⟦T207⟧](https://github.com/urraf/langchain-playstore#readme) | | | [⟦T208⟧](https://pypi.org/project/langchain-playstore/) | [  ⟦T320⟧](https://pypi.org/project/langchain-playstore/) |
| [⟦T209⟧](https://github.com/urraf/langchain-playstore#readme) | | | [⟦T210⟧](https://pypi.org/project/langchain-playstore/) | [  ⟦T321⟧](https://pypi.org/project/langchain-playstore/) |
| [⟦T211⟧](https://github.com/TimBMK/langchain-zotero-retriever) | | | [⟦T212⟧](https://pypi.org/project/langchain-zotero-retriever/) | [  ⟦T322⟧](https://pypi.org/project/langchain-zotero-retriever/) |
| [⟦T213⟧](https://greennode.ai/) | | | [⟦T214⟧](https://pypi.org/project/langchain-greennode/) | [  ⟦T323⟧](https://pypi.org/project/langchain-greennode/) |
| [⟦T215⟧](https://engram.ai/) | | | [⟦T216⟧](https://pypi.org/project/langchain-engram/) | [  ⟦T324⟧](https://pypi.org/project/langchain-engram/) |
| [⟦T217⟧](https://github.com/Keirolabs-API/langchain-keiro) | ❌ | ✅ | [⟦T218⟧](https://pypi.org/project/langchain-keiro/) | [  ⟦T325⟧](https://pypi.org/project/langchain-keiro/) |
| [⟦T219⟧](https://github.com/jfouret/langchain-imap) | | | [⟦T220⟧](https://pypi.org/project/langchain-imap/) | [  ⟦T326⟧](https://pypi.org/project/langchain-imap/) |
| [⟦T221⟧](https://perigon.io/docs/api/intro) | | | [⟦T222⟧](https://pypi.org/project/langchain-perigon/) | [  ⟦T327⟧](https://pypi.org/project/langchain-perigon/) |
| [⟦T223⟧](https://harny.ai/integrations/langchain) | | | [⟦T224⟧](https://pypi.org/project/langchain-harny/) | [  ⟦T328⟧](https://pypi.org/project/langchain-harny/) |
| [⟦T225⟧](https://github.com/nullure/langchain-openmemory) | | | [⟦T226⟧](https://pypi.org/project/langchain-openmemory/) | [  ⟦T329⟧](https://pypi.org/project/langchain-openmemory/) |
| [⟦T227⟧](https://github.com/wiiiktor/chopper_demo/tree/main/integrations/chopper-rag) | | | [⟦T228⟧](https://pypi.org/project/chopper-rag/) |不适用 || [⟦T229⟧](https://github.com/tonydzi/langchain-sqlite-graph-memory#readme) | | | [⟦T230⟧](https://pypi.org/project/langchain-sqlite-graph-memory/) |不适用 |

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/retrievers/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。