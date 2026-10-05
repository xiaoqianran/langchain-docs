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

## 自备文件

以下检索器允许您索引和搜索自定义文档语料库。

|猎犬 |自托管 |云产品|套餐 |
| - | - | - | - |
| [⟦T1⟧](/oss/python/integrations/retrievers/bedrock) | ❌ | ✅ | [⟦T2⟧](https://reference.langchain.com/python/langchain-aws/retrievers/bedrock/AmazonKnowledgeBasesRetriever) |
| [⟦T3⟧](/oss/python/integrations/retrievers/elasticsearch_retriever) | ✅ | ✅ | [⟦T4⟧](https://reference.langchain.com/python/langchain-elasticsearch/retrievers/ElasticsearchRetriever) |
| [⟦T5⟧](/oss/python/integrations/retrievers/mongodb_atlas) | ❌ | ✅ | [⟦T6⟧](https://reference.langchain.com/python/langchain-mongodb/retrievers/MongoDBAtlasHybridSearchRetriever) |
| [⟦T7⟧](https://memstate.ai/docs/integrations/langchain) | ❌ | ✅ | [⟦T8⟧](https://pypi.org/project/langchain-memstate/) |
| [⟦T9⟧](https://mengram.io/docs) | ✅ | ✅ | [⟦T10⟧](https://pypi.org/project/langchain-mengram/) |
| [⟦T11⟧](/oss/python/integrations/retrievers/nvidia) | ✅ | ❌ | [⟦T12⟧](https://reference.langchain.com/python/langchain-nvidia-ai-endpoints/retrievers/NVIDIARAGRetriever) |
| [⟦T13⟧](/oss/python/integrations/retrievers/google_vertex_ai_search) | ❌ | ✅ | [⟦T14⟧](https://reference.langchain.com/python/langchain-google-community/vertex_ai_search/VertexAISearchRetriever) |

## 外部索引

以下检索器将搜索外部索引（例如，根据互联网数据或类似数据构建）。|猎犬 |来源 |套餐 |
| - | - | - |
| [⟦T15⟧](https://docs.apify.com/integrations/langchain) |通过[Apify RAG Web Browser](https://apify.com/apify/rag-web-browser)互联网搜索| [⟦T16⟧](https://pypi.org/project/langchain-apify/) |
| [⟦T17⟧](https://github.com/diffbot/langchain-diffbot) |通过 Diffbot 知识图进行实体搜索 | [⟦T18⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T19⟧](https://github.com/diffbot/langchain-diffbot) |通过 Diffbot Web Search API 进行互联网搜索 | [⟦T20⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T21⟧](/oss/python/integrations/retrievers/parallel) |通过[Parallel Search API](https://docs.parallel.ai/search/search-quickstart)互联网搜索| [⟦T22⟧](https://reference.langchain.com/python/langchain-parallel/retrievers/ParallelSearchRetriever) |
| [⟦T23⟧](/oss/python/integrations/retrievers/perplexity_search) |通过[Perplexity Search API](https://docs.perplexity.ai/docs/search/quickstart)互联网搜索| [⟦T24⟧](https://reference.langchain.com/python/langchain-perplexity/retrievers/PerplexitySearchRetriever) |
| [⟦T25⟧](https://you.com/docs/integrations/langchain) |网络搜索| [⟦T26⟧](https://pypi.org/project/langchain-youdotcom/) |

## 所有猎犬

<div>
  |猎犬 |自托管 |云产品|套餐 |下载 |
  | :-| :-| :-| :-| :-|
  | [⟦T27⟧](/oss/python/integrations/retrievers/bedrock) | <span>❌</span> | <span>✅</span> | [⟦T28⟧](https://reference.langchain.com/python/langchain-aws/retrievers/bedrock/AmazonKnowledgeBasesRetriever) | <span><a href="https://pypi.org/project/langchain-aws/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T29⟧](/oss/python/integrations/retrievers/google_drive) | <span /> | <span /> | [⟦T30⟧](https://pypi.org/project/langchain-google-community/) | <span><a href="https://pypi.org/project/langchain-google-community/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T31⟧](/oss/python/integrations/retrievers/google_vertex_ai_search) | <span>❌</span> | <span>✅</span> | [⟦T32⟧](https://reference.langchain.com/python/langchain-google-community/vertex_ai_search/VertexAISearchRetriever) | <span><a href="https://pypi.org/project/langchain-google-community/"><img alt="Downloads per month" /></a></span>|
  | [⟦T33⟧](/oss/python/integrations/retrievers/mongodb_atlas) | <span /> | <span /> | [⟦T34⟧](https://pypi.org/project/langchain-mongodb/) | <span><a href="https://pypi.org/project/langchain-mongodb/"><img alt="Downloads per month" /></a></span>|
  | [⟦T35⟧](/oss/python/integrations/retrievers/cohere) | <span /> | <span /> | [⟦T36⟧](https://pypi.org/project/langchain-cohere/) | <span><a href="https://pypi.org/project/langchain-cohere/"><img alt="Downloads per month" /></a></span>|
  | [⟦T37⟧](/oss/python/integrations/retrievers/cohere-reranker) | <span /> | <span /> | [⟦T38⟧](https://pypi.org/project/langchain-cohere/) | <span><a href="https://pypi.org/project/langchain-cohere/"><img alt="Downloads per month" /></a></span>|
  | [⟦T39⟧](/oss/python/integrations/retrievers/nvidia) | <span>✅</span> | <span>❌</span> | [⟦T40⟧](https://reference.langchain.com/python/langchain-nvidia-ai-endpoints/retrievers/NVIDIARAGRetriever) | <span><a href="https://pypi.org/project/langchain-nvidia-ai-endpoints/"><img alt="Downloads per month" /></a></span>|
  | [⟦T41⟧](/oss/python/integrations/retrievers/pinecone_rerank) | <span /> | <span /> | [⟦T42⟧](https://pypi.org/project/langchain-pinecone/) | <span><a href="https://pypi.org/project/langchain-pinecone/"><img alt="Downloads per month" /></a></span>|| [⟦T43⟧](/oss/python/integrations/retrievers/ibm_watsonx_ranker) | <span /> | <span /> | [⟦T44⟧](https://reference.langchain.com/python/integrations/langchain_ibm/) | <span><a href="https://pypi.org/project/langchain-ibm/"><img alt="Downloads per month" /></a></span>|
  | [⟦T45⟧](/oss/python/integrations/retrievers/perplexity_search) | <span>❌</span> | <span>✅</span> | [⟦T46⟧](https://reference.langchain.com/python/langchain-perplexity/retrievers/PerplexitySearchRetriever) | <span><a href="https://pypi.org/project/langchain-perplexity/"><img alt="Downloads per month" /></a></span>|
  | [⟦T47⟧](/oss/python/integrations/retrievers/elasticsearch_retriever) | <span>✅</span> | <span>✅</span> | [⟦T48⟧](https://reference.langchain.com/python/langchain-elasticsearch/retrievers/ElasticsearchRetriever) | <span><a href="https://pypi.org/project/langchain-elasticsearch/"><img alt="Downloads per month" /></a></span>|
  | [⟦T49⟧](/oss/python/integrations/retrievers/graph_rag) | <span /> | <span /> | [⟦T50⟧](https://pypi.org/project/langchain-graph-retriever/) | <span><a href="https://pypi.org/project/langchain-graph-retriever/"><img alt="Downloads per month" /></a></span>|
  | [⟦T51⟧](https://pypi.org/project/langchain-hana/) | <span /> | <span /> | [⟦T52⟧](https://pypi.org/project/langchain-hana/) | <span><a href="https://pypi.org/project/langchain-hana/"><img alt="Downloads per month" /></a></span>|
  | [⟦T53⟧](https://docs.apify.com/integrations/langchain) | <span /> | <span /> | [⟦T54⟧](https://pypi.org/project/langchain-apify/) | <span><a href="https://pypi.org/project/langchain-apify/"><img alt="Downloads per month" /></a></span>|
  | [⟦T55⟧](https://ashishsinha1602.github.io/schemagate/langchain/) | <span /> | <span /> | [⟦T56⟧](https://pypi.org/project/schemagate/) | <span><a href="https://pypi.org/project/schemagate/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T57⟧](/oss/python/integrations/retrievers/ragatouille) | <span /> | <span /> | [⟦T58⟧](https://pypi.org/project/ragatouille/) | <span><a href="https://pypi.org/project/ragatouille/"><img alt="Downloads per month" /></a></span>|
  | [⟦T59⟧](https://github.com/skynetcmd/m3-memory/blob/main/docs/integrations/LANGCHAIN.md) | <span>✅</span> | <span>❌</span> | [⟦T60⟧](https://pypi.org/project/m3-memory/) | <span><a href="https://pypi.org/project/m3-memory/"><img alt="Downloads per month" /></a></span>|
  | [⟦T61⟧](https://docs.getsemantica.ai/integrations/langchain) | <span>✅</span> | <span>❌</span> | [⟦T62⟧](https://pypi.org/project/semantica/) | <span><a href="https://pypi.org/project/semantica/"><img alt="Downloads per month" /></a></span>|
  | [⟦T63⟧](/oss/python/integrations/retrievers/parallel) | <span>❌</span> | <span>✅</span> | [⟦T64⟧](https://reference.langchain.com/python/langchain-parallel/retrievers/ParallelSearchRetriever) | <span><a href="https://pypi.org/project/langchain-parallel/"><img alt="Downloads per month" /></a></span>|
  | [⟦T65⟧](https://giulioder.github.io/RE-call/integrations.html) | <span>✅</span> | <span>❌</span> | [⟦T66⟧](https://pypi.org/project/recall-rag/) | <span><a href="https://pypi.org/project/recall-rag/"><img alt="Downloads per month" /></a></span>|
  | [⟦T67⟧](https://docs.tokenfactory.nebius.com/quickstart) | <span /> | <span /> | [⟦T68⟧](https://pypi.org/project/langchain-nebius/) | <span><a href="https://pypi.org/project/langchain-nebius/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T69⟧](https://blopus.ai/docs/) | <span /> | <span /> | [⟦T70⟧](https://pypi.org/project/langchain-blopus/) | <span><a href="https://pypi.org/project/langchain-blopus/"><img alt="Downloads per month" /></a></span>|| [⟦T71⟧](https://github.com/LinkupPlatform/langchain-linkup) | <span /> | <span /> | [⟦T72⟧](https://pypi.org/project/langchain-linkup/) | <span><a href="https://pypi.org/project/langchain-linkup/"><img alt="Downloads per month" /></a></span>|
  | [⟦T73⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | <span /> | <span /> | [⟦T74⟧](https://pypi.org/project/langchain-nimble/) | <span><a href="https://pypi.org/project/langchain-nimble/"><img alt="Downloads per month" /></a></span> |
  | [⟦T75⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | <span /> | <span /> | [⟦T76⟧](https://pypi.org/project/langchain-nimble/) | <span><a href="https://pypi.org/project/langchain-nimble/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T77⟧](https://you.com/docs/integrations/langchain) | <span>❌</span> | <span>✅</span> | [⟦T78⟧](https://pypi.org/project/langchain-youdotcom/) | <span><a href="https://pypi.org/project/langchain-youdotcom/"><img alt="Downloads per month" /></a></span> |
  | [⟦T79⟧](https://github.com/singlestore-labs/langchain-singlestore/) | <span>✅</span> | <span>✅</span> | [⟦T80⟧](https://pypi.org/project/langchain-singlestore/) | <span><a href="https://pypi.org/project/langchain-singlestore/"><img alt="Downloads per month" /></a></span>|
  | [⟦T81⟧](https://github.com/urraf/langchain-youtube#readme) | <span /> | <span /> | [⟦T82⟧](https://pypi.org/project/langchain-youtube/) | <span><a href="https://pypi.org/project/langchain-youtube/"><img alt="Downloads per month" /></a></span>|
  | [⟦T83⟧](https://github.com/urraf/langchain-youtube#readme) | <span /> | <span /> | [⟦T84⟧](https://pypi.org/project/langchain-youtube/) | <span><a href="https://pypi.org/project/langchain-youtube/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T85⟧](https://github.com/urraf/langchain-youtube#readme) | <span /> | <span /> | [⟦T86⟧](https://pypi.org/project/langchain-youtube/) | <span><a href="https://pypi.org/project/langchain-youtube/"><img alt="Downloads per month" /></a></span> |
  | [⟦T87⟧](https://github.com/urraf/langchain-youtube#readme) | <span /> | <span /> | [⟦T88⟧](https://pypi.org/project/langchain-youtube/) | <span><a href="https://pypi.org/project/langchain-youtube/"><img alt="Downloads per month" /></a></span>|
  | [⟦T89⟧](https://github.com/urraf/langchain-youtube#readme) | <span /> | <span /> | [⟦T90⟧](https://pypi.org/project/langchain-youtube/) | <span><a href="https://pypi.org/project/langchain-youtube/"><img alt="Downloads per month" /></a></span> |
  | [⟦T91⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#alfrescoretriever) | <span>✅</span> | <span>❌</span> | [⟦T92⟧](https://pypi.org/project/langchain-opendma/) | <span><a href="https://pypi.org/project/langchain-opendma/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T93⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#documentumretriever) | <span>✅</span> | <span>❌</span> | [⟦T94⟧](https://pypi.org/project/langchain-opendma/) | <span><a href="https://pypi.org/project/langchain-opendma/"><img alt="Downloads per month" /></a></span>|
  | [⟦T95⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#filenetp8retriever) | <span>✅</span> | <span>❌</span> | [⟦T96⟧](https://pypi.org/project/langchain-opendma/) | <span><a href="https://pypi.org/project/langchain-opendma/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T97⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md#onbaseretriever) | <span>✅</span> | <span>❌</span> | [⟦T98⟧](https://pypi.org/project/langchain-opendma/) | <span><a href="https://pypi.org/project/langchain-opendma/"><img alt="Downloads per month" /></a></span>|| [⟦T99⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Retriever.md) | <span>✅</span> | <span>❌</span> | [⟦T100⟧](https://pypi.org/project/langchain-opendma/) | <span><a href="https://pypi.org/project/langchain-opendma/"><img alt="Downloads per month" /></a></span>|
  | [⟦T101⟧](https://github.com/Yarmoluk/langchain-ckg) | <span /> | <span /> | [⟦T102⟧](https://pypi.org/project/langchain-ckg/) | <span><a href="https://pypi.org/project/langchain-ckg/"><img alt="Downloads per month" /></a></span>|
  | [⟦T103⟧](https://docs.hydrafetch.com) | <span /> | <span /> | [⟦T104⟧](https://pypi.org/project/langchain-hydrafetch/) | <span><a href="https://pypi.org/project/langchain-hydrafetch/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T105⟧](https://github.com/urraf/langchain-reddit#readme) | <span /> | <span /> | [⟦T106⟧](https://pypi.org/project/langchain-reddit/) | <span><a href="https://pypi.org/project/langchain-reddit/"><img alt="Downloads per month" /></a></span>|
  | [⟦T107⟧](https://github.com/urraf/langchain-reddit#readme) | <span /> | <span /> | [⟦T108⟧](https://pypi.org/project/langchain-reddit/) | <span><a href="https://pypi.org/project/langchain-reddit/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T109⟧](https://github.com/urraf/langchain-reddit#readme) | <span /> | <span /> | [⟦T110⟧](https://pypi.org/project/langchain-reddit/) | <span><a href="https://pypi.org/project/langchain-reddit/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T111⟧](https://langchain-foxnose.readthedocs.io/) | <span>❌</span> | <span>✅</span> | [⟦T112⟧](https://pypi.org/project/langchain-foxnose/) | <span><a href="https://pypi.org/project/langchain-foxnose/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T113⟧](https://github.com/urraf/langchain-stackoverflow#readme) | <span /> | <span /> | [⟦T114⟧](https://pypi.org/project/langchain-stackoverflow/) | <span><a href="https://pypi.org/project/langchain-stackoverflow/"><img alt="Downloads per month" /></a></span>|
  | [⟦T115⟧](https://github.com/urraf/langchain-stackoverflow#readme) | <span /> | <span /> | [⟦T116⟧](https://pypi.org/project/langchain-stackoverflow/) | <span><a href="https://pypi.org/project/langchain-stackoverflow/"><img alt="Downloads per month" /></a></span>|
  | [⟦T117⟧](https://quanticdata.io/docs/) | <span /> | <span /> | [⟦T118⟧](https://pypi.org/project/langchain-quanticdata/) | <span><a href="https://pypi.org/project/langchain-quanticdata/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T119⟧](https://alphai.io/developers) | <span /> | <span /> | [⟦T120⟧](https://pypi.org/project/langchain-alphai/) | <span><a href="https://pypi.org/project/langchain-alphai/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T121⟧](https://github.com/urraf/langchain-hackernews#readme) | <span /> | <span /> | [⟦T122⟧](https://pypi.org/project/langchain-hackernews/) | <span><a href="https://pypi.org/project/langchain-hackernews/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T123⟧](https://github.com/urraf/langchain-hackernews#readme) | <span /> | <span /> | [⟦T124⟧](https://pypi.org/project/langchain-hackernews/) | <span><a href="https://pypi.org/project/langchain-hackernews/"><img alt="Downloads per month" /></a></span>|
  | [⟦T125⟧](https://github.com/urraf/langchain-hackernews#readme) | <span /> | <span /> | [⟦T126⟧](https://pypi.org/project/langchain-hackernews/) | <span><a href="https://pypi.org/project/langchain-hackernews/"><img alt="Downloads per month" /></a></span> |
  | [⟦T127⟧](https://github.com/urraf/langchain-playstore#readme) | <span /> | <span /> | [⟦T128⟧](https://pypi.org/project/langchain-playstore/) | <span><a href="https://pypi.org/project/langchain-playstore/"><img alt="Downloads per month" /></a></span>|| [⟦T129⟧](https://github.com/urraf/langchain-playstore#readme) | <span /> | <span /> | [⟦T130⟧](https://pypi.org/project/langchain-playstore/) | <span><a href="https://pypi.org/project/langchain-playstore/"><img alt="Downloads per month" /></a></span> |
  | [⟦T131⟧](https://docs.valyu.ai/overview) | <span /> | <span /> | [⟦T132⟧](https://pypi.org/project/langchain-valyu/) | <span><a href="https://pypi.org/project/langchain-valyu/"><img alt="Downloads per month" /></a></span> |
  | [⟦T133⟧](https://docs.contextual.ai/) | <span /> | <span /> | [⟦T134⟧](https://pypi.org/project/langchain-contextual/) | <span><a href="https://pypi.org/project/langchain-contextual/"><img alt="Downloads per month" /></a></span> |
  | [⟦T135⟧](/oss/python/integrations/retrievers/box) | <span /> | <span /> | [⟦T136⟧](https://pypi.org/project/langchain-box/) | <span><a href="https://pypi.org/project/langchain-box/"><img alt="Downloads per month" /></a></span>|
  | [⟦T137⟧](https://replylayer.ai/docs/guides/langchain) | <span>❌</span> | <span>✅</span> | [⟦T138⟧](https://pypi.org/project/langchain-replylayer/) | <span><a href="https://pypi.org/project/langchain-replylayer/"><img alt="Downloads per month" /></a></span>|
  | [⟦T139⟧](https://www.maximem.ai/) | <span /> | <span /> | [⟦T140⟧](https://pypi.org/project/maximem-synap-langchain/) | <span><a href="https://pypi.org/project/maximem-synap-langchain/"><img alt="Downloads per month" /></a></span>|
  | [⟦T141⟧](https://docs.dappier.com/) | <span /> | <span /> | [⟦T142⟧](https://pypi.org/project/langchain-dappier/) | <span><a href="https://pypi.org/project/langchain-dappier/"><img alt="Downloads per month" /></a></span>|
  | [⟦T143⟧](https://github.com/Perseus-Computing-LLC/langchain-perseus-vault) | <span>✅</span> | <span>❌</span> | [⟦T144⟧](https://pypi.org/project/langchain-perseus-vault/) | <span><a href="https://pypi.org/project/langchain-perseus-vault/"><img alt="Downloads per month" /></a></span> |
  | [⟦T145⟧](https://github.com/Veroq-ai/polaris-sdks/tree/main/python/langchain_polaris) | <span /> | <span /> | [⟦T146⟧](https://pypi.org/project/langchain-polaris/) | <span><a href="https://pypi.org/project/langchain-polaris/"><img alt="Downloads per month" /></a></span>|
  | [⟦T147⟧](https://sourcey.com/docs/guides/guide-langchain-retriever) | <span /> | <span /> | [⟦T148⟧](https://pypi.org/project/langchain-sourcey/) | <span><a href="https://pypi.org/project/langchain-sourcey/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T149⟧](https://github.com/kineticadb/langchain-kinetica) | <span /> | <span /> | [⟦T150⟧](https://pypi.org/project/langchain-kinetica/) | <span><a href="https://pypi.org/project/langchain-kinetica/"><img alt="Downloads per month" /></a></span>|
  | [⟦T151⟧](https://j1c.github.io/langchain-arxiv-retriever) | <span /> | <span /> | [⟦T152⟧](https://pypi.org/project/langchain-arxiv-retriever/) | <span><a href="https://pypi.org/project/langchain-arxiv-retriever/"><img alt="Downloads per month" /></a></span>|
  | [⟦T153⟧](https://github.com/authzed/langchain-spicedb) | <span /> | <span /> | [⟦T154⟧](https://pypi.org/project/langchain-spicedb/) | <span><a href="https://pypi.org/project/langchain-spicedb/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T155⟧](https://memstate.ai/docs/integrations/langchain) | <span>❌</span> | <span>✅</span> | [⟦T156⟧](https://pypi.org/project/langchain-memstate/) | <span><a href="https://pypi.org/project/langchain-memstate/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T157⟧](https://mengram.io/docs) | <span>✅</span> | <span>✅</span> | [⟦T158⟧](https://pypi.org/project/langchain-mengram/) | <span><a href="https://pypi.org/project/langchain-mengram/"><img alt="Downloads per month" /></a></span>|| [⟦T159⟧](/oss/python/integrations/retrievers/egnyte) | <span /> | <span /> | [⟦T160⟧](https://pypi.org/project/egnyte-langchain-connector/) | <span><a href="https://pypi.org/project/egnyte-langchain-connector/"><img alt="Downloads per month" /></a></span>|
  | [⟦T161⟧](https://axiora.dev/docs) | <span>❌</span> | <span>✅</span> | [⟦T162⟧](https://pypi.org/project/langchain-axiora/) | <span><a href="https://pypi.org/project/langchain-axiora/"><img alt="Downloads per month" /></a></span>|
  | [⟦T163⟧](https://github.com/diffbot/langchain-diffbot) | <span /> | <span /> | [⟦T164⟧](https://pypi.org/project/langchain-diffbot/) | <span><a href="https://pypi.org/project/langchain-diffbot/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T165⟧](https://github.com/diffbot/langchain-diffbot) | <span /> | <span /> | [⟦T166⟧](https://pypi.org/project/langchain-diffbot/) | <span><a href="https://pypi.org/project/langchain-diffbot/"><img alt="Downloads per month" /></a></span>|
  | [⟦T167⟧](https://coalent.ai/docs) | <span>✅</span> | <span>❌</span> | [⟦T168⟧](https://pypi.org/project/langchain-coalent/) | <span><a href="https://pypi.org/project/langchain-coalent/"><img alt="Downloads per month" /></a></span>|
  | [⟦T169⟧](https://www.high-snr.com/docs.html) | <span>❌</span> | <span>✅</span> | [⟦T170⟧](https://pypi.org/project/langchain-highsnr/) | <span><a href="https://pypi.org/project/langchain-highsnr/"><img alt="Downloads per month" /></a></span>|
  | [⟦T171⟧](https://docs.permit.io/) | <span /> | <span /> | [⟦T172⟧](https://pypi.org/project/langchain-permit/) | <span><a href="https://pypi.org/project/langchain-permit/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T173⟧](https://docs.cognee.ai/) | <span /> | <span /> | [⟦T174⟧](https://pypi.org/project/langchain-cognee/) | <span><a href="https://pypi.org/project/langchain-cognee/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T175⟧](https://smabbler.gitbook.io/smabbler/api-rag/smabblers-api-rag) | <span /> | <span /> | [⟦T176⟧](https://pypi.org/project/langchain-galaxia-retriever/) | <span><a href="https://pypi.org/project/langchain-galaxia-retriever/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T177⟧](https://github.com/meetdewey/langchain-dewey) | <span>❌</span> | <span>✅</span> | [⟦T178⟧](https://pypi.org/project/langchain-dewey/) | <span><a href="https://pypi.org/project/langchain-dewey/"><img alt="Downloads per month" /></a></span>|
  | [⟦T179⟧](https://getalchemystai.com/docs) | <span>❌</span> | <span>✅</span> | [⟦T180⟧](https://pypi.org/project/alchemyst-langchain/) | <span><a href="https://pypi.org/project/alchemyst-langchain/"><img alt="Downloads per month" /></a></span>|
  | [⟦T181⟧](https://docs.vectorize.io/rag-pipelines/retrieval-endpoint#access-tokens) | <span /> | <span /> | [⟦T182⟧](https://pypi.org/project/langchain-vectorize/) | <span><a href="https://pypi.org/project/langchain-vectorize/"><img alt="Downloads per month" /></a></span>|
  | [⟦T183⟧](https://github.com/agentmail-to/langchain-agentmail) | <span /> | <span /> | [⟦T184⟧](https://pypi.org/project/langchain-agentmail/) | <span><a href="https://pypi.org/project/langchain-agentmail/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T185⟧](https://docs.igpt.ai/docs/sdks/langchain#igpt-search-retriever) | <span /> | <span /> | [⟦T186⟧](https://pypi.org/project/langchain-igpt/) | <span><a href="https://pypi.org/project/langchain-igpt/"><img alt="Downloads per month" /></a></span>|| [⟦T187⟧](https://github.com/jfouret/langchain-imap) | <span /> | <span /> | [⟦T188⟧](https://pypi.org/project/langchain-imap/) | <span><a href="https://pypi.org/project/langchain-imap/"><img alt="Downloads per month" /></a></span>|
  | [⟦T189⟧](https://perigon.io/docs/api/intro) | <span /> | <span /> | [⟦T190⟧](https://pypi.org/project/langchain-perigon/) | <span><a href="https://pypi.org/project/langchain-perigon/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T191⟧](https://engram.ai/)​​ | <span /> | <span /> | [⟦T192⟧](https://pypi.org/project/langchain-engram/) | <span><a href="https://pypi.org/project/langchain-engram/"><img alt="Downloads per month" /></a></span>|
  | [⟦T193⟧](https://greennode.ai/) | <span /> | <span /> | [⟦T194⟧](https://pypi.org/project/langchain-greennode/) | <span><a href="https://pypi.org/project/langchain-greennode/"><img alt="Downloads per month" /></a></span>|
  | [⟦T195⟧](https://github.com/nullure/langchain-openmemory) | <span /> | <span /> | [⟦T196⟧](https://pypi.org/project/langchain-openmemory/) | <span><a href="https://pypi.org/project/langchain-openmemory/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T197⟧](https://github.com/Keirolabs-API/langchain-keiro) | <span>❌</span> | <span>✅</span> | [⟦T198⟧](https://pypi.org/project/langchain-keiro/) | <span><a href="https://pypi.org/project/langchain-keiro/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T199⟧](https://github.com/TimBMK/langchain-zotero-retriever) | <span /> | <span /> | [⟦T200⟧](https://pypi.org/project/langchain-zotero-retriever/) | <span><a href="https://pypi.org/project/langchain-zotero-retriever/"><img alt="Downloads per month" /></a></span>|
  | [⟦T201⟧](https://github.com/priya-sundaram-dev/whoosh/tree/main/integrations/langchain-whoosh#readme) | <span>✅</span> | <span>❌</span> | [⟦T202⟧](https://pypi.org/project/langchain-whoosh/) | <span><a href="https://pypi.org/project/langchain-whoosh/"><img alt="Downloads per month" /></a></span> |
</div>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/retrievers/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>