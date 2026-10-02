<!-- langchain-docs: LangChain Python integrations | https://docs.langchain.com/oss/python/integrations/providers/overview -->

# LangChain Python integrations

Integrate with providers using LangChain Python.

LangChain offers an extensive ecosystem with 1000+ integrations across chat & embedding models, tools & toolkits, document loaders, vector stores, and more.

A **provider** is a company or platform that hosts AI models and exposes them through an API (e.g., OpenAI, Anthropic, Google). Many providers have a dedicated `langchain-<provider>` package that implements one or more of LangChain's standard interfaces—chat models, embedding models, vector stores, and more—giving you a consistent API regardless of the underlying provider. Install the package, pick a model name, and swap providers without changing your code.

<Columns>
  <Card title="Chat models" icon="message" href="/oss/python/integrations/chat" />

  <Card title="Embedding models" icon="layers-difference" href="/oss/python/integrations/embeddings" />

  <Card title="Tools and toolkits" icon="tool" href="/oss/python/integrations/tools" />

  <Card title="Middleware" icon="arrows-shuffle" href="/oss/python/integrations/middleware" />

  <Card title="Checkpointers" icon="database" href="/oss/python/integrations/checkpointers" />

  <Card title="Sandboxes" icon="cube" href="/oss/python/integrations/sandboxes" />
</Columns>

To see a full list of integrations by component type, refer to the categories in the sidebar.

<Tip>
  For a conceptual overview of how providers and models work in LangChain, including how to find model names, use new models immediately, and work with routers—see [Providers and models](/oss/python/concepts/providers-and-models).
</Tip>

## Popular providers

| Provider | Package | Downloads | Latest version | <Tooltip>JS/TS support</Tooltip> |
| :- | :- | :- | :- | :- |
| [OpenAI](/oss/python/integrations/providers/openai/) | [`langchain-openai`](https://reference.langchain.com/python/langchain-openai) | <a href="https://pypi.org/project/langchain-openai/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-openai/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/openai) |
| [Google (Gemini Enterprise Agent Platform)](/oss/python/integrations/providers/google) | [`langchain-google-vertexai`](https://reference.langchain.com/python/langchain-google-vertexai) | <a href="https://pypi.org/project/langchain-google-vertexai/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-google-vertexai/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/google-vertexai) |
| [Anthropic (Claude)](/oss/python/integrations/providers/anthropic/) | [`langchain-anthropic`](https://reference.langchain.com/python/langchain-anthropic) | <a href="https://pypi.org/project/langchain-anthropic/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-anthropic/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/anthropic) |
| [Google (GenAI)](/oss/python/integrations/providers/google) | [`langchain-google-genai`](https://reference.langchain.com/python/langchain-google-genai) | <a href="https://pypi.org/project/langchain-google-genai/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-google-genai/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/google-genai) |
| [AWS](/oss/python/integrations/providers/aws/) | [`langchain-aws`](https://reference.langchain.com/python/langchain-aws) | <a href="https://pypi.org/project/langchain-aws/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-aws/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/aws) |
| [Ollama](/oss/python/integrations/providers/ollama/) | [`langchain-ollama`](https://reference.langchain.com/python/langchain-ollama) | <a href="https://pypi.org/project/langchain-ollama/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-ollama/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/ollama) |
| [Groq](/oss/python/integrations/providers/groq/) | [`langchain-groq`](https://reference.langchain.com/python/langchain-groq) | <a href="https://pypi.org/project/langchain-groq/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-groq/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/groq) |
| [Databricks](/oss/python/integrations/providers/databricks/) | [`databricks-langchain`](https://pypi.org/project/databricks-langchain/) | <a href="https://pypi.org/project/databricks-langchain/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/databricks-langchain/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Chroma](/oss/python/integrations/providers/chroma/) | [`langchain-chroma`](https://reference.langchain.com/python/langchain-chroma) | <a href="https://pypi.org/project/langchain-chroma/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-chroma/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Huggingface](/oss/python/integrations/providers/huggingface/) | [`langchain-huggingface`](https://reference.langchain.com/python/langchain-huggingface) | <a href="https://pypi.org/project/langchain-huggingface/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-huggingface/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/community) |
| [LiteLLM](/oss/python/integrations/providers/litellm/) | [`langchain-litellm`](https://reference.langchain.com/python/langchain-litellm) | <a href="https://pypi.org/project/langchain-litellm/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-litellm/"><img alt="PyPI - Latest version" /></a> | N/A |
| [Azure AI](/oss/python/integrations/providers/azure_ai) | [`langchain-azure-ai`](https://reference.langchain.com/python/langchain-azure-ai) | <a href="https://pypi.org/project/langchain-azure-ai/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-azure-ai/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/openai) |
| [Fireworks](/oss/python/integrations/providers/fireworks/) | [`langchain-fireworks`](https://reference.langchain.com/python/langchain-fireworks) | <a href="https://pypi.org/project/langchain-fireworks/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-fireworks/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/community) |
| [MistralAI](/oss/python/integrations/providers/mistralai/) | [`langchain-mistralai`](https://reference.langchain.com/python/langchain-mistralai) | <a href="https://pypi.org/project/langchain-mistralai/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-mistralai/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/mistralai) |
| [OpenRouter](/oss/python/integrations/providers/openrouter/) | [`langchain-openrouter`](https://reference.langchain.com/python/langchain-openrouter) | <a href="https://pypi.org/project/langchain-openrouter/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-openrouter/"><img alt="PyPI - Latest version" /></a> | ❌ |
| [MongoDB](/oss/python/integrations/providers/mongodb_atlas) | [`langchain-mongodb`](https://reference.langchain.com/python/langchain-mongodb) | <a href="https://pypi.org/project/langchain-mongodb/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-mongodb/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/mongodb) |
| [Cohere](/oss/python/integrations/providers/cohere/) | [`langchain-cohere`](https://reference.langchain.com/python/langchain-cohere) | <a href="https://pypi.org/project/langchain-cohere/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-cohere/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/cohere) |
| [Qdrant](/oss/python/integrations/providers/qdrant/) | [`langchain-qdrant`](https://reference.langchain.com/python/langchain-qdrant) | <a href="https://pypi.org/project/langchain-qdrant/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-qdrant/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/qdrant) |
| [Pinecone](/oss/python/integrations/providers/pinecone/) | [`langchain-pinecone`](https://reference.langchain.com/python/langchain-pinecone) | <a href="https://pypi.org/project/langchain-pinecone/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-pinecone/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/pinecone) |
| [xAI (Grok)](/oss/python/integrations/providers/xai/) | [`langchain-xai`](https://reference.langchain.com/python/langchain-xai) | <a href="https://pypi.org/project/langchain-xai/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-xai/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/xai) |
| [Nvidia AI Endpoints](/oss/python/integrations/providers/nvidia) | [`langchain-nvidia-ai-endpoints`](https://reference.langchain.com/python/langchain-nvidia-ai-endpoints) | <a href="https://pypi.org/project/langchain-nvidia-ai-endpoints/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-nvidia-ai-endpoints/"><img alt="PyPI - Latest version" /></a> | ❌ |
| [Tavily](/oss/python/integrations/providers/tavily/) | [`langchain-tavily`](https://reference.langchain.com/python/langchain-tavily) | <a href="https://pypi.org/project/langchain-tavily/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-tavily/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/tavily) |
| [DeepSeek](/oss/python/integrations/providers/deepseek/) | [`langchain-deepseek`](https://reference.langchain.com/python/langchain-deepseek) | <a href="https://pypi.org/project/langchain-deepseek/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-deepseek/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/deepseek) |
| [IBM](/oss/python/integrations/providers/ibm/) | [`langchain-ibm`](https://reference.langchain.com/python/langchain-ibm) | <a href="https://pypi.org/project/langchain-ibm/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-ibm/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/ibm) |
| [Milvus](/oss/python/integrations/providers/milvus/) | [`langchain-milvus`](https://reference.langchain.com/python/langchain-milvus) | <a href="https://pypi.org/project/langchain-milvus/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-milvus/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Perplexity](/oss/python/integrations/providers/perplexity/) | [`langchain-perplexity`](https://reference.langchain.com/python/langchain-perplexity) | <a href="https://pypi.org/project/langchain-perplexity/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-perplexity/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Elasticsearch](/oss/python/integrations/providers/elasticsearch/) | [`langchain-elasticsearch`](https://reference.langchain.com/python/langchain-elasticsearch) | <a href="https://pypi.org/project/langchain-elasticsearch/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-elasticsearch/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/community) |
| [DataStax Astra DB](/oss/python/integrations/providers/astradb/) | [`langchain-astradb`](https://reference.langchain.com/python/langchain-astradb) | <a href="https://pypi.org/project/langchain-astradb/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-astradb/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Together](/oss/python/integrations/providers/together/) | [`langchain-together`](https://reference.langchain.com/python/langchain-together) | <a href="https://pypi.org/project/langchain-together/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-together/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Redis](/oss/python/integrations/providers/redis/) | [`langchain-redis`](https://reference.langchain.com/python/langchain-redis) | <a href="https://pypi.org/project/langchain-redis/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-redis/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/redis) |
| [SAP HANA Cloud](/oss/python/integrations/providers/sap) | [`langchain-hana`](https://pypi.org/project/langchain-hana/) | <a href="https://pypi.org/project/langchain-hana/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-hana/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@sap/hana-langchain) |
| [MCP Toolbox (Google)](/oss/python/integrations/providers/toolbox/) | [`toolbox-langchain`](https://pypi.org/project/toolbox-langchain/) | <a href="https://pypi.org/project/toolbox-langchain/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/toolbox-langchain/"><img alt="PyPI - Latest version" /></a> | ❌ |
| [Google (Community)](/oss/python/integrations/providers/google) | [`langchain-google-community`](https://reference.langchain.com/python/langchain-google-community) | <a href="https://pypi.org/project/langchain-google-community/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-google-community/"><img alt="PyPI - Latest version" /></a> | ❌ |
| [Oracle AI Vector Search](/oss/python/integrations/providers/oracleai) | [`langchain-oracledb`](https://pypi.org/project/langchain-oracledb/) | <a href="https://pypi.org/project/langchain-oracledb/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-oracledb/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@oracle/langchain-oracledb) |
| [Weaviate](/oss/python/integrations/providers/weaviate/) | [`langchain-weaviate`](https://reference.langchain.com/python/langchain-weaviate) | <a href="https://pypi.org/project/langchain-weaviate/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-weaviate/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/weaviate) |
| [Exa](/oss/python/integrations/providers/exa_search) | [`langchain-exa`](https://reference.langchain.com/python/langchain-exa) | <a href="https://pypi.org/project/langchain-exa/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-exa/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/exa) |
| [Cerebras](/oss/python/integrations/providers/cerebras/) | [`langchain-cerebras`](https://reference.langchain.com/python/langchain-cerebras) | <a href="https://pypi.org/project/langchain-cerebras/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-cerebras/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/cerebras) |
| [Unstructured](/oss/python/integrations/providers/unstructured/) | [`langchain-unstructured`](https://reference.langchain.com/python/langchain-unstructured) | <a href="https://pypi.org/project/langchain-unstructured/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-unstructured/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Neo4J](/oss/python/integrations/providers/neo4j/) | [`langchain-neo4j`](https://reference.langchain.com/python/langchain-neo4j) | <a href="https://pypi.org/project/langchain-neo4j/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-neo4j/"><img alt="PyPI - Latest version" /></a> | [✅](https://www.npmjs.com/package/@langchain/community) |
| [Graph RAG](/oss/python/integrations/providers/graph_rag) | [`langchain-graph-retriever`](https://pypi.org/project/langchain-graph-retriever/) | <a href="https://pypi.org/project/langchain-graph-retriever/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-graph-retriever/"><img alt="PyPI - Latest version" /></a> | ❌ |
| [Oracle Cloud Infrastructure (OCI)](/oss/python/integrations/providers/oci/) | [`langchain-oci`](https://pypi.org/project/langchain-oci/) | <a href="https://pypi.org/project/langchain-oci/"><img alt="Downloads per month" /></a> | <a href="https://pypi.org/project/langchain-oci/"><img alt="PyPI - Latest version" /></a> | ❌ |

## All providers

[See all providers](/oss/python/integrations/providers/all_providers) or search for a provider using the search field.

<Info>
  If you'd like to contribute an integration, see the [contributing guide](/oss/python/contributing).
</Info>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/overview.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>