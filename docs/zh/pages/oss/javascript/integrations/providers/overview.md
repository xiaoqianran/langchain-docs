<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangChain JavaScript integrations | https://docs.langchain.com/oss/javascript/integrations/providers/overview -->

# LangChain JavaScript 集成

使用 LangChain JavaScript/TypeScript 与提供商集成。

LangChain 与各种聊天和嵌入模型、工具和工具包、文档加载器、矢量存储等集成。

**提供商**是LangChain集成的第三方服务或平台，用于访问聊天模型、嵌入和矢量存储等人工智能功能。这些提供程序具有独立的 `langchain-provider` 包，用于改进版本控制、依赖项管理和测试。

## 热门提供商|供应商|套餐 |下载 |最新 |
| :-------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| [Anthropic](/oss/javascript/integrations/providers/anthropic) | [⟦T1⟧](https://www.npmjs.com/package/@langchain/anthropic) | ![Downloads](https://img.shields.io/npm/dm/@langchain/anthropic) | ![NPM](https://img.shields.io/npm/v/@langchain/anthropic) |
| [Azure CosmosDB](/oss/javascript/integrations/vectorstores/azure_cosmosdb_nosql) | [⟦T2⟧](https://www.npmjs.com/package/@langchain/azure-cosmosdb) | ![Downloads](https://img.shields.io/npm/dm/@langchain/azure-cosmosdb) | ![NPM](https://img.shields.io/npm/v/@langchain/azure-cosmosdb) |
| [Cerebras](/oss/javascript/integrations/chat/cerebras) | [⟦T3⟧](https://www.npmjs.com/package/@langchain/cerebras) | ![Downloads](https://img.shields.io/npm/dm/@langchain/cerebras) | ![NPM](https://img.shields.io/npm/v/@langchain/cerebras) |
|云耀 | [⟦T4⟧](https://www.npmjs.com/package/@langchain/cloudflare) | ![Downloads](https://img.shields.io/npm/dm/@langchain/cloudflare) | ![NPM](https://img.shields.io/npm/v/@langchain/cloudflare) |
| [Cohere](/oss/javascript/integrations/chat/cohere) | [⟦T5⟧](https://www.npmjs.com/package/@langchain/cohere) | ![Downloads](https://img.shields.io/npm/dm/@langchain/cohere) | ![NPM](https://img.shields.io/npm/v/@langchain/cohere) |
| [Exa](/oss/javascript/integrations/retrievers/exa) | [⟦T6⟧](https://www.npmjs.com/package/@langchain/exa) | ![Downloads](https://img.shields.io/npm/dm/@langchain/exa) | ![NPM](https://img.shields.io/npm/v/@langchain/exa) || [Google](/oss/javascript/integrations/providers/google) | [⟦T7⟧](https://www.npmjs.com/package/@langchain/google) | ![Downloads](https://img.shields.io/npm/dm/@langchain/google) | ![NPM](https://img.shields.io/npm/v/@langchain/google) |
| [Groq](/oss/javascript/integrations/chat/groq) | [⟦T8⟧](https://www.npmjs.com/package/@langchain/groq) | ![Downloads](https://img.shields.io/npm/dm/@langchain/groq) | ![NPM](https://img.shields.io/npm/v/@langchain/groq) |
| [MistralAI](/oss/javascript/integrations/chat/mistral) | [⟦T9⟧](https://www.npmjs.com/package/@langchain/mistralai) | ![Downloads](https://img.shields.io/npm/dm/@langchain/mistralai) | ![NPM](https://img.shields.io/npm/v/@langchain/mistralai) |
| [MongoDB](/oss/javascript/integrations/vectorstores/mongodb_atlas) | [⟦T10⟧](https://www.npmjs.com/package/@langchain/mongodb) | ![Downloads](https://img.shields.io/npm/dm/@langchain/mongodb) | ![NPM](https://img.shields.io/npm/v/@langchain/mongodb) |
| [Neo4j](/oss/javascript/integrations/vectorstores/neo4jvector) | [⟦T11⟧](https://www.npmjs.com/package/@langchain/neo4j) | ![Downloads](https://img.shields.io/npm/dm/@langchain/neo4j) | ![NPM](https://img.shields.io/npm/v/@langchain/neo4j) |
| [Nomic](/oss/javascript/integrations/embeddings/nomic) | [⟦T12⟧](https://www.npmjs.com/package/@langchain/nomic) | ![Downloads](https://img.shields.io/npm/dm/@langchain/nomic) | ![NPM](https://img.shields.io/npm/v/@langchain/nomic) |
| [Ollama](/oss/javascript/integrations/chat/ollama) | [⟦T13⟧](https://www.npmjs.com/package/@langchain/ollama) | ![Downloads](https://img.shields.io/npm/dm/@langchain/ollama) | ![NPM](https://img.shields.io/npm/v/@langchain/ollama) |
| [OpenAI](/oss/javascript/integrations/providers/openai) | [⟦T14⟧](https://www.npmjs.com/package/@langchain/openai) | ![Downloads](https://img.shields.io/npm/dm/@langchain/openai) | ![NPM](https://img.shields.io/npm/v/@langchain/openai) |
| [OpenRouter](/oss/javascript/integrations/chat/openrouter) | [⟦T15⟧](https://www.npmjs.com/package/@langchain/openrouter) | ![Downloads](https://img.shields.io/npm/dm/@langchain/openrouter) | ![NPM](https://img.shields.io/npm/v/@langchain/openrouter) |
| [Perplexity](/oss/javascript/integrations/providers/perplexity) | [⟦T16⟧](https://www.npmjs.com/package/@langchain/perplexity) | ![Downloads](https://img.shields.io/npm/dm/@langchain/perplexity) | ![NPM](https://img.shields.io/npm/v/@langchain/perplexity) |
| [PGVector](/oss/javascript/integrations/vectorstores/pgvector) | [⟦T17⟧](https://www.npmjs.com/package/@langchain/pgvector) | ![Downloads](https://img.shields.io/npm/dm/@langchain/pgvector) | ![NPM](https://img.shields.io/npm/v/@langchain/pgvector) |
| [Pinecone](/oss/javascript/integrations/vectorstores/pinecone) | [⟦T18⟧](https://www.npmjs.com/package/@langchain/pinecone) | ![Downloads](https://img.shields.io/npm/dm/@langchain/pinecone) | ![NPM](https://img.shields.io/npm/v/@langchain/pinecone) |
| [Qdrant](/oss/javascript/integrations/vectorstores/qdrant) | [⟦T19⟧](https://www.npmjs.com/package/@langchain/qdrant) | ![Downloads](https://img.shields.io/npm/dm/@langchain/qdrant) | ![NPM](https://img.shields.io/npm/v/@langchain/qdrant) || [Redis](/oss/javascript/integrations/vectorstores/redis) | [⟦T20⟧](https://www.npmjs.com/package/@langchain/redis) | ![Downloads](https://img.shields.io/npm/dm/@langchain/redis) | ![NPM](https://img.shields.io/npm/v/@langchain/redis) |
| [SCX](https://scx.ai/) | [⟦T21⟧](https://www.npmjs.com/package/@scx-ai/langchain) | ![Downloads](https://img.shields.io/npm/dm/@scx-ai/langchain) | ![NPM](https://img.shields.io/npm/v/@scx-ai/langchain) |
| [Tavily](/oss/javascript/integrations/providers/tavily) | [⟦T22⟧](https://www.npmjs.com/package/@langchain/tavily) | ![Downloads](https://img.shields.io/npm/dm/@langchain/tavily) | ![NPM](https://img.shields.io/npm/v/@langchain/tavily) |
| [Together AI](/oss/javascript/integrations/chat/togetherai) | [⟦T23⟧](https://www.npmjs.com/package/@langchain/together-ai) | ![Downloads](https://img.shields.io/npm/dm/@langchain/together-ai) | ![NPM](https://img.shields.io/npm/v/@langchain/together-ai) |
| [turbopuffer](/oss/javascript/integrations/vectorstores/turbopuffer) | [⟦T24⟧](https://www.npmjs.com/package/@langchain/turbopuffer) | ![Downloads](https://img.shields.io/npm/dm/@langchain/turbopuffer) | ![NPM](https://img.shields.io/npm/v/@langchain/turbopuffer) |
| [Weaviate](/oss/javascript/integrations/vectorstores/weaviate) | [⟦T25⟧](https://www.npmjs.com/package/@langchain/weaviate) | ![Downloads](https://img.shields.io/npm/dm/@langchain/weaviate) | ![NPM](https://img.shields.io/npm/v/@langchain/weaviate) |
| [xAI](/oss/javascript/integrations/chat/xai) | [⟦T26⟧](https://www.npmjs.com/package/@langchain/xai) | ![Downloads](https://img.shields.io/npm/dm/@langchain/xai) | ![NPM](https://img.shields.io/npm/v/@langchain/xai) |
| [You.com](/oss/javascript/integrations/providers/youdotcom) | [⟦T27⟧](https://www.npmjs.com/package/@youdotcom-oss/langchain) | ![Downloads](https://img.shields.io/npm/dm/@youdotcom-oss/langchain) | ![NPM](https://img.shields.io/npm/v/@youdotcom-oss/langchain) |

## 所有提供商

请参阅 [all providers](/oss/javascript/integrations/providers/all_providers) 或使用搜索字段搜索提供商。

<Info>
  如果您想贡献集成，请参阅[Contributing integrations](/oss/javascript/contributing#add-a-new-integration)。
</Info>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/providers/overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>