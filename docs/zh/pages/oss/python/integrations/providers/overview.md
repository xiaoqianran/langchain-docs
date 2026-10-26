<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangChain Python integrations | https://docs.langchain.com/oss/python/integrations/providers/overview -->

# LangChain Python 集成

使用 LangChain Python 与提供商集成。

LangChain 提供了一个广泛的生态系统，包含 1000 多个跨聊天和嵌入模型、工具和工具包、文档加载器、矢量存储等的集成。

**提供商**是托管 AI 模型并通过 API 公开它们的公司或平台（例如，OpenAI、Anthropic、Google）。许多提供商都有一个专用的 `langchain-<provider>` 包，它实现了一个或多个 LangChain 的标准接口（聊天模型、嵌入模型、向量存储等），无论底层提供商如何，都可以为您提供一致的 API。安装软件包，选择型号名称，然后交换提供程序，而无需更改代码。

> **[Chat models](/oss/python/integrations/chat)**

> **[Embedding models](/oss/python/integrations/embeddings)**

> **[Tools and toolkits](/oss/python/integrations/tools)**

> **[Middleware](/oss/python/integrations/middleware)**

> **[Checkpointers](/oss/python/integrations/checkpointers)**

> **[Sandboxes](/oss/python/integrations/sandboxes)**

要查看按组件类型划分的集成的完整列表，请参阅侧栏中的类别。

> [!提示]
>
> 有关提供程序和模型如何在 LangChain 中工作的概念性概述，包括如何查找模型名称、立即使用新模型以及使用路由器，请参阅 [Providers and models](/oss/python/concepts/providers-and-models)。

## 热门提供商|供应商|套餐 |下载 |最新版本 | JS/TS 支持（LangChain TypeScript 版本中是否存在等效版本​​。点击复选标记可访问相应的包。） |
| :-| :-| :-| :-| :-|
| [OpenAI](/oss/python/integrations/providers/openai/) | [⟦T1⟧](https://reference.langchain.com/python/langchain-openai) | [⟦T43⟧](https://pypi.org/project/langchain-openai/) | [⟦T44⟧](https://pypi.org/project/langchain-openai/) | [✅](https://www.npmjs.com/package/@langchain/openai) |
| [Google (Gemini Enterprise Agent Platform)](/oss/python/integrations/providers/google) | [⟦T2⟧](https://reference.langchain.com/python/langchain-google-vertexai) | [⟦T45⟧](https://pypi.org/project/langchain-google-vertexai/) | [⟦T46⟧](https://pypi.org/project/langchain-google-vertexai/) | [✅](https://www.npmjs.com/package/@langchain/google-vertexai) |
| [Anthropic (Claude)](/oss/python/integrations/providers/anthropic/) | [⟦T3⟧](https://reference.langchain.com/python/langchain-anthropic) | [⟦T47⟧](https://pypi.org/project/langchain-anthropic/) | [⟦T48⟧](https://pypi.org/project/langchain-anthropic/) | [✅](https://www.npmjs.com/package/@langchain/anthropic) |
| [Google (GenAI)](/oss/python/integrations/providers/google) | [⟦T4⟧](https://reference.langchain.com/python/langchain-google-genai) | [⟦T49⟧](https://pypi.org/project/langchain-google-genai/) | [⟦T50⟧](https://pypi.org/project/langchain-google-genai/) | [✅](https://www.npmjs.com/package/@langchain/google-genai) |
| [AWS](/oss/python/integrations/providers/aws/) | [⟦T5⟧](https://reference.langchain.com/python/langchain-aws) | [⟦T51⟧](https://pypi.org/project/langchain-aws/) | [⟦T52⟧](https://pypi.org/project/langchain-aws/) | [✅](https://www.npmjs.com/package/@langchain/aws) |
| [Ollama](/oss/python/integrations/providers/ollama/) | [⟦T6⟧](https://reference.langchain.com/python/langchain-ollama) | [⟦T53⟧](https://pypi.org/project/langchain-ollama/) | [⟦T54⟧](https://pypi.org/project/langchain-ollama/) | [✅](https://www.npmjs.com/package/@langchain/ollama) |
| [Groq](/oss/python/integrations/providers/groq/) | [⟦T7⟧](https://reference.langchain.com/python/langchain-groq) | [⟦T55⟧](https://pypi.org/project/langchain-groq/) | [⟦T56⟧](https://pypi.org/project/langchain-groq/) | [✅](https://www.npmjs.com/package/@langchain/groq) |
| [LiteLLM](/oss/python/integrations/providers/litellm/) | [⟦T8⟧](https://reference.langchain.com/python/langchain-litellm) | [⟦T57⟧](https://pypi.org/project/langchain-litellm/) | [⟦T58⟧](https://pypi.org/project/langchain-litellm/) |不适用 |
| [Huggingface](/oss/python/integrations/providers/huggingface/) | [⟦T9⟧](https://reference.langchain.com/python/langchain-huggingface) | [⟦T59⟧](https://pypi.org/project/langchain-huggingface/) | [⟦T60⟧](https://pypi.org/project/langchain-huggingface/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [MistralAI](/oss/python/integrations/providers/mistralai/) | [⟦T10⟧](https://reference.langchain.com/python/langchain-mistralai) | [⟦T61⟧](https://pypi.org/project/langchain-mistralai/) | [⟦T62⟧](https://pypi.org/project/langchain-mistralai/) | [✅](https://www.npmjs.com/package/@langchain/mistralai) |
| [MongoDB](/oss/python/integrations/providers/mongodb_atlas) | [⟦T11⟧](https://reference.langchain.com/python/langchain-mongodb) | [⟦T63⟧](https://pypi.org/project/langchain-mongodb/) | [⟦T64⟧](https://pypi.org/project/langchain-mongodb/) | [✅](https://www.npmjs.com/package/@langchain/mongodb) |
| [Chroma](/oss/python/integrations/providers/chroma/) | [⟦T12⟧](https://reference.langchain.com/python/langchain-chroma) | [⟦T65⟧](https://pypi.org/project/langchain-chroma/) | [⟦T66⟧](https://pypi.org/project/langchain-chroma/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [OpenRouter](/oss/python/integrations/providers/openrouter/) | [⟦T13⟧](https://reference.langchain.com/python/langchain-openrouter) | [⟦T67⟧](https://pypi.org/project/langchain-openrouter/) | [⟦T68⟧](https://pypi.org/project/langchain-openrouter/) | ❌ |
| [xAI (Grok)](/oss/python/integrations/providers/xai/) | [⟦T14⟧](https://reference.langchain.com/python/langchain-xai) | [⟦T69⟧](https://pypi.org/project/langchain-xai/) | [⟦T70⟧](https://pypi.org/project/langchain-xai/) | [✅](https://www.npmjs.com/package/@langchain/xai) |
| [DeepSeek](/oss/python/integrations/providers/deepseek/) | [⟦T15⟧](https://reference.langchain.com/python/langchain-deepseek) | [⟦T71⟧](https://pypi.org/project/langchain-deepseek/) | [⟦T72⟧](https://pypi.org/project/langchain-deepseek/) | [✅](https://www.npmjs.com/package/@langchain/deepseek) |
| [Tavily](/oss/python/integrations/providers/tavily/) | [⟦T16⟧](https://reference.langchain.com/python/langchain-tavily) | [⟦T73⟧](https://pypi.org/project/langchain-tavily/) | [⟦T74⟧](https://pypi.org/project/langchain-tavily/) | [✅](https://www.npmjs.com/package/@langchain/tavily) |
| [Qdrant](/oss/python/integrations/providers/qdrant/) | [⟦T17⟧](https://reference.langchain.com/python/langchain-qdrant) | [⟦T75⟧](https://pypi.org/project/langchain-qdrant/) | [⟦T76⟧](https://pypi.org/project/langchain-qdrant/) | [✅](https://www.npmjs.com/package/@langchain/qdrant) |
| [Fireworks](/oss/python/integrations/providers/fireworks/) | [⟦T18⟧](https://reference.langchain.com/python/langchain-fireworks) | [⟦T77⟧](https://pypi.org/project/langchain-fireworks/) | [⟦T78⟧](https://pypi.org/project/langchain-fireworks/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Azure AI](/oss/python/integrations/providers/azure_ai) | [⟦T19⟧](https://reference.langchain.com/python/langchain-azure-ai) | [⟦T79⟧](https://pypi.org/project/langchain-azure-ai/) | [⟦T80⟧](https://pypi.org/project/langchain-azure-ai/) | [✅](https://www.npmjs.com/package/@langchain/openai) |
| [Cohere](/oss/python/integrations/providers/cohere/) | [⟦T20⟧](https://reference.langchain.com/python/langchain-cohere) | [⟦T81⟧](https://pypi.org/project/langchain-cohere/) | [⟦T82⟧](https://pypi.org/project/langchain-cohere/) | [✅](https://www.npmjs.com/package/@langchain/cohere) |
| [Nvidia AI Endpoints](/oss/python/integrations/providers/nvidia) | [⟦T21⟧](https://reference.langchain.com/python/langchain-nvidia-ai-endpoints) | [⟦T83⟧](https://pypi.org/project/langchain-nvidia-ai-endpoints/) | [⟦T84⟧](https://pypi.org/project/langchain-nvidia-ai-endpoints/) | ❌ || [Databricks](/oss/python/integrations/providers/databricks/) | [⟦T22⟧](https://pypi.org/project/databricks-langchain/) | [⟦T85⟧](https://pypi.org/project/databricks-langchain/) | [⟦T86⟧](https://pypi.org/project/databricks-langchain/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Pinecone](/oss/python/integrations/providers/pinecone/) | [⟦T23⟧](https://reference.langchain.com/python/langchain-pinecone) | [⟦T87⟧](https://pypi.org/project/langchain-pinecone/) | [⟦T88⟧](https://pypi.org/project/langchain-pinecone/) | [✅](https://www.npmjs.com/package/@langchain/pinecone) |
| [IBM](/oss/python/integrations/providers/ibm/) | [⟦T24⟧](https://reference.langchain.com/python/langchain-ibm) | [⟦T89⟧](https://pypi.org/project/langchain-ibm/) | [⟦T90⟧](https://pypi.org/project/langchain-ibm/) | [✅](https://www.npmjs.com/package/@langchain/ibm) |
| [Perplexity](/oss/python/integrations/providers/perplexity/) | [⟦T25⟧](https://reference.langchain.com/python/langchain-perplexity) | [⟦T91⟧](https://pypi.org/project/langchain-perplexity/) | [⟦T92⟧](https://pypi.org/project/langchain-perplexity/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Milvus](/oss/python/integrations/providers/milvus/) | [⟦T26⟧](https://reference.langchain.com/python/langchain-milvus) | [⟦T93⟧](https://pypi.org/project/langchain-milvus/) | [⟦T94⟧](https://pypi.org/project/langchain-milvus/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [DataStax Astra DB](/oss/python/integrations/providers/astradb/) | [⟦T27⟧](https://reference.langchain.com/python/langchain-astradb) | [⟦T95⟧](https://pypi.org/project/langchain-astradb/) | [⟦T96⟧](https://pypi.org/project/langchain-astradb/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Elasticsearch](/oss/python/integrations/providers/elasticsearch/) | [⟦T28⟧](https://reference.langchain.com/python/langchain-elasticsearch) | [⟦T97⟧](https://pypi.org/project/langchain-elasticsearch/) | [⟦T98⟧](https://pypi.org/project/langchain-elasticsearch/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Redis](/oss/python/integrations/providers/redis/) | [⟦T29⟧](https://reference.langchain.com/python/langchain-redis) | [⟦T99⟧](https://pypi.org/project/langchain-redis/) | [⟦T100⟧](https://pypi.org/project/langchain-redis/) | [✅](https://www.npmjs.com/package/@langchain/redis) |
| [Together](/oss/python/integrations/providers/together/) | [⟦T30⟧](https://reference.langchain.com/python/langchain-together) | [⟦T101⟧](https://pypi.org/project/langchain-together/) | [⟦T102⟧](https://pypi.org/project/langchain-together/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [SAP HANA Cloud](/oss/python/integrations/providers/sap) | [⟦T31⟧](https://pypi.org/project/langchain-hana/) | [⟦T103⟧](https://pypi.org/project/langchain-hana/) | [⟦T104⟧](https://pypi.org/project/langchain-hana/) | [✅](https://www.npmjs.com/package/@sap/hana-langchain) |
| [MCP Toolbox (Google)](/oss/python/integrations/providers/toolbox/) | [⟦T32⟧](https://pypi.org/project/toolbox-langchain/) | [⟦T105⟧](https://pypi.org/project/toolbox-langchain/) | [⟦T106⟧](https://pypi.org/project/toolbox-langchain/) | ❌ |
| [Google (Community)](/oss/python/integrations/providers/google) | [⟦T33⟧](https://reference.langchain.com/python/langchain-google-community) | [⟦T107⟧](https://pypi.org/project/langchain-google-community/) | [⟦T108⟧](https://pypi.org/project/langchain-google-community/) | ❌ |
| [OpenInference](/oss/python/integrations/callbacks/openinference) | [⟦T34⟧](https://pypi.org/project/openinference-instrumentation-langchain/) | [⟦T109⟧](https://pypi.org/project/openinference-instrumentation-langchain/) | [⟦T110⟧](https://pypi.org/project/openinference-instrumentation-langchain/) | [✅](https://www.npmjs.com/package/@arizeai/openinference-instrumentation-langchain) |
| [Weaviate](/oss/python/integrations/providers/weaviate/) | [⟦T35⟧](https://reference.langchain.com/python/langchain-weaviate) | [⟦T111⟧](https://pypi.org/project/langchain-weaviate/) | [⟦T112⟧](https://pypi.org/project/langchain-weaviate/) | [✅](https://www.npmjs.com/package/@langchain/weaviate) |
| [Oracle AI Vector Search](/oss/python/integrations/providers/oracleai) | [⟦T36⟧](https://pypi.org/project/langchain-oracledb/) | [⟦T113⟧](https://pypi.org/project/langchain-oracledb/) | [⟦T114⟧](https://pypi.org/project/langchain-oracledb/) | [✅](https://www.npmjs.com/package/@oracle/langchain-oracledb) |
| [Unstructured](/oss/python/integrations/providers/unstructured/) | [⟦T37⟧](https://reference.langchain.com/python/langchain-unstructured) | [⟦T115⟧](https://pypi.org/project/langchain-unstructured/) | [⟦T116⟧](https://pypi.org/project/langchain-unstructured/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Exa](/oss/python/integrations/providers/exa_search) | [⟦T38⟧](https://reference.langchain.com/python/langchain-exa) | [⟦T117⟧](https://pypi.org/project/langchain-exa/) | [⟦T118⟧](https://pypi.org/project/langchain-exa/) | [✅](https://www.npmjs.com/package/@langchain/exa) |
| [Graph RAG](/oss/python/integrations/providers/graph_rag) | [⟦T39⟧](https://pypi.org/project/langchain-graph-retriever/) | [⟦T119⟧](https://pypi.org/project/langchain-graph-retriever/) | [⟦T120⟧](https://pypi.org/project/langchain-graph-retriever/) | ❌ |
| [Cerebras](/oss/python/integrations/providers/cerebras/) | [⟦T40⟧](https://reference.langchain.com/python/langchain-cerebras) | [⟦T121⟧](https://pypi.org/project/langchain-cerebras/) | [⟦T122⟧](https://pypi.org/project/langchain-cerebras/) | [✅](https://www.npmjs.com/package/@langchain/cerebras) |
| [Neo4J](/oss/python/integrations/providers/neo4j/) | [⟦T41⟧](https://reference.langchain.com/python/langchain-neo4j) | [⟦T123⟧](https://pypi.org/project/langchain-neo4j/) | [⟦T124⟧](https://pypi.org/project/langchain-neo4j/) | [✅](https://www.npmjs.com/package/@langchain/community) |
| [VoyageAI](/oss/python/integrations/providers/voyageai/) | [⟦T42⟧](https://pypi.org/project/langchain-voyageai/) | [⟦T125⟧](https://pypi.org/project/langchain-voyageai/) | [⟦T126⟧](https://pypi.org/project/langchain-voyageai/) | ❌ |

## 所有提供商

[See all providers](/oss/python/integrations/providers/all_providers) 或使用搜索字段搜索提供商。

> [!注意]
>
> 如果您想贡献集成，请参阅 [contributing guide](/oss/python/contributing)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。