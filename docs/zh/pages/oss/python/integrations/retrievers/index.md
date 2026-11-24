<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Retriever integrations | https://docs.langchain.com/oss/python/integrations/retrievers/index -->

# 检索器集成

Integrate with retrievers using LangChain Python.

A [retriever](/oss/python/deepagents/retrieval#building-blocks) is an interface that returns documents given an unstructured query.
它比矢量存储更通用。
A retriever does not need to be able to store documents, only to return (or retrieve) them.
Retrievers can be created from vector stores, but are also broad enough to include other sources.

Retrievers accept a string query as input and return a list of [⟦T0⟧](https://reference.langchain.com/python/langchain-core/documents/base/Document) objects as output.

Note that all [vector stores](/oss/python/integrations/vectorstores) can be cast to retrievers. Refer to the vector store [integration docs](/oss/python/integrations/vectorstores/) for available vector stores.
This page lists custom retrievers, implemented via subclassing BaseRetriever.

集成组件
箭头显示了典型的检索流程。突出显示的组件是本页所涵盖的组件。

### 典型检索流程

### 代理能力

### 执行和状态

## 自备文件

The below retrievers allow you to index and search a custom corpus of documents.|猎犬 |自托管 |云产品|套餐 |
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
| [⟦T23⟧](/oss/python/integrations/retrievers/parallel) |通过[Parallel Search API](https://docs.parallel.ai/search/search-quickstart)互联网搜索 | [⟦T24⟧](https://reference.langchain.com/python/langchain-parallel/retrievers/ParallelSearchRetriever) |
| [⟦T25⟧](/oss/python/integrations/retrievers/perplexity_search) |通过[Perplexity Search API](https://docs.perplexity.ai/docs/search/quickstart)进行互联网搜索 | [⟦T26⟧](https://reference.langchain.com/python/langchain-perplexity/retrievers/PerplexitySearchRetriever) |
| [⟦T27⟧](https://you.com/docs/integrations/langchain) |网络搜索| [⟦T28⟧](https://pypi.org/project/langchain-youdotcom/) |

## 所有猎犬|猎犬 |自托管 |云产品|套餐 |下载 |
| :-| :-| :-| :-| :-|
| [⟦T29⟧](/oss/python/integrations/retrievers/google_drive) | | | [⟦T30⟧](https://pypi.org/project/langchain-google-community/) | [  ⟦T233⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T31⟧](/oss/python/integrations/retrievers/google_vertex_ai_search) | ❌ | ✅ | [⟦T32⟧](https://reference.langchain.com/python/langchain-google-community/vertex_ai_search/VertexAISearchRetriever) | [  ⟦T234⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T33⟧](/oss/python/integrations/retrievers/bedrock) | ❌ | ✅ | [⟦T34⟧](https://reference.langchain.com/python/langchain-aws/retrievers/bedrock/AmazonKnowledgeBasesRetriever) | [  ⟦T235⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T35⟧](/oss/python/integrations/retrievers/mongodb_atlas) | | | [⟦T36⟧](https://pypi.org/project/langchain-mongodb/) | [  ⟦T236⟧](https://pypi.org/project/langchain-mongodb/) |
| [⟦T37⟧](/oss/python/integrations/retrievers/cohere) | | | [⟦T38⟧](https://pypi.org/project/langchain-cohere/) | [  ⟦T237⟧](https://pypi.org/project/langchain-cohere/) |
| [⟦T39⟧](/oss/python/integrations/retrievers/cohere-reranker) | | | [⟦T40⟧](https://pypi.org/project/langchain-cohere/) | [  ⟦T238⟧](https://pypi.org/project/langchain-cohere/) |
| [⟦T41⟧](/oss/python/integrations/retrievers/nvidia) | ✅ | ❌ | [⟦T42⟧](https://reference.langchain.com/python/langchain-nvidia-ai-endpoints/retrievers/NVIDIARAGRetriever) | [  ⟦T239⟧](https://pypi.org/project/langchain-nvidia-ai-endpoints/) |
| [⟦T43⟧](/oss/python/integrations/retrievers/pinecone_rerank) | | | [⟦T44⟧](https://pypi.org/project/langchain-pinecone/) | [  ⟦T240⟧](https://pypi.org/project/langchain-pinecone/) |
| [⟦T45⟧](/oss/python/integrations/retrievers/ibm_watsonx_ranker) | | | [⟦T46⟧](https://reference.langchain.com/python/langchain-ibm) | [  ⟦T241⟧](https://pypi.org/project/langchain-ibm/) |
| [⟦T47⟧](/oss/python/integrations/retrievers/perplexity_search) | ❌ | ✅ | [⟦T48⟧](https://reference.langchain.com/python/langchain-perplexity/retrievers/PerplexitySearchRetriever) | [  ⟦T242⟧](https://pypi.org/project/langchain-perplexity/) |
| [⟦T49⟧](/oss/python/integrations/retrievers/graph_rag) | | | [⟦T50⟧](https://pypi.org/project/langchain-graph-retriever/) | [  ⟦T243⟧](https://pypi.org/project/langchain-graph-retriever/)​​ |
| [⟦T51⟧](/oss/python/integrations/retrievers/elasticsearch_retriever) | ✅ | ✅ | [⟦T52⟧](https://reference.langchain.com/python/langchain-elasticsearch/retrievers/ElasticsearchRetriever) | [  ⟦T244⟧](https://pypi.org/project/langchain-elasticsearch/) |
| [⟦T53⟧](/oss/python/integrations/retrievers/parallel) | ❌ | ✅ | [⟦T54⟧](https://reference.langchain.com/python/langchain-parallel/retrievers/ParallelSearchRetriever) | [  ⟦T245⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T55⟧](https://docs.apify.com/integrations/langchain) | | | [⟦T56⟧](https://pypi.org/project/langchain-apify/) | [  ⟦T246⟧](https://pypi.org/project/langchain-apify/) |
| [⟦T57⟧](https://pypi.org/project/langchain-hana/) | | | [⟦T58⟧](https://pypi.org/project/langchain-hana/) | [  ⟦T247⟧](https://pypi.org/project/langchain-hana/) |
| [⟦T59⟧](https://github.com/skynetcmd/m3-memory/blob/main/docs/integrations/LANGCHAIN.md) | ✅ | ❌ | [⟦T60⟧](https://pypi.org/project/m3-memory/) | [  ⟦T248⟧](https://pypi.org/project/m3-memory/) |
| [⟦T61⟧](https://docs.getsemantica.ai/integrations/langchain) | ✅ | ❌ | [⟦T62⟧](https://pypi.org/project/semantica/) | [  ⟦T249⟧](https://pypi.org/project/semantica/) |
| [⟦T63⟧](/oss/python/integrations/retrievers/ragatouille) | | | [⟦T64⟧](https://pypi.org/project/ragatouille/) | [  ⟦T250⟧](https://pypi.org/project/ragatouille/) |
| [⟦T65⟧](https://github.com/Thanatos9404/llmslim/blob/main/docs/integrations/LANGCHAIN.md) | ✅ | ❌ | [⟦T66⟧](https://pypi.org/project/llmslim/) | [  ⟦T251⟧](https://pypi.org/project/llmslim/) |
| [⟦T67⟧](https://docs.tokenfactory.nebius.com/quickstart) | | | [⟦T68⟧](https://pypi.org/project/langchain-nebius/) | [  ⟦T252⟧](https://pypi.org/project/langchain-nebius/) |
| [⟦T69⟧](https://github.com/LinkupPlatform/langchain-linkup) | | | [⟦T70⟧](https://pypi.org/project/langchain-linkup/) | [  ⟦T253⟧](https://pypi.org/project/langchain-linkup/) |
| [⟦T71⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | | | [⟦T72⟧](https://pypi.org/project/langchain-nimble/) | [  ⟦T254⟧](https://pypi.org/project/langchain-nimble/) |
| [⟦T73⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | | | [⟦T74⟧](https://pypi.org/project/langchain-nimble/) | [  ⟦T255⟧](https://pypi.org/project/langchain-nimble/) |
| [⟦T75⟧](https://giulioder.github.io/RE-call/integrations.html) | ✅ | ❌ | [⟦T76⟧](https://pypi.org/project/recall-rag/) | [  ⟦T256⟧](https://pypi.org/project/recall-rag/) |
| [⟦T77⟧](https://github.com/singlestore-labs/langchain-singlestore/) | ✅ | ✅ | [⟦T78⟧](https://pypi.org/project/langchain-singlestore/) | [  ⟦T257⟧](https://pypi.org/project/langchain-singlestore/) |
| [⟦T79⟧](https://sourcey.com/docs/guides/guide-langchain-retriever) | | | [⟦T80⟧](https://pypi.org/project/langchain-sourcey/) | [  ⟦T258⟧](https://pypi.org/project/langchain-sourcey/) |
| [⟦T81⟧](https://maximem.ai) | | | [⟦T82⟧](https://pypi.org/project/maximem-synap-langchain/) | [  ⟦T259⟧](https://pypi.org/project/maximem-synap-langchain/) |
| [⟦T83⟧](https://github.com/SpaceFrontiers/machinelibrary-integrations/tree/main/python/langchain-machinelibrary) | | | [⟦T84⟧](https://pypi.org/project/langchain-machinelibrary/) | [  ⟦T260⟧](https://pypi.org/project/langchain-machinelibrary/) |
| [⟦T85⟧](https://you.com/docs/integrations/langchain) | ❌ | ✅ | [⟦T86⟧](https://pypi.org/project/langchain-youdotcom/) | [  ⟦T261⟧](https://pypi.org/project/langchain-youdotcom/) |
| [⟦T87⟧](https://docs.kapa.ai/retrieval/frameworks/langchain) | | | [⟦T88⟧](https://pypi.org/project/langchain-kapa-ai/) | [  ⟦T262⟧](https://pypi.org/project/langchain-kapa-ai/) |
| [⟦T89⟧](https://replylayer.ai/docs/guides/langchain) | ❌ | ✅ | [⟦T90⟧](https://pypi.org/project/langchain-replylayer/) | [  ⟦T263⟧](https://pypi.org/project/langchain-replylayer/) || [⟦T91⟧](https://specstream.ai/docs/langchain) | | | [⟦T92⟧](https://pypi.org/project/langchain-specstream/) | [  ⟦T264⟧](https://pypi.org/project/langchain-specstream/) |
| [⟦T93⟧](https://docs.hydrafetch.com) | | | [⟦T94⟧](https://pypi.org/project/langchain-hydrafetch/) | [  ⟦T265⟧](https://pypi.org/project/langchain-hydrafetch/) |
| [⟦T95⟧](https://cortexdb.ai/docs/integrations/langchain?utm_source=langchain\&utm_medium=organic\&utm_campaign=G07) | | | [⟦T96⟧](https://pypi.org/project/cortexdbai/) | [  ⟦T266⟧](https://pypi.org/project/cortexdbai/) |
| [⟦T97⟧](https://docs.valyu.ai/overview) | | | [⟦T98⟧](https://pypi.org/project/langchain-valyu/) | [  ⟦T267⟧](https://pypi.org/project/langchain-valyu/) |
| [⟦T99⟧](https://github.com/ClickHouse/loom/blob/v1.3.0-rc.1/docs/features/integrations/frameworks.md#langchain) | ✅ | | [⟦T100⟧](https://pypi.org/project/clickhouse-loom/) | [  ⟦T268⟧](https://pypi.org/project/clickhouse-loom/) |
| [⟦T101⟧](https://github.com/ClickHouse/loom/blob/v1.3.0-rc.1/docs/features/integrations/frameworks.md#langchain) | ✅ | | [⟦T102⟧](https://pypi.org/project/clickhouse-loom/) | [  ⟦T269⟧](https://pypi.org/project/clickhouse-loom/) |
| [⟦T103⟧](https://github.com/diffbot/langchain-diffbot) | | | [⟦T104⟧](https://pypi.org/project/langchain-diffbot/) | [  ⟦T270⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T105⟧](https://github.com/diffbot/langchain-diffbot) | | | [⟦T106⟧](https://pypi.org/project/langchain-diffbot/) | [  ⟦T271⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T107⟧](https://github.com/Yarmoluk/langchain-ckg) | | | [⟦T108⟧](https://pypi.org/project/langchain-ckg/) | [  ⟦T272⟧](https://pypi.org/project/langchain-ckg/) |
| [⟦T109⟧](https://blopus.ai/docs/) | | | [⟦T110⟧](https://pypi.org/project/langchain-blopus/) | [  ⟦T273⟧](https://pypi.org/project/langchain-blopus/) |
| [⟦T111⟧](https://recallmem.dev/guides/langchain) | ✅ | ✅ | [⟦T112⟧](https://pypi.org/project/langchain-recall/) | [  ⟦T274⟧](https://pypi.org/project/langchain-recall/) |
| [⟦T113⟧](https://docs.contextual.ai/) | | | [⟦T114⟧](https://pypi.org/project/langchain-contextual/) | [  ⟦T275⟧](https://pypi.org/project/langchain-contextual/) |
| [⟦T115⟧](https://foxnose.net/docs/integrations/langchain) | ❌ | ✅ | [⟦T116⟧](https://pypi.org/project/langchain-foxnose/) | [  ⟦T276⟧](https://pypi.org/project/langchain-foxnose/) |
| [⟦T117⟧](/oss/python/integrations/retrievers/box) | | | [⟦T118⟧](https://pypi.org/project/langchain-box/) | [  ⟦T277⟧](https://pypi.org/project/langchain-box/) |
| [⟦T119⟧](https://docs.dappier.com/) | | | [⟦T120⟧](https://pypi.org/project/langchain-dappier/) | [  ⟦T278⟧](https://pypi.org/project/langchain-dappier/) |
| [⟦T121⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T122⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T279⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T123⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T124⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T280⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T125⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T126⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T281⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T127⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T128⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T282⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T129⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T130⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T283⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T131⟧](https://github.com/priya-sundaram-dev/whoosh/tree/main/integrations/langchain-whoosh#readme) | ✅ | ❌ | [⟦T132⟧](https://pypi.org/project/langchain-whoosh/) | [  ⟦T284⟧](https://pypi.org/project/langchain-whoosh/) |
| [⟦T133⟧](https://github.com/Veroq-ai/polaris-sdks/tree/main/python/langchain_polaris) | | | [⟦T134⟧](https://pypi.org/project/langchain-polaris/) | [  ⟦T285⟧](https://pypi.org/project/langchain-polaris/) |
| [⟦T135⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#alfrescoretriever) | ✅ | ❌ | [⟦T136⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T286⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T137⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#documentumretriever) | ✅ | ❌ | [⟦T138⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T287⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T139⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#filenetp8retriever) | ✅ | ❌ | [⟦T140⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T288⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T141⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#onbaseretriever) | ✅ | ❌ | [⟦T142⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T289⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T143⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md) | ✅ | ❌ | [⟦T144⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T290⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T145⟧](https://memstate.ai/docs/integrations/langchain) | ❌ | ✅ | [⟦T146⟧](https://pypi.org/project/langchain-memstate/) | [  ⟦T291⟧](https://pypi.org/project/langchain-memstate/) |
| [⟦T147⟧](https://alphai.io/developers) | | | [⟦T148⟧](https://pypi.org/project/langchain-alphai/) | [  ⟦T292⟧](https://pypi.org/project/langchain-alphai/) |
| [⟦T149⟧](https://axiora.dev/docs) | ❌ | ✅ | [⟦T150⟧](https://pypi.org/project/langchain-axiora/) | [  ⟦T293⟧](https://pypi.org/project/langchain-axiora/) |
| [⟦T151⟧](https://mengram.io/docs) | ✅ | ✅ | [⟦T152⟧](https://pypi.org/project/langchain-mengram/) | [  ⟦T294⟧](https://pypi.org/project/langchain-mengram/) |
| [⟦T153⟧](https://github.com/authzed/langchain-spicedb) | | | [⟦T154⟧](https://pypi.org/project/langchain-spicedb/) | [  ⟦T295⟧](https://pypi.org/project/langchain-spicedb/) |
| [⟦T155⟧](https://github.com/unibaseio/membase/tree/main/integrations/langchain#readme) | | ✅ | [⟦T156⟧](https://pypi.org/project/langchain-membase/) | [  ⟦T296⟧](https://pypi.org/project/langchain-membase/) |
| [⟦T157⟧](https://github.com/ashishsinha1602/langchain-schemagate#readme) | | | [⟦T158⟧](https://pypi.org/project/langchain-schemagate/) | [  ⟦T297⟧](https://pypi.org/project/langchain-schemagate/) || [⟦T159⟧](https://docs.cala.ai) | ❌ | ✅ | [⟦T160⟧](https://pypi.org/project/langchain-cala/) | [  ⟦T298⟧](https://pypi.org/project/langchain-cala/) |
| [⟦T161⟧](https://github.com/kineticadb/langchain-kinetica) | | | [⟦T162⟧](https://pypi.org/project/langchain-kinetica/) | [  ⟦T299⟧](https://pypi.org/project/langchain-kinetica/) |
| [⟦T163⟧](/oss/python/integrations/retrievers/egnyte) | | | [⟦T164⟧](https://pypi.org/project/egnyte-langchain-connector/) | [  ⟦T300⟧](https://pypi.org/project/egnyte-langchain-connector/) |
| [⟦T165⟧](https://docs.permit.io/) | | | [⟦T166⟧](https://pypi.org/project/langchain-permit/) | [  ⟦T301⟧](https://pypi.org/project/langchain-permit/) |
| [⟦T167⟧](https://www.high-snr.com/docs.html) | ❌ | ✅ | [⟦T168⟧](https://pypi.org/project/langchain-highsnr/) | [  ⟦T302⟧](https://pypi.org/project/langchain-highsnr/) |
| [⟦T169⟧](https://coalent.ai/docs) | ✅ | ❌ | [⟦T170⟧](https://pypi.org/project/langchain-coalent/) | [  ⟦T303⟧](https://pypi.org/project/langchain-coalent/) |
| [⟦T171⟧](https://pypi.org/project/langchain-hugging-bay/0.1.0/) | | | [⟦T172⟧](https://pypi.org/project/langchain-hugging-bay/) | [  ⟦T304⟧](https://pypi.org/project/langchain-hugging-bay/) |
| [⟦T173⟧](https://smabbler.gitbook.io/smabbler/api-rag/smabblers-api-rag) | | | [⟦T174⟧](https://pypi.org/project/langchain-galaxia-retriever/) | [  ⟦T305⟧](https://pypi.org/project/langchain-galaxia-retriever/) |
| [⟦T175⟧](https://docs.cognee.ai/) | | | [⟦T176⟧](https://pypi.org/project/langchain-cognee/) | [  ⟦T306⟧](https://pypi.org/project/langchain-cognee/) |
| [⟦T177⟧](https://github.com/urraf/langchain-stackoverflow#readme) | | | [⟦T178⟧](https://pypi.org/project/langchain-stackoverflow/) | [  ⟦T307⟧](https://pypi.org/project/langchain-stackoverflow/) |
| [⟦T179⟧](https://github.com/urraf/langchain-stackoverflow#readme) | | | [⟦T180⟧](https://pypi.org/project/langchain-stackoverflow/) | [  ⟦T308⟧](https://pypi.org/project/langchain-stackoverflow/) |
| [⟦T181⟧](https://github.com/agentmail-to/langchain-agentmail) | | | [⟦T182⟧](https://pypi.org/project/langchain-agentmail/) | [  ⟦T309⟧](https://pypi.org/project/langchain-agentmail/) |
| [⟦T183⟧](https://github.com/meetdewey/langchain-dewey) | ❌ | ✅ | [⟦T184⟧](https://pypi.org/project/langchain-dewey/) | [  ⟦T310⟧](https://pypi.org/project/langchain-dewey/) |
| [⟦T185⟧](https://docs.vectorize.io/rag-pipelines/retrieval-endpoint#access-tokens) | | | [⟦T186⟧](https://pypi.org/project/langchain-vectorize/) | [  ⟦T311⟧](https://pypi.org/project/langchain-vectorize/) |
| [⟦T187⟧](https://j1c.github.io/langchain-arxiv-retriever) | | | [⟦T188⟧](https://pypi.org/project/langchain-arxiv-retriever/) | [  ⟦T312⟧](https://pypi.org/project/langchain-arxiv-retriever/) |
| [⟦T189⟧](https://docs.igpt.ai/docs/sdks/langchain#igpt-search-retriever) | | | [⟦T190⟧](https://pypi.org/project/langchain-igpt/) | [  ⟦T313⟧](https://pypi.org/project/langchain-igpt/) |
| [⟦T191⟧](https://getalchemystai.com/docs) | ❌ | ✅ | [⟦T192⟧](https://pypi.org/project/alchemyst-langchain/) | [  ⟦T314⟧](https://pypi.org/project/alchemyst-langchain/) |
| [⟦T193⟧](https://github.com/urraf/langchain-reddit#readme) | | | [⟦T194⟧](https://pypi.org/project/langchain-reddit/) | [  ⟦T315⟧](https://pypi.org/project/langchain-reddit/) |
| [⟦T195⟧](https://github.com/urraf/langchain-reddit#readme) | | | [⟦T196⟧](https://pypi.org/project/langchain-reddit/) | [  ⟦T316⟧](https://pypi.org/project/langchain-reddit/) |
| [⟦T197⟧](https://github.com/urraf/langchain-reddit#readme) | | | [⟦T198⟧](https://pypi.org/project/langchain-reddit/) | [  ⟦T317⟧](https://pypi.org/project/langchain-reddit/) |
| [⟦T199⟧](https://github.com/SecAI-Lab/RAGDefender/blob/main/docs/integrations.md#langchain) | | | [⟦T200⟧](https://pypi.org/project/ragdefender/) | [  ⟦T318⟧](https://pypi.org/project/ragdefender/) |
| [⟦T201⟧](https://quanticdata.io/docs/) | | | [⟦T202⟧](https://pypi.org/project/langchain-quanticdata/) | [  ⟦T319⟧](https://pypi.org/project/langchain-quanticdata/) |
| [⟦T203⟧](https://github.com/urraf/langchain-hackernews#readme) | | | [⟦T204⟧](https://pypi.org/project/langchain-hackernews/) | [  ⟦T320⟧](https://pypi.org/project/langchain-hackernews/) |
| [⟦T205⟧](https://github.com/urraf/langchain-hackernews#readme) | | | [⟦T206⟧](https://pypi.org/project/langchain-hackernews/) | [  ⟦T321⟧](https://pypi.org/project/langchain-hackernews/) |
| [⟦T207⟧](https://github.com/urraf/langchain-hackernews#readme) | | | [⟦T208⟧](https://pypi.org/project/langchain-hackernews/) | [  ⟦T322⟧](https://pypi.org/project/langchain-hackernews/) |
| [⟦T209⟧](https://github.com/urraf/langchain-playstore#readme) | | | [⟦T210⟧](https://pypi.org/project/langchain-playstore/) | [  ⟦T323⟧](https://pypi.org/project/langchain-playstore/) |
| [⟦T211⟧](https://github.com/urraf/langchain-playstore#readme) | | | [⟦T212⟧](https://pypi.org/project/langchain-playstore/) | [  ⟦T324⟧](https://pypi.org/project/langchain-playstore/) |
| [⟦T213⟧](https://github.com/TimBMK/langchain-zotero-retriever) | | | [⟦T214⟧](https://pypi.org/project/langchain-zotero-retriever/) | [  ⟦T325⟧](https://pypi.org/project/langchain-zotero-retriever/) |
| [⟦T215⟧](https://greennode.ai/) | | | [⟦T216⟧](https://pypi.org/project/langchain-greennode/) | [  ⟦T326⟧](https://pypi.org/project/langchain-greennode/) |
| [⟦T217⟧](https://engram.ai/) | | | [⟦T218⟧](https://pypi.org/project/langchain-engram/) | [  ⟦T327⟧](https://pypi.org/project/langchain-engram/) |
| [⟦T219⟧](https://github.com/Keirolabs-API/langchain-keiro) | ❌ | ✅ | [⟦T220⟧](https://pypi.org/project/langchain-keiro/) | [  ⟦T328⟧](https://pypi.org/project/langchain-keiro/) |
| [⟦T221⟧](https://github.com/jfouret/langchain-imap) | | | [⟦T222⟧](https://pypi.org/project/langchain-imap/) | [  ⟦T329⟧](https://pypi.org/project/langchain-imap/) |
| [⟦T223⟧](https://perigon.io/docs/api/intro) | | | [⟦T224⟧](https://pypi.org/project/langchain-perigon/) | [  ⟦T330⟧](https://pypi.org/project/langchain-perigon/) |
| [⟦T225⟧](https://harny.ai/integrations/langchain) | | | [⟦T226⟧](https://pypi.org/project/langchain-harny/) | [  ⟦T331⟧](https://pypi.org/project/langchain-harny/) |
| [⟦T227⟧](https://github.com/nullure/langchain-openmemory) | | | [⟦T228⟧](https://pypi.org/project/langchain-openmemory/) | [  ⟦T332⟧](https://pypi.org/project/langchain-openmemory/) || [⟦T229⟧](https://github.com/wiiiktor/chopper_demo/tree/main/integrations/chopper-rag) | | | [⟦T230⟧](https://pypi.org/project/chopper-rag/) |不适用 |
| [⟦T231⟧](https://github.com/tonydzi/langchain-sqlite-graph-memory#readme) | | | [⟦T232⟧](https://pypi.org/project/langchain-sqlite-graph-memory/) |不适用 |

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/retrievers/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。