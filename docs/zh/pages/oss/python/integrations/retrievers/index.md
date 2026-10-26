<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Retriever integrations | https://docs.langchain.com/oss/python/integrations/retrievers/index -->

# 检索器集成

使用 LangChain Python 与检索器集成。

[retriever](/oss/python/deepagents/retrieval#building-blocks) 是一个接口，它根据非结构化查询返回文档。
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
| [⟦T3⟧](/oss/python/integrations/retrievers/elasticsearch_retriever) | ✅ | ✅ | [⟦T4⟧](https://reference.langchain.com/python/langchain-elasticsearch/retrievers/ElasticsearchRetriever) |
| [⟦T5⟧](/oss/python/integrations/retrievers/mongodb_atlas) | ❌ | ✅ | [⟦T6⟧](https://reference.langchain.com/python/langchain-mongodb/retrievers/MongoDBAtlasHybridSearchRetriever) |
| [⟦T7⟧](https://memstate.ai/docs/integrations/langchain) | ❌ | ✅ | [⟦T8⟧](https://pypi.org/project/langchain-memstate/) |
| [⟦T9⟧](https://mengram.io/docs) | ✅ | ✅ | [⟦T10⟧](https://pypi.org/project/langchain-mengram/) |
| [⟦T11⟧](/oss/python/integrations/retrievers/nvidia) | ✅ | ❌ | [⟦T12⟧](https://reference.langchain.com/python/langchain-nvidia-ai-endpoints/retrievers/NVIDIARAGRetriever) |
| [⟦T13⟧](/oss/python/integrations/retrievers/google_vertex_ai_search) | ❌ | ✅ | [⟦T14⟧](https://reference.langchain.com/python/langchain-google-community/vertex_ai_search/VertexAISearchRetriever) |

## 外部索引

以下检索器将搜索外部索引（例如，根据互联网数据或类似数据构建）。

|猎犬 |来源 |套餐 |
| - | - | - |
| [⟦T15⟧](https://docs.apify.com/integrations/langchain) |通过[Apify RAG Web Browser](https://apify.com/apify/rag-web-browser)进行互联网搜索 | [⟦T16⟧](https://pypi.org/project/langchain-apify/) |
| [⟦T17⟧](https://github.com/diffbot/langchain-diffbot) |通过 Diffbot 知识图进行实体搜索 | [⟦T18⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T19⟧](https://github.com/diffbot/langchain-diffbot) |通过 Diffbot Web Search API 进行互联网搜索 | [⟦T20⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T21⟧](/oss/python/integrations/retrievers/parallel) |通过[Parallel Search API](https://docs.parallel.ai/search/search-quickstart)互联网搜索| [⟦T22⟧](https://reference.langchain.com/python/langchain-parallel/retrievers/ParallelSearchRetriever) |
| [⟦T23⟧](/oss/python/integrations/retrievers/perplexity_search) |通过[Perplexity Search API](https://docs.perplexity.ai/docs/search/quickstart)进行互联网搜索 | [⟦T24⟧](https://reference.langchain.com/python/langchain-perplexity/retrievers/PerplexitySearchRetriever) |
| [⟦T25⟧](https://you.com/docs/integrations/langchain) |网络搜索| [⟦T26⟧](https://pypi.org/project/langchain-youdotcom/) |

## 所有猎犬|猎犬 |自托管 |云产品|套餐 |下载 |
| :-| :-| :-| :-| :-|
| [⟦T27⟧](/oss/python/integrations/retrievers/google_drive) | | | [⟦T28⟧](https://pypi.org/project/langchain-google-community/) | [  ⟦T211⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T29⟧](/oss/python/integrations/retrievers/google_vertex_ai_search) | ❌ | ✅ | [⟦T30⟧](https://reference.langchain.com/python/langchain-google-community/vertex_ai_search/VertexAISearchRetriever) | [  ⟦T212⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T31⟧](/oss/python/integrations/retrievers/bedrock) | ❌ | ✅ | [⟦T32⟧](https://reference.langchain.com/python/langchain-aws/retrievers/bedrock/AmazonKnowledgeBasesRetriever) | [  ⟦T213⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T33⟧](/oss/python/integrations/retrievers/mongodb_atlas) | | | [⟦T34⟧](https://pypi.org/project/langchain-mongodb/) | [  ⟦T214⟧](https://pypi.org/project/langchain-mongodb/) |
| [⟦T35⟧](/oss/python/integrations/retrievers/cohere) | | | [⟦T36⟧](https://pypi.org/project/langchain-cohere/) | [  ⟦T215⟧](https://pypi.org/project/langchain-cohere/) |
| [⟦T37⟧](/oss/python/integrations/retrievers/cohere-reranker) | | | [⟦T38⟧](https://pypi.org/project/langchain-cohere/) | [  ⟦T216⟧](https://pypi.org/project/langchain-cohere/) |
| [⟦T39⟧](/oss/python/integrations/retrievers/nvidia) | ✅ | ❌ | [⟦T40⟧](https://reference.langchain.com/python/langchain-nvidia-ai-endpoints/retrievers/NVIDIARAGRetriever) | [  ⟦T217⟧](https://pypi.org/project/langchain-nvidia-ai-endpoints/) |
| [⟦T41⟧](/oss/python/integrations/retrievers/pinecone_rerank) | | | [⟦T42⟧](https://pypi.org/project/langchain-pinecone/) | [  ⟦T218⟧](https://pypi.org/project/langchain-pinecone/) |
| [⟦T43⟧](/oss/python/integrations/retrievers/ibm_watsonx_ranker) | | | [⟦T44⟧](https://reference.langchain.com/python/langchain-ibm) | [  ⟦T219⟧](https://pypi.org/project/langchain-ibm/) |
| [⟦T45⟧](/oss/python/integrations/retrievers/perplexity_search) | ❌ | ✅ | [⟦T46⟧](https://reference.langchain.com/python/langchain-perplexity/retrievers/PerplexitySearchRetriever) | [  ⟦T220⟧](https://pypi.org/project/langchain-perplexity/) |
| [⟦T47⟧](/oss/python/integrations/retrievers/graph_rag) | | | [⟦T48⟧](https://pypi.org/project/langchain-graph-retriever/) | [  ⟦T221⟧](https://pypi.org/project/langchain-graph-retriever/) |
| [⟦T49⟧](/oss/python/integrations/retrievers/elasticsearch_retriever) | ✅ | ✅ | [⟦T50⟧](https://reference.langchain.com/python/langchain-elasticsearch/retrievers/ElasticsearchRetriever) | [  ⟦T222⟧](https://pypi.org/project/langchain-elasticsearch/) |
| [⟦T51⟧](/oss/python/integrations/retrievers/parallel) | ❌ | ✅ | [⟦T52⟧](https://reference.langchain.com/python/langchain-parallel/retrievers/ParallelSearchRetriever) | [  ⟦T223⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T53⟧](https://docs.apify.com/integrations/langchain) | | | [⟦T54⟧](https://pypi.org/project/langchain-apify/) | [  ⟦T224⟧](https://pypi.org/project/langchain-apify/) |
| [⟦T55⟧](https://pypi.org/project/langchain-hana/) | | | [⟦T56⟧](https://pypi.org/project/langchain-hana/) | [  ⟦T225⟧](https://pypi.org/project/langchain-hana/) |
| [⟦T57⟧](https://github.com/skynetcmd/m3-memory/blob/main/docs/integrations/LANGCHAIN.md) | ✅ | ❌ | [⟦T58⟧](https://pypi.org/project/m3-memory/) | [  ⟦T226⟧](https://pypi.org/project/m3-memory/) |
| [⟦T59⟧](https://docs.getsemantica.ai/integrations/langchain) | ✅ | ❌ | [⟦T60⟧](https://pypi.org/project/semantica/) | [  ⟦T227⟧](https://pypi.org/project/semantica/) |
| [⟦T61⟧](/oss/python/integrations/retrievers/ragatouille) | | | [⟦T62⟧](https://pypi.org/project/ragatouille/) | [  ⟦T228⟧](https://pypi.org/project/ragatouille/) |
| [⟦T63⟧](https://ashishsinha1602.github.io/schemagate/langchain/) | | | [⟦T64⟧](https://pypi.org/project/schemagate/) | [  ⟦T229⟧](https://pypi.org/project/schemagate/) |
| [⟦T65⟧](https://docs.tokenfactory.nebius.com/quickstart) | | | [⟦T66⟧](https://pypi.org/project/langchain-nebius/) | [  ⟦T230⟧](https://pypi.org/project/langchain-nebius/) |
| [⟦T67⟧](https://github.com/Thanatos9404/llmslim/blob/main/docs/integrations/LANGCHAIN.md) | ✅ | ❌ | [⟦T68⟧](https://pypi.org/project/llmslim/) | [  ⟦T231⟧](https://pypi.org/project/llmslim/) |
| [⟦T69⟧](https://github.com/LinkupPlatform/langchain-linkup) | | | [⟦T70⟧](https://pypi.org/project/langchain-linkup/)​​ | [  ⟦T232⟧](https://pypi.org/project/langchain-linkup/) |
| [⟦T71⟧](https://replylayer.ai/docs/guides/langchain) | ❌ | ✅ | [⟦T72⟧](https://pypi.org/project/langchain-replylayer/) | [  ⟦T233⟧](https://pypi.org/project/langchain-replylayer/) |
| [⟦T73⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | | | [⟦T74⟧](https://pypi.org/project/langchain-nimble/) | [  ⟦T234⟧](https://pypi.org/project/langchain-nimble/) |
| [⟦T75⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | | | [⟦T76⟧](https://pypi.org/project/langchain-nimble/) | [  ⟦T235⟧](https://pypi.org/project/langchain-nimble/) |
| [⟦T77⟧](https://giulioder.github.io/RE-call/integrations.html) | ✅ | ❌ | [⟦T78⟧](https://pypi.org/project/recall-rag/) | [  ⟦T236⟧](https://pypi.org/project/recall-rag/) |
| [⟦T79⟧](https://github.com/singlestore-labs/langchain-singlestore/) | ✅ | ✅ | [⟦T80⟧](https://pypi.org/project/langchain-singlestore/) | [  ⟦T237⟧](https://pypi.org/project/langchain-singlestore/) |
| [⟦T81⟧](https://maximem.ai) | | | [⟦T82⟧](https://pypi.org/project/maximem-synap-langchain/) | [  ⟦T238⟧](https://pypi.org/project/maximem-synap-langchain/) |
| [⟦T83⟧](https://github.com/SpaceFrontiers/machinelibrary-integrations/tree/main/python/langchain-machinelibrary) | | | [⟦T84⟧](https://pypi.org/project/langchain-machinelibrary/) | [  ⟦T239⟧](https://pypi.org/project/langchain-machinelibrary/) |
| [⟦T85⟧](https://you.com/docs/integrations/langchain) | ❌ | ✅ | [⟦T86⟧](https://pypi.org/project/langchain-youdotcom/) | [  ⟦T240⟧](https://pypi.org/project/langchain-youdotcom/) |
| [⟦T87⟧](https://docs.kapa.ai/retrieval/frameworks/langchain) | | | [⟦T88⟧](https://pypi.org/project/langchain-kapa-ai/) | [  ⟦T241⟧](https://pypi.org/project/langchain-kapa-ai/) || [⟦T89⟧](https://github.com/diffbot/langchain-diffbot) | | | [⟦T90⟧](https://pypi.org/project/langchain-diffbot/) | [  ⟦T242⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T91⟧](https://github.com/diffbot/langchain-diffbot) | | | [⟦T92⟧](https://pypi.org/project/langchain-diffbot/) | [  ⟦T243⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T93⟧](https://sourcey.com/docs/guides/guide-langchain-retriever) | | | [⟦T94⟧](https://pypi.org/project/langchain-sourcey/) | [  ⟦T244⟧](https://pypi.org/project/langchain-sourcey/) |
| [⟦T95⟧](https://docs.hydrafetch.com) | | | [⟦T96⟧](https://pypi.org/project/langchain-hydrafetch/) | [  ⟦T245⟧](https://pypi.org/project/langchain-hydrafetch/) |
| [⟦T97⟧](https://docs.valyu.ai/overview) | | | [⟦T98⟧](https://pypi.org/project/langchain-valyu/) | [  ⟦T246⟧](https://pypi.org/project/langchain-valyu/) |
| [⟦T99⟧](https://github.com/Yarmoluk/langchain-ckg) | | | [⟦T100⟧](https://pypi.org/project/langchain-ckg/) | [  ⟦T247⟧](https://pypi.org/project/langchain-ckg/) |
| [⟦T101⟧](https://blopus.ai/docs/) | | | [⟦T102⟧](https://pypi.org/project/langchain-blopus/) | [  ⟦T248⟧](https://pypi.org/project/langchain-blopus/) |
| [⟦T103⟧](https://docs.contextual.ai/) | | | [⟦T104⟧](https://pypi.org/project/langchain-contextual/) | [  ⟦T249⟧](https://pypi.org/project/langchain-contextual/) |
| [⟦T105⟧](https://foxnose.net/docs/integrations/langchain) | ❌ | ✅ | [⟦T106⟧](https://pypi.org/project/langchain-foxnose/) | [  ⟦T250⟧](https://pypi.org/project/langchain-foxnose/) |
| [⟦T107⟧](https://recallmem.dev/guides/langchain) | ✅ | ✅ | [⟦T108⟧](https://pypi.org/project/langchain-recall/) | [  ⟦T251⟧](https://pypi.org/project/langchain-recall/) |
| [⟦T109⟧](/oss/python/integrations/retrievers/box) | | | [⟦T110⟧](https://pypi.org/project/langchain-box/) | [  ⟦T252⟧](https://pypi.org/project/langchain-box/) |
| [⟦T111⟧](https://github.com/priya-sundaram-dev/whoosh/tree/main/integrations/langchain-whoosh#readme) | ✅ | ❌ | [⟦T112⟧](https://pypi.org/project/langchain-whoosh/) | [  ⟦T253⟧](https://pypi.org/project/langchain-whoosh/) |
| [⟦T113⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T114⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T254⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T115⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T116⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T255⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T117⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T118⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T256⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T119⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T120⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T257⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T121⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T122⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T258⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T123⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#alfrescoretriever) | ✅ | ❌ | [⟦T124⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T259⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T125⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#documentumretriever) | ✅ | ❌ | [⟦T126⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T260⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T127⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#filenetp8retriever) | ✅ | ❌ | [⟦T128⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T261⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T129⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#onbaseretriever) | ✅ | ❌ | [⟦T130⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T262⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T131⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md) | ✅ | ❌ | [⟦T132⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T263⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T133⟧](https://docs.dappier.com/) | | | [⟦T134⟧](https://pypi.org/project/langchain-dappier/) | [  ⟦T264⟧](https://pypi.org/project/langchain-dappier/) |
| [⟦T135⟧](https://github.com/Veroq-ai/polaris-sdks/tree/main/python/langchain_polaris) | | | [⟦T136⟧](https://pypi.org/project/langchain-polaris/) | [  ⟦T265⟧](https://pypi.org/project/langchain-polaris/) |
| [⟦T137⟧](https://memstate.ai/docs/integrations/langchain) | ❌ | ✅ | [⟦T138⟧](https://pypi.org/project/langchain-memstate/) | [  ⟦T266⟧](https://pypi.org/project/langchain-memstate/) |
| [⟦T139⟧](https://alphai.io/developers) | | | [⟦T140⟧](https://pypi.org/project/langchain-alphai/) | [  ⟦T267⟧](https://pypi.org/project/langchain-alphai/) |
| [⟦T141⟧](https://axiora.dev/docs) | ❌ | ✅ | [⟦T142⟧](https://pypi.org/project/langchain-axiora/) | [  ⟦T268⟧](https://pypi.org/project/langchain-axiora/) |
| [⟦T143⟧](https://github.com/authzed/langchain-spicedb) | | | [⟦T144⟧](https://pypi.org/project/langchain-spicedb/) | [  ⟦T269⟧](https://pypi.org/project/langchain-spicedb/) |
| [⟦T145⟧](https://mengram.io/docs) | ✅ | ✅ | [⟦T146⟧](https://pypi.org/project/langchain-mengram/) | [  ⟦T270⟧](https://pypi.org/project/langchain-mengram/) |
| [⟦T147⟧](https://github.com/kineticadb/langchain-kinetica) | | | [⟦T148⟧](https://pypi.org/project/langchain-kinetica/) | [  ⟦T271⟧](https://pypi.org/project/langchain-kinetica/) |
| [⟦T149⟧](https://www.high-snr.com/docs.html) | ❌ | ✅ | [⟦T150⟧](https://pypi.org/project/langchain-highsnr/) | [  ⟦T272⟧](https://pypi.org/project/langchain-highsnr/) |
| [⟦T151⟧](https://coalent.ai/docs) | ✅ | ❌ | [⟦T152⟧](https://pypi.org/project/langchain-coalent/) | [  ⟦T273⟧](https://pypi.org/project/langchain-coalent/) |
| [⟦T153⟧](/oss/python/integrations/retrievers/egnyte) | | | [⟦T154⟧](https://pypi.org/project/egnyte-langchain-connector/) | [  ⟦T274⟧](https://pypi.org/project/egnyte-langchain-connector/) |
| [⟦T155⟧](https://docs.permit.io/) | | | [⟦T156⟧](https://pypi.org/project/langchain-permit/) | [  ⟦T275⟧](https://pypi.org/project/langchain-permit/) || [⟦T157⟧](https://smabbler.gitbook.io/smabbler/api-rag/smabblers-api-rag) | | | [⟦T158⟧](https://pypi.org/project/langchain-galaxia-retriever/) | [  ⟦T276⟧](https://pypi.org/project/langchain-galaxia-retriever/) |
| [⟦T159⟧](https://docs.cognee.ai/) | | | [⟦T160⟧](https://pypi.org/project/langchain-cognee/) | [  ⟦T277⟧](https://pypi.org/project/langchain-cognee/) |
| [⟦T161⟧](https://github.com/urraf/langchain-stackoverflow#readme) | | | [⟦T162⟧](https://pypi.org/project/langchain-stackoverflow/) | [  ⟦T278⟧](https://pypi.org/project/langchain-stackoverflow/) |
| [⟦T163⟧](https://github.com/urraf/langchain-stackoverflow#readme) | | | [⟦T164⟧](https://pypi.org/project/langchain-stackoverflow/) | [  ⟦T279⟧](https://pypi.org/project/langchain-stackoverflow/) |
| [⟦T165⟧](https://github.com/meetdewey/langchain-dewey) | ❌ | ✅ | [⟦T166⟧](https://pypi.org/project/langchain-dewey/) | [  ⟦T280⟧](https://pypi.org/project/langchain-dewey/) |
| [⟦T167⟧](https://docs.vectorize.io/rag-pipelines/retrieval-endpoint#access-tokens) | | | [⟦T168⟧](https://pypi.org/project/langchain-vectorize/) | [  ⟦T281⟧](https://pypi.org/project/langchain-vectorize/) |
| [⟦T169⟧](https://github.com/urraf/langchain-reddit#readme) | | | [⟦T170⟧](https://pypi.org/project/langchain-reddit/) | [  ⟦T282⟧](https://pypi.org/project/langchain-reddit/) |
| [⟦T171⟧](https://github.com/urraf/langchain-reddit#readme) | | | [⟦T172⟧](https://pypi.org/project/langchain-reddit/) | [  ⟦T283⟧](https://pypi.org/project/langchain-reddit/) |
| [⟦T173⟧](https://github.com/urraf/langchain-reddit#readme) | | | [⟦T174⟧](https://pypi.org/project/langchain-reddit/) | [  ⟦T284⟧](https://pypi.org/project/langchain-reddit/) |
| [⟦T175⟧](https://quanticdata.io/docs/) | | | [⟦T176⟧](https://pypi.org/project/langchain-quanticdata/) | [  ⟦T285⟧](https://pypi.org/project/langchain-quanticdata/) |
| [⟦T177⟧](https://github.com/unibaseio/membase/tree/main/integrations/langchain#readme) | | ✅ | [⟦T178⟧](https://pypi.org/project/langchain-membase/) | [  ⟦T286⟧](https://pypi.org/project/langchain-membase/) |
| [⟦T179⟧](https://getalchemystai.com/docs) | ❌ | ✅ | [⟦T180⟧](https://pypi.org/project/alchemyst-langchain/) | [  ⟦T287⟧](https://pypi.org/project/alchemyst-langchain/) |
| [⟦T181⟧](https://github.com/agentmail-to/langchain-agentmail) | | | [⟦T182⟧](https://pypi.org/project/langchain-agentmail/) | [  ⟦T288⟧](https://pypi.org/project/langchain-agentmail/) |
| [⟦T183⟧](https://docs.igpt.ai/docs/sdks/langchain#igpt-search-retriever) | | | [⟦T184⟧](https://pypi.org/project/langchain-igpt/) | [  ⟦T289⟧](https://pypi.org/project/langchain-igpt/) |
| [⟦T185⟧](https://github.com/TimBMK/langchain-zotero-retriever) | | | [⟦T186⟧](https://pypi.org/project/langchain-zotero-retriever/) | [  ⟦T290⟧](https://pypi.org/project/langchain-zotero-retriever/) |
| [⟦T187⟧](https://github.com/urraf/langchain-hackernews#readme) | | | [⟦T188⟧](https://pypi.org/project/langchain-hackernews/) | [  ⟦T291⟧](https://pypi.org/project/langchain-hackernews/) |
| [⟦T189⟧](https://github.com/urraf/langchain-hackernews#readme) | | | [⟦T190⟧](https://pypi.org/project/langchain-hackernews/) | [  ⟦T292⟧](https://pypi.org/project/langchain-hackernews/) |
| [⟦T191⟧](https://github.com/urraf/langchain-hackernews#readme) | | | [⟦T192⟧](https://pypi.org/project/langchain-hackernews/) | [  ⟦T293⟧](https://pypi.org/project/langchain-hackernews/) |
| [⟦T193⟧](https://j1c.github.io/langchain-arxiv-retriever) | | | [⟦T194⟧](https://pypi.org/project/langchain-arxiv-retriever/) | [  ⟦T294⟧](https://pypi.org/project/langchain-arxiv-retriever/) |
| [⟦T195⟧](https://github.com/urraf/langchain-playstore#readme) | | | [⟦T196⟧](https://pypi.org/project/langchain-playstore/) | [  ⟦T295⟧](https://pypi.org/project/langchain-playstore/) |
| [⟦T197⟧](https://github.com/urraf/langchain-playstore#readme) | | | [⟦T198⟧](https://pypi.org/project/langchain-playstore/) | [  ⟦T296⟧](https://pypi.org/project/langchain-playstore/) |
| [⟦T199⟧](https://greennode.ai/) | | | [⟦T200⟧](https://pypi.org/project/langchain-greennode/) | [  ⟦T297⟧](https://pypi.org/project/langchain-greennode/) |
| [⟦T201⟧](https://engram.ai/) | | | [⟦T202⟧](https://pypi.org/project/langchain-engram/) | [  ⟦T298⟧](https://pypi.org/project/langchain-engram/) |
| [⟦T203⟧](https://github.com/Keirolabs-API/langchain-keiro) | ❌ | ✅ | [⟦T204⟧](https://pypi.org/project/langchain-keiro/) | [  ⟦T299⟧](https://pypi.org/project/langchain-keiro/) |
| [⟦T205⟧](https://github.com/jfouret/langchain-imap) | | | [⟦T206⟧](https://pypi.org/project/langchain-imap/) | [  ⟦T300⟧](https://pypi.org/project/langchain-imap/) |
| [⟦T207⟧](https://perigon.io/docs/api/intro) | | | [⟦T208⟧](https://pypi.org/project/langchain-perigon/) | [  ⟦T301⟧](https://pypi.org/project/langchain-perigon/) |
| [⟦T209⟧](https://github.com/nullure/langchain-openmemory) | | | [⟦T210⟧](https://pypi.org/project/langchain-openmemory/) | [  ⟦T302⟧](https://pypi.org/project/langchain-openmemory/) |

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/retrievers/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。