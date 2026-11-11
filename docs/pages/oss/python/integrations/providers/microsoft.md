<!-- langchain-docs: Microsoft integrations | https://docs.langchain.com/oss/python/integrations/providers/microsoft -->

# Microsoft integrations

Integrate with Microsoft using LangChain Python.

Browse common LangChain Python integrations with [Microsoft Azure](https://portal.azure.com) and other [Microsoft](https://www.microsoft.com) products. For package selection, shared Azure setup, memory, vector stores, and hosted agents, see [Azure AI integrations](/oss/python/integrations/providers/azure_ai).

> [!TIP]
>
> **Recommended: Microsoft Foundry**
>
> For new LangChain or LangGraph applications centered on [Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/), start with [`langchain-azure-ai`](/oss/python/integrations/providers/azure_ai). It adds Foundry project endpoints, Azure credential integration, Agent Service, hosting, tools, Content Safety, retrieval, and Azure observability.
>
> For direct [Azure OpenAI v1 API](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/api-version-lifecycle?tabs=python) model access, code that switches between OpenAI and Azure, traditional Azure OpenAI API versions, completion LLMs, or a smaller dependency surface, use the `langchain-openai` package.

> [!NOTE]
>
> **Claude on Azure**
>
> Microsoft Foundry also offers access to all [Anthropic Claude models](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/use-foundry-models-claude), including Opus, Sonnet, and Haiku. Claude models are served through a dedicated Anthropic-native endpoint rather than the Azure OpenAI v1 API. Prefer `AzureAIAnthropicChatModel` from `langchain-azure-ai` for Foundry project endpoints and Microsoft Entra ID. You can also use [`ChatAnthropic`](/oss/python/integrations/chat/anthropic) from `langchain-anthropic` pointed at your Foundry Anthropic endpoint.

## Explore integrations

### Use models

> [card] [Microsoft Foundry chat models](/oss/python/integrations/chat/azure_ai)

> [card] [Azure OpenAI chat](/oss/python/integrations/chat/azure_chat_openai)

> [card] [Azure OpenAI LLMs](/oss/python/integrations/llms/azure_openai)

> [card] [Microsoft Foundry embeddings](/oss/python/integrations/providers/azure_ai#microsoft-foundry-embeddings)

> [card] [AzureOpenAIEmbeddings](/oss/python/integrations/embeddings/azure_openai)

### Persist history and cache responses

> [card] [Azure Cosmos DB chat message history](/oss/python/integrations/providers/azure_ai#azure-cosmos-db-chat-message-history)

> [card] [Azure Cosmos DB semantic cache](/oss/python/integrations/providers/azure_ai#azure-cosmos-db-semantic-cache)

### Load and retrieve data

> [card] [Azure Blob Storage](/oss/python/integrations/document_loaders/azure_blob_storage)

> [card] [Azure AI Search](/oss/python/integrations/vectorstores/azuresearch)

> [card] [Azure AI Search retriever](/oss/python/integrations/retrievers/azure_ai_search)

> [card] [Azure Cosmos DB for MongoDB vCore](/oss/python/integrations/vectorstores/azure_cosmos_db_mongo_vcore)

> [card] [Azure Cosmos DB NoSQL](/oss/python/integrations/vectorstores/azure_cosmos_db_no_sql)

> [card] [Azure Database for PostgreSQL](/oss/python/integrations/vectorstores/azure_db_for_postgresql)

> [card] [PGVector](/oss/python/integrations/vectorstores/pgvector)

> [card] [Azure SQL Database](/oss/python/integrations/providers/azure_ai#azure-sql-database)

### Use Deep Agents

> [card] [Azure Blob Storage Backend](/oss/python/integrations/providers/azure_ai#azure-blob-storage-backend)

### Build and deploy agents

> [card] [Microsoft Foundry middleware](/oss/python/integrations/middleware/azure_ai)

> [card] [Microsoft Foundry tools](/oss/python/integrations/tools/azure_ai)

> [card] [Microsoft Foundry service tools](/oss/python/integrations/tools/azure_ai_services)

> [card] [Azure Container Apps Dynamic Sessions](/oss/python/integrations/tools/azure_dynamic_sessions)

> [card] [Azure Logic Apps](/oss/python/integrations/tools/azure_logic_apps)

> [card] [Microsoft Foundry hosted agents](/oss/python/integrations/providers/azure_ai#microsoft-foundry-hosted-agents)

> [card] [Azure Durable Task Scheduler (LangGraph)](/oss/python/integrations/providers/azure_ai#durable-langgraph-execution-with-azure-durable-task-scheduler)

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/microsoft.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).