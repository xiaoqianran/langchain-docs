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
| [⟦T15⟧](https://docs.apify.com/integrations/langchain) |通过[Apify RAG Web Browser](https://apify.com/apify/rag-web-browser)互联网搜索| [⟦T16⟧](https://pypi.org/project/langchain-apify/) |
| [⟦T17⟧](https://github.com/diffbot/langchain-diffbot) |通过 Diffbot 知识图进行实体搜索 | [⟦T18⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T19⟧](https://github.com/diffbot/langchain-diffbot) |通过 Diffbot Web Search API 进行互联网搜索 | [⟦T20⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T21⟧](/oss/python/integrations/retrievers/parallel) |通过[Parallel Search API](https://docs.parallel.ai/search/search-quickstart)互联网搜索| [⟦T22⟧](https://reference.langchain.com/python/langchain-parallel/retrievers/ParallelSearchRetriever) |
| [⟦T23⟧](/oss/python/integrations/retrievers/perplexity_search) |通过[Perplexity Search API](https://docs.perplexity.ai/docs/search/quickstart)互联网搜索 | [⟦T24⟧](https://reference.langchain.com/python/langchain-perplexity/retrievers/PerplexitySearchRetriever) |
| [⟦T25⟧](https://you.com/docs/integrations/langchain) |网络搜索| [⟦T26⟧](https://pypi.org/project/langchain-youdotcom/) |

## 所有猎犬|猎犬 |自托管 |云产品|套餐 |下载 |
| :- | :- | :- | :- | :- |
| [⟦T27⟧](/oss/python/integrations/retrievers/google_drive) | | | [⟦T28⟧](https://pypi.org/project/langchain-google-community/) | [  ⟦T215⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T29⟧](/oss/python/integrations/retrievers/google_vertex_ai_search) | ❌ | ✅ | [⟦T30⟧](https://reference.langchain.com/python/langchain-google-community/vertex_ai_search/VertexAISearchRetriever) | [  ⟦T216⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T31⟧](/oss/python/integrations/retrievers/bedrock) | ❌ | ✅ | [⟦T32⟧](https://reference.langchain.com/python/langchain-aws/retrievers/bedrock/AmazonKnowledgeBasesRetriever) | [  ⟦T217⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T33⟧](/oss/python/integrations/retrievers/mongodb_atlas) | | | [⟦T34⟧](https://pypi.org/project/langchain-mongodb/) | [  ⟦T218⟧](https://pypi.org/project/langchain-mongodb/) |
| [⟦T35⟧](/oss/python/integrations/retrievers/cohere) | | | [⟦T36⟧](https://pypi.org/project/langchain-cohere/) | [  ⟦T219⟧](https://pypi.org/project/langchain-cohere/) |
| [⟦T37⟧](/oss/python/integrations/retrievers/cohere-reranker) | | | [⟦T38⟧](https://pypi.org/project/langchain-cohere/) | [  ⟦T220⟧](https://pypi.org/project/langchain-cohere/) |
| [⟦T39⟧](/oss/python/integrations/retrievers/nvidia) | ✅ | ❌ | [⟦T40⟧](https://reference.langchain.com/python/langchain-nvidia-ai-endpoints/retrievers/NVIDIARAGRetriever) | [  ⟦T221⟧](https://pypi.org/project/langchain-nvidia-ai-endpoints/) |
| [⟦T41⟧](/oss/python/integrations/retrievers/pinecone_rerank) | | | [⟦T42⟧](https://pypi.org/project/langchain-pinecone/) | [  ⟦T222⟧](https://pypi.org/project/langchain-pinecone/) |
| [⟦T43⟧](/oss/python/integrations/retrievers/ibm_watsonx_ranker) | | | [⟦T44⟧](https://reference.langchain.com/python/langchain-ibm) | [  ⟦T223⟧](https://pypi.org/project/langchain-ibm/) |
| [⟦T45⟧](/oss/python/integrations/retrievers/perplexity_search) | ❌ | ✅ | [⟦T46⟧](https://reference.langchain.com/python/langchain-perplexity/retrievers/PerplexitySearchRetriever) | [  ⟦T224⟧](https://pypi.org/project/langchain-perplexity/) |
| [⟦T47⟧](/oss/python/integrations/retrievers/graph_rag) | | | [⟦T48⟧](https://pypi.org/project/langchain-graph-retriever/) | [  ⟦T225⟧](https://pypi.org/project/langchain-graph-retriever/) |
| [⟦T49⟧](/oss/python/integrations/retrievers/elasticsearch_retriever) | ✅ | ✅ | [⟦T50⟧](https://reference.langchain.com/python/langchain-elasticsearch/retrievers/ElasticsearchRetriever) | [  ⟦T226⟧](https://pypi.org/project/langchain-elasticsearch/) |
| [⟦T51⟧](/oss/python/integrations/retrievers/parallel) | ❌ | ✅ | [⟦T52⟧](https://reference.langchain.com/python/langchain-parallel/retrievers/ParallelSearchRetriever) | [  ⟦T227⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T53⟧](https://docs.apify.com/integrations/langchain) | | | [⟦T54⟧](https://pypi.org/project/langchain-apify/) | [  ⟦T228⟧](https://pypi.org/project/langchain-apify/) |
| [⟦T55⟧](https://pypi.org/project/langchain-hana/) | | | [⟦T56⟧](https://pypi.org/project/langchain-hana/) | [  ⟦T229⟧](https://pypi.org/project/langchain-hana/) |
| [⟦T57⟧](https://github.com/skynetcmd/m3-memory/blob/main/docs/integrations/LANGCHAIN.md) | ✅ | ❌ | [⟦T58⟧](https://pypi.org/project/m3-memory/) | [  ⟦T230⟧](https://pypi.org/project/m3-memory/) |
| [⟦T59⟧](https://docs.getsemantica.ai/integrations/langchain) | ✅ | ❌ | [⟦T60⟧](https://pypi.org/project/semantica/) | [  ⟦T231⟧](https://pypi.org/project/semantica/) |
| [⟦T61⟧](/oss/python/integrations/retrievers/ragatouille) | | | [⟦T62⟧](https://pypi.org/project/ragatouille/) | [  ⟦T232⟧](https://pypi.org/project/ragatouille/) |
| [⟦T63⟧](https://github.com/Thanatos9404/llmslim/blob/main/docs/integrations/LANGCHAIN.md) | ✅ | ❌ | [⟦T64⟧](https://pypi.org/project/llmslim/) | [  ⟦T233⟧](https://pypi.org/project/llmslim/) |
| [⟦T65⟧](https://docs.tokenfactory.nebius.com/quickstart) | | | [⟦T66⟧](https://pypi.org/project/langchain-nebius/)​​ | [  ⟦T234⟧](https://pypi.org/project/langchain-nebius/) |
| [⟦T67⟧](https://github.com/LinkupPlatform/langchain-linkup) | | | [⟦T68⟧](https://pypi.org/project/langchain-linkup/) | [  ⟦T235⟧](https://pypi.org/project/langchain-linkup/) |
| [⟦T69⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | | | [⟦T70⟧](https://pypi.org/project/langchain-nimble/) | [  ⟦T236⟧](https://pypi.org/project/langchain-nimble/) |
| [⟦T71⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | | | [⟦T72⟧](https://pypi.org/project/langchain-nimble/) | [  ⟦T237⟧](https://pypi.org/project/langchain-nimble/) |
| [⟦T73⟧](https://giulioder.github.io/RE-call/integrations.html) | ✅ | ❌ | [⟦T74⟧](https://pypi.org/project/recall-rag/) | [  ⟦T238⟧](https://pypi.org/project/recall-rag/) |
| [⟦T75⟧](https://github.com/singlestore-labs/langchain-singlestore/) | ✅ | ✅ | [⟦T76⟧](https://pypi.org/project/langchain-singlestore/) | [  ⟦T239⟧](https://pypi.org/project/langchain-singlestore/) |
| [⟦T77⟧](https://sourcey.com/docs/guides/guide-langchain-retriever) | | | [⟦T78⟧](https://pypi.org/project/langchain-sourcey/) | [  ⟦T240⟧](https://pypi.org/project/langchain-sourcey/) |
| [⟦T79⟧](https://maximem.ai) | | | [⟦T80⟧](https://pypi.org/project/maximem-synap-langchain/) | [  ⟦T241⟧](https://pypi.org/project/maximem-synap-langchain/) |
| [⟦T81⟧](https://github.com/SpaceFrontiers/machinelibrary-integrations/tree/main/python/langchain-machinelibrary) | | | [⟦T82⟧](https://pypi.org/project/langchain-machinelibrary/) | [  ⟦T242⟧](https://pypi.org/project/langchain-machinelibrary/) |
| [⟦T83⟧](https://you.com/docs/integrations/langchain) | ❌ | ✅ | [⟦T84⟧](https://pypi.org/project/langchain-youdotcom/) | [  ⟦T243⟧](https://pypi.org/project/langchain-youdotcom/) |
| [⟦T85⟧](https://docs.kapa.ai/retrieval/frameworks/langchain) | | | [⟦T86⟧](https://pypi.org/project/langchain-kapa-ai/) | [  ⟦T244⟧](https://pypi.org/project/langchain-kapa-ai/) |
| [⟦T87⟧](https://replylayer.ai/docs/guides/langchain) | ❌ | ✅ | [⟦T88⟧](https://pypi.org/project/langchain-replylayer/) | [  ⟦T245⟧](https://pypi.org/project/langchain-replylayer/) || [⟦T89⟧](https://specstream.ai/docs/langchain) | | | [⟦T90⟧](https://pypi.org/project/langchain-specstream/) | [  ⟦T246⟧](https://pypi.org/project/langchain-specstream/) |
| [⟦T91⟧](https://docs.hydrafetch.com) | | | [⟦T92⟧](https://pypi.org/project/langchain-hydrafetch/) | [  ⟦T247⟧](https://pypi.org/project/langchain-hydrafetch/) |
| [⟦T93⟧](https://docs.valyu.ai/overview) | | | [⟦T94⟧](https://pypi.org/project/langchain-valyu/) | [  ⟦T248⟧](https://pypi.org/project/langchain-valyu/) |
| [⟦T95⟧](https://github.com/diffbot/langchain-diffbot) | | | [⟦T96⟧](https://pypi.org/project/langchain-diffbot/) | [  ⟦T249⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T97⟧](https://github.com/diffbot/langchain-diffbot) | | | [⟦T98⟧](https://pypi.org/project/langchain-diffbot/) | [  ⟦T250⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T99⟧](https://github.com/Yarmoluk/langchain-ckg) | | | [⟦T100⟧](https://pypi.org/project/langchain-ckg/) | [  ⟦T251⟧](https://pypi.org/project/langchain-ckg/) |
| [⟦T101⟧](https://blopus.ai/docs/) | | | [⟦T102⟧](https://pypi.org/project/langchain-blopus/) | [  ⟦T252⟧](https://pypi.org/project/langchain-blopus/) |
| [⟦T103⟧](https://recallmem.dev/guides/langchain) | ✅ | ✅ | [⟦T104⟧](https://pypi.org/project/langchain-recall/) | [  ⟦T253⟧](https://pypi.org/project/langchain-recall/) |
| [⟦T105⟧](https://docs.contextual.ai/) | | | [⟦T106⟧](https://pypi.org/project/langchain-contextual/) | [  ⟦T254⟧](https://pypi.org/project/langchain-contextual/) |
| [⟦T107⟧](https://foxnose.net/docs/integrations/langchain) | ❌ | ✅ | [⟦T108⟧](https://pypi.org/project/langchain-foxnose/) | [  ⟦T255⟧](https://pypi.org/project/langchain-foxnose/) |
| [⟦T109⟧](/oss/python/integrations/retrievers/box) | | | [⟦T110⟧](https://pypi.org/project/langchain-box/) | [  ⟦T256⟧](https://pypi.org/project/langchain-box/) |
| [⟦T111⟧](https://docs.dappier.com/) | | | [⟦T112⟧](https://pypi.org/project/langchain-dappier/) | [  ⟦T257⟧](https://pypi.org/project/langchain-dappier/) |
| [⟦T113⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T114⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T258⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T115⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T116⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T259⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T117⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T118⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T260⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T119⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T120⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T261⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T121⟧](https://github.com/urraf/langchain-youtube#readme) | | | [⟦T122⟧](https://pypi.org/project/langchain-youtube/) | [  ⟦T262⟧](https://pypi.org/project/langchain-youtube/) |
| [⟦T123⟧](https://github.com/priya-sundaram-dev/whoosh/tree/main/integrations/langchain-whoosh#readme) | ✅ | ❌ | [⟦T124⟧](https://pypi.org/project/langchain-whoosh/) | [  ⟦T263⟧](https://pypi.org/project/langchain-whoosh/) |
| [⟦T125⟧](https://github.com/Veroq-ai/polaris-sdks/tree/main/python/langchain_polaris) | | | [⟦T126⟧](https://pypi.org/project/langchain-polaris/) | [  ⟦T264⟧](https://pypi.org/project/langchain-polaris/) |
| [⟦T127⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#alfrescoretriever) | ✅ | ❌ | [⟦T128⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T265⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T129⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#documentumretriever) | ✅ | ❌ | [⟦T130⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T266⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T131⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#filenetp8retriever) | ✅ | ❌ | [⟦T132⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T267⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T133⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#onbaseretriever) | ✅ | ❌ | [⟦T134⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T268⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T135⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md) | ✅ | ❌ | [⟦T136⟧](https://pypi.org/project/langchain-opendma/) | [  ⟦T269⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T137⟧](https://memstate.ai/docs/integrations/langchain) | ❌ | ✅ | [⟦T138⟧](https://pypi.org/project/langchain-memstate/) | [  ⟦T270⟧](https://pypi.org/project/langchain-memstate/) |
| [⟦T139⟧](https://alphai.io/developers) | | | [⟦T140⟧](https://pypi.org/project/langchain-alphai/) | [  ⟦T271⟧](https://pypi.org/project/langchain-alphai/) |
| [⟦T141⟧](https://axiora.dev/docs) | ❌ | ✅ | [⟦T142⟧](https://pypi.org/project/langchain-axiora/) | [  ⟦T272⟧](https://pypi.org/project/langchain-axiora/) |
| [⟦T143⟧](https://mengram.io/docs) | ✅ | ✅ | [⟦T144⟧](https://pypi.org/project/langchain-mengram/) | [  ⟦T273⟧](https://pypi.org/project/langchain-mengram/) |
| [⟦T145⟧](https://github.com/authzed/langchain-spicedb) | | | [⟦T146⟧](https://pypi.org/project/langchain-spicedb/) | [  ⟦T274⟧](https://pypi.org/project/langchain-spicedb/) |
| [⟦T147⟧](https://github.com/unibaseio/membase/tree/main/integrations/langchain#readme) | | ✅ | [⟦T148⟧](https://pypi.org/project/langchain-membase/) | [  ⟦T275⟧](https://pypi.org/project/langchain-membase/) |
| [⟦T149⟧](https://github.com/ashishsinha1602/langchain-schemagate#readme) | | | [⟦T150⟧](https://pypi.org/project/langchain-schemagate/) | [  ⟦T276⟧](https://pypi.org/project/langchain-schemagate/) |
| [⟦T151⟧](https://github.com/kineticadb/langchain-kinetica) | | | [⟦T152⟧](https://pypi.org/project/langchain-kinetica/) | [  ⟦T277⟧](https://pypi.org/project/langchain-kinetica/) |
| [⟦T153⟧](/oss/python/integrations/retrievers/egnyte) | | | [⟦T154⟧](https://pypi.org/project/egnyte-langchain-connector/) | [  ⟦T278⟧](https://pypi.org/project/egnyte-langchain-connector/) |
| [⟦T155⟧](https://docs.permit.io/) | | | [⟦T156⟧](https://pypi.org/project/langchain-permit/) | [  ⟦T279⟧](https://pypi.org/project/langchain-permit/) || [⟦T157⟧](https://www.high-snr.com/docs.html) | ❌ | ✅ | [⟦T158⟧](https://pypi.org/project/langchain-highsnr/) | [  ⟦T280⟧](https://pypi.org/project/langchain-highsnr/) |
| [⟦T159⟧](https://coalent.ai/docs) | ✅ | ❌ | [⟦T160⟧](https://pypi.org/project/langchain-coalent/) | [  ⟦T281⟧](https://pypi.org/project/langchain-coalent/) |
| [⟦T161⟧](https://pypi.org/project/langchain-hugging-bay/0.1.0/) | | | [⟦T162⟧](https://pypi.org/project/langchain-hugging-bay/) | [  ⟦T282⟧](https://pypi.org/project/langchain-hugging-bay/) |
| [⟦T163⟧](https://smabbler.gitbook.io/smabbler/api-rag/smabblers-api-rag) | | | [⟦T164⟧](https://pypi.org/project/langchain-galaxia-retriever/) | [  ⟦T283⟧](https://pypi.org/project/langchain-galaxia-retriever/) |
| [⟦T165⟧](https://docs.cognee.ai/) | | | [⟦T166⟧](https://pypi.org/project/langchain-cognee/) | [  ⟦T284⟧](https://pypi.org/project/langchain-cognee/) |
| [⟦T167⟧](https://github.com/urraf/langchain-stackoverflow#readme) | | | [⟦T168⟧](https://pypi.org/project/langchain-stackoverflow/) | [  ⟦T285⟧](https://pypi.org/project/langchain-stackoverflow/) |
| [⟦T169⟧](https://github.com/urraf/langchain-stackoverflow#readme) | | | [⟦T170⟧](https://pypi.org/project/langchain-stackoverflow/) | [  ⟦T286⟧](https://pypi.org/project/langchain-stackoverflow/) |
| [⟦T171⟧](https://github.com/agentmail-to/langchain-agentmail) | | | [⟦T172⟧](https://pypi.org/project/langchain-agentmail/) | [  ⟦T287⟧](https://pypi.org/project/langchain-agentmail/) |
| [⟦T173⟧](https://github.com/meetdewey/langchain-dewey) | ❌ | ✅ | [⟦T174⟧](https://pypi.org/project/langchain-dewey/) | [  ⟦T288⟧](https://pypi.org/project/langchain-dewey/) |
| [⟦T175⟧](https://docs.vectorize.io/rag-pipelines/retrieval-endpoint#access-tokens) | | | [⟦T176⟧](https://pypi.org/project/langchain-vectorize/) | [  ⟦T289⟧](https://pypi.org/project/langchain-vectorize/) |
| [⟦T177⟧](https://j1c.github.io/langchain-arxiv-retriever) | | | [⟦T178⟧](https://pypi.org/project/langchain-arxiv-retriever/) | [  ⟦T290⟧](https://pypi.org/project/langchain-arxiv-retriever/) |
| [⟦T179⟧](https://docs.igpt.ai/docs/sdks/langchain#igpt-search-retriever) | | | [⟦T180⟧](https://pypi.org/project/langchain-igpt/) | [  ⟦T291⟧](https://pypi.org/project/langchain-igpt/) |
| [⟦T181⟧](https://getalchemystai.com/docs) | ❌ | ✅ | [⟦T182⟧](https://pypi.org/project/alchemyst-langchain/) | [  ⟦T292⟧](https://pypi.org/project/alchemyst-langchain/) |
| [⟦T183⟧](https://github.com/urraf/langchain-reddit#readme) | | | [⟦T184⟧](https://pypi.org/project/langchain-reddit/) | [  ⟦T293⟧](https://pypi.org/project/langchain-reddit/) |
| [⟦T185⟧](https://github.com/urraf/langchain-reddit#readme) | | | [⟦T186⟧](https://pypi.org/project/langchain-reddit/) | [  ⟦T294⟧](https://pypi.org/project/langchain-reddit/) |
| [⟦T187⟧](https://github.com/urraf/langchain-reddit#readme) | | | [⟦T188⟧](https://pypi.org/project/langchain-reddit/) | [  ⟦T295⟧](https://pypi.org/project/langchain-reddit/) |
| [⟦T189⟧](https://quanticdata.io/docs/) | | | [⟦T190⟧](https://pypi.org/project/langchain-quanticdata/) | [  ⟦T296⟧](https://pypi.org/project/langchain-quanticdata/) |
| [⟦T191⟧](https://github.com/urraf/langchain-hackernews#readme) | | | [⟦T192⟧](https://pypi.org/project/langchain-hackernews/) | [  ⟦T297⟧](https://pypi.org/project/langchain-hackernews/) |
| [⟦T193⟧](https://github.com/urraf/langchain-hackernews#readme) | | | [⟦T194⟧](https://pypi.org/project/langchain-hackernews/) | [  ⟦T298⟧](https://pypi.org/project/langchain-hackernews/) |
| [⟦T195⟧](https://github.com/urraf/langchain-hackernews#readme) | | | [⟦T196⟧](https://pypi.org/project/langchain-hackernews/) | [  ⟦T299⟧](https://pypi.org/project/langchain-hackernews/) |
| [⟦T197⟧](https://github.com/urraf/langchain-playstore#readme) | | | [⟦T198⟧](https://pypi.org/project/langchain-playstore/) | [  ⟦T300⟧](https://pypi.org/project/langchain-playstore/) |
| [⟦T199⟧](https://github.com/urraf/langchain-playstore#readme) | | | [⟦T200⟧](https://pypi.org/project/langchain-playstore/) | [  ⟦T301⟧](https://pypi.org/project/langchain-playstore/) |
| [⟦T201⟧](https://github.com/TimBMK/langchain-zotero-retriever) | | | [⟦T202⟧](https://pypi.org/project/langchain-zotero-retriever/) | [  ⟦T302⟧](https://pypi.org/project/langchain-zotero-retriever/) |
| [⟦T203⟧](https://greennode.ai/) | | | [⟦T204⟧](https://pypi.org/project/langchain-greennode/) | [  ⟦T303⟧](https://pypi.org/project/langchain-greennode/) |
| [⟦T205⟧](https://engram.ai/) | | | [⟦T206⟧](https://pypi.org/project/langchain-engram/) | [  ⟦T304⟧](https://pypi.org/project/langchain-engram/) |
| [⟦T207⟧](https://github.com/Keirolabs-API/langchain-keiro) | ❌ | ✅ | [⟦T208⟧](https://pypi.org/project/langchain-keiro/) | [  ⟦T305⟧](https://pypi.org/project/langchain-keiro/) |
| [⟦T209⟧](https://github.com/jfouret/langchain-imap) | | | [⟦T210⟧](https://pypi.org/project/langchain-imap/) | [  ⟦T306⟧](https://pypi.org/project/langchain-imap/) |
| [⟦T211⟧](https://perigon.io/docs/api/intro) | | | [⟦T212⟧](https://pypi.org/project/langchain-perigon/) | [  ⟦T307⟧](https://pypi.org/project/langchain-perigon/) |
| [⟦T213⟧](https://github.com/nullure/langchain-openmemory) | | | [⟦T214⟧](https://pypi.org/project/langchain-openmemory/) | [  ⟦T308⟧](https://pypi.org/project/langchain-openmemory/) |

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/retrievers/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。